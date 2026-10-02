// 1.4.26 Official weather alerts outside HK / Macau / Taiwan, for GET /alerts?lat=&lon= (the app's "official feed" path).
// In a covered region the game counts ONLY these issued alerts (survived / handled) — never model numbers.
//  • US: NWS api.weather.gov (CAP JSON, point query; 400 outside the US = not covered)
//  • Canada: ECCC MSC GeoMet weather-alerts (OGC API, point bbox + polygon test)
//  • Japan: 気象庁 bosai warning JSON (r8 since 2026-05-29) per municipality (GSI reverse geocoder → class20 code)
//  • Europe: MeteoAlarm public country feeds (CAP JSON). Areas are matched by EMMA_ID: the point is located in a
//    compact copy of the EMMA_ID polygons (src/geo/meteoalarm-areas.json.gz, simplified ~400 m, compiled from the
//    saratoga-weather.org MeteoAlarm map data) — or by the alert's own CAP polygon (UK / Norway / Sweden feeds).
// Each answer: { covered, source, attribution, link, alerts:[{ id, event, name, nameEn, level, onset, ends, headline,
// description, instruction, area, active }] }. `event` is the game event id or null (shown, but no game effect).
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UA = 'sekai-tree-push (github.com/kahowu24065/tree-game)';
const FEED_TTL = 5 * 60_000;
const MAX_TEXT = 1500;

export const ATTRIBUTION = {
  nws: 'U.S. National Weather Service (NOAA) — api.weather.gov',
  eccc: 'Environment and Climate Change Canada — MSC GeoMet, Open Government Licence – Canada',
  jma: 'Japan Meteorological Agency 気象庁 — www.jma.go.jp (municipality lookup: GSI 国土地理院)',
  meteoalarm: 'MeteoAlarm (EUMETNET) / national meteorological services — CC BY 4.0',
};
const LINKS = { nws: 'https://www.weather.gov/', eccc: 'https://weather.gc.ca/', jma: 'https://www.jma.go.jp/bosai/warning/', meteoalarm: 'https://meteoalarm.org/' };

const clip = (s) => {
  const t = String(s ?? '').replace(/\r/g, '').trim();
  return t.length > MAX_TEXT ? `${t.slice(0, MAX_TEXT - 1)}…` : t;
};
const ms = (iso) => {
  const t = Date.parse(iso ?? '');
  return Number.isFinite(t) ? t : null;
};
/** Issued and in force right now (not yet started / expired / cancelled → false). */
export function inForce(onset, ends, now) {
  const a = ms(onset);
  const b = ms(ends);
  return (a === null || a <= now) && (b === null || now < b);
}

// ── US NWS ──────────────────────────────────────────────────────────────────────────────────────────────────────
export function nwsEvent(name) {
  const n = String(name ?? '').toLowerCase();
  if (/^flash flood (warning|emergency)/.test(n)) return 'blackrain';
  if (/^flood warning/.test(n)) return 'rainstorm';
  if (/^(hurricane|typhoon|extreme wind|high wind|storm) warning/.test(n)) return 'typhoon8';
  if (/^(tropical storm warning|wind advisory)/.test(n)) return 'typhoon1';
  if (/^(severe thunderstorm|tornado) warning/.test(n)) return 'thunder';
  if (/^(excessive heat|extreme heat|heat) warning/.test(n)) return 'hot';
  if (/^(extreme cold|wind chill|hard freeze|freeze|cold weather) warning/.test(n)) return 'cold';
  return null;
}
export function inUsBox(lat, lon) {
  return (lat >= 15 && lat <= 72 && lon >= -180 && lon <= -60) || (lat >= 13 && lat <= 21 && lon >= 144 && lon <= 146.5);
}
export function parseNws(body, now) {
  return (body?.features ?? [])
    .map((f) => f.properties ?? {})
    .filter((p) => p.status === 'Actual' && p.messageType !== 'Cancel')
    .map((p) => {
      const ends = p.ends ?? p.expires;
      return { id: String(p.id ?? ''), event: nwsEvent(p.event), name: p.event ?? '', nameEn: p.event ?? '', level: p.severity ?? '', onset: p.onset ?? p.effective ?? null, ends: ends ?? null, headline: clip(p.headline), description: clip(p.description), instruction: clip(p.instruction), area: clip(p.areaDesc).slice(0, 300), active: inForce(p.onset ?? p.effective, ends, now) };
    });
}

// ── Canada ECCC ─────────────────────────────────────────────────────────────────────────────────────────────────
export function inCanadaBox(lat, lon) {
  return lat >= 41.6 && lat <= 84 && lon >= -141.1 && lon <= -52.5;
}
export function ecccEvent(name, colour) {
  const n = String(name ?? '').toLowerCase();
  const c = String(colour ?? '').toLowerCase();
  if (/^rainfall warning/.test(n)) return c === 'red' ? 'blackrain' : 'rainstorm';
  if (/^(hurricane warning|wind warning)/.test(n)) return /^wind/.test(n) && c === 'yellow' ? 'typhoon1' : 'typhoon8';
  if (/^tropical storm warning/.test(n)) return 'typhoon1';
  if (/^(severe thunderstorm|tornado) warning/.test(n)) return 'thunder';
  if (/^heat warning/.test(n)) return 'hot';
  if (/^extreme cold warning/.test(n)) return 'cold';
  return null;
}
/** Even-odd point-in-polygon over GeoJSON rings ([lon, lat]). */
function inRings(rings, lat, lon) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
function geoContains(geom, lat, lon) {
  if (!geom) return true;
  if (geom.type === 'Polygon') return inRings(geom.coordinates, lat, lon);
  if (geom.type === 'MultiPolygon') return geom.coordinates.some((p) => inRings(p, lat, lon));
  return true;
}
export function parseEccc(body, lat, lon, now) {
  const seen = new Set();
  const out = [];
  for (const f of body?.features ?? []) {
    const p = f.properties ?? {};
    if (!geoContains(f.geometry, lat, lon)) continue;
    const status = String(p.status_en ?? '').toLowerCase();
    if (/ended|cancel/.test(status)) continue;
    const key = `${p.alert_code}|${p.publication_datetime}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ends = p.event_end_datetime ?? p.expiration_datetime;
    out.push({ id: String(p.id ?? f.id ?? key), event: p.alert_type === 'warning' ? ecccEvent(p.alert_name_en, p.risk_colour_en) : null, name: p.alert_name_fr && p.alert_name_en ? `${p.alert_name_en} / ${p.alert_name_fr}` : p.alert_name_en ?? '', nameEn: p.alert_name_en ?? '', level: p.risk_colour_en ?? '', onset: p.publication_datetime ?? null, ends: ends ?? null, headline: clip(p.alert_name_en), description: clip(p.alert_text_en), instruction: '', area: clip(p.feature_name_en).slice(0, 300), active: inForce(null, ends, now) });
  }
  return out;
}

// ── Japan JMA ───────────────────────────────────────────────────────────────────────────────────────────────────
export const JMA_KINDS = {
  33: ['blackrain', '大雨特別警報', 'Heavy Rain Emergency Warning'],
  43: ['blackrain', '大雨危険警報', 'Heavy Rain Danger Warning'],
  '03': ['rainstorm', '大雨警報', 'Heavy Rain Warning'],
  35: ['typhoon8', '暴風特別警報', 'Storm Emergency Warning'],
  32: ['typhoon8', '暴風雪特別警報', 'Snowstorm Emergency Warning'],
  '05': ['typhoon8', '暴風警報', 'Storm Warning'],
  '02': ['typhoon8', '暴風雪警報', 'Snowstorm Warning'],
  15: ['typhoon1', '強風注意報', 'Gale Advisory'],
  13: ['typhoon1', '風雪注意報', 'Wind and Snow Advisory'],
  14: ['thunder', '雷注意報', 'Thunderstorm Advisory'],
  23: ['cold', '低温注意報', 'Low Temperature Advisory'],
  10: [null, '大雨注意報', 'Heavy Rain Advisory'],
};
export function inJapanBox(lat, lon) {
  return lat >= 24 && lat <= 46 && lon >= 122.9 && lon <= 154;
}
/** class20 code → office code via area.json (class20s → class15s → class10s → offices). */
export function jmaOffice(areaJson, class20) {
  const c20 = areaJson?.class20s?.[class20];
  const c15 = c20 && areaJson.class15s?.[c20.parent];
  const c10 = c15 && areaJson.class10s?.[c15.parent];
  return c10?.parent ?? null;
}
/** r8 reports are split by phenomenon: the latest report that mentions a kind decides it; a 「なし」 report clears all. */
export function parseJma(reports, class20, now) {
  const list = (Array.isArray(reports) ? reports : [reports]).filter(Boolean).slice().sort((a, b) => (ms(a.reportDatetime) ?? 0) - (ms(b.reportDatetime) ?? 0));
  let state = new Map();
  for (const r of list) {
    const item = (r.warning?.class20Items ?? []).find((x) => x.areaCode === class20);
    if (!item) continue;
    for (const k of item.kinds ?? []) {
      if (!k.code) state = new Map();
      else state.set(k.code, { status: k.status ?? '', report: r });
    }
  }
  const out = [];
  for (const [code, { status, report }] of state) {
    if (/解除|なし/.test(status) || !JMA_KINDS[code]) continue;
    const [event, name, nameEn] = JMA_KINDS[code];
    out.push({ id: `${class20}-${code}`, event, name, nameEn, level: status, onset: report.reportDatetime ?? null, ends: null, headline: clip(report.headlineText), description: '', instruction: '', area: '', active: true });
  }
  return out;
}

// ── Europe MeteoAlarm ───────────────────────────────────────────────────────────────────────────────────────────
export const MA_SLUGS = { AT: 'austria', BE: 'belgium', BA: 'bosnia-herzegovina', BG: 'bulgaria', HR: 'croatia', CY: 'cyprus', CZ: 'czechia', DK: 'denmark', EE: 'estonia', FI: 'finland', FR: 'france', DE: 'germany', GR: 'greece', HU: 'hungary', IS: 'iceland', IE: 'ireland', IL: 'israel', IT: 'italy', LV: 'latvia', LT: 'lithuania', LU: 'luxembourg', MT: 'malta', MD: 'moldova', ME: 'montenegro', NL: 'netherlands', MK: 'republic-of-north-macedonia', NO: 'norway', PL: 'poland', PT: 'portugal', RO: 'romania', RS: 'serbia', SK: 'slovakia', SI: 'slovenia', ES: 'spain', SE: 'sweden', CH: 'switzerland', UK: 'united-kingdom' };
/** Feeds that carry CAP polygons instead of EMMA_ID codes, with a rough box for coverage. */
const MA_POLY = { UK: [49.8, -8.7, 61, 1.9], NO: [57.9, 4.5, 71.3, 31.2], SE: [55.3, 10.9, 69.1, 24.2] };
export function inEuropeBox(lat, lon) {
  return lat >= 27 && lat <= 72 && lon >= -32 && lon <= 45;
}
export function maEvent(type, level) {
  const t = parseInt(String(type ?? ''), 10);
  const l = parseInt(String(level ?? ''), 10);
  if (!(l >= 3)) return null;
  if (t === 10 || t === 12 || t === 13) return l >= 4 ? 'blackrain' : 'rainstorm';
  if (t === 1) return l >= 4 ? 'typhoon8' : 'typhoon1';
  if (t === 3) return 'thunder';
  if (t === 5) return 'hot';
  if (t === 6) return 'cold';
  return null;
}
let maAreas = null;
export function loadMeteoalarmAreas(file) {
  if (maAreas && !file) return maAreas;
  const f = file ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'geo', 'meteoalarm-areas.json.gz');
  const raw = JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'));
  maAreas = Object.entries(raw).map(([code, [country, name, bbox, polys]]) => ({ code, country, name, bbox, polys }));
  return maAreas;
}
/** EMMA areas containing the point (rings are flat [lat*1000, lon*1000, …]). */
export function emmaAt(areas, lat, lon) {
  const y = lat * 1000;
  const x = lon * 1000;
  const out = [];
  for (const a of areas) {
    const [la0, lo0, la1, lo1] = a.bbox;
    if (lat < la0 || lat > la1 || lon < lo0 || lon > lo1) continue;
    let hitAny = false;
    for (const poly of a.polys) {
      let inside = false;
      for (const r of poly) {
        for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
          const yi = r[i];
          const xi = r[i + 1];
          const yj = r[j];
          const xj = r[j + 1];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
      }
      if (inside) hitAny = true;
    }
    if (hitAny) out.push(a);
  }
  return out;
}
function capPolygonHas(poly, lat, lon) {
  const pts = String(poly).trim().split(/\s+/).map((p) => p.split(',').map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite));
  if (pts.length < 3) return false;
  return inRings([pts.map(([la, lo]) => [lo, la])], lat, lon);
}
const param = (info, name) => (info?.parameter ?? []).find((p) => p.valueName === name)?.value ?? '';
export function parseMeteoalarm(body, { codes = [], lat, lon }, now) {
  const want = new Set(codes);
  const out = new Map();
  for (const w of body?.warnings ?? []) {
    const a = w.alert ?? {};
    if (a.status !== 'Actual' || a.msgType === 'Cancel') continue;
    const infos = a.info ?? [];
    const en = infos.find((i) => /^en/i.test(i.language ?? '')) ?? infos[0];
    const local = infos.find((i) => !/^en/i.test(i.language ?? '')) ?? en;
    if (!en) continue;
    const areas = (en.area ?? []).filter((ar) => (ar.geocode ?? []).some((g) => g.valueName === 'EMMA_ID' && want.has(g.value)) || (ar.polygon ?? []).some((p) => capPolygonHas(p, lat, lon)));
    if (!areas.length) continue;
    const level = param(en, 'awareness_level');
    const type = param(en, 'awareness_type');
    const event = maEvent(type, level);
    const colour = level.split(';')[1]?.trim() ?? '';
    const active = inForce(en.onset ?? en.effective, en.expires, now);
    const key = `${type}|${colour}|${en.onset}|${en.expires}`;
    const item = { id: String(a.identifier ?? w.uuid ?? key), event, name: local?.event ?? en.event ?? '', nameEn: en.event ?? '', level: colour, onset: en.onset ?? null, ends: en.expires ?? null, headline: clip(en.headline), description: clip(en.description), instruction: clip(en.instruction), area: clip(areas.map((ar) => ar.areaDesc).join(', ')).slice(0, 300), active };
    if (!out.has(key)) out.set(key, item);
  }
  return [...out.values()];
}

/** Drop ended / green (no-risk) items and repeats; in-force first, at most 12. */
export function tidyAlerts(alerts, now) {
  const seen = new Set();
  return alerts
    .filter((a) => !/^(green|minor-green)$/i.test(a.level ?? '') && !(ms(a.ends) !== null && ms(a.ends) <= now))
    .filter((a) => {
      const k = `${a.name}|${a.level}|${a.active}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => Number(b.active) - Number(a.active))
    .slice(0, 12);
}

// ── client ──────────────────────────────────────────────────────────────────────────────────────────────────────
export function createOfficialClient({ fetchImpl = globalThis.fetch, now = () => Date.now(), areasFile } = {}) {
  const cache = new Map();
  async function cached(key, ttl, load) {
    const hit = cache.get(key);
    if (hit && now() - hit.at < ttl) return hit.value;
    const value = await load();
    if (cache.size > 800) cache.clear();
    cache.set(key, { at: now(), value });
    return value;
  }
  async function getJson(url, { allow400 = false } = {}) {
    const res = await fetchImpl(url, { headers: { 'user-agent': UA, accept: 'application/geo+json, application/json' }, signal: AbortSignal.timeout(15_000) });
    if (allow400 && (res.status === 400 || res.status === 404)) return null;
    if (!res.ok) throw new Error(`${new URL(url).host} HTTP ${res.status}`);
    return res.json();
  }
  const answer = (source, alerts) => ({ covered: true, source, attribution: ATTRIBUTION[source], link: LINKS[source], alerts: tidyAlerts(alerts, now()) });

  async function nws(lat, lon) {
    const body = await cached(`nws:${lat.toFixed(3)},${lon.toFixed(3)}`, FEED_TTL, () => getJson(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`, { allow400: true }));
    return body ? answer('nws', parseNws(body, now())) : null;
  }
  async function eccc(lat, lon) {
    const d = 0.01;
    const url = `https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=100&bbox=${(lon - d).toFixed(3)},${(lat - d).toFixed(3)},${(lon + d).toFixed(3)},${(lat + d).toFixed(3)}`;
    const body = await cached(`eccc:${lat.toFixed(2)},${lon.toFixed(2)}`, FEED_TTL, () => getJson(url));
    return answer('eccc', parseEccc(body, lat, lon, now()));
  }
  async function jma(lat, lon) {
    const geo = await cached(`gsi:${lat.toFixed(3)},${lon.toFixed(3)}`, 7 * 24 * 3600_000, () => getJson(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}`, { allow400: true }));
    const muni = geo?.results?.muniCd;
    if (!muni) return null;
    const class20 = `${String(muni).padStart(5, '0')}00`;
    const areaJson = await cached('jma:area', 24 * 3600_000, () => getJson('https://www.jma.go.jp/bosai/common/const/area.json'));
    const office = jmaOffice(areaJson, class20);
    if (!office) return null;
    const reports = await cached(`jma:${office}`, FEED_TTL, () => getJson(`https://www.jma.go.jp/bosai/warning/data/r8/${office}.json`));
    return answer('jma', parseJma(reports, class20, now()));
  }
  async function meteoalarm(lat, lon) {
    const areas = emmaAt(loadMeteoalarmAreas(areasFile), lat, lon);
    let countries = [...new Set(areas.map((a) => a.country))];
    if (!countries.length) countries = Object.entries(MA_POLY).filter(([, [a, b, c, d]]) => lat >= a && lat <= c && lon >= b && lon <= d).map(([k]) => k);
    countries = countries.filter((c) => MA_SLUGS[c]);
    if (!countries.length) return null;
    const codes = areas.map((a) => a.code);
    const alerts = [];
    for (const c of countries) {
      const body = await cached(`ma:${c}`, FEED_TTL, () => getJson(`https://feeds.meteoalarm.org/api/v1/warnings/feeds-${MA_SLUGS[c]}`));
      alerts.push(...parseMeteoalarm(body, { codes, lat, lon }, now()));
    }
    return answer('meteoalarm', alerts);
  }

  /** null = no official feed here (the app falls back to observed numbers). Throws on an upstream failure. */
  async function lookup(lat, lon) {
    if (inUsBox(lat, lon)) {
      const us = await nws(lat, lon);
      if (us) return us;
      if (inCanadaBox(lat, lon)) return eccc(lat, lon);
      return null;
    }
    if (inCanadaBox(lat, lon)) return eccc(lat, lon);
    if (inJapanBox(lat, lon)) return jma(lat, lon);
    if (inEuropeBox(lat, lon)) return meteoalarm(lat, lon);
    return null;
  }
  return { lookup };
}
