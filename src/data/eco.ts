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

/**
 * Same number of species (groups) per stage as v6–v8 (the variety cap), but more individuals:
 * v9 raises the member caps a little again so small birds and insects can come as real flocks.
 */
export const STAGE_CAPS: StageCap[] = [
  { groups: 1, members: 6, maxSize: 0, flock: 0.8 },
  { groups: 2, members: 12, maxSize: 1, flock: 1.1 },
  { groups: 3, members: 24, maxSize: 1, flock: 1.5 },
  { groups: 5, members: 40, maxSize: 2, flock: 1.9 },
  { groups: 7, members: 60, maxSize: 3, flock: 2.3 },
];

/**
 * Small birds and flying insects that come in flocks / swarms (v9): picked more often when a new group
 * arrives, in bigger groups, and they move as one so the flock reads from far away.
 */
export function flocky(a: AnimalDef): boolean {
  if (a.category === 'bird') return a.real.len <= 0.3 && (a.motion === 'flock' || a.motion === 'perch' || a.motion === 'hover');
  if (a.category === 'insect' || a.category === 'butterfly') return a.motion === 'flutter' || a.motion === 'hover';
  return false;
}

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
  const [lo0, hi0] = a.group;
  let lo = lo0;
  let hi = Math.max(lo, Math.round(hi0 * (hi0 >= 3 ? cap.flock : 1)));
  let limit = cap.members;
  if (flocky(a)) {
    // Flocks / swarms: bigger groups (at least a pair once the tree is a 小樹), but one flock never takes more
    // than ~40 % of the stage's animals so the variety cap still leaves room for other species.
    const mult = hi0 >= 3 ? cap.flock * 1.35 : 1 + (cap.flock - 0.8) * 0.8;
    hi = Math.max(lo, Math.round(hi0 * mult));
    if (stage >= 1) lo = Math.min(hi, Math.max(lo, 2));
    limit = cap.groups <= 1 ? cap.members : Math.max(2, Math.round(cap.members * 0.4));
  }
  const n = lo + Math.floor(rand() * (hi - lo + 1));
  return Math.max(1, Math.min(n, limit, cap.members));
}
