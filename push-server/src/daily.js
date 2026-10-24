// 1.4.75 daily weather brief: one FCM at 08:00 on the device clock every day (opt-in `dailyBrief`).
// Separate from heads-up (惡劣天氣預告) and from instant warning pushes.
import { fmt, normLocale } from './i18n.js';
import { localDate, localHour } from './headsup.js';

export const BRIEF_HOUR = 8;
const DAY = 24 * 3600_000;
const RAIN_RE = /大雨|暴雨|豪雨|雷暴|雷雨|驟雨|有雨|陣雨|雨/;

/** Devices due for today's brief now (local hour === 08). Mutates `sent` = { [token]: { [YYYY-MM-DD]: at } }. */
export function planDailyBriefs(records, sent, now = Date.now()) {
  const out = [];
  for (const [tok, days] of Object.entries(sent)) {
    for (const [d, at] of Object.entries(days)) if (now - at > 3 * DAY) delete days[d];
    if (!Object.keys(days).length) delete sent[tok];
  }
  for (const r of records) {
    const s = r.state;
    if (s?.dailyBrief !== true) continue;
    const tz = s.tz || 'Asia/Hong_Kong';
    if (localHour(tz, now) !== BRIEF_HOUR) continue;
    const day = localDate(tz, now, 0);
    if (sent[r.token]?.[day]) continue;
    (sent[r.token] ??= {})[day] = now;
    out.push({ record: r, day, tz });
  }
  return out;
}

/** Today's HKO 9-day row → brief facts. */
export function briefFromHko(fnd, today, levels = {}) {
  const f = (fnd?.weatherForecast ?? []).find((d) => {
    const raw = String(d.forecastDate ?? '');
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` === today;
  });
  if (!f) return null;
  const max = Number(f.forecastMaxtemp?.value);
  const min = Number(f.forecastMintemp?.value);
  const text = String(f.forecastWeather ?? '').trim();
  const icon = Number(f.ForecastIcon);
  const rain = ['高', '中高'].includes(f.PSR) || icon === 62 || icon === 63 || icon === 64 || icon === 65 || RAIN_RE.test(text);
  const hot = (Number.isFinite(max) && max >= 33) || (levels?.heat ?? 0) > 0;
  return { text: text || null, min, max, rain, hot, levels };
}

/** SMG 7-day XML block for `today`. */
export function briefFromSmg(xml, today, levels = {}) {
  const blocks = String(xml ?? '').split('<WeatherForecast>').slice(1);
  for (const b of blocks) {
    if (!b.includes(`<ValidFor>${today}</ValidFor>`)) continue;
    const temp = (type) => {
      const m = new RegExp(`<Temperature>\\s*<Type>${type}</Type>[\\s\\S]*?<Value>(-?[\\d.]+)</Value>`).exec(b);
      return m ? Number(m[1]) : null;
    };
    const text = (/<WeatherDescription>([\s\S]*?)<\/WeatherDescription>/.exec(b)?.[1] ?? '').trim();
    const max = temp(1);
    const min = temp(2);
    const rain = RAIN_RE.test(text);
    const hot = (Number.isFinite(max) && max >= 33) || (levels?.heat ?? 0) > 0;
    return { text: text || null, min, max, rain, hot, levels };
  }
  return null;
}

/** CWA county week row for `today`. */
export function briefFromCwa(days, today, levels = {}) {
  const d = (days ?? []).find((x) => x.date === today);
  if (!d) return null;
  const text = `${d.text ?? ''} ${d.detail ?? ''}`.trim();
  const max = d.tempMax;
  const min = d.tempMin;
  const rain = (d.pop ?? 0) >= 50 || RAIN_RE.test(text);
  const hot = (Number.isFinite(max) && max >= 36) || (levels?.heat ?? 0) > 0;
  return { text: text || null, min, max, rain, hot, levels };
}

/** MET Norway Open-Meteo-shaped daily for `today`. */
export function briefFromMet(fc, today, levels = {}) {
  const d = fc?.daily;
  const i = d?.time?.indexOf(today) ?? -1;
  if (i < 0) return null;
  const max = Number(d.temperature_2m_max?.[i]);
  const min = Number(d.temperature_2m_min?.[i]);
  const rainMm = Number(d.precipitation_sum?.[i]);
  const code = Number(d.weather_code?.[i]);
  const rain = (Number.isFinite(rainMm) && rainMm >= 1) || (Number.isFinite(code) && code >= 51);
  const hot = (Number.isFinite(max) && max >= 35) || (levels?.heat ?? 0) > 0;
  const text = metText(code, rainMm);
  return { text, min, max, rain, hot, levels, tempNow: Number(fc?.current?.temperature_2m) };
}

function metText(code, rainMm) {
  if (Number.isFinite(code)) {
    if (code >= 95) return null; // thunder — tip covers it
    if (code >= 71) return null;
    if (code >= 51 || (Number.isFinite(rainMm) && rainMm >= 1)) return null;
    if (code <= 1) return 'clear';
    if (code <= 3) return 'cloudy';
  }
  return null;
}

const T = {
  'zh-HK': {
    title: '今日天氣：{tag}，{range}',
    titleNoRange: '今日天氣：{tag}',
    range: '{min}–{max}°C',
    tagHot: '酷熱',
    tagRain: '有雨',
    tagClear: '大致天晴',
    tagCloudy: '多雲',
    tagDefault: '留意天氣',
    bodyText: '{text}',
    now: '而家約 {t}°C。',
    tipHot: '今日好晒，記得出門防曬，幫棵樹早啲淋水。',
    tipRain: '預測今日會落雨，出門記得帶遮；雨水多就幫樹疏水。',
    tipBoth: '今日又熱又可能落雨：防曬同帶遮都要，棵樹早啲淋水，雨水多就疏水。',
    warn: '生效緊：{w}。',
    noWarn: '未有天氣警告。',
    warnHeat: '酷熱天氣警告',
    warnCold: '寒冷天氣警告',
    warnRain: '暴雨警告',
    warnTyphoon: '熱帶氣旋警告',
    warnLandslip: '山泥傾瀉警告',
  },
  'zh-TW': {
    title: '今日天氣：{tag}，{range}',
    titleNoRange: '今日天氣：{tag}',
    range: '{min}–{max}°C',
    tagHot: '酷熱',
    tagRain: '有雨',
    tagClear: '大致晴朗',
    tagCloudy: '多雲',
    tagDefault: '留意天氣',
    bodyText: '{text}',
    now: '現在約 {t}°C。',
    tipHot: '今天很晒，記得出門防曬，幫這棵樹早點澆水。',
    tipRain: '預測今天會下雨，出門記得帶傘；雨量大就幫樹疏水。',
    tipBoth: '今天又熱又可能下雨：防曬和帶傘都要，這棵樹早點澆水，雨量大就疏水。',
    warn: '生效中：{w}。',
    noWarn: '目前沒有天氣警特報。',
    warnHeat: '高溫資訊',
    warnCold: '低溫特報',
    warnRain: '大雨／豪雨特報',
    warnTyphoon: '颱風警報',
    warnLandslip: '山泥傾瀉警告',
  },
  'zh-CN': {
    title: '今日天气：{tag}，{range}',
    titleNoRange: '今日天气：{tag}',
    range: '{min}–{max}°C',
    tagHot: '酷热',
    tagRain: '有雨',
    tagClear: '大致晴朗',
    tagCloudy: '多云',
    tagDefault: '留意天气',
    bodyText: '{text}',
    now: '现在约 {t}°C。',
    tipHot: '今天很晒，记得出门防晒，帮这棵树早点浇水。',
    tipRain: '预测今天会下雨，出门记得带伞；雨量大就帮树疏水。',
    tipBoth: '今天又热又可能下雨：防晒和带伞都要，这棵树早点浇水，雨量大就疏水。',
    warn: '生效中：{w}。',
    noWarn: '目前没有天气预警。',
    warnHeat: '高温预警',
    warnCold: '低温预警',
    warnRain: '暴雨预警',
    warnTyphoon: '台风预警',
    warnLandslip: '山体滑坡预警',
  },
  en: {
    title: "Today's weather: {tag}, {range}",
    titleNoRange: "Today's weather: {tag}",
    range: '{min}–{max}°C',
    tagHot: 'very hot',
    tagRain: 'rain likely',
    tagClear: 'mostly sunny',
    tagCloudy: 'cloudy',
    tagDefault: 'check the forecast',
    bodyText: '{text}',
    now: 'About {t}°C now.',
    tipHot: "It's very sunny — sunscreen, and water your tree early.",
    tipRain: 'Rain is likely today — bring an umbrella; drain the soil if it gets soggy.',
    tipBoth: 'Hot and possibly rainy — sunscreen and an umbrella; water early, drain if needed.',
    warn: 'In force: {w}.',
    noWarn: 'No weather warnings in force.',
    warnHeat: 'heat warning',
    warnCold: 'cold warning',
    warnRain: 'rainstorm warning',
    warnTyphoon: 'tropical cyclone warning',
    warnLandslip: 'landslip warning',
  },
};

function warnList(levels, t) {
  const out = [];
  if ((levels?.heat ?? 0) > 0) out.push(t.warnHeat);
  if ((levels?.cold ?? 0) > 0) out.push(t.warnCold);
  if ((levels?.rain ?? 0) > 0) out.push(t.warnRain);
  if ((levels?.typhoon ?? 0) > 0) out.push(t.warnTyphoon);
  if ((levels?.landslip ?? 0) > 0) out.push(t.warnLandslip);
  return out;
}

function tagOf(brief, t) {
  if (brief.hot) return t.tagHot;
  if (brief.rain) return t.tagRain;
  if (brief.text === 'clear') return t.tagClear;
  if (brief.text === 'cloudy') return t.tagCloudy;
  if (brief.text && brief.text.length <= 12 && !/^[a-z]+$/.test(brief.text)) return brief.text.replace(/[。．.！!].*$/, '').slice(0, 12);
  return t.tagDefault;
}

/** Build FCM title/body. `brief` from briefFrom*. */
export function dailyBriefMessage(brief, { loc = 'zh-HK' } = {}) {
  const l = normLocale(loc);
  const t = T[l];
  const min = Number.isFinite(brief.min) ? Math.round(brief.min) : null;
  const max = Number.isFinite(brief.max) ? Math.round(brief.max) : null;
  const tag = tagOf(brief, t);
  const range = min != null && max != null ? fmt(t.range, { min, max }) : null;
  const title = range ? fmt(t.title, { tag, range }) : fmt(t.titleNoRange, { tag });
  const parts = [];
  if (brief.text && brief.text !== 'clear' && brief.text !== 'cloudy') {
    const clipped = brief.text.replace(/\s+/g, ' ').slice(0, 80);
    if (clipped) parts.push(fmt(t.bodyText, { text: clipped.endsWith('。') || clipped.endsWith('.') ? clipped : `${clipped}${l === 'en' ? '.' : '。'}` }));
  }
  if (Number.isFinite(brief.tempNow)) parts.push(fmt(t.now, { t: Math.round(brief.tempNow) }));
  if (brief.hot && brief.rain) parts.push(t.tipBoth);
  else if (brief.hot) parts.push(t.tipHot);
  else if (brief.rain) parts.push(t.tipRain);
  const warns = warnList(brief.levels, t);
  parts.push(warns.length ? fmt(t.warn, { w: warns.join(l === 'en' ? ', ' : '、') }) : t.noWarn);
  return {
    title,
    body: parts.join(l === 'en' ? ' ' : ''),
    category: 'daily-brief',
    level: 0,
    daily: true,
    channelId: 'weather-daily',
  };
}
