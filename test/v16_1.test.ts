import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, windStageCm } from '../src/sim';
import type { GameState } from '../src/types';
import { clockLeft, nextNoteKey, noteCards, pickNoteKey } from '../src/ui';

const D = '2026-09-26';
const HOUR = 3600 * 1000;

function game(over: Partial<GameState> = {}): GameState {
  const s = createGame(D);
  s.started = true;
  return Object.assign(s, over);
}
/** 瀕死 + a collapse last night (double-R day, not yet seen) + a morning note. */
function everything(): GameState {
  const s = game({ heightCm: 0, windUnlocked: true, windExplained: true, morningNote: '昨晚結算：高級颱風。', collapses: 1 });
  s.heightCm = windStageCm(s) + 400;
  s.dying = { since: D, at: Date.now() };
  s.health = 0;
  s.doubleRDate = s.care.date;
  s.doubleRSeen = false;
  return s;
}

describe('v16.1 note stack', () => {
  it('priority: 瀕死 > 倒塌 > morning note', () => {
    const s = everything();
    const keys = noteCards(s, 24 * HOUR).map((c) => c.key);
    expect(keys).toEqual(['dying', 'collapse', 'note']);
    s.doubleRSeen = true;
    expect(noteCards(s, HOUR).map((c) => c.key)).toEqual(['dying', 'note']);
  });

  it('瀕死 card: short title part for narrow phones, 「去救」 opens the care panel, countdown in the text', () => {
    const [c] = noteCards(game({ dying: { since: D, at: 0 }, health: 0 }), 23 * HOUR + 59 * 60000 + 30000);
    expect(c!.key).toBe('dying');
    expect(c!.title).toBe('瀕死<span class="nc-long">・剩</span> 23:59');
    expect(c!.btns).toContain('data-open="care"');
    expect(c!.btns).toContain('去救');
    expect(c!.body).toContain('23 小時 59 分');
  });

  it('nothing before the game starts or after it ends; morning note alone', () => {
    expect(noteCards({ ...game({ morningNote: 'x' }), started: false }, 0)).toEqual([]);
    const dead = game({ dying: { since: D, at: 0 }, morningNote: null });
    dead.over = { kind: 'dead', date: D, tiers: [], days: 1, fallSeen: true };
    expect(noteCards(dead, 0)).toEqual([]);
    const cards = noteCards(game({ morningNote: '<b>昨晚</b>' }), 0);
    expect(cards.map((c) => c.key)).toEqual(['note']);
    expect(cards[0]!.body).toBe('&lt;b&gt;昨晚&lt;/b&gt;');
    expect(cards[0]!.btns).toContain('dismiss-note');
  });

  it('clockLeft: HH:MM, rounded down, never negative', () => {
    expect(clockLeft(24 * HOUR)).toBe('24:00');
    expect(clockLeft(5 * 60000 + 59999)).toBe('00:05');
    expect(clockLeft(-1000)).toBe('00:00');
  });

  it('pager: stays on the current card, wraps, a newly urgent card takes over', () => {
    expect(pickNoteKey([], 'note', [])).toBeNull();
    expect(pickNoteKey(['collapse', 'note'], null, [])).toBe('collapse');
    expect(pickNoteKey(['collapse', 'note'], 'note', ['collapse', 'note'])).toBe('note');
    // The shown card was dismissed → most urgent left.
    expect(pickNoteKey(['collapse'], 'note', ['collapse', 'note'])).toBe('collapse');
    // 瀕死 starts while the player is on the morning note → 瀕死 shows.
    expect(pickNoteKey(['dying', 'collapse', 'note'], 'note', ['collapse', 'note'])).toBe('dying');
    // A less urgent card appearing does not steal the view.
    expect(pickNoteKey(['dying', 'note'], 'dying', ['dying'])).toBe('dying');
    expect(nextNoteKey(['dying', 'collapse', 'note'], 'dying')).toBe('collapse');
    expect(nextNoteKey(['dying', 'collapse', 'note'], 'note')).toBe('dying');
    expect(nextNoteKey(['note'], 'note')).toBe('note');
    expect(nextNoteKey([], null)).toBeNull();
  });
});

describe('v16.1 layout markup', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  it('no floating place pill; the weather card is a container (not a button)', () => {
    expect(html).not.toContain('place-pill');
    expect(html).not.toContain('top-right');
    expect(html).toMatch(/<div class="glass weather-card" id="weather-card"><\/div>/);
  });
  it('settings button sits in the 成長日誌 panel, outside the drag handle', () => {
    const sheet = html.slice(html.indexOf('id="sheet"'), html.indexOf('id="sheet-body"'));
    const handle = sheet.slice(sheet.indexOf('id="sheet-handle"'), sheet.indexOf('</div>'));
    expect(sheet).toContain('id="gear"');
    expect(handle).not.toContain('id="gear"');
  });
});
