import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { isNative } from './platform';

/** tree-push-server (Oracle VM, Caddy HTTPS). Sends a push when HKO issues / upgrades a warning. */
export const PUSH_SERVER = 'https://158-101-140-210.sslip.io';
export const PUSH_CHANNEL = 'weather-warnings';
const TOKEN_KEY = 'sekai-tree-push-token';

let listening = false;

async function post(path: string, body: unknown): Promise<void> {
  try {
    await fetch(`${PUSH_SERVER}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    /* offline / server down: retried on the next app start */
  }
}

async function listen(): Promise<void> {
  if (listening) return;
  listening = true;
  // Fires after register() on every start and whenever FCM rotates the token → (re-)register with the server.
  await PushNotifications.addListener('registration', async ({ value }) => {
    let appVersion = '';
    try {
      appVersion = (await App.getInfo()).version;
    } catch {
      /* ignore */
    }
    localStorage.setItem(TOKEN_KEY, value);
    await post('/register', { token: value, platform: 'android', appVersion });
  });
  await PushNotifications.addListener('registrationError', () => undefined);
}

/**
 * Native only: follow the 設定 提醒通知 switch. On → permission, high-importance channel, FCM register (token sent
 * to the server). Off → tell the server to forget the token and drop it. Tapping a push just opens the app.
 */
export async function syncPush(enabled: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    if (!enabled) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) await post('/unregister', { token });
      localStorage.removeItem(TOKEN_KEY);
      await PushNotifications.unregister();
      return;
    }
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return;
    await PushNotifications.createChannel({ id: PUSH_CHANNEL, name: '天氣警告', description: '天文台警告生效時提醒你照顧棵樹', importance: 5, visibility: 1, vibration: true });
    await listen();
    await PushNotifications.register();
  } catch {
    /* push is best-effort (e.g. build without google-services.json) */
  }
}
