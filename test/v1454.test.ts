// 1.4.54: iCloud save sync rules (pure parts), backup note per platform.
import { describe, expect, it } from 'vitest';
import { createGame } from '../src/sim';
import { freshMeta } from '../src/meta';
import { CLOUD_MAX, isCloudKey, packCloud, pickCloudKeys, planCloud, restoreOps, unpackCloud, type CloudSave } from '../src/native/cloud';
import { switchLocale, t } from '../src/i18n';

function saveJson(started: boolean, cm = 30): string {
  const s = createGame('2026-09-01');
  s.started = started;
  s.heightCm = cm;
  return JSON.stringify(s);
}

const cloudOf = (keys: Record<string, string>, stamp: number): CloudSave => ({ stamp, at: '2026-10-01T00:00:00Z', keys });

describe('1.4.54 iCloud plan', () => {
  const planted = { 'sekai-tree-v2': saveJson(true, 40), 'sekai-tree-stamp': '100' };
  const other = cloudOf({ 'sekai-tree-v2': saveJson(true, 90) }, 50);

  it('nothing in iCloud → none', () => {
    expect(planCloud(planted, 100, null, false)).toBe('none');
    expect(planCloud(planted, 100, cloudOf({ 'sekai-tree-locale': 'en' }, 5), true)).toBe('none');
  });
  it('no local save (reinstall / new iPhone) → restore', () => {
    expect(planCloud({}, 0, other, false)).toBe('restore');
  });
  it('local tree not planted yet while iCloud has one → restore', () => {
    expect(planCloud({ 'sekai-tree-v2': saveJson(false) }, 200, other, false)).toBe('restore');
  });
  it('linked: newer cloud restores, a newer local save is never overwritten', () => {
    expect(planCloud(planted, 100, cloudOf(other.keys, 150), true)).toBe('restore');
    expect(planCloud(planted, 100, cloudOf(other.keys, 100), true)).toBe('keep');
    expect(planCloud(planted, 100, cloudOf(other.keys, 50), true)).toBe('keep');
  });
  it('not linked yet with a different planted tree in iCloud → ask (either stamp order)', () => {
    expect(planCloud(planted, 100, cloudOf(other.keys, 50), false)).toBe('ask');
    expect(planCloud(planted, 100, cloudOf(other.keys, 150), false)).toBe('ask');
    // iCloud initial sync / account change on a linked device counts as unlinked.
    expect(planCloud(planted, 100, cloudOf(other.keys, 50), true, true)).toBe('ask');
  });
  it('same save in iCloud → link', () => {
    expect(planCloud(planted, 100, cloudOf({ 'sekai-tree-v2': planted['sekai-tree-v2'] }, 100), false)).toBe('link');
  });
});

describe('1.4.54 iCloud payload', () => {
  it('keeps game keys and drops device-only ones', () => {
    for (const k of ['sekai-tree-stamp', 'sekai-tree-push-token', 'sekai-tree-perms-ready', 'sekai-tree-mirror-probe', 'sekai-tree-cloud-linked', 'sekai-tree-dev', 'diag-savelog']) expect(isCloudKey(k)).toBe(false);
    for (const k of ['sekai-tree-v2', 'sekai-tree-grove', 'sekai-tree-meta-v1', 'sekai-tree-locale', 'yiri-yisyu-place']) expect(isCloudKey(k)).toBe(true);
    expect(Object.keys(pickCloudKeys({ 'sekai-tree-v2': 'a', 'sekai-tree-stamp': '1', other: 'x' }))).toEqual(['sekai-tree-v2']);
  });
  it('restore writes the cloud keys and removes stale local game keys', () => {
    const ops = restoreOps({ 'sekai-tree-v2': 'old', 'sekai-tree-grove': 'g', 'sekai-tree-stamp': '9' }, cloudOf({ 'sekai-tree-v2': 'new' }, 1));
    expect(ops.set).toEqual([['sekai-tree-v2', 'new']]);
    expect(ops.remove).toEqual(['sekai-tree-grove']);
  });
  it('round-trips, and a full save (120 log lines, meta) is far below the 1 MB KVS limit', async () => {
    const s = createGame('2026-09-01');
    s.started = true;
    s.log = Array.from({ length: 120 }, (_, i) => ({ ...(s.log[0] ?? { date: '2026-09-01', kind: 'note', text: '' }), text: `第 ${i} 日：澆水、施肥，天氣晴朗，棵樹好健康。`.repeat(3) })) as typeof s.log;
    const keys = { 'sekai-tree-v2': JSON.stringify(s), 'sekai-tree-grove': JSON.stringify({ isle: 0, home: s, second: s }), 'sekai-tree-meta-v1': JSON.stringify(freshMeta()) };
    const raw = await packCloud(keys, 1234);
    expect(raw.length).toBeLessThan(CLOUD_MAX / 4);
    const back = await unpackCloud(raw);
    expect(back?.stamp).toBe(1234);
    expect(back?.keys).toEqual(keys);
    expect(await unpackCloud('not json')).toBeNull();
  });
});

describe('1.4.54 backup note', () => {
  it('every language has an iOS, Android and web note', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en']) {
      switchLocale(loc as never);
      expect(t('backup.ios')).toMatch(/iCloud/);
      expect(t('backup.android')).toMatch(/Google/);
      expect(t('backup.web').length).toBeGreaterThan(20);
    }
    switchLocale('zh-HK' as never);
  });
});
