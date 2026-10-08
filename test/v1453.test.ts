// 1.4.53: the hatch countdown card opens the egg pop-up (countdown, reward, keep warm); the rules stay one tap away inside it.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { switchLocale, t } from '../src/i18n';
import { eggPopupAvailable, freshNest } from '../src/nest';

describe('1.4.53 hatch card → egg pop-up', () => {
  it('the egg pop-up is available only while an egg is waiting to hatch', () => {
    expect(eggPopupAvailable(null)).toBe(false);
    const nest = freshNest();
    expect(eggPopupAvailable(nest)).toBe(false);
    nest.egg = { bird: 'sparrow', laidAt: 1_000, hatchedAt: null };
    expect(eggPopupAvailable(nest)).toBe(true);
    nest.egg.hatchedAt = 2_000;
    expect(eggPopupAvailable(nest)).toBe(false);
  });

  it('the hatch-card action opens the egg pop-up, not the rules modal', () => {
    const src = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const start = src.indexOf("case 'hatch-card':");
    expect(start).toBeGreaterThan(0);
    const body = src.slice(start, src.indexOf('return;', start));
    expect(body).toContain('openEggModal()');
    expect(body).not.toContain('nestIntroModal');
  });

  it('every language keeps the rules button and the keep-warm button in the egg pop-up', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en']) {
      switchLocale(loc as never);
      const html = t('nest.egg', { bird: 'B', clock: '05:00:00', reward: 'R', explain: 'E', warm: 'W', warmCls: '', warmOff: 'false', close: 'C' });
      expect(html).toContain('data-action="nest-intro"');
      expect(html).toContain('data-action="warm-egg"');
      expect(html).toContain('id="egg-clock"');
    }
    switchLocale('zh-HK' as never);
  });
});
