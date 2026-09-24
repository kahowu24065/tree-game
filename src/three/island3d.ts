import * as THREE from 'three';
import { mulberry32 } from '../util';
import { ellipsoid, jitterGeometry, mat, merge, paint } from './util3d';

export const ISLAND_R = 7;

export interface Island {
  group: THREE.Group;
  water: THREE.Texture;
  dirt: THREE.Mesh;
  update(t: number, wind: number): void;
}

function islandRadius(angle: number): number {
  return ISLAND_R * (1 + 0.035 * Math.sin(angle * 3 + 0.6) + 0.025 * Math.sin(angle * 7 + 1.9));
}

function waterTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#5bb6dc';
  g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(255,255,255,${0.12 + (i % 3) * 0.08})`;
    const x = (i * 23) % 64;
    const y = (i * 41) % 128;
    g.fillRect(x, y, 10 + (i % 4) * 5, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Stream path in island space, from a spring by the rocks to the front-right edge. */
export const STREAM_POINTS = [
  new THREE.Vector3(2.6, 0.03, -2.4),
  new THREE.Vector3(3.5, 0.03, -0.6),
  new THREE.Vector3(3.9, 0.03, 1.4),
  new THREE.Vector3(4.4, 0.03, 3.3),
  new THREE.Vector3(4.75, 0.03, 5.05),
];

function onStream(x: number, z: number, pad: number): boolean {
  for (let i = 0; i < STREAM_POINTS.length - 1; i++) {
    const a = STREAM_POINTS[i]!;
    const b = STREAM_POINTS[i + 1]!;
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz)));
    const dx = a.x + abx * t - x;
    const dz = a.z + abz * t - z;
    if (dx * dx + dz * dz < pad * pad) return true;
  }
  return false;
}

export function buildIsland(): Island {
  const rand = mulberry32(20260925);
  const group = new THREE.Group();

  // Grass top: a gently domed disc with an irregular rim.
  const top = new THREE.CylinderGeometry(ISLAND_R, ISLAND_R, 0.5, 40, 3);
  const pos = top.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, z);
    if (r > 0.01) {
      const a = Math.atan2(z, x);
      const k = islandRadius(a) / ISLAND_R;
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
    const dome = y > 0 ? 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2) : 0;
    pos.setY(i, y - 0.25 + dome);
  }
  top.computeVertexNormals();
  const grass = new THREE.Mesh(top, mat('#7cbd4f', { rough: 0.95 }));
  grass.receiveShadow = true;
  group.add(grass);

  // Earth rim and rocky underside: the floating island body.
  const rim = new THREE.CylinderGeometry(ISLAND_R * 1.0, ISLAND_R * 0.9, 0.9, 30, 2);
  jitterGeometry(rim, 0.35, 3, false);
  const rimMesh = new THREE.Mesh(rim, mat('#8a6446'));
  rimMesh.position.y = -0.9;
  group.add(rimMesh);
  const under = new THREE.ConeGeometry(ISLAND_R * 0.92, ISLAND_R * 1.35, 16, 4);
  under.rotateX(Math.PI);
  jitterGeometry(under, 0.9, 7, false);
  paint(under, (y) => new THREE.Color().lerpColors(new THREE.Color('#6d6a66'), new THREE.Color('#8f7155'), THREE.MathUtils.clamp((y + 6) / 6, 0, 1)));
  const underMesh = new THREE.Mesh(under, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  underMesh.position.y = -1.35 - (ISLAND_R * 1.35) / 2;
  group.add(underMesh);

  // Dirt around the trunk.
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(1.1, 18), mat('#8c6a48'));
  dirt.rotation.x = -Math.PI / 2;
  dirt.position.y = 0.185;
  dirt.receiveShadow = true;
  group.add(dirt);

  // Stream ribbon plus waterfall off the edge.
  const water = waterTexture();
  const curve = new THREE.CatmullRomCurve3(STREAM_POINTS);
  const samples = 40;
  const verts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const w = 0.32 + 0.12 * Math.sin(t * 9);
    const dome = 0.18 * (1 - Math.min(1, Math.hypot(p.x, p.z) / ISLAND_R) ** 2);
    const y = 0.02 + dome;
    verts.push(p.x + side.x * w, y, p.z + side.z * w, p.x - side.x * w, y, p.z - side.z * w);
    uvs.push(0, t * 6, 1, t * 6);
    if (i < samples) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const streamGeo = new THREE.BufferGeometry();
  streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  streamGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  streamGeo.setIndex(idx);
  streamGeo.computeVertexNormals();
  const waterMat = new THREE.MeshStandardMaterial({ map: water, roughness: 0.25, metalness: 0.05, emissive: '#1d5f80', emissiveIntensity: 0.25 });
  const stream = new THREE.Mesh(streamGeo, waterMat);
  stream.receiveShadow = true;
  group.add(stream);
  const bank = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.1, 4, false), mat('#9aa0a3'));
  bank.scale.set(1, 0.4, 1);
  bank.position.y = 0.1;
  const end = STREAM_POINTS[STREAM_POINTS.length - 1]!;
  const fallTex = water.clone();
  fallTex.needsUpdate = true;
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 5, 1, 4),
    new THREE.MeshStandardMaterial({ map: fallTex, transparent: true, opacity: 0.8, roughness: 0.3, side: THREE.DoubleSide, emissive: '#2a7aa0', emissiveIntensity: 0.3 }),
  );
  fall.position.set(end.x + 0.05, -2.45, end.z + 0.08);
  fall.rotation.y = -Math.atan2(end.x, end.z) + Math.PI / 2 - Math.PI / 2;
  group.add(fall);
  const spray = new THREE.Mesh(ellipsoid(0.5, 0.25, 0.5, 0), mat('#e8f6fb', { opacity: 0.6 }));
  spray.position.set(end.x, -4.9, end.z);
  group.add(spray);

  // Wooden bridge over the stream near the edge.
  const bridge = new THREE.Group();
  const plankGeo = new THREE.BoxGeometry(0.28, 0.06, 1.3);
  for (let i = 0; i < 6; i++) {
    const plank = new THREE.Mesh(plankGeo, mat(i % 2 ? '#a0714a' : '#b07f55'));
    const t = (i - 2.5) / 2.5;
    plank.position.set(i * 0.3 - 0.75, 0.32 + 0.12 * (1 - t * t), 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    bridge.add(plank);
  }
  for (const side of [-0.62, 0.62]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.06), mat('#7d5535'));
    rail.position.set(0, 0.66, side);
    bridge.add(rail);
    for (const x of [-0.85, 0, 0.85]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.07), mat('#7d5535'));
      post.position.set(x, 0.47, side);
      post.castShadow = true;
      bridge.add(post);
    }
  }
  const bp = curve.getPoint(0.8);
  const bt = curve.getTangent(0.8);
  bridge.position.set(bp.x, 0.0, bp.z);
  bridge.rotation.y = -Math.atan2(bt.z, bt.x) + Math.PI / 2;
  group.add(bridge);

  // Fence around most of the rim; the front-right gap lets the stream out.
  const postGeo = new THREE.BoxGeometry(0.14, 0.75, 0.14);
  const railGeo = new THREE.BoxGeometry(1, 0.07, 0.06);
  const posts: THREE.Matrix4[] = [];
  const rails: THREE.Matrix4[] = [];
  const start = 1.2;
  const endA = start + Math.PI * 1.55;
  const steps = 30;
  let prev: THREE.Vector3 | null = null;
  for (let i = 0; i <= steps; i++) {
    const a = start + ((endA - start) * i) / steps;
    const r = islandRadius(a) - 0.35;
    const p = new THREE.Vector3(Math.cos(a) * r, 0.0, Math.sin(a) * r);
    const dome = 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
    p.y = dome;
    posts.push(new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y + 0.37, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, (rand() - 0.5) * 0.08)), new THREE.Vector3(1, 0.85 + rand() * 0.3, 1)));
    if (prev) {
      const mid = prev.clone().add(p).multiplyScalar(0.5);
      const len = prev.distanceTo(p);
      const ry = -Math.atan2(p.z - prev.z, p.x - prev.x);
      for (const h of [0.28, 0.56]) {
        rails.push(new THREE.Matrix4().compose(new THREE.Vector3(mid.x, mid.y + h, mid.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(len, 1, 1)));
      }
    }
    prev = p;
  }
  const postMesh = new THREE.InstancedMesh(postGeo, mat('#9b6b43'), posts.length);
  posts.forEach((m, i) => postMesh.setMatrixAt(i, m));
  postMesh.castShadow = true;
  group.add(postMesh);
  const railMesh = new THREE.InstancedMesh(railGeo, mat('#b0815a'), rails.length);
  rails.forEach((m, i) => railMesh.setMatrixAt(i, m));
  railMesh.castShadow = true;
  group.add(railMesh);

  // Rocks: a cluster by the spring, a few scattered near the rim.
  const rockSpots: [number, number, number][] = [
    [2.9, -2.9, 0.75], [2.1, -2.6, 0.45], [3.4, -2.1, 0.5], [5.2, 1.9, 0.6], [5.5, 2.8, 0.4],
    [-4.6, 2.6, 0.55], [-3.9, 3.4, 0.35], [-5.3, -1.2, 0.5], [-1.6, -5.2, 0.6], [0.8, -5.6, 0.4], [1.8, 4.4, 0.3], [-2.4, 4.8, 0.45],
  ];
  const rockGeos: THREE.BufferGeometry[] = [];
  rockSpots.forEach(([x, z, s], i) => {
    const g = new THREE.DodecahedronGeometry(s, 0);
    jitterGeometry(g, s * 0.35, i * 3.1, false);
    g.scale(1, 0.7, 1);
    g.rotateY(i);
    const dome = 0.18 * (1 - Math.min(1, Math.hypot(x, z) / ISLAND_R) ** 2);
    g.translate(x, dome + s * 0.25, z);
    paint(g, new THREE.Color().setHSL(0.08, 0.04, 0.55 + (i % 3) * 0.06));
    rockGeos.push(g);
  });
  const rocks = new THREE.Mesh(merge(rockGeos, true), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  group.add(rocks);

  // Stepping stones from the bridge toward the tree.
  const stones: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = 1.2 + (bp.x - 1.5 - 1.2) * t;
    const z = 1.0 + (bp.z - 1.0) * t;
    const g = new THREE.CylinderGeometry(0.22 + rand() * 0.08, 0.26, 0.06, 7);
    const dome = 0.18 * (1 - Math.min(1, Math.hypot(x, z) / ISLAND_R) ** 2);
    g.translate(x + (rand() - 0.5) * 0.3, dome + 0.02, z + (rand() - 0.5) * 0.3);
    stones.push(g);
  }
  const stoneMesh = new THREE.Mesh(merge(stones), mat('#c9c2b4'));
  stoneMesh.receiveShadow = true;
  group.add(stoneMesh);

  // Grass tufts and flowers (instanced, cheap).
  const tuftGeo = new THREE.ConeGeometry(0.045, 0.16, 3);
  tuftGeo.translate(0, 0.08, 0);
  const tuftCount = 480;
  const tufts = new THREE.InstancedMesh(tuftGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), tuftCount);
  const flowerGeo = new THREE.IcosahedronGeometry(0.07, 0);
  const flowerCount = 120;
  const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.7 }), flowerCount);
  const flowerColors = ['#ffffff', '#fff6d8', '#f7b7c8', '#f3d35b', '#c9b3f0', '#ffffff'];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  let placed = 0;
  let fplaced = 0;
  for (let guard = 0; guard < 4000 && (placed < tuftCount || fplaced < flowerCount); guard++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (ISLAND_R - 0.6);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (r < 1.2 || onStream(x, z, 0.55)) continue;
    const dome = 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
    if (placed < tuftCount && rand() < 0.75) {
      q.setFromEuler(new THREE.Euler((rand() - 0.5) * 0.4, rand() * 6, (rand() - 0.5) * 0.4));
      const s = 0.6 + rand() * 0.9;
      m.compose(new THREE.Vector3(x, dome, z), q, new THREE.Vector3(s, s * (0.8 + rand() * 0.6), s));
      tufts.setMatrixAt(placed, m);
      tufts.setColorAt(placed, c.setHSL(0.24 + rand() * 0.06, 0.5, 0.36 + rand() * 0.14));
      placed++;
    } else if (fplaced < flowerCount) {
      const s = 0.7 + rand() * 0.8;
      m.compose(new THREE.Vector3(x, dome + 0.12, z), q.identity(), new THREE.Vector3(s, s * 0.7, s));
      flowers.setMatrixAt(fplaced, m);
      flowers.setColorAt(fplaced, c.set(flowerColors[Math.floor(rand() * flowerColors.length)]!));
      fplaced++;
    }
  }
  tufts.count = placed;
  flowers.count = fplaced;
  tufts.receiveShadow = true;
  group.add(tufts, flowers);

  // Small bushes near the fence for a fuller rim.
  const bushGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const a = start + rand() * (endA - start);
    const r = islandRadius(a) - 0.9 - rand() * 0.5;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (onStream(x, z, 0.8)) continue;
    const s = 0.35 + rand() * 0.35;
    const g = new THREE.IcosahedronGeometry(s, 1);
    jitterGeometry(g, s * 0.3, i, true);
    g.scale(1, 0.75, 1);
    const dome = 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
    g.translate(x, dome + s * 0.5, z);
    paint(g, (y) => new THREE.Color().setHSL(0.27, 0.45, 0.3 + (y - dome) * 0.25));
    bushGeos.push(g);
  }
  const bushes = new THREE.Mesh(merge(bushGeos, true), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
  bushes.castShadow = true;
  bushes.receiveShadow = true;
  group.add(bushes);

  return {
    group,
    water,
    dirt,
    update(t: number, wind: number) {
      water.offset.y = -t * 0.25;
      fallTex.offset.y = t * 0.9;
      spray.scale.setScalar(1 + Math.sin(t * 5) * 0.06);
      void wind;
    },
  };
}
