import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './platform';

export const NOTIFY_KEY = 'sekai-tree-notify';
const HOUR = 3600_000;
/** Fixed ids so each reschedule replaces the previous set. */
export const NOTIFY_IDS = { careToday: 101, careTomorrow: 102, dying12: 103, dying2: 104, weather: 105 } as const;

export interface NotifyInput {
  now: number;
  /** Real ms until tonight's settlement (midnight in the game's timezone). */
  msToSettlement: number;
  started: boolean;
  over: boolean;
  wateredToday: boolean;
  fertilizedToday: boolean;
  /** Real timestamp when 瀕死 runs out (null = not dying). */
  dyingEndsAt: number | null;
  /** Labels of active warnings whose emergency action is still undone (e.g. 酷熱警告 → 酷熱澆水). */
  pendingEmergencies: string[];
  /** Only plan the weather reminder when the app is going to the background. */
  background: boolean;
}

export interface PlannedNotice {
  id: number;
  at: number;
  title: string;
  body: string;
}

const TITLE = '世界之樹';

/** Pure: which reminders to schedule right now. */
export function planNotifications(i: NotifyInput): PlannedNotice[] {
  if (!i.started || i.over) return [];
  const out: PlannedNotice[] = [];
  const settle = i.now + i.msToSettlement;
  const soon = (t: number) => t > i.now + 60_000;
  const careAt = settle - 1.5 * HOUR;
  if ((!i.wateredToday || !i.fertilizedToday) && soon(careAt)) {
    const what = [!i.wateredToday && '澆水', !i.fertilizedToday && '施肥'].filter(Boolean).join('／');
    out.push({ id: NOTIFY_IDS.careToday, at: careAt, title: TITLE, body: `今晚結算前記得${what}！` });
  }
  // Tomorrow's care is certainly undone if the app is not opened again before then.
  out.push({ id: NOTIFY_IDS.careTomorrow, at: careAt + 24 * HOUR, title: TITLE, body: '今晚結算前記得澆水／施肥！' });
  if (i.dyingEndsAt !== null) {
    const hint = '將水分調返 50–100、養分 60 以上就救得返。';
    if (soon(i.dyingEndsAt - 12 * HOUR)) out.push({ id: NOTIFY_IDS.dying12, at: i.dyingEndsAt - 12 * HOUR, title: `${TITLE}：瀕死`, body: `棵樹瀕死，仲有大約 12 小時！${hint}` });
    if (soon(i.dyingEndsAt - 2 * HOUR)) out.push({ id: NOTIFY_IDS.dying2, at: i.dyingEndsAt - 2 * HOUR, title: `${TITLE}：瀕死`, body: `棵樹只剩大約 2 小時！${hint}` });
  }
  if (i.background && i.pendingEmergencies.length) {
    const at = i.now + HOUR;
    if (at < settle) out.push({ id: NOTIFY_IDS.weather, at, title: `${TITLE}：天氣警告`, body: `${i.pendingEmergencies.join('、')}未做，今晚結算前記得做！` });
  }
  return out;
}

export function notifyEnabled(): boolean {
  try {
    return localStorage.getItem(NOTIFY_KEY) !== '0';
  } catch {
    return true;
  }
}

let permission: Promise<boolean> | null = null;
function ensurePermission(): Promise<boolean> {
  permission ??= (async () => {
    try {
      let p = await LocalNotifications.checkPermissions();
      if (p.display === 'prompt' || p.display === 'prompt-with-rationale') p = await LocalNotifications.requestPermissions();
      return p.display === 'granted';
    } catch {
      return false;
    }
  })();
  return permission;
}

let pending: Promise<void> = Promise.resolve();
/** Native only: replace all scheduled reminders with `plan` (inexact; nothing when switched off). */
export function applyNotifications(plan: PlannedNotice[]): void {
  if (!isNative()) return;
  pending = pending.then(async () => {
    try {
      await LocalNotifications.cancel({ notifications: Object.values(NOTIFY_IDS).map((id) => ({ id })) });
      if (!notifyEnabled() || !plan.length || !(await ensurePermission())) return;
      await LocalNotifications.schedule({
        notifications: plan.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: false } })),
      });
    } catch {
      /* ignore: reminders are best-effort */
    }
  });
}
