/**
 * Lightweight i18n: one string table per locale, `t(key, params)` with `{name}` placeholders and an ICU-lite plural
 * form `{n, plural, one {# night} other {# nights}}`. zh-HK (colloquial written Cantonese) is the source table; the
 * others fall back to it key by key. The locale is fixed at start-up (data tables are built at import time), so a
 * change from 設定 saves the choice and reloads the page.
 */
import en from './en';
import zhCN from './zh-CN';
import zhHK from './zh-HK';
import zhTW from './zh-TW';

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

/** Save the player's choice. The caller reloads so every table is rebuilt in the new language. */
export function saveLocale(l: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, l);
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

export function has(key: string, l: Locale = current): boolean {
  return key in TABLES[l];
}

export function t(key: string, params?: Params): string {
  const text = TABLES[current][key] ?? zhHK[key] ?? key;
  return format(text, params);
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
