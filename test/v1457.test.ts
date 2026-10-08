// 1.4.57: tap the nest → camera close-up of it (返回全景 goes back); location picker heading spacing.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import * as THREE from 'three';
import { Animals3D, NEST_FOCUS, NEST_FOCUS_ID } from '../src/three/animals3d';
import { buildTree } from '../src/three/tree3d';
import { ANIMALS } from '../src/data/animals';

// Minimal canvas stub so Animals3D (firefly sprite texture) can be built in the node test environment.
const noop2d = new Proxy({}, { get: (_t, k) => (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {}), set: () => true });
(globalThis as unknown as { document?: unknown }).document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => noop2d }) };

const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');

function setup(stage = 3) {
  const tree = buildTree({ species: 'camphor', stage, heightCm: [40, 200, 600, 1500, 4000][stage]!, health: 95, pests: 0, scars: 0, seed: 7 } as never);
  const an = new Animals3D();
  an.sync({ unlocked: ANIMALS.map((a) => a.id), residents: [], tree, health: 95, night: false, stage } as never);
  return { an, tree };
}

describe('1.4.57 nest close-up', () => {
  it('the nest is a follow-cam target while it holds an egg or a chick, and not once it is empty', () => {
    const { an, tree } = setup();
    expect(an.focusRef(NEST_FOCUS)).toBeNull();
    for (const phase of ['egg', 'chick'] as const) {
      an.setClutch(phase, 'sparrow');
      const f = an.focusRef(NEST_FOCUS);
      expect(f, phase).not.toBeNull();
      expect(f!.id).toBe(NEST_FOCUS_ID);
      expect(f!.outward).toBe(true);
      expect(f!.flying).toBeFalsy();
      expect(f!.group).toBe(1);
      expect(f!.size).toBeGreaterThan(0.1);
      // Aimed at the nest on its branch (the same point the hatch / reveal FX use).
      const anchor = new THREE.Vector3();
      expect(an.clutchAnchor(anchor)).toBe(true);
      expect(f!.pos.distanceTo(anchor)).toBeLessThan(1e-6);
      const world = tree.group.localToWorld(tree.nest!.pos.clone());
      expect(f!.pos.distanceTo(world)).toBeLessThan(0.05);
      // Not an animal: no name label, so 返回全景 shows plain.
      expect(an.refName(NEST_FOCUS)).toBeNull();
    }
    an.setClutch('empty');
    expect(an.focusRef(NEST_FOCUS)).toBeNull();
  });

  it('tap order: eggs zoom and keep their popup; a chick zooms first and chirps only in close-up', () => {
    const tap = scene.slice(scene.indexOf('if (this.animals.pickClutch('), scene.indexOf('const hit = this.animals.pick(this.raycaster.ray'));
    expect(tap).toMatch(/pickClutch[\s\S]*nudgeEggs\(\)[\s\S]*focusNest\(\)[\s\S]*onEggTap\?\.\(\)/);
    expect(tap).toMatch(/pickChick[\s\S]*if \(this\.nestFocused\(\)\) \{[\s\S]*onChickTap\?\.\(\)[\s\S]*\} else this\.focusNest\(\)/);
  });

  it('focusNest uses the follow cam, 返回全景 (resetView) clears it, and the crown peeks open for it', () => {
    expect(scene).toMatch(/focusNest\(\): boolean \{[\s\S]*this\.followRef = NEST_FOCUS;[\s\S]*this\.resetFollowCam\(\);[\s\S]*this\.noteView\(\);/);
    expect(scene).toMatch(/resetView\(\): void \{[\s\S]*?this\.followRef = null;/);
    expect(scene).toMatch(/focus\?\.id === NEST_FOCUS_ID/);
    expect(scene).toMatch(/followingUid\(\): number \| null \{\s*if \(this\.followRef === NEST_FOCUS\) return null;/);
  });
});

describe('1.4.57 location picker headings', () => {
  it('region headings sit close to their own grid and clear of the group above', () => {
    const rule = css.match(/\.modal-card p\.places-head \{([^}]*)\}/);
    expect(rule).not.toBeNull();
    const m = rule![1]!.match(/margin:\s*(\d+)px\s+\d+px\s+(\d+)px/);
    expect(m).not.toBeNull();
    const above = Number(m![1]);
    const below = Number(m![2]);
    expect(above).toBeGreaterThanOrEqual(22);
    expect(above).toBeLessThanOrEqual(24);
    expect(below).toBeGreaterThanOrEqual(9);
    expect(below).toBeLessThanOrEqual(11);
    // Clearly grouped: much more room above a heading than under it.
    expect(above).toBeGreaterThanOrEqual(below * 2);
  });
});
