import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { tables } from '../src/i18n';
import { vignetteDayModal } from '../src/ui';
import { VIGNETTE_ART_IDS, vignetteArtSvg } from '../src/vignetteArt';

describe('1.4.67b daily vignette + boot lock', () => {
  it('has soft SVG art for every vignette id', () => {
    expect(VIGNETTE_ART_IDS.length).toBeGreaterThanOrEqual(10);
    for (const id of VIGNETTE_ART_IDS) {
      const svg = vignetteArtSvg(id);
      expect(svg).toContain('<svg');
      expect(svg.length).toBeLessThan(3500);
    }
    expect(vignetteArtSvg('unknown-id')).toContain('<svg');
  });

  it('vignette day modal shows art + copy', () => {
    const html = vignetteDayModal('mist', '晨霧', '薄霧濕潤咗葉面同泥土。');
    expect(html).toContain('vignette-art');
    expect(html).toContain('晨霧');
    expect(html).toContain('data-action="vig-day-done"');
    expect(tables()['zh-HK']['vigDay.eyebrow']).toBe('今日小事');
  });

  it('boot-block CSS + finishOpening unlock path exist', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toContain('html.boot-block #scene');
    expect(css).toContain('pointer-events: none !important');
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('unlockHudInput');
    expect(main).toContain('queueDailyVignetteCard');
    expect(main).toContain('HUD_FADE_MS');
    expect(main).toContain('vig-day-done');
    const index = fs.readFileSync('index.html', 'utf8');
    expect(index).toContain('boot-block');
  });
});
