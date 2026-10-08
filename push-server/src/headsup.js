// 1.4.60 weather heads-up pushes: a friendly note BEFORE forecast typhoon / rainstorm / heat / cold
// (「聽日可能打風，記得加固」). Never changes the game: events, damage and achievements still follow only warnings
// actually issued and in force.
//  • Official forecasts where the region has them: HKO 9-day forecast (HK), SMG 7-day forecast (Macau), CWA county
//    week forecast (Taiwan), and official alerts already issued for later (NWS / ECCC / JMA / MeteoAlarm with a
//    future onset).
//  • Elsewhere: MET Norway forecast numbers (heads-up only).
//  • Only to devices that opted in (app setting, `headsUp: true` in /state), never in quiet hours (22:00–08:00 on the
//    device clock: held until morning while still ahead), at most one heads-up per device per event (category + day),
//    and not while that category's warning is already in force there.
import { fmt, normLocale } from './i18n.js';

export const CATS = ['typhoon', 'rain', 'heat', 'cold'];
export const QUIET_FROM = 22;
export const QUIET_TO = 8;
const DAY = 24 * 3600_000;

/** Local date (YYYY-MM-DD) `plus` days from now in `tz`. */
export function localDate(tz, now = Date.now(), plus = 0) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now + plus * DAY));
  } catch {
    return new Date(now + plus * DAY).toISOString().slice(0, 10);
  }
}
export function localHour(tz, now = Date.now()) {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(now)));
  } catch {
    return new Date(now).getUTCHours();
  }
}
export const quietNow = (tz, now = Date.now()) => {
  const h = localHour(tz, now);
  return h >= QUIET_FROM || h < QUIET_TO;
};

// Tropical-cyclone words or force 9+ (a winter-monsoon 8級 offshore alone is not 「打風」).
const WIND_RE = /(?<!\d)(9|1[0-2])\s*級|暴風|颶風|熱帶氣旋|颱風|台風|台风|热带气旋|暴风|飓风/;
const RAIN_RE = /大雨|暴雨|豪雨|雷暴|雷雨/;

/** Text-forecast rules shared by HKO / SMG / CWA (Chinese texts). */
function textUps({ date, wind = '', text = '', max = null, min = null, rainLikely = true }, hot, cold) {
  const ups = [];
  if (WIND_RE.test(`${wind} ${text}`)) ups.push({ cat: 'typhoon', date });
  if (rainLikely && RAIN_RE.test(text)) ups.push({ cat: 'rain', date });
  if (Number.isFinite(max) && max >= hot) ups.push({ cat: 'heat', date });
  if (Number.isFinite(min) && min <= cold) ups.push({ cat: 'cold', date });
  return ups;
}

/** HKO 9-day forecast (dataType=fnd, lang=tc): tomorrow's entry. */
export function hkoHeadsUps(fnd, tomorrow) {
  const f = (fnd?.weatherForecast ?? []).find((d) => `${String(d.forecastDate).slice(0, 4)}-${String(d.forecastDate).slice(4, 6)}-${String(d.forecastDate).slice(6, 8)}` === tomorrow);
  if (!f) return [];
  const icon = Number(f.ForecastIcon);
  const rainLikely = ['高', '中高'].includes(f.PSR) || icon === 64 || icon === 65;
  return textUps({ date: tomorrow, wind: f.forecastWind, text: f.forecastWeather, max: Number(f.forecastMaxtemp?.value), min: Number(f.forecastMintemp?.value), rainLikely }, 33, 12);
}

/** SMG 7-day forecast XML (c_7daysforecast.xml): tomorrow's block. */
export function smgHeadsUps(xml, tomorrow) {
  const blocks = String(xml ?? '').split('<WeatherForecast>').slice(1);
  for (const b of blocks) {
    if (!b.includes(`<ValidFor>${tomorrow}</ValidFor>`)) continue;
    const temp = (type) => {
      const m = new RegExp(`<Temperature>\\s*<Type>${type}</Type>[\\s\\S]*?<Value>(-?[\\d.]+)</Value>`).exec(b);
      return m ? Number(m[1]) : null;
    };
    const text = /<WeatherDescription>([\s\S]*?)<\/WeatherDescription>/.exec(b)?.[1] ?? '';
    return textUps({ date: tomorrow, text, max: temp(1), min: temp(2) }, 33, 12);
  }
  return [];
}

/** CWA county week forecast rows (cwa.js forecastDays): tomorrow. */
export function cwaHeadsUps(days, tomorrow) {
  const d = (days ?? []).find((x) => x.date === tomorrow);
  if (!d) return [];
  const bft = Number(String(d.wind ?? '').replace(/\D/g, ''));
  const ups = textUps({ date: tomorrow, text: `${d.text ?? ''} ${d.detail ?? ''}`, max: d.tempMax, min: d.tempMin, rainLikely: (d.pop ?? 0) >= 70 }, 36, 10);
  if (bft >= 9 && !ups.some((u) => u.cat === 'typhoon')) ups.unshift({ cat: 'typhoon', date: tomorrow });
  return ups;
}

const FEED_CAT = { hot: 'heat', cold: 'cold', rainstorm: 'rain', blackrain: 'rain', typhoon1: 'typhoon', thunder: 'typhoon', typhoon8: 'typhoon' };
/** Official alerts already issued for later (future onset within ~36 h). Day = the onset's local date. */
export function feedHeadsUps(answer, tz, now = Date.now()) {
  const ups = [];
  for (const a of answer?.alerts ?? []) {
    const cat = FEED_CAT[a.event];
    const on = Date.parse(a.onset ?? '');
    if (!cat || a.active || !Number.isFinite(on) || on <= now || on - now > 36 * 3600_000) continue;
    const date = localDate(tz, on);
    if (!ups.some((u) => u.cat === cat && u.date === date)) ups.push({ cat, date, official: true });
  }
  return ups;
}

/** MET Norway (Open-Meteo-shaped daily) for tomorrow: the game's absolute intl thresholds, heads-up only. */
export function metHeadsUps(fc, tomorrow) {
  const d = fc?.daily;
  const i = d?.time?.indexOf(tomorrow) ?? -1;
  if (i < 0) return [];
  const ups = [];
  const v = (k) => Number(d[k]?.[i]);
  if (v('wind_gusts_10m_max') >= 88 || v('wind_speed_10m_max') >= 50) ups.push({ cat: 'typhoon', date: tomorrow });
  if (v('precipitation_sum') >= 50) ups.push({ cat: 'rain', date: tomorrow });
  if (v('temperature_2m_max') >= 35) ups.push({ cat: 'heat', date: tomorrow });
  if (v('temperature_2m_min') <= 3) ups.push({ cat: 'cold', date: tomorrow });
  return ups;
}

export const upKey = (u) => `${u.cat}|${u.date}`;

/**
 * Which devices get which heads-up now. `sent` = { [token]: { [key]: at } } (mutated: new sends recorded, entries
 * older than 3 days dropped). `levels` = the scope's warnings in force (skip a category already warned).
 */
export function planHeadsUps(records, ups, levels, sent, now = Date.now()) {
  const out = [];
  for (const [tok, keys] of Object.entries(sent)) {
    for (const [k, at] of Object.entries(keys)) if (now - at > 3 * DAY) delete keys[k];
    if (!Object.keys(keys).length) delete sent[tok];
  }
  for (const u of ups) {
    if (!CATS.includes(u.cat) || (levels?.[u.cat] ?? 0) > 0) continue;
    for (const r of records) {
      const s = r.state;
      if (s?.headsUp !== true || s.tree === 'dead') continue;
      const tz = s.tz || 'Asia/Hong_Kong';
      if (quietNow(tz, now)) continue;
      // Only ahead of the day itself (today or tomorrow on the device clock).
      if (u.date !== localDate(tz, now, 1) && u.date !== localDate(tz, now, 0)) continue;
      const k = upKey(u);
      if (sent[r.token]?.[k]) continue;
      (sent[r.token] ??= {})[k] = now;
      out.push({ record: r, up: u, today: u.date === localDate(tz, now, 0) });
    }
  }
  return out;
}

const T = {
  'zh-HK': {
    when: ['聽日', '今日稍後'],
    typhoon: { title: '{w}可能打風', body: '記得幫棵樹加固。', bodyEarly: '注意安全，留意天氣消息。' },
    rain: { title: '{w}可能有大雨', body: '雨水多就記得疏水。' },
    heat: { title: '{w}可能好熱', body: '記得早啲淋水。' },
    cold: { title: '{w}可能好凍', body: '記得幫樹頭保暖。' },
    official: '（{src}預報）',
    model: '（MET Norway 預報，只係預告；遊戲照官方警告計）',
  },
  'zh-TW': {
    when: ['明天', '今天稍晚'],
    typhoon: { title: '{w}可能有颱風', body: '記得幫樹加固。', bodyEarly: '注意安全，留意天氣消息。' },
    rain: { title: '{w}可能有大雨', body: '雨量大就記得疏水。' },
    heat: { title: '{w}可能很熱', body: '記得早點澆水。' },
    cold: { title: '{w}可能很冷', body: '記得幫樹根保暖。' },
    official: '（{src}預報）',
    model: '（MET Norway 預報，僅供預告；遊戲依官方警報計算）',
  },
  'zh-CN': {
    when: ['明天', '今天稍晚'],
    typhoon: { title: '{w}可能有台风', body: '记得给树加固。', bodyEarly: '注意安全，留意天气消息。' },
    rain: { title: '{w}可能有大雨', body: '雨量大就记得疏水。' },
    heat: { title: '{w}可能很热', body: '记得早点浇水。' },
    cold: { title: '{w}可能很冷', body: '记得给树根保暖。' },
    official: '（{src}预报）',
    model: '（MET Norway 预报，仅作预告；游戏按官方预警计算）',
  },
  en: {
    when: ['Tomorrow', 'Later today'],
    typhoon: { title: '{w}: storm winds possible', body: 'Remember to reinforce your tree.', bodyEarly: 'Stay safe and follow the weather news.' },
    rain: { title: '{w}: heavy rain possible', body: 'Drain the soil if it gets waterlogged.' },
    heat: { title: '{w}: very hot weather possible', body: 'Water your tree early.' },
    cold: { title: '{w}: cold weather possible', body: 'Remember to keep the roots warm.' },
    official: ' (forecast: {src})',
    model: ' (MET Norway forecast, heads-up only; the game counts official warnings only)',
  },
};
const SRC = {
  hko: { 'zh-HK': '香港天文台', 'zh-TW': '香港天文台', 'zh-CN': '香港天文台', en: 'Hong Kong Observatory' },
  smg: { 'zh-HK': '澳門地球物理氣象局', 'zh-TW': '澳門地球物理氣象局', 'zh-CN': '澳门地球物理气象局', en: 'SMG Macao' },
  cwa: { 'zh-HK': '中央氣象署', 'zh-TW': '中央氣象署', 'zh-CN': '中央气象署', en: 'Central Weather Administration' },
  nws: { 'zh-HK': '美國國家氣象局', 'zh-TW': '美國國家氣象局', 'zh-CN': '美国国家气象局', en: 'US National Weather Service' },
  eccc: { 'zh-HK': '加拿大環境部', 'zh-TW': '加拿大環境部', 'zh-CN': '加拿大环境部', en: 'Environment Canada' },
  jma: { 'zh-HK': '日本氣象廳', 'zh-TW': '日本氣象廳', 'zh-CN': '日本气象厅', en: 'Japan Meteorological Agency' },
  meteoalarm: { 'zh-HK': 'MeteoAlarm', 'zh-TW': 'MeteoAlarm', 'zh-CN': 'MeteoAlarm', en: 'MeteoAlarm' },
};

/** Push text. `src` = 'hko' | 'smg' | 'cwa' | 'nws' | 'eccc' | 'jma' | 'meteoalarm' | 'met' (MET Norway, not official). */
export function headsUpMessage(up, { loc = 'zh-HK', src = 'met', today = false, rUnlocked = true } = {}) {
  const l = normLocale(loc);
  const t = T[l];
  const c = t[up.cat];
  const w = t.when[today ? 1 : 0];
  const note = src === 'met' ? t.model : fmt(t.official, { src: SRC[src]?.[l] ?? src });
  const body = (up.cat === 'typhoon' && !rUnlocked ? c.bodyEarly : c.body) + note;
  return { title: fmt(c.title, { w }), body, category: `headsup-${up.cat}`, level: 0, headsUp: true };
}
