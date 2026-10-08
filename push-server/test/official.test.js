import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOfficialClient, ecccEvent, emmaAt, inForce, loadMeteoalarmAreas, maEvent, nwsEvent, parseEccc, parseJma, parseMeteoalarm, parseNws, tidyAlerts, MA_TTL, MA_DISCLAIMER } from '../src/official.js';

const NOW = Date.parse('2026-10-02T12:00:00Z');

test('event mapping per feed', () => {
  assert.equal(nwsEvent('Flash Flood Warning'), 'blackrain');
  assert.equal(nwsEvent('Flood Warning'), 'rainstorm');
  assert.equal(nwsEvent('Hurricane Warning'), 'typhoon8');
  assert.equal(nwsEvent('Wind Advisory'), 'typhoon1');
  assert.equal(nwsEvent('Severe Thunderstorm Watch'), null);
  assert.equal(nwsEvent('Extreme Heat Warning'), 'hot');
  assert.equal(ecccEvent('rainfall warning', 'orange'), 'rainstorm');
  assert.equal(ecccEvent('rainfall warning', 'red'), 'blackrain');
  assert.equal(ecccEvent('wind warning', 'yellow'), 'typhoon1');
  assert.equal(ecccEvent('extreme cold warning', 'yellow'), 'cold');
  assert.equal(maEvent('10; Rain', '3; orange; Severe'), 'rainstorm');
  assert.equal(maEvent('1; Wind', '4; red; Extreme'), 'typhoon8');
  assert.equal(maEvent('1; Wind', '2; yellow; Moderate'), null);
  assert.equal(maEvent('5; High temperature', '3; orange; Severe'), 'hot');
});

test('inForce: issued and not expired', () => {
  assert.equal(inForce('2026-10-02T10:00:00Z', '2026-10-02T14:00:00Z', NOW), true);
  assert.equal(inForce('2026-10-02T13:00:00Z', '2026-10-02T14:00:00Z', NOW), false);
  assert.equal(inForce(null, '2026-10-02T11:00:00Z', NOW), false);
});

test('NWS parse skips cancels / tests', () => {
  const body = { features: [
    { properties: { id: 'a', status: 'Actual', messageType: 'Alert', event: 'Flood Warning', onset: '2026-10-02T10:00:00Z', ends: '2026-10-02T18:00:00Z', headline: 'h', areaDesc: 'X County' } },
    { properties: { id: 'b', status: 'Test', messageType: 'Alert', event: 'Flood Warning' } },
    { properties: { id: 'c', status: 'Actual', messageType: 'Cancel', event: 'High Wind Warning' } },
  ] };
  const out = parseNws(body, NOW);
  assert.equal(out.length, 1);
  assert.equal(out[0].event, 'rainstorm');
  assert.equal(out[0].active, true);
});

test('ECCC parse keeps only polygons containing the point', () => {
  const sq = (x0, y0, x1, y1) => ({ type: 'Polygon', coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] });
  const body = { features: [
    { id: 1, geometry: sq(-80, 43, -79, 44), properties: { alert_code: 'RF', alert_type: 'warning', alert_name_en: 'rainfall warning', alert_name_fr: 'avertissement de pluie', risk_colour_en: 'orange', publication_datetime: '2026-10-02T09:00:00Z', event_end_datetime: '2026-10-02T20:00:00Z', status_en: 'issued' } },
    { id: 2, geometry: sq(-70, 43, -69, 44), properties: { alert_code: 'HT', alert_type: 'warning', alert_name_en: 'heat warning', publication_datetime: '2026-10-02T09:00:00Z', event_end_datetime: '2026-10-02T20:00:00Z' } },
  ] };
  const out = parseEccc(body, 43.65, -79.38, NOW);
  assert.deepEqual(out.map((a) => a.event), ['rainstorm']);
});

test('JMA r8: latest report per kind, なし clears', () => {
  const r = (t, kinds) => ({ reportDatetime: t, headlineText: 'x', warning: { class20Items: [{ areaCode: '0121400', kinds }] } });
  const reports = [
    r('2026-10-01T15:00:00+09:00', [{ code: '14', status: '発表' }]),
    r('2026-10-02T03:00:00+09:00', [{ code: '15', status: '継続' }]),
    r('2026-10-02T04:00:00+09:00', [{ code: '16', status: '継続' }]),
    r('2026-09-29T10:00:00+09:00', [{ status: '発表警報・注意報はなし' }]),
  ];
  assert.deepEqual(parseJma(reports, '0121400', NOW).map((a) => a.event).sort(), ['thunder', 'typhoon1']);
  reports.push(r('2026-10-02T05:00:00+09:00', [{ code: '14', status: '解除' }]));
  assert.deepEqual(parseJma(reports, '0121400', NOW).map((a) => a.event), ['typhoon1']);
});

test('MeteoAlarm: EMMA area lookup + feed match', () => {
  const areas = loadMeteoalarmAreas();
  const berlin = emmaAt(areas, 52.52, 13.4).map((a) => a.country);
  assert.ok(berlin.includes('DE'));
  const info = (lang, ev) => ({ language: lang, event: ev, onset: '2026-10-02T08:00:00Z', expires: '2026-10-02T20:00:00Z', parameter: [{ valueName: 'awareness_level', value: '3; orange; Severe' }, { valueName: 'awareness_type', value: '10; Rain' }], area: [{ areaDesc: 'A', geocode: [{ valueName: 'EMMA_ID', value: 'DE999' }] }] });
  const body = { warnings: [{ alert: { status: 'Actual', msgType: 'Alert', identifier: 'x', info: [info('de-DE', 'STARKREGEN'), info('en', 'heavy rain')] } }] };
  const out = parseMeteoalarm(body, { codes: ['DE999'], lat: 0, lon: 0 }, NOW);
  assert.equal(out[0].event, 'rainstorm');
  assert.equal(out[0].name, 'STARKREGEN');
  assert.equal(out[0].nameEn, 'heavy rain');
  assert.equal(parseMeteoalarm(body, { codes: ['DE111'], lat: 0, lon: 0 }, NOW).length, 0);
  const poly = { warnings: [{ alert: { status: 'Actual', info: [{ ...info('en', 'gale'), parameter: [{ valueName: 'awareness_level', value: '3; orange; Severe' }, { valueName: 'awareness_type', value: '1; Wind' }], area: [{ areaDesc: 'Coast', polygon: ['59,10 60,10 60,11 59,11 59,10'] }] }] } }] };
  assert.equal(parseMeteoalarm(poly, { codes: [], lat: 59.5, lon: 10.5 }, NOW)[0].event, 'typhoon1');
});

test('1.4.58 MeteoAlarm terms: issue time + issuing service kept, 2-min cache, verbatim disclaimer', async () => {
  const info = { language: 'en', event: 'heavy rain', senderName: 'Deutscher Wetterdienst', onset: '2026-10-02T08:00:00Z', expires: '2026-10-02T20:00:00Z', parameter: [{ valueName: 'awareness_level', value: '3; orange; Severe' }, { valueName: 'awareness_type', value: '10; Rain' }], area: [{ areaDesc: 'A', geocode: [{ valueName: 'EMMA_ID', value: 'DE999' }] }] };
  const body = { warnings: [{ alert: { status: 'Actual', msgType: 'Alert', identifier: 'y', sent: '2026-10-02T07:40:00+00:00', info: [info] } }] };
  const [a] = parseMeteoalarm(body, { codes: ['DE999'], lat: 0, lon: 0 }, NOW);
  assert.equal(a.issued, '2026-10-02T07:40:00+00:00');
  assert.equal(a.issuer, 'Deutscher Wetterdienst');
  assert.equal(MA_TTL, 120_000);
  assert.match(MA_DISCLAIMER, /^Time delays between this website and the www\.meteoalarm\.org website are possible\. For the most up-to-date awareness information as published by the participating National Meteorological and Hydrological Services, please refer to www\.meteoalarm\.org\.$/);
  let calls = 0;
  let t = NOW;
  const fetchImpl = async () => {
    calls++;
    return { ok: true, status: 200, json: async () => body };
  };
  const c = createOfficialClient({ fetchImpl, now: () => t });
  const ans = await c.lookup(52.52, 13.4);
  assert.equal(ans.source, 'meteoalarm');
  assert.equal(ans.disclaimer, MA_DISCLAIMER);
  assert.match(ans.attribution, /EUMETNET – MeteoAlarm/);
  const n = calls;
  t += 60_000;
  await c.lookup(52.52, 13.4);
  assert.equal(calls, n);
  t += 61_000;
  await c.lookup(52.52, 13.4);
  assert.ok(calls > n);
});

test('tidyAlerts drops ended / green / repeats', () => {
  const a = { name: 'n', level: 'orange', active: true, ends: '2026-10-02T20:00:00Z' };
  assert.equal(tidyAlerts([a, { ...a }, { ...a, level: 'green' }, { ...a, name: 'old', ends: '2026-10-02T01:00:00Z' }], NOW).length, 1);
});

test('lookup routing: China not covered, US 400 → not covered, Japan via GSI', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.includes('api.weather.gov')) return { ok: false, status: 400, json: async () => ({}) };
    if (url.includes('gsi.go.jp')) return { ok: true, status: 200, json: async () => ({ results: { muniCd: '13101' } }) };
    if (url.includes('area.json')) return { ok: true, status: 200, json: async () => ({ class20s: { 1310100: { parent: '131011' } }, class15s: { 131011: { parent: '130010' } }, class10s: { 130010: { parent: '130000' } } }) };
    if (url.includes('/r8/130000.json')) return { ok: true, status: 200, json: async () => [{ reportDatetime: '2026-10-02T10:00:00+09:00', warning: { class20Items: [{ areaCode: '1310100', kinds: [{ code: '03', status: '発表' }] }] } }] };
    throw new Error(`unexpected ${url}`);
  };
  const c = createOfficialClient({ fetchImpl, now: () => NOW });
  assert.equal(await c.lookup(39.9, 116.4), null);
  assert.equal(await c.lookup(25.0, -100.0), null);
  const jp = await c.lookup(35.69, 139.75);
  assert.equal(jp.source, 'jma');
  assert.deepEqual(jp.alerts.map((a) => a.event), ['rainstorm']);
});
