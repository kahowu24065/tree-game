import { t as tl } from './i18n';
/**
 * 《世界之樹》數值表 — every tunable number of the rules lives here.
 * Formulas that use them are in rules.ts; see README「遊戲規則」for the plain-language version.
 */

/* ---------- Core stats (H, N, R: 0-100; W: 0-150) ---------- */
/** v12: 水分 W runs 0-150. 150 = 根部完全浸死 → 即刻瀕死. */
export const W_MAX = 150;
/** 泥土飽和: watering stops here; above it the roots start to rot. */
export const W_SATURATED = 100;
/** 水分 W optimal band (inclusive): below = 乾旱, above = 爛根. */
export const W_OPTIMAL: readonly [number, number] = [50, 100];
/**
 * v12 nightly W score by the W after the night's water change (first tier whose `max` ≥ W).
 * 50-100 +5; <50 乾旱 −10; 101-115 輕度爛根 −10; 116-135 嚴重爛根 −20; 136-149 根部壞死 −30 (150 = 瀕死).
 */
export const W_TIERS: readonly { max: number; score: number; label: string; tone: 'dry' | 'ok' | 'rot1' | 'rot2' | 'rot3' }[] = [
  { max: 49.999, score: -10, label: tl('balance.001'), tone: 'dry' },
  { max: 100, score: 5, label: tl('balance.002'), tone: 'ok' },
  { max: 115, score: -10, label: tl('balance.003'), tone: 'rot1' },
  { max: 135, score: -20, label: tl('balance.004'), tone: 'rot2' },
  { max: Infinity, score: -30, label: tl('balance.005'), tone: 'rot3' },
];
/** v1.4.23: natural water loss per day = 1 point an hour, applied gradually (none on a rain day). */
export const W_NIGHT_LOSS = 24;
/** Rain above 泥土飽和 (100) only adds this much more: 暴雨／黑雨 +10, 毛毛雨 +5. */
export const RAIN_OVER_CAP = { heavy: 10, drizzle: 5 } as const;
/** 養分 N optimal band ("充足"). */
export const N_OPTIMAL: readonly [number, number] = [60, 100];
/** 養分 below this = 營養不良. 30-59 counts as neither (N_factor 0). */
export const N_MALNOURISHED = 30;

/**
 * v13 daily H formula: H_new = H_old + W_score + N_factor + 天氣分(酷熱) + 天氣分(暴雨／黑雨) + 天氣分(風災) + 應急獎勵 − 蟲害.
 * Each weather category (熱／雨／風) counts on its own; within one category only the most severe event counts.
 */
export const N_FACTOR = { good: 5, mid: 0, bad: -10 } as const;

/** The tree uses up this much 養分 every night. */
export const N_DAILY_USE = 10;
/** Ropes loosen: 抗風力 R drops this much every night on top of any weather consumption. */
export const R_DAILY_DECAY = 2;

/* ---------- Weather events ---------- */
export type WeatherEventId = 'clear' | 'hot' | 'cold' | 'drizzle' | 'rainstorm' | 'blackrain' | 'thunder' | 'typhoon1' | 'typhoon8' | 'landslip';

/** v13 weather categories: they stack with each other; inside one category only the most severe event counts. v15 adds 寒. */
export type WeatherCategory = 'heat' | 'cold' | 'rain' | 'wind';

export interface WeatherEventDef {
  id: WeatherEventId;
  label: string;
  /** v13 category (熱／寒／雨／風); 晴天、毛毛雨 have none (water only). */
  category: WeatherCategory | null;
  /**
   * 天氣基礎傷害 to H. 酷熱／暴雨／黑雨: flat, avoided by the day's 應急行動 (酷熱澆水／暴雨疏水), NOT reduced by R.
   * 風災: × (1 − R/100), only once the tree has reached 青年樹.
   */
  damage: number;
  /**
   * Effect on 水分 W. v12: 酷熱／暴雨／黑雨 apply the moment the warning is first seen (once per day);
   * 毛毛雨 applies at the nightly settlement. Others: 0.
   */
  dW: number;
  /** Side effect on 抗風力 R (consumption, ≤ 0). v13: wind only, and only after 青年樹. */
  dR: number;
  /** v13 風災: R below this (before the night's consumption) = the tree collapses (倒塌). */
  collapseBelow?: number;
  /** 天氣獎勵加成 for ΔG. */
  growth: number;
  /** Shown in the 12-hour countdown. */
  severe: boolean;
  tip: string;
}

/** 酷熱 growth modifier; v15 寒冷 uses the same value. */
export const HEAT_GROWTH = 0.9;
/** v15 寒冷: flat health damage unless 保暖 was done that day. */
export const COLD_DAMAGE = 10;

/**
 * 天氣與災害權重表 (v13; v15 adds 寒冷). 熱：酷熱；雨：暴雨 < 黑雨；風：初級颱風 < 狂風雷暴 < 高級颱風.
 * 初級颱風 (一號／三號風球) R consumption = half of 高級颱風 (八號或以上), rounded.
 */
export const WEATHER_EVENTS: Record<WeatherEventId, WeatherEventDef> = {
  clear: { id: 'clear', label: tl('balance.006'), category: null, damage: 0, dW: 0, dR: 0, growth: 1, severe: false, tip: tl('balance.007') },
  drizzle: { id: 'drizzle', label: tl('sim.010'), category: null, damage: 0, dW: 10, dR: 0, growth: 1.15, severe: false, tip: tl('balance.008') },
  hot: { id: 'hot', label: tl('guide.133'), category: 'heat', damage: 10, dW: -20, dR: 0, growth: HEAT_GROWTH, severe: true, tip: tl('balance.009') },
  cold: { id: 'cold', label: tl('balance.010'), category: 'cold', damage: COLD_DAMAGE, dW: 0, dR: 0, growth: HEAT_GROWTH, severe: true, tip: tl('balance.011') },
  rainstorm: { id: 'rainstorm', label: tl('balance.012'), category: 'rain', damage: 10, dW: 20, dR: 0, growth: 0.9, severe: true, tip: tl('balance.013') },
  blackrain: { id: 'blackrain', label: tl('guide.139'), category: 'rain', damage: 15, dW: 20, dR: 0, growth: 0.85, severe: true, tip: tl('balance.014') },
  typhoon1: { id: 'typhoon1', label: tl('balance.015'), category: 'wind', damage: 30, dW: 0, dR: -18, collapseBelow: 20, growth: 0.8, severe: true, tip: tl('balance.016') },
  landslip: { id: 'landslip', label: tl('balance.017'), category: 'wind', damage: 30, dW: 0, dR: -18, collapseBelow: 20, growth: 0.8, severe: true, tip: tl('balance.018') },
  thunder: { id: 'thunder', label: tl('balance.019'), category: 'wind', damage: 35, dW: 0, dR: -25, collapseBelow: 25, growth: 0.8, severe: true, tip: tl('balance.020') },
  typhoon8: { id: 'typhoon8', label: tl('balance.021'), category: 'wind', damage: 60, dW: 0, dR: -35, collapseBelow: 40, growth: 0.6, severe: true, tip: tl('balance.022') },
};
/** v13: severity order inside each category (last = most severe). */
export const WX_CATEGORY_ORDER: Record<WeatherCategory, WeatherEventId[]> = {
  heat: ['hot'],
  cold: ['cold'],
  rain: ['rainstorm', 'blackrain'],
  // v1.4 山泥傾瀉 = same tier as 初級颱風 (listed first, so a 風球 of equal weight is the one shown).
  wind: ['landslip', 'typhoon1', 'thunder', 'typhoon8'],
};
export const WX_CATEGORY_LABEL: Record<WeatherCategory, string> = { heat: tl('guide.097'), cold: tl('guide.099'), rain: tl('guide.100'), wind: tl('ui.164') };
export const EVENT_ORDER: WeatherEventId[] = ['clear', 'drizzle', 'hot', 'cold', 'rainstorm', 'blackrain', 'landslip', 'typhoon1', 'thunder', 'typhoon8'];

/** Weathering a wind event (after 青年樹) with ≤ this share of its base damage (well reinforced) earns the storm bonus. */
export const STORM_SURVIVE_SHARE = 0.25;
export const STORM_SURVIVE_GROWTH = 1.3;

/* ---------- 蟲害 (hidden) ---------- */
export const PEST_DAMAGE = 15;
/** Consecutive nights of N < 30, or of 爛根 (W > 100), that trigger 蟲害. */
export const PEST_TRIGGER_DAYS = 3;
/** Each resident species eats pests: +1 night before 蟲害 triggers and −3 蟲害 damage a night, for up to 3 species. */
export const RESIDENT_PEST_NIGHTS = 1;
export const RESIDENT_PEST_CUT = 3;
export const RESIDENT_PEST_MAX_SPECIES = 3;
const pestHelpers = (residents: number) => Math.max(0, Math.min(RESIDENT_PEST_MAX_SPECIES, residents));
/** Nights in a row of N < 30 or 爛根 needed for 蟲害 with `residents` resident species (3 → 6). */
export function pestTriggerDays(residents: number): number {
  return PEST_TRIGGER_DAYS + pestHelpers(residents) * RESIDENT_PEST_NIGHTS;
}
/** 蟲害 damage a night with `residents` resident species (15 → 12 → 9 → 6). */
export function pestDamageWith(residents: number): number {
  return PEST_DAMAGE - pestHelpers(residents) * RESIDENT_PEST_CUT;
}

/* ---------- Growth ---------- */
/** 健康轉化係數 H_mult by H after the night's settlement. */
export const H_MULT_TIERS: readonly { min: number; mult: number; label: string }[] = [
  { min: 80, mult: 1.5, label: tl('balance.023') },
  { min: 50, mult: 1, label: tl('balance.024') },
  { min: 20, mult: 0.2, label: tl('balance.025') },
  { min: 0, mult: -0.5, label: tl('balance.026') },
];
export const MIN_HEIGHT_CM = 5;

/**
 * Lifetime-average 碳吸收量. Stock uses the mean of two aboveground biomass estimates, then roots, then CO₂.
 * Chave et al. 2014: AGB (kg) = CHAVE_COEF × (wood density × DBH² × height)^CHAVE_EXP
 * (density g/cm³, DBH cm, height m). The other estimate is stem volume × density × branch expansion.
 */
export const CARBON_FRACTION = 0.47;
export const CO2_PER_CARBON = 44 / 12;
/** Belowground biomass as a fraction of aboveground biomass. */
export const ROOT_SHOOT = 0.24;
export const CHAVE_COEF = 0.0673;
export const CHAVE_EXP = 0.976;
/** Stem volume = STEM_FORM × basal area × height; branches scale that dry mass up to aboveground biomass. */
export const STEM_FORM = 0.45;
export const BRANCH_EXPANSION = 1.3;
/** DBH (cm) = species dbh at 10 m × (height / 10 m) ^ DBH_HEIGHT_EXP. */
export const DBH_HEIGHT_EXP = 0.7;

/* ---------- v14 生長曲線、樹齡里程碑、徽章 ---------- */
/**
 * v14 (no seasons): every species grows towards its 紀錄高度 R (= speciesTargetCm: the real-world record height rounded
 * to 10 m). base = max((R − h) × (1 − e^(−1/τ)), GROWTH_FLOOR_SHARE × R) per night, then × H_mult × 天氣加成 as before.
 * With ×1 every night: ~26% of R at 30 days, ~59% at 90, ~84% at 182, ~97% at 365, then ~7% of R a year.
 */
export const GROWTH_TAU_DAYS = 100;
/** Minimum base growth per night as a share of R (also × H_mult × 天氣加成). No hard cap. */
export const GROWTH_FLOOR_SHARE = 0.0002;

export type AgeMilestoneId = 'm30' | 'm90' | 'm182' | 'm365' | 'm730' | 'm1095';
export type MilestoneId = AgeMilestoneId | 'record';
export type MilestoneTier = 'gold' | 'silver' | 'bronze';
/** 樹齡里程碑 (stored age = nights settled; the card shows the planting day as day 1). `perk`: the old perk badge (一級／二級／三級) it also grants. */
export const AGE_MILESTONES: readonly { id: AgeMilestoneId; days: number; label: string; perk?: 1 | 2 | 3 }[] = [
  { id: 'm30', days: 30, label: tl('balance.027') },
  { id: 'm90', days: 90, label: tl('balance.028'), perk: 1 },
  { id: 'm182', days: 182, label: tl('balance.029'), perk: 2 },
  { id: 'm365', days: 365, label: tl('balance.030'), perk: 3 },
  { id: 'm730', days: 730, label: tl('balance.031') },
  { id: 'm1095', days: 1095, label: tl('balance.032') },
];
export const RECORD_MILESTONE = { id: 'record' as const, label: tl('balance.033') };

/**
 * 酷熱／寒冷 claim an achievement at these counts, then every 100 after 100.
 * 風暴／八號／暴雨／黑雨 claim one at every new event (1, 2, 3…).
 */
export const WX_AWARD_STEPS = [1, 5, 10, 20, 50, 100] as const;
export const WX_TRACKS = [
  { id: 'storm', unit: tl('balance.034'), name: tl('balance.035'), detail: tl('balance.036') },
  { id: 't8', unit: tl('balance.034'), name: tl('balance.037'), intlName: tl('balance.038'), detail: tl('balance.039'), intlDetail: tl('balance.040') },
  { id: 'black', unit: tl('balance.041'), name: tl('guide.139'), intlName: tl('balance.042'), detail: tl('balance.043') },
  { id: 'rain', unit: tl('balance.041'), name: tl('balance.012'), intlName: tl('balance.044'), detail: tl('balance.045') },
  { id: 'heat', unit: tl('balance.034'), name: tl('guide.133'), intlName: tl('balance.046'), detail: tl('balance.047'), intlDetail: tl('balance.048') },
  { id: 'cold', unit: tl('balance.034'), name: tl('balance.010'), detail: tl('balance.049') },
] as const;
export type WeatherTrackId = (typeof WX_TRACKS)[number]['id'];
/** `storm:5` — the track and the count it was claimed at. */
export type WeatherAchievementId = `${WeatherTrackId}:${number}`;

export function isWxAwardCount(track: WeatherTrackId, n: number): boolean {
  if (n < 1) return false;
  if (track === 'heat' || track === 'cold') {
    if (WX_AWARD_STEPS.includes(n as (typeof WX_AWARD_STEPS)[number])) return true;
    return n > 100 && n % 100 === 0;
  }
  return true;
}

/** The next count that claims an achievement, after `n` events already weathered. */
export function nextWxAwardCount(track: WeatherTrackId, n: number): number {
  if (track !== 'heat' && track !== 'cold') return n + 1;
  const step = WX_AWARD_STEPS.find((c) => c > n);
  if (step) return step;
  return Math.floor(n / 100) * 100 + 100;
}

export function wxAwardId(track: WeatherTrackId, count: number): WeatherAchievementId {
  return `${track}:${count}`;
}

export function parseWxAwardId(id: string): { track: WeatherTrackId; count: number } | null {
  const match = /^(storm|t8|black|rain|heat|cold):(\d+)$/.exec(id);
  if (!match) return null;
  const count = Number(match[2]);
  if (!isWxAwardCount(match[1] as WeatherTrackId, count)) return null;
  return { track: match[1] as WeatherTrackId, count };
}
/** Tier by p = h/R against the expected e(t) = 1 − e^(−t/τ): 金 ≥ 0.98·e(t), 銀 ≥ 0.88·e(t), else 銅. */
export const MILESTONE_TIER_SHARE = { gold: 0.98, silver: 0.88 } as const;
export const MILESTONE_TIER_LABEL: Record<MilestoneTier, string> = { gold: tl('balance.050'), silver: tl('balance.051'), bronze: tl('balance.052') };

/** Perk badges (kept from the season era): v14 grants them at the 3個月／半年／1年 age milestones. */
export const BADGES: Record<1 | 2 | 3, { name: string; perk: string }> = {
  1: { name: tl('balance.053'), perk: tl('balance.054') },
  2: { name: tl('balance.055'), perk: tl('balance.056') },
  3: { name: tl('balance.057'), perk: tl('balance.058') },
};
export const T1_WATER_LOSS_MULT = 0.9;
export const T2_RAIN_TO_N_CHANCE = 0.3;
export const REVIVE_HEALTH = 30;

/* ---------- Care actions ---------- */
export const CARE = {
  /**
   * v1.4.23 澆水: +5 a tap, never past 泥土飽和 (100; only rain goes above). No daily limit: at most 2 per clock
   * hour. At ≥ 100 it does nothing and does not use a turn, until moisture drops.
   */
  water: { amount: 5, perHour: 2 },
  drain: { amount: -10, perDay: 3 },
  fertilize: { amount: 25, perDay: 1 },
} as const;
/** 加固: each item once a day, adds to R up to the current cap. */
export const PREPS = {
  stakes: { label: tl('balance.059'), sub: tl('balance.060'), amount: 15 },
  ropes: { label: tl('balance.061'), sub: tl('balance.062'), amount: 12 },
  prune: { label: tl('balance.063'), sub: tl('balance.064'), amount: 8 },
} as const;
export type PrepId = keyof typeof PREPS;

/* ---------- 抗風力 ---------- */
/** 加固 raises R up to this cap (no resource spending). */
export const R_MAX = 100;
/** v13: the day after a collapse every 加固 item gives this many times its R. */
export const COLLAPSE_REINFORCE_MULT = 2;

/* ---------- v13 應急行動、風災、倒塌 ---------- */
export const EMERGENCY = {
  /** 酷熱澆水: once a day on top of the normal waterings (not counted in the hourly limit), +5 water (never past 100; at ≥ 100 still counts). */
  heatWater: { amount: 5 },
  /** 暴雨疏水: once a day on top of the 3 drains, −10 water but never below this floor. */
  rainDrain: { amount: -10, floor: 50 },
  /** v15 保暖: once a day while 寒冷 is in force; no water change. */
  warmCover: {},
  /** Bonus for each emergency action that met its warning. */
  bonus: 3,
  /** v15: n ≥ 2 on the same day: 3n × this (2 → 4.5, 3 → 6.75). One alone = 3. */
  bothMult: 0.75,
} as const;

/* ---------- v15 天氣門檻（香港以外；香港／鄰近照用天文台警告） ---------- */
/** Open-Meteo `past_days` used for the local normals (average daily min / max). */
export const NORMAL_PAST_DAYS = 14;
/** 寒冷 (outside HK): day min ≤ this, always. */
export const COLD_ABS_MIN_C = 3;
/** 寒冷 (outside HK): or day min ≤ this AND ≤ normal min − COLD_REL_DROP_C. */
export const COLD_REL_MAX_C = 10;
export const COLD_REL_DROP_C = 8;
/** 酷熱 (outside HK): day max ≥ this, always. */
export const HOT_ABS_MAX_C = 35;
/** 酷熱 (outside HK): or day max ≥ this AND ≥ normal max + HOT_REL_RISE_C. */
export const HOT_REL_MIN_C = 28;
export const HOT_REL_RISE_C = 5;
/** v15 wind / rain thresholds for model numbers (Open-Meteo, km/h and mm per day). The push server mirrors these. */
export const WX_NUM = {
  typhoon8: { gust: 118, wind: 63 },
  typhoon1: { gust: 88, wind: 50 },
  thunder: { gust: 62, code: 95 },
  blackrain: { mm: 70 },
  rainstorm: { mm: 25 },
} as const;
/** Game heat threshold for model numbers in / near HK (HKO WHOT decides when HKO data is there). */
export const HK_HOT_MAX_C = 33;

/** v15 regional names outside HK (rules identical). */
export const INTL_LABELS: Partial<Record<WeatherEventId, string>> = { hot: tl('balance.046'), typhoon1: tl('balance.065'), typhoon8: tl('balance.038'), rainstorm: tl('balance.044'), blackrain: tl('balance.042') };
/** 應急行動 names: HK / outside HK. */
export const EMERGENCY_NAMES = {
  heatWater: { hk: tl('ui.097'), intl: tl('ui.097') },
  rainDrain: { hk: tl('main.027'), intl: tl('balance.066') },
  warmCover: { hk: tl('ui.197'), intl: tl('ui.197') },
} as const;
/** Stage index (0-based, in STAGE_NAMES) from which 風災／加固／倒塌 apply: 2 = 青年樹. */
export const WIND_UNLOCK_STAGE = 2;
/** A collapse breaks part of the main trunk: height × (1 − this). */
export const COLLAPSE_HEIGHT_LOSS = 0.2;
/** Collapses a tree can take; the next one kills it (a 免死金牌 can block that death once). */
export const COLLAPSE_MAX = 2;

/* ---------- Health extremes, animals, legacy ---------- */
export const DYING_HOURS = 24;
/** Bringing W and N back into their optimal bands while 瀕死 saves the tree at this H. */
export const RESCUE_HEALTH = 10;
/** 長駐 (checked at the midnight settlement): consecutive nights at H ≥ 85 before the next species settles in (a night below resets the streak). */
export const RESIDENT_MIN_H = 85;
/** 1st and 2nd species: 5 nights each; every species after that: 10 more. The streak restarts after each arrival. */
export const RESIDENT_STREAKS = [5, 5] as const;
export const RESIDENT_STREAK_LATER = 10;
export function residentStreakNeeded(residents: number): number {
  return RESIDENT_STREAKS[residents] ?? RESIDENT_STREAK_LATER;
}
/** A night below this sends one resident species away and restarts the streak. */
export const RESIDENT_LEAVE_H = 75;

export const START = { health: 70, moisture: 60, nutrients: 50, resist: 60, heightCm: 18 } as const;
/** A tree that died becomes a 養分地標: the next tree starts with this much extra 養分. */
export const LANDMARK_N_BONUS = 40;
