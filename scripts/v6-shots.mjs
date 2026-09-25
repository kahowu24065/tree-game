// v6 visual check: growing habitat islands, per-stage animal caps, refined animals, canopy density, soft heat light.
import { chromium } from 'playwright';
import fs from 'fs';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v6';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
fs.mkdirSync(OUT, { recursive: true });
const SPECIES = [
  ['s3', 'camphor', '樟樹'], ['s3', 'cotton', '木棉'], ['s3', 'banyan', '細葉榕'],
  ['s6', 'metasequoia', '水杉'], ['s6', 'ginkgo', '銀杏'], ['s6', 'deodar', '雪松'],
  ['s12', 'redwood', '北美紅杉'], ['s12', 'eucalyptus', '杏仁桉'], ['s12', 'douglas', '花旗松'],
];
const SEASON_OF = Object.fromEntries(SPECIES.map(([s, id]) => [id, s]));
const STAGES = ['幼苗', '小樹', '青年樹', '成年樹', '巨樹'];
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, seed) {
  // Seed storage before any app code runs (a first load without a save could otherwise race and overwrite it).
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v6-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v6-seeded', '1');
  }, [dev, seed]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const setDev = (page, patch) => page.evaluate((p) => {
  const d = JSON.parse(localStorage.getItem('sekai-tree-dev'));
  localStorage.setItem('sekai-tree-dev', JSON.stringify({ ...d, ...p }));
}, patch);
const setSave = (page, patch) => page.evaluate((p) => {
  const d = JSON.parse(localStorage.getItem('sekai-tree-v2'));
  localStorage.setItem('sekai-tree-v2', JSON.stringify({ ...d, ...p }));
}, patch);
const hideHud = (page, hide = true) => page.evaluate((h) => {
  for (const id of ['status-card', 'rail', 'sheet', 'dock', 'weather-card', 'place-pill', 'gear', 'dev-root', 'toast']) {
    const el = document.getElementById(id);
    if (el) el.style.visibility = h ? 'hidden' : '';
  }
}, hide);
const CLIP = { x: 0, y: 40, width: 390, height: 760 };

async function compose(ctx, items, cols, file, title, w = 260) {
  const cells = items.map(([f, label]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"/><figcaption>${label}</figcaption></figure>`).join('');
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: cols * w, height: 400 });
  await p2.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">${title}</h2><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px">${cells}</div><style>figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center}img{width:100%;display:block}figcaption{padding:4px;font-size:16px;font-weight:600}</style></body></html>`);
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: file, fullPage: true });
  await p2.close();
}

// 0. Start a game through the picker to get a real save.
const { ctx, page } = await newPage();
await setup(page, devBase);
await page.locator('[data-pick-season="s6"]').click();
await page.locator('[data-species="metasequoia"]').click();
await page.locator('#tree-name').fill('水杉仔');
await page.locator('[data-action="start-game"]').click();
await page.waitForTimeout(1200);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('game starts', saved && saved.species === 'metasequoia');
const seed = { ...saved, health: 95, moisture: 70, nutrients: 70 };
await setSave(page, seed);

async function shot(p, file, { species, stage, island, health = 95, wait = 1700, events, clip = CLIP } = {}) {
  await setDev(p, { preview: { species, stage, island }, ...(events ? { events } : {}) });
  await setSave(p, { health, season: SEASON_OF[species] ?? 's6' });
  await p.reload();
  await p.waitForTimeout(wait);
  await hideHud(p);
  await p.screenshot({ path: file, clip });
  return file;
}

// 1. Island through the five stages for 水杉 and 雪松 (and 杏仁桉).
if (want('islands')) {
  for (const [id, name] of [['metasequoia', '水杉'], ['deodar', '雪松'], ['eucalyptus', '杏仁桉']]) {
    const strip = [];
    for (let s = 0; s < 5; s++) strip.push([await shot(page, `${OUT}/island-${id}-${s}.png`, { species: id, stage: s }), `${s + 1}. ${STAGES[s]}`]);
    await compose(ctx, strip, 5, `${OUT}/01-island-stages-${id}.png`, `${name}：島嶼隨生長階段擴建（幼苗 → 巨樹）`);
  }
}

// 2. All nine species at 巨樹 with their themed islands, high health.
if (want('grid')) {
  const grid = [];
  for (const [, id, name] of SPECIES) grid.push([await shot(page, `${OUT}/giant-${id}.png`, { species: id, stage: 4, health: 95, wait: 2000 }), name]);
  await compose(ctx, grid, 3, `${OUT}/02-giant-grid-9-species.png`, '九個樹種・巨樹・原生地主題島嶼（健康 95）');
}

// 3. Healthy vs neglected canopy.
if (want('canopy')) {
  const items = [];
  for (const id of ['metasequoia', 'eucalyptus', 'camphor']) {
    const n = SPECIES.find((x) => x[1] === id)[2];
    items.push([await shot(page, `${OUT}/canopy-${id}-95.png`, { species: id, stage: 3, island: 0, health: 95 }), `${n}・健康 95`]);
    items.push([await shot(page, `${OUT}/canopy-${id}-25.png`, { species: id, stage: 3, island: 0, health: 25 }), `${n}・健康 25`]);
  }
  await compose(ctx, items, 2, `${OUT}/03-canopy-healthy-vs-low.png`, '樹冠密度：悉心照顧（左）vs 疏於照顧（右）', 300);
}
await ctx.close();

// 4. Soft heat light before/after.
if (want('heat')) {
  const { ctx: hctx, page: hp } = await newPage();
  await setup(hp, { ...devBase, events: ['clear'], preview: { species: 'camphor', stage: 3, island: 3 } }, { ...seed, season: 's3', species: 'camphor' });
  await hideHud(hp);
  await hp.screenshot({ path: `${OUT}/04-heat-before.png` });
  await setDev(hp, { events: ['hot'] });
  await hp.reload();
  await hp.waitForTimeout(5500);
  await hideHud(hp);
  await hp.screenshot({ path: `${OUT}/04-heat-after.png` });
  await hp.waitForTimeout(2600);
  await hp.screenshot({ path: `${OUT}/04-heat-after-2.png` });
  await compose(hctx, [[`${OUT}/04-heat-before.png`, '平日'], [`${OUT}/04-heat-after.png`, '酷熱：右上柔光'], [`${OUT}/04-heat-after-2.png`, '酷熱：光暈呼吸']], 3, `${OUT}/04-heat-compare.png`, '酷熱光效：由右上角柔和照落樹度');
  await hctx.close();
}

// 5. Animals: caps readout, close-ups via the follow-cam, and a video.
if (want('animals')) {
  const { ctx: actx, page: ap } = await newPage();
  await setup(ap, { ...devBase, open: true, preview: { species: 'banyan', stage: 4 } }, { ...seed, season: 's3', species: 'banyan', health: 95 });
  await ap.locator('#dev-root [data-dev="unlock-all"]').click();
  await ap.waitForTimeout(2500);
  const caps = await ap.locator('#dev-root [data-dev-caps]').innerText();
  ok('dev cap readout', /上限/.test(caps) && /7 組/.test(caps), caps);
  const habitat = await ap.locator('#dev-root [data-dev-habitat]').innerText();
  ok('dev habitat readout', /島嶼/.test(habitat), habitat);
  // Close-ups: each subject alone on a fresh page so the follow-cam has a clear view.
  const CLOSE = (process.env.CLOSE || '').split(',').filter(Boolean);
  const closeup = async (id, frames, opts = {}) => {
    if (CLOSE.length && !CLOSE.includes(id)) return [];
    const { ctx: c2, page: p2 } = await newPage();
    await setup(p2, { ...devBase, open: true, time: 'day', preview: { species: opts.species ?? 'camphor', stage: 4, island: opts.island ?? 2 } }, { ...seed, season: 's3', species: 'camphor', health: 95, animals: [], residents: [] });
    if (await p2.locator('#modal:not([hidden]) [data-action="start-game"]').count()) console.log('  (start modal visible for', id, ')');
    await p2.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p2.locator('#dev-root [data-dev="spawn"]').click();
    await p2.waitForTimeout(1200);
    await p2.locator('#dev-root [data-dev-animal]').selectOption(id);
    await p2.locator('#dev-root [data-dev="follow"]').click();
    await p2.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
    await hideHud(p2);
    const out = [];
    for (const [name, wait] of frames) {
      await p2.waitForTimeout(wait);
      const f = `${OUT}/05-closeup-${name}.png`;
      await p2.screenshot({ path: f, clip: { x: 0, y: 120, width: 390, height: 600 } });
      out.push([f, name]);
    }
    await c2.close();
    return out;
  };
  const shots = [
    ...(await closeup('macaque', [['macaque-walk', 3500], ['macaque-idle', 6000], ['macaque-later', 7000]])),
    ...(await closeup('kite', [['bird-flying-kite', 4000]])),
    ...(await closeup('whiteeye', [['bird-flock', 3000], ['bird-perched', 14000]])),
    ...(await closeup('muntjac', [['mammal-walking-muntjac', 3500], ['mammal-idle-muntjac', 6000]])),
    ...(await closeup('boar', [['mammal-boar', 4000]])),
    ...(await closeup('buffalo', [['mammal-buffalo', 4000]])),
    ...(await closeup('leopardcat', [['mammal-leopardcat', 5000]])),
    ...(await closeup('squirrel', [['squirrel', 5000], ['squirrel-2', 5000]])),
    ...(await closeup('plaintiger', [['butterfly', 4000]])),
    ...(await closeup('egret', [['egret-wading', 4000]])),
  ];
  await compose(actx, shots, 5, `${OUT}/05-animal-closeups.png`, '動物特寫（開發者跟拍鏡頭）');
  // Encyclopedia previews.
  await ap.evaluate(() => { const fab = document.querySelector('#dev-root .dev-fab'); if (!document.querySelector('#dev-root .dev-panel').hidden) fab.click(); });
  await ap.locator('#dock [data-open="album"]').click();
  await ap.waitForTimeout(4000);
  await ap.screenshot({ path: `${OUT}/06-encyclopedia-animals.png` });
  await ap.locator('#panel').evaluate((el) => (el.scrollTop = 1400));
  await ap.waitForTimeout(1500);
  await ap.screenshot({ path: `${OUT}/06-encyclopedia-animals-2.png` });
  await ap.locator('[data-album-mode="species"]').click();
  await ap.waitForTimeout(3000);
  await ap.locator('#panel').evaluate((el) => (el.scrollTop = 500));
  await ap.waitForTimeout(800);
  await ap.screenshot({ path: `${OUT}/06-encyclopedia-species-habitat.png` });
  await actx.close();
}

// 6. Video of animals moving around a big island (normal framing + follow cam).
if (want('video')) {
  const { ctx: vctx, page: vp } = await newPage({ recordVideo: { dir: '/tmp/v6vid', size: { width: 390, height: 844 } }, deviceScaleFactor: 1 });
  await setup(vp, { ...devBase, open: true, preview: { species: 'camphor', stage: 4 } }, { ...seed, season: 's3', species: 'camphor', health: 95 });
  await vp.locator('#dev-root [data-dev="unlock-all"]').click();
  for (const id of ['macaque', 'muntjac', 'whiteeye', 'plaintiger']) {
    await vp.locator('#dev-root [data-dev-animal]').selectOption(id);
    await vp.locator('#dev-root [data-dev="spawn"]').click();
    await vp.waitForTimeout(100);
  }
  await vp.locator('#dev-root [data-dev-animal]').selectOption('macaque');
  await vp.locator('#dev-root [data-dev="follow"]').click();
  await vp.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await hideHud(vp);
  await vp.waitForTimeout(9000);
  await hideHud(vp, false);
  await vp.evaluate(() => { if (document.querySelector('#dev-root .dev-panel').hidden) document.querySelector('#dev-root .dev-fab').click(); });
  await vp.waitForTimeout(300);
  await vp.locator('#dev-root [data-dev-animal]').selectOption('muntjac');
  await vp.locator('#dev-root [data-dev="follow"]').click();
  await vp.locator('#dev-root [data-dev-animal]').selectOption('muntjac');
  await vp.locator('#dev-root [data-dev="follow"]').click();
  await vp.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await hideHud(vp);
  await vp.waitForTimeout(7000);
  await hideHud(vp, false);
  await vp.evaluate(() => { if (document.querySelector('#dev-root .dev-panel').hidden) document.querySelector('#dev-root .dev-fab').click(); });
  await vp.waitForTimeout(300);
  await vp.locator('#dev-root [data-dev-animal]').selectOption('whiteeye');
  await vp.locator('#dev-root [data-dev="follow"]').click();
  await vp.locator('#dev-root [data-dev-animal]').selectOption('whiteeye');
  await vp.locator('#dev-root [data-dev="follow"]').click();
  await vp.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await hideHud(vp);
  await vp.waitForTimeout(6000);
  const vpath = await vp.video().path();
  await vctx.close();
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '3', '-i', vpath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/07-animals-moving.mp4`]);
    ok('animals mp4 written', fs.existsSync(`${OUT}/07-animals-moving.mp4`));
  } catch (e) {
    fs.copyFileSync(vpath, `${OUT}/07-animals-moving.webm`);
    ok('animals video (webm, ffmpeg failed)', true, String(e));
  }
}

// 7. Per-stage cap check: seedling with everything unlocked shows one small group.
if (want('caps')) {
  const { ctx: cctx, page: cp } = await newPage();
  await setup(cp, { ...devBase, open: true, preview: { species: 'camphor', stage: 0 } }, { ...seed, season: 's3', species: 'camphor', health: 95 });
  await cp.locator('#dev-root [data-dev="unlock-all"]').click();
  await cp.waitForTimeout(2500);
  const caps0 = await cp.locator('#dev-root [data-dev-caps]').innerText();
  ok('seedling cap = 1 group', /1 組/.test(caps0) && /訪客 [01] 組/.test(caps0), caps0);
  await cp.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
  await hideHud(cp);
  await cp.screenshot({ path: `${OUT}/08-caps-seedling.png`, clip: CLIP });
  await setDev(cp, { preview: { species: 'camphor', stage: 4 }, open: true });
  await cp.reload();
  await cp.waitForTimeout(3500);
  const caps4 = await cp.locator('#dev-root [data-dev-caps]').innerText();
  ok('giant cap = 7 groups', /7 組/.test(caps4), caps4);
  await cp.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
  await cp.waitForTimeout(4000);
  await hideHud(cp);
  await cp.screenshot({ path: `${OUT}/08-caps-giant.png`, clip: CLIP });
  await compose(cctx, [[`${OUT}/08-caps-seedling.png`, `幼苗：${caps0.replace(/^.*?：/, '')}`], [`${OUT}/08-caps-giant.png`, `巨樹：${caps4.replace(/^.*?：/, '')}`]], 2, `${OUT}/08-caps-compare.png`, '動物上限隨階段增加', 360);
  await cctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
