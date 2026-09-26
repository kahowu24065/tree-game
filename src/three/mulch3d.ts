import * as THREE from 'three';

/**
 * v15.2 保暖 = 根部防護（覆蓋法）: a 5–10 cm layer of bark, dry leaves, straw and wood chips on the soil round the
 * roots. Built in a unit disc (outer radius 1, inner radius `innerRatio`) and scaled to the scene; the layer is a low
 * raised ring with instanced pieces on top. `lay()` plays a ~2 s laying animation (pieces drop and spread);
 * otherwise it just appears.
 */
interface Piece {
  mesh: THREE.InstancedMesh;
  index: number;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: THREE.Vector3;
  start: number;
  from: THREE.Vector3;
}

const LAY_S = 2;
/** Layer thickness (unit-disc units): ~7 cm on a ~1 m root zone, exaggerated a little so it reads from the camera. */
export const MULCH_THICK = 0.045;

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Mulch3D {
  group = new THREE.Group();
  private bed: THREE.Mesh;
  private pieces: Piece[] = [];
  private meshes: THREE.InstancedMesh[] = [];
  private layT = -1;
  private visible = false;
  private m4 = new THREE.Matrix4();
  readonly innerRatio: number;

  constructor(innerRatio: number, quality: 'low' | 'high') {
    this.innerRatio = innerRatio;
    const inner = Math.min(0.85, Math.max(0.02, innerRatio));
    const rand = rng(Math.round(inner * 1000) + 7);
    // Raised bed: a lathe profile from the trunk to the rim, dark mixed mulch colour with a little noise.
    const T = MULCH_THICK;
    const pts = [
      new THREE.Vector2(inner, T * 0.35),
      new THREE.Vector2(inner + 0.04, T),
      new THREE.Vector2((inner + 1) / 2, T * 1.08),
      new THREE.Vector2(0.94, T * 0.8),
      new THREE.Vector2(1.0, 0.0),
    ];
    const bedGeo = new THREE.LatheGeometry(pts, 40);
    const pos = bedGeo.getAttribute('position') as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const n = Math.sin(x * 37.1 + z * 11.7) * 0.5 + Math.sin(x * 13.3 - z * 29.9) * 0.5;
      c.set('#3f2816').lerp(new THREE.Color('#6e4526'), 0.5 + n * 0.4);
      col.set([c.r, c.g, c.b], i * 3);
      // Wavy rim so it doesn't look machined.
      const a = Math.atan2(z, x);
      const r = Math.hypot(x, z);
      if (r > 0.97) {
        const k = 1 + 0.035 * Math.sin(a * 7 + 1) + 0.025 * Math.sin(a * 13);
        pos.setX(i, x * k);
        pos.setZ(i, z * k);
      }
    }
    bedGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    bedGeo.computeVertexNormals();
    this.bed = new THREE.Mesh(bedGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
    this.bed.receiveShadow = true;
    this.group.add(this.bed);

    const k = quality === 'high' ? 1 : 0.75;
    // Bark chips: chunky flat slabs.
    this.scatter(new THREE.BoxGeometry(1, 0.35, 0.55), ['#6b4024', '#8a5530', '#a0663a', '#553219'], Math.round(130 * k), [0.08, 0.13], [1, 1], rand, inner);
    // Dry leaves: flat ovals in autumn colours.
    const leaf = new THREE.CircleGeometry(0.5, 7);
    leaf.scale(1, 0.55, 1);
    leaf.rotateX(-Math.PI / 2);
    this.scatter(leaf, ['#e0892e', '#c8561f', '#e8b04a', '#b8742e', '#d46a2a'], Math.round(90 * k), [0.12, 0.19], [1, 1], rand, inner, true);
    // Straw: long thin golden strands.
    this.scatter(new THREE.BoxGeometry(1, 0.1, 0.1), ['#ecd07a', '#dcb95e', '#f6e29a', '#d0aa50'], Math.round(140 * k), [0.2, 0.32], [1, 1], rand, inner);
    // Wood chips: small pale blocks.
    this.scatter(new THREE.BoxGeometry(1, 0.4, 0.7), ['#d9b88a', '#c9a070', '#e8cfa2'], Math.round(80 * k), [0.06, 0.1], [1, 1], rand, inner);
    this.group.visible = false;
  }

  private scatter(geo: THREE.BufferGeometry, colours: string[], n: number, size: [number, number], _y: [number, number], rand: () => number, inner: number, flat = false): void {
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true, side: flat ? THREE.DoubleSide : THREE.FrontSide }), n);
    mesh.receiveShadow = true;
    const cols = colours.map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      // Uniform over the ring area, kept a little in from both edges.
      const r0 = inner + 0.03;
      const r1 = 0.95;
      const r = Math.sqrt(r0 * r0 + rand() * (r1 * r1 - r0 * r0));
      const s = size[0] + rand() * (size[1] - size[0]);
      const edge = 1 - Math.max(0, (r - 0.8) / 0.2);
      const pos = new THREE.Vector3(Math.cos(a) * r, MULCH_THICK * (0.75 + 0.35 * edge) + rand() * 0.012, Math.sin(a) * r);
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.5, rand() * Math.PI * 2, (rand() - 0.5) * 0.4));
      const scale = new THREE.Vector3(s, s, s);
      mesh.setColorAt(i, cols[Math.floor(rand() * cols.length)]!.clone().multiplyScalar(0.9 + rand() * 0.2));
      const from = new THREE.Vector3((rand() - 0.5) * 0.25, 0.5 + rand() * 0.5, (rand() - 0.5) * 0.25);
      this.pieces.push({ mesh, index: i, pos, quat, scale, start: rand() * (LAY_S - 0.55), from });
      mesh.setMatrixAt(i, this.m4.compose(pos, quat, scale));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.meshes.push(mesh);
    this.group.add(mesh);
  }

  /** Start the laying animation (`t` = scene seconds). */
  lay(t: number): void {
    this.layT = t;
  }

  /** Is the laying animation running? */
  laying(t: number): boolean {
    return this.layT >= 0 && t - this.layT < LAY_S;
  }

  setVisible(on: boolean): void {
    if (on && !this.visible) this.reset();
    this.visible = on;
    if (!on) this.layT = -1;
  }

  /** Everything at rest in place (no animation). */
  private reset(): void {
    this.layT = -1;
    this.bed.scale.set(1, 1, 1);
    for (const pc of this.pieces) pc.mesh.setMatrixAt(pc.index, this.m4.compose(pc.pos, pc.quat, pc.scale));
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true;
  }

  isVisible(): boolean {
    return this.visible;
  }

  update(t: number): void {
    this.group.visible = this.visible;
    if (!this.visible || this.layT < 0) return;
    const a = t - this.layT;
    const done = a >= LAY_S;
    // Bed spreads out from the trunk and rises.
    const b = done ? 1 : Math.min(1, a / (LAY_S * 0.8));
    const e = 1 - Math.pow(1 - b, 3);
    this.bed.scale.set(0.55 + 0.45 * e, Math.max(0.01, e), 0.55 + 0.45 * e);
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    for (const pc of this.pieces) {
      const u = done ? 1 : Math.max(0, Math.min(1, (a - pc.start) / 0.55));
      if (u <= 0) sc.setScalar(0.0001);
      else sc.copy(pc.scale).multiplyScalar(0.5 + 0.5 * u);
      const f = (1 - u) * (1 - u);
      // Drops in from above the trunk side and slides out to its spot.
      p.set(pc.pos.x * (0.6 + 0.4 * u) + pc.from.x * f, pc.pos.y + pc.from.y * f, pc.pos.z * (0.6 + 0.4 * u) + pc.from.z * f);
      pc.mesh.setMatrixAt(pc.index, this.m4.compose(p, pc.quat, sc));
    }
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true;
    if (done) this.layT = -1;
  }

  dispose(): void {
    this.bed.geometry.dispose();
    (this.bed.material as THREE.Material).dispose();
    for (const m of this.meshes) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      m.dispose();
    }
  }
}
