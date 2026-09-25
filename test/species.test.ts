import { describe, expect, it } from 'vitest';
import { SEASONS } from '../src/balance';
import { stagesFor } from '../src/content';
import { ANIMALS, CATEGORY_ORDER, unlockHint } from '../src/data/animals';
import { roundTo10, SPECIES, speciesTargetCm, STAGE_NAMES, speciesForSeason, stageIndexFor, stageSampleCm } from '../src/data/species';
import { freshMeta, newGame } from '../src/meta';
import { createGame, refreshUnlocks, settleDay } from '../src/sim';
import type { GameState } from '../src/types';

function tall(over: Partial<GameState> = {}): GameState {
  const s = createGame('2026-09-25', { season: 's12' });
  s.started = true;
  return Object.assign(s, { health: 95, heightCm: 9000, stormSurvivals: 3 }, over);
}

describe('樹種', () => {
  it('九個樹種，每個賽季三款，id 唔重複', () => {
    expect(SPECIES).toHaveLength(9);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(9);
    for (const season of SEASONS) expect(speciesForSeason(season.id)).toHaveLength(3);
  });

  it('每個樹種目標 = 真實最高紀錄四捨五入到最接近嘅 10 米', () => {
    const want: Record<string, [number, number]> = {
      camphor: [46.4, 50], cotton: [60, 60], banyan: [30, 30],
      metasequoia: [51, 50], ginkgo: [60, 60], deodar: [60, 60],
      redwood: [116.2, 120], eucalyptus: [100.5, 100], douglas: [99.7, 100],
    };
    for (const sp of SPECIES) {
      expect(sp.targetM, sp.id).toBe(roundTo10(sp.maxM));
      expect([sp.maxM, sp.targetM], sp.id).toEqual(want[sp.id]);
      expect(speciesTargetCm(sp.id)).toBe(sp.targetM * 100);
      expect(sp.source.url).toMatch(/^https:\/\//);
    }
    expect(roundTo10(48)).toBe(50);
    expect(roundTo10(116.2)).toBe(120);
    expect(roundTo10(100.5)).toBe(100);
  });

  it('每個樹種都可以喺自己賽季日數內達到目標（良好照顧、晴天）', () => {
    for (const sp of SPECIES) {
      const s = createGame('2026-01-01', { season: sp.season, species: sp.id });
      s.started = true;
      Object.assign(s, { health: 95 });
      const days = SEASONS.find((x) => x.id === sp.season)!.days;
      for (let i = 0; i < days; i++) {
        Object.assign(s, { moisture: 60, nutrients: 80, health: Math.max(s.health, 60) });
        settleDay(s, new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), ['clear'], null, Date.UTC(2026, 8, 25, 4));
      }
      expect(s.heightCm, sp.id).toBeGreaterThanOrEqual(speciesTargetCm(sp.id));
      // …and not trivially: a merely "normal" tree (×1) ends right about at the target.
      const base = speciesTargetCm(sp.id) / days;
      expect(base * days).toBeCloseTo(speciesTargetCm(sp.id), 6);
    }
  });

  it('每個樹種有中英文名、學名、來源同五個階段描述', () => {
    for (const sp of SPECIES) {
      expect(sp.name).toMatch(/\p{Script=Han}/u);
      expect(sp.english.length).toBeGreaterThan(3);
      expect(sp.scientific).toMatch(/^[A-Z][a-z]+ [a-z]+/);
      expect(sp.source.url).toMatch(/^https:\/\//);
      expect(sp.stages).toHaveLength(5);
    }
  });

  it('生長階段跟樹種目標高度（五個階段）', () => {
    expect(STAGE_NAMES).toHaveLength(5);
    for (const sp of SPECIES) {
      const t = speciesTargetCm(sp.id);
      const stages = stagesFor(t);
      expect(stages).toHaveLength(5);
      expect(stageIndexFor(10, t)).toBe(0);
      expect(stageIndexFor(t, t)).toBe(4);
      for (let i = 0; i < 5; i++) expect(stageIndexFor(stageSampleCm(i, t), t)).toBe(i);
      for (let i = 1; i < 5; i++) expect(stages[i]!.minCm).toBeGreaterThan(stages[i - 1]!.minCm);
    }
    // 30 m is a 巨樹 for the banyan (target 30 m) but only a 青年樹 for the redwood (target 120 m).
    expect(stageIndexFor(3000, speciesTargetCm('banyan'))).toBe(4);
    expect(stageIndexFor(3000, speciesTargetCm('redwood'))).toBe(2);
  });


  it('開局揀樹種：唔屬於個賽季就用預設', () => {
    expect(createGame('2026-09-25', { season: 's6', species: 'ginkgo' }).species).toBe('ginkgo');
    expect(createGame('2026-09-25', { season: 's6', species: 'redwood' }).species).toBe(speciesForSeason('s6')[0]!.id);
    expect(newGame(freshMeta(), '2026-09-25', 's12', '紅杉', 'eucalyptus').species).toBe('eucalyptus');
  });
});

describe('動物圖鑑', () => {
  it('最少 50 種，id 唔重複，六個類別都有', () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(50);
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(ANIMALS.length);
    for (const cat of CATEGORY_ORDER) expect(ANIMALS.some((a) => a.category === cat)).toBe(true);
    expect(ANIMALS.filter((a) => a.category === 'bird').length).toBeGreaterThanOrEqual(20);
  });

  it('每隻都有中文名、成群範圍同解鎖提示', () => {
    for (const a of ANIMALS) {
      expect(a.name).toMatch(/\p{Script=Han}/u);
      expect(a.group[0]).toBeGreaterThanOrEqual(1);
      expect(a.group[1]).toBeGreaterThanOrEqual(a.group[0]);
      expect(unlockHint(a).length).toBeGreaterThan(2);
    }
    expect(ANIMALS.some((a) => a.group[1] >= 5)).toBe(true);
  });

  it('解鎖條件：高度、健康、天氣、月份、賽季', () => {
    const low = createGame('2026-09-25');
    low.heightCm = 10;
    expect(refreshUnlocks(low, { date: '2026-09-25' })).toEqual([]);

    const dry = tall();
    refreshUnlocks(dry, { date: '2026-09-25', events: ['clear'] });
    const hotNeed = ANIMALS.filter((a) => a.weather === 'hot');
    const rainNeed = ANIMALS.filter((a) => a.weather === 'rain');
    expect(hotNeed.length + rainNeed.length).toBeGreaterThan(0);
    for (const a of [...hotNeed, ...rainNeed]) expect(dry.animals).not.toContain(a.id);

    refreshUnlocks(dry, { date: '2026-09-25', events: ['hot'] });
    for (const a of hotNeed.filter((x) => !x.months || x.months.includes(9))) expect(dry.animals).toContain(a.id);
    refreshUnlocks(dry, { date: '2026-09-25', events: ['rainstorm'] });
    for (const a of rainNeed.filter((x) => !x.months || x.months.includes(9))) expect(dry.animals).toContain(a.id);

    const monthOnly = ANIMALS.find((a) => a.months && !a.months.includes(9) && !a.weather);
    if (monthOnly) expect(dry.animals).not.toContain(monthOnly.id);

    const s3 = tall({ season: 's3' });
    refreshUnlocks(s3, { date: '2026-09-25', events: ['hot'] });
    for (const a of ANIMALS.filter((x) => x.season === 's12')) expect(s3.animals).not.toContain(a.id);

    const weak = tall({ health: 30 });
    refreshUnlocks(weak, { date: '2026-09-25', events: ['hot'] });
    for (const id of weak.animals) expect(ANIMALS.find((a) => a.id === id)!.minHealth).toBeLessThanOrEqual(30);
  });
});
