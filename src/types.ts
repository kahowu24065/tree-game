import type { PrepId, SeasonId, WeatherEventId } from './balance';
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
  season: SeasonId;
  /** Tree species (3 per season). */
  species: SpeciesId;
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
  over: null | { kind: 'dead' | 'complete'; date: string; tiers: (1 | 2 | 3)[]; days: number; booked?: boolean };
  /** Season finished (badges earned) — the tree keeps growing afterwards; there is no height cap. */
  completed?: null | { date: string; tiers: (1 | 2 | 3)[]; days: number; heightCm: number; booked?: boolean };
  /** Date the tree first passed the season's target height (the target is a goal, not a cap). */
  passedTargetOn?: string | null;
  /** v8: the target (cm) this save was last checked against — the species' record height rounded to 10 m. */
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

/** Progress kept across games (badges, legacy). */
export interface MetaState {
  version: 1;
  badges: Record<'1' | '2' | '3', number>;
  reviveTokens: number;
  starry: boolean;
  landmark: { name: string; heightCm: number; date: string } | null;
  pendingLegacy: boolean;
  history: { name: string; season: SeasonId; days: number; heightCm: number; result: 'dead' | 'complete'; date: string }[];
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
  raining: boolean;
  stormKind: StormKind | null;
}

export type TimeMode = 'auto' | 'day' | 'night';
export type TabId = 'care' | 'forecast' | 'album' | 'milestones';
export type LocationSource = 'geo' | 'fallback' | 'manual';
