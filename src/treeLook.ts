/**
 * v16 tree health look (pure, no three.js): how withered / drooping the tree looks and how many leaves fall, from
 * health, 瀕死 and death. Visual only — never touches the rules.
 *   H ≥ 50: healthy · 25–50: slightly dull · < 25: yellowing, sparse (built tier), drooping tips, a few leaves falling
 *   瀕死: nearly bare and brown, steady leaf fall, faint red pulse · dead: brown, no pulse (the tree lies as a log).
 */
export interface HealthLook {
  /** 0 healthy … 1 dead brown (foliage colour). */
  wither: number;
  /** 0 … 1 drooping leaf tips. */
  droop: number;
  /** 0 / 1: the faint red 瀕死 pulse is on. */
  pulse: number;
  /** 0 … 1 falling-leaf particle rate. */
  leafFall: number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function healthLook(health: number, dying: boolean, dead: boolean): HealthLook {
  if (dead) return { wither: 1, droop: 1, pulse: 0, leafFall: 0 };
  if (dying || health <= 0) return { wither: 0.9, droop: 1, pulse: 1, leafFall: 1 };
  const h = Math.max(0, Math.min(100, health));
  let wither = 0;
  if (h < 50) wither = h >= 25 ? 0.4 * ((50 - h) / 25) : 0.4 + 0.28 * clamp01((25 - h) / 17);
  const droop = h < 25 ? 0.6 * clamp01((25 - h) / 17) + 0.15 : 0;
  const leafFall = h < 25 ? 0.3 : 0;
  return { wither, droop, pulse: 0, leafFall };
}

/** Low-health tier name for checks / the dev panel. */
export function lookTier(health: number, dying: boolean, dead: boolean): 'healthy' | 'dull' | 'weak' | 'dying' | 'dead' {
  if (dead) return 'dead';
  if (dying || health <= 0) return 'dying';
  if (health < 25) return 'weak';
  if (health < 50) return 'dull';
  return 'healthy';
}
