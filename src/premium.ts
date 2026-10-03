/**
 * Store-release premium (月費會員): perks only — no ads, monthly limited tree skins, real-weather memorial album.
 * Tree care, warnings and every rule stay free. Pure helpers + a small localStorage store ('sekai-tree-premium',
 * mirrored to native Preferences like the save). The store's `active` is a cache of the store entitlement
 * (refreshed by native/billing.ts); it never affects the game rules.
 */
import type { WeatherEventId } from './balance';
import { t as tl } from './i18n';
import { kvStorage } from './native/kv';

export const PREMIUM_KEY = 'sekai-tree-premium';
/** RevenueCat entitlement / store product (App Store Connect + Play Console). */
export const ENTITLEMENT = 'premium';
export const PRODUCT_ID = 'sekai_tree_monthly';
/** 1.4.39: one-time (non-consumable) purchase granting the same `premium` entitlement for good. */
export const LIFETIME_ID = 'sekai_tree_lifetime';
/** 1.4.40: yearly auto-renewing subscription, same subscription group as monthly, same `premium` entitlement. */
export const YEARLY_ID = 'sekai_tree_yearly';
export type Plan = 'monthly' | 'yearly' | 'lifetime';
export const PLANS: readonly Plan[] = ['monthly', 'yearly', 'lifetime'];
/**
 * Extra perks (monthly leaf skins + real-weather album) are built but switched OFF: the only perk is "no ads".
 * While false nothing about them is shown, recorded or applied. Flip to true (and restore the paywall text) later.
 */
export const PREMIUM_EXTRAS = false;
const DIARY_MAX = 800;

export interface DiaryEntry {
  date: string;
  place: string;
  /** Highest / lowest real temperature seen that day (°C, rounded). */
  tMax: number;
  tMin: number;
  /** Latest real weather code seen (WMO, for the icon). */
  code: number;
  /** HKO icon number when the reading came from HKO. */
  hkoIcon?: number;
  events: WeatherEventId[];
  treeName: string;
  /** Filled at the midnight settlement. */
  health?: number;
  heightCm?: number;
}

export interface PremiumStore {
  v: 1;
  active: boolean;
  /** Last time the entitlement was confirmed (ms). */
  checkedAt: number;
  skins: string[];
  equipped: string | null;
  diary: DiaryEntry[];
}

export interface Skin {
  id: string;
  /** 1–12: the only month it can be collected. */
  month: number;
  /** Leaf colour (sRGB 0–1) and how strongly it replaces the species colour. */
  rgb: [number, number, number];
  k: number;
}

export const SKINS: Skin[] = [
  { id: 'plum', month: 1, rgb: [0.93, 0.62, 0.7], k: 0.75 },
  { id: 'peach', month: 2, rgb: [0.97, 0.5, 0.6], k: 0.75 },
  { id: 'sakura', month: 3, rgb: [1.0, 0.76, 0.84], k: 0.8 },
  { id: 'kapok', month: 4, rgb: [0.88, 0.22, 0.14], k: 0.75 },
  { id: 'jacaranda', month: 5, rgb: [0.6, 0.45, 0.9], k: 0.75 },
  { id: 'flame', month: 6, rgb: [0.98, 0.4, 0.12], k: 0.75 },
  { id: 'jade', month: 7, rgb: [0.25, 0.88, 0.62], k: 0.7 },
  { id: 'starlight', month: 8, rgb: [0.32, 0.5, 0.98], k: 0.7 },
  { id: 'osmanthus', month: 9, rgb: [0.98, 0.78, 0.3], k: 0.75 },
  { id: 'maple', month: 10, rgb: [0.9, 0.28, 0.1], k: 0.8 },
  { id: 'ginkgo', month: 11, rgb: [0.98, 0.84, 0.2], k: 0.8 },
  { id: 'frost', month: 12, rgb: [0.88, 0.94, 1.0], k: 0.7 },
];

export function skinById(id: string | null | undefined): Skin | null {
  return SKINS.find((s) => s.id === id) ?? null;
}

export function skinName(id: string): string {
  return tl(`skin.${id}`);
}

/** The skin collectable in the month of `date` (YYYY-MM-DD). */
export function skinOfMonth(date: string): Skin {
  const m = Number(date.slice(5, 7)) || 1;
  return SKINS.find((s) => s.month === m) ?? SKINS[0]!;
}

export function emptyPremium(): PremiumStore {
  return { v: 1, active: false, checkedAt: 0, skins: [], equipped: null, diary: [] };
}

export function parsePremium(raw: string | null): PremiumStore {
  const base = emptyPremium();
  if (!raw) return base;
  try {
    const d = JSON.parse(raw) as Partial<PremiumStore>;
    return {
      v: 1,
      active: d.active === true,
      checkedAt: Number(d.checkedAt) || 0,
      skins: Array.isArray(d.skins) ? d.skins.filter((s) => typeof s === 'string' && skinById(s)) : [],
      equipped: typeof d.equipped === 'string' && skinById(d.equipped) ? d.equipped : null,
      diary: Array.isArray(d.diary) ? d.diary.filter((e) => e && typeof e.date === 'string') : [],
    };
  } catch {
    return base;
  }
}

export function loadPremium(storage: Pick<Storage, 'getItem'> = localStorage): PremiumStore {
  return parsePremium(storage.getItem(PREMIUM_KEY));
}

export function savePremium(p: PremiumStore, storage: Pick<Storage, 'setItem'> = kvStorage): void {
  try {
    storage.setItem(PREMIUM_KEY, JSON.stringify(p));
  } catch {
    /* storage full / private mode */
  }
}

/** A subscriber collects this month's skin (once). Returns the new skin, or null. */
export function claimMonthlySkin(p: PremiumStore, date: string, extras = PREMIUM_EXTRAS): Skin | null {
  if (!extras || !p.active) return null;
  const s = skinOfMonth(date);
  if (p.skins.includes(s.id)) return null;
  p.skins.push(s.id);
  return s;
}

/** The skin the tree shows: the equipped one while subscribed (skins stay in the collection after a lapse). */
export function activeSkin(p: PremiumStore, extras = PREMIUM_EXTRAS): Skin | null {
  if (!extras || !p.active || !p.equipped || !p.skins.includes(p.equipped)) return null;
  return skinById(p.equipped);
}

export function equipSkin(p: PremiumStore, id: string | null): boolean {
  if (id !== null && !p.skins.includes(id)) return false;
  p.equipped = id;
  return true;
}

/** Real weather seen on `date` (live readings only — never simulated weather). Kept for everyone, viewed by members. */
export function noteDiary(p: PremiumStore, r: { date: string; place: string; tempC: number; code: number; hkoIcon?: number; events: WeatherEventId[]; treeName: string }, extras = PREMIUM_EXTRAS): void {
  if (!extras) return;
  const t = Math.round(r.tempC);
  if (!Number.isFinite(t)) return;
  let e = p.diary.find((x) => x.date === r.date);
  if (!e) {
    e = { date: r.date, place: r.place, tMax: t, tMin: t, code: r.code, events: [], treeName: r.treeName };
    p.diary.push(e);
    p.diary.sort((a, b) => a.date.localeCompare(b.date));
    if (p.diary.length > DIARY_MAX) p.diary.splice(0, p.diary.length - DIARY_MAX);
  }
  e.tMax = Math.max(e.tMax, t);
  e.tMin = Math.min(e.tMin, t);
  e.code = r.code;
  if (r.hkoIcon !== undefined) e.hkoIcon = r.hkoIcon;
  else delete e.hkoIcon;
  if (r.place) e.place = r.place;
  e.treeName = r.treeName;
  for (const ev of r.events) if (!e.events.includes(ev)) e.events.push(ev);
}

/** Midnight settlement: the tree's health / height that night (only for days with a real-weather entry). */
export function settleDiary(p: PremiumStore, s: { date: string; events: WeatherEventId[]; hAfter: number; heightAfter: number }): boolean {
  const e = p.diary.find((x) => x.date === s.date);
  if (!e) return false;
  e.health = Math.round(s.hAfter);
  e.heightCm = s.heightAfter;
  for (const ev of s.events) if (ev !== 'clear' && !e.events.includes(ev)) e.events.push(ev);
  return true;
}

/** Newest first, grouped by month (YYYY-MM). */
export function diaryByMonth(p: PremiumStore): { month: string; days: DiaryEntry[] }[] {
  const out: { month: string; days: DiaryEntry[] }[] = [];
  for (const e of [...p.diary].reverse()) {
    const m = e.date.slice(0, 7);
    const last = out[out.length - 1];
    if (last && last.month === m) last.days.push(e);
    else out.push({ month: m, days: [e] });
  }
  return out;
}
