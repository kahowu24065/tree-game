// 1.4.75 daily weather brief.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BRIEF_HOUR, briefFromCwa, briefFromHko, briefFromMet, briefFromSmg, dailyBriefMessage, planDailyBriefs } from '../src/daily.js';

// 2026-10-25 08:30 HKT
const MORNING = Date.parse('2026-10-25T00:30:00Z');
// 2026-10-25 12:00 HKT
const NOON = Date.parse('2026-10-25T04:00:00Z');

test('plan: only opted-in at local 08:xx, once per day', () => {
  const rec = (token, extra = {}) => ({ token, state: { dailyBrief: true, tz: 'Asia/Hong_Kong', ...extra } });
  const records = [rec('a'), rec('b', { dailyBrief: false }), { token: 'old', state: null }, rec('ny', { tz: 'America/New_York' })];
  const sent = {};
  const first = planDailyBriefs(records, sent, MORNING);
  assert.deepEqual(first.map((p) => p.record.token), ['a']);
  assert.equal(first[0].day, '2026-10-25');
  assert.equal(planDailyBriefs(records, sent, MORNING + 600_000).length, 0, 'once per day');
  assert.equal(planDailyBriefs(records, sent, NOON).length, 0, 'not outside hour 8');
  assert.equal(BRIEF_HOUR, 8);
  // New York at 08:30 EDT (12:30 UTC in late October? 2026-10-25 is EDT = UTC-4 → 08:30 local = 12:30Z)
  const nyMorning = Date.parse('2026-10-25T12:30:00Z');
  assert.deepEqual(planDailyBriefs([rec('ny', { tz: 'America/New_York' })], {}, nyMorning).map((p) => p.record.token), ['ny']);
});

test('HKO / SMG / CWA / MET brief facts + tips', () => {
  const fnd = { weatherForecast: [
    { forecastDate: '20261025', forecastWeather: '大致天晴。', forecastMaxtemp: { value: 34 }, forecastMintemp: { value: 28 }, ForecastIcon: 50, PSR: '低' },
    { forecastDate: '20261026', forecastWeather: '有驟雨。', forecastMaxtemp: { value: 30 }, forecastMintemp: { value: 25 }, ForecastIcon: 63, PSR: '高' },
  ] };
  const hot = briefFromHko(fnd, '2026-10-25', {});
  assert.equal(hot.hot, true);
  assert.equal(hot.rain, false);
  assert.match(hot.text, /天晴/);
  const rain = briefFromHko(fnd, '2026-10-26', {});
  assert.equal(rain.rain, true);
  assert.equal(rain.hot, false);

  const xml = '<WeatherForecast><ValidFor>2026-10-25</ValidFor><Temperature><Type>1</Type><Value>32</Value></Temperature><Temperature><Type>2</Type><Value>26</Value></Temperature><WeatherDescription>多雲有驟雨。</WeatherDescription></WeatherForecast>';
  const smg = briefFromSmg(xml, '2026-10-25', {});
  assert.equal(smg.rain, true);
  assert.equal(smg.hot, false);

  const cwa = briefFromCwa([{ date: '2026-10-25', text: '晴時多雲', detail: '', tempMax: 37, tempMin: 28, pop: 10 }], '2026-10-25', {});
  assert.equal(cwa.hot, true);

  const met = briefFromMet({ daily: { time: ['2026-10-25'], temperature_2m_max: [30], temperature_2m_min: [22], precipitation_sum: [5], weather_code: [61] }, current: { temperature_2m: 24 } }, '2026-10-25', {});
  assert.equal(met.rain, true);
  assert.equal(met.tempNow, 24);
});

test('texts: 4 languages, hot/rain tips, channel', () => {
  const brief = { text: '大致天晴。', min: 28, max: 33, hot: true, rain: false, levels: { heat: 1 } };
  const hk = dailyBriefMessage(brief, { loc: 'zh-HK' });
  assert.equal(hk.title, '今日天氣：酷熱，28–33°C');
  assert.match(hk.body, /防曬|淋水/);
  assert.match(hk.body, /酷熱天氣警告/);
  assert.equal(hk.category, 'daily-brief');
  assert.equal(hk.channelId, 'weather-daily');
  assert.equal(hk.daily, true);

  const rain = dailyBriefMessage({ text: '有驟雨。', min: 24, max: 29, hot: false, rain: true, levels: {} }, { loc: 'zh-HK' });
  assert.match(rain.title, /有雨/);
  assert.match(rain.body, /帶遮/);
  assert.match(rain.body, /未有天氣警告/);

  assert.match(dailyBriefMessage(brief, { loc: 'en' }).title, /very hot/);
  assert.match(dailyBriefMessage(brief, { loc: 'zh-CN' }).title, /酷热/);
  assert.match(dailyBriefMessage(brief, { loc: 'zh-TW' }).body, /澆水/);
});
