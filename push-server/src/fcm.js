// firebase-admin wrapper. Without GOOGLE_APPLICATION_CREDENTIALS it runs in dry-run mode (logs only).
import fs from 'node:fs';

const DEAD = new Set(['messaging/registration-token-not-registered', 'messaging/invalid-registration-token']);

export async function createSender() {
  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!cred || !fs.existsSync(cred)) {
    console.warn('[fcm] no service-account file (GOOGLE_APPLICATION_CREDENTIALS) — dry run, nothing is sent');
    return { enabled: false, send: async (tokens, msg) => (console.log('[fcm] dry run', tokens.length, msg.title), { sent: 0, dead: [] }) };
  }
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getMessaging } = await import('firebase-admin/messaging');
  initializeApp({ credential: applicationDefault() });
  const messaging = getMessaging();
  return {
    enabled: true,
    async send(tokens, msg) {
      let sent = 0;
      const dead = [];
      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        const res = await messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title: msg.title, body: msg.body },
          data: { category: msg.category, level: String(msg.level) },
          android: { priority: 'high', notification: { channelId: 'weather-warnings', tag: `warn-${msg.category}` } },
        });
        sent += res.successCount;
        res.responses.forEach((r, j) => {
          if (!r.success && DEAD.has(r.error?.code)) dead.push(batch[j]);
        });
      }
      return { sent, dead };
    },
  };
}
