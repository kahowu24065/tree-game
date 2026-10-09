/**
 * 1.4.59 分享樹卡: one tap draws a 1080 × 1350 card (the island as it looks now, tree name, species, age, height in
 * the chosen unit, the hardest weather it came through, app name + icon; nothing personal: no place, no account)
 * and opens the share sheet (Capacitor Share with a cached PNG); the web version downloads the PNG.
 */
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { t as tl } from './i18n';
import { isNative } from './native/platform';

export interface ShareCardData {
  treeName: string;
  species: string;
  age: string;
  height: string;
  /** Up to three "八號風球 × 2"-style lines (already localised). */
  weather: string[];
  /** 1.4.66 「今日小事」 title + body (already localised). Replaces 1.4.64 daily goals on the card. */
  vignette?: { title: string; text: string } | null;
}

export const CARD_W = 1080;
export const CARD_H = 1350;
const FONT = '"PingFang HK","PingFang TC","Noto Sans HK","Noto Sans TC","Noto Sans SC","Microsoft JhengHei",system-ui,sans-serif';

/** What the card says, in order (also used by tests): title lines first, then the facts. */
export function cardLines(d: ShareCardData): string[] {
  const v = d.vignette ? [d.vignette.title, d.vignette.text].filter(Boolean) : [];
  return [d.treeName, `${d.species} · ${d.age}`, d.height, ...d.weather.slice(0, 3), ...v];
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function fitText(g: CanvasRenderingContext2D, text: string, max: number, size: number, weight = 700): void {
  let s = size;
  g.font = `${weight} ${s}px ${FONT}`;
  while (s > 20 && g.measureText(text).width > max) {
    s -= 2;
    g.font = `${weight} ${s}px ${FONT}`;
  }
}

function loadImage(src: string, ms = 2500): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean) => resolve(ok ? img : null);
    const timer = window.setTimeout(() => done(false), ms);
    img.onload = () => {
      window.clearTimeout(timer);
      done(true);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      done(false);
    };
    img.src = src;
  });
}

/** Draw the card. `scene` is a fresh capture of the 3D view (null → a plain sky panel). */
export async function drawShareCard(d: ShareCardData, scene: HTMLCanvasElement | null): Promise<HTMLCanvasElement> {
  const cv = document.createElement('canvas');
  cv.width = CARD_W;
  cv.height = CARD_H;
  const g = cv.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, '#eaf6ee');
  bg.addColorStop(1, '#d7ecdf');
  g.fillStyle = bg;
  g.fillRect(0, 0, CARD_W, CARD_H);

  // The island, cropped to fill a rounded panel.
  const px = 60;
  const py = 60;
  const pw = CARD_W - 120;
  const ph = 760;
  g.save();
  roundRect(g, px, py, pw, ph, 44);
  g.clip();
  if (scene && scene.width > 0 && scene.height > 0) {
    const s = Math.max(pw / scene.width, ph / scene.height);
    const w = scene.width * s;
    const h = scene.height * s;
    g.drawImage(scene, px + (pw - w) / 2, py + (ph - h) / 2, w, h);
  } else {
    const sky = g.createLinearGradient(0, py, 0, py + ph);
    sky.addColorStop(0, '#9fd3f2');
    sky.addColorStop(1, '#dff1fb');
    g.fillStyle = sky;
    g.fillRect(px, py, pw, ph);
  }
  g.restore();

  // Facts.
  const x = 84;
  const maxW = CARD_W - 168;
  let y = py + ph + 92;
  g.fillStyle = '#23352c';
  fitText(g, d.treeName, maxW, 68, 800);
  g.fillText(d.treeName, x, y);
  y += 58;
  g.fillStyle = '#4c6157';
  fitText(g, `${d.species} · ${d.age}`, maxW, 36, 500);
  g.fillText(`${d.species} · ${d.age}`, x, y);
  y += 54;
  g.fillStyle = '#2f8a4e';
  fitText(g, tl('share.height', { h: d.height }), maxW, 44, 700);
  g.fillText(tl('share.height', { h: d.height }), x, y);
  y += 30;
  if (d.weather.length) {
    g.font = `500 30px ${FONT}`;
    g.fillStyle = '#4c6157';
    for (const line of d.weather.slice(0, 3)) {
      y += 46;
      fitText(g, `· ${line}`, maxW, 30, 500);
      g.fillText(`· ${line}`, x, y);
    }
  }
  // 1.4.66 「今日小事」 vignette on the card (not daily goals).
  const vig = d.vignette;
  if (vig && (vig.title || vig.text)) {
    y += 52;
    g.fillStyle = '#2f8a4e';
    fitText(g, tl('share.vignette'), maxW, 28, 700);
    g.fillText(tl('share.vignette'), x, y);
    g.fillStyle = '#4c6157';
    if (vig.title) {
      y += 40;
      fitText(g, vig.title, maxW, 30, 700);
      g.fillText(vig.title, x, y);
    }
    if (vig.text) {
      y += 36;
      fitText(g, vig.text, maxW, 26, 500);
      g.fillText(vig.text, x, y);
    }
  }

  // App name + icon, bottom right.
  const icon = await loadImage('apple-touch-icon.png');
  const name = tl('share.app');
  g.font = `700 32px ${FONT}`;
  const tw = g.measureText(name).width;
  const iy = CARD_H - 96;
  const ix = CARD_W - 84 - tw - (icon ? 64 : 0);
  if (icon) {
    g.save();
    roundRect(g, ix, iy - 4, 52, 52, 12);
    g.clip();
    g.drawImage(icon, ix, iy - 4, 52, 52);
    g.restore();
  }
  g.fillStyle = '#23352c';
  g.fillText(name, CARD_W - 84 - tw, iy + 34);
  return cv;
}

function fileName(): string {
  return `world-tree-${new Date().toISOString().slice(0, 10)}.png`;
}

/** Native share sheet with the PNG, or download it on the web. Returns 'shared' | 'downloaded' | 'failed'. */
export async function shareCardImage(cv: HTMLCanvasElement): Promise<'shared' | 'downloaded' | 'failed'> {
  const url = cv.toDataURL('image/png');
  if (isNative()) {
    try {
      const w = await Filesystem.writeFile({ path: fileName(), data: url.slice(url.indexOf(',') + 1), directory: Directory.Cache });
      await Share.share({ title: tl('share.app'), files: [w.uri], dialogTitle: tl('share.button') });
      return 'shared';
    } catch (e) {
      // Cancelling the sheet throws too; only a write failure is a real failure.
      return String((e as Error)?.message ?? e).toLowerCase().includes('cancel') ? 'shared' : 'failed';
    }
  }
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
