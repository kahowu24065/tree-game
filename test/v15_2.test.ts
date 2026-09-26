import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { WEATHER_EVENTS } from '../src/balance';
import { campfireNightK, campfireSpot, mulchLaid, mulchRadii } from '../src/campfire';
import { ICONS } from '../src/icons';
import { createGame, freshCare, performEmergency } from '../src/sim';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';

const D = '2026-09-26';
const NEXT = '2026-09-27';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90 }, over);
}

describe('v15.2 保暖 = 根部覆蓋物', () => {
  it('覆蓋物：做咗保暖當日先有，重開仲喺度，第二日冇', () => {
    const s = game();
    expect(mulchLaid(s, D)).toBe(false);
    expect(performEmergency(s, 'warmCover', ['cold']).ok).toBe(true);
    expect(mulchLaid(s, D)).toBe(true);
    expect(mulchLaid(parseSave(JSON.stringify(s))!, D)).toBe(true);
    expect(mulchLaid(s, NEXT)).toBe(false);
    s.care = freshCare(NEXT);
    expect(mulchLaid(s, NEXT)).toBe(false);
  });

  it('冇寒冷就做唔到保暖，冇覆蓋物', () => {
    const s = game();
    expect(performEmergency(s, 'warmCover', ['clear']).ok).toBe(false);
    expect(mulchLaid(s, D)).toBe(false);
  });

  it('訊息、提示同說明講覆蓋法', () => {
    const r = performEmergency(game(), 'warmCover', ['cold']);
    expect(r.message.startsWith('保暖：喺樹根周圍鋪好覆蓋物')).toBe(true);
    expect(r.message).not.toContain('營火');
    expect(WEATHER_EVENTS.cold.tip).toContain('5–10 厘米');
    expect(WEATHER_EVENTS.cold.tip).toContain('樹皮、乾樹葉、稻草或木屑');
    const ui = fs.readFileSync(path.resolve(__dirname, '../src/ui.ts'), 'utf8');
    expect(ui).toContain('防止根部凍傷');
    expect(ui).toContain("icon('mulch')");
    expect(ui).not.toContain("icon('campfire')");
  });

  it('圖示：覆蓋物，冇營火圖示', () => {
    expect(ICONS).toHaveProperty('mulch');
    expect(ICONS).not.toHaveProperty('campfire');
  });

  it('覆蓋物範圍：由樹幹外面到泥地邊，粗樹幹都有一圈', () => {
    const a = mulchRadii(0.05, 0.4);
    expect(a.inner).toBeCloseTo(0.0525);
    expect(a.outer).toBeCloseTo(0.36);
    const b = mulchRadii(0.5, 1.65);
    expect(b.inner).toBeGreaterThan(0.5);
    expect(b.outer).toBeCloseTo(1.485);
    const c = mulchRadii(0.8, 1.2);
    expect(c.outer).toBeCloseTo(2.08);
    for (const [t, d] of [[0.01, 0.33], [0.2, 0.5], [1, 1.65]] as const) {
      const r = mulchRadii(t, d);
      expect(r.inner).toBeGreaterThan(t);
      expect(r.outer - r.inner).toBeGreaterThanOrEqual(0.12);
    }
  });
});

describe('v15.2 營火 = 每晚嘅特效', () => {
  it('日頭冇、夜晚有，黃昏／天光慢慢變', () => {
    expect(campfireNightK(1)).toBe(0);
    expect(campfireNightK(0.6)).toBe(0);
    expect(campfireNightK(0.55)).toBe(0);
    expect(campfireNightK(0.2)).toBe(1);
    expect(campfireNightK(0)).toBe(1);
    const mid = campfireNightK(0.375);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.7);
    let prev = -1;
    for (let d = 1; d >= 0; d -= 0.05) {
      const k = campfireNightK(d);
      expect(k).toBeGreaterThanOrEqual(prev);
      prev = k;
    }
  });

  it('同保暖／天氣無關：淨係睇日光', () => {
    // The predicate only takes the scene daylight — a cold day without 保暖 and a normal night are the same.
    expect(campfireNightK.length).toBe(1);
  });

  it('營火擺喺覆蓋物外面', () => {
    const m = mulchRadii(0.1, 0.5);
    const spot = campfireSpot({ trunkU: 0.22, clearU: m.outer * 1.06, fireU: 0.25, prefer: 2.2, blocked: () => false });
    expect(spot.dist - 0.25).toBeGreaterThan(m.outer);
    // Also when it has to fan out.
    const fan = campfireSpot({ trunkU: 0.22, clearU: m.outer * 1.06, fireU: 0.25, prefer: 2.2, blocked: (x, z) => Math.abs(Math.atan2(z, x) - 2.2) < 0.5 });
    expect(Math.hypot(fan.x, fan.z) - 0.25).toBeGreaterThan(m.outer);
  });
});
