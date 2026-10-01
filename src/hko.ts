/**
 * Hong Kong Observatory open data (https://data.weather.gov.hk/weatherAPI/opendata/weather.php).
 * Sends `Access-Control-Allow-Origin: *`, so the browser can call it directly.
 */
import type { StormKind } from './types';
import { t as tl } from './i18n';

const BASE = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php';

export interface HkoWarning {
  /** Warning family from warnsum, e.g. WTCSGNL, WRAIN, WHOT. */
  group: string;
  /** Specific code, e.g. TC8NE, WRAINR, WFIREY. */
  code: string;
  /** Official Chinese name, e.g. 八號東北烈風或暴風信號. */
  name: string;
  /** Colloquial short label for chips, e.g. 八號風球, 紅雨. */
  short: string;
  /** Game storm this warning stands for (null = shown only). */
  kind: StormKind | null;
  /** True for TC1: a heads-up that a storm may come, not a storm yet. */
  standby: boolean;
  tone: 'red' | 'amber' | 'black' | 'yellow' | 'blue' | 'gray';
  issued: string;
}

export interface HkoForecastDay {
  date: string;
  week: string;
  text: string;
  wind: string;
  tempMax: number;
  tempMin: number;
  icon: number;
  psr: string;
}

export interface HkoData {
  fetchedAt: number;
  warnings: HkoWarning[];
  messages: string[];
  current: {
    tempC: number | null;
    station: string;
    humidity: number | null;
    icon: number | null;
    rainByDistrict: Record<string, number>;
    updated: string;
  } | null;
  forecast: HkoForecastDay[];
  situation: string;
  /** False when the warning list itself failed to load. An empty list means the bureau reported none. */
  warningsKnown?: boolean;
}

const TC_NAME: Record<string, string> = {
  TC1: tl('hko.001'),
  TC3: tl('hko.002'),
  TC8NE: tl('hko.003'),
  TC8SE: tl('hko.004'),
  TC8NW: tl('hko.005'),
  TC8SW: tl('hko.006'),
  TC9: tl('hko.007'),
  TC10: tl('hko.008'),
};

const TC_SHORT: Record<string, string> = {
  TC1: tl('hko.009'),
  TC3: tl('hko.010'),
  TC8NE: tl('hko.011'),
  TC8SE: tl('hko.012'),
  TC8NW: tl('hko.013'),
  TC8SW: tl('hko.014'),
  TC9: tl('hko.015'),
  TC10: tl('hko.016'),
};

/** What the warning card shows. The signal stays specific; the game grade is chosen separately. */
export function warningDisplay(w: HkoWarning): string {
  if (w.group === 'WTCSGNL' || w.group === 'WRAIN') return w.short;
  if ((w.group === 'WHOT' || w.group === 'WCOLD') && w.name && w.name !== w.code) return w.name;
  return w.short || w.name;
}

export function mapWarning(group: string, raw: { code?: string; name?: string; type?: string; actionCode?: string; issueTime?: string }): HkoWarning | null {
  if (!raw || raw.actionCode === 'CANCEL') return null;
  const code = raw.code || group;
  const name = group === 'WTCSGNL' ? (TC_NAME[code] ?? raw.name ?? tl('hko.017')) : `${raw.type ?? ''}${raw.name ?? code}`;
  const base = { group, code, name, issued: raw.issueTime ?? '', standby: false } as const;
  if (group === 'WTCSGNL') {
    const short = TC_SHORT[code] ?? tl('hko.018');
    if (code === 'TC1') return { ...base, short, kind: null, standby: true, tone: 'yellow' };
    if (code === 'TC3') return { ...base, short, kind: 'gale', tone: 'amber' };
    return { ...base, short, kind: 'typhoon', tone: 'red' };
  }
  if (group === 'WRAIN') {
    if (code === 'WRAINA') return { ...base, name: tl('hko.019'), short: tl('hko.020'), kind: 'heavy-rain', tone: 'amber' };
    if (code === 'WRAINR') return { ...base, name: tl('hko.021'), short: tl('hko.022'), kind: 'heavy-rain', tone: 'red' };
    if (code === 'WRAINB') return { ...base, name: tl('hko.023'), short: tl('guide.139'), kind: 'heavy-rain', tone: 'black' };
    return { ...base, short: tl('sim.008'), kind: 'heavy-rain', tone: 'amber' };
  }
  if (group === 'WMSGNL') return { ...base, short: tl('hko.024'), kind: 'gale', tone: 'amber' };
  if (group === 'WHOT') return { ...base, short: tl('guide.133'), kind: null, tone: 'red' };
  if (group === 'WCOLD') return { ...base, short: tl('balance.010'), kind: null, tone: 'blue' };
  if (group === 'WTS') return { ...base, short: tl('weather.011'), kind: null, tone: 'yellow' };
  if (group === 'WFIRE') return { ...base, short: code === 'WFIRER' ? tl('hko.025') : tl('hko.026'), kind: null, tone: code === 'WFIRER' ? 'red' : 'yellow' };
  if (group === 'WFNTSA') return { ...base, short: tl('hko.027'), kind: null, tone: 'blue' };
  if (group === 'WL') return { ...base, short: tl('balance.017'), kind: null, tone: 'amber' };
  if (group === 'WFROST') return { ...base, short: tl('hko.028'), kind: null, tone: 'blue' };
  if (group === 'WTMW') return { ...base, short: tl('hko.029'), kind: null, tone: 'red' };
  return { ...base, short: raw.name ?? code, kind: null, tone: 'gray' };
}

const SEVERITY: Record<StormKind, number> = { 'heavy-rain': 1, gale: 2, typhoon: 3 };

export function parseWarnsum(data: unknown): HkoWarning[] {
  if (!data || typeof data !== 'object') return [];
  const out: HkoWarning[] = [];
  for (const [group, raw] of Object.entries(data as Record<string, unknown>)) {
    const w = mapWarning(group, raw as Record<string, string>);
    if (w) out.push(w);
  }
  // Storm-driving warnings first, most severe first.
  return out.sort((a, b) => (b.kind ? SEVERITY[b.kind] + 10 : b.standby ? 5 : 0) - (a.kind ? SEVERITY[a.kind] + 10 : a.standby ? 5 : 0));
}

/** The warning that should drive today's in-game storm, if any. */
export function drivingWarning(warnings: HkoWarning[]): HkoWarning | null {
  let best: HkoWarning | null = null;
  for (const w of warnings) {
    if (!w.kind) continue;
    if (!best || SEVERITY[w.kind] > SEVERITY[best.kind!] || (w.kind === best.kind && w.tone === 'black')) best = w;
  }
  return best;
}

/** HKO weather icon number (50-93) → closest WMO code the scene understands. */
export function hkoIconToWmo(icon: number): number {
  const map: Record<number, number> = {
    50: 0, 51: 1, 52: 2, 53: 80, 54: 80, 60: 3, 61: 3, 62: 61, 63: 63, 64: 65, 65: 95,
    70: 0, 71: 0, 72: 0, 73: 0, 74: 0, 75: 0, 76: 3, 77: 1, 80: 2, 81: 0, 82: 2, 83: 45, 84: 45, 85: 45,
    90: 0, 91: 1, 92: 2, 93: 2,
  };
  return map[icon] ?? 2;
}

/** Official HKO wording for each weather icon (https://www.hko.gov.hk/tc/textonly/explain/wxicon.htm). */
const HKO_ICON_LABELS: Record<number, string> = {
  50: tl('hko.030'), 51: tl('weather.004'), 52: tl('hko.031'), 53: tl('hko.032'), 54: tl('hko.033'),
  60: tl('weather.013'), 61: tl('hko.034'), 62: tl('weather.007'), 63: tl('guide.100'), 64: tl('balance.044'), 65: tl('weather.011'),
  70: tl('hko.035'), 71: tl('hko.035'), 72: tl('hko.035'), 73: tl('hko.035'), 74: tl('hko.035'), 75: tl('hko.035'), 76: tl('weather.015'), 77: tl('hko.036'),
  80: tl('hko.037'), 81: tl('hko.038'), 82: tl('hko.039'), 83: tl('habitat.022'), 84: tl('hko.040'), 85: tl('hko.041'),
  90: tl('guide.097'), 91: tl('hko.042'), 92: tl('hko.043'), 93: tl('hko.044'),
};

export function hkoIconLabel(icon: number): string {
  return HKO_ICON_LABELS[icon] ?? '';
}

export function isHkoIcon(icon: unknown): icon is number {
  return typeof icon === 'number' && icon in HKO_ICON_LABELS;
}

/** Icons that mean rain is falling (showers and rain). 65 雷暴唔算，因為唔一定有雨。 */
export function hkoIconRain(icon: number): boolean {
  return icon === 53 || icon === 54 || (icon >= 62 && icon <= 64);
}

/** Approximate coordinates of HKO temperature stations, to pick the one nearest the player. */
const STATIONS: [string, number, number][] = [
  ['香港天文台', 22.302, 114.174], ['京士柏', 22.312, 114.173], ['黃竹坑', 22.247, 114.174], ['打鼓嶺', 22.528, 114.157],
  ['流浮山', 22.469, 113.984], ['大埔', 22.446, 114.179], ['沙田', 22.402, 114.21], ['屯門', 22.386, 113.964],
  ['將軍澳', 22.316, 114.256], ['西貢', 22.376, 114.275], ['長洲', 22.201, 114.027], ['赤鱲角', 22.309, 113.922],
  ['青衣', 22.344, 114.11], ['石崗', 22.436, 114.085], ['荃灣可觀', 22.384, 114.108], ['荃灣城門谷', 22.376, 114.121],
  ['香港公園', 22.278, 114.162], ['筲箕灣', 22.281, 114.236], ['九龍城', 22.335, 114.185], ['跑馬地', 22.27, 114.184],
  ['黃大仙', 22.339, 114.205], ['赤柱', 22.214, 114.219], ['觀塘', 22.319, 114.225], ['深水埗', 22.335, 114.137],
  ['啟德跑道公園', 22.305, 114.216], ['元朗公園', 22.441, 114.02], ['大美督', 22.475, 114.237], ['上水', 22.502, 114.111],
  ['東涌', 22.289, 113.941], ['大老山', 22.353, 114.209], ['昂坪', 22.259, 113.911], ['北潭涌', 22.395, 114.321],
];

function nearestStationOrder(lat: number, lon: number): string[] {
  return STATIONS.map(([name, la, lo]) => [name, (la - lat) ** 2 + ((lo - lon) * Math.cos((lat * Math.PI) / 180)) ** 2] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([name]) => name);
}

export function parseRhrread(data: unknown, lat: number, lon: number): { current: NonNullable<HkoData['current']>; messages: string[] } | null {
  if (!data || typeof data !== 'object') return null;
  const body = data as {
    temperature?: { data?: { place: string; value: number }[] };
    humidity?: { data?: { place: string; value: number }[] };
    rainfall?: { data?: { place: string; max?: number }[] };
    icon?: number[];
    updateTime?: string;
    warningMessage?: string[] | string;
  };
  const temps = body.temperature?.data ?? [];
  let tempC: number | null = null;
  let station = '';
  for (const name of nearestStationOrder(lat, lon)) {
    const hit = temps.find((t) => t.place === name && typeof t.value === 'number');
    if (hit) {
      tempC = hit.value;
      station = hit.place;
      break;
    }
  }
  if (tempC === null && temps[0]) {
    tempC = temps[0].value;
    station = temps[0].place;
  }
  const rainByDistrict: Record<string, number> = {};
  for (const r of body.rainfall?.data ?? []) rainByDistrict[r.place] = typeof r.max === 'number' ? r.max : 0;
  const messages = Array.isArray(body.warningMessage) ? body.warningMessage : body.warningMessage ? [body.warningMessage] : [];
  return {
    current: {
      tempC,
      station,
      humidity: body.humidity?.data?.[0]?.value ?? null,
      icon: body.icon?.[0] ?? null,
      rainByDistrict,
      updated: body.updateTime ?? '',
    },
    messages: messages.filter(Boolean),
  };
}

export function parseFnd(data: unknown): { forecast: HkoForecastDay[]; situation: string } {
  if (!data || typeof data !== 'object') return { forecast: [], situation: '' };
  const body = data as {
    generalSituation?: string;
    weatherForecast?: {
      forecastDate: string;
      week?: string;
      forecastWeather?: string;
      forecastWind?: string;
      forecastMaxtemp?: { value: number };
      forecastMintemp?: { value: number };
      ForecastIcon?: number;
      PSR?: string;
    }[];
  };
  const forecast = (body.weatherForecast ?? []).map((d) => ({
    date: `${d.forecastDate.slice(0, 4)}-${d.forecastDate.slice(4, 6)}-${d.forecastDate.slice(6, 8)}`,
    week: d.week ?? '',
    text: d.forecastWeather ?? '',
    wind: d.forecastWind ?? '',
    tempMax: d.forecastMaxtemp?.value ?? 28,
    tempMin: d.forecastMintemp?.value ?? 23,
    icon: d.ForecastIcon ?? 51,
    psr: d.PSR ?? '低',
  }));
  return { forecast, situation: body.generalSituation ?? '' };
}

/** Beaufort force from HKO wind text like 「東風4至5級，間中6級」 → km/h of the strongest force mentioned. */
export function windFromText(text: string): number {
  const levels = [...text.matchAll(/(\d{1,2})\s*級/g)].map((m) => Number(m[1]));
  const force = levels.length ? Math.max(...levels) : 2;
  const kmh = [1, 3, 9, 15, 24, 34, 44, 56, 68, 82, 96, 110, 120];
  return kmh[Math.min(12, Math.max(0, force))] ?? 12;
}

export function rainFromPsr(psr: string): { mm: number; prob: number } {
  switch (psr) {
    case '高':
      return { mm: 18, prob: 85 };
    case '中高':
      return { mm: 10, prob: 65 };
    case '中':
      return { mm: 5, prob: 45 };
    case '中低':
      return { mm: 1.5, prob: 25 };
    default:
      return { mm: 0, prob: 10 };
  }
}

async function getJson(dataType: string, timeoutMs: number): Promise<unknown> {
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${BASE}?dataType=${dataType}&lang=tc`, { signal: timeoutSignal(timeoutMs) });
      if (!res.ok) throw new Error(tl('hko.045', { status: res.status }));
      const text = await res.text();
      return JSON.parse(text) as unknown;
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error(tl('hko.046'));
}

export function timeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) return AbortSignal.timeout(ms);
  if (typeof AbortController === 'undefined') return undefined;
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function loadOne(dataType: string, timeoutMs: number): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await getJson(dataType, timeoutMs) };
  } catch {
    return { ok: false };
  }
}

/**
 * Warnings, the live reading, then the 9-day forecast.
 * One request at a time: the app HTTP client starts each timeout immediately and does not
 * run them together, so a parallel call was letting the warning list and the reading expire
 * while the forecast still arrived.
 */
export async function fetchHko(lat: number, lon: number, timeoutMs = 8000): Promise<HkoData> {
  const warn = await loadOne('warnsum', timeoutMs);
  const now = await loadOne('rhrread', timeoutMs);
  const fnd = await loadOne('fnd', timeoutMs);
  if (!warn.ok && !now.ok && !fnd.ok) throw new Error(tl('hko.046'));
  const rh = now.ok ? parseRhrread(now.value, lat, lon) : null;
  const f = fnd.ok ? parseFnd(fnd.value) : { forecast: [], situation: '' };
  return {
    fetchedAt: Date.now(),
    warnings: warn.ok ? parseWarnsum(warn.value) : [],
    warningsKnown: warn.ok,
    messages: rh?.messages ?? [],
    current: rh?.current ?? null,
    forecast: f.forecast,
    situation: f.situation,
  };
}

/**
 * A forecast-only reply must not wipe a warning or a temperature we already had.
 * An empty previous list is not reused: that snapshot may itself have missed the warning request.
 */
export function fillHkoGaps(fresh: HkoData, previous: HkoData | null | undefined, now = Date.now(), maxAgeMs = 45 * 60 * 1000): HkoData {
  if (!previous || now - previous.fetchedAt > maxAgeMs) return fresh;
  const keepWarnings = fresh.warningsKnown === false && previous.warnings.length > 0;
  const keepCurrent = !fresh.current && previous.current !== null && previous.current.tempC !== null;
  if (!keepWarnings && !keepCurrent) return fresh;
  return {
    ...fresh,
    warnings: keepWarnings ? previous.warnings : fresh.warnings,
    messages: fresh.messages.length ? fresh.messages : keepWarnings ? previous.messages : fresh.messages,
    current: keepCurrent ? previous.current : fresh.current,
    warningsKnown: keepWarnings ? true : fresh.warningsKnown,
  };
}
