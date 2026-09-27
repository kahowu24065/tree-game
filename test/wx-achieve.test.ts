import { describe, expect, it } from 'vitest';
import { addDays } from '../src/dates';
import { guideModal } from '../src/guide';
import { setLabelRegion, weatherAchievementCopy } from '../src/labels';
import { bookWeather, freshMeta } from '../src/meta';
import { checkWeatherAchievements, createGame, settleDay } from '../src/sim';
import { isWxAwardCount, nextWxAwardCount } from '../src/balance';
import { parseSave } from '../src/storage';
import type { GameState } from '../src/types';

const NOW = Date.UTC(2026, 8, 25, 4);
const D0 = '2026-09-01';

function tree(over: Partial<GameState> = {}): GameState {
  const s = createGame(D0, { name: '世界之樹' });
  s.started = true;
  return Object.assign(s, { health: 90, moisture: 60, nutrients: 80, resist: 60 }, over);
}

function brace(s: GameState): void {
  Object.assign(s, { resist: 100, health: 90, windUnlocked: true, heightCm: 800 });
}

describe('成就', () => {
  it('同一場風暴跨幾日只計一次；停一日之後先算新一場，每次都可以拎', () => {
    const s = tree();
    for (let i = 0; i < 3; i++) {
      brace(s);
      settleDay(s, addDays(D0, i), ['thunder'], null, NOW);
    }
    expect(s.wx?.counts.storm).toBe(1);
    expect(s.wx?.awards['storm:1']).toMatchObject({ ageDays: 1 });
    expect(s.wx?.awards['storm:2']).toBeUndefined();
    expect(s.wx?.counts.t8).toBe(0);
    brace(s);
    settleDay(s, addDays(D0, 3), ['clear'], null, NOW);
    brace(s);
    settleDay(s, addDays(D0, 4), ['thunder'], null, NOW);
    expect(s.wx?.counts.storm).toBe(2);
    expect(s.wx?.awards['storm:2']).toBeTruthy();
    expect(nextWxAwardCount('storm', 2)).toBe(3);
    expect(isWxAwardCount('storm', 3)).toBe(true);
    expect(isWxAwardCount('heat', 3)).toBe(false);
    expect(isWxAwardCount('heat', 200)).toBe(true);
    expect(nextWxAwardCount('heat', 6)).toBe(10);
    expect(nextWxAwardCount('heat', 100)).toBe(200);

    const n = s.wx!.counts.storm;
    checkWeatherAchievements(s, addDays(D0, 4), { survived: true, wind: 'thunder', rainHandled: null, heatHandled: false, coldHandled: false });
    expect(s.wx?.counts.storm).toBe(n);
  });

  it('捱過八號風球先計，青年樹前或者淨係見到風球唔計', () => {
    const young = tree();
    settleDay(young, D0, ['typhoon8'], null, NOW);
    expect(young.wx?.counts.t8).toBe(0);
    expect(young.wx?.counts.storm).toBe(0);
    expect(young.wx?.awards['t8:1']).toBeUndefined();

    const braced = tree();
    brace(braced);
    settleDay(braced, D0, ['typhoon8'], null, NOW);
    expect(braced.stormSurvivals).toBe(1);
    expect(braced.wx?.counts.storm).toBe(1);
    expect(braced.wx?.counts.t8).toBe(1);
    expect(braced.wx?.awards['storm:1']?.date).toBe(D0);
    expect(braced.wx?.awards['t8:1']?.date).toBe(D0);
    brace(braced);
    settleDay(braced, addDays(D0, 1), ['typhoon8'], null, NOW);
    expect(braced.wx?.counts.storm).toBe(1);
    expect(braced.wx?.counts.t8).toBe(1);
  });

  it('黑雨同暴雨要做咗疏水先計；酷熱要做咗澆水', () => {
    const missed = tree();
    settleDay(missed, D0, ['blackrain'], null, NOW);
    expect(missed.health).toBeGreaterThan(0);
    expect(missed.wx?.counts.black).toBe(0);

    const drained = tree();
    drained.care.date = D0;
    drained.care.rainDrain = true;
    settleDay(drained, D0, ['blackrain'], null, NOW);
    expect(drained.wx?.counts.black).toBe(1);
    expect(drained.wx?.awards['black:1']).toBeTruthy();
    expect(drained.wx?.counts.rain).toBe(0);
    drained.care.date = addDays(D0, 1);
    drained.care.rainDrain = true;
    settleDay(drained, addDays(D0, 1), ['blackrain'], null, NOW);
    expect(drained.wx?.counts.black).toBe(1);

    const shower = tree();
    shower.care.date = D0;
    shower.care.rainDrain = true;
    settleDay(shower, D0, ['rainstorm'], null, NOW);
    shower.care.date = addDays(D0, 1);
    shower.care.rainDrain = true;
    settleDay(shower, addDays(D0, 1), ['blackrain'], null, NOW);
    expect(shower.wx?.counts.rain).toBe(1);
    expect(shower.wx?.counts.black).toBe(0);
    expect(shower.wx?.awards['rain:1']).toBeTruthy();

    const bare = tree();
    settleDay(bare, D0, ['hot'], null, NOW);
    expect(bare.wx?.counts.heat).toBe(0);
    const watered = tree();
    watered.care.date = addDays(D0, 1);
    watered.care.heatWater = true;
    settleDay(watered, addDays(D0, 1), ['hot'], null, NOW);
    expect(watered.wx?.counts.heat).toBe(1);
    expect(watered.wx?.awards['heat:1']).toBeTruthy();
    for (let i = 2; i <= 5; i++) {
      watered.care.date = addDays(D0, i);
      watered.care.heatWater = true;
      watered.health = 90;
      settleDay(watered, addDays(D0, i), ['hot'], null, NOW);
    }
    expect(watered.wx?.counts.heat).toBe(5);
    expect(watered.wx?.awards['heat:5']).toBeTruthy();
    expect(watered.wx?.awards['heat:2']).toBeUndefined();
    expect(watered.wx?.awards['heat:3']).toBeUndefined();
  });

  it('枯死嗰晚唔計', () => {
    const s = tree({ resist: 10, windUnlocked: true, heightCm: 800, collapses: 2 });
    settleDay(s, D0, ['typhoon8'], null, NOW);
    expect(s.over).toBeTruthy();
    expect(s.wx?.counts.storm).toBe(0);
    expect(s.wx?.counts.t8).toBe(0);
    expect(s.wx?.awards['t8:1']).toBeUndefined();
  });

  it('收藏只入一次', () => {
    const s = tree();
    brace(s);
    settleDay(s, D0, ['thunder'], null, NOW);
    const meta = freshMeta();
    expect(bookWeather(meta, s)).toEqual(['捱過 1 個風暴']);
    expect(bookWeather(meta, s)).toEqual([]);
    expect(meta.weather).toHaveLength(1);
  });

  it('香港以外叫暴風、豪雨、大雨；玩法唔再寫連續有太陽', () => {
    setLabelRegion('intl');
    expect(weatherAchievementCopy('t8:1').title).toBe('捱過 1 個暴風');
    expect(weatherAchievementCopy('t8:5').title).toBe('捱過 5 個暴風');
    expect(weatherAchievementCopy('black:1').title).toBe('捱過 1 場豪雨');
    expect(weatherAchievementCopy('rain:1').title).toBe('捱過 1 場大雨');
    setLabelRegion('hk');
    expect(weatherAchievementCopy('t8:1').title).toBe('捱過 1 個八號風球');
    expect(weatherAchievementCopy('black:1').title).toBe('捱過 1 場黑雨');
    const help = guideModal('play');
    expect(help).toContain('橫跨幾日都係同一場');
    expect(help).not.toContain('第一、第三、第五次');
  });

  it('舊存檔嘅連續有太陽會清走', () => {
    const s = tree();
    (s as GameState & { wx: object }).wx = { sunny: 4, date: D0, awards: { sun7: { id: 'sun7', date: D0, ageDays: 7 } } };
    const parsed = parseSave(JSON.stringify(s));
    expect(parsed?.wx?.counts).toMatchObject({ storm: 0, black: 0, t8: 0 });
    expect(parsed?.wx?.awards).toEqual({});
    const ranked = tree();
    ranked.wx = {
      date: D0,
      counts: { storm: 5, t8: 0, black: 0, rain: 0, heat: 0, cold: 0 },
      awards: {
        storm1: { id: 'storm1' as 'storm:1', date: D0, ageDays: 1 },
        storm3: { id: 'storm3' as 'storm:1', date: D0, ageDays: 3 },
        storm5: { id: 'storm5' as 'storm:1', date: D0, ageDays: 5 },
      },
    };
    const kept = parseSave(JSON.stringify(ranked));
    expect(kept?.wx?.counts.storm).toBe(5);
    expect(kept?.wx?.awards['storm:1']?.ageDays).toBe(1);
    expect(kept?.wx?.awards['storm:3']?.ageDays).toBe(3);
    expect(kept?.wx?.awards['storm:5']?.ageDays).toBe(5);
    expect(Object.keys(kept?.wx?.awards ?? {}).sort()).toEqual(['storm:1', 'storm:3', 'storm:5']);
  });
});
