// v16 check: collapse animation (sway, snap, top falls, fades, shorter tree settles), broken-top look + fallen log,
// low-health / 瀕死 looks, death animation (leaves drop, falls, dead log) + over card ~2.5 s later, reload of a dead
// save (no replay), reduced motion, dev day skips ending 瀕死, desktop 1280×800. No console errors.
// Screenshots → /workspace/tree-game-shots/v16/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v16';
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
async function setup(page, species = 'camphor', stage = 3) {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('v16-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    sessionStorage.setItem('v16-seeded', '1');
  }, devBase);
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await page.locator(`[data-species="${species}"]`).click();
  await page.locator('[data-action="start-game"]').click();
  await page.waitForTimeout(1000);
  await closeModals(page);
  await page.evaluate((s) => window.__tree.grow(s), stage);
  await page.waitForTimeout(600);
  await closeModals(page);
  await page.evaluate(() => {
    window.__tree.setStat('health', 92);
    window.__tree.setStat('moisture', 75);
    window.__tree.setStat('nutrients', 85);
  });
  await page.waitForTimeout(1500);
}
async function closeModals(page) {
  for (let i = 0; i < 3; i++) {
    if (await page.locator('#modal').isHidden()) break;
    await page.locator('#modal [data-action="close-modal"], #modal [data-action="wind-explained"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => document.querySelector('[data-action="dismiss-note"]')?.click());
  await page.waitForTimeout(300);
}
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const fx = (p) => p.evaluate(() => window.__tree.fx());
const game = (p) => p.evaluate(() => window.__tree.game());
async function waitFx(p, pred, ms = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const f = await fx(p);
    if (pred(f)) return f;
    await p.waitForTimeout(60);
  }
  return fx(p);
}
const modalOpen = (p) => p.locator('#modal').isVisible();
// Freeze the effect clock at a moment for a screenshot (the camera keeps easing), then carry on at `resume` speed.
async function freezeShot(p, tMin, name, resume) {
  const f = await waitFx(p, (x) => x.fall && x.fall.t > tMin, 90000);
  await p.evaluate(() => window.__tree.fxSpeed(0));
  await p.waitForTimeout(900);
  await shot(p, name);
  await p.evaluate((k) => window.__tree.fxSpeed(k), resume);
  return f;
}

// 1. Collapse (camphor, 成年樹), slowed down for the screenshots.
const { ctx: c1, page: p1 } = await newPage();
await setup(p1);
const before = await game(p1);
await p1.evaluate(() => window.__tree.fxSpeed(0.22));
await p1.evaluate(() => window.__tree.collapse(false));
let f = await waitFx(p1, (x) => x.fall && x.fall.t > 0.7);
ok('collapse: plays on the first view after the settlement', f.fall?.mode === 'collapse' && !f.treeVisible && !f.animals, JSON.stringify(f.fall));
ok('collapse: storm darkening during the replay', f.storm > 0.5, `storm ${f.storm.toFixed(2)}`);
ok('collapse: modal waits for the animation', !(await modalOpen(p1)));
f = await freezeShot(p1, 1.62, '01-collapse-mid-snap', 0.22);
ok('collapse: snap phase', f.fall?.phase === 'snap', f.fall?.phase);
await freezeShot(p1, 2.15, '02-collapse-top-falling', 0.22);
await freezeShot(p1, 2.9, '02b-collapse-top-down', 1);
f = await waitFx(p1, (x) => !x.fall, 90000);
ok('collapse: finishes, shorter tree shown with broken top', f.treeVisible && f.broken && f.visibleTopM < f.heightM * 0.95, `top ${f.visibleTopM.toFixed(2)} / ${f.heightM.toFixed(2)}`);
let g = await game(p1);
ok('collapse: state (−20% height, lastCollapse seen)', g.lastCollapse?.seen === true && Math.abs(g.heightCm - g.lastCollapse.heightBefore * 0.8) < 1 && g.collapses >= 1, JSON.stringify(g.lastCollapse));
await p1.waitForTimeout(800);
ok('collapse: night card opens after the animation', await modalOpen(p1));
await closeModals(p1);
await p1.evaluate(() => window.__tree.fxSpeed(1));
await p1.waitForTimeout(1200);
f = await fx(p1);
ok('broken top: fallen log beside the tree, animals back', f.logProp && f.animals && !f.fall);
await shot(p1, '03-broken-top-after');
// Reload: no replay, broken top and log stay.
await p1.reload();
await p1.waitForTimeout(2500);
f = await fx(p1);
ok('reload after collapse: no replay, broken top + log stay', !f.fall && f.broken && f.logProp);
await closeModals(p1);
// Next day: log still there (day 1–3), broken top unchanged until regrowth.
// 2. Low health < 25.
await p1.evaluate(() => window.__tree.setStat('health', 18));
await p1.waitForTimeout(1600);
f = await fx(p1);
ok('low health: yellowing, drooping, a few leaves falling', f.wither > 0.4 && f.droop > 0.2 && f.leafFall > 0 && f.pulse === 0, JSON.stringify({ w: f.wither.toFixed(2), d: f.droop.toFixed(2), lf: f.leafFall }));
await shot(p1, '04-low-health-18');
// 3. 瀕死.
await p1.evaluate(() => window.__tree.dying());
await p1.waitForTimeout(2200);
f = await fx(p1);
ok('瀕死: nearly bare brown, leaf fall loop, red pulse', f.wither >= 0.9 && f.leafFall >= 8 && f.pulse > 0, JSON.stringify({ w: f.wither, lf: f.leafFall, p: f.pulse.toFixed(3) }));
await shot(p1, '05-dying');
// 4. Death: dev skips end 瀕死 (A): dying at game-now, 1st skip same moment → alive, 2nd skip (+24 h) → dead.
await p1.evaluate(() => window.__tree.fxSpeed(0.3));
await p1.evaluate(() => window.__tree.advanceDay());
await p1.waitForTimeout(700);
g = await game(p1);
const aliveAfterOne = !g.over;
await closeModals(p1);
await p1.evaluate(() => { window.__tree.setStat('moisture', 20); window.__tree.setStat('nutrients', 10); });
await p1.evaluate(() => window.__tree.advanceDay());
f = await waitFx(p1, (x) => x.fall && x.fall.t > 0.5);
g = await game(p1);
ok('dev day skips: 瀕死 runs out on the 2nd skip → dead (death animation plays)', aliveAfterOne && g.over?.kind === 'dead' && f.fall?.mode === 'death', JSON.stringify({ aliveAfterOne, over: g.over, fall: f.fall }));
await freezeShot(p1, 0.7, '06-death-leaves-drop', 0.3);
await freezeShot(p1, 1.98, '07-death-mid-fall', 1);
ok('death: modal not before the fall', !(await modalOpen(p1)));
f = await waitFx(p1, (x) => !x.fall, 60000);
await p1.waitForTimeout(1000);
f = await fx(p1);
ok('death: dead log stays, over card open', f.deadLog && !f.treeVisible && (await modalOpen(p1)) && (await p1.locator('#modal [data-action="new-game"]').count()) === 1);
await shot(p1, '08-dead-log-over-modal');
await p1.reload();
await p1.waitForTimeout(2500);
f = await fx(p1);
ok('reload of a dead save: lies as the log, no replay, card again', f.deadLog && !f.fall && (await modalOpen(p1)));
await p1.evaluate(() => document.querySelector('#modal')?.setAttribute('hidden', ''));
await p1.waitForTimeout(300);
await shot(p1, '09-dead-log-no-modal');
await c1.close();

// 5. Timer: 瀕死 whose 24 h ran out dies at once (no settlement needed); fatal third collapse → death.
const { ctx: c2, page: p2 } = await newPage();
await setup(p2, 'redwood', 3);
await p2.evaluate(() => window.__tree.fxSpeed(0.3));
await p2.evaluate(() => window.__tree.collapse(true));
f = await freezeShot(p2, 2.1, '10-fatal-collapse-falling', 1);
ok('fatal collapse: snaps at the base, whole tree falls', f.fall?.mode === 'fatal', JSON.stringify(f.fall));
f = await waitFx(p2, (x) => !x.fall, 90000);
await p2.waitForTimeout(1000);
f = await fx(p2);
g = await game(p2);
ok('fatal collapse: dead log + over card', f.deadLog && g.over?.kind === 'dead' && (await modalOpen(p2)));
await shot(p2, '11-fatal-dead-log');
await c2.close();

const { ctx: c3, page: p3 } = await newPage();
await setup(p3, 'ginkgo', 3);
await p3.evaluate(() => window.__tree.kill());
await p3.waitForTimeout(400);
g = await game(p3);
f = await fx(p3);
ok('timer: expired 瀕死 dies without a settlement', g.over?.kind === 'dead' && f.fall?.mode === 'death');
const openedEarly = await modalOpen(p3);
await waitFx(p3, (x) => !x.fall, 60000);
await p3.waitForTimeout(800);
ok('timer death: over card after the fall (not before)', !openedEarly && (await modalOpen(p3)));
await c3.close();

// 6. Reduced motion: short fades, card soon.
const { ctx: c4, page: p4 } = await newPage({ reduced: true });
await setup(p4, 'camphor', 3);
await p4.evaluate(() => window.__tree.collapse(false));
f = await waitFx(p4, (x) => x.fall && x.fall.t > 0.2);
const rmFirst = f.fall?.t ?? 0;
let maxShake = 0;
let rmEnd = 0;
for (let i = 0; i < 600; i++) {
  f = await fx(p4);
  maxShake = Math.max(maxShake, f.shake);
  if (!f.fall) break;
  rmEnd = f.fall.t;
  await p4.waitForTimeout(50);
}
ok('reduced motion collapse: short fade (< 1.5 s effect time), no shake', !f.fall && f.broken && maxShake === 0 && rmEnd < 1.5, `ends by t=${rmEnd.toFixed(2)} (first ${rmFirst.toFixed(2)})`);
await closeModals(p4);
await p4.evaluate(() => window.__tree.kill());
f = await waitFx(p4, (x) => x.fall, 5000);
let rmDeath = 0;
while (f.fall) { rmDeath = f.fall.t; await p4.waitForTimeout(50); f = await fx(p4); }
await p4.waitForTimeout(600);
ok('reduced motion death: log + card, effect < 1.5 s', f.deadLog && rmDeath < 1.5 && (await modalOpen(p4)), `t=${rmDeath.toFixed(2)}`);
await c4.close();

// 7. Desktop 1280×800.
const { ctx: c5, page: p5 } = await newPage({ viewport: { width: 1280, height: 800 } });
await setup(p5, 'redwood', 3);
await p5.evaluate(() => window.__tree.fxSpeed(0.22));
await p5.evaluate(() => window.__tree.collapse(false));
await freezeShot(p5, 2.15, '12-desktop-collapse-top-falling', 1);
await waitFx(p5, (x) => !x.fall, 90000);
await p5.waitForTimeout(800);
await closeModals(p5);
await p5.evaluate(() => window.__tree.fxSpeed(1));
await p5.waitForTimeout(1200);
await shot(p5, '13-desktop-broken-top');
await p5.evaluate(() => window.__tree.kill());
await waitFx(p5, (x) => x.fall, 5000);
await waitFx(p5, (x) => !x.fall, 60000);
await p5.waitForTimeout(1000);
await shot(p5, '14-desktop-dead-log-modal');
await c5.close();

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
