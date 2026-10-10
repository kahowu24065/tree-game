import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { tables } from '../src/i18n';

describe('1.4.67 記錄樹卡 rename + glow', () => {
  it('visible copy says 記錄樹卡 / Record tree card; button glows when no snap today', () => {
    for (const loc of ['zh-HK', 'zh-TW'] as const) {
      expect(tables()[loc]['share.button']).toBe('記錄樹卡');
      expect(tables()[loc]['share.previewTitle']).toBe('記錄樹卡');
      expect(tables()[loc]['goals.share']).toContain('記錄樹卡');
      expect(tables()[loc]['postTip.shareTitle']).toContain('記錄樹卡');
      expect(tables()[loc]['postTip.shareBody']).toContain('記錄樹卡');
    }
    expect(tables()['zh-CN']['share.button']).toBe('记录树卡');
    expect(tables()['en']['share.button']).toBe('Record tree card');
    expect(tables()['en']['share.previewTitle']).toBe('Record tree card');
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('記錄樹卡');
    expect(html).not.toMatch(/sheet-share[^>]*>[\s\S]*?分享樹卡/);
    const ui = readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain("classList.toggle('needs-snap'");
    expect(ui).toContain('logPhotoFor(view.today)');
    const css = readFileSync('src/style.css', 'utf8');
    expect(css).toContain('.sheet-share.needs-snap');
    expect(css).toContain('sheet-share-glow');
  });
});
