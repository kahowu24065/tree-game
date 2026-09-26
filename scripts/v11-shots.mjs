// v11 screenshots + live checks: walkers going round a rock / bush, a herd walking without overlaps, a giant island
// overview; checks walkers stay off water / inside the fence, flyers keep tree+5 m, no console errors.
// BASE_URL=http://127.0.0.1:4327/ node scripts/v11-shots.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT || '/workspace/tree-game-shots/v11';
fs.mkdirSync(OUT, { recursive: true });
const base = JSON.parse(fs.readFileSync('/tmp/v11-base-save.json', 'utf8'));
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const results = [];
const ok = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name} — ${detail}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };
const ALL = ['whiteeye', 'sparrow', 'munia', 'swallow', 'tailorbird', 'bulbul', 'butterfly', 'macaque', 'muntjac', 'boar', 'kite', 'squirrel', 'egret', 'cattle', 'buffalo', 'seaeagle', 'parakeet', 'starling'];
const SEASON = { camphor: 's3', deodar: 's6', redwood: 's12' };
const TARGET = { camphor: 5000, deodar: 6000, redwood: 12000 };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
const T = (p, fn, ...a) => p.evaluate(([f, args]) => window.__tree[f](...args), [fn, a]);

async function open(species, heightCm, spawn) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  const save = { ...base, health: 95, moisture: 70, nutrients: 70, animals: ALL, seenAnimals: ALL, residents: [], season: SEASON[species], targetCm: TARGET[species], species, heightCm };
  await p.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v11-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v11-seeded', '1');
  }, [devBase, save]);
  await p.goto(BASE);
  await p.waitForTimeout(3000);
  for (const id of spawn) await T(p, 'spawn', id);
  return { ctx, p };
}

// Overlap / prop numbers for the current frame.
const frameStats = (p) => p.evaluate(() => {
  const w = window.__tree.walkerDump().filter((a) => !a.climb && a.vis > 0.5);
  const nav = window.__tree.navInfo();
  let over = 0, pen = 0, near = [];
  for (let i = 0; i < w.length; i++) {
    for (let j = i + 1; j < w.length; j++) if (Math.hypot(w[i].x - w[j].x, w[i].z - w[j].z) < 0.36 * (w[i].len + w[j].len)) over++;
    for (const o of nav?.obstacles ?? []) {
      const d = Math.hypot(w[i].x - o.x, w[i].z - o.z);
      if (d < o.r + 0.25 * w[i].len) pen++;
      if (!w[i].wade && d < o.r + 1.2 * w[i].len && o.r > 0.3 * w[i].len && (o.kind === 'rock' || o.kind === 'bush')) near.push({ k: w[i].k, id: w[i].id, d: d - o.r, o });
    }
  }
  return { n: w.length, over, pen, near };
});

async function checkLive(p, label, secs) {
  let samples = 0, wet = 0, over = 0, pen = 0, fly = 0, flyBad = 0;
  for (let i = 0; i < secs * 2; i++) {
    await p.waitForTimeout(500);
    for (const w of await T(p, 'walkers')) { samples++; if (w.wet || w.r > w.limit + 0.01) wet++; }
    const s = await frameStats(p);
    over += s.over; pen += s.pen;
    for (const f of await T(p, 'flyers')) { fly++; if (!f.perched && f.y > f.ceiling + 0.01) flyBad++; }
  }
  ok(`${label}: walkers off water, inside the fence`, samples > 0 && wet === 0, `${wet}/${samples} bad`);
  ok(`${label}: no overlaps / prop penetration (live)`, over <= 1 && pen === 0, `overlap frames ${over}, penetrations ${pen}`);
  ok(`${label}: flyers under the ceiling`, flyBad === 0, `${flyBad}/${fly}`);
}

// 1. Small island: find a walker right next to a rock / bush and follow it round.
if (want('rock')) {
  const { ctx, p } = await open('camphor', 300, ['boar', 'muntjac', 'boar', 'muntjac']);
  await checkLive(p, 'camphor 3 m', 8);
  let got = null;
  for (let t = 0; t < 120 && !got; t++) {
    await T(p, 'simStep', 0.05, 10);
    const s = await frameStats(p);
    if (s.near.length) got = s.near.sort((a, b) => a.d - b.d)[0];
  }
  if (got) {
    const crew = (await T(p, 'crews')).find((c) => got.k.startsWith(`${c.uid}:`));
    if (crew) await T(p, 'followCrew', crew.uid);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/02-walker-by-rock.png` });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/03-walker-round-rock.png` });
  }
  ok('walker found next to a rock / bush', !!got, got ? `${got.id} ${got.d.toFixed(2)} m from a ${got.o.kind} (r ${got.o.r.toFixed(2)} m)` : 'none');
  await T(p, 'follow', null);
  await T(p, 'resetView');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/04-camphor3-overview.png` });
  await ctx.close();
}

// 2. Cattle herd at 45 m: follow the herd, check spacing.
if (want('herd')) {
  const { ctx, p } = await open('camphor', 4500, ['cattle', 'boar', 'muntjac']);
  await T(p, 'simStep', 0.05, 200);
  const crews = await T(p, 'crews');
  const herd = crews.filter((c) => c.id === 'cattle' || c.id === 'buffalo').sort((a, b) => b.count - a.count)[0];
  if (herd) await T(p, 'followCrew', herd.uid);
  await p.waitForTimeout(1500);
  await T(p, 'zoomBy', 1.3);
  // Orbit round the herd until the camera has a clear view (not behind the trunk / in the crown).
  let bestAz = 0, bestScore = -1;
  for (let k = 0; k < 4; k++) {
    await p.waitForTimeout(1200);
    const sc = await p.evaluate(() => { const fc = window.__tree.followCam(); return fc && fc.screen ? 1 : 0; });
    const buf = await p.screenshot({ clip: { x: 60, y: 300, width: 270, height: 300 } });
    const score = sc * buf.length; // busier (animals, ground detail) beats a flat wall of leaves
    if (score > bestScore) { bestScore = score; bestAz = k; }
    await T(p, 'orbitBy', Math.PI / 2, 0);
  }
  await T(p, 'orbitBy', (Math.PI / 2) * bestAz, 0);
  await p.waitForTimeout(2500);
  const gap = await p.evaluate((uid) => {
    const w = window.__tree.walkerDump().filter((a) => a.k.startsWith(`${uid}:`) && a.vis > 0.5);
    let min = Infinity;
    for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++) min = Math.min(min, Math.hypot(w[i].x - w[j].x, w[i].z - w[j].z) / (0.5 * (w[i].len + w[j].len)));
    return { n: w.length, min };
  }, herd?.uid);
  await p.screenshot({ path: `${OUT}/05-herd-no-overlap.png` });
  ok('herd spaced out (closest pair ≥ 0.72 body lengths centre-to-centre)', gap.n > 1 && gap.min >= 0.72, `${herd?.id} ×${gap.n}, closest ${gap.min.toFixed(2)} lengths`);
  await checkLive(p, 'camphor 45 m', 8);
  await ctx.close();
}

// 3. Giant island overview.
if (want('giant')) {
  const { ctx, p } = await open('redwood', 12000, ['cattle', 'boar', 'muntjac', 'macaque']);
  await T(p, 'simStep', 0.05, 600);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/06-redwood120-overview.png` });
  await checkLive(p, 'redwood 120 m', 8);
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | ') || 'none');
fs.writeFileSync(`${OUT}/checks.json`, JSON.stringify(results, null, 2));
await browser.close();
process.exit(results.every((r) => r.pass) ? 0 : 1);
