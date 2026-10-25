// 1.4.76: hourly low-water local reminder + settings/guide fixed chrome (credits-style scroll).
import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';
import { useLocale, tables } from '../src/i18n';
import { settingsModal } from '../src/ui';
import { WATER_LOW_REMIND_KEY, waterLowRemindEnabled } from '../src/waterLowRemind';
import { NOTIFY_IDS, planNotifications, planWaterLowHours, type NotifyInput } from '../src/native/notify';
import { APP_VERSION } from '../src/version';
import { W_OPTIMAL } from '../src/balance';

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

describe('1.4.76 water-low hourly + modal scroll', () => {
  it('version 1.4.76 / versionCode 83', () => {
    expect(APP_VERSION).toBe('1.4.76');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+83/);
    expect(g).toContain('1.4.76');
  });

  it('water-low remind defaults on; "0" turns it off', () => {
    expect(waterLowRemindEnabled()).toBe(true);
    store.set(WATER_LOW_REMIND_KEY, '0');
    expect(waterLowRemindEnabled()).toBe(false);
    store.set(WATER_LOW_REMIND_KEY, '1');
    expect(waterLowRemindEnabled()).toBe(true);
  });

  it('settings shows the row under notifications', () => {
    useLocale('zh-HK');
    expect(settingsModal('樹', null)).not.toContain('data-waterlow');
    const on = settingsModal('樹', true);
    expect(on).toContain('水份不足提醒');
    expect(on).toMatch(/class="on" data-waterlow="on"/);
    expect(on).toContain('settings-body');
    store.set(WATER_LOW_REMIND_KEY, '0');
    expect(settingsModal('樹', true)).toMatch(/class="on" data-waterlow="off"/);
    expect(settingsModal('樹', false)).toContain('water-low-row muted');
  });

  it('settings / guide chrome: body scrolls, title+close fixed (credits pattern)', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toMatch(/\.modal-card\.settings-sheet\s*\{[^}]*overflow:\s*hidden/);
    expect(css).toContain('.settings-body');
    expect(css).toMatch(/\.settings-body\s*\{[^}]*overflow-y:\s*auto/);
    expect(css).toMatch(/\.modal-card:has\(>\s*\.guide-tabs\)\s*\{[^}]*overflow:\s*hidden/);
    expect(css).toMatch(/\.guide-body\s*\{[^}]*overflow-y:\s*auto/);
    const ui = fs.readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain("'<div class=\"settings-body\">'");
    expect(ui).toContain('waterLowRemindRow');
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain("document.querySelector('.guide-body')?.scrollTo");
    expect(main).not.toMatch(/dataset\.guide[\s\S]{0,120}modal-card'\)\?\.scrollTo/);
  });

  it('copy exists in all four languages and the guide explains it', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      for (const k of ['waterlow.row', 'waterlow.hint', 'waterlow.on', 'waterlow.off', 'notify.waterLowHourTitle', 'notify.waterLowHourBody', 'guide.waterLowHour']) {
        expect(tables()[loc][k], `${loc} ${k}`).toBeTruthy();
      }
    }
    expect(fs.readFileSync('src/guide.ts', 'utf8')).toContain("tl('guide.waterLowHour')");
  });

  it('planNotifications schedules hourly slots when W < 50, skips quiet 00–08 and dying', () => {
    useLocale('zh-HK');
    const H = 3600_000;
    // 14:30 local → msToSettlement = (24*60 - 14*60 - 30) min
    const mins = 14 * 60 + 30;
    const base: NotifyInput = {
      now: 0,
      msToSettlement: (24 * 60 - mins) * 60_000,
      started: true,
      over: false,
      wateredToday: true,
      fertilizedToday: true,
      dyingEndsAt: null,
      pendingEmergencies: [],
      background: false,
      hatchAt: null,
      moisture: 40,
      waterLowHourly: true,
    };
    const hours = planNotifications(base).filter((n) => n.id >= NOTIFY_IDS.waterLowHour && n.id < NOTIFY_IDS.waterLowHour + 16);
    expect(hours.length).toBeGreaterThan(0);
    expect(hours[0]!.at).toBe(30 * 60_000); // 15:00
    expect(hours[0]!.body).toContain('開 game');
    // no slot in 00–08
    const slots = planWaterLowHours(0, (24 * 60 - mins) * 60_000);
    for (const at of slots) {
      const midnight = 0 - mins * 60_000;
      const hour = Math.floor((at - midnight) / H) % 24;
      expect(hour).toBeGreaterThanOrEqual(8);
    }
    expect(planNotifications({ ...base, moisture: W_OPTIMAL[0] }).some((n) => n.id >= NOTIFY_IDS.waterLowHour)).toBe(false);
    expect(planNotifications({ ...base, waterLowHourly: false }).some((n) => n.id >= NOTIFY_IDS.waterLowHour)).toBe(false);
    expect(planNotifications({ ...base, dyingEndsAt: 20 * H }).some((n) => n.id >= NOTIFY_IDS.waterLowHour)).toBe(false);
    // 23:00 dry tip still independent
    expect(planNotifications({ ...base, waterLowTonight: true }).some((n) => n.id === NOTIFY_IDS.waterLow)).toBe(true);
  });

  it('wires toggle + moisture into scheduleReminders; cancel range covers hourly ids', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('waterLowHourly: waterLowRemindEnabled()');
    expect(main).toContain('moisture: state.moisture');
    expect(main).toContain('[data-waterlow]');
    expect(main).toContain('WATER_LOW_REMIND_KEY');
    const notify = fs.readFileSync('src/native/notify.ts', 'utf8');
    expect(notify).toContain('WATER_HOUR_MAX');
    expect(notify).toContain('waterLowHour');
    expect(notify).toContain('allNotifyIds');
  });
});
