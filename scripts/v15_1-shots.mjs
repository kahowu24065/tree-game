// v15.1 check: 澆水 / 施肥 3D effects (mid-animation + cleanup), 保暖覆蓋 → 保暖 rename, 保暖 campfire beside the tree
// (small + larger tree, night, survives reload, gone next day), reduced motion, desktop 1280×800. No console errors.
// Screenshots → /workspace/tree-game-shots/v15.1/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v15.1';
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
    if (sessionStorage.getItem('v151-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    sessionStorage.setItem('v151-seeded', '1');
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
// DOM click: same delegated handler, but returns at once (Playwright's click can take seconds under SwiftShader).
const tapNow = (p, action) => p.evaluate((a) => document.querySelector(`#dock [data-action="${a}"]`).click(), action);
// Mid-animation shots: run the care effects at 30 % speed while capturing, then back to normal.
const slow = (p, k) => p.evaluate((x) => window.__tree.careFxSpeed(x), k);
const fire = (p) => p.evaluate(() => window.__tree.campfire());
const noOldName = async (p, where) => {
  const txt = await p.evaluate(() => document.body.innerText);
  ok(`${where}: no 「保暖覆蓋」 on screen`, !txt.includes('保暖覆蓋'));
};
const toastText = (p) => p.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map((e) => e.textContent).join(' '));

// 1. Normal day: water + fertilise effects.
const { ctx: c1, page: p1 } = await newPage();
await setup(p1, devBase);
await slow(p1, 0.3);
await tapNow(p1, 'water');
await p1.waitForTimeout(1600);
await shot(p1, '01-water-effect-mid');
ok('water: effect running', (await fire(p1)).fx > 0);
await slow(p1, 1);
await p1.waitForTimeout(4000);
ok('water: effect cleaned up after ~2.5 s', (await fire(p1)).fx === 0);
await slow(p1, 0.3);
await tapNow(p1, 'fertilize');
await p1.waitForTimeout(1600);
await shot(p1, '02-fertilise-effect-mid');
ok('fertilise: effect running', (await fire(p1)).fx > 0);
await slow(p1, 1);
await p1.waitForTimeout(4000);
ok('fertilise: effect cleaned up', (await fire(p1)).fx === 0);
ok('normal: no campfire', !(await fire(p1)).lit);
ok('normal: 保暖 button disabled + renamed', (await p1.locator('#dock [data-action="warm-cover"]').isDisabled()) && (await p1.locator('#dock [data-action="warm-cover"] .dock-label').innerText()) === '保暖');
await noOldName(p1, 'normal');
await c1.close();

// 2. Cold day: 保暖 button, campfire (small tree), reload, night, next day.
const { ctx: c2, page: p2 } = await newPage();
await setup(p2, { ...devBase, events: ['cold'] });
const label = await p2.locator('#dock [data-action="warm-cover"] .dock-label').innerText();
ok('cold: dock button says 保暖 and is enabled', label === '保暖' && !(await p2.locator('#dock [data-action="warm-cover"]').isDisabled()), label);
ok('cold: button uses the campfire icon', (await p2.locator('#dock [data-action="warm-cover"] svg path').count()) >= 3);
await p2.locator('[data-action="preview"]').click();
await p2.waitForTimeout(400);
const pop = await p2.evaluate(() => document.querySelector('.night-pop')?.innerText ?? '');
ok('cold: 今晚預計 says 做「保暖」就唔扣', /做「保暖」就唔扣/.test(pop), pop.replace(/\s+/g, ' ').slice(0, 120));
await noOldName(p2, 'cold preview');
await p2.locator('[data-action="preview"]').click();
await p2.waitForTimeout(300);
await shot(p2, '03-cold-day-warm-button');
await p2.locator('#dock [data-action="warm-cover"]').click();
await p2.waitForTimeout(300);
const t2 = await toastText(p2);
ok('cold: toast 「保暖：…營火」', /保暖：/.test(t2) && !t2.includes('保暖覆蓋'), t2.slice(0, 80));
await p2.waitForTimeout(1500);
const f2 = await fire(p2);
ok('cold: campfire lit after 保暖', f2.lit, JSON.stringify(f2));
ok('cold: 保暖 button turns warm (lit)', (await p2.locator('#dock [data-action="warm-cover"].lit').count()) === 1);
ok('cold: campfire clear of the trunk', f2.distM > f2.trunkM + f2.radiusM, `dist ${f2.distM.toFixed(3)} trunk ${f2.trunkM.toFixed(3)} r ${f2.radiusM.toFixed(3)}`);
await shot(p2, '04-campfire-small-tree');
await p2.reload();
await p2.waitForTimeout(2000);
await closeModals(p2);
ok('cold: campfire still lit after reload', (await fire(p2)).lit);
await p2.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('sekai-tree-dev'));
  localStorage.setItem('sekai-tree-dev', JSON.stringify({ ...d, time: 'night' }));
});
await p2.reload();
await p2.waitForTimeout(2200);
await closeModals(p2);
await shot(p2, '05-campfire-night');
await noOldName(p2, 'cold done');
await p2.evaluate(() => window.__tree.advanceDay());
await p2.waitForTimeout(800);
await closeModals(p2);
ok('next day: campfire gone', !(await fire(p2)).lit);
await c2.close();

// 3. Larger tree (dev preview stage 3): campfire scales with the scene.
const { ctx: c3, page: p3 } = await newPage();
await setup(p3, { ...devBase, events: ['cold'], preview: { stage: 3 } });
await p3.waitForTimeout(1200);
await p3.locator('#dock [data-action="warm-cover"]').click();
await p3.waitForTimeout(1800);
const f3 = await fire(p3);
const v3 = await p3.evaluate(() => window.__tree.viewInfo());
ok('large: campfire lit, clear of trunk', f3.lit && f3.distM > f3.trunkM + f3.radiusM, `tree ${v3.treeM.toFixed(1)} m, fire r ${f3.radiusM.toFixed(2)} m, dist ${f3.distM.toFixed(2)} m`);
await shot(p3, '06-campfire-larger-tree');
await slow(p3, 0.3);
await tapNow(p3, 'water');
await p3.waitForTimeout(1600);
await shot(p3, '07-water-effect-larger-tree');
await slow(p3, 1);
await p3.waitForTimeout(4500);
await slow(p3, 0.3);
await tapNow(p3, 'fertilize');
await p3.waitForTimeout(1600);
await shot(p3, '08-fertilise-effect-larger-tree');
await c3.close();

// 4. Reduced motion: effects still run (soil tint only) and clean up; no errors.
const { ctx: c4, page: p4 } = await newPage({ reduced: true });
await setup(p4, { ...devBase, events: ['cold'] });
await p4.locator('#dock [data-action="water"]').click();
await p4.waitForTimeout(700);
ok('reduced: water effect runs', (await fire(p4)).fx > 0);
await p4.locator('#dock [data-action="warm-cover"]').click();
await p4.waitForTimeout(4000);
ok('reduced: cleaned up + campfire lit', (await fire(p4)).fx === 0 && (await fire(p4)).lit);
await c4.close();

// 5. Desktop 1280×800, cold day with campfire + fertilise.
const { ctx: c5, page: p5 } = await newPage({ viewport: { width: 1280, height: 800 } });
await setup(p5, { ...devBase, events: ['cold'], time: 'day' });
await p5.locator('#dock [data-action="warm-cover"]').click();
await p5.waitForTimeout(1500);
await slow(p5, 0.3);
await tapNow(p5, 'water');
await p5.waitForTimeout(1600);
await shot(p5, '09-desktop-1280-campfire-water');
await noOldName(p5, 'desktop');
await c5.close();

await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed; console errors: ${errors.length}`);
if (errors.length) console.log(errors.join('\n'));
process.exit(failed.length || errors.length ? 1 : 0);
