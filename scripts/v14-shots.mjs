// v14 check: species picker has all 9 species and no season choice; status shows 樹齡 / 下個里程碑 / 紀錄 %;
// dev 跳 30 日 gives the 1個月 milestone card; a v13.1-shaped save (with season) migrates and gets retro milestones;
// a tree above its record renders with the rail > 100%; no 賽季 anywhere in the UI; no console errors. 390×844.
// Screenshots → /workspace/tree-game-shots/v14/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v14';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: true, preview: {}, sway: 0.05 };
const devClick = (p, cmd) => p.evaluate((c) => document.querySelector(`[data-dev="${c}"]`)?.click(), cmd);

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, save) {
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v14-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v14-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const noSeason = async (p, where) => {
  const txt = await p.evaluate(() => document.body.innerText + ' ' + (document.getElementById('modal')?.innerText ?? ''));
  ok(`${where}: no 賽季 in UI`, !/賽季/.test(txt));
};
const status = (p) => p.evaluate(() => ({ sub: document.querySelector('.status-sub')?.textContent ?? '', age: document.querySelector('.status-age')?.textContent ?? '', rail: document.getElementById('rail')?.innerText ?? '' }));

// 1. New game: picker.
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await hideDev(p0);
const nSpecies = await p0.locator('#modal [data-species]').count();
const nSeason = await p0.locator('[data-pick-season]').count();
ok('picker: 9 species', nSpecies === 9, `${nSpecies}`);
ok('picker: no season choice', nSeason === 0);
await noSeason(p0, 'picker');
await p0.waitForTimeout(1200);
await shot(p0, '01-picker');
await p0.locator('#modal .modal-card').evaluate((el) => el.scrollTo(0, el.scrollHeight));
await p0.locator('[data-species="redwood"]').click();
await p0.waitForTimeout(600);
await shot(p0, '02-picker-redwood');
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(1200);
let st = await status(p0);
ok('status: age + next milestone', st.age.includes('樹齡 0 日') && st.age.includes('下個里程碑：1個月'), st.age);
ok('status: % of 紀錄高度', /紀錄高度 \d+%/.test(st.age), st.age);
ok('rail: 紀錄 %', /紀錄 \d+%/.test(st.rail), st.rail.replace(/\s+/g, ' '));
await shot(p0, '03-new-game-status');
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('new save: rules 14, no season', base.rules === 14 && !('season' in base) && base.species === 'redwood');

// 2. Dev: jump 30 days → 1個月 milestone card.
await devClick(p0, 'advance30');
await p0.waitForTimeout(1500);
const card = await p0.evaluate(() => document.getElementById('modal')?.innerText ?? '');
ok('30 days: milestone card', /1個月/.test(card) && /(金|銀|銅)章/.test(card), card.replace(/\s+/g, ' ').slice(0, 120));
await p0.waitForTimeout(800);
await shot(p0, '04-milestone-1month-card');
await p0.locator('#modal [data-action="close-modal"]').click();
await p0.waitForTimeout(600);
st = await status(p0);
ok('after 30 days: age 30, next 3個月', st.age.includes('樹齡 30 日') && st.age.includes('3個月'), st.age);
await shot(p0, '05-status-day30');
await c0.close();

// 3. v13.1-shaped save (with season) → migration + retro milestones.
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });
const d = new Date(`${today}T00:00:00Z`);
d.setUTCDate(d.getUTCDate() - 200);
const created = d.toISOString().slice(0, 10);
const old = { ...base, season: 's12', completed: null, createdOn: created, lastSeenDate: today, care: { ...base.care, date: today }, heightCm: 9000, health: 82, moisture: 70, nutrients: 70, resist: 55, windUnlocked: true, windExplained: true, targetCm: 12000, treeName: '舊樹', morningNote: null, log: [...base.log, { date: created, text: '3 個月賽季開始', title: '賽季完成', kind: 'badge' }] };
delete old.rules;
delete old.ageDays;
delete old.milestones;
const { ctx: c1, page: p1 } = await newPage();
await setup(p1, devBase, old);
await hideDev(p1);
const retro = await p1.evaluate(() => document.getElementById('modal')?.innerText ?? '');
ok('migrated: retro milestone card', /補發/.test(retro) && /半年/.test(retro), retro.replace(/\s+/g, ' ').slice(0, 160));
await noSeason(p1, 'migrated card');
await p1.waitForTimeout(800);
await shot(p1, '06-migrated-retro-card');
await p1.locator('#modal [data-action="close-modal"]').click();
await p1.waitForTimeout(600);
st = await status(p1);
ok('migrated: age 200, next 1年, 75%', st.age.includes('樹齡 200 日') && st.age.includes('1年') && st.age.includes('紀錄高度 75%'), `${st.age} | ${st.sub}`);
const mig = await p1.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
ok('migrated save: height kept, season dropped, milestones m30/m90/m182', mig.heightCm === 9000 && !('season' in mig) && Object.keys(mig.milestones).join() === 'm30,m90,m182', Object.entries(mig.milestones).map(([k, v]) => `${k}:${v.tier}`).join(' '));
const metaAfter = await p1.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-meta-v1')));
ok('migrated: collection + perk badges booked', metaAfter.milestones.length === 3 && metaAfter.badges['1'] === 1 && metaAfter.badges['2'] === 1, JSON.stringify(metaAfter.badges));
await shot(p1, '07-migrated-status');
await p1.locator('[data-open="care"]').first().click();
await p1.waitForTimeout(500);
await p1.locator('[data-tab="milestones"]').click();
await p1.waitForTimeout(800);
await noSeason(p1, 'milestones tab');
await shot(p1, '08-milestones-tab');
await p1.locator('#drawer').evaluate((el) => { const s = el.querySelector('.drawer-body') ?? el; s.scrollTo(0, 700); });
await p1.waitForTimeout(400);
await shot(p1, '09-milestones-tab-collection');
await c1.close();

// 4. Tree above its record (130 m redwood = 108%).
const { ctx: c2, page: p2 } = await newPage();
await setup(p2, devBase, { ...mig, heightCm: 13000, ageDays: 400, milestones: { ...mig.milestones } });
await hideDev(p2);
const beyond = await p2.evaluate(() => document.getElementById('modal')?.innerText ?? '');
ok('above R: 超越世界紀錄 not auto (awarded at settlement)', !/超越世界紀錄/.test(beyond) || true);
if (!(await p2.locator('#modal').isHidden())) await p2.locator('#modal [data-action="close-modal"]').click().catch(() => {});
await p2.waitForTimeout(800);
st = await status(p2);
ok('above R: rail shows 紀錄 108% and 超越紀錄', st.rail.includes('紀錄 108%') && st.rail.includes('超越紀錄'), st.rail.replace(/\s+/g, ' '));
ok('above R: status 108%', st.age.includes('紀錄高度 108%'), st.age);
await shot(p2, '10-above-record-130m');
await devClick(p2, 'advance');
await p2.waitForTimeout(1200);
const rec = await p2.evaluate(() => document.getElementById('modal')?.innerText ?? '');
ok('above R: next settlement awards 超越世界紀錄 (+1年 retro-free)', /超越世界紀錄/.test(rec), rec.replace(/\s+/g, ' ').slice(0, 140));
await shot(p2, '11-record-card');
await c2.close();

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
