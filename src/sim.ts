/** Game state changes: care actions, nightly settlement, catch-up, dying, season end. */
import {
  CARE,
  DYING_HOURS,
  LANDMARK_N_BONUS,
  N_OPTIMAL,
  PEST_DAMAGE,
  PEST_TRIGGER_DAYS,
  PEST_TRIGGER_DAYS_GUARDED,
  PREPS,
  R_DAILY_DECAY,
  R_MAX,
  RESCUE_HEALTH,
  RESIDENT_LEAVE_H,
  RESIDENT_MIN_H,
  RESIDENT_N_EACH,
  RESIDENT_N_MAX,
  RESIDENT_STREAK,
  REVIVE_HEALTH,
  START,
  STORM_SURVIVE_GROWTH,
  STORM_SURVIVE_SHARE,
  T1_WATER_LOSS_MULT,
  T2_RAIN_TO_N_CHANCE,
  W_OPTIMAL,
  N_DAILY_USE,
  WEATHER_EVENTS,
  type PrepId,
  type SeasonId,
  type WeatherEventId,
} from './balance';
import { ANIMALS, eventById, eventForDate, stageFor } from './content';
import { defaultSpecies, speciesDef, speciesTargetCm, type SpeciesId } from './data/species';
import { addDays, daysBetween } from './dates';
import { dayEvent, mildEvent } from './events';
import {
  baseDailyGrowth,
  carbonKg,
  clamp100,
  deltaG,
  earnedTiers,
  finalDamage,
  hMult,
  hMultTier,
  inBand,
  nFactor,
  pickEvent,
  rollFor,
  seasonDef,
  wFactor,
} from './rules';
import type { Care, ForecastDay, GameState, LogKind, LogReward, MetaState, Reinforcement, Settlement } from './types';
import { formatHeight } from './util';

export function freshCare(date: string): Care {
  return { date, water: 0, drain: 0, fertilize: 0, dewormed: false, preps: { stakes: false, ropes: false, prune: false }, credited: false };
}

let logClock: () => string = () => '';

/** The browser sets this so log entries carry the local HH:MM they happened at. */
export function setLogClock(fn: () => string): void {
  logClock = fn;
}

export interface LogMeta {
  kind?: LogKind;
  title?: string;
  reward?: LogReward;
  time?: string;
}

export function addLog(state: GameState, date: string, text: string, meta: LogMeta = {}): void {
  state.log.unshift({ date, text, time: meta.time ?? logClock(), kind: meta.kind, title: meta.title, reward: meta.reward });
  if (state.log.length > 120) state.log.length = 120;
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const sgn = (v: number) => `${v >= 0 ? '+' : ''}${r1(v)}`;

export function createGame(today: string, opts: { season?: SeasonId; name?: string; legacyBonus?: number; species?: SpeciesId } = {}): GameState {
  const legacyBonus = opts.legacyBonus ?? 0;
  const state: GameState = {
    version: 2,
    started: false,
    treeName: opts.name ?? '世界之樹',
    season: opts.season ?? 's3',
    species: opts.species && speciesDef(opts.species).season === (opts.season ?? 's3') ? opts.species : defaultSpecies(opts.season ?? 's3'),
    createdOn: today,
    lastSeenDate: today,
    virtualToday: null,
    health: START.health,
    moisture: START.moisture,
    nutrients: clamp100(START.nutrients + legacyBonus),
    resist: START.resist,
    heightCm: START.heightCm,
    pest: { active: false, lowNDays: 0, wetDays: 0, since: null },
    care: freshCare(today),
    dayEvents: {},
    animals: [],
    seenAnimals: [],
    residents: [],
    highStreak: 0,
    scars: 0,
    log: [],
    daysCared: 0,
    stormSurvivals: 0,
    dailyEventDate: '',
    dailyEventId: 'quiet',
    eventBonus: 1,
    morningNote: null,
    dying: null,
    over: null,
    completed: null,
    passedTargetOn: null,
    targetCm: 0,
    lastSettlement: null,
    legacyBonus,
  };
  state.targetCm = speciesTargetCm(state.species);
  addLog(state, today, legacyBonus ? `一棵幼苗喺上一棵樹留低嘅養分地標旁邊種低，一開始就有 +${legacyBonus} 養分。` : '一棵幼苗種低咗，由今日開始慢慢陪佢大。', {
    kind: 'plant',
    title: '種低幼苗',
    reward: { text: legacyBonus ? `+${legacyBonus} 養分` : '新開始', tone: 'green' },
  });
  ensureToday(state, today);
  return state;
}

export function ensureToday(state: GameState, today: string): string | null {
  if (state.dailyEventDate === today) return null;
  state.eventBonus = 1;
  const event = eventForDate(today);
  state.dailyEventDate = today;
  state.dailyEventId = event.id;
  event.apply(state);
  if (event.id !== 'quiet') addLog(state, today, event.text, { kind: 'event', title: `今日小事：${event.title}`, reward: event.chip });
  state.health = clamp100(state.health);
  state.moisture = clamp100(state.moisture);
  state.nutrients = clamp100(state.nutrients);
  return `${event.title}：${event.text}`;
}

/* ---------- Weather records ---------- */

/** Remember what weather was seen on a date (HKO warnings seen at any time that day count). */
export function recordEvents(state: GameState, date: string, events: readonly WeatherEventId[], hko: boolean): void {
  const rec = (state.dayEvents[date] ??= { events: [], hko: false });
  for (const e of events) if (e !== 'clear' && !rec.events.includes(e)) rec.events.push(e);
  rec.hko ||= hko;
  const keys = Object.keys(state.dayEvents).sort();
  while (keys.length > 21) delete state.dayEvents[keys.shift()!];
}

/** Events a date is settled with: what was seen that day, plus the day's forecast (HKO days: only drizzle/fine from the forecast). */
export function eventsForDate(state: GameState, date: string, day: ForecastDay | undefined): WeatherEventId[] {
  const rec = state.dayEvents[date];
  const base = rec?.hko ? mildEvent(day) : day ? dayEvent(day) : 'clear';
  return [...new Set([base, ...(rec?.events ?? [])])];
}

/* ---------- Nightly settlement ---------- */

export interface Perks {
  waterSaver: boolean;
  rainToN: boolean;
}

export function perksFrom(meta: MetaState | null): Perks {
  return { waterSaver: Boolean(meta && meta.badges['1'] > 0), rainToN: Boolean(meta && meta.badges['2'] > 0) };
}

export interface SettleResult {
  settlement: Settlement;
  messages: string[];
  died: boolean;
  revived: boolean;
  completed: boolean;
}

/**
 * Settle one day (設計書 二、三):
 * H_new = H_old + W_factor + N_factor − 天氣基礎傷害 × (1 − R/100) − 蟲害; ΔG = 目標/日數 × H_mult × 天氣獎勵加成.
 * Several events never stack — only the one with the highest base damage applies.
 */
export function settleDay(state: GameState, date: string, events: readonly WeatherEventId[], meta: MetaState | null, nowMs: number): SettleResult {
  const perks = perksFrom(meta);
  const season = seasonDef(state.season);
  const eventId = pickEvent(events);
  const def = WEATHER_EVENTS[eventId];
  const notes: string[] = [];
  const messages: string[] = [];
  const hBefore = state.health;
  const wBefore = state.moisture;
  const nBefore = state.nutrients;
  const rBefore = state.resist;
  if (events.filter((e) => e !== 'clear').length > 1) notes.push(`同時有${events.filter((e) => e !== 'clear').map((e) => WEATHER_EVENTS[e].label).join('、')}，只計最重嘅${def.label}`);

  // Side effects of the chosen event.
  let dW = def.dW;
  let dN = 0;
  if (dW < 0 && perks.waterSaver) {
    dW = r1(dW * T1_WATER_LOSS_MULT);
    notes.push('一級徽章：水分流失減少 10%');
  }
  if ((eventId === 'rainstorm' || eventId === 'blackrain') && perks.rainToN && rollFor(`rain2n|${date}`) < T2_RAIN_TO_N_CHANCE) {
    dN = dW / 2;
    dW = dW / 2;
    notes.push(`二級徽章：${dN} 水分轉咗做養分`);
  }
  state.moisture = clamp100(state.moisture + dW);
  const residentN = Math.min(RESIDENT_N_MAX, state.residents.length * RESIDENT_N_EACH);
  if (residentN) notes.push(`長駐動物施肥 +${residentN} 養分`);
  state.nutrients = clamp100(state.nutrients - N_DAILY_USE + dN + residentN);

  // Damage uses the shield as it stood, then the event consumes it.
  const dmg = finalDamage(def.damage, state.resist);
  state.resist = Math.max(0, Math.min(R_MAX, state.resist + def.dR - R_DAILY_DECAY));

  const pestDamage = state.pest.active ? PEST_DAMAGE : 0;
  if (pestDamage) notes.push('蟲害 −15');
  const wf = wFactor(state.moisture);
  const nf = nFactor(state.nutrients);
  state.health = r1(Math.max(0, Math.min(100, state.health + wf + nf - dmg - pestDamage)));

  // Growth.
  const mult = hMult(state.health);
  const survived = def.damage > 0 && dmg <= def.damage * STORM_SURVIVE_SHARE;
  const bonus = Math.round(def.growth * (survived ? STORM_SURVIVE_GROWTH : 1) * (state.eventBonus || 1) * 100) / 100;
  const target = speciesTargetCm(state.species);
  const base = r1(baseDailyGrowth(season, target));
  const dG = deltaG(base, mult, bonus);
  const beforeCm = state.heightCm;
  state.heightCm = Math.max(5, r1(state.heightCm + dG));

  if (def.damage > 0) {
    if (survived) {
      state.stormSurvivals += 1;
      if (state.scars > 0) state.scars -= 1;
      addLog(state, date, `${def.label}過咗。抗風力 ${Math.round(rBefore)} 擋咗大部分傷害（${def.damage} → ${dmg}），今晚仲長得特別壯。`, {
        kind: 'storm-safe',
        title: `捱過${def.label}`,
        reward: { text: `生長 ×${STORM_SURVIVE_GROWTH}`, tone: 'green' },
        time: '',
      });
      messages.push(`${def.label}過咗，你預先加固，只受 ${dmg} 點傷害，仲長得更壯。`);
    } else if (dmg >= 10) {
      state.scars = Math.min(4, state.scars + 1);
      addLog(state, date, `${def.label}令健康度 −${dmg}（基礎 ${def.damage}，抗風力 ${Math.round(rBefore)} 減免咗 ${r1(def.damage - dmg)}）。`, {
        kind: 'storm-hit',
        title: `${def.label}打中棵樹`,
        reward: { text: `-${dmg} 健康度`, tone: 'red' },
        time: '',
      });
      messages.push(`${def.label}令健康度 −${dmg}。下次預警一出，先加固推高抗風力。`);
    }
  }

  // 蟲害 triggers for the coming days.
  state.pest.lowNDays = state.nutrients < 30 ? state.pest.lowNDays + 1 : 0;
  state.pest.wetDays = state.moisture > W_OPTIMAL[1] ? state.pest.wetDays + 1 : 0;
  const need = state.residents.length >= 2 ? PEST_TRIGGER_DAYS_GUARDED : PEST_TRIGGER_DAYS;
  if (!state.pest.active && (state.pest.lowNDays >= need || state.pest.wetDays >= need)) {
    state.pest.active = true;
    state.pest.since = date;
    const why = state.pest.lowNDays >= need ? `連續 ${need} 日營養不良` : `連續 ${need} 日水浸`;
    addLog(state, date, `${why}，葉底生咗蟲。每日會扣 15 健康度，要用除蟲處理。`, { kind: 'pest', title: '蟲害', reward: { text: '-15/日', tone: 'red' }, time: '' });
    messages.push(`${why}，生咗蟲！記得除蟲。`);
  }

  // Resident animals (long-term H ≥ 90).
  if (state.health >= RESIDENT_MIN_H) {
    state.highStreak += 1;
    if (state.highStreak >= RESIDENT_STREAK) {
      const pick = state.animals.find((id) => !state.residents.includes(id));
      if (pick) {
        state.residents.push(pick);
        state.highStreak = 0;
        const name = ANIMALS.find((a) => a.id === pick)?.name ?? pick;
        addLog(state, date, `${name}鍾意呢棵咁健康嘅樹，決定長駐。每晚會幫手施少少肥${state.residents.length >= 2 ? '，仲會幫手防蟲' : ''}。`, {
          kind: 'animal',
          title: '動物長駐',
          reward: { text: '長駐', tone: 'purple' },
          time: '',
        });
      }
    }
  } else {
    state.highStreak = 0;
    if (state.health < RESIDENT_LEAVE_H && state.residents.length) {
      const gone = state.residents.pop()!;
      const name = ANIMALS.find((a) => a.id === gone)?.name ?? gone;
      addLog(state, date, `樹唔夠精神，${name}搬走咗。健康度長期保持 90 以上，佢會返嚟。`, { kind: 'animal', title: '動物離開', time: '' });
    }
  }

  // 瀕死 and death.
  let died = false;
  let revived = false;
  const wasDying = state.dying;
  if (state.health <= 0) {
    state.health = 0;
    if (!wasDying) {
      state.dying = { since: date, at: nowMs };
      addLog(state, date, `健康度跌到 0，棵樹進入 24 小時瀕死狀態。將水分調返 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就救得返。`, {
        kind: 'dying',
        title: '瀕死',
        reward: { text: '24 小時', tone: 'red' },
        time: '',
      });
      messages.push('棵樹瀕死！24 小時內將水分同養分調返最佳範圍就救得返。');
    } else if (nowMs - wasDying.at >= DYING_HOURS * 3600 * 1000) {
      if (meta && meta.reviveTokens > 0) {
        meta.reviveTokens -= 1;
        state.health = REVIVE_HEALTH;
        state.dying = null;
        revived = true;
        addLog(state, date, `免死金牌生效，棵樹重新有咗生氣（健康度 ${REVIVE_HEALTH}）。`, { kind: 'badge', title: '免死金牌', reward: { text: `健康 ${REVIVE_HEALTH}`, tone: 'purple' }, time: '' });
        messages.push('免死金牌救返棵樹！');
      } else {
        died = true;
        const days = daysBetween(state.createdOn, date) + 1;
        // Badges already booked at season completion are not awarded twice.
        state.over = { kind: 'dead', date, tiers: state.completed ? [] : earnedTiers(season.days, days, false), days };
        addLog(state, date, `${state.treeName}枯死咗，會化作小島上嘅養分地標，下一棵樹一開始就有 +${LANDMARK_N_BONUS} 養分。`, { kind: 'dying', title: '枯死', time: '' });
      }
    }
  } else if (wasDying) {
    state.dying = null;
    addLog(state, date, '棵樹捱過瀕死，慢慢回復生氣。', { kind: 'grow', title: '救返', reward: { text: `健康 ${Math.round(state.health)}`, tone: 'green' }, time: '' });
  }

  const settlement: Settlement = {
    date,
    events: [...events],
    event: eventId,
    hBefore,
    hAfter: state.health,
    wBefore,
    wAfter: state.moisture,
    nBefore,
    nAfter: state.nutrients,
    rBefore,
    rAfter: state.resist,
    wFactor: wf,
    nFactor: nf,
    baseDamage: def.damage,
    finalDamage: dmg,
    pestDamage,
    hMult: mult,
    weatherBonus: bonus,
    baseGrowth: base,
    deltaG: r1(state.heightCm - beforeCm),
    heightAfter: state.heightCm,
    carbonKg: carbonKg(state.heightCm),
    notes,
  };
  state.lastSettlement = settlement;
  const tier = hMultTier(state.health);
  addLog(
    state,
    date,
    `${def.label}。水分 ${wf > 0 ? '適中' : '失衡'} ${sgn(wf)}，養分 ${sgn(nf)}，天氣損傷 ${def.damage}→${dmg}${pestDamage ? `，蟲害 −${pestDamage}` : ''}。健康 ${Math.round(hBefore)}→${Math.round(state.health)}，${tier.label} ×${mult}。`,
    { kind: 'settle', title: '夜間結算', reward: { text: `${dG >= 0 ? '+' : ''}${settlement.deltaG} 厘米`, tone: dG >= 0 ? 'blue' : 'red' }, time: '' },
  );
  noteStage(state, beforeCm, date);

  // The season target is a goal, not a cap: growth carries on by the same formula after it.
  if (!state.over && !state.passedTargetOn && state.heightCm >= speciesTargetCm(state.species)) {
    state.passedTargetOn = date;
    addLog(state, date, `${state.treeName}突破咗 ${formatHeight(speciesTargetCm(state.species))} 嘅目標，繼續長高！`, { kind: 'badge', title: '已突破目標', reward: { text: formatHeight(state.heightCm), tone: 'purple' }, time: '' });
  }
  let completed = false;
  if (!state.over && !state.completed) {
    const days = daysBetween(state.createdOn, date) + 1;
    if (days >= season.days) {
      completed = true;
      state.completed = { date, tiers: earnedTiers(season.days, days, true), days, heightCm: state.heightCm };
      addLog(state, date, `${season.label}完成！${state.treeName}長到 ${formatHeight(state.heightCm)}，徽章到手。棵樹會繼續長落去。`, { kind: 'badge', title: '賽季完成', reward: { text: '徽章', tone: 'purple' }, time: '' });
    }
  }
  return { settlement, messages, died, revived, completed };
}

function noteStage(state: GameState, beforeCm: number, date: string, time = ''): string | null {
  const target = speciesTargetCm(state.species);
  const before = stageFor(beforeCm, target);
  const after = stageFor(state.heightCm, target);
  if (before.id === after.id || state.heightCm < beforeCm) return null;
  addLog(state, date, `棵樹長成${after.name}，高 ${formatHeight(state.heightCm)}。`, { kind: 'stage', title: '進入新階段', reward: { text: after.name, tone: 'blue' }, time });
  return `棵樹進入新階段：${after.name}。`;
}

/* ---------- Care actions ---------- */

export type CareAction = 'water' | 'fertilize' | 'deworm' | 'drain';

export interface ActionResult {
  ok: boolean;
  message: string;
}

export function actionLimit(state: GameState, action: CareAction): { used: number; max: number } {
  if (action === 'water') return { used: state.care.water, max: CARE.water.perDay };
  if (action === 'drain') return { used: state.care.drain, max: CARE.drain.perDay };
  if (action === 'fertilize') return { used: state.care.fertilize, max: CARE.fertilize.perDay };
  return { used: state.care.dewormed ? 1 : 0, max: 1 };
}

export function performAction(state: GameState, action: CareAction, opts: { raining: boolean }): ActionResult {
  if (state.over) return { ok: false, message: '呢局已經完結。' };
  const lim = actionLimit(state, action);
  if (lim.used >= lim.max) return { ok: false, message: '今日做夠喇，聽日再嚟。' };
  let message = '';
  let reward: LogReward;
  const title = { water: '已澆水', fertilize: '已施肥', deworm: '已除蟲', drain: '已疏水' }[action];
  if (action === 'water') {
    if (opts.raining) return { ok: false, message: '落緊雨，泥土濕㗎喇，唔使澆。' };
    state.care.water += 1;
    state.moisture = clamp100(state.moisture + CARE.water.amount);
    message = state.moisture > W_OPTIMAL[1] ? `澆得有啲多，水分 ${Math.round(state.moisture)}，太濕會爛根，可以疏水。` : `水滲入泥度，水分 ${Math.round(state.moisture)}。`;
    reward = { text: `+${CARE.water.amount} 水分`, tone: 'blue' };
  } else if (action === 'drain') {
    state.care.drain += 1;
    state.moisture = clamp100(state.moisture + CARE.drain.amount);
    message = state.moisture < W_OPTIMAL[0] ? `疏走咗啲水，水分 ${Math.round(state.moisture)}，有啲乾喇。` : `開咗排水溝，泥土透返氣，水分 ${Math.round(state.moisture)}。`;
    reward = { text: `${CARE.drain.amount} 水分`, tone: 'blue' };
  } else if (action === 'fertilize') {
    state.care.fertilize += 1;
    state.nutrients = clamp100(state.nutrients + CARE.fertilize.amount);
    message = `養分滲入泥度，養分 ${Math.round(state.nutrients)}。`;
    reward = { text: `+${CARE.fertilize.amount} 養分`, tone: 'green' };
  } else {
    state.care.dewormed = true;
    if (state.pest.active) {
      state.pest = { active: false, lowNDays: 0, wetDays: 0, since: null };
      message = '用咗除蟲道具，蟲害清除咗。';
      reward = { text: '清除蟲害', tone: 'green' };
    } else {
      state.pest.lowNDays = 0;
      state.pest.wetDays = 0;
      message = '冇蟲，不過你預防咗一次，計數重新開始。';
      reward = { text: '預防', tone: 'green' };
    }
  }
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  addLog(state, state.care.date, message, { kind: action, title, reward });
  const rescue = checkRescue(state);
  if (rescue) message = `${message} ${rescue}`;
  const animals = refreshUnlocks(state, { date: state.care.date });
  if (animals.length) message = `${message} ${animals.map((id) => ANIMALS.find((a) => a.id === id)?.name ?? id).join('、')}嚟咗。`;
  return { ok: true, message };
}

/** While 瀕死: bringing W and N back into their optimal bands saves the tree right away. */
export function checkRescue(state: GameState): string | null {
  if (!state.dying || state.over) return null;
  if (!inBand(state.moisture, W_OPTIMAL) || state.nutrients < N_OPTIMAL[0]) return null;
  state.dying = null;
  state.health = RESCUE_HEALTH;
  addLog(state, state.care.date, `水分同養分都返到最佳範圍，棵樹救返喇（健康度 ${RESCUE_HEALTH}）。`, { kind: 'grow', title: '救返', reward: { text: `健康 ${RESCUE_HEALTH}`, tone: 'green' } });
  return '棵樹救返喇！';
}

export function reinforce(state: GameState, prep: PrepId): ActionResult {
  if (state.over) return { ok: false, message: '呢局已經完結。' };
  if (state.care.preps[prep]) return { ok: false, message: `今日${PREPS[prep].label}過喇。` };
  if (state.resist >= R_MAX) return { ok: false, message: '抗風力已經滿咗。' };
  state.care.preps[prep] = true;
  const before = state.resist;
  state.resist = Math.min(R_MAX, state.resist + PREPS[prep].amount);
  const gain = Math.round(state.resist - before);
  if (!state.care.credited) {
    state.daysCared += 1;
    state.care.credited = true;
  }
  addLog(state, state.care.date, `${PREPS[prep].label}，抗風力 ${Math.round(before)} → ${Math.round(state.resist)}。`, { kind: 'reinforce', title: '已加固', reward: { text: `+${gain} 抗風力`, tone: 'orange' } });
  return { ok: true, message: `${PREPS[prep].label}：抗風力 +${gain}（而家 ${Math.round(state.resist)}）。` };
}

/** Trees show stakes / ropes / pruning as R rises. */
export function visualReinforcement(resist: number): Reinforcement {
  return { stakes: resist >= 15, ropes: resist >= 35, prune: resist >= 60 };
}

const RAIN_EVENTS: WeatherEventId[] = ['drizzle', 'rainstorm', 'blackrain', 'thunder', 'typhoon1', 'typhoon8'];
const SEASON_RANK: Record<SeasonId, number> = { s3: 1, s6: 2, s12: 3 };

/** Check 圖鑑 unlocks: height, health, storms, real month, today's (or last night's) weather and season length. */
export function refreshUnlocks(state: GameState, opts: { date: string; events?: WeatherEventId[] }): string[] {
  const got: string[] = [];
  const meters = state.heightCm / 100;
  const evs = new Set<WeatherEventId>([...(opts.events ?? []), ...(state.dayEvents[opts.date]?.events ?? [])]);
  if (state.lastSettlement && state.lastSettlement.date === addDays(opts.date, -1)) state.lastSettlement.events.forEach((e) => evs.add(e));
  const hot = evs.has('hot');
  const rain = RAIN_EVENTS.some((e) => evs.has(e));
  const month = Number(opts.date.slice(5, 7));
  for (const animal of ANIMALS) {
    if (state.animals.includes(animal.id)) continue;
    if (meters < animal.minM || state.health < animal.minHealth) continue;
    if (animal.needStorms && state.stormSurvivals < animal.needStorms) continue;
    if (animal.weather === 'hot' && !hot) continue;
    if (animal.weather === 'rain' && !rain) continue;
    if (animal.weather === 'storm' && state.stormSurvivals < 1) continue;
    if (animal.months && !animal.months.includes(month)) continue;
    if (animal.season && SEASON_RANK[state.season] < SEASON_RANK[animal.season]) continue;
    state.animals.push(animal.id);
    got.push(animal.id);
    addLog(state, opts.date, `${animal.name}嚟咗，${animal.about}`, { kind: 'animal', title: '新朋友來訪', reward: { text: '+1 圖鑑', tone: 'purple' } });
  }
  return got;
}

export function triggerPest(state: GameState, date: string): void {
  state.pest.active = true;
  state.pest.since = date;
  addLog(state, date, '葉底生咗蟲。每晚會扣 15 健康度，要用除蟲處理。', { kind: 'pest', title: '蟲害', reward: { text: '-15/日', tone: 'red' } });
}

/* ---------- Day changes ---------- */

export interface CatchupReport {
  daysPassed: number;
  growthCm: number;
  healthBefore: number;
  healthAfter: number;
  messages: string[];
  eventText: string | null;
  animals: string[];
  settlements: Settlement[];
  over: boolean;
}

/** Settle every day between the last visit and today. Stops if the game ends. */
export function catchUp(
  state: GameState,
  today: string,
  eventsFor: (date: string) => WeatherEventId[],
  meta: MetaState | null,
  nowMs: number,
): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const messages: string[] = [];
  const settlements: Settlement[] = [];
  let gap = daysBetween(state.lastSeenDate, today);
  if (gap < 0) {
    state.lastSeenDate = today;
    state.care = freshCare(today);
    gap = 0;
  }
  if (gap > 0 && !state.over) {
    for (let i = 0; i < gap; i++) {
      const date = addDays(state.lastSeenDate, i);
      const res = settleDay(state, date, eventsFor(date), meta, nowMs);
      settlements.push(res.settlement);
      messages.push(...res.messages);
      if (state.over) break;
    }
    state.lastSeenDate = today;
    state.care = freshCare(today);
  }
  const growthCm = state.heightCm - heightBefore;
  let eventText: string | null = null;
  let animals: string[] = [];
  if (!state.over) {
    eventText = ensureToday(state, today);
    animals = refreshUnlocks(state, { date: today, events: [...(settlements.at(-1)?.events ?? []), ...eventsFor(today)] });
    if (gap === 1) state.morningNote = nightNote(settlements[0]);
    else if (gap > 1) state.morningNote = `你離開咗 ${gap} 日。健康 ${Math.round(healthBefore)} → ${Math.round(state.health)}，高度 ${growthCm >= 0 ? '+' : ''}${growthCm.toFixed(1)} 厘米。`;
    if (messages.length && gap > 0) state.morningNote = `${state.morningNote ?? ''} ${messages.join(' ')}`.trim();
  }
  return { daysPassed: Math.max(0, gap), growthCm, healthBefore, healthAfter: state.health, messages, eventText, animals, settlements, over: Boolean(state.over) };
}

function nightNote(s: Settlement | undefined): string {
  if (!s) return '';
  return `昨晚結算：${WEATHER_EVENTS[s.event].label}，健康 ${Math.round(s.hBefore)} → ${Math.round(s.hAfter)}，高度 ${s.deltaG >= 0 ? '+' : ''}${s.deltaG} 厘米。`;
}

/** Developer: settle today now and move to tomorrow. */
export function advanceVirtualDay(state: GameState, today: string, events: WeatherEventId[], meta: MetaState | null, nowMs: number): CatchupReport {
  const healthBefore = state.health;
  const heightBefore = state.heightCm;
  const res = settleDay(state, today, events, meta, nowMs);
  const next = addDays(today, 1);
  state.virtualToday = next;
  state.lastSeenDate = next;
  state.care = freshCare(next);
  let eventText: string | null = null;
  let animals: string[] = [];
  if (!state.over) {
    eventText = ensureToday(state, next);
    animals = refreshUnlocks(state, { date: next, events: res.settlement.events });
    state.morningNote = `${nightNote(res.settlement)} ${res.messages.join(' ')}`.trim();
  }
  return {
    daysPassed: 1,
    growthCm: state.heightCm - heightBefore,
    healthBefore,
    healthAfter: state.health,
    messages: res.messages,
    eventText,
    animals,
    settlements: [res.settlement],
    over: Boolean(state.over),
  };
}

/* ---------- Helpers for the UI ---------- */

export function advice(state: GameState, todayEvent: WeatherEventId, countdown: { event: WeatherEventId; hours: number } | null): string {
  if (state.dying) return `瀕死！將水分調到 ${W_OPTIMAL[0]}–${W_OPTIMAL[1]}、養分 ${N_OPTIMAL[0]} 以上就即刻救得返。`;
  if (state.pest.active) return '生咗蟲，每晚扣 15 健康度，快啲除蟲。';
  if (countdown && WEATHER_EVENTS[countdown.event].dR < 0 && state.resist < 60) return `${WEATHER_EVENTS[countdown.event].label}就嚟，先加固推高抗風力（而家 ${Math.round(state.resist)}）。`;
  if (countdown && (countdown.event === 'rainstorm' || countdown.event === 'blackrain') && state.moisture > 30) return `${WEATHER_EVENTS[countdown.event].label}會令水分 +60，可以先疏水。`;
  if (todayEvent === 'hot' && state.moisture < 90) return '酷熱：今晚水分會跌 40，可以澆多幾次。';
  if (todayEvent === 'drizzle' && state.moisture >= 40) return '今日落雨，水分會 +20，唔使澆。';
  const endW = state.moisture + WEATHER_EVENTS[todayEvent].dW;
  if (endW < W_OPTIMAL[0]) return `今晚結算前水分會跌到約 ${Math.round(endW)}，記得澆水。`;
  if (endW > W_OPTIMAL[1]) return `今晚水分會去到約 ${Math.round(endW)}，太濕，可以疏水。`;
  if (state.nutrients - N_DAILY_USE < N_OPTIMAL[0]) return '養分今晚會跌到 60 以下，可以施肥。';
  if (state.resist < 30) return '有空可以加固，抗風力擋到惡劣天氣嘅傷害。';
  return '水分同養分都啱啱好，今晚會健康咁長高。';
}

export function dayNumber(state: GameState, today: string): number {
  return Math.max(1, daysBetween(state.createdOn, today) + 1);
}

export function eventTitle(state: GameState): { title: string; text: string } {
  const event = eventById(state.dailyEventId);
  return { title: event.title, text: event.text };
}
