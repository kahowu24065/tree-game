/**
 * 1.4.36 language-independent stored text. Log lines (and the other few texts a save keeps) used to be stored only
 * as the finished string in whatever language was active when they were written, so switching language left old
 * lines in the old language. Now each stored string also gets its message form — key + params, params themselves
 * nested messages where they were translated pieces — and is rendered in the current language when shown.
 *
 * The message form is recovered by matching the finished string against the locale tables (exact value, else a
 * template whose placeholders become params; a candidate only counts when rendering it back gives the very same
 * string). That works for new lines at write time and for old saves, whose lines exist only as text.
 */
import { getLocale, LOCALES, t, tables, traceOf, withLocale, type Locale } from './index';

/** A param: as written, a message, or messages written back to back (e.g. 「今日：」 + the day's summary). */
export type MsgParam = string | number | Msg | (string | Msg)[];
export interface Msg {
  k: string;
  p?: Record<string, MsgParam>;
}
/** A stored text: message parts joined in order (plain strings stay as they are, e.g. separators). */
export type MsgSeq = (string | Msg)[];

/** Params that are names the player typed: never "translated" even if they happen to equal a table entry. */
const LITERAL_PARAMS = new Set(['treeName', 'title_raw']);
const NUMERIC = /^[-+−±]?\d[\d,.]*$/;
/** Placeholders named like constants (`{W_MAX}`) are always numbers. */
const CONSTANT = /^[A-Z][A-Z0-9_]+$/;
const MAX_DEPTH = 3;

type Part = { lit: string } | { name: string } | { plural: string; forms: string[] };
type Template = { key: string; prefix: string; suffix: string; literal: number; re: RegExp; groups: string[]; runs: string[][] };
type Index = { exact: Map<string, string>; templates: Template[] };

const indexes = new Map<Locale, Index>();
const cache = new Map<string, MsgSeq | null>();

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split a table value into literal text, `{name}` and `{n, plural, …}` pieces (same grammar as format()). */
function tokenize(text: string): Part[] | null {
  const parts: Part[] = [];
  let lit = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (c !== '{') {
      lit += c;
      i++;
      continue;
    }
    let depth = 0;
    let j = i;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    if (j >= text.length) return null;
    const body = text.slice(i + 1, j);
    const m = /^\s*(\w+)\s*(?:,\s*plural\s*,(.*))?$/s.exec(body);
    if (!m) {
      lit += text.slice(i, j + 1);
    } else {
      if (lit) parts.push({ lit });
      lit = '';
      if (m[2] !== undefined) {
        const forms: string[] = [];
        const re = /\s*(=?\w+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gs;
        let f: RegExpExecArray | null;
        while ((f = re.exec(m[2]))) forms.push(f[2]!);
        parts.push({ plural: m[1]!, forms });
      } else parts.push({ name: m[1]! });
    }
    i = j + 1;
  }
  if (lit) parts.push({ lit });
  return parts;
}

function compile(key: string, text: string): Template | null {
  const parts = tokenize(text);
  if (!parts || !parts.some((p) => !('lit' in p))) return null;
  const groups: string[] = [];
  /** Placeholders written back to back (`{p2}{p3}{p4}`): the regex split between them is only a first guess. */
  const runs: string[][] = [];
  let run: string[] = [];
  let src = '';
  let literal = 0;
  for (const p of parts) {
    if ('name' in p) run.push(p.name);
    else {
      if (run.length > 1) runs.push(run);
      run = [];
    }
    if ('lit' in p) {
      src += escapeRe(p.lit);
      literal += p.lit.length;
    } else if ('name' in p) {
      src += '([\\s\\S]*?)';
      groups.push(p.name);
    } else {
      const alts = p.forms.map((form) => {
        let alt = '';
        for (const piece of form.split(/(#|\{\w+\})/)) {
          if (piece === '#') {
            alt += '(-?\\d[\\d.,]*)';
            groups.push(p.plural);
          } else if (/^\{\w+\}$/.test(piece)) {
            alt += '([\\s\\S]*?)';
            groups.push(piece.slice(1, -1));
          } else alt += escapeRe(piece);
        }
        return alt;
      });
      src += `(?:${alts.join('|')})`;
    }
  }
  if (run.length > 1) runs.push(run);
  if (literal === 0) return null;
  const first = parts[0]!;
  const last = parts[parts.length - 1]!;
  try {
    return { key, prefix: 'lit' in first ? first.lit : '', suffix: 'lit' in last ? last.lit : '', literal, re: new RegExp(`^${src}$`), groups, runs };
  } catch {
    return null;
  }
}

const RANK = ['balance.', 'sim.', 'labels.', 'content.', 'animals.', 'nest.', 'species.', 'weather.', 'main.', 'guide.', 'ui.', 'hko.', 'warn.', 'name.'];
function rank(key: string): number {
  const i = RANK.findIndex((p) => key.startsWith(p));
  return i < 0 ? RANK.length : i;
}

function indexFor(l: Locale): Index {
  let idx = indexes.get(l);
  if (idx) return idx;
  const table = { ...tables()['zh-HK'], ...tables()[l] };
  const exact = new Map<string, string>();
  const templates: Template[] = [];
  for (const [key, value] of Object.entries(table)) {
    if (typeof value !== 'string' || !value) continue;
    if (!value.includes('{')) {
      // Two keys reading the same (English "Cold" = 寒冷 / 寒 / 冷): the game-data one is what log lines use.
      const had = exact.get(value);
      if (!had || rank(key) < rank(had)) exact.set(value, key);
      continue;
    }
    const tpl = compile(key, value);
    if (tpl) templates.push(tpl);
  }
  templates.sort((a, b) => b.literal - a.literal);
  idx = { exact, templates };
  indexes.set(l, idx);
  return idx;
}

function renderParam(p: MsgParam): string | number {
  if (Array.isArray(p)) return renderSeq(p);
  return typeof p === 'object' ? renderMsg(p) : p;
}

export function renderMsg(m: Msg): string {
  if (!m.p) return t(m.k);
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(m.p)) params[k] = renderParam(v);
  return t(m.k, params);
}

export function renderSeq(seq: MsgSeq): string {
  return seq.map((x) => (typeof x === 'string' ? x : renderMsg(x))).join('');
}

function paramFor(name: string, value: string, l: Locale, depth: number): MsgParam {
  if (!value || LITERAL_PARAMS.has(name) || NUMERIC.test(value)) return value;
  const one = matchOne(value, l, depth + 1);
  if (one && loose(one) === 0) return one;
  // A table word / prefix glued to a message: 「今日：」 + 「健康 ±0、…」.
  const exact = indexFor(l).exact;
  for (let i = 1; i < value.length; i++) {
    const head = exact.get(value.slice(0, i));
    if (!head) continue;
    const tail = matchOne(value.slice(i), l, depth + 1);
    if (tail && loose(tail) === 0) return [{ k: head }, tail];
  }
  return one ?? value;
}

function unresolved(name: string, v: MsgParam): boolean {
  return typeof v === 'string' && v !== '' && !LITERAL_PARAMS.has(name) && !NUMERIC.test(v);
}

/** Re-divide the text of back-to-back placeholders so that every piece is empty, a number or a known message. */
function resplit(run: string[], raw: Record<string, string>, p: Record<string, MsgParam>, l: Locale, depth: number): void {
  if (!run.some((n) => unresolved(n, p[n]!)) || run.length > 3) return;
  const all = run.map((n) => raw[n] ?? '').join('');
  const pieces = (s: string, k: number): string[][] => {
    if (k === 1) return [[s]];
    const out: string[][] = [];
    for (let i = 0; i <= s.length; i++) for (const rest of pieces(s.slice(i), k - 1)) out.push([s.slice(0, i), ...rest]);
    return out;
  };
  for (const split of pieces(all, run.length)) {
    const got = split.map((v, i) => paramFor(run[i]!, v, l, depth));
    if (got.every((v, i) => !unresolved(run[i]!, v))) {
      run.forEach((n, i) => {
        raw[n] = split[i]!;
        p[n] = got[i]!;
      });
      return;
    }
  }
}

/** One message for the whole string, or null. */
function matchOne(s: string, l: Locale, depth: number): Msg | null {
  const idx = indexFor(l);
  // Written just now: the key + params that produced it are known.
  const tr = traceOf(s, l);
  if (tr && depth <= MAX_DEPTH) {
    const p: Record<string, MsgParam> = {};
    for (const [name, v] of Object.entries(tr.p ?? {})) p[name] = typeof v === 'number' ? v : paramFor(name, String(v ?? ''), l, depth);
    const msg: Msg = tr.p ? { k: tr.k, p } : { k: tr.k };
    if (withLocale(l, () => renderMsg(msg)) === s) return msg;
  }
  const key = idx.exact.get(s);
  if (key) return { k: key };
  if (depth > MAX_DEPTH) return null;
  let best: { msg: Msg; score: number } | null = null;
  for (const tpl of idx.templates) {
    if (tpl.literal > s.length || !s.startsWith(tpl.prefix) || !s.endsWith(tpl.suffix)) continue;
    const m = tpl.re.exec(s);
    if (!m) continue;
    const raw: Record<string, string> = {};
    tpl.groups.forEach((name, i) => {
      const v = m[i + 1];
      if (v !== undefined && !(name in raw)) raw[name] = v;
    });
    if (Object.entries(raw).some(([name, v]) => CONSTANT.test(name) && !NUMERIC.test(v))) continue;
    const p: Record<string, MsgParam> = {};
    for (const [name, v] of Object.entries(raw)) p[name] = paramFor(name, v, l, depth);
    for (const r of tpl.runs) resplit(r, raw, p, l, depth);
    const msg: Msg = { k: tpl.key, p };
    // Only a candidate that renders back to the very same string counts; one whose params are all known wins at
    // once, otherwise keep the one with the fewest pieces left as plain text (those would not be translated).
    let got: Msg | null = null;
    if (withLocale(l, () => renderMsg(msg)) === s) got = msg;
    else {
      // Same template with every param kept as written (a nested guess did not round-trip).
      const flat: Msg = { k: tpl.key, p: raw };
      if (withLocale(l, () => renderMsg(flat)) === s) got = flat;
    }
    if (!got) continue;
    const twin = twins.get(got.k);
    if (twin) got = { ...got, k: twin(got) };
    const score = loose(got);
    if (score === 0) return got;
    if (!best || score < best.score) best = { msg: got, score };
  }
  return best?.msg ?? null;
}

/** Keys whose text is the same in some language: `pick` says which one a parsed message really is. */
const twins = new Map<string, (m: Msg) => string>();
export function registerTwins(keys: string[], pick: (m: Msg) => string): void {
  for (const k of keys) twins.set(k, pick);
}

/** How many params of `m` (nested too) are text that is neither a number, a name nor a known message. */
export function loose(m: Msg | string): number {
  if (typeof m === 'string') return 0;
  let n = 0;
  for (const [name, v] of Object.entries(m.p ?? {})) n += Array.isArray(v) ? v.reduce((a, x) => a + loose(x), 0) : typeof v === 'object' ? loose(v) : unresolved(name, v) ? 1 : 0;
  return n;
}

const seqLoose = (seq: MsgSeq) => seq.reduce((n, x) => n + loose(x), 0);

/** The message form of `s` written in locale `l`: one message, or messages joined by single spaces. */
export function parseIn(s: string, l: Locale): MsgSeq | null {
  const ck = `${l}\u0000${s}`;
  if (cache.has(ck)) return cache.get(ck)!;
  let out: MsgSeq | null = null;
  const one = s ? matchOne(s, l, 0) : null;
  if (one) out = [one];
  else {
    // Notes / morning summaries join several messages with spaces: split at the first space that works.
    for (let i = s.indexOf(' '); i > 0; i = s.indexOf(' ', i + 1)) {
      const left = matchOne(s.slice(0, i), l, 0);
      if (!left) continue;
      const rest = parseIn(s.slice(i + 1), l);
      if (rest) {
        out = [left, ' ', ...rest];
        break;
      }
    }
  }
  cache.set(ck, out);
  return out;
}

/** Try the current language first, then the others (an old save does not say which language wrote it). */
export function parseAny(s: string, prefer: Locale = getLocale()): { lang: Locale; seq: MsgSeq } | null {
  // zh-HK / zh-TW share many words, so a line may read in more than one: keep the reading with nothing left as
  // plain text (ties go to the current language).
  let best: { lang: Locale; seq: MsgSeq; score: number } | null = null;
  for (const l of [prefer, ...LOCALES.filter((x) => x !== prefer)]) {
    const seq = parseIn(s, l);
    if (!seq) continue;
    const score = seqLoose(seq);
    if (!best || score < best.score) best = { lang: l, seq, score };
    if (score === 0) break;
  }
  return best && { lang: best.lang, seq: best.seq };
}

/** Display a stored string in the current language (best effort; unknown text is shown as it is). */
export function localize(s: string | null | undefined): string {
  if (!s) return s ?? '';
  const got = parseAny(s);
  return got ? renderSeq(got.seq) : s;
}

/** A stored text with its message form: shown in the current language (as written when it has none). */
export function shown(raw: string, seq: MsgSeq | undefined, lang: string | undefined): string {
  if (!seq || lang === getLocale()) return raw;
  try {
    return renderSeq(seq);
  } catch {
    return raw;
  }
}

/** A log line's texts in the current language. */
export function logTexts(e: { text: string; title?: string; reward?: { text: string }; i18n?: { lang: string; text?: MsgSeq; title?: MsgSeq; reward?: MsgSeq } }): {
  text: string;
  title: string | undefined;
  reward: string | undefined;
} {
  const i = e.i18n;
  return {
    text: shown(e.text, i?.text, i?.lang),
    title: e.title === undefined ? undefined : shown(e.title, i?.title, i?.lang),
    reward: e.reward === undefined ? undefined : shown(e.reward.text, i?.reward, i?.lang),
  };
}
