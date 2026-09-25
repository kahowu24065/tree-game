/**
 * World scale for the 3D scene.
 *
 * 1 scene unit = 1 metre. The tree model is scaled so its highest rendered point sits exactly at the game height G,
 * animals are drawn at their real body length / wingspan, and flying animals stay below min(80 m, tree height).
 * The only thing that is not 1:1 is the floating island itself: once the tree is taller than the island is wide, the
 * island landscape is enlarged by `islandScaleFor` so a 100 m giant does not stand on a pebble (the fence stays 1:1).
 */
export const METRES_PER_UNIT = 1;
/** Highest any bird, bat or insect may fly (metres above the tree base). */
export const FLIGHT_MAX_M = 80;
/** Fence height (metres) — a garden rail, drawn 1:1. */
export const FENCE_HEIGHT_M = 1.1;

/** Game height (cm) → scene units. */
export function unitsForCm(cm: number): number {
  return Math.max(0, cm) / 100 / METRES_PER_UNIT;
}

/** Uniform scale that makes a model whose top is at `localTop` exactly `cm` tall. */
export function modelScaleFor(localTop: number, cm: number): number {
  return unitsForCm(cm) / Math.max(1e-6, localTop);
}

/** Flight ceiling above the tree base, in metres: never above the tree top, never above 80 m. */
export function flightCeiling(treeM: number): number {
  return Math.max(0, Math.min(FLIGHT_MAX_M, treeM));
}

/** Island landscape scale: 1 until the tree outgrows the island diameter, then it grows with the tree. */
export function islandScaleFor(stageRadiusM: number, treeM: number): number {
  return Math.max(1, treeM / (2.2 * stageRadiusM));
}

/** Where the fence stands: just inside the rim of the current island. */
export function fenceRadius(islandRadiusM: number): number {
  return Math.max(0.5, islandRadiusM - 0.35);
}
