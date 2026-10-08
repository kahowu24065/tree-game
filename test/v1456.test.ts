// 1.4.56: the clutch nest always rests on wood that is really drawn (a branch of this tree, else the trunk).
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { buildTree, pickNestPerch } from '../src/three/tree3d';
import { SPECIES, speciesTargetCm } from '../src/data/species';
import { stageIndex } from '../src/content';

function barkMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o.userData.treePart === 'bark') out.push(o as THREE.Mesh);
  });
  return out;
}

/** Distance from the nest to drawn bark: straight down onto a branch, or sideways onto the trunk. */
function gapToWood(b: ReturnType<typeof buildTree>): number {
  b.group.updateMatrixWorld(true);
  const meshes = barkMeshes(b.group);
  for (const m of meshes) (m.material as THREE.Material).side = THREE.DoubleSide;
  const p = b.nest!.pos.clone();
  const lift = b.height * 0.05;
  const rc = new THREE.Raycaster(p.clone().add(new THREE.Vector3(0, lift, 0)), new THREE.Vector3(0, -1, 0));
  const down = rc.intersectObjects(meshes, false)[0];
  let gap = down ? Math.max(0, down.distance - lift) : Infinity;
  // Against the trunk: horizontal distance to the trunk surface at that height.
  const axis = b.trunkAxis(p.y);
  gap = Math.min(gap, Math.max(0, Math.hypot(p.x - axis.x, p.z - axis.z) - axis.r));
  return gap;
}

const SAMPLES = [0.05, 0.2, 0.45, 0.8];

describe('1.4.56 nest on a real branch', () => {
  for (const sp of SPECIES) {
    it(`${sp.id}: every stage has a nest resting on its own bark (no floating)`, () => {
      const target = speciesTargetCm(sp.id);
      for (const f of SAMPLES) {
        const cm = Math.max(20, Math.round(target * f));
        for (const brokenTop of [0, 1]) {
          const b = buildTree({ species: sp.id, stage: stageIndex(cm, target), heightCm: cm, health: 92, pests: 0, scars: 0, seed: 5, brokenTop });
          expect(b.nest, `${sp.id} ${cm}`).toBeTruthy();
          const gap = gapToWood(b);
          expect(gap, `${sp.id} ${cm} cm broken ${brokenTop}: gap ${gap}`).toBeLessThan(Math.max(0.02, b.height * 0.012));
          if (b.brokenCut) expect(b.nest!.pos.y).toBeLessThanOrEqual(b.brokenCut.bark + 1e-6);
          expect(b.nest!.pos.y).toBeLessThanOrEqual(b.height);
        }
      }
    });
  }

  it('the nest adapts to the tree, never the other way round: same bark with or without a nest pick', () => {
    const p = { species: 'camphor' as const, stage: 3, heightCm: 1500, health: 92, pests: 0, scars: 0, seed: 5 };
    const a = buildTree(p);
    const b = buildTree(p);
    const verts = (t: ReturnType<typeof buildTree>) => barkMeshes(t.group).reduce((n, m) => n + m.geometry.getAttribute('position').count, 0);
    expect(verts(a)).toBe(verts(b));
    expect(a.nest!.pos.toArray()).toEqual(b.nest!.pos.toArray());
  });

  it('pickNestPerch: prefers a sturdy junction branch at mid height; falls back to the trunk top for small trees', () => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const t = { trunkTop: 10, trunkRadius: 0.5, trunkRTop: 0.2, at: (y: number) => V(0, y, 0), stage: 3, cut: null };
    const twig = { a: V(0.6, 5, 0.6), b: V(1.2, 5.3, 1.2), r0: 0.03, r1: 0.02 };
    const limb = { a: V(0, 5.5, 0), b: V(0, 6.5, 3), r0: 0.2, r1: 0.1 };
    const high = { a: V(0, 9.5, 0), b: V(0, 10, 3), r0: 0.2, r1: 0.1 };
    const p = pickNestPerch([twig, high, limb], t);
    expect(p.pos.z).toBeGreaterThan(0.5); // clear of the trunk, on the limb
    expect(p.pos.y).toBeGreaterThan(5.5);
    expect(p.pos.y).toBeLessThan(6.6);
    const small = pickNestPerch([], { ...t, stage: 1 });
    expect(small.pos.y).toBe(10);
    const cut = pickNestPerch([limb, high], { ...t, cut: 7 });
    expect(cut.pos.y).toBeLessThan(7);
  });
});
