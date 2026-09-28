import { speciesTargetCm } from './data/species';
import type { SpeciesId } from './data/species';
import { parseSave } from './storage';
import type { GameState, IsleAward } from './types';

/** Both planted trees, plus which island the camera is on. Native persist picks this up via the sekai-tree prefix. */
export const GROVE_KEY = 'sekai-tree-grove';

export const ISLE_AWARDS: readonly { id: IsleAward['id']; title: string; detail: string }[] = [
  { id: 'land', title: '踏足新島', detail: '打破世界紀錄之後，滑到第二座空島。' },
  { id: 'plant', title: '第二棵樹', detail: '喺第二座空島種低新一棵樹。' },
  { id: 'record', title: '新島破紀錄', detail: '第二棵樹都高過自己品種嘅世界紀錄。' },
];

export interface Grove {
  isle: 0 | 1;
  home: GameState;
  second: GameState | null;
}

export function brokeRecord(state: GameState): boolean {
  if (state.milestones?.record) return true;
  const target = state.targetCm || speciesTargetCm(state.species);
  return state.heightCm > target;
}

/** The first tree has passed its record height, so the next island can be visited. */
export function canOpenSecond(home: GameState): boolean {
  return home.started !== false && brokeRecord(home);
}

export function parseGrove(raw: string | null, fallback: GameState): Grove {
  if (!raw) return { isle: 0, home: fallback, second: null };
  try {
    const data = JSON.parse(raw) as { isle?: number; home?: unknown; second?: unknown };
    const home = data.home ? parseSave(JSON.stringify(data.home)) : null;
    const second = data.second ? parseSave(JSON.stringify(data.second)) : null;
    if (!home) return { isle: 0, home: fallback, second: null };
    return { isle: data.isle === 1 ? 1 : 0, home, second };
  } catch {
    return { isle: 0, home: fallback, second: null };
  }
}

export function loadGrove(fallback: GameState): Grove {
  try {
    return parseGrove(localStorage.getItem(GROVE_KEY), fallback);
  } catch {
    return { isle: 0, home: fallback, second: null };
  }
}

export function saveGrove(grove: Grove): void {
  try {
    localStorage.setItem(GROVE_KEY, JSON.stringify({ version: 1, isle: grove.isle, home: grove.home, second: grove.second }));
  } catch {
    /* quota */
  }
}

export function clearGrove(): void {
  try {
    localStorage.removeItem(GROVE_KEY);
  } catch {
    /* ignore */
  }
}

export function isleAward(id: IsleAward['id'], date: string, treeName: string, species: SpeciesId): IsleAward {
  return { id, date, treeName, species };
}
