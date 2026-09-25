// v5 visual check: species picker, 9 species, growth stages, typhoon sway video, heat glare, animal groups, encyclopedia.
import { chromium } from 'playwright';
import fs from 'fs';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v5';
fs.mkdirSync(OUT, { recursive: true });
const SPECIES = [
  ['s3', 'camphor', '樟樹'], ['s3', 'cotton', '木棉'], ['s3', 'banyan', '細葉榕'],
  ['s6', 'metasequoia', '水杉'], ['s6', 'ginkgo', '銀杏'], ['s6', 'deodar', '雪松'],
  ['s12', 'redwood', '北美紅杉'], ['s12', 'eucalyptus', '杏仁桉'], ['s12', 'douglas', '花旗松'],
];
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
  await page.goto(BASE);
  await page.evaluate(([d, s]) => {
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
  }, [dev, seed]);
  await page.reload();
  await page.waitForTimeout(1800);
}
const setDev = (page, patch) => page.evaluate((p) => {
  const d = JSON.parse(localStorage.getItem('sekai-tree-dev'));
  localStorage.setItem('sekai-tree-dev', JSON.stringify({ ...d, ...p }));
}, patch);
const hideHud = (page, hide = true) => page.evaluate((h) => {
  for (const id of ['status-card', 'rail', 'sheet', 'dock', 'weather-card', 'place-pill', 'gear', 'dev-root', 'toast']) {
    const el = document.getElementById(id);
    if (el) el.style.visibility = h ? 'hidden' : '';
  }
}, hide);

// 1. Picker + start a game (seed save for later shots).
const { ctx, page } = await newPage();
await setup(page, devBase);
const modal = await page.locator('#modal').innerText();
ok('picker shows 3 seasons + 3 species', /3 個月/.test(modal) && (await page.locator('[data-species]').count()) === 3);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/01-picker-s3.png` });
await page.locator('[data-pick-season="s6"]').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/01-picker-s6.png` });
await page.locator('[data-pick-season="s12"]').click();
await page.locator('[data-species="eucalyptus"]').click();
await page.waitForTimeout(1500);
ok('picker switches to 1-year species', /北美紅杉/.test(await page.locator('#modal').innerText()));
await page.screenshot({ path: `${OUT}/01-picker-s12.png` });
await page.locator('#tree-name').fill('大桉');
await page.locator('[data-action="start-game"]').click();
await page.waitForTimeout(1500);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('game starts with chosen species', saved.species === 'eucalyptus' && saved.season === 's12', `${saved.species}/${saved.season}`);
await page.screenshot({ path: `${OUT}/02-main.png` });

// FPS (swiftshader, so this is a floor, not a phone number).
const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
ok('frame rate measured', fps > 5, `${fps.toFixed(1)} fps (software GL)`);

// 2. Every species at 成年樹 and 巨樹 via the dev preview.
const seed = { ...saved, health: 92 };
const grid = { 3: [], 4: [] };
for (const stage of [3, 4]) {
  for (const [, id, name] of SPECIES) {
    await setDev(page, { preview: { species: id, stage } });
    await page.reload();
    await page.waitForTimeout(1600);
    await hideHud(page);
    const file = `${OUT}/species-${stage === 3 ? 'mature' : 'giant'}-${id}.png`;
    await page.screenshot({ path: file, clip: { x: 0, y: 60, width: 390, height: 720 } });
    grid[stage].push([file, name]);
  }
}
// 3. One species through its five stages (redwood) and a second (cotton).
const strips = {};
for (const id of ['redwood', 'cotton', 'ginkgo']) {
  strips[id] = [];
  for (let s = 0; s < 5; s++) {
    await setDev(page, { preview: { species: id, stage: s } });
    await page.reload();
    await page.waitForTimeout(1500);
    await hideHud(page);
    const file = `${OUT}/stages-${id}-${s}.png`;
    await page.screenshot({ path: file, clip: { x: 0, y: 60, width: 390, height: 720 } });
    strips[id].push([file, STAGES[s]]);
  }
}
// Compose grids in the browser.
async function compose(items, cols, file, title) {
  const cells = items.map(([f, label]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"/><figcaption>${label}</figcaption></figure>`).join('');
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: cols * 260, height: 400 });
  await p2.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">${title}</h2><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px">${cells}</div><style>figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center}img{width:100%;display:block}figcaption{padding:4px;font-size:16px;font-weight:600}</style></body></html>`);
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: file, fullPage: true });
  await p2.close();
}
await compose(grid[3], 3, `${OUT}/03-species-grid-mature.png`, '九個樹種・成年樹');
await compose(grid[4], 3, `${OUT}/03-species-grid-giant.png`, '九個樹種・巨樹（賽季目標高度）');
await compose(strips.redwood, 5, `${OUT}/04-stages-redwood.png`, '北美紅杉：幼苗 → 巨樹');
await compose(strips.cotton, 5, `${OUT}/04-stages-cotton.png`, '木棉：幼苗 → 巨樹');
await compose(strips.ginkgo, 5, `${OUT}/04-stages-ginkgo.png`, '銀杏：幼苗 → 巨樹');
await ctx.close();

// 4. Typhoon sway video + calm comparison (recorded).
{
  const { ctx: vctx, page: vp } = await newPage({ recordVideo: { dir: '/tmp/v5vid', size: { width: 390, height: 844 } }, deviceScaleFactor: 1 });
  await setup(vp, { ...devBase, events: ['typhoon8'], sway: null, preview: { species: 'metasequoia', stage: 3 } }, { ...seed, species: 'eucalyptus' });
  await vp.waitForTimeout(1000);
  await vp.screenshot({ path: `${OUT}/05-typhoon-sway.png` });
  await vp.waitForTimeout(7000);
  const vpath = await vp.video().path();
  await vctx.close();
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2', '-i', vpath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/05-typhoon-sway.mp4`]);
    ok('typhoon mp4 written', fs.existsSync(`${OUT}/05-typhoon-sway.mp4`));
  } catch (e) {
    fs.copyFileSync(vpath, `${OUT}/05-typhoon-sway.webm`);
    ok('typhoon video (webm, ffmpeg failed)', true, String(e));
  }
}

// 5. Heat glare (forced trigger; random cadence also runs during 酷熱).
{
  const { ctx: hctx, page: hp } = await newPage();
  await setup(hp, { ...devBase, events: ['hot'], sway: null, open: true, preview: { species: 'camphor', stage: 3 } }, { ...seed, season: 's3', species: 'camphor' });
  await hp.waitForTimeout(800);
  await hp.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await hp.waitForTimeout(300);
  await hp.screenshot({ path: `${OUT}/06-heat-before.png` });
  await hp.evaluate(() => { document.querySelector('#dev-root .dev-fab').click(); });
  await hp.waitForTimeout(300);
  await hp.locator('#dev-root [data-dev="glare"]').click();
  await hp.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await hp.waitForTimeout(1250);
  await hp.screenshot({ path: `${OUT}/06-heat-glare.png` });
  await hctx.close();
}

// 6. Animal groups: unlock all, spawn a flock + monkeys, then the encyclopedia.
{
  const { ctx: actx, page: ap } = await newPage();
  await setup(ap, { ...devBase, open: true, preview: { species: 'banyan', stage: 3 } }, { ...seed, season: 's3', species: 'banyan', heightCm: 1400, health: 95 });
  await ap.locator('#dev-root [data-dev="unlock-all"]').click();
  await ap.waitForTimeout(400);
  const count = await ap.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).animals.length);
  ok('unlock all animals', count >= 50, String(count));
  for (const id of ['whiteeye', 'macaque', 'swallow', 'boar']) {
    await ap.locator('#dev-root [data-dev-animal]').selectOption(id);
    await ap.locator('#dev-root [data-dev="spawn"]').click();
    await ap.waitForTimeout(150);
  }
  await ap.waitForTimeout(3500);
  const eco = await ap.locator('#dev-root [data-dev-eco]').innerText();
  ok('dev readout lists visible groups', /×/.test(eco), eco);
  await ap.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await ap.waitForTimeout(1200);
  await ap.screenshot({ path: `${OUT}/07-animal-groups.png` });
  await ap.waitForTimeout(2500);
  await ap.screenshot({ path: `${OUT}/07-animal-groups-2.png` });
  // butterflies + insects
  await ap.evaluate(() => document.querySelector('#dev-root .dev-fab').click());
  await ap.waitForTimeout(200);
  for (const id of ['plaintiger', 'bluebottle', 'dragonfly', 'egret', 'kite']) {
    await ap.locator('#dev-root [data-dev-animal]').selectOption(id);
    await ap.locator('#dev-root [data-dev="spawn"]').click();
    await ap.waitForTimeout(150);
  }
  await ap.locator('#dev-root .dev-panel header [data-dev="toggle"]').click();
  await ap.waitForTimeout(3000);
  await ap.screenshot({ path: `${OUT}/07-animal-groups-3.png` });
  await ap.locator('#dock [data-open="album"]').click();
  await ap.waitForTimeout(4000);
  await ap.screenshot({ path: `${OUT}/08-encyclopedia-animals.png` });
  await ap.locator('#panel').evaluate((el) => (el.scrollTop = 1800));
  await ap.waitForTimeout(1500);
  await ap.screenshot({ path: `${OUT}/08-encyclopedia-animals-2.png` });
  await ap.locator('[data-album-mode="species"]').click();
  await ap.waitForTimeout(4000);
  await ap.screenshot({ path: `${OUT}/08-encyclopedia-species.png` });
  const cards = await ap.locator('.species-card').count();
  ok('species encyclopedia has 9 cards', cards === 9);
  await actx.close();
}

// 7. Locked encyclopedia (fresh game).
{
  const { ctx: lctx, page: lp } = await newPage();
  await setup(lp, devBase, { ...seed, animals: ['butterfly', 'sparrow', 'whiteeye'] });
  await lp.locator('#dock [data-open="album"]').click();
  await lp.waitForTimeout(3500);
  await lp.screenshot({ path: `${OUT}/08-encyclopedia-locked.png` });
  await lctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
