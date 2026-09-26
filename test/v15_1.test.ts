import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { EMERGENCY_NAMES, WEATHER_EVENTS } from '../src/balance';
import { campfireLit, campfireRadiusUnits, campfireSpot } from '../src/campfire';
import { ICONS } from '../src/icons';
import { emergencyName, setLabelRegion } from '../src/labels';
import { createGame, freshCare, performEmergency, planNight, perksFrom, previewNight } from '../src/sim';
import { parseSave } from '../src/storage';
import { freshMeta } from '../src/meta';
import type { GameState } from '../src/types';
import { previewLines } from '../src/ui';

const D = '2026-09-26';
const NEXT = '2026-09-27';

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  s.dailyEventId = 'quiet';
  return Object.assign(s, { health: 70, moisture: 60, nutrients: 90 }, over);
}

afterEach(() => setLabelRegion('hk'));

describe('v15.1 保暖覆蓋 → 保暖', () => {
  it('名稱香港／外地都叫「保暖」，內部 id 照用 warmCover', () => {
    expect(EMERGENCY_NAMES.warmCover).toEqual({ hk: '保暖', intl: '保暖' });
    expect(emergencyName('warmCover', 'hk')).toBe('保暖');
    expect(emergencyName('warmCover', 'intl')).toBe('保暖');
    expect(freshCare(D)).toHaveProperty('warmCover', false);
  });

  it('冇寒冷警告：「今日冇寒冷警告，唔使做保暖。」', () => {
    const r = performEmergency(game(), 'warmCover', ['clear']);
    expect(r.ok).toBe(false);
    expect(r.message).toBe('今日冇寒冷警告，唔使做保暖。');
  });

  it('做咗：訊息、日誌標題都叫保暖，冇「保暖覆蓋」', () => {
    const s = game();
    const r = performEmergency(s, 'warmCover', ['cold']);
    expect(r.ok).toBe(true);
    expect(r.message.startsWith('保暖：')).toBe(true);
    expect(r.message).toContain('營火');
    expect(r.message).not.toContain('保暖覆蓋');
    const entry = s.log.find((e) => e.kind === 'emergency')!;
    expect(entry.title).toBe('保暖');
    expect(JSON.stringify(s.log)).not.toContain('保暖覆蓋');
    expect(performEmergency(s, 'warmCover', ['cold']).message).toBe('今日做咗保暖喇。');
  });

  it('今晚預計／提示／天氣說明都改名', () => {
    const a = game();
    const lines = previewLines(previewNight(a, D, ['cold'], freshMeta()));
    const cold = lines.find((l) => l.text.startsWith('寒｜寒冷'))!;
    expect(cold.sub).toBe('做「保暖」就唔扣');
    performEmergency(a, 'warmCover', ['cold']);
    const done = previewLines(previewNight(a, D, ['cold'], freshMeta())).find((l) => l.text.startsWith('寒｜寒冷'))!;
    expect(done.sub).toBe('做咗保暖');
    expect(WEATHER_EVENTS.cold.tip).toContain('「保暖」');
    expect(WEATHER_EVENTS.cold.tip).not.toContain('保暖覆蓋');
    const plan = planNight(game(), ['cold'], perksFrom(null), D);
    expect(plan.cold?.handled).toBe(false);
  });

  it('成個 src 淨係存檔轉換先會出現「保暖覆蓋」', () => {
    const root = path.resolve(__dirname, '../src');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(ts|css|html)$/.test(f.name) && fs.readFileSync(p, 'utf8').includes('保暖覆蓋')) hits.push(path.relative(root, p));
      }
    };
    walk(root);
    expect(hits).toEqual(['storage.ts']);
    expect(fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')).not.toContain('保暖覆蓋');
  });

  it('舊存檔：日誌／晨報入面嘅「保暖覆蓋」改做「保暖」，warmCover 照保留', () => {
    const s = game();
    performEmergency(s, 'warmCover', ['cold']);
    s.log.push({ date: D, text: '保暖覆蓋：幫棵樹蓋好保暖布、根部鋪好覆蓋物。', kind: 'emergency', title: '保暖覆蓋' });
    s.morningNote = '寒冷：做咗保暖覆蓋，唔扣健康';
    const back = parseSave(JSON.stringify(s))!;
    expect(back.care.warmCover).toBe(true);
    expect(JSON.stringify(back.log)).not.toContain('保暖覆蓋');
    expect(back.log[back.log.length - 1]!.title).toBe('保暖');
    expect(back.morningNote).toBe('寒冷：做咗保暖，唔扣健康');
  });

  it('保暖掣圖示換咗營火', () => {
    expect(ICONS).toHaveProperty('campfire');
    expect(ICONS).not.toHaveProperty('cover');
  });
});

describe('v15.1 營火', () => {
  it('做咗保暖當日先有營火；第二日、未做、完咗局都冇', () => {
    const s = game();
    expect(campfireLit(s, D)).toBe(false);
    performEmergency(s, 'warmCover', ['cold']);
    expect(campfireLit(s, D)).toBe(true);
    // Reload keeps it (the flag lives in the save).
    expect(campfireLit(parseSave(JSON.stringify(s))!, D)).toBe(true);
    // Next game day: old care still dated yesterday → no fire; fresh care → no fire.
    expect(campfireLit(s, NEXT)).toBe(false);
    s.care = freshCare(NEXT);
    expect(campfireLit(s, NEXT)).toBe(false);
    const over = game();
    performEmergency(over, 'warmCover', ['cold']);
    over.over = { kind: 'dead', date: D, tiers: [], days: 1 } as unknown as GameState['over'];
    expect(campfireLit(over, D)).toBe(false);
    const idle = game({ started: false });
    idle.care.warmCover = true;
    expect(campfireLit(idle, D)).toBe(false);
  });

  it('大小：細樹 0.2–0.32 島單位（幼苗再細啲），大樹跟樹高（最多 1.2）', () => {
    expect(campfireRadiusUnits(1, 0.2)).toBe(0.32);
    expect(campfireRadiusUnits(3, 40)).toBe(0.2);
    expect(campfireRadiusUnits(1, 1)).toBeCloseTo(0.32);
    expect(campfireRadiusUnits(1, 2)).toBeCloseTo(0.2);
    expect(campfireRadiusUnits(2.5, 6, 11)).toBeCloseTo(0.66);
    expect(campfireRadiusUnits(3, 20, 60)).toBe(1.2);
    // Seedling: trimmed so the flames stay below the tree top.
    expect(campfireRadiusUnits(1, 0.24, 0.75)).toBeCloseTo(0.21);
    expect(campfireRadiusUnits(1, 0.1, 0.2)).toBeCloseTo(0.16);
    expect(campfireRadiusUnits(1, 0.24, 3)).toBeCloseTo(0.32);
    for (const k of [0.05, 0.3, 1, 5, 30]) for (const h of [0, 0.3, 1, 10, 40]) {
      const r = campfireRadiusUnits(2, k, h);
      expect(r).toBeGreaterThanOrEqual(0.16);
      expect(r).toBeLessThanOrEqual(1.2);
    }
  });

  it('位置：唔會掂到樹幹，避開擋住嘅地方，揀唔到就退後', () => {
    const free = campfireSpot({ trunkU: 0.3, fireU: 0.25, prefer: 2.2, blocked: () => false });
    expect(free.angle).toBeCloseTo(2.2);
    expect(free.dist).toBeGreaterThanOrEqual(0.3 + 0.25);
    // Block everything near the preferred angle → it fans out, still clear of the trunk.
    const fan = campfireSpot({ trunkU: 0.3, fireU: 0.25, prefer: 2.2, blocked: (x, z) => Math.abs(Math.atan2(z, x) - 2.2) < 0.6 });
    expect(Math.abs(fan.angle - 2.2)).toBeGreaterThanOrEqual(0.6);
    expect(Math.hypot(fan.x, fan.z)).toBeGreaterThan(0.55);
    // A ring of water close to the trunk → moves farther out.
    const far = campfireSpot({ trunkU: 0.3, fireU: 0.25, prefer: 2.2, blocked: (x, z, r) => Math.hypot(x, z) - r < 0.8 });
    expect(Math.hypot(far.x, far.z) - 0.25).toBeGreaterThanOrEqual(0.8);
    // Nowhere free → preferred spot at the minimum clearance (never inside the trunk).
    const none = campfireSpot({ trunkU: 0.3, fireU: 0.25, prefer: 2.2, blocked: () => true });
    expect(none.dist).toBeGreaterThan(0.55);
  });
});
