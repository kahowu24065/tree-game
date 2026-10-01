import { TW_COUNTIES } from './cwa.js';
import { LOCALES } from './i18n.js';
// Device token store: a small JSON file (deduped by token), written atomically.
import fs from 'node:fs';
import path from 'node:path';

export function validToken(t) {
  return typeof t === 'string' && t.length >= 20 && t.length <= 4096 && /^[A-Za-z0-9_:\-.]+$/.test(t);
}

export class TokenStore {
  constructor(file) {
    this.file = file;
    this.map = new Map();
    try {
      for (const r of JSON.parse(fs.readFileSync(file, 'utf8'))) this.map.set(r.token, r);
    } catch {
      /* first run */
    }
  }
  get size() { return this.map.size; }
  tokens() { return [...this.map.keys()]; }
  records() { return [...this.map.values()]; }
  add(token, platform, appVersion, locale) {
    const old = this.map.get(token);
    this.map.set(token, { ...old, token, platform, appVersion, ...(locale ? { locale } : {}), updatedAt: new Date().toISOString() });
    this.save();
  }
  /** Per-device game state for action-aware pushes (kept with the token; older records simply have none). */
  setState(token, state) {
    const old = this.map.get(token) ?? { token, platform: 'android', appVersion: '', updatedAt: new Date().toISOString() };
    this.map.set(token, { ...old, state });
    this.save();
  }
  remove(tokens) {
    let n = 0;
    for (const t of tokens) if (this.map.delete(t)) n++;
    if (n) this.save();
    return n;
  }
  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(`${this.file}.tmp`, JSON.stringify([...this.map.values()], null, 1));
    fs.renameSync(`${this.file}.tmp`, this.file);
  }
}

const bool = (v) => v === true;

/** Validate / normalise a POST /state body (null = invalid). */
export function parseState(body, now = Date.now()) {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.day)) return null;
  const tz = typeof body.tz === 'string' && body.tz.length <= 64 ? body.tz : 'Asia/Hong_Kong';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
  } catch {
    return null;
  }
  const d = body.done ?? {};
  const lat = Number(body.region?.lat);
  const lon = Number(body.region?.lon);
  const region = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat: Math.round(lat * 2) / 2, lon: Math.round(lon * 2) / 2 } : null;
  return {
    day: body.day,
    tz,
    done: { heat: bool(d.heat), drain: bool(d.drain), reinforce: bool(d.reinforce), warm: bool(d.warm) },
    region,
    isMO: body.isMO === true,
    // Taiwan (中央氣象署): its own poll by county / town; never the HKO poll or the Open-Meteo cells.
    isTW: body.isTW === true && body.isMO !== true,
    twCounty: body.isTW === true && TW_COUNTIES.includes(body.twCounty) ? body.twCounty : null,
    twTown: body.isTW === true && typeof body.twTown === 'string' && /^[\u4e00-\u9fff]{1,6}$/.test(body.twTown) ? body.twTown : null,
    // Macau is its own fast poll (SMG). Old clients that only send isHK stay on the HKO poll.
    isHK: body.isMO === true || body.isTW === true ? false : body.isHK !== false || !region,
    rUnlocked: body.rUnlocked === true,
    alive: body.alive !== false,
    tree: ['ok', 'dying', 'dead'].includes(body.tree) ? body.tree : body.alive === false ? 'dead' : 'ok',
    // Device language for push text (1.4.19); older apps send none → zh-HK.
    locale: LOCALES.includes(body.locale) ? body.locale : null,
    resist: Number.isFinite(Number(body.resist)) ? Math.max(0, Math.min(100, Math.round(Number(body.resist)))) : null,
    at: now,
  };
}
