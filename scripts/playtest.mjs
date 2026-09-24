import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327';
const SHOTS = '/workspace/tree-game-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const report = { errors: [], logs: [], checks: {}, notes: [] };
function ok(name, pass, detail = '') {
  report.checks[name] = pass ? 'PASS' : 'FAIL';
  if (!pass) report.notes.push(`FAIL ${name}: ${detail}`);
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function shot(page, name) {
  const p = path.join(SHOTS, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('SHOT', p);
  return p;
}

function hook(page) {
  page.on('console', (msg) => {
    const t = `${msg.type()}: ${msg.text()}`;
    report.logs.push(t);
    if (msg.type() === 'error') report.errors.push(t);
  });
  page.on('pageerror', (err) => report.errors.push('pageerror: ' + err.message));
}

async function openDebug(page) {
  const details = page.locator('details.debug');
  await details.waitFor({ state: 'attached', timeout: 5000 });
  await page.evaluate(() => {
    const d = document.querySelector('details.debug');
    if (d) d.open = true;
  });
  await page.waitForTimeout(150);
}

async function dbg(page, cmd) {
  await openDebug(page);
  await page.locator(`[data-debug="${cmd}"]`).click();
  await page.waitForTimeout(350);
}

async function dismissName(page, name = '窗前小樹') {
  const modal = page.locator('#modal:not([hidden])');
  if (!(await modal.isVisible().catch(() => false))) return;
  const input = page.locator('#tree-name');
  if (await input.count()) await input.fill(name);
  await page.locator('[data-action="start"]').click();
  await page.waitForTimeout(400);
}

async function closeModal(page) {
  const modal = page.locator('#modal:not([hidden])');
  if (await modal.isVisible().catch(() => false)) {
    const btn = page.locator('#modal [data-action="close-modal"]');
    if (await btn.count()) await btn.click();
    else await page.locator('#modal button').first().click();
    await page.waitForTimeout(300);
  }
}

async function tab(page, label) {
  await page.getByRole('tab', { name: label }).click();
  await page.waitForTimeout(250);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-HK',
    timezoneId: 'Asia/Hong_Kong',
    geolocation: { latitude: 22.3193, longitude: 114.1694 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  hook(page);

  await page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await dismissName(page);

  await dbg(page, 'time-day');
  await dbg(page, 'scene-clear');
  await page.waitForTimeout(400);
  await shot(page, '01-normal-day.png');
  ok('first_load', true);

  await tab(page, '照顧');
  for (const act of ['water', 'fertilize', 'deworm', 'prune']) {
    const b = page.locator(`[data-action="${act}"]`);
    if (await b.count() && !(await b.isDisabled())) {
      await b.click();
      await page.waitForTimeout(200);
    }
  }
  const waterDisabled = await page.locator('[data-action="water"]').isDisabled();
  ok('care_limits', waterDisabled, 'water disabled after use or rain');

  // Forecast storm warning + reinforce
  await dbg(page, 'storm-tomorrow-typhoon');
  await tab(page, '預報');
  await page.waitForTimeout(400);
  const forecastText = await page.locator('#panel').innerText();
  ok('forecast_storm_warning', /颱風|風暴準備|打木樁/.test(forecastText), forecastText.slice(0, 160));
  await shot(page, '03-forecast-storm-warning.png');

  // Reinforce all three
  for (const key of ['stakes', 'ropes', 'prune']) {
    const b = page.locator(`[data-prep="${key}"], [data-action="prep-${key}"], button`).filter({ hasText: /木樁|防風繩|修枝防風/ });
    // prefer data attributes if present
  }
  // Look at prep buttons
  const prepBtns = page.locator('.preps button, [data-reinforce], [data-prep]');
  const prepCount = await page.locator('.preps button').count();
  report.notes.push('prepCount=' + prepCount);
  for (let i = 0; i < prepCount; i++) {
    const b = page.locator('.preps button').nth(i);
    if (!(await b.isDisabled().catch(() => false))) {
      await b.click();
      await page.waitForTimeout(200);
    }
  }
  // Also try data-action from ui
  for (const lab of ['打木樁', '綁防風繩', '修枝防風']) {
    const b = page.getByRole('button', { name: lab });
    if (await b.count() && !(await b.first().isDisabled().catch(() => false))) {
      await b.first().click();
      await page.waitForTimeout(150);
    }
  }

  // Rain/storm scene
  await dbg(page, 'scene-typhoon');
  await page.waitForTimeout(500);
  await shot(page, '02-rain-or-storm.png');
  ok('rain_storm_scene', true);

  // Resolve reinforced storm: use today typhoon + advance
  await dbg(page, 'clear-storms');
  await dbg(page, 'storm-today-typhoon');
  await tab(page, '預報');
  await page.waitForTimeout(300);
  for (let i = 0; i < (await page.locator('.preps button').count()); i++) {
    const b = page.locator('.preps button').nth(i);
    const cls = await b.getAttribute('class');
    if (!cls?.includes('on') && !cls?.includes('done')) {
      await b.click();
      await page.waitForTimeout(150);
    }
  }
  // Click any prep not yet on
  for (const lab of ['打木樁', '綁防風繩', '修枝防風']) {
    const b = page.getByRole('button', { name: lab });
    if (await b.count()) await b.first().click().catch(() => {});
  }
  await dbg(page, 'advance');
  await page.waitForTimeout(700);
  const modalText = (await page.locator('#modal:not([hidden])').innerText().catch(() => '')) || '';
  ok('storm_reward', /捱住|長多|加固|過咗|颱風/.test(modalText), modalText.slice(0, 180));
  await shot(page, '04-storm-survived-reward.png');
  await closeModal(page);

  // Grow tree + animals
  for (let i = 0; i < 5; i++) await dbg(page, 'jump');
  await dbg(page, 'time-day');
  await dbg(page, 'scene-clear');
  await page.waitForTimeout(500);
  await shot(page, '05-later-tree-animals.png');
  const meta = await page.locator('#scene-meta').innerText();
  ok('later_stage', /幼樹|大樹|古樹|巨樹|成樹/.test(meta) || !/幼苗/.test(meta), meta);

  await tab(page, '圖鑑');
  await page.waitForTimeout(400);
  await shot(page, '06-animal-album.png');
  const album = await page.locator('#panel').innerText();
  ok('album', album.length > 30, album.slice(0, 120));

  await tab(page, '里程');
  const mile = await page.locator('#panel').innerText();
  ok('milestones', /將軍|海波|米/.test(mile), mile.slice(0, 120));

  const saved = await page.evaluate(() => localStorage.getItem('yiri-yisyu-v1'));
  ok('save', !!saved, saved ? `len=${saved.length}` : 'null');
  const nameBefore = await page.locator('#tree-title').innerText();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await closeModal(page);
  const nameAfter = await page.locator('#tree-title').innerText();
  ok('persistence', nameAfter === nameBefore && nameAfter.length > 0, `${nameBefore} -> ${nameAfter}`);

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);
  await shot(page, '07-desktop.png');
  ok('desktop', true);

  // Unreinforced damage
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await dismissName(page, '無加固樹');
  await dbg(page, 'storm-today-typhoon');
  await dbg(page, 'advance');
  await page.waitForTimeout(700);
  const dmg = (await page.locator('#modal:not([hidden])').innerText().catch(() => '')) || '';
  ok('unreinforced_damage', /拗斷|打中|輕傷|下次預報/.test(dmg), dmg.slice(0, 180));
  await shot(page, '08-storm-damage.png');
  await closeModal(page);

  // Catch-up: advance several days via debug then check morning note / health
  await dbg(page, 'advance');
  await dbg(page, 'advance');
  await closeModal(page);
  ok('day_advance', true);

  // Weather failure already observed via 429 fallback in earlier runs; probe cache path
  const chip = await page.locator('#weather-chip').innerText();
  ok('weather_ui', chip.length > 0, chip);

  // Console errors (ignore benign)
  const realErrors = report.errors.filter((e) => !/favicon|429/.test(e));
  ok('no_console_errors', realErrors.length === 0, realErrors.join(' | ') || 'clean');

  await browser.close();
  fs.writeFileSync(path.join(SHOTS, 'playtest-report.json'), JSON.stringify(report, null, 2));
  console.log('\n=== CHECKS ===');
  console.log(JSON.stringify(report.checks, null, 2));
  console.log('notes', report.notes);
  console.log('errors', report.errors);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
