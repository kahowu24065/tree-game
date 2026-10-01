// 1.4.22: HKO / SMG official language versions per player language; structure still parsed from the Chinese feeds.
import { afterEach, describe, expect, it } from 'vitest';
import { useLocale } from '../src/i18n';
import { hkoLang, parseWarnsum, rainFromPsr, warningDisplay, windFromText } from '../src/hko';
import { parseSmg, smgMessages } from '../src/smg';

afterEach(() => useLocale('zh-HK'));

describe('HKO language versions', () => {
  it('tc for zh-HK / zh-TW, sc for zh-CN, en for English', () => {
    expect(hkoLang()).toBe('tc');
    useLocale('zh-TW');
    expect(hkoLang()).toBe('tc');
    useLocale('zh-CN');
    expect(hkoLang()).toBe('sc');
    useLocale('en');
    expect(hkoLang()).toBe('en');
  });

  it('reads wind force and PSR from tc, sc and en forecasts alike', () => {
    expect(windFromText('东风4至5级，间中6级。')).toBe(windFromText('東風4至5級，間中6級。'));
    expect(windFromText('East force 4 to 5, occasionally 6.')).toBe(windFromText('東風4至5級，間中6級。'));
    expect(windFromText('North to northeast force 4, occasionally force 5 offshore.')).toBe(windFromText('北風4級，間中5級。'));
    expect(rainFromPsr('Medium High')).toEqual(rainFromPsr('中高'));
    expect(rainFromPsr('Low')).toEqual(rainFromPsr('低'));
  });

  it('English warnsum names are shown as sent', () => {
    useLocale('en');
    const ws = parseWarnsum({ WHOT: { name: 'Very Hot Weather Warning', code: 'WHOT', actionCode: 'REISSUE' }, WFIRE: { name: 'Fire Danger Warning', code: 'WFIREY', type: 'Yellow', actionCode: 'ISSUE' } });
    expect(ws.find((w) => w.group === 'WHOT')!.name).toBe('Very Hot Weather Warning');
    expect(ws.find((w) => w.group === 'WFIRE')!.name).toBe('Yellow Fire Danger Warning');
    expect(warningDisplay(ws.find((w) => w.group === 'WHOT')!)).toBe('Very Hot Weather Warning');
  });
});

describe('SMG English feed', () => {
  const temp = (title: string, desc: string) => `<rss><channel><item><title>${title}</title><description><![CDATA[${desc}]]></description></item></channel></rss>`;
  const week = (text: string) => `<SevenDaysForecast><Custom><WeatherForecast><ValidFor>2026-10-01</ValidFor><WeatherStatus>29</WeatherStatus><Temperature><Type>1</Type><Value>33</Value></Temperature><Temperature><Type>2</Type><Value>26</Value></Temperature><WeatherDescription>${text}</WeatherDescription></WeatherForecast></Custom></SevenDaysForecast>`;
  const outlook = (t: string) => `<ActualForecast><Custom><TodaySituation>${t}</TodaySituation></Custom></ActualForecast>`;

  it('English text replaces the Chinese bulletins; signals, wind and rain still come from the Chinese feed', () => {
    const c = { temp: temp('黃色高溫提示', '本澳今日天氣酷熱。'), week: week('天晴。吹南風2至4級。'), outlook: outlook('高空反氣旋正影響本澳天氣。') };
    const e = { temp: temp('Yellow hot weather alert', 'It is very hot in Macao today.'), week: week('Fine. Force 2 to 4 southerly winds.'), outlook: outlook('An anticyclone aloft is affecting the weather of Macao.') };
    useLocale('en');
    const b = parseSmg(c, 22.19, 113.54, 0, e);
    expect(b.data.messages).toEqual(['It is very hot in Macao today.']);
    expect(b.data.situation).toBe('An anticyclone aloft is affecting the weather of Macao.');
    expect(b.data.forecast[0]).toMatchObject({ text: 'Fine. Force 2 to 4 southerly winds.', wind: '天晴。吹南風2至4級。' });
    expect(b.data.warnings.map((w) => warningDisplay(w))).toEqual(['Yellow Hot Weather Alert']);
    expect(smgMessages({ temp: temp('Yellow hot weather alert', 'Yellow hot weather alert is cancelled.') })).toEqual([]);
    // No English file: Chinese text stays.
    expect(parseSmg(c, 22.19, 113.54, 0, {}).data.messages).toEqual(['本澳今日天氣酷熱。']);
  });
});

describe('zh-CN bureau text', () => {
  it('SMG / CWA free text is converted to Simplified only for zh-CN', async () => {
    const { localizeBureauText } = await import('../src/zhconv');
    const data = { fetchedAt: 0, warnings: [], messages: ['本澳今日天氣酷熱。'], situation: '颱風正影響臺灣。', forecast: [{ date: '2026-10-01', week: '', text: '多雲時陰。', wind: '東風3級', tempMax: 30, tempMin: 25, icon: 60, psr: '低' }], current: null };
    expect(await localizeBureauText(data, 'hk')).toBe(data);
    useLocale('zh-CN');
    const s = await localizeBureauText(data, 'tw');
    expect(s.messages).toEqual(['本澳今日天气酷热。']);
    expect(s.situation).toBe('台风正影响台湾。');
    expect(s.forecast[0]).toMatchObject({ text: '多云时阴。', wind: '东风3级', psr: '低' });
  });
});
