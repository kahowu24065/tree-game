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
  more: s('<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>'),
};

export type IconName = keyof typeof ICONS;

/** Colourful weather illustration for the weather card. */
export function weatherArt(code: number, night: boolean, storm: boolean): string {
  const sun = night
    ? '<path d="M30 20a11 11 0 0 1-14-14 11 11 0 1 0 14 14z" fill="#ffe7a3" stroke="#f1c75b" stroke-width="1.5"/>'
    : '<g><circle cx="19" cy="17" r="8" fill="#ffc94a"/><g stroke="#ffc94a" stroke-width="2.4" stroke-linecap="round"><path d="M19 3.5v3M19 27.5v3M5.5 17h3M29.5 17h3M9.5 7.5l2 2M26.5 24.5l2 2M28.5 7.5l-2 2M9.5 26.5l2-2"/></g></g>';
  const cloud = (fill: string, x = 0, y = 0) =>
    `<path transform="translate(${x} ${y})" d="M14 38h22a8 8 0 0 0 .8-16 10 10 0 0 0-19.3 2.2A7 7 0 0 0 14 38z" fill="${fill}" stroke="rgba(90,110,130,.25)" stroke-width="1"/>`;
  const drops = '<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>';
  const bolt = '<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/>';
  let body: string;
  if (storm || code >= 95) body = cloud('#8f9aa8', 0, -2) + bolt + drops;
  else if (code >= 51) body = cloud('#d8e0e8', 0, -2) + drops;
  else if (code === 45 || code === 48) body = cloud('#e7edf1', 0, -4) + '<g stroke="#b7c3cc" stroke-width="2.4" stroke-linecap="round"><path d="M10 42h28M14 47h22"/></g>';
  else if (code === 3) body = cloud('#e5ebf0', -4, -6) + cloud('#f7fafc', 2, 0);
  else if (code === 0) body = `<g transform="translate(6 6) scale(1.1)">${sun}</g>`;
  else body = sun + cloud('#ffffff', 4, 2);
  return `<svg viewBox="0 0 50 52" aria-hidden="true">${body}</svg>`;
}
