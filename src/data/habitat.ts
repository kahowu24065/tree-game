import type { SpeciesId } from './species';
import { t as tl } from '../i18n';

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
  | 'inlet'
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
  rocks: tl('habitat.001'), boulders: tl('habitat.002'), shrubs: tl('habitat.003'), flowers: tl('habitat.004'), drygrass: tl('habitat.005'), hills: tl('habitat.006'), mountains: tl('habitat.007'),
  snowpeaks: tl('habitat.008'), scree: tl('habitat.009'), snow: tl('habitat.010'), pond: tl('habitat.011'), lotus: tl('habitat.012'), lake: tl('habitat.013'), river: tl('habitat.014'), creek: tl('habitat.015'),
  wetland: tl('habitat.016'), reeds: tl('habitat.017'), waterfall: tl('habitat.018'), inlet: tl('habitat.019'), ferns: tl('habitat.020'), treeferns: tl('habitat.021'), fog: tl('habitat.022'), coast: tl('habitat.023'),
  wall: tl('habitat.024'), village: tl('habitat.025'), shrine: tl('habitat.026'), steps: tl('habitat.027'), courtyard: tl('habitat.028'), lanterns: tl('habitat.029'), pavilion: tl('habitat.030'),
  forest: tl('habitat.031'),
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
export const ISLAND_RADII = [7, 9.4, 11.4, 13.8, 16.6] as const;

export const HABITATS: HabitatDef[] = [
  { species: 'camphor', name: tl('habitat.032'), blurb: tl('habitat.033'), grass: '#78b64c', adds: [[], ['rocks', 'shrubs', 'pond'], ['hills', 'flowers', 'creek', 'pond'], ['boulders', 'forest', 'lake'], ['mountains', 'creek', 'inlet', 'pond']] },
  { species: 'cotton', name: tl('habitat.034'), blurb: tl('habitat.035'), grass: '#a9b75a', adds: [[], ['drygrass', 'rocks', 'pond'], ['river', 'pond'], ['reeds', 'forest', 'wetland', 'lake'], ['hills', 'waterfall', 'inlet', 'river']] },
  { species: 'banyan', name: tl('habitat.036'), blurb: tl('habitat.037'), grass: '#6fae48', adds: [[], ['wall', 'shrubs', 'pond'], ['pond', 'lotus'], ['village', 'shrine', 'creek', 'lake'], ['forest', 'flowers', 'pond', 'inlet']] },
  { species: 'metasequoia', name: tl('habitat.038'), blurb: tl('habitat.039'), grass: '#6db255', adds: [[], ['reeds', 'creek', 'pond'], ['pond', 'lotus', 'river'], ['wetland', 'forest', 'inlet'], ['lake', 'fog', 'hills']] },
  { species: 'ginkgo', name: tl('habitat.040'), blurb: tl('habitat.041'), grass: '#7cb350', adds: [[], ['rocks', 'flowers', 'pond'], ['steps', 'courtyard', 'pond'], ['lanterns', 'pavilion', 'pond', 'creek'], ['wall', 'forest', 'hills', 'creek', 'lake']] },
  { species: 'deodar', name: tl('habitat.042'), blurb: tl('habitat.043'), grass: '#8aa866', adds: [[], ['rocks', 'scree', 'creek'], ['hills', 'boulders', 'creek', 'pond'], ['snowpeaks', 'forest', 'lake'], ['snow', 'mountains', 'creek', 'river']] },
  { species: 'redwood', name: tl('habitat.044'), blurb: tl('habitat.045'), grass: '#5f9f4a', adds: [[], ['ferns', 'pond'], ['creek', 'shrubs', 'pond'], ['coast', 'forest', 'fog', 'inlet'], ['treeferns', 'boulders', 'hills', 'creek', 'lake']] },
  { species: 'eucalyptus', name: tl('habitat.046'), blurb: tl('habitat.047'), grass: '#8aa65c', adds: [[], ['ferns', 'rocks', 'creek', 'pond'], ['hills', 'treeferns', 'pond'], ['waterfall', 'forest', 'creek'], ['mountains', 'fog', 'lake']] },
  { species: 'douglas', name: tl('habitat.048'), blurb: tl('habitat.049'), grass: '#6aa250', adds: [[], ['rocks', 'shrubs', 'creek', 'pond'], ['lake'], ['mountains', 'forest', 'river'], ['snowpeaks', 'reeds', 'inlet', 'lake']] },
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
