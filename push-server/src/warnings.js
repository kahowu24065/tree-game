// HKO warnsum → per-category level, and the "new warning" diff (pure; unit-tested).
// Mapping follows tree-game src/hko.ts (mapWarning): CANCEL = not in force; TC1 standby, TC3 gale, TC8+ typhoon.

export const CATEGORIES = ['heat', 'rain', 'typhoon', 'cold'];

const RAIN = { WRAINA: 1, WRAINR: 2, WRAINB: 3 };
const TC = { TC1: 1, TC3: 2, TC8NE: 3, TC8SE: 3, TC8NW: 3, TC8SW: 3, TC9: 4, TC10: 5 };

const LABEL = {
  heat: () => '酷熱天氣警告',
  cold: () => '寒冷天氣警告',
  rain: (l) => ['', '黃色暴雨警告信號', '紅色暴雨警告信號', '黑色暴雨警告信號'][l],
  typhoon: (l) => ['', '一號戒備信號', '三號強風信號', '八號烈風或暴風信號', '九號烈風或暴風風力增強信號', '十號颶風信號'][l],
};

/** Levels in force now, e.g. { heat: 1, rain: 2, typhoon: 0, cold: 0 }. */
export function levelsFromWarnsum(data) {
  const out = { heat: 0, rain: 0, typhoon: 0, cold: 0 };
  if (!data || typeof data !== 'object') return out;
  for (const [group, raw] of Object.entries(data)) {
    if (!raw || typeof raw !== 'object' || raw.actionCode === 'CANCEL') continue;
    const code = raw.code || group;
    if (group === 'WHOT') out.heat = 1;
    else if (group === 'WCOLD') out.cold = 1;
    else if (group === 'WRAIN') out.rain = Math.max(out.rain, RAIN[code] ?? 1);
    else if (group === 'WTCSGNL') out.typhoon = Math.max(out.typhoon, TC[code] ?? 1);
  }
  return out;
}

/**
 * Categories issued or upgraded since `prev` (a downgrade/cancel only updates the state).
 * `prev` null = first run ever: record the state without notifying (no burst on deploy).
 */
export function diffLevels(prev, next) {
  if (!prev) return [];
  return CATEGORIES.filter((c) => (next[c] ?? 0) > (prev[c] ?? 0)).map((c) => ({ category: c, level: next[c] }));
}

/** Push text in the game's wording. */
export function messageFor({ category, level }) {
  const label = LABEL[category](level);
  const body = {
    heat: '快啲幫棵樹做額外澆水（酷熱澆水）！',
    rain: '快啲幫棵樹做暴雨疏水！',
    typhoon: level >= 3 ? '快啲幫棵樹加固，打木樁、綁防風繩！' : '留意風勢，記得幫棵樹加固！',
    cold: '快啲幫棵樹做保暖，鋪好樹皮乾葉！',
  }[category];
  return { title: `${label}生效！`, body, category, level };
}
