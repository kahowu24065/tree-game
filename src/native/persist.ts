import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';
import { kvSet, setKvMirror } from './kv';

/** localStorage keys the game persists (save, meta, dev, place, quality, hints, notify toggle…). */
export const PERSIST_PREFIXES = ['sekai-tree', 'yiri-yisyu'] as const;

export function isPersistKey(key: string): boolean {
  return PERSIST_PREFIXES.some((p) => key.startsWith(p));
}

/**
 * 1.4.42: write stamp. Bumped (monotonic ms) on every game-key write and mirrored to Preferences *after* that write,
 * so on start the newer of localStorage / Preferences wins instead of Preferences always winning.
 */
export const STAMP_KEY = 'sekai-tree-stamp';

export interface HydratePlan {
  /** Entries to write into localStorage before the game boots. */
  toLocal: [string, string][];
  /** Entries to copy into Preferences (first run, or localStorage is newer). */
  toPrefs: [string, string][];
}

const stampOf = (m: Record<string, string>): number => {
  const n = Number(m[STAMP_KEY]);
  return Number.isFinite(n) ? n : 0;
};

/** Game keys whose absence in localStorage means the WebView lost its storage. */
export const SAVE_KEYS = ['sekai-tree-v2', 'sekai-tree-grove'] as const;
const hasSave = (m: Record<string, string>) => SAVE_KEYS.some((k) => !!m[k]);

/**
 * localStorage is primary; Preferences is the backup that survives WebView storage clean-ups. On start (1.4.44):
 * - Preferences empty → copy localStorage into it;
 * - localStorage has no save (WebView storage lost) or Preferences' stamp is strictly newer → Preferences into
 *   localStorage;
 * - otherwise (local newer, equal, or no stamps at all — every pre-1.4.44 iPhone copy) → keep localStorage and copy
 *   the keys that differ into Preferences (stamp last).
 */
export function planHydrate(prefs: Record<string, string>, local: Record<string, string>): HydratePlan {
  const prefKeys = Object.keys(prefs).filter(isPersistKey);
  const localKeys = Object.keys(local).filter(isPersistKey);
  const stampLast = (keys: string[]) => [...keys.filter((k) => k !== STAMP_KEY), ...keys.filter((k) => k === STAMP_KEY)];
  if (!prefKeys.length) return { toLocal: [], toPrefs: stampLast(localKeys).map((k) => [k, local[k]!]) };
  if (!hasSave(local) || stampOf(prefs) > stampOf(local)) return { toLocal: stampLast(prefKeys).map((k) => [k, prefs[k]!]), toPrefs: [] };
  return { toLocal: [], toPrefs: stampLast(localKeys.filter((k) => prefs[k] !== local[k])).map((k) => [k, local[k]!]) };
}

/** Diagnostics: which copy planHydrate picks and why (same rules, as text). */
export function hydrateReason(prefs: Record<string, string>, local: Record<string, string>): string {
  if (!Object.keys(prefs).filter(isPersistKey).length) return 'prefs-empty→copy-local-to-prefs';
  if (!hasSave(local)) return 'local-has-no-save→prefs-to-local';
  if (stampOf(prefs) > stampOf(local)) return 'prefs-newer→prefs-to-local';
  return stampOf(prefs) === stampOf(local) ? `stamps-equal(${stampOf(local) || 'none'})→keep-local,push-to-prefs` : 'local-newer→keep-local,push-to-prefs';
}

export interface NativeWrite {
  key: string;
  bytes: number;
  ok: boolean;
  ms: number;
  err?: string;
}

/** Diagnostics: live state of the native mirror queue (a write that never settles would stall it here). */
export const nativeQueue = { busySince: 0, pending: 0, batches: 0, fails: 0 };

export interface KvBackend {
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * 1.4.44 native mirror (no longer patches localStorage — see kv.ts). `set` / `remove` are called by kvSet / kvRemove
 * right after the localStorage write. Coalesced: only the latest value of each key is sent, the write stamp is bumped
 * in localStorage after the data and sent last. Failed writes stay queued for the next drain / flush.
 */
export interface Mirror {
  set(key: string, value: string): void;
  remove(key: string): void;
  flush(): Promise<void>;
}

export function createMirror(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  backend: KvBackend,
  now: () => number = Date.now,
  onBatch?: (writes: NativeWrite[]) => void,
): Mirror {
  const clock = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
  const pending = new Map<string, string | null>();
  let stamp = Number(storage.getItem(STAMP_KEY)) || 0;
  let running: Promise<void> | null = null;
  const touch = () => {
    stamp = Math.max(now(), stamp + 1);
    try {
      storage.setItem(STAMP_KEY, String(stamp));
    } catch {
      /* quota: the native copy still gets the stamp */
    }
    pending.delete(STAMP_KEY);
    pending.set(STAMP_KEY, String(stamp));
  };
  const queue = (key: string, value: string | null) => {
    if (!isPersistKey(key) || key === STAMP_KEY) return;
    pending.delete(key);
    pending.set(key, value);
    touch();
    nativeQueue.pending = pending.size;
    void drain();
  };
  const drain = (): Promise<void> => {
    if (running) return running;
    running = (async () => {
      let failed = 0;
      nativeQueue.busySince = Date.now();
      while (pending.size && failed < 3) {
        const batch = [...pending.entries()];
        pending.clear();
        nativeQueue.batches++;
        let ok = true;
        const writes: NativeWrite[] = [];
        for (const [k, v] of batch) {
          const t0 = clock();
          try {
            if (v === null) await backend.remove(k);
            else await backend.set(k, v);
            writes.push({ key: k, bytes: v === null ? -1 : v.length, ok: true, ms: Math.round(clock() - t0) });
          } catch (e) {
            writes.push({ key: k, bytes: v === null ? -1 : v.length, ok: false, ms: Math.round(clock() - t0), err: String(e).slice(0, 80) });
            ok = false;
            // Keep it for a retry unless a newer value arrived meanwhile.
            if (!pending.has(k)) pending.set(k, v);
          }
        }
        failed = ok ? 0 : failed + 1;
        if (!ok) nativeQueue.fails++;
        nativeQueue.pending = pending.size;
        try {
          onBatch?.(writes);
        } catch {
          /* diagnostics only */
        }
      }
    })().finally(() => {
      running = null;
      nativeQueue.busySince = 0;
      nativeQueue.pending = pending.size;
    });
    return running;
  };
  return {
    set: (key, value) => queue(key, String(value)),
    remove: (key) => queue(key, null),
    flush: async () => {
      for (let i = 0; i < 3 && (running || pending.size); i++) await drain();
    },
  };
}

function snapshot(storage: Storage): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k !== null) out[k] = storage.getItem(k) ?? '';
  }
  return out;
}

let mirror: Mirror | null = null;
/** Wait until every mirrored write has reached Preferences (call before reloading the page / going to background). */
export function flushPersist(): Promise<void> {
  return mirror ? mirror.flush() : Promise.resolve();
}

/** WebKit leftovers of the pre-1.4.44 `localStorage.setItem = …` wrapper (stored as items, not methods). */
export function removeStrayWrapperItems(storage: Pick<Storage, 'getItem' | 'removeItem'>): string[] {
  const gone: string[] = [];
  for (const k of ['setItem', 'removeItem']) {
    try {
      if (storage.getItem(k) !== null) {
        storage.removeItem(k);
        gone.push(k);
      }
    } catch {
      /* ignore */
    }
  }
  return gone;
}
/** 1.4.43 diagnostics: what happened in hydrateNative (both copies as found, the choice, timings). */
export interface HydrateInfo {
  native: boolean;
  ms: number;
  reason: string;
  prefsKeys: number;
  localKeys: number;
  prefs: Record<string, string>;
  local: Record<string, string>;
  toLocal: number;
  toPrefs: number;
  err?: string;
  /** Leftover wrapper items removed this launch. */
  stray?: string[];
}
export let hydrateInfo: HydrateInfo = { native: false, ms: 0, reason: 'web (no native copy)', prefsKeys: 0, localKeys: 0, prefs: {}, local: {}, toLocal: 0, toPrefs: 0 };

let batchObserver: ((writes: NativeWrite[]) => void) | undefined;
/** Diagnostics: called after every batch of native mirror writes with per-key result and latency. */
export function observeNativeWrites(fn: (writes: NativeWrite[]) => void): void {
  batchObserver = fn;
}

/** Diagnostics: result of the start-up mirror probe ("ok …" / "FAILED …"); resolves once checked. */
export let mirrorProbe: Promise<string> = Promise.resolve('n/a (web)');
const PROBE_KEY = 'sekai-tree-mirror-probe';

/**
 * Native only: reconcile localStorage with the Preferences backup before the game boots, then install the mirror
 * used by kvSet / kvRemove. Web: no-op (kvSet just writes localStorage).
 */
export async function hydrateNative(): Promise<void> {
  if (!isNative()) return;
  const t0 = Date.now();
  const stray = removeStrayWrapperItems(localStorage);
  const local = snapshot(localStorage);
  hydrateInfo = { native: true, ms: 0, reason: 'error', prefsKeys: 0, localKeys: Object.keys(local).filter(isPersistKey).length, prefs: {}, local, toLocal: 0, toPrefs: 0, stray };
  try {
    const { keys } = await Preferences.keys();
    const prefs: Record<string, string> = {};
    for (const key of keys.filter(isPersistKey)) {
      const { value } = await Preferences.get({ key });
      if (value !== null) prefs[key] = value;
    }
    const plan = planHydrate(prefs, local);
    hydrateInfo = { ...hydrateInfo, prefs, prefsKeys: Object.keys(prefs).length, reason: hydrateReason(prefs, local), toLocal: plan.toLocal.length, toPrefs: plan.toPrefs.length };
    for (const [k, v] of plan.toLocal) localStorage.setItem(k, v);
    for (const [key, value] of plan.toPrefs) await Preferences.set({ key, value });
    mirror = createMirror(
      localStorage,
      {
        set: (key, value) => Preferences.set({ key, value }),
        remove: (key) => Preferences.remove({ key }),
      },
      Date.now,
      (w) => batchObserver?.(w),
    );
    setKvMirror(mirror);
    const m = mirror;
    mirrorProbe = (async () => {
      const value = String(Date.now());
      const before = localStorage.getItem(STAMP_KEY);
      const p0 = Date.now();
      try {
        kvSet(PROBE_KEY, value);
        await m.flush();
        const got = (await Preferences.get({ key: PROBE_KEY })).value;
        const stamped = localStorage.getItem(STAMP_KEY) !== before;
        return got === value && stamped ? `ok (${Date.now() - p0}ms, stamp set)` : `FAILED (native ${got === value ? 'ok' : 'missing'}, stamp ${stamped ? 'set' : 'NOT set'})`;
      } catch (e) {
        return `FAILED ${String(e).slice(0, 80)}`;
      }
    })();
  } catch (e) {
    hydrateInfo = { ...hydrateInfo, err: String(e).slice(0, 120) };
    mirrorProbe = Promise.resolve('FAILED (Preferences unavailable)');
    /* Preferences unavailable: the game keeps using localStorage as on the web. */
  }
  hydrateInfo.ms = Date.now() - t0;
}
