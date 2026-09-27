import { describe, expect, it } from 'vitest';
import { condForEvent, hkoWarningEvents, sceneCond } from '../src/events';
import { parseWarnsum } from '../src/hko';
import { topInCategory } from '../src/rules';
import { createGame, emergencyOptions, previewNight } from '../src/sim';
import type { GameState } from '../src/types';

const D = '2026-09-27';
function grown(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.windUnlocked = true;
  return Object.assign(s, { moisture: 70, nutrients: 70, health: 70, ...over });
}

describe('v1.4 山泥傾瀉警告 (HKO WL)', () => {
  it('HKO WL maps to landslip', () => {
    const w = parseWarnsum({ WL: { name: '山泥傾瀉警告', code: 'WL', actionCode: 'ISSUE', issueTime: '2026-09-27T08:00:00+08:00' } });
    expect(hkoWarningEvents(w)).toEqual(['landslip']);
    expect(hkoWarningEvents(parseWarnsum({ WL: { code: 'WL', actionCode: 'CANCEL' } }))).toEqual([]);
  });

  it('counts as 風災 with the same weight as 初級颱風; with a typhoon only the harsher one counts', () => {
    expect(topInCategory(['landslip'], 'wind')).toBe('landslip');
    expect(topInCategory(['landslip', 'typhoon1'], 'wind')).toBe('typhoon1');
    expect(topInCategory(['landslip', 'typhoon8'], 'wind')).toBe('typhoon8');
    for (const r of [10, 30, 80]) {
      const a = previewNight(grown({ resist: r }), D, ['landslip'], null);
      const b = previewNight(grown({ resist: r }), D, ['typhoon1'], null);
      expect({ h: a.hAfter, r: a.rAfter, c: Boolean(a.collapse) }).toEqual({ h: b.hAfter, r: b.rAfter, c: Boolean(b.collapse) });
      const both = previewNight(grown({ resist: r }), D, ['landslip', 'typhoon1'], null);
      expect(both.hAfter).toBe(b.hAfter); // not double-counted
    }
  });

  it('is handled by 加固 (R), not by a water / warmth action; harmless before 青年樹', () => {
    expect(emergencyOptions(['landslip'])).toEqual({ heatWater: false, rainDrain: false, warmCover: false });
    const young = previewNight(grown({ windUnlocked: false, resist: 10 }), D, ['landslip'], null);
    const clear = previewNight(grown({ windUnlocked: false, resist: 10 }), D, ['clear'], null);
    expect(young.hAfter).toBe(clear.hAfter);
    expect(young.collapse).toBeNull();
  });

  it('風同山泥傾瀉唔會強制落雨', () => {
    const dry = { code: 1, tempC: 28, tempMax: 30, precipMm: 0, windKmh: 10, gustKmh: 15, hot: false, raining: false, stormKind: null };
    for (const id of ['landslip', 'typhoon1', 'thunder', 'typhoon8'] as const) {
      const c = sceneCond(dry, [id], { manual: true });
      expect(c.raining).toBe(false);
      expect(c.precipMm).toBe(0);
      expect(c.code).toBeLessThan(51);
    }
  });

  it('毛毛雨、暴雨、黑雨照落雨，同風災一齊都有雨絲', () => {
    const dry = { code: 1, tempC: 28, tempMax: 30, precipMm: 0, windKmh: 10, gustKmh: 15, hot: false, raining: false, stormKind: null };
    expect(sceneCond(dry, ['drizzle'], { manual: true }).raining).toBe(true);
    const storm = sceneCond(dry, ['rainstorm'], { manual: true });
    expect(storm.raining).toBe(true);
    expect(storm.stormKind).toBe('heavy-rain');
    expect(storm.precipMm).toBeGreaterThanOrEqual(40);
    const black = sceneCond(dry, ['blackrain'], { manual: true });
    expect(black.raining).toBe(true);
    expect(black.precipMm).toBeGreaterThanOrEqual(80);
    const withWind = sceneCond(dry, ['typhoon8', 'rainstorm'], { manual: true });
    expect(withWind.raining).toBe(true);
    expect(withWind.stormKind).toBe('typhoon');
    const slip = sceneCond(dry, ['landslip', 'blackrain'], { manual: true });
    expect(slip.raining).toBe(true);
    expect(sceneCond(dry, ['thunder', 'drizzle'], { manual: true }).raining).toBe(true);
    expect(sceneCond(dry, ['thunder'], { manual: true }).raining).toBe(false);
  });
});
