// 1.4.55: 高度單位 (厘米／米 default, 英寸／英尺 option), no 公尺／公分 in any Chinese table, backup modal buttons, heading.
import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { convertLengths, formatLength, getHeightUnit, LOCALES, switchLocale, t, tables, useHeightUnit } from '../src/i18n';
import { formatHeight } from '../src/util';
import { backupModal, settingsModal } from '../src/ui';

afterEach(() => {
  useHeightUnit('metric');
  switchLocale('zh-HK');
});

describe('1.4.55 units in the tables', () => {
  it('no Chinese locale writes 公尺 or 公分', () => {
    for (const l of ['zh-HK', 'zh-TW', 'zh-CN'] as const) {
      const bad = Object.entries(tables()[l]).filter(([, v]) => /公尺|公分/.test(v));
      expect(bad.map(([k]) => k), l).toEqual([]);
    }
  });
  it('unit setting strings exist in all 4 languages', () => {
    for (const l of LOCALES) for (const k of ['ui.heightUnit', 'unit.metric', 'unit.imperial']) expect(tables()[l][k], `${l} ${k}`).toBeTruthy();
    expect(tables()['zh-HK']['unit.metric']).toBe('厘米／米');
    expect(tables()['zh-HK']['unit.imperial']).toBe('英寸／英尺');
    expect(tables().en['unit.imperial']).toBe('in / ft');
  });
});

describe('1.4.55 metric (default)', () => {
  it('cm below 1 m, m from 1 m', () => {
    expect(getHeightUnit()).toBe('metric');
    switchLocale('zh-HK');
    expect(formatHeight(45)).toBe('45 厘米');
    expect(formatHeight(123)).toBe('1.2 米');
    switchLocale('zh-TW');
    expect(formatHeight(4520)).toBe('45.2 米');
    switchLocale('en');
    expect(formatHeight(45)).toBe('45 cm');
    expect(formatHeight(250)).toBe('2.5 m');
  });
  it('a centimetre figure of 100 or more is shown in metres; rain 毫米 / km untouched', () => {
    expect(convertLengths('高度 +150 厘米', 'metric', 'zh-HK')).toBe('高度 +1.5 米');
    expect(convertLengths('雨量 120 毫米', 'metric', 'zh-HK')).toBe('雨量 120 毫米');
    expect(convertLengths('rain 12 mm, gusts 80 km/h', 'imperial', 'en')).toBe('rain 12 mm, gusts 80 km/h');
    expect(convertLengths('雨 30 毫米', 'imperial', 'zh-HK')).toBe('雨 30 毫米');
  });
});

describe('1.4.55 imperial', () => {
  it('formatLength: inches below 1 ft, feet + inches, whole feet from 100 ft', () => {
    expect(formatLength(0.8, 'imperial', 'en')).toBe('0.3 in');
    expect(formatLength(15, 'imperial', 'en')).toBe('5.9 in');
    expect(formatLength(160, 'imperial', 'en')).toBe('5 ft 3 in');
    expect(formatLength(182.88, 'imperial', 'en')).toBe('6 ft');
    expect(formatLength(11620, 'imperial', 'en')).toBe('381 ft');
    expect(formatLength(160, 'imperial', 'zh-HK')).toBe('5 英尺 3 英寸');
    expect(formatLength(160, 'imperial', 'zh-TW')).toBe('5 英呎 3 英吋');
    expect(formatLength(160, 'imperial', 'zh-CN')).toBe('5 英尺 3 英寸');
  });
  it('every height text follows the switch at once (HUD formatter, templates, facts, ranges)', () => {
    useHeightUnit('imperial');
    switchLocale('zh-HK');
    expect(formatHeight(160)).toBe('5 英尺 3 英寸');
    expect(formatHeight(45)).toBe('1 英尺 6 英寸');
    expect(t('sim.088', { extra: '0.8' })).toBe('+0.3 英寸');
    expect(t('guide.039')).toContain('2–3.9 英寸');
    expect(t('species.061')).toContain('381 英尺');
    expect(t('species.052')).toContain('131–164 英尺');
    switchLocale('en');
    expect(formatHeight(160)).toBe('5 ft 3 in');
    expect(t('content.010')).toContain('144 ft');
    // 1.4.58: a rule stated in exact metres (word joiner) converts exactly too (10 m → 32.8 ft).
    expect(t('ui.287', { cards: '' })).toContain('32.8 ft');
    useHeightUnit('metric');
    switchLocale('en');
    expect(formatHeight(160)).toBe('1.6 m');
  });
  it('settings has the 高度單位 picker with the current choice selected', () => {
    switchLocale('zh-HK');
    const html = settingsModal('樹');
    expect(html).toContain('data-unit-select');
    expect(html).toContain('高度單位');
    expect(html).toMatch(/<option value="metric" selected>厘米／米<\/option>/);
    useHeightUnit('imperial');
    expect(settingsModal('樹')).toMatch(/<option value="imperial" selected>英寸／英尺<\/option>/);
  });
  it('main.ts applies the unit in place (rebuild tables, re-render) and persists it', () => {
    const src = fs.readFileSync('src/main.ts', 'utf8');
    expect(src).toMatch(/function applyHeightUnit[\s\S]*saveHeightUnit\(u\)[\s\S]*useHeightUnit\(u\)[\s\S]*switchLocale\(getLocale\(\)\)[\s\S]*render\(\)/);
  });
});

describe('1.4.55 backup modals and 成就 heading', () => {
  it('backup modal: primary over an evenly split row of two', () => {
    const html = backupModal('ios');
    expect(html).toMatch(/btn-stack[\s\S]*export-save-code[\s\S]*btn-row[\s\S]*import-save[\s\S]*close-modal/);
  });
  it('save code + restore modals use the spaced button groups in all 4 languages', () => {
    for (const l of LOCALES) {
      const tb = tables()[l];
      expect(tb['ui.361'], l).toMatch(/btn-stack[\s\S]*btn-row[\s\S]*copy-save[\s\S]*\{p2\}[\s\S]*<\/div>[\s\S]*primary/);
      expect(tb['ui.360'], l).toContain('class="ghost"');
      expect(tb['ui.362'], l).toMatch(/btn-stack[\s\S]*do-import-save[\s\S]*ghost/);
      expect(tb['ui.361'], l).not.toContain('class="seg"');
    }
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toMatch(/\.btn-row \{[^}]*gap: 12px/);
    expect(css).toMatch(/\.btn-stack \{[^}]*gap: 16px/);
    expect(css).toMatch(/\.btn-stack \.ghost \{[^}]*min-height: 44px/);
  });
  it('成就 tab heading reads 天氣成就收藏', () => {
    expect(tables()['zh-HK']['ui.324']).toContain('>天氣成就收藏</h3>');
    expect(tables()['zh-TW']['ui.324']).toContain('>天氣成就收藏</h3>');
    expect(tables()['zh-CN']['ui.324']).toContain('>天气成就收藏</h3>');
    expect(tables().en['ui.324']).toContain('>Weather achievement collection</h3>');
  });
});

import { albumFigure } from '../src/three/animals3d';
import { chickTapLine, freshNest } from '../src/nest';
import type * as THREE from 'three';

describe('1.4.55 nest chick', () => {
  it('reads as a baby bird: head with eyes, tuft and beak, two wings, an opening lower beak — all under the chick part', () => {
    const fig = albumFigure('magpierobin')!;
    let chick: THREE.Object3D | undefined;
    fig.traverse((o) => {
      if (o.name === 'chick') chick = o;
    });
    expect(chick).toBeTruthy();
    expect(chick!.visible).toBe(false);
    for (const n of ['chickHead', 'chickBeak', 'chickWingP', 'chickWingN']) expect(chick!.getObjectByName(n), n).toBeTruthy();
    expect(chick!.getObjectByName('chickHead')!.getObjectByName('chickBeak')).toBeTruthy();
  });
  it('tap line names the hatched bird and says what happens at midnight', () => {
    switchLocale('zh-HK');
    const nest = freshNest();
    expect(chickTapLine(nest)).toBeNull();
    nest.egg = { bird: 'sparrow', laidAt: 0, hatchedAt: null };
    expect(chickTapLine(nest)).toBeNull();
    nest.egg.hatchedAt = 1;
    nest.hatched = 0; // next count 1 = a decoration night: the chick leads the reveal flight to the island
    expect(chickTapLine(nest)).toMatch(/^.+嘅雛鳥，今晚 12 點會飛去島上$/);
    nest.hatched = 3; // count 4: nothing to reveal, it just leaves the nest
    expect(chickTapLine(nest)).toMatch(/^.+嘅雛鳥，今晚 12 點會離巢$/);
    switchLocale('zh-CN');
    nest.hatched = 9;
    expect(chickTapLine(nest)).toMatch(/的雏鸟，今晚 12 点会飞到岛上$/);
    switchLocale('en');
    expect(chickTapLine(nest)).toMatch(/chick\. It flies to the island at midnight tonight\.$/);
  });
  it('scene taps reach the chick after the egg check; main plays a chirp and shows the line', () => {
    const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toMatch(/pickClutch[\s\S]*pickChick\(this\.raycaster\.ray, tol\)[\s\S]*onChickTap/);
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toMatch(/onChickTap = \(\) => \{\s*playChirp\(\);[\s\S]*chickTapLine\(state\.nest\)/);
  });
});
