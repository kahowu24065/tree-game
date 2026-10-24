// 1.4.75: daily weather brief (settings + /state + push channel).
import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import { useLocale, tables } from '../src/i18n';
import { settingsModal } from '../src/ui';
import { DAILY_BRIEF_KEY, dailyBriefEnabled } from '../src/dailyBrief';
import { APP_VERSION } from '../src/version';
import { readFileSync } from 'node:fs';

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

describe('daily weather brief opt-in', () => {
  it('version 1.4.75 / versionCode 82', () => {
    expect(APP_VERSION).toBe('1.4.75');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+82/);
    expect(g).toContain('1.4.75');
  });

  it('defaults on, "0" turns it off', () => {
    expect(dailyBriefEnabled()).toBe(true);
    store.set(DAILY_BRIEF_KEY, '0');
    expect(dailyBriefEnabled()).toBe(false);
    store.set(DAILY_BRIEF_KEY, '1');
    expect(dailyBriefEnabled()).toBe(true);
  });

  it('settings shows the row under notifications, reflecting the choice', () => {
    useLocale('zh-HK');
    expect(settingsModal('樹', null)).not.toContain('data-dailybrief');
    const on = settingsModal('樹', true);
    expect(on).toContain('每日天氣');
    expect(on).toMatch(/class="on" data-dailybrief="on"/);
    store.set(DAILY_BRIEF_KEY, '0');
    expect(settingsModal('樹', true)).toMatch(/class="on" data-dailybrief="off"/);
    expect(settingsModal('樹', false)).toContain('daily-brief-row muted');
  });

  it('copy exists in all four languages and the guide explains it', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      for (const k of ['daily.row', 'daily.hint', 'daily.on', 'daily.off', 'daily.channel', 'daily.channelHint', 'guide.daily']) {
        expect(tables()[loc][k], `${loc} ${k}`).toBeTruthy();
      }
    }
    expect(fs.readFileSync('src/guide.ts', 'utf8')).toContain("tl('guide.daily')");
  });

  it('the app sends the choice and creates the daily channel', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('dailyBrief: dailyBriefEnabled()');
    expect(main).toContain('[data-dailybrief]');
    const push = fs.readFileSync('src/native/push.ts', 'utf8');
    expect(push).toContain('dailyBrief?: boolean');
    expect(push).toContain("DAILY_CHANNEL = 'weather-daily'");
    expect(push).toContain('weather-daily');
  });

  it('push-server plans 08:00 local briefs on a separate channel', () => {
    const daily = fs.readFileSync('push-server/src/daily.js', 'utf8');
    expect(daily).toContain('BRIEF_HOUR = 8');
    expect(daily).toContain("channelId: 'weather-daily'");
    expect(fs.readFileSync('push-server/src/tokens.js', 'utf8')).toContain('dailyBrief: body.dailyBrief === true');
    expect(fs.readFileSync('push-server/src/server.js', 'utf8')).toContain('pollDailyBriefs');
  });
});
