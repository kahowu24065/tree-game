/**
 * 1.4.26 Official alert feeds outside HK / Macau / Taiwan (US NWS, Canada ECCC, Japan JMA, Europe MeteoAlarm), served
 * by the push server's GET /alerts (push-server/src/official.js). Where a feed covers the player, ONLY its issued
 * alerts decide severe weather, damage and achievements; elsewhere the game falls back to observed numbers.
 */
import type { WeatherEventId } from './balance';
import { timeoutSignal } from './hko';
import { PUSH_SERVER } from './native/push';

export type AlertSource = 'nws' | 'eccc' | 'jma' | 'meteoalarm';

export interface OfficialAlert {
  id: string;
  /** Game event, or null (shown only). */
  event: WeatherEventId | null;
  /** Name as issued (local language). */
  name: string;
  nameEn: string;
  /** Colour / severity / JMA status. */
  level: string;
  onset: string | null;
  ends: string | null;
  headline: string;
  description: string;
  instruction: string;
  area: string;
  /** In force when the server answered. */
  active: boolean;
  /** 1.4.27 'jp-heat' / 'jp-heat-special' (環境省 熱中症警戒アラート / 特別警戒アラート) — shown with our translated name. */
  kind?: string;
}

export interface OfficialAlerts {
  covered: boolean;
  source?: AlertSource;
  attribution?: string;
  link?: string;
  alerts: OfficialAlert[];
  fetchedAt: number;
}

const EVENTS: readonly string[] = ['typhoon8', 'typhoon1', 'thunder', 'rainstorm', 'blackrain', 'hot', 'cold'];

export function parseAlerts(body: unknown, now = Date.now()): OfficialAlerts | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Partial<OfficialAlerts> & { alerts?: unknown };
  if (typeof b.covered !== 'boolean') return null;
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const alerts = ((Array.isArray(b.alerts) ? b.alerts : []) as unknown as Record<string, unknown>[]).slice(0, 12).map((a: Record<string, unknown>) => ({
    id: s(a.id),
    event: EVENTS.includes(s(a.event)) ? (s(a.event) as WeatherEventId) : null,
    name: s(a.name),
    nameEn: s(a.nameEn),
    level: s(a.level),
    onset: s(a.onset) || null,
    ends: s(a.ends) || null,
    headline: s(a.headline),
    description: s(a.description),
    instruction: s(a.instruction),
    area: s(a.area),
    active: a.active === true,
    ...(s(a.kind) ? { kind: s(a.kind) } : {}),
  }));
  const source = ['nws', 'eccc', 'jma', 'meteoalarm'].includes(s(b.source)) ? (s(b.source) as AlertSource) : undefined;
  return { covered: b.covered && Boolean(source), source, attribution: s(b.attribution), link: s(b.link), alerts, fetchedAt: now };
}

/** Still in force at `now` (the server's flag, re-checked against the end time for cached answers). */
export function alertInForce(a: OfficialAlert, now = Date.now()): boolean {
  if (!a.active) return false;
  const end = a.ends ? Date.parse(a.ends) : NaN;
  return !(Number.isFinite(end) && end <= now);
}

/** Game events of the alerts in force. */
export function alertEvents(alerts: OfficialAlerts | null | undefined, now = Date.now()): WeatherEventId[] {
  if (!alerts?.covered) return [];
  return [...new Set(alerts.alerts.filter((a) => a.event && alertInForce(a, now)).map((a) => a.event!))];
}

/**
 * Rough boxes of the feed regions (the server decides exactly). Used only while the push server cannot be reached and
 * no earlier answer exists: inside them model numbers still don't stand in for official alerts.
 */
export function likelyFeedRegion(lat: number, lon: number): boolean {
  if (lat >= 24 && lat <= 72 && lon >= -170 && lon <= -52) return true;
  if (lat >= 18 && lat <= 23 && lon >= -161 && lon <= -154) return true;
  if (lat >= 24 && lat <= 46 && lon >= 122.9 && lon <= 154) return true;
  return lat >= 35 && lat <= 71.5 && lon >= -25 && lon <= 32;
}

/** null = the push server could not be reached (the caller keeps its last answer or falls back). */
export async function fetchOfficialAlerts(lat: number, lon: number): Promise<OfficialAlerts | null> {
  try {
    const res = await fetch(`${PUSH_SERVER}/alerts?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, { signal: timeoutSignal(12000) });
    if (!res.ok) return null;
    return parseAlerts(await res.json());
  } catch {
    return null;
  }
}
