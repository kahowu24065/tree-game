// v13 check: 熱／雨 應急行動, category stacking, 4.5 bonus, locked 加固 before 青年樹, 青年樹 explainer, collapse warning,
// double-加固 banner after a collapse. 390×844, no console errors. Screenshots → /workspace/tree-game-shots/v13/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v13';
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
    if (sessionStorage.getItem('v13-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v13-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const showDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = ''; });
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
const readSave = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });

// A real save through the picker (樟樹, target 50 m → 青年樹 at 5 m).
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
await c0.close();
ok('new tree starts R 60, wind locked', base.resist === 60 && base.windUnlocked === false && base.collapses === 0, `R ${base.resist}`);
const YOUNG_CM = 500;
const save = (o) => ({ ...base, health: 80, moisture: 70, nutrients: 80, morningNote: null, ...o });
const youngSave = (o) => save({ heightCm: YOUNG_CM + 60, windUnlocked: true, windExplained: true, ...o });

async function scene(saveOver, dev = devBase) {
  const r = await newPage();
  await setup(r.page, dev, saveOver);
  await r.page.waitForTimeout(600);
  await hideDev(r.page);
  return r;
}

// 1-2. Hot + rainstorm (+ typhoon, pre-青年樹): emergency buttons, then both done → 4.5 bonus, stacked categories.
{
  const { ctx, page } = await scene(save({ moisture: 70 }), { ...devBase, events: ['hot', 'rainstorm', 'typhoon8'] });
  await page.waitForTimeout(3800); // let the instant-warning toast fade
  await shot(page, '01-emergency-buttons-hot-rain');
  const heatBtn = page.locator('#status-card [data-action="heat-water"]');
  const rainBtn = page.locator('#status-card [data-action="rain-drain"]');
  ok('emergency buttons shown on hot + rainstorm day', (await heatBtn.count()) === 1 && (await rainBtn.count()) === 1);
  const box = await page.locator('#status-card').boundingBox();
  const rail = await page.locator('#rail').boundingBox();
  ok('status card fits and the rail sits below it', box && box.x + box.width <= 390 && rail && rail.y >= box.y + box.height, JSON.stringify({ box, rail }));
  const w0 = (await readSave(page)).moisture;
  await heatBtn.click();
  await page.waitForTimeout(200);
  await rainBtn.click();
  await page.waitForTimeout(300);
  const s1 = await readSave(page);
  ok('酷熱澆水 +5 then 暴雨疏水 −10 (floor 50)', s1.care.heatWater && s1.care.rainDrain && s1.moisture === Math.max(50, Math.min(100, w0 + 5) - 10), `${w0} → ${s1.moisture}`);
  ok('buttons disabled with 今日做咗', (await heatBtn.isDisabled()) && (await heatBtn.innerText()).includes('今日做咗'));
  await page.waitForTimeout(3700);
  await page.locator('.night-chip').click();
  await page.waitForTimeout(300);
  await shot(page, '02-preview-bonus-4.5-stacked');
  const pop = await page.locator('.night-pop').innerText();
  ok('preview shows (3 + 3) × 0.75 +4.5', pop.includes('應急獎勵 (3 + 3) × 0.75') && pop.includes('+4.5'), pop.replace(/\n/g, ' / '));
  ok('preview shows heat, rain handled and wind locked', pop.includes('熱｜酷熱：已應對') && pop.includes('雨｜暴雨：已應對') && pop.includes('青年樹前唔受風災影響'));
  await page.locator('.night-chip').click();
  await page.locator('[data-open="care"]').first().click();
  await page.waitForTimeout(700);
  await shot(page, '02b-care-tab-stacked');
  const care = await page.locator('#panel').innerText();
  ok('care tab explains stacking', care.includes('三類各自計埋'));
  // 3. Locked 加固.
  await page.locator('[data-tab="forecast"]').click();
  await page.waitForTimeout(500);
  await shot(page, '03-reinforce-locked');
  const prep = page.locator('[data-prep="stakes"]');
  ok('加固 greyed with （青年樹時解鎖）', (await prep.isDisabled()) && (await prep.innerText()).includes('（青年樹時解鎖）'));
  const fc = await page.locator('#panel').innerText();
  ok('forecast panel no longer says hot/rain reduced by R', !fc.includes('最終天氣損傷 = 基礎傷害') && fc.includes('酷熱澆水免扣') && fc.includes('暴雨疏水免扣'));
  await ctx.close();
}
// 4. 青年樹 explainer via a real settlement (dev: 跳去下一日).
{
  const { ctx, page } = await scene(save({ heightCm: YOUNG_CM - 3, health: 100, moisture: 80, nutrients: 90 }), { ...devBase, open: true });
  await showDev(page);
  await page.locator('[data-dev="advance"]').click();
  await page.waitForTimeout(900);
  await hideDev(page);
  // A storm/morning modal may come first; the explainer follows once it is closed.
  for (let i = 0; i < 2 && !(await page.locator('.explainer').count()); i++) {
    const close = page.locator('#modal [data-action="close-modal"]');
    if (await close.count()) await close.first().click();
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(300);
  await shot(page, '04-young-explainer');
  const txt = (await page.locator('#modal').innerText()).replace(/\n/g, ' / ');
  ok('explainer lists the new rules', ['加固解鎖', '抗風力開始生效', '風災會傷樹', '倒塌', '今晚預計'].every((k) => txt.includes(k)), txt.slice(0, 120));
  const sv = await readSave(page);
  ok('windUnlocked set + log entry', sv.windUnlocked && sv.log.some((l) => l.kind === 'unlock'));
  await page.locator('[data-action="wind-explained"]').click();
  await page.waitForTimeout(300);
  ok('explainer dismissed with 明白 and stays dismissed', (await page.locator('#modal').isHidden()) && (await readSave(page)).windExplained === true);
  await page.reload();
  await page.waitForTimeout(1500);
  ok('explainer not shown again after reload', (await page.locator('.explainer').count()) === 0);
  await ctx.close();
}
// 5. Collapse warning in 今晚預計 (and fatal variant).
{
  const { ctx, page } = await scene(youngSave({ resist: 30, collapses: 1 }), { ...devBase, events: ['typhoon8'] });
  await page.locator('.night-chip').click();
  await page.waitForTimeout(300);
  await shot(page, '05-collapse-warning');
  const pop = await page.locator('.night-pop').innerText();
  ok('collapse warning in preview', pop.includes('⚠️ R 30 低過高級颱風門檻 40，今晚會倒塌（已倒 1/2 次）'), pop.split('\n')[1]);
  ok('wind line uses base × (1 − R/100)', pop.includes('基礎 60 × (1 − 30/100)') && pop.includes('−42'));
  ok('status card shows 倒塌 1/2', (await page.locator('.collapse-count').innerText()).includes('倒塌 1/2'));
  await ctx.close();
}
{
  const { ctx, page } = await scene(youngSave({ resist: 30, collapses: 2 }), { ...devBase, events: ['typhoon8'] });
  await page.locator('.night-chip').click();
  await page.waitForTimeout(300);
  await shot(page, '05b-collapse-warning-fatal');
  ok('fatal collapse warning', (await page.locator('.collapse-warn.fatal').innerText()).includes('今次會死'));
  await ctx.close();
}
// 6. Collapse at settlement → double-加固 banner the next day.
{
  const { ctx, page } = await scene(youngSave({ resist: 10, health: 90 }), { ...devBase, events: ['typhoon8'], open: true });
  const h0 = (await readSave(page)).heightCm;
  await showDev(page);
  await page.locator('[data-dev="advance"]').click();
  await page.waitForTimeout(900);
  await hideDev(page);
  const modal = await page.locator('#modal').innerText();
  ok('morning modal reports the collapse', modal.includes('倒塌'), modal.replace(/\n/g, ' ').slice(0, 100));
  await shot(page, '06a-collapse-modal');
  await page.locator('#modal [data-action="close-modal"]').click();
  await page.waitForTimeout(400);
  const sv = await readSave(page);
  ok('collapse: height −20%, count 1, double day = today', sv.collapses === 1 && sv.doubleRDate === sv.care.date && sv.heightCm < h0, `${h0} → ${sv.heightCm}`);
  await shot(page, '06-double-reinforce-banner');
  ok('double banner visible', (await page.locator('.note-card.double-r').innerText()).includes('棵樹昨晚倒塌咗'));
  await page.locator('.note-card.double-r [data-open="forecast"]').click();
  await page.waitForTimeout(600);
  await shot(page, '06b-double-reinforce-panel');
  const r0 = (await readSave(page)).resist;
  await page.locator('[data-prep="stakes"]').click();
  await page.waitForTimeout(300);
  const r1 = (await readSave(page)).resist;
  ok('打木樁 gives +30 on the double day', r1 - r0 === 30, `${r0} → ${r1}`);
  await ctx.close();
}
// 7. Help text.
{
  const { ctx, page } = await scene(save({}));
  await page.locator('#gear').click();
  await page.waitForTimeout(300);
  await shot(page, '07-help');
  const t = await page.locator('#modal').innerText();
  ok('help mentions 應急 + 青年樹 wind', t.includes('酷熱澆水') && t.includes('青年樹') && t.includes('4.5'));
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
