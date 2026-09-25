import * as THREE from 'three';
import { ANIMALS, animalById, type AnimalDef, type Look } from '../data/animals';
import { clamp } from '../util';
import { ISLAND_R } from './island3d';
import type { TreeBuild } from './tree3d';
import { ellipsoid } from './util3d';

/* =====================================================================
 * Procedural animal figures. Every figure faces +x, feet at y = 0, about one unit long.
 * Static parts are merged per figure; animated parts (wings, head, legs, tail) are separate
 * meshes so a figure costs roughly 3–8 draw calls. Templates are built once per species and
 * cloned (shared geometry) for every member of a group.
 * ===================================================================== */

const MAT = {
  solid: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.78 }),
  double: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
  glow: new THREE.MeshStandardMaterial({ color: '#f6ff9a', emissive: '#e4ff5a', emissiveIntensity: 1.6 }),
};
type MatKind = keyof typeof MAT;
type XYZ = [number, number, number];

class Kit {
  private parts = new Map<string, { geos: THREE.BufferGeometry[]; pivot: XYZ; mat: MatKind }>();
  part(name: string, pivot: XYZ = [0, 0, 0], mat: MatKind = 'solid'): this {
    if (!this.parts.has(name)) this.parts.set(name, { geos: [], pivot, mat });
    return this;
  }
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
  build(): THREE.Group {
    const group = new THREE.Group();
    for (const [name, p] of this.parts) {
      if (!p.geos.length) continue;
      const merged = mergeSimple(p.geos);
      merged.translate(-p.pivot[0], -p.pivot[1], -p.pivot[2]);
      merged.computeVertexNormals();
      const mesh = new THREE.Mesh(merged, MAT[p.mat]);
      mesh.name = name;
      mesh.position.set(...p.pivot);
      group.add(mesh);
    }
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

/* ---------- Birds ---------- */

function birdFig(look: Look): THREE.Group {
  const [body, belly, headC, beak, wingC, accent = '#ffffff'] = look.c as [string, string, string, string, string, string?];
  const k = new Kit();
  const legs = has(look, 'longLegs') ? 0.6 : 0.14;
  const by = legs + 0.2;
  k.add('body', E(0.34, 0.24, 0.22), body, [0, by, 0], [0, 0, has(look, 'longLegs') ? 0.05 : 0.25]);
  k.add('body', E(0.26, 0.18, 0.18), belly, [0.06, by - 0.07, 0]);
  for (const s of [-1, 1]) {
    k.add('body', new THREE.CylinderGeometry(0.015, 0.015, legs + 0.04, 3), has(look, 'longLegs') ? '#2a2a2a' : '#7a5b3a', [0.02, legs / 2, s * 0.07]);
    if (has(look, 'longLegs')) k.add('body', new THREE.BoxGeometry(0.1, 0.012, 0.03), '#e8c040', [0.05, 0.006, s * 0.07]);
  }
  // Tail.
  const tailLen = has(look, 'veryLongTail') ? 0.95 : has(look, 'longTail') ? 0.5 : 0.3;
  const tailUp = has(look, 'cocked') ? 0.6 : -0.35;
  k.part('tail', [-0.3, by + 0.06, 0]);
  if (has(look, 'forkTail')) {
    for (const s of [-1, 1]) k.add('tail', new THREE.BoxGeometry(tailLen, 0.03, 0.05), wingC, [-0.3 - tailLen / 2, by + 0.06, s * 0.05], [0, s * 0.25, tailUp]);
  } else {
    k.add('tail', new THREE.BoxGeometry(tailLen, 0.04, 0.14), has(look, 'veryLongTail') ? accent : wingC, [-0.28 - tailLen / 2, by + 0.06 - (tailUp > 0 ? -tailLen * 0.25 : tailLen * 0.15), 0], [0, 0, -tailUp * 0.7]);
  }
  // Neck + head.
  const long = has(look, 'longNeck');
  const hy = long ? by + 0.5 : by + 0.24;
  const hx = long ? 0.32 : 0.28;
  if (long) k.add('body', new THREE.CylinderGeometry(0.05, 0.07, 0.5, 5), body, [0.24, by + 0.25, 0], [0, 0, -0.3]);
  k.part('head', [hx - 0.05, hy - 0.1, 0]);
  k.add('head', E(0.17, 0.16, 0.16), headC, [hx, hy, 0]);
  const bl = has(look, 'longBeak') ? 0.34 : has(look, 'spoon') ? 0.4 : has(look, 'thickBeak') ? 0.12 : 0.14;
  const bw = has(look, 'thickBeak') ? 0.07 : has(look, 'hooked') ? 0.06 : 0.04;
  k.add('head', new THREE.ConeGeometry(bw, bl, 4), beak, [hx + 0.13 + bl / 2 - 0.05, hy - (has(look, 'hooked') ? 0.04 : 0.02), 0], [0, 0, -Math.PI / 2 - (has(look, 'hooked') ? 0.35 : 0)]);
  if (has(look, 'spoon')) k.add('head', E(0.07, 0.015, 0.06, 0), beak, [hx + 0.13 + bl - 0.04, hy - 0.03, 0]);
  for (const s of [-1, 1]) {
    if (has(look, 'eyering')) k.add('head', E(0.045, 0.045, 0.02, 0), '#ffffff', [hx + 0.08, hy + 0.04, s * 0.135]);
    if (has(look, 'mask')) k.add('head', E(0.1, 0.04, 0.02, 0), '#1a1a1a', [hx + 0.05, hy + 0.03, s * 0.14]);
    k.add('head', new THREE.IcosahedronGeometry(0.03, 0), has(look, 'redEye') ? '#c8302a' : '#111111', [hx + 0.09, hy + 0.04, s * 0.14]);
    if (has(look, 'cheek')) k.add('head', E(0.06, 0.045, 0.02, 0), accent, [hx + 0.04, hy - 0.04, s * 0.145]);
  }
  if (has(look, 'crest')) {
    const n = has(look, 'bigCrest') ? 3 : 1;
    for (let i = 0; i < n; i++) k.add('head', new THREE.ConeGeometry(0.05, has(look, 'bigCrest') ? 0.28 : 0.16, 4), has(look, 'bigCrest') ? accent : headC === '#ffffff' ? accent : headC, [hx - 0.06 - i * 0.03, hy + 0.17 + i * 0.02, 0], [0, 0, 0.5 + i * 0.25]);
  }
  if (has(look, 'cap')) k.add('head', E(0.12, 0.07, 0.12, 0), accent, [hx - 0.03, hy + 0.11, 0]);
  if (has(look, 'collar')) k.add('body', new THREE.TorusGeometry(0.12, 0.035, 4, 10), accent, [hx - 0.1, hy - 0.15, 0], [0, Math.PI / 2, 0.4]);
  // Wings: span along ±z from the shoulder; folded back along the body when perched.
  const span = has(look, 'soar') ? 0.75 : 0.42;
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0.02, by + 0.1, s * 0.16], 'double');
    k.add(name, E(0.16, 0.035, span / 2, 1), wingC, [0.0, by + 0.1, s * (0.16 + span / 2)]);
    if (has(look, 'wingpatch')) k.add(name, E(0.07, 0.04, 0.08, 0), accent === '#111111' ? '#ffffff' : accent, [0.02, by + 0.12, s * (0.16 + span * 0.55)]);
    if (has(look, 'barred')) for (let i = 0; i < 3; i++) k.add(name, new THREE.BoxGeometry(0.03, 0.05, span * 0.8), '#f2f2f2', [-0.06 + i * 0.06, by + 0.12, s * (0.16 + span / 2)]);
  }
  return k.build();
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
  const legLen = has(look, 'longLegs') ? 0.58 : has(look, 'short') ? 0.2 : 0.4;
  const stocky = has(look, 'stocky');
  const bodyR: XYZ = [0.5, stocky ? 0.3 : 0.24, stocky ? 0.27 : 0.2];
  const by = legLen + bodyR[1] * 0.75;
  k.add('body', E(...bodyR), body, [0, by, 0]);
  k.add('body', E(bodyR[0] * 0.75, bodyR[1] * 0.55, bodyR[2] * 0.8), belly, [0, by - bodyR[1] * 0.45, 0]);
  if (has(look, 'spots')) for (let i = 0; i < 12; i++) k.add('body', E(0.05, 0.035, 0.012, 0), accent, [-0.35 + (i % 6) * 0.13, by + (i < 6 ? 0.1 : -0.02), (i % 2 ? 1 : -1) * bodyR[2] * 0.92]);
  if (has(look, 'scales')) for (let i = 0; i < 18; i++) {
    const x = -0.4 + (i % 6) * 0.16;
    const ring = Math.floor(i / 6);
    k.add('body', E(0.1, 0.03, 0.12, 0), i % 2 ? accent : body, [x, by + bodyR[1] * (0.8 - ring * 0.25), (ring - 1) * bodyR[2] * 0.7], [(ring - 1) * 0.6, 0, 0.3]);
  }
  if (has(look, 'spines')) for (let i = 0; i < 16; i++) {
    const x = -0.45 + (i % 8) * 0.1;
    const z = (i < 8 ? 1 : -1) * 0.08;
    k.add('body', new THREE.ConeGeometry(0.03, 0.5, 3), i % 2 ? accent : '#1a1a1a', [x - 0.12, by + bodyR[1] * 0.9 + 0.12, z], [z * 4, 0, 1.1]);
  }
  if (has(look, 'bristle')) k.add('body', new THREE.BoxGeometry(0.7, 0.08, 0.05), '#2a221c', [0, by + bodyR[1] * 0.95, 0]);
  // Head.
  const hx = bodyR[0] + 0.1;
  const hy = by + bodyR[1] * 0.5;
  k.part('head', [bodyR[0] * 0.8, by + 0.05, 0]);
  k.add('head', new THREE.CylinderGeometry(0.08, 0.12, 0.3, 5), body, [bodyR[0] * 0.85, by + 0.12, 0], [0, 0, -0.9]);
  k.add('head', E(0.17, 0.13, 0.12), head, [hx, hy, 0]);
  const snout = has(look, 'snout') ? 0.16 : 0.08;
  k.add('head', E(snout, 0.07, 0.07), has(look, 'mask') || has(look, 'blaze') ? accent : head, [hx + 0.12 + snout * 0.5, hy - 0.04, 0]);
  k.add('head', new THREE.IcosahedronGeometry(0.03, 0), '#1a1a1a', [hx + 0.12 + snout * 1.3, hy - 0.03, 0]);
  if (has(look, 'blaze')) k.add('head', new THREE.BoxGeometry(0.25, 0.03, 0.04), '#f2eee6', [hx + 0.05, hy + 0.1, 0]);
  if (has(look, 'mask')) for (const s of [-1, 1]) k.add('head', E(0.08, 0.03, 0.02, 0), '#f2eee6', [hx + 0.02, hy + 0.06, s * 0.1]);
  for (const s of [-1, 1]) {
    k.add('head', new THREE.IcosahedronGeometry(0.024, 0), '#111111', [hx + 0.1, hy + 0.03, s * 0.08]);
    if (has(look, 'catEars')) k.add('head', new THREE.ConeGeometry(0.05, 0.12, 3), head, [hx - 0.04, hy + 0.14, s * 0.07]);
    else k.add('head', new THREE.ConeGeometry(0.045, 0.12, 4), head, [hx - 0.06, hy + 0.11, s * 0.09], [s * 0.6, 0, 0]);
    if (has(look, 'antlers')) k.add('head', new THREE.CylinderGeometry(0.012, 0.018, 0.2, 3), '#5b4331', [hx - 0.02, hy + 0.2, s * 0.04], [s * 0.2, 0, 0.2]);
    if (has(look, 'horns')) k.add('head', new THREE.ConeGeometry(0.03, 0.2, 4), accent, [hx - 0.02, hy + 0.14, s * 0.12], [s * 1.1, 0, 0.3]);
    if (has(look, 'bigHorns')) {
      k.add('head', new THREE.CylinderGeometry(0.03, 0.05, 0.36, 4), accent, [hx - 0.08, hy + 0.12, s * 0.2], [s * 1.35, 0, 0.5]);
      k.add('head', new THREE.ConeGeometry(0.03, 0.18, 4), accent, [hx - 0.2, hy + 0.2, s * 0.34], [s * 0.4, 0, 1.4]);
    }
    if (has(look, 'tusks')) k.add('head', new THREE.ConeGeometry(0.015, 0.08, 3), '#f2eee0', [hx + 0.2, hy - 0.04, s * 0.05], [0, 0, -0.5]);
  }
  // Legs.
  const lx = bodyR[0] * 0.62;
  const lz = bodyR[2] * 0.6;
  for (const [name, x, z] of [['legFL', lx, lz], ['legFR', lx, -lz], ['legBL', -lx, lz], ['legBR', -lx, -lz]] as const) {
    k.part(name, [x, legLen, z]);
    k.add(name, new THREE.CylinderGeometry(stocky ? 0.05 : 0.035, stocky ? 0.04 : 0.028, legLen + 0.05, 4), body, [x, legLen / 2, z]);
    k.add(name, new THREE.CylinderGeometry(0.04, 0.045, 0.05, 4), '#2a2420', [x, 0.025, z]);
  }
  // Tail.
  k.part('tail', [-bodyR[0], by + 0.05, 0]);
  if (has(look, 'longTail')) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const c = has(look, 'ringTail') && i % 2 ? accent : body;
      k.add('tail', new THREE.CylinderGeometry(0.04 * (1 - t * 0.5), 0.05 * (1 - t * 0.5), 0.14, 4), c, [-bodyR[0] - 0.07 - i * 0.12, by + 0.04 - i * 0.035, 0], [0, 0, Math.PI / 2 + 0.25]);
    }
  } else if (has(look, 'cowTail')) {
    k.add('tail', new THREE.CylinderGeometry(0.015, 0.02, 0.5, 3), body, [-bodyR[0] - 0.03, by - 0.22, 0], [0, 0, -0.15]);
    k.add('tail', E(0.04, 0.08, 0.04, 0), '#1a1a1a', [-bodyR[0] - 0.06, by - 0.48, 0]);
  } else {
    k.add('tail', E(0.07, 0.09, 0.06, 0), belly, [-bodyR[0] - 0.02, by + 0.05, 0]);
  }
  return k.build();
}

function monkeyFig(look: Look): THREE.Group {
  const [fur, light, face] = look.c as [string, string, string];
  const k = new Kit();
  const legLen = 0.34;
  const by = 0.55;
  k.add('body', E(0.34, 0.22, 0.2), fur, [0, by, 0], [0, 0, 0.35]);
  k.add('body', E(0.2, 0.14, 0.16), light, [0.08, by - 0.06, 0]);
  k.part('head', [0.3, by + 0.12, 0]);
  k.add('head', E(0.16, 0.15, 0.15), fur, [0.4, by + 0.24, 0]);
  k.add('head', E(0.1, 0.11, 0.11), face, [0.5, by + 0.22, 0]);
  for (const s of [-1, 1]) {
    k.add('head', new THREE.IcosahedronGeometry(0.022, 0), '#111111', [0.59, by + 0.26, s * 0.045]);
    k.add('head', E(0.03, 0.05, 0.03, 0), face, [0.38, by + 0.26, s * 0.15]);
  }
  for (const [name, x, z] of [['legFL', 0.22, 0.12], ['legFR', 0.22, -0.12], ['legBL', -0.22, 0.12], ['legBR', -0.22, -0.12]] as const) {
    k.part(name, [x, legLen + 0.1, z]);
    k.add(name, new THREE.CylinderGeometry(0.04, 0.035, legLen + 0.14, 4), fur, [x, (legLen + 0.1) / 2, z]);
  }
  k.part('tail', [-0.3, by, 0]);
  k.add('tail', new THREE.CylinderGeometry(0.025, 0.035, 0.3, 4), fur, [-0.4, by + 0.1, 0], [0, 0, 0.7]);
  return k.build();
}

function squirrelFig(look: Look): THREE.Group {
  const [fur, belly, tailC] = look.c as [string, string, string];
  const k = new Kit();
  k.add('body', E(0.3, 0.2, 0.18), fur, [0, 0.26, 0], [0, 0, 0.5]);
  k.add('body', E(0.18, 0.13, 0.14), belly, [0.08, 0.2, 0]);
  k.part('head', [0.2, 0.4, 0]);
  k.add('head', E(0.15, 0.13, 0.13), fur, [0.26, 0.46, 0]);
  for (const s of [-1, 1]) {
    k.add('head', new THREE.ConeGeometry(0.04, 0.1, 4), fur, [0.22, 0.6, s * 0.07]);
    k.add('head', new THREE.IcosahedronGeometry(0.025, 0), '#111111', [0.36, 0.5, s * 0.07]);
  }
  k.part('tail', [-0.22, 0.2, 0]);
  for (let i = 0; i < 6; i++) k.add('tail', new THREE.IcosahedronGeometry(0.1 + i * 0.012, 0), i % 2 ? tailC : fur, [-0.25 - Math.sin(i * 0.45) * 0.2, 0.2 + i * 0.1, 0]);
  return k.build();
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
  k.add('body', new THREE.CylinderGeometry(0.025, 0.02, 0.32, 4), bodyC, [0, 0.02, 0], [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) k.add('body', new THREE.CylinderGeometry(0.005, 0.005, 0.16, 3), bodyC, [0.2, 0.06, s * 0.04], [s * 0.4, 0, -0.9]);
  for (const [name, s] of [['wingL', 1], ['wingR', -1]] as const) {
    k.part(name, [0, 0.02, 0], 'double');
    const fore = new THREE.CircleGeometry(moth ? 0.26 : 0.22, 7);
    fore.scale(1, moth ? 1 : 1.1, 1);
    k.add(name, fore, wing, [0.06, 0.02, s * 0.2], [-Math.PI / 2, 0, 0]);
    const hind = new THREE.CircleGeometry(moth ? 0.2 : 0.15, 6);
    k.add(name, hind, moth ? wing : pattern, [-0.1, 0.021, s * 0.15], [-Math.PI / 2, 0, 0]);
    k.add(name, new THREE.CircleGeometry(moth ? 0.06 : 0.07, 5), moth ? (spot ?? '#ffffff') : pattern, [0.1, 0.024, s * 0.28], [-Math.PI / 2, 0, 0]);
    if (spot) k.add(name, new THREE.CircleGeometry(0.025, 4), spot, [0.16, 0.026, s * 0.34], [-Math.PI / 2, 0, 0]);
    if (has(look, 'tails')) k.add(name, new THREE.BoxGeometry(0.16, 0.004, 0.03), pattern, [-0.24, 0.02, s * 0.2], [0, s * 0.4, 0]);
  }
  return k.build();
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

/** Standalone figure for album thumbnails (magpie robin comes with its nest). */
export function albumFigure(id: string): THREE.Object3D | null {
  const t = template(id);
  if (!t) return null;
  const fig = t.clone();
  const def = animalById(id);
  if (def?.look.kind === 'bird') foldWings(fig, 1);
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
  const l = obj.getObjectByName('wingL');
  const r = obj.getObjectByName('wingR');
  if (l) l.rotation.set(0, -1.35 * fold, 0.12 * fold);
  if (r) r.rotation.set(0, 1.35 * fold, -0.12 * fold);
}

/* =====================================================================
 * Ecosystem: which animals are on screen and how they move.
 * ===================================================================== */

const FLYERS = new Set(['perch', 'flock', 'soar', 'hover', 'flutter', 'bat']);
const GROUND = new Set(['walk', 'hop', 'wade']);
const MAX_GROUPS = 4;
const MAX_MEMBERS = 30;

interface Member {
  obj: THREE.Object3D;
  wingL?: THREE.Object3D;
  wingR?: THREE.Object3D;
  head?: THREE.Object3D;
  tail?: THREE.Object3D;
  legs: THREE.Object3D[];
  glow?: THREE.Object3D;
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
  moving: number;
  spread: number;
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
}

export interface EcoInfo {
  id: string;
  name: string;
  count: number;
  resident: boolean;
}

function faceYaw(dir: THREE.Vector3): number {
  return Math.atan2(-dir.z, dir.x);
}

function groundY(x: number, z: number): number {
  const r = Math.hypot(x, z);
  return 0.02 + 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
}

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

export class Animals3D {
  /** World-space root (animals are positioned in world space; perches follow the swaying tree). */
  readonly root = new THREE.Group();
  private crews: Crew[] = [];
  private tree: TreeBuild | null = null;
  private pool: string[] = [];
  private residents: string[] = [];
  private night = false;
  private weak = false;
  private nextRotate = 8;
  private time = 0;
  private fly = fireflies();
  private perchTaken = new Set<number>();
  private rng = Math.random;

  constructor() {
    this.fly.points.visible = false;
    this.root.add(this.fly.points);
  }

  /** Update what may appear: every unlocked (seen) animal, the residents, and day/night. */
  sync(opts: { unlocked: string[]; residents: string[]; tree: TreeBuild; health: number; night: boolean }): void {
    const treeChanged = this.tree !== opts.tree;
    this.tree = opts.tree;
    this.pool = opts.unlocked.filter((id) => animalById(id));
    this.residents = opts.residents.filter((id) => animalById(id)).slice(0, 3);
    const nightChanged = this.night !== opts.night;
    this.night = opts.night;
    this.weak = opts.health < 22;
    if (treeChanged) this.reseat();
    // Residents always present; drop crews that no longer fit (night/day switch, locked, weak tree).
    for (const c of this.crews) {
      if (c.forced) continue;
      if (!this.fits(c.def) || (!c.resident && !this.pool.includes(c.def.id))) this.retire(c);
      c.resident = this.residents.includes(c.def.id);
    }
    for (const id of this.residents) if (!this.crews.some((c) => c.def.id === id && !c.leaving) && this.fits(animalById(id)!)) this.spawn(id, { resident: true });
    if (nightChanged || this.visibleCrews().length === 0) this.fill();
  }

  private fits(def: AnimalDef): boolean {
    if (this.weak && !['butterfly', 'sparrow'].includes(def.id)) return false;
    if (def.motion === 'hollow' || def.motion === 'nest') return true;
    return this.night ? Boolean(def.night) || def.motion === 'glow' : !def.night;
  }

  private visibleCrews(): Crew[] {
    return this.crews.filter((c) => !c.leaving);
  }

  private memberCount(): number {
    return this.crews.reduce((n, c) => n + c.members.length, 0);
  }

  /** Top up the scene with random previously seen animals. */
  private fill(): void {
    let guard = 0;
    while (this.visibleCrews().filter((c) => !c.resident).length < MAX_GROUPS && guard++ < 12) {
      const options = this.pool.filter((id) => this.fits(animalById(id)!) && !this.crews.some((c) => c.def.id === id && !c.leaving));
      if (!options.length) break;
      this.spawn(options[Math.floor(this.rng() * options.length)]!);
    }
  }

  /** Swap one visiting group for another (called on a timer and from the developer panel). */
  rotate(): void {
    const visitors = this.visibleCrews().filter((c) => !c.resident);
    if (visitors.length) this.retire(visitors.sort((a, b) => a.born - b.born)[0]!);
    const options = this.pool.filter((id) => this.fits(animalById(id)!) && !this.crews.some((c) => c.def.id === id));
    if (options.length) this.spawn(options[Math.floor(this.rng() * options.length)]!);
    this.nextRotate = this.time + 28 + this.rng() * 20;
  }

  info(): EcoInfo[] {
    return this.visibleCrews().map((c) => ({ id: c.def.id, name: c.def.name, count: c.members.length, resident: c.resident }));
  }

  private retire(c: Crew): void {
    if (c.leaving) return;
    c.leaving = true;
    c.timer = 0;
    for (const m of c.members) {
      if (m.mode === 'perch') this.perchTaken.delete(m.perch);
      m.timer = 0;
    }
  }

  /** Add a group of `id` (developer spawn ignores unlocks and day/night). */
  spawn(id: string, opts: { resident?: boolean; forced?: boolean } = {}): void {
    const def = animalById(id);
    const tree = this.tree;
    if (!def || !tree) return;
    if (opts.forced) {
      const old = this.crews.find((c) => c.def.id === id && !c.leaving);
      if (old) this.retire(old);
      while (this.memberCount() > MAX_MEMBERS - def.group[1]) {
        const v = this.visibleCrews().find((c) => !c.resident && c !== old);
        if (!v) break;
        this.retire(v);
        break;
      }
    }
    const [lo, hi] = def.group;
    let n = lo + Math.floor(this.rng() * (hi - lo + 1));
    if (def.motion === 'nest' || def.motion === 'hollow' || def.motion === 'glow') n = 1;
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
    };
    const entry = this.entryPoint(def);
    crew.leader.copy(entry);
    crew.leaderTarget.copy(this.groundTarget(def));
    for (let i = 0; i < n; i++) {
      const obj = def.motion === 'nest' ? this.nestWithRobin(t) : t.clone();
      obj.rotation.order = 'YZX';
      const member: Member = {
        obj,
        wingL: obj.getObjectByName('wingL') ?? undefined,
        wingR: obj.getObjectByName('wingR') ?? undefined,
        head: obj.getObjectByName('head') ?? undefined,
        tail: obj.getObjectByName('tail') ?? undefined,
        legs: ['legFL', 'legFR', 'legBL', 'legBR'].map((nme) => obj.getObjectByName(nme)).filter((o): o is THREE.Object3D => Boolean(o)),
        glow: obj.getObjectByName('glow') ?? undefined,
        pos: entry.clone().add(new THREE.Vector3((this.rng() - 0.5) * 1.5, (this.rng() - 0.5) * 0.8, (this.rng() - 0.5) * 1.5)),
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
      };
      if (i > 0 && GROUND.has(def.motion)) member.offset.set(-0.6 - i * 0.5 + this.rng() * 0.3, 0, (i % 2 ? 1 : -1) * (0.4 + this.rng() * 0.4));
      if (def.look.kind === 'quad' || def.look.kind === 'monkey') obj.traverse((o) => ((o as THREE.Mesh).isMesh && (o.castShadow = true)));
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
    if (def.category === 'insect' || def.category === 'butterfly' || def.category === 'reptile' || def.category === 'amphibian') return Math.max(0.32, sky * 0.9) * size;
    return sky * size;
  }

  private entryPoint(def: AnimalDef): THREE.Vector3 {
    const tree = this.tree!;
    const a = this.rng() * Math.PI * 2;
    if (GROUND.has(def.motion)) {
      const r = ISLAND_R * 0.82;
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
    const outer = ISLAND_R * 0.76;
    const wade = def.motion === 'wade';
    const ang = wade ? 0.3 + this.rng() * 0.9 : -0.3 + this.rng() * 3.8;
    const r = wade ? outer * (0.75 + this.rng() * 0.2) : inner + this.rng() * (outer - inner);
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
      if (crew.def.motion === 'perch' || crew.def.motion === 'flock' || (crew.def.motion === 'crawl' && crew.def.spot === 'leaf')) {
        m.perch = this.freePerch(tree);
      }
      if (crew.def.motion === 'climb' || (crew.def.motion === 'crawl' && crew.def.spot === 'trunk')) m.perch = Math.floor(this.rng() * Math.max(1, tree.trunkSpots.length));
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

  update(t: number, dt: number, night: number): void {
    this.time = t;
    const tree = this.tree;
    if (!tree) return;
    if (t > this.nextRotate) {
      if (this.crews.length) this.rotate();
      else this.fill();
    }
    for (const c of this.crews) this.step(c, t, dt);
    // Remove crews that finished leaving.
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
    // Ground leader wanders.
    if (GROUND.has(def.motion)) {
      if (c.leaving) c.leaderTarget.copy(this.entryPoint(def));
      tmp.subVectors(c.leaderTarget, c.leader).setY(0);
      const dist = tmp.length();
      const speed = (def.motion === 'wade' ? 0.35 : def.motion === 'hop' ? 0.7 : def.look.size && def.look.size > 1.8 ? 0.45 : 0.8) * clamp(0.6 + H * 0.05, 0.6, 1.4);
      if (dist < 0.15) {
        if (c.leaving) leaveDone();
        c.pause -= dt;
        if (c.pause <= 0) {
          c.leaderTarget.copy(this.groundTarget(def));
          c.pause = 2 + this.rng() * 5;
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
            const spreadK = m.scale * 3;
            m.target.copy(c.leader).add(tmp2.copy(m.offset).multiplyScalar(def.motion === 'flock' ? spreadK : 0));
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
          flap = Math.sin(ph * 0.4) > 0.8 ? 1 : 0.15;
          break;
        }
        case 'hover':
        case 'flutter':
        case 'bat': {
          if (c.leaving) {
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
          } else {
            const speed = def.motion === 'bat' ? 0.9 : 0.35;
            const a = t * speed * m.speed + m.phase * 2;
            const low = def.category === 'butterfly' && i % 2 === 1;
            const rr = (low ? R * 0.6 + 1.2 : R + 0.4) + Math.sin(ph * 0.7) * 0.4;
            const y = low ? 0.5 + Math.sin(ph * 1.3) * 0.3 : H * (def.motion === 'bat' ? 0.75 : 0.5) + Math.sin(ph * 1.1) * H * 0.12;
            m.target.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
          }
          m.pos.lerp(m.target, k(def.motion === 'hover' ? 4 : 2.5));
          flap = 1;
          break;
        }
        case 'walk':
        case 'hop':
        case 'wade': {
          tmp.copy(m.offset).applyAxisAngle(new THREE.Vector3(0, 1, 0), c.members[0]!.yaw);
          m.target.copy(c.leader).add(i === 0 ? tmp.set(0, 0, 0) : tmp.multiplyScalar(m.scale));
          m.target.y = groundY(m.target.x, m.target.z);
          const before = m.pos.clone();
          m.pos.lerp(m.target, k(i === 0 ? 30 : 2.5));
          m.moving = clamp(before.distanceTo(m.pos) / Math.max(1e-4, dt) / 0.4, 0, 1.5);
          if (def.motion === 'hop') m.pos.y += Math.abs(Math.sin(ph * 5)) * 0.15 * m.scale * Math.min(1, m.moving);
          break;
        }
        case 'climb': {
          const lift = Math.sin(ph * 0.25) * 0.4 * Math.max(0.5, H * 0.08);
          this.trunkWorld(m.perch, lift, m.target, m.scale * 0.15);
          if (c.leaving) m.target.set(m.target.x, 0.2, m.target.z + 2);
          m.pos.lerp(m.target, k(c.enter < 1 ? 3 : 8));
          if (c.leaving && m.pos.y < 0.5) leaveDone();
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
      // Grow in / shrink out for non-travelling animals.
      const popper = !FLYERS.has(def.motion) && !GROUND.has(def.motion);
      let s = m.scale;
      if (popper) {
        const e = c.leaving ? 1 - clamp(c.timer / 0.8, 0, 1) : clamp(c.timer / 0.8, 0, 1);
        s *= Math.max(0.001, e);
        if (c.leaving && c.timer > 0.8 && def.motion !== 'climb') leaveDone();
      }
      m.obj.scale.setScalar(s);
      m.obj.position.copy(m.pos);
      this.pose(c, m, i, dt, ph, flap, perched);
    });
    c.enter = Math.min(1, c.enter + dt * 0.6);
  }

  private pose(c: Crew, m: Member, i: number, dt: number, ph: number, flap: number, perched: boolean): void {
    const def = c.def;
    const vel = tmp.subVectors(m.pos, m.prev);
    const speed = vel.length() / Math.max(1e-4, dt);
    const tree = this.tree!;
    const toward = (dir: THREE.Vector3) => {
      if (dir.lengthSq() < 1e-8) return;
      const want = faceYaw(dir);
      let d = want - m.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      m.yaw += d * Math.min(1, dt * 6);
    };
    if (def.motion === 'nest' || def.motion === 'hollow') {
      const out = def.motion === 'nest' ? tree.nest?.out : tree.hollow?.out;
      m.obj.rotation.set(0, faceYaw(out ?? new THREE.Vector3(0.3, 0, 1)), 0);
      if (def.motion === 'nest') {
        const bird = m.obj.children[1];
        if (bird) bird.rotation.y = Math.sin(ph * 0.7) > 0.6 ? 0.5 : 0;
      }
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
      if (m.head) m.head.rotation.z = def.id === 'woodpecker' ? Math.max(0, Math.sin(ph * 14)) * 0.3 * (Math.sin(ph * 0.5) > 0.3 ? 1 : 0) : Math.sin(ph * 0.6) * 0.2;
      if (m.tail) m.tail.rotation.z = Math.sin(ph * 2.2) * 0.15;
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
      if (m.head) m.head.rotation.y = Math.sin(ph * 0.8) * 0.3;
      if (m.tail) m.tail.rotation.y = Math.sin(ph * 1.5) * 0.2;
      return;
    }
    if (GROUND.has(def.motion)) {
      if (m.moving > 0.05) toward(vel.setY(0));
      else if (i > 0) toward(tmp2.subVectors(c.members[0]!.pos, m.pos).setY(0));
      m.obj.rotation.set(0, m.yaw, 0);
      const walk = Math.min(1, m.moving);
      const swing = Math.sin(ph * (def.look.size && def.look.size > 1.8 ? 5 : 9)) * 0.55 * walk;
      m.legs.forEach((leg, j) => (leg.rotation.z = j === 0 || j === 3 ? swing : -swing));
      if (m.head) {
        const graze = walk < 0.1 && Math.sin(ph * 0.35) > 0.2;
        m.head.rotation.z = def.motion === 'wade' ? (Math.sin(ph * 0.9) > 0.85 ? -0.9 : 0) : graze ? -0.8 : Math.sin(ph * 0.6) * 0.1;
      }
      if (m.tail) m.tail.rotation.z = Math.sin(ph * 4) * 0.15;
      if (def.look.kind === 'bird') foldWings(m.obj, 1);
      return;
    }
    // Flyers.
    if (perched) {
      const p = tree.perches[m.perch];
      const face = p ? p.out.clone().setY(0).normalize().lerp(new THREE.Vector3(0.3, 0, 1), 0.6) : new THREE.Vector3(0.3, 0, 1);
      toward(face);
      m.obj.rotation.set(0, m.yaw, 0);
    } else {
      toward(vel.clone().setY(0));
      const pitch = clamp(vel.y / Math.max(1e-4, dt) * 0.08, -0.5, 0.5);
      const bank = def.motion === 'soar' ? 0.35 : clamp(Math.sin(ph * 0.8) * 0.2, -0.3, 0.3);
      m.obj.rotation.set(bank, m.yaw, pitch);
    }
    const spreadWant = perched ? 0 : 1;
    m.spread += (spreadWant - m.spread) * Math.min(1, dt * 8);
    const isInsect = def.category === 'insect' || def.category === 'butterfly';
    const rate = def.look.kind === 'bee' || def.look.kind === 'dragonfly' ? 60 : isInsect ? 14 : def.motion === 'soar' ? 3 : def.look.kind === 'bat' ? 11 : 16;
    const amp = isInsect ? (def.look.kind === 'butterfly' ? 1.0 : 0.35) : def.motion === 'soar' ? 0.25 : 0.8;
    const f = Math.sin(ph * rate) * amp * flap;
    if (def.look.kind === 'bird') {
      const s = m.spread;
      m.wingL?.rotation.set(-f * s + (1 - s) * 0.12 - s * 0.1, -1.35 * (1 - s), 0.12 * (1 - s));
      m.wingR?.rotation.set(f * s - (1 - s) * 0.12 + s * 0.1, 1.35 * (1 - s), -0.12 * (1 - s));
      if (m.head && perched) m.head.rotation.y = Math.sin(ph * 0.7) > 0.6 ? 0.5 : Math.sin(ph * 0.7) < -0.7 ? -0.4 : 0;
      if (perched && Math.sin(ph * 0.45) > 0.95) {
        const ff = Math.sin(ph * 30) * 0.6;
        m.wingL?.rotation.set(-ff, -1.0, 0.1);
        m.wingR?.rotation.set(ff, 1.0, -0.1);
      }
      if (m.tail) m.tail.rotation.z = perched ? Math.sin(ph * 1.7) * 0.1 : 0;
    } else {
      if (m.wingL) m.wingL.rotation.x = f;
      if (m.wingR) m.wingR.rotation.x = -f;
    }
    void speed;
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
