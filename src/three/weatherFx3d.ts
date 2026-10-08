/**
 * 1.4.59 weather visuals on top of the existing rain streaks / sway / storm sky / lightning / heat light:
 * rain scaled to the real rainfall, wet darker ground with splashes, black-rain gloom, lightning for 雷暴 warnings,
 * flying leaves in gale / typhoon gust pulses, low mist for fog / haze and cold mornings, frosty ground tint for 寒冷,
 * soft light shafts on clear days. Everything is a few hundred points at most and eases in / out; reduced motion
 * keeps only the still parts (tints, wet ground, fog).
 */
import * as THREE from 'three';
import type { DayCond } from '../types';

export interface WeatherLook {
  /** 0 … 1 rain streak density (0 = none). */
  rain: number;
  /** Ground wetness target 0 … 1. */
  wet: number;
  /** 黑雨-class downpour: extra gloom. */
  black: boolean;
  /** Lightning: typhoon, thunderstorm code, or a 雷暴 warning in force. */
  lightning: boolean;
  /** Fog / mist / haze density 0 … 1 (WMO 45 / 48). */
  fog: number;
  /** 寒冷 in force: frosty ground, cool light, low breath-like mist. */
  cold: boolean;
  /** Gale / typhoon: leaves fly in the gust pulses (0 … 1). */
  leaves: number;
  /** Clear-sky daytime light shafts (0 … 1, before daylight). */
  sunny: number;
}

/** Rain density from the real rainfall (mm in the hour) with the weather code / warning as the floor. */
export function rainIntensity(c: DayCond): number {
  const mm = Math.max(0, c.precipMm || 0);
  const byMm = mm > 0 ? Math.min(0.85, 0.22 + 0.19 * Math.log2(1 + mm)) : 0;
  if (c.precipMm >= 70) return 1;
  if (c.stormKind === 'heavy-rain' || mm >= 25 || c.code === 65 || c.code === 82) return Math.min(0.95, Math.max(0.8, 0.8 + (mm - 25) / 300));
  const raining = c.raining || (c.code >= 51 && c.code <= 67) || (c.code >= 80 && c.code <= 82);
  if (!raining) return 0;
  const floor = c.code >= 63 && c.code !== 71 ? 0.55 : c.code >= 61 || c.code >= 80 ? 0.35 : 0.25;
  return Math.max(floor, byMm);
}

export function weatherLook(c: DayCond, sway: number): WeatherLook {
  const rain = rainIntensity(c);
  const fog = c.code === 45 || c.code === 48 ? 1 : 0;
  const clear = !c.raining && !c.stormKind && c.code <= 1 && !fog;
  return {
    rain,
    wet: rain > 0 ? Math.min(1, 0.45 + rain * 0.6) : 0,
    black: c.precipMm >= 70,
    lightning: c.stormKind === 'typhoon' || c.code >= 95 || Boolean(c.thunder),
    fog,
    cold: Boolean(c.cold),
    leaves: c.stormKind === 'typhoon' ? 1 : c.stormKind === 'gale' || sway >= 0.6 ? 0.6 : 0,
    sunny: clear && !c.hot ? (c.code === 0 ? 1 : 0.6) : 0,
  };
}

function softDot(size = 64, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)'): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  if (!g) return null;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner);
  gr.addColorStop(1, outer);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SPLASH_N = 64;
const LEAF_N = 48;
const MIST_N = 18;

export interface WeatherFxFrame {
  t: number;
  dt: number;
  look: WeatherLook;
  /** Island centre (world) and its walkable radius (world). */
  centre: THREE.Vector3;
  radius: number;
  /** World ground height at a world x / z. */
  groundAt: (x: number, z: number) => number;
  /** 0 … 1 gust pulse and wind level (from the sway code). */
  gust: number;
  wind: number;
  /** View span (world) around the subject, for leaf / mist sizes. */
  span: number;
  reduced: boolean;
  /** Ground meshes to wet / frost (grass, dirt, habitat ground). */
  ground: THREE.Mesh[];
}

export class WeatherFx {
  readonly root = new THREE.Group();
  /** Eased states (read by the scene for sky / fog / lights). */
  wetK = 0;
  fogK = 0;
  coldK = 0;
  blackK = 0;
  private splash: THREE.Points;
  private leaves: THREE.Points;
  private mist: THREE.Points;
  private seeds = new Float32Array(Math.max(SPLASH_N, LEAF_N, MIST_N) * 4);
  private leafPos = new Float32Array(LEAF_N * 3);
  private leafK = 0;
  private tinted = false;
  private dryMats = new Map<THREE.Mesh, { mat: THREE.MeshStandardMaterial; color: THREE.Color; rough: number }>();

  constructor() {
    for (let i = 0; i < this.seeds.length; i++) this.seeds[i] = Math.random();
    const pts = (n: number, mat: THREE.PointsMaterial) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      p.visible = false;
      this.root.add(p);
      return p;
    };
    const dot = softDot();
    this.splash = pts(SPLASH_N, new THREE.PointsMaterial({ color: '#e8f2fb', size: 3, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, map: dot ?? undefined }));
    const leafGeoColors = new Float32Array(LEAF_N * 3);
    const tones = ['#5f9b3c', '#7fb348', '#c9a13b', '#9a7a3a'].map((h) => new THREE.Color(h));
    for (let i = 0; i < LEAF_N; i++) tones[i % tones.length]!.toArray(leafGeoColors, i * 3);
    this.leaves = pts(LEAF_N, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
    this.leaves.geometry.setAttribute('color', new THREE.BufferAttribute(leafGeoColors, 3));
    this.mist = pts(MIST_N, new THREE.PointsMaterial({ color: '#eef3f6', size: 1, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, map: softDot(64, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)') ?? undefined }));
  }

  update(f: WeatherFxFrame): void {
    const { dt, t, look, reduced } = f;
    const ease = (cur: number, goal: number, rate: number) => cur + (goal - cur) * (1 - Math.exp(-dt * rate));
    // Ground dries slower than it wets.
    this.wetK = ease(this.wetK, look.wet, look.wet > this.wetK ? 0.6 : 0.12);
    this.fogK = ease(this.fogK, look.fog, 0.5);
    this.coldK = ease(this.coldK, look.cold ? 1 : 0, 0.5);
    this.blackK = ease(this.blackK, look.black ? 1 : 0, 0.6);
    this.leafK = ease(this.leafK, reduced ? 0 : look.leaves, 0.8);
    this.tintGround(f.ground);
    this.stepSplash(f);
    this.stepLeaves(f);
    this.stepMist(f);
    void t;
  }

  /** Wet: darker, glossier ground. Cold: a pale frosty cast. Materials are cloned once per mesh (no recompiles). */
  private tintGround(meshes: THREE.Mesh[]): void {
    const w = this.wetK;
    const c = this.coldK;
    const dry = w < 0.002 && c < 0.002;
    if (dry && !this.tinted) return;
    this.tinted = !dry;
    if (this.dryMats.size > meshes.length * 3) for (const m of [...this.dryMats.keys()]) if (!meshes.includes(m)) this.dryMats.delete(m);
    const frost = new THREE.Color('#dfe9f2');
    for (const m of meshes) {
      let rec = this.dryMats.get(m);
      if (!rec) {
        const src = m.material;
        if (!(src instanceof THREE.MeshStandardMaterial)) continue;
        const own = src.clone();
        m.material = own;
        rec = { mat: own, color: src.color.clone(), rough: src.roughness };
        this.dryMats.set(m, rec);
      }
      rec.mat.color.copy(rec.color).multiplyScalar(1 - 0.3 * w).lerp(frost, 0.22 * c * (1 - w * 0.5));
      rec.mat.roughness = Math.max(0.35, rec.rough - 0.4 * w);
    }
    if (dry) {
      // Fully dry again: exact original colours.
      for (const rec of this.dryMats.values()) {
        rec.mat.color.copy(rec.color);
        rec.mat.roughness = rec.rough;
      }
    }
  }

  /** Little splash flecks hopping on the ground while it rains. */
  private stepSplash(f: WeatherFxFrame): void {
    const k = f.reduced ? 0 : f.look.rain;
    const mat = this.splash.material as THREE.PointsMaterial;
    this.splash.visible = k > 0.05;
    if (!this.splash.visible) return;
    const pos = this.splash.geometry.getAttribute('position') as THREE.BufferAttribute;
    const n = Math.max(8, Math.floor(SPLASH_N * k));
    this.splash.geometry.setDrawRange(0, n);
    const s = this.seeds;
    for (let i = 0; i < n; i++) {
      // Each fleck lives ~0.18 s, then jumps to a new spot (hash of its slot and its life count).
      const life = f.t * 5.5 + s[i * 4]! * 7;
      const gen = Math.floor(life);
      const u = life - gen;
      const h1 = Math.abs(Math.sin((i + 1) * 12.9898 + gen * 78.233)) % 1;
      const h2 = Math.abs(Math.sin((i + 1) * 39.3468 + gen * 11.135)) % 1;
      const r = Math.sqrt(h1) * f.radius * 0.92;
      const a = h2 * Math.PI * 2;
      const x = f.centre.x + Math.cos(a) * r;
      const z = f.centre.z + Math.sin(a) * r;
      pos.setXYZ(i, x, f.groundAt(x, z) + u * (1 - u) * f.span * 0.012, z);
    }
    pos.needsUpdate = true;
    mat.size = 2 + k * 2.5;
    mat.opacity = 0.35 + 0.45 * k;
  }

  /** Leaves torn off in gale / typhoon gusts, streaming downwind across the view. */
  private stepLeaves(f: WeatherFxFrame): void {
    const k = this.leafK * (0.25 + 0.75 * f.gust);
    this.leaves.visible = k > 0.03;
    if (!this.leaves.visible) return;
    const pos = this.leaves.geometry.getAttribute('position') as THREE.BufferAttribute;
    const n = Math.max(4, Math.floor(LEAF_N * Math.min(1, k * 1.2)));
    this.leaves.geometry.setDrawRange(0, n);
    const span = f.span;
    const s = this.seeds;
    const speed = span * (0.25 + 0.55 * f.wind) * (0.7 + f.gust);
    for (let i = 0; i < n; i++) {
      let x = this.leafPos[i * 3]!;
      if (x === 0 && this.leafPos[i * 3 + 1] === 0) x = (s[i * 4 + 1]! - 0.5) * span * 1.4;
      x += speed * f.dt * (0.6 + s[i * 4 + 2]! * 0.8);
      if (x > span * 0.7) x = -span * 0.7;
      const y = (s[i * 4 + 3]! - 0.45) * span * 0.6 + Math.sin(f.t * (2 + s[i * 4]! * 3) + i) * span * 0.03;
      const z = (s[i * 4]! - 0.5) * span * 1.2 + Math.cos(f.t * 1.7 + i) * span * 0.02;
      this.leafPos[i * 3] = x;
      this.leafPos[i * 3 + 1] = y;
      this.leafPos[i * 3 + 2] = z;
      pos.setXYZ(i, f.centre.x + x, f.centre.y + y, f.centre.z + z);
    }
    pos.needsUpdate = true;
    (this.leaves.material as THREE.PointsMaterial).opacity = Math.min(0.95, 0.4 + k * 0.6);
  }

  /** Low drifting mist: fog / haze, or a breath-like ground mist on cold days. */
  private stepMist(f: WeatherFxFrame): void {
    const k = Math.max(this.fogK, this.coldK * 0.55);
    this.mist.visible = k > 0.03;
    if (!this.mist.visible) return;
    const pos = this.mist.geometry.getAttribute('position') as THREE.BufferAttribute;
    const s = this.seeds;
    const drift = f.reduced ? 0 : f.t * 0.02;
    for (let i = 0; i < MIST_N; i++) {
      const a = s[i * 4]! * Math.PI * 2 + drift * (0.5 + s[i * 4 + 1]!);
      const r = (0.35 + s[i * 4 + 2]! * 0.75) * f.radius;
      const x = f.centre.x + Math.cos(a) * r;
      const z = f.centre.z + Math.sin(a) * r;
      const breathe = f.reduced ? 0 : Math.sin(f.t * 0.4 + i) * 0.04;
      pos.setXYZ(i, x, f.groundAt(x, z) + f.radius * (0.05 + s[i * 4 + 3]! * 0.08 + breathe), z);
    }
    pos.needsUpdate = true;
    const mat = this.mist.material as THREE.PointsMaterial;
    mat.size = f.radius * (0.9 + this.fogK * 0.5);
    mat.opacity = 0.22 * k;
  }

  dispose(): void {
    for (const p of [this.splash, this.leaves, this.mist]) {
      p.geometry.dispose();
      const m = p.material as THREE.PointsMaterial;
      m.map?.dispose();
      m.dispose();
    }
    for (const rec of this.dryMats.values()) rec.mat.dispose();
    this.dryMats.clear();
  }
}
