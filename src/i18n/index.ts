/**
 * Lightweight i18n: one string table per locale, `t(key, params)` with `{name}` placeholders and an ICU-lite plural
 * form `{n, plural, one {# night} other {# nights}}`. zh-HK (colloquial written Cantonese) is the source table; the
 * others fall back to it key by key. Tables built at import time are registered with `live()`, so a change from 設定
 * rebuilds them in place (`switchLocale`) and re-renders — no reload (1.4.41).
 */
import en from './en';
import zhCN from './zh-CN';
import zhHK from './zh-HK';
import zhTW from './zh-TW';
import { kvSet } from '../native/kv';

export type Locale = 'zh-TW' | 'zh-HK' | 'zh-CN' | 'en';
export const LOCALES: readonly Locale[] = ['zh-TW', 'zh-HK', 'zh-CN', 'en'];
/** Each option in its own language (the picker never needs translating). */
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-TW': '中文（台灣）',
  'zh-HK': '中文（香港、澳門）',
  'zh-CN': '中文（简体）',
  en: 'English',
};
export const LOCALE_KEY = 'sekai-tree-locale';

const TABLES: Record<Locale, Record<string, string>> = { 'zh-HK': zhHK, 'zh-TW': zhTW, 'zh-CN': zhCN, en };

/** Device / browser language → game locale. zh-HK/MO → HK, zh-TW → TW, zh-CN/SG/Hans → CN, other zh → HK, else en. */
export function localeFromLanguage(tag: string | null | undefined): Locale {
  const l = (tag ?? '').toLowerCase().replace(/_/g, '-');
  if (!l.startsWith('zh')) return 'en';
  if (/-(hk|mo)\b/.test(l)) return 'zh-HK';
  if (/-tw\b/.test(l)) return 'zh-TW';
  if (/-(cn|sg)\b|hans/.test(l)) return 'zh-CN';
  if (/hant/.test(l)) return 'zh-HK';
  return 'zh-HK';
}

function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (LOCALES as readonly string[]).includes(x);
}

function detect(): Locale {
  // Node (tests, scripts): the source language, so text assertions stay stable.
  if (typeof window === 'undefined') return 'zh-HK';
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  const langs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  return localeFromLanguage(langs[0]);
}

let current: Locale = detect();

export function getLocale(): Locale {
  return current;
}

/** Tests / tools: switch the table without touching storage. */
export function useLocale(l: Locale): void {
  current = l;
  if (typeof document !== 'undefined') document.documentElement.lang = l === 'en' ? 'en' : l === 'zh-CN' ? 'zh-Hans' : l === 'zh-TW' ? 'zh-Hant-TW' : 'zh-Hant-HK';
}
useLocale(current);

/** 1.4.36: run `fn` with another table active (no storage / document change), e.g. to verify a stored message. */
export function withLocale<T>(l: Locale, fn: () => T): T {
  const was = current;
  current = l;
  try {
    return fn();
  } finally {
    current = was;
  }
}

/** Save the player's choice. The caller reloads so every table is rebuilt in the new language. */
export function saveLocale(l: Locale): void {
  try {
    kvSet(LOCALE_KEY, l);
  } catch {
    /* ignore */
  }
}

export function isChinese(l: Locale = current): boolean {
  return l !== 'en';
}

type Params = Record<string, unknown>;

function plural(n: number, forms: Record<string, string>): string {
  const cat = current === 'en' ? (n === 1 ? 'one' : 'other') : 'other';
  return (forms[`=${n}`] ?? forms[cat] ?? forms.other ?? '').replace(/#/g, String(n));
}

/** Expand `{name}` and `{n, plural, one {...} other {...}}`. */
export function format(text: string, params?: Params): string {
  if (!params) return text;
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (c !== '{') {
      out += c;
      i++;
      continue;
    }
    // find the matching brace
    let depth = 0;
    let j = i;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    const body = text.slice(i + 1, j);
    const m = /^\s*(\w+)\s*(?:,\s*plural\s*,(.*))?$/s.exec(body);
    if (!m || !(m[1]! in params)) {
      out += text.slice(i, j + 1);
    } else if (m[2] !== undefined) {
      const forms: Record<string, string> = {};
      const re = /\s*(=?\w+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gs;
      let f: RegExpExecArray | null;
      while ((f = re.exec(m[2]))) forms[f[1]!] = f[2]!;
      out += format(plural(Number(params[m[1]!]), forms), params);
    } else out += String(params[m[1]!]);
    i = j + 1;
  }
  return out;
}

/* ---------- 1.4.55 height / length unit ---------- */

/**
 * 高度單位: `metric` (default) shows 厘米 below 1 m and 米 from 1 m (en cm / m); `imperial` shows inches below 1 ft and
 * feet + inches above (「5 英尺 3 英寸」, en "5 ft 3 in"). Every table string writes lengths as `<number> 厘米|米`
 * (`cm|m`), so t() converts its finished output in one place: HUD, stats, milestones, badges, log, share text, guide
 * and notifications all follow, and a change applies instantly (live tables are rebuilt like a language change).
 * A word joiner (U+2060) right after a number keeps it as written (e.g. 「取最接近嘅 10 米」, a rule stated in metres).
 * Other units (毫米 rain, °C, km/h…) are never touched.
 */
export type HeightUnit = 'metric' | 'imperial';
export const HEIGHT_UNITS: readonly HeightUnit[] = ['metric', 'imperial'];
export const UNIT_KEY = 'sekai-tree-height-unit';

export function isHeightUnit(x: unknown): x is HeightUnit {
  return x === 'metric' || x === 'imperial';
}

/** The saved choice (default metric). */
export function loadHeightUnit(): HeightUnit {
  if (typeof localStorage === 'undefined') return 'metric';
  try {
    const v = localStorage.getItem(UNIT_KEY);
    return isHeightUnit(v) ? v : 'metric';
  } catch {
    return 'metric';
  }
}

let unit: HeightUnit = loadHeightUnit();

export function getHeightUnit(): HeightUnit {
  return unit;
}

/** Switch the unit (no storage write). Callers rebuild live tables / re-render (see main.ts applyHeightUnit). */
export function useHeightUnit(u: HeightUnit): void {
  unit = u;
}

export function saveHeightUnit(u: HeightUnit): void {
  try {
    kvSet(UNIT_KEY, u);
  } catch {
    /* ignore */
  }
}

const UNIT_WORDS: Record<Locale, { cm: string; m: string; inch: string; ft: string; sep: string }> = {
  'zh-HK': { cm: '厘米', m: '米', inch: '英寸', ft: '英尺', sep: ' ' },
  'zh-TW': { cm: '厘米', m: '米', inch: '英吋', ft: '英呎', sep: ' ' },
  'zh-CN': { cm: '厘米', m: '米', inch: '英寸', ft: '英尺', sep: ' ' },
  en: { cm: 'cm', m: 'm', inch: 'in', ft: 'ft', sep: ' ' },
};

function trim0(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\.0+$/, '');
}

/** A length in the given unit and language: metric 「45 厘米」/「1.2 米」, imperial 「5.9 英寸」/「5 英尺 3 英寸」/「394 英尺」. */
export function formatLength(cm: number, u: HeightUnit = unit, l: Locale = current): string {
  const w = UNIT_WORDS[l];
  if (u === 'metric') return cm < 100 ? `${Math.round(cm)}${w.sep}${w.cm}` : `${(cm / 100).toFixed(1)}${w.sep}${w.m}`;
  return imperial(cm, w);
}

function imperial(cm: number, w: (typeof UNIT_WORDS)[Locale]): string {
  const inches = cm / 2.54;
  if (Math.abs(inches) < 11.95) return `${trim0(inches, Math.abs(inches) < 10 ? 1 : 0)}${w.sep}${w.inch}`;
  const total = Math.round(inches);
  if (total >= 1200) return `${Math.round(inches / 12)}${w.sep}${w.ft}`;
  const ft = Math.floor(total / 12);
  const rest = total - ft * 12;
  return rest === 0 ? `${ft}${w.sep}${w.ft}` : `${ft}${w.sep}${w.ft} ${rest}${w.sep}${w.inch}`;
}

const NUM = String.raw`(\d+(?:\.\d+)?)`;
const LEN_RE: Record<'zh' | 'en', RegExp> = {
  // 毫米 / 公里 can't match: the unit has to follow the number directly (optionally one space).
  zh: new RegExp(String.raw`${NUM}(?:\s?([–~-])\s?${NUM})?\s?(厘米|米)`, 'g'),
  en: new RegExp(String.raw`${NUM}(?:\s?([–-])\s?${NUM})?[ \u00a0](cm|m|metres?|meters?)(?![\w²³/])`, 'g'),
};

/** Convert every `<number> 厘米|米` (`cm|m`) in finished text to the unit (metric: 100 厘米 and up become 米). */
export function convertLengths(text: string, u: HeightUnit = unit, l: Locale = current): string {
  if (!/\d/.test(text)) return text;
  const w = UNIT_WORDS[l];
  return text.replace(LEN_RE[l === 'en' ? 'en' : 'zh'], (all, a: string, dash: string | undefined, b: string | undefined, word: string) => {
    const toCm = (x: string) => Number(x) * (word === w.cm || word === 'cm' ? 1 : 100);
    if (u === 'metric') {
      if (b !== undefined || !(word === 'cm' || word === w.cm)) return all;
      const cm = toCm(a);
      return cm >= 100 ? `${(cm / 100).toFixed(1)}${w.sep}${w.m}` : all;
    }
    if (b === undefined) return imperial(toCm(a), w);
    const lo = toCm(a) / 2.54;
    const hi = toCm(b) / 2.54;
    if (hi < 11.95) return `${trim0(lo, lo < 10 ? 1 : 0)}${dash}${trim0(hi, hi < 10 ? 1 : 0)}${w.sep}${w.inch}`;
    return `${Math.round(lo / 12)}${dash}${Math.round(hi / 12)}${w.sep}${w.ft}`;
  });
}

export function has(key: string, l: Locale = current): boolean {
  return key in TABLES[l];
}

/**
 * 1.4.36: which key + params produced a recent short string (so a log line can be stored as its message even
 * when two keys happen to read the same, e.g. English "Cold"). Bounded; long HTML is not kept.
 */
const TRACE_MAX = 3000;
const TRACE_MAX_LEN = 400;
const traced = new Map<string, { k: string; p?: Params }>();
export function traceOf(s: string, l: Locale = current): { k: string; p?: Params } | undefined {
  return traced.get(`${l}\u0000${s}`);
}

export function t(key: string, params?: Params): string {
  const text = TABLES[current][key] ?? zhHK[key] ?? key;
  const out = convertLengths(format(text, params));
  if (out.length <= TRACE_MAX_LEN) {
    if (traced.size >= TRACE_MAX) traced.clear();
    traced.set(`${current}\u0000${out}`, { k: key, p: params });
  }
  return out;
}


/** A runtime name from an official feed (station, district) shown in the player's language when the table knows it. */
export function tName<T extends string | null | undefined>(name: T): T {
  if (!name) return name;
  const key = `name.${name}`;
  return (TABLES[current][key] ?? name) as T;
}

export function tables(): Readonly<Record<Locale, Record<string, string>>> {
  return TABLES;
}

/**
 * 1.4.41: tables built at import time with `t()` (species, events, labels…) are registered here, so a language change
 * can rebuild them **in place** — same objects/arrays, new strings — and the app re-renders without a reload.
 */
const liveTables: { target: object; build: () => object }[] = [];

export function live<T extends object>(build: () => T): T {
  const target = build();
  liveTables.push({ target, build });
  return target;
}

function refill(target: Record<string, unknown>, fresh: Record<string, unknown>): void {
  if (Array.isArray(target) && Array.isArray(fresh) && target.length !== fresh.length) target.length = fresh.length;
  for (const k of Object.keys(fresh)) {
    const a = target[k];
    const b = fresh[k];
    if (a && b && typeof a === 'object' && typeof b === 'object' && !(a instanceof RegExp)) refill(a as Record<string, unknown>, b as Record<string, unknown>);
    else target[k] = b;
  }
}

const localeListeners: (() => void)[] = [];

/** DOM built once (e.g. the animal HUD) re-labels itself here after a language change. */
export function onLocaleChange(fn: () => void): void {
  localeListeners.push(fn);
}

/** Switch the active table and rebuild every live table in the new language (no storage write; see saveLocale). */
export function switchLocale(l: Locale): void {
  useLocale(l);
  for (const { target, build } of liveTables) refill(target as Record<string, unknown>, build() as Record<string, unknown>);
  for (const fn of localeListeners) fn();
}
