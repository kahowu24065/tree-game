// 1.4.64: daily-goal reward → lowest W/N/R or fauna score; per-tree goals; stage visit weights; share card goals.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { createGame } from '../src/sim';
import {
  FAUNA_SCORE_MAX,
  FAUNA_SCORE_STEP,
  GOAL_REWARD,
  careHealthy,
  claimGoals,
  doableGoals,
  ensureGoals,
  faunaUnlockedCount,
  lowestCare,
  pickGoals,
} from '../src/goals';
import { FAUNA_UNLOCK_ORDER, faunaExtraUnlocked, faunaUnlockPoolSize, syncFaunaUnlocks } from '../src/faunaScore';
import { visitWeight, STAGE_CATEGORY_WEIGHT } from '../src/data/eco';
import { animalById } from '../src/data/animals';
import { cardLines } from '../src/shareCard';
import { goalsCardHtml } from '../src/ui';
import { useLocale, tables } from '../src/i18n';

describe('goal reward → lowest care or fauna score', () => {
  it('picks the lowest of W / N / R', () => {
    expect(lowestCare({ moisture: 40, nutrients: 80, resist: 70 })).toBe('moisture');
    expect(lowestCare({ moisture: 90, nutrients: 20, resist: 70 })).toBe('nutrients');
    expect(lowestCare({ moisture: 90, nutrients: 80, resist: 10 })).toBe('resist');
  });

  it('treats the optimal bands as healthy', () => {
    expect(careHealthy({ moisture: 70, nutrients: 60, resist: 60 })).toBe(true);
    expect(careHealthy({ moisture: 40, nutrients: 80, resist: 80 })).toBe(false);
    expect(careHealthy({ moisture: 70, nutrients: 50, resist: 80 })).toBe(false);
  });

  it('tops up the lowest bar, or adds fauna score when all healthy', () => {
    const s = createGame('2026-10-10');
    s.started = true;
    s.moisture = 40;
    s.nutrients = 80;
    s.resist = 70;
    const g = ensureGoals(s, '2026-10-10', { pest: false, cold: false, seed: 'a' });
    for (const id of g.ids) {
      if (id === 'water2') s.moisture = 100;
      else if (id === 'feed') s.care = { ...s.care, date: '2026-10-10', fertilize: 1 };
      else s.goals!.noted.push(id);
    }
    // After water2 auto-complete via saturation, put W back as lowest for the reward.
    s.moisture = 40;
    const r = claimGoals(s, '2026-10-10');
    expect(r).toEqual({ kind: 'moisture', amount: GOAL_REWARD });
    expect(s.moisture).toBe(40 + GOAL_REWARD);

    const s2 = createGame('2026-10-10');
    s2.started = true;
    s2.moisture = 70;
    s2.nutrients = 80;
    s2.resist = 70;
    s2.faunaScore = 8;
    const g2 = ensureGoals(s2, '2026-10-10', { pest: false, cold: false, seed: 'b' });
    for (const id of g2.ids) {
      if (id === 'water2') s2.moisture = 100; // still in optimal after? 100 is top of band
      else if (id === 'feed') s2.care = { ...s2.care, date: '2026-10-10', fertilize: 1 };
      else s2.goals!.noted.push(id);
    }
    // Keep all healthy for the claim.
    s2.moisture = 70;
    s2.nutrients = 80;
    s2.resist = 70;
    const r2 = claimGoals(s2, '2026-10-10');
    expect(r2 && r2.kind).toBe('fauna');
    expect(s2.faunaScore).toBe(8 + FAUNA_SCORE_STEP);
    expect(faunaUnlockedCount(10)).toBe(1);
    expect(syncFaunaUnlocks(s2, '2026-10-10').length).toBeGreaterThanOrEqual(1);
    expect(faunaExtraUnlocked(s2)).toBe(1);
  });
});

describe('per-tree doable goals', () => {
  it('never asks for 除蟲 / 保暖 when those actions are not on screen', () => {
    expect(doableGoals({ pest: false, cold: false, seed: 'x' })).not.toContain('deworm');
    expect(doableGoals({ pest: false, cold: false, seed: 'x' })).not.toContain('warm');
    expect(doableGoals({ pest: true, cold: true, seed: 'x' })).toEqual(expect.arrayContaining(['deworm', 'warm']));
  });

  it('gives different trees different sets on the same day', () => {
    const a = pickGoals('2026-10-10', { pest: false, cold: false, seed: 'tree-A' }).join(',');
    const b = pickGoals('2026-10-10', { pest: false, cold: false, seed: 'tree-B' }).join(',');
    // Across a few dates at least one pair differs (hash collision possible on a single day).
    const days = ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14'];
    const differ = days.some((d) => pickGoals(d, { pest: false, cold: false, seed: 'tree-A' }).join(',') !== pickGoals(d, { pest: false, cold: false, seed: 'tree-B' }).join(','));
    expect(differ || a !== b).toBe(true);
    expect(pickGoals('2026-10-10', { pest: false, cold: false, seed: 'tree-A' }).length).toBeGreaterThanOrEqual(1);
    expect(pickGoals('2026-10-10', { pest: false, cold: false, seed: 'tree-A' }).length).toBeLessThanOrEqual(3);
  });
});

describe('stage visit weights favour non-birds on a young tree', () => {
  it('weights insects / amphibians above birds at stage 0', () => {
    const bird = visitWeight(animalById('sparrow')!, 0);
    const bug = visitWeight(animalById('ladybug')!, 0);
    const frog = visitWeight(animalById('toad')!, 0);
    expect(bug).toBeGreaterThan(bird);
    expect(frog).toBeGreaterThan(bird);
    expect(STAGE_CATEGORY_WEIGHT[0]!.insect).toBeGreaterThan(STAGE_CATEGORY_WEIGHT[0]!.bird);
  });

  it('adds three non-bird species and a 10-species unlock pool', () => {
    expect(animalById('damselfly')?.category).toBe('insect');
    expect(animalById('grasshopper')?.category).toBe('insect');
    expect(animalById('bullfrog')?.category).toBe('amphibian');
    expect(faunaUnlockPoolSize()).toBe(FAUNA_UNLOCK_ORDER.length);
    expect(FAUNA_SCORE_MAX / 10).toBe(FAUNA_UNLOCK_ORDER.length);
  });
});

describe('share card and goals UI', () => {
  it('shows the fauna bar; share card uses vignette from 1.4.66', () => {
    useLocale('zh-HK');
    // 1.4.66: share card shows 「今日小事」 instead of daily goals (see v1466.test.ts).
    expect(cardLines({ treeName: '樹', species: '細葉榕', age: '1 日', height: '20 cm', weather: [], vignette: { title: '小朋友的畫', text: '樹下留低一張畫' } })).toContain('小朋友的畫');
    const s = createGame('2026-10-10');
    s.started = true;
    ensureGoals(s, '2026-10-10', { pest: false, cold: false, seed: 'ui' });
    const html = goalsCardHtml(s, '2026-10-10');
    expect(html).toContain('已額外解鎖');
    expect(html).toContain('fauna-bar');
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['fauna.progress']).toBeTruthy();
      expect(tables()[loc]['share.goals']).toBeTruthy();
    }
    expect(fs.readFileSync('index.html', 'utf8')).toContain('sheet-share');
  });
});
