import { cwaName, str } from './i18n.js';
// 交通部中央氣象署 (CWA) open data → one normalised Taiwan weather bundle for the app, plus the warning levels the push
// relay uses. The API key lives only on the server (env CWA_API_KEY); the app calls GET /cwa?lat=&lon= instead.
//
// Datasets (checked against the live API, 2026-10):
//   O-A0001-001  自動氣象站 (≈880 stations)   nearest temperature / humidity / wind / weather text, county + town
//   O-A0003-001  現在天氣觀測 (≈360, 有陣風)   gust and weather text when close enough
//   O-A0002-001  自動雨量站                    past-hour rain at the nearest gauge
//   F-D0047-091  各縣市一週逐 12 小時預報       7-day forecast for the player's county
//   W-C0033-001  各縣市目前天氣警特報           颱風警報、豪(大)雨、陸上強風、濃霧 now in force, by county
//   W-C0033-003  豪(大)雨特報 (CAP)            大雨／豪雨／大豪雨／超大豪雨 with areas
//   W-C0033-004  低溫特報 (CAP)   W-C0033-005 高溫資訊 (CAP)   W-C0033-006 陸上強風特報 (CAP, 燈號)
//   W-C0034-001  颱風警報 (CAP)                海上／海上陸上颱風警報, land-warning counties
//   W-C0033-002  天氣特報 (text)               一、概述 / 二、注意(警戒)事項 + affected counties (1.4.24: detail fallback)
//   大雷雨即時訊息 (1.4.15): the CWA REST API has no thunderstorm dataset (apidoc v1 lists only W-C0033-001..006/-010,
//   W-C0034-001/-005; W-C0033-002 is 天氣特報 text). CWA publishes it as CAP (event 雷雨, eventCode thunderstorm,
//   township areas) through NCDR 民生示警平台; the public 生效中示警 Atom feed needs no key.
export const NCDR_ACTIVE_FEED = 'https://alerts.ncdr.nat.gov.tw/RssAtomFeeds.ashx';
const API = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

export const DATASETS = {
  obs: 'O-A0001-001',
  obsMain: 'O-A0003-001',
  rain: 'O-A0002-001',
  week: 'F-D0047-091',
  county: 'W-C0033-001',
  rainCap: 'W-C0033-003',
  coldCap: 'W-C0033-004',
  heatCap: 'W-C0033-005',
  windCap: 'W-C0033-006',
  typhoonCap: 'W-C0034-001',
  text: 'W-C0033-002',
};
const TTL = { thunderCap: 2, obs: 10, obsMain: 10, rain: 10, week: 30, county: 3, rainCap: 3, coldCap: 10, heatCap: 10, windCap: 3, typhoonCap: 3, text: 3 };

/** Main island (+ Lanyu, Green Island), Penghu, Kinmen / Lieyu and Matsu. Tight enough to leave Fujian out. */
export function inTaiwan(lat, lon) {
  const box = (a, b, c, d) => lat >= a && lat <= b && lon >= c && lon <= d;
  return box(21.85, 25.35, 120.0, 122.1) || box(23.1, 23.9, 119.3, 119.8) || box(24.38, 24.54, 118.28, 118.49) || box(24.39, 24.47, 118.205, 118.27) || box(25.93, 26.4, 119.88, 120.52);
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > -90 ? n : null;
};

function wgs84(st) {
  const c = (st.GeoInfo?.Coordinates ?? []).find((x) => x.CoordinateName === 'WGS84') ?? st.GeoInfo?.Coordinates?.[0];
  return c ? { lat: Number(c.StationLatitude), lon: Number(c.StationLongitude) } : null;
}

function dist2(lat, lon, p) {
  const dy = lat - p.lat;
  const dx = (lon - p.lon) * Math.cos((lat * Math.PI) / 180);
  return dy * dy + dx * dx;
}

/** Stations sorted nearest first (km ≈ √d2 × 111). */
function nearest(stations, lat, lon, ok = () => true) {
  return (stations ?? [])
    .map((s) => ({ s, p: wgs84(s) }))
    .filter((x) => x.p && ok(x.s))
    .map((x) => ({ s: x.s, km: Math.sqrt(dist2(lat, lon, x.p)) * 111 }))
    .sort((a, b) => a.km - b.km);
}

/** CWA weather wording (現在天氣 or 預報 Wx) → HKO icon number, so the app's art and labels apply. */
export function iconFromText(text) {
  const t = String(text ?? '');
  if (!t || t === '-99') return null;
  if (/雷/.test(t)) return 65;
  if (/雪|冰/.test(t)) return 93;
  if (/大雨|豪雨/.test(t)) return 64;
  if (/陣雨|短暫雨|局部雨|午後/.test(t)) return /晴/.test(t) ? 54 : 62;
  if (/雨/.test(t)) return 63;
  if (/霧|靄/.test(t)) return 83;
  if (/^晴$|^晴天$/.test(t)) return 50;
  if (/晴時多雲/.test(t)) return 51;
  if (/多雲時晴/.test(t)) return 52;
  if (/陰/.test(t)) return 61;
  if (/多雲/.test(t)) return 60;
  if (/晴/.test(t)) return 50;
  return 60;
}

function psrFromPop(pop) {
  if (pop === null) return '低';
  if (pop >= 70) return '高';
  if (pop >= 50) return '中高';
  if (pop >= 30) return '中';
  if (pop >= 10) return '中低';
  return '低';
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

/** F-D0047-091 county block → one row per local date (max / min temperature, daytime weather, rain chance, wind). */
export function forecastDays(location) {
  const byName = new Map((location?.WeatherElement ?? []).map((e) => [e.ElementName, e.Time ?? []]));
  const days = new Map();
  const day = (iso) => {
    const date = String(iso).slice(0, 10);
    if (!days.has(date)) days.set(date, { date, max: null, min: null, pop: null, bft: null, wx: null, wxDay: null, text: '', textDay: '' });
    return days.get(date);
  };
  const each = (name, fn) => {
    for (const t of byName.get(name) ?? []) fn(day(t.StartTime ?? t.DataTime), t.ElementValue?.[0] ?? {}, String(t.StartTime ?? '').slice(11, 13));
  };
  each('最高溫度', (d, v) => { const n = num(v.MaxTemperature); if (n !== null) d.max = d.max === null ? n : Math.max(d.max, n); });
  each('最低溫度', (d, v) => { const n = num(v.MinTemperature); if (n !== null) d.min = d.min === null ? n : Math.min(d.min, n); });
  each('12小時降雨機率', (d, v) => { const n = num(v.ProbabilityOfPrecipitation); if (n !== null) d.pop = d.pop === null ? n : Math.max(d.pop, n); });
  each('風速', (d, v) => { const n = num(v.BeaufortScale); if (n !== null) d.bft = d.bft === null ? n : Math.max(d.bft, n); });
  each('天氣現象', (d, v, h) => { if (h === '06') d.wxDay = v.Weather; else d.wx ??= v.Weather; });
  each('天氣預報綜合描述', (d, v, h) => { if (h === '06') d.textDay = v.WeatherDescription; else if (!d.text) d.text = v.WeatherDescription; });
  return [...days.values()]
    .filter((d) => d.max !== null && d.min !== null)
    .map((d) => {
      const wx = d.wxDay ?? d.wx ?? '';
      const [y, m, dd] = d.date.split('-').map(Number);
      return {
        date: d.date,
        week: `星期${WEEK[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]}`,
        text: wx,
        detail: d.textDay || d.text,
        wind: d.bft !== null ? `${d.bft}級` : '',
        tempMax: d.max,
        tempMin: d.min,
        icon: iconFromText(wx) ?? 60,
        pop: d.pop,
        psr: psrFromPop(d.pop),
      };
    });
}

const param = (info, name) => (info.parameter ?? []).find((p) => p.valueName === name)?.value ?? '';

const at = (v) => {
  const n = Date.parse(v ?? '');
  return Number.isFinite(n) ? n : null;
};
/** CWA text datasets give local times ("2026-10-02 11:00:00", Taipei time) → ISO with +08:00. */
export function twIso(v) {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2}))?$/.exec(String(v ?? '').trim());
  return m ? `${m[1]}T${m[2]}:${m[3] ?? '00'}+08:00` : String(v ?? '');
}
const norm = (d) => String(d ?? '').replaceAll('台', '臺').trim();
const tidy = (t) => String(t ?? '').replace(/\r/g, '').replace(/[ \t\u3000]+/g, ' ').replace(/ *\n[\s]*/g, '\n').trim();

/** A CAP info block not cancelled (解除) and not expired. 1.4.24: one that has not started yet still counts (shown with its onset). */
function capLive(info, now) {
  if (!info || info.urgency === 'Past') return false;
  if (/解除/.test(`${info.headline ?? ''}${param(info, 'alert_title')}`)) return false;
  const end = at(info.expires);
  return !(end !== null && now > end);
}

/**
 * Where a CAP applies, seen from the player's county / town: touches (any part of the county), mine (the whole
 * county or the player's own town is listed), areas (the listed towns in the county; [] = whole county), counties.
 */
function areaOf(info, county, town) {
  const list = (info.area ?? []).map((a) => norm(a.areaDesc)).filter(Boolean);
  const c = norm(county);
  const whole = list.includes(c);
  const towns = c ? list.filter((d) => d !== c && d.startsWith(c)).map((d) => d.slice(c.length)) : [];
  const counties = [...new Set(list.map((d) => TW_COUNTIES.find((k) => d.startsWith(k)) ?? d))];
  return { touches: whole || towns.length > 0, mine: whole || Boolean(town && towns.includes(norm(town))), areas: whole ? [] : towns, counties };
}

/** 天氣特報 text (W-C0033-002 contentText, or a CAP description) → 概述 and 注意(警戒)事項. */
export function splitBulletin(text) {
  const t = String(text ?? '').replace(/\r/g, '').trim();
  const pre = /注意(?:\(警戒\)|（警戒）)?事項[:：]?/.exec(t);
  const head = pre ? t.slice(0, pre.index) : t;
  const overview = tidy(head.replace(/^一、\s*概述[:：]?/, '').replace(/二、\s*$/, ''));
  return { overview, precautions: pre ? tidy(t.slice(pre.index + pre[0].length)) : '' };
}

function typeOfName(name) {
  const t = String(name ?? '');
  if (/颱風/.test(t)) return 'typhoon';
  if (rainTier(t)) return 'rain';
  if (/強風/.test(t)) return 'wind';
  if (/低溫/.test(t)) return 'cold';
  if (/高溫/.test(t)) return 'heat';
  if (/霧/.test(t)) return 'fog';
  if (/雷/.test(t)) return 'thunder';
  return '';
}

/** W-C0033-002 天氣特報 → [{ type, counties, overview, precautions, onset, expires, issued }] (解除 notices dropped). */
export function bulletinRecords(data) {
  const list = data?.records?.record;
  return (Array.isArray(list) ? list : list ? [list] : [])
    .map((r) => {
      const di = r.datasetInfo ?? {};
      const text = r.contents?.content?.contentText ?? '';
      const hz = r.hazardConditions?.hazards?.hazard;
      const counties = (Array.isArray(hz) ? hz : hz ? [hz] : []).flatMap((h) => {
        const loc = h.info?.affectedAreas?.location;
        return (Array.isArray(loc) ? loc : loc ? [loc] : []).map((l) => norm(l.locationName));
      });
      return { type: typeOfName(di.datasetDescription), counties, ...splitBulletin(text), onset: twIso(di.validTime?.startTime), expires: twIso(di.validTime?.endTime), issued: twIso(di.issueTime), cancelled: /解除/.test(text) };
    })
    .filter((r) => r.type && !r.cancelled);
}
const COLOR_LEVEL = { 黃色: 1, 橙色: 2, 紅色: 3 };
function colorOf(info) {
  const c = param(info, 'alert_color') || (/(黃|橙|紅)色/.exec(`${param(info, 'severity_level')}${info.headline ?? ''}`)?.[0] ?? '');
  return COLOR_LEVEL[c] ? c : '';
}

export const RAIN_NAMES = ['', '大雨特報', '豪雨特報', '大豪雨特報', '超大豪雨特報'];
export function rainTier(text) {
  const t = String(text ?? '');
  if (/超大豪雨/.test(t)) return 4;
  if (/大豪雨/.test(t)) return 3;
  if (/豪雨/.test(t)) return 2;
  if (/大雨/.test(t)) return 1;
  return 0;
}

function capList(data) {
  const info = data?.records?.info;
  return Array.isArray(info) ? info : info ? [info] : [];
}

/** W-C0033-001 hazards for one county (shape checked defensively: the list is empty on calm days). */
function countyHazards(data, county) {
  const loc = (data?.records?.location ?? []).find((l) => norm(l.locationName) === norm(county));
  const list = loc?.hazardConditions?.hazards ?? [];
  return (Array.isArray(list) ? list : [list]).map((h) => {
    const info = h.info ?? h;
    return { phenomena: String(info.phenomena ?? ''), significance: String(info.significance ?? ''), start: twIso(h.validTime?.startTime ?? ''), end: twIso(h.validTime?.endTime ?? '') };
  }).filter((h) => h.phenomena);
}

/**
 * Warnings for a county / town. Each: { type, level, name, issued, text, overview, precautions, onset, expires, areas,
 * counties, mine, started, active }.
 *   typhoon 1 海上颱風警報 · 2 海上陸上颱風警報 (county on the land-warning list)
 *   rain 1 大雨 · 2 豪雨 · 3 大豪雨 · 4 超大豪雨      wind / cold / heat: 燈號 1 黃 · 2 橙 · 3 紅      fog: shown only
 * 1.4.24: an alert that has not started yet, or that lists other towns of the player's county only, is still returned
 * (with its 概述／注意事項, onset and areas) but `active` is false: no game event, no push.
 */
export function cwaWarnings(sets, county, town, now = Date.now()) {
  const out = {};
  const bulletins = bulletinRecords(sets.text);
  const c = norm(county);
  const make = (type, level, name, src = {}) => {
    const onset = src.onset ?? '';
    const start = at(onset);
    const started = start === null || now >= start;
    const mine = src.mine ?? true;
    const e = { type, level, name, issued: src.issued ?? '', text: '', overview: tidy(src.overview), precautions: tidy(src.precautions), onset, expires: src.expires ?? '', areas: src.areas ?? [], counties: src.counties ?? [], mine, started, active: started && mine };
    if (!e.overview || !e.precautions) {
      const b = bulletins.find((r) => r.type === type && (type === 'typhoon' || r.counties.includes(c)));
      if (b) {
        e.overview ||= b.overview;
        e.precautions ||= b.precautions;
        e.onset ||= b.onset;
        e.expires ||= b.expires;
        e.issued ||= b.issued;
        if (!e.counties.length) e.counties = b.counties;
        const s2 = at(e.onset);
        e.started = s2 === null || now >= s2;
        e.active = e.started && e.mine;
      }
    }
    e.text = e.overview;
    return e;
  };
  const rank = (e) => (e.active ? 10 : 0) + e.level;
  const put = (type, level, name, src) => {
    if (!level) return;
    const e = make(type, level, name, src);
    if (out[type] && rank(out[type]) >= rank(e)) return;
    out[type] = e;
  };
  const fromCap = (info, area) => ({ ...area, onset: info.onset || info.effective || '', expires: info.expires ?? '', issued: info.effective ?? '', overview: info.description, precautions: info.instruction });
  const capTypes = new Set();
  for (const info of capList(sets.typhoonCap)) {
    if (!capLive(info, now)) continue;
    const title = `${info.headline ?? ''}${param(info, 'alert_title')}`;
    const land = /陸上/.test(title) && areaOf(info, county, town).touches;
    const sec = typeof info.description === 'object' ? info.description.section ?? [] : null;
    const overview = sec ? sec.filter((x) => x.title !== '注意事項').map((x) => x.value).filter(Boolean).slice(0, 2).join('\n') : info.description;
    const precautions = sec ? (sec.find((x) => x.title === '注意事項')?.value ?? '') : info.instruction;
    capTypes.add('typhoon');
    put('typhoon', land ? 2 : 1, land ? '海上陸上颱風警報' : '海上颱風警報', { ...fromCap(info, {}), overview, precautions, mine: true });
  }
  for (const info of capList(sets.rainCap)) {
    if (!capLive(info, now)) continue;
    const area = areaOf(info, county, town);
    if (!area.touches) continue;
    capTypes.add('rain');
    const tier = rainTier(`${param(info, 'alert_title')}${param(info, 'severity_level')}${info.headline ?? ''}`) || 1;
    put('rain', tier, RAIN_NAMES[tier], fromCap(info, area));
  }
  const lit = (type, set, title) => {
    for (const info of capList(set)) {
      if (!capLive(info, now)) continue;
      const area = areaOf(info, county, town);
      if (!area.touches) continue;
      capTypes.add(type);
      const color = colorOf(info) || '黃色';
      put(type, COLOR_LEVEL[color], `${title}（${color}燈號）`, fromCap(info, area));
    }
  };
  // 大雷雨即時訊息 (one level; CAP areas are townships, sometimes whole counties).
  for (const info of capList(sets.thunderCap)) {
    if (!capLive(info, now)) continue;
    const area = areaOf(info, county, town);
    if (!area.touches) continue;
    put('thunder', 1, '大雷雨即時訊息', fromCap(info, area));
  }
  lit('wind', sets.windCap, '陸上強風特報');
  lit('cold', sets.coldCap, '低溫特報');
  lit('heat', sets.heatCap, '高溫資訊');
  // County list (W-C0033-001): only for types no CAP describes in more detail (the CAP knows the towns and colour).
  for (const h of countyHazards(sets.county, county)) {
    const end = at(h.end);
    if (end !== null && now > end) continue;
    const src = { onset: h.start, expires: h.end, mine: true };
    const type = typeOfName(h.phenomena);
    if (!type || capTypes.has(type)) continue;
    if (type === 'typhoon') put('typhoon', 2, '海上陸上颱風警報', src);
    else if (type === 'rain') put('rain', rainTier(h.phenomena), RAIN_NAMES[rainTier(h.phenomena)], src);
    else if (type === 'wind') put('wind', 1, '陸上強風特報', src);
    else if (type === 'fog') put('fog', 1, '濃霧特報', src);
  }
  const order = ['typhoon', 'wind', 'thunder', 'rain', 'heat', 'cold', 'fog'];
  return order.filter((t) => out[t]).map((t) => out[t]);
}

/**
 * Taiwan warning → game weather events (same table as the app's src/events.ts, checked by the parity test).
 * Harshest per category wins later (topInCategory); here each warning gives one event.
 */
export function eventsFromCwa(warnings) {
  const out = new Set();
  for (const w of warnings ?? []) {
    if (w.active === false) continue;
    if (w.type === 'typhoon') out.add(w.level >= 2 ? 'typhoon8' : 'typhoon1');
    else if (w.type === 'rain') out.add(w.level >= 2 ? 'blackrain' : 'rainstorm');
    else if (w.type === 'wind') out.add(w.level >= 3 ? 'typhoon8' : w.level === 2 ? 'thunder' : 'typhoon1');
    else if (w.type === 'thunder') out.add('thunder');
    else if (w.type === 'heat') out.add('hot');
    else if (w.type === 'cold') out.add('cold');
  }
  return [...out];
}

/** Build the app bundle from already-downloaded datasets (pure; tests use fixtures). */
export function buildCwa(sets, lat, lon, now = Date.now()) {
  const obs = nearest(sets.obs?.records?.Station, lat, lon, (s) => num(s.WeatherElement?.AirTemperature) !== null);
  const first = obs[0];
  if (!first || first.km > 60) return null;
  const st = first.s;
  const county = st.GeoInfo?.CountyName ?? '';
  const town = st.GeoInfo?.TownName ?? '';
  const main = nearest(sets.obsMain?.records?.Station, lat, lon, (s) => num(s.WeatherElement?.AirTemperature) !== null)[0];
  const el = st.WeatherElement ?? {};
  const mainEl = main && main.km < 25 ? main.s.WeatherElement ?? {} : {};
  const ms = (v) => (num(v) === null ? null : Math.round(num(v) * 3.6));
  const weatherText = [el.Weather, mainEl.Weather].find((w) => w && w !== '-99') ?? '';
  const gauge = nearest(sets.rain?.records?.Station, lat, lon, (s) => num(s.RainfallElement?.Past1hr?.Precipitation) !== null)[0];
  const locs = sets.week?.records?.Locations?.[0]?.Location ?? [];
  const loc = locs.find((l) => l.LocationName === county) ?? locs.map((l) => ({ l, d: dist2(lat, lon, { lat: Number(l.Latitude), lon: Number(l.Longitude) }) })).sort((a, b) => a.d - b.d)[0]?.l;
  const warnings = cwaWarnings(sets, county, town, now);
  return {
    ok: true,
    source: 'cwa',
    fetchedAt: now,
    county,
    town,
    current: {
      station: st.StationName ?? '',
      stationKm: Math.round(first.km * 10) / 10,
      updated: st.ObsTime?.DateTime ?? '',
      tempC: num(el.AirTemperature),
      humidity: num(el.RelativeHumidity),
      windKmh: ms(el.WindSpeed) ?? ms(mainEl.WindSpeed),
      gustKmh: ms(el.GustInfo?.PeakGustSpeed) ?? ms(mainEl.GustInfo?.PeakGustSpeed),
      rainMm1h: gauge && gauge.km < 15 ? num(gauge.s.RainfallElement.Past1hr.Precipitation) : null,
      weather: weatherText,
      icon: iconFromText(weatherText),
    },
    forecast: loc ? forecastDays(loc) : [],
    forecastArea: loc?.LocationName ?? '',
    warnings,
    warningsKnown: Boolean(sets.county || sets.rainCap || sets.typhoonCap),
    events: eventsFromCwa(warnings),
  };
}

/** Dataset loader with a per-dataset cache (the key never leaves the server). */
export function createCwaClient({ key = process.env.CWA_API_KEY, fetchImpl = fetch, now = () => Date.now() } = {}) {
  const cache = new Map();
  async function load(name) {
    if (name === 'thunderCap') return loadThunder();
    const id = DATASETS[name];
    const hit = cache.get(id);
    if (hit && (hit.data || hit.pending) && now() - hit.at < TTL[name] * 60_000) return hit.pending ?? hit.data;
    const pending = (async () => {
      const res = await fetchImpl(`${API}/${id}?format=JSON`, { headers: { Authorization: key ?? '' }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`CWA ${id} ${res.status}`);
      const body = await res.json();
      if (String(body?.success) !== 'true') throw new Error(`CWA ${id} not ok`);
      return body;
    })();
    cache.set(id, { at: now(), pending, data: hit?.data ?? null });
    try {
      const data = await pending;
      cache.set(id, { at: now(), data, pending: null });
      return data;
    } catch (e) {
      // Keep serving the previous copy for a while rather than nothing.
      if (hit?.data && now() - hit.at < 60 * 60_000) {
        cache.set(id, { at: hit.at, data: hit.data, pending: null });
        return hit.data;
      }
      cache.delete(id);
      throw e;
    }
  }
  // NCDR feed → CWA 雷雨 CAP files → { records: { info: [...] } } like the CWA CAP datasets.
  let thunder = null;
  async function loadThunder() {
    if (thunder && now() - thunder.at < TTL.thunderCap * 60_000) return thunder.pending ?? thunder.data;
    const prev = thunder;
    const pending = (async () => {
      const res = await fetchImpl(NCDR_ACTIVE_FEED, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`NCDR feed ${res.status}`);
      const links = thunderLinks(await res.text()).slice(0, 12);
      const caps = await Promise.allSettled(
        links.map(async (href) => {
          const hit = capFiles.get(href);
          if (hit) return hit;
          const r = await fetchImpl(href, { signal: AbortSignal.timeout(15_000) });
          if (!r.ok) throw new Error(`CAP ${r.status}`);
          const info = parseCapXml(await r.text());
          capFiles.set(href, info);
          return info;
        }),
      );
      if (capFiles.size > 200) capFiles.clear();
      return { records: { info: caps.flatMap((c) => (c.status === 'fulfilled' ? c.value : [])) } };
    })();
    thunder = { at: now(), pending, data: prev?.data ?? null };
    try {
      const data = await pending;
      thunder = { at: now(), data, pending: null };
      return data;
    } catch (e) {
      if (prev?.data && now() - prev.at < 30 * 60_000) {
        thunder = { at: prev.at, data: prev.data, pending: null };
        return prev.data;
      }
      thunder = null;
      throw e;
    }
  }
  const capFiles = new Map();
  async function sets(names = [...Object.keys(DATASETS), 'thunderCap']) {
    const got = await Promise.allSettled(names.map(load));
    const out = {};
    names.forEach((n, i) => {
      if (got[i].status === 'fulfilled') out[n] = got[i].value;
    });
    return out;
  }
  return {
    enabled: Boolean(key),
    sets,
    async bundle(lat, lon) {
      return buildCwa(await sets(), lat, lon, now());
    },
    /** Warnings only (push poll): needs the county, so one station list plus the warning sets. */
    async warningsAt(lat, lon) {
      const s = await sets(WARNING_SETS);
      const st = nearest(s.obs?.records?.Station, lat, lon)[0];
      if (!st || st.km > 60) return null;
      const county = st.s.GeoInfo?.CountyName ?? '';
      const town = st.s.GeoInfo?.TownName ?? '';
      return { county, town, warnings: cwaWarnings(s, county, town, now()) };
    },
  };
}

/** Datasets the warning list needs (push poll). */
export const WARNING_SETS = ['obs', 'county', 'text', 'rainCap', 'coldCap', 'heatCap', 'windCap', 'typhoonCap', 'thunderCap'];

const xmlText = (block, tag) => {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(block);
  return m ? m[1].replace(/^<!\\[CDATA\\[/, '').replace(/\\]\\]>$/, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
};

/** CAP links of CWA 雷雨 (大雷雨即時訊息) entries in the NCDR Atom feed. Cancels are skipped. */
export function thunderLinks(atom) {
  const out = [];
  for (const m of String(atom ?? '').matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const cwa = /中央氣象署/.test(xmlText(e, 'name')) || /^CWA/.test(xmlText(e, 'id'));
    const thunder = /雷雨/.test(xmlText(e, 'title')) || /term="雷雨"/.test(e) || /thunderstorm/i.test(xmlText(e, 'id'));
    if (!cwa || !thunder || /Cancel/i.test(xmlText(e, 'cap:msgType'))) continue;
    const href = /<link[^>]*href="([^"]+)"/.exec(e)?.[1];
    if (href && /^https:\/\/alerts\.ncdr\.nat\.gov\.tw\//.test(href) && !out.includes(href)) out.push(href);
  }
  return out;
}

/** One CAP 1.2 XML file → info objects in the CWA JSON CAP shape (headline, onset, expires, description, area[]). */
export function parseCapXml(xml) {
  const s = String(xml ?? '');
  if (/<msgType>\s*Cancel\s*<\/msgType>/i.test(s)) return [];
  return [...s.matchAll(/<info>([\s\S]*?)<\/info>/g)].map((m) => {
    const b = m[1];
    return {
      event: xmlText(b, 'event'),
      urgency: xmlText(b, 'urgency'),
      headline: xmlText(b, 'headline'),
      effective: xmlText(b, 'effective'),
      onset: xmlText(b, 'onset'),
      expires: xmlText(b, 'expires'),
      description: xmlText(b, 'description'),
      parameter: [],
      area: [...b.matchAll(/<area>([\s\S]*?)<\/area>/g)].map((a) => ({ areaDesc: xmlText(a[1], 'areaDesc') })),
    };
  });
}

export const TW_COUNTIES = ['基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'];

const EVENT_LEVEL = { hot: ['heat', 1], cold: ['cold', 1], rainstorm: ['rain', 1], blackrain: ['rain', 2], typhoon1: ['typhoon', 1], thunder: ['typhoon', 2], typhoon8: ['typhoon', 3] };

/** Push levels (same scale as intl.js levelsFromEvents) plus the Taiwan warning name behind each category's level. */
export function twLevels(warnings) {
  const levels = { heat: 0, rain: 0, typhoon: 0, cold: 0, landslip: 0 };
  const names = {};
  for (const w of warnings ?? []) {
    for (const e of eventsFromCwa([w])) {
      const [cat, lv] = EVENT_LEVEL[e];
      if (lv > levels[cat] || (lv === levels[cat] && w.type === 'typhoon')) {
        levels[cat] = lv;
        names[cat] = w.name;
      }
    }
  }
  return { levels, names };
}

const twBody = (category, loc) => str(category === 'rain' ? 'act_rainIntl' : category === 'typhoon' ? 'act_typhoonHigh' : `act_${category}`, loc);

/** Taiwan push text with 中央氣象署's own warning names (non-HK rules: deviceMessage(…, hk=false)), per language. */
export function twMessageFor({ category, level }, names, reminder = false, loc = 'zh-HK') {
  const name = cwaName(names?.[category], loc) ?? str('twGeneric', loc);
  return reminder
    ? { title: str('twStill', loc, { name }), body: str('reminder', loc, { body: twBody(category, loc) }), category, level }
    : { title: str('twIssue', loc, { name }), body: twBody(category, loc), category, level };
}

export function twDropMessageFor({ category, from, to }, before, after, loc = 'zh-HK') {
  const a = cwaName(before?.[category], loc) ?? str('twGeneric', loc);
  if (to > 0) return { title: str('drop', loc, { a, b: cwaName(after?.[category], loc) ?? str('twLower', loc) }), body: str('twDropBody', loc), category, level: to };
  return { title: str('twEnd', loc, { a }), body: str('twEndBody', loc), category, level: 0 };
}
