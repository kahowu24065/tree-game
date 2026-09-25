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
  W_FACTOR,
  W_OPTIMAL,
  WEATHER_EVENTS,
  type SeasonDef,
  type SeasonId,
  type WeatherEventId,
} from './balance';

export const clamp100 = (v: number) => Math.max(0, Math.min(100, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export function inBand(v: number, band: readonly [number, number]): boolean {
  return v >= band[0] && v <= band[1];
}

/** 水分適中 +5，缺水或水浸 −10. */
export function wFactor(w: number): number {
  return inBand(w, W_OPTIMAL) ? W_FACTOR.good : W_FACTOR.bad;
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
 * Several warnings at once do not stack: only the event with the highest 基礎傷害 applies,
 * with its own side effects. Ties go to the later (heavier) entry in EVENT_ORDER.
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

export function hMultTier(h: number): (typeof H_MULT_TIERS)[number] {
  return H_MULT_TIERS.find((t) => h >= t.min) ?? H_MULT_TIERS[H_MULT_TIERS.length - 1]!;
}

export function hMult(h: number): number {
  return hMultTier(h).mult;
}

export function seasonDef(id: SeasonId): SeasonDef {
  return SEASONS.find((s) => s.id === id) ?? SEASONS[0]!;
}

/** 最終目標高度 / 週期總日數 (cm per day). */
export function baseDailyGrowth(season: SeasonDef): number {
  return season.targetCm / season.days;
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
