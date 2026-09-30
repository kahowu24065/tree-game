/** Bird eggs. Pure state changes; the night log is written by the settlement. */
import { ANIMALS, animalById } from './data/animals';
import type { GameState, NestState } from './types';

export const NEST_HATCH_MS = 6 * 3600_000;
/** A struggling tree does not get a clutch. */
export const NEST_MIN_HEALTH = 50;
const AWARD_STEPS = [1, 5, 15, 20, 25, 30] as const;

export function freshNest(): NestState {
  return { hatched: 0, awards: [], egg: null, laidOn: '' };
}

export function isNestAwardCount(n: number): boolean {
  if (n < 1) return false;
  if ((AWARD_STEPS as readonly number[]).includes(n)) return true;
  return n > 30 && n % 5 === 0;
}

export function nextNestAwardCount(n: number): number {
  const step = AWARD_STEPS.find((c) => c > n);
  if (step) return step;
  return Math.floor(n / 5) * 5 + 5;
}

export function nestAwardTitle(n: number): string {
  return `孵化咗第 ${n} 粒蛋`;
}

export type NestPhase = 'empty' | 'egg' | 'chick';

export function nestPhase(nest: NestState | undefined): NestPhase {
  if (!nest?.egg) return 'empty';
  return nest.egg.hatchedAt != null ? 'chick' : 'egg';
}

export function nestBirdName(id: string): string {
  return animalById(id)?.name ?? '雀鳥';
}

/** Unlocked birds, in encyclopedia order. */
export function nestCandidates(state: GameState): string[] {
  return ANIMALS.filter((a) => a.category === 'bird' && state.animals.includes(a.id)).map((a) => a.id);
}

/** Same date always picks the same species. One species for that day. */
export function pickNestBird(ids: readonly string[], date: string): string | null {
  if (!ids.length) return null;
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 33 + date.charCodeAt(i)) >>> 0;
  return ids[h % ids.length] ?? null;
}

export function nestEligible(state: GameState): boolean {
  return Boolean(state.started && !state.over && state.health >= NEST_MIN_HEALTH && nestCandidates(state).length);
}

/** Hatch a due egg, and lay today's one species when the tree is ready. Does not pay the night's reward. */
export function tickNest(state: GameState, now: number, date: string): { laid: boolean; hatched: boolean } {
  const none = { laid: false, hatched: false };
  if (!state.started || state.over) return none;
  const nest = (state.nest ??= freshNest());
  nest.laidOn ??= '';
  let hatched = false;
  if (nest.egg && nest.egg.hatchedAt == null && now >= nest.egg.laidAt + NEST_HATCH_MS) {
    nest.egg.hatchedAt = nest.egg.laidAt + NEST_HATCH_MS;
    hatched = true;
  }
  if (!nestEligible(state) || nest.egg || nest.laidOn === date) return { laid: false, hatched };
  const bird = pickNestBird(nestCandidates(state), date);
  if (!bird) return { laid: false, hatched };
  nest.egg = { bird, laidAt: now, hatchedAt: null };
  nest.laidOn = date;
  return { laid: true, hatched };
}

/** Island decoration earned on the 1st hatch and every 10th after that. */
export const NEST_BUILDS = ['windmill', 'statue', 'house', 'pavilion'] as const;
export type NestBuildKind = (typeof NEST_BUILDS)[number];

export const NEST_BUILD_LABEL: Record<NestBuildKind, string> = {
  windmill: '風車',
  statue: '銅像',
  house: '屋仔',
  pavilion: '涼亭',
};

/** 第 1 粒，同之後第 10、20、30… 粒。 */
export function isNestBuildCount(n: number): boolean {
  return n === 1 || (n >= 10 && n % 10 === 0);
}

/** 第 5、15、25… 粒。 */
export function isNestHeightCount(n: number): boolean {
  return n >= 5 && n % 10 === 5;
}

/** Decoration for this hatch count, in 風車、銅像、屋仔、涼亭 order. */
export function nestBuildAt(n: number): NestBuildKind | null {
  if (!isNestBuildCount(n)) return null;
  const index = n === 1 ? 0 : n / 10;
  return NEST_BUILDS[index % NEST_BUILDS.length] ?? null;
}

export function nestBuildPhrase(kind: NestBuildKind): string {
  return `一座${NEST_BUILD_LABEL[kind]}`;
}

/** Decorations already on the island, oldest first. */
export function nestBuilds(hatched: number): NestBuildKind[] {
  const out: NestBuildKind[] = [];
  for (let n = 1; n <= hatched; n++) {
    const kind = nestBuildAt(n);
    if (kind) out.push(kind);
  }
  return out;
}

export function nextNestBuildCount(n: number): number {
  if (n < 1) return 1;
  return Math.floor(n / 10) * 10 + 10;
}

export function nextNestHeightCount(n: number): number {
  const base = Math.floor(n / 10) * 10 + 5;
  return base > n ? base : base + 10;
}

/**
 * The first settlement at or after the hatch counts the egg.
 * An egg that hatches after midnight waits for the next night.
 */
export function settleNest(state: GameState, now: number, date: string): { paid: boolean; count: number; awards: number[]; bird: string } {
  const nest = (state.nest ??= freshNest());
  const egg = nest.egg;
  if (!egg) return { paid: false, count: nest.hatched, awards: [], bird: '' };
  if (egg.hatchedAt == null && egg.laidAt + NEST_HATCH_MS <= now) egg.hatchedAt = egg.laidAt + NEST_HATCH_MS;
  if (egg.hatchedAt == null || egg.hatchedAt > now) return { paid: false, count: nest.hatched, awards: [], bird: egg.bird };
  const bird = egg.bird;
  nest.hatched += 1;
  nest.egg = null;
  const awards: number[] = [];
  if (isNestAwardCount(nest.hatched) && !nest.awards.some((a) => a.count === nest.hatched)) {
    nest.awards.push({ count: nest.hatched, date, ageDays: state.ageDays || 0 });
    awards.push(nest.hatched);
  }
  return { paid: true, count: nest.hatched, awards, bird };
}

/** When the current egg hatches, or null once it has hatched or there is no egg. */
export function nestHatchAt(state: GameState): number | null {
  const egg = state.nest?.egg;
  if (!egg || egg.hatchedAt != null) return null;
  return egg.laidAt + NEST_HATCH_MS;
}
