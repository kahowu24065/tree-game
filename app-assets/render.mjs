// Renders the icon/splash sources for `npx @capacitor/assets generate` from the SVGs in this folder.
import sharp from 'sharp';
const dir = new URL('.', import.meta.url).pathname;
const fg = await sharp(`${dir}tree-foreground.svg`, { density: 300 }).resize(1024, 1024).png().toBuffer();
const bg = await sharp(`${dir}tree-background.svg`, { density: 300 }).resize(1024, 1024).png().toBuffer();
await sharp(fg).toFile(`${dir}icon-foreground.png`);
await sharp(bg).toFile(`${dir}icon-background.png`);
// Legacy/square icon: slightly enlarged foreground over the sky.
const fgBig = await sharp(fg).resize(1200, 1200).extract({ left: 88, top: 88, width: 1024, height: 1024 }).toBuffer();
await sharp(bg).composite([{ input: fgBig }]).toFile(`${dir}icon-only.png`);
// Splash: sky gradient with the tree in the middle.
const skyBig = await sharp(`${dir}tree-background.svg`, { density: 300 }).resize(2732, 2732).png().toBuffer();
const fgSplash = await sharp(fg).resize(1100, 1100).toBuffer();
for (const name of ['splash.png', 'splash-dark.png'])
  await sharp(skyBig).composite([{ input: fgSplash, gravity: 'center' }]).toFile(`${dir}${name}`);
console.log('rendered');
