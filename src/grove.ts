import { speciesTargetCm } from './data/species';
import type { SpeciesId } from './data/species';
import { parseSave } from './storage';
import type { GameState, IsleAward } from './types';
import { t as tl, live } from './i18n';
import { kvSet, kvRemove } from './native/kv';

/** Both planted trees, plus which island the camera is on. Native persist picks this up via the sekai-tree prefix. */
export const GROVE_KEY = 'sekai-tree-grove';

export const ISLE_AWARDS: readonly { id: IsleAward['id']; title: string; detail: string }[] = live(() => ([
  { id: 'land', title: tl('grove.001'), detail: tl('grove.002') },
  { id: 'plant', title: tl('grove.003'), detail: tl('grove.004') },
  { id: 'record', title: tl('grove.005'), detail: tl('grove.006') },
]));

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
    kvSet(GROVE_KEY, JSON.stringify({ version: 1, isle: grove.isle, home: grove.home, second: grove.second }));
  } catch {
    /* quota */
  }
}

export function clearGrove(): void {
  try {
    kvRemove(GROVE_KEY);
  } catch {
    /* ignore */
  }
}

export function isleAward(id: IsleAward['id'], date: string, treeName: string, species: SpeciesId): IsleAward {
  return { id, date, treeName, species };
}
