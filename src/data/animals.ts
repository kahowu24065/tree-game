import { t as tl, live } from '../i18n';

/**
 * 圖鑑動物：香港／亞洲常見或有代表性嘅雀鳥、哺乳類、昆蟲、爬蟲同兩棲類。
 * Unlocks depend on tree height, health, real-world month, today's weather and storms survived.
 */
export type AnimalCategory = 'bird' | 'mammal' | 'insect' | 'butterfly' | 'reptile' | 'amphibian';

/** How the animal moves in the 3D scene. */
export type Motion =
  | 'perch' // sits on the canopy, sometimes flies a loop
  | 'flock' // flies around the tree as a group, lands together now and then
  | 'soar' // circles high above
  | 'hover' // darts near the canopy (sunbird, bee, dragonfly)
  | 'flutter' // butterflies and moths
  | 'walk' // quadrupeds wandering the island
  | 'hop' // ground birds and frogs
  | 'wade' // waders by the stream
  | 'climb' // up and down the trunk
  | 'crawl' // slow on trunk / leaves / ground
  | 'glow' // fireflies at night
  | 'bat' // night flyers
  | 'nest' // magpie robin at its nest
  | 'hollow'; // owl in the trunk hollow

export type LookKind =
  | 'bird'
  | 'owl'
  | 'quad'
  | 'monkey'
  | 'squirrel'
  | 'bat'
  | 'butterfly'
  | 'dragonfly'
  | 'bee'
  | 'beetle'
  | 'cicada'
  | 'mantis'
  | 'stick'
  | 'firefly'
  | 'lizard'
  | 'snake'
  | 'turtle'
  | 'frog';

/** Procedural look: colours and a few shape flags. */
export interface Look {
  kind: LookKind;
  /** Colours, meaning depends on kind (see animals3d.ts). */
  c: string[];
  size?: number;
  f?: string[];
}

export type WeatherNeed = 'hot' | 'rain' | 'storm';

export interface AnimalDef {
  id: string;
  name: string;
  category: AnimalCategory;
  motion: Motion;
  /** Group size range when it shows up. */
  group: [number, number];
  epithet: string;
  about: string;
  minM: number;
  minHealth: number;
  /** Storms survived. */
  needStorms?: number;
  /** Today's weather must include this. */
  weather?: WeatherNeed;
  /** Real calendar months (1-12) it can first be found. */
  months?: number[];
  /** v14: minimum tree age in nights (replaces the old 6-month / 1-year season gates: 90 / 182). */
  minAgeDays?: number;
  /** Only out at night. */
  night?: boolean;
  /** Where crawlers/climbers sit. */
  spot?: 'trunk' | 'leaf' | 'ground';
  look: Look;
  /** Real size in metres: `len` = total length (beak/nose to tail tip); `span` = wingspan for birds, bats and insects. */
  real: RealSize;
}

export interface RealSize {
  len: number;
  span?: number;
}

const SPRING_SUMMER = [3, 4, 5, 6, 7, 8, 9];
const SUMMER = [5, 6, 7, 8, 9];
const WINTER = [10, 11, 12, 1, 2, 3, 4];

export const ANIMALS: AnimalDef[] = live(() => ([
  /* ---------- 雀鳥 ---------- */
  { id: 'whiteeye', name: tl('animals.001'), category: 'bird', motion: 'flock', group: [4, 7], epithet: tl('animals.002'), about: tl('animals.003'), minM: 1.2, minHealth: 50, real: { len: 0.11, span: 0.17 }, look: { kind: 'bird', c: ['#9fbf3a', '#e9edc8', '#a8c640', '#3a3a3a', '#86a830', '#ffffff'], size: 0.75, f: ['eyering'] } },
  { id: 'sparrow', name: tl('animals.004'), category: 'bird', motion: 'flock', group: [3, 6], epithet: tl('animals.005'), about: tl('animals.006'), minM: 0.8, minHealth: 48, real: { len: 0.14, span: 0.22 }, look: { kind: 'bird', c: ['#9b6b43', '#e9dcc4', '#7a4b2a', '#3b3b3b', '#6d4a2f', '#f4efe6'], size: 0.85, f: ['cheek'] } },
  { id: 'tailorbird', name: tl('animals.007'), category: 'bird', motion: 'perch', group: [1, 2], epithet: tl('animals.008'), about: tl('animals.009'), minM: 1, minHealth: 50, real: { len: 0.12, span: 0.15 }, look: { kind: 'bird', c: ['#8fae5a', '#f1eee0', '#c8743a', '#4a4a4a', '#7c9a4c'], size: 0.7, f: ['cap', 'cocked'] } },
  { id: 'wagtail', name: tl('animals.010'), category: 'bird', motion: 'hop', group: [1, 2], epithet: tl('animals.011'), about: tl('animals.012'), minM: 1.2, minHealth: 50, real: { len: 0.19, span: 0.3 }, look: { kind: 'bird', c: ['#4a4a4a', '#ffffff', '#ffffff', '#222222', '#3a3a3a', '#111111'], size: 0.85, f: ['longTail', 'mask'] } },
  { id: 'munia', name: tl('animals.013'), category: 'bird', motion: 'flock', group: [4, 8], epithet: tl('animals.014'), about: tl('animals.015'), minM: 2, minHealth: 55, real: { len: 0.11, span: 0.16 }, look: { kind: 'bird', c: ['#6b4a32', '#f2eadc', '#3b2a1e', '#8a8a92', '#5a3d28'], size: 0.7, f: ['thickBeak'] } },
  { id: 'myna', name: tl('animals.016'), category: 'bird', motion: 'hop', group: [2, 3], epithet: tl('animals.017'), about: tl('animals.018'), minM: 2.5, minHealth: 55, real: { len: 0.26, span: 0.45 }, look: { kind: 'bird', c: ['#1f1f22', '#2a2a2e', '#1a1a1c', '#f0c040', '#1f1f22', '#ffffff'], size: 1, f: ['crest', 'wingpatch'] } },
  { id: 'bulbul', name: tl('animals.019'), category: 'bird', motion: 'perch', group: [1, 2], epithet: tl('animals.020'), about: tl('animals.021'), minM: 3.5, minHealth: 58, real: { len: 0.19, span: 0.28 }, look: { kind: 'bird', c: ['#8a9468', '#eeeadb', '#262626', '#2b2b2b', '#6f7a52', '#ffffff'], size: 0.9, f: ['crest'] } },
  { id: 'egret', name: tl('animals.022'), category: 'bird', motion: 'wade', group: [1, 3], epithet: tl('animals.023'), about: tl('animals.024'), minM: 3, minHealth: 55, weather: 'rain', real: { len: 0.6, span: 0.95 }, look: { kind: 'bird', c: ['#fbfbf6', '#ffffff', '#fbfbf6', '#222222', '#f2f2ec'], size: 1.5, f: ['longLegs', 'longNeck', 'longBeak'] } },
  { id: 'magpierobin', name: tl('animals.025'), category: 'bird', motion: 'nest', group: [1, 1], epithet: tl('animals.026'), about: tl('animals.027'), minM: 4, minHealth: 62, real: { len: 0.2, span: 0.28 }, look: { kind: 'bird', c: ['#1f1f22', '#f4f4f4', '#1f1f22', '#1f1f1f', '#f4f4f4'], size: 0.95, f: ['cocked'] } },
  { id: 'sunbird', name: tl('animals.028'), category: 'bird', motion: 'hover', group: [1, 2], epithet: tl('animals.029'), about: tl('animals.030'), minM: 4, minHealth: 60, real: { len: 0.1, span: 0.13 }, look: { kind: 'bird', c: ['#4a6a3a', '#f0d84a', '#2a8a7a', '#222222', '#3f5f32', '#c8322a'], size: 0.6, f: ['longBeak', 'longTail'] } },
  { id: 'redbulbul', name: tl('animals.031'), category: 'bird', motion: 'perch', group: [1, 3], epithet: tl('animals.032'), about: tl('animals.033'), minM: 5, minHealth: 60, real: { len: 0.2, span: 0.28 }, look: { kind: 'bird', c: ['#7b6450', '#f1ebe0', '#222222', '#2b2b2b', '#6a5442', '#d9362b'], size: 0.9, f: ['crest', 'cheek'] } },
  { id: 'coucal', name: tl('animals.034'), category: 'bird', motion: 'hop', group: [1, 1], epithet: tl('animals.035'), about: tl('animals.036'), minM: 5, minHealth: 60, real: { len: 0.52, span: 0.6 }, look: { kind: 'bird', c: ['#1f1f24', '#1f1f24', '#1f1f24', '#222222', '#9a4a22'], size: 1.5, f: ['longTail', 'redEye'] } },
  { id: 'swallow', name: tl('animals.037'), category: 'bird', motion: 'flock', group: [4, 8], epithet: tl('animals.038'), about: tl('animals.039'), minM: 5, minHealth: 55, months: SPRING_SUMMER, real: { len: 0.18, span: 0.33 }, look: { kind: 'bird', c: ['#1d2a5a', '#f2ece2', '#1d2a5a', '#222222', '#1a244c', '#b8402a'], size: 0.8, f: ['forkTail'] } },
  { id: 'starling', name: tl('animals.040'), category: 'bird', motion: 'flock', group: [2, 4], epithet: tl('animals.041'), about: tl('animals.042'), minM: 6, minHealth: 58, real: { len: 0.28, span: 0.45 }, look: { kind: 'bird', c: ['#3a3a3a', '#f2f2ee', '#f6f6f2', '#222222', '#2a2a2a', '#111111'], size: 1.1, f: ['collar'] } },
  { id: 'nightheron', name: tl('animals.043'), category: 'bird', motion: 'wade', group: [1, 2], epithet: tl('animals.044'), about: tl('animals.045'), minM: 6, minHealth: 58, night: true, real: { len: 0.6, span: 1.1 }, look: { kind: 'bird', c: ['#8a9098', '#f0f0ee', '#223040', '#1a1a1a', '#7c828c'], size: 1.35, f: ['longLegs', 'longBeak', 'redEye'] } },
  { id: 'kingfisher', name: tl('animals.046'), category: 'bird', motion: 'perch', group: [1, 1], epithet: tl('animals.047'), about: tl('animals.048'), minM: 7, minHealth: 70, needStorms: 1, real: { len: 0.16, span: 0.25 }, look: { kind: 'bird', c: ['#1f86c9', '#e8843a', '#1a6fb0', '#1f1f1f', '#2aa3dc', '#f4b07a'], size: 0.85, f: ['longBeak', 'cheek'] } },
  { id: 'hwamei', name: tl('animals.049'), category: 'bird', motion: 'perch', group: [1, 1], epithet: tl('animals.050'), about: tl('animals.051'), minM: 8, minHealth: 60, real: { len: 0.22, span: 0.28 }, look: { kind: 'bird', c: ['#a0703a', '#c89a5a', '#9a6a36', '#e0c050', '#8a5e30', '#ffffff'], size: 1, f: ['eyering', 'longTail'] } },
  { id: 'woodpecker', name: tl('animals.052'), category: 'bird', motion: 'climb', group: [1, 1], epithet: tl('animals.053'), about: tl('animals.054'), minM: 8, minHealth: 62, spot: 'trunk', real: { len: 0.15, span: 0.25 }, look: { kind: 'bird', c: ['#4a4038', '#efe9dc', '#4a4038', '#4a4a4a', '#f2f2f2', '#d8322b'], size: 0.8, f: ['cap', 'longBeak', 'barred'] } },
  { id: 'magpie', name: tl('animals.055'), category: 'bird', motion: 'perch', group: [1, 2], epithet: tl('animals.056'), about: tl('animals.057'), minM: 9, minHealth: 60, real: { len: 0.45, span: 0.6 }, look: { kind: 'bird', c: ['#18181c', '#f6f6f6', '#18181c', '#1a1a1a', '#24344a', '#ffffff'], size: 1.3, f: ['longTail', 'wingpatch'] } },
  { id: 'dove', name: tl('animals.058'), category: 'bird', motion: 'perch', group: [1, 2], epithet: tl('animals.059'), about: tl('animals.060'), minM: 10, minHealth: 64, real: { len: 0.3, span: 0.5 }, look: { kind: 'bird', c: ['#b39a8b', '#d9c7bb', '#9d8a86', '#3b3b3b', '#8e7768', '#2e2e2e'], size: 1.15, f: ['collar'] } },
  { id: 'koel', name: tl('animals.061'), category: 'bird', motion: 'perch', group: [1, 1], epithet: tl('animals.062'), about: tl('animals.063'), minM: 11, minHealth: 62, months: [3, 4, 5, 6, 7, 8], real: { len: 0.42, span: 0.6 }, look: { kind: 'bird', c: ['#15151a', '#15151a', '#15151a', '#b8c09a', '#1a1a22'], size: 1.3, f: ['longTail', 'redEye'] } },
  { id: 'crow', name: tl('animals.064'), category: 'bird', motion: 'perch', group: [1, 2], epithet: tl('animals.065'), about: tl('animals.066'), minM: 12, minHealth: 50, real: { len: 0.55, span: 1.1 }, look: { kind: 'bird', c: ['#141418', '#1a1a20', '#141418', '#1a1a1a', '#1c1c24'], size: 1.5, f: ['thickBeak'] } },
  { id: 'parakeet', name: tl('animals.067'), category: 'bird', motion: 'flock', group: [2, 4], epithet: tl('animals.068'), about: tl('animals.069'), minM: 13, minHealth: 66, real: { len: 0.4, span: 0.45 }, look: { kind: 'bird', c: ['#4ec23a', '#8ad860', '#4ec23a', '#d8302a', '#3aa02c', '#111111'], size: 1.1, f: ['longTail', 'hooked', 'collar'] } },
  { id: 'bluemagpie', name: tl('animals.070'), category: 'bird', motion: 'perch', group: [1, 3], epithet: tl('animals.071'), about: tl('animals.072'), minM: 14, minHealth: 68, real: { len: 0.65, span: 0.55 }, look: { kind: 'bird', c: ['#3c6ab0', '#f2f2f2', '#18181c', '#d8302a', '#3a64a8', '#ffffff'], size: 1.3, f: ['longTail', 'veryLongTail'] } },
  { id: 'owl', name: tl('animals.073'), category: 'bird', motion: 'hollow', group: [1, 1], epithet: tl('animals.074'), about: tl('animals.075'), minM: 15, minHealth: 72, night: true, real: { len: 0.24, span: 0.6 }, look: { kind: 'owl', c: ['#8c7358', '#d8c3a2', '#f2b632'], size: 1 } },
  { id: 'cockatoo', name: tl('animals.076'), category: 'bird', motion: 'flock', group: [2, 5], epithet: tl('animals.077'), about: tl('animals.078'), minM: 18, minHealth: 72, real: { len: 0.33, span: 0.7 }, look: { kind: 'bird', c: ['#fbfbf4', '#f6f2e0', '#fbfbf4', '#2a2a2a', '#f2eee0', '#f6d23a'], size: 1.4, f: ['crest', 'bigCrest', 'hooked'] } },
  { id: 'spoonbill', name: tl('animals.079'), category: 'bird', motion: 'wade', group: [2, 4], epithet: tl('animals.080'), about: tl('animals.081'), minM: 20, minHealth: 70, months: WINTER, real: { len: 0.75, span: 1.15 }, look: { kind: 'bird', c: ['#fbfbf6', '#ffffff', '#fbfbf6', '#1a1a1a', '#f2f2ec'], size: 1.6, f: ['longLegs', 'longNeck', 'spoon'] } },
  { id: 'kite', name: tl('animals.082'), category: 'bird', motion: 'soar', group: [1, 2], epithet: tl('animals.083'), about: tl('animals.084'), minM: 25, minHealth: 60, real: { len: 0.6, span: 1.5 }, look: { kind: 'bird', c: ['#6a4a32', '#8a6a4a', '#7a5a40', '#2a2a2a', '#5a3e2a'], size: 2.2, f: ['hooked', 'forkTail', 'soar'] } },
  { id: 'serpenteagle', name: tl('animals.085'), category: 'bird', motion: 'soar', group: [1, 1], epithet: tl('animals.086'), about: tl('animals.087'), minM: 40, minHealth: 70, minAgeDays: 90, real: { len: 0.7, span: 1.6 }, look: { kind: 'bird', c: ['#4a3a2a', '#c8a878', '#3a2e24', '#e8c040', '#3e3024'], size: 2.6, f: ['hooked', 'soar', 'crest'] } },
  { id: 'seaeagle', name: tl('animals.088'), category: 'bird', motion: 'soar', group: [1, 1], epithet: tl('animals.089'), about: tl('animals.090'), minM: 60, minHealth: 75, minAgeDays: 182, real: { len: 0.8, span: 2 }, look: { kind: 'bird', c: ['#f4f4f0', '#ffffff', '#f4f4f0', '#8a8a92', '#5a5e66'], size: 3, f: ['hooked', 'soar'] } },

  /* ---------- 哺乳類 ---------- */
  { id: 'squirrel', name: tl('animals.091'), category: 'mammal', motion: 'climb', group: [1, 2], epithet: tl('animals.092'), about: tl('animals.093'), minM: 2, minHealth: 55, spot: 'trunk', real: { len: 0.4 }, look: { kind: 'squirrel', c: ['#8e4f2c', '#c4623a', '#7d4526'], size: 1 } },
  { id: 'ferretbadger', name: tl('animals.094'), category: 'mammal', motion: 'walk', group: [1, 2], epithet: tl('animals.095'), about: tl('animals.096'), minM: 6, minHealth: 58, night: true, real: { len: 0.55 }, look: { kind: 'quad', c: ['#6a5a4a', '#d8ccb8', '#f2eee6', '#2a2a2a'], size: 0.6, f: ['mask', 'snout', 'longTail'] } },
  { id: 'porcupine', name: tl('animals.097'), category: 'mammal', motion: 'walk', group: [1, 2], epithet: tl('animals.098'), about: tl('animals.099'), minM: 8, minHealth: 60, night: true, real: { len: 0.75 }, look: { kind: 'quad', c: ['#3a3430', '#3a3430', '#2a2624', '#f2eee6'], size: 0.8, f: ['spines', 'stocky'] } },
  { id: 'fruitbat', name: tl('animals.100'), category: 'mammal', motion: 'bat', group: [3, 6], epithet: tl('animals.101'), about: tl('animals.102'), minM: 9, minHealth: 60, night: true, real: { len: 0.1, span: 0.45 }, look: { kind: 'bat', c: ['#5a4232', '#8a6a4a', '#3a2c22'], size: 1 } },
  { id: 'boar', name: tl('animals.103'), category: 'mammal', motion: 'walk', group: [2, 4], epithet: tl('animals.104'), about: tl('animals.105'), minM: 10, minHealth: 55, real: { len: 1.5 }, look: { kind: 'quad', c: ['#4a3a30', '#5a4a3e', '#3a2e26', '#e8e0d0'], size: 1.3, f: ['snout', 'tusks', 'stocky', 'bristle'] } },
  { id: 'muntjac', name: tl('animals.106'), category: 'mammal', motion: 'walk', group: [1, 2], epithet: tl('animals.107'), about: tl('animals.108'), minM: 12, minHealth: 70, real: { len: 1 }, look: { kind: 'quad', c: ['#b7753f', '#e9d2b0', '#b7753f', '#5b4331'], size: 1.3, f: ['antlers', 'longLegs'] } },
  { id: 'civet', name: tl('animals.109'), category: 'mammal', motion: 'walk', group: [1, 1], epithet: tl('animals.110'), about: tl('animals.111'), minM: 14, minHealth: 66, night: true, real: { len: 1.1 }, look: { kind: 'quad', c: ['#7a6a5a', '#a89a88', '#2a2622', '#f2eee6'], size: 1, f: ['mask', 'longTail', 'blaze'] } },
  { id: 'macaque', name: tl('animals.112'), category: 'mammal', motion: 'walk', group: [3, 6], epithet: tl('animals.113'), about: tl('animals.114'), minM: 16, minHealth: 65, real: { len: 0.75 }, look: { kind: 'monkey', c: ['#a88a62', '#c8aa82', '#e8a898'], size: 1.2 } },
  { id: 'leopardcat', name: tl('animals.115'), category: 'mammal', motion: 'walk', group: [1, 1], epithet: tl('animals.116'), about: tl('animals.117'), minM: 20, minHealth: 72, night: true, real: { len: 0.9 }, look: { kind: 'quad', c: ['#c8a060', '#f0e0c0', '#c8a060', '#2a2218'], size: 0.8, f: ['spots', 'longTail', 'catEars'] } },
  { id: 'cattle', name: tl('animals.118'), category: 'mammal', motion: 'walk', group: [2, 4], epithet: tl('animals.119'), about: tl('animals.120'), minM: 22, minHealth: 62, real: { len: 2.3 }, look: { kind: 'quad', c: ['#b8783a', '#d8a870', '#a86a30', '#e8e0cc'], size: 2.2, f: ['horns', 'stocky', 'longLegs', 'cowTail'] } },
  { id: 'buffalo', name: tl('animals.121'), category: 'mammal', motion: 'walk', group: [2, 3], epithet: tl('animals.122'), about: tl('animals.123'), minM: 30, minHealth: 65, minAgeDays: 90, real: { len: 2.8 }, look: { kind: 'quad', c: ['#3a3634', '#4a4644', '#2e2a28', '#8a8478'], size: 2.5, f: ['bigHorns', 'stocky', 'longLegs', 'cowTail'] } },
  { id: 'smallcivet', name: tl('animals.124'), category: 'mammal', motion: 'walk', group: [1, 1], epithet: tl('animals.125'), about: tl('animals.126'), minM: 35, minHealth: 70, night: true, minAgeDays: 90, real: { len: 0.9 }, look: { kind: 'quad', c: ['#b8a078', '#e0d0b0', '#b8a078', '#2a2622'], size: 0.8, f: ['spots', 'ringTail', 'longTail', 'snout'] } },
  { id: 'pangolin', name: tl('animals.127'), category: 'mammal', motion: 'walk', group: [1, 1], epithet: tl('animals.128'), about: tl('animals.129'), minM: 45, minHealth: 85, night: true, minAgeDays: 90, real: { len: 0.8 }, look: { kind: 'quad', c: ['#8a6a4a', '#b89a78', '#6a4e36', '#5a4432'], size: 0.9, f: ['scales', 'longTail', 'snout', 'short'] } },
  { id: 'otter', name: tl('animals.130'), category: 'mammal', motion: 'walk', group: [1, 2], epithet: tl('animals.131'), about: tl('animals.132'), minM: 70, minHealth: 85, minAgeDays: 182, real: { len: 1.1 }, look: { kind: 'quad', c: ['#5a4232', '#c8b8a0', '#5a4232', '#2a2a2a'], size: 1, f: ['short', 'longTail', 'snout'] } },

  /* ---------- 蝴蝶 ---------- */
  { id: 'butterfly', name: tl('animals.133'), category: 'butterfly', motion: 'flutter', group: [1, 3], epithet: tl('animals.134'), about: tl('animals.135'), minM: 0.15, minHealth: 40, real: { len: 0.025, span: 0.05 }, look: { kind: 'butterfly', c: ['#fbfbf2', '#9ccf6a', '#333333'], size: 0.8 } },
  // 1.4.41: 菜粉蝶's night counterpart — same level, so a first night visit also meets its first animal.
  { id: 'nightmoth', name: tl('animals.nightmoth.name'), category: 'butterfly', motion: 'flutter', group: [1, 3], epithet: tl('animals.nightmoth.epithet'), about: tl('animals.nightmoth.about'), minM: 0.15, minHealth: 40, night: true, real: { len: 0.018, span: 0.038 }, look: { kind: 'butterfly', c: ['#8a7458', '#d8c49a', '#4a3a2a', '#efe6d2'], size: 0.8, f: ['moth'] } },
  { id: 'plaintiger', name: tl('animals.136'), category: 'butterfly', motion: 'flutter', group: [2, 4], epithet: tl('animals.137'), about: tl('animals.138'), minM: 2, minHealth: 50, real: { len: 0.035, span: 0.07 }, look: { kind: 'butterfly', c: ['#f08a2a', '#1a1a1a', '#222222', '#ffffff'], size: 1 } },
  { id: 'bluebottle', name: tl('animals.139'), category: 'butterfly', motion: 'flutter', group: [1, 2], epithet: tl('animals.140'), about: tl('animals.141'), minM: 4, minHealth: 55, real: { len: 0.035, span: 0.08 }, look: { kind: 'butterfly', c: ['#1a1a1e', '#3ac0d8', '#222222'], size: 1.05, f: ['tails'] } },
  { id: 'birdwing', name: tl('animals.142'), category: 'butterfly', motion: 'flutter', group: [1, 1], epithet: tl('animals.143'), about: tl('animals.144'), minM: 18, minHealth: 75, months: SPRING_SUMMER, real: { len: 0.06, span: 0.15 }, look: { kind: 'butterfly', c: ['#141414', '#f2c81a', '#1a1a1a'], size: 1.7 } },
  { id: 'atlasmoth', name: tl('animals.145'), category: 'butterfly', motion: 'flutter', group: [1, 1], epithet: tl('animals.146'), about: tl('animals.147'), minM: 28, minHealth: 72, night: true, minAgeDays: 90, real: { len: 0.08, span: 0.25 }, look: { kind: 'butterfly', c: ['#a8502a', '#f2dcb0', '#6a3a22', '#ffffff'], size: 2, f: ['moth'] } },

  /* ---------- 昆蟲 ---------- */
  { id: 'ladybug', name: tl('animals.148'), category: 'insect', motion: 'crawl', group: [1, 2], epithet: tl('animals.149'), about: tl('animals.150'), minM: 0.3, minHealth: 45, spot: 'leaf', real: { len: 0.007 }, look: { kind: 'beetle', c: ['#d8322b', '#1a1a1a'], size: 0.7, f: ['dots'] } },
  { id: 'dragonfly', name: tl('animals.151'), category: 'insect', motion: 'hover', group: [2, 4], epithet: tl('animals.152'), about: tl('animals.153'), minM: 1, minHealth: 45, weather: 'rain', real: { len: 0.045, span: 0.07 }, look: { kind: 'dragonfly', c: ['#d8402a', '#e8f0f0'], size: 0.9 } },
  { id: 'honeybee', name: tl('animals.154'), category: 'insect', motion: 'hover', group: [3, 6], epithet: tl('animals.155'), about: tl('animals.156'), minM: 3, minHealth: 60, real: { len: 0.012, span: 0.02 }, look: { kind: 'bee', c: ['#e0a830', '#2a2218', '#e8f0f4'], size: 0.55 } },
  { id: 'mantis', name: tl('animals.157'), category: 'insect', motion: 'crawl', group: [1, 1], epithet: tl('animals.158'), about: tl('animals.159'), minM: 5, minHealth: 55, spot: 'leaf', real: { len: 0.08 }, look: { kind: 'mantis', c: ['#7ac04a', '#5a9a3a'], size: 0.9 } },
  { id: 'cicada', name: tl('animals.160'), category: 'insect', motion: 'crawl', group: [1, 2], epithet: tl('animals.161'), about: tl('animals.162'), minM: 6, minHealth: 55, weather: 'hot', spot: 'trunk', real: { len: 0.05, span: 0.12 }, look: { kind: 'cicada', c: ['#4d5a3a', '#dfeee6', '#394530'], size: 0.8 } },
  { id: 'stickinsect', name: tl('animals.163'), category: 'insect', motion: 'crawl', group: [1, 1], epithet: tl('animals.164'), about: tl('animals.165'), minM: 9, minHealth: 58, spot: 'leaf', real: { len: 0.12 }, look: { kind: 'stick', c: ['#8a7a4a', '#6a5a36'], size: 1 } },
  { id: 'rhinobeetle', name: tl('animals.166'), category: 'insect', motion: 'crawl', group: [1, 1], epithet: tl('animals.167'), about: tl('animals.168'), minM: 12, minHealth: 62, months: SUMMER, night: true, spot: 'trunk', real: { len: 0.06 }, look: { kind: 'beetle', c: ['#3a2218', '#1a120e'], size: 0.9, f: ['horn'] } },
  { id: 'firefly', name: tl('animals.169'), category: 'insect', motion: 'glow', group: [1, 1], epithet: tl('animals.170'), about: tl('animals.171'), minM: 15, minHealth: 80, night: true, real: { len: 0.012, span: 0.02 }, look: { kind: 'firefly', c: ['#3b3325', '#f6ff9a'], size: 0.6 } },

  /* ---------- 爬蟲類 ---------- */
  { id: 'lizard', name: tl('animals.172'), category: 'reptile', motion: 'crawl', group: [1, 1], epithet: tl('animals.173'), about: tl('animals.174'), minM: 1.5, minHealth: 50, weather: 'hot', spot: 'trunk', real: { len: 0.35 }, look: { kind: 'lizard', c: ['#9a8a5a', '#c84a2a', '#6a5e3e'], size: 1 } },
  { id: 'gecko', name: tl('animals.175'), category: 'reptile', motion: 'crawl', group: [1, 2], epithet: tl('animals.176'), about: tl('animals.177'), minM: 7, minHealth: 55, night: true, spot: 'trunk', real: { len: 0.12 }, look: { kind: 'lizard', c: ['#c8b89a', '#e8dcc8', '#a89878'], size: 0.7, f: ['gecko'] } },
  { id: 'pitviper', name: tl('animals.178'), category: 'reptile', motion: 'crawl', group: [1, 1], epithet: tl('animals.179'), about: tl('animals.180'), minM: 11, minHealth: 62, spot: 'leaf', real: { len: 0.7 }, look: { kind: 'snake', c: ['#5ac03a', '#d8402a', '#f0e070'], size: 0.8 } },
  { id: 'python', name: tl('animals.181'), category: 'reptile', motion: 'crawl', group: [1, 1], epithet: tl('animals.182'), about: tl('animals.183'), minM: 38, minHealth: 75, minAgeDays: 90, spot: 'ground', real: { len: 3.5 }, look: { kind: 'snake', c: ['#a8905a', '#5a4430', '#d8c898'], size: 2.2, f: ['blotch'] } },
  { id: 'turtle', name: tl('animals.184'), category: 'reptile', motion: 'crawl', group: [1, 1], epithet: tl('animals.185'), about: tl('animals.186'), minM: 50, minHealth: 80, minAgeDays: 182, spot: 'ground', real: { len: 0.2 }, look: { kind: 'turtle', c: ['#6a4a2a', '#1a1a1a', '#e8c040'], size: 1 } },

  /* ---------- 兩棲類 ---------- */
  { id: 'toad', name: tl('animals.187'), category: 'amphibian', motion: 'hop', group: [1, 3], epithet: tl('animals.188'), about: tl('animals.189'), minM: 2, minHealth: 52, weather: 'rain', real: { len: 0.08 }, look: { kind: 'frog', c: ['#8a6a42', '#c8a878', '#2a2018'], size: 0.8, f: ['warty'] } },
  { id: 'newt', name: tl('animals.190'), category: 'amphibian', motion: 'crawl', group: [1, 2], epithet: tl('animals.191'), about: tl('animals.192'), minM: 3, minHealth: 58, weather: 'rain', spot: 'ground', real: { len: 0.13 }, look: { kind: 'lizard', c: ['#3a2e28', '#e8702a', '#2a221e'], size: 0.8, f: ['newt'] } },
  { id: 'treefrog', name: tl('animals.193'), category: 'amphibian', motion: 'hop', group: [1, 3], epithet: tl('animals.194'), about: tl('animals.195'), minM: 5, minHealth: 60, weather: 'rain', night: true, real: { len: 0.02 }, look: { kind: 'frog', c: ['#a8905a', '#d8c898', '#5a4a30'], size: 0.5 } },
  /* 1.4.64 more non-birds for young trees (reuse existing looks). */
  { id: 'damselfly', name: tl('animals.damselfly.name'), category: 'insect', motion: 'hover', group: [2, 4], epithet: tl('animals.damselfly.epithet'), about: tl('animals.damselfly.about'), minM: 0.4, minHealth: 42, real: { len: 0.035, span: 0.045 }, look: { kind: 'dragonfly', c: ['#3a8ab0', '#d8f0f8'], size: 0.7 } },
  { id: 'grasshopper', name: tl('animals.grasshopper.name'), category: 'insect', motion: 'crawl', group: [1, 3], epithet: tl('animals.grasshopper.epithet'), about: tl('animals.grasshopper.about'), minM: 0.5, minHealth: 45, spot: 'leaf', real: { len: 0.04 }, look: { kind: 'mantis', c: ['#8ab84a', '#5a8a30'], size: 0.65 } },
  { id: 'bullfrog', name: tl('animals.bullfrog.name'), category: 'amphibian', motion: 'hop', group: [1, 2], epithet: tl('animals.bullfrog.epithet'), about: tl('animals.bullfrog.about'), minM: 1.2, minHealth: 50, weather: 'rain', real: { len: 0.15 }, look: { kind: 'frog', c: ['#3a5a32', '#8aaa5a', '#1a2018'], size: 1.1, f: ['warty'] } },
]));

/**
 * 1.4.41: is this animal out (shown in the scene) at this time of day? Day animals by day, `night` ones (and fireflies)
 * at night; the owl in its hollow and the robin at its nest are there either way. The 圖鑑 only unlocks what is out.
 */
export function outAt(def: Pick<AnimalDef, 'night' | 'motion'>, night: boolean): boolean {
  if (def.motion === 'hollow' || def.motion === 'nest') return true;
  return night ? Boolean(def.night) || def.motion === 'glow' : !def.night;
}

export function animalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id);
}

export const CATEGORY_LABEL: Record<AnimalCategory, string> = live(() => ({
  bird: tl('main.032'),
  mammal: tl('animals.196'),
  butterfly: tl('animals.197'),
  insect: tl('animals.198'),
  reptile: tl('animals.199'),
  amphibian: tl('animals.200'),
}));

export const CATEGORY_ORDER: AnimalCategory[] = ['bird', 'mammal', 'butterfly', 'insect', 'reptile', 'amphibian'];

const MONTH_TEXT = (months: number[]): string => {
  const set = new Set(months);
  if ([10, 11, 12, 1, 2].every((m) => set.has(m))) return tl('animals.201');
  if ([5, 6, 7, 8].every((m) => set.has(m)) && !set.has(12)) return set.has(3) ? tl('animals.202') : tl('animals.203');
  return tl('animals.204', { p0: Math.min(...months), p1: Math.max(...months) });
};


/** Human-readable unlock conditions, e.g. 「12 米・健康 70・雨天」. */
export function unlockHint(a: AnimalDef): string {
  const parts = [a.minM >= 1 ? tl('animals.205', { minM: a.minM }) : tl('ui.308', { p0: Math.round(a.minM * 100) }), tl('animals.206', { minHealth: a.minHealth })];
  if (a.weather === 'hot') parts.push(tl('animals.207'));
  if (a.weather === 'rain') parts.push(tl('animals.208'));
  if (a.needStorms) parts.push(tl('animals.209', { needStorms: a.needStorms }));
  if (a.months) parts.push(MONTH_TEXT(a.months));
  if (a.minAgeDays) parts.push(tl('animals.212', { p0: a.minAgeDays === 182 ? tl('balance.029') : a.minAgeDays === 90 ? tl('animals.210') : tl('animals.211', { minAgeDays: a.minAgeDays }) }));
  if (a.night) parts.push(tl('animals.213'));
  return parts.join('・');
}
