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
  PEST_DAMAGE,
  PEST_TRIGGER_DAYS,
  PEST_TRIGGER_DAYS_GUARDED,
  PREPS,
  R_DAILY_DECAY,
  R_MAX,
  RESCUE_HEALTH,
  RESIDENT_LEAVE_H,
  RESIDENT_MIN_H,
  RESIDENT_N_EACH,
  RESIDENT_N_MAX,
  RESIDENT_STREAK,
  REVIVE_HEALTH,
  START,
  STORM_SURVIVE_GROWTH,
  STORM_SURVIVE_SHARE,
  RAIN_OVER_CAP,
  T1_WATER_LOSS_MULT,
  T2_RAIN_TO_N_CHANCE,
  W_MAX,
  W_OPTIMAL,
  W_SATURATED,
  N_DAILY_USE,
  WEATHER_EVENTS,
  AGE_MILESTONES,
  GROWTH_FLOOR_SHARE,
  MILESTONE_TIER_LABEL,
  RECORD_MILESTONE,
  type PrepId,
  type WeatherEventId,
} from './balance';
import { ANIMALS, eventById, eventForDate, stageFor, stagesFor } from './content';
import { defaultSpecies, speciesDef, speciesTargetCm, STAGE_NAMES, type SpeciesId } from './data/species';
import { addDays, daysBetween } from './dates';
import { dayEvents, mildEvent } from './events';
import { emergencyName, eventLabel, regionalize } from './labels';
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
  nFactor,
  nightWater,
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
import type { Care, ForecastDay, GameState, LogKind, LogReward, MetaState, MilestoneAward, Reinforcement, Settlement } from './types';
import { formatHeight } from './util';

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

export function addLog(state: GameState, date: string, text: string, meta: LogMeta = {}): void {
  state.log.unshift({ date, text, time: meta.time ?? logClock(), kind: meta.kind, title: meta.title, reward: meta.reward });
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
    treeName: opts.name ?? '世界之樹',
    species: opts.species ? speciesDef(opts.species).id : defaultSpecies(),
    ageDays: 0,
    milestones: {},
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
  };
  state.targetCm = speciesTargetCm(state.species);
  addLog(state, today, legacyBonus ? `一棵幼苗喺上一棵樹留低嘅養分地標旁邊種低，一開始就有 +${legacyBonus} 養分。` : '一棵幼苗種低咗，由今日開始慢慢陪佢大。', {
    kind: 'plant',
    title: '種低幼苗',
    reward: { text: legacyBonus ? `+${legacyBonus} 養分` : '新開始', tone: 'green' },
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
  if (event.id !== 'quiet') addLog(state, today, event.text, { kind: 'event', title: `今日小事：${event.title}`, reward: event.chip });
  state.health = clamp100(state.health);
  state.moisture = clampW(state.moisture);
  state.nutrients = clamp100(state.nutrients);
  return `${event.title}：${event.text}`;
}

/* ---------- Weather records ---------- */

/** Remember what weather was seen on a date (HKO warnings seen at any time that day count). */
export function recordEvents(state: GameState, date: string, events: readonly WeatherEventId[], hko: boolean): void {
  const rec = (state.dayEvents[date] ??= { events: [], hko: false });
  for (const e of events) if (e !== 'clear' && !rec.events.includes(e)) rec.events.push(e);
  rec.hko ||= hko;
  const keys = Object.keys(state.dayEvents).sort();
  while (keys.length > 21) delete state.dayEvents[keys.shift()!];
}

/** Events a date is settled with: what was seen that day, plus the day's forecast (HKO days: only drizzle/fine from the forecast). */
export function eventsForDate(state: GameState, date: string, day: ForecastDay | undefined): WeatherEventId[] {
  const rec = state.dayEvents[date];
  const base = rec?.hko ? [mildEvent(day)] : day ? dayEvents(day) : ['clear' as const];
  return [...new Set([...base, ...(rec?.events ?? [])])];
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

export type WarningWaterEvent = 'hot' | 'rainstorm' | 'blackrain';

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

const WARNING_NAME: Record<WarningWaterEvent, string> = { hot: '酷熱天氣警告', rainstorm: '暴雨警告', blackrain: '黑雨警告' };

/** Enter 24-hour 瀕死 (H goes to 0). Returns false when already dying. */
function enterDying(state: GameState, date: string, nowMs: number, why: string, time?: string): boolean {
  state.health = 0;
  if (state.dying) return false;
  state.dying = { since: date, at: nowMs };
  addLog(state, date, `${why}，棵樹進入 24 小時瀕死狀態。將水分調返 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就救得返。`, {
    kind: 'dying',
    title: '瀕死',
    reward: { text: '24 小時', tone: 'red' },
    time,
  });
  return true;
}

/**
 * v12: 酷熱 −20／暴雨、黑雨 +20 hit 水分 the moment the warning is first seen, once per calendar day each
 * (暴雨 and 黑雨 share one application; a cancelled and reissued warning is not applied again). Rain fills up to 100,
 * then at most +10 beyond. Settlement calls this too, so a warning seen while the app was closed still counts.
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
  const perks = perksFrom(meta);
  const hot = events.includes('hot');
  const rain: WarningWaterEvent | null = events.includes('blackrain') ? 'blackrain' : events.includes('rainstorm') ? 'rainstorm' : null;
  const fx = state.waterFx[date] ?? { hot: false, rain: false };
  if ((!hot || fx.hot) && (!rain || fx.rain)) return [];
  state.waterFx = { ...state.waterFx, [date]: { ...fx } };
  const mark = state.waterFx[date]!;
  const hits: WarningHit[] = [];
  const push = (event: WarningWaterEvent, before: number, toN: number) => {
    const after = state.moisture;
    const delta = r1(after - before);
    const hint = after > W_SATURATED ? '記得疏水' : after < W_OPTIMAL[0] ? '記得澆水' : '水分仲喺適中範圍';
    const message = `${regionalize(WARNING_NAME[event])}！水分 ${sgn(delta)}，而家 ${Math.round(after)}，${hint}${toN ? `（二級徽章：${toN} 水分轉咗做養分）` : ''}`;
    addLog(state, date, message, { kind: 'event', title: regionalize(WARNING_NAME[event]), reward: { text: `${sgn(delta)} 水分`, tone: delta < 0 ? 'orange' : 'blue' }, time });
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
  const keys = Object.keys(state.waterFx).sort();
  while (keys.length > 21) delete state.waterFx[keys.shift()!];
  if (waterDeath(state.moisture) && hits.length) {
    const last = hits[hits.length - 1]!;
    last.dying = enterDying(state, date, nowMs, `水分去到 ${W_MAX}，根部浸死`, time) || Boolean(state.dying);
    last.message = `${last.message}。水分到 ${W_MAX}，棵樹瀕死！即刻疏水同施肥救返佢。`;
  }
  return hits;
}

/** W ≥ 150 at any moment (e.g. the developer slider) → 瀕死 right away. */
export function checkWaterDeath(state: GameState, date: string, nowMs: number): boolean {
  if (state.over || !waterDeath(state.moisture)) return false;
  return enterDying(state, date, nowMs, `水分去到 ${W_MAX}，根部浸死`);
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
  water: NightWater;
  wAfter: number;
  wScore: number;
  wLabel: string;
  wTone: 'dry' | 'ok' | 'rot1' | 'rot2' | 'rot3';
  nBefore: number;
  nAfter: number;
  nScore: number;
  residentN: number;
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
 * The night in order (設計書 v13): first the water change (natural loss −10 or 毛毛雨), then
 * H_new = H_old + W_score + N_score + 天氣分(熱) + 天氣分(雨) + 天氣分(風) + 應急獎勵 − 蟲害.
 * 熱／寒／雨: flat −10／−10／−10 (黑雨 −15) unless 酷熱澆水／保暖／暴雨疏水 was done that day (then 0 and +3 each;
 * n ≥ 2 actions = 3n × 0.75).
 * 風 (after 青年樹 only): base × (1 − R/100); R below the event's threshold = 倒塌.
 * `date` is the day being settled: that day's care flags count (null = trust state.care).
 */
export function planNight(state: GameState, events: readonly WeatherEventId[], perks: Perks, date: string | null = null): NightPlan {
  const event = pickEvent(events);
  const care = careOn(state, date);
  const water = nightWater(state.moisture, events, perks.waterSaver);
  const residentN = Math.min(RESIDENT_N_MAX, state.residents.length * RESIDENT_N_EACH);
  const nAfter = clamp100(state.nutrients - N_DAILY_USE + residentN);
  const tier = wTier(water.wAfter);
  const nScore = nFactor(nAfter);
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
  if (!locked) rAfter = Math.max(0, Math.min(R_MAX, state.resist - R_DAILY_DECAY + (windId ? WEATHER_EVENTS[windId].dR : 0)));
  if (windId) {
    const def = WEATHER_EVENTS[windId];
    const threshold = def.collapseBelow ?? 0;
    const dmg = locked ? 0 : finalDamage(def.damage, state.resist);
    wind = { event: windId, base: def.damage, locked, r: state.resist, score: dmg ? -dmg : 0, threshold };
    if (!locked && state.resist < threshold) {
      const count = (state.collapses || 0) + 1;
      const fatal = count > COLLAPSE_MAX;
      collapse = { event: windId, threshold, r: state.resist, count, fatal, revive: fatal && Boolean(perks.revive) };
    }
  }
  const bonus = emergencyBonus(emergencyCount);
  const weather = (heat?.score ?? 0) + (cold?.score ?? 0) + (rain?.score ?? 0) + (wind?.score ?? 0);
  const baseDamage = (heat?.base ?? 0) + (cold?.base ?? 0) + (rain?.base ?? 0) + (wind && !wind.locked ? wind.base : 0);
  const pest = state.pest.active ? PEST_DAMAGE : 0;
  const death = waterDeath(water.wAfter);
  const hAfter = death ? 0 : r1(Math.max(0, Math.min(100, state.health + tier.score + nScore + weather + bonus - pest)));
  const growth = planGrowth(state, event, wind, hAfter, collapse);
  return {
    event,
    hBefore: state.health,
    wBefore: state.moisture,
    water,
    wAfter: water.wAfter,
    wScore: tier.score,
    wLabel: tier.label,
    wTone: tier.tone,
    nBefore: state.nutrients,
    nAfter,
    nScore,
    residentN,
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
  const copy: GameState = { ...state, log: [], waterFx: { ...state.waterFx }, pest: { ...state.pest } };
  applyWarningWater(copy, date, events, meta, 0, '');
  return planNight(copy, events, perksFrom(meta), date);
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
    notes.push(`${regionalize(WARNING_NAME[h.event])}：水分 ${sgn(h.delta)}`);
    if (h.toN) notes.push(`二級徽章：${h.toN} 水分轉咗做養分`);
  }
  const plan = planNight(state, events, perks, date);
  const eventId = plan.event;
  const hBefore = state.health;
  const wBefore = state.moisture;
  const nBefore = state.nutrients;
  const rBefore = state.resist;
  const hits = [plan.heat, plan.cold, plan.rain, plan.wind].filter((x) => x);
  const cats = hits.length;
  const severeSeen = [...new Set(events)].filter((e) => WEATHER_EVENTS[e].category);
  if (severeSeen.length > cats) notes.push(`同一類天氣只計最嚴重嗰個（${hits.map((x) => eventLabel(x!.event)).join('、')}）`);
  if (cats > 1) notes.push('熱、寒、雨、風唔同類，各自計埋');
  if (plan.water.kind === 'loss' && perks.waterSaver) notes.push('一級徽章：水分流失減少 10%');
  if (plan.water.kind === 'rain') notes.push('落雨日：今晚水分冇流失');
  if (plan.water.kind === 'drizzle') notes.push(`毛毛雨：水分 ${sgn(plan.water.delta)}，冇流失`);
  if (plan.residentN) notes.push(`長駐動物施肥 +${plan.residentN} 養分`);
  if (plan.heat) notes.push(plan.heat.handled ? '酷熱：做咗酷熱澆水，唔扣健康' : `酷熱：冇做酷熱澆水 −${plan.heat.base}`);
  if (plan.cold) notes.push(plan.cold.handled ? '寒冷：做咗保暖，唔扣健康' : `寒冷：冇做保暖 −${plan.cold.base}`);
  if (plan.rain) notes.push(plan.rain.handled ? `${eventLabel(plan.rain.event)}：做咗${emergencyName('rainDrain')}，唔扣健康` : `${eventLabel(plan.rain.event)}：冇做${emergencyName('rainDrain')} −${plan.rain.base}`);
  if (plan.emergencyBonus) notes.push(`應急獎勵 ${emergencyBonusText(plan.emergencyCount)}`);
  if (plan.wind?.locked) notes.push(`${eventLabel(plan.wind.event)}：青年樹前唔受風災影響`);

  state.moisture = plan.wAfter;
  state.nutrients = plan.nAfter;
  // Wind damage uses the shield as it stood, then the event consumes it (frozen before 青年樹).
  const dmg = plan.damage;
  state.resist = plan.rAfter;
  const pestDamage = plan.pest;
  if (pestDamage) notes.push('蟲害 −15');
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
    addLog(state, date, `${label}冇做${fix}，健康度 −${hit.base}。下次警告一出記得做${fix}。`, { kind: 'storm-hit', title: `${label}打中棵樹`, reward: { text: `-${hit.base} 健康度`, tone: 'red' }, time: '' });
    messages.push(`${label}令健康度 −${hit.base}。下次警告一出，記得做「${fix}」。`);
  }
  if (plan.emergencyBonus) {
    addLog(state, date, plan.emergencyCount > 1 ? `${plan.emergencyCount} 樣應急行動都做咗，應急獎勵 ${emergencyBonusText(plan.emergencyCount)}。` : `應急行動做得啱時，應急獎勵 +${plan.emergencyBonus}。`, { kind: 'emergency', title: '應急獎勵', reward: { text: `+${plan.emergencyBonus} 健康度`, tone: 'green' }, time: '' });
  }
  if (w && !w.locked) {
    const label = eventLabel(w.event);
    if (survived) {
      state.stormSurvivals += 1;
      if (state.scars > 0) state.scars -= 1;
      addLog(state, date, `${label}過咗。抗風力 ${Math.round(rBefore)} 擋咗大部分傷害（${w.base} → ${windDmg}），今晚仲長得特別壯。`, {
        kind: 'storm-safe',
        title: `捱過${label}`,
        reward: { text: `生長 ×${STORM_SURVIVE_GROWTH}`, tone: 'green' },
        time: '',
      });
      messages.push(`${label}過咗，你預先加固，只受 ${windDmg} 點傷害，仲長得更壯。`);
    } else if (windDmg >= 10) {
      state.scars = Math.min(4, state.scars + 1);
      addLog(state, date, `${label}令健康度 −${windDmg}（基礎 ${w.base}，抗風力 ${Math.round(rBefore)} 減免咗 ${r1(w.base - windDmg)}）。`, {
        kind: 'storm-hit',
        title: `${label}打中棵樹`,
        reward: { text: `-${windDmg} 健康度`, tone: 'red' },
        time: '',
      });
      messages.push(`${label}令健康度 −${windDmg}。下次預警一出，先加固推高抗風力。`);
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
      addLog(state, date, `${label}吹到主幹完全斷裂（抗風力 ${Math.round(c.r)} 低過門檻 ${c.threshold}），第 ${c.count} 次倒塌，棵樹捱唔住。`, { kind: 'collapse', title: '倒塌・枯死', reward: { text: `倒塌 ${c.count} 次`, tone: 'red' }, time: '' });
      messages.push(`${label}令棵樹第 ${c.count} 次倒塌，主幹斷晒，救唔返喇。`);
    } else {
      if (c.fatal && meta) {
        meta.reviveTokens -= 1;
        collapseRevived = true;
        state.health = Math.max(state.health, REVIVE_HEALTH);
        addLog(state, date, `第 ${c.count} 次倒塌本來會令棵樹死，免死金牌擋咗一劫（健康度 ${Math.round(state.health)}）。倒塌次數唔會重設，下次再倒就冇得救。`, { kind: 'badge', title: '免死金牌', reward: { text: '擋咗一劫', tone: 'purple' }, time: '' });
        messages.push('免死金牌擋咗今次致命倒塌！倒塌次數唔會重設，下次再倒就會死。');
      }
      state.heightCm = Math.max(5, r1(state.heightCm * (1 - COLLAPSE_HEIGHT_LOSS)));
      state.doubleRPending = true;
      addLog(state, date, `${label}吹斷咗部分主幹（抗風力 ${Math.round(c.r)} 低過門檻 ${c.threshold}），高度 ${formatHeight(hBeforeCollapse)} → ${formatHeight(state.heightCm)}。倒塌 ${Math.min(c.count, COLLAPSE_MAX)}/${COLLAPSE_MAX}${c.count >= COLLAPSE_MAX ? '，再倒就會死' : ''}。聽日加固效果雙倍。`, {
        kind: 'collapse',
        title: '棵樹倒塌',
        reward: { text: `−${Math.round(COLLAPSE_HEIGHT_LOSS * 100)}% 高度`, tone: 'red' },
        time: '',
      });
      messages.push(`${label}令棵樹倒塌，斷咗部分主幹（高度 −20%，倒塌 ${Math.min(c.count, COLLAPSE_MAX)}/${COLLAPSE_MAX}）。聽日加固效果雙倍，快啲補返抗風力。`);
    }
    collapseInfo = { event: c.event, threshold: c.threshold, count: c.count, heightBefore: hBeforeCollapse, heightAfter: state.heightCm, fatal: c.fatal, revived: collapseRevived };
  }
  // 蟲害 triggers for the coming days.
  state.pest.lowNDays = state.nutrients < 30 ? state.pest.lowNDays + 1 : 0;
  state.pest.wetDays = state.moisture > W_SATURATED ? state.pest.wetDays + 1 : 0;
  const need = state.residents.length >= 2 ? PEST_TRIGGER_DAYS_GUARDED : PEST_TRIGGER_DAYS;
  if (!state.pest.active && (state.pest.lowNDays >= need || state.pest.wetDays >= need)) {
    state.pest.active = true;
    state.pest.since = date;
    const why = state.pest.lowNDays >= need ? `連續 ${need} 日營養不良` : `連續 ${need} 晚水分超過 ${W_SATURATED}（爛根）`;
    addLog(state, date, `${why}，葉底生咗蟲。每日會扣 15 健康度，要用除蟲處理。`, { kind: 'pest', title: '蟲害', reward: { text: '-15/日', tone: 'red' }, time: '' });
    messages.push(`${why}，生咗蟲！記得除蟲。`);
  }

  // Resident animals (long-term H ≥ 90).
  if (state.health >= RESIDENT_MIN_H) {
    state.highStreak += 1;
    if (state.highStreak >= RESIDENT_STREAK) {
      const pick = state.animals.find((id) => !state.residents.includes(id));
      if (pick) {
        state.residents.push(pick);
        state.highStreak = 0;
        const name = ANIMALS.find((a) => a.id === pick)?.name ?? pick;
        addLog(state, date, `${name}鍾意呢棵咁健康嘅樹，決定長駐。每晚會幫手施少少肥${state.residents.length >= 2 ? '，仲會幫手防蟲' : ''}。`, {
          kind: 'animal',
          title: '動物長駐',
          reward: { text: '長駐', tone: 'purple' },
          time: '',
        });
      }
    }
  } else {
    state.highStreak = 0;
    if (state.health < RESIDENT_LEAVE_H && state.residents.length) {
      const gone = state.residents.pop()!;
      const name = ANIMALS.find((a) => a.id === gone)?.name ?? gone;
      addLog(state, date, `樹唔夠精神，${name}搬走咗。健康度長期保持 90 以上，佢會返嚟。`, { kind: 'animal', title: '動物離開', time: '' });
    }
  }

  // 瀕死 and death.
  let died = false;
  let revived = collapseRevived;
  const wasDying = state.dying;
  if (collapseDied) {
    died = true;
    state.health = 0;
    state.dying = null;
    const days = daysBetween(state.createdOn, date) + 1;
    state.over = { kind: 'dead', date, tiers: [], days };
    addLog(state, date, `${state.treeName}枯死咗，會化作小島上嘅養分地標，下一棵樹一開始就有 +${LANDMARK_N_BONUS} 養分。`, { kind: 'dying', title: '枯死', time: '' });
  } else if (state.health <= 0) {
    state.health = 0;
    if (!wasDying) {
      enterDying(state, date, nowMs, plan.waterDeath ? `水分去到 ${W_MAX}，根部浸死` : '健康度跌到 0', '');
      messages.push(`棵樹瀕死！24 小時內將水分調返 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就救得返。`);
    } else if (nowMs - wasDying.at >= DYING_HOURS * 3600 * 1000) {
      if (meta && meta.reviveTokens > 0) {
        meta.reviveTokens -= 1;
        state.health = REVIVE_HEALTH;
        state.dying = null;
        revived = true;
        addLog(state, date, `免死金牌生效，棵樹重新有咗生氣（健康度 ${REVIVE_HEALTH}）。`, { kind: 'badge', title: '免死金牌', reward: { text: `健康 ${REVIVE_HEALTH}`, tone: 'purple' }, time: '' });
        messages.push('免死金牌救返棵樹！');
      } else {
        died = true;
        const days = daysBetween(state.createdOn, date) + 1;
        // v14: perk badges come with the age milestones (booked while alive), not at death.
        state.over = { kind: 'dead', date, tiers: [], days };
        addLog(state, date, `${state.treeName}枯死咗，會化作小島上嘅養分地標，下一棵樹一開始就有 +${LANDMARK_N_BONUS} 養分。`, { kind: 'dying', title: '枯死', time: '' });
      }
    }
  } else if (wasDying) {
    state.dying = null;
    addLog(state, date, '棵樹捱過瀕死，慢慢回復生氣。', { kind: 'grow', title: '救返', reward: { text: `健康 ${Math.round(state.health)}`, tone: 'green' }, time: '' });
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
    wNight: { kind: plan.water.kind, delta: plan.water.delta },
    nFactor: nf,
    baseDamage: plan.baseDamage,
    finalDamage: dmg,
    pestDamage,
    hMult: mult,
    weatherBonus: bonus,
    baseGrowth: base,
    deltaG: r1(state.heightCm - beforeCm),
    heightAfter: state.heightCm,
    carbonKg: carbonKg(state.heightCm),
    notes,
    heat: plan.heat,
    cold: plan.cold,
    rain: plan.rain,
    wind: plan.wind ? { event: plan.wind.event, base: plan.wind.base, locked: plan.wind.locked, score: plan.wind.score, r: plan.wind.r } : null,
    emergencyBonus: plan.emergencyBonus,
    emergencyCount: plan.emergencyCount,
    collapse: collapseInfo,
  };
  state.lastSettlement = settlement;
  const tier = hMultTier(state.health);
  addLog(
    state,
    date,
    `${eventLabel(eventId)}。水分 ${Math.round(state.moisture)}（${plan.wLabel}）${sgn(wf)}，養分 ${sgn(nf)}，天氣分 ${sgn(-dmg)}${plan.emergencyBonus ? `，應急獎勵 +${plan.emergencyBonus}` : ''}${pestDamage ? `，蟲害 −${pestDamage}` : ''}。健康 ${Math.round(hBefore)}→${Math.round(state.health)}，${tier.label} ×${mult}。`,
    { kind: 'settle', title: '夜間結算', reward: { text: `${dG >= 0 ? '+' : ''}${settlement.deltaG} 厘米`, tone: dG >= 0 ? 'blue' : 'red' }, time: '' },
  );
  if (!collapseInfo) noteStage(state, beforeCm, date);
  checkWindUnlock(state, date);

  // v14 樹齡 and milestones (a tree that died tonight gets none).
  state.ageDays = (state.ageDays || 0) + 1;
  const milestones = state.over ? [] : checkMilestones(state, date);
  return { settlement, messages, died, revived, milestones };
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
    addLog(state, date, `${state.treeName}樹齡${m.label}！高 ${formatHeight(state.heightCm)}，係紀錄高度嘅 ${Math.round(share * 100)}%，攞到${MILESTONE_TIER_LABEL[tier]}章。${opts.retro ? '（v14 補發）' : ''}`, {
      kind: 'badge',
      title: `樹齡${m.label}`,
      reward: { text: `${MILESTONE_TIER_LABEL[tier]}章`, tone: 'purple' },
      time,
    });
  }
  if (!state.milestones.record && state.heightCm > R) {
    const award: MilestoneAward = { id: 'record', tier: null, date, ageDays: state.ageDays || 0, heightCm: state.heightCm, share: r1(share * 1000) / 1000, ...(opts.retro ? { retro: true } : {}) };
    state.milestones.record = award;
    state.passedTargetOn ??= date;
    got.push(award);
    addLog(state, date, `${state.treeName}長到 ${formatHeight(state.heightCm)}，超越咗${speciesDef(state.species).name}嘅世界紀錄（${formatHeight(R)}）！冇上限，繼續長。`, {
      kind: 'badge',
      title: RECORD_MILESTONE.label,
      reward: { text: formatHeight(state.heightCm), tone: 'purple' },
      time,
    });
  }
  return got;
}

function noteStage(state: GameState, beforeCm: number, date: string, time = ''): string | null {
  const target = speciesTargetCm(state.species);
  const before = stageFor(beforeCm, target);
  const after = stageFor(state.heightCm, target);
  if (before.id === after.id || state.heightCm < beforeCm) return null;
  addLog(state, date, `棵樹長成${after.name}，高 ${formatHeight(state.heightCm)}。`, { kind: 'stage', title: '進入新階段', reward: { text: after.name, tone: 'blue' }, time });
  return `棵樹進入新階段：${after.name}。`;
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
  addLog(state, date, `棵樹長成${STAGE_NAMES[WIND_UNLOCK_STAGE]}：加固解鎖，抗風力開始生效（每晚 −${R_DAILY_DECAY}，風災會消耗），風災開始會傷樹，抗風力太低仲會倒塌。`, {
    kind: 'unlock',
    title: '風災同加固解鎖',
    reward: { text: '加固解鎖', tone: 'orange' },
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

export function actionLimit(state: GameState, action: CareAction): { used: number; max: number } {
  if (action === 'water') return { used: state.care.water, max: CARE.water.perDay };
  if (action === 'drain') return { used: state.care.drain, max: CARE.drain.perDay };
  if (action === 'fertilize') return { used: state.care.fertilize, max: CARE.fertilize.perDay };
  return { used: state.care.dewormed ? 1 : 0, max: 1 };
}

export function performAction(state: GameState, action: CareAction, opts: { raining: boolean }): ActionResult {
  if (state.over) return { ok: false, message: '呢局已經完結。' };
  const lim = actionLimit(state, action);
  if (lim.used >= lim.max) return { ok: false, message: '今日做夠喇，聽日再嚟。' };
  let message = '';
  let reward: LogReward;
  const title = { water: '已澆水', fertilize: '已施肥', deworm: '已除蟲', drain: '已疏水' }[action];
  if (action === 'water') {
    if (opts.raining) return { ok: false, message: '落緊雨，泥土濕㗎喇，唔使澆。' };
    // Saturated soil: watering does nothing and does not use up one of today's turns.
    if (state.moisture >= W_SATURATED) return { ok: false, message: '泥土已經飽和，唔使再澆' };
    state.care.water += 1;
    const before = state.moisture;
    state.moisture = waterAdd(before, CARE.water.amount);
    const got = r1(state.moisture - before);
    message = state.moisture >= W_SATURATED ? `泥土飽和喇，水分 ${Math.round(state.moisture)}。再多就會爛根。` : `水滲入泥度，水分 ${Math.round(state.moisture)}。`;
    reward = { text: `+${got} 水分`, tone: 'blue' };
  } else if (action === 'drain') {
    state.care.drain += 1;
    const before = state.moisture;
    state.moisture = Math.max(0, r1(before + CARE.drain.amount));
    const got = r1(state.moisture - before);
    message =
      state.moisture > W_SATURATED
        ? `疏走咗啲水，水分 ${Math.round(state.moisture)}，仲係爛根區，可以再疏。`
        : state.moisture < W_OPTIMAL[0]
          ? `疏走咗啲水，水分 ${Math.round(state.moisture)}，有啲乾喇。`
          : `開咗排水溝，泥土透返氣，水分 ${Math.round(state.moisture)}。`;
    reward = { text: `${got} 水分`, tone: 'blue' };
  } else if (action === 'fertilize') {
    state.care.fertilize += 1;
    state.nutrients = clamp100(state.nutrients + CARE.fertilize.amount);
    message = `養分滲入泥度，養分 ${Math.round(state.nutrients)}。`;
    reward = { text: `+${CARE.fertilize.amount} 養分`, tone: 'green' };
  } else {
    state.care.dewormed = true;
    if (state.pest.active) {
      state.pest = { active: false, lowNDays: 0, wetDays: 0, since: null };
      message = '用咗除蟲道具，蟲害清除咗。';
      reward = { text: '清除蟲害', tone: 'green' };
    } else {
      state.pest.lowNDays = 0;
      state.pest.wetDays = 0;
      message = '冇蟲，不過你預防咗一次，計數重新開始。';
      reward = { text: '預防', tone: 'green' };
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
  if (animals.length) message = `${message} ${animals.map((id) => ANIMALS.find((a) => a.id === id)?.name ?? id).join('、')}嚟咗。`;
  return { ok: true, message };
}

/** While 瀕死: bringing W and N back into their optimal bands saves the tree right away. */
export function checkRescue(state: GameState): string | null {
  if (!state.dying || state.over) return null;
  if (!inBand(state.moisture, W_OPTIMAL) || state.nutrients < N_OPTIMAL[0]) return null;
  state.dying = null;
  state.health = RESCUE_HEALTH;
  addLog(state, state.care.date, `水分同養分都返到最佳範圍，棵樹救返喇（健康度 ${RESCUE_HEALTH}）。`, { kind: 'grow', title: '救返', reward: { text: `健康 ${RESCUE_HEALTH}`, tone: 'green' } });
  return '棵樹救返喇！';
}

export function reinforce(state: GameState, prep: PrepId): ActionResult {
  if (state.over) return { ok: false, message: '呢局已經完結。' };
  if (!state.windUnlocked) return { ok: false, message: `加固要等棵樹長到${STAGE_NAMES[WIND_UNLOCK_STAGE]}先解鎖。之前風災唔會傷到佢。` };
  if (state.care.preps[prep]) return { ok: false, message: `今日${PREPS[prep].label}過喇。` };
  if (state.resist >= R_MAX) return { ok: false, message: '抗風力已經滿咗。' };
  state.care.preps[prep] = true;
  const before = state.resist;
  const double = doubleRActive(state);
  state.resist = Math.min(R_MAX, state.resist + prepAmount(state, prep));
  const gain = Math.round(state.resist - before);
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  addLog(state, state.care.date, `${PREPS[prep].label}${double ? '（倒塌後雙倍）' : ''}，抗風力 ${Math.round(before)} → ${Math.round(state.resist)}。`, { kind: 'reinforce', title: '已加固', reward: { text: `+${gain} 抗風力`, tone: 'orange' } });
  return { ok: true, message: `${PREPS[prep].label}${double ? '（雙倍）' : ''}：抗風力 +${gain}（而家 ${Math.round(state.resist)}）。` };
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
  if (state.over) return { ok: false, message: '呢局已經完結。' };
  const opts = emergencyOptions(events);
  const name = emergencyName(action);
  if (!opts[action])
    return {
      ok: false,
      message: action === 'heatWater' ? '今日冇酷熱警告，唔使做酷熱澆水。' : action === 'warmCover' ? '今日冇寒冷警告，唔使做保暖。' : regionalize('今日冇暴雨／黑雨警告，唔使做暴雨疏水。'),
    };
  if (state.care[action]) return { ok: false, message: `今日做咗${name}喇。` };
  state.care[action] = true;
  const before = state.moisture;
  let message: string;
  if (action === 'heatWater') {
    state.moisture = before < W_SATURATED ? Math.min(W_SATURATED, r1(before + EMERGENCY.heatWater.amount)) : before;
    const got = r1(state.moisture - before);
    message = got > 0 ? `酷熱澆水：水分 +${got}（而家 ${Math.round(state.moisture)}）。今晚唔會因酷熱扣健康，仲有應急獎勵。` : `酷熱澆水：泥土已經飽和，冇加水，不過都算做咗。今晚唔會因酷熱扣健康，仲有應急獎勵。`;
  } else if (action === 'warmCover') {
    message = '保暖：喺樹旁邊生起營火，幫棵樹暖住過夜。今晚唔會因寒冷扣健康，仲有應急獎勵。';
  } else {
    const floor = EMERGENCY.rainDrain.floor;
    state.moisture = before > floor ? Math.max(floor, r1(before + EMERGENCY.rainDrain.amount)) : before;
    const got = r1(state.moisture - before);
    message = regionalize(got < 0 ? `暴雨疏水：水分 ${got}（而家 ${Math.round(state.moisture)}）。今晚唔會因暴雨扣健康，仲有應急獎勵。` : `暴雨疏水：水分已經唔高過 ${floor}，冇疏走水，不過都算做咗。今晚唔會因暴雨扣健康，仲有應急獎勵。`);
  }
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  const delta = r1(state.moisture - before);
  addLog(state, state.care.date, message, { kind: 'emergency', title: name, reward: { text: delta ? `${sgn(delta)} 水分` : '已應對', tone: action === 'warmCover' ? 'purple' : 'blue' } });
  const rescue = checkRescue(state);
  if (rescue) message = `${message} ${rescue}`;
  return { ok: true, message };
}

/** Trees show stakes / ropes / pruning as R rises. v13: nothing before 青年樹 (加固 is locked; R 60 is only a starting value). */
export function visualReinforcement(resist: number, unlocked = true): Reinforcement {
  if (!unlocked) return { stakes: false, ropes: false, prune: false };
  return { stakes: resist >= 15, ropes: resist >= 35, prune: resist >= 60 };
}

const RAIN_EVENTS: WeatherEventId[] = ['drizzle', 'rainstorm', 'blackrain', 'thunder', 'typhoon1', 'typhoon8'];

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
    addLog(state, opts.date, `${animal.name}嚟咗，${animal.about}`, { kind: 'animal', title: '新朋友來訪', reward: { text: '+1 圖鑑', tone: 'purple' } });
  }
  return got;
}

export function triggerPest(state: GameState, date: string): void {
  state.pest.active = true;
  state.pest.since = date;
  addLog(state, date, '葉底生咗蟲。每晚會扣 15 健康度，要用除蟲處理。', { kind: 'pest', title: '蟲害', reward: { text: '-15/日', tone: 'red' } });
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
      const res = settleDay(state, date, eventsFor(date), meta, nowMs);
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
    else if (gap > 1) state.morningNote = `你離開咗 ${gap} 日。健康 ${Math.round(healthBefore)} → ${Math.round(state.health)}，高度 ${growthCm >= 0 ? '+' : ''}${growthCm.toFixed(1)} 厘米。`;
    if (messages.length && gap > 0) state.morningNote = `${state.morningNote ?? ''} ${messages.join(' ')}`.trim();
  }
  return { daysPassed: Math.max(0, gap), growthCm, healthBefore, healthAfter: state.health, messages, eventText, animals, settlements, over: Boolean(state.over), milestones };
}

function nightNote(s: Settlement | undefined): string {
  if (!s) return '';
  return `昨晚結算：${eventLabel(s.event)}，健康 ${Math.round(s.hBefore)} → ${Math.round(s.hAfter)}，高度 ${s.deltaG >= 0 ? '+' : ''}${s.deltaG} 厘米。`;
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
  if (state.dying) return `瀕死！將水分調到 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就即刻救得返。`;
  if (plan.collapse) {
    const c = plan.collapse;
    const label = eventLabel(c.event);
    if (c.fatal && !c.revive) return `危險！抗風力 ${Math.round(c.r)} 低過${label}門檻 ${c.threshold}，今晚再倒塌棵樹就會死！即刻加固。`;
    return `抗風力 ${Math.round(c.r)} 低過${label}門檻 ${c.threshold}，今晚會倒塌（高度 −20%）。快啲加固到 ${c.threshold} 或以上。`;
  }
  if (state.pest.active) return '生咗蟲，每晚扣 15 健康度，快啲除蟲。';
  if (plan.waterDeath) return `今晚水分會去到 ${W_MAX}，棵樹會即刻瀕死！快啲疏水。`;
  if (plan.heat && !plan.heat.handled) return `酷熱警告生效：做「酷熱澆水」（額外一次）就唔會扣 ${plan.heat.base} 健康，仲有應急獎勵 +3。`;
  if (plan.cold && !plan.cold.handled) return `寒冷警告生效：做「保暖」（每日一次）就唔會扣 ${plan.cold.base} 健康，仲有應急獎勵 +3。`;
  if (plan.rain && !plan.rain.handled) return `${eventLabel(plan.rain.event)}警告生效：做「${emergencyName('rainDrain')}」（額外一次）就唔會扣 ${plan.rain.base} 健康，仲有應急獎勵 +3。`;
  if (countdown && WEATHER_EVENTS[countdown.event].category === 'wind') {
    const def = { ...WEATHER_EVENTS[countdown.event], label: eventLabel(countdown.event) };
    if (!state.windUnlocked) return `${def.label}就嚟，不過棵樹未到${STAGE_NAMES[WIND_UNLOCK_STAGE]}，風災唔會傷到佢。照顧好水分同養分就得。`;
    if (state.resist < (def.collapseBelow ?? 0)) return `${def.label}就嚟：抗風力 ${Math.round(state.resist)} 低過倒塌門檻 ${def.collapseBelow}，快啲加固！`;
    if (state.resist < 60) return `${def.label}就嚟，先加固推高抗風力（而家 ${Math.round(state.resist)}）。`;
  }
  if (countdown && countdown.hours > 0 && (countdown.event === 'rainstorm' || countdown.event === 'blackrain')) {
    const hit = rainAdd(state.moisture, WEATHER_EVENTS[countdown.event].dW, RAIN_OVER_CAP.heavy);
    if (hit > W_SATURATED) return `${eventLabel(countdown.event)}警告一出水分會即刻去到約 ${Math.round(hit)}（超過 ${W_SATURATED} 會爛根），可以先疏水。`;
  }
  if (plan.wAfter > W_SATURATED) return `今晚水分預計 ${Math.round(plan.wAfter)}：${plan.wLabel} ${sgn(plan.wScore)}。疏水返到 ${W_SATURATED} 以下。`;
  if (plan.wAfter < W_OPTIMAL[0]) return `今晚水分預計跌到 ${Math.round(plan.wAfter)}：乾旱 ${sgn(plan.wScore)}。記得澆水（最多澆到 ${W_SATURATED}）。`;
  if (plan.nAfter < N_OPTIMAL[0]) return `養分今晚會跌到 ${Math.round(plan.nAfter)}，低過 ${N_OPTIMAL[0]}，可以施肥。`;
  if (state.windUnlocked && state.resist < 40) return `有空可以加固：抗風力低過 40，${eventLabel('typhoon8')}一嚟就會倒塌。`;
  return `今晚水分預計 ${Math.round(plan.wAfter)}，適中 +5。水分同養分都啱啱好，今晚會健康咁長高。`;
}

export function dayNumber(state: GameState, today: string): number {
  return Math.max(1, daysBetween(state.createdOn, today) + 1);
}

export function eventTitle(state: GameState): { title: string; text: string } {
  const event = eventById(state.dailyEventId);
  return { title: event.title, text: event.text };
}
