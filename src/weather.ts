import { addDays } from './dates';
import type { CurrentWeather, DayCond, ForecastDay, LocationSource, SceneOverride, Storm, StormKind } from './types';

export const HK_LAT = 22.3022;
export const HK_LON = 114.1744;

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
}

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
  stormKind: StormKind | null;
}

/** Game thresholds, not official Hong Kong Observatory warnings. */
export function classify(input: { precipMm: number; gustKmh: number; windKmh: number; tempMax: number }): Severity {
  const typhoon = input.gustKmh >= 118 || input.windKmh >= 63;
  const gale = !typhoon && (input.gustKmh >= 62 || input.windKmh >= 41);
  const heavyRain = input.precipMm >= 25;
  const heat = input.tempMax >= 33;
  let stormKind: StormKind | null = null;
  if (typhoon) stormKind = 'typhoon';
  else if (gale) stormKind = 'gale';
  else if (heavyRain) stormKind = 'heavy-rain';
  return { heavyRain, gale, typhoon, heat, stormKind };
}

export function stormLabel(kind: StormKind): string {
  if (kind === 'typhoon') return '颱風';
  if (kind === 'gale') return '強風';
  return '暴雨';
}

export function condFromForecast(day: ForecastDay, tempC = day.tempMax): DayCond {
  const severity = classify({
    precipMm: day.precipMm,
    gustKmh: day.gustKmh,
    windKmh: day.windKmh,
    tempMax: day.tempMax,
  });
  const raining = day.precipMm >= 0.5 || isRainCode(day.code) || isSnowCode(day.code);
  return {
    code: day.code,
    tempC,
    tempMax: day.tempMax,
    precipMm: day.precipMm,
    windKmh: day.windKmh,
    gustKmh: day.gustKmh,
    hot: severity.heat || tempC >= 33,
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
  };
}

export function overrideDay(day: ForecastDay, scene: SceneOverride): ForecastDay {
  switch (scene) {
    case 'clear':
      return { ...day, code: 0, precipMm: 0, precipProb: 0, windKmh: 8, gustKmh: 14, tempMax: 28, tempMin: 23 };
    case 'rain':
      return { ...day, code: 61, precipMm: 8, precipProb: 80, windKmh: 16, gustKmh: 28, tempMax: 24, tempMin: 22 };
    case 'heat':
      return { ...day, code: 0, precipMm: 0, precipProb: 0, windKmh: 10, gustKmh: 18, tempMax: 35, tempMin: 29 };
    case 'heavyrain':
      return { ...day, code: 65, precipMm: 70, precipProb: 95, windKmh: 28, gustKmh: 45, tempMax: 25, tempMin: 22 };
    case 'gale':
      return { ...day, code: 3, precipMm: 4, precipProb: 40, windKmh: 55, gustKmh: 85, tempMax: 26, tempMin: 23 };
    case 'typhoon':
      return { ...day, code: 95, precipMm: 120, precipProb: 100, windKmh: 100, gustKmh: 150, tempMax: 27, tempMin: 24 };
  }
}

export function mergeStorm(day: ForecastDay, storm: Storm | undefined): ForecastDay {
  if (!storm || storm.resolved) return day;
  return {
    ...day,
    precipMm: Math.max(day.precipMm, storm.rainMm),
    gustKmh: Math.max(day.gustKmh, storm.gustKmh),
    windKmh: Math.max(day.windKmh, storm.windKmh),
    precipProb: Math.max(day.precipProb, storm.kind === 'gale' ? 50 : 90),
    code: storm.kind === 'typhoon' ? 95 : storm.kind === 'heavy-rain' ? Math.max(day.code, 65) : day.code,
  };
}

export function presentForecast(
  daily: ForecastDay[],
  storms: Storm[],
  today: string,
  scene: SceneOverride | null,
): ForecastDay[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    if (!byDate.has(date)) byDate.set(date, mildDay(date));
  }
  return [...byDate.values()]
    .filter((d) => d.date >= today && d.date <= addDays(today, 6))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const storm = storms.find((s) => s.date === day.date);
      let next = mergeStorm(day, storm);
      if (scene && day.date === today) next = overrideDay(next, scene);
      return next;
    });
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

export function parseOpenMeteo(data: unknown): { timezone: string; current: CurrentWeather; daily: ForecastDay[] } {
  if (!data || typeof data !== 'object') throw new Error('天氣資料格式不對');
  const body = data as { timezone?: string; current?: OpenMeteoCurrent; daily?: OpenMeteoDaily };
  const daily = body.daily;
  const dates = daily?.time ?? [];
  if (!dates.length) throw new Error('沒有預報');
  const days: ForecastDay[] = dates.map((date, i) => ({
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
  return {
    timezone: body.timezone || 'Asia/Hong_Kong',
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
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<{ timezone: string; current: CurrentWeather; daily: ForecastDay[] }> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('wind_speed_unit', 'kmh');
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400 * attempt * attempt));
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    lastStatus = res.status;
    if (res.ok) return parseOpenMeteo(await res.json());
    if (res.status !== 429 && res.status < 500) break;
  }
  throw new Error(lastStatus === 429 ? '天氣服務暫時太繁忙（429）' : `天氣服務回應 ${lastStatus}`);
}

export function locate(timeoutMs = 8000): Promise<{ lat: number; lon: number; source: LocationSource }> {
  const fallback = { lat: HK_LAT, lon: HK_LON, source: 'fallback' as const };
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(fallback);
  return new Promise((resolve) => {
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
      { enableHighAccuracy: false, timeout: timeoutMs - 500, maximumAge: 60 * 60 * 1000 },
    );
  });
}
