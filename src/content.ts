import type { GameState, LogReward } from './types';
import { clamp, hashString } from './util';

export interface StageDef {
  id: string;
  name: string;
  minCm: number;
  nextCm: number;
  reach0: number;
  reach1: number;
  depth: number;
  trunk: number;
  growthMul: number;
  roots: boolean;
}

export const STAGES: StageDef[] = [
  { id: 'seedling', name: '幼苗', minCm: 0, nextCm: 50, reach0: 0.2, reach1: 0.3, depth: 0, trunk: 4, growthMul: 6, roots: false },
  { id: 'sapling', name: '小樹', minCm: 50, nextCm: 200, reach0: 0.34, reach1: 0.46, depth: 3, trunk: 9, growthMul: 8, roots: false },
  { id: 'young', name: '年輕樹', minCm: 200, nextCm: 800, reach0: 0.48, reach1: 0.58, depth: 4, trunk: 14, growthMul: 11, roots: false },
  { id: 'mature', name: '成樹', minCm: 800, nextCm: 2000, reach0: 0.6, reach1: 0.68, depth: 5, trunk: 22, growthMul: 12, roots: true },
  { id: 'ancient', name: '古樹', minCm: 2000, nextCm: 5000, reach0: 0.7, reach1: 0.78, depth: 6, trunk: 32, growthMul: 10, roots: true },
  { id: 'giant', name: '巨樹', minCm: 5000, nextCm: 11620, reach0: 0.8, reach1: 0.9, depth: 6, trunk: 46, growthMul: 8, roots: true },
];

export function stageFor(heightCm: number): StageDef {
  let current = STAGES[0] as StageDef;
  for (const stage of STAGES) {
    if (heightCm >= stage.minCm) current = stage;
  }
  return current;
}

export function stageIndex(heightCm: number): number {
  return Math.max(0, STAGES.findIndex((s) => s.id === stageFor(heightCm).id));
}

export function stageProgress(heightCm: number): number {
  const stage = stageFor(heightCm);
  const span = stage.nextCm - stage.minCm;
  if (span <= 0) return 1;
  return clamp((heightCm - stage.minCm) / span, 0, 1);
}

export interface AnimalDef {
  id: string;
  name: string;
  epithet: string;
  minM: number;
  minHealth: number;
  needStorms?: number;
  needHeat?: boolean;
  hint: string;
  about: string;
}

export const ANIMALS: AnimalDef[] = [
  { id: 'butterfly', name: '菜粉蝶', epithet: '白翼點綠', minM: 0.15, minHealth: 40, hint: '幼苗健康就會來', about: '園圃常見的白蝴蝶，喜歡停在新葉上。' },
  { id: 'ladybug', name: '七星瓢蟲', epithet: '葉上紅點', minM: 0.3, minHealth: 45, hint: '高過 30 厘米', about: '紅殼黑點，會幫樹食蚜蟲。' },
  { id: 'sparrow', name: '麻雀', epithet: '簷前熟客', minM: 0.8, minHealth: 48, hint: '小樹、健康過得去', about: '香港全年都見得到，吱吱喳喳。' },
  { id: 'squirrel', name: '赤腹松鼠', epithet: '赤腹一閃', minM: 2, minHealth: 55, hint: '兩米高、健康 55', about: '郊野同公園都有，尾巴比身體還靈活。' },
  { id: 'bulbul', name: '白頭鵯', epithet: '白頭高歌', minM: 3.5, minHealth: 58, hint: '年輕樹', about: '頭頂一撮白，是窗臺同公園的熟客。' },
  { id: 'magpierobin', name: '鵲鴝', epithet: '巢裡幾顆蛋', minM: 4, minHealth: 62, hint: '四米高、健康 62', about: '黑白分明的小鳥，喺樹杈築巢，巢入面有幾顆淺藍色的蛋。' },
  { id: 'redbulbul', name: '紅耳鵯', epithet: '紅頰俏鳥', minM: 5, minHealth: 60, hint: '五米高', about: '頰上有紅斑，叫聲清亮。' },
  { id: 'cicada', name: '蟬', epithet: '盛夏長鳴', minM: 6, minHealth: 55, needHeat: true, hint: '酷熱日子、六米高', about: '要碰上酷熱的日子，牠才肯露面。' },
  { id: 'kingfisher', name: '普通翠鳥', epithet: '藍電一掠', minM: 7, minHealth: 70, needStorms: 1, hint: '捱過一場風暴', about: '風暴之後天色放晴，藍影會停在枝上。' },
  { id: 'woodpecker', name: '啄木鳥', epithet: '敲敲樹幹', minM: 8, minHealth: 62, hint: '成樹', about: '樹幹夠粗之後，偶爾會來敲一敲找蟲。' },
  { id: 'dove', name: '珠頸斑鳩', epithet: '咕咕低鳴', minM: 10, minHealth: 64, hint: '十米高', about: '頸上像一串珍珠，步步安穩。' },
  { id: 'muntjac', name: '赤麂', epithet: '樹下吠鹿', minM: 12, minHealth: 70, hint: '十二米、健康 70', about: '香港郊野的細小鹿，受驚會好似狗吠咁叫，最鍾意喺樹蔭下休息。' },
  { id: 'owl', name: '領角鴞', epithet: '夜裡的眼睛', minM: 15, minHealth: 72, hint: '十五米、健康 72', about: '香港常見的小型貓頭鷹，黃昏後最活躍。' },
  { id: 'firefly', name: '螢火蟲', epithet: '一點溫光', minM: 22, minHealth: 82, hint: '二十二米、健康 82', about: '樹夠大、夠健康，夜裡就有微光。' },
];

export function animalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id);
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
    chip: { text: '-8 害蟲', tone: 'green' },
    title: '晨霧',
    text: '薄霧濕潤咗葉面，害蟲少咗少少。',
    apply: (s) => {
      s.pests = Math.max(0, s.pests - 8);
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
    chip: { text: '+16 害蟲', tone: 'red' },
    title: '蚜蟲',
    text: '葉底多咗一群蚜蟲，今日適合除蟲。',
    apply: (s) => {
      s.pests = Math.min(100, s.pests + 16);
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
