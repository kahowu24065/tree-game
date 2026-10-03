/**
 * 1.4.36: stored text follows the current language. Log lines keep their message form (key + params) and are
 * rendered in whatever language is active; old text-only lines are matched back against all four tables.
 */
import { describe, expect, it, vi } from 'vitest';
import type { Locale } from '../src/i18n';
import type { LogEntry } from '../src/types';

const LOCS: Locale[] = ['zh-HK', 'zh-TW', 'zh-CN', 'en'];
const NOW = Date.UTC(2026, 8, 1, 4);

/** A fresh module graph with `l` active before any data table is built — what the app does after a reload. */
async function inLocale(l: Locale) {
  vi.resetModules();
  const i18n = await import('../src/i18n');
  i18n.useLocale(l);
  const sim = await import('../src/sim');
  const msg = await import('../src/i18n/msg');
  const storage = await import('../src/storage');
  const meta = await import('../src/meta');
  return { i18n, sim, msg, storage, meta };
}

/** The same 60 days (care, stages, storms, a typhoon, catch-up) played in locale `l`: its log. */
async function playIn(l: Locale): Promise<LogEntry[]> {
  const { sim, meta } = await inLocale(l);
  sim.setLogClock(() => '09:30');
  const m = meta.freshMeta();
  const s = sim.createGame('2026-07-01', { name: 'Kiko' });
  const plan = ['clear', 'clear', 'drizzle', 'clear', 'hot', 'clear', 'rainstorm', 'clear', 'clear', 'thunder', 'clear', 'cold', 'typhoon1', 'clear', 'blackrain', 'typhoon8'] as const;
  let day = '2026-07-01';
  for (let d = 0; d < 60; d++) {
    s.care = sim.freshCare(day);
    // Keep it alive and growing for most of the run (stages, residents, awards); let it struggle near the end.
    if (d < 48) Object.assign(s, { moisture: 70, nutrients: 85, health: Math.max(s.health, 60) });
    for (const a of ['water', 'water', 'fertilize', 'deworm'] as const) sim.performAction(s, a);
    if (s.moisture > 85) sim.performAction(s, 'drain');
    for (const p of ['stakes', 'ropes', 'prune'] as const) if (d % 16 > 10) sim.reinforce(s, p);
    sim.settleDay(s, day, [plan[d % plan.length]!], m, NOW + d * 86400000);
    if (s.over) break;
    day = new Date(Date.UTC(2026, 6, 2 + d)).toISOString().slice(0, 10);
  }
  if (!s.over) {
    s.lastSeenDate = day;
    sim.catchUp(s, new Date(Date.UTC(2026, 6, 2 + 64)).toISOString().slice(0, 10), () => ['clear'], m, NOW + 64 * 86400000);
  }
  if (l === 'zh-HK') console.log(`[1.4.36] sample log: ${s.log.length} lines, kinds ${[...new Set(s.log.map((e) => e.kind))].join(',')}, ${Math.round(s.heightCm)} cm`);
  return JSON.parse(JSON.stringify(s.log)) as LogEntry[];
}

const texts = (e: LogEntry) => [e.text, e.title ?? '', e.reward?.text ?? ''];

describe('1.4.36 log lines follow the current language', () => {
  it('a line written in one language is shown in the language now active (every pair of the 4)', async () => {
    const logs = {} as Record<Locale, LogEntry[]>;
    for (const l of LOCS) logs[l] = await playIn(l);
    const n = logs['zh-HK'].length;
    expect(n).toBeGreaterThan(40);
    for (const l of LOCS) expect(logs[l].length).toBe(n);
    for (const l of LOCS) expect(logs[l].every((e) => e.i18n?.text)).toBe(true);
    for (const dst of LOCS) {
      const { msg } = await inLocale(dst);
      for (const src of LOCS) {
        const shown = logs[src].map((e) => { const x = msg.logTexts(e); return [x.text, x.title ?? '', x.reward ?? '']; });
        expect(shown, `${src} → ${dst}`).toEqual(logs[dst].map(texts));
      }
    }
    // Spot check: the same line in zh-HK colloquial vs English.
    const i = logs['zh-HK'].findIndex((e) => e.kind === 'settle');
    expect(logs['zh-HK'][i]!.text).not.toEqual(logs.en[i]!.text);
  });

  it('old saves: text-only lines are matched back (all 4 languages) and then follow the current language', async () => {
    const logs = {} as Record<Locale, LogEntry[]>;
    for (const l of LOCS) logs[l] = await playIn(l);
    const report: string[] = [];
    let total = 0;
    let migrated = 0;
    for (const src of LOCS) {
      // Before 1.4.36 a line was only its text.
      const old = logs[src].map(({ i18n: _drop, ...e }) => e as LogEntry);
      for (const cur of LOCS) {
        const { storage, msg } = await inLocale(cur);
        const save = { log: old.map((e) => ({ ...e })) };
        const r = storage.migrateLogI18n(save);
        total += r.total;
        migrated += r.migrated;
        report.push(`${src} save opened in ${cur}: ${r.migrated}/${r.total}`);
        const shown = save.log.map((e) => { const x = msg.logTexts(e); return [x.text, x.title ?? '', x.reward ?? '']; });
        expect(shown, `${src} save in ${cur}`).toEqual(logs[cur].map(texts));
      }
    }
    console.log(`[1.4.36] old log lines migrated: ${migrated}/${total}\n  ${report.join('\n  ')}`);
    expect(migrated).toBe(total);
  });

  it('lines nobody can match stay exactly as written; a save keeps them', async () => {
    const { storage, msg, i18n } = await inLocale('en');
    const save = { log: [{ date: '2026-07-01', text: '今日同阿媽一齊淋水 :)' }, { date: '2026-07-02', text: 'Hello tree', title: '自訂', reward: { text: '+?', tone: 'gray' as const } }] as LogEntry[] };
    expect(storage.migrateLogI18n(save)).toEqual({ total: 2, migrated: 0 });
    expect(save.log.map((e) => msg.logTexts(e).text)).toEqual(['今日同阿媽一齊淋水 :)', 'Hello tree']);
    expect(msg.logTexts(save.log[1]!).title).toBe('自訂');
    expect(i18n.getLocale()).toBe('en');
  });

  it('a parsed save gets the message form, and the morning note / water label follow the language too', async () => {
    let { sim, storage, i18n } = await inLocale('zh-HK');
    sim.setLogClock(() => '08:00');
    const s = sim.createGame('2026-07-01', { name: 'Kiko' });
    sim.performAction(s, 'water');
    sim.settleDay(s, '2026-07-01', ['rainstorm'], null, NOW);
    const hk = { note: s.morningNote, w: s.lastSettlement?.wLabel ?? '' };
    for (const e of s.log) delete e.i18n;
    const raw = JSON.stringify(s);
    ({ sim, storage, i18n } = await inLocale('en'));
    const msg = await import('../src/i18n/msg');
    const back = storage.parseSave(raw)!;
    expect(back.log.every((e) => e.i18n)).toBe(true);
    expect(/[\u3400-\u9fff]/.test(msg.logTexts(back.log[0]!).text)).toBe(false);
    if (hk.note) expect(/[\u3400-\u9fff]/.test(msg.localize(hk.note))).toBe(false);
    if (hk.w) expect(/[\u3400-\u9fff]/.test(msg.localize(hk.w))).toBe(false);
    expect(i18n.getLocale()).toBe('en');
  });
});
