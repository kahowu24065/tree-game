import { describe, expect, it } from 'vitest';
import { HOVER_HOP_M, pickNearbySpot } from '../src/three/animals3d';

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('hover flyers visit nearby flowers', () => {
  it('consecutive hover targets stay within HOVER_HOP_M on a big crown', () => {
    const rng = mulberry32(7);
    // A 20 m tree: 300 perches over a crown 8 m wide, 6–20 m up.
    const pts = Array.from({ length: 300 }, () => ({ x: (rng() - 0.5) * 16, y: 6 + rng() * 14, z: (rng() - 0.5) * 16 }));
    let at = pickNearbySpot(pts, { x: 0, y: 12, z: 0 }, rng, 0, 4, 0);
    let fallbacks = 0;
    for (let n = 0; n < 500; n++) {
      const from = pts[at]!;
      const next = pickNearbySpot(pts, from, rng);
      const d = Math.hypot(pts[next]!.x - from.x, pts[next]!.y - from.y, pts[next]!.z - from.z);
      const inRange = pts.some((p) => {
        const e = Math.hypot(p.x - from.x, p.y - from.y, p.z - from.z);
        return e <= HOVER_HOP_M && e >= 0.3;
      });
      if (inRange) expect(d).toBeLessThanOrEqual(HOVER_HOP_M);
      else fallbacks++;
      expect(next).not.toBe(at);
      at = next;
    }
    expect(fallbacks).toBeLessThan(50);
  });

  it('falls back to one of the nearest few when nothing is in range', () => {
    const pts = [{ x: 10, y: 0, z: 0 }, { x: 11, y: 0, z: 0 }, { x: 12, y: 0, z: 0 }, { x: 50, y: 0, z: 0 }];
    for (let s = 1; s < 30; s++) expect(pickNearbySpot(pts, { x: 0, y: 0, z: 0 }, mulberry32(s))).toBeLessThan(3);
    expect(pickNearbySpot([], { x: 0, y: 0, z: 0 }, Math.random)).toBe(-1);
  });
});
