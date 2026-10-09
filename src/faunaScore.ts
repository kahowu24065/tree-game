/**
 * 1.4.64 解鎖長駐動物種類: a 0–100 score filled by daily goals when W/N/R are already healthy.
 * Every 10 points permanently unlocks one non-bird species into the album (and they can become residents).
 */
import { ANIMALS, animalById } from './data/animals';
import { FAUNA_SCORE_MAX, faunaUnlockedCount } from './goals';
import { addLog } from './sim';
import type { GameState } from './types';
import { t as tl } from './i18n';

/**
 * Extra permanent species granted by the fauna score, in unlock order.
 * Non-birds only, early stages first so a young tree still sees variety.
 */
export const FAUNA_UNLOCK_ORDER: readonly string[] = [
  'ladybug',
  'butterfly',
  'damselfly',
  'toad',
  'grasshopper',
  'lizard',
  'honeybee',
  'squirrel',
  'bullfrog',
  'gecko',
];

export function faunaScoreOf(state: Pick<GameState, 'faunaScore'>): number {
  return Math.max(0, Math.min(FAUNA_SCORE_MAX, state.faunaScore ?? 0));
}

export function faunaExtraUnlocked(state: Pick<GameState, 'faunaScore'>): number {
  return faunaUnlockedCount(faunaScoreOf(state));
}

/** Species ids unlocked by the current score (may include ones the player already had). */
export function faunaUnlockIds(score: number): string[] {
  return FAUNA_UNLOCK_ORDER.slice(0, faunaUnlockedCount(score));
}

/**
 * Push newly unlocked species into the album. Returns names of species that were new today.
 */
export function syncFaunaUnlocks(state: GameState, date: string): string[] {
  const ids = faunaUnlockIds(faunaScoreOf(state));
  const got: string[] = [];
  for (const id of ids) {
    if (state.animals.includes(id)) continue;
    if (!animalById(id)) continue;
    state.animals.push(id);
    got.push(id);
    const name = animalById(id)!.name;
    addLog(state, date, tl('fauna.unlockLog', { name }), {
      kind: 'animal',
      title: tl('fauna.unlockTitle'),
      reward: { text: tl('fauna.unlockChip'), tone: 'purple' },
    });
  }
  return got;
}

/** How many of the unlock-order species are non-birds in the full catalogue (sanity for tests). */
export function faunaUnlockPoolSize(): number {
  return FAUNA_UNLOCK_ORDER.filter((id) => {
    const a = ANIMALS.find((x) => x.id === id);
    return a && a.category !== 'bird';
  }).length;
}
