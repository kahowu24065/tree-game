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
]));

/** 1.4.70: which daily vignettes fit today's weather / tree state. */
export function dailyEventAllowed(
  id: string,
  ctx: { pestActive: boolean; rainy: boolean },
): boolean {
  if (id === 'aphids') return ctx.pestActive;
  // Rainy day: no dry wind, sunbeams, morning mist, outdoor drawing, or napping cat.
  if (ctx.rainy && (id === 'sunbeam' || id === 'drywind' || id === 'mist' || id === 'drawing' || id === 'cat')) {
    return false;
  }
  return true;
}

export type DailyEventPickCtx = {
  date: string;
  treeName: string;
  pestActive: boolean;
  rainy: boolean;
};

/**
 * 1.4.70: random per player (treeName) per day, then re-pick from the allowed set.
 * Fallback pool if everything is filtered: quiet / birds / compost / leaves.
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
  return pickDailyEvent({ date, treeName, pestActive: false, rainy: false });
}

export function eventById(id: string): DailyEvent {
  return EVENTS.find((e) => e.id === id) ?? EVENTS[9]!;
}
