import type { SeasonId } from '../balance';

/**
 * 9 tree species, 3 per season. v8: each species has its own season target = its real-world record height
 * rounded to the nearest 10 m (see `targetM`). Records checked 2026-09 against the sources listed.
 */
export type SpeciesId = 'camphor' | 'cotton' | 'banyan' | 'metasequoia' | 'ginkgo' | 'deodar' | 'redwood' | 'eucalyptus' | 'douglas';

/** Silhouette family used by the procedural 3D model. */
export type TreeForm = 'round' | 'tiered' | 'banyan' | 'narrowCone' | 'fan' | 'drooping' | 'column' | 'eucalypt' | 'cone';

export interface SpeciesDef {
  id: SpeciesId;
  season: SeasonId;
  name: string;
  english: string;
  scientific: string;
  /** Usual mature height (m). */
  typicalM: string;
  /** Tallest reliably recorded height (m) — the species' real-world record. */
  maxM: number;
  /** Season target (m) = record height rounded to the nearest 10 m. */
  targetM: number;
  /** Note on the record (where / which tree). */
  record: string;
  source: { label: string; url: string };
  form: TreeForm;
  blurb: string;
  /** What each growth stage looks like (幼苗、小樹、青年樹、成年樹、巨樹). */
  stages: [string, string, string, string, string];
}

export const STAGE_NAMES = ['幼苗', '小樹', '青年樹', '成年樹', '巨樹'] as const;
/** Stage thresholds as a share of the season's target height. */
export const STAGE_SHARES = [0, 0.025, 0.1, 0.4, 0.85] as const;

export const SPECIES: SpeciesDef[] = [
  {
    id: 'camphor',
    season: 's3',
    name: '樟樹',
    english: 'Camphor tree',
    scientific: 'Camphora officinarum（Cinnamomum camphora）',
    typicalM: '20–30',
    maxM: 46.4,
    targetM: 50,
    record: '台灣南投神木村「樟樹公」2018 年攀樹拉尺實測 46.4 米，世界最高嘅樟樹',
    source: { label: 'MonumentalTrees／Taiwan News', url: 'https://www.monumentaltrees.com/en/trees/cinnamomumcamphora/records/' },
    form: 'round',
    blurb: '香港郊野同公園常見，樹冠又闊又密，葉有樟腦香。',
    stages: ['兩片圓葉加一個嫩芽', '幼幹分出幾枝，樹冠細細個', '樹冠開始變圓，春天有紅銅色嫩葉', '闊大濃密嘅圓頂樹冠，開細白花', '粗壯灰褐樹幹、板根，樹冠比樹身仲闊'],
  },
  {
    id: 'cotton',
    season: 's3',
    name: '木棉',
    english: 'Red silk-cotton tree',
    scientific: 'Bombax ceiba',
    typicalM: '約 20',
    maxM: 60,
    targetM: 60,
    record: '一般約 20 米；濕熱地區老樹可達 60 米（有記載嘅最高高度）',
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Bombax_ceiba' },
    form: 'tiered',
    blurb: '「英雄樹」，樹幹筆直，枝條一層層平伸，春天未出葉先開大紅花。',
    stages: ['掌狀嫩葉，莖上有細刺', '筆直幼幹，幹上一粒粒圓錐刺', '枝條分層平伸，好似塔咁', '層層橫枝開滿大紅花', '高大筆直嘅灰幹，紅花之外仲有棉絮爆出'],
  },
  {
    id: 'banyan',
    season: 's3',
    name: '細葉榕',
    english: 'Chinese banyan',
    scientific: 'Ficus microcarpa',
    typicalM: '20–25',
    maxM: 30,
    targetM: 30,
    record: '最高可達 30 米（新加坡國家公園局植物誌、Flora Malesiana）',
    source: { label: 'NParks Flora & Fauna Web', url: 'https://www.nparks.gov.sg/florafaunaweb/flora/2/9/2912' },
    form: 'banyan',
    blurb: '香港村口、廟前最常見嘅大樹，枝上垂落氣根，落地變成支柱根。',
    stages: ['幾塊細細嘅深綠葉', '樹幹開始扭曲，枝條向外伸', '樹冠又闊又密，開始有氣根垂落', '一簾簾氣根，樹冠闊過樹高', '多條氣根落地成柱，好似一片細樹林，結滿細榕果'],
  },
  {
    id: 'metasequoia',
    season: 's6',
    name: '水杉',
    english: 'Dawn redwood',
    scientific: 'Metasequoia glyptostroboides',
    typicalM: '30–45',
    maxM: 51,
    targetM: 50,
    record: '2000 年代全面普查湖北野生水杉，最高 51 米（栽培紀錄：美國長木花園 41.45 米）',
    source: { label: 'Wikipedia／MonumentalTrees', url: 'https://en.wikipedia.org/wiki/Metasequoia_glyptostroboides' },
    form: 'narrowCone',
    blurb: '「活化石」，1940 年代先喺湖北重新發現。落葉針葉樹，樹形窄長如塔。',
    stages: ['一撮羽毛似嘅軟針葉', '幼幹筆直，細枝對生', '窄長圓錐形，葉色嫩綠', '高聳尖塔，樹幹紅褐有溝紋', '基部板根，葉轉銅紅色，好似秋天'],
  },
  {
    id: 'ginkgo',
    season: 's6',
    name: '銀杏',
    english: 'Ginkgo',
    scientific: 'Ginkgo biloba',
    typicalM: '20–40',
    maxM: 60,
    targetM: 60,
    record: '甘肅大堡一棵高 60 米（湖南張家界 70 米嘅報告未經證實）',
    source: { label: 'conifers.org／Journal of Ecology (2022)', url: 'https://www.conifers.org/gi/Ginkgoaceae.php' },
    form: 'fan',
    blurb: '兩億幾年前已經存在嘅物種，扇形葉，秋天變金黃。',
    stages: ['兩三塊扇形小葉', '瘦長樹幹，枝條疏疏落落', '枝條 45 度向上，樹冠開始成形', '寬卵形樹冠，扇葉開始轉金', '滿樹金黃，樹下鋪滿落葉'],
  },
  {
    id: 'deodar',
    season: 's6',
    name: '雪松',
    english: 'Deodar cedar',
    scientific: 'Cedrus deodara',
    typicalM: '40–50',
    maxM: 60,
    targetM: 60,
    record: '喜馬拉雅原生地一般 40–50 米，個別達 60 米',
    source: { label: 'Wikipedia／Trees and Shrubs Online', url: 'https://en.wikipedia.org/wiki/Cedrus_deodara' },
    form: 'drooping',
    blurb: '喜馬拉雅山嘅「神木」，一層層水平枝，枝尖下垂，樹頂微微彎低。',
    stages: ['一小撮藍綠針葉', '樹頂彎彎，細枝開始分層', '寬闊金字塔形，枝層分明', '大片水平枝層，枝尖下垂，掛住直立球果', '巨大寶塔形，深色樹幹，枝層似雲'],
  },
  {
    id: 'redwood',
    season: 's12',
    name: '北美紅杉',
    english: 'Coast redwood',
    scientific: 'Sequoia sempervirens',
    typicalM: '60–100',
    maxM: 116.2,
    targetM: 120,
    record: '「海波龍」（Hyperion）約 116.2 米，世界最高嘅樹',
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hyperion_(tree)' },
    form: 'column',
    blurb: '加州海岸霧林嘅巨人，樹皮厚而紅褐，可以活二千年。',
    stages: ['細細一撮扁平針葉', '筆直幼幹，樹皮開始泛紅', '窄長圓錐，樹冠延到地面', '粗大紅褐樹幹，下半段光禿，樹冠集中喺高處', '巨大有溝紋嘅紅幹、火燒疤痕，頂部分出幾條副幹'],
  },
  {
    id: 'eucalyptus',
    season: 's12',
    name: '杏仁桉',
    english: 'Mountain ash',
    scientific: 'Eucalyptus regnans',
    typicalM: '70–90',
    maxM: 100.5,
    targetM: 100,
    record: '塔斯曼尼亞「百夫長」（Centurion）2018 年量得 100.5 米，最高嘅開花植物',
    source: { label: 'Giant Tree Expeditions／ABC News', url: 'https://giant-trees.com/project/how-tall-is-the-tallest-flowering-tree/' },
    form: 'eucalypt',
    blurb: '世界最高嘅開花植物。樹幹又直又滑，灰白色，下段掛住剝落樹皮。',
    stages: ['對生嘅圓形嫩葉', '瘦長樹幹，葉片開始變長', '樹幹光滑灰白，樹冠疏落', '長長一段光幹，樹冠喺頂上一團團', '巨大白幹、剝落樹皮帶，頂部有枯枝'],
  },
  {
    id: 'douglas',
    season: 's12',
    name: '花旗松',
    english: 'Coast Douglas-fir',
    scientific: 'Pseudotsuga menziesii',
    typicalM: '60–75',
    maxM: 99.7,
    targetM: 100,
    record: '俄勒岡「Doerner Fir」量得約 99.7 米（2025 年山火後剩約 85 米）',
    source: { label: 'Wikipedia／Jefferson Public Radio', url: 'https://en.wikipedia.org/wiki/Doerner_Fir' },
    form: 'cone',
    blurb: '北美太平洋岸嘅經典聖誕樹形，係世界第二高嘅針葉樹種。',
    stages: ['一圈細針葉', '細細嘅三角形小松', '濃密圓錐形，枝到地面', '高大深綠圓錐，掛滿有「鼠尾」苞片嘅球果', '下半段枝條自然脫落，粗厚深溝樹皮'],
  },
];

export function speciesDef(id: SpeciesId | string | undefined): SpeciesDef {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0]!;
}

export function speciesForSeason(season: SeasonId): SpeciesDef[] {
  return SPECIES.filter((s) => s.season === season);
}

export function defaultSpecies(season: SeasonId): SpeciesId {
  return speciesForSeason(season)[0]!.id;
}

/** Season target (cm) for a species: its record height rounded to the nearest 10 m. */
export function speciesTargetCm(id: SpeciesId | string | undefined): number {
  return speciesDef(id).targetM * 100;
}

/** Record height rounded to the nearest 10 m (how targetM is derived). */
export function roundTo10(m: number): number {
  return Math.round(m / 10) * 10;
}

/** Growth stage index 0–4 for a height, relative to the season target. */
export function stageIndexFor(heightCm: number, targetCm: number): number {
  let idx = 0;
  STAGE_SHARES.forEach((share, i) => {
    if (heightCm >= share * targetCm) idx = i;
  });
  return idx;
}

/** A height that sits in the middle of a stage (for previews). */
export function stageSampleCm(stage: number, targetCm: number): number {
  const lo = STAGE_SHARES[stage]! * targetCm;
  const hi = stage < 4 ? STAGE_SHARES[stage + 1]! * targetCm : targetCm;
  if (stage === 0) return Math.max(18, hi * 0.5);
  return stage === 4 ? targetCm * 0.97 : Math.sqrt(lo * hi);
}
