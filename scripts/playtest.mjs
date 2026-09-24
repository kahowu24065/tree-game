// Functional playtest of the 3D HUD build (served on :4327). Writes a JSON report.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327';
const OUT = '/workspace/tree-game-shots/v2/playtest';
fs.mkdirSync(OUT, { recursive: true });
const report = { errors: [], checks: {}, notes: [] };
const ok = (name, pass, detail = '') => {
  report.checks[name] = pass ? 'PASS' : 'FAIL';
  if (!pass) report.notes.push(`FAIL ${name}: ${detail}`);
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
};
const dbg = async (page, cmd) => {
  await page.evaluate((c) => {
    const d = document.querySelector('details.debug');
    d.open = true;
    document.querySelector(`[data-debug="${c}"]`).click();
    d.open = false;
  }, cmd);
  await page.waitForTimeout(300);
};
const modalText = (page) => page.locator('#modal:not([hidden])').innerText().catch(() => '');
const closeModal = async (page) => {
  if (await page.locator('#modal:not([hidden])').isVisible().catch(() => false)) {
    await page.locator('#modal [data-action="close-modal"], #modal .primary').first().click();
    await page.waitForTimeout(250);
  }
};
const drawerTab = async (page, open, tab) => {
  if (await page.locator('#drawer').isHidden()) await page.locator(`[data-open="${open}"]`).first().click();
  await page.waitForTimeout(350);
  if (tab) await page.locator(`#drawer [data-tab="${tab}"]`).click();
  await page.waitForTimeout(250);
};
const closeDrawer = async (page) => {
  if (await page.locator('#drawer').isVisible()) await page.locator('#drawer-close').click();
  await page.waitForTimeout(400);
};

const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', geolocation: { latitude: 22.3193, longitude: 114.1694 }, permissions: ['geolocation'] });
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error' && !/429|favicon/.test(m.text())) report.errors.push(m.text());
});
page.on('pageerror', (e) => report.errors.push('pageerror: ' + e.message));

await page.goto(`${BASE}/?debug=1`);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.locator('#tree-name').fill('測試樹');
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(800);
await dbg(page, 'time-day');
await dbg(page, 'scene-clear');
ok('webgl_scene', await page.evaluate(() => !document.body.classList.contains('flat') && !!document.getElementById('scene').getContext('webgl2')));
ok('log_collapsed_default', (await page.locator('#sheet').getAttribute('data-state')) === 'closed');
ok('hud_weather_card', /°C/.test(await page.locator('#weather-card').innerText()));
ok('hud_status_card', /高度[\s\S]*健康度[\s\S]*樹冠[\s\S]*根系/.test(await page.locator('#status-card').innerText()));
ok('hud_rail', /當前/.test(await page.locator('#rail').innerText()));
ok('dock_labels', (await page.locator('#dock').innerText()).replace(/\s+/g, '').match(/澆水.*施肥.*加固.*圖鑑/) !== null);

await page.locator('.dock [data-action="water"]').click();
await page.waitForTimeout(250);
await page.locator('.dock [data-action="fertilize"]').click();
await page.locator('#status-card [data-action="deworm"]').click();
await page.locator('#status-card [data-action="prune"]').click();
await page.waitForTimeout(300);
const care = await page.evaluate(() => JSON.parse(localStorage.getItem('yiri-yisyu-v1')).care);
ok('care_actions', care.watered && care.fertilized && care.dewormed && care.pruned, JSON.stringify(care));
ok('care_limits', (await page.locator('.dock [data-action="water"]').getAttribute('aria-disabled')) === 'true');

await page.locator('#sheet-handle').click();
await page.waitForTimeout(500);
const logText = await page.locator('#sheet-body').innerText();
ok('log_open_and_entries', (await page.locator('#sheet').getAttribute('data-state')) === 'open' && /已澆水/.test(logText) && /健康|水分|養分|害蟲/.test(logText), logText.slice(0, 120).replace(/\n/g, ' '));
await page.screenshot({ path: path.join(OUT, 'log-open.png') });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
ok('log_close', (await page.locator('#sheet').getAttribute('data-state')) === 'closed');

await dbg(page, 'storm-tomorrow-typhoon');
ok('severe_weather_card', await page.locator('#weather-card.severe').count() === 1, await page.locator('#weather-card').innerText());
await drawerTab(page, 'forecast');
ok('forecast_warning', /風暴準備|颱風/.test(await page.locator('#panel').innerText()));
for (const k of ['stakes', 'ropes', 'prune']) await page.locator(`[data-prep="${k}"]`).click();
await page.waitForTimeout(200);
ok('reinforce_all', (await page.locator('.prep.on').count()) === 3);
await closeDrawer(page);

await dbg(page, 'clear-storms');
await dbg(page, 'storm-today-typhoon');
await drawerTab(page, 'forecast');
for (const k of ['stakes', 'ropes', 'prune']) {
  const b = page.locator(`[data-prep="${k}"]`);
  if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click();
}
await closeDrawer(page);
await dbg(page, 'advance');
await page.waitForTimeout(600);
const reward = await modalText(page);
ok('storm_reward', /捱住|長多|加固|颱風/.test(reward), reward.slice(0, 100).replace(/\n/g, ' '));
await closeModal(page);

for (let i = 0; i < 5; i++) await dbg(page, 'jump');
await dbg(page, 'scene-clear');
await page.waitForTimeout(1500);
ok('later_stage', /巨樹|古樹/.test(await page.locator('#status-card').innerText()));
await drawerTab(page, 'album');
await page.waitForTimeout(800);
ok('album_3d_thumbs', (await page.locator('.thumb img').count()) >= 10, `imgs=${await page.locator('.thumb img').count()}`);
await page.locator('#drawer [data-tab="milestones"]').click();
ok('milestones', /將軍|海波/.test(await page.locator('#panel').innerText()));
await page.locator('#drawer [data-tab="care"]').click();
ok('care_tab_has_all_actions', (await page.locator('#panel .act').count()) === 4);
await closeDrawer(page);

// Location + settings.
await page.locator('#place-pill').click();
await page.locator('[data-place="shatin"]').click();
await page.waitForTimeout(400);
ok('location_pick', /沙田/.test(await page.locator('#place-pill').innerText()));
await page.locator('#gear').click();
await page.locator('[data-quality="high"]').click();
ok('quality_toggle', (await page.evaluate(() => localStorage.getItem('yiri-yisyu-quality'))) === 'high');
await closeModal(page);

// Persistence.
const before = await page.locator('.status-sub').innerText();
await page.reload();
await page.waitForTimeout(1200);
await closeModal(page);
ok('persistence', (await page.locator('.status-sub').innerText()).startsWith('測試樹'), `${before}`);

// Unreinforced storm damage.
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.locator('#tree-name').fill('無加固樹');
await page.locator('[data-action="start"]').click();
await dbg(page, 'storm-today-typhoon');
await dbg(page, 'advance');
await page.waitForTimeout(600);
const dmg = await modalText(page);
ok('unreinforced_damage', /拗斷|打中|輕傷|下次預報/.test(dmg), dmg.slice(0, 100).replace(/\n/g, ' '));
await closeModal(page);

await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'desktop.png') });
ok('no_console_errors', report.errors.length === 0, report.errors.join(' | ') || 'clean');
await browser.close();
fs.writeFileSync(path.join(OUT, 'playtest-report.json'), JSON.stringify(report, null, 2));
const failed = Object.values(report.checks).filter((v) => v === 'FAIL').length;
console.log(`\n${Object.keys(report.checks).length - failed}/${Object.keys(report.checks).length} checks passed`);
process.exit(failed ? 1 : 0);
