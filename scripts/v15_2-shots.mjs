// v15.2 check: 保暖 = mulch layer round the roots (laying animation, stays for the day, reload, gone next day, small +
// large tree), campfire = nightly ambient effect (every night, not tied to 保暖/cold; light always in the scene,
// intensity 0 by day), fire outside the mulch ring, reduced motion, desktop 1280×800. No console errors.
// Screenshots → /workspace/tree-game-shots/v15.2/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v15.2';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 390, height: 844 }, deviceScaleFactor: opts.viewport ? 1 : 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: !opts.viewport, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, species = 'redwood') {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('v152-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    sessionStorage.setItem('v152-seeded', '1');
  }, dev);
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await page.locator(`[data-species="${species}"]`).click();
  await page.locator('[data-action="start-game"]').click();
  await page.waitForTimeout(1200);
  await closeModals(page);
}
async function closeModals(page) {
  for (let i = 0; i < 3; i++) {
    if (await page.locator('#modal').isHidden()) break;
    await page.locator('#modal [data-action="close-modal"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => document.querySelector('[data-action="dismiss-note"]')?.click());
  await page.waitForTimeout(400);
}
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const info = (p) => p.evaluate(() => window.__tree.campfire());
const tapNow = (p, action) => p.evaluate((a) => document.querySelector(`#dock [data-action="${a}"]`).click(), action);
const slow = (p, k) => p.evaluate((x) => window.__tree.careFxSpeed(x), k);
const setTime = async (p, time) => {
  await p.evaluate((t) => {
    const d = JSON.parse(localStorage.getItem('sekai-tree-dev'));
    localStorage.setItem('sekai-tree-dev', JSON.stringify({ ...d, time: t }));
  }, time);
  await p.reload();
  await p.waitForTimeout(2200);
  await closeModals(p);
};
const toastText = (p) => p.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map((e) => e.textContent).join(' '));
const fireOutsideMulch = (f) => f.distM - f.radiusM > f.mulchOuterM;

// 1. Normal (non-cold) day → night: campfire every night, no mulch.
const { ctx: c1, page: p1 } = await newPage();
await setup(p1, devBase);
let f = await info(p1);
ok('day: campfire hidden, light in scene at 0', !f.lit && f.nightK === 0 && f.lightIntensity === 0, JSON.stringify({ lit: f.lit, k: f.nightK, I: f.lightIntensity }));
ok('day: no mulch without 保暖', !f.mulch);
ok('保暖 button: mulch icon, label 保暖', (await p1.locator('#dock [data-action="warm-cover"] .dock-label').innerText()) === '保暖' && (await p1.locator('#dock [data-action="warm-cover"] svg path').count()) >= 6);
await setTime(p1, 'night');
f = await info(p1);
ok('normal night: campfire lit (not tied to 保暖/cold)', f.lit && f.nightK === 1 && f.lightIntensity > 0, JSON.stringify({ k: f.nightK, I: f.lightIntensity }));
ok('normal night: fire outside the mulch ring', fireOutsideMulch(f), `dist ${f.distM.toFixed(3)} r ${f.radiusM.toFixed(3)} mulch ${f.mulchOuterM.toFixed(3)}`);
await shot(p1, '04-night-campfire-normal-day');
await c1.close();

// 2. Cold day: 保暖 → mulch laying animation, laid (day, small tree), reload, night with both, next day gone.
const { ctx: c2, page: p2 } = await newPage();
await setup(p2, { ...devBase, events: ['cold'] });
await slow(p2, 0.3);
await tapNow(p2, 'warm-cover');
await p2.waitForTimeout(2300);
await shot(p2, '01-mulch-laying-mid');
f = await info(p2);
ok('保暖: mulch laying animation running', f.mulch && f.laying, JSON.stringify({ mulch: f.mulch, laying: f.laying }));
const t2 = await toastText(p2);
ok('保暖 toast: 「保暖：喺樹根周圍鋪好覆蓋物…」', /保暖：喺樹根周圍鋪好覆蓋物/.test(t2), t2.slice(0, 60));
await slow(p2, 1);
await p2.waitForTimeout(4000);
f = await info(p2);
ok('保暖: mulch laid, animation finished', f.mulch && !f.laying);
ok('mulch clear of the trunk', f.mulchInnerM > f.trunkM, `inner ${f.mulchInnerM.toFixed(3)} trunk ${f.trunkM.toFixed(3)} outer ${f.mulchOuterM.toFixed(3)}`);
ok('day: still no campfire', !f.lit && f.lightIntensity === 0);
ok('保暖 button done (warm)', (await p2.locator('#dock [data-action="warm-cover"].lit').count()) === 1);
const body = await p2.evaluate(() => document.body.innerText);
ok('no 保暖覆蓋 / 營火 wording on screen', !body.includes('保暖覆蓋') && !body.includes('營火'));
await shot(p2, '02-mulch-laid-small-tree');
await p2.reload();
await p2.waitForTimeout(2000);
await closeModals(p2);
f = await info(p2);
ok('reload: mulch still there, no replayed animation', f.mulch && !f.laying);
await setTime(p2, 'night');
f = await info(p2);
ok('cold night: mulch + campfire, fire outside mulch', f.mulch && f.lit && fireOutsideMulch(f));
await shot(p2, '05-night-mulch-and-campfire');
await p2.evaluate(() => window.__tree.advanceDay());
await p2.waitForTimeout(900);
await closeModals(p2);
f = await info(p2);
ok('next day: mulch gone, campfire still nightly', !f.mulch && f.lit);
await c2.close();

// 3. Larger tree (dev preview stage 3).
const { ctx: c3, page: p3 } = await newPage();
await setup(p3, { ...devBase, events: ['cold'], preview: { stage: 3 } });
await p3.waitForTimeout(1000);
await tapNow(p3, 'warm-cover');
await p3.waitForTimeout(4500);
f = await info(p3);
const v3 = await p3.evaluate(() => window.__tree.viewInfo());
ok('large: mulch laid round the roots', f.mulch && f.mulchInnerM > f.trunkM, `tree ${v3.treeM.toFixed(1)} m, mulch ${f.mulchInnerM.toFixed(2)}–${f.mulchOuterM.toFixed(2)} m, trunk ${f.trunkM.toFixed(2)} m`);
ok('large: fire spot outside mulch', fireOutsideMulch(f));
await shot(p3, '03-mulch-large-tree');
await setTime(p3, 'night');
await shot(p3, '07-night-large-tree-mulch-campfire');
await c3.close();

// 4. Reduced motion: mulch just appears; campfire steady.
const { ctx: c4, page: p4 } = await newPage({ reduced: true });
await setup(p4, { ...devBase, events: ['cold'], time: 'night' });
await tapNow(p4, 'warm-cover');
await p4.waitForTimeout(300);
f = await info(p4);
ok('reduced: mulch appears without animation, fire lit', f.mulch && !f.laying && f.lit);
await c4.close();

// 5. Desktop 1280×800, cold day with mulch, dusk-ish night view.
const { ctx: c5, page: p5 } = await newPage({ viewport: { width: 1280, height: 800 } });
await setup(p5, { ...devBase, events: ['cold'] });
await tapNow(p5, 'warm-cover');
await p5.waitForTimeout(4000);
await shot(p5, '06-desktop-1280-mulch-day');
await setTime(p5, 'night');
await shot(p5, '08-desktop-1280-night');
await c5.close();

await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed; console errors: ${errors.length}`);
if (errors.length) console.log(errors.join('\n'));
process.exit(failed.length || errors.length ? 1 : 0);
