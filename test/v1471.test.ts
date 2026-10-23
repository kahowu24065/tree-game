import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import { tables } from '../src/i18n';
import { VIGNETTE_ART_IDS, vignetteArtUrl } from '../src/vignetteArt';
import { dailyEventAllowed, pickDailyEvent, EVENTS, eventById } from '../src/content';
import { createGame, ensureToday } from '../src/sim';
import { vignettePropKind } from '../src/three/vignetteProp3d';

const NEW = [
  'puddle-mirror', 'petrichor', 'snails', 'leaf-drip', 'rain-patter',
  'butterfly', 'warm-grass', 'bird-song', 'leaf-shadow', 'cicada-hum',
  'tumble-leaf', 'rustle', 'grass-wave', 'seed-fluff',
  'animal-shade', 'hot-stones',
  'animal-hide', 'heavy-sway', 'nest-hold',
  'crisp-air', 'ember-warmth',
] as const;

const base = {
  pestActive: false,
  rainy: false,
  windy: false,
  hot: false,
  cold: false,
  typhoon: false,
};

describe('1.4.72 twenty-one more weather vignettes', () => {
  it('version 1.4.72 / versionCode 79', () => {
    expect(APP_VERSION).toBe('1.4.72');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+79/);
    expect(g).toContain('1.4.72');
  });

  it('EVENTS has 31 ids and all new ones are present with i18n', () => {
    expect(EVENTS.length).toBe(31);
    for (const id of NEW) {
      expect(EVENTS.some((e) => e.id === id), id).toBe(true);
      const ev = eventById(id);
      expect(ev.id).toBe(id);
      expect(ev.title).toBeTruthy();
      expect(ev.text).toBeTruthy();
    }
    expect(tables()['zh-HK']['content.043']).toBe('水窪倒影');
    expect(tables()['en']['content.043']).toBe('Puddle mirror');
    expect(tables()['zh-TW']['content.090']).toBeTruthy();
    expect(tables()['zh-CN']['content.090']).toBeTruthy();
  });

  it('placeholder WebP for every new id; art map covers all', () => {
    expect(VIGNETTE_ART_IDS.length).toBe(31);
    for (const id of NEW) {
      expect(VIGNETTE_ART_IDS.includes(id as (typeof VIGNETTE_ART_IDS)[number]), id).toBe(true);
      const path = `public/vignette/${id}.webp`;
      expect(existsSync(path), id).toBe(true);
      expect(statSync(path).size, id).toBeGreaterThan(8_000);
      expect(vignetteArtUrl(id)).toBe(`/vignette/${id}.webp`);
    }
  });

  it('new ids have no 3D prop yet (null — no crash)', () => {
    for (const id of NEW) {
      expect(vignettePropKind(id), id).toBeNull();
    }
  });

  it('weather gates: rain / clear / wind / hot / typhoon / cool', () => {
    for (const id of ['puddle-mirror', 'petrichor', 'snails', 'leaf-drip', 'rain-patter'] as const) {
      expect(dailyEventAllowed(id, { ...base, rainy: true }), id).toBe(true);
      expect(dailyEventAllowed(id, base), id).toBe(false);
    }
    for (const id of ['butterfly', 'warm-grass', 'bird-song', 'leaf-shadow'] as const) {
      expect(dailyEventAllowed(id, base), id).toBe(true);
      expect(dailyEventAllowed(id, { ...base, rainy: true }), id).toBe(false);
      expect(dailyEventAllowed(id, { ...base, typhoon: true }), id).toBe(false);
    }
    expect(dailyEventAllowed('cicada-hum', { ...base, hot: true })).toBe(true);
    expect(dailyEventAllowed('cicada-hum', { ...base, rainy: true })).toBe(false);
    for (const id of ['tumble-leaf', 'rustle', 'grass-wave', 'seed-fluff'] as const) {
      expect(dailyEventAllowed(id, { ...base, windy: true }), id).toBe(true);
      expect(dailyEventAllowed(id, { ...base, windy: true, rainy: true }), id).toBe(false);
      expect(dailyEventAllowed(id, base), id).toBe(false);
    }
    for (const id of ['animal-shade', 'hot-stones'] as const) {
      expect(dailyEventAllowed(id, { ...base, hot: true }), id).toBe(true);
      expect(dailyEventAllowed(id, base), id).toBe(false);
    }
    for (const id of ['animal-hide', 'heavy-sway', 'nest-hold'] as const) {
      expect(dailyEventAllowed(id, { ...base, typhoon: true }), id).toBe(true);
      expect(dailyEventAllowed(id, base), id).toBe(false);
    }
    for (const id of ['crisp-air', 'ember-warmth'] as const) {
      expect(dailyEventAllowed(id, { ...base, cold: true }), id).toBe(true);
      expect(dailyEventAllowed(id, base), id).toBe(true); // mild clear also ok
      expect(dailyEventAllowed(id, { ...base, rainy: true }), id).toBe(false);
      expect(dailyEventAllowed(id, { ...base, hot: true }), id).toBe(false);
    }
  });

  it('pick respects typhoon/hot and ensureToday passes flags', () => {
    const storm = pickDailyEvent({
      date: '2026-10-13',
      treeName: '颱',
      pestActive: false,
      rainy: false,
      windy: true,
      hot: false,
      cold: false,
      typhoon: true,
    });
    expect(['butterfly', 'puddle-mirror', 'animal-shade']).not.toContain(storm.id);
    const g = createGame('2026-10-13');
    g.dailyEventDate = '';
    ensureToday(g, '2026-10-13', ['typhoon8']);
    expect(['sunbeam', 'drywind', 'mist', 'drawing', 'cat', 'aphids', 'butterfly']).not.toContain(g.dailyEventId);
    const g2 = createGame('2026-10-14');
    g2.dailyEventDate = '';
    ensureToday(g2, '2026-10-14', ['hot']);
    expect(EVENTS.some((e) => e.id === g2.dailyEventId)).toBe(true);
  });

  it('eventById falls back to quiet', () => {
    expect(eventById('no-such').id).toBe('quiet');
  });



  it('圖鑑 album includes vignette mode strings + art urls', () => {
    expect(tables()['zh-HK']['ui.277']).toContain('data-album-mode="vignettes"');
    expect(tables()['zh-HK']['ui.371']).toContain('data-seen-vig');
    expect(tables()['zh-HK']['ui.373']).toContain('今日小事');
    expect(tables()['en']['ui.277']).toContain('Moments');
    for (const id of NEW) {
      expect(vignetteArtUrl(id)).toBe(`/vignette/${id}.webp`);
    }
  });

  it('ensureToday unlocks vignette into album list', () => {
    const g = createGame('2026-10-15');
    // createGame already runs ensureToday once
    expect(g.vignettes).toContain(g.dailyEventId);
    expect(g.vignettes.length).toBeGreaterThanOrEqual(1);
    g.dailyEventDate = '';
    ensureToday(g, '2026-10-16', ['rainstorm']);
    expect(g.vignettes).toContain(g.dailyEventId);
  });

});
