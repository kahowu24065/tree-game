// Browser check of the real-weather card: live APIs, mocked storm signals, simulated fallback.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v3';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const problems = [];

async function run(name, opts, setup) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', ...opts });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !/429|Failed to load resource|ERR_FAILED/.test(m.text())) problems.push(`[${name}] ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${name}] pageerror ${e.message}`));
  page.on('response', (r) => {
    if (/open-meteo|weather\.gov\.hk|bigdatacloud/.test(r.url())) reqs.push(`${r.status()} ${new URL(r.url()).host}${new URL(r.url()).search.slice(0, 40)}`);
  });
  if (setup) await setup(ctx, page);
  await page.goto(BASE);
  await page.locator('#tree-name').fill('窗前小樹');
  await page.locator('[data-season="s3"]').click();
  await page.waitForFunction(() => !/攞緊/.test(document.querySelector('#weather-card')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const card = await page.locator('#weather-card').innerText();
  console.log(`\n== ${name}\n${card.replace(/\n+/g, ' | ')}\n   requests: ${reqs.join(', ')}`);
  return { ctx, page, card };
}

// 1. Live: geolocation granted in Sha Tin.
{
  const { ctx, page } = await run('live-shatin', { geolocation: { latitude: 22.3817, longitude: 114.1877 }, permissions: ['geolocation'] });
  await page.locator('#weather-card').screenshot({ path: `${OUT}/weather-card.png` });
  await page.screenshot({ path: `${OUT}/phone-live.png` });
  const snap = await page.evaluate(() => JSON.parse(localStorage.getItem('yiri-yisyu-weather')));
  console.log('   cached:', snap.provider, snap.place, snap.station, snap.district, 'age(s)=', Math.round((Date.now() - snap.fetchedAt) / 1000), 'warnings=', snap.hko?.warnings.map((w) => w.short).join('/'));
  await page.locator('#weather-card').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/forecast-hko.png` });
  // Reload within 30 min: should reuse cache without calling Open-Meteo again.
  let omCalls = 0;
  page.on('request', (r) => { if (r.url().includes('open-meteo')) omCalls++; });
  await page.reload();
  await page.waitForTimeout(2500);
  console.log('   open-meteo calls after reload (want 0):', omCalls);
  await ctx.close();
}

// 2. Geolocation denied → real Hong Kong weather.
{
  const { ctx } = await run('denied-geo', { permissions: [] });
  await ctx.close();
}

// 3. Open-Meteo 429 + HKO says No. 8 signal and red rain → HKO-only weather, in-game storm.
{
  const warn = {
    WTCSGNL: { name: '熱帶氣旋警告信號', code: 'TC8NE', actionCode: 'ISSUE', issueTime: '2026-09-25T10:40:00+08:00', updateTime: '2026-09-25T10:40:00+08:00' },
    WRAIN: { name: '暴雨警告信號', code: 'WRAINR', type: '紅色', actionCode: 'ISSUE', issueTime: '2026-09-25T11:00:00+08:00', updateTime: '2026-09-25T11:00:00+08:00' },
  };
  const { ctx, page } = await run('mock-signal8', { geolocation: { latitude: 22.3817, longitude: 114.1877 }, permissions: ['geolocation'] }, async (ctx) => {
    await ctx.route(/api\.open-meteo\.com/, (r) => r.fulfill({ status: 429, body: 'Too many' }));
    await ctx.route(/dataType=warnsum/, (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(warn) }));
  });
  const storms = await page.evaluate(() => JSON.parse(localStorage.getItem('yiri-yisyu-v1')).storms);
  console.log('   storms:', JSON.stringify(storms.map((s) => [s.date, s.kind, s.official?.short, s.provisional ?? false])));
  await page.waitForTimeout(3000);
  await page.locator('#weather-card').screenshot({ path: `${OUT}/weather-card-signal8-mock.png` });
  await page.screenshot({ path: `${OUT}/phone-signal8-mock.png` });
  await ctx.close();
}

// 4. Everything blocked → clearly labelled simulated weather, tap retries.
{
  const { ctx, page } = await run('all-down', { permissions: [] }, async (ctx) => {
    await ctx.route(/open-meteo|weather\.gov\.hk|bigdatacloud/, (r) => r.abort());
  });
  await page.locator('#weather-card').screenshot({ path: `${OUT}/weather-card-simulated.png` });
  await ctx.unroute(/open-meteo|weather\.gov\.hk|bigdatacloud/);
  await page.locator('#weather-card').click();
  await page.waitForFunction(() => /即時天氣/.test(document.querySelector('#weather-card')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => {});
  console.log('   after tap-to-retry:', (await page.locator('#weather-card').innerText()).replace(/\n+/g, ' | '));
  await ctx.close();
}

await browser.close();
console.log(problems.length ? `\nPROBLEMS\n${problems.join('\n')}` : '\nCONSOLE CLEAN (ignoring expected network failures)');
