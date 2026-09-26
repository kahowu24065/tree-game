import { BADGES, CARE, COLLAPSE_MAX, EMERGENCY, N_OPTIMAL, PREPS, R_DAILY_DECAY, R_MAX, SEASONS, W_MAX, W_OPTIMAL, W_SATURATED, W_TIERS, WEATHER_EVENTS, WX_CATEGORY_LABEL, type PrepId, type WeatherEventId } from './balance';
import { ANIMALS, animalById, HYPERION_M, MILESTONES, SHERMAN_M, stageFor, stageProgress, stagesFor } from './content';
import { CATEGORY_LABEL, CATEGORY_ORDER, unlockHint } from './data/animals';
import { FEATURE_LABEL, habitatDef } from './data/habitat';
import { SPECIES, STAGE_NAMES, speciesDef, speciesTargetCm, speciesForSeason, stageSampleCm, type SpeciesId } from './data/species';
import type { SeasonId } from './balance';
import { daysBetween, formatShort, weekdayIndex } from './dates';
import { drawAnimal } from './draw-animals';
import { dayEvent, hkoWarningEvents, type Countdown } from './events';
import { ICONS, weatherArt, type IconName } from './icons';
import type { HkoWarning } from './hko';
import { carbonKg, hMultTier, seasonDef } from './rules';
import { actionLimit, advice, dayNumber, doubleRActive, emergencyOptions, eventTitle, prepAmount, type NightPlan } from './sim';
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
  /** v12 今晚預計: the same NightPlan the nightly settlement will use. */
  preview: NightPlan;
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

/** v12 water side effect of an event, in words. */
function waterText(id: WeatherEventId, short = false): string {
  if (id === 'hot') return short ? 'W 即時 −20' : '警告一出水分即時 −20';
  if (id === 'rainstorm') return short ? 'W 即時 +20' : '警告一出水分即時 +20（過 100 最多 +10），當晚冇流失';
  if (id === 'blackrain') return short ? 'W 即時 +20（同暴雨共用）' : '水分即時 +20（同暴雨一日只計一次，過 100 最多 +10），當晚冇流失';
  if (id === 'drizzle') return short ? 'W 晚上 +10' : '晚上水分 +10（過 100 最多 +5），當晚冇流失';
  if (id === 'clear') return short ? 'W 晚上 −10' : '晚上水分自然流失 −10';
  return short ? 'W 晚上 −10' : '水分照常每晚 −10';
}

/** v13 health effect of an event, in words (熱／雨: 應急行動 cancels it; 風: × (1 − R/100), 青年樹 onwards). */
function damageText(id: WeatherEventId, unlocked: boolean): string {
  const d = ev(id);
  if (!d.damage) return '冇傷害';
  if (d.category === 'heat') return `健康 −${d.damage}（做酷熱澆水就唔扣）`;
  if (d.category === 'rain') return `健康 −${d.damage}（做暴雨疏水就唔扣）`;
  if (!unlocked) return '青年樹前唔受風災影響';
  return `健康 −${d.damage} × (1 − R/100)・R 低過 ${d.collapseBelow} 會倒塌`;
}

function effectText(id: WeatherEventId, unlocked = true): string {
  const d = ev(id);
  const parts = [damageText(id, unlocked)];
  parts.push(waterText(id));
  if (d.dR && unlocked) parts.push(`抗風力 ${d.dR}`);
  return parts.join('・');
}

/** 倒塌 count text, e.g. 倒塌 1/2. */
export function collapseText(state: GameState): string {
  const n = state.collapses || 0;
  return n > COLLAPSE_MAX ? `倒塌 ${n} 次・再倒即死` : `倒塌 ${n}/${COLLAPSE_MAX}`;
}

const M = '−';
const signed = (v: number) => (v > 0 ? `+${fmt(v)}` : v < 0 ? `${M}${fmt(-v)}` : '±0');
const fmt = (v: number) => String(Math.round(v * 10) / 10);

let previewOpen = false;
/** Tap 今晚預計 to open / close its breakdown. */
export function togglePreview(): void {
  previewOpen = !previewOpen;
}

let flashDir: 'up' | 'down' = 'up';
let flashUntil = 0;
/** Animate the 水分 bar after an instant warning. */
export function flashWater(dir: 'up' | 'down'): void {
  flashDir = dir;
  flashUntil = Date.now() + 2600;
}

function nLabel(score: number): string {
  return score > 0 ? '充足' : score < 0 ? '營養不良' : '一般';
}

/** v13 collapse warning for 今晚預計 (null when tonight is safe). */
export function collapseWarning(p: NightPlan, collapses: number): { text: string; fatal: boolean } | null {
  const c = p.collapse;
  if (!c) return null;
  const label = ev(c.event).label;
  const head = `⚠️ R ${Math.round(c.r)} 低過${label}門檻 ${c.threshold}，今晚會倒塌`;
  if (c.fatal && !c.revive) return { text: `${head}，已倒 ${collapses} 次，今次會死！`, fatal: true };
  if (c.fatal) return { text: `${head}，已倒 ${collapses} 次，要靠免死金牌先保得住`, fatal: true };
  return { text: `${head}（已倒 ${collapses}/${COLLAPSE_MAX} 次）`, fatal: false };
}

/** The lines of the 今晚預計 breakdown (same NightPlan as settlement). */
export function previewLines(p: NightPlan): { text: string; value: string; tone: string; sub?: string }[] {
  const tone = (v: number) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');
  const waterSub =
    p.water.kind === 'loss' ? `而家 ${fmt(p.wBefore)}，今晚流失 ${signed(p.water.delta)}` : p.water.kind === 'drizzle' ? `而家 ${fmt(p.wBefore)}，毛毛雨 ${signed(p.water.delta)}，冇流失` : `而家 ${fmt(p.wBefore)}，落雨日冇流失`;
  const lines: { text: string; value: string; tone: string; sub?: string }[] = [
    { text: `水分 ${fmt(p.wAfter)}｜${p.waterDeath ? '根部浸死' : p.wLabel}`, value: p.waterDeath ? '瀕死' : signed(p.wScore), tone: p.waterDeath ? 'down' : tone(p.wScore), sub: waterSub },
    { text: `養分 ${fmt(p.nAfter)}｜${nLabel(p.nScore)}`, value: signed(p.nScore), tone: tone(p.nScore), sub: `每晚用 10${p.residentN ? `，長駐動物 +${p.residentN}` : ''}` },
  ];
  if (p.heat) lines.push(p.heat.handled ? { text: '熱｜酷熱：已應對', value: '0', tone: 'flat', sub: '做咗酷熱澆水' } : { text: '熱｜酷熱', value: signed(p.heat.score), tone: 'down', sub: '做「酷熱澆水」就唔扣' });
  if (p.rain) {
    const label = ev(p.rain.event).label;
    lines.push(p.rain.handled ? { text: `雨｜${label}：已應對`, value: '0', tone: 'flat', sub: '做咗暴雨疏水' } : { text: `雨｜${label}`, value: signed(p.rain.score), tone: 'down', sub: '做「暴雨疏水」就唔扣' });
  }
  if (p.wind) {
    const label = ev(p.wind.event).label;
    lines.push(
      p.wind.locked
        ? { text: `風｜${label}`, value: '0', tone: 'flat', sub: '青年樹前唔受風災影響' }
        : { text: `風｜${label}（抗風力 ${Math.round(p.wind.r)}）`, value: signed(p.wind.score), tone: tone(p.wind.score), sub: `基礎 ${p.wind.base} × (1 − ${Math.round(p.wind.r)}/100)` },
    );
  }
  if (!p.heat && !p.rain && !p.wind) lines.push({ text: `天氣：${ev(p.event).label}`, value: '0', tone: 'flat' });
  if (p.emergencyBonus) lines.push({ text: p.emergencyCount > 1 ? '應急獎勵 (3 + 3) × 0.75' : '應急獎勵', value: signed(p.emergencyBonus), tone: 'up', sub: p.emergencyCount > 1 ? '酷熱澆水同暴雨疏水都做咗' : '應急行動做得啱時' });
  if (p.pest) lines.push({ text: '蟲害', value: signed(-p.pest), tone: 'down' });
  return lines;
}

function collapseHtml(p: NightPlan, collapses: number): string {
  const w = collapseWarning(p, collapses);
  return w ? `<p class="collapse-warn ${w.fatal ? 'fatal' : ''}">${esc(w.text)}</p>` : '';
}

function previewChip(p: NightPlan, dying: boolean, collapses = 0): { chip: string; pop: string } {
  const t = p.waterDeath || p.collapse ? 'down' : p.dH > 0 ? 'up' : p.dH < 0 ? 'down' : 'flat';
  const val = p.waterDeath ? '瀕死' : signed(p.dH);
  const lines = previewLines(p)
    .map((l) => `<li class="${l.tone}"><span>${esc(l.text)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span><b>${esc(l.value)}</b></li>`)
    .join('');
  const pop = previewOpen
    ? `<div class="night-pop glass" role="dialog" aria-label="今晚預計明細">
        <p class="eyebrow">今晚結算預計</p>
        ${collapseHtml(p, collapses)}
        <ul>${lines}</ul>
        <p class="night-total ${t}">健康 ${fmt(p.hBefore)} → ${fmt(p.hAfter)}<b>${esc(val)}</b></p>
        <p class="fine">${dying ? '瀕死中：水分 50–100、養分 60 以上即刻救返。' : '照而家狀態計；澆水、疏水、加固或者天氣變咗會即刻更新。'}</p>
      </div>`
    : '';
  return { chip: `<button type="button" class="night-chip ${t}" data-action="preview" aria-expanded="${previewOpen}">${p.collapse ? '⚠️' : ''}今晚預計 <b>${esc(val)}</b>${icon(previewOpen ? 'chevronDown' : 'chevronRight')}</button>`, pop };
}

/** 水分 bar on a 0-150 scale: 最佳 50-100, 飽和線 at 100, 爛根區 shaded darker per tier, line at 150. */
function waterTrack(w: number, trackClass: string, fillClass: string): string {
  const pct = (v: number) => ((v / W_MAX) * 100).toFixed(2);
  const rot = W_TIERS.filter((t) => t.tone.startsWith('rot'));
  let from = W_SATURATED;
  const zones = rot
    .map((t) => {
      const to = Math.min(W_MAX, t.max);
      const html = `<span class="rot ${t.tone}" style="left:${pct(from)}%;width:${pct(to - from)}%" title="${esc(t.label)}"></span>`;
      from = to;
      return html;
    })
    .join('');
  const v = Math.max(0, Math.min(W_MAX, w));
  const tone = v > W_SATURATED ? 'rotfill' : '';
  return `<span class="${trackClass} wtrack"><span class="${trackClass === 'track' ? 'band' : 'bar-band'}" style="left:${pct(W_OPTIMAL[0])}%;width:${pct(W_OPTIMAL[1] - W_OPTIMAL[0])}%"></span>${zones}<span class="${fillClass} ${tone}" style="width:${pct(v)}%"></span><span class="sat-line" style="left:${pct(W_SATURATED)}%"></span><span class="max-line"></span></span>`;
}

function waterBar(w: number): string {
  const v = Math.round(Math.max(0, Math.min(W_MAX, w)));
  const ok = v >= W_OPTIMAL[0] && v <= W_OPTIMAL[1];
  const flash = Date.now() < flashUntil ? `flash-${flashDir}` : '';
  const zone = v > W_SATURATED ? 'rotzone' : '';
  return `<div class="bar water wbar ${ok ? 'ok' : 'off'} ${zone} ${flash}" title="水分 0–150：最佳 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}，100 以上爛根，150 瀕死">
    <span class="bar-key">W</span><span class="bar-label">水分</span>
    ${waterTrack(v, 'bar-track', 'bar-fill')}
    <b class="bar-val">${v}</b>
  </div>`;
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
    const stage = stageFor(state.heightCm, speciesTargetCm(state.species));
    const drains = actionLimit(state, 'drain');
    const night = state.started && !state.over ? previewChip(view.preview, Boolean(state.dying), state.collapses || 0) : null;
    const emerg = state.started && !state.over ? emergencyButtons(view, 'mini') : '';
    status.classList.toggle('pop-open', Boolean(night?.pop));
    status.innerHTML = `
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${icon('chevronRight')}</button>
      <p class="status-sub">${esc(state.treeName)} · ${esc(speciesDef(state.species).name)}${esc(stage.name)} · ${dayNumber(state, view.today) > season.days ? `賽季完成・加時第 ${dayNumber(state, view.today) - season.days} 日` : `第 ${dayNumber(state, view.today)}/${season.days} 日`}</p>
      <div class="bars">
        ${statBar('H', '健康', state.health, [50, 100], 'health', state.dying ? '瀕死' : '')}
        <div class="night-row">${night?.chip ?? ''}</div>
        ${waterBar(state.moisture)}
        ${statBar('N', '養分', state.nutrients, N_OPTIMAL, 'food')}
        ${statBar('R', '抗風', state.resist, [60, 100], state.windUnlocked ? 'shield' : 'shield locked')}
      </div>
      ${state.windUnlocked ? `<p class="collapse-count ${(state.collapses || 0) >= COLLAPSE_MAX ? 'danger' : state.collapses ? 'warn' : ''}">${esc(collapseText(state))}</p>` : ''}
      <div class="mini-acts">
        <button type="button" class="mini ${state.pest.active ? 'alert' : ''}" data-action="deworm" ${state.care.dewormed ? 'disabled' : ''}>${icon('bug')}<span>${state.care.dewormed ? '除過喇' : state.pest.active ? '有蟲！' : '除蟲'}</span></button>
        <button type="button" class="mini ${state.moisture > W_SATURATED ? 'alert' : ''}" data-action="drain" ${drains.used >= drains.max ? 'disabled' : ''}>${icon('drain')}<span>${drains.used >= drains.max ? '疏過喇' : `疏水 ${drains.max - drains.used}`}</span></button>
      </div>${emerg ? `<div class="emerg-acts">${emerg}</div>` : ''}${night?.pop ?? ''}`;
  }

  const rail = document.getElementById('rail');
  if (rail) {
    rail.innerHTML = railHtml(state);
    // v13: the status card grows with 應急行動 / 倒塌 rows — keep the height rail below it.
    rail.style.top = '';
    if (status && status.offsetHeight) {
      const bottom = status.offsetTop + status.offsetHeight + 12;
      if (bottom > rail.offsetTop) rail.style.top = `${bottom}px`;
    }
  }

  const dock = document.getElementById('dock');
  if (dock) {
    const rainBlocks = cond.raining;
    const water = actionLimit(state, 'water');
    const feed = actionLimit(state, 'fertilize');
    const cd = view.countdown;
    const prepShort = Boolean(state.windUnlocked && cd && ev(cd.event).category === 'wind' && state.resist < 60);
    const dbl = state.windUnlocked && doubleRActive(state);
    const freshAnimals = state.animals.filter((id) => !state.seenAnimals.includes(id)).length;
    dock.innerHTML = `
      ${dockBtn('d-water', 'data-action="water"', 'drop', '澆水', rainBlocks ? '落緊雨' : state.moisture >= W_SATURATED ? '飽和' : `${water.used}/${water.max}`, water.used >= water.max || rainBlocks)}
      ${dockBtn('d-feed', 'data-action="fertilize"', 'sprout', '施肥', feed.used >= feed.max ? '施過喇' : '', feed.used >= feed.max)}
      ${dockBtn('d-guard', 'data-open="forecast"', 'shield', '加固', !state.windUnlocked ? '青年樹解鎖' : dbl ? '今日雙倍' : prepShort ? '惡劣天氣' : `R ${Math.round(state.resist)}`, !state.windUnlocked, dbl ? '×2' : prepShort ? '!' : '')}
      ${dockBtn('d-album', 'data-open="album"', 'book', '圖鑑', `${state.animals.length}/${ANIMALS.length}`, false, freshAnimals ? String(freshAnimals) : '')}`;
  }

  const slot = document.getElementById('note-slot');
  if (slot) {
    const dying = state.dying && !state.over
      ? `<article class="glass note-card dying"><p><b>瀕死・${esc(hm(Math.max(0, dyingLeftMs(state)) / 60000))}</b>將水分調到 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上即刻救返。</p></article>`
      : '';
    const note = state.started && state.morningNote ? `<article class="glass note-card"><p>${esc(state.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>` : '';
    const dbl = state.started && !state.over && state.windUnlocked && doubleRActive(state) && !state.doubleRSeen
      ? `<article class="glass note-card double-r" role="alert"><p><b>🪵 棵樹昨晚倒塌咗</b>今日加固效果雙倍：打木樁 +${PREPS.stakes.amount * 2}、綁防風繩 +${PREPS.ropes.amount * 2}、修枝防風 +${PREPS.prune.amount * 2}（最多 ${R_MAX}）。${esc(collapseText(state))}。</p><div class="note-btns"><button type="button" data-open="forecast">去加固</button><button type="button" data-action="dismiss-double">知道喇</button></div></article>`
      : '';
    const html = dying + dbl + note;
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
    const cat = ev(cd.event).category;
    const tail = cat === 'wind' ? (state.windUnlocked ? `抗風力 ${Math.round(state.resist)}` : '青年樹前冇影響') : cat === 'heat' ? '可以酷熱澆水' : cat === 'rain' ? '可以暴雨疏水' : '';
    line = `<span class="warn-line">${icon('warn')}${esc(ev(cd.event).label)} · ${hoursText(cd.hours)}${tail ? ` · ${tail}` : ''}</span>`;
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
  emergency: { icon: 'drop', tone: 'blue', title: '應急行動' },
  collapse: { icon: 'warn', tone: 'red', title: '棵樹倒塌' },
  unlock: { icon: 'shield', tone: 'orange', title: '風災同加固解鎖' },
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

/**
 * v13 應急行動 buttons: shown only while today's warning is issued (酷熱 → 酷熱澆水；暴雨／黑雨 → 暴雨疏水),
 * highlighted until done, then disabled with 「今日做咗」.
 */
export function emergencyButtons(view: View, variant: 'mini' | 'act'): string {
  const { state } = view;
  const opts = emergencyOptions(view.todayEvents);
  const items: { id: 'heatWater' | 'rainDrain'; action: string; label: string; sub: string; done: boolean; tone: string }[] = [];
  if (opts.heatWater) items.push({ id: 'heatWater', action: 'heat-water', label: '酷熱澆水', sub: state.moisture >= W_SATURATED ? '飽和・都算做咗' : `+${EMERGENCY.heatWater.amount} 水分・免扣 10`, done: Boolean(state.care.heatWater), tone: 'heat' });
  if (opts.rainDrain) {
    const rainLabel = view.todayEvents.includes('blackrain') ? '黑雨' : '暴雨';
    items.push({ id: 'rainDrain', action: 'rain-drain', label: '暴雨疏水', sub: `−10（最低 ${EMERGENCY.rainDrain.floor}）・免扣 ${rainLabel === '黑雨' ? 15 : 10}`, done: Boolean(state.care.rainDrain), tone: 'rain' });
  }
  if (!items.length) return '';
  if (variant === 'mini') {
    return items
      .map((i) => `<button type="button" class="emerg ${i.tone} ${i.done ? 'done' : 'hot-pulse'}" data-action="${i.action}" ${i.done ? 'disabled' : ''}>${icon(i.id === 'heatWater' ? 'drop' : 'drain')}<span>${i.label}</span><small>${i.done ? '今日做咗' : '應急'}</small></button>`)
      .join('');
  }
  return `<div class="emerg-card"><p class="eyebrow">${icon('warn')}應急行動・每日各一次，唔佔普通次數</p><div class="emerg-row">${items
    .map((i) => `<button type="button" class="emerg-act ${i.tone} ${i.done ? 'done' : 'hot-pulse'}" data-action="${i.action}" ${i.done ? 'disabled' : ''}><span class="act-ic">${icon(i.id === 'heatWater' ? 'drop' : 'drain')}</span><span>${i.label}</span><small>${esc(i.done ? '今日做咗' : i.sub)}</small></button>`)
    .join('')}</div><p class="fine">做咗：今晚唔扣嗰類天氣分，應急獎勵 +3；兩樣都做 (3 + 3) × 0.75 = +4.5。</p></div>`;
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
      <p>${esc(effectText(view.todayEvent, state.windUnlocked))}。${esc(today.tip)}</p>
      ${multi.length > 1 ? `<p class="fine">同時有${multi.map((e) => esc(ev(e).label)).join('、')}：熱、雨、風三類各自計埋；同一類只計最嚴重嗰個。</p>` : ''}
      ${multi.filter((e) => e !== view.todayEvent && ev(e).category).map((e) => `<p class="fine">${esc(ev(e).label)}：${esc(effectText(e, state.windUnlocked))}。</p>`).join('')}
      <p class="fine">今晚結算：${esc(hm(view.minutesToSettle))}後</p>
    </article>
    <div class="meters">
      ${meter('健康 H', state.health, 'health', [50, 100])}
      ${waterMeter(state.moisture)}
      ${meter('養分 N', state.nutrients, 'food', N_OPTIMAL)}
      ${meter(state.windUnlocked ? '抗風力 R' : '抗風力 R（青年樹時解鎖）', state.resist, 'shield', [60, 100])}
    </div>
    ${state.windUnlocked ? `<p class="fine collapse-line">${esc(collapseText(state))}：抗風力低過門檻（初級颱風 20、狂風雷暴 25、高級颱風 40）就會倒塌，高度 −20%；第 3 次會死。</p>` : `<p class="fine">棵樹未到青年樹：抗風力唔會變，風災唔會傷到佢，亦唔會倒塌。</p>`}
    ${emergencyButtons(view, 'act')}
    ${nightCard(view.preview, state.collapses || 0)}
    <p class="fine">最佳：水分 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}（0–150；100 以上爛根，150 瀕死），養分 ${N_OPTIMAL[0]}–100。而家${esc(tier.label)}（×${tier.mult}）${state.health >= 80 ? '，有綠光' : ''}。${state.pest.active ? '<b class="bad">有蟲害：每晚 −15 健康。</b>' : ''}</p>
    <p class="advice">${esc(advice(state, view.preview, view.countdown))}</p>
    <div class="actions">
      ${actionBtn('water', 'drop', 'blue', '澆水', cond.raining ? '落緊雨' : state.moisture >= W_SATURATED ? `泥土飽和 · ${water.used}/${water.max}` : `+${CARE.water.amount}（最多到 100）· ${water.used}/${water.max}`, water.used >= water.max || cond.raining)}
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
        <li><span>水分${s.wLabel ? `・${esc(s.wLabel)}` : '因素'}</span><b>${s.wFactor > 0 ? '+' : ''}${s.wFactor}</b><small>W ${Math.round(s.wBefore)}→${Math.round(s.wAfter)}${s.wNight ? (s.wNight.kind === 'loss' ? '（流失）' : s.wNight.kind === 'drizzle' ? '（毛毛雨）' : '（落雨日）') : ''}</small></li>
        <li><span>養分因素</span><b>${s.nFactor > 0 ? '+' : ''}${s.nFactor}</b><small>N ${Math.round(s.nBefore)}→${Math.round(s.nAfter)}</small></li>
        ${
          s.heat === undefined && s.wind === undefined
            ? `<li><span>天氣損傷</span><b>−${s.finalDamage}</b><small>基礎 ${s.baseDamage} × (1 − ${Math.round(s.rBefore)}/100)</small></li>`
            : `${s.heat ? `<li><span>熱・酷熱</span><b>${s.heat.handled ? '0' : `−${s.heat.base}`}</b><small>${s.heat.handled ? '已應對' : '冇做酷熱澆水'}</small></li>` : ''}${
                s.rain ? `<li><span>雨・${esc(ev(s.rain.event).label)}</span><b>${s.rain.handled ? '0' : `−${s.rain.base}`}</b><small>${s.rain.handled ? '已應對' : '冇做暴雨疏水'}</small></li>` : ''
              }${
                s.wind ? `<li><span>風・${esc(ev(s.wind.event).label)}</span><b>${s.wind.score ? `−${-s.wind.score}` : '0'}</b><small>${s.wind.locked ? '青年樹前唔受影響' : `基礎 ${s.wind.base} × (1 − ${Math.round(s.wind.r)}/100)`}</small></li>` : ''
              }${!s.heat && !s.rain && !s.wind ? `<li><span>天氣</span><b>0</b><small>${esc(ev(s.event).label)}</small></li>` : ''}${
                s.emergencyBonus ? `<li><span>應急獎勵</span><b>+${s.emergencyBonus}</b><small>${(s.emergencyCount ?? 0) > 1 ? '(3 + 3) × 0.75' : ''}</small></li>` : ''
              }`
        }
        ${s.pestDamage ? `<li><span>蟲害</span><b>−${s.pestDamage}</b><small></small></li>` : ''}
        <li><span>生長</span><b>${s.deltaG >= 0 ? '+' : ''}${s.deltaG} 厘米</b><small>${s.baseGrowth} × ${s.hMult} × ${s.weatherBonus}</small></li>
        ${s.collapse ? `<li class="down"><span>倒塌</span><b>−20% 高度</b><small>${esc(formatHeight(s.collapse.heightBefore))} → ${esc(formatHeight(s.collapse.heightAfter))}・第 ${s.collapse.count} 次${s.collapse.revived ? '（免死金牌）' : ''}</small></li>` : ''}
      </ul>
      ${s.notes.length ? `<p class="fine">${s.notes.map(esc).join('；')}</p>` : ''}
    </article>`;
}

function actionBtn(action: string, ic: IconName, tone: string, label: string, sub: string, disabled: boolean): string {
  return `<button type="button" class="act ${tone} ${disabled ? 'done' : ''}" data-action="${action}" ${disabled ? 'disabled' : ''}>
    <span class="act-ic">${icon(ic)}</span><span>${label}</span><small>${esc(sub)}</small>
  </button>`;
}

function waterMeter(w: number): string {
  const shown = Math.round(Math.max(0, Math.min(W_MAX, w)));
  const ok = shown >= W_OPTIMAL[0] && shown <= W_OPTIMAL[1];
  return `<div class="meter ${ok ? 'ok' : 'off'}">
    <div class="meter-top"><span>水分 W <small>0–150</small></span><span>${shown}</span></div>
    ${waterTrack(shown, 'track', 'fill water')}
  </div>`;
}

/** 今晚預計 card in the 照顧 tab (same breakdown as the status-card popover). */
function nightCard(p: NightPlan, collapses = 0): string {
  const t = p.waterDeath ? 'down' : p.dH > 0 ? 'up' : p.dH < 0 ? 'down' : 'flat';
  const rows = previewLines(p)
    .map((l) => `<li class="${l.tone}"><span>${esc(l.text)}</span><b>${esc(l.value)}</b><small>${esc(l.sub ?? '')}</small></li>`)
    .join('');
  return `<article class="card night-card">
      <p class="eyebrow">今晚預計</p>
      ${collapseHtml(p, collapses)}
      <ul class="breakdown">${rows}</ul>
      <h2 class="${t} night-total-h">健康 ${fmt(p.hBefore)} → ${fmt(p.hAfter)}（${p.waterDeath ? '瀕死' : signed(p.dH)}）</h2>
    </article>`;
}

function meter(label: string, value: number, kind: string, band: readonly [number, number]): string {
  const shown = Math.round(Math.max(0, Math.min(100, value)));
  const ok = shown >= band[0] && shown <= band[1];
  return `<div class="meter ${ok ? 'ok' : 'off'}">
    <div class="meter-top"><span>${label}</span><span>${shown}</span></div>
    <div class="track"><div class="band" style="left:${band[0]}%;width:${band[1] - band[0]}%"></div><div class="fill ${kind}" style="width:${shown}%"></div></div>
  </div>`;
}

/** v13 countdown line: what the coming event will do with the tree as it stands. */
function countdownDamage(state: GameState, id: WeatherEventId): string {
  const d = ev(id);
  if (d.category === 'heat') return `警告一出可以做「酷熱澆水」：做咗唔扣健康（唔做 −${d.damage}），仲有應急獎勵 +3。抗風力幫唔到手。`;
  if (d.category === 'rain') return `警告一出可以做「暴雨疏水」：做咗唔扣健康（唔做 −${d.damage}），仲有應急獎勵 +3。抗風力幫唔到手。`;
  if (d.category !== 'wind') return '';
  if (!state.windUnlocked) return '棵樹未到青年樹，風災唔會傷到佢，亦唔會倒塌。';
  const dmg = Math.round(d.damage * (1 - state.resist / 100) * 10) / 10;
  const below = state.resist < (d.collapseBelow ?? 0);
  return `以而家抗風力 ${Math.round(state.resist)} 計，傷害會係 ${dmg}（${d.damage} × (1 − ${Math.round(state.resist)}/100)）。${below ? `⚠️ 低過倒塌門檻 ${d.collapseBelow}，會倒塌！` : `倒塌門檻 ${d.collapseBelow}，而家安全。`}`;
}

function forecastTab(view: View): string {
  const { state } = view;
  const cd = view.countdown;
  const alert = cd
    ? `<article class="card warn countdown">
        <p class="eyebrow">${icon('warn')}12 小時惡劣天氣預警</p>
        <h2>${esc(ev(cd.event).label)} · ${esc(hoursText(cd.hours))}</h2>
        <p>${esc(effectText(cd.event, state.windUnlocked))}。${esc(ev(cd.event).tip)}</p>
        <p class="fine">來源：${esc(cd.source)}。${esc(countdownDamage(state, cd.event))}</p>
      </article>`
    : `<article class="card"><p class="eyebrow">12 小時預警</p><p>未來 12 小時未見惡劣天氣。</p></article>`;
  const locked = !state.windUnlocked;
  const dbl = !locked && doubleRActive(state);
  const preps = (Object.keys(PREPS) as PrepId[])
    .map((k) => {
      const done = state.care.preps[k];
      const sub = locked ? '（青年樹時解鎖）' : done ? '今日做過' : dbl ? `+${prepAmount(state, k)}（雙倍）` : `+${prepAmount(state, k)} 抗風力`;
      return `<button type="button" class="prep ${done ? 'on' : ''} ${locked ? 'locked' : ''} ${dbl && !done ? 'double' : ''}" data-prep="${k}" aria-pressed="${done}" ${locked ? 'disabled aria-disabled="true"' : ''}><span>${PREPS[k].label}</span><small>${sub}</small></button>`;
    })
    .join('');
  const emerg = emergencyButtons(view, 'act');
  const shield = `<article class="card ${locked ? 'locked-card' : ''}">
      <p class="eyebrow">加固・抗風力 R${locked ? '（青年樹時解鎖）' : `・${esc(collapseText(state))}`}</p>
      ${dbl ? `<p class="double-banner">🪵 棵樹昨晚倒塌咗，今日加固效果雙倍！</p>` : ''}
      <h2>${Math.round(state.resist)} / ${R_MAX}</h2>
      <div class="track fat"><div class="fill shield" style="width:${Math.round(state.resist)}%"></div></div>
      <p>${
        locked
          ? `棵樹未到青年樹：抗風力唔會變（唔會每晚減，風災亦唔會消耗），風災唔會傷樹、唔會倒塌。長到青年樹就會解鎖加固。`
          : `只有風災（初級颱風、狂風雷暴、高級颱風）受抗風力影響：傷害 = 基礎 × (1 − R/100)。風災會消耗抗風力：初級颱風 18、狂風雷暴 25、高級颱風 35；每晚繩索鬆少少（−${R_DAILY_DECAY}）。R 低過門檻（20／25／40）一定倒塌：高度 −20%，最多倒 2 次，第 3 次會死。每樣加固每日做一次。`
      }</p>
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
    .map((d) => {
      const cat = d.category ? WX_CATEGORY_LABEL[d.category] : '—';
      const hp = !d.damage ? '0' : d.category === 'wind' ? `−${d.damage}×(1−R/100)` : `−${d.damage}`;
      const counter = d.category === 'heat' ? '酷熱澆水免扣' : d.category === 'rain' ? '暴雨疏水免扣' : d.category === 'wind' ? `R ${d.dR}・R&lt;${d.collapseBelow} 倒塌` : '';
      return `<tr><td>${esc(d.label)}</td><td>${cat}</td><td>${hp}</td><td>${esc(waterText(d.id, true))}${counter ? `<br><small>${counter}</small>` : ''}</td></tr>`;
    })
    .join('');
  return `
    ${alert}
    ${emerg}
    ${shield}
    ${hkoCard}
    <p class="status">${esc(view.statusLine)}${wx.provider === 'sim' && !wx.overridden ? ' <button type="button" class="linkish" data-action="retry-weather">再試</button>' : ''}</p>
    <div class="days">${rows}</div>
    <h3 class="sub">天氣事件表</h3>
    <table class="evtable"><thead><tr><th>事件</th><th>類</th><th>健康</th><th>副作用・應對</th></tr></thead><tbody>${table}</tbody></table>
    <p class="fine">香港：酷熱天氣警告 → 酷熱；黃／紅雨 → 暴雨；黑雨 → 黑雨；雷暴警告或強烈季候風 → 狂風雷暴；一號／三號風球 → 初級颱風；八號或以上 → 高級颱風。其他地方按 Open-Meteo 天氣碼、陣風同雨量判斷。熱、雨、風三類天氣各自計埋（例如酷熱加暴雨加颱風三樣都扣）；同一類只計最嚴重嗰個（風：初級颱風 &lt; 狂風雷暴 &lt; 高級颱風；雨：黑雨 &gt; 暴雨）。風災要棵樹長到青年樹先會生效。</p>
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
    <p class="advice">見過嘅動物會輪流返嚟探棵樹，每 3–5 分鐘換一批（每種最少成對出現；雀鳥成群飛過、猴子成群落地）。健康度連續 3 晚 90 以上，已見過嘅動物會長駐：每隻每晚 +2 養分（最多 +6）；兩隻或以上仲會幫手防蟲。健康跌穿 70 佢哋會搬走。</p>
    ${groups}`;
}

function speciesAlbum(view: View): string {
  const cards = SPECIES.map((sp) => {
    const season = seasonDef(sp.season);
    const mine = sp.id === view.state.species;
    const stages = sp.stages.map((txt, i) => `<li><b>${STAGE_NAMES[i]}</b>${esc(txt)}</li>`).join('');
    return `<article class="card species-card ${mine ? 'mine' : ''}">
      <div class="species-head">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, sp.targetM * 100)}"></span>
        <div><p class="eyebrow">${esc(season.label)}・目標 ${sp.targetM} 米${mine ? '・你棵樹' : ''}</p>
        <h2>${esc(sp.name)}</h2>
        <p class="sci">${esc(sp.english)} · <i>${esc(sp.scientific)}</i></p>
        <p class="fine">一般 ${esc(sp.typicalM)} 米・最高紀錄 ${sp.maxM} 米（目標取最接近嘅 10 米）</p></div>
      </div>
      <p>${esc(sp.blurb)}</p>
      <p class="fine">${esc(sp.record)}。資料：<a href="${esc(sp.source.url)}" target="_blank" rel="noopener">${esc(sp.source.label)}</a></p>
      <ol class="stage-list">${stages}</ol>
      ${habitatBlock(sp.id)}
    </article>`;
  }).join('');
  return `<p class="status">九個樹種，每個賽季三款。每個樹種嘅目標＝佢嘅真實最高紀錄，四捨五入到最接近嘅 10 米。</p>${cards}`;
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
  const targetCm = speciesTargetCm(state.species);
  const pct = Math.min(100, (state.heightCm / targetCm) * 100);
  const beyond = state.heightCm >= targetCm;
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
      <p>${beyond ? `已突破目標（${targetCm / 100} 米，達成 ${Math.round((state.heightCm / targetCm) * 100)}%）。目標只係里程碑，冇高度上限。` : `目標 ${targetCm / 100} 米＝${esc(speciesDef(state.species).name)}真實紀錄 ${speciesDef(state.species).maxM} 米取整（只係目標，唔係上限）。`}每日基本生長 ${(targetCm / season.days).toFixed(1)} 厘米 × 健康係數 × 天氣加成${extra ? '，賽季完咗都照樣計' : ''}。</p>
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

export function openModal(inner: string, cls = ''): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.innerHTML = `<div class="modal-card glass ${cls}" role="dialog" aria-modal="true">${inner}</div>`;
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
    (s) => `<button type="button" class="season ${s.id === sel.season ? 'on' : ''}" data-pick-season="${s.id}" aria-pressed="${s.id === sel.season}"><b>${esc(s.label)}</b><span>目標 ${speciesForSeason(s.id).map((x) => x.targetM).sort((a, b) => a - b).filter((v, i, a) => a.indexOf(v) === i).join('／')} 米</span><small>${s.days} 日</small></button>`,
  ).join('');
  const season = SEASONS.find((s) => s.id === sel.season)!;
  const cards = speciesForSeason(sel.season)
    .map(
      (sp) => `<button type="button" class="species ${sp.id === sel.species ? 'on' : ''}" data-species="${sp.id}" aria-pressed="${sp.id === sel.species}">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, sp.targetM * 100)}"></span>
        <b>${esc(sp.name)}</b><i>${esc(sp.scientific.split('（')[0]!)}</i>
        <small>紀錄 ${sp.maxM} 米・目標 ${sp.targetM} 米</small>
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
    <p class="fine">${esc(season.sub)}・${esc(chosen.name)}目標 ${chosen.targetM} 米・每日約 ${((chosen.targetM * 100) / season.days).toFixed(0)} 厘米</p>
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
  const tCm = speciesTargetCm(state.species);
  const beyond = state.heightCm > tCm ? `已經突破 ${esc(formatHeight(tCm))} 嘅目標！` : `目標係 ${esc(formatHeight(tCm))}。`;
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

/** v13: full-screen card the first time the tree reaches 青年樹. */
export function windExplainerModal(state: GameState): string {
  return `
    <div class="explainer">
      <p class="eyebrow">🌳 ${esc(state.treeName)}長成青年樹</p>
      <h2>由今日開始，風災會影響棵樹</h2>
      <ul class="explain-list">
        <li><b>加固解鎖</b><span>打木樁 +${PREPS.stakes.amount}、綁防風繩 +${PREPS.ropes.amount}、修枝防風 +${PREPS.prune.amount}，每樣每日一次（最多 ${R_MAX}）。</span></li>
        <li><b>抗風力開始生效</b><span>而家 ${Math.round(state.resist)}。每晚鬆少少（−${R_DAILY_DECAY}）；風災過後會消耗：初級颱風 18、狂風雷暴 25、高級颱風 35。</span></li>
        <li><b>風災會傷樹</b><span>傷害 = 基礎 × (1 − R/100)：初級颱風 30、狂風雷暴 35、高級颱風 60。抗風力越高，傷得越少；擋到七成半以上仲有生長 ×1.3。</span></li>
        <li><b>倒塌</b><span>風災嗰晚抗風力低過門檻（初級颱風 20、狂風雷暴 25、高級颱風 40）一定倒塌：主幹斷咗一截，高度 −20%。最多倒 2 次，第 3 次棵樹會死。倒塌後第二日加固雙倍。</span></li>
        <li><b>今晚預計會提你</b><span>有風災而抗風力唔夠，「今晚預計」會出倒塌警告。</span></li>
      </ul>
      <p class="fine">酷熱同暴雨照舊靠應急行動（酷熱澆水、暴雨疏水），抗風力幫唔到手。</p>
      <button type="button" class="primary" data-action="wind-explained">明白</button>
    </div>`;
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
      <p><b>點玩：</b>每晚 12 點結算：先計水分變化（每晚自然流失 −10；落雨日唔流失，毛毛雨仲 +10），再計健康 = 舊健康 + 水分分數 + 養分分數 + 熱／雨／風三類天氣分 + 應急獎勵 − 蟲害。</p>
      <p>水分 0–150：50–100 +5；低過 50 乾旱 −10；101–115 輕度爛根 −10；116–135 嚴重爛根 −20；136–149 根部壞死 −30；去到 150 即刻瀕死。養分 60 以上 +5、30–59 為 0、低過 30 −10。</p>
      <p>澆水每日 3 次、每次 +15，最多澆到 100（泥土飽和就唔使澆，唔會用咗次數）；疏水每日 3 次、每次 −10。酷熱警告一出水分即時 −20；暴雨／黑雨即時 +20（過咗 100 最多再加 10，同一日只計一次）。狀態卡「今晚預計」會話你今晚健康會點變。</p>
      <p>天氣跟住現實（香港用天文台警告）。熱、雨、風三類各自計，同一類只計最嚴重嗰個。酷熱：警告一出可以做「酷熱澆水」（額外一次，+5 水分），唔做 −10。暴雨／黑雨：可以做「暴雨疏水」（額外一次，−10 但唔低過 50），唔做 −10／−15。做咗應急行動 +3，兩樣都做 (3 + 3) × 0.75 = +4.5。</p>
      <p>風災（初級颱風、狂風雷暴、高級颱風）要棵樹長到青年樹先生效：之前抗風力唔變、風災唔傷樹。之後傷害 = 基礎 × (1 − R/100)，抗風力每晚 −2、風災再消耗；R 低過門檻（20／25／40）會倒塌：高度 −20%，最多倒 2 次，第 3 次會死（免死金牌可以擋一次）。倒塌後第二日加固雙倍。</p>
      <p>健康 80 以上長得最快（×1.5，有綠光）；健康跌到 0 或者水分去到 150 會瀕死 24 小時，將水分調返 50–100、養分 60 以上就救得返。</p>
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
  const target = speciesTargetCm(state.species);
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
