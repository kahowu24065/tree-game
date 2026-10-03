/**
 * 1.4.44: the one way game code writes persistent localStorage keys. Writes localStorage first, then hands the
 * key to the native mirror (Preferences) when one is installed.
 *
 * Why not wrap `localStorage.setItem`: in WebKit (iOS WKWebView) assigning a property on a Storage object stores a
 * storage *item* named "setItem" instead of overriding the method, so the 1.1–1.4.43 wrapper silently never ran on
 * iPhone — saves never reached Preferences and the stale Preferences copy won on every launch.
 */
export interface KvMirror {
  set(key: string, value: string): void;
  remove(key: string): void;
}

type KvStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

let mirror: KvMirror | null = null;
let store: KvStore | null = null;

const target = (): KvStore => store ?? localStorage;

/** Install the native mirror (native app only). */
export function setKvMirror(m: KvMirror | null): void {
  mirror = m;
}

/** Tests: use a given Storage instead of the global localStorage. */
export function setKvStore(s: KvStore | null): void {
  store = s;
}

/** Write localStorage, then queue the native copy. Throws like localStorage.setItem (quota) — callers catch. */
export function kvSet(key: string, value: string): void {
  target().setItem(key, value);
  mirror?.set(key, value);
}

export function kvRemove(key: string): void {
  target().removeItem(key);
  mirror?.remove(key);
}

export function kvGet(key: string): string | null {
  return target().getItem(key);
}

/** Storage-shaped facade for code that takes a storage argument (reads / writes go through kvSet / kvRemove). */
export const kvStorage: KvStore = {
  getItem: (k) => kvGet(k),
  setItem: (k, v) => kvSet(k, String(v)),
  removeItem: (k) => kvRemove(k),
};
