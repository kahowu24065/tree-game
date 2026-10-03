import { describe, expect, it } from 'vitest';
import { STAMP_KEY, createMirror, planHydrate } from '../src/native/persist';
import { kvSet, setKvMirror, setKvStore } from '../src/native/kv';
import { actionLimit, advanceFlow, createGame, performAction } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';

// 1.4.42 regression (iPhone, 1.4.41): water / feed / 除蟲 / 疏水, close the app, reopen → the actions were gone.
// Cause: the native mirror (Preferences) lagged behind localStorage and always won on start.
class MemStorage implements Storage {
  m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
}
const SAVE = 'sekai-tree-v2';
const D = '2026-10-03';
const T0 = new Date(2026, 9, 3, 21, 0).getTime();
const obj = (s: Storage) => Object.fromEntries([...Array(s.length).keys()].map((i) => [s.key(i)!, s.getItem(s.key(i)!)!]));

function planted(): GameState {
  const g = createGame(D);
  g.started = true;
  g.lastSeenDate = D;
  g.care = { ...g.care, date: D };
  g.pest = { active: true, lowNDays: 0, wetDays: 0, since: D };
  return Object.assign(g, { moisture: 60, nutrients: 50 });
}

describe('1.4.42 actions survive close / reopen on native', () => {
  it('action → save → app killed before the mirror caught up → reopen keeps effects and remaining uses', async () => {
    const local = new MemStorage();
    const prefs: Record<string, string> = {};
    // Before today's care: both copies agree (stamped).
    const before = planted();
    local.setItem(SAVE, JSON.stringify(before));
    local.setItem(STAMP_KEY, '1');
    Object.assign(prefs, obj(local));
    // The mirror stalls (as when iOS suspends / kills the app right after the taps).
    setKvStore(local);
    setKvMirror(createMirror(local, { set: () => new Promise(() => {}), remove: () => new Promise(() => {}) }, () => T0));
    const s = parseSave(local.getItem(SAVE)!)!;
    advanceFlow(s, D, [], null, T0, { dayStartMs: new Date(2026, 9, 3).getTime() });
    for (const a of ['water', 'fertilize', 'deworm', 'drain'] as const) {
      expect(performAction(s, a, T0).ok, a).toBe(true);
      kvSet(SAVE, JSON.stringify(s));
    }
    // Reopen: hydrate must keep the newer localStorage save, not restore the old Preferences copy.
    const plan = planHydrate(prefs, obj(local));
    expect(plan.toLocal).toEqual([]);
    const reopened = parseSave(local.getItem(SAVE)!)!;
    expect(reopened.care).toMatchObject({ water: 1, fertilize: 1, drain: 1, dewormed: true });
    expect(reopened.pest.active).toBe(false);
    expect(reopened.nutrients).toBeCloseTo(s.nutrients, 6);
    expect(reopened.moisture).toBeCloseTo(s.moisture, 6);
    expect(reopened.pause?.w).toBe(s.pause?.w); // the 1.4.41 watering grace round-trips too
    expect(actionLimit(reopened, 'fertilize')).toEqual(actionLimit(s, 'fertilize'));
    expect(actionLimit(reopened, 'drain')).toEqual(actionLimit(s, 'drain'));
    expect(actionLimit(reopened, 'water')).toEqual(actionLimit(s, 'water'));
    // …and the plan sends it to Preferences, stamp last.
    expect(plan.toPrefs.at(-1)?.[0]).toBe(STAMP_KEY);
    expect(JSON.parse(plan.toPrefs.find(([k]) => k === SAVE)![1]).care.fertilize).toBe(1);
  });

  it('the 5-minute watering grace does not touch the care counters on a reload catch-up', () => {
    const s = planted();
    advanceFlow(s, D, [], null, T0, { dayStartMs: new Date(2026, 9, 3).getTime() });
    performAction(s, 'water', T0);
    const back = parseSave(JSON.stringify(s))!;
    advanceFlow(back, D, [], null, T0 + 60 * 60 * 1000, { dayStartMs: new Date(2026, 9, 3).getTime() });
    expect(back.care.water).toBe(1);
    expect(back.care.waterInHour).toBe(1);
  });
});
