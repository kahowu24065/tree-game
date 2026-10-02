import { describe, expect, it } from 'vitest';
import { parseCwa, type CwaResponse } from '../src/cwa';
import { currentEvents, hkoWarningEvents, observedRainEvents } from '../src/events';
import { weatherArt } from '../src/icons';
import { createGame, observedRain, previewNight, recordEvents, settleDay, waterEvents } from '../src/sim';
import type { CurrentWeather, GameState } from '../src/types';

const NOW = Date.UTC(2026, 9, 2, 4);
const D = '2026-10-02';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 95, nutrients: 90, resist: 0 }, over);
}

const cur = (over: Partial<CurrentWeather> = {}): CurrentWeather => ({ tempC: 26, humidity: 80, precipMm: 0, code: 2, windKmh: 10, gustKmh: 20, isDay: true, time: '', ...over });

describe('v1.4.24 水分：只計真係觀測到嘅雨', () => {
  it('預報雨唔加水、唔當落雨日、唔會爛根', () => {
    const clear = settleDay(game(), D, ['clear'], null, NOW).settlement;
    const forecast = settleDay(game(), D, ['rainstorm', 'drizzle'], null, NOW).settlement;
    expect(forecast.wAfter).toBe(clear.wAfter);
    expect(forecast.wAfter).toBeLessThan(95);
    const seen = game();
    recordEvents(seen, D, ['rainstorm'], false, ['rainstorm']);
    expect(settleDay(seen, D, ['rainstorm'], null, NOW).settlement.wAfter).toBe(110);
  });

  it('waterEvents 只留低觀測到嘅雨；舊存檔官方日當已觀測', () => {
    const s = game();
    expect(waterEvents(s, D, ['hot', 'drizzle', 'typhoon1'])).toEqual(['hot', 'typhoon1']);
    recordEvents(s, D, [], false, ['drizzle', 'hot']);
    expect(observedRain(s, D)).toEqual(['drizzle']);
    expect(waterEvents(s, D, ['hot', 'drizzle', 'rainstorm'])).toEqual(['hot', 'drizzle']);
    const old = game();
    old.dayEvents[D] = { events: ['rainstorm'], hko: true };
    expect(observedRain(old, D)).toEqual(['rainstorm']);
  });

  it('今晚預計：而家係真實水分，未計嘅觀測雨另外列', () => {
    const s = game({ moisture: 98 });
    recordEvents(s, D, ['drizzle'], false, ['drizzle']);
    const p = previewNight(s, D, ['drizzle'], null);
    expect(p.wBefore).toBe(98);
    expect(p.pendingWater).toEqual([{ event: 'drizzle', delta: 7 }]);
    const f = previewNight(game({ moisture: 98 }), D, ['drizzle'], null);
    expect(f.pendingWater).toEqual([]);
    expect(f.wAfter).toBeLessThan(98);
  });

  it('觀測雨：唔理當日預報', () => {
    const day = { date: D, code: 65, tempMax: 30, tempMin: 25, precipMm: 40, windKmh: 10, gustKmh: 20 } as never;
    expect(currentEvents({ hk: false, current: cur(), today: day })).toContain('rainstorm');
    expect(observedRainEvents({ hk: false, current: cur() })).toEqual([]);
    expect(observedRainEvents({ hk: false, current: cur({ precipMm: 5 }) })).toEqual(['rainstorm', 'drizzle']);
    expect(observedRainEvents({ hk: true, warnings: [], current: cur({ code: 61 }) })).toEqual(['drizzle']);
  });
});

describe('v1.4.24 中央氣象署特報詳情', () => {
  const body = (w: CwaResponse['warnings']): CwaResponse => ({ ok: true, county: '臺中市', town: '烏日區', current: null, forecast: [], warnings: w, warningsKnown: true });

  it('未生效／唔係你區：照顯示概述、注意事項，但冇遊戲事件', () => {
    const b = parseCwa(
      body([{ type: 'wind', level: 1, name: '陸上強風特報（黃色燈號）', text: '東北風增強', overview: '東北風增強', precautions: '黃色燈號：注意！', onset: '2026-10-02T11:00:00+08:00', expires: '2026-10-02T23:00:00+08:00', areas: ['清水區', '大甲區'], mine: false, started: false, active: false }]),
    );
    const [w] = b.data.warnings;
    expect(w!.inactive).toBe(true);
    expect(w!.detail).toMatchObject({ overview: '東北風增強', precautions: '黃色燈號：注意！', areas: ['清水區', '大甲區'], mine: false, started: false, place: '烏日區' });
    expect(hkoWarningEvents(b.data.warnings)).toEqual([]);
    expect(b.data.messages).toEqual([]);
  });

  it('生效中而且係你區 → 事件照計；舊伺服器只有 text 就照舊放 messages', () => {
    const b = parseCwa(body([{ type: 'wind', level: 1, name: '陸上強風特報（黃色燈號）', overview: 'x', mine: true, started: true, active: true }, { type: 'rain', level: 1, name: '大雨特報', text: '舊文字' }]));
    expect(b.data.warnings.every((w) => !w.inactive)).toBe(true);
    expect(hkoWarningEvents(b.data.warnings).sort()).toEqual(['rainstorm', 'typhoon1']);
    expect(b.data.messages).toEqual(['舊文字']);
  });
});

describe('v1.4.24 圖示：颱風／強風用風，唔係雷暴', () => {
  it('weatherArt', () => {
    const bolt = 'M26 36l-5 8';
    expect(weatherArt(3, false, 'typhoon')).not.toContain(bolt);
    expect(weatherArt(3, false, 'gale')).not.toContain(bolt);
    expect(weatherArt(3, false, 'gale')).toContain('M6 20h24');
    expect(weatherArt(65, false, 'heavy-rain')).not.toContain(bolt);
    expect(weatherArt(95, false, 'gale')).toContain(bolt);
    expect(weatherArt(3, false, true)).toContain(bolt);
    expect(weatherArt(3, false, null, 65)).toContain(bolt);
  });
});
