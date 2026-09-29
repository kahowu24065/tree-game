import { describe, expect, it } from 'vitest';
import { hkoWarningEvents } from '../src/events';
import { parseSmg, smgWarnings, withSmgDays, type SmgXml } from '../src/smg';

const brief = `<?xml version="1.0" encoding="UTF-8" ?>
<ActualWeatherBrief><System><SysPubdate>2026-09-29 14:57</SysPubdate></System><Custom>
<Temperature><Type>3</Type><Value>29</Value></Temperature>
<Humidity><Type>3</Type><Value>79</Value></Humidity>
<WindSpeed><Type>3</Type><Value>10</Value></WindSpeed>
<WeatherStatus>03</WeatherStatus>
</Custom></ActualWeatherBrief>`;

const actual = `<?xml version="1.0" encoding="utf-8"?>
<ActualWeather><Custom>
<WeatherReport><station code="FM"><stationname>大炮台</stationname>
<Temperature_daily_max><Type>8</Type><Value>34</Value></Temperature_daily_max>
<Temperature><Type>3</Type><Value>30</Value></Temperature>
<Humidity><Type>3</Type><Value>66</Value></Humidity>
<WindGust><Type>3</Type><Value>12</Value></WindGust>
<WindSpeed><Type>3</Type><Value>7</Value></WindSpeed>
<Rainfall><Type>3</Type><Value>0.0</Value></Rainfall>
<Rainfall><Type>5</Type><Value>1.2</Value></Rainfall>
</station></WeatherReport>
<WeatherReport><station code="TG"><stationname>大潭山</stationname>
<Temperature><Type>3</Type><Value>31</Value></Temperature>
<Humidity><Type>3</Type><Value>71</Value></Humidity>
<WindGust><Type>3</Type><Value>4</Value></WindGust>
<WindSpeed><Type>3</Type><Value>2</Value></WindSpeed>
<Rainfall><Type>3</Type><Value>0.4</Value></Rainfall>
</station></WeatherReport>
</Custom></ActualWeather>`;

const week = `<?xml version="1.0" encoding="UTF-8" ?>
<SevenDaysForecast><Custom>
<WeatherForecast><ValidFor>2026-09-29</ValidFor><WeatherStatus>02</WeatherStatus>
<Temperature><Type>1</Type><Value>33</Value></Temperature>
<Temperature><Type>2</Type><Value>27</Value></Temperature>
<WeatherDescription>多雲，部份時間有陽光。吹3至4級南至西南風。</WeatherDescription>
</WeatherForecast>
</Custom></SevenDaysForecast>`;

const typhoonOff = `<TyphoonWarning><Custom><TropicalCyclone><Warncode>NIL</Warncode><Action>NIL</Action><Inforce>0</Inforce><Status>0</Status><Description>現時並沒有熱帶氣旋信號。</Description></TropicalCyclone></Custom></TyphoonWarning>`;
const typhoon8 = `<TyphoonWarning><Custom><TropicalCyclone><Warncode>8</Warncode><Action>ISSUE</Action><Inforce>1</Inforce><Status>1</Status><Description>現正發出八號東南烈風或暴風信號。</Description><IssuedAt>2026-09-29 08:00</IssuedAt></TropicalCyclone></Custom></TyphoonWarning>`;
const rainBlack = `<RainstormWarning><Custom><Rainstorm><Warncode>BLACK</Warncode><Action>ISSUE</Action><Status>1</Status><Inforce>1</Inforce><Description>黑色暴雨警告信號現正生效。</Description></Rainstorm></Custom></RainstormWarning>`;
const thunderOff = `<ThunderstormWarning><Custom><Thunderstorm><Action>CANCEL</Action><Status>2</Status><Description>雷暴警告信號已經取消。</Description></Thunderstorm></Custom></ThunderstormWarning>`;
const hot = `<rss><channel><item><title>黃色高溫提示</title><description><![CDATA[預料本澳天氣酷熱。]]></description></item></channel></rss>`;
const hotCancelled = `<rss><channel><item><title>黃色高溫提示</title><description><![CDATA[黃色高溫提示已經取消。]]></description></item></channel></rss>`;

const xml = (over: Partial<SmgXml> = {}): SmgXml => ({
  brief, actual, week, typhoon: typhoonOff, rain: '', thunder: thunderOff, monsoon: '', temp: hot, ...over,
});

describe('SMG', () => {
  it('uses the nearest station and the 7-day forecast', () => {
    const peninsula = parseSmg(xml(), 22.198, 113.544);
    expect(peninsula.data.current?.station).toBe('大炮台');
    expect(peninsula.data.current?.tempC).toBe(30);
    expect(peninsula.data.current?.icon).toBe(60);
    expect(peninsula.windKmh).toBe(7);
    expect(peninsula.gustKmh).toBe(12);
    expect(peninsula.precipMm).toBe(0);
    const taipa = parseSmg(xml(), 22.156, 113.568);
    expect(taipa.data.current?.station).toBe('大潭山');
    expect(taipa.data.current?.tempC).toBe(31);
    expect(taipa.precipMm).toBe(0.4);
    const days = withSmgDays([{ date: '2026-09-29', code: 1, tempMax: 20, tempMin: 10, precipMm: 0, precipProb: 0, windKmh: 1, gustKmh: 1, sunrise: '', sunset: '' }], peninsula.data);
    expect(days[0]).toMatchObject({ tempMax: 33, tempMin: 27 });
  });

  it('maps in-force signals onto the same game events as Hong Kong', () => {
    const quiet = smgWarnings(xml());
    expect(quiet.map((w) => w.group)).toEqual(['WHOT']);
    expect(hkoWarningEvents(quiet)).toEqual(['hot']);
    const storm = smgWarnings(xml({ typhoon: typhoon8, rain: rainBlack, temp: hotCancelled }));
    expect(storm.map((w) => w.code)).toEqual(['TC8SE', 'WRAINB']);
    expect(hkoWarningEvents(storm)).toEqual(expect.arrayContaining(['typhoon8', 'blackrain']));
    expect(hkoWarningEvents(storm)).not.toContain('hot');
  });
});
