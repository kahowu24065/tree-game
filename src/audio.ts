/**
 * Day/night music, weather, button clicks and animal calls.
 * Real recordings (see public/audio/CREDITS.txt), mixed with the Web Audio API.
 * Opening the game tries to start the bed immediately. A later tap still unlocks it
 * when the platform blocked that first attempt.
 * Day and night beds crossfade over 2.5s.
 */
import type { AnimalCategory, Motion } from './data/animals';
import type { WeatherEventId } from './balance';
import { kvSet } from './native/kv';

const KEY = 'sekai-tree-sound';
const FADE = 2.5;

/** First file that decodes wins (1.4.33: AAC first for the day piece, which iOS decodes in hardware). */
export const AUDIO_FILES: Record<string, string | string[]> = {
  day: ['day.m4a', 'day.mp3'],
  night: ['night.ogg', 'night.m4a'],
  // 1.4.34: AAC copies for iPhones before iOS 18.4 (no Ogg there).
  birds: ['birds.ogg', 'birds.m4a'],
  crickets: 'crickets.mp3',
  rain: ['rain.ogg', 'rain.m4a'],
  storm: ['storm.ogg', 'storm.m4a'],
  pluck: ['pluck.ogg', 'pluck.m4a'],
  switch: ['switch.ogg', 'switch.m4a'],
  // 1.4.45: a soft natural bird call (1.6 s from the morning-birds recording, 2–4 kHz, faded) replaces the bright
  // bird.wav; the shrill chirp.wav (a 3 kHz square-ish whistle at full scale) that played when an insect / butterfly
  // / moth / firefly / bat appeared is gone.
  call: ['call.ogg', 'call.m4a'],
  frog: 'frog.wav',
};

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

type Mix = { rain: number; storm: number };

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
let sfx: GainNode | null = null;
let pageOn = true;
let unlocked = false;
let levelKey = '';
let animalAt = 0;
let quietTimer = 0;
let live = false;
let loading: Promise<void> | null = null;
/** 1.4.33: beds other than the current music wait until shortly after the opening (releaseAudioExtras). */
let extras = false;
const buffers = new Map<string, AudioBuffer>();
const loops = new Map<string, GainNode>();
let want = { night: false, events: [] as WeatherEventId[] };

function ctor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

function wants(): boolean {
  return soundEnabled() && pageOn && unlocked;
}

function fileUrl(name: string): string {
  const base = import.meta.env.BASE_URL || './';
  return `${base}audio/${name}`;
}

function ensure(): AudioContext | null {
  if (!soundEnabled() || typeof window === 'undefined') return null;
  const Ctor = ctor();
  if (!Ctor) return null;
  if (!ac) {
    try {
      ac = new Ctor();
      master = ac.createGain();
      master.gain.value = 0;
      master.connect(ac.destination);
      music = ac.createGain();
      music.gain.value = 0.8;
      music.connect(master);
      sfx = ac.createGain();
      sfx.gain.value = 0.7;
      sfx.connect(master);
      watchState(ac);
    } catch {
      ac = null;
      return null;
    }
  }
  return ac;
}

function ramp(param: AudioParam, value: number, seconds: number): void {
  if (!ac) return;
  const t = ac.currentTime;
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(value, t + seconds);
}

/** 1.4.33 diagnostics: what each sound did (shown in the hidden readout, long-press the version in 設定). */
export type AudioFileDiag = { id: string; state: 'loading' | 'ok' | 'fail'; file?: string; ms?: number; seconds?: number; error?: string };
const fileDiag = new Map<string, AudioFileDiag>();
const stateLog: string[] = [];
const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
function stamp(): string {
  return ((performance.now() - t0) / 1000).toFixed(1) + 's';
}

const pendingLoads = new Map<string, Promise<void>>();

/**
 * 1.4.34: Capacitor iOS answers media files (m4a / mp3 / wav…) with a plain URLResponse instead of an HTTP one,
 * so fetch() reports status 0 / ok=false although the bytes are there. Accept any non-empty body from a
 * status-0 answer, and fall back to XHR (which reads the scheme handler's data the same way).
 */
export async function fetchBytes(url: string): Promise<ArrayBuffer> {
  let fetchError = '';
  try {
    const res = await fetch(url);
    if (res.ok || res.status === 0) {
      const raw = await res.arrayBuffer();
      if (raw.byteLength > 0) return raw;
      fetchError = `HTTP ${res.status} empty`;
    } else fetchError = `HTTP ${res.status}`;
  } catch (error) {
    fetchError = error instanceof Error ? error.message : String(error);
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      const buf = xhr.response as ArrayBuffer | null;
      if (buf && buf.byteLength > 0 && (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300))) resolve(buf);
      else reject(new Error(`fetch ${fetchError}; xhr ${xhr.status} ${buf?.byteLength ?? 0} B`));
    };
    xhr.onerror = () => reject(new Error(`fetch ${fetchError}; xhr error`));
    xhr.send();
  });
}

function loadOne(id: string): Promise<void> {
  if (buffers.has(id)) return Promise.resolve();
  const running = pendingLoads.get(id);
  if (running) return running;
  const ctx = ac;
  const spec = AUDIO_FILES[id];
  if (!ctx || !spec) return Promise.resolve();
  const files = Array.isArray(spec) ? spec : [spec];
  const job = (async () => {
    const started = performance.now();
    fileDiag.set(id, { id, state: 'loading' });
    const errors: string[] = [];
    for (const file of files) {
      try {
        const raw = await fetchBytes(fileUrl(file));
        const buf = await ctx.decodeAudioData(raw);
        buffers.set(id, buf);
        fileDiag.set(id, { id, state: 'ok', file, ms: Math.round(performance.now() - started), seconds: Math.round(buf.duration * 10) / 10 });
        // A bed that arrives late joins the mix on its own; it never waits for the others.
        if (wants()) applyMix(true);
        return;
      } catch (error) {
        const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        errors.push(`${file}: ${msg}`);
        console.warn('[audio] could not load', file, error);
      }
    }
    fileDiag.set(id, { id, state: 'fail', ms: Math.round(performance.now() - started), error: errors.join(' | ') });
  })().finally(() => pendingLoads.delete(id));
  pendingLoads.set(id, job);
  return job;
}

const CLIPS = ['switch', 'pluck', 'call', 'frog'];
const BEDS = ['day', 'night', 'birds', 'crickets', 'rain', 'storm'];

function musicId(): string {
  return want.night ? 'night' : 'day';
}

/** The current music first, then the small clips; the other beds only once extras are released. */
function loadAll(): Promise<void> {
  if (!loading) {
    loading = loadOne(musicId()).then(() => Promise.all(CLIPS.map(loadOne))).then(() => undefined);
  }
  if (extras) for (const id of BEDS) void loadOne(id);
  return loading;
}

function watchState(ctx: AudioContext): void {
  const note = () => {
    stateLog.push(`${stamp()} ${ctx.state}`);
    if (stateLog.length > 12) stateLog.shift();
  };
  note();
  ctx.addEventListener?.('statechange', note);
}

/** Start an AudioContext that is not running ('suspended', or WebKit's 'interrupted'). Never waits long. */
function wake(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'running' || ctx.state === 'closed') return Promise.resolve();
  const resumed = ctx.resume().catch(() => undefined);
  return Promise.race([resumed, new Promise<void>((r) => window.setTimeout(r, 400))]);
}

/**
 * The day guitar piece is a full tune, not a composed loop. Overlap the ending
 * with the next beginning so the join is a crossfade instead of a hard restart.
 */
function startSeamless(raw: AudioBuffer, bus: GainNode): void {
  if (!ac) return;
  // 1.4.33: the trailing silence is cut in the file itself (no runtime copy of the whole piece).
  const buf = raw;
  const fade = Math.min(8, buf.duration * 0.15);
  const step = buf.duration - fade;
  let nextAt = ac.currentTime;
  let begun = false;
  const voice = (when: number, fadeIn: boolean) => {
    if (!ac) return;
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buf;
    src.connect(g);
    g.connect(bus);
    const t0 = when;
    src.start(t0);
    src.stop(t0 + buf.duration + 0.05);
    g.gain.setValueAtTime(fadeIn ? 0 : 1, t0);
    if (fadeIn) g.gain.linearRampToValueAtTime(1, t0 + fade);
    g.gain.setValueAtTime(1, t0 + buf.duration - fade);
    g.gain.linearRampToValueAtTime(0, t0 + buf.duration);
    src.onended = () => {
      src.disconnect();
      g.disconnect();
    };
  };
  const tick = () => {
    if (!ac || ac.state !== 'running') return;
    if (nextAt - ac.currentTime > 1.2) return;
    const when = Math.max(nextAt, ac.currentTime + 0.03);
    voice(when, begun);
    begun = true;
    nextAt = when + step;
  };
  tick();
  window.setInterval(tick, 400);
}

function startLoop(id: string, dest: AudioNode): GainNode | null {
  const existing = loops.get(id);
  if (existing) return existing;
  const buf = buffers.get(id);
  if (!ac || !buf) return null;
  const gain = ac.createGain();
  gain.gain.value = 0;
  gain.connect(dest);
  if (id === 'day') startSeamless(buf, gain);
  else {
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(gain);
    src.start();
  }
  loops.set(id, gain);
  return gain;
}

function mix(events: readonly string[]): Mix {
  const has = (id: string) => events.includes(id);
  const storm = has('blackrain') || has('typhoon8') || has('thunder') ? 0.32 : has('typhoon1') ? 0.14 : 0;
  const rain = storm > 0 ? 0 : has('rainstorm') ? 0.26 : has('drizzle') || has('landslip') ? 0.1 : 0;
  return { rain, storm };
}

function applyMix(force = false): void {
  if (!ac || !master || !music) return;
  const lv = mix(want.events);
  const key = `${want.night}|${lv.rain}|${lv.storm}`;
  const beds = ['day', 'night', 'birds', 'crickets', 'rain', 'storm'];
  const pending = beds.some((id) => buffers.has(id) && !loops.has(id));
  if (!force && !pending && key === levelKey) return;
  levelKey = key;
  const day = startLoop('day', music);
  const night = startLoop('night', music);
  const birds = startLoop('birds', master);
  const crickets = startLoop('crickets', master);
  const rain = startLoop('rain', master);
  const storm = startLoop('storm', master);
  if (day) ramp(day.gain, want.night ? 0 : 0.34, FADE);
  if (night) ramp(night.gain, want.night ? 0.28 : 0, FADE);
  if (birds) ramp(birds.gain, want.night ? 0 : 0.16, FADE);
  if (crickets) ramp(crickets.gain, want.night ? 0.2 : 0, FADE);
  if (rain) ramp(rain.gain, lv.rain, FADE);
  if (storm) ramp(storm.gain, lv.storm, FADE);
  ramp(music.gain, lv.rain + lv.storm > 0.12 ? 0.45 : 0.8, FADE);
}

function refresh(): void {
  const ctx = ac;
  if (!ctx || !master) return;
  if (!wants()) {
    if (!live) return;
    live = false;
    ramp(master.gain, 0, 0.3);
    if (!quietTimer) {
      quietTimer = window.setTimeout(() => {
        quietTimer = 0;
        if (ac && !wants() && ac.state === 'running') void ac.suspend();
      }, 400);
    }
    return;
  }
  if (quietTimer) window.clearTimeout(quietTimer);
  quietTimer = 0;
  if (ctx.state !== 'running') void wake(ctx);
  if (!live) {
    live = true;
    ramp(master.gain, 0.9, 0.6);
  }
  applyMix();
}

async function resume(): Promise<boolean> {
  const ctx = ensure();
  if (!ctx) return false;
  unlocked = true;
  await wake(ctx);
  refresh();
  await loadAll();
  refresh();
  return ctx.state === 'running';
}

function shot(id: string, vol = 0.55): void {
  const buf = buffers.get(id);
  if (!ac || !sfx || !buf || ac.state !== 'running' || !soundEnabled()) return;
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buf;
  gain.gain.value = vol;
  src.connect(gain);
  gain.connect(sfx);
  src.start();
}

/**
 * 1.4.33 preload screen: create the context and decode the music for the time of day (plus the small clips),
 * so the opening starts with music. Resolves when done or failed. No-op when sound is off.
 */
export function preloadAudio(night: boolean): Promise<void> {
  want = { ...want, night };
  if (!ensure()) return Promise.resolve();
  return loadAll();
}

/** 1.4.33: load the remaining beds (weather, animals, the other music) — called ~1 s after the opening. */
export function releaseAudioExtras(): void {
  if (extras) return;
  extras = true;
  if (ac) void loadAll();
}

/** 1.4.33: any tap / key restarts a context that iOS suspended or interrupted. */
export function kickAudio(): void {
  if (!ac || !unlocked || !wants() || ac.state === 'running') return;
  void wake(ac).then(() => refresh());
}

export function audioDiag(): { state: string; sampleRate: number; currentTime: number; unlocked: boolean; sound: boolean; extras: boolean; states: string[]; files: AudioFileDiag[]; music: string } {
  return {
    state: ac ? ac.state : 'none',
    sampleRate: ac?.sampleRate ?? 0,
    currentTime: ac ? Math.round(ac.currentTime * 10) / 10 : 0,
    unlocked,
    sound: soundEnabled(),
    extras,
    states: [...stateLog],
    files: [...fileDiag.values()],
    music: musicId(),
  };
}

/** Start the bed as the opening camera moves in. No-op when sound is off. */
export function beginAmbience(): void {
  if (!soundEnabled()) return;
  void resume();
}

/** Remember the scene. Music starts after the first tap. */
export function syncAmbience(night: boolean, events: WeatherEventId[]): void {
  want = { night, events };
  if (ac && !buffers.has(musicId())) void loadOne(musicId());
  if (unlocked) refresh();
}

export function setSoundEnabled(on: boolean): void {
  try {
    kvSet(KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
  if (!on) {
    refresh();
    return;
  }
  void resume().then((ok) => {
    if (ok) shot('switch', 0.45);
  });
}

export function setPageAudible(on: boolean): void {
  pageOn = on;
  if (unlocked) refresh();
}

export function playControl(_action?: string): void {
  if (!soundEnabled()) return;
  void resume().then((ok) => {
    if (!ok) return;
    shot('switch', 0.45);
  });
}

export function playAnimal(category: AnimalCategory, motion: Motion): void {
  if (!wants() || !ac || ac.state !== 'running') return;
  const now = performance.now();
  if (now - animalAt < 2200) return;
  animalAt = now;
  const cue = animalCue(category, motion);
  if (cue) shot(cue.id, cue.vol);
}

/**
 * 1.4.45: what (if anything) plays when an animal first shows up. Birds: a soft call; frogs: their low croak, quieter.
 * Insects, butterflies, moths, fireflies, bats and ground animals: silence (no fitting soft asset; nothing shrill).
 */
export function animalCue(category: AnimalCategory, motion: Motion): { id: string; vol: number } | null {
  if (motion === 'bat' || motion === 'glow') return null;
  if (category === 'bird') return { id: 'call', vol: 0.7 };
  if (category === 'amphibian') return { id: 'frog', vol: 0.3 };
  return null;
}

/** 1.4.55 tap on the nest chick: the soft bird call clip (same as a bird arriving), quieter. */
export function playChirp(): void {
  if (!soundEnabled()) return;
  void resume().then((ok) => {
    if (!ok) return;
    shot('call', 0.5);
  });
}

/**
 * Soft "tok tok" when an egg is tapped. Two quiet knocks ~120 ms apart, synthesised here
 * (no clip file): a short damped sine, mixed on the same sfx bus as the other effects,
 * so mute and the sfx volume still apply.
 */
export function playTok(): void {
  if (!soundEnabled()) return;
  void resume().then((ok) => {
    if (!ok) return;
    knock(0);
    knock(0.12);
  });
}

function knock(delay: number): void {
  if (!ac || !sfx || ac.state !== 'running' || !soundEnabled()) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(210, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfx);
  osc.start(t);
  osc.stop(t + 0.1);
  osc.onended = () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

/** Short confirmation when a milestone or weather achievement card opens. */
export function playCelebrate(): void {
  if (!soundEnabled()) return;
  void resume().then((ok) => {
    if (ok) shot('switch', 0.5);
  });
}
