// v2 icon pipeline (npm run assets): app-assets/icon-v2-source.png (low-poly scene in a rounded card on white)
// → cropped full-square artwork → launcher mipmaps (legacy, round, adaptive layers), splash screens,
// Play Store 512 icon, web favicons; app-assets/ic_stat_tree.svg → notification small icon PNGs.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(dir, '..');
const res = path.join(root, 'android/app/src/main/res');
// Card is ~987×1009 px at (133,121) in the 1254 px source; this square sits inside the rounded corners (no white).
const CROP = { left: 216, top: 215, width: 822, height: 822 };

const art = await sharp(path.join(dir, 'icon-v2-source.png')).extract(CROP).resize(1024, 1024).png().toBuffer();
await sharp(art).toFile(path.join(dir, 'icon-v2-square.png'));

const circle = (n) => Buffer.from(`<svg width="${n}" height="${n}"><circle cx="${n / 2}" cy="${n / 2}" r="${n / 2}"/></svg>`);
const rounded = (n, r) => Buffer.from(`<svg width="${n}" height="${n}"><rect width="${n}" height="${n}" rx="${r}"/></svg>`);
const mask = async (buf, m) => sharp(buf).composite([{ input: m, blend: 'dest-in' }]).png().toBuffer();

// Adaptive layers (108 dp canvas; launchers show the middle ~72 dp): foreground = artwork at 76 dp, opaque, so it
// covers every mask shape; background = the same artwork full-bleed and blurred (only seen during parallax).
async function adaptiveLayers(px) {
  const fgSize = Math.round((px * 76) / 108);
  const fgArt = await sharp(art).resize(fgSize, fgSize).png().toBuffer();
  const fg = await sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fgArt, gravity: 'center' }]).png().toBuffer();
  const bg = await sharp(art).resize(px, px).blur(Math.max(1, px / 60)).png().toBuffer();
  return { fg, bg };
}

const DENS = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, s] of Object.entries(DENS)) {
  const out = path.join(res, `mipmap-${d}`);
  fs.mkdirSync(out, { recursive: true });
  const n = Math.round(48 * s);
  const legacy = await sharp(art).resize(n, n).png().toBuffer();
  await sharp(await mask(legacy, rounded(n, n * 0.18))).toFile(path.join(out, 'ic_launcher.png'));
  await sharp(await mask(legacy, circle(n))).toFile(path.join(out, 'ic_launcher_round.png'));
  const { fg, bg } = await adaptiveLayers(Math.round(108 * s));
  await sharp(fg).toFile(path.join(out, 'ic_launcher_foreground.png'));
  await sharp(bg).toFile(path.join(out, 'ic_launcher_background.png'));
  // Notification small icon: white silhouette, 24 dp.
  const dOut = path.join(res, `drawable-${d}`);
  fs.mkdirSync(dOut, { recursive: true });
  const m = Math.round(24 * s);
  await sharp(path.join(dir, 'ic_stat_tree.svg'), { density: 72 * s * 4 }).resize(m, m).png().toFile(path.join(dOut, 'ic_stat_tree.png'));
}

// Splash screens: sky-blue backdrop with the icon (rounded) in the middle, at each existing splash size.
for (const folder of fs.readdirSync(res).filter((f) => f.startsWith('drawable'))) {
  const f = path.join(res, folder, 'splash.png');
  if (!fs.existsSync(f)) continue;
  const { width, height } = await sharp(f).metadata();
  const n = Math.round(Math.min(width, height) * 0.36);
  const icon = await mask(await sharp(art).resize(n, n).png().toBuffer(), rounded(n, n * 0.2));
  const night = folder.includes('night');
  const bg = night ? { r: 20, g: 38, b: 56, alpha: 1 } : { r: 190, g: 226, b: 247, alpha: 1 };
  const buf = await sharp({ create: { width, height, channels: 4, background: bg } }).composite([{ input: icon, gravity: 'center' }]).png().toBuffer();
  fs.writeFileSync(f, buf);
}

// Play Store (512, square; Play applies its own mask) and web icons.
await sharp(art).resize(512, 512).png().toFile(path.join(dir, 'play-store-icon-512.png'));
const pub = path.join(root, 'public');
await sharp(await mask(await sharp(art).resize(64, 64).png().toBuffer(), rounded(64, 12))).toFile(path.join(pub, 'favicon.png'));
await sharp(art).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));
console.log('icons rendered');
