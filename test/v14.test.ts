import { describe, expect, it } from 'vitest';
import { AGE_MILESTONES, GROWTH_FLOOR_SHARE } from '../src/balance';
import { SPECIES, speciesTargetCm, type SpeciesId } from '../src/data/species';
import { addDays } from '../src/dates';
import { bookMilestones, freshMeta } from '../src/meta';
import { baseDailyGrowth, expectedShare, milestoneTier } from '../src/rules';
import { checkMilestones, createGame, nextMilestone, previewNight, settleDay } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';
import { ageText, recordPct } from '../src/ui';

const NOW = Date.UTC(2026, 8, 25, 4);
const D0 = '2026-01-01';

function tree(species: SpeciesId, over: Partial<GameState> = {}): GameState {
  const s = createGame(D0, { species });
  s.started = true;
  return Object.assign(s, { health: 60, moisture: 60, nutrients: 80, resist: 60 }, over);
}

/** One ×1 night: H 60 → 70 (W +5, N +5) = 正常生長 ×1, clear = 天氣 ×1. */
function nightX1(s: GameState, i: number) {
  Object.assign(s, { health: 60, moisture: 60, nutrients: 80, eventBonus: 1 });
  return settleDay(s, addDays(D0, i), ['clear'], null, NOW);
}

describe('v14 生長曲線', () => {
  it('照顧 ×1：30／90／182／365 日 ≈ 26／59／84／97% 紀錄高度（±2 個百分點），九個樹種都係', () => {
    const want: Record<number, number> = { 30: 26, 90: 59, 182: 84, 365: 97 };
    for (const sp of SPECIES) {
      const s = tree(sp.id);
      const R = speciesTargetCm(sp.id);
      for (let i = 0; i < 365; i++) {
        const r = nightX1(s, i);
        expect(r.settlement.hMult).toBe(1);
        expect(r.settlement.weatherBonus).toBe(1);
        const day = i + 1;
        if (want[day] !== undefined) expect(Math.abs((s.heightCm / R) * 100 - want[day]!), `${sp.id} day ${day}`).toBeLessThanOrEqual(2);
      }
      expect(s.ageDays).toBe(365);
      expect(s.over).toBeNull();
    }
  });

  it('第一晚基本生長 = (R − 18) × (1 − e^(−1/100))；越高越慢', () => {
    const s = tree('redwood');
    const r = nightX1(s, 0);
    expect(r.settlement.baseGrowth).toBe(Math.round((12000 - 18) * (1 - Math.exp(-0.01)) * 10) / 10);
    expect(baseDailyGrowth(12000, 6000)).toBeLessThan(baseDailyGrowth(12000, 1000));
  });

  it('最低生長 = 0.0002R（超過紀錄高度之後）', () => {
    for (const sp of SPECIES) {
      const R = speciesTargetCm(sp.id);
      expect(baseDailyGrowth(R, R * 1.2)).toBeCloseTo(GROWTH_FLOOR_SHARE * R, 9);
      expect(baseDailyGrowth(R, R * 0.99)).toBeCloseTo(GROWTH_FLOOR_SHARE * R, 9); // gap × 0.00995 < floor
      const s = tree(sp.id, { heightCm: R * 1.2 });
      const r = nightX1(s, 0);
      expect(r.settlement.baseGrowth).toBe(Math.round(GROWTH_FLOOR_SHARE * R * 10) / 10);
    }
    // ~7% of R a year at ×1 beyond the curve.
    expect(GROWTH_FLOOR_SHARE * 365).toBeCloseTo(0.073, 3);
  });

  it('最低生長一樣 × 健康係數同天氣加成（×1.5、×0.2、毛毛雨 ×1.15、倒扣 −0.5）', () => {
    const R = speciesTargetCm('redwood');
    const floor = Math.round(GROWTH_FLOOR_SHARE * R * 10) / 10; // 2.4 cm
    const run = (health: number, events: ('clear' | 'drizzle')[]) => {
      const s = tree('redwood', { heightCm: R * 1.1, health, moisture: 60, nutrients: 80, eventBonus: 1 });
      return settleDay(s, D0, events, null, NOW).settlement;
    };
    const hi = run(90, ['clear']);
    expect(hi.hMult).toBe(1.5);
    expect(hi.deltaG).toBeCloseTo(floor * 1.5, 5);
    const weak = run(20, ['clear']); // 20 + 10 = 30 → ×0.2
    expect(weak.hMult).toBe(0.2);
    expect(weak.deltaG).toBeCloseTo(Math.round(floor * 0.2 * 10) / 10, 5);
    const dz = run(60, ['drizzle']);
    expect(dz.weatherBonus).toBe(1.15);
    expect(dz.deltaG).toBeCloseTo(Math.round(floor * 1.15 * 10) / 10, 5);
    const dyingish = run(0, ['clear']); // N +5, W +5 → 10 → ×−0.5
    expect(dyingish.hMult).toBe(-0.5);
    expect(dyingish.deltaG).toBeCloseTo(-floor * 0.5, 5);
  });

  it('倒塌之後由新高度計（−20% 之後基本生長變大）', () => {
    const R = speciesTargetCm('ginkgo');
    const s = tree('ginkgo', { heightCm: R * 0.9, windUnlocked: true, resist: 10 });
    settleDay(s, D0, ['typhoon8'], null, NOW);
    expect(s.collapses).toBe(1);
    expect(s.heightCm).toBeLessThan(R * 0.75);
    const before = baseDailyGrowth(R, R * 0.9);
    expect(baseDailyGrowth(R, s.heightCm)).toBeGreaterThan(before);
  });
});

describe('v14 今晚預計 = 結算', () => {
  it('普通晚、倒塌晚、紀錄以上：預計嘅生長同結算完全一樣', () => {
    const cases: [Partial<GameState>, ('clear' | 'hot' | 'typhoon8' | 'drizzle')[]][] = [
      [{ heightCm: 18 }, ['clear']],
      [{ heightCm: 3000, health: 90 }, ['drizzle']],
      [{ heightCm: 5000, windUnlocked: true, resist: 10 }, ['typhoon8']],
      [{ heightCm: 7000, health: 30 }, ['hot']],
    ];
    for (const [over, events] of cases) {
      const s = tree('cotton', over);
      s.care.date = D0;
      const plan = previewNight(s, D0, events, null);
      const r = settleDay(s, D0, events, null, NOW);
      expect(r.settlement.baseGrowth).toBe(plan.growth.base);
      expect(r.settlement.hMult).toBe(plan.growth.mult);
      expect(r.settlement.weatherBonus).toBe(plan.growth.bonus);
      expect(s.heightCm).toBe(plan.growth.heightAfter);
    }
  });
});

describe('v14 樹齡里程碑', () => {
  it('六個里程碑：30、90、182、365、730、1095 日', () => {
    expect(AGE_MILESTONES.map((m) => [m.days, m.label])).toEqual([
      [30, '1個月'], [90, '3個月'], [182, '半年'], [365, '1年'], [730, '2年'], [1095, '3年'],
    ]);
  });

  it('金 ≥ 0.98·e(t)、銀 ≥ 0.88·e(t)、其他銅', () => {
    for (const t of [30, 90, 182, 365, 730, 1095]) {
      const e = expectedShare(t);
      expect(milestoneTier(e, t)).toBe('gold');
      expect(milestoneTier(0.98 * e, t)).toBe('gold');
      expect(milestoneTier(0.98 * e - 1e-6, t)).toBe('silver');
      expect(milestoneTier(0.88 * e, t)).toBe('silver');
      expect(milestoneTier(0.88 * e - 1e-6, t)).toBe('bronze');
      expect(milestoneTier(0.01, t)).toBe('bronze');
    }
    expect(expectedShare(30)).toBeCloseTo(0.2592, 3);
  });

  it('結算到樹齡 30 日發 1個月章，等級跟嗰晚高度', () => {
    const R = speciesTargetCm('banyan');
    const e = expectedShare(30);
    const at = (share: number) => {
      const s = tree('banyan', { ageDays: 29, heightCm: share * R, health: 30 }); // ×0.2 tonight: tiny growth
      const r = settleDay(s, D0, ['clear'], null, NOW);
      expect(s.ageDays).toBe(30);
      expect(r.milestones).toHaveLength(1);
      return r.milestones[0]!;
    };
    expect(at(e).tier).toBe('gold');
    expect(at(0.9 * e).tier).toBe('silver');
    expect(at(0.5 * e).tier).toBe('bronze');
    const m = at(e);
    expect(m).toMatchObject({ id: 'm30', ageDays: 30 });
    expect(m.perk).toBeUndefined();
  });

  it('照顧 ×1 由第一日玩到一年：1個月、3個月、半年、1年都係金章', () => {
    const s = tree('douglas');
    for (let i = 0; i < 365; i++) nightX1(s, i);
    expect(Object.keys(s.milestones)).toEqual(['m30', 'm90', 'm182', 'm365']);
    for (const m of Object.values(s.milestones)) expect(m!.tier).toBe('gold');
    expect(nextMilestone(s)?.label).toBe('2年');
  });

  it('超越世界紀錄：第一次 h > R 先發，只發一次', () => {
    const R = speciesTargetCm('camphor');
    const s = tree('camphor', { heightCm: R - 0.5, health: 90 });
    const r1 = settleDay(s, D0, ['clear'], null, NOW);
    expect(s.heightCm).toBeGreaterThan(R);
    expect(r1.milestones.map((m) => m.id)).toEqual(['record']);
    expect(s.milestones.record).toMatchObject({ tier: null });
    expect(s.passedTargetOn).toBe(D0);
    const r2 = settleDay(s, addDays(D0, 1), ['clear'], null, NOW);
    expect(r2.milestones).toEqual([]);
    // Exactly R is not "beyond".
    const eq = tree('camphor', { heightCm: R });
    expect(checkMilestones(eq, D0)).toEqual([]);
  });

  it('入收藏：3個月、半年、1年附送一級、二級、三級能力徽章（三級＝免死金牌＋星空浮島），只book一次', () => {
    const meta = freshMeta();
    const s = tree('eucalyptus', { ageDays: 400, heightCm: 9700 });
    checkMilestones(s, D0);
    const lines = bookMilestones(meta, s);
    expect(lines).toHaveLength(3);
    expect(meta.badges).toEqual({ '1': 1, '2': 1, '3': 1 });
    expect(meta.reviveTokens).toBe(1);
    expect(meta.starry).toBe(true);
    expect(meta.milestones.map((m) => m.id)).toEqual(['m30', 'm90', 'm182', 'm365']);
    expect(bookMilestones(meta, s)).toEqual([]);
  });

  it('枯死再種：樹齡由 0 開始，收藏照留', () => {
    const meta = freshMeta();
    const s = tree('banyan', { ageDays: 40 });
    checkMilestones(s, D0);
    bookMilestones(meta, s);
    const next = createGame('2026-03-01', { species: 'ginkgo' });
    expect(next.ageDays).toBe(0);
    expect(next.milestones).toEqual({});
    expect(meta.milestones).toHaveLength(1);
  });

  it('狀態文字：樹齡同下個里程碑、% 紀錄高度（可以過 100%）', () => {
    const s = tree('banyan', { ageDays: 12, heightCm: 900 });
    expect(ageText(s)).toBe('樹齡 12 日 · 下個里程碑：1個月');
    expect(recordPct(s)).toBe(30);
    s.heightCm = 3300;
    expect(recordPct(s)).toBe(110);
  });
});

describe('v14 存檔遷移（v13.1 有賽季嘅存檔）', () => {
  const v131 = (over: Record<string, unknown>) => {
    const s = createGame(D0, { species: 'redwood' }) as unknown as Record<string, unknown>;
    delete s.rules;
    delete s.ageDays;
    delete s.milestones;
    Object.assign(s, { started: true, season: 's12', completed: null, targetCm: 12000, lastSeenDate: addDays(D0, 200), heightCm: 9000, health: 77, moisture: 66, nutrients: 55, resist: 44, windUnlocked: true, windExplained: true, collapses: 1 }, over);
    return JSON.stringify(s);
  };

  it('保留樹種、高度、數值；刪賽季欄位；樹齡 = 已結算晚數；補發過咗嘅里程碑（按而家高度）', () => {
    const s = parseSave(v131({}))!;
    expect(s).toMatchObject({ species: 'redwood', heightCm: 9000, health: 77, moisture: 66, nutrients: 55, resist: 44, collapses: 1, windUnlocked: true, targetCm: 12000, ageDays: 200, rules: 14 });
    expect('season' in s).toBe(false);
    expect('completed' in s).toBe(false);
    // p = 0.75: e(30) 0.26 金, e(90) 0.59 金, e(182) 0.84 → 0.75 ≥ 0.88 × 0.838 銀; 1年 not yet.
    expect(Object.keys(s.milestones)).toEqual(['m30', 'm90', 'm182']);
    expect(s.milestones.m30!.tier).toBe('gold');
    expect(s.milestones.m90!.tier).toBe('gold');
    expect(s.milestones.m182!.tier).toBe('silver');
    expect(s.milestones.m182!.retro).toBe(true);
    expect(s.milestones.m90!.perk).toBe(1);
    expect(s.milestones.m182!.perk).toBe(2);
    const meta = freshMeta();
    expect(bookMilestones(meta, s)).toHaveLength(2);
    // Round trip: nothing awarded twice.
    const again = parseSave(JSON.stringify(s))!;
    expect(Object.keys(again.milestones)).toEqual(['m30', 'm90', 'm182']);
    expect(again.log.length).toBe(s.log.length);
    expect(bookMilestones(meta, again)).toEqual([]);
  });

  it('已完成（booked）嘅 3 個月賽季：3個月唔再送一級徽章；高過紀錄即補發超越世界紀錄', () => {
    const s = parseSave(v131({ species: 'banyan', season: 's3', heightCm: 3100, targetCm: 3000, lastSeenDate: addDays(D0, 120), completed: { date: addDays(D0, 89), tiers: [1], days: 90, heightCm: 3000, booked: true } }))!;
    expect(s.ageDays).toBe(120);
    expect(Object.keys(s.milestones)).toEqual(['m30', 'm90', 'record']);
    expect(s.milestones.m90!.perk).toBeUndefined();
    expect(s.log.some((l) => /賽季/.test(l.text) || /賽季/.test(l.title ?? ''))).toBe(false);
  });

  it('舊版 over.kind = complete 嘅存檔一樣轉到', () => {
    const s = parseSave(v131({ species: 'banyan', season: 's3', over: { kind: 'complete', date: addDays(D0, 89), tiers: [1], days: 90, booked: true } }))!;
    expect(s.over).toBeNull();
    expect(s.milestones.m90).toBeTruthy();
    expect(s.milestones.m90!.perk).toBeUndefined();
  });

  it('枯死咗嘅舊存檔唔補發', () => {
    const s = parseSave(v131({ over: { kind: 'dead', date: addDays(D0, 150), tiers: [1], days: 150, booked: true } }))!;
    expect(s.milestones).toEqual({});
    expect(s.over).toMatchObject({ kind: 'dead' });
  });

  it('遷移之後繼續結算：樹齡照加，下個里程碑 1年', () => {
    const s = parseSave(v131({}))!;
    Object.assign(s, { health: 60, moisture: 60, nutrients: 80, eventBonus: 1 });
    settleDay(s, s.lastSeenDate, ['clear'], null, NOW);
    expect(s.ageDays).toBe(201);
    expect(nextMilestone(s)?.label).toBe('1年');
  });
});
