import './style.css';
import { EVENT_ORDER, PREPS, WEATHER_EVENTS, type PrepId, type WeatherEventId } from './balance';
import { clockMinutes, daysBetween, formatDateInTz, isoMinutes } from './dates';
import { condForEvent, currentEvents, sceneCond, severeCountdown, type Countdown } from './events';
import { DEV_PANEL } from './flags';
import { ICONS } from './icons';
import { esc } from './util';
import { bookGameEnd, bookMilestones, bookNest, bookWeather, loadMeta, newGame, saveMeta } from './meta';
import { Scene, daylightFactor, type SceneInput } from './render';
import { pickEvent } from './rules';
import { mulchLaid } from './campfire';
import { eventLabel, regionFor, setLabelRegion } from './labels';
import { Scene3D, type Quality } from './three/scene3d';
import type { EcoCaps } from './three/animals3d';
import { mountAnimalHud, type AnimalHud } from './animalHud';
import { beginAmbience, playCelebrate, playControl, setPageAudible, setSoundEnabled, syncAmbience } from './audio';
import { freshNest, isNestHeightCount, nestBuildAt, nestBuildPhrase, nestBuilds, nestHatchAt, nestPhase, tickNest } from './nest';
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
import { canOpenSecond, clearGrove, isleAward, loadGrove, saveGrove } from './grove';
import { armCoach, clearCoach, coachFocus, coachOpen, freshCoach, loadCoach, markCoach, saveCoach, type Coach } from './coach';
import { META_KEY } from './meta';
import type { DayCond, GameState, TabId } from './types';
import {
  PLACES,
  animalName,
  closeModal,
  locationModal,
  noteNext,
  noteToggle,
  openModal,
  overModal,
  milestoneModal,
  weatherModal,
  renderChrome,
  syncHatchCard,
  renderPanel,
  weatherPageHtml,
  renderSheet,
  openLogCalendar,
  selectLogDay,
  moveLogMonth,
  setThumbnailer,
  settingsModal,
  disclaimerModal,
  privacyModal,
  exportSaveModal,
  importSaveModal,
  startModal,
  nameModal,
  lessonModal,
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
  stampDays,
  inHongKong,
  inMacau,
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
import { fetchHko, fillHkoGaps, hkoIconLabel, hkoIconRain, hkoIconToWmo } from './hko';
import { fetchSmg } from './smg';
import { cwaArea, fetchCwa, inTaiwan } from './cwa';
import { reverseGeocode } from './place';
import { defaultDev, loadDev, saveDev, type DevSettings } from './dev/settings';
import { syncBanner } from './native/banner';
import { isNative } from './native/platform';
import { flushPersist, hydrateNative } from './native/persist';
import { decodeSave, encodeSave } from './saveCode';
import { guideModal, type GuideTab } from './guide';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { NOTIFY_KEY, applyNotifications, notifyEnabled, planNotifications } from './native/notify';
import { App } from '@capacitor/app';
import { reportPushState, syncPush } from './native/push';

const PLACE_KEY = 'yiri-yisyu-place';
const QUALITY_KEY = 'yiri-yisyu-quality';

// Android app: load the save from native Preferences into localStorage before anything reads it (web: no-op).
await hydrateNative();

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
/** Species picker opened to plant on the empty second island, not to rename or restart. */
let plantingSecond = false;
let dev: DevSettings = DEV_PANEL ? loadDev() : defaultDev();
let tab: TabId = 'care';
let placeChoice = localStorage.getItem(PLACE_KEY) ?? '';
let weather: WeatherSnapshot = initialWeather();
let weatherLoading = weather.provider === 'sim';
setLabelRegion(regionFor(weather.source, nearHongKong(weather.lat, weather.lon), inMacau(weather.lat, weather.lon)));
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
  scene3d.onIslandSwipe = (dx) => handleIslandSwipe(dx);
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
const wxPage = document.getElementById('wx-page');
const wxBackdrop = document.getElementById('wx-backdrop');
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

function usesSmg(snapshot: WeatherSnapshot = weather): boolean {
  return snapshot.source === 'geo' && inMacau(snapshot.lat, snapshot.lon);
}

/** v1.4.14: a device location in Taiwan uses 中央氣象署 (via the push server) for weather and warnings. */
function usesCwa(snapshot: WeatherSnapshot = weather): boolean {
  return snapshot.source === 'geo' && inTaiwan(snapshot.lat, snapshot.lon);
}

/** Official warnings (HKO, SMG or CWA) decide severe weather, rather than model numbers. */
function officialActive(snapshot: WeatherSnapshot = weather): boolean {
  return Boolean(snapshot.hko) && (usesHko(snapshot) || usesSmg(snapshot) || usesCwa(snapshot));
}

/** Events happening right now according to live weather (HKO in HK, SMG in Macau). */
function liveEvents(): WeatherEventId[] {
  if (weather.provider === 'sim' && !weather.hko) return [];
  const day = weather.daily.find((d) => d.date === today());
  return currentEvents({ hk: officialActive(), warnings: weather.hko?.warnings, current: weather.current, today: day });
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
    activeSource: manual() ? '手動天氣' : usesSmg() ? '氣象局' : usesCwa() ? '氣象署' : officialActive() ? '天文台' : '即時天氣',
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
    nestBuilds: bare ? [] : nestBuilds(state.nest?.hatched ?? 0),
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
      provider: weather.provider ?? (weather.origin === 'offline' ? 'sim' : 'open-meteo'),
      origin: weather.origin,
      loading: weatherLoading,
      fetchedAt: weather.fetchedAt,
      updated: clockOf(weather.fetchedAt),
      hkoUsed: hk,
      bureau: usesSmg() ? 'smg' : usesCwa() ? 'cwa' : usesHko(weather) ? 'hko' : undefined,
      warnings: hk ? weather.hko!.warnings : [],
      warningsKnown: hk ? weather.hko!.warningsKnown !== false : true,
      messages: hk ? weather.hko!.messages : [],
      situation: hk ? weather.hko!.situation : '',
      hkoDays: hk ? Object.fromEntries(weather.hko!.forecast.map((d) => [d.date, d.text])) : {},
      conditionText: manual() ? undefined : weather.conditionText,
      nowIcon: !manual() && hk ? weather.hko!.current?.icon || undefined : undefined,
      station: weather.station,
      reading: !hk || Boolean(weather.hko?.current),
      humidity: manual() || (hk && !weather.hko?.current) ? undefined : weather.current.humidity,
      rainInHours: weather.rainInHours ?? null,
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
  if (finished) toast('健康會影響今晚長高幾多。跟住現實天氣打理，棵樹先會長得好。');
}

function beginCoach(): void {
  const next = armCoach(coach);
  if (next === coach) return;
  coach = next;
  saveCoach(coach);
}

function render(): void {
  const input = sceneInput();
  const v = view(input);
  renderChrome(v);
  syncCoach();
  renderSheet(state, today());
  if (drawer && !drawer.hidden) renderPanel(v);
  if (wxPage && !wxPage.hidden) renderWeatherPage(v);
  drawScene(input, performance.now());
  devRender?.();
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
    if (isNative()) await Share.share({ title: '世界之樹存檔', text });
    else await navigator.share({ title: '世界之樹存檔', text });
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
  const when = res.payload.at ? `（${new Date(res.payload.at).toLocaleDateString('en-CA')} 匯出）` : '';
  const height = s.heightCm >= 100 ? `${(s.heightCm / 100).toFixed(1)} 米` : `${Math.round(s.heightCm)} 厘米`;
  if (!window.confirm(`匯入「${s.treeName || '棵樹'}」${when}：樹齡 ${shownAge(s)} 日、高 ${height}${s.over ? '（已枯死）' : ''}。\n而家嘅存檔會被取代，確定？`)) return;
  importing = true;
  clearGrove();
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  if (res.payload.meta) localStorage.setItem(META_KEY, JSON.stringify(res.payload.meta));
  await flushPersist();
  location.reload();
}

/** Set while an imported save is being written, so nothing overwrites it before the reload. */
let importing = false;

function syncGrove(): void {
  if (isle === 0 || !second) home = state;
  else second = state;
}

function persist(): void {
  if (importing) return;
  syncGrove();
  saveGame(isle === 1 && second ? second : home);
  saveGrove({ isle, home, second });
  saveMeta(meta);
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
  if (next === 0 || second) runCatchup();
  else {
    persist();
    render();
  }
  if (landed) toast('成就：踏足新島');
  else if (next === 1 && !second) toast('第二座空島。種一棵新樹，或者向右滑返第一座。');
}

function handleIslandSwipe(dx: number): void {
  if (!scene3d || scene3d.sailing()) return;
  const toSecond = dx < 0;
  if (isle === 0 && toSecond) {
    if (!canOpenSecond(state)) {
      toast('打破世界紀錄之後，先可以滑去第二座空島。');
      return;
    }
    scene3d.sailToOther(reducedMotion, () => arriveIsle(1));
    return;
  }
  if (isle === 1 && !toSecond) {
    scene3d.sailToOther(reducedMotion, () => arriveIsle(0));
    return;
  }
  toast(isle === 0 ? '向左滑先至去到第二座空島。' : '向右滑返第一座島。');
}

function plantSecond(species?: SpeciesId): void {
  const input = document.getElementById('tree-name');
  const name = (input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '') || '第二棵';
  if (isle === 0 || !second) home = state;
  second = newGame(meta, realToday(), name, species ?? pick.species);
  isle = 1;
  state = second;
  plantingSecond = false;
  if (!manual() && (weather.provider !== 'sim' || weather.hko)) recordEvents(state, today(), liveEvents(), officialActive());
  const fresh = grantIsle('plant');
  beginCoach();
  persist();
  closeModal();
  render();
  toast(fresh ? `${state.treeName}種好喇。成就：第二棵樹。` : coachOpen(coach) ? `${state.treeName}種好喇。` : `${state.treeName}種好喇。今日先澆水、施肥。`);
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
  if (opts.heatWater && !done('heatWater')) pending.push('酷熱澆水');
  if (opts.rainDrain && !done('rainDrain')) pending.push('暴雨疏水');
  if (opts.warmCover && !done('warmCover')) pending.push('保暖');
  const windy = state.windUnlocked && events.some((e) => WEATHER_EVENTS[e].category === 'wind');
  if (windy && !(careToday && Object.values(state.care.preps).some(Boolean))) pending.push('加固');
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
      isHK: usesHko(weather) || usesSmg(weather),
      isMO: usesSmg(weather),
      ...(usesCwa(weather) ? { isTW: true, twCounty: cwaArea()?.county || undefined, twTown: cwaArea()?.town || undefined } : {}),
      rUnlocked: Boolean(state.windUnlocked),
      alive: state.started && !state.over,
      tree: state.over ? 'dead' : state.dying ? 'dying' : 'ok',
      resist: Math.round(state.resist),
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
    if (isle === 1 && state.milestones?.record && grantIsle('record')) lines.push('成就：新島破紀錄');
    persist();
    const recordHint = isle === 0 && awards.some((a) => a?.id === 'record') ? '向左滑去第二座空島，可以再種一棵。鏡頭自轉嗰陣都會見到其他空島。' : '';
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
  if (state.started && !state.over && state.lastSeenDate === today()) {
    const now = virtualNow();
    advanceFlow(state, today(), eventsFor(today()), meta, now, { dayStartMs: now - msIntoToday() });
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
  const name = bird ? animalName(bird) : '雀鳥';
  if (nestPending.laid) toast(`${name}生咗蛋。`);
  if (nestPending.hatched) {
    const next = (state.nest?.hatched ?? 0) + 1;
    const build = nestBuildAt(next);
    const gift = build ? `島上會多${nestBuildPhrase(build)}` : isNestHeightCount(next) ? '今晚會多長一截' : '開返嚟睇下';
    toast(`${name}嘅蛋孵化咗，${gift}。`);
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
  if (!opening) flushNestToast();
}

function finishOpening(): void {
  opening = false;
  document.documentElement.classList.remove('preplant');
  document.documentElement.classList.add('hud-in');
  syncBanner(true);
  flushNestToast();
  const report = deferredReport;
  deferredReport = null;
  if (report) showReport(report);
}

/** Existing tree: the planting far-to-near glide, music underneath, then the interface fades in. */
function beginOpening(): void {
  opening = true;
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  syncBanner(false);
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
  if (res === 'revived') toast('免死金牌救返棵樹！');
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
  setLabelRegion(usesHko(snapshot) || usesSmg(snapshot) ? 'hk' : 'intl');
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
    recordEvents(state, today(), events, officialActive(snapshot));
    const fresh = events.filter((e) => WEATHER_EVENTS[e].severe && !had.includes(e));
    const watered = today() === before && syncWarningWater();
    if (fresh.length && state.started && !manual() && !watered) toast(`${usesSmg(snapshot) ? '氣象局' : usesCwa(snapshot) ? '氣象署' : officialActive(snapshot) ? '天文台' : '天氣'}：${fresh.map((e) => eventLabel(e)).join('、')}生效，今晚結算前仲可以準備。`);
  }
  if (state.started && !state.over) {
    const got = refreshUnlocks(state, { date: today(), events: todayEvents() });
    if (got.length) toast(`${got.map(animalName).join('、')}嚟咗。`);
  }
  if (today() !== before) {
    const report = catchUp(state, today(), eventsFor, meta, virtualNow(), msIntoToday());
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
  return !usesSmg(snapshot) && regionFor(snapshot.source, nearHongKong(snapshot.lat, snapshot.lon)) === 'hk';
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
  statusLine = '攞緊真實天氣…';
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
  const manual = PLACES.find((p) => p.id === placeChoice);
  const reuseGeo = !forceLocate && weather.source === 'geo' && weather.choice === 'auto' && Date.now() - weather.fetchedAt < WEATHER_TTL_MS;
  const loc = manual
    ? { lat: manual.lat, lon: manual.lon, source: 'manual' as const }
    : reuseGeo
      ? { lat: weather.lat, lon: weather.lon, source: 'geo' as const }
      : await locate(8000);
  const macau = loc.source === 'geo' && inMacau(loc.lat, loc.lon);
  const tw = loc.source === 'geo' && !macau && inTaiwan(loc.lat, loc.lon);
  // Macau (SMG) and Taiwan (CWA) share one path: a bureau bundle in the HKO shape plus its own wind / rain readings.
  const mo = macau || tw;
  const bureauId: WeatherProvider = tw ? 'cwa' : 'smg';
  const bureauTz = tw ? 'Asia/Taipei' : 'Asia/Macau';
  const hk = !mo && (loc.source !== 'geo' || nearHongKong(loc.lat, loc.lon));
  const [om, hkoRes, smgRes, placeRes] = await Promise.allSettled([
    fetchForecast(loc.lat, loc.lon),
    hk ? fetchHko(loc.lat, loc.lon) : Promise.resolve(null),
    tw ? fetchCwa(loc.lat, loc.lon) : mo ? fetchSmg(loc.lat, loc.lon) : Promise.resolve(null),
    loc.source === 'geo' ? reverseGeocode(loc.lat, loc.lon) : Promise.resolve(null),
  ]);
  const hko = hkoRes.status === 'fulfilled' ? hkoRes.value : null;
  const smg = smgRes.status === 'fulfilled' ? smgRes.value : null;
  let official = mo ? smg?.data ?? null : hko;
  if (official && (hk || mo)) official = fillHkoGaps(official, loadWeatherCache()?.hko);
  const found = placeRes.status === 'fulfilled' ? placeRes.value : null;
  // Taiwan: the CWA station's town (the same area its warnings are checked for) beats the reverse geocoder.
  const cwaPlace = tw && smg ? cwaArea()?.town || cwaArea()?.county || undefined : undefined;
  const place = manual?.name ?? cwaPlace ?? found?.name ?? (macau ? '澳門' : loc.source === 'fallback' || inHongKong(loc.lat, loc.lon) ? '香港' : '你嘅位置');
  const district = manual?.name ?? found?.district;
  const openMeteo = om.status === 'fulfilled' ? om.value : null;
  let base: ForecastResult | null = hk || mo ? null : openMeteo;
  let provider: WeatherProvider = 'open-meteo';
  const error = om.status === 'rejected' ? (om.reason instanceof Error ? om.reason.message : '未知錯誤') : undefined;
  if (official && (hk || mo)) {
    const bureau = hkoForecast(official, today());
    if (bureau) {
      if (openMeteo) {
        const sun = new Map(openMeteo.daily.map((d) => [d.date, d]));
        bureau.daily = bureau.daily.map((d) => {
          const s = sun.get(d.date);
          return s ? { ...d, sunrise: s.sunrise, sunset: s.sunset } : d;
        });
      }
      bureau.timezone = mo ? bureauTz : bureau.timezone;
      base = bureau;
      provider = mo ? bureauId : 'hko';
    }
  }
  if (!base) {
    const cached = loadWeatherCache();
    if (cached && cached.provider !== 'sim' && Date.now() - cached.fetchedAt < WEATHER_STALE_MS && !(hk || mo)) {
      applyWeather({ ...cached, origin: 'cache', error, hko: null, lat: loc.lat, lon: loc.lon, source: loc.source, place });
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
    applyWeather({ ...offlineSnapshot(today(), error ?? ''), hko: official, lat: loc.lat, lon: loc.lon, source: loc.source, place, choice: choiceKey() });
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
    provider: mo && smg ? bureauId : provider,
    hko: official,
    district,
    rainInHours: provider === 'open-meteo' ? base.rainInHours : null,
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
  openModal(startModal('世界之樹', meta, false, pick));
}

function openName(): void {
  openModal(nameModal(plantingSecond ? '第二棵' : '世界之樹'));
}

/** Species card is up, the HUD is hidden, and the camera sits on the far islands. */
function beginSpeciesPick(): void {
  plantingShow = 'pick';
  lesson = null;
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  syncBanner(false);
  scene3d?.showFarIslands();
  openStart();
}

function revealHud(): void {
  plantingShow = null;
  document.documentElement.classList.remove('preplant');
  document.documentElement.classList.add('hud-in');
  syncBanner(true);
  beginCoach();
  render();
  toast(coachOpen(coach) ? `${state.treeName}種好喇。先澆一次水。` : `${state.treeName}種好喇。今日先澆水、施肥。`);
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
  const name = (input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '') || '世界之樹';
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
  if (!manual() && (weather.provider !== 'sim' || weather.hko)) recordEvents(state, today(), liveEvents(), officialActive());
  persist();
  syncWarningWater();
  plantingShow = 'arrive';
  document.documentElement.classList.add('preplant');
  document.documentElement.classList.remove('hud-in');
  syncBanner(false);
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

function openWeather(): void {
  if (!wxPage || !wxBackdrop) return;
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
    toast('呢座島未有樹。先種一棵，或者向右滑返第一座。');
    return;
  }
  if (action === 'water' || action === 'fertilize' || action === 'deworm' || action === 'drain') {
    const result = performAction(state, action as CareAction);
    persist();
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
      toast('再試緊攞真實天氣…');
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
      openModal(startModal(plantingSecond ? '第二棵' : '世界之樹', meta, false, pick));
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
      placeChoice = 'geo';
      localStorage.setItem(PLACE_KEY, placeChoice);
      void refreshWeather(true);
      return;
    case 'rename':
      openModal(startModal(state.treeName, meta, true));
      return;
    case 'guide':
      openModal(guideModal((target?.dataset.tab as GuideTab | undefined) ?? 'play'));
      return;
    case 'export-save':
      void exportSave();
      return;
    case 'copy-save':
      void copyText(saveCodeText()).then((ok) => toast(ok ? '已複製存檔碼。' : '複製唔到，請長按手動複製。'));
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
    case 'privacy':
      openModal(privacyModal());
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
      openModal(startModal('第二棵', meta, false, pick));
      return;
    case 'close-modal':
      plantingSecond = false;
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

document.addEventListener('click', (event) => {
  const el = event.target instanceof Element ? event.target : null;
  if (!el) return;
  if (el.closest('#dev-root')) return;
  const target = el.closest<HTMLElement>('[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality], [data-sound], [data-species], [data-album-mode], [data-guide], [data-notify], [data-cal], [data-cal-nav]');
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
    localStorage.setItem(PLACE_KEY, placeChoice);
    closeModal();
    const name = PLACES.find((p) => p.id === placeChoice)?.name ?? '你所在位置';
    toast(`天氣改為跟住${name}。`);
    void refreshWeather(placeChoice === 'geo');
    return;
  }
  if (target.dataset.guide) {
    openModal(guideModal(target.dataset.guide as GuideTab));
    document.querySelector('.modal-card')?.scrollTo({ top: 0 });
    return;
  }
  if (target.dataset.notify === 'on' || target.dataset.notify === 'off') {
    localStorage.setItem(NOTIFY_KEY, target.dataset.notify === 'on' ? '1' : '0');
    scheduleReminders(false);
    void syncPush(target.dataset.notify === 'on');
    const row = target.closest('.seg');
    row?.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.notify === target.dataset.notify;
      btn.classList.toggle('on', on);
    });
    return;
  }
  if (target.dataset.quality === 'low' || target.dataset.quality === 'high') {
    quality = target.dataset.quality;
    localStorage.setItem(QUALITY_KEY, quality);
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
      toast('未種樹，加唔到蛋。');
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
    toast(built.length ? `已孵化 ${next} 粒。島上：${built.map(nestBuildPhrase).join('、')}。` : `已孵化 ${next} 粒。`);
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
      toast(`解鎖咗全部 ${ANIMALS.length} 種動物。`);
    },
    ecoInfo: () => (scene3d?.animalInfo() ?? []).map((g) => ({ id: g.id, name: animalName(g.id), count: g.count, resident: g.resident })),
    ecoCaps: () => scene3d?.animalCaps() ?? null,
    followAnimal: (id) => scene3d?.followAnimal(id),
    setHatched: (n) => applyHatched(n, true, true),
    restoreHatched: () => {
      if (hatchBeforePreview === null) {
        toast('未有改過孵化次數。');
        return;
      }
      const back = hatchBeforePreview;
      hatchBeforePreview = null;
      applyHatched(back, false, false);
      toast('還原咗孵化次數。');
    },
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
/** How long 「返回全景」 stays after the last zoom, pan, or follow gesture. */
const VIEW_BTN_MS = 2800;
/** Fade 「返回全景」 in only while the player is adjusting a zoomed or follow view. */
function syncViewButton(): void {
  if (!scene3d) return;
  if (!hintShown && plantingShow === null && state.started && !state.over && document.getElementById('modal')?.hidden) {
    hintShown = true;
    localStorage.setItem('sekai-tree-zoom-hint', '1');
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
    btn.innerHTML = `${ICONS.locate}<span>${v.following ? `跟緊${esc(v.following)}・返回全景` : '返回全景'}</span>`;
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
function syncFlow(force = false): void {
  // v1.4.18: 水分／養分／抗風力 drift; 健康 itself only changes at the midnight settlement.
  if (!state.started || state.over) return;
  if (state.lastSeenDate !== today()) {
    runCatchup(); // midnight passed while open: settle last night first (it also starts today's flow)
    return;
  }
  const now = virtualNow();
  advanceFlow(state, today(), eventsFor(today()), meta, now, { dayStartMs: now - msIntoToday() });
  if (state.dying && !state.dying.at) state.dying.at = now;
  const key = [state.health, state.moisture, state.nutrients, state.resist].map((x) => Math.round(x)).join(',') + (state.dying ? 'd' : '');
  const changed = key !== flowKey;
  flowKey = key;
  if (changed || force || Date.now() - flowSavedAt > 30_000) {
    flowSavedAt = Date.now();
    if (importing) return;
    syncGrove();
    saveGame(isle === 1 && second ? second : home);
    saveGrove({ isle, home, second });
    if (changed) {
      scheduleReminders(false);
      render();
    }
  }
}

function frame(time: number): void {
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
  if (!document.hidden) requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  setPageAudible(!document.hidden);
  if (document.hidden) {
    syncFlow(true);
    scheduleReminders(true);
    return;
  }
  requestAnimationFrame(frame);
  runCatchup();
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
  void App.addListener('pause', () => scheduleReminders(true));
  void App.addListener('resume', () => relocateNow());
  scheduleReminders(false);
  void syncPush(notifyEnabled());
}
if (!state.started) beginSpeciesPick();
else beginOpening();
runCatchup();
syncNest();
requestAnimationFrame(frame);
if (usesDeviceLocation()) {
  if (weather.origin === 'live' && !weatherLoading) applyWeather(weather);
  relocateNow();
} else if (weather.origin === 'live' && !weatherLoading) {
  applyWeather(weather);
  scheduleRefresh(Math.max(5000, WEATHER_TTL_MS - (Date.now() - weather.fetchedAt)));
} else {
  void refreshWeather(false);
}
