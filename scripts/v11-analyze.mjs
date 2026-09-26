// v11: metrics from recorded walker tracks (scripts/v11-tracks.mjs): stalls, teleports, overlaps, prop penetrations,
// coverage of the walkable land — before (v10) vs after (v11), with the v11 walk map of each scene as reference.
// node scripts/v11-analyze.mjs /tmp/v11tracks-before.json /tmp/v11tracks-after.json [outDir]
import fs from 'fs';
import { chromium } from 'playwright';

const [fa, fb, outDir = '/workspace/tree-game-shots/v11'] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(fa, 'utf8'));
const B = fb ? JSON.parse(fs.readFileSync(fb, 'utf8')) : null;
fs.mkdirSync(outDir, { recursive: true });

function vcap(len) {
  // Fastest gait any walker has (agile run): 0.9 × 1.6 × 2.6 m/s × body-length factor.
  return 3.75 * Math.min(1.6, Math.max(0.2, len / 0.8));
}

export function analyze(sc, nav) {
  const dt = 0.05;
  const frames = sc.frames;
  const tracks = new Map();
  frames.forEach((fr, f) => {
    for (const [k, id, x, z, len, climb, leaving, wade, vis] of fr) {
      let t = tracks.get(k);
      if (!t) tracks.set(k, (t = { id, len, wade, pts: [] }));
      t.pts.push({ f, x, z, climb, leaving, vis: vis ?? 1 });
    }
  });
  let teleports = 0;
  let dashes = 0;
  let maxJump = 0;
  let stalls = 0;
  let stallSec = 0;
  let jitter = 0;
  const stallList = [];
  for (const [k, t] of tracks) {
    const cap = vcap(t.len);
    let still = 0;
    for (let i = 1; i < t.pts.length; i++) {
      const a = t.pts[i - 1];
      const b = t.pts[i];
      if (b.f !== a.f + 1) continue;
      if (a.climb || b.climb) continue;
      // The recorder hands back to the live render loop between 200-step chunks: those steps span several frames.
      if (b.f % 200 === 0) continue;
      // Invisible (faded out) moments are not seen.
      if (a.vis < 0.05 || b.vis < 0.05) continue;
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      const rel = d / (cap * dt);
      maxJump = Math.max(maxJump, rel);
      if (d > Math.max(0.25 * t.len, 2 * cap * dt)) teleports++;
      else if (d > cap * dt * 1.05) dashes++;
    }
    // Stalls: standing still (< 2 % body length per second) for more than 11 s at a stretch.
    const win = 20; // 1 s
    let run = 0;
    for (let i = win; i < t.pts.length; i += win) {
      const a = t.pts[i - win];
      const b = t.pts[i];
      if (a.climb || b.climb || b.f - a.f !== win) {
        run = 0;
        continue;
      }
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      if (d < 0.02 * t.len) run++;
      else {
        if (run > 11) {
          stalls++;
          stallSec += run;
          stallList.push(`${t.id}:${run}s`);
        }
        run = 0;
      }
    }
    if (run > 11) {
      stalls++;
      stallSec += run;
      stallList.push(`${t.id}:${run}s(end)`);
    }
    // Jitter-stall: 10 s windows with lots of motion but hardly any net progress.
    for (let i = 200; i < t.pts.length; i += 200) {
      let path = 0;
      let ok = true;
      for (let j = i - 199; j <= i; j++) {
        if (t.pts[j].climb || t.pts[j].f !== t.pts[j - 1].f + 1) ok = false;
        path += Math.hypot(t.pts[j].x - t.pts[j - 1].x, t.pts[j].z - t.pts[j - 1].z);
      }
      const net = Math.hypot(t.pts[i].x - t.pts[i - 200].x, t.pts[i].z - t.pts[i - 200].z);
      if (ok && path > 3 * t.len && net < 0.5 * t.len) jitter++;
    }
    void k;
  }
  // Overlaps: two visible walkers closer than 0.36 × (len_i + len_j) (bodies clearly inside each other).
  let overlaps = 0;
  let pairSamples = 0;
  let worstOverlap = 0;
  // Prop penetrations: a walker's centre deeper than 0.25 body length into a rock / bush / building footprint.
  let pens = 0;
  let pensDeep = 0;
  let samples = 0;
  const obs = nav?.obstacles ?? [];
  const bins = new Map();
  for (const [i, o] of obs.entries()) {
    const b0 = Math.floor((o.x - o.r) / 2), b1 = Math.floor((o.x + o.r) / 2), c0 = Math.floor((o.z - o.r) / 2), c1 = Math.floor((o.z + o.r) / 2);
    for (let a = b0; a <= b1; a++) for (let c = c0; c <= c1; c++) { const key = a * 100000 + c; if (!bins.has(key)) bins.set(key, []); bins.get(key).push(i); }
  }
  const scaleK = nav ? 1 : 1;
  for (let f = 0; f < frames.length; f += 2) {
    const fr = frames[f].filter((w) => !w[5] && (w[8] ?? 1) > 0.5);
    for (let i = 0; i < fr.length; i++) {
      samples++;
      for (let j = i + 1; j < fr.length; j++) {
        pairSamples++;
        const d = Math.hypot(fr[i][2] - fr[j][2], fr[i][3] - fr[j][3]);
        const lim = 0.36 * (fr[i][4] + fr[j][4]);
        if (d < lim) {
          overlaps++;
          worstOverlap = Math.max(worstOverlap, 1 - d / lim);
        }
      }
      const [, , x, z, len] = fr[i];
      const key = Math.floor(x / 2) * 100000 + Math.floor(z / 2);
      for (const k of bins.get(key) ?? []) {
        const o = obs[k];
        const d = Math.hypot(x - o.x, z - o.z);
        if (d < o.r * scaleK + 0.25 * len - 1e-3) {
          pens++;
          if (d < o.r * 0.7) pensDeep++;
          break;
        }
      }
    }
  }
  // Coverage: share of walkable 1-island-unit cells (dry, inside the fence) visited by any non-wading walker.
  let coverage = null;
  let heat = null;
  if (nav) {
    const unit = nav.K; // metres per island unit
    const g = Math.ceil((nav.half * 2) / 1);
    const walkable = new Uint8Array(g * g);
    const per = Math.round(1 / nav.cell);
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) {
      let n = 0;
      for (let b = 0; b < per; b++) for (let a = 0; a < per; a++) {
        const ci = i * per + a, cj = j * per + b;
        if (ci < nav.n && cj < nav.n && nav.walk[cj * nav.n + ci] === '1') n++;
      }
      walkable[j * g + i] = n >= per * per * 0.5 ? 1 : 0;
    }
    const visits = new Float32Array(g * g);
    for (const fr of frames) for (const w of fr) {
      if (w[7] || w[5]) continue;
      const i = Math.floor(w[2] / unit + nav.half);
      const j = Math.floor(w[3] / unit + nav.half);
      if (i >= 0 && j >= 0 && i < g && j < g) visits[j * g + i]++;
    }
    let tot = 0, hit = 0;
    for (let k = 0; k < g * g; k++) if (walkable[k]) { tot++; if (visits[k] > 0) hit++; }
    coverage = { pct: (100 * hit) / Math.max(1, tot), cells: tot, hit };
    heat = { g, walkable: [...walkable], visits: [...visits], obstacles: obs.map((o) => [o.x / unit + nav.half, o.z / unit + nav.half, o.r / unit]), walk: nav.walk, n: nav.n, cell: nav.cell };
  }
  return { walkers: tracks.size, teleports, dashes, maxJumpVsTopSpeed: +maxJump.toFixed(2), stalls, stallSec, stallList: stallList.slice(0, 8), jitter, overlaps, overlapPct: +((100 * overlaps) / Math.max(1, pairSamples)).toFixed(2), worstOverlap: +worstOverlap.toFixed(2), pens, pensDeep, samples, coverage, heat };
}

const rows = [];
const heats = [];
for (const sa of A.scenarios) {
  const sb = B?.scenarios.find((x) => x.key === sa.key);
  const nav = sb?.nav ?? sa.nav;
  const ra = analyze(sa, nav);
  const rb = sb ? analyze(sb, nav) : null;
  rows.push({ key: sa.key, before: ra, after: rb });
  heats.push({ key: sa.key, a: ra.heat, b: rb?.heat });
}
const fmt = (r) => r ? `walkers ${r.walkers}, teleports ${r.teleports} (max step ${r.maxJumpVsTopSpeed}× top speed, dashes ${r.dashes}), stalls ${r.stalls} (${r.stallSec}s) jitter ${r.jitter}, overlaps ${r.overlaps} (${r.overlapPct}% of pairs, worst ${r.worstOverlap}), prop pen ${r.pens} (deep ${r.pensDeep}) of ${r.samples}, coverage ${r.coverage ? r.coverage.pct.toFixed(1) + '% of ' + r.coverage.cells : '-'}` : '-';
for (const r of rows) {
  console.log(`\n${r.key}\n  ${A.tag}: ${fmt(r.before)}${r.before.stallList.length ? '\n    stalls: ' + r.before.stallList.join(' ') : ''}\n  ${B?.tag ?? ''}: ${fmt(r.after)}${r.after?.stallList.length ? '\n    stalls: ' + r.after.stallList.join(' ') : ''}`);
}
fs.writeFileSync(`${outDir}/metrics.json`, JSON.stringify(rows.map((r) => ({ key: r.key, before: { ...r.before, heat: undefined }, after: r.after ? { ...r.after, heat: undefined } : null })), null, 1));

// Heatmaps: walkable land (light green), water / outside (blue / grey), props (dark discs), visits (warm).
if (process.env.NOHEAT) process.exit(0);
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
const cells = heats.filter((h) => h.a && h.b);
await page.setContent(`<html><body style="margin:0;background:#f4f7f1;font-family:'Noto Sans CJK TC',sans-serif"><h2 style="margin:10px 14px">v11 覆蓋率熱圖：之前 (v10) vs 之後 (v11) — 模擬 ${A.sim}s</h2><div id="g" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:8px"></div></body></html>`);
await page.evaluate(({ cells, rows, ta, tb }) => {
  const root = document.getElementById('g');
  const draw = (h, label) => {
    const fig = document.createElement('figure');
    fig.style.cssText = 'margin:0;background:#fff;border-radius:10px;overflow:hidden;text-align:center';
    const cv = document.createElement('canvas');
    const S = 420;
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const px = S / (h.n * h.cell);
    for (let j = 0; j < h.n; j++) for (let i = 0; i < h.n; i++) {
      const c = h.walk[j * h.n + i];
      g.fillStyle = c === '1' ? '#dcebc8' : c === 'w' ? '#9fcbe6' : '#c9c9c9';
      g.fillRect(i * h.cell * px, j * h.cell * px, h.cell * px + 0.5, h.cell * px + 0.5);
    }
    let max = 0;
    for (const v of h.visits) max = Math.max(max, v);
    for (let j = 0; j < h.g; j++) for (let i = 0; i < h.g; i++) {
      const v = h.visits[j * h.g + i];
      if (!v) continue;
      const t = Math.min(1, Math.log(1 + v) / Math.log(1 + max));
      g.fillStyle = `rgba(${Math.round(230 + 25 * t)},${Math.round(160 - 130 * t)},${Math.round(40)},${0.35 + 0.6 * t})`;
      g.fillRect(i * px, j * px, px, px);
    }
    g.fillStyle = 'rgba(60,50,40,0.75)';
    for (const [x, z, r] of h.obstacles) {
      g.beginPath();
      g.arc(x * px, z * px, Math.max(0.8, r * px), 0, Math.PI * 2);
      g.fill();
    }
    cv.style.cssText = 'width:100%;display:block';
    fig.appendChild(cv);
    const cap = document.createElement('figcaption');
    cap.style.cssText = 'padding:4px 6px;font-size:14px;font-weight:600';
    cap.textContent = label;
    fig.appendChild(cap);
    root.appendChild(fig);
  };
  for (const c of cells) {
    const r = rows.find((x) => x.key === c.key);
    draw(c.a, `${c.key} ${ta}: 覆蓋 ${r.before.coverage.pct.toFixed(0)}%`);
    draw(c.b, `${c.key} ${tb}: 覆蓋 ${r.after.coverage.pct.toFixed(0)}%`);
  }
}, { cells, rows: rows.map((r) => ({ key: r.key, before: { coverage: r.before.coverage }, after: r.after ? { coverage: r.after.coverage } : null })), ta: A.tag, tb: B?.tag });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/01-coverage-heatmaps.png`, fullPage: true });
await browser.close();
console.log('heatmaps →', `${outDir}/01-coverage-heatmaps.png`);
