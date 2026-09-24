import { describe, expect, it } from 'vitest';
import { eventForDate } from '../src/content';
import { daysBetween } from '../src/dates';
import {
  HEALTH_FLOOR,
  catchUp,
  closeDay,
  createGame,
  growthBudget,
  insertDebugStorm,
  performAction,
  prepScore,
  refreshUnlocks,
  setLogClock,
  setReinforcement,
  stormOutcome,
  treeMetrics,
} from '../src/sim';
import { visualHeight } from '../src/three/tree3d';
import type { DayCond, GameState } from '../src/types';
import { classify, condFromForecast, mildDay, overrideDay } from '../src/weather';

function calm(date: string): DayCond {
  const cond = condFromForecast(mildDay(date));
  cond.raining = false;
  cond.hot = false;
  return cond;
}

function tuned(date: string): GameState {
  const state = createGame(date);
  state.started = true;
  state.health = 86;
  state.moisture = 64;
  state.nutrients = 50;
  state.pests = 8;
  return state;
}

describe('天氣判斷', () => {
  it('分辨暴雨、強風、颱風同酷熱', () => {
    expect(classify({ precipMm: 25, gustKmh: 10, windKmh: 10, tempMax: 28 }).stormKind).toBe('heavy-rain');
    expect(classify({ precipMm: 24, gustKmh: 10, windKmh: 10, tempMax: 28 }).stormKind).toBeNull();
    expect(classify({ precipMm: 0, gustKmh: 62, windKmh: 10, tempMax: 26 }).stormKind).toBe('gale');
    expect(classify({ precipMm: 0, gustKmh: 20, windKmh: 41, tempMax: 26 }).stormKind).toBe('gale');
    expect(classify({ precipMm: 80, gustKmh: 118, windKmh: 40, tempMax: 27 }).stormKind).toBe('typhoon');
    expect(classify({ precipMm: 10, gustKmh: 40, windKmh: 63, tempMax: 27 }).stormKind).toBe('typhoon');
    expect(classify({ precipMm: 0, gustKmh: 20, windKmh: 10, tempMax: 33 }).heat).toBe(true);
    expect(classify({ precipMm: 0, gustKmh: 61, windKmh: 40, tempMax: 30 }).stormKind).toBeNull();
  });
});

describe('每日照顧', () => {
  it('澆水每日只得一次，落雨就唔使澆', () => {
    const state = tuned('2026-09-24');
    const cond = calm('2026-09-24');
    expect(performAction(state, 'water', cond).ok).toBe(true);
    expect(performAction(state, 'water', cond).ok).toBe(false);
    const rainy = tuned('2026-09-24');
    const wet = calm('2026-09-24');
    wet.raining = true;
    expect(performAction(rainy, 'water', wet).ok).toBe(false);
    expect(rainy.care.watered).toBe(false);
  });

  it('同一日幾件事先計一日', () => {
    const state = tuned('2026-09-24');
    const cond = calm('2026-09-24');
    const before = state.heightCm;
    performAction(state, 'water', cond);
    performAction(state, 'fertilize', cond);
    expect(state.daysCared).toBe(1);
    expect(state.heightCm).toBeGreaterThan(before);
  });

  it('有照顧的一日長得比丟空多', () => {
    const cared = tuned('2026-09-24');
    const away = tuned('2026-09-24');
    const cond = calm('2026-09-24');
    cared.care.watered = true;
    cared.care.fertilized = true;
    const a = growthBudget(cared, cond, { cared: true, visited: true, bonus: 1 });
    const b = growthBudget(away, cond, { cared: false, visited: false, bonus: 1 });
    expect(a).toBeGreaterThan(b);
  });
});

describe('風暴', () => {
  it('加固足夠就捱過並有獎，冇準備就受傷但唔會死', () => {
    const safe = tuned('2026-09-01');
    insertDebugStorm(safe, '2026-09-01', 'typhoon');
    safe.reinforcement = { stakes: true, ropes: true, prune: true };
    expect(prepScore(safe.reinforcement)).toBe(3);
    expect(stormOutcome('typhoon', 3)).toBe('safe');
    const before = safe.heightCm;
    closeDay(safe, '2026-09-01', condFromForecast(overrideDay(mildDay('2026-09-01'), 'typhoon')));
    expect(safe.storms[0]?.outcome).toBe('safe');
    expect(safe.stormSurvivals).toBe(1);
    expect(safe.heightCm).toBeGreaterThan(before);
    expect(safe.reinforcement.stakes).toBe(false);

    const hit = tuned('2026-09-01');
    hit.health = 80;
    insertDebugStorm(hit, '2026-09-01', 'typhoon');
    closeDay(hit, '2026-09-01', condFromForecast(overrideDay(mildDay('2026-09-01'), 'typhoon')));
    expect(hit.storms[0]?.outcome).toBe('hit');
    expect(hit.stormSurvivals).toBe(0);
    expect(hit.health).toBeGreaterThanOrEqual(HEALTH_FLOOR);
    expect(hit.health).toBeLessThan(80);
    expect(hit.scars).toBeGreaterThan(0);

    expect(stormOutcome('typhoon', 1)).toBe('partial');
    expect(stormOutcome('heavy-rain', 1)).toBe('safe');
    expect(stormOutcome('gale', 1)).toBe('partial');
  });

  it('風暴日過咗先結算一次', () => {
    const state = tuned('2026-09-01');
    insertDebugStorm(state, '2026-09-02', 'heavy-rain');
    catchUp(state, '2026-09-03', (date) => condFromForecast(mildDay(date)), false);
    expect(state.storms.filter((s) => s.resolved)).toHaveLength(1);
    expect(state.stormSurvivals).toBe(0);
    const health = state.health;
    catchUp(state, '2026-09-03', (date) => condFromForecast(mildDay(date)), false);
    expect(state.storms.filter((s) => s.resolved)).toHaveLength(1);
    expect(state.health).toBe(health);
  });
});

describe('日子同動物', () => {
  it('離開好多日都唔會枯死，而且仍然有少少生長', () => {
    const state = tuned('2026-01-01');
    const before = state.heightCm;
    catchUp(state, '2026-02-10', (date) => condFromForecast(mildDay(date)), false);
    expect(daysBetween('2026-01-01', '2026-02-10')).toBe(40);
    expect(state.health).toBeGreaterThanOrEqual(HEALTH_FLOOR);
    expect(state.heightCm).toBeGreaterThan(before);
    expect(state.lastSeenDate).toBe('2026-02-10');
  });

  it('動物跟高度、健康、酷熱同風暴解鎖', () => {
    const state = tuned('2026-09-01');
    expect(state.animals).toContain('butterfly');
    state.heightCm = 800;
    state.health = 90;
    refreshUnlocks(state, { hot: false, date: '2026-09-01' });
    expect(state.animals).toContain('woodpecker');
    expect(state.animals).not.toContain('cicada');
    expect(state.animals).not.toContain('kingfisher');
    refreshUnlocks(state, { hot: true, date: '2026-09-01' });
    expect(state.animals).toContain('cicada');
    state.stormSurvivals = 1;
    refreshUnlocks(state, { hot: false, date: '2026-09-01' });
    expect(state.animals).toContain('kingfisher');
  });

  it('同一日的小事唔會變', () => {
    expect(eventForDate('2026-09-24').id).toBe(eventForDate('2026-09-24').id);
  });

  it('成長日誌會記低時間、種類同獎勵', () => {
    setLogClock(() => '09:15');
    const state = tuned('2026-09-25');
    state.moisture = 30;
    performAction(state, 'water', calm('2026-09-25'));
    const entry = state.log[0]!;
    expect(entry.kind).toBe('water');
    expect(entry.title).toBe('已澆水');
    expect(entry.time).toBe('09:15');
    expect(entry.reward?.text).toMatch(/水分|健康/);
    setReinforcement(state, 'stakes', true);
    expect(state.log[0]!.kind).toBe('reinforce');
    expect(state.log[0]!.reward?.tone).toBe('orange');
    setLogClock(() => '');
  });

  it('狀態卡數值喺 0 至 100 之間，樹越大根系越好', () => {
    const state = tuned('2026-09-25');
    const small = treeMetrics(state);
    state.heightCm = 6000;
    const big = treeMetrics(state);
    for (const v of [small.canopy, small.roots, big.canopy, big.roots]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(big.roots).toBeGreaterThan(small.roots);
  });

  it('3D 樹的視覺高度隨真實高度單調上升', () => {
    let last = -1;
    for (const cm of [0, 5, 18, 50, 120, 200, 800, 2000, 5000, 11620, 30000]) {
      const v = visualHeight(cm);
      expect(v).toBeGreaterThan(last);
      last = v;
    }
    expect(visualHeight(30000)).toBeLessThanOrEqual(15);
  });
});
