# 1.4.51 (1.4.54: iCloud / Google backup) source of public/privacy.html (and the Akar · Apps copy). zh-HK + en written by hand; zh-TW / zh-CN via OpenCC.
EFFECTIVE = '2026-10-08'
MAIL = 'akar.554426@gmail.com'
ZH = f'''
<p>本政策說明「世界之樹」（iOS、Android 應用程式及網頁版，下稱「本應用」）處理哪些資料、處理目的、與哪些第三方分享、保留多久，以及你享有的權利。本應用<b>不設帳戶</b>，不會要求你提供姓名、電郵、電話號碼或相片；我們<b>不會出售</b>你的個人資料。</p>

<h3>1. 我們處理的資料</h3>
<table>
<tr><th>資料</th><th>何時</th><th>用途</th></tr>
<tr><td>位置（大約位置）</td><td>你允許位置權限，或選擇「用我所在位置」時</td><td>顯示當地天氣、天氣警告及地名（應用程式功能）</td></tr>
<tr><td>推送權杖、平台、應用版本、語言、時區、概略地區</td><td>你在「設定」開啟提醒通知時</td><td>發送天氣警告及遊戲提醒（應用程式功能）</td></tr>
<tr><td>簡單遊戲狀態（當日已完成的應急行動、樹木是否健在、抗風力）</td><td>開啟提醒通知時</td><td>避免重複或不相關的通知</td></tr>
<tr><td>裝置識別碼（廣告識別碼 IDFA／Android 廣告 ID）、廣告互動、概略位置、IP 位址</td><td>免費版 iOS／Android 顯示廣告時（iOS 需你在追蹤提示中允許才會取用 IDFA）</td><td>由 Google AdMob 投放及量度廣告、防止詐騙；可能用於追蹤</td></tr>
<tr><td>購買記錄、匿名用戶編號、收據</td><td>你購買或恢復 世界之樹 Premium 時</td><td>核實購買、解鎖權益（應用程式功能）</td></tr>
<tr><td>診斷及效能資料（例如當機、載入時間）</td><td>由 Google 的 SDK 自動收集</td><td>維持廣告及推送服務運作；本應用本身不使用另外的當機分析服務</td></tr>
</table>
<p>樹木、成長日誌、圖鑑及設定等遊戲資料儲存在你的裝置上，<b>不會上傳到我們的伺服器</b>。為了換機或重新安裝後可以恢復：iOS 版會把存檔同步到<b>你自己的 iCloud</b>（Apple iCloud 鍵值儲存）；Android 版會納入<b>你自己的 Google 帳戶備份</b>（Android 自動備份）。這些備份由 Apple／Google 按其私隱政策保存在你的帳戶內，我們無法存取。你可以在系統設定關閉（iOS「設定 › 你的名字 › iCloud」中關閉本應用；Android「設定 › 系統 › 備份」）。網頁版的存檔只保存在你的瀏覽器。「備份存檔」產生的存檔碼只會在你自行複製或分享時離開裝置。</p>

<h3>2. 位置如何傳送</h3>
<ul>
<li>本應用只請求<b>大約位置</b>（iOS「使用 App 期間」；Android「大概位置」）。你可以拒絕或隨時在系統設定關閉，屆時會改用香港天氣或你手動選擇的地點。</li>
<li><b>香港、澳門</b>：天文台及地球物理氣象局的資料以整份公開資料下載，<b>不會傳送你的位置</b>。</li>
<li><b>台灣、日本及其他地區</b>：坐標會四捨五入（最多小數點後 4 位，約 10 米；警告查詢為 3 位，約 100 米）傳送至我們的伺服器；伺服器再以更粗略的地區（約 1 公里格）向 MET Norway、日本氣象廳、中央氣象署等查詢。氣象機構只會見到我們的伺服器，不會見到你的 IP 位址。伺服器為天氣歷史只儲存約 1 公里格的天氣數字；查詢坐標不會與推送權杖或其他識別碼一併儲存，只會出現在下述的存取日誌。</li>
<li><b>地名</b>：使用「用我所在位置」時，裝置會把坐標（小數點後 4 位）直接傳送至 BigDataCloud 以取得地區名稱。</li>
</ul>

<h3>3. 第三方服務</h3>
<ul>
<li><b>Google AdMob 及使用者同意聲明（UMP）</b>：廣告（只限免費版 iOS／Android；網頁版及 Premium 用戶不顯示廣告）。<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">Google 如何使用資料</a></li>
<li><b>Google Firebase Cloud Messaging</b> 及 <b>Apple 推送通知服務</b>：遞送通知。</li>
<li><b>RevenueCat</b>：核實 App Store／Google Play 購買。<a href="https://www.revenuecat.com/privacy/" target="_blank" rel="noopener">RevenueCat 私隱政策</a></li>
<li><b>Apple App Store／Google Play</b>：處理付款；我們不會收到你的付款資料。</li>
<li><b>Apple iCloud（iOS）／Google 備份（Android）</b>：在你自己的帳戶內備份存檔；我們無法存取。</li>
<li><b>BigDataCloud</b>：地名（反向地理編碼）。</li>
<li><b>我們的推送及天氣伺服器</b>：位於 Oracle Cloud 日本東京區域。</li>
<li><b>氣象資料來源</b>（只會收到伺服器發出的概略坐標）：香港天文台、澳門地球物理氣象局、中央氣象署、國家災害防救科技中心、日本氣象廳及環境省、MET Norway、美國國家氣象局、加拿大環境及氣候變化部、MeteoAlarm。</li>
<li><b>Cloudflare Pages</b>：網頁版及本頁的主機，可能記錄存取日誌。</li>
</ul>

<h3>4. 廣告及追蹤</h3>
<p>於 iOS，本應用會以 App Tracking Transparency 詢問你是否允許追蹤；如你拒絕，則不會取用 IDFA，只顯示非個人化或有限廣告。於歐洲經濟區、英國及瑞士，會先顯示 Google 同意表格。你可以隨時在系統設定（iOS「設定 › 私隱與保安 › 追蹤」；Android「設定 › 私隱 › 廣告」）更改。購買 世界之樹 Premium 後不再顯示廣告。</p>

<h3>5. 購買</h3>
<p>世界之樹 Premium 包括月費（HK$8／月）及年費（HK$78／年）自動續期訂閱，以及一次性永久購買（HK$128）；其他地區以商店顯示價格為準。訂閱可在 App Store 或 Google Play 帳戶設定管理或取消。</p>

<h3>6. 保留期限</h3>
<ul>
<li>推送資料：保留至你關閉提醒通知（即時刪除）；刪除應用程式後權杖失效，會在下一次推送時自動移除；連續 14 日沒有更新的裝置會停止接收地區通知。</li>
<li>伺服器的天氣歷史（只有天氣數字，以約 1 公里格記錄）：最多約 15 日。</li>
<li>伺服器存取日誌（IP 位址、時間及請求網址，網址可能含四捨五入的坐標）：最多 14 日，只用作保安、防濫用及除錯，之後自動刪除。</li>
<li>購買記錄：由 Apple／Google 及 RevenueCat 按其政策及法律要求保留。</li>
<li>裝置上的遊戲資料：直至你刪除應用程式或清除網站資料。</li>
<li>iCloud／Google 備份中的存檔：由你的帳戶保存，直至你在系統設定刪除或關閉備份（Apple／Google 亦可能按其政策刪除長期未使用的備份）。</li>
</ul>

<h3>7. 你的權利</h3>
<p>你可以隨時在系統設定撤回位置、通知及追蹤權限。你可以要求查閱、更正或刪除與你相關的資料（包括經 RevenueCat 的購買記錄），或反對某些處理：請電郵 <a href="mailto:{MAIL}">{MAIL}</a>，註明裝置及平台以便辨識。我們會在 30 日內回覆。你亦可向你所在地的資料保護機構投訴（例如香港個人資料私隱專員公署）。</p>

<h3>8. 兒童</h3>
<p>本應用適合一般觀眾，但並非專為 13 歲以下兒童設計。我們不會刻意收集兒童的個人資料；家長如認為兒童向我們提供了個人資料，請聯絡我們刪除。</p>

<h3>9. 保安及跨境傳送</h3>
<p>所有連線均使用 HTTPS 加密。資料可能在香港以外地區（例如日本、美國）處理，我們只使用信譽良好的服務供應商，並只傳送提供功能所需的最少資料。</p>

<h3>10. 政策更新及聯絡</h3>
<p>如本政策有重大修改，我們會更新本頁及生效日期，並在應用程式更新說明中提及。查詢：<a href="mailto:{MAIL}">{MAIL}</a>。</p>
'''
EN = f'''
<p>This policy explains what data World Tree (世界之樹; the iOS and Android apps and the web version, “the app”) processes, why, who it is shared with, how long it is kept and your rights. The app has <b>no accounts</b> and never asks for your name, email, phone number or photos. We <b>do not sell</b> personal data.</p>

<h3>1. Data we process</h3>
<table>
<tr><th>Data</th><th>When</th><th>Purpose</th></tr>
<tr><td>Location (approximate)</td><td>When you allow location or choose “Use my location”</td><td>Local weather, warnings and place name (app functionality)</td></tr>
<tr><td>Push token, platform, app version, language, time zone, coarse area</td><td>When you turn on Notifications in Settings</td><td>Weather warnings and game reminders (app functionality)</td></tr>
<tr><td>Simple game state (today’s emergency actions, whether the tree is alive, wind resistance)</td><td>With notifications on</td><td>Avoid repeated or irrelevant notifications</td></tr>
<tr><td>Device identifiers (IDFA / Android advertising ID), ad interactions, coarse location, IP address</td><td>When ads are shown in the free iOS / Android app (on iOS the IDFA only if you allow tracking)</td><td>Ad serving and measurement by Google AdMob, fraud prevention; may be used for tracking</td></tr>
<tr><td>Purchase history, anonymous user ID, receipts</td><td>When you buy or restore World Tree Premium</td><td>Verify purchases and unlock benefits (app functionality)</td></tr>
<tr><td>Diagnostics and performance data (e.g. crashes, load times)</td><td>Collected automatically by Google SDKs</td><td>Keeping ads and push delivery working; the app itself uses no separate crash-analytics service</td></tr>
</table>
<p>Your tree, growth log, field guide and settings are stored on your device and <b>never uploaded to our servers</b>. So that a new phone or a reinstall can restore them, the iOS app syncs the save to <b>your own iCloud</b> (Apple iCloud key-value storage) and the Android app includes it in <b>your own Google account backup</b> (Android Auto Backup). These backups are kept in your account by Apple / Google under their privacy policies; we cannot access them. You can turn them off in system settings (iOS Settings › your name › iCloud; Android Settings › System › Backup). On the web the save stays in your browser only. A save code from “Back up save” only leaves the device if you copy or share it.</p>

<h3>2. How location is sent</h3>
<ul>
<li>The app asks only for <b>approximate location</b> (iOS “While Using the App”; Android “approximate”). You can refuse or turn it off any time; the app then uses Hong Kong or a place you pick.</li>
<li><b>Hong Kong and Macau</b>: Observatory and SMG data are downloaded as whole public feeds; <b>your location is not sent</b>.</li>
<li><b>Taiwan, Japan and elsewhere</b>: coordinates are rounded (at most 4 decimal places, about 10 m; 3 places, about 100 m, for warnings) and sent to our server, which asks MET Norway, the Japan Meteorological Agency, the Central Weather Administration and others using an even coarser area (about a 1 km grid). Weather services see only our server, never your IP address. For weather history the server keeps only weather numbers per ~1 km grid cell; request coordinates are never stored with your push token or any other identifier and appear only in the access logs described below.</li>
<li><b>Place names</b>: with “Use my location”, the device sends coordinates (4 decimal places) directly to BigDataCloud to get the area name.</li>
</ul>

<h3>3. Third parties</h3>
<ul>
<li><b>Google AdMob and User Messaging Platform</b>: ads (free iOS / Android app only; no ads on the web version or for Premium). <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses data</a></li>
<li><b>Google Firebase Cloud Messaging</b> and <b>Apple Push Notification service</b>: notification delivery.</li>
<li><b>RevenueCat</b>: verifies App Store / Google Play purchases. <a href="https://www.revenuecat.com/privacy/" target="_blank" rel="noopener">RevenueCat privacy policy</a></li>
<li><b>Apple App Store / Google Play</b>: payments; we never receive your payment details.</li>
<li><b>Apple iCloud (iOS) / Google backup (Android)</b>: back up your save inside your own account; we cannot access it.</li>
<li><b>BigDataCloud</b>: place names (reverse geocoding).</li>
<li><b>Our push and weather server</b>: Oracle Cloud, Tokyo (Japan) region.</li>
<li><b>Weather data sources</b> (receive only coarse coordinates from our server): Hong Kong Observatory, Macao SMG, Taiwan CWA and NCDR, Japan Meteorological Agency and Ministry of the Environment, MET Norway, US National Weather Service, Environment and Climate Change Canada, MeteoAlarm.</li>
<li><b>Cloudflare Pages</b>: hosts the web version and this page and may keep access logs.</li>
</ul>

<h3>4. Ads and tracking</h3>
<p>On iOS the app asks through App Tracking Transparency whether you allow tracking; if you decline, the IDFA is not accessed and only non-personalised or limited ads are shown. In the EEA, UK and Switzerland a Google consent form is shown first. You can change this any time in system settings (iOS Settings › Privacy & Security › Tracking; Android Settings › Privacy › Ads). Premium removes ads.</p>

<h3>5. Purchases</h3>
<p>World Tree Premium is offered as monthly (HK$8/month) and yearly (HK$78/year) auto-renewing subscriptions and a one-time lifetime purchase (HK$128); other regions see local store prices. Manage or cancel subscriptions in your App Store or Google Play account settings.</p>

<h3>6. Retention</h3>
<ul>
<li>Push data: until you turn notifications off (deleted immediately); after you delete the app the token stops working and is removed at the next push; devices not updated for 14 days stop receiving area notifications.</li>
<li>Server weather history (weather numbers only, per ~1 km grid cell): up to about 15 days.</li>
<li>Server access logs (IP address, time and request URL, which may contain rounded coordinates): up to 14 days, for security, abuse prevention and debugging only, then deleted automatically.</li>
<li>Purchase records: kept by Apple / Google and RevenueCat under their policies and the law.</li>
<li>Game data on your device: until you delete the app or clear site data.</li>
<li>Saves in iCloud / Google backup: kept in your account until you delete them or turn backup off in system settings (Apple / Google may also delete long-unused backups under their policies).</li>
</ul>

<h3>7. Your rights</h3>
<p>You can withdraw location, notification and tracking permissions in system settings at any time. You may ask to access, correct or delete data about you (including RevenueCat purchase records) or object to processing by emailing <a href="mailto:{MAIL}">{MAIL}</a> with your device and platform so we can identify it. We reply within 30 days. You may also complain to your local data protection authority (for example Hong Kong’s Privacy Commissioner for Personal Data, or your EU/UK authority).</p>

<h3>8. Children</h3>
<p>The app is suitable for a general audience but not directed at children under 13. We do not knowingly collect children’s personal data; parents who believe a child has provided personal data can contact us to delete it.</p>

<h3>9. Security and international transfers</h3>
<p>All connections use HTTPS. Data may be processed outside Hong Kong (for example in Japan and the United States). We use reputable providers and send only the minimum needed for each feature.</p>

<h3>10. Changes and contact</h3>
<p>If this policy changes materially we will update this page and its effective date and mention it in the app’s release notes. Contact: <a href="mailto:{MAIL}">{MAIL}</a>.</p>
'''
SUPPORT_ZH = f'''<p>多謝你玩「世界之樹」！如有問題、建議或發現錯誤，請電郵 <a href="mailto:{MAIL}">{MAIL}</a>，註明裝置型號、系統版本及應用版本（設定頁最底），我們通常會在 3 個工作天內回覆。</p>
<h3>常見問題</h3>
<ul>
<li><b>天氣同我見到嘅唔同？</b>本遊戲顯示官方氣象機構嘅公開資料，擷取、快取或轉換時可能有延遲或出入；惡劣天氣請留意最新公布並注意安全。</li>
<li><b>點樣搬存檔去新手機？</b>iPhone 會自動用你自己嘅 iCloud 備份，Android 會用 Google 備份，換同一類手機或者重裝會自動恢復。iPhone 同 Android 之間轉機：設定 › 備份存檔 複製存檔碼，喺新裝置 設定 › 用存檔碼還原 貼上。</li>
<li><b>收唔到通知？</b>確認系統設定已允許通知，並喺遊戲 設定 › 提醒通知 開啟。</li>
<li><b>恢復購買／取消訂閱？</b>遊戲 設定 › 世界之樹 Premium › 恢復購買；取消請到 App Store 或 Google Play 帳戶的訂閱設定。退款由 Apple／Google 處理。</li>
<li><b>刪除資料？</b>關閉提醒通知即刪除伺服器資料；其他要求請電郵我們。</li>
</ul>'''
SUPPORT_EN = f'''<p>Thanks for playing World Tree! For questions, suggestions or bugs, email <a href="mailto:{MAIL}">{MAIL}</a> with your device model, OS version and app version (bottom of Settings). We usually reply within 3 working days.</p>
<h3>FAQ</h3>
<ul>
<li><b>The weather differs from what I see?</b> The game shows public data from official meteorological agencies; fetching, caching or converting those feeds can lag or differ. In severe weather, follow the latest announcements and stay safe.</li>
<li><b>Move my save to a new phone?</b> iPhone backs it up automatically to your own iCloud and Android to your Google backup, so a new phone of the same kind or a reinstall restores it. Between iPhone and Android: Settings › Back up save, copy the code, then Settings › Restore from code on the new device.</li>
<li><b>No notifications?</b> Allow notifications in system settings and turn on Settings › Notifications in the game.</li>
<li><b>Restore purchases / cancel?</b> Settings › World Tree Premium › Restore purchases; cancel in your App Store or Google Play subscription settings. Refunds are handled by Apple / Google.</li>
<li><b>Delete my data?</b> Turning notifications off deletes server data; for anything else, email us.</li>
</ul>'''
