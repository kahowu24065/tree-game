// Non-HK weather: the game's own rules (ported 1:1 from tree-game src/events.ts + src/balance.ts; a tree-game test
// checks this port against the TypeScript originals) applied to Open-Meteo, per 0.5° grid cell.

// balance.ts
export const HOT_ABS_MAX_C = 35;
export const HOT_REL_MIN_C = 28;
export const HOT_REL_RISE_C = 5;
export const COLD_ABS_MIN_C = 3;
export const COLD_REL_MAX_C = 10;
export const COLD_REL_DROP_C = 8;
const NORMAL_PAST_DAYS = 14;

const has = (v) => typeof v === 'number' && Number.isFinite(v);

/** events.ts isHotDay, `intl` branch (non-HK devices are always intl). */
export function isHotDay(t) {
  if (t.tempMax >= HOT_ABS_MAX_C) return true;
  return has(t.normMax) && t.tempMax >= HOT_REL_MIN_C && t.tempMax >= t.normMax + HOT_REL_RISE_C;
}

/** events.ts isColdDay, `intl` branch. */
export function isColdDay(t) {
  if (!has(t.tempMin)) return false;
  if (t.tempMin <= COLD_ABS_MIN_C) return true;
  return has(t.normMin) && t.tempMin <= COLD_REL_MAX_C && t.tempMin <= t.normMin - COLD_REL_DROP_C;
}

function tempEvents(t) {
  const out = [];
  if (isHotDay(t)) out.push('hot');
  if (isColdDay(t)) out.push('cold');
  return out;
}

/** events.ts eventFromNumbers (severe part; drizzle/clear don't matter for pushes). */
export function eventFromNumbers(i) {
  if (i.gustKmh >= 118 || i.windKmh >= 63) return 'typhoon8';
  if (i.gustKmh >= 88 || i.windKmh >= 50) return 'typhoon1';
  if (i.code >= 95 || i.gustKmh >= 62) return 'thunder';
  if (i.precipMm >= 70) return 'blackrain';
  if (i.precipMm >= 25) return 'rainstorm';
  if (isHotDay(i)) return 'hot';
  if (isColdDay(i)) return 'cold';
  return 'clear';
}

/** events.ts currentEvents, non-HK branch: live numbers (precip × 6) + today's forecast day, with local normals. */
export function currentEventsIntl(current, today, normals) {
  const out = new Set();
  const temps = { tempMax: Math.max(current.tempC, today?.tempMax ?? -Infinity), tempMin: Math.min(current.tempC, today?.tempMin ?? Infinity), normMax: normals?.max ?? null, normMin: normals?.min ?? null };
  out.add(eventFromNumbers({ code: current.code, precipMm: current.precipMm * 6, gustKmh: current.gustKmh, windKmh: current.windKmh, ...temps }));
  for (const e of tempEvents(temps)) out.add(e);
  if (today) {
    const t = { ...today, normMax: normals?.max ?? null, normMin: normals?.min ?? null };
    out.add(eventFromNumbers(t));
    for (const e of tempEvents(t)) out.add(e);
  }
  return [...out].filter((e) => e !== 'clear');
}

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** weather.ts parseOpenMeteo (the parts the rules need). */
export function parseOpenMeteo(body) {
  const daily = body?.daily;
  const dates = daily?.time ?? [];
  if (!dates.length) throw new Error('no forecast');
  const all = dates.map((date, i) => ({
    date,
    code: num(daily.weather_code?.[i], 2),
    tempMax: num(daily.temperature_2m_max?.[i], 28),
    tempMin: num(daily.temperature_2m_min?.[i], 23),
    precipMm: num(daily.precipitation_sum?.[i], 0),
    windKmh: num(daily.wind_speed_10m_max?.[i], 10),
    gustKmh: num(daily.wind_gusts_10m_max?.[i], 16),
  }));
  const c = body.current ?? {};
  const todayIso = (c.time ?? '').slice(0, 10);
  let first = todayIso ? all.findIndex((d) => d.date >= todayIso) : -1;
  if (first < 0) first = Math.max(0, all.length - 7);
  const avg = (vals) => {
    const ok = (vals ?? []).slice(0, first).filter((v) => typeof v === 'number' && Number.isFinite(v));
    return ok.length ? Math.round((ok.reduce((a, b) => a + b, 0) / ok.length) * 10) / 10 : null;
  };
  const normals = first > 0 ? { min: avg(daily.temperature_2m_min), max: avg(daily.temperature_2m_max) } : null;
  const today = all[first];
  return {
    timezone: body.timezone || 'UTC',
    normals,
    today,
    current: {
      tempC: num(c.temperature_2m, today?.tempMax ?? 26),
      precipMm: num(c.precipitation, 0),
      code: num(c.weather_code, today?.code ?? 2),
      windKmh: num(c.wind_speed_10m, today?.windKmh ?? 10),
      gustKmh: num(c.wind_gusts_10m, today?.gustKmh ?? 16),
    },
  };
}

/** Same request as the game (weather.ts forecastUrl), minus the hourly block. */
export function forecastUrl(lat, lon) {
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', lat.toFixed(4));
  u.searchParams.set('longitude', lon.toFixed(4));
  u.searchParams.set('current', 'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m');
  u.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max');
  u.searchParams.set('timezone', 'auto');
  u.searchParams.set('forecast_days', '2');
  u.searchParams.set('past_days', String(NORMAL_PAST_DAYS));
  u.searchParams.set('wind_speed_unit', 'kmh');
  return u.toString();
}

/** Game events → per-category push level (wind: 烈風 1 < 狂風雷暴 2 < 暴風 3; rain: 大雨 1 < 豪雨 2). */
export function levelsFromEvents(events) {
  const out = { heat: 0, rain: 0, typhoon: 0, cold: 0 };
  for (const e of events) {
    if (e === 'hot') out.heat = 1;
    else if (e === 'cold') out.cold = 1;
    else if (e === 'rainstorm') out.rain = Math.max(out.rain, 1);
    else if (e === 'blackrain') out.rain = 2;
    else if (e === 'typhoon1') out.typhoon = Math.max(out.typhoon, 1);
    else if (e === 'thunder') out.typhoon = Math.max(out.typhoon, 2);
    else if (e === 'typhoon8') out.typhoon = 3;
  }
  return out;
}

/** 0.5° grid cell id (centre), e.g. "35.5,139.5". */
export function cellKey(lat, lon) {
  const r = (v) => (Math.round(v * 2) / 2).toFixed(1);
  return `${r(lat)},${r(lon)}`;
}

const INTL_LABEL = {
  heat: () => '酷熱',
  cold: () => '寒冷',
  rain: (l) => (l >= 2 ? '豪雨' : '大雨'),
  typhoon: (l) => ['', '烈風', '狂風雷暴', '暴風'][l],
};

/** Push text for a non-HK cell (the game's regional names: 烈風／暴風／大雨／豪雨, 大雨疏水). */
export function intlMessageFor({ category, level }, reminder = false) {
  const label = INTL_LABEL[category](level);
  const body = {
    heat: '快啲幫棵樹做額外澆水（酷熱澆水）！',
    rain: '快啲幫棵樹做大雨疏水！',
    typhoon: '快啲幫棵樹加固，打木樁、綁防風繩！',
    cold: '快啲幫棵樹做保暖，鋪好樹皮乾葉！',
  }[category];
  return reminder
    ? { title: `${label}仲未完`, body: `棵樹仲未做應急行動：${body}`, category, level }
    : { title: `你嗰度有${label}天氣！`, body, category, level };
}
