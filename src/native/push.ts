import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { isNative } from './platform';
import { getLocale, t as tl } from '../i18n';

/** tree-push-server (Oracle VM, Caddy HTTPS). Sends a push when HKO issues / upgrades a warning. */
export const PUSH_SERVER = 'https://158-101-140-210.sslip.io';
export const PUSH_CHANNEL = 'weather-warnings';
const TOKEN_KEY = 'sekai-tree-push-token';

let listening = false;

/** Game state the server needs to skip devices that already did today's 應急行動 (POST /state). */
export interface PushState {
  day: string;
  tz: string;
  done: { heat: boolean; drain: boolean; reinforce: boolean; warm: boolean };
  region: { lat: number; lon: number };
  isHK: boolean;
  /** Inside Macau: the server polls SMG on the same cadence as HKO, not the slower cell poll. */
  isMO?: boolean;
  /** v1.4.14 in Taiwan: the server checks 中央氣象署 warnings for this county / town (non-HK push rules). */
  isTW?: boolean;
  twCounty?: string;
  twTown?: string;
  rUnlocked: boolean;
  alive: boolean;
  /** v1.4: tree condition for the push text (dead / 瀕死 trees still get every warning). */
  tree: 'ok' | 'dying' | 'dead';
  /** 抗風力 R (rounded), so the server can mention 倒塌風險 for wind warnings. */
  resist: number;
  /** v1.4.19: game language (zh-TW / zh-HK / zh-CN / en) for the push texts. Filled in here. */
  locale?: string;
}

let latest: PushState | null = null;
let lastSent = '';
let timer: ReturnType<typeof setTimeout> | null = null;

function flushState(): void {
  timer = null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || !latest) return;
  const json = JSON.stringify(latest);
  if (json === lastSent) return;
  lastSent = json;
  void post('/state', { token, ...latest });
}

/** Native only: report state changes (debounced 3 s, only when something changed). */
export function reportPushState(state: PushState): void {
  if (!isNative()) return;
  latest = { ...state, locale: getLocale(), region: { lat: Math.round(state.region.lat * 2) / 2, lon: Math.round(state.region.lon * 2) / 2 } };
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushState, 3000);
}

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
    await post('/register', { token: value, platform: 'android', appVersion, locale: getLocale() });
    lastSent = '';
    flushState();
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
      lastSent = '';
      await PushNotifications.unregister();
      return;
    }
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return;
    await PushNotifications.createChannel({ id: PUSH_CHANNEL, name: tl('ui.267'), description: tl('push.001'), importance: 5, visibility: 1, vibration: true });
    await listen();
    await PushNotifications.register();
  } catch {
    /* push is best-effort (e.g. build without google-services.json) */
  }
}
