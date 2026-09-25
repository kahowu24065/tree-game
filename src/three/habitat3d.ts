import * as THREE from 'three';
import { habitatDef, ISLAND_RADII, type Feature } from '../data/habitat';
import { speciesDef, type SpeciesId, type TreeForm } from '../data/species';
import { hashString, mulberry32 } from '../util';
import { ellipsoid, jitterGeometry, limb, merge, paint } from './util3d';
import { FENCE_INSET_UNITS, shoreRadius } from '../scale';
import { clampInsideShore } from './island3d';
import { anchorGeometry, asProp, propDensity } from './propScale';

/**
 * Themed land around the garden island. Built band by band (one ring per growth stage) with
 * seeds that depend only on species + band, so scenery placed at 青年樹 is still in the same
 * place at 巨樹 and new scenery only appears in the new outer ring.
 *
 * Draw calls: one merged vertex-coloured mesh for all solids, one for running water, one for
 * still water, two instanced meshes (grass, flowers) and a handful of fog sprites.
 */

export interface Habitat {
  group: THREE.Group;
  radius: number;
  /** Ground height of the habitat land (island units). */
  groundAt(x: number, z: number): number;
  /** Is (x, z) (island units) on water (pond, lake, stream, inlet, incl. its bank when pad > 0)? */
  isWater(x: number, z: number, pad?: number): boolean;
  /** Is (x, z) inside a big solid (hill, mountain, cliff) — no fence posts, no walking. */
  isBlocked(x: number, z: number): boolean;
  /** Land meshes (for ground raycasts). */
  ground: THREE.Mesh[];
  stage: number;
  update(t: number, wind: number): void;
  dispose(): void;
}

const CORE_R: number = ISLAND_RADII[0];
/** Camera looks from roughly this island angle (atan2(z, x)); scenery behind it can be tall. */
const CAM_ANGLE = 1.25;
const BACK_ANGLE = CAM_ANGLE - Math.PI;
const col = (h: string) => new THREE.Color(h);

function angDiff(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function waterTex(still: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = still ? '#5aaed2' : '#5bb6dc';
  g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < (still ? 22 : 30); i++) {
    g.fillStyle = `rgba(255,255,255,${0.1 + (i % 3) * 0.08})`;
    const x = (i * 23) % 64;
    const y = (i * 41) % 64;
    if (still) g.fillRect(x, y, 3 + (i % 3), 1.5);
    else g.fillRect(x, y, 10 + (i % 4) * 4, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function softTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface Spot {
  x: number;
  z: number;
  r: number;
}

class Builder {
  solids: THREE.BufferGeometry[] = [];
  /** v10: small props (rocks, shrubs, ferns, reeds, small trees) — scaled on the GPU about their anchors. */
  props: THREE.BufferGeometry[] = [];
  private anchor: { x: number; y: number; z: number } | null = null;
  /** Prop scale this habitat is laid out for (island units per design unit) and the matching density multiplier. */
  pk = 1;
  dens(cap: number): number {
    return propDensity(this.pk, cap);
  }
  /** Build a prop around a ground anchor: its geometry goes to the prop mesh and scales about (x, ground, z). */
  prop(x: number, z: number, fn: () => void): void {
    const prev = this.anchor;
    this.anchor = { x, y: this.groundY(x, z), z };
    try {
      fn();
    } finally {
      this.anchor = prev;
    }
  }
  flowing: THREE.BufferGeometry[] = [];
  still: THREE.BufferGeometry[] = [];
  keep: Spot[] = [];
  waters: Spot[] = [];
  /** Stream / inlet centre lines with half-width (bank included) for water tests. */
  lines: { pts: THREE.Vector3[]; w: number }[] = [];
  /** Pools as ellipses (bank included). */
  pools: { x: number; z: number; rx: number; rz: number; rot: number }[] = [];
  /** Big solids that the fence and walkers must avoid. */
  blocks: Spot[] = [];
  tufts: { x: number; z: number; s: number; c: THREE.Color }[] = [];
  flowers: { x: number; z: number; s: number; c: THREE.Color }[] = [];
  fog: { x: number; y: number; z: number; s: number }[] = [];
  falls: { x: number; z: number; a: number; top: number; h: number }[] = [];
  rand: () => number = Math.random;
  R: number = CORE_R;
  rIn: number = CORE_R;
  form: TreeForm;
  constructor(form: TreeForm) {
    this.form = form;
  }

  groundY(x: number, z: number): number {
    const r = Math.hypot(x, z);
    if (r < CORE_R + 0.3) return -0.04;
    const n = Math.sin(x * 0.55 + 1.3) * Math.cos(z * 0.47 - 0.4) * 0.1 + Math.sin(x * 1.3 - z * 0.9) * 0.04;
    return -0.04 + n * Math.min(1, (r - CORE_R - 0.3) / 1.5);
  }

  free(x: number, z: number, r: number): boolean {
    const d = Math.hypot(x, z);
    if (d - r < CORE_R + 0.35) return false;
    for (const k of this.keep) if (Math.hypot(k.x - x, k.z - z) < k.r + r) return false;
    return true;
  }

  /**
   * Random free spot in the current band. The portrait camera sees a narrow wedge through the island, so
   * sectors are chosen to land in view: 'back' (behind the tree, toward the horizon), 'side' (the back
   * flanks), 'front' (near the camera), 'view' (mostly in the default view) or 'any'. Landmarks that do not
   * fit in the new band may reach inward over older land (still outside the garden).
   */
  spot(r: number, sector: 'back' | 'side' | 'front' | 'any' | 'view' = 'view', edge = false, rMin?: number, rMax?: number, tries = 40): Spot | null {
    const pick = (lo: number, hi: number): Spot | null => {
      for (let i = 0; i < tries; i++) {
        let a: number;
        let sec = sector === 'view' ? (this.rand() < 0.55 ? 'back' : this.rand() < 0.55 ? 'front' : this.rand() < 0.5 ? 'side' : 'any') : sector;
        // Wide crowns (榕樹、樟樹) hide the land behind them, so their landmarks come round to the front.
        if (this.frontBias && sec === 'back' && !edge) sec = this.rand() < 0.6 ? 'front' : 'side';
        if (sec === 'back') a = BACK_ANGLE + (this.rand() - 0.5) * 0.9;
        else if (sec === 'front') a = CAM_ANGLE + (this.rand() - 0.5) * 1.0;
        else if (sec === 'side') a = BACK_ANGLE + (this.rand() < 0.5 ? 1 : -1) * (0.42 + this.rand() * 0.55);
        else a = this.rand() * Math.PI * 2;
        if (hi <= lo) continue;
        const shore = shoreRadius(this.R, a);
        const d = edge ? shore - r * 0.35 : lo + this.rand() * (hi - lo);
        // Keep ordinary scenery clear of the fence line just inside the shoreline.
        if (!edge && d + r * 0.75 > shore - FENCE_INSET_UNITS - 0.3) continue;
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (this.free(x, z, r * 0.85)) return { x, z, r };
      }
      return null;
    };
    const hi = rMax ?? this.R - (edge ? 0 : r * 0.7) - 0.2;
    const inBand = pick(rMin ?? this.rIn + r * 0.6, hi);
    if (inBand || edge || rMin !== undefined || !this.reachIn) return inBand;
    return pick(CORE_R + 0.45 + r * 0.8, hi);
  }

  /** Landmarks may use older land when the new band is too narrow. */
  reachIn = false;
  get frontBias(): boolean {
    return this.form === 'banyan' || this.form === 'round';
  }

  claim(s: Spot, pad = 0): void {
    this.keep.push({ x: s.x, z: s.z, r: s.r + pad });
  }

  push(g: THREE.BufferGeometry, color: THREE.Color | ((y: number, i: number) => THREE.Color)): void {
    if (this.anchor) this.props.push(anchorGeometry(paint(g, color), this.anchor.x, this.anchor.y, this.anchor.z));
    else this.solids.push(paint(g, color));
  }

  rock(x: number, z: number, s: number, tint = '#9b958c', snow = false): void {
    if (!this.anchor) return this.prop(x, z, () => this.rock(x, z, s, tint, snow));
    const g = new THREE.DodecahedronGeometry(s, 0);
    jitterGeometry(g, s * 0.35, x * 3.1 + z, false);
    g.scale(1, 0.72, 1);
    g.rotateY(x + z);
    const y = this.groundY(x, z);
    g.translate(x, y + s * 0.22, z);
    const base = col(tint).offsetHSL(0, 0, (this.rand() - 0.5) * 0.08);
    this.push(g, (py) => (snow && py > y + s * 0.5 ? col('#f4f7fa') : base));
  }

  bush(x: number, z: number, s: number, hex: string): void {
    if (!this.anchor) return this.prop(x, z, () => this.bush(x, z, s, hex));
    // Small (animal-scale) bushes don't need the extra facets.
    const g = new THREE.IcosahedronGeometry(s, this.pk < 0.7 ? 0 : 1);
    jitterGeometry(g, s * 0.3, x + z * 2, true);
    g.scale(1, 0.75, 1);
    const y = this.groundY(x, z);
    g.translate(x, y + s * 0.55, z);
    const c = col(hex).offsetHSL(0, 0, (this.rand() - 0.5) * 0.06);
    this.push(g, (py) => c.clone().offsetHSL(0, 0, (py - y) * 0.12 - 0.04));
  }

  mountain(x: number, z: number, r: number, h: number, snow: boolean, base = '#6f9f5c', rockC = '#8b8378'): void {
    this.blocks.push({ x, z, r: r * 1.1 });
    const g = new THREE.ConeGeometry(r, h, 8, 5);
    jitterGeometry(g, r * 0.22, x * 1.7 + z, false);
    const y0 = this.groundY(x, z) - 0.3;
    g.translate(x, y0 + h / 2, z);
    const snowLine = y0 + h * (0.62 + this.rand() * 0.1);
    const green = col(base);
    const stone = col(rockC);
    const white = col('#f3f6f9');
    this.push(g, (py) => (snow && py > snowLine ? white : py > y0 + h * 0.3 ? stone.clone().offsetHSL(0, 0, (py - y0) / h * 0.08) : green));
  }

  hill(x: number, z: number, r: number, h: number, hex: string): void {
    this.blocks.push({ x, z, r: r * 0.95 });
    const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(r, h, r * (0.8 + this.rand() * 0.3));
    jitterGeometry(g, r * 0.08, x + z * 3, false);
    const y0 = this.groundY(x, z) - 0.15;
    g.translate(x, y0, z);
    const c = col(hex);
    this.push(g, (py) => c.clone().offsetHSL(0, 0, ((py - y0) / h) * 0.07 - 0.03));
  }

  /** Flat water surface (ellipse) with a sandy bank and stones. */
  pool(x: number, z: number, rx: number, rz: number, rot: number, stones = true, bank = '#b9a47a'): void {
    const y = this.groundY(x, z);
    const w = new THREE.CircleGeometry(1, 22);
    w.rotateX(-Math.PI / 2);
    w.scale(rx, 1, rz);
    w.rotateY(rot);
    w.translate(x, y + 0.035, z);
    this.still.push(w);
    const b = new THREE.RingGeometry(0.92, 1.18, 22, 1);
    b.rotateX(-Math.PI / 2);
    b.scale(rx, 1, rz);
    b.rotateY(rot);
    b.translate(x, y + 0.025, z);
    this.push(b, col(bank));
    if (stones) {
      const n = Math.round(6 + (rx + rz) * 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + this.rand() * 0.3;
        const px = Math.cos(a) * rx * 1.12;
        const pz = Math.sin(a) * rz * 1.12;
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        if (this.rand() < 0.55) this.rock(x + px * c + pz * s, z - px * s + pz * c, 0.12 + this.rand() * 0.14, '#a39d92');
        // v10: bank stones are drawn smaller on big islands, so add a few more between them.
        if (this.pk < 0.7 && this.rand() < 0.6) this.rock(x + (px * 1.06) * c + (pz * 1.06) * s + (this.rand() - 0.5) * 0.3, z - px * 1.06 * s + pz * 1.06 * c + (this.rand() - 0.5) * 0.3, 0.1 + this.rand() * 0.12, '#a39d92');
      }
    }
    this.waters.push({ x, z, r: Math.max(rx, rz) });
    this.pools.push({ x, z, rx: rx * 1.18, rz: rz * 1.18, rot });
  }

  /**
   * v10: pool stretched along the ring (tangent) at a spot: `along` × r long, `across` × r wide, shrunk until it clears
   * other scenery and the fence line.
   */
  longPool(s: Spot, along: number, across: number, stones = true, bank = '#b9a47a'): void {
    const a = Math.atan2(s.z, s.x);
    const tx = -Math.sin(a);
    const tz = Math.cos(a);
    let rx = s.r * along;
    const rz = s.r * across;
    for (; rx > s.r; rx *= 0.85) {
      let ok = true;
      for (const k of [-1, -0.6, 0.6, 1]) {
        const px = s.x + tx * rx * k * 0.9;
        const pz = s.z + tz * rx * k * 0.9;
        const shore = shoreRadius(this.R, Math.atan2(pz, px));
        if (Math.hypot(px, pz) + rz * 0.9 > shore - FENCE_INSET_UNITS - 0.35 || !this.free(px, pz, rz * 0.85)) ok = false;
      }
      if (ok) break;
    }
    rx = Math.max(rx, s.r);
    this.claim(s, 0.4);
    for (const k of [-1, -0.5, 0.5, 1]) this.keep.push({ x: s.x + tx * rx * k * 0.8, z: s.z + tz * rx * k * 0.8, r: rz + 0.3 });
    // pool(): scale(rx, 1, rz) then rotateY(rot); rot = -a - π/2 lays the long axis along the tangent.
    this.pool(s.x, s.z, rx, rz, -a - Math.PI / 2, stones, bank);
  }

  /** Point-in-water test (island units); `pad` widens every water body. */
  isWater(x: number, z: number, pad = 0): boolean {
    for (const p of this.pools) {
      const dx = x - p.x;
      const dz = z - p.z;
      // pool(): w.scale(rx, 1, rz) then rotateY(rot) — undo the rotation.
      const c = Math.cos(p.rot);
      const s = Math.sin(p.rot);
      const lx = dx * c - dz * s;
      const lz = dx * s + dz * c;
      if ((lx / (p.rx + pad)) ** 2 + (lz / (p.rz + pad)) ** 2 < 1) return true;
    }
    for (const l of this.lines) {
      for (let i = 0; i < l.pts.length - 1; i++) {
        const a = l.pts[i]!;
        const b = l.pts[i + 1]!;
        const abx = b.x - a.x;
        const abz = b.z - a.z;
        const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / Math.max(1e-6, abx * abx + abz * abz)));
        const w = (a.y + (b.y - a.y) * t) + pad;
        if ((a.x + abx * t - x) ** 2 + (a.z + abz * t - z) ** 2 < w * w) return true;
      }
    }
    return false;
  }

  /** Water ribbon along points (flowing). */
  ribbon(pts: THREE.Vector3[], width: number, flowing = true, bank = '#b9a47a', flare = 0): void {
    const curve = new THREE.CatmullRomCurve3(pts);
    const n = Math.max(12, Math.round(curve.getLength() * 3));
    const line: THREE.Vector3[] = [];
    this.lines.push({ pts: line, w: width });
    const verts: number[] = [];
    const uvs: number[] = [];
    const bankV: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const w = width * (0.85 + 0.2 * Math.sin(t * 11 + p.x)) * (1 + flare * t * t);
      line.push(new THREE.Vector3(p.x, w * 1.35, p.z));
      const y = this.groundY(p.x, p.z) + 0.04;
      verts.push(p.x + side.x * w, y, p.z + side.z * w, p.x - side.x * w, y, p.z - side.z * w);
      bankV.push(p.x + side.x * w * 1.35, y - 0.012, p.z + side.z * w * 1.35, p.x - side.x * w * 1.35, y - 0.012, p.z - side.z * w * 1.35);
      uvs.push(0, t * n * 0.25, 1, t * n * 0.25);
      if (i < n) {
        const k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
      if (i % 3 === 0) this.keep.push({ x: p.x, z: p.z, r: w * 1.5 });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    (flowing ? this.flowing : this.still).push(g);
    const b = new THREE.BufferGeometry();
    b.setAttribute('position', new THREE.Float32BufferAttribute(bankV, 3));
    b.setIndex(idx.slice());
    b.computeVertexNormals();
    this.push(b, col(bank));
    for (let i = 0; i <= 6; i++) {
      const p = curve.getPoint(i / 6);
      this.waters.push({ x: p.x, z: p.z, r: width });
    }
  }

  reeds(x: number, z: number, n: number): void {
    if (!this.anchor) return this.prop(x, z, () => this.reeds(x, z, n));
    for (let i = 0; i < n; i++) {
      const px = x + (this.rand() - 0.5) * 0.9;
      const pz = z + (this.rand() - 0.5) * 0.9;
      const h = 0.45 + this.rand() * 0.45;
      const g = new THREE.ConeGeometry(0.025, h, 3);
      g.rotateZ((this.rand() - 0.5) * 0.3);
      g.translate(px, this.groundY(px, pz) + h / 2, pz);
      this.push(g, col(this.rand() < 0.4 ? '#b6a66a' : '#7fa252'));
      if (this.rand() < 0.4) {
        const head = ellipsoid(0.03, 0.08, 0.03, 0);
        head.translate(px, this.groundY(px, pz) + h, pz);
        this.push(head, col('#7a5a3a'));
      }
    }
  }

  fern(x: number, z: number, s: number, hex = '#4f8f3e'): void {
    if (!this.anchor) return this.prop(x, z, () => this.fern(x, z, s, hex));
    const y = this.groundY(x, z);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const g = ellipsoid(s * 0.5, s * 0.03, s * 0.12, 0);
      g.translate(s * 0.45, 0, 0);
      g.rotateZ(0.55 + this.rand() * 0.25);
      g.rotateY((i / n) * Math.PI * 2 + this.rand() * 0.4);
      g.translate(x, y + 0.02, z);
      this.push(g, col(hex).offsetHSL(0, 0, (this.rand() - 0.5) * 0.08));
    }
  }

  treeFern(x: number, z: number, h: number): void {
    if (!this.anchor) return this.prop(x, z, () => this.treeFern(x, z, h));
    const y = this.groundY(x, z);
    this.push(limb(new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.05, y + h, z), 0.09, 0.07, 5), col('#5a4232'));
    for (let i = 0; i < 9; i++) {
      const g = ellipsoid(h * 0.42, 0.03, h * 0.09, 0);
      g.translate(h * 0.38, 0, 0);
      g.rotateZ(-0.35 - this.rand() * 0.3);
      g.rotateY((i / 9) * Math.PI * 2);
      g.translate(x + 0.05, y + h, z);
      this.push(g, col('#4c8a3a').offsetHSL(0, 0, (this.rand() - 0.5) * 0.08));
    }
  }

  /** Small tree of the same species' silhouette for background groves. */
  miniTree(x: number, z: number, h: number): void {
    if (!this.anchor) return this.prop(x, z, () => this.miniTree(x, z, h));
    const y = this.groundY(x, z);
    const b = new THREE.Vector3(x, y, z);
    const leaf = (hex: string) => col(hex).offsetHSL((this.rand() - 0.5) * 0.02, 0, (this.rand() - 0.5) * 0.07);
    const blob = (cx: number, cy: number, cz: number, r: number, c: THREE.Color, sq = 0.85) => {
      const g = new THREE.IcosahedronGeometry(r, this.pk < 0.7 ? 0 : 1);
      jitterGeometry(g, r * 0.25, cx + cz, true);
      g.scale(1, sq, 1);
      g.translate(cx, cy, cz);
      this.push(g, (py) => c.clone().offsetHSL(0, 0, (py - cy) / r * 0.05));
    };
    const cone = (cy: number, r: number, hh: number, c: THREE.Color) => {
      const g = new THREE.ConeGeometry(r, hh, 7, 1);
      g.translate(x, cy + hh / 2, z);
      this.push(g, (py) => c.clone().offsetHSL(0, 0, (py - cy) / hh * 0.08 - 0.03));
    };
    switch (this.form) {
      case 'round':
      case 'banyan': {
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.45, z), h * 0.06, h * 0.04, 5), col('#7a6655'));
        const c = leaf(this.form === 'banyan' ? '#3c7534' : '#4c8f3c');
        blob(x, y + h * 0.62, z, h * 0.33, c);
        blob(x + h * 0.22, y + h * 0.5, z + h * 0.1, h * 0.24, c);
        blob(x - h * 0.2, y + h * 0.52, z - h * 0.08, h * 0.24, c);
        if (this.form === 'banyan') for (let i = 0; i < 3; i++) this.push(limb(new THREE.Vector3(x + (i - 1) * h * 0.2, y + h * 0.45, z), new THREE.Vector3(x + (i - 1) * h * 0.22, y, z + 0.05), 0.02, 0.02, 3), col('#a8977a'));
        break;
      }
      case 'tiered': {
        this.push(limb(b, new THREE.Vector3(x, y + h, z), h * 0.05, h * 0.02, 5), col('#8f8b80'));
        for (let t = 0; t < 3; t++) {
          const g = ellipsoid(h * (0.3 - t * 0.07), h * 0.05, h * (0.3 - t * 0.07), 1);
          g.translate(x, y + h * (0.45 + t * 0.2), z);
          this.push(g, leaf('#6a9c44'));
          const f = new THREE.IcosahedronGeometry(h * 0.04, 0);
          f.translate(x + h * 0.15, y + h * (0.5 + t * 0.2), z + h * 0.08);
          this.push(f, col('#d8352a'));
        }
        break;
      }
      case 'narrowCone':
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.3, z), h * 0.05, h * 0.03, 5), col('#8a4b2e'));
        cone(y + h * 0.15, h * 0.2, h * 0.88, leaf('#7fb552'));
        break;
      case 'fan':
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.55, z), h * 0.05, h * 0.03, 5), col('#8a8274'));
        blob(x, y + h * 0.66, z, h * 0.28, leaf(this.rand() < 0.5 ? '#e8b82a' : '#8ab84a'), 1.1);
        break;
      case 'drooping':
      case 'cone': {
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.2, z), h * 0.05, h * 0.03, 5), col('#5a4a3e'));
        const c = leaf(this.form === 'drooping' ? '#5d8f7c' : '#2e5a3c');
        for (let t = 0; t < 3; t++) cone(y + h * (0.12 + t * 0.24), h * (0.3 - t * 0.07), h * 0.42, c);
        break;
      }
      case 'column':
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.5, z), h * 0.06, h * 0.03, 6), col('#9a4a2c'));
        cone(y + h * 0.35, h * 0.15, h * 0.68, leaf('#2f5e3a'));
        break;
      case 'eucalypt':
        this.push(limb(b, new THREE.Vector3(x, y + h * 0.7, z), h * 0.05, h * 0.03, 6), col('#e2ddcf'));
        blob(x, y + h * 0.78, z, h * 0.22, leaf('#7d9468'), 1.1);
        blob(x + h * 0.14, y + h * 0.7, z, h * 0.16, leaf('#91a883'), 1.1);
        break;
    }
  }

  stoneWall(cx: number, cz: number, len: number, rot: number): void {
    const n = Math.round(len / 0.34);
    for (let i = 0; i < n; i++) {
      for (let row = 0; row < 2; row++) {
        const t = (i + (row ? 0.5 : 0)) * 0.34 - len / 2;
        const x = cx + Math.cos(rot) * t;
        const z = cz - Math.sin(rot) * t;
        const g = new THREE.BoxGeometry(0.34, 0.2, 0.28);
        jitterGeometry(g, 0.05, x * 3 + z + row, false);
        g.rotateY(rot);
        g.translate(x, this.groundY(cx, cz) + 0.1 + row * 0.2, z);
        this.push(g, col('#9c9486').offsetHSL(0, 0, (this.rand() - 0.5) * 0.1));
      }
    }
  }

  house(x: number, z: number, rot: number, s = 1): void {
    const y = this.groundY(x, z);
    const body = new THREE.BoxGeometry(1.4 * s, 0.8 * s, 1.0 * s);
    body.rotateY(rot);
    body.translate(x, y + 0.4 * s, z);
    this.push(body, col('#e6e0d2'));
    const roof = new THREE.CylinderGeometry(0.01, 0.78 * s, 0.55 * s, 4, 1);
    roof.rotateY(Math.PI / 4);
    roof.scale(1.45, 1, 1.05);
    roof.rotateY(rot);
    roof.translate(x, y + 0.8 * s + 0.27 * s, z);
    this.push(roof, col('#5b6670'));
    const door = new THREE.BoxGeometry(0.02, 0.45 * s, 0.26 * s);
    door.translate(0.71 * s, 0.22 * s, 0);
    door.rotateY(rot);
    door.translate(x, y, z);
    this.push(door, col('#8a3a2a'));
  }

  shrine(x: number, z: number): void {
    const y = this.groundY(x, z);
    const b = new THREE.BoxGeometry(0.45, 0.45, 0.35);
    b.translate(x, y + 0.22, z);
    this.push(b, col('#c43a2a'));
    const r = new THREE.CylinderGeometry(0.01, 0.38, 0.22, 4);
    r.rotateY(Math.PI / 4);
    r.translate(x, y + 0.56, z);
    this.push(r, col('#3f5a4a'));
    const inc = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 3);
    inc.translate(x + 0.3, y + 0.1, z);
    this.push(inc, col('#e8c070'));
  }

  lantern(x: number, z: number): void {
    const y = this.groundY(x, z);
    const parts: [THREE.BufferGeometry, number][] = [
      [new THREE.CylinderGeometry(0.18, 0.22, 0.12, 6), 0.06],
      [new THREE.CylinderGeometry(0.07, 0.08, 0.45, 6), 0.34],
      [new THREE.BoxGeometry(0.26, 0.2, 0.26), 0.66],
      [new THREE.CylinderGeometry(0.02, 0.26, 0.16, 4), 0.84],
    ];
    for (const [g, h] of parts) {
      g.translate(x, y + h, z);
      this.push(g, col('#a8a397'));
    }
    const light = new THREE.BoxGeometry(0.14, 0.1, 0.27);
    light.translate(x, y + 0.66, z);
    this.push(light, col('#f3d27a'));
  }

  pavilion(x: number, z: number, s: number): void {
    const y = this.groundY(x, z) + 0.3;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const p = new THREE.CylinderGeometry(0.06 * s, 0.07 * s, 1.1 * s, 6);
      p.translate(x + dx! * 0.6 * s, y + 0.55 * s, z + dz! * 0.6 * s);
      this.push(p, col('#b8322a'));
    }
    const roof = new THREE.ConeGeometry(1.15 * s, 0.55 * s, 4, 1);
    roof.rotateY(Math.PI / 4);
    roof.translate(x, y + 1.35 * s, z);
    this.push(roof, col('#3f5f58'));
    const eave = new THREE.CylinderGeometry(1.05 * s, 1.2 * s, 0.08 * s, 4);
    eave.rotateY(Math.PI / 4);
    eave.translate(x, y + 1.08 * s, z);
    this.push(eave, col('#2f4a44'));
    const top = new THREE.SphereGeometry(0.1 * s, 6, 4);
    top.translate(x, y + 1.66 * s, z);
    this.push(top, col('#d8b050'));
  }

  platform(x: number, z: number, w: number, d: number, h: number, rot: number): void {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateY(rot);
    g.translate(x, this.groundY(x, z) + h / 2 - 0.05, z);
    this.push(g, (py) => (py > h * 0.6 - 0.05 + this.groundY(x, z) ? col('#c9c1b0') : col('#a8a090')));
    // Paving lines.
    for (let i = -2; i <= 2; i++) {
      const l = new THREE.BoxGeometry(w * 0.98, 0.012, 0.03);
      l.translate(0, 0, (i * d) / 5.5);
      l.rotateY(rot);
      l.translate(x, this.groundY(x, z) + h - 0.04, z);
      this.push(l, col('#9a9282'));
    }
  }

  seaStack(x: number, z: number, h: number): void {
    const g = new THREE.CylinderGeometry(h * 0.18, h * 0.3, h, 6, 3);
    jitterGeometry(g, h * 0.08, x + z, false);
    g.translate(x, -0.8 + h / 2, z);
    this.push(g, (py) => (py > h - 1.2 ? col('#6f8a5a') : col('#5f5a55')));
  }

  cliffFall(x: number, z: number, h: number): void {
    const a = Math.atan2(z, x);
    this.blocks.push({ x, z, r: 1.2 });
    const g = new THREE.BoxGeometry(1.8, h, 1.3, 2, 3, 2);
    jitterGeometry(g, 0.25, x + z, false);
    g.rotateY(-a);
    const y = this.groundY(x, z);
    g.translate(x, y + h / 2, z);
    this.push(g, (py) => (py > y + h * 0.9 ? col('#6f9f5c') : col('#8d857a')));
    // Water down the camera-facing side of the cliff.
    const fx = x + Math.cos(a + 1.2) * 0.1;
    const fz = z + Math.sin(a + 1.2) * 0.1;
    this.falls.push({ x: fx - Math.cos(CAM_ANGLE) * -0.7, z: fz - Math.sin(CAM_ANGLE) * -0.7, a: CAM_ANGLE, top: y + h * 0.95, h: h });
    this.pool(fx + Math.cos(CAM_ANGLE) * 1.4, fz + Math.sin(CAM_ANGLE) * 1.4, 0.9, 0.7, 0, true);
  }
}

const SCATTER = new Set<Feature>(['rocks', 'boulders', 'shrubs', 'flowers', 'drygrass', 'ferns', 'treeferns', 'forest', 'reeds', 'scree', 'snow']);

/**
 * `propK` = prop scale (island units per design unit, see propScale.ts) the layout is made for: smaller props on a
 * relatively bigger island → more of them, so the ground cover stays about the same.
 */
export function buildHabitat(species: SpeciesId, stage: number, quality: 'low' | 'high' = 'low', propK = 1): Habitat {
  const def = habitatDef(species);
  const s4 = Math.max(0, Math.min(4, Math.round(stage)));
  const R = ISLAND_RADII[s4];
  const group = new THREE.Group();
  group.name = 'habitat';
  const b = new Builder(speciesDef(species).form);
  b.pk = Math.max(0.05, Math.min(1, propK));
  const active = new Set<Feature>();
  const grass = col(def.grass);
  const seedBase = hashString(species);

  // Pass 1: landmark features, band by band (seeded per feature + band so they persist as the island grows).
  b.reachIn = true;
  for (let band = 1; band <= s4; band++) {
    b.rIn = ISLAND_RADII[band - 1];
    b.R = ISLAND_RADII[band];
    for (const f of def.adds[band]!) {
      b.rand = mulberry32(seedBase + hashString(f) * 7 + band * 131);
      active.add(f);
      if (!SCATTER.has(f)) buildFeature(b, f, band);
    }
  }
  b.reachIn = false;
  // Pass 2: scatter features, grass and flowers fill every band from the stage they were introduced.
  const sofar = new Set<Feature>();
  for (let band = 1; band <= s4; band++) {
    b.rIn = ISLAND_RADII[band - 1];
    b.R = ISLAND_RADII[band];
    const area = Math.PI * (b.R * b.R - b.rIn * b.rIn);
    for (const f of def.adds[band]!) sofar.add(f);
    for (const f of sofar) {
      if (!SCATTER.has(f)) continue;
      b.rand = mulberry32(seedBase + hashString(f) * 13 + band * 977);
      scatter(b, f, area);
    }
    b.rand = mulberry32(seedBase + band * 4099);
    const dry = sofar.has('drygrass');
    const tuftN = Math.round(area * (quality === 'high' ? 5 : 3.2) * b.dens(5));
    for (let i = 0; i < tuftN; i++) {
      const a = b.rand() * Math.PI * 2;
      const d = Math.sqrt(b.rIn * b.rIn + b.rand() * (b.R * b.R - b.rIn * b.rIn));
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (d > b.R - 0.25 || b.waters.some((w) => Math.hypot(w.x - x, w.z - z) < w.r + 0.25) || b.isWater(x, z, 0.1)) continue;
      const c = dry && b.rand() < 0.65 ? new THREE.Color().setHSL(0.12 + b.rand() * 0.03, 0.5, 0.55 + b.rand() * 0.1) : new THREE.Color().setHSL(0.24 + b.rand() * 0.06, 0.5, 0.34 + b.rand() * 0.14);
      b.tufts.push({ x, z, s: 0.7 + b.rand() * 1.0, c });
    }
  }
  b.R = R;

  // Outer land: polar disc with gentle undulation, coloured by theme.
  const groundMeshes: THREE.Mesh[] = [];
  if (s4 >= 1) {
    const rings = Math.ceil(R / 0.9);
    const segs = 72;
    const verts: number[] = [];
    const colors: number[] = [];
    const vy = (x: number, z: number, r: number) => (r > R - 0.35 ? b.groundY(x, z) - 0.12 : b.groundY(x, z));
    const dry = active.has('drygrass');
    const snow = active.has('snow');
    const scree = active.has('scree');
    const colourAt = (x: number, z: number, r: number) => {
      const c = grass.clone();
      const n = Math.sin(x * 0.9) * Math.cos(z * 0.8) + Math.sin(x * 2.3 + z * 1.7) * 0.4;
      c.offsetHSL(0, 0, n * 0.03);
      const a = Math.atan2(z, x);
      if (dry && n > -0.2) c.lerp(col('#c8b466'), 0.45);
      if (scree && angDiff(a, BACK_ANGLE) < 1.2 && r > CORE_R + 1.5 && n > 0.2) c.lerp(col('#9a948a'), 0.6);
      if (snow && angDiff(a, BACK_ANGLE) < 1.3 && r > R - 3.5 && n > -0.3) c.lerp(col('#eef3f6'), 0.8);
      return c;
    };
    const ringR = (i: number) => (i === 0 ? 0 : CORE_R - 0.5 + ((R - CORE_R + 0.5) * (i - 1)) / (rings - 1));
    for (let i = 0; i < rings; i++) {
      const r0 = ringR(i);
      const r1 = ringR(i + 1);
      for (let j = 0; j < segs; j++) {
        const a0 = (j / segs) * Math.PI * 2;
        const a1 = ((j + 1) / segs) * Math.PI * 2;
        const p = [
          [Math.cos(a0) * r0, Math.sin(a0) * r0, r0],
          [Math.cos(a1) * r0, Math.sin(a1) * r0, r0],
          [Math.cos(a1) * r1, Math.sin(a1) * r1, r1],
          [Math.cos(a0) * r1, Math.sin(a0) * r1, r1],
        ] as const;
        const tri = (A: number, B: number, C: number) => {
          const cx = (p[A][0] + p[B][0] + p[C][0]) / 3;
          const cz = (p[A][1] + p[B][1] + p[C][1]) / 3;
          const cc = colourAt(cx, cz, Math.hypot(cx, cz));
          for (const k of [A, B, C]) {
            // Irregular shoreline: blend from round (inner land) to shoreRadius(R, a) at the outer edge.
            const rr = p[k][2];
            const ang = Math.atan2(p[k][1], p[k][0]);
            const tt = THREE.MathUtils.clamp((rr - CORE_R) / (R - CORE_R), 0, 1);
            const f = rr > 0 ? 1 + (shoreRadius(R, ang) / R - 1) * tt : 1;
            verts.push(p[k][0] * f, vy(p[k][0] * f, p[k][1] * f, p[k][2]), p[k][1] * f);
            colors.push(cc.r, cc.g, cc.b);
          }
        };
        if (r0 === 0) tri(0, 3, 2);
        else {
          tri(0, 3, 2);
          tri(0, 2, 1);
        }
      }
    }
    const land = new THREE.BufferGeometry();
    land.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    land.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    land.computeVertexNormals();
    const landMesh = new THREE.Mesh(land, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, side: THREE.DoubleSide }));
    landMesh.receiveShadow = true;
    landMesh.name = 'habitat-land';
    group.add(landMesh);
    groundMeshes.push(landMesh);

    // Earth rim and rocky underside, scaled to the new radius.
    const rim = new THREE.CylinderGeometry(R, R * 0.9, 1.0, 72, 2, true);
    jitterGeometry(rim, 0.35, 5, false);
    // Top ring exactly on the shoreline (so the land edge, the rim and the fence agree); nothing pokes out below.
    const rp = rim.getAttribute('position') as THREE.BufferAttribute;
    const topIdx: number[] = [];
    for (let i = 0; i < rp.count; i++) if (rp.getY(i) > 0.3) {
      rp.setY(i, 0.5);
      topIdx.push(i);
    }
    clampInsideShore(rim, R, 0.985, 0.5);
    rim.translate(0, -0.62, 0);
    // Rim top follows the land's edge height, so there is no slit between land and rim.
    for (const i of topIdx) rp.setY(i, b.groundY(rp.getX(i), rp.getZ(i)) - 0.125);
    rim.computeVertexNormals();
    const under = new THREE.ConeGeometry(R * 0.92, Math.min(R * 1.3, 17), 20, 5);
    under.rotateX(Math.PI);
    jitterGeometry(under, 1.0, 9, false);
    clampInsideShore(under, R, 0.93);
    const uh = Math.min(R * 1.3, 17);
    under.translate(0, -1.1 - uh / 2, 0);
    paint(rim, col('#8a6446'));
    paint(under, (y) => new THREE.Color().lerpColors(col('#6d6a66'), col('#8f7155'), THREE.MathUtils.clamp((y + uh * 0.5) / (uh * 0.5), 0, 1)));
    const body = new THREE.Mesh(merge([rim, under], true), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
    group.add(body);

    // The garden's stream continues across the new land and falls off the far edge.
    const end = new THREE.Vector3(4.75, 0, 5.05);
    const a = Math.atan2(end.z, end.x);
    const pts = [end.clone(), new THREE.Vector3(Math.cos(a + 0.05) * (CORE_R + 1), 0, Math.sin(a + 0.05) * (CORE_R + 1))];
    const edgeR = shoreRadius(R, a);
    for (let d = CORE_R + 2.2; d < edgeR - 0.6; d += 1.8) pts.push(new THREE.Vector3(Math.cos(a + Math.sin(d) * 0.06) * d, 0, Math.sin(a + Math.sin(d) * 0.06) * d));
    pts.push(new THREE.Vector3(Math.cos(a) * (edgeR + 0.05), 0, Math.sin(a) * (edgeR + 0.05)));
    b.rand = mulberry32(seedBase + 5);
    b.ribbon(pts, 0.5, true);
    b.falls.push({ x: Math.cos(a) * (edgeR + 0.08), z: Math.sin(a) * (edgeR + 0.08), a, top: -0.02, h: 5.5 });
  }

  // Assemble meshes.
  const disposables: THREE.BufferGeometry[] = [];
  if (b.solids.length) {
    const g = merge(b.solids, true);
    disposables.push(g);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
    m.receiveShadow = true;
    m.castShadow = quality === 'high';
    group.add(m);
  }
  if (b.props.length) {
    const g = merge(b.props, true);
    disposables.push(g);
    const m = asProp(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 })), true);
    m.name = 'habitat-props';
    m.receiveShadow = true;
    m.castShadow = quality === 'high';
    group.add(m);
  }
  const flowTex = waterTex(false);
  const stillTex = waterTex(true);
  stillTex.repeat.set(0.35, 0.35);
  const flowMat = new THREE.MeshStandardMaterial({ map: flowTex, roughness: 0.25, metalness: 0.05, emissive: '#1d5f80', emissiveIntensity: 0.25 });
  const stillMat = new THREE.MeshStandardMaterial({ map: stillTex, roughness: 0.15, metalness: 0.1, emissive: '#1d5f80', emissiveIntensity: 0.2 });
  if (b.flowing.length) {
    const g = merge(b.flowing);
    disposables.push(g);
    group.add(new THREE.Mesh(g, flowMat));
  }
  if (b.still.length) {
    const g = merge(b.still.map((s) => {
      // World-space UVs so the shimmer pattern lines up across ponds.
      const pos = s.getAttribute('position');
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = pos.getX(i);
        uv[i * 2 + 1] = pos.getZ(i);
      }
      s.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      return s;
    }));
    // merge() drops uv; rebuild from positions.
    const pos = g.getAttribute('position');
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i);
      uv[i * 2 + 1] = pos.getZ(i);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    disposables.push(g);
    group.add(new THREE.Mesh(g, stillMat));
  }
  // merge() drops uv on the flowing ribbon too; give it along-stream UVs from positions.
  const flowMesh = group.children.find((c) => (c as THREE.Mesh).material === flowMat) as THREE.Mesh | undefined;
  if (flowMesh) {
    const pos = flowMesh.geometry.getAttribute('position');
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) + pos.getZ(i)) * 0.35;
      uv[i * 2 + 1] = Math.hypot(pos.getX(i), pos.getZ(i)) * 0.6;
    }
    flowMesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }

  // Waterfalls.
  const fallTex = waterTex(false);
  const fallMat = new THREE.MeshStandardMaterial({ map: fallTex, transparent: true, opacity: 0.82, roughness: 0.3, side: THREE.DoubleSide, emissive: '#2a7aa0', emissiveIntensity: 0.3, depthWrite: false });
  for (const f of b.falls) {
    const plane = new THREE.PlaneGeometry(f.h > 5 ? 0.8 : 0.6, f.h, 1, 3);
    disposables.push(plane);
    const m = new THREE.Mesh(plane, fallMat);
    m.position.set(f.x, f.top - f.h / 2, f.z);
    m.rotation.y = -f.a + Math.PI / 2;
    group.add(m);
  }

  // Grass tufts + flowers (instanced).
  const tuftGeo = new THREE.ConeGeometry(0.045, 0.16, 3);
  tuftGeo.translate(0, 0.08, 0);
  disposables.push(tuftGeo);
  const tufts = new THREE.InstancedMesh(tuftGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), Math.max(1, b.tufts.length));
  asProp(tufts, false);
  const flowerGeo = new THREE.IcosahedronGeometry(0.07, 0);
  flowerGeo.translate(0, 0.1 / 0.7, 0);
  disposables.push(flowerGeo);
  const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.7 }), Math.max(1, b.flowers.length));
  asProp(flowers, false);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  b.tufts.forEach((t, i) => {
    q.setFromEuler(e.set((Math.sin(i) - 0) * 0.2, i * 2.4, Math.cos(i * 1.3) * 0.2));
    m4.compose(new THREE.Vector3(t.x, b.groundY(t.x, t.z), t.z), q, new THREE.Vector3(t.s, t.s * (0.9 + (i % 5) * 0.12), t.s));
    tufts.setMatrixAt(i, m4);
    tufts.setColorAt(i, t.c);
  });
  tufts.count = b.tufts.length;
  b.flowers.forEach((f, i) => {
    m4.compose(new THREE.Vector3(f.x, b.groundY(f.x, f.z), f.z), q.identity(), new THREE.Vector3(f.s, f.s * 0.7, f.s));
    flowers.setMatrixAt(i, m4);
    flowers.setColorAt(i, f.c);
  });
  flowers.count = b.flowers.length;
  if (b.tufts.length) group.add(tufts);
  if (b.flowers.length) group.add(flowers);

  // Fog banks.
  const fogTex = softTex();
  const fogSprites: { sp: THREE.Sprite; x: number; z: number; y: number; ph: number }[] = [];
  for (const f of b.fog) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fogTex, color: '#f4f8fa', transparent: true, opacity: 0.55, depthWrite: false, fog: true }));
    sp.scale.set(f.s * 2.2, f.s, 1);
    sp.position.set(f.x, f.y, f.z);
    group.add(sp);
    fogSprites.push({ sp, x: f.x, z: f.z, y: f.y, ph: f.x * 0.7 + f.z });
  }

  return {
    group,
    radius: R,
    stage: s4,
    groundAt: (x: number, z: number) => b.groundY(x, z),
    isWater: (x: number, z: number, pad = 0) => b.isWater(x, z, pad),
    isBlocked: (x: number, z: number) => b.blocks.some((k) => Math.hypot(k.x - x, k.z - z) < k.r),
    ground: groundMeshes,
    update(t: number) {
      flowTex.offset.y = -t * 0.35;
      fallTex.offset.y = t * 0.9;
      stillTex.offset.set(Math.sin(t * 0.13) * 0.4, t * 0.02);
      stillMat.emissiveIntensity = 0.18 + Math.sin(t * 1.1) * 0.05;
      for (const f of fogSprites) {
        f.sp.position.set(f.x + Math.sin(t * 0.05 + f.ph) * 1.2, f.y + Math.sin(t * 0.3 + f.ph) * 0.1, f.z + Math.cos(t * 0.04 + f.ph) * 0.8);
        (f.sp.material as THREE.SpriteMaterial).opacity = 0.42 + Math.sin(t * 0.2 + f.ph) * 0.12;
      }
    },
    dispose() {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mt = mesh.material as THREE.Material | undefined;
        if (mt && mt !== fallMat) mt.dispose();
      });
      disposables.forEach((g) => g.dispose());
      flowTex.dispose();
      stillTex.dispose();
      fallTex.dispose();
      fogTex.dispose();
      fallMat.dispose();
    },
  };
}

/** One-off landmark features (placed once, at the stage they appear). */
function buildFeature(b: Builder, f: Feature, band: number): void {
  const R = b.R;
  const scale = R / 10;
  switch (f) {
    case 'hills': {
      const n = 3 + band;
      for (let i = 0; i < n; i++) {
        const s = b.spot(1.6 * scale + b.rand() * 1.2, i % 3 === 2 ? 'side' : 'back', true);
        if (!s) continue;
        b.claim(s, -0.4);
        const hue = habitatHillColour(b.form);
        b.hill(s.x, s.z, s.r, 0.8 + b.rand() * 1.2 * scale, hue);
      }
      break;
    }
    case 'mountains':
    case 'snowpeaks': {
      const n = f === 'snowpeaks' ? 5 : 4;
      for (let i = 0; i < n; i++) {
        const r = (1.8 + b.rand() * 1.4) * scale * (f === 'snowpeaks' ? 1.2 : 1);
        const s = b.spot(r, 'back', true, undefined, undefined, 60);
        if (!s) continue;
        b.claim(s, -r * 0.3);
        const h = r * (f === 'snowpeaks' ? 2.6 : 1.9) * (0.8 + b.rand() * 0.4);
        const base = b.form === 'eucalypt' ? '#6f8f6a' : '#6a9a58';
        const rock = b.form === 'eucalypt' ? '#7d8a96' : '#8b8378';
        b.mountain(s.x, s.z, r, h, f === 'snowpeaks' || (f === 'mountains' && (b.form === 'drooping' || b.form === 'cone')), base, rock);
      }
      break;
    }
    case 'pond': {
      // v10: bigger ponds, stretched along the ring so they fit narrow bands and read from the overview.
      const s = b.spot(2.1, 'view') ?? b.spot(1.7, 'side') ?? b.spot(1.3, 'any') ?? b.spot(1.0, 'view', false, undefined, undefined, 80) ?? b.spot(0.75, 'any', false, undefined, undefined, 80) ?? b.spot(0.6, 'any', false, undefined, undefined, 80);
      if (s) b.longPool(s, 2.4, 0.95, true);
      break;
    }
    case 'lotus': {
      for (const w of b.waters.filter((w) => w.r > 0.7).slice(0, 4)) {
        for (let i = 0; i < 7; i++) {
          const a = b.rand() * 6.28;
          const d = b.rand() * w.r * 0.7;
          const x = w.x + Math.cos(a) * d;
          const z = w.z + Math.sin(a) * d;
          const pad = new THREE.CircleGeometry(0.16 + b.rand() * 0.08, 7, 0.3, 5.8);
          pad.rotateX(-Math.PI / 2);
          pad.translate(x, b.groundY(w.x, w.z) + 0.05, z);
          b.push(pad, col('#4f9a3e'));
          if (b.rand() < 0.45) {
            const fl = new THREE.ConeGeometry(0.07, 0.1, 5, 1, true);
            fl.rotateX(Math.PI);
            fl.translate(x, b.groundY(w.x, w.z) + 0.12, z);
            b.push(fl, col('#f2a0bc'));
          }
        }
      }
      break;
    }
    case 'lake': {
      // v10: a real lake — as big as the land allows, long axis along the ring, in view.
      const s = b.spot(3.2 * scale, 'view', false, undefined, undefined, 80) ?? b.spot(2.6 * scale, 'side', false, undefined, undefined, 80) ?? b.spot(2.1 * scale, 'any', false, undefined, undefined, 80) ?? b.spot(1.6 * scale, 'any', false, undefined, undefined, 80) ?? b.spot(1.2, 'any', false, undefined, undefined, 80);
      if (s) b.longPool(s, 2.2, 1.1, true, '#b3a57e');
      break;
    }
    case 'river': {
      const a0 = BACK_ANGLE - 1.4;
      const pts: THREE.Vector3[] = [];
      const d = (b.rIn + R) / 2 + 0.2;
      for (let i = 0; i <= 8; i++) {
        const a = a0 + (i / 8) * 2.6;
        const dd = d + Math.sin(i * 1.3) * 0.5;
        pts.push(new THREE.Vector3(Math.cos(a) * dd, 0, Math.sin(a) * dd));
      }
      b.ribbon(pts, 1.15, true, '#cdb888');
      break;
    }
    case 'creek': {
      const a0 = BACK_ANGLE + (b.rand() - 0.5) * 1.2;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const d = R - 0.3 - (i / 6) * (R - CORE_R - 1.0);
        const a = a0 + i * 0.12 + Math.sin(i * 1.7) * 0.1;
        pts.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d));
      }
      b.ribbon(pts, 0.42, true, '#a8a08c');
      const last = pts[pts.length - 1]!;
      b.pool(last.x, last.z, 1.05, 0.8, Math.atan2(last.z, last.x), true);
      break;
    }
    case 'wetland': {
      for (let i = 0; i < 6; i++) {
        const s = b.spot(0.8 + b.rand() * 0.6, i < 3 ? 'side' : 'any') ?? b.spot(0.6, 'any');
        if (!s) continue;
        b.claim(s, 0.2);
        b.pool(s.x, s.z, s.r * 1.3, s.r * 0.8, b.rand() * 3, false, '#8f8a5a');
        b.reeds(s.x + s.r, s.z, 6);
      }
      break;
    }
    case 'waterfall': {
      const s = b.spot(1.2, 'back', true) ?? b.spot(1.2, 'side', true);
      if (s) {
        b.claim(s, 1.2);
        b.cliffFall(s.x * 0.94, s.z * 0.94, 2.2 + scale);
      }
      break;
    }
    case 'inlet': {
      // A still-water bay that opens onto the shoreline (and spills off the island edge), in view on the front-left.
      for (let tries = 0; tries < 12; tries++) {
        const a0 = CAM_ANGLE + 0.75 + b.rand() * 1.1 + (tries > 6 ? Math.PI : 0);
        const shore = shoreRadius(R, a0);
        const d0 = Math.max(CORE_R + 1.1, shore - 4.2);
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 5; i++) {
          const t = i / 5;
          const d = d0 + (shore + 0.06 - d0) * t;
          const a = a0 + Math.sin(t * 2.4) * 0.05;
          pts.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d));
        }
        const mid = pts[2]!;
        if (b.keep.some((k) => Math.hypot(k.x - mid.x, k.z - mid.z) < k.r + 0.8)) continue;
        b.ribbon(pts, 0.6, false, '#cdbb8a', 3.0);
        b.falls.push({ x: Math.cos(a0) * (shore + 0.1), z: Math.sin(a0) * (shore + 0.1), a: a0, top: -0.03, h: 4.5 });
        b.reeds(pts[1]!.x, pts[1]!.z, 5);
        break;
      }
      break;
    }
    case 'fog': {
      for (let i = 0; i < 7; i++) {
        const a = BACK_ANGLE + (b.rand() - 0.5) * 3.2;
        const d = b.rIn + b.rand() * (R - b.rIn + 2);
        b.fog.push({ x: Math.cos(a) * d, y: 0.4 + b.rand() * 1.4, z: Math.sin(a) * d, s: 3 + b.rand() * 3 });
      }
      break;
    }
    case 'coast': {
      // Sandy strip and sea stacks along the outer rim on the left side.
      for (let i = 0; i < 26; i++) {
        const a = CAM_ANGLE + 1.0 + (i / 26) * 2.2;
        const d = shoreRadius(R, a) - 0.85;
        const g = new THREE.CircleGeometry(0.72, 6);
        g.rotateX(-Math.PI / 2);
        g.translate(Math.cos(a) * d, b.groundY(Math.cos(a) * d, Math.sin(a) * d) + 0.015, Math.sin(a) * d);
        b.push(g, col('#d9c9a0'));
      }
      for (let i = 0; i < 5; i++) {
        const a = CAM_ANGLE + 1.3 + b.rand() * 2.0;
        const d = R + 0.6 + b.rand() * 1.8;
        b.seaStack(Math.cos(a) * d, Math.sin(a) * d, 2.2 + b.rand() * 2.8);
      }
      break;
    }
    case 'wall': {
      for (let i = 0; i < 3; i++) {
        const a = (b.frontBias ? CAM_ANGLE : BACK_ANGLE) + (i - 1) * 0.7 + (b.rand() - 0.5) * 0.2;
        const d = b.rIn + 0.7;
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (!b.free(x, z, 0.5)) continue;
        b.stoneWall(x, z, 2.2 + b.rand(), -a + Math.PI / 2);
        b.keep.push({ x, z, r: 1.3 });
      }
      break;
    }
    case 'village': {
      for (let i = 0; i < 2; i++) {
        const s = b.spot(1.1, i ? 'side' : 'back');
        if (!s) continue;
        b.claim(s, 0.3);
        b.house(s.x, s.z, -Math.atan2(s.z, s.x) + Math.PI, 0.95 + b.rand() * 0.2);
      }
      break;
    }
    case 'shrine': {
      const s = b.spot(0.5, 'side');
      if (s) {
        b.claim(s);
        b.shrine(s.x, s.z);
      }
      break;
    }
    case 'courtyard': {
      // Side flank: the portrait camera keeps it in view beside the crown.
      const s = b.spot(2.0, 'side', false, undefined, undefined, 60) ?? b.spot(2.0, 'view', false, undefined, undefined, 60);
      if (s) {
        b.claim(s, 0.2);
        const rot = -Math.atan2(s.z, s.x);
        b.platform(s.x, s.z, 3.0, 3.0, 0.35, rot);
        (b as unknown as { court?: Spot }).court = s;
      }
      break;
    }
    case 'steps': {
      // Temple approach: stone steps rising toward the tree from the front-left, facing the viewer.
      const a = CAM_ANGLE - 0.6;
      for (let i = 0; i < 6; i++) {
        const d = b.rIn + 0.3 + i * 0.32;
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        const h = 0.1 + (5 - i) * 0.07; // highest step nearest the tree
        const g = new THREE.BoxGeometry(0.34, h, 1.2);
        g.rotateY(-a);
        g.translate(x, b.groundY(x, z) + h / 2 - 0.03, z);
        b.push(g, col('#b8b0a0').offsetHSL(0, 0, (i % 2) * 0.03));
        b.keep.push({ x, z, r: 0.7 });
      }
      break;
    }
    case 'lanterns': {
      const court = (b as unknown as { court?: Spot }).court;
      for (let i = 0; i < 4; i++) {
        let x: number;
        let z: number;
        if (court && i < 2) {
          const a = Math.atan2(court.z, court.x) + (i ? 0.35 : -0.35);
          const d = Math.hypot(court.x, court.z) - 2.2;
          x = Math.cos(a) * d;
          z = Math.sin(a) * d;
        } else {
          const s = b.spot(0.3, 'any');
          if (!s) continue;
          x = s.x;
          z = s.z;
        }
        b.lantern(x, z);
        b.keep.push({ x, z, r: 0.35 });
      }
      break;
    }
    case 'pavilion': {
      const court = (b as unknown as { court?: Spot }).court;
      if (court) b.pavilion(court.x, court.z, 1.0);
      else {
        const s = b.spot(1.1, 'back');
        if (s) {
          b.claim(s);
          b.pavilion(s.x, s.z, 1.0);
        }
      }
      break;
    }
    default:
      break;
  }
}

function habitatHillColour(form: TreeForm): string {
  switch (form) {
    case 'tiered':
      return '#b9a866';
    case 'drooping':
      return '#8a9a78';
    case 'eucalypt':
      return '#7f9a66';
    default:
      return '#6ea452';
  }
}

/** Scatter features: density per band area (× more, smaller props when props are drawn at animal scale). */
function scatter(b: Builder, f: Feature, area: number): void {
  const pk = b.pk;
  const count = (per: number, cap = 5) => Math.round(area * per * b.dens(cap));
  switch (f) {
    case 'rocks':
      for (let i = 0, n = count(0.12); i < n; i++) {
        const d = 0.25 + b.rand() * 0.25;
        const s = b.spot(d * pk);
        if (s) b.rock(s.x, s.z, d, '#9b958c', false);
      }
      break;
    case 'boulders':
      for (let i = 0, n = count(0.03, 4) + 1; i < n; i++) {
        const d = 0.7 + b.rand() * 0.6;
        const s = b.spot(d * pk, b.rand() < 0.6 ? 'back' : 'side');
        if (!s) continue;
        b.claim(s);
        b.rock(s.x, s.z, d, '#8f8a82', b.form === 'drooping' || b.form === 'cone');
        b.rock(s.x + s.r * 0.9, s.z - s.r * 0.4, d * 0.5, '#9b958c');
      }
      break;
    case 'scree':
      for (let i = 0, n = count(0.25, 3); i < n; i++) {
        const d = 0.15 + b.rand() * 0.15;
        const s = b.spot(d * pk, 'back');
        if (s) b.rock(s.x, s.z, d, '#a39e96');
      }
      break;
    case 'snow':
      for (let i = 0; i < Math.round(area * 0.05); i++) {
        const s = b.spot(0.6 + b.rand() * 0.8, 'back');
        if (!s) continue;
        const g = new THREE.CircleGeometry(s.r, 7);
        g.rotateX(-Math.PI / 2);
        g.translate(s.x, b.groundY(s.x, s.z) + 0.02, s.z);
        b.push(g, col('#f4f7fa'));
      }
      break;
    case 'shrubs':
      for (let i = 0, n = count(0.1); i < n; i++) {
        const d = 0.3 + b.rand() * 0.35;
        const s = b.spot(d * pk);
        if (!s) continue;
        b.claim(s, -0.1 * pk);
        b.bush(s.x, s.z, d, b.form === 'tiered' ? '#7a8a4a' : '#4f8a3a');
      }
      break;
    case 'flowers': {
      const palette = b.form === 'fan' ? ['#f7b7c8', '#ffffff', '#f3d35b'] : b.form === 'banyan' ? ['#f06a8a', '#ffd35b', '#ffffff'] : ['#ffffff', '#f3d35b', '#c9b3f0', '#f7b7c8'];
      for (let i = 0, n = count(1.2, 5); i < n; i++) {
        const a = b.rand() * Math.PI * 2;
        const d = b.rIn + 0.3 + b.rand() * (b.R - b.rIn - 0.6);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (!b.free(x, z, 0.05) || b.waters.some((w) => Math.hypot(w.x - x, w.z - z) < w.r + 0.2) || b.isWater(x, z, 0.1)) continue;
        b.flowers.push({ x, z, s: 0.7 + b.rand() * 0.8, c: col(palette[Math.floor(b.rand() * palette.length)]!) });
      }
      break;
    }
    case 'drygrass':
      for (let i = 0, n = count(0.06); i < n; i++) {
        const d = 0.35 + b.rand() * 0.2;
        const s = b.spot(d * pk);
        if (s) b.bush(s.x, s.z, d * 0.8, '#c2a95a');
      }
      break;
    case 'ferns':
      for (let i = 0, n = count(0.18, 3); i < n; i++) {
        const d = 0.35 + b.rand() * 0.25;
        const s = b.spot(d * pk);
        if (s) b.fern(s.x, s.z, d * 1.6, b.form === 'column' ? '#3f7f36' : '#4f8f3e');
      }
      break;
    case 'treeferns':
      for (let i = 0, n = count(0.03, 3) + 1; i < n; i++) {
        const s = b.spot(0.6 * pk, b.rand() < 0.5 ? 'side' : 'back');
        if (!s) continue;
        b.claim(s);
        b.treeFern(s.x, s.z, 1.3 + b.rand() * 0.8);
      }
      break;
    case 'forest':
      for (let i = 0, n = count(0.06, 3) + 2; i < n; i++) {
        const d = 0.6 + b.rand() * 0.3;
        const s = b.spot(d * pk, b.rand() < 0.65 ? 'back' : 'side');
        if (!s) continue;
        b.claim(s, 0.05 * pk);
        const dist = Math.hypot(s.x, s.z);
        b.miniTree(s.x, s.z, (1.6 + b.rand() * 1.2) * (0.8 + (dist - 7) * 0.06 * pk) * (b.form === 'column' || b.form === 'narrowCone' || b.form === 'cone' ? 1.5 : 1));
      }
      break;
    case 'reeds': {
      const near = b.waters.slice(0, 14);
      for (let i = 0, n = Math.max(3, count(0.04, 3)); i < n; i++) {
        const w = near[i % Math.max(1, near.length)];
        if (w) {
          const a = b.rand() * 6.28;
          b.reeds(w.x + Math.cos(a) * (w.r + 0.2), w.z + Math.sin(a) * (w.r + 0.2), 7);
        } else {
          const s = b.spot(0.4 * pk);
          if (s) b.reeds(s.x, s.z, 7);
        }
      }
      break;
    }
    default:
      break;
  }
}
