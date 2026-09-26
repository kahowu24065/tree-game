import { NORMAL_PAST_DAYS } from './balance';
import { addDays } from './dates';
import { isColdDay, isHotDay, type TempInput } from './events';
import { hkoIconLabel, hkoIconRain, hkoIconToWmo, isHkoIcon, rainFromPsr, timeoutSignal, windFromText, type HkoData, type HkoWarning } from './hko';
import type { CurrentWeather, DayCond, ForecastDay, LocationSource, StormKind } from './types';

export const HK_LAT = 22.3022;
export const HK_LON = 114.1744;

/** Where the numbers came from: Open-Meteo model data, HKO observations/forecast, or the built-in simulation. */
export type WeatherProvider = 'open-meteo' | 'hko' | 'sim';

export interface WeatherSnapshot {
  lat: number;
  lon: number;
  timezone: string;
  place: string;
  source: LocationSource;
  origin: 'live' | 'cache' | 'offline';
  fetchedAt: number;
  current: CurrentWeather;
  daily: ForecastDay[];
  error?: string;
  provider?: WeatherProvider;
  /** HKO warnings, readings and 9-day forecast when the player is in or near Hong Kong. */
  hko?: HkoData | null;
  /** Condition text from HKO (e.g. 間有陽光) when it describes the current weather better than the model code. */
  conditionText?: string;
  /** HKO station the temperature came from. */
  station?: string;
  /** District name used for HKO rainfall (e.g. 沙田). */
  district?: string;
  /** Hours until rain is expected in the next 6 h (0 = now), from Open-Meteo hourly data. */
  rainInHours?: number | null;
  /** Next hours from Open-Meteo (for the 12-hour severe-weather countdown). */
  hourly?: HourPoint[];
  /** v15 local normals (average daily min / max of the past 14 days), null when unavailable. */
  normals?: Normals | null;
  /** Location choice this snapshot was made for ('auto' or a PLACES id), so a changed choice refetches. */
  choice?: string;
}

/** Fresh weather is reused for this long before fetching again. */
export const WEATHER_TTL_MS = 30 * 60 * 1000;
/** Older cached weather is still better than simulated weather for this long. */
export const WEATHER_STALE_MS = 3 * 24 * 60 * 60 * 1000;

interface OpenMeteoCurrent {
  temperature_2m?: number;
  relative_humidity_2m?: number;
  precipitation?: number;
  weather_code?: number;
  wind_speed_10m?: number;
  wind_gusts_10m?: number;
  is_day?: number;
  time?: string;
}

interface OpenMeteoDaily {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  sunrise?: string[];
  sunset?: string[];
}

export function inHongKong(lat: number, lon: number): boolean {
  return lat >= 22.13 && lat <= 22.58 && lon >= 113.82 && lon <= 114.45;
}

/** Hong Kong plus Shenzhen/Macau/Pearl River Delta edge, where HKO warnings are still the relevant ones. */
export function nearHongKong(lat: number, lon: number): boolean {
  return lat >= 21.8 && lat <= 22.9 && lon >= 113.3 && lon <= 114.7;
}

export function describePlace(lat: number, lon: number, timezone: string): string {
  if (inHongKong(lat, lon) || timezone === 'Asia/Hong_Kong') return '香港';
  const city = timezone.split('/').pop()?.replaceAll('_', ' ');
  return city || '當地';
}

export function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
}

export function isSnowCode(code: number): boolean {
  return code >= 71 && code <= 77;
}

export function weatherLabel(code: number): string {
  if (code === 0) return '天晴';
  if (code === 1) return '大致天晴';
  if (code === 2) return '間有陽光';
  if (code === 3) return '陰天';
  if (code === 45 || code === 48) return '有霧';
  if (code >= 51 && code <= 55) return '微雨';
  if (code === 61 || code === 80) return '小雨';
  if (code === 63 || code === 81) return '中雨';
  if (code === 65 || code === 82) return '大雨';
  if (isSnowCode(code)) return '落雪';
  if (code >= 95) return '雷暴';
  if (isRainCode(code)) return '有雨';
  return '多雲';
}

/** Condition wording for a forecast row: HKO's own words when it covers the day. */
export function dayLabel(day: Pick<ForecastDay, 'code' | 'hkoIcon'>): string {
  return day.hkoIcon !== undefined ? hkoIconLabel(day.hkoIcon) || weatherLabel(day.code) : weatherLabel(day.code);
}

/**
 * Put HKO's icon on every day it covers (9-day forecast by date, today from the latest
 * observation icon) so the forecast list agrees with the Observatory and the weather card.
 * Numbers (temperature, rain, gusts) stay as they are.
 */
export function withHkoDays(daily: ForecastDay[], hko: HkoData | null | undefined, today: string): ForecastDay[] {
  if (!hko) return daily;
  const byDate = new Map(hko.forecast.map((d) => [d.date, d.icon]));
  const nowIcon = hko.current?.icon;
  return daily.map((day) => {
    const icon = day.date === today && isHkoIcon(nowIcon) ? nowIcon : byDate.get(day.date);
    if (!isHkoIcon(icon)) return day;
    return { ...day, hkoIcon: icon, code: hkoIconToWmo(icon) };
  });
}

export function windWords(kmh: number): string {
  if (kmh < 12) return '微風';
  if (kmh < 30) return '和風';
  if (kmh < 41) return '清勁';
  if (kmh < 63) return '強風';
  if (kmh < 88) return '烈風';
  return '暴風';
}

export interface Severity {
  heavyRain: boolean;
  gale: boolean;
  typhoon: boolean;
  heat: boolean;
  /** v15 寒冷 (outside HK only; HK uses the HKO warning). */
  cold: boolean;
  stormKind: StormKind | null;
}

/** Game thresholds, not official Hong Kong Observatory warnings. v15: heat / cold follow isHotDay / isColdDay. */
export function classify(input: { precipMm: number; gustKmh: number; windKmh: number } & TempInput): Severity {
  const typhoon = input.gustKmh >= 118 || input.windKmh >= 63;
  const gale = !typhoon && (input.gustKmh >= 62 || input.windKmh >= 41);
  const heavyRain = input.precipMm >= 25;
  const heat = isHotDay(input);
  const cold = isColdDay(input);
  let stormKind: StormKind | null = null;
  if (typhoon) stormKind = 'typhoon';
  else if (gale) stormKind = 'gale';
  else if (heavyRain) stormKind = 'heavy-rain';
  return { heavyRain, gale, typhoon, heat, cold, stormKind };
}

export function stormLabel(kind: StormKind): string {
  if (kind === 'typhoon') return '颱風';
  if (kind === 'gale') return '強風';
  return '暴雨';
}

export function condFromForecast(day: ForecastDay, tempC = day.tempMax): DayCond {
  const severity = classify(day);
  // When HKO covers the day, trust its icon for "is it a rainy day" so the scene never
  // shows rain on a day the Observatory calls fine (the model's mm figures stay as numbers).
  const raining =
    day.hkoIcon !== undefined
      ? hkoIconRain(day.hkoIcon)
      : day.precipMm >= 0.5 || isRainCode(day.code) || isSnowCode(day.code);
  return {
    code: day.code,
    tempC,
    tempMax: day.tempMax,
    precipMm: day.precipMm,
    windKmh: day.windKmh,
    gustKmh: day.gustKmh,
    hot: severity.heat || isHotDay({ ...day, tempMax: tempC }),
    cold: severity.cold,
    raining,
    stormKind: severity.stormKind,
  };
}

export function mildDay(date: string): ForecastDay {
  return {
    date,
    code: 2,
    tempMax: 28,
    tempMin: 23,
    precipMm: 0,
    precipProb: 10,
    windKmh: 12,
    gustKmh: 20,
    sunrise: `${date}T06:10`,
    sunset: `${date}T18:25`,
  };
}

export function syntheticWeek(today: string): ForecastDay[] {
  return Array.from({ length: 7 }, (_, i) => mildDay(addDays(today, i)));
}

export function offlineSnapshot(today: string, error: string): WeatherSnapshot {
  const daily = syntheticWeek(today);
  return {
    lat: HK_LAT,
    lon: HK_LON,
    timezone: 'Asia/Hong_Kong',
    place: '香港',
    source: 'fallback',
    origin: 'offline',
    fetchedAt: 0,
    current: {
      tempC: 26,
      humidity: 70,
      precipMm: 0,
      code: 2,
      windKmh: 12,
      gustKmh: 20,
      isDay: true,
      time: '',
    },
    daily,
    error,
    provider: 'sim',
  };
}

/** The 7 days from today, padding any gap with a mild placeholder day. */
export function presentForecast(daily: ForecastDay[], today: string): ForecastDay[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    if (!byDate.has(date)) byDate.set(date, mildDay(date));
  }
  return [...byDate.values()]
    .filter((d) => d.date >= today && d.date <= addDays(today, 6))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function currentFromDay(day: ForecastDay): CurrentWeather {
  return {
    tempC: Math.round((day.tempMax + day.tempMin) / 2),
    humidity: 70,
    precipMm: day.precipMm > 2 ? Math.min(8, day.precipMm / 6) : 0,
    code: day.code,
    windKmh: day.windKmh,
    gustKmh: day.gustKmh,
    isDay: true,
    time: '',
  };
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export interface HourPoint {
  time: string;
  precipMm: number;
  code: number;
  gustKmh: number;
}

/** v15 local normals: average daily min / max over the past days Open-Meteo returned (null = no data). */
export interface Normals {
  min: number | null;
  max: number | null;
  days: number;
}

export interface ForecastResult {
  timezone: string;
  normals?: Normals | null;
  current: CurrentWeather;
  daily: ForecastDay[];
  rainInHours: number | null;
  hourly?: HourPoint[];
}

interface OpenMeteoHourly {
  time?: string[];
  precipitation?: number[];
  weather_code?: number[];
  wind_gusts_10m?: number[];
}

/** First hour (0-5) from the current hour on where rain is expected, or null. */
export function rainSoon(hourly: OpenMeteoHourly | undefined, nowIso: string): number | null {
  const times = hourly?.time ?? [];
  if (!times.length) return null;
  const hour = nowIso.slice(0, 13);
  let start = times.findIndex((t) => t.slice(0, 13) === hour);
  if (start < 0) start = 0;
  for (let i = 0; i < 6 && start + i < times.length; i++) {
    const mm = num(hourly?.precipitation?.[start + i], 0);
    const code = num(hourly?.weather_code?.[start + i], 0);
    if (mm >= 0.3 || (isRainCode(code) && code >= 61)) return i;
  }
  return null;
}

export function parseOpenMeteo(data: unknown): ForecastResult {
  if (!data || typeof data !== 'object') throw new Error('天氣資料格式不對');
  const body = data as { timezone?: string; current?: OpenMeteoCurrent; daily?: OpenMeteoDaily; hourly?: OpenMeteoHourly };
  const daily = body.daily;
  const dates = daily?.time ?? [];
  if (!dates.length) throw new Error('沒有預報');
  const all: ForecastDay[] = dates.map((date, i) => ({
    date,
    code: num(daily?.weather_code?.[i], 2),
    tempMax: num(daily?.temperature_2m_max?.[i], 28),
    tempMin: num(daily?.temperature_2m_min?.[i], 23),
    precipMm: num(daily?.precipitation_sum?.[i], 0),
    precipProb: num(daily?.precipitation_probability_max?.[i], 0),
    windKmh: num(daily?.wind_speed_10m_max?.[i], 10),
    gustKmh: num(daily?.wind_gusts_10m_max?.[i], 16),
    sunrise: daily?.sunrise?.[i] || `${date}T06:10`,
    sunset: daily?.sunset?.[i] || `${date}T18:25`,
  }));
  const current = body.current ?? {};
  // v15: past_days=14 puts the last two weeks first; they only feed the local normals.
  const todayIso = (current.time ?? '').slice(0, 10);
  let first = todayIso ? all.findIndex((d) => d.date >= todayIso) : -1;
  if (first < 0) first = Math.max(0, all.length - 7);
  const days = all.slice(first);
  const avg = (vals: (number | undefined)[] | undefined) => {
    const ok = (vals ?? []).slice(0, first).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    return ok.length ? Math.round((ok.reduce((a, b) => a + b, 0) / ok.length) * 10) / 10 : null;
  };
  const normals: Normals | null = first > 0 ? { min: avg(daily?.temperature_2m_min), max: avg(daily?.temperature_2m_max), days: first } : null;
  return {
    timezone: body.timezone || 'Asia/Hong_Kong',
    normals: normals && (normals.min !== null || normals.max !== null) ? normals : null,
    current: {
      tempC: num(current.temperature_2m, days[0]?.tempMax ?? 26),
      humidity: num(current.relative_humidity_2m, 70),
      precipMm: num(current.precipitation, 0),
      code: num(current.weather_code, days[0]?.code ?? 2),
      windKmh: num(current.wind_speed_10m, days[0]?.windKmh ?? 10),
      gustKmh: num(current.wind_gusts_10m, days[0]?.gustKmh ?? 16),
      isDay: current.is_day !== 0,
      time: current.time ?? '',
    },
    daily: days,
    rainInHours: rainSoon(body.hourly, current.time ?? ''),
    hourly: (body.hourly?.time ?? []).map((time, i) => ({
      time,
      precipMm: num(body.hourly?.precipitation?.[i], 0),
      code: num(body.hourly?.weather_code?.[i], 0),
      gustKmh: num(body.hourly?.wind_gusts_10m?.[i], 0),
    })),
  };
}

export function forecastUrl(lat: number, lon: number): string {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day');
  url.searchParams.set('hourly', 'precipitation,weather_code,wind_gusts_10m');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('past_days', String(NORMAL_PAST_DAYS));
  url.searchParams.set('forecast_hours', '12');
  url.searchParams.set('wind_speed_unit', 'kmh');
  return url.toString();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Open-Meteo forecast with up to 3 tries (backs off on 429/5xx/network errors, honours Retry-After up to 8 s). */
export async function fetchForecast(lat: number, lon: number, opts: { tries?: number; timeoutMs?: number } = {}): Promise<ForecastResult> {
  const url = forecastUrl(lat, lon);
  const tries = opts.tries ?? 3;
  let lastError = '天氣服務冇回應';
  let wait = 0;
  for (let attempt = 0; attempt < tries; attempt++) {
    if (attempt > 0) await sleep(wait || 1000 * 3 ** (attempt - 1));
    wait = 0;
    let res: Response;
    try {
      res = await fetch(url, { signal: timeoutSignal(opts.timeoutMs ?? 8000) });
    } catch {
      lastError = '連唔到天氣服務';
      continue;
    }
    if (res.ok) return parseOpenMeteo(await res.json());
    lastError = res.status === 429 ? '天氣服務暫時太繁忙（429）' : `天氣服務回應 ${res.status}`;
    const retryAfter = Number(res.headers.get('retry-after'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) wait = Math.min(8000, retryAfter * 1000);
    if (res.status !== 429 && res.status < 500) break;
  }
  throw new Error(lastError);
}

/** Build a forecast purely from HKO (used when Open-Meteo is unreachable but HKO answers). */
export function hkoForecast(hko: HkoData, today: string): ForecastResult | null {
  if (!hko.current && !hko.forecast.length) return null;
  const nowTemp = hko.current?.tempC ?? hko.forecast[0]?.tempMax ?? 28;
  const nowCode = hko.current?.icon ? hkoIconToWmo(hko.current.icon) : 2;
  const days: ForecastDay[] = [];
  const first = hko.forecast[0];
  if (!first || first.date > today) {
    days.push({
      date: today,
      code: nowCode,
      hkoIcon: isHkoIcon(hko.current?.icon) ? hko.current!.icon : undefined,
      tempMax: Math.max(nowTemp, first ? first.tempMax - 1 : nowTemp),
      tempMin: Math.min(nowTemp, first ? first.tempMin : nowTemp - 4),
      precipMm: 0,
      precipProb: 10,
      windKmh: 12,
      gustKmh: 20,
      sunrise: `${today}T06:10`,
      sunset: `${today}T18:25`,
    });
  }
  for (const d of hko.forecast) {
    if (d.date < today) continue;
    const rain = rainFromPsr(d.psr);
    const wind = windFromText(d.wind);
    days.push({
      date: d.date,
      code: hkoIconToWmo(d.icon),
      hkoIcon: isHkoIcon(d.icon) ? d.icon : undefined,
      tempMax: d.tempMax,
      tempMin: d.tempMin,
      precipMm: rain.mm,
      precipProb: rain.prob,
      windKmh: wind,
      gustKmh: Math.round(wind * 1.5),
      sunrise: `${d.date}T06:10`,
      sunset: `${d.date}T18:25`,
    });
  }
  const rainNow = hko.current ? Math.max(0, ...Object.values(hko.current.rainByDistrict)) : 0;
  return {
    timezone: 'Asia/Hong_Kong',
    current: {
      tempC: nowTemp,
      humidity: hko.current?.humidity ?? 70,
      precipMm: rainNow > 0 ? Math.min(8, rainNow) : 0,
      code: nowCode,
      windKmh: 12,
      gustKmh: 20,
      isDay: true,
      time: hko.current?.updated ?? '',
    },
    daily: days.slice(0, 7),
    rainInHours: null,
  };
}

/** Rainfall in the player's district over the past hour, if HKO reports one. */
export function districtRain(hko: HkoData | null | undefined, district: string | undefined): number | null {
  const table = hko?.current?.rainByDistrict;
  if (!table || !district) return null;
  const bare = district.replace(/區$/, '');
  for (const key of [district, bare, `${bare}區`]) if (key in table) return table[key] ?? 0;
  return null;
}

/**
 * v15: mark forecast days with the region and local normals, so dayEvent / classify / currentEvents use the
 * outside-HK heat & cold rules. HK days are left as they are (HK rules).
 */
export function stampDays(days: ForecastDay[], intl: boolean, normals: Normals | null | undefined): ForecastDay[] {
  if (!intl) return days.map(({ intl: _i, normMin: _a, normMax: _b, ...d }) => d);
  return days.map((d) => ({ ...d, intl: true, normMin: normals?.min ?? null, normMax: normals?.max ?? null }));
}

export function activeHot(warnings: HkoWarning[] | undefined): boolean {
  return Boolean(warnings?.some((w) => w.group === 'WHOT'));
}

export function locate(timeoutMs = 8000): Promise<{ lat: number; lon: number; source: LocationSource }> {
  const fallback = { lat: HK_LAT, lon: HK_LON, source: 'fallback' as const };
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(fallback);
  const ask = () => new Promise<{ lat: number; lon: number; source: LocationSource }>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'geo' });
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
      { enableHighAccuracy: false, timeout: timeoutMs - 500, maximumAge: 30 * 60 * 1000 },
    );
  });
  // Skip the wait entirely when the player has already said no.
  const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
  if (!perms?.query) return ask();
  return perms
    .query({ name: 'geolocation' as PermissionName })
    .then((status) => (status.state === 'denied' ? fallback : ask()))
    .catch(() => ask());
}
