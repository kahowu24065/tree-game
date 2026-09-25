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
  syncOfficialWarnings,
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
  WEATHER_STALE_MS,
  WEATHER_TTL_MS,
  activeHot,
  condFromForecast,
  districtRain,
  fetchForecast,
  hkoForecast,
  withHkoDays,
  inHongKong,
  nearHongKong,
  classify,
  isRainCode,
  isSnowCode,
  locate,
  mildDay,
  offlineSnapshot,
  overrideDay,
  presentForecast,
  type ForecastResult,
  type WeatherProvider,
  type WeatherSnapshot,
} from './weather';
import { fetchHko, hkoIconLabel, hkoIconRain, hkoIconToWmo } from './hko';
import { reverseGeocode } from './place';

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
let placeChoice = localStorage.getItem(PLACE_KEY) ?? '';
let weather: WeatherSnapshot = initialWeather();
let weatherLoading = weather.provider === 'sim';
let statusLine = weather.origin === 'live' ? '天氣啱啱更新過' : '攞緊真實天氣…';
const debug = new URLSearchParams(location.search).get('debug') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pendingStorm = '';
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
  if (!sceneOverride) {
    // A real HKO signal in force today drives the scene and the day's conditions.
    const official = state.storms.find((s) => s.date === today() && !s.resolved && s.official && !s.provisional);
    if (official) {
      const rank = { 'heavy-rain': 1, gale: 2, typhoon: 3 } as const;
      if (!cond.stormKind || rank[official.kind] > rank[cond.stormKind]) cond.stormKind = official.kind;
      if (official.kind !== 'gale') {
        cond.raining = true;
        cond.precipMm = Math.max(cond.precipMm, 10);
        cond.code = official.kind === 'typhoon' ? 95 : Math.max(cond.code, 63);
      }
      if (official.kind !== 'heavy-rain') {
        cond.windKmh = Math.max(cond.windKmh, official.windKmh * 0.7);
        cond.gustKmh = Math.max(cond.gustKmh, official.gustKmh * 0.7);
      }
    }
    if (activeHot(weather.hko?.warnings)) cond.hot = true;
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

function choiceKey(): string {
  return placeChoice && placeChoice !== 'geo' ? placeChoice : 'auto';
}

function placeLabel(): { place: string; note: string } {
  const manual = PLACES.find((p) => p.id === placeChoice);
  if (manual) return { place: manual.name, note: '' };
  if (weather.provider === 'sim' && !weather.fetchedAt) return { place: '香港', note: '' };
  return { place: weather.place || '你嘅位置', note: weather.source === 'fallback' ? '預設' : '' };
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
    wx: {
      provider: weather.provider ?? (weather.origin === 'offline' ? 'sim' : 'open-meteo'),
      origin: weather.origin,
      loading: weatherLoading,
      fetchedAt: weather.fetchedAt,
      updated: clockOf(weather.fetchedAt),
      hkoUsed: Boolean(weather.hko && usesHko(weather)),
      warnings: weather.hko && usesHko(weather) ? weather.hko.warnings : [],
      messages: weather.hko && usesHko(weather) ? weather.hko.messages : [],
      situation: weather.hko && usesHko(weather) ? weather.hko.situation : '',
      hkoDays: weather.hko && usesHko(weather) ? Object.fromEntries(weather.hko.forecast.map((d) => [d.date, d.text])) : {},
      conditionText: sceneOverride ? undefined : weather.conditionText,
      nowIcon: !sceneOverride && weather.hko && usesHko(weather) ? weather.hko.current?.icon || undefined : undefined,
      station: weather.station,
      rainInHours: weather.rainInHours ?? null,
      error: weather.error,
      overridden: Boolean(sceneOverride),
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
      ? `天氣 ${clockOf(snapshot.fetchedAt)} 更新`
      : snapshot.origin === 'cache'
        ? `更新唔到（${snapshot.error ?? '網絡問題'}），用緊 ${clockOf(snapshot.fetchedAt)} 的記錄。`
        : `而家攞唔到真實天氣，暫時用模擬天氣。${snapshot.error ?? ''}`;
  reconcileClock();
  if (snapshot.provider !== 'sim') syncStorms(state, weather.daily, today());
  if (snapshot.hko && usesHko(snapshot)) {
    const note = syncOfficialWarnings(state, snapshot.hko.warnings, today());
    if (note && state.started) toast(note);
  }
  if (today() !== before) {
    const report = catchUp(state, today(), condForDate, todayCond().hot);
    showReport(report);
    return;
  }
  saveGame(state);
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
  return snapshot.source !== 'geo' || nearHongKong(snapshot.lat, snapshot.lon);
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
    daily: base.daily,
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
  if (document.hidden) return;
  requestAnimationFrame(frame);
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
if (debug && debugRoot) mountDebug(debugRoot);
runCatchup();
if (!state.started) openModal(nameModal('窗前小樹'));
requestAnimationFrame(frame);
if (weather.origin === 'live' && !weatherLoading) {
  applyWeather(weather);
  scheduleRefresh(Math.max(5000, WEATHER_TTL_MS - (Date.now() - weather.fetchedAt)));
} else {
  void refreshWeather(!placeChoice && weather.source !== 'geo');
}
