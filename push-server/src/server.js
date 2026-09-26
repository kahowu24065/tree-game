// 世界之樹 push relay.
//  • HK devices: polls HKO warnsum; a warning issued / upgraded → push.
//  • Other devices: per 0.5° cell, Open-Meteo + the game's own rules (src/intl.js) every ~20 min → push new events.
//  • Action-aware: devices report today's 應急行動 via POST /state; done / dead / not-yet-windy trees are skipped.
//  • One follow-up reminder ~2 h later while the warning is still in force and the action is still undone.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { levelsFromWarnsum, messageFor, reminderFor, shouldNotify } from './warnings.js';
import { cellKey, currentEventsIntl, forecastUrl, intlMessageFor, levelsFromEvents, parseOpenMeteo } from './intl.js';
import { stepScope } from './alerts.js';
import { TokenStore, parseState, validToken } from './tokens.js';
import { createSender } from './fcm.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1';
const DATA = process.env.DATA_DIR || path.resolve('data');
const POLL_MS = Number(process.env.POLL_MS || 150_000);
const CELL_POLL_MS = Number(process.env.CELL_POLL_MS || 20 * 60_000);
const CELL_ACTIVE_MS = 14 * 24 * 3600_000;
const MAX_CELLS = Number(process.env.MAX_CELLS || 60);
const HKO = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc';
const ALERTS_FILE = path.join(DATA, 'alerts.json');
const LEGACY_LEVELS = path.join(DATA, 'last-levels.json');

const store = new TokenStore(path.join(DATA, 'tokens.json'));
const fcm = await createSender();
let lastPoll = null;
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

const isHkDevice = (r) => !r.state || r.state.isHK;

async function push(records, category, msg) {
  const targets = records.filter((r) => shouldNotify(r.state, category)).map((r) => r.token);
  if (!targets.length) return console.log(`[push] ${msg.title} → nobody needs it`);
  const { sent, dead } = await fcm.send(targets, msg);
  const removed = store.remove(dead);
  console.log(`[push] ${msg.title} → sent ${sent}/${targets.length}, removed ${removed} dead tokens`);
}

async function pollHko() {
  try {
    const res = await fetch(HKO, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HKO ${res.status}`);
    const levels = levelsFromWarnsum(await res.json());
    const { state, fresh, reminders } = stepScope(alerts.hk, levels, Date.now());
    alerts.hk = state;
    writeJson(ALERTS_FILE, alerts); // saved before sending: a crash mid-send never re-notifies after restart
    const hk = store.records().filter(isHkDevice);
    for (const w of fresh) await push(hk, w.category, messageFor(w));
    for (const w of reminders) await push(hk, w.category, reminderFor(w));
    lastPoll = new Date().toISOString();
    lastError = null;
  } catch (e) {
    lastError = String(e?.message ?? e);
    console.error('[hko]', lastError);
  }
}

async function pollCells() {
  const now = Date.now();
  const byCell = new Map();
  for (const r of store.records()) {
    const s = r.state;
    if (!s || s.isHK || !s.region || now - (s.at ?? 0) > CELL_ACTIVE_MS) continue;
    const key = cellKey(s.region.lat, s.region.lon);
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key).push(r);
  }
  for (const key of Object.keys(alerts.cells)) if (!byCell.has(key)) delete alerts.cells[key];
  let n = 0;
  for (const [key, records] of byCell) {
    if (n++ >= MAX_CELLS) break; // rate limit: bounded fetches per cycle
    try {
      const [lat, lon] = key.split(',').map(Number);
      const res = await fetch(forecastUrl(lat, lon), { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
      const w = parseOpenMeteo(await res.json());
      const levels = levelsFromEvents(currentEventsIntl(w.current, w.today, w.normals));
      const { state, fresh, reminders } = stepScope(alerts.cells[key] ?? null, levels, Date.now());
      alerts.cells[key] = state;
      writeJson(ALERTS_FILE, alerts);
      for (const x of fresh) await push(records, x.category, intlMessageFor(x));
      for (const x of reminders) await push(records, x.category, intlMessageFor(x, true));
    } catch (e) {
      console.error('[cell]', key, String(e?.message ?? e));
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  writeJson(ALERTS_FILE, alerts);
  lastCellPoll = new Date().toISOString();
}

// Simple per-IP rate limit for the device endpoints: 30 requests / 10 min.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
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
  if (req.method === 'GET' && url.pathname === '/health') {
    const recs = store.records();
    return send(res, 200, {
      ok: true,
      fcm: fcm.enabled,
      devices: recs.length,
      withState: recs.filter((r) => r.state).length,
      cells: Object.keys(alerts.cells).length,
      lastPoll,
      lastCellPoll,
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
    store.add(body.token, platform, String(body.appVersion ?? '').slice(0, 32));
    return send(res, 200, { ok: true });
  }
  send(res, 404, { ok: false });
});

server.listen(PORT, HOST, () => console.log(`[server] http://${HOST}:${PORT} · ${store.size} devices · HKO every ${POLL_MS / 1000}s, cells every ${CELL_POLL_MS / 60000} min`));
await pollHko();
setInterval(pollHko, POLL_MS);
setTimeout(() => void pollCells(), 30_000);
setInterval(() => void pollCells(), CELL_POLL_MS);
