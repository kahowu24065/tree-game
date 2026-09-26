// v12 check: 水分 0-150 bar + 爛根區, instant warning toast (dev manual weather), 今晚預計 + breakdown before/after a drain,
// saturated watering message. 390×844, no console errors. Screenshots → /workspace/tree-game-shots/v12/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v12';
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
    if (sessionStorage.getItem('v12-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v12-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
const toastText = (p) => p.evaluate(() => document.getElementById('toast')?.textContent ?? '');
const readW = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).moisture);
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const topShot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: 390, height: 460 } });

// A real save through the picker.
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
await c0.close();
const save = (o) => ({ ...base, health: 80, moisture: 70, nutrients: 80, resist: 50, morningNote: null, ...o });

async function scene(saveOver, dev = devBase) {
  const r = await newPage();
  await setup(r.page, dev, save(saveOver));
  await r.page.waitForTimeout(600);
  await hideDev(r.page);
  return r;
}

// 1. Normal bar.
{
  const { ctx, page } = await scene({ moisture: 70 });
  await topShot(page, '01-bar-normal');
  const val = await page.locator('.wbar .bar-val').textContent();
  const fillW = await page.locator('.wbar .bar-fill').evaluate((e) => e.style.width);
  ok('bar shows real W on 0-150 scale', val === '70' && fillW.startsWith('46.67'), `${val} ${fillW}`);
  ok('saturation line + 3 rot zones', (await page.locator('.wbar .sat-line').count()) === 1 && (await page.locator('.wbar .rot').count()) === 3);
  const chip = await page.locator('.night-chip').textContent();
  ok('今晚預計 chip (70 → 60 +5, N 70 +5 → +10)', /今晚預計\s*\+10/.test(chip), chip.trim());
  await ctx.close();
}
// 2. 爛根 zone.
{
  const { ctx, page } = await scene({ moisture: 125 });
  await topShot(page, '02-bar-rot-zone');
  const cls = await page.locator('.wbar').getAttribute('class');
  ok('bar in 爛根區 shows 125 + rotzone', cls.includes('rotzone') && (await page.locator('.wbar .bar-val').textContent()) === '125');
  await page.locator('[data-open="care"]').first().click();
  await page.waitForTimeout(700);
  await shot(page, '02b-care-tab-rot');
  ok('care tab 今晚預計 card', (await page.locator('.night-card').count()) === 1);
  await ctx.close();
}
// 3. Instant warning via dev manual weather.
{
  const { ctx, page } = await scene({ moisture: 90 }, { ...devBase, open: true });
  await page.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = ''; });
  await page.locator('[data-dev-event="rainstorm"]').click();
  await page.waitForTimeout(250);
  await hideDev(page);
  await page.waitForTimeout(150);
  await shot(page, '03-instant-warning-toast');
  const t = await toastText(page);
  ok('instant rainstorm toast', t.includes('暴雨警告！水分 +20，而家 110，記得疏水'), t);
  ok('W 90 → 110 saved', (await readW(page)) === 110);
  ok('bar flashes', ((await page.locator('.wbar').getAttribute('class')) ?? '').includes('flash-up'));
  // Upgrade to 黑雨 the same day adds nothing.
  await page.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = ''; });
  await page.locator('[data-dev-event="blackrain"]').click();
  await page.waitForTimeout(300);
  ok('blackrain after rainstorm adds nothing', (await readW(page)) === 110);
  await page.locator('[data-dev-event="rainstorm"]').click();
  await page.locator('[data-dev-event="blackrain"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-dev-event="rainstorm"]').click();
  await page.waitForTimeout(300);
  ok('reissued rainstorm not re-applied', (await readW(page)) === 110);
  await page.locator('[data-dev-event="hot"]').click();
  await page.waitForTimeout(300);
  ok('hot same day applies -20', (await readW(page)) === 90, String(await readW(page)));
  // Dev W slider goes to 150.
  ok('dev W slider max 150', (await page.locator('[data-dev-stat="moisture"]').getAttribute('max')) === '150');
  await ctx.close();
}
// 4. 今晚預計 breakdown before / after a drain.
{
  const { ctx, page } = await scene({ moisture: 120 });
  await page.locator('.night-chip').click();
  await page.waitForTimeout(300);
  await topShot(page, '04a-preview-before-drain');
  const before = await page.locator('.night-pop').innerText();
  ok('breakdown lists W tier', before.includes('水分 110｜輕度爛根') && before.includes('養分 70｜充足'), before.replace(/\n/g, ' / '));
  await page.locator('#status-card [data-action="drain"]').click();
  await page.waitForTimeout(300);
  await topShot(page, '04b-preview-after-drain');
  const after = await page.locator('.night-pop').innerText();
  ok('breakdown updates after drain', after.includes('水分 100｜適中'), after.replace(/\n/g, ' / '));
  const chip = await page.locator('.night-chip').textContent();
  ok('chip after drain +10', /\+10/.test(chip), chip.trim());
  await ctx.close();
}
// 4c. Weather damage line with R.
{
  const { ctx, page } = await scene({ moisture: 95, resist: 50 }, { ...devBase, events: ['rainstorm'] });
  await page.waitForTimeout(400);
  await page.locator('.night-chip').click();
  await page.waitForTimeout(300);
  await topShot(page, '04c-preview-storm-damage');
  const txt = await page.locator('.night-pop').innerText();
  // v13: rain is its own category, not reduced by R (see scripts/v13-shots.mjs).
  ok('storm damage line (v13 rain category)', txt.includes('雨｜暴雨') && txt.includes('−10'), txt.replace(/\n/g, ' / '));
  await ctx.close();
}
// 5. Saturated watering.
{
  const { ctx, page } = await scene({ moisture: 100 });
  await page.locator('#dock [data-action="water"]').click();
  await page.waitForTimeout(250);
  await shot(page, '05-saturated-watering');
  const t = await toastText(page);
  ok('saturated message', t === '泥土已經飽和，唔使再澆', t);
  const used = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).care.water);
  ok('saturated watering not consumed', used === 0);
  await ctx.close();
}
// 6. Settings help text.
{
  const { ctx, page } = await scene({ moisture: 70 });
  await page.locator('#gear').click();
  await page.waitForTimeout(300);
  await shot(page, '06-help');
  ok('help mentions 0–150', (await page.locator('#modal').innerText()).includes('水分 0–150'));
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
