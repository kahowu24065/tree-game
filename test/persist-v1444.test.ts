import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { STAMP_KEY, createMirror, hydrateReason, planHydrate, removeStrayWrapperItems, type KvBackend } from '../src/native/persist';
import { kvSet, setKvMirror, setKvStore } from '../src/native/kv';
import { actionLimit, advanceFlow, createGame, performAction } from '../src/sim';
import { parseSave, saveGame, SAVE_KEY } from '../src/storage';
import { GROVE_KEY, saveGrove } from '../src/grove';
import type { GameState } from '../src/types';

/**
 * WebKit-like Storage: like iOS WKWebView, assigning a property stores a storage item (named-property setter) and
 * does NOT replace the method — the reason the pre-1.4.44 `localStorage.setItem = …` mirror never ran on iPhone.
 */
function webkitStorage(): Storage {
  const m = new Map<string, string>();
  const methods: Record<string, unknown> = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    key: (i: number) => [...m.keys()][i] ?? null,
    clear: () => m.clear(),
  };
  return new Proxy({} as Storage, {
    get: (_, p) => (p === 'length' ? m.size : typeof p === 'string' && p in methods ? methods[p] : m.get(String(p))),
    set: (_, p, v) => (m.set(String(p), String(v)), true),
  });
}
const snap = (s: Storage) => Object.fromEntries([...Array(s.length).keys()].map((i) => [s.key(i)!, s.getItem(s.key(i)!)!]));

/** Preferences stand-in (async, like the Capacitor bridge). */
function prefsBackend() {
  const data: Record<string, string> = {};
  const backend: KvBackend = {
    set: async (k, v) => void (data[k] = v),
    remove: async (k) => void delete data[k],
  };
  return { data, backend };
}

const D = '2026-10-04';
const T0 = new Date(2026, 9, 4, 0, 30).getTime();
function planted(): GameState {
  const g = createGame(D);
  g.started = true;
  g.lastSeenDate = D;
  g.care = { ...g.care, date: D };
  g.pest = { active: true, lowNDays: 0, wetDays: 0, since: D };
  return Object.assign(g, { moisture: 75, nutrients: 50 });
}

afterEach(() => {
  setKvMirror(null);
  setKvStore(null);
});

describe('1.4.44 native mirror without patching localStorage', () => {
  it('WebKit-like storage: the old assignment wrapper never runs (the 1.4.43 iPhone log), kvSet does', async () => {
    const s = webkitStorage();
    let hits = 0;
    (s as unknown as Record<string, unknown>).setItem = () => void hits++;
    s.setItem('sekai-tree-v2', 'x');
    expect(hits).toBe(0); // the method was not replaced…
    expect(s.getItem('setItem')).not.toBeNull(); // …a stray item was stored instead
    expect(removeStrayWrapperItems(s)).toEqual(['setItem']);
    expect(s.getItem('setItem')).toBeNull();

    const p = prefsBackend();
    const m = createMirror(s, p.backend, () => T0);
    setKvStore(s);
    setKvMirror(m);
    kvSet('sekai-tree-v2', 'y');
    kvSet('unrelated', 'z');
    await m.flush();
    expect(p.data['sekai-tree-v2']).toBe('y');
    expect(p.data.unrelated).toBeUndefined();
    expect(s.getItem(STAMP_KEY)).toBe(p.data[STAMP_KEY]); // stamp set locally after the data and sent last
    expect(Number(s.getItem(STAMP_KEY))).toBeGreaterThanOrEqual(T0);
  });

  it('saveGame / saveGrove go through the mirror (latest value coalesced, failed write retried)', async () => {
    const s = webkitStorage();
    const p = prefsBackend();
    let fail = 1;
    const order: string[] = [];
    const m = createMirror(s, { set: async (k, v) => { if (k === SAVE_KEY && fail-- > 0) throw new Error('bridge'); order.push(k); await p.backend.set(k, v); }, remove: p.backend.remove }, () => T0);
    setKvStore(s);
    setKvMirror(m);
    const g = planted();
    for (let i = 0; i < 5; i++) {
      g.moisture = 60 + i;
      saveGame(g);
      saveGrove({ isle: 0, home: g, second: null });
    }
    await m.flush();
    expect(JSON.parse(p.data[SAVE_KEY]!).moisture).toBe(64);
    expect(JSON.parse(p.data[GROVE_KEY]!).home.moisture).toBe(64);
    expect(order.at(-1)).toBe(STAMP_KEY);
  });
});

describe('1.4.44 hydrate: localStorage primary, Preferences backup', () => {
  const L = { [SAVE_KEY]: 'L', [GROVE_KEY]: 'LG' };
  const P = { [SAVE_KEY]: 'P', [GROVE_KEY]: 'PG' };
  it('no stamps anywhere (every pre-1.4.44 iPhone) → keep local, copy to Preferences', () => {
    expect(planHydrate(P, L)).toEqual({ toLocal: [], toPrefs: [[SAVE_KEY, 'L'], [GROVE_KEY, 'LG']] });
    expect(hydrateReason(P, L)).toMatch(/stamps-equal\(none\)→keep-local/);
  });
  it('equal stamps → keep local; only differing keys are copied, stamp last', () => {
    const plan = planHydrate({ ...P, [GROVE_KEY]: 'LG', [STAMP_KEY]: '5' }, { ...L, [STAMP_KEY]: '5' });
    expect(plan).toEqual({ toLocal: [], toPrefs: [[SAVE_KEY, 'L']] });
  });
  it('local newer → keep local', () => {
    expect(planHydrate({ ...P, [STAMP_KEY]: '5' }, { ...L, [STAMP_KEY]: '6' }).toLocal).toEqual([]);
  });
  it('Preferences strictly newer → restore it', () => {
    expect(planHydrate({ ...P, [STAMP_KEY]: '7' }, { ...L, [STAMP_KEY]: '6' }).toLocal).toEqual([[SAVE_KEY, 'P'], [GROVE_KEY, 'PG'], [STAMP_KEY, '7']]);
  });
  it('local has no save (WebView storage lost) → restore Preferences even without stamps', () => {
    expect(planHydrate(P, { 'yiri-yisyu-place': 'geo' }).toLocal).toEqual([[SAVE_KEY, 'P'], [GROVE_KEY, 'PG']]);
  });
  it('Preferences empty → copy local over', () => {
    expect(planHydrate({}, L).toPrefs).toEqual([[SAVE_KEY, 'L'], [GROVE_KEY, 'LG']]);
  });
});

describe('1.4.44 action → kill → reload (WebKit-like storage)', () => {
  async function playThenKill() {
    const local = webkitStorage();
    const p = prefsBackend();
    // Before the fix: a stale, unstamped Preferences copy (W75, nothing done yet) and an unstamped local copy.
    const before = planted();
    Object.assign(p.data, { [SAVE_KEY]: JSON.stringify(before), [GROVE_KEY]: JSON.stringify({ version: 1, isle: 0, home: before, second: null }) });
    local.setItem(SAVE_KEY, JSON.stringify(before));
    local.setItem(GROVE_KEY, JSON.stringify({ version: 1, isle: 0, home: before, second: null }));
    // Launch with the fix: hydrate keeps local, then the mirror is installed.
    const plan = planHydrate({ ...p.data }, snap(local));
    expect(plan.toLocal).toEqual([]);
    for (const [k, v] of plan.toPrefs) await p.backend.set(k, v);
    const m = createMirror(local, p.backend, () => T0);
    setKvStore(local);
    setKvMirror(m);
    const s = parseSave(local.getItem(SAVE_KEY)!)!;
    advanceFlow(s, D, [], null, T0, { dayStartMs: new Date(2026, 9, 4).getTime() });
    for (const a of ['water', 'fertilize', 'deworm', 'drain'] as const) {
      expect(performAction(s, a, T0).ok, a).toBe(true);
      saveGame(s);
      saveGrove({ isle: 0, home: s, second: null });
    }
    await m.flush(); // the bridge writes land (a few ms after each tap on device)
    return { local, p, s };
  }
  const check = (reopened: GameState, s: GameState) => {
    expect(reopened.care).toMatchObject({ water: 1, fertilize: 1, drain: 1, dewormed: true });
    expect(reopened.moisture).toBeCloseTo(s.moisture, 6);
    for (const a of ['water', 'fertilize', 'deworm', 'drain'] as const) expect(actionLimit(reopened, a)).toEqual(actionLimit(s, a));
  };

  it('reopen: both copies stamped equal → local kept, actions intact', async () => {
    const { local, p, s } = await playThenKill();
    expect(p.data[STAMP_KEY]).toBe(local.getItem(STAMP_KEY));
    const plan = planHydrate({ ...p.data }, snap(local));
    expect(plan.toLocal).toEqual([]);
    check(parseSave(local.getItem(SAVE_KEY)!)!, s);
  });

  it('reopen after the WebView lost its storage → Preferences restores the actions', async () => {
    const { p, s } = await playThenKill();
    const plan = planHydrate({ ...p.data }, {});
    const restored = Object.fromEntries(plan.toLocal);
    check(parseSave(restored[SAVE_KEY]!)!, s);
    expect(JSON.parse(restored[GROVE_KEY]!).home.care.fertilize).toBe(1);
  });
});

describe('1.4.44 guard', () => {
  it('no game code writes localStorage directly (only kv.ts / persist.ts / saveLog.ts)', () => {
    const allowed = new Set(['native/kv.ts', 'native/persist.ts', 'native/saveLog.ts']);
    const bad: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.ts$/.test(f)) {
          const rel = p.slice(p.indexOf('src/') + 4);
          if (allowed.has(rel)) continue;
          const src = readFileSync(p, 'utf8');
          if (/localStorage\??\.(setItem|removeItem|clear)\(|'setItem'>\s*=\s*localStorage/.test(src)) bad.push(rel);
        }
      }
    };
    walk(join(__dirname, '..', 'src'));
    expect(bad).toEqual([]);
  });
});
