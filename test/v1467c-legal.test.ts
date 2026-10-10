import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { tables, useLocale } from '../src/i18n';

describe('1.4.67 legal copy: real official weather, no “not official” framing', () => {
  it('disclaimer affirms official sources and drops non-official wording', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      useLocale(loc);
      const d = tables()[loc]['ui.356'];
      expect(d).not.toMatch(/唔係官方預報|不是官方預報|不是官方预报|Not official forecasts/i);
      expect(d).not.toMatch(/只供娛樂|仅供娱乐|僅供娛樂|entertainment only/i);
      expect(d).toMatch(/真實天氣，來自官方|真实天气，来自官方|Real weather from official/);
      expect(d).toMatch(/擷取|撷取|快取|缓存|fetching|caching|converting|轉換|转换/);
      expect(d).toMatch(/安全第一|Safety first/);
    }
    useLocale('zh-HK');
  });

  it('terms + support FAQ match the same framing', () => {
    const terms = readFileSync('public/terms.html', 'utf8');
    expect(terms).not.toMatch(/不能代替官方|not a substitute for official/i);
    expect(terms).toMatch(/官方氣象|official meteorological/);
    const support = readFileSync('public/support.html', 'utf8');
    expect(support).toMatch(/官方氣象|official meteorological/);
  });
});
