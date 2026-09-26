/** Pure formulas of the design doc. Numbers come from balance.ts. */
import {
  CARBON_K,
  EVENT_ORDER,
  H_MULT_TIERS,
  N_FACTOR,
  N_MALNOURISHED,
  N_OPTIMAL,
  GROWTH_FLOOR_SHARE,
  GROWTH_TAU_DAYS,
  MILESTONE_TIER_SHARE,
  type MilestoneTier,
  RAIN_OVER_CAP,
  W_MAX,
  W_NIGHT_LOSS,
  W_SATURATED,
  W_TIERS,
  WEATHER_EVENTS,
  EMERGENCY,
  WX_CATEGORY_ORDER,
  type WeatherCategory,
  type WeatherEventId,
} from './balance';

export const clamp100 = (v: number) => Math.max(0, Math.min(100, v));
/** v12: 水分 W runs 0-150. */
export const clampW = (v: number) => Math.max(0, Math.min(W_MAX, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export function inBand(v: number, band: readonly [number, number]): boolean {
  return v >= band[0] && v <= band[1];
}

/** v12 水分 tier: <50 乾旱 −10、50-100 適中 +5、101-115 輕度爛根 −10、116-135 嚴重爛根 −20、136+ 根部壞死 −30. */
export function wTier(w: number): (typeof W_TIERS)[number] {
  return W_TIERS.find((t) => w <= t.max) ?? W_TIERS[W_TIERS.length - 1]!;
}

/** Nightly 水分分數 (W after the night's water change). Kept under the old name. */
export function wFactor(w: number): number {
  return wTier(w).score;
}

/** W ≥ 150 at any moment = roots drowned → 瀕死. */
export function waterDeath(w: number): boolean {
  return w >= W_MAX;
}

/**
 * Rain on the soil: fills normally up to 泥土飽和 (100); what is left adds at most `overCap` beyond 100
 * (already above 100: at most `overCap`). Never above 150.
 */
export function rainAdd(w: number, amount: number, overCap: number): number {
  if (amount <= 0) return w;
  const fill = Math.max(0, Math.min(amount, W_SATURATED - w));
  const rest = amount - fill;
  return clampW(round1(w + fill + Math.min(rest, overCap)));
}

/** 澆水: +amount but never past 泥土飽和 (100). */
export function waterAdd(w: number, amount: number): number {
  return w >= W_SATURATED ? w : Math.min(W_SATURATED, round1(w + amount));
}

export const RAIN_DAY_EVENTS: readonly WeatherEventId[] = ['drizzle', 'rainstorm', 'blackrain'];

/** A rain day (毛毛雨、暴雨或黑雨) has no natural water loss that night. */
export function isRainDay(events: readonly WeatherEventId[]): boolean {
  return events.some((e) => RAIN_DAY_EVENTS.includes(e));
}

export interface NightWater {
  wAfter: number;
  /** What happened: natural loss, drizzle or nothing (rain day covered by 暴雨／黑雨). */
  kind: 'loss' | 'drizzle' | 'rain';
  delta: number;
}

/**
 * The night's water change (before the health score): −10 natural loss (×0.9 with the 一級徽章), none on a rain day;
 * 毛毛雨 adds +10 (at most +5 above 100) unless 暴雨／黑雨 already watered the day.
 */
export function nightWater(w: number, events: readonly WeatherEventId[], waterSaver: boolean): NightWater {
  if (!isRainDay(events)) {
    const loss = waterSaver ? W_NIGHT_LOSS * 0.9 : W_NIGHT_LOSS;
    const wAfter = clampW(round1(w - loss));
    return { wAfter, kind: 'loss', delta: round1(wAfter - w) };
  }
  if (events.includes('drizzle') && !events.includes('rainstorm') && !events.includes('blackrain')) {
    const wAfter = rainAdd(w, WEATHER_EVENTS.drizzle.dW, RAIN_OVER_CAP.drizzle);
    return { wAfter, kind: 'drizzle', delta: round1(wAfter - w) };
  }
  return { wAfter: w, kind: 'rain', delta: 0 };
}

/** 養分充足 (≥60) +5，營養不良 (<30) −10，中間 0. */
export function nFactor(n: number): number {
  if (n >= N_OPTIMAL[0]) return N_FACTOR.good;
  if (n < N_MALNOURISHED) return N_FACTOR.bad;
  return N_FACTOR.mid;
}

/** 最終天氣損傷 = 天氣基礎傷害 × (1 − R/100). */
export function finalDamage(base: number, resist: number): number {
  return round1(base * (1 - clamp100(resist) / 100));
}

/**
 * The day's headline event (label, growth factor): the one with the highest 基礎傷害; ties go to the later entry in
 * EVENT_ORDER. v13: health no longer uses only this one — see topInCategory (熱／雨／風 stack).
 */
export function pickEvent(events: readonly WeatherEventId[]): WeatherEventId {
  let best: WeatherEventId = 'clear';
  for (const id of events) {
    const a = WEATHER_EVENTS[id];
    const b = WEATHER_EVENTS[best];
    if (!a) continue;
    if (a.damage > b.damage || (a.damage === b.damage && EVENT_ORDER.indexOf(id) > EVENT_ORDER.indexOf(best))) best = id;
  }
  return best;
}

/** v13: the most severe event of one category among the day's events (null if none). */
export function topInCategory(events: readonly WeatherEventId[], cat: WeatherCategory): WeatherEventId | null {
  const order = WX_CATEGORY_ORDER[cat];
  let best: WeatherEventId | null = null;
  for (const id of events) if (order.includes(id) && (best === null || order.indexOf(id) > order.indexOf(best))) best = id;
  return best;
}

/** 應急獎勵 (v15 general form): one action +3; n ≥ 2 on the same day 3n × 0.75 (2 → 4.5, 3 → 6.75). */
export function emergencyBonus(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return EMERGENCY.bonus;
  return Math.round(EMERGENCY.bonus * count * EMERGENCY.bothMult * 100) / 100;
}

/** 「(3 + 3 + 3) × 0.75 = +6.75」 wording for n ≥ 2 (just 「+3」 for one). */
export function emergencyBonusText(count: number): string {
  const b = emergencyBonus(count);
  if (count <= 1) return `+${b}`;
  return `(${Array(count).fill(EMERGENCY.bonus).join(' + ')}) × ${EMERGENCY.bothMult} = +${b}`;
}

export function hMultTier(h: number): (typeof H_MULT_TIERS)[number] {
  return H_MULT_TIERS.find((t) => h >= t.min) ?? H_MULT_TIERS[H_MULT_TIERS.length - 1]!;
}

export function hMult(h: number): number {
  return hMultTier(h).mult;
}

/** v14: share of the gap to R closed each night, 1 − e^(−1/τ) (τ = 100 days). */
export const GROWTH_K = 1 - Math.exp(-1 / GROWTH_TAU_DAYS);

/**
 * v14 每日基本生長 (cm, before H_mult / 天氣加成) from the tree's CURRENT height h (after earlier nights and collapses):
 * max((R − h) × (1 − e^(−1/100)), 0.0002 × R), R = 紀錄高度 (cm). Taller → slower; beyond R it keeps the floor. No cap.
 */
export function baseDailyGrowth(recordCm: number, heightCm: number): number {
  return Math.max(Math.max(0, recordCm - heightCm) * GROWTH_K, GROWTH_FLOOR_SHARE * recordCm);
}

/** v14 expected share of R after t nights at ×1: e(t) = 1 − e^(−t/τ). */
export function expectedShare(days: number): number {
  return 1 - Math.exp(-Math.max(0, days) / GROWTH_TAU_DAYS);
}

/** v14 milestone tier from p = h/R at day t: 金 ≥ 0.98·e(t), 銀 ≥ 0.88·e(t), otherwise 銅. */
export function milestoneTier(share: number, days: number): MilestoneTier {
  const e = expectedShare(days);
  if (share >= MILESTONE_TIER_SHARE.gold * e) return 'gold';
  if (share >= MILESTONE_TIER_SHARE.silver * e) return 'silver';
  return 'bronze';
}

/** ΔG = base × H_mult × 天氣獎勵加成. Losses (H_mult < 0) ignore the weather bonus. */
export function deltaG(baseCm: number, mult: number, weatherBonus: number): number {
  return round1(mult >= 0 ? baseCm * mult * weatherBonus : baseCm * mult);
}

/** 碳吸收量 (公斤 CO₂／年) = 常數 × G^1.5, G in metres. */
export function carbonKg(heightCm: number): number {
  return round1(CARBON_K * Math.pow(Math.max(0, heightCm) / 100, 1.5));
}

/** Deterministic 0-1 roll per date (same result on every device, testable). */
export function rollFor(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
