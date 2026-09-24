import * as THREE from 'three';
import { ellipsoid, mat, shadowAll } from './util3d';
import type { Perch, TreeBuild } from './tree3d';

/** Figures are modelled facing +x, about 1 unit long, feet at y=0. */
interface BirdStyle {
  body: string;
  belly: string;
  head: string;
  beak: string;
  wing?: string;
  cheek?: string;
  crest?: string;
  cap?: string;
  longBeak?: boolean;
  tail?: string;
}

const BIRDS: Record<string, BirdStyle> = {
  sparrow: { body: '#9b6b43', belly: '#e9dcc4', head: '#7a4b2a', beak: '#3b3b3b', wing: '#6d4a2f', cheek: '#f4efe6' },
  bulbul: { body: '#8a9468', belly: '#eeeadb', head: '#262626', beak: '#2b2b2b', wing: '#6f7a52', crest: '#ffffff' },
  redbulbul: { body: '#7b6450', belly: '#f1ebe0', head: '#222222', beak: '#2b2b2b', cheek: '#d9362b', crest: '#222222' },
  kingfisher: { body: '#1f86c9', belly: '#e8843a', head: '#1a6fb0', beak: '#1f1f1f', wing: '#2aa3dc', longBeak: true, cheek: '#f4b07a' },
  woodpecker: { body: '#2e2e2e', belly: '#efe9dc', head: '#2e2e2e', beak: '#4a4a4a', wing: '#f2f2f2', cap: '#d8322b', longBeak: true },
  dove: { body: '#b39a8b', belly: '#d9c7bb', head: '#9d8a86', beak: '#3b3b3b', wing: '#8e7768', cheek: '#2e2e2e' },
  magpierobin: { body: '#1f1f22', belly: '#f4f4f4', head: '#1f1f22', beak: '#1f1f1f', wing: '#f4f4f4', tail: '#1f1f22' },
};

export interface Figure {
  obj: THREE.Object3D;
  anim?: (t: number, f: Figure) => void;
  wingL?: THREE.Object3D;
  wingR?: THREE.Object3D;
  head?: THREE.Object3D;
  phase: number;
  base: THREE.Vector3;
}

function bird(style: BirdStyle): Figure {
  const g = new THREE.Group();
  const body = new THREE.Mesh(ellipsoid(0.34, 0.24, 0.22), mat(style.body));
  body.position.set(0, 0.34, 0);
  body.rotation.z = 0.25;
  const belly = new THREE.Mesh(ellipsoid(0.26, 0.18, 0.18), mat(style.belly));
  belly.position.set(0.06, 0.27, 0);
  const head = new THREE.Group();
  head.position.set(0.28, 0.58, 0);
  const skull = new THREE.Mesh(ellipsoid(0.17, 0.16, 0.16), mat(style.head));
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, style.longBeak ? 0.3 : 0.13, 4), mat(style.beak));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(style.longBeak ? 0.3 : 0.2, -0.02, 0);
  head.add(beak);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), mat('#111111', { rough: 0.3 }));
    eye.position.set(0.09, 0.04, side * 0.13);
    head.add(eye);
    if (style.cheek) {
      const ch = new THREE.Mesh(ellipsoid(0.06, 0.045, 0.02, 0), mat(style.cheek));
      ch.position.set(0.04, -0.04, side * 0.14);
      head.add(ch);
    }
  }
  if (style.crest) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), mat(style.crest));
    crest.position.set(-0.04, 0.16, 0);
    crest.rotation.z = 0.5;
    head.add(crest);
  }
  if (style.cap) {
    const cap = new THREE.Mesh(ellipsoid(0.12, 0.07, 0.12, 0), mat(style.cap));
    cap.position.set(-0.03, 0.12, 0);
    head.add(cap);
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.14), mat(style.tail ?? style.body));
  tail.position.set(-0.4, 0.4, 0);
  tail.rotation.z = -0.4;
  const wings: THREE.Object3D[] = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(-0.02, 0.44, side * 0.18);
    const w = new THREE.Mesh(ellipsoid(0.24, 0.05, 0.12, 0), mat(style.wing ?? style.body));
    w.position.set(-0.08, 0, side * 0.04);
    w.rotation.z = 0.25;
    pivot.add(w);
    g.add(pivot);
    wings.push(pivot);
  }
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 3), mat('#7a5b3a'));
    leg.position.set(0.02, 0.08, side * 0.07);
    g.add(leg);
  }
  g.add(body, belly, head, tail);
  shadowAll(g);
  return {
    obj: g,
    head,
    wingL: wings[0],
    wingR: wings[1],
    phase: Math.random() * 10,
    base: new THREE.Vector3(),
    anim: (t, f) => {
      const k = t + f.phase;
      f.head!.rotation.y = Math.sin(k * 0.7) > 0.6 ? 0.5 : Math.sin(k * 0.7) < -0.7 ? -0.4 : 0;
      f.head!.rotation.z = Math.max(0, Math.sin(k * 2.3)) * 0.25;
      const flap = Math.sin(k * 0.45) > 0.93 ? Math.sin(k * 30) * 0.7 : 0;
      f.wingL!.rotation.x = -flap;
      f.wingR!.rotation.x = flap;
      const hop = Math.max(0, Math.sin(k * 0.9) - 0.97) * 6;
      f.obj.position.y = f.base.y + hop * 0.15 * f.obj.scale.y;
    },
  };
}

function nestWithEggs(): Figure {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.26, 0.2, 9, 1, true), mat('#8a6440', { side: THREE.DoubleSide }));
  bowl.position.y = 0.1;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 4, 10), mat('#a07448'));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.2;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.3, 9), mat('#6d4e31'));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.05;
  g.add(bowl, rim, floor);
  for (let i = 0; i < 3; i++) {
    const egg = new THREE.Mesh(ellipsoid(0.1, 0.13, 0.1), mat('#9fd3e6', { rough: 0.4 }));
    const a = i * 2.1;
    egg.position.set(Math.cos(a) * 0.13, 0.15, Math.sin(a) * 0.13);
    egg.rotation.z = 0.3 * (i - 1);
    g.add(egg);
  }
  shadowAll(g);
  return { obj: g, phase: 0, base: new THREE.Vector3() };
}

function owl(): Figure {
  const g = new THREE.Group();
  const body = new THREE.Mesh(ellipsoid(0.3, 0.4, 0.28), mat('#8c7358'));
  body.position.y = 0.4;
  const face = new THREE.Mesh(ellipsoid(0.24, 0.2, 0.08), mat('#d8c3a2'));
  face.position.set(0.22, 0.6, 0);
  face.rotation.y = Math.PI / 2;
  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), new THREE.MeshStandardMaterial({ color: '#f2b632', emissive: '#f2a900', emissiveIntensity: 0.2, flatShading: true }));
    eye.position.set(0.29, 0.63, side * 0.1);
    const pupil = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), mat('#111'));
    pupil.position.set(0.35, 0.63, side * 0.1);
    for (const ear of [side]) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), mat('#6e5842'));
      tuft.position.set(0.05, 0.86, ear * 0.15);
      g.add(tuft);
    }
    g.add(eye, pupil);
    eyes.push(eye);
  }
  g.add(body, face);
  shadowAll(g);
  return {
    obj: g,
    phase: 0,
    base: new THREE.Vector3(),
    anim: (t) => {
      const blink = Math.sin(t * 0.8) > 0.985 ? 0.1 : 1;
      eyes.forEach((e) => (e.scale.y = blink));
    },
  };
}

function squirrel(): Figure {
  const g = new THREE.Group();
  const fur = mat('#8e4f2c');
  const body = new THREE.Mesh(ellipsoid(0.3, 0.2, 0.18), fur);
  body.position.set(0, 0.26, 0);
  body.rotation.z = 0.5;
  const belly = new THREE.Mesh(ellipsoid(0.18, 0.13, 0.14), mat('#c4623a'));
  belly.position.set(0.08, 0.2, 0);
  const head = new THREE.Mesh(ellipsoid(0.15, 0.13, 0.13), fur);
  head.position.set(0.26, 0.46, 0);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), fur);
    ear.position.set(0.22, 0.6, side * 0.07);
    const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), mat('#111'));
    eye.position.set(0.36, 0.5, side * 0.07);
    g.add(ear, eye);
  }
  const tail = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + i * 0.012, 0), mat(i % 2 ? '#7d4526' : '#94562f'));
    const a = i * 0.45;
    s.position.set(-0.25 - Math.sin(a) * 0.2, 0.2 + i * 0.1, 0);
    tail.add(s);
  }
  g.add(body, belly, head, tail);
  shadowAll(g);
  return {
    obj: g,
    phase: Math.random() * 5,
    base: new THREE.Vector3(),
    anim: (t, f) => {
      tail.rotation.z = Math.sin((t + f.phase) * 2.2) * 0.15;
      head.rotation.y = Math.sin((t + f.phase) * 0.6) * 0.3;
    },
  };
}

function butterfly(): Figure {
  const g = new THREE.Group();
  const wingMat = mat('#fbfbf2', { side: THREE.DoubleSide, flat: true });
  const tipMat = mat('#9ccf6a', { side: THREE.DoubleSide });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), mat('#333'));
  body.rotation.z = Math.PI / 2;
  const wings: THREE.Object3D[] = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.2, 6), wingMat);
    w.rotation.x = -Math.PI / 2;
    w.position.set(0.02, 0, side * 0.18);
    const tip = new THREE.Mesh(new THREE.CircleGeometry(0.05, 5), tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0.08, 0.005, side * 0.28);
    pivot.add(w, tip);
    g.add(pivot);
    wings.push(pivot);
  }
  g.add(body);
  return {
    obj: g,
    phase: 0,
    base: new THREE.Vector3(),
    wingL: wings[0],
    wingR: wings[1],
    anim: (t, f) => {
      const flap = Math.sin(t * 16) * 0.9;
      f.wingL!.rotation.x = flap;
      f.wingR!.rotation.x = -flap;
    },
  };
}

function ladybug(): Figure {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d8322b', { rough: 0.4 }));
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), mat('#1a1a1a'));
  head.position.set(0.15, 0.03, 0);
  g.add(shell, head);
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), mat('#111'));
    const a = i * 1.3;
    dot.position.set(Math.cos(a) * 0.08, 0.12, Math.sin(a) * 0.08);
    g.add(dot);
  }
  return { obj: g, phase: 0, base: new THREE.Vector3() };
}

function cicada(): Figure {
  const g = new THREE.Group();
  const body = new THREE.Mesh(ellipsoid(0.22, 0.09, 0.1), mat('#4d5a3a'));
  body.position.y = 0.09;
  const wing = new THREE.Mesh(ellipsoid(0.26, 0.02, 0.14, 0), mat('#dfeee6', { opacity: 0.6 }));
  wing.position.set(-0.05, 0.16, 0);
  const head = new THREE.Mesh(ellipsoid(0.07, 0.07, 0.12, 0), mat('#394530'));
  head.position.set(0.2, 0.1, 0);
  g.add(body, wing, head);
  return { obj: g, phase: 0, base: new THREE.Vector3() };
}

function muntjac(): Figure {
  const g = new THREE.Group();
  const fur = mat('#b7753f');
  const body = new THREE.Mesh(ellipsoid(0.5, 0.26, 0.22), fur);
  body.position.y = 0.62;
  const belly = new THREE.Mesh(ellipsoid(0.36, 0.14, 0.18), mat('#e9d2b0'));
  belly.position.y = 0.5;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.36, 5), fur);
  neck.position.set(0.42, 0.86, 0);
  neck.rotation.z = -0.6;
  const head = new THREE.Group();
  head.position.set(0.58, 1.02, 0);
  const skull = new THREE.Mesh(ellipsoid(0.17, 0.11, 0.1), fur);
  skull.position.x = 0.06;
  const nose = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), mat('#222'));
  nose.position.set(0.23, -0.02, 0);
  head.add(skull, nose);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), fur);
    ear.position.set(-0.03, 0.1, side * 0.08);
    ear.rotation.x = side * 0.5;
    const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.16, 3), mat('#5b4331'));
    antler.position.set(0.02, 0.14, side * 0.04);
    const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), mat('#111'));
    eye.position.set(0.12, 0.03, side * 0.07);
    head.add(ear, antler, eye);
  }
  const legs: THREE.Mesh[] = [];
  for (const [x, z] of [[0.32, 0.1], [0.32, -0.1], [-0.3, 0.1], [-0.3, -0.1]] as const) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.5, 4), mat('#8e5a30'));
    leg.position.set(x, 0.26, z);
    legs.push(leg);
    g.add(leg);
  }
  const tail = new THREE.Mesh(ellipsoid(0.07, 0.1, 0.06, 0), mat('#f1e3cc'));
  tail.position.set(-0.52, 0.72, 0);
  g.add(body, belly, neck, head, tail);
  shadowAll(g);
  return {
    obj: g,
    phase: 0,
    base: new THREE.Vector3(),
    anim: (t) => {
      const graze = Math.sin(t * 0.3) > 0.4;
      head.position.y = graze ? 0.62 : 1.02;
      head.position.x = graze ? 0.7 : 0.58;
      neck.rotation.z = graze ? -1.5 : -0.6;
      neck.position.set(graze ? 0.52 : 0.42, graze ? 0.66 : 0.86, 0);
      tail.rotation.z = Math.sin(t * 6) * 0.2;
    },
  };
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
  return { points: new THREE.Points(geo, m), seeds };
}

function faceYaw(dir: THREE.Vector3): number {
  return Math.atan2(-dir.z, dir.x);
}

export class Animals3D {
  /** Perched animals: parented to the swaying tree pivot. */
  readonly onTree = new THREE.Group();
  /** Animals that stay on the island ground. */
  readonly onGround = new THREE.Group();
  private figures = new Map<string, Figure>();
  private butterflyOrbit = { r: 1, y: 1 };
  private fly = fireflies();
  private flyBox = { r: 1, y: 1, h: 1 };
  private visible = new Set<string>();

  constructor() {
    this.fly.points.visible = false;
    this.onTree.add(this.fly.points);
  }

  figure(id: string): Figure | null {
    let f = this.figures.get(id);
    if (f) return f;
    if (BIRDS[id]) f = bird(BIRDS[id]!);
    else if (id === 'nest') f = nestWithEggs();
    else if (id === 'owl') f = owl();
    else if (id === 'squirrel') f = squirrel();
    else if (id === 'butterfly') f = butterfly();
    else if (id === 'ladybug') f = ladybug();
    else if (id === 'cicada') f = cicada();
    else if (id === 'muntjac') f = muntjac();
    else return null;
    this.figures.set(id, f);
    (id === 'muntjac' ? this.onGround : this.onTree).add(f.obj);
    return f;
  }

  /** Place unlocked animals on the current tree. */
  sync(ids: string[], tree: TreeBuild, health: number): void {
    const V = tree.height;
    const s = 0.2 + 0.09 * V;
    const show = new Set(ids.filter((id) => health >= 22 || id === 'sparrow' || id === 'butterfly'));
    this.visible = show;
    for (const f of this.figures.values()) f.obj.visible = false;

    const perches = tree.perches.slice();
    const take = (pref = 0): Perch | undefined => {
      if (!perches.length) return undefined;
      const i = Math.min(perches.length - 1, pref);
      return perches.splice(i, 1)[0];
    };
    const place = (id: string, perch: Perch | undefined, scale: number, yawBias = 0.6) => {
      const f = this.figure(id);
      if (!f || !perch) return;
      f.obj.visible = true;
      f.obj.scale.setScalar(scale);
      f.base.copy(perch.pos);
      f.obj.position.copy(perch.pos);
      const face = perch.out.clone().setY(0).normalize().lerp(new THREE.Vector3(0.3, 0, 1), yawBias).normalize();
      f.obj.rotation.set(0, faceYaw(face), 0);
    };

    const birdOrder = ['sparrow', 'bulbul', 'redbulbul', 'kingfisher', 'dove'];
    let pi = 0;
    for (const id of birdOrder) {
      if (!show.has(id)) continue;
      place(id, take(pi % 2 === 0 ? 0 : 2), s * (id === 'dove' ? 1.15 : 1));
      pi++;
    }
    if (show.has('magpierobin') && tree.nest) {
      const nest = this.figure('nest')!;
      nest.obj.visible = true;
      nest.obj.scale.setScalar(s * 0.9);
      nest.obj.position.copy(tree.nest.pos).add(new THREE.Vector3(0, tree.trunkRadius * 0.4, 0));
      const rob = this.figure('magpierobin')!;
      rob.obj.visible = true;
      rob.obj.scale.setScalar(s * 0.9);
      rob.base.copy(nest.obj.position).add(tree.nest.out.clone().multiplyScalar(s * 0.45)).add(new THREE.Vector3(0, s * 0.15, 0));
      rob.obj.position.copy(rob.base);
      rob.obj.rotation.set(0, faceYaw(new THREE.Vector3(0.3, 0, 1)), 0);
    } else if (show.has('magpierobin')) {
      place('magpierobin', take(1), s);
    }
    const spots = tree.trunkSpots;
    if (show.has('squirrel')) {
      const spot = spots[1] ?? tree.perches[0];
      const f = this.figure('squirrel')!;
      if (spot && spots.length) {
        f.obj.visible = true;
        f.obj.scale.setScalar(s);
        const pos = spot.pos.clone().addScaledVector(spot.out, s * 0.18);
        f.base.copy(pos);
        f.obj.position.copy(pos);
        // Climbing: body tipped head-up against the trunk.
        f.obj.rotation.set(0, faceYaw(spot.out) + Math.PI / 2, 0);
        f.obj.rotateZ(Math.PI / 2 - 0.2);
        f.obj.rotateY(Math.PI);
      } else place('squirrel', take(0), s);
    }
    if (show.has('woodpecker')) {
      const spot = spots[7] ?? spots[0];
      const f = this.figure('woodpecker')!;
      if (spot) {
        f.obj.visible = true;
        f.obj.scale.setScalar(s * 0.95);
        const pos = spot.pos.clone().addScaledVector(spot.out, s * 0.12);
        f.base.copy(pos);
        f.obj.position.copy(pos);
        f.obj.rotation.set(0, faceYaw(spot.out.clone().negate()), 0);
        f.obj.rotateZ(1.1);
      }
    }
    if (show.has('cicada')) {
      const spot = spots[3] ?? spots[0];
      const f = this.figure('cicada')!;
      if (spot) {
        f.obj.visible = true;
        f.obj.scale.setScalar(s * 0.8);
        f.obj.position.copy(spot.pos).addScaledVector(spot.out, s * 0.05);
        f.obj.rotation.set(0, faceYaw(spot.out.clone().negate()), Math.PI / 2);
      }
    }
    if (show.has('owl') && tree.hollow) {
      const f = this.figure('owl')!;
      f.obj.visible = true;
      f.obj.scale.setScalar(s * 0.75);
      f.obj.position.copy(tree.hollow.pos).add(new THREE.Vector3(0, -s * 0.35, 0));
      f.obj.rotation.set(0, faceYaw(tree.hollow.out), 0);
    }
    if (show.has('ladybug')) {
      const p = take(0);
      const f = this.figure('ladybug')!;
      if (p) {
        f.obj.visible = true;
        f.obj.scale.setScalar(Math.max(0.25, s * 0.7));
        f.obj.position.copy(p.pos);
        f.obj.rotation.set(0, faceYaw(p.out), 0);
      }
    }
    if (show.has('butterfly')) {
      const f = this.figure('butterfly')!;
      f.obj.visible = true;
      f.obj.scale.setScalar(Math.max(0.35, s * 0.9));
      this.butterflyOrbit = { r: tree.canopyRadius + 0.3 + s, y: Math.max(0.35, tree.height * 0.55) };
    }
    if (show.has('muntjac')) {
      const f = this.figure('muntjac')!;
      f.obj.visible = true;
      f.obj.scale.setScalar(Math.max(0.8, s * 1.1));
      const r = Math.max(1.8, Math.min(4.2, tree.canopyRadius * 0.8 + 1.2));
      f.obj.position.set(-r * 0.75, 0.17, r * 0.65);
      f.obj.rotation.set(0, faceYaw(new THREE.Vector3(0.9, 0, 0.3)), 0);
    }
    this.flyBox = { r: tree.canopyRadius + 0.6, y: tree.height * 0.25, h: tree.height * 0.8 };
    this.fly.points.visible = show.has('firefly');
    (this.fly.points.material as THREE.PointsMaterial).size = 0.2 + V * 0.02;
  }

  update(t: number, night: number): void {
    for (const [id, f] of this.figures) {
      if (!f.obj.visible) continue;
      f.anim?.(t, f);
      if (id === 'butterfly') {
        const o = this.butterflyOrbit;
        const a = t * 0.35;
        f.obj.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 1.3) * 0.25 * o.r * 0.3, Math.sin(a) * o.r);
        f.obj.rotation.set(0, -a - Math.PI / 2, 0);
      }
    }
    if (this.fly.points.visible) {
      const m = this.fly.points.material as THREE.PointsMaterial;
      m.opacity = night;
      this.fly.points.visible = night > 0.05 && this.visible.has('firefly');
      const pos = this.fly.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const sd = this.fly.seeds;
      const b = this.flyBox;
      for (let i = 0; i < pos.count; i++) {
        const a = sd[i * 3]! * 6.28 + t * 0.12 * (0.5 + sd[i * 3 + 1]!);
        const r = b.r * (0.4 + 0.6 * sd[i * 3 + 2]!);
        pos.setXYZ(i, Math.cos(a) * r, b.y + b.h * sd[i * 3 + 1]! + Math.sin(t * 0.8 + i) * 0.2, Math.sin(a) * r);
      }
      pos.needsUpdate = true;
    } else if (this.visible.has('firefly') && night > 0.05) {
      this.fly.points.visible = true;
    }
  }
}

/** Standalone figure for album thumbnails. */
export function albumFigure(id: string): THREE.Object3D | null {
  const a = new Animals3D();
  const f = a.figure(id === 'magpierobin' ? 'nest' : id);
  if (id === 'magpierobin') {
    const g = new THREE.Group();
    const nest = f!.obj;
    const rob = a.figure('magpierobin')!.obj;
    rob.position.set(0.1, 0.25, 0.3);
    rob.scale.setScalar(0.8);
    g.add(nest, rob);
    return g;
  }
  if (id === 'firefly') {
    const g = new THREE.Group();
    const body = new THREE.Mesh(ellipsoid(0.2, 0.08, 0.08), mat('#3b3325'));
    const glow = new THREE.Mesh(ellipsoid(0.1, 0.09, 0.09), new THREE.MeshStandardMaterial({ color: '#f6ff9a', emissive: '#e4ff5a', emissiveIntensity: 1.5 }));
    glow.position.x = -0.18;
    g.add(body, glow);
    return g;
  }
  return f?.obj ?? null;
}
