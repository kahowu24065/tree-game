import { defaultSpecies, speciesDef } from './data/species';
import type { GameState } from './types';
import type { WeatherSnapshot } from './weather';
import { seasonDef } from './rules';

const seasonTarget = (id: GameState['season']) => seasonDef(id ?? 's3').targetCm;

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
    data.passedTargetOn ??= data.heightCm >= seasonTarget(data.season) ? data.createdOn : null;
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
