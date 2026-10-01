// HKO warnsum → per-category level (pure; unit-tested). Mapping follows tree-game src/hko.ts / src/events.ts:
// CANCEL = not in force; TC1/TC3 low tier, TC8+ typhoon; WL (山泥傾瀉警告) = its own category, handled by 加固.

import { HK_LABELS, str } from './i18n.js';

export const CATEGORIES = ['heat', 'rain', 'typhoon', 'cold', 'landslip'];
/** Categories the game handles with 加固 (wind / reinforcement). */
export const WIND_CATEGORIES = new Set(['typhoon', 'landslip']);

const RAIN = { WRAINA: 1, WRAINR: 2, WRAINB: 3 };
const TC = { TC1: 1, TC3: 2, TC8NE: 3, TC8SE: 3, TC8NW: 3, TC8SW: 3, TC9: 4, TC10: 5 };

/** Levels in force now, e.g. { heat: 1, rain: 2, typhoon: 0, cold: 0, landslip: 0 }. */
export function levelsFromWarnsum(data) {
  const out = { heat: 0, rain: 0, typhoon: 0, cold: 0, landslip: 0 };
  if (!data || typeof data !== 'object') return out;
  for (const [group, raw] of Object.entries(data)) {
    if (!raw || typeof raw !== 'object' || raw.actionCode === 'CANCEL') continue;
    const code = raw.code || group;
    if (group === 'WHOT') out.heat = 1;
    else if (group === 'WCOLD') out.cold = 1;
    else if (group === 'WL') out.landslip = 1;
    else if (group === 'WRAIN') out.rain = Math.max(out.rain, RAIN[code] ?? 1);
    else if (group === 'WTCSGNL') out.typhoon = Math.max(out.typhoon, TC[code] ?? 1);
  }
  return out;
}

/** v1 helper kept for tests: categories issued or upgraded since `prev` (null = first run, silent). */
export function diffLevels(prev, next) {
  if (!prev) return [];
  return CATEGORIES.filter((c) => (next[c] ?? 0) > (prev[c] ?? 0)).map((c) => ({ category: c, level: next[c] }));
}

/** Issue push text in the game's wording (action call to action), in the device's language. */
export function messageFor({ category, level }, loc = 'zh-HK', names = HK_LABELS) {
  const body = category === 'typhoon' ? str(level >= 3 ? 'act_typhoonHigh' : 'act_typhoonLow', loc) : str(`act_${category}`, loc);
  return { title: str('issue', loc, { label: names.label(category, level, loc) }), body, category, level };
}

/** Downgrade / cancel info text, e.g. 紅雨轉黃雨, 八號風球轉三號風球, 酷熱天氣警告已取消. */
export function dropMessageFor({ category, from, to }, loc = 'zh-HK', names = HK_LABELS) {
  if (to > 0) {
    const b = names.short(category, to, loc);
    const title = str('drop', loc, { a: names.short(category, from, loc), b });
    const body = str(category === 'typhoon' ? 'dropTyphoon' : 'dropOther', loc, { b });
    return { title, body, category, level: to };
  }
  const title = category === 'typhoon' ? str('cancelTyphoon', loc) : category === 'rain' ? str('cancelRain', loc) : str('cancel', loc, { a: names.short(category, from, loc) });
  return { title, body: str('cancelBody', loc), category, level: 0 };
}

/** HK follow-up text when the action is still undone ~2 h after the warning. */
export function reminderFor({ category, level }, loc = 'zh-HK', names = HK_LABELS) {
  const m = messageFor({ category, level }, loc, names);
  return { ...m, title: str('still', loc, { label: names.label(category, level, loc) }), body: str('reminder', loc, { body: m.body }) };
}

/** Real-life safety text for 風球／山泥傾瀉 before the tree reaches 青年樹 (no 加固 call to action). */
export function safetyText(category, hk = true, loc = 'zh-HK') {
  if (category === 'landslip') return str('safeLandslip', loc);
  return str(hk ? 'safeHk' : 'safeIntl', loc);
}

/** The game's 應急行動 for each push category (keys of the app's /state `done`). */
export const ACTION_FOR = { heat: 'heat', rain: 'drain', typhoon: 'reinforce', cold: 'warm', landslip: 'reinforce' };

/** Local date (YYYY-MM-DD) in a time zone. */
export function localDate(tz, now = Date.now()) {
  try {
    return new Date(now).toLocaleDateString('en-CA', { timeZone: tz || 'Asia/Hong_Kong' });
  } catch {
    return new Date(now).toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });
  }
}

const actionDone = (state, category, now) => Boolean(state) && state.day === localDate(state.tz, now) && state.done?.[ACTION_FOR[category]] === true;
const safetyOnly = (state, category) => WIND_CATEGORIES.has(category) && state?.rUnlocked === false;

/**
 * v1.4 rules. `kind`: 'issue' | 'reminder' | 'drop'.
 *  • drop (downgrade / cancel): always sent — it's information.
 *  • issue: always sent (dead / 瀕死 trees too), except when today's matching action is already done. A wind warning
 *    before 青年樹 is a safety notice, so it is always sent.
 *  • reminder: only while the action is still undone and doable (not before 青年樹 for wind, not for a dead tree).
 */
export function shouldNotify(state, category, now = Date.now(), kind = 'issue') {
  if (kind === 'drop') return true;
  if (kind === 'reminder' && state && (state.alive === false || state.tree === 'dead' || safetyOnly(state, category))) return false;
  if (kind === 'issue' && safetyOnly(state, category)) return true;
  return !actionDone(state, category, now);
}

/** 倒塌 threshold (R) for a wind level: HK T1/T3 and 山泥傾瀉 20, T8+ 40; non-HK 烈風 20, 狂風雷暴 25, 暴風 40. */
export function collapseBelow(category, level, hk = true) {
  if (category === 'landslip') return 20;
  if (hk) return level >= 3 ? 40 : 20;
  return [0, 20, 25, 40][level] ?? 40;
}

/** Short line about the tree's own state for issue / reminder pushes. */
export function treeNote(state, category, level, hk = true, loc = 'zh-HK') {
  if (!state) return '';
  if (state.tree === 'dead' || state.alive === false) return str('dead', loc);
  if (state.tree === 'dying') return str('dying', loc);
  if (WIND_CATEGORIES.has(category) && state.rUnlocked && typeof state.resist === 'number' && state.resist < collapseBelow(category, level, hk))
    return str('risk', loc, { r: state.resist });
  return '';
}

/** Per-device message: safety text for wind before 青年樹, tree-state line for issue / reminder, drops unchanged. */
export function deviceMessage(base, state, kind, hk = true, loc = 'zh-HK') {
  if (kind === 'drop') return base;
  if (kind === 'issue' && safetyOnly(state, base.category)) return { ...base, body: safetyText(base.category, hk, loc) };
  return { ...base, body: base.body + treeNote(state, base.category, base.level, hk, loc) };
}
