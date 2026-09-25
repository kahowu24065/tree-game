import type { SeasonId } from '../balance';

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
  /** Minimum season length (e.g. only in 6-month or 1-year games). */
  season?: SeasonId;
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

export const ANIMALS: AnimalDef[] = [
  /* ---------- 雀鳥 ---------- */
  { id: 'whiteeye', name: '暗綠繡眼鳥', category: 'bird', motion: 'flock', group: [4, 7], epithet: '白眼圈小綠鳥', about: '成群喺樹冠穿梭，好鍾意啄花蜜同細蟲。', minM: 1.2, minHealth: 50, real: { len: 0.11, span: 0.17 }, look: { kind: 'bird', c: ['#9fbf3a', '#e9edc8', '#a8c640', '#3a3a3a', '#86a830', '#ffffff'], size: 0.75, f: ['eyering'] } },
  { id: 'sparrow', name: '麻雀', category: 'bird', motion: 'flock', group: [3, 6], epithet: '簷前熟客', about: '香港全年都見得到，吱吱喳喳成群出現。', minM: 0.8, minHealth: 48, real: { len: 0.14, span: 0.22 }, look: { kind: 'bird', c: ['#9b6b43', '#e9dcc4', '#7a4b2a', '#3b3b3b', '#6d4a2f', '#f4efe6'], size: 0.85, f: ['cheek'] } },
  { id: 'tailorbird', name: '長尾縫葉鶯', category: 'bird', motion: 'perch', group: [1, 2], epithet: '會縫葉嘅小鳥', about: '用蜘蛛絲將葉片縫成袋仔做巢，尾巴成日翹起。', minM: 1, minHealth: 50, real: { len: 0.12, span: 0.15 }, look: { kind: 'bird', c: ['#8fae5a', '#f1eee0', '#c8743a', '#4a4a4a', '#7c9a4c'], size: 0.7, f: ['cap', 'cocked'] } },
  { id: 'wagtail', name: '白鶺鴒', category: 'bird', motion: 'hop', group: [1, 2], epithet: '擺尾碎步', about: '喺地面碎步行，尾巴上下擺個不停。', minM: 1.2, minHealth: 50, real: { len: 0.19, span: 0.3 }, look: { kind: 'bird', c: ['#4a4a4a', '#ffffff', '#ffffff', '#222222', '#3a3a3a', '#111111'], size: 0.85, f: ['longTail', 'mask'] } },
  { id: 'munia', name: '白腰文鳥', category: 'bird', motion: 'flock', group: [4, 8], epithet: '一串串小褐鳥', about: '成群啄草籽，互相依偎企成一排。', minM: 2, minHealth: 55, real: { len: 0.11, span: 0.16 }, look: { kind: 'bird', c: ['#6b4a32', '#f2eadc', '#3b2a1e', '#8a8a92', '#5a3d28'], size: 0.7, f: ['thickBeak'] } },
  { id: 'myna', name: '八哥', category: 'bird', motion: 'hop', group: [2, 3], epithet: '額前一撮毛', about: '全身黑色，額前有撮羽冠，飛起時翼上有白斑。', minM: 2.5, minHealth: 55, real: { len: 0.26, span: 0.45 }, look: { kind: 'bird', c: ['#1f1f22', '#2a2a2e', '#1a1a1c', '#f0c040', '#1f1f22', '#ffffff'], size: 1, f: ['crest', 'wingpatch'] } },
  { id: 'bulbul', name: '白頭鵯', category: 'bird', motion: 'perch', group: [1, 2], epithet: '白頭高歌', about: '頭頂一撮白，是窗臺同公園的熟客。', minM: 3.5, minHealth: 58, real: { len: 0.19, span: 0.28 }, look: { kind: 'bird', c: ['#8a9468', '#eeeadb', '#262626', '#2b2b2b', '#6f7a52', '#ffffff'], size: 0.9, f: ['crest'] } },
  { id: 'egret', name: '小白鷺', category: 'bird', motion: 'wade', group: [1, 3], epithet: '溪邊白衣', about: '雨後喺溪邊慢慢行，黃色腳趾係佢嘅標記。', minM: 3, minHealth: 55, weather: 'rain', real: { len: 0.6, span: 0.95 }, look: { kind: 'bird', c: ['#fbfbf6', '#ffffff', '#fbfbf6', '#222222', '#f2f2ec'], size: 1.5, f: ['longLegs', 'longNeck', 'longBeak'] } },
  { id: 'magpierobin', name: '鵲鴝', category: 'bird', motion: 'nest', group: [1, 1], epithet: '巢裡幾顆蛋', about: '黑白分明的小鳥，喺樹杈築巢，巢入面有幾顆淺藍色的蛋。', minM: 4, minHealth: 62, real: { len: 0.2, span: 0.28 }, look: { kind: 'bird', c: ['#1f1f22', '#f4f4f4', '#1f1f22', '#1f1f1f', '#f4f4f4'], size: 0.95, f: ['cocked'] } },
  { id: 'sunbird', name: '叉尾太陽鳥', category: 'bird', motion: 'hover', group: [1, 2], epithet: '花間小寶石', about: '香港最細小嘅雀鳥之一，可以好似蜂鳥咁懸停吸花蜜。', minM: 4, minHealth: 60, real: { len: 0.1, span: 0.13 }, look: { kind: 'bird', c: ['#4a6a3a', '#f0d84a', '#2a8a7a', '#222222', '#3f5f32', '#c8322a'], size: 0.6, f: ['longBeak', 'longTail'] } },
  { id: 'redbulbul', name: '紅耳鵯', category: 'bird', motion: 'perch', group: [1, 3], epithet: '紅頰俏鳥', about: '頰上有紅斑，頭頂尖尖羽冠，叫聲清亮。', minM: 5, minHealth: 60, real: { len: 0.2, span: 0.28 }, look: { kind: 'bird', c: ['#7b6450', '#f1ebe0', '#222222', '#2b2b2b', '#6a5442', '#d9362b'], size: 0.9, f: ['crest', 'cheek'] } },
  { id: 'coucal', name: '褐翅鴉鵑', category: 'bird', motion: 'hop', group: [1, 1], epithet: '紅翼大黑鳥', about: '俗稱「毛雞」，喺草叢低處行來行去，叫聲「嘟嘟嘟」。', minM: 5, minHealth: 60, real: { len: 0.52, span: 0.6 }, look: { kind: 'bird', c: ['#1f1f24', '#1f1f24', '#1f1f24', '#222222', '#9a4a22'], size: 1.5, f: ['longTail', 'redEye'] } },
  { id: 'swallow', name: '家燕', category: 'bird', motion: 'flock', group: [4, 8], epithet: '剪刀尾', about: '春夏喺天空快速穿梭捉蟲，尾巴分叉似剪刀。', minM: 5, minHealth: 55, months: SPRING_SUMMER, real: { len: 0.18, span: 0.33 }, look: { kind: 'bird', c: ['#1d2a5a', '#f2ece2', '#1d2a5a', '#222222', '#1a244c', '#b8402a'], size: 0.8, f: ['forkTail'] } },
  { id: 'starling', name: '黑領椋鳥', category: 'bird', motion: 'flock', group: [2, 4], epithet: '黑頸圈', about: '成對或者細群出現，頸有一圈黑，眼周黃色。', minM: 6, minHealth: 58, real: { len: 0.28, span: 0.45 }, look: { kind: 'bird', c: ['#3a3a3a', '#f2f2ee', '#f6f6f2', '#222222', '#2a2a2a', '#111111'], size: 1.1, f: ['collar'] } },
  { id: 'nightheron', name: '夜鷺', category: 'bird', motion: 'wade', group: [1, 2], epithet: '夜裡的釣手', about: '日頭縮住頸瞓覺，黃昏先出嚟喺水邊捉魚。', minM: 6, minHealth: 58, night: true, real: { len: 0.6, span: 1.1 }, look: { kind: 'bird', c: ['#8a9098', '#f0f0ee', '#223040', '#1a1a1a', '#7c828c'], size: 1.35, f: ['longLegs', 'longBeak', 'redEye'] } },
  { id: 'kingfisher', name: '普通翠鳥', category: 'bird', motion: 'perch', group: [1, 1], epithet: '藍電一掠', about: '風暴之後天色放晴，藍影會停在枝上。', minM: 7, minHealth: 70, needStorms: 1, real: { len: 0.16, span: 0.25 }, look: { kind: 'bird', c: ['#1f86c9', '#e8843a', '#1a6fb0', '#1f1f1f', '#2aa3dc', '#f4b07a'], size: 0.85, f: ['longBeak', 'cheek'] } },
  { id: 'hwamei', name: '畫眉', category: 'bird', motion: 'perch', group: [1, 1], epithet: '白眉歌手', about: '眼周有條白眉，歌聲婉轉，喺灌叢低處活動。', minM: 8, minHealth: 60, real: { len: 0.22, span: 0.28 }, look: { kind: 'bird', c: ['#a0703a', '#c89a5a', '#9a6a36', '#e0c050', '#8a5e30', '#ffffff'], size: 1, f: ['eyering', 'longTail'] } },
  { id: 'woodpecker', name: '星頭啄木鳥', category: 'bird', motion: 'climb', group: [1, 1], epithet: '敲敲樹幹', about: '細細隻嘅啄木鳥，喺樹幹上一路敲一路搵蟲。', minM: 8, minHealth: 62, spot: 'trunk', real: { len: 0.15, span: 0.25 }, look: { kind: 'bird', c: ['#4a4038', '#efe9dc', '#4a4038', '#4a4a4a', '#f2f2f2', '#d8322b'], size: 0.8, f: ['cap', 'longBeak', 'barred'] } },
  { id: 'magpie', name: '喜鵲', category: 'bird', motion: 'perch', group: [1, 2], epithet: '報喜黑白鵲', about: '黑白分明，長尾有藍綠光澤，喺高樹頂築大巢。', minM: 9, minHealth: 60, real: { len: 0.45, span: 0.6 }, look: { kind: 'bird', c: ['#18181c', '#f6f6f6', '#18181c', '#1a1a1a', '#24344a', '#ffffff'], size: 1.3, f: ['longTail', 'wingpatch'] } },
  { id: 'dove', name: '珠頸斑鳩', category: 'bird', motion: 'perch', group: [1, 2], epithet: '咕咕低鳴', about: '頸上似一串珍珠，步步安穩。', minM: 10, minHealth: 64, real: { len: 0.3, span: 0.5 }, look: { kind: 'bird', c: ['#b39a8b', '#d9c7bb', '#9d8a86', '#3b3b3b', '#8e7768', '#2e2e2e'], size: 1.15, f: ['collar'] } },
  { id: 'koel', name: '噪鵑', category: 'bird', motion: 'perch', group: [1, 1], epithet: '「歸家呀」', about: '春夏清晨叫聲響亮似「歸家呀」，雄鳥全黑紅眼。', minM: 11, minHealth: 62, months: [3, 4, 5, 6, 7, 8], real: { len: 0.42, span: 0.6 }, look: { kind: 'bird', c: ['#15151a', '#15151a', '#15151a', '#b8c09a', '#1a1a22'], size: 1.3, f: ['longTail', 'redEye'] } },
  { id: 'crow', name: '大嘴烏鴉', category: 'bird', motion: 'perch', group: [1, 2], epithet: '聰明黑衣', about: '識得用工具、記得人面，係最聰明嘅雀鳥之一。', minM: 12, minHealth: 50, real: { len: 0.55, span: 1.1 }, look: { kind: 'bird', c: ['#141418', '#1a1a20', '#141418', '#1a1a1a', '#1c1c24'], size: 1.5, f: ['thickBeak'] } },
  { id: 'parakeet', name: '紅領綠鸚鵡', category: 'bird', motion: 'flock', group: [2, 4], epithet: '綠色長尾', about: '由籠鳥逃逸後喺香港市區落地生根，成群吵鬧飛過。', minM: 13, minHealth: 66, real: { len: 0.4, span: 0.45 }, look: { kind: 'bird', c: ['#4ec23a', '#8ad860', '#4ec23a', '#d8302a', '#3aa02c', '#111111'], size: 1.1, f: ['longTail', 'hooked', 'collar'] } },
  { id: 'bluemagpie', name: '紅嘴藍鵲', category: 'bird', motion: 'perch', group: [1, 3], epithet: '長尾藍衣', about: '紅嘴紅腳，尾巴比身長一倍，成群喺樹林中滑翔。', minM: 14, minHealth: 68, real: { len: 0.65, span: 0.55 }, look: { kind: 'bird', c: ['#3c6ab0', '#f2f2f2', '#18181c', '#d8302a', '#3a64a8', '#ffffff'], size: 1.3, f: ['longTail', 'veryLongTail'] } },
  { id: 'owl', name: '領角鴞', category: 'bird', motion: 'hollow', group: [1, 1], epithet: '夜裡的眼睛', about: '香港常見的小型貓頭鷹，黃昏後最活躍。', minM: 15, minHealth: 72, night: true, real: { len: 0.24, span: 0.6 }, look: { kind: 'owl', c: ['#8c7358', '#d8c3a2', '#f2b632'], size: 1 } },
  { id: 'cockatoo', name: '小葵花鳳頭鸚鵡', category: 'bird', motion: 'flock', group: [2, 5], epithet: '黃冠白鸚', about: '極度瀕危，但香港市區有穩定野生群，比原生地仲多。', minM: 18, minHealth: 72, real: { len: 0.33, span: 0.7 }, look: { kind: 'bird', c: ['#fbfbf4', '#f6f2e0', '#fbfbf4', '#2a2a2a', '#f2eee0', '#f6d23a'], size: 1.4, f: ['crest', 'bigCrest', 'hooked'] } },
  { id: 'spoonbill', name: '黑臉琵鷺', category: 'bird', motion: 'wade', group: [2, 4], epithet: '黑臉飯匙嘴', about: '瀕危候鳥，每年秋冬嚟后海灣過冬，嘴似飯匙。', minM: 20, minHealth: 70, months: WINTER, real: { len: 0.75, span: 1.15 }, look: { kind: 'bird', c: ['#fbfbf6', '#ffffff', '#fbfbf6', '#1a1a1a', '#f2f2ec'], size: 1.6, f: ['longLegs', 'longNeck', 'spoon'] } },
  { id: 'kite', name: '黑鳶', category: 'bird', motion: 'soar', group: [1, 2], epithet: '維港上空盤旋', about: '俗稱「麻鷹」，張開翼喺海港上空慢慢盤旋。', minM: 25, minHealth: 60, real: { len: 0.6, span: 1.5 }, look: { kind: 'bird', c: ['#6a4a32', '#8a6a4a', '#7a5a40', '#2a2a2a', '#5a3e2a'], size: 2.2, f: ['hooked', 'forkTail', 'soar'] } },
  { id: 'serpenteagle', name: '蛇鵰', category: 'bird', motion: 'soar', group: [1, 1], epithet: '郊野之王', about: '喺郊野上空盤旋，一邊叫一邊搵蛇食。', minM: 40, minHealth: 70, season: 's6', real: { len: 0.7, span: 1.6 }, look: { kind: 'bird', c: ['#4a3a2a', '#c8a878', '#3a2e24', '#e8c040', '#3e3024'], size: 2.6, f: ['hooked', 'soar', 'crest'] } },
  { id: 'seaeagle', name: '白腹海鵰', category: 'bird', motion: 'soar', group: [1, 1], epithet: '海岸霸主', about: '香港最大嘅猛禽，喺海岸高樹同懸崖築巢。', minM: 60, minHealth: 75, season: 's12', real: { len: 0.8, span: 2 }, look: { kind: 'bird', c: ['#f4f4f0', '#ffffff', '#f4f4f0', '#8a8a92', '#5a5e66'], size: 3, f: ['hooked', 'soar'] } },

  /* ---------- 哺乳類 ---------- */
  { id: 'squirrel', name: '赤腹松鼠', category: 'mammal', motion: 'climb', group: [1, 2], epithet: '赤腹一閃', about: '郊野同公園都有，尾巴比身體還靈活。', minM: 2, minHealth: 55, spot: 'trunk', real: { len: 0.4 }, look: { kind: 'squirrel', c: ['#8e4f2c', '#c4623a', '#7d4526'], size: 1 } },
  { id: 'ferretbadger', name: '鼬獾', category: 'mammal', motion: 'walk', group: [1, 2], epithet: '白額小夜行者', about: '面上有白色斑紋，夜晚喺落葉堆掘蚯蚓。', minM: 6, minHealth: 58, night: true, real: { len: 0.55 }, look: { kind: 'quad', c: ['#6a5a4a', '#d8ccb8', '#f2eee6', '#2a2a2a'], size: 0.6, f: ['mask', 'snout', 'longTail'] } },
  { id: 'porcupine', name: '豪豬', category: 'mammal', motion: 'walk', group: [1, 2], epithet: '一身長刺', about: '夜間出沒，受驚會豎起黑白長刺沙沙作響。', minM: 8, minHealth: 60, night: true, real: { len: 0.75 }, look: { kind: 'quad', c: ['#3a3430', '#3a3430', '#2a2624', '#f2eee6'], size: 0.8, f: ['spines', 'stocky'] } },
  { id: 'fruitbat', name: '短吻果蝠', category: 'mammal', motion: 'bat', group: [3, 6], epithet: '夜空小狐狸', about: '食果實同花蜜，幫樹傳粉散播種子。', minM: 9, minHealth: 60, night: true, real: { len: 0.1, span: 0.45 }, look: { kind: 'bat', c: ['#5a4232', '#8a6a4a', '#3a2c22'], size: 1 } },
  { id: 'boar', name: '野豬', category: 'mammal', motion: 'walk', group: [2, 4], epithet: '郊野掘地者', about: '一家大細出動，用鼻拱泥搵樹根同果實。', minM: 10, minHealth: 55, real: { len: 1.5 }, look: { kind: 'quad', c: ['#4a3a30', '#5a4a3e', '#3a2e26', '#e8e0d0'], size: 1.3, f: ['snout', 'tusks', 'stocky', 'bristle'] } },
  { id: 'muntjac', name: '赤麂', category: 'mammal', motion: 'walk', group: [1, 2], epithet: '樹下吠鹿', about: '香港郊野的細小鹿，受驚會好似狗吠咁叫，最鍾意喺樹蔭下休息。', minM: 12, minHealth: 70, real: { len: 1 }, look: { kind: 'quad', c: ['#b7753f', '#e9d2b0', '#b7753f', '#5b4331'], size: 1.3, f: ['antlers', 'longLegs'] } },
  { id: 'civet', name: '果子狸', category: 'mammal', motion: 'walk', group: [1, 1], epithet: '白鼻心', about: '面上有白色條紋，夜晚爬樹食果。', minM: 14, minHealth: 66, night: true, real: { len: 1.1 }, look: { kind: 'quad', c: ['#7a6a5a', '#a89a88', '#2a2622', '#f2eee6'], size: 1, f: ['mask', 'longTail', 'blaze'] } },
  { id: 'macaque', name: '獼猴', category: 'mammal', motion: 'walk', group: [3, 6], epithet: '猴群出沒', about: '金山一帶成群生活，有猴王帶隊，千祈唔好餵食。', minM: 16, minHealth: 65, real: { len: 0.75 }, look: { kind: 'monkey', c: ['#a88a62', '#c8aa82', '#e8a898'], size: 1.2 } },
  { id: 'leopardcat', name: '豹貓', category: 'mammal', motion: 'walk', group: [1, 1], epithet: '郊野細花豹', about: '同家貓差唔多大，身上有豹紋，夜間捕獵。', minM: 20, minHealth: 72, night: true, real: { len: 0.9 }, look: { kind: 'quad', c: ['#c8a060', '#f0e0c0', '#c8a060', '#2a2218'], size: 0.8, f: ['spots', 'longTail', 'catEars'] } },
  { id: 'cattle', name: '黃牛', category: 'mammal', motion: 'walk', group: [2, 4], epithet: '西貢牛群', about: '昔日農耕牛嘅後代，而家喺郊野自由自在咁食草。', minM: 22, minHealth: 62, real: { len: 2.3 }, look: { kind: 'quad', c: ['#b8783a', '#d8a870', '#a86a30', '#e8e0cc'], size: 2.2, f: ['horns', 'stocky', 'longLegs', 'cowTail'] } },
  { id: 'buffalo', name: '水牛', category: 'mammal', motion: 'walk', group: [2, 3], epithet: '大嶼山泥浴', about: '大嶼山濕地嘅水牛群，鍾意浸泥漿消暑。', minM: 30, minHealth: 65, season: 's6', real: { len: 2.8 }, look: { kind: 'quad', c: ['#3a3634', '#4a4644', '#2e2a28', '#8a8478'], size: 2.5, f: ['bigHorns', 'stocky', 'longLegs', 'cowTail'] } },
  { id: 'smallcivet', name: '小靈貓', category: 'mammal', motion: 'walk', group: [1, 1], epithet: '環紋長尾', about: '尾巴有一圈圈黑環，夜間喺地面覓食。', minM: 35, minHealth: 70, night: true, season: 's6', real: { len: 0.9 }, look: { kind: 'quad', c: ['#b8a078', '#e0d0b0', '#b8a078', '#2a2622'], size: 0.8, f: ['spots', 'ringTail', 'longTail', 'snout'] } },
  { id: 'pangolin', name: '穿山甲', category: 'mammal', motion: 'walk', group: [1, 1], epithet: '一身鱗甲', about: '極度瀕危，全身鱗片，受驚會捲成一個球。', minM: 45, minHealth: 85, night: true, season: 's6', real: { len: 0.8 }, look: { kind: 'quad', c: ['#8a6a4a', '#b89a78', '#6a4e36', '#5a4432'], size: 0.9, f: ['scales', 'longTail', 'snout', 'short'] } },
  { id: 'otter', name: '歐亞水獺', category: 'mammal', motion: 'walk', group: [1, 2], epithet: '米埔稀客', about: '香港極罕見，只喺后海灣一帶有少量紀錄。', minM: 70, minHealth: 85, season: 's12', real: { len: 1.1 }, look: { kind: 'quad', c: ['#5a4232', '#c8b8a0', '#5a4232', '#2a2a2a'], size: 1, f: ['short', 'longTail', 'snout'] } },

  /* ---------- 蝴蝶 ---------- */
  { id: 'butterfly', name: '菜粉蝶', category: 'butterfly', motion: 'flutter', group: [1, 3], epithet: '白翼點綠', about: '園圃常見的白蝴蝶，喜歡停在新葉上。', minM: 0.15, minHealth: 40, real: { len: 0.025, span: 0.05 }, look: { kind: 'butterfly', c: ['#fbfbf2', '#9ccf6a', '#333333'], size: 0.8 } },
  { id: 'plaintiger', name: '金斑蝶', category: 'butterfly', motion: 'flutter', group: [2, 4], epithet: '橙翼黑邊', about: '橙色翅膀帶黑邊白點，身體有毒，雀鳥唔敢食。', minM: 2, minHealth: 50, real: { len: 0.035, span: 0.07 }, look: { kind: 'butterfly', c: ['#f08a2a', '#1a1a1a', '#222222', '#ffffff'], size: 1 } },
  { id: 'bluebottle', name: '青鳳蝶', category: 'butterfly', motion: 'flutter', group: [1, 2], epithet: '青藍一條帶', about: '黑翅中間有一條半透明青藍色帶，飛得好快。', minM: 4, minHealth: 55, real: { len: 0.035, span: 0.08 }, look: { kind: 'butterfly', c: ['#1a1a1e', '#3ac0d8', '#222222'], size: 1.05, f: ['tails'] } },
  { id: 'birdwing', name: '裳鳳蝶', category: 'butterfly', motion: 'flutter', group: [1, 1], epithet: '金裳大蝶', about: '香港最大嘅蝴蝶，受保護，後翅金黃色。', minM: 18, minHealth: 75, months: SPRING_SUMMER, real: { len: 0.06, span: 0.15 }, look: { kind: 'butterfly', c: ['#141414', '#f2c81a', '#1a1a1a'], size: 1.7 } },
  { id: 'atlasmoth', name: '皇蛾', category: 'butterfly', motion: 'flutter', group: [1, 1], epithet: '蛇頭翅尖', about: '世界最大嘅蛾之一，翅尖似蛇頭，夜晚先出現。', minM: 28, minHealth: 72, night: true, season: 's6', real: { len: 0.08, span: 0.25 }, look: { kind: 'butterfly', c: ['#a8502a', '#f2dcb0', '#6a3a22', '#ffffff'], size: 2, f: ['moth'] } },

  /* ---------- 昆蟲 ---------- */
  { id: 'ladybug', name: '七星瓢蟲', category: 'insect', motion: 'crawl', group: [1, 2], epithet: '葉上紅點', about: '紅殼黑點，會幫樹食蚜蟲。', minM: 0.3, minHealth: 45, spot: 'leaf', real: { len: 0.007 }, look: { kind: 'beetle', c: ['#d8322b', '#1a1a1a'], size: 0.7, f: ['dots'] } },
  { id: 'dragonfly', name: '紅蜻蜓', category: 'insect', motion: 'hover', group: [2, 4], epithet: '雨後點水', about: '落雨前後喺低空盤旋捉蚊。', minM: 1, minHealth: 45, weather: 'rain', real: { len: 0.045, span: 0.07 }, look: { kind: 'dragonfly', c: ['#d8402a', '#e8f0f0'], size: 0.9 } },
  { id: 'honeybee', name: '中華蜜蜂', category: 'insect', motion: 'hover', group: [3, 6], epithet: '嗡嗡採蜜', about: '本地原生蜜蜂，幫開花植物傳粉。', minM: 3, minHealth: 60, real: { len: 0.012, span: 0.02 }, look: { kind: 'bee', c: ['#e0a830', '#2a2218', '#e8f0f4'], size: 0.55 } },
  { id: 'mantis', name: '螳螂', category: 'insect', motion: 'crawl', group: [1, 1], epithet: '祈禱獵手', about: '雙手似鐮刀，靜靜喺葉上伏擊小蟲。', minM: 5, minHealth: 55, spot: 'leaf', real: { len: 0.08 }, look: { kind: 'mantis', c: ['#7ac04a', '#5a9a3a'], size: 0.9 } },
  { id: 'cicada', name: '蟬', category: 'insect', motion: 'crawl', group: [1, 2], epithet: '盛夏長鳴', about: '要碰上酷熱的日子，牠才肯露面。', minM: 6, minHealth: 55, weather: 'hot', spot: 'trunk', real: { len: 0.05, span: 0.12 }, look: { kind: 'cicada', c: ['#4d5a3a', '#dfeee6', '#394530'], size: 0.8 } },
  { id: 'stickinsect', name: '竹節蟲', category: 'insect', motion: 'crawl', group: [1, 1], epithet: '扮樹枝高手', about: '身體似一條枯枝，一動不動就搵唔到佢。', minM: 9, minHealth: 58, spot: 'leaf', real: { len: 0.12 }, look: { kind: 'stick', c: ['#8a7a4a', '#6a5a36'], size: 1 } },
  { id: 'rhinobeetle', name: '獨角仙', category: 'insect', motion: 'crawl', group: [1, 1], epithet: '一支大角', about: '夏夜飛嚟食樹汁，雄蟲頭上有一支大角。', minM: 12, minHealth: 62, months: SUMMER, night: true, spot: 'trunk', real: { len: 0.06 }, look: { kind: 'beetle', c: ['#3a2218', '#1a120e'], size: 0.9, f: ['horn'] } },
  { id: 'firefly', name: '螢火蟲', category: 'insect', motion: 'glow', group: [1, 1], epithet: '一點溫光', about: '樹夠大、夠健康，夜裡就有微光。', minM: 15, minHealth: 80, night: true, real: { len: 0.012, span: 0.02 }, look: { kind: 'firefly', c: ['#3b3325', '#f6ff9a'], size: 0.6 } },

  /* ---------- 爬蟲類 ---------- */
  { id: 'lizard', name: '變色樹蜥', category: 'reptile', motion: 'crawl', group: [1, 1], epithet: '曬太陽變紅頭', about: '天氣熱就喺樹幹曬太陽，雄性繁殖期頭頸會變紅。', minM: 1.5, minHealth: 50, weather: 'hot', spot: 'trunk', real: { len: 0.35 }, look: { kind: 'lizard', c: ['#9a8a5a', '#c84a2a', '#6a5e3e'], size: 1 } },
  { id: 'gecko', name: '壁虎', category: 'reptile', motion: 'crawl', group: [1, 2], epithet: '夜燈下的獵手', about: '夜晚喺燈光附近捉飛蟲，腳底有吸盤。', minM: 7, minHealth: 55, night: true, spot: 'trunk', real: { len: 0.12 }, look: { kind: 'lizard', c: ['#c8b89a', '#e8dcc8', '#a89878'], size: 0.7, f: ['gecko'] } },
  { id: 'pitviper', name: '竹葉青', category: 'reptile', motion: 'crawl', group: [1, 1], epithet: '綠色伏擊者', about: '全身翠綠、尾巴紅色，有毒，喺枝上靜靜等獵物。', minM: 11, minHealth: 62, spot: 'leaf', real: { len: 0.7 }, look: { kind: 'snake', c: ['#5ac03a', '#d8402a', '#f0e070'], size: 0.8 } },
  { id: 'python', name: '緬甸蟒', category: 'reptile', motion: 'crawl', group: [1, 1], epithet: '郊野巨蟒', about: '香港最大嘅蛇，受保護，無毒但力大無窮。', minM: 38, minHealth: 75, season: 's6', spot: 'ground', real: { len: 3.5 }, look: { kind: 'snake', c: ['#a8905a', '#5a4430', '#d8c898'], size: 2.2, f: ['blotch'] } },
  { id: 'turtle', name: '三線閉殼龜', category: 'reptile', motion: 'crawl', group: [1, 1], epithet: '金錢龜', about: '極度瀕危，殼上有三條黑線，喺山溪附近生活。', minM: 50, minHealth: 80, season: 's12', spot: 'ground', real: { len: 0.2 }, look: { kind: 'turtle', c: ['#6a4a2a', '#1a1a1a', '#e8c040'], size: 1 } },

  /* ---------- 兩棲類 ---------- */
  { id: 'toad', name: '黑眶蟾蜍', category: 'amphibian', motion: 'hop', group: [1, 3], epithet: '雨夜咯咯', about: '落雨時喺草地跳出嚟，眼睛周圍有黑框。', minM: 2, minHealth: 52, weather: 'rain', real: { len: 0.08 }, look: { kind: 'frog', c: ['#8a6a42', '#c8a878', '#2a2018'], size: 0.8, f: ['warty'] } },
  { id: 'newt', name: '香港瘰螈', category: 'amphibian', motion: 'crawl', group: [1, 2], epithet: '溪中小龍', about: '香港特有嘅蠑螈，肚皮有橙紅斑，喺清澈山溪生活。', minM: 3, minHealth: 58, weather: 'rain', spot: 'ground', real: { len: 0.13 }, look: { kind: 'lizard', c: ['#3a2e28', '#e8702a', '#2a221e'], size: 0.8, f: ['newt'] } },
  { id: 'treefrog', name: '盧氏小樹蛙', category: 'amphibian', motion: 'hop', group: [1, 3], epithet: '指甲咁細', about: '香港特有，只有一隻指甲咁大，雨夜叫聲清脆。', minM: 5, minHealth: 60, weather: 'rain', night: true, real: { len: 0.02 }, look: { kind: 'frog', c: ['#a8905a', '#d8c898', '#5a4a30'], size: 0.5 } },
];

export function animalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id);
}

export const CATEGORY_LABEL: Record<AnimalCategory, string> = {
  bird: '雀鳥',
  mammal: '哺乳類',
  butterfly: '蝴蝶・蛾',
  insect: '昆蟲',
  reptile: '爬蟲類',
  amphibian: '兩棲類',
};

export const CATEGORY_ORDER: AnimalCategory[] = ['bird', 'mammal', 'butterfly', 'insect', 'reptile', 'amphibian'];

const MONTH_TEXT = (months: number[]): string => {
  const set = new Set(months);
  if ([10, 11, 12, 1, 2].every((m) => set.has(m))) return '秋冬';
  if ([5, 6, 7, 8].every((m) => set.has(m)) && !set.has(12)) return set.has(3) ? '春夏' : '夏天';
  return `${Math.min(...months)}–${Math.max(...months)} 月`;
};

const SEASON_TEXT: Record<SeasonId, string> = { s3: '', s6: '6 個月或以上賽季', s12: '1 年賽季' };

/** Human-readable unlock conditions, e.g. 「12 米・健康 70・雨天」. */
export function unlockHint(a: AnimalDef): string {
  const parts = [a.minM >= 1 ? `${a.minM} 米` : `${Math.round(a.minM * 100)} 厘米`, `健康 ${a.minHealth}`];
  if (a.weather === 'hot') parts.push('酷熱日');
  if (a.weather === 'rain') parts.push('落雨日');
  if (a.needStorms) parts.push(`捱過 ${a.needStorms} 場風暴`);
  if (a.months) parts.push(MONTH_TEXT(a.months));
  if (a.season && a.season !== 's3') parts.push(SEASON_TEXT[a.season]);
  if (a.night) parts.push('夜行');
  return parts.join('・');
}
