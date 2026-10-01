import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REMINDER_MS, stepScope } from '../src/alerts.js';
import { deviceMessage, dropMessageFor, levelsFromWarnsum, localDate, messageFor, reminderFor, shouldNotify } from '../src/warnings.js';
import { parseState } from '../src/tokens.js';
import { cellKey, currentEventsIntl, intlDropMessageFor, intlMessageFor, levelsFromEvents, parseOpenMeteo } from '../src/intl.js';
import { warnsumFromSmg } from '../src/smg.js';

const Z = { heat: 0, rain: 0, typhoon: 0, cold: 0, landslip: 0 };
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

test('shouldNotify v1.4: action-aware issue/reminder; dead trees and pre-youth wind still get issues; drops always', () => {
  const day = localDate('Asia/Hong_Kong', T0);
  const st = (x) => ({ day, tz: 'Asia/Hong_Kong', done: { heat: false, drain: false, reinforce: false, warm: false }, rUnlocked: true, alive: true, tree: 'ok', ...x });
  assert.equal(shouldNotify(undefined, 'heat', T0), true);
  assert.equal(shouldNotify(st({}), 'heat', T0), true);
  assert.equal(shouldNotify(st({ done: { heat: true } }), 'heat', T0), false);
  assert.equal(shouldNotify(st({ done: { heat: true } }), 'rain', T0), true);
  assert.equal(shouldNotify(st({ done: { drain: true } }), 'rain', T0), false);
  assert.equal(shouldNotify(st({ done: { reinforce: true } }), 'typhoon', T0), false);
  assert.equal(shouldNotify(st({ done: { reinforce: true } }), 'landslip', T0), false, 'one 加固 covers 山泥傾瀉 too');
  assert.equal(shouldNotify(st({ done: { warm: true } }), 'cold', T0), false);
  assert.equal(shouldNotify(st({ day: '2026-09-26', done: { heat: true } }), 'heat', T0), true, 'yesterday’s action does not count');
  assert.equal(shouldNotify(st({ alive: false, tree: 'dead' }), 'heat', T0), true, 'dead trees still get warnings');
  assert.equal(shouldNotify(st({ alive: false, tree: 'dead' }), 'heat', T0, 'reminder'), false);
  assert.equal(shouldNotify(st({ rUnlocked: false }), 'typhoon', T0), true, 'pre-youth: safety notice');
  assert.equal(shouldNotify(st({ rUnlocked: false }), 'landslip', T0), true);
  assert.equal(shouldNotify(st({ rUnlocked: false }), 'typhoon', T0, 'reminder'), false, 'no 加固 reminder before 青年樹');
  assert.equal(shouldNotify(st({ done: { heat: true } }), 'heat', T0, 'drop'), true, 'info always');
  assert.match(reminderFor({ category: 'rain', level: 3 }).title, /黑色暴雨.*仍然生效/);
});

test('per-device text: safety notice before 青年樹, tree-state line, drops untouched', () => {
  const day = localDate('Asia/Hong_Kong', T0);
  const base = { day, tz: 'Asia/Hong_Kong', done: {}, rUnlocked: true, tree: 'ok', resist: 50 };
  const t8 = messageFor({ category: 'typhoon', level: 3 });
  const safe = deviceMessage(t8, { ...base, rUnlocked: false }, 'issue');
  assert.match(safe.body, /現實中請注意安全/);
  assert.doesNotMatch(safe.body, /加固/);
  assert.match(deviceMessage(messageFor({ category: 'landslip', level: 1 }), { ...base, rUnlocked: false }, 'issue').body, /斜坡/);
  assert.match(deviceMessage(t8, { ...base, resist: 30 }, 'issue').body, /抗風力得 30，有倒塌風險/);
  assert.doesNotMatch(deviceMessage(messageFor({ category: 'typhoon', level: 2 }), { ...base, resist: 30 }, 'issue').body, /倒塌/);
  assert.match(deviceMessage(messageFor({ category: 'heat', level: 1 }), { ...base, tree: 'dying' }, 'issue').body, /瀕死/);
  assert.match(deviceMessage(messageFor({ category: 'heat', level: 1 }), { ...base, tree: 'dead' }, 'issue').body, /枯死/);
  const drop = dropMessageFor({ category: 'rain', from: 2, to: 1 });
  assert.equal(deviceMessage(drop, { ...base, tree: 'dead' }, 'drop'), drop);
});

test('drop / cancel texts', () => {
  assert.equal(dropMessageFor({ category: 'rain', from: 2, to: 1 }).title, '紅雨轉黃雨');
  assert.equal(dropMessageFor({ category: 'typhoon', from: 3, to: 2 }).title, '八號風球轉三號風球');
  assert.equal(dropMessageFor({ category: 'heat', from: 1, to: 0 }).title, '酷熱天氣警告已取消');
  assert.equal(dropMessageFor({ category: 'landslip', from: 1, to: 0 }).title, '山泥傾瀉警告已取消');
  assert.equal(dropMessageFor({ category: 'typhoon', from: 2, to: 0 }).title, '熱帶氣旋警告信號已取消');
  assert.equal(intlDropMessageFor({ category: 'rain', from: 2, to: 1 }).title, '豪雨轉大雨');
  assert.match(intlDropMessageFor({ category: 'typhoon', from: 1, to: 0 }).title, /烈風天氣已完結/);
});

test('stepScope drops: HK immediate; cells need 2 lower readings (no flapping)', () => {
  let s = stepScope(null, { ...Z, rain: 2 }, T0).state;
  let r = stepScope(s, { ...Z, rain: 1 }, T0);
  assert.deepEqual(r.drops, [{ category: 'rain', from: 2, to: 1 }]);
  r = stepScope(r.state, Z, T0);
  assert.deepEqual(r.drops, [{ category: 'rain', from: 1, to: 0 }]);
  // cell: one low reading is not enough; back up = nothing at all
  let c = stepScope(null, { ...Z, typhoon: 3 }, T0).state;
  let x = stepScope(c, Z, T0, { confirmDrops: 2 });
  assert.deepEqual([x.drops, x.fresh], [[], []]);
  x = stepScope(x.state, { ...Z, typhoon: 3 }, T0, { confirmDrops: 2 });
  assert.deepEqual([x.drops, x.fresh], [[], []]);
  x = stepScope(x.state, { ...Z, typhoon: 1 }, T0, { confirmDrops: 2 });
  x = stepScope(x.state, Z, T0, { confirmDrops: 2 });
  assert.deepEqual(x.drops, [{ category: 'typhoon', from: 3, to: 1 }], 'confirmed at the higher of the two lower readings');
  x = stepScope(x.state, Z, T0, { confirmDrops: 2 });
  x = stepScope(x.state, Z, T0, { confirmDrops: 2 });
  assert.deepEqual(x.drops, [{ category: 'typhoon', from: 1, to: 0 }]);
});

test('landslip (WL): issue, reminder, cancel', () => {
  const on = levelsFromWarnsum({ WL: { name: '山泥傾瀉警告', code: 'WL', actionCode: 'ISSUE' } });
  assert.equal(on.landslip, 1);
  let s = stepScope({ levels: Z, alerts: {} }, on, T0);
  assert.deepEqual(s.fresh, [{ category: 'landslip', level: 1 }]);
  assert.match(messageFor(s.fresh[0]).title, /山泥傾瀉警告生效/);
  assert.match(messageFor(s.fresh[0]).body, /加固/);
  const rem = stepScope(s.state, on, T0 + REMINDER_MS);
  assert.deepEqual(rem.reminders, [{ category: 'landslip', level: 1 }]);
  const off = stepScope(rem.state, levelsFromWarnsum({ WL: { code: 'WL', actionCode: 'CANCEL' } }), T0);
  assert.deepEqual(off.drops, [{ category: 'landslip', from: 1, to: 0 }]);
});

test('SMG warnings become the same levels as HKO, and a cancelled alert does not', () => {
  const on = levelsFromWarnsum(warnsumFromSmg({
    typhoon: '<TropicalCyclone><Warncode>3</Warncode><Action>ISSUE</Action><Status>1</Status><Inforce>1</Inforce><Description>三號強風信號</Description></TropicalCyclone>',
    rain: '<Rainstorm><Warncode>YELLOW</Warncode><Action>ISSUE</Action><Status>1</Status><Description>黃色暴雨警告信號</Description></Rainstorm>',
    temp: '<item><title>黃色高溫提示</title><description>酷熱</description></item>',
  }));
  assert.deepEqual(on, { ...Z, heat: 1, rain: 1, typhoon: 2 });
  const off = levelsFromWarnsum(warnsumFromSmg({
    typhoon: '<TropicalCyclone><Action>NIL</Action><Status>0</Status><Inforce>0</Inforce><Description>現時並沒有熱帶氣旋信號。</Description></TropicalCyclone>',
    temp: '<item><title>黃色高溫提示</title><description>黃色高溫提示已經取消。</description></item>',
  }));
  assert.deepEqual(off, Z);
});

test('parseState validates and rounds the region to 0.5°', () => {
  assert.equal(parseState({ day: 'x' }), null);
  assert.equal(parseState({ day: '2026-09-27', tz: 'Not/AZone' }), null);
  const s = parseState({ day: '2026-09-27', tz: 'Asia/Tokyo', done: { heat: true, drain: 'yes' }, region: { lat: 35.68, lon: 139.77 }, isHK: false, rUnlocked: true, alive: true }, 5);
  assert.deepEqual(s, { day: '2026-09-27', tz: 'Asia/Tokyo', done: { heat: true, drain: false, reinforce: false, warm: false }, region: { lat: 35.5, lon: 140 }, isHK: false, isMO: false, isTW: false, twCounty: null, twTown: null, rUnlocked: true, alive: true, tree: 'ok', locale: null, resist: null, at: 5 });
  assert.equal(parseState({ day: '2026-09-27', tree: 'dying', resist: 33.6 }).resist, 34);
  assert.equal(parseState({ day: '2026-09-27', isHK: false }).isHK, true, 'no region → treated as HK');
  const mo = parseState({ day: '2026-09-27', region: { lat: 22, lon: 113.5 }, isHK: true, isMO: true });
  assert.equal(mo.isMO, true);
  assert.equal(mo.isHK, false, 'Macau is not on the HKO poll');
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
  assert.deepEqual(levelsFromEvents(ev), { heat: 1, rain: 1, typhoon: 0, cold: 0, landslip: 0 });
  assert.deepEqual(levelsFromEvents(['typhoon1', 'thunder', 'blackrain']), { heat: 0, rain: 2, typhoon: 2, cold: 0, landslip: 0 });
  assert.equal(cellKey(35.68, 139.77), '35.5,140.0');
  assert.match(intlMessageFor({ category: 'rain', level: 2 }).title, /豪雨/);
  assert.match(intlMessageFor({ category: 'rain', level: 1 }).body, /大雨疏水/);
  assert.match(intlMessageFor({ category: 'typhoon', level: 3 }).title, /暴風/);
});
