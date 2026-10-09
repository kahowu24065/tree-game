// 1.4.65: labeled share on 成長日誌, preview-before-share, new non-birds in the album.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { ANIMALS, animalById } from '../src/data/animals';
import { tables } from '../src/i18n';

// animalAlbum is private — exercise via album through body, or export a helper.
// Read the album markup the same way the app builds it: all ANIMALS appear, locked or not.
describe('share button + preview', () => {
  it('shows 分享樹卡 beside the icon on the growth-log bar, and drops the milestones share button', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    expect(html).toMatch(/id="sheet-share"[\s\S]*?sheet-share-lab/);
    expect(html).toContain('id="share-flash"');
    const ui = fs.readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain('sharePreviewModal');
    expect(ui).not.toMatch(/case 'milestones':\s*return `<button[^>]*share-card/);
    expect(ui).toMatch(/case 'milestones':\s*return milestoneTab/);
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toMatch(/\.sheet-share\s*\{[\s\S]*?top:\s*3px/);
    expect(css).toMatch(/\.sheet-gear\s*\{[\s\S]*?top:\s*3px|\.sheet-gear,\s*\.sheet-share\s*\{[\s\S]*?top:\s*3px/);
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain("share-card-send");
    expect(main).toContain('playShareFlash');
    expect(main).toContain('pendingShareCard');
  });

  it('preview copy exists in all four locales', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      for (const k of ['share.previewTitle', 'share.send', 'share.cancel', 'share.button']) {
        expect(tables()[loc][k], `${loc} ${k}`).toBeTruthy();
      }
    }
  });
});

describe('animal guide lists new non-birds', () => {
  it('catalogue includes the new species as lockable entries', () => {
    for (const id of ['damselfly', 'grasshopper', 'bullfrog', 'cricket', 'skink']) {
      const a = animalById(id);
      expect(a, id).toBeTruthy();
      expect(a!.category).not.toBe('bird');
    }
    expect(ANIMALS.length).toBeGreaterThanOrEqual(70);
    // Album iterates every ANIMALS entry (locked or not).
    const ui = fs.readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain('ANIMALS.filter((a) => a.category === cat)');
    expect(ui).toContain("got ? '' : 'locked'");
  });
});
