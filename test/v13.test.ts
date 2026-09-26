import { describe, expect, it } from 'vitest';
import { START, WEATHER_EVENTS, type WeatherEventId } from '../src/balance';
import { stagesFor } from '../src/content';
import { speciesTargetCm } from '../src/data/species';
import { freshMeta } from '../src/meta';
import { emergencyBonus, topInCategory } from '../src/rules';
import {
  advanceVirtualDay,
  advice,
  catchUp,
  createGame,
  doubleRActive,
  emergencyOptions,
  performEmergency,
  planNight,
  perksFrom,
  previewNight,
  reinforce,
  settleDay,
  windStageCm,
} from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';
import { collapseWarning, previewLines } from '../src/ui';

const NOW = Date.UTC(2026, 8, 26, 4);
const D = '2026-09-26';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90 }, over);
}
/** A tree at 青年樹 height (unlocked). */
function young(over: Partial<GameState> = {}): GameState {
  const s = game();
  return Object.assign(s, { heightCm: windStageCm(s) + 50, windUnlocked: true, windExplained: true, resist: 60 }, over);
}
const settle = (s: GameState, events: WeatherEventId[], meta = null as ReturnType<typeof freshMeta> | null) => settleDay(s, D, events, meta, NOW);

describe('v13 開局同分類', () => {
  it('新樹 R = 60，未解鎖風災', () => {
    const s = createGame(D);
    expect(START.resist).toBe(60);
    expect(s.resist).toBe(60);
    expect(s.windUnlocked).toBe(false);
    expect(s.collapses).toBe(0);
  });

  it('同類只計最嚴重；唔同類各自計', () => {
    expect(topInCategory(['typhoon1', 'typhoon8', 'thunder'], 'wind')).toBe('typhoon8');
    expect(topInCategory(['typhoon1', 'thunder'], 'wind')).toBe('thunder');
    expect(topInCategory(['rainstorm', 'blackrain'], 'rain')).toBe('blackrain');
    expect(topInCategory(['hot', 'drizzle'], 'rain')).toBeNull();
    expect(emergencyBonus(0)).toBe(0);
    expect(emergencyBonus(1)).toBe(3);
    expect(emergencyBonus(2)).toBe(4.5);
  });

  it('熱＋雨＋風三類疊加（青年樹後），同類唔疊', () => {
    // W 60 → hot −20 = 40 → rain +20 = 60, rain day no loss → +5; N 90 → 80 +5.
    const s = young({ resist: 50 });
    const r = settle(s, ['hot', 'rainstorm', 'blackrain', 'typhoon1', 'typhoon8']).settlement;
    expect(r.heat).toMatchObject({ score: -10, handled: false });
    expect(r.rain).toMatchObject({ event: 'blackrain', score: -15 });
    expect(r.wind).toMatchObject({ event: 'typhoon8', score: -30 });
    expect(r.finalDamage).toBe(55);
    expect(r.hAfter).toBe(70 + 5 + 5 - 55);
  });
});

describe('v13 酷熱', () => {
  it('冇做酷熱澆水 −10，唔受 R 影響', () => {
    const r = settle(game({ resist: 100, moisture: 80 }), ['hot']).settlement;
    // W 80 −20 −10 = 50 → +5, N +5, hot −10.
    expect(r.heat).toMatchObject({ handled: false, score: -10 });
    expect(r.hAfter).toBe(70);
  });

  it('酷熱澆水：額外一次 +5（上限 100）、做咗唔扣仲 +3；飽和都做得', () => {
    const s = game({ moisture: 80 });
    expect(performEmergency(s, 'heatWater', ['clear']).ok).toBe(false);
    expect(emergencyOptions(['hot'])).toEqual({ heatWater: true, rainDrain: false });
    const r1 = performEmergency(s, 'heatWater', ['hot']);
    expect(r1.ok).toBe(true);
    expect(s.moisture).toBe(85);
    expect(s.care.water).toBe(0); // extra to the 3 waterings
    expect(performEmergency(s, 'heatWater', ['hot']).ok).toBe(false);
    const t = game({ moisture: 98 });
    performEmergency(t, 'heatWater', ['hot']);
    expect(t.moisture).toBe(100);
    const u = game({ moisture: 120 });
    expect(performEmergency(u, 'heatWater', ['hot']).ok).toBe(true);
    expect(u.moisture).toBe(120);
    expect(u.care.heatWater).toBe(true);
    // Settlement: hot handled → 0 and +3.
    const v = game({ moisture: 80 });
    performEmergency(v, 'heatWater', ['hot']);
    const st = settle(v, ['hot']).settlement;
    expect(st.heat).toMatchObject({ handled: true, score: 0 });
    expect(st.emergencyBonus).toBe(3);
    // W 85 −20 −10 = 55 +5, N +5, +3.
    expect(st.hAfter).toBe(83);
  });
});

describe('v13 暴雨／黑雨', () => {
  it('冇做暴雨疏水：暴雨 −10、黑雨 −15，唔受 R 影響', () => {
    expect(settle(game({ resist: 100 }), ['rainstorm']).settlement.rain).toMatchObject({ score: -10, handled: false });
    expect(settle(game({ resist: 100 }), ['blackrain']).settlement.rain).toMatchObject({ score: -15, handled: false });
  });

  it('暴雨疏水：−10 但唔低過 50（≤ 50 都算做咗），做咗唔扣仲 +3', () => {
    const s = game({ moisture: 105 });
    expect(performEmergency(s, 'rainDrain', ['rainstorm']).ok).toBe(true);
    expect(s.moisture).toBe(95);
    expect(s.care.drain).toBe(0);
    expect(performEmergency(s, 'rainDrain', ['rainstorm']).ok).toBe(false);
    const t = game({ moisture: 55 });
    performEmergency(t, 'rainDrain', ['blackrain']);
    expect(t.moisture).toBe(50);
    const u = game({ moisture: 45 });
    expect(performEmergency(u, 'rainDrain', ['rainstorm']).ok).toBe(true);
    expect(u.moisture).toBe(45);
    expect(u.care.rainDrain).toBe(true);
    const v = game({ moisture: 60 });
    performEmergency(v, 'rainDrain', ['blackrain']);
    const st = settle(v, ['blackrain']).settlement;
    expect(st.rain).toMatchObject({ event: 'blackrain', handled: true, score: 0 });
    expect(st.emergencyBonus).toBe(3);
  });

  it('兩樣都做：應急獎勵 (3 + 3) × 0.75 = 4.5，健康可以有小數', () => {
    const s = game({ moisture: 60 });
    performEmergency(s, 'heatWater', ['hot', 'rainstorm']);
    performEmergency(s, 'rainDrain', ['hot', 'rainstorm']);
    const p = previewNight(s, D, ['hot', 'rainstorm'], null);
    expect(p.emergencyBonus).toBe(4.5);
    expect(p.emergencyCount).toBe(2);
    const lines = previewLines(p);
    expect(lines.find((l) => l.text === '應急獎勵 (3 + 3) × 0.75')?.value).toBe('+4.5');
    const st = settle(s, ['hot', 'rainstorm']).settlement;
    expect(st.emergencyBonus).toBe(4.5);
    expect(st.hAfter).toBe(p.hAfter);
    expect(st.hAfter % 1).toBe(0.5);
  });

  it('應急行動只計當日：舊一日嘅標記唔會帶落另一日結算', () => {
    const s = game({ moisture: 80 });
    performEmergency(s, 'heatWater', ['hot']);
    const st = settleDay(s, '2026-09-27', ['hot'], null, NOW).settlement;
    expect(st.heat?.handled).toBe(false);
  });
});

describe('v13 風災：青年樹前', () => {
  it('青年樹前：風災零傷害、R 唔變（冇 −2、冇消耗）、唔倒塌、冇 ×1.3', () => {
    const s = game({ resist: 5, health: 90 });
    const before = s.heightCm;
    const r = settle(s, ['typhoon8']).settlement;
    expect(r.wind).toMatchObject({ locked: true, score: 0 });
    expect(r.finalDamage).toBe(0);
    expect(s.resist).toBe(5);
    expect(r.collapse).toBeNull();
    expect(s.collapses).toBe(0);
    expect(s.stormSurvivals).toBe(0);
    expect(r.weatherBonus).toBe(WEATHER_EVENTS.typhoon8.growth);
    expect(s.heightCm).toBeGreaterThan(before);
    const c = settle(game({ resist: 60 }), ['clear']);
    expect(c.settlement.rAfter).toBe(60);
  });

  it('青年樹前加固鎖住', () => {
    const s = game();
    const res = reinforce(s, 'stakes');
    expect(res.ok).toBe(false);
    expect(res.message).toContain('青年樹');
    expect(s.resist).toBe(60);
  });

  it('第一次長到青年樹就永久解鎖，倒塌跌返落去都唔會鎖返', () => {
    const s = game({ health: 100, moisture: 70, nutrients: 100 });
    s.heightCm = windStageCm(s) - 5;
    settle(s, ['clear']);
    expect(s.windUnlocked).toBe(true);
    expect(s.windExplained).toBe(false);
    expect(s.log.some((l) => l.kind === 'unlock')).toBe(true);
    // Collapse pushes the height back below 青年樹.
    s.resist = 10;
    s.moisture = 70;
    settleDay(s, '2026-09-27', ['typhoon8'], null, NOW);
    expect(s.heightCm).toBeLessThan(windStageCm(s));
    expect(s.windUnlocked).toBe(true);
    expect(s.collapses).toBe(1);
  });

  it('青年樹係第 3 個階段（10% 目標）', () => {
    const s = game();
    expect(stagesFor(speciesTargetCm(s.species))[2]!.name).toBe('青年樹');
    expect(windStageCm(s)).toBe(Math.round(0.1 * speciesTargetCm(s.species)));
  });
});

describe('v13 風災：青年樹後', () => {
  it('傷害 = 基礎 × (1 − R/100)（用消耗前 R），每晚 −2，消耗：雷暴 25、T8 35、T1 18', () => {
    const t8 = young({ resist: 60 });
    const r = settle(t8, ['typhoon8']).settlement;
    expect(r.wind).toMatchObject({ score: -24, r: 60 });
    expect(t8.resist).toBe(23);
    const th = young({ resist: 60 });
    settle(th, ['thunder']);
    expect(th.resist).toBe(33);
    const t1 = young({ resist: 60 });
    expect(settle(t1, ['typhoon1']).settlement.wind?.score).toBe(-12);
    expect(t1.resist).toBe(40);
    const clear = young({ resist: 60 });
    settle(clear, ['clear']);
    expect(clear.resist).toBe(58);
  });

  it('捱過風暴 ×1.3 只計風災、只計青年樹後', () => {
    const s = young({ resist: 80, health: 90 });
    const r = settle(s, ['thunder']).settlement;
    expect(r.wind?.score).toBe(-7);
    expect(r.weatherBonus).toBe(1.04);
    expect(s.stormSurvivals).toBe(1);
    const hot = young({ health: 90, moisture: 80 });
    performEmergency(hot, 'heatWater', ['hot']);
    const h = settle(hot, ['hot']).settlement;
    expect(h.weatherBonus).toBe(0.9);
    expect(hot.stormSurvivals).toBe(0);
  });

  it('倒塌門檻：T1 < 20、雷暴 < 25、T8 < 40（剛好等於門檻唔倒）', () => {
    const cases: [WeatherEventId, number, boolean][] = [
      ['typhoon1', 19, true],
      ['typhoon1', 20, false],
      ['thunder', 24, true],
      ['thunder', 25, false],
      ['typhoon8', 39, true],
      ['typhoon8', 40, false],
    ];
    for (const [e, r, col] of cases) {
      const s = young({ resist: r, health: 90 });
      const h0 = s.heightCm;
      const st = settle(s, [e]).settlement;
      expect(Boolean(st.collapse), `${e} R${r}`).toBe(col);
      expect(s.collapses).toBe(col ? 1 : 0);
      if (col) {
        expect(st.collapse!.heightAfter).toBeCloseTo(st.collapse!.heightBefore * 0.8, 0);
        expect(s.heightCm).toBeLessThan(h0);
        expect(s.dying).toBeNull();
        expect(st.wind!.score).toBeLessThan(0); // wind damage still applies
        expect(s.doubleRPending).toBe(true);
        expect(s.log.some((l) => l.kind === 'collapse')).toBe(true);
      }
    }
  });

  it('只睇當日最嚴重嘅風災：T1 R 30 安全，但同日有 T8 就倒', () => {
    expect(settle(young({ resist: 30 }), ['typhoon1']).settlement.collapse).toBeNull();
    expect(settle(young({ resist: 30 }), ['typhoon1', 'typhoon8']).settlement.collapse?.event).toBe('typhoon8');
  });

  it('第 3 次倒塌即死（唔係瀕死）', () => {
    const s = young({ resist: 10, health: 90, collapses: 2 });
    const r = settle(s, ['typhoon8']);
    expect(r.died).toBe(true);
    expect(s.over?.kind).toBe('dead');
    expect(s.collapses).toBe(3);
  });

  it('免死金牌擋第 3 次倒塌，但次數唔重設：下一次就死', () => {
    const meta = freshMeta();
    meta.reviveTokens = 1;
    const s = young({ resist: 10, health: 90, collapses: 2 });
    const r = settle(s, ['typhoon8'], meta);
    expect(r.died).toBe(false);
    expect(r.revived).toBe(true);
    expect(s.over).toBeNull();
    expect(meta.reviveTokens).toBe(0);
    expect(s.collapses).toBe(3);
    s.resist = 10;
    const r2 = settleDay(s, '2026-09-27', ['thunder'], meta, NOW);
    expect(r2.died).toBe(true);
    expect(s.over?.kind).toBe('dead');
  });

  it('倒塌後第一個打開嘅日子加固雙倍（上限 100），之後恢復', () => {
    const s = young({ resist: 10, health: 90 });
    s.lastSeenDate = D;
    s.care.date = D;
    // Settle via catch-up over several days: the double day is the day the player opens the game.
    catchUp(s, '2026-09-29', (d) => (d === D ? ['typhoon8'] : ['clear']), null, NOW);
    expect(s.collapses).toBe(1);
    expect(s.doubleRPending).toBe(false);
    expect(s.doubleRDate).toBe('2026-09-29');
    expect(doubleRActive(s)).toBe(true);
    s.resist = 0;
    reinforce(s, 'stakes');
    reinforce(s, 'ropes');
    reinforce(s, 'prune');
    expect(s.resist).toBe(30 + 24 + 16);
    s.resist = 90;
    s.care.preps.stakes = false;
    reinforce(s, 'stakes');
    expect(s.resist).toBe(100);
    // Next day: normal.
    advanceVirtualDay(s, '2026-09-29', ['clear'], null, NOW);
    expect(doubleRActive(s)).toBe(false);
    s.resist = 0;
    reinforce(s, 'stakes');
    expect(s.resist).toBe(15);
  });

  it('今晚預計出倒塌警告，致命時更強', () => {
    const s = young({ resist: 30, collapses: 1 });
    const p = previewNight(s, D, ['typhoon8'], null);
    const w = collapseWarning(p, s.collapses)!;
    expect(w.text).toBe('⚠️ R 30 低過高級颱風門檻 40，今晚會倒塌（已倒 1/2 次）');
    expect(w.fatal).toBe(false);
    expect(advice(s, p, null)).toContain('倒塌');
    const f = young({ resist: 30, collapses: 2 });
    const fw = collapseWarning(previewNight(f, D, ['typhoon8'], null), 2)!;
    expect(fw.fatal).toBe(true);
    expect(fw.text).toContain('今次會死');
    const meta = freshMeta();
    meta.reviveTokens = 1;
    expect(collapseWarning(previewNight(f, D, ['typhoon8'], meta), 2)!.text).toContain('免死金牌');
    expect(collapseWarning(previewNight(game({ resist: 0 }), D, ['typhoon8'], null), 0)).toBeNull();
  });

  it('青年樹前預計寫「青年樹前唔受風災影響」', () => {
    const lines = previewLines(previewNight(game(), D, ['thunder'], null));
    expect(lines.find((l) => l.text.startsWith('風｜'))?.sub).toBe('青年樹前唔受風災影響');
  });
});

describe('v13 今晚預計＝實際結算', () => {
  it('各種組合（應急、分類疊加、解鎖前後、倒塌、免死金牌）完全一致', () => {
    const meta = freshMeta();
    meta.reviveTokens = 1;
    meta.badges['1'] = 1;
    const cases: [Partial<GameState>, WeatherEventId[], ('heatWater' | 'rainDrain')[]][] = [
      [{}, ['clear'], []],
      [{}, ['hot'], []],
      [{}, ['hot'], ['heatWater']],
      [{ moisture: 110 }, ['rainstorm'], ['rainDrain']],
      [{}, ['hot', 'blackrain'], ['heatWater', 'rainDrain']],
      [{ resist: 30 }, ['hot', 'rainstorm', 'typhoon8'], ['heatWater']],
      [{ resist: 10, collapses: 2 }, ['thunder'], []],
      [{ resist: 70 }, ['typhoon1', 'thunder', 'drizzle'], []],
      [{ pest: { active: true, lowNDays: 0, wetDays: 0, since: D } }, ['blackrain', 'typhoon1'], ['rainDrain']],
    ];
    for (const unlocked of [false, true]) {
      for (const [over, events, acts] of cases) {
        for (const m of [null, meta]) {
          const s = unlocked ? young(over) : game(over);
          for (const a of acts) performEmergency(s, a, events);
          const p = previewNight(s, D, events, m ? { ...m } : null);
          const r = settleDay(s, D, events, m ? { ...m } : null, NOW).settlement;
          expect({ w: p.wAfter, n: p.nAfter, dmg: p.damage, bonus: p.emergencyBonus, r: p.rAfter, col: Boolean(p.collapse) }).toEqual({
            w: r.wAfter,
            n: r.nAfter,
            dmg: r.finalDamage,
            bonus: r.emergencyBonus,
            r: r.rAfter,
            col: Boolean(r.collapse),
          });
          // Health matches unless a 免死金牌 lifted it after the settlement's collapse.
          if (!r.collapse?.revived && !r.collapse?.fatal) expect(p.hAfter).toBe(r.hAfter);
        }
      }
    }
  });

  it('planNight 冇改 state', () => {
    const s = young({ resist: 10 });
    const snap = JSON.stringify(s);
    planNight(s, ['typhoon8', 'hot'], perksFrom(null), D);
    expect(JSON.stringify(s)).toBe(snap);
  });
});

describe('v13 存檔遷移', () => {
  const oldSave = (over: Partial<GameState>) => {
    const s = game(over) as Partial<GameState> & Record<string, unknown>;
    delete s.windUnlocked;
    delete s.windExplained;
    delete s.collapses;
    delete s.doubleRPending;
    delete s.doubleRDate;
    delete s.doubleRSeen;
    delete (s.care as Record<string, unknown>).heatWater;
    delete (s.care as Record<string, unknown>).rainDrain;
    return JSON.stringify(s);
  };

  it('青年樹前嘅舊存檔：R 設做 60，未解鎖，其他照舊', () => {
    const s = parseSave(oldSave({ resist: 12, health: 66, moisture: 77, heightCm: 40 }))!;
    expect(s.windUnlocked).toBe(false);
    expect(s.resist).toBe(60);
    expect(s.health).toBe(66);
    expect(s.moisture).toBe(77);
    expect(s.collapses).toBe(0);
    expect(s.care.heatWater).toBe(false);
  });

  it('已到青年樹嘅舊存檔：解鎖、保留 R、會見到一次說明卡', () => {
    const t = game();
    const s = parseSave(oldSave({ resist: 33, heightCm: windStageCm(t) + 10 }))!;
    expect(s.windUnlocked).toBe(true);
    expect(s.resist).toBe(33);
    expect(s.windExplained).toBe(false);
    expect(s.doubleRDate).toBeNull();
    // A v13 save round-trips untouched.
    s.windExplained = true;
    s.collapses = 1;
    const again = parseSave(JSON.stringify(s))!;
    expect(again).toMatchObject({ windUnlocked: true, windExplained: true, collapses: 1, resist: 33 });
  });
});
