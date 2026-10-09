/**
 * 1.4.59 每日小目標; 1.4.64: reward goes to the day's lowest of W / N / R (or +2 解鎖分數 when all healthy),
 * goals are shuffled per tree per day from only what is doable on screen.
 */
import { t as tl } from './i18n';
import { N_OPTIMAL, R_MAX, W_MAX, W_OPTIMAL, W_SATURATED } from './balance';
import { addLog } from './sim';
import type { GameState } from './types';

export type GoalId = 'water2' | 'feed' | 'deworm' | 'warm' | 'weather' | 'scenery';

export interface DailyGoals {
  date: string;
  ids: GoalId[];
  /** Goals met by doing something outside the care actions (opened 天氣概況, tapped the scenery). */
  noted: GoalId[];
  claimed: boolean;
}

/** Amount added to the lowest of W / N / R when the day's goals are claimed (and that bar is not yet healthy). */
export const GOAL_REWARD = 3;
/** Kept for older UI/tests that still read the nutrients-only name. */
export const GOAL_REWARD_N = GOAL_REWARD;
/** +2 to the fauna unlock score when W, N and R are all already healthy. Cap 100. */
export const FAUNA_SCORE_STEP = 2;
export const FAUNA_SCORE_MAX = 100;
/** One permanent species unlocked per this many score points (10 species at 100). */
export const FAUNA_SCORE_PER_SPECIES = 10;

const GOAL_IDS: readonly GoalId[] = ['water2', 'feed', 'deworm', 'warm', 'weather', 'scenery'];

export interface GoalCtx {
  /** Pests on the tree now (除蟲 is available). */
  pest: boolean;
  /** 寒冷 in force today (保暖 is available). */
  cold: boolean;
  /** Stable per-tree salt so two players on the same date get different goals. */
  seed: string;
}

export type GoalRewardKind = 'moisture' | 'nutrients' | 'resist' | 'fauna';

export interface GoalReward {
  kind: GoalRewardKind;
  /** Points added (to the bar, or to the fauna score). */
  amount: number;
  /** Fauna score after this claim (only when kind === 'fauna'). */
  faunaScore?: number;
  /** Extra permanent species unlocked by this claim. */
  unlocked?: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** W in its optimal band, N at least the optimal floor, R at least 60 (same band the status bar paints). */
export function careHealthy(state: Pick<GameState, 'moisture' | 'nutrients' | 'resist'>): boolean {
  return state.moisture >= W_OPTIMAL[0] && state.moisture <= W_OPTIMAL[1] && state.nutrients >= N_OPTIMAL[0] && state.resist >= 60;
}

/** Which care bar is lowest today (moisture compared at most 100 so over-saturation does not win). */
export function lowestCare(state: Pick<GameState, 'moisture' | 'nutrients' | 'resist'>): 'moisture' | 'nutrients' | 'resist' {
  const w = Math.min(100, state.moisture);
  const n = state.nutrients;
  const r = state.resist;
  if (w <= n && w <= r) return 'moisture';
  if (n <= r) return 'nutrients';
  return 'resist';
}

/** Goals that make sense on screen today (no 除蟲 without pests, no 保暖 without cold). */
export function doableGoals(ctx: GoalCtx): GoalId[] {
  const pool: GoalId[] = ['water2', 'feed', 'weather', 'scenery'];
  if (ctx.pest) pool.push('deworm');
  if (ctx.cold) pool.push('warm');
  return pool;
}

/**
 * 1–3 goals for this tree today: shuffled from the doable pool with a per-player salt.
 * Always prefers a care action (water / feed / deworm / warm) when one is doable, so the card never feels empty.
 */
export function pickGoals(date: string, ctx: GoalCtx): GoalId[] {
  const pool = doableGoals(ctx);
  const h = hash(`${date}|${ctx.seed}`);
  const shuffled = pool
    .map((id, i) => ({ id, k: hash(`${h}:${i}:${id}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.id);
  const n = 1 + (h % Math.min(3, shuffled.length));
  return shuffled.slice(0, n);
}

export function parseGoals(x: unknown): DailyGoals | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const g = x as Partial<DailyGoals>;
  if (typeof g.date !== 'string' || !Array.isArray(g.ids)) return undefined;
  const ok = (a: unknown): GoalId[] => (Array.isArray(a) ? a.filter((v): v is GoalId => GOAL_IDS.includes(v as GoalId)).slice(0, 3) : []);
  return { date: g.date, ids: ok(g.ids), noted: ok(g.noted), claimed: g.claimed === true };
}

/** Today's goals, picked on the first look of the day. */
export function ensureGoals(state: GameState, today: string, ctx: GoalCtx): DailyGoals {
  if (state.goals?.date !== today || !state.goals.ids.length) state.goals = { date: today, ids: pickGoals(today, ctx), noted: [], claimed: false };
  return state.goals;
}

/** Progress of one goal: [done so far, needed]. */
export function goalProgress(state: GameState, g: DailyGoals, id: GoalId): [number, number] {
  const care = state.care.date === g.date ? state.care : null;
  switch (id) {
    case 'water2':
      // Soil already saturated (rain): there is nothing to water, so it counts.
      return [state.moisture >= W_SATURATED ? 2 : Math.min(2, care?.water ?? 0), 2];
    case 'feed':
      return [Math.min(1, care?.fertilize ?? 0), 1];
    case 'deworm':
      return [care?.dewormed || !state.pest.active ? 1 : 0, 1];
    case 'warm':
      return [care?.warmCover ? 1 : 0, 1];
    default:
      return [g.noted.includes(id) ? 1 : 0, 1];
  }
}

export function goalDone(state: GameState, g: DailyGoals, id: GoalId): boolean {
  const [a, b] = goalProgress(state, g, id);
  return a >= b;
}

/** Opened 天氣概況 / tapped the scenery: marks that goal if it is one of today's. */
export function noteGoal(state: GameState, today: string, id: 'weather' | 'scenery'): boolean {
  const g = state.goals;
  if (!g || g.date !== today || g.claimed || !g.ids.includes(id) || g.noted.includes(id)) return false;
  g.noted = [...g.noted, id];
  return true;
}

export function faunaUnlockedCount(score: number): number {
  return Math.min(Math.floor(FAUNA_SCORE_MAX / FAUNA_SCORE_PER_SPECIES), Math.floor(Math.max(0, score) / FAUNA_SCORE_PER_SPECIES));
}

/**
 * Pay the day's goals: boost the lowest of W / N / R, or +2 fauna score when all three are healthy.
 * Returns what was granted (for the toast / log); false if nothing to claim.
 */
export function claimGoals(state: GameState, today: string): GoalReward | false {
  const g = state.goals;
  if (!g || g.date !== today || g.claimed || state.over || !state.started) return false;
  if (!g.ids.every((id) => goalDone(state, g, id))) return false;
  g.claimed = true;

  if (careHealthy(state)) {
    const before = state.faunaScore ?? 0;
    const after = Math.min(FAUNA_SCORE_MAX, before + FAUNA_SCORE_STEP);
    state.faunaScore = after;
    const unlocked = faunaUnlockedCount(after) - faunaUnlockedCount(before);
    addLog(state, today, tl('goals.logText'), {
      kind: 'badge',
      title: tl('goals.logTitle'),
      reward: { text: tl('goals.rewardFauna', { n: FAUNA_SCORE_STEP, score: after }), tone: 'purple' },
    });
    return { kind: 'fauna', amount: after - before, faunaScore: after, unlocked };
  }

  const kind = lowestCare(state);
  if (kind === 'moisture') state.moisture = Math.min(W_MAX, state.moisture + GOAL_REWARD);
  else if (kind === 'nutrients') state.nutrients = Math.min(100, state.nutrients + GOAL_REWARD);
  else state.resist = Math.min(R_MAX, state.resist + GOAL_REWARD);
  addLog(state, today, tl('goals.logText'), {
    kind: 'badge',
    title: tl('goals.logTitle'),
    reward: { text: tl(`goals.reward.${kind}`, { n: GOAL_REWARD }), tone: 'green' },
  });
  return { kind, amount: GOAL_REWARD };
}

export function goalLabel(id: GoalId): string {
  return tl(`goals.${id}`);
}
