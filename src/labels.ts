/**
 * v15 regional weather names. In / near Hong Kong (and when the location falls back to HK) the HKO-style names stay;
 * elsewhere the same events are called 烈風／暴風／大雨／豪雨 and 暴雨疏水 becomes 大雨疏水. Rules are identical.
 */
import { EMERGENCY_NAMES, INTL_LABELS, WEATHER_EVENTS, WX_TRACKS, parseWxAwardId, type WeatherEventId, type WeatherTrackId } from './balance';

export type Region = 'hk' | 'intl';

let current: Region = 'hk';

/** The region used when a label function is called without one (set by main.ts from the weather snapshot). */
export function setLabelRegion(region: Region): void {
  current = region;
}

export function labelRegion(): Region {
  return current;
}

/** Region of a location: HK / near-HK / fallback / chosen HK place = 'hk'; a real GPS fix elsewhere = 'intl'. */
export function regionFor(source: string, nearHk: boolean): Region {
  return source !== 'geo' || nearHk ? 'hk' : 'intl';
}

export function eventLabel(id: WeatherEventId, region: Region = current): string {
  return (region === 'intl' ? INTL_LABELS[id] : undefined) ?? WEATHER_EVENTS[id]?.label ?? id;
}

export type EmergencyId = keyof typeof EMERGENCY_NAMES;

export function emergencyName(id: EmergencyId, region: Region = current): string {
  return EMERGENCY_NAMES[id][region];
}

/** Rewrite HK names inside a sentence (tips, help) for the region. */
export function regionalize(text: string, region: Region = current): string {
  if (region !== 'intl') return text;
  return text
    .replaceAll('酷熱天氣警告', INTL_LABELS.hot!)
    .replaceAll('初級颱風', INTL_LABELS.typhoon1!)
    .replaceAll('高級颱風', INTL_LABELS.typhoon8!)
    .replaceAll('暴雨', INTL_LABELS.rainstorm!)
    .replaceAll('黑雨', INTL_LABELS.blackrain!);
}

export function weatherTrack(id: WeatherTrackId) {
  return WX_TRACKS.find((t) => t.id === id)!;
}

export function weatherTrackCopy(id: WeatherTrackId, region: Region = current): { name: string; detail: string } {
  const track = weatherTrack(id);
  const name = region === 'intl' && 'intlName' in track && track.intlName ? track.intlName : track.name;
  const detail = region === 'intl' ? regionalize('intlDetail' in track && track.intlDetail ? track.intlDetail : track.detail, 'intl') : track.detail;
  return { name, detail };
}

/** Title for an achievement claimed at a count, e.g. 捱過 5 個風暴. */
export function weatherAchievementCopy(id: string, region: Region = current): { title: string; detail: string } {
  const parsed = parseWxAwardId(id);
  const trackId = parsed?.track ?? 'storm';
  const count = parsed?.count ?? 0;
  const track = weatherTrack(trackId);
  const { name, detail } = weatherTrackCopy(trackId, region);
  return { title: `捱過 ${count} ${track.unit}${name}`, detail };
}
