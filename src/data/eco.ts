import type { AnimalDef } from './animals';

/**
 * How much wildlife a tree of each growth stage can hold. A 幼苗 gets one small visitor group;
 * a 巨樹 hosts many groups including the big animals (牛群、蟒蛇、海鵰). Residents come on top.
 */
export interface StageCap {
  /** Visiting groups on screen at once. */
  groups: number;
  /** Total visiting animals on screen. */
  members: number;
  /** Largest body-size class allowed (0 細小 … 3 大型). */
  maxSize: 0 | 1 | 2 | 3;
  /** Multiplier on flock size. */
  flock: number;
}

export const STAGE_CAPS: StageCap[] = [
  { groups: 1, members: 3, maxSize: 0, flock: 0.5 },
  { groups: 2, members: 6, maxSize: 1, flock: 0.7 },
  { groups: 3, members: 12, maxSize: 1, flock: 1 },
  { groups: 5, members: 22, maxSize: 2, flock: 1.2 },
  { groups: 7, members: 36, maxSize: 3, flock: 1.5 },
];

export const SIZE_LABEL = ['細小', '小型', '中型', '大型'] as const;

export function stageCap(stage: number): StageCap {
  return STAGE_CAPS[Math.max(0, Math.min(4, Math.round(stage)))]!;
}

/** Body-size class used to hold bigger animals back until the tree is big enough. */
export function sizeClass(a: AnimalDef): 0 | 1 | 2 | 3 {
  const size = a.look.size ?? 1;
  switch (a.category) {
    case 'insect':
    case 'amphibian':
      return 0;
    case 'butterfly':
      return size >= 1.5 ? 1 : 0;
    case 'reptile':
      if (a.look.kind === 'snake' && size >= 2) return 3;
      return a.look.kind === 'lizard' ? 0 : 1;
    case 'bird':
      if (a.look.kind === 'owl') return 2;
      if (a.motion === 'soar') return size >= 2.5 ? 3 : 2;
      if (size <= 0.85) return 0;
      return size <= 1.2 ? 1 : 2;
    case 'mammal':
      if (a.look.kind === 'squirrel' || a.look.kind === 'bat') return 1;
      if (size >= 2) return 3;
      return size < 0.9 ? 1 : 2;
  }
}

export function allowedAt(a: AnimalDef, stage: number): boolean {
  return sizeClass(a) <= stageCap(stage).maxSize;
}

/** Group size for a visit at this stage (flocks grow with the tree). */
export function groupSize(a: AnimalDef, stage: number, rand: () => number): number {
  if (a.motion === 'nest' || a.motion === 'hollow' || a.motion === 'glow') return 1;
  const cap = stageCap(stage);
  const [lo, hi0] = a.group;
  const hi = Math.max(lo, Math.round(hi0 * (hi0 >= 3 ? cap.flock : 1)));
  const n = lo + Math.floor(rand() * (hi - lo + 1));
  return Math.max(1, Math.min(n, cap.members));
}
