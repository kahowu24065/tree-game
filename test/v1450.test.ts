import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { sunForDate } from '../src/sun';
import { creditsModal, DATA_SOURCES, SOUNDS } from '../src/credits';
import { useLocale } from '../src/i18n';

describe('1.4.50 no Open-Meteo, MET Norway via our server', () => {
  it('no source file calls api.open-meteo.com', () => {
    for (const dir of ['src', 'push-server/src']) {
      for (const f of readdirSync(dir, { recursive: true }) as string[]) {
        if (!/\.(ts|js)$/.test(f)) continue;
        expect(readFileSync(`${dir}/${f}`, 'utf8'), `${dir}/${f}`).not.toContain('api.open-meteo.com');
      }
    }
  });

  it('sun times computed locally (Hong Kong, early October)', () => {
    const s = sunForDate(22.3, 114.17, '2026-10-07', 'Asia/Hong_Kong')!;
    expect(s.sunrise).toMatch(/^2026-10-07T06:1\d$/);
    expect(s.sunset).toMatch(/^2026-10-07T18:0\d$/);
  });
});

describe('1.4.50 資料來源及授權', () => {
  it('lists every source, every CREDITS.txt sound and a no-endorsement line in all languages', () => {
    const credits = readFileSync('public/audio/CREDITS.txt', 'utf8');
    for (const [, , url] of SOUNDS) expect(credits).toContain(url);
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      useLocale(loc);
      const html = creditsModal();
      expect(html).toContain('data.gov.tw/license');
      expect(html).toContain('MET Norway');
      expect(html).toContain('three.js');
      expect(html.match(/<li>/g)!.length).toBeGreaterThanOrEqual(DATA_SOURCES.length + SOUNDS.length + 3);
    }
    useLocale('zh-HK');
  });
});
