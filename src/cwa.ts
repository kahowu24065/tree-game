/**
 * Taiwan: 交通部中央氣象署 (CWA) open data, v1.4.14.
 * The CWA key must stay private, so the app never calls opendata.cwa.gov.tw itself: the push server's
 * GET /cwa?lat=&lon= downloads the datasets (O-A0001/0003 stations, O-A0002 rain, F-D0047-091 county week
 * forecast, W-C0033-001 county hazards, CAP W-C0033-003..006 and W-C0034-001) and returns one normalised bundle.
 * It is turned into the same HKO shape as SMG so warnings, icons and the forecast list are reused.
 */
import { timeoutSignal, type HkoData, type HkoForecastDay, type HkoWarning } from './hko';
import { PUSH_SERVER } from './native/push';
import type { StormKind } from './types';
import { t as tl } from './i18n';

export type CwaWarningType = 'typhoon' | 'rain' | 'wind' | 'thunder' | 'heat' | 'cold' | 'fog';

export interface CwaRawWarning {
  type: CwaWarningType;
  level: number;
  name: string;
  issued?: string;
  text?: string;
}

export interface CwaResponse {
  ok: boolean;
  county: string;
  town: string;
  current: { station: string; updated: string; tempC: number | null; humidity: number | null; windKmh: number | null; gustKmh: number | null; rainMm1h: number | null; weather: string; icon: number | null } | null;
  forecast: (HkoForecastDay & { detail?: string; pop?: number | null })[];
  forecastArea?: string;
  warnings: CwaRawWarning[];
  warningsKnown: boolean;
}

export interface CwaBundle {
  data: HkoData;
  windKmh: number | null;
  gustKmh: number | null;
  precipMm: number | null;
  county: string;
  town: string;
}

/** Taiwan, Penghu, Kinmen / Lieyu and Matsu (same boxes as push-server/src/cwa.js). */
export function inTaiwan(lat: number, lon: number): boolean {
  const box = (a: number, b: number, c: number, d: number) => lat >= a && lat <= b && lon >= c && lon <= d;
  return box(21.85, 25.35, 120.0, 122.1) || box(23.1, 23.9, 119.3, 119.8) || box(24.38, 24.54, 118.28, 118.49) || box(24.39, 24.47, 118.205, 118.27) || box(25.93, 26.4, 119.88, 120.52);
}

const GROUP: Record<CwaWarningType, string> = { typhoon: 'TWTY', rain: 'TWRAIN', wind: 'TWWIND', thunder: 'TWTS', heat: 'TWHOT', cold: 'TWCOLD', fog: 'TWFOG' };

/** One CWA warning → the shared warning shape. The name is CWA's own (e.g. 豪雨特報, 陸上強風特報（橙色燈號）). */
export function mapCwaWarning(w: CwaRawWarning): HkoWarning | null {
  const group = GROUP[w.type];
  if (!group || !(w.level >= 1)) return null;
  const level = Math.round(w.level);
  const base = { group, code: `${group}${level}`, name: w.name, short: w.name, issued: w.issued ?? '', standby: false };
  let kind: StormKind | null = null;
  let tone: HkoWarning['tone'] = 'yellow';
  if (w.type === 'typhoon') {
    if (level >= 2) (kind = 'typhoon'), (tone = 'red');
    else return { ...base, kind: null, standby: true, tone: 'yellow' };
  } else if (w.type === 'rain') {
    kind = 'heavy-rain';
    tone = level >= 4 ? 'black' : level >= 2 ? 'red' : 'amber';
  } else if (w.type === 'wind') {
    kind = level >= 3 ? 'typhoon' : 'gale';
    tone = level >= 3 ? 'red' : level === 2 ? 'amber' : 'yellow';
  } else if (w.type === 'thunder') tone = 'yellow';
  else if (w.type === 'heat') tone = level >= 3 ? 'red' : level === 2 ? 'amber' : 'yellow';
  else if (w.type === 'cold') tone = 'blue';
  else tone = 'gray';
  return { ...base, kind, tone };
}

const ORDER: Record<string, number> = { TWTY: 0, TWWIND: 1, TWTS: 2, TWRAIN: 3, TWHOT: 4, TWCOLD: 5, TWFOG: 6 };

export function parseCwa(body: CwaResponse, now = Date.now()): CwaBundle {
  const warnings = (body.warnings ?? []).map(mapCwaWarning).filter((w): w is HkoWarning => Boolean(w)).sort((a, b) => (ORDER[a.group] ?? 9) - (ORDER[b.group] ?? 9));
  const messages = [...new Set((body.warnings ?? []).map((w) => (w.text ?? '').trim()).filter(Boolean))];
  const c = body.current;
  const place = body.town ? `${body.county}${body.town}` : body.county;
  return {
    county: body.county ?? '',
    town: body.town ?? '',
    windKmh: c?.windKmh ?? null,
    gustKmh: c?.gustKmh ?? c?.windKmh ?? null,
    precipMm: c?.rainMm1h ?? null,
    data: {
      fetchedAt: now,
      warnings,
      messages,
      situation: '',
      warningsKnown: body.warningsKnown !== false,
      forecast: (body.forecast ?? []).map((d) => ({ date: d.date, week: d.week, text: d.text, wind: d.wind, tempMax: d.tempMax, tempMin: d.tempMin, icon: d.icon, psr: d.psr })),
      current: c
        ? {
            tempC: c.tempC,
            station: c.station || place || '臺灣',
            humidity: c.humidity,
            icon: c.icon,
            rainByDistrict: c.rainMm1h !== null ? { [place || '臺灣']: c.rainMm1h } : {},
            updated: c.updated,
          }
        : null,
    },
  };
}

let lastArea: { county: string; town: string } | null = null;
/** County / town of the last CWA answer, so the push server can check the same area's warnings. */
export function cwaArea(): { county: string; town: string } | null {
  return lastArea;
}

/** Current readings, county week forecast and warnings via the push server. */
export async function fetchCwa(lat: number, lon: number): Promise<CwaBundle> {
  let last = tl('cwa.001');
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${PUSH_SERVER}/cwa?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, { signal: timeoutSignal(12000) });
      if (!res.ok) {
        last = tl('cwa.002', { status: res.status });
        if (res.status < 500) break;
        continue;
      }
      const body = (await res.json()) as CwaResponse;
      if (!body?.ok) throw new Error(last);
      const bundle = parseCwa(body);
      lastArea = { county: bundle.county, town: bundle.town };
      return bundle;
    } catch {
      last = tl('cwa.003');
    }
  }
  throw new Error(last);
}
