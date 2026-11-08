// 1.4.80: strong monsoon is wind only; thunderstorm still lightning. Information warnings are pushed.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { APP_VERSION } from '../src/version';
import { hkoWarningEvents, sceneCond } from '../src/events';
import type { HkoWarning } from '../src/hko';
import { weatherLook } from '../src/three/weatherFx3d';
import type { DayCond } from '../src/types';

const base: DayCond = { code: 2, tempC: 28, tempMax: 31, precipMm: 0, windKmh: 20, gustKmh: 30, hot: false, raining: false, stormKind: null };
const w = (group: string): HkoWarning => ({ group, code: group, name: group, short: group, kind: group === 'WMSGNL' ? 'gale' : null, standby: false, tone: 'amber', issued: '' });

describe('1.4.80 monsoon lightning and warning pushes', () => {
  it('version 1.4.80 / versionCode 87', () => {
    expect(APP_VERSION).toBe('1.4.80');
    const g = fs.readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+87/);
    expect(g).toContain('1.4.80');
  });

  it('monsoon alone is gale without lightning; a thunderstorm warning still flashes', () => {
    expect(hkoWarningEvents([w('WMSGNL')])).toEqual(['typhoon1']);
    expect(hkoWarningEvents([w('WTS')])).toEqual(['thunder']);
    const monsoon = sceneCond(base, hkoWarningEvents([w('WMSGNL')]));
    expect(monsoon.stormKind).toBe('gale');
    expect(monsoon.thunder).toBeFalsy();
    expect(weatherLook(monsoon, 0.72).lightning).toBe(false);
    const thunder = sceneCond(base, hkoWarningEvents([w('WTS')]));
    expect(thunder.thunder).toBe(true);
    expect(weatherLook(thunder, 0.85).lightning).toBe(true);
    const both = sceneCond(base, hkoWarningEvents([w('WMSGNL'), w('WTS')]));
    expect(weatherLook(both, 0.85).lightning).toBe(true);
    expect(weatherLook({ ...base, code: 95 }, 0.2).lightning).toBe(true);
  });
});
