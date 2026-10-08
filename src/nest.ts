/** Bird eggs. Pure state changes; the night log is written by the settlement. */
import { ANIMALS, animalById } from './data/animals';
import type { GameState, NestState } from './types';
import { t as tl, live } from './i18n';

export const NEST_HATCH_MS = 6 * 3600_000;
/** Keep-warm shortens one egg by an hour (6 h → 5 h). Once per egg. */
export const NEST_WARM_MS = 3600_000;
/** A struggling tree does not get a clutch. */
export const NEST_MIN_HEALTH = 90;
const AWARD_STEPS = [1, 5, 15, 20, 25, 30] as const;

export function freshNest(): NestState {
  return { hatched: 0, awards: [], egg: null, laidOn: '', revealedBuilds: 0, revealBirds: [] };
}

export function isNestAwardCount(n: number): boolean {
  if (n < 1) return false;
  if ((AWARD_STEPS as readonly number[]).includes(n)) return true;
  return n > 30 && n % 5 === 0;
}

export function nextNestAwardCount(n: number): number {
  const step = AWARD_STEPS.find((c) => c > n);
  if (step) return step;
  return Math.floor(n / 5) * 5 + 5;
}

export function nestAwardTitle(n: number): string {
  return tl('nest.001', { n });
}

export type NestPhase = 'empty' | 'egg' | 'chick';

export function nestPhase(nest: NestState | undefined): NestPhase {
  if (!nest?.egg) return 'empty';
  return nest.egg.hatchedAt != null ? 'chick' : 'egg';
}

export function nestBirdName(id: string): string {
  return animalById(id)?.name ?? tl('main.032');
}

/** Unlocked birds, in encyclopedia order. */
export function nestCandidates(state: GameState): string[] {
  return ANIMALS.filter((a) => a.category === 'bird' && state.animals.includes(a.id)).map((a) => a.id);
}

/** Same date always picks the same species. One species for that day. */
export function pickNestBird(ids: readonly string[], date: string): string | null {
  if (!ids.length) return null;
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 33 + date.charCodeAt(i)) >>> 0;
  return ids[h % ids.length] ?? null;
}

export function nestEligible(state: GameState): boolean {
  return Boolean(state.started && !state.over && state.health >= NEST_MIN_HEALTH && nestCandidates(state).length);
}

/** Hatch a due egg, and lay today's one species when the tree is ready. Does not pay the night's reward. */
export function tickNest(state: GameState, now: number, date: string): { laid: boolean; hatched: boolean } {
  const none = { laid: false, hatched: false };
  if (!state.started || state.over) return none;
  const nest = (state.nest ??= freshNest());
  nest.laidOn ??= '';
  let hatched = false;
  if (nest.egg && nest.egg.hatchedAt == null && now >= eggHatchAt(nest.egg)) {
    nest.egg.hatchedAt = eggHatchAt(nest.egg);
    hatched = true;
  }
  if (!nestEligible(state) || nest.egg || nest.laidOn === date) return { laid: false, hatched };
  const bird = pickNestBird(nestCandidates(state), date);
  if (!bird) return { laid: false, hatched };
  nest.egg = { bird, laidAt: now, hatchedAt: null };
  nest.laidOn = date;
  return { laid: true, hatched };
}

/** Island decoration earned on the 1st hatch and every 10th after that. */
export const NEST_BUILDS = ['windmill', 'statue', 'house', 'pavilion'] as const;
export type NestBuildKind = (typeof NEST_BUILDS)[number];

export const NEST_BUILD_LABEL: Record<NestBuildKind, string> = live(() => ({
  windmill: tl('nest.002'),
  statue: tl('nest.003'),
  house: tl('nest.004'),
  pavilion: tl('nest.005'),
}));

/** 第 1 粒，同之後第 10、20、30… 粒。 */
export function isNestBuildCount(n: number): boolean {
  return n === 1 || (n >= 10 && n % 10 === 0);
}

/** 第 5、15、25… 粒。 */
export function isNestHeightCount(n: number): boolean {
  return n >= 5 && n % 10 === 5;
}

/** Decoration for this hatch count, in 風車、銅像、屋仔、涼亭 order. */
export function nestBuildAt(n: number): NestBuildKind | null {
  if (!isNestBuildCount(n)) return null;
  const index = n === 1 ? 0 : n / 10;
  return NEST_BUILDS[index % NEST_BUILDS.length] ?? null;
}

export function nestBuildPhrase(kind: NestBuildKind): string {
  return tl('nest.006', { p0: NEST_BUILD_LABEL[kind] });
}

/** Decorations already on the island, oldest first. */
export function nestBuilds(hatched: number): NestBuildKind[] {
  const out: NestBuildKind[] = [];
  for (let n = 1; n <= hatched; n++) {
    const kind = nestBuildAt(n);
    if (kind) out.push(kind);
  }
  return out;
}

export function nextNestBuildCount(n: number): number {
  if (n < 1) return 1;
  return Math.floor(n / 10) * 10 + 10;
}

export function nextNestHeightCount(n: number): number {
  const base = Math.floor(n / 10) * 10 + 5;
  return base > n ? base : base + 10;
}

/**
 * The first settlement at or after the hatch counts the egg.
 * An egg that hatches after midnight waits for the next night.
 */
export function settleNest(state: GameState, now: number, date: string): { paid: boolean; count: number; awards: number[]; bird: string } {
  const nest = (state.nest ??= freshNest());
  const egg = nest.egg;
  if (!egg) return { paid: false, count: nest.hatched, awards: [], bird: '' };
  if (egg.hatchedAt == null && eggHatchAt(egg) <= now) egg.hatchedAt = eggHatchAt(egg);
  if (egg.hatchedAt == null || egg.hatchedAt > now) return { paid: false, count: nest.hatched, awards: [], bird: egg.bird };
  const bird = egg.bird;
  nest.hatched += 1;
  noteNestRevealBird(nest, bird);
  nest.egg = null;
  const awards: number[] = [];
  if (isNestAwardCount(nest.hatched) && !nest.awards.some((a) => a.count === nest.hatched)) {
    nest.awards.push({ count: nest.hatched, date, ageDays: state.ageDays || 0 });
    awards.push(nest.hatched);
  }
  return { paid: true, count: nest.hatched, awards, bird };
}

/** When the current egg hatches, or null once it has hatched or there is no egg. */
export function nestHatchAt(state: GameState): number | null {
  const egg = state.nest?.egg;
  if (!egg || egg.hatchedAt != null) return null;
  return eggHatchAt(egg);
}

/** When this egg hatches. A warmed egg is one hour earlier; a missing `warmed` flag is not warmed. */
export function eggHatchAt(egg: { laidAt: number; warmed?: boolean }): number {
  return egg.laidAt + NEST_HATCH_MS - (egg.warmed ? NEST_WARM_MS : 0);
}

export type WarmReason = 'none' | 'hatched' | 'already' | 'soon';

/** Why keep-warm is refused, or null when it is allowed. Does not change the egg. */
export function warmBlock(state: GameState, now: number): WarmReason | null {
  const egg = state.nest?.egg;
  if (!egg) return 'none';
  if (egg.hatchedAt != null) return 'hatched';
  if (egg.warmed) return 'already';
  if (eggHatchAt(egg) - now <= NEST_WARM_MS) return 'soon';
  return null;
}

/** Shorten the current egg by one hour. Pure aside from the egg flag; the caller persists. */
export function warmEgg(state: GameState, now: number): { ok: boolean; reason?: WarmReason } {
  const reason = warmBlock(state, now);
  if (reason) return { ok: false, reason };
  state.nest!.egg!.warmed = true;
  return { ok: true };
}

export type NestReward =
  | { kind: 'build'; build: NestBuildKind }
  | { kind: 'growth' }
  | { kind: 'badge' }
  | { kind: 'none' };

/** What hatch number n gives. Build beats growth, growth beats a badge, otherwise nothing extra. */
export function nestRewardFor(n: number): NestReward {
  const build = nestBuildAt(n);
  if (build) return { kind: 'build', build };
  if (isNestHeightCount(n)) return { kind: 'growth' };
  if (isNestAwardCount(n)) return { kind: 'badge' };
  return { kind: 'none' };
}

/** One line for the countdown card and the egg pop-up. */
export function nestRewardText(n: number): string {
  const reward = nestRewardFor(n);
  if (reward.kind === 'build') return tl('nest.reward.build', { decoration: nestBuildPhrase(reward.build) });
  if (reward.kind === 'growth') return tl('nest.reward.growth');
  if (reward.kind === 'badge') return tl('nest.reward.badge');
  return tl('nest.reward.none');
}

/**
 * Old saves have no `revealedBuilds`: every decoration already on the island counts as shown,
 * so existing players do not replay the ground-break.
 */
export function migrateNest(nest: NestState): void {
  nest.laidOn ??= '';
  nest.awards ??= [];
  if (typeof nest.hatched !== 'number') nest.hatched = 0;
  if (nest.egg && !nest.egg.bird) nest.egg.bird = 'magpierobin';
  if (nest.revealedBuilds == null) nest.revealedBuilds = nestBuilds(nest.hatched).length;
  nest.revealBirds ??= [];
}

/** Decorations whose reveal has already played. A missing counter (pre-migration) shows them all. */
export function revealedNestBuilds(nest: NestState | null | undefined): NestBuildKind[] {
  if (!nest) return [];
  const all = nestBuilds(nest.hatched);
  const n = nest.revealedBuilds ?? all.length;
  return all.slice(0, Math.max(0, n));
}

/** Decorations earned but not yet revealed, oldest first. */
export function pendingNestReveals(nest: NestState | null | undefined): NestBuildKind[] {
  if (!nest) return [];
  const all = nestBuilds(nest.hatched);
  const n = nest.revealedBuilds ?? 0;
  return all.slice(Math.max(0, n));
}

/** Mark the next pending decoration as revealed. */
export function markNestRevealed(nest: NestState): void {
  const all = nestBuilds(nest.hatched);
  const cur = nest.revealedBuilds ?? 0;
  nest.revealedBuilds = Math.min(all.length, cur + 1);
}

function noteNestRevealBird(nest: NestState, bird: string): void {
  if (!nestBuildAt(nest.hatched)) return;
  const idx = nestBuilds(nest.hatched).length - 1;
  nest.revealBirds ??= [];
  while (nest.revealBirds.length <= idx) nest.revealBirds.push('');
  nest.revealBirds[idx] = bird;
}

export type FirstEggChoice = 'show' | 'silent' | 'none';

/**
 * Whether to show the one-time first-egg explanation.
 * Players who already hatched (this tree, or a badge kept on meta) skip it without a pop-up.
 * `justLaid` is the lay that just happened — an egg that was already waiting does not count.
 */
export function firstEggDecision(
  meta: { firstEggIntro?: boolean; nest?: readonly unknown[] | null },
  nest: { hatched?: number } | null | undefined,
  justLaid: boolean,
): FirstEggChoice {
  if (meta.firstEggIntro) return 'none';
  if ((meta.nest?.length ?? 0) > 0 || (nest?.hatched ?? 0) > 0) return 'silent';
  return justLaid ? 'show' : 'none';
}

/** 1.4.53 the egg pop-up (from the 3D egg or the countdown card) only opens while there is an unhatched egg. */
export function eggPopupAvailable(nest: NestState | null | undefined): boolean {
  const egg = nest?.egg;
  return Boolean(egg && egg.hatchedAt == null);
}

/**
 * 1.4.55 tap on the nest chick. The chick stays until the next midnight settlement, which counts the egg and empties
 * the nest (settleNest). On a decoration night (1st hatch, every 10th) the chick then leads the reveal flight down to
 * the island; on other nights it simply leaves the nest, so the line says only that.
 */
export function chickTapLine(nest: NestState | undefined): string | null {
  const egg = nest?.egg;
  if (!egg || egg.hatchedAt == null) return null;
  const bird = nestBirdName(egg.bird);
  return tl(nestBuildAt((nest?.hatched ?? 0) + 1) ? 'nest.chickFly' : 'nest.chickLeave', { bird });
}
