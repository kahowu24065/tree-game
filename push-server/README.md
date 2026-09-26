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

## Deploy (Oracle VM, Ubuntu or Oracle Linux)
1. Oracle console → VCN → security list: ingress TCP 80 and 443 from 0.0.0.0/0.
2. Copy this folder to the VM, put the Firebase service-account JSON at `/etc/tree-push/service-account.json`.
3. `sudo DOMAIN=158-101-140-210.sslip.io bash deploy/install.sh` — installs Node 20 (official tarball), the app
   under `/opt/tree-push-server` (systemd `tree-push`, user `treepush`, data in `/var/lib/tree-push`), Caddy with an
   automatic Let's Encrypt cert for the sslip.io name, and opens 80/443 in iptables/firewalld persistently.
4. `curl https://158-101-140-210.sslip.io/health`

Logs: `journalctl -u tree-push -f`. Tests: `npm test`.
