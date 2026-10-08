import { BADGES, CARE, COLLAPSE_MAX, EMERGENCY, H_MULT_TIERS, N_DAILY_USE, N_FACTOR, N_MALNOURISHED, N_OPTIMAL, PREPS, R_DAILY_DECAY, R_MAX, RESIDENT_LEAVE_H, RESIDENT_MIN_H, RESIDENT_PEST_CUT, RESIDENT_PEST_MAX_SPECIES, RESIDENT_STREAKS, RESIDENT_STREAK_LATER, pestDamageWith, AGE_MILESTONES, MILESTONE_TIER_LABEL, RECORD_MILESTONE, START, W_MAX, W_NIGHT_LOSS, W_OPTIMAL, W_SATURATED, W_TIERS, WEATHER_EVENTS, WX_CATEGORY_LABEL, WX_TRACKS, nextWxAwardCount, parseWxAwardId, wxAwardId, type PrepId, type WeatherEventId } from './balance';
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
import { alertInForce, type AlertSource, type OfficialAlert } from './alerts';
import type { EventMode } from './events';
import { baseDailyGrowth, carbonKg, carbonParts, emergencyBonusText, expectedShare, pickEvent } from './rules';
import { emergencyName, eventLabel, regionalize, weatherAchievementCopy, weatherTrackCopy } from './labels';
import { NEST_HATCH_MS, NEST_MIN_HEALTH, nestAwardTitle, nestBirdName, nestBuildAt, nestBuildPhrase, nestBuilds, nestHatchAt, nestRewardText, nextNestAwardCount, nextNestBuildCount, nextNestHeightCount, warmBlock } from './nest';
import { actionLimit, advice, nextWaterTime, doubleRActive, emergencyOptions, eventTitle, nextMilestone, prepAmount, recordShare, shownAge, type NightPlan } from './sim';
import type { DayCond, ForecastDay, GameState, LogEntry, LogKind, MetaState, MilestoneAward, TabId, WeatherAward } from './types';
import { esc, formatHeight, percentOf } from './util';
import { dayLabel, nightLabel, weatherLabel, type WeatherProvider } from './weather';
import { APP_VERSION } from './version';
import { PRIVACY_URL, TERMS_URL } from './legal';
import { HEIGHT_UNITS, LOCALES, LOCALE_NAMES, getHeightUnit, getLocale, isChinese, t as tl, tables, live } from './i18n';
import { localize, logTexts } from './i18n/msg';
import { PLACES, PLACE_GROUPS } from './presets';

const WEEK = live(() => ([tl('ui.001'), tl('ui.002'), tl('ui.003'), tl('ui.004'), tl('ui.005'), tl('ui.006'), tl('ui.007')]));

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
  /** 1.4.51 'jma' = 氣象廳 numbers (Japan) with MET Norway for the rest. */
  model?: 'jma' | 'met';
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
  /** v1.4.24: the measured reading (absent for manual / offline weather) — 現在 shows this, the scene may add a storm. */
  obs?: { code: number; windKmh: number; gustKmh: number; precipMm: number };
  rainInHours: number | null;
  /** 1.4.26 who decides severe weather here (absent for manual weather). */
  mode?: EventMode;
  /** 1.4.26 national alert feed (US / Canada / Japan / Europe) when it covers the player. */
  feed?: { source?: AlertSource; alerts: OfficialAlert[]; attribution: string; known: boolean; tz: string; link?: string; disclaimer?: string };
  error?: string;
  overridden: boolean;
}

function icon(name: IconName): string {
  return ICONS[name];
}

/** Event definition with the v15 regional label / tip (烈風、暴風、大雨、豪雨 outside HK). */
const ev = (id: WeatherEventId) => ({ ...WEATHER_EVENTS[id], label: eventLabel(id), tip: regionalize(WEATHER_EVENTS[id].tip) });

function hoursText(h: number): string {
  if (h <= 0) return tl('ui.008');
  if (h < 1) return tl('ui.009', { p0: Math.max(1, Math.round(h * 60)) });
  return tl('ui.010', { p0: Math.round(h) });
}

function hm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return tl('ui.011', { p0: Math.floor(m / 60), p1: String(m % 60).padStart(2, '0') });
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
  if (id === 'hot') return short ? tl('ui.012') : tl('ui.013');
  if (id === 'rainstorm') return short ? tl('ui.014') : tl('ui.015');
  if (id === 'blackrain') return regionalize(short ? tl('ui.016') : tl('ui.017'));
  if (id === 'cold') return short ? tl('ui.018') : tl('ui.019');
  if (id === 'drizzle') return short ? tl('ui.020') : tl('ui.021');
  if (id === 'clear') return short ? tl('ui.018') : tl('ui.022');
  return short ? tl('ui.018') : tl('ui.023');
}

/** v13 health effect of an event, in words (熱／雨: 應急行動 cancels it; 風: × (1 − R/100), 青年樹 onwards). */
function damageText(id: WeatherEventId, unlocked: boolean): string {
  const d = ev(id);
  if (!d.damage) return tl('ui.024');
  if (d.category === 'heat') return tl('ui.025', { damage: d.damage });
  if (d.category === 'cold') return tl('ui.026', { damage: d.damage });
  if (d.category === 'rain') return tl('ui.027', { damage: d.damage, p1: emergencyName('rainDrain') });
  if (!unlocked) return tl('ui.028');
  return tl('ui.029', { damage: d.damage, collapseBelow: d.collapseBelow });
}

function effectText(id: WeatherEventId, unlocked = true): string {
  const d = ev(id);
  const parts = [damageText(id, unlocked)];
  parts.push(waterText(id));
  if (d.dR && unlocked) parts.push(tl('ui.030', { dR: d.dR }));
  return parts.join('・');
}

/** 倒塌 count text, e.g. 倒塌 1/2. */
export function collapseText(state: GameState): string {
  const n = state.collapses || 0;
  return n > COLLAPSE_MAX ? tl('ui.031', { n }) : tl('ui.032', { n, COLLAPSE_MAX });
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
  return score > 0 ? tl('ui.033') : score < 0 ? tl('ui.034') : tl('ui.035');
}

/** v13 collapse warning for 今晚預計 (null when tonight is safe). */
export function collapseWarning(p: NightPlan, collapses: number): { text: string; fatal: boolean } | null {
  const c = p.collapse;
  if (!c) return null;
  const label = ev(c.event).label;
  const head = tl('ui.036', { p0: Math.round(c.r), label, threshold: c.threshold });
  if (c.fatal && !c.revive) return { text: tl('ui.037', { head, collapses }), fatal: true };
  if (c.fatal) return { text: tl('ui.038', { head, collapses }), fatal: true };
  return { text: tl('ui.039', { head, collapses, COLLAPSE_MAX }), fatal: false };
}

/** The lines of the 今晚預計 breakdown (same NightPlan as settlement). */
export function previewLines(p: NightPlan): { text: string; value: string; tone: string; sub?: string }[] {
  const tone = (v: number) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');
  const waterSub =
    p.water.kind === 'loss' ? tl('ui.040', { p0: fmt(p.wBefore), p1: signed(p.water.delta) }) : p.water.kind === 'drizzle' ? tl('ui.041', { p0: fmt(p.wBefore), p1: signed(p.water.delta) }) : tl('ui.042', { p0: fmt(p.wBefore) });
  // v1.4.24: observed rain not yet in 水分 is shown on its own (而家 stays the real value).
  const pending = (p.pendingWater ?? []).map((h) => `${ev(h.event).label} ${signed(h.delta)}`).join(tl('ui.206'));
  const lines: { text: string; value: string; tone: string; sub?: string }[] = [
    { text: tl('ui.044', { p0: fmt(p.wAfter), p1: p.waterDeath ? tl('ui.043') : p.wLabel }), value: p.waterDeath ? tl('ui.045') : signed(p.wScore), tone: p.waterDeath ? 'down' : tone(p.wScore), sub: pending ? waterSub + tl('ui.wPending', { p0: pending }) : waterSub },
    { text: tl('ui.046', { p0: fmt(p.nAfter), p1: nLabel(p.nScore) }), value: signed(p.nScore), tone: tone(p.nScore), sub: tl('ui.047') },
  ];
  if (p.heat) lines.push(p.heat.handled ? { text: tl('ui.048', { p0: eventLabel('hot') }), value: '0', tone: 'flat', sub: tl('ui.049') } : { text: tl('ui.050', { p0: eventLabel('hot') }), value: signed(p.heat.score), tone: 'down', sub: tl('ui.051') });
  if (p.cold) lines.push(p.cold.handled ? { text: tl('ui.052'), value: '0', tone: 'flat', sub: tl('ui.053') } : { text: tl('ui.054'), value: signed(p.cold.score), tone: 'down', sub: tl('ui.055') });
  if (p.rain) {
    const label = ev(p.rain.event).label;
    const fix = emergencyName('rainDrain');
    lines.push(p.rain.handled ? { text: tl('ui.056', { label }), value: '0', tone: 'flat', sub: tl('ui.057', { fix }) } : { text: tl('ui.058', { label }), value: signed(p.rain.score), tone: 'down', sub: tl('ui.059', { fix }) });
  }
  if (p.wind) {
    const label = ev(p.wind.event).label;
    lines.push(
      p.wind.locked
        ? { text: tl('ui.060', { label }), value: '0', tone: 'flat', sub: tl('ui.028') }
        : { text: tl('ui.061', { label, p1: Math.round(p.wind.r) }), value: signed(p.wind.score), tone: tone(p.wind.score), sub: tl('ui.062', { base: p.wind.base, p1: Math.round(p.wind.r) }) },
    );
  }
  if (!p.heat && !p.cold && !p.rain && !p.wind) lines.push({ text: tl('ui.063', { p0: ev(p.event).label }), value: '0', tone: 'flat' });
  if (p.emergencyBonus)
    lines.push({
      text: p.emergencyCount > 1 ? tl('ui.064', { p0: emergencyBonusText(p.emergencyCount).replace(/ = .*$/, '') }) : tl('ui.065'),
      value: signed(p.emergencyBonus),
      tone: 'up',
      sub: p.emergencyCount > 1 ? tl('ui.066', { emergencyCount: p.emergencyCount }) : tl('ui.067'),
    });
  if (p.pest) lines.push({ text: tl('ui.068'), value: signed(-p.pest), tone: 'down' });
  return lines;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** v14 今晚預計 growth line (same GrowthPlan settleDay applies): 「今晚生長 +29.8 厘米（基本 29.8 × 健康 ×1 × 天氣 ×1）」. */
export function previewGrowthText(p: NightPlan): string {
  const g = p.growth;
  const dG = r1(g.grownCm - g.heightBefore);
  const head = tl('ui.070', { p0: dG > 0 ? '+' : dG < 0 ? M : '±', p1: fmt(Math.abs(dG)), p2: fmt(g.base), p3: g.floor ? tl('ui.069') : '', mult: g.mult, bonus: g.bonus });
  const tail = p.collapse && g.heightAfter !== g.grownCm ? tl('ui.071', { p0: formatHeight(g.heightAfter) }) : ` → ${formatHeight(g.grownCm)}`;
  return head + tail;
}

/** v14 「樹齡 12 日 · 下個里程碑：1個月」. */
export function ageText(state: GameState): string {
  const next = nextMilestone(state);
  return tl('ui.073', { p0: shownAge(state), p1: next ? tl('ui.072', { label: next.label }) : '' });
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
  const val = p.waterDeath ? tl('ui.045') : signed(p.dH);
  const lines = previewLines(p)
    .map((l) => `<li class="${l.tone}"><span>${esc(l.text)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span><b>${esc(l.value)}</b></li>`)
    .join('');
  const pop = previewOpen
    ? tl('ui.076', { p0: collapseHtml(p, collapses), lines, t, p3: fmt(p.hBefore), p4: fmt(p.hAfter), p5: esc(val), p6: esc(previewGrowthText(p)), p7: dying ? tl('ui.074') : tl('ui.075') })
    : '';
  return { chip: tl('ui.077', { t, previewOpen, p2: p.collapse ? '⚠️' : '', p3: esc(val), p4: icon(previewOpen ? 'chevronDown' : 'chevronRight') }), pop };
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
  return tl('ui.078', { p0: ok ? 'ok' : 'off', zone, flash, p3: W_OPTIMAL[0], p4: W_OPTIMAL[1], p5: waterTrack(v, 'bar-track', 'bar-fill'), v });
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
  if (typeof el.setAttribute === 'function') {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('data-action', 'hatch-card');
  }
  const text = hatchClockText(state);
  el.hidden = text == null;
  if (text) {
    // The clock string stays the whole innerHTML the countdown test checks. A real card then gets the reward as a second line.
    setHtml(el, tl('ui.079', { text }));
    const host = el as HTMLElement;
    if (typeof host.appendChild === 'function' && typeof document.createElement === 'function') {
      const n = (state.nest?.hatched ?? 0) + 1;
      let extra = host.querySelector?.('.hatch-reward');
      if (!extra) {
        extra = document.createElement('span');
        extra.className = 'hatch-reward';
        host.appendChild(extra);
      }
      extra.textContent = tl('ui.079b', { line: nestRewardText(n) });
    }
  }
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
      title: tl('ui.080', { p0: clockLeft(dyingLeft) }),
      body: tl('ui.081', { p0: W_OPTIMAL[0], p1: W_OPTIMAL[1], p2: N_OPTIMAL[0], p3: esc(hm(Math.max(0, Math.floor(dyingLeft / 60000)))) }),
      btns: tl('ui.082'),
    });
  }
  if (!state.over && state.windUnlocked && doubleRActive(state) && !state.doubleRSeen) {
    out.push({
      key: 'collapse',
      cls: 'double-r',
      title: tl('ui.083'),
      body: tl('ui.084', { p0: PREPS.stakes.amount * 2, p1: PREPS.ropes.amount * 2, p2: PREPS.prune.amount * 2, R_MAX, p4: esc(collapseText(state)) }),
      btns: tl('ui.085'),
    });
  }
  if (state.morningNote) {
    // 1.4.36: written in the language of that morning — show it in the current one.
    const note = localize(state.morningNote);
    const prefix = tl('sim.summaryPrefix');
    const summary = note.startsWith(prefix);
    out.push({ key: 'note', cls: '', title: summary ? tl('ui.086') : tl('ui.087'), body: esc(summary ? note.slice(prefix.length) : note), btns: tl('ui.088') });
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
  return tl('ui.089', { rows });
}

export type LessonId = 'water' | 'feed' | 'health';

/** A stat change, with the unit: +10點 / −10點. */
function pts(n: number): string {
  return tl('ui.090', { p0: n > 0 ? '+' : '', n });
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
        title: tl('ui.091'),
        body: tl('ui.092', { lo, hi, perHour: CARE.water.perHour, p3: pts(CARE.water.amount), W_SATURATED, perDay_: CARE.drain.perDay, p6: pts(CARE.drain.amount) }),
      },
      {
        title: tl('ui.093'),
        body: tl('ui.094', { p0: pts(-W_NIGHT_LOSS), p1: pts(drizzle.dW), p2: pts(rain.dW), W_SATURATED }),
      },
      {
        title: tl('ui.095'),
        body: tl('ui.096', { lo, hi, p2: pts(W_TIERS.find((t) => t.tone === 'ok')!.score), label: dry.label, p5: pts(dry.score), p6: rot[0]!.label, p7: hi + 1, p8: rot[0]!.max, p9: pts(rot[0]!.score), p10: rot[1]!.label, p11: rot[0]!.max + 1, p12: rot[1]!.max, p13: pts(rot[1]!.score), p14: rot[2]!.label, p15: rot[1]!.max + 1, p16: pts(rot[2]!.score), W_MAX }),
      },
      {
        title: tl('ui.097'),
        body: tl('ui.098', { p0: pts(hot.dW), p1: emergencyName('heatWater'), p2: pts(EMERGENCY.heatWater.amount), damage: hot.damage, p4: pts(EMERGENCY.bonus), perHour: CARE.water.perHour, W_SATURATED }),
      },
    ];
  }
  if (id === 'feed') {
    const [lo, hi] = N_OPTIMAL;
    return [
      {
        title: tl('ui.099'),
        body: tl('ui.100', { p0: pts(CARE.fertilize.amount), perDay: CARE.fertilize.perDay }),
      },
      {
        title: tl('ui.101'),
        body: tl('ui.102', { lo, hi, p2: pts(N_FACTOR.good), N_MALNOURISHED, p4: lo - 1, p6: pts(N_FACTOR.bad), N_DAILY_USE }),
      },
    ];
  }
  const fast = H_MULT_TIERS[0]!;
  const normal = H_MULT_TIERS[1]!;
  const weak = H_MULT_TIERS[2]!;
  return [
    {
      title: tl('ui.103'),
      body: tl('ui.104', { min: fast.min, mult: fast.mult, min_: normal.min, p3: fast.min - 1, min__: weak.min, p5: normal.min - 1, mult_: weak.mult }),
    },
  ];
}

export function lessonModal(id: LessonId, page: number): string {
  const pages = lessonPages(id);
  const i = Math.max(0, Math.min(page, pages.length - 1));
  const cur = pages[i]!;
  const last = i === pages.length - 1;
  const step = pages.length > 1 ? tl('ui.105', { p0: i + 1, length: pages.length }) : '';
  const btn = last
    ? tl('ui.106')
    : tl('ui.107');
  return tl('ui.108', { p0: esc(cur.title), p1: esc(cur.body), step, btn });
}

/** 1.4.58 welcome tour: water → fertilise → weather card → health 90+ / nest. Skippable; replay from 設定 / 玩法. */
export const TOUR_PAGES = 4;

export function tourModal(page: number): string {
  const i = Math.max(0, Math.min(page, TOUR_PAGES - 1));
  const n = i + 1;
  const last = n === TOUR_PAGES;
  const h = NEST_MIN_HEALTH;
  return `<div class="tour" data-tour="${n}"><p class="eyebrow">${esc(tl('tour.eyebrow'))} · ${esc(tl('tour.step', { n, total: TOUR_PAGES }))}</p>`
    + `<div class="tour-art" aria-hidden="true">${icon((['drop', 'sprout', 'wind', 'bird'] as const)[i]!)}</div>`
    + `<h2>${esc(tl(`tour.t${n}`, { h }))}</h2><p>${esc(tl(`tour.b${n}`, { h }))}</p>`
    + `<div class="tour-dots" aria-hidden="true">${Array.from({ length: TOUR_PAGES }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>`
    + `<div class="btn-stack"><button type="button" class="primary" data-action="${last ? 'tour-done' : 'tour-next'}">${esc(tl(last ? 'tour.done' : 'tour.next'))}</button>`
    + (last ? '' : `<button type="button" class="ghost" data-action="tour-skip">${esc(tl('tour.skip'))}</button>`)
    + `</div></div>`;
}

/** 1.4.30 wordless swipe bar above the growth log: two dots show where you are; swipe on the bar to switch. */
function renderIsleBar(isle: View['isle'], show: boolean): void {
  const bar = document.getElementById('isle-bar');
  if (!bar) return;
  bar.hidden = !show;
  if (!bar.firstElementChild) bar.innerHTML = '<span class="isle-track"><i class="isle-dot" data-n="0"></i><i class="isle-dot" data-n="1"></i></span>';
  const locked = !isle.open && isle.here !== 1;
  bar.dataset.here = String(isle.here);
  bar.dataset.locked = locked ? '1' : '0';
  bar.setAttribute('aria-valuemin', '1');
  bar.setAttribute('aria-valuemax', '2');
  bar.setAttribute('aria-valuenow', String(isle.here + 1));
  bar.setAttribute('aria-label', tl(isle.here === 1 ? 'isle.aria1' : locked ? 'isle.ariaLocked' : 'isle.aria0'));
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
  renderIsleBar(view.isle, state.started || bare);
  const status = document.getElementById('status-card');
  if (status && bare) {
    status.classList.remove('pop-open');
    status.innerHTML = tl('ui.109', { p0: icon('chevronRight') });
  } else if (status) {
    const stage = stageFor(state.heightCm, speciesTargetCm(state.species));
    const night = state.started && !state.over ? previewChip(view.preview, Boolean(state.dying), state.collapses || 0) : null;
    const emerg = state.started && !state.over ? emergencyButtons(view, 'mini') : '';
    status.classList.toggle('pop-open', Boolean(night?.pop));
    status.innerHTML = tl('ui.113', { p0: icon('chevronRight'), p1: statusName(state.treeName), p2: esc(speciesDef(state.species).name), p3: esc(stage.name), p4: shownAge(state), p5: esc(formatRealAge(realAgeDays(state.heightCm, state.species))), p6: esc(formatCarbon(carbonKg(state.heightCm, state.species))), p7: statBar('H', tl('ui.110'), state.health, [50, 100], 'health', state.dying ? tl('ui.045') : ''), p8: night?.chip ?? '', p9: waterBar(state.moisture), p10: statBar('N', tl('ui.111'), state.nutrients, N_OPTIMAL, 'food', '', N_MALNOURISHED), p11: statBar('R', tl('ui.112'), state.resist, [60, 100], state.windUnlocked ? 'shield' : 'shield locked'), p12: state.windUnlocked ? `<p class="collapse-count ${(state.collapses || 0) >= COLLAPSE_MAX ? 'danger' : state.collapses ? 'warn' : ''}">${esc(collapseText(state))}</p>` : '', p13: emerg ? `<div class="emerg-acts">${emerg}</div>` : '', p14: night?.pop ?? '' });
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
    dock.innerHTML = tl('ui.114', { p0: icon('sprout') });
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
    dock.innerHTML = tl('ui.130', { p0: dockBtn('d-water short', 'data-action="water"', 'drop', tl('ui.115'), state.moisture > W_SATURATED ? tl('ui.waterNow', { p0: Math.round(state.moisture) }) : state.moisture >= W_SATURATED ? tl('ui.116') : waterSub(water), water.used >= water.max || state.moisture >= W_SATURATED), p1: state.moisture > W_SATURATED ? 'alert' : '', p2: drains.used >= drains.max ? 'disabled' : '', p3: icon('drain'), p4: drains.used >= drains.max ? tl('ui.117') : tl('ui.118', { p0: drains.max - drains.used }), p5: dockBtn('d-feed short', 'data-action="fertilize"', 'sprout', tl('ui.099'), feed.used >= feed.max ? tl('ui.119') : `${feed.used}/${feed.max}`, feed.used >= feed.max), p6: state.pest.active ? 'alert' : '', p7: state.care.dewormed ? 'disabled' : '', p8: icon('bug'), p9: state.care.dewormed ? tl('ui.120') : state.pest.active ? tl('ui.121') : tl('ui.122'), p10: dockBtn('d-guard', 'data-open="care" data-focus="guard"', 'shield', tl('ui.123'), !state.windUnlocked ? tl('ui.124') : dbl ? tl('ui.125') : prepShort ? tl('ui.126') : `R ${Math.round(state.resist)}`, !state.windUnlocked, dbl ? '×2' : prepShort ? '!' : ''), p11: warmOk ? 'hot-pulse' : 'done', p12: covered ? ' lit' : '', p13: warmOk ? '' : 'disabled aria-disabled="true"', p14: icon('mulch'), p15: covered ? tl('ui.127') : coldOn ? tl('ui.128') : tl('ui.129') });
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
      ? tl('ui.132', { cls: c.cls, p1: noteOpen ? ' open' : '', key: c.key, noteOpen, title: c.title, p5: icon('chevronDown'), p6: cards.length > 1 ? tl('ui.131', { p0: i + 1, length: cards.length, p4: icon('chevronRight') }) : '', p7: noteOpen ? '' : ' hidden', body: c.body, btns: c.btns })
      : '';
    setHtml(slot, html);
  }
  document.body.classList.toggle('night', view.night);
  document.body.classList.toggle('cold', Boolean(cond.cold));
  document.body.classList.toggle('thriving', state.health >= 80 && !state.over);
  document.body.classList.toggle('dying', Boolean(state.dying) && !state.over);
  document.getElementById('scene')?.setAttribute('aria-label', tl('ui.133', { treeName: state.treeName, p1: weatherLabel(cond.code), p2: formatHeight(state.heightCm) }));
  // Tab title: just the app name per locale (the tree's name used to be prefixed → 「世界之樹 · 世界之樹」 by default).
  document.title = tl('sim.001');
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
    const tail = cat === 'wind' ? (state.windUnlocked ? tl('ui.135', { p0: Math.round(state.resist) }) : tl('ui.136')) : cat === 'heat' ? tl('ui.137') : cat === 'cold' ? tl('ui.138') : cat === 'rain' ? tl('ui.139', { p0: emergencyName('rainDrain') }) : '';
    line = `<span class="warn-line">${icon('warn')}${esc(signal ?? ev(cd.event).label)} · ${hoursText(cd.hours)}${tail ? ` · ${tail}` : ''}</span>`;
  } else if (wx.rainInHours !== null && !cond.raining && !simulated && !view.manual) {
    line = wx.rainInHours <= 1 ? tl('ui.140') : tl('ui.141', { rainInHours: wx.rainInHours });
  } else if (view.manual) {
    line = tl('ui.142', { p0: esc(ev(view.todayEvent).label), p1: esc(hm(view.minutesToSettle)) });
  } else {
    // A remembered day event plus the time until nightly settlement is not a weather forecast.
    line = '';
  }
  const chips = wx.warnings
    .slice(0, 4)
    .map((w) => `<span class="wchip ${w.tone}${w.inactive ? ' later' : ''}" title="${esc(w.name)}">${warnIcon(w)}<span>${esc(warningDisplay(w))}</span></span>`)
    .join('');
  const source = sourceLabel(wx);
  const temp = firstLoad || noReading ? '--' : `${Math.round(cond.tempC)}°C`;
  const shownLabel = firstLoad ? tl('ui.143') : noReading ? tl('ui.144') : label;
  setAttr(hit, 'aria-label', simulated ? tl('ui.145', { temp, shownLabel }) : tl('ui.146', { temp, shownLabel }));
  setHtml(card.querySelector('.wx-art')!, nowArt(view));
  setHtml(card.querySelector('.wx-main')!, `<b>${temp}</b><span>${esc(shownLabel)}</span>`);
  const place = card.querySelector<HTMLButtonElement>('.wx-place')!;
  setAttr(place, 'aria-label', tl('ui.148', { place: view.place, p1: view.placeNote ? tl('ui.147', { placeNote: view.placeNote }) : '' }));
  setHtml(place, placeChipHtml(view.place, view.placeNote, wx.station && !simulated && !view.manual ? wx.station : ''));
  setHtml(
    card.querySelector('.wx-rest')!,
    `${chips && !view.manual ? `<span class="wx-warns">${chips}</span>` : ''}${line ? `<span class="wx-line">${line}</span>` : ''}<span class="wx-src ${simulated ? 'sim' : ''}">${source}</span>`,
  );
}

/** v16.1 place picker chip inside the weather card: 📍 name, 預設 tag, ▾, then the station (if any). */
export function placeChipHtml(place: string, note: string, station: string): string {
  return tl('ui.150', { p0: icon('pin'), p1: esc(place), p2: note ? `<small class="wx-tag">${esc(note)}</small>` : '', p3: icon('chevronDown'), p4: station ? tl('ui.149', { p0: esc(station) }) : '' });
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
  if (wx.overridden) return tl('ui.151');
  if (wx.provider === 'sim') {
    if (wx.loading) return tl('ui.152');
    const note = wx.bureau === 'smg' && wx.hkoUsed ? tl('ui.153') : wx.bureau === 'cwa' && wx.hkoUsed ? tl('ui.154') : wx.hkoUsed ? tl('ui.155') : '';
    return tl('ui.156', { note });
  }
  const names = wx.bureau === 'smg' ? tl('ui.157') : wx.bureau === 'cwa' ? tl('ui.158') : wx.bureau === 'hko' || wx.provider === 'hko' ? tl('ui.159') : wx.model === 'jma' ? tl('wx.srcJma') : 'MET Norway';
  if (wx.origin === 'cache') return tl('ui.160', { p0: esc(wx.updated), names });
  return tl('ui.162', { names, p1: wx.updated ? ` · ${esc(wx.updated)}` : '', p2: wx.loading ? tl('ui.161') : '' });
}

/** Small badge in the spirit of HKO's warning icons (drawn locally, not the official artwork). */
export function warnIcon(w: HkoWarning): string {
  // Taiwan (中央氣象署) warnings reuse the same badges.
  if (w.group === 'TWTY' || w.group === 'TWWIND') {
    const n = w.group === 'TWTY' ? tl('ui.163') : tl('ui.164');
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

/** v1.4.23 dock 澆水 sub-line: taps left this clock hour, or when the next hour opens. */
function waterSub(water: { used: number; max: number }): string {
  const left = water.max - water.used;
  return left > 0 ? tl('ui.waterLeft', { n: left }) : tl('ui.waterNext', { time: nextWaterTime() });
}

/**
 * Status-card name. Chinese templates read "{name} · {species}{stage}"; the English template is
 * "{p1}{species} · {stage}", so p1 carries its own separator there. A default name (any locale's
 * sim.001, e.g. from an old save) is shown in the current language.
 */
function statusName(name: string): string {
  const n = name.trim();
  const defaults = Object.values(tables()).map((tb) => tb['sim.001']);
  const shown = esc(!n || defaults.includes(n) ? tl('sim.001') : n);
  return isChinese() ? shown : `${shown} · `;
}

function statBar(key: string, label: string, value: number, band: readonly [number, number], tone: string, flag = '', warnAt?: number): string {
  const v = Math.round(Math.max(0, Math.min(100, value)));
  const ok = v >= band[0] && v <= band[1];
  const mid = !ok && warnAt !== undefined && v >= warnAt;
  const state = ok ? 'ok' : mid ? 'mid' : 'off';
  return tl('ui.165', { tone, state, label, p3: band[0], p4: band[1], key, p8: band[1] - band[0], v, p10: flag ? esc(flag) : v });
}

function dockBtn(tone: string, attr: string, ic: IconName, label: string, sub: string, disabled: boolean, badge = ''): string {
  return `<button type="button" class="dock-btn ${tone} ${disabled ? 'done' : ''}" ${attr} ${disabled ? 'aria-disabled="true"' : ''}>
    <span class="dock-ic">${icon(ic)}</span><span class="dock-label">${label}</span>${sub ? `<small>${esc(sub)}</small>` : ''}${badge ? `<em class="badge">${esc(badge)}</em>` : ''}
  </button>`;
}

/* ---------- Growth log bottom sheet ---------- */

const KIND_META: Record<LogKind, { icon: IconName; tone: string; title: string }> = live(() => ({
  plant: { icon: 'sprout', tone: 'green', title: tl('ui.166') },
  water: { icon: 'drop', tone: 'blue', title: tl('ui.167') },
  fertilize: { icon: 'leaf', tone: 'green', title: tl('ui.168') },
  deworm: { icon: 'bug', tone: 'orange', title: tl('ui.169') },
  drain: { icon: 'drain', tone: 'blue', title: tl('ui.170') },
  reinforce: { icon: 'shield', tone: 'orange', title: tl('ui.171') },
  animal: { icon: 'bird', tone: 'purple', title: tl('ui.172') },
  stage: { icon: 'arrowUp', tone: 'blue', title: tl('ui.173') },
  settle: { icon: 'calendar', tone: 'blue', title: tl('ui.174') },
  'storm-safe': { icon: 'shield', tone: 'green', title: tl('ui.175') },
  'storm-hit': { icon: 'warn', tone: 'red', title: tl('ui.176') },
  pest: { icon: 'bug', tone: 'red', title: tl('ui.068') },
  dying: { icon: 'heart', tone: 'red', title: tl('ui.045') },
  badge: { icon: 'sparkle', tone: 'purple', title: tl('ui.177') },
  event: { icon: 'sparkle', tone: 'yellow', title: tl('ui.178') },
  grow: { icon: 'sprout', tone: 'blue', title: tl('ui.179') },
  emergency: { icon: 'drop', tone: 'blue', title: tl('ui.180') },
  collapse: { icon: 'warn', tone: 'red', title: tl('ui.181') },
  unlock: { icon: 'shield', tone: 'orange', title: tl('ui.182') },
}));

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
  // Settle lines read 「健康 70 → 64」 / "Health 70 → 64" (whichever language wrote them).
  const HEALTH = /(?:健康|[Hh]ealth)\s*(\d+)\s*→\s*(\d+)/;
  const settle = entries.find((e) => e.kind === 'settle') ?? entries.find((e) => HEALTH.test(e.text));
  const match = settle?.text.match(HEALTH);
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
      : tl('ui.183', { p0: esc(formatLong(day)) });
  return tl('ui.184', { y, m, p2: month >= today.slice(0, 7) ? ' disabled' : '', p3: WEEK.map((w) => `<span>${w}</span>`).join(''), p4: cells.join(''), detail });
}

export function renderSheet(state: GameState, today: string): void {
  const body = document.getElementById('sheet-body');
  const title = document.getElementById('sheet-title');
  if (!body) return;
  if (title) title.textContent = tl('ui.185');
  if (!calMonth || calMonth > today.slice(0, 7)) calMonth = today.slice(0, 7);
  const key = `${today}|${calMonth}|${calDay}|${Math.round(state.health)}|${state.log.length}|${state.log[0]?.text ?? ''}|${state.log[0]?.time ?? ''}|${getLocale()}`;
  if (key === sheetKey) return;
  sheetKey = key;
  body.innerHTML = logCalendarHtml(state.log, today, calMonth, calDay, state.health);
}

function logRow(entry: LogEntry): string {
  const meta = entry.kind ? KIND_META[entry.kind] : { icon: 'calendar' as IconName, tone: 'gray', title: tl('ui.186') };
  const shown = logTexts(entry);
  const title = shown.title || meta.title;
  const time = entry.time || tl('ui.187');
  const chip = entry.reward ? `<span class="chip ${entry.reward.tone}">${esc(shown.reward ?? '')}</span>` : '';
  return `<li class="log-row">
    <time>${esc(time)}</time>
    <span class="log-ic ${meta.tone}">${icon(meta.icon)}</span>
    <span class="log-copy"><b>${esc(title)}</b><span>${esc(shown.text)}</span></span>
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
    ['care', tl('ui.188')],
    ['album', freshAnimals ? tl('ui.189', { freshAnimals }) : tl('ui.190')],
    ['milestones', tl('ui.191')],
    ['achievements', tl('ui.192')],
  ];
  return `<nav class="tabs" role="tablist">${items
    .map(
      ([id, label]) =>
        `<button type="button" role="tab" data-tab="${id}" class="${id === active ? 'on' : ''}" aria-selected="${id === active}">${label}</button>`,
    )
    .join('')}</nav>`;
}

function body(view: View): string {
  if (!view.state.started) return tl('ui.193');
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
  if (opts.heatWater) items.push({ id: 'heatWater', action: 'heat-water', label: tl('ui.097'), sub: state.moisture >= W_SATURATED ? tl('ui.194') : tl('ui.195', { amount: EMERGENCY.heatWater.amount }), done: Boolean(state.care.heatWater), tone: 'heat' });
  if (opts.rainDrain) {
    const black = view.todayEvents.includes('blackrain');
    items.push({ id: 'rainDrain', action: 'rain-drain', label: emergencyName('rainDrain'), sub: tl('ui.196', { floor: EMERGENCY.rainDrain.floor, p1: black ? 15 : 10 }), done: Boolean(state.care.rainDrain), tone: 'rain' });
  }
  // v15 保暖 lives on its own dock button, so the small status-card strip leaves it out.
  if (opts.warmCover && variant === 'act') items.push({ id: 'warmCover', action: 'warm-cover', label: tl('ui.197'), sub: tl('ui.198', { damage: WEATHER_EVENTS.cold.damage }), done: Boolean(state.care.warmCover), tone: 'cold' });
  if (!items.length) return '';
  const emIcon = (id: string): IconName => (id === 'heatWater' ? 'drop' : id === 'warmCover' ? 'mulch' : 'drain');
  if (variant === 'mini') {
    return items
      .map((i) => tl('ui.200', { tone: i.tone, p1: i.done ? 'done' : 'hot-pulse', action: i.action, p3: i.done ? 'disabled' : '', p4: icon(emIcon(i.id)), label: i.label, p6: i.done ? tl('ui.127') : tl('ui.199') }))
      .join('');
  }
  return tl('ui.202', { p0: items
    .map((i) => tl('ui.201', { tone: i.tone, p1: i.done ? 'done' : 'hot-pulse', action: i.action, p3: i.done ? 'disabled' : '', p4: icon(emIcon(i.id)), label: i.label, p6: esc(i.done ? tl('ui.127') : i.sub) }))
    .join('') });
}

/** One line for an event that is not the card headline. */
function sideEventLine(id: WeatherEventId, unlocked: boolean): string {
  const d = ev(id);
  if (!d.damage) return tl('ui.203', { label: d.label, p1: waterText(id) });
  return tl('ui.203', { label: d.label, p1: effectText(id, unlocked) });
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
    (opts.heatWater && text.includes(emergencyName('heatWater'))) ||
    (opts.rainDrain && text.includes(emergencyName('rainDrain'))) ||
    (opts.warmCover && text.includes(tl('ui.echoWarm'))) ||
    // 「今晚水分預計 …，適中 +5。…」 (the all-good line) is already shown by the 今晚預計 card.
    text.startsWith(tl('sim.167').split('{')[0]!);
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
  const soon = cd && !same ? tl('ui.204', { p0: icon('warn'), p1: esc(ev(cd.event).label), p2: esc(hoursText(cd.hours)), p3: esc(effectText(cd.event, state.windUnlocked)) }) : '';
  return tl('ui.215', { p0: today.severe || cd ? 'warn' : '', p1: view.manual ? tl('ui.205') : '', p2: esc(hm(view.minutesToSettle)), p3: esc(today.label), p4: same && cd ? ` · ${esc(hoursText(cd.hours))}` : '', p5: esc(effectText(view.todayEvent, state.windUnlocked)), p6: extras.length ? tl('ui.207', { p0: extras.map((e) => esc(sideEventLine(e, state.windUnlocked))).join(tl('ui.206')) }) : '', soon, emerg, p9: careAdvice(view), p10: actionBtn('water', 'drop', 'blue', tl('ui.115'), state.moisture >= W_SATURATED ? tl('ui.208', { used: water.used, max: water.max }) : tl('ui.waterAct', { amount: CARE.water.amount, used: water.used, max: water.max }), water.used >= water.max || state.moisture >= W_SATURATED), p11: actionBtn('drain', 'drain', 'purple', tl('ui.209'), tl('ui.210', { amount: CARE.drain.amount, used: drain.used, max: drain.max }), drain.used >= drain.max), p12: actionBtn('fertilize', 'sprout', 'green', tl('ui.099'), tl('ui.211', { amount: CARE.fertilize.amount, used: feed.used, max: feed.max }), feed.used >= feed.max), p13: actionBtn('deworm', 'bug', 'orange', tl('ui.122'), state.care.dewormed ? tl('ui.212') : state.pest.active ? tl('ui.213', { p0: pestDamageWith(state.residents.length) }) : tl('ui.214'), state.care.dewormed), p14: guardCards(view), p15: nightCard(view.preview, state.collapses || 0), p16: s ? settlementCard(s) : '', p17: esc(event.title), p18: esc(event.text), p19: esc(formatCarbon(carbonKg(state.heightCm, state.species))), daysCared: state.daysCared });
}

export function settlementCard(s: NonNullable<GameState['lastSettlement']>): string {
  return tl('ui.238', { p0: esc(formatShort(s.date)), p1: esc(ev(s.event).label), p2: Math.round(s.hBefore), p3: Math.round(s.hAfter), p4: s.wLabel ? `・${esc(localize(s.wLabel))}` : tl('ui.216'), p5: s.wFactor > 0 ? '+' : '', wFactor: s.wFactor, p7: Math.round(s.wBefore), p8: Math.round(s.wAfter), p9: s.wNight ? (s.wNight.kind === 'loss' ? tl('ui.217') : s.wNight.kind === 'drizzle' ? tl('ui.218') : tl('ui.219')) : '', p10: s.nFactor > 0 ? '+' : '', nFactor: s.nFactor, p12: Math.round(s.nBefore), p13: Math.round(s.nAfter), p14: s.heat === undefined && s.wind === undefined && s.cold === undefined
            ? tl('ui.220', { finalDamage: s.finalDamage, baseDamage: s.baseDamage, p2: Math.round(s.rBefore) })
            : tl('ui.232', { p0: s.heat ? tl('ui.223', { p0: esc(eventLabel('hot')), p1: s.heat.handled ? '0' : `−${s.heat.base}`, p2: s.heat.handled ? tl('ui.221') : tl('ui.222') }) : '', p1: s.cold ? tl('ui.225', { p0: s.cold.handled ? '0' : `−${s.cold.base}`, p1: s.cold.handled ? tl('ui.221') : tl('ui.224') }) : '', p2: s.rain ? tl('ui.227', { p0: esc(ev(s.rain.event).label), p1: s.rain.handled ? '0' : `−${s.rain.base}`, p2: s.rain.handled ? tl('ui.221') : tl('ui.226', { p0: esc(emergencyName('rainDrain')) }) }) : '', p3: s.wind ? tl('ui.229', { p0: esc(ev(s.wind.event).label), p1: s.wind.score ? `−${-s.wind.score}` : '0', p2: s.wind.locked ? tl('ui.228') : tl('ui.062', { base: s.wind.base, p1: Math.round(s.wind.r) }) }) : '', p4: !s.heat && !s.cold && !s.rain && !s.wind ? tl('ui.230', { p0: esc(ev(s.event).label) }) : '', p5: s.emergencyBonus ? tl('ui.231', { emergencyBonus: s.emergencyBonus, p1: (s.emergencyCount ?? 0) > 1 ? esc(emergencyBonusText(s.emergencyCount ?? 0).replace(/ = .*$/, '')) : '' }) : '' }), p15: s.pestDamage ? tl('ui.233', { pestDamage: s.pestDamage }) : '', p16: s.deltaG >= 0 ? '+' : '', deltaG: s.deltaG, baseGrowth: s.baseGrowth, hMult: s.hMult, weatherBonus: s.weatherBonus, p21: s.collapse ? tl('ui.235', { p0: esc(formatHeight(s.collapse.heightBefore)), p1: esc(formatHeight(s.collapse.heightAfter)), count: s.collapse.count, p3: s.collapse.revived ? tl('ui.234') : '' }) : '', p22: s.notes.length ? tl('ui.237', { p0: s.notes.map(esc).join(tl('ui.236')) }) : '' });
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
  return tl('ui.239', { p0: collapseHtml(p, collapses), rows, t, p3: fmt(p.hBefore), p4: fmt(p.hAfter), p5: p.waterDeath ? tl('ui.045') : signed(p.dH), p6: esc(previewGrowthText(p)) });
}

/** 天氣事件表 (shown in 設定 → 玩法 → 天氣與警告). */
export function eventTableHtml(): string {
  const table = (Object.keys(WEATHER_EVENTS) as WeatherEventId[])
    .map((id) => {
      const d = ev(id);
      const cat = d.category ? WX_CATEGORY_LABEL[d.category] : '—';
      const hp = !d.damage ? '0' : d.category === 'wind' ? `−${d.damage}×(1−R/100)` : `−${d.damage}`;
      const counter = d.category === 'heat' ? tl('ui.240') : d.category === 'cold' ? tl('ui.241') : d.category === 'rain' ? tl('ui.242', { p0: emergencyName('rainDrain') }) : d.category === 'wind' ? tl('ui.243', { dR: d.dR, collapseBelow: d.collapseBelow }) : '';
      return `<tr><td>${esc(d.label)}</td><td>${cat}</td><td>${hp}</td><td>${esc(waterText(d.id, true))}${counter ? `<br><small>${counter}</small>` : ''}</td></tr>`;
    })
    .join('');
  return tl('ui.244', { table });
}

/** 照顧 tab: the 12-hour countdown (what it does to the tree) and the 加固 card (moved here from the old 天氣·加固 tab). */
function guardCards(view: View): string {
  const { state } = view;
  const locked = !state.windUnlocked;
  const dbl = !locked && doubleRActive(state);
  const preps = (Object.keys(PREPS) as PrepId[])
    .map((k) => {
      const done = state.care.preps[k];
      const sub = locked ? tl('ui.245') : done ? tl('ui.246') : dbl ? tl('ui.247', { p0: prepAmount(state, k) }) : tl('ui.248', { p0: prepAmount(state, k) });
      return `<button type="button" class="prep ${done ? 'on' : ''} ${locked ? 'locked' : ''} ${dbl && !done ? 'double' : ''}" data-prep="${k}" aria-pressed="${done}" ${locked ? 'disabled aria-disabled="true"' : ''}><span>${PREPS[k].label}</span><small>${sub}</small></button>`;
    })
    .join('');
  const shield = tl('ui.252', { p0: locked ? 'locked-card' : '', p1: locked ? tl('ui.245') : '', p2: dbl ? tl('ui.249') : '', p3: Math.round(state.resist), R_MAX, p6: locked ? tl('ui.250') : tl('ui.251', { R_DAILY_DECAY }), preps });
  return shield;
}

/** The live reading (not manual / offline weather), for 現在 and the weather card. */
function liveObs(view: View): WeatherView['obs'] {
  return view.manual || view.wx.overridden ? undefined : view.wx.obs;
}

/** A real thunderstorm: a thunderstorm warning in force (HKO / Macau / Taiwan) or a thunder reading. */
function thunderNow(view: View): boolean {
  const obs = liveObs(view);
  if (view.wx.warnings.some((w) => !w.inactive && (w.group === 'WTS' || w.group === 'TWTS'))) return true;
  if (obs) return obs.code >= 95 || view.wx.nowIcon === 65;
  return view.cond.code >= 95 || (view.manual && (view.nowEvents ?? view.todayEvents).includes('thunder'));
}

/**
 * v1.4.24 now-art: the measured weather's own icon (HKO icon / CWA wording / WMO code). Without a live reading (manual
 * or offline) the scene's storm draws it — wind for 颱風／烈風, never a thunder cloud unless it really thunders.
 */
function nowArt(view: View): string {
  const obs = liveObs(view);
  const thunder = thunderNow(view);
  if (obs) return weatherArt(obs.code, view.night, thunder || null, thunder ? undefined : view.wx.nowIcon);
  const kind = view.cond.stormKind;
  return weatherArt(view.cond.code, view.night, thunder ? true : kind, kind || view.manual ? undefined : view.wx.nowIcon);
}

/** "2日 11:00" from an ISO time with its own offset (CWA: +08:00), read as written (local bureau time). */
function bureauTime(iso: string): string {
  const m = /^\d{4}-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(iso ?? '');
  return m ? tl('ui.wAt', { d: Number(m[2]), t: `${m[3]}:${m[4]}` }) : '';
}

/** v1.4.24 (Taiwan): the bulletin under its warning — when it starts / ends, which districts, 概述 and 注意事項. */
function warnDetailHtml(w: HkoWarning): string {
  const d = w.detail;
  if (!d) return '';
  const from = bureauTime(d.onset);
  const until = bureauTime(d.expires);
  const when = [from && (!d.started || !until) ? tl('ui.wFrom', { p0: from }) : '', until ? tl('ui.wUntil', { p0: until }) : ''].filter(Boolean).join(' ');
  const parts: string[] = [];
  if (when) parts.push(`<small class="wd-when">${esc(when)}${d.started ? '' : ` · ${esc(tl('ui.wNotYet'))}`}</small>`);
  if (!d.mine && d.areas.length) parts.push(`<small class="wd-area">${esc(tl('ui.wNotMine', { p0: d.place || tl('ui.wYourArea'), p1: d.areas.join(tl('ui.206')) }))}</small>`);
  if (d.overview) parts.push(`<p>${esc(d.overview)}</p>`);
  if (d.precautions) parts.push(`<p class="wd-note">${esc(d.precautions)}</p>`);
  return parts.length ? `<span class="warn-detail">${parts.join('')}</span>` : '';
}

/** "2日 11:00" in the place's own time zone (feed times may be UTC). */
function feedTime(iso: string | null, tz: string): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (!Number.isFinite(t)) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz || undefined, day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(t));
    const get = (k: string) => parts.find((x) => x.type === k)?.value ?? '';
    return tl('ui.wAt', { d: Number(get('day')), t: `${get('hour')}:${get('minute')}` });
  } catch {
    return '';
  }
}

const FEED_GROUP: Partial<Record<WeatherEventId, string>> = { rainstorm: 'WRAIN', blackrain: 'WRAIN', hot: 'WHOT', cold: 'WCOLD', thunder: 'WTS', typhoon1: 'TWWIND', typhoon8: 'TWWIND' };

/** 1.4.26 official feed alerts: game category + the name as issued, when, where, and the official text. */
export function feedAlertsHtml(feed: NonNullable<WeatherView['feed']>, now = Date.now()): string {
  if (!feed.known) return `<p>${esc(tl('alerts.unknown'))}</p>`;
  const items = feed.alerts.map((a) => {
    const live = alertInForce(a, now);
    const cat = a.event ? eventLabel(a.event) : tl('alerts.other');
    const local = a.kind === 'jp-heat' ? tl('alerts.jpHeat') : a.kind === 'jp-heat-special' ? tl('alerts.jpHeatSpecial') : '';
    const raw = [local, a.name, !local && a.nameEn && a.nameEn.toLowerCase() !== a.name.toLowerCase() ? a.nameEn : ''].filter(Boolean).join(' · ');
    const lv = a.level.toLowerCase();
    const tone = !a.event ? 'gray' : a.event === 'blackrain' ? 'black' : lv === 'red' || lv === 'extreme' || a.event === 'typhoon8' ? 'red' : lv === 'yellow' || lv === 'minor' ? 'yellow' : 'amber';
    const group = (a.event && FEED_GROUP[a.event]) || 'WTS';
    const icon = warnIcon({ code: group, group, name: raw, short: '', tone, kind: null } as unknown as HkoWarning);
    const from = feedTime(a.onset, feed.tz);
    const until = feedTime(a.ends, feed.tz);
    const when = [from ? tl('ui.wFrom', { p0: from }) : '', until ? tl('ui.wUntil', { p0: until }) : ''].filter(Boolean).join(' ');
    const parts: string[] = [];
    if (when) parts.push(`<small class="wd-when">${esc(when)}${live ? '' : ` · ${esc(tl('ui.wNotYet'))}`}</small>`);
    if (a.area) parts.push(`<small class="wd-area">${esc(a.area)}</small>`);
    const issued = feedTime(a.issued ?? null, feed.tz);
    if (issued || a.issuer) parts.push(`<small class="wd-issued">${esc([issued ? tl('alerts.issued', { p0: issued }) : '', a.issuer ?? ''].filter(Boolean).join(' · '))}</small>`);
    if (a.headline && a.headline !== a.name) parts.push(`<p>${esc(a.headline)}</p>`);
    const body = [a.description, a.instruction].filter(Boolean).map((x) => `<p class="wd-note">${esc(x)}</p>`).join('');
    if (body) parts.push(`<details><summary>${esc(tl('alerts.more'))}</summary>${body}</details>`);
    return `<li class="${tone}${live ? '' : ' later'}">${icon}<span><b>${esc(cat)}</b><small>${esc(raw)}</small><span class="warn-detail">${parts.join('')}</span></span></li>`;
  });
  const list = items.length ? `<ul class="hko-warns">${items.join('')}</ul>` : tl('ui.259');
  const link = feed.link ? ` <a href="${esc(feed.link)}" target="_blank" rel="noopener">${esc(feed.link.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : '';
  // 1.4.58 MeteoAlarm: its required disclaimer verbatim (English), after our own wording of it.
  const disc = feed.disclaimer ? `<p class="fine">${esc(tl('alerts.delay'))}<br><span lang="en">${esc(feed.disclaimer)}</span></p>` : '';
  const credit = `<p class="fine">${esc(tl('alerts.rawNote'))} ${esc(tl('alerts.attrib', { p0: feed.attribution }))}${link}</p>${disc}`;
  return list + credit;
}

/** v1.4.1 天氣概況: its own page — real-world warnings in force plus current conditions and the forecast. */
export function weatherPageHtml(view: View): string {
  const { cond, wx } = view;
  const simulated = wx.provider === 'sim' && !wx.overridden;
  const reading = wx.reading !== false;
  // v1.4.24: 現在 is the measured reading; storm wind / rain exist only in the scene.
  const obs = liveObs(view);
  const label = reading ? nightLabel(wx.conditionText || weatherLabel(obs?.code ?? cond.code), view.night) : '';
  const wind = obs ?? cond;
  const precip = obs ? obs.precipMm : cond.precipMm;
  const facts = [
    reading && wx.humidity !== undefined ? tl('ui.253', { p0: Math.round(wx.humidity) }) : '',
    !reading || wx.bureau === 'hko' ? '' : tl('ui.254', { p0: Math.round(wind.windKmh), p1: Math.round(wind.gustKmh) }),
    reading && precip > 0 ? tl('ui.255', { p0: Math.round(precip * 10) / 10 }) : '',
  ].filter(Boolean);
  const rain = wx.rainInHours !== null && !cond.raining && !simulated && !wx.overridden ? (wx.rainInHours <= 1 ? tl('ui.140') : tl('ui.141', { rainInHours: wx.rainInHours })) : '';
  const now = tl('ui.257', { p0: nowArt(view), p1: esc(view.place), p2: wx.station && !simulated && !wx.overridden ? tl('ui.256', { p0: esc(wx.station) }) : '', p3: reading ? `${Math.round(cond.tempC)}°C ${esc(label)}` : tl('ui.144'), p4: facts.map(esc).join(' · '), p5: rain ? `<br>${esc(rain)}` : '' });
  // Bureau advisory sentences (HKO warningMessage, SMG descriptions). Shown with the warning, not instead of it.
  const extraMessages = wx.hkoUsed ? wx.messages.filter((msg) => msg.trim()) : [];
  let warns: string;
  if (wx.hkoUsed) {
    const list = wx.warnings.length
      ? `<ul class="hko-warns">${wx.warnings.map((w) => {
          const shown = warningDisplay(w);
          const official = w.name !== shown ? `<small>${esc(w.name)}</small>` : '';
          return `<li class="${w.tone}${w.inactive ? ' later' : ''}">${warnIcon(w)}<span><b>${esc(shown)}</b>${official}${warnDetailHtml(w)}</span></li>`;
        }).join('')}</ul>`
      : '';
    const prose = extraMessages.map((msg) => `<p>${esc(msg)}</p>`).join('');
    warns = list + prose || (wx.warningsKnown === false ? tl('ui.258') : tl('ui.259'));
  } else if (wx.bureau === 'smg') {
    warns = tl('ui.260');
  } else if (wx.bureau === 'cwa') {
    warns = tl('ui.261');
  } else if (wx.bureau === 'hko') {
    warns = tl('ui.262');
  } else if (wx.feed && !wx.overridden) {
    warns = feedAlertsHtml(wx.feed);
  } else if (wx.mode === 'observed' && !wx.overridden) {
    warns = tl('ui.265', { p0: tl('wx.obsNote') });
  } else {
    warns = tl('ui.265', { p0: wx.overridden ? tl('ui.263') : tl('ui.264') });
  }
  const bureauName = wx.bureau === 'smg' ? tl('ui.157') : wx.bureau === 'cwa' ? tl('ui.158') : tl('ui.159');
  const office = wx.warnings.length || extraMessages.length ? tl('ui.266', { bureauName }) : bureauName;
  const feedName = wx.feed?.source && !wx.overridden ? tl(`alerts.src.${wx.feed.source}`) : '';
  const warnCard = tl('ui.268', { p0: wx.hkoUsed ? office : feedName ? tl('ui.266', { bureauName: feedName }) : tl('ui.267'), warns });
  // Hong Kong and Macau only list days that source actually forecast. A padded day would be the game inventing weather.
  const outlook = wx.situation.trim();
  const bureauForecast = wx.bureau === 'hko' || wx.bureau === 'smg' || wx.bureau === 'cwa';
  const forecastDays = view.forecast.filter((day) => !bureauForecast || wx.hkoDays[day.date]);
  const rows = forecastDays
    .map((day) => {
      const today = day.date === view.today ? ' today' : '';
      return tl('ui.272', { today, p1: weatherArt(day.code, false, false, day.hkoIcon), p2: day.date === view.today ? tl('ui.269') : tl('ui.270', { p0: WEEK[weekdayIndex(day.date)] ?? '' }), p3: esc(formatShort(day.date)), p4: esc(dayLabel(day)), p5: wx.hkoDays[day.date]
            ? `${Math.round(day.tempMin)}–${Math.round(day.tempMax)}°`
            : tl('ui.271', { p0: Math.round(day.tempMin), p1: Math.round(day.tempMax), p2: Math.round(day.precipMm), p3: Math.round(day.gustKmh) }), p6: wx.hkoDays[day.date] ? `<p class="hko-day">${esc(wx.hkoDays[day.date]!)}</p>` : '' });
    })
    .join('');
  return tl('ui.276', { p0: sourceLabel(wx), warnCard, now, p3: outlook ? tl('ui.273', { p0: esc(outlook) }) : '', p4: rows ? `<div class="days">${rows}</div>` : tl('ui.274'), p5: esc(view.statusLine), p6: simulated ? tl('ui.275') : '' });
}

let albumMode: 'animals' | 'species' = 'animals';
export function setAlbumMode(mode: 'animals' | 'species'): void {
  albumMode = mode;
}

function albumTab(view: View): string {
  const toggle = tl('ui.277', { p0: albumMode === 'animals' ? 'on' : '', length: view.state.animals.length, length_: ANIMALS.length, p3: albumMode === 'species' ? 'on' : '', length__: SPECIES.length });
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
      return tl('ui.283', { p0: got ? '' : 'locked', id: animal.id, p3: got ? '0' : '1', p4: got ? esc(animal.name) : tl('ui.278'), p5: fresh ? tl('ui.279') : '', p6: resident ? tl('ui.280') : '', cat, p8: esc(CATEGORY_LABEL[cat]), p9: animal.group[1] > 1 ? tl('ui.281', { p0: animal.group[0], p1: animal.group[1] }) : '', p10: got ? `<span>${esc(animal.epithet)}</span><small>${esc(animal.about)}</small>` : tl('ui.282', { p0: esc(unlockHint(animal)) }) });
    }).join('');
    return `<h3 class="sub">${esc(CATEGORY_LABEL[cat])} <small>${have}/${list.length}</small></h3><div class="album">${cards}</div>`;
  }).join('');
  const res = view.state.residents.length;
  return tl('ui.284', { unlocked, length: ANIMALS.length, res, p3: RESIDENT_STREAKS[0], RESIDENT_MIN_H, p5: RESIDENT_STREAKS[1], RESIDENT_STREAK_LATER, RESIDENT_PEST_CUT, RESIDENT_PEST_MAX_SPECIES, RESIDENT_LEAVE_H, groups });
}

function speciesAlbum(view: View): string {
  const cards = SPECIES.map((sp) => {
    const mine = sp.id === view.state.species;
    const stages = sp.stages.map((txt, i) => `<li><b>${STAGE_NAMES[i]}</b>${esc(txt)}</li>`).join('');
    return tl('ui.286', { p0: mine ? 'mine' : '', id: sp.id, p2: stageSampleCm(3, sp.targetM * 100), targetM: sp.targetM, p4: mine ? tl('ui.285') : '', p5: esc(sp.name), p6: esc(sp.english), p7: esc(sp.scientific), p8: esc(sp.typicalM), maxM: sp.maxM, p10: esc(sp.blurb), p11: esc(sp.record), stages, p15: habitatBlock(sp.id) });
  }).join('');
  return tl('ui.287', { cards });
}

/** 原生地：the island scenery that grows with each stage for this species. */
function habitatBlock(id: SpeciesId): string {
  const h = habitatDef(id);
  const rows = h.adds
    .map((feats, i) => (feats.length ? tl('ui.288', { p0: STAGE_NAMES[i], p1: feats.map((f) => esc(FEATURE_LABEL[f])).join(tl('ui.206')) }) : ''))
    .filter(Boolean)
    .join('');
  return tl('ui.289', { p0: esc(h.name), p1: esc(h.blurb), rows });
}

const TIER_ICON: Record<string, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', record: '🏆' };

function awardLabel(id: string): string {
  return id === 'record' ? RECORD_MILESTONE.label : tl('ui.290', { p0: AGE_MILESTONES.find((m) => m.id === id)?.label ?? id });
}

function awardTier(a: { id: string; tier: string | null }): string {
  return a.tier ? tl('ui.291', { p0: TIER_ICON[a.tier], p1: MILESTONE_TIER_LABEL[a.tier as 'gold'] }) : TIER_ICON.record!;
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
    return tl('ui.297', { p0: got ? 'done' : '', p1: esc(m.label), days: m.days, p3: got ? esc(awardTier(got)) : age < m.days ? tl('ui.292', { p0: m.days - age }) : '', p4: got ? tl('ui.294', { p0: esc(got.date), p1: esc(formatHeight(got.heightCm)), p2: Math.round(got.share * 100), p3: got.retro ? tl('ui.293') : '' }) : tl('ui.295', { exp, p1: Math.round(exp * 0.98), p2: Math.round(exp * 0.88) }), p5: m.perk ? tl('ui.296', { p0: esc(BADGES[m.perk].name) }) : '' });
  }).join('');
  const rec = state.milestones?.record;
  const recRow = tl('ui.300', { p0: rec ? 'done' : '', p1: esc(RECORD_MILESTONE.label), p2: rec ? TIER_ICON.record : `${pct}%`, p3: rec ? tl('ui.298', { p0: esc(rec.date), p1: esc(formatHeight(rec.heightCm)), p2: shownAge({ ageDays: rec.ageDays, started: true }) }) : tl('ui.299', { p0: esc(formatHeight(R)), p1: esc(sp.name), maxM: sp.maxM }) });
  const collection = meta.milestones?.length
    ? tl('ui.302', { p0: meta.milestones
        .slice()
        .reverse()
        .map((m) => tl('ui.301', { p0: esc(awardLabel(m.id)), p1: esc(awardTier(m)), p2: esc(m.treeName), p3: esc(speciesDef(m.species).name), p4: esc(m.date), p5: esc(formatHeight(m.heightCm)) }))
        .join('') })
    : tl('ui.303');
  const badges = ([1, 2, 3] as const)
    .map((t) => {
      const n = meta.badges[String(t) as '1' | '2' | '3'];
      const at = AGE_MILESTONES.find((m) => m.perk === t)!;
      return tl('ui.306', { p0: n ? 'done' : '', p1: esc(BADGES[t].name), p2: n > 1 ? ` ×${n}` : '', p3: n ? tl('ui.304') : tl('ui.305', { p0: esc(at.label) }), p4: esc(BADGES[t].perk) });
    })
    .join('');
  const rows = MILESTONES.map((m) => {
    const done = meters >= m.meters;
    return tl('ui.300', { p0: done ? 'done' : '', p1: esc(m.title), p2: m.meters >= 1 ? tl('ui.307', { meters: m.meters }) : tl('ui.308', { p0: Math.round(m.meters * 100) }), p3: esc(m.detail) });
  }).join('');
  return tl('ui.314', { p0: esc(ageText(state)), p1: esc(formatHeight(state.heightCm)), pct, p3: beyond ? tl('ui.309', { p0: esc(sp.name), p1: R / 100 }) : tl('ui.310', { p0: R / 100, p1: esc(sp.name), maxM: sp.maxM }), p4: Math.min(100, pct).toFixed(1), p5: esc(formatCarbon(carbonKg(state.heightCm, state.species))), SHERMAN_M, p7: esc(percentOf(meters, SHERMAN_M)), HYPERION_M, p9: next ? tl('ui.311', { p0: esc(next.title), meters: next.meters }) : '', ages, recRow, collection, badges, reviveTokens: meta.reviveTokens, p15: meta.starry ? tl('ui.312') : '', p16: meta.landmark ? tl('ui.313', { p0: esc(meta.landmark.name), p1: esc(formatHeight(meta.landmark.heightCm)) }) : '', rows });
}

/** 成就 tab: a running count per weather, and the next count that claims an achievement. */
function achievementTab(view: View): string {
  const { state, meta } = view;
  const groups = WX_TRACKS.map((track) => {
    const n = state.wx?.counts?.[track.id] ?? 0;
    const info = weatherTrackCopy(track.id);
    const next = nextWxAwardCount(track.id, n);
    const nextTitle = weatherAchievementCopy(wxAwardId(track.id, next)).title;
    // 1.4.29: name, condition, how many weathered, next achievement — nothing else.
    return tl('ui.316', { p0: n ? 'done' : '', p1: esc(info.name), n, p3: esc(track.unit), p4: esc(info.detail), p5: esc(nextTitle) });
  }).join('');
  const collected = (meta.weather ?? []).filter((m) => parseWxAwardId(m.id));
  const collection = collected.length
    ? tl('ui.302', { p0: collected
        .slice()
        .reverse()
        .map((m) => tl('ui.317', { p0: esc(weatherAchievementCopy(m.id).title), p1: esc(m.treeName), p2: esc(speciesDef(m.species).name), p3: esc(m.date), p4: shownAge({ ageDays: m.ageDays, started: true }) }))
        .join('') })
    : tl('ui.318');
  const earnedIsle = new Set((meta.isle ?? []).map((a) => a.id));
  const isles = ISLE_AWARDS.map((a) => {
    const got = earnedIsle.has(a.id);
    return tl('ui.300', { p0: got ? 'done' : '', p1: esc(a.title), p2: got ? tl('ui.319') : tl('ui.320'), p3: esc(a.detail) });
  }).join('');
  const hatched = state.nest?.hatched ?? 0;
  const nextEgg = nextNestAwardCount(hatched);
  const earnedEggs = [...(state.nest?.awards ?? [])].sort((a, b) => a.count - b.count);
  const gotEggs = earnedEggs.length ? tl('ui.315', { p0: earnedEggs.map((a) => esc(nestAwardTitle(a.count))).join(tl('ui.206')) }) : '';
  const built = nestBuilds(hatched);
  const nextBuild = nestBuildAt(nextNestBuildCount(hatched));
  const gotBuilds = built.length ? tl('ui.321', { p0: built.map((k) => esc(nestBuildPhrase(k))).join(tl('ui.206')) }) : '';
  const collectedEggs = [...(meta.nest ?? [])].reverse();
  const eggCollection = collectedEggs.length
    ? tl('ui.302', { p0: collectedEggs.map((m) => tl('ui.322', { p0: esc(nestAwardTitle(m.count)), p1: esc(m.treeName), p2: esc(speciesDef(m.species).name), p3: esc(m.date) })).join('') })
    : '';
  return tl('ui.324', { isles, p1: hatched ? 'done' : '', hatched, p3: nextNestBuildCount(hatched), p4: nextBuild ? tl('ui.323', { p0: esc(nestBuildPhrase(nextBuild)) }) : '', p5: nextNestHeightCount(hatched), p6: esc(nestAwardTitle(nextEgg)), nextEgg, gotBuilds, gotEggs, eggCollection, groups, wxNote: esc(tl('wx.badgeSrc')), collection });
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

/** 1.4.29 one-time pop-up when the first bird arrives: the egg-laying rules (from nest.ts). */
export function nestIntroModal(bird: string): string {
  return tl('nest.intro', { bird: esc(bird), minH: NEST_MIN_HEALTH, hours: NEST_HATCH_MS / 3600_000 });
}

/** 1.4.52 once, the first time an egg is laid. */
export function firstEggModal(bird: string, reward: string): string {
  return tl('nest.firstEgg', { bird: esc(bird), hours: NEST_HATCH_MS / 3600_000, minH: NEST_MIN_HEALTH, reward: esc(reward) });
}

/** Egg pop-up: live countdown, what this hatch gives, the rules, and keep-warm. */
export function eggPopup(state: GameState): string {
  const egg = state.nest?.egg;
  const n = (state.nest?.hatched ?? 0) + 1;
  const block = warmBlock(state, uiNow());
  const warm = block === 'already' ? tl('nest.warmed') : block === 'soon' ? tl('nest.warmSoon') : tl('nest.warm');
  return tl('nest.egg', {
    bird: esc(egg ? nestBirdName(egg.bird) : ''),
    clock: hatchClockText(state) ?? '00:00:00',
    reward: esc(nestRewardText(n)),
    explain: esc(tl('nest.explain')),
    warm: esc(warm),
    warmCls: block ? 'off' : '',
    warmOff: block ? 'true' : 'false',
    close: esc(tl('nest.close')),
  });
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

let onModalClosed: (() => void) | null = null;
/** Fired once the modal has actually left the screen (night report, egg pop-up, …). */
export function setOnModalClosed(fn: (() => void) | null): void {
  onModalClosed = fn;
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
    onModalClosed?.();
  }, modalFadeMs());
}

export interface Pick {
  species: SpeciesId;
}

export function startModal(current: string, meta: MetaState, rename: boolean, pick?: Pick): string {
  if (rename) {
    return tl('ui.325', { p0: esc(current) });
  }
  const sel: Pick = pick ?? { species: SPECIES[0]!.id };
  const legacy = meta.pendingLegacy && meta.landmark ? tl('ui.326', { p0: esc(meta.landmark.name) }) : '';
  const cards = SPECIES.map(
    (sp) => tl('ui.327', { p0: sp.id === sel.species ? 'on' : '', id: sp.id, p2: sp.id === sel.species, p4: stageSampleCm(3, sp.targetM * 100), p5: esc(sp.name), p6: esc(sp.scientific.split(/[（(]/)[0]!.trim()), targetM: sp.targetM }),
  ).join('');
  const chosen = speciesDef(sel.species);
  const R = chosen.targetM * 100;
  return tl('ui.328', { legacy, cards, p2: esc(chosen.name), p3: esc(chosen.blurb), targetM: chosen.targetM, maxM: chosen.maxM, p6: baseDailyGrowth(R, START.heightCm).toFixed(0), p7: Math.round(expectedShare(365) * chosen.targetM) });
}

/** Name comes after the species is chosen, on its own page. */
export function nameModal(current: string): string {
  return tl('ui.329', { p0: esc(current) });
}

export function overModal(state: GameState, meta: MetaState, lines: string[]): string {
  const got = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
  const kept = Object.values(state.milestones ?? {}).length;
  const wxKept = Object.keys(state.wx?.awards ?? {}).length;
  const keptLine = kept || wxKept ? tl('ui.330', { kept, wxKept }) : tl('ui.331');
  return tl('ui.332', { p0: esc(state.treeName), p1: shownAge(state), p2: esc(formatHeight(state.heightCm)), p3: recordPct(state), p4: esc(formatCarbon(carbonKg(state.heightCm, state.species))), got, keptLine, p7: meta.badges['1'], p8: meta.badges['2'], p9: meta.badges['3'] });
}

/** v14 celebratory card for milestones just reached (same badge style as the old season card). */
export function milestoneModal(state: GameState, meta: MetaState, awards: MilestoneAward[], lines: string[], weather: WeatherAward[] = [], recordHint = ''): string {
  const retro = awards.every((a) => a.retro);
  const main = awards[awards.length - 1]!;
  const items = awards.map((a) => tl('ui.333', { p0: esc(awardLabel(a.id)), p1: esc(awardTier(a)), p2: esc(formatHeight(a.heightCm)), p3: Math.round(a.share * 100) })).join('');
  const wxItems = weather.map((a) => `<li><b>${esc(weatherAchievementCopy(a.id).title)}</b> 🌤️</li>`).join('');
  const perks = lines.length ? `<ul class="badges">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
  const title = awards.length > 1 ? tl('ui.334', { length: awards.length }) : main.id === 'record' ? tl('ui.335', { p0: esc(state.treeName) }) : tl('ui.336', { p0: esc(state.treeName), p1: esc(awardLabel(main.id)) });
  return tl('ui.341', { p0: retro ? tl('ui.337') : tl('ui.191'), title, items, wxItems, perks, p5: retro ? tl('ui.338') : tl('ui.339', { p0: esc(state.treeName) }), p6: nextMilestone(state) ? tl('ui.340', { p0: esc(nextMilestone(state)!.label) }) : '', p7: recordHint ? `<p>${esc(recordHint)}</p>` : '', p8: (meta.milestones?.length ?? 0) + (meta.weather?.length ?? 0), p9: meta.badges['1'], p10: meta.badges['2'], p11: meta.badges['3'] });
}

/** Card for weather achievements reached on a night with no age milestone. */
export function weatherModal(state: GameState, meta: MetaState, awards: WeatherAward[]): string {
  const items = awards.map((a) => `<li><b>${esc(weatherAchievementCopy(a.id).title)}</b><span>${esc(weatherAchievementCopy(a.id).detail)}</span></li>`).join('');
  const title = awards.length > 1 ? tl('ui.342', { length: awards.length }) : weatherAchievementCopy(awards[0]!.id).title;
  return tl('ui.343', { p0: esc(title), items, p2: esc(state.treeName), p3: (meta.milestones?.length ?? 0) + (meta.weather?.length ?? 0) });
}

/** v13: full-screen card the first time the tree reaches 青年樹. */
export function windExplainerModal(state: GameState): string {
  return tl('ui.344', { p0: esc(state.treeName), amount: PREPS.stakes.amount, amount_: PREPS.ropes.amount, amount__: PREPS.prune.amount, R_MAX, p5: Math.round(state.resist), R_DAILY_DECAY });
}

export function stormModal(message: string): string {
  return tl('ui.345', { p0: esc(message) });
}

export { PLACES, type PlaceOption } from './presets';

export function locationModal(current: string): string {
  // 1.4.48: grouped by region (香港／澳門／台灣), each group a small heading over a two-column grid.
  const rows = PLACE_GROUPS.map((g) => {
    const items = PLACES.filter((p) => p.region === g)
      .map((p) => `<button type="button" class="place ${current === p.id ? 'on' : ''}" data-place="${p.id}">${icon('pin')}<span>${esc(p.name)}</span></button>`)
      .join('');
    return `<p class="places-head">${esc(tl(`place.group.${g}`))}</p><div class="places">${items}</div>`;
  }).join('');
  return tl('ui.353', { p0: current === 'geo' ? 'on' : '', p1: icon('locate'), rows });
}

/** `notify`: Android app reminder switch (null in browsers = row hidden). */
/** `premiumCardHtml` (ios branch, 1.4.49): the 世界之樹 Premium card, placed at the top of 設定 right under the heading. */
export function settingsModal(treeName: string, notify: boolean | null = null, premiumCardHtml = ''): string {
  const soundOn = soundEnabled();
  const loc = getLocale();
  // Each language is named in itself, so the picker reads the same whatever the current language is.
  const langRow = `<div class="setting-row"><span>${esc(tl('ui.language'))}</span><select class="lang-select" data-lang-select aria-label="${esc(tl('ui.language'))} / Language">${LOCALES.map((l) => `<option value="${l}"${l === loc ? ' selected' : ''}>${esc(LOCALE_NAMES[l])}</option>`).join('')}</select></div>`;
  // 1.4.55 高度單位: 厘米／米 (default) or 英寸／英尺; applied at once (main.ts applyHeightUnit).
  const hu = getHeightUnit();
  const unitRow = `<div class="setting-row"><span>${esc(tl('ui.heightUnit'))}</span><select class="lang-select" data-unit-select aria-label="${esc(tl('ui.heightUnit'))}">${HEIGHT_UNITS.map((u) => `<option value="${u}"${u === hu ? ' selected' : ''}>${esc(tl(`unit.${u}`))}</option>`).join('')}</select></div>`;
  const tourRow = `<div class="setting-row"><span>${esc(tl('tour.row'))}</span><button type="button" class="ghost" data-action="tour-replay">${esc(tl('tour.replay'))}</button></div>`;
  const html = tl('ui.355', { p0: esc(treeName), p1: soundOn ? 'on' : '', soundOn, p3: soundOn ? '' : 'on', soundOn_: !soundOn, p5: langRow + unitRow + tourRow + (notify === null
        ? ''
        : tl('ui.354', { p0: notify ? 'on' : '', p1: notify ? '' : 'on' })), p6: esc(APP_VERSION), privacyUrl: PRIVACY_URL, termsUrl: TERMS_URL }).replace(
    'data-action="disclaimer"',
    // 1.4.50 資料來源及授權 sits with the other legal links (before 免責聲明).
    `data-action="credits">${esc(tl('credits.link'))}</button><button type="button" data-action="disclaimer"`,
  );
  if (!premiumCardHtml) return html;
  const at = html.indexOf('</h2>');
  return at < 0 ? premiumCardHtml + html : html.slice(0, at + 5) + premiumCardHtml + html.slice(at + 5);
}

/** 1.4.33 hidden diagnostics (long-press the version line in 設定). Developer readout, English only. */
/** 1.4.46: 碳吸收量 as 「26 克」 below 1 kg, 「1.2 公斤」 from 1 kg (see carbonParts). */
export function formatRealAge(days: number): string {
  const p = realAgeParts(days);
  return p.y === 0 ? tl('age.days', { d: p.d }) : p.d === 0 ? tl('age.years', { y: p.y }) : tl('age.yearsDays', { y: p.y, d: p.d });
}

/** 1.4.46: 真實樹齡 from 365 days on as years + days (365-day years, like the rest of the game). */
export function realAgeParts(days: number): { y: number; d: number } {
  const n = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  return n < 365 ? { y: 0, d: n } : { y: Math.floor(n / 365), d: n % 365 };
}

export function formatCarbon(kg: number): string {
  const p = carbonParts(kg);
  return tl(p.unit === 'g' ? 'carbon.g' : 'carbon.kg', { n: p.n });
}

export function diagModal(text: string): string {
  return `<p class="eyebrow">Diagnostics</p><pre class="diag-pre">${esc(text)}</pre><div class="seg diag-actions"><button type="button" data-action="diag-refresh">Refresh</button><button type="button" data-action="diag-copy">Copy</button><button type="button" data-action="diag-clear-log">${esc(tl('diag.clearLog'))}</button></div><button type="button" class="primary" data-action="close-modal">OK</button>`;
}

export function disclaimerModal(): string {
  return tl('ui.356');
}

/** 匯出存檔: the code in a read-only box (already copied when possible). */
export function exportSaveModal(code: string, copied: boolean, canShare: boolean): string {
  return tl('ui.361', { p0: copied ? tl('ui.358') : tl('ui.359'), p1: esc(code), p2: canShare ? tl('ui.360') : '' });
}

/** 1.4.54 「備份存檔」: first a platform-specific note (automatic iCloud / Google backup, or none on the web), then the code. */
export function backupModal(platform: 'ios' | 'android' | 'web'): string {
  const note = platform === 'ios' ? tl('backup.ios') : platform === 'android' ? tl('backup.android') : tl('backup.web');
  return `
    <p class="eyebrow">${esc(tl('backup.eyebrow'))}</p>
    <h2>${esc(tl('backup.title'))}</h2>
    <p>${esc(note)}</p>
    <div class="btn-stack">
      <button type="button" class="primary" data-action="export-save-code">${esc(tl('backup.show'))}</button>
      <div class="btn-row">
        <button type="button" class="ghost" data-action="import-save">${esc(tl('backup.restore'))}</button>
        <button type="button" class="ghost" data-action="close-modal">${esc(tl('nest.close'))}</button>
      </div>
    </div>
  `;
}

/** 1.4.54 iCloud has a different save than this device: ask, never overwrite silently. */
export function cloudAskModal(info: { tree: string; height: string; when: string }): string {
  return `
    <p class="eyebrow">${esc(tl('cloud.eyebrow'))}</p>
    <h2>${esc(tl('cloud.askTitle'))}</h2>
    <p>${esc(tl('cloud.askBody', { tree: info.tree, height: info.height, when: info.when }))}</p>
    <p class="muted">${esc(tl('cloud.keepNote'))}</p>
    <div class="btn-stack">
      <button type="button" class="primary" data-action="cloud-restore">${esc(tl('cloud.restore'))}</button>
      <button type="button" class="ghost" data-action="cloud-keep">${esc(tl('cloud.keep'))}</button>
    </div>
  `;
}

/** 匯入存檔: paste box; `error` shows the last validation problem. */
export function importSaveModal(error = ''): string {
  return tl('ui.362', { p0: error ? `<p class="save-error">${esc(error)}</p>` : '' });
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
  const pct = tl('ui.363', { p0: recordPct(state) });
  if (next) {
    const p = stageProgress(state.heightCm, target);
    return tl('ui.364', { p0: p > 0.9 ? 'dim' : '', p1: esc(formatHeight(stage.nextCm)), p2: esc(next.name), p3: (p * 100).toFixed(1), p5: esc(formatHeight(state.heightCm)), pct, p7: esc(formatHeight(stage.minCm)), p8: esc(stage.name) });
  }
  const beyond = state.heightCm > target;
  const top = beyond ? niceCeilCm(state.heightCm * 1.15) : target;
  const span = Math.max(1, top - stage.minCm);
  const p = Math.max(0, Math.min(1, (state.heightCm - stage.minCm) / span));
  const tp = Math.max(0, Math.min(1, (target - stage.minCm) / span));
  const tick = beyond ? tl('ui.365', { p0: (tp * 100).toFixed(1) }) : '';
  return tl('ui.370', { p0: !beyond && p > 0.9 ? 'dim' : '', p1: beyond ? 'beyond' : '', p2: beyond ? tl('ui.366') : tl('ui.367'), p3: esc(formatHeight(top)), p4: beyond ? tl('ui.368') : tl('ui.369'), p6: (p * 100).toFixed(1), tick, p9: esc(formatHeight(state.heightCm)), pct, p11: esc(formatHeight(stage.minCm)), p12: esc(stage.name) });
}
