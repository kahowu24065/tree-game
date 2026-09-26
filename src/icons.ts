/** Inline SVG icons (no emoji, so headless browsers and old phones render them the same). */
const s = (body: string, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  drop: s('<path d="M12 3.2c3.4 4.1 6 7.3 6 10.6a6 6 0 0 1-12 0c0-3.3 2.6-6.5 6-10.6z" fill="currentColor" fill-opacity=".18"/><path d="M9.2 14.6a3 3 0 0 0 2.6 2.6"/>'),
  leaf: s('<path d="M5 19c0-8 5.5-13.5 14-14-.3 8.6-5.8 14-14 14z" fill="currentColor" fill-opacity=".18"/><path d="M5 19c3.5-3.8 6.5-6.6 10-9"/>'),
  sprout: s('<path d="M12 20v-8"/><path d="M12 12c0-3.6-2.6-6-6.5-6 0 3.7 2.6 6 6.5 6z" fill="currentColor" fill-opacity=".18"/><path d="M12 13.5c0-3.2 2.4-5.4 6-5.4 0 3.3-2.4 5.4-6 5.4z" fill="currentColor" fill-opacity=".18"/><path d="M7 20h10"/>'),
  shield: s('<path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6z" fill="currentColor" fill-opacity=".18"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
  hammer: s('<path d="M13.5 6.5l4 4"/><path d="M11 9l-7 7 3 3 7-7"/><path d="M12.5 4.5l3-1.5 5.5 5.5-1.5 3z" fill="currentColor" fill-opacity=".18"/>'),
  book: s('<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" fill="currentColor" fill-opacity=".15"/><path d="M12 6v13.5"/>'),
  pin: s('<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="10.5" r="2.2"/>'),
  gear: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>'),
  chevronDown: s('<path d="M6 9l6 6 6-6"/>'),
  chevronRight: s('<path d="M9 6l6 6-6 6"/>'),
  close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
  bug: s('<ellipse cx="12" cy="14" rx="4.5" ry="5.5" fill="currentColor" fill-opacity=".18"/><path d="M12 8.5V19.5M9 5l1.5 2.5M15 5l-1.5 2.5M4 12h3.5M16.5 12H20M5 17.5l3-1.5M19 17.5l-3-1.5"/>'),
  scissors: s('<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.8L18 4M15.7 15.8L6 4"/>'),
  bird: s('<path d="M4 14c2.5 0 4-1 5.5-3.5C11 8 13 6.5 16 6.5c1.8 0 3 1 3.5 2.5L22 10l-2.5 1c-.5 4-3.5 7-8 7-3 0-5.5-1.5-7.5-4z" fill="currentColor" fill-opacity=".18"/><circle cx="16.5" cy="9" r=".6" fill="currentColor"/><path d="M9 18l-1 3M12 18l.5 3"/>'),
  arrowUp: s('<path d="M12 20V5M6 11l6-6 6 6"/>'),
  sparkle: s('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" fill-opacity=".2"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>'),
  heart: s('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor" fill-opacity=".2"/>'),
  ruler: s('<path d="M12 3v18M8.5 6h3.5M9.5 9h2.5M8.5 12h3.5M9.5 15h2.5M8.5 18h3.5"/>'),
  canopy: s('<path d="M12 21v-6"/><path d="M6.5 15a4 4 0 0 1-.8-7.9A5 5 0 0 1 15 5.3a4.2 4.2 0 0 1 3.4 8.3c-.7.9-1.7 1.4-2.9 1.4z" fill="currentColor" fill-opacity=".18"/>'),
  roots: s('<path d="M12 3v9M12 12c-1.5 3-4 4-6.5 4.5M12 12c1.5 3 4 4 6.5 4.5M12 12v8M9 18l-2 3M15 18l2 3"/>'),
  flag: s('<path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="currentColor" fill-opacity=".15"/>'),
  calendar: s('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
  warn: s('<path d="M12 3.5L2.5 20h19z" fill="currentColor" fill-opacity=".15"/><path d="M12 10v4.5M12 17.2v.3"/>'),
  wind: s('<path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/>'),
  moonSmall: s('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor" fill-opacity=".2"/>'),
  locate: s('<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>'),
  drain: s('<path d="M12 3.5c2.8 3.4 5 6 5 8.8a5 5 0 0 1-10 0c0-2.8 2.2-5.4 5-8.8z" fill="currentColor" fill-opacity=".18"/><path d="M4 19.5h16M8 16.5l-1.5 3M16 16.5l1.5 3"/>'),
  wrench: s('<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/>'),
  /** v15.1 保暖: a campfire (flame over crossed logs). */
  campfire: s('<path d="M12 2.8c2.9 3 4.5 5.4 4.5 7.9a4.5 4.5 0 0 1-9 0c0-1.6.7-2.9 1.9-4 .2 1.5.9 2.4 1.9 2.7-.3-2.3.1-4.5.7-6.6z" fill="currentColor" fill-opacity=".22"/><path d="M12 12.6c.9.9 1.4 1.7 1.4 2.5a1.4 1.4 0 0 1-2.8 0c0-.8.5-1.6 1.4-2.5z" fill="currentColor"/><path d="M3.8 21l16.4-4.2M3.8 16.8L20.2 21"/>'),
  more: s('<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>'),
};

export type IconName = keyof typeof ICONS;

/** Colourful weather illustration. When an HKO icon number is given it wins over the WMO code. */
export function weatherArt(code: number, night: boolean, storm: boolean, hkoIcon?: number): string {
  const sunArt = (color = '#ffc94a') =>
    `<g><circle cx="19" cy="17" r="8" fill="${color}"/><g stroke="${color}" stroke-width="2.4" stroke-linecap="round"><path d="M19 3.5v3M19 27.5v3M5.5 17h3M29.5 17h3M9.5 7.5l2 2M26.5 24.5l2 2M28.5 7.5l-2 2M9.5 26.5l2-2"/></g></g>`;
  const moon = '<path d="M30 20a11 11 0 0 1-14-14 11 11 0 1 0 14 14z" fill="#ffe7a3" stroke="#f1c75b" stroke-width="1.5"/>';
  const sun = night ? moon : sunArt();
  const cloud = (fill: string, x = 0, y = 0) =>
    `<path transform="translate(${x} ${y})" d="M14 38h22a8 8 0 0 0 .8-16 10 10 0 0 0-19.3 2.2A7 7 0 0 0 14 38z" fill="${fill}" stroke="rgba(90,110,130,.25)" stroke-width="1"/>`;
  const drops = '<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>';
  const fewDrops = '<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M21 41l-1.5 4M29 41l-1.5 4"/></g>';
  const manyDrops = '<g stroke="#2f7fc4" stroke-width="2.6" stroke-linecap="round"><path d="M15 41l-2.5 6M21 41l-2.5 6M27 41l-2.5 6M33 41l-2.5 6"/></g>';
  const bolt = '<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/>';
  const fog = '<g stroke="#b7c3cc" stroke-width="2.4" stroke-linecap="round"><path d="M10 42h28M14 47h22"/></g>';
  const thermo = (fill: string, level: number) =>
    `<g transform="translate(33 18)"><rect x="-3" y="0" width="6" height="22" rx="3" fill="#fff" stroke="#8a97a6" stroke-width="1.2"/><rect x="-1.4" y="${20 - level}" width="2.8" height="${level}" rx="1.4" fill="${fill}"/><circle cx="0" cy="24" r="5" fill="${fill}" stroke="#8a97a6" stroke-width="1.2"/></g>`;
  const wind = '<g stroke="#7fa7c9" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M6 20h24a5 5 0 1 0-5-5M6 29h32a5 5 0 1 1-5 5M6 38h16"/></g>';
  let body: string | null = null;
  if (hkoIcon !== undefined && !storm) {
    const behind = (x: number, y: number, s = 0.8) => `<g transform="translate(${x} ${y}) scale(${s})">${sun}</g>`;
    switch (hkoIcon) {
      case 50: body = `<g transform="translate(6 6) scale(1.1)">${sun}</g>`; break; // 陽光充沛
      case 51: body = sun + cloud('#ffffff', 4, 2); break; // 間有陽光
      case 52: body = behind(8, 0) + cloud('#eef2f6', -2, 0); break; // 短暫陽光
      case 53: body = sun + cloud('#ffffff', 4, -2) + fewDrops; break; // 間有陽光幾陣驟雨
      case 54: body = behind(8, -2) + cloud('#e3e9ef', -2, -3) + drops; break; // 短暫陽光有驟雨
      case 60: body = cloud('#e5ebf0', -4, -6) + cloud('#f7fafc', 2, 0); break; // 多雲
      case 61: body = cloud('#aeb8c4', -4, -6) + cloud('#c9d1da', 2, 0); break; // 密雲
      case 62: body = cloud('#dfe6ec', 0, -2) + fewDrops; break; // 微雨
      case 63: body = cloud('#c9d2dc', 0, -2) + drops; break; // 雨
      case 64: body = cloud('#9aa6b4', 0, -3) + manyDrops; break; // 大雨
      case 65: body = cloud('#8f9aa8', 0, -2) + bolt + drops; break; // 雷暴
      case 70: case 71: case 72: case 73: case 74: case 75: body = `<g transform="translate(6 6) scale(1.1)">${moon}</g>`; break; // 天色良好
      case 76: body = `<g transform="translate(8 0) scale(.8)">${moon}</g>` + cloud('#e5ebf0', -2, 0); break; // 大致多雲（晚）
      case 77: body = moon + cloud('#ffffff', 4, 2); break; // 天色大致良好（晚）
      case 80: body = wind; break; // 大風
      case 81: body = `<g transform="translate(-2 0)">${sunArt('#ffb347')}</g><g stroke="#d9a15b" stroke-width="2.2" stroke-linecap="round"><path d="M8 40l6-3 5 4 6-4 5 4 6-3"/></g>`; break; // 乾燥
      case 82: body = '<path d="M25 8c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20z" fill="#bfe0f6" stroke="#4ea3e0" stroke-width="1.6"/><path d="M20 30a5 5 0 0 0 4.5 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'; break; // 潮濕
      case 83: case 84: body = cloud('#e7edf1', 0, -4) + fog; break; // 霧／薄霧
      case 85: body = `<g opacity=".55">${sunArt('#e0b25a')}</g><g stroke="#c9b48f" stroke-width="2.4" stroke-linecap="round"><path d="M6 34h30M10 40h32M6 46h26"/></g>`; break; // 煙霞
      case 90: body = `<g transform="translate(-4 2)">${night ? moon : sunArt('#ff9f2e')}</g>` + thermo('#ef5b3c', 17); break; // 熱
      case 91: body = `<g transform="translate(-4 2)">${sun}</g>` + thermo('#f39a3d', 12); break; // 暖
      case 92: body = cloud('#eef2f6', -6, 0) + thermo('#5aa9e6', 8); break; // 涼
      case 93: body = '<g stroke="#6fb3e8" stroke-width="2.2" stroke-linecap="round"><path d="M16 10v24M6 22h20M9 15l14 14M23 15L9 29"/></g>' + thermo('#3a7fc9', 4); break; // 冷
    }
  }
  if (body === null) {
    if (storm || code >= 95) body = cloud('#8f9aa8', 0, -2) + bolt + drops;
    else if (code >= 51) body = cloud('#d8e0e8', 0, -2) + drops;
    else if (code === 45 || code === 48) body = cloud('#e7edf1', 0, -4) + fog;
    else if (code === 3) body = cloud('#e5ebf0', -4, -6) + cloud('#f7fafc', 2, 0);
    else if (code === 0) body = `<g transform="translate(6 6) scale(1.1)">${sun}</g>`;
    else body = sun + cloud('#ffffff', 4, 2);
  }
  return `<svg viewBox="0 0 50 52" aria-hidden="true">${body}</svg>`;
}
