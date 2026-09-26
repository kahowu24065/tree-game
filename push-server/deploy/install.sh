#!/usr/bin/env bash
# Install / update the 世界之樹 push relay (Ubuntu or Oracle Linux, arm64 or x64). Run as root from this folder:
#   sudo PROXY=nginx DOMAIN=158-101-140-210.sslip.io bash deploy/install.sh
# PROXY=nginx : add a separate nginx site + certbot cert (VM already runs nginx on 80/443 — the current setup)
# PROXY=caddy : fresh VM with nothing on 80/443 — Caddy + auto HTTPS, opens 80/443 in the OS firewall
# PROXY=none  : app only
# Re-running is safe (updates code, keeps tokens + last-seen state in /var/lib/tree-push).
set -euo pipefail
DOMAIN="${DOMAIN:-158-101-140-210.sslip.io}"
PROXY="${PROXY:-nginx}"
NODE_VER="${NODE_VER:-v20.20.2}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
case "$(uname -m)" in aarch64|arm64) ARCH=arm64 ;; x86_64) ARCH=x64 ;; *) echo "unsupported arch"; exit 1 ;; esac

echo "== Node.js ($NODE_VER, standalone in /opt/tree-push/node)"
if [ "$(/opt/tree-push/node/bin/node -v 2>/dev/null)" != "$NODE_VER" ]; then
  curl -fsSL "https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-linux-$ARCH.tar.xz" -o /tmp/tree-push-node.tar.xz
  rm -rf /opt/tree-push/node && mkdir -p /opt/tree-push/node
  tar -xJf /tmp/tree-push-node.tar.xz -C /opt/tree-push/node --strip-components=1 && rm /tmp/tree-push-node.tar.xz
fi
/opt/tree-push/node/bin/node -v

echo "== App"
id treepush >/dev/null 2>&1 || useradd --system --home /var/lib/tree-push --shell /usr/sbin/nologin treepush
mkdir -p /opt/tree-push/app /var/lib/tree-push /etc/tree-push
cp -r "$SRC/package.json" "$SRC/package-lock.json" "$SRC/src" /opt/tree-push/app/
(cd /opt/tree-push/app && PATH=/opt/tree-push/node/bin:$PATH npm ci --omit=dev --no-audit --no-fund)
chown -R treepush:treepush /var/lib/tree-push
if [ -f /etc/tree-push/service-account.json ]; then
  chown treepush:treepush /etc/tree-push/service-account.json && chmod 600 /etc/tree-push/service-account.json
else
  echo "!! /etc/tree-push/service-account.json missing — log-only mode (no pushes) until you add it"
fi
cp "$SRC/deploy/tree-push.service" /etc/systemd/system/tree-push.service
install -m 755 "$SRC/deploy/tree-push-test" /usr/local/bin/tree-push-test
systemctl daemon-reload
systemctl enable tree-push >/dev/null 2>&1
systemctl restart tree-push
sleep 3
curl -fsS http://127.0.0.1:8091/health && echo

if [ "$PROXY" = nginx ]; then
  echo "== nginx site (own file) + certbot"
  if [ ! -f /etc/nginx/sites-available/tree-push ]; then
    sed "s/158-101-140-210.sslip.io/$DOMAIN/" "$SRC/deploy/nginx-tree-push.conf" > /etc/nginx/sites-available/tree-push
    ln -sf /etc/nginx/sites-available/tree-push /etc/nginx/sites-enabled/tree-push
    if ! nginx -t; then rm -f /etc/nginx/sites-enabled/tree-push /etc/nginx/sites-available/tree-push; echo "nginx -t failed, reverted"; exit 1; fi
    systemctl reload nginx
  fi
  command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect --keep-until-expiring
elif [ "$PROXY" = caddy ]; then
  echo "== Caddy"
  CADDY_ARCH=$([ "$ARCH" = x64 ] && echo amd64 || echo arm64)
  command -v caddy >/dev/null || { curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=$CADDY_ARCH" -o /usr/local/bin/caddy; chmod 755 /usr/local/bin/caddy; }
  id caddy >/dev/null 2>&1 || useradd --system --home /var/lib/caddy --shell /usr/sbin/nologin caddy
  mkdir -p /etc/caddy /var/lib/caddy && chown -R caddy:caddy /var/lib/caddy
  printf '%s {\n\treverse_proxy 127.0.0.1:8091\n}\n' "$DOMAIN" > /etc/caddy/Caddyfile
  cp "$SRC/deploy/caddy.service" /etc/systemd/system/caddy.service
  command -v setsebool >/dev/null && setsebool -P httpd_can_network_connect 1 2>/dev/null || true
  if command -v firewall-cmd >/dev/null && systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http --add-service=https && firewall-cmd --reload
  elif command -v iptables >/dev/null; then
    for p in 80 443; do
      iptables -C INPUT -p tcp --dport $p -m state --state NEW -j ACCEPT 2>/dev/null ||
        iptables -I INPUT "$(iptables -L INPUT --line-numbers | awk '$2=="REJECT"{print $1; exit}' | grep . || echo 1)" \
          -p tcp --dport $p -m state --state NEW -j ACCEPT
    done
    if command -v netfilter-persistent >/dev/null; then netfilter-persistent save; else mkdir -p /etc/iptables && iptables-save > /etc/iptables/rules.v4; fi
  fi
  systemctl daemon-reload && systemctl enable --now caddy && systemctl restart caddy
fi
echo "Done. Check: curl https://$DOMAIN/health"
