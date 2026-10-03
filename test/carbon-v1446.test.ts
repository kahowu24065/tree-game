import { describe, expect, it } from 'vitest';
import { carbonKg, carbonParts } from '../src/rules';
import { formatCarbon } from '../src/ui';
import { switchLocale } from '../src/i18n';
import { tables } from '../src/i18n';

describe('1.4.46 碳吸收量 display', () => {
  it('carbonKg is unrounded: an 18 cm ginkgo seedling takes up ~26 g a year (was shown as 0 kg)', () => {
    const kg = carbonKg(18, 'ginkgo');
    expect(kg).toBeGreaterThan(0.02);
    expect(kg).toBeLessThan(0.03);
    expect(carbonParts(kg)).toEqual({ unit: 'g', n: '26' });
  });
  it('grams below 1 kg (whole, at least 1 g), kg with one decimal from 1 kg', () => {
    expect(carbonParts(0)).toEqual({ unit: 'g', n: '0' });
    expect(carbonParts(0.0001)).toEqual({ unit: 'g', n: '1' });
    expect(carbonParts(0.4)).toEqual({ unit: 'g', n: '400' });
    expect(carbonParts(0.9996)).toEqual({ unit: 'kg', n: '1.0' }); // 1000 g rolls over to kg
    expect(carbonParts(1.24)).toEqual({ unit: 'kg', n: '1.2' });
    expect(carbonParts(22.96)).toEqual({ unit: 'kg', n: '23.0' });
    expect(carbonParts(Number.NaN)).toEqual({ unit: 'g', n: '0' });
  });
  it('all 4 languages, and the four templates no longer carry their own unit', () => {
    const want: Record<string, [string, string]> = { 'zh-HK': ['26 克', '1.2 公斤'], 'zh-TW': ['26 克', '1.2 公斤'], 'zh-CN': ['26 克', '1.2 公斤'], en: ['26 g', '1.2 kg'] };
    for (const [loc, [g, kg]] of Object.entries(want)) {
      switchLocale(loc as never);
      expect(formatCarbon(0.026)).toBe(g);
      expect(formatCarbon(1.24)).toBe(kg);
      const t = (tables() as Record<string, Record<string, string>>)[loc]!;
      for (const [k, ph] of [['ui.113', 'p6'], ['ui.215', 'p19'], ['ui.314', 'p5'], ['ui.332', 'p4']] as const) {
        expect(t[k], `${loc} ${k}`).toContain(`{${ph}}`);
        expect(t[k], `${loc} ${k}`).not.toMatch(new RegExp(`\\{${ph}\\} ?(公斤|kg)`));
      }
    }
    switchLocale('zh-HK' as never);
  });
});

import { formatRealAge, realAgeParts } from '../src/ui';
describe('1.4.46 真實樹齡 in years + days', () => {
  it('under a year in days; from 365 days years + days (no "0 days")', () => {
    expect(realAgeParts(132)).toEqual({ y: 0, d: 132 });
    expect(realAgeParts(364)).toEqual({ y: 0, d: 364 });
    expect(realAgeParts(365)).toEqual({ y: 1, d: 0 });
    expect(realAgeParts(397)).toEqual({ y: 1, d: 32 });
    expect(realAgeParts(3650 + 5)).toEqual({ y: 10, d: 5 });
  });
  it('all 4 languages; English stays compact', () => {
    const want: Record<string, [string, string, string]> = {
      'zh-HK': ['132 日', '1 年', '1 年 32 日'],
      'zh-TW': ['132 天', '1 年', '1 年 32 天'],
      'zh-CN': ['132 天', '1 年', '1 年 32 天'],
      en: ['132D', '1Y', '1Y 32D'],
    };
    for (const [loc, [a, b, c]] of Object.entries(want)) {
      switchLocale(loc as never);
      expect([formatRealAge(132), formatRealAge(365), formatRealAge(397)]).toEqual([a, b, c]);
      const t = (tables() as Record<string, Record<string, string>>)[loc]!['ui.113']!;
      expect(t).toMatch(/(真實樹齡|真实树龄|real tree age) \{p5\}<\/span>/);
    }
    expect((tables() as Record<string, Record<string, string>>).en!['ui.113']).toContain('about {p6} CO₂/yr</span>');
    switchLocale('zh-HK' as never);
  });
});
