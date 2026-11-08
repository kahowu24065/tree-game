// 1.4.78: hybrid overview framing — tree grows on screen (~40%→60%); island floor kept.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import {
  ISLAND_FRAME_FRAC,
  overviewFrame,
  overviewTreeFrac,
  overviewWantDist,
} from '../src/three/camFrame';

describe('1.4.78 hybrid camera framing', () => {
  it('version 1.4.80 / versionCode 87', () => {
    expect(APP_VERSION).toBe('1.4.80');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+87/);
    expect(g).toContain('1.4.80');
  });

  it('treeFrac rises from ~40% to ~60% and never exceeds 60%', () => {
    expect(overviewTreeFrac(0.3)).toBeCloseTo(0.4, 2);
    expect(overviewTreeFrac(0.8)).toBeCloseTo(0.4, 2);
    const mid = overviewTreeFrac(8);
    expect(mid).toBeGreaterThan(0.4);
    expect(mid).toBeLessThan(0.6);
    expect(overviewTreeFrac(35)).toBeCloseTo(0.6, 2);
    expect(overviewTreeFrac(120)).toBeLessThanOrEqual(0.6000001);
  });

  it('taller trees get a closer camDist than classic (tree looks bigger); early matches classic', () => {
    const islandR = 7;
    const KF = 1;
    const canopy = 1.2;
    const early = overviewFrame({ treeM: 0.5, canopyM: canopy, islandK: KF, islandR, islandStage: 0 });
    const tall = overviewFrame({ treeM: 40, canopyM: 8, islandK: KF, islandR: 20, islandStage: 3 });
    // Early: treeFrac≈0.4 → RTreeEff = RTree; island term may win
    expect(early.treeFrac).toBeCloseTo(0.4, 2);
    const RTreeEarly = Math.sqrt((0.5 * 0.55) ** 2 + Math.max(1, canopy) ** 2) * 1.14;
    const RIsleEarly = islandR * ISLAND_FRAME_FRAC[0]!;
    expect(early.R).toBeCloseTo(Math.max(2, RTreeEarly, RIsleEarly), 6);

    // Tall: R smaller than classic full tree sphere → closer camera
    const RTreeTall = Math.sqrt((40 * 0.55) ** 2 + Math.max(1, 8) ** 2) * 1.14;
    expect(tall.treeFrac).toBeCloseTo(0.6, 2);
    expect(tall.R).toBeLessThan(RTreeTall);
    expect(tall.R).toBeGreaterThanOrEqual(20 * ISLAND_FRAME_FRAC[3]!);
  });

  it('wantY drops slightly as treeFrac rises so roots do not bury the ground', () => {
    const small = overviewFrame({ treeM: 1, canopyM: 1, islandK: 1, islandR: 7, islandStage: 0 });
    const big = overviewFrame({ treeM: 40, canopyM: 8, islandK: 1, islandR: 20, islandStage: 3 });
    expect(small.wantY / 1).toBeCloseTo(0.47, 2);
    expect(big.wantY / 40).toBeLessThan(0.47);
    expect(big.wantY / 40).toBeGreaterThanOrEqual(0.419);
  });

  it('overviewWantDist keeps portrait pads', () => {
    const v = Math.PI / 10;
    const h = Math.atan(Math.tan(v) * 0.5);
    const dP = overviewWantDist(10, v, h, true);
    const dL = overviewWantDist(10, v, h, false);
    expect(dP).toBeGreaterThan(dL);
  });

  it('scene3d uses overviewFrame / overviewWantDist (not the old inline R)', () => {
    const scene = readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toContain("from './camFrame'");
    expect(scene).toContain('overviewFrame(');
    expect(scene).toContain('overviewWantDist(');
    expect(scene).toContain('1.4.78');
    expect(scene).not.toMatch(/islandR \* \[0\.2, 0\.28, 0\.32, 0\.36, 0\.38\]/);
  });
});
