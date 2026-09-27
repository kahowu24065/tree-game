/** v1.4 設定 → 玩法: every rule / formula explanation in one tabbed, scrollable panel. */
import { CARE, EMERGENCY, N_OPTIMAL, PREPS, R_DAILY_DECAY, R_MAX, W_OPTIMAL } from './balance';
import { labelRegion, regionalize } from './labels';
import { eventTableHtml, weatherRulesText } from './ui';

export type GuideTab = 'play' | 'calc' | 'weather' | 'push';
export const GUIDE_TABS: { id: GuideTab; label: string }[] = [
  { id: 'play', label: '玩法' },
  { id: 'calc', label: '計算方式' },
  { id: 'weather', label: '天氣與警告' },
  { id: 'push', label: '推送通知' },
];

const p = (html: string) => `<p>${html}</p>`;

function playTab(): string {
  return [
    p('<b>每日：</b>照顧棵樹（澆水、施肥、除蟲、疏水、加固、保暖），每晚 12 點結算健康同生長。冇完結日，九款樹任揀，棵樹會一直陪住你。'),
    p('底部掣：澆水（下面係疏水）、施肥（下面係除蟲）、加固、保暖；圖鑑喺右上樹木狀態卡入面。每晚樹旁邊都會生起營火。'),
    p(regionalize(`澆水每日 ${CARE.water.perDay} 次、每次 +${CARE.water.amount}，最多澆到 100（泥土飽和就唔使澆，唔會用咗次數）；疏水每日 3 次、每次 −10。`)),
    p(regionalize('<b>應急行動：</b>天氣警告生效時先有，每日各一次，唔佔普通次數：酷熱 → 酷熱澆水；暴雨／黑雨 → 暴雨疏水；寒冷 → 保暖（喺樹根周圍鋪 5–10 厘米樹皮、乾樹葉、稻草或木屑）；風災同山泥傾瀉 → 加固。')),
    p(`<b>加固：</b>青年樹先解鎖：打木樁 +${PREPS.stakes.amount}、綁防風繩 +${PREPS.ropes.amount}、修枝防風 +${PREPS.prune.amount}，每樣每日一次（抗風力最多 ${R_MAX}）。`),
    p(`<b>瀕死：</b>健康跌到 0 或者水分去到 150 會瀕死 24 小時；將水分調返 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就救得返，否則枯死（免死金牌可以擋一次）。`),
    p('<b>里程碑：</b>樹齡 1個月、3個月、半年、1年、2年、3年有金／銀／銅徽章；第一次高過紀錄高度有「超越世界紀錄」。3個月、半年、1年仲送一級、二級、三級能力徽章。枯死再種，樹齡由 0 開始，徽章照留。'),
    p('<b>存檔：</b>進度留喺呢部機；換機或者重裝前用設定 → 匯出存檔，之後匯入。'),
  ].join('');
}

function calcTab(): string {
  return [
    p('<b>每晚結算：</b>先計水分變化（每晚自然流失 −10；落雨日唔流失，毛毛雨仲 +10），再計健康：'),
    p('健康 = 舊健康 + 水分分數 + 養分分數 + 熱／寒／雨／風四類天氣分 + 應急獎勵 − 蟲害（每晚 −15）。'),
    p('水分 0–150：50–100 +5；低過 50 乾旱 −10；101–115 輕度爛根 −10；116–135 嚴重爛根 −20；136–149 根部壞死 −30；去到 150 即刻瀕死。'),
    p('養分：60 以上 +5、30–59 為 0、低過 30 −10；每晚用 10。'),
    p(regionalize('酷熱警告一出水分即時 −20；暴雨／黑雨即時 +20（過咗 100 最多再加 10，同一日只計一次）。')),
    p(`應急獎勵：做一樣 +${EMERGENCY.bonus}；兩樣 (3 + 3) × ${EMERGENCY.bothMult} = +4.5；三樣 (3 + 3 + 3) × ${EMERGENCY.bothMult} = +6.75。做咗嗰類天氣唔扣健康。`),
    p(regionalize(`<b>風災（初級颱風、山泥傾瀉、狂風雷暴、高級颱風）：</b>青年樹先生效。傷害 = 基礎 × (1 − R/100)（初級颱風／山泥傾瀉 30、狂風雷暴 35、高級颱風 60）；擋到七成半以上仲有生長 ×1.3。抗風力每晚 −${R_DAILY_DECAY}，風災再消耗 18／25／35。`)),
    p(regionalize('倒塌：風災嗰晚抗風力低過門檻（初級颱風／山泥傾瀉 20、狂風雷暴 25、高級颱風 40）一定倒塌，高度 −20%；最多倒 2 次，第 3 次會死。倒塌後第二日加固雙倍。')),
    p('<b>生長：</b>每晚基本生長 =（紀錄高度 − 而家高度）× (1 − e^(−1/100))，最少係紀錄高度嘅 0.02%，冇上限；再 × 健康係數 × 天氣加成。健康 80 以上 ×1.5（有綠光）。照顧 ×1 大約 1個月 26%、3個月 59%、半年 84%、1年 97% 紀錄高度，之後每年再長約 7%。'),
    p('<b>徽章：</b>嗰日高度對比照顧 ×1 嘅預計（樹齡 t 日預計 1 − e^(−t/100) 嘅紀錄高度）：夠 98% 金、88% 銀，其他銅。'),
    p('<b>碳吸收量：</b>約 0.35 × 高度(米)^1.5 公斤 CO₂／年。'),
  ].join('');
}

function weatherTab(): string {
  const hk = labelRegion() !== 'intl';
  return [
    p(weatherRulesText()),
    hk ? p('<b>山泥傾瀉警告（只限香港）：</b>當風災計，同初級颱風（一號／三號風球）一樣嚴重，要靠加固；同風球一齊生效只計較嚴重嗰個，加固一次兩樣都顧到。未到青年樹唔會傷樹。') : '',
    p(regionalize('今晚預計（狀態卡）會照而家天氣同狀態話你今晚健康會點變；12 小時內有惡劣天氣會出倒數預警。')),
    `<h3 class="sub">天氣事件表</h3>${eventTableHtml()}`,
  ].join('');
}

function pushTab(): string {
  return [
    p('<b>推送（Android app，設定 → 提醒通知 開）：</b>即使 app 關咗都會收到。香港跟天文台警告；香港以外按 Open-Meteo 同遊戲一樣嘅規則（每 20 分鐘檢查一次）。'),
    p('<b>會推：</b>新警告或者升級（酷熱、寒冷、黃／紅／黑雨、一號／三號／八號或以上風球、山泥傾瀉）；降級同取消（例如紅雨轉黃雨、八號轉三號、酷熱天氣警告取消）都會通知。'),
    p('<b>應急提醒：</b>警告生效約 2 小時後，如果今日仲未做對應應急行動（酷熱澆水、疏水、加固、保暖），會再提一次（最多一次）；做咗就唔再煩你。'),
    p('<b>未到青年樹：</b>風球同山泥傾瀉照樣通知，但只係提你現實中注意安全，唔會叫你加固。棵樹瀕死、枯死或者有倒塌風險都照樣收天氣資訊，通知會順便講埋棵樹狀態。'),
    p('<b>本機提醒：</b>今晚結算前 1.5 小時未澆水／施肥、瀕死剩 12 同 2 小時、離開 app 時有警告未處理（1 小時後）。'),
  ].join('');
}

export function guideModal(tab: GuideTab = 'play'): string {
  const body = tab === 'calc' ? calcTab() : tab === 'weather' ? weatherTab() : tab === 'push' ? pushTab() : playTab();
  return `
    <p class="eyebrow">設定</p>
    <h2>玩法</h2>
    <div class="seg guide-tabs">${GUIDE_TABS.map((t) => `<button type="button" class="${t.id === tab ? 'on' : ''}" data-guide="${t.id}">${t.label}</button>`).join('')}</div>
    <div class="howto guide-body">${body}</div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `;
}
