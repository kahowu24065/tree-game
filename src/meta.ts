import type { SpeciesId } from './data/species';
/** Progress kept between games: badges (perks + v14 milestones), 免死金牌, 星空浮島, 養分地標. */
import { AGE_MILESTONES, BADGES, LANDMARK_N_BONUS, RECORD_MILESTONE, type MilestoneId } from './balance';
import { createGame } from './sim';
import type { GameState, MetaState } from './types';

export const META_KEY = 'sekai-tree-meta-v1';

export function freshMeta(): MetaState {
  return { version: 1, badges: { '1': 0, '2': 0, '3': 0 }, reviveTokens: 0, starry: false, landmark: null, pendingLegacy: false, history: [], milestones: [] };
}

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    const data = raw ? (JSON.parse(raw) as MetaState) : null;
    if (data && data.version === 1 && data.badges) return { ...freshMeta(), ...data, milestones: Array.isArray(data.milestones) ? data.milestones : [] };
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
  meta.history.unshift({ name: state.treeName, species: state.species, days: state.ageDays || over.days, heightCm: state.heightCm, result: over.kind, date: over.date });
  meta.history.length = Math.min(meta.history.length, 20);
  return lines;
}

/**
 * v14: copy this tree's new milestones into the collection (kept across trees) and grant the perk badge a milestone
 * carries (3個月 一級、半年 二級、1年 三級 = 免死金牌 + 星空浮島). Idempotent via `booked`. Returns lines to show.
 */
export function bookMilestones(meta: MetaState, state: GameState): string[] {
  meta.milestones ??= [];
  const lines: string[] = [];
  for (const id of MILESTONE_ORDER) {
    const m = state.milestones?.[id];
    if (!m || m.booked) continue;
    m.booked = true;
    meta.milestones.push({ id, tier: m.tier, treeName: state.treeName, species: state.species, date: m.date, heightCm: m.heightCm, ageDays: m.ageDays });
    if (m.perk) {
      const t = m.perk;
      meta.badges[String(t) as '1' | '2' | '3'] += 1;
      lines.push(`${BADGES[t].name}：${BADGES[t].perk}`);
      if (t === 3) {
        meta.reviveTokens += 1;
        meta.starry = true;
      }
    }
  }
  if (meta.milestones.length > 200) meta.milestones.splice(0, meta.milestones.length - 200);
  return lines;
}

const MILESTONE_ORDER: MilestoneId[] = [...AGE_MILESTONES.map((m) => m.id), RECORD_MILESTONE.id];

export function newGame(meta: MetaState, today: string, name: string, species?: SpeciesId): GameState {
  const legacyBonus = meta.pendingLegacy ? LANDMARK_N_BONUS : 0;
  meta.pendingLegacy = false;
  const state = createGame(today, { name, legacyBonus, species });
  state.started = true;
  return state;
}
