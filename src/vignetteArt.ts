/**
 * 1.4.67: soft Ghibli-ish vignette illustrations (inline SVG, ~1–2 KB each).
 * Hand-tuned pastel scenes — no external image weight in the APK.
 */
import { esc } from './util';

const W = 540;
const H = 360;

function sky(top: string, bot: string, extra = ''): string {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${top}"/><stop offset="100%" stop-color="${bot}"/></linearGradient>
  <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9bcf7a"/><stop offset="100%" stop-color="#6eaa58"/></linearGradient>
  <linearGradient id="soft" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity=".55"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>${extra}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>`;
}

function hills(): string {
  return `<path d="M0 260 C80 220 140 240 220 250 C300 260 360 210 440 230 C500 245 540 250 540 250 L540 360 L0 360 Z" fill="url(#hill)" opacity=".92"/>
  <path d="M0 290 C120 270 200 300 300 285 C400 270 480 295 540 280 L540 360 L0 360 Z" fill="#7eb86a" opacity=".85"/>`;
}

function tree(x = 270, scale = 1): string {
  const t = `translate(${x} 300) scale(${scale})`;
  return `<g transform="${t}">
    <rect x="-8" y="-40" width="16" height="50" rx="4" fill="#8b5a3c"/>
    <ellipse cx="0" cy="-70" rx="54" ry="48" fill="#5f9e4a"/>
    <ellipse cx="-22" cy="-55" rx="28" ry="24" fill="#7cbc5c" opacity=".9"/>
    <ellipse cx="24" cy="-58" rx="26" ry="22" fill="#6eb052" opacity=".88"/>
    <ellipse cx="0" cy="-88" rx="30" ry="26" fill="#8fd06a" opacity=".75"/>
  </g>`;
}

function cloud(x: number, y: number, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".78" fill="#fff">
    <ellipse cx="0" cy="0" rx="36" ry="18"/><ellipse cx="28" cy="4" rx="24" ry="14"/><ellipse cx="-26" cy="6" rx="22" ry="12"/>
  </g>`;
}

function vignetteFrame(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" role="img" aria-hidden="true">${inner}
  <rect width="${W}" height="${H}" fill="url(#soft)" opacity=".35"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#e8f2e4" stroke-width="10" opacity=".5"/>
  </svg>`;
}

const ART: Record<string, () => string> = {
  mist: () => vignetteFrame(`${sky('#c5dde8', '#e8f0e4')}
    ${cloud(90, 70, 1.1)}${cloud(380, 90, 0.9)}${cloud(220, 50, 0.7)}
    ${hills()}${tree(300, 1.05)}
    <ellipse cx="270" cy="310" rx="200" ry="28" fill="#dfeaf0" opacity=".55"/>
    <g opacity=".4" fill="#c9dce6"><ellipse cx="120" cy="250" rx="50" ry="12"/><ellipse cx="400" cy="270" rx="60" ry="14"/><ellipse cx="250" cy="280" rx="70" ry="16"/></g>`),

  compost: () => vignetteFrame(`${sky('#d7ebf2', '#f0f4e6')}
    ${cloud(100, 60, 0.8)}${hills()}${tree(400, 0.85)}
    <ellipse cx="180" cy="300" rx="70" ry="22" fill="#6b4a32" opacity=".85"/>
    <path d="M130 300 Q180 250 230 300 Z" fill="#8a5a3a"/>
    <circle cx="160" cy="285" r="7" fill="#5a8f3a"/><circle cx="190" cy="278" r="6" fill="#7a4"/><circle cx="200" cy="295" r="5" fill="#946"/>
    <rect x="250" y="270" width="36" height="28" rx="4" fill="#c4a574" stroke="#8a6a40" stroke-width="2"/>`),

  birds: () => vignetteFrame(`${sky('#b9d8ef', '#eaf3e0')}
    ${cloud(80, 55)}${cloud(420, 75, 0.85)}${hills()}${tree(260, 1.1)}
    <g fill="none" stroke="#3a4a58" stroke-width="2.2" stroke-linecap="round">
      <path d="M120 100 q12 -14 24 0"/><path d="M160 130 q10 -12 20 0"/><path d="M400 110 q14 -16 28 0"/><path d="M440 140 q11 -12 22 0"/>
    </g>
    <circle cx="255" cy="145" r="4" fill="#3a4a58"/><path d="M255 145 q18 -20 8 -36" fill="none" stroke="#3a4a58" stroke-width="1.5"/>`),

  drywind: () => vignetteFrame(`${sky('#f0d9b0', '#f6e8c8', '<linearGradient id="dust" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#e8c98a" stop-opacity="0"/><stop offset="50%" stop-color="#e0b86a" stop-opacity=".45"/><stop offset="100%" stop-color="#e8c98a" stop-opacity="0"/></linearGradient>')}
    ${hills()}${tree(300, 0.95)}
    <path d="M40 180 C160 140 280 200 520 150" fill="none" stroke="url(#dust)" stroke-width="28" opacity=".7"/>
    <path d="M20 220 C180 190 320 240 540 200" fill="none" stroke="url(#dust)" stroke-width="18" opacity=".5"/>
    <g opacity=".55" fill="#c9a86a"><ellipse cx="140" cy="300" rx="40" ry="8"/><ellipse cx="420" cy="310" rx="50" ry="9"/></g>`),

  leaves: () => vignetteFrame(`${sky('#cfe4f0', '#efe8d4')}
    ${cloud(90, 60, 0.9)}${hills()}${tree(280, 1)}
    <g opacity=".9"><ellipse cx="160" cy="200" rx="10" ry="6" fill="#c4a035" transform="rotate(-25 160 200)"/>
    <ellipse cx="220" cy="240" rx="11" ry="6" fill="#8a6"/><ellipse cx="340" cy="210" rx="10" ry="5" fill="#d4a024" transform="rotate(20 340 210)"/>
    <ellipse cx="380" cy="260" rx="12" ry="6" fill="#6a8f3a" transform="rotate(-15 380 260)"/>
    <ellipse cx="200" cy="280" rx="9" ry="5" fill="#b8860b"/><ellipse cx="310" cy="290" rx="10" ry="5" fill="#7a9e4a"/></g>`),

  drawing: () => vignetteFrame(`${sky('#c8dff0', '#eaf2dc')}
    ${cloud(110, 55, 0.75)}${hills()}${tree(380, 0.9)}
    <rect x="120" y="220" width="90" height="70" rx="6" fill="#f7f1e0" stroke="#cbb896" stroke-width="3"/>
    <circle cx="150" cy="250" r="10" fill="#7cbc5c"/><rect x="168" y="255" width="8" height="22" fill="#8b5a3c"/>
    <circle cx="175" cy="245" r="4" fill="#f2a3b0"/><path d="M140 275 Q165 268 185 278" fill="none" stroke="#6a9" stroke-width="2"/>
    <circle cx="210" cy="300" r="14" fill="#f0c8a0"/><path d="M200 310 q10 18 20 0" fill="#6a9ecf"/>`),

  aphids: () => vignetteFrame(`${sky('#d2e4d8', '#e8f0dc')}
    ${hills()}${tree(270, 1.05)}
    <g opacity=".85"><ellipse cx="300" cy="160" rx="8" ry="5" fill="#7a9e4a"/>
    <circle cx="292" cy="168" r="3.5" fill="#8ab85a"/><circle cx="300" cy="172" r="3.2" fill="#8ab85a"/><circle cx="308" cy="168" r="3.4" fill="#8ab85a"/>
    <circle cx="250" cy="175" r="3" fill="#9bc86a"/><circle cx="245" cy="182" r="2.8" fill="#9bc86a"/></g>
    <path d="M310 155 q20 -30 8 -50" fill="none" stroke="#5a7a40" stroke-width="1.5" opacity=".6"/>`),

  sunbeam: () => vignetteFrame(`${sky('#9ec8e8', '#f5e6b8', '<radialGradient id="sun" cx="78%" cy="18%" r="40%"><stop offset="0%" stop-color="#fff6c8"/><stop offset="35%" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="100%" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>')}
    <circle cx="420" cy="70" r="120" fill="url(#sun)"/>
    ${cloud(80, 90, 0.7)}${hills()}${tree(240, 1)}
    <path d="M420 70 L180 320" stroke="#fff3c0" stroke-width="40" opacity=".25"/>
    <path d="M420 70 L280 330" stroke="#ffe9a0" stroke-width="28" opacity=".2"/>`),

  cat: () => vignetteFrame(`${sky('#bdd7ec', '#e9f1de')}
    ${cloud(100, 60)}${hills()}${tree(360, 0.95)}
    <ellipse cx="200" cy="300" rx="70" ry="18" fill="#000" opacity=".08"/>
    <g transform="translate(200 285)">
      <ellipse cx="0" cy="0" rx="28" ry="16" fill="#d4a574"/>
      <circle cx="-18" cy="-12" r="12" fill="#d4a574"/>
      <path d="M-28 -18 L-32 -30 L-22 -20" fill="#d4a574"/><path d="M-8 -18 L-4 -30 L-14 -20" fill="#d4a574"/>
      <circle cx="-22" cy="-14" r="1.6" fill="#333"/><path d="M28 0 Q48 -10 52 8" fill="none" stroke="#d4a574" stroke-width="6" stroke-linecap="round"/>
      <path d="M-10 2 h8 M-10 6 h10" stroke="#c48a5a" stroke-width="2"/>
    </g>`),

  quiet: () => vignetteFrame(`${sky('#c2d9ea', '#e6efd8')}
    ${cloud(70, 70, 0.85)}${cloud(400, 55, 0.7)}${hills()}${tree(270, 1)}
    <circle cx="80" cy="200" r="3" fill="#fff" opacity=".7"/><circle cx="460" cy="160" r="2.5" fill="#fff" opacity=".6"/>
    <ellipse cx="270" cy="320" rx="90" ry="14" fill="#000" opacity=".06"/>`),
};

/** Soft illustration SVG for a daily vignette id (fallback: quiet). */
export function vignetteArtSvg(eventId: string): string {
  const fn = ART[eventId] ?? ART.quiet!;
  return fn();
}

/** Safe HTML fragment for embedding in a modal (SVG is trusted from our templates). */
export function vignetteArtHtml(eventId: string): string {
  return `<div class="vignette-art" data-vig="${esc(eventId)}">${vignetteArtSvg(eventId)}</div>`;
}

export const VIGNETTE_ART_IDS = Object.keys(ART);
