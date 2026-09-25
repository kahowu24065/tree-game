import * as THREE from 'three';
import { animalFactor } from '../scale';

/**
 * v10: small scenery props (rocks, shrubs, flowers, grass, ferns, reeds, small trees, bridge, stepping stones…) are drawn
 * at real-world-ish size × the SAME shared factor the animals use (`animalFactor(tree height)`), instead of growing
 * with the island. Props are authored in island units where 1 unit ≈ 1 m of real size (PROP_M); on screen they get
 * `propK = min(1, animalFactor · PROP_M / islandK)` island units per design unit — never larger than the v6 look.
 *
 * The scale is applied on the GPU around each prop's own ground anchor (merged meshes carry an `aAnchor` attribute,
 * instanced meshes are authored at the origin), so it follows the tree smoothly without rebuilding geometry. When the
 * island gets relatively bigger than the props, more of them are placed (see `propDensity`).
 */
export const PROP_M = 1;
/** Shared uniform: current prop scale (island units per design unit). */
export const propUniforms = { uPropK: { value: 1 } };

export function propScaleFor(treeM: number, islandK: number): number {
  return Math.max(0.05, Math.min(1, (animalFactor(treeM) * PROP_M) / Math.max(1e-3, islandK)));
}

/** Quantised prop scale used to decide how many props to place (rebuilds only when it moves by ~25 %). */
export function propBucket(propK: number): number {
  return Math.max(0, Math.round(Math.log(1 / Math.max(0.05, Math.min(1, propK))) / Math.log(1.25)));
}

export function bucketScale(bucket: number): number {
  return Math.pow(1.25, -bucket);
}

/** How many times more props to place for a prop scale (same ground cover with smaller props), capped for performance. */
export function propDensity(propK: number, cap: number): number {
  return Math.max(1, Math.min(cap, 1 / (propK * propK)));
}

function inject(shader: { vertexShader: string; uniforms: Record<string, THREE.IUniform> }, anchored: boolean): void {
  shader.uniforms.uPropK = propUniforms.uPropK;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\nuniform float uPropK;${anchored ? '\nattribute vec3 aAnchor;' : ''}`)
    .replace('#include <begin_vertex>', anchored ? '#include <begin_vertex>\ntransformed = aAnchor + (transformed - aAnchor) * uPropK;' : '#include <begin_vertex>\ntransformed *= uPropK;');
}

/** Make a material (and matching shadow depth material) scale props by `propUniforms.uPropK`. */
export function propMaterial<T extends THREE.Material>(m: T, anchored: boolean): T {
  m.onBeforeCompile = (s) => inject(s as unknown as { vertexShader: string; uniforms: Record<string, THREE.IUniform> }, anchored);
  m.customProgramCacheKey = () => (anchored ? 'propA' : 'propI');
  return m;
}

/** Apply prop scaling to a mesh: material, shadow depth material, and no raycasts (CPU geometry is unscaled). */
export function asProp(mesh: THREE.Mesh, anchored: boolean): THREE.Mesh {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => propMaterial(m, anchored));
  mesh.customDepthMaterial = propMaterial(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), anchored);
  mesh.customDistanceMaterial = propMaterial(new THREE.MeshDistanceMaterial(), anchored);
  mesh.raycast = () => {};
  mesh.userData.prop = true;
  return mesh;
}

/** Tag a geometry's vertices with its anchor (ground point it scales about). */
export function anchorGeometry(g: THREE.BufferGeometry, x: number, y: number, z: number): THREE.BufferGeometry {
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  g.setAttribute('aAnchor', new THREE.BufferAttribute(a, 3));
  return g;
}
