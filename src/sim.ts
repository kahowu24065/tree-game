import { ANIMALS, eventById, eventForDate, stageFor, stageIndex } from './content';
import { addDays, daysBetween, formatLong } from './dates';
import type { Care, DayCond, ForecastDay, GameState, Reinforcement, Storm, StormKind, StormOutcome } from './types';
import { clamp } from './util';
import { classify, stormLabel } from './weather';

export const HEALTH_FLOOR = 12;

export function freshCare(date: string): Care {
  return { date, watered: false, fertilized: false, dewormed: false, pruned: false, growthCm: 0, credited: false };
}

export function freshReinforcement(): Reinforcement {
  return { stakes: false, ropes: false, prune: false };
}

export function prepScore(r: Reinforcement): number {
  return (r.stakes ? 1 : 0) + (r.ropes ? 1 : 0) + (r.prune ? 1 : 0);
}

export function prepNeeded(kind: StormKind): number {
  if (kind === 'typhoon') return 3;
  if (kind === 'gale') return 2;
  return 1;
}

export function stormOutcome(kind: StormKind, score: number): StormOutcome {
  if (score >= prepNeeded(kind)) return 'safe';
  if (score > 0) return 'partial';
  return 'hit';
}

export function addLog(state: GameState, date: string, text: string): void {
  state.log.unshift({ date, text });
  if (state.log.length > 40) state.log.length = 40;
}

export function createGame(today: string): GameState {
  const state: GameState = {
    version: 1,
    started: false,
    treeName: '窗前小樹',
    createdOn: today,
    lastSeenDate: today,
    virtualToday: null,
    health: 76,
    heightCm: 18,
    moisture: 58,
    nutrients: 46,
    pests: 8,
    scars: 0,
    care: freshCare(today),
    reinforcement: freshReinforcement(),
    storms: [],
    animals: [],
    seenAnimals: [],
    log: [],
    daysCared: 0,
    stormSurvivals: 0,
    dailyEventDate: '',
    dailyEventId: 'quiet',
    eventBonus: 1,
    morningNote: null,
  };
  addLog(state, today, '一棵幼苗種低窗前。');
  ensureToday(state, today);
  refreshUnlocks(state, { hot: false, date: today });
  return state;
}

export function ensureToday(state: GameState, today: string): string | null {
  if (state.dailyEventDate === today) return null;
  state.eventBonus = 1;
  const event = eventForDate(today);
  state.dailyEventDate = today;
  state.dailyEventId = event.id;
  event.apply(state);
  state.health = clamp(state.health, HEALTH_FLOOR, 100);
  state.moisture = clamp(state.moisture, 0, 100);
  state.pests = clamp(state.pests, 0, 100);
  state.nutrients = clamp(state.nutrients, 0, 100);
  return `${event.title}：${event.text}`;
}

export interface GrowthContext {
  cared: boolean;
  visited: boolean;
  bonus: number;
}

export function growthBudget(state: GameState, cond: DayCond, ctx: GrowthContext): number {
  const stage = stageFor(state.heightCm);
  let cm = stage.growthMul * (0.55 + state.health / 180);
  if (ctx.cared) {
    if (state.care.watered || cond.raining) cm *= 1.12;
    if (state.care.fertilized) cm *= 1.28;
    if (state.care.pruned) cm *= 0.94;
    if (state.care.dewormed) cm *= 1.04;
  } else if (ctx.visited) {
    cm *= 0.62;
  } else {
    cm *= 0.4;
  }
  if (state.moisture < 25 && !cond.raining) cm *= 0.55;
  if (state.pests > 65) cm *= 0.7;
  if (cond.hot && state.moisture < 45 && !cond.raining) cm *= 0.75;
  if (state.nutrients > 55) cm *= 1.08;
  if (state.nutrients < 15) cm *= 0.8;
  cm *= ctx.bonus;
  if (state.health < 20) cm *= 0.4;
  return Math.max(0.15, cm);
}

function growthContext(state: GameState, date: string): GrowthContext {
  const visited = state.care.date === date;
  const cared = visited && (state.care.watered || state.care.fertilized || state.care.dewormed || state.care.pruned);
  return { cared, visited, bonus: visited ? state.eventBonus || 1 : 1 };
}

export function grantCareGrowth(state: GameState, cond: DayCond): number {
  const ctx = growthContext(state, state.care.date);
  const budget = growthBudget(state, cond, { ...ctx, cared: true });
  const room = Math.max(0, budget - state.care.growthCm);
  const bit = Math.min(room, Math.max(0.4, budget * 0.22));
  state.heightCm += bit;
  state.care.growthCm += bit;
  return bit;
}

export interface StormResult {
  date: string;
  kind: StormKind;
  outcome: StormOutcome;
  message: string;
  bonusCm: number;
}

export function closeDay(state: GameState, date: string, cond: DayCond): { growthCm: number; storms: StormResult[]; stageText: string | null } {
  const before = state.heightCm;
  const ctx = growthContext(state, date);
  const budget = growthBudget(state, cond, ctx);
  const already = state.care.date === date ? state.care.growthCm : 0;
  const rest = Math.max(0, budget - already);
  state.heightCm += rest;

  if (cond.raining) state.moisture = clamp(state.moisture + Math.min(42, 12 + cond.precipMm * 0.4), 0, 100);
  else state.moisture = clamp(state.moisture - (cond.hot ? 26 : 16), 0, 100);

  const dewormed = state.care.date === date && state.care.dewormed;
  state.pests = clamp(state.pests + (dewormed ? 2 : 7), 0, 100);
  const fertilized = state.care.date === date && state.care.fertilized;
  state.nutrients = clamp(state.nutrients - (fertilized ? 8 : 14), 0, 100);

  if (!ctx.visited) {
    if (state.moisture < 20) state.health -= 3;
    else if (state.moisture < 40) state.health -= 2;
    else state.health -= 1;
  } else if (state.moisture < 20) state.health -= 3;
  else if (state.moisture < 40) state.health -= 1;
  else state.health += ctx.cared ? 3 : 1;

  if (state.pests > 70) state.health -= 2;
  if (cond.hot && !cond.raining && !(state.care.date === date && state.care.watered)) state.health -= 3;
  if (state.nutrients > 40 && ctx.cared) state.health += 1;

  const storms = resolveStormsOn(state, date);
  state.health = clamp(state.health, HEALTH_FLOOR, 100);
  state.moisture = clamp(state.moisture, 0, 100);

  const stageText = noteStage(state, before, date);
  return { growthCm: state.heightCm - before, storms, stageText };
}

function noteStage(state: GameState, beforeCm: number, date: string): string | null {
  const before = stageFor(beforeCm);
  const after = stageFor(state.heightCm);
  if (before.id === after.id) return null;
  const text = `棵樹進入新階段：${after.name}。`;
  addLog(state, date, text);
  return text;
}

function resolveStormsOn(state: GameState, date: string): StormResult[] {
  const due = state.storms.filter((s) => !s.resolved && s.date === date);
  const results: StormResult[] = [];
  for (const storm of due) {
    results.push(resolveStorm(state, storm, date));
  }
  return results;
}

export function resolveStorm(state: GameState, storm: Storm, date: string): StormResult {
  const score = prepScore(state.reinforcement);
  const outcome = stormOutcome(storm.kind, score);
  const label = stormLabel(storm.kind);
  let bonusCm = 0;
  let message = '';
  if (outcome === 'safe') {
    state.health = clamp(state.health + 8, HEALTH_FLOOR, 100);
    bonusCm = 6 + stageIndex(state.heightCm) * 3;
    state.heightCm += bonusCm;
    state.stormSurvivals += 1;
    if (state.scars > 0) state.scars -= 1;
    message = `${label}過咗。你預先加固，棵樹唔單止捱住，仲長多 ${bonusCm} 厘米。`;
  } else if (outcome === 'partial') {
    state.health = clamp(state.health - 8, HEALTH_FLOOR, 100);
    state.scars = Math.min(4, state.scars + 1);
    message = `${label}打中棵樹。有少少加固，只係受咗輕傷，有枝拗斷。`;
  } else {
    const dmg = storm.kind === 'typhoon' ? 28 : storm.kind === 'gale' ? 18 : 12;
    state.health = clamp(state.health - dmg, HEALTH_FLOOR, 100);
    state.scars = Math.min(4, state.scars + 1);
    message = `${label}打中棵樹，有枝拗斷咗。下次預報嚴重天氣，可以先打樁、綁繩、修枝。`;
  }
  storm.resolved = true;
  storm.outcome = outcome;
  state.reinforcement = freshReinforcement();
  addLog(state, date, message);
  return { date, kind: storm.kind, outcome, message, bonusCm };
}

export function refreshUnlocks(state: GameState, opts: { hot: boolean; date: string }): string[] {
  const got: string[] = [];
  const meters = state.heightCm / 100;
  for (const animal of ANIMALS) {
    if (state.animals.includes(animal.id)) continue;
    if (meters < animal.minM || state.health < animal.minHealth) continue;
    if (animal.needStorms && state.stormSurvivals < animal.needStorms) continue;
    if (animal.needHeat && !opts.hot) continue;
    state.animals.push(animal.id);
    got.push(animal.id);
    addLog(state, opts.date, `${animal.name}嚟咗，住進棵樹。`);
  }
  return got;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  grewCm: number;
}

export function performAction(state: GameState, action: 'water' | 'fertilize' | 'deworm' | 'prune', cond: DayCond): ActionResult {
  if (action === 'water') {
    if (state.care.watered) return { ok: false, message: '今日澆過水喇。', grewCm: 0 };
    if (cond.raining) return { ok: false, message: '落緊雨，泥土濕㗎喇，唔使澆。', grewCm: 0 };
    state.care.watered = true;
    const amount = cond.hot ? 46 : 32;
    state.moisture = clamp(state.moisture + amount, 0, 100);
    let message = cond.hot ? '好熱，呢陣雨水解咗渴。' : '水滲入泥度，樹根好好飲。';
    if (!cond.hot && state.moisture > 92) {
      state.health = clamp(state.health - 2, HEALTH_FLOOR, 100);
      message = '澆得有啲多，泥土太濕，根部要透氣。';
    } else {
      state.health = clamp(state.health + (state.moisture < 70 ? 4 : 1), HEALTH_FLOOR, 100);
    }
    return finishAction(state, cond, message);
  }
  if (action === 'fertilize') {
    if (state.care.fertilized) return { ok: false, message: '今日施過肥喇。', grewCm: 0 };
    state.care.fertilized = true;
    const gain = state.nutrients > 85 ? 8 : 28;
    state.nutrients = clamp(state.nutrients + gain, 0, 100);
    state.health = clamp(state.health + 2, HEALTH_FLOOR, 100);
    const message = state.nutrients > 90 ? '泥已經好肥，效果少啲，留返聽日都得。' : '養分滲入泥度，葉色會慢慢亮起來。';
    return finishAction(state, cond, message);
  }
  if (action === 'deworm') {
    if (state.care.dewormed) return { ok: false, message: '今日檢查過蟲喇。', grewCm: 0 };
    state.care.dewormed = true;
    if (state.pests < 10) {
      state.pests = 0;
      state.health = clamp(state.health + 1, HEALTH_FLOOR, 100);
      return finishAction(state, cond, '搵唔到蟲，不過你檢查過，葉底乾淨。');
    }
    state.pests = clamp(state.pests - 48, 0, 100);
    state.health = clamp(state.health + 3, HEALTH_FLOOR, 100);
    return finishAction(state, cond, '蟲少咗，樹好像鬆一口氣。');
  }
  if (state.care.pruned) return { ok: false, message: '今日修剪過喇。', grewCm: 0 };
  state.care.pruned = true;
  state.health = clamp(state.health + 5, HEALTH_FLOOR, 100);
  state.pests = clamp(state.pests - 6, 0, 100);
  let message = '弱枝剪走，樹形輕咗少少。';
  if (state.scars > 0) {
    state.scars -= 1;
    message = '你修平咗斷枝，傷口乾淨咗。';
  }
  return finishAction(state, cond, message);
}

function finishAction(state: GameState, cond: DayCond, message: string): ActionResult {
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  const before = state.heightCm;
  const grew = grantCareGrowth(state, cond);
  const stageText = noteStage(state, before, state.care.date);
  const animals = refreshUnlocks(state, { hot: cond.hot, date: state.care.date });
  if (stageText) message = `${message} ${stageText}`;
  if (animals.length) {
    const names = animals.map((id) => ANIMALS.find((a) => a.id === id)?.name ?? id).join('、');
    message = `${message} ${names}嚟咗。`;
  }
  return { ok: true, message, grewCm: grew };
}

export function setReinforcement(state: GameState, key: keyof Reinforcement, on: boolean): string {
  state.reinforcement[key] = on;
  const labels = { stakes: '木樁', ropes: '防風繩', prune: '防風修枝' };
  const score = prepScore(state.reinforcement);
  if (!on) return `收起咗${labels[key]}。而家準備 ${score}/3。`;
  return `加咗${labels[key]}。而家準備 ${score}/3。`;
}

export function syncStorms(state: GameState, days: ForecastDay[], today: string): void {
  const dates = new Set<string>();
  for (const day of days) {
    if (day.date < today) continue;
    dates.add(day.date);
    const severity = classify({
      precipMm: day.precipMm,
      gustKmh: day.gustKmh,
      windKmh: day.windKmh,
      tempMax: day.tempMax,
    });
    const existing = state.storms.find((s) => s.date === day.date && !s.resolved);
    if (!severity.stormKind) {
      if (existing && !existing.debug) {
        state.storms = state.storms.filter((s) => s !== existing);
      }
      continue;
    }
    if (existing) {
      if (!existing.debug) {
        existing.kind = severity.stormKind;
        existing.rainMm = day.precipMm;
        existing.windKmh = day.windKmh;
        existing.gustKmh = day.gustKmh;
      }
    } else {
      state.storms.push({
        date: day.date,
        kind: severity.stormKind,
        rainMm: day.precipMm,
        windKmh: day.windKmh,
        gustKmh: day.gustKmh,
        resolved: false,
        debug: false,
      });
    }
  }
  state.storms = state.storms.filter((s) => s.resolved || s.debug || s.date < today || dates.has(s.date));
}

export function insertDebugStorm(state: GameState, date: string, kind: StormKind): Storm {
  state.storms = state.storms.filter((s) => !(s.date === date && !s.resolved));
  const storm: Storm = {
    date,
    kind,
    rainMm: kind === 'typhoon' ? 120 : kind === 'heavy-rain' ? 70 : 12,
    windKmh: kind === 'typhoon' ? 100 : kind === 'gale' ? 55 : 22,
    gustKmh: kind === 'typhoon' ? 150 : kind === 'gale' ? 85 : 36,
    resolved: false,
    debug: true,
  };
  state.storms.push(storm);
  state.storms.sort((a, b) => a.date.localeCompare(b.date));
  return storm;
}

export function clearDebugStorms(state: GameState): void {
  state.storms = state.storms.filter((s) => !s.debug || s.resolved);
}

export interface CatchupReport {
  daysPassed: number;
  growthCm: number;
  healthBefore: number;
  healthAfter: number;
  storms: StormResult[];
  stageTexts: string[];
  eventText: string | null;
  animals: string[];
}

export function catchUp(state: GameState, today: string, dayCond: (date: string) => DayCond, hotToday: boolean): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const storms: StormResult[] = [];
  const stageTexts: string[] = [];
  let gap = daysBetween(state.lastSeenDate, today);
  if (gap < 0) {
    state.lastSeenDate = today;
    state.care = freshCare(today);
    gap = 0;
  }
  if (gap > 0) {
    for (let i = 0; i < gap; i++) {
      const date = addDays(state.lastSeenDate, i);
      const closed = closeDay(state, date, dayCond(date));
      storms.push(...closed.storms);
      if (closed.stageText) stageTexts.push(closed.stageText);
    }
    state.lastSeenDate = today;
    state.care = freshCare(today);
  }
  const eventText = ensureToday(state, today);
  const animals = refreshUnlocks(state, { hot: hotToday, date: today });
  const growthCm = state.heightCm - heightBefore;
  if (gap === 1) {
    state.morningNote = `過咗一夜，棵樹長咗 ${growthCm.toFixed(1)} 厘米。`;
  } else if (gap > 1) {
    const tired = state.health < healthBefore ? `健康由 ${Math.round(healthBefore)} 落到 ${Math.round(state.health)}，` : '';
    state.morningNote = `你離開咗 ${gap} 日。${tired}棵樹仍然在，長咗 ${growthCm.toFixed(1)} 厘米。`;
  }
  if (storms.length && gap > 0) {
    const extra = storms.map((s) => s.message).join(' ');
    state.morningNote = state.morningNote ? `${state.morningNote} ${extra}` : extra;
  }
  return {
    daysPassed: Math.max(0, gap),
    growthCm,
    healthBefore,
    healthAfter: state.health,
    storms,
    stageTexts,
    eventText,
    animals,
  };
}

export function advanceVirtualDay(state: GameState, today: string, cond: DayCond): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const closed = closeDay(state, today, cond);
  const next = addDays(today, 1);
  state.virtualToday = next;
  state.lastSeenDate = next;
  state.care = freshCare(next);
  const eventText = ensureToday(state, next);
  const animals = refreshUnlocks(state, { hot: false, date: next });
  const growthCm = state.heightCm - heightBefore;
  state.morningNote = `過咗一夜，棵樹長咗 ${growthCm.toFixed(1)} 厘米。`;
  if (closed.storms.length) state.morningNote += ` ${closed.storms.map((s) => s.message).join(' ')}`;
  return {
    daysPassed: 1,
    growthCm,
    healthBefore,
    healthAfter: state.health,
    storms: closed.storms,
    stageTexts: closed.stageText ? [closed.stageText] : [],
    eventText,
    animals,
  };
}

export function jumpStage(state: GameState, today: string, hot: boolean): string {
  const order = ['seedling', 'sapling', 'young', 'mature', 'ancient', 'giant'];
  const current = stageFor(state.heightCm).id;
  const idx = order.indexOf(current);
  const targets = [50, 200, 800, 2000, 5000, 8000];
  const nextIdx = Math.min(order.length - 1, idx + 1);
  const before = state.heightCm;
  if (current === 'giant') state.heightCm += 1500;
  else state.heightCm = (targets[nextIdx] ?? 8000) + 20;
  state.health = clamp(Math.max(state.health, 84), HEALTH_FLOOR, 100);
  noteStage(state, before, today);
  refreshUnlocks(state, { hot, date: today });
  return stageFor(state.heightCm).name;
}

export function advice(state: GameState, cond: DayCond, nextStorm: Storm | undefined): string {
  if (state.health < 35) return '樹有啲攰。澆水、施肥同除蟲都可以幫佢慢慢好返。';
  if (nextStorm) return `${formatLong(nextStorm.date)}可能有${stormLabel(nextStorm.kind)}，可以先去預報頁加固。`;
  if (cond.raining) return '落緊雨，唔使澆水。施肥、除蟲或者修剪都好。';
  if (cond.hot && state.moisture < 60) return '今日好熱，泥土快乾，記得澆水。';
  if (state.pests > 45) return '葉底有蟲，除一除會舒服啲。';
  if (state.moisture < 35) return '泥土有啲乾，適合澆水。';
  if (state.nutrients < 28) return '養分少，可以施肥。';
  const done = [state.care.watered || cond.raining, state.care.fertilized, state.care.dewormed, state.care.pruned].filter(Boolean).length;
  if (done >= 4 || (cond.raining && done >= 3 && state.care.fertilized && state.care.dewormed && state.care.pruned)) {
    return '今日的小事做完喇，聽日再嚟望一望。';
  }
  return '揀一件小事做就得，唔使急。';
}

export function upcomingStorm(state: GameState, today: string): Storm | undefined {
  return state.storms
    .filter((s) => !s.resolved && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function dayNumber(state: GameState, today: string): number {
  return Math.max(1, daysBetween(state.createdOn, today) + 1);
}

export function eventTitle(state: GameState): { title: string; text: string } {
  const event = eventById(state.dailyEventId);
  return { title: event.title, text: event.text };
}
