/**
 * 1.4.78 hybrid overview framing.
 *
 * Classic camDist tracked the tree sphere so on-screen tree size stayed roughly constant while the
 * island looked smaller and smaller as localTop grew. Here the target tree screen fraction rises with
 * height (~40% → ~60%, capped at 60%). Prefer adjusting the tree term of R (→ camDist); islandK stays
 * coupled. The classic island stage term remains the footprint floor so ground / pond stay visible.
 */

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Target vertical screen fraction for the tree (0.40 seedling → 0.60 tall; never above 0.60). */
export function overviewTreeFrac(treeM: number): number {
  const lo = Math.log10(0.8);
  const hi = Math.log10(35);
  const t = (Math.log10(Math.max(treeM, 0.05)) - lo) / (hi - lo);
  return 0.4 + 0.2 * smoothstep(t);
}

/** Classic island contribution to the frame radius (stage 0 garden → later habitats). */
export const ISLAND_FRAME_FRAC = [0.2, 0.28, 0.32, 0.36, 0.38] as const;

/** Reference fraction assumed by the classic R = √((0.55H)²+W²)·1.14 fit (matches early treeFrac). */
const REF_TREE_FRAC = 0.4;

export type OverviewFrameIn = {
  treeM: number;
  canopyM: number;
  islandK: number;
  /** Island shoreline radius already in world metres (habitat.radius * islandK). */
  islandR: number;
  islandStage: number;
};

export type OverviewFrameOut = {
  /** Sphere radius fed to want = R / sin(fovHalf) · pad (same contract as pre-1.4.78). */
  R: number;
  treeFrac: number;
  /** Look-at height (metres); drops slightly as treeFrac rises so roots don't bury the ground. */
  wantY: number;
};

/**
 * Frame radius + look-at for the automatic overview camera.
 * Early (small tree): treeFrac ≈ 0.4 → same R as classic; island term often wins → island-led.
 * Mid/late: tree term shrinks as treeFrac rises → camera stays closer → tree looks taller on screen;
 * island stage term still floors R so we never crop to trunk-only.
 */
export function overviewFrame(input: OverviewFrameIn): OverviewFrameOut {
  const H = Math.max(0, input.treeM);
  const KF = Math.max(1e-3, input.islandK);
  const stage = clamp(Math.floor(input.islandStage), 0, ISLAND_FRAME_FRAC.length - 1);
  const treeFrac = overviewTreeFrac(H);
  const W = Math.max(1.0 * KF, Math.max(0, input.canopyM));
  const RTree = Math.sqrt((H * 0.55) ** 2 + W * W) * 1.14;
  // Pull in as treeFrac rises (closer cam → taller on screen). Early factor = 1.
  const RTreeEff = RTree * (REF_TREE_FRAC / treeFrac);
  const RIsle = input.islandR * ISLAND_FRAME_FRAC[stage]!;
  const R = Math.max(2.0 * KF, RTreeEff, RIsle);
  const lift = (treeFrac - 0.4) / 0.2; // 0 → 1 as frac goes 0.4 → 0.6
  const wantY = H * (0.47 - 0.05 * lift);
  return { R, treeFrac, wantY };
}

/** Distance pad matching scene3d portrait / landscape multipliers. */
export function overviewWantDist(R: number, vHalf: number, hHalf: number, portrait: boolean): number {
  return Math.max(
    (R / Math.sin(vHalf)) * (portrait ? 1.3 : 1.18),
    (R / Math.sin(hHalf)) * (portrait ? 1.12 : 1.05),
  );
}
