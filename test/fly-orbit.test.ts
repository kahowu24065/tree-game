import { describe, expect, it } from 'vitest';
import { flockSlots, flyHeading, pickFlyOrbit, type FlyOrbit } from '../src/three/animals3d';

function gap(a: number, b: number): number {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return Math.min(d, Math.PI * 2 - d);
}

describe('flight orbits', () => {
  it('starts each new flock on a different heading, radius and height', () => {
    const t = 80;
    const orbits: FlyOrbit[] = [];
    for (let i = 0; i < 4; i++) orbits.push(pickFlyOrbit(t, 'flock', orbits, orbits.length));
    const heads = orbits.map((o) => flyHeading(t, o));
    for (let i = 0; i < heads.length; i++) {
      for (let j = i + 1; j < heads.length; j++) expect(gap(heads[i]!, heads[j]!)).toBeGreaterThan(0.7);
    }
    const rads = orbits.map((o) => o.rad);
    expect(new Set(rads.map((r) => r.toFixed(2))).size).toBe(rads.length);
    expect(new Set(orbits.map((o) => o.alt.toFixed(2))).size).toBeGreaterThan(1);
  });

  it('keeps that separation as time moves, instead of resetting everyone to one angle', () => {
    const t = 40;
    const a = pickFlyOrbit(t, 'flock', [], 0);
    const b = pickFlyOrbit(t, 'flock', [a], 1);
    const later = t + 3;
    expect(gap(flyHeading(later, a), flyHeading(later, b))).toBeGreaterThan(0.9);
  });

  it('spaces a flock so neighbours are not on the same point', () => {
    const slots = flockSlots(7);
    expect(slots).toHaveLength(7);
    let min = Infinity;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const d = Math.hypot(slots[i]!.x - slots[j]!.x, slots[i]!.y - slots[j]!.y, slots[i]!.z - slots[j]!.z);
        min = Math.min(min, d);
      }
    }
    expect(min).toBeGreaterThan(1);
  });
});
