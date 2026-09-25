import { describe, expect, it } from 'vitest';
import { bucketScale, propBucket, propDensity, propScaleFor } from '../src/three/propScale';
import { animalFactor } from '../src/scale';
import { HABITATS, habitatFeatures } from '../src/data/habitat';

describe('v10 props at animal scale', () => {
  it('draws props at the shared animal factor, never bigger than the v6 look', () => {
    for (const [treeM, K] of [[2, 0.87], [20, 3], [50, 5.3], [120, 9]] as const) {
      const pk = propScaleFor(treeM, K);
      expect(pk).toBeLessThanOrEqual(1);
      if (pk < 1) expect(pk * K).toBeCloseTo(animalFactor(treeM), 6);
    }
    expect(propScaleFor(0.5, 0.1)).toBe(1);
  });

  it('places more props (not bigger ones) as they shrink, within a cap', () => {
    expect(propDensity(1, 6)).toBe(1);
    expect(propDensity(0.5, 6)).toBeCloseTo(4, 6);
    expect(propDensity(0.2, 6)).toBe(6);
    let last = -1;
    for (const pk of [1, 0.8, 0.6, 0.45, 0.33]) {
      const b = propBucket(pk);
      expect(b).toBeGreaterThanOrEqual(last);
      expect(Math.abs(Math.log(bucketScale(b) / pk))).toBeLessThan(Math.log(1.25) / 2 + 1e-9);
      last = b;
    }
  });
});

describe('v10 more water', () => {
  const WATER = ['pond', 'lake', 'river', 'creek', 'wetland', 'inlet', 'waterfall'];
  it('adds water at every stage of every habitat', () => {
    for (const h of HABITATS) for (let s = 1; s <= 4; s++) expect(h.adds[s]!.some((f) => WATER.includes(f)), `${h.species} stage ${s}`).toBe(true);
  });
  it('gives every giant island a big water body (lake or river)', () => {
    for (const h of HABITATS) expect(habitatFeatures(h.species, 4).some((f) => f === 'lake' || f === 'river'), h.species).toBe(true);
  });
});
