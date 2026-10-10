# 《世界之樹》交接文件（HANDOFF）

寫俾接手嘅 Cursor agent：淨係睇呢個 repo 就可以繼續開發。最後更新：2026-09-27，版本 **1.4.1**（main `9a98603` 之後）。

---

## 1. 項目概覽

- 一個跟住**真實天氣**、每日照顧一棵樹嘅輕遊戲（繁體中文、廣東話口語 UI）。3D 浮島場景＋玻璃風 HUD。
- 網頁版（GitHub Pages）同 Android app（Capacitor 7）共用同一份 `dist/`。
- 香港用天文台（HKO）警告同讀數；香港以外用 Open-Meteo，按遊戲自己嘅門檻判斷。
- Android app 另有：原生定位、Preferences 存檔、本機提醒、FCM 天氣警告推送（經自家 push server）。
- Repo：`github.com/kahowu24065/tree-game`（remote 名喺原本部機叫 `github`；`main` = 開發，`gh-pages` = 舊網址轉址頁；網站喺 Cloudflare Pages）。

### 技術
| 部分 | 用咩 |
| --- | --- |
| 前端 | Vite 8 + TypeScript 6（strict，`noUnusedLocals`），three.js，冇框架（字串模板＋`innerHTML`） |
| 測試 | Vitest（`test/**/*.test.ts`，node 環境）；版面／截圖用 Playwright 腳本（`scripts/`） |
| App | Capacitor 7 Android（appId `app.sekaitree.game`（1.4.31 起；之前 `io.github.kahowu24065.treegame`），minSdk 跟 Capacitor 預設，compile/target 35） |
| 推送 | `push-server/`：Node 20，零框架 HTTP server＋firebase-admin，部署喺 Oracle VM |
| Firebase | 項目 `sekai-tree`（Spark 免費方案），只用 FCM |

### 資料夾
```
src/
  main.ts        入口：狀態、render loop、所有 click 處理（document 級 delegation，睇 el.closest(...) 嗰行）
  ui.ts          HUD：天氣卡、樹木狀態卡、底部掣、照顧／圖鑑／里程碑 pop box、天氣概況頁、設定 modal
  guide.ts       設定 → 玩法 面板（玩法／計算方式／天氣與警告／推送通知），數字全部由 balance.ts 讀
  balance.ts     ★ 所有數值（天氣事件表、門檻、行動效果、里程碑…）
  rules.ts       純公式（水分分、養分分、傷害、生長、徽章）
  sim.ts         遊戲狀態、每晚結算 planNight / settle、行動、瀕死、倒塌
  events.ts      天氣 → 遊戲事件（HKO 警告對應、Open-Meteo 門檻、12 小時預警）
  weather.ts / hko.ts   攞天氣（Open-Meteo、HKO API）同解析
  labels.ts      地區名稱（香港 vs 外地：烈風／暴風／大雨／豪雨）
  storage.ts / meta.ts / saveCode.ts   存檔、跨局收藏、匯出／匯入碼
  native/        Capacitor 專用（location, persist, notify 本機提醒, push FCM 註冊＋/state）
  dev/           開發者面板（release app 用 VITE_DEV_PANEL=0 剔走）
  three/ render.ts draw-animals.ts animalHud.ts   3D 場景、動物、特效
  data/          species（9 樹種）、animals、habitat、eco
test/            Vitest；test/push-rules-parity.test.ts 會 import push-server/src/intl.js 對規則
scripts/         Playwright 檢查／截圖（最新：scripts/v141-check.mjs）
push-server/     推送伺服器原始碼（src, test, deploy/）
android/         Capacitor Android 專案（android/app/google-services.json 有入 git）
app-assets/      icon 原圖同 `npm run assets` 產生器
```

---

## 2. 遊戲規則

- **玩家睇到嘅完整規則**：`src/guide.ts`（設定 → 玩法）。改規則時同步改佢；數字要由 `balance.ts` 讀，唔好手打。
- **數值來源**：`src/balance.ts`；公式：`src/rules.ts`、`src/sim.ts`（`planNight`）。
- **設計書**：Google Doc id `1lWDByE-kxwJlvYw_ZEyg2TWdyGOIrfyus-z1NA_2_UA`。
- README 有逐版更新記錄（v7–v15.2）。

### 規則摘要
- 數值：健康 H 0–100、水分 W 0–150（最佳 50–100，150 即刻瀕死）、養分 N 0–100（60+ 最好）、抗風力 R 0–100（青年樹先解鎖）。
- 每晚 12 點（本地時間）結算：水分變化 → `H += 水分分 + 養分分 + 熱／寒／雨／風天氣分 + 應急獎勵 − 蟲害` → R 衰減 → 生長 → 倒塌／蟲害／長駐動物／瀕死。
- 四類天氣各自計、同類只計最嚴重；應急行動（酷熱澆水、暴雨疏水、保暖、加固）做咗免扣＋獎勵（1 樣 +3，n 樣 3n×0.75）。
- 水分（1.4.23）：每小時 −1（一日 −24，落雨日 0），澆水每下 +5 封頂 100，每個時鐘小時最多 2 次（`CARE.water.perHour`，記錄喺 `care.waterHour`／`care.waterInHour`）；酷熱澆水另計。23:00 本地通知 `waterLow`（`previewNight().wTone === 'dry'`）。
- 風災（初級颱風＝山泥傾瀉 < 狂風雷暴 < 高級颱風）：傷害 = 基礎 × (1 − R/100)，R 低過門檻倒塌（高度 −20%，第 3 次死）；青年樹之前唔生效。
- 生長：`max((紀錄高度 − h)(1 − e^(−1/100)), 0.0002 × 紀錄高度) × 健康係數 × 天氣加成`。冇賽季、冇完結日。
- 山泥傾瀉警告：HKO warnsum 代碼 `WL`，只限香港，風災類、同 T1/T3 同級，用加固應付；同風球一齊只計較嚴重。

### 版本歷史
| 版本 | 重點 |
| --- | --- |
| v13 | 熱／雨／風三類天氣疊加、應急行動、青年樹先有風災、確定性倒塌、免死金牌 |
| v13.1 | 動物最少成對、3–5 分鐘輪換 |
| v14 | 取消賽季、9 樹種任揀、生長曲線、樹齡里程碑（金銀銅）、超越世界紀錄 |
| v15 | 寒冷＋保暖、外地相對酷熱／寒冷門檻、地區名稱、新底部掣排位 |
| v15.1 / 15.2 | 澆水／施肥特效、保暖改根部覆蓋法、每晚營火 |
| v16 | 倒塌／枯死動畫、斷頂同倒下樹幹、瀕死外觀 |
| v16.1 | 版面：地點揀選入天氣卡、狀態卡對齊、單張提示卡＋翻頁 |
| Android 1.0 | Capacitor debug APK |
| 1.1 | 原生定位、Preferences 存檔、本機提醒（**網站最後更新喺呢版**） |
| 1.2 / 1.2.1 | FCM 推送、通知 icon；存檔匯出／匯入 |
| 1.3 / 1.3.1 | 正式簽名 release、app icon／splash、release 冇開發者面板；push server v2（按行動、外地格仔） |
| 1.4 | 玩法面板、山泥傾瀉、推送新規則（枯樹照推、青年樹前安全提示、降級／取消都推） |
| 1.4.1 | 獨立「天氣概況」頁、樹木狀態 pop box（照顧／圖鑑／里程碑）、玩法內容補齊、修正玩法分頁同通知開關撳唔到 |
| 1.4.14 | 臺灣用中央氣象署（天氣、預報、警特報都跟氣象署；經 push server `/cwa`，key 只喺 VM）；臺灣警特報推送 |
| 1.4.15 | 臺灣大雷雨即時訊息 → 狂風雷暴（app＋推送）；夜晚天氣文字唔再講「陽光」；保暖說明補返「防止根部凍傷」 |
| 1.4.16 | 孵蛋倒數顯示秒（HH:MM:SS），畫面見到時每秒更新；蛋孵咗／卡收埋／app 去背景就停計時器 |
| 1.4.17 | 水分／養分／健康／抗風力全日按真實時間慢慢變（每 15 分鐘一段，閂 app 時間返嚟補返，一日總數同舊晚結算一樣）；天氣傷害、應急獎勵、倒塌、生長照舊晚上計；健康慢慢跌到 0 即刻瀕死；每晚出「每日總結」（ΔH／ΔW／ΔN／Δ鞏固度）；新增「健康好低」本地通知（id 107）；versionCode 24 |
| 1.4.18 | 健康唔再日頭 drift：水分／養分／抗風力照舊慢慢變，健康半夜用一日完結嗰刻嘅 W/N/蟲害照舊每晚公式一次過結算（例：日頭 110 → 100，用 100 計 +5）；瀕死由半夜結算開始；1.4.17 存檔載入時還原當日已 drift 嘅健康；「健康好低」通知改為預計今晚結算會跌到 0 時、半夜前 3 小時提；versionCode 25（8aa2432 係中途版本，已被取代） |
| 1.4.19 | 動物懸停改為喺附近 3 米內跳點（停 2.5–6.5 秒、緩動飛行 ≤1.2 m/s）；長駐動物：連續 5／5／10 晚健康 ≥85 先多一種，<75 走一種，每種（最多 3 種）蟲害遲 1 晚、每晚少扣 3，冇咗 +2 養分；雀鳥健康 ≥90 先生蛋；**多語言**：`src/i18n/`（zh-HK 原文、zh-TW、zh-CN、en，`t()`／`tName()`），預設跟裝置語言，設定 → 語言可以揀（儲存後重新載入）；推送伺服器按裝置 `locale`（/register、/state）用四種語言發通知，官方警告英文名；測試 `test/i18n.test.ts`（四語 key／參數／HTML tag 一致、src 冇硬寫中文）；versionCode 26 |
| 1.4.20 | 英文版面修正（中文版面不變，CSS 全部喺 `html[lang='en']` 下）：樹木狀態副標題英文只顯示「樹種 · 階段」（預設樹名例如舊存檔嘅「世界之樹」唔顯示，可換行；之前英文樹種同階段黐埋）；狀態列英文只顯示 H/W/N/R 字母；酷熱澆水小掣改兩行；底部掣縮短：Feed／Fed、Full、At young tree、Done、Cold alert、Urgent，長字加省略號；versionCode 27 |
| 1.4.21 | 英文樹木狀態副標題重新顯示樹名：「World Tree · 樹種 · 階段」（可換行）；預設樹名（任何語言嘅 sim.001，例如舊存檔「世界之樹」）用目前語言顯示，自訂名照原樣；中文版面不變；versionCode 28（只上咗網站，冇出 APK；併入 1.4.22） |
| 1.4.22 | 包埋 1.4.21 樹名修正。**澳門／臺灣警告名四語**：`warn.*` key（CWA 豪雨／大豪雨／颱風／強風／低溫／高溫資訊／濃霧／大雷雨即時訊息＋燈號顏色；SMG 黃／橙色高溫／低溫提示、澳門黃色暴雨），`cwaWarningName()`（src/cwa.ts）同 push server `cwaName` 英文一致；澳門推送用 SMG 名（`moLabels`，記住最後嘅冷暖提示標題）。**氣象局官方語言版**：天文台 warnsum／fnd 用 lang=tc（zh-HK、zh-TW）／sc（zh-CN）／en，rhrread 仍用 tc（站名／地區用中文配對），有警告句先再攞一次玩家語言版；SMG 英文用 e_*.xml（只攞文字：預報、概況、警告句），信號／風力／雨量仍由 c_*.xml 計；zh-CN 嘅 SMG／CWA 文字用 OpenCC（opencc-js t2cn，按需載入約 107 KB）轉簡體；push server `/smg/` 代理加 e_* 檔；versionCode 29 |
| 1.4.23 | 水分機制：W 每小時跌 1（一日 24，慢慢跌，取代舊基本流失；落雨日照舊唔跌、一級徽章 ×0.9 照舊；熱／雨等天氣修正照舊）；澆水每下 +5、最多到 100（只有落雨可以超過 100 → 爛根照舊）；取消每日澆水限制，改為每個鐘頭（時鐘小時）最多 2 次，底部掣顯示「剩 n 次」／「HH:00 再澆」（英文 n left／At HH:00），照顧頁顯示「本小時 n/2」；酷熱澆水不變（+5、上限 100、每日一次、唔計入每小時限制）；新增「水分不足」本地通知（id 108，23:00，預計今晚結算水分會扣健康先提，每晚最多一次，跟裝置語言）；四語計法／教學更新；versionCode 30 |
| 1.4.24 | 水分：只有真係觀測到嘅雨（警告生效／即時讀數，記喺 `dayEvents[date].rain`）先會加水、令當日唔流失；預報雨唔再加水、唔會爛根（`waterEvents()` 喺 applyWarningWater／advanceFlow／planNight／settleDay 過濾）；今晚預計「而家」顯示真實水分，未計嘅觀測雨另列；澆水掣超過 100 顯示「水分 105」，啱啱 100 顯示「已滿」（四語）。台灣：推送伺服器 /cwa 每個特報加 overview（概述）、precautions（注意事項）、onset／expires、areas（你縣市內列明嘅區）、mine／started／active，未生效或者唔包你區都照傳（加 W-C0033-002 天氣特報文字做後備）；app 喺警告下面顯示「X日 HH:MM 起／至」、概述、注意事項，同「你區唔喺發布範圍」提示；inactive 嘅特報唔觸發遊戲事件、唔推送。「現在」卡用實測風速同觀測圖示，風暴數值只喺場景。圖示：颱風／強風／烈風用風圖示，雷暴圖示只限真雷暴警告／觀測。跟動物或者拉近時，鏡頭前面嘅葉同樹皮按距離輕微變透明（鳥巢透視照舊）；versionCode 31 |
| 1.4.25 | 鏡頭近距透明加強：拉近時，瞄準點前面嘅葉同樹皮（< 0.72 × 鏡頭距離）變 40% 不透明，到 1.02 倍先回復實心；跟住動物時，動物前面同旁邊（< 1.08 × 距離，1.45 倍回復）嘅葉、樹枝、樹幹、石頭、風車／孵化裝飾、圍欄、灌木等場景物件都變 40%（`addNearFade()` 幫 props 材質加 shader；動物同鳥巢、地面、水保持實心，同動物共用嘅材質會關掉）；`__tree.fadeInfo()` 檢查用；versionCode 32 |
| 1.4.26 | 天氣事件只跟官方：香港／澳門／臺灣（按位置判斷，唔係按資料來源）只計天文台／氣象局／氣象署正式發出嘅警告，攞唔到都唔會改用 Open-Meteo 數字或預報；美國 NWS、加拿大 ECCC、日本 JMA（r8 JSON）、歐洲 MeteoAlarm 經推送伺服器 `GET /alerts`（`push-server/src/official.js`，EMMA_ID 多邊形 `src/geo/meteoalarm-areas.json.gz`）只計正式發出嘅警報；冇官方來源（例如中國內地）先用實測數字（Open-Meteo `past_hours=48` 已過時段＋即時讀數 ×4，`WX_OBS`：大雨 ≥30 mm/h、豪雨 ≥70 mm/h 或 3 小時 ≥100、暴風 平均 ≥63 連續 2 小時或陣風 ≥118、烈風 ≥41／≥88、雷暴要天氣代碼 ≥95）；`eventsForDate` 唔再加預報；天氣卡列官方警報（遊戲類別＋官方原名＋時間＋詳情＋來源）；成就說明同玩法加來源說明；versionCode 33 |
| 1.4.27 | 香港／澳門／臺灣以外嘅推送改跟官方：有官方來源（NWS／ECCC／JMA／MeteoAlarm，經 `official.lookup`）就按正式發出嘅警報推（開始＋升級＋取消，降級／取消要連續 2 次確認，裝置語言，通知寫官方名稱），冇來源嘅地方只按實測數字（Open-Meteo 已過 3 小時＋即時讀數，`intl.js` `observedEventsIntl`），唔再按預報；每 10 分鐘一輪，按 ~0.1° 地區（新 app 傳 `area`，舊 app 用 0.5° `region`）合併查詢、feed 有快取；日本加環境省熱中症警戒アラート（WBGT≥33）／熱中症特別警戒アラート（WBGT≥35）（`wbgt.env.go.jp/alert/dl/` CSV，按府縣予報區＝JMA office 代碼）→ 酷熱，天氣卡顯示四語名稱；玩法說明更新；versionCode 34 |
| 1.4.28 | 純文字：玩法「推送通知」分頁刪走「應急提醒」「防止亂跳」「本機提醒（唔使網絡）」三段（guide.203–211 已刪）；玩法分頁「目標」由「冇完結日：」起改為「生長到打破世界最高紀錄，解鎖第二座空島，種更多的「世界之樹」」（四語）；圖鑑「樹種」卡刪走資料出處連結（ui.286 唔再用 `sp.source`，資料仍留喺 `data/species.ts`）同 species.026 嘅出處括號；versionCode 35 |
| 1.4.29 | 島嶼切換：取消左右滑轉島（同手動轉鏡頭撞），改成成長日誌上面嘅島嶼列（`#isle-bar`，`switchIsle()`；平時半透明，掂到／hover 變實，放手後淡返；未破紀錄第二座顯示 🔒 未解鎖，撳會 toast 解鎖條件）；第一隻雀仔入圖鑑時彈一次生蛋規則（`nest.intro`，用 `NEST_MIN_HEALTH`／`NEST_HATCH_MS`，`meta.nestIntro` 記住）；成就：天氣格只剩名稱、條件、已捱過幾多、下一個成就，「同一場只計一次」同官方來源說明（`wx.badgeSrc`）只喺天氣標題下面講一次；成就描述簡化（四語）；圖鑑／里程碑／成就 zh-HK 改得更口語；versionCode 36 |
| 1.4.30 | 島嶼列改成冇字嘅細橫條（`#isle-bar`，role=slider，兩粒點顯示位置，第二座未解鎖係空心點）：只係喺條橫條度向左掃去第二座、向右掃返第一座（≥24px，場景唔會轉島）；未解鎖掃會彈一彈＋toast；鍵盤 ←／→ 都得；平時半透明，掂住變實，放手 1.6 秒後淡返，成長日誌打開時收埋；只用 aria-label（`isle.aria0/aria1/ariaLocked`）；四語說明改做「喺成長日誌上面條橫條掃」；versionCode 37 |
| 1.4.31 | 新 app ID：Android applicationId／namespace 同 iOS bundle ID 由 `io.github.kahowu24065.treegame` 改做 `app.sekaitree.game`（Java 搬去 `app/sekaitree/game/`）；係另一個 app，要卸舊裝新，存檔用 設定 → 匯出／匯入存檔 搬；`google-services.json` 只有舊 package 嘅 client 時唔套用 google-services plugin（build 照過），`TreePushPlugin.available()` 話 JS 知冇 Firebase，就唔叫 register／unregister（否則會 crash），伺服器推送暫停，本機提醒照常；Apple 已登記 `app.sekaitree.game`（Push＋IAP），舊 bundle ID 已刪；versionCode 38 |
| 1.4.32 | 換新 `google-services.json`（Firebase 專案 sekai-tree 新增咗 Android app `app.sekaitree.game`，舊 package client 都仲喺度）：google-services plugin 自動套用，Android 伺服器推送恢復；推送伺服器唔使改；versionCode 39 |
| 1.4.33 | 開 app 預載畫面（`#preload`，同原生 splash 一樣天藍 #BEE2F7，Android 深色 #142638；icon 拆成背景＋會搖嘅樹苗 `public/preload/*.webp`，加飄落葉）：背後 compile shader（`Scene3D.warmUp`）、解碼當時嘅音樂、等天氣，最多 5 秒，之後先開場；鏡頭彈跳修正：`render()` 唔再直接畫（只叫 `loop()`），dt 0 唔再等於「即刻到位」，只有第一格／`requestSnap()` 先 snap；單一 rAF；廣告／同意／ATT 同其餘音效床延到開場後 1 秒；日間音樂改 `day.m4a`（AAC 單聲道，尾段靜音離線剪走，`day.mp3` 後備），`night.m4a` 做 iOS 舊版後備，唔再 runtime trimSilence，音樂自己載完就播；AudioContext `interrupted` 當 `suspended` 處理，任何點擊／返回前台都會叫醒；隱藏診斷：設定 → 長按版本號；versionCode 40 |
| 1.4.34 | iOS 冇音樂嘅真因：Capacitor iOS `WebViewAssetHandler` 對 media 副檔名（m4a／mp3／wav…）回 plain `URLResponse`（唔係 HTTPURLResponse），`fetch()` 見到 status 0 / ok=false，舊 loader 當失敗（ogg 唔喺 media 名單所以正常）；而家 `fetchBytes` 接受 status 0 而有內容，再唔得就 XHR arraybuffer；其餘 ogg 都有 `.m4a` 後備（iOS 18.4 前冇 Ogg）；預載：新入口 `src/boot.ts` 等預載畫面畫好、CSS 動畫上咗 compositor 先 `import('./main')`，第一次建場景再遲兩格；淡出用 Web Animation `finished`（唔再用固定 timer 硬拆）；淡出前先擺好開場遠景（intro 最少靜止 0.75 秒蓋住淡出）；versionCode 41 |
| 1.4.35 | 成長日誌分頁：`.tabs` 改 flex、按內容闊度分配（`flex: 1 1 auto`），左右 padding `clamp(6px, 2.4vw, 11px)`、字 `clamp(11px, 3.25vw, 13.5px)`，320／360／390 px 四語文字兩邊都有 ≥8 px；英文 Achievements 全部改 Badges（分頁、標題、提示、玩法說明，腳本 `/workspace/.ed/i18n135.py`），其他語言冇改；versionCode 42 |
| 1.4.36 | 存咗嘅文字跟而家語言：成長日誌每行除咗原文，加存訊息 key＋參數（`LogEntry.i18n`，`src/i18n/msg.ts`），顯示時用而家語言重砌；寫入時靠 `t()` 最近輸出追蹤（`traceOf`）攞準 key，舊存檔逐行對四語範本反向配對（`migrateLogI18n`，要砌返一模一樣先算），配唔到就照原文顯示；早晨小結（`morningNote`）、結算水分標籤都跟語言；`labels.001` 拆 個／場 兩條（英文冇量詞）；健康日曆記號識英文；禁止頁面縮放（viewport `maximum-scale=1, user-scalable=no`、body `touch-action: manipulation`、iOS `gesturestart`／`dblclick` preventDefault），UI 唔可以長按揀字／彈 callout（輸入框、存檔碼、診斷文字除外），3D 小島雙指縮放照舊；versionCode 43 |
| 1.4.37 | 法律頁：重寫 `public/privacy.html`／`public/terms.html`（繁體中文書面語＋英文，生效 2026-10-03，按實際行為：位置、推送伺服器資料、天氣 API、本機存檔、AdMob＋UMP＋ATT、RevenueCat 訂閱 HK$8／月、Apple EULA、兒童、刪除資料，聯絡 akar.554426@gmail.com），GitHub Pages 上線；設定底部改為 免責聲明／私隱權政策／使用條款（後兩個直接開網頁，`src/legal.ts`），刪咗 App 內舊私隱簡介（`ui.357`）；ios 分支：冇 RC_IOS_KEY 都顯示完整訂閱頁，撳訂閱／恢復購買會提示「暫時未開放」；versionCode 44 |
| 1.4.38 | 網站搬去 Cloudflare Pages：https://sekai-tree.pages.dev/（project `sekai-tree`），App 內私隱權政策／使用條款連結（設定、訂閱頁，`src/legal.ts`）改用 `https://sekai-tree.pages.dev/privacy`、`/terms`；新增 `scripts/deploy-pages.sh`；gh-pages 照舊部署；versionCode 45 |
| 1.4.39 | 訂閱頁（ios 分支）：兩個並排購買掣「月費」同「永久」（一次性 non-consumable `sekai_tree_lifetime`，同樣解鎖 `premium` entitlement）；價錢全部用商店 priceString（RevenueCat offering 嘅 monthly／lifetime package，lifetime 冇 package 就 `getProducts` 攞），未載入就只顯示「月費」／「永久」，㩒落提示「訂閱暫時未開放」；拎走寫死嘅 HK$8（標題句、條款都改）；條款加「永久係一次性購買、唔會續期」；「冇廣告」下面加同樣樣式嘅「後續更新會加入更多會員福利」（`prem.perkMore`，四語）；main 只係升版本；versionCode 46 |
| 1.4.40 | 訂閱頁（ios 分支）：加「年費」（auto-renew `sekai_tree_yearly`，同月費同一個訂閱群組，解鎖 `premium`）；三個掣 月費／年費／永久 三欄並排（320 px 都放得落，單位 `/月`、`（一次性）` 會成段落第二行）；價錢用 RevenueCat Annual package `$rc_annual`，冇就用 product id 攞；未載入只顯示名，㩒落「訂閱暫時未開放」；條款改成涵蓋月費同年費自動續期（`{per}` 列出兩個價）；恢復購買包晒三樣。main：分頁標題淨係「世界之樹」（刪 `ui.134`，之前會變「世界之樹 · 世界之樹」）；versionCode 47 |
| 1.4.41 | 轉語言即時生效、唔再 reload（`live()` 表格原地重建＋`switchLocale`，重新 render、重開設定；遊戲狀態、3D、聲音照行）；澆水後 5 分鐘（遊戲時鐘）水分唔減（`state.pause.w`，`CARE_GRACE_MS`，閂 app 補算都計）— 原因係 `waterAdd` 四捨五入到 0.1，W 成日落喺 x.5，顯示進位後一秒就跌 1；施肥冇呢個問題（+25 唔捨入），所以 N 冇寬限；圖鑑只會解鎖當刻出現緊嘅動物（`outAt`：日頭日行性、夜晚夜行性），新增夜間第一隻動物「斜紋夜蛾」（`nightmoth`，同菜粉蝶同級）；versionCode 48 |
| 1.4.42 | 修 iPhone「澆水／施肥／除蟲／疏水之後閂 app 再開就冇咗」：原生 Preferences 鏡像係 fire-and-forget 排隊寫，iOS 一入背景就暫停 JS，未寫完就被殺；下次開 app `planHydrate` 一律用 Preferences（舊）覆蓋 localStorage（新）。而家有寫入印 `sekai-tree-stamp`，邊個新用邊個；鏡像合併只寫最新值、印最後寫；背景（visibilitychange／App pause／pagehide）即刻 `saveNow()`＋flush。1.4.41 澆水寬限冇關係（只改流失速率，唔掂次數）；versionCode 49 |
| 1.4.43 | 診斷版（用戶確認 1.4.42 喺 iPhone iOS 18.7 仍然甩動作，網頁正常）：設定版本行長按 → Diagnostics 加「存檔／讀檔紀錄」（`src/native/saveLog.ts`，最近 60 條，localStorage `diag-savelog` + 原生 Preferences 雙份，合併，殺 app 都留低）。記錄：每次存檔（觸發來源、stamp、W/N/H/R、四個動作剩餘次數、care 計數、寬限時間、原生寫入每 key 成功／失敗＋延遲）、開 app 時兩份副本嘅 stamp 同數值＋揀邊份＋原因、之後 catch-up／advanceFlow／天氣（時區）／首個 tick 嘅數值（care 有變會標 CARE CHANGED）、生命周期（appStateChange、App pause/resume、visibilitychange、pagehide、freeze）、flush 開始／完成。「清除紀錄」掣。無改遊戲邏輯；versionCode 50 |
| 1.4.44 | 真正修好 iPhone「做完動作閂 app 再開就冇咗」：1.1 起嘅原生鏡像用 `localStorage.setItem = …` 包裝，WebKit（WKWebView）入面咁樣賦值只會儲存一個叫 "setItem" 嘅項目、唔會覆蓋方法，所以 iPhone 存檔從來冇寫入 Preferences、stamp 從未設定，開 app 時舊嘅 Preferences 副本（第一次開 app 時複製）每次都覆蓋 localStorage（1.4.43 診斷紀錄證實）。而家所有遊戲寫入經 `kvSet`／`kvRemove`（`src/native/kv.ts`）→ localStorage → 鏡像（合併、重試、stamp 最後）；開 app 只有 Preferences stamp 嚴格較新或者 localStorage 冇存檔先用 Preferences，其餘（包括兩邊都冇 stamp）保留 localStorage 並複製去 Preferences；啟動時鏡像測試寫入（診斷紀錄 `mirror ok/FAILED`）；清走殘留 "setItem"/"removeItem" 項目；appStateChange inactive 都即刻存檔＋flush；versionCode 51 |
| 1.4.45 | 權限提示延後：新玩家揀樹種、改名、完成澆水＋施肥教學（`coach.done`，跳過都算）之後先問，次序係位置 → 推送／提醒（`src/native/permGate.ts`、`askPermissionsInOrder()`；之前只用已批准嘅權限，唔彈提示）；舊玩家（已種樹、教學完成或者冇教學）即刻放行。網頁版同樣。開場／種樹鏡頭：拉近同退後改為 ease-in-out 時間線（冇咗指數 ease-out 一開始全速衝向樹、冇咗 0.05／0.98 門檻跳格），鏡頭距離用彈簧，相機時鐘每格上限 0.1 s、卡頓損失嘅時間慢慢追返（`src/three/camEase.ts`）。動物出現聲：刺耳嘅係 `chirp.wav`（約 3 kHz 方波似嘅哨聲，滿音量，昆蟲／蝴蝶／飛蛾／螢火蟲／蝙蝠出現時播）；而家雀鳥用柔和鳥叫 `call.ogg/m4a`（晨鳥錄音 1.6 s 片段），青蛙聲細聲咗，其他動物無聲；刪咗 `chirp.wav`、`bird.wav`；versionCode 52 |
| 1.4.46 | 碳吸收量顯示：`carbonKg()` 唔再四捨五入（之前 18 cm 銀杏 0.026 kg → 「約 0 公斤」）；`carbonParts()`／`formatCarbon()`：1 kg 以下用整數克（最少 1 克，例如「約 26 克 CO₂／年」），1 kg 起用公斤一個小數；樹木狀態卡、照顧頁、紀錄頁、分享卡四處都用（`carbon.g`／`carbon.kg`，範本冇咗單位）。真實樹齡：365 日起顯示「X 年 Y 日」（Y=0 →「X 年」），英文精簡「132D」／「1Y」／「1Y 32D」（`age.*`、`formatRealAge()`）；英文狀態卡碳一行改「about 26 g CO₂/yr」。320 px 闊螢幕上狀態卡（130 px 文字欄）實測唔會多換行；versionCode 53 |
| 1.4.47 | 英文樹齡單複數：「Tree age 1 days」→「1 day」（`ui.113`、`ui.298`、`ui.317`、`ui.332`、`main.017` 用 `{n, plural, one {# day} other {# days}}`，同 `ui.073` 一樣）。其他英文「N nights／days／hours」都係固定常數（≥ 3），唔使改；測試會擋住新嘅變數 + days／years 冇複數；versionCode 54 |
| 1.4.48 | 天氣地點分組預設：保留「用我所在位置」大掣，下面分「香港／澳門／台灣」三組（每組細標題 + 兩欄）：香港（香港島，香港公園站）、九龍、新界、離島；澳門半島、氹仔、路環；台北、台中、台南、台東。`src/presets.ts`：每個預設帶 `region`（hk／mo／tw）同 HK 嘅天文台雨量分區（`rainDistrict`，中文）；`weatherRegion()` 決定用天文台／氣象局／氣象署（預設跟自己 region，GPS 跟座標，冇位置＝香港），天氣、警告、標籤地區同推送 isHK／isMO／isTW（台灣縣市）全部跟佢（`pushRegionFlags()`）。舊預設一次性搬：中環→香港，沙田／大埔／西貢／元朗→新界，東涌→離島；hk、geo、空白照舊。對話框文字講明各地來源。推送伺服器唔使改；versionCode 55 |
| 1.4.49 | 「世界之樹會員」改名「世界之樹 Premium」（英文 World Tree Premium、簡體 世界之树 Premium）：私隱權政策／使用條款（main）；ios 分支：訂閱頁、設定、恢復購買等四語字串全部改，設定頁最頂加 Premium 卡（`premiumCard()`，同設定卡同闊同圓角，淡綠→淡金漸變邊、皇冠葉 icon、「移除廣告・支持開發」＋「查看方案」，成張卡撳得，開現有訂閱頁；已係會員就顯示精簡「你已經係 世界之樹 Premium 會員 ✓」）；versionCode 56 |
| 1.4.50 | **唔再用 Open-Meteo 免費 API**（非商用條款）：香港／澳門／台灣只用天文台／氣象局／氣象署（之前淨係攞 Open-Meteo 日出日落，而家 `src/sun.ts` 本機計，NOAA 公式）；其他地方改用 MET Norway Locationforecast 2.0（CC BY 4.0／NLOD），**一定經推送伺服器** `GET /forecast?lat&lon&tz`（`push-server/src/metno.js`：User-Agent `SekaiTree/<ver> https://sekai-tree.pages.dev akar.554426@gmail.com`、坐標 2 位小數做快取格、跟 Expires／If-Modified-Since、輸出 Open-Meteo 同樣嘅 JSON 形狀所以 `parseOpenMeteo` 照用；冇陣風時用平均風 ×1.4；過去鐘數／14 日平均由伺服器記低經過咗嘅預報鐘數 `DATA/metno-hist.json`，新格開頭冇 normals）；推送伺服器實測推送都改用 `met.observed()`。provider `open-meteo` → `met-no`。設定法律連結加「資料來源及授權」（`src/credits.ts`，四語 `credits.*`：各資料來源授權＋連結、CC0 音效、開源授權、不代表認可聲明）；免責聲明、私隱政策改寫 MET Norway；versionCode 57 |
| 1.4.51 | **日本天氣用氣象廳**：推送伺服器 `/forecast` 喺日本（GSI 市町村 → area.json office）加 `src/jmawx.js` overlay：最近 AMeDAS 站（≤40 km，有氣溫同風）嘅即時氣溫、濕度、10 分鐘雨量（×1.5 當 15 分鐘）、風、陣風，同過去 24 小時逐小時實測（3 小時 point 檔，舊檔快取 6 小時）；`bosai/forecast/<office>.json` 嘅每日天氣代碼（JMA→WMO）、最高／最低、降雨概率；逐小時預報、每日雨量、風預報、日出日落照用 MET Norway；任何 JMA 失敗都留返 MET Norway。body `source: 'JMA + MET Norway'` → app `model: 'jma'`，天氣來源顯示「氣象廳 + MET Norway」。免責聲明重寫（四語：只係遊戲、唔係官方、資料可能延遲、安全、冇認可、責任限制）；私隱政策重寫成四語（`scripts/legal-src.py` → `node scripts/build-legal.mjs` 生成 `public/privacy.html`、新 `public/support.html`；zh-TW／zh-CN 用 OpenCC）；Akar · Apps 站（`/workspace/dev-site`，`node build-sekai-tree.mjs`）新增 `/sekai-tree/privacy`、`/sekai-tree/support`；versionCode 58 |
| 1.4.52 | **生蛋說明＋互動**（PR #1，Cursor cloud agent）：生蛋 toast 講原因同時間（`nest.lay`）；孵蛋倒數卡加第二行獎勵（`nestRewardFor`／`nestRewardText`：建築 > 生長約三成 > 徽章 > 冇），成張卡撳得開生蛋說明；第一次生蛋彈一次說明（`meta.firstEggIntro`，`firstEggDecision`，已孵過蛋嘅舊玩家靜默跳過）；3D 撳蛋：蛋搖＋WebAudio 合成「咯咯」（冇音效檔）＋彈窗（即時倒數、獎勵、保暖掣）；保暖：每粒蛋一次 −1 小時（`NestEgg.warmed`、`NEST_WARM_MS`、`eggHatchAt` 單一來源，剩 ≤1 小時唔准；結算、通知、倒數都用佢）；孵化動畫（`src/three/eggFx3d.ts` `HatchFx`）；大雨／烈風／颱風時雀仔伏喺蛋上（純視覺）；孵蛋建築要等「破土而出」先見到（`NestState.revealedBuilds`／`revealBirds`，`pendingNestReveals`／`markNestRevealed`；舊存檔載入時當全部已播）：開 app／返前台／結算後，鏡頭跟雛鳥飛去建築位，裂地＋塵土＋建築升起，停 0.6 秒再返原本視角；撳畫面跳過；reducedMotion／2D 直接顯示。測試 `test/v1452.test.ts`；versionCode 59 |
| 1.4.53 | 撳孵蛋倒數卡改為開蛋彈窗（倒數、獎勵、保暖掣；`eggPopupAvailable`），生蛋規則喺彈窗入面「點解會生蛋」掣；ios 分支 Info.plist＋四語 InfoPlist.strings 加 `NSLocationAlwaysAndWhenInUseUsageDescription`（修 ITMS-90683，app 唔會要求「永遠」權限）。測試 `test/v1453.test.ts`；versionCode 60 |
| 1.4.54 | **冇登入嘅雲端存檔**：iOS 用 iCloud 鍵值儲存（`src/native/cloud.ts` + ios 分支 `CloudKVPlugin.swift`／`MainViewController`，key `sekai-tree-cloud-v1`，所有存檔 key（除咗 stamp、push token、權限閘、dev、probe）deflate 後一個值，遠低於 1 MB）：開 app 時冇本機存檔或者（已連結）iCloud stamp 較新就自動還原；未連結（新裝／第一次）而兩邊都有種咗嘅樹就問玩家；本機較新唔會被覆蓋；寫入節流 10 秒＋入背景即上載；iCloud 較新就唔上載、改為問。Android：Auto Backup 只備份 `CapacitorStorage.xml`（`res/xml/backup_rules.xml`、`data_extraction_rules.xml`），重裝後 `planHydrate` 由 Preferences 還原。設定「存檔」改為「備份存檔」（每次都先顯示平台說明：iOS iCloud／Android Google／網頁冇備份，再顯示同複製存檔碼）＋「用存檔碼還原」；zh-CN 存盘→存档。診斷頁顯示 iCloud 狀態。私隱政策（`scripts/legal-src.py`）同支援 FAQ 加 iCloud／Google 備份。ios.yml：export 前用 ASC API 確保 App ID 有 iCloud（`ios/ci/asc_icloud.rb`），archive 前將 entitlements 嘅 `$(TeamIdentifierPrefix)` 換成 team ID。測試 `test/v1454.test.ts`；versionCode 61 |
| 1.4.55 | **高度單位**：中文一律用 厘米／米（未夠 1 米用厘米），唔再用 公尺／公分（zh-TW 表全部改咗）；設定加「高度單位」厘米／米（預設）或 英寸／英尺（zh-TW 英吋／英呎，en in / ft，例如 5 ft 3 in），key `sekai-tree-height-unit`，即時生效（`switchLocale(getLocale())` 重建 live 表再 render）。做法：所有表字串都寫 `<數字> 厘米／米`（`cm／m`），`t()` 喺 `src/i18n/index.ts` `convertLengths()` 一次過轉（公制：≥100 厘米變米；英制：<1 呎用吋、之後呎＋吋、≥100 呎淨係呎、範圍 `5–10 厘米` 一齊轉），毫米、公里、溫度唔郁；數字後面加 U+2060 就保留原文（「取最接近嘅 10 米」呢類以米講嘅規則）。`formatHeight` 英制時傳 2 位小數米。備份存檔三個彈窗按鈕：`.btn-stack`（行距 16px）／`.btn-row`（平均分、間距 12px），按鈕最少 44px。成就分頁標題「成就收藏」→「天氣成就收藏」。巢入面嘅雛鳥：眼（白點反光）、翼、頭頂毛、大橙嘴（下嘴會開），全部掛喺 `chick` part 下面（setClutch／hatchHide 照用），閒時郁頭、擰頭、張嘴等餵；撳佢會叫（bird call clip）＋toast `chickTapLine()`：下一次結算係裝飾夜（第 1、每第 10 隻）就話「今晚 12 點會飛去島上」（雛鳥帶路飛去島上揭幕），其他夜晚話「今晚 12 點會離巢」。測試 `test/v1455.test.ts`；versionCode 62 |
| 1.4.56 | **鳥巢一定坐喺真樹枝上**：之前各樹種自己估 `c.nest`（有時喺樹枝中軸、斷頂時淨係壓低 y、細樹冇 nest 就喺 `animals3d` 用 樹幹旁邊 58% 高 嘅後備位，會浮喺半空）。而家 `Ctx.limb()` 記低每段樹枝，`pickNestPerch()`（`src/three/tree3d.ts`）喺樹種畫好之後揀：樹枝同樹幹交界優先、其次夠粗嘅樹枝段，高度 30–85%（斷頂就喺斷口以下）、鏡頭嗰邊優先，放喺樹皮面上、避開樹幹；冇合適樹枝：小樹（stage ≤ 1）放樹幹頂，大樹（例如冇畫樹枝嘅針葉樹）貼住樹幹 55% 高。**唔會為咗鳥巢加樹枝**，樹形完全唔變；鳥巢模型底加兩條細枝（屬於鳥巢）。每次重建棵樹都重新揀，所以跟住長高／重生／斷頂；鵲鴝自己個巢唔再向上抬。孵化／揭幕鏡頭照用 `nestPoint()`（即新位置）。測試 `test/v1456.test.ts`（9 個樹種 × 4 個高度 × 有冇斷頂，鳥巢落下去/貼住樹幹嘅距離）；versionCode 63 |
| 1.4.57 | **撳鳥巢 → 鏡頭飛去鳥巢近鏡**：`Scene3D.focusNest()` 用返跟動物嘅 follow cam（`followRef = NEST_FOCUS`，`Animals3D.focusRef()` 對 `NEST_FOCUS` 回傳鳥巢喺樹枝上嘅世界位置／大細，由樹冠外望返入嚟，樹冠照 nest peek 變透），「返回全景」（`resetView`）返去全景；鳥巢清空咗就自動返全景。撳蛋：照舊開蛋嘅彈窗／保暖，同時飛去近鏡。撳雛鳥：遠鏡第一下只係飛埋去，已經近鏡（跟緊鳥巢或者鏡頭已經喺鳥巢 7 倍大細以內）先至啾一聲＋彈字。**天氣地點揀選**：地區標題（香港／澳門／臺灣…）之前俾 `.modal-card p` 嘅 margin 蓋過，黐住上一組；而家 `.modal-card p.places-head` 上面 23px、下面 10px（「用我所在位置」之後都係 23px）。測試 `test/v1457.test.ts`；versionCode 64 |
| 1.4.58 | **第一日導覽**：新存檔種第一棵樹先會彈 4 頁可略過嘅導覽（淋水 → 施肥 → 睇天氣卡 → 健康 90+ 雀仔可能生蛋）；`Coach.tour`，1.4.58 之前存低嘅 coach 一律當睇過，另外要 `meta.history`／`milestones` 空同 `daysCared ≤ 1`；設定同玩法指南「再睇一次導覽」（`tour-replay`）。**撳風景**：石頭／矮樹叢／花／島上建築（風車、銅像、屋仔、涼亭）／養分地標，撳中會郁一郁（花彈一彈、建築晃一晃）＋閃粉＋一句說明（建築講返係第幾粒蛋孵出嚟起嘅）；`Scene3D.tapScenery()` 用已知位置計，唔會每格 raycast；`src/scenery.ts`。**英制**：`\u2060` 保護嘅規則數字（10 米等）而家都準確換算（32.8 ft）；淨係雨量 毫米／mm 保留。**彈窗間距標準**：按鈕最少 44px、上下 14px、同行 12px，`h3` 上 22 下 10。**MeteoAlarm 條款**：保留（CC BY 4.0 同等條款容許商業用途）；每個警報顯示發出時間＋發出機構、連結 meteoalarm.org、原文免責聲明；伺服器 feed 快取 2 分鐘、/alerts 2 分鐘，App 喺歐洲開住每 5 分鐘刷新警報（條款：延遲平均 < 5 分鐘、最多 10 分鐘）。推送伺服器已部署（備份 `app.bak-20261008-1355`）。測試 `test/v1458.test.ts`；versionCode 65 |
| 1.4.59 | **每日小目標**（`src/goals.ts`，`GameState.goals`）：每日 3 個：淋兩次水（泥土飽和當完成）＋施肥一次＋第三個（有蟲 → 除蟲；寒冷 → 保暖；否則按日期輪：打開天氣概況／撳島上風景）；同 care 一樣喺當地午夜換日；全部完成自動 養分 +3（一日一次，記入成長日誌），卡仔喺成長日誌頂（`goalsCardHtml`）。**分享樹卡**（`src/shareCard.ts`）：樹木狀態頂「分享樹卡」→ `Scene3D.captureView()` 用卡片比例即場再 render 一次 → 1080×1350 卡（樹名、品種、樹齡、樹高（跟單位）、最多 3 項捱過嘅天氣、App 名＋icon；冇地點／帳戶）→ App：`@capacitor/filesystem` 寫 Cache PNG + `Share.share({ files })`；網頁：下載 PNG。新 plugin `@capacitor/filesystem` 7（Android `cap sync` 已加；iOS CI `cap sync ios` 會自動加 pod）。**天氣畫面**（`src/three/weatherFx3d.ts`）：雨絲密度跟實際雨量（mm）、黑雨 1.0＋更暗天空、大雨雨絲更長更快；地面濕咗變深色反光（乾得慢）＋地上水花；雷暴警告（`DayCond.thunder`）都有閃電；烈風／颱風陣風吹落葉；霧／煙霞（WMO 45）霧近啲＋低霧；寒冷：冷色光、地面結霜色、低霧；晴天柔和光束（用返酷熱嗰套，強度 40%）。減少動態：只保留靜態部分（顏色、濕地、霧）。測試 `test/v1459.test.ts`；versionCode 66 |
| 1.4.60 | **天氣預告推送**（push-server `src/headsup.js`）：預報聽日／今日稍後可能打風、暴雨、酷熱、寒冷就提早推一次（例：「聽日可能打風，記得加固」）。來源：香港天文台九天預報（`fnd`）、澳門 SMG 7 日預報、臺灣 CWA 縣市一週預報、NWS/ECCC/JMA/MeteoAlarm 已發出但未生效（onset ≤ 36 h）嘅官方警報；其他地方 MET Norway 預報（只作預告，通知註明）。遊戲事件／損傷／成就照舊只跟官方生效警告。每個 token 每個 `類別|日期` 最多一次（`alerts.headsup`，3 日後清走）；裝置本地 22:00–08:00 唔發；該類警告已生效唔發。App：設定 → 天氣預告（`src/headsUp.ts`，`sekai-tree-headsup`，預設開），`/state` 帶 `headsUp: true` 先會收（舊版 app 收唔到）。MeteoAlarm：app 歐洲警告刷新 4 分鐘（`MA_REFRESH_MS`），伺服器 `/alerts` MeteoAlarm 答案快取 2 分鐘＋`no-cache`（修正 1.4.58 錯改咗 CWA 快取）。測試 `test/v1460.test.ts`、`push-server/test/headsup.test.js`。 | 67 |
| 1.4.61 | **提示改喺彈窗上面**：`#toast` 搬出 `.hud`（層級 2），改 `position: fixed; z-index: 70`，高過抽屜（7）、廣告（8）、所有 modal（10）同開發面板（61）。複製存檔碼、分享樹卡、診斷複製都係同一個 toast，開住彈窗都睇到。動物到訪提示留喺場景層（可撳嘅世界提示，唔係確認）。測試 `test/v1461.test.ts`。 | 68 |
| 1.4.62 | **iOS 追蹤權限改喺啟動時問**（修 App Review 2.1，1.4.51 build 137）：`requestAttAtLaunch` 喺載入遊戲之前、預載畫面暫時收起之後先問 App Tracking Transparency，只喺狀態係 notDetermined 問一次。Google UMP 同意表仍然喺新手教學完、橫額廣告之前。`NSUserTrackingUsageDescription` 冇改。測試 `test/att.test.ts`、ios `test/att-launch.test.ts`。 | 69 |
| 1.4.63 | **左右視角可以轉足圈**：一指左右拖嘅 yaw 唔再夾死（以前總覽 ±0.6 rad ≈ ±34°、放大 ±π）；而家 360° 自由轉。上下（pitch）限制照舊，避免鑽地／衝天。跟拍雀仔、返回全景、雙指縮放、成長日誌島嶼橫掃都冇動。`clampOrbitDrag`／`test/v1463.test.ts`。**成長日誌左上角加分享樹卡掣**（鏡像右邊設定齒輪，同一 `share-card` 行為）。 | 70 |
| 1.4.64 | **每日目標獎勵改去最低嗰項**：完成今日目標後，補當日最低嘅水分／養分／抗風（+3）；三項都喺健康範圍就改 +2「解鎖長駐動物種類」分數（0–100，進度條「已額外解鎖 X 種」，每 10 分解鎖一種非雀長駐圖鑑）。目標按棵樹＋日期隨機、只抽畫面做得到嘅（有蟲先有除蟲、寒冷先有保暖），1–3 個。分享樹卡寫上今日目標。幼樹訪客權重偏向昆蟲／兩棲／爬蟲（減雀），加豆娘／草蜢／牛蛙。另含 1.4.63：自由 yaw、成長日誌左上分享掣。 | 71 |
| 1.4.67 | 74 | Native MP4 小樹成長片段; calendar healthy/unhealthy dots; tour-replay tips; post-tour weather dedupe; locked hint below Generate |
| 1.4.66 | 73 | Campfire ring; share 今日小事; vignette props; lighter settings; log photos; share goal+streak; post-tour tip; 小樹成長片段 (青年樹 unlock, Settings Generate, ≥1 card; webm/strip) |
| 1.4.65 | **分享樹卡體驗**：成長日誌左上掣顯示「分享樹卡」文字、同設定齒輪上移；撳完先白光快門＋卡片縮入預覽，確認「分享」先開系統分享／下載，可取消。里程碑分頁入面嗰個分享掣刪走。動物圖鑑繼續列出全部物種（含 1.4.64 豆娘／草蜢／牛蛙 ＋ 本版蟋蟀／石龍子）未解鎖顯示剪影；幼樹訪客權重仍偏非雀。 | 72 |

Android versionCode：1.3 = 5、1.3.1 = 6、1.4 = 7、1.4.1 = 8（`android/app/build.gradle`）。下次升版記得兩個都改。

---

## 3. 指令

需要 Node 22+。第一次：`npm install`。

```bash
npm run dev        # http://127.0.0.1:4327（vite.config.ts 設定，strictPort）
npm test           # Vitest（而家 264 個測試）
npm run build      # tsc + vite build → dist/（有開發者面板；網站同 debug APK 用）
npm run build:app  # 同上但 VITE_DEV_PANEL=0（release app 用）
npm run assets     # 由 app-assets/ 產生全部 icon／splash／favicon
```

開發者 hooks：dev build 有 `window.__tree`（grow、setStat、collapse、dying…），Playwright 腳本用佢。

### Android
前置：JDK 17 或 21、Android SDK（platforms;android-35、build-tools 35），`ANDROID_HOME` 或者 `android/local.properties` 寫 `sdk.dir=...`。

```bash
# Debug（可以側載，有開發者面板）
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug        # → app/build/outputs/apk/debug/app-debug.apk

# Release（簽名，冇開發者面板）
npm run build:app && npx cap sync android
cd android && ./gradlew clean assembleRelease bundleRelease
# → app/build/outputs/apk/release/app-release.apk、bundle/release/app-release.aab
```
Windows 用 `gradlew.bat`。亦可以喺 Android Studio 開 `android/`，Build → Generate Signed Bundle / APK，或者直接揀 release variant。

### 簽名金鑰（千祈唔好 commit）
- 用戶有備份 `sekai-tree-release-key-backup.zip`（入面有 `.jks` 同 `keystore.properties`）。
- 解壓去 repo 以外嘅位置，將 `keystore.properties` 放喺 `android/keystore.properties`（或者設環境變數 `SEKAI_KEYSTORE_PROPERTIES` 指住佢），入面 `storeFile` 改做 `.jks` 喺你部機嘅絕對路徑。欄位：`storeFile`、`storePassword`、`keyAlias`、`keyPassword`。
- `.gitignore` 已經忽略 `*.jks`、`*.keystore`、`keystore.properties`；commit 前 `git status` 睇清楚。
- 冇呢個檔 release build 會變成未簽名。之後所有更新都要用同一條 key 簽（證書 SHA-256 開頭 `3d0e974b`、結尾 `86e3`），唔係就裝唔到落舊版上面。
- 核對：`apksigner verify --print-certs app-release.apk`、`aapt dump badging app-release.apk`（睇 versionCode）。

---

## 4. 網站（Cloudflare Pages；gh-pages 只係轉址）

- 主網址：**https://sekai-tree.pages.dev/**（Cloudflare Pages project `sekai-tree`，direct upload；私隱權政策 `/privacy`、使用條款 `/terms`，`.html` 會 308 轉去冇副檔名嘅網址）。App 內連結喺 `src/legal.ts`。
- 每次發佈**只**部署 Cloudflare Pages：`npm run build`（有開發者面板，網站一直係咁）之後跑 `scripts/deploy-pages.sh`（要 env `CLOUDFLARE_API_TOKEN`，唔好印出嚟；account ID 由 token 自動查；wrangler 4 要 Node ≥22，box 上喺 `/workspace/tools/node-v22.20.0-linux-x64`、`/workspace/tools/wrangler`）。
- **唔好再 deploy `dist/` 去 gh-pages。** 2026-10-03 起 `gh-pages` 只放轉址頁（源檔 `site-redirect/`）：`index.html` → `https://sekai-tree.pages.dev/`，`privacy.html` → `/privacy`，`terms.html` → `/terms`（JS `location.replace` 保留 query／hash＋meta refresh＋canonical），`404.html` 將 `/tree-game/<路徑>` 轉去新站同一路徑；**一定要保留 `.nojekyll`**。GitHub Pages 設定同 repo 唔好刪。
- 要改轉址頁先至改 `site-redirect/` 再手動放上 gh-pages（worktree，清走舊檔保留 `.git`／`.nojekyll`，唔好 force push）。
- 推送伺服器 CORS 係 `*`，pages.dev 唔使改。
- 用戶冇叫就唔好 deploy 網站。

---

## 5. 推送伺服器（push-server/）

### 架構
- App（native）註冊 FCM token → `POST /register`；狀態 `POST /state`（今日做咗邊啲行動、地區格仔 0.5°、isHK、rUnlocked、tree 狀態、抗風力）；關通知 → `/unregister`。`GET /health` 睇狀態。
- App 入面嘅網址：`src/native/push.ts` 的 `PUSH_SERVER = 'https://158-101-140-210.sslip.io'`。
- Server 每 150 秒輪詢 HKO warnsum；外地裝置按 0.5° 格仔每 20 分鐘查 Open-Meteo（規則喺 `push-server/src/intl.js`，同遊戲 TS 由 parity test 對住）。
- 狀態檔：`/var/lib/tree-push/tokens.json`（裝置）、`alerts.json`（上次等級、提醒）。重啟後第一次只記錄唔推。
- 詳細 API／環境變數：`push-server/README.md`。測試：`cd push-server && npm test`。

### 推送規則（v1.4 起）
- 新警告／升級：推俾所有人，除咗今日已經做咗對應行動嘅裝置。枯死／瀕死都照推，加一句樹況；抗風力低過倒塌門檻加一句倒塌風險。
- 青年樹之前嘅風球／山泥傾瀉：一定推，但只係現實安全提示（遠離窗邊、留意最新消息），冇加固、冇提醒。
- 約 2 小時後提醒一次：行動仲未做、做得到先提。
- 降級／取消（紅雨轉黃雨、八號轉三號、酷熱取消…）：一定推（資訊）。外地要連續兩次較低讀數（約 40 分鐘）先推，防亂跳。
- 香港類別：酷熱、寒冷、黃／紅／黑雨、風球 1/3/8+、山泥傾瀉（WL）。雷暴警告唔推。
- 臺灣（1.4.14）：app 送 `isTW`＋縣市／鄉鎮，server 每 5 分鐘查中央氣象署警特報，跟外地規則，通知用氣象署名稱。CWA key 喺 VM `/etc/tree-push/cwa.env`（600，唔好 commit、唔好放入網站）。對照表見 `push-server/README.md`。大雷雨即時訊息（1.4.15）唔喺 CWA REST API，係讀 NCDR 民生示警平台公開「生效中示警」Atom feed（`RssAtomFeeds.ashx`，免 key）入面中央氣象署嘅雷雨 CAP。

### Oracle VM
- `ubuntu@158.101.140.210`（Ubuntu 22.04 arm64），SSH key 由用戶自己保管（唔喺 repo）。
- systemd service `tree-push`（用戶 `treepush`），聽 `127.0.0.1:8091`，自帶 Node：`/opt/tree-push/node`。
- 程式：`/opt/tree-push/app`；資料：`/var/lib/tree-push`；Firebase service account：`/etc/tree-push/service-account.json`（600，唔好 copy 出嚟、唔好 commit）。
- nginx site `tree-push` 反向代理＋certbot 證書，網域 `https://158-101-140-210.sslip.io`。
- 測試推送：`sudo tree-push-test "標題" "內容"`。
- 日誌：`sudo journalctl -u tree-push -n 50 --no-pager`。

### 部署步驟（先備份！）
```bash
# 1. 喺 VM 備份
ssh ubuntu@158.101.140.210 'D=$(date +%Y%m%d-%H%M); sudo cp -a /opt/tree-push/app /opt/tree-push/app.bak-$D && sudo cp -a /var/lib/tree-push /var/lib/tree-push.bak-$D'
# 2. 上傳原始碼（唔好帶 node_modules / data）
rsync -az --delete --exclude node_modules --exclude data push-server/ ubuntu@158.101.140.210:tree-push-server/
# 3. 安裝＋重啟（PROXY=none：唔郁 nginx）
ssh ubuntu@158.101.140.210 'cd ~/tree-push-server && sudo PROXY=none bash deploy/install.sh'
# 4. 檢查
curl https://158-101-140-210.sslip.io/health     # 要見到 fcm:true、devices 冇少
```
Windows 冇 rsync 可以用 `scp -r`（記得唔好上傳 node_modules）或者 WSL。

> ⚠️ **同一部 VM 仲行緊用戶嘅澳門巴士 app，絕對唔好郁：** nginx site `macaubus`、`/home/ubuntu/macau-bus`、pm2 apps `macau-bus-api` 同 `otp-server`。唔好 `pm2 restart all`、唔好改 nginx 預設設定、唔好重裝 nginx。部署後確認 `https://macaubus-kat1.duckdns.org` 仍然 200。

---

## 6. Firebase

- 項目 `sekai-tree`，**Spark（免費）方案**，只用 Cloud Messaging。
- `android/app/google-services.json` 已經喺 repo（client 設定，唔係秘密）。
- Server 用嘅 service account key 只喺 VM `/etc/tree-push/service-account.json`；要新 key 去 Firebase console → 專案設定 → 服務帳戶產生，直接放上 VM，唔好入 repo。

---

## 7. 已知問題／待辦

- **開發者手動天氣時，天氣概況頁仍然顯示真實天文台警告**（遊戲天氣係手動，警告列表係真）。
- **玩法 → 推送通知 入面嘅時間係寫死**（約 2.5 分鐘、20 分鐘、2 小時、約 40 分鐘），server 改設定要同步改 `src/guide.ts`。
- **多語言未覆蓋**：臺灣 CWA 自由文字仍係中文（zh-CN 轉簡體）；天文台即時讀數站名／地區名用 tc 再經 tName；反向地理編碼地區名照返回；舊存檔紀錄同 morningNote 保留原語言；開發者面板未翻譯；未知天文台警告類別用原始名；未認得嘅 SMG／CWA 警告名照原文。zh-TW／zh-CN 係機器轉換加人手修，en 版面可能有按鈕爆位。
- **`package.json` version 仲係 1.0.0**；真正版本睇 `android/app/build.gradle`。
- **Oracle 免費 VM 可能因閒置被回收**（Always Free 低用量會被 reclaim）；考慮升 PAYG（仍然用免費額度）或者定期檢查 `/health`。
- 一啲舊 `scripts/*-shots.mjs` 用舊 selector（例如 `data-open="forecast"`），只作參考；新版用 `scripts/v141-check.mjs`（需要先 build＋preview，設 `BASE_URL`，Chrome 路徑用 `CHROME` 環境變數）。

---

## 8. 用戶習慣

- 用戶講「**分析**」＝只分析、報告，**唔好改 code**。
- 用戶用廣東話口語寫；遊戲 UI 用繁體中文（廣東話口語）。
- **慳 quota**：測試保持基本（現有測試＋少量針對性測試），截圖越少越好（通常最後一張／一張 contact sheet）。
- Git：正常 commit＋push `main`；**唔好 force push**；冇叫就唔好 deploy 網站（Cloudflare Pages），gh-pages 只放轉址頁、唔好再覆蓋；唔好 commit 任何金鑰、密碼、service account。
- 報告要簡短：改咗咩、檔案路徑、有咩問題。


## 1.4.17 漸變模型（src/sim.ts）
- `GameState.flow`（DayFlow）記今日已經行咗幾耐（elapsed）、開始值同累計變化。`advanceFlow()` 由 main.ts 每秒（同 resume / catch-up 後）叫，每 15 分鐘（FLOW_STEP_MS）一段：W −10/日（一級徽章 ×0.9，落雨日 0）、N −10/日 + 長駐、R −2/日（青年樹後）、H += (wTier(W)+nFactor(N)−蟲害) × 段長/日。
- 晚上 `settleDay()` 先補足當日剩低嘅時間到 24 小時，再計天氣／應急獎勵／風（用今日開始時嘅 R）／生長／倒塌，`Settlement.day` = 全日淨變化，morningNote「昨日總結：…」顯示做「每日總結」卡。
- 舊存檔冇 flow：由今日零時補返；新種嘅樹由種嗰刻開始。`previewNight` 只模擬今日剩餘時間。
- `healthZeroInMs()` 估健康幾時跌到 0（唔計天氣），通知 healthLow（107）提早 3 小時。

### 1.4.18 修正
- 健康唔再 drift。`planNight` 用 drift 完一日之後嘅 W/N：`wTier(wAfter).score + nFactor(nAfter) − 蟲害 + 天氣 + 應急獎勵`，同 ≤1.4.16 一晚結算完全一樣；`settleDay` 先 `completeFlowDay` 補足 24 小時 drift 再計。
- `storage.ts`：舊 flow 有 hw/hn/hp/over（1.4.17）就將當日已加減嘅健康還原，刪走嗰啲欄位（同 hRate）。
- 通知 healthLow（107）：`previewNight(...).hAfter <= 0` 或者根部浸死，就喺半夜前 3 小時提。

### 1.4.19 發佈（2026-10-01）
- `next`（c4a2f00）fast-forward 入 `main`，release commit 75f5935（version.ts 1.4.19、versionCode 26）。
- gh-pages：c015a1f「Deploy 1.4.19 (75f5935)」，保留 `.nojekyll`。
- VM 推送伺服器已部署（`PROXY=none`，冇掂 nginx／Macau bus）；部署前備份 `/opt/tree-push/app.bak-20261001-0759`、`/var/lib/tree-push.bak-20261001-0759`（VM 時間 UTC）。
- i18n 工具（box 上）：`/workspace/i18n-work`（`emit_all.py` 由 en/tw/cn.json 生成 `src/i18n/*.ts`；**唔好再跑 `build_tw.py`**，會冇咗 `html.*` key）。
- 語言揀選：設定 → 語言，存 localStorage `sekai-tree-locale` 後重新載入（資料表喺 import 時建立，冇得即時切換）。
- 改英文字串：改 `/workspace/i18n-work/en.json` 再跑 `python3 emit_all.py`（會重寫 en／zh-TW／zh-CN.ts；zh-HK.ts 係原文，直接改）。

### 1.4.20 發佈（2026-10-01）
- 英文版面修正（見版本歷史）；release commit 791f94d，gh-pages c93a718；推送伺服器冇改，冇重新部署。
- 已知：360px 闊嘅手機天氣卡地點名「Hong Kong」會有省略號（同中文長地名一樣，原本設計）。

### 1.4.22 發佈（2026-10-01）
- 見版本歷史；release 5a4be18，gh-pages 2535261；push server 有改（澳門推送名、SMG e_* 代理），部署前備份 `/opt/tree-push/app.bak-20261001-0840`、`/var/lib/tree-push.bak-20261001-0840`（VM UTC）。

### 1.4.23 發佈（2026-10-01）
- 水分機制改動（見版本歷史）；推送伺服器冇改，冇重新部署（水分不足通知只係 app 本地通知，網頁版冇本地通知）。

### 1.4.24 發佈（2026-10-02）
- 見版本歷史；推送伺服器有改（cwa.js 特報詳情、W-C0033-002），部署前有備份（VM UTC 時間戳）。之後 main merge 入 `ios`。

### 1.4.25 發佈（2026-10-02）
- 近距透明加強同跟動物時場景物件透明（見版本歷史）；推送伺服器冇改，冇重新部署。之後 main merge 入 `ios`。

### 1.4.26 發佈（2026-10-02）
- 見版本歷史；推送伺服器有改（新 `/alerts`、`official.js`、`src/geo/`），部署前備份 `/opt/tree-push/app.bak-20261002-0211`、`/var/lib/tree-push.bak-20261002-0211`（VM UTC）。之後 main merge 入 `ios`。
- 模式：`eventMode()`（main.ts）＝ official（港澳台）／feed（`/alerts` covered）／observed；伺服器連唔到又冇 3 小時內嘅舊答案時，`likelyFeedRegion()` 粗略方框內當 feed（冇事件），唔會用數字頂替。
- 限制：JMA 警報資料冇高溫（日本冇酷熱）；舊 `/bosai/warning/data/warning/` 自 2026-05-28 凍結，要用 `/warning/data/r8/`。MeteoAlarm EMMA_ID 多邊形來自 saratoga-weather.org 整理版（第三方）；瑞士、盧森堡等冇多邊形又冇 CAP polygon 嘅國家當冇來源（用實測數字）。英國／挪威／瑞典用警報自帶 CAP polygon。
- 推送：香港以外（非 TW）嘅推送照舊係 Open-Meteo 預報提示（`intl.js`），唔影響遊戲事件。

### 1.4.27 發佈（2026-10-02）
- 見版本歷史；推送伺服器有改（`server.js` pollCells、`official.js` 熱中症＋`feedLevels`/`feedMessageFor`、`intl.js` 實測、`i18n.js` FEED、`tokens.js` area）。
- 推送狀態 key：`f:<0.1° 地區>`（官方）／`o:<0.5° 格>`（實測）；新 key 第一次只記錄唔推，所以部署後唔會一次過推晒現有警報。
- 熱中症：今日嘅警報先算生效（翌日嘅只顯示）；同日較新檔案為準，特別警戒一出就保持；flag 2（特別警戒判定、未發表）當普通警戒；季節外（約 10 月下旬至 4 月下旬）CSV 404 ＝ 冇。
- 限制：官方來源一輪攞唔到就嗰輪唔推（保留狀態，唔會誤報取消）；MeteoAlarm 多邊形係第三方整理。

### 1.4.28 發佈（2026-10-02）
- 只改文字（`guide.ts` pushTab、`guide.006`、圖鑑樹種出處）；推送伺服器冇改。

### 1.4.29 發佈（2026-10-02）
- 見版本歷史；推送伺服器冇改。
- i18n：`/tmp` 被清咗，舊 json 工作檔唔再用；而家直接改 `src/i18n/*.ts`（工具 `/workspace/.ed/tsi18n.py`，改動腳本 `/workspace/.ed/i18n130.py`（四語）、`i18n131.py`（zh-HK 口語））。

### 1.4.30 發佈（2026-10-02）
- 見版本歷史；推送伺服器冇改。i18n 改動腳本 `/workspace/.ed/i18n132.py`。

### 1.4.31 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改（firebase-admin 按 project `sekai-tree` 發，同 package 無關）。
- 要做：Firebase console → 專案 sekai-tree → 新增 Android app `app.sekaitree.game`（加 release SHA-1／SHA-256），下載新 `google-services.json` 換 `android/app/google-services.json`，再出版本先有推送。iOS：Firebase 新增 iOS app `app.sekaitree.game`，GoogleService-Info.plist base64 放 secret `GOOGLE_SERVICE_INFO_PLIST`，APNs key 上傳 Firebase。
- App Store Connect 要用 `app.sekaitree.game` 開 app record；未開之前 ios 分支 push 會令 TestFlight job 喺 upload 失敗（secrets 已設）。

### 1.4.32 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。開咗通知嘅用戶升級後開 app 時會自動登記 FCM 權杖。

### 1.4.33 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。診斷（`src/diag.ts`）：設定入面長按「版本」嗰行 0.7 秒 → AudioContext 狀態、每個音效檔解碼結果、zero-dt 次數、最長一格、開場同預載時間；可以 Copy。
- iOS LaunchScreen 換咗同 Android 一樣嘅天藍底＋圓角 icon（ios 分支），預載畫面喺 iOS 用 `max(100vw,100vh)×0.1662` 對齊 aspect-fill 嘅 splash icon。

### 1.4.34 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。

### 1.4.35 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。

### 1.4.36 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。i18n 改動腳本 `/workspace/.ed/i18n136.py`（`labels.001`／`labels.001b`）。
- 新增文字要跟語言：經 `addLog` 寫嘅日誌自動有 `i18n`；`t()` 以外砌出嚟嘅片段（例如 `regionalize` 替換）配唔到就照原文。測試 `test/msg-v1436.test.ts`。

### 1.4.37 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。i18n 改動腳本 `/workspace/.ed/i18n137.py`（main）、`/workspace/.ed/i18n137ios.py`（ios：`prem.notYet`）。
- App Store Connect 私隱問卷答案、商店文案：`/workspace/tree-game-shots/asc-privacy-answers.md`。
- 私隱政策寫明 `/alerts`、`/cwa` 查詢會送約 100 米（小數 3 位）坐標去推送伺服器（唔儲存）；如果改精度要同步改政策。

### 1.4.38 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改（CORS `*`）。網站兩邊都部署：Cloudflare Pages（`scripts/deploy-pages.sh`）＋ gh-pages。

### 舊網址轉址（2026-10-03）
- `kahowu24065.github.io/tree-game/` 改為轉址去 https://sekai-tree.pages.dev/（gh-pages d580ec5，源檔 `site-redirect/`）；之後發佈只部署 Cloudflare Pages。

### 1.4.39 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。網站只部署 Cloudflare Pages（gh-pages 係轉址頁，唔好覆蓋）。i18n 腳本 `/workspace/.ed/i18n139ios.py`（ios；新 key `prem.perkMore／planMonthly／planLifetime／priceMonthly／priceOnce／perMonth／lifetimeNote／lifetimeActive`，刪 `prem.subscribe`；`prem.disclosure*` 參數由 `{price}` 改做 `{per}`）。
- 程式（ios）：`src/premium.ts` `LIFETIME_ID`／`Plan`；`src/native/billing.ts` `BillingInfo.lifetimePrice／lifetime`、`planReady()`、`purchase(plan)`（monthly＝`purchasePackage`；lifetime＝lifetime package，否則 `purchaseStoreProduct`）；恢復購買照用 `restorePurchases`（兩樣都包）。
- **要用戶手動做**：App Store Connect 開 non-consumable `sekai_tree_lifetime`（價錢、zh-Hant／英文名同描述、審核截圖），RevenueCat 加產品、掛 `premium` entitlement、default offering 加 Lifetime package（`$rc_lifetime`）。未做之前「永久」掣只顯示名、㩒落話未開放。

### 1.4.40 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。網站只部署 Cloudflare Pages（gh-pages 係轉址頁，唔好覆蓋）。i18n 腳本：`/workspace/.ed/i18n140.py`（main，刪 `ui.134`）、`/workspace/.ed/i18n140ios.py`（ios；新 key `prem.planYearly／priceYearly／perList／listSep`，`prem.disclosureIos／Android` 全句重寫，刪 `prem.perMonth`；`priceMonthly`／`priceOnce` 改半形 `/` 同「（一次性）」方便斷行）。
- 程式（ios）：`src/premium.ts` `YEARLY_ID`／`PLANS`；`src/native/billing.ts` 每個 plan 一個 package（`monthly`／`annual`／`lifetime`，或者 packageType／product id）＋ `getProducts` 後備，`BillingInfo.yearlyPrice`、`planPrice()`；`src/premiumUi.ts` `priceLine()`。
- **要用戶手動做**：`sekai_tree_yearly` 已喺 ASC 開咗（同月費同一 group）；仲要喺 RevenueCat 加產品、掛 `premium`、default offering 加 Annual package（`$rc_annual`）。永久嗰邊（`sekai_tree_lifetime`）見 1.4.39。

### 1.4.41 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。網站只部署 Cloudflare Pages（gh-pages 係轉址頁，唔好覆蓋）。i18n 腳本 `/workspace/.ed/i18n141.py`（`animals.nightmoth.*`）。
- **語言即時切換**：`src/i18n/index.ts` `live(build)`／`switchLocale(l)`／`onLocaleChange(fn)`。任何 import 時用 `t()` 砌嘅模組級表格都要包 `live(() => (...))`（`/workspace/.ed/livewrap.cjs` 會自動包；`/workspace/.ed/modtl.cjs` 列出漏網）。一次過砌好嘅 DOM 用 `onLocaleChange` 重新貼字（例：animalHud）。`main.ts` `applyLocale()`：存設定 → 重建表 → `localizeStatic` → `render` → 重開設定 → 重排提示 → 重攞天氣字。
- **澆水寬限**：`src/sim.ts` `CARE_GRACE_MS`、`graceOverlap`／`stepRates`；`applyDrift`／`simulateDrift` 要傳時間軸起點（`flow.at`），今晚預計同結算一致。`performAction(state, action, nowMs, night)`。說明頁冇加字（用戶要求）。
- **圖鑑按日夜**：`src/data/animals.ts` `outAt()`（3D `fits()` 都用佢）；`refreshUnlocks({ night })`、`catchUp(..., night)`、`advanceVirtualDay(..., night)`，main 用 `nightNow()`（daylight < 0.45）。以前所有動物唔理日夜都會解鎖（例如夜晚開新局解鎖菜粉蝶但睇唔到）。

### 1.4.42 發佈（2026-10-03）
- 見版本歷史；推送伺服器冇改。網站只部署 Cloudflare Pages（gh-pages 係轉址頁，唔好覆蓋）。冇新 i18n。
- `src/native/persist.ts`：`STAMP_KEY`、`planHydrate`（Preferences 空 → 搬 localStorage；localStorage 印較新 → 推去 Preferences；否則 Preferences → localStorage）、`installWriteThrough(storage, backend, now)` 合併寫入＋失敗重試。`src/main.ts` `saveNow()`。測試：`test/persist-v1442.test.ts`、`test/native.test.ts`。
- iOS AdMob：GitHub secrets `ADMOB_IOS_APP_ID`（`~9261059644`）同 `ADMOB_IOS_BANNER_ID`（`/1065865690`）已設；Android 用另一套（`~4204763415`／`/4013191726`）。`ios.yml` 會檢查 Info.plist `GADApplicationIdentifier` 同 web bundle 有冇注入（build 126 起）。

### 1.4.43 發佈（2026-10-04）

- 純診斷（用戶只批准加診斷）：`src/native/saveLog.ts`（環形紀錄＋雙份持久化）、`src/saveDiag.ts`（`sumState`／`sumRaw`／`careSig`）、`persist.ts` 加 `hydrateInfo`／`hydrateReason`／`observeNativeWrites`／`nativeQueue`（`installWriteThrough` 第 4 參數 `onBatch`）。
- main：`persist(trigger)`、`saveNow(trigger)`、`syncFlow(force, trigger)`、`runCatchup(why)` 帶來源；`watchStep()` 開 app 90 秒內每步都記，之後只喺 care 變咗先記。
- 已知：iOS 掃走 app 係 SIGKILL 暫停中嘅程序，pagehide 通常唔會觸發，只有入背景時嘅 visibilitychange／App pause；Preferences 寫入唔係 await（排隊 fire-and-forget），紀錄有每次延遲同 flush 完成時間。
- 測試：`test/savelog-v1443.test.ts`。

### 1.4.44 發佈（2026-10-04）

- 根因：`installWriteThrough()` 直接賦值 `storage.setItem = …`。Chrome／Android WebView 得，WebKit 唔得（變成儲存項目），所以 iOS 一直冇鏡像。已移除，改為 `createMirror()`＋`setKvMirror()`；`kvStorage` 俾要 storage 參數嘅代碼（ios `savePremium`）。
- `planHydrate`：Preferences 空 → 複製 local；local 冇 `sekai-tree-v2`／`sekai-tree-grove` 或 Preferences stamp 嚴格較新 → 還原 Preferences；否則保留 local，將唔同嘅 key 複製去 Preferences（stamp 最後）。
- 守衛測試：`src` 入面除咗 `native/kv.ts`／`persist.ts`／`saveLog.ts`，唔准直接 `localStorage.setItem/removeItem`。
- 測試：`test/persist-v1444.test.ts`（模擬 WebKit Storage、hydrate 平手／冇 stamp、動作 → 殺 app → 重開）。

### 1.4.45 發佈（2026-10-04）

- `permGate.ts`：`permsReady()`／`openPerms()`（`sekai-tree-perms-ready`）／`onboardingDone(started, coach)`。`location.ts`、`push.ts`、`notify.ts`、`weather.ts locate()` 喺閘門關閉時只用已批准權限。設定入面玩家自己揀「用我所在位置」或者開通知都會開閘。
- 鏡頭：`PULL_S = 4.0`、`SETTLE_S = 2.2`，`smootherstep`／`smoothstep`；`catchUp()`（每格 ≤ 0.1 s，最多 2× 速度追，債務上限 0.6 s）；`smoothDamp` 彈簧（0.6 s）。診斷面板顯示開場鏡頭最大一格位移。
- 聲音：`animalCue()`；測試 `test/v1445.test.ts`。

### 1.4.46 發佈（2026-10-04）

- `rules.ts carbonParts(kg)`（純函數）、`ui.ts formatCarbon()`／`formatRealAge()`／`realAgeParts()`；i18n 腳本 `.ed/i18n146.py`、`.ed/i18n146b.py`。
- 測試：`test/carbon-v1446.test.ts`。

### 1.4.47 發佈（2026-10-04）

- i18n 腳本 `.ed/i18n147.py`；測試 `test/plural-v1447.test.ts`。

### 1.4.48 發佈（2026-10-04）

- `src/presets.ts`（`PLACES`、`PLACE_GROUPS`、`findPlace`、`migratePlaceId`、`weatherRegion`、`pushRegionFlags`）；`ui.ts` 再 export `PLACES`；i18n 腳本 `.ed/i18n148.py`（新 key `place.*`、`place.group.*`，刪 `ui.347`–`ui.352`）；CSS `.place-groups`／`.places-head`（320px 試過：英文「New Territories」「Macau Peninsula」兩行，唔會爆出）。
- 離島冇東涌溫度站時用最近嘅赤鱲角。台灣預設經推送伺服器 `/cwa` 試過：臺北市信義區、臺中市北區、臺南市中西區、臺東縣臺東市。
- 測試：`test/presets-v1448.test.ts`。
