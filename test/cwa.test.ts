// v1.4.14 Taiwan (中央氣象署): the app and the push server must map CWA warnings to the same game events.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { hkoWarningEvents } from '../src/events';
import { inTaiwan, mapCwaWarning, parseCwa, type CwaRawWarning } from '../src/cwa';
import { inMacau } from '../src/weather';
// @ts-expect-error plain JS module without types
import * as server from '../push-server/src/cwa.js';

const ALL: CwaRawWarning[] = [
  ...[1, 2].map((level) => ({ type: 'typhoon' as const, level, name: level === 2 ? '海上陸上颱風警報' : '海上颱風警報' })),
  ...[1, 2, 3, 4].map((level) => ({ type: 'rain' as const, level, name: ['', '大雨特報', '豪雨特報', '大豪雨特報', '超大豪雨特報'][level]! })),
  ...[1, 2, 3].map((level) => ({ type: 'wind' as const, level, name: '陸上強風特報' })),
  ...[1, 2, 3].map((level) => ({ type: 'heat' as const, level, name: '高溫資訊' })),
  ...[1, 2, 3].map((level) => ({ type: 'cold' as const, level, name: '低溫特報' })),
  { type: 'fog', level: 1, name: '濃霧特報' },
];

describe('Taiwan / CWA', () => {
  it('app and push server agree on every Taiwan warning → game event', () => {
    for (const w of ALL) {
      const app = hkoWarningEvents([mapCwaWarning(w)!]).sort();
      expect(app, `${w.type}${w.level}`).toEqual(server.eventsFromCwa([w]).sort());
    }
    expect(hkoWarningEvents([mapCwaWarning(ALL[1]!)!])).toEqual(['typhoon8']);
    expect(hkoWarningEvents([mapCwaWarning({ type: 'rain', level: 3, name: '大豪雨特報' })!])).toEqual(['blackrain']);
    expect(hkoWarningEvents([mapCwaWarning({ type: 'wind', level: 2, name: '陸上強風特報' })!])).toEqual(['thunder']);
  });

  it('inTaiwan matches the server and leaves HK / Macau alone', () => {
    for (const [la, lo] of [[25.04, 121.56], [22.63, 120.3], [24.43, 118.32], [22.3, 114.17], [22.19, 113.54], [24.48, 118.09]] as const) {
      expect(inTaiwan(la, lo)).toBe(server.inTaiwan(la, lo));
    }
    expect(inTaiwan(22.19, 113.54) || inMacau(25.04, 121.56)).toBe(false);
  });

  it('server bundle → app shape: Taipei fixture keeps CWA names and the forecast', () => {
    const sets = JSON.parse(fs.readFileSync(new URL('../push-server/test/fixtures/cwa-taipei.json', import.meta.url), 'utf8'));
    const body = server.buildCwa(sets, 25.04, 121.56, Date.parse('2026-10-01T10:00:00+08:00'));
    const b = parseCwa(body);
    expect(b.county).toBe('臺北市');
    expect(b.data.current?.tempC).toBeTypeOf('number');
    expect(b.data.forecast.length).toBeGreaterThanOrEqual(5);
    expect(b.data.warnings[0]?.name).toMatch(/^高溫資訊/);
    expect(b.data.warnings[0]?.group).toBe('TWHOT');
    expect(hkoWarningEvents(b.data.warnings)).toEqual(['hot']);
  });
});
