import { describe, expect, it } from 'vitest';
import type { WeatherEventId } from '../src/balance';
import { nFactor, wFactor } from '../src/rules';
import { DAY_MS, advanceFlow, applyWarningWater, createGame, dailySummaryText, healthZeroInMs, settleDay } from '../src/sim';
import type { GameState } from '../src/types';

const D = '2026-09-25';
const MIDNIGHT = new Date(2026, 8, 25).getTime();
const END = MIDNIGHT + DAY_MS;
const MIN = 60 * 1000;

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame('2026-09-20');
  s.started = true;
  s.ageDays = 5;
  return Object.assign(s, { health: 70, moisture: 70, nutrients: 70, resist: 0 }, over);
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

describe('v1.4.17 水分／養分／健康慢慢變', () => {
  it('成日慢慢扣，晚上結算 ≈ 舊版一次過結算（W70 N70 H70 晴天）', () => {
    const r = tickedDay(game(), ['clear']);
    // Old nightly formula: W −10, N −10, then H += wFactor(W after) + nFactor(N after).
    const oldW = 60;
    const oldN = 60;
    const oldH = 70 + wFactor(oldW) + nFactor(oldN);
    expect(r.wAfter).toBeCloseTo(oldW, 3);
    expect(r.nAfter).toBeCloseTo(oldN, 3);
    expect(r.hAfter).toBeCloseTo(oldH, 1);
    expect(r.day?.dW).toBeCloseTo(-10, 3);
    expect(r.day?.dN).toBeCloseTo(-10, 3);
    expect(r.day?.dH).toBeCloseTo(oldH - 70, 1);
    expect(dailySummaryText(r)).toContain('今日：健康');
  });

  it('分段 tick 同一次過結算結果一樣（包括酷熱冇處理）', () => {
    for (const events of [['clear'], ['hot'], ['drizzle']] as WeatherEventId[][]) {
      const a = tickedDay(game(), events);
      const g = game();
      applyWarningWater(g, D, events, null, MIDNIGHT);
      const b = settleDay(g, D, events, null, END).settlement;
      expect(Math.abs(a.hAfter - b.hAfter)).toBeLessThanOrEqual(0.3); // step boundaries shift slightly with uneven ticks
      expect(a.wAfter).toBeCloseTo(b.wAfter, 3);
      expect(a.nAfter).toBeCloseTo(b.nAfter, 3);
    }
  });

  it('健康 100 上限：晴天多出嚟嘅分數唔會變走，酷熱照扣', () => {
    const clear = tickedDay(game({ health: 100 }), ['clear']);
    expect(clear.hAfter).toBeCloseTo(100, 3);
    const hot = settleDay(game({ health: 100 }), D, ['hot'], null, END).settlement;
    expect(hot.hAfter).toBeLessThanOrEqual(100);
  });

  it('落雨日水分冇自然流失', () => {
    const r = tickedDay(game(), ['drizzle']);
    expect(r.day?.dW).toBeGreaterThanOrEqual(0);
  });

  it('舊存檔（冇 flow）：由今日零時追返，唔會重複扣', () => {
    const s = game();
    expect(s.flow).toBeUndefined();
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + DAY_MS / 2, { dayStartMs: MIDNIGHT });
    expect(s.moisture).toBeCloseTo(65, 3);
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + DAY_MS / 2, { dayStartMs: MIDNIGHT });
    expect(s.moisture).toBeCloseTo(65, 3);
    const r = settleDay(s, D, ['clear'], null, END).settlement;
    expect(r.wAfter).toBeCloseTo(60, 3);
    expect(s.flow?.date).toBe('2026-09-26');
  });

  it('日頭健康慢慢跌到 0 就即刻瀕死，通知估算到時間', () => {
    const s = game({ health: 5, moisture: 10, nutrients: 5 });
    const zeroIn = healthZeroInMs(s, ['clear'], null);
    expect(zeroIn).not.toBeNull();
    expect(zeroIn! / (3600 * 1000)).toBeCloseTo(6, 0);
    advanceFlow(s, D, ['clear'], null, MIDNIGHT, { dayStartMs: MIDNIGHT });
    advanceFlow(s, D, ['clear'], null, MIDNIGHT + 8 * 3600 * 1000, { dayStartMs: MIDNIGHT });
    expect(s.health).toBe(0);
    expect(s.dying?.since).toBe(D);
    expect(s.over).toBeNull();
  });
});
