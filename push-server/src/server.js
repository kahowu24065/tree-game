// 世界之樹 push relay: polls HKO warnsum, pushes NEW HK warnings (issue / upgrade) to every registered device.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { diffLevels, levelsFromWarnsum, messageFor } from './warnings.js';
import { TokenStore, validToken } from './tokens.js';
import { createSender } from './fcm.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1'; // Caddy proxies 443 → here
const DATA = process.env.DATA_DIR || path.resolve('data');
const POLL_MS = Number(process.env.POLL_MS || 150_000);
const HKO = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc';
const STATE_FILE = path.join(DATA, 'last-levels.json');

const store = new TokenStore(path.join(DATA, 'tokens.json'));
const fcm = await createSender();
let lastPoll = null;
let lastError = null;

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}
function writeState(s) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(`${STATE_FILE}.tmp`, JSON.stringify(s));
  fs.renameSync(`${STATE_FILE}.tmp`, STATE_FILE);
}

async function poll() {
  try {
    const res = await fetch(HKO, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HKO ${res.status}`);
    const next = levelsFromWarnsum(await res.json());
    const prev = readState();
    const fresh = diffLevels(prev, next);
    writeState(next); // saved before sending: a crash mid-send never re-notifies after restart
    for (const w of fresh) {
      const msg = messageFor(w);
      const { sent, dead } = await fcm.send(store.tokens(), msg);
      const removed = store.remove(dead);
      console.log(`[push] ${msg.title} → sent ${sent}, removed ${removed} dead tokens`);
    }
    lastPoll = new Date().toISOString();
    lastError = null;
  } catch (e) {
    lastError = String(e?.message ?? e);
    console.error('[poll]', lastError);
  }
}

// Simple per-IP rate limit for /register and /unregister: 20 requests / 10 min.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 20;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) if (!list.some((t) => now - t < 600_000)) hits.delete(ip);
}, 600_000).unref();

// The app's WebView origin is https://localhost, so /register is a cross-origin call (CORS preflight).
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
    return send(res, 200, { ok: true, fcm: fcm.enabled, devices: store.size, lastPoll, lastError, levels: readState() });
  }
  if (req.method === 'POST' && (url.pathname === '/register' || url.pathname === '/unregister')) {
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
    const platform = ['android', 'ios', 'web'].includes(body.platform) ? body.platform : 'unknown';
    const appVersion = String(body.appVersion ?? '').slice(0, 32);
    store.add(body.token, platform, appVersion);
    return send(res, 200, { ok: true });
  }
  send(res, 404, { ok: false });
});

server.listen(PORT, HOST, () => console.log(`[server] http://${HOST}:${PORT} · ${store.size} devices · poll every ${POLL_MS / 1000}s`));
await poll();
setInterval(poll, POLL_MS);
