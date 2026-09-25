import { describe, expect, it } from 'vitest';
import { animalIcon, arrivalText } from '../src/animalHud';
import { ANIMALS, animalById } from '../src/data/animals';
import { flocky, groupSize, stageCap } from '../src/data/eco';

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const arr = (id: string, count: number, uid = 1) => {
  const a = animalById(id)!;
  return { uid, id, name: a.name, count, motion: a.motion, category: a.category };
};

describe('v9 arrival toast text', () => {
  it('describes one group by size and how it moves', () => {
    expect(arrivalText([arr('whiteeye', 6)])).toBe('一群暗綠繡眼鳥飛咗嚟');
    expect(arrivalText([arr('macaque', 2)])).toBe('兩隻獼猴行咗嚟');
    expect(arrivalText([arr('pitviper', 1)])).toBe('一隻竹葉青爬咗出嚟');
  });
  it('merges several arrivals into one line', () => {
    expect(arrivalText([arr('sparrow', 4, 1), arr('butterfly', 2, 2)])).toBe('麻雀同菜粉蝶嚟咗');
    expect(arrivalText([arr('sparrow', 4, 1), arr('butterfly', 2, 2), arr('boar', 2, 3), arr('honeybee', 5, 4)])).toBe('麻雀、菜粉蝶、野豬等 4 群動物嚟咗');
  });
  it('has an icon for every animal', () => {
    for (const a of ANIMALS) expect(animalIcon(a.category, a.look.kind).length).toBeGreaterThan(0);
  });
});

describe('v9 flocks', () => {
  it('marks small birds and flying insects as flocky, not big animals', () => {
    expect(flocky(animalById('whiteeye')!)).toBe(true);
    expect(flocky(animalById('honeybee')!)).toBe(true);
    expect(flocky(animalById('butterfly')!)).toBe(true);
    expect(flocky(animalById('kite')!)).toBe(false);
    expect(flocky(animalById('buffalo')!)).toBe(false);
    expect(flocky(animalById('ladybug')!)).toBe(false);
  });
  it('flocks are bigger but one flock never takes over the stage cap', () => {
    const rand = mulberry32(7);
    for (let s = 0; s < 5; s++) {
      const cap = stageCap(s);
      for (const a of ANIMALS.filter(flocky)) {
        for (let i = 0; i < 20; i++) {
          const n = groupSize(a, s, rand);
          expect(n).toBeLessThanOrEqual(cap.groups <= 1 ? cap.members : Math.max(2, Math.round(cap.members * 0.4)));
          if (s >= 1 && a.group[1] >= 2) expect(n).toBeGreaterThanOrEqual(2);
        }
      }
    }
    const avg = (id: string, s: number) => Array.from({ length: 200 }, () => groupSize(animalById(id)!, s, rand)).reduce((x, y) => x + y, 0) / 200;
    expect(avg('butterfly', 4)).toBeGreaterThan(3);
    expect(avg('whiteeye', 4)).toBeGreaterThan(10);
  });
});
