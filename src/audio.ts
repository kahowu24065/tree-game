/**
 * Day/night music, weather, button clicks and animal calls.
 * Real recordings (see public/audio/CREDITS.txt), mixed with the Web Audio API.
 * Opening the game tries to start the bed immediately. A later tap still unlocks it
 * when the platform blocked that first attempt.
 * Day and night beds crossfade over 2.5s.
 */
import type { AnimalCategory, Motion } from './data/animals';
import type { WeatherEventId } from './balance';

const KEY = 'sekai-tree-sound';
const FADE = 2.5;

const FILES: Record<string, string> = {
  day: 'day.mp3',
  night: 'night.ogg',
  birds: 'birds.ogg',
  crickets: 'crickets.mp3',
  rain: 'rain.ogg',
  storm: 'storm.ogg',
  pluck: 'pluck.ogg',
  switch: 'switch.ogg',
  bird: 'bird.wav',
  frog: 'frog.wav',
  chirp: 'chirp.wav',
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

async function loadOne(id: string): Promise<void> {
  if (buffers.has(id)) return;
  const ctx = ac;
  const file = FILES[id];
  if (!ctx || !file) return;
  try {
    const res = await fetch(fileUrl(file));
    if (!res.ok) return;
    const raw = await res.arrayBuffer();
    buffers.set(id, await ctx.decodeAudioData(raw));
  } catch {
    /* missing or undecodable file stays silent */
  }
}

function loadAll(): Promise<void> {
  if (!loading) {
    const clips = ['switch', 'pluck', 'bird', 'frog', 'chirp'];
    const beds = ['day', 'night', 'birds', 'crickets', 'rain', 'storm'];
    loading = Promise.all(clips.map(loadOne)).then(() => {
      void Promise.all(beds.map(loadOne)).then(() => {
        if (wants()) applyMix(true);
      });
    });
  }
  return loading;
}

/** Drop only the digital silence at each end, so the loop point is not a quiet gap. */
function trimSilence(buf: AudioBuffer): AudioBuffer {
  if (!ac) return buf;
  const data = buf.getChannelData(0);
  const win = Math.floor(buf.sampleRate * 0.03);
  const cap = Math.floor(buf.sampleRate * 2.5);
  const loud = (at: number) => {
    let m = 0;
    const n = Math.min(data.length, at + win);
    for (let i = at; i < n; i++) m = Math.max(m, Math.abs(data[i]));
    return m;
  };
  let start = 0;
  while (start < cap && loud(start) < 0.0015) start += win;
  let end = data.length;
  while (end > data.length - cap && loud(end - win) < 0.0015) end -= win;
  if (end - start < buf.sampleRate || (start === 0 && end === data.length)) return buf;
  const out = ac.createBuffer(buf.numberOfChannels, end - start, buf.sampleRate);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    out.getChannelData(c).set(buf.getChannelData(c).subarray(start, end));
  }
  return out;
}

/**
 * The day guitar piece is a full tune, not a composed loop. Overlap the ending
 * with the next beginning so the join is a crossfade instead of a hard restart.
 */
function startSeamless(raw: AudioBuffer, bus: GainNode): void {
  if (!ac) return;
  const buf = trimSilence(raw);
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
  if (ctx.state === 'suspended') void ctx.resume();
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
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
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

/** Start the bed as the opening camera moves in. No-op when sound is off. */
export function beginAmbience(): void {
  if (!soundEnabled()) return;
  void resume();
}

/** Remember the scene. Music starts after the first tap. */
export function syncAmbience(night: boolean, events: WeatherEventId[]): void {
  want = { night, events };
  if (unlocked) refresh();
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
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
  if (category === 'amphibian') shot('frog', 0.55);
  else if (category === 'insect' || category === 'butterfly' || motion === 'glow' || motion === 'bat') shot('chirp', 0.4);
  else if (category === 'bird') shot('bird', 0.5);
  else shot('pluck', 0.35);
}

/** Short confirmation when a milestone or weather achievement card opens. */
export function playCelebrate(): void {
  if (!soundEnabled()) return;
  void resume().then((ok) => {
    if (ok) shot('switch', 0.5);
  });
}
