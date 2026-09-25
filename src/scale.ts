/**
 * World scale for the 3D scene (v8).
 *
 * The scene is drawn in metres, but its *look* is the v6 composition: the tree model keeps the proportions it had in
 * v6 (its log-curve size relative to the island), and the whole v6 scene — island, habitat, fence spacing, clouds — is
 * scaled uniformly by one factor k so that the tree top sits exactly at the game height G shown on the rail.
 * k = G / (v6 model height), so "1 scene unit = 1 m" still holds and the rail never disagrees with the drawing; what
 * changes with growth is how many metres the island represents (a seedling's garden is a couple of metres across, a
 * 100 m giant's is ~250 m across).
 *
 * Animals are the only exaggerated thing: every species is drawn at its real body length (data/animals.ts) × ONE
 * shared factor `animalFactor(G)` that depends only on the tree height, so relative sizes between animals are always
 * true (buffalo : macaque : squirrel : sparrow = 2.8 : 0.75 : 0.4 : 0.14).
 */
export const METRES_PER_UNIT = 1;
/** Airborne animals may fly up to this many metres above the tree top. */
export const FLIGHT_ABOVE_TREE_M = 5;
/** Real fence height (metres); drawn × animalFactor like the animals, but never taller than the v6 look allows. */
export const FENCE_HEIGHT_M = 1.1;
/** Fence height in island units in the v6 scene (posts were 0.75 units on a radius-7 garden). */
export const FENCE_V6_UNITS = 0.75;
/** Fence posts stand this far (island units) inside the rendered shoreline. */
export const FENCE_INSET_UNITS = 0.16;

/** Animal exaggeration: 1 for small trees, growing gently (≈1.4× at 20 m, 2.1× at 50 m, 2.75× at 100 m) to at most 3×. */
export const ANIMAL_FACTOR_REF_M = 8;
export const ANIMAL_FACTOR_EXP = 0.4;
export const ANIMAL_FACTOR_MAX = 3;

/** Game height (cm) → scene units (metres). */
export function unitsForCm(cm: number): number {
  return Math.max(0, cm) / 100 / METRES_PER_UNIT;
}

/** Uniform scale that makes a model whose top is at `localTop` exactly `cm` tall (also the island/scene scale). */
export function modelScaleFor(localTop: number, cm: number): number {
  return unitsForCm(cm) / Math.max(1e-6, localTop);
}

/** Flight ceiling above the tree base, in metres: tree height + 5 m (no fixed cap). */
export function flightCeiling(treeM: number): number {
  return Math.max(0, treeM) + FLIGHT_ABOVE_TREE_M;
}

/** One exaggeration factor for every animal at a given tree height (metres). */
export function animalFactor(treeM: number): number {
  const f = Math.pow(Math.max(0, treeM) / ANIMAL_FACTOR_REF_M, ANIMAL_FACTOR_EXP);
  return Math.max(1, Math.min(ANIMAL_FACTOR_MAX, f));
}

/** Drawn body length (metres) of an animal of real length `realM` next to a tree of `treeM`. */
export function drawnLength(realM: number, treeM: number): number {
  return realM * animalFactor(treeM);
}

/**
 * Island landscape scale = the tree's own model scale, so tree : island keeps the v6 proportion at every height.
 * `treeScale` is k from `modelScaleFor`.
 */
export function islandScaleFor(treeScale: number): number {
  return Math.max(1e-3, treeScale);
}

/** Fence height in island units for a scene scale K and tree height (metres). */
export function fenceHeightUnits(K: number, treeM: number): number {
  return Math.min(FENCE_V6_UNITS, (FENCE_HEIGHT_M * animalFactor(treeM)) / Math.max(1e-3, K));
}

/** Wobble of the island rim (fraction of the radius) at an angle — shared by the garden, the habitat land and the fence. */
export function rimWobble(angle: number): number {
  return 1 + 0.035 * Math.sin(angle * 3 + 0.6) + 0.025 * Math.sin(angle * 7 + 1.9);
}

/** Rendered shoreline radius (island units) of an island of nominal radius `R` at `angle`. */
export function shoreRadius(R: number, angle: number): number {
  return R * rimWobble(angle);
}

/** Smallest shoreline radius (island units) — walkers are kept inside this minus the fence inset. */
export function minShoreRadius(R: number): number {
  return R * (1 - 0.035 - 0.025);
}
