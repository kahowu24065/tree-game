// v15 check: new dock layout (澆水/疏水 | 施肥/除蟲 | 加固 | 保暖覆蓋, 圖鑑 in the status card) on a normal day,
// a cold day (保暖覆蓋 enabled → done), and a non-HK location (mocked London geolocation + mocked Open-Meteo with
// 14 past days) showing 寒冷 by the relative rule and the regional names (大雨、烈風、大雨疏水). Also a desktop width.
// No console errors. 390×844. Screenshots → /workspace/tree-game-shots/v15/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v15';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: opts.tz ?? 'Asia/Hong_Kong', hasTouch: !opts.viewport, ...(opts.geo ? { geolocation: opts.geo, permissions: ['geolocation'] } : {}) });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev) {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('v15-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    sessionStorage.setItem('v15-seeded', '1');
  }, dev);
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await page.locator('[data-species="redwood"]').click();
  await page.locator('[data-action="start-game"]').click();
  await page.waitForTimeout(1200);
  for (let i = 0; i < 3; i++) {
    if (await page.locator('#modal').isHidden()) break;
    await page.locator('#modal [data-action="close-modal"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => document.querySelector('[data-action="dismiss-note"]')?.click());
  await page.waitForTimeout(500);
}
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const box = (p, sel) => p.locator(sel).first().boundingBox();

async function layoutChecks(p, where, width = 390, height = 844) {
  const w = await box(p, '#dock [data-action="water"]');
  const dr = await box(p, '#dock [data-action="drain"]');
  const f = await box(p, '#dock [data-action="fertilize"]');
  const bug = await box(p, '#dock [data-action="deworm"]');
  const g = await box(p, '#dock [data-open="forecast"]');
  const warm = await box(p, '#dock [data-action="warm-cover"]');
  const album = await box(p, '#status-card [data-open="album"]');
  ok(`${where}: 疏水 directly below 澆水`, w && dr && Math.abs(w.x - dr.x) < 2 && dr.y > w.y + w.height - 1, `${JSON.stringify(w)} ${JSON.stringify(dr)}`);
  ok(`${where}: 除蟲 directly below 施肥`, f && bug && Math.abs(f.x - bug.x) < 2 && bug.y > f.y + f.height - 1);
  ok(`${where}: column stacks = 加固 footprint`, Math.abs(dr.y + dr.height - (g.y + g.height)) < 1.5 && Math.abs(w.y - g.y) < 1.5, `stack ${w.y.toFixed(1)}–${(dr.y + dr.height).toFixed(1)} vs 加固 ${g.y.toFixed(1)}–${(g.y + g.height).toFixed(1)}`);
  ok(`${where}: 保暖覆蓋 in the old 圖鑑 slot (4th column)`, warm && warm.x > g.x + g.width && Math.abs(warm.y - g.y) < 1.5);
  ok(`${where}: 圖鑑 in the status card`, Boolean(album) && (await p.locator('#dock [data-open="album"]').count()) === 0 && (await p.locator('#status-card [data-action="drain"], #status-card [data-action="deworm"]').count()) === 0);
  const over = await p.evaluate(([W, H]) => {
    const bad = [];
    for (const el of document.querySelectorAll('#dock button, #status-card button')) {
      const r = el.getBoundingClientRect();
      if (r.left < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) bad.push(el.textContent.trim());
      if (el.scrollWidth > el.clientWidth + 1) bad.push(`clip:${el.textContent.trim()}`);
    }
    return bad;
  }, [width, height]);
  ok(`${where}: no overflow / clipped labels`, over.length === 0, over.join(' | '));
}

// 1. Normal day (HK).
const { ctx: c1, page: p1 } = await newPage();
await setup(p1, devBase);
await layoutChecks(p1, 'normal');
const warmDisabled = await p1.locator('#dock [data-action="warm-cover"]').isDisabled();
ok('normal: 保暖覆蓋 disabled when no 寒冷', warmDisabled);
await shot(p1, '01-normal-day-layout');
await p1.locator('#dock [data-action="water"]').click();
await p1.locator('#dock [data-action="drain"]').click();
await p1.locator('#dock [data-action="deworm"]').click();
await p1.waitForTimeout(400);
const care = await p1.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).care);
ok('normal: dock 澆水／疏水／除蟲 work', care.water === 1 && care.drain === 1 && care.dewormed === true, JSON.stringify(care));
await p1.locator('#status-card [data-open="album"]').click();
await p1.waitForTimeout(500);
ok('normal: status 圖鑑 opens the album tab', await p1.locator('[data-tab="album"].on').count() === 1);
await c1.close();

// 2. Cold day (manual weather 寒冷).
const { ctx: c2, page: p2 } = await newPage();
await setup(p2, { ...devBase, events: ['cold'] });
await layoutChecks(p2, 'cold');
const warmOn = !(await p2.locator('#dock [data-action="warm-cover"]').isDisabled());
ok('cold: 保暖覆蓋 enabled', warmOn);
const wx = await p2.evaluate(() => document.getElementById('weather-card')?.innerText ?? '');
ok('cold: weather card says 寒冷', /寒冷/.test(wx), wx.replace(/\s+/g, ' ').slice(0, 80));
await p2.locator('[data-action="preview"]').click();
await p2.waitForTimeout(400);
const pop = await p2.evaluate(() => document.querySelector('.night-pop')?.innerText ?? '');
ok('cold: 今晚預計 shows 寒｜寒冷 −10', /寒｜寒冷/.test(pop) && /−10/.test(pop), pop.replace(/\s+/g, ' ').slice(0, 120));
await shot(p2, '02-cold-day-cover-enabled');
await p2.locator('[data-action="preview"]').click();
await p2.locator('#dock [data-action="warm-cover"]').click();
await p2.waitForTimeout(500);
const cs = await p2.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')).care.warmCover);
ok('cold: 保暖覆蓋 done → saved + button disabled', cs === true && (await p2.locator('#dock [data-action="warm-cover"]').isDisabled()));
await p2.locator('[data-action="preview"]').click();
await p2.waitForTimeout(400);
const pop2 = await p2.evaluate(() => document.querySelector('.night-pop')?.innerText ?? '');
ok('cold: after cover → 已應對 + 應急獎勵 +3', /寒冷：已應對/.test(pop2) && /應急獎勵/.test(pop2) && /\+3/.test(pop2));
await shot(p2, '03-cold-day-covered');
await c2.close();

// 3. London (mocked geolocation + Open-Meteo with 14 past days): 寒冷 by the relative rule + 大雨, regional names.
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
const dates = Array.from({ length: 21 }, (_, i) => { const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + i - 14); return d.toISOString().slice(0, 10); });
const om = {
  timezone: 'Europe/London',
  current: { time: `${today}T10:00`, temperature_2m: 6, relative_humidity_2m: 80, precipitation: 0.4, weather_code: 61, wind_speed_10m: 18, wind_gusts_10m: 30, is_day: 1 },
  hourly: { time: [], precipitation: [], weather_code: [], wind_gusts_10m: [] },
  daily: {
    time: dates,
    weather_code: dates.map((_, i) => (i === 14 ? 63 : 3)),
    temperature_2m_max: dates.map((_, i) => (i < 14 ? 19 : i === 14 ? 9 : 15)),
    temperature_2m_min: dates.map((_, i) => (i < 14 ? 12 : i === 14 ? 4 : 10)),
    precipitation_sum: dates.map((_, i) => (i === 14 ? 30 : i === 15 ? 80 : 0)),
    precipitation_probability_max: dates.map(() => 50),
    wind_speed_10m_max: dates.map((_, i) => (i === 16 ? 55 : 15)),
    wind_gusts_10m_max: dates.map((_, i) => (i === 16 ? 95 : 30)),
    sunrise: dates.map((d) => `${d}T07:00`),
    sunset: dates.map((d) => `${d}T19:00`),
  },
};
const { ctx: c3, page: p3 } = await newPage({ geo: { latitude: 51.5072, longitude: -0.1276 } });
let omUrl = '';
await p3.route('https://api.open-meteo.com/**', (route) => { omUrl = route.request().url(); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(om) }); });
await p3.route('https://api.bigdatacloud.net/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ countryCode: 'GB', city: 'London' }) }));
let hkoCalls = 0;
await p3.route('https://data.weather.gov.hk/**', (route) => { hkoCalls++; route.abort(); });
await setup(p3, { ...devBase, mode: 'real' });
await p3.waitForTimeout(1500);
ok('London: request has past_days=14', /past_days=14/.test(omUrl));
ok('London: no HKO call', hkoCalls === 0, String(hkoCalls));
await layoutChecks(p3, 'London');
const lwx = await p3.evaluate(() => document.getElementById('weather-card')?.innerText ?? '');
ok('London: place London, 寒冷 + 大雨 today', /London/.test(lwx) && /(寒冷|大雨)/.test(lwx), lwx.replace(/\s+/g, ' ').slice(0, 120));
const statusTxt = await p3.evaluate(() => document.getElementById('status-card')?.innerText ?? '');
ok('London: status shows 大雨疏水 (not 暴雨疏水)', /大雨疏水/.test(statusTxt) && !/暴雨/.test(statusTxt), statusTxt.replace(/\s+/g, ' ').slice(0, 160));
ok('London: 保暖覆蓋 enabled (relative cold 4 ≤ 12 − 8)', !(await p3.locator('#dock [data-action="warm-cover"]').isDisabled()));
await p3.locator('[data-action="preview"]').click();
await p3.waitForTimeout(400);
const lpop = await p3.evaluate(() => document.querySelector('.night-pop')?.innerText ?? '');
ok('London: 今晚預計 uses 大雨／寒冷', /雨｜大雨/.test(lpop) && /寒｜寒冷/.test(lpop) && !/暴雨|黑雨/.test(lpop), lpop.replace(/\s+/g, ' ').slice(0, 160));
await shot(p3, '04-london-regional-status');
await p3.locator('[data-action="preview"]').click();
await p3.locator('#weather-card').click();
await p3.waitForTimeout(700);
const ftab = await p3.evaluate(() => document.getElementById('panel')?.innerText ?? '');
ok('London forecast tab: 豪雨 / 烈風 / 大雨疏水, no HK names', /豪雨/.test(ftab) && /烈風/.test(ftab) && /暴風/.test(ftab) && /大雨疏水/.test(ftab) && !/初級颱風|高級颱風|黑雨|暴雨疏水/.test(ftab), (ftab.match(/.{0,30}(初級颱風|高級颱風|黑雨|暴雨疏水).{0,30}/g) ?? []).join(' / '));
await shot(p3, '05-london-forecast-tab');
await p3.locator('#panel').evaluate((el) => el.scrollTo(0, el.scrollHeight));
await p3.waitForTimeout(300);
await shot(p3, '06-london-forecast-table');
await c3.close();

// 4. Desktop width.
const { ctx: c4, page: p4 } = await newPage({ viewport: { width: 1280, height: 800 } });
await setup(p4, { ...devBase, events: ['cold', 'rainstorm'] });
await layoutChecks(p4, 'desktop', 1280, 800);
await shot(p4, '07-desktop-cold-rain');
await c4.close();

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
