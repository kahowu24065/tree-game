import type { MilestoneId, MilestoneTier, PrepId, WeatherEventId } from './balance';
import type { SpeciesId } from './data/species';

export interface Care {
  date: string;
  /** Times watered / drained today. */
  water: number;
  drain: number;
  fertilize: number;
  dewormed: boolean;
  preps: Record<PrepId, boolean>;
  credited: boolean;
  /** v13 應急行動 done today (each once a day, on top of the normal limits). */
  heatWater?: boolean;
  rainDrain?: boolean;
  /** v15 保暖覆蓋 done today. */
  warmCover?: boolean;
}

/** Visual reinforcement shown on the 3D tree (derived from 抗風力 R). */
export interface Reinforcement {
  stakes: boolean;
  ropes: boolean;
  prune: boolean;
}

export type StormKind = 'heavy-rain' | 'gale' | 'typhoon';

export type LogKind =
  | 'plant'
  | 'water'
  | 'fertilize'
  | 'deworm'
  | 'drain'
  | 'reinforce'
  | 'animal'
  | 'stage'
  | 'settle'
  | 'storm-safe'
  | 'storm-hit'
  | 'pest'
  | 'dying'
  | 'badge'
  | 'event'
  | 'grow'
  | 'emergency'
  | 'collapse'
  | 'unlock';

export type RewardTone = 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'gray';

export interface LogReward {
  text: string;
  tone: RewardTone;
}

export interface LogEntry {
  date: string;
  text: string;
  /** HH:MM local clock when recorded; empty for entries settled during catch-up. */
  time?: string;
  kind?: LogKind;
  title?: string;
  reward?: LogReward;
}

/** Full breakdown of one nightly settlement (shown in the log and the developer panel). */
export interface Settlement {
  date: string;
  events: WeatherEventId[];
  event: WeatherEventId;
  hBefore: number;
  hAfter: number;
  wBefore: number;
  wAfter: number;
  nBefore: number;
  nAfter: number;
  rBefore: number;
  rAfter: number;
  /** v12 水分分數 (by W after the night's water change) and its tier label. */
  wFactor: number;
  wLabel?: string;
  /** v12: the night's water change (natural loss, drizzle, or none on a rain day). */
  wNight?: { kind: 'loss' | 'drizzle' | 'rain'; delta: number };
  nFactor: number;
  baseDamage: number;
  finalDamage: number;
  pestDamage: number;
  hMult: number;
  weatherBonus: number;
  baseGrowth: number;
  deltaG: number;
  heightAfter: number;
  carbonKg: number;
  notes: string[];
  /** v13 per-category weather scores (≤ 0) and the 應急獎勵. */
  heat?: { event: WeatherEventId; base: number; handled: boolean; score: number } | null;
  /** v15 寒. */
  cold?: { event: WeatherEventId; base: number; handled: boolean; score: number } | null;
  rain?: { event: WeatherEventId; base: number; handled: boolean; score: number } | null;
  wind?: { event: WeatherEventId; base: number; locked: boolean; score: number; r: number } | null;
  emergencyBonus?: number;
  emergencyCount?: number;
  /** v13 倒塌 this night (count after it). */
  collapse?: { event: WeatherEventId; threshold: number; count: number; heightBefore: number; heightAfter: number; fatal: boolean; revived: boolean } | null;
}

export interface DayRecord {
  events: WeatherEventId[];
  /** True once real HKO data was seen for this date (then HKO decides the severe events). */
  hko: boolean;
}

/** v12: instant weather-warning water effects already applied on a date (each at most once a day). */
export interface WaterFx {
  hot: boolean;
  /** 暴雨 and 黑雨 share one application. */
  rain: boolean;
}

export interface GameState {
  version: 2;
  started: boolean;
  treeName: string;
  /** v14 save schema (rules version): 14 once migrated to the no-season rules. Missing = older save. */
  rules?: number;
  /** Tree species (any of the 9; its 紀錄高度 R drives growth). */
  species: SpeciesId;
  /** v14 樹齡: nights settled since planting (restarts with a new tree). */
  ageDays: number;
  /** v14 milestones this tree reached (樹齡 1個月…3年 and 超越世界紀錄). */
  milestones: Partial<Record<MilestoneId, MilestoneAward>>;
  createdOn: string;
  lastSeenDate: string;
  virtualToday: string | null;
  health: number;
  moisture: number;
  nutrients: number;
  /** 抗風力 R. */
  resist: number;
  heightCm: number;
  pest: { active: boolean; lowNDays: number; wetDays: number; since: string | null };
  care: Care;
  dayEvents: Record<string, DayRecord>;
  /** v12: per date, which instant warning effects (酷熱 −20, 暴雨／黑雨 +20) have been applied. */
  waterFx: Record<string, WaterFx>;
  animals: string[];
  seenAnimals: string[];
  residents: string[];
  highStreak: number;
  scars: number;
  log: LogEntry[];
  daysCared: number;
  stormSurvivals: number;
  dailyEventDate: string;
  dailyEventId: string;
  eventBonus: number;
  morningNote: string | null;
  dying: { since: string; at: number } | null;
  /** The tree died (v14: the only way a game ends). `tiers` is kept for old saves; v14 books perks at milestones. */
  over: null | { kind: 'dead'; date: string; tiers: (1 | 2 | 3)[]; days: number; booked?: boolean };
  /** Date the tree first went above its 紀錄高度 R (R is a milestone, not a cap). */
  passedTargetOn?: string | null;
  /** 紀錄高度 R (cm) this save uses — the species' record height rounded to 10 m. */
  targetCm?: number;
  lastSettlement: Settlement | null;
  /** Starting 養分 bonus this tree got from a previous tree's 養分地標. */
  legacyBonus: number;
  /** v13: 風災／加固／倒塌 switched on — set the first time the tree reaches 青年樹, never cleared. */
  windUnlocked: boolean;
  /** v13: the 青年樹 explainer card has been dismissed (shown once). */
  windExplained: boolean;
  /** v13: collapses so far (2 max; the 3rd kills unless a 免死金牌 blocks it; never reset). */
  collapses: number;
  /** v13: a collapse happened — the next care date gets double 加固. Cleared when that day starts. */
  doubleRPending: boolean;
  /** v13: the date on which 加固 gives double R (the first care date after a collapse). */
  doubleRDate: string | null;
  /** v13: the double-加固 banner has been dismissed for doubleRDate. */
  doubleRSeen: boolean;
}

/** v14: one milestone reached by one tree. */
export interface MilestoneAward {
  id: MilestoneId;
  /** 金／銀／銅 for age milestones; null for 超越世界紀錄. */
  tier: MilestoneTier | null;
  date: string;
  ageDays: number;
  heightCm: number;
  /** h / R when reached. */
  share: number;
  /** Awarded by the v14 save migration (the tree had already passed that age). */
  retro?: boolean;
  /** Old perk badge (一級／二級／三級) this award grants when booked (none if the old season already gave it). */
  perk?: 1 | 2 | 3;
  /** Copied into meta (collection, perks) already. */
  booked?: boolean;
}

/** v14 collection entry (kept across trees). */
export interface MetaMilestone {
  id: MilestoneId;
  tier: MilestoneTier | null;
  treeName: string;
  species: SpeciesId;
  date: string;
  heightCm: number;
  ageDays: number;
}

/** Progress kept across games (badges, legacy). */
export interface MetaState {
  version: 1;
  badges: Record<'1' | '2' | '3', number>;
  reviveTokens: number;
  starry: boolean;
  landmark: { name: string; heightCm: number; date: string } | null;
  pendingLegacy: boolean;
  history: { name: string; season?: string; species?: SpeciesId; days: number; heightCm: number; result: 'dead' | 'complete'; date: string }[];
  /** v14 milestone badges from every tree (樹齡里程碑 and 超越世界紀錄). */
  milestones: MetaMilestone[];
}

export interface ForecastDay {
  date: string;
  code: number;
  tempMax: number;
  tempMin: number;
  precipMm: number;
  precipProb: number;
  windKmh: number;
  gustKmh: number;
  sunrise: string;
  sunset: string;
  /** HKO weather icon (50-93) when the Observatory covers this day; wins over `code` for display. */
  hkoIcon?: number;
  /** v15: outside HK / near-HK (local-relative heat & cold rules apply). Absent = HK rules. */
  intl?: boolean;
  /** v15 local normals: average daily min / max over the past 14 days (Open-Meteo past_days). */
  normMin?: number | null;
  normMax?: number | null;
}

export interface CurrentWeather {
  tempC: number;
  humidity: number;
  precipMm: number;
  code: number;
  windKmh: number;
  gustKmh: number;
  isDay: boolean;
  time: string;
}

export interface DayCond {
  code: number;
  tempC: number;
  tempMax: number;
  precipMm: number;
  windKmh: number;
  gustKmh: number;
  hot: boolean;
  /** v15 寒冷 in force (frosty scene tint). */
  cold?: boolean;
  raining: boolean;
  stormKind: StormKind | null;
}

export type TimeMode = 'auto' | 'day' | 'night';
export type TabId = 'care' | 'forecast' | 'album' | 'milestones';
export type LocationSource = 'geo' | 'fallback' | 'manual';
