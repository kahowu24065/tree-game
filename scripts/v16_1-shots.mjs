// v16.1 layout check: place picker inside the weather card (two real buttons, keyboard), 樹木狀態 card level with the
// weather card, settings in the 成長日誌 title row (no drag), toasts at the bottom (top while the panel is open),
// single note card with pager (瀕死 > 倒塌 > morning note), left buttons below the cards. Overlap checks at 360×780,
// 390×844, 430×932 and 1280×800; no console errors. Screenshots → /workspace/tree-game-shots/v16.1/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v16.1';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };
const VIEWS = [['360', 360, 780, true], ['390', 390, 844, true], ['430', 430, 932, true], ['desktop', 1280, 800, false]];
const PAIRS = [
  ['weather', 'status'], ['notes', 'status'], ['weather', 'dev'], ['notes', 'dev'], ['notes', 'paw'], ['dev', 'paw'], ['weather', 'paw'],
  ['toast', 'rail'], ['toast', 'sheetBar'], ['toast', 'dockBtns'], ['toast', 'weather'], ['toast', 'status'], ['toast', 'msg'],
  ['msg', 'rail'], ['msg', 'sheetBar'], ['msg', 'weather'], ['msg', 'status'],
  ['gear', 'grab'], ['gear', 'title'], ['gear', 'dockBtns'], ['status', 'rail'], ['notes', 'rail'], ['paw', 'sheetBar'], ['rail', 'sheetBar'],
];
const hit = (a, b) => a && b && a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;

async function boxes(page) {
  return page.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e || e.closest('[hidden]')) return null; const b = e.getBoundingClientRect(); return b.width && b.height ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; };
    const bs = [...document.querySelectorAll('#dock > *')].map((e) => e.getBoundingClientRect()).filter((q) => q.width);
    const y = bs.length ? Math.min(...bs.map((q) => q.y)) : 0;
    return {
      weather: r('#weather-card'), status: r('#status-card'), notes: r('#note-slot:not(:empty)'), toast: r('.animal-toast.show'), msg: r('#toast.show'),
      dev: r('.dev-fab'), paw: r('.animal-list-btn'), gear: r('#gear'), place: r('.wx-place'), rail: r('#rail'), grab: r('.grab'), title: r('#sheet-title'),
      sheetBar: r('#sheet-handle'), dockBtns: bs.length ? { x: 0, y, w: innerWidth, h: Math.max(...bs.map((q) => q.bottom)) - y } : null,
    };
  });
}
async function overlapCheck(page, label) {
  const b = await boxes(page);
  const bad = PAIRS.filter(([a, c]) => hit(b[a], b[c])).map((p) => p.join('×'));
  ok(`${label}: nothing overlaps`, bad.length === 0, bad.join(', ') || `weather.top ${b.weather?.y} = status.top ${b.status?.y}`);
  return b;
}
/** Developer panel → 解鎖全部動物 (real arrivals → arrival toast, plus the general 「解鎖咗…」 toast). */
async function unlockAll(page) {
  await page.evaluate(() => {
    const root = document.getElementById('dev-root');
    root.querySelector('[data-dev="toggle"]')?.click();
    root.querySelector('[data-dev="unlock-all"]')?.click();
    root.querySelector('.dev-panel [data-dev="toggle"]')?.click();
  });
}
async function closeModals(page) {
  for (let i = 0; i < 4; i++) {
    if (await page.locator('#modal').isHidden()) break;
    await page.locator('#modal [data-action="close-modal"], #modal [data-action="wind-explained"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
}
async function setup(page) {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    sessionStorage.setItem('seeded', '1');
  }, devBase);
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
  await page.evaluate(() => { window.__tree.setStat('health', 92); window.__tree.setStat('moisture', 70); window.__tree.setStat('nutrients', 80); });
  await page.waitForTimeout(1200);
}

for (const [tag, w, h, phone] of VIEWS.filter((v) => !process.env.ONLY || v[0] === process.env.ONLY)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: phone });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(`${tag}: ${m.text()}`); });
  await setup(page);

  // 1. Normal day.
  let b = await overlapCheck(page, `${tag} normal day`);
  ok(`${tag}: 樹木狀態 card top level with the weather card; no floating pill`, Math.abs(b.weather.y - b.status.y) < 1 && (await page.locator('#place-pill, .top-right').count()) === 0);
  await page.screenshot({ path: `${OUT}/${tag}-normal.png` });

  // 2. 瀕死 + 倒塌 + toasts.
  await page.evaluate(() => { window.__tree.fxSpeed(6); window.__tree.collapse(false); });
  for (let i = 0; i < 300; i++) { const f = await page.evaluate(() => window.__tree.fx()); if (!f.fall) break; await page.waitForTimeout(100); }
  await page.waitForTimeout(800);
  await closeModals(page);
  await page.evaluate(() => window.__tree.fxSpeed(1));
  await page.evaluate(() => window.__tree.dying());
  await page.waitForTimeout(1200);
  await closeModals(page);
  const stack = await page.evaluate(() => ({ cards: document.querySelectorAll('#note-slot .note-card').length, key: document.querySelector('#note-slot .note-card')?.dataset.note, pager: document.querySelector('.nc-pager')?.textContent?.trim(), bodyHidden: document.querySelector('.nc-body')?.hidden, title: document.querySelector('.nc-title b')?.textContent }));
  ok(`${tag}: one card at a time, 瀕死 first, body collapsed`, stack.cards === 1 && stack.key === 'dying' && /^1\/[23]$/.test(stack.pager ?? '') && stack.bodyHidden === true, JSON.stringify(stack));
  if (tag === '360') ok('360: short 瀕死 title (no 「・剩」)', await page.evaluate(() => getComputedStyle(document.querySelector('.nc-long')).display === 'none'));
  // Real arrivals (dev: unlock all animals) → arrival toast at the bottom + the general toast one row up.
  await unlockAll(page);
  let t = null;
  for (let i = 0; i < 200 && !t; i++) { await page.waitForTimeout(60); t = await page.evaluate(() => { const e = document.querySelector('.animal-toast.show'); if (!e) return null; const q = e.getBoundingClientRect(); return { y: q.y }; }); }
  ok(`${tag}: arrival toast shows at the bottom, above the 成長日誌 panel`, Boolean(t) && t.y > h * 0.55, t ? `toast y ${Math.round(t.y)} / ${h}` : 'no toast');
  // Fire the general toast again while the arrival toast shows: it steps up a row.
  await unlockAll(page);
  await page.waitForTimeout(250);
  const both = await boxes(page);
  await page.screenshot({ path: `${OUT}/${tag}-dying-collapse-toast.png` });
  ok(`${tag}: general toast one row above the arrival toast`, !both.toast || !both.msg || both.msg.y + both.msg.h <= both.toast.y + 1, both.toast && both.msg ? `msg bottom ${Math.round(both.msg.y + both.msg.h)} ≤ toast top ${Math.round(both.toast.y)}` : 'only one showing');
  {
    const bad = PAIRS.filter(([x, y]) => hit(both[x], both[y])).map((q) => q.join('×'));
    ok(`${tag} 瀕死+倒塌+toasts: nothing overlaps`, bad.length === 0, bad.join(', ') || `toast ${both.toast ? 'y ' + Math.round(both.toast.y) : '-'}, msg ${both.msg ? 'y ' + Math.round(both.msg.y) : '-'}`);
  }
  b = await boxes(page);
  const offset = b.notes && b.dev ? b.dev.y >= b.notes.y + b.notes.h : true;
  ok(`${tag}: left buttons below the card column`, offset && (!b.paw || !b.notes || b.paw.y >= b.notes.y + b.notes.h));

  // Pager + expand.
  await page.locator('.nc-title').click();
  await page.waitForTimeout(200);
  const expanded = await page.evaluate(() => ({ open: document.querySelector('.nc-title')?.getAttribute('aria-expanded'), hidden: document.querySelector('.nc-body')?.hidden }));
  b = await overlapCheck(page, `${tag} card expanded`);
  await page.locator('.nc-pager').click();
  await page.waitForTimeout(200);
  const paged = await page.evaluate(() => ({ key: document.querySelector('#note-slot .note-card')?.dataset.note, hidden: document.querySelector('.nc-body')?.hidden }));
  ok(`${tag}: tap title expands; 「›」 goes to 倒塌 (collapsed)`, expanded.open === 'true' && expanded.hidden === false && paged.key === 'collapse' && paged.hidden === true, JSON.stringify({ expanded, paged }));
  if (tag === '390') await page.screenshot({ path: `${OUT}/390-card2-collapse.png` });

  // 3. 成長日誌 panel open; settings tap does not drag.
  const before = await page.evaluate(() => document.getElementById('sheet').dataset.state);
  await page.locator('#gear').click();
  await page.waitForTimeout(500);
  const gearTap = { state: await page.evaluate(() => document.getElementById('sheet').dataset.state), modal: await page.locator('#modal').isVisible() };
  ok(`${tag}: settings in the 成長日誌 title row opens settings, panel not dragged`, gearTap.modal && gearTap.state === before, JSON.stringify({ before, ...gearTap }));
  await closeModals(page);
  await page.locator('#sheet-handle').click();
  await page.waitForTimeout(700);
  const open = await page.evaluate(() => {
    const g = document.getElementById('gear').getBoundingClientRect();
    const t = document.getElementById('sheet-title').getBoundingClientRect();
    return { state: document.getElementById('sheet').dataset.state, top: Boolean(document.elementFromPoint(g.x + g.width / 2, g.y + g.height / 2)?.closest('#gear')), sameRow: Math.abs(g.y + g.height / 2 - (t.y + t.height / 2)) < 12, size: Math.round(g.width) };
  });
  ok(`${tag}: panel open — settings stays at the title row's right end, tappable (32px)`, open.state === 'open' && open.top && open.sameRow && open.size === 32, JSON.stringify(open));
  // A toast while the panel is open shows at the top.
  await unlockAll(page);
  await page.waitForTimeout(400);
  const msg = (await boxes(page)).msg;
  ok(`${tag}: toast moves to the top while the panel is open`, Boolean(msg) && msg.y < h * 0.25, msg ? `y ${Math.round(msg.y)}` : 'none');
  await page.screenshot({ path: `${OUT}/${tag}-panel-open.png` });
  await page.locator('#sheet-handle').click();
  await page.waitForTimeout(600);

  // 4. Keyboard (390 only): two separate buttons in the weather card.
  if (tag === '390') {
    const kinds = await page.evaluate(() => ({ card: document.getElementById('weather-card').tagName, hit: document.querySelector('.wx-hit')?.tagName, place: document.querySelector('.wx-place')?.tagName, nested: document.querySelectorAll('button button, button [role=button]').length, label: document.querySelector('.wx-place')?.getAttribute('aria-label') }));
    ok('weather card = container with two real buttons (no nested buttons)', kinds.card === 'DIV' && kinds.hit === 'BUTTON' && kinds.place === 'BUTTON' && kinds.nested === 0, JSON.stringify(kinds));
    await page.focus('.wx-place');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const loc = await page.evaluate(() => document.querySelector('#modal:not([hidden])')?.textContent ?? '');
    ok('keyboard: Enter on the place chip opens the place picker', /地點|位置|香港/.test(loc));
    await closeModals(page);
    await page.focus('.wx-hit');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    ok('keyboard: Enter on the weather card opens the weather panel', await page.evaluate(() => !document.getElementById('drawer').hidden));
    await page.locator('#drawer [data-action="close-drawer"]').click();
    await page.waitForTimeout(900);
    // Tap on the card (not the chip) opens the weather panel; tap on the chip opens the picker.
    await page.locator('.wx-hit').click({ position: { x: 170, y: 30 } });
    await page.waitForTimeout(900);
    ok('tap on the weather card opens the weather panel', await page.evaluate(() => !document.getElementById('drawer').hidden));
    await page.evaluate(() => document.querySelector('[data-action="close-drawer"]')?.click());
    await page.waitForTimeout(400);
  }
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
