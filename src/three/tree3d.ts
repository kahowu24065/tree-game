import * as THREE from 'three';
import { stageIndex } from '../content';
import type { Reinforcement } from '../types';
import { clamp, mulberry32 } from '../util';
import { disposeTree, ellipsoid, jitterGeometry, limb, mat, merge, paint } from './util3d';

/** Map real height (cm) to world units with a soft log curve so seedlings and giants both fit the scene. */
const HEIGHT_KNOTS: [number, number][] = [
  [0, 0.35], [18, 0.7], [50, 1.15], [200, 2.3], [800, 4.4], [2000, 6.7], [5000, 9.5], [11600, 13], [20000, 15],
];

export function visualHeight(cm: number): number {
  const c = Math.max(0, cm);
  for (let i = 1; i < HEIGHT_KNOTS.length; i++) {
    const [c1, v1] = HEIGHT_KNOTS[i]!;
    const [c0, v0] = HEIGHT_KNOTS[i - 1]!;
    if (c <= c1) {
      const t = c0 === 0 ? c / c1 : Math.log(c / c0) / Math.log(c1 / c0);
      return v0 + (v1 - v0) * clamp(t, 0, 1);
    }
  }
  return HEIGHT_KNOTS[HEIGHT_KNOTS.length - 1]![1];
}

export interface TreeParams {
  heightCm: number;
  health: number;
  pests: number;
  scars: number;
  seed: number;
  reinforce?: Reinforcement;
}

export interface Perch {
  pos: THREE.Vector3;
  out: THREE.Vector3;
}

export interface TreeBuild {
  group: THREE.Group;
  canopy: THREE.Mesh | null;
  height: number;
  canopyRadius: number;
  crownY: number;
  trunkRadius: number;
  perches: Perch[];
  trunkSpots: Perch[];
  nest: Perch | null;
  hollow: Perch | null;
  dispose(): void;
}

function leafColor(health: number, y01: number, rand: () => number): THREE.Color {
  const healthy = new THREE.Color().setHSL(0.26 + rand() * 0.05, 0.62 + rand() * 0.12, 0.22 + y01 * 0.16 + rand() * 0.04);
  const sick = new THREE.Color().setHSL(0.11 + rand() * 0.03, 0.45, 0.36 + y01 * 0.14);
  const k = clamp((60 - health) / 45, 0, 1);
  return healthy.lerp(sick, k);
}

let leafMaterial: THREE.MeshStandardMaterial | null = null;
function leafMat(): THREE.MeshStandardMaterial {
  leafMaterial ??= new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 });
  return leafMaterial;
}

interface Blob {
  c: THREE.Vector3;
  r: number;
}

export function treeKey(p: TreeParams): string {
  const v = visualHeight(p.heightCm);
  const r = p.reinforce;
  return [Math.round(v * 40), stageIndex(p.heightCm), Math.round(p.health / 12), p.pests > 45 ? 1 : 0, Math.min(4, p.scars), r?.stakes ? 1 : 0, r?.ropes ? 1 : 0, r?.prune ? 1 : 0, p.seed].join('|');
}

export function buildTree(p: TreeParams): TreeBuild {
  const rand = mulberry32(p.seed || 7);
  const V = visualHeight(p.heightCm);
  const stage = stageIndex(p.heightCm);
  const group = new THREE.Group();
  const bark: THREE.BufferGeometry[] = [];
  const blobs: Blob[] = [];
  const perches: Perch[] = [];
  const trunkSpots: Perch[] = [];
  let nest: Perch | null = null;
  let hollow: Perch | null = null;
  const fullness = 0.72 + 0.28 * clamp(p.health / 90, 0, 1);
  let trunkRadius: number;
  let crownY: number;

  if (stage === 0) {
    // Seedling: a slender stem with a handful of soft leaves.
    trunkRadius = 0.02 + V * 0.025;
    const top = new THREE.Vector3(0.03, V, 0.0);
    bark.push(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.015, V * 0.5, 0.01), trunkRadius, trunkRadius * 0.8, 5));
    bark.push(limb(new THREE.Vector3(-0.015, V * 0.5, 0.01), top, trunkRadius * 0.8, trunkRadius * 0.45, 5));
    const leaves = 2 + Math.min(6, Math.floor(p.heightCm / 7));
    const leafGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < leaves; i++) {
      const a = i * 2.4 + rand() * 0.4;
      const h = V * (0.45 + 0.55 * (i / Math.max(1, leaves - 1)));
      const len = 0.09 + V * 0.18 * (0.7 + rand() * 0.4);
      const g = ellipsoid(len, 0.018 + V * 0.012, len * 0.45, 1);
      g.translate(len * 0.9, 0, 0);
      g.rotateZ(0.45 + rand() * 0.3);
      g.rotateY(a);
      g.translate(0, h, 0);
      paint(g, leafColor(p.health, 0.8, rand));
      leafGeos.push(g);
      perches.push({ pos: new THREE.Vector3(Math.cos(-a) * len * 1.5, h + len * 0.6, Math.sin(-a) * len * 1.5), out: new THREE.Vector3(Math.cos(-a), 0.3, Math.sin(-a)).normalize() });
    }
    const bud = ellipsoid(0.05 + V * 0.03, 0.07 + V * 0.04, 0.05 + V * 0.03, 1);
    bud.translate(top.x, top.y, top.z);
    paint(bud, leafColor(p.health, 1, rand));
    leafGeos.push(bud);
    const canopyGeo = merge(leafGeos, true);
    const canopy = new THREE.Mesh(canopyGeo, leafMat());
    canopy.castShadow = true;
    group.add(canopy);
    crownY = V;
    blobs.push({ c: new THREE.Vector3(0, V * 0.8, 0), r: 0.15 + V * 0.3 });
    const trunkMesh = new THREE.Mesh(merge(bark), mat('#6f9a3e'));
    trunkMesh.castShadow = true;
    group.add(trunkMesh);
    return finish(group, canopy, V, blobs, crownY, trunkRadius, perches, trunkSpots, null, null);
  }

  // Larger trees: bent tapered trunk, recursive branches, clustered canopy blobs.
  const primaries = [0, 3, 4, 5, 6, 7][stage]!;
  const depth = [0, 1, 2, 2, 3, 3][stage]!;
  trunkRadius = 0.035 + V * 0.028 + stage * 0.025;
  const trunkTopFrac = [0, 0.58, 0.56, 0.5, 0.46, 0.44][stage]!;
  const trunkTop = V * trunkTopFrac;
  const trunkPts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
  const segs = 4;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    trunkPts.push(new THREE.Vector3(Math.sin(t * 2.2 + p.seed) * V * 0.035, trunkTop * t, Math.cos(t * 1.7 + p.seed) * V * 0.025));
  }
  for (let i = 0; i < segs; i++) {
    const r0 = trunkRadius * (1 - (i / segs) * 0.45);
    const r1 = trunkRadius * (1 - ((i + 1) / segs) * 0.45);
    bark.push(limb(trunkPts[i]!, trunkPts[i + 1]!, r0, r1, 7));
  }
  // Root flares for mature trees.
  if (stage >= 3) {
    const n = 5 + stage;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.4;
      const len = trunkRadius * (2 + rand() * 1.4);
      bark.push(limb(new THREE.Vector3(0, trunkRadius * 0.9, 0), new THREE.Vector3(Math.cos(a) * len, 0.02, Math.sin(a) * len), trunkRadius * 0.45, trunkRadius * 0.12, 5));
    }
  }
  // Trunk spots for climbers (woodpecker, squirrel) facing roughly toward the camera (+z).
  for (const f of [0.35, 0.55, 0.75]) {
    const y = trunkTop * f;
    const r = trunkRadius * (1 - f * 0.45);
    for (const a of [0.9, 1.5, 2.2]) {
      const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      trunkSpots.push({ pos: new THREE.Vector3(out.x * r, y, out.z * r).add(new THREE.Vector3(trunkPts[Math.round(f * segs)]!.x, 0, trunkPts[Math.round(f * segs)]!.z)), out });
    }
  }
  if (stage >= 3) {
    const f = 0.5;
    const out = new THREE.Vector3(0.35, 0, 1).normalize();
    const base = trunkPts[2]!;
    hollow = { pos: new THREE.Vector3(base.x + out.x * trunkRadius * 0.78, trunkTop * f, base.z + out.z * trunkRadius * 0.78), out };
    const ring = new THREE.TorusGeometry(trunkRadius * 0.32, trunkRadius * 0.1, 5, 10);
    ring.scale(1, 1.35, 1);
    ring.lookAt(out);
    ring.translate(hollow.pos.x, hollow.pos.y, hollow.pos.z);
    bark.push(ring);
  }

  const top = trunkPts[segs]!;
  const grow = (from: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, level: number) => {
    const to = from.clone().addScaledVector(dir, len);
    bark.push(limb(from, to, r, r * 0.62, level === 0 ? 6 : 5));
    if (level >= depth) {
      const br = V * (0.1 + 0.05 * rand()) * (1 + (depth - level) * 0.1) * fullness + 0.08;
      blobs.push({ c: to.clone().add(new THREE.Vector3(0, br * 0.3, 0)), r: br });
      return;
    }
    const kids = level === 0 ? 2 : 2 + (rand() < 0.35 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const spin = (k / kids) * Math.PI * 2 + rand() * 1.2;
      const side = new THREE.Vector3(Math.cos(spin), 0, Math.sin(spin));
      const nd = dir.clone().multiplyScalar(0.7).addScaledVector(side, 0.55).add(new THREE.Vector3(0, 0.35, 0)).normalize();
      grow(to, nd, len * (0.62 + rand() * 0.12), r * 0.62, level + 1);
    }
    if (level >= 1 || depth === 1) {
      const br = V * 0.065 * fullness + 0.05;
      blobs.push({ c: to.clone(), r: br });
    }
  };

  const primaryLen = V * [0, 0.36, 0.3, 0.27, 0.24, 0.23][stage]!;
  for (let i = 0; i < primaries; i++) {
    const a = (i / primaries) * Math.PI * 2 + rand() * 0.6 + p.seed * 0.1;
    const f = 0.62 + 0.38 * (i / Math.max(1, primaries - 1));
    const base = new THREE.Vector3().lerpVectors(trunkPts[segs - 1]!, top, f);
    const tilt = (stage <= 2 ? 0.8 : 0.6) + rand() * 0.3 - (stage >= 4 ? 0.12 : 0);
    const dir = new THREE.Vector3(Math.cos(a) * Math.cos(tilt), Math.sin(tilt), Math.sin(a) * Math.cos(tilt)).normalize();
    grow(base, dir, primaryLen * (0.85 + rand() * 0.3), trunkRadius * 0.55, 0);
    if (!nest && Math.sin(a) > 0.1 && stage >= 2) {
      const pos = base.clone().addScaledVector(dir, primaryLen * 0.28);
      nest = { pos, out: new THREE.Vector3(dir.x, 0, dir.z).normalize() };
    }
  }
  // Leader continues up the middle.
  const leaderTop = new THREE.Vector3(top.x, V * 0.84, top.z);
  bark.push(limb(top, leaderTop, trunkRadius * 0.55, trunkRadius * 0.25, 6));
  blobs.push({ c: new THREE.Vector3(top.x, V * 0.84, top.z), r: V * 0.17 * fullness + 0.1 });
  blobs.push({ c: new THREE.Vector3(top.x, V * 0.66, top.z), r: V * 0.2 * fullness + 0.1 });
  if (!nest && stage >= 2) nest = { pos: top.clone(), out: new THREE.Vector3(0.3, 0, 1).normalize() };
  crownY = V * 0.66;

  // Storm scars: broken stubs.
  for (let i = 0; i < Math.min(4, p.scars); i++) {
    const a = 2 + i * 1.7;
    const y = trunkTop * (0.55 + i * 0.1);
    const d = new THREE.Vector3(Math.cos(a), 0.3, Math.sin(a)).normalize();
    const from = new THREE.Vector3(top.x * 0.6, y, top.z * 0.6);
    bark.push(limb(from, from.clone().addScaledVector(d, trunkRadius * 2.5), trunkRadius * 0.3, trunkRadius * 0.25, 5));
  }

  const barkGeo = merge(bark);
  jitterGeometry(barkGeo, trunkRadius * 0.08, p.seed, false);
  const trunkMesh = new THREE.Mesh(barkGeo, mat('#7a5537'));
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  group.add(trunkMesh);

  // Canopy blobs: jittered icosahedra with vertex colour gradient, merged into one mesh.
  const minY = Math.min(...blobs.map((b) => b.c.y - b.r));
  const maxY = Math.max(...blobs.map((b) => b.c.y + b.r));
  const leafGeos: THREE.BufferGeometry[] = [];
  const detail = V > 6 ? 1 : 1;
  blobs.forEach((b, i) => {
    const g = new THREE.IcosahedronGeometry(b.r, detail);
    jitterGeometry(g, b.r * 0.28, i * 1.37 + p.seed, true);
    g.scale(1, 0.82, 1);
    g.translate(b.c.x, b.c.y, b.c.z);
    const tint = rand();
    paint(g, (y) => leafColor(p.health, clamp((y - minY) / (maxY - minY || 1), 0, 1), () => tint * 0.6 + 0.2));
    leafGeos.push(g);
  });
  // Pest specks.
  if (p.pests > 45) {
    for (let i = 0; i < 18; i++) {
      const b = blobs[i % blobs.length]!;
      const dir = new THREE.Vector3(rand() - 0.5, rand() * 0.6, rand() - 0.5).normalize();
      const g = new THREE.IcosahedronGeometry(0.025 + V * 0.004, 0);
      g.translate(b.c.x + dir.x * b.r * 0.95, b.c.y + dir.y * b.r * 0.8, b.c.z + dir.z * b.r * 0.95);
      paint(g, new THREE.Color('#3a2a1c'));
      leafGeos.push(g);
    }
  }
  const canopy = new THREE.Mesh(merge(leafGeos, true), leafMat());
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  // Perches on the outer tops of canopy blobs, preferring the camera side.
  blobs
    .slice()
    .sort((a, b) => b.c.z + b.c.x * 0.3 + b.c.y * 0.8 - (a.c.z + a.c.x * 0.3 + a.c.y * 0.8))
    .forEach((b) => {
      const out = new THREE.Vector3(b.c.x - top.x, 0, b.c.z - top.z);
      if (out.lengthSq() < 1e-4) out.set(0.3, 0, 1);
      out.normalize();
      perches.push({ pos: b.c.clone().addScaledVector(out, b.r * 0.62).add(new THREE.Vector3(0, b.r * 0.74, 0)), out });
    });

  // Reinforcement: stakes and ropes.
  if (p.reinforce?.stakes || p.reinforce?.ropes) {
    const sticks: THREE.BufferGeometry[] = [];
    const ropes: THREE.BufferGeometry[] = [];
    const reach = trunkRadius * 3 + 0.25;
    const h = Math.min(trunkTop * 0.8, 1.6 + trunkRadius);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const foot = new THREE.Vector3(Math.cos(a) * reach, 0, Math.sin(a) * reach);
      const head = new THREE.Vector3(Math.cos(a) * (trunkRadius + 0.03), h, Math.sin(a) * (trunkRadius + 0.03));
      if (p.reinforce.stakes) sticks.push(limb(foot, head, 0.03 + trunkRadius * 0.08, 0.025, 5));
      if (p.reinforce.ropes) {
        const far = new THREE.Vector3(Math.cos(a + 0.5) * reach * 1.8, 0.02, Math.sin(a + 0.5) * reach * 1.8);
        ropes.push(limb(far, new THREE.Vector3(Math.cos(a + 0.5) * trunkRadius, h * 0.85, Math.sin(a + 0.5) * trunkRadius), 0.012, 0.012, 3));
        const peg = new THREE.CylinderGeometry(0.03, 0.02, 0.14, 5);
        peg.translate(far.x, 0.05, far.z);
        sticks.push(peg);
      }
    }
    if (sticks.length) {
      const m = new THREE.Mesh(merge(sticks), mat('#c99a63'));
      m.castShadow = true;
      group.add(m);
    }
    if (ropes.length) {
      const band = new THREE.TorusGeometry(trunkRadius * 1.02, 0.018, 4, 12);
      band.rotateX(Math.PI / 2);
      band.translate(0, h * 0.85, 0);
      ropes.push(band);
      group.add(new THREE.Mesh(merge(ropes), mat('#e8dcc0')));
    }
  }

  return finish(group, canopy, V, blobs, crownY, trunkRadius, perches, trunkSpots, nest, hollow);
}

function finish(group: THREE.Group, canopy: THREE.Mesh | null, V: number, blobs: Blob[], crownY: number, trunkRadius: number, perches: Perch[], trunkSpots: Perch[], nest: Perch | null, hollow: Perch | null): TreeBuild {
  let canopyRadius = 0.2;
  let height = V;
  for (const b of blobs) {
    canopyRadius = Math.max(canopyRadius, Math.hypot(b.c.x, b.c.z) + b.r);
    height = Math.max(height, b.c.y + b.r * 0.82);
  }
  return {
    group,
    canopy,
    height,
    canopyRadius,
    crownY,
    trunkRadius,
    perches,
    trunkSpots,
    nest,
    hollow,
    dispose: () => disposeTree(group),
  };
}
