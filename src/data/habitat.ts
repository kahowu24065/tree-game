import type { SpeciesId } from './species';

/**
 * The floating island grows with the tree (automatic, no cost). Each growth stage widens the
 * island and adds scenery themed to where the species grows in the wild.
 */
export type Feature =
  | 'rocks'
  | 'boulders'
  | 'shrubs'
  | 'flowers'
  | 'drygrass'
  | 'hills'
  | 'mountains'
  | 'snowpeaks'
  | 'scree'
  | 'snow'
  | 'pond'
  | 'lotus'
  | 'lake'
  | 'river'
  | 'creek'
  | 'wetland'
  | 'reeds'
  | 'waterfall'
  | 'ferns'
  | 'treeferns'
  | 'fog'
  | 'coast'
  | 'wall'
  | 'village'
  | 'shrine'
  | 'steps'
  | 'courtyard'
  | 'lanterns'
  | 'pavilion'
  | 'forest';

export const FEATURE_LABEL: Record<Feature, string> = {
  rocks: '石頭', boulders: '大石', shrubs: '灌木', flowers: '野花', drygrass: '乾草', hills: '山丘', mountains: '遠山',
  snowpeaks: '雪峰', scree: '碎石坡', snow: '積雪', pond: '池塘', lotus: '荷葉', lake: '湖泊', river: '河流', creek: '小溪',
  wetland: '濕地', reeds: '蘆葦', waterfall: '瀑布', ferns: '蕨類', treeferns: '樹蕨', fog: '霧', coast: '海岸',
  wall: '石牆', village: '村屋', shrine: '土地廟', steps: '石級', courtyard: '庭院', lanterns: '石燈籠', pavilion: '亭',
  forest: '同種樹林',
};

export interface HabitatDef {
  species: SpeciesId;
  name: string;
  blurb: string;
  /** Ground colour of the outer land. */
  grass: string;
  /** Features added at stages 1–4 (index 0 = 幼苗, nothing yet). */
  adds: [Feature[], Feature[], Feature[], Feature[], Feature[]];
}

/** Island radius (world units) per growth stage. The garden in the middle stays radius 7. */
export const ISLAND_RADII = [7, 8.6, 10.6, 13, 16] as const;

export const HABITATS: HabitatDef[] = [
  { species: 'camphor', name: '山坡林地', blurb: '香港郊野山坡：石塊、灌叢，遠處青山同山澗。', grass: '#78b64c', adds: [[], ['rocks', 'shrubs'], ['hills', 'flowers'], ['boulders', 'forest'], ['mountains', 'creek']] },
  { species: 'cotton', name: '河畔草地', blurb: '華南河岸同乾草地，河邊蘆葦，遠處黃土丘。', grass: '#a9b75a', adds: [[], ['drygrass', 'rocks'], ['river'], ['reeds', 'forest'], ['hills', 'waterfall']] },
  { species: 'banyan', name: '圍村風水林', blurb: '新界圍村：石牆、魚塘荷葉、村屋同土地廟。', grass: '#6fae48', adds: [[], ['wall', 'shrubs'], ['pond', 'lotus'], ['village', 'shrine'], ['forest', 'flowers']] },
  { species: 'metasequoia', name: '溪澗濕地', blurb: '湖北水杉壩：溪流、池塘、濕地蘆葦，背後青山，清晨起霧。', grass: '#6db255', adds: [[], ['reeds', 'creek'], ['pond', 'lotus'], ['wetland', 'forest'], ['lake', 'fog', 'hills']] },
  { species: 'ginkgo', name: '古剎庭院', blurb: '古寺庭院：石級、石燈籠、亭同放生池，四周山丘。', grass: '#7cb350', adds: [[], ['rocks', 'flowers'], ['steps', 'courtyard'], ['lanterns', 'pavilion', 'pond'], ['wall', 'forest', 'hills']] },
  { species: 'deodar', name: '喜馬拉雅山坡', blurb: '高山碎石坡，雪峰連綿，雪松成林，雪水匯成小溪。', grass: '#8aa866', adds: [[], ['rocks', 'scree'], ['hills', 'boulders'], ['snowpeaks', 'forest'], ['snow', 'mountains', 'creek']] },
  { species: 'redwood', name: '霧鎖海岸', blurb: '加州海岸霧林：蕨類、小溪、海蝕柱同海霧，後面係海岸山脈。', grass: '#5f9f4a', adds: [[], ['ferns'], ['creek', 'shrubs'], ['coast', 'forest', 'fog'], ['treeferns', 'boulders', 'hills']] },
  { species: 'eucalyptus', name: '桉樹山谷', blurb: '澳洲東南山谷：蕨叢、樹蕨、瀑布同藍霧山嶺。', grass: '#8aa65c', adds: [[], ['ferns', 'rocks'], ['hills', 'treeferns'], ['waterfall', 'forest'], ['mountains', 'fog']] },
  { species: 'douglas', name: '山湖針葉林', blurb: '北美太平洋山區：湖泊、針葉林，遠處雪山。', grass: '#6aa250', adds: [[], ['rocks', 'shrubs'], ['lake'], ['mountains', 'forest'], ['snowpeaks', 'reeds']] },
];

export function habitatDef(species: SpeciesId | string): HabitatDef {
  return HABITATS.find((h) => h.species === species) ?? HABITATS[0]!;
}

export function islandRadius(stage: number): number {
  return ISLAND_RADII[Math.max(0, Math.min(4, Math.round(stage)))]!;
}

/** Every feature present at a stage (cumulative). */
export function habitatFeatures(species: SpeciesId | string, stage: number): Feature[] {
  const h = habitatDef(species);
  const out: Feature[] = [];
  for (let s = 0; s <= Math.max(0, Math.min(4, Math.round(stage))); s++) for (const f of h.adds[s]!) if (!out.includes(f)) out.push(f);
  return out;
}
