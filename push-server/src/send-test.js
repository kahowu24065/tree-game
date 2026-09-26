// Admin-only test push to every registered device (no HTTP endpoint). On the VM:
//   sudo -u treepush GOOGLE_APPLICATION_CREDENTIALS=/etc/tree-push/service-account.json DATA_DIR=/var/lib/tree-push \
//     /opt/tree-push/node/bin/node /opt/tree-push/app/src/send-test.js "標題" "內容"
// Read-only on the token store (the running service owns it; dead tokens are pruned on its next real push).
import path from 'node:path';
import { TokenStore } from './tokens.js';
import { createSender } from './fcm.js';

const [title = '世界之樹：測試通知', body = '收到呢條就代表天氣警告推送運作正常。'] = process.argv.slice(2);
const store = new TokenStore(path.join(process.env.DATA_DIR || path.resolve('data'), 'tokens.json'));
const fcm = await createSender();
if (!fcm.enabled) {
  console.error('FCM not configured (GOOGLE_APPLICATION_CREDENTIALS)');
  process.exit(1);
}
const tokens = store.tokens();
if (!tokens.length) {
  console.log('No registered devices.');
  process.exit(0);
}
const { sent, dead } = await fcm.send(tokens, { title, body, category: 'test', level: 0 });
console.log(`Sent to ${sent}/${tokens.length} devices; ${dead.length} invalid token(s).`);
