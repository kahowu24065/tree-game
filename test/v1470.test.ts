import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import { tables } from '../src/i18n';
import { VIGNETTE_ART_IDS, vignetteArtUrl } from '../src/vignetteArt';
import { dailyEventAllowed, pickDailyEvent, EVENTS } from '../src/content';
import { createGame, ensureToday } from '../src/sim';

describe('1.4.70 artist vignettes + pick rules', () => {
  it('version 1.4.71 / versionCode 78', () => {
    expect(APP_VERSION).toBe('1.4.71');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+78/);
    expect(g).toContain('1.4.71');
  });

  it('WebP assets exist and are substantial (artist crops, not tiny SVG raster)', () => {
    const artist = ['mist', 'compost', 'birds', 'drywind', 'leaves', 'drawing', 'aphids', 'sunbeam', 'cat', 'quiet'] as const;
    for (const id of artist) {
      const path = `public/vignette/${id}.webp`;
      expect(existsSync(path), id).toBe(true);
      expect(statSync(path).size, id).toBeGreaterThan(30_000);
      expect(vignetteArtUrl(id)).toBe(`/vignette/${id}.webp`);
    }
    for (const id of VIGNETTE_ART_IDS) {
      expect(existsSync(`public/vignette/${id}.webp`), id).toBe(true);
      expect(vignetteArtUrl(id)).toBe(`/vignette/${id}.webp`);
    }
    const art = readFileSync('src/vignetteArt.ts', 'utf8');
    expect(art).not.toMatch(/vignetteFrame|procedural/);
  });

  it('birds title renamed', () => {
    expect(tables()['zh-HK']['content.022']).toBe('雀仔都嚟啦');
    expect(tables()['zh-TW']['content.022']).toBe('雀仔都來啦');
    expect(tables()['zh-CN']['content.022']).toBe('鸟儿都来啦');
    expect(tables()['en']['content.022']).toBe('The birds are here');
  });

  it('aphids only with pests; rain blocks sunbeam/drywind/mist/drawing/cat', () => {
    expect(dailyEventAllowed('aphids', { pestActive: false, rainy: false, windy: false, hot: false, cold: false, typhoon: false })).toBe(false);
    expect(dailyEventAllowed('aphids', { pestActive: true, rainy: false, windy: false, hot: false, cold: false, typhoon: false })).toBe(true);
    expect(dailyEventAllowed('aphids', { pestActive: true, rainy: true, windy: false, hot: false, cold: false, typhoon: false })).toBe(true);
    for (const id of ['sunbeam', 'drywind', 'mist', 'drawing', 'cat'] as const) {
      expect(dailyEventAllowed(id, { pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false }), id).toBe(false);
      expect(dailyEventAllowed(id, { pestActive: false, rainy: false, windy: false, hot: false, cold: false, typhoon: false }), id).toBe(true);
    }
    expect(dailyEventAllowed('birds', { pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false })).toBe(true);
    expect(dailyEventAllowed('quiet', { pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false })).toBe(true);
  });

  it('pick is per-player-per-day and respects filters', () => {
    const a = pickDailyEvent({ date: '2026-10-13', treeName: '甲', pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false });
    const b = pickDailyEvent({ date: '2026-10-13', treeName: '乙', pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false });
    // both allowed under rain
    expect(['sunbeam', 'drywind', 'mist', 'drawing', 'cat', 'aphids']).not.toContain(a.id);
    expect(['sunbeam', 'drywind', 'mist', 'drawing', 'cat', 'aphids']).not.toContain(b.id);
    const wet = new Set(
      Array.from({ length: 40 }, (_, i) =>
        pickDailyEvent({ date: `2026-11-${String(i + 1).padStart(2, '0')}`, treeName: '甲', pestActive: false, rainy: true, windy: false, hot: false, cold: false, typhoon: false }).id,
      ),
    );
    expect(wet.has('sunbeam')).toBe(false);
    expect(wet.has('aphids')).toBe(false);
    const pest = pickDailyEvent({ date: '2026-10-13', treeName: '甲', pestActive: true, rainy: false, windy: false, hot: false, cold: false, typhoon: false });
    expect(EVENTS.some((e) => e.id === pest.id)).toBe(true);
    // same player+date → stable
    const x = pickDailyEvent({ date: '2026-10-13', treeName: '穩', pestActive: true, rainy: false, windy: false, hot: false, cold: false, typhoon: false });
    const y = pickDailyEvent({ date: '2026-10-13', treeName: '穩', pestActive: true, rainy: false, windy: false, hot: false, cold: false, typhoon: false });
    expect(x.id).toBe(y.id);
  });

  it('ensureToday uses weather + pest for the pick', () => {
    const g = createGame('2026-10-13');
    g.dailyEventDate = '';
    g.pest.active = false;
    ensureToday(g, '2026-10-13', ['rainstorm']);
    expect(['sunbeam', 'drywind', 'mist', 'drawing', 'cat', 'aphids']).not.toContain(g.dailyEventId);
  });
});
