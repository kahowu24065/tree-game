import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import { VIGNETTE_ART_IDS, vignetteArtHtml, vignetteArtUrl } from '../src/vignetteArt';

describe('1.4.68 sheet title + painterly vignettes', () => {
  it('version is 1.4.68', () => {
    expect(APP_VERSION >= '1.4.68').toBe(true);
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+\d+/);
    expect(APP_VERSION >= '1.4.68').toBe(true);
  });

  it('成長日誌 sheet sits above the care dock (title not sunk into buttons)', () => {
    const css = readFileSync('src/style.css', 'utf8');
    const sheet = css.slice(css.indexOf('/* ---------- Growth log sheet'), css.indexOf('/* ---------- Growth log sheet') + 1200);
    expect(sheet).toContain('bottom: calc(var(--dock-h) - 14px)');
    expect(sheet).not.toContain('bottom: calc(var(--dock-h) - 36px)');
    expect(sheet).toContain('bottom: var(--banner-h)');
    expect(sheet).not.toMatch(/\.sheet\[data-state='open'\][^{]*\{[^}]*bottom:\s*0/);
    expect(sheet).toContain('var(--dock-body)');
  });

  it('vignette art uses WebP assets per event id', () => {
    expect(VIGNETTE_ART_IDS.length).toBeGreaterThanOrEqual(10);
    for (const id of VIGNETTE_ART_IDS) {
      expect(existsSync(`public/vignette/${id}.webp`), id).toBe(true);
      expect(vignetteArtUrl(id)).toBe(`/vignette/${id}.webp`);
    }
    expect(vignetteArtUrl('nope')).toBe('/vignette/quiet.webp');
    const html = vignetteArtHtml('sunbeam');
    expect(html).toContain('src="/vignette/sunbeam.webp"');
    expect(html).not.toContain('<svg');
    const src = readFileSync('src/vignetteArt.ts', 'utf8');
    expect(src).not.toMatch(/vignetteFrame|function sky\(/);
  });
});
