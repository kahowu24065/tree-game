/**
 * Hong Kong Observatory open data (https://data.weather.gov.hk/weatherAPI/opendata/weather.php).
 * Sends `Access-Control-Allow-Origin: *`, so the browser can call it directly.
 */
import type { StormKind } from './types';

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
}

const TC_NAME: Record<string, string> = {
  TC1: '一號戒備信號',
  TC3: '三號強風信號',
  TC8NE: '八號東北烈風或暴風信號',
  TC8SE: '八號東南烈風或暴風信號',
  TC8NW: '八號西北烈風或暴風信號',
  TC8SW: '八號西南烈風或暴風信號',
  TC9: '九號烈風或暴風風力增強信號',
  TC10: '十號颶風信號',
};

const TC_SHORT: Record<string, string> = {
  TC1: '一號風球',
  TC3: '三號風球',
  TC8NE: '八號風球',
  TC8SE: '八號風球',
  TC8NW: '八號風球',
  TC8SW: '八號風球',
  TC9: '九號風球',
  TC10: '十號風球',
};

export function mapWarning(group: string, raw: { code?: string; name?: string; type?: string; actionCode?: string; issueTime?: string }): HkoWarning | null {
  if (!raw || raw.actionCode === 'CANCEL') return null;
  const code = raw.code || group;
  const name = group === 'WTCSGNL' ? (TC_NAME[code] ?? raw.name ?? '熱帶氣旋警告信號') : `${raw.type ?? ''}${raw.name ?? code}`;
  const base = { group, code, name, issued: raw.issueTime ?? '', standby: false } as const;
  if (group === 'WTCSGNL') {
    const short = TC_SHORT[code] ?? '熱帶氣旋警告';
    if (code === 'TC1') return { ...base, short, kind: null, standby: true, tone: 'yellow' };
    if (code === 'TC3') return { ...base, short, kind: 'gale', tone: 'amber' };
    return { ...base, short, kind: 'typhoon', tone: 'red' };
  }
  if (group === 'WRAIN') {
    if (code === 'WRAINA') return { ...base, name: '黃色暴雨警告信號', short: '黃雨', kind: 'heavy-rain', tone: 'amber' };
    if (code === 'WRAINR') return { ...base, name: '紅色暴雨警告信號', short: '紅雨', kind: 'heavy-rain', tone: 'red' };
    if (code === 'WRAINB') return { ...base, name: '黑色暴雨警告信號', short: '黑雨', kind: 'heavy-rain', tone: 'black' };
    return { ...base, short: '暴雨警告', kind: 'heavy-rain', tone: 'amber' };
  }
  if (group === 'WMSGNL') return { ...base, short: '強烈季候風', kind: 'gale', tone: 'amber' };
  if (group === 'WHOT') return { ...base, short: '酷熱', kind: null, tone: 'red' };
  if (group === 'WCOLD') return { ...base, short: '寒冷', kind: null, tone: 'blue' };
  if (group === 'WTS') return { ...base, short: '雷暴', kind: null, tone: 'yellow' };
  if (group === 'WFIRE') return { ...base, short: code === 'WFIRER' ? '紅色火災' : '黃色火災', kind: null, tone: code === 'WFIRER' ? 'red' : 'yellow' };
  if (group === 'WFNTSA') return { ...base, short: '新界北水浸', kind: null, tone: 'blue' };
  if (group === 'WL') return { ...base, short: '山泥傾瀉', kind: null, tone: 'amber' };
  if (group === 'WFROST') return { ...base, short: '霜凍', kind: null, tone: 'blue' };
  if (group === 'WTMW') return { ...base, short: '海嘯', kind: null, tone: 'red' };
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
    70: 0, 71: 0, 72: 0, 73: 0, 74: 0, 75: 0, 76: 3, 77: 1, 80: 2, 81: 1, 82: 2, 83: 45, 84: 45, 85: 45,
    90: 0, 91: 1, 92: 2, 93: 2,
  };
  return map[icon] ?? 2;
}

export function hkoIconLabel(icon: number): string {
  const map: Record<number, string> = {
    50: '陽光充沛', 51: '間有陽光', 52: '短暫陽光', 53: '間有陽光，有驟雨', 54: '短暫陽光，有驟雨', 60: '多雲', 61: '密雲',
    62: '微雨', 63: '有雨', 64: '大雨', 65: '雷暴', 70: '天色良好', 71: '天色良好', 72: '天色良好', 73: '天色良好', 74: '天色良好',
    75: '天色良好', 76: '大致多雲', 77: '天色大致良好', 80: '大風', 81: '乾燥', 82: '潮濕', 83: '有霧', 84: '薄霧', 85: '煙霞',
    90: '炎熱', 91: '溫暖', 92: '涼', 93: '寒冷',
  };
  return map[icon] ?? '';
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
  const res = await fetch(`${BASE}?dataType=${dataType}&lang=tc`, { signal: timeoutSignal(timeoutMs) });
  if (!res.ok) throw new Error(`天文台回應 ${res.status}`);
  return res.json();
}

export function timeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) return AbortSignal.timeout(ms);
  if (typeof AbortController === 'undefined') return undefined;
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

/** Fetch warnings, current readings and the 9-day forecast in parallel. Throws only if all three fail. */
export async function fetchHko(lat: number, lon: number, timeoutMs = 8000): Promise<HkoData> {
  const [warn, now, fnd] = await Promise.allSettled([getJson('warnsum', timeoutMs), getJson('rhrread', timeoutMs), getJson('fnd', timeoutMs)]);
  if (warn.status === 'rejected' && now.status === 'rejected' && fnd.status === 'rejected') throw new Error('天文台資料暫時攞唔到');
  const rh = now.status === 'fulfilled' ? parseRhrread(now.value, lat, lon) : null;
  const f = fnd.status === 'fulfilled' ? parseFnd(fnd.value) : { forecast: [], situation: '' };
  return {
    fetchedAt: Date.now(),
    warnings: warn.status === 'fulfilled' ? parseWarnsum(warn.value) : [],
    messages: rh?.messages ?? [],
    current: rh?.current ?? null,
    forecast: f.forecast,
    situation: f.situation,
  };
}
