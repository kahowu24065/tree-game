import * as THREE from 'three';
import type { SceneInput } from '../render';
import { hashString, clamp, mulberry32 } from '../util';
import { albumFigure, Animals3D, type EcoInfo, type EcoCaps } from './animals3d';
import { buildHabitat, type Habitat } from './habitat3d';
import { buildIsland, type Island } from './island3d';
import { buildTree, treeKey, windUniforms, type TreeBuild } from './tree3d';
import { animalById } from '../data/animals';
import type { SpeciesId } from '../data/species';
import { jitterGeometry, merge, paint } from './util3d';

export type Quality = 'low' | 'high';

const ELEVATION = Math.PI / 4;
const BASE_AZIMUTH = 0.32;

function overcastOf(input: SceneInput): number {
  const c = input.cond;
  if (c.stormKind === 'typhoon' || c.code >= 95) return 1;
  if (c.stormKind) return 0.9;
  let o = 0;
  if (c.code === 1) o = 0.1;
  else if (c.code === 2) o = 0.3;
  else if (c.code === 3) o = 0.55;
  else if (c.code === 45 || c.code === 48) o = 0.6;
  else if (c.code >= 51) o = c.code >= 63 && c.code !== 71 ? 0.85 : 0.7;
  if (c.raining) o = Math.max(o, 0.7);
  return o;
}

function rainOf(input: SceneInput): number {
  const c = input.cond;
  if (c.stormKind === 'typhoon' || c.code >= 95) return 1;
  if (c.stormKind === 'heavy-rain' || c.precipMm >= 25 || c.code === 65 || c.code === 82) return 0.9;
  if (c.stormKind === 'gale') return 0.45;
  if (c.raining || (c.code >= 51 && c.code <= 82)) return c.code >= 63 ? 0.6 : 0.35;
  return 0;
}

function cloudCluster(rand: () => number, size: number): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = [];
  const n = 4 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const r = size * (0.45 + rand() * 0.55) * (i === 0 ? 1.2 : 1);
    const g = new THREE.IcosahedronGeometry(r, 1);
    jitterGeometry(g, r * 0.15, i + size, true);
    g.scale(1, 0.62, 1);
    g.translate((i - n / 2) * size * 0.7 + rand() * size * 0.3, rand() * size * 0.3, (rand() - 0.5) * size * 0.8);
    geos.push(g);
  }
  const m = merge(geos, true);
  paint(m, (y) => new THREE.Color().setScalar(0.86 + clamp(y / size, -0.5, 0.5) * 0.28));
  return m;
}

export class Scene3D {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
  private hemi = new THREE.HemisphereLight('#fff4de', '#6c8a52', 1.1);
  private sun = new THREE.DirectionalLight('#ffe2b0', 2.4);
  private fill = new THREE.DirectionalLight('#b9d3ff', 0.35);
  private skyMat: THREE.ShaderMaterial;
  private island: Island;
  private pivot = new THREE.Group();
  private tree: TreeBuild | null = null;
  private treeKeyStr = '';
  private animals = new Animals3D();
  private animalsKey = '';
  private growFrom = 1;
  private growStart = 0;
  private clouds: { mesh: THREE.Mesh; r: number; a: number; y: number; speed: number; low: boolean }[] = [];
  private cloudMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, transparent: true, opacity: 0.94, emissive: '#ffffff', emissiveIntensity: 0.35 });
  private stars: THREE.Points;
  private glow: THREE.Points;
  private sparkles: THREE.Points;
  private landmark = new THREE.Group();
  private rain: THREE.LineSegments;
  private rainSeeds: Float32Array;
  private sea: THREE.Mesh;
  private camDist = 10;
  private camTargetY = 0.4;
  private lastTime = 0;
  private flash = 0;
  private nextFlash = 0;
  private dragAz = 0;
  private dragEl = 0;
  private dragging: { x: number; y: number; az: number; el: number } | null = null;
  private lastDrag = 0;
  private quality: Quality;
  private thumbs = new Map<string, string>();
  private width = 1;
  private height = 1;
  private gust = 0;
  private gustTarget = 0;
  private nextGust = 0;
  private swellT = -99;
  private follow: string | null = null;
  private followOn = false;
  private followAz = 0;
  private followPos = new THREE.Vector3();
  private heatK = 0;
  private habitat: Habitat | null = null;
  private habitatKey = '';
  private hud = new THREE.Scene();
  private hudCam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);
  private rays: { glow: THREE.Sprite; haze: THREE.Sprite; shafts: THREE.Mesh[] };
  private speciesThumbs = new Map<string, string>();

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, quality: Quality = 'low') {
    this.canvas = canvas;
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Gradient sky dome.
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#8fcbf0') },
        mid: { value: new THREE.Color('#cfe9f7') },
        bottom: { value: new THREE.Color('#e9f4f4') },
      },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, -0.4, h)); gl_FragColor = vec4(c, 1.0); }',
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), this.skyMat);
    sky.renderOrder = -1;
    this.scene.add(sky);
    this.scene.fog = new THREE.Fog('#cfe6f2', 40, 220);

    this.scene.add(this.hemi, this.sun, this.sun.target, this.fill);
    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 4;
    this.applyQuality();

    this.island = buildIsland();
    this.scene.add(this.island.group);
    this.pivot.position.y = 0.18;
    this.scene.add(this.pivot);
    this.scene.add(this.animals.root);

    // Sea far below plus distant islets and cliffs.
    this.sea = new THREE.Mesh(new THREE.CircleGeometry(420, 48), new THREE.MeshStandardMaterial({ color: '#4fa7c9', roughness: 0.35, metalness: 0.1 }));
    this.sea.rotation.x = -Math.PI / 2;
    this.sea.position.y = -22;
    this.scene.add(this.sea);
    const rand = mulberry32(99);
    const islets: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const a = -1.2 + i * 0.55 + rand() * 0.3;
      const r = 110 + rand() * 80;
      const h = 5 + rand() * 12;
      const g = new THREE.ConeGeometry(6 + rand() * 10, h, 7, 3);
      jitterGeometry(g, 2.2, i, false);
      g.translate(Math.sin(a) * r * -1, -22 + h / 2 - 1, -Math.cos(a) * r);
      paint(g, (y) => (y > -22 + h * 0.35 ? new THREE.Color('#6f9f5c') : new THREE.Color('#8b8173')));
      islets.push(g);
    }
    this.scene.add(new THREE.Mesh(merge(islets, true), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })));

    for (let i = 0; i < 16; i++) {
      const low = i < 4;
      const size = low ? 1.2 + rand() * 1.2 : 1.6 + rand() * 2.4;
      const mesh = new THREE.Mesh(cloudCluster(rand, size), this.cloudMat);
      const c = { mesh, r: low ? 11 + rand() * 5 : 14 + rand() * 30, a: rand() * Math.PI * 2, y: low ? -4 - rand() * 5 : 3 + rand() * 12, speed: 0.01 + rand() * 0.02, low };
      this.clouds.push(c);
      this.scene.add(mesh);
    }

    // Stars on the upper sky.
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const u = rand() * Math.PI * 2;
      const v = 0.08 + rand() * 0.9;
      starPos.set([Math.cos(u) * Math.cos(v) * 350, Math.sin(v) * 350, Math.sin(u) * Math.cos(v) * 350], i * 3);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#fffbe8', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.scene.add(this.stars);

    // 爆發生長 green glow: motes rising around the tree.
    const glowGeo = new THREE.BufferGeometry();
    const glowPos = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) glowPos.set([(rand() - 0.5) * 3, rand(), (rand() - 0.5) * 3], i * 3);
    glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
    this.glow = new THREE.Points(glowGeo, new THREE.PointsMaterial({ color: '#9dff8a', size: 5, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.glow.visible = false;
    this.scene.add(this.glow);

    // 星空浮島 (tier-3 badge): sparkles circling the island.
    const spGeo = new THREE.BufferGeometry();
    const spPos = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2;
      const r = 7.5 + rand() * 2.5;
      spPos.set([Math.cos(a) * r, -1.5 + rand() * 3, Math.sin(a) * r], i * 3);
    }
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    this.sparkles = new THREE.Points(spGeo, new THREE.PointsMaterial({ color: '#cfe3ff', size: 3, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.sparkles.visible = false;
    this.scene.add(this.sparkles);

    // 養分地標: mossy stone with glowing mushrooms where the last tree stood.
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: '#8a8f7a', flatShading: true, roughness: 1 }));
    stone.scale.set(1, 0.7, 0.9);
    stone.position.y = 0.2;
    const moss = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#6fae4f', flatShading: true }));
    moss.position.set(0.05, 0.42, 0);
    this.landmark.add(stone, moss);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#ffd36b', emissive: '#ffb830', emissiveIntensity: 0.6 }));
      cap.position.set(Math.cos(a) * 0.55, 0.14, Math.sin(a) * 0.55);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.14, 5), new THREE.MeshStandardMaterial({ color: '#f3ead2' }));
      stem.position.set(Math.cos(a) * 0.55, 0.07, Math.sin(a) * 0.55);
      this.landmark.add(cap, stem);
    }
    this.landmark.position.set(2.8, 0.05, 2.2);
    this.landmark.visible = false;
    this.scene.add(this.landmark);

    // Rain streaks.
    const n = 900;
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.rainSeeds = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) this.rainSeeds[i] = rand();
    this.rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: '#dbe9f5', transparent: true, opacity: 0.55, fog: false, depthWrite: false }));
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    this.scene.add(this.rain);

    this.rays = this.buildRays();
    this.bindDrag();
    this.resize();
  }

  /** 酷熱 light: a soft warm glow in the top-right corner with a few slow light shafts toward the tree. */
  private buildRays(): { glow: THREE.Sprite; haze: THREE.Sprite; shafts: THREE.Mesh[] } {
    const radial = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const shaftTex = (() => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 32;
      const g = c.getContext('2d')!;
      const img = g.createImageData(128, 32);
      for (let x = 0; x < 128; x++) {
        for (let y = 0; y < 32; y++) {
          const along = Math.pow(1 - x / 127, 1.6) * Math.min(1, x / 10);
          const across = Math.pow(Math.sin((y / 31) * Math.PI), 2.2);
          const a = along * across;
          const i = (y * 128 + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
          img.data[i + 3] = Math.round(a * 255);
        }
      }
      g.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const soft = radial();
    const sprite = (color: string) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      sp.visible = false;
      this.hud.add(sp);
      return sp;
    };
    const glow = sprite('#ffe2a6');
    const haze = sprite('#fff0d0');
    const plane = new THREE.PlaneGeometry(1, 1);
    plane.translate(0.5, 0, 0);
    const shafts: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: shaftTex, color: i % 2 ? '#fff1cc' : '#ffe0a0', transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.visible = false;
      this.hud.add(m);
      shafts.push(m);
    }
    return { glow, haze, shafts };
  }

  /** Developer trigger: a gentle swell of the warm light (works even outside 酷熱). */
  triggerGlare(): void {
    this.swellT = this.lastTime;
  }

  /** Developer follow-cam on an animal id (null = normal framing). */
  followAnimal(id: string | null): void {
    this.follow = id;
  }

  animalCaps(): EcoCaps {
    return this.animals.caps();
  }

  animalInfo(): EcoInfo[] {
    return this.animals.info();
  }

  spawnAnimal(id: string): void {
    if (animalById(id)) this.animals.spawn(id, { forced: true });
  }

  rotateAnimals(): void {
    this.animals.rotate();
  }

  setQuality(q: Quality): void {
    this.quality = q;
    this.applyQuality();
    this.resize();
  }

  private applyQuality(): void {
    const size = this.quality === 'high' ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  private bindDrag(): void {
    const c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', (e) => {
      this.dragging = { x: e.clientX, y: e.clientY, az: this.dragAz, el: this.dragEl };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = (e.clientX - this.dragging.x) / Math.max(200, this.width);
      const dy = (e.clientY - this.dragging.y) / Math.max(200, this.height);
      this.dragAz = clamp(this.dragging.az - dx * 2.2, -0.6, 0.6);
      this.dragEl = clamp(this.dragging.el + dy * 0.8, -0.15, 0.15);
      this.lastDrag = performance.now();
    });
    const end = () => {
      this.dragging = null;
      this.lastDrag = performance.now();
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }

  resize(): void {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    this.width = w;
    this.height = h;
    const cap = this.quality === 'high' ? 2 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = this.camera.aspect < 0.8 ? 46 : 36;
    this.camera.updateProjectionMatrix();
    this.hudCam.left = 0;
    this.hudCam.right = w;
    this.hudCam.top = h;
    this.hudCam.bottom = 0;
    this.hudCam.updateProjectionMatrix();
  }

  private ensureTree(input: SceneInput, time: number): void {
    const params = {
      species: input.species,
      stage: input.stage,
      heightCm: input.heightCm,
      health: input.health,
      pests: input.pests,
      scars: input.scars,
      seed: (hashString(input.treeName || 'tree') % 97) + 1,
      reinforce: input.reinforce,
    };
    const key = treeKey(params);
    if (key !== this.treeKeyStr) {
      const old = this.tree;
      const next = buildTree(params);
      if (old) {
        this.growFrom = clamp(old.height / next.height, 0.5, 1.5);
        this.growStart = time;
        this.pivot.remove(old.group);
        old.dispose();
      } else {
        this.growFrom = 1;
      }
      this.pivot.add(next.group);
      this.tree = next;
      this.treeKeyStr = key;
      this.animalsKey = '';
    }
    const night = input.daylight < 0.35;
    const akey = `${input.unlocked.join(',')}|${input.residents.join(',')}|${input.health >= 22}|${night}|${input.stage}`;
    if (akey !== this.animalsKey && this.tree) {
      this.animals.sync({ unlocked: input.unlocked, residents: input.residents, tree: this.tree, health: input.health, night, stage: input.stage });
      this.animalsKey = akey;
    }
  }

  private ensureHabitat(input: SceneInput): void {
    const stage = clamp(Math.round(input.islandStage ?? input.stage), 0, 4);
    const key = `${input.species}|${stage}|${this.quality}`;
    if (key === this.habitatKey) return;
    this.habitatKey = key;
    if (this.habitat) {
      this.scene.remove(this.habitat.group);
      this.habitat.dispose();
    }
    this.habitat = buildHabitat(input.species, stage, this.quality);
    this.scene.add(this.habitat.group);
    this.island.setExtended(stage >= 1);
    this.animals.setIslandRadius(this.habitat.radius);
  }

  draw(input: SceneInput, timeMs: number): void {
    const t = timeMs / 1000;
    const dt = clamp(t - this.lastTime, 0, 0.1);
    this.lastTime = t;
    this.ensureTree(input, t);
    this.ensureHabitat(input);
    const tree = this.tree!;

    // Growth pop: ease from the old size to the new one.
    const g = clamp((t - this.growStart) / 0.9, 0, 1);
    const ease = 1 - Math.pow(1 - g, 3);
    tree.group.scale.setScalar(this.growFrom + (1 - this.growFrom) * ease);

    // Lighting from time of day and weather.
    const day = clamp(input.daylight, 0, 1);
    const night = 1 - day;
    const over = overcastOf(input);
    const rain = rainOf(input);
    const storming = input.cond.stormKind === 'typhoon' || input.cond.code >= 95;
    const stormy = storming || !!input.cond.stormKind;
    const golden = day > 0 && day < 1 ? 1 - Math.abs(day - 0.5) * 2 : 0;
    const goldenish = Math.max(golden, clamp(1 - Math.min(Math.abs(input.minute - input.sunriseMin), Math.abs(input.minute - input.sunsetMin)) / 70, 0, 1) * day);

    const skyTopDay = new THREE.Color('#79bfeb').lerp(new THREE.Color('#8d99a6'), over).lerp(new THREE.Color('#4b5563'), stormy ? 0.55 : 0);
    const skyMidDay = new THREE.Color('#cde8f6').lerp(new THREE.Color('#b8c2ca'), over).lerp(new THREE.Color('#687380'), stormy ? 0.5 : 0);
    const dusk = new THREE.Color('#f3b27a');
    skyMidDay.lerp(dusk, goldenish * 0.55 * (1 - over));
    const skyTopNight = new THREE.Color('#0f1d3a');
    const skyMidNight = new THREE.Color('#27365c').lerp(new THREE.Color('#2a2f38'), over * 0.6);
    const top = skyTopNight.clone().lerp(skyTopDay, day);
    const mid = skyMidNight.clone().lerp(skyMidDay, day);
    this.skyMat.uniforms.top!.value.copy(top);
    this.skyMat.uniforms.mid!.value.copy(mid);
    this.skyMat.uniforms.bottom!.value.copy(mid.clone().lerp(new THREE.Color('#ffffff'), 0.12 * day));
    const fog = this.scene.fog as THREE.Fog;
    fog.color.copy(mid).lerp(new THREE.Color('#ffffff'), 0.2 * day);

    const hotNow = Boolean(input.cond.hot) && day > 0.3;
    this.heatK += ((hotNow ? 1 : 0) - this.heatK) * (1 - Math.exp(-dt * 0.8));
    const sunWarm = new THREE.Color('#ffe7bf').lerp(new THREE.Color('#ffb066'), goldenish * 0.7);
    if (input.cond.hot) sunWarm.lerp(new THREE.Color('#ffd28a'), 0.3);
    const moon = new THREE.Color('#a9bcf2');
    this.sun.color.copy(moon.clone().lerp(sunWarm, day));
    this.sun.intensity = (0.7 * night + day * 2.6) * (1 - over * 0.72) * (stormy ? 0.45 : 1) * (1 + this.heatK * 0.12);
    this.sun.color.lerp(new THREE.Color('#ffcf87'), this.heatK * 0.45);
    this.hemi.color.copy(new THREE.Color('#7086bd').lerp(new THREE.Color('#fff2da'), day).lerp(new THREE.Color('#c7cdd3'), over * 0.5));
    this.hemi.groundColor.copy(new THREE.Color('#2c3a33').lerp(new THREE.Color('#78905a'), day));
    this.hemi.intensity = (0.75 + day * 0.55) * (stormy ? 0.62 : 1);
    this.fill.intensity = 0.25 + day * 0.2;

    // Lightning in typhoons and thunderstorms.
    if (storming && !input.reducedMotion) {
      if (t > this.nextFlash) {
        this.flash = 1;
        this.nextFlash = t + 3 + Math.random() * 5;
      }
    }
    this.flash = Math.max(0, this.flash - dt * 3.5);
    if (this.flash > 0) {
      const f = this.flash > 0.6 || (this.flash > 0.25 && this.flash < 0.4) ? this.flash : 0;
      this.hemi.intensity += f * 2.2;
      this.skyMat.uniforms.top!.value.lerp(new THREE.Color('#dfe6ff'), f * 0.6);
    }

    // Wind sway: amplitude and frequency follow the weather (calm → breeze → gale → typhoon), with gusts.
    const motion = input.reducedMotion ? 0.3 : 1;
    const level = clamp(input.sway, 0, 1);
    if (t > this.nextGust) {
      this.gustTarget = level > 0.25 ? 0.45 + Math.random() * 0.55 : Math.random() * 0.35;
      this.nextGust = t + 1.2 + Math.random() * (4.5 - level * 3);
    }
    this.gustTarget *= Math.exp(-dt * 0.9);
    this.gust += (this.gustTarget - this.gust) * (1 - Math.exp(-dt * 3));
    const gust = this.gust * level;
    const tall = 1 / (1 + tree.height * 0.04);
    const amp = (0.004 + level * 0.065) * (1 + gust * 0.8) * motion * tall;
    const freq = 0.8 + level * 1.5;
    const lean = level * 0.085 * (0.55 + gust * 0.7) * motion * tall;
    this.pivot.rotation.z = -lean + Math.sin(t * freq) * amp + Math.sin(t * freq * 2.37 + 0.6) * amp * 0.35;
    this.pivot.rotation.x = Math.sin(t * freq * 0.8 + 1) * amp * 0.5;
    windUniforms.uTime.value = t;
    windUniforms.uWind.value = level * motion;
    windUniforms.uGust.value = gust * motion;
    windUniforms.uHeight.value = Math.max(0.6, tree.height);
    const wind = level * 110 + gust * 20;

    this.island.dirt.scale.setScalar(clamp(0.3 + tree.height * 0.09, 0.3, 1.5));
    this.island.update(t, wind);
    this.habitat?.update(t, wind);
    this.landmark.visible = Boolean(input.landmark);
    this.sparkles.visible = Boolean(input.starry);
    if (this.sparkles.visible) {
      this.sparkles.rotation.y = t * 0.05;
      this.sparkles.scale.setScalar((this.habitat?.radius ?? 7) / 7);
    }
    this.glow.visible = Boolean(input.thriving) && !input.reducedMotion;
    if (this.glow.visible) {
      const gp = this.glow.geometry.getAttribute('position') as THREE.BufferAttribute;
      const h = Math.max(1, tree.height);
      for (let i = 0; i < gp.count; i++) {
        const phase = (t * 0.25 + i * 0.137) % 1;
        gp.setY(i, 0.3 + phase * h * 1.1);
      }
      gp.needsUpdate = true;
      this.glow.scale.set(Math.max(1, h * 0.35), 1, Math.max(1, h * 0.35));
      (this.glow.material as THREE.PointsMaterial).opacity = 0.35 + 0.35 * Math.sin(t * 2);
    }
    this.pivot.updateMatrixWorld(true);
    this.animals.update(t, dt, night);

    const islandR = this.habitat?.radius ?? 7;
    const islandStage = this.habitat?.stage ?? 0;
    // Clouds drift; overcast brings more and darker clouds.
    const cloudTint = new THREE.Color('#ffffff').lerp(new THREE.Color('#9aa3ad'), over).lerp(new THREE.Color('#59616b'), stormy ? 0.6 : 0).lerp(new THREE.Color('#39435e'), night * 0.8);
    this.cloudMat.color.copy(cloudTint);
    this.cloudMat.emissiveIntensity = 0.35 * day * (1 - over * 0.6);
    const visibleClouds = 8 + Math.round(over * 8);
    this.clouds.forEach((c, i) => {
      c.a += c.speed * dt * (1 + wind * 0.02);
      c.mesh.visible = i < visibleClouds;
      const scale = 1 + over * 0.6 + (this.camDist / 40) * (c.low ? 0 : 0.8);
      c.mesh.scale.setScalar(scale);
      const r = c.low ? Math.max(c.r, islandR + 3 + c.r * 0.3) : c.r + this.camDist * 0.35;
      c.mesh.position.set(Math.cos(c.a) * r, c.y + (c.low ? 0 : over * 2), Math.sin(c.a) * r);
    });
    (this.stars.material as THREE.PointsMaterial).opacity = night * (1 - over * 0.9);
    this.stars.visible = night > 0.02;
    (this.sea.material as THREE.MeshStandardMaterial).color.set('#58b6e0').lerp(new THREE.Color('#5d7482'), over * 0.8).lerp(new THREE.Color('#122036'), night * 0.7);

    // Camera: keep the whole tree framed at a 45-degree look-down, rising as it grows.
    const H = tree.height * tree.group.scale.y;
    const W = Math.max(1.0, tree.canopyRadius * tree.group.scale.x);
    const R = Math.max(2.0, Math.sqrt((H * 0.55) ** 2 + W * W) * 1.14, islandR * [0.2, 0.28, 0.32, 0.36, 0.38][islandStage]!);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const portrait = this.camera.aspect < 0.8;
    const want = Math.max(R / Math.sin(vHalf) * (portrait ? 1.3 : 1.18), R / Math.sin(hHalf) * (portrait ? 1.12 : 1.05));
    const wantY = H * 0.47 + (portrait ? H * 0.02 : 0);
    const k = 1 - Math.exp(-dt * 1.6);
    if (this.camDist === 10 && this.lastTime < 0.2) this.camDist = want;
    this.camDist += (want - this.camDist) * (dt === 0 ? 1 : k);
    this.camTargetY += (wantY - this.camTargetY) * (dt === 0 ? 1 : k);
    if (!this.dragging && performance.now() - this.lastDrag > 5000) {
      this.dragAz *= 1 - Math.min(1, dt * 0.6);
      this.dragEl *= 1 - Math.min(1, dt * 0.6);
    }
    const az = BASE_AZIMUTH + this.dragAz + Math.sin(t * 0.05) * 0.03 * motion;
    const el = ELEVATION + this.dragEl;
    const target = new THREE.Vector3(0, this.camTargetY, 0);
    let dist = this.camDist;
    // Developer "follow cam": frame one animal up close.
    const focus = this.follow ? this.animals.focus(this.follow) : null;
    if (focus) {
      if (!this.followOn) this.followPos.copy(focus.pos);
      this.followPos.lerp(focus.pos, dt === 0 ? 1 : 1 - Math.exp(-dt * 4));
      target.copy(this.followPos);
      target.y += focus.size * 0.35;
      dist = Math.max(1.4, focus.size * 4.5);
    }
    this.followOn = Boolean(focus);
    // Follow-cam looks from lower down so animals are seen in profile.
    const camEl = focus ? Math.min(el, 0.38) : el;
    let camAz = az;
    if (focus) {
      // Three-quarter front view of the animal: its forward is (cos yaw, 0, -sin yaw).
      const want = Math.atan2(Math.cos(focus.yaw), -Math.sin(focus.yaw)) + 0.9;
      const d = Math.atan2(Math.sin(want - this.followAz), Math.cos(want - this.followAz));
      this.followAz += d * (1 - Math.exp(-dt * 1.2));
      camAz = this.followAz;
    } else this.followAz = az;
    this.camera.position.set(target.x + Math.sin(camAz) * Math.cos(camEl) * dist, target.y + Math.sin(camEl) * dist, target.z + Math.cos(camAz) * Math.cos(camEl) * dist);
    this.camera.lookAt(target);
    const shift = portrait ? 0.085 : 0.03;
    this.camera.setViewOffset(this.width, this.height, 0, -this.height * shift, this.width, this.height);
    this.camera.near = Math.max(0.02, dist * 0.02);
    this.camera.far = 900;
    this.camera.updateProjectionMatrix();
    fog.near = this.camDist * 1.15;
    fog.far = this.camDist * 2.6 + 40;

    // Sun from the upper left-front, shadow box sized to the subject.
    const sunDir = new THREE.Vector3(-0.55, 0.8 - goldenish * 0.3, 0.45).normalize();
    if (this.heatK > 0.001) {
      // 酷熱: light comes from the top-right of the screen, down onto the tree.
      const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
      const toCam = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
      const hotDir = right.multiplyScalar(0.62).add(new THREE.Vector3(0, 0.82, 0)).addScaledVector(toCam, -0.12).normalize();
      sunDir.lerp(hotDir, this.heatK * 0.85).normalize();
    }
    const box = Math.max(9, R * 1.3);
    this.sun.position.copy(target).addScaledVector(sunDir, box * 3);
    this.sun.target.position.copy(target);
    const sc = this.sun.shadow.camera;
    sc.left = -box;
    sc.right = box;
    sc.top = box;
    sc.bottom = -box;
    sc.near = 0.5;
    sc.far = box * 6;
    sc.updateProjectionMatrix();
    this.fill.position.set(6, 4, 8);

    this.updateRain(rain, wind, dt, target);
    this.renderer.render(this.scene, this.camera);
    this.drawRays(input, t);
  }

  /** 酷熱: soft warm corner glow + slow light shafts, breathing gently; no flashes. */
  private drawRays(input: SceneInput, t: number): void {
    const age = t - this.swellT;
    const swell = age >= 0 && age < 6 ? Math.sin((age / 6) * Math.PI) : 0;
    const k = Math.max(this.heatK, swell * 0.9);
    const { glow, haze, shafts } = this.rays;
    this.renderer.toneMappingExposure = 0.95 + k * 0.03;
    if (k < 0.01) {
      glow.visible = haze.visible = false;
      shafts.forEach((m) => (m.visible = false));
      return;
    }
    const still = input.reducedMotion;
    const breath = still ? 1 : 0.82 + 0.14 * Math.sin(t * 0.55) + 0.05 * Math.sin(t * 1.4 + 1);
    const w = this.width;
    const h = this.height;
    const big = Math.max(w, h);
    const cx = w * 0.98;
    const cy = h * 0.99;
    glow.visible = haze.visible = true;
    glow.position.set(cx, cy, 0);
    glow.scale.set(big * 0.75, big * 0.75, 1);
    (glow.material as THREE.SpriteMaterial).opacity = 0.34 * k * breath;
    haze.position.set(cx, cy, 0);
    haze.scale.set(big * 2.2, big * 2.2, 1);
    (haze.material as THREE.SpriteMaterial).opacity = 0.08 * k;
    const tx = w * 0.42;
    const ty = h * 0.4;
    const base = Math.atan2(ty - cy, tx - cx);
    const dist = Math.hypot(tx - cx, ty - cy);
    const spread = [-0.26, -0.15, -0.05, 0.04, 0.14, 0.24];
    shafts.forEach((m, i) => {
      m.visible = true;
      const drift = still ? 0 : Math.sin(t * 0.07 + i * 1.7) * 0.025;
      m.position.set(cx, cy, 0);
      m.rotation.z = base + spread[i]! + drift;
      m.scale.set(dist * (1.05 + (i % 3) * 0.18), big * (0.045 + (i % 3) * 0.025), 1);
      const pulse = still ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.35 + i * 1.3);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.11 * k * pulse * breath;
    });
    const auto = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.render(this.hud, this.hudCam);
    this.renderer.autoClear = auto;
  }

  /** Preview image of a species at a stage (start screen and encyclopedia). */
  speciesThumb(species: SpeciesId, stage: number, heightCm: number, size = 192): string {
    const key = `${species}|${stage}|${size}`;
    const hit = this.speciesThumbs.get(key);
    if (hit) return hit;
    const build = buildTree({ species, stage, heightCm, health: 90, pests: 0, scars: 0, seed: 11 });
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#fff8e8', '#8a9a6a', 1.5));
    const d = new THREE.DirectionalLight('#fff1d6', 2.4);
    d.position.set(-2, 3, 2.5);
    scene.add(d);
    scene.add(build.group);
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(build.canopyRadius * 1.1 + 0.3, build.canopyRadius * 1.0 + 0.3, 0.12, 20), new THREE.MeshStandardMaterial({ color: '#8cc26a', flatShading: true }));
    ground.position.y = -0.06;
    scene.add(ground);
    const saved = { w: windUniforms.uWind.value, g: windUniforms.uGust.value, h: windUniforms.uHeight.value };
    windUniforms.uWind.value = 0;
    windUniforms.uGust.value = 0;
    windUniforms.uHeight.value = build.height;
    const box = new THREE.Box3().setFromObject(build.group);
    const center = box.getCenter(new THREE.Vector3());
    const dims = box.getSize(new THREE.Vector3());
    const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 500);
    const r = Math.max(dims.y * 0.55, dims.x * 0.6, dims.z * 0.6);
    cam.position.copy(center).add(new THREE.Vector3(0.35, 0.28, 1).normalize().multiplyScalar(r / Math.tan(THREE.MathUtils.degToRad(14)) * 1.02));
    cam.lookAt(center);
    const url = this.renderToUrl(scene, cam, size);
    windUniforms.uWind.value = saved.w;
    windUniforms.uGust.value = saved.g;
    windUniforms.uHeight.value = saved.h;
    build.dispose();
    ground.geometry.dispose();
    this.speciesThumbs.set(key, url);
    return url;
  }

  private renderToUrl(scene: THREE.Scene, cam: THREE.Camera, size: number): string {
    const rt = new THREE.WebGLRenderTarget(size, size, { colorSpace: THREE.SRGBColorSpace, samples: 4 });
    const prevTarget = this.renderer.getRenderTarget();
    const prevExposure = this.renderer.toneMappingExposure;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setRenderTarget(rt);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(scene, cam);
    const px = new Uint8Array(size * size * 4);
    this.renderer.readRenderTargetPixels(rt, 0, 0, size, size, px);
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMappingExposure = prevExposure;
    rt.dispose();
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(px.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  private updateRain(intensity: number, wind: number, dt: number, target: THREE.Vector3): void {
    this.rain.visible = intensity > 0;
    if (!intensity) return;
    const pos = this.rain.geometry.getAttribute('position') as THREE.BufferAttribute;
    const n = pos.count / 2;
    const active = Math.floor(n * intensity);
    this.rain.geometry.setDrawRange(0, active * 2);
    const span = Math.max(14, this.camDist * 0.9);
    const hgt = span * 1.2;
    const len = span * 0.035;
    const slant = Math.min(0.9, wind * 0.012);
    const speed = span * 1.4;
    const s = this.rainSeeds;
    const now = this.lastTime;
    for (let i = 0; i < active; i++) {
      const x0 = (s[i * 3]! - 0.5) * span * 1.6;
      const z0 = (s[i * 3 + 2]! - 0.5) * span * 1.6;
      const phase = (s[i * 3 + 1]! + (now * speed) / hgt) % 1;
      const y = target.y + hgt * 0.6 - phase * hgt;
      const x = x0 + slant * phase * hgt * 0.4;
      pos.setXYZ(i * 2, x, y, z0);
      pos.setXYZ(i * 2 + 1, x - slant * len, y - len, z0);
    }
    pos.needsUpdate = true;
    (this.rain.material as THREE.LineBasicMaterial).opacity = 0.35 + intensity * 0.35;
    void dt;
  }

  /** Album thumbnail rendered once per animal into a data URL. */
  thumbnail(id: string, unlocked: boolean): string | null {
    const key = `${id}|${unlocked}`;
    const hit = this.thumbs.get(key);
    if (hit) return hit;
    const fig = albumFigure(id);
    if (!fig) return null;
    const size = 128;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#ffffff', '#b0a080', 1.4));
    const d = new THREE.DirectionalLight('#fff1d6', 2.2);
    d.position.set(-1, 2, 2);
    scene.add(d);
    const holder = new THREE.Group();
    holder.add(fig);
    fig.position.set(0, 0, 0);
    const kind = animalById(id)?.look.kind;
    if (kind === 'butterfly' || kind === 'dragonfly' || kind === 'bee') fig.rotation.set(1.05, 0.5, 0);
    else fig.rotation.set(0, -0.5, 0);
    fig.scale.setScalar(1);
    fig.visible = true;
    scene.add(holder);
    const box = new THREE.Box3().setFromObject(holder);
    const center = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() * 0.5 || 1;
    const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    cam.position.copy(center).add(new THREE.Vector3(0.9, 0.7, 1.9).normalize().multiplyScalar(r / Math.sin(THREE.MathUtils.degToRad(15)) * 1.05));
    cam.lookAt(center);
    if (!unlocked) {
      holder.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.material = new THREE.MeshBasicMaterial({ color: '#5d6b62', transparent: true, opacity: 0.55 });
      });
    }
    const rt = new THREE.WebGLRenderTarget(size, size, { colorSpace: THREE.SRGBColorSpace, samples: 4 });
    const prevTarget = this.renderer.getRenderTarget();
    const prevShadow = this.renderer.shadowMap.enabled;
    this.renderer.setRenderTarget(rt);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(scene, cam);
    const px = new Uint8Array(size * size * 4);
    this.renderer.readRenderTargetPixels(rt, 0, 0, size, size, px);
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.shadowMap.enabled = prevShadow;
    this.renderer.setClearColor(0x000000, 1);
    rt.dispose();
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(px.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    ctx.putImageData(img, 0, 0);
    const url = c.toDataURL('image/png');
    this.thumbs.set(key, url);
    return url;
  }
}
