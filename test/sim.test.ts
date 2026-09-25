import { describe, expect, it } from 'vitest';
import { WEATHER_EVENTS } from '../src/balance';
import { bookGameEnd, freshMeta, newGame } from '../src/meta';
import { carbonKg, deltaG, earnedTiers, finalDamage, hMult, nFactor, pickEvent, wFactor } from '../src/rules';
import { catchUp, createGame, performAction, reinforce, settleDay } from '../src/sim';
import { visualHeight } from '../src/three/tree3d';
import type { GameState } from '../src/types';

const NOW = Date.UTC(2026, 8, 25, 4);
const HOUR = 3600 * 1000;

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame('2026-09-25');
  s.started = true;
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 70, resist: 0 }, over);
}

describe('公式', () => {
  it('水分同養分因素', () => {
    expect([39, 40, 80, 81].map(wFactor)).toEqual([-10, 5, 5, -10]);
    expect([29, 30, 59, 60, 100].map(nFactor)).toEqual([-10, 0, 0, 5, 5]);
  });

  it('天氣損傷減免 = 基礎 × (1 − R/100)', () => {
    expect(finalDamage(60, 0)).toBe(60);
    expect(finalDamage(60, 50)).toBe(30);
    expect(finalDamage(60, 100)).toBe(0);
    expect(finalDamage(35, 40)).toBe(21);
  });

  it('多個警告唔疊加，只取基礎傷害最高', () => {
    expect(pickEvent(['rainstorm', 'typhoon8'])).toBe('typhoon8');
    expect(pickEvent(['rainstorm', 'typhoon1'])).toBe('typhoon1');
    expect(pickEvent(['typhoon1', 'thunder'])).toBe('thunder');
    expect(pickEvent(['hot', 'drizzle'])).toBe('hot');
    expect(pickEvent(['rainstorm', 'blackrain'])).toBe('blackrain');
    expect(pickEvent([])).toBe('clear');
  });

  it('颱風分兩級：初級係高級嘅一半', () => {
    expect(WEATHER_EVENTS.typhoon8).toMatchObject({ damage: 60, dR: -80 });
    expect(WEATHER_EVENTS.typhoon1).toMatchObject({ damage: 30, dR: -40 });
  });

  it('H_mult 階梯', () => {
    expect([100, 80, 79, 50, 49, 20, 19, 0].map(hMult)).toEqual([1.5, 1.5, 1, 1, 0.2, 0.2, -0.5, -0.5]);
  });

  it('ΔG = 目標/日數 × H_mult × 天氣加成；倒扣唔計加成', () => {
    expect(deltaG(22.2, 1.5, 1)).toBe(33.3);
    expect(deltaG(22.2, 1, 1.15)).toBe(25.5);
    expect(deltaG(22.2, -0.5, 1.15)).toBe(-11.1);
  });

  it('碳吸收量 = 0.35 × G^1.5', () => {
    expect(carbonKg(2000)).toBe(31.3);
    expect(carbonKg(10000)).toBe(350);
    expect(carbonKg(0)).toBe(0);
  });

  it('徽章：完成拎齊，枯死按捱過嘅日數保底', () => {
    expect(earnedTiers(90, 90, true)).toEqual([1]);
    expect(earnedTiers(365, 365, true)).toEqual([1, 2, 3]);
    expect(earnedTiers(365, 210, false)).toEqual([1, 2]);
    expect(earnedTiers(365, 100, false)).toEqual([1]);
    expect(earnedTiers(365, 60, false)).toEqual([]);
    expect(earnedTiers(90, 300, false)).toEqual([1]);
  });
});

describe('夜間結算', () => {
  it('健康公式、抗風減免、ΔG（高級颱風）', () => {
    const s = game({ resist: 50 });
    const { settlement } = settleDay(s, '2026-09-25', ['typhoon8'], null, NOW);
    expect(settlement).toMatchObject({ event: 'typhoon8', wFactor: 5, nFactor: 5, baseDamage: 60, finalDamage: 30, hAfter: 50, rAfter: 0, hMult: 1 });
    expect(settlement.wAfter).toBe(60);
    expect(settlement.nAfter).toBe(60);
    expect(settlement.baseGrowth).toBe(22.2);
    expect(settlement.weatherBonus).toBe(0.6);
    expect(settlement.deltaG).toBe(13.3);
    expect(s.heightCm).toBeCloseTo(31.3, 5);
  });

  it('暴雨同颱風一齊：唔疊加，暴雨嘅 +60 水分都唔計', () => {
    const s = game({ resist: 50 });
    const { settlement } = settleDay(s, '2026-09-25', ['rainstorm', 'typhoon8'], null, NOW);
    expect(settlement.event).toBe('typhoon8');
    expect(settlement.finalDamage).toBe(30);
    expect(s.moisture).toBe(60);
    expect(settlement.notes.join()).toContain('只計最重');
  });

  it('初級颱風傷害同消耗都係一半', () => {
    const s = game({ resist: 50 });
    const { settlement } = settleDay(s, '2026-09-25', ['typhoon1'], null, NOW);
    expect(settlement.finalDamage).toBe(15);
    expect(s.resist).toBe(8);
  });

  it('晴天水分 −15、毛毛雨 +20、酷熱 −40', () => {
    expect(settleDay(game(), 'd', ['clear'], null, NOW).settlement.wAfter).toBe(45);
    expect(settleDay(game(), 'd', ['drizzle'], null, NOW).settlement.wAfter).toBe(80);
    const hot = settleDay(game(), 'd', ['hot'], null, NOW).settlement;
    expect(hot.wAfter).toBe(20);
    expect(hot.wFactor).toBe(-10);
    expect(hot.finalDamage).toBe(10);
  });

  it('推高抗風力捱過風暴有生長加成', () => {
    const s = game({ resist: 100, health: 90 });
    const r = settleDay(s, '2026-09-25', ['thunder'], null, NOW);
    expect(r.settlement.finalDamage).toBe(0);
    expect(r.settlement.weatherBonus).toBe(1.04);
    expect(s.stormSurvivals).toBe(1);
  });

  it('一級徽章：水分流失少 10%', () => {
    const meta = freshMeta();
    meta.badges['1'] = 1;
    expect(settleDay(game(), 'd', ['clear'], meta, NOW).settlement.wAfter).toBe(46.5);
  });

  it('蟲害：連續 3 晚營養不良觸發，每晚 −15，除蟲清走', () => {
    const s = game({ nutrients: 35, health: 90 });
    for (const d of ['2026-09-25', '2026-09-26', '2026-09-27']) {
      s.nutrients = Math.min(s.nutrients, 35);
      settleDay(s, d, ['drizzle'], null, NOW);
    }
    expect(s.pest.active).toBe(true);
    const r = settleDay(s, '2026-09-28', ['drizzle'], null, NOW);
    expect(r.settlement.pestDamage).toBe(15);
    s.care.date = '2026-09-29';
    expect(performAction(s, 'deworm', { raining: false }).ok).toBe(true);
    expect(s.pest.active).toBe(false);
  });
});

describe('瀕死、枯死、遺產', () => {
  const doomed = () => game({ health: 5, moisture: 10, nutrients: 5 });

  it('首次歸 0 進入 24 小時瀕死，未夠鐘唔會死', () => {
    const s = doomed();
    settleDay(s, '2026-09-25', ['clear'], null, NOW);
    expect(s.health).toBe(0);
    expect(s.dying).toEqual({ since: '2026-09-25', at: NOW });
    settleDay(s, '2026-09-26', ['clear'], null, NOW + 10 * HOUR);
    expect(s.over).toBeNull();
    const r = settleDay(s, '2026-09-27', ['clear'], null, NOW + 25 * HOUR);
    expect(r.died).toBe(true);
    expect(s.over?.kind).toBe('dead');
  });

  it('瀕死時將水分同養分調返最佳即刻救返', () => {
    const s = doomed();
    settleDay(s, '2026-09-25', ['clear'], null, NOW);
    s.care.date = '2026-09-26';
    s.moisture = 25;
    s.nutrients = 45;
    performAction(s, 'water', { raining: false });
    expect(s.dying).not.toBeNull();
    const res = performAction(s, 'fertilize', { raining: false });
    expect(res.message).toContain('救返');
    expect(s.dying).toBeNull();
    expect(s.health).toBe(10);
  });

  it('免死金牌救返一次', () => {
    const s = doomed();
    const meta = freshMeta();
    meta.reviveTokens = 1;
    settleDay(s, '2026-09-25', ['clear'], meta, NOW);
    const r = settleDay(s, '2026-09-26', ['clear'], meta, NOW + 30 * HOUR);
    expect(r.revived).toBe(true);
    expect(s.health).toBe(30);
    expect(meta.reviveTokens).toBe(0);
  });

  it('離開幾日都唔會一返嚟就死：先有 24 小時瀕死', () => {
    const s = game({ health: 20, moisture: 20, nutrients: 20 });
    s.lastSeenDate = '2026-09-20';
    const report = catchUp(s, '2026-09-27', () => ['clear'], null, NOW);
    expect(report.over).toBe(false);
    expect(s.dying?.at).toBe(NOW);
  });

  it('枯死變養分地標，下一棵樹開局養分高，保底徽章', () => {
    const meta = freshMeta();
    const s = createGame('2026-01-01', { season: 's12' });
    Object.assign(s, { health: 3, moisture: 0, nutrients: 0, dying: { since: '2026-07-19', at: 0 } });
    settleDay(s, '2026-07-20', ['clear'], meta, NOW);
    expect(s.over).toMatchObject({ kind: 'dead', tiers: [1, 2] });
    bookGameEnd(meta, s);
    expect(bookGameEnd(meta, s)).toEqual([]);
    expect(meta.badges).toEqual({ '1': 1, '2': 1, '3': 0 });
    expect(meta.pendingLegacy).toBe(true);
    const next = newGame(meta, '2026-07-21', 's3', '第二棵');
    expect(next.nutrients).toBe(90);
    expect(meta.pendingLegacy).toBe(false);
  });

  it('完成賽季發徽章', () => {
    const s = createGame('2026-01-01', { season: 's3' });
    Object.assign(s, { moisture: 60, nutrients: 90 });
    const r = settleDay(s, '2026-03-31', ['clear'], null, NOW);
    expect(r.completed).toBe(true);
    expect(s.over).toMatchObject({ kind: 'complete', tiers: [1] });
  });
});

describe('照顧同動物', () => {
  it('澆水每日 3 次、落雨唔使澆，疏水降水分，加固每樣每日一次', () => {
    const s = game({ moisture: 30 });
    s.care.date = '2026-09-25';
    expect(performAction(s, 'water', { raining: true }).ok).toBe(false);
    for (let i = 0; i < 3; i++) expect(performAction(s, 'water', { raining: false }).ok).toBe(true);
    expect(performAction(s, 'water', { raining: false }).ok).toBe(false);
    expect(s.moisture).toBe(90);
    performAction(s, 'drain', { raining: false });
    expect(s.moisture).toBe(65);
    expect(reinforce(s, 'stakes').ok).toBe(true);
    expect(reinforce(s, 'stakes').ok).toBe(false);
    expect(s.resist).toBe(15);
  });

  it('健康連續 3 晚 90 以上，動物長駐，之後每晚幫手施肥', () => {
    const s = game({ health: 95, moisture: 60, nutrients: 90 });
    s.animals = ['butterfly'];
    for (const d of ['2026-09-25', '2026-09-26', '2026-09-27']) {
      s.moisture = 60;
      settleDay(s, d, ['clear'], null, NOW);
    }
    expect(s.residents).toEqual(['butterfly']);
    s.nutrients = 70;
    s.moisture = 60;
    settleDay(s, '2026-09-28', ['clear'], null, NOW);
    expect(s.nutrients).toBe(62);
  });

  it('3D 樹的視覺高度隨真實高度單調上升', () => {
    let last = -1;
    for (const cm of [0, 5, 18, 50, 120, 200, 800, 2000, 5000, 11620, 30000]) {
      const v = visualHeight(cm);
      expect(v).toBeGreaterThan(last);
      last = v;
    }
    expect(visualHeight(30000)).toBeLessThanOrEqual(15);
  });
});
