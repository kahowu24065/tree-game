import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ANIMALS } from '../src/data/animals';
import { ISLAND_RADII } from '../src/data/habitat';
import { bookMilestones, freshMeta } from '../src/meta';
import {
  ANIMAL_FACTOR_MAX,
  animalFactor,
  drawnLength,
  FENCE_INSET_UNITS,
  FENCE_V6_UNITS,
  fenceHeightUnits,
  FLIGHT_ABOVE_TREE_M,
  flightCeiling,
  islandScaleFor,
  METRES_PER_UNIT,
  minShoreRadius,
  modelScaleFor,
  shoreRadius,
  unitsForCm,
} from '../src/scale';
import * as scale from '../src/scale';
import { createGame, performAction, settleDay } from '../src/sim';
import { buildFence } from '../src/three/island3d';
import { buildTree } from '../src/three/tree3d';
import { stageIndex } from '../src/content';
import { speciesTargetCm, type SpeciesId } from '../src/data/species';
import { railHtml } from '../src/ui';

const NOW = Date.UTC(2026, 8, 25, 4);

describe('v8 比例：v6 樹形比例，樹頂 = 遊戲高度 G', () => {
  it('1 單位 = 1 米', () => {
    expect(METRES_PER_UNIT).toBe(1);
    expect(unitsForCm(2000)).toBe(20);
    expect(modelScaleFor(8, 2000)).toBeCloseTo(2.5);
  });

  const cases: [SpeciesId, number][] = [
    ['camphor', 18], ['camphor', 500], ['camphor', 2000], ['metasequoia', 5000], ['eucalyptus', 3000],
    ['redwood', 10000], ['redwood', 12000], ['redwood', 15000], ['deodar', 20000], ['douglas', 25000],
  ];
  it.each(cases)('%s @ %d 厘米：渲染最高點 = G，島同樹用同一個比例', (species, cm) => {
    const target = speciesTargetCm(species);
    const b = buildTree({ species, stage: stageIndex(cm, target), heightCm: cm, health: 90, pests: 0, scars: 0, seed: 11 });
    b.group.updateMatrixWorld(true);
    const top = new THREE.Box3().setFromObject(b.group).max.y;
    expect(top).toBeCloseTo(cm / 100, 3);
    expect(b.height).toBeCloseTo(cm / 100, 3);
    // The island is scaled by the very same factor as the tree, so tree : island is the v6 proportion.
    expect(islandScaleFor(b.metricScale)).toBeCloseTo(b.metricScale, 9);
    expect(b.height / (ISLAND_RADII[0] * islandScaleFor(b.metricScale))).toBeCloseTo(b.localHeight / ISLAND_RADII[0], 6);
    for (const p of b.perches) expect(p.pos.y).toBeLessThanOrEqual(cm / 100 + 1e-6);
    b.dispose();
  });

  it('樹形同 v6 一樣（v6 樟樹：20 米畫 8.98 單位、100 米畫 16.8 單位）', () => {
    const at = (cm: number) => {
      const b = buildTree({ species: 'camphor', stage: 4, heightCm: cm, health: 90, pests: 0, scars: 0, seed: 11 });
      const h = b.localHeight;
      b.dispose();
      return h;
    };
    expect(at(2000)).toBeGreaterThan(8);
    expect(at(2000)).toBeLessThan(10);
    expect(at(10000)).toBeGreaterThan(15);
    expect(at(10000)).toBeLessThan(18.5);
  });
});

describe('冇高度上限', () => {
  it('過咗紀錄高度都照同一條公式長高（v14：最低 0.0002R × 係數）', () => {
    const s = createGame('2026-01-01', { species: 'banyan' });
    s.started = true;
    const target = speciesTargetCm('banyan');
    Object.assign(s, { health: 95, moisture: 60, nutrients: 80, heightCm: target - 10 });
    const d = (i: number) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    let last = s.heightCm;
    for (let i = 60; i < 200; i++) {
      Object.assign(s, { moisture: 60, nutrients: 80 });
      settleDay(s, d(i), ['clear'], null, NOW);
      expect(s.over).toBeNull();
      expect(s.heightCm).toBeGreaterThan(last);
      last = s.heightCm;
    }
    // Past R the base is the floor 0.0002 × 3000 = 0.6 cm, × 1.5 (健康 95) = 0.9 cm a night.
    expect(s.heightCm).toBeGreaterThan(target + 100);
    expect(s.passedTargetOn).toBeTruthy();
    expect(s.milestones.record).toBeTruthy();
    s.care.date = d(200);
    expect(performAction(s, 'fertilize', { raining: false }).ok).toBe(true);
  });

  it('樹齡 3個月里程碑（連一級能力徽章）只入收藏一次', () => {
    const meta = freshMeta();
    const s = createGame('2026-01-01');
    Object.assign(s, { moisture: 60, nutrients: 90, ageDays: 89 });
    settleDay(s, '2026-03-31', ['clear'], null, NOW);
    expect(bookMilestones(meta, s).length).toBe(1);
    expect(bookMilestones(meta, s)).toEqual([]);
    expect(meta.badges['1']).toBe(1);
    expect(meta.milestones.map((m) => m.id)).toEqual(['m30', 'm90']);
  });

  it('高度尺超越紀錄高度後延長刻度（紅杉紀錄 120 米），顯示 % 紀錄高度', () => {
    const s = createGame('2026-01-01', { species: 'redwood' });
    s.heightCm = 13000;
    const html = railHtml(s);
    expect(html).toContain('超越紀錄');
    expect(html).toContain('紀錄 108%');
    expect(html).toContain('rail-target');
    expect(html).toContain('130.0 米');
    const top = Number(/<b>([\d.]+) 米<\/b><small>冇上限/.exec(html)?.[1]);
    expect(top).toBeGreaterThan(130);
  });
});

describe('飛行上限 = 樹高 + 5 米（冇 80 米上限）', () => {
  it('ceiling', () => {
    expect(FLIGHT_ABOVE_TREE_M).toBe(5);
    expect('FLIGHT_MAX_M' in scale).toBe(false);
    expect(flightCeiling(0.3)).toBeCloseTo(5.3);
    expect(flightCeiling(20)).toBe(25);
    expect(flightCeiling(80)).toBe(85);
    expect(flightCeiling(120)).toBe(125);
    expect(flightCeiling(250)).toBe(255);
  });
});

describe('動物：一個共用放大系數，真實比例', () => {
  it('系數只睇樹高：細樹 1 倍，慢慢升，最多 3 倍', () => {
    expect(animalFactor(0.2)).toBe(1);
    expect(animalFactor(8)).toBe(1);
    let prev = 1;
    for (const m of [10, 20, 50, 100, 120, 300]) {
      const f = animalFactor(m);
      expect(f).toBeGreaterThanOrEqual(prev);
      expect(f).toBeLessThanOrEqual(ANIMAL_FACTOR_MAX);
      prev = f;
    }
    expect(animalFactor(20)).toBeCloseTo(1.44, 1);
    expect(animalFactor(100)).toBeCloseTo(2.75, 1);
  });

  it('同一棵樹旁邊，所有動物嘅畫出長度 ÷ 真實長度都一樣（水牛 >> 獼猴 >> 松鼠 >> 麻雀）', () => {
    const len = (id: string) => ANIMALS.find((a) => a.id === id)!.real.len;
    for (const treeM of [0.5, 5, 20, 50, 120]) {
      const d = (id: string) => drawnLength(len(id), treeM);
      expect(d('buffalo') / d('macaque')).toBeCloseTo(len('buffalo') / len('macaque'), 9);
      expect(d('macaque') / d('squirrel')).toBeCloseTo(len('macaque') / len('squirrel'), 9);
      expect(d('squirrel') / d('sparrow')).toBeCloseTo(len('squirrel') / len('sparrow'), 9);
      expect(d('buffalo')).toBeGreaterThan(d('macaque'));
      expect(d('macaque')).toBeGreaterThan(d('squirrel'));
      expect(d('squirrel')).toBeGreaterThan(d('sparrow'));
      // Never absurd next to the tree: the buffalo (only on trees ≥ 30 m) stays under ~1/7 of the tree.
      if (treeM >= 30) expect(d('buffalo')).toBeLessThan(treeM * 0.15);
    }
  });

  it('每隻動物都有真實長度（米），飛行類有翼展', () => {
    for (const a of ANIMALS) {
      expect(a.real.len, a.id).toBeGreaterThan(0.001);
      expect(a.real.len, a.id).toBeLessThan(5);
      if (a.category === 'butterfly' || a.motion === 'bat' || a.motion === 'soar') expect(a.real.span, a.id).toBeGreaterThan(0);
    }
  });
});

describe('圍欄貼住島嘅真實邊緣', () => {
  it.each([0, 1, 2, 3, 4])('階段 %d：每條柱都喺 shoreRadius − 內縮，同島邊形狀一樣', (stage) => {
    const R = ISLAND_RADII[stage]!;
    for (const hU of [0.2, 0.5, FENCE_V6_UNITS]) {
      const f = buildFence({ R, hUnits: hU, groundAt: () => 0, skip: () => false, key: 't' });
      expect(f.posts.length).toBeGreaterThan(20);
      for (const p of f.posts) {
        const a = Math.atan2(p.z, p.x);
        const r = Math.hypot(p.x, p.z);
        expect(r).toBeCloseTo(shoreRadius(R, a) - FENCE_INSET_UNITS, 6);
        expect(r).toBeLessThan(shoreRadius(R, a));
      }
      // Posts about every metre (island units) all the way round, bar the gate.
      expect((2 * Math.PI * R) / f.posts.length).toBeLessThan(1.2);
      f.dispose();
    }
  });

  it('水口／山邊冇柱，欄杆唔會跨過', () => {
    const f = buildFence({ R: 10, hUnits: 0.5, groundAt: () => 0, skip: (x) => x > 8, key: 't' });
    for (const p of f.posts) expect(p.x).toBeLessThanOrEqual(8);
    f.dispose();
  });

  it('圍欄高度：× 動物系數，但唔高過 v6 比例', () => {
    expect(fenceHeightUnits(0.26, 0.18)).toBeCloseTo(FENCE_V6_UNITS);
    expect(fenceHeightUnits(7.5, 120) * 7.5).toBeCloseTo(1.1 * animalFactor(120), 6);
    expect(minShoreRadius(16)).toBeLessThan(16);
  });
});

describe('舊存檔（sekai-tree-v2）轉換到樹種目標', () => {
  it('樟樹 3 個月局：舊目標 20 米 → 50 米，高度照舊，「已突破」重新計', async () => {
    const { migrateTarget } = await import('../src/storage');
    const s = createGame('2026-01-01', { species: 'camphor' });
    (s as { season?: string }).season = 's3';
    s.started = true;
    s.heightCm = 2500;
    s.passedTargetOn = '2026-02-20';
    delete (s as { targetCm?: number }).targetCm;
    migrateTarget(s);
    expect(s.heightCm).toBe(2500);
    expect(s.targetCm).toBe(5000);
    expect(s.passedTargetOn).toBeNull();
    expect(s.log[0]!.text).toContain('50.0 米');
    const n = s.log.length;
    migrateTarget(s);
    expect(s.log.length).toBe(n);
  });

  it('細葉榕：舊目標 20 米 → 30 米；紅杉 100 → 120；已經高過新目標就保留「已突破」', async () => {
    const { migrateTarget } = await import('../src/storage');
    const b = createGame('2026-01-01', { species: 'banyan' });
    (b as { season?: string }).season = 's3';
    b.heightCm = 3500;
    delete (b as { targetCm?: number }).targetCm;
    migrateTarget(b);
    expect(b.targetCm).toBe(3000);
    expect(b.passedTargetOn).toBeTruthy();
    const r = createGame('2026-01-01', { species: 'redwood' });
    (r as { season?: string }).season = 's12';
    delete (r as { targetCm?: number }).targetCm;
    migrateTarget(r);
    expect(r.targetCm).toBe(12000);
  });
});
