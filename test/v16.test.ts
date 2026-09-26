import { describe, expect, it } from 'vitest';
import { freshMeta } from '../src/meta';
import {
  DYING_MS,
  FALLEN_LOG_DAYS,
  advanceVirtualDay,
  brokenTop,
  catchUp,
  createGame,
  dayEndMs,
  fallenLogDay,
  resolveDyingExpiry,
  settleDay,
  windStageCm,
} from '../src/sim';
import { migrateV16, parseSave } from '../src/storage';
import { buildTree, healthTierHealth, treeKey, type TreeParams } from '../src/three/tree3d';
import { healthLook, lookTier } from '../src/treeLook';
import type { GameState } from '../src/types';

const D = '2026-09-26';
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
/** 2026-09-26 12:00 HKT (04:00 UTC) — 12 h into the day. */
const NOW = Date.UTC(2026, 8, 26, 4);
const INTO = 12 * HOUR;

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90 }, over);
}
function young(over: Partial<GameState> = {}): GameState {
  const s = game();
  return Object.assign(s, { heightCm: windStageCm(s) + 400, windUnlocked: true, windExplained: true, resist: 60 }, over);
}

describe('v16 A：瀕死準時完結', () => {
  it('dayEndMs：每晚喺嗰日完結（午夜）結算，唔會遲過而家', () => {
    const midnight = NOW - INTO;
    expect(dayEndMs('2026-09-25', D, NOW, INTO)).toBe(midnight);
    expect(dayEndMs('2026-09-24', D, NOW, INTO)).toBe(midnight - DAY);
    expect(dayEndMs('2026-09-20', D, NOW, INTO)).toBe(midnight - 5 * DAY);
    // Today (dev skip) or msIntoToday unknown (0): capped at now.
    expect(dayEndMs(D, D, NOW, INTO)).toBe(NOW);
    expect(dayEndMs('2026-09-25', D, NOW, 0)).toBe(NOW);
  });

  it('resolveDyingExpiry：未夠 24 小時唔郁；夠鐘冇金牌就死（fallSeen false）', () => {
    const s = game({ health: 0, dying: { since: '2026-09-25', at: NOW - DYING_MS + 1000 } });
    expect(resolveDyingExpiry(s, D, freshMeta(), NOW)).toBeNull();
    expect(s.over).toBeNull();
    expect(resolveDyingExpiry(s, D, freshMeta(), NOW + 1000)).toBe('dead');
    expect(s.over?.kind).toBe('dead');
    expect(s.over?.fallSeen).toBe(false);
    expect(s.dying).toBeNull();
  });

  it('resolveDyingExpiry：有免死金牌就救返（H 30）', () => {
    const meta = freshMeta();
    meta.reviveTokens = 1;
    const s = game({ health: 0, dying: { since: '2026-09-25', at: NOW - DYING_MS } });
    expect(resolveDyingExpiry(s, D, meta, NOW)).toBe('revived');
    expect(s.over).toBeNull();
    expect(s.dying).toBeNull();
    expect(s.health).toBe(30);
    expect(meta.reviveTokens).toBe(0);
  });

  it('catch-up：瀕死喺離開期間嗰一晚就完結（唔使等到返嚟）', () => {
    // Dying since the night of 09-22 (settled at 09-23 00:00); 24 h later is 09-24 00:00 = end of 09-23.
    const s = game({ health: 0, moisture: 10, nutrients: 5, lastSeenDate: '2026-09-23' });
    s.dying = { since: '2026-09-22', at: NOW - INTO - 3 * DAY };
    const r = catchUp(s, D, () => ['clear'], null, NOW, INTO);
    expect(s.over?.kind).toBe('dead');
    expect(s.over?.date).toBe('2026-09-23');
    expect(r.settlements.length).toBe(1);
  });

  it('dev 跳日：用遊戲時間，第二次跳（+24 小時）瀕死完結', () => {
    const s = game({ health: 0, moisture: 10, nutrients: 5 });
    s.dying = { since: D, at: NOW };
    advanceVirtualDay(s, D, ['clear'], null, NOW);
    expect(s.over).toBeNull();
    advanceVirtualDay(s, '2026-09-27', ['clear'], null, NOW + DAY);
    expect(s.over?.kind).toBe('dead');
  });
});

describe('v16 B：倒塌紀錄（淨係畫面用）', () => {
  it('倒塌寫低 lastCollapse（未睇過），斷頂由 1 慢慢退到 0', () => {
    const s = young({ resist: 0, health: 90 });
    const h0 = s.heightCm;
    const r = settleDay(s, D, ['typhoon8'], null, NOW);
    expect(r.settlement.collapse).not.toBeNull();
    const lc = s.lastCollapse!;
    expect(lc).toMatchObject({ date: D, event: 'typhoon8', count: 1, fatal: false, seen: false });
    expect(lc.heightBefore).toBeGreaterThanOrEqual(h0); // includes that night's growth before the snap
    expect(lc.heightAfter).toBeCloseTo(lc.heightBefore * 0.8, 0);
    expect(brokenTop(s)).toBeGreaterThan(0.9);
    s.heightCm = (lc.heightBefore + lc.heightAfter) / 2;
    expect(brokenTop(s)).toBeCloseTo(0.5, 5);
    s.heightCm = lc.heightBefore + 10;
    expect(brokenTop(s)).toBe(0);
  });

  it('第 3 次倒塌：fatal，冇斷頂，要播死亡', () => {
    const s = young({ resist: 0, health: 90, collapses: 2 });
    settleDay(s, D, ['typhoon8'], null, NOW);
    expect(s.over?.kind).toBe('dead');
    expect(s.over?.fallSeen).toBe(false);
    expect(s.lastCollapse?.fatal).toBe(true);
    expect(brokenTop(s)).toBe(0);
    expect(fallenLogDay(s, D)).toBe(0);
  });

  it('倒下嘅樹頂留喺樹旁 1–3 日', () => {
    const s = game();
    s.lastCollapse = { date: D, event: 'typhoon8', heightBefore: 3000, heightAfter: 2400, count: 1, fatal: false, seen: true };
    expect(FALLEN_LOG_DAYS).toBe(3);
    expect(fallenLogDay(s, D)).toBe(1);
    expect(fallenLogDay(s, '2026-09-27')).toBe(1);
    expect(fallenLogDay(s, '2026-09-29')).toBe(3);
    expect(fallenLogDay(s, '2026-09-30')).toBe(0);
    expect(fallenLogDay({ ...s, lastCollapse: null }, D)).toBe(0);
  });

  it('舊存檔：lastCollapse = null；已死嘅樹當睇過（唔重播）', () => {
    const s = createGame(D) as Partial<GameState>;
    delete s.lastCollapse;
    const alive = parseSave(JSON.stringify(s))!;
    expect(alive.lastCollapse).toBeNull();
    const dead = { ...s, over: { kind: 'dead', date: D, tiers: [], days: 3 } };
    const parsed = parseSave(JSON.stringify(dead))!;
    expect(parsed.over?.fallSeen).toBe(true);
    const bad = createGame(D);
    (bad as unknown as { lastCollapse: unknown }).lastCollapse = { foo: 1 };
    migrateV16(bad);
    expect(bad.lastCollapse).toBeNull();
    const partial = createGame(D);
    partial.heightCm = 2400;
    (partial as unknown as { lastCollapse: unknown }).lastCollapse = { date: D, heightBefore: 3000 };
    migrateV16(partial);
    expect(partial.lastCollapse).toMatchObject({ heightAfter: 2400, count: 1, fatal: false, seen: true });
  });
});

describe('v16 E：病樹外觀', () => {
  it('健康分級：≥50 正常、<50 暗啲、<25 黃+垂+落葉、瀕死 啡+紅光、死咗', () => {
    expect(healthLook(80, false, false)).toEqual({ wither: 0, droop: 0, pulse: 0, leafFall: 0 });
    const dull = healthLook(40, false, false);
    expect(dull.wither).toBeGreaterThan(0);
    expect(dull.wither).toBeLessThan(0.4);
    expect(dull.leafFall).toBe(0);
    const weak = healthLook(15, false, false);
    expect(weak.wither).toBeGreaterThan(0.4);
    expect(weak.droop).toBeGreaterThan(0);
    expect(weak.leafFall).toBeGreaterThan(0);
    expect(weak.pulse).toBe(0);
    expect(healthLook(0, true, false)).toMatchObject({ wither: 0.9, pulse: 1, leafFall: 1 });
    expect(healthLook(0, false, true)).toMatchObject({ wither: 1, pulse: 0, leafFall: 0 });
    expect([80, 40, 15].map((h) => lookTier(h, false, false))).toEqual(['healthy', 'dull', 'weak']);
    expect(lookTier(0, true, false)).toBe('dying');
  });

  it('健康度分級重建（唔會每 1 分就重砌棵樹）', () => {
    const p: TreeParams = { species: 'camphor', stage: 3, heightCm: 2500, health: 90, pests: 0, scars: 0, seed: 5 };
    expect(treeKey({ ...p, health: 90 })).toBe(treeKey({ ...p, health: 88 }));
    expect(treeKey({ ...p, health: 90 })).not.toBe(treeKey({ ...p, health: 10 }));
    const tiers = new Set(Array.from({ length: 101 }, (_, h) => healthTierHealth(h)));
    expect(tiers.size).toBeLessThanOrEqual(7);
  });
});

describe('v16 D：斷頂', () => {
  const p: TreeParams = { species: 'redwood', stage: 3, heightCm: 5000, health: 80, pests: 0, scars: 0, seed: 7 };
  it('treeKey 跟斷頂變（分級）', () => {
    expect(treeKey({ ...p, brokenTop: 1 })).not.toBe(treeKey(p));
    expect(treeKey({ ...p, brokenTop: 0 })).toBe(treeKey(p));
  });

  it('斷頂嘅樹矮咗、有切口，整棵樹高度（比例）不變', () => {
    const whole = buildTree(p);
    const broken = buildTree({ ...p, brokenTop: 1 });
    expect(whole.brokenCut).toBeNull();
    expect(broken.brokenCut).not.toBeNull();
    expect(broken.visibleTop).toBeLessThan(whole.visibleTop * 0.95);
    expect(broken.brokenCut!.bark).toBeLessThan(broken.brokenCut!.leaf);
    expect(broken.height).toBeCloseTo(whole.height, 5);
    whole.dispose();
    broken.dispose();
  });
});
