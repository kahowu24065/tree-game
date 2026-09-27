# tree-push-server

《世界之樹》push relay: polls HKO `warnsum` every 150 s and, when a HK warning is **issued or upgraded**
(酷熱; 黃／紅／黑雨; 一號／三號／八號+ 風球; 寒冷; 山泥傾瀉), sends an FCM push to every registered device.
Since v1.4 downgrades and cancellations are pushed too (info) — see「v1.4 push rules」below. The last-seen levels are saved to disk, so a restart never re-notifies,
and the very first run only records the current state.

## v2: action-aware + non-HK
- Devices send `POST /state { token, day, tz, done:{heat,drain,reinforce,warm}, region:{lat,lon} (0.5°), isHK, rUnlocked, alive }`
  (debounced by the app). A push for category X skips devices that already did today's action for X (heat → 酷熱澆水,
  rain → 疏水, typhoon/wind → 加固, cold → 保暖), dead trees, and wind pushes for trees before 青年樹 (`rUnlocked` false).
  Devices without state (older app versions) get every push.
- One follow-up reminder ~2 h after a push while the warning is still in force (max one per firing, same filter).
- Non-HK devices (`isHK` false): per 0.5° cell with a device seen in the last 14 days, Open-Meteo every 20 min
  (max 60 cells per cycle, 1.5 s apart) → the game's own rules (`src/intl.js`, checked against the game's TypeScript
  by `test/push-rules-parity.test.ts` in tree-game) → new / upgraded 酷熱／寒冷／大雨／豪雨／烈風／狂風雷暴／暴風 pushed with
  regional names. First sight of a cell only records its state.
- State: `alerts.json` (HK + cells; migrates the v1 `last-levels.json` without re-notifying); device state lives in `tokens.json`.

## v1.4 push rules (current)
| Change | Who gets it |
| --- | --- |
| Warning issued / upgraded | everyone in scope, except devices that already did today's matching action (酷熱澆水／疏水／加固／保暖). Dead / 瀕死 trees included, with a short state line; 抗風力 under the 倒塌 threshold adds a 倒塌風險 line |
| 風球 / 山泥傾瀉 before 青年樹 (`rUnlocked` false) | always, as a real-life safety notice (no 加固 call to action, no reminder) |
| ~2 h reminder (max one per firing) | action still undone, doable (not dead, not pre-青年樹 wind) |
| Downgrade / cancel (紅雨轉黃雨, 八號風球轉三號風球, 酷熱天氣警告已取消…) | everyone in scope (info). Non-HK cells need 2 consecutive lower readings (~40 min) so forecasts don't flap |
- HK categories: 酷熱, 寒冷, 暴雨 (黃／紅／黑), 風球 (1/3/8/9/10), **山泥傾瀉警告 (HKO warnsum `WL`, handled by 加固)**.
- First run / first sight of a cell only records the state (no pushes).
- `/state` also takes `tree` (`ok`/`dying`/`dead`) and `resist` (抗風力) from app 1.4.

## API
- `POST /register` `{ token, platform, appVersion }` → `{ ok }` (token 20–4096 chars `[A-Za-z0-9_:.-]`)
- `POST /unregister` `{ token }`
- `POST /state` (see above)
- `GET /health` → FCM on/off, devices, devices with state, cells, last polls, HK levels

Rate limit: 30 device calls per IP per 10 min. Tokens FCM reports as unregistered/invalid are dropped.

## Config (env)
| var | default |
| --- | --- |
| `GOOGLE_APPLICATION_CREDENTIALS` | service-account JSON path (missing → dry run: logs, no pushes) |
| `PORT` / `HOST` | `8080` / `127.0.0.1` (Caddy terminates HTTPS in front) |
| `DATA_DIR` | `./data` (`tokens.json`, `last-levels.json`) |
| `POLL_MS` | `150000` |

Push: `sendEachForMulticast` in batches of 500, Android high priority, channel `weather-warnings`.

## Deploy (Oracle VM 158.101.140.210, Ubuntu 22.04 arm64 — live since 2026-09-27)
The VM already runs nginx (80/443) for another site plus pm2 apps on :3000 and :8080, so the relay sits beside them:
- own Node `v20.20.2` in `/opt/tree-push/node` (the system Node is left alone), app in `/opt/tree-push/app`
- systemd `tree-push` (user `treepush`), listens on `127.0.0.1:8091`, data in `/var/lib/tree-push`
- its own nginx site `/etc/nginx/sites-available/tree-push` (from `deploy/nginx-tree-push.conf`) + certbot cert
  for `158-101-140-210.sslip.io` (auto-renewed by the existing certbot timer); other sites untouched

Update / reinstall:
```bash
rsync -a --delete --exclude node_modules --exclude data ./ ubuntu@158.101.140.210:~/tree-push-server/
ssh ubuntu@158.101.140.210 'cd ~/tree-push-server && sudo PROXY=nginx DOMAIN=158-101-140-210.sslip.io bash deploy/install.sh'
```
Enable real pushes: copy the Firebase service-account JSON to `/etc/tree-push/service-account.json`, re-run the
installer (fixes owner/mode) — `/health` then shows `"fcm":true`. `PROXY=caddy` is for a fresh VM with nothing on 80/443.

Test push to every registered device (admin only, no HTTP endpoint): `sudo tree-push-test "標題" "內容"`.

Logs: `journalctl -u tree-push -f`. Tests: `npm test`.
