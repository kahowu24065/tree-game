// HKO warnsum → per-category level (pure; unit-tested). Mapping follows tree-game src/hko.ts / src/events.ts:
// CANCEL = not in force; TC1/TC3 low tier, TC8+ typhoon; WL (山泥傾瀉警告) = its own category, handled by 加固.

export const CATEGORIES = ['heat', 'rain', 'typhoon', 'cold', 'landslip'];
/** Categories the game handles with 加固 (wind / reinforcement). */
export const WIND_CATEGORIES = new Set(['typhoon', 'landslip']);

const RAIN = { WRAINA: 1, WRAINR: 2, WRAINB: 3 };
const TC = { TC1: 1, TC3: 2, TC8NE: 3, TC8SE: 3, TC8NW: 3, TC8SW: 3, TC9: 4, TC10: 5 };

const LABEL = {
  heat: () => '酷熱天氣警告',
  cold: () => '寒冷天氣警告',
  landslip: () => '山泥傾瀉警告',
  rain: (l) => ['', '黃色暴雨警告信號', '紅色暴雨警告信號', '黑色暴雨警告信號'][l],
  typhoon: (l) => ['', '一號戒備信號', '三號強風信號', '八號烈風或暴風信號', '九號烈風或暴風風力增強信號', '十號颶風信號'][l],
};
const SHORT = {
  heat: () => '酷熱天氣警告',
  cold: () => '寒冷天氣警告',
  landslip: () => '山泥傾瀉警告',
  rain: (l) => ['', '黃雨', '紅雨', '黑雨'][l],
  typhoon: (l) => ['', '一號風球', '三號風球', '八號風球', '九號風球', '十號風球'][l],
};

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

const ACTION_TEXT = {
  heat: '快啲幫棵樹做額外澆水（酷熱澆水）！',
  rain: '快啲幫棵樹做暴雨疏水！',
  cold: '快啲幫棵樹做保暖，鋪好樹皮乾葉！',
  landslip: '快啲幫棵樹加固！',
};

/** Issue push text in the game's wording (action call to action). */
export function messageFor({ category, level }) {
  const body = category === 'typhoon' ? (level >= 3 ? '快啲幫棵樹加固，打木樁、綁防風繩！' : '留意風勢，記得幫棵樹加固！') : ACTION_TEXT[category];
  return { title: `${LABEL[category](level)}生效！`, body, category, level };
}

/** Downgrade / cancel info text, e.g. 紅雨轉黃雨, 八號風球轉三號風球, 酷熱天氣警告已取消. */
export function dropMessageFor({ category, from, to }) {
  if (to > 0) {
    const title = `${SHORT[category](from)}轉${SHORT[category](to)}`;
    const body = category === 'typhoon' ? `天文台已改發${SHORT.typhoon(to)}，仍要留意風勢。` : `天文台已改發${SHORT[category](to)}，仍要留意天氣。`;
    return { title, body, category, level: to };
  }
  const title = category === 'typhoon' ? '熱帶氣旋警告信號已取消' : category === 'rain' ? '暴雨警告信號已取消' : `${SHORT[category](from)}已取消`;
  return { title, body: '天文台已經取消，棵樹可以鬆一口氣。', category, level: 0 };
}

/** HK follow-up text when the action is still undone ~2 h after the warning. */
export function reminderFor({ category, level }) {
  const m = messageFor({ category, level });
  return { ...m, title: m.title.replace('生效！', '仍然生效'), body: `棵樹仲未做應急行動：${m.body}` };
}

/** Real-life safety text for 風球／山泥傾瀉 before the tree reaches 青年樹 (no 加固 call to action). */
export function safetyText(category, hk = true) {
  if (category === 'landslip') return '現實中請注意安全：避免走近斜坡同擋土牆，留意天文台最新消息。';
  return hk ? '現實中請注意安全：遠離窗邊，留意天文台最新消息。' : '現實中請注意安全：遠離窗邊，留意當地最新天氣消息。';
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
export function treeNote(state, category, level, hk = true) {
  if (!state) return '';
  if (state.tree === 'dead' || state.alive === false) return '（你棵樹已經枯死，可以重新種過。）';
  if (state.tree === 'dying') return '（棵樹瀕死中，記得救返佢！）';
  if (WIND_CATEGORIES.has(category) && state.rUnlocked && typeof state.resist === 'number' && state.resist < collapseBelow(category, level, hk))
    return `（抗風力得 ${state.resist}，有倒塌風險！）`;
  return '';
}

/** Per-device message: safety text for wind before 青年樹, tree-state line for issue / reminder, drops unchanged. */
export function deviceMessage(base, state, kind, hk = true) {
  if (kind === 'drop') return base;
  if (kind === 'issue' && safetyOnly(state, base.category)) return { ...base, body: safetyText(base.category, hk) };
  return { ...base, body: base.body + treeNote(state, base.category, base.level, hk) };
}
