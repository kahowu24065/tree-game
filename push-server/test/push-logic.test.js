import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REMINDER_MS, stepScope } from '../src/alerts.js';
import { localDate, reminderFor, shouldNotify } from '../src/warnings.js';
import { parseState } from '../src/tokens.js';
import { cellKey, currentEventsIntl, intlMessageFor, levelsFromEvents, parseOpenMeteo } from '../src/intl.js';

const Z = { heat: 0, rain: 0, typhoon: 0, cold: 0 };
const T0 = Date.parse('2026-09-27T02:00:00Z');

test('stepScope: first sight silent; issue fires; one reminder after 2 h; cancel clears', () => {
  let s = stepScope(null, { ...Z, rain: 1 }, T0);
  assert.deepEqual([s.fresh, s.reminders], [[], []]);
  s = stepScope(s.state, { ...Z, rain: 1 }, T0 + 3 * REMINDER_MS);
  assert.deepEqual(s.reminders, [], 'no reminder for a warning already in force at first sight');
  s = stepScope(s.state, Z, T0);
  s = stepScope(s.state, { ...Z, heat: 1 }, T0);
  assert.deepEqual(s.fresh, [{ category: 'heat', level: 1 }]);
  let r = stepScope(s.state, { ...Z, heat: 1 }, T0 + REMINDER_MS - 1);
  assert.deepEqual(r.reminders, []);
  r = stepScope(r.state, { ...Z, heat: 1 }, T0 + REMINDER_MS);
  assert.deepEqual(r.reminders, [{ category: 'heat', level: 1 }]);
  r = stepScope(r.state, { ...Z, heat: 1 }, T0 + 5 * REMINDER_MS);
  assert.deepEqual(r.reminders, [], 'max one reminder');
  const up = stepScope(r.state, { ...Z, heat: 1, typhoon: 3 }, T0);
  assert.deepEqual(up.fresh, [{ category: 'typhoon', level: 3 }]);
});

test('shouldNotify: action-aware, dead trees and pre-youth wind skipped', () => {
  const day = localDate('Asia/Hong_Kong', T0);
  const st = (x) => ({ day, tz: 'Asia/Hong_Kong', done: { heat: false, drain: false, reinforce: false, warm: false }, rUnlocked: true, alive: true, ...x });
  assert.equal(shouldNotify(undefined, 'heat', T0), true);
  assert.equal(shouldNotify(st({}), 'heat', T0), true);
  assert.equal(shouldNotify(st({ done: { heat: true } }), 'heat', T0), false);
  assert.equal(shouldNotify(st({ done: { heat: true } }), 'rain', T0), true);
  assert.equal(shouldNotify(st({ done: { drain: true } }), 'rain', T0), false);
  assert.equal(shouldNotify(st({ done: { reinforce: true } }), 'typhoon', T0), false);
  assert.equal(shouldNotify(st({ done: { warm: true } }), 'cold', T0), false);
  assert.equal(shouldNotify(st({ day: '2026-09-26', done: { heat: true } }), 'heat', T0), true, 'yesterday’s action does not count');
  assert.equal(shouldNotify(st({ alive: false }), 'heat', T0), false);
  assert.equal(shouldNotify(st({ rUnlocked: false }), 'typhoon', T0), false);
  assert.equal(shouldNotify(st({ rUnlocked: false }), 'rain', T0), true);
  assert.match(reminderFor({ category: 'rain', level: 3 }).title, /黑色暴雨.*仍然生效/);
});

test('parseState validates and rounds the region to 0.5°', () => {
  assert.equal(parseState({ day: 'x' }), null);
  assert.equal(parseState({ day: '2026-09-27', tz: 'Not/AZone' }), null);
  const s = parseState({ day: '2026-09-27', tz: 'Asia/Tokyo', done: { heat: true, drain: 'yes' }, region: { lat: 35.68, lon: 139.77 }, isHK: false, rUnlocked: true, alive: true }, 5);
  assert.deepEqual(s, { day: '2026-09-27', tz: 'Asia/Tokyo', done: { heat: true, drain: false, reinforce: false, warm: false }, region: { lat: 35.5, lon: 140 }, isHK: false, rUnlocked: true, alive: true, at: 5 });
  assert.equal(parseState({ day: '2026-09-27', isHK: false }).isHK, true, 'no region → treated as HK');
});

test('non-HK: Open-Meteo → game events → levels', () => {
  const past = Array.from({ length: 14 }, () => 0);
  const body = {
    timezone: 'Asia/Tokyo',
    current: { time: '2026-09-27T11:00', temperature_2m: 30, precipitation: 5, weather_code: 63, wind_speed_10m: 20, wind_gusts_10m: 40 },
    daily: {
      time: [...past.map((_, i) => `2026-09-${String(13 + i).padStart(2, '0')}`), '2026-09-27', '2026-09-28'],
      weather_code: [...past.map(() => 1), 63, 1],
      temperature_2m_max: [...past.map(() => 26), 32, 27],
      temperature_2m_min: [...past.map(() => 20), 24, 20],
      precipitation_sum: [...past.map(() => 0), 30, 0],
      wind_speed_10m_max: [...past.map(() => 10), 20, 10],
      wind_gusts_10m_max: [...past.map(() => 20), 40, 20],
    },
  };
  const w = parseOpenMeteo(body);
  assert.deepEqual(w.normals, { min: 20, max: 26 });
  const ev = currentEventsIntl(w.current, w.today, w.normals);
  // precip 5 mm/h × 6 = 30 → 大雨; 32 °C ≥ 28 and ≥ 26 + 5 → 酷熱
  assert.deepEqual(ev.sort(), ['hot', 'rainstorm']);
  assert.deepEqual(levelsFromEvents(ev), { heat: 1, rain: 1, typhoon: 0, cold: 0 });
  assert.deepEqual(levelsFromEvents(['typhoon1', 'thunder', 'blackrain']), { heat: 0, rain: 2, typhoon: 2, cold: 0 });
  assert.equal(cellKey(35.68, 139.77), '35.5,140.0');
  assert.match(intlMessageFor({ category: 'rain', level: 2 }).title, /豪雨/);
  assert.match(intlMessageFor({ category: 'rain', level: 1 }).body, /大雨疏水/);
  assert.match(intlMessageFor({ category: 'typhoon', level: 3 }).title, /暴風/);
});
