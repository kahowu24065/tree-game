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
  { max: 49.999, score: -10, label: '乾旱', tone: 'dry' },
  { max: 100, score: 5, label: '適中', tone: 'ok' },
  { max: 115, score: -10, label: '輕度爛根', tone: 'rot1' },
  { max: 135, score: -20, label: '嚴重爛根', tone: 'rot2' },
  { max: Infinity, score: -30, label: '根部壞死', tone: 'rot3' },
];
/** Water that leaves the soil every night (none on a rain day). */
export const W_NIGHT_LOSS = 10;
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
export type WeatherEventId = 'clear' | 'hot' | 'cold' | 'drizzle' | 'rainstorm' | 'blackrain' | 'thunder' | 'typhoon1' | 'typhoon8';

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
  clear: { id: 'clear', label: '晴天／多雲', category: null, damage: 0, dW: 0, dR: 0, growth: 1, severe: false, tip: '日常澆水、施肥。' },
  drizzle: { id: 'drizzle', label: '毛毛雨', category: null, damage: 0, dW: 10, dR: 0, growth: 1.15, severe: false, tip: '晚上水分 +10（過 100 最多 +5），當晚唔流失，唔使澆。' },
  hot: { id: 'hot', label: '酷熱', category: 'heat', damage: 10, dW: -20, dR: 0, growth: HEAT_GROWTH, severe: true, tip: '警告一出水分即刻 −20。記得做「酷熱澆水」（額外一次，+5 水分），做咗就唔扣健康，仲有應急獎勵 +3。' },
  cold: { id: 'cold', label: '寒冷', category: 'cold', damage: COLD_DAMAGE, dW: 0, dR: 0, growth: HEAT_GROWTH, severe: true, tip: '水分唔受影響。記得做「保暖」（每日一次）：喺樹根周圍鋪一層 5–10 厘米厚嘅樹皮、乾樹葉、稻草或木屑，保持土溫，防止根部凍傷。做咗就唔扣健康，仲有應急獎勵 +3。' },
  rainstorm: { id: 'rainstorm', label: '暴雨', category: 'rain', damage: 10, dW: 20, dR: 0, growth: 0.9, severe: true, tip: '警告一出水分即刻 +20（過 100 最多 +10）。記得做「暴雨疏水」（額外一次，−10 但唔會低過 50），做咗就唔扣健康，仲有應急獎勵 +3。' },
  blackrain: { id: 'blackrain', label: '黑雨', category: 'rain', damage: 15, dW: 20, dR: 0, growth: 0.85, severe: true, tip: '同暴雨共用一次 +20，唔會再加；唔做「暴雨疏水」會扣 15 健康。' },
  typhoon1: { id: 'typhoon1', label: '初級颱風', category: 'wind', damage: 30, dW: 0, dR: -18, collapseBelow: 20, growth: 0.8, severe: true, tip: '一號／三號風球：青年樹之後，抗風力低過 20 會倒塌，提早加固。' },
  thunder: { id: 'thunder', label: '狂風雷暴', category: 'wind', damage: 35, dW: 0, dR: -25, collapseBelow: 25, growth: 0.8, severe: true, tip: '青年樹之後，抗風力低過 25 會倒塌，要提前加固樹幹。' },
  typhoon8: { id: 'typhoon8', label: '高級颱風', category: 'wind', damage: 60, dW: 0, dR: -35, collapseBelow: 40, growth: 0.6, severe: true, tip: '八號或以上：終極考驗。青年樹之後，抗風力低過 40 一定倒塌。' },
};
/** v13: severity order inside each category (last = most severe). */
export const WX_CATEGORY_ORDER: Record<WeatherCategory, WeatherEventId[]> = {
  heat: ['hot'],
  cold: ['cold'],
  rain: ['rainstorm', 'blackrain'],
  wind: ['typhoon1', 'thunder', 'typhoon8'],
};
export const WX_CATEGORY_LABEL: Record<WeatherCategory, string> = { heat: '熱', cold: '寒', rain: '雨', wind: '風' };
export const EVENT_ORDER: WeatherEventId[] = ['clear', 'drizzle', 'hot', 'cold', 'rainstorm', 'blackrain', 'typhoon1', 'thunder', 'typhoon8'];

/** Weathering a wind event (after 青年樹) with ≤ this share of its base damage (well reinforced) earns the storm bonus. */
export const STORM_SURVIVE_SHARE = 0.25;
export const STORM_SURVIVE_GROWTH = 1.3;

/* ---------- 蟲害 (hidden) ---------- */
export const PEST_DAMAGE = 15;
/** Consecutive nights of N < 30, or of 爛根 (W > 100), that trigger 蟲害. */
export const PEST_TRIGGER_DAYS = 3;
/** With ≥ 2 resident animals the trigger needs this many nights instead. */
export const PEST_TRIGGER_DAYS_GUARDED = 5;

/* ---------- Growth ---------- */
/** 健康轉化係數 H_mult by H after the night's settlement. */
export const H_MULT_TIERS: readonly { min: number; mult: number; label: string }[] = [
  { min: 80, mult: 1.5, label: '爆發生長' },
  { min: 50, mult: 1, label: '正常生長' },
  { min: 20, mult: 0.2, label: '虛弱停滯' },
  { min: 0, mult: -0.5, label: '枯萎斷枝' },
];
export const MIN_HEIGHT_CM = 5;

/** 碳吸收量 (公斤 CO₂／年) = CARBON_K × (高度 G, 米)^1.5. 20 米 ≈ 31 kg, 100 米 ≈ 350 kg. */
export const CARBON_K = 0.35;

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
/** 樹齡里程碑 (age = nights settled since planting). `perk`: the old perk badge (一級／二級／三級) it also grants. */
export const AGE_MILESTONES: readonly { id: AgeMilestoneId; days: number; label: string; perk?: 1 | 2 | 3 }[] = [
  { id: 'm30', days: 30, label: '1個月' },
  { id: 'm90', days: 90, label: '3個月', perk: 1 },
  { id: 'm182', days: 182, label: '半年', perk: 2 },
  { id: 'm365', days: 365, label: '1年', perk: 3 },
  { id: 'm730', days: 730, label: '2年' },
  { id: 'm1095', days: 1095, label: '3年' },
];
export const RECORD_MILESTONE = { id: 'record' as const, label: '超越世界紀錄' };
/** Tier by p = h/R against the expected e(t) = 1 − e^(−t/τ): 金 ≥ 0.98·e(t), 銀 ≥ 0.88·e(t), else 銅. */
export const MILESTONE_TIER_SHARE = { gold: 0.98, silver: 0.88 } as const;
export const MILESTONE_TIER_LABEL: Record<MilestoneTier, string> = { gold: '金', silver: '銀', bronze: '銅' };

/** Perk badges (kept from the season era): v14 grants them at the 3個月／半年／1年 age milestones. */
export const BADGES: Record<1 | 2 | 3, { name: string; perk: string }> = {
  1: { name: '一級徽章・新芽', perk: '以後每局：每日水分流失減少 10%' },
  2: { name: '二級徽章・雨林', perk: '以後每局：暴雨時有 30% 機率將一半水分轉為養分' },
  3: { name: '三級徽章・星空', perk: '一面免死金牌（枯死時自動救返一次）＋「星空浮島」地貌' },
};
export const T1_WATER_LOSS_MULT = 0.9;
export const T2_RAIN_TO_N_CHANCE = 0.3;
export const REVIVE_HEALTH = 30;

/* ---------- Care actions ---------- */
export const CARE = {
  /** 澆水 fills up to 泥土飽和 (100) only; at ≥ 100 it does nothing and does not use up a turn. */
  water: { amount: 15, perDay: 3 },
  drain: { amount: -10, perDay: 3 },
  fertilize: { amount: 25, perDay: 1 },
} as const;
/** 加固: each item once a day, adds to R up to the current cap. */
export const PREPS = {
  stakes: { label: '打木樁', sub: '撐住樹幹', amount: 15 },
  ropes: { label: '綁防風繩', sub: '拉住主枝', amount: 12 },
  prune: { label: '修枝防風', sub: '剪走易斷弱枝', amount: 8 },
} as const;
export type PrepId = keyof typeof PREPS;

/* ---------- 抗風力 ---------- */
/** 加固 raises R up to this cap (no resource spending). */
export const R_MAX = 100;
/** v13: the day after a collapse every 加固 item gives this many times its R. */
export const COLLAPSE_REINFORCE_MULT = 2;

/* ---------- v13 應急行動、風災、倒塌 ---------- */
export const EMERGENCY = {
  /** 酷熱澆水: once a day on top of the 3 waterings, +5 water (never past 100; at ≥ 100 still counts). */
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
/** Game heat threshold for model numbers in / near HK (HKO WHOT decides when HKO data is there). */
export const HK_HOT_MAX_C = 33;

/** v15 regional names outside HK (rules identical). */
export const INTL_LABELS: Partial<Record<WeatherEventId, string>> = { typhoon1: '烈風', typhoon8: '暴風', rainstorm: '大雨', blackrain: '豪雨' };
/** 應急行動 names: HK / outside HK. */
export const EMERGENCY_NAMES = {
  heatWater: { hk: '酷熱澆水', intl: '酷熱澆水' },
  rainDrain: { hk: '暴雨疏水', intl: '大雨疏水' },
  warmCover: { hk: '保暖', intl: '保暖' },
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
/** Nights in a row at H ≥ 90 before a new animal settles in (長駐). */
export const RESIDENT_MIN_H = 90;
export const RESIDENT_STREAK = 3;
export const RESIDENT_LEAVE_H = 70;
export const RESIDENT_N_EACH = 2;
export const RESIDENT_N_MAX = 6;

export const START = { health: 70, moisture: 60, nutrients: 50, resist: 60, heightCm: 18 } as const;
/** A tree that died becomes a 養分地標: the next tree starts with this much extra 養分. */
export const LANDMARK_N_BONUS = 40;
