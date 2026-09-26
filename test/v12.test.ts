import { describe, expect, it } from 'vitest';
import { freshMeta } from '../src/meta';
import { rainAdd, rollFor, wFactor, wTier } from '../src/rules';
import { advice, applyWarningWater, checkRescue, createGame, performAction, previewNight, settleDay } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';
import type { WeatherEventId } from '../src/balance';

const NOW = Date.UTC(2026, 8, 26, 4);
const D = '2026-09-26';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90, resist: 0 }, over);
}
const water = (s: GameState) => performAction(s, 'water', { raining: false });
const drain = (s: GameState) => performAction(s, 'drain', { raining: false });

describe('v12 照顧：澆水上限、疏水 3 次', () => {
  it('澆水 +15 最多到 100（部分都得）；≥100 冇效果、唔用次數', () => {
    const s = game({ moisture: 90 });
    expect(water(s).ok).toBe(true);
    expect(s.moisture).toBe(100);
    expect(s.care.water).toBe(1);
    const r = water(s);
    expect(r.ok).toBe(false);
    expect(r.message).toBe('泥土已經飽和，唔使再澆');
    expect(s.care.water).toBe(1);
    s.moisture = 120;
    expect(water(s).message).toBe('泥土已經飽和，唔使再澆');
    expect(s.moisture).toBe(120);
    expect(s.care.water).toBe(1);
    s.moisture = 40;
    expect(water(s).ok).toBe(true);
    expect(water(s).ok).toBe(true);
    expect(s.moisture).toBe(70);
    expect(water(s).ok).toBe(false); // 3 uses done
  });

  it('疏水每日 3 次、每次 −10，最低 0', () => {
    const s = game({ moisture: 125 });
    for (const want of [115, 105, 95]) {
      expect(drain(s).ok).toBe(true);
      expect(s.moisture).toBe(want);
    }
    expect(drain(s).ok).toBe(false);
    expect(s.moisture).toBe(95);
    const t = game({ moisture: 5 });
    drain(t);
    expect(t.moisture).toBe(0);
  });
});

describe('v12 自然流失同落雨日', () => {
  it('每晚 −10；毛毛雨、暴雨、黑雨日唔流失', () => {
    expect(settleDay(game({ moisture: 80 }), D, ['clear'], null, NOW).settlement.wAfter).toBe(70);
    expect(settleDay(game({ moisture: 80 }), D, ['thunder'], null, NOW).settlement.wAfter).toBe(70);
    expect(settleDay(game({ moisture: 80 }), D, ['typhoon8'], null, NOW).settlement.wAfter).toBe(70);
    for (const rain of ['rainstorm', 'blackrain'] as WeatherEventId[]) {
      const s = game({ moisture: 60 });
      applyWarningWater(s, D, [rain], null, NOW);
      expect(s.moisture).toBe(80);
      expect(settleDay(s, D, [rain], null, NOW).settlement.wAfter).toBe(80);
    }
    expect(settleDay(game({ moisture: 80 }), D, ['drizzle'], null, NOW).settlement.wAfter).toBe(90);
  });

  it('一級徽章：流失少 10%（晚上 −9、酷熱 −18）', () => {
    const meta = freshMeta();
    meta.badges['1'] = 1;
    const s = game({ moisture: 80 });
    applyWarningWater(s, D, ['hot'], meta, NOW);
    expect(s.moisture).toBe(62);
    expect(settleDay(s, D, ['hot'], meta, NOW).settlement.wAfter).toBe(53);
  });

  it('毛毛雨同暴雨同日：只計暴雨嗰次 +20，毛毛雨唔再加', () => {
    const s = game({ moisture: 90 });
    applyWarningWater(s, D, ['drizzle', 'rainstorm'], null, NOW);
    expect(s.moisture).toBe(110);
    expect(settleDay(s, D, ['drizzle', 'rainstorm'], null, NOW).settlement.wAfter).toBe(110);
  });
});

describe('v12 即時警告', () => {
  it('酷熱即時 −20，當晚再 −10', () => {
    const s = game({ moisture: 70 });
    const hits = applyWarningWater(s, D, ['hot'], null, NOW);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.message).toContain('酷熱天氣警告！水分 -20，而家 50');
    expect(s.moisture).toBe(50);
    const r = settleDay(s, D, ['hot'], null, NOW);
    expect(r.settlement.wAfter).toBe(40);
    expect(r.settlement.wFactor).toBe(-10);
  });

  it('90 + 暴雨 → 即時 110，當晚冇流失', () => {
    const s = game({ moisture: 90 });
    const hits = applyWarningWater(s, D, ['rainstorm'], null, NOW);
    expect(hits[0]!.message).toBe('暴雨警告！水分 +20，而家 110，記得疏水');
    expect(s.moisture).toBe(110);
    const r = settleDay(s, D, ['rainstorm'], null, NOW);
    expect(r.settlement.wAfter).toBe(110);
    expect(r.settlement.wFactor).toBe(-10);
    expect(r.settlement.wLabel).toBe('輕度爛根');
  });

  it('100 + 暴雨 → 110；115 + 暴雨 → 125（過咗 100 最多 +10）', () => {
    const s = game({ moisture: 100 });
    applyWarningWater(s, D, ['rainstorm'], null, NOW);
    expect(s.moisture).toBe(110);
    const t = game({ moisture: 115 });
    applyWarningWater(t, D, ['blackrain'], null, NOW);
    expect(t.moisture).toBe(125);
    expect(rainAdd(95, 20, 10)).toBe(110);
    expect(rainAdd(40, 20, 10)).toBe(60);
  });

  it('100 + 毛毛雨晚 → 105', () => {
    const s = game({ moisture: 100 });
    expect(settleDay(s, D, ['drizzle'], null, NOW).settlement.wAfter).toBe(105);
    expect(settleDay(game({ moisture: 97 }), D, ['drizzle'], null, NOW).settlement.wAfter).toBe(105);
  });

  it('同日暴雨升級黑雨唔會再加', () => {
    const s = game({ moisture: 60 });
    applyWarningWater(s, D, ['rainstorm'], null, NOW);
    expect(s.moisture).toBe(80);
    expect(applyWarningWater(s, D, ['rainstorm', 'blackrain'], null, NOW)).toEqual([]);
    expect(applyWarningWater(s, D, ['blackrain'], null, NOW)).toEqual([]);
    expect(s.moisture).toBe(80);
  });

  it('取消再發出嘅警告同日唔再計；第二日照計；酷熱同暴雨可以同日各計一次', () => {
    const s = game({ moisture: 60 });
    applyWarningWater(s, D, ['rainstorm'], null, NOW);
    applyWarningWater(s, D, [], null, NOW);
    expect(applyWarningWater(s, D, ['rainstorm'], null, NOW)).toEqual([]);
    expect(s.moisture).toBe(80);
    const hot = applyWarningWater(s, D, ['rainstorm', 'hot'], null, NOW);
    expect(hot.map((h) => h.event)).toEqual(['hot']);
    expect(s.moisture).toBe(60);
    expect(s.waterFx[D]).toEqual({ hot: true, rain: true });
    applyWarningWater(s, '2026-09-27', ['rainstorm'], null, NOW);
    expect(s.moisture).toBe(80);
  });

  it('連續暴雨唔疏水：由 100 開始第 5 日到 150，即刻瀕死', () => {
    const s = game({ moisture: 100, health: 100, resist: 100, nutrients: 100 });
    const want = [110, 120, 130, 140, 150];
    for (let i = 0; i < 5; i++) {
      const date = `2026-10-0${i + 1}`;
      const hits = applyWarningWater(s, date, ['rainstorm'], null, NOW + i * 86400000);
      expect(s.moisture).toBe(want[i]);
      if (i < 4) {
        expect(s.dying).toBeNull();
        expect(s.health).toBeGreaterThan(0);
        settleDay(s, date, ['rainstorm'], null, NOW + i * 86400000);
        expect(s.moisture).toBe(want[i]);
      } else {
        expect(hits[0]!.dying).toBe(true);
        expect(hits[0]!.message).toContain('瀕死');
        expect(s.dying).toEqual({ since: date, at: NOW + i * 86400000 });
        expect(s.health).toBe(0);
      }
    }
  });

  it('瀕死救返：水分 50–100 同養分 60 以上', () => {
    const s = game({ moisture: 150, nutrients: 70, health: 0, dying: { since: D, at: NOW } });
    s.moisture = 110;
    expect(checkRescue(s)).toBeNull();
    s.moisture = 100;
    expect(checkRescue(s)).toContain('救返');
    expect(s.health).toBe(10);
  });

  it('二級徽章：暴雨 30% 機率一半水分轉養分', () => {
    const meta = freshMeta();
    meta.badges['2'] = 1;
    let lucky = '';
    for (let d = 1; d <= 28 && !lucky; d++) {
      const date = `2026-10-${String(d).padStart(2, '0')}`;
      if (rollFor(`rain2n|${date}`) < 0.3) lucky = date;
    }
    expect(lucky).not.toBe('');
    const s = game({ moisture: 60, nutrients: 50 });
    const hits = applyWarningWater(s, lucky, ['rainstorm'], meta, NOW);
    expect(hits[0]!.toN).toBe(10);
    expect(s.moisture).toBe(70);
    expect(s.nutrients).toBe(60);
  });
});

describe('v12 夜間健康', () => {
  it('水分分數分級同邊界', () => {
    const ws = [0, 49, 49.9, 50, 100, 100.5, 101, 115, 116, 135, 136, 149];
    expect(ws.map(wFactor)).toEqual([-10, -10, -10, 5, 5, -10, -10, -10, -20, -20, -30, -30]);
    expect([49, 75, 110, 120, 140].map((w) => wTier(w).label)).toEqual(['乾旱', '適中', '輕度爛根', '嚴重爛根', '根部壞死']);
  });

  it('先計水分變化，再計健康：110 晴天 → 100 → +5', () => {
    const r = settleDay(game({ moisture: 110, nutrients: 90 }), D, ['clear'], null, NOW).settlement;
    expect(r.wAfter).toBe(100);
    expect(r.wFactor).toBe(5);
    expect(r.hAfter).toBe(80);
  });

  it('蟲害：水分超過 100 連續 3 晚觸發', () => {
    const s = game({ moisture: 130 });
    for (const d of ['2026-09-26', '2026-09-27', '2026-09-28']) settleDay(s, d, ['drizzle'], null, NOW);
    expect(s.pest.active).toBe(true);
  });

  it('今晚預計＝實際結算（包括未計嘅即時警告、蟲害、抗風力、長駐、徽章）', () => {
    const meta = freshMeta();
    meta.badges['1'] = 1;
    const cases: [Partial<GameState>, WeatherEventId[]][] = [
      [{ moisture: 60 }, ['clear']],
      [{ moisture: 95, resist: 50 }, ['rainstorm']],
      [{ moisture: 100 }, ['drizzle']],
      [{ moisture: 55, nutrients: 20 }, ['hot']],
      [{ moisture: 130, resist: 30 }, ['typhoon8', 'drizzle']],
      [{ moisture: 146 }, ['drizzle']],
      [{ moisture: 140 }, ['blackrain', 'thunder']],
      [{ moisture: 70, pest: { active: true, lowNDays: 0, wetDays: 0, since: D }, residents: ['a', 'b'] }, ['thunder']],
    ];
    for (const [over, events] of cases) {
      for (const m of [null, meta]) {
        const s = game(over);
        const p = previewNight(s, D, events, m);
        expect(s.moisture).toBe(over.moisture); // preview does not touch the state
        const r = settleDay(s, D, events, m, NOW).settlement;
        expect({ h: p.hAfter, w: p.wAfter, n: p.nAfter, ws: p.wScore, dmg: p.damage }).toEqual({ h: r.hAfter, w: r.wAfter, n: r.nAfter, ws: r.wFactor, dmg: r.finalDamage });
      }
    }
  });

  it('預計即時跟住疏水更新，建議同預計一致', () => {
    const s = game({ moisture: 120 });
    const before = previewNight(s, D, ['clear'], null);
    expect(before).toMatchObject({ wAfter: 110, wScore: -10, wLabel: '輕度爛根' });
    expect(advice(s, before, null)).toContain('今晚水分預計 110：輕度爛根 -10');
    drain(s);
    const after = previewNight(s, D, ['clear'], null);
    expect(after).toMatchObject({ wAfter: 100, wScore: 5 });
    expect(after.dH).toBe(before.dH + 15);
    const dry = game({ moisture: 55 });
    expect(advice(dry, previewNight(dry, D, ['clear'], null), null)).toContain('乾旱');
    const doom = game({ moisture: 146 });
    const p = previewNight(doom, D, ['drizzle'], null);
    expect(p.waterDeath).toBe(true);
    expect(advice(doom, p, null)).toContain('瀕死');
  });
});

describe('v12 存檔遷移', () => {
  it('舊 sekai-tree-v2 存檔保留水分，補上新欄位', () => {
    const old = game({ moisture: 72 }) as Partial<GameState> & Record<string, unknown>;
    delete old.waterFx;
    old.care = { ...old.care!, drain: undefined as unknown as number };
    old.dayEvents = { [D]: { events: ['rainstorm'], hko: true } };
    const s = parseSave(JSON.stringify(old))!;
    expect(s).not.toBeNull();
    expect(s.moisture).toBe(72);
    expect(s.waterFx).toEqual({});
    expect(s.care.drain).toBe(0);
    // The rainstorm recorded earlier today is applied once on next open.
    expect(applyWarningWater(s, D, ['rainstorm'], null, NOW)).toHaveLength(1);
    expect(s.moisture).toBe(92);
    expect(applyWarningWater(s, D, ['rainstorm'], null, NOW)).toHaveLength(0);
    const again = parseSave(JSON.stringify(s))!;
    expect(again.waterFx[D]).toEqual({ hot: false, rain: true });
  });
});
