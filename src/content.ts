import type { GameState, LogReward } from './types';
import { clamp, hashString } from './util';

import { STAGE_NAMES, STAGE_SHARES } from './data/species';
export { ANIMALS, animalById, type AnimalDef } from './data/animals';

export interface StageDef {
  id: string;
  name: string;
  index: number;
  minCm: number;
  nextCm: number;
  reach0: number;
  reach1: number;
  depth: number;
  trunk: number;
  roots: boolean;
}

const STAGE_LOOK = [
  { id: 'seedling', reach0: 0.2, reach1: 0.3, depth: 0, trunk: 4, roots: false },
  { id: 'sapling', reach0: 0.34, reach1: 0.46, depth: 3, trunk: 9, roots: false },
  { id: 'young', reach0: 0.48, reach1: 0.58, depth: 4, trunk: 14, roots: false },
  { id: 'mature', reach0: 0.62, reach1: 0.72, depth: 5, trunk: 24, roots: true },
  { id: 'giant', reach0: 0.8, reach1: 0.9, depth: 6, trunk: 40, roots: true },
] as const;

/** Five growth stages (幼苗、小樹、青年樹、成年樹、巨樹), scaled to the season's target height. */
export function stagesFor(targetCm = 2000): StageDef[] {
  return STAGE_LOOK.map((look, i) => ({
    ...look,
    name: STAGE_NAMES[i]!,
    index: i,
    minCm: Math.round(STAGE_SHARES[i]! * targetCm),
    nextCm: Math.round(i < 4 ? STAGE_SHARES[i + 1]! * targetCm : targetCm),
  }));
}

export function stageFor(heightCm: number, targetCm = 2000): StageDef {
  const stages = stagesFor(targetCm);
  let current = stages[0]!;
  for (const stage of stages) if (heightCm >= stage.minCm) current = stage;
  return current;
}

export function stageIndex(heightCm: number, targetCm = 2000): number {
  return stageFor(heightCm, targetCm).index;
}

export function stageProgress(heightCm: number, targetCm = 2000): number {
  const stage = stageFor(heightCm, targetCm);
  const span = stage.nextCm - stage.minCm;
  if (span <= 0) return 1;
  return clamp((heightCm - stage.minCm) / span, 0, 1);
}

export const SHERMAN_M = 83.8;
export const HYPERION_M = 116.2;

export interface Milestone {
  meters: number;
  title: string;
  detail: string;
}

export const MILESTONES: Milestone[] = [
  { meters: 0.5, title: '幼苗站穩', detail: '第一段真葉展開，樹有自己的名字。' },
  { meters: 1.7, title: '高過大多數人', detail: '大約一個成年人的高度。' },
  { meters: 5, title: '街燈左右', detail: '大概是行人路燈柱的高度。' },
  { meters: 12, title: '三層舊唐樓', detail: '舊式唐樓一層大約四米，三層左右這個高度。' },
  { meters: 44, title: '尖沙咀鐘樓', detail: '尖沙咀前九廣鐵路鐘樓高約 44 米。' },
  { meters: SHERMAN_M, title: '將軍樹的高度', detail: '美國巨杉「將軍樹」高 83.8 米。以體積計，牠是世界上最大的樹。' },
  { meters: HYPERION_M, title: '海波龍', detail: '加州紅木「海波龍」是已知最高的樹，2026 年測量約 116.2 米。' },
];

export interface DailyEvent {
  id: string;
  title: string;
  text: string;
  chip?: LogReward;
  apply: (state: GameState) => void;
}

export const EVENTS: DailyEvent[] = [
  {
    id: 'mist',
    chip: { text: '+6 水分', tone: 'blue' },
    title: '晨霧',
    text: '薄霧濕潤咗葉面同泥土。',
    apply: (s) => {
      s.moisture = Math.min(100, s.moisture + 6);
    },
  },
  {
    id: 'compost',
    chip: { text: '+16 養分', tone: 'green' },
    title: '鄰居的堆肥',
    text: '樓下街坊分咗一袋堆肥畀你。',
    apply: (s) => {
      s.nutrients = Math.min(100, s.nutrients + 16);
    },
  },
  {
    id: 'birds',
    chip: { text: '+2 健康度', tone: 'green' },
    title: '鳥仔來探',
    text: '有小鳥停低又飛走，樹頂多咗幾分生氣。',
    apply: (s) => {
      s.health = Math.min(100, s.health + 2);
    },
  },
  {
    id: 'drywind',
    chip: { text: '-10 水分', tone: 'red' },
    title: '乾風',
    text: '風有啲乾，泥土會快啲渴。',
    apply: (s) => {
      s.moisture = Math.max(0, s.moisture - 10);
    },
  },
  {
    id: 'leaves',
    chip: { text: '+8 養分', tone: 'green' },
    title: '落葉',
    text: '舊葉落返泥度，慢慢變養分。',
    apply: (s) => {
      s.nutrients = Math.min(100, s.nutrients + 8);
    },
  },
  {
    id: 'drawing',
    chip: { text: '+3 健康度', tone: 'green' },
    title: '小朋友的畫',
    text: '有孩童在樹下留低一張畫，棵樹好像被好好對待。',
    apply: (s) => {
      s.health = Math.min(100, s.health + 3);
    },
  },
  {
    id: 'aphids',
    chip: { text: '留意蟲害', tone: 'red' },
    title: '蚜蟲',
    text: '葉底見到幾隻蚜蟲。養分唔夠或者泥土太濕，好易生蟲，可以除一除預防。',
    apply: (s) => {
      if (!s.pest.active) s.pest.lowNDays = Math.max(s.pest.lowNDays, 1);
    },
  },
  {
    id: 'sunbeam',
    chip: { text: '生長 ×1.15', tone: 'blue' },
    title: '陽光正好',
    text: '雲隙透出柔和陽光，今日會長得順一點。',
    apply: (s) => {
      s.eventBonus = 1.15;
    },
  },
  {
    id: 'cat',
    title: '花貓經過',
    text: '一隻花貓在樹蔭攤咗一陣，冇搞破壞。',
    apply: () => {},
  },
  {
    id: 'quiet',
    title: '安靜的一日',
    text: '冇特別事，樹就係咁慢慢大。',
    apply: () => {},
  },
];

export function eventForDate(date: string): DailyEvent {
  const idx = hashString(date) % EVENTS.length;
  return EVENTS[idx] ?? EVENTS[0]!;
}

export function eventById(id: string): DailyEvent {
  return EVENTS.find((e) => e.id === id) ?? EVENTS[9]!;
}
