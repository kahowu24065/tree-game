// 1.4.51 Japan: JMA (気象庁) numbers instead of MET Norway where JMA has them. Public Data License 1.0 (出典：気象庁,
// processed by the game). Current reading + past 24 h from the nearest AMeDAS station (bosai/amedas point data:
// temp, humidity, 10-min rain, wind, gust); daily weather / max / min / chance of rain from bosai/forecast for the
// office area. Everything JMA lacks (hourly forecast, daily rain mm, wind forecast, sun) stays MET Norway.
import { localIso } from './metno.js';

const UA = 'SekaiTree push relay (https://sekai-tree.pages.dev; akar.554426@gmail.com)';
const BASE = 'https://www.jma.go.jp/bosai';
const r1 = (v) => Math.round(v * 10) / 10;
const val = (x) => (Array.isArray(x) && typeof x[0] === 'number' && x[1] === 0 ? x[0] : null); // [value, quality 0 = ok]

/** JMA forecast weather code (100 晴, 200 曇, 300 雨, 400 雪; 2nd digit = changes) → WMO code. */
export function jmaToWmo(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return null;
  const s = String(c);
  if ([240, 250, 340, 350].includes(c) || /雷/.test(s)) return 95;
  const main = Math.floor(c / 100);
  if (main === 1) return c === 100 ? 0 : c < 110 ? 1 : 2;
  if (main === 2) return c === 200 ? 3 : c < 210 ? 2 : 3;
  if (main === 3) return c === 308 ? 65 : c === 300 ? 63 : 61;
  if (main === 4) return c === 405 ? 75 : 73;
  return null;
}

const dist2 = (lat, lon, la, lo) => (lat - la) ** 2 + ((lon - lo) * Math.cos((lat * Math.PI) / 180)) ** 2;
const deg = (a) => a[0] + a[1] / 60;

/** Nearest station in amedastable.json with temperature (elems[0]) and wind (elems[2]); within ~40 km. */
export function nearestStation(table, lat, lon, maxKm = 40) {
  let best = null;
  for (const [code, s] of Object.entries(table ?? {})) {
    if (!s?.elems || s.elems[0] !== '1' || s.elems[2] !== '1') continue;
    const d = dist2(lat, lon, deg(s.lat), deg(s.lon));
    if (!best || d < best.d) best = { code, d, name: s.kjName, enName: s.enName };
  }
  return best && Math.sqrt(best.d) * 111 <= maxKm ? best : null;
}

/** Nearest temperature point among forecast `areas` (AMeDAS codes) using the station table. */
function nearestArea(areas, table, lat, lon) {
  let best = null;
  for (const a of areas ?? []) {
    const s = table?.[a.area?.code];
    if (!s) continue;
    const d = dist2(lat, lon, deg(s.lat), deg(s.lon));
    if (!best || d < best.d) best = { a, d };
  }
  return best?.a ?? areas?.[0] ?? null;
}

/** AMeDAS point records (10-minute, keyed YYYYMMDDHHmmss JST) → hours (UTC ms of the hour START) + latest record. */
export function amedasHours(records) {
  const keys = Object.keys(records).sort();
  const hours = new Map();
  for (const k of keys) {
    const r = records[k];
    const t = Date.UTC(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8), +k.slice(8, 10), +k.slice(10, 12)) - 9 * 3600000;
    // The 10-minute value at hh:mm covers (hh:mm-10, hh:mm]; hh:00 belongs to the previous hour.
    const start = Math.floor((t - 1) / 3600000) * 3600000;
    const h = hours.get(start) ?? { t: start, temp: null, hum: null, wind: 0, gust: 0, mm: 0, n: 0, code: 0 };
    const temp = val(r.temp), hum = val(r.humidity), wind = val(r.wind), gust = val(r.gust), mm = val(r.precipitation10m);
    if (temp !== null) h.temp = temp;
    if (hum !== null) h.hum = hum;
    if (wind !== null) h.wind = Math.max(h.wind, r1(wind * 3.6));
    if (gust !== null) h.gust = Math.max(h.gust, r1(gust * 3.6));
    if (mm !== null) h.mm = r1(h.mm + mm);
    h.n++;
    hours.set(start, h);
  }
  for (const h of hours.values()) {
    h.gust = Math.max(h.gust, h.wind);
    h.code = h.mm >= 8 ? 65 : h.mm >= 2.5 ? 63 : h.mm >= 0.5 ? 61 : h.mm > 0 ? 51 : null;
  }
  const lastKey = keys[keys.length - 1];
  return { hours: [...hours.values()].sort((a, b) => a.t - b.t), last: lastKey ? records[lastKey] : null, lastKey };
}

export function createJmaWeather({ fetchImpl = fetch, now = () => Date.now() } = {}) {
  const cache = new Map();
  async function cached(key, ttl, load) {
    const hit = cache.get(key);
    if (hit && now() - hit.at < ttl) return hit.value;
    const value = await load();
    if (cache.size > 1500) cache.clear();
    cache.set(key, { at: now(), value });
    return value;
  }
  async function getJson(url, allowMissing = false) {
    const res = await fetchImpl(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (allowMissing && (res.status === 404 || res.status === 400)) return null;
    if (!res.ok) throw new Error(`${new URL(url).host} HTTP ${res.status}`);
    return res.json();
  }
  async function getText(url) {
    const res = await fetchImpl(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`JMA HTTP ${res.status}`);
    return res.text();
  }

  /** Office (府県予報区) code for a point, via GSI municipality → area.json; null outside Japan. */
  async function office(lat, lon) {
    const geo = await cached(`gsi:${lat.toFixed(3)},${lon.toFixed(3)}`, 7 * 86400000, () => getJson(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}`, true));
    const muni = geo?.results?.muniCd;
    if (!muni) return null;
    const area = await cached('jma:area', 86400000, () => getJson(`${BASE}/common/const/area.json`));
    const c20 = area?.class20s?.[`${String(muni).padStart(5, '0')}00`];
    const c15 = c20 && area.class15s?.[c20.parent];
    const c10 = c15 && area.class10s?.[c15.parent];
    let off = c10?.parent ?? null;
    return off ? { office: off, class10: c15?.parent ?? null } : null;
  }

  /** Last 24 h of 10-minute records for a station (3-hour files; finished files cached long). */
  async function amedas(code) {
    const latest = await cached('amedas:latest', 5 * 60000, () => getText(`${BASE}/amedas/data/latest_time.txt`));
    const t = Date.parse(latest.trim());
    if (!Number.isFinite(t)) throw new Error('AMeDAS latest_time');
    const records = {};
    for (let i = 0; i < 9; i++) {
      const jst = new Date(t + 9 * 3600000 - i * 3 * 3600000);
      const ymd = jst.toISOString().slice(0, 10).replace(/-/g, '');
      const hh = String(Math.floor(jst.getUTCHours() / 3) * 3).padStart(2, '0');
      const key = `${code}/${ymd}_${hh}`;
      const body = await cached(`pt:${key}`, i === 0 ? 5 * 60000 : 6 * 3600000, () => getJson(`${BASE}/amedas/data/point/${key}.json`, true)).catch(() => null);
      if (body) Object.assign(records, body);
    }
    return records;
  }

  /**
   * Put JMA numbers into an Open-Meteo-shaped body (from metno.js). Returns { station, office } when JMA was used,
   * null when the point isn't in Japan / no station; throws on upstream errors (caller keeps MET Norway).
   */
  async function overlay(body, lat, lon, tz) {
    const where = await office(lat, lon);
    if (!where) return null;
    const table = await cached('amedas:table', 86400000, () => getJson(`${BASE}/amedas/const/amedastable.json`));
    const st = nearestStation(table, lat, lon);
    const used = { office: where.office, station: st?.name ?? null, parts: [] };
    if (st) {
      const { hours, last } = amedasHours(await amedas(st.code));
      const c = body.current;
      if (last) {
        const temp = val(last.temp), hum = val(last.humidity), wind = val(last.wind), gust = val(last.gust), mm10 = val(last.precipitation10m);
        if (temp !== null) c.temperature_2m = temp;
        if (hum !== null) c.relative_humidity_2m = hum;
        if (wind !== null) c.wind_speed_10m = r1(wind * 3.6);
        if (gust !== null) c.wind_gusts_10m = Math.max(r1(gust * 3.6), c.wind_speed_10m);
        else if (wind !== null) c.wind_gusts_10m = Math.max(c.wind_gusts_10m ?? 0, c.wind_speed_10m);
        if (mm10 !== null) {
          c.precipitation = r1(mm10 * 1.5); // Open-Meteo's `current.precipitation` is a 15-minute total
          if (mm10 > 0 && !(c.weather_code >= 51)) c.weather_code = mm10 >= 1.5 ? 63 : 61;
        }
        used.parts.push('current');
      }
      // Completed observed hours replace the model's past hours (forecast hours stay MET Norway).
      const t = now();
      const done = hours.filter((h) => h.t + 3600000 <= t && h.n >= 5);
      if (done.length) {
        const h = body.hourly;
        const keep = h.time.map((x, i) => i).filter((i) => !done.some((d) => localIso(d.t + 3600000, tz) === h.time[i]) && h.time[i] > localIso(done[done.length - 1].t + 3600000, tz));
        const merged = [
          ...h.time.map((x, i) => i).filter((i) => h.time[i] < localIso(done[0].t + 3600000, tz)).map((i) => ({ time: h.time[i], mm: h.precipitation[i], code: h.weather_code[i], gust: h.wind_gusts_10m[i], wind: h.wind_speed_10m[i], temp: h.temperature_2m?.[i] ?? null })),
          ...done.map((d, k) => {
            const time = localIso(d.t + 3600000, tz);
            const mi = h.time.indexOf(time);
            return { time, mm: d.mm, code: d.code ?? (d.mm > 0 ? 61 : mi >= 0 ? Math.min(h.weather_code[mi], 48) : 2), gust: d.gust, wind: d.wind, temp: d.temp };
          }),
          ...keep.map((i) => ({ time: h.time[i], mm: h.precipitation[i], code: h.weather_code[i], gust: h.wind_gusts_10m[i], wind: h.wind_speed_10m[i], temp: h.temperature_2m?.[i] ?? null })),
        ];
        body.hourly = { time: [], precipitation: [], weather_code: [], wind_gusts_10m: [], wind_speed_10m: [], temperature_2m: [] };
        for (const m of merged) {
          body.hourly.time.push(m.time);
          body.hourly.precipitation.push(m.mm);
          body.hourly.weather_code.push(m.code);
          body.hourly.wind_gusts_10m.push(m.gust);
          body.hourly.wind_speed_10m.push(m.wind);
          body.hourly.temperature_2m.push(m.temp);
        }
        // Today's observed max / min so far count towards the day.
        const today = localIso(t, tz).slice(0, 10);
        const di = body.daily.time.indexOf(today);
        const temps = done.filter((d) => localIso(d.t, tz).slice(0, 10) === today && d.temp !== null).map((d) => d.temp);
        if (di >= 0 && temps.length) {
          body.daily.temperature_2m_max[di] = Math.max(body.daily.temperature_2m_max[di], ...temps);
          body.daily.temperature_2m_min[di] = Math.min(body.daily.temperature_2m_min[di], ...temps);
        }
        used.parts.push('past hours');
      }
    }
    // Office forecast: weather code, max / min, chance of rain per day (JMA wording "pops").
    const fc = await cached(`fc:${where.office}`, 30 * 60000, () => getJson(`${BASE}/forecast/data/forecast/${where.office}.json`, true));
    if (Array.isArray(fc) && fc.length) {
      const d = body.daily;
      const set = (date, f) => {
        const i = d.time.indexOf(date);
        if (i >= 0) f(i);
      };
      const dateOf = (iso) => iso.slice(0, 10); // JMA times are JST; Japan devices use Asia/Tokyo
      const pick = (series) => series?.areas?.find((a) => a.area?.code === where.class10) ?? series?.areas?.[0];
      const week = fc[1]?.timeSeries;
      if (week?.[0]) {
        const a = pick(week[0]) ?? week[0].areas?.find((x) => String(where.class10 ?? '').startsWith(String(x.area?.code ?? '').slice(0, 4)));
        week[0].timeDefines.forEach((iso, k) => {
          const code = jmaToWmo(a?.weatherCodes?.[k]);
          const pop = Number(a?.pops?.[k]);
          set(dateOf(iso), (i) => {
            if (code !== null) d.weather_code[i] = code;
            if (a?.pops?.[k] !== '' && Number.isFinite(pop)) d.precipitation_probability_max[i] = pop;
          });
        });
      }
      if (week?.[1]) {
        const a = nearestArea(week[1].areas, table, lat, lon);
        week[1].timeDefines.forEach((iso, k) => {
          const hi = Number(a?.tempsMax?.[k]), lo = Number(a?.tempsMin?.[k]);
          set(dateOf(iso), (i) => {
            if (a?.tempsMax?.[k] !== '' && Number.isFinite(hi)) d.temperature_2m_max[i] = hi;
            if (a?.tempsMin?.[k] !== '' && Number.isFinite(lo)) d.temperature_2m_min[i] = lo;
          });
        });
      }
      // Short-term (today / tomorrow): weather code + max / min where the weekly one is blank.
      const short = fc[0]?.timeSeries;
      if (short?.[0]) {
        const a = pick(short[0]);
        short[0].timeDefines.forEach((iso, k) => {
          const code = jmaToWmo(a?.weatherCodes?.[k]);
          set(dateOf(iso), (i) => {
            if (code !== null) d.weather_code[i] = code;
          });
        });
      }
      if (short?.[2]) {
        const a = nearestArea(short[2].areas, table, lat, lon);
        const temps = (a?.temps ?? []).map(Number);
        short[2].timeDefines.forEach((iso, k) => {
          if (!Number.isFinite(temps[k]) || a.temps[k] === '') return;
          set(dateOf(iso), (i) => {
            // 00:00 → that day's min, 09:00 → that day's max (JMA short-term convention)
            if (/T09:/.test(iso)) d.temperature_2m_max[i] = temps[k];
            else if (/T00:/.test(iso)) d.temperature_2m_min[i] = temps[k];
          });
        });
      }
      used.parts.push('forecast');
    }
    body.source = 'JMA + MET Norway';
    body.jma = used;
    return used;
  }
  return { overlay, office };
}
