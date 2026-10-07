/**
 * 1.4.52 egg hatch and decoration reveal. Temporary meshes only; every geometry and
 * material created here is disposed when the shot ends. Vectors are reused — the
 * step functions do not allocate.
 */
import * as THREE from 'three';
import type { NestBuildKind } from '../nest';
import { nestPiece, nestSite } from './nestDecor3d';

const _box = new THREE.Box3();
const _size = new THREE.Vector3();

function std(color: string, opacity = 1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.72,
    transparent: opacity < 1,
    opacity,
  });
}

/** The decoration piece shares the island's materials; clones so disposing the shot cannot blank them. */
function cloneMats(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
  });
}

function trash(root: THREE.Object3D): void {
  const geos = new Set<THREE.BufferGeometry>();
  const mats = new Set<THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) geos.add(mesh.geometry);
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => mats.add(m));
    else if (mat) mats.add(mat);
  });
  geos.forEach((g) => g.dispose());
  mats.forEach((m) => m.dispose());
}

function chickFig(body: string, belly: string, beak: string): THREE.Group {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    geo.scale(sx, sy, sz);
    const mesh = new THREE.Mesh(geo, std(color));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    g.add(mesh);
  };
  add(new THREE.SphereGeometry(0.16, 6, 5), body, 0, 0.16, 0, 1, 0.9, 0.85);
  add(new THREE.SphereGeometry(0.1, 6, 5), belly, 0.06, 0.28, 0, 1, 0.85, 0.9);
  const beakGeo = new THREE.ConeGeometry(0.035, 0.09, 4);
  beakGeo.rotateZ(-Math.PI / 2);
  add(beakGeo, beak, 0.16, 0.28, 0);
  add(new THREE.SphereGeometry(0.045, 5, 4), body, 0.02, 0.16, 0.1, 1.4, 0.35, 0.7);
  add(new THREE.SphereGeometry(0.045, 5, 4), body, 0.02, 0.16, -0.1, 1.4, 0.35, 0.7);
  return g;
}

function shell(color: string): { group: THREE.Group; cap: THREE.Object3D; body: THREE.Object3D } {
  const group = new THREE.Group();
  const mat = std(color);
  const mat2 = std('#f4f7f2');
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 6), mat);
  bottom.scale.set(0.82, 0.7, 0.82);
  bottom.position.y = 0.08;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), mat2);
  cap.scale.set(0.9, 0.55, 0.9);
  cap.position.y = 0.18;
  // A few jagged chips on the cap so the split reads as a crack.
  for (let i = 0; i < 4; i++) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.05), mat);
    const a = i * 1.5;
    chip.position.set(Math.cos(a) * 0.08, 0.2, Math.sin(a) * 0.08);
    chip.rotation.z = 0.4 * (i - 1.5);
    group.add(chip);
  }
  group.add(bottom, cap);
  return { group, cap, body: bottom };
}

/** Egg shakes, the cap lifts, a chick looks out, then flies down to the island. */
export class HatchFx {
  private t = 0;
  private readonly group = new THREE.Group();
  private readonly chick: THREE.Group;
  private readonly cap: THREE.Object3D;
  private readonly shellGroup: THREE.Group;
  private readonly from = new THREE.Vector3();
  private readonly ctrl = new THREE.Vector3();
  private readonly to = new THREE.Vector3();
  private readonly pos = new THREE.Vector3();
  private alive = true;
  private readonly dur = 2.6;

  constructor(parent: THREE.Object3D, nest: THREE.Vector3, land: THREE.Vector3, tint: { body: string; belly: string; beak: string }) {
    this.from.copy(nest);
    this.to.copy(land);
    this.ctrl.copy(nest).lerp(land, 0.45);
    this.ctrl.y = Math.max(nest.y, land.y) + Math.max(1.1, nest.distanceTo(land) * 0.28);
    const egg = shell('#f7f4ee');
    this.shellGroup = egg.group;
    this.cap = egg.cap;
    this.chick = chickFig(tint.body, tint.belly, tint.beak);
    this.chick.scale.setScalar(0.01);
    this.group.add(egg.group, this.chick);
    this.group.position.copy(nest);
    parent.add(this.group);
  }

  get busy(): boolean {
    return this.alive;
  }

  step(dt: number): boolean {
    if (!this.alive) return false;
    this.t += dt;
    const u = this.t;
    if (u < 0.45) {
      const k = 1 - u / 0.45;
      this.shellGroup.rotation.z = Math.sin(u * 42) * 0.22 * k;
      this.shellGroup.rotation.x = Math.sin(u * 33) * 0.08 * k;
    } else {
      this.shellGroup.rotation.z = 0;
      this.shellGroup.rotation.x = 0;
    }
    if (u > 0.32) {
      const c = Math.min(1, (u - 0.32) / 0.5);
      this.cap.position.y = 0.18 + c * 0.16;
      this.cap.rotation.z = c * 0.7;
      this.cap.position.x = c * 0.06;
    }
    if (u > 0.5 && u < 1.05) {
      const p = Math.min(1, (u - 0.5) / 0.4);
      const s = 0.55 * (1 - Math.pow(1 - p, 2));
      this.chick.scale.setScalar(Math.max(0.01, s));
      this.chick.position.set(0, 0.05 * p, 0);
      this.group.position.copy(this.from);
    }
    if (u >= 1.0) {
      const f = Math.min(1, (u - 1.0) / 1.45);
      const e = f * f * (3 - 2 * f);
      const o = 1 - e;
      this.pos.set(0, 0, 0);
      this.pos.addScaledVector(this.from, o * o);
      this.pos.addScaledVector(this.ctrl, 2 * o * e);
      this.pos.addScaledVector(this.to, e * e);
      this.group.position.copy(this.pos);
      this.chick.scale.setScalar(0.55);
      this.chick.position.set(0, 0, 0);
      const fade = f > 0.72 ? 1 - (f - 0.72) / 0.28 : 1;
      this.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const mat = mesh.material as THREE.Material | undefined;
        if (mat && 'opacity' in mat) {
          mat.transparent = true;
          (mat as THREE.MeshStandardMaterial).opacity = Math.max(0, fade);
        }
      });
      this.shellGroup.visible = f < 0.15;
    }
    if (u >= this.dur) {
      this.dispose();
      return false;
    }
    return true;
  }

  dispose(): void {
    if (!this.alive) return;
    this.alive = false;
    this.group.removeFromParent();
    trash(this.group);
  }
}

const DUST_N = 22;

function overshoot(u: number): number {
  if (u >= 1) return 1;
  const s = 1 - (1 - u) ** 3;
  return Math.min(1.08, s + Math.sin(u * Math.PI) * 0.07);
}

/** Chick flies from the nest to the site; the building then breaks out of the ground. Camera is written by `frame`. */
export class RevealFx {
  private t = 0;
  private phase: 'fly' | 'rise' | 'back' | 'done' = 'fly';
  private readonly root: THREE.Group;
  private readonly building: THREE.Group;
  private readonly chick: THREE.Group;
  private readonly cracks: THREE.Group;
  private readonly dust: THREE.Points;
  private readonly dustPos: Float32Array;
  private readonly dustAttr: THREE.BufferAttribute;
  private readonly dustMat: THREE.PointsMaterial;
  private readonly angles: Float32Array;
  private readonly radii: Float32Array;
  private readonly lifts: Float32Array;
  private readonly height: number;
  private readonly flyDur = 1.45;
  private readonly riseDur = 1.55;
  private readonly backDur = 0.85;
  private camInit = false;
  private readonly nestW = new THREE.Vector3();
  private readonly siteW = new THREE.Vector3();
  private readonly endW = new THREE.Vector3();
  private readonly ctrl = new THREE.Vector3();
  private readonly chickW = new THREE.Vector3();
  private readonly dir = new THREE.Vector3();
  private readonly desired = new THREE.Vector3();
  private readonly cam = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private readonly lockedPos = new THREE.Vector3();
  private readonly lockedLook = new THREE.Vector3();
  private readonly framePos = new THREE.Vector3();
  private readonly frameLook = new THREE.Vector3();
  private readonly backFromPos = new THREE.Vector3();
  private readonly backFromLook = new THREE.Vector3();
  private readonly dist: number;
  private readonly blades: THREE.Object3D | null;
  private spin = 0;
  private stepDt = 0;
  readonly onDone: () => void;

  constructor(
    worldParent: THREE.Object3D,
    decorParent: THREE.Object3D,
    opts: { kind: NestBuildKind; index: number; tint: { body: string; belly: string; beak: string }; nestWorld: THREE.Vector3; scale: number; onDone: () => void },
  ) {
    this.onDone = opts.onDone;
    const site = nestSite(opts.index);
    const piece = nestPiece(opts.kind);
    this.blades = piece.blades;
    this.building = piece.group;
    cloneMats(piece.group);
    piece.group.updateMatrixWorld(true);
    _box.setFromObject(piece.group);
    _box.getSize(_size);
    this.height = Math.max(0.6, _size.y);
    this.building.position.y = -this.height;

    this.root = new THREE.Group();
    this.root.position.set(site.x, site.y, site.z);
    this.root.rotation.y = site.rot;

    this.cracks = new THREE.Group();
    const crackMat = new THREE.MeshBasicMaterial({ color: '#3a342c', side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.62, 7), new THREE.MeshBasicMaterial({ color: '#2c2824', transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    this.cracks.add(ring);
    for (let i = 0; i < 7; i++) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.07), crackMat);
      const a = (i / 7) * Math.PI * 2;
      shard.position.set(Math.cos(a) * 0.42, 0.04, Math.sin(a) * 0.42);
      shard.rotation.y = -a;
      shard.rotation.z = 0.35 * (i % 2 ? 1 : -1);
      this.cracks.add(shard);
    }
    this.cracks.scale.setScalar(0.001);

    const n = DUST_N;
    this.dustPos = new Float32Array(n * 3);
    this.angles = new Float32Array(n);
    this.radii = new Float32Array(n);
    this.lifts = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.angles[i] = (i / n) * Math.PI * 2;
      this.radii[i] = 0.2 + (i % 5) * 0.12;
      this.lifts[i] = 0.25 + (i % 4) * 0.18;
    }
    const geo = new THREE.BufferGeometry();
    this.dustAttr = new THREE.BufferAttribute(this.dustPos, 3);
    geo.setAttribute('position', this.dustAttr);
    this.dustMat = new THREE.PointsMaterial({ color: '#d9d0c2', size: 0.08 * Math.max(1, opts.scale), transparent: true, opacity: 0, depthWrite: false });
    this.dust = new THREE.Points(geo, this.dustMat);

    this.root.add(this.cracks, this.dust, this.building);
    decorParent.add(this.root);

    this.chick = chickFig(opts.tint.body, opts.tint.belly, opts.tint.beak);
    this.chick.scale.setScalar(0.45 * Math.max(0.7, Math.min(1.4, opts.scale)));
    worldParent.add(this.chick);

    this.nestW.copy(opts.nestWorld);
    this.siteW.set(site.x, site.y, site.z);
    decorParent.localToWorld(this.siteW);
    this.endW.copy(this.siteW);
    this.endW.y += 0.35 * opts.scale;
    this.dir.subVectors(this.siteW, this.nestW);
    this.dir.y = 0;
    if (this.dir.lengthSq() < 1e-4) this.dir.set(1, 0, 0.2);
    this.dir.normalize();
    this.endW.addScaledVector(this.dir, 0.55 * opts.scale);
    this.ctrl.copy(this.nestW).lerp(this.endW, 0.5);
    this.ctrl.y = Math.max(this.nestW.y, this.endW.y) + Math.max(1.2, this.nestW.distanceTo(this.endW) * 0.22);
    this.dist = Math.max(4.2, opts.scale * 5.2);
    this.chick.position.copy(this.nestW);
  }

  get done(): boolean {
    return this.phase === 'done';
  }

  /** Write the tracking-shot camera. Returns false once the shot has finished (not yet disposed). */
  frame(dt: number, normalPos: THREE.Vector3, normalLook: THREE.Vector3, outPos: THREE.Vector3, outLook: THREE.Vector3): boolean {
    const phase = this.phase;
    if (phase === 'done') return false;
    this.stepDt = dt;
    this.t += dt;
    if (this.blades) {
      this.spin += dt * 0.7;
      this.blades.rotation.z = this.spin;
    }
    if (phase === 'fly') this.stepFly();
    else if (phase === 'rise') this.stepRise();
    else this.stepBack(normalPos, normalLook);
    outPos.copy(this.cam);
    outLook.copy(this.look);
    return this.phase !== 'done';
  }

  private stepFly(): void {
    const u = Math.min(1, this.t / this.flyDur);
    const e = u * u * (3 - 2 * u);
    const o = 1 - e;
    this.chickW.set(0, 0, 0);
    this.chickW.addScaledVector(this.nestW, o * o);
    this.chickW.addScaledVector(this.ctrl, 2 * o * e);
    this.chickW.addScaledVector(this.endW, e * e);
    this.chick.position.copy(this.chickW);
    this.desired.copy(this.chickW).addScaledVector(this.dir, -this.dist);
    this.desired.y += this.dist * 0.38;
    if (!this.camInit) {
      this.cam.copy(this.desired);
      this.look.copy(this.chickW);
      this.camInit = true;
    } else {
      const k = this.stepDt <= 0 ? 1 : 1 - Math.exp(-this.stepDt * 4);
      this.cam.lerp(this.desired, k);
      this.look.lerp(this.chickW, this.stepDt <= 0 ? 1 : 1 - Math.exp(-this.stepDt * 6));
    }
    if (u >= 1) {
      this.phase = 'rise';
      this.t = 0;
      this.lockedPos.copy(this.cam);
      this.lockedLook.copy(this.look);
      this.frameLook.copy(this.siteW);
      this.frameLook.y += this.height * 0.45;
      this.framePos.copy(this.siteW).addScaledVector(this.dir, -this.dist * 1.65);
      this.framePos.y += this.dist * 0.72;
    }
  }

  private stepRise(): void {
    const u = Math.min(1, this.t / this.riseDur);
    const cu = Math.min(1, this.t / 0.4);
    const cs = cu * cu * (3 - 2 * cu);
    this.cam.lerpVectors(this.lockedPos, this.framePos, cs);
    this.look.lerpVectors(this.lockedLook, this.frameLook, cs);
    const lift = overshoot(u);
    this.building.position.y = -this.height * (1 - lift);
    const crack = Math.min(1, u / 0.32);
    this.cracks.scale.setScalar(0.15 + crack);
    const puff = Math.sin(Math.min(1, u) * Math.PI);
    this.writeDust(puff);
    this.dustMat.opacity = 0.62 * puff;
    this.chick.position.copy(this.endW);
    if (u >= 1) {
      this.building.position.y = 0;
      this.dustMat.opacity = 0;
      this.phase = 'back';
      this.t = 0;
      this.backFromPos.copy(this.cam);
      this.backFromLook.copy(this.look);
    }
  }

  private stepBack(normalPos: THREE.Vector3, normalLook: THREE.Vector3): void {
    const u = Math.min(1, this.t / this.backDur);
    const s = u * u * (3 - 2 * u);
    this.cam.lerpVectors(this.backFromPos, normalPos, s);
    this.look.lerpVectors(this.backFromLook, normalLook, s);
    if (u >= 1) this.phase = 'done';
  }

  private writeDust(puff: number): void {
    const n = this.angles.length;
    for (let i = 0; i < n; i++) {
      const a = this.angles[i]!;
      const r = this.radii[i]! * (0.35 + puff);
      this.dustPos[i * 3] = Math.cos(a) * r;
      this.dustPos[i * 3 + 1] = 0.05 + this.lifts[i]! * puff;
      this.dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    this.dustAttr.needsUpdate = true;
  }

  /** Jump to the settled building and stop. The caller disposes and marks the decoration revealed. */
  skip(): void {
    if (this.phase === 'done') return;
    this.building.position.y = 0;
    this.phase = 'done';
  }

  dispose(): void {
    this.chick.removeFromParent();
    trash(this.chick);
    this.root.removeFromParent();
    trash(this.root);
  }
}
