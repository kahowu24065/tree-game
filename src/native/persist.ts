import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';

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

/**
 * Preferences is the native copy that survives WebView storage clean-ups. On start:
 * - Preferences empty → migrate localStorage into it once;
 * - localStorage has a newer write stamp → it holds writes that had not reached Preferences when the app was
 *   closed (1.4.41 bug: those were then overwritten by the older Preferences copy) → push localStorage to Preferences;
 * - otherwise → Preferences into localStorage (e.g. the WebView lost its storage).
 */
export function planHydrate(prefs: Record<string, string>, local: Record<string, string>): HydratePlan {
  const prefKeys = Object.keys(prefs).filter(isPersistKey);
  const localKeys = Object.keys(local).filter(isPersistKey);
  const all = (m: Record<string, string>, keys: string[]): [string, string][] => keys.map((k) => [k, m[k]!]);
  if (!prefKeys.length) return { toLocal: [], toPrefs: all(local, localKeys) };
  if (localKeys.length && stampOf(local) > stampOf(prefs)) {
    // Stamp last, so an interrupted copy never looks complete.
    const ordered = [...localKeys.filter((k) => k !== STAMP_KEY), ...localKeys.filter((k) => k === STAMP_KEY)];
    return { toLocal: [], toPrefs: all(local, ordered) };
  }
  return { toLocal: all(prefs, prefKeys), toPrefs: [] };
}

/** 1.4.43 diagnostics: which copy planHydrate picks and why (same rules, as text). */
export function hydrateReason(prefs: Record<string, string>, local: Record<string, string>): 'prefs-empty→migrate-local' | 'local-newer→push-to-prefs' | 'prefs-newer-or-equal→prefs-to-local' {
  const prefKeys = Object.keys(prefs).filter(isPersistKey);
  const localKeys = Object.keys(local).filter(isPersistKey);
  if (!prefKeys.length) return 'prefs-empty→migrate-local';
  if (localKeys.length && stampOf(local) > stampOf(prefs)) return 'local-newer→push-to-prefs';
  return 'prefs-newer-or-equal→prefs-to-local';
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
 * Mirror every game-key write/remove on `storage` into `backend`. 1.4.42: coalesced — only the latest value of each
 * key is sent (the save is large and written often; a long queue of stale copies could still be in flight when the
 * app was closed), with the write stamp after the data. Failed writes stay queued for the next drain / flush.
 */
export function installWriteThrough(
  storage: Storage,
  backend: KvBackend,
  now: () => number = Date.now,
  onBatch?: (writes: NativeWrite[]) => void,
): () => Promise<void> {
  const clock = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
  const setItem = storage.setItem.bind(storage);
  const removeItem = storage.removeItem.bind(storage);
  const pending = new Map<string, string | null>();
  let stamp = Number(storage.getItem(STAMP_KEY)) || 0;
  let running: Promise<void> | null = null;
  const touch = () => {
    stamp = Math.max(now(), stamp + 1);
    setItem(STAMP_KEY, String(stamp));
    pending.delete(STAMP_KEY);
    pending.set(STAMP_KEY, String(stamp));
  };
  const queue = (key: string, value: string | null) => {
    pending.delete(key);
    pending.set(key, value);
    touch();
    nativeQueue.pending = pending.size;
    drain();
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
  storage.setItem = (key: string, value: string) => {
    setItem(key, value);
    if (isPersistKey(key) && key !== STAMP_KEY) queue(key, String(value));
  };
  storage.removeItem = (key: string) => {
    removeItem(key);
    if (isPersistKey(key) && key !== STAMP_KEY) queue(key, null);
  };
  return async () => {
    for (let i = 0; i < 3 && (running || pending.size); i++) await drain();
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

let pendingWrites: () => Promise<void> = async () => {};
/** Wait until every mirrored write has reached Preferences (call before reloading the page). */
export function flushPersist(): Promise<void> {
  return pendingWrites();
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
}
export let hydrateInfo: HydrateInfo = { native: false, ms: 0, reason: 'web (no native copy)', prefsKeys: 0, localKeys: 0, prefs: {}, local: {}, toLocal: 0, toPrefs: 0 };

let batchObserver: ((writes: NativeWrite[]) => void) | undefined;
/** Diagnostics: called after every batch of native mirror writes with per-key result and latency. */
export function observeNativeWrites(fn: (writes: NativeWrite[]) => void): void {
  batchObserver = fn;
}

/** Native only: load Preferences into localStorage before the game boots, then write-through. Web: no-op. */
export async function hydrateNative(): Promise<void> {
  if (!isNative()) return;
  const t0 = Date.now();
  const local = snapshot(localStorage);
  hydrateInfo = { native: true, ms: 0, reason: 'error', prefsKeys: 0, localKeys: Object.keys(local).filter(isPersistKey).length, prefs: {}, local, toLocal: 0, toPrefs: 0 };
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
    pendingWrites = installWriteThrough(
      localStorage,
      {
        set: (key, value) => Preferences.set({ key, value }),
        remove: (key) => Preferences.remove({ key }),
      },
      Date.now,
      (w) => batchObserver?.(w),
    );
  } catch (e) {
    hydrateInfo = { ...hydrateInfo, err: String(e).slice(0, 120) };
    /* Preferences unavailable: the game keeps using localStorage as on the web. */
  }
  hydrateInfo.ms = Date.now() - t0;
}
