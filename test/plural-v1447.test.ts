import { describe, expect, it } from 'vitest';
import { switchLocale, t, tables } from '../src/i18n';

describe('1.4.47 English day plurals', () => {
  it('tree-age strings say "1 day" and "2 days"', () => {
    switchLocale('en' as never);
    const cases: [string, string, string][] = [
      ['ui.113', 'p4', 'Tree age # = '],
      ['main.017', 'p2', 'tree age #, height'],
      ['ui.298', 'p2', '(tree age #)'],
      ['ui.317', 'p4', 'tree age #</p>'],
      ['ui.332', 'p1', 'Tree age #, height'],
    ];
    for (const [key, ph, frag] of cases) {
      const one = t(key, { [ph]: 1 });
      const two = t(key, { [ph]: 2 });
      expect(one, key).toContain(frag.replace('#', '1 day'));
      expect(one, key).not.toContain('1 days');
      expect(two, key).toContain(frag.replace('#', '2 days'));
    }
    switchLocale('zh-HK' as never);
    expect(t('ui.113', { p4: 1 })).toContain('樹齡 1 日');
  });
  it('no English string puts a variable count directly before "days"/"years" without a plural form', () => {
    const en = (tables() as Record<string, Record<string, string>>).en!;
    // Counts that are fixed constants (always > 1) are allowed.
    const fixed = /\{(PEST_TRIGGER_DAYS|NORMAL_PAST_DAYS|DYING_HOURS|RESIDENT_STREAK_LATER)\}/;
    const bad = Object.entries(en).filter(([, v]) => [...v.matchAll(/\{\w+\} (days|years)\b/g)].some((m) => !fixed.test(m[0])));
    expect(bad.map(([k]) => k)).toEqual([]);
  });
});
