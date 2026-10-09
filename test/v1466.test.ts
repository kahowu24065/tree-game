// 1.4.66: campfire clear ring, share card 「今日小事」, vignette props, lighter settings sheet.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { campfireSpot } from '../src/campfire';
import { EVENTS } from '../src/content';
import { tables } from '../src/i18n';
import { cardLines } from '../src/shareCard';
import { vignettePropKind } from '../src/three/vignetteProp3d';

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
