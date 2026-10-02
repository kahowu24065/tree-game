import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedDropMessageFor, feedLevels, feedMessageFor, heatAlerts, parseHeatCsv } from '../src/official.js';
import { observedEventsIntl } from '../src/intl.js';
import { parseState } from '../src/tokens.js';

const csv = (report, t1, t2, rows) =>
  ['ReportDate,' + report.slice(0, 10).replace(/-/g, '/'), 'ReportTime,' + report.slice(11), 'TargetDate1,' + t1.replace(/-/g, '/'), 'TargetDate2,' + t2.replace(/-/g, '/'), '府県予報区等,,,コード,,,1,2', ...rows.map(([code, a, b]) => `x,x,x,${code},x,x,${a},${b}`)].join('\r\n');
const NOW = Date.parse('2026-08-15T03:00:00Z'); // 12:00 JST

test('heat CSV → today in force, tomorrow issued; special sticky; 2 counts as alert', () => {
  const am = parseHeatCsv(csv('2026-08-15T05:00', '2026-08-15', '2026-08-16', [['300000', 3, 9], ['130000', 0, 9], ['400000', 2, 9]]));
  const eve = parseHeatCsv(csv('2026-08-14T17:00', '2026-08-15', '2026-08-16', [['300000', 1, 1], ['130000', 1, 0]]));
  assert.equal(am.target1, '2026-08-15');
  const wk = heatAlerts([am, eve], '300000', NOW);
  assert.deepEqual(wk.map((a) => [a.kind, a.active, a.event]), [['jp-heat-special', true, 'hot'], ['jp-heat', false, 'hot']]);
  assert.equal(heatAlerts([am, eve], '130000', NOW).length, 0); // newest says none today
  assert.equal(heatAlerts([am], '400000', NOW)[0].kind, 'jp-heat');
  assert.equal(parseHeatCsv('<html>404</html>'), null);
});

test('feed levels + messages in four languages, start and cancel', () => {
  const answer = { source: 'jma', alerts: heatAlerts([parseHeatCsv(csv('2026-08-15T05:00', '2026-08-15', '2026-08-16', [['300000', 1, 0]]))], '300000', NOW).concat([{ event: 'rainstorm', active: true, name: '大雨警報', nameEn: 'Heavy Rain Warning', ends: null }]) };
  const { levels, names } = feedLevels(answer, NOW);
  assert.equal(levels.heat, 1);
  assert.equal(levels.rain, 1);
  assert.equal(names.heat.src, 'moe');
  const t = { 'zh-HK': '中暑警戒警報', 'zh-TW': '中暑警戒警報', 'zh-CN': '中暑警戒警报', en: 'Heatstroke Alert' };
  for (const [loc, name] of Object.entries(t)) {
    const m = feedMessageFor({ category: 'heat', level: 1 }, names, false, loc);
    assert.ok(m.title.includes(name), m.title);
    assert.ok(m.body.length > 0);
    assert.ok(feedMessageFor({ category: 'heat', level: 1 }, names, true, loc).title.includes(name));
    const end = feedDropMessageFor({ category: 'rain', from: 1, to: 0 }, names, {}, loc);
    assert.equal(end.level, 0);
    assert.ok(end.title.includes(loc === 'en' ? 'Heavy Rain Warning' : '大雨警報'), end.title);
  }
  assert.equal(feedLevels({ source: 'nws', alerts: [{ event: 'hot', active: false, name: 'x' }] }, NOW).levels.heat, 0);
});

test('observed-only numbers (no feed): past hours + live reading, no forecast', () => {
  const hours = [1, 2, 3, 4].map((h) => ({ time: `2026-10-02T0${h}:00`, tempC: 20, precipMm: h === 4 ? 40 : 0, code: h === 4 ? 65 : 0, gustKmh: 10, windKmh: 5 }));
  const w = { today: '2026-10-02', current: { time: '2026-10-02T04:30', tempC: 20, precipMm: 0, code: 3, gustKmh: 10, windKmh: 5 }, hours, normals: { max: 25, min: 18 } };
  assert.ok(observedEventsIntl(w).includes('rainstorm') || observedEventsIntl(w).includes('blackrain'));
  assert.deepEqual(observedEventsIntl({ ...w, hours: hours.map((h) => ({ ...h, precipMm: 0, code: 0 })) }), []);
});

test('device state carries a ~0.1° area', () => {
  const s = parseState({ day: '2026-10-02', tz: 'Asia/Tokyo', region: { lat: 35.5, lon: 139.5 }, area: { lat: 35.6895, lon: 139.6917 }, isHK: false });
  assert.deepEqual(s.area, { lat: 35.7, lon: 139.7 });
  assert.equal(parseState({ day: '2026-10-02', region: { lat: 35.5, lon: 139.5 } }).area, null);
});
