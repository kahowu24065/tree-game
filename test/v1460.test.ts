// 1.4.60: 天氣預告 opt-in (settings row + /state flag), MeteoAlarm refresh within the 10-min cap.
import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import { useLocale, tables } from '../src/i18n';
import { settingsModal } from '../src/ui';
import { HEADSUP_KEY, headsUpEnabled } from '../src/headsUp';
import { MA_REFRESH_MS } from '../src/alerts';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe('weather heads-up opt-in', () => {
  it('defaults on, "0" turns it off', () => {
    expect(headsUpEnabled()).toBe(true);
    store.set(HEADSUP_KEY, '0');
    expect(headsUpEnabled()).toBe(false);
    store.set(HEADSUP_KEY, '1');
    expect(headsUpEnabled()).toBe(true);
  });

  it('settings shows the row only where notifications exist, reflecting the choice', () => {
    useLocale('zh-HK');
    expect(settingsModal('樹', null)).not.toContain('data-headsup');
    const on = settingsModal('樹', true);
    expect(on).toContain('天氣預告');
    expect(on).toMatch(/class="on" data-headsup="on"/);
    store.set(HEADSUP_KEY, '0');
    expect(settingsModal('樹', true)).toMatch(/class="on" data-headsup="off"/);
    expect(settingsModal('樹', false)).toContain('headsup-row muted');
  });

  it('copy exists in all four languages and the guide explains it', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      for (const k of ['headsup.row', 'headsup.hint', 'headsup.on', 'headsup.off', 'guide.headsup']) expect(tables()[loc][k], `${loc} ${k}`).toBeTruthy();
    }
    expect(fs.readFileSync('src/guide.ts', 'utf8')).toContain("tl('guide.headsup')");
  });

  it('the app sends the choice to the push server and handles the toggle', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('headsUp: headsUpEnabled()');
    expect(main).toContain('[data-headsup]');
    expect(fs.readFileSync('src/native/push.ts', 'utf8')).toContain('headsUp?: boolean');
  });
});

describe('MeteoAlarm delay cap', () => {
  it('app refresh + server caches stay under 10 minutes', () => {
    expect(MA_REFRESH_MS).toBe(4 * 60_000);
    // 4 min refresh + 1 min check interval + 2 min /alerts answer cache + 2 min feed cache.
    expect(MA_REFRESH_MS + 60_000 + 2 * 60_000 + 2 * 60_000).toBeLessThanOrEqual(10 * 60_000);
  });
});
