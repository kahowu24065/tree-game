/**
 * v15.1 保暖 campfire: pure helpers (no three.js) so they can be unit-tested.
 */
import type { GameState } from './types';

/** The campfire burns beside the tree for the rest of the game day on which 保暖 was done (gone the next day). */
export function campfireLit(state: Pick<GameState, 'started' | 'over' | 'care'>, today: string): boolean {
  return Boolean(state.started !== false && !state.over && state.care && state.care.date === today && state.care.warmCover);
}

/**
 * Campfire ring radius in island units: about a real 0.35 m ring × the shared animal factor, kept between 0.2 and
 * 0.32 island units so it reads next to a small tree without dwarfing a seedling's garden (a seedling's own fire is
 * trimmed to ~0.28 × its height, min 0.16); for a big tree (many island
 * units tall) it grows to ~6 % of the tree's height (max 1.2 units) so it doesn't vanish next to a giant.
 */
export function campfireRadiusUnits(animalFactor: number, islandK: number, treeUnits = 0): number {
  const u = (0.35 * Math.max(1, animalFactor)) / Math.max(1e-3, islandK);
  let base = Math.max(0.2, Math.min(0.32, u));
  // A seedling (under ~1 island unit tall) gets a smaller fire so the flames stay about half the tree's height.
  if (treeUnits > 0) base = Math.min(base, Math.max(0.16, 0.28 * treeUnits));
  return Math.max(base, Math.min(1.2, 0.06 * Math.max(0, treeUnits)));
}

export interface CampfireSpot {
  x: number;
  z: number;
  /** Distance from the trunk centre (island units). */
  dist: number;
  angle: number;
}

/**
 * Pick a spot (island units) beside the trunk: clear of the trunk by a margin, trying the preferred angle first and
 * then fanning out (and a little farther) until `blocked(x, z, r)` says the ring of radius `fireU` is free.
 */
export function campfireSpot(opts: { trunkU: number; fireU: number; prefer: number; blocked: (x: number, z: number, r: number) => boolean; margin?: number }): CampfireSpot {
  const { trunkU, fireU, prefer, blocked } = opts;
  const margin = opts.margin ?? 0.14;
  const d0 = trunkU + fireU + margin;
  for (const k of [1, 1.3, 1.65, 2.1, 2.7]) {
    const d = d0 * k;
    for (let i = 0; i < 18; i++) {
      const step = Math.ceil(i / 2) * 0.35 * (i % 2 ? 1 : -1);
      const a = prefer + step;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (!blocked(x, z, fireU)) return { x, z, dist: d, angle: a };
    }
  }
  return { x: Math.cos(prefer) * d0, z: Math.sin(prefer) * d0, dist: d0, angle: prefer };
}
