/**
 * 1.4.45 camera easing for the planting / opening shots.
 * - Ease-in-out timelines (no exponential ease-out, which starts at full speed and lurched toward the tree,
 *   worst on a slow first frame) and no threshold snaps at the end.
 * - A camera clock with smooth catch-up: per-frame dt stays capped, the time lost to a long frame (e.g. a 200 ms
 *   hitch) is repaid gradually over the next frames, so the shot speeds up a little instead of jumping.
 */
export const FRAME_CAP = 0.1;
/** Most lost time carried (s); older debt is dropped rather than replayed. */
export const LAG_CAP = 0.6;

export function smootherstep(u: number): number {
  const x = Math.min(1, Math.max(0, u));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function smoothstep(u: number): number {
  const x = Math.min(1, Math.max(0, u));
  return x * x * (3 - 2 * x);
}

/** Camera clock step: returns this frame's camera dt and the remaining lag. `raw` is the real frame time (s). */
export function catchUp(raw: number, lag: number): { dt: number; lag: number } {
  const r = Number.isFinite(raw) ? Math.max(0, raw) : 0;
  const dt = Math.min(r, FRAME_CAP);
  // Repay earlier debt: at most one extra frame's worth (≤ 2× speed), less as the debt shrinks (speed eases back to
  // normal, no step), never past the per-frame cap. This frame's own overrun is only added to the debt.
  const repay = Math.max(0, Math.min(lag, dt * Math.min(1, Math.max(0.15, lag / 0.3)), FRAME_CAP - dt));
  return { dt: dt + repay, lag: Math.min(LAG_CAP, lag - repay + (r - dt)) };
}

/** Critically damped spring (velocity-continuous follow of a moving goal). */
export function smoothDamp(cur: number, goal: number, vel: number, smoothTime: number, dt: number): { value: number; vel: number } {
  if (dt <= 0) return { value: cur, vel };
  const omega = 2 / Math.max(1e-4, smoothTime);
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - goal;
  const temp = (vel + omega * change) * dt;
  return { value: goal + (change + temp) * e, vel: (vel - omega * temp) * e };
}
