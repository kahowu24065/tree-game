// v11 instrumentation: record every ground walker's position every simulated step (dt 0.05 s) for a few simulated
// minutes, in several scenes (small → giant islands). Output JSON for scripts/v11-analyze.mjs.
// BASE_URL=http://127.0.0.1:4327/ TAG=after SIM=180 node scripts/v11-tracks.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const TAG = process.env.TAG || 'after';
const SIM = Number(process.env.SIM || 180);
const DT = 0.05;
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
export const SCENARIOS = [
  { key: 'camphor3', species: 'camphor', heightCm: 300, spawn: ['muntjac', 'boar', 'egret', 'macaque'] },
  { key: 'camphor20', species: 'camphor', heightCm: 2000, spawn: ['muntjac', 'boar', 'egret', 'macaque'] },
  { key: 'camphor45', species: 'camphor', heightCm: 4500, spawn: ['muntjac', 'boar', 'cattle', 'egret', 'macaque'] },
  { key: 'deodar60', species: 'deodar', heightCm: 6000, spawn: ['cattle', 'buffalo', 'muntjac', 'egret'] },
  { key: 'redwood120', species: 'redwood', heightCm: 12000, spawn: ['boar', 'macaque', 'cattle', 'egret', 'muntjac'] },
];
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, save) {
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v11-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v11-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
fs.writeFileSync('/tmp/v11-base-save.json', JSON.stringify(base));
await c0.close();
const SEASON = { camphor: 's3', deodar: 's6', redwood: 's12' };
const TARGET = { camphor: 5000, deodar: 6000, redwood: 12000 };
const ALL = ['whiteeye', 'sparrow', 'munia', 'swallow', 'tailorbird', 'bulbul', 'butterfly', 'macaque', 'muntjac', 'boar', 'kite', 'squirrel', 'egret', 'cattle', 'buffalo', 'seaeagle', 'parakeet', 'starling'];
const out = { tag: TAG, base: BASE, sim: SIM, dt: DT, scenarios: [] };
for (const sc of SCENARIOS) {
  if (ONLY.length && !ONLY.includes(sc.key)) continue;
  const t0 = Date.now();
  const { ctx, page } = await newPage();
  await setup(page, devBase, { ...base, health: 95, moisture: 70, nutrients: 70, animals: ALL, seenAnimals: ALL, residents: [], season: SEASON[sc.species], targetCm: TARGET[sc.species], species: sc.species, heightCm: sc.heightCm });
  await page.waitForTimeout(1500);
  for (const id of sc.spawn) await page.evaluate((i) => window.__tree.spawn(i), id);
  const info = await page.evaluate(() => window.__tree.viewInfo?.() ?? null);
  const nav = await page.evaluate(() => (window.__tree.navInfo ? window.__tree.navInfo() : null));
  const frames = [];
  const chunk = 200;
  for (let s = 0; s < SIM / DT; s += chunk) {
    const part = await page.evaluate(([n, dt]) => {
      const r = [];
      for (let i = 0; i < n; i++) {
        window.__tree.simStep(dt, 1);
        r.push(window.__tree.walkerDump().map((w) => [w.k, w.id, +w.x.toFixed(4), +w.z.toFixed(4), +w.len.toFixed(4), w.climb ? 1 : 0, w.leaving ? 1 : 0, w.wade ? 1 : 0, w.vis ?? 1]));
      }
      return r;
    }, [chunk, DT]);
    frames.push(...part);
  }
  const navAfter = await page.evaluate(() => (window.__tree.navInfo ? window.__tree.navInfo() : null));
  out.scenarios.push({ ...sc, info, nav: navAfter ?? nav, frames });
  console.log(`${sc.key}: ${frames.length} frames, ${new Set(frames.flat().map((w) => w[0])).size} walkers, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await ctx.close();
}
fs.writeFileSync(`/tmp/v11tracks-${TAG}.json`, JSON.stringify(out));
console.log('errors:', errors.length ? errors.slice(0, 5) : 'none');
await browser.close();
