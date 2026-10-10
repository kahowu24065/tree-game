import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { tables } from '../src/i18n';
import { CAL_HEALTHY_MIN, healthDayMark, logCalendarHtml, postTourTipModal, settleHealthAfter, timelapseSettingsRow } from '../src/ui';
import { APP_VERSION } from '../src/version';
import type { GameState } from '../src/types';

describe('1.4.67', () => {
  it('bumps to 1.4.67 / documents MP4 path', () => {
    expect(APP_VERSION >= '1.4.67').toBe(true);
    expect(fs.readFileSync('src/timelapse.ts', 'utf8')).toContain('mp4');
    expect(fs.readFileSync('src/native/timelapseEncode.ts', 'utf8')).toContain('TreeTimelapse');
    expect(fs.readFileSync('android/app/src/main/java/app/sekaitree/game/TreeTimelapsePlugin.java', 'utf8')).toContain('MediaMuxer');
  });

  it('calendar healthy = light green, unhealthy = light red; modern settle text parses', () => {
    expect(CAL_HEALTHY_MIN).toBe(50);
    expect(settleHealthAfter('今日：健康 +5；健康 85，良好')).toBe(85);
    expect(settleHealthAfter('health −3; health 42, low')).toBe(42);
    expect(settleHealthAfter('健康 70 → 40')).toBe(40);
    const up = healthDayMark([{ date: '2026-10-01', text: '天氣：晴；健康 72，良好 ×1。', kind: 'settle' }], false, 0);
    const down = healthDayMark([{ date: '2026-10-01', text: '天氣：酷熱；健康 35，差 ×0.5。', kind: 'settle' }], false, 0);
    expect(up).toBe('up');
    expect(down).toBe('down');
    const html = logCalendarHtml(
      [{ date: '2026-10-01', text: '天氣：晴；健康 72，良好 ×1。', kind: 'settle' }],
      '2026-10-09',
      '2026-10',
      '',
      80,
    );
    expect(html).toContain('class="cal-day up" data-cal="2026-10-01"');
    expect(fs.readFileSync('src/style.css', 'utf8')).toContain('.cal-day.has-photo::before');
  });

  it('post-tour tip omits weather by default; can include when tour skipped early', () => {
    const two = postTourTipModal({ includeWeather: false });
    expect(two).not.toContain(tables()['zh-HK']['postTip.weatherTitle']);
    expect(two).toContain(tables()['zh-HK']['postTip.shareTitle']);
    expect(two).toContain(tables()['zh-HK']['postTip.clipTitle']);
    expect(two).toContain(tables()['zh-HK']['postTip.title']);
    const three = postTourTipModal({ includeWeather: true });
    expect(three).toContain(tables()['zh-HK']['postTip.weatherTitle']);
    expect(three).toContain(tables()['zh-HK']['postTip.title3']);
    expect(tables()['zh-HK']['postTip.title']).toContain('兩樣');
    expect(tables()['zh-HK']['postTip.title3']).toContain('三樣');
  });

  it('timelapse locked hint sits below Generate button', () => {
    const state = {
      started: true,
      over: null,
      heightCm: 5,
      species: 'metasequoia',
    } as unknown as GameState;
    const row = timelapseSettingsRow(state);
    expect(row).toContain('timelapse-actions');
    expect(row).toContain('timelapse-hint');
    expect(row.indexOf('timelapse-make')).toBeLessThan(row.indexOf('timelapse-hint'));
    expect(tables()['zh-HK']['timelapse.settingsLocked']).toBe('青年樹後解鎖');
    expect(fs.readFileSync('src/style.css', 'utf8')).toContain('.timelapse-hint');
  });

  it('tour replay queues post tip (main.ts)', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('includeWeather: !sawWeather');
    expect(main).toContain('markDone: false');
    expect(main).toContain('tourMaxPage');
  });
});
