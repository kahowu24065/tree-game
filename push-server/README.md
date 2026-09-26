# tree-push-server

《世界之樹》push relay: polls HKO `warnsum` every 150 s and, when a HK warning is **issued or upgraded**
(酷熱; 黃／紅／黑雨; 一號／三號／八號+ 風球; 寒冷), sends an FCM push to every registered device.
Downgrades and cancellations are silent. The last-seen levels are saved to disk, so a restart never re-notifies,
and the very first run only records the current state.

## API
- `POST /register` `{ token, platform, appVersion }` → `{ ok }` (token 20–4096 chars `[A-Za-z0-9_:.-]`)
- `POST /unregister` `{ token }`
- `GET /health` → FCM on/off, device count, last poll, current levels

Rate limit: 20 register/unregister calls per IP per 10 min. Tokens FCM reports as unregistered/invalid are dropped.

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

Logs: `journalctl -u tree-push -f`. Tests: `npm test`.
