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
- 臺灣（1.4.14）：app 送 `isTW`＋縣市／鄉鎮，server 每 5 分鐘查中央氣象署警特報，跟外地規則，通知用氣象署名稱。CWA key 喺 VM `/etc/tree-push/cwa.env`（600，唔好 commit、唔好放入網站）。對照表見 `push-server/README.md`。

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

- **網站（gh-pages）自 Android 1.1 之後冇更新**：玩法面板、山泥傾瀉、天氣概況頁等都未上網站。用戶要求先 deploy。
- **開發者手動天氣時，天氣概況頁仍然顯示真實天文台警告**（遊戲天氣係手動，警告列表係真）。
- **玩法 → 推送通知 入面嘅時間係寫死**（約 2.5 分鐘、20 分鐘、2 小時、約 40 分鐘），server 改設定要同步改 `src/guide.ts`。
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
