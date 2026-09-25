import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { drivingWarning, hkoIconLabel, hkoIconRain, hkoIconToWmo, parseFnd, parseRhrread, parseWarnsum, windFromText } from '../src/hko';
import { parseBigDataCloud } from '../src/place';
import { dayEvent, hkoWarningEvents, severeCountdown } from '../src/events';
import { condFromForecast, dayLabel, districtRain, presentForecast, withHkoDays, fetchForecast, hkoForecast, mildDay, nearHongKong, parseOpenMeteo } from '../src/weather';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as unknown;

describe('Open-Meteo', () => {
  it('解析真實回應（現時、每小時、七日）', () => {
    const r = parseOpenMeteo(fixture('open-meteo-hk.json'));
    expect(r.timezone).toBe('Asia/Hong_Kong');
    expect(r.daily).toHaveLength(7);
    expect(r.current.tempC).toBeGreaterThan(-20);
    expect(r.current.gustKmh).toBeGreaterThanOrEqual(0);
    expect(r.daily[0]!.sunrise).toMatch(/T\d\d:\d\d/);
    expect(r.rainInHours === null || (r.rainInHours >= 0 && r.rainInHours < 6)).toBe(true);
  });

  it('每小時有雨會計出幾耐之後落雨', () => {
    const r = parseOpenMeteo({
      timezone: 'Asia/Hong_Kong',
      current: { time: '2026-09-25T12:15', temperature_2m: 30, weather_code: 3 },
      hourly: { time: ['2026-09-25T12:00', '2026-09-25T13:00', '2026-09-25T14:00'], precipitation: [0, 0, 2.4], weather_code: [3, 3, 63] },
      daily: { time: ['2026-09-25'] },
    });
    expect(r.rainInHours).toBe(2);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('429 之後會再試，第二次成功就用真實天氣', async () => {
    const body = fixture('open-meteo-hk.json');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('busy', { status: 429, headers: { 'retry-after': '0.05' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const r = await fetchForecast(22.3, 114.17, { tries: 3 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]![0])).toContain('wind_gusts_10m');
    expect(String(fetchMock.mock.calls[0]![0])).toContain('hourly=');
    expect(r.daily).toHaveLength(7);
  });

  it('一直 429 就報錯（等外層轉用天文台或者模擬）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('busy', { status: 429, headers: { 'retry-after': '0.01' } })));
    await expect(fetchForecast(22.3, 114.17, { tries: 2 })).rejects.toThrow('429');
  });
});

describe('香港天文台', () => {
  it('解析真實警告摘要', () => {
    const warnings = parseWarnsum(fixture('hko-warnsum.json'));
    expect(warnings.length).toBeGreaterThan(0);
    for (const w of warnings) {
      expect(w.name.length).toBeGreaterThan(0);
      expect(w.short.length).toBeGreaterThan(0);
    }
  });

  it('風球同暴雨變成遊戲風暴；一號風球只係預告', () => {
    const w = parseWarnsum({
      WTCSGNL: { name: '熱帶氣旋警告信號', code: 'TC8NE', actionCode: 'ISSUE', issueTime: '2026-09-25T10:40:00+08:00' },
      WRAIN: { name: '暴雨警告信號', code: 'WRAINR', type: '紅色', actionCode: 'ISSUE' },
      WHOT: { name: '酷熱天氣警告', code: 'WHOT', actionCode: 'ISSUE' },
      WFIRE: { name: '火災危險警告', code: 'WFIREY', type: '黃色', actionCode: 'CANCEL' },
    });
    expect(w.map((x) => x.short)).toEqual(['八號風球', '紅雨', '酷熱']);
    expect(w[0]!.name).toBe('八號東北烈風或暴風信號');
    expect(drivingWarning(w)?.kind).toBe('typhoon');
    const tc1 = parseWarnsum({ WTCSGNL: { name: '熱帶氣旋警告信號', code: 'TC1', actionCode: 'ISSUE' } });
    expect(tc1[0]!.standby).toBe(true);
    expect(tc1[0]!.kind).toBeNull();
    const black = parseWarnsum({ WRAIN: { name: '暴雨警告信號', code: 'WRAINB', type: '黑色', actionCode: 'ISSUE' } });
    expect(black[0]!.short).toBe('黑雨');
    expect(black[0]!.kind).toBe('heavy-rain');
  });

  it('揀最近嘅氣溫站，同埋分區雨量', () => {
    const shatin = parseRhrread(fixture('hko-rhrread.json'), 22.382, 114.19);
    expect(shatin?.current.station).toBe('沙田');
    expect(typeof shatin?.current.tempC).toBe('number');
    const hq = parseRhrread(fixture('hko-rhrread.json'), 22.3022, 114.1744);
    expect(hq?.current.station).toBe('香港天文台');
    const data = { fetchedAt: 0, warnings: [], messages: [], forecast: [], situation: '', current: shatin!.current };
    expect(districtRain(data, '沙田區')).not.toBeNull();
  });

  it('九天預報可以代替 Open-Meteo', () => {
    const f = parseFnd(fixture('hko-fnd.json'));
    expect(f.forecast.length).toBeGreaterThanOrEqual(7);
    expect(f.forecast[0]!.date).toMatch(/^\d{4}-\d\d-\d\d$/);
    const rh = parseRhrread(fixture('hko-rhrread.json'), 22.3, 114.17)!;
    const today = '2026-09-25';
    const fc = hkoForecast({ fetchedAt: 0, warnings: [], messages: [], current: rh.current, forecast: f.forecast, situation: f.situation }, today);
    expect(fc?.daily[0]!.date).toBe(today);
    expect(fc?.daily.length).toBe(7);
    expect(fc?.current.tempC).toBe(rh.current.tempC);
    expect(windFromText('東風4至5級，間中6級。')).toBe(44);
    expect(hkoIconToWmo(65)).toBe(95);
  });
});

describe('天文台警告變遊戲天氣事件', () => {
  const w = (group: string, code: string) => ({ group, code, name: code, short: code, kind: null, standby: false, tone: 'red' as const, issued: '' });

  it('按設計書對應', () => {
    expect(hkoWarningEvents([w('WHOT', 'WHOT')])).toEqual(['hot']);
    expect(hkoWarningEvents([w('WRAIN', 'WRAINA')])).toEqual(['rainstorm']);
    expect(hkoWarningEvents([w('WRAIN', 'WRAINR')])).toEqual(['rainstorm']);
    expect(hkoWarningEvents([w('WRAIN', 'WRAINB')])).toEqual(['blackrain']);
    expect(hkoWarningEvents([w('WTS', 'WTS')])).toEqual(['thunder']);
    expect(hkoWarningEvents([w('WMSGNL', 'WMSGNL')])).toEqual(['thunder']);
    expect(hkoWarningEvents([w('WTCSGNL', 'TC1')])).toEqual(['typhoon1']);
    expect(hkoWarningEvents([w('WTCSGNL', 'TC3')])).toEqual(['typhoon1']);
    expect(hkoWarningEvents([w('WTCSGNL', 'TC8NE')])).toEqual(['typhoon8']);
    expect(hkoWarningEvents([w('WTCSGNL', 'TC10')])).toEqual(['typhoon8']);
    expect(hkoWarningEvents([w('WFIRE', 'WFIREY')])).toEqual([]);
    // Real fixture: 酷熱 + 黃色火災 → 酷熱 only.
    expect(hkoWarningEvents(parseWarnsum(fixture('hko-warnsum.json')))).toEqual(['hot']);
  });

  it('Open-Meteo 日子按陣風、雨量、天氣碼判斷', () => {
    const d = (x: Partial<ReturnType<typeof mildDay>>) => ({ ...mildDay('2026-09-26'), ...x });
    expect(dayEvent(d({ gustKmh: 130 }))).toBe('typhoon8');
    expect(dayEvent(d({ gustKmh: 95 }))).toBe('typhoon1');
    expect(dayEvent(d({ code: 95 }))).toBe('thunder');
    expect(dayEvent(d({ precipMm: 80, code: 65 }))).toBe('blackrain');
    expect(dayEvent(d({ precipMm: 30, code: 65 }))).toBe('rainstorm');
    expect(dayEvent(d({ tempMax: 34 }))).toBe('hot');
    expect(dayEvent(d({ precipMm: 2, code: 61 }))).toBe('drizzle');
    expect(dayEvent(d({}))).toBe('clear');
    // HKO says fine: no drizzle even if the model has a few mm.
    expect(dayEvent(d({ precipMm: 3, code: 61, hkoIcon: 50 }))).toBe('clear');
  });

  it('12 小時倒數：生效中、逐小時、手動預報', () => {
    const base = { hourly: [], nowIso: '2026-09-25T14:00', minutesToMidnight: 600, nowMs: 0, activeSource: '天文台' };
    expect(severeCountdown({ ...base, nowEvents: ['typhoon8'] })).toMatchObject({ event: 'typhoon8', active: true, hours: 0 });
    expect(severeCountdown({ ...base, nowEvents: ['drizzle'] })).toBeNull();
    const hourly = [0, 1, 2, 3, 4].map((i) => ({ time: `2026-09-25T${14 + i}:00`, precipMm: 0, code: i === 3 ? 95 : 3, gustKmh: 20 }));
    expect(severeCountdown({ ...base, nowEvents: [], hourly })).toMatchObject({ event: 'thunder', hours: 3 });
    expect(severeCountdown({ ...base, nowEvents: [], manual: { event: 'typhoon1', at: 2 * 3600000 } })).toMatchObject({ event: 'typhoon1', hours: 2 });
    expect(severeCountdown({ ...base, nowEvents: [], manual: { event: 'typhoon1', at: 20 * 3600000 } })).toBeNull();
  });
});

describe('地名', () => {
  it('香港用分區名，香港附近判斷正確', () => {
    expect(parseBigDataCloud(fixture('bdc-shatin.json'))).toEqual({ name: '沙田區', district: '沙田區' });
    expect(parseBigDataCloud({ countryCode: 'JP', city: '東京', localityInfo: { administrative: [] } })).toEqual({ name: '東京' });
    expect(nearHongKong(22.54, 114.05)).toBe(true);
    expect(nearHongKong(35.68, 139.76)).toBe(false);
  });
});

describe('預報圖示跟天文台', () => {
  const om = () => parseOpenMeteo(fixture('open-meteo-hk.json'));
  const hko = () => {
    const f = parseFnd(fixture('hko-fnd.json'));
    const current = parseRhrread(fixture('hko-rhrread.json'), 22.31, 114.22)!.current;
    return { warnings: [], current, forecast: f.forecast, situation: f.situation, messages: [] };
  };

  it('天文台圖示名稱跟官方說明', () => {
    expect([50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65].map(hkoIconLabel)).toEqual([
      '陽光充沛', '間有陽光', '短暫陽光', '間有陽光 幾陣驟雨', '短暫陽光 有驟雨', '多雲', '密雲', '微雨', '雨', '大雨', '雷暴',
    ]);
    expect([76, 77, 80, 83, 85, 90, 91, 92, 93].map(hkoIconLabel)).toEqual(['大致多雲', '天色大致良好', '大風', '霧', '煙霞', '熱', '暖', '涼', '冷']);
    expect(hkoIconRain(54)).toBe(true);
    expect(hkoIconRain(90)).toBe(false);
  });

  it('逐日用天文台圖示，今日用即時觀測圖示，數字唔變', () => {
    const base = om();
    // The recorded Open-Meteo week says drizzle/thunder (51/53/95) on days HKO calls hot and fine (90).
    expect(base.daily.map((d) => d.code)).toEqual([3, 1, 51, 53, 51, 95, 51]);
    const days = withHkoDays(base.daily, hko(), '2026-09-25');
    expect(days.map((d) => d.hkoIcon)).toEqual([51, 90, 90, 90, 90, 90, 54]);
    expect(days.map(dayLabel)).toEqual(['間有陽光', '熱', '熱', '熱', '熱', '熱', '短暫陽光 有驟雨']);
    expect(days.map((d) => d.precipMm)).toEqual(base.daily.map((d) => d.precipMm));
    // Scene: no rain on days HKO calls fine, even if the model has a few mm.
    expect(days.slice(0, 6).every((d) => !condFromForecast(d).raining)).toBe(true);
    expect(condFromForecast(days[6]!).raining).toBe(true);
  });

  it('天文台冇覆蓋嘅日子用返 Open-Meteo', () => {
    const h = hko();
    h.forecast = h.forecast.slice(0, 2);
    const days = withHkoDays(om().daily, h, '2026-09-25');
    expect(days[3]!.hkoIcon).toBeUndefined();
    expect(dayLabel(days[3]!)).toBe('微雨');
    expect(withHkoDays(om().daily, null, '2026-09-25')[1]!.hkoIcon).toBeUndefined();
  });

  it('預報列表補齊七日', () => {
    const days = withHkoDays(om().daily, hko(), '2026-09-25');
    const shown = presentForecast(days, '2026-09-25');
    expect(shown).toHaveLength(7);
    expect(shown.find((d) => d.date === '2026-09-28')!.hkoIcon).toBe(90);
  });
});
