import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { onboardingDone, openPerms, permsReady, resetPermsGate, PERMS_KEY } from '../src/native/permGate';
import { setKvStore } from '../src/native/kv';
import { catchUp, smoothDamp, smootherstep, smoothstep, FRAME_CAP } from '../src/three/camEase';
import { animalCue, AUDIO_FILES } from '../src/audio';
import { ANIMALS } from '../src/data/animals';

class Mem {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

describe('1.4.45 permission prompts wait for onboarding', () => {
  afterEach(() => {
    resetPermsGate();
    setKvStore(null);
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
  it('closed for a new player until the tree is planted and the coach is done (or skipped)', () => {
    expect(onboardingDone(false, { armed: false, done: false })).toBe(false); // species / name not done
    expect(onboardingDone(true, { armed: true, done: false })).toBe(false); // watering / fertilizing coach running
    expect(onboardingDone(true, { armed: true, done: true })).toBe(true);
    expect(onboardingDone(true, { armed: false, done: false })).toBe(true); // a pre-coach existing tree
  });
  it('opens once, persists, and stays open', () => {
    const m = new Mem();
    (globalThis as { localStorage?: unknown }).localStorage = m;
    setKvStore(m);
    expect(permsReady()).toBe(false);
    expect(openPerms()).toBe(true);
    expect(openPerms()).toBe(false); // asked only once
    expect(m.getItem(PERMS_KEY)).toBe('1');
    resetPermsGate();
    expect(permsReady()).toBe(true); // next launch
  });
  it('no prompt call sits outside the gate', () => {
    const src = (f: string) => readFileSync(join(__dirname, '..', 'src', f), 'utf8');
    expect(src('native/location.ts')).toMatch(/perm\.coarseLocation !== 'denied' && permsReady\(\)\) perm = await Geolocation\.requestPermissions/);
    expect(src('native/push.ts')).toMatch(/&& permsReady\(\)\) perm = await PushNotifications\.requestPermissions/);
    expect(src('native/notify.ts')).toMatch(/if \(!permsReady\(\)\)\s*return LocalNotifications\.checkPermissions/);
    expect(src('weather.ts')).toMatch(/!ready && status\.state !== 'granted'/);
    // location first, then notifications
    const main = src('main.ts');
    const ask = main.slice(main.indexOf('async function askPermissionsInOrder'));
    expect(ask.indexOf('refreshWeather(true)')).toBeLessThan(ask.indexOf('syncPush('));
  });
});

describe('1.4.45 planting / opening camera', () => {
  it('ease-in-out timelines start and end at rest', () => {
    for (const f of [smoothstep, smootherstep]) {
      expect(f(0)).toBe(0);
      expect(f(1)).toBe(1);
      expect(f(0.01) - f(0)).toBeLessThan(0.001);
      expect(f(1) - f(0.99)).toBeLessThan(0.001);
    }
  });
  it('a 200 ms hitch is not a jump: dt stays capped and the lost time is repaid gradually', () => {
    let lag = 0;
    const steps: number[] = [];
    let total = 0;
    const frames = [1 / 60, 1 / 60, 0.2, ...Array(60).fill(1 / 60)];
    for (const raw of frames) {
      const c = catchUp(raw, lag);
      lag = c.lag;
      steps.push(c.dt);
      total += c.dt;
    }
    expect(Math.max(...steps)).toBeLessThanOrEqual(FRAME_CAP + 1e-9);
    // all real time is caught up within a second, and the speed-up per frame is at most 2×
    expect(total).toBeCloseTo(frames.reduce((a, b) => a + b, 0), 6); // fully repaid within the next second
    for (let i = 3; i < steps.length; i++) expect(steps[i]!).toBeLessThanOrEqual(2 / 60 + 1e-9);
    // speed returns to normal smoothly (non-increasing extra after the hitch)
    for (let i = 4; i < steps.length; i++) expect(steps[i]!).toBeLessThanOrEqual(steps[i - 1]! + 1e-9);
    // a huge first frame does not replay seconds of motion
    expect(catchUp(5, 0).lag).toBeLessThanOrEqual(0.6);
  });
  it('the camera spring follows a jumping goal with no full-speed first step', () => {
    let v = 0;
    let x = 10;
    const first = smoothDamp(x, 4, v, 0.6, 0.1);
    expect(Math.abs(first.value - x)).toBeLessThan(0.1 * 6); // far less than the exponential ease's first step
    for (let i = 0; i < 120; i++) {
      const r = smoothDamp(x, 4, v, 0.6, 1 / 30);
      x = r.value;
      v = r.vel;
    }
    expect(x).toBeCloseTo(4, 2);
  });
  it('scene3d uses the eased timelines (no exponential pull, no threshold snaps)', () => {
    const s = readFileSync(join(__dirname, '..', 'src', 'three', 'scene3d.ts'), 'utf8');
    expect(s).not.toMatch(/this\.zoom <= this\.groundZoom \+ 0\.05/);
    expect(s).not.toMatch(/this\.zoom >= 0\.98/);
    expect(s).toMatch(/smootherstep\(this\.pullT \/ PULL_S\)/);
  });
});

describe('1.4.45 animal arrival sounds', () => {
  it('nothing shrill: no chirp / bright bird clip; birds get the soft call, frogs the croak, the rest silence', () => {
    expect(Object.keys(AUDIO_FILES)).not.toContain('chirp');
    expect(Object.keys(AUDIO_FILES)).not.toContain('bird');
    for (const a of ANIMALS) {
      const cue = animalCue(a.category, a.motion);
      if (a.category === 'bird') expect(cue?.id, a.id).toBe('call');
      else if (a.category === 'amphibian') expect(cue?.id, a.id).toBe('frog');
      else expect(cue, a.id).toBeNull();
      if (cue) expect(cue.vol).toBeLessThanOrEqual(0.7);
    }
    for (const f of ['call.ogg', 'call.m4a']) expect(existsSync(join(__dirname, '..', 'public', 'audio', f))).toBe(true);
  });
});
