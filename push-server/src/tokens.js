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
  add(token, platform, appVersion) {
    this.map.set(token, { token, platform, appVersion, updatedAt: new Date().toISOString() });
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
