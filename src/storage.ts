import type { GameState } from './types';
import type { WeatherSnapshot } from './weather';

export const SAVE_KEY = 'yiri-yisyu-v1';
export const WEATHER_KEY = 'yiri-yisyu-weather';

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (!data || data.version !== 1 || typeof data.heightCm !== 'number' || !data.care) return null;
    data.storms ??= [];
    data.animals ??= [];
    data.seenAnimals ??= [];
    data.log ??= [];
    data.reinforcement ??= { stakes: false, ropes: false, prune: false };
    data.scars ??= 0;
    data.eventBonus ??= 1;
    data.care.date ??= data.lastSeenDate || data.createdOn;
    data.care.growthCm ??= 0;
    data.care.credited ??= false;
    data.care.watered ??= false;
    data.care.fertilized ??= false;
    data.care.dewormed ??= false;
    data.care.pruned ??= false;
    data.reinforcement = {
      stakes: Boolean(data.reinforcement?.stakes),
      ropes: Boolean(data.reinforcement?.ropes),
      prune: Boolean(data.reinforcement?.prune),
    };
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
