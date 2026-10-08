/** Real weather → the game's weather events (設計書「天氣與災害權重表」). */
import { COLD_ABS_MIN_C, COLD_REL_DROP_C, COLD_REL_MAX_C, HK_HOT_MAX_C, HOT_ABS_MAX_C, HOT_REL_MIN_C, HOT_REL_RISE_C, WEATHER_EVENTS, WX_NUM, WX_OBS, type WeatherEventId } from './balance';
import { hkoIconRain, type HkoWarning } from './hko';
import { pickEvent } from './rules';
import type { CurrentWeather, DayCond, ForecastDay } from './types';
import { isRainCode, type HourPoint } from './weather';
import { t as tl } from './i18n';

/**
 * HKO warnings: 酷熱天氣警告 → 酷熱; 黃／紅雨 → 暴雨; 黑雨 → 黑雨; 雷暴警告或強烈季候風 → 狂風雷暴;
 * 一號／三號風球 → 初級颱風; 八號或以上 → 高級颱風; v15 寒冷天氣警告 → 寒冷; v1.4 山泥傾瀉警告 (WL) → 山泥傾瀉.
 * v1.4.14 Taiwan (中央氣象署, groups TW*, code = group + level; same table as push-server eventsFromCwa):
 * 海上颱風警報 → 初級颱風; 海上陸上颱風警報 → 高級颱風; 大雨 → 暴雨; 豪雨／大豪雨／超大豪雨 → 黑雨;
 * 陸上強風 黃 → 初級颱風、橙 → 狂風雷暴、紅 → 高級颱風; 1.4.15 大雷雨即時訊息 → 狂風雷暴; 低溫 → 寒冷; 高溫資訊 → 酷熱; 濃霧只顯示.
 */
export function hkoWarningEvents(warnings: readonly HkoWarning[] | undefined): WeatherEventId[] {
  const out = new Set<WeatherEventId>();
  for (const w of warnings ?? []) {
    // v1.4.24: a Taiwan alert that has not started, or not for this district, is information only.
    if (w.inactive) continue;
    if (w.group === 'WHOT') out.add('hot');
    else if (w.group === 'WCOLD') out.add('cold');
    else if (w.group === 'WRAIN') out.add(w.code === 'WRAINB' ? 'blackrain' : 'rainstorm');
    else if (w.group === 'WTS' || w.group === 'WMSGNL') out.add('thunder');
    else if (w.group === 'WL') out.add('landslip');
    else if (w.group === 'WTCSGNL') out.add(/^TC(1|3)$/.test(w.code) ? 'typhoon1' : 'typhoon8');
    else {
      const tw = twEvent(w);
      if (tw) out.add(tw);
    }
  }
  return [...out];
}

function twEvent(w: Pick<HkoWarning, 'group' | 'code'>): WeatherEventId | null {
  const level = Number(w.code.replace(/^\D+/, '')) || 1;
  if (w.group === 'TWTY') return level >= 2 ? 'typhoon8' : 'typhoon1';
  if (w.group === 'TWRAIN') return level >= 2 ? 'blackrain' : 'rainstorm';
  if (w.group === 'TWWIND') return level >= 3 ? 'typhoon8' : level === 2 ? 'thunder' : 'typhoon1';
  if (w.group === 'TWTS') return 'thunder';
  if (w.group === 'TWHOT') return 'hot';
  if (w.group === 'TWCOLD') return 'cold';
  return null;
}

/** Temperature inputs for the v15 heat / cold rules. `intl` = outside HK / near-HK; normals from the past 14 days. */
export interface TempInput {
  tempMax: number;
  tempMin?: number;
  intl?: boolean;
  normMax?: number | null;
  normMin?: number | null;
}

const has = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * 酷熱 from numbers. HK / near-HK: the game threshold (≥ 33; HKO WHOT decides whenever HKO data is there).
 * Elsewhere (v15): max ≥ 35, or max ≥ 28 AND ≥ local normal max + 5 (no normals → only the 35 rule).
 */
export function isHotDay(t: TempInput): boolean {
  if (!t.intl) return t.tempMax >= HK_HOT_MAX_C;
  if (t.tempMax >= HOT_ABS_MAX_C) return true;
  return has(t.normMax) && t.tempMax >= HOT_REL_MIN_C && t.tempMax >= t.normMax + HOT_REL_RISE_C;
}

/**
 * 寒冷 from numbers (v15). HK / near-HK: never from numbers — only the HKO 寒冷天氣警告 (WCOLD).
 * Elsewhere: min ≤ 3, or min ≤ 10 AND ≤ local normal min − 8 (no normals → only the 3 rule).
 */
export function isColdDay(t: TempInput): boolean {
  if (!t.intl || !has(t.tempMin)) return false;
  if (t.tempMin <= COLD_ABS_MIN_C) return true;
  return has(t.normMin) && t.tempMin <= COLD_REL_MAX_C && t.tempMin <= t.normMin - COLD_REL_DROP_C;
}

/** Both temperature events of a day (they are separate categories and stack with rain / wind). */
export function tempEvents(t: TempInput): WeatherEventId[] {
  const out: WeatherEventId[] = [];
  if (isHotDay(t)) out.push('hot');
  if (isColdDay(t)) out.push('cold');
  return out;
}

/** Model numbers (Open-Meteo, anywhere in the world) → headline event. Wind first, then rain, then heat, then cold. */
export function eventFromNumbers(input: { code: number; precipMm: number; gustKmh: number; windKmh: number } & TempInput): WeatherEventId {
  if (input.gustKmh >= WX_NUM.typhoon8.gust || input.windKmh >= WX_NUM.typhoon8.wind) return 'typhoon8';
  if (input.gustKmh >= WX_NUM.typhoon1.gust || input.windKmh >= WX_NUM.typhoon1.wind) return 'typhoon1';
  if (input.code >= WX_NUM.thunder.code || input.gustKmh >= WX_NUM.thunder.gust) return 'thunder';
  if (input.precipMm >= WX_NUM.blackrain.mm) return 'blackrain';
  if (input.precipMm >= WX_NUM.rainstorm.mm) return 'rainstorm';
  if (isHotDay(input)) return 'hot';
  if (isColdDay(input)) return 'cold';
  if (input.precipMm >= 0.5 || isRainCode(input.code)) return 'drizzle';
  return 'clear';
}

/**
 * One forecast day → headline event. When HKO covers the day (hkoIcon set) its icon decides rain vs fine,
 * so the game never calls a day rainy that the Observatory calls fine; wind storms still come from gusts.
 */
export function dayEvent(day: ForecastDay): WeatherEventId {
  // A bureau forecast day only contributes drizzle or fine weather. Severe events come from that bureau's warning list.
  if (day.hkoIcon !== undefined) return hkoIconRain(day.hkoIcon) ? 'drizzle' : 'clear';
  return eventFromNumbers(day);
}

/** v15: every event of a forecast day — the headline plus 酷熱／寒冷 when they stack with rain or wind. */
export function dayEvents(day: ForecastDay): WeatherEventId[] {
  const out = new Set<WeatherEventId>([dayEvent(day)]);
  if (day.hkoIcon === undefined) for (const e of tempEvents(day)) out.add(e);
  return [...out];
}

/** Mild part of a day (drizzle or fine) — used next to HKO warnings, which decide the severe events. */
export function mildEvent(day: ForecastDay | undefined): WeatherEventId {
  if (!day) return 'clear';
  if (day.hkoIcon !== undefined) return hkoIconRain(day.hkoIcon) ? 'drizzle' : 'clear';
  return day.precipMm >= 0.5 || isRainCode(day.code) ? 'drizzle' : 'clear';
}

/** Right-now events from live weather. In/near HK the HKO warnings decide the severe ones. */
export function currentEvents(opts: { hk: boolean; warnings?: readonly HkoWarning[]; current: CurrentWeather; today?: ForecastDay }): WeatherEventId[] {
  const out = new Set<WeatherEventId>();
  if (opts.hk && opts.warnings) {
    for (const e of hkoWarningEvents(opts.warnings)) out.add(e);
    if (opts.current.precipMm >= 0.2 || isRainCode(opts.current.code)) out.add('drizzle');
  } else {
    const c = opts.current;
    const d = opts.today;
    const temps: TempInput = {
      tempMax: Math.max(c.tempC, d?.tempMax ?? -Infinity),
      tempMin: Math.min(c.tempC, d?.tempMin ?? Infinity),
      intl: d?.intl,
      normMax: d?.normMax,
      normMin: d?.normMin,
    };
    out.add(eventFromNumbers({ code: c.code, precipMm: c.precipMm * 6, gustKmh: c.gustKmh, windKmh: c.windKmh, ...temps }));
    for (const e of tempEvents(temps)) out.add(e);
    if (d) for (const e of dayEvents(d)) out.add(e);
  }
  return [...out].filter((e) => e !== 'clear');
}

/**
 * 1.4.26 how a place's severe weather is decided:
 *  • 'official' — HK / Macau / Taiwan (by location): only HKO / SMG / CWA warnings actually issued;
 *  • 'feed'     — an official alert feed covers the place (US NWS, Canada ECCC, Japan JMA, Europe MeteoAlarm): only
 *                 those issued alerts;
 *  • 'observed' — no feed (e.g. mainland China): observed numbers (elapsed hours + live reading), never forecasts.
 */
export type EventMode = 'official' | 'feed' | 'observed';

/** Live reading as an hour-like point (15-minute rain → hourly rate). */
function currentAsHour(c: CurrentWeather): HourPoint {
  return { time: c.time, precipMm: c.precipMm * WX_OBS.currentToHour, code: c.code, gustKmh: c.gustKmh, windKmh: c.windKmh };
}

/**
 * 1.4.26 events from OBSERVED numbers ('observed' mode only): completed hours (oldest first) plus, optionally, the live
 * reading as the latest point. 黑雨 ≥ 70 mm in an hour or ≥ 100 mm in 3 hours; 暴雨 ≥ 30 mm in an hour; 高級 mean
 * wind ≥ 63 km/h for 2 hours running or a gust ≥ 118; 初級 ≥ 41 for 2 hours or a gust ≥ 88; 雷暴 = thunderstorm code.
 */
export function observedEvents(hours: readonly HourPoint[], current?: CurrentWeather): WeatherEventId[] {
  const pts = [...hours].sort((a, b) => a.time.localeCompare(b.time));
  if (current) pts.push(currentAsHour(current));
  const out = new Set<WeatherEventId>();
  const sustained = (min: number) => {
    for (let i = 1; i < pts.length; i++) {
      let ok = true;
      for (let k = 0; k < WX_OBS.windHours; k++) if (!((pts[i - k]?.windKmh ?? 0) >= min)) ok = false;
      if (ok && i + 1 >= WX_OBS.windHours) return true;
    }
    return false;
  };
  const gust = Math.max(0, ...pts.map((h) => h.gustKmh));
  if (gust >= WX_OBS.typhoon8.gust || sustained(WX_OBS.typhoon8.wind)) out.add('typhoon8');
  else if (gust >= WX_OBS.typhoon1.gust || sustained(WX_OBS.typhoon1.wind)) out.add('typhoon1');
  if (pts.some((h) => h.code >= WX_OBS.thunderCode)) out.add('thunder');
  const rain = observedRainLevel(pts);
  if (rain) out.add(rain);
  if (current ? current.precipMm >= 0.2 || isRainCode(current.code) : pts.some((h) => h.precipMm >= 0.5)) out.add('drizzle');
  return [...out];
}

function observedRainLevel(pts: readonly HourPoint[]): WeatherEventId | null {
  const max = Math.max(0, ...pts.map((h) => h.precipMm));
  let max3 = 0;
  for (let i = 0; i < pts.length; i++) max3 = Math.max(max3, pts.slice(Math.max(0, i - 2), i + 1).reduce((s, h) => s + h.precipMm, 0));
  if (max >= WX_OBS.blackrain.mmHour || max3 >= WX_OBS.blackrain.mm3h) return 'blackrain';
  if (max >= WX_OBS.rainstorm.mmHour) return 'rainstorm';
  return null;
}

/** Completed Open-Meteo hours that belong to `date` (local), oldest first. */
export function hoursOfDate(hours: readonly HourPoint[] | undefined, date: string): HourPoint[] {
  return (hours ?? []).filter((h) => h.time.slice(0, 10) === date);
}

/**
 * v1.4.24: rain actually happening now — official rain warnings / alerts in force, or the live reading itself. Never the
 * day's forecast: only this counts for 水分 (rain water, no-loss rain day). 1.4.26: `official` = warnings or feed alerts
 * decide heavy rain (`events` = their game events); otherwise the observed hours of today + the live reading.
 */
export function observedRainEvents(opts: { hk: boolean; warnings?: readonly HkoWarning[]; current: CurrentWeather; events?: readonly WeatherEventId[]; hours?: readonly HourPoint[] }): WeatherEventId[] {
  const out = new Set<WeatherEventId>();
  const c = opts.current;
  if (opts.hk) {
    for (const e of opts.events ?? hkoWarningEvents(opts.warnings)) if (e === 'rainstorm' || e === 'blackrain') out.add(e);
  } else {
    const level = observedRainLevel([...(opts.hours ?? []), currentAsHour(c)]);
    if (level) out.add(level);
  }
  if (c.precipMm >= 0.2 || isRainCode(c.code)) out.add('drizzle');
  return [...out];
}

/** Hour → severe event (forecast hours: a heads-up only, never a game event). Same numbers as WX_OBS. */
export function hourEvent(h: HourPoint): WeatherEventId | null {
  if (h.gustKmh >= WX_OBS.typhoon8.gust || (h.windKmh ?? 0) >= WX_OBS.typhoon8.wind) return 'typhoon8';
  if (h.gustKmh >= WX_OBS.typhoon1.gust || (h.windKmh ?? 0) >= WX_OBS.typhoon1.wind) return 'typhoon1';
  if (h.code >= WX_OBS.thunderCode) return 'thunder';
  if (h.precipMm >= WX_OBS.blackrain.mmHour) return 'blackrain';
  if (h.precipMm >= WX_OBS.rainstorm.mmHour) return 'rainstorm';
  return null;
}

export interface Countdown {
  event: WeatherEventId;
  /** Hours until it starts (0 = in force now). */
  hours: number;
  active: boolean;
  source: string;
}

/** Earliest severe event in the next 12 hours (or one already in force). */
export function severeCountdown(opts: {
  nowEvents: readonly WeatherEventId[];
  hourly?: readonly HourPoint[];
  nowIso: string;
  tomorrow?: ForecastDay;
  minutesToMidnight: number;
  manual?: { event: WeatherEventId; at: number } | null;
  nowMs: number;
  /** Label for an event already in force (e.g. 天文台, 即時天氣, 手動天氣). */
  activeSource: string;
}): Countdown | null {
  const active = pickEvent(opts.nowEvents.filter((e) => WEATHER_EVENTS[e].severe));
  if (active !== 'clear') return { event: active, hours: 0, active: true, source: opts.activeSource };
  const found: Countdown[] = [];
  if (opts.manual) {
    const hours = Math.max(0, (opts.manual.at - opts.nowMs) / 3600000);
    if (hours <= 12) found.push({ event: opts.manual.event, hours, active: hours === 0, source: tl('events.001') });
  }
  const hour = opts.nowIso.slice(0, 13);
  const hourly = opts.hourly ?? [];
  let start = hourly.findIndex((h) => h.time.slice(0, 13) === hour);
  if (start < 0) start = 0;
  for (let i = 0; i <= 12 && start + i < hourly.length; i++) {
    const e = hourEvent(hourly[start + i]!);
    if (e) {
      found.push({ event: e, hours: i, active: false, source: tl('events.002') });
      break;
    }
  }
  if (opts.tomorrow && opts.minutesToMidnight <= 12 * 60) {
    const e = dayEvent(opts.tomorrow);
    if (WEATHER_EVENTS[e].severe) found.push({ event: e, hours: opts.minutesToMidnight / 60, active: false, source: tl('events.003') });
  }
  if (!found.length) return null;
  found.sort((a, b) => a.hours - b.hours || WEATHER_EVENTS[b.event].damage - WEATHER_EVENTS[a.event].damage);
  return found[0]!;
}

/** Heavier rain wins. 毛毛雨 has no category, so it is listed here rather than in WX_CATEGORY_ORDER. */
const SCENE_RAIN: WeatherEventId[] = ['blackrain', 'rainstorm', 'drizzle'];

/**
 * Scene conditions for the day's events. The headline (highest damage) sets wind and sky.
 * 毛毛雨／暴雨／黑雨 still add rain when a wind or landslide headline would otherwise hide it.
 * A wind stormKind (颱風／狂風) is kept, so those warnings do not rain unless a rain event is also on.
 */
export function sceneCond(base: DayCond, events: readonly WeatherEventId[], opts?: { manual?: boolean }): DayCond {
  const headline = pickEvent(events);
  let c = headline === 'clear' && !opts?.manual ? { ...base } : condForEvent(base, headline);
  const rain = SCENE_RAIN.find((id) => events.includes(id));
  if (!rain || rain === headline) return c;
  const wind = c.stormKind === 'typhoon' || c.stormKind === 'gale' ? c.stormKind : null;
  c = condForEvent(c, rain);
  if (wind) c.stormKind = wind;
  return c;
}

/** Scene conditions for an event (rain, wind, sky) layered on the real day. */
export function condForEvent(base: DayCond, event: WeatherEventId): DayCond {
  const c = { ...base };
  switch (event) {
    case 'hot':
      c.hot = true;
      c.tempMax = Math.max(c.tempMax, 34);
      c.tempC = Math.max(c.tempC, 33);
      break;
    case 'cold':
      // Flags only: real weather keeps the measured temperature (manual weather lowers it in main.ts).
      c.cold = true;
      c.hot = false;
      break;
    case 'drizzle':
      c.raining = true;
      c.precipMm = Math.max(c.precipMm, 2);
      if (c.code < 51) c.code = 61;
      break;
    case 'rainstorm':
    case 'blackrain':
      c.raining = true;
      c.precipMm = Math.max(c.precipMm, event === 'blackrain' ? 80 : 40);
      c.code = 65;
      c.stormKind = 'heavy-rain';
      break;
    case 'thunder':
      // 狂風雷暴唔一定落雨：只加強風，唔覆蓋本身有冇雨。
      c.windKmh = Math.max(c.windKmh, 45);
      c.gustKmh = Math.max(c.gustKmh, 75);
      c.stormKind = 'gale';
      c.thunder = true;
      break;
    case 'landslip':
      // 山泥傾瀉警告唔等於落緊雨，場景跟返本來嘅天氣。
      break;
    case 'typhoon1':
      c.windKmh = Math.max(c.windKmh, 50);
      c.gustKmh = Math.max(c.gustKmh, 85);
      c.stormKind = 'gale';
      if (c.code < 3) c.code = 3;
      break;
    case 'typhoon8':
      c.windKmh = Math.max(c.windKmh, 90);
      c.gustKmh = Math.max(c.gustKmh, 140);
      c.stormKind = 'typhoon';
      if (c.code < 3) c.code = 3;
      break;
    default:
      c.raining = false;
      c.hot = false;
      c.precipMm = 0;
      c.stormKind = null;
      if (c.code > 3) c.code = 2;
      break;
  }
  return c;
}
