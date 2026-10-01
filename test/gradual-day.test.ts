import { describe, expect, it } from 'vitest';
import type { WeatherEventId } from '../src/balance';
import { nFactor, wFactor } from '../src/rules';
import { DAY_MS, advanceFlow, applyWarningWater, createGame, dailySummaryText, settleDay } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';

const D = '2026-09-25';
const MIDNIGHT = new Date(2026, 8, 25).getTime();
const END = MIDNIGHT + DAY_MS;
const MIN = 60 * 1000;

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame('2026-09-20');
  s.started = true;
  s.ageDays = 5;
  return Object.assign(s, { health: 70, moisture: 90, nutrients: 70, resist: 0 }, over);
}

/** Tick the whole day in uneven real-time slices (like the app's 1 s tick + a closed-app gap), then settle. */
function tickedDay(s: GameState, events: WeatherEventId[]) {
  let t = MIDNIGHT;
  applyWarningWater(s, D, events, null, t); // the app applies 警告水分 as soon as the warning is known
  advanceFlow(s, D, events, null, t, { dayStartMs: MIDNIGHT });
  const slices = [7 * MIN, 3 * 60 * MIN, 1, 13 * MIN, 9 * 60 * MIN /* app closed */, 47 * MIN];
  for (const ms of slices) {
    t += ms;
    advanceFlow(s, D, events, null, t, { dayStartMs: MIDNIGHT });
  }
  return settleDay(s, D, events, null, END).settlement;
}

describe('v1.4.18 水分／養分慢慢變，健康半夜一次過結算', () => {
  /** Nightly formula (≤ 1.4.16 shape, v1.4.23 W loss 24/day): W/N change first, then H += wFactor(W) + nFactor(N) (+ weather), clamped 0–100. */
  const oldNight = (h: number, w: number, n: number, extra = 0) => {
    const wA = w - 24;
    const nA = n - 10;
    return { w: wA, n: nA, h: Math.max(0, Math.min(100, h + wFactor(wA) + nFactor(nA) + extra)) };
  };

  it('成日慢慢扣，晚上結算 = 舊版一晚結算（完全一樣）', () => {
    for (const [h, w, n] of [[70, 90, 70], [70, 55, 65], [40, 140, 25], [95, 105, 95]]) {
      const r = tickedDay(game({ health: h, moisture: w, nutrients: n }), ['clear']);
      const old = oldNight(h!, w!, n!);
      expect(r.wAfter).toBeCloseTo(old.w, 6);
      expect(r.nAfter).toBeCloseTo(old.n, 6);
      expect(r.hAfter).toBe(old.h);
      expect(r.day?.dH).toBeCloseTo(old.h - h!, 6);
    }
    const r = tickedDay(game(), ['clear']);
    expect(r.day?.dW).toBeCloseTo(-24, 6);
    expect(r.day?.dN).toBeCloseTo(-10, 6);
    expect(dailySummaryText(r)).toContain('今日：健康 +10');
  });

  it('日頭健康唔郁，只喺半夜變', () => {
    const s = game({ health: 70, moisture: 140, nutrients: 10 });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT, { dayStartMs: MIDNIGHT });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + 20 * 3600 * 1000, { dayStartMs: MIDNIGHT });
    expect(s.health).toBe(70);
    expect(s.moisture).toBeLessThan(140);
    expect(s.dying).toBeNull();
  });

  it('日頭水分 120 → 108 → 96：用一日完結嗰刻嘅 96 計，+5', () => {
    const s = game({ moisture: 120, nutrients: 90 });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT, { dayStartMs: MIDNIGHT });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + DAY_MS / 2, { dayStartMs: MIDNIGHT });
    expect(s.moisture).toBeCloseTo(108, 6);
    expect(s.health).toBe(70);
    const r = settleDay(s, D, ['clear'], null, END).settlement;
    expect(r.wAfter).toBe(96);
    expect(r.wFactor).toBe(5);
    expect(r.hAfter).toBe(80);
  });

  it('分段 tick 同一次過結算結果一樣（晴、酷熱冇處理、毛毛雨）', () => {
    for (const events of [['clear'], ['hot'], ['drizzle']] as WeatherEventId[][]) {
      const a = tickedDay(game(), events);
      const g = game();
      applyWarningWater(g, D, events, null, MIDNIGHT);
      const b = settleDay(g, D, events, null, END).settlement;
      expect(a.hAfter).toBe(b.hAfter);
      expect(a.wAfter).toBeCloseTo(b.wAfter, 6);
      expect(a.nAfter).toBeCloseTo(b.nAfter, 6);
    }
  });

  it('健康 100 上限同舊版一樣一次過計', () => {
    expect(tickedDay(game({ health: 100 }), ['clear']).hAfter).toBe(100);
    const g = game({ health: 100 });
    applyWarningWater(g, D, ['hot'], null, MIDNIGHT);
    expect(settleDay(g, D, ['hot'], null, END).settlement.hAfter).toBe(85); // 100 − 10 (W 90 −20 −24 = 46 乾旱) + 5 (N 60) − 10 (酷熱冇處理)
  });

  it('落雨日水分冇自然流失', () => {
    const r = tickedDay(game(), ['drizzle']);
    expect(r.day?.dW).toBeGreaterThanOrEqual(0);
  });

  it('舊存檔（冇 flow）：由今日零時追返，唔會重複扣', () => {
    const s = game();
    expect(s.flow).toBeUndefined();
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + DAY_MS / 2, { dayStartMs: MIDNIGHT });
    expect(s.moisture).toBeCloseTo(78, 6);
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + DAY_MS / 2, { dayStartMs: MIDNIGHT });
    expect(s.moisture).toBeCloseTo(78, 6);
    const r = settleDay(s, D, ['clear'], null, END).settlement;
    expect(r.wAfter).toBeCloseTo(66, 6);
    expect(s.flow?.date).toBe('2026-09-26');
  });

  it('1.4.17 存檔：今日已經 drift 咗嘅健康會還原，等半夜一次過計', () => {
    const s = game({ health: 72.5 });
    s.flow = { date: D, at: MIDNIGHT + DAY_MS / 2, elapsed: DAY_MS / 2, start: { h: 70, w: 70, n: 70, r: 0 }, w: -5, n: -5, r: 0, hw: 2.5, hn: 2.5, hp: -2.5, over: 0 };
    const back = parseSave(JSON.stringify(s))!;
    expect(back.health).toBeCloseTo(70, 6);
    expect(back.flow?.hw).toBeUndefined();
  });

  it('瀕死由半夜結算開始（同舊版一樣）', () => {
    const s = game({ health: 5, moisture: 10, nutrients: 5 });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT, { dayStartMs: MIDNIGHT });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + 20 * 3600 * 1000, { dayStartMs: MIDNIGHT });
    expect(s.health).toBe(5);
    expect(s.dying).toBeNull();
    settleDay(s, D, ['clear'], null, END);
    expect(s.health).toBe(0);
    expect(s.dying).toEqual({ since: D, at: END });
  });
});
