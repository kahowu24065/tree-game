export interface Care {
  date: string;
  watered: boolean;
  fertilized: boolean;
  dewormed: boolean;
  pruned: boolean;
  growthCm: number;
  credited: boolean;
}

export interface Reinforcement {
  stakes: boolean;
  ropes: boolean;
  prune: boolean;
}

export type StormKind = 'heavy-rain' | 'gale' | 'typhoon';
export type StormOutcome = 'safe' | 'partial' | 'hit';

export interface Storm {
  date: string;
  kind: StormKind;
  rainMm: number;
  windKmh: number;
  gustKmh: number;
  resolved: boolean;
  outcome?: StormOutcome;
  debug: boolean;
  /** Set when a real Hong Kong Observatory signal drives this storm. */
  official?: { code: string; name: string; short: string };
  /** TC1 heads-up for tomorrow: only becomes a real storm if a stronger signal follows. */
  provisional?: boolean;
}

export type LogKind =
  | 'plant'
  | 'water'
  | 'fertilize'
  | 'deworm'
  | 'prune'
  | 'reinforce'
  | 'animal'
  | 'stage'
  | 'storm-safe'
  | 'storm-partial'
  | 'storm-hit'
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

export interface GameState {
  version: 1;
  started: boolean;
  treeName: string;
  createdOn: string;
  lastSeenDate: string;
  virtualToday: string | null;
  health: number;
  heightCm: number;
  moisture: number;
  nutrients: number;
  pests: number;
  scars: number;
  care: Care;
  reinforcement: Reinforcement;
  storms: Storm[];
  animals: string[];
  seenAnimals: string[];
  log: LogEntry[];
  daysCared: number;
  stormSurvivals: number;
  dailyEventDate: string;
  dailyEventId: string;
  eventBonus: number;
  morningNote: string | null;
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

export type SceneOverride = 'clear' | 'rain' | 'heat' | 'heavyrain' | 'gale' | 'typhoon';
export type TimeMode = 'auto' | 'day' | 'night';
export type TabId = 'care' | 'forecast' | 'album' | 'milestones';
export type LocationSource = 'geo' | 'fallback' | 'manual';
