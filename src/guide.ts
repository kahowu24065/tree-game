/**
 * v1.4 設定 → 玩法: every rule / formula explanation in one tabbed, scrollable panel.
 * v1.4.1: complete content; every number comes from balance.ts / species data (nothing typed in by hand).
 */
import {
  AGE_MILESTONES,
  BADGES,
  BRANCH_EXPANSION,
  CARBON_FRACTION,
  CHAVE_COEF,
  CHAVE_EXP,
  CO2_PER_CARBON,
  DBH_HEIGHT_EXP,
  ROOT_SHOOT,
  STEM_FORM,
  CARE,
  COLLAPSE_HEIGHT_LOSS,
  COLLAPSE_MAX,
  COLLAPSE_REINFORCE_MULT,
  COLD_ABS_MIN_C,
  COLD_REL_DROP_C,
  COLD_REL_MAX_C,
  DYING_HOURS,
  EMERGENCY,
  GROWTH_FLOOR_SHARE,
  GROWTH_TAU_DAYS,
  H_MULT_TIERS,
  HOT_ABS_MAX_C,
  HOT_REL_MIN_C,
  HOT_REL_RISE_C,
  LANDMARK_N_BONUS,
  MILESTONE_TIER_SHARE,
  MIN_HEIGHT_CM,
  N_DAILY_USE,
  N_FACTOR,
  N_MALNOURISHED,
  N_OPTIMAL,
  NORMAL_PAST_DAYS,
  PEST_DAMAGE,
  PEST_TRIGGER_DAYS,
  PEST_TRIGGER_DAYS_GUARDED,
  PREPS,
  R_DAILY_DECAY,
  R_MAX,
  RAIN_OVER_CAP,
  RECORD_MILESTONE,
  RESCUE_HEALTH,
  RESIDENT_LEAVE_H,
  RESIDENT_MIN_H,
  RESIDENT_N_EACH,
  RESIDENT_N_MAX,
  RESIDENT_STREAK,
  REVIVE_HEALTH,
  START,
  STORM_SURVIVE_GROWTH,
  STORM_SURVIVE_SHARE,
  T1_WATER_LOSS_MULT,
  T2_RAIN_TO_N_CHANCE,
  W_MAX,
  W_NIGHT_LOSS,
  W_OPTIMAL,
  W_SATURATED,
  W_TIERS,
  WEATHER_EVENTS,
  WX_TRACKS,
  WIND_UNLOCK_STAGE,
  WX_CATEGORY_ORDER,
  WX_NUM,
  type WeatherEventId,
} from './balance';
import { SPECIES, STAGE_NAMES, STAGE_SHARES } from './data/species';
import { emergencyName, eventLabel, labelRegion, regionalize, weatherTrackCopy } from './labels';
import { emergencyBonus } from './rules';
import { eventTableHtml } from './ui';

export type GuideTab = 'play' | 'calc' | 'weather' | 'push';
export const GUIDE_TABS: { id: GuideTab; label: string }[] = [
  { id: 'play', label: '玩法' },
  { id: 'calc', label: '計算方式' },
  { id: 'weather', label: '天氣與警告' },
  { id: 'push', label: '推送通知' },
];

const p = (html: string) => `<p>${html}</p>`;
const h = (text: string) => `<h3>${text}</h3>`;
const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const table = (head: string[], rows: (string | number)[][]) =>
  `<div class="gtable-wrap"><table class="gtable"><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
const E = WEATHER_EVENTS;
const L = (id: WeatherEventId) => eventLabel(id);
const youth = STAGE_NAMES[WIND_UNLOCK_STAGE];
const rainDrain = () => emergencyName('rainDrain');
const windIds = () => WX_CATEGORY_ORDER.wind;
const windRow = (id: WeatherEventId) => `${L(id)} ${E[id].damage}`;

function playTab(): string {
  const wOpt = `${W_OPTIMAL[0]}–${W_OPTIMAL[1]}`;
  return [
    h('目標'),
    p(`揀一款樹、改個名，跟住你所在地方嘅真實天氣每日照顧佢。棵樹會慢慢長向佢品種嘅<b>紀錄高度</b>（真實世界最高紀錄，取最接近嘅 10 米）。冇完結日：每晚 12 點（本地時間）結算一次健康同生長。`),
    h('四項數值'),
    table(
      ['數值', '範圍', '最佳', '開局', '說明'],
      [
        ['健康 H', '0–100', '80+ 有綠光', START.health, '決定生長快慢；跌到 0 會瀕死'],
        ['水分 W', `0–${W_MAX}`, wOpt, START.moisture, `澆水最多到 ${W_SATURATED}（泥土飽和）；過 ${W_SATURATED} 開始爛根；${W_MAX} 即刻瀕死`],
        ['養分 N', '0–100', `${N_OPTIMAL[0]}+`, START.nutrients, `每晚用 ${N_DAILY_USE}；低過 ${N_MALNOURISHED} 營養不良`],
        ['抗風力 R', `0–${R_MAX}`, '越高越好', START.resist, `${youth}先解鎖；只影響風災同倒塌`],
      ],
    ),
    h('每日行動'),
    table(
      ['行動', '效果', '每日次數'],
      [
        ['澆水', `水分 +${CARE.water.amount}，最多到 ${W_SATURATED}；去到 ${W_SATURATED} 當日唔使再澆，水分跌咗先可以繼續（唔用次數）；酷熱澆水唔受呢個限；落雨都照澆`, CARE.water.perDay],
        ['疏水', `水分 ${CARE.drain.amount}`, CARE.drain.perDay],
        ['施肥', `養分 +${CARE.fertilize.amount}`, CARE.fertilize.perDay],
        ['除蟲', '有蟲害就清除；冇蟲就當預防，蟲害計數歸零', 1],
        ['加固', `打木樁 +${PREPS.stakes.amount}、綁防風繩 +${PREPS.ropes.amount}、修枝防風 +${PREPS.prune.amount} 抗風力（最多 ${R_MAX}）；${youth}先解鎖`, '每樣 1'],
      ],
    ),
    h('應急行動（有天氣警告先有）'),
    p('每日各一次，唔佔普通次數；做咗嗰類天氣當晚唔扣健康，仲有應急獎勵。'),
    table(
      ['警告', '應急行動', '效果'],
      [
        [L('hot'), emergencyName('heatWater'), `水分 +${EMERGENCY.heatWater.amount}（唔過 ${W_SATURATED}；已飽和都當做咗）`],
        [`${L('rainstorm')}／${L('blackrain')}`, rainDrain(), `水分 ${EMERGENCY.rainDrain.amount}，但唔會低過 ${EMERGENCY.rainDrain.floor}`],
        [L('cold'), emergencyName('warmCover'), '喺樹根周圍鋪 5–10 厘米厚樹皮、乾樹葉、稻草或木屑；水分不變'],
        [`風災${labelRegion() === 'intl' ? '' : '、山泥傾瀉'}`, '加固', `提高抗風力，減少傷害同避免倒塌（${youth}之後）`],
      ],
    ),
    h('生長階段'),
    table(
      ['階段', '由紀錄高度嘅', '備註'],
      STAGE_NAMES.map((n, i) => [n, pct(STAGE_SHARES[i]!), i === WIND_UNLOCK_STAGE ? '解鎖風災、加固、倒塌' : i === 0 ? `開局 ${START.heightCm} 厘米` : '']),
    ),
    h('蟲害'),
    p(`連續 ${PEST_TRIGGER_DAYS} 晚養分低過 ${N_MALNOURISHED}，或者連續 ${PEST_TRIGGER_DAYS} 晚水分高過 ${W_SATURATED}，就會生蟲（有 2 隻或以上長駐動物要 ${PEST_TRIGGER_DAYS_GUARDED} 晚）。有蟲每晚健康 −${PEST_DAMAGE}，直到除蟲。`),
    h('瀕死、枯死同倒塌'),
    ul([
      `健康跌到 0，或者水分任何時候去到 ${W_MAX}，會<b>瀕死 ${DYING_HOURS} 小時</b>。`,
      `瀕死期間將水分調返 ${wOpt}、養分 ${N_OPTIMAL[0]} 以上，即刻救返（健康 ${RESCUE_HEALTH}）。`,
      `時間到仲未救返就<b>枯死</b>；有免死金牌會自動救返一次（健康 ${REVIVE_HEALTH}）。`,
      `風災嗰晚抗風力低過門檻會<b>倒塌</b>：高度 −${Math.round(COLLAPSE_HEIGHT_LOSS * 100)}%，最多捱 ${COLLAPSE_MAX} 次，第 ${COLLAPSE_MAX + 1} 次會死（免死金牌擋得一次）。`,
      `枯死嘅樹會變成小島上嘅養分地標：下一棵樹開局養分 +${LANDMARK_N_BONUS}。`,
    ]),
    h('動物同長駐'),
    p(`照顧得好、遇到特定天氣、高度或者月份，會有動物嚟探（圖鑑可以睇解鎖條件）。健康連續 ${RESIDENT_STREAK} 晚 ${RESIDENT_MIN_H} 以上，見過嘅動物會長駐：每隻每晚養分 +${RESIDENT_N_EACH}（最多 +${RESIDENT_N_MAX}）；2 隻或以上仲幫手防蟲。健康低過 ${RESIDENT_LEAVE_H} 佢哋會搬走。`),
    h('里程碑同徽章'),
    table(
      ['樹齡', '獎勵'],
      [
        ...AGE_MILESTONES.map((m) => [m.label, `金／銀／銅徽章${m.perk ? `＋${BADGES[m.perk].name}：${BADGES[m.perk].perk}` : ''}`]),
        ['第一次高過紀錄高度', RECORD_MILESTONE.label],
      ],
    ),
    p('樹齡由種低嗰日計做第 1 日，每結算一晚加一日。枯死再種，樹齡由第 1 日開始，已攞嘅徽章同能力照留。'),
    p('第一棵樹高過紀錄高度之後，向左滑去第二座空島再種一棵；向右滑返第一座。鏡頭自己轉嘅時候會見到其他空島。成就：踏足新島、第二棵樹、新島破紀錄。'),
    h('成就'),
    table(
      ['捱過', '點樣先計一次'],
      WX_TRACKS.map((t) => {
        const copy = weatherTrackCopy(t.id);
        return [copy.name, copy.detail];
      }),
    ),
    p('風暴、八號、暴雨、黑雨每次新嘅一場計 1（橫跨幾日都係同一場），每次都可以拎成就。酷熱同寒冷按成功嗰日計，夠 1、5、10、20、50、100 次，之後每多 100 次先再拎。跟住呢棵樹計。枯死再種要重新攞，已經拎到嘅留喺成就分頁嘅收藏。'),
    h('樹種'),
    table(
      ['樹種', '紀錄高度'],
      SPECIES.map((s) => [`${s.name}<br><small>${s.english}</small>`, `${s.targetM} 米`]),
    ),
    h('存檔'),
    p('進度只留喺呢部機；換機或者重裝前用 設定 → 匯出存檔，之後喺新機匯入。'),
  ].join('');
}

function calcTab(): string {
  const tiers = W_TIERS.map((t, i) => {
    const lo = i === 0 ? 0 : Math.floor(W_TIERS[i - 1]!.max) + 1;
    const hi = t.max === Infinity ? W_MAX - 1 : Math.floor(t.max);
    return [`${lo}–${hi}`, t.label, `${t.score > 0 ? '+' : ''}${t.score}`];
  });
  tiers.push([`${W_MAX}`, '根部浸死', '即刻瀕死']);
  return [
    h('每晚結算次序'),
    ul([
      `<b>水分：</b>自然流失 −${W_NIGHT_LOSS}；落雨日（毛毛雨、${L('rainstorm')}、${L('blackrain')}）唔流失。落雨加嘅水一落就計：純毛毛雨 +${E.drizzle.dW}（過 ${W_SATURATED} 最多 +${RAIN_OVER_CAP.drizzle}），${L('rainstorm')}／${L('blackrain')} +${E.rainstorm.dW}（過 ${W_SATURATED} 最多 +${RAIN_OVER_CAP.heavy}，同一日只計一次）。同日有${L('rainstorm')}或者${L('blackrain')}就唔再計毛毛雨。`,
      `<b>養分：</b>−${N_DAILY_USE}，加長駐動物（每隻 +${RESIDENT_N_EACH}，最多 +${RESIDENT_N_MAX}）。`,
      '<b>健康：</b>用結算後嘅水分同養分計（見下）。',
      `<b>抗風力：</b>${youth}之後每晚 −${R_DAILY_DECAY}，有風災再扣消耗量。`,
      '<b>生長</b>，之後再判斷倒塌、蟲害、長駐動物同瀕死。',
    ]),
    h('健康公式'),
    p('<code>健康 = 舊健康 + 水分分 + 養分分 + 熱分 + 寒分 + 雨分 + 風分 + 應急獎勵 − 蟲害</code>，結果限 0–100。'),
    table(['水分', '狀態', '水分分'], tiers),
    table(
      ['養分', '養分分'],
      [
        [`${N_OPTIMAL[0]}+`, `+${N_FACTOR.good}`],
        [`${N_MALNOURISHED}–${N_OPTIMAL[0] - 1}`, `${N_FACTOR.mid}`],
        [`低過 ${N_MALNOURISHED}`, `${N_FACTOR.bad}`],
      ],
    ),
    h('天氣分'),
    table(
      ['類', '事件', '唔應對', '應對後'],
      [
        ['熱', L('hot'), `−${E.hot.damage}`, `做${emergencyName('heatWater')}：0`],
        ['寒', L('cold'), `−${E.cold.damage}`, `做${emergencyName('warmCover')}：0`],
        ['雨', `${L('rainstorm')}／${L('blackrain')}`, `−${E.rainstorm.damage}／−${E.blackrain.damage}`, `做${rainDrain()}：0`],
        ['風', windIds().map(windRow).join('、'), '基礎 × (1 − R/100)', `加固提高 R；${youth}前 0`],
      ],
    ),
    p(`抗風力唔會減熱、寒、雨嘅傷害。蟲害每晚 −${PEST_DAMAGE}。`),
    h('應急獎勵'),
    p(`做一樣 +${emergencyBonus(1)}；同一日做 n 樣（n ≥ 2）＝ ${EMERGENCY.bonus} × n × ${EMERGENCY.bothMult}：兩樣 +${emergencyBonus(2)}、三樣 +${emergencyBonus(3)}。只計啱警告嘅應急行動。`),
    h('疊加規則'),
    ul([
      '熱、寒、雨、風四類各自計，可以同時扣（例如酷熱＋暴雨＋颱風三樣都計）。',
      `同一類只計最嚴重嗰個：雨 ${L('rainstorm')} &lt; ${L('blackrain')}；風 ${windIds().map(L).join(' &lt; ').replace(`${L('landslip')} &lt; ${L('typhoon1')}`, `${L('typhoon1')}${labelRegion() === 'intl' ? '' : '＝' + L('landslip')}`)}。`,
      `${L('rainstorm')}同${L('blackrain')}嘅即時 +${E.rainstorm.dW} 水分同一日只計一次。`,
      labelRegion() === 'intl' ? '' : `山泥傾瀉同風球一齊生效：只計較嚴重嗰個，加固一次兩樣都顧到。`,
    ].filter(Boolean)),
    h('抗風力同倒塌'),
    table(
      ['風災', '基礎傷害', '抗風力消耗', '倒塌門檻（R 低過）'],
      windIds().filter((id) => labelRegion() !== 'intl' || id !== 'landslip').map((id) => [L(id), E[id].damage, -E[id].dR, E[id].collapseBelow ?? '—']),
    ),
    ul([
      `傷害 = 基礎 × (1 − R/100)，用結算前嘅 R；門檻都係睇結算前嘅 R。`,
      `倒塌：高度 −${Math.round(COLLAPSE_HEIGHT_LOSS * 100)}%，第 ${COLLAPSE_MAX + 1} 次會死；倒塌後第二日加固效果 ×${COLLAPSE_REINFORCE_MULT}。`,
      `${youth}之前：風災唔傷樹、唔倒塌，抗風力唔變。`,
    ]),
    h('生長'),
    p(`<code>每晚基本生長 = max((紀錄高度 − 而家高度) × (1 − e^(−1/${GROWTH_TAU_DAYS})), 紀錄高度 × ${GROWTH_FLOOR_SHARE * 100}%)</code>，冇上限。`),
    p('<code>生長 = 基本 × 健康係數 × 天氣加成</code>（健康係數係負數時唔乘天氣加成）。'),
    table(['結算後健康', '健康係數'], H_MULT_TIERS.map((t, i) => [i === 0 ? `${t.min}+` : `${t.min}–${H_MULT_TIERS[i - 1]!.min - 1}`, `×${t.mult}（${t.label}）`])),
    p(`天氣加成睇當日主要事件（基礎傷害最高嗰個）：${(['clear', 'drizzle', 'hot', 'cold', 'rainstorm', 'blackrain', 'typhoon1', 'thunder', 'typhoon8'] as WeatherEventId[]).map((id) => `${L(id)} ×${E[id].growth}`).join('、')}。${youth}之後風災傷害唔超過基礎 ${Math.round(STORM_SURVIVE_SHARE * 100)}%（即係擋咗 ${Math.round((1 - STORM_SURVIVE_SHARE) * 100)}% 以上）再 ×${STORM_SURVIVE_GROWTH}。「今日小事」有時會再加成。高度最少 ${MIN_HEIGHT_CM} 厘米。`),
    p(`照顧 ×1 嘅話：大約 1個月 ${pct(1 - Math.exp(-30 / GROWTH_TAU_DAYS))}、3個月 ${pct(1 - Math.exp(-90 / GROWTH_TAU_DAYS))}、半年 ${pct(1 - Math.exp(-182 / GROWTH_TAU_DAYS))}、1年 ${pct(1 - Math.exp(-365 / GROWTH_TAU_DAYS))} 紀錄高度。`),
    h('徽章等級'),
    p(`里程碑嗰日高度 ÷ 紀錄高度，對比預計 <code>1 − e^(−樹齡/${GROWTH_TAU_DAYS})</code>：夠 ${Math.round(MILESTONE_TIER_SHARE.gold * 100)}% 金、夠 ${Math.round(MILESTONE_TIER_SHARE.silver * 100)}% 銀，其他銅。`),
    p(`能力徽章：一級每晚水分流失 ×${T1_WATER_LOSS_MULT}；二級${L('rainstorm')}時有 ${Math.round(T2_RAIN_TO_N_CHANCE * 100)}% 機會將一半水分轉做養分；三級一面免死金牌。`),
    h('碳吸收量'),
    p(`今年速率，唔係成棵庫存除以樹齡。胸徑 = 10 米典型胸徑 × (樹高÷10)^${DBH_HEIGHT_EXP}，跟住固定。樹高再長一年（紀錄高度減而家高度，乘 <code>1 − e^(−1/真實時間常數)</code>）。地上生物量用 Chave 2014 <code>${CHAVE_COEF} × (密度 × 胸徑² × 樹高)^${CHAVE_EXP}</code> 同樹幹體積（形狀係數 ${STEM_FORM}、枝條 ×${BRANCH_EXPANSION}）取平均，加根 ×${1 + ROOT_SHOOT}，乘碳含量 ${CARBON_FRACTION}，再 ×${Math.round(CO2_PER_CARBON * 1000) / 1000}。兩次庫存嘅差就係今年吸收量。`),
  ].join('');
}

function weatherTab(): string {
  const intl = labelRegion() === 'intl';
  const L = (id: WeatherEventId) => eventLabel(id, 'hk');
  const rainDrain = () => emergencyName('rainDrain', 'hk');
  const hkRows: string[][] = [
    ['酷熱天氣警告', L('hot'), emergencyName('heatWater'), `即時水分 ${E.hot.dW}；唔做 −${E.hot.damage}`],
    ['寒冷天氣警告', L('cold'), emergencyName('warmCover'), `唔做 −${E.cold.damage}`],
    ['黃雨／紅雨', L('rainstorm'), rainDrain(), `即時水分 +${E.rainstorm.dW}（過 ${W_SATURATED} 最多 +${RAIN_OVER_CAP.heavy}）；唔做 −${E.rainstorm.damage}`],
    ['黑雨', L('blackrain'), rainDrain(), `同上（同一日只加一次水）；唔做 −${E.blackrain.damage}`],
    ['雷暴警告／強烈季候風信號', L('thunder'), '加固', `${E.thunder.damage} × (1 − R/100)；R 低過 ${E.thunder.collapseBelow} 倒塌`],
    ['一號／三號風球', L('typhoon1'), '加固', `${E.typhoon1.damage} × (1 − R/100)；R 低過 ${E.typhoon1.collapseBelow} 倒塌`],
    ['山泥傾瀉警告', L('landslip'), '加固', `同初級颱風：${E.landslip.damage} × (1 − R/100)；R 低過 ${E.landslip.collapseBelow} 倒塌`],
    ['八號或以上風球', L('typhoon8'), '加固', `${E.typhoon8.damage} × (1 − R/100)；R 低過 ${E.typhoon8.collapseBelow} 倒塌`],
  ];
  const intlRows: string[][] = [
    [eventLabel('hot', 'intl'), `最高 ≥ ${HOT_ABS_MAX_C}°C；或者最高 ≥ ${HOT_REL_MIN_C}°C 兼高過過去 ${NORMAL_PAST_DAYS} 日平均最高 ${HOT_REL_RISE_C}°C 或以上`],
    [L('cold'), `最低 ≤ ${COLD_ABS_MIN_C}°C；或者最低 ≤ ${COLD_REL_MAX_C}°C 兼低過過去 ${NORMAL_PAST_DAYS} 日平均最低 ${COLD_REL_DROP_C}°C 或以上`],
    [eventLabel('rainstorm', 'intl'), `日雨量 ≥ ${WX_NUM.rainstorm.mm} 毫米`],
    [eventLabel('blackrain', 'intl'), `日雨量 ≥ ${WX_NUM.blackrain.mm} 毫米`],
    [L('thunder'), `雷暴天氣，或者陣風 ≥ ${WX_NUM.thunder.gust} 公里/時`],
    [eventLabel('typhoon1', 'intl'), `陣風 ≥ ${WX_NUM.typhoon1.gust} 或者平均風 ≥ ${WX_NUM.typhoon1.wind} 公里/時`],
    [eventLabel('typhoon8', 'intl'), `陣風 ≥ ${WX_NUM.typhoon8.gust} 或者平均風 ≥ ${WX_NUM.typhoon8.wind} 公里/時`],
  ];
  return [
    h('香港：跟天文台警告'),
    table(['天文台警告', '遊戲事件', '應對', '效果（唔應對）'], hkRows),
    ul([
      `<b>山泥傾瀉警告</b>（天文台代碼 WL，只限香港）：屬風災類，嚴重程度同一號／三號風球一樣；同風球一齊只計較嚴重嗰個，加固一次兩樣都顧到。`,
      `風災類（雷暴、風球、山泥傾瀉）要${youth}先生效；之前唔傷樹、唔倒塌。`,
      '澳門用地球物理氣象局，同一套：警告同預報都只跟氣象局，唔會混入天文台或者 Open-Meteo。',
      '攞唔到嗰個來源時，唔會改用另一個來源嘅數字當成警告。',
      '即時水分變化喺警告第一次出現嗰陣計，每日一次。',
    ]),
    h('香港同澳門以外：跟 Open-Meteo'),
    p(`名稱唔同，規則一樣：酷熱天氣警告＝${eventLabel('hot', 'intl')}、${eventLabel('typhoon1', 'intl')}＝初級颱風、${eventLabel('typhoon8', 'intl')}＝高級颱風、${eventLabel('rainstorm', 'intl')}＝暴雨、${eventLabel('blackrain', 'intl')}＝黑雨；應急行動叫「${emergencyName('rainDrain', 'intl')}」。冇山泥傾瀉。`),
    table(['事件', '門檻'], intlRows),
    p('同一日只取最嚴重嘅風／雨事件，再加埋酷熱、寒冷（可以同時成立）。'),
    h('預警同今晚預計'),
    ul([
      '天氣卡只標而家生效嘅警告，唔會自己估幾多個鐘後先有警告。',
      '樹木狀態卡嘅「今晚預計」照而家已經生效嘅天氣計，唔計未發生嘅預報。',
      intl ? '' : '天氣概況頁嘅警告同預報都來自同一個來源：香港係天文台，澳門係地球物理氣象局。',
    ].filter(Boolean)),
    h('天氣事件總表'),
    eventTableHtml(),
  ].join('');
}

function pushTab(): string {
  return [
    h('推送（Android app）'),
    p('設定 → 提醒通知 開咗就會收，app 關咗都收到。香港跟天文台警告、澳門跟地球物理氣象局（都係大約每 2.5 分鐘檢查）；其餘地方按 Open-Meteo 同遊戲一樣嘅門檻（每 20 分鐘檢查）。'),
    h('幾時會推'),
    table(
      ['情況', '會唔會推'],
      [
        ['新警告或者升級：香港＝酷熱、寒冷、黃／紅／黑雨、一號／三號／八號或以上風球、山泥傾瀉（雷暴警告唔推）；香港以外＝酷熱、寒冷、大雨／豪雨、狂風雷暴、烈風／暴風', '會；如果今日已經做咗對應行動（酷熱澆水、疏水、保暖、加固）就唔再推'],
        [`未到${youth}遇到風球或者山泥傾瀉`, '照推，但只係提你現實中注意安全（遠離窗邊、留意最新消息），唔會叫你加固'],
        ['棵樹瀕死、枯死或者有倒塌風險', '照樣收天氣警告，通知會加一句講棵樹狀態'],
        ['降級或者取消（例如紅雨轉黃雨、八號轉三號、酷熱天氣警告取消）', '一定推（資訊通知）'],
      ],
    ),
    h('應急提醒'),
    p('警告生效大約 2 小時後，如果今日仲未做對應行動，會再提你一次（每個警告最多一次）。做咗、棵樹已經枯死，或者未到青年樹嘅風災，就唔會提。'),
    h('防止亂跳'),
    ul([
      '伺服器重新啟動後第一次檢查只記低現況，唔推（避免重複）。',
      '香港以外嘅降級／取消要連續兩次檢查（大約 40 分鐘）都係較低先推，免得預報上上落落。',
    ]),
    h('本機提醒（唔使網絡）'),
    ul([
      '今晚結算前 1.5 小時仲未澆水／施肥。',
      '瀕死剩大約 12 小時同 2 小時。',
      '離開 app 時有警告嘅應急行動未做：1 小時後提你。',
    ]),
  ].join('');
}

export function guideModal(tab: GuideTab = 'play'): string {
  const body = tab === 'calc' ? calcTab() : tab === 'weather' ? weatherTab() : tab === 'push' ? pushTab() : playTab();
  return `
    <p class="eyebrow">設定</p>
    <h2>玩法</h2>
    <div class="seg guide-tabs">${GUIDE_TABS.map((t) => `<button type="button" class="${t.id === tab ? 'on' : ''}" data-guide="${t.id}">${t.label}</button>`).join('')}</div>
    <div class="howto guide-body">${tab === 'weather' || tab === 'push' ? body : regionalize(body)}</div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `;
}
