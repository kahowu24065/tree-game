// v9 check: overview markers for tiny animals, tap-marker follow, arrival toast, 島上動物 list, flocks with trails /
// sparkles — plus the v8 guarantees (one animal factor, flight ceiling tree + 5 m, fence, no walking on water).
// Screenshots → /workspace/tree-game-shots/v9/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4327/';
const OUT = '/workspace/tree-game-shots/v9';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
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
    if (sessionStorage.getItem('v9-seeded')) return;
    localStorage.clear();
    localStorage.setItem('sekai-tree-dev', JSON.stringify(d));
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    if (s) localStorage.setItem('sekai-tree-v2', JSON.stringify(s));
    sessionStorage.setItem('v9-seeded', '1');
  }, [dev, save]);
  await page.goto(BASE);
  await page.waitForTimeout(1800);
}
const T = (p, fn, ...a) => p.evaluate(([f, args]) => window.__tree[f](...args), [fn, a]);
const hideDev = (p) => p.evaluate(() => { const r = document.getElementById('dev-root'); if (r) r.style.visibility = 'hidden'; });
async function compose(items, cols, file, title, w = 300) {
  const ctx = await browser.newContext();
  const cells = items.map(([f, label]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"/><figcaption>${label}</figcaption></figure>`).join('');
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: cols * w, height: 400 });
  await p2.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">${title}</h2><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px">${cells}</div><style>figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center}img{width:100%;display:block}figcaption{padding:4px 6px;font-size:14px;font-weight:600}</style></body></html>`);
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: file, fullPage: true });
  await ctx.close();
}

// A real save through the picker.
const { ctx: c0, page: p0 } = await newPage();
await setup(p0, devBase);
await p0.locator('[data-pick-season="s3"]').click();
await p0.locator('[data-species="camphor"]').click();
await p0.locator('[data-action="start-game"]').click();
await p0.waitForTimeout(800);
const base = await p0.evaluate(() => JSON.parse(localStorage.getItem('sekai-tree-v2')));
await c0.close();
const SEASON = { camphor: 's3', deodar: 's6', redwood: 's12' };
const TARGET = { camphor: 5000, deodar: 6000, redwood: 12000 };
const ALL = ['whiteeye', 'sparrow', 'munia', 'swallow', 'tailorbird', 'bulbul', 'butterfly', 'plaintiger', 'bluebottle', 'honeybee', 'dragonfly', 'ladybug', 'macaque', 'muntjac', 'boar', 'kite', 'squirrel', 'egret', 'cattle', 'buffalo', 'seaeagle', 'parakeet', 'starling'];
// Everything unlocked; a few not yet looked at in the 圖鑑 (→ 「新」).
const FRESH = ['munia', 'plaintiger', 'swallow'];
const save = (o) => ({ ...base, health: 95, moisture: 70, nutrients: 70, animals: ALL, seenAnimals: ALL.filter((a) => !FRESH.includes(a)), residents: [], season: SEASON[o.species ?? 'camphor'], targetCm: TARGET[o.species ?? 'camphor'], ...o });
async function scene(saveOver) {
  const r = await newPage();
  await setup(r.page, devBase, save(saveOver));
  await r.page.waitForTimeout(1200);
  return r;
}
/** Markers must not sit on HUD buttons / cards / the log. */
const overlapHud = (p) => p.evaluate(() => {
  const ids = ['weather-card', 'status-card', 'rail', 'sheet', 'dock', 'place-pill', 'gear', 'view-reset', 'animal-list-btn', 'animal-list', 'animal-toast'];
  const rects = ids.map((id) => document.getElementById(id)).filter((e) => e && !e.hidden && e.offsetParent !== null).map((e) => e.getBoundingClientRect());
  let bad = 0;
  for (const m of document.querySelectorAll('.amk')) {
    if (Number(m.style.opacity) < 0.35) continue;
    const r = m.getBoundingClientRect();
    if (rects.some((q) => r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top)) bad++;
  }
  return bad;
});
async function v8Guarantees(p, label, treeM) {
  const sz = await T(p, 'animalSizes');
  const ratios = sz.sizes.map((s) => s.ratio);
  const spread = ratios.length ? Math.max(...ratios) / Math.min(...ratios) : 1;
  let over = 0, maxAbove = -Infinity, wet = 0, samples = 0;
  for (let k = 0; k < 5; k++) {
    for (const f of await T(p, 'flyers')) { if (f.perched) continue; maxAbove = Math.max(maxAbove, f.y - treeM); if (f.y > f.ceiling + 1e-3) over++; }
    for (const w of await T(p, 'walkers')) { samples++; if (w.wet || w.r > w.limit + 0.01) wet++; }
    await p.waitForTimeout(500);
  }
  const fc = await T(p, 'fenceCheck');
  ok(`v8 guarantees hold: ${label}`, spread < 1.08 && over === 0 && wet <= samples * 0.03 && fc.offLand === 0,
    `one factor ×${sz.factor.toFixed(2)} (spread ${spread.toFixed(3)}), flyers over ceiling ${over} (highest ${maxAbove.toFixed(1)} m over tree), walkers wet/outside ${wet}/${samples}, fence off-land ${fc.offLand}`);
}

// 1. Overview markers + tap a marker to follow.
if (want('markers')) {
  const items = [];
  for (const [label, species, cm, ids] of [
    ['紅杉 120 米', 'redwood', 12000, ['whiteeye', 'plaintiger', 'honeybee', 'macaque', 'kite', 'munia']],
    ['雪松 60 米', 'deodar', 6000, ['sparrow', 'butterfly', 'dragonfly', 'muntjac', 'swallow']],
    ['樟樹 20 米', 'camphor', 2000, ['whiteeye', 'butterfly', 'squirrel', 'egret']],
  ]) {
    const { ctx, page: p } = await scene({ species, heightCm: cm });
    for (const id of ids) await T(p, 'spawn', id);
    await p.waitForTimeout(6000);
    await hideDev(p);
    const hud = await T(p, 'hud');
    const raw = await T(p, 'markers');
    const tiny = raw.filter((m) => m.px < 10).length;
    const bad = await overlapHud(p);
    ok(`overview markers: ${label}`, hud.markers.length > 0 && bad === 0 && hud.markers.length <= 10,
      `${raw.length} groups on screen, ${tiny} smaller than 10 px; ${hud.markers.length} markers shown (${hud.markers.filter((m) => m.cluster).length} clusters); on HUD: ${bad}; sizes ${raw.map((m) => `${m.id} ${m.px.toFixed(1)}px`).join(', ')}`);
    const f = `${OUT}/markers-${items.length}.png`;
    await p.screenshot({ path: f });
    items.push([f, `${label}・全景標記`]);
    if (items.length === 1) {
      await v8Guarantees(p, label, cm / 100);
      // Headless Chromium renders at a few fps, so a fast flock's pin can be 50 px further on by the time a synthetic
      // touch lands. Tap the steadiest pin (least movement over 0.4 s) with a real touch event.
      const h1 = await T(p, 'hud');
      await p.waitForTimeout(400);
      const h2 = await T(p, 'hud');
      const moved = h2.markers.map((m) => { const o = h1.markers.find((q) => q.uid === m.uid); return { m, d: o ? Math.hypot(o.x - m.x, o.y - m.y) : 99 }; }).sort((a, b) => a.d - b.d);
      const target = moved[0].m;
      const box = await p.locator(`.amk[data-uid="${target.uid}"]`).boundingBox();
      await p.touchscreen.tap(box.x + 15, box.y + 13);
      await p.waitForTimeout(3500);
      const fu = await T(p, 'followingUid');
      const vs = await T(p, 'viewState');
      const raw2 = await T(p, 'markers');
      const me = raw2.find((m) => m.uid === target.uid);
      const hud2 = await T(p, 'hud');
      ok('tap a marker → camera follows that group; its marker fades once it is big on screen', fu === target.uid && Boolean(vs.following) && (!me || me.px > 22) && !hud2.markers.some((m) => m.uid === target.uid),
        `tapped ${target.id} (uid ${target.uid}); following uid ${fu} 「${vs.following}」; now ${me ? me.px.toFixed(0) : '?'} px on screen; markers left ${hud2.markers.length}`);
      await hideDev(p);
      await p.screenshot({ path: `${OUT}/02-marker-tap-follow.png` });
      // Zooming in (no follow): markers fade as animals grow on screen.
      await T(p, 'resetView');
      await p.waitForTimeout(2500);
      const before = (await T(p, 'hud')).markers.length;
      for (let i = 0; i < 12; i++) { await p.mouse.move(195, 420); await p.mouse.wheel(0, -350); await p.waitForTimeout(60); }
      await p.waitForTimeout(2500);
      const afterRaw = await T(p, 'markers');
      const afterHud = await T(p, 'hud');
      const bigHidden = afterRaw.filter((m) => m.px > 22).every((m) => !afterHud.markers.some((k) => k.uid === m.uid));
      ok('markers fade out when zoomed in', bigHidden, `markers ${before} → ${afterHud.markers.length}; groups bigger than 22 px on screen: ${afterRaw.filter((m) => m.px > 22).map((m) => m.id).join(', ') || '–'} (none of them has a marker)`);
    }
    await ctx.close();
  }
  await compose(items, 3, `${OUT}/01-overview-markers.png`, '全景標記：太細睇唔到嘅動物（撳一下跟拍）', 360);
}

// 2. Arrival toast (tap → follow) and the 島上動物 list.
if (want('toast')) {
  const { ctx, page: p } = await scene({ species: 'deodar', heightCm: 6000 });
  await p.waitForTimeout(6500); // let the load-time toast pass
  await T(p, 'spawn', 'munia');
  let text = null;
  for (let i = 0; i < 60 && !/白腰文鳥/.test(text ?? ''); i++) { await p.waitForTimeout(300); text = (await T(p, 'hud')).toast; }
  const crews = await T(p, 'crews');
  const munia = crews.find((c) => c.id === 'munia');
  ok('arrival toast', /白腰文鳥飛咗嚟/.test(text ?? '') && /新/.test(text ?? ''), `「${text}」 (${munia?.count} 隻)`);
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/03-arrival-toast.png` });
  // Tap whatever toast is up right now (the next one if this one has just gone) and check we follow its group.
  let hudNow = await T(p, 'hud');
  // Headless renders at a few fps, so the 4.2 s toast may be gone by now: bring in another group for a fresh one.
  if (!hudNow.toast) {
    await T(p, 'spawn', 'sparrow');
    for (let i = 0; i < 80 && !hudNow.toast; i++) { await p.waitForTimeout(250); hudNow = await T(p, 'hud'); }
  }
  await p.locator('#animal-toast').click({ timeout: 15000, force: true });
  const uids = (await T(p, 'hud')).toastUids.length ? (await T(p, 'hud')).toastUids : hudNow.toastUids;
  await p.waitForTimeout(3000);
  const fuT = await T(p, 'followingUid');
  ok('tap the toast → follow them', fuT !== null && (uids.includes(fuT) || fuT === munia?.uid), `toast groups ${uids.join(',')}, following uid ${fuT} 「${(await T(p, 'viewState')).following}」`);
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/04-toast-follow.png` });
  // Spam guard: 4 groups at once → one merged toast.
  await T(p, 'resetView');
  await p.waitForTimeout(5000);
  for (const id of ['sparrow', 'butterfly', 'honeybee', 'boar']) await T(p, 'spawn', id);
  let merged = null;
  for (let i = 0; i < 40 && !/麻雀/.test(merged ?? ''); i++) { await p.waitForTimeout(300); merged = (await T(p, 'hud')).toast; }
  await p.waitForTimeout(1500);
  const again = (await T(p, 'hud')).toast;
  ok('several arrivals merge into one toast', /等 \d+ 群動物嚟咗|同/.test(merged ?? '') && again === merged, `「${merged}」`);
  // List panel.
  await p.waitForTimeout(4000);
  await p.locator('#animal-list-btn').click();
  await p.waitForTimeout(1000);
  const h = await T(p, 'hud');
  const cl = await T(p, 'crews');
  ok('島上動物 list shows every group with counts and 「新」', h.listOpen && h.list.length === cl.length && h.list.some((t) => /新/.test(t)), h.list.join(' | '));
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/05-animal-list.png` });
  const entry = cl.find((c) => c.id === 'sparrow') ?? cl[0];
  await p.locator(`#animal-list [data-uid="${entry.uid}"]`).click();
  await p.waitForTimeout(3000);
  ok('tap a list entry → follow', (await T(p, 'followingUid')) === entry.uid && !(await T(p, 'hud')).listOpen, `following ${(await T(p, 'viewState')).following}`);
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/06-list-follow.png` });
  await v8Guarantees(p, '雪松 60 米 (toast/list scene)', 60);
  await ctx.close();
}

// 3. Flocks with trails, insects with sparkles; natural (non-forced) spawns respect the caps.
if (want('flock')) {
  const { ctx, page: p } = await scene({ species: 'camphor', heightCm: 3000 });
  for (const id of ['whiteeye', 'swallow', 'plaintiger', 'honeybee']) await T(p, 'spawn', id);
  await p.waitForTimeout(5000);
  let maxT = 0, maxS = 0;
  for (let i = 0; i < 6; i++) { const hs = await T(p, 'hints'); maxT = Math.max(maxT, hs.trails); maxS = Math.max(maxS, hs.sparkles); await p.waitForTimeout(250); }
  const crews = await T(p, 'crews');
  ok('flock trails + insect sparkles drawn', maxT >= 4 && maxS >= 2, `trails ${maxT}, sparkles ${maxS}; groups ${crews.map((c) => `${c.name}×${c.count}`).join('、')}`);
  await hideDev(p);
  await p.screenshot({ path: `${OUT}/07-flock-overview.png` });
  // Closer: follow the butterfly swarm (sparkles; the follow-cam frames the whole swarm).
  const we = crews.find((c) => c.id === 'plaintiger') || crews.find((c) => c.id === 'whiteeye');
  if (we) {
    await T(p, 'followCrew', we.uid);
    await p.waitForTimeout(3500);
    await hideDev(p);
    await p.screenshot({ path: `${OUT}/08-flock-trails-close.png` });
  }
  await T(p, 'resetView');
  const sw = crews.find((c) => c.id === 'swallow');
  if (sw) {
    await T(p, 'followCrew', sw.uid);
    await p.waitForTimeout(3000);
    await p.waitForTimeout(500);
    await hideDev(p);
    await p.screenshot({ path: `${OUT}/09-follow-flock.png` });
  }
  await v8Guarantees(p, '樟樹 30 米 (flocks)', 30);
  await ctx.close();

  // Natural visitors at the giant stage: variety cap unchanged, more individuals, flocks common.
  const { ctx: c2, page: p2 } = await scene({ species: 'redwood', heightCm: 12000 });
  let maxGroups = 0, maxMembers = 0, flocks = 0, seen = new Set();
  for (let i = 0; i < 8; i++) {
    await p2.waitForTimeout(4000);
    const cs = (await T(p2, 'crews')).filter((c) => !c.resident);
    maxGroups = Math.max(maxGroups, cs.length);
    maxMembers = Math.max(maxMembers, cs.reduce((n, c) => n + c.count, 0));
    for (const c of cs) if (!seen.has(c.uid)) { seen.add(c.uid); if (['whiteeye', 'sparrow', 'munia', 'swallow', 'tailorbird', 'bulbul', 'butterfly', 'plaintiger', 'bluebottle', 'honeybee', 'dragonfly', 'starling', 'parakeet'].includes(c.id) && c.count >= 2) flocks++; }
  }
  ok('giant stage: ≤ 7 visiting groups, ≤ 60 animals', maxGroups <= 7 && maxMembers <= 60, `max ${maxGroups} groups / ${maxMembers} animals over 32 s; ${seen.size} groups arrived, ${flocks} of them small-bird / insect flocks`);
  await v8Guarantees(p2, '紅杉 120 米 (natural visitors)', 120);
  await c2.close();
}

ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = checks.filter((c) => !c[1]);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
