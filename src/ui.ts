import { BADGES, CARE, COLLAPSE_MAX, EMERGENCY, H_MULT_TIERS, N_DAILY_USE, N_FACTOR, N_MALNOURISHED, N_OPTIMAL, PREPS, R_DAILY_DECAY, R_MAX, AGE_MILESTONES, MILESTONE_TIER_LABEL, RECORD_MILESTONE, START, W_MAX, W_NIGHT_LOSS, W_OPTIMAL, W_SATURATED, W_TIERS, WEATHER_EVENTS, WX_CATEGORY_LABEL, WX_TRACKS, nextWxAwardCount, parseWxAwardId, wxAwardId, type PrepId, type WeatherEventId } from './balance';
import { coachTasks, type Coach } from './coach';
import { ISLE_AWARDS } from './grove';
import { ANIMALS, animalById, HYPERION_M, MILESTONES, SHERMAN_M, stageFor, stageProgress, stagesFor } from './content';
import { CATEGORY_LABEL, CATEGORY_ORDER, unlockHint } from './data/animals';
import { FEATURE_LABEL, habitatDef } from './data/habitat';
import { SPECIES, STAGE_NAMES, realAgeDays, speciesDef, speciesTargetCm, stageSampleCm, type SpeciesId } from './data/species';
import { formatLong, formatShort, weekdayIndex } from './dates';
import { soundEnabled } from './audio';
import { drawAnimal } from './draw-animals';
import { hkoWarningEvents, type Countdown } from './events';
import { ICONS, weatherArt, type IconName } from './icons';
import { warningDisplay, type HkoWarning } from './hko';
import { baseDailyGrowth, carbonKg, emergencyBonusText, expectedShare, pickEvent } from './rules';
import { emergencyName, eventLabel, regionalize, weatherAchievementCopy, weatherTrackCopy } from './labels';
import { nestAwardTitle, nestBuildAt, nestBuildPhrase, nestBuilds, nestHatchAt, nextNestAwardCount, nextNestBuildCount, nextNestHeightCount } from './nest';
import { actionLimit, advice, doubleRActive, emergencyOptions, eventTitle, nextMilestone, prepAmount, recordShare, shownAge, type NightPlan } from './sim';
import type { DayCond, ForecastDay, GameState, LogEntry, LogKind, MetaState, MilestoneAward, TabId, WeatherAward } from './types';
import { esc, formatHeight, percentOf } from './util';
import { dayLabel, nightLabel, weatherLabel, type WeatherProvider } from './weather';
import { APP_VERSION } from './version';

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
  /** Events in force right now (live warnings, or the manual selection). The card tint follows these, not the whole day. */
  nowEvents: WeatherEventId[];
  todayEvent: WeatherEventId;
  /** v12 今晚預計: the same NightPlan the nightly settlement will use. */
  preview: NightPlan;
  /** Second island: bare means it is unlocked and still empty. */
  isle: { here: 0 | 1; bare: boolean; open: boolean };
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
  /** Which bureau the warnings came from. Macau uses SMG, Taiwan CWA; absent means HKO when hkoUsed. */
  bureau?: 'hko' | 'smg' | 'cwa';
  warnings: HkoWarning[];
  /** False when the bureau warning list failed to load. Missing means the list is known. */
  warningsKnown?: boolean;
  messages: string[];
  situation: string;
  hkoDays: Record<string, string>;
  conditionText?: string;
  nowIcon?: number;
  station?: string;
  /** False when a bureau snapshot has a forecast but no live reading. Missing means the reading is real. */
  reading?: boolean;
  humidity?: number;
  rainInHours: number | null;
  error?: string;
  overridden: boolean;
}

function icon(name: IconName): string {
  return ICONS[name];
}

/** Event definition with the v15 regional label / tip (烈風、暴風、大雨、豪雨 outside HK). */
const ev = (id: WeatherEventId) => ({ ...WEATHER_EVENTS[id], label: eventLabel(id), tip: regionalize(WEATHER_EVENTS[id].tip) });

function hoursText(h: number): string {
  if (h <= 0) return '生效中';
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} 分鐘後`;
  return `約 ${Math.round(h)} 小時後`;
}

function hm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)} 小時 ${String(m % 60).padStart(2, '0')} 分`;
}

/** v16: the game clock (developer day skips run ahead of the wall clock) — the 瀕死 countdown uses it. */
let uiNow = () => Date.now();
export function setUiClock(fn: () => number): void {
  uiNow = fn;
}

export function dyingLeftMs(state: GameState): number {
  return state.dying ? state.dying.at + 24 * 3600 * 1000 - uiNow() : 0;
}

/** v12 water side effect of an event, in words. */
function waterText(id: WeatherEventId, short = false): string {
  if (id === 'hot') return short ? 'W 即時 −20' : '警告一出水分即時 −20';
  if (id === 'rainstorm') return short ? 'W 即時 +20' : '警告一出水分即時 +20（過 100 最多 +10），當晚冇流失';
  if (id === 'blackrain') return regionalize(short ? 'W 即時 +20（同暴雨共用）' : '水分即時 +20（同暴雨一日只計一次，過 100 最多 +10），當晚冇流失');
  if (id === 'cold') return short ? 'W 每日 −10' : '水分唔受影響，照常每日慢慢 −10';
  if (id === 'drizzle') return short ? 'W 即時 +10' : '一落雨水分即時 +10（過 100 最多 +5），當晚冇流失';
  if (id === 'clear') return short ? 'W 每日 −10' : '水分全日慢慢自然流失，每日 −10';
  return short ? 'W 每日 −10' : '水分照常每日慢慢 −10';
}

/** v13 health effect of an event, in words (熱／雨: 應急行動 cancels it; 風: × (1 − R/100), 青年樹 onwards). */
function damageText(id: WeatherEventId, unlocked: boolean): string {
  const d = ev(id);
  if (!d.damage) return '冇傷害';
  if (d.category === 'heat') return `健康 −${d.damage}（做酷熱澆水就唔扣）`;
  if (d.category === 'cold') return `健康 −${d.damage}（做保暖：樹根周圍鋪覆蓋物保持土溫，防止根部凍傷，就唔扣）`;
  if (d.category === 'rain') return `健康 −${d.damage}（做${emergencyName('rainDrain')}就唔扣）`;
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
    p.water.kind === 'loss' ? `而家 ${fmt(p.wBefore)}，到今晚再流失 ${signed(p.water.delta)}` : p.water.kind === 'drizzle' ? `而家 ${fmt(p.wBefore)}，毛毛雨 ${signed(p.water.delta)}，冇流失` : `而家 ${fmt(p.wBefore)}，落雨日冇流失`;
  const lines: { text: string; value: string; tone: string; sub?: string }[] = [
    { text: `水分 ${fmt(p.wAfter)}｜${p.waterDeath ? '根部浸死' : p.wLabel}`, value: p.waterDeath ? '瀕死' : signed(p.wScore), tone: p.waterDeath ? 'down' : tone(p.wScore), sub: waterSub },
    { text: `養分 ${fmt(p.nAfter)}｜${nLabel(p.nScore)}`, value: signed(p.nScore), tone: tone(p.nScore), sub: `每日用 10（全日慢慢扣）${p.residentN ? `，長駐動物 +${p.residentN}` : ''}` },
  ];
  if (p.heat) lines.push(p.heat.handled ? { text: `熱｜${eventLabel('hot')}：已應對`, value: '0', tone: 'flat', sub: '做咗酷熱澆水' } : { text: `熱｜${eventLabel('hot')}`, value: signed(p.heat.score), tone: 'down', sub: '做「酷熱澆水」就唔扣' });
  if (p.cold) lines.push(p.cold.handled ? { text: '寒｜寒冷：已應對', value: '0', tone: 'flat', sub: '做咗保暖' } : { text: '寒｜寒冷', value: signed(p.cold.score), tone: 'down', sub: '做「保暖」就唔扣' });
  if (p.rain) {
    const label = ev(p.rain.event).label;
    const fix = emergencyName('rainDrain');
    lines.push(p.rain.handled ? { text: `雨｜${label}：已應對`, value: '0', tone: 'flat', sub: `做咗${fix}` } : { text: `雨｜${label}`, value: signed(p.rain.score), tone: 'down', sub: `做「${fix}」就唔扣` });
  }
  if (p.wind) {
    const label = ev(p.wind.event).label;
    lines.push(
      p.wind.locked
        ? { text: `風｜${label}`, value: '0', tone: 'flat', sub: '青年樹前唔受風災影響' }
        : { text: `風｜${label}（抗風力 ${Math.round(p.wind.r)}）`, value: signed(p.wind.score), tone: tone(p.wind.score), sub: `基礎 ${p.wind.base} × (1 − ${Math.round(p.wind.r)}/100)` },
    );
  }
  if (!p.heat && !p.cold && !p.rain && !p.wind) lines.push({ text: `天氣：${ev(p.event).label}`, value: '0', tone: 'flat' });
  if (p.emergencyBonus)
    lines.push({
      text: p.emergencyCount > 1 ? `應急獎勵 ${emergencyBonusText(p.emergencyCount).replace(/ = .*$/, '')}` : '應急獎勵',
      value: signed(p.emergencyBonus),
      tone: 'up',
      sub: p.emergencyCount > 1 ? `${p.emergencyCount} 樣應急行動都做咗` : '應急行動做得啱時',
    });
  if (p.pest) lines.push({ text: '蟲害', value: signed(-p.pest), tone: 'down' });
  return lines;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** v14 今晚預計 growth line (same GrowthPlan settleDay applies): 「今晚生長 +29.8 厘米（基本 29.8 × 健康 ×1 × 天氣 ×1）」. */
export function previewGrowthText(p: NightPlan): string {
  const g = p.growth;
  const dG = r1(g.grownCm - g.heightBefore);
  const head = `今晚生長 ${dG > 0 ? '+' : dG < 0 ? M : '±'}${fmt(Math.abs(dG))} 厘米（基本 ${fmt(g.base)}${g.floor ? ' 最低' : ''} × 健康 ×${g.mult} × 天氣 ×${g.bonus}）`;
  const tail = p.collapse && g.heightAfter !== g.grownCm ? `，倒塌後 ${formatHeight(g.heightAfter)}` : ` → ${formatHeight(g.grownCm)}`;
  return head + tail;
}

/** v14 「樹齡 12 日 · 下個里程碑：1個月」. */
export function ageText(state: GameState): string {
  const next = nextMilestone(state);
  return `樹齡 ${shownAge(state)} 日${next ? ` · 下個里程碑：${next.label}` : ''}`;
}

/** v14 % of 紀錄高度 (can pass 100%). */
export function recordPct(state: GameState): number {
  return Math.round(recordShare(state) * 100);
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
        <p class="fine night-growth">${esc(previewGrowthText(p))}</p>
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

/** v16.1 note stack: one card at a time. */
export interface NoteCard {
  key: 'dying' | 'collapse' | 'note';
  cls: string;
  /** Title HTML; `.nc-long` parts are hidden on narrow phones. */
  title: string;
  body: string;
  btns: string;
}

/** 瀕死 countdown for the one-line card title (HH:MM, rounded down). */
export function clockLeft(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Remaining incubation as HH:MM:SS (v1.4.16, rounded up to the second). Null when no egg is still waiting to hatch. */
export function hatchClockText(state: GameState): string | null {
  if (!state.started || state.over) return null;
  const at = nestHatchAt(state);
  if (at == null) return null;
  const sec = Math.max(0, Math.ceil((at - uiNow()) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;
}

// v1.4.16: the card ticks once a second on its own timer, aligned to the next whole second. Only one timer ever
// exists; it stops when the card is hidden (hatched / no egg), the page is hidden, or the card leaves the DOM.
let hatchState: GameState | null = null;
let hatchTimer: ReturnType<typeof setTimeout> | null = null;

function stopHatchTick(): void {
  if (hatchTimer !== null) clearTimeout(hatchTimer);
  hatchTimer = null;
}

function scheduleHatchTick(): void {
  if (hatchTimer !== null) return;
  const at = hatchState ? nestHatchAt(hatchState) : null;
  const msToNext = at == null ? 1000 : ((at - uiNow()) % 1000 + 1000) % 1000 || 1000;
  hatchTimer = setTimeout(() => {
    hatchTimer = null;
    if (hatchState) syncHatchCard(hatchState);
  }, msToNext + 5);
}

/** The card under the weather card. Hidden once the egg has hatched or there is none. */
export function syncHatchCard(state: GameState): void {
  hatchState = state;
  const el = document.getElementById('hatch-card');
  if (!el) {
    stopHatchTick();
    return;
  }
  const text = hatchClockText(state);
  el.hidden = text == null;
  if (text) setHtml(el, `孵蛋時間：<b>${text}</b>`);
  if (text == null || document.hidden) stopHatchTick();
  else scheduleHatchTick();
}

if (typeof document !== 'undefined')
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHatchTick();
    else if (hatchState) syncHatchCard(hatchState);
  });

/** The note cards to show, most urgent first: 瀕死 > 倒塌 (double R day) > the morning note. */
export function noteCards(state: GameState, dyingLeft: number): NoteCard[] {
  const out: NoteCard[] = [];
  if (!state.started) return out;
  if (state.dying && !state.over) {
    out.push({
      key: 'dying',
      cls: 'dying',
      title: `瀕死<span class="nc-long">・剩</span> ${clockLeft(dyingLeft)}`,
      body: `將水分調到 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上即刻救返（剩 ${esc(hm(Math.max(0, Math.floor(dyingLeft / 60000))))}）。`,
      btns: `<button type="button" data-open="care">去救</button>`,
    });
  }
  if (!state.over && state.windUnlocked && doubleRActive(state) && !state.doubleRSeen) {
    out.push({
      key: 'collapse',
      cls: 'double-r',
      title: '🪵 昨晚倒塌咗',
      body: `今日加固效果雙倍：打木樁 +${PREPS.stakes.amount * 2}、綁防風繩 +${PREPS.ropes.amount * 2}、修枝防風 +${PREPS.prune.amount * 2}（最多 ${R_MAX}）。${esc(collapseText(state))}。`,
      btns: `<button type="button" data-open="care" data-focus="guard">去加固</button><button type="button" data-action="dismiss-double">知道喇</button>`,
    });
  }
  if (state.morningNote) {
    const summary = state.morningNote.startsWith('昨日總結：');
    out.push({ key: 'note', cls: '', title: summary ? '每日總結' : '今朝消息', body: esc(summary ? state.morningNote.slice(5) : state.morningNote), btns: `<button type="button" data-action="dismiss-note">知道喇</button>` });
  }
  return out;
}

/**
 * Which card the stack shows: stays on the current one while it exists; a card that just appeared and is more urgent
 * (e.g. 瀕死 starting) takes over; otherwise the most urgent.
 */
export function pickNoteKey(keys: readonly string[], current: string | null, before: readonly string[]): string | null {
  if (!keys.length) return null;
  const fresh = keys.find((k) => !before.includes(k));
  if (current && keys.includes(current)) {
    if (fresh && keys.indexOf(fresh) < keys.indexOf(current)) return fresh;
    return current;
  }
  return keys[0]!;
}

/** Next card in the stack (wraps). */
export function nextNoteKey(keys: readonly string[], current: string | null): string | null {
  if (!keys.length) return null;
  const i = current ? keys.indexOf(current) : -1;
  return keys[(i + 1) % keys.length]!;
}

let noteKey: string | null = null;
let noteSeenKeys: string[] = [];
let noteOpen = false;
let noteOpenKey: string | null = null;

/** Pager 「1/2 ›」: show the next card (collapsed). */
export function noteNext(): void {
  noteKey = nextNoteKey(noteSeenKeys, noteKey);
  noteOpen = false;
}

/** Tap on a card's title: expand / collapse its text. */
export function noteToggle(): void {
  noteOpen = !noteOpen;
  noteOpenKey = noteKey;
}

/** Top-left weather card (with the place picker), status card, height rail, note stack and dock. */
/** First-day checklist: water, then fertilize. The pages after each tap explain the numbers. */
export function coachCard(c: Coach): string {
  const rows = coachTasks(c)
    .map((t) => `<li class="${t.done ? 'done' : ''}"><span aria-hidden="true">${t.done ? '✓' : '○'}</span>${esc(t.label)}</li>`)
    .join('');
  return `<p>撳發光嘅掣，認識點樣照顧。</p><ol>${rows}</ol><button type="button" class="texty" data-action="coach-skip">知道喇</button>`;
}

export type LessonId = 'water' | 'feed' | 'health';

/** A stat change, with the unit: +10點 / −10點. */
function pts(n: number): string {
  return `${n > 0 ? '+' : ''}${n}點`;
}

/** Pages shown after the first 澆水, the first 施肥, and once both are done. */
export function lessonPages(id: LessonId): { title: string; body: string }[] {
  if (id === 'water') {
    const [lo, hi] = W_OPTIMAL;
    const dry = W_TIERS.find((t) => t.tone === 'dry')!;
    const rot = W_TIERS.filter((t) => t.tone !== 'ok' && t.tone !== 'dry');
    const hot = WEATHER_EVENTS.hot;
    const rain = WEATHER_EVENTS.rainstorm;
    const drizzle = WEATHER_EVENTS.drizzle;
    return [
      {
        title: '水分',
        body: `水分最佳範圍係 ${lo} 到 ${hi}。澆水每日 ${CARE.water.perDay} 次，一次 ${pts(CARE.water.amount)}，最多澆到 ${W_SATURATED}（泥土飽和）。疏水每日 ${CARE.drain.perDay} 次，一次 ${pts(CARE.drain.amount)}。`,
      },
      {
        title: '水分點樣變',
        body: `泥土全日慢慢流失水分，每日合共 ${pts(-W_NIGHT_LOSS)}；落雨日唔流失。毛毛雨水分 ${pts(drizzle.dW)}，暴雨或者黑雨一出就 ${pts(rain.dW)}。水分過咗 ${W_SATURATED} 就開始積水，要撳疏水排走。`,
      },
      {
        title: '水分同健康',
        body: `水分 ${lo}–${hi}，當晚健康 ${pts(W_TIERS.find((t) => t.tone === 'ok')!.score)}。低過 ${lo}（${dry.label}）健康 ${pts(dry.score)}。${rot[0]!.label}（${hi + 1}–${rot[0]!.max}）健康 ${pts(rot[0]!.score)}，${rot[1]!.label}（${rot[0]!.max + 1}–${rot[1]!.max}）健康 ${pts(rot[1]!.score)}，${rot[2]!.label}（${rot[1]!.max + 1} 或以上）健康 ${pts(rot[2]!.score)}。去到 ${W_MAX} 就即刻瀕死。`,
      },
      {
        title: '酷熱澆水',
        body: `酷熱天氣警告一出，水分即刻 ${pts(hot.dW)}。撳「${emergencyName('heatWater')}」可以額外澆一次，水分 ${pts(EMERGENCY.heatWater.amount)}；做咗就唔扣 ${hot.damage}點健康，仲有應急獎勵 ${pts(EMERGENCY.bonus)}。呢一下唔計入每日 ${CARE.water.perDay} 次，水分去到 ${W_SATURATED} 都做得。酷熱會令泥土乾，所以要澆水；水太多先至疏水，暴雨就要做「暴雨疏水」。`,
      },
    ];
  }
  if (id === 'feed') {
    const [lo, hi] = N_OPTIMAL;
    return [
      {
        title: '施肥',
        body: `施肥一次養分 ${pts(CARE.fertilize.amount)}，每日最多 ${CARE.fertilize.perDay} 次。養分唔使日日補，夠用就可以隔幾日先施。`,
      },
      {
        title: '養分同健康',
        body: `養分 ${lo}–${hi}，當晚健康 ${pts(N_FACTOR.good)}。${N_MALNOURISHED}–${lo - 1} 唔加唔減。低過 ${N_MALNOURISHED} 係營養不良，健康 ${pts(N_FACTOR.bad)}。棵樹每日自己慢慢用 ${N_DAILY_USE}點養分。健康日頭唔郁，半夜按一日完結嗰刻嘅水分同養分一次過結算。`,
      },
    ];
  }
  const fast = H_MULT_TIERS[0]!;
  const normal = H_MULT_TIERS[1]!;
  const weak = H_MULT_TIERS[2]!;
  return [
    {
      title: '健康同樹高',
      body: `健康度會影響今晚長高幾多。${fast.min} 或以上可以長到平常嘅 ${fast.mult} 倍，${normal.min}–${fast.min - 1} 正常，${weak.min}–${normal.min - 1} 幾乎停低（×${weak.mult}），低過 ${weak.min} 仲會縮水。跟住現實天氣細心打理：酷熱記得澆水，雨水太多就疏水，養分低先施肥。水分同養分留喺最佳範圍，棵樹先會長得高。今晚結算先會再長高。`,
    },
  ];
}

export function lessonModal(id: LessonId, page: number): string {
  const pages = lessonPages(id);
  const i = Math.max(0, Math.min(page, pages.length - 1));
  const cur = pages[i]!;
  const last = i === pages.length - 1;
  const step = pages.length > 1 ? `<p class="fine">第 ${i + 1} / ${pages.length} 頁</p>` : '';
  const btn = last
    ? `<button type="button" class="primary" data-action="lesson-done">知道喇</button>`
    : `<button type="button" class="primary" data-action="lesson-next">下一頁</button>`;
  return `<p class="eyebrow">照顧</p><h2>${esc(cur.title)}</h2><p>${esc(cur.body)}</p>${step}${btn}`;
}

export function renderChrome(view: View): void {
  const { state, cond } = view;
  const card = document.getElementById('weather-card');
  if (card) renderWeatherCard(card, view);
  const gear = document.getElementById('gear');
  if (gear && !gear.innerHTML) gear.innerHTML = icon('gear');
  const close = document.getElementById('drawer-close');
  if (close && !close.innerHTML) close.innerHTML = icon('close');

  const bare = view.isle.bare;
  const status = document.getElementById('status-card');
  if (status && bare) {
    status.classList.remove('pop-open');
    status.innerHTML = `
      <button type="button" class="status-head" data-action="plant-isle"><b>第二座空島</b>${icon('chevronRight')}</button>
      <p class="status-sub">未有樹</p>
      <p class="status-facts"><span>向左滑嚟到呢度。向右滑返第一座島。</span><span>鏡頭自轉嗰陣會見到其他空島。</span></p>
      <button type="button" class="primary" data-action="plant-isle">種一棵新樹</button>`;
  } else if (status) {
    const stage = stageFor(state.heightCm, speciesTargetCm(state.species));
    const night = state.started && !state.over ? previewChip(view.preview, Boolean(state.dying), state.collapses || 0) : null;
    const emerg = state.started && !state.over ? emergencyButtons(view, 'mini') : '';
    status.classList.toggle('pop-open', Boolean(night?.pop));
    status.innerHTML = `
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${icon('chevronRight')}</button>
      <p class="status-sub">${esc(state.treeName)} · ${esc(speciesDef(state.species).name)}${esc(stage.name)}</p>
      <p class="status-facts">
        <span>樹齡 ${shownAge(state)} 日 = </span>
        <span>真實樹齡 ${realAgeDays(state.heightCm, state.species)} 日</span>
        <span class="carbon-fact">碳吸收量<br>約 ${carbonKg(state.heightCm, state.species)} 公斤 CO₂／年</span>
      </p>
      <div class="bars">
        ${statBar('H', '健康', state.health, [50, 100], 'health', state.dying ? '瀕死' : '')}
        <div class="night-row">${night?.chip ?? ''}</div>
        ${waterBar(state.moisture)}
        ${statBar('N', '養分', state.nutrients, N_OPTIMAL, 'food', '', N_MALNOURISHED)}
        ${statBar('R', '抗風', state.resist, [60, 100], state.windUnlocked ? 'shield' : 'shield locked')}
      </div>
      ${state.windUnlocked ? `<p class="collapse-count ${(state.collapses || 0) >= COLLAPSE_MAX ? 'danger' : state.collapses ? 'warn' : ''}">${esc(collapseText(state))}</p>` : ''}
      ${emerg ? `<div class="emerg-acts">${emerg}</div>` : ''}${night?.pop ?? ''}`;
  }

  const rail = document.getElementById('rail');
  if (rail && bare) {
    rail.hidden = true;
    rail.innerHTML = '';
  } else if (rail) {
    rail.innerHTML = railHtml(state);
    // Keep the height rail in the gap under the status card, including short screens.
    rail.style.top = '';
    const hostH = (rail.offsetParent as HTMLElement | null)?.clientHeight || window.innerHeight;
    const bottomPx = parseFloat(getComputedStyle(rail).bottom) || 0;
    const cssTop = parseFloat(getComputedStyle(rail).top) || 0;
    const belowCard = status && status.offsetHeight ? status.offsetTop + status.offsetHeight + 8 : cssTop;
    const topPx = Math.max(cssTop, belowCard);
    const room = hostH - topPx - bottomPx;
    rail.style.top = `${topPx}px`;
    rail.classList.toggle('compact', room < 160);
    rail.hidden = room < 36;
  }

  const dock = document.getElementById('dock');
  if (dock && bare) {
    dock.innerHTML = `<button type="button" class="dock-btn d-plant" data-action="plant-isle" style="grid-column:1 / -1"><span class="dock-ic">${icon('sprout')}</span><span class="dock-label">種一棵新樹</span><small>第二座空島</small></button>`;
  } else if (dock) {
    const water = actionLimit(state, 'water');
    const feed = actionLimit(state, 'fertilize');
    const cd = view.countdown;
    const prepShort = Boolean(state.windUnlocked && cd && ev(cd.event).category === 'wind' && state.resist < 60);
    const dbl = state.windUnlocked && doubleRActive(state);
    const drains = actionLimit(state, 'drain');
    const coldOn = emergencyOptions(view.todayEvents).warmCover;
    const covered = Boolean(state.care.warmCover);
    const warmOk = coldOn && !covered && state.started && !state.over;
    // v15 layout: 澆水 over 疏水 | 施肥 over 除蟲 | 加固 | 保暖 (v1.4.1: 圖鑑 lives in the 樹木狀態 pop box).
    dock.innerHTML = `
      <div class="dock-col">
        ${dockBtn('d-water short', 'data-action="water"', 'drop', '澆水', state.moisture >= W_SATURATED ? '水分 100' : `${water.used}/${water.max}`, water.used >= water.max || state.moisture >= W_SATURATED)}
        <button type="button" class="dock-sub d-drain ${state.moisture > W_SATURATED ? 'alert' : ''}" data-action="drain" ${drains.used >= drains.max ? 'disabled' : ''}>${icon('drain')}<span>${drains.used >= drains.max ? '疏過喇' : `疏水 ${drains.max - drains.used}`}</span></button>
      </div>
      <div class="dock-col">
        ${dockBtn('d-feed short', 'data-action="fertilize"', 'sprout', '施肥', feed.used >= feed.max ? '施過喇' : `${feed.used}/${feed.max}`, feed.used >= feed.max)}
        <button type="button" class="dock-sub d-bug ${state.pest.active ? 'alert' : ''}" data-action="deworm" ${state.care.dewormed ? 'disabled' : ''}>${icon('bug')}<span>${state.care.dewormed ? '除過喇' : state.pest.active ? '有蟲！' : '除蟲'}</span></button>
      </div>
      ${dockBtn('d-guard', 'data-open="care" data-focus="guard"', 'shield', '加固', !state.windUnlocked ? '青年樹解鎖' : dbl ? '今日雙倍' : prepShort ? '惡劣天氣' : `R ${Math.round(state.resist)}`, !state.windUnlocked, dbl ? '×2' : prepShort ? '!' : '')}
      <button type="button" class="dock-btn d-warm ${warmOk ? 'hot-pulse' : 'done'}${covered ? ' lit' : ''}" data-action="warm-cover" ${warmOk ? '' : 'disabled aria-disabled="true"'}>
        <span class="dock-ic">${icon('mulch')}</span><span class="dock-label">保暖</span><small>${covered ? '今日做咗' : coldOn ? '寒冷・應急' : '寒冷先用'}</small>
      </button>`;
  }

  const slot = document.getElementById('note-slot');
  if (slot) {
    const cards = noteCards(state, dyingLeftMs(state));
    noteKey = pickNoteKey(cards.map((c) => c.key), noteKey, noteSeenKeys);
    noteSeenKeys = cards.map((c) => c.key);
    const i = Math.max(0, cards.findIndex((c) => c.key === noteKey));
    const c = cards[i];
    if (c && c.key !== noteOpenKey) noteOpen = false;
    const html = c
      ? `<article class="glass note-card stack ${c.cls}${noteOpen ? ' open' : ''}" data-note="${c.key}">
          <div class="nc-head"><button type="button" class="nc-title" data-action="note-toggle" aria-expanded="${noteOpen}" aria-controls="nc-body"><b>${c.title}</b>${icon('chevronDown')}</button>${
            cards.length > 1 ? `<button type="button" class="nc-pager" data-action="note-next" aria-label="下一張（${i + 1}/${cards.length}）">${i + 1}/${cards.length}${icon('chevronRight')}</button>` : ''
          }</div>
          <p class="nc-body" id="nc-body"${noteOpen ? '' : ' hidden'}>${c.body}</p>
          <div class="note-btns">${c.btns}</div>
        </article>`
      : '';
    setHtml(slot, html);
  }
  document.body.classList.toggle('night', view.night);
  document.body.classList.toggle('cold', Boolean(cond.cold));
  document.body.classList.toggle('thriving', state.health >= 80 && !state.over);
  document.body.classList.toggle('dying', Boolean(state.dying) && !state.over);
  document.getElementById('scene')?.setAttribute('aria-label', `${state.treeName}，${weatherLabel(cond.code)}，高 ${formatHeight(state.heightCm)}`);
  document.title = `${state.treeName} · 世界之樹`;
  syncHatchCard(state);
}

/**
 * Card tint for the weather in force now.
 * 山泥傾瀉／颱風／狂風雷暴 stay yellow even when it is also raining.
 * 酷熱 in force is red, including after rain earlier the same day — 毛毛雨 does not keep the card blue.
 * 暴雨／黑雨／毛毛雨 (when that is the headline) is blue.
 */
export function weatherCardTone(events: readonly WeatherEventId[], cond: DayCond, cd: Countdown | null = null): 'rain' | 'wind' | 'hot' | 'cold' | null {
  const wind = events.some((id) => WEATHER_EVENTS[id].category === 'wind') || cond.stormKind === 'gale' || cond.stormKind === 'typhoon' || (cd !== null && WEATHER_EVENTS[cd.event].category === 'wind');
  if (wind) return 'wind';
  const headline = pickEvent(events);
  if (headline === 'hot') return 'hot';
  if (headline === 'drizzle' || WEATHER_EVENTS[headline].category === 'rain' || cond.stormKind === 'heavy-rain' || cond.raining) return 'rain';
  if (headline === 'cold' || cond.cold) return 'cold';
  return null;
}

/** The bureau's own signal for this game event, when Hong Kong or Macau issued one. */
function signalLabel(warnings: readonly HkoWarning[], event: WeatherEventId): string | null {
  const hit = warnings.find((w) => hkoWarningEvents([w]).includes(event));
  return hit ? warningDisplay(hit) : null;
}

function renderWeatherCard(card: HTMLElement, view: View): void {
  const { state, cond, wx } = view;
  const simulated = wx.provider === 'sim' && !wx.overridden;
  const firstLoad = simulated && wx.loading;
  const cd = view.countdown;
  const tone = firstLoad ? null : weatherCardTone(view.nowEvents ?? view.todayEvents, cond, cd);
  card.classList.toggle('severe', Boolean(cd) && !firstLoad);
  card.classList.toggle('wx-rain', tone === 'rain');
  card.classList.toggle('wx-wind', tone === 'wind');
  card.classList.toggle('hot', tone === 'hot');
  card.classList.toggle('cold', tone === 'cold');
  card.classList.toggle('sim', simulated && !wx.loading);
  // v16.1: the card is a container with two real buttons — the whole card opens the weather (or retries a simulated
  // one) and the 「📍 地點 ▾」 chip picks the place. Built once so keyboard focus survives the per-minute refresh.
  if (!card.querySelector('.wx-hit')) {
    card.innerHTML = `<button type="button" class="wx-hit"></button><span class="wx-art" aria-hidden="true"></span><span class="wx-main"></span><button type="button" class="wx-place" data-action="location"></button><span class="wx-rest"></span>`;
  }
  const hit = card.querySelector<HTMLButtonElement>('.wx-hit')!;
  if (simulated) {
    delete hit.dataset.open;
    hit.dataset.action = 'retry-weather';
  } else {
    delete hit.dataset.open;
    hit.dataset.action = 'weather';
  }
  const signal = !view.manual && cd?.active ? signalLabel(wx.warnings, cd.event) : null;
  const noReading = wx.reading === false && !firstLoad && !view.manual;
  const label = view.manual ? ev(view.todayEvent).label : signal ?? (cd?.active ? ev(cd.event).label : nightLabel(wx.conditionText || weatherLabel(cond.code), view.night));
  let line: string;
  if (cd) {
    const cat = ev(cd.event).category;
    const tail = cat === 'wind' ? (state.windUnlocked ? `抗風力 ${Math.round(state.resist)}` : '青年樹前冇影響') : cat === 'heat' ? '可以酷熱澆水' : cat === 'cold' ? '可以保暖' : cat === 'rain' ? `可以${emergencyName('rainDrain')}` : '';
    line = `<span class="warn-line">${icon('warn')}${esc(signal ?? ev(cd.event).label)} · ${hoursText(cd.hours)}${tail ? ` · ${tail}` : ''}</span>`;
  } else if (wx.rainInHours !== null && !cond.raining && !simulated && !view.manual) {
    line = wx.rainInHours <= 1 ? '一個鐘內可能落雨' : `大約 ${wx.rainInHours} 個鐘後可能落雨`;
  } else if (view.manual) {
    line = `今日：${esc(ev(view.todayEvent).label)} · 今晚結算 ${esc(hm(view.minutesToSettle))}後`;
  } else {
    // A remembered day event plus the time until nightly settlement is not a weather forecast.
    line = '';
  }
  const chips = wx.warnings
    .slice(0, 4)
    .map((w) => `<span class="wchip ${w.tone}" title="${esc(w.name)}">${warnIcon(w)}<span>${esc(warningDisplay(w))}</span></span>`)
    .join('');
  const source = sourceLabel(wx);
  const temp = firstLoad || noReading ? '--' : `${Math.round(cond.tempC)}°C`;
  const shownLabel = firstLoad ? '攞緊天氣…' : noReading ? '讀數暫時攞唔到' : label;
  setAttr(hit, 'aria-label', simulated ? `${temp} ${shownLabel}・模擬天氣，撳一下再試攞真實天氣` : `${temp} ${shownLabel}・天氣概況`);
  setHtml(card.querySelector('.wx-art')!, weatherArt(cond.code, view.night, Boolean(cond.stormKind), cond.stormKind || view.manual ? undefined : wx.nowIcon));
  setHtml(card.querySelector('.wx-main')!, `<b>${temp}</b><span>${esc(shownLabel)}</span>`);
  const place = card.querySelector<HTMLButtonElement>('.wx-place')!;
  setAttr(place, 'aria-label', `揀地點（而家：${view.place}${view.placeNote ? `，${view.placeNote}` : ''}）`);
  setHtml(place, placeChipHtml(view.place, view.placeNote, wx.station && !simulated && !view.manual ? wx.station : ''));
  setHtml(
    card.querySelector('.wx-rest')!,
    `${chips && !view.manual ? `<span class="wx-warns">${chips}</span>` : ''}${line ? `<span class="wx-line">${line}</span>` : ''}<span class="wx-src ${simulated ? 'sim' : ''}">${source}</span>`,
  );
}

/** v16.1 place picker chip inside the weather card: 📍 name, 預設 tag, ▾, then the station (if any). */
export function placeChipHtml(place: string, note: string, station: string): string {
  return `${icon('pin')}<span class="wx-place-name">${esc(place)}</span>${note ? `<small class="wx-tag">${esc(note)}</small>` : ''}${icon('chevronDown')}${station ? `<small class="wx-station">· ${esc(station)}站</small>` : ''}`;
}

const lastHtml = new WeakMap<Element, string>();
/** Set innerHTML only when the markup we generate changed (the browser's serialisation may differ from ours). */
function setHtml(el: Element, html: string): void {
  if (lastHtml.get(el) === html) return;
  lastHtml.set(el, html);
  el.innerHTML = html;
}

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

function sourceLabel(wx: WeatherView): string {
  if (wx.overridden) return '手動天氣（開發者）';
  if (wx.provider === 'sim') {
    if (wx.loading) return '攞緊真實天氣…';
    const note = wx.bureau === 'smg' && wx.hkoUsed ? '（氣象局警告係真嘅）' : wx.bureau === 'cwa' && wx.hkoUsed ? '（氣象署警告係真嘅）' : wx.hkoUsed ? '（天文台警告係真嘅）' : '';
    return `模擬天氣・撳一下重試${note}`;
  }
  const names = wx.bureau === 'smg' ? '地球物理氣象局' : wx.bureau === 'cwa' ? '中央氣象署' : wx.bureau === 'hko' || wx.provider === 'hko' ? '香港天文台' : 'Open-Meteo';
  if (wx.origin === 'cache') return `上次天氣 ${esc(wx.updated)}・${names}`;
  return `即時天氣・${names}${wx.updated ? ` · ${esc(wx.updated)}` : ''}${wx.loading ? ' · 更新緊' : ''}`;
}

/** Small badge in the spirit of HKO's warning icons (drawn locally, not the official artwork). */
export function warnIcon(w: HkoWarning): string {
  // Taiwan (中央氣象署) warnings reuse the same badges.
  if (w.group === 'TWTY' || w.group === 'TWWIND') {
    const n = w.group === 'TWTY' ? '颱' : '風';
    return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l8.5 16H1.5z" fill="currentColor"/><text x="10" y="15.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff">${n}</text></svg>`;
  }
  const alias: Record<string, string> = { TWTS: 'WTS', TWRAIN: 'WRAIN', TWHOT: 'WHOT', TWCOLD: 'WCOLD' };
  if (alias[w.group]) return warnIcon({ ...w, group: alias[w.group] });
  if (w.group === 'WTCSGNL') {
    const n = w.code.replace(/^TC(\d+).*/, '$1');
    return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l8.5 16H1.5z" fill="currentColor"/><text x="10" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${esc(n)}</text></svg>`;
  }
  if (w.group === 'WRAIN') return '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="3" fill="currentColor"/><path d="M7 6l-1.5 3M11 6l-1.5 3M15 6l-1.5 3M8 11l-1.5 3M12 11l-1.5 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
  if (w.group === 'WHOT') return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 4.5v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="2.3" fill="#fff"/></svg>';
  if (w.group === 'WCOLD') return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 4.5v11M5.2 7.2l9.6 5.6M14.8 7.2l-9.6 5.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
  if (w.group === 'WFIRE') return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5c1 3.5 5.5 5.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 1.5-4 2.5-5 .2 1.7 1 2.6 2 3-.5-3 .3-5.8 1-8z" fill="currentColor"/></svg>';
  if (w.group === 'WL') return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M1.5 18.5L8 5l3.5 5 2-2 5 10.5z" fill="currentColor"/><circle cx="13" cy="14.5" r="1.4" fill="#fff"/><circle cx="9.5" cy="15.5" r="1" fill="#fff"/></svg>';
  if (w.group === 'WTS') return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 1.5L4 11h5l-1.5 7.5L16 8h-5z" fill="currentColor"/></svg>';
  return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 5.5v5.5M10 13.8v.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
}

function statBar(key: string, label: string, value: number, band: readonly [number, number], tone: string, flag = '', warnAt?: number): string {
  const v = Math.round(Math.max(0, Math.min(100, value)));
  const ok = v >= band[0] && v <= band[1];
  const mid = !ok && warnAt !== undefined && v >= warnAt;
  const state = ok ? 'ok' : mid ? 'mid' : 'off';
  return `<div class="bar ${tone} ${state}" title="${label} 最佳 ${band[0]}–${band[1]}">
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

/** Visible month (YYYY-MM) and the day whose log is open. Empty day means the calendar only. */
let calMonth = '';
let calDay = '';

export function openLogCalendar(today: string): void {
  calMonth = today.slice(0, 7);
  calDay = '';
  sheetKey = '';
}

export function selectLogDay(ymd: string): void {
  calDay = ymd;
  calMonth = ymd.slice(0, 7);
  sheetKey = '';
}

export function moveLogMonth(delta: number, today: string): void {
  const base = calMonth || today.slice(0, 7);
  const [y, m] = base.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1 + delta, 1));
  const next = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
  if (next > today.slice(0, 7)) return;
  calMonth = next;
  if (!calDay.startsWith(calMonth)) calDay = '';
  sheetKey = '';
}

function daysInMonth(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y!, m!, 0)).getUTCDate();
}

/** up: health rose or held 100. down: health fell. flat: unchanged and still under 100. */
export function healthDayMark(entries: LogEntry[], isToday: boolean, healthNow: number): 'up' | 'down' | 'flat' | '' {
  const settle = entries.find((e) => e.kind === 'settle') ?? entries.find((e) => /健康\s*\d+\s*→\s*\d+/.test(e.text));
  const match = settle?.text.match(/健康\s*(\d+)\s*→\s*(\d+)/);
  if (match) {
    const before = Number(match[1]);
    const after = Number(match[2]);
    if (after < before) return 'down';
    if (after > before || after >= 100) return 'up';
    return 'flat';
  }
  if (!isToday) return '';
  return healthNow >= 100 ? 'up' : 'flat';
}

export function logCalendarHtml(log: LogEntry[], today: string, month: string, day: string, healthNow = 0): string {
  const [y, m] = month.split('-').map(Number);
  const count = daysInMonth(month);
  const lead = weekdayIndex(`${month}-01`);
  const byDate = new Map<string, LogEntry[]>();
  for (const entry of log) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  }
  const cells: string[] = [];
  for (let i = 0; i < lead; i++) cells.push('<span></span>');
  for (let d = 1; d <= count; d++) {
    const ymd = `${month}-${String(d).padStart(2, '0')}`;
    const mark = ymd > today ? '' : healthDayMark(byDate.get(ymd) ?? [], ymd === today, healthNow);
    const cls = ['cal-day', mark, ymd === today ? 'today' : '', ymd === day ? 'on' : ''].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-cal="${ymd}"${ymd === today ? ' aria-current="date"' : ''}${ymd > today ? ' disabled' : ''}>${d}</button>`);
  }
  const rows = day ? log.filter((e) => e.date === day) : [];
  const detail = !day
    ? ''
    : rows.length
      ? `<h4 class="log-day">${esc(formatLong(day))}</h4><ol class="log-list">${rows.map((row) => logRow(row)).join('')}</ol>`
      : `<h4 class="log-day">${esc(formatLong(day))}</h4><p class="empty">呢日未有紀錄。</p>`;
  return `
    <div class="cal">
      <div class="cal-nav">
        <button type="button" data-cal-nav="prev" aria-label="上個月">‹</button>
        <b>${y}年${m}月</b>
        <button type="button" data-cal-nav="next" aria-label="下個月"${month >= today.slice(0, 7) ? ' disabled' : ''}>›</button>
      </div>
      <div class="cal-week">${WEEK.map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="cal-grid">${cells.join('')}</div>
    </div>
    ${detail}`;
}

export function renderSheet(state: GameState, today: string): void {
  const body = document.getElementById('sheet-body');
  const title = document.getElementById('sheet-title');
  if (!body) return;
  if (title) title.textContent = '成長日誌';
  if (!calMonth || calMonth > today.slice(0, 7)) calMonth = today.slice(0, 7);
  const key = `${today}|${calMonth}|${calDay}|${Math.round(state.health)}|${state.log.length}|${state.log[0]?.text ?? ''}|${state.log[0]?.time ?? ''}`;
  if (key === sheetKey) return;
  sheetKey = key;
  body.innerHTML = logCalendarHtml(state.log, today, calMonth, calDay, state.health);
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
  panel.innerHTML = `${tabs(view.tab, view.state.animals.filter((id) => !view.state.seenAnimals.includes(id)).length)}<div class="panel-body">${body(view)}</div>`;
  panel.scrollTop = scroll;
  paintThumbs();
}

function tabs(active: TabId, freshAnimals = 0): string {
  const items: [TabId, string][] = [
    ['care', '照顧'],
    ['album', freshAnimals ? `圖鑑<em class="badge">${freshAnimals}</em>` : '圖鑑'],
    ['milestones', '里程碑'],
    ['achievements', '成就'],
  ];
  return `<nav class="tabs" role="tablist">${items
    .map(
      ([id, label]) =>
        `<button type="button" role="tab" data-tab="${id}" class="${id === active ? 'on' : ''}" aria-selected="${id === active}">${label}</button>`,
    )
    .join('')}</nav>`;
}

function body(view: View): string {
  if (!view.state.started) return `<div class="card quiet"><p>先揀樹種同替棵樹起個名。</p></div>`;
  switch (view.tab) {
    case 'album':
      return albumTab(view);
    case 'milestones':
      return milestoneTab(view);
    case 'achievements':
      return achievementTab(view);
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
  const items: { id: 'heatWater' | 'rainDrain' | 'warmCover'; action: string; label: string; sub: string; done: boolean; tone: string }[] = [];
  if (opts.heatWater) items.push({ id: 'heatWater', action: 'heat-water', label: '酷熱澆水', sub: state.moisture >= W_SATURATED ? `飽和都做得・免扣 10` : `+${EMERGENCY.heatWater.amount} 水分・免扣 10`, done: Boolean(state.care.heatWater), tone: 'heat' });
  if (opts.rainDrain) {
    const black = view.todayEvents.includes('blackrain');
    items.push({ id: 'rainDrain', action: 'rain-drain', label: emergencyName('rainDrain'), sub: `−10（最低 ${EMERGENCY.rainDrain.floor}）・免扣 ${black ? 15 : 10}`, done: Boolean(state.care.rainDrain), tone: 'rain' });
  }
  // v15 保暖 lives on its own dock button, so the small status-card strip leaves it out.
  if (opts.warmCover && variant === 'act') items.push({ id: 'warmCover', action: 'warm-cover', label: '保暖', sub: `免扣 ${WEATHER_EVENTS.cold.damage}・應急獎勵`, done: Boolean(state.care.warmCover), tone: 'cold' });
  if (!items.length) return '';
  const emIcon = (id: string): IconName => (id === 'heatWater' ? 'drop' : id === 'warmCover' ? 'mulch' : 'drain');
  if (variant === 'mini') {
    return items
      .map((i) => `<button type="button" class="emerg ${i.tone} ${i.done ? 'done' : 'hot-pulse'}" data-action="${i.action}" ${i.done ? 'disabled' : ''}>${icon(emIcon(i.id))}<span>${i.label}</span><small>${i.done ? '今日做咗' : '應急'}</small></button>`)
      .join('');
  }
  return `<div class="emerg-row">${items
    .map((i) => `<button type="button" class="emerg-act ${i.tone} ${i.done ? 'done' : 'hot-pulse'}" data-action="${i.action}" ${i.done ? 'disabled' : ''}><span class="act-ic">${icon(emIcon(i.id))}</span><span>${i.label}</span><small>${esc(i.done ? '今日做咗' : i.sub)}</small></button>`)
    .join('')}</div>`;
}

/** One line for an event that is not the card headline. */
function sideEventLine(id: WeatherEventId, unlocked: boolean): string {
  const d = ev(id);
  if (!d.damage) return `${d.label}：${waterText(id)}`;
  return `${d.label}：${effectText(id, unlocked)}`;
}

/**
 * The night card and the emergency button already say "do 酷熱澆水 / 疏水 / 保暖".
 * Skip the advice line when it only repeats that.
 */
function careAdvice(view: View): string {
  const { state } = view;
  const text = advice(state, view.preview, view.countdown);
  const opts = emergencyOptions(view.todayEvents);
  const echoed =
    (opts.heatWater && text.includes('酷熱澆水')) ||
    (opts.rainDrain && text.includes(emergencyName('rainDrain'))) ||
    (opts.warmCover && text.includes('「保暖」')) ||
    (text.startsWith('今晚水分預計') && text.includes('適中'));
  if (echoed) return '';
  return `<p class="advice">${esc(text)}</p>`;
}

function careTab(view: View): string {
  const { state } = view;
  const event = eventTitle(state);
  const today = ev(view.todayEvent);
  const water = actionLimit(state, 'water');
  const drain = actionLimit(state, 'drain');
  const feed = actionLimit(state, 'fertilize');
  const s = state.lastSettlement;
  const cd = view.countdown;
  const same = cd?.event === view.todayEvent;
  const extras = view.todayEvents.filter((e) => e !== 'clear' && e !== view.todayEvent);
  const emerg = emergencyButtons(view, 'act');
  const soon = cd && !same ? `<p class="fine">${icon('warn')}${esc(ev(cd.event).label)} · ${esc(hoursText(cd.hours))}。${esc(effectText(cd.event, state.windUnlocked))}。</p>` : '';
  return `
    <article class="card event-card ${today.severe || cd ? 'warn' : ''}">
      <p class="eyebrow">今日${view.manual ? '・手動' : ''} · ${esc(hm(view.minutesToSettle))}後結算</p>
      <h2>${esc(today.label)}${same && cd ? ` · ${esc(hoursText(cd.hours))}` : ''}</h2>
      <p>${esc(effectText(view.todayEvent, state.windUnlocked))}。</p>
      ${extras.length ? `<p class="fine">同時：${extras.map((e) => esc(sideEventLine(e, state.windUnlocked))).join('、')}</p>` : ''}
      ${soon}
      ${emerg}
    </article>
    ${careAdvice(view)}
    <div class="actions">
      ${actionBtn('water', 'drop', 'blue', '澆水', state.moisture >= W_SATURATED ? `水分 100 · 跌咗先可以再澆 · ${water.used}/${water.max}` : `+${CARE.water.amount} · ${water.used}/${water.max}`, water.used >= water.max || state.moisture >= W_SATURATED)}
      ${actionBtn('drain', 'drain', 'purple', '疏水', `${CARE.drain.amount} 水分 · ${drain.used}/${drain.max}`, drain.used >= drain.max)}
      ${actionBtn('fertilize', 'sprout', 'green', '施肥', `+${CARE.fertilize.amount} 養分 · ${feed.used}/${feed.max}`, feed.used >= feed.max)}
      ${actionBtn('deworm', 'bug', 'orange', '除蟲', state.care.dewormed ? '用過喇' : state.pest.active ? '有蟲，每晚 −15' : '預防', state.care.dewormed)}
    </div>
    ${guardCards(view)}
    ${nightCard(view.preview, state.collapses || 0)}
    ${s ? settlementCard(s) : ''}
    <article class="card event">
      <p class="eyebrow">今日小事</p>
      <h2>${esc(event.title)}</h2>
      <p>${esc(event.text)}</p>
    </article>
    <p class="fine">碳吸收量：約 ${carbonKg(state.heightCm, state.species)} 公斤 CO₂／年。用心照顧過 ${state.daysCared} 日。進度只係留喺呢部機。</p>
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
          s.heat === undefined && s.wind === undefined && s.cold === undefined
            ? `<li><span>天氣損傷</span><b>−${s.finalDamage}</b><small>基礎 ${s.baseDamage} × (1 − ${Math.round(s.rBefore)}/100)</small></li>`
            : `${s.heat ? `<li><span>熱・${esc(eventLabel('hot'))}</span><b>${s.heat.handled ? '0' : `−${s.heat.base}`}</b><small>${s.heat.handled ? '已應對' : '冇做酷熱澆水'}</small></li>` : ''}${
                s.cold ? `<li><span>寒・寒冷</span><b>${s.cold.handled ? '0' : `−${s.cold.base}`}</b><small>${s.cold.handled ? '已應對' : '冇做保暖'}</small></li>` : ''
              }${
                s.rain ? `<li><span>雨・${esc(ev(s.rain.event).label)}</span><b>${s.rain.handled ? '0' : `−${s.rain.base}`}</b><small>${s.rain.handled ? '已應對' : `冇做${esc(emergencyName('rainDrain'))}`}</small></li>` : ''
              }${
                s.wind ? `<li><span>風・${esc(ev(s.wind.event).label)}</span><b>${s.wind.score ? `−${-s.wind.score}` : '0'}</b><small>${s.wind.locked ? '青年樹前唔受影響' : `基礎 ${s.wind.base} × (1 − ${Math.round(s.wind.r)}/100)`}</small></li>` : ''
              }${!s.heat && !s.cold && !s.rain && !s.wind ? `<li><span>天氣</span><b>0</b><small>${esc(ev(s.event).label)}</small></li>` : ''}${
                s.emergencyBonus ? `<li><span>應急獎勵</span><b>+${s.emergencyBonus}</b><small>${(s.emergencyCount ?? 0) > 1 ? esc(emergencyBonusText(s.emergencyCount ?? 0).replace(/ = .*$/, '')) : ''}</small></li>` : ''
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
    <span class="act-ic">${icon(ic)}</span><span class="act-copy"><span>${label}</span><small>${esc(sub)}</small></span>
  </button>`;
}

/** 今晚預計 card in the 照顧 tab (same breakdown as the status-card popover). */
function nightCard(p: NightPlan, collapses = 0): string {
  const t = p.waterDeath ? 'down' : p.dH > 0 ? 'up' : p.dH < 0 ? 'down' : 'flat';
  const rows = previewLines(p)
    .map((l) => `<li class="${l.tone}"><span>${esc(l.text)}</span><b>${esc(l.value)}</b><small>${esc(l.sub ?? '')}</small></li>`)
    .join('');
  return `<article class="card night-card">
      <p class="eyebrow">今晚預計（水分、養分全日慢慢變，健康半夜一次過結算）</p>
      ${collapseHtml(p, collapses)}
      <ul class="breakdown">${rows}</ul>
      <h2 class="${t} night-total-h">健康 ${fmt(p.hBefore)} → ${fmt(p.hAfter)}（${p.waterDeath ? '瀕死' : signed(p.dH)}）</h2>
      <p class="fine night-growth">${esc(previewGrowthText(p))}</p>
    </article>`;
}

/** 天氣事件表 (shown in 設定 → 玩法 → 天氣與警告). */
export function eventTableHtml(): string {
  const table = (Object.keys(WEATHER_EVENTS) as WeatherEventId[])
    .map((id) => {
      const d = ev(id);
      const cat = d.category ? WX_CATEGORY_LABEL[d.category] : '—';
      const hp = !d.damage ? '0' : d.category === 'wind' ? `−${d.damage}×(1−R/100)` : `−${d.damage}`;
      const counter = d.category === 'heat' ? '酷熱澆水免扣' : d.category === 'cold' ? '保暖免扣' : d.category === 'rain' ? `${emergencyName('rainDrain')}免扣` : d.category === 'wind' ? `R ${d.dR}・R&lt;${d.collapseBelow} 倒塌` : '';
      return `<tr><td>${esc(d.label)}</td><td>${cat}</td><td>${hp}</td><td>${esc(waterText(d.id, true))}${counter ? `<br><small>${counter}</small>` : ''}</td></tr>`;
    })
    .join('');
  return `<table class="evtable"><thead><tr><th>事件</th><th>類</th><th>健康</th><th>副作用・應對</th></tr></thead><tbody>${table}</tbody></table>`;
}

/** 照顧 tab: the 12-hour countdown (what it does to the tree) and the 加固 card (moved here from the old 天氣·加固 tab). */
function guardCards(view: View): string {
  const { state } = view;
  const locked = !state.windUnlocked;
  const dbl = !locked && doubleRActive(state);
  const preps = (Object.keys(PREPS) as PrepId[])
    .map((k) => {
      const done = state.care.preps[k];
      const sub = locked ? '（青年樹時解鎖）' : done ? '今日做過' : dbl ? `+${prepAmount(state, k)}（雙倍）` : `+${prepAmount(state, k)} 抗風力`;
      return `<button type="button" class="prep ${done ? 'on' : ''} ${locked ? 'locked' : ''} ${dbl && !done ? 'double' : ''}" data-prep="${k}" aria-pressed="${done}" ${locked ? 'disabled aria-disabled="true"' : ''}><span>${PREPS[k].label}</span><small>${sub}</small></button>`;
    })
    .join('');
  const shield = `<article class="card guard-card ${locked ? 'locked-card' : ''}" id="guard-card">
      <p class="eyebrow">加固・抗風力${locked ? '（青年樹時解鎖）' : ''}</p>
      ${dbl ? `<p class="double-banner">🪵 棵樹昨晚倒塌咗，今日加固效果雙倍！</p>` : ''}
      <h2>${Math.round(state.resist)} / ${R_MAX}</h2>
      <div class="track fat"><div class="fill shield" style="width:${Math.round(state.resist)}%"></div></div>
      <p class="fine">${locked ? '未到青年樹：風災唔傷樹，抗風力唔變。' : `每樣每日一次，每晚 −${R_DAILY_DECAY}。`}<button type="button" class="linkish" data-action="guide" data-tab="calc">計法</button></p>
      <div class="preps">${preps}</div>
    </article>`;
  return shield;
}

/** v1.4.1 天氣概況: its own page — real-world warnings in force plus current conditions and the forecast. */
export function weatherPageHtml(view: View): string {
  const { cond, wx } = view;
  const simulated = wx.provider === 'sim' && !wx.overridden;
  const reading = wx.reading !== false;
  const label = reading ? nightLabel(wx.conditionText || weatherLabel(cond.code), view.night) : '';
  const facts = [
    reading && wx.humidity !== undefined ? `濕度 ${Math.round(wx.humidity)}%` : '',
    !reading || wx.bureau === 'hko' ? '' : `風 ${Math.round(cond.windKmh)}・陣風 ${Math.round(cond.gustKmh)} 公里/時`,
    reading && cond.precipMm > 0 ? `雨量 ${Math.round(cond.precipMm * 10) / 10} 毫米` : '',
  ].filter(Boolean);
  const rain = wx.rainInHours !== null && !cond.raining && !simulated && !wx.overridden ? (wx.rainInHours <= 1 ? '一個鐘內可能落雨' : `大約 ${wx.rainInHours} 個鐘後可能落雨`) : '';
  const now = `<article class="card wx-now">
      <span class="wx-now-art">${weatherArt(cond.code, view.night, Boolean(cond.stormKind), cond.stormKind || wx.overridden ? undefined : wx.nowIcon)}</span>
      <div><p class="eyebrow">而家・${esc(view.place)}${wx.station && !simulated && !wx.overridden ? `・${esc(wx.station)}站` : ''}</p>
      <h2>${reading ? `${Math.round(cond.tempC)}°C ${esc(label)}` : '讀數暫時攞唔到'}</h2>
      <p class="fine">${facts.map(esc).join(' · ')}${rain ? `<br>${esc(rain)}` : ''}</p></div>
    </article>`;
  // Bureau advisory sentences (HKO warningMessage, SMG descriptions). Shown with the warning, not instead of it.
  const extraMessages = wx.hkoUsed ? wx.messages.filter((msg) => msg.trim()) : [];
  let warns: string;
  if (wx.hkoUsed) {
    const list = wx.warnings.length
      ? `<ul class="hko-warns">${wx.warnings.map((w) => {
          const shown = warningDisplay(w);
          const official = w.name !== shown ? `<small>${esc(w.name)}</small>` : '';
          return `<li class="${w.tone}">${warnIcon(w)}<span><b>${esc(shown)}</b>${official}</span></li>`;
        }).join('')}</ul>`
      : '';
    const prose = extraMessages.map((msg) => `<p>${esc(msg)}</p>`).join('');
    warns = list + prose || (wx.warningsKnown === false ? '<p>警告暫時攞唔到。</p>' : '<p>而家冇天氣警告生效。</p>');
  } else if (wx.bureau === 'smg') {
    warns = '<p>地球物理氣象局暫時攞唔到。呢度唔會改用其他來源。</p>';
  } else if (wx.bureau === 'cwa') {
    warns = '<p>中央氣象署資料暫時攞唔到。呢度唔會改用其他來源。</p>';
  } else if (wx.bureau === 'hko') {
    warns = '<p>香港天文台暫時攞唔到。呢度唔會改用其他來源。</p>';
  } else {
    warns = `<p>${wx.overridden ? '手動天氣（開發者）：冇真實警告。' : '呢度跟 Open-Meteo，冇天文台警告。'}</p>`;
  }
  const bureauName = wx.bureau === 'smg' ? '地球物理氣象局' : wx.bureau === 'cwa' ? '中央氣象署' : '香港天文台';
  const office = wx.warnings.length || extraMessages.length ? `${bureauName}・生效中警告` : bureauName;
  const warnCard = `<article class="card hko"><p class="eyebrow">${wx.hkoUsed ? office : '天氣警告'}</p>${warns}</article>`;
  // Hong Kong and Macau only list days that source actually forecast. A padded day would be the game inventing weather.
  const outlook = wx.situation.trim();
  const bureauForecast = wx.bureau === 'hko' || wx.bureau === 'smg' || wx.bureau === 'cwa';
  const forecastDays = view.forecast.filter((day) => !bureauForecast || wx.hkoDays[day.date]);
  const rows = forecastDays
    .map((day) => {
      const today = day.date === view.today ? ' today' : '';
      return `<article class="day${today}">
        <span class="day-art">${weatherArt(day.code, false, false, day.hkoIcon)}</span>
        <div><strong>${day.date === view.today ? '今日' : `星期${WEEK[weekdayIndex(day.date)] ?? ''}`}</strong><span>${esc(formatShort(day.date))}</span></div>
        <div><b>${esc(dayLabel(day))}</b><span>${
          wx.hkoDays[day.date]
            ? `${Math.round(day.tempMin)}–${Math.round(day.tempMax)}°`
            : `${Math.round(day.tempMin)}–${Math.round(day.tempMax)}° · 雨 ${Math.round(day.precipMm)} 毫米 · 陣風 ${Math.round(day.gustKmh)}`
        }</span></div>
        ${wx.hkoDays[day.date] ? `<p class="hko-day">${esc(wx.hkoDays[day.date]!)}</p>` : ''}
      </article>`;
    })
    .join('');
  return `
    <header class="wx-page-head"><h2>天氣概況</h2><p class="fine">${sourceLabel(wx)}</p></header>
    ${warnCard}
    ${now}
    <h3 class="sub">未來預報</h3>
    ${outlook ? `<article class="card wx-outlook"><p class="eyebrow">天氣概況</p><p>${esc(outlook)}</p></article>` : ''}
    ${rows ? `<div class="days">${rows}</div>` : '<p class="fine">當地預報暫時攞唔到。呢度唔會自己估。</p>'}
    <p class="status">${esc(view.statusLine)}${simulated ? ' <button type="button" class="linkish" data-action="retry-weather">再試</button>' : ''}</p>
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
      ${got ? `<span>${esc(animal.epithet)}</span><small>${esc(animal.about)}</small>` : `<small>解鎖：${esc(unlockHint(animal))}</small>`}
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
    const mine = sp.id === view.state.species;
    const stages = sp.stages.map((txt, i) => `<li><b>${STAGE_NAMES[i]}</b>${esc(txt)}</li>`).join('');
    return `<article class="card species-card ${mine ? 'mine' : ''}">
      <div class="species-head">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, sp.targetM * 100)}"></span>
        <div><p class="eyebrow">紀錄高度 ${sp.targetM} 米${mine ? '・你棵樹' : ''}</p>
        <h2>${esc(sp.name)}</h2>
        <p class="sci">${esc(sp.english)} · <i>${esc(sp.scientific)}</i></p>
        <p class="fine">一般 ${esc(sp.typicalM)} 米・最高紀錄 ${sp.maxM} 米（紀錄高度取最接近嘅 10 米）</p></div>
      </div>
      <p>${esc(sp.blurb)}</p>
      <p class="fine">${esc(sp.record)}。資料：<a href="${esc(sp.source.url)}" target="_blank" rel="noopener">${esc(sp.source.label)}</a></p>
      <ol class="stage-list">${stages}</ol>
      ${habitatBlock(sp.id)}
    </article>`;
  }).join('');
  return `<p class="status">九個樹種，種邊款都得。每個樹種嘅紀錄高度＝佢嘅真實最高紀錄，四捨五入到最接近嘅 10 米；棵樹會越長越接近佢，過咗都照長。</p>${cards}`;
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

const TIER_ICON: Record<string, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', record: '🏆' };

function awardLabel(id: string): string {
  return id === 'record' ? RECORD_MILESTONE.label : `樹齡${AGE_MILESTONES.find((m) => m.id === id)?.label ?? id}`;
}

function awardTier(a: { id: string; tier: string | null }): string {
  return a.tier ? `${TIER_ICON[a.tier]} ${MILESTONE_TIER_LABEL[a.tier as 'gold']}章` : TIER_ICON.record!;
}

/** v14 里程碑 tab: 樹齡, % of 紀錄高度, this tree's milestones, the collection and perk badges, height landmarks. */
function milestoneTab(view: View): string {
  const { state, meta } = view;
  const R = speciesTargetCm(state.species);
  const pct = recordPct(state);
  const beyond = state.heightCm > R;
  const meters = state.heightCm / 100;
  const next = MILESTONES.find((m) => meters < m.meters);
  const age = state.ageDays || 0;
  const sp = speciesDef(state.species);
  const ages = AGE_MILESTONES.map((m) => {
    const got = state.milestones?.[m.id];
    const exp = Math.round(expectedShare(m.days) * 100);
    return `<li class="${got ? 'done' : ''}"><strong>${esc(m.label)}（${m.days} 日）</strong><span>${got ? esc(awardTier(got)) : age < m.days ? `仲有 ${m.days - age} 日` : ''}</span><p>${got ? `${esc(got.date)} · ${esc(formatHeight(got.heightCm))}（紀錄 ${Math.round(got.share * 100)}%）${got.retro ? ' · v14 補發' : ''}` : `照顧 ×1 預計約 ${exp}%：金 ≥ ${Math.round(exp * 0.98)}%、銀 ≥ ${Math.round(exp * 0.88)}%，其他銅`}${m.perk ? `・附送${esc(BADGES[m.perk].name)}` : ''}</p></li>`;
  }).join('');
  const rec = state.milestones?.record;
  const recRow = `<li class="${rec ? 'done' : ''}"><strong>${esc(RECORD_MILESTONE.label)}</strong><span>${rec ? TIER_ICON.record : `${pct}%`}</span><p>${rec ? `${esc(rec.date)} · ${esc(formatHeight(rec.heightCm))}（樹齡 ${shownAge({ ageDays: rec.ageDays, started: true })} 日）` : `長過 ${esc(formatHeight(R))}（${esc(sp.name)}真實紀錄 ${sp.maxM} 米取整）`}</p></li>`;
  const collection = meta.milestones?.length
    ? `<ol class="miles">${meta.milestones
        .slice()
        .reverse()
        .map((m) => `<li class="done"><strong>${esc(awardLabel(m.id))}</strong><span>${esc(awardTier(m))}</span><p>${esc(m.treeName)}（${esc(speciesDef(m.species).name)}）· ${esc(m.date)} · ${esc(formatHeight(m.heightCm))}</p></li>`)
        .join('')}</ol>`
    : '<p class="fine">未有里程碑徽章：棵樹樹齡夠 30 日就有第一個。</p>';
  const badges = ([1, 2, 3] as const)
    .map((t) => {
      const n = meta.badges[String(t) as '1' | '2' | '3'];
      const at = AGE_MILESTONES.find((m) => m.perk === t)!;
      return `<li class="${n ? 'done' : ''}"><strong>${esc(BADGES[t].name)}${n > 1 ? ` ×${n}` : ''}</strong><span>${n ? '已擁有' : `樹齡${esc(at.label)}解鎖`}</span><p>${esc(BADGES[t].perk)}</p></li>`;
    })
    .join('');
  const rows = MILESTONES.map((m) => {
    const done = meters >= m.meters;
    return `<li class="${done ? 'done' : ''}"><strong>${esc(m.title)}</strong><span>${m.meters >= 1 ? `${m.meters} 米` : `${Math.round(m.meters * 100)} 厘米`}</span><p>${esc(m.detail)}</p></li>`;
  }).join('');
  return `
    <article class="card">
      <p class="eyebrow">${esc(ageText(state))}</p>
      <h2>${esc(formatHeight(state.heightCm))} · 大約紀錄高度的 ${pct}%</h2>
      <p>${beyond ? `已經超越${esc(sp.name)}嘅世界紀錄（${R / 100} 米）！冇上限，每日照樣長。` : `紀錄高度 ${R / 100} 米＝${esc(sp.name)}真實紀錄 ${sp.maxM} 米取整。`}</p>
      <div class="track fat"><div class="fill food" style="width:${Math.min(100, pct).toFixed(1)}%"></div></div>
      <p class="fine">碳吸收量約 ${carbonKg(state.heightCm, state.species)} 公斤 CO₂／年。將軍樹 ${SHERMAN_M} 米（而家 ${esc(percentOf(meters, SHERMAN_M))}%），海波龍 ${HYPERION_M} 米。${next ? `下一個高度里程：${esc(next.title)}（${next.meters} 米）。` : ''}</p>
    </article>
    <h3 class="sub">樹齡里程碑</h3>
    <ol class="miles">${ages}${recRow}</ol>
    <p class="fine">金銀銅按嗰日高度對比預計；計法見設定 → 玩法。</p>
    <h3 class="sub">徽章收藏</h3>
    ${collection}
    <h3 class="sub">能力徽章</h3>
    <ol class="miles">${badges}</ol>
    <p class="fine">免死金牌 ${meta.reviveTokens} 面${meta.starry ? '・已解鎖星空浮島' : ''}。${meta.landmark ? `養分地標：${esc(meta.landmark.name)}（${esc(formatHeight(meta.landmark.heightCm))}）。` : ''}</p>
    <h3 class="sub">高度里程</h3>
    <ol class="miles">${rows}</ol>
    <button type="button" class="texty" data-action="rename">改棵樹的名</button>
  `;
}

/** 成就 tab: a running count per weather, and the next count that claims an achievement. */
function achievementTab(view: View): string {
  const { state, meta } = view;
  const groups = WX_TRACKS.map((track) => {
    const n = state.wx?.counts?.[track.id] ?? 0;
    const info = weatherTrackCopy(track.id);
    const next = nextWxAwardCount(track.id, n);
    const nextTitle = weatherAchievementCopy(wxAwardId(track.id, next)).title;
    const earned = Object.values(state.wx?.awards ?? {})
      .filter((a): a is NonNullable<typeof a> => Boolean(a && parseWxAwardId(a.id)?.track === track.id))
      .sort((a, b) => (parseWxAwardId(a.id)?.count ?? 0) - (parseWxAwardId(b.id)?.count ?? 0));
    const got = earned.length ? `<p>已拎：${earned.map((a) => esc(weatherAchievementCopy(a.id).title)).join('、')}</p>` : '';
    return `<li class="${n ? 'done' : ''}"><strong>${esc(info.name)}</strong><span>已捱過 ${n} ${esc(track.unit)}</span><p>${esc(info.detail)}</p><p>下次成就：${esc(nextTitle)} · ${n} / ${next}</p>${got}</li>`;
  }).join('');
  const collected = (meta.weather ?? []).filter((m) => parseWxAwardId(m.id));
  const collection = collected.length
    ? `<ol class="miles">${collected
        .slice()
        .reverse()
        .map((m) => `<li class="done"><strong>${esc(weatherAchievementCopy(m.id).title)}</strong><span>已拎</span><p>${esc(m.treeName)}（${esc(speciesDef(m.species).name)}）· ${esc(m.date)} · 樹齡 ${shownAge({ ageDays: m.ageDays, started: true })} 日</p></li>`)
        .join('')}</ol>`
    : '<p class="fine">未有成就。</p>';
  const earnedIsle = new Set((meta.isle ?? []).map((a) => a.id));
  const isles = ISLE_AWARDS.map((a) => {
    const got = earnedIsle.has(a.id);
    return `<li class="${got ? 'done' : ''}"><strong>${esc(a.title)}</strong><span>${got ? '已拎' : '未拎'}</span><p>${esc(a.detail)}</p></li>`;
  }).join('');
  const hatched = state.nest?.hatched ?? 0;
  const nextEgg = nextNestAwardCount(hatched);
  const earnedEggs = [...(state.nest?.awards ?? [])].sort((a, b) => a.count - b.count);
  const gotEggs = earnedEggs.length ? `<p>已拎：${earnedEggs.map((a) => esc(nestAwardTitle(a.count))).join('、')}</p>` : '';
  const built = nestBuilds(hatched);
  const nextBuild = nestBuildAt(nextNestBuildCount(hatched));
  const gotBuilds = built.length ? `<p>島上：${built.map((k) => esc(nestBuildPhrase(k))).join('、')}</p>` : '';
  const collectedEggs = [...(meta.nest ?? [])].reverse();
  const eggCollection = collectedEggs.length
    ? `<ol class="miles">${collectedEggs.map((m) => `<li class="done"><strong>${esc(nestAwardTitle(m.count))}</strong><span>已拎</span><p>${esc(m.treeName)}（${esc(speciesDef(m.species).name)}）· ${esc(m.date)}</p></li>`).join('')}</ol>`
    : '';
  return `
    <h3 class="sub">島嶼</h3>
    <ol class="miles">${isles}</ol>
    <h3 class="sub">雀巢</h3>
    <ol class="miles"><li class="${hatched ? 'done' : ''}"><strong>雀鳥生蛋</strong><span>已孵化 ${hatched} 粒</span><p>健康度 50 或以上，每日一種見過嘅雀會生蛋。6 小時後孵化。第 1 粒同之後每 10 粒，島上多一件裝飾。第 5、15、25 粒，之後都係呢個次序，當晚多長一截。</p><p>下次裝飾：第 ${nextNestBuildCount(hatched)} 粒${nextBuild ? `（${esc(nestBuildPhrase(nextBuild))}）` : ''} · 下次加高：第 ${nextNestHeightCount(hatched)} 粒</p><p>下次成就：${esc(nestAwardTitle(nextEgg))} · ${hatched} / ${nextEgg}</p>${gotBuilds}${gotEggs}</li></ol>
    ${eggCollection}
    <h3 class="sub">天氣</h3>
    <ol class="miles">${groups}</ol>
    <h3 class="sub">成就收藏</h3>
    ${collection}
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

let modalTick = 0;

function modalFadeMs(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
}

function focusModal(modal: HTMLElement): void {
  const field = modal.querySelector('input');
  if (field instanceof HTMLInputElement) {
    field.focus();
    field.select();
  } else {
    modal.querySelector('button')?.focus();
  }
}

export function openModal(inner: string, cls = ''): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const tick = ++modalTick;
  const paint = () => {
    if (tick !== modalTick) return;
    modal.innerHTML = `<div class="modal-card glass ${cls}" role="dialog" aria-modal="true">${inner}</div>`;
    modal.hidden = false;
    modal.classList.remove('leaving', 'in');
    paintThumbs();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (tick !== modalTick) return;
      modal.classList.add('in');
      focusModal(modal);
    }));
  };
  const card = modal.querySelector<HTMLElement>('.modal-card');
  const sameWindow = !modal.hidden && modal.classList.contains('in') && card && cls !== 'celebrate' && !card.classList.contains('celebrate');
  if (sameWindow && card) {
    const tickSame = tick;
    const paintSame = () => {
      if (tickSame !== modalTick) return;
      card.className = `modal-card glass ${cls} page-out`;
      card.innerHTML = inner;
      card.scrollTop = 0;
      paintThumbs();
      requestAnimationFrame(() => {
        if (tickSame !== modalTick) return;
        card.classList.remove('page-out');
        focusModal(modal);
      });
    };
    if (modalFadeMs() === 0) {
      card.className = `modal-card glass ${cls}`;
      card.innerHTML = inner;
      card.scrollTop = 0;
      paintThumbs();
      focusModal(modal);
      return;
    }
    card.classList.add('page-out');
    window.setTimeout(paintSame, 180);
    return;
  }
  if (!modal.hidden && modal.classList.contains('in')) {
    modal.classList.remove('in');
    modal.classList.add('leaving');
    window.setTimeout(paint, modalFadeMs());
  } else {
    paint();
  }
}

/** Re-render the open modal without moving focus (season / species picker, lesson pages). */
export function updateModal(inner: string): void {
  const card = document.querySelector<HTMLElement>('#modal .modal-card');
  if (!card) return openModal(inner);
  const tick = ++modalTick;
  card.classList.add('swap');
  window.setTimeout(() => {
    if (tick !== modalTick) return;
    card.innerHTML = inner;
    paintThumbs();
    requestAnimationFrame(() => card.classList.remove('swap'));
  }, modalFadeMs() ? 180 : 0);
}

export function closeModal(then?: () => void): void {
  const modal = document.getElementById('modal');
  if (!modal || modal.hidden) {
    then?.();
    return;
  }
  const tick = ++modalTick;
  modal.classList.remove('in');
  modal.classList.add('leaving');
  window.setTimeout(() => {
    if (tick !== modalTick) return;
    modal.hidden = true;
    modal.innerHTML = '';
    modal.classList.remove('leaving', 'in');
    then?.();
  }, modalFadeMs());
}

export interface Pick {
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
  const sel: Pick = pick ?? { species: SPECIES[0]!.id };
  const legacy = meta.pendingLegacy && meta.landmark ? `<p class="legacy">${esc(meta.landmark.name)}留低嘅養分地標會令新樹開局養分 +40。</p>` : '';
  const cards = SPECIES.map(
    (sp) => `<button type="button" class="species ${sp.id === sel.species ? 'on' : ''}" data-species="${sp.id}" aria-pressed="${sp.id === sel.species}">
        <span class="sthumb" data-species-thumb="${sp.id}:3" data-cm="${stageSampleCm(3, sp.targetM * 100)}"></span>
        <b>${esc(sp.name)}</b><i>${esc(sp.scientific.split('（')[0]!)}</i>
        <small>紀錄 ${sp.targetM} 米</small>
      </button>`,
  ).join('');
  const chosen = speciesDef(sel.species);
  const R = chosen.targetM * 100;
  return `
    <p class="eyebrow">世界之樹・種一棵樹</p>
    <h2>揀樹種</h2>
    <p>九款樹任揀，棵樹會一直陪住你，冇完結日。細樹長得快，越接近紀錄高度越慢；樹齡 1個月、3個月、半年、1年、2年、3年有里程碑徽章。天氣跟住現實；水分、養分保持喺最佳範圍，惡劣天氣前加固。</p>
    ${legacy}
    <div class="species-pick">${cards}</div>
    <p class="species-blurb"><b>${esc(chosen.name)}</b>：${esc(chosen.blurb)}</p>
    <p class="fine">紀錄高度 ${chosen.targetM} 米（真實紀錄 ${chosen.maxM} 米）・頭一晚基本生長約 ${baseDailyGrowth(R, START.heightCm).toFixed(0)} 厘米・照顧 ×1 一年約 ${Math.round(expectedShare(365) * chosen.targetM)} 米</p>
    <button type="button" class="primary" data-action="pick-species">下一步</button>`;
}

/** Name comes after the species is chosen, on its own page. */
export function nameModal(current: string): string {
  return `
    <p class="eyebrow">世界之樹</p>
    <h2>為棵樹改名</h2>
    <p>個名之後都可以喺設定改。</p>
    <label>樹的名字<input id="tree-name" maxlength="12" value="${esc(current)}" autocomplete="off" /></label>
    <button type="button" class="primary" data-action="start-game">種低</button>
    <button type="button" class="texty" data-action="back-species">返回揀樹</button>`;
}

export function overModal(state: GameState, meta: MetaState, lines: string[]): string {
  const got = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
  const kept = Object.values(state.milestones ?? {}).length;
  const wxKept = Object.keys(state.wx?.awards ?? {}).length;
  const keptLine = kept || wxKept ? `呢棵樹攞到嘅 ${kept} 個里程碑同 ${wxKept} 個天氣成就會一直留喺收藏。` : '未到 1個月，未有里程碑徽章。';
  return `
    <p class="eyebrow">結算</p>
    <h2>${esc(state.treeName)}枯死咗</h2>
    <p>樹齡 ${shownAge(state)} 日，高 ${esc(formatHeight(state.heightCm))}（紀錄高度 ${recordPct(state)}%），碳吸收量約 ${carbonKg(state.heightCm, state.species)} 公斤／年。</p>
    ${got}
    <p>${keptLine}再種一棵，樹齡由第 1 日開始。</p>
    <p class="fine">能力徽章：一級 ${meta.badges['1']}・二級 ${meta.badges['2']}・三級 ${meta.badges['3']}</p>
    <button type="button" class="primary" data-action="new-game">再種一棵</button>`;
}

/** v14 celebratory card for milestones just reached (same badge style as the old season card). */
export function milestoneModal(state: GameState, meta: MetaState, awards: MilestoneAward[], lines: string[], weather: WeatherAward[] = [], recordHint = ''): string {
  const retro = awards.every((a) => a.retro);
  const main = awards[awards.length - 1]!;
  const items = awards.map((a) => `<li><b>${esc(awardLabel(a.id))}</b> ${esc(awardTier(a))} · ${esc(formatHeight(a.heightCm))}（紀錄 ${Math.round(a.share * 100)}%）</li>`).join('');
  const wxItems = weather.map((a) => `<li><b>${esc(weatherAchievementCopy(a.id).title)}</b> 🌤️</li>`).join('');
  const perks = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
  const title = awards.length > 1 ? `攞到 ${awards.length} 個里程碑！` : main.id === 'record' ? `${esc(state.treeName)}超越世界紀錄！` : `${esc(state.treeName)}${esc(awardLabel(main.id))}！`;
  return `
    <p class="eyebrow">${retro ? 'v14 新規則・補發里程碑' : '里程碑'}</p>
    <h2>🎉 ${title}</h2>
    <ul class="badges milestone-badges">${items}${wxItems}</ul>
    ${perks}
    <p>${retro ? '新規則：棵樹冇完結日，會一直陪住你；高度照舊，生長會慢慢接近紀錄高度。已經過咗嘅樹齡里程碑按而家高度補發。' : `繼續照顧，${esc(state.treeName)}會一直長落去。`}${nextMilestone(state) ? `下個里程碑：${esc(nextMilestone(state)!.label)}。` : ''}</p>
    ${recordHint ? `<p>${esc(recordHint)}</p>` : ''}
    <p class="fine">徽章收藏 ${(meta.milestones?.length ?? 0) + (meta.weather?.length ?? 0)} 個・能力徽章：一級 ${meta.badges['1']}・二級 ${meta.badges['2']}・三級 ${meta.badges['3']}</p>
    <button type="button" class="primary" data-action="close-modal">好嘢！</button>`;
}

/** Card for weather achievements reached on a night with no age milestone. */
export function weatherModal(state: GameState, meta: MetaState, awards: WeatherAward[]): string {
  const items = awards.map((a) => `<li><b>${esc(weatherAchievementCopy(a.id).title)}</b><span>${esc(weatherAchievementCopy(a.id).detail)}</span></li>`).join('');
  const title = awards.length > 1 ? `攞到 ${awards.length} 個天氣成就！` : weatherAchievementCopy(awards[0]!.id).title;
  return `
    <p class="eyebrow">天氣成就</p>
    <h2>🎉 ${esc(title)}</h2>
    <ul class="badges milestone-badges">${items}</ul>
    <p>繼續照顧，${esc(state.treeName)}會一直長落去。成就留喺成就分頁。</p>
    <p class="fine">徽章收藏 ${(meta.milestones?.length ?? 0) + (meta.weather?.length ?? 0)} 個</p>
    <button type="button" class="primary" data-action="close-modal">好嘢！</button>`;
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

/** `notify`: Android app reminder switch (null in browsers = row hidden). */
export function settingsModal(treeName: string, notify: boolean | null = null): string {
  const soundOn = soundEnabled();
  return `
    <p class="eyebrow">設定</p>
    <h2>${esc(treeName)}</h2>
    <div class="setting-row">
      <span>樹的名字</span>
      <button type="button" class="ghost" data-action="rename">改名</button>
    </div>
    <div class="setting-row">
      <span>聲音</span>
      <div class="seg">
        <button type="button" class="${soundOn ? 'on' : ''}" data-sound="1" aria-pressed="${soundOn}">開</button>
        <button type="button" class="${soundOn ? '' : 'on'}" data-sound="0" aria-pressed="${!soundOn}">關</button>
      </div>
    </div>
    ${
      notify === null
        ? ''
        : `<div class="setting-row">
      <span>提醒通知</span>
      <div class="seg">
        <button type="button" class="${notify ? 'on' : ''}" data-notify="on">開</button>
        <button type="button" class="${notify ? '' : 'on'}" data-notify="off">關</button>
      </div>
    </div>`
    }
    <div class="setting-row">
      <span>規則同計算</span>
      <button type="button" class="ghost" data-action="guide">玩法</button>
    </div>
    <div class="setting-row">
      <span>存檔</span>
      <div class="seg">
        <button type="button" data-action="export-save">匯出存檔</button>
        <button type="button" data-action="import-save">匯入存檔</button>
      </div>
    </div>
    <p class="set-legal"><button type="button" data-action="disclaimer">免責聲明</button><button type="button" data-action="privacy">私隱權政策</button></p>
    <p class="set-ver">版本 ${esc(APP_VERSION)}</p>
    <button type="button" class="primary" data-action="close-modal">關閉</button>
  `;
}

export function disclaimerModal(): string {
  return `
    <p class="eyebrow">免責聲明</p>
    <h2>免責聲明</h2>
    <p>世界之樹係遊戲。畫面入面嘅健康、水分、養分、倒塌同成長，都係玩法，唔代表一棵真樹。</p>
    <p>天氣嚟自香港天文台、澳門地球物理氣象局、臺灣中央氣象署或者 Open-Meteo，可能同官方最新消息有分別，唔係出行或者安全指引。惡劣天氣請跟當地氣象部門。</p>
    <button type="button" class="primary" data-action="settings">返回</button>
  `;
}

export function privacyModal(): string {
  return `
    <p class="eyebrow">私隱權政策</p>
    <h2>私隱權政策</h2>
    <p>位置只用嚟查天氣同顯示地名。拒絕定位就用香港嘅天氣。</p>
    <p>開咗提醒通知，會把推送同大約位置（四捨五入到 0.5 度），送到推送伺服器，用來決定發邊種天氣警告。</p>
    <p>應用程式底部會顯示橫幅廣告。廣告服務可能用廣告識別碼同裝置資料嚟顯示同量度廣告。</p>
    <button type="button" class="primary" data-action="settings">返回</button>
  `;
}

/** 匯出存檔: the code in a read-only box (already copied when possible). */
export function exportSaveModal(code: string, copied: boolean, canShare: boolean): string {
  return `
    <p class="eyebrow">匯出存檔</p>
    <h2>存檔碼</h2>
    <p>${copied ? '已經複製咗去剪貼簿。' : '長按下面揀「全選」再複製。'}將存檔碼貼去新機（或者新版本）嘅「匯入存檔」就得。</p>
    <textarea class="save-code" readonly rows="6">${esc(code)}</textarea>
    <div class="seg">
      <button type="button" data-action="copy-save">複製</button>
      ${canShare ? '<button type="button" data-action="share-save">分享</button>' : ''}
    </div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `;
}

/** 匯入存檔: paste box; `error` shows the last validation problem. */
export function importSaveModal(error = ''): string {
  return `
    <p class="eyebrow">匯入存檔</p>
    <h2>貼上存檔碼</h2>
    <p>匯入會取代而家呢棵樹同埋徽章紀錄。</p>
    <textarea class="save-code" rows="6" placeholder="SEKAI1.…"></textarea>
    ${error ? `<p class="save-error">${esc(error)}</p>` : ''}
    <button type="button" class="primary" data-action="do-import-save">匯入</button>
    <button type="button" class="ghost" data-action="close-modal">取消</button>
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
 * Height rail. Stages 0–3 show progress through the current stage (marker shows % of 紀錄高度). At 巨樹 the rail runs
 * from the stage start to 紀錄高度 R; beyond R the scale extends (no cap) with a 紀錄 tick and the marker reads >100%.
 */
export function railHtml(state: GameState): string {
  const target = speciesTargetCm(state.species);
  const stages = stagesFor(target);
  const stage = stageFor(state.heightCm, target);
  const next = stages[stage.index + 1];
  const pct = `紀錄 ${recordPct(state)}%`;
  if (next) {
    const p = stageProgress(state.heightCm, target);
    return `
      <span class="rail-top ${p > 0.9 ? 'dim' : ''}"><small>下一階段</small><b>${esc(formatHeight(stage.nextCm))}</b><small>${esc(next.name)}</small></span>
      <span class="rail-track"><span class="rail-fill" style="height:${(p * 100).toFixed(1)}%"></span><span class="rail-marker" style="bottom:${(p * 100).toFixed(1)}%"><b>${esc(formatHeight(state.heightCm))}</b><small>${pct}</small></span></span>
      <span class="rail-bottom"><b>${esc(formatHeight(stage.minCm))}</b><small>${esc(stage.name)}</small></span>`;
  }
  const beyond = state.heightCm > target;
  const top = beyond ? niceCeilCm(state.heightCm * 1.15) : target;
  const span = Math.max(1, top - stage.minCm);
  const p = Math.max(0, Math.min(1, (state.heightCm - stage.minCm) / span));
  const tp = Math.max(0, Math.min(1, (target - stage.minCm) / span));
  const tick = beyond ? `<span class="rail-target" style="bottom:${(tp * 100).toFixed(1)}%"><small>紀錄</small></span>` : '';
  return `
      <span class="rail-top ${!beyond && p > 0.9 ? 'dim' : ''} ${beyond ? 'beyond' : ''}"><small>${beyond ? '超越紀錄' : '紀錄高度'}</small><b>${esc(formatHeight(top))}</b><small>${beyond ? '冇上限' : '可以繼續長'}</small></span>
      <span class="rail-track ${beyond ? 'beyond' : ''}"><span class="rail-fill" style="height:${(p * 100).toFixed(1)}%"></span>${tick}<span class="rail-marker" style="bottom:${(p * 100).toFixed(1)}%"><b>${esc(formatHeight(state.heightCm))}</b><small>${pct}</small></span></span>
      <span class="rail-bottom"><b>${esc(formatHeight(stage.minCm))}</b><small>${esc(stage.name)}</small></span>`;
}
