import * as THREE from 'three';
import type { SceneInput } from '../render';
import { hashString, clamp, mulberry32 } from '../util';
import { albumFigure, Animals3D, realScale, type AnimalArrival, type AnimalMarker, type EcoInfo, type EcoCaps } from './animals3d';
import { buildHabitat, resolveObstacles, type Habitat } from './habitat3d';
import { BLOCK, DRY, WATER, WalkNav, type NavObstacle } from './walkNav';
import { buildFence, buildIsland, ISLAND_R, onGardenWater, type Fence, type Island } from './island3d';
import { bucketScale, propBucket, propScaleFor, propUniforms } from './propScale';
import { animalFactor, FENCE_INSET_UNITS, fenceHeightUnits, islandScaleFor, shoreRadius } from '../scale';
import { buildTree, healthUniforms, treeKey, windUniforms, type TreeBuild, type TreeParams } from './tree3d';
import { FallFx, LeafLoop, fallenLog, disposeGroup, type FallMode } from './treeFx';
import { healthLook } from '../treeLook';
import { animalById } from '../data/animals';
import type { SpeciesId } from '../data/species';
import { jitterGeometry, merge, paint } from './util3d';
import { CareFx, type CareFxKind } from './careFx';
import { Campfire3D } from './campfire3d';
import { Mulch3D } from './mulch3d';
import { campfireNightK, campfireRadiusUnits, campfireSpot, mulchRadii, type CampfireSpot } from '../campfire';

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
  private dragging: { x: number; y: number; az: number; el: number; orbit?: boolean } | null = null;
  /** v10: orbit around a followed animal (one-finger drag), relative to the automatic follow angle. */
  private followOrbit = 0;
  private followOrbitEl = 0;
  private lastOrbit = -1e9;
  /** v10: how long the followed animal has been hidden (e.g. perched inside the crown), and the pull-out boost. */
  private occludedT = 0;
  private liftGoal = 0;
  private lift = 0;
  private lastFocusPos = new THREE.Vector3();
  private focusDelta = new THREE.Vector3();
  private lastFocusRef: unknown = null;
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
  /** v11: walk map for ground animals and what it was built for. */
  private nav: WalkNav | null = null;
  private navKey = '';
  private navPk = 0;
  private navTrunk = 0;
  private navBaseKey = '';
  private hud = new THREE.Scene();
  private hudCam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);
  private rays: { glow: THREE.Sprite; haze: THREE.Sprite; shafts: THREE.Mesh[] };
  private speciesThumbs = new Map<string, string>();
  private sky!: THREE.Mesh;
  /** Island landscape scale (1 = 1:1 metres; grows once the tree outgrows the island). */
  private islandK = 1;
  private fence: Fence | null = null;
  // Player zoom / pan / follow (pinch, wheel, tap an animal).
  private zoom = 1;
  private zoomGoal = 1;
  private panOff = new THREE.Vector3();
  private panGoal = new THREE.Vector3();
  private followRef: unknown = null;
  private followZoom = 1;
  /** Follow-cam occlusion avoidance: azimuth bias + distance cap, re-evaluated a few times a second. */
  private followBias = 0;
  private followBiasGoal = 0;
  private followCap = Infinity;
  private followCheckT = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch: { d: number; mx: number; my: number } | null = null;
  private tap: { x: number; y: number; t: number; moved: boolean } | null = null;
  private raycaster = new THREE.Raycaster();

  private canvas: HTMLCanvasElement;
  /** v15.1 澆水／施肥 effects; v15.2 nightly campfire and the 保暖 mulch layer. */
  private careFx = new CareFx();
  private campfire = new Campfire3D();
  private fireSpot: (CampfireSpot & { rU: number; key: string }) | null = null;
  private mulch: Mulch3D | null = null;
  private mulchKey = '';
  private mulchWas: boolean | null = null;
  private mulchR = { inner: 0, outer: 0 };
  /** Mulch animation clock; runs at `fxSpeed` × real time (checks slow it to screenshot mid-way). */
  private mulchClock = 0;
  private fxSpeed = 1;
  /** v16: 0→1 while a collapse / death plays — the camera drops lower and backs off a little to show the fall. */
  private fxCam = 0;
  /** v16 collapse / death effect in progress, and the dead log left by a death (a finished death FallFx). */
  private fall: FallFx | null = null;
  private fallSwapped = false;
  private fallReady: (() => void) | null = null;
  private deadLog: FallFx | null = null;
  private lastParams: TreeParams | null = null;
  private leafLoop = new LeafLoop(40);
  private fxStorm = 0;
  private shake = 0;
  /** v16 fallen top beside the tree (island units; days 1–3 after a collapse). */
  private logProp: { group: THREE.Group; key: string; x: number; z: number; a: number; lenU: number; rU: number } | null = null;
  private logWant: { key: string } | null = null;

  constructor(canvas: HTMLCanvasElement, quality: Quality = 'low') {
    this.canvas = canvas;
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // v16: broken tops and the collapse / death split use material clipping planes.
    this.renderer.localClippingEnabled = true;

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
    this.sky = sky;
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
    this.pivot.add(this.leafLoop.group);
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

    this.scene.add(this.careFx.root);
    // v15.2: the campfire's point light stays in the scene all the time (intensity 0 by day): no shader recompiles.
    this.scene.add(this.campfire.group, this.campfire.light);

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
  /** v15.1: play the 澆水 / 施肥 effect at the tree base (next frame). */
  playCare(kind: CareFxKind): void {
    this.careFx.play(kind);
  }

  /** v15.1/v15.2 checks: slow the care effects and the mulch laying down (1 = normal) so a headless browser can screenshot them mid-way. */
  setCareFxSpeed(k: number): void {
    this.careFx.timeScale = Math.max(0.01, k);
    this.fxSpeed = Math.max(0, k);
  }

  /** v16: tree materials without the health look (thumbnails, line-ups). */
  private neutralLook(fn: () => void): void {
    const saved = { w: healthUniforms.uWither.value, d: healthUniforms.uDroop.value, p: healthUniforms.uPulse.value };
    healthUniforms.uWither.value = healthUniforms.uDroop.value = healthUniforms.uPulse.value = 0;
    try {
      fn();
    } finally {
      healthUniforms.uWither.value = saved.w;
      healthUniforms.uDroop.value = saved.d;
      healthUniforms.uPulse.value = saved.p;
    }
  }

  /** Horizontal unit vector to the camera's right in the default view (deaths fall across the view). */
  private viewRight(): THREE.Vector3 {
    const az = BASE_AZIMUTH + this.dragAz;
    return new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  }

  private stumpCut(build: TreeBuild): number {
    return Math.max(0.02, Math.min(build.visibleTop * 0.07, build.trunkRadius * 2.2 + build.visibleTop * 0.02));
  }

  /**
   * v16: play the collapse as it happened: the tree as it stood (`heightBefore`, stage / health of that night) sways in a
   * darkened storm, snaps, its top falls toward where the fallen log will lie, fades, and the real shorter tree settles.
   * `fatal`: the third collapse — snaps at the base and the whole tree falls, staying as the dead log (`onReady` = time
   * for the over card). Returns false when it cannot play (no tree yet).
   */
  playCollapse(info: { heightBefore: number; stageBefore: number; healthBefore: number; fatal: boolean; reduced: boolean }, onReady?: () => void): boolean {
    const cur = this.lastParams;
    if (!cur || !this.tree) return false;
    this.clearFall();
    const before = buildTree({ ...cur, heightCm: info.heightBefore, stage: info.stageBefore, health: Math.max(8, info.healthBefore), brokenTop: 0 });
    let mode: FallMode = 'collapse';
    let cutY: number;
    let dir: THREE.Vector3;
    if (info.fatal) {
      mode = 'fatal';
      cutY = this.stumpCut(before);
      dir = this.viewRight();
    } else {
      const frac = clamp(this.tree.visibleTop / Math.max(0.01, before.visibleTop), 0.62, 0.82);
      cutY = before.visibleTop * frac;
      const spot = this.ensureLogSpot(true);
      dir = spot ? new THREE.Vector3(Math.cos(spot.a), 0, Math.sin(spot.a)) : this.viewRight();
    }
    this.startFall(new FallFx(before, mode, dir, cutY, info.reduced), onReady ?? null);
    return true;
  }

  /** v16 death: leaves drop, the tree leans and falls with a dust burst, then lies as the dead log. */
  playDeath(reduced: boolean, onReady?: () => void): boolean {
    const cur = this.lastParams;
    if (!cur || !this.tree) return false;
    if (this.fall && this.fall.mode !== 'collapse') return false;
    this.clearFall();
    this.clearDeadLog();
    const build = buildTree({ ...cur, health: Math.max(cur.health, 6) });
    this.startFall(new FallFx(build, 'death', this.viewRight(), this.stumpCut(build), reduced), onReady ?? null);
    return true;
  }

  private startFall(fx: FallFx, onReady: (() => void) | null): void {
    this.fall = fx;
    this.fallSwapped = false;
    this.follow = null;
    this.followRef = null;
    this.fallReady = onReady;
    this.pivot.add(fx.root);
  }

  private clearFall(): void {
    if (!this.fall) return;
    const ready = this.fallReady;
    this.fallReady = null;
    if (this.fall.mode === 'collapse') this.fall.dispose();
    else {
      this.fall.finish();
      this.clearDeadLog();
      this.deadLog = this.fall;
    }
    this.fall = null;
    ready?.();
  }

  private clearDeadLog(): void {
    this.deadLog?.dispose();
    this.deadLog = null;
  }

  /** v16: a collapse / death animation is playing. */
  fxBusy(): boolean {
    return Boolean(this.fall);
  }

  /** v16 effect state for checks and the dev panel. */
  fxInfo(): {
    fall: { mode: FallMode; phase: string; t: number } | null;
    deadLog: boolean;
    treeVisible: boolean;
    broken: boolean;
    visibleTopM: number;
    heightM: number;
    leafFall: number;
    logProp: boolean;
    animals: boolean;
    wither: number;
    droop: number;
    pulse: number;
    storm: number;
    shake: number;
  } {
    return {
      fall: this.fall ? { mode: this.fall.mode, phase: this.fall.phase(), t: this.fall.time() } : null,
      deadLog: Boolean(this.deadLog),
      treeVisible: Boolean(this.tree?.group.visible),
      broken: Boolean(this.tree?.brokenCut),
      visibleTopM: this.tree?.visibleTop ?? 0,
      heightM: this.tree?.height ?? 0,
      leafFall: this.leafLoop.active(),
      logProp: Boolean(this.logProp?.group.visible),
      animals: this.animals.root.visible,
      wither: healthUniforms.uWither.value,
      droop: healthUniforms.uDroop.value,
      pulse: healthUniforms.uPulse.value,
      storm: this.fxStorm,
      shake: this.shake,
    };
  }

  /**
   * v16 fallen top beside the tree: a spot (island units) on dry land to the camera's right, the log pointing away from
   * the trunk. Kept per collapse (logWant key) so it never jumps; `force` picks one even before the prop shows.
   */
  private ensureLogSpot(force = false): { x: number; z: number; a: number; lenU: number; rU: number } | null {
    const want = this.logWant;
    const tree = this.tree;
    if (!tree || (!want && !force)) return null;
    const key = want?.key ?? 'pending';
    if (this.logProp && this.logProp.key === key) return this.logProp;
    const kS = islandScaleFor(tree.metricScale);
    const trunkU = (tree.trunkRadius * 1.0) / Math.max(1e-3, kS);
    let lenU = clamp((tree.height * 0.28) / kS, 0.35, 2.4);
    const rU = clamp(Math.max(tree.trunkAxis(tree.visibleTop * 0.75).r * 1.25, tree.trunkRadius * 0.55) / kS, 0.03, 0.3);
    const R = this.habitat?.radius ?? ISLAND_R;
    const right = this.viewRight();
    // A little away from the camera: the top falls across the view (not foreshortened toward the lens) and the log
    // lies on open ground to the right of the trunk. (+angle turns toward the camera.)
    const base = Math.atan2(right.z, right.x) - 0.3;
    let pick: { x: number; z: number; a: number } | null = null;
    for (let shrink = 0; shrink < 3 && !pick; shrink++) {
      for (const j of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6]) {
        const a = base + j * 0.45;
        const start = trunkU * 2.4 + 0.12;
        const dx = Math.cos(a);
        const dz = Math.sin(a);
        let ok = start + lenU < shoreRadius(R, a) - FENCE_INSET_UNITS - 0.3;
        for (let k = 0; ok && k <= 4; k++) {
          const d = start + (lenU * k) / 4;
          if (this.wetOrBlocked(dx * d, dz * d, rU + 0.05)) ok = false;
          if (this.fireSpot && Math.hypot(this.fireSpot.x - dx * d, this.fireSpot.z - dz * d) < this.fireSpot.rU + rU + 0.1) ok = false;
          if (Math.hypot(2.8 - dx * d, 2.2 - dz * d) < 0.7) ok = false;
        }
        if (ok) {
          pick = { x: dx * start, z: dz * start, a };
          break;
        }
      }
      if (!pick) lenU *= 0.65;
    }
    if (!pick) return null;
    if (this.logProp) {
      this.scene.remove(this.logProp.group);
      disposeGroup(this.logProp.group);
    }
    const group = fallenLog(lenU, rU, hashString(key) % 17);
    group.visible = false;
    this.scene.add(group);
    this.logProp = { group, key, ...pick, lenU, rU };
    return this.logProp;
  }

  private updateLogProp(input: SceneInput): void {
    const day = input.fallenLog ?? 0;
    this.logWant = day > 0 && !input.dead ? { key: input.collapseKey || 'log' } : null;
    if (this.logProp && this.logWant && this.logProp.key === 'pending') this.logProp.key = this.logWant.key;
    const spot = this.logWant ? this.ensureLogSpot() : null;
    if (!spot || !this.logProp) {
      if (this.logProp) this.logProp.group.visible = false;
      return;
    }
    const K = this.islandK;
    const g = this.logProp.group;
    g.visible = !this.fall || (this.fall.mode === 'collapse' && this.fallSwapped);
    g.scale.setScalar(K);
    g.position.set(spot.x * K, this.groundFast(spot.x, spot.z) * K, spot.z * K);
    g.rotation.set(0, -spot.a, 0);
  }

  /** v16: collapse / death effects, the dead log, the health look and the falling-leaf loop — once per frame. */
  private updateTreeFx(input: SceneInput, tree: TreeBuild, t: number, dt: number): void {
    const fdt = dt * this.fxSpeed;
    this.shake = 0;
    this.fxStorm = 0;
    if (!input.dead && this.deadLog) this.clearDeadLog();
    if (this.fall) {
      const f = this.fall.update(fdt);
      this.shake = f.shake;
      this.fxStorm = f.storm;
      if (f.flash) this.flash = 1;
      if (f.swap && !this.fallSwapped) {
        this.fallSwapped = true;
        this.growFrom = clamp(this.fall.split.cutY / Math.max(0.01, tree.visibleTop), 0.6, 1.6);
        this.growStart = t;
      }
      if (f.ready && this.fallReady) {
        const cb = this.fallReady;
        this.fallReady = null;
        cb();
      }
      if (f.done) this.clearFall();
    }
    if (input.dead && !input.deathPending && !this.fall && !this.deadLog && this.lastParams) {
      // A dead tree seen again (reload, or the animation skipped): it just lies there.
      const build = buildTree({ ...this.lastParams, health: 6 });
      const fx = new FallFx(build, 'death', this.viewRight(), this.stumpCut(build), true);
      fx.finish();
      this.deadLog = fx;
      this.pivot.add(fx.root);
    }
    const hideTree = Boolean(this.deadLog) || Boolean(this.fall && (this.fall.mode !== 'collapse' || !this.fallSwapped));
    tree.group.visible = !hideTree;
    this.animals.root.visible = !this.fall && !this.deadLog && !input.dead;
    // Health look (continuous, no rebuild).
    const look = healthLook(input.health, Boolean(input.dying), Boolean(input.dead));
    healthUniforms.uWither.value = look.wither;
    healthUniforms.uDroop.value = look.droop * (input.reducedMotion ? 0.7 : 1);
    healthUniforms.uPulse.value = look.pulse ? (input.reducedMotion ? 0.07 : 0.04 + 0.09 * (0.5 + 0.5 * Math.sin(t * 2.6))) : 0;
    const rate = hideTree ? 0 : look.leafFall * (input.reducedMotion ? 0.25 : 1);
    this.leafLoop.update(dt, rate, tree.visibleTop, tree.crownY, tree.canopyRadius);
    this.leafLoop.group.scale.setScalar(tree.group.scale.x);
    this.updateLogProp(input);
  }

  /** Campfire / mulch state for checks: night fade, fire spot (metres), mulch ring (metres), live care effects. */
  campfireInfo(): { lit: boolean; nightK: number; lightIntensity: number; x: number; z: number; radiusM: number; trunkM: number; distM: number; fx: number; mulch: boolean; laying: boolean; mulchInnerM: number; mulchOuterM: number } {
    const K = this.islandK;
    const s = this.fireSpot;
    const trunkM = (this.tree?.trunkRadius ?? 0) * (this.tree?.group.scale.x ?? 1);
    return {
      lit: this.campfire.group.visible,
      nightK: this.campfire.nightK(),
      lightIntensity: this.campfire.light.intensity,
      x: (s?.x ?? 0) * K,
      z: (s?.z ?? 0) * K,
      radiusM: (s?.rU ?? 0) * K,
      trunkM,
      distM: (s?.dist ?? 0) * K,
      fx: this.careFx.count(),
      mulch: Boolean(this.mulch?.isVisible()),
      laying: Boolean(this.mulch?.laying(this.mulchClock)),
      mulchInnerM: this.mulchR.inner * K,
      mulchOuterM: this.mulchR.outer * K,
    };
  }

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

  /** Size audit: drawn vs real length of every species on screen, and the shared factor — for checks. */
  animalSizes(): { factor: number; sizes: { id: string; realLen: number; drawnLen: number; ratio: number }[] } {
    return { factor: this.animals.factor(), sizes: this.animals.drawnSizes() };
  }

  /** Walkers: distance from centre vs the fence limit, and whether they stand on water — for checks. */
  walkerSpots(): { id: string; r: number; limit: number; wet: boolean }[] {
    return this.animals.walkerSpots();
  }

  /** Aim the overview camera at an island point (island angle, radius share) and zoom — for close-up checks. */
  lookAtRim(angle: number, share: number, zoom: number, az?: number): void {
    const K = this.islandK;
    const R = shoreRadius(this.habitat?.radius ?? ISLAND_R, angle) * share * K;
    const p = new THREE.Vector3(Math.cos(angle) * R, 0.1 * K, Math.sin(angle) * R);
    this.zoomGoal = zoom;
    this.panGoal.copy(p.sub(new THREE.Vector3(0, this.camTargetY, 0)));
    if (az !== undefined) this.dragAz = az;
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

  /** v13.1 instrumentation: timed-rotation countdown and the smallest visible crew. */
  rotationInfo(): ReturnType<Animals3D['rotationInfo']> {
    return this.animals.rotationInfo();
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
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        c.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic or already-released pointer */
      }
      if (this.pointers.size === 1) {
        this.dragging = this.startDrag(e.clientX, e.clientY);
        this.tap = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
      } else if (this.pointers.size === 2) {
        // Second finger: pinch-zoom / two-finger pan instead of rotating.
        this.dragging = null;
        this.tap = null;
        const [p1, p2] = [...this.pointers.values()];
        this.pinch = { d: Math.hypot(p1!.x - p2!.x, p1!.y - p2!.y), mx: (p1!.x + p2!.x) / 2, my: (p1!.y + p2!.y) / 2 };
      }
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.tap && Math.hypot(e.clientX - this.tap.x, e.clientY - this.tap.y) > 8) this.tap.moved = true;
      if (this.pinch && this.pointers.size >= 2) {
        const [p1, p2] = [...this.pointers.values()];
        const d = Math.max(10, Math.hypot(p1!.x - p2!.x, p1!.y - p2!.y));
        const mx = (p1!.x + p2!.x) / 2;
        const my = (p1!.y + p2!.y) / 2;
        this.zoomBy(this.pinch.d / d, mx, my);
        this.panBy(mx - this.pinch.mx, my - this.pinch.my);
        this.pinch = { d, mx, my };
        this.lastDrag = performance.now();
        return;
      }
      if (!this.dragging) return;
      const dx = (e.clientX - this.dragging.x) / Math.max(200, this.width);
      const dy = (e.clientY - this.dragging.y) / Math.max(200, this.height);
      if (this.dragging.orbit) {
        // v10: while following, one finger orbits round the animal (it stays centred); follow is never cancelled.
        this.followOrbit = this.dragging.az - dx * 3.4;
        this.followOrbitEl = clamp(this.dragging.el + dy * 1.4, -0.3, 0.85);
        if (this.tap?.moved) this.lastOrbit = performance.now();
        this.lastDrag = performance.now();
        return;
      }
      const free = this.isZoomed();
      this.dragAz = clamp(this.dragging.az - dx * 2.2, free ? -Math.PI : -0.6, free ? Math.PI : 0.6);
      this.dragEl = clamp(this.dragging.el + dy * 0.8, free ? -0.5 : -0.15, free ? 0.35 : 0.15);
      this.lastDrag = performance.now();
    });
    const end = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 1) {
        const [p] = [...this.pointers.values()];
        this.dragging = this.startDrag(p!.x, p!.y);
      } else if (this.pointers.size === 0) {
        this.dragging = null;
        if (e.type === 'pointerup' && this.tap && !this.tap.moved && performance.now() - this.tap.t < 350) this.tapAt(e.clientX, e.clientY);
        this.tap = null;
      }
      this.lastDrag = performance.now();
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
        this.zoomBy(Math.exp(clamp(e.deltaY * unit, -200, 200) * 0.0022), e.clientX, e.clientY);
        this.lastDrag = performance.now();
      },
      { passive: false },
    );
  }

  private startDrag(x: number, y: number): { x: number; y: number; az: number; el: number; orbit?: boolean } {
    if (this.followRef || this.follow) return { x, y, az: this.followOrbit, el: this.followOrbitEl, orbit: true };
    return { x, y, az: this.dragAz, el: this.dragEl };
  }

  /** v10: orbit the follow camera programmatically (tests): add `daz` radians / change the elevation offset. */
  orbitBy(daz: number, del = 0): void {
    this.followOrbit += daz;
    this.followOrbitEl = clamp(this.followOrbitEl + del, -0.3, 0.85);
    this.lastOrbit = performance.now();
  }

  /** v10: follow-cam state (tests). */
  followCamInfo(): { orbit: number; orbitEl: number; chase: boolean; az: number; lift: number; screen: { x: number; y: number } | null; px: number } {
    const f = this.followRef ? this.animals.focusRef(this.followRef) : null;
    let screen: { x: number; y: number } | null = null;
    let px = 0;
    if (f) {
      const v = f.pos.clone().project(this.camera);
      screen = { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height };
      const d = this.camera.position.distanceTo(f.pos);
      px = (f.size / Math.max(1e-4, d)) / ((2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / Math.max(1, this.height));
    }
    return { orbit: this.followOrbit, orbitEl: this.followOrbitEl, chase: Boolean(f?.flying), az: this.followAz, lift: this.lift, screen, px };
  }

  /** v10: share of the island's land area that is water (garden stream / pond + habitat water), by sampling. */
  waterShare(): { share: number; stage: number } {
    const R = this.habitat?.radius ?? ISLAND_R;
    let n = 0;
    let wet = 0;
    for (let x = -R; x <= R; x += 0.12) {
      for (let z = -R; z <= R; z += 0.12) {
        const r = Math.hypot(x, z);
        if (r > shoreRadius(R, Math.atan2(z, x)) - 0.2 || r < 1.2) continue;
        n++;
        const inGarden = r < ISLAND_R;
        if ((inGarden && onGardenWater(x, z, 0)) || (this.habitat && this.habitat.isWater(x, z, 0))) wet++;
      }
    }
    return { share: n ? wet / n : 0, stage: this.habitat?.stage ?? 0 };
  }

  private resetFollowCam(): void {
    this.followOrbit = 0;
    this.followOrbitEl = 0;
    this.occludedT = 0;
    this.liftGoal = 0;
    this.lastOrbit = -1e9;
  }

  private ndc(x: number, y: number): THREE.Vector2 {
    const r = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(((x - r.left) / Math.max(1, r.width)) * 2 - 1, -((y - r.top) / Math.max(1, r.height)) * 2 + 1);
  }

  /** World point under the screen position (tree, island, habitat), or on the ground plane. */
  private pointUnder(x: number, y: number): THREE.Vector3 {
    this.raycaster.setFromCamera(this.ndc(x, y), this.camera);
    const objs: THREE.Object3D[] = [this.pivot, this.island.group];
    if (this.habitat) objs.push(this.habitat.group);
    const hit = this.raycaster.intersectObjects(objs, true).find((h) => (h.object as THREE.Mesh).isMesh && !(h.object as THREE.Sprite).isSprite);
    if (hit) return hit.point;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1);
    return this.raycaster.ray.intersectPlane(plane, new THREE.Vector3()) ?? new THREE.Vector3(0, this.camTargetY, 0);
  }

  /** Distance to the first obstacle (tree, island, habitat) between `from` and a camera at (az, el, dist). */
  private obstacle(from: THREE.Vector3, az: number, el: number, dist: number, skip: number): number {
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    this.raycaster.set(from, dir);
    this.raycaster.camera = this.camera; // sprites (labels, sparkles) need it
    this.raycaster.near = skip;
    this.raycaster.far = dist;
    const objs: THREE.Object3D[] = [this.island.group];
    if (this.tree) objs.push(this.tree.group);
    if (this.habitat) objs.push(this.habitat.group);
    const hit = this.raycaster.intersectObjects(objs, true).find((h) => (h.object as THREE.Mesh).isMesh);
    this.raycaster.near = 0;
    this.raycaster.far = Infinity;
    return hit ? hit.distance : Infinity;
  }

  /** Pick an orbit angle with a clear line of sight to the followed animal; else cap the distance. */
  private clearView(target: THREE.Vector3, az: number, el: number, dist: number, size: number, lock = false): { bias: number; cap: number } {
    const skip = Math.max(0.05, size * 0.5);
    let best = { bias: 0, cap: 0 };
    // While the player is orbiting, keep their angle (only move closer); otherwise try a few angles for a clear view.
    const tries = lock ? [0] : [this.followBiasGoal, 0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.4, -2.4, Math.PI];
    for (const b of tries) {
      const d = this.obstacle(target, az + b, el, dist, skip);
      if (d === Infinity) return { bias: b, cap: Infinity };
      if (d > best.cap) best = { bias: b, cap: d };
    }
    return { bias: best.bias, cap: Math.max(skip * 1.2, best.cap * 0.9) };
  }

  /** Zoom by `factor` (<1 = closer), keeping the point under (x, y) fixed on screen. */
  zoomBy(factor: number, x?: number, y?: number): void {
    if (!Number.isFinite(factor) || factor <= 0) return;
    if (this.followRef || this.follow) {
      this.followZoom = clamp(this.followZoom * factor, 0.35, 8);
      return;
    }
    // Closest free zoom: 1.5 m from the aim point (less for a tiny seedling whose overview is already close).
    const minDist = clamp(this.camDist * 0.5, 0.3, 1.5);
    const minZoom = clamp(minDist / Math.max(0.3, this.camDist), 0.004, 1);
    // Zooming out past the overview shows the whole island (useful while the tree is still small).
    const islandR = (this.habitat?.radius ?? ISLAND_R) * this.islandK;
    const maxZoom = Math.max(1, (islandR * 3.4) / Math.max(0.3, this.camDist));
    const z0 = this.zoomGoal;
    const z1 = clamp(z0 * factor, minZoom, maxZoom);
    if (z1 === z0) return;
    const auto = new THREE.Vector3(0, this.camTargetY, 0);
    const T = auto.clone().add(this.panGoal);
    let T2: THREE.Vector3;
    if (x === undefined || y === undefined || z1 > 1) T2 = T;
    else {
      // Homothety about the point under the cursor, from what is on screen now (the camera may still be easing).
      const A = this.pointUnder(x, y);
      const cur = auto.clone().add(this.panOff);
      T2 = A.clone().add(cur.sub(A).multiplyScalar(z1 / Math.max(1e-4, this.zoom)));
    }
    this.panGoal.copy(T2.sub(auto));
    this.zoomGoal = z1;
    this.clampPan();
  }

  /** Two-finger pan in screen pixels. */
  private panBy(dx: number, dy: number): void {
    if (!this.isZoomed() || this.followRef || this.follow) return;
    const dist = this.camDist * this.zoom;
    const perPx = (2 * dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / Math.max(1, this.height);
    const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);
    this.panGoal.addScaledVector(right, -dx * perPx).addScaledVector(up, dy * perPx);
    this.clampPan();
  }

  private clampPan(): void {
    const R = (this.habitat?.radius ?? ISLAND_R) * this.islandK * 1.05;
    const h = Math.hypot(this.panGoal.x, this.panGoal.z);
    if (h > R) this.panGoal.multiplyScalar(R / h);
    const top = Math.max(1, (this.tree?.height ?? 1) * 1.1);
    const y = this.camTargetY + this.panGoal.y;
    if (y < 0.03) this.panGoal.y = 0.03 - this.camTargetY;
    if (y > top) this.panGoal.y = top - this.camTargetY;
  }

  /** Tap: follow the animal under the finger (with a little slack for tiny ones). */
  private tapAt(x: number, y: number): void {
    this.raycaster.setFromCamera(this.ndc(x, y), this.camera);
    const perPx = (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / Math.max(1, this.height);
    const hit = this.animals.pick(this.raycaster.ray, (d) => d * perPx * 26);
    if (hit) {
      this.followRef = hit;
      this.follow = null;
      this.followZoom = 1;
      this.resetFollowCam();
      return;
    }
    // v9: a tap that just misses a moving overview marker (flocks move fast on screen) still follows that group.
    const r = this.canvas.getBoundingClientRect();
    let best: { uid: number; d: number } | null = null;
    for (const m of this.animals.markers(this.camera, this.width, this.height)) {
      if (m.px > 22) continue;
      // Pin head sits ~30 px above the animal; accept taps on the pin or the animal.
      const d = Math.min(Math.hypot(m.x + r.left - x, m.y + r.top - y), Math.hypot(m.x + r.left - x, m.y - 30 + r.top - y));
      if (d < 48 && (!best || d < best.d)) best = { uid: m.uid, d };
    }
    if (best) this.followCrew(best.uid);
  }

  /** v9: overview markers (one per visiting group), in CSS px of the canvas. */
  animalMarkers(): AnimalMarker[] {
    return this.animals.markers(this.camera, this.width, this.height);
  }

  /** v9: follow a group by uid (marker tap, toast tap, animal list). */
  followCrew(uid: number): boolean {
    const h = this.animals.handleFor(uid);
    if (!h) return false;
    this.followRef = h;
    this.follow = null;
    this.followZoom = 1;
    this.resetFollowCam();
    return true;
  }

  /** uid of the group being followed (tap / marker / list), if any. */
  followingUid(): number | null {
    const h = this.followRef as { crew: { uid: number } } | null;
    return h && this.animals.refName(h) ? h.crew.uid : null;
  }

  crewList(): ReturnType<Animals3D['crewList']> {
    return this.animals.crewList();
  }

  takeArrivals(): AnimalArrival[] {
    return this.animals.takeArrivals();
  }

  hintStats(): { trails: number; sparkles: number } {
    return this.animals.hintStats();
  }

  isZoomed(): boolean {
    return this.zoomGoal < 0.97 || this.zoomGoal > 1.03 || this.panGoal.lengthSq() > 0.01;
  }

  /** Whether the player has left the overview (zoomed or following), and who is being followed. */
  viewState(): { active: boolean; following: string | null } {
    const name = this.followRef ? this.animals.refName(this.followRef) : null;
    return { active: this.isZoomed() || Boolean(this.followRef), following: name };
  }

  /** v11 instrumentation: advance the animals only (no rendering), n steps of dt seconds. */
  private simT = 0;
  simStep(dt: number, n: number): void {
    this.simT = Math.max(this.simT, this.lastTime);
    for (let i = 0; i < n; i++) {
      this.simT += dt;
      this.animals.update(this.simT, dt, 0);
    }
  }

  walkerDump(): ReturnType<Animals3D['walkerDump']> {
    return this.animals.walkerDump();
  }

  /** Back to the automatic overview. */
  resetView(): void {
    this.zoomGoal = 1;
    this.panGoal.set(0, 0, 0);
    this.followRef = null;
    this.followZoom = 1;
    this.dragAz = 0;
    this.dragEl = 0;
    this.resetFollowCam();
  }

  /** Screen position (CSS px) of an animal of `id` — for automated tap checks. */
  animalScreen(id: string): { x: number; y: number } | null {
    const f = this.animals.focus(id);
    if (!f) return null;
    const v = f.pos.clone().project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  /** Heights (m above the tree base) of every airborne animal right now, plus the ceiling — for checks. */
  flyerHeights(): { id: string; y: number; ceiling: number; perched: boolean }[] {
    return this.animals.flyerHeights();
  }

  /** Current zoom (1 = overview) and camera distance in metres — for tests and the dev panel. */
  cameraInfo(): { zoom: number; distM: number; islandK: number; treeM: number } {
    return { zoom: this.zoomGoal, distM: this.camDist * this.zoom, islandK: this.islandK, treeM: this.tree?.height ?? 0 };
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
      brokenTop: input.brokenTop ?? 0,
    };
    this.lastParams = params;
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

  /** Ground height (island units) under (x, z), read from the rendered garden / habitat land meshes. */
  private groundRay = new THREE.Raycaster();
  private groundUnits(x: number, z: number): number {
    const K = this.islandK;
    const meshes: THREE.Object3D[] = [this.island.grass, ...(this.habitat?.ground ?? [])];
    this.groundRay.set(new THREE.Vector3(x * K, 60 * K, z * K), new THREE.Vector3(0, -1, 0));
    this.groundRay.far = 200 * K;
    const hit = this.groundRay.intersectObjects(meshes, false)[0];
    if (hit) return hit.point.y / K;
    const r = Math.hypot(x, z);
    return r < ISLAND_R ? 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2) : (this.habitat?.groundAt(x, z) ?? -0.02);
  }

  /** Analytic ground height (island units) matching the garden dome and the habitat land — cheap, for animals. */
  private groundFast(x: number, z: number): number {
    const r = Math.hypot(x, z);
    if (r < shoreRadius(ISLAND_R, Math.atan2(z, x)) - 0.05) {
      const dome = 0.18 * (1 - Math.min(1, r / ISLAND_R) ** 2);
      return this.habitat && this.habitat.stage > 0 ? Math.max(dome, this.habitat.groundAt(x, z)) : dome;
    }
    return this.habitat?.groundAt(x, z) ?? -0.02;
  }

  /** Water / obstacle test in island units (garden stream, habitat ponds, streams, inlets, hills, cliffs). */
  private wetOrBlocked(x: number, z: number, pad: number): boolean {
    if (Math.hypot(x, z) < ISLAND_R + 0.4 && onGardenWater(x, z, 0.06 + pad)) return true;
    return Boolean(this.habitat && (this.habitat.isWater(x, z, pad) || this.habitat.isBlocked(x, z)));
  }

  /** (Re)build the fence on the current island's rendered shoreline; the fence group scales with the island. */
  private ensureFence(treeM: number): void {
    const R = this.habitat?.radius ?? ISLAND_R;
    const hU = fenceHeightUnits(this.islandK, treeM);
    const key = `${this.habitatKey}|${R}`;
    const stale = !this.fence || !this.fence.key.startsWith(key + '|') || Math.abs(Number(this.fence.key.split('|').pop()) - hU) / hU > 0.04;
    if (stale) {
      if (this.fence) {
        this.scene.remove(this.fence.group);
        this.fence.dispose();
      }
      this.island.group.updateMatrixWorld(true);
      this.habitat?.group.updateMatrixWorld(true);
      this.fence = buildFence({
        R,
        hUnits: hU,
        key: `${key}|${hU}`,
        groundAt: (x, z) => this.groundUnits(x, z),
        skip: (x, z) => this.wetOrBlocked(x, z, 0.02),
      });
      this.scene.add(this.fence.group);
    }
    this.fence!.group.scale.setScalar(this.islandK);
  }

  /** Fence radius in metres (for tests / dev panel). */
  fenceInfo(): { fenceRadius: number; islandRadius: number } {
    const K = this.islandK;
    const posts = this.fence?.posts ?? [];
    const mean = posts.length ? posts.reduce((n, p) => n + p.r, 0) / posts.length : 0;
    return { fenceRadius: mean * K, islandRadius: (this.habitat?.radius ?? ISLAND_R) * K };
  }

  /**
   * Check every fence post against the rendered island: march outward from the post along its angle, raycasting down
   * onto the garden / habitat land meshes, until the land ends. Returns the gap (metres and island units) between each
   * post and the real edge, plus how many posts are off the land.
   */
  fenceCheck(): { posts: number; offLand: number; maxGapUnits: number; meanGapUnits: number; maxGapM: number; K: number; stage: number; skipped: number } {
    const K = this.islandK;
    const posts = this.fence?.posts ?? [];
    this.island.group.updateMatrixWorld(true);
    this.habitat?.group.updateMatrixWorld(true);
    const meshes: THREE.Object3D[] = [this.island.grass, ...(this.habitat?.ground ?? [])];
    const onLand = (x: number, z: number) => {
      this.groundRay.set(new THREE.Vector3(x * K, 60 * K, z * K), new THREE.Vector3(0, -1, 0));
      this.groundRay.far = 200 * K;
      return this.groundRay.intersectObjects(meshes, false).length > 0;
    };
    let off = 0;
    let maxGap = 0;
    let sum = 0;
    for (const p of posts) {
      if (!onLand(p.x, p.z)) {
        off++;
        continue;
      }
      let d = 0;
      const step = 0.01;
      while (d < 3 && onLand(p.x + Math.cos(p.a) * (d + step), p.z + Math.sin(p.a) * (d + step))) d += step;
      maxGap = Math.max(maxGap, d);
      sum += d;
    }
    const R = this.habitat?.radius ?? ISLAND_R;
    const all = Math.max(24, Math.round((Math.PI * 2 * R) / 1.05)) + 1;
    return { posts: posts.length, offLand: off, maxGapUnits: maxGap, meanGapUnits: posts.length ? sum / posts.length : 0, maxGapM: maxGap * K, K, stage: this.habitat?.stage ?? 0, skipped: all - posts.length };
  }

  private ensureHabitat(input: SceneInput): void {
    const stage = clamp(Math.round(input.islandStage ?? input.stage), 0, 4);
    // v10: props are laid out for the prop scale the tree is heading to (quantised, so only big changes rebuild).
    const bucket = this.propBucketGoal();
    const key = `${input.species}|${stage}|${this.quality}|p${bucket}`;
    if (key === this.habitatKey) return;
    this.habitatKey = key;
    if (this.habitat) {
      this.scene.remove(this.habitat.group);
      this.habitat.dispose();
    }
    this.habitat = buildHabitat(input.species, stage, this.quality, bucketScale(bucket));
    this.animals.setGround(
      (x, z) => this.groundFast(x / this.islandK, z / this.islandK) * this.islandK,
      (x, z) => !this.wetOrBlocked(x / this.islandK, z / this.islandK, 0.2),
    );
    this.scene.add(this.habitat.group);
    this.island.setExtended(stage >= 1);
    this.animals.setIslandRadius(this.habitat.radius, this.islandK);
  }

  /**
   * v11: walkable map for ground animals (island units): land inside the fence, minus water (+ bank), hills and
   * cliffs, and the footprints of solid props (rocks, bushes, tree ferns, small trees, buildings, the trunk) at the
   * current prop scale. Rebuilt when the habitat changes or props / trunk rescale by more than a few percent.
   */
  private ensureNav(tree: TreeBuild, K: number, propK: number, landmark: boolean, fire: (CampfireSpot & { rU: number; key: string }) | null): void {
    const trunkU = Math.max(0.05, (tree.trunkRadius * 1.3) / Math.max(1e-3, K));
    const log = this.logWant && this.logProp && this.logProp.key !== 'pending' ? this.logProp : null;
    const key = `${this.habitatKey}|${landmark ? 1 : 0}|${fire ? fire.key : ''}|${log ? log.key : ''}`;
    if (this.nav && key === this.navKey && Math.abs(propK - this.navPk) / this.navPk < 0.04 && Math.abs(trunkU - this.navTrunk) / this.navTrunk < 0.08) return;
    this.navKey = key;
    this.navPk = propK;
    this.navTrunk = trunkU;
    const R = this.habitat?.radius ?? ISLAND_R;
    const hab = this.habitat;
    const obstacles: NavObstacle[] = [];
    for (const o of this.island.obstacles()) obstacles.push({ x: o.x, z: o.z, r: o.r * propK, fixed: true, kind: o.kind });
    if (hab && hab.stage > 0) for (const o of resolveObstacles(hab.obstacles, propK)) obstacles.push({ ...o, fixed: true });
    if (landmark) obstacles.push({ x: 2.8, z: 2.2, r: 0.55, fixed: true, kind: 'landmark' });
    if (fire) obstacles.push({ x: fire.x, z: fire.z, r: fire.rU * 1.15, fixed: true, kind: 'campfire' });
    // v16: the fallen top beside the tree (a few circles along the log).
    if (log) for (let i = 0; i < 3; i++) {
      const d = log.lenU * (0.2 + i * 0.3);
      obstacles.push({ x: log.x + Math.cos(log.a) * d, z: log.z + Math.sin(log.a) * d, r: Math.max(0.12, log.rU * 1.8), fixed: true, kind: 'log' });
    }
    this.nav = new WalkNav({
      R,
      limit: (a) => shoreRadius(R, a) - FENCE_INSET_UNITS - 0.15,
      terrain: (x, z) => {
        if (hab && hab.isBlocked(x, z)) return BLOCK;
        if (Math.hypot(x, z) < ISLAND_R + 0.4 && onGardenWater(x, z, 0.06 + 0.2)) return WATER;
        if (hab && hab.isWater(x, z, 0.2)) return WATER;
        return DRY;
      },
      obstacles,
      propK: 1,
      trunkR: trunkU,
      base: this.nav && this.navBaseKey === `${key}|${R}` ? this.nav.base : undefined,
    });
    this.navBaseKey = `${key}|${R}`;
    this.animals.setNav(this.nav);
  }

  navInfo(): ReturnType<Animals3D['navInfo']> {
    return this.animals.navInfo();
  }

  /** v10: prop density bucket for the tree's (goal) size. */
  private propBucketGoal(): number {
    const tree = this.tree;
    if (!tree) return 0;
    return propBucket(propScaleFor(tree.height, islandScaleFor(tree.metricScale)));
  }

  /** v10: prop scale now (island units per design unit) and the layout bucket — for tests / dev panel. */
  propInfo(): { propK: number; bucket: number; islandK: number; treeM: number; propM: number; tris: number; calls: number } {
    const treeM = this.tree?.height ?? 0;
    const pk = propUniforms.uPropK.value;
    const r = this.renderer.info.render;
    return { propK: pk, bucket: this.propBucketGoal(), islandK: this.islandK, treeM, propM: pk * this.islandK, tris: r.triangles, calls: r.calls };
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
    const rain = Math.max(rainOf(input), this.fxStorm * 0.8);
    const storming = input.cond.stormKind === 'typhoon' || input.cond.code >= 95;
    const stormy = storming || !!input.cond.stormKind;
    // v16: the collapse replay darkens the sky like a storm (fxStorm is last frame's value; it eases in and out).
    const sk = Math.max(stormy ? 1 : 0, this.fxStorm);
    const golden = day > 0 && day < 1 ? 1 - Math.abs(day - 0.5) * 2 : 0;
    const goldenish = Math.max(golden, clamp(1 - Math.min(Math.abs(input.minute - input.sunriseMin), Math.abs(input.minute - input.sunsetMin)) / 70, 0, 1) * day);

    const skyTopDay = new THREE.Color('#79bfeb').lerp(new THREE.Color('#8d99a6'), over).lerp(new THREE.Color('#4b5563'), 0.55 * sk);
    const skyMidDay = new THREE.Color('#cde8f6').lerp(new THREE.Color('#b8c2ca'), over).lerp(new THREE.Color('#687380'), 0.5 * sk);
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
    this.sun.intensity = (0.7 * night + day * 2.6) * (1 - over * 0.72) * (1 - 0.55 * sk) * (1 + this.heatK * 0.12);
    this.sun.color.lerp(new THREE.Color('#ffcf87'), this.heatK * 0.45);
    this.hemi.color.copy(new THREE.Color('#7086bd').lerp(new THREE.Color('#fff2da'), day).lerp(new THREE.Color('#c7cdd3'), over * 0.5));
    this.hemi.groundColor.copy(new THREE.Color('#2c3a33').lerp(new THREE.Color('#78905a'), day));
    this.hemi.intensity = (0.75 + day * 0.55) * (1 - 0.38 * sk);
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
    const level = Math.max(clamp(input.sway, 0, 1), this.fxStorm * 0.9);
    if (t > this.nextGust) {
      this.gustTarget = level > 0.25 ? 0.45 + Math.random() * 0.55 : Math.random() * 0.35;
      this.nextGust = t + 1.2 + Math.random() * (4.5 - level * 3);
    }
    this.gustTarget *= Math.exp(-dt * 0.9);
    this.gust += (this.gustTarget - this.gust) * (1 - Math.exp(-dt * 3));
    const gust = this.gust * level;
    const tall = 1 / (1 + tree.localHeight * 0.04);
    const amp = (0.004 + level * 0.065) * (1 + gust * 0.8) * motion * tall;
    const freq = 0.8 + level * 1.5;
    const lean = level * 0.085 * (0.55 + gust * 0.7) * motion * tall;
    this.pivot.rotation.z = -lean + Math.sin(t * freq) * amp + Math.sin(t * freq * 2.37 + 0.6) * amp * 0.35;
    this.pivot.rotation.x = Math.sin(t * freq * 0.8 + 1) * amp * 0.5;
    windUniforms.uTime.value = t;
    windUniforms.uWind.value = level * motion;
    windUniforms.uGust.value = gust * motion;
    windUniforms.uHeight.value = Math.max(0.6, tree.localHeight);
    const wind = level * 110 + gust * 20;

    // Island landscape scale and the fence on its current rim.
    const stageR = this.habitat?.radius ?? ISLAND_R;
    // v8: the island is scaled exactly like the tree model, so tree : island keeps the v6 proportions.
    const kGoal = islandScaleFor(tree.metricScale);
    this.islandK += (kGoal - this.islandK) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 2));
    if (Math.abs(this.islandK - kGoal) < 0.002) this.islandK = kGoal;
    const K = this.islandK;
    this.island.group.scale.setScalar(K);
    this.habitat?.group.scale.setScalar(K);
    this.pivot.position.y = 0.18 * K;
    this.landmark.scale.setScalar(K);
    this.landmark.position.set(2.8 * K, 0.05 * K, 2.2 * K);
    this.animals.setIslandRadius(stageR, K);
    this.ensureFence(tree.height);
    // v10: small props at animal scale (GPU-scaled about their anchors), bridge included.
    const propK = propScaleFor(tree.height, K);
    propUniforms.uPropK.value = propK;
    this.island.setProps(propK, this.propBucketGoal());
    // Dirt patch around the trunk (v6 sizing, in island units).
    this.island.dirt.scale.setScalar(clamp(0.3 + tree.localHeight * 0.09, 0.3, 1.5));
    this.island.update(t, wind);
    this.habitat?.update(t, wind);
    this.landmark.visible = Boolean(input.landmark);
    this.sparkles.visible = Boolean(input.starry);
    if (this.sparkles.visible) {
      this.sparkles.rotation.y = t * 0.05;
      this.sparkles.scale.setScalar(((this.habitat?.radius ?? 7) * this.islandK) / 7);
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
    this.updateTreeFx(input, tree, t, dt);
    this.pivot.updateMatrixWorld(true);
    tree.sync();
    this.fall?.sync();
    this.deadLog?.sync();
    const fire = this.ensureCampfire(input, tree, K, propK);
    this.ensureNav(tree, K, propK, Boolean(input.landmark), fire);
    this.animals.setView(this.camera.position, (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / Math.max(1, this.height), this.renderer.getPixelRatio());
    this.animals.update(t, dt, night);

    const islandR = (this.habitat?.radius ?? ISLAND_R) * this.islandK;
    const islandStage = this.habitat?.stage ?? 0;
    // Clouds drift; overcast brings more and darker clouds.
    const cloudTint = new THREE.Color('#ffffff').lerp(new THREE.Color('#9aa3ad'), over).lerp(new THREE.Color('#59616b'), 0.6 * sk).lerp(new THREE.Color('#39435e'), night * 0.8);
    this.cloudMat.color.copy(cloudTint);
    this.cloudMat.emissiveIntensity = 0.35 * day * (1 - over * 0.6);
    const visibleClouds = 8 + Math.round(over * 8);
    // Clouds keep their v6 layout, scaled with the island (K).
    const KC = this.islandK;
    const cd = this.camDist / KC;
    this.clouds.forEach((c, i) => {
      c.a += c.speed * dt * (1 + wind * 0.02);
      c.mesh.visible = i < visibleClouds;
      const scale = 1 + over * 0.6 + (cd / 40) * (c.low ? 0 : 0.8);
      c.mesh.scale.setScalar(scale * KC);
      const r = c.low ? Math.max(c.r, islandR / KC + 3 + c.r * 0.3) : c.r + cd * 0.35;
      c.mesh.position.set(Math.cos(c.a) * r * KC, (c.y + (c.low ? 0 : over * 2)) * KC, Math.sin(c.a) * r * KC);
    });
    (this.stars.material as THREE.PointsMaterial).opacity = night * (1 - over * 0.9);
    this.stars.visible = night > 0.02;
    (this.sea.material as THREE.MeshStandardMaterial).color.set('#58b6e0').lerp(new THREE.Color('#5d7482'), over * 0.8).lerp(new THREE.Color('#122036'), night * 0.7);

    // Camera: keep the whole tree framed at a 45-degree look-down, rising as it grows.
    // v16: while the collapse replays the (taller) tree as it stood, frame that one.
    const H = Math.max(tree.height * tree.group.scale.y, this.fall?.mode === 'collapse' && !this.fallSwapped ? this.fall.split.build.height : 0);
    // v6 framing, in metres: every v6 constant is multiplied by the scene scale K.
    const KF = this.islandK;
    const W = Math.max(1.0 * KF, tree.canopyRadius * tree.group.scale.x);
    const R = Math.max(2.0 * KF, Math.sqrt((H * 0.55) ** 2 + W * W) * 1.14, islandR * [0.2, 0.28, 0.32, 0.36, 0.38][islandStage]!);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const portrait = this.camera.aspect < 0.8;
    const want = Math.max(R / Math.sin(vHalf) * (portrait ? 1.3 : 1.18), R / Math.sin(hHalf) * (portrait ? 1.12 : 1.05));
    const wantY = H * 0.47 + (portrait ? H * 0.02 : 0);
    const k = 1 - Math.exp(-dt * 1.6);
    if (this.camDist === 10 && this.lastTime < 0.2) this.camDist = want;
    this.camDist += (want - this.camDist) * (dt === 0 ? 1 : k);
    this.camTargetY += (wantY - this.camTargetY) * (dt === 0 ? 1 : k);
    // Zoom / pan ease toward the player's goal; the overview recentres itself.
    const ez = dt === 0 ? 1 : 1 - Math.exp(-dt * 9);
    if (!this.isZoomed() && !this.pinch) this.panGoal.multiplyScalar(1 - Math.min(1, dt * 3));
    this.zoom += (this.zoomGoal - this.zoom) * ez;
    this.panOff.lerp(this.panGoal, ez);
    if (!this.dragging && !this.isZoomed() && !this.followRef && performance.now() - this.lastDrag > 5000) {
      this.dragAz *= 1 - Math.min(1, dt * 0.6);
      this.dragEl *= 1 - Math.min(1, dt * 0.6);
    }
    const az = BASE_AZIMUTH + this.dragAz + Math.sin(t * 0.05) * 0.03 * motion;
    const fxGoal = this.fall && !this.fall.reduced ? 1 : 0;
    this.fxCam += (fxGoal - this.fxCam) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 1.8));
    const el = ELEVATION + this.dragEl - this.fxCam * 0.3;
    const target = new THREE.Vector3(0, this.camTargetY, 0).add(this.panOff);
    let dist = this.camDist * this.zoom * (1 + this.fxCam * 0.12);
    // Follow cam (tap an animal, or the developer panel): frame one animal up close, at its real size.
    let focus: ReturnType<Animals3D['focusRef']> = this.followRef ? this.animals.focusRef(this.followRef) : this.follow ? this.animals.focus(this.follow) : null;
    if (this.followRef && !focus) this.followRef = null;
    if (focus && !Number.isFinite(focus.pos.x)) focus = null;
    const chase = Boolean(focus?.flying);
    if (focus) {
      if (!this.followOn) this.followPos.copy(focus.pos);
      // Chase cam keeps up tightly with a flying bird; walkers get a softer glide.
      // The aim point moves with the animal every frame (so a fast bird never slips out of frame at low fps) and only
      // the remaining gap — e.g. after switching to another flock member — is eased out.
      const same = this.lastFocusRef === (this.followRef ?? this.follow);
      if (same && this.followOn) this.followPos.add(this.focusDelta.subVectors(focus.pos, this.lastFocusPos));
      this.lastFocusPos.copy(focus.pos);
      this.lastFocusRef = this.followRef ?? this.follow;
      this.followPos.lerp(focus.pos, dt === 0 ? 1 : 1 - Math.exp(-dt * (chase ? 5 : 7)));
      target.copy(this.followPos);
      target.y += focus.size * (chase ? 0.12 : 0.3);
      dist = Math.max(0.22, focus.size * (chase ? 5.5 : 4.2)) * this.followZoom;
    }
    this.followOn = Boolean(focus);
    // Follow-cam looks from lower down so animals are seen in profile (chase: just above and behind).
    this.lift += (this.liftGoal - this.lift) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 1.5));
    const camEl = focus ? clamp((chase ? 0.2 : Math.min(el, 0.38)) + this.followOrbitEl + this.lift, -0.25, 1.25) : el;
    let camAz = az;
    if (focus) {
      // Walkers: three-quarter front view (forward is (cos yaw, 0, -sin yaw)).
      // v10: a flying animal gets a chase cam, behind and a little to the side of it, turning with it.
      // Birds / insects that have settled are filmed from outside the crown, looking back at the tree.
      const out = focus.outward && Math.hypot(focus.pos.x, focus.pos.z) > 0.05;
      const want = chase
        ? Math.atan2(-Math.cos(focus.yaw), Math.sin(focus.yaw)) + 0.55
        : out
          ? Math.atan2(focus.pos.x, focus.pos.z) + 0.35
          : Math.atan2(Math.cos(focus.yaw), -Math.sin(focus.yaw)) + 0.9;
      const d = Math.atan2(Math.sin(want - this.followAz), Math.cos(want - this.followAz));
      this.followAz += d * (1 - Math.exp(-dt * (chase ? 2.2 : 1.2)));
      const orbiting = Boolean(this.dragging?.orbit && this.tap?.moved) || performance.now() - this.lastOrbit < 2500;
      // Keep trunk / canopy / rocks out of the way: try a few orbit angles, else move closer.
      this.followCheckT -= dt;
      if (this.followCheckT <= 0) {
        this.followCheckT = 0.35;
        const pick = this.clearView(target, this.followAz + this.followOrbit, camEl, dist, focus.size, orbiting);
        this.followBiasGoal = orbiting ? 0 : pick.bias;
        this.followCap = pick.cap;
        // Hidden (e.g. perched deep in the crown): after a moment switch to another member of the group, or,
        // if it is alone, rise above it to look down through the gap.
        const hidden = pick.cap < focus.size * 2.4;
        this.occludedT = hidden ? this.occludedT + 0.35 : Math.max(0, this.occludedT - 0.7);
        if (this.occludedT >= 1.4 && this.followRef) {
          const other = (focus.group ?? 1) > 1 ? this.animals.otherMember(this.followRef) : null;
          if (other) {
            this.followRef = other;
            this.occludedT = 0;
            this.followCheckT = 0;
          } else {
            this.liftGoal = Math.min(0.75, this.liftGoal + 0.25);
            this.occludedT = 1.0;
          }
        } else if (!hidden && this.occludedT === 0) this.liftGoal = Math.max(0, this.liftGoal - 0.05);
      }
      this.followBias += (this.followBiasGoal - this.followBias) * (1 - Math.exp(-dt * 3));
      camAz = this.followAz + this.followBias + this.followOrbit;
      if (dist > this.followCap) dist = this.followCap;
    } else {
      this.followAz = az;
      this.followBias = this.followBiasGoal = 0;
      this.followCap = Infinity;
    }
    this.camera.position.set(target.x + Math.sin(camAz) * Math.cos(camEl) * dist, target.y + Math.sin(camEl) * dist, target.z + Math.cos(camAz) * Math.cos(camEl) * dist);
    // Never put the camera under the ground when zoomed right in.
    if (this.isZoomed() || focus) {
      const gy = (this.habitat?.groundAt(this.camera.position.x, this.camera.position.z) ?? 0) + Math.min(0.12, dist * 0.2);
      if (this.camera.position.y < gy) this.camera.position.y = gy;
    }
    this.camera.lookAt(target);
    if (this.shake > 0.001 && !input.reducedMotion) {
      // v16 snap / impact shake: a small jitter of the camera position (the view direction stays).
      const a = this.shake * Math.max(0.02, H * 0.012);
      this.camera.position.x += (Math.sin(t * 61) + Math.sin(t * 37.3)) * 0.5 * a;
      this.camera.position.y += (Math.sin(t * 53.1 + 1) + Math.sin(t * 29.7)) * 0.5 * a;
      this.camera.position.z += Math.sin(t * 47.9 + 2) * 0.5 * a;
    }
    const shift = portrait ? 0.085 : 0.03;
    this.camera.setViewOffset(this.width, this.height, 0, -this.height * shift, this.width, this.height);
    this.camera.near = clamp(dist * 0.02, 0.005, 2);
    this.camera.far = Math.max(900, dist * 3 + 500);
    this.sky.position.copy(this.camera.position);
    this.sea.position.set(this.camera.position.x, -22 * this.islandK, this.camera.position.z);
    this.camera.updateProjectionMatrix();
    fog.near = Math.max(dist, this.camDist) * 1.15;
    fog.far = Math.max(dist, this.camDist) * 2.6 + 40 * this.islandK;

    // Sun from the upper left-front, shadow box sized to the subject.
    const sunDir = new THREE.Vector3(-0.55, 0.8 - goldenish * 0.3, 0.45).normalize();
    if (this.heatK > 0.001) {
      // 酷熱: light comes from the top-right of the screen, down onto the tree.
      const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
      const toCam = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
      const hotDir = right.multiplyScalar(0.62).add(new THREE.Vector3(0, 0.82, 0)).addScaledVector(toCam, -0.12).normalize();
      sunDir.lerp(hotDir, this.heatK * 0.85).normalize();
    }
    const box = clamp(Math.min(R * 1.3, dist * 1.2 + (focus ? 0 : R * 0.2)), 1.2, 400);
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

    this.updateCareFx(input, tree, t, dt, night, camAz);
    this.updateRain(rain, wind, dt, target);
    this.renderer.render(this.scene, this.camera);
    this.drawRays(input, t);
  }

  /**
   * v15.2 campfire spot (island units): beside the trunk, front-left in the default view (clear of the height rail on
   * phones), outside the mulch ring, clear of water, props and the 養分地標. Re-picked only when the trunk / fire size
   * or the habitat changes. The fire itself only shows at night.
   */
  private ensureCampfire(input: SceneInput, tree: TreeBuild, K: number, propK: number): CampfireSpot & { rU: number; key: string } {
    const kS = islandScaleFor(tree.metricScale);
    const trunkU = (tree.trunkRadius * tree.group.scale.x) / Math.max(1e-3, K);
    const dirtU = 1.1 * clamp(0.3 + tree.localHeight * 0.09, 0.3, 1.5);
    this.mulchR = mulchRadii(trunkU, dirtU);
    const rU = campfireRadiusUnits(animalFactor(tree.height), kS, tree.height / Math.max(1e-3, kS));
    const log = this.logWant && this.logProp && this.logProp.key !== 'pending' ? this.logProp : null;
    const key = `${this.habitatKey}|${trunkU.toFixed(2)}|${rU.toFixed(2)}|${this.mulchR.outer.toFixed(2)}|${input.landmark ? 1 : 0}|${log ? log.key : ''}`;
    if (!this.fireSpot || this.fireSpot.key !== key) {
      const hab = this.habitat;
      const props = [...this.island.obstacles().map((o) => ({ x: o.x, z: o.z, r: o.r * propK })), ...(hab && hab.stage > 0 ? resolveObstacles(hab.obstacles, propK) : [])];
      if (input.landmark) props.push({ x: 2.8, z: 2.2, r: 0.55 });
      if (log) for (let i = 0; i < 3; i++) {
        const d = log.lenU * (0.2 + i * 0.3);
        props.push({ x: log.x + Math.cos(log.a) * d, z: log.z + Math.sin(log.a) * d, r: Math.max(0.12, log.rU * 1.8) });
      }
      const spot = campfireSpot({
        trunkU: trunkU * 2.2,
        clearU: this.mulchR.outer * 1.06,
        fireU: rU,
        prefer: 2.2,
        blocked: (x, z, r) => this.wetOrBlocked(x, z, r + 0.05) || props.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + r + 0.04),
      });
      this.fireSpot = { ...spot, rU, key };
    }
    return this.fireSpot;
  }

  /** v15.2 保暖 mulch ring round the roots; plays the laying animation when it appears mid-session. */
  private updateMulch(input: SceneInput, dt: number): void {
    this.mulchClock += dt * this.fxSpeed;
    const t = this.mulchClock;
    const K = this.islandK;
    const want = Boolean(input.mulch);
    const { inner, outer } = this.mulchR;
    if (want && outer > 0) {
      const ratio = Math.round((inner / outer) * 50) / 50;
      const key = `${ratio}|${this.quality}`;
      if (!this.mulch || key !== this.mulchKey) {
        const wasOn = Boolean(this.mulch?.isVisible());
        if (this.mulch) {
          this.scene.remove(this.mulch.group);
          this.mulch.dispose();
        }
        this.mulch = new Mulch3D(ratio, this.quality);
        this.mulchKey = key;
        this.scene.add(this.mulch.group);
        if (wasOn) this.mulch.setVisible(true);
      }
    }
    if (this.mulch) {
      const first = this.mulchWas === null;
      if (want !== this.mulch.isVisible()) {
        this.mulch.setVisible(want);
        if (want && !first && !input.reducedMotion) this.mulch.lay(t);
      }
      this.mulch.group.position.set(0, 0.185 * K + 0.0015 * K, 0);
      this.mulch.group.scale.setScalar(outer * K);
      this.mulch.update(t);
    }
    this.mulchWas = want;
  }

  private updateCareFx(input: SceneInput, tree: TreeBuild, t: number, dt: number, night: number, camAz: number): void {
    const K = this.islandK;
    const s = tree.group.scale.x;
    void night;
    const f = this.fireSpot;
    if (f) {
      this.campfire.group.position.set(f.x * K, this.groundFast(f.x, f.z) * K + 0.004 * K, f.z * K);
      this.campfire.group.rotation.y = 0.6;
    }
    this.campfire.update(t, dt, ((f?.rU ?? 0.25) * K) / 0.4, campfireNightK(input.daylight), input.reducedMotion);
    this.updateMulch(input, dt);
    if (!this.careFx.count()) return;
    const dirtR = 1.1 * this.island.dirt.scale.x * K;
    const trunkR = tree.trunkRadius * s;
    const unit = clamp(Math.max(dirtR * 0.95, trunkR * 3.5, this.camDist * 0.07), 0.001, this.camDist * 0.1);
    this.careFx.update({
      t,
      base: new THREE.Vector3(0, 0.185 * K, 0),
      trunkR,
      dirtR,
      treeH: tree.height * s,
      crownY: tree.crownY * s,
      unit,
      camAz,
      reduced: input.reducedMotion,
    });
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
    const gm = build.height * 0.05;
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(build.canopyRadius * 1.1 + gm, build.canopyRadius * 1.0 + gm, build.height * 0.02, 20), new THREE.MeshStandardMaterial({ color: '#8cc26a', flatShading: true }));
    ground.position.y = -build.height * 0.01;
    scene.add(ground);
    const saved = { w: windUniforms.uWind.value, g: windUniforms.uGust.value, h: windUniforms.uHeight.value };
    windUniforms.uWind.value = 0;
    windUniforms.uGust.value = 0;
    windUniforms.uHeight.value = build.localHeight;
    const box = new THREE.Box3().setFromObject(build.group);
    const center = box.getCenter(new THREE.Vector3());
    const dims = box.getSize(new THREE.Vector3());
    const cam = new THREE.PerspectiveCamera(28, 1, Math.max(0.001, build.height * 0.01), Math.max(50, build.height * 20));
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
    this.neutralLook(() => this.renderer.render(scene, cam));
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
    this.neutralLook(() => this.renderer.render(scene, cam));
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

  /**
   * Check render: the given species side by side at exactly the size the scene draws them next to a `treeM` tree
   * (real length × the shared animalFactor), with a 1 m ruler. Returns a PNG data URL.
   */
  lineup(ids: string[], treeM: number, w = 1200, h = 420): string {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dfeef5');
    scene.add(new THREE.HemisphereLight('#ffffff', '#b0a080', 1.5));
    const d = new THREE.DirectionalLight('#fff1d6', 2.2);
    d.position.set(-1, 3, 4);
    scene.add(d);
    const f = animalFactor(treeM);
    let x = 0;
    let top = 0;
    const figs: THREE.Object3D[] = [];
    for (const id of ids) {
      const def = animalById(id);
      const fig = albumFigure(id);
      if (!def || !fig) continue;
      fig.scale.setScalar(realScale(def) * f);
      const kind = def.look.kind;
      fig.rotation.set(kind === 'butterfly' || kind === 'dragonfly' || kind === 'bee' ? 1.2 : 0, kind === 'butterfly' ? 0 : -0.25, 0);
      const box = new THREE.Box3().setFromObject(fig);
      const size = box.getSize(new THREE.Vector3());
      fig.position.set(x - box.min.x, -box.min.y, 0);
      x += size.x + Math.max(0.25, size.x * 0.15);
      top = Math.max(top, size.y);
      scene.add(fig);
      figs.push(fig);
    }
    const span = Math.max(1, x);
    const ground = new THREE.Mesh(new THREE.BoxGeometry(span + 1, 0.02, 1.5), new THREE.MeshStandardMaterial({ color: '#9cc27a' }));
    ground.position.set(span / 2 - 0.3, -0.011, 0);
    scene.add(ground);
    // Ruler: 1 m bar with 10 cm ticks, in front of the animals.
    const ruler = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: '#222' }));
    bar.position.set(0.5, 0, 0);
    ruler.add(bar);
    for (let i = 0; i <= 10; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.008, i % 5 === 0 ? 0.08 : 0.04, 0.02), new THREE.MeshBasicMaterial({ color: '#222' }));
      t.position.set(i / 10, 0.02, 0);
      ruler.add(t);
    }
    ruler.position.set(0, 0.01, 0.6);
    scene.add(ruler);
    const aspect = w / h;
    const viewW = Math.max(span + 0.6, (top + 0.4) * aspect);
    const viewH = viewW / aspect;
    const cam = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, -50, 50);
    cam.position.set(span / 2 - 0.1, viewH / 2 - 0.15, 10);
    cam.lookAt(span / 2 - 0.1, viewH / 2 - 0.15, 0);
    const rt = new THREE.WebGLRenderTarget(w, h, { colorSpace: THREE.SRGBColorSpace, samples: 4 });
    const prevTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(rt);
    this.renderer.setClearColor(0xdfeef5, 1);
    this.renderer.clear();
    this.neutralLook(() => this.renderer.render(scene, cam));
    const px = new Uint8Array(w * h * 4);
    this.renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.setClearColor(0x000000, 1);
    rt.dispose();
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#222';
    ctx.font = '22px sans-serif';
    const pxPerM = w / viewW;
    ctx.fillRect(12, 44, pxPerM, 5);
    for (let i = 0; i <= 10; i++) ctx.fillRect(12 + (pxPerM * i) / 10 - 1, i % 5 === 0 ? 36 : 40, 2, i % 5 === 0 ? 13 : 9);
    ctx.fillText(`黑尺 = 場景 1 米（全部動物同一放大系數 ×${f.toFixed(2)}，樹高 ${treeM} 米）`, 12, 26);
    return c.toDataURL('image/png');
  }
}
