// v7 check: metre scale (tree = G), no height cap, flight ceiling, fence on the island rim, real-size animals + zoom.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v7';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: true, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, save) {
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v7-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v7-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const hideHud = (page, hide = true) => page.evaluate((h) => {
  for (const id of ['status-card', 'rail', 'sheet', 'dock', 'weather-card', 'place-pill', 'gear', 'dev-root', 'toast', 'view-reset', 'zoom-hint']) {
    const el = document.getElementById(id);
    if (el) el.style.visibility = h ? 'hidden' : '';
  }
}, hide);
const CLIP = { x: 0, y: 40, width: 390, height: 760 };
async function compose(ctx, items, cols, file, title, w = 300) {
  const cells = items.map(([f, label]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"/><figcaption>${label}</figcaption></figure>`).join('');
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: cols * w, height: 400 });
  await p2.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">${title}</h2><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px">${cells}</div><style>figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center}img{width:100%;display:block}figcaption{padding:4px 6px;font-size:14px;font-weight:600}</style></body></html>`);
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: file, fullPage: true });
  await p2.close();
}

// Get a real save through the picker.
const { ctx, page } = await newPage();
await setup(page, devBase);
await page.locator('[data-pick-season="s3"]').click();
await page.locator('[data-species="camphor"]').click();
await page.locator('[data-action="start-game"]').click();
await page.waitForTimeout(1000);
const base = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('game starts', base && base.species === 'camphor');
await ctx.close();
const save = (o) => ({ ...base, health: 95, moisture: 70, nutrients: 70, animals: [], residents: [], ...o });

async function scene(saveOver, devOver = {}) {
  const r = await newPage();
  await setup(r.page, { ...devBase, ...devOver }, save(saveOver));
  await r.page.waitForTimeout(1500);
  return r;
}
const info = (p) => p.evaluate(() => window.__tree.viewInfo());

// 1. Metre-scale audit in the live scene.
if (want('audit')) {
  for (const [species, season, cm] of [['camphor', 's3', 20], ['camphor', 's3', 300], ['camphor', 's3', 2000], ['metasequoia', 's6', 5000], ['redwood', 's12', 12000], ['redwood', 's12', 16000]]) {
    const { ctx: c, page: p } = await scene({ species, season, heightCm: cm });
    const v = await info(p);
    ok(`tree height = G (${species} ${cm / 100} m)`, Math.abs(v.treeM - cm / 100) < 0.01 * Math.max(1, cm / 100), `rendered ${v.treeM.toFixed(2)} m, island ×${v.islandK.toFixed(2)}, fence r ${v.fenceRadius.toFixed(1)} / island r ${v.islandRadius.toFixed(1)}`);
    await c.close();
  }
}

// 2. Fence at stage 0 and at 巨樹 (and a scaled giant island).
if (want('fence')) {
  const items = [];
  for (const [label, o] of [['幼苗（20 厘米）・島半徑 7 米', { heightCm: 20 }], ['巨樹（20 米）・島半徑 16 米', { heightCm: 2000 }], ['巨樹（120 米紅杉）・島放大', { species: 'redwood', season: 's12', heightCm: 12000 }]]) {
    const { ctx: c, page: p } = await scene(o);
    // Seedling: the overview frames the 20 cm plant; zoom out (wheel) to see the whole island and its fence.
    if (o.heightCm === 20) {
      await p.mouse.move(195, 500);
      for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(40); }
      await p.waitForTimeout(2000);
    }
    const v = await info(p);
    ok(`fence on rim: ${label}`, Math.abs(v.fenceRadius - (v.islandRadius - 0.35)) < 0.3, `fence ${v.fenceRadius.toFixed(2)} m vs island ${v.islandRadius.toFixed(2)} m`);
    await hideHud(p);
    const f = `${OUT}/fence-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, `${label}・圍欄 r=${v.fenceRadius.toFixed(1)} 米`]);
    await c.close();
  }
  // Close look at the fence on the 巨樹 island (zoom toward the front rim).
  {
    const { ctx: c, page: p } = await scene({ heightCm: 2000 });
    await p.mouse.move(195, 700);
    for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, -250); await p.waitForTimeout(40); }
    await p.waitForTimeout(2000);
    await hideHud(p);
    const f = `${OUT}/fence-3.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, '巨樹島圍欄近鏡（柱高 1.1 米，1:1）']);
    await c.close();
  }
  // Seedling: zoomed out view is the close seedling framing; add an elevated shot by rotating/zooming? Use the dev island preview at stage 0 with a 1 m tree for a wider frame.
  await compose(browser.contexts()[0] ?? (await browser.newContext()), items, 4, `${OUT}/01-fence-stage0-vs-giant.png`, '圍欄跟住島嶼邊緣（幼苗 → 巨樹）');
}

// 3. Beyond target: redwood 120 m with the rail.
if (want('beyond')) {
  const { ctx: c, page: p } = await scene({ species: 'redwood', season: 's12', heightCm: 12000 });
  const rail = await p.locator('#rail').innerText();
  ok('rail shows 已突破目標', /已突破目標/.test(rail) && /120/.test(rail), rail.replace(/\n/g, ' '));
  await p.screenshot({ path: `${OUT}/02-redwood-120m-beyond-target.png` });
  await p.locator('#dock [data-open="season"], [data-open="milestones"]').first().click().catch(() => {});
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/02b-season-tab-beyond.png` });
  await c.close();
  const { ctx: c2, page: p2 } = await scene({ species: 'redwood', season: 's12', heightCm: 16000 });
  await p2.screenshot({ path: `${OUT}/02c-redwood-160m.png` });
  await c2.close();
}

// 4. Birds stay under the tree top at a small stage (3 m camphor).
if (want('birds')) {
  const { ctx: c, page: p } = await scene({ heightCm: 300 }, { open: true });
  for (const id of ['whiteeye', 'sparrow', 'bulbul', 'kite', 'plaintiger']) {
    await p.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p.locator('#dev-root [data-dev="spawn"]').click();
    await p.waitForTimeout(150);
  }
  await p.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
  let worst = -Infinity;
  let n = 0;
  let ceiling = 0;
  for (let i = 0; i < 24; i++) {
    await p.waitForTimeout(500);
    const hs = await p.evaluate(() => window.__tree.flyers());
    for (const h of hs) {
      n++;
      ceiling = h.ceiling;
      worst = Math.max(worst, h.y - h.ceiling);
    }
  }
  ok('flyers never above min(80 m, tree height)', n > 0 && worst <= 0.001, `${n} samples, ceiling ${ceiling.toFixed(2)} m, max over ${worst.toFixed(3)} m`);
  await hideHud(p);
  await p.screenshot({ path: `${OUT}/03-birds-under-treetop-3m.png`, clip: CLIP });
  // Side-on view: zoom toward the tree and drag up to lower the camera, so the canopy top is against the sky.
  await p.mouse.move(195, 470);
  for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, -200); await p.waitForTimeout(60); }
  await p.mouse.move(195, 560);
  await p.mouse.down();
  await p.mouse.move(195, 200, { steps: 12 });
  await p.mouse.up();
  await p.waitForTimeout(2500);
  const snap = await p.evaluate(() => window.__tree.flyers());
  const air = snap.filter((h) => !h.perched);
  await p.screenshot({ path: `${OUT}/03b-birds-zoomed.png`, clip: CLIP });
  fs.writeFileSync(`${OUT}/03-flyer-heights.json`, JSON.stringify({ ceilingM: snap[0]?.ceiling, samples: snap }, null, 1));
  ok('snapshot: airborne animals under 3 m', air.every((h) => h.y <= h.ceiling + 1e-3), air.map((h) => `${h.id}@${h.y.toFixed(2)}m`).join(', '));
  await c.close();
  // 120 m tree: ceiling 80 m.
  const { ctx: c2, page: p2 } = await scene({ species: 'redwood', season: 's12', heightCm: 12000 }, { open: true });
  for (const id of ['kite', 'seaeagle', 'starling']) {
    await p2.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p2.locator('#dev-root [data-dev="spawn"]').click();
  }
  await p2.waitForTimeout(6000);
  const hs = await p2.evaluate(() => window.__tree.flyers());
  const over = Math.max(...hs.map((h) => h.y - h.ceiling));
  ok('120 m tree: ceiling 80 m', hs.length > 0 && hs[0].ceiling === 80 && over <= 0.001, `max y ${Math.max(...hs.map((h) => h.y)).toFixed(1)} m`);
  await c2.close();
}

// 5. Real-size animals + zoom (wheel, pinch, tap-follow, overview button).
if (want('zoom')) {
  const { ctx: c, page: p } = await scene({ heightCm: 2000 }, { open: true });
  for (const id of ['buffalo', 'egret', 'muntjac', 'wagtail', 'squirrel']) {
    await p.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p.locator('#dev-root [data-dev="spawn"]').click();
    await p.waitForTimeout(120);
  }
  await p.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
  await p.waitForTimeout(5000);
  await hideHud(p);
  await p.screenshot({ path: `${OUT}/04a-overview-real-scale.png`, clip: CLIP });
  await hideHud(p, false);
  const d0 = (await info(p)).distM;
  // Pinch-out with two synthetic touch pointers on the canvas.
  await p.evaluate(async () => {
    const c = document.getElementById('scene');
    const ev = (type, id, x, y) => c.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: id === 11 }));
    ev('pointerdown', 11, 170, 560); ev('pointerdown', 12, 220, 560);
    for (let i = 1; i <= 12; i++) { ev('pointermove', 11, 170 - i * 10, 560); ev('pointermove', 12, 220 + i * 10, 560); await new Promise((r) => setTimeout(r, 16)); }
    ev('pointerup', 11, 50, 560); ev('pointerup', 12, 340, 560);
  });
  await p.waitForTimeout(1200);
  const d1 = (await info(p)).distM;
  ok('pinch zooms in', d1 < d0 * 0.6, `${d0.toFixed(1)} m → ${d1.toFixed(1)} m`);
  const btn = await p.locator('#view-reset').isVisible();
  ok('返回全景 button shows when zoomed', btn);
  await hideHud(p);
  await p.screenshot({ path: `${OUT}/04b-pinch-zoomed.png`, clip: CLIP });
  await hideHud(p, false);
  await p.locator('#view-reset').click();
  await p.waitForTimeout(1500);
  const d2 = (await info(p)).distM;
  ok('返回全景 restores overview', Math.abs(d2 - d0) / d0 < 0.1 && !(await p.locator('#view-reset').isVisible()), `${d2.toFixed(1)} m`);
  // Wheel zoom to the limit: a few metres.
  // Aim the wheel at the buffalo so the close-up lands on a real-size animal.
  const bs = (await p.evaluate(() => window.__tree.animalScreen('buffalo'))) ?? { x: 195, y: 640 };
  await p.mouse.move(bs.x, bs.y);
  let mid = false;
  for (let i = 0; i < 30; i++) {
    // Re-aim at the (walking) buffalo before each notch.
    const q = await p.evaluate(() => window.__tree.animalScreen('buffalo'));
    if (q && q.x > 0 && q.x < 390 && q.y > 0 && q.y < 844) await p.mouse.move(q.x, q.y);
    await p.mouse.wheel(0, -400);
    await p.waitForTimeout(120);
    if (!mid && (await info(p)).distM < 8) {
      mid = true;
      await p.waitForTimeout(1200);
      await hideHud(p);
      await p.screenshot({ path: `${OUT}/04c-wheel-6m.png`, clip: CLIP });
      await hideHud(p, false);
    }
  }
  await p.waitForTimeout(1500);
  const d3 = (await info(p)).distM;
  ok('wheel zooms down to close-up (limit 1.5 m)', d3 < 3 && d3 >= 1.45, `${d3.toFixed(2)} m`);
  await hideHud(p);
  await p.screenshot({ path: `${OUT}/04c-wheel-closeup.png`, clip: CLIP });
  await hideHud(p, false);
  await p.locator('#view-reset').click();
  await p.waitForTimeout(1200);
  // Close-ups at real size via the follow cam (same as tapping an animal).
  const shots = [[`${OUT}/04a-overview-real-scale.png`, '全景：20 米樟樹，動物真實大小（水牛 2.8 米）']];
  for (const [id, label] of [['buffalo', '水牛 2.8 米'], ['egret', '小白鷺 60 厘米'], ['muntjac', '赤麂 1 米'], ['wagtail', '白鶺鴒 19 厘米'], ['squirrel', '赤腹松鼠 40 厘米（連尾）']]) {
    await p.evaluate(() => { const r = document.getElementById('dev-root'); r.style.visibility = ''; if (document.querySelector('#dev-root .dev-panel').hidden) document.querySelector('#dev-root .dev-fab').click(); });
    await p.waitForTimeout(250);
    await p.locator('#dev-root [data-dev-animal]').selectOption(id);
    const label0 = await p.locator('#dev-root [data-dev="follow"]').innerText();
    if (/停止/.test(label0)) await p.locator('#dev-root [data-dev="follow"]').click();
    await p.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p.locator('#dev-root [data-dev="follow"]').click();
    await p.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
    await p.waitForTimeout(3500);
    await hideHud(p);
    const f = `${OUT}/04-closeup-${id}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    shots.push([f, `跟拍：${label}`]);
    await hideHud(p, false);
  }
  shots.push([`${OUT}/04b-pinch-zoomed.png`, '雙指放大']);
  shots.push([`${OUT}/04c-wheel-6m.png`, '滾輪對準水牛放大（約 6 米）']);
  shots.push([`${OUT}/04c-wheel-closeup.png`, '滾輪放到最近（1.5 米：草地碎石真實大小）']);
  await compose(c, shots, 3, `${OUT}/04-real-scale-zoom.png`, '動物真實尺寸（1 單位 = 1 米）＋縮放／跟拍');
  await c.close();
  // Tap-to-follow: zoom in on a buffalo herd, then tap one on screen.
  {
    const { ctx: c2, page: p2 } = await scene({ heightCm: 2000 }, { open: true });
    await p2.locator('#dev-root [data-dev-animal]').selectOption('buffalo');
    await p2.locator('#dev-root [data-dev="spawn"]').click();
    await p2.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
    await p2.waitForTimeout(6000);
    const pt = await p2.evaluate(() => window.__tree.animalScreen('buffalo'));
    if (pt) await p2.touchscreen.tap(pt.x, pt.y);
    await p2.waitForTimeout(2500);
    const vs = await p2.evaluate(() => window.__tree.viewState());
    ok('tap an animal to follow it', Boolean(vs && vs.following), JSON.stringify(vs));
    await p2.screenshot({ path: `${OUT}/04d-tap-follow.png` });
    await c2.close();
  }
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
const failed = checks.filter(([, p]) => !p).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
await browser.close();
process.exit(failed ? 1 : 0);
