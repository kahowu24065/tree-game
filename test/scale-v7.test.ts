import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ANIMALS } from '../src/data/animals';
import { ISLAND_RADII } from '../src/data/habitat';
import { bookSeasonComplete, freshMeta } from '../src/meta';
import { seasonDef } from '../src/rules';
import { FENCE_HEIGHT_M, FLIGHT_MAX_M, fenceRadius, flightCeiling, islandScaleFor, METRES_PER_UNIT, modelScaleFor, unitsForCm } from '../src/scale';
import { createGame, performAction, settleDay } from '../src/sim';
import { buildFence, rimWobble } from '../src/three/island3d';
import { buildTree } from '../src/three/tree3d';
import { stageIndex } from '../src/content';
import { speciesDef, type SpeciesId } from '../src/data/species';
import { railHtml } from '../src/ui';

const NOW = Date.UTC(2026, 8, 25, 4);

describe('米制比例：模型高度 = 遊戲高度 G', () => {
  it('1 單位 = 1 米', () => {
    expect(METRES_PER_UNIT).toBe(1);
    expect(unitsForCm(2000)).toBe(20);
    expect(modelScaleFor(8, 2000)).toBeCloseTo(2.5);
  });

  const cases: [SpeciesId, number][] = [
    ['camphor', 18], ['camphor', 500], ['camphor', 2000], ['metasequoia', 5000], ['eucalyptus', 3000],
    ['redwood', 10000], ['redwood', 12000], ['redwood', 15000], ['deodar', 20000], ['douglas', 25000],
  ];
  it.each(cases)('%s @ %d 厘米：渲染最高點 = G', (species, cm) => {
    const target = seasonDef(speciesDef(species).season).targetCm;
    const b = buildTree({ species, stage: stageIndex(cm, target), heightCm: cm, health: 90, pests: 0, scars: 0, seed: 11 });
    b.group.updateMatrixWorld(true);
    const top = new THREE.Box3().setFromObject(b.group).max.y;
    expect(top).toBeCloseTo(cm / 100, 3);
    expect(b.height).toBeCloseTo(cm / 100, 3);
    // Perches sit on the tree, below its top.
    for (const p of b.perches) expect(p.pos.y).toBeLessThanOrEqual(cm / 100 + 1e-6);
    b.dispose();
  });
});

describe('冇高度上限', () => {
  it('過咗目標同賽季完都照同一條公式長高', () => {
    const s = createGame('2026-01-01', { season: 's3' });
    s.started = true;
    Object.assign(s, { health: 95, moisture: 60, nutrients: 80, heightCm: 1990 });
    const target = seasonDef('s3').targetCm;
    const d = (i: number) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    let last = s.heightCm;
    for (let i = 60; i < 200; i++) {
      Object.assign(s, { moisture: 60, nutrients: 80 });
      settleDay(s, d(i), ['clear'], null, NOW);
      expect(s.over).toBeNull();
      expect(s.heightCm).toBeGreaterThan(last);
      last = s.heightCm;
    }
    expect(s.heightCm).toBeGreaterThan(target * 1.5);
    expect(s.passedTargetOn).toBeTruthy();
    expect(s.completed).toBeTruthy();
    // Care still works after the season.
    s.care.date = d(200);
    expect(performAction(s, 'fertilize', { raining: false }).ok).toBe(true);
  });

  it('賽季完成徽章只發一次', () => {
    const meta = freshMeta();
    const s = createGame('2026-01-01', { season: 's3' });
    Object.assign(s, { moisture: 60, nutrients: 90 });
    settleDay(s, '2026-03-31', ['clear'], null, NOW);
    expect(bookSeasonComplete(meta, s).length).toBe(1);
    expect(bookSeasonComplete(meta, s)).toEqual([]);
    expect(meta.badges['1']).toBe(1);
  });

  it('高度尺突破目標後延長刻度，顯示「已突破目標」', () => {
    const s = createGame('2026-01-01', { season: 's12' });
    s.heightCm = 12000;
    const html = railHtml(s);
    expect(html).toContain('已突破目標');
    expect(html).toContain('rail-target');
    expect(html).toContain('120.0 米');
    const top = Number(/<b>([\d.]+) 米<\/b><small>冇上限/.exec(html)?.[1]);
    expect(top).toBeGreaterThan(120);
  });
});

describe('飛行高度上限 = min(80 米, 樹高)', () => {
  it('ceiling', () => {
    expect(FLIGHT_MAX_M).toBe(80);
    expect(flightCeiling(0.3)).toBe(0.3);
    expect(flightCeiling(20)).toBe(20);
    expect(flightCeiling(80)).toBe(80);
    expect(flightCeiling(150)).toBe(80);
  });
});

describe('圍欄跟島嶼大小', () => {
  const ground = () => 0;
  it.each([0, 1, 2, 3, 4])('階段 %d：圍欄半徑 = 島嶼半徑（連放大）', (stage) => {
    for (const treeM of [1, 20, 120]) {
      const R = ISLAND_RADII[stage]! * islandScaleFor(ISLAND_RADII[stage]!, treeM);
      const f = buildFence(R, ground);
      expect(f.radius).toBeCloseTo(R);
      const posts = f.group.children[0] as THREE.InstancedMesh;
      const m = new THREE.Matrix4();
      const p = new THREE.Vector3();
      let min = Infinity;
      let max = 0;
      for (let i = 0; i < posts.count; i++) {
        posts.getMatrixAt(i, m);
        p.setFromMatrixPosition(m);
        const a = Math.atan2(p.z, p.x);
        const r = Math.hypot(p.x, p.z) / rimWobble(a);
        min = Math.min(min, r);
        max = Math.max(max, r);
      }
      // Every post stands just inside the rim of the current island.
      expect(max).toBeLessThanOrEqual(R);
      expect(min).toBeGreaterThan(fenceRadius(R) - 0.25);
      // Posts stay 1:1 in metres (about 1.1 m) and about every 2 m.
      expect(FENCE_HEIGHT_M).toBeCloseTo(1.1);
      expect((2 * Math.PI * R) / posts.count).toBeLessThan(2.3);
      f.dispose();
    }
  });

  it('島嶼只喺樹高過島直徑先放大', () => {
    expect(islandScaleFor(16, 20)).toBe(1);
    expect(islandScaleFor(16, 120)).toBeCloseTo(120 / 35.2);
  });
});

describe('動物真實尺寸', () => {
  it('每隻動物都有真實長度（米），飛行類有翼展', () => {
    for (const a of ANIMALS) {
      expect(a.real.len, a.id).toBeGreaterThan(0.001);
      expect(a.real.len, a.id).toBeLessThan(5);
      if (a.category === 'butterfly' || a.motion === 'bat' || a.motion === 'soar') expect(a.real.span, a.id).toBeGreaterThan(0);
    }
    const len = (id: string) => ANIMALS.find((a) => a.id === id)!.real.len;
    expect(len('buffalo')).toBeGreaterThan(len('macaque'));
    expect(len('macaque')).toBeGreaterThan(len('squirrel'));
    expect(len('squirrel')).toBeGreaterThan(len('whiteeye'));
  });
});
