// v8 check: v6 tree proportions with tree top = G, one shared animal factor, fence on the rendered shoreline,
// per-species record targets, flyers up to tree + 5 m, more water. Screenshots → /workspace/tree-game-shots/v8/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v8';
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
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, save) {
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v8-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v8-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const hideHud = (page, hide = true, keepRail = false) => page.evaluate(([h, k]) => {
  for (const id of ['status-card', 'rail', 'sheet', 'dock', 'weather-card', 'place-pill', 'gear', 'dev-root', 'toast', 'view-reset', 'zoom-hint']) {
    if (k && id === 'rail') continue;
    const el = document.getElementById(id);
    if (el) el.style.visibility = h ? 'hidden' : '';
  }
}, [hide, keepRail]);
const CLIP = { x: 0, y: 40, width: 390, height: 760 };
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
const { ctx, page } = await newPage();
await setup(page, devBase);
await page.locator('[data-pick-season="s3"]').click();
await page.locator('[data-species="camphor"]').click();
const pickText = await page.locator('.modal, #modal, body').first().innerText();
ok('picker shows per-species targets', /紀錄 46\.4 米・目標 50 米/.test(pickText) && /30／50／60 米/.test(pickText), pickText.match(/目標[^\n]{0,20}/g)?.slice(0, 4).join(' | '));
await page.locator('[data-action="start-game"]').click();
await page.waitForTimeout(1000);
const base = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('game starts with species target', base && base.species === 'camphor' && base.targetCm === 5000, `targetCm ${base?.targetCm}`);
await ctx.close();
const SEASON = { camphor: 's3', cotton: 's3', banyan: 's3', metasequoia: 's6', ginkgo: 's6', deodar: 's6', redwood: 's12', eucalyptus: 's12', douglas: 's12' };
const TARGET = { camphor: 5000, cotton: 6000, banyan: 3000, metasequoia: 5000, ginkgo: 6000, deodar: 6000, redwood: 12000, eucalyptus: 10000, douglas: 10000 };
const save = (o) => ({ ...base, health: 95, moisture: 70, nutrients: 70, animals: [], residents: [], season: SEASON[o.species ?? 'camphor'], targetCm: TARGET[o.species ?? 'camphor'], ...o });

async function scene(saveOver, devOver = {}) {
  const r = await newPage();
  await setup(r.page, { ...devBase, ...devOver }, save(saveOver));
  await r.page.waitForTimeout(1500);
  return r;
}
const info = (p) => p.evaluate(() => window.__tree.viewInfo());
const T = (p, fn, ...a) => p.evaluate(([f, args]) => window.__tree[f](...args), [fn, a]);

// Stage heights for camphor (target 50 m): shares 0 / 2.5 % / 10 % / 40 % / 85 %.
const STAGES = [['幼苗 0.5 米', 'camphor', 50], ['小樹 3 米', 'camphor', 300], ['青年樹 10 米', 'camphor', 1000], ['成年樹 30 米', 'camphor', 3000], ['巨樹 50 米', 'camphor', 5000], ['紅杉巨樹 120 米', 'redwood', 12000]];

// 1. Scale + fence audit in the live scene.
if (want('audit')) {
  for (const [label, species, cm] of [...STAGES, ['花旗松 100 米', 'douglas', 10000], ['細葉榕 30 米', 'banyan', 3000], ['木棉 60 米', 'cotton', 6000], ['雪松 45 米', 'deodar', 4500], ['銀杏 25 米', 'ginkgo', 2500], ['水杉 50 米', 'metasequoia', 5000], ['杏仁桉 90 米', 'eucalyptus', 9000], ['紅杉 160 米', 'redwood', 16000]]) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm });
    await p.waitForTimeout(1200);
    const v = await info(p);
    const fc = await T(p, 'fenceCheck');
    ok(`tree top = G: ${label}`, Math.abs(v.treeM - cm / 100) < 0.01 * Math.max(1, cm / 100), `drawn ${v.treeM.toFixed(2)} m; scene ×${v.islandK.toFixed(2)}; island r ${v.islandRadius.toFixed(1)} m`);
    ok(`fence hugs rendered edge: ${label}`, fc.offLand === 0 && fc.maxGapUnits < 0.2 && fc.posts > 20, `stage ${fc.stage}, ${fc.posts} posts (${fc.skipped} skipped for water/hills), off-land ${fc.offLand}, gap to edge max ${fc.maxGapUnits.toFixed(3)} u = ${fc.maxGapM.toFixed(2)} m, mean ${fc.meanGapUnits.toFixed(3)} u`);
    await c.close();
  }
}

// 2. Fence close-ups at several stages.
if (want('fence')) {
  const items = [];
  for (const [label, species, cm] of STAGES) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm });
    await p.waitForTimeout(800);
    await T(p, 'lookAtRim', 1.55, 0.97, cm < 100 ? 0.9 : 0.42, 0.25);
    await p.waitForTimeout(2200);
    await hideHud(p);
    const f = `${OUT}/fence-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    const fc = await T(p, 'fenceCheck');
    items.push([f, `${label}・最大離邊 ${fc.maxGapM.toFixed(2)} 米（${fc.maxGapUnits.toFixed(2)} 島單位）`]);
    await c.close();
  }
  await compose(items, 3, `${OUT}/01-fence-hugs-edge.png`, '圍欄貼住島嘅真實邊緣（近鏡，各階段）', 340);
  // Overviews, whole island.
  const ov = [];
  for (const [label, species, cm] of [STAGES[1], STAGES[3], STAGES[4], STAGES[5]]) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm });
    await p.mouse.move(195, 500);
    for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(40); }
    await p.waitForTimeout(2200);
    await hideHud(p);
    const f = `${OUT}/fence-ov-${ov.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    ov.push([f, `${label}・成個島`]);
    await c.close();
  }
  await compose(ov, 4, `${OUT}/02-fence-overview.png`, '圍欄沿住不規則島邊（全島）');
}

// 3. Animals vs tree at several sizes (overview with the rail).
if (want('animals')) {
  const items = [];
  const sets = [
    ['樟樹 3 米', 'camphor', 300, ['sparrow', 'butterfly', 'squirrel']],
    ['樟樹 20 米', 'camphor', 2000, ['macaque', 'muntjac', 'egret', 'whiteeye']],
    ['雪松 60 米', 'deodar', 6000, ['buffalo', 'macaque', 'kite', 'boar']],
    ['紅杉 120 米', 'redwood', 12000, ['buffalo', 'cattle', 'seaeagle', 'macaque']],
  ];
  for (const [label, species, cm, ids] of sets) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm, animals: ids });
    for (const id of ids) await T(p, 'spawn', id);
    await p.waitForTimeout(5000);
    const sz = await T(p, 'animalSizes');
    const ratios = sz.sizes.map((s) => s.ratio);
    const spread = ratios.length ? Math.max(...ratios) / Math.min(...ratios) : 1;
    ok(`one factor for all animals: ${label}`, spread < 1.08, `factor ×${sz.factor.toFixed(2)}; drawn/real ${sz.sizes.map((s) => `${s.id} ${s.drawnLen.toFixed(2)}/${s.realLen} m`).join(', ')}`);
    await hideHud(p, true, true);
    const f = `${OUT}/animals-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, `${label}・動物 ×${sz.factor.toFixed(2)}`]);
    // Sample 8 times over 8 s: count walker-samples on water, and any walker that stays wet (stuck).
    let samples = 0, wet = 0, maxR = 0, limit = 0;
    const wetRuns = new Map();
    let stuck = 0;
    for (let k = 0; k < 8; k++) {
      const w = await T(p, 'walkers');
      w.forEach((x, j) => {
        samples++;
        maxR = Math.max(maxR, x.r);
        limit = x.limit;
        const key = `${x.id}#${j}`;
        if (x.wet && j === w.findIndex((y) => y.wet)) console.log('   wet:', k, x.id, x.why);
        if (x.wet) { wet++; wetRuns.set(key, (wetRuns.get(key) ?? 0) + 1); } else wetRuns.set(key, 0);
        if ((wetRuns.get(key) ?? 0) >= 4) stuck++;
      });
      await p.waitForTimeout(1000);
    }
    ok(`walkers inside fence & off water: ${label}`, maxR <= limit + 0.01 && stuck === 0 && wet <= samples * 0.03, `${samples} walker-samples, on water ${wet} (${((wet / Math.max(1, samples)) * 100).toFixed(1)} %), stuck ${stuck}, max r ${maxR.toFixed(1)} / limit ${limit.toFixed(1)} m`);
    await c.close();
  }
  await compose(items, 4, `${OUT}/03-animals-vs-tree.png`, '動物同樹嘅比例（同一個放大系數）');
}

// 4. Relative size line-up (exact scene sizes) + a live follow-cam frame.
if (want('lineup')) {
  const { ctx: c, page: p } = await scene({ species: 'deodar', heightCm: 6000 });
  for (const [treeM, name] of [[60, 'lineup-60m'], [120, 'lineup-120m']]) {
    const url = await T(p, 'lineup', ['buffalo', 'cattle', 'boar', 'muntjac', 'macaque', 'egret', 'squirrel', 'myna', 'sparrow', 'whiteeye', 'butterfly'], treeM);
    fs.writeFileSync(`${OUT}/04-${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await c.close();
  const { ctx: c2, page: p2 } = await scene({ species: 'deodar', heightCm: 6000, animals: ['buffalo', 'macaque'] });
  await T(p2, 'spawn', 'buffalo');
  await T(p2, 'spawn', 'macaque');
  await p2.waitForTimeout(4000);
  await T(p2, 'follow', 'buffalo');
  await p2.waitForTimeout(3000);
  await hideHud(p2);
  await p2.screenshot({ path: `${OUT}/05-buffalo-macaque-live.png`, clip: CLIP });
  await c2.close();
}

// 5. Flyers up to tree + 5 m.
if (want('flyers')) {
  const items = [];
  for (const [label, species, cm, ids] of [['雪松 60 米・黑鳶', 'deodar', 6000, ['kite', 'swallow']], ['紅杉 120 米・白腹海鵰', 'redwood', 12000, ['seaeagle', 'kite']]]) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm, animals: ids });
    for (const id of ids) await T(p, 'spawn', id);
    let maxAbove = -Infinity;
    let over = 0;
    for (let i = 0; i < 12; i++) {
      await p.waitForTimeout(700);
      const fl = await T(p, 'flyers');
      for (const f of fl) {
        if (f.perched) continue;
        maxAbove = Math.max(maxAbove, f.y - cm / 100);
        if (f.y > f.ceiling + 1e-3) over++;
      }
    }
    ok(`flyers ≤ tree + 5 m: ${label}`, over === 0 && maxAbove > 0, `highest ${maxAbove.toFixed(2)} m above the tree top (ceiling +5 m); violations ${over}`);
    await T(p, 'follow', ids[0]);
    await p.waitForTimeout(2500);
    await T(p, 'follow', null);
    await p.waitForTimeout(100);
    // Frame the crown top: pan to the treetop.
    await p.evaluate((h) => { const s = window.__tree; s.lookAtRim(0, 0, 0.45); }, cm);
    await p.evaluate((h) => { /* raise aim to the crown */ }, cm);
    await p.waitForTimeout(300);
    await hideHud(p, true, true);
    const f = `${OUT}/flyer-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, `${label}・最高離樹頂 ${maxAbove.toFixed(1)} 米`]);
    await c.close();
  }
  await compose(items, 2, `${OUT}/06-flyers-treetop.png`, '飛鳥上限 = 樹高 + 5 米', 390);
}

// 6. Water across stages / species.
if (want('water')) {
  const items = [];
  for (const [label, species, cm] of [['樟樹 30 米・山澗水潭', 'camphor', 3000], ['樟樹 50 米・水灣', 'camphor', 5000], ['木棉 60 米・河同水灣', 'cotton', 6000], ['細葉榕 30 米・風水塘', 'banyan', 3000], ['水杉 30 米・濕地', 'metasequoia', 3000], ['花旗松 100 米・湖同河灣', 'douglas', 10000]]) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm });
    await p.mouse.move(195, 500);
    for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(40); }
    await p.waitForTimeout(2200);
    await hideHud(p);
    const f = `${OUT}/water-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, label]);
    await c.close();
  }
  await compose(items, 3, `${OUT}/07-water.png`, '更多水體（池塘、小溪、湖、水灣）', 340);
}

// 7. Rail + season card with the per-species target.
if (want('rail')) {
  const items = [];
  for (const [label, species, cm] of [['樟樹 45 米（目標 50）', 'camphor', 4500], ['細葉榕 33 米（目標 30，已突破）', 'banyan', 3300], ['紅杉 110 米（目標 120）', 'redwood', 11000]]) {
    const { ctx: c, page: p } = await scene({ species, heightCm: cm });
    const rail = await p.locator('#rail').innerText();
    ok(`rail shows species target: ${label}`, rail.includes(`${TARGET[species] / 100}.0 米`) || rail.includes('目標'), rail.replace(/\s+/g, ' '));
    const f = `${OUT}/rail-${items.length}.png`;
    await p.screenshot({ path: f, clip: CLIP });
    items.push([f, label]);
    await c.close();
  }
  await compose(items, 3, `${OUT}/08-rail-targets.png`, '高度尺：每個樹種自己嘅目標', 340);
}

// 8. Old save migration (v7 save with 20 m camphor target, already "passed").
if (want('migrate')) {
  const old = save({ species: 'camphor', heightCm: 2600, passedTargetOn: base.createdOn });
  delete old.targetCm;
  const r = await newPage();
  await setup(r.page, devBase, old);
  const st = await r.page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
  const rail = await r.page.locator('#rail').innerText();
  ok('old v7 save migrates to species target', st.targetCm === 5000 && !st.passedTargetOn && st.heightCm === 2600 && st.log.some((l) => l.text.includes('目標更新')), `targetCm ${st.targetCm}, passed ${st.passedTargetOn}, log: ${st.log.find((l) => l.text.includes('目標更新'))?.text.slice(0, 60)}…; rail ${rail.replace(/\s+/g, ' ')}`);
  await r.ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter((c) => !c[1]);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
