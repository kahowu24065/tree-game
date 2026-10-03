import { describe, expect, it } from 'vitest';
import { STAMP_KEY, createMirror, isPersistKey, planHydrate, type KvBackend } from '../src/native/persist';
import { kvRemove, kvSet, setKvMirror, setKvStore } from '../src/native/kv';

/** 1.4.44: the mirror is fed by kvSet / kvRemove (no localStorage patching). */
function installWriteThrough(s: Storage, backend: KvBackend, now: () => number = Date.now): () => Promise<void> {
  const m = createMirror(s, backend, now);
  setKvStore(s);
  setKvMirror(m);
  return m.flush;
}
const w = (s: Storage) => ({ setItem: (k: string, v: string) => kvSet(k, v), removeItem: (k: string) => kvRemove(k), getItem: (k: string) => s.getItem(k) });
import { NOTIFY_IDS, planNotifications, type NotifyInput } from '../src/native/notify';

class MemStorage implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
}

describe('native persist adapter', () => {
  it('recognises game keys only', () => {
    expect(isPersistKey('sekai-tree-v2')).toBe(true);
    expect(isPersistKey('sekai-tree-meta-v1')).toBe(true);
    expect(isPersistKey('yiri-yisyu-quality')).toBe(true);
    expect(isPersistKey('other')).toBe(false);
  });
  it('1.4.44: no stamps on either side → localStorage (primary) wins and is copied to Preferences', () => {
    const plan = planHydrate({ 'sekai-tree-v2': 'P', junk: 'x' }, { 'sekai-tree-v2': 'L', 'yiri-yisyu-place': 'geo' });
    expect(plan).toEqual({ toLocal: [], toPrefs: [['sekai-tree-v2', 'L'], ['yiri-yisyu-place', 'geo']] });
  });
  it('migrates localStorage once when Preferences is empty', () => {
    const plan = planHydrate({}, { 'sekai-tree-v2': 'L', 'yiri-yisyu-place': 'geo', other: 'no' });
    expect(plan.toLocal).toEqual([]);
    expect(plan.toPrefs).toEqual([['sekai-tree-v2', 'L'], ['yiri-yisyu-place', 'geo']]);
  });
  it('fresh install: nothing to do', () => {
    expect(planHydrate({}, {})).toEqual({ toLocal: [], toPrefs: [] });
  });
  it('1.4.42: writes through game keys coalesced (latest value only), stamp last, localStorage updated synchronously', async () => {
    const s = new MemStorage();
    const log: string[] = [];
    let t = 1000;
    const flush = installWriteThrough(
      s,
      { set: async (k, v) => void log.push(`set ${k}=${v}`), remove: async (k) => void log.push(`rm ${k}`) },
      () => t,
    );
    w(s).setItem('sekai-tree-v2', 'a');
    w(s).setItem('unrelated', 'b');
    w(s).setItem('sekai-tree-v2', 'c');
    w(s).setItem('sekai-tree-meta-v1', 'm');
    w(s).removeItem('sekai-tree-v2');
    expect(s.getItem('unrelated')).toBe('b');
    expect(s.getItem('sekai-tree-v2')).toBeNull();
    expect(Number(s.getItem(STAMP_KEY))).toBeGreaterThan(1000); // monotonic even with a frozen clock
    await flush();
    // the first value goes out at once; the rest are coalesced into one batch, stamp after the data
    expect(log[0]).toBe('set sekai-tree-v2=a');
    expect(log.slice(-3)).toEqual(['set sekai-tree-meta-v1=m', 'rm sekai-tree-v2', `set ${STAMP_KEY}=${s.getItem(STAMP_KEY)}`]);
    expect(log.filter((l) => l.includes('=c'))).toEqual([]);
  });
  it('a failing backend write is retried and does not block later writes', async () => {
    const s = new MemStorage();
    const log: string[] = [];
    let first = true;
    const flush = installWriteThrough(s, {
      set: async (k, v) => {
        if (first) { first = false; throw new Error('x'); }
        log.push(`${k}=${v}`);
      },
      remove: async () => {},
    });
    w(s).setItem('sekai-tree-v2', '1');
    await flush();
    expect(log).toContain('sekai-tree-v2=1');
    w(s).setItem('sekai-tree-v2', '2');
    await flush();
    expect(log.filter((l) => l.startsWith('sekai-tree-v2='))).toEqual(['sekai-tree-v2=1', 'sekai-tree-v2=2']);
  });
  it('1.4.42: localStorage newer than Preferences (app closed before the mirror caught up) → localStorage wins', () => {
    const plan = planHydrate({ 'sekai-tree-v2': 'OLD', [STAMP_KEY]: '100' }, { 'sekai-tree-v2': 'NEW', 'sekai-tree-grove': 'G', [STAMP_KEY]: '200' });
    expect(plan.toLocal).toEqual([]);
    expect(plan.toPrefs.map(([k]) => k)).toEqual(['sekai-tree-v2', 'sekai-tree-grove', STAMP_KEY]);
    // Preferences newer (or WebView storage wiped) → Preferences wins as before
    expect(planHydrate({ 'sekai-tree-v2': 'P', [STAMP_KEY]: '300' }, { 'sekai-tree-v2': 'L', [STAMP_KEY]: '200' }).toLocal).toEqual([['sekai-tree-v2', 'P'], [STAMP_KEY, '300']]);
    expect(planHydrate({ 'sekai-tree-v2': 'P', [STAMP_KEY]: '300' }, {}).toLocal).toEqual([['sekai-tree-v2', 'P'], [STAMP_KEY, '300']]);
  });
});

describe('reminder planning', () => {
  const H = 3600_000;
  const base: NotifyInput = { now: 0, msToSettlement: 5 * H, started: true, over: false, wateredToday: true, fertilizedToday: true, dyingEndsAt: null, pendingEmergencies: [], background: false, hatchAt: null };
  const ids = (i: Partial<NotifyInput>) => planNotifications({ ...base, ...i }).map((n) => n.id);

  it('nothing before planting or after death', () => {
    expect(ids({ started: false })).toEqual([]);
    expect(ids({ over: true })).toEqual([]);
  });
  it('care reminder 1.5 h before settlement only when care is missing', () => {
    expect(ids({})).toEqual([NOTIFY_IDS.careTomorrow]);
    const n = planNotifications({ ...base, fertilizedToday: false });
    expect(n[0]).toMatchObject({ id: NOTIFY_IDS.careToday, at: 3.5 * H });
    expect(n[0].body).toContain('施肥');
    expect(n[0].body).not.toContain('澆水');
    expect(n[1]).toMatchObject({ id: NOTIFY_IDS.careTomorrow, at: 27.5 * H });
  });
  it('no care reminder once its time has passed', () => {
    expect(ids({ msToSettlement: H, wateredToday: false })).toEqual([NOTIFY_IDS.careTomorrow]);
  });
  it('瀕死 reminders at 12 h and 2 h left (future ones only)', () => {
    const d = planNotifications({ ...base, dyingEndsAt: 20 * H }).filter((n) => n.id === NOTIFY_IDS.dying12 || n.id === NOTIFY_IDS.dying2);
    expect(d.map((n) => n.at)).toEqual([8 * H, 18 * H]);
    expect(ids({ dyingEndsAt: 5 * H })).toContain(NOTIFY_IDS.dying2);
    expect(ids({ dyingEndsAt: 5 * H })).not.toContain(NOTIFY_IDS.dying12);
  });
  it('v1.4.18 健康好低 reminder ~3 h before a midnight settlement projected to hit 0, not while 瀕死', () => {
    const n = planNotifications({ ...base, healthZeroAt: 10 * H }).find((x) => x.id === NOTIFY_IDS.healthLow);
    expect(n?.at).toBe(7 * H);
    expect(planNotifications({ ...base, healthZeroAt: 1 * H }).find((x) => x.id === NOTIFY_IDS.healthLow)?.at).toBe(5 * 60_000);
    expect(ids({ healthZeroAt: 10 * H, dyingEndsAt: 20 * H })).not.toContain(NOTIFY_IDS.healthLow);
    expect(ids({ healthZeroAt: null })).not.toContain(NOTIFY_IDS.healthLow);
  });
  it('v1.4.23 水分不足 reminder at 23:00 (1 h before settlement), only when tonight is projected dry, not after 23:00', () => {
    const n = planNotifications({ ...base, waterLowTonight: true }).find((x) => x.id === NOTIFY_IDS.waterLow);
    expect(n?.at).toBe(4 * H);
    expect(n?.body).toContain('扣健康');
    expect(ids({ waterLowTonight: false })).not.toContain(NOTIFY_IDS.waterLow);
    expect(ids({ waterLowTonight: true, msToSettlement: 0.5 * H })).not.toContain(NOTIFY_IDS.waterLow);
    expect(ids({ waterLowTonight: true, dyingEndsAt: 20 * H })).not.toContain(NOTIFY_IDS.waterLow);
  });
  it('weather reminder only when backgrounded, 1 h later, before settlement', () => {
    expect(ids({ pendingEmergencies: ['酷熱澆水'] })).not.toContain(NOTIFY_IDS.weather);
    const w = planNotifications({ ...base, pendingEmergencies: ['酷熱澆水', '加固'], background: true }).find((n) => n.id === NOTIFY_IDS.weather);
    expect(w?.at).toBe(H);
    expect(w?.body).toContain('酷熱澆水、加固');
    expect(ids({ pendingEmergencies: ['保暖'], background: true, msToSettlement: 0.5 * H })).not.toContain(NOTIFY_IDS.weather);
  });
});
