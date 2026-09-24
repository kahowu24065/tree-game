import './style.css';
import { addDays, clockMinutes, daysBetween, formatDateInTz, isoMinutes } from './dates';
import { Scene, daylightFactor } from './render';
import {
  advanceVirtualDay,
  catchUp,
  clearDebugStorms,
  createGame,
  insertDebugStorm,
  jumpStage,
  performAction,
  setReinforcement,
  syncStorms,
  type CatchupReport,
} from './sim';
import { clearGame, loadGame, loadWeatherCache, saveGame, saveWeatherCache } from './storage';
import type { DayCond, GameState, SceneOverride, TabId, TimeMode } from './types';
import {
  animalName,
  closeModal,
  mountDebug,
  nameModal,
  openModal,
  renderChrome,
  renderPanel,
  stormModal,
  toast,
} from './ui';
import {
  condFromForecast,
  describePlace,
  fetchForecast,
  classify,
  isRainCode,
  isSnowCode,
  locate,
  mildDay,
  offlineSnapshot,
  overrideDay,
  presentForecast,
  type WeatherSnapshot,
} from './weather';

type ActionName = 'water' | 'fertilize' | 'deworm' | 'prune';

let timezone = 'Asia/Hong_Kong';
let state: GameState = loadGame() ?? createGame(formatDateInTz(new Date(), timezone));
let tab: TabId = 'care';
let sceneOverride: SceneOverride | null = null;
let timeMode: TimeMode = 'auto';
let weather: WeatherSnapshot = loadWeatherCache() ?? offlineSnapshot(realToday(), '');
let statusLine = weather.origin === 'cache' ? '用緊較早的天氣記錄，更新緊…' : '睇緊天空…';
const debug = new URLSearchParams(location.search).get('debug') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pendingStorm = '';

const canvas = document.getElementById('scene');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('找不到畫面');
const scene = new Scene(canvas);
const panel = document.getElementById('panel');
const modal = document.getElementById('modal');
const debugRoot = document.getElementById('debug-root');

function realToday(): string {
  return formatDateInTz(new Date(), timezone);
}

function today(): string {
  const real = realToday();
  if (state.virtualToday && daysBetween(real, state.virtualToday) > 0) return state.virtualToday;
  return real;
}

function reconcileClock(): void {
  const real = realToday();
  if (state.virtualToday && daysBetween(real, state.virtualToday) <= 0) state.virtualToday = null;
}

function presentedDays() {
  return presentForecast(weather.daily, state.storms, today(), sceneOverride);
}

function todayCond(): DayCond {
  const day = presentedDays().find((d) => d.date === today()) ?? mildDay(today());
  const useLive = !sceneOverride && weather.origin !== 'offline';
  const temp = useLive ? weather.current.tempC : (day.tempMax + day.tempMin) / 2;
  const cond = condFromForecast(day, temp);
  if (useLive) {
    cond.code = weather.current.code || cond.code;
    cond.windKmh = weather.current.windKmh;
    cond.gustKmh = weather.current.gustKmh;
    cond.tempC = weather.current.tempC;
    cond.precipMm = weather.current.precipMm;
    cond.raining = cond.precipMm >= 0.2 || isRainCode(cond.code) || isSnowCode(cond.code);
    cond.hot = cond.tempC >= 33 || day.tempMax >= 33;
    cond.stormKind = classify({
      precipMm: cond.precipMm,
      gustKmh: cond.gustKmh,
      windKmh: cond.windKmh,
      tempMax: Math.max(day.tempMax, cond.tempC),
    }).stormKind;
  }
  return cond;
}

function condForDate(date: string): DayCond {
  const storm = state.storms.find((s) => s.date === date && !s.resolved);
  if (storm) {
    const fake = overrideDay(mildDay(date), storm.kind === 'typhoon' ? 'typhoon' : storm.kind === 'gale' ? 'gale' : 'heavyrain');
    fake.precipMm = storm.rainMm;
    fake.windKmh = storm.windKmh;
    fake.gustKmh = storm.gustKmh;
    return condFromForecast(fake);
  }
  const api = weather.daily.find((d) => d.date === date);
  if (api) return condFromForecast(api);
  return condFromForecast(mildDay(date));
}

function render(): void {
  const cond = todayCond();
  const day = presentedDays().find((d) => d.date === today()) ?? mildDay(today());
  const sunrise = isoMinutes(day.sunrise) ?? 370;
  const sunset = isoMinutes(day.sunset) ?? 1105;
  const minute = clockMinutes(timezone);
  const daylight = daylightFactor(minute, sunrise, sunset, timeMode);
  const place = describePlace(weather.lat, weather.lon, weather.timezone || timezone);
  renderChrome({
    state,
    today: today(),
    tab,
    place,
    placeNote: weather.source === 'fallback' ? '預設' : '',
    statusLine,
    cond,
    forecast: presentedDays(),
    night: daylight < 0.45,
    debug,
  });
  renderPanel({
    state,
    today: today(),
    tab,
    place,
    placeNote: weather.source === 'fallback' ? '預設' : '',
    statusLine,
    cond,
    forecast: presentedDays(),
    night: daylight < 0.45,
    debug,
  });
  scene.draw(
    {
      treeName: state.treeName,
      heightCm: state.heightCm,
      health: state.health,
      moisture: state.moisture,
      pests: state.pests,
      scars: state.scars,
      animals: state.animals,
      cond,
      daylight,
      minute: timeMode === 'day' ? sunrise + 180 : timeMode === 'night' ? 23 * 60 : minute,
      sunriseMin: sunrise,
      sunsetMin: sunset,
      eventId: state.dailyEventId,
      reducedMotion,
    },
    performance.now(),
  );
}

function showReport(report: CatchupReport): void {
  saveGame(state);
  render();
  if (report.storms.length) {
    const message = report.storms.map((s) => s.message).join(' ');
    if (!state.started) pendingStorm = message;
    else openModal(stormModal(message));
  }
  const names = report.animals.map(animalName);
  if (names.length) toast(`${names.join('、')}嚟咗。`);
  else if (report.stageTexts.length && !report.storms.length) toast(report.stageTexts.join(' '));
}

function runCatchup(): void {
  reconcileClock();
  const cond = todayCond();
  const report = catchUp(state, today(), condForDate, cond.hot);
  showReport(report);
}

function applyWeather(snapshot: WeatherSnapshot): void {
  const before = today();
  weather = snapshot;
  timezone = snapshot.timezone || timezone;
  if (snapshot.origin === 'live') saveWeatherCache(snapshot);
  statusLine =
    snapshot.origin === 'live'
      ? '天氣剛剛更新'
      : snapshot.origin === 'cache'
        ? '用緊較早的天氣記錄'
        : `而家攞唔到天氣，暫時當係平靜。${snapshot.error ?? ''}`;
  reconcileClock();
  if (snapshot.origin !== 'offline') syncStorms(state, weather.daily, today());
  if (today() !== before) {
    const report = catchUp(state, today(), condForDate, todayCond().hot);
    showReport(report);
    return;
  }
  saveGame(state);
  render();
}

async function refreshWeather(forceLocate = false): Promise<void> {
  statusLine = '睇緊天空…';
  render();
  try {
    const loc = forceLocate || weather.origin === 'offline' ? await locate() : { lat: weather.lat, lon: weather.lon, source: weather.source };
    const fresh = await fetchForecast(loc.lat, loc.lon);
    applyWeather({
      lat: loc.lat,
      lon: loc.lon,
      timezone: fresh.timezone,
      place: describePlace(loc.lat, loc.lon, fresh.timezone),
      source: loc.source,
      origin: 'live',
      fetchedAt: Date.now(),
      current: fresh.current,
      daily: fresh.daily,
    });
  } catch (error) {
    const cached = loadWeatherCache();
    const message = error instanceof Error ? error.message : '未知錯誤';
    if (cached) {
      cached.origin = 'cache';
      cached.error = message;
      applyWeather(cached);
      statusLine = '更新失敗，用緊上次的天氣。';
      render();
      return;
    }
    applyWeather(offlineSnapshot(today(), message));
  }
}

function renameOrStart(): void {
  const input = document.getElementById('tree-name');
  const name = input instanceof HTMLInputElement ? input.value.trim().slice(0, 12) : '';
  state.treeName = name || '窗前小樹';
  const wasStarted = state.started;
  state.started = true;
  saveGame(state);
  closeModal();
  render();
  if (!wasStarted) toast(`${state.treeName}種好喇。${pendingStorm ? '' : '今日可以做一件小事。'}`);
  if (pendingStorm) {
    const message = pendingStorm;
    pendingStorm = '';
    openModal(stormModal(message));
  }
}

panel?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tab], [data-action], [data-prep], [data-seen]') : null;
  if (!target || !state.started) return;
  if (target.dataset.tab) {
    tab = target.dataset.tab as TabId;
    render();
    return;
  }
  if (target.dataset.prep === 'stakes' || target.dataset.prep === 'ropes' || target.dataset.prep === 'prune') {
    const key = target.dataset.prep;
    toast(setReinforcement(state, key, !state.reinforcement[key]));
    saveGame(state);
    render();
    return;
  }
  if (target.dataset.seen) {
    const id = target.dataset.seen;
    if (state.animals.includes(id) && !state.seenAnimals.includes(id)) {
      state.seenAnimals.push(id);
      saveGame(state);
      render();
    }
    return;
  }
  const action = target.dataset.action;
  if (action === 'water' || action === 'fertilize' || action === 'deworm' || action === 'prune') {
    const result = performAction(state, action as ActionName, todayCond());
    saveGame(state);
    render();
    toast(result.message);
    return;
  }
  if (action === 'dismiss-note') {
    state.morningNote = null;
    saveGame(state);
    render();
    return;
  }
  if (action === 'locate') {
    void refreshWeather(true);
    return;
  }
  if (action === 'rename') openModal(nameModal(state.treeName, true));
});

modal?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action]') : null;
  if (!target) return;
  if (target.dataset.action === 'start') renameOrStart();
  if (target.dataset.action === 'close-modal') closeModal();
});

modal?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const input = document.getElementById('tree-name');
    if (document.activeElement === input) renameOrStart();
  }
});

debugRoot?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-debug]') : null;
  const cmd = target?.dataset.debug;
  if (!cmd) return;
  const day = today();
  if (cmd === 'scene-auto') sceneOverride = null;
  if (cmd === 'scene-clear') sceneOverride = 'clear';
  if (cmd === 'scene-rain') sceneOverride = 'rain';
  if (cmd === 'scene-heat') sceneOverride = 'heat';
  if (cmd === 'scene-heavyrain') sceneOverride = 'heavyrain';
  if (cmd === 'scene-gale') sceneOverride = 'gale';
  if (cmd === 'scene-typhoon') sceneOverride = 'typhoon';
  if (cmd === 'time-auto') timeMode = 'auto';
  if (cmd === 'time-day') timeMode = 'day';
  if (cmd === 'time-night') timeMode = 'night';
  if (cmd === 'storm-tomorrow-typhoon') insertDebugStorm(state, addDays(day, 1), 'typhoon');
  if (cmd === 'storm-tomorrow-rain') insertDebugStorm(state, addDays(day, 1), 'heavy-rain');
  if (cmd === 'storm-tomorrow-gale') insertDebugStorm(state, addDays(day, 1), 'gale');
  if (cmd === 'storm-today-typhoon') {
    insertDebugStorm(state, day, 'typhoon');
    sceneOverride = 'typhoon';
  }
  if (cmd === 'clear-storms') {
    clearDebugStorms(state);
    sceneOverride = null;
  }
  if (cmd === 'jump') {
    const name = jumpStage(state, day, todayCond().hot || sceneOverride === 'heat');
    toast(`而家長成${name}。`);
  }
  if (cmd === 'advance') {
    const report = advanceVirtualDay(state, day, todayCond());
    sceneOverride = null;
    showReport(report);
    tab = 'care';
    return;
  }
  if (cmd === 'real-date') {
    state.virtualToday = null;
    runCatchup();
    return;
  }
  if (cmd === 'reset') {
    clearGame();
    sceneOverride = null;
    timeMode = 'auto';
    state = createGame(realToday());
    pendingStorm = '';
    closeModal();
    openModal(nameModal(state.treeName));
    render();
    return;
  }
  saveGame(state);
  render();
});

function frame(time: number): void {
  const cond = todayCond();
  const day = presentedDays().find((d) => d.date === today()) ?? mildDay(today());
  const sunrise = isoMinutes(day.sunrise) ?? 370;
  const sunset = isoMinutes(day.sunset) ?? 1105;
  const minute = clockMinutes(timezone);
  const daylight = daylightFactor(minute, sunrise, sunset, timeMode);
  scene.draw(
    {
      treeName: state.treeName,
      heightCm: state.heightCm,
      health: state.health,
      moisture: state.moisture,
      pests: state.pests,
      scars: state.scars,
      animals: state.animals,
      cond,
      daylight,
      minute: timeMode === 'day' ? sunrise + 180 : timeMode === 'night' ? 23 * 60 : minute,
      sunriseMin: sunrise,
      sunsetMin: sunset,
      eventId: state.dailyEventId,
      reducedMotion,
    },
    time,
  );
  if (!document.hidden) requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) requestAnimationFrame(frame);
});

const wrap = document.getElementById('scene-wrap');
if (wrap) new ResizeObserver(() => scene.resize()).observe(wrap);
scene.resize();

if (debug && debugRoot) mountDebug(debugRoot);
runCatchup();
if (!state.started) openModal(nameModal('窗前小樹'));
requestAnimationFrame(frame);
void refreshWeather(weather.source !== 'geo');
