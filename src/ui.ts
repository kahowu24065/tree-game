import { ANIMALS, animalById, HYPERION_M, MILESTONES, SHERMAN_M, stageFor, stageProgress, STAGES } from './content';
import { addDays, daysBetween, formatLong, formatShort, weekdayIndex } from './dates';
import { drawAnimal } from './draw-animals';
import { ICONS, weatherArt, type IconName } from './icons';
import { advice, dayNumber, eventTitle, prepNeeded, prepScore, treeMetrics, upcomingStorm } from './sim';
import type { DayCond, ForecastDay, GameState, LogEntry, LogKind, TabId } from './types';
import { esc, formatHeight, percentOf } from './util';
import { classify, stormLabel, weatherLabel } from './weather';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export interface View {
  state: GameState;
  today: string;
  tab: TabId;
  place: string;
  placeNote: string;
  statusLine: string;
  cond: DayCond;
  forecast: ForecastDay[];
  night: boolean;
  debug: boolean;
}

function icon(name: IconName): string {
  return ICONS[name];
}

function short(cm: number): string {
  return formatHeight(cm);
}

/** Top-left weather card, top-right place pill, status card, height rail and dock. */
export function renderChrome(view: View): void {
  const { state, cond } = view;
  const storm = upcomingStorm(state, view.today);
  const tomorrow = view.forecast.find((d) => d.date === addDays(view.today, 1));
  const card = document.getElementById('weather-card');
  if (card) {
    const nowStorm = cond.stormKind;
    const soon = storm && daysBetween(view.today, storm.date) <= 2 ? storm : undefined;
    const severe = Boolean(nowStorm || soon);
    card.classList.toggle('severe', severe);
    card.classList.toggle('hot', !severe && cond.hot);
    const label = nowStorm ? stormLabel(nowStorm) : weatherLabel(cond.code);
    let line: string;
    if (soon) {
      const when = soon.date === view.today ? '今日' : soon.date === addDays(view.today, 1) ? '明日' : formatShort(soon.date);
      const score = prepScore(state.reinforcement);
      const need = prepNeeded(soon.kind);
      line = `<span class="warn-line">${icon('warn')}${when}${esc(stormLabel(soon.kind))} · ${score >= need ? '已經加固' : `記得加固 ${score}/${need}`}</span>`;
    } else if (nowStorm) {
      line = `<span class="warn-line">${icon('warn')}而家${esc(stormLabel(nowStorm))}，留意棵樹</span>`;
    } else if (tomorrow) {
      line = `預測：明日 ${Math.round(tomorrow.tempMin)}–${Math.round(tomorrow.tempMax)}°C ${esc(weatherLabel(tomorrow.code))}`;
    } else {
      line = esc(view.statusLine);
    }
    card.innerHTML = `
      <span class="wx-art">${weatherArt(cond.code, view.night, Boolean(nowStorm))}</span>
      <span class="wx-main"><b>${Math.round(cond.tempC)}°C</b><span>${esc(label)}</span></span>
      <span class="wx-line">${line}</span>`;
  }
  const pill = document.getElementById('place-pill');
  if (pill) pill.innerHTML = `${icon('pin')}<span>${esc(view.place)}</span>${view.placeNote ? `<small>${esc(view.placeNote)}</small>` : ''}${icon('chevronDown')}`;
  const gear = document.getElementById('gear');
  if (gear && !gear.innerHTML) gear.innerHTML = icon('gear');
  const close = document.getElementById('drawer-close');
  if (close && !close.innerHTML) close.innerHTML = icon('close');

  const status = document.getElementById('status-card');
  if (status) {
    const stage = stageFor(state.heightCm);
    const m = treeMetrics(state);
    const bugs = state.pests > 20 && !state.care.dewormed;
    status.innerHTML = `
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${icon('chevronRight')}</button>
      <p class="status-sub">${esc(state.treeName)} · ${esc(stage.name)} · 第 ${dayNumber(state, view.today)} 日</p>
      <dl class="stats">
        ${statRow('ruler', '高度', short(state.heightCm), 'green')}
        ${statRow('heart', '健康度', `${Math.round(state.health)}%`, state.health < 40 ? 'red' : 'green')}
        ${statRow('canopy', '樹冠', `${m.canopy}%`, 'green')}
        ${statRow('roots', '根系', `${m.roots}%`, 'brown')}
      </dl>
      <div class="mini-acts">
        <button type="button" class="mini ${bugs ? 'alert' : ''}" data-action="deworm" ${state.care.dewormed ? 'disabled' : ''}>${icon('bug')}<span>${state.care.dewormed ? '睇過喇' : bugs ? '有蟲！' : '捉蟲'}</span></button>
        <button type="button" class="mini" data-action="prune" ${state.care.pruned ? 'disabled' : ''}>${icon('scissors')}<span>${state.care.pruned ? '剪過喇' : '修剪'}</span></button>
      </div>`;
  }

  const rail = document.getElementById('rail');
  if (rail) {
    const stage = stageFor(state.heightCm);
    const idx = STAGES.indexOf(stage);
    const next = STAGES[idx + 1];
    const p = stageProgress(state.heightCm);
    rail.innerHTML = `
      <span class="rail-top ${p > 0.9 ? 'dim' : ''}"><small>${next ? `下一階段` : '終點'}</small><b>${esc(short(stage.nextCm))}</b>${next ? `<small>${esc(next.name)}</small>` : '<small>海波龍</small>'}</span>
      <span class="rail-track"><span class="rail-fill" style="height:${(p * 100).toFixed(1)}%"></span><span class="rail-marker" style="bottom:${(p * 100).toFixed(1)}%"><b>${esc(short(state.heightCm))}</b><small>當前</small></span></span>
      <span class="rail-bottom ${p < 0.14 ? 'dim' : ''}"><b>${esc(short(stage.minCm))}</b><small>${esc(stage.name)}</small></span>`;
  }

  const dock = document.getElementById('dock');
  if (dock) {
    const rainBlocks = cond.raining;
    const prepShort = storm ? prepScore(state.reinforcement) < prepNeeded(storm.kind) : false;
    const freshAnimals = state.animals.filter((id) => !state.seenAnimals.includes(id)).length;
    dock.innerHTML = `
      ${dockBtn('d-water', 'data-action="water"', 'drop', '澆水', rainBlocks ? '落緊雨' : state.care.watered ? '澆過喇' : '', state.care.watered || rainBlocks)}
      ${dockBtn('d-feed', 'data-action="fertilize"', 'sprout', '施肥', state.care.fertilized ? '施過喇' : '', state.care.fertilized)}
      ${dockBtn('d-guard', 'data-open="forecast"', 'shield', '加固', prepShort ? '風暴將至' : '', false, prepShort ? '!' : '')}
      ${dockBtn('d-album', 'data-open="album"', 'book', '圖鑑', `${state.animals.length}/${ANIMALS.length}`, false, freshAnimals ? String(freshAnimals) : '')}`;
  }

  const slot = document.getElementById('note-slot');
  if (slot) {
    const html = state.started && state.morningNote ? `<article class="glass note-card"><p>${esc(state.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>` : '';
    if (slot.innerHTML !== html) slot.innerHTML = html;
  }
  document.body.classList.toggle('night', view.night);
  document.getElementById('scene')?.setAttribute('aria-label', `${state.treeName}，${weatherLabel(cond.code)}，高 ${formatHeight(state.heightCm)}`);
  document.title = `${state.treeName} · 一日一樹`;
}

function statRow(ic: IconName, label: string, value: string, tone: string): string {
  return `<div class="stat ${tone}"><dt>${icon(ic)}${label}</dt><dd>${esc(value)}</dd></div>`;
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
  deworm: { icon: 'bug', tone: 'orange', title: '已捉蟲' },
  prune: { icon: 'scissors', tone: 'green', title: '已修剪' },
  reinforce: { icon: 'shield', tone: 'orange', title: '已加固' },
  animal: { icon: 'bird', tone: 'purple', title: '新朋友來訪' },
  stage: { icon: 'arrowUp', tone: 'blue', title: '進入新階段' },
  'storm-safe': { icon: 'shield', tone: 'green', title: '安然度過風暴' },
  'storm-partial': { icon: 'wind', tone: 'orange', title: '風暴輕傷' },
  'storm-hit': { icon: 'warn', tone: 'red', title: '風暴受損' },
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
    ['milestones', '里程'],
  ];
  return `<nav class="tabs" role="tablist">${items
    .map(
      ([id, label]) =>
        `<button type="button" role="tab" data-tab="${id}" class="${id === active ? 'on' : ''}" aria-selected="${id === active}">${label}</button>`,
    )
    .join('')}</nav>`;
}

function body(view: View): string {
  if (!view.state.started) {
    return `<div class="card quiet"><p>先替棵樹起個名，然後每日望一望。</p></div>`;
  }
  switch (view.tab) {
    case 'forecast':
      return forecastTab(view);
    case 'album':
      return albumTab(view);
    case 'milestones':
      return milestoneTab(view);
    default:
      return careTab(view);
  }
}

function careTab(view: View): string {
  const { state, cond } = view;
  const event = eventTitle(state);
  const storm = upcomingStorm(state, view.today);
  const todayForecast = view.forecast.find((day) => day.date === view.today);
  const hint =
    !storm && todayForecast && todayForecast.precipMm >= 8 && !cond.raining
      ? '今日可能有雨，可以遲啲先澆。而家澆咗都得。'
      : advice(state, cond, storm);
  const rainBlocks = cond.raining;
  return `
    <article class="card event">
      <p class="eyebrow">今日小事</p>
      <h2>${esc(event.title)}</h2>
      <p>${esc(event.text)}</p>
    </article>
    <div class="meters">
      ${meter('健康', state.health, 'health')}
      ${meter('水分', state.moisture, 'water')}
      ${meter('養分', state.nutrients, 'food')}
      ${meter('害蟲', state.pests, 'pest', true)}
    </div>
    <p class="advice">${esc(hint)}</p>
    <div class="actions">
      ${actionBtn('water', 'drop', 'blue', '澆水', rainBlocks ? '落緊雨' : state.care.watered ? '澆過喇' : '每日一次', state.care.watered || rainBlocks)}
      ${actionBtn('fertilize', 'sprout', 'green', '施肥', state.care.fertilized ? '施過喇' : '每日一次', state.care.fertilized)}
      ${actionBtn('deworm', 'bug', 'orange', '捉蟲', state.care.dewormed ? '睇過喇' : state.pests > 20 ? '有蟲' : '睇睇', state.care.dewormed)}
      ${actionBtn('prune', 'scissors', 'purple', '修剪', state.care.pruned ? '剪過喇' : state.scars ? '可修斷枝' : '每日一次', state.care.pruned)}
    </div>
    <p class="fine">用心照顧過 ${state.daysCared} 日。進度只係留喺呢部機。</p>
  `;
}

function actionBtn(action: string, ic: IconName, tone: string, label: string, sub: string, disabled: boolean): string {
  return `<button type="button" class="act ${tone} ${disabled ? 'done' : ''}" data-action="${action}" ${disabled ? 'disabled' : ''}>
    <span class="act-ic">${icon(ic)}</span><span>${label}</span><small>${sub}</small>
  </button>`;
}

function meter(label: string, value: number, kind: string, inverse = false): string {
  const shown = Math.round(Math.max(0, Math.min(100, value)));
  return `<div class="meter">
    <div class="meter-top"><span>${label}</span><span>${shown}</span></div>
    <div class="track"><div class="fill ${kind} ${inverse && shown > 60 ? 'bad' : ''}" style="width:${shown}%"></div></div>
  </div>`;
}

function forecastTab(view: View): string {
  const storms = view.state.storms
    .filter((s) => !s.resolved && s.date >= view.today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = storms[0];
  const score = prepScore(view.state.reinforcement);
  const preps = `<div class="preps">
      ${prepBtn('stakes', '打木樁', '撐住樹幹', view.state.reinforcement.stakes)}
      ${prepBtn('ropes', '綁防風繩', '拉住主枝', view.state.reinforcement.ropes)}
      ${prepBtn('prune', '修枝防風', '剪走易斷的弱枝', view.state.reinforcement.prune)}
    </div>`;
  const warn = next
    ? `<article class="card warn">
        <p class="eyebrow">${icon('warn')}風暴準備</p>
        <h2>${esc(formatLong(next.date))} · ${esc(stormLabel(next.kind))}</h2>
        <p>${next.date === view.today ? '今日就係嗰日，而家加固都仲趕得切，聽日先結算。' : '趁未到先準備。'}打樁、綁繩、修枝，做齊就最穩陣。颱風最好三樣都做，強風兩樣，暴雨一樣都有用。而家 ${score}/3。</p>
        ${preps}
      </article>`
    : `<article class="card">
        <p class="eyebrow">加固</p>
        <p>未來幾日未見需要加固的大風或暴雨。想預早準備都得，加固會一直保留到下一場風暴。而家 ${score}/3。</p>
        ${preps}
      </article>`;
  const rows = view.forecast
    .map((day) => {
      const severity = classify({ precipMm: day.precipMm, gustKmh: day.gustKmh, windKmh: day.windKmh, tempMax: day.tempMax });
      const tags = [
        severity.typhoon ? '<span class="tag typhoon">颱風</span>' : '',
        severity.gale ? '<span class="tag wind">強風</span>' : '',
        severity.heavyRain && !severity.typhoon ? '<span class="tag rain">暴雨</span>' : '',
        severity.heat ? '<span class="tag heat">酷熱</span>' : '',
      ].join('');
      const klass = severity.typhoon ? 'danger' : severity.stormKind || severity.heat ? 'warn' : '';
      const today = day.date === view.today ? ' today' : '';
      return `<article class="day ${klass}${today}">
        <span class="day-art">${weatherArt(day.code, false, Boolean(severity.stormKind && severity.typhoon))}</span>
        <div><strong>${day.date === view.today ? '今日' : `星期${WEEK[weekdayIndex(day.date)] ?? ''}`}</strong><span>${esc(formatShort(day.date))}</span></div>
        <div><b>${esc(weatherLabel(day.code))}</b><span>${Math.round(day.tempMin)}–${Math.round(day.tempMax)}° · 雨 ${Math.round(day.precipMm)} 毫米 · 陣風 ${Math.round(day.gustKmh)}</span></div>
        <div class="tags">${tags}</div>
      </article>`;
    })
    .join('');
  const history = view.state.storms
    .filter((s) => s.resolved)
    .slice(-3)
    .reverse()
    .map((s) => `<li>${esc(formatShort(s.date))} ${esc(stormLabel(s.kind))} · ${s.outcome === 'safe' ? '捱過並有獎' : s.outcome === 'partial' ? '輕傷' : '受損'}</li>`)
    .join('');
  return `
    ${warn}
    <p class="status">${esc(view.statusLine)}</p>
    <div class="days">${rows}</div>
    ${history ? `<h3 class="sub">風暴紀錄</h3><ul class="log">${history}</ul>` : ''}
    <p class="fine">遊戲根據雨量同風速自己判斷，唔係香港天文台的正式警告。暴雨：日雨量 25 毫米或以上。強風：陣風 62 km/h 或持續風 41 km/h 或以上。颱風級：陣風 118 km/h 或持續風 63 km/h 或以上。酷熱：最高 33°C 或以上。</p>
    <button type="button" class="texty" data-action="locate">用我所在位置更新天氣</button>
  `;
}

function prepBtn(key: string, label: string, sub: string, on: boolean): string {
  return `<button type="button" class="prep ${on ? 'on' : ''}" data-prep="${key}" aria-pressed="${on}"><span>${label}</span><small>${on ? '已準備' : sub}</small></button>`;
}

function albumTab(view: View): string {
  const unlocked = view.state.animals.length;
  const cards = ANIMALS.map((animal) => {
    const have = view.state.animals.includes(animal.id);
    const fresh = have && !view.state.seenAnimals.includes(animal.id);
    return `<button type="button" class="creature ${have ? '' : 'locked'}" data-seen="${animal.id}">
      <span class="thumb" data-animal="${animal.id}" data-locked="${have ? '0' : '1'}"></span>
      <strong>${esc(animal.name)}${fresh ? '<em>新</em>' : ''}</strong>
      <span>${have ? esc(animal.epithet) : esc(animal.hint)}</span>
      <small>${have ? esc(animal.about) : '未搬進來'}</small>
    </button>`;
  }).join('');
  const away = view.state.health < 22 ? `<p class="advice">樹太攰，動物暫時避開咗。好返之後佢哋會返來。</p>` : '';
  return `<p class="status">圖鑑 ${unlocked} / ${ANIMALS.length}</p>${away}<div class="album">${cards}</div>`;
}

function milestoneTab(view: View): string {
  const meters = view.state.heightCm / 100;
  const next = MILESTONES.find((m) => meters < m.meters);
  const prevM = [...MILESTONES].reverse().find((m) => meters >= m.meters)?.meters ?? 0;
  const span = next ? next.meters - prevM : 1;
  const pct = next ? Math.max(0, Math.min(100, ((meters - prevM) / span) * 100)) : 100;
  const goal = meters >= HYPERION_M ? '你嘅樹已經高過已知最高的海波龍。' : `距離海波龍仲有 ${(HYPERION_M - meters).toFixed(1)} 米。`;
  const rows = MILESTONES.map((m) => {
    const done = meters >= m.meters;
    return `<li class="${done ? 'done' : ''}"><strong>${esc(m.title)}</strong><span>${m.meters >= 1 ? `${m.meters} 米` : `${Math.round(m.meters * 100)} 厘米`}</span><p>${esc(m.detail)}</p></li>`;
  }).join('');
  return `
    <article class="card">
      <p class="eyebrow">世界最大的樹</p>
      <h2>${esc(formatHeight(view.state.heightCm))}</h2>
      <p>大約係將軍樹高度的 ${esc(percentOf(meters, SHERMAN_M))}%。將軍樹高 ${SHERMAN_M} 米，以體積計係世界上最大的樹。已知最高的海波龍約 ${HYPERION_M} 米。</p>
      <p>${esc(goal)}</p>
      ${next ? `<p class="next">下一個：${esc(next.title)}（${next.meters} 米）</p><div class="track fat"><div class="fill food" style="width:${pct.toFixed(1)}%"></div></div>` : '<p class="next">里程都到齊。</p>'}
    </article>
    <ol class="miles">${rows}</ol>
    <button type="button" class="texty" data-action="rename">改棵樹的名</button>
  `;
}

type Thumbnailer = (id: string, unlocked: boolean) => string | null;
let thumbnailer: Thumbnailer | null = null;

export function setThumbnailer(fn: Thumbnailer | null): void {
  thumbnailer = fn;
}

export function paintThumbs(): void {
  document.querySelectorAll<HTMLElement>('.thumb[data-animal]').forEach((el) => {
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
}

/* ---------- Toast, modals, debug ---------- */

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
  const field = modal.querySelector('input');
  if (field instanceof HTMLInputElement) {
    field.focus();
    field.select();
  } else {
    modal.querySelector('button')?.focus();
  }
}

export function closeModal(): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.hidden = true;
  modal.innerHTML = '';
}

export function nameModal(current: string, rename = false): string {
  return `
    <p class="eyebrow">一日一樹</p>
    <h2>${rename ? '改個名' : '替棵樹起個名'}</h2>
    <p>${rename ? '新名字會由今日開始叫。' : '每日幾分鐘就得。天氣跟住你現實的天空；預報話有大風雨，可以先打樁綁繩。'}</p>
    <label>樹的名字<input id="tree-name" maxlength="12" value="${esc(current)}" autocomplete="off" /></label>
    <button type="button" class="primary" data-action="start">${rename ? '保存' : '開始照顧'}</button>
  `;
}

export function stormModal(message: string): string {
  return `
    <p class="eyebrow">風暴之後</p>
    <h2>天色慢慢靜落嚟</h2>
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
      <p><b>點玩：</b>每日澆水、施肥，有蟲就捉，偶爾修剪。天氣跟住現實；預報話有颱風、強風或暴雨，就去「加固」打樁、綁繩、修枝。</p>
      <p>樹越高，鏡頭會慢慢升高拉遠。可以喺空白位置輕輕拖動轉個角度。</p>
      <p>點狀態卡睇詳細同全部照顧動作，點右邊高度尺睇里程，點天氣卡睇一星期預報。</p>
    </div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `;
}

export function mountDebug(root: HTMLElement): void {
  root.hidden = false;
  root.innerHTML = `
    <details class="debug">
      <summary>測試</summary>
      <div class="debug-card">
        <p>隱藏工具，用來示範天氣同風暴。網址要有 <code>?debug=1</code>。</p>
        <div class="debug-grid">
          <button type="button" data-debug="scene-auto">真實天氣</button>
          <button type="button" data-debug="scene-clear">晴</button>
          <button type="button" data-debug="scene-rain">小雨</button>
          <button type="button" data-debug="scene-heat">酷熱</button>
          <button type="button" data-debug="scene-heavyrain">暴雨</button>
          <button type="button" data-debug="scene-gale">強風</button>
          <button type="button" data-debug="scene-typhoon">颱風場景</button>
          <button type="button" data-debug="time-auto">真實時間</button>
          <button type="button" data-debug="time-day">強制日間</button>
          <button type="button" data-debug="time-night">強制夜間</button>
          <button type="button" data-debug="storm-tomorrow-typhoon">聽日颱風</button>
          <button type="button" data-debug="storm-tomorrow-rain">聽日暴雨</button>
          <button type="button" data-debug="storm-tomorrow-gale">聽日強風</button>
          <button type="button" data-debug="storm-today-typhoon">今日颱風可結算</button>
          <button type="button" data-debug="advance">快進一日</button>
          <button type="button" data-debug="jump">長到下一階段</button>
          <button type="button" data-debug="clear-storms">清除測試風暴</button>
          <button type="button" data-debug="real-date">回到真日期</button>
          <button type="button" data-debug="reset">重置遊戲</button>
        </div>
      </div>
    </details>
  `;
}

export function animalName(id: string): string {
  return animalById(id)?.name ?? id;
}
