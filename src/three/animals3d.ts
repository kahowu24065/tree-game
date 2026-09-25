import * as THREE from 'three';
import { ANIMALS, animalById, type AnimalDef, type Look } from '../data/animals';
import { allowedAt, groupSize, SIZE_LABEL, stageCap } from '../data/eco';
import { clamp } from '../util';
import { ISLAND_R } from './island3d';
import type { TreeBuild } from './tree3d';
import { ellipsoid } from './util3d';

/* =====================================================================
 * Procedural animal figures. Every figure faces +x, feet at y = 0, about one unit long.
 * Figures are small rigs: named parts (torso, neck, head, two-segment legs, tail chains,
 * two-segment wings) arranged in a parent hierarchy so gaits and idle poses can bend them.
 * Static geometry is merged per part; templates are built once per species and cloned
 * (shared geometry) for every member of a group.
 * ===================================================================== */

const MAT = {
  solid: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.78 }),
  double: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
  glow: new THREE.MeshStandardMaterial({ color: '#f6ff9a', emissive: '#e4ff5a', emissiveIntensity: 1.6 }),
};
type MatKind = keyof typeof MAT;
type XYZ = [number, number, number];

interface PartSpec {
  geos: THREE.BufferGeometry[];
  pivot: XYZ;
  mat: MatKind;
  parent?: string;
}

class Kit {
  private parts = new Map<string, PartSpec>();
  /** Declare a part with its pivot (in figure space) and optional parent part. */
  part(name: string, pivot: XYZ = [0, 0, 0], mat: MatKind = 'solid', parent?: string): this {
    if (!this.parts.has(name)) this.parts.set(name, { geos: [], pivot, mat, parent });
    return this;
  }
  /** Add geometry to a part, positioned in figure space (feet at y = 0, facing +x). */
  add(name: string, geo: THREE.BufferGeometry, colour: string, pos: XYZ = [0, 0, 0], rot: XYZ = [0, 0, 0]): this {
    if (!this.parts.has(name)) this.part(name);
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute('uv');
    g.deleteAttribute('normal');
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    g.translate(pos[0], pos[1], pos[2]);
    const c = new THREE.Color(colour);
    const n = g.getAttribute('position').count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    this.parts.get(name)!.geos.push(g);
    return this;
  }
  build(meta: Record<string, unknown> = {}): THREE.Group {
    const group = new THREE.Group();
    const objs = new Map<string, THREE.Object3D>();
    for (const [name, p] of this.parts) {
      let o: THREE.Object3D;
      if (p.geos.length) {
        const merged = mergeSimple(p.geos);
        merged.translate(-p.pivot[0], -p.pivot[1], -p.pivot[2]);
        merged.computeVertexNormals();
        o = new THREE.Mesh(merged, MAT[p.mat]);
      } else o = new THREE.Group();
      o.name = name;
      objs.set(name, o);
    }
    for (const [name, p] of this.parts) {
      const o = objs.get(name)!;
      const parent = p.parent ? objs.get(p.parent) : undefined;
      const pp = p.parent ? this.parts.get(p.parent)!.pivot : [0, 0, 0];
      o.position.set(p.pivot[0] - pp[0]!, p.pivot[1] - pp[1]!, p.pivot[2] - pp[2]!);
      (parent ?? group).add(o);
    }
    group.userData = { ...meta };
    return group;
  }
}

function mergeSimple(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let count = 0;
  for (const g of geos) count += g.getAttribute('position').count;
  const pos = new Float32Array(count * 3);
  const colr = new Float32Array(count * 3);
  let o = 0;
  for (const g of geos) {
    const p = g.getAttribute('position').array as Float32Array;
    const c = g.getAttribute('color').array as Float32Array;
    pos.set(p, o * 3);
    colr.set(c, o * 3);
    o += g.getAttribute('position').count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  return out;
}

const E = (rx: number, ry: number, rz: number, d = 1) => ellipsoid(rx, ry, rz, d);
const has = (look: Look, flag: string) => Boolean(look.f?.includes(flag));
const Cyl = (rt: number, rb: number, h: number, seg = 6) => new THREE.CylinderGeometry(rt, rb, h, seg);

/** A limb/segment from a to b (figure space) as a tapered cylinder. */
function seg(k: Kit, part: string, a: XYZ, b: XYZ, r0: number, r1: number, colour: string, sides = 6): void {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const g = Cyl(r1, r0, len, sides);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  g.applyQuaternion(q);
  k.add(part, g, colour, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
}

/** Flat shape (drawn in x/y with y = outward span) laid into the x/z plane on side s. */
function flat(shape: THREE.Shape, s: number, curve = 4): THREE.BufferGeometry {
  const g = new THREE.ShapeGeometry(shape, curve);
  g.rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2);
  return g;
}

/**
 * Two-segment leg: `name` pivots at the hip/shoulder, `name2` at the knee/elbow.
 * `foot`: 'hoof' | 'paw' | 'hand' | 'none'.
 */
function leg(k: Kit, name: string, parent: string, hip: XYZ, len: number, thick: number, colour: string, foot: 'hoof' | 'paw' | 'hand', footColour: string, thigh = 1.5): void {
  const [x, y, z] = hip;
  const knee = len * 0.5;
  k.part(name, hip, 'solid', parent);
  k.add(name, E(thick * thigh, knee * 0.62, thick * thigh * 0.8), colour, [x, y - knee * 0.3, z]);
  seg(k, name, [x, y, z], [x, y - knee, z], thick * 1.05, thick * 0.8, colour, 5);
  const name2 = `${name}2`;
  k.part(name2, [x, y - knee, z], 'solid', name);
  k.add(name2, E(thick * 0.85, thick * 0.85, thick * 0.85, 0), colour, [x, y - knee, z]);
  seg(k, name2, [x, y - knee, z], [x, 0.04, z], thick * 0.78, thick * 0.55, colour, 5);
  if (foot === 'hoof') k.add(name2, Cyl(thick * 0.6, thick * 0.75, 0.06, 6), footColour, [x, 0.03, z]);
  else if (foot === 'paw') k.add(name2, E(thick * 1.25, thick * 0.6, thick * 0.95), footColour, [x + thick * 0.5, thick * 0.55, z]);
  else k.add(name2, E(thick * 1.3, thick * 0.55, thick * 1.0), footColour, [x + thick * 0.6, thick * 0.5, z]);
}

/** A chain of tail segments tail, tail2, tail3 … each a child of the previous. */
function tailChain(k: Kit, parent: string, base: XYZ, n: number, segLen: number, r0: number, r1: number, angle: number, bend: number, colour: (i: number) => string, fluff = 0): void {
  let p: XYZ = [...base];
  let ang = angle;
  let prev = parent;
  for (let i = 0; i < n; i++) {
    const name = i === 0 ? 'tail' : `tail${i + 1}`;
    k.part(name, p, 'solid', prev);
    const q: XYZ = [p[0] - Math.cos(ang) * segLen, p[1] + Math.sin(ang) * segLen, p[2]];
    const ra = r0 + (r1 - r0) * (i / n);
    const rb = r0 + (r1 - r0) * ((i + 1) / n);
    if (fluff > 0) {
      const f = fluff * (0.75 + 0.5 * Math.sin((i / Math.max(1, n - 1)) * Math.PI));
      k.add(name, E(segLen * 0.7, f, f * 0.8), colour(i), [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, p[2]], [0, 0, -ang]);
    } else {
      seg(k, name, p, q, ra, rb, colour(i), 5);
      k.add(name, E(ra, ra, ra, 0), colour(i), p);
    }
    prev = name;
    p = q;
    ang += bend;
  }
}

/* ---------- Birds ---------- */

function birdFig(look: Look): THREE.Group {
  const [body, belly, headC, beak, wingC, accent = '#ffffff'] = look.c as [string, string, string, string, string, string?];
  const k = new Kit();
  const long = has(look, 'longLegs');
  const legs = long ? 0.6 : 0.14;
  const by = legs + 0.2;
  const tilt = long ? 0.05 : 0.22;
  const legC = long ? '#2a2a2a' : '#7a5b3a';
  k.part('body');
  // Teardrop body: rounded breast tapering into the rump.
  k.add('body', E(0.29, 0.22, 0.21), body, [0.04, by, 0], [0, 0, tilt]);
  k.add('body', new THREE.ConeGeometry(0.17, 0.4, 8), body, [-0.26, by + 0.05 + tilt * 0.25, 0], [0, 0, Math.PI / 2 + tilt]);
  k.add('body', E(0.23, 0.16, 0.17), belly, [0.09, by - 0.07, 0], [0, 0, tilt]);
  // Legs (separate so waders can step): thigh feathers, thin tarsus, three toes forward and one back.
  for (const [name, s] of [['legL', 1], ['legR', -1]] as const) {
    k.part(name, [0.02, legs + 0.02, s * 0.07], 'solid');
    k.add(name, E(0.05, 0.06, 0.045), belly, [0.02, legs + 0.05, s * 0.07]);
    seg(k, name, [0.02, legs + 0.03, s * 0.07], [0.03, 0.012, s * 0.07], 0.016, 0.012, legC, 4);
    for (const a of [-0.45, 0, 0.45]) k.add(name, new THREE.BoxGeometry(long ? 0.14 : 0.09, 0.012, 0.018), legC, [0.07, 0.008, s * 0.07 + Math.sin(a) * 0.03], [0, a, 0]);
    k.add(name, new THREE.BoxGeometry(0.06, 0.012, 0.016), legC, [-0.02, 0.008, s * 0.07]);
  }
  // Tail: a fan (or fork) of feathers.
  const tailLen = has(look, 'veryLongTail') ? 0.95 : has(look, 'longTail') ? 0.5 : 0.28;
  const tailUp = has(look, 'cocked') ? 0.6 : -0.3;
  k.part('tail', [-0.4, by + 0.07, 0]);
  const tail = new THREE.Shape();
  const tw = has(look, 'veryLongTail') ? 0.07 : 0.1;
  tail.moveTo(0, -0.05);
  if (has(look, 'forkTail')) {
    tail.lineTo(-tailLen, -tw * 1.3);
    tail.lineTo(-tailLen * 0.7, 0);
    tail.lineTo(-tailLen, tw * 1.3);
  } else {
    tail.lineTo(-tailLen * 0.92, -tw);
    tail.quadraticCurveTo(-tailLen * 1.05, 0, -tailLen * 0.92, tw);
  }
  tail.lineTo(0, 0.05);
  k.add('tail', flat(tail, 1), has(look, 'veryLongTail') ? accent : wingC, [-0.38, by + 0.07, 0], [0, 0, -tailUp * 0.7]);
  // Neck + head.
  const longNeck = has(look, 'longNeck');
  const hy = longNeck ? by + 0.52 : by + 0.24;
  const hx = longNeck ? 0.36 : 0.28;
  k.part('head', longNeck ? [0.2, by + 0.12, 0] : [hx - 0.06, hy - 0.1, 0]);
  if (longNeck) {
    seg(k, 'head', [0.2, by + 0.1, 0], [0.26, by + 0.32, 0], 0.07, 0.05, body);
    seg(k, 'head', [0.26, by + 0.32, 0], [hx - 0.02, hy - 0.05, 0], 0.05, 0.045, body);
  }
  k.add('head', E(0.15, 0.14, 0.14), headC, [hx, hy, 0]);
  const bl = has(look, 'longBeak') ? 0.34 : has(look, 'spoon') ? 0.4 : has(look, 'thickBeak') ? 0.13 : 0.13;
  const bw = has(look, 'thickBeak') ? 0.07 : has(look, 'hooked') ? 0.06 : 0.035;
  k.add('head', new THREE.ConeGeometry(bw, bl, 5), beak, [hx + 0.12 + bl / 2 - 0.05, hy - (has(look, 'hooked') ? 0.035 : 0.02), 0], [0, 0, -Math.PI / 2 - (has(look, 'hooked') ? 0.35 : 0.05)]);
  if (has(look, 'spoon')) k.add('head', E(0.07, 0.015, 0.06, 0), beak, [hx + 0.12 + bl - 0.04, hy - 0.03, 0]);
  for (const s of [-1, 1]) {
    if (has(look, 'eyering')) k.add('head', E(0.042, 0.042, 0.02, 0), '#ffffff', [hx + 0.07, hy + 0.035, s * 0.12]);
    if (has(look, 'mask')) k.add('head', E(0.09, 0.035, 0.02, 0), '#1a1a1a', [hx + 0.05, hy + 0.03, s * 0.125]);
    k.add('head', new THREE.IcosahedronGeometry(0.027, 0), has(look, 'redEye') ? '#c8302a' : '#111111', [hx + 0.08, hy + 0.035, s * 0.125]);
    k.add('head', new THREE.IcosahedronGeometry(0.009, 0), '#ffffff', [hx + 0.1, hy + 0.05, s * 0.14]);
    if (has(look, 'cheek')) k.add('head', E(0.055, 0.04, 0.02, 0), accent, [hx + 0.03, hy - 0.04, s * 0.13]);
  }
  if (has(look, 'crest')) {
    const n = has(look, 'bigCrest') ? 3 : 1;
    for (let i = 0; i < n; i++) k.add('head', new THREE.ConeGeometry(0.045, has(look, 'bigCrest') ? 0.28 : 0.15, 4), has(look, 'bigCrest') ? accent : headC === '#ffffff' ? accent : headC, [hx - 0.06 - i * 0.03, hy + 0.15 + i * 0.02, 0], [0, 0, 0.5 + i * 0.25]);
  }
  if (has(look, 'cap')) k.add('head', E(0.11, 0.06, 0.11, 0), accent, [hx - 0.02, hy + 0.1, 0]);
  if (has(look, 'collar')) k.add('body', new THREE.TorusGeometry(0.11, 0.03, 4, 10), accent, [hx - 0.1, hy - 0.15, 0], [0, Math.PI / 2, 0.4]);
  // Wings: inner arm (wingL) + outer hand (wingL2), spread along ±z, folded along the flank when perched.
  const soar = has(look, 'soar');
  const span = soar ? 0.8 : long ? 0.62 : 0.44;
  const chord = soar ? 0.34 : 0.28;
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    const sh: XYZ = [0.04, by + 0.1, s * 0.14];
    k.part(name, sh, 'double');
    const inner = new THREE.Shape();
    inner.moveTo(chord * 0.45, 0);
    inner.quadraticCurveTo(chord * 0.55, span * 0.25, chord * 0.35, span * 0.5);
    inner.lineTo(-chord * 0.5, span * 0.5);
    inner.quadraticCurveTo(-chord * 0.62, span * 0.2, -chord * 0.5, 0);
    k.add(name, flat(inner, s), wingC, sh);
    const cov = new THREE.Shape();
    cov.moveTo(chord * 0.44, 0.01);
    cov.quadraticCurveTo(chord * 0.5, span * 0.25, chord * 0.33, span * 0.48);
    cov.lineTo(0, span * 0.46);
    cov.lineTo(-0.02, 0.01);
    k.add(name, flat(cov, s), body, [sh[0], sh[1] + 0.004, sh[2]]);
    const name2 = `${name}2`;
    const el: XYZ = [sh[0], sh[1], s * (0.14 + span * 0.5)];
    k.part(name2, el, 'double', name);
    const outer = new THREE.Shape();
    outer.moveTo(chord * 0.35, 0);
    if (soar) {
      // Raptor "fingers".
      outer.quadraticCurveTo(chord * 0.3, span * 0.3, chord * 0.1, span * 0.45);
      for (let f = 0; f < 4; f++) {
        const fx = chord * (0.05 - f * 0.12);
        outer.lineTo(fx, span * (0.56 - f * 0.02));
        outer.lineTo(fx - chord * 0.07, span * (0.44 - f * 0.03));
      }
      outer.lineTo(-chord * 0.5, span * 0.12);
    } else if (has(look, 'forkTail')) {
      outer.quadraticCurveTo(chord * 0.2, span * 0.35, -chord * 0.6, span * 0.7);
      outer.quadraticCurveTo(-chord * 0.4, span * 0.3, -chord * 0.5, 0);
    } else {
      outer.quadraticCurveTo(chord * 0.3, span * 0.35, 0, span * 0.55);
      outer.quadraticCurveTo(-chord * 0.35, span * 0.45, -chord * 0.5, span * 0.18);
    }
    outer.lineTo(-chord * 0.5, 0);
    k.add(name2, flat(outer, s), wingC, el);
    if (has(look, 'wingpatch')) k.add(name2, E(0.06, 0.012, 0.07, 0), accent === '#111111' ? '#ffffff' : accent, [el[0] - 0.02, el[1] + 0.01, el[2] + s * span * 0.15]);
    if (has(look, 'barred')) for (let i = 0; i < 3; i++) k.add(name2, new THREE.BoxGeometry(0.025, 0.01, span * 0.4), '#f2f2f2', [el[0] - 0.08 + i * 0.06, el[1] + 0.01, el[2] + s * span * 0.2]);
  }
  return k.build({ rig: 'bird', legLen: legs });
}

function owlFig(look: Look): THREE.Group {
  const [body, face, eye] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.3, 0.4, 0.28), body, [0, 0.4, 0]);
  k.add('body', E(0.24, 0.2, 0.08), face, [0.22, 0.6, 0], [0, Math.PI / 2, 0]);
  for (const s of [-1, 1]) {
    k.add('body', new THREE.IcosahedronGeometry(0.07, 1), eye, [0.29, 0.63, s * 0.1]);
    k.add('body', new THREE.IcosahedronGeometry(0.035, 0), '#111111', [0.35, 0.63, s * 0.1]);
    k.add('body', new THREE.ConeGeometry(0.06, 0.16, 4), '#6e5842', [0.05, 0.86, s * 0.15]);
  }
  return k.build();
}

function nestFig(): THREE.Group {
  const k = new Kit();
  k.add('body', new THREE.CylinderGeometry(0.42, 0.26, 0.2, 9, 1, true), '#8a6440', [0, 0.1, 0]);
  k.add('body', new THREE.TorusGeometry(0.4, 0.08, 4, 10), '#a07448', [0, 0.2, 0], [Math.PI / 2, 0, 0]);
  k.add('body', new THREE.CircleGeometry(0.3, 9), '#6d4e31', [0, 0.05, 0], [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1;
    k.add('body', E(0.1, 0.13, 0.1), '#9fd3e6', [Math.cos(a) * 0.13, 0.15, Math.sin(a) * 0.13], [0, 0, 0.3 * (i - 1)]);
  }
  const g = k.build();
  g.children.forEach((m) => ((m as THREE.Mesh).material = MAT.double));
  return g;
}

/* ---------- Mammals ---------- */

function quadFig(look: Look): THREE.Group {
  const [body, belly, head, accent] = look.c as [string, string, string, string];
  const k = new Kit();
  const stocky = has(look, 'stocky');
  const cat = has(look, 'catEars');
  const bovine = has(look, 'cowTail');
  const deer = has(look, 'antlers');
  const pig = has(look, 'tusks');
  const low = has(look, 'short');
  const L = has(look, 'longLegs') ? (bovine ? 0.5 : 0.56) : low ? 0.2 : cat ? 0.34 : 0.3;
  const bodyR: XYZ = cat ? [0.44, 0.17, 0.14] : deer ? [0.42, 0.19, 0.15] : [0.46, stocky ? 0.27 : 0.2, stocky ? 0.25 : 0.17];
  const by = L + bodyR[1] * 0.72;
  const hip: XYZ = [-bodyR[0] * 0.55, by, 0];
  k.part('torso', hip);
  k.part('body', [0, 0, 0], 'solid', 'torso');
  // Chest + haunch masses read as a real body rather than a single egg.
  k.add('body', E(bodyR[0] * 0.62, bodyR[1] * 1.02, bodyR[2]), body, [-bodyR[0] * 0.36, by, 0]);
  k.add('body', E(bodyR[0] * 0.64, bodyR[1] * 1.06, bodyR[2] * 1.04), body, [bodyR[0] * 0.3, by + bodyR[1] * 0.04, 0]);
  k.add('body', E(bodyR[0] * 0.8, bodyR[1] * 0.55, bodyR[2] * 0.85), belly, [0.02, by - bodyR[1] * 0.42, 0]);
  if (bovine) k.add('body', E(bodyR[0] * 0.35, bodyR[1] * 0.5, bodyR[2] * 0.7), body, [bodyR[0] * 0.45, by + bodyR[1] * 0.75, 0]);
  if (has(look, 'spots')) for (let i = 0; i < 14; i++) k.add('body', E(0.045, 0.032, 0.012, 0), accent, [-0.34 + (i % 7) * 0.11, by + (i < 7 ? 0.08 : -0.03), (i % 2 ? 1 : -1) * bodyR[2] * 0.95]);
  if (has(look, 'scales'))
    for (let i = 0; i < 24; i++) {
      const x = -0.42 + (i % 8) * 0.12;
      const ring = Math.floor(i / 8);
      k.add('body', E(0.09, 0.03, 0.11, 0), i % 2 ? accent : body, [x, by + bodyR[1] * (0.85 - ring * 0.3), (ring - 1) * bodyR[2] * 0.75], [(ring - 1) * 0.6, 0, 0.3]);
    }
  if (has(look, 'spines'))
    for (let i = 0; i < 22; i++) {
      const x = -0.45 + (i % 11) * 0.075;
      const z = (i < 11 ? 1 : -1) * 0.09;
      k.add('body', new THREE.ConeGeometry(0.025, 0.48, 3), i % 2 ? accent : '#1a1a1a', [x - 0.12, by + bodyR[1] * 0.9 + 0.1, z], [z * 4, 0, 1.15]);
    }
  if (has(look, 'bristle')) k.add('body', new THREE.BoxGeometry(0.7, 0.08, 0.05), '#2a221c', [0, by + bodyR[1] * 0.98, 0]);
  // Neck (pivot at the shoulder) and head (pivot at the top of the neck).
  const neckAng = deer ? 1.0 : bovine ? 0.35 : pig ? 0.12 : cat ? 0.75 : low ? 0.25 : 0.5;
  const neckLen = deer ? 0.34 : bovine ? 0.22 : pig ? 0.12 : cat ? 0.17 : 0.15;
  const nb: XYZ = [bodyR[0] * 0.62, by + bodyR[1] * 0.35, 0];
  const nt: XYZ = [nb[0] + Math.cos(neckAng) * neckLen, nb[1] + Math.sin(neckAng) * neckLen, 0];
  k.part('neck', nb, 'solid', 'torso');
  seg(k, 'neck', nb, nt, bodyR[2] * 0.75, bodyR[2] * (bovine || pig ? 0.75 : 0.55), body, 7);
  if (bovine) k.add('neck', E(0.1, 0.14, 0.08), belly, [nb[0] + 0.06, nb[1] - 0.15, 0]);
  k.part('head', nt, 'solid', 'neck');
  const hs = bovine ? 1.25 : pig ? 1.15 : deer ? 0.9 : cat ? 0.85 : 0.8;
  const hx = nt[0] + 0.06 * hs;
  const hy = nt[1] + (bovine || pig ? -0.02 : 0.02);
  k.add('head', E(0.14 * hs, 0.12 * hs, 0.11 * hs), head, [hx, hy, 0]);
  const snout = (has(look, 'snout') ? 0.16 : cat ? 0.05 : bovine ? 0.13 : deer ? 0.12 : 0.08) * hs;
  const muz: XYZ = [hx + 0.1 * hs + snout * 0.5, hy - 0.04 * hs, 0];
  k.add('head', E(snout * 0.75 + 0.03, 0.065 * hs, 0.07 * hs), has(look, 'mask') || has(look, 'blaze') ? accent : head, muz, [0, 0, -0.12]);
  k.add('head', E(0.03 * hs, 0.028 * hs, 0.05 * hs, 0), pig ? '#c89a8a' : '#1a1a1a', [muz[0] + snout * 0.55 + 0.02, muz[1] + 0.005, 0]);
  if (has(look, 'blaze')) k.add('head', new THREE.BoxGeometry(0.24 * hs, 0.028, 0.04), '#f2eee6', [hx + 0.05, hy + 0.09 * hs, 0], [0, 0, -0.15]);
  if (has(look, 'mask')) for (const s of [-1, 1]) k.add('head', E(0.07, 0.028, 0.02, 0), '#f2eee6', [hx + 0.02, hy + 0.055 * hs, s * 0.09 * hs]);
  for (const s of [-1, 1]) {
    const ex = hx + 0.085 * hs;
    k.add('head', new THREE.IcosahedronGeometry(0.024 * hs, 0), '#111111', [ex, hy + 0.035 * hs, s * 0.075 * hs]);
    k.add('head', new THREE.IcosahedronGeometry(0.008 * hs, 0), '#ffffff', [ex + 0.012, hy + 0.045 * hs, s * 0.088 * hs]);
    if (cat) k.add('head', new THREE.ConeGeometry(0.045, 0.1, 3), head, [hx - 0.03, hy + 0.12 * hs, s * 0.065], [s * 0.2, 0, 0]);
    else if (bovine) k.add('head', E(0.08, 0.03, 0.045), head, [hx - 0.04, hy + 0.06, s * 0.16], [s * 0.3, 0, 0]);
    else k.add('head', new THREE.ConeGeometry(0.04 * hs, 0.11 * hs, 5), head, [hx - 0.05 * hs, hy + 0.11 * hs, s * 0.08 * hs], [s * 0.5, 0, 0.1]);
    if (deer) {
      seg(k, 'head', [hx - 0.03, hy + 0.1, s * 0.04], [hx - 0.06, hy + 0.26, s * 0.07], 0.016, 0.01, '#5b4331', 4);
      seg(k, 'head', [hx - 0.06, hy + 0.26, s * 0.07], [hx + 0.0, hy + 0.3, s * 0.06], 0.01, 0.006, '#5b4331', 4);
    }
    if (has(look, 'horns')) {
      seg(k, 'head', [hx - 0.03, hy + 0.1, s * 0.09], [hx - 0.02, hy + 0.14, s * 0.2], 0.03, 0.022, accent, 5);
      seg(k, 'head', [hx - 0.02, hy + 0.14, s * 0.2], [hx + 0.02, hy + 0.24, s * 0.22], 0.022, 0.006, accent, 5);
    }
    if (has(look, 'bigHorns')) {
      seg(k, 'head', [hx - 0.04, hy + 0.1, s * 0.08], [hx - 0.12, hy + 0.14, s * 0.3], 0.045, 0.035, accent, 5);
      seg(k, 'head', [hx - 0.12, hy + 0.14, s * 0.3], [hx - 0.26, hy + 0.22, s * 0.36], 0.035, 0.008, accent, 5);
    }
    if (has(look, 'tusks')) k.add('head', new THREE.ConeGeometry(0.014, 0.08, 3), '#f2eee0', [muz[0] + 0.02, muz[1] + 0.02, s * 0.06], [0, 0, -0.4]);
  }
  // Legs: two segments each, hooves for ungulates, paws otherwise.
  const hoof = bovine || deer || pig;
  const thick = bovine ? 0.055 : stocky ? 0.05 : deer ? 0.028 : 0.036;
  const lx = bodyR[0] * 0.58;
  const lz = bodyR[2] * 0.62;
  const top = by - bodyR[1] * 0.25;
  const legC = has(look, 'short') || has(look, 'mask') ? accent === '#f2eee6' ? body : head : body;
  for (const [name, x, z] of [['legFL', lx, lz], ['legFR', lx, -lz], ['legBL', -lx, lz], ['legBR', -lx, -lz]] as const) {
    leg(k, name, 'torso', [x, top, z], top, thick, x < 0 ? body : legC, hoof ? 'hoof' : 'paw', hoof ? '#2a2420' : legC, x < 0 ? 1.9 : 1.5);
  }
  // Tail.
  const tb: XYZ = [-bodyR[0] * 0.95, by + bodyR[1] * 0.35, 0];
  if (has(look, 'longTail')) {
    const scaly = has(look, 'scales');
    const r = scaly ? 0.09 : cat ? 0.03 : 0.045;
    tailChain(k, 'torso', tb, 4, scaly ? 0.14 : 0.13, r, scaly ? 0.03 : r * 0.7, scaly ? -0.25 : cat ? 0.15 : -0.35, cat ? 0.25 : 0.12, (i) => (has(look, 'ringTail') && i % 2 ? accent : body));
  } else if (bovine) {
    tailChain(k, 'torso', [tb[0], tb[1] + 0.03, 0], 2, 0.22, 0.02, 0.014, -1.35, 0.05, () => body);
    k.add('tail2', E(0.035, 0.08, 0.035, 0), '#1a1a1a', [tb[0] - 0.06, tb[1] - 0.43, 0]);
  } else if (pig) {
    tailChain(k, 'torso', tb, 2, 0.07, 0.015, 0.01, -0.9, 1.2, () => body);
  } else {
    tailChain(k, 'torso', tb, 1, 0.08, 0.05, 0.04, 0.2, 0, () => (deer ? '#f2eee6' : belly), 0.06);
  }
  const sitK = cat ? 1 : 0;
  return k.build({ rig: 'quad', legLen: top, hipY: by, sit: sitK, neckAng });
}

function monkeyFig(look: Look): THREE.Group {
  const [fur, light, face] = look.c as [string, string, string];
  const k = new Kit();
  const dark = new THREE.Color(fur).multiplyScalar(0.72).getStyle();
  const hipY = 0.4;
  const hip: XYZ = [-0.16, hipY, 0];
  k.part('torso', hip);
  k.part('body', [0, 0, 0], 'solid', 'torso');
  // Barrel chest higher at the shoulders, narrower loins, pink rump pad.
  k.add('body', E(0.2, 0.17, 0.15), fur, [0.1, 0.49, 0], [0, 0, 0.18]);
  k.add('body', E(0.2, 0.14, 0.13), fur, [-0.12, 0.44, 0], [0, 0, 0.1]);
  k.add('body', E(0.16, 0.1, 0.11), light, [0.02, 0.38, 0]);
  k.add('body', E(0.05, 0.06, 0.08), '#d98b86', [-0.3, 0.4, 0]);
  // Head: rounded skull, bare pink face with a short muzzle, ears to the side, brow ridge.
  k.part('head', [0.28, 0.56, 0], 'solid', 'torso');
  k.add('head', E(0.12, 0.12, 0.12), fur, [0.36, 0.63, 0]);
  k.add('head', E(0.06, 0.1, 0.09), face, [0.44, 0.61, 0]);
  k.add('head', E(0.055, 0.045, 0.06), face, [0.48, 0.565, 0]);
  k.add('head', new THREE.BoxGeometry(0.05, 0.025, 0.15), dark, [0.46, 0.665, 0]);
  k.add('head', E(0.09, 0.04, 0.1), fur, [0.35, 0.72, 0]);
  for (const s of [-1, 1]) {
    k.add('head', new THREE.IcosahedronGeometry(0.018, 0), '#2a1a12', [0.495, 0.635, s * 0.035]);
    k.add('head', new THREE.IcosahedronGeometry(0.008, 0), '#3a2418', [0.53, 0.575, s * 0.014]);
    k.add('head', E(0.025, 0.04, 0.02), face, [0.36, 0.64, s * 0.125]);
  }
  // Arms (front) and legs (back), with hands and feet.
  for (const [name, x, z, len] of [['legFL', 0.2, 0.1, 0.5], ['legFR', 0.2, -0.1, 0.5], ['legBL', -0.22, 0.09, hipY], ['legBR', -0.22, -0.09, hipY]] as const) {
    const front = x > 0;
    leg(k, name, 'torso', [x, front ? 0.5 : hipY, z], len, front ? 0.034 : 0.04, fur, 'hand', front ? face : dark, front ? 1.3 : 2.1);
  }
  // Tail: carried up then curving down, as macaques do.
  tailChain(k, 'torso', [-0.32, 0.46, 0], 3, 0.1, 0.03, 0.018, 0.9, -0.75, () => fur);
  return k.build({ rig: 'monkey', legLen: hipY, hipY });
}

function squirrelFig(look: Look): THREE.Group {
  const [fur, belly, tailC] = look.c as [string, string, string];
  const k = new Kit();
  const hip: XYZ = [-0.12, 0.2, 0];
  k.part('torso', hip);
  k.part('body', [0, 0, 0], 'solid', 'torso');
  k.add('body', E(0.2, 0.13, 0.12), fur, [0.0, 0.24, 0], [0, 0, 0.3]);
  k.add('body', E(0.14, 0.09, 0.1), belly, [0.05, 0.2, 0], [0, 0, 0.3]);
  k.add('body', E(0.12, 0.11, 0.12), fur, [-0.12, 0.2, 0]);
  k.part('head', [0.16, 0.3, 0], 'solid', 'torso');
  k.add('head', E(0.11, 0.095, 0.09), fur, [0.24, 0.36, 0]);
  k.add('head', E(0.05, 0.045, 0.05), fur, [0.33, 0.34, 0]);
  k.add('head', new THREE.IcosahedronGeometry(0.012, 0), '#2a1a12', [0.38, 0.35, 0]);
  for (const s of [-1, 1]) {
    k.add('head', new THREE.ConeGeometry(0.03, 0.08, 4), fur, [0.21, 0.46, s * 0.05]);
    k.add('head', new THREE.IcosahedronGeometry(0.022, 0), '#111111', [0.3, 0.385, s * 0.06]);
    k.add('head', new THREE.IcosahedronGeometry(0.007, 0), '#ffffff', [0.31, 0.395, s * 0.075]);
  }
  for (const [name, x, z, len] of [['legFL', 0.12, 0.06, 0.2], ['legFR', 0.12, -0.06, 0.2], ['legBL', -0.12, 0.07, 0.2], ['legBR', -0.12, -0.07, 0.2]] as const) {
    leg(k, name, 'torso', [x, len, z], len, 0.022, x > 0 ? belly : fur, 'paw', fur, x > 0 ? 1.4 : 3);
  }
  // Big bushy tail curling up over the back.
  tailChain(k, 'torso', [-0.22, 0.22, 0], 4, 0.12, 0.05, 0.05, 1.15, 0.42, (i) => (i % 2 ? tailC : fur), 0.085);
  return k.build({ rig: 'squirrel', legLen: 0.2, hipY: 0.2 });
}

function batFig(look: Look): THREE.Group {
  const [fur, membrane, dark] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.2, 0.12, 0.12), fur, [0, 0.2, 0]);
  k.add('body', E(0.1, 0.09, 0.09), dark, [0.2, 0.24, 0]);
  for (const s of [-1, 1]) k.add('body', new THREE.ConeGeometry(0.035, 0.1, 3), dark, [0.18, 0.34, s * 0.05]);
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0, 0.22, s * 0.08], 'double');
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.18, 0.45);
    shape.lineTo(0.02, 0.36);
    shape.lineTo(-0.02, 0.5);
    shape.lineTo(-0.12, 0.34);
    shape.lineTo(-0.2, 0.05);
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2);
    k.add(name, g, membrane, [0, 0.22, s * 0.08]);
  }
  return k.build();
}

/* ---------- Insects ---------- */

function butterflyFig(look: Look): THREE.Group {
  const [wing, pattern, bodyC, spot] = look.c as [string, string, string, string?];
  const moth = has(look, 'moth');
  const k = new Kit();
  const y = 0.03;
  k.part('body');
  k.add('body', E(0.07, 0.035, 0.035), bodyC, [0.04, y, 0]);
  k.add('body', E(0.14, 0.028, 0.028), bodyC, [-0.13, y - 0.005, 0]);
  k.add('body', new THREE.IcosahedronGeometry(0.03, 0), bodyC, [0.13, y + 0.005, 0]);
  for (const s of [-1, 1]) {
    seg(k, 'body', [0.14, y + 0.02, s * 0.01], [0.28, y + 0.1, s * 0.07], 0.004, 0.004, bodyC, 3);
    k.add('body', moth ? E(0.03, 0.006, 0.02, 0) : new THREE.IcosahedronGeometry(0.012, 0), bodyC, [0.28, y + 0.1, s * 0.07]);
  }
  const sc = moth ? 1.25 : 1;
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0, y, s * 0.02], 'double');
    const fore = new THREE.Shape();
    fore.moveTo(0.06 * sc, 0);
    fore.bezierCurveTo(0.16 * sc, 0.06 * sc, 0.26 * sc, 0.22 * sc, 0.2 * sc, 0.34 * sc);
    fore.quadraticCurveTo(0.06 * sc, 0.33 * sc, -0.03 * sc, 0.1 * sc);
    fore.lineTo(-0.03 * sc, 0);
    k.add(name, flat(fore, s, 6), wing, [0, y, s * 0.02]);
    const band = new THREE.Shape();
    band.moveTo(0.15 * sc, 0.2 * sc);
    band.quadraticCurveTo(0.24 * sc, 0.28 * sc, 0.19 * sc, 0.33 * sc);
    band.quadraticCurveTo(0.1 * sc, 0.31 * sc, 0.08 * sc, 0.22 * sc);
    k.add(name, flat(band, s, 4), moth ? (spot ?? '#ffffff') : pattern, [0, y + 0.002 * s, s * 0.02]);
    const hind = new THREE.Shape();
    hind.moveTo(0.0, 0);
    hind.bezierCurveTo(0.02 * sc, 0.14 * sc, -0.06 * sc, 0.26 * sc, -0.17 * sc, 0.23 * sc);
    hind.quadraticCurveTo(-0.26 * sc, 0.1 * sc, -0.08 * sc, 0);
    k.add(name, flat(hind, s, 6), moth ? wing : pattern, [0, y - 0.002, s * 0.02]);
    if (spot) {
      const c = new THREE.CircleGeometry(0.025 * sc, 6);
      c.rotateX(-Math.PI / 2);
      k.add(name, c, spot, [0.17 * sc, y + 0.004, s * (0.02 + 0.27 * sc)]);
      if (moth) k.add(name, c.clone(), spot, [-0.1 * sc, y + 0.004, s * (0.02 + 0.15 * sc)]);
    }
    if (has(look, 'tails')) {
      const t = new THREE.Shape();
      t.moveTo(-0.15 * sc, 0.2 * sc);
      t.lineTo(-0.3 * sc, 0.3 * sc);
      t.lineTo(-0.28 * sc, 0.33 * sc);
      t.lineTo(-0.12 * sc, 0.23 * sc);
      k.add(name, flat(t, s), pattern, [0, y - 0.003, s * 0.02]);
    }
  }
  return k.build({ rig: 'butterfly' });
}

function dragonflyFig(look: Look): THREE.Group {
  const [bodyC, wingC] = look.c as [string, string];
  const k = new Kit();
  k.add('body', new THREE.CylinderGeometry(0.02, 0.012, 0.6, 4), bodyC, [-0.2, 0.05, 0], [0, 0, Math.PI / 2]);
  k.add('body', E(0.08, 0.05, 0.05), bodyC, [0.1, 0.05, 0]);
  k.add('body', E(0.06, 0.06, 0.08), '#5a2a22', [0.2, 0.06, 0]);
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0.08, 0.07, 0], 'glass');
    k.add(name, E(0.05, 0.004, 0.24, 0), wingC, [0.12, 0.07, s * 0.26]);
    k.add(name, E(0.05, 0.004, 0.22, 0), wingC, [0.0, 0.07, s * 0.24]);
  }
  return k.build();
}

function beeFig(look: Look): THREE.Group {
  const [yellow, black, wingC] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.18, 0.12, 0.12), yellow, [-0.05, 0.12, 0]);
  for (const x of [-0.12, 0.0]) k.add('body', E(0.03, 0.125, 0.125, 1), black, [x, 0.12, 0]);
  k.add('body', E(0.08, 0.08, 0.08), black, [0.16, 0.13, 0]);
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0.02, 0.2, 0], 'glass');
    k.add(name, E(0.08, 0.004, 0.14, 0), wingC, [0.0, 0.22, s * 0.14]);
  }
  return k.build();
}

function beetleFig(look: Look): THREE.Group {
  const [shell, dark] = look.c as [string, string];
  const k = new Kit();
  k.add('body', new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0, 0]);
  k.add('body', new THREE.IcosahedronGeometry(0.07, 0), dark, [0.15, 0.03, 0]);
  if (has(look, 'dots')) for (let i = 0; i < 5; i++) k.add('body', new THREE.IcosahedronGeometry(0.03, 0), dark, [Math.cos(i * 1.3) * 0.08, 0.12, Math.sin(i * 1.3) * 0.08]);
  if (has(look, 'horn')) k.add('body', new THREE.ConeGeometry(0.025, 0.22, 4), dark, [0.25, 0.1, 0], [0, 0, -0.9]);
  for (const s of [-1, 1]) for (const x of [-0.06, 0.02, 0.1]) k.add('body', new THREE.CylinderGeometry(0.008, 0.008, 0.1, 3), dark, [x, 0.02, s * 0.15], [s * 1.1, 0, 0]);
  return k.build();
}

function cicadaFig(look: Look): THREE.Group {
  const [bodyC, wingC, headC] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.22, 0.09, 0.1), bodyC, [0, 0.09, 0]);
  k.add('body', E(0.07, 0.07, 0.12, 0), headC, [0.2, 0.1, 0]);
  k.part('wingL', [0.05, 0.16, 0], 'glass').add('wingL', E(0.26, 0.02, 0.14, 0), wingC, [-0.05, 0.16, 0]);
  return k.build();
}

function mantisFig(look: Look): THREE.Group {
  const [green, dark] = look.c as [string, string];
  const k = new Kit();
  k.add('body', new THREE.CylinderGeometry(0.03, 0.05, 0.5, 4), green, [-0.1, 0.12, 0], [0, 0, Math.PI / 2 - 0.2]);
  k.add('body', new THREE.CylinderGeometry(0.02, 0.025, 0.25, 4), green, [0.2, 0.22, 0], [0, 0, -0.4]);
  k.part('head', [0.3, 0.3, 0]);
  k.add('head', new THREE.ConeGeometry(0.06, 0.1, 3), green, [0.33, 0.33, 0], [0, 0, -Math.PI / 2]);
  for (const s of [-1, 1]) {
    k.add('body', new THREE.CylinderGeometry(0.012, 0.012, 0.18, 3), dark, [0.3, 0.2, s * 0.05], [0, 0, 0.6]);
    for (const x of [-0.05, -0.2]) k.add('body', new THREE.CylinderGeometry(0.008, 0.008, 0.2, 3), dark, [x, 0.06, s * 0.08], [s * 1.0, 0, 0]);
  }
  return k.build();
}

function stickFig(look: Look): THREE.Group {
  const [c1, c2] = look.c as [string, string];
  const k = new Kit();
  k.add('body', new THREE.CylinderGeometry(0.018, 0.024, 0.8, 4), c1, [0, 0.05, 0], [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) for (const x of [-0.2, 0.05, 0.25]) k.add('body', new THREE.CylinderGeometry(0.007, 0.007, 0.26, 3), c2, [x, 0.02, s * 0.1], [s * 1.2, 0, 0.3]);
  return k.build();
}

function fireflyFig(look: Look): THREE.Group {
  const [bodyC] = look.c as [string];
  const k = new Kit();
  k.add('body', E(0.2, 0.08, 0.08), bodyC, [0, 0.08, 0]);
  k.part('glow', [0, 0, 0], 'glow').add('glow', E(0.1, 0.09, 0.09), '#f6ff9a', [-0.18, 0.08, 0]);
  return k.build();
}

/* ---------- Reptiles & amphibians ---------- */

function lizardFig(look: Look): THREE.Group {
  const [bodyC, accent, dark] = look.c as [string, string, string];
  const newt = has(look, 'newt');
  const k = new Kit();
  k.add('body', E(0.26, 0.07, 0.1), bodyC, [0, 0.08, 0]);
  if (newt) k.add('body', E(0.22, 0.03, 0.08), accent, [0, 0.03, 0]);
  k.part('head', [0.2, 0.09, 0]);
  k.add('head', E(0.12, 0.06, 0.08), newt ? bodyC : accent, [0.3, 0.1, 0]);
  for (const s of [-1, 1]) k.add('head', new THREE.IcosahedronGeometry(has(look, 'gecko') ? 0.03 : 0.02, 0), '#111111', [0.34, 0.14, s * 0.05]);
  k.part('tail', [-0.24, 0.07, 0]);
  k.add('tail', new THREE.ConeGeometry(0.06, 0.55, 4), dark, [-0.5, 0.06, 0], [0, 0, Math.PI / 2]);
  for (const [name, x, z] of [['legFL', 0.13, 0.1], ['legFR', 0.13, -0.1], ['legBL', -0.13, 0.1], ['legBR', -0.13, -0.1]] as const) {
    k.part(name, [x, 0.07, z]);
    k.add(name, new THREE.CylinderGeometry(0.015, 0.015, 0.1, 3), bodyC, [x, 0.04, z + Math.sign(z) * 0.03], [Math.sign(z) * 0.9, 0, 0]);
  }
  return k.build();
}

function snakeFig(look: Look): THREE.Group {
  const [bodyC, accent, belly] = look.c as [string, string, string];
  const k = new Kit();
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = 0.3 - t * 1.1;
    const z = Math.sin(t * 7) * 0.12;
    const r = 0.05 * (1 - t * 0.6);
    const blot = has(look, 'blotch') && i % 2 === 0;
    k.add('body', new THREE.IcosahedronGeometry(r * 1.3, 0), blot ? accent : i === n - 1 && accent === '#d8402a' ? accent : bodyC, [x, r, z]);
  }
  k.part('head', [0.34, 0.05, 0]);
  k.add('head', E(0.09, 0.05, 0.065), bodyC, [0.4, 0.06, 0]);
  k.add('head', E(0.06, 0.02, 0.05), belly, [0.4, 0.03, 0]);
  for (const s of [-1, 1]) k.add('head', new THREE.IcosahedronGeometry(0.015, 0), '#f0d040', [0.44, 0.09, s * 0.04]);
  return k.build();
}

function turtleFig(look: Look): THREE.Group {
  const [shell, stripe, skin] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0.06, 0]);
  for (const z of [-0.1, 0, 0.1]) k.add('body', new THREE.BoxGeometry(0.46, 0.02, 0.025), stripe, [0, 0.2 - Math.abs(z) * 0.6, z], [z * 2, 0, 0]);
  k.part('head', [0.24, 0.08, 0]);
  k.add('head', E(0.1, 0.07, 0.07), skin, [0.33, 0.1, 0]);
  for (const [name, x, z] of [['legFL', 0.15, 0.2], ['legFR', 0.15, -0.2], ['legBL', -0.15, 0.2], ['legBR', -0.15, -0.2]] as const) {
    k.part(name, [x, 0.06, z]);
    k.add(name, E(0.06, 0.04, 0.06, 0), skin, [x, 0.04, z]);
  }
  return k.build();
}

function frogFig(look: Look): THREE.Group {
  const [bodyC, belly, dark] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.2, 0.13, 0.17), bodyC, [0, 0.14, 0], [0, 0, 0.3]);
  k.add('body', E(0.16, 0.08, 0.14), belly, [0.03, 0.08, 0]);
  for (const s of [-1, 1]) {
    k.add('body', new THREE.IcosahedronGeometry(0.05, 0), bodyC, [0.14, 0.25, s * 0.08]);
    k.add('body', new THREE.IcosahedronGeometry(0.03, 0), '#111111', [0.17, 0.27, s * 0.09]);
    k.add('body', E(0.03, 0.05, 0.03, 0), bodyC, [0.14, 0.05, s * 0.12]);
  }
  if (has(look, 'warty')) for (let i = 0; i < 8; i++) k.add('body', new THREE.IcosahedronGeometry(0.022, 0), dark, [-0.1 + (i % 4) * 0.06, 0.24, (i < 4 ? 1 : -1) * 0.06]);
  for (const [name, s] of [['legBL', 1], ['legBR', -1]] as const) {
    k.part(name, [-0.1, 0.1, s * 0.14]);
    k.add(name, E(0.14, 0.05, 0.05), bodyC, [-0.14, 0.06, s * 0.16], [0, s * 0.4, 0.2]);
  }
  return k.build();
}

const BUILDERS: Record<Look['kind'], (look: Look) => THREE.Group> = {
  bird: birdFig,
  owl: owlFig,
  quad: quadFig,
  monkey: monkeyFig,
  squirrel: squirrelFig,
  bat: batFig,
  butterfly: butterflyFig,
  dragonfly: dragonflyFig,
  bee: beeFig,
  beetle: beetleFig,
  cicada: cicadaFig,
  mantis: mantisFig,
  stick: stickFig,
  firefly: fireflyFig,
  lizard: lizardFig,
  snake: snakeFig,
  turtle: turtleFig,
  frog: frogFig,
};

const templates = new Map<string, THREE.Group>();
function template(id: string): THREE.Group | null {
  let t = templates.get(id);
  if (t) return t;
  if (id === 'nest') t = nestFig();
  else {
    const def = animalById(id);
    if (!def) return null;
    t = BUILDERS[def.look.kind](def.look);
  }
  templates.set(id, t);
  return t;
}

/* ---------- Rigs & poses ---------- */

interface Rig {
  kind: string;
  torso?: THREE.Object3D;
  torsoY: number;
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  /** FL, FR, BL, BR for quadrupeds; L, R for birds. */
  legs: { up: THREE.Object3D; lo?: THREE.Object3D }[];
  tails: THREE.Object3D[];
  tailRest: number[];
  wingL?: THREE.Object3D;
  wingR?: THREE.Object3D;
  wingL2?: THREE.Object3D;
  wingR2?: THREE.Object3D;
  glow?: THREE.Object3D;
  legLen: number;
  neckAng: number;
}

function rigOf(obj: THREE.Object3D): Rig {
  const get = (n: string) => obj.getObjectByName(n) ?? undefined;
  const legs: Rig['legs'] = [];
  for (const n of ['legFL', 'legFR', 'legBL', 'legBR', 'legL', 'legR']) {
    const up = get(n);
    if (up) legs.push({ up, lo: get(`${n}2`) });
  }
  const tails: THREE.Object3D[] = [];
  for (let i = 1; i <= 6; i++) {
    const t = get(i === 1 ? 'tail' : `tail${i}`);
    if (!t) break;
    tails.push(t);
  }
  const torso = get('torso');
  const ud = obj.userData as { rig?: string; legLen?: number; neckAng?: number };
  return {
    kind: ud.rig ?? 'basic',
    torso,
    torsoY: torso ? torso.position.y : 0,
    neck: get('neck'),
    head: get('head'),
    legs,
    tails,
    tailRest: tails.map((t) => t.rotation.z),
    wingL: get('wingL'),
    wingR: get('wingR'),
    wingL2: get('wingL2'),
    wingR2: get('wingR2'),
    glow: get('glow'),
    legLen: ud.legLen ?? 0.3,
    neckAng: ud.neckAng ?? 0.5,
  };
}

interface BodyPose {
  gait: number;
  walk: number;
  run: number;
  sit: number;
  graze: number;
  lie: number;
  look: number;
  t: number;
  sniff: number;
}

const WALK_OFFS = [0.25, 0.75, 0, 0.5];
const RUN_OFFS = [0.0, 0.1, 0.5, 0.6];

/** Quadruped / monkey / squirrel body pose: gait cycle blended with sit, lie, graze. */
function poseBody(r: Rig, p: BodyPose): void {
  const monkey = r.kind === 'monkey';
  const squirrel = r.kind === 'squirrel';
  const sitPitch = monkey ? 1.15 : squirrel ? 1.05 : 0.55;
  const sitDrop = monkey ? 0.15 : squirrel ? 0.07 : r.legLen * 0.5;
  const lieDrop = r.legLen * 0.82;
  const move = clamp(1 - p.sit - p.lie, 0, 1);
  const run = p.run;
  const walk = p.walk * move;
  const TAU = Math.PI * 2;
  r.legs.forEach((l, j) => {
    const front = j < 2;
    const off = (WALK_OFFS[j] ?? 0) * (1 - run) + (RUN_OFFS[j] ?? 0) * run;
    const ph = p.gait + off * TAU;
    const amp = 0.4 + run * 0.4;
    let up = Math.sin(ph) * amp * walk + (front ? 0 : 0.06);
    let lo = -Math.max(0, Math.cos(ph)) * (0.55 + run * 0.6) * walk - (front ? 0 : 0.12) * move;
    // Sitting.
    const su = monkey ? (front ? -0.55 : 0.2) : squirrel ? (front ? -0.2 : 0.45) : front ? -sitPitch : 0.8;
    const sl = monkey ? (front ? 0.35 : -1.35) : squirrel ? (front ? -1.1 : -1.7) : front ? 0 : -2.3;
    // Lying down, legs tucked.
    const lu = front ? -1.25 : 1.3;
    const ll = front ? 2.5 : -2.5;
    up = up * move + su * p.sit + lu * p.lie;
    lo = lo * move + sl * p.sit + ll * p.lie;
    l.up.rotation.set(0, 0, up);
    if (l.lo) l.lo.rotation.set(0, 0, lo);
  });
  if (r.torso) {
    const bob = walk * (run > 0.5 ? Math.abs(Math.sin(p.gait)) * 0.05 : Math.cos(p.gait * 2) * 0.01);
    r.torso.position.y = r.torsoY - sitDrop * p.sit - lieDrop * p.lie + bob;
    r.torso.rotation.set(0, 0, sitPitch * p.sit + Math.sin(p.gait) * 0.07 * run * walk + (squirrel ? Math.sin(p.gait) * 0.12 * walk : 0));
  }
  const grazeDip = r.neckAng + 0.6;
  if (r.neck) r.neck.rotation.set(0, 0, -p.graze * grazeDip + Math.sin(p.gait * 2) * 0.04 * walk);
  if (r.head) {
    const sniff = p.sniff * (Math.sin(p.t * 9) * 0.06 - 0.35);
    r.head.rotation.set(0, p.look * (1 - p.graze * 0.7), -sitPitch * p.sit * 0.8 - p.graze * 0.25 + sniff + (r.neck ? 0 : -p.graze * 0.8));
  }
  r.tails.forEach((t, i) => {
    const wag = Math.sin(p.t * (squirrel ? 3 : 2.2) - i * 0.7) * (0.12 + 0.1 * i) * (squirrel ? 0.6 : 1);
    t.rotation.set(0, wag, (r.tailRest[i] ?? 0) + (monkey ? -0.35 * p.sit : 0) + (squirrel ? Math.sin(p.t * 1.3 - i) * 0.08 : 0) - (i === 0 ? run * 0.3 : 0));
  });
}

/** Bird wings: `spread` 0 folded … 1 open; `f`/`f2` flap angles of inner/outer segments. */
function poseWings(r: Rig, spread: number, f: number, f2: number, dihedral: number): void {
  const fold = 1 - spread;
  for (const [inner, outer, s] of [[r.wingL, r.wingL2, 1], [r.wingR, r.wingR2, -1]] as const) {
    if (!inner) continue;
    // Folding: roll the wing upright (z), swing it back along the flank (y); flapping raises it (x).
    inner.rotation.set(-s * (f + dihedral) * spread, -s * 1.5 * fold, 1.35 * fold);
    if (outer) outer.rotation.set(-s * (f2 - dihedral * 0.5) * spread, -s * 0.2 * fold, 0);
  }
}

/** Standalone figure for album thumbnails, in a characteristic pose. */
export function albumFigure(id: string): THREE.Object3D | null {
  const t = template(id);
  if (!t) return null;
  const fig = t.clone();
  const def = animalById(id);
  const r = rigOf(fig);
  const base: BodyPose = { gait: 1.1, walk: 1, run: 0, sit: 0, graze: 0, lie: 0, look: 0.35, t: 0.6, sniff: 0 };
  if (def?.look.kind === 'bird') {
    if (def.motion === 'soar') poseWings(r, 1, -0.15, 0.1, 0.1);
    else poseWings(r, 0, 0, 0, 0);
    if (r.head) r.head.rotation.y = 0.3;
  } else if (r.kind === 'monkey') poseBody(r, { ...base, walk: 0, sit: 1, look: 0.5 });
  else if (r.kind === 'squirrel') poseBody(r, { ...base, walk: 0, sit: 1, look: 0.3 });
  else if (r.kind === 'quad') poseBody(r, base);
  else if (r.kind === 'butterfly') for (const [w, s] of [[r.wingL, 1], [r.wingR, -1]] as const) w?.rotation.set(-s * 0.45, 0, 0);
  if (id === 'magpierobin') {
    const g = new THREE.Group();
    const nest = template('nest')!.clone();
    fig.position.set(0.1, 0.25, 0.3);
    fig.scale.setScalar(0.8);
    g.add(nest, fig);
    return g;
  }
  return fig;
}

function foldWings(obj: THREE.Object3D, fold: number): void {
  poseWings(rigOf(obj), 1 - fold, 0, 0, 0);
}

/* =====================================================================
 * Ecosystem: which animals are on screen and how they move.
 * ===================================================================== */

const FLYERS = new Set(['perch', 'flock', 'soar', 'hover', 'flutter', 'bat']);
const GROUND = new Set(['walk', 'hop', 'wade']);
/** Hard safety limit regardless of stage (developer spawns included). */
const MAX_MEMBERS = 48;

type Act = 'none' | 'graze' | 'sniff' | 'sit' | 'look' | 'lie' | 'climb' | 'groom' | 'peck' | 'strike' | 'preen' | 'rest';

interface Member {
  obj: THREE.Object3D;
  rig: Rig;
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  target: THREE.Vector3;
  offset: THREE.Vector3;
  mode: 'fly' | 'perch' | 'ground' | 'fixed';
  perch: number;
  phase: number;
  scale: number;
  timer: number;
  speed: number;
  yaw: number;
  /** World speed (units/s) this frame. */
  moving: number;
  spread: number;
  gait: number;
  wingPh: number;
  flapK: number;
  bank: number;
  act: Act;
  actT: number;
  look: number;
  lookT: number;
  lookTimer: number;
  sitK: number;
  grazeK: number;
  lieK: number;
  sniffK: number;
  runK: number;
  climb: { spot: number; stage: 'go' | 'up' | 'hold' | 'down'; lift: number; top: number; t: number } | null;
  sq: { where: 'trunk' | 'ground'; lift: number; liftT: number; toGround: boolean; home: THREE.Vector3 } | null;
  rest: THREE.Vector3 | null;
}

interface Crew {
  def: AnimalDef;
  members: Member[];
  resident: boolean;
  forced: boolean;
  born: number;
  leaving: boolean;
  gone: boolean;
  timer: number;
  phase: 'air' | 'land' | 'rest';
  leader: THREE.Vector3;
  leaderTarget: THREE.Vector3;
  pause: number;
  enter: number;
  run: boolean;
}

export interface EcoInfo {
  id: string;
  name: string;
  count: number;
  resident: boolean;
}

export interface EcoCaps {
  stage: number;
  groups: number;
  members: number;
  maxSize: string;
  visitorGroups: number;
  visitorMembers: number;
  residentGroups: number;
}

function faceYaw(dir: THREE.Vector3): number {
  return Math.atan2(-dir.z, dir.x);
}

function groundY(x: number, z: number): number {
  const r = Math.hypot(x, z);
  if (r > ISLAND_R) return -0.02;
  return 0.02 + 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
}

const AGILE = new Set(['muntjac', 'leopardcat', 'otter', 'macaque', 'civet', 'smallcivet', 'ferretbadger']);

function idlesFor(def: AnimalDef): Act[] {
  const f = def.look.f ?? [];
  if (def.look.kind === 'monkey') return ['sit', 'sit', 'groom', 'look', 'climb', 'climb'];
  if (def.look.kind === 'bird') return def.motion === 'wade' ? ['strike', 'look', 'preen', 'strike'] : ['peck', 'peck', 'look', 'preen'];
  if (def.look.kind !== 'quad') return ['look'];
  if (f.includes('cowTail')) return ['graze', 'graze', 'look', 'lie'];
  if (f.includes('antlers')) return ['graze', 'graze', 'look'];
  if (f.includes('catEars')) return ['sit', 'look', 'sniff', 'sit'];
  if (def.id === 'otter') return ['sit', 'sniff', 'look'];
  return ['sniff', 'sniff', 'look', 'graze'];
}

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const basis = new THREE.Matrix4();
const bx = new THREE.Vector3();
const by3 = new THREE.Vector3();
const bz = new THREE.Vector3();

/** Orient `obj` so its forward (+x) is `fwd` and its back (+y) is `back`. */
function orient(obj: THREE.Object3D, fwd: THREE.Vector3, back: THREE.Vector3): void {
  bx.copy(fwd).normalize();
  bz.crossVectors(bx, back).normalize();
  by3.crossVectors(bz, bx).normalize();
  basis.makeBasis(bx, by3, bz);
  obj.quaternion.setFromRotationMatrix(basis);
}

export class Animals3D {
  /** World-space root (animals are positioned in world space; perches follow the swaying tree). */
  readonly root = new THREE.Group();
  private crews: Crew[] = [];
  private tree: TreeBuild | null = null;
  private pool: string[] = [];
  private residents: string[] = [];
  private night = false;
  private weak = false;
  private stage = 0;
  private islandR = ISLAND_R;
  private nextRotate = 8;
  private nextArrival = 3;
  private time = 0;
  private fly = fireflies();
  private perchTaken = new Set<number>();
  private rng = Math.random;

  constructor() {
    this.fly.points.visible = false;
    this.root.add(this.fly.points);
  }

  /** Radius of the (growing) island, so walkers can roam a little further on bigger islands. */
  setIslandRadius(r: number): void {
    this.islandR = r;
  }

  /** Update what may appear: every unlocked (seen) animal, the residents, day/night and the tree's stage. */
  sync(opts: { unlocked: string[]; residents: string[]; tree: TreeBuild; health: number; night: boolean; stage?: number }): void {
    const treeChanged = this.tree !== opts.tree;
    this.tree = opts.tree;
    this.pool = opts.unlocked.filter((id) => animalById(id));
    this.residents = opts.residents.filter((id) => animalById(id)).slice(0, 3);
    const nightChanged = this.night !== opts.night;
    this.night = opts.night;
    this.weak = opts.health < 22;
    const newStage = clamp(Math.round(opts.stage ?? this.stage), 0, 4);
    const stageChanged = newStage !== this.stage;
    this.stage = newStage;
    if (treeChanged) this.reseat();
    // Residents always present; drop crews that no longer fit (night/day, locked, weak tree, too big for the stage).
    for (const c of this.crews) {
      if (c.forced) continue;
      c.resident = this.residents.includes(c.def.id);
      if (!this.fits(c.def) || (!c.resident && !this.pool.includes(c.def.id))) this.retire(c);
      else if (!c.resident && !allowedAt(c.def, this.stage)) this.retire(c);
    }
    this.trimToCap();
    for (const id of this.residents) if (!this.crews.some((c) => c.def.id === id && !c.leaving) && this.fits(animalById(id)!)) this.spawn(id, { resident: true });
    if (nightChanged || stageChanged || this.visibleCrews().length === 0) this.fill();
  }

  private fits(def: AnimalDef): boolean {
    if (this.weak && !['butterfly', 'sparrow'].includes(def.id)) return false;
    if (def.motion === 'hollow' || def.motion === 'nest') return true;
    return this.night ? Boolean(def.night) || def.motion === 'glow' : !def.night;
  }

  private visibleCrews(): Crew[] {
    return this.crews.filter((c) => !c.leaving);
  }

  private visitors(): Crew[] {
    return this.visibleCrews().filter((c) => !c.resident && !c.forced);
  }

  private memberCount(): number {
    return this.crews.reduce((n, c) => n + c.members.length, 0);
  }

  private visitorMembers(): number {
    return this.visitors().reduce((n, c) => n + c.members.length, 0);
  }

  /** Retire the oldest visitors while over the stage's group/member cap. */
  private trimToCap(): void {
    const cap = stageCap(this.stage);
    const vs = this.visitors().sort((a, b) => a.born - b.born);
    let groups = vs.length;
    let members = vs.reduce((n, c) => n + c.members.length, 0);
    for (const c of vs) {
      if (groups <= cap.groups && members <= cap.members) break;
      this.retire(c);
      groups--;
      members -= c.members.length;
    }
  }

  private candidates(): string[] {
    return this.pool.filter((id) => {
      const d = animalById(id)!;
      return this.fits(d) && allowedAt(d, this.stage) && !this.crews.some((c) => c.def.id === id && !c.leaving);
    });
  }

  /** Top up the scene with random previously seen animals, within the stage's caps. */
  private fill(): void {
    const cap = stageCap(this.stage);
    let guard = 0;
    while (this.visitors().length < cap.groups && guard++ < 16) {
      const room = cap.members - this.visitorMembers();
      if (room < 1) break;
      const options = this.candidates();
      if (!options.length) break;
      this.spawn(options[Math.floor(this.rng() * options.length)]!, { room });
    }
  }

  /** Swap one visiting group for another (called on a timer and from the developer panel). */
  rotate(): void {
    const visitors = this.visitors();
    if (visitors.length) this.retire(visitors.sort((a, b) => a.born - b.born)[0]!);
    const options = this.candidates().filter((id) => !this.crews.some((c) => c.def.id === id));
    const room = stageCap(this.stage).members - this.visitorMembers();
    if (options.length && room >= 1) this.spawn(options[Math.floor(this.rng() * options.length)]!, { room });
    this.fill();
    this.nextRotate = this.time + 28 + this.rng() * 20;
  }

  info(): EcoInfo[] {
    return this.visibleCrews().map((c) => ({ id: c.def.id, name: c.def.name, count: c.members.length, resident: c.resident }));
  }

  /** Position and on-screen size of a visible member of `id` (for the developer follow-cam). */
  focus(id: string): { pos: THREE.Vector3; size: number; yaw: number } | null {
    const c = this.crews.find((x) => x.def.id === id && !x.leaving) ?? this.crews.find((x) => x.def.id === id);
    const m = c?.members[c.members.length > 1 ? 1 : 0];
    if (!c || !m) return null;
    return { pos: m.pos, size: m.scale * (c.def.look.kind === 'butterfly' ? 0.8 : 1.1), yaw: m.yaw };
  }

  caps(): EcoCaps {
    const cap = stageCap(this.stage);
    return {
      stage: this.stage,
      groups: cap.groups,
      members: cap.members,
      maxSize: SIZE_LABEL[cap.maxSize],
      visitorGroups: this.visitors().length,
      visitorMembers: this.visitorMembers(),
      residentGroups: this.visibleCrews().filter((c) => c.resident).length,
    };
  }

  private retire(c: Crew): void {
    if (c.leaving) return;
    c.leaving = true;
    c.timer = 0;
    for (const m of c.members) {
      if (m.perch >= 0) this.perchTaken.delete(m.perch);
      m.timer = 0;
      m.climb = null;
    }
  }

  /** Add a group of `id` (developer spawn ignores unlocks, caps and day/night). */
  spawn(id: string, opts: { resident?: boolean; forced?: boolean; room?: number } = {}): void {
    const def = animalById(id);
    const tree = this.tree;
    if (!def || !tree) return;
    if (opts.forced) {
      const old = this.crews.find((c) => c.def.id === id && !c.leaving);
      if (old) this.retire(old);
      if (this.memberCount() > MAX_MEMBERS - def.group[1]) {
        const v = this.visitors().sort((a, b) => a.born - b.born)[0];
        if (v) this.retire(v);
      }
    }
    let n = groupSize(def, opts.forced || opts.resident ? Math.max(this.stage, 3) : this.stage, this.rng);
    if (opts.room !== undefined) n = Math.min(n, opts.room);
    n = Math.max(1, Math.min(n, MAX_MEMBERS - this.memberCount()));
    const t = template(id);
    if (!t) return;
    const crew: Crew = {
      def,
      members: [],
      resident: Boolean(opts.resident),
      forced: Boolean(opts.forced),
      born: this.time,
      leaving: false,
      gone: false,
      timer: 0,
      phase: 'air',
      leader: new THREE.Vector3(),
      leaderTarget: new THREE.Vector3(),
      pause: 0,
      enter: 0,
      run: false,
    };
    const entry = this.entryPoint(def);
    crew.leader.copy(entry);
    crew.leaderTarget.copy(this.groundTarget(def));
    for (let i = 0; i < n; i++) {
      const obj = def.motion === 'nest' ? this.nestWithRobin(t) : t.clone();
      obj.rotation.order = 'YZX';
      const member: Member = {
        obj,
        rig: rigOf(obj),
        pos: entry.clone().add(new THREE.Vector3((this.rng() - 0.5) * 1.5, GROUND.has(def.motion) ? 0 : (this.rng() - 0.5) * 0.8, (this.rng() - 0.5) * 1.5)),
        prev: entry.clone(),
        target: entry.clone(),
        offset: new THREE.Vector3((this.rng() - 0.5) * 2, (this.rng() - 0.5) * 0.8, (this.rng() - 0.5) * 2),
        mode: FLYERS.has(def.motion) ? 'fly' : GROUND.has(def.motion) ? 'ground' : 'fixed',
        perch: -1,
        phase: this.rng() * 10,
        scale: 1,
        timer: this.rng() * 6,
        speed: 0.8 + this.rng() * 0.4,
        yaw: this.rng() * 6.28,
        moving: 0,
        spread: FLYERS.has(def.motion) ? 1 : 0,
        gait: this.rng() * 6.28,
        wingPh: this.rng() * 6.28,
        flapK: 1,
        bank: 0,
        act: 'none',
        actT: 1 + this.rng() * 3,
        look: 0,
        lookT: 0,
        lookTimer: this.rng() * 3,
        sitK: 0,
        grazeK: 0,
        lieK: 0,
        sniffK: 0,
        runK: 0,
        climb: null,
        sq: null,
        rest: null,
      };
      if (i > 0 && GROUND.has(def.motion)) member.offset.set(-0.6 - i * 0.5 + this.rng() * 0.3, 0, (i % 2 ? 1 : -1) * (0.4 + this.rng() * 0.4));
      // Shadows only for the bigger walkers (each rig is ~10–15 meshes; keep the shadow pass cheap on phones).
      if ((def.look.kind === 'quad' || def.look.kind === 'monkey') && (def.look.size ?? 1) >= 1) obj.traverse((o) => ((o as THREE.Mesh).isMesh && (o.castShadow = o.name === 'body' || o.name === 'head' || o.name === 'neck')));
      if (def.motion === 'glow') obj.visible = false;
      crew.members.push(member);
      this.root.add(obj);
    }
    if (def.motion === 'glow') this.fly.points.visible = true;
    this.crews.push(crew);
    this.assignSeats(crew);
  }

  private nestWithRobin(robin: THREE.Group): THREE.Group {
    const g = new THREE.Group();
    const nest = template('nest')!.clone();
    nest.name = 'nestMesh';
    const bird = robin.clone();
    bird.position.set(0.25, 0.18, 0.2);
    bird.scale.setScalar(0.95);
    foldWings(bird, 1);
    g.add(nest, bird);
    return g;
  }

  private scaleFor(def: AnimalDef): number {
    const V = this.tree ? Math.max(0.7, this.tree.height) : 1;
    const sky = 0.26 + 0.12 * V;
    const size = def.look.size ?? 1;
    if (GROUND.has(def.motion) && (def.look.kind === 'quad' || def.look.kind === 'monkey')) return clamp(0.4 + V * 0.08, 0.5, 1.6) * size;
    if (GROUND.has(def.motion)) return clamp(0.4 + V * 0.06, 0.5, 1.3) * size;
    if (def.look.kind === 'squirrel') return clamp(0.45 + V * 0.05, 0.5, 1.2) * size;
    if (def.category === 'insect' || def.category === 'butterfly' || def.category === 'reptile' || def.category === 'amphibian') return Math.max(0.32, sky * 0.9) * size;
    return sky * size;
  }

  private roam(): number {
    return ISLAND_R * 0.76 + Math.max(0, this.islandR - ISLAND_R) * 0.3;
  }

  private entryPoint(def: AnimalDef): THREE.Vector3 {
    const tree = this.tree!;
    const a = this.rng() * Math.PI * 2;
    if (GROUND.has(def.motion)) {
      const r = this.roam() * 1.08;
      const ang = 0.2 + this.rng() * 2.6;
      return new THREE.Vector3(Math.cos(ang) * r, groundY(Math.cos(ang) * r, Math.sin(ang) * r), Math.sin(ang) * r);
    }
    if (FLYERS.has(def.motion) && def.category === 'bird') {
      const r = tree.canopyRadius + 10;
      return new THREE.Vector3(Math.cos(a) * r, tree.height + 3 + this.rng() * 3, Math.sin(a) * r);
    }
    return new THREE.Vector3(Math.cos(a) * (tree.canopyRadius + 1), tree.height * 0.5, Math.sin(a) * (tree.canopyRadius + 1));
  }

  /** Random walkable point on the island, mostly on the camera side, away from the trunk. */
  private groundTarget(def: AnimalDef): THREE.Vector3 {
    const tree = this.tree!;
    const inner = Math.max(1.2, tree.trunkRadius * 3 + 0.9);
    const outer = this.roam();
    const wade = def.motion === 'wade';
    const ang = wade ? 0.3 + this.rng() * 0.9 : -0.3 + this.rng() * 3.8;
    const r = wade ? ISLAND_R * 0.76 * (0.75 + this.rng() * 0.2) : inner + this.rng() * (outer - inner);
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    return new THREE.Vector3(x, groundY(x, z), z);
  }

  /** Give perchers perches, climbers trunk spots; re-run after the tree rebuilds. */
  private assignSeats(crew: Crew): void {
    const tree = this.tree!;
    for (const m of crew.members) {
      m.scale = this.scaleFor(crew.def) * (0.9 + this.rng() * 0.2);
      m.obj.scale.setScalar(m.scale);
      m.climb = null;
      if (crew.def.motion === 'perch' || crew.def.motion === 'flock' || (crew.def.motion === 'crawl' && crew.def.spot === 'leaf')) {
        m.perch = this.freePerch(tree);
      }
      if (crew.def.motion === 'climb' || (crew.def.motion === 'crawl' && crew.def.spot === 'trunk')) m.perch = Math.floor(this.rng() * Math.max(1, tree.trunkSpots.length));
      if (crew.def.look.kind === 'squirrel') {
        const s = tree.trunkSpots[m.perch % Math.max(1, tree.trunkSpots.length)];
        const sy = s ? s.pos.y : 0.5;
        m.sq = { where: 'trunk', lift: 0, liftT: 0, toGround: false, home: new THREE.Vector3() };
        m.sq.lift = m.sq.liftT = sy * 0.3;
      }
    }
  }

  private freePerch(tree: TreeBuild): number {
    const n = tree.perches.length;
    if (!n) return -1;
    for (let tries = 0; tries < n; tries++) {
      const i = Math.floor(this.rng() * Math.min(n, 16));
      if (!this.perchTaken.has(i)) {
        this.perchTaken.add(i);
        return i;
      }
    }
    return Math.floor(this.rng() * n);
  }

  private reseat(): void {
    this.perchTaken.clear();
    for (const c of this.crews) this.assignSeats(c);
  }

  private perchWorld(i: number, out: THREE.Vector3): THREE.Vector3 {
    const tree = this.tree!;
    const p = tree.perches[i] ?? tree.perches[0];
    if (!p) return out.set(0, tree.height, 0);
    return tree.group.localToWorld(out.copy(p.pos));
  }

  private trunkWorld(i: number, lift: number, out: THREE.Vector3, off = 0): THREE.Vector3 {
    const tree = this.tree!;
    const s = tree.trunkSpots[i % Math.max(1, tree.trunkSpots.length)];
    if (!s) return out.set(0, 1, 0.3);
    out.copy(s.pos).addScaledVector(s.out, off);
    out.y += lift;
    return tree.group.localToWorld(out);
  }

  /** Trunk height (trunk spots sit at 30/50/70 % of it). */
  private trunkTop(): number {
    const spots = this.tree!.trunkSpots;
    let top = 0;
    for (const s of spots) top = Math.max(top, s.pos.y);
    return top > 0 ? top / 0.7 : Math.max(1, this.tree!.height * 0.5);
  }

  private trunkOut(i: number): THREE.Vector3 {
    const tree = this.tree!;
    const s = tree.trunkSpots[i % Math.max(1, tree.trunkSpots.length)];
    return tmp2.copy(s ? s.out : new THREE.Vector3(0, 0, 1)).transformDirection(tree.group.matrixWorld);
  }

  /** Lowest trunk spot index facing roughly toward `p`. */
  private trunkSpotNear(p: THREE.Vector3): number {
    const tree = this.tree!;
    let best = 0;
    let bestD = Infinity;
    tree.trunkSpots.forEach((s, i) => {
      const d = s.pos.y * 3 + Math.hypot(s.pos.x + s.out.x - p.x, s.pos.z + s.out.z - p.z);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  update(t: number, dt: number, night: number): void {
    this.time = t;
    const tree = this.tree;
    if (!tree) return;
    if (t > this.nextRotate) {
      if (this.crews.length) this.rotate();
      else this.fill();
    }
    // New visitors drift in one group at a time until the stage's cap is reached.
    if (t > this.nextArrival) {
      this.nextArrival = t + 5 + this.rng() * 5;
      const cap = stageCap(this.stage);
      const room = cap.members - this.visitorMembers();
      if (this.visitors().length < cap.groups && room >= 1) {
        const options = this.candidates();
        if (options.length) this.spawn(options[Math.floor(this.rng() * options.length)]!, { room });
      }
    }
    for (const c of this.crews) this.step(c, t, dt);
    for (const c of this.crews.filter((x) => x.gone)) {
      for (const m of c.members) this.root.remove(m.obj);
      if (c.def.motion === 'glow') this.fly.points.visible = false;
    }
    this.crews = this.crews.filter((c) => !c.gone);
    if (this.fly.points.visible) this.updateFireflies(t, night);
  }

  private step(c: Crew, t: number, dt: number): void {
    const tree = this.tree!;
    const def = c.def;
    c.timer += dt;
    const k = (rate: number) => 1 - Math.exp(-dt * rate);
    const H = Math.max(1, tree.height);
    const R = Math.max(1.2, tree.canopyRadius);
    const leaveDone = () => {
      c.gone = true;
    };

    // Flock phases: air → land → rest → air.
    if (def.motion === 'flock' && !c.leaving) {
      if (c.phase === 'air' && c.timer > 14 + (c.born % 5)) {
        c.phase = 'land';
        c.timer = 0;
        for (const m of c.members) if (m.perch < 0 || !tree.perches[m.perch]) m.perch = this.freePerch(tree);
      } else if (c.phase === 'land' && c.timer > 12) {
        c.phase = 'air';
        c.timer = 0;
      }
    }
    // Ground leader wanders, sometimes breaking into a run.
    if (GROUND.has(def.motion)) {
      if (c.leaving) c.leaderTarget.copy(this.entryPoint(def));
      tmp.subVectors(c.leaderTarget, c.leader).setY(0);
      const dist = tmp.length();
      const big = (def.look.size ?? 1) > 1.8;
      let speed = (def.motion === 'wade' ? 0.35 : def.motion === 'hop' ? 0.7 : big ? 0.45 : 0.75) * clamp(0.6 + H * 0.05, 0.6, 1.4);
      if (c.run || c.leaving) speed *= AGILE.has(def.id) ? 2.6 : 1.6;
      if (dist < 0.15) {
        if (c.leaving) leaveDone();
        c.pause -= dt;
        if (c.pause <= 0) {
          c.leaderTarget.copy(this.groundTarget(def));
          c.pause = 3 + this.rng() * 7;
          c.run = AGILE.has(def.id) && this.rng() < 0.3;
        }
      } else if (c.pause > 0 && !c.leaving) {
        c.pause -= dt;
      } else {
        c.leader.addScaledVector(tmp.normalize(), Math.min(dist, speed * dt));
        c.leader.y = groundY(c.leader.x, c.leader.z);
      }
    }

    c.members.forEach((m, i) => {
      m.prev.copy(m.pos);
      const ph = t + m.phase;
      let flap = 0;
      let perched = false;
      switch (def.motion) {
        case 'perch':
        case 'flock': {
          const air = c.leaving || (def.motion === 'flock' ? c.phase === 'air' : Math.sin(ph * 0.12 + i) > 0.93);
          if (c.leaving) {
            m.target.set(Math.cos(m.phase) * (R + 14), H + 6, Math.sin(m.phase) * (R + 14));
            if (m.pos.distanceTo(m.target) < 1.5) leaveDone();
          } else if (air) {
            const a = t * (def.motion === 'flock' ? 0.45 : 0.9) + (def.motion === 'flock' ? 0 : m.phase);
            const rr = R + 1.2 + (def.motion === 'flock' ? 1.5 : 0.5);
            c.leader.set(Math.cos(a) * rr, H * 0.8 + 0.6 + Math.sin(t * 0.7) * 0.5, Math.sin(a) * rr);
            m.target.copy(c.leader).add(tmp2.copy(m.offset).multiplyScalar(def.motion === 'flock' ? m.scale * 3 : 0));
          } else {
            this.perchWorld(m.perch, m.target);
            perched = m.pos.distanceTo(m.target) < 0.12 * Math.max(1, m.scale * 3);
          }
          m.pos.lerp(m.target, k(perched ? 20 : air ? 2.2 : 3));
          if (perched) m.pos.copy(m.target);
          flap = perched ? 0 : 1;
          break;
        }
        case 'soar': {
          if (c.leaving) {
            m.target.set(Math.cos(m.phase) * 40, H + 14, Math.sin(m.phase) * 40);
            if (m.pos.distanceTo(m.target) < 3) leaveDone();
          } else {
            const a = t * 0.16 + m.phase;
            const rr = Math.max(5, R + 3.5) + i * 1.2;
            m.target.set(Math.cos(a) * rr, H + 2.5 + Math.sin(t * 0.3 + i) * 0.8, Math.sin(a) * rr);
          }
          m.pos.lerp(m.target, k(1.4));
          flap = 1;
          break;
        }
        case 'hover':
        case 'flutter':
        case 'bat': {
          const bfly = def.look.kind === 'butterfly';
          if (c.leaving) {
            m.rest = null;
            m.target.set(Math.cos(m.phase) * (R + 8), H * 0.7 + 3, Math.sin(m.phase) * (R + 8));
            if (m.pos.distanceTo(m.target) < 1) leaveDone();
          } else if (def.motion === 'hover') {
            m.timer -= dt;
            if (m.timer <= 0) {
              const spot = tree.perches[Math.floor(this.rng() * Math.max(1, tree.perches.length))];
              if (spot) tree.group.localToWorld(m.target.copy(spot.pos).addScaledVector(spot.out, 0.3 + this.rng() * 0.4 * Math.max(1, H * 0.1)));
              else m.target.set((this.rng() - 0.5) * 2, 1, (this.rng() - 0.5) * 2);
              m.timer = 0.8 + this.rng() * 1.6;
            }
          } else if (bfly && m.rest) {
            // Settled on a leaf or a flower: slow wing opening, then off again.
            m.target.copy(m.rest);
            m.timer -= dt;
            if (m.timer <= 0) {
              m.rest = null;
              m.timer = 6 + this.rng() * 8;
            }
          } else {
            const speed = def.motion === 'bat' ? 0.9 : 0.35;
            const a = t * speed * m.speed + m.phase * 2;
            const low = bfly && i % 2 === 1;
            const rr = (low ? R * 0.6 + 1.2 : R + 0.4) + Math.sin(ph * 0.7) * 0.4;
            const y = low ? 0.5 + Math.sin(ph * 1.3) * 0.3 : H * (def.motion === 'bat' ? 0.75 : 0.5) + Math.sin(ph * 1.1) * H * 0.12;
            m.target.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
            if (bfly) {
              m.timer -= dt;
              if (m.timer <= 0 && c.enter >= 1) {
                // Pick somewhere to land: a canopy leaf (high flyers) or the ground near a flower (low flyers).
                if (low) {
                  const g = this.groundTarget(def);
                  m.rest = g.setY(g.y + 0.04);
                } else if (tree.perches.length) m.rest = this.perchWorld(Math.floor(this.rng() * tree.perches.length), new THREE.Vector3());
                m.timer = 3 + this.rng() * 4;
              }
            }
          }
          const settled = bfly && m.rest !== null && m.pos.distanceTo(m.target) < 0.08;
          m.pos.lerp(m.target, k(def.motion === 'hover' ? 4 : bfly && m.rest ? 3.5 : 2.5));
          if (settled) m.pos.copy(m.target);
          perched = settled;
          flap = settled ? 0 : 1;
          break;
        }
        case 'walk':
        case 'hop':
        case 'wade': {
          if (m.climb && def.look.kind === 'monkey') {
            this.stepClimb(c, m, dt);
            break;
          }
          tmp.copy(m.offset).applyAxisAngle(UP, c.members[0]!.yaw);
          m.target.copy(c.leader).add(i === 0 ? tmp.set(0, 0, 0) : tmp.multiplyScalar(m.scale));
          m.target.y = groundY(m.target.x, m.target.z);
          m.pos.lerp(m.target, k(i === 0 ? 30 : 2.5));
          if (def.motion === 'hop') {
            const moving = m.prev.distanceTo(m.pos) / Math.max(1e-4, dt);
            m.pos.y = groundY(m.pos.x, m.pos.z) + Math.abs(Math.sin(ph * 5)) * 0.15 * m.scale * Math.min(1, moving / 0.3);
          }
          break;
        }
        case 'climb': {
          if (m.sq) this.stepSquirrel(c, m, dt, ph);
          else {
            const lift = Math.sin(ph * 0.25) * 0.4 * Math.max(0.5, H * 0.08);
            this.trunkWorld(m.perch, lift, m.target, m.scale * 0.15);
            m.pos.lerp(m.target, k(c.enter < 1 ? 3 : 8));
          }
          break;
        }
        case 'crawl': {
          if (def.spot === 'trunk') this.trunkWorld(m.perch, Math.sin(ph * 0.1) * 0.1, m.target, m.scale * 0.05);
          else if (def.spot === 'leaf') this.perchWorld(m.perch, m.target);
          else {
            if (m.timer <= 0 || m.target.lengthSq() === 0) {
              m.target.copy(this.groundTarget(def));
              m.timer = 6 + this.rng() * 8;
            }
            m.timer -= dt;
            tmp.subVectors(m.target, m.pos).setY(0);
            const d = tmp.length();
            if (d > 0.05) m.pos.addScaledVector(tmp.normalize(), Math.min(d, 0.12 * dt));
            m.pos.y = groundY(m.pos.x, m.pos.z);
            break;
          }
          if (c.enter < 1) m.pos.copy(m.target);
          else m.pos.lerp(m.target, k(10));
          break;
        }
        case 'nest': {
          if (tree.nest) tree.group.localToWorld(m.pos.copy(tree.nest.pos).add(new THREE.Vector3(0, tree.trunkRadius * 0.3, 0)));
          else this.perchWorld(0, m.pos);
          break;
        }
        case 'hollow': {
          if (tree.hollow) tree.group.localToWorld(m.pos.copy(tree.hollow.pos).add(new THREE.Vector3(0, -m.scale * 0.35, 0)));
          else this.perchWorld(1, m.pos);
          break;
        }
        case 'glow':
          m.pos.set(0, H * 0.5, 0);
          break;
      }
      m.moving = m.prev.distanceTo(m.pos) / Math.max(1e-4, dt);
      // Grow in / shrink out for non-travelling animals.
      const popper = !FLYERS.has(def.motion) && !GROUND.has(def.motion);
      let s = m.scale;
      if (popper) {
        const e = c.leaving ? 1 - clamp(c.timer / 0.8, 0, 1) : clamp(c.timer / 0.8, 0, 1);
        s *= Math.max(0.001, e);
        if (c.leaving && c.timer > 0.8) leaveDone();
      }
      m.obj.scale.setScalar(s);
      m.obj.position.copy(m.pos);
      this.pose(c, m, i, dt, ph, flap, perched);
    });
    c.enter = Math.min(1, c.enter + dt * 0.6);
  }

  /** Macaque climbing the trunk: walk to the base, climb up, look around, climb down. */
  private stepClimb(c: Crew, m: Member, dt: number): void {
    const cl = m.climb!;
    const tree = this.tree!;
    const s = tree.trunkSpots[cl.spot];
    if (!s || c.leaving) {
      m.climb = null;
      return;
    }
    const groundLift = -s.pos.y + 0.02;
    if (cl.stage === 'go') {
      this.trunkWorld(cl.spot, groundLift, m.target, m.scale * 0.35);
      m.target.y = groundY(m.target.x, m.target.z);
      tmp.subVectors(m.target, m.pos).setY(0);
      const d = tmp.length();
      const v = 0.9 * m.scale;
      if (d > 0.05) m.pos.addScaledVector(tmp.normalize(), Math.min(d, v * dt));
      m.pos.y = groundY(m.pos.x, m.pos.z);
      cl.t += dt;
      if (d <= 0.06 || cl.t > 12) {
        cl.stage = 'up';
        cl.lift = groundLift;
      }
      return;
    }
    const v = 0.55 * m.scale;
    if (cl.stage === 'up') {
      cl.lift = Math.min(cl.top, cl.lift + v * dt);
      if (cl.lift >= cl.top) {
        cl.stage = 'hold';
        cl.t = 2.5 + this.rng() * 3;
      }
    } else if (cl.stage === 'hold') {
      cl.t -= dt;
      if (cl.t <= 0) cl.stage = 'down';
    } else {
      cl.lift = Math.max(groundLift, cl.lift - v * dt);
      if (cl.lift <= groundLift) {
        this.trunkWorld(cl.spot, groundLift, m.pos, m.scale * 0.35);
        m.pos.y = groundY(m.pos.x, m.pos.z);
        m.climb = null;
        m.act = 'none';
        m.actT = 4 + this.rng() * 4;
        return;
      }
    }
    this.trunkWorld(cl.spot, cl.lift, m.pos, 0.01);
  }

  /** Squirrel: bounds up and down the trunk, sometimes hops about on the ground and sits up. */
  private stepSquirrel(c: Crew, m: Member, dt: number, ph: number): void {
    const sq = m.sq!;
    const tree = this.tree!;
    const s = tree.trunkSpots[m.perch % Math.max(1, tree.trunkSpots.length)];
    const sy = s ? s.pos.y : 0.5;
    const groundLift = -sy + 0.02;
    const topLift = Math.max(0.3, this.trunkTop() * 0.85 - sy);
    m.timer -= dt;
    if (sq.where === 'trunk') {
      if (m.timer <= 0 && Math.abs(sq.lift - sq.liftT) < 0.02) {
        sq.toGround = this.rng() < 0.3;
        sq.liftT = sq.toGround ? groundLift : groundLift + 0.3 + this.rng() * (topLift - groundLift - 0.3);
        m.timer = 1.2 + this.rng() * 2.5;
      }
      const d = sq.liftT - sq.lift;
      const bound = Math.max(0, Math.sin(m.gait)) * 2;
      const v = 1.1 * m.scale * bound;
      sq.lift += Math.sign(d) * Math.min(Math.abs(d), v * dt);
      this.trunkWorld(m.perch, sq.lift, m.pos, 0.01);
      if (sq.toGround && Math.abs(sq.lift - groundLift) < 0.02) {
        sq.where = 'ground';
        this.trunkWorld(m.perch, groundLift, sq.home, m.scale * 0.3);
        sq.home.y = groundY(sq.home.x, sq.home.z);
        m.pos.copy(sq.home);
        const out = this.trunkOut(m.perch);
        const a = Math.atan2(out.z, out.x) + (this.rng() - 0.5) * 1.6;
        const r = 0.8 + this.rng() * 1.5;
        m.target.set(sq.home.x + Math.cos(a) * r, 0, sq.home.z + Math.sin(a) * r);
        m.target.y = groundY(m.target.x, m.target.z);
        m.timer = 0;
        m.act = 'none';
      }
      return;
    }
    // On the ground: hop toward the target, sit up and nibble, then head home.
    tmp.subVectors(m.target, m.pos).setY(0);
    const d = tmp.length();
    if (d > 0.04 && m.act !== 'sit') {
      const hop = Math.max(0, Math.sin(m.gait));
      m.pos.addScaledVector(tmp.normalize(), Math.min(d, 1.3 * m.scale * hop * 2 * dt));
      m.pos.y = groundY(m.pos.x, m.pos.z) + hop * 0.1 * m.scale;
    } else {
      m.pos.y = groundY(m.pos.x, m.pos.z);
      if (m.act !== 'sit') {
        m.act = 'sit';
        m.actT = 1.5 + this.rng() * 2.5;
      }
      m.actT -= dt;
      if (m.actT <= 0) {
        m.act = 'none';
        if (m.target.distanceTo(sq.home) < 0.05 || c.leaving) {
          sq.where = 'trunk';
          sq.lift = groundLift;
          sq.liftT = groundLift + 0.4 + this.rng() * (topLift - groundLift - 0.4);
          sq.toGround = false;
          m.timer = 2;
        } else if (this.rng() < 0.5) {
          m.target.copy(sq.home);
        } else {
          const a = this.rng() * Math.PI * 2;
          m.target.set(sq.home.x + Math.cos(a) * 1.2, 0, sq.home.z + Math.sin(a) * 1.2);
          m.target.y = groundY(m.target.x, m.target.z);
        }
      }
    }
    void ph;
  }

  private pose(c: Crew, m: Member, i: number, dt: number, ph: number, flap: number, perched: boolean): void {
    const def = c.def;
    const vel = tmp.subVectors(m.pos, m.prev);
    const tree = this.tree!;
    const r = m.rig;
    const toward = (dir: THREE.Vector3, rate = 6) => {
      if (dir.lengthSq() < 1e-8) return;
      const want = faceYaw(dir);
      let d = want - m.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      m.yaw += d * Math.min(1, dt * rate);
      return d;
    };
    // Head glances: every few seconds pick a new direction to look.
    m.lookTimer -= dt;
    if (m.lookTimer <= 0) {
      m.lookT = (this.rng() - 0.5) * 1.5;
      m.lookTimer = 1.2 + this.rng() * 3;
    }
    m.look += (m.lookT - m.look) * Math.min(1, dt * 4);

    if (def.motion === 'nest' || def.motion === 'hollow') {
      const out = def.motion === 'nest' ? tree.nest?.out : tree.hollow?.out;
      m.obj.rotation.set(0, faceYaw(out ?? new THREE.Vector3(0.3, 0, 1)), 0);
      if (def.motion === 'nest') {
        const bird = m.obj.children[1];
        if (bird) bird.rotation.y = Math.sin(ph * 0.7) > 0.6 ? 0.5 : 0;
      }
      return;
    }
    // Squirrel.
    if (m.sq) {
      const sq = m.sq;
      const localSpeed = m.moving / Math.max(0.05, m.scale);
      m.gait += dt * (sq.where === 'trunk' ? 9 : 8) * (sq.where === 'trunk' && Math.abs(sq.liftT - sq.lift) < 0.02 ? 0.2 : 1);
      m.sitK += ((m.act === 'sit' ? 1 : 0) - m.sitK) * Math.min(1, dt * 6);
      if (sq.where === 'trunk') {
        const out = this.trunkOut(m.perch).clone();
        const down = sq.liftT < sq.lift - 0.02;
        orient(m.obj, down ? tmp.set(0, -1, 0) : tmp.set(0, 1, 0), out);
        poseBody(r, { gait: m.gait, walk: Math.abs(sq.liftT - sq.lift) > 0.02 ? 1 : 0, run: 1, sit: 0, graze: 0, lie: 0, look: m.look, t: ph, sniff: 0 });
      } else {
        m.obj.quaternion.identity();
        if (vel.lengthSq() > 1e-8) toward(vel.clone().setY(0), 10);
        m.obj.rotation.set(0, m.yaw, 0);
        poseBody(r, { gait: m.gait, walk: localSpeed > 0.05 ? 1 : 0, run: 1, sit: m.sitK, graze: 0, lie: 0, look: m.look, t: ph, sniff: m.sitK * 0.5 });
      }
      return;
    }
    // Monkey on the trunk.
    if (m.climb && m.climb.stage !== 'go') {
      const out = this.trunkOut(m.climb.spot).clone();
      const down = m.climb.stage === 'down';
      orient(m.obj, down ? tmp.set(0, -1, 0) : tmp.set(0, 1, 0), out);
      const moving = m.climb.stage !== 'hold';
      m.gait += dt * 6 * (moving ? 1 : 0);
      poseBody(r, { gait: m.gait, walk: moving ? 1 : 0.1, run: 0, sit: 0, graze: 0, lie: 0, look: moving ? 0 : m.look * 1.3, t: ph, sniff: 0 });
      for (const l of r.legs) l.up.rotation.x = (l.up.position.z > 0 ? -1 : 1) * 0.35;
      return;
    }
    if (def.motion === 'climb' || (def.motion === 'crawl' && def.spot === 'trunk')) {
      const s = tree.trunkSpots[m.perch % Math.max(1, tree.trunkSpots.length)];
      const out = s ? s.out : new THREE.Vector3(0, 0, 1);
      m.obj.rotation.set(0, 0, 0);
      m.obj.rotation.y = faceYaw(out) + Math.PI / 2;
      m.obj.rotateZ(Math.PI / 2 - 0.15);
      m.obj.rotateY(Math.PI);
      if (def.look.kind === 'bird') foldWings(m.obj, 1);
      if (r.head) r.head.rotation.z = def.id === 'woodpecker' ? Math.max(0, Math.sin(ph * 14)) * 0.3 * (Math.sin(ph * 0.5) > 0.3 ? 1 : 0) : Math.sin(ph * 0.6) * 0.2;
      if (r.tails[0]) r.tails[0].rotation.z = (r.tailRest[0] ?? 0) + Math.sin(ph * 2.2) * 0.15;
      return;
    }
    if (def.motion === 'crawl') {
      if (def.spot === 'leaf') {
        const p = tree.perches[m.perch];
        m.obj.rotation.set(0, p ? faceYaw(p.out) : 0, 0);
      } else {
        toward(vel.setY(0));
        m.obj.rotation.set(0, m.yaw, 0);
      }
      const walking = m.moving > 0.02;
      m.gait += dt * 10 * (walking ? 1 : 0);
      r.legs.forEach((l, j) => (l.up.rotation.y = walking ? Math.sin(m.gait + (j === 0 || j === 3 ? 0 : Math.PI)) * 0.45 : 0));
      if (r.head) r.head.rotation.y = m.look * 0.5;
      if (r.tails[0]) r.tails[0].rotation.y = Math.sin(ph * 1.5) * 0.2 + (walking ? Math.sin(m.gait) * 0.2 : 0);
      return;
    }
    if (GROUND.has(def.motion)) {
      this.poseGround(c, m, i, dt, ph, vel, toward);
      return;
    }
    // Flyers.
    const bird = def.look.kind === 'bird';
    const bfly = def.look.kind === 'butterfly';
    let pitch = 0;
    if (perched) {
      if (bfly) {
        const p = tree.perches[m.perch];
        toward(p ? p.out.clone().setY(0) : new THREE.Vector3(0.3, 0, 1), 2);
      } else {
        const p = tree.perches[m.perch];
        const face = p ? p.out.clone().setY(0).normalize().lerp(new THREE.Vector3(0.3, 0, 1), 0.6) : new THREE.Vector3(0.3, 0, 1);
        toward(face);
      }
      m.bank *= 0.9;
      m.obj.rotation.set(0, m.yaw, 0);
    } else {
      const turn = toward(vel.clone().setY(0)) ?? 0;
      pitch = clamp((vel.y / Math.max(1e-4, dt)) * 0.08, -0.5, 0.5);
      const wantBank = def.motion === 'soar' ? 0.35 : clamp(-turn * 4, -0.5, 0.5);
      m.bank += (wantBank - m.bank) * Math.min(1, dt * 3);
    }
    // Landing flare: pitch up and beat hard just before touching down.
    const dist = m.pos.distanceTo(m.target);
    const landing = bird && !perched && !c.leaving && (def.motion === 'perch' || (def.motion === 'flock' && c.phase === 'land')) && dist < 1.2 * Math.max(0.5, m.scale * 3);
    if (landing) pitch = 0.6;
    if (!perched) m.obj.rotation.set(m.bank, m.yaw, pitch);
    const spreadWant = perched ? 0 : 1;
    m.spread += (spreadWant - m.spread) * Math.min(1, dt * (landing ? 5 : 8));
    if (bird) {
      // Flap bursts and glides; raptors mostly glide on the thermals.
      let want = flap;
      let rate = 15;
      if (!perched) {
        if (def.motion === 'soar') {
          want = Math.sin(ph * 0.35) > 0.82 ? 1 : 0;
          rate = 5;
        } else if (landing) {
          want = 1;
          rate = 22;
        } else if (m.spread < 0.9) {
          want = 1;
          rate = 20;
        } else want = Math.sin(ph * 0.9 + i * 1.3) > -0.35 ? 1 : 0;
      }
      m.flapK += (want - m.flapK) * Math.min(1, dt * 5);
      m.wingPh += dt * rate;
      const amp = def.motion === 'soar' ? 0.45 : 0.85;
      const f = Math.sin(m.wingPh) * amp * m.flapK;
      const f2 = Math.sin(m.wingPh - 0.8) * amp * 0.8 * m.flapK;
      poseWings(r, m.spread, f, f2, (1 - m.flapK) * 0.12);
      if (perched) {
        // Perched: head glances, the odd preen and wing stretch, tail flicks.
        const preen = Math.sin(ph * 0.3 + i) > 0.9;
        if (r.head) r.head.rotation.set(0, preen ? 1.9 : m.look, preen ? -0.5 : Math.sin(ph * 2.3) > 0.97 ? -0.3 : 0);
        if (Math.sin(ph * 0.45) > 0.96) {
          const ff = Math.sin(ph * 30) * 0.6;
          poseWings(r, 0.45, ff, ff, 0);
        }
        if (r.tails[0]) r.tails[0].rotation.z = (r.tailRest[0] ?? 0) + Math.max(0, Math.sin(ph * 3)) * (Math.sin(ph * 0.7) > 0.5 ? 0.25 : 0.03);
      } else {
        if (r.head) r.head.rotation.set(0, clamp(-m.bank, -0.4, 0.4), 0);
        if (r.tails[0]) r.tails[0].rotation.z = r.tailRest[0] ?? 0;
      }
      for (const l of r.legs) l.up.rotation.z = perched ? 0 : landing ? 0.5 : -1.1;
    } else if (bfly) {
      // Butterflies: V-shaped wing beats with short glides; resting wings open and close slowly.
      let a: number;
      if (perched) a = 0.2 + (0.5 + 0.5 * Math.sin(ph * 1.4)) * 1.2;
      else {
        m.wingPh += dt * (Math.sin(ph * 0.6 + i) > 0.75 ? 3 : 15);
        a = 0.15 + (0.5 + 0.5 * Math.sin(m.wingPh)) * 1.2;
      }
      r.wingL?.rotation.set(-a, 0, 0);
      r.wingR?.rotation.set(a, 0, 0);
    } else {
      const isInsect = def.category === 'insect';
      const rate = def.look.kind === 'bee' || def.look.kind === 'dragonfly' ? 60 : isInsect ? 14 : def.look.kind === 'bat' ? 11 : 16;
      const amp = isInsect ? 0.35 : 0.8;
      m.wingPh += dt * rate;
      const f = Math.sin(m.wingPh) * amp * flap;
      if (r.wingL) r.wingL.rotation.x = f;
      if (r.wingR) r.wingR.rotation.x = -f;
    }
  }

  /** Walkers, hoppers and waders: gait from real speed, idle behaviours when the group pauses. */
  private poseGround(c: Crew, m: Member, i: number, dt: number, ph: number, vel: THREE.Vector3, toward: (d: THREE.Vector3, rate?: number) => number | undefined): void {
    const def = c.def;
    const r = m.rig;
    const localSpeed = m.moving / Math.max(0.05, m.scale);
    const walking = localSpeed > 0.08;
    if (walking) toward(vel.clone().setY(0), 5);
    else if (i > 0) toward(tmp2.subVectors(c.members[0]!.pos, m.pos).setY(0), 1.5);
    m.obj.quaternion.identity();
    m.obj.rotation.set(0, m.yaw, 0);
    // Idle behaviour state machine.
    m.actT -= dt;
    if (walking && m.act !== 'climb') {
      if (m.act !== 'none') m.actT = 0.5 + this.rng();
      m.act = 'none';
    } else if (m.actT <= 0) {
      if (m.act !== 'none') {
        m.act = 'none';
        m.actT = 1 + this.rng() * 2.5;
      } else if (!c.leaving) {
        const list = idlesFor(def);
        let act = list[Math.floor(this.rng() * list.length)]!;
        if (act === 'climb') {
          if (i > 0 && this.tree!.trunkSpots.length && c.pause > 6) {
            const spot = this.trunkSpotNear(m.pos);
            const s = this.tree!.trunkSpots[spot]!;
            m.climb = { spot, stage: 'go', lift: 0, top: Math.max(0.3, this.trunkTop() * (0.35 + this.rng() * 0.35) - s.pos.y), t: 0 };
          } else act = 'sit';
        }
        m.act = act;
        m.actT = act === 'lie' ? 8 + this.rng() * 8 : 2.5 + this.rng() * 4;
      }
    }
    const want = (a: Act) => (m.act === a ? 1 : 0);
    const e = Math.min(1, dt * 3);
    m.sitK += (want('sit') + want('groom') - m.sitK) * e;
    m.grazeK += (want('graze') - m.grazeK) * e;
    m.lieK += (want('lie') - m.lieK) * Math.min(1, dt * 1.5);
    m.sniffK += (want('sniff') - m.sniffK) * e;
    const running = c.run || c.leaving;
    m.runK += ((running && walking ? 1 : 0) - m.runK) * e;
    if (def.look.kind === 'bird') {
      // Ground birds: waders step, small birds hop with both feet together.
      const hop = def.motion === 'hop';
      m.gait += dt * localSpeed * (hop ? 10 : 7);
      const step = walking && !hop ? Math.sin(m.gait) * 0.5 : 0;
      r.legs.forEach((l, j) => (l.up.rotation.z = j === 0 ? step : -step));
      poseWings(r, 0, 0, 0, 0);
      const strike = m.act === 'strike' ? Math.max(0, Math.sin(clamp(1 - m.actT / 1.2, 0, 1) * Math.PI)) : 0;
      const peck = m.act === 'peck' ? Math.max(0, Math.sin(ph * 7)) : 0;
      const preen = m.act === 'preen' ? 1 : 0;
      if (r.head) r.head.rotation.set(0, preen ? 1.9 : m.look * (walking ? 0.3 : 1), -strike * 1.0 - peck * 0.7 - preen * 0.4 + (walking ? Math.sin(m.gait * 2) * 0.12 : 0));
      if (r.tails[0]) r.tails[0].rotation.z = (r.tailRest[0] ?? 0) + (def.id === 'wagtail' ? Math.sin(ph * 9) * 0.25 : Math.sin(ph * 2) * 0.05);
      return;
    }
    if (def.look.kind === 'frog') {
      const air = Math.min(1, localSpeed / 0.3);
      r.legs.forEach((l) => (l.up.rotation.z = -air * Math.abs(Math.sin(ph * 5)) * 0.9));
      return;
    }
    const legLen = Math.max(0.15, r.legLen);
    const stride = legLen * (1.6 + m.runK * 1.4);
    m.gait += (dt * localSpeed / stride) * Math.PI * 2 * 0.5;
    poseBody(r, {
      gait: m.gait,
      walk: clamp(localSpeed / 0.25, 0, 1),
      run: m.runK,
      sit: clamp(m.sitK, 0, 1),
      graze: m.grazeK,
      lie: m.lieK,
      look: m.act === 'look' ? m.look * 1.3 : m.look * (walking ? 0.25 : 0.7),
      t: ph,
      sniff: m.sniffK,
    });
    if (m.act === 'groom' && r.head) r.head.rotation.x = Math.sin(ph * 3) * 0.25;
    if (m.act === 'groom') {
      const arm = r.legs[0];
      if (arm) arm.up.rotation.z = -0.1 + Math.sin(ph * 5) * 0.25;
    }
  }

  private updateFireflies(t: number, night: number): void {
    const m = this.fly.points.material as THREE.PointsMaterial;
    m.opacity = night;
    const tree = this.tree!;
    const b = { r: tree.canopyRadius + 0.6, y: tree.height * 0.25, h: tree.height * 0.8 };
    m.size = 0.2 + tree.height * 0.02;
    const pos = this.fly.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const sd = this.fly.seeds;
    for (let i = 0; i < pos.count; i++) {
      const a = sd[i * 3]! * 6.28 + t * 0.12 * (0.5 + sd[i * 3 + 1]!);
      const r = b.r * (0.4 + 0.6 * sd[i * 3 + 2]!);
      pos.setXYZ(i, Math.cos(a) * r, b.y + b.h * sd[i * 3 + 1]! + Math.sin(t * 0.8 + i) * 0.2, Math.sin(a) * r);
    }
    pos.needsUpdate = true;
  }
}

function fireflies(): { points: THREE.Points; seeds: Float32Array } {
  const n = 26;
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(n * 3);
  const seeds = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) seeds[i] = Math.random();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,250,190,1)');
  grad.addColorStop(0.35, 'rgba(226,255,120,0.7)');
  grad.addColorStop(1, 'rgba(200,255,100,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.PointsMaterial({ size: 0.35, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#fff9c4' });
  const points = new THREE.Points(geo, m);
  points.frustumCulled = false;
  return { points, seeds };
}

/** Every animal id that has a 3D figure (for tests / previews). */
export function figureIds(): string[] {
  return ANIMALS.map((a) => a.id);
}
