// 1.4.58: welcome tour, tappable scenery, imperial everywhere, modal spacing standard, MeteoAlarm terms.
import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { convertLengths, t, useHeightUnit, useLocale } from '../src/i18n';
import { freshCoach, armCoach, markCoach, markTour, tourDue, loadCoach, COACH_KEY } from '../src/coach';
import { TOUR_PAGES, tourModal, settingsModal } from '../src/ui';
import { decorHatchCount, sceneryCaption } from '../src/scenery';
import { parseAlerts } from '../src/alerts';
import { feedAlertsHtml } from '../src/ui';

afterEach(() => {
  useHeightUnit('metric');
  useLocale('zh-HK');
});

describe('imperial units', () => {
  it('protected game-rule lengths convert exactly instead of staying metric', () => {
    useLocale('en');
    expect(convertLengths('(height ÷ 10\u2060 m)', 'imperial', 'en')).toContain('32.8 ft');
    expect(convertLengths('(樹高 ÷ 10\u2060 米)', 'imperial', 'zh-HK')).not.toMatch(/米/);
  });
  it('no metre / centimetre text is left in any locale once imperial is chosen (rainfall mm stays)', () => {
    for (const l of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      useLocale(l);
      useHeightUnit('imperial');
      const g = t('guide.132');
      expect(g, l).not.toMatch(/(\d|\u2060)\s?(米|厘米|cm|m)\b/);
    }
  });
});

describe('welcome tour', () => {
  it('only a fresh save planting its first tree gets it; skip / seen / old coaches never', () => {
    const c = freshCoach();
    const a = armCoach(c);
    expect(tourDue(c, a)).toBe(true);
    expect(tourDue(a, armCoach(a))).toBe(false);
    expect(tourDue(c, markTour(a))).toBe(false);
    expect(markCoach(c, 'skip').tour).toBe(true);
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) };
    store.set(COACH_KEY, JSON.stringify({ armed: false, water: false, feed: false, health: false, carbon: false, done: false }));
    expect(loadCoach().tour).toBe(true);
    store.set(COACH_KEY, JSON.stringify({ done: true }));
    expect(loadCoach().tour).toBe(true);
  });
  it('pages: water, fertilise, weather card, health 90+ → eggs; skippable, replay in settings', () => {
    expect(TOUR_PAGES).toBe(4);
    for (let p = 0; p < TOUR_PAGES; p++) {
      const h = tourModal(p);
      expect(h).toContain(p === TOUR_PAGES - 1 ? 'data-action="tour-done"' : 'data-action="tour-next"');
      if (p < TOUR_PAGES - 1) expect(h).toContain('data-action="tour-skip"');
    }
    useLocale('en');
    expect(tourModal(3)).toContain('90');
    expect(settingsModal('Tree')).toContain('data-action="tour-replay"');
    expect(fs.readFileSync('src/guide.ts', 'utf8')).toContain('tour-replay');
  });
});

describe('tappable scenery', () => {
  it('decorations say which hatch earned them', () => {
    expect([0, 1, 2, 3].map(decorHatchCount)).toEqual([1, 10, 20, 30]);
    useLocale('en');
    expect(sceneryCaption({ kind: 'decor', decor: 'windmill', index: 0 }, null)).toMatch(/1st egg/);
    expect(sceneryCaption({ kind: 'decor', decor: 'statue', index: 1 }, null)).toMatch(/10th egg/);
    useLocale('zh-HK');
    expect(sceneryCaption({ kind: 'decor', decor: 'house', index: 2 }, null)).toContain('第 20 粒蛋');
    expect(sceneryCaption({ kind: 'landmark', index: 0 }, null)).toBeNull();
    expect(sceneryCaption({ kind: 'landmark', index: 0 }, { name: '阿榕', heightCm: 1200 })).toContain('阿榕');
    const lines = new Set([0, 1, 2].map((n) => sceneryCaption({ kind: 'rock', index: 0 }, null, n)));
    expect(lines.size).toBe(3);
  });
  it('scene: tap picking from known positions, wobble / bounce / sparkle, reduced motion damped', () => {
    const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toContain('this.tapScenery(this.raycaster.ray, tol)');
    expect(scene).toMatch(/stepScenery\(dt, input\.reducedMotion\)/);
    expect(scene).toMatch(/reduced \? 0\.3 : 1/);
    expect(fs.readFileSync('src/main.ts', 'utf8')).toContain('scene3d.onSceneryTap');
  });
});

describe('modal spacing standard', () => {
  const css = fs.readFileSync('src/style.css', 'utf8');
  it('44px tap height, 14px between stacked buttons, headings 22 / 10', () => {
    expect(css).toMatch(/\.modal-card \.ghost \{[^}]*min-height:\s?44px/);
    expect(css).toMatch(/\.modal-card \.primary \{[^}]*min-height:\s?46px/);
    expect(css).toMatch(/:is\(\.primary,\s?\.ghost,\s?\.texty\) \+ :is\(\.primary,\s?\.ghost,\s?\.texty\)\s?\{\s*margin-top:\s?14px/);
    expect(css).toMatch(/\.modal-card h3\.sub\s?\{\s*margin:\s?22px 2px 10px/);
    expect(css).toMatch(/\.actions\s?\{[^}]*gap:\s?14px 12px/);
  });
});

describe('MeteoAlarm terms', () => {
  it('issue time, issuing service, link and the verbatim disclaimer reach the weather page', () => {
    const disc = 'Time delays between this website and the www.meteoalarm.org website are possible. For the most up-to-date awareness information as published by the participating National Meteorological and Hydrological Services, please refer to www.meteoalarm.org.';
    const a = parseAlerts({ covered: true, source: 'meteoalarm', attribution: 'EUMETNET – MeteoAlarm', link: 'https://meteoalarm.org/', disclaimer: disc, alerts: [{ id: '1', event: 'rainstorm', name: 'Starkregen', nameEn: 'Heavy rain', level: 'orange', onset: '2026-10-02T08:00:00Z', ends: '2099-10-02T20:00:00Z', headline: '', description: '', instruction: '', area: 'Berlin', active: true, issued: '2026-10-02T07:40:00Z', issuer: 'Deutscher Wetterdienst' }] })!;
    expect(a.alerts[0]!.issuer).toBe('Deutscher Wetterdienst');
    useLocale('en');
    const html = feedAlertsHtml({ source: a.source, alerts: a.alerts, attribution: a.attribution!, known: true, tz: 'Europe/Berlin', link: a.link, disclaimer: a.disclaimer });
    expect(html).toContain('Issued');
    expect(html).toContain('Deutscher Wetterdienst');
    expect(html).toContain('href="https://meteoalarm.org/"');
    expect(html).toContain(disc);
    expect(parseAlerts({ covered: true, source: 'nws', link: 'javascript:alert(1)', alerts: [] })!.link).toBe('');
  });
});
