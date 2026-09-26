import { describe, expect, it } from 'vitest';
import { ANIMALS, animalById } from '../src/data/animals';
import { groupSize, MIN_GROUP, ROTATE_MAX_S, ROTATE_MIN_S, rotateDelay, stageCap, STAGE_CAPS } from '../src/data/eco';
import { Animals3D } from '../src/three/animals3d';
import { buildTree } from '../src/three/tree3d';

// Minimal canvas stub so Animals3D (firefly sprite texture) can be built in the node test environment.
const noop2d = new Proxy({}, { get: (_t, k) => (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {}), set: () => true });
(globalThis as unknown as { document?: unknown }).document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => noop2d }) };

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('v13.1: no species alone', () => {
  it('groupSize is at least a pair for every animal, motion and stage, and within the caps', () => {
    const rand = mulberry32(131);
    for (let s = 0; s < 5; s++) {
      for (const a of ANIMALS) {
        for (let i = 0; i < 12; i++) {
          const n = groupSize(a, s, rand);
          expect(n, `${a.id}@${s}`).toBeGreaterThanOrEqual(MIN_GROUP);
          expect(n, `${a.id}@${s}`).toBeLessThanOrEqual(stageCap(s).members);
        }
      }
    }
    for (const id of ['magpierobin', 'owl', 'firefly']) for (let s = 0; s < 5; s++) expect(groupSize(animalById(id)!, s, rand)).toBe(2);
    // Even a random source stuck at 0 or ~1 still yields a pair.
    for (const a of ANIMALS) {
      expect(groupSize(a, 0, () => 0)).toBeGreaterThanOrEqual(2);
      expect(groupSize(a, 4, () => 0.999999)).toBeGreaterThanOrEqual(2);
    }
    for (const c of STAGE_CAPS) expect(c.members).toBeGreaterThanOrEqual(MIN_GROUP * c.groups);
  });

  it('rotation interval is 3–5 minutes', () => {
    expect(ROTATE_MIN_S).toBe(180);
    expect(ROTATE_MAX_S).toBe(300);
    expect(rotateDelay(() => 0)).toBe(180);
    expect(rotateDelay(() => 0.999999)).toBeLessThanOrEqual(300);
    const rand = mulberry32(5);
    for (let i = 0; i < 500; i++) {
      const d = rotateDelay(rand);
      expect(d).toBeGreaterThanOrEqual(180);
      expect(d).toBeLessThanOrEqual(300);
    }
  });

  it('the live animal scene never shows a lone animal, keeps caps, and rotates after 3–5 min', () => {
    const ids = ANIMALS.map((a) => a.id);
    for (let stage = 0; stage < 5; stage++) {
      const tree = buildTree({ species: 'camphor', stage, heightCm: [40, 200, 600, 1500, 4000][stage]!, health: 95, pests: 0, scars: 0, seed: 3 } as never);
      const an = new Animals3D();
      (an as unknown as { rng: () => number }).rng = mulberry32(stage + 1);
      let t = 0;
      for (const night of [false, true]) {
        an.sync({ unlocked: ids, residents: ['magpierobin', 'owl', 'sparrow'], tree, health: 95, night, stage });
        an.update(t, 0, night ? 1 : 0);
        const first = an.rotationInfo();
        if (!night) {
          expect(first.inS).toBeGreaterThanOrEqual(180);
          expect(first.inS).toBeLessThanOrEqual(300);
        }
        // Night switch: the island is refilled at once by sync; the timer keeps running (≤ 5 min away).
        if (night) expect(first.inS).toBeLessThanOrEqual(300);
        let rotations = 0;
        let next = first.next;
        for (let step = 0; step < 900; step++) {
          t += 1;
          an.update(t, 0, night ? 1 : 0);
          const r = an.rotationInfo();
          if (r.next !== next) {
            rotations++;
            expect(r.next - t).toBeGreaterThanOrEqual(180 - 1e-6);
            expect(r.next - t).toBeLessThanOrEqual(300);
            next = r.next;
          }
          if (step % 30 === 0) {
            const crews = an.crewList();
            for (const c of crews) expect(c.count, `${c.id}@stage${stage}`).toBeGreaterThanOrEqual(2);
            const caps = an.caps();
            expect(caps.visitorGroups).toBeLessThanOrEqual(caps.groups);
            expect(caps.visitorMembers).toBeLessThanOrEqual(caps.members);
          }
        }
        expect(rotations).toBeGreaterThanOrEqual(2);
        expect(rotations).toBeLessThanOrEqual(5);
      }
      // Manual (dev panel) rotate still works and restarts the 3–5 min timer.
      an.rotate();
      const r = an.rotationInfo();
      expect(r.inS).toBeGreaterThanOrEqual(180);
      expect(an.crewList().every((c) => c.count >= 2)).toBe(true);
    }
  });
});
