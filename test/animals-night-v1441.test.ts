import { describe, expect, it } from 'vitest';
import { ANIMALS, animalById, outAt } from '../src/data/animals';
import { createGame, refreshUnlocks } from '../src/sim';
import type { GameState } from '../src/types';

// 1.4.41: the 圖鑑 only unlocks an animal that is out (shown) at the time of day the player sees.
function seedling(over: Partial<GameState> = {}): GameState {
  const s = createGame('2026-09-25');
  s.started = true;
  return Object.assign(s, { health: 60, heightCm: 20 }, over);
}

describe('1.4.41 first animal by day / night', () => {
  it('菜粉蝶 is a day animal, 斜紋夜蛾 its night twin at the same level', () => {
    const day = animalById('butterfly')!;
    const night = animalById('nightmoth')!;
    expect(outAt(day, false)).toBe(true);
    expect(outAt(day, true)).toBe(false);
    expect(outAt(night, true)).toBe(true);
    expect(outAt(night, false)).toBe(false);
    expect([night.minM, night.minHealth, night.category]).toEqual([day.minM, day.minHealth, day.category]);
    expect(night.look.f).toContain('moth');
  });

  it('a new player at night meets the moth, not the (hidden) butterfly; by day the reverse', () => {
    const n = seedling();
    expect(refreshUnlocks(n, { date: '2026-09-25', events: ['clear'], night: true })).toEqual(['nightmoth']);
    const d = seedling();
    expect(refreshUnlocks(d, { date: '2026-09-25', events: ['clear'], night: false })).toEqual(['butterfly']);
    // the butterfly unlocks later, the first time it is actually out
    expect(refreshUnlocks(n, { date: '2026-09-26', events: ['clear'], night: false })).toContain('butterfly');
  });

  it('no animal unlocks outside its time of day (big tree, every condition met)', () => {
    const s = seedling({ health: 95, heightCm: 9000, stormSurvivals: 3, ageDays: 400 });
    const got = refreshUnlocks(s, { date: '2026-07-10', events: ['hot', 'rainstorm'], night: false });
    for (const id of got) expect(outAt(animalById(id)!, false), id).toBe(true);
    expect(got).not.toContain('firefly');
    expect(ANIMALS.filter((a) => a.night && a.motion !== 'hollow' && a.motion !== 'nest').every((a) => !got.includes(a.id))).toBe(true);
  });
});
