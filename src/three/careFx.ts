import * as THREE from 'three';

/**
 * v15.1 care effects: 澆水 (watering can, droplets, splashes, ripples, wet soil) and 施肥 (falling fertiliser
 * granules, green sparkles up the trunk, golden ring on the soil). Each effect owns its geometries / materials and
 * disposes them when it ends (~2–2.5 s). Everything is sized from one unit `S` fixed at the start of the effect.
 */
export type CareFxKind = 'water' | 'fertilize';

export interface FxEnv {
  t: number;
  /** World position of the trunk base on the soil. */
  base: THREE.Vector3;
  trunkR: number;
  dirtR: number;
  treeH: number;
  crownY: number;
  /** Effect size unit (metres), scaled to the tree / camera framing. */
  unit: number;
  /** Camera azimuth: the camera sits at base + (sin az, ·, cos az). */
  camAz: number;
  reduced: boolean;
}

let dotTex: THREE.Texture | null = null;
/** Shared soft round sprite (kept for the app's lifetime). */
export function dotTexture(): THREE.Texture {
  if (dotTex) return dotTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(c);
  dotTex.colorSpace = THREE.SRGBColorSpace;
  return dotTex;
}

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A pool of points with per-point RGBA; hidden points get alpha 0. */
class PointPool {
  points: THREE.Points;
  pos: Float32Array;
  col: Float32Array;
  constructor(n: number, size: number, additive: boolean) {
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 4);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4));
    const m = new THREE.PointsMaterial({ size, map: dotTexture(), vertexColors: true, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true });
    this.points = new THREE.Points(geo, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
  }
  set(i: number, x: number, y: number, z: number, c: THREE.Color, a: number): void {
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.col[i * 4] = c.r;
    this.col[i * 4 + 1] = c.g;
    this.col[i * 4 + 2] = c.b;
    this.col[i * 4 + 3] = Math.max(0, Math.min(1, a));
  }
  hide(i: number): void {
    this.col[i * 4 + 3] = 0;
  }
  commit(): void {
    this.points.geometry.getAttribute('position').needsUpdate = true;
    this.points.geometry.getAttribute('color').needsUpdate = true;
  }
  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}

interface Effect {
  group: THREE.Group;
  update(t: number): boolean;
  dispose(): void;
}

function flatDisc(radius: number, material: THREE.Material, segs = 28): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, segs), material);
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 2;
  return m;
}

function ringMesh(color: THREE.ColorRepresentation, additive: boolean): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(0.86, 1, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 2;
  return m;
}

function disposeGroup(g: THREE.Object3D): void {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
}

/** Wet, darker soil that fades in and out. */
function wetSoil(env: FxEnv, radius: number): { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial } {
  const mat = new THREE.MeshStandardMaterial({ color: '#3a2716', roughness: 0.35, metalness: 0, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const mesh = flatDisc(radius, mat);
  mesh.position.set(env.base.x, env.base.y + env.unit * 0.004, env.base.z);
  return { mesh, mat };
}

/* ------------------------------------------------------------------ 澆水 */

class WaterFx implements Effect {
  group = new THREE.Group();
  private t0: number;
  private S: number;
  private can = new THREE.Group();
  private tilt = new THREE.Group();
  private tip = new THREE.Object3D();
  private drops: PointPool | null = null;
  private splash: PointPool | null = null;
  private ripples: THREE.Mesh[] = [];
  private wet: { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial };
  private land: THREE.Vector3[] = [];
  private dropStart: { ts: number; T: number; p0: THREE.Vector3 | null; landed: boolean }[] = [];
  private splashState: { t0: number; o: THREE.Vector3; v: THREE.Vector3 }[] = [];
  private splashNext = 0;
  private reduced: boolean;
  private centre: THREE.Vector3;
  private life: number;
  private dropCol = new THREE.Color('#9fd4ff');
  private splashCol = new THREE.Color('#f2faff');

  constructor(env: FxEnv) {
    this.t0 = env.t;
    this.S = env.unit;
    this.reduced = env.reduced;
    const S = this.S;
    const toCam = new THREE.Vector3(Math.sin(env.camAz), 0, Math.cos(env.camAz));
    const right = new THREE.Vector3(Math.cos(env.camAz), 0, -Math.sin(env.camAz));
    // Where the water lands: a patch on the soil between the trunk and the can.
    const reach = Math.max(env.trunkR * 1.6, env.trunkR + S * 0.22);
    this.centre = env.base.clone().addScaledVector(toCam, reach * 0.7).addScaledVector(right, reach * 0.55);
    this.life = this.reduced ? 2.2 : 2.5;
    this.wet = wetSoil(env, Math.max(env.dirtR * 0.8, reach + S * 0.3));
    this.group.add(this.wet.mesh);
    if (this.reduced) return;

    // Watering can (low-poly), beside the trunk toward the camera, spout pointing at the landing patch.
    const canPos = this.centre.clone().addScaledVector(toCam, S * 0.35).addScaledVector(right, S * 0.5);
    canPos.y = env.base.y + S * 0.95;
    this.can.position.copy(canPos);
    const dir = this.centre.clone().sub(canPos).setY(0).normalize();
    this.can.rotation.y = Math.atan2(-dir.z, dir.x);
    const metal = new THREE.MeshStandardMaterial({ color: '#4fa3d9', roughness: 0.4, metalness: 0.35, flatShading: true, transparent: true, opacity: 1 });
    const dark = new THREE.MeshStandardMaterial({ color: '#2f78ad', roughness: 0.5, metalness: 0.3, flatShading: true, transparent: true, opacity: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * S, 0.2 * S, 0.3 * S, 12), metal);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17 * S, 0.018 * S, 5, 14), dark);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.15 * S;
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.022 * S, 0.038 * S, 0.42 * S, 6), dark);
    // Spout leaves the body low on the +x side, rising outward at ~50°.
    spout.position.set(0.3 * S, 0.02 * S, 0);
    spout.rotation.z = -0.87;
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * S, 0.02 * S, 0.06 * S, 8), dark);
    rose.position.set(0.47 * S, 0.17 * S, 0);
    rose.rotation.z = -0.87;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12 * S, 0.02 * S, 5, 12, Math.PI), dark);
    handle.position.set(-0.16 * S, 0.06 * S, 0);
    handle.rotation.z = Math.PI / 2;
    this.tip.position.set(0.5 * S, 0.2 * S, 0);
    this.tilt.add(body, rim, spout, rose, handle, this.tip);
    this.can.add(this.tilt);
    this.can.scale.setScalar(0.001);
    this.group.add(this.can);

    // Droplets and splashes.
    const n = 70;
    this.drops = new PointPool(n, 0.1 * S, false);
    this.splash = new PointPool(80, 0.06 * S, false);
    for (let i = 0; i < n; i++) {
      const a = hash(i, 1) * Math.PI * 2;
      const r = Math.sqrt(hash(i, 2)) * S * 0.28;
      this.land.push(this.centre.clone().add(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)));
      this.dropStart.push({ ts: 0.5 + (i / n) * 1.05 + hash(i, 3) * 0.06, T: 0.3 + hash(i, 4) * 0.1, p0: null, landed: false });
      this.drops.hide(i);
    }
    for (let i = 0; i < 80; i++) {
      this.splash.hide(i);
      this.splashState.push({ t0: -1, o: new THREE.Vector3(), v: new THREE.Vector3() });
    }
    this.group.add(this.drops.points, this.splash.points);
    for (let i = 0; i < 3; i++) {
      const ring = ringMesh('#e8f6ff', false);
      ring.position.set(this.centre.x, env.base.y + S * 0.006, this.centre.z);
      ring.visible = false;
      this.ripples.push(ring);
      this.group.add(ring);
    }
  }

  update(t: number): boolean {
    const a = t - this.t0;
    if (a > this.life) return false;
    // Wet soil: in by 0.9 s, holds, out by the end.
    const wetK = ease((a - (this.reduced ? 0 : 0.45)) / 0.5) * (1 - ease((a - (this.life - 0.7)) / 0.7));
    this.wet.mat.opacity = 0.55 * wetK;
    if (this.reduced) return true;
    const S = this.S;
    // Can: pops in, tilts to pour, tilts back, pops out.
    const inK = ease(a / 0.25);
    const outK = 1 - ease((a - 1.85) / 0.3);
    this.can.scale.setScalar(Math.max(0.001, inK * outK));
    const pour = ease((a - 0.2) / 0.3) * (1 - ease((a - 1.6) / 0.3));
    this.tilt.rotation.z = -0.75 * pour;
    this.can.updateMatrixWorld(true);
    const tipW = this.tip.getWorldPosition(new THREE.Vector3());
    // Drops fall from the rose to the soil (accelerating), then splash.
    const drops = this.drops!;
    for (let i = 0; i < this.dropStart.length; i++) {
      const d = this.dropStart[i]!;
      const u = (a - d.ts) / d.T;
      if (u < 0) continue;
      if (!d.p0) d.p0 = tipW.clone().add(new THREE.Vector3((hash(i, 5) - 0.5) * 0.05 * S, 0, (hash(i, 6) - 0.5) * 0.05 * S));
      if (u >= 1) {
        drops.hide(i);
        if (!d.landed) {
          d.landed = true;
          this.spawnSplash(this.land[i]!, a, i);
        }
        continue;
      }
      const L = this.land[i]!;
      const x = d.p0.x + (L.x - d.p0.x) * u;
      const z = d.p0.z + (L.z - d.p0.z) * u;
      const y = d.p0.y + (L.y - d.p0.y) * u * u;
      drops.set(i, x, y, z, this.dropCol, 0.9);
    }
    drops.commit();
    const sp = this.splash!;
    const g = 5 * S;
    for (let i = 0; i < this.splashState.length; i++) {
      const s = this.splashState[i]!;
      const age = a - s.t0;
      if (s.t0 < 0 || age > 0.38) {
        sp.hide(i);
        continue;
      }
      const y = s.o.y + s.v.y * age - 0.5 * g * age * age;
      if (y < s.o.y) {
        sp.hide(i);
        continue;
      }
      sp.set(i, s.o.x + s.v.x * age, y, s.o.z + s.v.z * age, this.splashCol, 0.95 * (1 - age / 0.38));
    }
    sp.commit();
    // Ripples on the wet patch.
    this.ripples.forEach((ring, i) => {
      const r = (a - (0.75 + i * 0.4)) / 0.8;
      ring.visible = r > 0 && r < 1;
      if (!ring.visible) return;
      ring.scale.setScalar(S * (0.08 + r * 0.42));
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - r);
    });
    return true;
  }

  private spawnSplash(o: THREE.Vector3, a: number, i: number): void {
    const S = this.S;
    for (let k = 0; k < 2; k++) {
      const s = this.splashState[this.splashNext]!;
      this.splashNext = (this.splashNext + 1) % this.splashState.length;
      const ang = hash(i, 10 + k) * Math.PI * 2;
      const sp = (0.35 + hash(i, 12 + k) * 0.4) * S;
      s.t0 = a;
      s.o.copy(o);
      s.v.set(Math.cos(ang) * sp, (0.7 + hash(i, 14 + k) * 0.5) * S, Math.sin(ang) * sp);
    }
  }

  dispose(): void {
    this.drops?.dispose();
    this.splash?.dispose();
    this.group.remove(...[this.drops?.points, this.splash?.points].filter((x): x is THREE.Points => Boolean(x)));
    disposeGroup(this.group);
  }
}

/* ------------------------------------------------------------------ 施肥 */

class FertFx implements Effect {
  group = new THREE.Group();
  private t0: number;
  private S: number;
  private reduced: boolean;
  private grains: PointPool;
  private sparks: PointPool | null = null;
  private ring: THREE.Mesh;
  private g: { L: THREE.Vector3; y0: number; ts: number; T: number; c: THREE.Color; p0: THREE.Vector3 | null }[] = [];
  private sack = new THREE.Group();
  private sackTilt = new THREE.Group();
  private mouth = new THREE.Object3D();
  private s: { a0: number; r: number; ts: number; life: number; c: THREE.Color; top: number }[] = [];
  private base: THREE.Vector3;
  private ringR: number;
  private life = 2.3;

  constructor(env: FxEnv) {
    this.t0 = env.t;
    this.S = env.unit;
    this.reduced = env.reduced;
    this.base = env.base.clone();
    const S = this.S;
    const inner = env.trunkR * 1.35 + S * 0.03;
    const outer = Math.max(env.dirtR * 0.75, inner + S * 0.35);
    this.ringR = outer;
    const palette = ['#5a3417', '#f3d16a', '#c98a3c', '#ffe7a0', '#e0a93e', '#3f2410'].map((c) => new THREE.Color(c));
    const n = 90;
    this.grains = new PointPool(n, 0.085 * S, false);
    for (let i = 0; i < n; i++) {
      const a = hash(i, 21) * Math.PI * 2;
      const r = inner + Math.sqrt(hash(i, 22)) * (outer - inner);
      const L = new THREE.Vector3(this.base.x + Math.cos(a) * r, this.base.y + S * 0.012, this.base.z + Math.sin(a) * r);
      this.g.push({ L, y0: L.y + S * (0.8 + hash(i, 23) * 0.6), ts: 0.3 + hash(i, 24) * 0.85, T: 0.34 + hash(i, 25) * 0.16, c: palette[i % palette.length]!, p0: null });
      this.grains.hide(i);
    }
    this.group.add(this.grains.points);
    if (!this.reduced) {
      // A small burlap sack, tipped over the soil on the camera-left side of the trunk.
      const toCam = new THREE.Vector3(Math.sin(env.camAz), 0, Math.cos(env.camAz));
      const right = new THREE.Vector3(Math.cos(env.camAz), 0, -Math.sin(env.camAz));
      const at = this.base.clone().addScaledVector(toCam, env.trunkR + S * 0.45).addScaledVector(right, -S * 0.6);
      at.y = this.base.y + S * 0.95;
      this.sack.position.copy(at);
      const dir = this.base.clone().sub(at).setY(0).normalize();
      this.sack.rotation.y = Math.atan2(-dir.z, dir.x);
      const burlap = new THREE.MeshStandardMaterial({ color: '#c9a36a', roughness: 1, flatShading: true });
      const band = new THREE.MeshStandardMaterial({ color: '#7a5a34', roughness: 1, flatShading: true });
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.2 * S, 8, 6), burlap);
      bag.scale.set(1.25, 0.95, 0.9);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * S, 0.12 * S, 0.14 * S, 8, 1, true), burlap);
      neck.rotation.z = -Math.PI / 2;
      neck.position.set(0.27 * S, 0.02 * S, 0);
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.1 * S, 0.018 * S, 4, 10), band);
      tie.rotation.y = Math.PI / 2;
      tie.position.set(0.22 * S, 0.02 * S, 0);
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.07 * S, 6), new THREE.MeshBasicMaterial({ color: '#5fae3e', side: THREE.DoubleSide }));
      leaf.position.set(0, 0.02 * S, 0.182 * S);
      this.mouth.position.set(0.36 * S, 0.02 * S, 0);
      this.sackTilt.add(bag, neck, tie, leaf, this.mouth);
      this.sack.add(this.sackTilt);
      this.sack.scale.setScalar(0.001);
      this.group.add(this.sack);
    }
    this.ring = ringMesh('#ffd66b', true);
    this.ring.position.set(this.base.x, this.base.y + S * 0.008, this.base.z);
    this.group.add(this.ring);
    if (this.reduced) return;
    const m = 48;
    this.sparks = new PointPool(m, 0.15 * S, true);
    const greens = ['#b8ff6a', '#e4ff9a', '#7dff8f', '#fff3a0'].map((c) => new THREE.Color(c));
    const top = Math.max(S * 0.8, Math.min(env.crownY > 0 ? env.crownY : env.treeH * 0.6, env.treeH * 0.75));
    for (let i = 0; i < m; i++) {
      this.s.push({ a0: hash(i, 31) * Math.PI * 2, r: env.trunkR * 1.25 + S * (0.04 + hash(i, 32) * 0.12), ts: 0.4 + hash(i, 33) * 0.95, life: 0.85 + hash(i, 34) * 0.35, c: greens[i % greens.length]!, top: top * (0.55 + hash(i, 35) * 0.45) });
      this.sparks.hide(i);
    }
    this.group.add(this.sparks.points);
  }

  update(t: number): boolean {
    const a = t - this.t0;
    if (a > this.life) return false;
    const fade = 1 - ease((a - 1.8) / 0.45);
    let mouthW: THREE.Vector3 | null = null;
    if (!this.reduced) {
      this.sack.scale.setScalar(Math.max(0.001, ease(a / 0.25) * (1 - ease((a - 1.5) / 0.3))));
      this.sackTilt.rotation.z = -0.9 * ease((a - 0.15) / 0.25) * (1 - ease((a - 1.3) / 0.3));
      this.sack.updateMatrixWorld(true);
      mouthW = this.mouth.getWorldPosition(new THREE.Vector3());
    }
    for (let i = 0; i < this.g.length; i++) {
      const g = this.g[i]!;
      if (this.reduced) {
        this.grains.set(i, g.L.x, g.L.y, g.L.z, g.c, fade * ease(a / 0.3));
        continue;
      }
      const u = (a - g.ts) / g.T;
      if (u < 0) {
        this.grains.hide(i);
        continue;
      }
      const k = Math.min(1, u);
      // Tossed from the sack's mouth in a small arc, then rests on the soil and sinks in.
      if (!g.p0) g.p0 = (mouthW ?? g.L).clone().add(new THREE.Vector3((hash(i, 26) - 0.5) * 0.06 * this.S, 0, (hash(i, 27) - 0.5) * 0.06 * this.S));
      const p0 = g.p0;
      if (u < 1) {
        const y = p0.y + (g.L.y - p0.y) * k * k + this.S * 0.35 * k * (1 - k);
        this.grains.set(i, p0.x + (g.L.x - p0.x) * k, y, p0.z + (g.L.z - p0.z) * k, g.c, fade);
      } else {
        const y = g.L.y + Math.max(0, Math.sin((u - 1) * 9) * 0.03 * this.S * Math.exp(-(u - 1) * 4));
        this.grains.set(i, g.L.x, y, g.L.z, g.c, fade);
      }
    }
    this.grains.commit();
    const rk = this.reduced ? Math.sin(Math.min(1, a / this.life) * Math.PI) : ease((a - 0.35) / 0.35) * (1 - ease((a - 1.1) / 0.8));
    this.ring.scale.setScalar(this.reduced ? this.ringR : this.ringR * (0.35 + 0.65 * ease((a - 0.3) / 1.2)));
    (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * rk;
    if (this.sparks) {
      for (let i = 0; i < this.s.length; i++) {
        const s = this.s[i]!;
        const u = (a - s.ts) / s.life;
        if (u < 0 || u > 1) {
          this.sparks.hide(i);
          continue;
        }
        const ang = s.a0 + u * 3.2;
        const r = s.r * (1 - u * 0.25);
        this.sparks.set(i, this.base.x + Math.cos(ang) * r, this.base.y + this.S * 0.05 + s.top * ease(u * 1.1), this.base.z + Math.sin(ang) * r, s.c, Math.sin(u * Math.PI) * (0.7 + 0.3 * Math.sin(a * 20 + i)));
      }
      this.sparks.commit();
    }
    return true;
  }

  dispose(): void {
    this.grains.dispose();
    this.sparks?.dispose();
    this.group.remove(this.grains.points);
    if (this.sparks) this.group.remove(this.sparks.points);
    disposeGroup(this.group);
  }
}

/** Runs the queued / live care effects. */
export class CareFx {
  root = new THREE.Group();
  private pending: CareFxKind[] = [];
  private live: Effect[] = [];
  /** Effect clock (seconds); runs at `timeScale` × real time (checks slow it down to screenshot mid-animation). */
  private clock = 0;
  private lastT: number | null = null;
  timeScale = 1;

  play(kind: CareFxKind): void {
    if (this.pending.length < 3) this.pending.push(kind);
  }

  /** Live effect count (for checks). */
  count(): number {
    return this.live.length + this.pending.length;
  }

  update(env: FxEnv): void {
    const dt = this.lastT === null || !this.live.length ? 0 : Math.max(0, Math.min(0.1, env.t - this.lastT));
    this.lastT = env.t;
    this.clock += dt * this.timeScale;
    env = { ...env, t: this.clock };
    for (const kind of this.pending.splice(0)) {
      // One of each kind at a time: a quick second tap restarts it.
      const fx = kind === 'water' ? new WaterFx(env) : new FertFx(env);
      const same = this.live.findIndex((e) => (kind === 'water' ? e instanceof WaterFx : e instanceof FertFx));
      if (same >= 0) this.end(same);
      this.live.push(fx);
      this.root.add(fx.group);
    }
    for (let i = this.live.length - 1; i >= 0; i--) if (!this.live[i]!.update(env.t)) this.end(i);
  }

  private end(i: number): void {
    const fx = this.live[i]!;
    this.root.remove(fx.group);
    fx.dispose();
    this.live.splice(i, 1);
  }
}
