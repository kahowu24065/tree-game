// v10 check: chase cam on one flock member, orbit while following, 新 badge cleared by following,
// props at animal scale (more, not bigger), more water — plus the v8 guarantees (one animal factor, flight ceiling tree + 5 m, fence, no walking on water).
// Screenshots → /workspace/tree-game-shots/v10/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v10';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
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
    if (sessionStorage.getItem('v10-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v10-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const T = (p, fn, ...a) => p.evaluate(([f, args]) => window.__tree[f](...args), [fn, a]);
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
async function compose(items, cols, file, title, w = 300) {
  const ctx = await browser.newContext();
  const cells = items.map(([f, label]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"/><figcaption>${label}</figcaption></figure>`).join('');
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: cols * w, height: 400 });
  await p2.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">${title}</h2><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px">${cells}</div><style>figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center}img{width:100%;display:block}figcaption{padding:4px 6px;font-size:14px;font-weight:600}</style></body></html>`);
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: file, fullPage: true });
  await ctx.close();
}

// A real save through the picker.
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
await c0.close();
const SEASON = { camphor: 's3', deodar: 's6', redwood: 's12' };
const TARGET = { camphor: 5000, deodar: 6000, redwood: 12000 };
const ALL = ['whiteeye', 'sparrow', 'munia', 'swallow', 'tailorbird', 'bulbul', 'butterfly', 'plaintiger', 'bluebottle', 'honeybee', 'dragonfly', 'ladybug', 'macaque', 'muntjac', 'boar', 'kite', 'squirrel', 'egret', 'cattle', 'buffalo', 'seaeagle', 'parakeet', 'starling'];
// Everything unlocked; a few not yet looked at in the 圖鑑 (→ 「新」).
const FRESH = ['munia', 'plaintiger', 'swallow'];
const save = (o) => ({ ...base, health: 95, moisture: 70, nutrients: 70, animals: ALL, seenAnimals: ALL.filter((a) => !FRESH.includes(a)), residents: [], season: SEASON[o.species ?? 'camphor'], targetCm: TARGET[o.species ?? 'camphor'], ...o });
async function scene(saveOver) {
  const r = await newPage();
  await setup(r.page, devBase, save(saveOver));
  await r.page.waitForTimeout(1200);
  return r;
}
/** Markers must not sit on HUD buttons / cards / the log. */
const overlapHud = (p) => p.evaluate(() => {
  const ids = ['weather-card', 'status-card', 'rail', 'sheet', 'dock', 'place-pill', 'gear', 'view-reset', 'animal-list-btn', 'animal-list', 'animal-toast'];
  const rects = ids.map((id) => document.getElementById(id)).filter((e) => e && !e.hidden && e.offsetParent !== null).map((e) => e.getBoundingClientRect());
  let bad = 0;
  for (const m of document.querySelectorAll('.amk')) {
    if (Number(m.style.opacity) < 0.35) continue;
    const r = m.getBoundingClientRect();
    if (rects.some((q) => r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top)) bad++;
  }
  return bad;
});
async function v8Guarantees(p, label, treeM) {
  const sz = await T(p, 'animalSizes');
  const ratios = sz.sizes.map((s) => s.ratio);
  const spread = ratios.length ? Math.max(...ratios) / Math.min(...ratios) : 1;
  let over = 0, maxAbove = -Infinity, wet = 0, samples = 0;
  for (let k = 0; k < 5; k++) {
    for (const f of await T(p, 'flyers')) { if (f.perched) continue; maxAbove = Math.max(maxAbove, f.y - treeM); if (f.y > f.ceiling + 1e-3) over++; }
    for (const w of await T(p, 'walkers')) { samples++; if (w.wet || w.r > w.limit + 0.01) wet++; }
    await p.waitForTimeout(500);
  }
  const fc = await T(p, 'fenceCheck');
  ok(`v8 guarantees hold: ${label}`, spread < 1.08 && over === 0 && wet <= samples * 0.03 && fc.offLand === 0,
    `one factor ×${sz.factor.toFixed(2)} (spread ${spread.toFixed(3)}), flyers over ceiling ${over} (highest ${maxAbove.toFixed(1)} m over tree), walkers wet/outside ${wet}/${samples}, fence off-land ${fc.offLand}`);
}

const BASE_V9 = process.env.BASE_V9 || 'http://127.0.0.1:4328/';
async function sceneAt(url, saveOver) {
  const r = await newPage();
  await r.page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v10-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v10-seeded', '1');
  }, [devBase, save(saveOver)]);
  await r.page.goto(url);
  await r.page.waitForTimeout(3000);
  return r;
}
const crewOf = async (p, id) => (await T(p, 'crews')).find((c) => c.id === id);
const centred = (fc) => fc && fc.screen && Math.abs(fc.screen.x - 195) < 110 && Math.abs(fc.screen.y - 494) < 200;

// 1. Chase cam: following a flock picks ONE member and flies along with it.
if (want('chase')) {
  const { ctx, page: p } = await scene({ species: 'camphor', heightCm: 3000 });
  for (const id of ['swallow', 'whiteeye']) await T(p, 'spawn', id);
  await p.waitForTimeout(4000);
  const sw = await crewOf(p, 'swallow');
  await T(p, 'followCrew', sw.uid);
  let chaseN = 0, cen = 0, pxs = [];
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(400);
    const fc = await T(p, 'followCam');
    if (fc.chase) chaseN++;
    if (centred(fc)) cen++;
    pxs.push(fc.px);
  }
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/01-chase-one-bird.png` });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/02-chase-one-bird-later.png` });
  const med = pxs.sort((a, b) => a - b)[5];
  ok('chase cam follows one flock member', sw.count > 1 && chaseN >= 6 && cen >= 7 && med > 40 && med < 260 && (await T(p, 'followingUid')) === sw.uid,
    `flock of ${sw.count}; chase ${chaseN}/10, centred ${cen}/10, bird ≈${med.toFixed(0)} px long on screen`);
  // White-eyes perch in the crown: follow must stay on the group (swap member or rise), never drop.
  const we = await crewOf(p, 'whiteeye');
  await T(p, 'followCrew', we.uid);
  let kept = 0;
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(500); if ((await T(p, 'followingUid')) === we.uid) kept++; }
  const fc = await T(p, 'followCam');
  await p.screenshot({ path: `${OUT}/03-follow-whiteeye.png` });
  ok('perching flock stays followed (member swap / pull-out)', kept === 12, `kept ${kept}/12, lift ${fc.lift.toFixed(2)}, bird ${fc.px.toFixed(0)} px`);
  await ctx.close();
}

// 2. Orbit while following: one-finger / mouse drag orbits round the animal, which stays centred; pinch/wheel zooms.
if (want('orbit')) {
  const { ctx, page: p } = await scene({ species: 'camphor', heightCm: 3000 });
  await T(p, 'spawn', 'muntjac');
  await p.waitForTimeout(3000);
  const mj = await crewOf(p, 'muntjac');
  await T(p, 'followCrew', mj.uid);
  await p.waitForTimeout(3500);
  await hideDev(p);
  const a0 = await T(p, 'followCam');
  await p.screenshot({ path: `${OUT}/04-orbit-a.png` });
  // Real pointer drag across the canvas (mouse = one finger).
  await p.mouse.move(300, 420);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) { await p.mouse.move(300 - i * 16, 420 + i * 2); await p.waitForTimeout(30); }
  await p.mouse.up();
  await p.waitForTimeout(1500);
  const a1 = await T(p, 'followCam');
  const still = (await T(p, 'followingUid')) === mj.uid;
  await p.screenshot({ path: `${OUT}/05-orbit-b.png` });
  ok('drag orbits round the followed animal (follow kept, centred)', still && Math.abs(a1.orbit - a0.orbit) > 1 && centred(a1),
    `orbit ${a0.orbit.toFixed(2)} → ${a1.orbit.toFixed(2)} rad, following ${still}, on screen at ${a1.screen && a1.screen.x.toFixed(0)},${a1.screen && a1.screen.y.toFixed(0)}`);
  await p.mouse.move(195, 400);
  await p.mouse.wheel(0, 400);
  await p.waitForTimeout(1200);
  const a2 = await T(p, 'followCam');
  ok('wheel / pinch changes distance while following', (await T(p, 'followingUid')) === mj.uid && a2.px < a1.px * 0.8, `animal ${a1.px.toFixed(0)} → ${a2.px.toFixed(0)} px`);
  // Drag again the other way for a third angle.
  await p.mouse.move(80, 420);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) { await p.mouse.move(80 + i * 22, 400); await p.waitForTimeout(30); }
  await p.mouse.up();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/06-orbit-c.png` });
  await ctx.close();
}

// 3. 「新」: following a species marks it seen — badge gone from markers, list, toast, 🐾, and it persists.
if (want('seen')) {
  const { ctx, page: p } = await scene({ species: 'camphor', heightCm: 2000 });
  for (const id of ['munia', 'sparrow']) await T(p, 'spawn', id);
  await p.waitForTimeout(3000);
  await hideDev(p);
  await p.locator('#animal-list-btn').click();
  await p.waitForTimeout(900);
  const before = await T(p, 'hud');
  await p.screenshot({ path: `${OUT}/07-new-before.png` });
  const mu = await crewOf(p, 'munia');
  await p.locator(`#animal-list [data-uid="${mu.uid}"]`).click();
  await p.waitForTimeout(1500);
  const seen = await T(p, 'seen');
  const newMarks = await p.evaluate((uid) => [...document.querySelectorAll(`.amk[data-uid="${uid}"] em`)].length, mu.uid);
  await T(p, 'resetView');
  await p.waitForTimeout(1800);
  await p.locator('#animal-list-btn').click();
  await p.waitForTimeout(900);
  const after = await T(p, 'hud');
  const btnNew = await p.evaluate(() => document.getElementById('animal-list-btn').classList.contains('has-new'));
  await p.screenshot({ path: `${OUT}/08-new-after.png` });
  const muBefore = before.list.find((t) => t.includes('白腰文鳥')) || '';
  const muAfter = after.list.find((t) => t.includes('白腰文鳥')) || '';
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).seenAnimals);
  ok('following clears 新 for that species everywhere + saved', muBefore.includes('新') && !muAfter.includes('新') && seen.includes('munia') && saved.includes('munia') && newMarks === 0,
    `list before 「${muBefore}」 after 「${muAfter}」; 🐾 still red (other new species): ${btnNew}; saved seen has munia: ${saved.includes('munia')}`);
  await ctx.close();
  // Reload with that save: still seen.
  const { ctx: c2, page: p2 } = await scene({ species: 'camphor', heightCm: 2000, seenAnimals: saved });
  await T(p2, 'spawn', 'munia');
  await p2.waitForTimeout(2500);
  await p2.locator('#animal-list-btn').click();
  await p2.waitForTimeout(900);
  const h = await T(p2, 'hud');
  const line = h.list.find((t) => t.includes('白腰文鳥')) || '';
  ok('seen persists after reload', line && !line.includes('新'), `「${line}」`);
  await c2.close();
}

// 4. Props at animal scale on a big island (v9 vs v10), more of them.
if (want('props')) {
  const shots = [];
  for (const [tag, url] of [['v9', BASE_V9], ['v10', BASE]]) {
    const { ctx, page: p } = await sceneAt(url, { species: 'redwood', heightCm: 12000 });
    for (const id of ['macaque', 'muntjac', 'egret', 'boar']) await T(p, 'spawn', id);
    await p.waitForTimeout(4000);
    const mc = await crewOf(p, 'boar') || await crewOf(p, 'macaque');
    await T(p, 'followCrew', mc.uid);
    await p.waitForTimeout(2500);
    await T(p, 'zoomBy', 2.6);
    await p.waitForTimeout(2500);
    await hideDev(p);
    const f = `${OUT}/09-props-${tag}.png`;
    await p.screenshot({ path: f });
    shots.push([f, `${tag}・紅杉 120 米・跟住${mc.name}`]);
    if (tag === 'v10') {
      const pi = await T(p, 'propInfo');
      const sz = await T(p, 'animalSizes');
      ok('props drawn at the animal factor (not island scale)', Math.abs(pi.propM - sz.factor) / sz.factor < 0.05 && pi.propK < 0.5,
        `prop metres per design metre ${pi.propM.toFixed(2)} vs animal factor ${sz.factor.toFixed(2)}; island K ${pi.islandK.toFixed(2)} (v9 props would be ×${pi.islandK.toFixed(2)}); density bucket ${pi.bucket}; ${pi.calls} draw calls, ${(pi.tris / 1000).toFixed(0)}k tris`);
      await v8Guarantees(p, '紅杉 120 米 (v10 props + water)', 120);
    }
    await T(p, 'resetView');
    await p.waitForTimeout(2500);
    if (tag === 'v10') { const pi = await T(p, 'propInfo'); console.log(`  overview render: ${pi.calls} draw calls, ${(pi.tris / 1000).toFixed(0)}k tris`); }
    const f2 = `${OUT}/10-props-overview-${tag}.png`;
    await p.screenshot({ path: f2 });
    await ctx.close();
  }
  await compose(shots, 2, `${OUT}/11-props-v9-vs-v10.png`, '細道具（石、灌木、花草、橋）：v9 跟島放大 → v10 跟動物同一比例、數量更多', 390);
}

// 5. More water: overview at several stages (v9 vs v10 for two of them).
if (want('water')) {
  const items = [];
  for (const [label, species, cm] of [['樟樹 0.6 米（幼苗）', 'camphor', 60], ['樟樹 3 米', 'camphor', 300], ['樟樹 10 米', 'camphor', 1000], ['樟樹 45 米', 'camphor', 4500], ['雪松 60 米', 'deodar', 6000]]) {
    const { ctx, page: p } = await scene({ species, heightCm: cm });
    await p.waitForTimeout(1500);
    await hideDev(p);
    const ws = await T(p, 'waterShare');
    const f = `${OUT}/water-${species}-${cm}.png`;
    await p.screenshot({ path: f });
    items.push([f, `${label}・水 ${(ws.share * 100).toFixed(1)}%`]);
    ok(`water visible: ${label}`, ws.share > (cm < 100 ? 0.04 : 0.06), `water share of land ${(ws.share * 100).toFixed(1)}% (stage ${ws.stage})`);
    const wk = await T(p, 'walkers');
    await ctx.close();
    void wk;
  }
  await compose(items, 5, `${OUT}/12-water-stages.png`, 'v10 更多水：池塘、湖、闊咗嘅溪同河、水灣', 260);
  const cmp = [];
  for (const [tag, url] of [['v9', BASE_V9], ['v10', BASE]]) for (const cm of [1000, 4500]) {
    const { ctx, page: p } = await sceneAt(url, { species: 'camphor', heightCm: cm });
    await hideDev(p);
    const f = `${OUT}/water-cmp-${tag}-${cm}.png`;
    await p.screenshot({ path: f });
    cmp.push([f, `${tag}・樟樹 ${cm / 100} 米`]);
    await ctx.close();
  }
  await compose(cmp, 4, `${OUT}/13-water-v9-vs-v10.png`, '水面：v9 對 v10（同一棵樹、同一高度）', 260);
}

// 6. Guarantees on a mid island with animals walking round the new water.
if (want('guard')) {
  const { ctx, page: p } = await scene({ species: 'camphor', heightCm: 4500 });
  for (const id of ['muntjac', 'boar', 'egret', 'macaque', 'whiteeye', 'swallow']) await T(p, 'spawn', id);
  await p.waitForTimeout(5000);
  await v8Guarantees(p, '樟樹 45 米 (new lake / ponds)', 45);
  const hud = await T(p, 'hud');
  const bad = await overlapHud(p);
  ok('v9 markers still fine', hud.markers.length > 0 && hud.markers.length <= 10 && bad === 0, `${hud.markers.length} markers, on HUD ${bad}`);
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
process.exit(checks.every((c) => c[1]) ? 0 : 1);
