import './style.css';
import { addDays, clockMinutes, daysBetween, formatDateInTz, isoMinutes } from './dates';
import { Scene, daylightFactor, type SceneInput } from './render';
import { Scene3D, type Quality } from './three/scene3d';
import {
  advanceVirtualDay,
  catchUp,
  clearDebugStorms,
  createGame,
  insertDebugStorm,
  jumpStage,
  performAction,
  setLogClock,
  setReinforcement,
  syncStorms,
  type CatchupReport,
} from './sim';
import { clearGame, loadGame, loadWeatherCache, saveGame, saveWeatherCache } from './storage';
import type { DayCond, GameState, SceneOverride, TabId, TimeMode } from './types';
import {
  PLACES,
  animalName,
  closeModal,
  locationModal,
  mountDebug,
  nameModal,
  openModal,
  renderChrome,
  renderPanel,
  renderSheet,
  setThumbnailer,
  settingsModal,
  stormModal,
  toast,
  type View,
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

const PLACE_KEY = 'yiri-yisyu-place';
const QUALITY_KEY = 'yiri-yisyu-quality';

let timezone = 'Asia/Hong_Kong';
setLogClock(() => {
  const m = clockMinutes(timezone);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});
let state: GameState = loadGame() ?? createGame(formatDateInTz(new Date(), timezone));
let tab: TabId = 'care';
let sceneOverride: SceneOverride | null = null;
let timeMode: TimeMode = 'auto';
let weather: WeatherSnapshot = loadWeatherCache() ?? offlineSnapshot(realToday(), '');
let statusLine = weather.origin === 'cache' ? '用緊較早的天氣記錄，更新緊…' : '睇緊天空…';
const debug = new URLSearchParams(location.search).get('debug') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pendingStorm = '';
let placeChoice = localStorage.getItem(PLACE_KEY) ?? '';
let quality: Quality = localStorage.getItem(QUALITY_KEY) === 'high' ? 'high' : 'low';

const canvas = document.getElementById('scene');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('找不到畫面');
let scene3d: Scene3D | null = null;
let scene2d: Scene | null = null;
try {
  scene3d = new Scene3D(canvas, quality);
  setThumbnailer((id, unlocked) => scene3d?.thumbnail(id, unlocked) ?? null);
} catch (error) {
  console.warn('WebGL 用唔到，改用簡化畫面', error);
  scene2d = new Scene(canvas);
  document.body.classList.add('flat');
}
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const sheet = document.getElementById('sheet');
const sheetHandle = document.getElementById('sheet-handle');
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

function placeLabel(): { place: string; note: string } {
  const manual = PLACES.find((p) => p.id === placeChoice);
  if (manual) return { place: manual.name, note: weather.origin === 'offline' ? '離線' : '' };
  const place = describePlace(weather.lat, weather.lon, weather.timezone || timezone);
  return { place, note: weather.origin === 'offline' ? '離線' : weather.source === 'fallback' ? '預設' : '' };
}

function sceneInput(): SceneInput {
  const cond = todayCond();
  const day = presentedDays().find((d) => d.date === today()) ?? mildDay(today());
  const sunrise = isoMinutes(day.sunrise) ?? 370;
  const sunset = isoMinutes(day.sunset) ?? 1105;
  const minute = clockMinutes(timezone);
  return {
    treeName: state.treeName,
    heightCm: state.heightCm,
    health: state.health,
    moisture: state.moisture,
    pests: state.pests,
    scars: state.scars,
    animals: state.animals,
    cond,
    daylight: daylightFactor(minute, sunrise, sunset, timeMode),
    minute: timeMode === 'day' ? sunrise + 180 : timeMode === 'night' ? 23 * 60 : minute,
    sunriseMin: sunrise,
    sunsetMin: sunset,
    eventId: state.dailyEventId,
    reducedMotion,
    reinforce: state.reinforcement,
  };
}

function view(input: SceneInput): View {
  const { place, note } = placeLabel();
  return {
    state,
    today: today(),
    tab,
    place,
    placeNote: note,
    statusLine,
    cond: input.cond,
    forecast: presentedDays(),
    night: input.daylight < 0.45,
    debug,
  };
}

function render(): void {
  const input = sceneInput();
  const v = view(input);
  renderChrome(v);
  renderSheet(state, today());
  if (drawer && !drawer.hidden) renderPanel(v);
  drawScene(input, performance.now());
}

function drawScene(input: SceneInput, time: number): void {
  if (scene3d) scene3d.draw(input, time);
  else scene2d?.draw(input, time);
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
    const manual = PLACES.find((p) => p.id === placeChoice);
    const loc = manual
      ? { lat: manual.lat, lon: manual.lon, source: 'manual' as const }
      : forceLocate || weather.origin === 'offline'
        ? await locate()
        : { lat: weather.lat, lon: weather.lon, source: weather.source };
    const fresh = await fetchForecast(loc.lat, loc.lon);
    applyWeather({
      lat: loc.lat,
      lon: loc.lon,
      timezone: fresh.timezone,
      place: manual?.name ?? describePlace(loc.lat, loc.lon, fresh.timezone),
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
  if (action === 'water' || action === 'fertilize' || action === 'deworm' || action === 'prune') {
    if (target.getAttribute('aria-disabled') === 'true') {
      toast(action === 'water' && todayCond().raining ? '落緊雨，今日唔使澆。' : '今日做過喇，聽日再嚟。');
      return;
    }
    const result = performAction(state, action as ActionName, todayCond());
    saveGame(state);
    render();
    toast(result.message);
    target.classList.add('pop');
    return;
  }
  switch (action) {
    case 'dismiss-note':
      state.morningNote = null;
      saveGame(state);
      render();
      return;
    case 'locate':
      placeChoice = 'geo';
      localStorage.setItem(PLACE_KEY, placeChoice);
      void refreshWeather(true);
      return;
    case 'rename':
      openModal(nameModal(state.treeName, true));
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
    case 'start':
      renameOrStart();
      return;
    case 'close-modal':
      closeModal();
      return;
  }
}

document.addEventListener('click', (event) => {
  const el = event.target instanceof Element ? event.target : null;
  if (!el) return;
  if (el.closest('#debug-root')) return;
  const target = el.closest<HTMLElement>('[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality]');
  if (!target) return;
  const inModal = Boolean(target.closest('#modal'));
  if (!state.started && !inModal) return;
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
  if (event.key === 'Enter') {
    const input = document.getElementById('tree-name');
    if (document.activeElement === input) renameOrStart();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!document.getElementById('modal')?.hidden) return;
  if (drawer && !drawer.hidden) closeDrawer();
  else if (sheet?.dataset.state === 'open') setSheet(false);
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
    closeDrawer();
    setSheet(false);
    openModal(nameModal(state.treeName));
    render();
    return;
  }
  saveGame(state);
  render();
});

let lastChrome = 0;
function frame(time: number): void {
  const input = sceneInput();
  drawScene(input, time);
  // Keep the clock-driven chrome (night styling, weather card) fresh without re-rendering every frame.
  if (time - lastChrome > 30000) {
    lastChrome = time;
    renderChrome(view(input));
  }
  if (!document.hidden) requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) requestAnimationFrame(frame);
});

const resize = () => {
  scene3d?.resize();
  scene2d?.resize();
};
window.addEventListener('resize', resize);
resize();

bindSheetDrag();
if (debug && debugRoot) mountDebug(debugRoot);
runCatchup();
if (!state.started) openModal(nameModal('窗前小樹'));
requestAnimationFrame(frame);
void refreshWeather(!placeChoice && weather.source !== 'geo');
