/**
 * Macao Meteorological and Geophysical Bureau (SMG / 地球物理氣象局).
 * xml.smg.gov.mo and rss.smg.gov.mo do not send Access-Control-Allow-Origin, so the
 * page loads them through the Vite dev proxy, the push server (/smg/…), or — in the
 * Android app — a direct request (CapacitorHttp). Parsed into the same shape as HKO
 * so warnings, icons and the forecast list can be reused.
 */
import { mapWarning, rainFromPsr, timeoutSignal, windFromText, type HkoData, type HkoForecastDay, type HkoWarning } from './hko';
import type { ForecastDay } from './types';
import { isNative } from './native/platform';
import { PUSH_SERVER } from './native/push';

/** Approximate station positions, used only to pick the nearest reading. */
const STATIONS: { code: string; name: string; lat: number; lon: number }[] = [
  { code: 'DP', name: '紀念孫中山市政公園', lat: 22.204, lon: 113.544 },
  { code: 'EM', name: '黑沙環', lat: 22.211, lon: 113.555 },
  { code: 'FM', name: '大炮台', lat: 22.197, lon: 113.542 },
  { code: 'PE', name: '外港', lat: 22.197, lon: 113.559 },
  { code: 'MM', name: '媽閣', lat: 22.187, lon: 113.531 },
  { code: 'TG', name: '大潭山', lat: 22.156, lon: 113.568 },
  { code: 'JA', name: '東亞運大馬路', lat: 22.155, lon: 113.556 },
  { code: 'UM', name: '澳門大學', lat: 22.132, lon: 113.548 },
  { code: 'KV', name: '九澳', lat: 22.133, lon: 113.581 },
  { code: 'DC', name: '路環市區', lat: 22.124, lon: 113.565 },
];

/** SMG weather-status code → HKO icon number, so the existing art and labels apply. */
const STATUS_ICON: Record<string, number> = {
  '01': 50, a1: 50,
  '02': 51, a2: 51,
  '03': 60,
  '04': 61,
  '05': 84, '06': 83, '07': 83, '08': 83,
  '10': 62,
  '12': 63, '28': 63, c8: 63,
  '13': 64,
  '15': 63,
  '16': 54, '29': 54, c9: 54,
  '17': 64,
  '18': 65, '24': 65, '25': 65,
  '27': 80,
};

export interface SmgBundle {
  data: HkoData;
  windKmh: number | null;
  gustKmh: number | null;
  precipMm: number | null;
}

export interface SmgXml {
  brief?: string;
  actual?: string;
  week?: string;
  typhoon?: string;
  rain?: string;
  thunder?: string;
  monsoon?: string;
  temp?: string;
  /** c_forecast.xml. TodaySituation is SMG's weather-situation paragraph. */
  outlook?: string;
}

function inner(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}(?![A-Za-z0-9_])[^>]*>([\\s\\S]*?)</${name}>`));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function blocks(xml: string, name: string): string[] {
  return [...xml.matchAll(new RegExp(`<${name}(?![A-Za-z0-9_])[^>]*>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => m[1]);
}

function numOf(xml: string, name: string): number | null {
  const v = Number(inner(xml, name));
  return Number.isFinite(v) ? v : null;
}

function valueOfType(xml: string, name: string, type: string): number | null {
  for (const block of blocks(xml, name)) {
    if (inner(block, 'Type') === type) return numOf(block, 'Value');
  }
  return null;
}

function active(block: string): boolean {
  const action = inner(block, 'Action').toUpperCase();
  const status = inner(block, 'Status');
  const inforce = inner(block, 'Inforce');
  if (action === 'CANCEL' || status === '0' || status === '2' || status === '3') return false;
  if (action === 'NIL' && status !== '1' && inforce !== '1') return false;
  return status === '1' || inforce === '1' || action === 'ISSUE' || action === 'RENEW';
}

function tcCode(block: string): string {
  const blob = `${inner(block, 'Warncode')} ${inner(block, 'Description')} ${inner(block, 'Major')}`;
  if (/十號|(^|[^\d])10([^\d]|$)/.test(blob)) return 'TC10';
  if (/九號|(^|[^\d])9([^\d]|$)/.test(blob)) return 'TC9';
  if (/八號|(^|[^\d])8([^\d]|$)/.test(blob)) {
    if (/東北|\bNE\b/.test(blob)) return 'TC8NE';
    if (/東南|\bSE\b/.test(blob)) return 'TC8SE';
    if (/西北|\bNW\b/.test(blob)) return 'TC8NW';
    if (/西南|\bSW\b/.test(blob)) return 'TC8SW';
    return 'TC8SE';
  }
  if (/三號|(^|[^\d])3([^\d]|$)/.test(blob)) return 'TC3';
  return 'TC1';
}

function rainCode(block: string): string {
  const blob = `${inner(block, 'Warncode')} ${inner(block, 'Description')}`;
  if (/黑/.test(blob) || /BLACK/i.test(blob)) return 'WRAINB';
  if (/紅/.test(blob) || /RED/i.test(blob)) return 'WRAINR';
  return 'WRAINA';
}

function issued(block: string): string {
  return inner(block, 'IssuedAt') || inner(block, 'SignalChangedAt');
}

function pushWarning(out: HkoWarning[], w: HkoWarning | null): void {
  if (w) out.push(w);
}

/** Warnings in force: typhoon, rainstorm, thunderstorm, strong monsoon, and hot/cold alerts. */
export function smgWarnings(xml: SmgXml): HkoWarning[] {
  const out: HkoWarning[] = [];
  const typhoon = blocks(xml.typhoon ?? '', 'TropicalCyclone').find(active);
  if (typhoon) {
    const code = tcCode(typhoon);
    pushWarning(out, mapWarning('WTCSGNL', { code, name: inner(typhoon, 'Description'), issueTime: issued(typhoon) }));
  }
  const rain = blocks(xml.rain ?? '', 'Rainstorm').find(active);
  if (rain) pushWarning(out, mapWarning('WRAIN', { code: rainCode(rain), issueTime: issued(rain) }));
  const thunder = blocks(xml.thunder ?? '', 'Thunderstorm').find(active);
  if (thunder) pushWarning(out, mapWarning('WTS', { code: 'WTS', name: '雷暴警告信號', issueTime: issued(thunder) }));
  const monsoon = blocks(xml.monsoon ?? '', 'Monsoon').find(active);
  if (monsoon) pushWarning(out, mapWarning('WMSGNL', { code: 'WMSGNL', name: '強烈季候風信號', issueTime: issued(monsoon) }));
  for (const item of blocks(xml.temp ?? '', 'item')) {
    const title = inner(item, 'title');
    const desc = inner(item, 'description');
    if (!title || /取消|沒有|並無/.test(`${title}${desc}`)) continue;
    if (/高溫|酷熱/.test(title)) pushWarning(out, mapWarning('WHOT', { code: 'WHOT', name: title }));
    else if (/低溫|寒冷|降溫/.test(title)) pushWarning(out, mapWarning('WCOLD', { code: 'WCOLD', name: title }));
  }
  return out;
}

/** Advisory sentences that sit under a warning, like the Observatory's warningMessage. Names stay in the warning list. */
export function smgMessages(xml: SmgXml): string[] {
  const out: string[] = [];
  const add = (text: string) => {
    const t = text.trim();
    if (t && !out.includes(t)) out.push(t);
  };
  const sentence = (block: string) => inner(block, 'Description') || inner(block, 'description');
  const typhoon = blocks(xml.typhoon ?? '', 'TropicalCyclone').find(active);
  if (typhoon) add(sentence(typhoon));
  const rain = blocks(xml.rain ?? '', 'Rainstorm').find(active);
  if (rain) add(sentence(rain));
  const thunder = blocks(xml.thunder ?? '', 'Thunderstorm').find(active);
  if (thunder) add(sentence(thunder));
  const monsoon = blocks(xml.monsoon ?? '', 'Monsoon').find(active);
  if (monsoon) add(sentence(monsoon));
  for (const item of blocks(xml.temp ?? '', 'item')) {
    const title = inner(item, 'title');
    const desc = inner(item, 'description');
    if (!title || /取消|沒有|並無/.test(`${title}${desc}`)) continue;
    if (/高溫|酷熱|低溫|寒冷|降溫/.test(title)) add(desc);
  }
  return out;
}

function statusIcon(status: string): number | null {
  const icon = STATUS_ICON[status.trim().toLowerCase()];
  return icon ?? null;
}

function psrFor(status: string, text: string): string {
  const icon = statusIcon(status);
  if (icon === 64 || icon === 65) return '高';
  if (icon === 63 || icon === 54) return '中';
  if (icon === 62) return '中低';
  if (/驟雨|有雨/.test(text)) return '中低';
  return '低';
}

function nearestStation(actual: string, lat: number, lon: number): { name: string; block: string } | null {
  const reports = blocks(actual, 'WeatherReport');
  let best: { name: string; block: string; d: number } | null = null;
  for (const report of reports) {
    const code = /code="([^"]+)"/.exec(report)?.[1] ?? '';
    const station = STATIONS.find((s) => s.code === code);
    if (!station || valueOfType(report, 'Temperature', '3') === null) continue;
    const dy = lat - station.lat;
    const dx = (lon - station.lon) * Math.cos((lat * Math.PI) / 180);
    const d = dy * dy + dx * dx;
    if (!best || d < best.d) best = { name: inner(report, 'stationname') || station.name, block: report, d };
  }
  return best;
}

function forecastDays(week: string): HkoForecastDay[] {
  return blocks(week, 'WeatherForecast').map((block) => {
    const status = inner(block, 'WeatherStatus');
    const text = inner(block, 'WeatherDescription');
    return {
      date: inner(block, 'ValidFor').slice(0, 10),
      week: inner(block, 'c_DayOfWeek'),
      text,
      wind: text,
      tempMax: valueOfType(block, 'Temperature', '1') ?? 30,
      tempMin: valueOfType(block, 'Temperature', '2') ?? 24,
      icon: statusIcon(status) ?? 60,
      psr: psrFor(status, text),
    };
  }).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
}

/** Replace model forecast numbers with SMG's 7-day max/min, wind and rain. */
export function withSmgDays(daily: ForecastDay[], data: HkoData): ForecastDay[] {
  const byDate = new Map(data.forecast.map((d) => [d.date, d]));
  return daily.map((day) => {
    const f = byDate.get(day.date);
    if (!f) return day;
    const wind = windFromText(f.wind);
    const rain = rainFromPsr(f.psr);
    return { ...day, tempMax: f.tempMax, tempMin: f.tempMin, windKmh: wind, gustKmh: Math.round(wind * 1.5), precipMm: rain.mm, precipProb: rain.prob };
  });
}

/** Pure parser. `lat`/`lon` pick the nearest station that reports a temperature. */
export function parseSmg(xml: SmgXml, lat: number, lon: number, now = Date.now()): SmgBundle {
  const station = nearestStation(xml.actual ?? '', lat, lon);
  const brief = xml.brief ?? '';
  const status = inner(brief, 'WeatherStatus');
  const icon = statusIcon(status);
  const tempC = station ? valueOfType(station.block, 'Temperature', '3') : valueOfType(brief, 'Temperature', '3');
  const humidity = station ? valueOfType(station.block, 'Humidity', '3') : valueOfType(brief, 'Humidity', '3');
  const windKmh = station ? valueOfType(station.block, 'WindSpeed', '3') : valueOfType(brief, 'WindSpeed', '3');
  const gustKmh = station ? valueOfType(station.block, 'WindGust', '3') : null;
  const precipMm = station ? valueOfType(station.block, 'Rainfall', '3') : null;
  const days = forecastDays(xml.week ?? '');
  const warnings = smgWarnings(xml);
  const messages = smgMessages(xml);
  return {
    windKmh,
    gustKmh: gustKmh ?? (windKmh !== null ? windKmh : null),
    precipMm,
    data: {
      fetchedAt: now,
      warnings,
      messages,
      situation: inner(xml.outlook ?? '', 'TodaySituation'),
      forecast: days,
      current: {
        tempC,
        station: station?.name || '澳門',
        humidity,
        icon,
        rainByDistrict: precipMm !== null ? { 澳門: precipMm } : {},
        updated: inner(brief, 'SysPubdate') || inner(xml.actual ?? '', 'RecordTime'),
      },
    },
  };
}

const FILES: { key: keyof SmgXml; host: 'xml' | 'rss'; file: string }[] = [
  { key: 'brief', host: 'xml', file: 'c_actual_brief.xml' },
  { key: 'actual', host: 'xml', file: 'c_actualweather.xml' },
  { key: 'week', host: 'xml', file: 'c_7daysforecast.xml' },
  { key: 'outlook', host: 'xml', file: 'c_forecast.xml' },
  { key: 'typhoon', host: 'xml', file: 'c_typhoon.xml' },
  { key: 'rain', host: 'xml', file: 'c_rainstorm.xml' },
  { key: 'thunder', host: 'xml', file: 'c_thunderstorm.xml' },
  { key: 'monsoon', host: 'xml', file: 'c_monsoon.xml' },
  { key: 'temp', host: 'rss', file: 'c_temperatureAlert_rss.xml' },
];

function urlsFor(file: string, host: 'xml' | 'rss'): string[] {
  const direct = `https://${host}.smg.gov.mo/${file}`;
  const viaPush = `${PUSH_SERVER}/smg/${host}/${file}`;
  if (import.meta.env.DEV) return [`/smg/${host}/${file}`, viaPush, direct];
  if (isNative()) return [direct, viaPush];
  return [viaPush, direct];
}

async function fetchText(file: string, host: 'xml' | 'rss'): Promise<string> {
  let last = '地球物理氣象局冇回應';
  for (const url of urlsFor(file, host)) {
    try {
      const res = await fetch(url, { signal: timeoutSignal(8000) });
      if (!res.ok) {
        last = `地球物理氣象局回應 ${res.status}`;
        continue;
      }
      return await res.text();
    } catch {
      last = '連唔到地球物理氣象局';
    }
  }
  throw new Error(last);
}

/** Current readings, 7-day forecast and warnings. Throws when the live observation cannot be read. */
export async function fetchSmg(lat: number, lon: number): Promise<SmgBundle> {
  const xml: SmgXml = {};
  const results = await Promise.allSettled(FILES.map((f) => fetchText(f.file, f.host)));
  FILES.forEach((f, i) => {
    const r = results[i];
    if (r?.status === 'fulfilled') xml[f.key] = r.value;
  });
  if (!xml.brief && !xml.actual) throw new Error('連唔到地球物理氣象局');
  return parseSmg(xml, lat, lon);
}
