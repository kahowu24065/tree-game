# 《世界之樹》交接文件（HANDOFF）

寫俾接手嘅 Cursor agent：淨係睇呢個 repo 就可以繼續開發。最後更新：2026-09-27，版本 **1.4.1**（main `9a98603` 之後）。

---

## 1. 項目概覽

- 一個跟住**真實天氣**、每日照顧一棵樹嘅輕遊戲（繁體中文、廣東話口語 UI）。3D 浮島場景＋玻璃風 HUD。
- 網頁版（GitHub Pages）同 Android app（Capacitor 7）共用同一份 `dist/`。
- 香港用天文台（HKO）警告同讀數；香港以外用 Open-Meteo，按遊戲自己嘅門檻判斷。
- Android app 另有：原生定位、Preferences 存檔、本機提醒、FCM 天氣警告推送（經自家 push server）。
- Repo：`github.com/kahowu24065/tree-game`（remote 名喺原本部機叫 `github`；`main` = 開發，`gh-pages` = 網站）。

### 技術
| 部分 | 用咩 |
| --- | --- |
| 前端 | Vite 8 + TypeScript 6（strict，`noUnusedLocals`），three.js，冇框架（字串模板＋`innerHTML`） |
| 測試 | Vitest（`test/**/*.test.ts`，node 環境）；版面／截圖用 Playwright 腳本（`scripts/`） |
| App | Capacitor 7 Android（appId `io.github.kahowu24065.treegame`，minSdk 跟 Capacitor 預設，compile/target 35） |
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
| 1.4.28 | 純文字：玩法「推送通知」分頁刪走「應急提醒」「防止亂跳」「本機提醒（唔使網絡）」三段（guide.203–211 已刪）；玩法分頁「目標」由「冇完結日：」起改為「生長到打破世界最高紀錄，解鎖第二座空島，種更多的「世界之樹」」（四語）；versionCode 35 |

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

## 4. 網站（gh-pages）

- `gh-pages` branch 根目錄放 `dist/` 嘅內容，**一定要保留 `.nojekyll`**。
- 用 `npm run build`（有開發者面板，網站一直係咁）。
- 步驟（唔好 force push）：
  ```bash
  npm run build
  git worktree add ../tree-pages gh-pages
  # 清走 ../tree-pages 入面舊檔（保留 .git 同 .nojekyll），再 copy dist/* 入去
  cd ../tree-pages && touch .nojekyll && git add -A && git commit -m "Deploy <commit>" && git push github gh-pages
  ```
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
- Git：正常 commit＋push `main`；**唔好 force push**；冇叫就唔好 deploy gh-pages；唔好 commit 任何金鑰、密碼、service account。
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
- 只改文字（`guide.ts` pushTab、`guide.006`）；推送伺服器冇改。

### iOS + 會員（`ios` 分支，未發佈）
- iOS：Capacitor iOS（`ios/`），Firebase Messaging 把 APNs 權杖換成 FCM 權杖（AppDelegate.swift），`GoogleService-Info.plist` 由 CI secret 寫入（唔入 repo）。CI：`.github/workflows/ios.yml`（macos-26／Xcode 26.6；冇 secrets 就只做 simulator build + ad-hoc archive；有就 cloud signing 上 TestFlight）。
- 會員（`src/premium.ts`、`src/premiumUi.ts`、`src/native/billing.ts`）：RevenueCat，entitlement `premium`、產品 `sekai_tree_monthly`（HK$8／月）。**唯一福利：冇廣告。** 照顧、警告、玩法全部免費。網頁版只顯示「App 版先有」。
- 每月限定樹葉皮膚、真實天氣紀念冊：code 仍在，但 `PREMIUM_EXTRAS = false`（`src/premium.ts`）——UI／付費牆唔顯示、唔記錄、唔套用。將來開返要改 flag，再加返付費牆文字（`prem.perkSkins`／`prem.perkAlbum` 已有四語）、terms.html／privacy.html 同 App Store 描述。
- App Store 訂閱描述建議：顯示名稱「世界之樹會員」／「World Tree Premium」；描述「移除所有廣告，支持世界之樹繼續成長。」／「Removes all ads and supports the World Tree.」
- 廣告：Android 照用 TreeBannerPlugin；iOS 用 `@capacitor-community/admob`（BOTTOM_CENTER、safe area）。兩邊先做 UMP 同意，iOS 再問 ATT，之後先請求廣告；會員冇廣告（`html.no-ad`）。
- Build-time 設定（唔入 repo）：`VITE_RC_IOS_KEY`、`VITE_RC_ANDROID_KEY`、`VITE_ADMOB_IOS_BANNER`（冇就用 Google 測試單元）；Xcode `ADMOB_IOS_APP_ID`（預設 Google 測試 app id）。Android 本地 build 用 `.env.local`。
- 網站要部署 `privacy.html`／`terms.html`（喺 `public/`）先有效；App Store Connect 填呢兩條 URL。
