import { t as tl } from '../i18n';
/**
 * 9 tree species. Each has its own 紀錄高度 R = its real-world record height rounded to the nearest 10 m (see
 * `targetM`); v14 growth approaches R (no seasons). Records checked 2026-09 against the sources listed.
 */
export type SpeciesId = 'camphor' | 'cotton' | 'banyan' | 'metasequoia' | 'ginkgo' | 'deodar' | 'redwood' | 'eucalyptus' | 'douglas';

/** Silhouette family used by the procedural 3D model. */
export type TreeForm = 'round' | 'tiered' | 'banyan' | 'narrowCone' | 'fan' | 'drooping' | 'column' | 'eucalypt' | 'cone';

export interface SpeciesDef {
  id: SpeciesId;
  name: string;
  english: string;
  scientific: string;
  /** Usual mature height (m). */
  typicalM: string;
  /** Tallest reliably recorded height (m) — the species' real-world record. */
  maxM: number;
  /** 紀錄高度 R (m) = record height rounded to the nearest 10 m (v14 growth curve target). */
  targetM: number;
  /** Note on the record (where / which tree). */
  record: string;
  source: { label: string; url: string };
  form: TreeForm;
  blurb: string;
  /** What each growth stage looks like (幼苗、小樹、青年樹、成年樹、巨樹). */
  stages: [string, string, string, string, string];
  /**
   * Approximate real-world years to reach 63% of 紀錄高度.
   * Used only to show an equivalent real age: H = R (1 − e^(−t/τ)).
   */
  realTauYears: number;
  /** Basic wood density (g/cm³), a typical published mean for the species. */
  woodDensity: number;
  /** Typical diameter at breast height (cm) when the tree is 10 m tall. The game only stores height. */
  dbhAt10m: number;
}

export const STAGE_NAMES = [tl('species.001'), tl('species.002'), tl('species.003'), tl('species.004'), tl('species.005')] as const;
/** Stage thresholds as a share of the species' 紀錄高度 R. */
export const STAGE_SHARES = [0, 0.025, 0.1, 0.4, 0.85] as const;

export const SPECIES: SpeciesDef[] = [
  {
    id: 'camphor',
    name: tl('species.006'),
    english: 'Camphor tree',
    scientific: tl('species.007'),
    typicalM: '20–30',
    maxM: 46.4,
    targetM: 50,
    record: tl('species.008'),
    source: { label: tl('species.009'), url: 'https://www.monumentaltrees.com/en/trees/cinnamomumcamphora/records/' },
    form: 'round',
    blurb: tl('species.010'),
    stages: [tl('species.011'), tl('species.012'), tl('species.013'), tl('species.014'), tl('species.015')],
    realTauYears: 80,
    woodDensity: 0.55,
    dbhAt10m: 27,
  },
  {
    id: 'cotton',
    name: tl('species.016'),
    english: 'Red silk-cotton tree',
    scientific: 'Bombax ceiba',
    typicalM: tl('species.017'),
    maxM: 60,
    targetM: 60,
    record: tl('species.018'),
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Bombax_ceiba' },
    form: 'tiered',
    blurb: tl('species.019'),
    stages: [tl('species.020'), tl('species.021'), tl('species.022'), tl('species.023'), tl('species.024')],
    realTauYears: 35,
    woodDensity: 0.4,
    dbhAt10m: 32,
  },
  {
    id: 'banyan',
    name: tl('species.025'),
    english: 'Chinese banyan',
    scientific: 'Ficus microcarpa',
    typicalM: '20–25',
    maxM: 30,
    targetM: 30,
    record: tl('species.026'),
    source: { label: 'NParks Flora & Fauna Web', url: 'https://www.nparks.gov.sg/florafaunaweb/flora/2/9/2912' },
    form: 'banyan',
    blurb: tl('species.027'),
    stages: [tl('species.028'), tl('species.029'), tl('species.030'), tl('species.031'), tl('species.032')],
    realTauYears: 30,
    woodDensity: 0.43,
    dbhAt10m: 20,
  },
  {
    id: 'metasequoia',
    name: tl('species.033'),
    english: 'Dawn redwood',
    scientific: 'Metasequoia glyptostroboides',
    typicalM: '30–45',
    maxM: 51,
    targetM: 50,
    record: tl('species.034'),
    source: { label: tl('species.035'), url: 'https://en.wikipedia.org/wiki/Metasequoia_glyptostroboides' },
    form: 'narrowCone',
    blurb: tl('species.036'),
    stages: [tl('species.037'), tl('species.038'), tl('species.039'), tl('species.040'), tl('species.041')],
    realTauYears: 40,
    woodDensity: 0.32,
    dbhAt10m: 14,
  },
  {
    id: 'ginkgo',
    name: tl('species.042'),
    english: 'Ginkgo',
    scientific: 'Ginkgo biloba',
    typicalM: '20–40',
    maxM: 60,
    targetM: 60,
    record: tl('species.043'),
    source: { label: tl('species.044'), url: 'https://www.conifers.org/gi/Ginkgoaceae.php' },
    form: 'fan',
    blurb: tl('species.045'),
    stages: [tl('species.046'), tl('species.047'), tl('species.048'), tl('species.049'), tl('species.050')],
    realTauYears: 120,
    woodDensity: 0.52,
    dbhAt10m: 15,
  },
  {
    id: 'deodar',
    name: tl('species.051'),
    english: 'Deodar cedar',
    scientific: 'Cedrus deodara',
    typicalM: '40–50',
    maxM: 60,
    targetM: 60,
    record: tl('species.052'),
    source: { label: tl('species.053'), url: 'https://en.wikipedia.org/wiki/Cedrus_deodara' },
    form: 'drooping',
    blurb: tl('species.054'),
    stages: [tl('species.055'), tl('species.056'), tl('species.057'), tl('species.058'), tl('species.059')],
    realTauYears: 70,
    woodDensity: 0.48,
    dbhAt10m: 16,
  },
  {
    id: 'redwood',
    name: tl('species.060'),
    english: 'Coast redwood',
    scientific: 'Sequoia sempervirens',
    typicalM: '60–100',
    maxM: 116.2,
    targetM: 120,
    record: tl('species.061'),
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hyperion_(tree)' },
    form: 'column',
    blurb: tl('species.062'),
    stages: [tl('species.063'), tl('species.064'), tl('species.065'), tl('species.066'), tl('species.067')],
    realTauYears: 150,
    woodDensity: 0.4,
    dbhAt10m: 18,
  },
  {
    id: 'eucalyptus',
    name: tl('species.068'),
    english: 'Mountain ash',
    scientific: 'Eucalyptus regnans',
    typicalM: '70–90',
    maxM: 100.5,
    targetM: 100,
    record: tl('species.069'),
    source: { label: tl('species.070'), url: 'https://giant-trees.com/project/how-tall-is-the-tallest-flowering-tree/' },
    form: 'eucalypt',
    blurb: tl('species.071'),
    stages: [tl('species.072'), tl('species.073'), tl('species.074'), tl('species.075'), tl('species.076')],
    realTauYears: 70,
    woodDensity: 0.52,
    dbhAt10m: 14,
  },
  {
    id: 'douglas',
    name: tl('species.077'),
    english: 'Coast Douglas-fir',
    scientific: 'Pseudotsuga menziesii',
    typicalM: '60–75',
    maxM: 99.7,
    targetM: 100,
    record: tl('species.078'),
    source: { label: tl('species.079'), url: 'https://en.wikipedia.org/wiki/Doerner_Fir' },
    form: 'cone',
    blurb: tl('species.080'),
    stages: [tl('species.081'), tl('species.082'), tl('species.083'), tl('species.084'), tl('species.085')],
    realTauYears: 90,
    woodDensity: 0.48,
    dbhAt10m: 15,
  },
];

export function speciesDef(id: SpeciesId | string | undefined): SpeciesDef {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0]!;
}

/** Default pick in the planting screen. */
export function defaultSpecies(): SpeciesId {
  return SPECIES[0]!.id;
}

/** 紀錄高度 R (cm) for a species: its record height rounded to the nearest 10 m. */
export function speciesTargetCm(id: SpeciesId | string | undefined): number {
  return speciesDef(id).targetM * 100;
}

/**
 * Equivalent real-world age in days for this height of the chosen species.
 * Height follows H = R (1 − e^(−t/τ)); past 99% of R, age keeps rising linearly so it stays finite.
 */
export function realAgeDays(heightCm: number, id: SpeciesId | string | undefined): number {
  const sp = speciesDef(id);
  const share = Math.max(0, heightCm) / (sp.targetM * 100);
  if (share <= 0) return 0;
  const tau = sp.realTauYears;
  const years = share < 0.99 ? -tau * Math.log(1 - share) : tau * (Math.log(100) + (share - 0.99));
  return Math.max(0, Math.round(years * 365));
}

/** Record height rounded to the nearest 10 m (how targetM is derived). */
export function roundTo10(m: number): number {
  return Math.round(m / 10) * 10;
}

/** Growth stage index 0–4 for a height, relative to R. */
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
