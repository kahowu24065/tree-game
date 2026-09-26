import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';

/** localStorage keys the game persists (save, meta, dev, place, quality, hints, notify toggle…). */
export const PERSIST_PREFIXES = ['sekai-tree', 'yiri-yisyu'] as const;

export function isPersistKey(key: string): boolean {
  return PERSIST_PREFIXES.some((p) => key.startsWith(p));
}

export interface HydratePlan {
  /** Entries to write into localStorage before the game boots. */
  toLocal: [string, string][];
  /** Entries to copy into Preferences (one-time migration). */
  toPrefs: [string, string][];
}

/**
 * Preferences is the source of truth on native. If it already holds any game key, those values go into
 * localStorage (so the synchronous game code reads them). If it is empty, the existing localStorage save is
 * migrated into Preferences once.
 */
export function planHydrate(prefs: Record<string, string>, local: Record<string, string>): HydratePlan {
  const prefKeys = Object.keys(prefs).filter(isPersistKey);
  if (prefKeys.length) return { toLocal: prefKeys.map((k) => [k, prefs[k]]), toPrefs: [] };
  return { toLocal: [], toPrefs: Object.keys(local).filter(isPersistKey).map((k) => [k, local[k]]) };
}

export interface KvBackend {
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Mirror every game-key write/remove on `storage` into `backend`, in order (fire-and-forget). */
export function installWriteThrough(storage: Storage, backend: KvBackend): () => Promise<void> {
  const setItem = storage.setItem.bind(storage);
  const removeItem = storage.removeItem.bind(storage);
  let chain: Promise<void> = Promise.resolve();
  const queue = (job: () => Promise<void>) => {
    chain = chain.then(job).catch(() => undefined);
  };
  storage.setItem = (key: string, value: string) => {
    setItem(key, value);
    if (isPersistKey(key)) queue(() => backend.set(key, String(value)));
  };
  storage.removeItem = (key: string) => {
    removeItem(key);
    if (isPersistKey(key)) queue(() => backend.remove(key));
  };
  return () => chain;
}

function snapshot(storage: Storage): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k !== null) out[k] = storage.getItem(k) ?? '';
  }
  return out;
}

/** Native only: load Preferences into localStorage before the game boots, then write-through. Web: no-op. */
export async function hydrateNative(): Promise<void> {
  if (!isNative()) return;
  try {
    const { keys } = await Preferences.keys();
    const prefs: Record<string, string> = {};
    for (const key of keys.filter(isPersistKey)) {
      const { value } = await Preferences.get({ key });
      if (value !== null) prefs[key] = value;
    }
    const plan = planHydrate(prefs, snapshot(localStorage));
    for (const [k, v] of plan.toLocal) localStorage.setItem(k, v);
    for (const [key, value] of plan.toPrefs) await Preferences.set({ key, value });
    installWriteThrough(localStorage, {
      set: (key, value) => Preferences.set({ key, value }),
      remove: (key) => Preferences.remove({ key }),
    });
  } catch {
    /* Preferences unavailable: the game keeps using localStorage as on the web. */
  }
}
