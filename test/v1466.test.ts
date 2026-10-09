// 1.4.66: campfire clear ring, share card 「今日小事」, vignette props, lighter settings sheet.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { campfireSpot } from '../src/campfire';
import { EVENTS } from '../src/content';
import { tables } from '../src/i18n';
import { cardLines } from '../src/shareCard';
import { vignettePropKind } from '../src/three/vignetteProp3d';
import { LOG_PHOTOS_MAX_DAYS, pruneLogPhotos } from '../src/logPhotos';
import { bumpShareStreak, doableGoals, goalLabel, parseGoals, shareStreakOf } from '../src/goals';
import { createGame } from '../src/sim';
import { freshCoach, loadCoach, markPostTip, markTour } from '../src/coach';
import { TIMELAPSE_MIN_FRAMES, timelapseReady, timelapseUnlocked } from '../src/timelapse';

describe('campfire clear ring', () => {
  it('default margin keeps rocks farther from the pit', () => {
    const free = campfireSpot({ trunkU: 0.3, fireU: 0.25, prefer: 2.2, blocked: () => false });
    // With the larger 1.4.66 default margin (0.42), distance grows vs the old 0.14.
    expect(free.dist).toBeGreaterThan(0.3 + 0.25 + 0.3);
  });
});

describe('share card vignette', () => {
  it('shows 「今日小事」 title + text, not daily goals', () => {
    const lines = cardLines({
      treeName: '阿榕',
      species: '細葉榕',
      age: '12 日',
      height: '1.2 米',
      weather: [],
      vignette: { title: '小朋友的畫', text: '有孩童在樹下留低一張畫' },
    });
    expect(lines).toContain('小朋友的畫');
    expect(lines).toContain('有孩童在樹下留低一張畫');
    const share = fs.readFileSync('src/shareCard.ts', 'utf8');
    expect(share).toContain("tl('share.vignette')");
    expect(share).not.toContain("tl('share.goals')");
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toMatch(/vignette:\s*vig/);
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['share.vignette']).toBeTruthy();
    }
  });
});

describe('vignette scene props', () => {
  it('maps object-bearing daily events to a prop kind and skips atmosphere-only days', () => {
    expect(vignettePropKind('drawing')).toBe('drawing');
    expect(vignettePropKind('compost')).toBe('compost');
    expect(vignettePropKind('leaves')).toBe('leaves');
    expect(vignettePropKind('birds')).toBe('birds');
    expect(vignettePropKind('aphids')).toBe('aphids');
    expect(vignettePropKind('cat')).toBe('cat');
    expect(vignettePropKind('mist')).toBeNull();
    expect(vignettePropKind('sunbeam')).toBeNull();
    expect(vignettePropKind('drywind')).toBeNull();
    expect(vignettePropKind('quiet')).toBeNull();
    const ids = EVENTS.map((e) => e.id);
    for (const id of ids) {
      const kind = vignettePropKind(id);
      if (kind) expect(kind).toBe(id);
    }
    const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toContain('vignetteProp');
    expect(scene).toContain("kind: 'vignette'");
  });
});

describe('settings sheet', () => {
  it('opens as a smaller settings-sheet card', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain("'settings-sheet'");
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toContain('.modal-card.settings-sheet'); expect(css).toContain('max-height: min(68vh');
  });
});

describe('log photos from share preview', () => {
  it('saves at preview time with toast copy, and prunes to a capped window', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toMatch(/rememberLogPhoto\(today\(\),\s*card\)/);
    expect(main).toContain("tl('log.snapSaved')");
    // Save happens in shareTreeCard (preview), not only in sendPendingShareCard.
    const shareFn = main.slice(main.indexOf('async function shareTreeCard'), main.indexOf('async function sendPendingShareCard'));
    expect(shareFn).toContain('rememberLogPhoto');
    expect(shareFn).toContain('log.snapSaved');
    const sendFn = main.slice(main.indexOf('async function sendPendingShareCard'), main.indexOf('function noteDailyGoal'));
    expect(sendFn).not.toContain('rememberLogPhoto');
    const photos = fs.readFileSync('src/logPhotos.ts', 'utf8');
    expect(photos).toContain('LOG_PHOTOS_MAX_DAYS');
    expect(photos).toContain('compressShareCard');
    const ui = fs.readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain('log-snap');
    expect(ui).toContain('has-photo');
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['log.snapSaved']).toBeTruthy();
    }
    expect(tables()['zh-HK']['log.snapSaved']).toContain('成長日誌');
  });
});

describe('log photo prune', () => {
  it('keeps only the newest MAX_DAYS entries', () => {
    const map: Record<string, string> = {};
    for (let i = 1; i <= LOG_PHOTOS_MAX_DAYS + 5; i++) {
      map[`2026-01-${String(i).padStart(2, '0')}`] = 'data:image/jpeg;base64,xx';
    }
    pruneLogPhotos(map);
    expect(Object.keys(map).length).toBe(LOG_PHOTOS_MAX_DAYS);
    expect(map['2026-01-01']).toBeUndefined();
    expect(map[`2026-01-${String(LOG_PHOTOS_MAX_DAYS + 5).padStart(2, '0')}`]).toBeTruthy();
  });
});

describe('share-card daily goal', () => {
  it('tracks consecutive share-preview days for the goal title', () => {
    const g = createGame('2026-10-10');
    expect(shareStreakOf(g, '2026-10-10')).toBe(0);
    expect(bumpShareStreak(g, '2026-10-10')).toBe(1);
    expect(bumpShareStreak(g, '2026-10-10')).toBe(1);
    expect(bumpShareStreak(g, '2026-10-11')).toBe(2);
    expect(bumpShareStreak(g, '2026-10-13')).toBe(1);
    expect(goalLabel('share', g, '2026-10-13')).toContain('1');
  });
  it('replaces weather-overview with 分享樹卡, noted at preview', () => {
    expect(doableGoals({ pest: false, cold: false, seed: 'x' })).toContain('share');
    expect(doableGoals({ pest: false, cold: false, seed: 'x' })).not.toContain('weather');
    expect(tables()['zh-HK']['goals.share']).toContain('已連續打卡');
    expect(tables()['zh-HK']['goals.shareHint']).toContain('巨樹');
    expect(tables()['zh-HK']['goals.weather']).toBeUndefined();
    expect(tables()['en']['goals.share']).toContain('{n}');
    const main = fs.readFileSync('src/main.ts', 'utf8');
    const shareFn = main.slice(main.indexOf('async function shareTreeCard'), main.indexOf('async function sendPendingShareCard'));
    expect(shareFn).toContain("noteDailyGoal('share')");
    expect(shareFn).toContain('bumpShareStreak');
    expect(main).not.toMatch(/noteDailyGoal\('weather'\)/);
    expect(parseGoals({ date: '2026-10-10', ids: ['weather', 'feed'], noted: ['weather'], claimed: false })).toEqual({
      date: '2026-10-10',
      ids: ['share', 'feed'],
      noted: ['share'],
      claimed: false,
    });
  });
});

describe('post-tour tip', () => {
  it('is one-time for new players after the welcome tour, not for existing saves', () => {
    const fresh = freshCoach();
    expect(fresh.postTip).toBe(false);
    expect(markPostTip(fresh).postTip).toBe(true);
    // Missing postTip field → existing player, never show.
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => { store.set(k, v); },
      removeItem: (k) => { store.delete(k); },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;
    store.set('sekai-tree-coach', JSON.stringify({ armed: true, water: true, feed: true, health: true, carbon: true, done: true, tour: true }));
    expect(loadCoach().postTip).toBe(true);
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('queuePostTourTip');
    expect(main).toContain('post-tip-done');
    expect(main).toContain('postTourTipModal');
    expect(fs.readFileSync('src/ui.ts', 'utf8')).toContain('postTourTipModal');
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['postTip.title']).toBeTruthy();
      expect(tables()[loc]['postTip.shareTitle']).toBeTruthy();
    }
    expect(tables()['zh-HK']['postTip.shareTitle']).toContain('強烈建議');
    void markTour;
  });
});

describe('growth clip (timelapse)', () => {
  it('is available without 巨樹 once started; generate needs ≥1 saved card', () => {
    expect(TIMELAPSE_MIN_FRAMES).toBe(1);
    expect(timelapseUnlocked({ started: true, over: null })).toBe(true);
    expect(timelapseUnlocked({ started: false, over: null })).toBe(false);
    expect(timelapseReady({ started: true, over: null })).toBe(false); // no photos yet
    const tl = fs.readFileSync('src/timelapse.ts', 'utf8');
    expect(tl).toContain('recordTimelapseWebm');
    expect(tl).toContain('buildTimelapseStrip');
    expect(tl).not.toContain('isGiant');
    const ui = fs.readFileSync('src/ui.ts', 'utf8');
    expect(ui).toContain('timelapseCardHtml');
    expect(ui).toContain('timelapseSettingsRow');
    expect(ui).toContain('timelapse.settingsRow');
    expect(fs.readFileSync('src/main.ts', 'utf8')).toContain('timelapse-make');
    expect(fs.readFileSync('src/main.ts', 'utf8')).toContain("settingsModal(state.treeName, isNative() ? notifyEnabled() : null, '', state)");
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['timelapse.settingsRow']).toBeTruthy();
      expect(tables()[loc]['timelapse.generate']).toBeTruthy();
    }
    expect(tables()['zh-HK']['timelapse.settingsRow']).toBe('小樹成長片段');
  });
});
