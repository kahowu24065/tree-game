import type { MilestoneId, MilestoneTier, PrepId, WeatherAchievementId, WeatherEventId, WeatherTrackId } from './balance';
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
  /** v15 保暖 done today. */
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
  /** v1.4.17 每日總結: the whole day's net change (start of the day → after the night), care and weather included. */
  day?: { dH: number; dW: number; dN: number; dR: number };
}

export interface DayFlow {
  date: string;
  at: number;
  elapsed: number;
  start: { h: number; w: number; n: number; r: number };
  w: number;
  n: number;
  r: number;
  hw: number;
  hn: number;
  hp: number;
  over: number;
  /**
   * v1.4.18: the day's 健康 scores (per day), fixed at midnight from that moment's snapshot: 水分分 + 養分分 of the
   * start values, and −蟲害. Spread evenly over the 24 hours, so a
   * tier crossing mid-day does not change it. Missing = not fixed yet (set on the day's first drift).
   */
  hRate?: { w: number; n: number; p: number };
}

export interface DayRecord {
  events: WeatherEventId[];
  /** True once real HKO data was seen for this date (then HKO decides the severe events). */
  hko: boolean;
}

/** v12: instant weather water effects already applied on a date (each at most once a day). */
export interface WaterFx {
  hot: boolean;
  /** 暴雨 and 黑雨 share one application. */
  rain: boolean;
  /** 毛毛雨 +10, skipped when 暴雨／黑雨 already cover the day. */
  drizzle?: boolean;
}

export interface GameState {
  version: 2;
  started: boolean;
  treeName: string;
  /** v14 save schema (rules version): 14 once migrated to the no-season rules. Missing = older save. */
  rules?: number;
  /** Tree species (any of the 9; its 紀錄高度 R drives growth). */
  species: SpeciesId;
  /** v14 樹齡: nights settled since planting. The card shows this plus the planting day, so a new tree reads 第 1 日. */
  ageDays: number;
  /** v14 milestones this tree reached (樹齡 1個月…3年 and 超越世界紀錄). */
  milestones: Partial<Record<MilestoneId, MilestoneAward>>;
  /** Weather achievements on this tree (counts of nights the player actually handled). Missing on older saves. */
  wx?: WeatherProgress;
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
  over: null | { kind: 'dead'; date: string; tiers: (1 | 2 | 3)[]; days: number; booked?: boolean; fallSeen?: boolean };
  /** Date the tree first went above its 紀錄高度 R (R is a milestone, not a cap). */
  passedTargetOn?: string | null;
  /** 紀錄高度 R (cm) this save uses — the species' record height rounded to 10 m. */
  targetCm?: number;
  lastSettlement: Settlement | null;
  /**
   * v1.4.17 gradual day: 水分、養分、抗風力 and the W/N/蟲害 part of 健康 drift with real time instead of all at night (v1.4.18: 健康 at the day's fixed `hRate`).
   * `date` is the day being drifted, `at` the last moment applied, `elapsed` the ms of that day already applied
   * (settlement tops it up to a full day). `start` = values when the day began (for the nightly 每日總結).
   * Sums: w/n/r = drift applied today; hw/hn/hp = 健康 from 水分／養分／蟲害; over = positive 健康 drift lost to the 100 cap.
   */
  flow?: DayFlow;
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
  /**
   * v16 visual only: the latest 倒塌 — drives the one-off collapse animation (`seen`), the broken-top look (fades as the
   * tree regrows toward `heightBefore`) and the fallen log beside the tree for a few days. Never affects balance.
   */
  lastCollapse?: LastCollapse | null;
  /** Magpie-robin clutch. Missing on saves from before the nest. */
  nest?: NestState;
}

/** v16: the latest collapse, as the scene needs it. */
export interface LastCollapse {
  date: string;
  event: WeatherEventId;
  heightBefore: number;
  heightAfter: number;
  /** Collapse count after it (3 = fatal unless a 免死金牌 blocked it). */
  count: number;
  fatal: boolean;
  /** The collapse animation has been shown (played once, on the first view after the settlement). */
  seen: boolean;
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

/** Nights the player successfully weathered. A wind or rain spell that runs into the next day stays one count. */
export interface WeatherProgress {
  /** Last date the counts were applied to (a night is counted once). */
  date: string;
  counts: Record<WeatherTrackId, number>;
  /** Last date a wind / heavy-rain spell was in force, and whether this spell already added a count. */
  spell: { wind: string; rain: string; windCounted: boolean; t8Counted: boolean; rainCounted: boolean };
  awards: Partial<Record<WeatherAchievementId, WeatherAward>>;
}

/** One weather achievement reached by one tree. */
export interface WeatherAward {
  id: WeatherAchievementId;
  date: string;
  ageDays: number;
  /** Copied into meta already. */
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
  /** Weather achievements from every tree. */
  weather: MetaWeather[];
  /** Island achievements (second island after a world record). */
  isle: IsleAward[];
  /** Hatched-egg achievements from every tree. */
  nest?: MetaNest[];
}

/** Kept after visiting or planting on the second island. */
export interface IsleAward {
  id: 'land' | 'plant' | 'record';
  date: string;
  treeName: string;
  species: SpeciesId;
}

/** One hatched-egg achievement kept across trees. */
export interface MetaNest {
  count: number;
  treeName: string;
  species: SpeciesId;
  date: string;
  ageDays: number;
}

/** Bird eggs on this tree. One unlocked species lays each day, and the egg hatches 6 hours later. */
export interface NestState {
  /** Eggs hatched on this tree (the settlement after each hatch). */
  hatched: number;
  awards: NestAward[];
  /** The clutch, until the settlement after it hatches. */
  egg: NestEgg | null;
  /** Calendar date the current clutch was laid, so a day only has one species. */
  laidOn: string;
}

export interface NestAward {
  count: number;
  date: string;
  ageDays: number;
  booked?: boolean;
}

export interface NestEgg {
  /** Which bird laid it. */
  bird: string;
  laidAt: number;
  /** Set once `laidAt` plus 6 hours has passed. Null while it is still an egg. */
  hatchedAt: number | null;
}

/** Weather achievement kept across trees. */
export interface MetaWeather {
  id: WeatherAchievementId;
  treeName: string;
  species: SpeciesId;
  date: string;
  ageDays: number;
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
export type TabId = 'care' | 'album' | 'milestones' | 'achievements';
export type LocationSource = 'geo' | 'fallback' | 'manual';
