// Browser check: forecast rows take icon + label from HKO (Kwun Tong), today's row matches the card.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v3';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong',
  geolocation: { latitude: 22.3133, longitude: 114.2258 }, permissions: ['geolocation'],
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource/.test(m.text())) errors.push(m.text()); });
await page.goto(BASE);
await page.locator('#tree-name').fill('窗前小樹');
await page.locator('[data-season="s3"]').click();
await page.waitForFunction(() => /即時天氣/.test(document.querySelector('#weather-card')?.textContent ?? ''), null, { timeout: 30000 });
await page.waitForTimeout(1500);
const card = (await page.locator('#weather-card').innerText()).replace(/\n+/g, ' | ');
console.log('card:', card);
await page.locator('#weather-card').click();
await page.waitForTimeout(700);
const rows = await page.$$eval('article.day', (els) => els.map((e) => e.innerText.replace(/\n+/g, ' | ')));
rows.forEach((r) => console.log('row:', r));
await page.locator('article.day').first().scrollIntoViewIfNeeded();
await page.evaluate(() => {
  const el = document.querySelector('article.day');
  let box = el?.parentElement;
  while (box && box.scrollHeight <= box.clientHeight + 4) box = box.parentElement;
  if (el && box) box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - 110;
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/forecast-fixed.png` });
console.log('errors:', errors);
await browser.close();
