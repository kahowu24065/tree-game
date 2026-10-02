// Push text per device language (the app sends `locale` in /register and every /state).
// zh-HK (colloquial Cantonese) is the source wording; zh-TW / zh-CN are written Mandarin; en uses the official
// English warning names (HKO / SMG / CWA). Every builder takes a locale and falls back to zh-HK.

export const LOCALES = ['zh-HK', 'zh-TW', 'zh-CN', 'en'];

/** Any tag → one of LOCALES (null / unknown → zh-HK, the app's original language). */
export function normLocale(tag) {
  if (LOCALES.includes(tag)) return tag;
  const l = String(tag ?? '').toLowerCase().replace(/_/g, '-');
  if (!l) return 'zh-HK';
  if (!l.startsWith('zh')) return 'en';
  if (/-(hk|mo)\b/.test(l)) return 'zh-HK';
  if (/-tw\b/.test(l)) return 'zh-TW';
  if (/-(cn|sg)\b|hans/.test(l)) return 'zh-CN';
  return 'zh-HK';
}

/** A device record's locale: the latest /state wins over /register. */
export const recordLocale = (r) => normLocale(r?.state?.locale ?? r?.locale);

export function fmt(s, p = {}) {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
}

const HK_LABEL = {
  'zh-HK': { heat: '酷熱天氣警告', cold: '寒冷天氣警告', landslip: '山泥傾瀉警告', rain: ['', '黃色暴雨警告信號', '紅色暴雨警告信號', '黑色暴雨警告信號'], typhoon: ['', '一號戒備信號', '三號強風信號', '八號烈風或暴風信號', '九號烈風或暴風風力增強信號', '十號颶風信號'] },
  'zh-CN': { heat: '酷热天气警告', cold: '寒冷天气警告', landslip: '山泥倾泻警告', rain: ['', '黄色暴雨警告信号', '红色暴雨警告信号', '黑色暴雨警告信号'], typhoon: ['', '一号戒备信号', '三号强风信号', '八号烈风或暴风信号', '九号烈风或暴风风力增强信号', '十号飓风信号'] },
  en: { heat: 'Very Hot Weather Warning', cold: 'Cold Weather Warning', landslip: 'Landslip Warning', rain: ['', 'Amber Rainstorm Warning Signal', 'Red Rainstorm Warning Signal', 'Black Rainstorm Warning Signal'], typhoon: ['', 'Standby Signal No. 1', 'Strong Wind Signal No. 3', 'No. 8 Gale or Storm Signal', 'Increasing Gale or Storm Signal No. 9', 'Hurricane Signal No. 10'] },
};
HK_LABEL['zh-TW'] = HK_LABEL['zh-HK'];
const HK_SHORT = {
  'zh-HK': { heat: '酷熱天氣警告', cold: '寒冷天氣警告', landslip: '山泥傾瀉警告', rain: ['', '黃雨', '紅雨', '黑雨'], typhoon: ['', '一號風球', '三號風球', '八號風球', '九號風球', '十號風球'] },
  'zh-TW': { heat: '酷熱天氣警告', cold: '寒冷天氣警告', landslip: '山泥傾瀉警告', rain: ['', '黃雨', '紅雨', '黑雨'], typhoon: ['', '一號風球', '三號風球', '八號風球', '九號風球', '十號風球'] },
  'zh-CN': { heat: '酷热天气警告', cold: '寒冷天气警告', landslip: '山泥倾泻警告', rain: ['', '黄雨', '红雨', '黑雨'], typhoon: ['', '一号风球', '三号风球', '八号风球', '九号风球', '十号风球'] },
  en: { heat: 'Very Hot Weather Warning', cold: 'Cold Weather Warning', landslip: 'Landslip Warning', rain: ['', 'Amber Rain', 'Red Rain', 'Black Rain'], typhoon: ['', 'Signal No. 1', 'Signal No. 3', 'Signal No. 8', 'Signal No. 9', 'Signal No. 10'] },
};
const pick = (table, cat, level) => (Array.isArray(table[cat]) ? table[cat][level] : table[cat]) ?? '';
export const hkLabel = (cat, level, loc) => pick(HK_LABEL[normLocale(loc)], cat, level);
export const hkShort = (cat, level, loc) => pick(HK_SHORT[normLocale(loc)], cat, level);

/** Non-HK (Open-Meteo) event names, same as the app's INTL labels per language. */
const INTL_LABEL = {
  'zh-HK': { heat: '酷熱', cold: '寒冷', rain: ['', '大雨', '豪雨'], typhoon: ['', '烈風', '狂風雷暴', '暴風'] },
  'zh-TW': { heat: '酷熱', cold: '寒冷', rain: ['', '大雨', '豪雨'], typhoon: ['', '烈風', '狂風雷暴', '暴風'] },
  'zh-CN': { heat: '酷热', cold: '寒冷', rain: ['', '大雨', '豪雨'], typhoon: ['', '烈风', '狂风雷暴', '暴风'] },
  en: { heat: 'Extreme heat', cold: 'Cold', rain: ['', 'Heavy rain', 'Torrential rain'], typhoon: ['', 'Gale', 'Severe thunderstorm', 'Violent storm'] },
};
export const intlLabel = (cat, level, loc) => pick(INTL_LABEL[normLocale(loc)], cat, Math.min(level, cat === 'rain' ? 2 : 3));

const S = {
  'zh-HK': {
    act_heat: '快啲幫棵樹做額外澆水（酷熱澆水）！', act_rain: '快啲幫棵樹做暴雨疏水！', act_rainIntl: '快啲幫棵樹做大雨疏水！',
    act_cold: '快啲幫棵樹做保暖，鋪好樹皮乾葉！', act_landslip: '快啲幫棵樹加固！', act_typhoonHigh: '快啲幫棵樹加固，打木樁、綁防風繩！', act_typhoonLow: '留意風勢，記得幫棵樹加固！',
    issue: '{label}生效！', still: '{label}仍然生效', reminder: '棵樹仲未做應急行動：{body}',
    drop: '{a}轉{b}', dropTyphoon: '天文台已改發{b}，仍要留意風勢。', dropOther: '天文台已改發{b}，仍要留意天氣。',
    cancelTyphoon: '熱帶氣旋警告信號已取消', cancelRain: '暴雨警告信號已取消', cancel: '{a}已取消', cancelBody: '天文台已經取消，棵樹可以鬆一口氣。',
    safeLandslip: '現實中請注意安全：避免走近斜坡同擋土牆，留意天文台最新消息。', safeHk: '現實中請注意安全：遠離窗邊，留意天文台最新消息。', safeIntl: '現實中請注意安全：遠離窗邊，留意當地最新天氣消息。',
    dead: '（你棵樹已經枯死，可以重新種過。）', dying: '（棵樹瀕死中，記得救返佢！）', risk: '（抗風力得 {r}，有倒塌風險！）',
    intlIssue: '你嗰度有{label}天氣！', intlStill: '{label}仲未完', intlDropBody: '天氣有啲好轉，但仍要留意。', intlEnd: '你嗰度{a}天氣已完結', intlEndBody: '天氣好轉咗，棵樹可以鬆一口氣。',
    twIssue: '中央氣象署：{name}', twStill: '{name}仍然生效', twGeneric: '天氣警特報', twLower: '較低等級', twDropBody: '中央氣象署已調低等級，仍要留意天氣。', twEnd: '{a}已解除', twEndBody: '中央氣象署已經解除，棵樹可以鬆一口氣。',
    hko: '天文台', smg: '地球物理氣象局',
  },
  'zh-TW': {
    act_heat: '快幫這棵樹額外澆水（酷熱澆水）！', act_rain: '快幫這棵樹做暴雨疏水！', act_rainIntl: '快幫這棵樹做大雨疏水！',
    act_cold: '快幫這棵樹保暖，鋪好樹皮和乾葉！', act_landslip: '快幫這棵樹加固！', act_typhoonHigh: '快幫這棵樹加固，打木樁、綁防風繩！', act_typhoonLow: '留意風勢，記得幫這棵樹加固！',
    issue: '{label}生效！', still: '{label}仍然生效', reminder: '這棵樹還沒做應急行動：{body}',
    drop: '{a}轉為{b}', dropTyphoon: '天文台已改發{b}，仍要留意風勢。', dropOther: '天文台已改發{b}，仍要留意天氣。',
    cancelTyphoon: '熱帶氣旋警告信號已取消', cancelRain: '暴雨警告信號已取消', cancel: '{a}已取消', cancelBody: '天文台已經取消，這棵樹可以鬆一口氣。',
    safeLandslip: '現實中請注意安全：避免靠近斜坡和擋土牆，留意天文台最新消息。', safeHk: '現實中請注意安全：遠離窗邊，留意天文台最新消息。', safeIntl: '現實中請注意安全：遠離窗邊，留意當地最新天氣消息。',
    dead: '（你的樹已經枯死，可以重新種一棵。）', dying: '（這棵樹正在瀕死，記得救回它！）', risk: '（抗風力只有 {r}，有倒塌風險！）',
    intlIssue: '你那裡有{label}天氣！', intlStill: '{label}還沒結束', intlDropBody: '天氣有些好轉，但仍要留意。', intlEnd: '你那裡的{a}天氣已結束', intlEndBody: '天氣好轉了，這棵樹可以鬆一口氣。',
    twIssue: '中央氣象署：{name}', twStill: '{name}仍然生效', twGeneric: '天氣警特報', twLower: '較低等級', twDropBody: '中央氣象署已調低等級，仍要留意天氣。', twEnd: '{a}已解除', twEndBody: '中央氣象署已經解除，這棵樹可以鬆一口氣。',
    hko: '天文台', smg: '地球物理氣象局',
  },
  'zh-CN': {
    act_heat: '快帮这棵树额外浇水（酷热浇水）！', act_rain: '快帮这棵树做暴雨疏水！', act_rainIntl: '快帮这棵树做大雨疏水！',
    act_cold: '快帮这棵树保暖，铺好树皮和干叶！', act_landslip: '快帮这棵树加固！', act_typhoonHigh: '快帮这棵树加固，打木桩、绑防风绳！', act_typhoonLow: '留意风势，记得帮这棵树加固！',
    issue: '{label}生效！', still: '{label}仍然生效', reminder: '这棵树还没做应急行动：{body}',
    drop: '{a}转为{b}', dropTyphoon: '天文台已改发{b}，仍要留意风势。', dropOther: '天文台已改发{b}，仍要留意天气。',
    cancelTyphoon: '热带气旋警告信号已取消', cancelRain: '暴雨警告信号已取消', cancel: '{a}已取消', cancelBody: '天文台已经取消，这棵树可以松一口气。',
    safeLandslip: '现实中请注意安全：避免靠近斜坡和挡土墙，留意天文台最新消息。', safeHk: '现实中请注意安全：远离窗边，留意天文台最新消息。', safeIntl: '现实中请注意安全：远离窗边，留意当地最新天气消息。',
    dead: '（你的树已经枯死，可以重新种一棵。）', dying: '（这棵树正在濒死，记得救回它！）', risk: '（抗风力只有 {r}，有倒塌风险！）',
    intlIssue: '你那里有{label}天气！', intlStill: '{label}还没结束', intlDropBody: '天气有些好转，但仍要留意。', intlEnd: '你那里的{a}天气已结束', intlEndBody: '天气好转了，这棵树可以松一口气。',
    twIssue: '中央气象署：{name}', twStill: '{name}仍然生效', twGeneric: '天气警特报', twLower: '较低等级', twDropBody: '中央气象署已调低等级，仍要留意天气。', twEnd: '{a}已解除', twEndBody: '中央气象署已经解除，这棵树可以松一口气。',
    hko: '天文台', smg: '地球物理气象局',
  },
  en: {
    act_heat: 'Give your tree an extra watering (Heat watering) now!', act_rain: 'Do Rainstorm drainage for your tree now!', act_rainIntl: 'Do Heavy-rain drainage for your tree now!',
    act_cold: 'Keep your tree warm now: spread bark and dry leaves around the roots!', act_landslip: 'Reinforce your tree now!', act_typhoonHigh: 'Reinforce your tree now: stake it and tie windbreak ropes!', act_typhoonLow: 'Watch the wind and remember to reinforce your tree!',
    issue: '{label} in force!', still: '{label} still in force', reminder: "Your tree's emergency action isn't done yet: {body}",
    drop: '{a} changed to {b}', dropTyphoon: 'The Observatory has changed to {b}. Keep watching the wind.', dropOther: 'The Observatory has changed to {b}. Keep watching the weather.',
    cancelTyphoon: 'Tropical Cyclone Warning Signals cancelled', cancelRain: 'Rainstorm Warning Signal cancelled', cancel: '{a} cancelled', cancelBody: 'The Observatory has cancelled it. Your tree can breathe a sigh of relief.',
    safeLandslip: 'Stay safe in real life: keep away from slopes and retaining walls, and follow the latest Observatory news.', safeHk: 'Stay safe in real life: keep away from windows and follow the latest Observatory news.', safeIntl: 'Stay safe in real life: keep away from windows and follow the latest local weather news.',
    dead: ' (Your tree has died; you can plant a new one.)', dying: ' (Your tree is dying. Remember to save it!)', risk: ' (Wind resistance is only {r}: risk of collapse!)',
    intlIssue: '{label} where you are!', intlStill: '{label} not over yet', intlDropBody: 'The weather is improving a little, but stay alert.', intlEnd: '{a} where you are has ended', intlEndBody: 'The weather has improved. Your tree can breathe a sigh of relief.',
    twIssue: 'CWA: {name}', twStill: '{name} still in force', twGeneric: 'Weather warning', twLower: 'a lower level', twDropBody: 'The CWA has lowered the level. Keep watching the weather.', twEnd: '{a} lifted', twEndBody: 'The CWA has lifted it. Your tree can breathe a sigh of relief.',
    hko: 'Observatory', smg: 'SMG',
  },
};

/** 1.4.27 official alert feeds outside HK / Macau / Taiwan (NWS, ECCC, JMA + 環境省, MeteoAlarm). */
const FEED = {
  'zh-HK': {
    src_nws: '美國國家氣象局', src_eccc: '加拿大環境部', src_jma: '日本氣象廳', src_moe: '日本環境省', src_meteoalarm: 'MeteoAlarm',
    jpHeat: '中暑警戒警報', jpHeatSpecial: '中暑特別警戒警報',
    feedIssue: '{src}：{name}', feedBody: '遊戲當{label}。{act}', feedStill: '{name}仍然生效', feedDropBody: '官方已調低等級，仍要留意天氣。', feedEnd: '{a}已解除', feedEndBody: '{src}嘅警報已經完結，棵樹可以鬆一口氣。',
  },
  'zh-TW': {
    src_nws: '美國國家氣象局', src_eccc: '加拿大環境部', src_jma: '日本氣象廳', src_moe: '日本環境省', src_meteoalarm: 'MeteoAlarm',
    jpHeat: '中暑警戒警報', jpHeatSpecial: '中暑特別警戒警報',
    feedIssue: '{src}：{name}', feedBody: '遊戲視為{label}。{act}', feedStill: '{name}仍然生效', feedDropBody: '官方已調低等級，仍要留意天氣。', feedEnd: '{a}已解除', feedEndBody: '{src}的警報已結束，這棵樹可以鬆一口氣。',
  },
  'zh-CN': {
    src_nws: '美国国家气象局', src_eccc: '加拿大环境部', src_jma: '日本气象厅', src_moe: '日本环境省', src_meteoalarm: 'MeteoAlarm',
    jpHeat: '中暑警戒警报', jpHeatSpecial: '中暑特别警戒警报',
    feedIssue: '{src}：{name}', feedBody: '游戏视为{label}。{act}', feedStill: '{name}仍然生效', feedDropBody: '官方已调低等级，仍要留意天气。', feedEnd: '{a}已解除', feedEndBody: '{src}的预警已结束，这棵树可以松一口气。',
  },
  en: {
    src_nws: 'US National Weather Service', src_eccc: 'Environment Canada', src_jma: 'Japan Meteorological Agency', src_moe: 'Japan Ministry of the Environment', src_meteoalarm: 'MeteoAlarm',
    jpHeat: 'Heatstroke Alert', jpHeatSpecial: 'Special Heatstroke Alert',
    feedIssue: '{src}: {name}', feedBody: 'Counts as {label} in the game. {act}', feedStill: '{name} still in force', feedDropBody: 'The official level has been lowered. Keep watching the weather.', feedEnd: '{a} ended', feedEndBody: 'The {src} alert has ended. Your tree can breathe a sigh of relief.',
  },
};
export function feedStr(key, loc, p) {
  const l = normLocale(loc);
  return fmt(FEED[l][key] ?? FEED['zh-HK'][key] ?? key, p);
}

export function str(key, loc, p) {
  const l = normLocale(loc);
  return fmt(S[l][key] ?? S['zh-HK'][key] ?? key, p);
}

/** Taiwan CWA warning names (Traditional Chinese from the feed) in the device's language. */
const CWA_EN = {
  大雨特報: 'Heavy Rain Advisory', 豪雨特報: 'Extremely Heavy Rain Advisory', 大豪雨特報: 'Torrential Rain Advisory', 超大豪雨特報: 'Extremely Torrential Rain Advisory',
  海上颱風警報: 'Sea Typhoon Warning', 海上陸上颱風警報: 'Sea and Land Typhoon Warning', 陸上強風特報: 'Strong Wind Advisory', 低溫特報: 'Low Temperature Advisory',
  高溫資訊: 'High Temperature Information', 濃霧特報: 'Dense Fog Advisory', 大雷雨即時訊息: 'Heavy Thunderstorm Alert', 天氣警特報: 'Weather warning',
};
const COLOR_EN = { 黃色: 'yellow', 橙色: 'orange', 紅色: 'red' };
const T2S = { 報: '报', 颱: '台', 風: '风', 陸: '陆', 強: '强', 溫: '温', 資: '资', 訊: '讯', 燈: '灯', 號: '号', 黃: '黄', 紅: '红', 濃: '浓', 霧: '雾', 時: '时', 氣: '气', 級: '级', 較: '较', 雲: '云', 嚴: '严', 熱: '热', 寒: '寒', 豐: '丰', 際: '际' };
export function cwaName(name, loc) {
  const l = normLocale(loc);
  if (!name) return name;
  if (l === 'zh-CN') return [...name].map((c) => T2S[c] ?? c).join('');
  if (l !== 'en') return name;
  const m = /^(.*?)（(黃色|橙色|紅色)燈號）$/.exec(name);
  const base = m ? m[1] : name;
  const en = CWA_EN[base] ?? 'Weather warning';
  return m ? `${en} (${COLOR_EN[m[2]]})` : en;
}

/** Macao (SMG) names. Typhoon signals use the same wording as the app (HKO-style); rain uses Macao's 黃色 / Yellow. */
const MO_RAIN = {
  'zh-HK': { full: ['', '黃色暴雨警告信號', '紅色暴雨警告信號', '黑色暴雨警告信號'], short: ['', '黃雨', '紅雨', '黑雨'] },
  'zh-TW': { full: ['', '黃色暴雨警告信號', '紅色暴雨警告信號', '黑色暴雨警告信號'], short: ['', '黃雨', '紅雨', '黑雨'] },
  'zh-CN': { full: ['', '黄色暴雨警告信号', '红色暴雨警告信号', '黑色暴雨警告信号'], short: ['', '黄雨', '红雨', '黑雨'] },
  en: { full: ['', 'Yellow Rainstorm Warning Signal', 'Red Rainstorm Warning Signal', 'Black Rainstorm Warning Signal'], short: ['', 'Yellow Rain', 'Red Rain', 'Black Rain'] },
};
/** SMG 高溫／低溫提示: [generic, 黃色, 橙色] per kind. */
const MO_TEMP = {
  'zh-HK': { heat: ['高溫提示', '黃色高溫提示', '橙色高溫提示'], cold: ['低溫提示', '黃色低溫提示', '橙色低溫提示'] },
  'zh-TW': { heat: ['高溫提示', '黃色高溫提示', '橙色高溫提示'], cold: ['低溫提示', '黃色低溫提示', '橙色低溫提示'] },
  'zh-CN': { heat: ['高温提示', '黄色高温提示', '橙色高温提示'], cold: ['低温提示', '黄色低温提示', '橙色低温提示'] },
  en: { heat: ['Hot Weather Alert', 'Yellow Hot Weather Alert', 'Orange Hot Weather Alert'], cold: ['Cold Weather Alert', 'Yellow Cold Weather Alert', 'Orange Cold Weather Alert'] },
};

/** An SMG temperature-alert title (e.g. 黃色高溫提示) in the device's language. Unknown titles: as sent (zh-HK / zh-TW). */
export function smgTempName(kind, title, loc) {
  const l = normLocale(loc);
  const t = String(title ?? '');
  const level = /橙/.test(t) ? 2 : /黃/.test(t) ? 1 : 0;
  if (!level && t && (l === 'zh-HK' || l === 'zh-TW')) return t;
  return MO_TEMP[l][kind][level];
}

/** Label functions for Macao pushes; `names` = latest SMG temperature titles { heat, cold }. */
export function moLabels(names = {}) {
  const label = (cat, level, loc) => {
    if (cat === 'rain') return MO_RAIN[normLocale(loc)].full[level] ?? '';
    if (cat === 'heat' || cat === 'cold') return smgTempName(cat, names[cat], loc);
    return hkLabel(cat, level, loc);
  };
  const short = (cat, level, loc) => {
    if (cat === 'rain') return MO_RAIN[normLocale(loc)].short[level] ?? '';
    if (cat === 'heat' || cat === 'cold') return smgTempName(cat, names[cat], loc);
    return hkShort(cat, level, loc);
  };
  return { label, short };
}
export const HK_LABELS = { label: hkLabel, short: hkShort };
