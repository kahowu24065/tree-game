#!/usr/bin/env bash
# 1.4.38: deploy dist/ to Cloudflare Pages (direct upload), project `sekai-tree` → https://sekai-tree.pages.dev/
# Needs CLOUDFLARE_API_TOKEN (Account → Cloudflare Pages → Edit + Account Settings → Read). CLOUDFLARE_ACCOUNT_ID is
# looked up from the token when not set. Wrangler 4 needs Node ≥ 22 (WRANGLER / NODE22_BIN override the paths).
# Run `npm run build` first. Usage: scripts/deploy-pages.sh [project]
set -euo pipefail
P=${1:-sekai-tree}
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN not set}"
cd "$(dirname "$0")/.."
[ -f dist/index.html ] || { echo "dist/ missing: npm run build first" >&2; exit 1; }
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  CLOUDFLARE_ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/accounts \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s).result||[];process.stdout.write(r[0]?.id||"")})')
  [ -n "$CLOUDFLARE_ACCOUNT_ID" ] || { echo "token sees no Cloudflare account" >&2; exit 1; }
fi
export CLOUDFLARE_ACCOUNT_ID
export PATH="${NODE22_BIN:-/workspace/tools/node-v22.20.0-linux-x64/bin}:$PATH"
W=${WRANGLER:-/workspace/tools/wrangler/node_modules/.bin/wrangler}
$W pages project list 2>/dev/null | grep -q " $P " || $W pages project create "$P" --production-branch main
$W pages deploy dist --project-name "$P" --branch main --commit-hash "$(git rev-parse HEAD)" \
  --commit-message "$(git log -1 --format=%s | cut -c1-200)" --commit-dirty=true
