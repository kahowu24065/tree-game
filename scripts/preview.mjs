import { chromium } from 'playwright';
const OUT = '/workspace/tree-game-shots/v2/tmp';
const w = Number(process.env.W || 390), h = Number(process.env.H || 844);
const jumps = (process.env.JUMPS || '0,2,5').split(',').map(Number);
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong' });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://127.0.0.1:4327/?debug=1');
await page.waitForTimeout(1500);
await page.locator('#tree-name').fill('窗前小樹');
await page.locator('[data-action="start"]').click();
const dbg = async (cmd) => { await page.evaluate((c) => { document.querySelector('details.debug').open = true; document.querySelector(`[data-debug="${c}"]`).click(); document.querySelector('details.debug').open = false; }, cmd); await page.waitForTimeout(200); };
await dbg('time-day');
let done = 0;
for (const j of jumps) {
  while (done < j) { await dbg('jump'); done++; }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/p-${w}-${j}.png` });
  console.log('shot', j, await page.evaluate(() => document.querySelector('#status-card')?.innerText.replace(/\n/g, ' ')));
}
await browser.close();
