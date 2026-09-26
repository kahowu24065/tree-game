/** Pure formulas of the design doc. Numbers come from balance.ts. */
import {
  CARBON_K,
  EVENT_ORDER,
  H_MULT_TIERS,
  N_FACTOR,
  N_MALNOURISHED,
  N_OPTIMAL,
  SEASONS,
  TIER_DAYS,
  RAIN_OVER_CAP,
  W_MAX,
  W_NIGHT_LOSS,
  W_SATURATED,
  W_TIERS,
  WEATHER_EVENTS,
  EMERGENCY,
  WX_CATEGORY_ORDER,
  type WeatherCategory,
  type SeasonDef,
  type SeasonId,
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

/** v13 應急獎勵: one action +3; both on the same day (3 + 3) × 0.75 = 4.5. */
export function emergencyBonus(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return EMERGENCY.bonus;
  return round1(EMERGENCY.bonus * count * EMERGENCY.bothMult);
}

export function hMultTier(h: number): (typeof H_MULT_TIERS)[number] {
  return H_MULT_TIERS.find((t) => h >= t.min) ?? H_MULT_TIERS[H_MULT_TIERS.length - 1]!;
}

export function hMult(h: number): number {
  return hMultTier(h).mult;
}

export function seasonDef(id: SeasonId): SeasonDef {
  return SEASONS.find((s) => s.id === id) ?? SEASONS[0]!;
}

/** 最終目標高度 / 週期總日數 (cm per day). The target is the species' own (record height rounded to 10 m). */
export function baseDailyGrowth(season: SeasonDef, targetCm: number): number {
  return targetCm / season.days;
}

/** ΔG = base × H_mult × 天氣獎勵加成. Losses (H_mult < 0) ignore the weather bonus. */
export function deltaG(baseCm: number, mult: number, weatherBonus: number): number {
  return round1(mult >= 0 ? baseCm * mult * weatherBonus : baseCm * mult);
}

/** 碳吸收量 (公斤 CO₂／年) = 常數 × G^1.5, G in metres. */
export function carbonKg(heightCm: number): number {
  return round1(CARBON_K * Math.pow(Math.max(0, heightCm) / 100, 1.5));
}

/**
 * Badge tiers earned. Finishing grants every tier up to the season's; dying grants every tier whose
 * length you actually survived (fail-safe), never above the chosen season.
 */
export function earnedTiers(seasonDays: number, survivedDays: number, completed: boolean): (1 | 2 | 3)[] {
  const reach = completed ? seasonDays : survivedDays;
  return ([1, 2, 3] as const).filter((t) => TIER_DAYS[t] <= reach && TIER_DAYS[t] <= seasonDays);
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
