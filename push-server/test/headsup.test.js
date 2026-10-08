// 1.4.60 weather heads-up pushes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cwaHeadsUps, feedHeadsUps, headsUpMessage, hkoHeadsUps, localDate, metHeadsUps, planHeadsUps, quietNow, smgHeadsUps } from '../src/headsup.js';

// 2026-10-08 12:00 HKT
const NOON = Date.parse('2026-10-08T04:00:00Z');

test('HKO 9-day forecast: gale words → typhoon, PSR high + heavy rain → rain, 33 °C / 12 °C', () => {
  const fnd = { weatherForecast: [
    { forecastDate: '20261009', forecastWind: '東風7至8級，離岸9級。', forecastWeather: '受熱帶氣旋影響，有狂風驟雨及雷暴，雨勢有時頗大。', forecastMaxtemp: { value: 34 }, forecastMintemp: { value: 26 }, ForecastIcon: 65, PSR: '高' },
    { forecastDate: '20261010', forecastWind: '北風3級。', forecastWeather: '天晴乾燥。', forecastMaxtemp: { value: 22 }, forecastMintemp: { value: 11 }, ForecastIcon: 50, PSR: '低' },
  ] };
  assert.deepEqual(hkoHeadsUps(fnd, '2026-10-09').map((u) => u.cat), ['typhoon', 'rain', 'heat']);
  assert.deepEqual(hkoHeadsUps(fnd, '2026-10-10').map((u) => u.cat), ['cold']);
  const calm = { weatherForecast: [{ forecastDate: '20261009', forecastWind: '東風4級。', forecastWeather: '有一兩陣驟雨。', forecastMaxtemp: { value: 30 }, forecastMintemp: { value: 25 }, ForecastIcon: 53, PSR: '中低' }] };
  assert.deepEqual(hkoHeadsUps(calm, '2026-10-09'), []);
  const monsoon = { weatherForecast: [{ forecastDate: '20261009', forecastWind: '東北風5至6級，離岸8級。', forecastWeather: '多雲。', forecastMaxtemp: { value: 24 }, forecastMintemp: { value: 18 }, ForecastIcon: 60, PSR: '低' }] };
  assert.deepEqual(hkoHeadsUps(monsoon, '2026-10-09'), [], 'monsoon 8級 offshore is not a typhoon');
});

test('SMG 7-day XML and CWA week rows', () => {
  const xml = '<WeatherForecast><ValidFor>2026-10-09</ValidFor><Temperature><Type>1</Type><MeasureUnit>C</MeasureUnit><Value>35</Value></Temperature><Temperature><Type>2</Type><MeasureUnit>C</MeasureUnit><Value>27</Value></Temperature><WeatherDescription>受熱帶氣旋影響，吹烈風。</WeatherDescription></WeatherForecast>';
  assert.deepEqual(smgHeadsUps(xml, '2026-10-09').map((u) => u.cat), ['typhoon', 'heat']);
  const days = [{ date: '2026-10-09', text: '陰短暫陣雨或雷雨', detail: '豪雨', wind: '9級', tempMax: 29, tempMin: 9, pop: 90 }];
  assert.deepEqual(cwaHeadsUps(days, '2026-10-09').map((u) => u.cat).sort(), ['cold', 'rain', 'typhoon']);
});

test('official alerts issued for later (future onset ≤ 36 h) → heads-up; in force / far away → no', () => {
  const ans = { source: 'nws', alerts: [
    { event: 'typhoon8', active: false, onset: '2026-10-09T02:00:00Z' },
    { event: 'rainstorm', active: true, onset: '2026-10-08T01:00:00Z' },
    { event: 'hot', active: false, onset: '2026-10-11T02:00:00Z' },
    { event: null, active: false, onset: '2026-10-08T10:00:00Z' },
  ] };
  assert.deepEqual(feedHeadsUps(ans, 'America/New_York', NOON), [{ cat: 'typhoon', date: '2026-10-08', official: true }]);
});

test('MET Norway tomorrow: absolute game thresholds', () => {
  const fc = { daily: { time: ['2026-10-08', '2026-10-09'], wind_gusts_10m_max: [20, 95], wind_speed_10m_max: [10, 40], precipitation_sum: [0, 60], temperature_2m_max: [20, 36], temperature_2m_min: [10, 2] } };
  assert.deepEqual(metHeadsUps(fc, '2026-10-09').map((u) => u.cat), ['typhoon', 'rain', 'heat', 'cold']);
  assert.deepEqual(metHeadsUps(fc, '2026-10-10'), []);
});

test('plan: opt-in only, quiet hours, one per event per device, not while already warned', () => {
  const rec = (token, extra = {}) => ({ token, state: { headsUp: true, tz: 'Asia/Hong_Kong', tree: 'ok', ...extra } });
  const records = [rec('a'), rec('b', { headsUp: false }), { token: 'old', state: null }, rec('dead', { tree: 'dead' }), rec('ny', { tz: 'America/New_York' })];
  const ups = [{ cat: 'typhoon', date: '2026-10-09' }];
  const sent = {};
  const first = planHeadsUps(records, ups, { typhoon: 0 }, sent, NOON);
  // New York is at 00:00 → quiet; the opted-out, old (no state) and dead devices get nothing.
  assert.deepEqual(first.map((p) => p.record.token), ['a']);
  assert.equal(planHeadsUps(records, ups, { typhoon: 0 }, sent, NOON + 600_000).length, 0, 'once per event');
  assert.equal(planHeadsUps([rec('c')], ups, { typhoon: 1 }, {}, NOON).length, 0, 'already warned');
  assert.equal(quietNow('Asia/Hong_Kong', Date.parse('2026-10-08T15:00:00Z')), true); // 23:00 HKT
  assert.equal(quietNow('Asia/Hong_Kong', Date.parse('2026-10-08T00:30:00Z')), false); // 08:30 HKT
  // A quiet-hours device gets it in the morning while the day is still ahead.
  const morningNY = Date.parse('2026-10-08T13:00:00Z'); // 09:00 New York
  assert.deepEqual(planHeadsUps([rec('ny', { tz: 'America/New_York' })], [{ cat: 'rain', date: localDate('America/New_York', morningNY, 1) }], {}, sent, morningNY).map((p) => p.today), [false]);
  // Old sends are forgotten after 3 days.
  planHeadsUps([], [], {}, sent, NOON + 4 * 24 * 3600_000);
  assert.deepEqual(sent, {});
});

test('texts: 4 languages, official vs model note, safety-only wind before 青年樹', () => {
  const hk = headsUpMessage({ cat: 'typhoon', date: 'x' }, { loc: 'zh-HK', src: 'hko' });
  assert.equal(hk.title, '聽日可能打風');
  assert.match(hk.body, /加固.*香港天文台/);
  assert.match(headsUpMessage({ cat: 'typhoon', date: 'x' }, { loc: 'zh-HK', src: 'hko', rUnlocked: false }).body, /注意安全/);
  assert.match(headsUpMessage({ cat: 'heat', date: 'x' }, { loc: 'en', src: 'met' }).body, /heads-up only/);
  assert.match(headsUpMessage({ cat: 'cold', date: 'x' }, { loc: 'zh-CN', src: 'met', today: true }).title, /^今天稍晚/);
  assert.match(headsUpMessage({ cat: 'rain', date: 'x' }, { loc: 'zh-TW', src: 'cwa' }).body, /中央氣象署/);
  assert.equal(hk.category, 'headsup-typhoon');
});
