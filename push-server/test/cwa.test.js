import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCwa, cwaWarnings, eventsFromCwa, inTaiwan, rainTier, twLevels, twMessageFor, twDropMessageFor } from '../src/cwa.js';
import { parseState } from '../src/tokens.js';

const sets = JSON.parse(fs.readFileSync(new URL('./fixtures/cwa-taipei.json', import.meta.url)));
const at = (iso) => Date.parse(iso);

test('inTaiwan covers Taiwan, Penghu, Kinmen, Matsu but not HK / Macau / Xiamen', () => {
  for (const [la, lo] of [[25.04, 121.56], [22.63, 120.3], [23.57, 119.58], [24.43, 118.32], [26.16, 119.95]]) assert.ok(inTaiwan(la, lo), `${la},${lo}`);
  for (const [la, lo] of [[22.3, 114.17], [22.19, 113.54], [24.48, 118.09], [22.54, 114.06]]) assert.ok(!inTaiwan(la, lo), `${la},${lo}`);
});

test('buildCwa for Taipei: nearest station, forecast, 高溫資訊 → hot', () => {
  const b = buildCwa(sets, 25.04, 121.56, at('2026-10-01T10:00:00+08:00'));
  assert.equal(b.county, '臺北市');
  assert.ok(b.current.stationKm < 5);
  assert.ok(b.forecast.length >= 5);
  assert.ok(b.forecast.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && /級$/.test(d.wind)));
  assert.equal(b.warnings[0].type, 'heat');
  assert.match(b.warnings[0].name, /^高溫資訊（.+燈號）$/);
  assert.deepEqual(b.events, ['hot']);
  // Before the notice's onset nothing applies.
  assert.deepEqual(buildCwa(sets, 25.04, 121.56, at('2026-10-01T02:00:00+08:00')).events, []);
});

test('rain tiers and the Taiwan → game event table', () => {
  assert.deepEqual([rainTier('大雨特報'), rainTier('豪雨特報'), rainTier('大豪雨特報'), rainTier('超大豪雨特報')], [1, 2, 3, 4]);
  const ev = (type, level) => eventsFromCwa([{ type, level }]);
  assert.deepEqual(ev('typhoon', 1), ['typhoon1']);
  assert.deepEqual(ev('typhoon', 2), ['typhoon8']);
  assert.deepEqual(ev('rain', 1), ['rainstorm']);
  for (const l of [2, 3, 4]) assert.deepEqual(ev('rain', l), ['blackrain']);
  assert.deepEqual(ev('wind', 1), ['typhoon1']);
  assert.deepEqual(ev('wind', 2), ['thunder']);
  assert.deepEqual(ev('wind', 3), ['typhoon8']);
  assert.deepEqual(ev('cold', 3), ['cold']);
  assert.deepEqual(ev('heat', 1), ['hot']);
  assert.deepEqual(ev('fog', 1), []);
  assert.deepEqual(ev('thunder', 1), ['thunder']);
});

test('county hazards (W-C0033-001) and CAP rain / typhoon', () => {
  const s = {
    county: { records: { location: [{ locationName: '臺北市', hazardConditions: { hazards: [{ info: { phenomena: '豪雨', significance: '特報' } }] } }] } },
    typhoonCap: { records: { info: [{ urgency: 'Expected', headline: '海上颱風警報', area: [{ areaDesc: '臺灣附近海面' }], description: 'x' }] } },
  };
  const w = cwaWarnings(s, '臺北市', '信義區', Date.now());
  const names = Object.fromEntries(w.map((x) => [x.type, x.name]));
  assert.equal(names.rain, '豪雨特報');
  assert.equal(names.typhoon, '海上颱風警報');
  const { levels, names: n } = twLevels(w);
  assert.equal(levels.rain, 2);
  assert.equal(levels.typhoon, 1);
  assert.equal(twMessageFor({ category: 'rain', level: 2 }, n).title, '中央氣象署：豪雨特報');
  assert.equal(twDropMessageFor({ category: 'rain', from: 2, to: 1 }, n, { rain: '大雨特報' }).title, '豪雨特報轉大雨特報');
  assert.equal(twDropMessageFor({ category: 'rain', from: 1, to: 0 }, { rain: '大雨特報' }, {}).title, '大雨特報已解除');
});

test('parseState: isTW devices leave the HKO poll', () => {
  const s = parseState({ day: '2026-10-01', tz: 'Asia/Taipei', region: { lat: 25.04, lon: 121.56 }, isTW: true, isHK: false, twCounty: '臺北市', twTown: '信義區' });
  assert.equal(s.isTW, true);
  assert.equal(s.isHK, false);
  assert.equal(s.twCounty, '臺北市');
  assert.equal(parseState({ day: '2026-10-01', isTW: true, twCounty: 'x' }).twCounty, null);
});

test('大雷雨即時訊息: NCDR feed → CWA CAP → thunder (wind level 2, harshest wins)', async () => {
  const { thunderLinks, parseCapXml } = await import('../src/cwa.js');
  const atom = `<feed><entry><id>CWA-Weather_thunderstorm_202610011403001</id><title>雷雨</title><author><name>中央氣象署</name></author>
    <link rel="alternate" href="https://alerts.ncdr.nat.gov.tw/Capstorage/CWA/2026/thunderstorm/a.cap" /><category term="雷雨" /><cap:msgType>Alert</cap:msgType></entry>
    <entry><id>CWA-Weather_heat_1</id><title>高溫</title><author><name>中央氣象署</name></author><link rel="alternate" href="https://alerts.ncdr.nat.gov.tw/h.cap" /></entry>
    <entry><id>X-1</id><title>雷雨</title><author><name>某縣政府</name></author><link rel="alternate" href="https://alerts.ncdr.nat.gov.tw/x.cap" /></entry></feed>`;
  assert.deepEqual(thunderLinks(atom), ['https://alerts.ncdr.nat.gov.tw/Capstorage/CWA/2026/thunderstorm/a.cap']);
  const cap = `<alert><msgType>Alert</msgType><info><event>雷雨</event><urgency>Expected</urgency><headline>雷雨即時訊息</headline>
    <effective>2026-10-01T14:03:00+08:00</effective><onset>2026-10-01T14:03:00+08:00</onset><expires>2026-10-01T15:00:00+08:00</expires>
    <description>氣象署發布大雷雨即時訊息</description><area><areaDesc>臺北市信義區</areaDesc></area><area><areaDesc>新北市新店區</areaDesc></area></info></alert>`;
  const thunderCap = { records: { info: parseCapXml(cap) } };
  const at = Date.parse('2026-10-01T14:30:00+08:00');
  const w = cwaWarnings({ thunderCap }, '臺北市', '信義區', at);
  assert.deepEqual(w.map((x) => x.name), ['大雷雨即時訊息']);
  assert.deepEqual(eventsFromCwa(w), ['thunder']);
  // 1.4.24: another town of the county → shown (areas, mine false) but no event.
  const other = cwaWarnings({ thunderCap }, '臺北市', '中正區', at);
  assert.equal(other.length, 1);
  assert.equal(other[0].mine, false);
  assert.deepEqual(other[0].areas, ['信義區']);
  assert.deepEqual(eventsFromCwa(other), []);
  assert.deepEqual(cwaWarnings({ thunderCap }, '高雄市', '前鎮區', at), []);
  assert.deepEqual(cwaWarnings({ thunderCap }, '臺北市', '信義區', Date.parse('2026-10-01T15:10:00+08:00')), []);
  assert.deepEqual(parseCapXml(cap.replace('<msgType>Alert', '<msgType>Cancel')), []);
  const { levels, names } = twLevels(w);
  assert.equal(levels.typhoon, 2);
  assert.equal(twMessageFor({ category: 'typhoon', level: 2 }, names).title, '中央氣象署：大雷雨即時訊息');
  // With 陸上強風紅色 at the same time the harsher one wins.
  const both = twLevels([...w, { type: 'wind', level: 3, name: '陸上強風特報（紅色燈號）' }]);
  assert.equal(both.levels.typhoon, 3);
  assert.equal(both.names.typhoon, '陸上強風特報（紅色燈號）');
});

test('1.4.24 陸上強風 not yet started / other towns: 概述、注意事項、onset, areas, no event', async () => {
  const { readFileSync } = await import('node:fs');
  const sets = JSON.parse(readFileSync(new URL('./fixtures/cwa-wind-upcoming.json', import.meta.url), 'utf8'));
  const before = Date.parse('2026-10-02T08:00:00+08:00');
  const during = Date.parse('2026-10-02T12:00:00+08:00');
  const [w] = cwaWarnings(sets, '臺中市', '烏日區', before);
  assert.equal(w.type, 'wind');
  assert.equal(w.level, 1);
  assert.match(w.overview, /^東北風增強/);
  assert.match(w.precautions, /^黃色燈號/);
  assert.equal(w.onset, '2026-10-02T11:00:00+08:00');
  assert.equal(w.expires, '2026-10-02T23:00:00+08:00');
  assert.deepEqual(w.areas, ['清水區', '大甲區', '大安區', '龍井區', '梧棲區']);
  assert.equal(w.started, false);
  assert.equal(w.mine, false);
  assert.deepEqual(eventsFromCwa([w]), []);
  assert.equal(twLevels([w]).levels.typhoon, 0);
  // Started, but still not this town.
  assert.equal(cwaWarnings(sets, '臺中市', '烏日區', during)[0].active, false);
  // A listed town: active once it starts.
  const mine = cwaWarnings(sets, '臺中市', '清水區', during)[0];
  assert.equal(mine.active, true);
  assert.deepEqual(eventsFromCwa([mine]), ['typhoon1']);
  assert.equal(cwaWarnings(sets, '臺中市', '清水區', before)[0].active, false);
  // Without the CAP the county list + 天氣特報 text still give the detail (county-wide, so mine).
  const county = cwaWarnings({ county: sets.county, text: sets.text }, '臺中市', '烏日區', during)[0];
  assert.match(county.overview, /^東北風增強/);
  assert.match(county.precautions, /^黃色燈號/);
  assert.equal(county.onset, '2026-10-02T11:00:00+08:00');
  assert.equal(county.active, true);
  assert.equal(cwaWarnings({ county: sets.county, text: sets.text }, '臺中市', '烏日區', before)[0].active, false);
});
