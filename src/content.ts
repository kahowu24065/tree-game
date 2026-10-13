import type { GameState, LogReward } from './types';
import { clamp, hashString, mulberry32 } from './util';

import { STAGE_NAMES, STAGE_SHARES } from './data/species';
import { t as tl, live } from './i18n';
export { ANIMALS, animalById, type AnimalDef } from './data/animals';

export interface StageDef {
  id: string;
  name: string;
  index: number;
  minCm: number;
  nextCm: number;
  reach0: number;
  reach1: number;
  depth: number;
  trunk: number;
  roots: boolean;
}

const STAGE_LOOK = [
  { id: 'seedling', reach0: 0.2, reach1: 0.3, depth: 0, trunk: 4, roots: false },
  { id: 'sapling', reach0: 0.34, reach1: 0.46, depth: 3, trunk: 9, roots: false },
  { id: 'young', reach0: 0.48, reach1: 0.58, depth: 4, trunk: 14, roots: false },
  { id: 'mature', reach0: 0.62, reach1: 0.72, depth: 5, trunk: 24, roots: true },
  { id: 'giant', reach0: 0.8, reach1: 0.9, depth: 6, trunk: 40, roots: true },
] as const;

/** Five growth stages (幼苗、小樹、青年樹、成年樹、巨樹), scaled to the season's target height. */
export function stagesFor(targetCm = 2000): StageDef[] {
  return STAGE_LOOK.map((look, i) => ({
    ...look,
    name: STAGE_NAMES[i]!,
    index: i,
    minCm: Math.round(STAGE_SHARES[i]! * targetCm),
    nextCm: Math.round(i < 4 ? STAGE_SHARES[i + 1]! * targetCm : targetCm),
  }));
}

export function stageFor(heightCm: number, targetCm = 2000): StageDef {
  const stages = stagesFor(targetCm);
  let current = stages[0]!;
  for (const stage of stages) if (heightCm >= stage.minCm) current = stage;
  return current;
}

export function stageIndex(heightCm: number, targetCm = 2000): number {
  return stageFor(heightCm, targetCm).index;
}

export function stageProgress(heightCm: number, targetCm = 2000): number {
  const stage = stageFor(heightCm, targetCm);
  const span = stage.nextCm - stage.minCm;
  if (span <= 0) return 1;
  return clamp((heightCm - stage.minCm) / span, 0, 1);
}

export const SHERMAN_M = 83.8;
export const HYPERION_M = 116.2;

export interface Milestone {
  meters: number;
  title: string;
  detail: string;
}

export const MILESTONES: Milestone[] = live(() => ([
  { meters: 0.5, title: tl('content.001'), detail: tl('content.002') },
  { meters: 1.7, title: tl('content.003'), detail: tl('content.004') },
  { meters: 5, title: tl('content.005'), detail: tl('content.006') },
  { meters: 12, title: tl('content.007'), detail: tl('content.008') },
  { meters: 44, title: tl('content.009'), detail: tl('content.010') },
  { meters: SHERMAN_M, title: tl('content.011'), detail: tl('content.012') },
  { meters: HYPERION_M, title: tl('content.013'), detail: tl('content.014') },
]));

export interface DailyEvent {
  id: string;
  title: string;
  text: string;
  chip?: LogReward;
  apply: (state: GameState) => void;
}

export const EVENTS: DailyEvent[] = live(() => ([
  {
    id: 'mist',
    chip: { text: tl('content.015'), tone: 'blue' },
    title: tl('content.016'),
    text: tl('content.017'),
    apply: (s) => {
      // Mist tops up to 泥土飽和 (100) at most; it never lowers a wetter soil.
      if (s.moisture < 100) s.moisture = Math.min(100, s.moisture + 6);
    },
  },
  {
    id: 'compost',
    chip: { text: tl('content.018'), tone: 'green' },
    title: tl('content.019'),
    text: tl('content.020'),
    apply: (s) => {
      s.nutrients = Math.min(100, s.nutrients + 16);
    },
  },
  {
    id: 'birds',
    chip: { text: tl('content.021'), tone: 'green' },
    title: tl('content.022'),
    text: tl('content.023'),
    apply: (s) => {
      s.health = Math.min(100, s.health + 2);
    },
  },
  {
    id: 'drywind',
    chip: { text: tl('content.024'), tone: 'red' },
    title: tl('content.025'),
    text: tl('content.026'),
    apply: (s) => {
      s.moisture = Math.max(0, s.moisture - 10);
    },
  },
  {
    id: 'leaves',
    chip: { text: tl('content.027'), tone: 'green' },
    title: tl('content.028'),
    text: tl('content.029'),
    apply: (s) => {
      s.nutrients = Math.min(100, s.nutrients + 8);
    },
  },
  {
    id: 'drawing',
    chip: { text: tl('content.030'), tone: 'green' },
    title: tl('content.031'),
    text: tl('content.032'),
    apply: (s) => {
      s.health = Math.min(100, s.health + 3);
    },
  },
  {
    id: 'aphids',
    chip: { text: tl('content.033'), tone: 'red' },
    title: tl('content.034'),
    text: tl('content.035'),
    apply: (s) => {
      // 1.4.70: vignette only picked when pests already active — slight extra stress, no new outbreak.
      if (s.pest.active) s.health = Math.max(0, s.health - 2);
    },
  },
  {
    id: 'sunbeam',
    chip: { text: tl('content.036'), tone: 'blue' },
    title: tl('content.037'),
    text: tl('content.038'),
    apply: (s) => {
      s.eventBonus = 1.15;
    },
  },
  {
    id: 'cat',
    title: tl('content.039'),
    text: tl('content.040'),
    apply: () => {},
  },
  {
    id: 'quiet',
    title: tl('content.041'),
    text: tl('content.042'),
    apply: () => {},
  },
  {
    id: 'puddle-mirror',
    title: tl('content.043'),
    text: tl('content.044'),
    apply: () => {},
  },
  {
    id: 'petrichor',
    title: tl('content.045'),
    text: tl('content.046'),
    apply: (s) => { s.nutrients = Math.min(100, s.nutrients + 4); },
  },
  {
    id: 'snails',
    title: tl('content.047'),
    text: tl('content.048'),
    apply: () => {},
  },
  {
    id: 'leaf-drip',
    title: tl('content.049'),
    text: tl('content.050'),
    apply: (s) => { if (s.moisture < 100) s.moisture = Math.min(100, s.moisture + 3); },
  },
  {
    id: 'rain-patter',
    title: tl('content.051'),
    text: tl('content.052'),
    apply: () => {},
  },
  {
    id: 'butterfly',
    chip: { text: tl('content.053'), tone: 'green' },
    title: tl('content.054'),
    text: tl('content.055'),
    apply: (s) => { s.health = Math.min(100, s.health + 1); },
  },
  {
    id: 'warm-grass',
    title: tl('content.056'),
    text: tl('content.057'),
    apply: () => {},
  },
  {
    id: 'bird-song',
    chip: { text: tl('content.058'), tone: 'green' },
    title: tl('content.059'),
    text: tl('content.060'),
    apply: (s) => { s.health = Math.min(100, s.health + 2); },
  },
  {
    id: 'leaf-shadow',
    title: tl('content.061'),
    text: tl('content.062'),
    apply: () => {},
  },
  {
    id: 'cicada-hum',
    title: tl('content.063'),
    text: tl('content.064'),
    apply: () => {},
  },
  {
    id: 'tumble-leaf',
    title: tl('content.065'),
    text: tl('content.066'),
    apply: () => {},
  },
  {
    id: 'rustle',
    title: tl('content.067'),
    text: tl('content.068'),
    apply: () => {},
  },
  {
    id: 'grass-wave',
    title: tl('content.069'),
    text: tl('content.070'),
    apply: () => {},
  },
  {
    id: 'seed-fluff',
    title: tl('content.071'),
    text: tl('content.072'),
    apply: () => {},
  },
  {
    id: 'animal-shade',
    chip: { text: tl('content.073'), tone: 'orange' },
    title: tl('content.074'),
    text: tl('content.075'),
    apply: (s) => { s.health = Math.min(100, s.health + 2); },
  },
  {
    id: 'hot-stones',
    title: tl('content.076'),
    text: tl('content.077'),
    apply: () => {},
  },
  {
    id: 'animal-hide',
    title: tl('content.078'),
    text: tl('content.079'),
    apply: () => {},
  },
  {
    id: 'heavy-sway',
    chip: { text: tl('content.080'), tone: 'red' },
    title: tl('content.081'),
    text: tl('content.082'),
    apply: (s) => { s.moisture = Math.max(0, s.moisture - 4); },
  },
  {
    id: 'nest-hold',
    title: tl('content.083'),
    text: tl('content.084'),
    apply: () => {},
  },
  {
    id: 'crisp-air',
    chip: { text: tl('content.085'), tone: 'blue' },
    title: tl('content.086'),
    text: tl('content.087'),
    apply: (s) => { s.health = Math.min(100, s.health + 1); },
  },
  {
    id: 'ember-warmth',
    chip: { text: tl('content.088'), tone: 'blue' },
    title: tl('content.089'),
    text: tl('content.090'),
    apply: (s) => { s.nutrients = Math.min(100, s.nutrients + 6); },
  },
]));

/** 1.4.70/1.4.71: weather / state gates for daily vignettes. */
export type DailyEventPickCtx = {
  date: string;
  treeName: string;
  pestActive: boolean;
  rainy: boolean;
  windy: boolean;
  hot: boolean;
  cold: boolean;
  typhoon: boolean;
};

const RAIN_BLOCKED = new Set(['sunbeam', 'drywind', 'mist', 'drawing', 'cat']);
const RAIN_ONLY = new Set(['puddle-mirror', 'petrichor', 'snails', 'leaf-drip', 'rain-patter']);
const CLEAR_OK = new Set(['butterfly', 'warm-grass', 'bird-song', 'leaf-shadow']); // also need !rainy !typhoon
const CLEAR_HOT = new Set(['cicada-hum']);
const WINDY_ONLY = new Set(['tumble-leaf', 'rustle', 'grass-wave', 'seed-fluff']);
const HOT_ONLY = new Set(['animal-shade', 'hot-stones']);
const TYPHOON_ONLY = new Set(['animal-hide', 'heavy-sway', 'nest-hold']);
const COOL_OK = new Set(['crisp-air', 'ember-warmth']);

export function dailyEventAllowed(id: string, ctx: Omit<DailyEventPickCtx, 'date' | 'treeName'>): boolean {
  if (id === 'aphids') return ctx.pestActive;
  if (RAIN_BLOCKED.has(id) && (ctx.rainy || ctx.typhoon)) return false;
  if (RAIN_ONLY.has(id)) return ctx.rainy;
  if (CLEAR_OK.has(id)) return !ctx.rainy && !ctx.typhoon;
  if (CLEAR_HOT.has(id)) return !ctx.rainy && !ctx.typhoon && (ctx.hot || (!ctx.cold && !ctx.windy));
  if (WINDY_ONLY.has(id)) return ctx.windy && !ctx.rainy;
  if (HOT_ONLY.has(id)) return ctx.hot && !ctx.rainy;
  if (TYPHOON_ONLY.has(id)) return ctx.typhoon;
  if (COOL_OK.has(id)) return (ctx.cold || (!ctx.hot && !ctx.rainy && !ctx.typhoon)) && !ctx.rainy;
  return true;
}

/**
 * 1.4.70/1.4.71: random per player (treeName) per day among the allowed set.
 * Fallback: quiet (and a few gentle anytime ids).
 */
export function pickDailyEvent(ctx: DailyEventPickCtx): DailyEvent {
  const allowed = EVENTS.filter((e) => dailyEventAllowed(e.id, ctx));
  const pool =
    allowed.length > 0
      ? allowed
      : EVENTS.filter((e) => e.id === 'quiet' || e.id === 'birds' || e.id === 'compost' || e.id === 'leaves');
  const safe = pool.length > 0 ? pool : [EVENTS.find((e) => e.id === 'quiet')!];
  const rng = mulberry32(hashString(`${ctx.date}|${ctx.treeName}|vignette`));
  const idx = Math.floor(rng() * safe.length) % safe.length;
  return safe[idx]!;
}

/** Deterministic date-only pick (no weather/pest filters) — prefer pickDailyEvent. */
export function eventForDate(date: string, treeName = ''): DailyEvent {
  return pickDailyEvent({
    date,
    treeName,
    pestActive: false,
    rainy: false,
    windy: false,
    hot: false,
    cold: false,
    typhoon: false,
  });
}

export function eventById(id: string): DailyEvent {
  return EVENTS.find((e) => e.id === id) ?? EVENTS.find((e) => e.id === 'quiet')!;
}
