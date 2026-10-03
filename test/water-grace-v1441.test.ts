import { describe, expect, it } from 'vitest';
import { W_NIGHT_LOSS } from '../src/balance';
import { CARE_GRACE_MS, DAY_MS, advanceFlow, createGame, performAction, previewNight, settleDay } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';

// 1.4.41: after 澆水, 水分 does not decay for 5 minutes (game clock), then drifts as before. 施肥 has no grace.
const D = '2026-09-25';
const MIDNIGHT = new Date(2026, 8, 25).getTime();
const MIN = 60 * 1000;
const PER_MS = W_NIGHT_LOSS / DAY_MS;

function game(): GameState {
  const s = createGame(D);
  s.started = true;
  s.ageDays = 5;
  s.lastSeenDate = D;
  s.care = { ...s.care, date: D };
  return Object.assign(s, { health: 70, moisture: 54.46, nutrients: 70, resist: 0 });
}
const tick = (s: GameState, t: number) => advanceFlow(s, D, [], null, t, { dayStartMs: MIDNIGHT });

describe('1.4.41 澆水 grace (W does not decay for 5 minutes)', () => {
  it('a 5 min window after the tap: W stays at the watered value (no immediate "+5 then −1"), then resumes at the normal rate', () => {
    const s = game();
    const t0 = MIDNIGHT + 10 * 60 * MIN;
    tick(s, t0);
    s.moisture = 54.46;
    expect(performAction(s, 'water', t0).ok).toBe(true);
    const watered = s.moisture;
    expect(watered).toBeCloseTo(59.5, 6); // waterAdd rounds to 0.1 → shown as 60 …
    expect(s.pause?.w).toBe(t0 + CARE_GRACE_MS);
    for (let t = t0 + 1000; t <= t0 + CARE_GRACE_MS; t += 1000) tick(s, t);
    expect(s.moisture).toBe(watered); // … and stays 60 for the whole grace
    expect(Math.round(s.moisture)).toBe(60);
    tick(s, t0 + CARE_GRACE_MS + 60 * MIN);
    expect(s.moisture).toBeCloseTo(watered - 60 * MIN * PER_MS, 5);
  });

  it('a tick that spans the end of the grace only drifts the part after it', () => {
    const s = game();
    const t0 = MIDNIGHT + 8 * 60 * MIN;
    tick(s, t0);
    performAction(s, 'water', t0);
    const watered = s.moisture;
    tick(s, t0 + 2 * MIN);
    tick(s, t0 + 9 * MIN); // 3 min of grace left + 4 min of drift
    expect(s.moisture).toBeCloseTo(watered - 4 * MIN * PER_MS, 6);
  });

  it('closed app: the catch-up honours the grace measured from the tap (survives a save round-trip)', () => {
    const s = game();
    const t0 = MIDNIGHT + 12 * 60 * MIN;
    tick(s, t0);
    performAction(s, 'water', t0);
    const watered = s.moisture;
    const back = parseSave(JSON.stringify(s))!;
    expect(back.pause?.w).toBe(t0 + CARE_GRACE_MS);
    tick(back, t0 + 3 * 60 * MIN); // reopened 3 h later, one catch-up
    expect(back.moisture).toBeCloseTo(watered - (3 * 60 * MIN - CARE_GRACE_MS) * PER_MS, 5);
  });

  it('今晚預計 matches the settlement exactly while a grace is running', () => {
    const s = game();
    const t0 = MIDNIGHT + 23 * 60 * MIN + 57 * MIN; // grace runs past midnight's top-up start
    tick(s, t0);
    performAction(s, 'water', t0);
    tick(s, t0 + MIN);
    const plan = previewNight(s, D, [], null);
    const res = settleDay(s, D, [], null, t0 + MIN);
    expect(Math.abs(plan.water.wAfter - res.settlement.wAfter)).toBeLessThan(1e-6);
  });

  it('施肥 has no grace (養分 is not rounded on top-up, so it never showed the drop)', () => {
    const s = game();
    const t0 = MIDNIGHT + 9 * 60 * MIN;
    tick(s, t0);
    performAction(s, 'fertilize', t0);
    const fed = s.nutrients;
    expect(s.pause?.w).toBeUndefined();
    tick(s, t0 + 60 * MIN);
    expect(s.nutrients).toBeLessThan(fed);
  });

  it('no grace on a timeline before the tap (an old flow that lags is caught up normally first)', () => {
    const s = game();
    const t0 = MIDNIGHT + 6 * 60 * MIN;
    tick(s, t0 - 60 * MIN);
    const before = s.moisture;
    performAction(s, 'water', t0); // flow still at t0 − 1 h
    tick(s, t0 + CARE_GRACE_MS);
    expect(s.moisture).toBeCloseTo(Math.min(150, Math.round((before + 5) * 10) / 10) - 60 * MIN * PER_MS, 5);
  });
});
