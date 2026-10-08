/**
 * 1.4.59 每日小目標: three simple tasks a day (reset at the place's midnight, same day as the care limits).
 * All three done → +3 養分 once (a fertilise is +25, a day uses ~10), so it nudges daily care without changing
 * the economy; premium has no effect on it.
 */
import { t as tl } from './i18n';
import { W_SATURATED } from './balance';
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

export const GOAL_REWARD_N = 3;
const GOAL_IDS: readonly GoalId[] = ['water2', 'feed', 'deworm', 'warm', 'weather', 'scenery'];

export interface GoalCtx {
  /** Pests on the tree now (除蟲 is available). */
  pest: boolean;
  /** 寒冷 in force today (保暖 is available). */
  cold: boolean;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Water twice + fertilise + one more: what today needs (pests, cold) or a light one (weather card / scenery). */
export function pickGoals(date: string, ctx: GoalCtx): GoalId[] {
  const third: GoalId = ctx.pest ? 'deworm' : ctx.cold ? 'warm' : hash(date) % 2 ? 'weather' : 'scenery';
  return ['water2', 'feed', third];
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
  if (!g || g.date !== today || !g.ids.includes(id) || g.noted.includes(id)) return false;
  g.noted.push(id);
  return true;
}

/** All three done and not yet rewarded → +3 養分 (capped at 100) and a 成長日誌 line. Returns true when it paid. */
export function claimGoals(state: GameState, today: string): boolean {
  const g = state.goals;
  if (!g || g.date !== today || g.claimed || state.over || !state.started) return false;
  if (!g.ids.every((id) => goalDone(state, g, id))) return false;
  g.claimed = true;
  state.nutrients = Math.min(100, state.nutrients + GOAL_REWARD_N);
  addLog(state, today, tl('goals.logText'), { kind: 'badge', title: tl('goals.logTitle'), reward: { text: tl('goals.reward', { n: GOAL_REWARD_N }), tone: 'green' } });
  return true;
}

export function goalLabel(id: GoalId): string {
  return tl(`goals.${id}`);
}
