import * as THREE from 'three';
import { PointPool } from './careFx';
import { clippedMat, jaggedCap, type TreeBuild, type TreePart } from './tree3d';
import { limb, merge, paint } from './util3d';

/**
 * v16 collapse / death effects.
 *  - SplitTree: a tree cut in two at a height with material clipping planes (no geometry surgery), the upper part on a
 *    pivot at the break so it can sway, snap and topple. Pale splintered caps cover both faces of the break.
 *  - FallFx: the timelines — 'collapse' (sway, snap, top falls, fades, the real shorter tree settles), 'fatal' (the
 *    third collapse: snaps at the base, the whole tree falls and stays as the dead log) and 'death' (leaves drop, the
 *    tree leans, falls with a dust burst and stays as the dead log). Reduced motion: short fades.
 *  - LeafLoop: the 瀕死 / weak-tree falling-leaf loop.  - fallenLog(): the snapped top lying beside the tree for a few days.
 * Everything is in tree space (metres, the tree base at the origin); the scene parents it to its tree pivot.
 */
export type FallMode = 'collapse' | 'fatal' | 'death';

const V3 = THREE.Vector3;
const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const DEAD_BARK = new THREE.Color('#8f8577');

/** Random canopy vertex colours (the species' own foliage colours) for leaf particles. */
function canopyColours(build: TreeBuild, n: number): THREE.Color[] {
  const out: THREE.Color[] = [];
  const attr = build.canopy?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
  if (!attr || !attr.count) return [new THREE.Color('#5f9a3e'), new THREE.Color('#7fb24a')];
  for (let i = 0; i < n; i++) {
    const k = Math.floor(hash(i, 3) * attr.count);
    out.push(new THREE.Color(attr.getX(k), attr.getY(k), attr.getZ(k)));
  }
  return out;
}

/** Random canopy vertex positions (model units, canopy mesh space). */
function canopyPoints(build: TreeBuild, n: number, seed: number): THREE.Vector3[] {
  const pos = build.canopy?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
  const out: THREE.Vector3[] = [];
  if (!pos || !pos.count) return out;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(hash(i + seed, 7) * pos.count);
    out.push(new V3(pos.getX(k), pos.getY(k), pos.getZ(k)));
  }
  return out;
}

/* ------------------------------------------------------------------ split tree */

export class SplitTree {
  readonly root = new THREE.Group();
  readonly lower = new THREE.Group();
  /** At the break; rotate / move it to topple the upper part. */
  readonly pivot = new THREE.Group();
  private offset = new THREE.Group();
  private planes: { plane: THREE.Plane; local: THREE.Plane; upper: boolean }[] = [];
  readonly mats: { m: THREE.MeshStandardMaterial; upper: boolean; part: TreePart }[] = [];
  readonly upperInner: THREE.Object3D;
  readonly lowerInner: THREE.Object3D;
  readonly cutY: number;
  readonly axis: { x: number; z: number; r: number };
  /** Length of the upper part (metres). */
  readonly upperLen: number;
  private capGeos: THREE.BufferGeometry[] = [];
  private stumpCap: THREE.Mesh | null = null;

  readonly build: TreeBuild;
  constructor(build: TreeBuild, cutY: number, opts: { upperTransparent?: boolean; lowerTransparent?: boolean; caps?: boolean } = {}) {
    this.build = build;
    const inner = build.group.children[0]!;
    this.cutY = cutY;
    this.axis = build.trunkAxis(cutY);
    this.upperLen = Math.max(0.05, build.visibleTop - cutY);
    this.lowerInner = inner.clone(true);
    this.upperInner = inner.clone(true);
    const plane = (normalY: number, y: number, upper: boolean) => {
      const local = new THREE.Plane(new V3(0, normalY, 0), -normalY * y);
      const p = local.clone();
      this.planes.push({ plane: p, local, upper });
      return p;
    };
    const lowerCut = plane(-1, cutY, false);
    const upperCut = plane(1, cutY, true);
    // A broken top stays broken while the tree falls: both halves keep its clip heights.
    const bc = build.brokenCut;
    const extra = (upper: boolean, part: TreePart) => (bc ? [plane(-1, part === 'leaf' ? bc.leaf : bc.bark, upper)] : []);
    const dress = (obj: THREE.Object3D, upper: boolean, transparent: boolean) => {
      const drop: THREE.Object3D[] = [];
      const cache = new Map<THREE.Material, THREE.MeshStandardMaterial>();
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const part = (mesh.userData.treePart ?? 'extra') as TreePart;
        if (part === 'extra') {
          if (upper) drop.push(mesh);
          return;
        }
        const base = mesh.material as THREE.Material;
        let m = cache.get(base);
        if (!m) {
          const own = mesh.userData.brokenCap ? [] : extra(upper, part);
          m = clippedMat(base, [upper ? upperCut : lowerCut, ...own], transparent);
          cache.set(base, m);
          this.mats.push({ m, upper, part });
        }
        mesh.material = m;
      });
      drop.forEach((o) => o.removeFromParent());
    };
    dress(this.lowerInner, false, Boolean(opts.lowerTransparent));
    dress(this.upperInner, true, Boolean(opts.upperTransparent));
    this.root.add(this.lower);
    this.lower.add(this.lowerInner);
    this.pivot.position.set(this.axis.x, cutY, this.axis.z);
    this.offset.position.set(-this.axis.x, -cutY, -this.axis.z);
    this.root.add(this.pivot);
    this.pivot.add(this.offset);
    this.offset.add(this.upperInner);
    if (opts.caps !== false) {
      const r = Math.max(0.01, this.axis.r * 1.03);
      const up = jaggedCap(r, 3);
      const down = jaggedCap(r, 9, true);
      this.capGeos.push(up, down);
      const capMat = barkLikeMat();
      this.stumpCap = new THREE.Mesh(up, capMat);
      this.stumpCap.position.set(this.axis.x, cutY - r * 0.12, this.axis.z);
      this.stumpCap.castShadow = true;
      this.stumpCap.visible = false;
      this.lower.add(this.stumpCap);
      const end = new THREE.Mesh(down, capMat);
      end.position.set(0, r * 0.12, 0);
      end.castShadow = true;
      end.visible = false;
      end.name = 'log-end';
      this.pivot.add(end);
    }
  }

  /** Show the pale break faces (after the snap). */
  showBreak(on: boolean): void {
    if (this.stumpCap) this.stumpCap.visible = on;
    const end = this.pivot.getObjectByName('log-end');
    if (end) end.visible = on;
  }

  /** Keep the world-space clipping planes on the moving halves; call after the scene's matrices update. */
  sync(): void {
    this.root.updateWorldMatrix(true, true);
    for (const p of this.planes) p.plane.copy(p.local).applyMatrix4(p.upper ? this.offset.matrixWorld : this.root.matrixWorld);
  }

  setOpacity(upper: boolean, part: TreePart | 'all', a: number): void {
    for (const e of this.mats) if (e.upper === upper && (part === 'all' || e.part === part)) {
      e.m.opacity = a;
      e.m.depthWrite = a > 0.98;
    }
  }

  setVisible(upper: boolean, part: TreePart, on: boolean): void {
    for (const e of this.mats) if (e.upper === upper && e.part === part) e.m.visible = on;
  }

  /** Bark tint toward weathered grey-brown (0 … 1). */
  tintBark(k: number): void {
    for (const e of this.mats) if (e.part === 'bark') e.m.color.setRGB(1, 1, 1).lerp(DEAD_BARK, k);
  }

  /** Root-space position of a point given in the upper part's model space (canopy vertices). */
  upperToRoot(p: THREE.Vector3): THREE.Vector3 {
    this.root.updateWorldMatrix(true, true);
    const w = p.clone().applyMatrix4(this.upperInner.matrixWorld);
    return this.root.worldToLocal(w);
  }

  lowerToRoot(p: THREE.Vector3): THREE.Vector3 {
    this.root.updateWorldMatrix(true, true);
    const w = p.clone().applyMatrix4(this.lowerInner.matrixWorld);
    return this.root.worldToLocal(w);
  }

  dispose(): void {
    this.root.removeFromParent();
    this.mats.forEach((e) => e.m.dispose());
    this.capGeos.forEach((g) => g.dispose());
    this.build.dispose();
  }
}

let barkLike: THREE.MeshStandardMaterial | null = null;
function barkLikeMat(): THREE.MeshStandardMaterial {
  barkLike ??= new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 });
  return barkLike;
}

/* ------------------------------------------------------------------ particles */

interface Part {
  p: THREE.Vector3;
  v: THREE.Vector3;
  age: number;
  life: number;
  c: THREE.Color;
  kind: 0 | 1 | 2;
  seed: number;
}

/** Leaves (flutter, slow fall), bark chips (ballistic) and dust (spreads, rises, fades) in one small system. */
class Debris {
  readonly group = new THREE.Group();
  private pools: PointPool[];
  private live: Part[][] = [[], [], []];
  private caps = [170, 70, 56];
  private g: number;
  private H: number;
  constructor(H: number) {
    this.H = H;
    const s = Math.max(0.03, Math.min(1.4, H * 0.022));
    this.pools = [new PointPool(this.caps[0]!, s, false), new PointPool(this.caps[1]!, s * 0.75, false), new PointPool(this.caps[2]!, s * 4.2, false)];
    for (const p of this.pools) this.group.add(p.points);
    this.g = Math.max(9.8, H * 1.4);
  }
  emit(kind: 0 | 1 | 2, p: THREE.Vector3, v: THREE.Vector3, life: number, c: THREE.Color): void {
    const list = this.live[kind]!;
    if (list.length >= this.caps[kind]!) list.shift();
    list.push({ p: p.clone(), v: v.clone(), age: 0, life, c, kind, seed: Math.random() * 100 });
  }
  count(): number {
    return this.live[0]!.length + this.live[1]!.length + this.live[2]!.length;
  }
  update(dt: number): void {
    const H = this.H;
    for (let k = 0; k < 3; k++) {
      const list = this.live[k]!;
      const pool = this.pools[k]!;
      for (let i = list.length - 1; i >= 0; i--) {
        const q = list[i]!;
        q.age += dt;
        if (q.age >= q.life) {
          list.splice(i, 1);
          continue;
        }
        if (k === 0) {
          // Leaf: drag toward a slow terminal fall, flutter sideways.
          q.v.y -= this.g * 0.35 * dt;
          const term = -H * 0.09 - 0.4;
          q.v.multiplyScalar(Math.exp(-dt * 2.2));
          if (q.v.y < term) q.v.y = term;
          q.p.addScaledVector(q.v, dt);
          q.p.x += Math.sin(q.age * 5 + q.seed) * H * 0.012 * dt * 6;
          q.p.z += Math.cos(q.age * 4.3 + q.seed) * H * 0.012 * dt * 6;
          if (q.p.y < 0.01) {
            q.p.y = 0.01;
            q.v.set(0, 0, 0);
          }
        } else if (k === 1) {
          q.v.y -= this.g * dt;
          q.p.addScaledVector(q.v, dt);
          if (q.p.y < 0.01) {
            q.p.y = 0.01;
            q.v.multiplyScalar(0.3);
            q.v.y = Math.abs(q.v.y) * 0.2;
          }
        } else {
          q.v.multiplyScalar(Math.exp(-dt * 1.6));
          q.v.y += H * 0.01 * dt;
          q.p.addScaledVector(q.v, dt);
        }
      }
      for (let i = 0; i < this.caps[k]!; i++) {
        const q = list[i];
        if (!q) {
          pool.hide(i);
          continue;
        }
        const u = q.age / q.life;
        const a = k === 2 ? 0.42 * Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u) : 1 - smooth((u - 0.75) / 0.25);
        pool.set(i, q.p.x, q.p.y, q.p.z, q.c, a);
      }
      pool.commit();
    }
  }
  dispose(): void {
    this.pools.forEach((p) => p.dispose());
  }
}

/* ------------------------------------------------------------------ fall timelines */

export interface FallFrame {
  /** Camera shake 0…1. */
  shake: number;
  /** Storm darkening 0…1. */
  storm: number;
  /** Lightning flash this frame (the snap). */
  flash: boolean;
  /** The real (new, shorter) tree should be shown from now on (collapse). */
  swap: boolean;
  /** The over modal may open now (death / fatal collapse). */
  ready: boolean;
  /** Timeline finished (collapse: dispose; death: stays as the static dead log). */
  done: boolean;
}

interface Timeline {
  sway: number;
  snap: number;
  hingeEnd: number;
  hingeAngle: number;
  impact: number;
  fade0: number;
  fade1: number;
  swap: number;
  ready: number;
  end: number;
  stormIn: number;
  stormOut0: number;
  stormOut1: number;
}

const TIMES: Record<FallMode, Timeline> = {
  collapse: { sway: 1.4, snap: 1.4, hingeEnd: 1.85, hingeAngle: 0.6, impact: 2.5, fade0: 3.1, fade1: 3.8, swap: 3.35, ready: 3.9, end: 4.4, stormIn: 0.5, stormOut0: 3.4, stormOut1: 4.4 },
  fatal: { sway: 1.4, snap: 1.4, hingeEnd: 1.95, hingeAngle: 0.32, impact: 2.6, fade0: 2.7, fade1: 3.6, swap: 99, ready: 4.1, end: 4.6, stormIn: 0.5, stormOut0: 3.6, stormOut1: 4.6 },
  death: { sway: 0, snap: 1.75, hingeEnd: 1.75, hingeAngle: 0.16, impact: 2.35, fade0: 0.15, fade1: 1.1, swap: 99, ready: 2.5, end: 2.9, stormIn: 0, stormOut0: 0, stormOut1: 0 },
};

export class FallFx {
  readonly root = new THREE.Group();
  readonly split: SplitTree;
  readonly mode: FallMode;
  private t = 0;
  private dir: THREE.Vector3;
  private axis: THREE.Vector3;
  private tl: Timeline;
  private debris: Debris;
  readonly reduced: boolean;
  private H: number;
  private colours: THREE.Color[];
  private snapped = false;
  private impacted = false;
  private swapped = false;
  private readied = false;
  private shedAt = 0;
  private restY: number;
  private slide: number;
  private restAngle = Math.PI / 2 - 0.05;
  private finished = false;

  /**
   * @param build a fresh tree (owned from now on) drawn as it stood before the fall
   * @param dir horizontal fall direction (tree space)
   * @param cutY break height (metres)
   */
  constructor(build: TreeBuild, mode: FallMode, dir: THREE.Vector3, cutY: number, reduced: boolean) {
    this.mode = mode;
    this.reduced = reduced;
    this.tl = TIMES[mode];
    this.H = build.visibleTop;
    this.dir = new V3(dir.x, 0, dir.z).normalize();
    if (!Number.isFinite(this.dir.x)) this.dir.set(1, 0, 0);
    this.axis = new V3(this.dir.z, 0, -this.dir.x);
    this.split = new SplitTree(build, cutY, {
      upperTransparent: true,
      lowerTransparent: mode !== 'collapse' || reduced,
      caps: true,
    });
    this.root.add(this.split.root);
    this.debris = new Debris(this.H);
    this.root.add(this.debris.group);
    this.colours = canopyColours(build, 24);
    if (mode !== 'collapse') {
      // Dying leaves: yellow-brown versions of the species' own colours.
      const brown = new THREE.Color('#8a6030');
      this.colours = this.colours.map((c, i) => c.clone().lerp(brown, 0.45 + (i % 4) * 0.12));
    }
    this.restY = Math.max(0.01, this.split.axis.r * 0.85);
    this.slide = mode === 'collapse' ? this.split.upperLen * 0.1 + this.split.axis.r * 2 : this.split.axis.r * 1.2;
  }

  /** Effect clock (seconds). */
  time(): number {
    return this.t;
  }

  private setAngle(theta: number, lift = 0, slideK = 0): void {
    const q = new THREE.Quaternion().setFromAxisAngle(this.axis, theta);
    this.split.pivot.quaternion.copy(q);
    const ax = this.split.axis;
    const y = this.split.cutY + (this.restY - this.split.cutY) * lift;
    this.split.pivot.position.set(ax.x + this.dir.x * this.slide * slideK, y, ax.z + this.dir.z * this.slide * slideK);
  }

  /** Burst of leaves from the upper canopy (root space) plus bark chips at the break. */
  private shed(n: number, speed: number, fromUpper: boolean): void {
    const pts = canopyPoints(this.split.build, n, Math.floor(this.t * 100));
    const H = this.H;
    for (let i = 0; i < pts.length; i++) {
      const p = fromUpper ? this.split.upperToRoot(pts[i]!) : this.split.lowerToRoot(pts[i]!);
      if (fromUpper && p.y < 0.02) continue;
      const v = new V3((hash(i, 1) - 0.5) * 2, hash(i, 2) * 0.8, (hash(i, 3) - 0.5) * 2).multiplyScalar(H * speed);
      this.debris.emit(0, p, v, 2.6 + hash(i, 4) * 1.6, this.colours[i % this.colours.length]!);
    }
  }

  private chips(at: THREE.Vector3, n: number): void {
    const H = this.H;
    const pale = [new THREE.Color('#efe0b8'), new THREE.Color('#c9a878'), new THREE.Color('#7a5a3e')];
    for (let i = 0; i < n; i++) {
      const v = new V3((hash(i, 5) - 0.5) * 2, 0.4 + hash(i, 6), (hash(i, 7) - 0.5) * 2).multiplyScalar(H * 0.22);
      this.debris.emit(1, at, v, 1.4 + hash(i, 8), pale[i % 3]!);
    }
  }

  private dust(from: THREE.Vector3, along: THREE.Vector3, len: number, n: number): void {
    const H = this.H;
    const c = new THREE.Color('#b8a58a');
    for (let i = 0; i < n; i++) {
      const p = from.clone().addScaledVector(along, len * (i / Math.max(1, n - 1)));
      p.y = 0.05 + hash(i, 9) * H * 0.02;
      const v = new V3((hash(i, 10) - 0.5) * 2, 0.15 + hash(i, 11) * 0.3, (hash(i, 12) - 0.5) * 2).multiplyScalar(H * 0.08);
      this.debris.emit(2, p, v, 1.8 + hash(i, 13) * 0.8, c);
    }
  }

  update(dt: number): FallFrame {
    const frame: FallFrame = { shake: 0, storm: 0, flash: false, swap: false, ready: false, done: false };
    if (this.finished) {
      frame.done = true;
      return frame;
    }
    this.t += dt;
    const t = this.t;
    if (this.reduced) return this.updateReduced(frame);
    const tl = this.tl;
    const s = this.split;
    // Storm darkening (collapse / fatal only).
    if (this.mode !== 'death') frame.storm = smooth(t / tl.stormIn) * (1 - smooth((t - tl.stormOut0) / (tl.stormOut1 - tl.stormOut0)));
    // --- before the snap
    if (t < tl.snap) {
      if (this.mode === 'death') {
        // Leaves drop: the crown thins out while leaves fall.
        const lean = smooth((t - 0.9) / 0.85) * tl.hingeAngle;
        this.setAngle(lean);
        s.setOpacity(true, 'leaf', 1 - smooth((t - tl.fade0) / (tl.fade1 - tl.fade0)));
        s.setOpacity(false, 'leaf', 1 - smooth((t - tl.fade0) / (tl.fade1 - tl.fade0)));
        s.tintBark(smooth((t - 0.6) / 1.8));
        if (t - this.shedAt > 0.08 && t < tl.fade1) {
          this.shedAt = t;
          this.shed(14, 0.02, true);
        }
      } else {
        const A = 0.015 + 0.14 * smooth(t / tl.sway);
        const f = this.mode === 'fatal' ? 6 : 7.5;
        const theta = Math.sin(t * f) * A * (this.mode === 'fatal' ? 0.6 : 1);
        this.setAngle(theta);
        s.root.quaternion.setFromAxisAngle(this.axis, theta * (this.mode === 'fatal' ? 0.2 : 0.3));
        if (t - this.shedAt > 0.3) {
          this.shedAt = t;
          this.shed(4, 0.05, true);
        }
      }
    } else {
      if (!this.snapped) {
        this.snapped = true;
        s.root.quaternion.identity();
        if (this.mode !== 'death') {
          frame.flash = true;
          s.showBreak(true);
          this.chips(new V3(s.axis.x, s.cutY, s.axis.z), 36);
          this.shed(30, 0.08, true);
        } else s.showBreak(true);
      }
      if (this.mode !== 'death') frame.shake = Math.max(frame.shake, 0.7 * (1 - clamp01((t - tl.snap) / 0.5)));
      let theta: number;
      let lift = 0;
      let slideK = 0;
      if (t < tl.hingeEnd) {
        const u = clamp01((t - tl.snap) / Math.max(0.01, tl.hingeEnd - tl.snap));
        theta = tl.hingeAngle * u * u;
      } else if (t < tl.impact) {
        const u = clamp01((t - tl.hingeEnd) / (tl.impact - tl.hingeEnd));
        theta = tl.hingeAngle + (this.restAngle - tl.hingeAngle) * u * u;
        lift = Math.pow(u, 3);
        slideK = u;
      } else {
        const b = clamp01((t - tl.impact) / 0.35);
        theta = this.restAngle - 0.05 * Math.sin(Math.PI * b) * (1 - b);
        lift = 1;
        slideK = 1;
        if (!this.impacted) {
          this.impacted = true;
          const base = s.pivot.position.clone();
          base.y = 0;
          this.dust(base, this.dir, s.upperLen * 0.95, this.mode === 'collapse' ? 22 : 36);
          if (this.mode !== 'death') this.shed(this.mode === 'fatal' ? 110 : 60, 0.1, true);
        }
        frame.shake = Math.max(frame.shake, (this.mode === 'death' ? 0.55 : 1) * (1 - clamp01((t - tl.impact) / 0.7)));
      }
      this.setAngle(theta, lift, slideK);
      if (this.mode === 'collapse') {
        const a = 1 - smooth((t - tl.fade0) / (tl.fade1 - tl.fade0));
        s.setOpacity(true, 'all', a);
        if (t >= tl.swap && !this.swapped) {
          this.swapped = true;
          frame.swap = true;
          s.lower.visible = false;
        }
      } else if (this.mode === 'fatal') {
        const a = 1 - smooth((t - tl.fade0) / (tl.fade1 - tl.fade0));
        s.setOpacity(true, 'leaf', a);
        s.setOpacity(false, 'leaf', a);
        s.tintBark(smooth((t - tl.impact) / 1.0));
        if (t > tl.impact && t < tl.fade1 && t - this.shedAt > 0.1) {
          this.shedAt = t;
          this.shed(10, 0.03, true);
        }
      } else {
        s.setOpacity(true, 'leaf', 0);
        s.setOpacity(false, 'leaf', 0);
        s.tintBark(Math.max(smooth((t - 0.6) / 1.8), 0));
      }
    }
    if (t >= tl.ready && !this.readied) {
      this.readied = true;
      frame.ready = true;
    }
    this.debris.update(dt);
    if (t >= tl.end && this.debris.count() === 0) this.finish();
    else if (t >= tl.end + 3) this.finish();
    frame.done = this.finished;
    return frame;
  }

  private updateReduced(frame: FallFrame): FallFrame {
    const t = this.t;
    const s = this.split;
    if (this.mode === 'collapse') {
      if (!this.swapped) {
        this.swapped = true;
        frame.swap = true;
      }
      const a = 1 - smooth(t / 0.8);
      s.setOpacity(true, 'all', a);
      s.setOpacity(false, 'all', a);
      if (t >= 0.85) this.finish();
    } else {
      const a = 1 - smooth(t / 0.6);
      s.setOpacity(true, 'leaf', a);
      s.setOpacity(false, 'leaf', a);
      if (t >= 0.6) {
        s.showBreak(true);
        this.setAngle(this.restAngle, 1, 1);
        s.tintBark(1);
      }
      if (t >= 0.9 && !this.readied) {
        this.readied = true;
        frame.ready = true;
        this.finish();
      }
    }
    frame.done = this.finished;
    return frame;
  }

  /** Jump to the end: a collapse is over (dispose it); a death lies as the dead log. */
  finish(): void {
    if (this.mode !== 'collapse') {
      this.split.showBreak(true);
      this.setAngle(this.restAngle, 1, 1);
      this.split.setOpacity(true, 'leaf', 0);
      this.split.setOpacity(false, 'leaf', 0);
      this.split.setVisible(true, 'leaf', false);
      this.split.setVisible(false, 'leaf', false);
      this.split.tintBark(1);
      this.split.root.quaternion.identity();
    }
    this.finished = true;
  }

  isFinished(): boolean {
    return this.finished;
  }

  /** Phase name for checks. */
  phase(): string {
    const t = this.t;
    const tl = this.tl;
    if (this.finished) return this.mode === 'collapse' ? 'done' : 'log';
    if (this.reduced) return 'fade';
    if (t < tl.snap) return this.mode === 'death' ? (t < 0.9 ? 'leaves' : 'lean') : 'sway';
    if (t < tl.impact) return this.mode === 'death' ? 'falling' : 'snap';
    if (this.mode === 'collapse') return t < tl.swap ? 'fallen' : 'settle';
    return 'fallen';
  }

  sync(): void {
    this.split.sync();
  }

  dispose(): void {
    this.debris.dispose();
    this.split.dispose();
    this.root.removeFromParent();
  }
}

/* ------------------------------------------------------------------ 瀕死 leaf loop */

export class LeafLoop {
  readonly group = new THREE.Group();
  private pool: PointPool;
  private parts: { p: THREE.Vector3; v: number; seed: number; life: number; age: number; on: boolean }[] = [];
  private cols = [new THREE.Color('#b08a3a'), new THREE.Color('#8a6030'), new THREE.Color('#c4a24c'), new THREE.Color('#6e4a28')];
  private size = 0;
  private n: number;
  constructor(n = 40) {
    this.n = n;
    this.pool = new PointPool(n, 0.1, false);
    this.group.add(this.pool.points);
    for (let i = 0; i < n; i++) this.parts.push({ p: new V3(), v: 0, seed: i * 1.37, life: 0, age: 0, on: false });
  }
  active(): number {
    return this.parts.filter((q) => q.on).length;
  }
  /** rate 0…1; sizes in metres (tree space). */
  update(dt: number, rate: number, H: number, crownY: number, canopyR: number): void {
    const size = Math.max(0.025, Math.min(1.1, H * 0.018));
    if (Math.abs(size - this.size) > 1e-3) {
      this.size = size;
      (this.pool.points.material as THREE.PointsMaterial).size = size;
    }
    const want = Math.round(rate * this.n);
    let on = 0;
    for (let i = 0; i < this.n; i++) {
      const q = this.parts[i]!;
      if (q.on) {
        q.age += dt;
        q.p.y -= q.v * dt;
        q.p.x += Math.sin(q.age * 3.1 + q.seed) * H * 0.01 * dt * 4;
        q.p.z += Math.cos(q.age * 2.7 + q.seed) * H * 0.01 * dt * 4;
        if (q.p.y <= 0.02) q.on = false;
      }
      if (!q.on && on < want && Math.random() < dt * 2.5) {
        const a = Math.random() * Math.PI * 2;
        const r = canopyR * (0.15 + Math.random() * 0.7);
        q.p.set(Math.cos(a) * r, crownY + Math.random() * Math.max(0.1, H * 0.95 - crownY), Math.sin(a) * r);
        q.v = H * (0.05 + Math.random() * 0.04) + 0.25;
        q.age = 0;
        q.on = true;
      }
      if (q.on) {
        on++;
        const fadeIn = Math.min(1, q.age * 3);
        this.pool.set(i, q.p.x, q.p.y, q.p.z, this.cols[i % 4]!, fadeIn * Math.min(1, q.p.y / Math.max(0.05, H * 0.04) + 0.3));
      } else this.pool.hide(i);
    }
    this.pool.commit();
  }
  dispose(): void {
    this.pool.dispose();
  }
}

/* ------------------------------------------------------------------ fallen top (a few days) */

/** The snapped-off top lying beside the tree: a log along +x from the origin, twig stubs, a few dry leaf clumps. */
export function fallenLog(lenM: number, rM: number, seed: number): THREE.Group {
  const g = new THREE.Group();
  const bark: THREE.BufferGeometry[] = [];
  const leaves: THREE.BufferGeometry[] = [];
  const r = Math.max(0.01, rM);
  const a = new V3(0, r, 0);
  const b = new V3(lenM, r * 0.7, 0);
  bark.push(paint(limb(a, b, r, r * 0.55, 7), new THREE.Color('#735c48')));
  for (let i = 0; i < 4; i++) {
    const f = 0.3 + i * 0.17;
    const p = a.clone().lerp(b, f);
    const ang = seed + i * 2.2;
    const tip = p.clone().add(new V3(lenM * 0.05, Math.abs(Math.sin(ang)) * r * 2.4 + r, Math.cos(ang) * r * 3));
    bark.push(paint(limb(p, tip, r * 0.28, r * 0.12, 4), new THREE.Color('#6a5442')));
    if (i % 2 === 0) {
      const leaf = new THREE.IcosahedronGeometry(r * 1.3, 0);
      leaf.scale(1.2, 0.6, 1);
      leaf.translate(tip.x, tip.y, tip.z);
      paint(leaf, new THREE.Color(i ? '#8a7440' : '#7a6a38'));
      leaves.push(leaf);
    }
  }
  const endA = jaggedCap(r * 1.02, seed + 1);
  endA.rotateZ(Math.PI / 2);
  endA.translate(0, r, 0);
  bark.push(endA);
  const m = new THREE.Mesh(merge(bark, true), barkLikeMat());
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  if (leaves.length) {
    const lm = new THREE.Mesh(merge(leaves, true), barkLikeMat());
    lm.castShadow = true;
    g.add(lm);
  }
  return g;
}

export function disposeGroup(g: THREE.Object3D): void {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}
