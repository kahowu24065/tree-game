import * as THREE from 'three';
import { dotTexture } from './careFx';
import { jitterGeometry, merge } from './util3d';

/** Flame: vertical colour gradient (base → tip), fading out toward the tip, with a gentle wobble. */
function flameMaterial(base: string, tip: string, opacity: number, h: number, seed: number, time: { value: number }): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: time, uBase: { value: new THREE.Color(base) }, uTip: { value: new THREE.Color(tip) }, uOpacity: { value: opacity }, uH: { value: h }, uSeed: { value: seed } },
    vertexShader: `uniform float uTime; uniform float uH; uniform float uSeed; varying float vH;
      void main() {
        vec3 p = position;
        vH = clamp(p.y / uH, 0.0, 1.0);
        float w = vH * vH;
        p.x += sin(uTime * 7.0 + p.y * 18.0 + uSeed) * 0.035 * w;
        p.z += cos(uTime * 6.0 + p.y * 15.0 + uSeed * 1.7) * 0.03 * w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uBase; uniform vec3 uTip; uniform float uOpacity; varying float vH;
      void main() {
        vec3 c = mix(uBase, uTip, smoothstep(0.1, 0.95, vH));
        float a = uOpacity * (1.0 - smoothstep(0.55, 1.0, vH) * 0.85);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
}

/**
 * v15.1 保暖 campfire: stone ring, logs, flickering low-poly flames, a warm point light + glow, rising embers and a
 * little smoke. Built once at unit size (ring radius ≈ 0.4) and scaled to the scene; toggled with `setLit`.
 */
export class Campfire3D {
  group = new THREE.Group();
  private flames: { mesh: THREE.Mesh; phase: number; base: number }[] = [];
  private light = new THREE.PointLight('#ff9a3c', 0, 0, 2);
  private glow: THREE.Sprite;
  private embers: THREE.Points;
  private emberSeeds: { phase: number; speed: number; a: number; r: number }[] = [];
  private smoke: THREE.Sprite[] = [];
  private coal: THREE.MeshBasicMaterial;
  private time = { value: 0 };
  private litK = 0;
  private lit = false;
  private size = 1;

  constructor() {
    const g = this.group;
    // Ash bed + glowing coals.
    const ash = new THREE.Mesh(new THREE.CircleGeometry(0.33, 14), new THREE.MeshStandardMaterial({ color: '#4a3e36', roughness: 1, flatShading: true }));
    ash.rotation.x = -Math.PI / 2;
    ash.position.y = 0.012;
    this.coal = new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.9 });
    const coal = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), this.coal);
    coal.rotation.x = -Math.PI / 2;
    coal.position.y = 0.02;
    // Stone ring.
    const stones: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.2;
      const s = new THREE.DodecahedronGeometry(0.075 + (i % 3) * 0.012, 0);
      s.scale(1.2, 0.75, 1);
      s.rotateY(a);
      s.translate(Math.cos(a) * 0.38, 0.045, Math.sin(a) * 0.38);
      stones.push(s);
    }
    const ring = new THREE.Mesh(merge(stones), new THREE.MeshStandardMaterial({ color: '#8e8a83', roughness: 1, flatShading: true }));
    ring.castShadow = true;
    // Logs: a teepee of four plus two lying across.
    const logs: THREE.BufferGeometry[] = [];
    const top = new THREE.Vector3(0, 0.44, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const foot = new THREE.Vector3(Math.cos(a) * 0.24, 0.02, Math.sin(a) * 0.24);
      const len = foot.distanceTo(top);
      const c = new THREE.CylinderGeometry(0.036, 0.048, len, 6);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(foot).normalize());
      c.applyQuaternion(q);
      const mid = foot.clone().add(top).multiplyScalar(0.5);
      c.translate(mid.x, mid.y, mid.z);
      logs.push(c);
    }
    for (let i = 0; i < 2; i++) {
      const c = new THREE.CylinderGeometry(0.05, 0.05, 0.62, 7);
      c.rotateZ(Math.PI / 2);
      c.rotateY(i ? 0.9 : -0.7);
      c.translate(0, 0.05 + i * 0.04, 0);
      logs.push(c);
    }
    const logMesh = new THREE.Mesh(merge(logs), new THREE.MeshStandardMaterial({ color: '#6b4526', roughness: 0.95, flatShading: true, emissive: '#3a1204', emissiveIntensity: 0.4 }));
    logMesh.castShadow = true;
    g.add(ash, coal, ring, logMesh);
    // Flames: nested low-poly cones plus two side tongues.
    const flame = (r: number, h: number, base: string, tip: string, opacity: number, x: number, z: number, seed: number) => {
      const geo = new THREE.ConeGeometry(r, h, 7, 4);
      geo.translate(0, h / 2, 0);
      jitterGeometry(geo, r * 0.15, seed, false);
      const m = new THREE.Mesh(geo, flameMaterial(base, tip, opacity, h, seed, this.time));
      m.position.set(x, 0.04, z);
      m.renderOrder = 4;
      g.add(m);
      this.flames.push({ mesh: m, phase: seed * 1.7, base: 1 });
    };
    flame(0.2, 0.7, '#ff8a1e', '#e0301a', 0.9, 0, 0, 1);
    flame(0.13, 0.52, '#ffc14a', '#ff6a1a', 0.92, 0.01, 0.01, 2);
    flame(0.075, 0.34, '#fff6c0', '#ffd24a', 0.95, 0, 0.02, 3);
    flame(0.08, 0.36, '#ffb040', '#ff4a1a', 0.85, 0.14, 0.05, 4);
    flame(0.07, 0.3, '#ffb040', '#ff4a1a', 0.85, -0.12, -0.08, 5);
    // Glow halo and light.
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: '#ffab4a', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.glow.position.y = 0.3;
    this.glow.renderOrder = 5;
    g.add(this.glow);
    this.light.position.set(0, 0.5, 0);
    this.light.castShadow = false;
    g.add(this.light);
    // Embers.
    const n = 18;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    this.embers = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffb347', map: dotTexture(), size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    this.embers.frustumCulled = false;
    for (let i = 0; i < n; i++) this.emberSeeds.push({ phase: (i * 0.618) % 1, speed: 0.35 + ((i * 7) % 5) * 0.06, a: i * 2.4, r: 0.05 + ((i * 3) % 4) * 0.03 });
    g.add(this.embers);
    // Smoke puffs.
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: '#bdb6ae', transparent: true, opacity: 0, depthWrite: false }));
      s.renderOrder = 4;
      this.smoke.push(s);
      g.add(s);
    }
    g.visible = false;
  }

  setLit(on: boolean): void {
    if (on && !this.lit) this.litK = 0;
    this.lit = on;
  }

  isLit(): boolean {
    return this.lit;
  }

  /** `size` = world metres per unit (ring radius ≈ 0.4 × size); `night` 0 day … 1 night. */
  update(t: number, dt: number, size: number, night: number, reduced: boolean): void {
    this.group.visible = this.lit;
    this.time.value = reduced ? 0 : t;
    if (!this.lit) {
      this.light.intensity = 0;
      return;
    }
    this.size = size;
    this.group.scale.setScalar(size);
    this.litK = Math.min(1, this.litK + dt / (reduced ? 0.01 : 0.8));
    const grow = 1 - Math.pow(1 - this.litK, 3);
    const flick = reduced ? 1 : 0.86 + 0.1 * Math.sin(t * 11.3) + 0.06 * Math.sin(t * 23.7 + 1.3) + 0.04 * Math.sin(t * 5.1);
    for (const f of this.flames) {
      const p = f.phase;
      const sy = reduced ? 1 : 1 + 0.16 * Math.sin(t * 9 + p) + 0.09 * Math.sin(t * 15.7 + p * 2.3);
      const sx = reduced ? 1 : 1 - 0.07 * Math.sin(t * 12.1 + p * 1.3);
      f.mesh.scale.set(sx * grow, sy * grow, sx * grow);
      if (!reduced) {
        f.mesh.rotation.y += dt * (0.8 + p * 0.2);
        f.mesh.rotation.z = 0.06 * Math.sin(t * 3.1 + p);
      }
    }
    this.coal.opacity = 0.7 + 0.25 * flick;
    const gm = this.glow.material as THREE.SpriteMaterial;
    gm.opacity = (0.26 + 0.24 * night) * flick * grow;
    this.glow.scale.setScalar((1.4 + 0.6 * night) * (0.95 + 0.05 * flick));
    // Physically based point light: intensity ∝ size² so the lit area follows the scene scale.
    this.light.distance = size * 6;
    this.light.intensity = (0.9 + 1.6 * night) * size * size * flick * grow;
    // Embers rise and fade, recycled.
    const pos = this.embers.geometry.getAttribute('position') as THREE.BufferAttribute;
    (this.embers.material as THREE.PointsMaterial).size = 0.05 * size;
    this.embers.visible = !reduced;
    if (!reduced) {
      this.emberSeeds.forEach((e, i) => {
        const u = (e.phase + t * e.speed) % 1;
        const ang = e.a + u * 4;
        pos.setXYZ(i, Math.cos(ang) * e.r * (1 + u), 0.35 + u * 1.5, Math.sin(ang) * e.r * (1 + u) + u * 0.1);
      });
      pos.needsUpdate = true;
      (this.embers.material as THREE.PointsMaterial).opacity = 0.9 * grow;
    }
    this.smoke.forEach((s, i) => {
      const m = s.material as THREE.SpriteMaterial;
      if (reduced) {
        m.opacity = 0;
        return;
      }
      const u = (t * 0.22 + i / 3) % 1;
      s.position.set(Math.sin(t * 0.5 + i) * 0.1 + u * 0.25, 0.8 + u * 1.6, u * 0.1);
      s.scale.setScalar(0.3 + u * 0.8);
      m.opacity = 0.2 * Math.sin(u * Math.PI) * grow * (1 - night * 0.5);
    });
  }

  /** Metres per unit last applied (for checks). */
  scaleM(): number {
    return this.size;
  }

  dispose(): void {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      // Sprites share one module-level geometry in three.js: never dispose it.
      if (!(o as THREE.Sprite).isSprite) m.geometry?.dispose();
      const mat = m.material as THREE.Material | undefined;
      mat?.dispose();
    });
  }
}
