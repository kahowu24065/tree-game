/**
 * 《世界之樹》數值表 — every tunable number of the rules lives here.
 * Formulas that use them are in rules.ts; see README「遊戲規則」for the plain-language version.
 */

/* ---------- Core stats (all 0-100) ---------- */
/** 水分 W optimal band: below = 乾旱, above = 水浸爛根. */
export const W_OPTIMAL: readonly [number, number] = [40, 80];
/** 養分 N optimal band ("充足"). */
export const N_OPTIMAL: readonly [number, number] = [60, 100];
/** 養分 below this = 營養不良. 30-59 counts as neither (N_factor 0). */
export const N_MALNOURISHED = 30;

/** Daily H formula: H_new = H_old + W_factor + N_factor − final weather damage − pest damage. */
export const W_FACTOR = { good: 5, bad: -10 } as const;
export const N_FACTOR = { good: 5, mid: 0, bad: -10 } as const;

/** The tree uses up this much 養分 every night. */
export const N_DAILY_USE = 10;
/** Ropes loosen: 抗風力 R drops this much every night on top of any weather consumption. */
export const R_DAILY_DECAY = 2;

/* ---------- Weather events ---------- */
export type WeatherEventId = 'clear' | 'hot' | 'drizzle' | 'rainstorm' | 'blackrain' | 'thunder' | 'typhoon1' | 'typhoon8';

export interface WeatherEventDef {
  id: WeatherEventId;
  label: string;
  /** 天氣基礎傷害 to H (before 抗風力 reduction). */
  damage: number;
  /** Side effect on 水分 W. */
  dW: number;
  /** Side effect on 抗風力 R (consumption, ≤ 0). */
  dR: number;
  /** 天氣獎勵加成 for ΔG. */
  growth: number;
  /** Shown in the 12-hour countdown. */
  severe: boolean;
  tip: string;
}

/**
 * 天氣與災害權重表. Order matters only for ties in 基礎傷害 (later = heavier side effects wins).
 * 初級颱風 (一號／三號風球) is exactly half of 高級颱風 (八號或以上).
 */
export const WEATHER_EVENTS: Record<WeatherEventId, WeatherEventDef> = {
  clear: { id: 'clear', label: '晴天／多雲', damage: 0, dW: -15, dR: 0, growth: 1, severe: false, tip: '日常澆水、施肥。' },
  drizzle: { id: 'drizzle', label: '毛毛雨', damage: 0, dW: 20, dR: 0, growth: 1.15, severe: false, tip: '暫停澆水，節省操作。' },
  hot: { id: 'hot', label: '酷熱', damage: 10, dW: -40, dR: 0, growth: 0.9, severe: true, tip: '需頻繁澆水防乾旱。' },
  rainstorm: { id: 'rainstorm', label: '暴雨', damage: 20, dW: 60, dR: 0, growth: 0.9, severe: true, tip: '視情況疏水，輕度加固。' },
  blackrain: { id: 'blackrain', label: '黑雨', damage: 20, dW: 60, dR: 0, growth: 0.85, severe: true, tip: '預早疏水，輕度加固。' },
  typhoon1: { id: 'typhoon1', label: '初級颱風', damage: 30, dW: 0, dR: -40, growth: 0.8, severe: true, tip: '一號／三號風球：提早加固。' },
  thunder: { id: 'thunder', label: '狂風雷暴', damage: 35, dW: 0, dR: -30, growth: 0.8, severe: true, tip: '需提前加固樹幹。' },
  typhoon8: { id: 'typhoon8', label: '高級颱風', damage: 60, dW: 0, dR: -80, growth: 0.6, severe: true, tip: '八號或以上：終極考驗，需推高 R 值。' },
};
export const EVENT_ORDER: WeatherEventId[] = ['clear', 'drizzle', 'hot', 'rainstorm', 'blackrain', 'typhoon1', 'thunder', 'typhoon8'];

/** Weathering a damaging event with ≤ this share of its base damage (well reinforced) earns the storm bonus. */
export const STORM_SURVIVE_SHARE = 0.25;
export const STORM_SURVIVE_GROWTH = 1.3;

/* ---------- 蟲害 (hidden) ---------- */
export const PEST_DAMAGE = 15;
/** Consecutive nights of N < 30, or of 水浸 (W > 80), that trigger 蟲害. */
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

/* ---------- Seasons & badges ---------- */
export type SeasonId = 's3' | 's6' | 's12';
export interface SeasonDef {
  id: SeasonId;
  label: string;
  sub: string;
  days: number;
  targetCm: number;
  tier: 1 | 2 | 3;
}
export const SEASONS: SeasonDef[] = [
  { id: 's3', label: '3 個月・速成局', sub: '目標約 20 米，解鎖一級徽章', days: 90, targetCm: 2000, tier: 1 },
  { id: 's6', label: '6 個月・標準局', sub: '目標約 50 米，解鎖二級徽章', days: 180, targetCm: 5000, tier: 2 },
  { id: 's12', label: '1 年・史詩局', sub: '目標 100 米以上，解鎖三級徽章', days: 365, targetCm: 10000, tier: 3 },
];
/** Tier N badge needs this many days survived (used for completion and the fail-safe). */
export const TIER_DAYS: Record<1 | 2 | 3, number> = { 1: 90, 2: 180, 3: 365 };
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
  water: { amount: 20, perDay: 3 },
  drain: { amount: -25, perDay: 2 },
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
/** 加固 raises R up to this cap (no resource spending: each season already has a fixed target height). */
export const R_MAX = 100;

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

export const START = { health: 70, moisture: 60, nutrients: 50, resist: 10, heightCm: 18 } as const;
/** A tree that died becomes a 養分地標: the next tree starts with this much extra 養分. */
export const LANDMARK_N_BONUS = 40;
