// Browser check of the 世界之樹 rules build: season picker, HUD, dev panel, typhoon settlement, care actions.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v4';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong',
  geolocation: { latitude: 22.3133, longitude: 114.2258 }, permissions: ['geolocation'],
});
const page = await ctx.newPage();
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource/.test(m.text())) errors.push(m.text()); });
const wait = (ms) => page.waitForTimeout(ms);
const dev = (sel) => page.locator(`#dev-root ${sel}`);
const toggleDev = async () => {
  const open = await page.locator('#dev-root .dev-panel').isVisible();
  await page.locator(open ? '#dev-root .dev-panel header [data-dev="toggle"]' : '#dev-root .dev-fab').click();
  await page.waitForTimeout(300);
};

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await wait(1500);
const modal = await page.locator('#modal').innerText();
ok('season picker shows 3 seasons', /3 個月/.test(modal) && /6 個月/.test(modal) && /1 年/.test(modal));
await page.screenshot({ path: `${OUT}/season-picker.png` });

await page.locator('#tree-name').fill('小綠');
await page.locator('[data-season="s3"]').click();
await page.waitForFunction(() => /即時天氣|模擬天氣|上次天氣/.test(document.querySelector('#weather-card')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => {});
await wait(2500);
const status = await page.locator('#status-card').innerText();
ok('status card shows H W N R', ['健康', '水分', '養分', '抗風'].every((k) => status.includes(k)), status.replace(/\n+/g, ' | '));
ok('day counter x/90', /第 1\/90 日/.test(status));
console.log('weather card:', (await page.locator('#weather-card').innerText()).replace(/\n+/g, ' | '));
await page.screenshot({ path: `${OUT}/main.png` });
await page.locator('#status-card').screenshot({ path: `${OUT}/status-card.png` });

// Care actions.
const W0 = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).moisture);
await page.locator('#dock [data-action="water"]').click();
await wait(300);
const W1 = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).moisture);
ok('澆水 +20 水分', W1 - W0 === 20 || /落緊雨/.test(await page.locator('#toast').innerText()), `${W0} → ${W1}`);
await page.locator('#status-card [data-action="drain"]').click();
await wait(300);
const W2 = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).moisture);
ok('疏水 −25 水分', W1 - W2 === 25 || (W1 < 25 && W2 === 0), `${W1} → ${W2}`);
await page.locator('#dock [data-action="fertilize"]').click();
await wait(300);
await page.locator('#dock [data-open="forecast"]').click();
await wait(500);
await page.locator('#drawer [data-prep="stakes"]').click();
await wait(300);
const R1 = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).resist);
ok('加固 打木樁 +15 抗風力', R1 === 25, `R=${R1}`);
await page.locator('#drawer-close').click();
await wait(500);

// Developer panel.
ok('dev wrench visible', await dev('.dev-fab').isVisible());
await toggleDev();
await wait(300);
await dev('[data-dev="mode-manual"]').click();
await wait(200);
await dev('[data-dev-event="rainstorm"]').click();
await dev('[data-dev-event="typhoon8"]').click();
await wait(200);
await page.evaluate(() => {
  const set = (k, v) => { const el = document.querySelector(`[data-dev-stat="${k}"]`); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  set('health', 80); set('moisture', 60); set('nutrients', 75); set('resist', 40);
});
await page.locator('#dev-root [data-dev-fc-event]').selectOption('typhoon8');
await wait(400);
const panelText = await dev('.dev-panel').innerText();
ok('dev panel manual mode + countdown', /倒數：高級颱風/.test(panelText), panelText.split('\n').find((l) => l.startsWith('倒數')));
await page.screenshot({ path: `${OUT}/dev-panel.png` });
await toggleDev();
await wait(300);
console.log('weather card (manual):', (await page.locator('#weather-card').innerText()).replace(/\n+/g, ' | '));
await toggleDev();
await wait(300);

// Settle a 高級颱風 day (with 暴雨 also active: must not stack).
await dev('[data-dev="advance"]').click();
await wait(900);
const s = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).lastSettlement);
console.log('settlement:', JSON.stringify({ event: s.event, events: s.events, w: [s.wBefore, s.wAfter], n: [s.nBefore, s.nAfter], wF: s.wFactor, nF: s.nFactor, base: s.baseDamage, R: s.rBefore, final: s.finalDamage, h: [s.hBefore, s.hAfter], mult: s.hMult, bonus: s.weatherBonus, dG: s.deltaG }));
ok('typhoon8 chosen, no stacking', s.event === 'typhoon8' && s.events.includes('rainstorm') && s.wAfter === s.wBefore);
ok('damage 60 × (1 − 40/100) = 36', s.finalDamage === 36);
ok('R consumed −80 (−2 decay)', s.rAfter === 0);
await toggleDev();
await wait(300);
await page.screenshot({ path: `${OUT}/settlement-typhoon-modal.png` });
await page.locator('#modal .primary').click().catch(() => {});
await wait(300);
await toggleDev();
await wait(400);
await dev('.card.settle').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/settlement-typhoon.png` });
await toggleDev();
await wait(300);

// Care tab shows the breakdown too.
await page.locator('#status-card .status-head').click();
await wait(600);
await page.locator('#drawer .card.settle').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/care-tab-settlement.png` });
await page.locator('#drawer-close').click();
await wait(500);

// Dying: drive H to 0.
await toggleDev();
await wait(200);
await dev('[data-dev-event="clear"]').click();
await page.evaluate(() => {
  const set = (k, v) => { const el = document.querySelector(`[data-dev-stat="${k}"]`); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  set('health', 5); set('moisture', 10); set('nutrients', 10);
});
await dev('[data-dev="advance"]').click();
await wait(800);
await page.locator('#modal .primary').click().catch(() => {});
await toggleDev();
await wait(400);
const note = await page.locator('#note-slot').innerText();
ok('瀕死 banner with countdown', /瀕死・23 小時/.test(note) || /瀕死・24 小時/.test(note), note.split('\n')[0]);
if (await page.locator('#modal.open, #modal:not(.hidden)').count()) {
  const txt = await page.locator('#modal').innerText().catch(() => '');
  if (txt.trim()) console.log('modal still open:', txt.replace(/\n/g, ' | ').slice(0, 200));
}
for (let i = 0; i < 3; i++) {
  const btn = page.locator('#modal button.primary, #modal [data-action="close-modal"]').first();
  if (await btn.isVisible().catch(() => false)) { await btn.click(); await wait(300); } else break;
}
await page.screenshot({ path: `${OUT}/dying.png` });
// Rescue by fixing W and N (fertilize once, then top N up via the dev slider, then water).
await page.locator('#dock [data-action="water"]').click();
await wait(200);
await page.locator('#dock [data-action="water"]').click();
await wait(200);
await page.locator('#dock [data-action="fertilize"]').click();
await wait(200);
await toggleDev();
await page.evaluate(() => { const el = document.querySelector('[data-dev-stat="nutrients"]'); el.value = '70'; el.dispatchEvent(new Event('input', { bubbles: true })); });
await toggleDev();
await page.locator('#dock [data-action="water"]').click();
await wait(300);
const rescued = await page.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('rescue (W,N into band) or still dying explained', rescued.dying === null && rescued.health === 10, `W=${rescued.moisture} N=${rescued.nutrients} H=${rescued.health}`);

// Back to real weather for a clean state.
await toggleDev();
await dev('[data-dev="mode-real"]').click();
await toggleDev();
await wait(300);
ok('no console errors', errors.length === 0, errors.join(' | '));
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
await browser.close();
