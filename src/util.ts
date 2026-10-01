import { t as tl } from './i18n';
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatHeight(cm: number): string {
  if (cm < 100) return tl('ui.308', { p0: Math.round(cm) });
  const meters = cm / 100;
  return tl('main.014', { p0: meters.toFixed(meters >= 100 ? 1 : 1) });
}

export function formatMeters(meters: number): string {
  if (meters < 1) return tl('ui.308', { p0: Math.round(meters * 100) });
  return tl('main.014', { p0: meters.toFixed(meters >= 20 ? 1 : 1) });
}

export function percentOf(part: number, whole: number): string {
  if (whole <= 0) return '0';
  const p = (part / whole) * 100;
  if (p < 0.1) return tl('util.001');
  if (p < 10) return p.toFixed(1);
  return Math.round(p).toString();
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
