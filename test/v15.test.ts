import { afterEach, describe, expect, it } from 'vitest';
import { COLD_DAMAGE, EVENT_ORDER, HEAT_GROWTH, WEATHER_EVENTS, type WeatherEventId } from '../src/balance';
import { freshMeta } from '../src/meta';
import { currentEvents, dayEvent, dayEvents, eventFromNumbers, hkoWarningEvents, isColdDay, isHotDay, severeCountdown } from '../src/events';
import { parseWarnsum } from '../src/hko';
import { emergencyName, eventLabel, labelRegion, regionFor, regionalize, setLabelRegion } from '../src/labels';
import { emergencyBonus, emergencyBonusText } from '../src/rules';
import { createGame, emergencyOptions, eventsForDate, performEmergency, planNight, perksFrom, previewNight, settleDay } from '../src/sim';
import type { ForecastDay, GameState } from '../src/types';
import { previewLines } from '../src/ui';
import { classify, forecastUrl, nearHongKong, parseOpenMeteo, stampDays } from '../src/weather';

const NOW = Date.UTC(2026, 8, 26, 4);
const D = '2026-09-26';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90 }, over);
}

function day(over: Partial<ForecastDay> = {}): ForecastDay {
  return { date: D, code: 1, tempMax: 20, tempMin: 12, precipMm: 0, precipProb: 0, windKmh: 10, gustKmh: 15, sunrise: `${D}T06:00`, sunset: `${D}T18:00`, ...over };
}
const intl = (over: Partial<ForecastDay> = {}, normMin: number | null = null, normMax: number | null = null) => day({ intl: true, normMin, normMax, ...over });

afterEach(() => setLabelRegion('hk'));

describe('v15 寒冷：香港靠天文台 WCOLD', () => {
  it('hko.ts 解析寒冷天氣警告，遊戲當寒冷', () => {
    const warnings = parseWarnsum({ WCOLD: { name: '寒冷天氣警告', code: 'WCOLD', actionCode: 'ISSUE', issueTime: '2026-01-20T16:45:00+08:00' } });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]!.group).toBe('WCOLD');
    expect(hkoWarningEvents(warnings)).toEqual(['cold']);
    expect(currentEvents({ hk: true, warnings, current: { tempC: 9, humidity: 60, precipMm: 0, code: 1, windKmh: 10, gustKmh: 15, isDay: true, time: '' } })).toEqual(['cold']);
  });

  it('取消咗嘅 WCOLD 唔算；香港數字唔會自己判寒冷', () => {
    expect(hkoWarningEvents(parseWarnsum({ WCOLD: { code: 'WCOLD', actionCode: 'CANCEL' } }))).toEqual([]);
    expect(isColdDay({ tempMax: 5, tempMin: 1 })).toBe(false);
    expect(dayEvent(day({ tempMin: 1, tempMax: 6 }))).toBe('clear');
  });

  it('寒冷係獨立一類，叫「寒冷」，健康 −10，生長加成同酷熱一樣', () => {
    const d = WEATHER_EVENTS.cold;
    expect(d.label).toBe('寒冷');
    expect(d.category).toBe('cold');
    expect(d.damage).toBe(COLD_DAMAGE);
    expect(COLD_DAMAGE).toBe(10);
    expect(d.growth).toBe(WEATHER_EVENTS.hot.growth);
    expect(d.growth).toBe(HEAT_GROWTH);
    expect(EVENT_ORDER).toContain('cold');
  });
});

describe('v15 寒冷：香港以外（絕對 + 相對）', () => {
  it('最低 ≤ 3°C 一定係寒冷（冇平均都得）', () => {
    expect(isColdDay({ tempMax: 8, tempMin: 3, intl: true })).toBe(true);
    expect(isColdDay({ tempMax: 8, tempMin: 3.1, intl: true })).toBe(false);
    expect(dayEvent(intl({ tempMin: 2, tempMax: 7 }))).toBe('cold');
  });

  it('最低 ≤ 10°C 兼 ≤ 平均最低 − 8 先算相對寒冷', () => {
    expect(isColdDay({ tempMax: 15, tempMin: 10, intl: true, normMin: 18 })).toBe(true);
    expect(isColdDay({ tempMax: 15, tempMin: 10, intl: true, normMin: 17.9 })).toBe(false);
    expect(isColdDay({ tempMax: 15, tempMin: 10.5, intl: true, normMin: 25 })).toBe(false);
    expect(isColdDay({ tempMax: 15, tempMin: 8, intl: true, normMin: null })).toBe(false);
    expect(dayEvent(intl({ tempMin: 9, tempMax: 14 }, 18, 26))).toBe('cold');
    expect(classify({ precipMm: 0, gustKmh: 10, windKmh: 5, tempMax: 14, tempMin: 9, intl: true, normMin: 18 }).cold).toBe(true);
  });

  it('寒冷同大雨疊加：dayEvents 兩樣都有', () => {
    const d = intl({ tempMin: 1, tempMax: 5, precipMm: 30, code: 63 });
    expect(dayEvent(d)).toBe('rainstorm');
    expect(dayEvents(d).sort()).toEqual(['cold', 'rainstorm']);
    const s = game();
    expect(eventsForDate(s, D, d).sort()).toEqual(['cold', 'rainstorm']);
  });

  it('即時天氣（香港以外）用今日最低同現時溫度', () => {
    const today = intl({ tempMin: 2, tempMax: 6 });
    const ev = currentEvents({ hk: false, current: { tempC: 4, humidity: 70, precipMm: 0, code: 2, windKmh: 8, gustKmh: 12, isDay: true, time: '' }, today });
    expect(ev).toContain('cold');
  });

  it('12 小時倒數：聽日寒冷會提早出', () => {
    const cd = severeCountdown({ nowEvents: [], hourly: [], nowIso: `${D}T20:00`, tomorrow: intl({ date: '2026-09-27', tempMin: 0, tempMax: 4 }), minutesToMidnight: 240, nowMs: 0, activeSource: '即時天氣' });
    expect(cd?.event).toBe('cold');
  });
});

describe('v15 保暖覆蓋', () => {
  it('只喺寒冷日開放，每日一次，唔改水分', () => {
    const s = game({ moisture: 70 });
    expect(emergencyOptions(['cold'])).toEqual({ heatWater: false, rainDrain: false, warmCover: true });
    expect(emergencyOptions(['hot'])).toEqual({ heatWater: true, rainDrain: false, warmCover: false });
    const no = performEmergency(s, 'warmCover', ['clear']);
    expect(no.ok).toBe(false);
    expect(no.message).toContain('今日冇寒冷警告');
    const r = performEmergency(s, 'warmCover', ['cold']);
    expect(r.ok).toBe(true);
    expect(r.message).toContain('保暖覆蓋');
    expect(s.care.warmCover).toBe(true);
    expect(s.moisture).toBe(70);
    expect(performEmergency(s, 'warmCover', ['cold']).ok).toBe(false);
  });

  it('冇做 −10；做咗 0 同應急獎勵 +3', () => {
    const a = game();
    const pa = planNight(a, ['cold'], perksFrom(null), D);
    expect(pa.cold).toMatchObject({ event: 'cold', base: 10, handled: false, score: -10 });
    expect(pa.emergencyBonus).toBe(0);
    const b = game();
    performEmergency(b, 'warmCover', ['cold']);
    const pb = planNight(b, ['cold'], perksFrom(null), D);
    expect(pb.cold).toMatchObject({ handled: true, score: 0 });
    expect(pb.emergencyCount).toBe(1);
    expect(pb.emergencyBonus).toBe(3);
    expect(pb.hAfter - pa.hAfter).toBe(13);
    const res = settleDay(b, D, ['cold'], null, NOW);
    expect(res.settlement.cold).toMatchObject({ handled: true, score: 0 });
    expect(res.settlement.emergencyBonus).toBe(3);
  });

  it('寒冷同酷熱、雨、風疊加（各自一類）', () => {
    const s = game();
    const p = planNight(s, ['cold', 'hot', 'rainstorm'], perksFrom(null), D);
    expect(p.cold?.score).toBe(-10);
    expect(p.heat?.score).toBe(-10);
    expect(p.rain?.score).toBe(-10);
    expect(p.baseDamage).toBe(30);
  });
});

describe('v15 應急獎勵一般化', () => {
  it('1 → 3、2 → 4.5、3 → 6.75', () => {
    expect(emergencyBonus(0)).toBe(0);
    expect(emergencyBonus(1)).toBe(3);
    expect(emergencyBonus(2)).toBe(4.5);
    expect(emergencyBonus(3)).toBe(6.75);
    expect(emergencyBonusText(3)).toBe('(3 + 3 + 3) × 0.75 = +6.75');
    expect(emergencyBonusText(2)).toBe('(3 + 3) × 0.75 = +4.5');
  });

  it('酷熱澆水 + 保暖覆蓋 + 暴雨疏水 同一日 = +6.75', () => {
    const s = game({ moisture: 80 });
    const evs: WeatherEventId[] = ['hot', 'cold', 'rainstorm'];
    for (const a of ['heatWater', 'warmCover', 'rainDrain'] as const) expect(performEmergency(s, a, evs).ok).toBe(true);
    const p = planNight(s, evs, perksFrom(null), D);
    expect(p.emergencyCount).toBe(3);
    expect(p.emergencyBonus).toBe(6.75);
    expect(p.damage).toBe(0);
    const line = previewLines(p).find((l) => l.text.startsWith('應急獎勵'));
    expect(line?.text).toContain('(3 + 3 + 3) × 0.75');
  });
});

describe('v15 香港以外相對酷熱', () => {
  it('最高 ≥ 35 一定酷熱（冇平均都得）', () => {
    expect(isHotDay({ tempMax: 35, intl: true })).toBe(true);
    expect(isHotDay({ tempMax: 34.9, intl: true })).toBe(false);
    expect(eventFromNumbers({ code: 0, precipMm: 0, gustKmh: 10, windKmh: 5, tempMax: 36, intl: true })).toBe('hot');
  });

  it('最高 ≥ 28 兼 ≥ 平均最高 + 5', () => {
    expect(isHotDay({ tempMax: 28, intl: true, normMax: 23 })).toBe(true);
    expect(isHotDay({ tempMax: 28, intl: true, normMax: 23.1 })).toBe(false);
    expect(isHotDay({ tempMax: 27.9, intl: true, normMax: 15 })).toBe(false);
    expect(dayEvent(intl({ tempMax: 30, tempMin: 18 }, 14, 22))).toBe('hot');
    // Dubai-like: 40 °C normal, 42 °C still hot by the absolute rule; 34 °C is not.
    expect(dayEvent(intl({ tempMax: 34, tempMin: 28 }, 30, 40))).toBe('clear');
    expect(classify({ precipMm: 0, gustKmh: 10, windKmh: 5, tempMax: 30, intl: true, normMax: 22 }).heat).toBe(true);
  });

  it('冇平均就只用 35 規則：33°C 唔再當酷熱', () => {
    expect(isHotDay({ tempMax: 33, intl: true, normMax: null })).toBe(false);
    expect(dayEvent(intl({ tempMax: 33 }))).toBe('clear');
    expect(classify({ precipMm: 0, gustKmh: 10, windKmh: 5, tempMax: 33, intl: true }).heat).toBe(false);
  });

  it('香港／鄰近照用 WHOT；數字後備照舊 33', () => {
    expect(hkoWarningEvents(parseWarnsum({ WHOT: { name: '酷熱天氣警告', code: 'WHOT', actionCode: 'ISSUE' } }))).toEqual(['hot']);
    const cur = { tempC: 34, humidity: 60, precipMm: 0, code: 1, windKmh: 10, gustKmh: 15, isDay: true, time: '' };
    expect(currentEvents({ hk: true, warnings: [], current: cur })).toEqual([]);
    expect(isHotDay({ tempMax: 33 })).toBe(true);
    expect(dayEvent(day({ tempMax: 33 }))).toBe('hot');
    expect(dayEvent(day({ tempMax: 33, hkoIcon: 90 }))).toBe('hot');
  });
});

describe('v15 Open-Meteo 過去 14 日平均', () => {
  it('forecastUrl 加 past_days=14', () => {
    expect(new URL(forecastUrl(51.5, -0.12)).searchParams.get('past_days')).toBe('14');
  });

  it('過去日子只用嚟計平均，daily 由今日開始', () => {
    const dates = Array.from({ length: 21 }, (_, i) => new Date(Date.UTC(2026, 8, 12 + i)).toISOString().slice(0, 10));
    const r = parseOpenMeteo({
      timezone: 'Europe/London',
      current: { time: `${D}T10:30`, temperature_2m: 15 },
      daily: { time: dates, temperature_2m_max: dates.map((_, i) => (i < 14 ? 20 : 30)), temperature_2m_min: dates.map((_, i) => (i < 14 ? 10 : 1)) },
    });
    expect(r.daily).toHaveLength(7);
    expect(r.daily[0]!.date).toBe(D);
    expect(r.normals).toEqual({ min: 10, max: 20, days: 14 });
    const stamped = stampDays(r.daily, true, r.normals);
    expect(stamped[0]).toMatchObject({ intl: true, normMin: 10, normMax: 20 });
    expect(dayEvents(stamped[0]!).sort()).toEqual(['cold', 'hot']);
    expect(stampDays(stamped, false, r.normals)[0]!.intl).toBeUndefined();
  });

  it('冇過去日子 → normals null', () => {
    const r = parseOpenMeteo({ current: { time: `${D}T10:00` }, daily: { time: [D] } });
    expect(r.normals).toBeNull();
  });
});

describe('v15 地區名稱', () => {
  it('香港用天文台名；外地叫烈風、暴風、大雨、豪雨、大雨疏水', () => {
    expect(eventLabel('typhoon1', 'hk')).toBe('初級颱風');
    expect(eventLabel('typhoon8', 'hk')).toBe('高級颱風');
    expect(eventLabel('rainstorm', 'hk')).toBe('暴雨');
    expect(eventLabel('blackrain', 'hk')).toBe('黑雨');
    expect(emergencyName('rainDrain', 'hk')).toBe('暴雨疏水');
    expect(eventLabel('typhoon1', 'intl')).toBe('烈風');
    expect(eventLabel('typhoon8', 'intl')).toBe('暴風');
    expect(eventLabel('rainstorm', 'intl')).toBe('大雨');
    expect(eventLabel('blackrain', 'intl')).toBe('豪雨');
    expect(emergencyName('rainDrain', 'intl')).toBe('大雨疏水');
    expect(eventLabel('thunder', 'intl')).toBe('狂風雷暴');
    expect(eventLabel('cold', 'intl')).toBe('寒冷');
    expect(eventLabel('hot', 'intl')).toBe('酷熱');
    expect(regionalize('做「暴雨疏水」；黑雨、高級颱風', 'intl')).toBe('做「大雨疏水」；豪雨、暴風');
  });

  it('定位拒絕（fallback）同揀咗嘅地點當香港；GPS 喺外地先係外地', () => {
    expect(regionFor('fallback', false)).toBe('hk');
    expect(regionFor('manual', false)).toBe('hk');
    expect(regionFor('geo', nearHongKong(22.54, 114.05))).toBe('hk'); // 深圳
    expect(regionFor('geo', nearHongKong(51.5, -0.12))).toBe('intl'); // London
    expect(regionFor('geo', nearHongKong(25.2, 55.27))).toBe('intl'); // Dubai
  });

  it('預設地區影響結算紀錄同今晚預計', () => {
    setLabelRegion('intl');
    expect(labelRegion()).toBe('intl');
    const s = game();
    const p = previewNight(s, D, ['blackrain'], null);
    const rain = previewLines(p).find((l) => l.text.startsWith('雨'));
    expect(rain?.text).toContain('豪雨');
    expect(rain?.sub).toContain('大雨疏水');
    const res = settleDay(s, D, ['blackrain'], null, NOW);
    expect(res.settlement.notes.join('；')).toContain('豪雨：冇做大雨疏水');
    expect(s.log.some((e) => e.text.includes('豪雨'))).toBe(true);
    expect(s.log.some((e) => e.text.includes('黑雨'))).toBe(false);
    setLabelRegion('hk');
    const h = game();
    const res2 = settleDay(h, D, ['blackrain'], null, NOW);
    expect(res2.settlement.notes.join('；')).toContain('黑雨：冇做暴雨疏水');
  });
});

describe('v15 今晚預計＝實際結算（有寒冷）', () => {
  const cases: { name: string; events: WeatherEventId[]; acts: ('heatWater' | 'warmCover' | 'rainDrain')[] }[] = [
    { name: '寒冷冇做', events: ['cold'], acts: [] },
    { name: '寒冷有做', events: ['cold'], acts: ['warmCover'] },
    { name: '寒冷 + 毛毛雨', events: ['cold', 'drizzle'], acts: ['warmCover'] },
    { name: '寒冷 + 酷熱 + 黑雨 全做', events: ['cold', 'hot', 'blackrain'], acts: ['heatWater', 'warmCover', 'rainDrain'] },
    { name: '寒冷 + 暴雨 只做一樣', events: ['cold', 'rainstorm'], acts: ['rainDrain'] },
  ];
  for (const c of cases) {
    it(c.name, () => {
      const s = game({ moisture: 75, health: 66 });
      for (const a of c.acts) performEmergency(s, a, c.events);
      const meta = freshMeta();
      const p = previewNight(s, D, c.events, meta);
      const res = settleDay(s, D, c.events, meta, NOW);
      expect(res.settlement.hAfter).toBe(p.hAfter);
      expect(res.settlement.wAfter).toBe(p.wAfter);
      expect(res.settlement.heightAfter).toBe(p.growth.heightAfter);
      expect(res.settlement.emergencyBonus).toBe(p.emergencyBonus);
      expect(res.settlement.cold ?? null).toEqual(p.cold);
    });
  }
});
