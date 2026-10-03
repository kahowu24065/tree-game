/**
 * 1.4.48 weather-location presets, grouped by region. Each preset carries its region, so a hand-picked place is routed
 * to the right bureau (HKO / SMG / CWA), warning rules and push flags exactly like a GPS fix there would be.
 */
import { inTaiwan } from './cwa';
import { t as tl, live } from './i18n';
import { inMacau, nearHongKong } from './weather';

export type PresetRegion = 'hk' | 'mo' | 'tw';
/** Where the weather and warnings come from: HKO, SMG, CWA, or (anywhere else) Open-Meteo plus alert feeds. */
export type WeatherRegion = PresetRegion | 'intl';

export interface PlaceOption {
  id: string;
  name: string;
  region: PresetRegion;
  lat: number;
  lon: number;
  /** HK only: HKO rainfall district (rhrread `rainfall.data[].place`, Chinese as the API sends it). */
  rainDistrict?: string;
}

export const PLACE_GROUPS: PresetRegion[] = ['hk', 'mo', 'tw'];

export const PLACES: PlaceOption[] = live(() => ([
  // Hong Kong: HKO. The coordinates pick the nearest HKO temperature station (香港公園, 天文台, 沙田, 赤鱲角).
  { id: 'hk', name: tl('place.hk'), region: 'hk', lat: 22.278, lon: 114.162, rainDistrict: '中西區' },
  { id: 'kowloon', name: tl('place.kowloon'), region: 'hk', lat: 22.302, lon: 114.174, rainDistrict: '油尖旺' },
  { id: 'nt', name: tl('place.nt'), region: 'hk', lat: 22.402, lon: 114.21, rainDistrict: '沙田' },
  { id: 'islands', name: tl('place.islands'), region: 'hk', lat: 22.289, lon: 113.941, rainDistrict: '離島區' },
  // Macau: SMG stations 大炮台, 東亞運大馬路, 路環市區.
  { id: 'mo-peninsula', name: tl('place.mop'), region: 'mo', lat: 22.197, lon: 113.542 },
  { id: 'mo-taipa', name: tl('place.taipa'), region: 'mo', lat: 22.155, lon: 113.556 },
  { id: 'mo-coloane', name: tl('place.coloane'), region: 'mo', lat: 22.124, lon: 113.565 },
  // Taiwan: CWA via the push server (county warnings for 臺北市, 臺中市, 臺南市, 臺東縣).
  { id: 'tw-taipei', name: tl('place.taipei'), region: 'tw', lat: 25.04, lon: 121.56 },
  { id: 'tw-taichung', name: tl('place.taichung'), region: 'tw', lat: 24.15, lon: 120.67 },
  { id: 'tw-tainan', name: tl('place.tainan'), region: 'tw', lat: 22.99, lon: 120.2 },
  { id: 'tw-taitung', name: tl('place.taitung'), region: 'tw', lat: 22.75, lon: 121.15 },
] as PlaceOption[]));

export function findPlace(id: string | null | undefined): PlaceOption | undefined {
  return id ? PLACES.find((p) => p.id === id) : undefined;
}

/** Pre-1.4.48 Hong Kong presets → the new grouped list. 'hk' (now 香港島), 'geo' and '' are kept. */
const OLD_IDS: Record<string, string> = {
  central: 'hk',
  shatin: 'nt',
  taipo: 'nt',
  saikung: 'nt',
  yuenlong: 'nt',
  tungchung: 'islands',
};

export function migratePlaceId(id: string): string {
  return OLD_IDS[id] ?? id;
}

/**
 * Which bureau and rules apply. A preset uses its own region; a GPS fix is placed by its coordinates;
 * the fallback (no location) is Hong Kong. A hand-picked id that is no longer listed stays Hong Kong unless its
 * coordinates are in Macau / Taiwan.
 */
/** 1.4.48 push-server flags for the region in use (the server keys HK / Macau / Taiwan pushes on these, not on GPS). */
export function pushRegionFlags(region: WeatherRegion, area: { county: string; town: string } | null): { isHK: boolean; isMO: boolean; isTW?: true; twCounty?: string; twTown?: string } {
  const out: { isHK: boolean; isMO: boolean; isTW?: true; twCounty?: string; twTown?: string } = { isHK: region === 'hk' || region === 'mo', isMO: region === 'mo' };
  if (region === 'tw') Object.assign(out, { isTW: true as const, twCounty: area?.county || undefined, twTown: area?.town || undefined });
  return out;
}

export function weatherRegion(source: string, lat: number, lon: number, choice?: string | null): WeatherRegion {
  if (source === 'fallback') return 'hk';
  if (source === 'manual') {
    const preset = findPlace(migratePlaceId(choice ?? ''));
    if (preset) return preset.region;
  }
  if (inMacau(lat, lon)) return 'mo';
  if (inTaiwan(lat, lon)) return 'tw';
  if (source !== 'geo') return 'hk';
  return nearHongKong(lat, lon) ? 'hk' : 'intl';
}
