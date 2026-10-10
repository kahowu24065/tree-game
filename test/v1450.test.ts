import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { sunForDate } from '../src/sun';
import { creditsModal, DATA_SOURCES } from '../src/credits';
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

describe('1.4.50 / 1.4.67 資料來源及授權', () => {
  it('lists weather sources only — no hyperlinks, no audio/OSS sections', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      useLocale(loc);
      const html = creditsModal();
      expect(html).toContain('MET Norway');
      expect(html).not.toMatch(/<a\s/i);
      expect(html).not.toContain('three.js');
      expect(html).not.toContain('opengameart');
      expect(html).not.toContain('CC0');
      expect(html.match(/<li>/g)!.length).toBe(DATA_SOURCES.length);
    }
    useLocale('zh-HK');
    const hk = creditsModal();
    expect(hk).toContain('天氣、警告及地名資料');
    expect(hk).not.toContain('音樂及音效');
    expect(hk).not.toContain('開源軟件');
  });
});
