import { describe, expect, it } from 'vitest';
import { CARE, PREPS, WEATHER_EVENTS, WX_NUM } from '../src/balance';
import { guideModal, GUIDE_TABS } from '../src/guide';
import { parseWarnsum } from '../src/hko';
import { setLabelRegion } from '../src/labels';
import { previewNight, createGame } from '../src/sim';
import { weatherPageHtml, type View } from '../src/ui';

const D = '2026-09-27';

function view(over: Partial<View['wx']> = {}): View {
  const state = createGame(D);
  state.started = true;
  const wx: View['wx'] = {
    provider: 'hko', origin: 'live', loading: false, fetchedAt: 0, updated: '10:00', hkoUsed: true,
    warnings: parseWarnsum({ WL: { name: '山泥傾瀉警告', code: 'WL', actionCode: 'ISSUE' }, WRAIN: { name: '暴雨警告信號', code: 'WRAINR', actionCode: 'ISSUE' } }),
    messages: [], situation: '', hkoDays: {}, rainInHours: null, overridden: false, humidity: 88, ...over,
  };
  return {
    state, meta: {} as View['meta'], today: D, tab: 'care', place: '沙田', placeNote: '', statusLine: '天氣啱啱更新過',
    cond: { code: 63, tempC: 26, tempMax: 28, precipMm: 3, windKmh: 20, gustKmh: 40, hot: false, raining: true, stormKind: null },
    forecast: [{ date: D, code: 63, tempMax: 28, tempMin: 24, precipMm: 40, precipProb: 90, windKmh: 20, gustKmh: 40 } as View['forecast'][number]],
    night: false, todayEvents: ['landslip', 'rainstorm'], nowEvents: ['landslip', 'rainstorm'], todayEvent: 'landslip', preview: previewNight(state, D, ['landslip'], null),
    countdown: { event: 'landslip', hours: 0, active: true, source: '天文台' }, manual: false, minutesToSettle: 300, wx,
    isle: { here: 0, bare: false, open: false },
  };
}

describe('v1.4.1 天氣概況 page', () => {
  it('shows only real warnings (with icons + names), current weather and the forecast — no game mechanics', () => {
    const html = weatherPageHtml(view());
    expect(html).toContain('天氣概況');
    expect(html).toContain('山泥傾瀉警告');
    expect(html).toContain('暴雨警告信號');
    expect(html).toContain('<svg');
    expect(html).toContain('濕度 88%');
    expect(html).toContain('未來預報');
    for (const word of ['加固', '抗風力', '遊戲當', '健康', 'data-prep']) expect(html).not.toContain(word);
  });
  it('shows the bureau sentence together with the warning name', () => {
    const sentence = '酷熱天氣警告現正生效，高溫天氣持續！請補充足夠水分。';
    const missing = weatherPageHtml(view({ warnings: [], messages: [sentence] }));
    expect(missing).toContain(sentence);
    expect(missing).not.toContain('而家冇天氣警告生效');
    const listed = weatherPageHtml(view({
      warnings: parseWarnsum({ WHOT: { name: '酷熱天氣警告', code: 'WHOT', actionCode: 'ISSUE' } }),
      messages: [sentence],
    }));
    expect(listed).toContain('酷熱天氣警告');
    expect(listed).toContain('高溫天氣持續');
  });
  it('shows the forecast overview the bureau actually wrote', () => {
    const text = '廣東沿岸風勢微弱。日間酷熱。';
    const html = weatherPageHtml(view({ situation: text }));
    expect(html.indexOf('未來預報')).toBeLessThan(html.indexOf(text));
    expect(html).toContain(`<article class="card wx-outlook"><p class="eyebrow">天氣概況</p><p>${text}</p></article>`);
    const none = weatherPageHtml(view({ situation: '', hkoUsed: false, provider: 'open-meteo' }));
    expect(none).not.toContain('wx-outlook');
  });
  it('says the warning list failed instead of claiming there is none', () => {
    const html = weatherPageHtml(view({ warnings: [], messages: [], warningsKnown: false, reading: false, humidity: 70, station: undefined, conditionText: undefined }));
    expect(html).toContain('警告暫時攞唔到');
    expect(html).toContain('讀數暫時攞唔到');
    expect(html).not.toContain('而家冇天氣警告生效');
    expect(html).not.toContain('濕度 70%');
  });
  it('outside HK says there are no HKO warnings', () => {
    const html = weatherPageHtml(view({ hkoUsed: false, warnings: [], provider: 'open-meteo' }));
    expect(html).toContain('Open-Meteo');
    expect(html).not.toContain('香港天文台・生效中警告');
    expect(html).not.toContain('加固');
  });
});

describe('v1.4.1 玩法 panel', () => {
  it('has the four tabs', () => {
    expect(GUIDE_TABS.map((t) => t.label)).toEqual(['玩法', '計算方式', '天氣與警告', '推送通知']);
  });
  it('numbers come from the code constants', () => {
    setLabelRegion('hk');
    const play = guideModal('play');
    expect(play).toContain(`水分 +${CARE.water.amount}`);
    expect(play).toContain(`打木樁 +${PREPS.stakes.amount}`);
    for (const s of ['幼苗', '小樹', '青年樹', '成年樹', '巨樹', '樟樹', '北美紅杉', '120 米']) expect(play).toContain(s);
    const calc = guideModal('calc');
    for (const id of ['typhoon1', 'thunder', 'typhoon8', 'landslip'] as const) expect(calc).toContain(`<td>${WEATHER_EVENTS[id].collapseBelow}</td>`);
    expect(calc).toContain('+4.5');
    expect(calc).toContain('+6.75');
    const wx = guideModal('weather');
    expect(wx).toContain('山泥傾瀉警告');
    expect(wx).toContain('WL');
    expect(wx).toContain(`陣風 ≥ ${WX_NUM.typhoon1.gust}`);
    expect(wx).toContain(`日雨量 ≥ ${WX_NUM.blackrain.mm} 毫米`);
    const push = guideModal('push');
    for (const s of ['降級', '取消', '注意安全', '2 小時', '40 分鐘']) expect(push).toContain(s);
  });
  it('outside HK uses the regional names and drops 山泥傾瀉 from the play tab', () => {
    setLabelRegion('intl');
    expect(guideModal('play')).toContain('大雨疏水');
    expect(guideModal('play')).not.toContain('山泥傾瀉');
    setLabelRegion('hk');
  });
});
