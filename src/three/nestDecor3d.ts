import * as THREE from 'three';
import type { NestBuildKind } from '../nest';
import { ISLAND_R } from './island3d';
import { mat } from './util3d';

/** Sites in earn order: 風車、銅像、屋仔、涼亭, then the same four again. */
const SITES: { x: number; z: number; rot: number }[] = [
  { x: -4.55, z: -2.35, rot: 0.7 },
  { x: 1.2, z: -3.35, rot: -0.4 },
  { x: -0.35, z: -4.15, rot: 0.2 },
  { x: -5.0, z: 0.85, rot: 1.1 },
  { x: 4.05, z: -3.75, rot: -0.4 },
  { x: 1.55, z: 3.45, rot: 2.2 },
  { x: -4.15, z: 3.15, rot: -0.8 },
  { x: -0.2, z: 4.75, rot: 2.6 },
];

export interface NestDecor {
  group: THREE.Group;
  blades: THREE.Object3D[];
  obstacles: { x: number; z: number; r: number }[];
}

const sandMat = mat('#c6b48c', { side: THREE.DoubleSide });
const stoneMat = mat('#9a958c');
const wallMat = mat('#f3efe6');
const roofMat = mat('#5b6670');
const pavilionRoofMat = mat('#c45c3a');
const woodMat = mat('#8a5a3a');
const bronzeMat = mat('#b08a52', { rough: 0.4 });

function domeY(x: number, z: number): number {
  return 0.18 * (1 - Math.min(1, Math.hypot(x, z) / ISLAND_R) ** 2);
}

function shade(mesh: THREE.Mesh): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addWindmill(g: THREE.Group): THREE.Object3D {
  const pad = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.08, 10), stoneMat));
  pad.position.y = 0.04;
  const base = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.28, 8), mat('#cfc6b4')));
  base.position.y = 0.2;
  const tower = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.35, 8), wallMat));
  tower.position.y = 0.98;
  const door = shade(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.04), woodMat));
  door.position.set(0, 0.28, 0.4);
  const cap = shade(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.38, 8), roofMat));
  cap.position.y = 1.82;
  const hub = shade(new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mat('#3e4650')));
  hub.position.set(0, 1.42, 0.32);
  const blades = new THREE.Group();
  blades.position.set(0, 1.42, 0.36);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI) / 2;
    const spar = shade(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.04), woodMat));
    spar.position.y = 0.58;
    const sail = shade(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.02), mat('#f7f3ea')));
    sail.position.set(0.12, 0.62, 0.03);
    arm.add(spar, sail);
    blades.add(arm);
  }
  g.add(pad, base, tower, door, cap, hub, blades);
  return blades;
}

function addStatue(g: THREE.Group): void {
  const dais = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.1, 12), stoneMat));
  dais.position.y = 0.05;
  const plinth = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.28, 8), mat('#d9d2c4')));
  plinth.position.y = 0.22;
  const legL = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.34, 6), bronzeMat));
  legL.position.set(-0.08, 0.5, 0);
  const legR = legL.clone();
  legR.position.x = 0.08;
  const robe = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 7), bronzeMat));
  robe.position.y = 0.84;
  const head = shade(new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), bronzeMat));
  head.position.y = 1.2;
  for (const side of [-1, 1]) {
    const arm = shade(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.05), bronzeMat));
    arm.position.set(side * 0.2, 0.86, 0.02);
    arm.rotation.z = side * 0.15;
    g.add(arm);
  }
  g.add(dais, plinth, legL, legR, robe, head);
}

function addHouse(g: THREE.Group): void {
  const s = 0.92;
  const pad = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.85 * s, 0.95 * s, 0.06, 10), sandMat));
  pad.position.y = 0.03;
  const step = shade(new THREE.Mesh(new THREE.BoxGeometry(0.36 * s, 0.08, 0.28 * s), stoneMat));
  step.position.set(0.55 * s, 0.06, 0);
  const bodyW = 1.25 * s;
  const bodyD = 0.95 * s;
  const bodyH = 0.72 * s;
  const body = shade(new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), wallMat));
  body.position.y = 0.4 * s;
  // Turn the pyramid so its faces match the walls, then stretch. Object scale runs before rotation, which left a wall corner sticking out.
  const roofH = 0.48 * s;
  const eave = 0.12 * s;
  const roofGeo = new THREE.CylinderGeometry(0.02, 1, roofH, 4);
  roofGeo.rotateY(Math.PI / 4);
  const face = Math.SQRT1_2;
  roofGeo.scale((bodyW / 2 + eave) / face, 1, (bodyD / 2 + eave) / face);
  const roof = shade(new THREE.Mesh(roofGeo, roofMat));
  roof.position.y = body.position.y + bodyH / 2 + roofH / 2 - 0.05;
  const door = shade(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38 * s, 0.22 * s), woodMat));
  door.position.set(bodyW / 2 + 0.02, 0.22 * s, 0);
  const chimney = shade(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), mat('#8d4d3d')));
  const hx = bodyW / 2 + eave;
  const hz = bodyD / 2 + eave;
  const cx = -0.28 * s;
  const cz = -0.1 * s;
  const along = Math.max(Math.abs(cx) / hx, Math.abs(cz) / hz);
  const roofTop = roof.position.y + roofH / 2;
  chimney.position.set(cx, roofTop - along * roofH + 0.1, cz);
  g.add(pad, step, body, roof, door, chimney);
}

function addPavilion(g: THREE.Group): void {
  const pad = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.9, 0.07, 12), stoneMat));
  pad.position.y = 0.035;
  const floor = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.66, 0.05, 10), sandMat));
  floor.position.y = 0.08;
  const postH = 0.78;
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const post = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, postH, 6), woodMat));
      post.position.set(x * 0.42, 0.12 + postH / 2, z * 0.42);
      g.add(post);
    }
  }
  const beamY = 0.12 + postH - 0.05;
  for (const side of [-1, 1]) {
    const alongX = shade(new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.06, 0.06), woodMat));
    alongX.position.set(0, beamY, side * 0.42);
    const alongZ = shade(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.94), woodMat));
    alongZ.position.set(side * 0.42, beamY, 0);
    g.add(alongX, alongZ);
  }
  const seat = shade(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.16), woodMat));
  seat.position.set(0, 0.3, -0.2);
  const seatLeg = shade(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.04), woodMat));
  seatLeg.position.set(0, 0.2, -0.2);
  const span = 0.66;
  const roofH = 0.34;
  const roofGeo = new THREE.CylinderGeometry(0.02, 1, roofH, 4);
  roofGeo.rotateY(Math.PI / 4);
  const face = Math.SQRT1_2;
  roofGeo.scale(span / face, 1, span / face);
  const roof = shade(new THREE.Mesh(roofGeo, pavilionRoofMat));
  roof.position.y = beamY + roofH / 2 - 0.02;
  g.add(pad, floor, seat, seatLeg, roof);
}

/** Island-unit site for decoration index (0 = the first hatch). */
export function nestSite(index: number): { x: number; z: number; y: number; rot: number } {
  const site = SITES[index % SITES.length]!;
  return { x: site.x, z: site.z, y: domeY(site.x, site.z), rot: site.rot };
}

/** One decoration, unpositioned, feet at y = 0. The caller places it. */
export function nestPiece(kind: NestBuildKind): { group: THREE.Group; blades: THREE.Object3D | null } {
  const group = new THREE.Group();
  let blades: THREE.Object3D | null = null;
  if (kind === 'windmill') blades = addWindmill(group);
  else if (kind === 'statue') addStatue(group);
  else if (kind === 'house') addHouse(group);
  else addPavilion(group);
  return { group, blades };
}

/** One mesh group for every decoration this tree has earned. Positions are in island units. */
export function buildNestDecor(kinds: readonly NestBuildKind[]): NestDecor {
  const group = new THREE.Group();
  const blades: THREE.Object3D[] = [];
  const obstacles: { x: number; z: number; r: number }[] = [];
  kinds.forEach((kind, i) => {
    const site = nestSite(i);
    const built = nestPiece(kind);
    built.group.position.set(site.x, site.y, site.z);
    built.group.rotation.y = site.rot;
    if (built.blades) blades.push(built.blades);
    group.add(built.group);
    const r = kind === 'statue' ? 0.42 : kind === 'windmill' ? 0.7 : 0.68;
    obstacles.push({ x: site.x, z: site.z, r });
  });
  return { group, blades, obstacles };
}
