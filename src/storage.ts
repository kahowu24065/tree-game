import { defaultSpecies, speciesDef, speciesTargetCm } from './data/species';
import type { GameState } from './types';
import type { WeatherSnapshot } from './weather';
import { addLog } from './sim';
import { formatHeight } from './util';

/** Season targets before v8 (one per season), used to recognise saves made before per-species targets. */
const V7_TARGET_CM = { s3: 2000, s6: 5000, s12: 10000 } as const;

/**
 * v8: each species has its own target (record height rounded to 10 m). Old saves keep their real height; only the
 * goal moves. 已突破目標 is re-evaluated against the new target and a log line explains the change once.
 */
export function migrateTarget(data: GameState): void {
  const t = speciesTargetCm(data.species);
  const old = data.targetCm ?? V7_TARGET_CM[data.season ?? 's3'];
  if (data.targetCm === t) return;
  data.targetCm = t;
  if (data.heightCm < t) data.passedTargetOn = null;
  else data.passedTargetOn ??= data.log?.[0]?.date ?? data.createdOn;
  if (old !== t && data.started !== false) {
    const sp = speciesDef(data.species);
    addLog(data, data.lastSeenDate ?? data.createdOn, `目標更新：${sp.name}嘅目標由 ${formatHeight(old)} 改為 ${formatHeight(t)}（真實最高紀錄 ${sp.maxM} 米，取最接近嘅 10 米）。高度照舊，冇上限。`, { kind: 'badge', title: '目標更新', reward: { text: formatHeight(t), tone: 'purple' }, time: '' });
  }
}

/** v2 = 《世界之樹》rules. No migration: older saves (yiri-yisyu-v1) are ignored and everyone starts fresh. */
export const SAVE_KEY = 'sekai-tree-v2';
export const WEATHER_KEY = 'yiri-yisyu-weather';

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (!data || data.version !== 2 || typeof data.heightCm !== 'number' || !data.care || !data.pest) return null;
    data.dayEvents ??= {};
    data.residents ??= [];
    if (!data.species || speciesDef(data.species).season !== data.season) data.species = defaultSpecies(data.season ?? 's3');
    data.log ??= [];
    // v7: finishing a season no longer ends the game — the tree keeps growing.
    if (data.over?.kind === 'complete') {
      data.completed = { date: data.over.date, tiers: data.over.tiers, days: data.over.days, heightCm: data.heightCm, booked: data.over.booked };
      data.over = null;
    }
    data.completed ??= null;
    data.passedTargetOn ??= null;
    migrateTarget(data);
    return data;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or full storage: the session still plays */
  }
}

export function clearGame(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function loadWeatherCache(): WeatherSnapshot | null {
  try {
    const raw = localStorage.getItem(WEATHER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WeatherSnapshot;
    if (!data?.daily?.length || !data.current) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveWeatherCache(snapshot: WeatherSnapshot): void {
  try {
    localStorage.setItem(WEATHER_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota */
  }
}
