// v13.1 check: every visible species is at least a pair (visitors + residents, nest/hollow/glow), caps hold,
// first rotation 3–5 min after start, timed rotation every 3–5 min, dev 輪換 still works. 390×844, no console
// errors. Screenshots → /workspace/tree-game-shots/v13.1/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = process.env.OUT_DIR || '/workspace/tree-game-shots/v13.1';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const checks = [];
const ok = (name, pass, detail = '') => { checks.push([name, pass]); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
const devBase = { mode: 'manual', events: ['clear'], forecast: null, time: 'day', open: false, preview: {}, sway: 0.05 };

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/429|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
}
async function setup(page, dev, save) {
  await page.addInitScript(([d, s]) => {
    if (sessionStorage.getItem('v131-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v131-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const showDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = ''; });
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });

// A real save through the picker (樟樹).
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
await c0.close();

const crewSummary = (cs) => cs.map((c) => `${c.name}${c.resident ? '(長駐)' : ''}×${c.count}`).join('、');

for (const [stage, time] of [[0, 'day'], [1, 'night'], [2, 'day'], [3, 'night'], [4, 'day']]) {
  const save = { ...base, health: 95, moisture: 70, nutrients: 80, morningNote: null, residents: ['magpierobin', 'owl', 'sparrow'] };
  const { ctx, page } = await newPage();
  await setup(page, { ...devBase, time, open: true, preview: { stage } }, save);
  await showDev(page);
  await page.locator('[data-dev="unlock-all"]').click();
  await page.waitForTimeout(400);
  await hideDev(page);
  const r0 = await page.evaluate(() => window.__tree.rotation());
  ok(`stage ${stage + 1} ${time}: first rotation 3–5 min after start`, r0 && r0.inS > 170 && r0.inS <= 300, `in ${r0?.inS.toFixed(1)} s (t=${r0?.now.toFixed(1)})`);
  // Let the 5–10 s arrival fill run (sim-time only, stays below the first rotation).
  await page.evaluate(() => window.__tree.simStep(0.5, 180));
  await page.waitForTimeout(500);
  let cs = await page.evaluate(() => window.__tree.crews());
  let caps = await page.evaluate(() => window.__tree.caps());
  ok(`stage ${stage + 1} ${time}: filled, every crew ≥ 2`, cs.length > 0 && cs.every((c) => c.count >= 2), crewSummary(cs));
  ok(`stage ${stage + 1} ${time}: caps hold`, caps.visitorGroups <= caps.groups && caps.visitorMembers <= caps.members, `${caps.visitorGroups}/${caps.groups} groups, ${caps.visitorMembers}/${caps.members} members`);
  const r1 = await page.evaluate(() => window.__tree.rotation());
  ok(`stage ${stage + 1} ${time}: no timed rotation during fill`, Math.abs(r1.next - r0.next) < 1e-6);
  if (stage === 2 || stage === 4) await shot(page, `stage${stage + 1}-${time}-filled`);
  if (stage === 2) {
    await page.evaluate(() => window.__tree.follow('magpierobin'));
    await page.waitForTimeout(2500);
    await shot(page, `stage${stage + 1}-magpierobin-pair-at-nest`);
    await page.evaluate(() => window.__tree.follow(null));
  }
  // Long run: ~15 min of animal time, sampled; count timed rotations and their spacing.
  let next = r1.next;
  let rot = 0;
  let minCount = Infinity;
  let gapsOk = true;
  let capsOk = true;
  for (let i = 0; i < 90; i++) {
    const s = await page.evaluate(() => { window.__tree.simStep(0.5, 20); return { r: window.__tree.rotation(), cs: window.__tree.crews(), caps: window.__tree.caps() }; });
    for (const c of s.cs) minCount = Math.min(minCount, c.count);
    if (s.caps.visitorGroups > s.caps.groups || s.caps.visitorMembers > s.caps.members) capsOk = false;
    if (s.r.next !== next) {
      rot++;
      const gap = s.r.next - s.r.now;
      if (gap < 170 || gap > 300) gapsOk = false;
      next = s.r.next;
    }
  }
  ok(`stage ${stage + 1} ${time}: 15 min sim — ${rot} rotations, all 3–5 min apart`, rot >= 2 && rot <= 5 && gapsOk);
  ok(`stage ${stage + 1} ${time}: 15 min sim — smallest crew ${minCount}, caps held`, minCount >= 2 && capsOk);
  // Dev panel 輪換動物 still works and restarts the timer.
  const before = await page.evaluate(() => window.__tree.crews().map((c) => c.uid));
  await showDev(page);
  await page.locator('[data-dev="rotate"]').click();
  await page.waitForTimeout(300);
  await hideDev(page);
  const after = await page.evaluate(() => ({ r: window.__tree.rotation(), cs: window.__tree.crews() }));
  const changed = after.cs.map((c) => c.uid).some((u) => !before.includes(u)) || after.cs.length < before.length;
  ok(`stage ${stage + 1} ${time}: dev 輪換 swaps a group, timer 3–5 min`, changed && after.r.inS >= 179 && after.r.inS <= 300 && after.cs.every((c) => c.count >= 2), crewSummary(after.cs));
  await ctx.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter(([, p]) => !p);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
