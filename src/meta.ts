import type { SpeciesId } from './data/species';
/** Progress kept between games: badges, 免死金牌, 星空浮島, 養分地標. */
import { BADGES, LANDMARK_N_BONUS, type SeasonId } from './balance';
import { createGame } from './sim';
import type { GameState, MetaState } from './types';

export const META_KEY = 'sekai-tree-meta-v1';

export function freshMeta(): MetaState {
  return { version: 1, badges: { '1': 0, '2': 0, '3': 0 }, reviveTokens: 0, starry: false, landmark: null, pendingLegacy: false, history: [] };
}

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    const data = raw ? (JSON.parse(raw) as MetaState) : null;
    if (data && data.version === 1 && data.badges) return { ...freshMeta(), ...data };
  } catch {
    /* ignore */
  }
  return freshMeta();
}

export function saveMeta(meta: MetaState): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

/** Book the end of a game into meta (badges, tokens, landmark). Idempotent per game via `booked`. */
export function bookGameEnd(meta: MetaState, state: GameState): string[] {
  const over = state.over;
  if (!over || over.booked) return [];
  over.booked = true;
  const lines: string[] = [];
  for (const t of over.tiers) {
    meta.badges[String(t) as '1' | '2' | '3'] += 1;
    lines.push(`${BADGES[t].name}：${BADGES[t].perk}`);
    if (t === 3) {
      meta.reviveTokens += 1;
      meta.starry = true;
    }
  }
  if (over.kind === 'dead') {
    meta.landmark = { name: state.treeName, heightCm: state.heightCm, date: over.date };
    meta.pendingLegacy = true;
    lines.push(`${state.treeName}化作養分地標：下一棵樹開局養分 +${LANDMARK_N_BONUS}。`);
  }
  meta.history.unshift({ name: state.treeName, season: state.season, days: over.days, heightCm: state.heightCm, result: over.kind, date: over.date });
  meta.history.length = Math.min(meta.history.length, 20);
  return lines;
}

/** Book a finished season into meta once (badges, 免死金牌, 星空浮島). The game itself carries on. */
export function bookSeasonComplete(meta: MetaState, state: GameState): string[] {
  const done = state.completed;
  if (!done || done.booked) return [];
  done.booked = true;
  const lines: string[] = [];
  for (const t of done.tiers) {
    meta.badges[String(t) as '1' | '2' | '3'] += 1;
    lines.push(`${BADGES[t].name}：${BADGES[t].perk}`);
    if (t === 3) {
      meta.reviveTokens += 1;
      meta.starry = true;
    }
  }
  meta.history.unshift({ name: state.treeName, season: state.season, days: done.days, heightCm: done.heightCm, result: 'complete', date: done.date });
  meta.history.length = Math.min(meta.history.length, 20);
  return lines;
}

export function newGame(meta: MetaState, today: string, season: SeasonId, name: string, species?: SpeciesId): GameState {
  const legacyBonus = meta.pendingLegacy ? LANDMARK_N_BONUS : 0;
  meta.pendingLegacy = false;
  const state = createGame(today, { season, name, legacyBonus, species });
  state.started = true;
  return state;
}
