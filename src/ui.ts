import { BADGES, CARE, N_OPTIMAL, PREPS, R_MAX, SEASONS, W_OPTIMAL, WEATHER_EVENTS, type PrepId, type WeatherEventId } from './balance';
import { ANIMALS, animalById, HYPERION_M, MILESTONES, SHERMAN_M, stageFor, stageProgress, stagesFor } from './content';
import { CATEGORY_LABEL, CATEGORY_ORDER, unlockHint } from './data/animals';
import { FEATURE_LABEL, habitatDef } from './data/habitat';
import { SPECIES, STAGE_NAMES, speciesDef, speciesForSeason, stageSampleCm, type SpeciesId } from './data/species';
import type { SeasonId } from './balance';
import { daysBetween, formatShort, weekdayIndex } from './dates';
import { drawAnimal } from './draw-animals';
import { dayEvent, hkoWarningEvents, type Countdown } from './events';
import { ICONS, weatherArt, type IconName } from './icons';
import type { HkoWarning } from './hko';
import { carbonKg, hMultTier, seasonDef } from './rules';
import { actionLimit, advice, dayNumber, eventTitle } from './sim';
import type { DayCond, ForecastDay, GameState, LogEntry, LogKind, MetaState, TabId } from './types';
import { esc, formatHeight, percentOf } from './util';
import { dayLabel, weatherLabel, type WeatherProvider } from './weather';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export interface View {
  state: GameState;
  meta: MetaState;
  today: string;
  tab: TabId;
  place: string;
  placeNote: string;
  statusLine: string;
  cond: DayCond;
  forecast: ForecastDay[];
  night: boolean;
  todayEvents: WeatherEventId[];
  todayEvent: WeatherEventId;
  countdown: Countdown | null;
  manual: boolean;
  minutesToSettle: number;
  wx: WeatherView;
}

export interface WeatherView {
  provider: WeatherProvider;
  origin: 'live' | 'cache' | 'offline';
  loading: boolean;
  fetchedAt: number;
  updated: string;
  hkoUsed: boolean;
  warnings: HkoWarning[];
  messages: string[];
  situation: string;
  hkoDays: Record<string, string>;
  conditionText?: string;
  nowIcon?: number;
  station?: string;
  rainInHours: number | null;
  error?: string;
  overridden: boolean;
}

function icon(name: IconName): string {
  return ICONS[name];
}

const ev = (id: WeatherEventId) => WEATHER_EVENTS[id];

function hoursText(h: number): string {
  if (h <= 0) return '生效中';
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} 分鐘後`;
  return `約 ${Math.round(h)} 小時後`;
}

function hm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)} 小時 ${String(m % 60).padStart(2, '0')} 分`;
}

export function dyingLeftMs(state: GameState): number {
  return state.dying ? state.dying.at + 24 * 3600 * 1000 - Date.now() : 0;
}

function effectText(id: WeatherEventId): string {
  const d = ev(id);
  const parts = [d.damage ? `健康 −${d.damage}（抗風力可減免）` : '冇傷害'];
  if (d.dW) parts.push(`水分 ${d.dW > 0 ? '+' : ''}${d.dW}`);
  if (d.dR) parts.push(`抗風力 ${d.dR}`);
  return parts.join('・');
}

/** Top-left weather card, top-right place pill, status card, height rail and dock. */
export function renderChrome(view: View): void {
  const { state, cond } = view;
  const card = document.getElementById('weather-card');
  if (card) renderWeatherCard(card, view);
  const pill = document.getElementById('place-pill');
  if (pill) pill.innerHTML = `${icon('pin')}<span>${esc(view.place)}</span>${view.placeNote ? `<small>${esc(view.placeNote)}</small>` : ''}${icon('chevronDown')}`;
  const gear = document.getElementById('gear');
  if (gear && !gear.innerHTML) gear.innerHTML = icon('gear');
  const close = document.getElementById('drawer-close');
  if (close && !close.innerHTML) close.innerHTML = icon('close');

  const status = document.getElementById('status-card');
  if (status) {
    const season = seasonDef(state.season);
    const stage = stageFor(state.heightCm, season.targetCm);
    const drains = actionLimit(state, 'drain');
    status.innerHTML = `
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${icon('chevronRight')}</button>
      <p class="status-sub">${esc(state.treeName)} · ${esc(speciesDef(state.species).name)}${esc(stage.name)} · ${dayNumber(state, view.today) > season.days ? `賽季完成・加時第 ${dayNumber(state, view.today) - season.days} 日` : `第 ${dayNumber(state, view.today)}/${season.days} 日`}</p>
      <div class="bars">
        ${statBar('H', '健康', state.health, [50, 100], 'health', state.dying ? '瀕死' : '')}
        ${statBar('W', '水分', state.moisture, W_OPTIMAL, 'water')}
        ${statBar('N', '養分', state.nutrients, N_OPTIMAL, 'food')}
        ${statBar('R', '抗風', state.resist, [60, 100], 'shield')}
      </div>
      <div class="mini-acts">
        <button type="button" class="mini ${state.pest.active ? 'alert' : ''}" data-action="deworm" ${state.care.dewormed ? 'disabled' : ''}>${icon('bug')}<span>${state.care.dewormed ? '除過喇' : state.pest.active ? '有蟲！' : '除蟲'}</span></button>
        <button type="button" class="mini ${state.moisture > W_OPTIMAL[1] ? 'alert' : ''}" data-action="drain" ${drains.used >= drains.max ? 'disabled' : ''}>${icon('drain')}<span>${drains.used >= drains.max ? '疏過喇' : '疏水'}</span></button>
      </div>`;
  }

  const rail = document.getElementById('rail');
  if (rail) rail.innerHTML = railHtml(state);

  const dock = document.getElementById('dock');
  if (dock) {
    const rainBlocks = cond.raining;
    const water = actionLimit(state, 'water');
    const feed = actionLimit(state, 'fertilize');
    const cd = view.countdown;
    const prepShort = Boolean(cd && ev(cd.event).damage > 0 && state.resist < 60);
    const freshAnimals = state.animals.filter((id) => !state.seenAnimals.includes(id)).length;
    dock.innerHTML = `
      ${dockBtn('d-water', 'data-action="water"', 'drop', '澆水', rainBlocks ? '落緊雨' : `${water.used}/${water.max}`, water.used >= water.max || rainBlocks)}
      ${dockBtn('d-feed', 'data-action="fertilize"', 'sprout', '施肥', feed.used >= feed.max ? '施過喇' : '', feed.used >= feed.max)}
      ${dockBtn('d-guard', 'data-open="forecast"', 'shield', '加固', prepShort ? '惡劣天氣' : `R ${Math.round(state.resist)}`, false, prepShort ? '!' : '')}
      ${dockBtn('d-album', 'data-open="album"', 'book', '圖鑑', `${state.animals.length}/${ANIMALS.length}`, false, freshAnimals ? String(freshAnimals) : '')}`;
  }

  const slot = document.getElementById('note-slot');
  if (slot) {
    const dying = state.dying && !state.over
      ? `<article class="glass note-card dying"><p><b>瀕死・${esc(hm(Math.max(0, dyingLeftMs(state)) / 60000))}</b>將水分調到 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上即刻救返。</p></article>`
      : '';
    const note = state.started && state.morningNote ? `<article class="glass note-card"><p>${esc(state.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>` : '';
    const html = dying + note;
    if (slot.innerHTML !== html) slot.innerHTML = html;
  }
  document.body.classList.toggle('night', view.night);
  document.body.classList.toggle('thriving', state.health >= 80 && !state.over);
  document.body.classList.toggle('dying', Boolean(state.dying) && !state.over);
  document.getElementById('scene')?.setAttribute('aria-label', `${state.treeName}，${weatherLabel(cond.code)}，高 ${formatHeight(state.heightCm)}`);
  document.title = `${state.treeName} · 世界之樹`;
}

function renderWeatherCard(card: HTMLElement, view: View): void {
  const { state, cond, wx } = view;
  const simulated = wx.provider === 'sim' && !wx.overridden;
  const firstLoad = simulated && wx.loading;
  const cd = view.countdown;
  const hotNow = view.todayEvents.includes('hot');
  card.classList.toggle('severe', Boolean(cd) && !firstLoad);
  card.classList.toggle('hot', !cd && hotNow);
  card.classList.toggle('sim', simulated && !wx.loading);
  if (simulated) {
    delete card.dataset.open;
    card.dataset.action = 'retry-weather';
    card.setAttribute('aria-label', '模擬天氣，撳一下再試攞真實天氣');
  } else {
    delete card.dataset.action;
    card.dataset.open = 'forecast';
    card.setAttribute('aria-label', '天氣同預報');
  }
  const label = view.manual ? ev(view.todayEvent).label : cd?.active ? ev(cd.event).label : wx.conditionText || weatherLabel(cond.code);
  let line: string;
  if (cd) {
    line = `<span class="warn-line">${icon('warn')}${esc(ev(cd.event).label)} · ${hoursText(cd.hours)} · 抗風力 ${Math.round(state.resist)}</span>`;
  } else if (wx.rainInHours !== null && !cond.raining && !simulated && !view.manual) {
    line = wx.rainInHours <= 1 ? '一個鐘內可能落雨' : `大約 ${wx.rainInHours} 個鐘後可能落雨`;
  } else {
    line = `今日：${esc(ev(view.todayEvent).label)} · 今晚結算 ${esc(hm(view.minutesToSettle))}後`;
  }
  const chips = wx.warnings
    .slice(0, 4)
    .map((w) => `<span class="wchip ${w.tone}" title="${esc(w.name)}">${warnIcon(w)}<span>${esc(w.short)}</span></span>`)
    .join('');
  const source = sourceLabel(wx);
  const temp = firstLoad ? '--' : `${Math.round(cond.tempC)}°C`;
  card.innerHTML = `
    <span class="wx-art">${weatherArt(cond.code, view.night, Boolean(cond.stormKind), cond.stormKind || view.manual ? undefined : wx.nowIcon)}</span>
    <span class="wx-main"><b>${temp}</b><span>${esc(firstLoad ? '攞緊天氣…' : label)}</span></span>
    <span class="wx-place">${icon('pin')}${esc(view.place)}${wx.station && !simulated && !view.manual ? `<small>· ${esc(wx.station)}站</small>` : ''}</span>
    ${chips && !view.manual ? `<span class="wx-warns">${chips}</span>` : ''}
    ${line ? `<span class="wx-line">${line}</span>` : ''}
    <span class="wx-src ${simulated ? 'sim' : ''}">${source}</span>`;
}

function sourceLabel(wx: WeatherView): string {
  if (wx.overridden) return '手動天氣（開發者）';
  if (wx.provider === 'sim') {
    if (wx.loading) return '攞緊真實天氣…';
    return `模擬天氣・撳一下重試${wx.hkoUsed ? '（天文台警告係真嘅）' : ''}`;
  }
  const names = wx.provider === 'hko' ? '天文台' : wx.hkoUsed ? 'Open-Meteo／天文台' : 'Open-Meteo';
  if (wx.origin === 'cache') return `上次天氣 ${esc(wx.updated)}・${names}`;
  return `即時天氣・${names}${wx.updated ? ` · ${esc(wx.updated)}` : ''}${wx.loading ? ' · 更新緊' : ''}`;
}

/** Small badge in the spirit of HKO's warning icons (drawn locally, not the official artwork). */
export function warnIcon(w: HkoWarning): string {
  if (w.group === 'WTCSGNL') {
    const n = w.code.replace(/^TC(\d+).*/, '$1');
    return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l8.5 16H1.5z" fill="currentColor"/><text x="10" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${esc(n)}</text></svg>`;
  }
  if (w.group === 'WRAIN') return '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="3" fill="currentColor"/><path d="M7 6l-1.5 3M11 6l-1.5 3M15 6l-1.5 3M8 11l-1.5 3M12 11l-1.5 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
  if (w.group === 'WHOT') return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 4.5v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="2.3" fill="#fff"/></svg>';
  if (w.group === 'WFIRE') return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5c1 3.5 5.5 5.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 1.5-4 2.5-5 .2 1.7 1 2.6 2 3-.5-3 .3-5.8 1-8z" fill="currentColor"/></svg>';
  if (w.group === 'WTS') return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 1.5L4 11h5l-1.5 7.5L16 8h-5z" fill="currentColor"/></svg>';
  return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 5.5v5.5M10 13.8v.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
}

function statBar(key: string, label: string, value: number, band: readonly [number, number], tone: string, flag = ''): string {
  const v = Math.round(Math.max(0, Math.min(100, value)));
  const ok = v >= band[0] && v <= band[1];
  return `<div class="bar ${tone} ${ok ? 'ok' : 'off'}" title="${label} 最佳 ${band[0]}–${band[1]}">
    <span class="bar-key">${key}</span><span class="bar-label">${label}</span>
    <span class="bar-track"><span class="bar-band" style="left:${band[0]}%;width:${band[1] - band[0]}%"></span><span class="bar-fill" style="width:${v}%"></span></span>
    <b class="bar-val">${flag ? esc(flag) : v}</b>
  </div>`;
}

function dockBtn(tone: string, attr: string, ic: IconName, label: string, sub: string, disabled: boolean, badge = ''): string {
  return `<button type="button" class="dock-btn ${tone} ${disabled ? 'done' : ''}" ${attr} ${disabled ? 'aria-disabled="true"' : ''}>
    <span class="dock-ic">${icon(ic)}</span><span class="dock-label">${label}</span>${sub ? `<small>${esc(sub)}</small>` : ''}${badge ? `<em class="badge">${esc(badge)}</em>` : ''}
  </button>`;
}

/* ---------- Growth log bottom sheet ---------- */

const KIND_META: Record<LogKind, { icon: IconName; tone: string; title: string }> = {
  plant: { icon: 'sprout', tone: 'green', title: '種低幼苗' },
  water: { icon: 'drop', tone: 'blue', title: '已澆水' },
  fertilize: { icon: 'leaf', tone: 'green', title: '已施肥' },
  deworm: { icon: 'bug', tone: 'orange', title: '已除蟲' },
  drain: { icon: 'drain', tone: 'blue', title: '已疏水' },
  reinforce: { icon: 'shield', tone: 'orange', title: '已加固' },
  animal: { icon: 'bird', tone: 'purple', title: '新朋友來訪' },
  stage: { icon: 'arrowUp', tone: 'blue', title: '進入新階段' },
  settle: { icon: 'calendar', tone: 'blue', title: '夜間結算' },
  'storm-safe': { icon: 'shield', tone: 'green', title: '捱過惡劣天氣' },
  'storm-hit': { icon: 'warn', tone: 'red', title: '天氣受損' },
  pest: { icon: 'bug', tone: 'red', title: '蟲害' },
  dying: { icon: 'heart', tone: 'red', title: '瀕死' },
  badge: { icon: 'sparkle', tone: 'purple', title: '徽章' },
  event: { icon: 'sparkle', tone: 'yellow', title: '今日小事' },
  grow: { icon: 'sprout', tone: 'blue', title: '靜靜長高' },
};

let sheetKey = '';

export function renderSheet(state: GameState, today: string): void {
  const body = document.getElementById('sheet-body');
  const title = document.getElementById('sheet-title');
  if (!body) return;
  const key = `${today}|${state.log.length}|${state.log[0]?.text ?? ''}|${state.log[0]?.time ?? ''}`;
  if (title) {
    const todays = state.log.filter((e) => e.date === today).length;
    title.innerHTML = `成長日誌${todays ? `<small>今日 ${todays} 則</small>` : ''}`;
  }
  if (key === sheetKey) return;
  sheetKey = key;
  if (!state.log.length) {
    body.innerHTML = '<p class="empty">仲未有紀錄。澆水、施肥或者等動物來訪，都會寫低喺度。</p>';
    return;
  }
  let lastDate = '';
  const parts: string[] = [];
  for (const entry of state.log) {
    if (entry.date !== lastDate) {
      if (lastDate) parts.push('</ol>');
      lastDate = entry.date;
      const diff = daysBetween(entry.date, today);
      const label = diff === 0 ? '今日' : diff === 1 ? '昨日' : `${formatShort(entry.date)}（${WEEK[weekdayIndex(entry.date)] ?? ''}）`;
      parts.push(`<h4 class="log-day">${esc(label)}</h4><ol class="log-list">`);
    }
    parts.push(logRow(entry));
  }
  parts.push('</ol>');
  body.innerHTML = parts.join('');
}

function logRow(entry: LogEntry): string {
  const meta = entry.kind ? KIND_META[entry.kind] : { icon: 'calendar' as IconName, tone: 'gray', title: '紀錄' };
  const title = entry.title || meta.title;
  const time = entry.time || '夜裡';
  const chip = entry.reward ? `<span class="chip ${entry.reward.tone}">${esc(entry.reward.text)}</span>` : '';
  return `<li class="log-row">
    <time>${esc(time)}</time>
    <span class="log-ic ${meta.tone}">${icon(meta.icon)}</span>
    <span class="log-copy"><b>${esc(title)}</b><span>${esc(entry.text)}</span></span>
    ${chip}
  </li>`;
}

/* ---------- Drawer panel ---------- */

export function renderPanel(view: View): void {
  const panel = document.getElementById('panel');
  if (!panel) return;
  const scroll = panel.scrollTop;
  panel.innerHTML = `${tabs(view.tab)}<div class="panel-body">${body(view)}</div>`;
  panel.scrollTop = scroll;
  paintThumbs();
}

function tabs(active: TabId): string {
  const items: [TabId, string][] = [
    ['care', '照顧'],
    ['forecast', '天氣·加固'],
    ['album', '圖鑑'],
    ['milestones', '賽季'],
  ];
  return `<nav class="tabs" role="tablist">${items
    .map(
      ([id, label]) =>
        `<button type="button" role="tab" data-tab="${id}" class="${id === active ? 'on' : ''}" aria-selected="${id === active}">${label}</button>`,
    )
    .join('')}</nav>`;
}

function body(view: View): string {
  if (!view.state.started) return `<div class="card quiet"><p>先揀賽季同替棵樹起個名。</p></div>`;
  switch (view.tab) {
    case 'forecast':
      return forecastTab(view);
    case 'album':
      return albumTab(view);
    case 'milestones':
      return seasonTab(view);
    default:
      return careTab(view);
  }
}

function careTab(view: View): string {
  const { state, cond } = view;
  const event = eventTitle(state);
  const today = ev(view.todayEvent);
  const multi = view.todayEvents.filter((e) => e !== 'clear');
  const water = actionLimit(state, 'water');
  const drain = actionLimit(state, 'drain');
  const feed = actionLimit(state, 'fertilize');
  const s = state.lastSettlement;
  const tier = hMultTier(state.health);
  return `
    <article class="card event-card ${today.severe ? 'warn' : ''}">
      <p class="eyebrow">今日天氣事件${view.manual ? '（手動）' : ''}</p>
      <h2>${esc(today.label)}</h2>
      <p>${esc(effectText(view.todayEvent))}。${esc(today.tip)}</p>
      ${multi.length > 1 ? `<p class="fine">同時有${multi.map((e) => esc(ev(e).label)).join('、')}：唔會疊加，只計最重嘅${esc(today.label)}。</p>` : ''}
      <p class="fine">今晚結算：${esc(hm(view.minutesToSettle))}後</p>
    </article>
    <div class="meters">
      ${meter('健康 H', state.health, 'health', [50, 100])}
      ${meter('水分 W', state.moisture, 'water', W_OPTIMAL)}
      ${meter('養分 N', state.nutrients, 'food', N_OPTIMAL)}
      ${meter('抗風力 R', state.resist, 'shield', [60, 100])}
    </div>
    <p class="fine">最佳：水分 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}，養分 ${N_OPTIMAL[0]}–100。而家${esc(tier.label)}（×${tier.mult}）${state.health >= 80 ? '，有綠光' : ''}。${state.pest.active ? '<b class="bad">有蟲害：每晚 −15 健康。</b>' : ''}</p>
    <p class="advice">${esc(advice(state, view.todayEvent, view.countdown))}</p>
    <div class="actions">
      ${actionBtn('water', 'drop', 'blue', '澆水', cond.raining ? '落緊雨' : `+${CARE.water.amount} 水分 · ${water.used}/${water.max}`, water.used >= water.max || cond.raining)}
      ${actionBtn('fertilize', 'sprout', 'green', '施肥', `+${CARE.fertilize.amount} 養分 · ${feed.used}/${feed.max}`, feed.used >= feed.max)}
      ${actionBtn('deworm', 'bug', 'orange', '除蟲', state.care.dewormed ? '用過喇' : state.pest.active ? '有蟲！' : '預防', state.care.dewormed)}
      ${actionBtn('drain', 'drain', 'purple', '疏水', `${CARE.drain.amount} 水分 · ${drain.used}/${drain.max}`, drain.used >= drain.max)}
    </div>
    ${s ? settlementCard(s) : ''}
    <article class="card event">
      <p class="eyebrow">今日小事</p>
      <h2>${esc(event.title)}</h2>
      <p>${esc(event.text)}</p>
    </article>
    <p class="fine">碳吸收量：約 ${carbonKg(state.heightCm)} 公斤 CO₂／年（0.35 × 高度^1.5）。用心照顧過 ${state.daysCared} 日。進度只係留喺呢部機。</p>
  `;
}

export function settlementCard(s: NonNullable<GameState['lastSettlement']>): string {
  return `<article class="card settle">
      <p class="eyebrow">上次夜間結算 · ${esc(formatShort(s.date))}</p>
      <h2>${esc(ev(s.event).label)}：健康 ${Math.round(s.hBefore)} → ${Math.round(s.hAfter)}</h2>
      <ul class="breakdown">
        <li><span>水分因素</span><b>${s.wFactor > 0 ? '+' : ''}${s.wFactor}</b><small>W ${Math.round(s.wBefore)}→${Math.round(s.wAfter)}</small></li>
        <li><span>養分因素</span><b>${s.nFactor > 0 ? '+' : ''}${s.nFactor}</b><small>N ${Math.round(s.nBefore)}→${Math.round(s.nAfter)}</small></li>
        <li><span>天氣損傷</span><b>−${s.finalDamage}</b><small>基礎 ${s.baseDamage} × (1 − ${Math.round(s.rBefore)}/100)</small></li>
        ${s.pestDamage ? `<li><span>蟲害</span><b>−${s.pestDamage}</b><small></small></li>` : ''}
        <li><span>生長</span><b>${s.deltaG >= 0 ? '+' : ''}${s.deltaG} 厘米</b><small>${s.baseGrowth} × ${s.hMult} × ${s.weatherBonus}</small></li>
      </ul>
      ${s.notes.length ? `<p class="fine">${s.notes.map(esc).join('；')}</p>` : ''}
    </article>`;
}

function actionBtn(action: string, ic: IconName, tone: string, label: string, sub: string, disabled: boolean): string {
  return `<button type="button" class="act ${tone} ${disabled ? 'done' : ''}" data-action="${action}" ${disabled ? 'disabled' : ''}>
    <span class="act-ic">${icon(ic)}</span><span>${label}</span><small>${esc(sub)}</small>
  </button>`;
}

function meter(label: string, value: number, kind: string, band: readonly [number, number]): string {
  const shown = Math.round(Math.max(0, Math.min(100, value)));
  const ok = shown >= band[0] && shown <= band[1];
  return `<div class="meter ${ok ? 'ok' : 'off'}">
    <div class="meter-top"><span>${label}</span><span>${shown}</span></div>
    <div class="track"><div class="band" style="left:${band[0]}%;width:${band[1] - band[0]}%"></div><div class="fill ${kind}" style="width:${shown}%"></div></div>
  </div>`;
}

function forecastTab(view: View): string {
  const { state } = view;
  const cd = view.countdown;
  const alert = cd
    ? `<article class="card warn countdown">
        <p class="eyebrow">${icon('warn')}12 小時惡劣天氣預警</p>
        <h2>${esc(ev(cd.event).label)} · ${esc(hoursText(cd.hours))}</h2>
        <p>${esc(effectText(cd.event))}。${esc(ev(cd.event).tip)}</p>
        <p class="fine">來源：${esc(cd.source)}。以而家抗風力 ${Math.round(state.resist)} 計，傷害會係 ${Math.round(ev(cd.event).damage * (1 - state.resist / 100))}。</p>
      </article>`
    : `<article class="card"><p class="eyebrow">12 小時預警</p><p>未來 12 小時未見惡劣天氣。</p></article>`;
  const preps = (Object.keys(PREPS) as PrepId[])
    .map((k) => `<button type="button" class="prep ${state.care.preps[k] ? 'on' : ''}" data-prep="${k}" aria-pressed="${state.care.preps[k]}"><span>${PREPS[k].label}</span><small>${state.care.preps[k] ? '今日做過' : `+${PREPS[k].amount} 抗風力`}</small></button>`)
    .join('');
  const shield = `<article class="card">
      <p class="eyebrow">加固・抗風力 R</p>
      <h2>${Math.round(state.resist)} / ${R_MAX}</h2>
      <div class="track fat"><div class="fill shield" style="width:${Math.round(state.resist)}%"></div></div>
      <p>最終天氣損傷 = 基礎傷害 × (1 − R/100)。狂風雷暴會消耗 30、初級颱風 40、高級颱風 80；每晚繩索鬆少少（−2）。每樣加固每日做一次。</p>
      <div class="preps">${preps}</div>
    </article>`;
  const rows = view.forecast
    .map((day) => {
      const e = day.date === view.today ? view.todayEvent : dayEvent(day);
      const d = ev(e);
      const tag = e !== 'clear' ? `<span class="tag ${d.damage >= 30 ? 'typhoon' : d.severe ? 'rain' : 'wind'}">${esc(d.label)}</span>` : '';
      const today = day.date === view.today ? ' today' : '';
      return `<article class="day ${d.damage >= 30 ? 'danger' : d.severe ? 'warn' : ''}${today}">
        <span class="day-art">${weatherArt(day.code, false, d.damage >= 30, day.hkoIcon)}</span>
        <div><strong>${day.date === view.today ? '今日' : `星期${WEEK[weekdayIndex(day.date)] ?? ''}`}</strong><span>${esc(formatShort(day.date))}</span></div>
        <div><b>${esc(dayLabel(day))}</b><span>${Math.round(day.tempMin)}–${Math.round(day.tempMax)}° · 雨 ${Math.round(day.precipMm)} 毫米 · 陣風 ${Math.round(day.gustKmh)}</span></div>
        <div class="tags">${tag}</div>
        ${view.wx.hkoDays[day.date] ? `<p class="hko-day">天文台：${esc(view.wx.hkoDays[day.date]!)}</p>` : ''}
      </article>`;
    })
    .join('');
  const wx = view.wx;
  const hkoCard = wx.hkoUsed
    ? `<article class="card hko">
        <p class="eyebrow">香港天文台</p>
        ${
          wx.warnings.length
            ? `<ul class="hko-warns">${wx.warnings
                .map((w) => {
                  const game = hkoWarningEvents([w])[0];
                  return `<li class="${w.tone}">${warnIcon(w)}<span><b>${esc(w.name)}</b>${game ? `<small>遊戲當：${esc(ev(game).label)}</small>` : ''}</span></li>`;
                })
                .join('')}</ul>`
            : '<p>而家冇天氣警告生效。</p>'
        }
        ${wx.messages.length ? `<p class="fine">${wx.messages.map(esc).join('<br>')}</p>` : ''}
        ${wx.situation ? `<p class="fine">${esc(wx.situation)}</p>` : ''}
      </article>`
    : '';
  const table = (Object.values(WEATHER_EVENTS))
    .map((d) => `<tr><td>${esc(d.label)}</td><td>${d.damage ? `−${d.damage}` : '0'}</td><td>${esc([d.dW ? `W ${d.dW > 0 ? '+' : ''}${d.dW}` : '', d.dR ? `R ${d.dR}` : ''].filter(Boolean).join(' ') || '—')}</td></tr>`)
    .join('');
  return `
    ${alert}
    ${shield}
    ${hkoCard}
    <p class="status">${esc(view.statusLine)}${wx.provider === 'sim' && !wx.overridden ? ' <button type="button" class="linkish" data-action="retry-weather">再試</button>' : ''}</p>
    <div class="days">${rows}</div>
    <h3 class="sub">天氣事件表</h3>
    <table class="evtable"><thead><tr><th>事件</th><th>健康</th><th>副作用</th></tr></thead><tbody>${table}</tbody></table>
    <p class="fine">香港：酷熱天氣警告 → 酷熱；黃／紅雨 → 暴雨；黑雨 → 黑雨；雷暴警告或強烈季候風 → 狂風雷暴；一號／三號風球 → 初級颱風；八號或以上 → 高級颱風。其他地方按 Open-Meteo 天氣碼、陣風同雨量判斷。同一日幾個警告唔會疊加，只計基礎傷害最高嗰個。</p>
    <button type="button" class="texty" data-action="locate">用我所在位置更新天氣</button>
  `;
}

let albumMode: 'animals' | 'species' = 'animals';
export function setAlbumMode(mode: 'animals' | 'species'): void {
  albumMode = mode;
}

function albumTab(view: View): string {
  const toggle = `<div class="seg album-seg"><button type="button" class="${albumMode === 'animals' ? 'on' : ''}" data-album-mode="animals">動物 ${view.state.animals.length}/${ANIMALS.length}</button><button type="button" class="${albumMode === 'species' ? 'on' : ''}" data-album-mode="species">樹種 ${SPECIES.length}</button></div>`;
  return toggle + (albumMode === 'species' ? speciesAlbum(view) : animalAlbum(view));
}

function animalAlbum(view: View): string {
  const unlocked = view.state.animals.length;
  const groups = CATEGORY_ORDER.map((cat) => {
    const list = ANIMALS.filter((a) => a.category === cat);
    const have = list.filter((a) => view.state.animals.includes(a.id)).length;
    const cards = list.map((animal) => {
      const got = view.state.animals.includes(animal.id);
      const fresh = got && !view.state.seenAnimals.includes(animal.id);
      const resident = view.state.residents.includes(animal.id);
      return `<button type="button" class="creature ${got ? '' : 'locked'}" data-seen="${animal.id}">
      <span class="thumb" data-animal="${animal.id}" data-locked="${got ? '0' : '1'}"></span>
      <strong>${got ? esc(animal.name) : '？？？'}${fresh ? '<em>新</em>' : ''}${resident ? '<em class="res">長駐</em>' : ''}</strong>
      <span class="chip cat-${cat}">${esc(CATEGORY_LABEL[cat])}${animal.group[1] > 1 ? `・成群 ${animal.group[0]}–${animal.group[1]}` : ''}</span>
      <span>${got ? esc(animal.epithet) : esc(unlockHint(animal))}</span>
      <small>${got ? esc(animal.about) : `解鎖：${esc(unlockHint(animal))}`}</small>
    </button>`;
    }).join('');
    return `<h3 class="sub">${esc(CATEGORY_LABEL[cat])} <small>${have}/${list.length}</small></h3><div class="album">${cards}</div>`;
  }).join('');
  const res = view.state.residents.length;
  return `<p class="status">圖鑑 ${unlocked} / ${ANIMALS.length} · 長駐 ${res}</p>
    <p class="advice">見過嘅動物會輪流返嚟探棵樹（雀鳥成群飛過、猴子成群落地）。健康度連續 3 晚 90 以上，已見過嘅動物會長駐：每隻每晚 +2 養分（最多 +6）；兩隻或以上仲會幫手防蟲。健康跌穿 70 佢哋會搬走。</p>
    ${groups}`;
}

function speciesAlbum(view: View): string {
  const cards = SPECIES.map((sp) => {
    const season = seasonDef(sp.season);
    const mine = sp.id === view.state.species;
    const stages = sp.stages.map((txt, i) => `<li><b>${STAGE_NAMES[i]}</b>${esc(txt)}</li>`).join('');
    return `<article class="card species-card ${mine ? 'mine' : ''}">
      <div class="species-head">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, season.targetCm)}"></span>
        <div><p class="eyebrow">${esc(season.label)}・目標 ${season.targetCm / 100} 米${mine ? '・你棵樹' : ''}</p>
        <h2>${esc(sp.name)}</h2>
        <p class="sci">${esc(sp.english)} · <i>${esc(sp.scientific)}</i></p>
        <p class="fine">一般 ${esc(sp.typicalM)} 米・最高紀錄 ${sp.maxM} 米</p></div>
      </div>
      <p>${esc(sp.blurb)}</p>
      <p class="fine">${esc(sp.record)}。資料：<a href="${esc(sp.source.url)}" target="_blank" rel="noopener">${esc(sp.source.label)}</a></p>
      <ol class="stage-list">${stages}</ol>
      ${habitatBlock(sp.id)}
    </article>`;
  }).join('');
  return `<p class="status">九個樹種，每個賽季三款，真實成樹高度對應賽季目標。</p>${cards}`;
}

/** 原生地：the island scenery that grows with each stage for this species. */
function habitatBlock(id: SpeciesId): string {
  const h = habitatDef(id);
  const rows = h.adds
    .map((feats, i) => (feats.length ? `<li><b>${STAGE_NAMES[i]}</b>${feats.map((f) => esc(FEATURE_LABEL[f])).join('、')}</li>` : ''))
    .filter(Boolean)
    .join('');
  return `<div class="habitat"><p class="eyebrow">原生地・${esc(h.name)}</p><p class="fine">${esc(h.blurb)}</p><ol class="stage-list">${rows}</ol></div>`;
}

function seasonTab(view: View): string {
  const { state, meta } = view;
  const season = seasonDef(state.season);
  const dayN = dayNumber(state, view.today);
  const day = Math.min(season.days, dayN);
  const extra = dayN > season.days ? dayN - season.days : 0;
  const pct = Math.min(100, (state.heightCm / season.targetCm) * 100);
  const beyond = state.heightCm >= season.targetCm;
  const meters = state.heightCm / 100;
  const next = MILESTONES.find((m) => meters < m.meters);
  const badges = ([1, 2, 3] as const)
    .map((t) => {
      const n = meta.badges[String(t) as '1' | '2' | '3'];
      return `<li class="${n ? 'done' : ''}"><strong>${esc(BADGES[t].name)}${n > 1 ? ` ×${n}` : ''}</strong><span>${n ? '已擁有' : `完成 ${[0, 3, 6, 12][t]} 個月賽季解鎖`}</span><p>${esc(BADGES[t].perk)}</p></li>`;
    })
    .join('');
  const rows = MILESTONES.map((m) => {
    const done = meters >= m.meters;
    return `<li class="${done ? 'done' : ''}"><strong>${esc(m.title)}</strong><span>${m.meters >= 1 ? `${m.meters} 米` : `${Math.round(m.meters * 100)} 厘米`}</span><p>${esc(m.detail)}</p></li>`;
  }).join('');
  return `
    <article class="card">
      <p class="eyebrow">${esc(season.label)}</p>
      <h2>${extra ? `賽季完成・加時第 ${extra} 日` : `第 ${day} / ${season.days} 日`} · ${esc(formatHeight(state.heightCm))}</h2>
      <p>${beyond ? `已突破目標（${season.targetCm / 100} 米，達成 ${Math.round((state.heightCm / season.targetCm) * 100)}%）。目標只係里程碑，冇高度上限。` : `目標 ${season.targetCm / 100} 米（只係目標，唔係上限）。`}每日基本生長 ${(season.targetCm / season.days).toFixed(1)} 厘米 × 健康係數 × 天氣加成${extra ? '，賽季完咗都照樣計' : ''}。</p>
      <div class="track fat"><div class="fill food" style="width:${pct.toFixed(1)}%"></div></div>
      <p class="fine">碳吸收量約 ${carbonKg(state.heightCm)} 公斤 CO₂／年。將軍樹 ${SHERMAN_M} 米（而家 ${esc(percentOf(meters, SHERMAN_M))}%），海波龍 ${HYPERION_M} 米。${next ? `下一個里程：${esc(next.title)}（${next.meters} 米）。` : ''}</p>
    </article>
    <h3 class="sub">徽章</h3>
    <ol class="miles">${badges}</ol>
    <p class="fine">中途枯死都唔蝕：捱過 3 個月會發一級、6 個月發二級徽章。免死金牌 ${meta.reviveTokens} 面${meta.starry ? '・已解鎖星空浮島' : ''}。${meta.landmark ? `養分地標：${esc(meta.landmark.name)}（${esc(formatHeight(meta.landmark.heightCm))}）。` : ''}</p>
    <h3 class="sub">里程</h3>
    <ol class="miles">${rows}</ol>
    <button type="button" class="texty" data-action="rename">改棵樹的名</button>
  `;
}

type Thumbnailer = (id: string, unlocked: boolean) => string | null;
type SpeciesThumbnailer = (species: SpeciesId, stage: number, heightCm: number) => string | null;
let thumbnailer: Thumbnailer | null = null;
let speciesThumbnailer: SpeciesThumbnailer | null = null;

export function setThumbnailer(fn: Thumbnailer | null, species?: SpeciesThumbnailer | null): void {
  thumbnailer = fn;
  speciesThumbnailer = species ?? null;
}

let paintToken = 0;
/** Fill thumbnails a few at a time so opening the encyclopedia (65 animals) never stalls a phone. */
export function paintThumbs(): void {
  const token = ++paintToken;
  const jobs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('.sthumb[data-species-thumb]').forEach((el) => {
    if (el.firstChild) return;
    jobs.push(() => {
      const [id, stage] = (el.dataset.speciesThumb ?? '').split(':');
      const url = speciesThumbnailer?.(id as SpeciesId, Number(stage), Number(el.dataset.cm));
      if (url) el.innerHTML = `<img src="${url}" alt="" width="120" height="120" />`;
      else el.textContent = '🌳';
    });
  });
  document.querySelectorAll<HTMLElement>('.thumb[data-animal]').forEach((el) => {
    if (el.firstChild) return;
    jobs.push(() => {
      const id = el.dataset.animal;
      if (!id) return;
      const unlocked = el.dataset.locked !== '1';
      const url = thumbnailer?.(id, unlocked);
      if (url) {
        el.innerHTML = `<img src="${url}" alt="" width="96" height="96" />`;
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 84;
      el.replaceChildren(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) drawAnimal(ctx, id, 60, 48, 1200, { scale: 1.35, silhouette: !unlocked, night: id === 'owl' || id === 'firefly' });
    });
  });
  const step = () => {
    if (token !== paintToken) return;
    const t0 = performance.now();
    while (jobs.length && performance.now() - t0 < 12) jobs.shift()!();
    if (jobs.length) window.setTimeout(step, 16);
  };
  step();
}

/* ---------- Toast, modals ---------- */

let toastTimer = 0;

export function toast(message: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 3600);
}

export function openModal(inner: string): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.innerHTML = `<div class="modal-card glass" role="dialog" aria-modal="true">${inner}</div>`;
  modal.hidden = false;
  paintThumbs();
  const field = modal.querySelector('input');
  if (field instanceof HTMLInputElement) {
    field.focus();
    field.select();
  } else {
    modal.querySelector('button')?.focus();
  }
}

/** Re-render the open modal without moving focus (season / species picker). */
export function updateModal(inner: string): void {
  const card = document.querySelector('#modal .modal-card');
  if (!card) return openModal(inner);
  card.innerHTML = inner;
  paintThumbs();
}

export function closeModal(): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.hidden = true;
  modal.innerHTML = '';
}

export interface Pick {
  season: SeasonId;
  species: SpeciesId;
}

export function startModal(current: string, meta: MetaState, rename: boolean, pick?: Pick): string {
  if (rename) {
    return `
      <p class="eyebrow">世界之樹</p>
      <h2>改個名</h2>
      <label>樹的名字<input id="tree-name" maxlength="12" value="${esc(current)}" autocomplete="off" /></label>
      <button type="button" class="primary" data-action="save-name">保存</button>
      <button type="button" class="texty" data-action="close-modal">取消</button>`;
  }
  const sel: Pick = pick ?? { season: 's3', species: speciesForSeason('s3')[0]!.id };
  const legacy = meta.pendingLegacy && meta.landmark ? `<p class="legacy">${esc(meta.landmark.name)}留低嘅養分地標會令新樹開局養分 +40。</p>` : '';
  const seasons = SEASONS.map(
    (s) => `<button type="button" class="season ${s.id === sel.season ? 'on' : ''}" data-pick-season="${s.id}" aria-pressed="${s.id === sel.season}"><b>${esc(s.label)}</b><span>目標 ${s.targetCm / 100} 米</span><small>${s.days} 日</small></button>`,
  ).join('');
  const season = SEASONS.find((s) => s.id === sel.season)!;
  const cards = speciesForSeason(sel.season)
    .map(
      (sp) => `<button type="button" class="species ${sp.id === sel.species ? 'on' : ''}" data-species="${sp.id}" aria-pressed="${sp.id === sel.species}">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, season.targetCm)}"></span>
        <b>${esc(sp.name)}</b><i>${esc(sp.scientific.split('（')[0]!)}</i>
        <small>真實 ${esc(sp.typicalM)} 米・紀錄 ${sp.maxM} 米</small>
      </button>`,
    )
    .join('');
  const chosen = speciesDef(sel.species);
  return `
    <p class="eyebrow">世界之樹・新一局</p>
    <h2>揀賽季，揀樹種</h2>
    <p>每日生存壓力一樣，分別只係時間長短、目標高度同徽章。天氣跟住現實；水分、養分保持喺最佳範圍，惡劣天氣前加固。</p>
    ${legacy}
    <div class="seasons pick">${seasons}</div>
    <p class="fine">${esc(season.sub)}・每日約 ${(season.targetCm / season.days).toFixed(0)} 厘米</p>
    <div class="species-pick">${cards}</div>
    <p class="species-blurb"><b>${esc(chosen.name)}</b>：${esc(chosen.blurb)}</p>
    <label>樹的名字<input id="tree-name" maxlength="12" value="${esc(current)}" autocomplete="off" /></label>
    <button type="button" class="primary" data-action="start-game">種${esc(chosen.name)}・開始${esc(season.label)}</button>`;
}

export function overModal(state: GameState, meta: MetaState, lines: string[]): string {
  const over = state.over!;
  const season = seasonDef(state.season);
  const title = over.kind === 'dead' ? `${esc(state.treeName)}枯死咗` : `${esc(season.label)}完成！`;
  const got = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '<p>今次未夠 3 個月，未有徽章。</p>';
  return `
    <p class="eyebrow">${over.kind === 'dead' ? '結算' : '賽季結算'}</p>
    <h2>${title}</h2>
    <p>捱咗 ${over.days} 日，高 ${esc(formatHeight(state.heightCm))}，碳吸收量約 ${carbonKg(state.heightCm)} 公斤／年。</p>
    ${got}
    <p class="fine">徽章總數：一級 ${meta.badges['1']}・二級 ${meta.badges['2']}・三級 ${meta.badges['3']}</p>
    <button type="button" class="primary" data-action="new-game">開始新一局</button>`;
}

export function completeModal(state: GameState, meta: MetaState, lines: string[]): string {
  const done = state.completed!;
  const season = seasonDef(state.season);
  const got = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
  const beyond = state.heightCm > season.targetCm ? `已經突破 ${esc(formatHeight(season.targetCm))} 嘅目標！` : `目標係 ${esc(formatHeight(season.targetCm))}。`;
  return `
    <p class="eyebrow">賽季結算</p>
    <h2>${esc(season.label)}完成！</h2>
    <p>捱咗 ${done.days} 日，高 ${esc(formatHeight(state.heightCm))}，碳吸收量約 ${carbonKg(state.heightCm)} 公斤／年。${beyond}</p>
    ${got}
    <p>目標只係一個里程碑，冇高度上限：繼續照顧，${esc(state.treeName)}會照同一條公式一直長高。</p>
    <p class="fine">徽章總數：一級 ${meta.badges['1']}・二級 ${meta.badges['2']}・三級 ${meta.badges['3']}</p>
    <button type="button" class="primary" data-action="close-modal">繼續種落去</button>
    <button type="button" class="texty" data-action="new-game">開始新一局</button>`;
}

export function stormModal(message: string): string {
  return `
    <p class="eyebrow">夜間結算</p>
    <h2>昨晚發生咗啲事</h2>
    <p>${esc(message)}</p>
    <button type="button" class="primary" data-action="close-modal">去望一望棵樹</button>
  `;
}

export interface PlaceOption {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const PLACES: PlaceOption[] = [
  { id: 'hk', name: '香港', lat: 22.3022, lon: 114.1744 },
  { id: 'central', name: '中環', lat: 22.2819, lon: 114.158 },
  { id: 'shatin', name: '沙田', lat: 22.3817, lon: 114.1877 },
  { id: 'taipo', name: '大埔', lat: 22.45, lon: 114.1686 },
  { id: 'saikung', name: '西貢', lat: 22.3817, lon: 114.2708 },
  { id: 'yuenlong', name: '元朗', lat: 22.4445, lon: 114.0222 },
  { id: 'tungchung', name: '東涌', lat: 22.289, lon: 113.941 },
];

export function locationModal(current: string): string {
  const rows = PLACES.map(
    (p) => `<button type="button" class="place ${current === p.id ? 'on' : ''}" data-place="${p.id}">${icon('pin')}<span>${esc(p.name)}</span></button>`,
  ).join('');
  return `
    <p class="eyebrow">天氣地點</p>
    <h2>喺邊度種呢棵樹？</h2>
    <p>天氣會跟住呢個地方。揀「我所在位置」會問瀏覽器攞位置，只用嚟查天氣。</p>
    <button type="button" class="place wide ${current === 'geo' ? 'on' : ''}" data-place="geo">${icon('locate')}<span>用我所在位置</span></button>
    <div class="places">${rows}</div>
    <button type="button" class="texty" data-action="close-modal">取消</button>
  `;
}

export function settingsModal(treeName: string, quality: 'low' | 'high', threeD: boolean): string {
  return `
    <p class="eyebrow">設定</p>
    <h2>${esc(treeName)}</h2>
    <div class="setting-row">
      <span>樹的名字</span>
      <button type="button" class="ghost" data-action="rename">改名</button>
    </div>
    <div class="setting-row">
      <span>畫質${threeD ? '' : '（呢部機用緊簡化畫面）'}</span>
      <div class="seg">
        <button type="button" class="${quality === 'low' ? 'on' : ''}" data-quality="low" ${threeD ? '' : 'disabled'}>慳電</button>
        <button type="button" class="${quality === 'high' ? 'on' : ''}" data-quality="high" ${threeD ? '' : 'disabled'}>精緻</button>
      </div>
    </div>
    <div class="howto">
      <p><b>點玩：</b>每晚 12 點結算：健康 = 舊健康 + 水分因素 + 養分因素 − 天氣損傷。水分保持 40–80、養分 60 以上各 +5，唔啱就 −10。</p>
      <p>天氣跟住現實（香港用天文台警告）。惡劣天氣前 12 小時會倒數，記得加固推高抗風力 R：傷害 × (1 − R/100)。</p>
      <p>健康 80 以上長得最快（×1.5，有綠光）；跌到 0 會瀕死 24 小時，將水分同養分調返最佳就救得返。</p>
    </div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `;
}

export function animalName(id: string): string {
  return animalById(id)?.name ?? id;
}

/** Round up to a friendly rail top (1, 2, 5 × 10^n cm). */
function niceCeilCm(cm: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, cm))));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= cm) return m * p;
  return 10 * p;
}

/**
 * Height rail. Stages 0–3 show progress through the current stage. At 巨樹 the rail runs from the stage start to a
 * scale that extends past the target (no cap), with a 目標 tick; beyond the target it reads 已突破目標.
 */
export function railHtml(state: GameState): string {
  const target = seasonDef(state.season).targetCm;
  const stages = stagesFor(target);
  const stage = stageFor(state.heightCm, target);
  const next = stages[stage.index + 1];
  if (next) {
    const p = stageProgress(state.heightCm, target);
    return `
      <span class="rail-top ${p > 0.9 ? 'dim' : ''}"><small>下一階段</small><b>${esc(formatHeight(stage.nextCm))}</b><small>${esc(next.name)}</small></span>
      <span class="rail-track"><span class="rail-fill" style="height:${(p * 100).toFixed(1)}%"></span><span class="rail-marker" style="bottom:${(p * 100).toFixed(1)}%"><b>${esc(formatHeight(state.heightCm))}</b><small>當前</small></span></span>
      <span class="rail-bottom ${p < 0.14 ? 'dim' : ''}"><b>${esc(formatHeight(stage.minCm))}</b><small>${esc(stage.name)}</small></span>`;
  }
  const beyond = state.heightCm >= target;
  const top = beyond ? niceCeilCm(state.heightCm * 1.15) : target;
  const span = Math.max(1, top - stage.minCm);
  const p = Math.max(0, Math.min(1, (state.heightCm - stage.minCm) / span));
  const tp = Math.max(0, Math.min(1, (target - stage.minCm) / span));
  const tick = beyond ? `<span class="rail-target" style="bottom:${(tp * 100).toFixed(1)}%"><small>目標</small></span>` : '';
  return `
      <span class="rail-top ${!beyond && p > 0.9 ? 'dim' : ''} ${beyond ? 'beyond' : ''}"><small>${beyond ? '已突破目標' : '目標'}</small><b>${esc(formatHeight(top))}</b><small>${beyond ? '冇上限' : '可以繼續長'}</small></span>
      <span class="rail-track ${beyond ? 'beyond' : ''}"><span class="rail-fill" style="height:${(p * 100).toFixed(1)}%"></span>${tick}<span class="rail-marker" style="bottom:${(p * 100).toFixed(1)}%"><b>${esc(formatHeight(state.heightCm))}</b><small>${beyond ? '已突破目標' : '當前'}</small></span></span>
      <span class="rail-bottom ${p < 0.14 ? 'dim' : ''}"><b>${esc(formatHeight(stage.minCm))}</b><small>${esc(stage.name)}</small></span>`;
}
