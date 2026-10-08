// 世界之樹 push relay.
//  • HK devices: polls HKO warnsum; a warning issued / upgraded → push.
//  • Macau devices (isMO): polls SMG on the same interval as HKO.
//  • Other devices (1.4.27): per ~0.1° area every ~10 min. Where an official feed covers it (NWS / ECCC / JMA + 環境省
//    熱中症 alerts / MeteoAlarm, src/official.js) → push the alerts actually issued (start / upgrade / end, 2 readings to
//    confirm a drop). No feed → observed numbers only (MET Norway hours as they passed + live hour, the game's WX_OBS rules).
//  • 1.4.50 GET /forecast?lat=&lon=&tz= — MET Norway Locationforecast 2.0 (cached, identified) in the Open-Meteo shape.
//  • v1.4: downgrades / cancellations push as info; dead / 瀕死 trees still get warnings (with a state line);
//    wind warnings before 青年樹 become real-life safety notices; the action push / 2 h reminder is skipped once
//    today's matching 應急行動 is done. HKO 山泥傾瀉警告 (WL) is its own category, handled by 加固.
//  • 1.4.14 Taiwan devices (isTW): 中央氣象署 warnings per county / town every TW_POLL_MS, non-HK push rules
//    (safety / tree lines with hk=false, 2 readings to confirm a drop). GET /cwa?lat=&lon= serves the app a
//    normalised bundle; the CWA key (env CWA_API_KEY) never leaves the server.
//  • 1.4.26 GET /alerts?lat=&lon= — official alerts elsewhere (US NWS, Canada ECCC, Japan JMA, Europe MeteoAlarm;
//    src/official.js). { covered:false } = no feed there; the app then uses observed numbers.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { moLabels, normLocale, recordLocale, str } from './i18n.js';
import { deviceMessage, dropMessageFor, levelsFromWarnsum, messageFor, reminderFor, shouldNotify } from './warnings.js';
import { cellKey, intlDropMessageFor, intlMessageFor, levelsFromEvents, observedEventsIntl, parseObserved } from './intl.js';
import { createMetClient, validTz } from './metno.js';
import { createJmaWeather } from './jmawx.js';
import { stepScope } from './alerts.js';
import { TokenStore, parseState, validToken } from './tokens.js';
import { warnsumFromSmg } from './smg.js';
import { createSender } from './fcm.js';
import { createOfficialClient, feedDropMessageFor, feedLevels, feedMessageFor } from './official.js';
import { WARNING_SETS, createCwaClient, cwaWarnings, inTaiwan, twDropMessageFor, twLevels, twMessageFor } from './cwa.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1';
const DATA = process.env.DATA_DIR || path.resolve('data');
const POLL_MS = Number(process.env.POLL_MS || 150_000);
const CELL_POLL_MS = Number(process.env.CELL_POLL_MS || 10 * 60_000);
const CELL_ACTIVE_MS = 14 * 24 * 3600_000;
const MAX_CELLS = Number(process.env.MAX_CELLS || 60);
const TW_POLL_MS = Number(process.env.TW_POLL_MS || 5 * 60_000);
const HKO = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc';
const ALERTS_FILE = path.join(DATA, 'alerts.json');
const LEGACY_LEVELS = path.join(DATA, 'last-levels.json');

const store = new TokenStore(path.join(DATA, 'tokens.json'));
const fcm = await createSender();
const cwa = createCwaClient();
const met = createMetClient({ histFile: path.join(DATA, 'metno-hist.json'), jma: createJmaWeather() });
const official = createOfficialClient();
let lastTwPoll = null;
let lastPoll = null;
let lastSmgPoll = null;
let lastCellPoll = null;
let lastError = null;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}
function writeJson(file, data) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
  fs.renameSync(`${file}.tmp`, file);
}

// alerts.json = { hk: scopeState, cells: { [cell]: scopeState } }. Migrates v1 last-levels.json (no re-notify).
let alerts = readJson(ALERTS_FILE);
if (!alerts) {
  const legacy = readJson(LEGACY_LEVELS);
  alerts = { hk: legacy ? { levels: legacy, alerts: {} } : null, cells: {} };
  if (legacy) alerts.hk = stepScope(null, legacy, Date.now()).state;
}
alerts.cells ??= {};
alerts.mo ??= null;
alerts.tw ??= {};

const isMoDevice = (r) => r.state?.isMO === true;
const isTwDevice = (r) => r.state?.isTW === true && !isMoDevice(r);
const isHkDevice = (r) => !isMoDevice(r) && !isTwDevice(r) && (!r.state || r.state.isHK);

const SMG_C = ['xml/c_actual_brief.xml', 'xml/c_actualweather.xml', 'xml/c_7daysforecast.xml', 'xml/c_forecast.xml', 'xml/c_typhoon.xml', 'xml/c_rainstorm.xml', 'xml/c_thunderstorm.xml', 'xml/c_monsoon.xml', 'rss/c_temperatureAlert_rss.xml'];
// Chinese feed plus SMG's English feed (e_*) for English players' bulletins and forecasts.
const SMG_ALLOW = new Set([...SMG_C, ...SMG_C.map((f) => f.replace('/c_', '/e_'))]);
const SMG_HOST = { xml: 'https://xml.smg.gov.mo', rss: 'https://rss.smg.gov.mo' };

function forSmg(msg, loc) {
  const from = str('hko', loc);
  const to = str('smg', loc);
  return { ...msg, title: msg.title.replaceAll(from, to), body: msg.body.replaceAll(from, to) };
}

/**
 * Send one warning (issue / reminder / drop) to the devices that should get it. `build(locale)` makes the text in each
 * device's language; devices are grouped by their personalised text.
 */
async function push(records, kind, build, hk, localize = (m) => m) {
  const groups = new Map();
  const base = build('zh-HK');
  for (const r of records) {
    if (!shouldNotify(r.state, base.category, Date.now(), kind)) continue;
    const loc = recordLocale(r);
    const msg = localize(deviceMessage(build(loc), r.state, kind, hk, loc), loc);
    const key = `${msg.title}\n${msg.body}`;
    if (!groups.has(key)) groups.set(key, { msg, tokens: [] });
    groups.get(key).tokens.push(r.token);
  }
  if (!groups.size) return console.log(`[push] ${base.title} (${kind}) → nobody needs it`);
  for (const { msg, tokens } of groups.values()) {
    const { sent, dead } = await fcm.send(tokens, msg);
    const removed = store.remove(dead);
    console.log(`[push] ${msg.title} (${kind}) → sent ${sent}/${tokens.length}, removed ${removed} dead tokens`);
  }
}

async function pollHko() {
  try {
    const res = await fetch(HKO, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HKO ${res.status}`);
    const levels = levelsFromWarnsum(await res.json());
    const { state, fresh, reminders, drops } = stepScope(alerts.hk, levels, Date.now());
    alerts.hk = state;
    writeJson(ALERTS_FILE, alerts); // saved before sending: a crash mid-send never re-notifies after restart
    const hk = store.records().filter(isHkDevice);
    for (const w of fresh) await push(hk, 'issue', (l) => messageFor(w, l), true);
    for (const w of drops) await push(hk, 'drop', (l) => dropMessageFor(w, l), true);
    for (const w of reminders) await push(hk, 'reminder', (l) => reminderFor(w, l), true);
    lastPoll = new Date().toISOString();
    lastError = null;
  } catch (e) {
    lastError = String(e?.message ?? e);
    console.error('[hko]', lastError);
  }
}

const smgNames = {};

async function pollSmg() {
  try {
    const load = async (host, file) => {
      const res = await fetch(`${SMG_HOST[host]}/${file}`, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`SMG ${file} ${res.status}`);
      return res.text();
    };
    const [typhoon, rain, temp] = await Promise.all([
      load('xml', 'c_typhoon.xml'),
      load('xml', 'c_rainstorm.xml'),
      load('rss', 'c_temperatureAlert_rss.xml'),
    ]);
    const warnsum = warnsumFromSmg({ typhoon, rain, temp });
    const levels = levelsFromWarnsum(warnsum);
    // Keep the last SMG temperature titles so a later cancel still names the right alert.
    if (warnsum.WHOT?.name) smgNames.heat = warnsum.WHOT.name;
    if (warnsum.WCOLD?.name) smgNames.cold = warnsum.WCOLD.name;
    const mo = moLabels(smgNames);
    const { state, fresh, reminders, drops } = stepScope(alerts.mo, levels, Date.now());
    alerts.mo = state;
    writeJson(ALERTS_FILE, alerts);
    const devices = store.records().filter(isMoDevice);
    for (const w of fresh) await push(devices, 'issue', (l) => messageFor(w, l, mo), true, forSmg);
    for (const w of drops) await push(devices, 'drop', (l) => dropMessageFor(w, l, mo), true, forSmg);
    for (const w of reminders) await push(devices, 'reminder', (l) => reminderFor(w, l, mo), true, forSmg);
    lastSmgPoll = new Date().toISOString();
  } catch (e) {
    console.error('[smg]', String(e?.message ?? e));
  }
}

/** Device → alert area (~0.1°; older apps only send the 0.5° region). */
function areaKey(s) {
  const p = s.area ?? s.region;
  return `${(Math.round(p.lat * 10) / 10).toFixed(1)},${(Math.round(p.lon * 10) / 10).toFixed(1)}`;
}

async function pollCells() {
  const now = Date.now();
  const byArea = new Map();
  for (const r of store.records()) {
    const s = r.state;
    if (!s || s.isHK || s.isMO || s.isTW || !s.region || now - (s.at ?? 0) > CELL_ACTIVE_MS) continue;
    const key = areaKey(s);
    if (!byArea.has(key)) byArea.set(key, []);
    byArea.get(key).push(r);
  }
  const seen = new Set();
  const observedCells = new Map(); // one MET Norway lookup per 0.5° cell per cycle (cached until Expires)
  let n = 0;
  for (const [key, records] of byArea) {
    if (n++ >= MAX_CELLS) break; // rate limit: bounded lookups per cycle (feeds are cached per area / country / office)
    const [lat, lon] = key.split(',').map(Number);
    try {
      const found = await official.lookup(lat, lon);
      if (found) {
        const sk = `f:${key}`;
        seen.add(sk);
        const prev = alerts.cells[sk] ?? null;
        const { levels, names } = feedLevels(found, Date.now());
        const { state, fresh, reminders, drops } = stepScope(prev, levels, Date.now(), { confirmDrops: 2 });
        alerts.cells[sk] = { ...state, names: { ...(prev?.names ?? {}), ...names } };
        writeJson(ALERTS_FILE, alerts);
        for (const x of fresh) await push(records, 'issue', (l) => feedMessageFor(x, names, false, l), false);
        for (const x of drops) await push(records, 'drop', (l) => feedDropMessageFor(x, prev?.names, names, l), false);
        for (const x of reminders) await push(records, 'reminder', (l) => feedMessageFor(x, alerts.cells[sk].names, true, l), false);
        continue;
      }
      const cell = cellKey(lat, lon);
      const sk = `o:${cell}`;
      seen.add(sk);
      if (observedCells.has(cell)) {
        observedCells.get(cell).push(...records);
        continue;
      }
      observedCells.set(cell, [...records]);
    } catch (e) {
      // Feed unreachable: keep the area's state (no pushes, no false "ended").
      seen.add(`f:${key}`);
      console.error('[area]', key, String(e?.message ?? e));
    }
  }
  for (const [cell, records] of observedCells) {
    const sk = `o:${cell}`;
    try {
      const [lat, lon] = cell.split(',').map(Number);
      const tz = validTz(records.find((r) => r.tz)?.tz);
      const levels = levelsFromEvents(observedEventsIntl(parseObserved(await met.observed(lat, lon, tz))));
      const { state, fresh, reminders, drops } = stepScope(alerts.cells[sk] ?? null, levels, Date.now(), { confirmDrops: 2 });
      alerts.cells[sk] = state;
      writeJson(ALERTS_FILE, alerts);
      for (const x of fresh) await push(records, 'issue', (l) => intlMessageFor(x, false, l), false);
      for (const x of drops) await push(records, 'drop', (l) => intlDropMessageFor(x, l), false);
      for (const x of reminders) await push(records, 'reminder', (l) => intlMessageFor(x, true, l), false);
    } catch (e) {
      console.error('[cell]', cell, String(e?.message ?? e));
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  for (const key of Object.keys(alerts.cells)) if (!seen.has(key)) delete alerts.cells[key];
  writeJson(ALERTS_FILE, alerts);
  lastCellPoll = new Date().toISOString();
}

/** Taiwan: one warning check per county / town with an active device; the same stepScope as the observed cells. */
async function pollTw() {
  if (!cwa.enabled) return;
  const now = Date.now();
  const byArea = new Map();
  for (const r of store.records()) {
    const s = r.state;
    if (!s?.isTW || now - (s.at ?? 0) > CELL_ACTIVE_MS) continue;
    const key = s.twCounty ? `${s.twCounty}|${s.twTown ?? ''}` : s.region ? `@${s.region.lat},${s.region.lon}` : null;
    if (!key) continue;
    if (!byArea.has(key)) byArea.set(key, []);
    byArea.get(key).push(r);
  }
  for (const key of Object.keys(alerts.tw)) if (!byArea.has(key)) delete alerts.tw[key];
  if (!byArea.size) {
    lastTwPoll = new Date().toISOString();
    return;
  }
  try {
    const sets = await cwa.sets(WARNING_SETS);
    if (!sets.county && !sets.rainCap && !sets.typhoonCap) throw new Error('CWA warning sets unavailable');
    for (const [key, records] of byArea) {
      let county;
      let town;
      if (key.startsWith('@')) {
        const [lat, lon] = key.slice(1).split(',').map(Number);
        const found = await cwa.warningsAt(lat, lon);
        if (!found) continue;
        county = found.county;
        town = found.town;
      } else [county, town] = key.split('|');
      const { levels, names } = twLevels(cwaWarnings(sets, county, town, Date.now()));
      const prev = alerts.tw[key] ?? null;
      const { state, fresh, reminders, drops } = stepScope(prev, levels, Date.now(), { confirmDrops: 2 });
      alerts.tw[key] = { ...state, names: { ...(prev?.names ?? {}), ...names } };
      writeJson(ALERTS_FILE, alerts);
      for (const x of fresh) await push(records, 'issue', (l) => twMessageFor(x, names, false, l), false);
      for (const x of drops) await push(records, 'drop', (l) => twDropMessageFor(x, prev?.names, names, l), false);
      for (const x of reminders) await push(records, 'reminder', (l) => twMessageFor(x, alerts.tw[key].names, true, l), false);
    }
    lastTwPoll = new Date().toISOString();
  } catch (e) {
    console.error('[cwa]', String(e?.message ?? e));
  }
}

// GET /cwa answers: shared per ~1 km for 5 minutes (the datasets themselves are cached in cwa.js).
const cwaAnswers = new Map();
async function cwaAnswer(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cwaAnswers.get(key);
  // 1.4.58 MeteoAlarm answers only 2 minutes (its terms cap re-use delay at 10 min, average under 5).
  if (hit && Date.now() - hit.at < (hit.body?.source === 'meteoalarm' ? 2 : 5) * 60_000) return hit.body;
  const body = await cwa.bundle(lat, lon);
  if (body) {
    if (cwaAnswers.size > 500) cwaAnswers.clear();
    cwaAnswers.set(key, { at: Date.now(), body });
  }
  return body;
}

// 1.4.26 GET /alerts answers (official NWS / ECCC / JMA / MeteoAlarm alerts): shared per ~2 km for 5 minutes (MeteoAlarm 2).
const alertAnswers = new Map();
async function alertAnswer(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = alertAnswers.get(key);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.body;
  const found = await official.lookup(lat, lon);
  const body = found ?? { covered: false, alerts: [] };
  if (alertAnswers.size > 2000) alertAnswers.clear();
  alertAnswers.set(key, { at: Date.now(), body });
  return body;
}

// Simple per-IP rate limit for the device endpoints: 30 requests / 10 min.
const hits = new Map();
function limited(ip, cap = 30) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > cap;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) if (!list.some((t) => now - t < 600_000)) hits.delete(ip);
}, 600_000).unref();

// The app's WebView origin is https://localhost, so the device calls are cross-origin (CORS preflight).
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' };

function send(res, code, body) {
  res.writeHead(code, { 'content-type': 'application/json', ...CORS });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 8192) {
        reject(new Error('too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('bad json'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === 'GET' && url.pathname.startsWith('/smg/')) {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
    if (limited(`cwa:${ip}`, 120)) return send(res, 429, { ok: false, error: 'rate limited' });
    const rel = url.pathname.slice('/smg/'.length);
    const host = rel.split('/')[0];
    if (!SMG_ALLOW.has(rel) || !SMG_HOST[host]) return send(res, 404, { ok: false });
    try {
      const upstream = await fetch(`${SMG_HOST[host]}/${rel.slice(host.length + 1)}`, { signal: AbortSignal.timeout(12_000) });
      const text = await upstream.text();
      res.writeHead(upstream.ok ? 200 : upstream.status, { 'content-type': 'application/xml; charset=utf-8', ...CORS });
      return res.end(text);
    } catch (e) {
      return send(res, 502, { ok: false, error: String(e?.message ?? e) });
    }
  }
  if (req.method === 'GET' && url.pathname === '/cwa') {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
    if (limited(`cwa:${ip}`, 120)) return send(res, 429, { ok: false, error: 'rate limited' });
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !inTaiwan(lat, lon)) return send(res, 400, { ok: false, error: 'not in Taiwan' });
    if (!cwa.enabled) return send(res, 503, { ok: false, error: 'CWA not configured' });
    try {
      const body = await cwaAnswer(lat, lon);
      if (!body) return send(res, 404, { ok: false, error: 'no station nearby' });
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=120', ...CORS });
      return res.end(JSON.stringify(body));
    } catch (e) {
      return send(res, 502, { ok: false, error: String(e?.message ?? e) });
    }
  }
  if (req.method === 'GET' && url.pathname === '/forecast') {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
    if (limited(`fc:${ip}`, 120)) return send(res, 429, { ok: false, error: 'rate limited' });
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return send(res, 400, { ok: false, error: 'bad lat/lon' });
    try {
      const body = await met.forecast(lat, lon, url.searchParams.get('tz'));
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300', ...CORS });
      return res.end(JSON.stringify(body));
    } catch (e) {
      return send(res, 502, { ok: false, error: String(e?.message ?? e) });
    }
  }
  if (req.method === 'GET' && url.pathname === '/alerts') {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
    if (limited(`alerts:${ip}`, 120)) return send(res, 429, { ok: false, error: 'rate limited' });
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return send(res, 400, { ok: false, error: 'bad lat/lon' });
    try {
      const body = await alertAnswer(lat, lon);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=120', ...CORS });
      return res.end(JSON.stringify(body));
    } catch (e) {
      return send(res, 502, { ok: false, error: String(e?.message ?? e) });
    }
  }
  if (req.method === 'GET' && url.pathname === '/health') {
    const recs = store.records();
    return send(res, 200, {
      ok: true,
      fcm: fcm.enabled,
      devices: recs.length,
      withState: recs.filter((r) => r.state).length,
      cells: Object.keys(alerts.cells).length,
      lastPoll,
      lastSmgPoll,
      lastCellPoll,
      lastTwPoll,
      cwa: cwa.enabled,
      twAreas: Object.keys(alerts.tw).length,
      lastError,
      levels: alerts.hk?.levels ?? null,
    });
  }
  if (req.method === 'POST' && ['/register', '/unregister', '/state'].includes(url.pathname)) {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
    if (limited(ip)) return send(res, 429, { ok: false, error: 'rate limited' });
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return send(res, 400, { ok: false, error: e.message });
    }
    if (!validToken(body.token)) return send(res, 400, { ok: false, error: 'bad token' });
    if (url.pathname === '/unregister') {
      store.remove([body.token]);
      return send(res, 200, { ok: true });
    }
    if (url.pathname === '/state') {
      const state = parseState(body);
      if (!state) return send(res, 400, { ok: false, error: 'bad state' });
      store.setState(body.token, state);
      return send(res, 200, { ok: true });
    }
    const platform = ['android', 'ios', 'web'].includes(body.platform) ? body.platform : 'unknown';
    store.add(body.token, platform, String(body.appVersion ?? '').slice(0, 32), normLocale(body.locale));
    return send(res, 200, { ok: true });
  }
  send(res, 404, { ok: false });
});

server.listen(PORT, HOST, () => console.log(`[server] http://${HOST}:${PORT} · ${store.size} devices · HKO and SMG every ${POLL_MS / 1000}s, CWA ${cwa.enabled ? `every ${TW_POLL_MS / 60000} min` : 'off'}, cells every ${CELL_POLL_MS / 60000} min`));
await pollHko();
void pollSmg();
setInterval(pollHko, POLL_MS);
setInterval(() => void pollSmg(), POLL_MS);
setTimeout(() => void pollCells(), 30_000);
setTimeout(() => void pollTw(), 20_000);
setInterval(() => void pollTw(), TW_POLL_MS);
setInterval(() => void pollCells(), CELL_POLL_MS);
