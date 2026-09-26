import { describe, expect, it } from 'vitest';
import { installWriteThrough, isPersistKey, planHydrate } from '../src/native/persist';
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
  it('Preferences wins when it has a save', () => {
    const plan = planHydrate({ 'sekai-tree-v2': 'P', junk: 'x' }, { 'sekai-tree-v2': 'L', 'yiri-yisyu-place': 'geo' });
    expect(plan).toEqual({ toLocal: [['sekai-tree-v2', 'P']], toPrefs: [] });
  });
  it('migrates localStorage once when Preferences is empty', () => {
    const plan = planHydrate({}, { 'sekai-tree-v2': 'L', 'yiri-yisyu-place': 'geo', other: 'no' });
    expect(plan.toLocal).toEqual([]);
    expect(plan.toPrefs).toEqual([['sekai-tree-v2', 'L'], ['yiri-yisyu-place', 'geo']]);
  });
  it('fresh install: nothing to do', () => {
    expect(planHydrate({}, {})).toEqual({ toLocal: [], toPrefs: [] });
  });
  it('writes through game keys in order, still updating localStorage synchronously', async () => {
    const s = new MemStorage();
    const log: string[] = [];
    const flush = installWriteThrough(s, {
      set: async (k, v) => void log.push(`set ${k}=${v}`),
      remove: async (k) => void log.push(`rm ${k}`),
    });
    s.setItem('sekai-tree-v2', 'a');
    s.setItem('unrelated', 'b');
    s.setItem('sekai-tree-v2', 'c');
    s.removeItem('sekai-tree-v2');
    expect(s.getItem('unrelated')).toBe('b');
    expect(s.getItem('sekai-tree-v2')).toBeNull();
    await flush();
    expect(log).toEqual(['set sekai-tree-v2=a', 'set sekai-tree-v2=c', 'rm sekai-tree-v2']);
  });
  it('a failing backend write does not break later writes', async () => {
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
    s.setItem('sekai-tree-v2', '1');
    s.setItem('sekai-tree-v2', '2');
    await flush();
    expect(log).toEqual(['sekai-tree-v2=2']);
  });
});

describe('reminder planning', () => {
  const H = 3600_000;
  const base: NotifyInput = { now: 0, msToSettlement: 5 * H, started: true, over: false, wateredToday: true, fertilizedToday: true, dyingEndsAt: null, pendingEmergencies: [], background: false };
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
  it('weather reminder only when backgrounded, 1 h later, before settlement', () => {
    expect(ids({ pendingEmergencies: ['酷熱澆水'] })).not.toContain(NOTIFY_IDS.weather);
    const w = planNotifications({ ...base, pendingEmergencies: ['酷熱澆水', '加固'], background: true }).find((n) => n.id === NOTIFY_IDS.weather);
    expect(w?.at).toBe(H);
    expect(w?.body).toContain('酷熱澆水、加固');
    expect(ids({ pendingEmergencies: ['保暖'], background: true, msToSettlement: 0.5 * H })).not.toContain(NOTIFY_IDS.weather);
  });
});
