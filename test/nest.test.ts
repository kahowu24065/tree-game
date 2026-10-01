import { describe, expect, it } from 'vitest';
import { freshNest, isNestAwardCount, isNestBuildCount, isNestHeightCount, nestBuildAt, nestHatchAt, nestPhase, nextNestAwardCount, pickNestBird, settleNest, tickNest, NEST_HATCH_MS } from '../src/nest';
import { createGame, settleDay } from '../src/sim';
import { onGardenWater, ISLAND_R } from '../src/three/island3d';
import { buildNestDecor } from '../src/three/nestDecor3d';
import { FENCE_INSET_UNITS, shoreRadius } from '../src/scale';

function tree() {
  const state = createGame('2026-09-01');
  state.started = true;
  state.health = 96; // eggs need 健康 ≥ 90
  state.animals = ['sparrow', 'bulbul', 'magpierobin'];
  state.nest = freshNest();
  return state;
}

/** Exactly at the egg threshold (健康 90). */
function tree90() {
  const s = tree();
  s.health = 90;
  return s;
}

describe('bird eggs', () => {
  it('picks one species for a day, and the same day stays the same', () => {
    const ids = ['sparrow', 'bulbul', 'magpierobin'];
    expect(pickNestBird(ids, '2026-09-01')).toBe(pickNestBird(ids, '2026-09-01'));
    expect(pickNestBird([], '2026-09-01')).toBeNull();
  });

  it('lays one species today and does not lay a second', () => {
    const state = tree();
    const now = 1_000_000_000_000;
    const first = tickNest(state, now, '2026-09-01');
    expect(first).toMatchObject({ laid: true, hatched: false });
    const bird = state.nest?.egg?.bird;
    expect(['sparrow', 'bulbul', 'magpierobin']).toContain(bird);
    expect(tickNest(state, now + 1000, '2026-09-01').laid).toBe(false);
    expect(state.nest?.egg?.bird).toBe(bird);
  });

  it('a struggling tree or a tree with no birds does not lay', () => {
    const state = tree();
    state.health = 89.9;
    expect(tickNest(state, 1, '2026-09-01').laid).toBe(false);
    state.health = 90;
    expect(tickNest(tree90(), 1, '2026-09-01').laid).toBe(true);
    state.animals = ['squirrel'];
    expect(tickNest(state, 1, '2026-09-01').laid).toBe(false);
  });

  it('hatches six hours later, and the night after that counts it', () => {
    const state = tree();
    const now = 1_000_000_000_000;
    tickNest(state, now, '2026-09-01');
    expect(nestPhase(state.nest)).toBe('egg');
    expect(nestHatchAt(state)).toBe(now + NEST_HATCH_MS);
    expect(settleNest(state, now + NEST_HATCH_MS - 1, '2026-09-01').paid).toBe(false);
    expect(tickNest(state, now + NEST_HATCH_MS, '2026-09-01')).toMatchObject({ hatched: true, laid: false });
    expect(nestPhase(state.nest)).toBe('chick');
    const paid = settleNest(state, now + NEST_HATCH_MS, '2026-09-01');
    expect(paid.paid).toBe(true);
    expect(paid.count).toBe(1);
    expect(paid.awards).toEqual([1]);
    expect(nestPhase(state.nest)).toBe('empty');
  });

  it('achievement counts are 1, 5, 15, then every 5 from 20', () => {
    expect(nextNestAwardCount(0)).toBe(1);
    expect(nextNestAwardCount(1)).toBe(5);
    expect(nextNestAwardCount(5)).toBe(15);
    expect(nextNestAwardCount(15)).toBe(20);
    expect(nextNestAwardCount(30)).toBe(35);
    expect(isNestAwardCount(10)).toBe(false);
    expect(isNestAwardCount(15)).toBe(true);
    expect(isNestAwardCount(35)).toBe(true);
  });

  it('the 1st and every 10th hatch is a decoration, and 5, 15, 25 add height', () => {
    expect(isNestBuildCount(1)).toBe(true);
    expect(isNestBuildCount(10)).toBe(true);
    expect(isNestBuildCount(20)).toBe(true);
    expect(isNestBuildCount(5)).toBe(false);
    expect(isNestBuildCount(15)).toBe(false);
    expect(nestBuildAt(1)).toBe('windmill');
    expect(nestBuildAt(10)).toBe('statue');
    expect(nestBuildAt(20)).toBe('house');
    expect(nestBuildAt(30)).toBe('pavilion');
    expect(nestBuildAt(40)).toBe('windmill');
    expect(isNestHeightCount(5)).toBe(true);
    expect(isNestHeightCount(15)).toBe(true);
    expect(isNestHeightCount(25)).toBe(true);
    expect(isNestHeightCount(35)).toBe(true);
    expect(isNestHeightCount(1)).toBe(false);
    expect(isNestHeightCount(10)).toBe(false);
  });

  it('the first hatch does not add height when nutrients are already full', () => {
    const cared = () => {
      const state = tree();
      state.nutrients = 100;
      state.moisture = 80;
      state.health = 90;
      state.heightCm = 340;
      return state;
    };
    const withEgg = cared();
    withEgg.nest = { hatched: 0, awards: [], laidOn: '2026-09-01', egg: { bird: 'sparrow', laidAt: 0, hatchedAt: 1 } };
    const plain = cared();
    settleDay(withEgg, '2026-09-01', ['clear'], null, 10_000);
    settleDay(plain, '2026-09-01', ['clear'], null, 10_000);
    expect(withEgg.heightCm).toBe(plain.heightCm);
    expect(withEgg.nutrients).toBe(plain.nutrients);
  });

  it('the 5th hatch still adds height when nutrients are already full', () => {
    const cared = () => {
      const state = tree();
      state.nutrients = 100;
      state.moisture = 80;
      state.health = 90;
      state.heightCm = 340;
      return state;
    };
    const withEgg = cared();
    withEgg.nest = { hatched: 4, awards: [], laidOn: '2026-09-01', egg: { bird: 'sparrow', laidAt: 0, hatchedAt: 1 } };
    const plain = cared();
    plain.nest = { hatched: 4, awards: [], egg: null, laidOn: '2026-09-01' };
    settleDay(withEgg, '2026-09-01', ['clear'], null, 10_000);
    settleDay(plain, '2026-09-01', ['clear'], null, 10_000);
    expect(withEgg.heightCm).toBeGreaterThan(plain.heightCm);
    expect(withEgg.nutrients).toBe(plain.nutrients);
  });

  it('decoration spots sit on dry grass inside the shore', () => {
    const built = buildNestDecor(['windmill', 'statue', 'house', 'pavilion', 'windmill', 'statue', 'house', 'pavilion']);
    for (const o of built.obstacles) {
      expect(onGardenWater(o.x, o.z, 0.2)).toBe(false);
      const a = Math.atan2(o.z, o.x);
      expect(Math.hypot(o.x, o.z) + o.r).toBeLessThan(shoreRadius(ISLAND_R, a) - FENCE_INSET_UNITS);
    }
  });
});
