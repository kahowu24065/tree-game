import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cwaName, normLocale, recordLocale } from '../src/i18n.js';
import { deviceMessage, dropMessageFor, messageFor, reminderFor } from '../src/warnings.js';
import { intlDropMessageFor, intlMessageFor } from '../src/intl.js';
import { twDropMessageFor, twMessageFor } from '../src/cwa.js';
import { parseState } from '../src/tokens.js';

const LOCS = ['zh-HK', 'zh-TW', 'zh-CN', 'en'];

test('locale normalisation: app locales pass, tags map, missing = zh-HK', () => {
  assert.equal(normLocale('en'), 'en');
  assert.equal(normLocale('zh-TW'), 'zh-TW');
  assert.equal(normLocale('zh-Hans-CN'), 'zh-CN');
  assert.equal(normLocale('fr-FR'), 'en');
  assert.equal(normLocale(undefined), 'zh-HK');
  assert.equal(recordLocale({ locale: 'en', state: { locale: 'zh-CN' } }), 'zh-CN');
  assert.equal(recordLocale({ locale: 'en', state: { locale: null } }), 'en');
  assert.equal(parseState({ day: '2026-10-01', locale: 'en' }).locale, 'en');
  assert.equal(parseState({ day: '2026-10-01', locale: 'xx' }).locale, null);
});

test('HK warnings use official names per language', () => {
  assert.equal(messageFor({ category: 'rain', level: 3 }, 'en').title, 'Black Rainstorm Warning Signal in force!');
  assert.equal(messageFor({ category: 'typhoon', level: 3 }, 'en').title, 'No. 8 Gale or Storm Signal in force!');
  assert.equal(messageFor({ category: 'heat', level: 1 }, 'zh-CN').title, '酷热天气警告生效！');
  assert.equal(messageFor({ category: 'rain', level: 2 }, 'zh-TW').title, '紅色暴雨警告信號生效！');
  assert.equal(messageFor({ category: 'rain', level: 2 }).title, '紅色暴雨警告信號生效！');
  assert.equal(dropMessageFor({ category: 'rain', from: 2, to: 1 }, 'en').title, 'Red Rain changed to Amber Rain');
  assert.equal(dropMessageFor({ category: 'typhoon', from: 3, to: 0 }, 'en').title, 'Tropical Cyclone Warning Signals cancelled');
  assert.equal(reminderFor({ category: 'heat', level: 1 }, 'en').title, 'Very Hot Weather Warning still in force');
});

test('every builder gives non-empty text in every language, Chinese only for zh', () => {
  const state = { tree: 'dying', rUnlocked: true, resist: 5 };
  for (const l of LOCS) {
    const msgs = [
      ...['heat', 'cold', 'landslip'].map((c) => messageFor({ category: c, level: 1 }, l)),
      ...[1, 2, 3].map((v) => messageFor({ category: 'rain', level: v }, l)),
      ...[1, 2, 3, 4, 5].map((v) => reminderFor({ category: 'typhoon', level: v }, l)),
      dropMessageFor({ category: 'heat', from: 1, to: 0 }, l),
      intlMessageFor({ category: 'typhoon', level: 2 }, false, l),
      intlMessageFor({ category: 'rain', level: 2 }, true, l),
      intlDropMessageFor({ category: 'rain', from: 2, to: 1 }, l),
      twMessageFor({ category: 'rain', level: 2 }, { rain: '豪雨特報' }, false, l),
      twMessageFor({ category: 'typhoon', level: 3 }, {}, true, l),
      twDropMessageFor({ category: 'typhoon', from: 3, to: 0 }, { typhoon: '海上陸上颱風警報' }, {}, l),
      deviceMessage(messageFor({ category: 'typhoon', level: 3 }, l), state, 'issue', true, l),
    ];
    for (const m of msgs) {
      assert.ok(m.title && m.body, `${l} ${JSON.stringify(m)}`);
      const cjk = /[\u3400-\u9fff]/.test(m.title + m.body);
      assert.equal(cjk, l !== 'en', `${l}: ${m.title} / ${m.body}`);
    }
  }
});

test('CWA names translate for en / zh-CN and stay for zh-TW', () => {
  assert.equal(cwaName('陸上強風特報（橙色燈號）', 'en'), 'Strong Wind Advisory (orange)');
  assert.equal(cwaName('豪雨特報', 'zh-CN'), '豪雨特报');
  assert.equal(cwaName('海上颱風警報', 'zh-TW'), '海上颱風警報');
  assert.equal(twMessageFor({ category: 'rain', level: 2 }, { rain: '大豪雨特報' }, false, 'en').title, 'CWA: Torrential Rain Advisory');
});

test('Macao (SMG) pushes use SMG alert names in each language', async () => {
  const { moLabels, smgTempName } = await import('../src/i18n.js');
  const { warnsumFromSmg } = await import('../src/smg.js');
  const ws = warnsumFromSmg({ temp: '<rss><channel><item><title>橙色高溫提示</title><description>天氣酷熱</description></item></channel></rss>' });
  const mo = moLabels({ heat: ws.WHOT.name });
  assert.equal(messageFor({ category: 'heat', level: 1 }, 'en', mo).title, 'Orange Hot Weather Alert in force!');
  assert.equal(messageFor({ category: 'heat', level: 1 }, 'zh-CN', mo).title, '橙色高温提示生效！');
  assert.equal(messageFor({ category: 'heat', level: 1 }, 'zh-HK', mo).title, '橙色高溫提示生效！');
  assert.equal(messageFor({ category: 'rain', level: 1 }, 'en', mo).title, 'Yellow Rainstorm Warning Signal in force!');
  assert.equal(dropMessageFor({ category: 'rain', from: 2, to: 1 }, 'en', mo).title, 'Red Rain changed to Yellow Rain');
  assert.equal(dropMessageFor({ category: 'heat', from: 1, to: 0 }, 'en', mo).title, 'Orange Hot Weather Alert cancelled');
  assert.equal(reminderFor({ category: 'typhoon', level: 3 }, 'en', mo).title, messageFor({ category: 'typhoon', level: 3 }, 'en').title.replace(' in force!', ' still in force'));
  assert.equal(smgTempName('cold', '寒冷天氣', 'en'), 'Cold Weather Alert');
  assert.equal(smgTempName('cold', '寒冷天氣', 'zh-TW'), '寒冷天氣');
  // HK default labels unchanged.
  assert.equal(messageFor({ category: 'rain', level: 1 }, 'en').title, 'Amber Rainstorm Warning Signal in force!');
});
