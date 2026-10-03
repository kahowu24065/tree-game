import { speciesDef, speciesTargetCm } from './data/species';
import { daysBetween } from './dates';
import { START } from './balance';
import type { GameState } from './types';
import type { WeatherSnapshot } from './weather';
import { addLog, checkMilestones, logI18n, migrateWx, RULES_VERSION, windStageCm } from './sim';
import { formatHeight } from './util';
import { getLocale, t as tl } from './i18n';
import { parseAny } from './i18n/msg';

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
    if (got.length === 0 && data.ageDays > 0) addLog(data, date, tl('storage.001'), { kind: 'badge', title: tl('storage.002'), time: '' });
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
    addLog(data, data.lastSeenDate ?? data.createdOn, tl('storage.003', { name: sp.name, p1: formatHeight(old), p2: formatHeight(t), maxM: sp.maxM }), { kind: 'badge', title: tl('storage.004'), reward: { text: formatHeight(t), tone: 'purple' }, time: '' });
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
 * v16 visual-only fields: no collapse on record for old saves; a tree that died before v16 has already been seen dead
 * (no death animation replays on load, it just lies there as the fallen log).
 */
export function migrateV16(data: GameState): void {
  if (data.lastCollapse === undefined) data.lastCollapse = null;
  const lc = data.lastCollapse;
  if (lc && (typeof lc !== 'object' || typeof lc.heightBefore !== 'number' || typeof lc.date !== 'string')) data.lastCollapse = null;
  else if (lc) {
    lc.heightAfter = typeof lc.heightAfter === 'number' ? lc.heightAfter : data.heightCm;
    lc.count = Number(lc.count) || 1;
    lc.fatal = Boolean(lc.fatal);
    lc.seen = lc.seen !== false;
  }
  if (data.over && data.over.fallSeen === undefined) data.over.fallSeen = true;
  // v1.4.18: 1.4.17 drifted 健康 during the day; undo today's applied part so midnight settles the day once.
  const fl = data.flow;
  if (fl && typeof fl === 'object' && typeof fl.hw === 'number') {
    const applied = (fl.hw || 0) + (fl.hn || 0) + (fl.hp || 0) - (fl.over || 0);
    if (!data.over && Number.isFinite(applied)) {
      const h = Math.max(0, Math.min(100, Math.round((data.health - applied) * 1e6) / 1e6));
      if (data.dying && h > 0 && data.dying.since === fl.date) data.dying = null; // that 瀕死 came from today's drift
      data.health = h;
    }
    delete fl.hw;
    delete fl.hn;
    delete fl.hp;
    delete fl.over;
    delete fl.hRate;
  }
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

/**
 * 1.4.36: log lines from before 1.4.36 are text only, in the language of the day they were written. Recover their
 * message form (matched against all four languages) so they follow the current language; lines that match
 * nothing keep showing as written. Returns how many lines were looked at / given a message form.
 */
export function migrateLogI18n(data: Pick<GameState, 'log'>): { total: number; migrated: number } {
  let total = 0;
  let migrated = 0;
  for (const e of data.log ?? []) {
    if (!e || typeof e.text !== 'string' || e.i18n) continue;
    total++;
    const got = parseAny(e.text);
    const lang = got?.lang ?? getLocale();
    const i18n = logI18n(e.text, typeof e.title === 'string' ? e.title : undefined, typeof e.reward?.text === 'string' ? e.reward.text : undefined, lang);
    if (i18n) {
      e.i18n = i18n;
      migrated++;
    }
  }
  return { total, migrated };
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
    migrateV16(data);
    migrateWx(data);
    migrateLogI18n(data);
    data.nest ??= { hatched: 0, awards: [], egg: null, laidOn: '' };
    if (data.nest) {
      data.nest.laidOn ??= '';
      if (data.nest.egg && !data.nest.egg.bird) data.nest.egg.bird = 'magpierobin';
    }
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
