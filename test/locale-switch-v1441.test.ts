import { afterEach, describe, expect, it } from 'vitest';
import { switchLocale, t } from '../src/i18n';
import { SPECIES, STAGE_NAMES } from '../src/data/species';
import { WEATHER_EVENTS } from '../src/balance';
import { ANIMALS } from '../src/data/animals';

// 1.4.41: changing language rebuilds the import-time tables in place (no reload).
afterEach(() => switchLocale('zh-HK'));

describe('1.4.41 switchLocale', () => {
  it('rebuilds tables in place: same objects, strings in the new language, and back', () => {
    const sp = SPECIES[0]!;
    const zhName = sp.name;
    const stage = STAGE_NAMES[0];
    const ev = WEATHER_EVENTS.hot;
    switchLocale('en');
    expect(SPECIES[0]).toBe(sp);
    expect(WEATHER_EVENTS.hot).toBe(ev);
    expect(sp.name).not.toBe(zhName);
    expect(/[\u3400-\u9fff]/.test(sp.name)).toBe(false);
    expect(STAGE_NAMES[0]).not.toBe(stage);
    expect(t('sim.001')).toBe('World Tree');
    expect(ANIMALS.every((a) => !/[\u3400-\u9fff]/.test(a.name))).toBe(true);
    switchLocale('zh-HK');
    expect(sp.name).toBe(zhName);
    expect(STAGE_NAMES[0]).toBe(stage);
  });
});
