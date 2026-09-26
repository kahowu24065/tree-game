import { speciesDef, speciesTargetCm } from './data/species';
import { daysBetween } from './dates';
import { START } from './balance';
import type { GameState } from './types';
import type { WeatherSnapshot } from './weather';
import { addLog, checkMilestones, RULES_VERSION, windStageCm } from './sim';
import { formatHeight } from './util';

/** Fields of saves made before v14 (seasons). */
type LegacySave = GameState & { season?: string; completed?: null | { date: string; tiers: (1 | 2 | 3)[]; days: number; heightCm: number; booked?: boolean } };

/**
 * v14 (rules 14): no seasons. Species, height, stats and log are kept; season fields are dropped; R (targetCm) comes from
 * the species. 樹齡 = nights already settled (createdOn → lastSeenDate). Age milestones the tree has already passed are
 * awarded now (tier from the CURRENT height vs e(milestone day)); 超越世界紀錄 too if h > R. The old perk badge a
 * milestone carries (3個月／半年／1年 → 一級／二級／三級) is granted unless a finished, booked season already gave it.
 * A dead tree (over) gets no retro milestones (the player replants).
 */
export function migrateV14(data: GameState): void {
  const legacy = data as LegacySave;
  data.species = speciesDef(data.species).id;
  data.milestones ??= {};
  if ((data.rules ?? 0) >= RULES_VERSION) {
    data.ageDays = Number(data.ageDays) || 0;
    return;
  }
  const done = legacy.completed;
  const given = done?.booked ? done.tiers : [];
  delete legacy.season;
  delete legacy.completed;
  // The word 賽季 is gone from the game; old log lines say 挑戰 instead.
  for (const l of data.log ?? []) {
    if (l.title) l.title = l.title.replace(/賽季/g, '挑戰');
    l.text = String(l.text ?? '').replace(/賽季/g, '挑戰');
  }
  data.targetCm = speciesTargetCm(data.species);
  if (typeof data.ageDays !== 'number') data.ageDays = Math.max(0, daysBetween(data.createdOn, data.lastSeenDate ?? data.createdOn));
  if (data.over) {
    data.over.tiers = [];
  } else if (data.started !== false) {
    const date = data.lastSeenDate ?? data.createdOn;
    const got = checkMilestones(data, date, { retro: true, perks: ([1, 2, 3] as const).filter((t) => !given.includes(t)) });
    if (got.length === 0 && data.ageDays > 0) addLog(data, date, '新規則：棵樹冇完結日，會一直陪住你。生長會慢慢接近紀錄高度，樹齡里程碑會發徽章。', { kind: 'badge', title: 'v14 新規則', time: '' });
  }
  data.rules = RULES_VERSION;
}

/** Season targets before v8 (one per season), used to recognise saves made before per-species targets. */
const V7_TARGET_CM = { s3: 2000, s6: 5000, s12: 10000 } as const;

/**
 * v8: each species has its own target (record height rounded to 10 m). Old saves keep their real height; only the
 * goal moves. 已突破目標 is re-evaluated against the new target and a log line explains the change once.
 */
export function migrateTarget(data: GameState): void {
  const t = speciesTargetCm(data.species);
  const season = (data as LegacySave).season as keyof typeof V7_TARGET_CM | undefined;
  const old = data.targetCm ?? V7_TARGET_CM[season ?? 's3'] ?? t;
  if (data.targetCm === t) return;
  data.targetCm = t;
  if (data.heightCm < t) data.passedTargetOn = null;
  else data.passedTargetOn ??= data.log?.[0]?.date ?? data.createdOn;
  if (old !== t && data.started !== false) {
    const sp = speciesDef(data.species);
    addLog(data, data.lastSeenDate ?? data.createdOn, `紀錄高度更新：${sp.name}由 ${formatHeight(old)} 改為 ${formatHeight(t)}（真實最高紀錄 ${sp.maxM} 米，取最接近嘅 10 米）。高度照舊，冇上限。`, { kind: 'badge', title: '紀錄高度更新', reward: { text: formatHeight(t), tone: 'purple' }, time: '' });
  }
}

/**
 * v12 水分 0-150: old saves keep their W (it was 0-100, still valid); new per-date warning flags start empty (so a
 * warning already recorded today is applied once on next open); care counters get defaults (疏水 now 3 a day).
 */
export function migrateWater(data: GameState): void {
  data.waterFx ??= {};
  data.moisture = Math.max(0, Math.min(150, Number.isFinite(data.moisture) ? data.moisture : 60));
  data.care.water = Number(data.care.water) || 0;
  data.care.drain = Number(data.care.drain) || 0;
  data.care.fertilize = Number(data.care.fertilize) || 0;
}

/**
 * v13 風災 rules: stats are kept. A tree already at/after 青年樹 is unlocked (its R stays; the explainer shows once
 * so the player learns the new rules); a younger tree gets R = 60 (the new start) and stays locked. collapses = 0.
 */
export function migrateWind(data: GameState): void {
  if (typeof data.windUnlocked !== 'boolean') {
    const unlocked = data.heightCm >= windStageCm(data);
    data.windUnlocked = unlocked;
    data.windExplained = false;
    if (!unlocked) data.resist = START.resist;
  }
  data.windExplained ??= false;
  data.collapses = Number(data.collapses) || 0;
  data.doubleRPending ??= false;
  data.doubleRDate ??= null;
  data.doubleRSeen ??= false;
  data.care.heatWater ??= false;
  data.care.rainDrain ??= false;
  data.care.warmCover ??= false;
  renameWarmCover(data);
}

/** v15.1: 「保暖覆蓋」 is now just 「保暖」 — also in log lines / notes an older save already holds (ids unchanged). */
export function renameWarmCover(data: GameState): void {
  const fix = (s: string) => (s.includes('保暖覆蓋') ? s.split('保暖覆蓋').join('保暖') : s);
  for (const e of data.log ?? []) {
    if (typeof e.text === 'string') e.text = fix(e.text);
    if (typeof e.title === 'string') e.title = fix(e.title);
  }
  if (typeof data.morningNote === 'string') data.morningNote = fix(data.morningNote);
  const notes = (data.lastSettlement as { notes?: unknown } | null | undefined)?.notes;
  if (Array.isArray(notes)) for (let i = 0; i < notes.length; i++) if (typeof notes[i] === 'string') notes[i] = fix(notes[i] as string);
}

/**
 * v2 = 《世界之樹》rules. No migration from older keys (yiri-yisyu-v1). Rule changes inside v2 migrate by field
 * presence; v14 adds `rules: 14` (see migrateV14).
 */
export const SAVE_KEY = 'sekai-tree-v2';
export const WEATHER_KEY = 'yiri-yisyu-weather';

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return parseSave(raw);
  } catch {
    return null;
  }
}

/** Parse and migrate a `sekai-tree-v2` save (pure, testable). */
export function parseSave(raw: string): GameState | null {
  try {
    const data = JSON.parse(raw) as GameState;
    if (!data || data.version !== 2 || typeof data.heightCm !== 'number' || !data.care || !data.pest) return null;
    data.dayEvents ??= {};
    data.residents ??= [];
    data.species = speciesDef(data.species).id;
    data.log ??= [];
    // v7: finishing a season no longer ends the game — the tree keeps growing.
    const legacy = data as LegacySave;
    const over = data.over as { kind: string; date: string; tiers: (1 | 2 | 3)[]; days: number; booked?: boolean } | null;
    if (over?.kind === 'complete') {
      legacy.completed = { date: over.date, tiers: over.tiers, days: over.days, heightCm: data.heightCm, booked: over.booked };
      data.over = null;
    }
    migrateWater(data);
    data.passedTargetOn ??= null;
    migrateTarget(data);
    migrateWind(data);
    migrateV14(data);
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
