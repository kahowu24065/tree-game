import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';
import { format, localeFromLanguage, LOCALES, t, tables, useLocale } from '../src/i18n';

/** Top-level `{name}` / `{name, plural, …}` placeholders (plural bodies are text, not params). */
function params(s: string): string[] {
  const out = new Set<string>();
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') {
      if (depth === 0) {
        const m = /^\w+/.exec(s.slice(i + 1));
        if (m) out.add(m[0]);
      }
      depth++;
    } else if (s[i] === '}') depth = Math.max(0, depth - 1);
  }
  return [...out].sort();
}

const tags = (s: string) => (s.match(/<\/?[a-z][\w-]*/gi) ?? []).join(' ');

describe('i18n tables', () => {
  const T = tables();
  const source = T['zh-HK'];

  it('every key exists in every locale', () => {
    for (const l of LOCALES) {
      const missing = Object.keys(source).filter((k) => !(k in T[l]));
      expect(missing, l).toEqual([]);
    }
  });

  it('placeholders and HTML tags match the zh-HK source', () => {
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(source)) {
        const tr = T[l][k]!;
        expect(params(tr), `${l} ${k}`).toEqual(params(v));
        expect(tags(tr), `${l} ${k}`).toBe(tags(v));
      }
    }
  });

  it('English has no Chinese characters', () => {
    const cjk = Object.entries(T.en).filter(([k, v]) => !k.startsWith('name.') && /[\u3400-\u9fff]/.test(v));
    expect(cjk).toEqual([]);
  });
});

describe('i18n helpers', () => {
  afterEach(() => useLocale('zh-HK'));

  it('device language → locale', () => {
    expect(localeFromLanguage('zh-HK')).toBe('zh-HK');
    expect(localeFromLanguage('zh-Hant-MO')).toBe('zh-HK');
    expect(localeFromLanguage('zh-TW')).toBe('zh-TW');
    expect(localeFromLanguage('zh-Hans-CN')).toBe('zh-CN');
    expect(localeFromLanguage('zh_SG')).toBe('zh-CN');
    expect(localeFromLanguage('zh')).toBe('zh-HK');
    expect(localeFromLanguage('en-GB')).toBe('en');
    expect(localeFromLanguage('ja-JP')).toBe('en');
    expect(localeFromLanguage(undefined)).toBe('en');
  });

  it('format: params and English plurals', () => {
    useLocale('en');
    const p = '{n, plural, one {# night} other {# nights}}';
    expect(format(p, { n: 1 })).toBe('1 night');
    expect(format(p, { n: 3 })).toBe('3 nights');
    expect(format('{a} and {b}', { a: 'x' })).toBe('x and {b}');
    expect(t('sim.148', { gap: 1, p1: 50, p2: 60, p3: '+', p4: 2 })).toMatch(/^You were away for 1 day\./);
  });

  it('switches table and falls back to zh-HK then the key', () => {
    useLocale('en');
    expect(t('ui.115')).toBe('Water');
    useLocale('zh-CN');
    expect(t('ui.115')).toBe('浇水');
    expect(t('no.such.key')).toBe('no.such.key');
  });
});

/** No hard-coded Chinese in UI code: every CJK string literal must live in a locale table, except data below. */
describe('no hard-coded Chinese in src', () => {
  const ROOT = path.resolve(__dirname, '../src');
  // Data matched against official feeds / old saves, not shown as UI copy (see each file).
  const ALLOW: Record<string, RegExp[]> = {
    'hko.ts': [/./], // HKO station names + psr codes + "級" regex: matched against the Observatory's Chinese API
    'smg.ts': [/./], // SMG station names (shown via tName) + Chinese XML parse patterns
    'cwa.ts': [/^臺灣$/, /特報|警報|資訊|訊息|燈號|^(黃|橙|紅)色$/], // place fallback (tName); CWA warning names matched to warn.* keys
    'presets.ts': [/^(中西區|油尖旺|沙田|離島區)$/], // HKO rainfall district names, matched against rhrread
    'weather.ts': [/^(澳門|香港|天晴|陽光)$/, /陽光|區/], // place names via tName; HKO-text mapping regexes
    'storage.ts': [/./], // migrations rewriting text in old saves
    'ui.ts': [/健康/], // regex parsing health marks out of old log text
    'three/scene3d.ts': [/./], // dev-only scale overlay
  };
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
        if (!['i18n', 'dev'].includes(f)) walk(p);
      } else if (p.endsWith('.ts')) files.push(p);
    }
  };
  walk(ROOT);

  it('every CJK literal is a locale-table entry or justified data', () => {
    const bad: string[] = [];
    for (const file of files) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (n: ts.Node) => {
        let text: string | undefined;
        if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) text = n.text;
        else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) text = n.text;
        else if (ts.isRegularExpressionLiteral(n)) text = n.text;
        if (text && /[\u3400-\u9fff]/.test(text)) {
          const allow = ALLOW[rel];
          if (!allow?.some((re) => re.test(text!))) bad.push(`${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1} ${text.slice(0, 30)}`);
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    expect(bad).toEqual([]);
  });
});
