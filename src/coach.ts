import { t as tl } from './i18n';
/** First-plant coach. Stored beside the save so an existing tree is not interrupted. */

export interface Coach {
  /** Turned on when a tree is planted, until the water and fertilize lessons (and the health page) are done or skipped. */
  armed: boolean;
  /** The watering lesson has been read. */
  water: boolean;
  /** The fertilize lesson has been read. */
  feed: boolean;
  /** The closing page: health changes how tall the tree grows tonight. */
  health: boolean;
  /** The carbon line in 樹木狀態 has been explained. */
  carbon: boolean;
  done: boolean;
}

export const COACH_KEY = 'sekai-tree-coach';

export function freshCoach(): Coach {
  return { armed: false, water: false, feed: false, health: false, carbon: false, done: false };
}

export function coachTasks(c: Coach): { id: 'water' | 'feed'; label: string; done: boolean }[] {
  return [
    { id: 'water', label: tl('coach.001'), done: c.water },
    { id: 'feed', label: tl('coach.002'), done: c.feed },
  ];
}

/** The checklist is on screen. */
export function coachOpen(c: Coach): boolean {
  return c.armed && !c.done;
}

/** Which control should pulse. */
export function coachFocus(c: Coach): 'water' | 'feed' | null {
  if (!coachOpen(c)) return null;
  if (!c.water) return 'water';
  if (!c.feed) return 'feed';
  return null;
}

/** Start the coach for a new tree. A finished coach stays finished. */
export function armCoach(c: Coach): Coach {
  if (c.done || c.armed) return c;
  return { ...c, armed: true };
}

export function markCoach(c: Coach, step: 'water' | 'feed' | 'health' | 'carbon' | 'skip'): Coach {
  if (step === 'skip') {
    if (c.done && c.carbon) return c;
    return { ...c, armed: true, water: true, feed: true, health: true, carbon: true, done: true };
  }
  if (step === 'carbon') {
    if (c.carbon) return c;
    return { ...c, carbon: true };
  }
  if (!c.armed || c.done || c[step]) return c;
  const next = { ...c, [step]: true };
  if (step === 'health') next.done = true;
  return next;
}

export function loadCoach(): Coach {
  try {
    if (typeof localStorage === 'undefined') return freshCoach();
    const raw = localStorage.getItem(COACH_KEY);
    if (!raw) return freshCoach();
    const data = JSON.parse(raw) as Partial<Coach> & { weather?: boolean; zoom?: boolean };
    // Older coach (weather / zoom tasks). A finished one stays finished; a half-done one starts the new lessons.
    if (!('feed' in data) && !('health' in data)) {
      if (data.done) return { armed: true, water: true, feed: true, health: true, carbon: true, done: true };
      if (data.armed) return { ...freshCoach(), armed: true };
      return freshCoach();
    }
    return {
      armed: Boolean(data.armed),
      water: Boolean(data.water),
      feed: Boolean(data.feed),
      health: Boolean(data.health),
      carbon: Boolean(data.carbon),
      done: Boolean(data.done),
    };
  } catch {
    return freshCoach();
  }
}

export function saveCoach(c: Coach): void {
  try {
    localStorage?.setItem(COACH_KEY, JSON.stringify(c));
  } catch {
    /* private mode */
  }
}

export function clearCoach(): void {
  try {
    localStorage?.removeItem(COACH_KEY);
  } catch {
    /* private mode */
  }
}
