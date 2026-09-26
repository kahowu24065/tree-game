import './style.css';
import { EVENT_ORDER, PREPS, WEATHER_EVENTS, type PrepId, type WeatherEventId } from './balance';
import { addDays, clockMinutes, daysBetween, formatDateInTz, isoMinutes } from './dates';
import { condForEvent, currentEvents, severeCountdown, type Countdown } from './events';
import { DEV_PANEL } from './flags';
import { ICONS } from './icons';
import { esc } from './util';
import { bookGameEnd, bookMilestones, loadMeta, newGame, saveMeta } from './meta';
import { Scene, daylightFactor, type SceneInput } from './render';
import { pickEvent } from './rules';
import { mulchLaid } from './campfire';
import { eventLabel, regionFor, setLabelRegion } from './labels';
import { Scene3D, type Quality } from './three/scene3d';
import type { EcoCaps } from './three/animals3d';
import { mountAnimalHud, type AnimalHud } from './animalHud';
import { FEATURE_LABEL, habitatDef, habitatFeatures, islandRadius } from './data/habitat';
import {
  advanceVirtualDay,
  applyWarningWater,
  brokenTop,
  catchUp,
  DYING_MS,
  fallenLogDay,
  resolveDyingExpiry,
  checkWaterDeath,
  previewNight,
  checkRescue,
  createGame,
  eventsForDate,
  performAction,
  performEmergency,
  checkWindUnlock,
  recordEvents,
  refreshUnlocks,
  reinforce,
  setLogClock,
  triggerPest,
  visualReinforcement,
  type CareAction,
  type CatchupReport,
} from './sim';
import { clearGame, loadGame, loadWeatherCache, saveGame, saveWeatherCache } from './storage';
import type { DayCond, GameState, TabId } from './types';
import {
  PLACES,
  animalName,
  closeModal,
  locationModal,
  openModal,
  overModal,
  milestoneModal,
  renderChrome,
  renderPanel,
  renderSheet,
  setThumbnailer,
  settingsModal,
  startModal,
  stormModal,
  windExplainerModal,
  toast,
  flashWater,
  togglePreview,
  updateModal,
  setAlbumMode,
  setUiClock,
  type Pick,
  type View,
} from './ui';
import { ANIMALS } from './data/animals';
import { defaultSpecies, speciesTargetCm, stageIndexFor, stageSampleCm, STAGE_NAMES, type SpeciesId } from './data/species';
import {
  WEATHER_STALE_MS,
  WEATHER_TTL_MS,
  condFromForecast,
  districtRain,
  fetchForecast,
  hkoForecast,
  withHkoDays,
  stampDays,
  inHongKong,
  nearHongKong,
  isRainCode,
  isSnowCode,
  locate,
  mildDay,
  offlineSnapshot,
  presentForecast,
  type ForecastResult,
  type WeatherProvider,
  type WeatherSnapshot,
} from './weather';
import { fetchHko, hkoIconLabel, hkoIconRain, hkoIconToWmo } from './hko';
import { reverseGeocode } from './place';
import { defaultDev, loadDev, saveDev, type DevSettings } from './dev/settings';

const PLACE_KEY = 'yiri-yisyu-place';
const QUALITY_KEY = 'yiri-yisyu-quality';

let timezone = 'Asia/Hong_Kong';
setLogClock(() => {
  const m = clockMinutes(timezone);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});
let meta = loadMeta();
let state: GameState = loadGame() ?? createGame(formatDateInTz(new Date(), timezone));
let dev: DevSettings = DEV_PANEL ? loadDev() : defaultDev();
let tab: TabId = 'care';
let placeChoice = localStorage.getItem(PLACE_KEY) ?? '';
let weather: WeatherSnapshot = initialWeather();
let weatherLoading = weather.provider === 'sim';
setLabelRegion(regionFor(weather.source, nearHongKong(weather.lat, weather.lon)));
let statusLine = weather.origin === 'live' ? '天氣啱啱更新過' : '攞緊真實天氣…';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pendingNote = '';
let pick: Pick = { species: defaultSpecies() };
let quality: Quality = localStorage.getItem(QUALITY_KEY) === 'high' ? 'high' : 'low';

const canvas = document.getElementById('scene');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('找不到畫面');
let scene3d: Scene3D | null = null;
let scene2d: Scene | null = null;
try {
  scene3d = new Scene3D(canvas, quality);
  setThumbnailer(
    (id, unlocked) => scene3d?.thumbnail(id, unlocked) ?? null,
    (species, stage, cm) => scene3d?.speciesThumb(species, stage, cm) ?? null,
  );
} catch (error) {
  scene3d = null;
  console.warn('WebGL 用唔到，改用簡化畫面', error);
  scene2d = new Scene(canvas);
  document.body.classList.add('flat');
}
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const sheet = document.getElementById('sheet');
const sheetHandle = document.getElementById('sheet-handle');

/** Cached weather: fresh (<30 min, same location choice) counts as live; older real data is shown as cached. */
function initialWeather(): WeatherSnapshot {
  const cached = loadWeatherCache();
  const choice = placeChoice && placeChoice !== 'geo' ? placeChoice : 'auto';
  if (cached && cached.provider !== 'sim' && (cached.choice ?? 'auto') === choice) {
    const age = Date.now() - cached.fetchedAt;
    if (age < WEATHER_TTL_MS) return { ...cached, origin: 'live' };
    if (age < WEATHER_STALE_MS) return { ...cached, origin: 'cache' };
  }
  return offlineSnapshot(formatDateInTz(new Date(), 'Asia/Hong_Kong'), '');
}

function realToday(): string {
  return formatDateInTz(new Date(), timezone);
}

function today(): string {
  const real = realToday();
  if (state.virtualToday && daysBetween(real, state.virtualToday) > 0) return state.virtualToday;
  return real;
}

const DAY_MS = 24 * 3600 * 1000;

/**
 * v16 game clock: the wall clock, moved ahead by the developer's virtual days — so a day skip also moves the 瀕死
 * countdown and a tree can die during skips.
 */
function virtualNow(): number {
  return Date.now() + Math.max(0, daysBetween(realToday(), today())) * DAY_MS;
}
setUiClock(virtualNow);

/** How far into today (local clock) it is, for settling each missed night at the end of its own day. */
function msIntoToday(): number {
  return clockMinutes(timezone) * 60000 + (Date.now() % 60000);
}

function reconcileClock(): void {
  const real = realToday();
  if (state.virtualToday && daysBetween(real, state.virtualToday) <= 0) state.virtualToday = null;
}

const manual = () => DEV_PANEL && dev.mode === 'manual';

function presentedDays() {
  return presentForecast(weather.daily, today());
}

function hkActive(snapshot: WeatherSnapshot = weather): boolean {
  return Boolean(snapshot.hko) && usesHko(snapshot);
}

/** Events happening right now according to live weather (HKO warnings in HK). */
function liveEvents(): WeatherEventId[] {
  if (weather.provider === 'sim' && !weather.hko) return [];
  const day = weather.daily.find((d) => d.date === today());
  return currentEvents({ hk: usesHko(weather), warnings: weather.hko?.warnings, current: weather.current, today: day });
}

/** Events the day is settled with (manual developer weather wins). */
function eventsFor(date: string): WeatherEventId[] {
  if (manual()) return dev.events.length ? [...dev.events] : ['clear'];
  return eventsForDate(state, date, weather.daily.find((d) => d.date === date));
}

function todayEvents(): WeatherEventId[] {
  return eventsFor(today());
}

function todayCond(): DayCond {
  const t = today();
  const day = presentedDays().find((d) => d.date === t) ?? mildDay(t);
  if (manual()) return withCold(condForEvent(condFromForecast(mildDay(t), 28), pickEvent(todayEvents())), todayEvents(), true);
  const useLive = weather.origin !== 'offline';
  const temp = useLive ? weather.current.tempC : (day.tempMax + day.tempMin) / 2;
  const cond = condFromForecast(day, temp);
  if (useLive) {
    cond.code = weather.current.code || cond.code;
    cond.windKmh = weather.current.windKmh;
    cond.gustKmh = weather.current.gustKmh;
    cond.tempC = weather.current.tempC;
    cond.precipMm = weather.current.precipMm;
    cond.raining = cond.precipMm >= 0.2 || isRainCode(cond.code) || isSnowCode(cond.code);
    cond.hot = false;
    cond.stormKind = null;
  }
  // Severe events drive the scene only while in force right now.
  const live = liveEvents();
  const now = pickEvent(live);
  return withCold(now === 'clear' ? cond : condForEvent(cond, now), live, false);
}

/**
 * v15: 寒冷 stacks with the headline event, so the scene gets its frosty tint either way. Manual (developer) weather
 * also gets a cold temperature; real weather keeps the measured one.
 */
function withCold(cond: DayCond, events: readonly WeatherEventId[], fake: boolean): DayCond {
  if (!events.includes('cold')) return cond;
  const c = condForEvent(cond, 'cold');
  if (fake) {
    c.tempC = Math.min(c.tempC, 6);
    c.tempMax = Math.min(c.tempMax, 10);
  }
  return c;
}

function localNowIso(): string {
  const m = clockMinutes(timezone);
  return `${realToday()}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function countdown(): Countdown | null {
  const t = today();
  return severeCountdown({
    nowEvents: manual() ? dev.events : liveEvents(),
    hourly: manual() ? [] : weather.hourly,
    nowIso: localNowIso(),
    tomorrow: manual() ? undefined : weather.daily.find((d) => d.date === addDays(t, 1)),
    minutesToMidnight: 24 * 60 - clockMinutes(timezone),
    manual: manual() ? dev.forecast : null,
    nowMs: Date.now(),
    activeSource: manual() ? '手動天氣' : hkActive() ? '天文台' : '即時天氣',
  });
}

function choiceKey(): string {
  return placeChoice && placeChoice !== 'geo' ? placeChoice : 'auto';
}

function placeLabel(): { place: string; note: string } {
  const m = PLACES.find((p) => p.id === placeChoice);
  if (m) return { place: m.name, note: '' };
  if (weather.provider === 'sim' && !weather.fetchedAt) return { place: '香港', note: '' };
  return { place: weather.place || '你嘅位置', note: weather.source === 'fallback' ? '預設' : '' };
}

/** How hard the tree sways (0 calm … 1 typhoon), from the weather in force now; the dev panel can force it. */
const EVENT_SWAY: Record<WeatherEventId, number> = { clear: 0.08, drizzle: 0.18, hot: 0.04, cold: 0.1, rainstorm: 0.55, blackrain: 0.65, typhoon1: 0.72, thunder: 0.85, typhoon8: 1 };
function swayLevel(cond: DayCond): number {
  if (DEV_PANEL && dev.sway !== null) return dev.sway;
  const events = manual() ? todayEvents() : liveEvents();
  const byEvent = Math.max(0.06, ...events.map((e) => EVENT_SWAY[e] ?? 0.1));
  const byWind = manual() ? 0 : Math.min(1, ((cond.windKmh ?? 0) + 0.5 * (cond.gustKmh ?? 0)) / 120);
  return Math.min(1, Math.max(byEvent, byWind));
}

function sceneInput(): SceneInput {
  const cond = todayCond();
  const day = presentedDays().find((d) => d.date === today()) ?? mildDay(today());
  const sunrise = isoMinutes(day.sunrise) ?? 370;
  const sunset = isoMinutes(day.sunset) ?? 1105;
  const minute = clockMinutes(timezone);
  const timeMode = DEV_PANEL ? dev.time : 'auto';
  // Residents always stay; up to three recent visitors drop by.
  const visitors = state.animals.filter((id) => !state.residents.includes(id)).slice(-3);
  const target = speciesTargetCm(state.species);
  const preview = DEV_PANEL ? dev.preview : {};
  const species: SpeciesId = preview.species ?? state.species;
  const previewSeason = preview.species ? speciesTargetCm(preview.species) : target;
  const stage = preview.stage ?? stageIndexFor(state.heightCm, previewSeason);
  const islandStage = preview.island;
  const heightCm = preview.stage !== undefined || preview.species ? (preview.stage !== undefined ? stageSampleCm(stage, previewSeason) : state.heightCm) : state.heightCm;
  return {
    treeName: state.treeName,
    species,
    stage,
    islandStage,
    targetCm: previewSeason,
    heightCm,
    unlocked: [...state.animals],
    residents: [...state.residents],
    sway: swayLevel(cond),
    health: state.over?.kind === 'dead' ? 0 : Math.max(state.health, state.dying ? 0 : 8),
    moisture: state.moisture,
    pests: state.pest.active ? 70 : 0,
    scars: state.scars,
    animals: [...state.residents, ...visitors],
    cond,
    daylight: daylightFactor(minute, sunrise, sunset, timeMode),
    minute: timeMode === 'day' ? sunrise + 180 : timeMode === 'night' ? 23 * 60 : minute,
    sunriseMin: sunrise,
    sunsetMin: sunset,
    eventId: state.dailyEventId,
    reducedMotion,
    reinforce: visualReinforcement(state.resist, state.windUnlocked),
    thriving: state.health >= 80 && !state.over,
    landmark: Boolean(meta.landmark) && state.legacyBonus > 0,
    starry: meta.starry,
    mulch: mulchLaid(state, today()),
    brokenTop: brokenTop(state),
    fallenLog: fallenLogDay(state, today()),
    collapseKey: state.lastCollapse ? `${state.lastCollapse.date}|${state.lastCollapse.heightBefore}` : '',
    dying: Boolean(state.dying) && !state.over,
    dead: state.over?.kind === 'dead',
    deathPending: state.over?.kind === 'dead' && state.over.fallSeen === false,
  };
}

function view(input: SceneInput): View {
  const { place, note } = placeLabel();
  const hk = hkActive();
  return {
    state,
    meta,
    today: today(),
    tab,
    place,
    placeNote: note,
    statusLine,
    cond: input.cond,
    forecast: presentedDays(),
    night: input.daylight < 0.45,
    todayEvents: todayEvents(),
    todayEvent: pickEvent(todayEvents()),
    preview: previewNight(state, today(), todayEvents(), meta),
    countdown: countdown(),
    manual: manual(),
    minutesToSettle: 24 * 60 - clockMinutes(timezone),
    wx: {
      provider: weather.provider ?? (weather.origin === 'offline' ? 'sim' : 'open-meteo'),
      origin: weather.origin,
      loading: weatherLoading,
      fetchedAt: weather.fetchedAt,
      updated: clockOf(weather.fetchedAt),
      hkoUsed: hk,
      warnings: hk ? weather.hko!.warnings : [],
      messages: hk ? weather.hko!.messages : [],
      situation: hk ? weather.hko!.situation : '',
      hkoDays: hk ? Object.fromEntries(weather.hko!.forecast.map((d) => [d.date, d.text])) : {},
      conditionText: manual() ? undefined : weather.conditionText,
      nowIcon: !manual() && hk ? weather.hko!.current?.icon || undefined : undefined,
      station: weather.station,
      rainInHours: weather.rainInHours ?? null,
      error: weather.error,
      overridden: manual(),
    },
  };
}

function render(): void {
  const input = sceneInput();
  const v = view(input);
  renderChrome(v);
  renderSheet(state, today());
  if (drawer && !drawer.hidden) renderPanel(v);
  drawScene(input, performance.now());
  devRender?.();
}

function drawScene(input: SceneInput, time: number): void {
  if (scene3d) scene3d.draw(input, time);
  else scene2d?.draw(input, time);
}

function persist(): void {
  saveGame(state);
  saveMeta(meta);
}

/**
 * v14: new milestones (tonight's, or the save migration's retro ones) go into the collection once and get a
 * celebratory card. When the tree dies: book the landmark once, then show the result.
 */
function handleOver(): boolean {
  if (!state.over) {
    const awards = Object.values(state.milestones ?? {}).filter((m) => m && !m.booked);
    if (!awards.length || !state.started) return false;
    const lines = bookMilestones(meta, state);
    persist();
    openModal(milestoneModal(state, meta, awards, lines));
    return true;
  }
  const lines = [...bookMilestones(meta, state), ...bookGameEnd(meta, state)];
  persist();
  if (!state.started) return true;
  const open = () => {
    if (state.over) openModal(overModal(state, meta, lines));
  };
  // v16: the first time a death is seen it plays (leaves drop, the tree falls; or the fatal third collapse) and the
  // result card follows ~2.5 s later. Afterwards the tree just lies there as the fallen log.
  if (state.over.fallSeen === false) {
    state.over.fallSeen = true;
    const lc = state.lastCollapse;
    const fatal = lc && lc.fatal && !lc.seen ? lc : null;
    if (lc) lc.seen = true;
    persist();
    closeModal();
    if (!playFall(fatal, open)) open();
  } else open();
  return true;
}

/** v16: death (or fatal collapse) animation; `done` runs when the result card may open. False = nothing played. */
function playFall(fatal: GameState['lastCollapse'], done: () => void): boolean {
  if (scene3d) {
    const ok = fatal
      ? scene3d.playCollapse({ heightBefore: fatal.heightBefore, stageBefore: stageOf(fatal.heightBefore), healthBefore: healthBeforeOn(fatal.date), fatal: true, reduced: reducedMotion }, done)
      : scene3d.playDeath(reducedMotion, done);
    return ok;
  }
  scene2d?.playFall(reducedMotion);
  window.setTimeout(done, reducedMotion ? 600 : 1800);
  return true;
}

function stageOf(cm: number): number {
  return stageIndexFor(cm, speciesTargetCm(state.species));
}

function healthBeforeOn(date: string): number {
  const s = state.lastSettlement;
  return s && s.date === date ? s.hBefore : Math.max(30, state.health);
}

/**
 * v16: a collapse not seen yet plays once (the latest, if several nights were caught up — the rest get a line);
 * `after` runs when it is over (the morning card / modals wait for it). Returns false when none is pending.
 */
function playPendingCollapse(report: CatchupReport | null, after: () => void): boolean {
  const lc = state.lastCollapse;
  if (!lc || lc.seen || lc.fatal || state.over || !state.started) return false;
  lc.seen = true;
  persist();
  const count = report ? report.settlements.filter((s) => s.collapse).length : 1;
  if (count > 1) toast(`你唔喺度嗰陣棵樹倒塌咗 ${count} 次，而家重播最近一次。`);
  const healthBefore = report?.settlements.find((s) => s.date === lc.date)?.hBefore ?? healthBeforeOn(lc.date);
  if (scene3d) {
    return scene3d.playCollapse({ heightBefore: lc.heightBefore, stageBefore: stageOf(lc.heightBefore), healthBefore, fatal: false, reduced: reducedMotion }, after);
  }
  scene2d?.playCollapse(reducedMotion);
  window.setTimeout(after, reducedMotion ? 500 : 1400);
  return true;
}

/** v13: the 青年樹 explainer, once, when no other modal is up. */
function maybeExplainWind(): boolean {
  if (!state.started || state.over || !state.windUnlocked || state.windExplained) return false;
  if (!document.getElementById('modal')?.hidden) return false;
  openModal(windExplainerModal(state), 'explainer-card');
  return true;
}

function showReport(report: CatchupReport): void {
  persist();
  render();
  if (state.over) {
    handleOver();
    return;
  }
  const rest = () => {
    if (handleOver()) return;
    if (report.messages.length) {
      const message = report.messages.join(' ');
      if (!state.started) pendingNote = message;
      else openModal(stormModal(message));
    }
    maybeExplainWind();
    const names = report.animals.map(animalName);
    if (names.length) toast(`${names.join('、')}嚟咗。`);
  };
  // v16: a fresh collapse plays first; the night's card and any other modal wait until it is over.
  if (!playPendingCollapse(report, rest)) rest();
}

function runCatchup(): void {
  reconcileClock();
  const report = catchUp(state, today(), eventsFor, meta, virtualNow(), msIntoToday());
  showReport(report);
  syncWarningWater();
  checkDyingExpiry();
}

/** v16: 瀕死 ends the moment its 24 hours are up (not at the next nightly settlement). */
function checkDyingExpiry(): void {
  if (!state.dying || state.over || virtualNow() - state.dying.at < DYING_MS) return;
  const res = resolveDyingExpiry(state, today(), meta, virtualNow(), clockOf(Date.now()));
  if (!res) return;
  persist();
  render();
  if (res === 'revived') toast('免死金牌救返棵樹！');
  if (state.over) handleOver();
}

/**
 * v12: apply today's 酷熱／暴雨／黑雨 water the moment they are seen (HKO warning on refresh, reopening the app, or
 * developer manual weather). Each applies once per day (flags in the save); returns true when something changed.
 */
function syncWarningWater(): boolean {
  if (!state.started || state.over) return false;
  // Real weather: only what was actually seen today (HKO warnings / live detection), not forecast guesses — those
  // still count at the nightly settlement (and already show in 今晚預計). Manual developer weather counts at once.
  const seen = manual() ? todayEvents() : (state.dayEvents[today()]?.events ?? []);
  const hits = applyWarningWater(state, today(), seen, meta, virtualNow());
  if (!hits.length) return false;
  const last = hits[hits.length - 1]!;
  flashWater(last.delta >= 0 ? 'up' : 'down');
  persist();
  render();
  toast(hits.map((h) => h.message).join(' '));
  return true;
}

function applyWeather(snapshot: WeatherSnapshot): void {
  const before = today();
  weather = snapshot;
  setLabelRegion(usesHko(snapshot) ? 'hk' : 'intl');
  timezone = snapshot.timezone || timezone;
  if (snapshot.origin === 'live') saveWeatherCache(snapshot);
  statusLine =
    snapshot.origin === 'live'
      ? `天氣 ${clockOf(snapshot.fetchedAt)} 更新`
      : snapshot.origin === 'cache'
        ? `更新唔到（${snapshot.error ?? '網絡問題'}），用緊 ${clockOf(snapshot.fetchedAt)} 的記錄。`
        : `而家攞唔到真實天氣，暫時用模擬天氣。${snapshot.error ?? ''}`;
  reconcileClock();
  if (snapshot.provider !== 'sim' || snapshot.hko) {
    const events = liveEvents();
    const had = state.dayEvents[today()]?.events ?? [];
    recordEvents(state, today(), events, hkActive(snapshot));
    const fresh = events.filter((e) => WEATHER_EVENTS[e].severe && !had.includes(e));
    const watered = today() === before && syncWarningWater();
    if (fresh.length && state.started && !manual() && !watered) toast(`${hkActive(snapshot) ? '天文台' : '天氣'}：${fresh.map((e) => eventLabel(e)).join('、')}生效，今晚結算前仲可以準備。`);
  }
  if (state.started && !state.over) {
    const got = refreshUnlocks(state, { date: today(), events: todayEvents() });
    if (got.length) toast(`${got.map(animalName).join('、')}嚟咗。`);
  }
  if (today() !== before) {
    const report = catchUp(state, today(), eventsFor, meta, virtualNow(), msIntoToday());
    showReport(report);
    syncWarningWater();
    return;
  }
  persist();
  render();
}

function clockOf(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const sameDay = formatDateInTz(d, timezone) === realToday();
  const hm = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  if (sameDay) return hm;
  const [, m, day] = formatDateInTz(d, timezone).split('-');
  return `${Number(m)}/${Number(day)} ${hm}`;
}

function usesHko(snapshot: WeatherSnapshot): boolean {
  return regionFor(snapshot.source, nearHongKong(snapshot.lat, snapshot.lon)) === 'hk';
}

let refreshing: Promise<void> | null = null;
let refreshTimer = 0;

function scheduleRefresh(ms: number): void {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (document.hidden) return;
    void refreshWeather();
  }, ms);
}

function refreshWeather(forceLocate = false): Promise<void> {
  if (refreshing) return refreshing;
  weatherLoading = true;
  statusLine = '攞緊真實天氣…';
  render();
  refreshing = loadWeather(forceLocate).finally(() => {
    refreshing = null;
    weatherLoading = false;
    render();
    scheduleRefresh(weather.origin === 'live' ? WEATHER_TTL_MS : 2 * 60 * 1000);
  });
  return refreshing;
}

/**
 * Real weather first: Open-Meteo for the player's spot (plus HKO in/near Hong Kong); if Open-Meteo is down,
 * HKO alone; then the last good snapshot; simulated weather only when all of that fails.
 */
async function loadWeather(forceLocate: boolean): Promise<void> {
  const manual = PLACES.find((p) => p.id === placeChoice);
  const reuseGeo = !forceLocate && weather.source === 'geo' && weather.choice === 'auto' && Date.now() - weather.fetchedAt < WEATHER_TTL_MS;
  const loc = manual
    ? { lat: manual.lat, lon: manual.lon, source: 'manual' as const }
    : reuseGeo
      ? { lat: weather.lat, lon: weather.lon, source: 'geo' as const }
      : await locate(8000);
  const hk = loc.source !== 'geo' || nearHongKong(loc.lat, loc.lon);
  const [om, hkoRes, placeRes] = await Promise.allSettled([
    fetchForecast(loc.lat, loc.lon),
    hk ? fetchHko(loc.lat, loc.lon) : Promise.resolve(null),
    loc.source === 'geo' ? reverseGeocode(loc.lat, loc.lon) : Promise.resolve(null),
  ]);
  const hko = hkoRes.status === 'fulfilled' ? hkoRes.value : null;
  const found = placeRes.status === 'fulfilled' ? placeRes.value : null;
  const place = manual?.name ?? found?.name ?? (loc.source === 'fallback' || inHongKong(loc.lat, loc.lon) ? '香港' : '你嘅位置');
  const district = manual?.name ?? found?.district;
  let base: ForecastResult | null = om.status === 'fulfilled' ? om.value : null;
  let provider: WeatherProvider = 'open-meteo';
  const error = om.status === 'rejected' ? (om.reason instanceof Error ? om.reason.message : '未知錯誤') : undefined;
  if (!base && hko) {
    base = hkoForecast(hko, today());
    provider = 'hko';
  }
  if (!base) {
    const cached = loadWeatherCache();
    if (cached && cached.provider !== 'sim' && Date.now() - cached.fetchedAt < WEATHER_STALE_MS) {
      applyWeather({ ...cached, origin: 'cache', error, hko: hko ?? cached.hko, daily: hko && hk ? withHkoDays(cached.daily, hko, today()) : cached.daily });
      return;
    }
    // Last resort: simulated numbers, but still pass along any real HKO warnings.
    applyWeather({ ...offlineSnapshot(today(), error ?? ''), hko, choice: choiceKey() });
    return;
  }
  const snapshot: WeatherSnapshot = {
    lat: loc.lat,
    lon: loc.lon,
    timezone: base.timezone,
    place,
    source: loc.source,
    origin: 'live',
    fetchedAt: Date.now(),
    current: { ...base.current },
    daily: stampDays(base.daily, !hk, base.normals),
    normals: base.normals ?? null,
    provider,
    hko,
    district,
    rainInHours: base.rainInHours,
    choice: choiceKey(),
    error: provider === 'hko' ? error : undefined,
  };
  if (hko?.current && hk) {
    // Prefer what the Observatory actually measured nearby over model values.
    if (hko.current.tempC !== null) {
      snapshot.current.tempC = hko.current.tempC;
      snapshot.station = hko.current.station;
    }
    if (hko.current.icon) {
      snapshot.current.code = hkoIconToWmo(hko.current.icon);
      snapshot.conditionText = hkoIconLabel(hko.current.icon);
    }
    if (hko.current.humidity !== null) snapshot.current.humidity = hko.current.humidity;
    const mm = districtRain(hko, district);
    if (mm !== null) {
      // Measured rain in the player's district beats the model's "current precipitation".
      snapshot.current.precipMm = Math.min(8, mm);
    } else if (hko.current.icon && !hkoIconRain(hko.current.icon)) {
      snapshot.current.precipMm = 0;
    }
  }
  if (hko && hk) snapshot.daily = withHkoDays(snapshot.daily, hko, today());
  applyWeather(snapshot);
}

function openStart(): void {
  openModal(startModal('世界之樹', meta, false, pick));
}

function startGame(species?: SpeciesId): void {
  const input = document.getElementById('tree-name');
  const name = (input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '') || '世界之樹';
  const wasStarted = state.started && !state.over;
  if (wasStarted) {
    state.treeName = name;
  } else {
    state = newGame(meta, realToday(), name, species);
    tab = 'care';
  }
  persist();
  closeModal();
  render();
  if (!wasStarted) toast(`${state.treeName}種好喇。今日先澆水、施肥。`);
  syncWarningWater();
  if (pendingNote) {
    const message = pendingNote;
    pendingNote = '';
    openModal(stormModal(message));
  }
}

/* ---------- Drawer and growth-log sheet ---------- */

function openDrawer(next: TabId): void {
  if (!drawer || !drawerBackdrop) return;
  tab = next;
  setSheet(false);
  drawer.hidden = false;
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  });
  render();
}

function closeDrawer(): void {
  if (!drawer || !drawerBackdrop || drawer.hidden) return;
  drawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
  window.setTimeout(() => {
    if (!drawer.classList.contains('open')) {
      drawer.hidden = true;
      drawerBackdrop.hidden = true;
    }
  }, 260);
}

function setSheet(open: boolean): void {
  if (!sheet) return;
  sheet.dataset.state = open ? 'open' : 'closed';
  sheet.style.transform = '';
  sheetHandle?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('sheet-open', open);
  if (open) renderSheet(state, today());
}

function bindSheetDrag(): void {
  if (!sheet || !sheetHandle) return;
  let start: { y: number; t: number; open: boolean; closedOffset: number } | null = null;
  let moved = false;
  const closedOffset = () => sheet.offsetHeight - sheetHandle.offsetHeight;
  sheetHandle.addEventListener('pointerdown', (e) => {
    start = { y: e.clientY, t: performance.now(), open: sheet.dataset.state === 'open', closedOffset: closedOffset() };
    moved = false;
    sheetHandle.setPointerCapture(e.pointerId);
    sheet.classList.add('dragging');
  });
  sheetHandle.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) > 6) moved = true;
    const base = start.open ? 0 : start.closedOffset;
    const y = Math.max(0, Math.min(start.closedOffset, base + dy));
    sheet.style.transform = `translateY(${y}px)`;
  });
  const end = (e: PointerEvent) => {
    if (!start) return;
    sheet.classList.remove('dragging');
    const dy = e.clientY - start.y;
    const v = dy / Math.max(1, performance.now() - start.t);
    const wasOpen = start.open;
    start = null;
    if (!moved) {
      setSheet(!wasOpen);
      return;
    }
    if (v < -0.4 || (!wasOpen && dy < -60)) setSheet(true);
    else if (v > 0.4 || (wasOpen && dy > 60)) setSheet(false);
    else setSheet(wasOpen);
  };
  sheetHandle.addEventListener('pointerup', end);
  sheetHandle.addEventListener('pointercancel', end);
  sheetHandle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSheet(sheet.dataset.state !== 'open');
    }
  });
  // Swipe down on the list when it is scrolled to the top closes the sheet.
  const bodyEl = document.getElementById('sheet-body');
  let touchY: number | null = null;
  bodyEl?.addEventListener('touchstart', (e) => {
    touchY = bodyEl.scrollTop <= 0 ? (e.touches[0]?.clientY ?? null) : null;
  }, { passive: true });
  bodyEl?.addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const dy = (e.touches[0]?.clientY ?? touchY) - touchY;
    if (dy > 70) {
      touchY = null;
      setSheet(false);
    }
  }, { passive: true });
}

/* ---------- Actions (document-level delegation) ---------- */

function doAction(action: string, target: HTMLElement): void {
  if (action === 'water' || action === 'fertilize' || action === 'deworm' || action === 'drain') {
    const result = performAction(state, action as CareAction, { raining: todayCond().raining });
    persist();
    render();
    toast(result.message);
    if (result.ok) target.classList.add('pop');
    if (result.ok && (action === 'water' || action === 'fertilize')) scene3d?.playCare(action);
    return;
  }
  if (action === 'heat-water' || action === 'rain-drain' || action === 'warm-cover') {
    const result = performEmergency(state, action === 'heat-water' ? 'heatWater' : action === 'warm-cover' ? 'warmCover' : 'rainDrain', todayEvents());
    if (result.ok && action !== 'warm-cover') flashWater(action === 'heat-water' ? 'up' : 'down');
    if (result.ok && action === 'warm-cover') target.classList.add('pop');
    if (result.ok && action === 'heat-water') scene3d?.playCare('water');
    persist();
    render();
    toast(result.message);
    return;
  }
  switch (action) {
    case 'preview':
      togglePreview();
      render();
      return;
    case 'dismiss-note':
      state.morningNote = null;
      persist();
      render();
      return;
    case 'retry-weather':
      toast('再試緊攞真實天氣…');
      void refreshWeather(false);
      return;
    case 'locate':
      placeChoice = 'geo';
      localStorage.setItem(PLACE_KEY, placeChoice);
      void refreshWeather(true);
      return;
    case 'rename':
      openModal(startModal(state.treeName, meta, true));
      return;
    case 'new-game':
      openStart();
      return;
    case 'reset-view':
      scene3d?.resetView();
      return;
    case 'location':
      openModal(locationModal(placeChoice || (weather.source === 'geo' ? 'geo' : 'hk')));
      return;
    case 'settings':
      openModal(settingsModal(state.treeName, quality, Boolean(scene3d)));
      return;
    case 'close-drawer':
      closeDrawer();
      return;
    case 'close-sheet':
      setSheet(false);
      return;
    case 'save-name':
      startGame();
      return;
    case 'start-game':
      startGame(pick.species);
      return;
    case 'close-modal':
      closeModal();
      maybeExplainWind();
      return;
    case 'wind-explained':
      state.windExplained = true;
      persist();
      closeModal();
      render();
      return;
    case 'dismiss-double':
      state.doubleRSeen = true;
      persist();
      render();
      return;
  }
}

document.addEventListener('click', (event) => {
  const el = event.target instanceof Element ? event.target : null;
  if (!el) return;
  if (el.closest('#dev-root')) return;
  const target = el.closest<HTMLElement>('[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality], [data-species], [data-album-mode]');
  if (!target) return;
  const inModal = Boolean(target.closest('#modal'));
  if ((!state.started || state.over) && !inModal) return;
  if (target.dataset.species) {
    const nameEl = document.getElementById('tree-name');
    const name = nameEl instanceof HTMLInputElement ? nameEl.value : '世界之樹';
    pick = { species: target.dataset.species as SpeciesId };
    updateModal(startModal(name, meta, false, pick));
    return;
  }
  if (target.dataset.albumMode) {
    setAlbumMode(target.dataset.albumMode === 'species' ? 'species' : 'animals');
    render();
    return;
  }
  if (target.dataset.open) {
    openDrawer(target.dataset.open as TabId);
    return;
  }
  if (target.dataset.tab) {
    tab = target.dataset.tab as TabId;
    render();
    const panel = document.getElementById('panel');
    if (panel) panel.scrollTop = 0;
    return;
  }
  if (target.dataset.prep && target.dataset.prep in PREPS) {
    const res = reinforce(state, target.dataset.prep as PrepId);
    toast(res.message);
    persist();
    render();
    return;
  }
  if (target.dataset.seen) {
    const id = target.dataset.seen;
    if (state.animals.includes(id) && !state.seenAnimals.includes(id)) {
      state.seenAnimals.push(id);
      persist();
      render();
      animalHud?.refresh();
    }
    return;
  }
  if (target.dataset.place) {
    placeChoice = target.dataset.place;
    localStorage.setItem(PLACE_KEY, placeChoice);
    closeModal();
    const name = PLACES.find((p) => p.id === placeChoice)?.name ?? '你所在位置';
    toast(`天氣改為跟住${name}。`);
    void refreshWeather(placeChoice === 'geo');
    return;
  }
  if (target.dataset.quality === 'low' || target.dataset.quality === 'high') {
    quality = target.dataset.quality;
    localStorage.setItem(QUALITY_KEY, quality);
    scene3d?.setQuality(quality);
    openModal(settingsModal(state.treeName, quality, Boolean(scene3d)));
    return;
  }
  if (target.dataset.action) doAction(target.dataset.action, target);
});

document.getElementById('modal')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && document.activeElement === document.getElementById('tree-name') && state.started && !state.over) startGame();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!document.getElementById('modal')?.hidden) return;
  if (drawer && !drawer.hidden) closeDrawer();
  else if (sheet?.dataset.state === 'open') setSheet(false);
});

/* ---------- Developer panel (removed from the bundle when DEV_PANEL is false) ---------- */

let devRender: (() => void) | null = null;

export interface DevApi {
  state: () => GameState;
  dev: () => DevSettings;
  setDev: (next: DevSettings) => void;
  events: typeof EVENT_ORDER;
  liveEvents: () => WeatherEventId[];
  todayEvents: () => WeatherEventId[];
  countdown: () => Countdown | null;
  advanceDay: () => void;
  /** v14: settle `n` nights in a row (樹齡 / milestone testing). */
  advanceDays: (n: number) => void;
  setStat: (key: 'health' | 'moisture' | 'nutrients' | 'resist', value: number) => void;
  triggerPest: () => void;
  /** v13: 倒塌 count and the 青年樹 wind unlock. */
  setCollapses: (n: number) => void;
  /** v16: settle a 八號風球 night with R 0 (a real collapse; `fatal` = the third one), then play it. */
  triggerCollapse: (fatal: boolean) => void;
  /** v16: play the latest collapse again. */
  replayCollapse: () => void;
  /** v16: 瀕死 now (24-hour countdown starts). */
  triggerDying: () => void;
  /** v16: 瀕死 that has just run out → dies (or 免死金牌) with the death animation. */
  triggerDeath: () => void;
  setWindUnlocked: (on: boolean) => void;
  /** Grow the tree to the start of a stage (0-4); reaching 青年樹 unlocks wind the normal way. */
  setStageHeight: (stage: number) => void;
  reset: () => void;
  realDate: () => void;
  setPreview: (preview: DevSettings['preview']) => void;
  setSway: (level: number | null) => void;
  triggerGlare: () => void;
  spawnAnimal: (id: string) => void;
  rotateAnimals: () => void;
  unlockAll: () => void;
  ecoInfo: () => { id: string; name: string; count: number; resident: boolean }[];
  ecoCaps: () => EcoCaps | null;
  followAnimal: (id: string | null) => void;
  /** Camera / scale readout: zoom, camera distance (m), island scale, tree height (m), fence radius (m). */
  viewInfo: () => { zoom: number; distM: number; islandK: number; treeM: number; fenceRadius: number; islandRadius: number } | null;
  habitatInfo: () => string;
  sway: () => number;
}

if (DEV_PANEL) {
  const api: DevApi = {
    state: () => state,
    dev: () => dev,
    setDev: (next) => {
      dev = next;
      saveDev(dev);
      render();
      // Manual weather behaves like a warning just issued: its instant water effect applies now.
      if (manual()) syncWarningWater();
    },
    events: EVENT_ORDER,
    liveEvents,
    todayEvents,
    countdown,
    advanceDay: () => {
      if (state.over) return;
      const report = advanceVirtualDay(state, today(), eventsFor(today()), meta, virtualNow());
      showReport(report);
      syncWarningWater();
    },
    advanceDays: (n) => {
      if (state.over) return;
      const all: CatchupReport[] = [];
      for (let i = 0; i < n && !state.over; i++) all.push(advanceVirtualDay(state, today(), eventsFor(today()), meta, virtualNow()));
      const last = all[all.length - 1];
      if (!last) return;
      showReport({ ...last, daysPassed: all.length, messages: all.flatMap((r) => r.messages), animals: all.flatMap((r) => r.animals), settlements: all.flatMap((r) => r.settlements), milestones: all.flatMap((r) => r.milestones) });
      syncWarningWater();
    },
    setStat: (key, value) => {
      state[key] = Math.max(0, Math.min(key === 'moisture' ? 150 : 100, value));
      if (key === 'health' && value > 0) state.dying = null;
      if (key === 'moisture') checkWaterDeath(state, today(), virtualNow());
      checkRescue(state);
      persist();
      render();
    },
    triggerPest: () => {
      triggerPest(state, today());
      persist();
      render();
      toast('觸發咗蟲害。');
    },
    setCollapses: (n) => {
      state.collapses = Math.max(0, Math.min(3, Math.round(n)));
      persist();
      render();
    },
    triggerCollapse: (fatal) => {
      if (state.over) return;
      // A real night: 八號風球 with 抗風力 0 → 倒塌 through the normal settlement (fatal = this is the third).
      state.windUnlocked = true;
      state.windExplained = true;
      state.resist = 0;
      state.collapses = fatal ? 2 : Math.min(state.collapses || 0, 1);
      closeModal();
      const report = advanceVirtualDay(state, today(), ['typhoon8'], meta, virtualNow());
      showReport(report);
    },
    replayCollapse: () => {
      if (!state.lastCollapse || state.over) return;
      state.lastCollapse.seen = false;
      closeModal();
      playPendingCollapse(null, () => undefined);
    },
    triggerDying: () => {
      if (state.over) return;
      state.health = 0;
      state.dying = { since: today(), at: virtualNow() };
      persist();
      render();
    },
    triggerDeath: () => {
      if (state.over) return;
      // 瀕死 whose 24 hours ran out a moment ago: the timer path (免死金牌 still applies).
      state.health = 0;
      state.dying = { since: today(), at: virtualNow() - DYING_MS - 1000 };
      closeModal();
      checkDyingExpiry();
    },
    setWindUnlocked: (on) => {
      state.windUnlocked = on;
      state.windExplained = !on;
      persist();
      render();
      maybeExplainWind();
    },
    setStageHeight: (stage) => {
      state.heightCm = Math.max(state.heightCm, stageSampleCm(stage, speciesTargetCm(state.species)));
      checkWindUnlock(state, today(), clockOf(Date.now()));
      persist();
      render();
      maybeExplainWind();
    },
    reset: () => {
      clearGame();
      state = createGame(realToday());
      pendingNote = '';
      closeModal();
      closeDrawer();
      setSheet(false);
      persist();
      render();
      openStart();
    },
    realDate: () => {
      state.virtualToday = null;
      runCatchup();
    },
    setPreview: (preview) => {
      dev = { ...dev, preview };
      saveDev(dev);
      render();
    },
    setSway: (level) => {
      dev = { ...dev, sway: level };
      saveDev(dev);
      render();
    },
    triggerGlare: () => scene3d?.triggerGlare(),
    spawnAnimal: (id) => scene3d?.spawnAnimal(id),
    rotateAnimals: () => scene3d?.rotateAnimals(),
    unlockAll: () => {
      for (const a of ANIMALS) if (!state.animals.includes(a.id)) state.animals.push(a.id);
      persist();
      render();
      toast(`解鎖咗全部 ${ANIMALS.length} 種動物。`);
    },
    ecoInfo: () => (scene3d?.animalInfo() ?? []).map((g) => ({ id: g.id, name: animalName(g.id), count: g.count, resident: g.resident })),
    ecoCaps: () => scene3d?.animalCaps() ?? null,
    followAnimal: (id) => scene3d?.followAnimal(id),
    viewInfo: () => (scene3d ? { ...scene3d.cameraInfo(), ...scene3d.fenceInfo() } : null),
    habitatInfo: () => {
      const input = sceneInput();
      const island = input.islandStage ?? input.stage;
      const h = habitatDef(input.species);
      const feats = habitatFeatures(input.species, island).map((f) => FEATURE_LABEL[f]);
      return `島嶼：${STAGE_NAMES[island]}島（半徑 ${islandRadius(island)}）・${h.name}${feats.length ? `：${feats.join('、')}` : '：淨係庭園'}`;
    },
    sway: () => swayLevel(todayCond()),
  };
  (window as unknown as { __tree?: unknown }).__tree = {
    viewInfo: api.viewInfo,
    zoomBy: (f: number, x?: number, y?: number) => scene3d?.zoomBy(f, x, y),
    resetView: () => scene3d?.resetView(),
    viewState: () => scene3d?.viewState(),
    flyers: () => scene3d?.flyerHeights() ?? [],
    animalScreen: (id: string) => scene3d?.animalScreen(id) ?? null,
    fenceCheck: () => scene3d?.fenceCheck() ?? null,
    animalSizes: () => scene3d?.animalSizes() ?? null,
    walkers: () => scene3d?.walkerSpots() ?? [],
    lookAtRim: (a: number, share: number, zoom: number, az?: number) => scene3d?.lookAtRim(a, share, zoom, az),
    spawn: (id: string) => scene3d?.spawnAnimal(id),
    follow: (id: string | null) => scene3d?.followAnimal(id),
    lineup: (ids: string[], treeM: number) => scene3d?.lineup(ids, treeM) ?? null,
    markers: () => scene3d?.animalMarkers() ?? [],
    hud: () => animalHud?.debug() ?? null,
    crews: () => scene3d?.crewList() ?? [],
    followCrew: (uid: number) => scene3d?.followCrew(uid) ?? false,
    followingUid: () => scene3d?.followingUid() ?? null,
    hints: () => scene3d?.hintStats() ?? null,
    simStep: (dt: number, n: number) => scene3d?.simStep(dt, n),
    walkerDump: () => scene3d?.walkerDump() ?? [],
    navInfo: () => scene3d?.navInfo() ?? null,
    orbitBy: (daz: number, del?: number) => scene3d?.orbitBy(daz, del),
    followCam: () => scene3d?.followCamInfo() ?? null,
    propInfo: () => scene3d?.propInfo() ?? null,
    waterShare: () => scene3d?.waterShare() ?? null,
    seen: () => [...state.seenAnimals],
    rotate: () => scene3d?.rotateAnimals(),
    rotation: () => scene3d?.rotationInfo() ?? null,
    caps: () => scene3d?.animalCaps() ?? null,
    campfire: () => scene3d?.campfireInfo() ?? null,
    playCare: (kind: 'water' | 'fertilize') => scene3d?.playCare(kind),
    careFxSpeed: (k: number) => scene3d?.setCareFxSpeed(k),
    advanceDay: () => api.advanceDay(),
    // v16 collapse / death checks.
    collapse: (fatal = false) => api.triggerCollapse(fatal),
    replayCollapse: () => api.replayCollapse(),
    dying: () => api.triggerDying(),
    kill: () => api.triggerDeath(),
    setStat: (key: 'health' | 'moisture' | 'nutrients' | 'resist', v: number) => api.setStat(key, v),
    grow: (stage: number) => api.setStageHeight(stage),
    fx: () => scene3d?.fxInfo() ?? null,
    fxSpeed: (k: number) => scene3d?.setCareFxSpeed(k),
    game: () => ({ health: state.health, dying: state.dying, over: state.over, lastCollapse: state.lastCollapse, collapses: state.collapses, heightCm: state.heightCm, today: today() }),
  };
  void import('./dev/panel').then((m) => {
    const root = document.getElementById('dev-root');
    if (root) devRender = m.mountDevPanel(root, api);
    render();
  });
}

let lastChrome = 0;
let viewKey = '';
let hintShown = localStorage.getItem('sekai-tree-zoom-hint') === '1';
/** Show 「返回全景」 while the player is zoomed in or following an animal; a one-off zoom hint on first visit. */
function syncViewButton(): void {
  if (!scene3d) return;
  if (!hintShown && state.started && !state.over && document.getElementById('modal')?.hidden) {
    hintShown = true;
    localStorage.setItem('sekai-tree-zoom-hint', '1');
    const hint = document.getElementById('zoom-hint');
    if (hint) {
      hint.hidden = false;
      window.setTimeout(() => (hint.hidden = true), 9000);
    }
  }
  const v = scene3d.viewState();
  const key = `${v.active}|${v.following ?? ''}`;
  if (key === viewKey) return;
  viewKey = key;
  const btn = document.getElementById('view-reset');
  if (btn) {
    btn.hidden = !v.active;
    btn.innerHTML = `${ICONS.locate}<span>${v.following ? `跟緊${esc(v.following)}・返回全景` : '返回全景'}</span>`;
  }
  if (v.active) document.getElementById('zoom-hint')?.setAttribute('hidden', '');
}

/** v9 animal markers / arrival toast / 島上動物 list (3D scene only). */
let animalHud: AnimalHud | null = null;
let lastFollowUid: number | null = null;
function syncAnimalHud(time: number): void {
  if (!scene3d) return;
  animalHud ??= mountAnimalHud(scene3d, (id) => state.animals.includes(id) && !state.seenAnimals.includes(id));
  const busy = scene3d.fxBusy();
  // v16: the note cards step aside while a collapse / death plays (they come back once it is over).
  if (document.body.classList.contains('tree-fx') !== busy) document.body.classList.toggle('tree-fx', busy);
  animalHud.setEnabled(state.started && !state.over && !busy && Boolean(document.getElementById('modal')?.hidden));
  // v10: following an animal (marker, toast, list or a direct tap) counts as seeing it: its 新 badge goes everywhere.
  const uid = scene3d.followingUid();
  if (uid !== lastFollowUid) {
    lastFollowUid = uid;
    const crew = uid === null ? null : scene3d.crewList().find((c) => c.uid === uid);
    if (crew && state.animals.includes(crew.id) && !state.seenAnimals.includes(crew.id)) {
      state.seenAnimals.push(crew.id);
      persist();
      render();
      animalHud.refresh();
    }
  }
  animalHud.update(time);
}

function frame(time: number): void {
  const input = sceneInput();
  drawScene(input, time);
  syncViewButton();
  syncAnimalHud(time);
  // Keep the clock-driven chrome (countdowns, night styling) fresh without re-rendering every frame.
  if (time - lastChrome > 15000) {
    lastChrome = time;
    renderChrome(view(input));
  }
  checkDyingExpiry();
  if (!document.hidden) requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  requestAnimationFrame(frame);
  runCatchup();
  const age = Date.now() - weather.fetchedAt;
  if (!refreshing && (weather.origin !== 'live' || age > WEATHER_TTL_MS)) void refreshWeather();
});

const resize = () => {
  scene3d?.resize();
  scene2d?.resize();
};
window.addEventListener('resize', resize);
resize();

bindSheetDrag();
runCatchup();
if (!state.started) openStart();
requestAnimationFrame(frame);
if (weather.origin === 'live' && !weatherLoading) {
  applyWeather(weather);
  scheduleRefresh(Math.max(5000, WEATHER_TTL_MS - (Date.now() - weather.fetchedAt)));
} else {
  void refreshWeather(!placeChoice && weather.source !== 'geo');
}
