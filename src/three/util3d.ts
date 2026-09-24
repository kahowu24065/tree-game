import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const matCache = new Map<string, THREE.MeshStandardMaterial>();

/** Shared flat-shaded stylised material, cached by colour and options. */
export function mat(color: THREE.ColorRepresentation, opts: { rough?: number; emissive?: THREE.ColorRepresentation; transparent?: boolean; opacity?: number; side?: THREE.Side; flat?: boolean } = {}): THREE.MeshStandardMaterial {
  const key = `${new THREE.Color(color).getHexString()}|${opts.rough ?? 0.85}|${opts.emissive ?? ''}|${opts.opacity ?? 1}|${opts.side ?? 0}|${opts.flat ?? true}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: 0,
      flatShading: opts.flat ?? true,
      emissive: opts.emissive ?? 0x000000,
      transparent: opts.transparent ?? (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
    });
    matCache.set(key, m);
  }
  return m;
}

/** Deterministic value noise from a position, so split vertices displace identically (no cracks). */
export function noise3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

export function jitterGeometry(geo: THREE.BufferGeometry, amount: number, seed = 0, radial = true): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const kx = Math.round(v.x * 1000) / 1000;
    const ky = Math.round(v.y * 1000) / 1000;
    const kz = Math.round(v.z * 1000) / 1000;
    const n = noise3(kx + seed, ky - seed * 0.37, kz + seed * 0.71) - 0.5;
    if (radial) {
      const len = v.length() || 1;
      v.multiplyScalar((len + n * amount) / len);
    } else {
      v.x += (noise3(kx, ky, kz + seed) - 0.5) * amount;
      v.y += n * amount;
      v.z += (noise3(kz, kx, ky + seed) - 0.5) * amount;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Tapered limb from a to b. */
export function limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, sides = 6): THREE.BufferGeometry {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, sides, 1, false);
  geo.translate(0, len / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  geo.applyQuaternion(q);
  geo.translate(a.x, a.y, a.z);
  return geo;
}

export function paint(geo: THREE.BufferGeometry, color: THREE.Color | ((y: number, i: number) => THREE.Color)): THREE.BufferGeometry {
  const pos = geo.getAttribute('position');
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const c = typeof color === 'function' ? color(pos.getY(i), i) : color;
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** Merge after normalising attributes so mixed primitives can share one draw call. */
export function merge(geos: THREE.BufferGeometry[], withColor = false): THREE.BufferGeometry {
  const prepared = geos.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    n.deleteAttribute('uv');
    if (!withColor) n.deleteAttribute('color');
    else if (!n.getAttribute('color')) paint(n, new THREE.Color(1, 1, 1));
    return n;
  });
  const merged = prepared.length ? mergeGeometries(prepared, false) : new THREE.BufferGeometry();
  prepared.forEach((g) => g.dispose());
  return merged ?? new THREE.BufferGeometry();
}

export function disposeTree(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
}

export function ellipsoid(rx: number, ry: number, rz: number, detail = 1): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, detail);
  g.scale(rx, ry, rz);
  return g;
}

export function shadowAll(obj: THREE.Object3D, cast = true, receive = false): THREE.Object3D {
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
  return obj;
}
