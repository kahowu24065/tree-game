#!/usr/bin/env bash
# Install / update the 世界之樹 push relay on an Ubuntu or Oracle Linux VM (arm64 or x64). Run as root from the
# repo folder:  sudo DOMAIN=158-101-140-210.sslip.io bash deploy/install.sh
# Re-running is safe (updates code, keeps tokens + last-seen state in /var/lib/tree-push).
set -euo pipefail
DOMAIN="${DOMAIN:-158-101-140-210.sslip.io}"
NODE_VER="${NODE_VER:-v20.19.2}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
case "$(uname -m)" in aarch64|arm64) ARCH=arm64 ;; x86_64) ARCH=x64 ;; *) echo "unsupported arch"; exit 1 ;; esac
CADDY_ARCH=$([ "$ARCH" = x64 ] && echo amd64 || echo arm64)

echo "== Node.js 20"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL "https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-linux-$ARCH.tar.xz" -o /tmp/node.tar.xz
  rm -rf /opt/node20 && mkdir -p /opt/node20 && tar -xJf /tmp/node.tar.xz -C /opt/node20 --strip-components=1
  ln -sf /opt/node20/bin/node /usr/local/bin/node
  ln -sf /opt/node20/bin/npm /usr/local/bin/npm
fi
node -v

echo "== App"
id treepush >/dev/null 2>&1 || useradd --system --home /var/lib/tree-push --shell /usr/sbin/nologin treepush
mkdir -p /opt/tree-push-server /var/lib/tree-push /etc/tree-push
cp -r "$SRC/package.json" "$SRC/package-lock.json" "$SRC/src" /opt/tree-push-server/
(cd /opt/tree-push-server && /usr/local/bin/npm ci --omit=dev --no-audit --no-fund)
chown -R treepush:treepush /var/lib/tree-push
if [ -f /etc/tree-push/service-account.json ]; then
  chown treepush:treepush /etc/tree-push/service-account.json && chmod 600 /etc/tree-push/service-account.json
else
  echo "!! /etc/tree-push/service-account.json missing — server runs in dry-run (no pushes) until you add it"
fi
cp "$SRC/deploy/tree-push.service" /etc/systemd/system/tree-push.service

echo "== Caddy (HTTPS via sslip.io)"
if ! command -v caddy >/dev/null; then
  curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=$CADDY_ARCH" -o /usr/local/bin/caddy
  chmod 755 /usr/local/bin/caddy
fi
id caddy >/dev/null 2>&1 || useradd --system --home /var/lib/caddy --shell /usr/sbin/nologin caddy
mkdir -p /etc/caddy /var/lib/caddy && chown -R caddy:caddy /var/lib/caddy
cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
	reverse_proxy 127.0.0.1:8080
}
CADDY
cp "$SRC/deploy/caddy.service" /etc/systemd/system/caddy.service
# Oracle Linux (SELinux): let Caddy proxy to a local port.
command -v setsebool >/dev/null && setsebool -P httpd_can_network_connect 1 2>/dev/null || true

echo "== OS firewall: open 80/443 (8080 stays local-only)"
if command -v firewall-cmd >/dev/null && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http --add-service=https && firewall-cmd --reload
elif command -v iptables >/dev/null; then
  for p in 80 443; do
    iptables -C INPUT -p tcp --dport $p -m state --state NEW -j ACCEPT 2>/dev/null ||
      iptables -I INPUT "$(iptables -L INPUT --line-numbers | awk '$2=="REJECT"{print $1; exit}' | grep . || echo 1)" \
        -p tcp --dport $p -m state --state NEW -j ACCEPT   # before Oracle's REJECT rule
  done
  if command -v netfilter-persistent >/dev/null; then netfilter-persistent save
  else mkdir -p /etc/iptables && iptables-save > /etc/iptables/rules.v4; fi
fi

systemctl daemon-reload
systemctl enable --now tree-push caddy
systemctl restart tree-push caddy
sleep 3
curl -fsS http://127.0.0.1:8080/health && echo
echo "Done. Check: curl https://$DOMAIN/health  (Oracle VCN security list must allow TCP 80+443 ingress)"
