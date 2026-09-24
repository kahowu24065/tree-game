import { ANIMALS, animalById, HYPERION_M, MILESTONES, SHERMAN_M, stageFor } from './content';
import { formatLong, formatShort, weekdayIndex } from './dates';
import { drawAnimal } from './draw-animals';
import { advice, dayNumber, eventTitle, prepScore, upcomingStorm } from './sim';
import type { DayCond, ForecastDay, GameState, TabId } from './types';
import { esc, formatHeight, percentOf } from './util';
import { classify, stormLabel, weatherLabel, windWords } from './weather';

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

export function renderChrome(view: View): void {
  const title = document.getElementById('tree-title');
  const chip = document.getElementById('weather-chip');
  const caption = document.getElementById('scene-caption');
  const meta = document.getElementById('scene-meta');
  const wrap = document.getElementById('scene-wrap');
  const canvas = document.getElementById('scene');
  if (title) title.textContent = view.state.treeName;
  if (chip) chip.textContent = `${view.place}${view.placeNote ? ` · ${view.placeNote}` : ''}  ${Math.round(view.cond.tempC)}°`;
  if (caption) {
    const bits = [weatherLabel(view.cond.code), `${Math.round(view.cond.tempC)}°`, windWords(view.cond.windKmh)];
    if (view.cond.stormKind) bits.unshift(stormLabel(view.cond.stormKind));
    caption.textContent = bits.join(' · ');
  }
  if (meta) {
    const stage = stageFor(view.state.heightCm);
    meta.textContent = `第 ${dayNumber(view.state, view.today)} 日 · ${stage.name} · ${formatHeight(view.state.heightCm)}`;
  }
  wrap?.classList.toggle('night', view.night);
  canvas?.setAttribute('aria-label', `${view.state.treeName}，${weatherLabel(view.cond.code)}，高 ${formatHeight(view.state.heightCm)}`);
  document.title = `${view.state.treeName} · 一日一樹`;
}

export function renderPanel(view: View): void {
  const panel = document.getElementById('panel');
  if (!panel) return;
  const scroll = panel.scrollTop;
  panel.innerHTML = `${tabs(view.tab)}${body(view)}`;
  panel.scrollTop = scroll;
  paintThumbs();
}

function tabs(active: TabId): string {
  const items: [TabId, string][] = [
    ['care', '照顧'],
    ['forecast', '預報'],
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
    ${state.morningNote ? `<article class="card note"><p>${esc(state.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>` : ''}
    <div class="meters">
      ${meter('健康', state.health, 'health')}
      ${meter('水分', state.moisture, 'water')}
      ${meter('養分', state.nutrients, 'food')}
      ${meter('害蟲', state.pests, 'pest', true)}
    </div>
    <p class="advice">${esc(hint)}</p>
    <div class="actions">
      ${actionBtn('water', '澆水', rainBlocks ? '落緊雨' : state.care.watered ? '澆過喇' : '每日一次', state.care.watered || rainBlocks)}
      ${actionBtn('fertilize', '施肥', state.care.fertilized ? '施過喇' : '每日一次', state.care.fertilized)}
      ${actionBtn('deworm', '除蟲', state.care.dewormed ? '睇過喇' : state.pests > 20 ? '有蟲' : '睇睇', state.care.dewormed)}
      ${actionBtn('prune', '修剪', state.care.pruned ? '剪過喇' : state.scars ? '可修斷枝' : '每日一次', state.care.pruned)}
    </div>
    <p class="fine">用心照顧過 ${state.daysCared} 日。進度只係留喺呢部機。</p>
    ${logList(state)}
  `;
}

function actionBtn(action: string, label: string, sub: string, disabled: boolean): string {
  return `<button type="button" class="act ${disabled ? 'done' : ''}" data-action="${action}" ${disabled ? 'disabled' : ''}>
    <span>${label}</span><small>${sub}</small>
  </button>`;
}

function meter(label: string, value: number, kind: string, inverse = false): string {
  const shown = Math.round(clampShown(value));
  return `<div class="meter">
    <div class="meter-top"><span>${label}</span><span>${shown}</span></div>
    <div class="track"><div class="fill ${kind} ${inverse && shown > 60 ? 'bad' : ''}" style="width:${shown}%"></div></div>
  </div>`;
}

function clampShown(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function logList(state: GameState): string {
  if (!state.log.length) return '';
  const rows = state.log
    .slice(0, 4)
    .map((entry) => `<li><span>${esc(formatShort(entry.date))}</span>${esc(entry.text)}</li>`)
    .join('');
  return `<ul class="log">${rows}</ul>`;
}

function forecastTab(view: View): string {
  const storms = view.state.storms
    .filter((s) => !s.resolved && s.date >= view.today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = storms[0];
  const score = prepScore(view.state.reinforcement);
  const warn = next
    ? `<article class="card warn">
        <p class="eyebrow">風暴準備</p>
        <h2>${esc(formatLong(next.date))} · ${esc(stormLabel(next.kind))}</h2>
        <p>${next.date === view.today ? '今日就係嗰日，而家加固都仲趕得切，聽日先結算。' : '趁未到先準備。'}打樁、綁繩、修枝，做齊就最穩陣。颱風最好三樣都做，強風兩樣，暴雨一樣都有用。而家 ${score}/3。</p>
        <div class="preps">
          ${prepBtn('stakes', '打木樁', '撐住樹幹', view.state.reinforcement.stakes)}
          ${prepBtn('ropes', '綁防風繩', '拉住主枝', view.state.reinforcement.ropes)}
          ${prepBtn('prune', '修枝防風', '剪走易斷的弱枝', view.state.reinforcement.prune)}
        </div>
      </article>`
    : `<article class="card quiet"><p>未來幾日未見需要加固的大風或暴雨。平靜的日子，顧好水分同害蟲就得。</p></article>`;
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
        <div><strong>${day.date === view.today ? '今日' : WEEK[weekdayIndex(day.date)] ?? ''}</strong><span>${esc(formatShort(day.date))}</span></div>
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
      <canvas data-animal="${animal.id}" data-locked="${have ? '0' : '1'}" width="120" height="84"></canvas>
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

export function paintThumbs(): void {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-animal]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const id = canvas.dataset.animal;
    if (!ctx || !id) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAnimal(ctx, id, 60, 48, 1200, { scale: 1.35, silhouette: canvas.dataset.locked === '1', night: id === 'owl' || id === 'firefly' });
  });
}

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
  modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${inner}</div>`;
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
