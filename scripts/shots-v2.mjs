// Screenshots + camera-rise video for the 3D redesign. Needs the build served on :4327.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE || 'http://127.0.0.1:4327';
const OUT = '/workspace/tree-game-shots/v2';
fs.mkdirSync(OUT, { recursive: true });
const problems = [];

const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

function watch(page, tag) {
  page.on('console', (m) => {
    const t = m.text();
    if (/429|GPU stall|GL Driver/.test(t)) return;
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${tag}] ${m.type()}: ${t.slice(0, 240)}`);
  });
  page.on('pageerror', (e) => problems.push(`[${tag}] pageerror: ${e.message}`));
}

async function setup(ctxOpts, tag) {
  const ctx = await browser.newContext({ locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', ...ctxOpts });
  const page = await ctx.newPage();
  watch(page, tag);
  await page.goto(`${BASE}/?debug=1`);
  await page.waitForSelector('#tree-name');
  await page.locator('#tree-name').fill('窗前小樹');
  await page.locator('[data-action="start"]').click();
  await page.waitForTimeout(600);
  return { ctx, page };
}

const dbg = async (page, cmd) => {
  await page.evaluate((c) => {
    const d = document.querySelector('details.debug');
    d.open = true;
    document.querySelector(`[data-debug="${c}"]`).click();
    d.open = false;
  }, cmd);
  await page.waitForTimeout(250);
};
const settle = (page, ms = 2600) => page.waitForTimeout(ms);
const shot = async (page, name) => {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p });
  console.log('SHOT', p);
};
const webgl = (page) =>
  page.evaluate(() => {
    const c = document.getElementById('scene');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return { gl: Boolean(gl), w: c.width, h: c.height, flat: document.body.classList.contains('flat') };
  });

/* ---------- Phone 390x844 ---------- */
{
  const { ctx, page } = await setup({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false }, 'phone');
  await dbg(page, 'time-day');
  await dbg(page, 'scene-clear');
  console.log('webgl', JSON.stringify(await webgl(page)));
  await settle(page, 4200);
  await shot(page, '01-seedling-phone.png');

  // Care actions so the log has real entries with reward chips.
  await page.locator('.dock [data-action="water"]').click();
  await page.waitForTimeout(300);
  await page.locator('.dock [data-action="fertilize"]').click();
  await page.waitForTimeout(300);
  await page.locator('#status-card [data-action="deworm"]').click();
  await page.waitForTimeout(300);
  await page.locator('#status-card [data-action="prune"]').click();
  await page.waitForTimeout(300);

  await dbg(page, 'jump');
  await settle(page, 4200);
  await shot(page, '02-mid-stage-phone.png');
  await dbg(page, 'jump');
  await settle(page, 4200);
  await shot(page, '02b-ancient-phone.png');

  // Reinforce via the 加固 dock button (drawer forecast tab).
  await page.locator('.dock [data-open="forecast"]').click();
  await page.waitForTimeout(500);
  await page.locator('[data-prep="stakes"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-prep="ropes"]').click();
  await page.waitForTimeout(300);
  await shot(page, '07-drawer-reinforce-phone.png');
  await page.locator('#drawer [data-tab="care"]').click();
  await page.waitForTimeout(300);
  await shot(page, '08-drawer-care-phone.png');
  await page.locator('#drawer [data-tab="album"]').click();
  await page.waitForTimeout(1200);
  await shot(page, '09-drawer-album-phone.png');
  await page.locator('#drawer-close').click();
  await page.waitForTimeout(500);

  for (let i = 0; i < 3; i++) await dbg(page, 'jump');
  await settle(page, 5000);
  await shot(page, '03-giant-animals-phone.png');

  // Collapsed vs pulled-up growth log.
  await shot(page, '06-log-collapsed-phone.png');
  const handle = page.locator('#sheet-handle');
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width / 2, box.y + 10 - i * 45);
  await page.mouse.up();
  await page.waitForTimeout(700);
  const openState = await page.locator('#sheet').getAttribute('data-state');
  console.log('sheet after drag up:', openState);
  await shot(page, '05-log-open-phone.png');
  // Tap the handle to close again.
  await handle.click();
  await page.waitForTimeout(600);
  console.log('sheet after tap:', await page.locator('#sheet').getAttribute('data-state'));

  // Storm: typhoon now plus a typhoon warned for tomorrow (severe weather card).
  await dbg(page, 'storm-tomorrow-typhoon');
  await dbg(page, 'scene-typhoon');
  await settle(page, 3000);
  await shot(page, '04-storm-rain-phone.png');
  await dbg(page, 'scene-heavyrain');
  await dbg(page, 'time-night');
  await settle(page, 3000);
  await shot(page, '10-night-rain-phone.png');
  await dbg(page, 'scene-clear');
  await settle(page, 2500);
  await shot(page, '11-night-clear-phone.png');

  // Location + settings modals.
  await dbg(page, 'time-day');
  await page.locator('#place-pill').click();
  await page.waitForTimeout(400);
  await shot(page, '12-location-modal-phone.png');
  await page.locator('#modal [data-action="close-modal"]').click();
  await page.locator('#gear').click();
  await page.waitForTimeout(400);
  await shot(page, '13-settings-modal-phone.png');
  await page.locator('#modal .primary').click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('yiri-yisyu-v1')));
  console.log('save ok', saved.heightCm, saved.log.length, saved.log.slice(0, 3).map((e) => `${e.time} ${e.kind} ${e.title} ${e.reward?.text ?? ''}`));
  await ctx.close();
}

/* ---------- Desktop 1440x900 ---------- */
{
  const { ctx, page } = await setup({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, 'desktop');
  await dbg(page, 'time-day');
  await dbg(page, 'scene-clear');
  console.log('webgl desktop', JSON.stringify(await webgl(page)));
  await settle(page, 3500);
  await shot(page, '20-desktop-seedling.png');
  await page.locator('.dock [data-action="water"]').click();
  for (let i = 0; i < 4; i++) await dbg(page, 'jump');
  await settle(page, 5000);
  await shot(page, '21-desktop-giant.png');
  await page.locator('#sheet-handle').click();
  await page.waitForTimeout(700);
  await shot(page, '22-desktop-log-open.png');
  await ctx.close();
}

/* ---------- Video: camera rising as the tree grows ---------- */
if (process.env.VIDEO !== '0') {
  const vdir = path.join(OUT, 'video-tmp');
  fs.rmSync(vdir, { recursive: true, force: true });
  const { ctx, page } = await setup({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 390, height: 844 } } }, 'video');
  await dbg(page, 'time-day');
  await dbg(page, 'scene-clear');
  await settle(page, 3000);
  for (let i = 0; i < 5; i++) {
    await dbg(page, 'jump');
    await settle(page, 3800);
  }
  await dbg(page, 'scene-typhoon');
  await settle(page, 3500);
  const video = page.video();
  await ctx.close();
  const src = await video.path();
  const dest = path.join(OUT, 'camera-rise-phone.webm');
  fs.renameSync(src, dest);
  fs.rmSync(vdir, { recursive: true, force: true });
  console.log('VIDEO', dest);
}

await browser.close();
console.log(problems.length ? `PROBLEMS\n${problems.join('\n')}` : 'CONSOLE CLEAN (ignoring Open-Meteo 429 + GPU readback notices)');
