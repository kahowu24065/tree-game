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
  | 'grow';

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
  wFactor: number;
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
}

export interface DayRecord {
  events: WeatherEventId[];
  /** True once real HKO data was seen for this date (then HKO decides the severe events). */
  hko: boolean;
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
  lastSettlement: Settlement | null;
  /** Starting 養分 bonus this tree got from a previous tree's 養分地標. */
  legacyBonus: number;
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
