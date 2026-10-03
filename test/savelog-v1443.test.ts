import { describe, expect, it } from 'vitest';
import { createSaveLog, formatLog, mergeLogs, parseLog, pushEntry, SAVELOG_MAX, type LogEntry } from '../src/native/saveLog';
import { hydrateReason, createMirror, STAMP_KEY, type NativeWrite } from '../src/native/persist';
import { sumRaw, sumState } from '../src/saveDiag';
import { createGame } from '../src/sim';

function memStore() {
  const s = { local: null as string | null, native: null as string | null, nativeWrites: 0 };
  return {
    s,
    store: {
      getLocal: () => s.local,
      setLocal: (v: string) => {
        s.local = v;
      },
      getNative: async () => s.native,
      setNative: async (v: string) => {
        s.nativeWrites++;
        s.native = v;
      },
    },
  };
}

const e = (t: number, s: string, n = 0, b = 1): LogEntry => ({ t, n, b, s });

describe('1.4.43 save log', () => {
  it('ring buffer keeps the newest entries', () => {
    let list: LogEntry[] = [];
    for (let i = 0; i < SAVELOG_MAX + 15; i++) list = pushEntry(list, e(i, `x${i}`, i));
    expect(list).toHaveLength(SAVELOG_MAX);
    expect(list[0]!.s).toBe('x15');
    expect(list[list.length - 1]!.s).toBe(`x${SAVELOG_MAX + 14}`);
  });

  it('merges both copies (one lost its newest lines) without duplicates', () => {
    const a = [e(1, 'a', 0), e(2, 'b', 1)];
    const b = [e(1, 'a', 0), e(2, 'b', 1), e(3, 'c', 2)];
    expect(mergeLogs(a, b).map((x) => x.s)).toEqual(['a', 'b', 'c']);
    expect(parseLog('not json')).toEqual([]);
    expect(parseLog(JSON.stringify([{ t: 1 }, e(5, 'ok')]))).toHaveLength(1);
  });

  it('persists to both stores and survives a "kill" (new instance reads them back)', async () => {
    const m = memStore();
    let t = 1000;
    const log = createSaveLog(m.store, () => t++);
    await log.init();
    log.add('SAVE[water]', 'save');
    log.add('SAVE[tick]', 'save:tick', true);
    log.add('SAVE[tick]', 'save:tick', true);
    expect(log.amend('save', '→ native[ok]')).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(parseLog(m.s.local)).toHaveLength(2);
    expect(m.s.nativeWrites).toBeGreaterThan(0);
    // Local copy lost by the kill: the native one restores it.
    const nativeCopy = m.s.native;
    m.s.local = null;
    const again = createSaveLog(m.store, () => t++);
    const note = await again.init();
    expect(note).toContain('native 2');
    expect(nativeCopy).not.toBeNull();
    const text = again.text();
    expect(text).toContain('SAVE[water]');
    expect(text).toContain('(×2)');
    expect(text).toContain('→ native[ok]');
    again.clear();
    expect(again.entries()).toHaveLength(0);
    expect(parseLog(m.s.local)).toHaveLength(0);
  });

  it('formats launches apart', () => {
    expect(formatLog([e(1, 'a', 0, 1), e(2, 'b', 0, 2)]).split('\n').filter((l) => l.startsWith('— launch'))).toHaveLength(2);
  });

  it('reports native write latency / failures per batch', async () => {
    const data: Record<string, string> = {};
    const storage = {
      getItem: (k: string) => data[k] ?? null,
      setItem: (k: string, v: string) => {
        data[k] = v;
      },
      removeItem: (k: string) => {
        delete data[k];
      },
    } as unknown as Storage;
    const seen: NativeWrite[][] = [];
    let fail = true;
    const mirror = createMirror(
      storage,
      {
        set: async (k) => {
          if (fail && k === 'sekai-tree-v2') {
            fail = false;
            throw new Error('nope');
          }
        },
        remove: async () => undefined,
      },
      Date.now,
      (w) => seen.push(w),
    );
    storage.setItem('sekai-tree-v2', '{"a":1}');
    mirror.set('sekai-tree-v2', '{"a":1}');
    await mirror.flush();
    expect(seen[0]!.find((w) => w.key === 'sekai-tree-v2')!.ok).toBe(false);
    expect(seen.flat().some((w) => w.key === 'sekai-tree-v2' && w.ok)).toBe(true);
    expect(seen.flat().every((w) => typeof w.ms === 'number')).toBe(true);
  });

  it('explains the hydrate choice', () => {
    expect(hydrateReason({}, { 'sekai-tree-v2': 'x' })).toMatch(/prefs-empty/);
    expect(hydrateReason({ 'sekai-tree-v2': 'x', [STAMP_KEY]: '1' }, { 'sekai-tree-v2': 'y', [STAMP_KEY]: '2' })).toMatch(/local-newer/);
    expect(hydrateReason({ 'sekai-tree-v2': 'x', [STAMP_KEY]: '2' }, { 'sekai-tree-v2': 'y', [STAMP_KEY]: '2' })).toMatch(/stamps-equal.*keep-local/);
    expect(hydrateReason({ 'sekai-tree-v2': 'x', [STAMP_KEY]: '3' }, { 'sekai-tree-v2': 'y', [STAMP_KEY]: '2' })).toMatch(/prefs-newer/);
  });

  it('summarises a tree and a raw save', () => {
    const s = createGame('2026-10-04');
    s.care.fertilize = 1;
    const line = sumState(s);
    expect(line).toMatch(/W\d/);
    expect(line).toContain('fer0/1');
    expect(line).toContain('care{2026-10-04');
    expect(sumRaw(JSON.stringify(s))).toContain('kB');
    expect(sumRaw(undefined)).toBe('absent');
    expect(sumRaw('{bad')).toMatch(/unparsable/);
  });
});
