import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';

/**
 * 1.4.43 diagnostics: a small save / load / lifecycle log kept in BOTH localStorage and native Preferences, so it
 * survives the app being killed (whichever copy is newer wins; both are merged). Not a game key: it is not mirrored
 * by the persist write-through and never decides what gets loaded.
 */
export const SAVELOG_KEY = 'diag-savelog';
export const SAVELOG_MAX = 60;

export interface LogEntry {
  /** Wall-clock ms. */
  t: number;
  /** Sequence within one launch (keeps order for same-ms entries). */
  n: number;
  /** Launch id (boot time) so launches can be told apart. */
  b: number;
  s: string;
  /** Kind tag: 'save' entries can be amended with the native write result; 'tick' saves fold into one line. */
  k?: string;
  /** Times a folded line repeated. */
  c?: number;
  /** Already amended. */
  a?: boolean;
}

export function parseLog(raw: string | null | undefined): LogEntry[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((e): e is LogEntry => !!e && typeof e === 'object' && typeof (e as LogEntry).t === 'number' && typeof (e as LogEntry).s === 'string');
  } catch {
    return [];
  }
}

const order = (a: LogEntry, b: LogEntry) => a.t - b.t || (a.b ?? 0) - (b.b ?? 0) || (a.n ?? 0) - (b.n ?? 0);

/** Union of both copies (one may have lost the newest lines on a kill), oldest first, last `max` kept. */
export function mergeLogs(a: LogEntry[], b: LogEntry[], max = SAVELOG_MAX): LogEntry[] {
  const seen = new Set<string>();
  const out: LogEntry[] = [];
  for (const e of [...a, ...b]) {
    const id = `${e.b}|${e.n}|${e.t}|${e.s}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(e);
  }
  return out.sort(order).slice(-max);
}

export function pushEntry(list: LogEntry[], e: LogEntry, max = SAVELOG_MAX): LogEntry[] {
  const next = [...list, e];
  return next.length > max ? next.slice(next.length - max) : next;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
/** Device-local wall time `MM-DD HH:MM:SS.mmm`. */
export function wallTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function formatLog(list: LogEntry[]): string {
  let lastBoot = -1;
  const lines: string[] = [];
  for (const e of list) {
    if (e.b !== lastBoot) {
      lastBoot = e.b;
      lines.push(`— launch ${wallTime(e.b)} —`);
    }
    lines.push(`${wallTime(e.t)} ${e.s}${e.c && e.c > 1 ? ` (×${e.c})` : ''}`);
  }
  return lines.join('\n');
}

interface Store {
  getLocal(): string | null;
  setLocal(v: string): void;
  getNative(): Promise<string | null>;
  setNative(v: string): Promise<void>;
}

const defaultStore = (): Store => ({
  getLocal: () => {
    try {
      return localStorage.getItem(SAVELOG_KEY);
    } catch {
      return null;
    }
  },
  setLocal: (v) => {
    try {
      localStorage.setItem(SAVELOG_KEY, v);
    } catch {
      /* quota */
    }
  },
  getNative: async () => (isNative() ? (await Preferences.get({ key: SAVELOG_KEY })).value : null),
  setNative: async (v) => {
    if (isNative()) await Preferences.set({ key: SAVELOG_KEY, value: v });
  },
});

export function createSaveLog(store: Store = defaultStore(), now: () => number = Date.now) {
  const boot = now();
  let seq = 0;
  let entries: LogEntry[] = mergeLogs(parseLog(store.getLocal()), []);
  let writing = false;
  let dirty = false;
  const writeNative = () => {
    if (writing) {
      dirty = true;
      return;
    }
    writing = true;
    dirty = false;
    store
      .setNative(JSON.stringify(entries))
      .catch(() => undefined)
      .finally(() => {
        writing = false;
        if (dirty) writeNative();
      });
  };
  const write = () => {
    store.setLocal(JSON.stringify(entries));
    writeNative();
  };
  return {
    /** Pull the native copy in (call once at start, before logging much). */
    async init(): Promise<string> {
      let nativeRaw: string | null = null;
      let err = '';
      try {
        nativeRaw = await store.getNative();
      } catch (e) {
        err = String(e).slice(0, 80);
      }
      const local = parseLog(store.getLocal());
      const nat = parseLog(nativeRaw);
      entries = mergeLogs(mergeLogs(local, nat), entries);
      write();
      return `log copies: local ${local.length} (last ${local.length ? wallTime(local[local.length - 1]!.t) : '-'}) · native ${nat.length} (last ${nat.length ? wallTime(nat[nat.length - 1]!.t) : '-'})${err ? ` · native read failed ${err}` : ''}`;
    },
    /** `fold`: replace the previous entry when it has the same tag (e.g. the 30 s tick save) instead of adding. */
    add(s: string, tag?: string, fold = false): void {
      const last = entries[entries.length - 1];
      const e: LogEntry = { t: now(), n: seq++, b: boot, s, ...(tag ? { k: tag } : {}) };
      if (fold && tag && last && last.k === tag && last.b === boot) {
        e.c = (last.c ?? 1) + 1;
        entries = [...entries.slice(0, -1), e];
      } else entries = pushEntry(entries, e);
      write();
    },
    /** Append to the newest not-yet-amended entry whose tag starts with `prefix` (native write result of a save). */
    amend(prefix: string, suffix: string): boolean {
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i]!;
        if (e.b !== boot || !e.k?.startsWith(prefix)) continue;
        if (e.a) return false;
        entries = [...entries.slice(0, i), { ...e, s: `${e.s} ${suffix}`, a: true }, ...entries.slice(i + 1)];
        write();
        return true;
      }
      return false;
    },
    text(): string {
      return formatLog(entries);
    },
    entries(): LogEntry[] {
      return entries;
    },
    clear(): void {
      entries = [];
      write();
    },
  };
}

export type SaveLog = ReturnType<typeof createSaveLog>;
