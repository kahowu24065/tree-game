/** Game state changes: care actions, nightly settlement, catch-up, dying, age milestones (v14: no seasons). */
import {
  CARE,
  COLLAPSE_HEIGHT_LOSS,
  COLLAPSE_MAX,
  COLLAPSE_REINFORCE_MULT,
  DYING_HOURS,
  EMERGENCY,
  WIND_UNLOCK_STAGE,
  LANDMARK_N_BONUS,
  N_OPTIMAL,
  PREPS,
  R_DAILY_DECAY,
  R_MAX,
  RESCUE_HEALTH,
  RESIDENT_LEAVE_H,
  RESIDENT_MIN_H,
  RESIDENT_PEST_CUT,
  pestDamageWith,
  pestTriggerDays,
  residentStreakNeeded,
  REVIVE_HEALTH,
  START,
  STORM_SURVIVE_GROWTH,
  STORM_SURVIVE_SHARE,
  RAIN_OVER_CAP,
  T1_WATER_LOSS_MULT,
  T2_RAIN_TO_N_CHANCE,
  W_MAX,
  W_NIGHT_LOSS,
  W_OPTIMAL,
  W_SATURATED,
  N_DAILY_USE,
  WEATHER_EVENTS,
  AGE_MILESTONES,
  GROWTH_FLOOR_SHARE,
  MILESTONE_TIER_LABEL,
  RECORD_MILESTONE,
  WX_TRACKS,
  isWxAwardCount,
  parseWxAwardId,
  wxAwardId,
  type PrepId,
  type WeatherAchievementId,
  type WeatherEventId,
  type WeatherTrackId,
} from './balance';
import { ANIMALS, eventById, eventForDate, stageFor, stagesFor } from './content';
import { defaultSpecies, speciesDef, speciesTargetCm, STAGE_NAMES, type SpeciesId } from './data/species';
import { addDays, daysBetween } from './dates';
import { freshNest, isNestHeightCount, nestAwardTitle, nestBirdName, nestBuildAt, nestBuildPhrase, settleNest } from './nest';
import { emergencyName, eventLabel, regionalize, weatherAchievementCopy } from './labels';
import {
  baseDailyGrowth,
  carbonKg,
  clamp100,
  clampW,
  deltaG,
  emergencyBonus,
  emergencyBonusText,
  finalDamage,
  hMult,
  hMultTier,
  inBand,
  isRainDay,
  RAIN_DAY_EVENTS,
  nFactor,
  pickEvent,
  rainAdd,
  milestoneTier,
  rollFor,
  topInCategory,
  waterAdd,
  waterDeath,
  wTier,
  type NightWater,
} from './rules';
import type { Care, DayFlow, GameState, LogI18n, LogKind, LogReward, MetaState, MilestoneAward, Reinforcement, Settlement, WeatherAward, WeatherProgress } from './types';
import { formatHeight } from './util';
import { getLocale, t as tl } from './i18n';
import { parseIn } from './i18n/msg';

export function freshCare(date: string): Care {
  return { date, water: 0, drain: 0, fertilize: 0, dewormed: false, preps: { stakes: false, ropes: false, prune: false }, credited: false, heatWater: false, rainDrain: false, warmCover: false };
}

let logClock: () => string = () => '';

/** The browser sets this so log entries carry the local HH:MM they happened at. */
export function setLogClock(fn: () => string): void {
  logClock = fn;
}

export interface LogMeta {
  kind?: LogKind;
  title?: string;
  reward?: LogReward;
  time?: string;
}

/** 1.4.36: message form of a new log line's texts (written in the current language). */
export function logI18n(text: string, title?: string, reward?: string, lang = getLocale()): LogI18n | undefined {
  const out: LogI18n = { lang };
  const a = parseIn(text, lang);
  if (a) out.text = a;
  const b = title ? parseIn(title, lang) : null;
  if (b) out.title = b;
  const c = reward ? parseIn(reward, lang) : null;
  if (c) out.reward = c;
  return a || b || c ? out : undefined;
}

export function addLog(state: GameState, date: string, text: string, meta: LogMeta = {}): void {
  state.log.unshift({ date, text, time: meta.time ?? logClock(), kind: meta.kind, title: meta.title, reward: meta.reward, i18n: logI18n(text, meta.title, meta.reward?.text) });
  if (state.log.length > 120) state.log.length = 120;
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const sgn = (v: number) => `${v >= 0 ? '+' : ''}${r1(v)}`;

/** Current save schema (rules version); see storage.migrateV14. */
export const RULES_VERSION = 14;

export function createGame(today: string, opts: { name?: string; legacyBonus?: number; species?: SpeciesId } = {}): GameState {
  const legacyBonus = opts.legacyBonus ?? 0;
  const state: GameState = {
    version: 2,
    rules: RULES_VERSION,
    started: false,
    treeName: opts.name ?? tl('sim.001'),
    species: opts.species ? speciesDef(opts.species).id : defaultSpecies(),
    ageDays: 0,
    milestones: {},
    wx: freshWx(),
    createdOn: today,
    lastSeenDate: today,
    virtualToday: null,
    health: START.health,
    moisture: START.moisture,
    nutrients: clamp100(START.nutrients + legacyBonus),
    resist: START.resist,
    heightCm: START.heightCm,
    pest: { active: false, lowNDays: 0, wetDays: 0, since: null },
    care: freshCare(today),
    dayEvents: {},
    waterFx: {},
    animals: [],
    seenAnimals: [],
    residents: [],
    highStreak: 0,
    scars: 0,
    log: [],
    daysCared: 0,
    stormSurvivals: 0,
    dailyEventDate: '',
    dailyEventId: 'quiet',
    eventBonus: 1,
    morningNote: null,
    dying: null,
    over: null,
    passedTargetOn: null,
    targetCm: 0,
    lastSettlement: null,
    legacyBonus,
    windUnlocked: false,
    windExplained: false,
    collapses: 0,
    doubleRPending: false,
    doubleRDate: null,
    doubleRSeen: false,
    lastCollapse: null,
    nest: freshNest(),
  };
  state.targetCm = speciesTargetCm(state.species);
  addLog(state, today, legacyBonus ? tl('sim.002', { legacyBonus }) : tl('sim.003'), {
    kind: 'plant',
    title: tl('ui.166'),
    reward: { text: legacyBonus ? tl('sim.004', { legacyBonus }) : tl('sim.005'), tone: 'green' },
  });
  ensureToday(state, today);
  return state;
}

export function ensureToday(state: GameState, today: string): string | null {
  if (state.dailyEventDate === today) return null;
  state.eventBonus = 1;
  const event = eventForDate(today);
  state.dailyEventDate = today;
  state.dailyEventId = event.id;
  event.apply(state);
  if (event.id !== 'quiet') addLog(state, today, event.text, { kind: 'event', title: tl('sim.006', { title: event.title }), reward: event.chip });
  state.health = clamp100(state.health);
  state.moisture = clampW(state.moisture);
  state.nutrients = clamp100(state.nutrients);
  return tl('sim.007', { title: event.title, text: event.text });
}

/* ---------- Weather records ---------- */

/** Remember what weather was seen on a date (HKO warnings seen at any time that day count). */
export function recordEvents(state: GameState, date: string, events: readonly WeatherEventId[], hko: boolean, rain?: readonly WeatherEventId[]): void {
  const rec = (state.dayEvents[date] ??= { events: [], hko: false });
  for (const e of events) if (e !== 'clear' && !rec.events.includes(e)) rec.events.push(e);
  rec.hko ||= hko;
  if (rain) {
    const seen = (rec.rain ??= []);
    for (const e of rain) if (RAIN_DAY_EVENTS.includes(e) && !seen.includes(e)) seen.push(e);
  }
  const keys = Object.keys(state.dayEvents).sort();
  while (keys.length > 21) delete state.dayEvents[keys.shift()!];
}

/** v1.4.24: rain really observed on `date` (older saves: an official-data day's recorded events were all live). */
export function observedRain(state: GameState, date: string): WeatherEventId[] {
  const rec = state.dayEvents[date];
  if (!rec) return [];
  return (rec.rain ?? (rec.hko ? rec.events : [])).filter((e) => RAIN_DAY_EVENTS.includes(e));
}

/**
 * v1.4.24: the events that may touch 水分 — forecast-only rain is dropped, so it neither adds water (no root rot)
 * nor makes a no-loss rain day. Only rain actually observed live counts; heat and the rest pass through.
 */
export function waterEvents(state: GameState, date: string, events: readonly WeatherEventId[]): WeatherEventId[] {
  const rain = observedRain(state, date);
  return events.filter((e) => !RAIN_DAY_EVENTS.includes(e) || rain.includes(e));
}

/**
 * Events a date is settled with. 1.4.26: only what was actually seen that day — official warnings / feed alerts in
 * force, or observed readings — plus `observed` (where no official feed exists: events from that date's completed
 * hours and its temperatures). Forecasts never add events, so they never cause damage or count for achievements.
 */
export function eventsForDate(state: GameState, date: string, observed: readonly WeatherEventId[] = []): WeatherEventId[] {
  const rec = state.dayEvents[date];
  const all = [...new Set([...(rec?.events ?? []), ...observed])].filter((e) => e !== 'clear');
  return all.length ? all : ['clear'];
}

/* ---------- Nightly settlement ---------- */

export interface Perks {
  waterSaver: boolean;
  rainToN: boolean;
  /** v13: a 免死金牌 is available (blocks a fatal 3rd collapse). */
  revive?: boolean;
}

export function perksFrom(meta: MetaState | null): Perks {
  return { waterSaver: Boolean(meta && meta.badges['1'] > 0), rainToN: Boolean(meta && meta.badges['2'] > 0), revive: Boolean(meta && meta.reviveTokens > 0) };
}

export interface SettleResult {
  settlement: Settlement;
  messages: string[];
  died: boolean;
  revived: boolean;
  /** v14 milestones reached tonight (樹齡／超越世界紀錄). */
  milestones: MilestoneAward[];
}

/* ---------- v12 water: instant warnings, the night's plan (shared by settlement and the 今晚預計 preview) ---------- */

export type WarningWaterEvent = 'hot' | 'rainstorm' | 'blackrain' | 'drizzle';

export interface WarningHit {
  event: WarningWaterEvent;
  before: number;
  after: number;
  delta: number;
  /** 二級徽章: water turned into 養分. */
  toN: number;
  message: string;
  /** W reached 150: the tree entered 瀕死. */
  dying: boolean;
}

const WARNING_NAME: Record<WarningWaterEvent, string> = { hot: tl('guide.133'), rainstorm: tl('sim.008'), blackrain: tl('sim.009'), drizzle: tl('sim.010') };

/** The tree dies (v14: the only way a game ends). v16: `fallSeen: false` = the death animation is still to play. */
function killTree(state: GameState, date: string, time: string): void {
  state.health = 0;
  state.dying = null;
  const days = daysBetween(state.createdOn, date) + 1;
  // v14: perk badges come with the age milestones (booked while alive), not at death.
  state.over = { kind: 'dead', date, tiers: [], days, fallSeen: false };
  addLog(state, date, tl('sim.011', { treeName: state.treeName, LANDMARK_N_BONUS }), { kind: 'dying', title: tl('sim.012'), time });
}

export const DYING_MS = DYING_HOURS * 3600 * 1000;

/**
 * v16: 瀕死 whose 24 hours are up at `nowMs` ends now: a 免死金牌 revives the tree (H 30), otherwise it dies.
 * Used by the nightly settlement and by the in-game timer the moment the countdown reaches 0.
 */
export function resolveDyingExpiry(state: GameState, date: string, meta: MetaState | null, nowMs: number, time?: string): 'dead' | 'revived' | null {
  const d = state.dying;
  if (!d || state.over || nowMs - d.at < DYING_MS) return null;
  if (meta && meta.reviveTokens > 0) {
    meta.reviveTokens -= 1;
    state.health = REVIVE_HEALTH;
    state.dying = null;
    addLog(state, date, tl('sim.013', { REVIVE_HEALTH }), { kind: 'badge', title: tl('sim.014'), reward: { text: tl('sim.015', { REVIVE_HEALTH }), tone: 'purple' }, time });
    return 'revived';
  }
  killTree(state, date, time ?? '');
  return 'dead';
}

/**
 * v16 (visual only) broken-top amount: 1 right after a collapse, fading to 0 as the tree regrows to the height it had
 * before. 0 with no collapse (or after a fatal one).
 */
export function brokenTop(state: Pick<GameState, 'lastCollapse' | 'heightCm'>): number {
  const c = state.lastCollapse;
  if (!c || c.fatal) return 0;
  const lost = c.heightBefore - c.heightAfter;
  if (!(lost > 0)) return 0;
  return Math.max(0, Math.min(1, (c.heightBefore - state.heightCm) / lost));
}

/** v16: days the fallen top lies beside the tree after a collapse (settlement night = day 0). */
export const FALLEN_LOG_DAYS = 3;

/** v16: the fallen log (the snapped-off top) is shown on days 1–3 after the collapse; 0 = not shown. */
export function fallenLogDay(state: Pick<GameState, 'lastCollapse' | 'over'>, today: string): number {
  const c = state.lastCollapse;
  if (!c || c.fatal || state.over) return 0;
  const d = daysBetween(c.date, today);
  return d >= 0 && d <= FALLEN_LOG_DAYS ? Math.max(1, d) : 0;
}

/**
 * v16: the moment the night of `date` counts as settled during a catch-up — the end of that day (midnight), capped at
 * now. `msIntoToday` is how far into today (local clock) `nowMs` is.
 */
export function dayEndMs(date: string, today: string, nowMs: number, msIntoToday: number): number {
  const DAY = 24 * 3600 * 1000;
  return Math.min(nowMs, nowMs - msIntoToday - (daysBetween(date, today) - 1) * DAY);
}

/** Enter 24-hour 瀕死 (H goes to 0). Returns false when already dying. */
function enterDying(state: GameState, date: string, nowMs: number, why: string, time?: string): boolean {
  state.health = 0;
  if (state.dying) return false;
  state.dying = { since: date, at: nowMs };
  addLog(state, date, tl('sim.016', { why, p1: W_OPTIMAL[0], p2: W_OPTIMAL[1], p3: N_OPTIMAL[0] }), {
    kind: 'dying',
    title: tl('ui.045'),
    reward: { text: tl('sim.017'), tone: 'red' },
    time,
  });
  return true;
}

/* ---------- v1.4.17 gradual day: 水分、養分、抗風力 drift with real time (v1.4.18: 健康 settles once at midnight) ---------- */

export const DAY_MS = 24 * 3600 * 1000;
/** Drift is applied in steps of at most 15 minutes (closed-app time is caught up step by step). */
export const FLOW_STEP_MS = 15 * 60 * 1000;

/** Per-day rates: 水分 −24 = 1 an hour (v1.4.23; ×0.9 一級徽章, 0 on a rain day), 養分 −10, 抗風力 −2 after 青年樹. */
export interface FlowRates {
  w: number;
  n: number;
  r: number;
  pest: boolean;
}

export function flowRates(state: GameState, events: readonly WeatherEventId[], perks: Perks): FlowRates {
  return {
    w: isRainDay(events) ? 0 : -(perks.waterSaver ? W_NIGHT_LOSS * T1_WATER_LOSS_MULT : W_NIGHT_LOSS),
    n: -N_DAILY_USE,
    r: state.windUnlocked ? -R_DAILY_DECAY : 0,
    pest: state.pest.active,
  };
}

interface DriftVals {
  w: number;
  n: number;
  r: number;
}
interface DriftSum {
  w: number;
  n: number;
  r: number;
}
const q6 = (x: number) => Math.round(x * 1e6) / 1e6;
const zeroSum = (): DriftSum => ({ w: 0, n: 0, r: 0 });

/** One step (share `f` of a day) of 水分／養分／抗風力 drift. v1.4.18: 健康 does not drift; it settles once at midnight. */
function driftStep(v: DriftVals, rates: FlowRates, f: number, sum: DriftSum): void {
  const w0 = v.w;
  const n0 = v.n;
  const r0 = v.r;
  v.w = clampW(v.w + rates.w * f);
  v.n = clamp100(v.n + rates.n * f);
  v.r = Math.max(0, Math.min(R_MAX, v.r + rates.r * f));
  sum.w += v.w - w0;
  sum.n += v.n - n0;
  sum.r += v.r - r0;
}

/** Pure: run `ms` of drift on a copy (今晚預計). */
function simulateDrift(v: DriftVals, rates: FlowRates, ms: number): DriftSum {
  const sum = zeroSum();
  let done = 0;
  while (done < ms - 1e-6) {
    const dt = Math.min(FLOW_STEP_MS, ms - done);
    driftStep(v, rates, dt / DAY_MS, sum);
    done += dt;
  }
  return sum;
}

function newFlow(state: GameState, date: string, at: number, elapsed: number): DayFlow {
  return {
    date,
    at,
    elapsed: Math.max(0, Math.min(DAY_MS, elapsed)),
    start: { h: state.health, w: state.moisture, n: state.nutrients, r: state.resist },
    w: 0,
    n: 0,
    r: 0,
  };
}

/** Apply `ms` of drift to the real state (steps of 15 min). */
function applyDrift(state: GameState, events: readonly WeatherEventId[], meta: MetaState | null, ms: number): void {
  const f = state.flow!;
  const perks = perksFrom(meta);
  let done = 0;
  while (done < ms - 1e-6 && !state.over) {
    const dt = Math.min(FLOW_STEP_MS, ms - done);
    const v: DriftVals = { w: state.moisture, n: state.nutrients, r: state.resist };
    const sum = zeroSum();
    driftStep(v, flowRates(state, events, perks), dt / DAY_MS, sum);
    state.moisture = v.w;
    state.nutrients = v.n;
    state.resist = v.r;
    f.w += sum.w;
    f.n += sum.n;
    f.r += sum.r;
    f.elapsed += dt;
    done += dt;
  }
  // Steps of 1/96 day leave float dust (69.9999999); keep 6 decimals.
  state.moisture = q6(state.moisture);
  state.nutrients = q6(state.nutrients);
  state.resist = q6(state.resist);
  for (const k of ['w', 'n', 'r'] as const) f[k] = q6(f[k]);
}

export interface FlowOptions {
  /** Start of `date` (local midnight, game clock). Lets the first tick of an old save catch up from midnight. */
  dayStartMs?: number;
}

/**
 * v1.4.17: drift 水分／養分／抗風力 for `date` from the last applied moment up to `toMs` (at most one full day per date).
 * Called every second while the game is open, on open / resume (closed-app time is caught up in the same 15-minute
 * steps) and by the settlement. A new tree starts drifting when it is planted; an old save catches up from midnight.
 */
export function advanceFlow(state: GameState, date: string, events: readonly WeatherEventId[], meta: MetaState | null, toMs: number, opts: FlowOptions = {}): void {
  if (state.over) return;
  const start = opts.dayStartMs;
  if (!state.flow || state.flow.date !== date) {
    const migrating = !state.flow && ((state.ageDays || 0) > 0 || Boolean(state.lastSettlement));
    if (start === undefined) state.flow = newFlow(state, date, toMs, 0);
    else if (migrating) state.flow = newFlow(state, date, Math.min(start, toMs), 0);
    else state.flow = newFlow(state, date, toMs, toMs - start);
  }
  const f = state.flow;
  const ms = Math.min(toMs - f.at, DAY_MS - f.elapsed);
  if (ms > 0) applyDrift(state, waterEvents(state, date, events), meta, ms);
  f.at = Math.max(f.at, toMs);
}

/** Settlement: bring `date` up to `nowMs`, then top it up to a full day so every settled day drifts exactly 24 hours. */
function completeFlowDay(state: GameState, date: string, events: readonly WeatherEventId[], meta: MetaState | null, nowMs: number): DayFlow {
  advanceFlow(state, date, events, meta, nowMs);
  const f = state.flow ?? newFlow(state, date, nowMs, 0);
  state.flow = f;
  const rest = DAY_MS - f.elapsed;
  if (rest > 0 && !state.over) applyDrift(state, waterEvents(state, date, events), meta, rest);
  return f;
}

/**
 * 酷熱 −20、暴雨／黑雨 +20、純毛毛雨 +10 hit 水分 the moment the rain or warning is first seen, once per calendar day
 * (暴雨 and 黑雨 share one application; 毛毛雨 is skipped when either of those is also on). Rain fills up to 100,
 * then at most +10 (+5 for 毛毛雨) beyond. Settlement calls this too, so a day the app stayed closed still counts once.
 */
export function applyWarningWater(
  state: GameState,
  date: string,
  events: readonly WeatherEventId[],
  meta: MetaState | null,
  nowMs: number,
  time?: string,
): WarningHit[] {
  if (state.over) return [];
  events = waterEvents(state, date, events);
  const perks = perksFrom(meta);
  const hot = events.includes('hot');
  const rain: WarningWaterEvent | null = events.includes('blackrain') ? 'blackrain' : events.includes('rainstorm') ? 'rainstorm' : null;
  const fx = state.waterFx[date] ?? { hot: false, rain: false };
  const drizzle = events.includes('drizzle') && !rain && !fx.rain;
  if ((!hot || fx.hot) && (!rain || fx.rain) && (!drizzle || fx.drizzle)) return [];
  state.waterFx = { ...state.waterFx, [date]: { ...fx } };
  const mark = state.waterFx[date]!;
  const hits: WarningHit[] = [];
  const push = (event: WarningWaterEvent, before: number, toN: number) => {
    const after = state.moisture;
    const delta = r1(after - before);
    const hint = after > W_SATURATED ? tl('sim.018') : after < W_OPTIMAL[0] ? tl('sim.019') : tl('sim.020');
    const message = tl('sim.022', { p0: regionalize(WARNING_NAME[event]), p1: sgn(delta), p2: Math.round(after), hint, p4: toN ? tl('sim.021', { toN }) : '' });
    addLog(state, date, message, { kind: 'event', title: regionalize(WARNING_NAME[event]), reward: { text: tl('sim.023', { p0: sgn(delta) }), tone: delta < 0 ? 'orange' : 'blue' }, time });
    hits.push({ event, before, after, delta, toN, message, dying: false });
  };
  if (hot && !mark.hot) {
    mark.hot = true;
    const before = state.moisture;
    const loss = perks.waterSaver ? r1(-WEATHER_EVENTS.hot.dW * T1_WATER_LOSS_MULT) : -WEATHER_EVENTS.hot.dW;
    state.moisture = clampW(r1(before - loss));
    push('hot', before, 0);
  }
  if (rain && !mark.rain) {
    mark.rain = true;
    const before = state.moisture;
    let amount = WEATHER_EVENTS[rain].dW;
    let toN = 0;
    if (perks.rainToN && rollFor(`rain2n|${date}`) < T2_RAIN_TO_N_CHANCE) {
      toN = amount / 2;
      amount -= toN;
      state.nutrients = clamp100(state.nutrients + toN);
    }
    state.moisture = rainAdd(before, amount, RAIN_OVER_CAP.heavy);
    push(rain, before, toN);
  }
  if (drizzle && !mark.drizzle) {
    mark.drizzle = true;
    const before = state.moisture;
    state.moisture = rainAdd(before, WEATHER_EVENTS.drizzle.dW, RAIN_OVER_CAP.drizzle);
    push('drizzle', before, 0);
  }
  const keys = Object.keys(state.waterFx).sort();
  while (keys.length > 21) delete state.waterFx[keys.shift()!];
  if (waterDeath(state.moisture) && hits.length) {
    const last = hits[hits.length - 1]!;
    last.dying = enterDying(state, date, nowMs, tl('sim.024', { W_MAX }), time) || Boolean(state.dying);
    last.message = tl('sim.025', { message: last.message, W_MAX });
  }
  return hits;
}

/** W ≥ 150 at any moment (e.g. the developer slider) → 瀕死 right away. */
export function checkWaterDeath(state: GameState, date: string, nowMs: number): boolean {
  if (state.over || !waterDeath(state.moisture)) return false;
  return enterDying(state, date, nowMs, tl('sim.024', { W_MAX }));
}

/** v13 熱／雨 line of the night: flat damage unless the day's 應急行動 was done. */
export interface CategoryHit {
  event: WeatherEventId;
  base: number;
  handled: boolean;
  /** 天氣分 (≤ 0). */
  score: number;
}

/** v13 風災 line of the night. */
export interface WindHit {
  event: WeatherEventId;
  base: number;
  /** Before 青年樹: no damage, no R change, no collapse. */
  locked: boolean;
  /** R used for the damage (before the night's consumption). */
  r: number;
  score: number;
  /** Collapse threshold of this event (R below = 倒塌). */
  threshold: number;
}

export interface CollapsePlan {
  event: WeatherEventId;
  threshold: number;
  r: number;
  /** Collapse count after tonight. */
  count: number;
  /** Over the limit: the tree dies (unless `revive`). */
  fatal: boolean;
  /** A 免死金牌 will block the death. */
  revive: boolean;
}

/** Everything the coming night will do, computed from the state as it stands (no mutation). */
export interface NightPlan {
  event: WeatherEventId;
  hBefore: number;
  wBefore: number;
  /** v1.4.24 今晚預計: observed rain not yet added to 水分 (settles first tonight). */
  pendingWater?: { event: WarningWaterEvent; delta: number }[];
  water: NightWater;
  wAfter: number;
  wScore: number;
  wLabel: string;
  wTone: 'dry' | 'ok' | 'rot1' | 'rot2' | 'rot3';
  nBefore: number;
  nAfter: number;
  nScore: number;
  rBefore: number;
  /** R after the night (decay + wind consumption; unchanged before 青年樹). */
  rAfter: number;
  heat: CategoryHit | null;
  /** v15 寒. */
  cold: CategoryHit | null;
  rain: CategoryHit | null;
  wind: WindHit | null;
  /** Number of 應急行動 that met tonight's warnings, and the bonus they give. */
  emergencyCount: number;
  emergencyBonus: number;
  /** Sum of the counted base damages (熱 + 雨 + 風). */
  baseDamage: number;
  /** Total weather damage tonight (positive number). */
  damage: number;
  pest: number;
  collapse: CollapsePlan | null;
  /** W reaches 150 tonight → 瀕死 (H 0). */
  waterDeath: boolean;
  hAfter: number;
  dH: number;
  /** v14 tonight's growth (the same numbers settleDay applies). */
  growth: GrowthPlan;
}

/** v14 生長: base from the current height (curve towards R + floor) × H_mult (after tonight's H) × 天氣加成. */
export interface GrowthPlan {
  heightBefore: number;
  /** 紀錄高度 R (cm). */
  recordCm: number;
  /** 每日基本生長 (cm, rounded to 0.1) before multipliers. */
  base: number;
  /** The 0.0002 × R floor decided tonight's base. */
  floor: boolean;
  mult: number;
  bonus: number;
  /** 捱過風暴 ×1.3 applies tonight. */
  survived: boolean;
  dG: number;
  /** Height after growth (min 5 cm), before any 倒塌. */
  grownCm: number;
  /** Height after the night including a non-fatal 倒塌 (−20%). */
  heightAfter: number;
}

/** Stage index needed for 風災 (青年樹). */
export function windStageCm(state: GameState): number {
  return stagesFor(speciesTargetCm(state.species))[WIND_UNLOCK_STAGE]!.minCm;
}

/** Care flags only count for the date they belong to. */
function careOn(state: GameState, date: string | null): Care | null {
  return date === null || state.care.date === date ? state.care : null;
}

/**
 * The night in order (設計書 v13): first the water change (natural loss −10, or none on a rain day), then
 * H_new = H_old + W_score + N_score + 天氣分(熱) + 天氣分(雨) + 天氣分(風) + 應急獎勵 − 蟲害.
 * 熱／寒／雨: flat −10／−10／−10 (黑雨 −15) unless 酷熱澆水／保暖／暴雨疏水 was done that day (then 0 and +3 each;
 * n ≥ 2 actions = 3n × 0.75).
 * 風 (after 青年樹 only): base × (1 − R/100); R below the event's threshold = 倒塌.
 * `date` is the day being settled: that day's care flags count (null = trust state.care).
 */
export function planNight(state: GameState, events: readonly WeatherEventId[], perks: Perks, date: string | null = null): NightPlan {
  const event = pickEvent(events);
  const care = careOn(state, date);
  // v1.4.17: only the part of today's drift not yet applied is still to come (all of it when the day has no flow yet).
  const flow = date !== null && state.flow?.date === date ? state.flow : null;
  const restMs = flow ? Math.max(0, DAY_MS - flow.elapsed) : DAY_MS;
  const rates = flowRates(state, date === null ? events : waterEvents(state, date, events), perks);
  const v = { w: state.moisture, n: state.nutrients, r: state.resist };
  simulateDrift(v, rates, restMs);
  v.w = q6(v.w);
  v.n = q6(v.n);
  v.r = q6(v.r);
  const water: NightWater = { wAfter: v.w, kind: rates.w === 0 ? 'rain' : 'loss', delta: r1(v.w - state.moisture) };
  const nAfter = v.n;
  const tier = wTier(water.wAfter);
  // v1.4.18: 健康 settles once at midnight from 水分／養分 at the end of the day (the old nightly formula).
  const wScore = tier.score;
  const nScore = nFactor(nAfter);
  // Wind meets the shield as it stood before today's slow loosening (as the old night did: R first, then −2).
  const rWind = q6(Math.max(0, Math.min(R_MAX, state.resist - (flow?.r ?? 0))));
  let emergencyCount = 0;
  const hotId = topInCategory(events, 'heat');
  let heat: CategoryHit | null = null;
  if (hotId) {
    const handled = Boolean(care?.heatWater);
    if (handled) emergencyCount += 1;
    heat = { event: hotId, base: WEATHER_EVENTS[hotId].damage, handled, score: handled ? 0 : -WEATHER_EVENTS[hotId].damage };
  }
  const coldId = topInCategory(events, 'cold');
  let cold: CategoryHit | null = null;
  if (coldId) {
    const handled = Boolean(care?.warmCover);
    if (handled) emergencyCount += 1;
    cold = { event: coldId, base: WEATHER_EVENTS[coldId].damage, handled, score: handled ? 0 : -WEATHER_EVENTS[coldId].damage };
  }
  const rainId = topInCategory(events, 'rain');
  let rain: CategoryHit | null = null;
  if (rainId) {
    const handled = Boolean(care?.rainDrain);
    if (handled) emergencyCount += 1;
    rain = { event: rainId, base: WEATHER_EVENTS[rainId].damage, handled, score: handled ? 0 : -WEATHER_EVENTS[rainId].damage };
  }
  const windId = topInCategory(events, 'wind');
  const locked = !state.windUnlocked;
  let wind: WindHit | null = null;
  let collapse: CollapsePlan | null = null;
  let rAfter = state.resist;
  if (!locked) rAfter = Math.max(0, Math.min(R_MAX, v.r + (windId ? WEATHER_EVENTS[windId].dR : 0)));
  if (windId) {
    const def = WEATHER_EVENTS[windId];
    const threshold = def.collapseBelow ?? 0;
    const dmg = locked ? 0 : finalDamage(def.damage, rWind);
    wind = { event: windId, base: def.damage, locked, r: rWind, score: dmg ? -dmg : 0, threshold };
    if (!locked && rWind < threshold) {
      const count = (state.collapses || 0) + 1;
      const fatal = count > COLLAPSE_MAX;
      collapse = { event: windId, threshold, r: rWind, count, fatal, revive: fatal && Boolean(perks.revive) };
    }
  }
  const bonus = emergencyBonus(emergencyCount);
  const weather = (heat?.score ?? 0) + (cold?.score ?? 0) + (rain?.score ?? 0) + (wind?.score ?? 0);
  const baseDamage = (heat?.base ?? 0) + (cold?.base ?? 0) + (rain?.base ?? 0) + (wind && !wind.locked ? wind.base : 0);
  const pest = state.pest.active ? pestDamageWith(state.residents.length) : 0;
  const death = waterDeath(water.wAfter);
  const hAfter = death ? 0 : r1(Math.max(0, Math.min(100, state.health + wScore + nScore - pest + weather + bonus)));
  const growth = planGrowth(state, event, wind, hAfter, collapse);
  return {
    event,
    hBefore: state.health,
    wBefore: state.moisture,
    water,
    wAfter: water.wAfter,
    wScore,
    wLabel: tier.label,
    wTone: tier.tone,
    nBefore: state.nutrients,
    nAfter,
    nScore,
    rBefore: state.resist,
    rAfter,
    heat,
    cold,
    rain,
    wind,
    emergencyCount,
    emergencyBonus: bonus,
    baseDamage,
    damage: weather ? r1(-weather) : 0,
    pest,
    collapse,
    waterDeath: death,
    hAfter,
    dH: r1(hAfter - state.health),
    growth,
  };
}

/** v14: tonight's growth from the CURRENT height (after earlier nights and collapses). 捱過風暴 ×1.3 only for wind, only after 青年樹. */
function planGrowth(state: GameState, event: WeatherEventId, wind: WindHit | null, hAfter: number, collapse: CollapsePlan | null): GrowthPlan {
  const mult = hMult(hAfter);
  const windDmg = wind ? -wind.score : 0;
  const survived = Boolean(wind && !wind.locked && windDmg <= wind.base * STORM_SURVIVE_SHARE);
  const bonus = Math.round(WEATHER_EVENTS[event].growth * (survived ? STORM_SURVIVE_GROWTH : 1) * (state.eventBonus || 1) * 100) / 100;
  const recordCm = speciesTargetCm(state.species);
  const raw = baseDailyGrowth(recordCm, state.heightCm);
  const base = r1(raw);
  const dG = deltaG(base, mult, bonus);
  const grownCm = Math.max(5, r1(state.heightCm + dG));
  const heightAfter = collapse && (!collapse.fatal || collapse.revive) ? Math.max(5, r1(grownCm * (1 - COLLAPSE_HEIGHT_LOSS))) : grownCm;
  return { heightBefore: state.heightCm, recordCm, base, floor: raw <= GROWTH_FLOOR_SHARE * recordCm + 1e-9, mult, bonus, survived, dG, grownCm, heightAfter };
}

/**
 * 今晚預計: exactly what settleDay will do tonight if nothing else changes — pending warning water first, then planNight.
 * Works on a throwaway copy, so the real state is untouched.
 */
export function previewNight(state: GameState, date: string, events: readonly WeatherEventId[], meta: MetaState | null): NightPlan {
  const copy: GameState = { ...state, log: [], waterFx: { ...state.waterFx }, pest: { ...state.pest }, flow: state.flow ? { ...state.flow } : undefined };
  const hits = applyWarningWater(copy, date, events, meta, 0, '');
  const plan = planNight(copy, events, perksFrom(meta), date);
  // v1.4.24: 而家 is the real value; observed rain not yet applied is listed on its own.
  return { ...plan, wBefore: state.moisture, pendingWater: hits.map((h) => ({ event: h.event, delta: h.delta })) };
}

/**
 * Settle one day (設計書 二、三，v12 水分):
 * warning water not yet applied → the night's water change → H_new = H_old + W_score + N_score − 天氣基礎傷害 × (1 − R/100) − 蟲害;
 * ΔG = v14 基本生長 max((R − h) × (1 − e^(−1/100)), 0.0002R) × H_mult × 天氣獎勵加成 (planGrowth, shared with 今晚預計).
 */
export function settleDay(state: GameState, date: string, events: readonly WeatherEventId[], meta: MetaState | null, nowMs: number): SettleResult {
  const perks = perksFrom(meta);
  const notes: string[] = [];
  const messages: string[] = [];
  // Warnings seen that day but never applied (app closed, or forecast-only days) hit first.
  const pre = applyWarningWater(state, date, events, meta, nowMs, '');
  for (const h of pre) {
    notes.push(tl('sim.026', { p0: regionalize(WARNING_NAME[h.event]), p1: sgn(h.delta) }));
    if (h.toN) notes.push(tl('sim.027', { toN: h.toN }));
  }
  // The day's slow drift (水分、養分、抗風力) is finished first — whatever of the 24 hours the open app did not already
  // apply — then 健康 settles once from those end-of-day values (v1.4.18), with the weather, the bonus and growth.
  const flow = completeFlowDay(state, date, events, meta, nowMs);
  const plan = planNight(state, events, perks, date);
  const eventId = plan.event;
  const hBefore = flow.start.h;
  const wBefore = flow.start.w;
  const nBefore = flow.start.n;
  const rBefore = rWindOf(state, flow);
  const hits = [plan.heat, plan.cold, plan.rain, plan.wind].filter((x) => x);
  const cats = hits.length;
  const severeSeen = [...new Set(events)].filter((e) => WEATHER_EVENTS[e].category);
  if (severeSeen.length > cats) notes.push(tl('sim.028', { p0: hits.map((x) => eventLabel(x!.event)).join(tl('ui.206')) }));
  if (cats > 1) notes.push(tl('sim.029'));
  const rainDay = flowRates(state, waterEvents(state, date, events), perks).w === 0;
  if (!rainDay && perks.waterSaver) notes.push(tl('sim.030'));
  if (rainDay) notes.push(tl('sim.031'));
  if (plan.heat) notes.push(plan.heat.handled ? tl('sim.032', { p0: eventLabel('hot') }) : tl('sim.033', { p0: eventLabel('hot'), base: plan.heat.base }));
  if (plan.cold) notes.push(plan.cold.handled ? tl('sim.034') : tl('sim.035', { base: plan.cold.base }));
  if (plan.rain) notes.push(plan.rain.handled ? tl('sim.036', { p0: eventLabel(plan.rain.event), p1: emergencyName('rainDrain') }) : tl('sim.037', { p0: eventLabel(plan.rain.event), p1: emergencyName('rainDrain'), base: plan.rain.base }));
  if (plan.emergencyBonus) notes.push(tl('ui.064', { p0: emergencyBonusText(plan.emergencyCount) }));
  if (plan.wind?.locked) notes.push(tl('sim.038', { p0: eventLabel(plan.wind.event) }));

  state.moisture = plan.wAfter;
  state.nutrients = plan.nAfter;
  // Wind damage uses the shield as it stood, then the event consumes it (frozen before 青年樹).
  const dmg = plan.damage;
  state.resist = plan.rAfter;
  const pestDamage = plan.pest;
  if (pestDamage) notes.push(tl('sim.039', { pestDamage }));
  const wf = plan.wScore;
  const nf = plan.nScore;
  state.health = plan.hAfter;

  // Growth (v14 curve towards R + floor), computed by planNight so 今晚預計 shows the same numbers.
  const { mult, bonus, base, dG, survived } = plan.growth;
  const w = plan.wind;
  const windDmg = w ? -w.score : 0;
  const beforeCm = state.heightCm;
  state.heightCm = plan.growth.grownCm;

  for (const hit of [plan.heat, plan.cold, plan.rain]) {
    if (!hit || hit.handled) continue;
    const label = eventLabel(hit.event);
    const fix = emergencyName(hit.event === 'hot' ? 'heatWater' : hit.event === 'cold' ? 'warmCover' : 'rainDrain');
    addLog(state, date, tl('sim.040', { label, fix, base: hit.base }), { kind: 'storm-hit', title: tl('sim.041', { label }), reward: { text: tl('sim.042', { base: hit.base }), tone: 'red' }, time: '' });
    messages.push(tl('sim.043', { label, base: hit.base, fix }));
  }
  if (plan.emergencyBonus) {
    addLog(state, date, plan.emergencyCount > 1 ? tl('sim.044', { emergencyCount: plan.emergencyCount, p1: emergencyBonusText(plan.emergencyCount) }) : tl('sim.045', { emergencyBonus: plan.emergencyBonus }), { kind: 'emergency', title: tl('ui.065'), reward: { text: tl('sim.046', { emergencyBonus: plan.emergencyBonus }), tone: 'green' }, time: '' });
  }
  if (w && !w.locked) {
    const label = eventLabel(w.event);
    if (survived) {
      state.stormSurvivals += 1;
      if (state.scars > 0) state.scars -= 1;
      addLog(state, date, tl('sim.047', { label, p1: Math.round(rBefore), base: w.base, windDmg }), {
        kind: 'storm-safe',
        title: tl('sim.048', { label }),
        reward: { text: tl('sim.049', { STORM_SURVIVE_GROWTH }), tone: 'green' },
        time: '',
      });
      messages.push(tl('sim.050', { label, windDmg }));
    } else if (windDmg >= 10) {
      state.scars = Math.min(4, state.scars + 1);
      addLog(state, date, tl('sim.051', { label, windDmg, base: w.base, p3: Math.round(rBefore), p4: r1(w.base - windDmg) }), {
        kind: 'storm-hit',
        title: tl('sim.041', { label }),
        reward: { text: tl('sim.052', { windDmg }), tone: 'red' },
        time: '',
      });
      messages.push(tl('sim.053', { label, windDmg }));
    }
  }

  // v13 倒塌: deterministic when R (before consumption) was below the wind event's threshold.
  let collapseInfo: Settlement['collapse'] = null;
  let collapseDied = false;
  let collapseRevived = false;
  if (plan.collapse) {
    const c = plan.collapse;
    const label = eventLabel(c.event);
    state.collapses = c.count;
    const hBeforeCollapse = state.heightCm;
    if (c.fatal && !(meta && meta.reviveTokens > 0)) {
      collapseDied = true;
      state.health = 0;
      addLog(state, date, tl('sim.054', { label, p1: Math.round(c.r), threshold: c.threshold, count: c.count }), { kind: 'collapse', title: tl('sim.055'), reward: { text: tl('sim.056', { count: c.count }), tone: 'red' }, time: '' });
      messages.push(tl('sim.057', { label, count: c.count }));
    } else {
      if (c.fatal && meta) {
        meta.reviveTokens -= 1;
        collapseRevived = true;
        state.health = Math.max(state.health, REVIVE_HEALTH);
        addLog(state, date, tl('sim.058', { count: c.count, p1: Math.round(state.health) }), { kind: 'badge', title: tl('sim.014'), reward: { text: tl('sim.059'), tone: 'purple' }, time: '' });
        messages.push(tl('sim.060'));
      }
      state.heightCm = Math.max(5, r1(state.heightCm * (1 - COLLAPSE_HEIGHT_LOSS)));
      state.doubleRPending = true;
      addLog(state, date, tl('sim.062', { label, p1: Math.round(c.r), threshold: c.threshold, p3: formatHeight(hBeforeCollapse), p4: formatHeight(state.heightCm), p5: Math.min(c.count, COLLAPSE_MAX), COLLAPSE_MAX, p7: c.count >= COLLAPSE_MAX ? tl('sim.061') : '' }), {
        kind: 'collapse',
        title: tl('ui.181'),
        reward: { text: tl('sim.063', { p0: Math.round(COLLAPSE_HEIGHT_LOSS * 100) }), tone: 'red' },
        time: '',
      });
      messages.push(tl('sim.064', { label, p1: Math.min(c.count, COLLAPSE_MAX), COLLAPSE_MAX }));
    }
    collapseInfo = { event: c.event, threshold: c.threshold, count: c.count, heightBefore: hBeforeCollapse, heightAfter: state.heightCm, fatal: c.fatal, revived: collapseRevived };
    // v16 (visual only): what the scene needs for the collapse animation, the broken top and the fallen log.
    state.lastCollapse = { date, event: c.event, heightBefore: hBeforeCollapse, heightAfter: state.heightCm, count: c.count, fatal: collapseDied, seen: false };
  }
  // 蟲害 triggers for the coming days.
  state.pest.lowNDays = state.nutrients < 30 ? state.pest.lowNDays + 1 : 0;
  state.pest.wetDays = state.moisture > W_SATURATED ? state.pest.wetDays + 1 : 0;
  const need = pestTriggerDays(state.residents.length);
  if (!state.pest.active && (state.pest.lowNDays >= need || state.pest.wetDays >= need)) {
    state.pest.active = true;
    state.pest.since = date;
    const why = state.pest.lowNDays >= need ? tl('sim.065', { need }) : tl('sim.066', { need, W_SATURATED });
    const dmg = pestDamageWith(state.residents.length);
    addLog(state, date, tl('sim.067', { why, dmg }), { kind: 'pest', title: tl('ui.068'), reward: { text: tl('sim.068', { dmg }), tone: 'red' }, time: '' });
    messages.push(tl('sim.069', { why }));
  }

  // Resident animals: consecutive nights at H ≥ 85 — 5 for the 1st species, 5 more for the 2nd, then 10 more each.
  if (state.health >= RESIDENT_MIN_H) {
    state.highStreak += 1;
    if (state.highStreak >= residentStreakNeeded(state.residents.length)) {
      const pick = state.animals.find((id) => !state.residents.includes(id));
      if (pick) {
        state.residents.push(pick);
        state.highStreak = 0;
        const name = ANIMALS.find((a) => a.id === pick)?.name ?? pick;
        addLog(state, date, tl('sim.070', { name, RESIDENT_PEST_CUT }), {
          kind: 'animal',
          title: tl('sim.071'),
          reward: { text: tl('sim.072'), tone: 'purple' },
          time: '',
        });
      }
    }
  } else {
    // Any night below 85 breaks the run of good nights; below 75 one resident species also leaves.
    state.highStreak = 0;
    if (state.health < RESIDENT_LEAVE_H && state.residents.length) {
      const gone = state.residents.pop()!;
      const name = ANIMALS.find((a) => a.id === gone)?.name ?? gone;
      addLog(state, date, tl('sim.073', { RESIDENT_LEAVE_H, name, p2: residentStreakNeeded(state.residents.length), RESIDENT_MIN_H }), { kind: 'animal', title: tl('sim.074'), time: '' });
    }
  }

  // 瀕死 and death.
  let died = false;
  let revived = collapseRevived;
  const wasDying = state.dying;
  if (collapseDied) {
    died = true;
    killTree(state, date, '');
  } else if (state.health <= 0) {
    state.health = 0;
    if (!wasDying) {
      enterDying(state, date, nowMs, plan.waterDeath ? tl('sim.024', { W_MAX }) : tl('sim.075'), '');
      messages.push(tl('sim.076', { p0: W_OPTIMAL[0], p1: W_OPTIMAL[1], p2: N_OPTIMAL[0] }));
    } else {
      const end = resolveDyingExpiry(state, date, meta, nowMs, '');
      if (end === 'dead') died = true;
      if (end === 'revived') {
        revived = true;
        messages.push(tl('sim.077'));
      }
    }
  } else if (wasDying) {
    state.dying = null;
    addLog(state, date, tl('sim.078'), { kind: 'grow', title: tl('sim.079'), reward: { text: tl('sim.080', { p0: Math.round(state.health) }), tone: 'green' }, time: '' });
  }

  const nestNight = settleNest(state, nowMs, date);
  if (nestNight.paid) {
    const parent = nestBirdName(nestNight.bird);
    const build = nestBuildAt(nestNight.count);
    if (build) {
      const phrase = nestBuildPhrase(build);
      notes.push(tl('sim.081', { parent, phrase }));
      messages.push(tl('sim.082', { parent, phrase }));
      addLog(state, date, tl('sim.082', { parent, phrase }), { kind: 'animal', title: tl('sim.083'), reward: { text: phrase, tone: 'blue' }, time: '' });
    } else if (isNestHeightCount(nestNight.count)) {
      const extra = dG > 0 ? Math.max(0.1, r1(dG * 0.3)) : 0;
      if (extra > 0) state.heightCm = r1(state.heightCm + extra);
      const gift = extra > 0 ? tl('sim.084', { extra }) : tl('sim.085');
      notes.push(tl('sim.086', { parent, gift }));
      messages.push(tl('sim.087', { parent, gift }));
      addLog(state, date, tl('sim.087', { parent, gift }), { kind: 'animal', title: tl('sim.083'), reward: { text: extra > 0 ? tl('sim.088', { extra }) : tl('sim.089'), tone: 'green' }, time: '' });
    } else {
      notes.push(tl('sim.090', { parent }));
      messages.push(tl('sim.091', { parent }));
      addLog(state, date, tl('sim.091', { parent }), { kind: 'animal', title: tl('sim.083'), reward: { text: tl('sim.089'), tone: 'green' }, time: '' });
    }
    for (const n of nestNight.awards) {
      const title = nestAwardTitle(n);
      messages.push(tl('sim.092', { title }));
      addLog(state, date, tl('sim.093', { title }), { kind: 'badge', title, reward: { text: tl('ui.192'), tone: 'purple' }, time: '' });
    }
  }

  const settlement: Settlement = {
    date,
    events: [...events],
    event: eventId,
    hBefore,
    hAfter: state.health,
    wBefore,
    wAfter: state.moisture,
    nBefore,
    nAfter: state.nutrients,
    rBefore,
    rAfter: state.resist,
    wFactor: wf,
    wLabel: plan.wLabel,
    wNight: { kind: rainDay ? 'rain' : 'loss', delta: r1(flow.w) },
    nFactor: nf,
    baseDamage: plan.baseDamage,
    finalDamage: dmg,
    pestDamage,
    hMult: mult,
    weatherBonus: bonus,
    baseGrowth: base,
    deltaG: r1(state.heightCm - beforeCm),
    heightAfter: state.heightCm,
    carbonKg: carbonKg(state.heightCm, state.species),
    notes,
    heat: plan.heat,
    cold: plan.cold,
    rain: plan.rain,
    wind: plan.wind ? { event: plan.wind.event, base: plan.wind.base, locked: plan.wind.locked, score: plan.wind.score, r: plan.wind.r } : null,
    emergencyBonus: plan.emergencyBonus,
    emergencyCount: plan.emergencyCount,
    collapse: collapseInfo,
    day: { dH: r1(state.health - flow.start.h), dW: r1(state.moisture - flow.start.w), dN: r1(state.nutrients - flow.start.n), dR: r1(state.resist - flow.start.r) },
  };
  state.lastSettlement = settlement;
  const tier = hMultTier(state.health);
  addLog(
    state,
    date,
    tl('sim.096', { p0: dailySummaryText(settlement), p1: eventLabel(eventId), p2: sgn(-dmg), p3: plan.emergencyBonus ? tl('sim.094', { emergencyBonus: plan.emergencyBonus }) : '', p4: pestDamage ? tl('sim.095', { pestDamage }) : '', p5: Math.round(state.health), label: tier.label, mult }),
    { kind: 'settle', title: tl('ui.086'), reward: { text: tl('sim.097', { p0: dG >= 0 ? '+' : '', deltaG: settlement.deltaG }), tone: dG >= 0 ? 'blue' : 'red' }, time: '' },
  );
  // The next day starts drifting from this moment.
  if (!state.over) state.flow = newFlow(state, addDays(date, 1), nowMs, 0);
  else state.flow = undefined;
  if (!collapseInfo) noteStage(state, beforeCm, date);
  checkWindUnlock(state, date);

  // v14 樹齡 and milestones (a tree that died tonight gets none).
  state.ageDays = (state.ageDays || 0) + 1;
  const milestones = state.over ? [] : checkMilestones(state, date);
  if (!state.over) {
    const rain = plan.rain;
    checkWeatherAchievements(state, date, {
      survived,
      wind: plan.wind && !plan.wind.locked ? plan.wind.event : null,
      rainHandled: rain?.handled && (rain.event === 'blackrain' || rain.event === 'rainstorm') ? rain.event : null,
      rainPresent: Boolean(rain && (rain.event === 'blackrain' || rain.event === 'rainstorm')),
      heatHandled: Boolean(plan.heat?.handled),
      coldHandled: Boolean(plan.cold?.handled),
    });
  }
  return { settlement, messages, died, revived, milestones };
}

/** v1.4.17 每日總結 line: 「今日：健康 +5、水分 −10、養分 −10、鞏固度 −2」. */
export function dailySummaryText(s: Pick<Settlement, 'day'>): string {
  const d = s.day;
  if (!d) return '';
  const f = (v: number) => (Math.abs(v) < 0.05 ? '±0' : sgn(r1(v)));
  return tl('sim.todayPrefix') + tl('sim.098', { p0: f(d.dH), p1: f(d.dW), p2: f(d.dN), p3: f(d.dR) });
}

function rWindOf(state: GameState, flow: DayFlow): number {
  return q6(Math.max(0, Math.min(R_MAX, state.resist - flow.r)));
}

/** Player-facing 樹齡. The planting day is day 1; each settled night adds one. Unplanted games stay at 0. */
export function shownAge(state: { ageDays?: number; started?: boolean }): number {
  const nights = state.ageDays || 0;
  return state.started === false ? nights : nights + 1;
}

/** v14: the next age milestone not reached yet (null after 3年). */
export function nextMilestone(state: GameState): (typeof AGE_MILESTONES)[number] | null {
  return AGE_MILESTONES.find((m) => !state.milestones?.[m.id] && m.days > (state.ageDays || 0)) ?? AGE_MILESTONES.find((m) => !state.milestones?.[m.id]) ?? null;
}

/** v14 h / R. */
export function recordShare(state: GameState): number {
  return state.heightCm / speciesTargetCm(state.species);
}

/**
 * v14: award every age milestone the tree has reached (age ≥ days) and 超越世界紀錄 (first time h > R).
 * Tier from the current h / R against e(milestone day). Idempotent; returns the new awards (they also go to the log).
 * `retro` = awarded by the save migration.
 */
export function checkMilestones(state: GameState, date: string, opts: { retro?: boolean; time?: string; perks?: (1 | 2 | 3)[] } = {}): MilestoneAward[] {
  state.milestones ??= {};
  const got: MilestoneAward[] = [];
  const R = speciesTargetCm(state.species);
  const share = state.heightCm / R;
  const time = opts.time ?? '';
  for (const m of AGE_MILESTONES) {
    if (state.milestones[m.id] || (state.ageDays || 0) < m.days) continue;
    const tier = milestoneTier(share, m.days);
    const perk = m.perk && (!opts.perks || opts.perks.includes(m.perk)) ? m.perk : undefined;
    const award: MilestoneAward = { id: m.id, tier, date, ageDays: opts.retro ? state.ageDays : m.days, heightCm: state.heightCm, share: r1(share * 1000) / 1000, ...(opts.retro ? { retro: true } : {}), ...(perk ? { perk } : {}) };
    state.milestones[m.id] = award;
    got.push(award);
    addLog(state, date, tl('sim.100', { treeName: state.treeName, label: m.label, p2: formatHeight(state.heightCm), p3: Math.round(share * 100), p4: MILESTONE_TIER_LABEL[tier], p5: opts.retro ? tl('sim.099') : '' }), {
      kind: 'badge',
      title: tl('sim.101', { label: m.label }),
      reward: { text: tl('sim.102', { p0: MILESTONE_TIER_LABEL[tier] }), tone: 'purple' },
      time,
    });
  }
  if (!state.milestones.record && state.heightCm > R) {
    const award: MilestoneAward = { id: 'record', tier: null, date, ageDays: state.ageDays || 0, heightCm: state.heightCm, share: r1(share * 1000) / 1000, ...(opts.retro ? { retro: true } : {}) };
    state.milestones.record = award;
    state.passedTargetOn ??= date;
    got.push(award);
    addLog(state, date, tl('sim.103', { treeName: state.treeName, p1: formatHeight(state.heightCm), p2: speciesDef(state.species).name, p3: formatHeight(R) }), {
      kind: 'badge',
      title: RECORD_MILESTONE.label,
      reward: { text: formatHeight(state.heightCm), tone: 'purple' },
      time,
    });
  }
  return got;
}

export function freshWx(): WeatherProgress {
  return {
    date: '',
    counts: { storm: 0, t8: 0, black: 0, rain: 0, heat: 0, cold: 0 },
    spell: { wind: '', rain: '', windCounted: false, t8Counted: false, rainCounted: false },
    awards: {},
  };
}

/** What the player actually did on a settled night. Merely seeing the weather does not count. */
export interface WeatherNight {
  /** 青年樹之後，風災傷害唔超過基礎嘅 25%（靠加固）。 */
  survived: boolean;
  /** The wind event that applied (null before 青年樹, or when there was no wind). */
  wind: WeatherEventId | null;
  /** 暴雨／黑雨 the player drained for. Null if they did not 疏水. */
  rainHandled: 'rainstorm' | 'blackrain' | null;
  /** 暴雨 or 黑雨 is in force, even if the player did not 疏水 (keeps a multi-day rain as one spell). */
  rainPresent?: boolean;
  heatHandled: boolean;
  coldHandled: boolean;
}

/**
 * Count a night the tree lived through. A wind or heavy-rain spell that continues from yesterday
 * stays one count. 酷熱／寒冷 each successful day counts. Idempotent per date. New awards go to the log.
 */
export function checkWeatherAchievements(state: GameState, date: string, night: WeatherNight): WeatherAward[] {
  if (state.over || state.health <= 0) return [];
  const wx = (state.wx ??= freshWx());
  wx.awards ??= {};
  wx.counts ??= { storm: 0, t8: 0, black: 0, rain: 0, heat: 0, cold: 0 };
  wx.spell ??= { wind: '', rain: '', windCounted: false, t8Counted: false, rainCounted: false };
  if (wx.date !== date) {
    const yesterday = addDays(date, -1);
    if (night.wind) {
      if (wx.spell.wind !== yesterday) {
        wx.spell.windCounted = false;
        wx.spell.t8Counted = false;
      }
      if (night.survived && !wx.spell.windCounted) {
        wx.counts.storm = (Number(wx.counts.storm) || 0) + 1;
        wx.spell.windCounted = true;
      }
      if (night.survived && night.wind === 'typhoon8' && !wx.spell.t8Counted) {
        wx.counts.t8 = (Number(wx.counts.t8) || 0) + 1;
        wx.spell.t8Counted = true;
      }
      wx.spell.wind = date;
    }
    if (night.rainPresent || night.rainHandled) {
      if (wx.spell.rain !== yesterday) wx.spell.rainCounted = false;
      if (night.rainHandled && !wx.spell.rainCounted) {
        const track = night.rainHandled === 'blackrain' ? 'black' : 'rain';
        wx.counts[track] = (Number(wx.counts[track]) || 0) + 1;
        wx.spell.rainCounted = true;
      }
      wx.spell.rain = date;
    }
    if (night.heatHandled) wx.counts.heat = (Number(wx.counts.heat) || 0) + 1;
    if (night.coldHandled) wx.counts.cold = (Number(wx.counts.cold) || 0) + 1;
    wx.date = date;
  }
  const got: WeatherAward[] = [];
  for (const track of WX_TRACKS) {
    const n = wx.counts[track.id] || 0;
    if (!isWxAwardCount(track.id, n)) continue;
    const id = wxAwardId(track.id, n);
    if (wx.awards[id]) continue;
    const award: WeatherAward = { id, date, ageDays: state.ageDays || 0 };
    wx.awards[id] = award;
    got.push(award);
    const copy = weatherAchievementCopy(id);
    addLog(state, date, tl('sim.104', { treeName: state.treeName, title: copy.title }), {
      kind: 'badge',
      title: copy.title,
      reward: { text: tl('ui.192'), tone: 'purple' },
      time: '',
    });
  }
  return got;
}

/** `storm1` from the 1st/3rd/5th list becomes `storm:1` when that count still claims an achievement. */
function legacyWxAwardId(id: string): WeatherAchievementId | null {
  if (parseWxAwardId(id)) return id as WeatherAchievementId;
  const match = /^(storm|t8|black|rain|heat|cold)(\d+)$/.exec(id);
  if (!match) return null;
  const count = Number(match[2]);
  if (!isWxAwardCount(match[1] as WeatherTrackId, count)) return null;
  return wxAwardId(match[1] as WeatherTrackId, count);
}

/** Old saves counted sunny streaks and “the weather happened”. Those awards do not match the handled-night rules. */
export function migrateWx(data: GameState): void {
  const raw = data.wx as (WeatherProgress & { sunny?: number }) | undefined;
  if (!raw?.counts || typeof raw.sunny === 'number') {
    data.wx = freshWx();
    return;
  }
  raw.awards ??= {};
  raw.date ??= '';
  raw.spell ??= { wind: '', rain: '', windCounted: false, t8Counted: false, rainCounted: false };
  for (const track of WX_TRACKS) raw.counts[track.id] = Number(raw.counts[track.id]) || 0;
  for (const id of Object.keys(raw.awards)) {
    const next = legacyWxAwardId(id);
    if (!next) {
      delete raw.awards[id as WeatherAchievementId];
      continue;
    }
    if (next !== id) {
      raw.awards[next] = { ...raw.awards[id as WeatherAchievementId]!, id: next };
      delete raw.awards[id as WeatherAchievementId];
    }
  }
}

function noteStage(state: GameState, beforeCm: number, date: string, time = ''): string | null {
  const target = speciesTargetCm(state.species);
  const before = stageFor(beforeCm, target);
  const after = stageFor(state.heightCm, target);
  if (before.id === after.id || state.heightCm < beforeCm) return null;
  addLog(state, date, tl('sim.105', { name: after.name, p1: formatHeight(state.heightCm) }), { kind: 'stage', title: tl('ui.173'), reward: { text: after.name, tone: 'blue' }, time });
  return tl('sim.106', { name: after.name });
}

/**
 * v13: the first time the tree reaches 青年樹, 風災／加固／倒塌 switch on for good (a later collapse below the stage
 * does not lock them again). The explainer card is shown once (windExplained). Returns true when it just unlocked.
 */
export function checkWindUnlock(state: GameState, date: string, time = ''): boolean {
  if (state.windUnlocked) return false;
  if (state.heightCm < windStageCm(state)) return false;
  state.windUnlocked = true;
  state.windExplained = false;
  addLog(state, date, tl('sim.107', { p0: STAGE_NAMES[WIND_UNLOCK_STAGE], R_DAILY_DECAY }), {
    kind: 'unlock',
    title: tl('ui.182'),
    reward: { text: tl('sim.108'), tone: 'orange' },
    time,
  });
  return true;
}

/** v13: after a collapse, the next care date (whenever the player opens the game) gets double 加固. */
export function startDoubleR(state: GameState): boolean {
  if (!state.doubleRPending || state.over) return false;
  state.doubleRPending = false;
  state.doubleRDate = state.care.date;
  state.doubleRSeen = false;
  return true;
}

/** Is today a double-加固 day? */
export function doubleRActive(state: GameState): boolean {
  return Boolean(state.doubleRDate) && state.doubleRDate === state.care.date;
}

/** How much R one 加固 item gives right now. */
export function prepAmount(state: GameState, prep: PrepId): number {
  return PREPS[prep].amount * (doubleRActive(state) ? COLLAPSE_REINFORCE_MULT : 1);
}

/* ---------- Care actions ---------- */

export type CareAction = 'water' | 'fertilize' | 'deworm' | 'drain';

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** v1.4.23: the current clock hour (game day + local HH from the log clock), for the 2-per-hour watering limit. */
export function waterHourKey(state: GameState): string {
  return `${state.care.date}T${logClock().slice(0, 2)}`;
}

/** Next clock hour as HH:00 (when watering opens again after 2 taps). */
export function nextWaterTime(): string {
  const h = Number(logClock().slice(0, 2));
  return Number.isFinite(h) && logClock() ? `${String((h + 1) % 24).padStart(2, '0')}:00` : '';
}

export function actionLimit(state: GameState, action: CareAction): { used: number; max: number } {
  if (action === 'water') return { used: state.care.waterHour === waterHourKey(state) ? (state.care.waterInHour ?? 0) : 0, max: CARE.water.perHour };
  if (action === 'drain') return { used: state.care.drain, max: CARE.drain.perDay };
  if (action === 'fertilize') return { used: state.care.fertilize, max: CARE.fertilize.perDay };
  return { used: state.care.dewormed ? 1 : 0, max: 1 };
}

export function performAction(state: GameState, action: CareAction): ActionResult {
  if (state.over) return { ok: false, message: tl('sim.109') };
  const lim = actionLimit(state, action);
  if (lim.used >= lim.max) return { ok: false, message: action === 'water' ? tl('sim.waterHour', { max: lim.max, time: nextWaterTime() }) : tl('sim.110') };
  let message = '';
  let reward: LogReward;
  const title = { water: tl('ui.167'), fertilize: tl('ui.168'), deworm: tl('ui.169'), drain: tl('ui.170') }[action];
  if (action === 'water') {
    // Saturated soil: watering does nothing and does not use up one of today's turns.
    if (state.moisture >= W_SATURATED) return { ok: false, message: tl('sim.111') };
    state.care.water += 1;
    const hour = waterHourKey(state);
    state.care.waterInHour = state.care.waterHour === hour ? (state.care.waterInHour ?? 0) + 1 : 1;
    state.care.waterHour = hour;
    const before = state.moisture;
    state.moisture = waterAdd(before, CARE.water.amount);
    const got = r1(state.moisture - before);
    message = state.moisture >= W_SATURATED ? tl('sim.112', { p0: Math.round(state.moisture) }) : tl('sim.113', { p0: Math.round(state.moisture) });
    reward = { text: tl('sim.114', { got }), tone: 'blue' };
  } else if (action === 'drain') {
    state.care.drain += 1;
    const before = state.moisture;
    state.moisture = Math.max(0, r1(before + CARE.drain.amount));
    const got = r1(state.moisture - before);
    message =
      state.moisture > W_SATURATED
        ? tl('sim.115', { p0: Math.round(state.moisture) })
        : state.moisture < W_OPTIMAL[0]
          ? tl('sim.116', { p0: Math.round(state.moisture) })
          : tl('sim.117', { p0: Math.round(state.moisture) });
    reward = { text: tl('sim.118', { got }), tone: 'blue' };
  } else if (action === 'fertilize') {
    state.care.fertilize += 1;
    state.nutrients = clamp100(state.nutrients + CARE.fertilize.amount);
    message = tl('sim.119', { p0: Math.round(state.nutrients) });
    reward = { text: tl('sim.120', { amount: CARE.fertilize.amount }), tone: 'green' };
  } else {
    state.care.dewormed = true;
    if (state.pest.active) {
      state.pest = { active: false, lowNDays: 0, wetDays: 0, since: null };
      message = tl('sim.121');
      reward = { text: tl('sim.122'), tone: 'green' };
    } else {
      state.pest.lowNDays = 0;
      state.pest.wetDays = 0;
      message = tl('sim.123');
      reward = { text: tl('ui.214'), tone: 'green' };
    }
  }
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  addLog(state, state.care.date, message, { kind: action, title, reward });
  const rescue = checkRescue(state);
  if (rescue) message = `${message} ${rescue}`;
  const animals = refreshUnlocks(state, { date: state.care.date });
  if (animals.length) message = tl('sim.124', { message, p1: animals.map((id) => ANIMALS.find((a) => a.id === id)?.name ?? id).join(tl('ui.206')) });
  return { ok: true, message };
}

/** While 瀕死: bringing W and N back into their optimal bands saves the tree right away. */
export function checkRescue(state: GameState): string | null {
  if (!state.dying || state.over) return null;
  if (!inBand(state.moisture, W_OPTIMAL) || state.nutrients < N_OPTIMAL[0]) return null;
  state.dying = null;
  state.health = RESCUE_HEALTH;
  addLog(state, state.care.date, tl('sim.125', { RESCUE_HEALTH }), { kind: 'grow', title: tl('sim.079'), reward: { text: tl('sim.126', { RESCUE_HEALTH }), tone: 'green' } });
  return tl('sim.127');
}

export function reinforce(state: GameState, prep: PrepId): ActionResult {
  if (state.over) return { ok: false, message: tl('sim.109') };
  if (!state.windUnlocked) return { ok: false, message: tl('sim.128', { p0: STAGE_NAMES[WIND_UNLOCK_STAGE] }) };
  if (state.care.preps[prep]) return { ok: false, message: tl('sim.129', { p0: PREPS[prep].label }) };
  if (state.resist >= R_MAX) return { ok: false, message: tl('sim.130') };
  state.care.preps[prep] = true;
  const before = state.resist;
  const double = doubleRActive(state);
  state.resist = Math.min(R_MAX, state.resist + prepAmount(state, prep));
  const gain = Math.round(state.resist - before);
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  addLog(state, state.care.date, tl('sim.132', { p0: PREPS[prep].label, p1: double ? tl('sim.131') : '', p2: Math.round(before), p3: Math.round(state.resist) }), { kind: 'reinforce', title: tl('ui.171'), reward: { text: tl('sim.133', { gain }), tone: 'orange' } });
  return { ok: true, message: tl('sim.135', { p0: PREPS[prep].label, p1: double ? tl('sim.134') : '', gain, p3: Math.round(state.resist) }) };
}

/* ---------- v13 應急行動 ---------- */

export type EmergencyAction = 'heatWater' | 'rainDrain' | 'warmCover';

/** Which 應急行動 today's warnings allow (酷熱 → 酷熱澆水；寒冷 → 保暖；暴雨／黑雨 → 暴雨疏水). */
export function emergencyOptions(events: readonly WeatherEventId[]): { heatWater: boolean; rainDrain: boolean; warmCover: boolean } {
  return { heatWater: Boolean(topInCategory(events, 'heat')), rainDrain: Boolean(topInCategory(events, 'rain')), warmCover: Boolean(topInCategory(events, 'cold')) };
}

/**
 * 酷熱澆水: once a day on top of the 3 waterings, +5 water up to 100 (at ≥ 100 still counts, adds nothing).
 * 暴雨疏水: once a day on top of the 3 drains, −10 water but never below 50 (at ≤ 50 still counts, removes nothing).
 * Doing it that day cancels the category's damage and earns 應急獎勵 at settlement.
 */
export function performEmergency(state: GameState, action: EmergencyAction, events: readonly WeatherEventId[]): ActionResult {
  if (state.over) return { ok: false, message: tl('sim.109') };
  const opts = emergencyOptions(events);
  const name = emergencyName(action);
  if (!opts[action])
    return {
      ok: false,
      message: action === 'heatWater' ? tl('sim.136') : action === 'warmCover' ? tl('sim.137') : regionalize(tl('sim.138')),
    };
  if (state.care[action]) return { ok: false, message: tl('sim.139', { name }) };
  state.care[action] = true;
  const before = state.moisture;
  let message: string;
  if (action === 'heatWater') {
    state.moisture = before < W_SATURATED ? Math.min(W_SATURATED, r1(before + EMERGENCY.heatWater.amount)) : before;
    const got = r1(state.moisture - before);
    message = got > 0 ? tl('sim.140', { got, p1: Math.round(state.moisture) }) : tl('sim.141');
  } else if (action === 'warmCover') {
    message = tl('sim.142');
  } else {
    const floor = EMERGENCY.rainDrain.floor;
    state.moisture = before > floor ? Math.max(floor, r1(before + EMERGENCY.rainDrain.amount)) : before;
    const got = r1(state.moisture - before);
    message = regionalize(got < 0 ? tl('sim.143', { got, p1: Math.round(state.moisture) }) : tl('sim.144', { floor }));
  }
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  const delta = r1(state.moisture - before);
  addLog(state, state.care.date, message, { kind: 'emergency', title: name, reward: { text: delta ? tl('sim.023', { p0: sgn(delta) }) : tl('ui.221'), tone: action === 'warmCover' ? 'purple' : 'blue' } });
  const rescue = checkRescue(state);
  if (rescue) message = `${message} ${rescue}`;
  return { ok: true, message };
}

/** Trees show stakes / ropes / pruning as R rises. v13: nothing before 青年樹 (加固 is locked; R 60 is only a starting value). */
export function visualReinforcement(resist: number, unlocked = true): Reinforcement {
  if (!unlocked) return { stakes: false, ropes: false, prune: false };
  return { stakes: resist >= 15, ropes: resist >= 35, prune: resist >= 60 };
}

const RAIN_EVENTS: WeatherEventId[] = ['drizzle', 'rainstorm', 'blackrain'];

/** Check 圖鑑 unlocks: height, health, storms, real month, today's (or last night's) weather and tree age. */
export function refreshUnlocks(state: GameState, opts: { date: string; events?: WeatherEventId[] }): string[] {
  const got: string[] = [];
  const meters = state.heightCm / 100;
  const evs = new Set<WeatherEventId>([...(opts.events ?? []), ...(state.dayEvents[opts.date]?.events ?? [])]);
  if (state.lastSettlement && state.lastSettlement.date === addDays(opts.date, -1)) state.lastSettlement.events.forEach((e) => evs.add(e));
  const hot = evs.has('hot');
  const rain = RAIN_EVENTS.some((e) => evs.has(e));
  const month = Number(opts.date.slice(5, 7));
  for (const animal of ANIMALS) {
    if (state.animals.includes(animal.id)) continue;
    if (meters < animal.minM || state.health < animal.minHealth) continue;
    if (animal.needStorms && state.stormSurvivals < animal.needStorms) continue;
    if (animal.weather === 'hot' && !hot) continue;
    if (animal.weather === 'rain' && !rain) continue;
    if (animal.weather === 'storm' && state.stormSurvivals < 1) continue;
    if (animal.months && !animal.months.includes(month)) continue;
    if (animal.minAgeDays && (state.ageDays || 0) < animal.minAgeDays) continue;
    state.animals.push(animal.id);
    got.push(animal.id);
    addLog(state, opts.date, tl('sim.145', { name: animal.name, about: animal.about }), { kind: 'animal', title: tl('ui.172'), reward: { text: tl('sim.146'), tone: 'purple' } });
  }
  return got;
}

export function triggerPest(state: GameState, date: string): void {
  state.pest.active = true;
  state.pest.since = date;
  const dmg = pestDamageWith(state.residents.length);
  addLog(state, date, tl('sim.147', { dmg }), { kind: 'pest', title: tl('ui.068'), reward: { text: tl('sim.068', { dmg }), tone: 'red' } });
}

/* ---------- Day changes ---------- */

export interface CatchupReport {
  daysPassed: number;
  growthCm: number;
  healthBefore: number;
  healthAfter: number;
  messages: string[];
  eventText: string | null;
  animals: string[];
  settlements: Settlement[];
  over: boolean;
  /** v14 milestones reached during these nights. */
  milestones: MilestoneAward[];
}

/** Settle every day between the last visit and today. Stops if the game ends. */
export function catchUp(
  state: GameState,
  today: string,
  eventsFor: (date: string) => WeatherEventId[],
  meta: MetaState | null,
  nowMs: number,
  msIntoToday = 0,
): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const messages: string[] = [];
  const settlements: Settlement[] = [];
  const milestones: MilestoneAward[] = [];
  let gap = daysBetween(state.lastSeenDate, today);
  if (gap < 0) {
    state.lastSeenDate = today;
    state.care = freshCare(today);
    gap = 0;
  }
  if (gap > 0 && !state.over) {
    for (let i = 0; i < gap; i++) {
      const date = addDays(state.lastSeenDate, i);
      // v16: each night settles at its own time (end of that day), so 瀕死 can run out within one catch-up.
      const res = settleDay(state, date, eventsFor(date), meta, dayEndMs(date, today, nowMs, msIntoToday));
      settlements.push(res.settlement);
      milestones.push(...res.milestones);
      messages.push(...res.messages);
      if (state.over) break;
    }
    state.lastSeenDate = today;
    state.care = freshCare(today);
  }
  startDoubleR(state);
  const growthCm = state.heightCm - heightBefore;
  let eventText: string | null = null;
  let animals: string[] = [];
  if (!state.over) {
    eventText = ensureToday(state, today);
    animals = refreshUnlocks(state, { date: today, events: [...(settlements.at(-1)?.events ?? []), ...eventsFor(today)] });
    if (gap === 1) state.morningNote = nightNote(settlements[0]);
    else if (gap > 1) state.morningNote = tl('sim.148', { gap, p1: Math.round(healthBefore), p2: Math.round(state.health), p3: growthCm >= 0 ? '+' : '', p4: growthCm.toFixed(1) });
    if (messages.length && gap > 0) state.morningNote = `${state.morningNote ?? ''} ${messages.join(' ')}`.trim();
  }
  return { daysPassed: Math.max(0, gap), growthCm, healthBefore, healthAfter: state.health, messages, eventText, animals, settlements, over: Boolean(state.over), milestones };
}

function nightNote(s: Settlement | undefined): string {
  if (!s) return '';
  return tl('sim.summaryPrefix') + tl('sim.150', { p0: s.day ? dailySummaryText(s).slice(tl('sim.todayPrefix').length) : tl('sim.149', { p0: Math.round(s.hBefore), p1: Math.round(s.hAfter) }), p1: eventLabel(s.event), p2: s.deltaG >= 0 ? '+' : '', deltaG: s.deltaG });
}

/** Developer: settle today now and move to tomorrow. */
export function advanceVirtualDay(state: GameState, today: string, events: WeatherEventId[], meta: MetaState | null, nowMs: number): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const res = settleDay(state, today, events, meta, nowMs);
  const next = addDays(today, 1);
  state.virtualToday = next;
  state.lastSeenDate = next;
  state.care = freshCare(next);
  startDoubleR(state);
  let eventText: string | null = null;
  let animals: string[] = [];
  if (!state.over) {
    eventText = ensureToday(state, next);
    animals = refreshUnlocks(state, { date: next, events: res.settlement.events });
    state.morningNote = `${nightNote(res.settlement)} ${res.messages.join(' ')}`.trim();
  }
  return {
    daysPassed: 1,
    growthCm: state.heightCm - heightBefore,
    healthBefore,
    healthAfter: state.health,
    messages: res.messages,
    eventText,
    animals,
    settlements: [res.settlement],
    over: Boolean(state.over),
    milestones: res.milestones,
  };
}

/* ---------- Helpers for the UI ---------- */

/** One line of advice, consistent with the 今晚預計 preview (same NightPlan). */
export function advice(state: GameState, plan: NightPlan, countdown: { event: WeatherEventId; hours: number } | null): string {
  if (state.dying) return tl('sim.151', { p0: W_OPTIMAL[0], p1: W_OPTIMAL[1], p2: N_OPTIMAL[0] });
  if (plan.collapse) {
    const c = plan.collapse;
    const label = eventLabel(c.event);
    if (c.fatal && !c.revive) return tl('sim.152', { p0: Math.round(c.r), label, threshold: c.threshold });
    return tl('sim.153', { p0: Math.round(c.r), label, threshold: c.threshold });
  }
  if (state.pest.active) return tl('sim.154', { p0: pestDamageWith(state.residents.length) });
  if (plan.waterDeath) return tl('sim.155', { W_MAX });
  if (plan.heat && !plan.heat.handled) return tl('sim.156', { p0: eventLabel('hot'), base: plan.heat.base });
  if (plan.cold && !plan.cold.handled) return tl('sim.157', { base: plan.cold.base });
  if (plan.rain && !plan.rain.handled) return tl('sim.158', { p0: eventLabel(plan.rain.event), p1: emergencyName('rainDrain'), base: plan.rain.base });
  if (countdown && WEATHER_EVENTS[countdown.event].category === 'wind') {
    const def = { ...WEATHER_EVENTS[countdown.event], label: eventLabel(countdown.event) };
    if (!state.windUnlocked) return tl('sim.159', { label: def.label, p1: STAGE_NAMES[WIND_UNLOCK_STAGE] });
    if (state.resist < (def.collapseBelow ?? 0)) return tl('sim.160', { label: def.label, p1: Math.round(state.resist), collapseBelow: def.collapseBelow });
    if (state.resist < 60) return tl('sim.161', { label: def.label, p1: Math.round(state.resist) });
  }
  if (countdown && countdown.hours > 0 && (countdown.event === 'rainstorm' || countdown.event === 'blackrain')) {
    const hit = rainAdd(state.moisture, WEATHER_EVENTS[countdown.event].dW, RAIN_OVER_CAP.heavy);
    if (hit > W_SATURATED) return tl('sim.162', { p0: eventLabel(countdown.event), p1: Math.round(hit), W_SATURATED });
  }
  if (plan.wAfter > W_SATURATED) return tl('sim.163', { p0: Math.round(plan.wAfter), wLabel: plan.wLabel, p2: sgn(plan.wScore), W_SATURATED });
  if (plan.wAfter < W_OPTIMAL[0]) return tl('sim.164', { p0: Math.round(plan.wAfter), p1: sgn(plan.wScore), W_SATURATED });
  if (plan.nAfter < N_OPTIMAL[0]) return tl('sim.165', { p0: Math.round(plan.nAfter), p1: N_OPTIMAL[0] });
  if (state.windUnlocked && state.resist < 40) return tl('sim.166', { p0: eventLabel('typhoon8') });
  return tl('sim.167', { p0: Math.round(plan.wAfter) });
}

export function dayNumber(state: GameState, today: string): number {
  return Math.max(1, daysBetween(state.createdOn, today) + 1);
}

export function eventTitle(state: GameState): { title: string; text: string } {
  const event = eventById(state.dailyEventId);
  return { title: event.title, text: event.text };
}
