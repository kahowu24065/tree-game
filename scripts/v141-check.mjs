// v1.4.1 check: 天氣概況 page (own page, no tabs), 樹木狀態 pop box (照顧／圖鑑／里程碑), no 圖鑑 button on the main
// screen, overlap checks (360/390/430/desktop), no console errors, then a contact sheet → v141-ui.png.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4415/';
const OUT = '/workspace/tree-game-shots/v141';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['landslip', 'rainstorm'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };
const VIEWS = [['360', 360, 780, true], ['390', 390, 844, true], ['430', 430, 932, true], ['desktop', 1280, 800, false]];
const PAIRS = [['weather', 'status'], ['notes', 'status'], ['weather', 'dev'], ['notes', 'dev'], ['notes', 'paw'], ['dev', 'paw'], ['weather', 'paw'],
  ['gear', 'grab'], ['gear', 'title'], ['gear', 'dockBtns'], ['status', 'rail'], ['notes', 'rail'], ['paw', 'sheetBar'], ['rail', 'sheetBar'], ['status', 'dockBtns'], ['weather', 'dockBtns']];
const hit = (a, b) => a && b && a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
async function boxes(page) {
  return page.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e || e.closest('[hidden]')) return null; const b = e.getBoundingClientRect(); return b.width && b.height ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; };
    const bs = [...document.querySelectorAll('#dock > *')].map((e) => e.getBoundingClientRect()).filter((q) => q.width);
    const y = bs.length ? Math.min(...bs.map((q) => q.y)) : 0;
    return { weather: r('#weather-card'), status: r('#status-card'), notes: r('#note-slot:not(:empty)'), dev: r('.dev-fab'), paw: r('.animal-list-btn'), gear: r('#gear'), rail: r('#rail'), grab: r('.grab'), title: r('#sheet-title'), sheetBar: r('#sheet-handle'),
      dockBtns: bs.length ? { x: 0, y, w: innerWidth, h: Math.max(...bs.map((q) => q.bottom)) - y } : null };
  });
}
async function overlapCheck(page, label) {
  const b = await boxes(page);
  const bad = PAIRS.filter(([a, c]) => hit(b[a], b[c])).map((p) => p.join('×'));
  ok(`${label}: nothing overlaps`, bad.length === 0, bad.join(', '));
}
async function closeModals(page) {
  for (let i = 0; i < 4; i++) {
    if (await page.locator('#modal').isHidden()) break;
    await page.locator('#modal [data-action="close-modal"], #modal [data-action="wind-explained"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
}
const shots = [];
for (const [tag, w, h, phone] of VIEWS.filter((v) => !process.env.ONLY || process.env.ONLY.split(',').includes(v[0]))) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: phone });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(`${tag}: ${m.text()}`); });
  await page.addInitScript((d) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem('sekai-tree-dev', JSON.stringify(d)); localStorage.setItem('sekai-tree-zoom-hint', '1'); sessionStorage.setItem('seeded', '1'); }, devBase);
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await page.locator('[data-species="camphor"]').click();
  await page.locator('[data-action="start-game"]').click();
  await page.waitForTimeout(1000);
  await closeModals(page);
  await page.evaluate(() => window.__tree.grow(3));
  await page.waitForTimeout(600);
  await closeModals(page);
  await page.evaluate(() => document.querySelector('[data-action="dismiss-note"]')?.click());
  await page.waitForTimeout(800);

  await overlapCheck(page, `${tag} main screen`);
  const main = await page.evaluate(() => ({ album: document.querySelectorAll('#app [data-open="album"], .mini-album, .album-row').length, text: /圖鑑/.test(document.getElementById('status-card').textContent) }));
  ok(`${tag}: no 圖鑑 button on the main screen`, main.album === 0 && !main.text, JSON.stringify(main));

  // Status card body → pop box with 照顧／圖鑑／里程碑.
  await page.locator('#status-card .status-sub').first().click();
  await page.waitForTimeout(500);
  const pop = await page.evaluate(() => ({ open: !document.getElementById('drawer').hidden, tabs: [...document.querySelectorAll('#panel .tabs [role=tab]')].map((b) => b.textContent.trim()) }));
  ok(`${tag}: tap on 樹木狀態 opens the pop box with 照顧／圖鑑／里程碑`, pop.open && pop.tabs.join(',') === '照顧,圖鑑,里程碑', JSON.stringify(pop));
  if (tag === '390') { await page.screenshot({ path: `${OUT}/status-care.png` }); shots.push(['樹木狀態・照顧', `${OUT}/status-care.png`]); }
  await page.locator('#panel [data-tab="album"]').click();
  await page.waitForTimeout(300);
  ok(`${tag}: 圖鑑 tab shows the album`, await page.locator('#panel .album-seg').count() === 1);
  if (tag === '390') { await page.screenshot({ path: `${OUT}/status-album.png` }); shots.push(['樹木狀態・圖鑑', `${OUT}/status-album.png`]); }
  await page.locator('#drawer [data-action="close-drawer"]').first().click();
  await page.waitForTimeout(500);

  // Dock 加固 → pop box on 照顧 at the 加固 card.
  await page.locator('#dock .d-guard').click();
  await page.waitForTimeout(500);
  ok(`${tag}: dock 加固 opens 照顧 with the 加固 card`, await page.evaluate(() => !document.getElementById('drawer').hidden && Boolean(document.getElementById('guard-card')) && document.querySelector('#panel .tabs .on')?.textContent === '照顧'));
  await page.locator('#drawer [data-action="close-drawer"]').first().click();
  await page.waitForTimeout(500);

  // Weather card → its own 天氣概況 page.
  await page.locator('.wx-hit').click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(600);
  const wx = await page.evaluate(() => { const p = document.getElementById('wx-page'); return { open: !p.hidden, drawer: !document.getElementById('drawer').hidden, tabs: p.querySelectorAll('.tabs').length, title: p.querySelector('h2')?.textContent, prep: p.querySelectorAll('[data-prep]').length, guard: /加固|抗風力/.test(p.textContent) }; });
  ok(`${tag}: weather card opens the standalone 天氣概況 page (no tabs, no 加固)`, wx.open && !wx.drawer && wx.tabs === 0 && wx.title === '天氣概況' && wx.prep === 0 && !wx.guard, JSON.stringify(wx));
  if (tag === '390') { await page.screenshot({ path: `${OUT}/weather.png` }); shots.push(['天氣概況', `${OUT}/weather.png`]); }
  await page.locator('#wx-page [data-action="close-weather"]').click();
  await page.waitForTimeout(500);
  ok(`${tag}: 天氣概況 closes`, await page.evaluate(() => document.getElementById('wx-page').hidden));

  // 玩法 tabs.
  await page.locator('#gear').click();
  await page.waitForTimeout(400);
  await page.locator('#modal [data-action="guide"]').click();
  await page.waitForTimeout(400);
  for (const t of ['play', 'calc', 'weather', 'push']) {
    await page.locator(`#modal [data-guide="${t}"]`).click();
    await page.waitForTimeout(250);
    const g = await page.evaluate(() => { const c = document.querySelector('#modal .modal-card'); const b = document.querySelector('.guide-body'); return { on: document.querySelector('.guide-tabs .on')?.dataset.guide, first: b.querySelector('h3')?.textContent, h3: b.querySelectorAll('h3').length, scroll: c.scrollHeight > c.clientHeight ? getComputedStyle(c).overflowY : 'fits', wide: b.scrollWidth <= b.clientWidth + 1 }; });
    ok(`${tag}: 玩法 → ${t} has headings, scrolls, no sideways overflow`, g.on === t && g.h3 >= 3 && (g.scroll === 'fits' || /auto|scroll/.test(g.scroll)) && g.wide, JSON.stringify(g));
    if (tag === '390' && (t === 'calc' || t === 'weather')) {
      if (t === 'weather') await page.evaluate(() => { document.querySelector('#modal .modal-card').scrollTop = 0; });
      await page.screenshot({ path: `${OUT}/guide-${t}.png` }); shots.push([`玩法・${t === 'calc' ? '計算方式' : '天氣與警告'}`, `${OUT}/guide-${t}.png`]);
    }
  }
  await closeModals(page);
  await ctx.close();
}
ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));

// Contact sheet.
const page = await browser.newPage({ viewport: { width: 390 * shots.length / 2 + 40, height: 900 } });
const imgs = shots.map(([label, p]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(p).toString('base64')}"><figcaption>${label}</figcaption></figure>`).join('');
await page.setContent(`<html><body style="margin:0;background:#dfe8ee;font:600 16px system-ui,'Noto Sans CJK TC',sans-serif"><div style="display:flex;gap:12px;padding:12px">${imgs}</div><style>figure{margin:0;text-align:center}img{width:300px;border-radius:14px;box-shadow:0 4px 14px #0003}</style></body></html>`);
await page.setViewportSize({ width: shots.length * 312 + 12, height: 700 });
await page.screenshot({ path: '/workspace/tree-game-shots/v141-ui.png', fullPage: true });
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
