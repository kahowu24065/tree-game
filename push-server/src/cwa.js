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
};
const TTL = { obs: 10, obsMain: 10, rain: 10, week: 30, county: 3, rainCap: 3, coldCap: 10, heatCap: 10, windCap: 3, typhoonCap: 3 };

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

/** A CAP info block still in force now (not a 解除 notice, not expired, already started). */
function capActive(info, now) {
  if (!info || info.urgency === 'Past') return false;
  if (/解除/.test(`${info.headline ?? ''}${param(info, 'alert_title')}`)) return false;
  const end = Date.parse(info.expires ?? '');
  const start = Date.parse(info.onset ?? info.effective ?? '');
  if (Number.isFinite(end) && now > end) return false;
  if (Number.isFinite(start) && now < start) return false;
  return true;
}

/** Does a CAP area list cover the player's county / town? County entries cover every town in it. */
function covers(info, county, town) {
  return (info.area ?? []).some((a) => {
    const d = String(a.areaDesc ?? '');
    return d === county || (town && d === `${county}${town}`);
  });
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
  const loc = (data?.records?.location ?? []).find((l) => l.locationName === county);
  const list = loc?.hazardConditions?.hazards ?? [];
  return (Array.isArray(list) ? list : [list]).map((h) => {
    const info = h.info ?? h;
    return { phenomena: String(info.phenomena ?? ''), significance: String(info.significance ?? ''), end: h.validTime?.endTime ?? '' };
  }).filter((h) => h.phenomena);
}

/**
 * Warnings in force for a county / town. Each: { type, level, name, issued, text }.
 *   typhoon 1 海上颱風警報 · 2 海上陸上颱風警報 (county on the land-warning list)
 *   rain 1 大雨 · 2 豪雨 · 3 大豪雨 · 4 超大豪雨      wind / cold / heat: 燈號 1 黃 · 2 橙 · 3 紅      fog: shown only
 */
export function cwaWarnings(sets, county, town, now = Date.now()) {
  const out = {};
  const put = (type, level, name, info = null) => {
    if (!level) return;
    if ((out[type]?.level ?? 0) >= level) return;
    out[type] = { type, level, name, issued: info?.effective ?? '', text: String(info?.description ?? '').trim() };
  };
  const hazards = countyHazards(sets.county, county);
  for (const h of hazards) {
    if (/颱風/.test(h.phenomena)) put('typhoon', 2, '海上陸上颱風警報');
    else if (rainTier(h.phenomena)) put('rain', rainTier(h.phenomena), RAIN_NAMES[rainTier(h.phenomena)]);
    else if (/強風/.test(h.phenomena)) put('wind', 1, '陸上強風特報');
    else if (/霧/.test(h.phenomena)) put('fog', 1, '濃霧特報');
  }
  for (const info of capList(sets.typhoonCap)) {
    if (!capActive(info, now)) continue;
    const title = `${info.headline ?? ''}${param(info, 'alert_title')}`;
    const land = /陸上/.test(title) && covers(info, county, town);
    const text = typeof info.description === 'object' ? (info.description.section ?? []).map((s) => s.value).filter(Boolean).slice(0, 2).join(' ') : info.description;
    put('typhoon', land ? 2 : 1, land ? '海上陸上颱風警報' : '海上颱風警報', { ...info, description: text });
  }
  for (const info of capList(sets.rainCap)) {
    if (!capActive(info, now) || !covers(info, county, town)) continue;
    const tier = rainTier(`${param(info, 'alert_title')}${param(info, 'severity_level')}${info.headline ?? ''}`) || 1;
    put('rain', tier, RAIN_NAMES[tier], info);
  }
  const lit = (type, set, title) => {
    for (const info of capList(set)) {
      if (!capActive(info, now) || !covers(info, county, town)) continue;
      const color = colorOf(info) || '黃色';
      put(type, COLOR_LEVEL[color], `${title}（${color}燈號）`, info);
    }
  };
  lit('wind', sets.windCap, '陸上強風特報');
  lit('cold', sets.coldCap, '低溫特報');
  lit('heat', sets.heatCap, '高溫資訊');
  // A county-list 強風 without a CAP colour stays 黃色; a CAP 燈號 replaces it (higher level or same level with detail).
  if (out.wind && !out.wind.text) {
    const cap = capList(sets.windCap).find((i) => capActive(i, now) && covers(i, county, town));
    if (cap) out.wind = { ...out.wind, text: String(cap.description ?? '') };
  }
  const order = ['typhoon', 'rain', 'wind', 'heat', 'cold', 'fog'];
  return order.filter((t) => out[t]).map((t) => out[t]);
}

/**
 * Taiwan warning → game weather events (same table as the app's src/events.ts, checked by the parity test).
 * Harshest per category wins later (topInCategory); here each warning gives one event.
 */
export function eventsFromCwa(warnings) {
  const out = new Set();
  for (const w of warnings ?? []) {
    if (w.type === 'typhoon') out.add(w.level >= 2 ? 'typhoon8' : 'typhoon1');
    else if (w.type === 'rain') out.add(w.level >= 2 ? 'blackrain' : 'rainstorm');
    else if (w.type === 'wind') out.add(w.level >= 3 ? 'typhoon8' : w.level === 2 ? 'thunder' : 'typhoon1');
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
  async function sets(names = Object.keys(DATASETS)) {
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
      const s = await sets(['obs', 'county', 'rainCap', 'coldCap', 'heatCap', 'windCap', 'typhoonCap']);
      const st = nearest(s.obs?.records?.Station, lat, lon)[0];
      if (!st || st.km > 60) return null;
      const county = st.s.GeoInfo?.CountyName ?? '';
      const town = st.s.GeoInfo?.TownName ?? '';
      return { county, town, warnings: cwaWarnings(s, county, town, now()) };
    },
  };
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

const TW_BODY = {
  heat: '快啲幫棵樹做額外澆水（酷熱澆水）！',
  rain: '快啲幫棵樹做大雨疏水！',
  typhoon: '快啲幫棵樹加固，打木樁、綁防風繩！',
  cold: '快啲幫棵樹做保暖，鋪好樹皮乾葉！',
};

/** Taiwan push text with 中央氣象署's own warning names (non-HK rules: deviceMessage(…, hk=false)). */
export function twMessageFor({ category, level }, names, reminder = false) {
  const name = names?.[category] ?? '天氣警特報';
  return reminder
    ? { title: `${name}仍然生效`, body: `棵樹仲未做應急行動：${TW_BODY[category]}`, category, level }
    : { title: `中央氣象署：${name}`, body: TW_BODY[category], category, level };
}

export function twDropMessageFor({ category, from, to }, before, after) {
  const a = before?.[category] ?? '天氣警特報';
  if (to > 0) return { title: `${a}轉${after?.[category] ?? '較低等級'}`, body: '中央氣象署已調低等級，仍要留意天氣。', category, level: to };
  return { title: `${a}已解除`, body: '中央氣象署已經解除，棵樹可以鬆一口氣。', category, level: 0 };
}
