import type { SpeciesId } from './data/species';
/** Progress kept between games: badges (perks + v14 milestones), 免死金牌, 星空浮島, 養分地標. */
import { AGE_MILESTONES, BADGES, LANDMARK_N_BONUS, RECORD_MILESTONE, parseWxAwardId, type MilestoneId } from './balance';
import { weatherAchievementCopy } from './labels';
import { createGame } from './sim';
import type { GameState, MetaState } from './types';
import { t as tl } from './i18n';
import { kvSet } from './native/kv';

export const META_KEY = 'sekai-tree-meta-v1';

export function freshMeta(): MetaState {
  return { version: 1, badges: { '1': 0, '2': 0, '3': 0 }, reviveTokens: 0, starry: false, landmark: null, pendingLegacy: false, history: [], milestones: [], weather: [], isle: [], nest: [] };
}

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    const data = raw ? (JSON.parse(raw) as MetaState) : null;
    if (data && data.version === 1 && data.badges) {
      const weather = Array.isArray(data.weather) ? data.weather.filter((w) => parseWxAwardId(w.id)) : [];
      const isle = Array.isArray(data.isle) ? data.isle.filter((a) => a && (a.id === 'land' || a.id === 'plant' || a.id === 'record')) : [];
      const nest = Array.isArray(data.nest) ? data.nest.filter((a) => a && typeof a.count === 'number' && a.count >= 1) : [];
      return { ...freshMeta(), ...data, milestones: Array.isArray(data.milestones) ? data.milestones : [], weather, isle, nest };
    }
  } catch {
    /* ignore */
  }
  return freshMeta();
}

export function saveMeta(meta: MetaState): void {
  try {
    kvSet(META_KEY, JSON.stringify(meta));
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
    lines.push(tl('meta.001', { p0: BADGES[t].name, p1: BADGES[t].perk }));
    if (t === 3) {
      meta.reviveTokens += 1;
      meta.starry = true;
    }
  }
  if (over.kind === 'dead') {
    meta.landmark = { name: state.treeName, heightCm: state.heightCm, date: over.date };
    meta.pendingLegacy = true;
    lines.push(tl('meta.002', { treeName: state.treeName, LANDMARK_N_BONUS }));
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
      lines.push(tl('meta.001', { p0: BADGES[t].name, p1: BADGES[t].perk }));
      if (t === 3) {
        meta.reviveTokens += 1;
        meta.starry = true;
      }
    }
  }
  if (meta.milestones.length > 200) meta.milestones.splice(0, meta.milestones.length - 200);
  return lines;
}

/** Copy this tree's new weather achievements into the collection. Idempotent via `booked`. Returns titles just booked. */
export function bookWeather(meta: MetaState, state: GameState): string[] {
  meta.weather ??= [];
  const lines: string[] = [];
  const awards = Object.values(state.wx?.awards ?? {}).filter((a): a is NonNullable<typeof a> => Boolean(a));
  awards.sort((a, b) => (parseWxAwardId(a.id)?.count ?? 0) - (parseWxAwardId(b.id)?.count ?? 0) || a.id.localeCompare(b.id));
  for (const a of awards) {
    if (!a || a.booked || !parseWxAwardId(a.id)) continue;
    a.booked = true;
    meta.weather.push({ id: a.id, treeName: state.treeName, species: state.species, date: a.date, ageDays: a.ageDays });
    lines.push(weatherAchievementCopy(a.id).title);
  }
  if (meta.weather.length > 200) meta.weather.splice(0, meta.weather.length - 200);
  return lines;
}

/** Copy this tree's new hatched-egg achievements into the collection. Idempotent via `booked`. */
export function bookNest(meta: MetaState, state: GameState): void {
  meta.nest ??= [];
  const awards = [...(state.nest?.awards ?? [])].sort((a, b) => a.count - b.count);
  for (const a of awards) {
    if (a.booked) continue;
    a.booked = true;
    meta.nest.push({ count: a.count, treeName: state.treeName, species: state.species, date: a.date, ageDays: a.ageDays });
  }
  if (meta.nest.length > 200) meta.nest.splice(0, meta.nest.length - 200);
}

const MILESTONE_ORDER: MilestoneId[] = [...AGE_MILESTONES.map((m) => m.id), RECORD_MILESTONE.id];

export function newGame(meta: MetaState, today: string, name: string, species?: SpeciesId): GameState {
  const legacyBonus = meta.pendingLegacy ? LANDMARK_N_BONUS : 0;
  meta.pendingLegacy = false;
  const state = createGame(today, { name, legacyBonus, species });
  state.started = true;
  return state;
}
