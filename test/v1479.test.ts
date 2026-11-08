// 1.4.79: butterflies and small birds stop sharing one silhouette.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { APP_VERSION } from '../src/version';
import { ANIMALS, animalById } from '../src/data/animals';
import { albumFigure, realScale } from '../src/three/animals3d';

function wingLocal(id: string): { n: number; minX: number; maxX: number; minZ: number; maxZ: number } {
  const fig = albumFigure(id);
  expect(fig, id).toBeTruthy();
  const wing = fig!.getObjectByName('wingL') as THREE.Mesh | undefined;
  expect(wing?.geometry, id).toBeTruthy();
  const pos = wing!.geometry.getAttribute('position');
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    expect(Number.isFinite(x + y + z), id).toBe(true);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { n: pos.count, minX, maxX, minZ, maxZ };
}

function wingReach(id: string): number {
  const fig = albumFigure(id)!;
  fig.traverse((o) => o.rotation.set(0, 0, 0));
  fig.updateMatrixWorld(true);
  let reach = 0;
  for (const name of ['wingL', 'wingL2']) {
    const mesh = fig.getObjectByName(name) as THREE.Mesh | undefined;
    if (!mesh?.geometry) continue;
    const box = new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position') as THREE.BufferAttribute);
    box.applyMatrix4(mesh.matrixWorld);
    reach = Math.max(reach, Math.abs(box.max.z), Math.abs(box.min.z));
  }
  return reach;
}

function headHeight(id: string): number {
  const fig = albumFigure(id)!;
  const head = fig.getObjectByName('head') as THREE.Mesh;
  head.geometry.computeBoundingBox();
  return head.geometry.boundingBox!.getSize(new THREE.Vector3()).y;
}

describe('1.4.79 species silhouettes', () => {
  it('version 1.4.80 / versionCode 87', () => {
    expect(APP_VERSION).toBe('1.4.80');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+87/);
    expect(g).toContain('1.4.80');
  });

  it('each butterfly and moth has its own wing outline', () => {
    const ids = ['butterfly', 'nightmoth', 'plaintiger', 'bluebottle', 'birdwing', 'atlasmoth'];
    const sigs = ids.map((id) => {
      const b = wingLocal(id);
      return `${b.n}:${b.minX.toFixed(2)}:${b.maxX.toFixed(2)}:${b.minZ.toFixed(2)}:${b.maxZ.toFixed(2)}`;
    });
    expect(new Set(sigs).size).toBe(ids.length);
    const byId = Object.fromEntries(ids.map((id, i) => [id, wingLocal(id)]));
    expect(byId.atlasmoth!.maxZ - byId.atlasmoth!.minZ).toBeGreaterThan((byId.nightmoth!.maxZ - byId.nightmoth!.minZ) * 1.25);
    expect(byId.bluebottle!.minX).toBeLessThan(byId.butterfly!.minX - 0.08);
    expect(byId.plaintiger!.maxZ).toBeGreaterThan(byId.butterfly!.maxZ);
    expect(byId.birdwing!.maxZ).toBeGreaterThan(byId.plaintiger!.maxZ);
    expect(animalById('plaintiger')!.look.f).toContain('tiger');
    expect(animalById('bluebottle')!.look.f).toContain('tails');
    expect(animalById('birdwing')!.look.f).toContain('birdwing');
    expect(animalById('atlasmoth')!.look.f).toEqual(expect.arrayContaining(['moth', 'atlas']));
    expect(animalById('nightmoth')!.look.f).toContain('moth');
    expect(animalById('nightmoth')!.look.f).not.toContain('atlas');
  });

  it('small birds use three body plans and keep the old shape flags', () => {
    const swallow = wingReach('swallow');
    const sparrow = wingReach('sparrow');
    const king = wingReach('kingfisher');
    expect(swallow).toBeGreaterThan(sparrow * 1.35);
    expect(wingReach('wagtail')).toBeGreaterThan(sparrow * 1.2);
    expect(wingReach('sunbird')).toBeGreaterThan(sparrow * 1.2);
    expect(king).toBeLessThan(sparrow * 0.9);
    expect(wingReach('woodpecker')).toBeLessThan(sparrow * 0.95);
    expect(headHeight('kingfisher')).toBeGreaterThan(headHeight('sparrow') * 1.15);
    expect(headHeight('sunbird')).toBeLessThan(headHeight('sparrow') * 0.9);
    expect(animalById('swallow')!.look.f).toEqual(expect.arrayContaining(['forkTail', 'pointed']));
    expect(animalById('wagtail')!.look.f).toEqual(expect.arrayContaining(['longTail', 'mask', 'pointed']));
    expect(animalById('sunbird')!.look.f).toEqual(expect.arrayContaining(['longBeak', 'longTail', 'pointed']));
    expect(animalById('parakeet')!.look.f).toEqual(expect.arrayContaining(['longTail', 'hooked', 'collar', 'pointed']));
    expect(animalById('kingfisher')!.look.f).toEqual(expect.arrayContaining(['longBeak', 'cheek', 'bighead']));
    expect(animalById('woodpecker')!.look.f).toEqual(expect.arrayContaining(['cap', 'longBeak', 'barred', 'bighead']));
    expect(animalById('kite')!.look.f).toEqual(expect.arrayContaining(['hooked', 'forkTail', 'soar']));
    expect(animalById('bluemagpie')!.look.f).toEqual(expect.arrayContaining(['longTail', 'veryLongTail']));
    expect(animalById('cockatoo')!.look.f).toEqual(expect.arrayContaining(['crest', 'bigCrest', 'hooked']));
    expect(animalById('sparrow')!.look.f ?? []).not.toContain('pointed');
    expect(animalById('sparrow')!.look.f ?? []).not.toContain('bighead');
  });

  it('every bird and butterfly still builds a rig with wings, at a finite real scale', () => {
    const ids = ANIMALS.filter((a) => a.look.kind === 'bird' || a.look.kind === 'butterfly').map((a) => a.id);
    expect(ids.length).toBeGreaterThan(30);
    for (const id of ids) {
      const fig = albumFigure(id);
      expect(fig, id).toBeTruthy();
      expect(fig!.getObjectByName('wingL'), id).toBeTruthy();
      const scale = realScale(animalById(id)!);
      expect(Number.isFinite(scale), id).toBe(true);
      expect(scale, id).toBeGreaterThan(0);
    }
    const draw = readFileSync('src/draw-animals.ts', 'utf8');
    for (const token of ['tiger', 'birdwing', 'atlas', 'pointed', 'bighead']) expect(draw).toContain(token);
  });
});
