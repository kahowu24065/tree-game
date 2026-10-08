/**
 * 1.4.54 iCloud save sync (iOS only). The whole game state (every persisted `sekai-tree-*` / `yiri-yisyu-*` key except
 * device-only ones) is packed into one value in NSUbiquitousKeyValueStore (native plugin `CloudKV`, ios branch), in
 * the user's own iCloud — never on our servers. Android uses the system Auto Backup instead (manifest rules).
 *
 * Rules (stamp = the 1.4.42/1.4.44 write stamp, `sekai-tree-stamp`):
 * - Boot: no local save → restore the cloud copy. Cloud strictly newer and this device already synced → restore.
 *   This device never synced yet (fresh install / first 1.4.54 launch) and the cloud has a save while the local tree is
 *   already planted → ask the player (never silently overwrite either side).
 * - A newer local save is never overwritten. Uploads (debounced, on every write) only after the device is "linked":
 *   it restored, confirmed the cloud copy matches, or saw no cloud save for a while after launch.
 * - An upload is skipped when the cloud copy is newer than ours (another device played later): we ask instead.
 */
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { STAMP_KEY, isPersistKey } from './persist';
import { kvGet, kvRemove, kvSet, setKvListener } from './kv';

export const CLOUD_KEY = 'sekai-tree-cloud-v1';
/** Local-only: this device has synced with iCloud at least once. */
export const LINK_KEY = 'sekai-tree-cloud-linked';
/** KVS: 1 MB per value and 1 MB in total. Stay well below. */
export const CLOUD_MAX = 900_000;
/** Never leave the device: stamps, probes, push token, permission gate, dev panel, our own flags. */
const LOCAL_ONLY = new Set([STAMP_KEY, LINK_KEY, CLOUD_KEY, 'sekai-tree-mirror-probe', 'sekai-tree-push-token', 'sekai-tree-perms-ready', 'sekai-tree-dev']);

export function isCloudKey(key: string): boolean {
  return isPersistKey(key) && !LOCAL_ONLY.has(key) && !key.startsWith('sekai-tree-cloud');
}

export interface CloudBlob {
  v: 1;
  stamp: number;
  at: string;
  /** True when `data` is base64(deflate-raw(JSON)); false = plain JSON (iOS < 16.4 has no CompressionStream). */
  z: boolean;
  data: string;
}

export interface CloudSave {
  stamp: number;
  at: string;
  keys: Record<string, string>;
}

export type CloudPlan = 'none' | 'restore' | 'keep' | 'link' | 'ask';

/** Local game keys whose presence means "this device has a save". */
const SAVE_KEYS = ['sekai-tree-v2', 'sekai-tree-grove'];

function started(keys: Record<string, string>): boolean {
  try {
    const s = JSON.parse(keys['sekai-tree-v2'] ?? 'null') as { started?: boolean } | null;
    if (s?.started) return true;
  } catch {
    /* unreadable save: treat as not started */
  }
  try {
    const g = JSON.parse(keys['sekai-tree-grove'] ?? 'null') as { home?: { started?: boolean } } | null;
    return Boolean(g?.home?.started);
  } catch {
    return false;
  }
}

/**
 * What to do with a cloud copy. `fresh` = the change came from iCloud's initial sync / an account change, which is
 * treated like an unlinked device.
 */
export function planCloud(local: Record<string, string>, localStamp: number, cloud: CloudSave | null, linked: boolean, fresh = false): CloudPlan {
  if (!cloud || !SAVE_KEYS.some((k) => cloud.keys[k])) return 'none';
  if (!SAVE_KEYS.some((k) => local[k])) return 'restore';
  if (!started(local) && started(cloud.keys)) return 'restore';
  if (linked && !fresh) return cloud.stamp > localStamp ? 'restore' : 'keep';
  if (sameSave(local, cloud.keys)) return 'link';
  return started(cloud.keys) ? 'ask' : 'link';
}

function sameSave(a: Record<string, string>, b: Record<string, string>): boolean {
  return SAVE_KEYS.every((k) => (a[k] ?? '') === (b[k] ?? ''));
}

/** Keys to write / remove locally to adopt a cloud copy (stale local game keys that the cloud does not have go). */
export function restoreOps(local: Record<string, string>, cloud: CloudSave): { set: [string, string][]; remove: string[] } {
  const set = Object.entries(cloud.keys).filter(([k]) => isCloudKey(k));
  const remove = Object.keys(local).filter((k) => isCloudKey(k) && !(k in cloud.keys));
  return { set, remove };
}

export function pickCloudKeys(local: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(local).sort()) if (isCloudKey(k)) out[k] = local[k]!;
  return out;
}

function toB64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const b = atob(s);
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function packCloud(keys: Record<string, string>, stamp: number, now = new Date()): Promise<string> {
  const json = JSON.stringify(keys);
  let blob: CloudBlob = { v: 1, stamp, at: now.toISOString(), z: false, data: json };
  if (typeof CompressionStream === 'function') {
    try {
      blob = { ...blob, z: true, data: toB64(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw'))) };
    } catch {
      /* keep plain JSON */
    }
  }
  return JSON.stringify(blob);
}

export async function unpackCloud(raw: string | null | undefined): Promise<CloudSave | null> {
  if (!raw) return null;
  try {
    const blob = JSON.parse(raw) as CloudBlob;
    if (blob?.v !== 1 || typeof blob.data !== 'string') return null;
    const json = blob.z ? new TextDecoder().decode(await pipe(fromB64(blob.data), new DecompressionStream('deflate-raw'))) : blob.data;
    const keys = JSON.parse(json) as Record<string, string>;
    if (!keys || typeof keys !== 'object') return null;
    return { stamp: Number(blob.stamp) || 0, at: String(blob.at ?? ''), keys };
  } catch {
    return null;
  }
}

/* ---------- native glue (iOS) ---------- */

interface CloudKVPlugin {
  status(): Promise<{ available: boolean; initialSync: boolean; lastReason: number }>;
  get(opts: { key: string }): Promise<{ value: string | null }>;
  set(opts: { key: string; value: string }): Promise<{ ok: boolean }>;
  addListener(event: 'change', fn: (e: { reason: number; keys: string[] }) => void): Promise<PluginListenerHandle>;
}

const CloudKV = registerPlugin<CloudKVPlugin>('CloudKV');

/** NSUbiquitousKeyValueStore change reasons. */
const REASON = { server: 0, initial: 1, quota: 2, account: 3 } as const;

export interface CloudInfo {
  platform: string;
  enabled: boolean;
  available: boolean | null;
  linked: boolean;
  plan: string;
  cloudStamp: number;
  cloudAt: string;
  bytes: number;
  lastRead: number;
  lastWrite: number;
  writes: number;
  skipped: string;
  error: string;
  events: string[];
}

export const cloudInfo: CloudInfo = {
  platform: 'web',
  enabled: false,
  available: null,
  linked: false,
  plan: '-',
  cloudStamp: 0,
  cloudAt: '',
  bytes: 0,
  lastRead: 0,
  lastWrite: 0,
  writes: 0,
  skipped: '',
  error: '',
  events: [],
};

function note(ev: string): void {
  cloudInfo.events.push(`${new Date().toISOString().slice(11, 19)} ${ev}`);
  if (cloudInfo.events.length > 12) cloudInfo.events.shift();
}

function snapshot(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k !== null && isPersistKey(k)) out[k] = localStorage.getItem(k) ?? '';
  }
  return out;
}

const localStamp = () => Number(kvGet(STAMP_KEY)) || 0;
const isLinked = () => kvGet(LINK_KEY) === '1';

function setLinked(): void {
  if (isLinked()) return;
  try {
    kvSet(LINK_KEY, '1');
  } catch {
    /* quota */
  }
  cloudInfo.linked = true;
  note('linked');
}

async function readCloud(): Promise<CloudSave | null> {
  const { value } = await CloudKV.get({ key: CLOUD_KEY });
  cloudInfo.lastRead = Date.now();
  const save = await unpackCloud(value);
  cloudInfo.bytes = value?.length ?? 0;
  cloudInfo.cloudStamp = save?.stamp ?? 0;
  cloudInfo.cloudAt = save?.at ?? '';
  return save;
}

function applyRestore(cloud: CloudSave): void {
  const ops = restoreOps(snapshot(), cloud);
  for (const k of ops.remove) kvRemove(k);
  for (const [k, v] of ops.set) kvSet(k, v);
  setLinked();
  note(`restored ${ops.set.length} keys (cloud ${cloud.at})`);
}

/** Called when the cloud copy should be offered instead of silently taken: resolve true to restore. */
let asker: ((cloud: CloudSave) => Promise<boolean>) | null = null;
let reloader: () => void = () => location.reload();
let pendingAsk: CloudSave | null = null;
let asking = false;

export function cloudEnabled(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

let timer = 0;
let linkTimer = 0;
let uploading: Promise<void> | null = null;

async function upload(why: string): Promise<void> {
  if (!cloudInfo.enabled || !isLinked() || pendingAsk) return;
  if (uploading) {
    await uploading;
  }
  uploading = (async () => {
    try {
      const stamp = localStamp();
      const cloud = await readCloud();
      if (cloud && cloud.stamp > stamp) {
        cloudInfo.skipped = `cloud newer (${cloud.at}) — not overwritten`;
        await offer(cloud, 'newer elsewhere');
        return;
      }
      const keys = pickCloudKeys(snapshot());
      const raw = await packCloud(keys, stamp);
      if (raw.length > CLOUD_MAX) {
        cloudInfo.skipped = `too big (${raw.length} chars)`;
        note(`skip upload: too big ${raw.length}`);
        return;
      }
      if (cloud && cloud.stamp === stamp && sameSave(keys, cloud.keys)) return;
      const res = await CloudKV.set({ key: CLOUD_KEY, value: raw });
      cloudInfo.lastWrite = Date.now();
      cloudInfo.writes++;
      cloudInfo.bytes = raw.length;
      cloudInfo.cloudStamp = stamp;
      cloudInfo.skipped = '';
      if (!res.ok) note(`upload (${why}) queued — synchronize() returned false`);
    } catch (e) {
      cloudInfo.error = String(e).slice(0, 120);
      note(`upload error ${cloudInfo.error}`);
    }
  })().finally(() => {
    uploading = null;
  });
  return uploading;
}

/**
 * Upload after persisted writes: throttled (the game persists often), so at most one upload per CLOUD_EVERY_MS
 * plus one on going to the background. KVS keeps the value locally and syncs it when iCloud allows.
 */
export const CLOUD_EVERY_MS = 10_000;
export function scheduleCloud(): void {
  if (!cloudInfo.enabled || timer) return;
  timer = window.setTimeout(() => {
    timer = 0;
    void upload('write');
  }, CLOUD_EVERY_MS);
}

/** Going to the background: push now. */
export function flushCloud(): Promise<void> {
  if (!cloudInfo.enabled) return Promise.resolve();
  window.clearTimeout(timer);
  timer = 0;
  return upload('flush');
}

async function offer(cloud: CloudSave, why: string): Promise<void> {
  pendingAsk = cloud;
  cloudInfo.plan = `ask (${why})`;
  if (!asker || asking) return;
  asking = true;
  try {
    const yes = await asker(cloud);
    pendingAsk = null;
    if (yes) {
      applyRestore(cloud);
      reloader();
      return;
    }
    setLinked();
    note('kept this device');
    await upload('kept');
  } finally {
    asking = false;
  }
}

/** Re-check the cloud (resume / external change). */
async function recheck(fresh: boolean, why: string): Promise<void> {
  if (!cloudInfo.enabled || asking) return;
  try {
    const cloud = await readCloud();
    const plan = planCloud(snapshot(), localStamp(), cloud, isLinked(), fresh);
    cloudInfo.plan = `${plan} (${why})`;
    if (plan === 'link') setLinked();
    else if (plan === 'restore' || plan === 'ask') await offer(cloud!, why);
  } catch (e) {
    cloudInfo.error = String(e).slice(0, 120);
  }
}

/**
 * Boot (before the save is read): adopt the cloud copy when the rules say so. Waits up to `waitMs` for iCloud when
 * this device has no save yet (fresh install), since the first sync can lag the launch slightly.
 */
export async function bootCloud(waitMs = 2500): Promise<void> {
  cloudInfo.platform = (() => {
    try {
      return Capacitor.getPlatform();
    } catch {
      return 'web';
    }
  })();
  if (!cloudEnabled()) return;
  cloudInfo.enabled = true;
  cloudInfo.linked = isLinked();
  setKvListener((key) => {
    if (isCloudKey(key)) scheduleCloud();
  });
  try {
    const st = await CloudKV.status();
    cloudInfo.available = st.available;
    if (!st.available) {
      cloudInfo.plan = 'no iCloud account';
      note('iCloud not signed in / disabled for this app');
    }
    const local = snapshot();
    let cloud = await readCloud();
    if (!cloud && !SAVE_KEYS.some((k) => local[k]) && st.available) {
      const until = Date.now() + waitMs;
      while (!cloud && Date.now() < until) {
        await new Promise((r) => setTimeout(r, 400));
        cloud = await readCloud();
      }
    }
    const plan = planCloud(local, localStamp(), cloud, isLinked());
    cloudInfo.plan = `${plan} (boot)`;
    note(`boot plan ${plan}${cloud ? ` · cloud ${cloud.at}` : ' · no cloud save'}`);
    if (plan === 'restore') applyRestore(cloud!);
    else if (plan === 'link') setLinked();
    else if (plan === 'ask') pendingAsk = cloud;
    else if (plan === 'none' && !isLinked()) {
      // Nothing in iCloud yet: link after a quiet period, unless a late first sync brings a save.
      linkTimer = window.setTimeout(() => {
        void (async () => {
          if (isLinked() || pendingAsk) return;
          const later = await readCloud().catch(() => null);
          if (later) await recheck(true, 'late first sync');
          else {
            setLinked();
            await upload('first');
          }
        })();
      }, 20_000);
    }
    await CloudKV.addListener('change', (e) => {
      note(`change reason ${e.reason}`);
      if (e.reason === REASON.quota) cloudInfo.error = 'iCloud key-value quota exceeded';
      if (e.keys && e.keys.length && !e.keys.includes(CLOUD_KEY)) return;
      void recheck(e.reason === REASON.initial || e.reason === REASON.account, `change ${e.reason}`);
    });
  } catch (e) {
    cloudInfo.error = String(e).slice(0, 120);
    note(`boot error ${cloudInfo.error}`);
  }
}

/**
 * After the UI is up: the app supplies the question (a modal) and how to reload. A boot-time conflict is asked now.
 */
export function startCloud(opts: { ask: (cloud: CloudSave) => Promise<boolean>; reload: () => void }): void {
  asker = opts.ask;
  reloader = opts.reload;
  if (!cloudInfo.enabled) return;
  if (pendingAsk) void offer(pendingAsk, 'boot');
  else if (isLinked()) void upload('start');
}

/** App back in the foreground: another device may have played. */
export function resumeCloud(): void {
  if (!cloudInfo.enabled) return;
  void recheck(false, 'resume');
}

export function cloudDiagLines(): string[] {
  if (!cloudInfo.enabled) {
    return [cloudInfo.platform === 'android' ? 'cloud: Android Auto Backup (Google account, system-managed; restores on reinstall)' : `cloud: off (${cloudInfo.platform})`];
  }
  const t = (ms: number) => (ms ? new Date(ms).toLocaleTimeString() : '-');
  return [
    `iCloud: account ${cloudInfo.available == null ? '?' : cloudInfo.available ? 'yes' : 'NO'} · linked ${cloudInfo.linked ? 'yes' : 'no'} · plan ${cloudInfo.plan}`,
    `iCloud copy: stamp ${cloudInfo.cloudStamp || '-'} (${cloudInfo.cloudAt || '-'}) · ${cloudInfo.bytes} chars · local stamp ${localStamp() || '-'}`,
    `iCloud io: last read ${t(cloudInfo.lastRead)} · last write ${t(cloudInfo.lastWrite)} · writes ${cloudInfo.writes}${cloudInfo.skipped ? ` · skipped: ${cloudInfo.skipped}` : ''}${cloudInfo.error ? ` · error: ${cloudInfo.error}` : ''}`,
    ...cloudInfo.events.map((e) => `  ${e}`),
  ];
}

export function clearCloudTimers(): void {
  window.clearTimeout(timer);
  timer = 0;
  window.clearTimeout(linkTimer);
}
