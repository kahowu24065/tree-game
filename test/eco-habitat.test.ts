import { describe, expect, it } from 'vitest';
import { ANIMALS, animalById } from '../src/data/animals';
import { allowedAt, groupSize, sizeClass, stageCap, STAGE_CAPS } from '../src/data/eco';
import { habitatDef, habitatFeatures, HABITATS, ISLAND_RADII, islandRadius } from '../src/data/habitat';
import { SPECIES } from '../src/data/species';
import { mulberry32 } from '../src/util';

describe('per-stage animal caps', () => {
  it('grows monotonically from one small group to many', () => {
    expect(STAGE_CAPS).toHaveLength(5);
    expect(stageCap(0).groups).toBe(1);
    expect(stageCap(4).groups).toBeGreaterThanOrEqual(6);
    for (let s = 1; s < 5; s++) {
      expect(stageCap(s).groups).toBeGreaterThanOrEqual(stageCap(s - 1).groups);
      expect(stageCap(s).members).toBeGreaterThan(stageCap(s - 1).members);
      expect(stageCap(s).maxSize).toBeGreaterThanOrEqual(stageCap(s - 1).maxSize);
      expect(stageCap(s).flock).toBeGreaterThanOrEqual(stageCap(s - 1).flock);
    }
  });

  it('clamps out-of-range stages', () => {
    expect(stageCap(-2)).toBe(STAGE_CAPS[0]);
    expect(stageCap(9)).toBe(STAGE_CAPS[4]);
  });

  it('lets every animal appear on a giant tree', () => {
    for (const a of ANIMALS) expect(allowedAt(a, 4), a.id).toBe(true);
  });

  it('holds the big animals back until later stages', () => {
    for (const id of ['cattle', 'buffalo']) {
      const a = animalById(id)!;
      expect(allowedAt(a, 3), id).toBe(false);
      expect(allowedAt(a, 4), id).toBe(true);
    }
    const macaque = animalById('macaque')!;
    expect(allowedAt(macaque, 2)).toBe(false);
    expect(allowedAt(macaque, 3)).toBe(true);
    const seaeagle = animalById('seaeagle');
    if (seaeagle) expect(allowedAt(seaeagle, 2)).toBe(false);
  });

  it('only lets tiny species visit a seedling', () => {
    const seedlingOk = ANIMALS.filter((a) => allowedAt(a, 0));
    expect(seedlingOk.length).toBeGreaterThan(3);
    for (const a of seedlingOk) expect(sizeClass(a), a.id).toBe(0);
    expect(seedlingOk.some((a) => a.category === 'butterfly')).toBe(true);
  });

  it('keeps group sizes within the stage cap and flocks bigger later', () => {
    const rand = mulberry32(42);
    for (let s = 0; s < 5; s++) {
      for (const a of ANIMALS) {
        for (let i = 0; i < 6; i++) {
          const n = groupSize(a, s, rand);
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(stageCap(s).members);
        }
      }
    }
    const whiteeye = animalById('whiteeye')!;
    const max = (s: number) => Math.max(...Array.from({ length: 60 }, () => groupSize(whiteeye, s, rand)));
    expect(max(4)).toBeGreaterThan(max(1));
    expect(groupSize(animalById('magpierobin')!, 4, rand)).toBe(1);
  });
});

describe('island stages and habitats', () => {
  it('grows the island every stage', () => {
    expect(ISLAND_RADII).toHaveLength(5);
    for (let s = 1; s < 5; s++) expect(ISLAND_RADII[s]!).toBeGreaterThan(ISLAND_RADII[s - 1]!);
    expect(islandRadius(0)).toBe(7);
    expect(islandRadius(99)).toBe(ISLAND_RADII[4]);
  });

  it('has a themed habitat for all nine species', () => {
    expect(HABITATS).toHaveLength(SPECIES.length);
    for (const sp of SPECIES) {
      const h = habitatDef(sp.id);
      expect(h.species).toBe(sp.id);
      expect(h.name.length).toBeGreaterThan(1);
      expect(h.adds).toHaveLength(5);
      expect(habitatFeatures(sp.id, 0)).toEqual([]);
    }
  });

  it('adds scenery cumulatively with each stage', () => {
    for (const sp of SPECIES) {
      let prev: string[] = [];
      for (let s = 1; s < 5; s++) {
        const f = habitatFeatures(sp.id, s);
        expect(f.length, `${sp.id} stage ${s}`).toBeGreaterThan(prev.length);
        for (const x of prev) expect(f).toContain(x);
        prev = f;
      }
    }
  });

  it('maps species to their native landscapes', () => {
    expect(habitatFeatures('deodar', 2)).not.toContain('snowpeaks');
    expect(habitatFeatures('deodar', 3)).toContain('snowpeaks');
    expect(habitatFeatures('metasequoia', 2)).toContain('pond');
    expect(habitatFeatures('metasequoia', 1)).toContain('creek');
    expect(habitatFeatures('eucalyptus', 3)).toContain('waterfall');
    expect(habitatFeatures('ginkgo', 2)).toContain('steps');
    expect(habitatFeatures('redwood', 3)).toContain('fog');
    expect(habitatFeatures('douglas', 2)).toContain('lake');
    expect(habitatFeatures('banyan', 1)).toContain('wall');
    // Mountains / water somewhere in every giant-stage island.
    for (const sp of SPECIES) {
      const f = habitatFeatures(sp.id, 4);
      expect(f.some((x) => ['mountains', 'snowpeaks', 'hills'].includes(x)) || f.includes('village'), sp.id).toBe(true);
      expect(f.some((x) => ['pond', 'lake', 'river', 'creek', 'waterfall', 'coast', 'wetland'].includes(x)), sp.id).toBe(true);
    }
  });
});
