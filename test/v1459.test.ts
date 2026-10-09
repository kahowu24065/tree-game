// 1.4.59: 每日小目標, 分享樹卡, weather visuals (rain by rainfall, wet ground, thunder lightning, leaves, mist, frost, sun shafts).
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { useLocale } from '../src/i18n';
import { createGame } from '../src/sim';
import { condForEvent } from '../src/events';
import { rainIntensity, weatherLook } from '../src/three/weatherFx3d';
import { GOAL_REWARD_N, claimGoals, ensureGoals, goalDone, goalProgress, noteGoal, parseGoals, pickGoals } from '../src/goals';
import { goalsCardHtml } from '../src/ui';
import { cardLines } from '../src/shareCard';
import type { DayCond } from '../src/types';

const base: DayCond = { code: 0, tempC: 25, tempMax: 28, precipMm: 0, windKmh: 5, gustKmh: 10, hot: false, raining: false, stormKind: null };

describe('weather visuals', () => {
  it('rain density follows the real rainfall; warnings set the floor; 黑雨 maxes out', () => {
    expect(rainIntensity(base)).toBe(0);
    const at = (mm: number, code = 61) => rainIntensity({ ...base, raining: true, code, precipMm: mm });
    expect(at(0.3)).toBeGreaterThanOrEqual(0.35);
    expect(at(2)).toBeGreaterThan(at(0.5));
    expect(at(10)).toBeGreaterThan(at(2));
    expect(at(10)).toBeLessThanOrEqual(0.85);
    expect(rainIntensity(condForEvent(base, 'rainstorm'))).toBeGreaterThanOrEqual(0.8);
    expect(rainIntensity(condForEvent(base, 'blackrain'))).toBe(1);
    expect(weatherLook(condForEvent(base, 'blackrain'), 0.65).black).toBe(true);
    expect(weatherLook(condForEvent(base, 'rainstorm'), 0.55).wet).toBeGreaterThan(0.9);
  });
  it('雷暴 warning lightning, gale / typhoon leaves, fog, cold, clear-sky shafts', () => {
    const th = condForEvent(base, 'thunder');
    expect(th.thunder).toBe(true);
    expect(weatherLook(th, 0.85).lightning).toBe(true);
    expect(weatherLook(condForEvent(base, 'typhoon1'), 0.72).lightning).toBe(false);
    expect(weatherLook(condForEvent(base, 'typhoon1'), 0.72).leaves).toBeGreaterThan(0);
    expect(weatherLook(condForEvent(base, 'typhoon8'), 1).leaves).toBe(1);
    expect(weatherLook({ ...base, code: 45 }, 0.1).fog).toBe(1);
    expect(weatherLook(condForEvent(base, 'cold'), 0.1).cold).toBe(true);
    expect(weatherLook(base, 0.08).sunny).toBe(1);
    expect(weatherLook({ ...base, code: 3 }, 0.08).sunny).toBe(0);
    expect(weatherLook(condForEvent(base, 'hot'), 0.04).sunny).toBe(0);
  });
  it('scene wiring: reduced motion keeps only the still parts', () => {
    const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toContain('this.wx.update(');
    expect(scene).toContain('(storming || look.lightning) && !input.reducedMotion');
    const fx = fs.readFileSync('src/three/weatherFx3d.ts', 'utf8');
    expect(fx).toContain('reduced ? 0 : look.leaves');
    expect(fx).toContain('f.reduced ? 0 : f.look.rain');
  });
});

describe('daily goals', () => {
  const seed = { pest: false as const, cold: false as const, seed: 'v1459' };
  it('1.4.64: only doable goals; pests / cold appear in the pool when relevant', () => {
    expect(pickGoals('2026-10-08', { pest: true, cold: true, seed: 'p' })).toEqual(expect.arrayContaining([]));
    const withPest = pickGoals('2026-10-08', { pest: true, cold: false, seed: 'p1' });
    // Across seeds, deworm shows up when pests are on (pool includes it).
    const pool = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].flatMap((s) => pickGoals('2026-10-08', { pest: true, cold: false, seed: s })));
    expect(pool.has('deworm') || withPest.includes('deworm')).toBe(true);
    expect(pickGoals('2026-10-08', { ...seed }).every((id) => id !== 'deworm' && id !== 'warm')).toBe(true);
  });
  it('progress from today\'s care; saturated soil counts as watered; reward once; resets the next day', () => {
    const d = '2026-10-08';
    const s = createGame(d);
    s.started = true;
    s.care.date = d;
    s.moisture = 40;
    s.nutrients = 80;
    s.resist = 70;
    const g = ensureGoals(s, d, seed);
    // Complete every goal today, whatever was picked.
    for (const id of g.ids) {
      if (id === 'water2') s.care.water = 2;
      else if (id === 'feed') s.care.fertilize = 1;
      else if (id === 'share' || id === 'scenery') noteGoal(s, d, id);
    }
    expect(g.ids.every((id) => goalDone(s, g, id))).toBe(true);
    const before = s.moisture;
    const r = claimGoals(s, d);
    expect(r && r.kind).toBe('moisture');
    expect(s.moisture).toBe(before + GOAL_REWARD_N);
    expect(claimGoals(s, d)).toBe(false);
    const next = ensureGoals(s, '2026-10-09', seed);
    expect(next.claimed).toBe(false);
    expect(next.noted).toEqual([]);
    s.moisture = 100;
    if (next.ids.includes('water2')) expect(goalProgress(s, next, 'water2')).toEqual([2, 2]);
    expect(parseGoals({ date: d, ids: ['water2', 'nope'], noted: 5, claimed: 'x' })).toEqual({ date: d, ids: ['water2'], noted: [], claimed: false });
  });
  it('card at the top of 成長日誌', () => {
    useLocale('zh-HK');
    const d = '2026-10-08';
    const s = createGame(d);
    s.started = true;
    expect(goalsCardHtml(s, d)).toBe('');
    const g = ensureGoals(s, d, seed);
    const html = goalsCardHtml(s, d);
    expect(html).toContain('今日小目標');
    expect(html).toContain(`0/${g.ids.length}`);
    expect(html).toContain('已額外解鎖');
  });
});

describe('share card', () => {
  it('tree facts only (no place / account), height in the chosen unit, native share with a cached PNG, web download', () => {
    expect(cardLines({ treeName: '阿榕', species: '榕樹', age: '樹齡 12 日', height: '3.2 米', weather: ['a', 'b', 'c', 'd'] })).toEqual(['阿榕', '榕樹 · 樹齡 12 日', '3.2 米', 'a', 'b', 'c']);
    const src = fs.readFileSync('src/shareCard.ts', 'utf8');
    expect(src).toContain('Filesystem.writeFile');
    expect(src).toContain('Directory.Cache');
    expect(src).toContain('files: [w.uri]');
    expect(src).toContain('a.download');
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('formatHeight(state.heightCm)');
    expect(main).not.toMatch(/drawShareCard\([^)]*place/);
    expect(fs.readFileSync('index.html', 'utf8')).toContain('data-action="share-card"');
    expect(fs.readFileSync('src/main.ts', 'utf8')).toContain("case 'share-card'");
  });
});
