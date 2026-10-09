import './style.css';
import { EVENT_ORDER, PREPS, WEATHER_EVENTS, type PrepId, type WeatherEventId, type WeatherTrackId } from './balance';
import { clockMinutes, daysBetween, formatDateInTz, isoMinutes } from './dates';
import { condForEvent, currentEvents, hoursOfDate, observedEvents, observedRainEvents, sceneCond, severeCountdown, tempEvents, type Countdown, type EventMode } from './events';
import { MA_REFRESH_MS, alertEvents, fetchOfficialAlerts, likelyFeedRegion, type OfficialAlerts } from './alerts';
import { DEV_PANEL } from './flags';
import { ICONS } from './icons';
import { esc, formatHeight } from './util';
import { Capacitor } from '@capacitor/core';
import { bookGameEnd, bookMilestones, bookNest, bookWeather, loadMeta, newGame, saveMeta } from './meta';
import { Scene, daylightFactor, type SceneInput } from './render';
import { pickEvent } from './rules';
import { mulchLaid } from './campfire';
import { eventLabel, setLabelRegion, weatherTrackCopy } from './labels';
import { findPlace, migratePlaceId, pushRegionFlags, weatherRegion, type WeatherRegion } from './presets';
import { Scene3D, type Quality } from './three/scene3d';
import type { EcoCaps } from './three/animals3d';
import { mountAnimalHud, type AnimalHud } from './animalHud';
import { audioDiag, beginAmbience, kickAudio, playCelebrate, playControl, playChirp, playTok, preloadAudio, releaseAudioExtras, setPageAudible, setSoundEnabled, syncAmbience } from './audio';
import { diag, frameReport, noteFrame, noteIntro, resetFrameClock } from './diag';
import { frames, hidePreload, runPreload } from './preload';
import { APP_VERSION } from './version';
import { NEST_MIN_HEALTH, chickTapLine, eggHatchAt, eggPopupAvailable, firstEggDecision, freshNest, isNestHeightCount, markNestRevealed, nestBirdName, nestBuildAt, nestBuildPhrase, nestBuilds, nestCandidates, nestHatchAt, nestPhase, nestRewardText, pendingNestReveals, revealedNestBuilds, tickNest, warmBlock, warmEgg } from './nest';
import { FEATURE_LABEL, habitatDef, habitatFeatures, islandRadius } from './data/habitat';
import {
  advanceVirtualDay,
  applyWarningWater,
  brokenTop,
  advanceFlow,
  catchUp,
  DYING_MS,
  emergencyOptions,
  fallenLogDay,
  resolveDyingExpiry,
  checkWaterDeath,
  previewNight,
  waterHourKey,
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
  shownAge,
  triggerPest,
  visualReinforcement,
  type CareAction,
  type CatchupReport,
} from './sim';
import { clearGame, loadGame, loadWeatherCache, saveGame, saveWeatherCache, SAVE_KEY } from './storage';
import { canOpenSecond, clearGrove, GROVE_KEY, isleAward, loadGrove, saveGrove } from './grove';
import { sceneryCaption } from './scenery';
import { GOAL_REWARD_N, claimGoals, ensureGoals, noteGoal } from './goals';
import { drawShareCard, shareCardImage } from './shareCard';
import { armCoach, clearCoach, coachFocus, coachOpen, freshCoach, loadCoach, markCoach, markTour, saveCoach, tourDue, type Coach } from './coach';
import { META_KEY } from './meta';
import type { DayCond, GameState, TabId } from './types';
import {
  PLACES,
  animalName,
  closeModal,
  locationModal,
  noteNext,
  noteToggle,
  nestIntroModal,
  eggPopup,
  firstEggModal,
  setOnModalClosed,
  openModal,
  overModal,
  milestoneModal,
  weatherModal,
  renderChrome,
  syncHatchCard,
  hatchClockText,
  renderPanel,
  weatherPageHtml,
  renderSheet,
  openLogCalendar,
  selectLogDay,
  moveLogMonth,
  setThumbnailer,
  settingsModal,
  disclaimerModal,
  exportSaveModal,
  backupModal,
  cloudAskModal,
  importSaveModal,
  startModal,
  nameModal,
  lessonModal,
  tourModal,
  TOUR_PAGES,
  stormModal,
  windExplainerModal,
  coachCard,
  toast,
  flashWater,
  togglePreview,
  updateModal,
  setAlbumMode,
  setUiClock,
  type LessonId,
  type Pick,
  type View,
  diagModal,
} from './ui';
import { ANIMALS } from './data/animals';
import { defaultSpecies, speciesDef, speciesTargetCm, stageIndexFor, stageSampleCm, STAGE_NAMES, type SpeciesId } from './data/species';
import {
  WEATHER_STALE_MS,
  WEATHER_TTL_MS,
  condFromForecast,
  districtRain,
  fetchForecast,
  hkoForecast,
  stampDays,
  inHongKong,
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
import { fetchHko, fillHkoGaps, hkoIconLabel, hkoIconRain, hkoIconToWmo } from './hko';
import { fetchSmg } from './smg';
import { cwaArea, fetchCwa } from './cwa';
import { reverseGeocode } from './place';
import { sunForDate } from './sun';
import { creditsModal } from './credits';
import { defaultDev, loadDev, saveDev, type DevSettings } from './dev/settings';
import { syncBanner } from './native/banner';
import { isNative } from './native/platform';
import { onboardingDone, openPerms, permsReady } from './native/permGate';
import { flushPersist, hydrateInfo, hydrateNative, mirrorProbe, nativeQueue, observeNativeWrites, STAMP_KEY } from './native/persist';
import { createSaveLog } from './native/saveLog';
import { careSig, stampText, sumGroveRaw, sumRaw, sumState } from './saveDiag';
import { decodeSave, encodeSave } from './saveCode';
import { guideModal, type GuideTab } from './guide';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { NOTIFY_KEY, applyNotifications, notifyEnabled, planNotifications } from './native/notify';
import { HEADSUP_KEY, headsUpEnabled } from './headsUp';
import { App } from '@capacitor/app';
import { reportPushState, syncPush } from './native/push';
import { LOCALES, getHeightUnit, getLocale, isHeightUnit, loadHeightUnit, saveHeightUnit, saveLocale, switchLocale, t as tl, tName, useHeightUnit, type HeightUnit, type Locale } from './i18n';
import { kvSet } from './native/kv';
import { bootCloud, cloudDiagLines, flushCloud, resumeCloud, startCloud, type CloudSave } from './native/cloud';

const isLocaleId = (x: string): x is Locale => (LOCALES as readonly string[]).includes(x);

const PLACE_KEY = 'yiri-yisyu-place';
const QUALITY_KEY = 'yiri-yisyu-quality';

// Android app: load the save from native Preferences into localStorage before anything reads it (web: no-op).
await hydrateNative();
// 1.4.54 iPhone: adopt the iCloud copy before the save is read (fresh install / newer elsewhere). Other platforms: no-op.
await bootCloud();
// 1.4.55: the height unit may only now be in localStorage (native Preferences / iCloud restore).
if (loadHeightUnit() !== getHeightUnit()) {
  useHeightUnit(loadHeightUnit());
  switchLocale(getLocale());
}

// 1.4.43 diagnostics: persistent save / load / lifecycle log (diagnostics panel; survives a kill).
const slog = createSaveLog();
try {
  slog.add(await slog.init(), 'boot');
} catch {
  /* diagnostics only */
}
{
  const h = hydrateInfo;
  let devTz = '?';
  try {
    devTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    /* old engine */
  }
  slog.add(
    `LAUNCH ${APP_VERSION} ${h.native ? 'native' : 'web'} · device tz ${devTz} (UTC${-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : ''}${-new Date().getTimezoneOffset() / 60}) · HK date ${formatDateInTz(new Date(), 'Asia/Hong_Kong')} · hydrate ${h.ms}ms: ${h.reason}${h.err ? ` ERROR ${h.err}` : ''} · keys prefs ${h.prefsKeys} local ${h.localKeys} · copied →local ${h.toLocal} →prefs ${h.toPrefs}${h.stray?.length ? ` · removed stray items ${h.stray.join(',')}` : ''}`,
    'boot',
  );
  if (h.native) void mirrorProbe.then((r) => slog.add(`mirror ${r}`, 'boot'));
  if (h.native) {
    slog.add(`  prefs copy: stamp ${stampText(h.prefs[STAMP_KEY])} · save ${sumRaw(h.prefs[SAVE_KEY])} · grove ${sumGroveRaw(h.prefs[GROVE_KEY])}`, 'boot');
    slog.add(`  local copy: stamp ${stampText(h.local[STAMP_KEY])} · save ${sumRaw(h.local[SAVE_KEY])} · grove ${sumGroveRaw(h.local[GROVE_KEY])}`, 'boot');
  } else {
    slog.add(`  local: stamp ${stampText(localStorage.getItem(STAMP_KEY) ?? undefined)} · save ${sumRaw(localStorage.getItem(SAVE_KEY) ?? undefined)} · grove ${sumGroveRaw(localStorage.getItem(GROVE_KEY) ?? undefined)}`, 'boot');
  }
}
observeNativeWrites((writes) => {
  const short = (k: string) => (k === SAVE_KEY ? 'v2' : k === GROVE_KEY ? 'grove' : k === STAMP_KEY ? 'stamp' : k.replace(/^(sekai-tree|yiri-yisyu)-?/, ''));
  const txt = writes.map((w) => `${short(w.key)}${w.bytes >= 0 ? ` ${(w.bytes / 1024).toFixed(1)}kB` : ' rm'} ${w.ok ? 'ok' : `FAIL ${w.err}`} ${w.ms}ms`).join(', ');
  const failed = writes.some((w) => !w.ok);
  if (failed || !slog.amend('save', `→ native[${txt}]`)) slog.add(`native write${failed ? ' FAILED' : ''}: ${txt}`, failed ? 'nwfail' : 'nw', !failed);
});
/** Diagnostics: wall time of the latest tap of each care action this launch. */
const lastAct: Record<string, number> = {};
function logState(label: string, tag = 'state', fold = false): void {
  try {
    slog.add(`${label} · tz ${timezone} today ${today()} · isle ${isle} · ${sumState(state)}`, tag, fold);
  } catch {
    /* diagnostics only */
  }
}
function logSave(trigger: string): void {
  try {
    const acts = Object.entries(lastAct)
      .map(([a, t]) => `${a}@${new Date(t).toTimeString().slice(0, 8)}`)
      .join(' ');
    const tick = trigger === 'tick';
    slog.add(
      `SAVE[${trigger}] stamp ${localStorage.getItem(STAMP_KEY) ?? '-'} · ${sumState(state)}${acts ? ` · last ${acts}` : ''} · local[v2,grove${tick ? '' : ',meta'}]${hydrateInfo.native ? ` · native queued ${nativeQueue.pending}` : ' (web: no native)'}`,
      tick ? 'save:tick' : 'save',
      tick,
    );
  } catch {
    /* diagnostics only */
  }
}

let timezone = 'Asia/Hong_Kong';
setLogClock(() => {
  const m = clockMinutes(timezone);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});
let meta = loadMeta();
let state: GameState = loadGame() ?? createGame(formatDateInTz(new Date(), timezone));
let coach: Coach = loadCoach();
/** pick: HUD hidden, far islands. arrive: camera pull and sprout. null: playing. */
let plantingShow: 'pick' | 'arrive' | null = null;
let lesson: { id: LessonId; page: number } | null = null;
const loadedGrove = loadGrove(state);
let home = loadedGrove.home;
let second: GameState | null = loadedGrove.second;
let isle: 0 | 1 = loadedGrove.isle;
state = isle === 1 && second ? second : home;
// 1.4.45: an existing player (tree planted, coach finished or never shown) is past onboarding: prompts as before.
if (onboardingDone(home.started, coach)) openPerms();
const bootLogUntil = Date.now() + 90_000;
logState(`loaded (loadGame + loadGrove, migrations applied; save had ${loadGame() ? 'a tree' : 'none'})`, 'boot');
/** Diagnostics: log a step that may change the loaded state (always shortly after launch, later only if care changed). */
function watchStep<T>(label: string, fn: () => T): T {
  const before = careSig(state);
  const out = fn();
  const after = careSig(state);
  if (Date.now() < bootLogUntil || before !== after) logState(`${label}${before !== after ? ` CARE CHANGED (${before} → ${after})` : ''}`);
  return out;
}
/** Species picker opened to plant on the empty second island, not to rename or restart. */
let plantingSecond = false;
let dev: DevSettings = DEV_PANEL ? loadDev() : defaultDev();
let tab: TabId = 'care';
let placeChoice = localStorage.getItem(PLACE_KEY) ?? '';
// 1.4.48 one-time move of the old Hong Kong presets (中環 → 香港, 沙田／大埔／西貢／元朗 → 新界, 東涌 → 離島).
if (migratePlaceId(placeChoice) !== placeChoice) {
  placeChoice = migratePlaceId(placeChoice);
  kvSet(PLACE_KEY, placeChoice);
}
let weather: WeatherSnapshot = initialWeather();
let weatherLoading = weather.provider === 'sim';
setLabelRegion(snapRegion(weather) === 'hk' || snapRegion(weather) === 'mo' ? 'hk' : 'intl');
let statusLine = weather.origin === 'live' ? tl('main.001') : tl('ui.152');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pendingNote = '';
let pick: Pick = { species: defaultSpecies() };
let quality: Quality = localStorage.getItem(QUALITY_KEY) === 'high' ? 'high' : 'low';

const canvas = document.getElementById('scene');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error(tl('main.002'));
let scene3d: Scene3D | null = null;
let scene2d: Scene | null = null;
try {
  scene3d = new Scene3D(canvas, quality);
  scene3d.onEggTap = () => {
    playTok();
    openEggModal();
  };
  // 1.4.55: tapping the chick: a soft chirp and who it is / when it leaves (tonight's settlement).
  scene3d.onChickTap = () => {
    playChirp();
    const line = chickTapLine(state.nest);
    if (line) toast(line);
  };
  // 1.4.58: tapping a rock / bush / flower / decoration / 養分地標: it wobbles (scene) and a one-line caption.
  let sceneryTurn = 0;
  let sceneryToastAt = 0;
  scene3d.onSceneryTap = (hit) => {
    playTok();
    const now = Date.now();
    if (now - sceneryToastAt < 900) return;
    const line = sceneryCaption(hit, meta.landmark, sceneryTurn++);
    if (!line) return;
    sceneryToastAt = now;
    toast(line);
    noteDailyGoal('scenery');
  };
  setThumbnailer(
    (id, unlocked) => scene3d?.thumbnail(id, unlocked) ?? null,
    (species, stage, cm) => scene3d?.speciesThumb(species, stage, cm) ?? null,
  );
} catch (error) {
  scene3d = null;
  console.warn(tl('main.003'), error);
  scene2d = new Scene(canvas);
  document.body.classList.add('flat');
}
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const wxPage = document.getElementById('wx-page');
const wxBackdrop = document.getElementById('wx-backdrop');
const sheet = document.getElementById('sheet');
const sheetHandle = document.getElementById('sheet-handle');

/** Cached weather: fresh (<30 min, same location choice) counts as live; older real data is shown as cached. */
function initialWeather(): WeatherSnapshot {
  const cached = loadWeatherCache();
  const choice = placeChoice && placeChoice !== 'geo' ? placeChoice : 'auto';
  if (cached && cached.provider !== 'sim' && migratePlaceId(cached.choice ?? 'auto') === choice) {
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

/** 1.4.48 which bureau covers this snapshot: a preset's own region, or the GPS fix's coordinates (see weatherRegion). */
function snapRegion(snapshot: WeatherSnapshot): WeatherRegion {
  return weatherRegion(snapshot.source, snapshot.lat, snapshot.lon, snapshot.choice);
}

function usesSmg(snapshot: WeatherSnapshot = weather): boolean {
  return snapRegion(snapshot) === 'mo';
}

/** v1.4.14: Taiwan (device location or, since 1.4.48, a Taiwan preset) uses CWA via the push server. */
function usesCwa(snapshot: WeatherSnapshot = weather): boolean {
  return snapRegion(snapshot) === 'tw';
}

/** Official warnings (HKO, SMG or CWA) decide severe weather, rather than model numbers. */
function officialActive(snapshot: WeatherSnapshot = weather): boolean {
  return Boolean(snapshot.hko) && (usesHko(snapshot) || usesSmg(snapshot) || usesCwa(snapshot));
}

/** 1.4.26 HK / Macau / Taiwan, decided by location (not by which data source answered). */
function officialRegion(snapshot: WeatherSnapshot = weather): boolean {
  return usesHko(snapshot) || usesSmg(snapshot) || usesCwa(snapshot);
}

/**
 * 1.4.26 who decides severe weather here: HKO / SMG / CWA warnings ('official'), a national alert feed ('feed': US,
 * Canada, Japan, Europe), or observed numbers ('observed', no feed). An unreachable feed in a feed region still counts
 * as 'feed' (no alerts), so model numbers never stand in for official alerts.
 */
function eventMode(snapshot: WeatherSnapshot = weather): EventMode {
  if (officialRegion(snapshot)) return 'official';
  if (snapshot.alerts) return snapshot.alerts.covered ? 'feed' : 'observed';
  return likelyFeedRegion(snapshot.lat, snapshot.lon) ? 'feed' : 'observed';
}

/** Rain on the live reading (drizzle), when there is a real reading. */
function liveDrizzle(): boolean {
  if (weather.provider === 'sim' || weather.origin === 'offline') return false;
  return weather.current.precipMm >= 0.2 || isRainCode(weather.current.code);
}

/** Events happening right now: official warnings / feed alerts in force, or (no feed) observed numbers. Never forecasts. */
function liveEvents(): WeatherEventId[] {
  const mode = eventMode();
  if (mode === 'official') {
    if (!officialActive()) return [];
    return currentEvents({ hk: true, warnings: weather.hko?.warnings, current: weather.current });
  }
  if (mode === 'feed') {
    const out = new Set<WeatherEventId>(alertEvents(weather.alerts));
    if (liveDrizzle()) out.add('drizzle');
    return [...out];
  }
  if (weather.provider === 'sim' || weather.origin === 'offline') return [];
  const day = weather.daily.find((d) => d.date === today());
  const c = weather.current;
  const temps = { tempMax: Math.max(c.tempC, day?.tempMax ?? -Infinity), tempMin: Math.min(c.tempC, day?.tempMin ?? Infinity), intl: day?.intl, normMax: day?.normMax, normMin: day?.normMin };
  return [...new Set([...observedEvents(hoursOfDate(weather.pastHours, today()), c), ...tempEvents(temps)])].filter((e) => e !== 'clear');
}

/** v1.4.24: rain really falling now (warnings / alerts in force, or observed) — the only rain that counts for 水分. */
function liveRain(): WeatherEventId[] {
  const mode = eventMode();
  if (mode === 'official') return officialActive() ? observedRainEvents({ hk: true, warnings: weather.hko?.warnings, current: weather.current }) : [];
  if (mode === 'feed') return observedRainEvents({ hk: true, events: alertEvents(weather.alerts), current: liveDrizzle() ? weather.current : { ...weather.current, precipMm: 0, code: 0 } });
  if (weather.provider === 'sim' || weather.origin === 'offline') return [];
  return observedRainEvents({ hk: false, current: weather.current, hours: hoursOfDate(weather.pastHours, today()) });
}

/** Where no feed exists: what the date's completed hours observed, plus heat / cold from that day's temperatures. */
function observedDay(date: string): WeatherEventId[] {
  if (eventMode() !== 'observed' || weather.provider === 'sim') return [];
  const hours = hoursOfDate(weather.pastHours, date);
  const day = weather.daily.find((d) => d.date === date);
  return [...(hours.length ? observedEvents(hours) : []), ...(day ? tempEvents(day) : [])];
}

/** Events the day is settled with (manual developer weather wins). 1.4.26: forecasts never add events. */
function eventsFor(date: string): WeatherEventId[] {
  if (manual()) return dev.events.length ? [...dev.events] : ['clear'];
  return eventsForDate(state, date, observedDay(date));
}

/** Name of whoever issued the warnings in force (toasts / countdown). */
function warningSource(snapshot: WeatherSnapshot = weather): string {
  if (usesSmg(snapshot)) return tl('main.005');
  if (usesCwa(snapshot)) return tl('main.006');
  if (officialActive(snapshot)) return tl('main.007');
  if (eventMode(snapshot) === 'feed' && snapshot.alerts?.source) return tl(`alerts.src.${snapshot.alerts.source}`);
  return '';
}

function todayEvents(): WeatherEventId[] {
  return eventsFor(today());
}

function todayCond(): DayCond {
  const t = today();
  const day = presentedDays().find((d) => d.date === t) ?? mildDay(t);
  if (manual()) return withCold(sceneCond(condFromForecast(mildDay(t), 28), todayEvents(), { manual: true }), todayEvents(), true);
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
  // Severe events drive the scene only while in force right now. Rain warnings still rain on top of a wind headline.
  const live = liveEvents();
  return withCold(sceneCond(cond, live), live, false);
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
  // A warning counts only while the active source says it is in force. No second forecast
  // (Open-Meteo hours, or the game's own "tomorrow will be hot") on top of that.
  return severeCountdown({
    nowEvents: manual() ? dev.events : liveEvents(),
    hourly: [],
    nowIso: localNowIso(),
    minutesToMidnight: 24 * 60 - clockMinutes(timezone),
    manual: manual() ? dev.forecast : null,
    nowMs: Date.now(),
    activeSource: manual() ? tl('main.004') : warningSource() || tl('main.008'),
  });
}

function choiceKey(): string {
  return placeChoice && placeChoice !== 'geo' ? placeChoice : 'auto';
}

function placeLabel(): { place: string; note: string } {
  const m = PLACES.find((p) => p.id === placeChoice);
  if (m) return { place: m.name, note: '' };
  if (weather.provider === 'sim' && !weather.fetchedAt) return { place: tl('ui.346'), note: '' };
  return { place: tName(weather.place) || tl('main.009'), note: weather.source === 'fallback' ? tl('main.010') : '' };
}

/** How hard the tree sways (0 calm … 1 typhoon), from the weather in force now; the dev panel can force it. */
const EVENT_SWAY: Record<WeatherEventId, number> = { clear: 0.08, drizzle: 0.18, hot: 0.04, cold: 0.1, rainstorm: 0.55, blackrain: 0.65, typhoon1: 0.72, thunder: 0.85, typhoon8: 1, landslip: 0.4 };
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
  const bare = isle === 1 && !second;
  const target = speciesTargetCm(state.species);
  const preview = DEV_PANEL ? dev.preview : {};
  const species: SpeciesId = preview.species ?? state.species;
  const previewSeason = preview.species ? speciesTargetCm(preview.species) : target;
  const stage = bare ? 0 : (preview.stage ?? stageIndexFor(state.heightCm, previewSeason));
  const islandStage = bare ? 0 : preview.island;
  const heightCm = bare ? 18 : preview.stage !== undefined || preview.species ? (preview.stage !== undefined ? stageSampleCm(stage, previewSeason) : state.heightCm) : state.heightCm;
  return {
    treeName: state.treeName,
    species,
    stage,
    islandStage,
    targetCm: previewSeason,
    heightCm,
    unlocked: bare ? [] : [...state.animals],
    residents: bare ? [] : [...state.residents],
    sway: swayLevel(cond),
    health: state.over?.kind === 'dead' ? 0 : Math.max(state.health, state.dying ? 0 : 8),
    moisture: state.moisture,
    pests: state.pest.active ? 70 : 0,
    scars: state.scars,
    animals: bare ? [] : [...state.residents, ...visitors],
    nest: bare ? 'empty' : nestPhase(state.nest),
    nestBird: bare ? '' : (state.nest?.egg?.bird ?? ''),
    nestBuilds: bare ? [] : revealedNestBuilds(state.nest),
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
    dead: bare ? false : state.over?.kind === 'dead',
    deathPending: bare ? false : state.over?.kind === 'dead' && state.over.fallSeen === false,
    bare,
    isleHere: isle,
    otherTree: isle === 1 || Boolean(second),
  };
}

function view(input: SceneInput): View {
  const { place, note } = placeLabel();
  const hk = officialActive();
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
    nowEvents: manual() ? todayEvents() : liveEvents(),
    todayEvent: pickEvent(todayEvents()),
    preview: previewNight(state, today(), todayEvents(), meta),
    countdown: countdown(),
    manual: manual(),
    minutesToSettle: 24 * 60 - clockMinutes(timezone),
    isle: { here: isle, bare: isle === 1 && !second, open: canOpenSecond(homeTree()) },
    wx: {
      provider: weather.provider ?? (weather.origin === 'offline' ? 'sim' : 'met-no'),
      origin: weather.origin,
      loading: weatherLoading,
      fetchedAt: weather.fetchedAt,
      updated: clockOf(weather.fetchedAt),
      hkoUsed: hk,
      model: weather.model,
      bureau: usesSmg() ? 'smg' : usesCwa() ? 'cwa' : usesHko(weather) ? 'hko' : undefined,
      warnings: hk ? weather.hko!.warnings : [],
      warningsKnown: hk ? weather.hko!.warningsKnown !== false : true,
      messages: hk ? weather.hko!.messages : [],
      situation: hk ? weather.hko!.situation : '',
      hkoDays: hk ? Object.fromEntries(weather.hko!.forecast.map((d) => [d.date, d.text])) : {},
      conditionText: manual() ? undefined : weather.conditionText,
      nowIcon: !manual() && hk ? weather.hko!.current?.icon || undefined : undefined,
      station: tName(weather.station),
      reading: !hk || Boolean(weather.hko?.current),
      humidity: manual() || (hk && !weather.hko?.current) ? undefined : weather.current.humidity,
      obs: manual() || weather.origin === 'offline' || (weather.provider === 'sim' && !weather.hko) ? undefined : { code: weather.current.code, windKmh: weather.current.windKmh, gustKmh: weather.current.gustKmh, precipMm: weather.current.precipMm },
      rainInHours: weather.rainInHours ?? null,
      mode: manual() ? undefined : eventMode(),
      feed: !manual() && eventMode() === 'feed' ? { source: weather.alerts?.source, alerts: weather.alerts?.alerts ?? [], attribution: weather.alerts?.attribution ?? '', known: Boolean(weather.alerts?.covered), tz: weather.timezone, link: weather.alerts?.link, disclaimer: weather.alerts?.disclaimer } : undefined,
      error: weather.error,
      overridden: manual(),
    },
  };
}

function coachVisible(): boolean {
  return coachOpen(coach) && plantingShow === null && state.started !== false && !state.over && !(isle === 1 && !second);
}

/** Checklist under the weather card, and a pulse on the next action. */
function syncCoach(): void {
  const el = document.getElementById('coach');
  const show = coachVisible();
  if (el) {
    el.hidden = !show;
    if (show) {
      const html = coachCard(coach);
      if (el.dataset.html !== html) {
        el.innerHTML = html;
        el.dataset.html = html;
      }
    }
  }
  document.querySelectorAll('.coach-pulse').forEach((n) => n.classList.remove('coach-pulse'));
  const focus = show ? coachFocus(coach) : null;
  if (focus === 'water') document.querySelector('#dock [data-action="water"]')?.classList.add('coach-pulse');
  if (focus === 'feed') document.querySelector('#dock [data-action="fertilize"]')?.classList.add('coach-pulse');
}

function finishCoach(step: 'water' | 'feed' | 'health' | 'carbon' | 'skip'): void {
  const next = markCoach(coach, step);
  if (next === coach) return;
  const finished = !coach.done && next.done && step !== 'skip';
  coach = next;
  saveCoach(coach);
  render();
  if (finished) toast(tl('main.011'));
  if (onboardingDone(state.started, coach) && openPerms()) void askPermissionsInOrder();
}

/** 1.4.45: right after onboarding — location first, then notifications (push, then local reminders). */
async function askPermissionsInOrder(): Promise<void> {
  try {
    if (usesDeviceLocation()) {
      if (refreshing) await refreshing;
      await refreshWeather(true);
    }
    if (isNative()) {
      await syncPush(notifyEnabled());
      scheduleReminders(false);
    }
  } catch {
    /* best-effort */
  }
}

/** Arms the first-plant coach; true when the 1.4.58 welcome tour should open (fresh save, never seen). */
function beginCoach(): boolean {
  const next = armCoach(coach);
  if (next === coach) return false;
  const due = tourDue(coach, next) && meta.history.length === 0 && meta.milestones.length === 0 && (state.daysCared ?? 0) <= 1;
  coach = due ? next : markTour(next);
  saveCoach(coach);
  return due;
}

/** 1.4.58 welcome tour (page 0-based). Closing it any way counts as seen. */
let tourPage: number | null = null;
function openTour(page = 0): void {
  tourPage = page;
  openModal(tourModal(page), 'tour-card');
}
function endTour(): void {
  tourPage = null;
  const next = markTour(coach);
  if (next !== coach) {
    coach = next;
    saveCoach(coach);
  }
  closeModal();
}

/** 1.4.41: the scene's day / night (same threshold as the 3D animals), for 圖鑑 unlocks. */
function nightNow(): boolean {
  return sceneInput().daylight < 0.45;
}

function render(): void {
  const input = sceneInput();
  const v = view(input);
  renderChrome(v);
  syncCoach();
  syncGoals();
  renderSheet(state, today());
  if (drawer && !drawer.hidden) renderPanel(v);
  if (wxPage && !wxPage.hidden) renderWeatherPage(v);
  // 1.4.33: no draw here. The rAF loop draws every frame with its own timestamp; a draw stamped with
  // performance.now() put the next rAF frame "in the past" (dt 0), which used to snap the camera.
  loop();
  devRender?.();
  queueNestIntro();
  queueFirstEggIntro();
}

let nestIntroTimer = 0;
/** 1.4.29 once ever: when the first bird is in the encyclopedia, explain when birds lay eggs (waits for other windows). */
function queueNestIntro(): void {
  if (meta.nestIntro || nestIntroTimer || !state.started || state.over || !nestCandidates(state).length) return;
  nestIntroTimer = window.setTimeout(() => {
    nestIntroTimer = 0;
    const modal = document.getElementById('modal');
    const birds = nestCandidates(state);
    if (meta.nestIntro || opening || !birds.length || (modal && !modal.hidden)) return;
    const bird = [...state.animals].reverse().find((id) => birds.includes(id)) ?? birds[0]!;
    meta.nestIntro = true;
    saveMeta(meta);
    openModal(nestIntroModal(nestBirdName(bird)));
  }, 900);
}

let firstEggTimer = 0;
let firstEggDue = false;

/** Set the one-time flag without a pop-up when this player has already hatched eggs. */
function noteFirstEgg(justLaid: boolean): void {
  const choice = firstEggDecision(meta, state.nest, justLaid || firstEggDue);
  if (choice === 'silent') {
    meta.firstEggIntro = true;
    firstEggDue = false;
    saveMeta(meta);
    return;
  }
  if (choice === 'show') firstEggDue = true;
}

/** After the lay toast, once no other window is up. Retries while the opening or a modal is in the way. */
function queueFirstEggIntro(): void {
  if (!firstEggDue || meta.firstEggIntro || firstEggTimer || !state.started || state.over) return;
  firstEggTimer = window.setTimeout(() => {
    firstEggTimer = 0;
    const modal = document.getElementById('modal');
    if (meta.firstEggIntro || opening || (modal && !modal.hidden)) return;
    const egg = state.nest?.egg;
    if (!egg || egg.hatchedAt != null) {
      firstEggDue = false;
      return;
    }
    meta.firstEggIntro = true;
    firstEggDue = false;
    saveMeta(meta);
    const n = (state.nest?.hatched ?? 0) + 1;
    openModal(firstEggModal(nestBirdName(egg.bird), nestRewardText(n)));
  }, 900);
}

let eggModalTimer = 0;

function stopEggModalTick(): void {
  if (eggModalTimer) window.clearTimeout(eggModalTimer);
  eggModalTimer = 0;
}

/** Keep the open egg pop-up's countdown and keep-warm button in step, without replaying the modal animation. */
function refreshEggModal(): void {
  if (!document.querySelector('#modal [data-egg]')) return;
  const b = document.querySelector('#egg-clock b');
  const text = hatchClockText(state);
  if (b && text) b.textContent = text;
  const btn = document.querySelector<HTMLButtonElement>('#modal [data-action="warm-egg"]');
  if (!btn) return;
  const block = warmBlock(state, virtualNow());
  btn.textContent = block === 'already' ? tl('nest.warmed') : block === 'soon' ? tl('nest.warmSoon') : tl('nest.warm');
  const off = block != null;
  btn.setAttribute('aria-disabled', off ? 'true' : 'false');
  btn.classList.toggle('off', off);
}

function armEggModalTick(): void {
  stopEggModalTick();
  const tick = () => {
    if (!document.querySelector('#modal [data-egg]')) {
      eggModalTimer = 0;
      return;
    }
    refreshEggModal();
    eggModalTimer = window.setTimeout(tick, 1000);
  };
  eggModalTimer = window.setTimeout(tick, 1000);
}

function openEggModal(): void {
  if (!eggPopupAvailable(state.nest) || opening) return;
  const modal = document.getElementById('modal');
  if (modal && !modal.hidden) return;
  openModal(eggPopup(state));
  armEggModalTick();
}

let revealBusy = false;

function nestCovered(): boolean {
  if (opening) return true;
  const modal = document.getElementById('modal');
  if (modal && !modal.hidden) return true;
  if (wxPage && !wxPage.hidden) return true;
  return false;
}

/** Decoration earned at settlement stays hidden until this shot, once per building. */
function maybeNestReveal(): void {
  if (revealBusy || !state.started || state.over) return;
  if (!scene3d) {
    // 2D fallback has no reveal shot: show earned decorations straight away.
    const nest = state.nest;
    if (nest && pendingNestReveals(nest).length) {
      while (pendingNestReveals(nest).length) markNestRevealed(nest);
      persist();
      render();
    }
    return;
  }
  if (nestCovered()) return;
  const nest = state.nest;
  if (!nest) return;
  const pending = pendingNestReveals(nest);
  if (!pending.length) return;
  const index = nest.revealedBuilds ?? 0;
  const kind = pending[0]!;
  const bird = nest.revealBirds?.[index] || 'sparrow';
  revealBusy = true;
  scene3d.playNestReveal({
    kind,
    index,
    bird,
    reduced: reducedMotion,
    onDone: () => {
      markNestRevealed(nest);
      revealBusy = false;
      persist();
      render();
      maybeNestReveal();
    },
  });
}

function drawScene(input: SceneInput, time: number): void {
  if (scene3d) scene3d.draw(input, time);
  else scene2d?.draw(input, time);
}

/* ---------- 匯出／匯入存檔 ---------- */
function saveCodeText(): string {
  return (document.querySelector('.save-code') as HTMLTextAreaElement | null)?.value.trim() ?? '';
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (isNative()) await Clipboard.write({ string: text });
    else await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function canShare(): boolean {
  return isNative() || typeof navigator.share === 'function';
}

async function shareText(text: string): Promise<void> {
  try {
    if (isNative()) await Share.share({ title: tl('main.012'), text });
    else await navigator.share({ title: tl('main.012'), text });
  } catch {
    /* cancelled */
  }
}

async function exportSave(): Promise<void> {
  persist();
  const code = await encodeSave(state, meta);
  const copied = await copyText(code);
  openModal(exportSaveModal(code, copied, canShare()));
}

async function importSave(): Promise<void> {
  const code = saveCodeText();
  if (!code) return;
  const res = await decodeSave(code);
  if (!res.ok) {
    openModal(importSaveModal(res.error));
    return;
  }
  const s = res.payload.save;
  const when = res.payload.at ? tl('main.013', { p0: new Date(res.payload.at).toLocaleDateString('en-CA') }) : '';
  const height = s.heightCm >= 100 ? tl('main.014', { p0: (s.heightCm / 100).toFixed(1) }) : tl('ui.308', { p0: Math.round(s.heightCm) });
  if (!window.confirm(tl('main.017', { p0: s.treeName || tl('main.015'), when, p2: shownAge(s), height, p4: s.over ? tl('main.016') : '' }))) return;
  importing = true;
  clearGrove();
  kvSet(SAVE_KEY, JSON.stringify(s));
  if (res.payload.meta) kvSet(META_KEY, JSON.stringify(res.payload.meta));
  await flushPersist();
  location.reload();
}

/** Set while an imported save is being written, so nothing overwrites it before the reload. */
let importing = false;

function backupPlatform(): 'ios' | 'android' | 'web' {
  if (!isNative()) return 'web';
  return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
}

let cloudAnswer: ((restore: boolean) => void) | null = null;

/** 1.4.54: iCloud holds a different save than this device — ask (after the opening, when no other window is up). */
function askCloud(cloud: CloudSave): Promise<boolean> {
  return new Promise((resolve) => {
    const show = () => {
      const modal = document.getElementById('modal');
      if (opening || (modal && !modal.hidden)) {
        window.setTimeout(show, 1200);
        return;
      }
      let tree = tl('main.015');
      let height = '-';
      try {
        const s = JSON.parse(cloud.keys[SAVE_KEY] ?? 'null') as GameState | null;
        if (s) {
          tree = s.treeName || tree;
          height = formatHeight(s.heightCm);
        }
      } catch {
        /* unreadable: generic labels */
      }
      const when = cloud.at ? new Date(cloud.at).toLocaleString() : '-';
      cloudAnswer = resolve;
      openModal(cloudAskModal({ tree, height, when }));
    };
    show();
  });
}

function syncGrove(): void {
  if (isle === 0 || !second) home = state;
  else second = state;
}

/**
 * 1.4.42: going to the background (or the page going away): bring the flow up to now, write everything and push
 * the native mirror straight away — iOS may suspend / kill the app seconds later.
 */
function saveNow(trigger = 'saveNow'): void {
  if (importing) return;
  syncFlow(true, trigger);
  syncGrove();
  saveGame(isle === 1 && second ? second : home);
  saveGrove({ isle, home, second });
  saveMeta(meta);
  const t0 = Date.now();
  if (hydrateInfo.native) slog.add(`flush start (${trigger}) · queue pending ${nativeQueue.pending}${nativeQueue.busySince ? ` busy ${Date.now() - nativeQueue.busySince}ms` : ''}`, 'flush');
  void flushCloud();
  void flushPersist().then(() => {
    if (hydrateInfo.native) slog.add(`flush done (${trigger}) ${Date.now() - t0}ms · pending ${nativeQueue.pending}`, 'flush');
  });
}
window.addEventListener('pagehide', (e) => {
  slog.add(`life: pagehide persisted=${e.persisted}`, 'life');
  saveNow('pagehide');
});
window.addEventListener('beforeunload', () => slog.add('life: beforeunload', 'life'));
document.addEventListener('freeze', () => slog.add('life: freeze', 'life'));
document.addEventListener('resume', () => slog.add('life: page resume', 'life'));

function persist(trigger = 'persist'): void {
  if (importing) return;
  syncGrove();
  saveGame(isle === 1 && second ? second : home);
  saveGrove({ isle, home, second });
  saveMeta(meta);
  logSave(trigger);
  scheduleReminders(false);
}

function homeTree(): GameState {
  return isle === 0 || !second ? state : home;
}

function grantIsle(id: 'land' | 'plant' | 'record'): boolean {
  meta.isle ??= [];
  if (meta.isle.some((a) => a.id === id)) return false;
  const tree = id === 'land' ? homeTree() : state;
  meta.isle.push(isleAward(id, today(), tree.treeName, tree.species));
  return true;
}

function arriveIsle(next: 0 | 1): void {
  if (isle === 0) home = state;
  else if (second) second = state;
  isle = next;
  if (next === 0) state = home;
  else if (second) state = second;
  else state = home;
  const landed = next === 1 && grantIsle('land');
  slog.add(`island switch → ${next}`, 'isle');
  if (next === 0 || second) runCatchup('island switch');
  else {
    persist('island switch');
    render();
  }
  if (landed) toast(tl('main.018'));
  else if (next === 1 && !second) toast(tl('main.019'));
}

/** 1.4.29 island bar above the growth log (replaces the swipe, which fought manual camera panning). */
function switchIsle(to: 0 | 1): void {
  if (to === isle || scene3d?.sailing()) return;
  if (to === 1 && !canOpenSecond(homeTree())) {
    toast(tl('main.020'));
    return;
  }
  if (!scene3d?.sailToOther(reducedMotion, () => arriveIsle(to))) arriveIsle(to);
}

function plantSecond(species?: SpeciesId): void {
  const input = document.getElementById('tree-name');
  const name = (input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '') || tl('main.023');
  if (isle === 0 || !second) home = state;
  second = newGame(meta, realToday(), name, species ?? pick.species);
  isle = 1;
  state = second;
  plantingSecond = false;
  if (!manual() && (weather.provider !== 'sim' || weather.hko || weather.alerts)) recordEvents(state, today(), liveEvents(), officialActive() || eventMode() === 'feed');
  const fresh = grantIsle('plant');
  beginCoach();
  persist();
  closeModal();
  render();
  toast(fresh ? tl('main.024', { treeName: state.treeName }) : coachOpen(coach) ? tl('main.025', { treeName: state.treeName }) : tl('main.026', { treeName: state.treeName }));
  syncWarningWater();
}

/** Android app: reschedule the local reminders from the current state (web: nothing). */
function scheduleReminders(background: boolean): void {
  if (!isNative()) return;
  const events = todayEvents();
  const opts = emergencyOptions(events);
  const careToday = state.care.date === today();
  const done = (k: 'heatWater' | 'rainDrain' | 'warmCover') => careToday && Boolean(state.care[k]);
  const pending: string[] = [];
  if (opts.heatWater && !done('heatWater')) pending.push(tl('ui.097'));
  if (opts.rainDrain && !done('rainDrain')) pending.push(tl('main.027'));
  if (opts.warmCover && !done('warmCover')) pending.push(tl('ui.197'));
  const windy = state.windUnlocked && events.some((e) => WEATHER_EVENTS[e].category === 'wind');
  if (windy && !(careToday && Object.values(state.care.preps).some(Boolean))) pending.push(tl('ui.123'));
  if (notifyEnabled())
    reportPushState({
      day: today(),
      tz: timezone,
      done: {
        heat: done('heatWater'),
        drain: done('rainDrain'),
        reinforce: careToday && Object.values(state.care.preps).some(Boolean),
        warm: done('warmCover'),
      },
      region: { lat: weather.lat, lon: weather.lon },
      ...pushRegionFlags(snapRegion(weather), usesCwa(weather) ? cwaArea() : null),
      rUnlocked: Boolean(state.windUnlocked),
      alive: state.started && !state.over,
      tree: state.over ? 'dead' : state.dying ? 'dying' : 'ok',
      resist: Math.round(state.resist),
      headsUp: headsUpEnabled(),
    });
  const offset = virtualNow() - Date.now();
  applyNotifications(
    planNotifications({
      now: Date.now(),
      msToSettlement: (24 * 60 - clockMinutes(timezone)) * 60_000,
      started: state.started,
      over: Boolean(state.over),
      wateredToday: careToday && state.care.water > 0,
      fertilizedToday: careToday && state.care.fertilize > 0,
      dyingEndsAt: state.dying ? state.dying.at + DYING_MS - offset : null,
      // v1.4.18: 健康 only changes at midnight — warn when tonight's projected settlement takes it to 0.
      healthZeroAt: (() => {
        if (!state.started || state.over || state.dying) return null;
        const p = previewNight(state, today(), events, meta);
        return p.hAfter <= 0 || p.waterDeath ? Date.now() + (24 * 60 - clockMinutes(timezone)) * 60_000 : null;
      })(),
      waterLowTonight: (() => {
        if (!state.started || state.over || state.dying) return false;
        return previewNight(state, today(), events, meta).wTone === 'dry';
      })(),
      pendingEmergencies: pending,
      background,
      hatchAt: (() => {
        const at = nestHatchAt(state);
        return at == null ? null : Date.now() + (at - virtualNow());
      })(),
    }),
  );
}

/**
 * v14: new milestones (tonight's, or the save migration's retro ones) go into the collection once and get a
 * celebratory card. When the tree dies: book the landmark once, then show the result.
 */
function handleOver(): boolean {
  if (!state.over) {
    const awards = Object.values(state.milestones ?? {}).filter((m) => m && !m.booked);
    const weather = Object.values(state.wx?.awards ?? {}).filter((a): a is NonNullable<typeof a> => Boolean(a && !a.booked));
    if ((!awards.length && !weather.length) || !state.started) return false;
    const lines = bookMilestones(meta, state);
    bookWeather(meta, state);
    if (isle === 1 && state.milestones?.record && grantIsle('record')) lines.push(tl('main.028'));
    persist();
    const recordHint = isle === 0 && awards.some((a) => a?.id === 'record') ? tl('main.029') : '';
    playCelebrate();
    openModal(awards.length ? milestoneModal(state, meta, awards, lines, weather, recordHint) : weatherModal(state, meta, weather), 'celebrate');
    return true;
  }
  bookNest(meta, state);
  const lines = [...bookMilestones(meta, state), ...bookWeather(meta, state), ...bookGameEnd(meta, state)];
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
  if (count > 1) toast(tl('main.030', { count }));
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

/** True while the opening glide is running, so night cards wait until the interface fades in. */
let opening = false;
let deferredReport: CatchupReport | null = null;

function showReport(report: CatchupReport): void {
  bookNest(meta, state);
  persist();
  render();
  if (state.over) {
    handleOver();
    return;
  }
  const rest = () => {
    if (handleOver()) {
      maybeNestReveal();
      return;
    }
    if (report.messages.length) {
      const message = report.messages.join(' ');
      if (!state.started) pendingNote = message;
      else openModal(stormModal(message));
    }
    maybeExplainWind();
    maybeNestReveal();
    const names = report.animals.map(animalName);
    if (names.length) toast(tl('main.031', { p0: names.join(tl('ui.206')) }));
  };
  // v16: a fresh collapse plays first; the night's card and any other modal wait until it is over.
  if (!playPendingCollapse(report, rest)) rest();
}

function runCatchup(why = 'catch-up'): void {
  reconcileClock();
  const report = watchStep(`${why}: catchUp (lastSeen ${state.lastSeenDate} → today ${today()})`, () => catchUp(state, today(), eventsFor, meta, virtualNow(), msIntoToday(), nightNow()));
  if (state.started && !state.over && state.lastSeenDate === today()) {
    const now = virtualNow();
    watchStep(`${why}: advanceFlow`, () => advanceFlow(state, today(), eventsFor(today()), meta, now, { dayStartMs: now - msIntoToday() }));
  }
  if (opening) deferredReport = report;
  else showReport(report);
  syncWarningWater();
  checkDyingExpiry();
}

/** The camera has arrived. Fade the interface in, then show anything the night left behind. */
let nestPending = { laid: false, hatched: false };

function flushNestToast(): void {
  const bird = state.nest?.egg?.bird;
  const name = bird ? animalName(bird) : tl('main.032');
  if (nestPending.laid) {
    const egg = state.nest?.egg;
    const hours = egg ? Math.max(1, Math.round((eggHatchAt(egg) - virtualNow()) / 3600_000)) : 6;
    toast(tl('nest.lay', { minH: NEST_MIN_HEALTH, bird: name, hours }));
  }
  if (nestPending.hatched) {
    const next = (state.nest?.hatched ?? 0) + 1;
    const build = nestBuildAt(next);
    const gift = build ? tl('main.034', { p0: nestBuildPhrase(build) }) : isNestHeightCount(next) ? tl('main.035') : tl('main.036');
    toast(tl('main.037', { name, gift }));
  }
  nestPending = { laid: false, hatched: false };
}

/** Lay today's one bird egg, or hatch it six hours later. The night's reward is paid at settlement. */
function syncNest(): void {
  if (!state.started || state.over) return;
  const ev = tickNest(state, virtualNow(), today());
  if (!ev.laid && !ev.hatched) return;
  if (ev.laid) nestPending.laid = true;
  if (ev.hatched) nestPending.hatched = true;
  persist();
  noteFirstEgg(ev.laid);
  if (!opening) flushNestToast();
}

/** 1.4.33: ads (and on iOS the consent / ATT prompts they trigger) wait ~1 s after the opening. */
let bannerTimer = 0;
function banner(on: boolean, delayMs = 0): void {
  window.clearTimeout(bannerTimer);
  bannerTimer = 0;
  if (!on || delayMs <= 0) {
    syncBanner(on);
    return;
  }
  bannerTimer = window.setTimeout(() => {
    bannerTimer = 0;
    syncBanner(true);
  }, delayMs);
}
const AFTER_OPENING_MS = 1000;

function finishOpening(): void {
  opening = false;
  noteIntro('end');
  document.documentElement.classList.remove('preplant');
  document.documentElement.classList.add('hud-in');
  banner(true, AFTER_OPENING_MS);
  window.setTimeout(releaseAudioExtras, AFTER_OPENING_MS);
  flushNestToast();
  const report = deferredReport;
  deferredReport = null;
  if (report) showReport(report);
  else maybeNestReveal();
}

/** Existing tree, at boot: keep the interface hidden (and night cards waiting) while the preload screen is up. */
function holdOpening(): void {
  opening = true;
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  banner(false);
}

/** After the preload screen: the planting far-to-near glide, music underneath, then the interface fades in. */
function beginOpening(): void {
  holdOpening();
  noteIntro('start');
  beginAmbience();
  if (scene3d) scene3d.beginIntro(reducedMotion, finishOpening);
  else window.setTimeout(finishOpening, reducedMotion ? 0 : 700);
}

/** v16: 瀕死 ends the moment its 24 hours are up (not at the next nightly settlement). */
function checkDyingExpiry(): void {
  if (!state.dying || state.over || virtualNow() - state.dying.at < DYING_MS) return;
  const res = resolveDyingExpiry(state, today(), meta, virtualNow(), clockOf(Date.now()));
  if (!res) return;
  persist();
  render();
  if (res === 'revived') toast(tl('sim.077'));
  if (state.over) handleOver();
}

/**
 * v12: apply today's 酷熱／毛毛雨／暴雨／黑雨 water the moment they are seen (HKO warning on refresh, reopening the app, or
 * developer manual weather). Each applies once per day (flags in the save); returns true when something changed.
 */
function syncWarningWater(): boolean {
  if (!state.started || state.over) return false;
  // Real weather: only what was actually seen today (HKO warnings / live detection), not forecast guesses — those
  // still count at the nightly settlement (and already show in 今晚預計). Manual developer weather counts at once.
  // v1.4.24: rain counts only when observed live (recorded in dayEvents[].rain); manual weather counts as observed.
  if (manual()) recordEvents(state, today(), [], false, todayEvents());
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
  const careBefore = careSig(state);
  const tzBefore = timezone;
  weather = snapshot;
  setLabelRegion(usesHko(snapshot) || usesSmg(snapshot) ? 'hk' : 'intl');
  timezone = snapshot.timezone || timezone;
  if (Date.now() < bootLogUntil || timezone !== tzBefore || today() !== before)
    slog.add(`weather ${snapshot.provider}/${snapshot.origin} tz ${tzBefore} → ${timezone} · today ${before} → ${today()}`, 'wx');
  queueMicrotask(() => {
    if (Date.now() < bootLogUntil || careSig(state) !== careBefore) logState(`after weather${careSig(state) !== careBefore ? ` CARE CHANGED (${careBefore} → ${careSig(state)})` : ''}`);
  });
  if (snapshot.origin === 'live') saveWeatherCache(snapshot);
  statusLine =
    snapshot.origin === 'live'
      ? tl('main.038', { p0: clockOf(snapshot.fetchedAt) })
      : snapshot.origin === 'cache'
        ? tl('main.040', { p0: snapshot.error ?? tl('main.039'), p1: clockOf(snapshot.fetchedAt) })
        : tl('main.041', { p0: snapshot.error ?? '' });
  reconcileClock();
  if (snapshot.provider !== 'sim' || snapshot.hko || snapshot.alerts) {
    const events = liveEvents();
    const had = state.dayEvents[today()]?.events ?? [];
    recordEvents(state, today(), events, officialActive(snapshot) || eventMode(snapshot) === 'feed', liveRain());
    const fresh = events.filter((e) => WEATHER_EVENTS[e].severe && !had.includes(e));
    const watered = today() === before && syncWarningWater();
    if (fresh.length && state.started && !manual() && !watered) toast(tl('main.043', { p0: warningSource(snapshot) || tl('main.042'), p1: fresh.map((e) => eventLabel(e)).join(tl('ui.206')) }));
  }
  if (state.started && !state.over) {
    const got = refreshUnlocks(state, { date: today(), events: todayEvents(), night: nightNow() });
    if (got.length) toast(tl('main.031', { p0: got.map(animalName).join(tl('ui.206')) }));
  }
  if (today() !== before) {
    const report = watchStep(`weather date change ${before} → ${today()}: catchUp`, () => catchUp(state, today(), eventsFor, meta, virtualNow(), msIntoToday(), nightNow()));
    showReport(report);
    syncWarningWater();
    scheduleReminders(false);
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
  return snapRegion(snapshot) === 'hk';
}

let refreshing: Promise<void> | null = null;
let refreshTimer = 0;
/** While the player stays in the game on their own location, take a new fix on this interval. */
const LOCATE_EVERY_MS = 10 * 60 * 1000;

/** Auto or 「用我所在位置」. A hand-picked district is not re-located. */
function usesDeviceLocation(): boolean {
  return !PLACES.some((p) => p.id === placeChoice);
}

function scheduleRefresh(ms: number): void {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (document.hidden) return;
    void refreshWeather(usesDeviceLocation());
  }, ms);
}

/** New GPS fix now, then again every 10 minutes for as long as the game stays open. */
function relocateNow(): void {
  if (!usesDeviceLocation() || document.hidden) return;
  void refreshWeather(true);
}

function refreshWeather(forceLocate = false): Promise<void> {
  if (refreshing) return refreshing;
  weatherLoading = true;
  statusLine = tl('ui.152');
  render();
  refreshing = loadWeather(forceLocate).finally(() => {
    refreshing = null;
    weatherLoading = false;
    render();
    const stay = usesDeviceLocation() ? LOCATE_EVERY_MS : WEATHER_TTL_MS;
    scheduleRefresh(weather.origin === 'live' ? stay : 2 * 60 * 1000);
  });
  return refreshing;
}

/**
 * One source for the place. Hong Kong uses the Observatory, Macau uses SMG, everywhere else
 * uses Open-Meteo. A bureau day does not keep the model's temperatures, rain or warning guess.
 * Sun times still come from Open-Meteo when it answered, because the bureaus don't send them.
 */
async function loadWeather(forceLocate: boolean): Promise<void> {
  const manual = findPlace(placeChoice);
  const reuseGeo = !forceLocate && weather.source === 'geo' && weather.choice === 'auto' && Date.now() - weather.fetchedAt < WEATHER_TTL_MS;
  const loc = manual
    ? { lat: manual.lat, lon: manual.lon, source: 'manual' as const }
    : reuseGeo
      ? { lat: weather.lat, lon: weather.lon, source: 'geo' as const }
      : await locate(8000);
  // 1.4.48: a preset is routed by its own region (Macau / Taiwan presets too), a GPS fix by where it is.
  const region = weatherRegion(loc.source, loc.lat, loc.lon, manual?.id);
  const macau = region === 'mo';
  const tw = region === 'tw';
  // Macau (SMG) and Taiwan (CWA) share one path: a bureau bundle in the HKO shape plus its own wind / rain readings.
  const mo = macau || tw;
  const bureauId: WeatherProvider = tw ? 'cwa' : 'smg';
  const bureauTz = tw ? 'Asia/Taipei' : 'Asia/Macau';
  const hk = region === 'hk';
  const intl = !hk && !mo;
  const [om, hkoRes, smgRes, placeRes, alertRes] = await Promise.allSettled([
    // 1.4.50: HK / Macau / Taiwan use only their bureau; the model (MET Norway) is for everywhere else.
    intl ? fetchForecast(loc.lat, loc.lon) : Promise.resolve(null),
    hk ? fetchHko(loc.lat, loc.lon) : Promise.resolve(null),
    tw ? fetchCwa(loc.lat, loc.lon) : mo ? fetchSmg(loc.lat, loc.lon) : Promise.resolve(null),
    loc.source === 'geo' ? reverseGeocode(loc.lat, loc.lon) : Promise.resolve(null),
    intl ? fetchOfficialAlerts(loc.lat, loc.lon) : Promise.resolve(null),
  ]);
  // 1.4.26 official alert feed (US / Canada / Japan / Europe). Unreachable → the last answer for about this spot (≤ 3 h).
  const prevAlerts = loadWeatherCache()?.alerts;
  const alerts: OfficialAlerts | null = !intl
    ? null
    : (alertRes.status === 'fulfilled' ? alertRes.value : null) ??
      (prevAlerts && Date.now() - prevAlerts.fetchedAt < 3 * 3600_000 && weather.lat !== undefined && Math.abs(weather.lat - loc.lat) < 0.1 && Math.abs(weather.lon - loc.lon) < 0.1 ? prevAlerts : null);
  const hko = hkoRes.status === 'fulfilled' ? hkoRes.value : null;
  const smg = smgRes.status === 'fulfilled' ? smgRes.value : null;
  let official = mo ? smg?.data ?? null : hko;
  if (official && (hk || mo)) official = fillHkoGaps(official, loadWeatherCache()?.hko);
  const found = placeRes.status === 'fulfilled' ? placeRes.value : null;
  // Taiwan: the CWA station's town (the same area its warnings are checked for) beats the reverse geocoder.
  const cwaPlace = tw && smg ? cwaArea()?.town || cwaArea()?.county || undefined : undefined;
  const place = manual?.name ?? cwaPlace ?? found?.name ?? (macau ? tl('main.044') : loc.source === 'fallback' || inHongKong(loc.lat, loc.lon) ? tl('ui.346') : tl('main.009'));
  // HKO rainfall is keyed by its Chinese district names, so a preset brings its own (not the translated label).
  const district = manual ? manual.rainDistrict : found?.district;
  const openMeteo = om.status === 'fulfilled' ? om.value : null; // MET Norway, Open-Meteo-shaped
  let base: ForecastResult | null = hk || mo ? null : openMeteo;
  let provider: WeatherProvider = 'met-no';
  const error = intl && om.status === 'rejected' ? (om.reason instanceof Error ? om.reason.message : tl('main.045')) : undefined;
  if (official && (hk || mo)) {
    const bureau = hkoForecast(official, today());
    if (bureau) {
      bureau.timezone = mo ? bureauTz : bureau.timezone;
      // Sun times computed locally (the bureaus don't send them; no model API here since 1.4.50).
      bureau.daily = bureau.daily.map((d) => {
        const s = sunForDate(loc.lat, loc.lon, d.date, bureau.timezone);
        return s ? { ...d, ...s } : d;
      });
      base = bureau;
      provider = mo ? bureauId : 'hko';
    }
  }
  if (!base) {
    const cached = loadWeatherCache();
    if (cached && cached.provider !== 'sim' && Date.now() - cached.fetchedAt < WEATHER_STALE_MS && !(hk || mo)) {
      applyWeather({ ...cached, origin: 'cache', error, hko: null, alerts, lat: loc.lat, lon: loc.lon, source: loc.source, place });
      return;
    }
    const kept = hk || mo ? official ?? cached?.hko ?? null : null;
    const bureau = kept ? hkoForecast(kept, today()) : null;
    if (cached && bureau && kept && (hk || mo) && Date.now() - cached.fetchedAt < WEATHER_STALE_MS) {
      applyWeather({
        ...cached,
        origin: 'cache',
        error,
        hko: kept,
        daily: bureau.daily,
        current: bureau.current,
        provider: mo ? bureauId : 'hko',
        rainInHours: null,
        lat: loc.lat,
        lon: loc.lon,
        source: loc.source,
        place,
        timezone: mo ? bureauTz : cached.timezone,
      });
      return;
    }
    applyWeather({ ...offlineSnapshot(today(), error ?? ''), hko: official, alerts, lat: loc.lat, lon: loc.lon, source: loc.source, place, choice: choiceKey() });
    return;
  }
  const snapshot: WeatherSnapshot = {
    lat: loc.lat,
    lon: loc.lon,
    timezone: mo ? bureauTz : base.timezone,
    place,
    source: loc.source,
    origin: 'live',
    fetchedAt: Date.now(),
    current: { ...base.current },
    daily: stampDays(base.daily, !(hk || mo), base.normals),
    normals: base.normals ?? null,
    model: provider === 'met-no' ? base.model : undefined,
    provider: mo && smg ? bureauId : provider,
    hko: official,
    district,
    rainInHours: provider === 'met-no' ? base.rainInHours : null,
    pastHours: provider === 'met-no' ? base.pastHours : undefined,
    alerts,
    choice: choiceKey(),
    error: provider === 'hko' || (mo && smg && om.status === 'rejected') ? error : undefined,
  };
  if (official?.current && (hk || (mo && smg))) {
    // Prefer what the bureau actually measured nearby over model values.
    if (official.current.tempC !== null) {
      snapshot.current.tempC = official.current.tempC;
      snapshot.station = official.current.station;
    }
    if (official.current.icon) {
      snapshot.current.code = hkoIconToWmo(official.current.icon);
      snapshot.conditionText = hkoIconLabel(official.current.icon);
    }
    if (official.current.humidity !== null) snapshot.current.humidity = official.current.humidity;
    if (smg) {
      if (smg.windKmh !== null) snapshot.current.windKmh = smg.windKmh;
      if (smg.gustKmh !== null) snapshot.current.gustKmh = smg.gustKmh;
      if (smg.precipMm !== null) snapshot.current.precipMm = Math.min(8, smg.precipMm);
      else if (official.current.icon && !hkoIconRain(official.current.icon)) snapshot.current.precipMm = 0;
    } else {
      const mm = districtRain(official, district);
      if (mm !== null) snapshot.current.precipMm = Math.min(8, mm);
      else if (official.current.icon && !hkoIconRain(official.current.icon)) snapshot.current.precipMm = 0;
      // The Observatory feed used here has no wind speed. Don't keep a stand-in from another source.
      snapshot.current.windKmh = 0;
      snapshot.current.gustKmh = 0;
    }
  }
  applyWeather(snapshot);
}

function openStart(): void {
  openModal(startModal(tl('sim.001'), meta, false, pick));
}

function openName(): void {
  openModal(nameModal(plantingSecond ? tl('main.023') : tl('sim.001')));
}

/** Species card is up, the HUD is hidden, and the camera sits on the far islands. */
function beginSpeciesPick(): void {
  plantingShow = 'pick';
  lesson = null;
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  banner(false);
  scene3d?.showFarIslands();
  openStart();
}

function revealHud(): void {
  plantingShow = null;
  document.documentElement.classList.remove('preplant');
  document.documentElement.classList.add('hud-in');
  banner(true, AFTER_OPENING_MS);
  window.setTimeout(releaseAudioExtras, AFTER_OPENING_MS);
  const tourNow = beginCoach();
  render();
  toast(coachOpen(coach) ? tl('main.046', { treeName: state.treeName }) : tl('main.026', { treeName: state.treeName }));
  if (tourNow && !pendingNote) window.setTimeout(() => openTour(0), 900);
  if (pendingNote) {
    const message = pendingNote;
    pendingNote = '';
    openModal(stormModal(message));
  }
}

/** The name card fades away before the camera starts moving. */
function dismissModal(then: () => void): void {
  closeModal(then);
}

function openLesson(id: LessonId): void {
  lesson = { id, page: 0 };
  openModal(lessonModal(id, 0), 'lesson');
}

function finishLesson(): void {
  const id = lesson?.id;
  lesson = null;
  closeModal();
  if (!id) return;
  if (id === 'health') {
    finishCoach('health');
    return;
  }
  finishCoach(id === 'water' ? 'water' : 'feed');
  if (coach.water && coach.feed && !coach.health && coachOpen(coach)) openLesson('health');
}

function startGame(species?: SpeciesId): void {
  if (plantingSecond) {
    plantSecond(species);
    return;
  }
  const input = document.getElementById('tree-name');
  const name = (input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '') || tl('sim.001');
  const wasStarted = state.started && !state.over;
  if (wasStarted) {
    state.treeName = name;
    persist();
    closeModal();
    render();
    return;
  }
  state = newGame(meta, realToday(), name, species);
  tab = 'care';
  // newGame wipes dayEvents. The weather card still shows a warning already loaded
  // (酷熱天氣警告 → 酷熱澆水); record it now or the status-card button stays hidden
  // until the next weather refresh (up to 30 minutes).
  if (!manual() && (weather.provider !== 'sim' || weather.hko || weather.alerts)) recordEvents(state, today(), liveEvents(), officialActive() || eventMode() === 'feed');
  persist();
  syncWarningWater();
  plantingShow = 'arrive';
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  banner(false);
  scene3d?.showFarIslands();
  render();
  dismissModal(() => {
    if (scene3d) scene3d.beginArrival(reducedMotion, revealHud);
    else window.setTimeout(revealHud, reducedMotion ? 0 : 700);
  });
}

/* ---------- Drawer and growth-log sheet ---------- */

/** v1.4.1 天氣概況: its own page (not one of the 樹木狀態 tabs). */
function renderWeatherPage(v: View): void {
  const panel = document.getElementById('wx-panel');
  if (!panel) return;
  const html = weatherPageHtml(v);
  if (panel.dataset.html === html) return;
  const scroll = panel.scrollTop;
  panel.innerHTML = html;
  panel.dataset.html = html;
  panel.scrollTop = scroll;
}

/** 1.4.59 每日小目標: pick today's three on the first look, pay +3 養分 once all are done. */
function syncGoals(): void {
  if (!state.started || state.over || manual()) return;
  const d = today();
  ensureGoals(state, d, { pest: state.pest.active, cold: todayEvents().includes('cold') });
  if (claimGoals(state, d)) {
    toast(tl('goals.toast', { n: GOAL_REWARD_N }));
    queueMicrotask(() => persist('goals'));
  }
}

/** 1.4.59 分享樹卡: capture the island, draw the card, open the share sheet (web: download). */
let sharingCard = false;
async function shareTreeCard(): Promise<void> {
  if (sharingCard || !state.started) return;
  sharingCard = true;
  try {
    const order: WeatherTrackId[] = ['t8', 'black', 'storm', 'rain', 'heat', 'cold'];
    const weather = order
      .map((id) => ({ id, n: state.wx?.counts?.[id] ?? 0 }))
      .filter((w) => w.n > 0)
      .slice(0, 3)
      .map((w) => tl('share.weather', { name: weatherTrackCopy(w.id).name, n: w.n }));
    const data = { treeName: state.treeName, species: speciesDef(state.species).name, age: tl('ui.073', { p0: shownAge(state), p1: '' }), height: formatHeight(state.heightCm), weather };
    const card = await drawShareCard(data, scene3d?.captureView() ?? null);
    const how = await shareCardImage(card);
    if (how === 'downloaded') toast(tl('share.saved'));
    else if (how === 'failed') toast(tl('share.failed'));
  } finally {
    sharingCard = false;
  }
}

function noteDailyGoal(id: 'weather' | 'scenery'): void {
  if (!state.started || state.over || manual()) return;
  if (noteGoal(state, today(), id)) {
    persist('goal-note');
    render();
  }
}

function openWeather(): void {
  if (!wxPage || !wxBackdrop) return;
  noteDailyGoal('weather');
  closeDrawer();
  setSheet(false);
  const close = document.getElementById('wx-close');
  if (close && !close.innerHTML) close.innerHTML = document.getElementById('drawer-close')?.innerHTML ?? '×';
  const panel = document.getElementById('wx-panel');
  if (panel) panel.scrollTop = 0;
  wxPage.hidden = false;
  wxBackdrop.hidden = false;
  requestAnimationFrame(() => {
    wxPage.classList.add('open');
    wxBackdrop.classList.add('open');
  });
  render();
}

function closeWeather(): void {
  if (!wxPage || !wxBackdrop || wxPage.hidden) return;
  wxPage.classList.remove('open');
  wxBackdrop.classList.remove('open');
  window.setTimeout(() => {
    if (!wxPage.classList.contains('open')) {
      wxPage.hidden = true;
      wxBackdrop.hidden = true;
    }
  }, 260);
}

function openDrawer(next: TabId, focus?: string): void {
  if (!drawer || !drawerBackdrop) return;
  tab = next;
  closeWeather();
  setSheet(false);
  drawer.hidden = false;
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  });
  render();
  if (focus) document.getElementById(`${focus}-card`)?.scrollIntoView({ block: 'start' });
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
  if (open) {
    openLogCalendar(today());
    renderSheet(state, today());
  }
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
  if (isle === 1 && !second && ['water', 'fertilize', 'deworm', 'drain', 'heat-water', 'rain-drain', 'warm-cover'].includes(action)) {
    toast(tl('main.047'));
    return;
  }
  if (action === 'water' || action === 'fertilize' || action === 'deworm' || action === 'drain') {
    // Flow first up to this moment, so the 1.4.41 grace window starts exactly at the tap.
    syncFlow();
    const result = performAction(state, action as CareAction, virtualNow(), nightNow());
    if (result.ok) lastAct[action] = Date.now();
    persist(`${action}${result.ok ? '' : ' (refused)'}`);
    render();
    toast(result.message);
    if (result.ok) target.classList.add('pop');
    if (result.ok && (action === 'water' || action === 'fertilize')) scene3d?.playCare(action);
    if (result.ok && action === 'water' && coachOpen(coach) && !coach.water) openLesson('water');
    if (result.ok && action === 'fertilize' && coachOpen(coach) && !coach.feed) openLesson('feed');
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
    case 'note-next':
    case 'note-toggle': {
      // v16.1 note stack: page to the next card / expand the text. Keep keyboard focus on the same control.
      const cls = action === 'note-next' ? 'nc-pager' : 'nc-title';
      const refocus = document.activeElement === target;
      if (action === 'note-next') noteNext();
      else noteToggle();
      render();
      if (refocus) document.querySelector<HTMLElement>(`#note-slot .${cls}`)?.focus();
      return;
    }
    case 'dismiss-note':
      state.morningNote = null;
      persist();
      render();
      return;
    case 'retry-weather':
      toast(tl('main.048'));
      void refreshWeather(false);
      return;
    case 'coach-skip':
      lesson = null;
      finishCoach('skip');
      return;
    case 'pick-species':
      openName();
      return;
    case 'back-species':
      openModal(startModal(plantingSecond ? tl('main.023') : tl('sim.001'), meta, false, pick));
      return;
    case 'tour-next':
      if (tourPage === null) return;
      tourPage = Math.min(TOUR_PAGES - 1, tourPage + 1);
      updateModal(tourModal(tourPage));
      return;
    case 'tour-skip':
    case 'tour-done':
      endTour();
      return;
    case 'tour-replay':
      openTour(0);
      return;
    case 'share-card':
      void shareTreeCard();
      return;
    case 'lesson-next':
      if (!lesson) return;
      lesson = { id: lesson.id, page: lesson.page + 1 };
      updateModal(lessonModal(lesson.id, lesson.page));
      return;
    case 'lesson-done':
      finishLesson();
      return;
    case 'locate':
      openPerms(); // asked for by the player
      placeChoice = 'geo';
      kvSet(PLACE_KEY, placeChoice);
      void refreshWeather(true);
      return;
    case 'rename':
      openModal(startModal(state.treeName, meta, true));
      return;
    case 'guide':
      openModal(guideModal((target?.dataset.tab as GuideTab | undefined) ?? 'play'));
      return;
    case 'export-save':
      // 1.4.54 「備份存檔」: the platform note shows every time, then the code.
      openModal(backupModal(backupPlatform()));
      return;
    case 'export-save-code':
      void exportSave();
      return;
    case 'cloud-restore':
    case 'cloud-keep': {
      const answer = cloudAnswer;
      cloudAnswer = null;
      if (action === 'cloud-restore') importing = true;
      closeModal();
      answer?.(action === 'cloud-restore');
      return;
    }
    case 'diag-copy':
      void copyText(diagText()).then((ok) => toast(ok ? tl('main.049') : tl('main.050')));
      return;
    case 'diag-clear-log':
      slog.clear();
      slog.add(`log cleared · ${sumState(state)}`, 'clear');
      updateModal(diagModal(diagText()));
      toast(tl('diag.cleared'));
      return;
    case 'diag-refresh':
      updateModal(diagModal(diagText()));
      return;
    case 'copy-save':
      void copyText(saveCodeText()).then((ok) => toast(ok ? tl('main.049') : tl('main.050')));
      return;
    case 'share-save':
      void shareText(saveCodeText());
      return;
    case 'import-save':
      openModal(importSaveModal());
      return;
    case 'do-import-save':
      void importSave();
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
      openModal(settingsModal(state.treeName, isNative() ? notifyEnabled() : null));
      return;
    case 'disclaimer':
      openModal(disclaimerModal());
      return;
    case 'credits':
      openModal(creditsModal());
      return;
    case 'weather':
      openWeather();
      break;
    case 'close-weather':
      closeWeather();
      break;
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
    case 'plant-isle':
      plantingSecond = true;
      openModal(startModal(tl('main.023'), meta, false, pick));
      return;
    case 'close-modal':
      plantingSecond = false;
      closeModal();
      maybeExplainWind();
      return;
    case 'hatch-card':
      // 1.4.53: the countdown card opens the egg pop-up (countdown, reward, keep warm); the rules are a button inside it.
      openEggModal();
      return;
    case 'nest-intro': {
      const id = state.nest?.egg?.bird;
      openModal(nestIntroModal(id ? nestBirdName(id) : tl('main.032')));
      return;
    }
    case 'warm-egg': {
      const res = warmEgg(state, virtualNow());
      if (!res.ok) {
        refreshEggModal();
        return;
      }
      persist();
      syncHatchCard(state);
      scheduleReminders(false);
      const bird = state.nest?.egg ? nestBirdName(state.nest.egg.bird) : tl('main.032');
      toast(tl('nest.warmToast', { bird }));
      refreshEggModal();
      render();
      return;
    }
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

/**
 * v16.1: the left-edge buttons (島上動物, developer wrench) sit below the weather card + note stack — CSS reads the
 * column's bottom edge from --lc-bottom, kept up to date as the cards change height.
 */
function trackLeftColumn(): void {
  const col = document.querySelector<HTMLElement>('.left-col');
  if (!col) return;
  let last = -1;
  const sync = () => {
    const b = Math.round(col.getBoundingClientRect().bottom);
    if (b === last) return;
    last = b;
    document.documentElement.style.setProperty('--lc-bottom', `${b}px`);
  };
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(col);
  window.addEventListener('resize', sync);
  sync();
}
trackLeftColumn();

/** v1.4.19: the static shell in index.html is written in zh-HK; relabel it for the player's language. */
function localizeStatic(): void {
  document.title = tl('sim.001');
  document.querySelector('meta[name="description"]')?.setAttribute('content', tl('html.desc'));
  const label: [string, string][] = [
    ['#scene', 'html.scene'],
    ['#status-card', 'html.status'],
    ['#rail', 'html.rail'],
    ['#view-reset', 'main.064'],
    ['#sheet', 'ui.185'],
    ['#gear', 'html.settings'],
    ['#sheet-share', 'share.button'],
    ['#dock', 'html.dock'],
    ['#drawer', 'html.drawer'],
    ['#drawer-close', 'html.close'],
    ['#wx-page', 'html.weather'],
    ['#wx-close', 'html.close'],
    ['#ad-banner', 'html.ad'],
  ];
  for (const [sel, key] of label) document.querySelector(sel)?.setAttribute('aria-label', tl(key));
  const text: [string, string][] = [
    ['#zoom-hint', 'html.zoomHint'],
    ['#sheet-title', 'ui.185'],
    ['#ad-banner .ad-slot', 'html.ad'],
  ];
  for (const [sel, key] of text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = tl(key);
  }
}
localizeStatic();
wakeIsleBar();

/**
 * 1.4.30 wordless island bar: faint when idle, solid while touched / hovered, fades back after.
 * Swipe left on the bar → second island, right → first (only on the bar; the scene never switches islands).
 */
function wakeIsleBar(): void {
  const bar = document.getElementById('isle-bar');
  if (!bar) return;
  let timer = 0;
  let mouseOver = false;
  let drag: { id: number; x: number; dx: number } | null = null;
  const track = () => bar.querySelector<HTMLElement>('.isle-track');
  const wake = () => {
    window.clearTimeout(timer);
    bar.classList.add('awake');
  };
  const rest = (ms: number) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (!mouseOver && !drag) bar.classList.remove('awake');
    }, ms);
  };
  const bounce = () => {
    bar.classList.remove('bounce');
    void bar.offsetWidth;
    bar.classList.add('bounce');
  };
  const release = (e: PointerEvent, cancel: boolean) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = drag.dx;
    drag = null;
    bar.classList.remove('dragging');
    const t = track();
    if (t) t.style.transform = '';
    rest(1600);
    if (cancel || Math.abs(dx) < 24) return;
    const to: 0 | 1 = dx < 0 ? 1 : 0;
    if (to === isle || (to === 1 && !canOpenSecond(homeTree()))) bounce();
    switchIsle(to);
  };
  bar.addEventListener('pointerenter', (e) => {
    mouseOver = e.pointerType === 'mouse';
    wake();
  });
  bar.addEventListener('pointerleave', () => {
    mouseOver = false;
    rest(900);
  });
  bar.addEventListener('pointerdown', (e) => {
    wake();
    drag = { id: e.pointerId, x: e.clientX, dx: 0 };
    bar.setPointerCapture(e.pointerId);
    bar.classList.add('dragging');
    e.preventDefault();
  });
  bar.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x;
    const t = track();
    // Follow the finger a little (rubber band), so the swipe feels attached to the bar.
    if (t) t.style.transform = `translateX(${Math.max(-18, Math.min(18, drag.dx * 0.35))}px)`;
  });
  bar.addEventListener('pointerup', (e) => release(e, false));
  bar.addEventListener('pointercancel', (e) => release(e, true));
  bar.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    wake();
    rest(1600);
    const to: 0 | 1 = e.key === 'ArrowLeft' ? 1 : 0;
    if (to === isle || (to === 1 && !canOpenSecond(homeTree()))) bounce();
    switchIsle(to);
  });
  bar.addEventListener('focusin', () => {
    if (bar.matches(':focus-visible')) wake();
  });
  bar.addEventListener('focusout', () => rest(900));
}

// Language picker (設定). 1.4.41: applied in place — no reload. The import-time tables are rebuilt in the new language
// (switchLocale), then every visible surface re-renders; game state, the 3D scene and audio keep running.
document.addEventListener('change', (event) => {
  const sel = (event.target as HTMLElement | null)?.closest<HTMLSelectElement>('select[data-lang-select]');
  if (!sel || !isLocaleId(sel.value) || sel.value === getLocale()) return;
  applyLocale(sel.value);
});

// 1.4.55 高度單位 (設定): applied in place like a language change — the import-time tables (species facts, labels) are
// rebuilt so their lengths follow, then everything visible re-renders.
document.addEventListener('change', (event) => {
  const sel = (event.target as HTMLElement | null)?.closest<HTMLSelectElement>('select[data-unit-select]');
  if (!sel || !isHeightUnit(sel.value) || sel.value === getHeightUnit()) return;
  applyHeightUnit(sel.value);
});

function applyHeightUnit(u: HeightUnit): void {
  saveHeightUnit(u);
  useHeightUnit(u);
  switchLocale(getLocale());
  localizeStatic();
  render();
  doAction('settings', document.body);
  // Reminder texts that mention heights are rebuilt in the new unit.
  scheduleReminders(false);
}

function applyLocale(l: Locale): void {
  saveLocale(l);
  switchLocale(l);
  localizeStatic();
  persist();
  render();
  // Settings is where the picker lives: reopen it in the new language (keeps the modal, no flicker of the game).
  doAction('settings', document.body);
  // Local reminders + push-server state carry the new language; weather text (HKO / SMG wording) is re-fetched in it.
  scheduleReminders(false);
  void refreshWeather();
}

document.addEventListener('click', (event) => {
  const el = event.target instanceof Element ? event.target : null;
  if (!el) return;
  if (el.closest('#dev-root')) return;
  const target = el.closest<HTMLElement>('[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality], [data-sound], [data-species], [data-album-mode], [data-guide], [data-notify], [data-headsup], [data-cal], [data-cal-nav]');
  if (!target) {
    // v1.4.1: a tap anywhere on the 樹木狀態 card opens its pop box (照顧／圖鑑／里程碑).
    if (el.closest('#status-card') && state.started && !state.over) {
      playControl();
      openDrawer('care');
    }
    return;
  }
  if (target.getAttribute('aria-disabled') === 'true') return;
  if (target.dataset.sound !== '0' && target.dataset.sound !== '1') playControl(target.dataset.action);
  const inModal = Boolean(target.closest('#modal'));
  if ((!state.started || state.over) && !inModal) return;
  if (target.dataset.species) {
    const nameEl = document.getElementById('tree-name');
    const name = nameEl instanceof HTMLInputElement ? nameEl.value : tl('sim.001');
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
    openDrawer(target.dataset.open as TabId, target.dataset.focus);
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
    if (placeChoice === 'geo') openPerms(); // asked for by the player
    kvSet(PLACE_KEY, placeChoice);
    closeModal();
    const name = PLACES.find((p) => p.id === placeChoice)?.name ?? tl('main.051');
    toast(tl('main.052', { name }));
    void refreshWeather(placeChoice === 'geo');
    return;
  }
  if (target.dataset.guide) {
    openModal(guideModal(target.dataset.guide as GuideTab));
    document.querySelector('.modal-card')?.scrollTo({ top: 0 });
    return;
  }
  if (target.dataset.notify === 'on' || target.dataset.notify === 'off') {
    kvSet(NOTIFY_KEY, target.dataset.notify === 'on' ? '1' : '0');
    if (target.dataset.notify === 'on') openPerms(); // asked for by the player
    scheduleReminders(false);
    void syncPush(target.dataset.notify === 'on');
    const row = target.closest('.seg');
    row?.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.notify === target.dataset.notify;
      btn.classList.toggle('on', on);
    });
    return;
  }
  if (target.dataset.headsup === 'on' || target.dataset.headsup === 'off') {
    kvSet(HEADSUP_KEY, target.dataset.headsup === 'on' ? '1' : '0');
    scheduleReminders(false); // re-sends /state with the new choice
    target.closest('.seg')?.querySelectorAll<HTMLElement>('button').forEach((btn) => btn.classList.toggle('on', btn.dataset.headsup === target.dataset.headsup));
    return;
  }
  if (target.dataset.quality === 'low' || target.dataset.quality === 'high') {
    quality = target.dataset.quality;
    kvSet(QUALITY_KEY, quality);
    scene3d?.setQuality(quality);
    return;
  }
  if (target.dataset.sound === '0' || target.dataset.sound === '1') {
    setSoundEnabled(target.dataset.sound === '1');
    const row = target.closest('.seg');
    row?.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.sound === target.dataset.sound;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    return;
  }
  if (target.dataset.cal) {
    selectLogDay(target.dataset.cal);
    renderSheet(state, today());
    const body = document.getElementById('sheet-body');
    const head = body?.querySelector('.log-day');
    if (body && head) {
      const top = head.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
      body.scrollTop = Math.max(0, top - 8);
    }
    return;
  }
  if (target.dataset.calNav) {
    moveLogMonth(target.dataset.calNav === 'next' ? 1 : -1, today());
    renderSheet(state, today());
    const body = document.getElementById('sheet-body');
    if (body) body.scrollTop = 0;
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
  if (wxPage && !wxPage.hidden) closeWeather();
  else if (drawer && !drawer.hidden) closeDrawer();
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
  /** Developer preview: set how many eggs have hatched, so the island decorations update. */
  setHatched: (n: number) => void;
  /** Put the hatch count back to what it was before the first preview change this session. */
  restoreHatched: () => void;
  /** Camera / scale readout: zoom, camera distance (m), island scale, tree height (m), fence radius (m). */
  viewInfo: () => { zoom: number; distM: number; islandK: number; treeM: number; fenceRadius: number; islandRadius: number } | null;
  habitatInfo: () => string;
  sway: () => number;
}

if (DEV_PANEL) {
  /** Hatch count before the first preview change, so 還原 can put the tree back. */
  let hatchBeforePreview: number | null = null;

  function applyHatched(n: number, remember: boolean, announce: boolean): void {
    if (!state.started || state.over) {
      toast(tl('main.053'));
      return;
    }
    const nest = (state.nest ??= freshNest());
    if (remember && hatchBeforePreview === null) hatchBeforePreview = nest.hatched;
    const next = Math.max(0, Math.round(n));
    nest.hatched = next;
    nest.awards = nest.awards.filter((a) => a.count <= next);
    persist();
    render();
    if (!announce) return;
    const built = nestBuilds(next);
    toast(built.length ? tl('main.054', { next, p1: built.map(nestBuildPhrase).join(tl('ui.206')) }) : tl('main.055', { next }));
  }

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
      const report = advanceVirtualDay(state, today(), eventsFor(today()), meta, virtualNow(), nightNow());
      showReport(report);
      syncWarningWater();
    },
    advanceDays: (n) => {
      if (state.over) return;
      const all: CatchupReport[] = [];
      for (let i = 0; i < n && !state.over; i++) all.push(advanceVirtualDay(state, today(), eventsFor(today()), meta, virtualNow(), nightNow()));
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
      toast(tl('main.056'));
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
      const report = advanceVirtualDay(state, today(), ['typhoon8'], meta, virtualNow(), nightNow());
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
      clearGrove();
      clearCoach();
      coach = freshCoach();
      state = createGame(realToday());
      home = state;
      second = null;
      isle = 0;
      plantingSecond = false;
      pendingNote = '';
      closeModal();
      closeDrawer();
      closeWeather();
      setSheet(false);
      persist();
      render();
      beginSpeciesPick();
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
      toast(tl('main.057', { length: ANIMALS.length }));
    },
    ecoInfo: () => (scene3d?.animalInfo() ?? []).map((g) => ({ id: g.id, name: animalName(g.id), count: g.count, resident: g.resident })),
    ecoCaps: () => scene3d?.animalCaps() ?? null,
    followAnimal: (id) => scene3d?.followAnimal(id),
    setHatched: (n) => applyHatched(n, true, true),
    restoreHatched: () => {
      if (hatchBeforePreview === null) {
        toast(tl('main.058'));
        return;
      }
      const back = hatchBeforePreview;
      hatchBeforePreview = null;
      applyHatched(back, false, false);
      toast(tl('main.059'));
    },
    viewInfo: () => (scene3d ? { ...scene3d.cameraInfo(), ...scene3d.fenceInfo() } : null),
    habitatInfo: () => {
      const input = sceneInput();
      const island = input.islandStage ?? input.stage;
      const h = habitatDef(input.species);
      const feats = habitatFeatures(input.species, island).map((f) => FEATURE_LABEL[f]);
      return tl('main.062', { p0: STAGE_NAMES[island], p1: islandRadius(island), name: h.name, p3: feats.length ? tl('main.060', { p0: feats.join(tl('ui.206')) }) : tl('main.061') });
    },
    sway: () => swayLevel(todayCond()),
  };
  (window as unknown as { __tree?: unknown }).__tree = {
    viewInfo: api.viewInfo,
    zoomBy: (f: number, x?: number, y?: number) => scene3d?.zoomBy(f, x, y),
    resetView: () => scene3d?.resetView(),
    fadeInfo: () => scene3d?.fadeInfo() ?? null,
    viewState: () => scene3d?.viewState(),
    camTrace: () => scene3d?.camTrace() ?? [],
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
/** How long 「返回全景」 stays after the last zoom, pan, or follow gesture. */
const VIEW_BTN_MS = 2800;
/** Fade 「返回全景」 in only while the player is adjusting a zoomed or follow view. */
function syncViewButton(): void {
  if (!scene3d) return;
  if (!hintShown && plantingShow === null && state.started && !state.over && document.getElementById('modal')?.hidden) {
    hintShown = true;
    kvSet('sekai-tree-zoom-hint', '1');
    const hint = document.getElementById('zoom-hint');
    if (hint) {
      hint.hidden = false;
      window.setTimeout(() => (hint.hidden = true), 9000);
    }
  }
  const v = scene3d.viewState();
  const btn = document.getElementById('view-reset');
  if (!btn) return;
  const key = `${v.active}|${v.following ?? ''}`;
  if (key !== viewKey) {
    viewKey = key;
    btn.innerHTML = tl('main.065', { locate: ICONS.locate, p1: v.following ? tl('main.063', { p0: esc(v.following) }) : tl('main.064') });
    if (v.active) document.getElementById('zoom-hint')?.setAttribute('hidden', '');
  }
  const want = v.active && plantingShow === null && performance.now() - scene3d.viewNudgedAt() < VIEW_BTN_MS;
  if (want && btn.hidden) {
    btn.hidden = false;
    btn.classList.remove('on');
  } else {
    btn.classList.toggle('on', want);
  }
  btn.setAttribute('aria-hidden', want ? 'false' : 'true');
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
  animalHud.setEnabled(plantingShow === null && state.started && !state.over && !busy && Boolean(document.getElementById('modal')?.hidden));
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

let nestTickAt = 0;
let flowKey = '';
let flowSavedAt = 0;

/**
 * v1.4.17: 水分／養分／抗風力 drift with real time (健康 still settles at midnight, v1.4.18). Called every second, after the
 * catch-up on open/resume; closed-app time is caught up in 15-minute steps inside advanceFlow.
 */
let firstTickLogged = false;
function syncFlow(force = false, trigger = 'tick'): void {
  // v1.4.18: 水分／養分／抗風力 drift; 健康 itself only changes at the midnight settlement.
  if (!state.started || state.over) return;
  if (state.lastSeenDate !== today()) {
    runCatchup(`date change in ${trigger}`); // midnight passed while open: settle last night first (it also starts today's flow)
    return;
  }
  if (!firstTickLogged && trigger === 'tick') {
    firstTickLogged = true;
    queueMicrotask(() => logState('after first tick'));
  }
  const now = virtualNow();
  advanceFlow(state, today(), eventsFor(today()), meta, now, { dayStartMs: now - msIntoToday() });
  if (state.dying && !state.dying.at) state.dying.at = now;
  // The clock hour is part of the key so the 澆水 button reopens when a new hour starts (2 taps per hour, v1.4.23).
  const key = [state.health, state.moisture, state.nutrients, state.resist].map((x) => Math.round(x)).join(',') + (state.dying ? 'd' : '') + waterHourKey(state);
  const changed = key !== flowKey;
  flowKey = key;
  if (changed || force || Date.now() - flowSavedAt > 30_000) {
    flowSavedAt = Date.now();
    if (importing) return;
    syncGrove();
    saveGame(isle === 1 && second ? second : home);
    saveGrove({ isle, home, second });
    logSave(trigger === 'tick' && force ? 'tick(forced)' : trigger);
    if (changed) {
      scheduleReminders(false);
      render();
    }
  }
}

/** One rAF chain only (visibility changes used to be able to start a second one, drawing twice per frame). */
let rafId = 0;
/** 1.4.34: the first (heavy) scene build waits until the preload icon has painted and its animation runs. */
let loopHeld = true;
function loop(): void {
  if (!loopHeld && !rafId && !document.hidden) rafId = requestAnimationFrame(frame);
}

function frame(time: number): void {
  rafId = 0;
  noteFrame(time, scene3d?.introRunning() ?? false);
  const input = sceneInput();
  if (time - nestTickAt > 1000) {
    nestTickAt = time;
    syncFlow();
    syncNest();
    // Keeps the card in step with the nest; the card's own 1 s timer does the ticking (v1.4.16).
    syncHatchCard(state);
  }
  syncAmbience(input.daylight < 0.45, manual() ? todayEvents() : liveEvents());
  drawScene(input, time);
  syncViewButton();
  syncAnimalHud(time);
  // Keep the clock-driven chrome (countdowns, night styling) fresh without re-rendering every frame.
  if (time - lastChrome > 15000) {
    lastChrome = time;
    renderChrome(view(input));
  }
  checkDyingExpiry();
  loop();
}

document.addEventListener('visibilitychange', () => {
  setPageAudible(!document.hidden);
  slog.add(`life: visibilitychange ${document.visibilityState}`, 'life');
  if (document.hidden) {
    saveNow('visibility hidden');
    scheduleReminders(true);
    return;
  }
  resetFrameClock();
  loop();
  runCatchup('visible');
  resumeCloud();
  maybeNestReveal();
  if (usesDeviceLocation()) {
    relocateNow();
    return;
  }
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
if (isNative()) {
  void App.addListener('pause', () => {
    slog.add('life: App pause', 'life');
    saveNow('App pause');
    scheduleReminders(true);
  });
  void App.addListener('resume', () => {
    slog.add('life: App resume', 'life');
    relocateNow();
  });
  void App.addListener('appStateChange', ({ isActive }) => {
    slog.add(`life: appStateChange ${isActive ? 'active' : 'inactive'}`, 'life');
    // 1.4.44: on iPhone this is the only event before a swipe-kill from the app switcher.
    if (!isActive) saveNow('appStateChange inactive');
  });
  scheduleReminders(false);
  void syncPush(notifyEnabled());
}
noteFirstEgg(false);
setOnModalClosed(() => {
  stopEggModalTick();
  maybeNestReveal();
});
document.getElementById('hatch-card')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  const card = event.currentTarget;
  if (card instanceof HTMLElement) doAction('hatch-card', card);
});

const startedAtBoot = state.started;
// 1.4.54 iCloud: ask about a conflicting cloud save once the UI can show it; upload once linked.
startCloud({
  ask: askCloud,
  reload: () => {
    importing = true;
    void flushPersist().then(() => location.reload());
  },
});
if (!startedAtBoot) beginSpeciesPick();
else holdOpening();
runCatchup('launch');
syncNest();
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    loopHeld = false;
    loop();
  }),
);
if (usesDeviceLocation()) {
  if (weather.origin === 'live' && !weatherLoading) applyWeather(weather);
  relocateNow();
} else if (weather.origin === 'live' && !weatherLoading) {
  applyWeather(weather);
  scheduleRefresh(Math.max(5000, WEATHER_TTL_MS - (Date.now() - weather.fetchedAt)));
} else {
  void refreshWeather(false);
}
for (const ev of ['pointerup', 'touchend', 'keydown'] as const) document.addEventListener(ev, kickAudio, { passive: true, capture: true });
// 1.4.58 MeteoAlarm terms: re-used warnings must not lag more than 10 min, so in Europe the alerts (only) refresh
// every 4 min while the game is open (1.4.60; was 5). Other feeds keep the normal weather refresh.
let feedAlertsBusy = false;
window.setInterval(() => {
  const a = weather.alerts;
  if (feedAlertsBusy || refreshing || document.hidden || manual() || a?.source !== 'meteoalarm' || weather.origin !== 'live') return;
  if (Date.now() - a.fetchedAt < MA_REFRESH_MS) return;
  feedAlertsBusy = true;
  const at = { lat: weather.lat, lon: weather.lon };
  void fetchOfficialAlerts(at.lat, at.lon)
    .then((next) => {
      if (next && !refreshing && weather.lat === at.lat && weather.lon === at.lon) applyWeather({ ...weather, alerts: next });
    })
    .finally(() => {
      feedAlertsBusy = false;
    });
}, 60_000);

/**
 * 1.4.33 preload: the swaying-sapling screen stays up while the scene's shaders compile, the music for the time
 * of day decodes and the weather arrives (capped at ~5 s), then the opening glide starts.
 */
async function preloadThenOpen(): Promise<void> {
  const weatherJob = refreshing;
  await runPreload([
    {
      name: 'scene',
      run: async () => {
        await frames(4);
        if (!scene3d) return 'flat';
        return `${await scene3d.warmUp()} ms compile`;
      },
    },
    { name: 'music', run: () => preloadAudio(sceneInput().daylight < 0.45).then(() => audioDiag().files.map((f) => `${f.id}:${f.state}`).join(' ')) },
    { name: 'weather', run: () => (weatherJob ?? Promise.resolve()).then(() => weather.origin) },
  ]);
  // 1.4.34: put the camera on the opening vista first, so the fade reveals the shot the glide starts from
  // (the hold phase of the intro covers the fade), instead of fading to one view and cutting to another.
  if (startedAtBoot && state.started && opening) beginOpening();
  else if (!startedAtBoot) window.setTimeout(releaseAudioExtras, AFTER_OPENING_MS);
  await hidePreload();
}
void preloadThenOpen();

/** 1.4.33 hidden readout: long-press the version line in 設定. */
function diagText(): string {
  const a = audioDiag();
  const r = scene3d?.renderDiag();
  const lines = [
    `World Tree ${APP_VERSION} · ${isNative() ? 'app' : 'web'} · ${navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 120)}`,
    `screen ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}` + (r ? ` · render ${r.width}x${r.height} @${r.pixelRatio} ${r.quality} · programs ${r.programs} · calls ${r.calls} · tris ${r.tris}` : ' · 2D'),
    ...frameReport(scene3d?.zeroDtFrames ?? 0),
    `audio ${a.state} ${a.sampleRate} Hz t=${a.currentTime}s · sound ${a.sound ? 'on' : 'off'} · unlocked ${a.unlocked} · extras ${a.extras} · music ${a.music}`,
    `audio states: ${a.states.join(', ') || '-'}`,
    ...a.files.map((f) => `  ${f.id}: ${f.state}${f.file ? ` ${f.file}` : ''}${f.ms !== undefined ? ` ${f.ms} ms` : ''}${f.seconds ? ` ${f.seconds}s` : ''}${f.error ? ` — ${f.error}` : ''}`),
    `uptime ${((performance.now() - diag.bootAt) / 1000).toFixed(1)}s`,
    (() => {
      const j = scene3d?.camJump();
      return j ? `opening camera: ${j.frames} frames · largest step ${(j.maxRel * 100).toFixed(1)}% of distance (${j.at})` : 'opening camera: -';
    })(),
    `permission prompts: ${permsReady() ? 'allowed' : 'waiting for onboarding'}`,
    `now ${new Date().toString().slice(0, 33)} · tz ${timezone} · today ${today()} · isle ${isle}`,
    `state ${sumState(state)}`,
    ...cloudDiagLines(),
    `stamp local ${stampText(localStorage.getItem(STAMP_KEY) ?? undefined)} · native queue ${hydrateInfo.native ? `${nativeQueue.busySince ? `BUSY ${Math.round((Date.now() - nativeQueue.busySince) / 1000)}s` : 'idle'} · pending ${nativeQueue.pending} · batches ${nativeQueue.batches} · failed ${nativeQueue.fails}` : 'n/a (web)'}`,
    '--- save / load log (newest last) ---',
    slog.text(),
  ];
  return lines.join('\n');
}

let diagPress = 0;
document.addEventListener('pointerdown', (e) => {
  const el = (e.target as HTMLElement | null)?.closest?.('.set-ver');
  if (!el) return;
  window.clearTimeout(diagPress);
  diagPress = window.setTimeout(() => openModal(diagModal(diagText())), 700);
});
for (const ev of ['pointerup', 'pointercancel', 'pointerleave'] as const) document.addEventListener(ev, () => window.clearTimeout(diagPress));
