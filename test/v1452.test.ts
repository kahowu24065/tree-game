// 1.4.52: egg rewards, keep-warm (−1 h), and decoration-reveal bookkeeping.
import { describe, expect, it } from 'vitest';
import { createGame } from '../src/sim';
import { freshMeta } from '../src/meta';
import { decodeSave, encodeSave } from '../src/saveCode';
import { parseSave } from '../src/storage';
import { t } from '../src/i18n';
import {
  NEST_HATCH_MS,
  NEST_WARM_MS,
  eggHatchAt,
  firstEggDecision,
  freshNest,
  markNestRevealed,
  migrateNest,
  nestBuilds,
  nestHatchAt,
  nestRewardFor,
  nestRewardText,
  pendingNestReveals,
  revealedNestBuilds,
  settleNest,
  tickNest,
  warmEgg,
} from '../src/nest';

function tree() {
  const state = createGame('2026-09-01');
  state.started = true;
  state.health = 96;
  state.animals = ['sparrow', 'bulbul', 'magpierobin'];
  state.nest = freshNest();
  return state;
}

describe('1.4.52 egg rewards', () => {
  it('picks build, then growth, then badge, then nothing', () => {
    expect(nestRewardFor(1)).toEqual({ kind: 'build', build: 'windmill' });
    expect(nestRewardFor(5)).toEqual({ kind: 'growth' });
    expect(nestRewardFor(10)).toEqual({ kind: 'build', build: 'statue' });
    expect(nestRewardFor(15)).toEqual({ kind: 'growth' });
    expect(nestRewardFor(20)).toEqual({ kind: 'build', build: 'house' });
    expect(nestRewardFor(25)).toEqual({ kind: 'growth' });
    expect(nestRewardFor(2).kind).toBe('none');
    expect(nestRewardFor(3).kind).toBe('none');
    // Every award step is also a decoration or a growth night, so no hatch is badge-only.
    let badgeOnly: number | null = null;
    for (let n = 1; n <= 200; n++) if (nestRewardFor(n).kind === 'badge') badgeOnly = n;
    expect(badgeOnly).toBeNull();
  });

  it('describes the reward without promising a fixed amount of growth', () => {
    expect(nestRewardText(1)).toContain('孵化後：島上會多');
    expect(nestRewardText(1)).toContain('風車');
    expect(nestRewardText(5)).toBe('孵化後：當晚生長多約三成');
    expect(nestRewardText(2)).toBe('孵化後：雀仔會飛出嚟陪你');
    expect(t('nest.reward.badge')).toBe('孵化後：得到成就徽章');
  });
});

describe('1.4.52 keep warm', () => {
  const laid = 1_000_000_000_000;

  it('hatches an hour earlier only after the egg is warmed', () => {
    const state = tree();
    state.nest!.egg = { bird: 'sparrow', laidAt: laid, hatchedAt: null };
    expect(eggHatchAt(state.nest!.egg!)).toBe(laid + NEST_HATCH_MS);
    expect(nestHatchAt(state)).toBe(laid + NEST_HATCH_MS);
    state.nest!.egg!.warmed = true;
    expect(eggHatchAt(state.nest!.egg!)).toBe(laid + NEST_HATCH_MS - NEST_WARM_MS);
    expect(nestHatchAt(state)).toBe(laid + NEST_HATCH_MS - NEST_WARM_MS);
  });

  it('allows keep-warm once, and refuses none / already / hatched / soon', () => {
    const state = tree();
    expect(warmEgg(state, laid)).toEqual({ ok: false, reason: 'none' });

    state.nest!.egg = { bird: 'sparrow', laidAt: laid, hatchedAt: null };
    expect(warmEgg(state, laid + NEST_HATCH_MS - NEST_WARM_MS)).toEqual({ ok: false, reason: 'soon' });
    expect(state.nest!.egg!.warmed).toBeFalsy();

    expect(warmEgg(state, laid).ok).toBe(true);
    expect(state.nest!.egg!.warmed).toBe(true);
    expect(warmEgg(state, laid)).toEqual({ ok: false, reason: 'already' });

    state.nest!.egg = { bird: 'sparrow', laidAt: laid, hatchedAt: laid + NEST_HATCH_MS };
    expect(warmEgg(state, laid)).toEqual({ ok: false, reason: 'hatched' });
  });

  it('ticks a warmed egg at laidAt + 5 h and not before', () => {
    const state = tree();
    state.nest!.egg = { bird: 'sparrow', laidAt: laid, hatchedAt: null, warmed: true };
    state.nest!.laidOn = '2026-09-01';
    expect(tickNest(state, laid + NEST_HATCH_MS - NEST_WARM_MS - 1, '2026-09-01').hatched).toBe(false);
    expect(state.nest!.egg!.hatchedAt).toBeNull();
    expect(tickNest(state, laid + NEST_HATCH_MS - NEST_WARM_MS, '2026-09-01').hatched).toBe(true);
    expect(state.nest!.egg!.hatchedAt).toBe(laid + 5 * 3600_000);
  });

  it('pays a warmed egg when settlement falls between 5 h and 6 h', () => {
    const early = tree();
    early.nest!.egg = { bird: 'bulbul', laidAt: laid, hatchedAt: null, warmed: true };
    expect(settleNest(early, laid + NEST_HATCH_MS - NEST_WARM_MS - 1, '2026-09-01').paid).toBe(false);

    const due = tree();
    due.nest!.egg = { bird: 'bulbul', laidAt: laid, hatchedAt: null, warmed: true };
    const between = laid + NEST_HATCH_MS - NEST_WARM_MS + 1000;
    expect(settleNest(due, between, '2026-09-01').paid).toBe(true);
    expect(due.nest!.hatched).toBe(1);
  });
});

describe('1.4.52 decoration reveal', () => {
  it('migrates a missing counter to the decorations already earned', () => {
    const nest = { hatched: 10, awards: [], egg: null, laidOn: '2026-09-01' };
    migrateNest(nest);
    expect(nest.revealedBuilds).toBe(nestBuilds(10).length);
    expect(pendingNestReveals(nest)).toEqual([]);
  });

  it('lists hatch 1 and hatch 10 in order until each is marked', () => {
    const state = tree();
    const laid = 1_000_000_000_000;
    state.nest!.egg = { bird: 'sparrow', laidAt: laid - NEST_HATCH_MS, hatchedAt: laid - 1 };
    settleNest(state, laid, '2026-09-01');
    expect(pendingNestReveals(state.nest)).toEqual(['windmill']);
    expect(revealedNestBuilds(state.nest)).toEqual([]);
    expect(state.nest!.revealBirds?.[0]).toBe('sparrow');

    state.nest!.hatched = 9;
    state.nest!.egg = { bird: 'bulbul', laidAt: laid, hatchedAt: laid + 1 };
    settleNest(state, laid + NEST_HATCH_MS, '2026-09-02');
    expect(state.nest!.hatched).toBe(10);
    expect(pendingNestReveals(state.nest)).toEqual(['windmill', 'statue']);
    expect(state.nest!.revealBirds?.[1]).toBe('bulbul');

    markNestRevealed(state.nest!);
    expect(pendingNestReveals(state.nest)).toEqual(['statue']);
    expect(revealedNestBuilds(state.nest)).toEqual(['windmill']);
    markNestRevealed(state.nest!);
    expect(pendingNestReveals(state.nest)).toEqual([]);
    expect(revealedNestBuilds(state.nest)).toEqual(['windmill', 'statue']);
  });
});

describe('1.4.52 save round-trip', () => {
  it('keeps warmed and revealedBuilds, and treats an old egg as not warmed', async () => {
    const state = tree();
    state.nest = {
      hatched: 1,
      awards: [],
      laidOn: '2026-09-01',
      revealedBuilds: 0,
      revealBirds: ['sparrow'],
      egg: { bird: 'sparrow', laidAt: 50, hatchedAt: null, warmed: true },
    };
    const code = await encodeSave(state, freshMeta(), new Date('2026-09-02T00:00:00Z'));
    const decoded = await decodeSave(code);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.payload.save.nest?.egg?.warmed).toBe(true);
    expect(decoded.payload.save.nest?.revealedBuilds).toBe(0);
    expect(decoded.payload.save.nest?.revealBirds).toEqual(['sparrow']);
    expect(eggHatchAt(decoded.payload.save.nest!.egg!)).toBe(50 + NEST_HATCH_MS - NEST_WARM_MS);

    const old = tree();
    old.nest = { hatched: 10, awards: [], laidOn: '2026-09-01', egg: { bird: 'sparrow', laidAt: 50, hatchedAt: null } };
    const loaded = parseSave(JSON.stringify(old));
    expect(loaded?.nest?.egg?.warmed).toBeFalsy();
    expect(eggHatchAt(loaded!.nest!.egg!)).toBe(50 + NEST_HATCH_MS);
    expect(loaded?.nest?.revealedBuilds).toBe(nestBuilds(10).length);
  });
});

describe('1.4.52 first egg', () => {
  it('shows once on the lay, stays quiet for someone who already hatched, and does not repeat', () => {
    expect(firstEggDecision({}, { hatched: 0 }, true)).toBe('show');
    expect(firstEggDecision({}, { hatched: 0 }, false)).toBe('none');
    expect(firstEggDecision({}, { hatched: 2 }, true)).toBe('silent');
    expect(firstEggDecision({ nest: [{ count: 1 }] }, { hatched: 0 }, true)).toBe('silent');
    expect(firstEggDecision({ firstEggIntro: true }, { hatched: 0 }, true)).toBe('none');
  });
});
