import { describe, expect, it } from 'vitest';
import { BLOCK, DRY, NAV_CELL, WATER, WalkNav, type NavBuild } from '../src/three/walkNav';
import { buildHabitat, resolveObstacles } from '../src/three/habitat3d';

/** Round island radius 10, a pond at (4, 0) r 1.5, a rock at (-3, 2) r 0.6. */
function nav(extra: Partial<NavBuild> = {}): WalkNav {
  return new WalkNav({
    R: 10,
    limit: () => 9,
    terrain: (x, z) => (Math.hypot(x - 4, z) < 1.5 ? WATER : DRY),
    obstacles: [{ x: -3, z: 2, r: 0.6, kind: 'rock' }],
    propK: 1,
    trunkR: 0.5,
    ...extra,
  });
}

function rng(seed = 1): () => number {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe('v11 walk nav', () => {
  const n = nav();

  it('flags water, the trunk, obstacles and the fence', () => {
    expect(n.flags[n.cellOf(4, 0)]).toBe(WATER);
    expect(n.flags[n.cellOf(0.1, 0.1)]).toBe(BLOCK);
    expect(n.flags[n.cellOf(-3, 2)]).toBe(BLOCK);
    expect(n.flags[n.cellOf(9.6, 0)]).toBe(BLOCK);
    expect(n.flags[n.cellOf(-6, -3)]).toBe(DRY);
  });

  it('keeps clearance from anything a walker may not enter', () => {
    const c = n.cellOf(-6, -3);
    expect(n.clearDry[c]).toBeGreaterThan(2);
    // Near the pond: dry clearance small, wader clearance large.
    const b = n.cellOf(2.2, 0);
    expect(n.clearDry[b]).toBeLessThan(0.6);
    expect(n.clearWade[n.cellOf(4, 0)]).toBeGreaterThan(1);
    expect(n.ok(n.cellOf(4, 0), 0.2, false)).toBe(false);
    expect(n.ok(n.cellOf(4, 0), 0.2, true)).toBe(true);
    // Big bodies need more room.
    expect(n.ok(n.cellOf(-3, 2.9), 0.1, false)).toBe(true);
    expect(n.ok(n.cellOf(-3, 2.9), 0.8, false)).toBe(false);
  });

  it('reaches every dry cell around water and props, never cutting corners', () => {
    const from = n.cellOf(-6, 0);
    const f = n.field(from, 0.2, false);
    const target = n.cellOf(7, 0); // behind the pond
    expect(Number.isFinite(f[target]!)).toBe(true);
    // Path length > straight line (it goes around the pond / trunk).
    expect(f[target]!).toBeGreaterThan(13);
    let reach = 0;
    for (let k = 0; k < f.length; k++) if (Number.isFinite(f[k]!)) {
      reach++;
      expect(n.ok(k, 0.2, false)).toBe(true);
    }
    expect(reach / n.walkableCells(0.2)).toBeGreaterThan(0.97);
  });

  it('walking the waypoints reaches the goal without entering water or props', () => {
    const goal = n.cellOf(7, 0.5);
    const f = n.field(goal, 0.2, false);
    let x = -6;
    let z = 0.3;
    for (let i = 0; i < 400; i++) {
      const wp = n.waypoint(f, x, z, 0.2, false)!;
      expect(wp).not.toBeNull();
      const dx = wp.x - x;
      const dz = wp.z - z;
      const d = Math.hypot(dx, dz);
      if (d < 0.05) break;
      const s = Math.min(d, 0.1);
      x += (dx / d) * s;
      z += (dz / d) * s;
      expect(n.flags[n.cellOf(x, z)]).toBe(DRY);
    }
    expect(Math.hypot(x - n.centre(goal).x, z - n.centre(goal).z)).toBeLessThan(0.3);
  });

  it('line of sight is blocked by the rock and the pond', () => {
    expect(n.los(-5, 2, -1, 2, 0.2, false)).toBe(false);
    expect(n.los(1.5, 0, 6.5, 0, 0.2, false)).toBe(false);
    expect(n.los(1.5, 0, 6.5, 0, 0.2, true)).toBe(true);
    expect(n.los(-6, -4, -2, -4, 0.2, false)).toBe(true);
  });

  it('samples wander targets over the whole walkable land, out to the fence', () => {
    const f = n.field(n.cellOf(-6, 0), 0.2, false);
    const r = rng(7);
    const quad = [0, 0, 0, 0];
    let far = 0;
    for (let i = 0; i < 2000; i++) {
      const c = n.sample(f, r);
      expect(c).toBeGreaterThanOrEqual(0);
      const p = n.centre(c);
      quad[(p.x > 0 ? 1 : 0) + (p.z > 0 ? 2 : 0)]++;
      if (Math.hypot(p.x, p.z) > 6.5) far++;
    }
    for (const q of quad) expect(q).toBeGreaterThan(350);
    // Area outside r 6.5 is ~ (9² - 6.5²)/9² ≈ 48% of the disc.
    expect(far / 2000).toBeGreaterThan(0.38);
  });

  it('spatial hash finds nearby obstacles only', () => {
    const out: number[] = [];
    expect(n.near(-3, 2, 0.5, out).length).toBeGreaterThan(0);
    expect(n.near(6, -6, 0.5, out).length).toBe(0);
  });

  it('scales obstacle footprints with the prop factor', () => {
    const m = nav({ propK: 0.5 });
    expect(m.flags[m.cellOf(-3, 2)]).toBe(BLOCK);
    expect(m.flags[m.cellOf(-3, 2.55)]).not.toBe(BLOCK);
    expect(n.flags[n.cellOf(-3, 2.55)]).toBe(BLOCK);
    expect(NAV_CELL).toBeLessThanOrEqual(0.25);
  });
});

describe('v11 habitat obstacles', () => {
  // Habitat water textures draw on a canvas; a no-op 2D context is enough here.
  const ctx: unknown = new Proxy(function () {}, { get: (_t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'getImageData' || k === 'createImageData' ? () => ctx : k === 'data' ? new Uint8ClampedArray(64 * 64 * 4) : ctx), apply: () => ctx, set: () => true });
  (globalThis as { document?: unknown }).document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => ctx, style: {} }) };
  it('records solid props and scales anchored ones about their anchor', () => {
    const h = buildHabitat('camphor', 3, 'low', 1);
    expect(h.obstacles.length).toBeGreaterThan(5);
    const kinds = new Set(h.obstacles.map((o) => o.kind));
    expect(kinds.has('rock') || kinds.has('bush')).toBe(true);
    const a = resolveObstacles(h.obstacles, 1);
    const b = resolveObstacles(h.obstacles, 0.5);
    h.obstacles.forEach((o, i) => {
      if (o.scaled) {
        expect(b[i]!.r).toBeCloseTo(a[i]!.r * 0.5, 6);
        expect(b[i]!.x - o.ax).toBeCloseTo((a[i]!.x - o.ax) * 0.5, 6);
      } else expect(b[i]!.r).toBe(a[i]!.r);
    });
  });
});
