/** Reverse geocoding via BigDataCloud's free client-side endpoint (CORS-enabled, no key). Cached per ~1 km. */
import { timeoutSignal } from './hko';

const KEY = 'yiri-yisyu-place-names';

export interface PlaceName {
  name: string;
  district?: string;
}

interface BdcAdmin {
  name?: string;
  adminLevel?: number;
  order?: number;
}

export function parseBigDataCloud(data: unknown): PlaceName | null {
  if (!data || typeof data !== 'object') return null;
  const body = data as { countryCode?: string; city?: string; locality?: string; principalSubdivision?: string; localityInfo?: { administrative?: BdcAdmin[] } };
  const admins = (body.localityInfo?.administrative ?? []).filter((a) => a.name).sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
  if (body.countryCode === 'HK') {
    const district = admins.find((a) => (a.adminLevel ?? 0) >= 6)?.name;
    return { name: district ?? '香港', district };
  }
  const local = admins.find((a) => (a.adminLevel ?? 0) >= 6 && (a.adminLevel ?? 0) <= 8)?.name;
  const name = body.city || body.locality || local || body.principalSubdivision;
  return name ? { name } : null;
}

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

function readCache(): Record<string, PlaceName> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, PlaceName>;
  } catch {
    return {};
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<PlaceName | null> {
  const key = cacheKey(lat, lon);
  const cache = readCache();
  if (cache[key]) return cache[key];
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=zh-Hant`;
    const res = await fetch(url, { signal: timeoutSignal(6000) });
    if (!res.ok) return null;
    const place = parseBigDataCloud(await res.json());
    if (place) {
      const keys = Object.keys(cache);
      if (keys.length > 20) delete cache[keys[0]!];
      cache[key] = place;
      localStorage.setItem(KEY, JSON.stringify(cache));
    }
    return place;
  } catch {
    return null;
  }
}
