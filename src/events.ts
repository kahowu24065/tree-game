/** Real weather → the game's weather events (設計書「天氣與災害權重表」). */
import { WEATHER_EVENTS, type WeatherEventId } from './balance';
import { hkoIconRain, type HkoWarning } from './hko';
import { pickEvent } from './rules';
import type { CurrentWeather, DayCond, ForecastDay } from './types';
import { isRainCode, type HourPoint } from './weather';

/**
 * HKO warnings: 酷熱天氣警告 → 酷熱; 黃／紅雨 → 暴雨; 黑雨 → 黑雨; 雷暴警告或強烈季候風 → 狂風雷暴;
 * 一號／三號風球 → 初級颱風; 八號或以上 → 高級颱風.
 */
export function hkoWarningEvents(warnings: readonly HkoWarning[] | undefined): WeatherEventId[] {
  const out = new Set<WeatherEventId>();
  for (const w of warnings ?? []) {
    if (w.group === 'WHOT') out.add('hot');
    else if (w.group === 'WRAIN') out.add(w.code === 'WRAINB' ? 'blackrain' : 'rainstorm');
    else if (w.group === 'WTS' || w.group === 'WMSGNL') out.add('thunder');
    else if (w.group === 'WTCSGNL') out.add(/^TC(1|3)$/.test(w.code) ? 'typhoon1' : 'typhoon8');
  }
  return [...out];
}

/** Model numbers (Open-Meteo, anywhere in the world) → event. Wind first, then rain, then heat. */
export function eventFromNumbers(input: { code: number; precipMm: number; gustKmh: number; windKmh: number; tempMax: number }): WeatherEventId {
  if (input.gustKmh >= 118 || input.windKmh >= 63) return 'typhoon8';
  if (input.gustKmh >= 88 || input.windKmh >= 50) return 'typhoon1';
  if (input.code >= 95 || input.gustKmh >= 62) return 'thunder';
  if (input.precipMm >= 70) return 'blackrain';
  if (input.precipMm >= 25) return 'rainstorm';
  if (input.tempMax >= 33) return 'hot';
  if (input.precipMm >= 0.5 || isRainCode(input.code)) return 'drizzle';
  return 'clear';
}

/**
 * One forecast day → event. When HKO covers the day (hkoIcon set) its icon decides rain vs fine,
 * so the game never calls a day rainy that the Observatory calls fine; wind storms still come from gusts.
 */
export function dayEvent(day: ForecastDay): WeatherEventId {
  if (day.hkoIcon === undefined) return eventFromNumbers(day);
  const windy = eventFromNumbers({ ...day, precipMm: 0, code: 0, tempMax: 0 });
  if (windy !== 'clear') return windy;
  if (day.hkoIcon === 65) return 'thunder';
  if (day.hkoIcon === 64 && day.precipMm >= 25) return 'rainstorm';
  if (day.tempMax >= 33) return 'hot';
  return hkoIconRain(day.hkoIcon) ? 'drizzle' : 'clear';
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
    const e = eventFromNumbers({ code: c.code, precipMm: c.precipMm * 6, gustKmh: c.gustKmh, windKmh: c.windKmh, tempMax: Math.max(c.tempC, opts.today?.tempMax ?? 0) });
    out.add(e);
    if (opts.today) out.add(dayEvent(opts.today));
  }
  return [...out].filter((e) => e !== 'clear');
}

export function hourEvent(h: HourPoint): WeatherEventId | null {
  if (h.gustKmh >= 118) return 'typhoon8';
  if (h.gustKmh >= 88) return 'typhoon1';
  if (h.code >= 95 || h.gustKmh >= 62) return 'thunder';
  if (h.precipMm >= 30) return 'blackrain';
  if (h.precipMm >= 10) return 'rainstorm';
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
    if (hours <= 12) found.push({ event: opts.manual.event, hours, active: hours === 0, source: '手動預報' });
  }
  const hour = opts.nowIso.slice(0, 13);
  const hourly = opts.hourly ?? [];
  let start = hourly.findIndex((h) => h.time.slice(0, 13) === hour);
  if (start < 0) start = 0;
  for (let i = 0; i <= 12 && start + i < hourly.length; i++) {
    const e = hourEvent(hourly[start + i]!);
    if (e) {
      found.push({ event: e, hours: i, active: false, source: '逐小時預報' });
      break;
    }
  }
  if (opts.tomorrow && opts.minutesToMidnight <= 12 * 60) {
    const e = dayEvent(opts.tomorrow);
    if (WEATHER_EVENTS[e].severe) found.push({ event: e, hours: opts.minutesToMidnight / 60, active: false, source: '明日預報' });
  }
  if (!found.length) return null;
  found.sort((a, b) => a.hours - b.hours || WEATHER_EVENTS[b.event].damage - WEATHER_EVENTS[a.event].damage);
  return found[0]!;
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
      c.raining = true;
      c.code = 95;
      c.windKmh = Math.max(c.windKmh, 45);
      c.gustKmh = Math.max(c.gustKmh, 75);
      c.stormKind = 'gale';
      break;
    case 'typhoon1':
      c.windKmh = Math.max(c.windKmh, 50);
      c.gustKmh = Math.max(c.gustKmh, 85);
      c.stormKind = 'gale';
      if (c.code < 3) c.code = 3;
      break;
    case 'typhoon8':
      c.raining = true;
      c.code = 95;
      c.precipMm = Math.max(c.precipMm, 60);
      c.windKmh = Math.max(c.windKmh, 90);
      c.gustKmh = Math.max(c.gustKmh, 140);
      c.stormKind = 'typhoon';
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
