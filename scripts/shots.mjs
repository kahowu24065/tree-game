import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:4327';
const SHOTS = '/workspace/tree-game-shots';
fs.mkdirSync(SHOTS, { recursive: true });

async function openDebug(page) {
  await page.evaluate(() => {
    const d = document.querySelector('details.debug');
    if (d) d.open = true;
  });
  await page.waitForTimeout(100);
}
async function closeDebug(page) {
  await page.evaluate(() => {
    const d = document.querySelector('details.debug');
    if (d) d.open = false;
  });
  await page.waitForTimeout(100);
}
async function dbg(page, cmd) {
  await openDebug(page);
  await page.locator(`[data-debug="${cmd}"]`).click();
  await page.waitForTimeout(300);
  await closeDebug(page);
}
async function dismissName(page, name = '窗前小樹') {
  const modal = page.locator('#modal:not([hidden])');
  if (await modal.isVisible().catch(() => false)) {
    await page.locator('#tree-name').fill(name);
    await page.locator('[data-action="start"]').click();
    await page.waitForTimeout(400);
  }
}
async function closeModal(page) {
  if (await page.locator('#modal:not([hidden])').isVisible().catch(() => false)) {
    await page.locator('#modal [data-action="close-modal"]').click().catch(async () => {
      await page.locator('#modal button').first().click();
    });
    await page.waitForTimeout(300);
  }
}
async function reinforceAll(page) {
  await page.getByRole('tab', { name: '預報' }).click();
  await page.waitForTimeout(250);
  for (const key of ['stakes', 'ropes', 'prune']) {
    const b = page.locator(`[data-prep="${key}"]`);
    const pressed = await b.getAttribute('aria-pressed');
    if (pressed !== 'true') {
      await b.click();
      await page.waitForTimeout(150);
    }
  }
  const text = await page.locator('#panel').innerText();
  console.log('prep panel:', text.match(/而家 \d\/3/)?.[0], text.includes('已準備'));
}
async function shot(page, name) {
  await closeDebug(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#scene-wrap').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  const p = path.join(SHOTS, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('SHOT', p);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'zh-HK',
  timezoneId: 'Asia/Hong_Kong',
  geolocation: { latitude: 22.3193, longitude: 114.1694 },
  permissions: ['geolocation'],
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

// Fresh start
await page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await dismissName(page);
await closeDebug(page);

// 01 normal day
await dbg(page, 'time-day');
await dbg(page, 'scene-clear');
await page.waitForTimeout(400);
await shot(page, '01-normal-day.png');

// Care once
await page.getByRole('tab', { name: '照顧' }).click();
for (const a of ['water', 'fertilize', 'deworm', 'prune']) {
  const b = page.locator(`[data-action="${a}"]`);
  if (!(await b.isDisabled())) await b.click();
  await page.waitForTimeout(120);
}

// Storm warning forecast
await dbg(page, 'storm-tomorrow-typhoon');
await page.getByRole('tab', { name: '預報' }).click();
await page.waitForTimeout(300);
await reinforceAll(page);
// scroll panel so warning card visible - take full phone shot with scene+panel
await closeDebug(page);
await page.screenshot({ path: path.join(SHOTS, '03-forecast-storm-warning.png'), fullPage: false });
console.log('SHOT 03');

// Rain/storm scene - show canvas
await dbg(page, 'scene-typhoon');
await page.getByRole('tab', { name: '照顧' }).click();
await page.waitForTimeout(400);
await shot(page, '02-rain-or-storm.png');

// Survive storm with reward
await dbg(page, 'clear-storms');
await dbg(page, 'storm-today-typhoon');
await reinforceAll(page);
// verify 3/3
const prepText = await page.locator('#panel').innerText();
console.log('before advance:', prepText.match(/而家 \d\/3/)?.[0]);
await dbg(page, 'advance');
await page.waitForTimeout(600);
const reward = await page.locator('#modal:not([hidden])').innerText().catch(() => '');
console.log('REWARD MODAL:', reward.slice(0, 200));
await page.screenshot({ path: path.join(SHOTS, '04-storm-survived-reward.png'), fullPage: false });
console.log('SHOT 04');
await closeModal(page);

// Grow + animals on tree
for (let i = 0; i < 4; i++) await dbg(page, 'jump');
await dbg(page, 'time-day');
await dbg(page, 'scene-clear');
await page.getByRole('tab', { name: '照顧' }).click();
// dismiss morning note if any
const noteBtn = page.locator('[data-action="dismiss-note"]');
if (await noteBtn.count()) await noteBtn.click();
await page.waitForTimeout(500);
await shot(page, '05-later-tree-animals.png');
const animals = await page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('yiri-yisyu-v1')).animals; } catch { return []; }
});
console.log('animals', animals);

// Album
await page.getByRole('tab', { name: '圖鑑' }).click();
await page.waitForTimeout(400);
await closeDebug(page);
await page.screenshot({ path: path.join(SHOTS, '06-animal-album.png'), fullPage: false });
console.log('SHOT 06');

// Damage path shot already have 08; refresh a clean damage modal
await page.evaluate(() => localStorage.clear());
await page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle' });
await dismissName(page, '無加固樹');
await dbg(page, 'storm-today-typhoon');
await dbg(page, 'advance');
await page.waitForTimeout(500);
const dmg = await page.locator('#modal:not([hidden])').innerText().catch(() => '');
console.log('DMG MODAL:', dmg.slice(0, 200));
await page.screenshot({ path: path.join(SHOTS, '08-storm-damage.png'), fullPage: false });

await browser.close();
console.log('done');
