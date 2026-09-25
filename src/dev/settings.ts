import type { WeatherEventId } from '../balance';
import type { TimeMode } from '../types';
import type { SpeciesId } from '../data/species';

/** Developer panel settings — stored apart from the game save. */
export interface DevSettings {
  mode: 'real' | 'manual';
  events: WeatherEventId[];
  /** Manual 12-hour forecast: event and the time it starts (ms). */
  forecast: { event: WeatherEventId; at: number } | null;
  time: TimeMode;
  open: boolean;
  /** Preview another species / growth stage in the scene (does not touch the save). */
  preview: { species?: SpeciesId; stage?: number; island?: number };
  /** Forced sway level 0–1 (null = follow the weather). */
  sway: number | null;
}

export const DEV_KEY = 'sekai-tree-dev';

export function defaultDev(): DevSettings {
  return { mode: 'real', events: ['clear'], forecast: null, time: 'auto', open: false, preview: {}, sway: null };
}

export function loadDev(): DevSettings {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    if (raw) return { ...defaultDev(), ...(JSON.parse(raw) as Partial<DevSettings>) };
  } catch {
    /* ignore */
  }
  return defaultDev();
}

export function saveDev(d: DevSettings): void {
  try {
    localStorage.setItem(DEV_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}
