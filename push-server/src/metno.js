// 1.4.50 MET Norway Locationforecast 2.0 (api.met.no, CC BY 4.0 / NLOD 2.0) replaces the Open-Meteo free API
// for places outside Hong Kong / Macau / Taiwan. Terms (https://api.met.no/doc/TermsOfService): identifying
// User-Agent, ≤4 decimals, cache until Expires, If-Modified-Since, apps go through a caching proxy (this server).
// The answer is re-shaped like the Open-Meteo body the game already parses (current / hourly / daily / timezone),
// in the device's time zone. Past hours (and the 14-day normals) are the forecast hours as they passed, kept per
// cell in DATA/metno-hist.json — MET Norway has no history endpoint.
import fs from 'node:fs';

export const MET_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
export const MET_UA = 'SekaiTree/1.4.50 https://sekai-tree.pages.dev akar.554426@gmail.com';
const HIST_DAYS = 15;

/** Cache / history cell: 2 decimals (~1 km), well within the 4-decimal rule and shared by nearby players. */
export function metKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/** MET symbol_code → WMO weather code (the game's codes). */
export function symbolToWmo(symbol) {
  const s = String(symbol ?? '').replace(/_(day|night|polartwilight)$/, '');
  if (!s) return 2;
  if (s.includes('thunder')) return 95;
  const table = {
    clearsky: 0, fair: 1, partlycloudy: 2, cloudy: 3, fog: 45,
    lightrainshowers: 80, rainshowers: 81, heavyrainshowers: 82,
    lightrain: 61, rain: 63, heavyrain: 65,
    lightsleetshowers: 80, sleetshowers: 81, heavysleetshowers: 82,
    lightsleet: 66, sleet: 67, heavysleet: 67,
    lightsnowshowers: 85, snowshowers: 85, heavysnowshowers: 86,
    lightsnow: 71, snow: 73, heavysnow: 75,
  };
  return table[s] ?? 3;
}

const r1 = (v) => Math.round(v * 10) / 10;
/** Gust when MET sends none (most places outside the Nordics): mean wind × 1.4, a typical gust factor. */
const gustOf = (inst) => kmh(inst.wind_speed_of_gust) ?? (kmh(inst.wind_speed) === null ? 0 : r1(kmh(inst.wind_speed) * 1.4));
const kmh = (ms) => (typeof ms === 'number' && Number.isFinite(ms) ? r1(ms * 3.6) : null);

/** "YYYY-MM-DDTHH:MM" local time in `tz` for a UTC ms instant. */
export function localIso(ms, tz) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** NOAA sunrise / sunset (UTC ms) for the UTC day containing `noonMs`; null in polar day / night. */
export function sunTimes(lat, lon, noonMs) {
  const rad = Math.PI / 180;
  const d = new Date(noonMs);
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const n = Math.floor((noonMs - start) / 86400000);
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl);
  if (cosH < -1 || cosH > 1) return null;
  const ha = Math.acos(cosH) / rad;
  const day0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return { rise: day0 + (720 - 4 * (lon + ha) - eq) * 60000, set: day0 + (720 - 4 * (lon - ha) - eq) * 60000 };
}

/** One hour per MET step: values valid for the hour starting at `t` (UTC ms). */
export function metHours(body) {
  const out = [];
  for (const s of body?.properties?.timeseries ?? []) {
    const t = Date.parse(s.time);
    const inst = s.data?.instant?.details ?? {};
    const n1 = s.data?.next_1_hours;
    if (!Number.isFinite(t) || !n1) continue; // only the hourly part (the first ~2–3 days)
    out.push({
      t,
      temp: inst.air_temperature ?? null,
      hum: inst.relative_humidity ?? null,
      wind: kmh(inst.wind_speed) ?? 0,
      gust: gustOf(inst),
      mm: n1.details?.precipitation_amount ?? 0,
      prob: n1.details?.probability_of_precipitation ?? null,
      code: symbolToWmo(n1.summary?.symbol_code),
      night: /_night$/.test(n1.summary?.symbol_code ?? ''),
    });
  }
  return out;
}

/** 6-hourly steps after the hourly part (days 3–10), for daily max / min / rain. */
function metSixHours(body, afterMs) {
  const out = [];
  for (const s of body?.properties?.timeseries ?? []) {
    const t = Date.parse(s.time);
    const n6 = s.data?.next_6_hours;
    if (!Number.isFinite(t) || t <= afterMs || s.data?.next_1_hours || !n6) continue;
    const inst = s.data?.instant?.details ?? {};
    out.push({
      t,
      tmax: n6.details?.air_temperature_max ?? inst.air_temperature ?? null,
      tmin: n6.details?.air_temperature_min ?? inst.air_temperature ?? null,
      mm: n6.details?.precipitation_amount ?? 0,
      prob: n6.details?.probability_of_precipitation ?? null,
      wind: kmh(inst.wind_speed) ?? 0,
      gust: gustOf(inst),
      code: symbolToWmo(n6.summary?.symbol_code),
    });
  }
  return out;
}

/** Worst code of a day: thunder > heavier rain / snow > fog > cloud. */
function worse(a, b) {
  const rank = (c) => (c >= 95 ? 100 : c >= 51 ? 50 + (c % 50) : c);
  return rank(b) > rank(a) ? b : a;
}

/**
 * MET body (+ the cell's passed hours) → Open-Meteo-shaped body in `tz`.
 * hourly times are the END of each hour (Open-Meteo convention: totals for the hour ending at `time`).
 */
export function toOpenMeteoShape(body, past, lat, lon, tz, now = Date.now(), opts = {}) {
  const fc = metHours(body);
  const hourStart = Math.floor(now / 3600000) * 3600000;
  const cur = fc.find((h) => h.t === hourStart) ?? fc.find((h) => h.t > hourStart - 3600000) ?? fc[0];
  if (!cur) throw new Error('MET: no hourly data');
  const passed = [...past.filter((h) => h.t + 3600000 <= now)];
  for (const h of fc) if (h.t + 3600000 <= now && !passed.some((p) => p.t === h.t)) passed.push(h);
  passed.sort((a, b) => a.t - b.t);
  const pastHours = passed.filter((h) => h.t >= now - (opts.pastHours ?? 48) * 3600000 - 3600000);
  const future = fc.filter((h) => h.t >= hourStart).slice(0, opts.forecastHours ?? 12);
  const hourly = { time: [], precipitation: [], weather_code: [], wind_gusts_10m: [], wind_speed_10m: [], temperature_2m: [] };
  for (const h of [...pastHours, ...future]) {
    hourly.time.push(localIso(h.t + 3600000, tz));
    hourly.precipitation.push(r1(h.mm));
    hourly.weather_code.push(h.code);
    hourly.wind_gusts_10m.push(h.gust);
    hourly.wind_speed_10m.push(h.wind);
    hourly.temperature_2m.push(h.temp);
  }
  // Daily: past days from the kept hours (normals), then today + up to 6 days from the forecast.
  const days = new Map();
  const day = (date) => {
    if (!days.has(date)) days.set(date, { date, tmax: null, tmin: null, mm: 0, prob: null, wind: 0, gust: 0, code: null, n: 0 });
    return days.get(date);
  };
  const add = (date, x) => {
    const d = day(date);
    if (x.tmax !== null && x.tmax !== undefined) d.tmax = d.tmax === null ? x.tmax : Math.max(d.tmax, x.tmax);
    if (x.tmin !== null && x.tmin !== undefined) d.tmin = d.tmin === null ? x.tmin : Math.min(d.tmin, x.tmin);
    d.mm += x.mm ?? 0;
    if (x.prob !== null && x.prob !== undefined) d.prob = Math.max(d.prob ?? 0, x.prob);
    d.wind = Math.max(d.wind, x.wind ?? 0);
    d.gust = Math.max(d.gust, x.gust ?? 0);
    d.code = d.code === null ? x.code : worse(d.code, x.code);
    d.n++;
  };
  const seen = new Set();
  for (const h of [...passed, ...fc]) {
    if (seen.has(h.t)) continue;
    seen.add(h.t);
    add(localIso(h.t, tz).slice(0, 10), { tmax: h.temp, tmin: h.temp, mm: h.mm, prob: h.prob, wind: h.wind, gust: h.gust, code: h.code });
  }
  const lastHourly = fc.length ? fc[fc.length - 1].t : now;
  for (const s of metSixHours(body, lastHourly)) add(localIso(s.t + 3 * 3600000, tz).slice(0, 10), s);
  const today = localIso(now, tz).slice(0, 10);
  const all = [...days.values()].filter((d) => d.tmax !== null).sort((a, b) => a.date.localeCompare(b.date));
  // Past days only count for normals when (nearly) whole; today and later always kept (max 7).
  const pastDays = all.filter((d) => d.date < today && d.n >= 20).slice(-14);
  const nextDays = all.filter((d) => d.date >= today).slice(0, opts.forecastDays ?? 7);
  const list = [...pastDays, ...nextDays];
  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], wind_gusts_10m_max: [], sunrise: [], sunset: [] };
  for (const d of list) {
    daily.time.push(d.date);
    daily.weather_code.push(d.code ?? 2);
    daily.temperature_2m_max.push(r1(d.tmax));
    daily.temperature_2m_min.push(r1(d.tmin));
    daily.precipitation_sum.push(r1(d.mm));
    daily.precipitation_probability_max.push(d.prob ?? 0);
    daily.wind_speed_10m_max.push(d.wind);
    daily.wind_gusts_10m_max.push(d.gust);
    const [y, m, dd] = d.date.split('-').map(Number);
    // Local noon ≈ 12:00 minus the longitude offset.
    const sun = sunTimes(lat, lon, Date.UTC(y, m - 1, dd, 12) - (lon / 15) * 3600000);
    daily.sunrise.push(sun ? localIso(sun.rise, tz) : `${d.date}T06:00`);
    daily.sunset.push(sun ? localIso(sun.set, tz) : `${d.date}T18:00`);
  }
  const nowLocal = localIso(Math.floor(now / 900000) * 900000, tz);
  const todaySun = sunTimes(lat, lon, now);
  const isDay = todaySun ? now >= todaySun.rise && now < todaySun.set : !cur.night;
  return {
    latitude: lat,
    longitude: lon,
    timezone: tz,
    source: 'MET Norway',
    current: {
      time: nowLocal,
      temperature_2m: cur.temp,
      relative_humidity_2m: cur.hum,
      // Open-Meteo `current.precipitation` covers 15 minutes; MET gives the next hour.
      precipitation: r1(cur.mm / 4),
      weather_code: cur.code,
      wind_speed_10m: cur.wind,
      wind_gusts_10m: cur.gust,
      is_day: isDay ? 1 : 0,
    },
    hourly,
    daily,
  };
}

export function validTz(tz) {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

/** Caching client: one upstream request per cell until Expires; If-Modified-Since afterwards; hours kept as they pass. */
export function createMetClient({ histFile, fetchImpl = fetch, ua = MET_UA, now = () => Date.now() } = {}) {
  const cache = new Map(); // key → { body, expires, lastModified, at }
  const inflight = new Map();
  let hist = {};
  try {
    if (histFile) hist = JSON.parse(fs.readFileSync(histFile, 'utf8'));
  } catch {
    hist = {};
  }
  let dirty = false;
  const save = () => {
    if (!histFile || !dirty) return;
    dirty = false;
    try {
      fs.writeFileSync(`${histFile}.tmp`, JSON.stringify(hist));
      fs.renameSync(`${histFile}.tmp`, histFile);
    } catch (e) {
      console.error('[metno] hist save', String(e?.message ?? e));
    }
  };
  const timer = setInterval(save, 5 * 60_000);
  timer.unref?.();

  function remember(key, body) {
    const t = now();
    const keep = new Map((hist[key] ?? []).map((h) => [h.t, h]));
    for (const h of metHours(body)) if (h.t + 3600000 <= t + 3600000 && h.t <= t) keep.set(h.t, h);
    const cutoff = t - HIST_DAYS * 86400000;
    hist[key] = [...keep.values()].filter((h) => h.t >= cutoff).sort((a, b) => a.t - b.t);
    dirty = true;
    // Drop cells nobody asked for in HIST_DAYS.
    for (const k of Object.keys(hist)) if (!hist[k].length || hist[k][hist[k].length - 1].t < cutoff) delete hist[k];
  }

  async function raw(lat, lon) {
    const key = metKey(lat, lon);
    const hit = cache.get(key);
    const t = now();
    if (hit && hit.expires > t) {
      remember(key, hit.body);
      return { key, body: hit.body };
    }
    if (inflight.has(key)) return inflight.get(key);
    const job = (async () => {
      const [la, lo] = key.split(',');
      const headers = { 'user-agent': ua, 'accept-encoding': 'gzip, deflate' };
      if (hit?.lastModified) headers['if-modified-since'] = hit.lastModified;
      const res = await fetchImpl(`${MET_URL}?lat=${la}&lon=${lo}`, { headers, signal: AbortSignal.timeout(15_000) });
      const exp = Date.parse(res.headers.get('expires') ?? '');
      const expires = Number.isFinite(exp) ? Math.max(exp, now() + 60_000) : now() + 30 * 60_000;
      if (res.status === 304 && hit) {
        hit.expires = expires;
        remember(key, hit.body);
        return { key, body: hit.body };
      }
      if (!res.ok) {
        if (hit) return { key, body: hit.body }; // stale beats nothing
        throw new Error(`MET Norway ${res.status}`);
      }
      const body = await res.json();
      cache.set(key, { body, expires, lastModified: res.headers.get('last-modified') ?? null, at: now() });
      if (cache.size > 2000) cache.delete(cache.keys().next().value);
      remember(key, body);
      return { key, body };
    })().finally(() => inflight.delete(key));
    inflight.set(key, job);
    return job;
  }

  return {
    /** Open-Meteo-shaped forecast for the game (`GET /forecast`). */
    async forecast(lat, lon, tz) {
      const { key, body } = await raw(lat, lon);
      return toOpenMeteoShape(body, hist[key] ?? [], lat, lon, validTz(tz), now());
    },
    /** Same shape, for the observed-number pushes (24 past hours, 1 forecast hour, today). */
    async observed(lat, lon, tz) {
      const { key, body } = await raw(lat, lon);
      return toOpenMeteoShape(body, hist[key] ?? [], lat, lon, validTz(tz), now(), { pastHours: 24, forecastHours: 1, forecastDays: 1 });
    },
    save,
  };
}
