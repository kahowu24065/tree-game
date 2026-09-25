import * as THREE from 'three';
import { speciesDef, type SpeciesId, type TreeForm } from '../data/species';
import type { Reinforcement } from '../types';
import { clamp, mulberry32 } from '../util';
import { modelScaleFor } from '../scale';
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
  species: SpeciesId;
  /** Growth stage 0–4 (幼苗、小樹、青年樹、成年樹、巨樹). */
  stage: number;
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
  /** Rendered height in metres (= game height G). */
  height: number;
  /** Height in the model's own (pre-scale) units, for the wind shader. */
  localHeight: number;
  /** Model units → metres. */
  metricScale: number;
  canopyRadius: number;
  crownY: number;
  trunkRadius: number;
  perches: Perch[];
  trunkSpots: Perch[];
  nest: Perch | null;
  hollow: Perch | null;
  dispose(): void;
}

/* ---------- Shared wind-driven foliage material ---------- */

/** Uniforms shared by every foliage mesh: the scene sets time and wind strength each frame. */
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.1 },
  uHeight: { value: 3 },
  uGust: { value: 0 },
};

let leafMaterial: THREE.MeshStandardMaterial | null = null;
export function leafMat(): THREE.MeshStandardMaterial {
  if (leafMaterial) return leafMaterial;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.82, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, windUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uWind; uniform float uHeight; uniform float uGust;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float hk = clamp(position.y / max(uHeight, 0.5), 0.0, 1.2);
        float bend = hk * hk;
        float ph = position.x * 1.7 + position.z * 1.3;
        float flutter = sin(uTime * (2.2 + uWind * 5.0) + ph * 2.0) * 0.5 + sin(uTime * 3.7 + ph * 3.1) * 0.25;
        float sway = sin(uTime * (0.9 + uWind * 1.4) + position.y * 0.35);
        float amp = uHeight * (0.004 + uWind * 0.03) * (1.0 + uGust * 0.8);
        transformed.x += (sway * 0.7 + flutter * 0.35) * amp * bend + uGust * uWind * bend * uHeight * 0.02;
        transformed.z += (cos(uTime * 1.1 + ph) * 0.4 + flutter * 0.3) * amp * bend;
        transformed.y += flutter * amp * 0.25 * hk;`,
      );
  };
  leafMaterial = m;
  return m;
}

let barkMaterial: THREE.MeshStandardMaterial | null = null;
function barkMat(): THREE.MeshStandardMaterial {
  barkMaterial ??= new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92 });
  return barkMaterial;
}

/* ---------- Build context ---------- */

const V3 = THREE.Vector3;
const col = (hex: string) => new THREE.Color(hex);

interface Spot {
  c: THREE.Vector3;
  r: number;
  /** Foliage colour at this spot (used for the lush inner fill). */
  col?: THREE.Color;
}

class Ctx {
  rand: () => number;
  V: number;
  stage: number;
  health: number;
  fullness: number;
  /** 0 (neglected) … 1 (well cared for): drives how full the crown is. */
  density: number;
  bark: THREE.BufferGeometry[] = [];
  leaves: THREE.BufferGeometry[] = [];
  spots: Spot[] = [];
  trunkPts: THREE.Vector3[] = [];
  trunkTop = 0;
  trunkRadius = 0.05;
  crownY = 0;
  nest: Perch | null = null;
  hollow: Perch | null = null;
  extraHeight = 0;
  p: TreeParams;
  constructor(p: TreeParams) {
    this.p = p;
    this.rand = mulberry32(p.seed || 7);
    this.V = visualHeight(p.heightCm);
    this.stage = clamp(Math.round(p.stage), 0, 4);
    this.health = p.health;
    this.density = clamp((p.health - 10) / 75, 0, 1);
    this.fullness = 0.62 + 0.38 * this.density;
  }

  /** Leaf colour: species base, dulled toward sick yellow-brown when health is low. */
  leaf(hex: string, jitter = 0.05, light = 0): THREE.Color {
    const c = col(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL(hsl.h + (this.rand() - 0.5) * jitter * 0.4, clamp(hsl.s + (this.rand() - 0.5) * jitter, 0, 1), clamp(hsl.l + (this.rand() - 0.5) * jitter + light, 0, 1));
    const sick = new THREE.Color().setHSL(0.1 + this.rand() * 0.03, 0.45, 0.4);
    return c.lerp(sick, clamp((60 - this.health) / 50, 0, 0.85));
  }

  /** Straight-ish trunk along a gently wandering polyline. */
  trunk(height: number, r0: number, rTop: number, colour: string | ((y: number) => THREE.Color), opts: { segs?: number; wobble?: number; sides?: number; jitter?: number } = {}): void {
    const segs = opts.segs ?? 5;
    const wob = opts.wobble ?? 0.03;
    const seed = this.p.seed;
    const pts = [new V3(0, 0, 0)];
    for (let i = 1; i <= segs; i++) {
      const t = i / segs;
      pts.push(new V3(Math.sin(t * 2.2 + seed) * this.V * wob, height * t, Math.cos(t * 1.7 + seed) * this.V * wob * 0.7));
    }
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < segs; i++) {
      const a = r0 + (rTop - r0) * (i / segs);
      const b = r0 + (rTop - r0) * ((i + 1) / segs);
      geos.push(limb(pts[i]!, pts[i + 1]!, a, b, opts.sides ?? 8));
    }
    const g = merge(geos);
    if (opts.jitter) jitterGeometry(g, r0 * opts.jitter, seed, false);
    paint(g, typeof colour === 'string' ? (() => { const c = col(colour); return (y: number) => c.clone().offsetHSL(0, 0, (Math.sin(y * 7) * 0.02)); })() : colour);
    this.bark.push(g);
    this.trunkPts = pts;
    this.trunkTop = height;
    this.trunkRadius = r0;
  }

  /** Point on the trunk at height fraction f. */
  trunkAt(f: number): THREE.Vector3 {
    const pts = this.trunkPts;
    const x = clamp(f, 0, 1) * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(x));
    return new V3().lerpVectors(pts[i]!, pts[i + 1]!, x - i);
  }

  limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, colour: string, sides = 5): void {
    this.bark.push(paint(limb(a, b, r0, r1, sides), col(colour)));
  }

  /** Low health thins the crown: some optional foliage pieces are left out. */
  skip(): boolean {
    if (this.stage === 0 || this.spots.length < 6) return false;
    const thin = clamp((0.6 - this.density) * 0.85, 0, 0.45);
    return thin > 0 && this.rand() < thin;
  }

  blob(c: THREE.Vector3, r: number, colour: THREE.Color, squash = 0.82, detail = 1, spot = true): void {
    if (spot && this.skip()) return;
    const g = new THREE.IcosahedronGeometry(r, detail);
    jitterGeometry(g, r * 0.26, c.x * 3.1 + c.z * 1.7 + this.p.seed, true);
    g.scale(1, squash, 1);
    g.translate(c.x, c.y, c.z);
    const top = colour.clone().offsetHSL(0, 0, 0.06);
    const bottom = colour.clone().offsetHSL(0, 0, -0.07);
    paint(g, (y) => bottom.clone().lerp(top, clamp((y - (c.y - r)) / (2 * r), 0, 1)));
    this.leaves.push(g);
    if (spot) this.spots.push({ c: c.clone(), r, col: colour });
  }

  /** Conifer tier: an 8-sided cone, jittered, darker underneath. */
  cone(base: THREE.Vector3, r: number, h: number, colour: THREE.Color, segs = 8, tipLift = 0): void {
    const g = new THREE.ConeGeometry(r, h, segs, 2);
    jitterGeometry(g, r * 0.14, base.y * 2.3 + this.p.seed, false);
    g.translate(base.x, base.y + h / 2 + tipLift, base.z);
    const top = colour.clone().offsetHSL(0, 0, 0.07);
    const under = colour.clone().offsetHSL(0, -0.05, -0.08);
    paint(g, (y) => under.clone().lerp(top, clamp((y - base.y) / h, 0, 1)));
    this.leaves.push(g);
    this.spots.push({ c: new V3(base.x, base.y + h * 0.35, base.z), r: r * 0.8, col: colour });
  }

  /** Flat spray of foliage (feathery conifer shoots, drooping cedar tiers). */
  spray(from: THREE.Vector3, dir: THREE.Vector3, len: number, width: number, colour: THREE.Color, droop = 0): void {
    if (this.skip()) return;
    const g = ellipsoid(len / 2, width * 0.22, width / 2, 1);
    jitterGeometry(g, width * 0.12, from.y * 5 + len, false);
    g.translate(len / 2, 0, 0);
    if (droop) g.rotateZ(-droop);
    const yaw = Math.atan2(-dir.z, dir.x);
    const pitch = Math.asin(clamp(dir.y, -1, 1));
    g.rotateZ(pitch);
    g.rotateY(yaw);
    g.translate(from.x, from.y, from.z);
    const tip = colour.clone().offsetHSL(0, 0.03, 0.08);
    paint(g, (_y, i) => (i % 3 === 0 ? tip : colour));
    this.leaves.push(g);
    const mid = from.clone().addScaledVector(dir, len * 0.7);
    this.spots.push({ c: mid, r: width * 0.6, col: colour });
  }

  /** Small accent (flower, cone, fruit) mixed into the foliage mesh so it sways with it. */
  accent(pos: THREE.Vector3, r: number, colour: string, shape: 'ball' | 'cup' | 'cone' | 'fluff' = 'ball'): void {
    let g: THREE.BufferGeometry;
    if (shape === 'cup') {
      g = new THREE.ConeGeometry(r, r * 1.1, 5, 1, true);
      g.rotateX(Math.PI);
      g.translate(0, r * 0.4, 0);
    } else if (shape === 'cone') {
      g = new THREE.CylinderGeometry(r * 0.55, r * 0.7, r * 2.2, 5);
    } else if (shape === 'fluff') {
      g = new THREE.IcosahedronGeometry(r, 0);
      g.scale(1.2, 0.9, 1.1);
    } else {
      g = new THREE.IcosahedronGeometry(r, 0);
    }
    g.rotateY(this.rand() * 6.28);
    g.translate(pos.x, pos.y, pos.z);
    paint(g, col(colour));
    this.leaves.push(g);
  }

  /** Random point on the outside of a foliage spot, biased upward. */
  onSpot(s: Spot, up = 0.4): THREE.Vector3 {
    const d = new V3(this.rand() - 0.5, this.rand() * up + (up > 0 ? 0.1 : -0.1), this.rand() - 0.5).normalize();
    return s.c.clone().addScaledVector(d, s.r * 0.95);
  }

  rootFlare(n: number, reach: number, colour: string): void {
    const r = this.trunkRadius;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + this.rand() * 0.4;
      const len = r * reach * (0.8 + this.rand() * 0.5);
      this.limb(new V3(0, r * 1.1, 0), new V3(Math.cos(a) * len, 0.02, Math.sin(a) * len), r * 0.5, r * 0.12, colour, 5);
    }
  }

  trunkSpots(): Perch[] {
    const out: Perch[] = [];
    for (const f of [0.3, 0.5, 0.7]) {
      const base = this.trunkAt(f * Math.min(1, (this.trunkTop || this.V) / this.V));
      const y = (this.trunkTop || this.V * 0.5) * f;
      const r = this.trunkRadius * (1 - f * 0.4);
      for (const a of [0.9, 1.5, 2.2]) {
        const dir = new V3(Math.cos(a), 0, Math.sin(a));
        out.push({ pos: new V3(base.x + dir.x * r, y, base.z + dir.z * r), out: dir });
      }
    }
    return out;
  }
}

/* ---------- Seedlings (stage 0) ---------- */

type LeafShape = 'ovate' | 'small' | 'palmate' | 'fan' | 'round' | 'needles';
const SEEDLING: Record<TreeForm, { leaf: LeafShape; colour: string; stem: string }> = {
  round: { leaf: 'ovate', colour: '#5fa040', stem: '#6f8a3e' },
  tiered: { leaf: 'palmate', colour: '#6aa84a', stem: '#7c8a5a' },
  banyan: { leaf: 'small', colour: '#3f7f38', stem: '#6f7a4a' },
  narrowCone: { leaf: 'needles', colour: '#8cc45a', stem: '#8a5a3a' },
  fan: { leaf: 'fan', colour: '#86b84c', stem: '#7a7a5a' },
  drooping: { leaf: 'needles', colour: '#6f9c8c', stem: '#6a5a48' },
  column: { leaf: 'needles', colour: '#3f7248', stem: '#8a4a30' },
  eucalypt: { leaf: 'round', colour: '#8fb0a0', stem: '#9a7a5a' },
  cone: { leaf: 'needles', colour: '#3f6e48', stem: '#6b4a35' },
};

function seedling(c: Ctx, form: TreeForm): void {
  const s = SEEDLING[form];
  const V = c.V;
  c.trunkRadius = 0.02 + V * 0.025;
  const top = new V3(0.03, V, 0);
  c.limb(new V3(0, 0, 0), new V3(-0.015, V * 0.5, 0.01), c.trunkRadius, c.trunkRadius * 0.8, s.stem, 5);
  c.limb(new V3(-0.015, V * 0.5, 0.01), top, c.trunkRadius * 0.8, c.trunkRadius * 0.45, s.stem, 5);
  c.trunkPts = [new V3(0, 0, 0), new V3(-0.015, V * 0.5, 0.01), top];
  c.trunkTop = V;
  const n = 2 + Math.min(6, Math.floor(c.p.heightCm / 7));
  if (s.leaf === 'needles') {
    // Whorls of fine needles up the stem, plus a tuft at the top.
    const whorls = 2 + Math.min(3, Math.floor(c.p.heightCm / 12));
    for (let w = 0; w < whorls; w++) {
      const y = V * (0.45 + 0.5 * (w / Math.max(1, whorls - 1)));
      const k = 7;
      for (let i = 0; i < k; i++) {
        const a = (i / k) * 6.28 + w;
        const len = (0.12 + V * 0.16) * (1 - w * 0.12);
        const g = new THREE.ConeGeometry(0.012 + V * 0.006, len, 3);
        g.translate(0, len / 2, 0);
        g.rotateZ(-(form === 'drooping' ? 1.35 : 1.05));
        g.rotateY(a);
        g.translate(0, y, 0);
        paint(g, c.leaf(s.colour));
        c.leaves.push(g);
      }
    }
    c.accent(top, 0.03 + V * 0.025, s.colour);
  } else {
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + c.rand() * 0.4;
      const h = V * (0.45 + 0.55 * (i / Math.max(1, n - 1)));
      const len = 0.09 + V * 0.18 * (0.7 + c.rand() * 0.4);
      const parts: THREE.BufferGeometry[] = [];
      if (s.leaf === 'palmate') {
        for (let k = 0; k < 5; k++) {
          const g = ellipsoid(len * 0.5, 0.012, len * 0.16, 1);
          g.translate(len * 0.5, 0, 0);
          g.rotateY((k - 2) * 0.5);
          parts.push(g);
        }
      } else if (s.leaf === 'fan') {
        const g = new THREE.CircleGeometry(len * 0.7, 6, -Math.PI / 2 - 0.9, 1.8);
        g.rotateX(-Math.PI / 2);
        g.rotateZ(0.2);
        g.translate(len * 0.2, 0, 0);
        const back = g.clone();
        back.rotateX(Math.PI);
        parts.push(g, back);
      } else {
        const w = s.leaf === 'small' ? 0.35 : s.leaf === 'round' ? 0.8 : 0.45;
        const l = s.leaf === 'small' ? len * 0.7 : len;
        const g = ellipsoid(l, 0.016 + V * 0.01, l * w, 1);
        g.translate(l * 0.9, 0, 0);
        parts.push(g);
      }
      const g = merge(parts);
      g.rotateZ(0.45 + c.rand() * 0.3);
      g.rotateY(a);
      g.translate(0, h, 0);
      paint(g, c.leaf(s.colour, 0.06, s.leaf === 'round' ? 0.04 : 0));
      c.leaves.push(g);
      c.spots.push({ c: new V3(Math.cos(-a) * len, h + len * 0.3, Math.sin(-a) * len), r: len * 0.6 });
    }
    c.accent(top, 0.04 + V * 0.03, s.colour);
  }
  c.spots.push({ c: new V3(0, V * 0.8, 0), r: 0.15 + V * 0.3 });
  c.crownY = V;
}

/* ---------- Broadleaf branching helper ---------- */

function branchOut(c: Ctx, opts: {
  primaries: number;
  depth: number;
  from: [number, number];
  len: number;
  tilt: [number, number];
  radius: number;
  bark: string;
  onTip: (tip: THREE.Vector3, dir: THREE.Vector3, level: number) => void;
  spread?: number;
}): void {
  const { rand } = c;
  const grow = (from: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, level: number) => {
    const to = from.clone().addScaledVector(dir, len);
    c.limb(from, to, r, r * 0.62, opts.bark, level === 0 ? 6 : 5);
    if (level >= opts.depth) {
      opts.onTip(to, dir, level);
      return;
    }
    const kids = level === 0 ? 2 : 2 + (rand() < 0.35 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const spin = (k / kids) * Math.PI * 2 + rand() * 1.2;
      const side = new V3(Math.cos(spin), 0, Math.sin(spin));
      const nd = dir.clone().multiplyScalar(0.7).addScaledVector(side, opts.spread ?? 0.55).add(new V3(0, 0.3, 0)).normalize();
      grow(to, nd, len * (0.62 + rand() * 0.12), r * 0.62, level + 1);
    }
    if (level >= 1) opts.onTip(to, dir, level - 0.5);
  };
  for (let i = 0; i < opts.primaries; i++) {
    const a = (i / opts.primaries) * Math.PI * 2 + rand() * 0.6 + c.p.seed * 0.1;
    const f = opts.from[0] + (opts.from[1] - opts.from[0]) * (i / Math.max(1, opts.primaries - 1));
    const base = c.trunkAt(f);
    base.y = c.trunkTop * f;
    const tilt = opts.tilt[0] + rand() * (opts.tilt[1] - opts.tilt[0]);
    const dir = new V3(Math.cos(a) * Math.cos(tilt), Math.sin(tilt), Math.sin(a) * Math.cos(tilt)).normalize();
    grow(base, dir, opts.len * (0.85 + rand() * 0.3), opts.radius, 0);
    if (!c.nest && Math.sin(a) > 0.1 && c.stage >= 2) c.nest = { pos: base.clone().addScaledVector(dir, opts.len * 0.28), out: new V3(dir.x, 0, dir.z).normalize() };
  }
}

/* ---------- Species forms ---------- */

function roundCamphor(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#7a6655';
  c.trunk(V * [0, 0.46, 0.4, 0.34, 0.3][stage]!, 0.035 + V * 0.03 + stage * 0.03, 0.03 + V * 0.014, bark, { jitter: stage >= 3 ? 0.12 : 0.04 });
  const base = '#4c8f3c';
  branchOut(c, {
    primaries: [0, 3, 5, 6, 8][stage]!,
    depth: [0, 1, 2, 2, 3][stage]!,
    from: [0.7, 1],
    len: V * [0, 0.34, 0.36, 0.38, 0.4][stage]!,
    tilt: [0.45, 0.85],
    radius: c.trunkRadius * 0.55,
    bark,
    onTip: (tip) => {
      const r = (V * (0.12 + 0.05 * rand()) + 0.08) * c.fullness;
      const bronze = stage >= 2 && rand() < 0.16;
      c.blob(tip.clone().add(new V3(0, r * 0.25, 0)), r, bronze ? c.leaf('#b56a3a', 0.06) : c.leaf(base, 0.08));
    },
  });
  // Fill the dome.
  const top = c.trunkAt(1);
  const domeR = V * [0, 0.18, 0.24, 0.28, 0.3][stage]! * c.fullness;
  c.blob(new V3(top.x, V * 0.8, top.z), domeR, c.leaf(base, 0.05, 0.03));
  if (stage >= 2) for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + rand();
    c.blob(new V3(top.x + Math.cos(a) * V * 0.22, V * 0.66, top.z + Math.sin(a) * V * 0.22), domeR * 0.8, c.leaf(base, 0.08));
  }
  if (stage >= 3) {
    for (let i = 0; i < 70; i++) c.accent(c.onSpot(c.spots[i % c.spots.length]!, 0.8), 0.03 + V * 0.004, '#f3f1d8');
    c.rootFlare(5 + stage, 2.6, bark);
  }
  c.crownY = V * 0.66;
}

function tieredCotton(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#8f8b80';
  const tr = 0.03 + V * 0.026 + stage * 0.022;
  c.trunk(V * 0.93, tr, tr * 0.35, bark, { wobble: 0.01 });
  // Young trunks are studded with conical spines.
  if (stage <= 2) {
    for (let i = 0; i < 18; i++) {
      const f = 0.08 + rand() * 0.8;
      const p = c.trunkAt(f);
      const a = rand() * 6.28;
      const r = tr * (1 - f * 0.6);
      const g = new THREE.ConeGeometry(tr * 0.18, tr * 0.5, 4);
      g.translate(0, tr * 0.25, 0);
      g.rotateZ(-Math.PI / 2);
      g.rotateY(a);
      g.translate(p.x + Math.cos(a) * r * 0.9, V * 0.93 * f, p.z - Math.sin(a) * r * 0.9);
      c.bark.push(paint(g, col('#7a766c')));
    }
  }
  const tiers = [0, 2, 3, 4, 5][stage]!;
  const flowers = stage >= 3;
  for (let t = 0; t < tiers; t++) {
    const f = 0.38 + (0.5 * t) / Math.max(1, tiers - 1);
    const y = V * 0.93 * f;
    const at = c.trunkAt(f);
    const n = 4 + (t % 2);
    const len = V * (0.34 - 0.2 * (t / Math.max(1, tiers)));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + t * 0.7 + rand() * 0.3;
      const dir = new V3(Math.cos(a), 0.12 + rand() * 0.12, Math.sin(a)).normalize();
      const from = new V3(at.x, y, at.z);
      const mid = from.clone().addScaledVector(dir, len * 0.75);
      const tip = mid.clone().add(new V3(dir.x * len * 0.25, len * 0.12, dir.z * len * 0.25));
      c.limb(from, mid, tr * 0.32, tr * 0.14, bark);
      c.limb(mid, tip, tr * 0.14, tr * 0.08, bark);
      if (!c.nest && Math.sin(a) > 0.2 && t === 0) c.nest = { pos: mid.clone(), out: new V3(dir.x, 0, dir.z) };
      // Palmate leaf clumps (fewer when flowering, like the real tree in spring).
      const clumps = flowers ? 1 : 2;
      for (let k = 0; k < clumps; k++) {
        const p = new V3().lerpVectors(mid, tip, k ? 0.3 : 1);
        const r = (0.12 + V * 0.05) * c.fullness;
        for (let s = 0; s < 5; s++) {
          const g = ellipsoid(r, r * 0.12, r * 0.32, 0);
          g.translate(r * 0.8, 0, 0);
          g.rotateZ(0.25);
          g.rotateY(s * 1.256 + rand());
          g.translate(p.x, p.y + r * 0.2, p.z);
          paint(g, c.leaf('#6a9c44', 0.08));
          c.leaves.push(g);
        }
        c.spots.push({ c: p.clone().add(new V3(0, r * 0.3, 0)), r: r * 1.2 });
      }
      if (flowers) {
        const k = stage === 4 ? 5 : 4;
        for (let q = 0; q < k; q++) {
          const p = new V3().lerpVectors(from, tip, 0.35 + q * 0.16).add(new V3(0, tr * 0.2, 0));
          c.accent(p, 0.06 + V * 0.009, q % 2 ? '#e0392b' : '#c92a22', 'cup');
        }
        if (stage === 4 && rand() < 0.5) c.accent(tip.clone().add(new V3(0, 0.1, 0)), 0.09 + V * 0.01, '#f5f3ea', 'fluff');
      }
    }
  }
  const top = c.trunkAt(1);
  c.blob(new V3(top.x, V * 0.97, top.z), (0.1 + V * 0.05) * c.fullness, c.leaf('#6a9c44'));
  if (flowers) c.accent(new V3(top.x, V, top.z), 0.07 + V * 0.009, '#e0392b', 'cup');
  if (stage >= 3) c.rootFlare(6 + stage, 3, bark);
  c.crownY = V * 0.7;
}

function banyan(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#948a78';
  const tr = 0.04 + V * 0.045 + stage * 0.035;
  c.trunk(V * 0.36, tr, tr * 0.7, bark, { wobble: 0.06, jitter: 0.18 });
  // Extra fused stems.
  if (stage >= 2) for (let i = 0; i < stage; i++) {
    const a = i * 2.3 + 0.5;
    const off = new V3(Math.cos(a) * tr * 0.7, 0, Math.sin(a) * tr * 0.7);
    c.limb(off, off.clone().multiplyScalar(0.3).add(new V3(0, V * 0.34, 0)), tr * 0.5, tr * 0.35, bark, 6);
  }
  const hangers: THREE.Vector3[] = [];
  branchOut(c, {
    primaries: [0, 3, 5, 7, 9][stage]!,
    depth: [0, 1, 2, 2, 3][stage]!,
    from: [0.75, 1],
    len: V * [0, 0.34, 0.42, 0.48, 0.52][stage]!,
    tilt: [0.18, 0.5],
    radius: tr * 0.45,
    bark,
    spread: 0.75,
    onTip: (tip, _d, level) => {
      const r = (V * (0.11 + 0.05 * rand()) + 0.08) * c.fullness;
      c.blob(tip.clone().add(new V3(0, r * 0.2, 0)), r, c.leaf('#3c7534', 0.07), 0.72);
      if (level < 3) hangers.push(tip.clone());
    },
  });
  const top = c.trunkAt(1);
  c.blob(new V3(top.x, V * 0.62, top.z), V * 0.24 * c.fullness, c.leaf('#3c7534', 0.05, 0.02), 0.7);
  // Aerial roots: curtains hanging from the limbs; the biggest reach the ground as pillar roots.
  const rootCount = [0, 0, 6, 18, 30][stage]!;
  for (let i = 0; i < rootCount && hangers.length; i++) {
    const h = hangers[i % hangers.length]!.clone().add(new V3((rand() - 0.5) * V * 0.1, -V * 0.02, (rand() - 0.5) * V * 0.1));
    const pillar = stage === 4 && i % 5 === 0;
    const len = pillar ? h.y : h.y * (0.25 + rand() * 0.45);
    const r = pillar ? tr * 0.22 : 0.008 + V * 0.002;
    c.limb(h, h.clone().add(new V3(0, -len, 0)), r, pillar ? r * 1.3 : r * 0.6, pillar ? bark : '#a8977a', 4);
  }
  if (stage === 4) for (let i = 0; i < 60; i++) c.accent(c.onSpot(c.spots[i % c.spots.length]!, 0.2), 0.025 + V * 0.003, i % 3 ? '#c8546a' : '#8a3a4a');
  if (stage >= 3) c.rootFlare(7, 3.2, bark);
  c.crownY = V * 0.6;
}

function narrowCone(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#8a4b2e';
  const tr = 0.03 + V * 0.026 + stage * 0.02;
  c.trunk(V * 0.98, tr, tr * 0.12, bark, { wobble: 0.008, jitter: stage >= 3 ? 0.16 : 0.04, sides: 9 });
  const y0 = V * [0, 0.1, 0.1, 0.16, 0.24][stage]!;
  const layers = [0, 9, 14, 19, 24][stage]!;
  const baseR = V * [0, 0.21, 0.2, 0.19, 0.18][stage]! * c.fullness;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const y = y0 + (V * 0.98 - y0) * t;
    const r = Math.max(0.08, baseR * Math.pow(1 - t, 0.85));
    const at = c.trunkAt(y / (V * 0.98));
    const n = 5 + (l % 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + l * 0.9 + rand() * 0.3;
      const dir = new V3(Math.cos(a), 0.35, Math.sin(a)).normalize();
      // Autumn copper on the giant stage, fresh green otherwise.
      const autumn = stage === 4 && rand() < 0.7;
      const colour = autumn ? c.leaf(rand() < 0.5 ? '#c7652e' : '#d98a3c', 0.06) : c.leaf('#86bc56', 0.07);
      c.spray(new V3(at.x, y, at.z), dir, r * (0.9 + rand() * 0.3), r * 0.72, colour);
    }
  }
  const top = c.trunkAt(1);
  // Feathery conical core so the narrow crown reads solid, not see-through.
  const coreH = V * 0.98 - y0;
  c.cone(new V3(top.x * 0.5, y0 + coreH * 0.04, top.z * 0.5), baseR * 0.62, coreH * 0.95, c.leaf(stage === 4 ? '#a8622e' : '#6fa446', 0.05), 9);
  c.blob(new V3(top.x, V * 0.99, top.z), 0.06 + V * 0.02, c.leaf(stage === 4 ? '#c7652e' : '#86bc56'), 1.4, 0);
  if (stage >= 3) c.rootFlare(8, stage === 4 ? 3.4 : 2.4, bark);
  c.crownY = V * 0.55;
}

function fanGinkgo(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#8a8274';
  c.trunk(V * [0, 0.72, 0.64, 0.6, 0.56][stage]!, 0.03 + V * 0.026 + stage * 0.024, 0.02 + V * 0.01, bark, { wobble: 0.025, jitter: stage >= 3 ? 0.12 : 0.03 });
  const goldShare = [0, 0, 0, 0.45, 1][stage]!;
  const clump = (p: THREE.Vector3, size: number) => {
    const gold = rand() < goldShare;
    const colour = gold ? c.leaf(rand() < 0.6 ? '#f0c428' : '#e2a41e', 0.05) : c.leaf('#7fb24a', 0.07);
    // Fan-shaped leaves: half-discs turned every which way over a small core.
    c.blob(p, size * 0.55, colour, 0.8, 0);
    for (let i = 0; i < 4; i++) {
      const g = new THREE.CircleGeometry(size * 0.55, 5, 0, Math.PI);
      g.rotateX(rand() * 6.28);
      g.rotateY(rand() * 6.28);
      const d = new V3(rand() - 0.5, rand() * 0.6, rand() - 0.5).normalize().multiplyScalar(size * 0.5);
      g.translate(p.x + d.x, p.y + d.y, p.z + d.z);
      paint(g, colour.clone().offsetHSL(0, 0, 0.05));
      c.leaves.push(g);
    }
  };
  branchOut(c, {
    primaries: [0, 3, 4, 6, 7][stage]!,
    depth: [0, 1, 1, 2, 2][stage]!,
    from: [0.35, 1],
    len: V * [0, 0.3, 0.34, 0.34, 0.36][stage]!,
    tilt: [0.7, 1.0],
    radius: c.trunkRadius * 0.45,
    bark,
    spread: 0.4,
    onTip: (tip, dir) => {
      const s = (0.12 + V * 0.06) * c.fullness * (0.8 + rand() * 0.5);
      clump(tip, s);
      clump(tip.clone().addScaledVector(dir, -s * 1.2).add(new V3(0, -s * 0.2, 0)), s * 0.8);
    },
  });
  const top = c.trunkAt(1);
  clump(new V3(top.x, V * 0.9, top.z), (0.14 + V * 0.07) * c.fullness);
  if (stage >= 2) clump(new V3(top.x, V * 0.72, top.z), (0.12 + V * 0.06) * c.fullness);
  // Golden carpet of fallen leaves under the giant.
  if (stage === 4) {
    const g = new THREE.CircleGeometry(V * 0.34, 18);
    g.rotateX(-Math.PI / 2);
    jitterGeometry(g, V * 0.02, 3, false);
    g.translate(0, 0.03, 0);
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count; i++) pos.setY(i, 0.03);
    paint(g, (_y, i) => col(i % 4 ? '#e8b82a' : '#d49a1c'));
    c.bark.push(g);
    c.rootFlare(7, 2.4, bark);
  }
  c.crownY = V * 0.62;
}

function droopingDeodar(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#5a4a3e';
  const tr = 0.03 + V * 0.028 + stage * 0.022;
  c.trunk(V * 0.93, tr, tr * 0.15, bark, { wobble: 0.01, jitter: stage >= 3 ? 0.12 : 0.03 });
  // Nodding leader.
  const top = c.trunkAt(1);
  const tip = new V3(top.x + V * 0.05, V, top.z + V * 0.02);
  c.limb(top, tip, tr * 0.15, tr * 0.05, bark, 4);
  c.spray(top, new V3(0.5, 0.85, 0.2).normalize(), V * 0.08, V * 0.05, c.leaf('#6f9c8c'));
  const y0 = V * [0, 0.12, 0.08, 0.08, 0.12][stage]!;
  const tiers = [0, 4, 6, 8, 10][stage]!;
  const baseR = V * [0, 0.26, 0.3, 0.34, 0.36][stage]! * c.fullness;
  for (let t = 0; t < tiers; t++) {
    const k = t / Math.max(1, tiers - 1);
    const y = y0 + (V * 0.88 - y0) * k;
    const r = Math.max(0.12, baseR * (1 - k * 0.85));
    const at = c.trunkAt(y / (V * 0.93));
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + t * 0.5 + rand() * 0.4;
      const dir = new V3(Math.cos(a), 0.05, Math.sin(a)).normalize();
      const colour = c.leaf(rand() < 0.3 ? '#86ab9c' : '#5d8f7c', 0.06);
      c.spray(new V3(at.x, y, at.z), dir, r * (0.9 + rand() * 0.25), r * 0.7, colour, 0.28);
      if (stage >= 3 && rand() < 0.3) {
        const p = new V3(at.x, y, at.z).addScaledVector(dir, r * 0.6).add(new V3(0, r * 0.12, 0));
        c.accent(p, 0.04 + V * 0.006, '#9aa88a', 'cone');
      }
    }
  }
  if (stage >= 3) c.rootFlare(7, 2.6, bark);
  c.crownY = V * 0.5;
}

function columnRedwood(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = (y: number) => col(y < V * 0.08 && stage === 4 ? '#7a3a22' : '#9a4a2c').offsetHSL(0, 0, Math.sin(y * 9) * 0.02);
  const tr = 0.04 + V * 0.034 + stage * 0.035;
  c.trunk(V * 0.97, tr, tr * 0.15, bark, { wobble: 0.006, jitter: stage >= 2 ? 0.22 : 0.05, sides: 10 });
  // Fire scar: a dark hollow at the base of the giant.
  if (stage === 4) {
    const g = ellipsoid(tr * 0.5, tr * 1.6, tr * 0.25, 1);
    g.translate(tr * 0.3, tr * 1.3, tr * 0.88);
    c.bark.push(paint(g, col('#241612')));
  }
  const y0 = V * [0, 0.08, 0.1, 0.4, 0.52][stage]!;
  const layers = [0, 7, 10, 13, 15][stage]!;
  const baseR = V * [0, 0.2, 0.17, 0.13, 0.12][stage]! * c.fullness;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const y = y0 + (V * 0.97 - y0) * t;
    const r = Math.max(0.08, baseR * Math.pow(1 - t, 0.55));
    const at = c.trunkAt(y / (V * 0.97));
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + l * 1.1 + rand() * 0.4;
      const dir = new V3(Math.cos(a), -0.1, Math.sin(a)).normalize();
      const from = new V3(at.x, y, at.z);
      if (stage >= 3) c.limb(from, from.clone().addScaledVector(dir, r * 0.6), tr * 0.08, tr * 0.04, '#7a3a24', 4);
      c.blob(from.clone().addScaledVector(dir, r * 0.75), r * 0.42, c.leaf('#2f5e3a', 0.06), 0.7);
    }
  }
  const top = c.trunkAt(1);
  c.blob(new V3(top.x, V * 0.98, top.z), 0.06 + V * 0.025, c.leaf('#2f5e3a'), 1.6, 0);
  // Reiterated tops on the giant.
  if (stage === 4) for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    const base = c.trunkAt(0.8);
    const from = new V3(base.x, V * 0.78, base.z);
    const to = from.clone().add(new V3(Math.cos(a) * V * 0.05, V * 0.14, Math.sin(a) * V * 0.05));
    c.limb(from, to, tr * 0.12, tr * 0.04, '#9a4a2c', 5);
    c.cone(to.clone().add(new V3(0, -V * 0.06, 0)), V * 0.035, V * 0.1, c.leaf('#2f5e3a'), 7);
  }
  if (stage >= 3) c.rootFlare(9, stage === 4 ? 3.6 : 2.6, '#8a4028');
  c.crownY = V * 0.72;
}

function eucalypt(c: Ctx): void {
  const { V, stage, rand } = c;
  const tr = 0.03 + V * 0.028 + stage * 0.028;
  const trunkH = V * [0, 0.7, 0.72, 0.76, 0.78][stage]!;
  // Smooth pale trunk; rough brown stocking at the base on older trees.
  const bark = (y: number) => {
    const stocking = stage >= 2 && y < trunkH * 0.18;
    const base = stocking ? col('#8a7258') : col(Math.sin(y * 3.1) > 0.6 ? '#bdb9aa' : '#e2ddcf');
    return base.offsetHSL(0, 0, Math.sin(y * 17) * 0.015);
  };
  c.trunk(trunkH, tr, tr * 0.45, bark, { wobble: 0.015, sides: 9 });
  // Peeling bark ribbons.
  if (stage >= 3) for (let i = 0; i < 10; i++) {
    const a = rand() * 6.28;
    const y = trunkH * (0.15 + rand() * 0.4);
    const len = V * (0.04 + rand() * 0.05);
    const g = new THREE.BoxGeometry(tr * 0.12, len, tr * 0.02);
    g.translate(Math.cos(a) * tr * 1.02, y - len / 2, Math.sin(a) * tr * 1.02);
    c.bark.push(paint(g, col('#9a7a58')));
  }
  const top = c.trunkAt(1);
  const limbs = [0, 3, 4, 6, 7][stage]!;
  for (let i = 0; i < limbs; i++) {
    const a = (i / limbs) * 6.28 + rand() * 0.8;
    const from = new V3(top.x, trunkH * (0.92 + rand() * 0.08), top.z);
    const dir = new V3(Math.cos(a) * 0.5, 0.85, Math.sin(a) * 0.5).normalize();
    const len = V * (0.16 + rand() * 0.06);
    const to = from.clone().addScaledVector(dir, len);
    c.limb(from, to, tr * 0.38, tr * 0.14, '#d9d4c5', 5);
    if (!c.nest && i === 0 && stage >= 2) c.nest = { pos: from.clone().addScaledVector(dir, len * 0.3), out: new V3(dir.x, 0, dir.z).normalize() };
    // Open, drooping leaf clumps.
    const clumps = 3 + Math.round(stage * 1.5);
    for (let k = 0; k < clumps; k++) {
      if (k > 2 && c.skip()) continue;
      const p = to.clone().add(new V3((rand() - 0.5) * len * 0.9, (rand() - 0.3) * len * 0.45, (rand() - 0.5) * len * 0.9));
      const r = (0.13 + V * 0.055) * c.fullness * (0.7 + rand() * 0.5);
      const g = new THREE.IcosahedronGeometry(r, 1);
      jitterGeometry(g, r * 0.35, p.x * 2 + p.z, true);
      g.scale(0.9, 1.25, 0.9);
      g.translate(p.x, p.y - r * 0.3, p.z);
      const cc = c.leaf(rand() < 0.5 ? '#7d9468' : '#91a883', 0.05);
      paint(g, (y) => cc.clone().offsetHSL(0, 0, (y - p.y) * 0.05));
      c.leaves.push(g);
      c.spots.push({ c: p, r, col: cc });
    }
  }
  // Crown mass over the top of the trunk so the canopy is full when healthy.
  if (limbs) {
    const crownR = V * (0.1 + stage * 0.012) * c.fullness;
    for (let i = 0; i < 3 + stage; i++) {
      const a = (i / (3 + stage)) * 6.28 + rand();
      const p = new V3(top.x + Math.cos(a) * crownR * 0.9, trunkH + V * (0.1 + rand() * 0.08), top.z + Math.sin(a) * crownR * 0.9);
      c.blob(p, crownR * (0.75 + rand() * 0.3), c.leaf(rand() < 0.5 ? '#7d9468' : '#91a883', 0.05), 0.85);
    }
  }
  if (!limbs) c.blob(new V3(top.x, trunkH, top.z), 0.2, c.leaf('#8fb0a0'));
  // Dead spire above the crown on the giant.
  if (stage === 4) {
    const from = new V3(top.x, trunkH, top.z);
    const spire = from.clone().add(new V3(V * 0.02, V * 0.24, 0));
    c.limb(from, spire, tr * 0.3, tr * 0.05, '#b4b0a4', 5);
    for (let i = 0; i < 4; i++) {
      const p = new V3().lerpVectors(from, spire, 0.4 + i * 0.15);
      const a = i * 1.9;
      c.limb(p, p.clone().add(new V3(Math.cos(a) * V * 0.05, V * 0.03, Math.sin(a) * V * 0.05)), tr * 0.05, tr * 0.02, '#b4b0a4', 3);
    }
    c.extraHeight = V * 0.22;
    c.rootFlare(8, 3, '#8a7258');
  }
  c.crownY = trunkH;
}

function coneDouglas(c: Ctx): void {
  const { V, stage, rand } = c;
  const bark = '#6b4a35';
  const tr = 0.03 + V * 0.028 + stage * 0.026;
  c.trunk(V * 0.97, tr, tr * 0.12, bark, { wobble: 0.01, jitter: stage >= 2 ? 0.2 : 0.04 });
  const y0 = V * [0, 0.05, 0.05, 0.12, 0.38][stage]!;
  const layers = [0, 4, 6, 8, 10][stage]!;
  const baseR = V * [0, 0.3, 0.28, 0.25, 0.2][stage]! * c.fullness;
  const span = V * 0.97 - y0;
  for (let l = 0; l < layers; l++) {
    const t = l / layers;
    const y = y0 + span * t;
    const r = Math.max(0.1, baseR * (1 - t) + 0.05);
    const h = (span / layers) * 2;
    const at = c.trunkAt(y / (V * 0.97));
    const colour = c.leaf('#2e5a3c', 0.05, t * 0.04);
    c.cone(new V3(at.x, y, at.z), r, h, colour, 8);
    if (stage >= 3) for (let k = 0; k < 3; k++) {
      const a = rand() * 6.28;
      const rr = r * (0.55 + rand() * 0.3);
      c.accent(new V3(at.x + Math.cos(a) * rr, y + h * 0.2, at.z + Math.sin(a) * rr), 0.04 + V * 0.005, '#8a6040', 'cone');
    }
  }
  // Broken stubs where the lower limbs self-pruned.
  if (stage === 4) {
    for (let i = 0; i < 8; i++) {
      const f = 0.12 + rand() * 0.24;
      const p = c.trunkAt(f / 0.97);
      p.y = V * f;
      const a = rand() * 6.28;
      c.limb(p, p.clone().add(new V3(Math.cos(a) * tr * 2, -tr * 0.4, Math.sin(a) * tr * 2)), tr * 0.12, tr * 0.06, '#5a3e2c', 4);
    }
    c.rootFlare(8, 2.6, bark);
  }
  const top = c.trunkAt(1);
  c.cone(new V3(top.x, V * 0.94, top.z), 0.05 + V * 0.02, V * 0.08, c.leaf('#3a6a48'), 6);
  c.crownY = V * 0.55;
}

const FORMS: Record<TreeForm, (c: Ctx) => void> = {
  round: roundCamphor,
  tiered: tieredCotton,
  banyan,
  narrowCone,
  fan: fanGinkgo,
  drooping: droopingDeodar,
  column: columnRedwood,
  eucalypt,
  cone: coneDouglas,
};

const CONIFER: Partial<Record<TreeForm, true>> = { narrowCone: true, drooping: true, column: true, cone: true };

/** Well-cared-for trees get an inner layer of foliage filling the gaps between clumps. */
function lushen(c: Ctx, form: TreeForm): void {
  const lush = clamp((c.density - 0.5) / 0.5, 0, 1);
  if (lush <= 0.02) return;
  const leafSpots = c.spots.filter((s) => s.col);
  if (!leafSpots.length) return;
  const top = c.trunkAt(1);
  const n = Math.min(leafSpots.length, CONIFER[form] ? 28 : 40);
  const step = leafSpots.length / n;
  for (let i = 0; i < n; i++) {
    const s = leafSpots[Math.floor(i * step)]!;
    const inward = CONIFER[form] ? 0.45 : 0.3;
    const p = s.c.clone().lerp(new V3(top.x, s.c.y, top.z), inward);
    p.y -= s.r * 0.15;
    const colour = s.col!.clone().offsetHSL(0, -0.02, -0.05);
    c.blob(p, s.r * (CONIFER[form] ? 0.6 : 0.72) * (0.6 + 0.4 * lush), colour, CONIFER[form] ? 0.7 : 0.85, 1, false);
  }
}

export function treeKey(p: TreeParams): string {
  const v = visualHeight(p.heightCm);
  const r = p.reinforce;
  return [p.species, p.stage, Math.round(v * 40), Math.round(p.health / 12), p.pests > 45 ? 1 : 0, Math.min(4, p.scars), r?.stakes ? 1 : 0, r?.ropes ? 1 : 0, r?.prune ? 1 : 0, p.seed].join('|');
}

export function buildTree(p: TreeParams): TreeBuild {
  const c = new Ctx(p);
  const form = speciesDef(p.species).form;
  if (c.stage === 0) seedling(c, form);
  else FORMS[form](c);
  if (c.stage >= 1) lushen(c, form);
  const { V, rand } = c;

  // Storm scars: broken stubs.
  if (c.stage >= 1) for (let i = 0; i < Math.min(4, p.scars); i++) {
    const a = 2 + i * 1.7;
    const f = 0.45 + i * 0.1;
    const at = c.trunkAt(f);
    at.y = (c.trunkTop || V) * f;
    const d = new V3(Math.cos(a), 0.3, Math.sin(a)).normalize();
    c.limb(at, at.clone().addScaledVector(d, c.trunkRadius * 2.5), c.trunkRadius * 0.3, c.trunkRadius * 0.25, '#6a4a34');
  }
  // Pest specks.
  if (p.pests > 45 && c.spots.length) {
    for (let i = 0; i < 18; i++) c.accent(c.onSpot(c.spots[i % c.spots.length]!, 0.6), 0.025 + V * 0.004, '#3a2a1c');
  }
  // Trunk hollow for the owl.
  if (c.stage >= 3 && c.trunkPts.length > 2) {
    const f = 0.42;
    const out = new V3(0.35, 0, 1).normalize();
    const base = c.trunkAt(f);
    const r = c.trunkRadius * (1 - f * 0.4);
    c.hollow = { pos: new V3(base.x + out.x * r * 0.8, (c.trunkTop || V) * f, base.z + out.z * r * 0.8), out };
    const ring = new THREE.TorusGeometry(r * 0.32, r * 0.1, 5, 10);
    ring.scale(1, 1.35, 1);
    ring.lookAt(out);
    ring.translate(c.hollow.pos.x, c.hollow.pos.y, c.hollow.pos.z);
    c.bark.push(paint(ring, col('#3a2a20')));
  }

  const group = new THREE.Group();
  const barkMesh = new THREE.Mesh(merge(c.bark, true), barkMat());
  barkMesh.castShadow = true;
  barkMesh.receiveShadow = true;
  group.add(barkMesh);
  const canopy = new THREE.Mesh(merge(c.leaves, true), leafMat());
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  // Perches: tops of foliage spots on the camera side first.
  const top = c.trunkAt(1);
  const perches: Perch[] = c.spots
    .filter((s) => s.c.y > V * 0.25 || c.stage === 0)
    .sort((a, b) => b.c.z + b.c.x * 0.3 + b.c.y * 0.8 - (a.c.z + a.c.x * 0.3 + a.c.y * 0.8))
    .slice(0, 24)
    .map((s) => {
      const out = new V3(s.c.x - top.x, 0, s.c.z - top.z);
      if (out.lengthSq() < 1e-4) out.set(0.3, 0, 1);
      out.normalize();
      return { pos: s.c.clone().addScaledVector(out, s.r * 0.55).add(new V3(0, s.r * 0.7, 0)), out };
    });
  if (!c.nest && c.stage >= 2) c.nest = { pos: top.clone().setY(c.crownY), out: new V3(0.3, 0, 1).normalize() };

  // Reinforcement: stakes and ropes.
  if (p.reinforce?.stakes || p.reinforce?.ropes) {
    const sticks: THREE.BufferGeometry[] = [];
    const ropes: THREE.BufferGeometry[] = [];
    const tr = c.trunkRadius;
    const reach = tr * 3 + 0.25;
    const h = Math.min((c.trunkTop || V) * 0.8, 1.6 + tr);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const foot = new V3(Math.cos(a) * reach, 0, Math.sin(a) * reach);
      const head = new V3(Math.cos(a) * (tr + 0.03), h, Math.sin(a) * (tr + 0.03));
      if (p.reinforce.stakes) sticks.push(limb(foot, head, 0.03 + tr * 0.08, 0.025, 5));
      if (p.reinforce.ropes) {
        const far = new V3(Math.cos(a + 0.5) * reach * 1.8, 0.02, Math.sin(a + 0.5) * reach * 1.8);
        ropes.push(limb(far, new V3(Math.cos(a + 0.5) * tr, h * 0.85, Math.sin(a + 0.5) * tr), 0.012, 0.012, 3));
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
      const band = new THREE.TorusGeometry(tr * 1.02, 0.018, 4, 12);
      band.rotateX(Math.PI / 2);
      band.translate(0, h * 0.85, 0);
      ropes.push(band);
      group.add(new THREE.Mesh(merge(ropes), mat('#e8dcc0')));
    }
  }
  void rand;

  let canopyRadius = 0.2;
  let height = V + c.extraHeight;
  for (const s of c.spots) {
    canopyRadius = Math.max(canopyRadius, Math.hypot(s.c.x, s.c.z) + s.r);
    height = Math.max(height, s.c.y + s.r * 0.82);
  }
  void height;
  // Metre scale: the shape is modelled at a comfortable size, then scaled uniformly so the highest rendered point is
  // exactly the game height G (1 unit = 1 m, see scale.ts).
  group.updateMatrixWorld(true);
  const localTop = Math.max(0.01, new THREE.Box3().setFromObject(group).max.y);
  const k = modelScaleFor(localTop, p.heightCm);
  const outer = new THREE.Group();
  group.scale.setScalar(k);
  outer.add(group);
  const trunkSpots = c.trunkSpots();
  const scaled = new Set<THREE.Vector3>();
  const sc = (v: THREE.Vector3) => {
    if (!scaled.has(v)) {
      v.multiplyScalar(k);
      scaled.add(v);
    }
  };
  for (const pr of [...perches, ...trunkSpots, c.nest, c.hollow]) if (pr) sc(pr.pos);
  return {
    group: outer,
    canopy,
    height: localTop * k,
    localHeight: localTop,
    metricScale: k,
    canopyRadius: canopyRadius * k,
    crownY: c.crownY * k,
    trunkRadius: c.trunkRadius * k,
    perches,
    trunkSpots,
    nest: c.nest,
    hollow: c.hollow,
    dispose: () => disposeTree(outer),
  };
}
