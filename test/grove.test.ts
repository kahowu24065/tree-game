import { describe, expect, it } from 'vitest';
import { brokeRecord, canOpenSecond, parseGrove } from '../src/grove';
import { newGame, freshMeta } from '../src/meta';
import type { MilestoneAward } from '../src/types';

const award = { id: 'record', tier: null, date: '2026-09-28', ageDays: 40, heightCm: 5100, share: 1.02 } as MilestoneAward;

describe('第二座空島', () => {
  it('未破紀錄唔可以過去', () => {
    const home = newGame(freshMeta(), '2026-09-28', '世界之樹', 'camphor');
    expect(brokeRecord(home)).toBe(false);
    expect(canOpenSecond(home)).toBe(false);
  });

  it('高過紀錄高度就可以去第二座島', () => {
    const home = newGame(freshMeta(), '2026-09-28', '世界之樹', 'camphor');
    home.milestones.record = award;
    expect(canOpenSecond(home)).toBe(true);
    home.milestones = {};
    home.heightCm = home.targetCm! + 1;
    expect(brokeRecord(home)).toBe(true);
  });

  it('冇 grove 檔就當第一座島', () => {
    const home = newGame(freshMeta(), '2026-09-28', '世界之樹', 'banyan');
    const grove = parseGrove(null, home);
    expect(grove.isle).toBe(0);
    expect(grove.home.treeName).toBe('世界之樹');
    expect(grove.second).toBeNull();
  });

  it('存檔可以讀返第二棵樹', () => {
    const home = newGame(freshMeta(), '2026-09-28', '大樟', 'camphor');
    const second = newGame(freshMeta(), '2026-09-28', '新木棉', 'cotton');
    const raw = JSON.stringify({ version: 1, isle: 1, home, second });
    const grove = parseGrove(raw, home);
    expect(grove.isle).toBe(1);
    expect(grove.home.treeName).toBe('大樟');
    expect(grove.second?.treeName).toBe('新木棉');
    expect(grove.second?.species).toBe('cotton');
  });
});
