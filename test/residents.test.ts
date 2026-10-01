import { describe, expect, it } from 'vitest';
import { PEST_DAMAGE, PEST_TRIGGER_DAYS, pestDamageWith, pestTriggerDays, residentStreakNeeded } from '../src/balance';
import { addDays } from '../src/dates';
import { createGame, previewNight, settleDay } from '../src/sim';
import type { GameState } from '../src/types';

const NOW = Date.UTC(2026, 8, 25, 4);

function game(): GameState {
  const s = createGame('2026-09-01');
  s.started = true;
  s.animals = ['sparrow', 'butterfly', 'squirrel', 'bulbul', 'owl'];
  return Object.assign(s, { health: 95, moisture: 70, nutrients: 90, resist: 0 });
}

let day = '2026-09-10';
/** One night ending at 健康 `h`-ish: good W/N keep it ≥ 85; a low start pulls it under 75. */
function night(s: GameState, good: boolean): void {
  s.moisture = 70;
  s.nutrients = good ? 90 : 20;
  s.health = good ? 95 : 70; // 70 − 10 (營養不良) + 5 = 65 → below 75
  settleDay(s, day, ['clear'], null, NOW);
  day = addDays(day, 1);
}

describe('長駐動物（每晚 12 點睇健康）', () => {
  it('schedule: 5 nights → 1st species, 5 more → 2nd, then 10 more each', () => {
    expect([0, 1, 2, 3, 7].map(residentStreakNeeded)).toEqual([5, 5, 10, 10, 10]);
    const s = game();
    const counts: number[] = [];
    for (let n = 1; n <= 30; n++) {
      night(s, true);
      expect(s.health).toBeGreaterThanOrEqual(85);
      counts.push(s.residents.length);
    }
    expect(counts.indexOf(1) + 1).toBe(5);
    expect(counts.indexOf(2) + 1).toBe(10);
    expect(counts.indexOf(3) + 1).toBe(20);
    expect(counts.indexOf(4) + 1).toBe(30);
  });

  it('a night under 75 sends one species away and restarts the streak', () => {
    const s = game();
    for (let n = 0; n < 10; n++) night(s, true);
    expect(s.residents).toHaveLength(2);
    night(s, true);
    night(s, true);
    expect(s.highStreak).toBe(2);
    night(s, false);
    expect(s.health).toBeLessThan(75);
    expect(s.residents).toHaveLength(1);
    expect(s.highStreak).toBe(0);
    for (let n = 0; n < 4; n++) night(s, true);
    expect(s.residents).toHaveLength(1);
    night(s, true); // 5 nights again for the 2nd species
    expect(s.residents).toHaveLength(2);
  });

  it('85–89 still counts as a good night', () => {
    const s = game();
    s.moisture = 80;
    s.nutrients = 50;
    s.health = 82; // 82 + 5 (水分 56) + 0 (養分 40) = 87
    settleDay(s, day, ['clear'], null, NOW);
    day = addDays(day, 1);
    expect(s.health).toBe(87);
    expect(s.highStreak).toBe(1);
  });

  it('75–84 breaks the streak but nobody leaves', () => {
    const s = game();
    for (let n = 0; n < 5; n++) night(s, true);
    night(s, true);
    expect(s.highStreak).toBe(1);
    s.moisture = 80;
    s.nutrients = 50; // 養分 40 after the day → 0
    s.health = 72; // 72 + 5 (水分 56) + 0 (養分 40) = 77
    settleDay(s, day, ['clear'], null, NOW);
    day = addDays(day, 1);
    expect(s.health).toBeGreaterThanOrEqual(75);
    expect(s.health).toBeLessThan(85);
    expect(s.residents).toHaveLength(1);
    expect(s.highStreak).toBe(0);
  });

  it('residents eat pests: −3 damage and +1 trigger night per species (max 3)', () => {
    expect([0, 1, 2, 3, 5].map(pestDamageWith)).toEqual([PEST_DAMAGE, 12, 9, 6, 6]);
    expect([0, 1, 3, 5].map(pestTriggerDays)).toEqual([PEST_TRIGGER_DAYS, 4, 6, 6]);
    const s = game();
    s.pest = { active: true, lowNDays: 0, wetDays: 0, since: day };
    const D = day;
    expect(previewNight(s, D, ['clear'], null).pest).toBe(15);
    s.residents = ['sparrow', 'butterfly'];
    expect(previewNight(s, D, ['clear'], null).pest).toBe(9);
  });

  it('residents no longer add 養分', () => {
    const a = game();
    const b = game();
    b.residents = ['sparrow', 'butterfly', 'owl'];
    expect(previewNight(b, day, ['clear'], null).nAfter).toBe(previewNight(a, day, ['clear'], null).nAfter);
  });
});
