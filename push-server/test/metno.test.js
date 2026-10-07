import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createMetClient, metKey, symbolToWmo, toOpenMeteoShape, MET_UA } from '../src/metno.js';
import { parseObserved } from '../src/intl.js';

const body = JSON.parse(fs.readFileSync(new URL('./fixtures/metno-london.json', import.meta.url)));
const first = Date.parse(body.properties.timeseries[0].time);

test('symbol codes → WMO', () => {
  assert.equal(symbolToWmo('clearsky_day'), 0);
  assert.equal(symbolToWmo('heavyrain'), 65);
  assert.equal(symbolToWmo('rainandthunder'), 95);
  assert.equal(symbolToWmo('lightsnowshowers_night'), 85);
});

test('MET → Open-Meteo shape, local time zone, 7 days, sun times', () => {
  const o = toOpenMeteoShape(body, [], 51.51, -0.13, 'Europe/London', first + 600_000);
  assert.equal(o.timezone, 'Europe/London');
  assert.equal(o.daily.time.length, 7);
  assert.match(o.daily.sunrise[0], /T0[5-8]:/);
  assert.ok(o.hourly.time.length >= 10);
  assert.ok(typeof o.current.temperature_2m === 'number');
  assert.ok(o.current.wind_gusts_10m >= o.current.wind_speed_10m);
});

test('passed hours become pastHours and feed observed pushes', () => {
  const past = [{ t: first - 3600_000, temp: 10, hum: 80, wind: 70, gust: 120, mm: 40, prob: 90, code: 95, night: false }];
  const o = toOpenMeteoShape(body, past, 51.51, -0.13, 'Europe/London', first + 600_000, { pastHours: 24, forecastHours: 1, forecastDays: 1 });
  const w = parseObserved(o);
  assert.equal(w.hours.length, 1);
  assert.equal(w.hours[0].gustKmh, 120);
});

test('client: identifying UA, ≤4 decimals, cache until Expires, If-Modified-Since', async () => {
  const calls = [];
  let t = first + 600_000;
  const fetchImpl = async (url, opts) => {
    calls.push({ url, headers: opts.headers });
    const h = new Headers({ expires: new Date(t + 1800_000).toUTCString(), 'last-modified': 'Wed, 07 Oct 2026 15:05:30 GMT' });
    if (opts.headers['if-modified-since']) return new Response(null, { status: 304, headers: h });
    return new Response(JSON.stringify(body), { status: 200, headers: h });
  };
  const c = createMetClient({ fetchImpl, now: () => t });
  await c.forecast(51.512345, -0.12999, 'Europe/London');
  await c.forecast(51.5123, -0.13, 'Europe/London');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers['user-agent'], MET_UA);
  assert.match(calls[0].url, /lat=51\.51&lon=-0\.13$/);
  t += 3600_000;
  await c.forecast(51.51, -0.13, 'Europe/London');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].headers['if-modified-since'], 'Wed, 07 Oct 2026 15:05:30 GMT');
  assert.equal(metKey(51.512345, -0.13), '51.51,-0.13');
});
