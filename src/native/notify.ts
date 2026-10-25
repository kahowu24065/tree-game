import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './platform';
import { t as tl } from '../i18n';
import { permsReady } from './permGate';
import { W_OPTIMAL } from '../balance';

export const NOTIFY_KEY = 'sekai-tree-notify';
const HOUR = 3600_000;
const DAY_MIN = 24 * 60;
/** Quiet hours for hourly moisture reminders: [0, 8) local. */
const WATER_QUIET_START = 0;
const WATER_QUIET_END = 8;
/** How many daytime hourly slots to pre-schedule (rescheduled whenever the app opens). */
const WATER_HOUR_MAX = 16;
/** Fixed ids so each reschedule replaces the previous set. Hourly moisture uses 200–215. */
export const NOTIFY_IDS = {
  careToday: 101,
  careTomorrow: 102,
  dying12: 103,
  dying2: 104,
  weather: 105,
  nest: 106,
  healthLow: 107,
  waterLow: 108,
  waterLowHour: 200,
} as const;

export interface NotifyInput {
  now: number;
  /** Real ms until tonight's settlement (midnight in the game's timezone). */
  msToSettlement: number;
  started: boolean;
  over: boolean;
  wateredToday: boolean;
  fertilizedToday: boolean;
  /** v1.4.18: tonight's settlement time when its projected 健康 is 0 (null = safe tonight / already 瀕死). */
  healthZeroAt?: number | null;
  /** v1.4.23: tonight's projected water (after the day's drift) is in the 乾旱 tier, so midnight costs health. */
  waterLowTonight?: boolean;
  /** v1.4.76: current moisture; with waterLowHourly, schedule every hour while below healthy range. */
  moisture?: number;
  /** v1.4.76: independent 「水份不足提醒」 toggle (default on). */
  waterLowHourly?: boolean;
  /** Real timestamp when 瀕死 runs out (null = not dying). */
  dyingEndsAt: number | null;
  /** Labels of active warnings whose emergency action is still undone (e.g. 酷熱警告 → 酷熱澆水). */
  pendingEmergencies: string[];
  /** Only plan the weather reminder when the app is going to the background. */
  background: boolean;
  /** Real timestamp when the current egg hatches. Null when there is nothing to wait for. Scheduled on the phone, not via a server. */
  hatchAt: number | null;
}

export interface PlannedNotice {
  id: number;
  at: number;
  title: string;
  body: string;
}

/** Local minutes from midnight derived from ms until settlement (same clock as the game). */
export function localMinutesFromSettlement(msToSettlement: number): number {
  const m = Math.round(DAY_MIN - msToSettlement / 60_000);
  return ((m % DAY_MIN) + DAY_MIN) % DAY_MIN;
}

/**
 * Absolute timestamps for the next daytime hours while W is low.
 * Skips local 00:00–08:00; at most WATER_HOUR_MAX slots (one-shot chain; cancelled on reschedule).
 */
export function planWaterLowHours(now: number, msToSettlement: number): number[] {
  const mins = localMinutesFromSettlement(msToSettlement);
  const midnight = now - mins * 60_000;
  const out: number[] = [];
  for (let d = 0; d < 3 && out.length < WATER_HOUR_MAX; d++) {
    for (let hour = 0; hour < 24 && out.length < WATER_HOUR_MAX; hour++) {
      if (hour >= WATER_QUIET_START && hour < WATER_QUIET_END) continue;
      const at = midnight + d * 24 * HOUR + hour * HOUR;
      if (at > now + 60_000) out.push(at);
    }
  }
  return out;
}

function allNotifyIds(): number[] {
  const ids = Object.values(NOTIFY_IDS) as number[];
  for (let i = 0; i < WATER_HOUR_MAX; i++) ids.push(NOTIFY_IDS.waterLowHour + i);
  return [...new Set(ids)];
}

/** Pure: which reminders to schedule right now. */
export function planNotifications(i: NotifyInput): PlannedNotice[] {
  const TITLE = tl('sim.001');
  if (!i.started || i.over) return [];
  const out: PlannedNotice[] = [];
  const settle = i.now + i.msToSettlement;
  const soon = (t: number) => t > i.now + 60_000;
  const careAt = settle - 1.5 * HOUR;
  if ((!i.wateredToday || !i.fertilizedToday) && soon(careAt)) {
    const what = [!i.wateredToday && tl('ui.115'), !i.fertilizedToday && tl('ui.099')].filter(Boolean).join(tl('notify.001'));
    out.push({ id: NOTIFY_IDS.careToday, at: careAt, title: TITLE, body: tl('notify.002', { what }) });
  }
  // Tomorrow's care is certainly undone if the app is not opened again before then.
  out.push({ id: NOTIFY_IDS.careTomorrow, at: careAt + 24 * HOUR, title: TITLE, body: tl('notify.003') });
  if (i.dyingEndsAt !== null) {
    const hint = tl('notify.004');
    if (soon(i.dyingEndsAt - 12 * HOUR)) out.push({ id: NOTIFY_IDS.dying12, at: i.dyingEndsAt - 12 * HOUR, title: tl('notify.005', { TITLE }), body: tl('notify.006', { hint }) });
    if (soon(i.dyingEndsAt - 2 * HOUR)) out.push({ id: NOTIFY_IDS.dying2, at: i.dyingEndsAt - 2 * HOUR, title: tl('notify.005', { TITLE }), body: tl('notify.007', { hint }) });
  }
  if (i.dyingEndsAt === null && i.healthZeroAt != null) {
    // Tonight's settlement is projected to take 健康 to 0: warn ~3 hours before midnight.
    const at = Math.max(i.now + 5 * 60_000, i.healthZeroAt - 3 * HOUR);
    if (soon(at) && i.healthZeroAt > i.now) out.push({ id: NOTIFY_IDS.healthLow, at, title: tl('notify.008', { TITLE }), body: tl('notify.009') });
  }
  if (i.waterLowTonight && i.dyingEndsAt === null) {
    // 23:00 (one hour before settlement), once a night: the fixed id replaces any earlier plan; none after 23:00.
    const at = settle - HOUR;
    if (soon(at)) out.push({ id: NOTIFY_IDS.waterLow, at, title: tl('notify.waterLowTitle', { TITLE }), body: tl('notify.waterLowBody') });
  }
  // v1.4.76: W < healthy floor → every hour (00–08 quiet); skip while 瀕死 (dying reminders cover that).
  if (i.waterLowHourly && i.dyingEndsAt === null && (i.moisture ?? W_OPTIMAL[0]) < W_OPTIMAL[0]) {
    const slots = planWaterLowHours(i.now, i.msToSettlement);
    for (let n = 0; n < slots.length; n++) {
      out.push({
        id: NOTIFY_IDS.waterLowHour + n,
        at: slots[n]!,
        title: tl('notify.waterLowHourTitle', { TITLE }),
        body: tl('notify.waterLowHourBody'),
      });
    }
  }
  if (i.hatchAt !== null && soon(i.hatchAt)) {
    out.push({ id: NOTIFY_IDS.nest, at: i.hatchAt, title: TITLE, body: tl('notify.010') });
  }
  if (i.background && i.pendingEmergencies.length) {
    const at = i.now + HOUR;
    if (at < settle) out.push({ id: NOTIFY_IDS.weather, at, title: tl('notify.011', { TITLE }), body: tl('notify.012', { p0: i.pendingEmergencies.join(tl('ui.206')) }) });
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
  // 1.4.45: before onboarding is over, schedule only if already granted — never prompt (and don't cache).
  if (!permsReady())
    return LocalNotifications.checkPermissions()
      .then((p) => p.display === 'granted')
      .catch(() => false);
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
      await LocalNotifications.cancel({ notifications: allNotifyIds().map((id) => ({ id })) });
      if (!notifyEnabled() || !plan.length || !(await ensurePermission())) return;
      await LocalNotifications.schedule({
        notifications: plan.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: false } })),
      });
    } catch {
      /* ignore: reminders are best-effort */
    }
  });
}
