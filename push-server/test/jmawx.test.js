import test from 'node:test';
import assert from 'node:assert/strict';
import { amedasHours, jmaToWmo, nearestStation } from '../src/jmawx.js';

test('JMA weather codes → WMO', () => {
  assert.equal(jmaToWmo('100'), 0);
  assert.equal(jmaToWmo('101'), 1);
  assert.equal(jmaToWmo('200'), 3);
  assert.equal(jmaToWmo('300'), 63);
  assert.equal(jmaToWmo('240'), 95);
  assert.equal(jmaToWmo('400'), 73);
  assert.equal(jmaToWmo(''), null);
});

test('nearest AMeDAS station with temperature and wind, ≤ 40 km', () => {
  const table = { 44132: { elems: '11111111', lat: [35, 41.5], lon: [139, 45.0], kjName: '東京' }, 1: { elems: '00010000', lat: [35, 41], lon: [139, 46], kjName: 'rain only' } };
  assert.equal(nearestStation(table, 35.68, 139.76).name, '東京');
  assert.equal(nearestStation(table, 37.56, 126.97), null);
});

test('10-minute records → hours (rain summed, wind / gust max, hh:00 closes the previous hour)', () => {
  const rec = {};
  for (let m = 10; m <= 60; m += 10) {
    const hh = m === 60 ? '02' : '01', mm = m === 60 ? '00' : String(m);
    rec[`20261008${hh}${mm.padStart(2, '0')}00`] = { temp: [20, 0], humidity: [70, 0], wind: [5, 0], gust: [m === 30 ? 20 : 8, 0], precipitation10m: [1, 0] };
  }
  const { hours } = amedasHours(rec);
  assert.equal(hours.length, 1);
  assert.equal(hours[0].mm, 6);
  assert.equal(hours[0].gust, 72);
  assert.equal(hours[0].wind, 18);
  assert.equal(hours[0].code, 63);
  assert.equal(new Date(hours[0].t).toISOString(), '2026-10-07T16:00:00.000Z');
});
