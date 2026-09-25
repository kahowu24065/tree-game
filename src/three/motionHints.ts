import * as THREE from 'three';

/**
 * v9 motion hints, so tiny animals read from far away without drawing them bigger:
 * - small flying birds leave a faint, fading line trail (one LineSegments for every bird);
 * - insects and butterflies get a soft twinkle (one Points cloud with a fixed on-screen size).
 * Both are single draw calls rebuilt every frame from a handful of positions.
 */

const TRAIL_PTS = 14;
const MAX_TRAILS = 96;
const MAX_SPARKS = 160;

export interface TrailState {
  pts: Float32Array;
  n: number;
  head: number;
  t: number;
}

export function newTrail(): TrailState {
  return { pts: new Float32Array(TRAIL_PTS * 3), n: 0, head: 0, t: 0 };
}

/** Push a sample every `every` seconds; clear when not flying. */
export function stepTrail(tr: TrailState, p: THREE.Vector3, dt: number, flying: boolean, every: number): void {
  if (!flying) {
    // Let the trail shrink from the tail instead of vanishing at once.
    tr.t += dt;
    if (tr.n > 0 && tr.t > every) {
      tr.n--;
      tr.t = 0;
    }
    return;
  }
  tr.t += dt;
  if (tr.n === 0 || tr.t >= every) {
    tr.t = 0;
    tr.head = (tr.head + 1) % TRAIL_PTS;
    tr.pts[tr.head * 3] = p.x;
    tr.pts[tr.head * 3 + 1] = p.y;
    tr.pts[tr.head * 3 + 2] = p.z;
    tr.n = Math.min(TRAIL_PTS, tr.n + 1);
  }
}

function glowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,248,210,0.85)');
  grad.addColorStop(1, 'rgba(255,240,180,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  // A thin four-point star so it reads as a sparkle rather than a dot.
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(15, 2, 2, 28);
  g.fillRect(2, 15, 28, 2);
  return new THREE.CanvasTexture(c);
}

export class MotionHints {
  readonly group = new THREE.Group();
  private lines: THREE.LineSegments;
  private linePos = new Float32Array(MAX_TRAILS * (TRAIL_PTS - 1) * 2 * 3);
  private lineCol = new Float32Array(MAX_TRAILS * (TRAIL_PTS - 1) * 2 * 4);
  private sparks: THREE.Points;
  private sparkPos = new Float32Array(MAX_SPARKS * 3);
  private sparkA = new Float32Array(MAX_SPARKS);
  private sparkS = new Float32Array(MAX_SPARKS);
  private trailQ: { tr: TrailState; alpha: number }[] = [];
  private sparkQ: { p: THREE.Vector3; alpha: number; size: number }[] = [];
  /** Counters for checks: how many trails / sparkles were drawn last frame. */
  stats = { trails: 0, sparkles: 0 };

  constructor() {
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(this.linePos, 3).setUsage(THREE.DynamicDrawUsage));
    lg.setAttribute('color', new THREE.BufferAttribute(this.lineCol, 4).setUsage(THREE.DynamicDrawUsage));
    lg.setDrawRange(0, 0);
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, fog: false }));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 3;

    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(this.sparkPos, 3).setUsage(THREE.DynamicDrawUsage));
    sg.setAttribute('aAlpha', new THREE.BufferAttribute(this.sparkA, 1).setUsage(THREE.DynamicDrawUsage));
    sg.setAttribute('aSize', new THREE.BufferAttribute(this.sparkS, 1).setUsage(THREE.DynamicDrawUsage));
    sg.setDrawRange(0, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: glowTexture() }, color: { value: new THREE.Color('#fff6c8') } },
      vertexShader: `attribute float aAlpha; attribute float aSize; varying float vA;
        void main() { vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
        void main() { vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color * t.rgb, t.a * vA); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sparks = new THREE.Points(sg, mat);
    this.sparks.frustumCulled = false;
    this.sparks.renderOrder = 3;
    this.group.add(this.lines, this.sparks);
  }

  begin(): void {
    this.trailQ.length = 0;
    this.sparkQ.length = 0;
  }

  trail(tr: TrailState, alpha: number): void {
    if (tr.n >= 2 && alpha > 0.01 && this.trailQ.length < MAX_TRAILS) this.trailQ.push({ tr, alpha });
  }

  sparkle(p: THREE.Vector3, alpha: number, sizePx: number): void {
    if (alpha > 0.01 && this.sparkQ.length < MAX_SPARKS) this.sparkQ.push({ p, alpha, size: sizePx });
  }

  end(): void {
    let v = 0;
    for (const { tr, alpha } of this.trailQ) {
      // Newest sample first; alpha fades to 0 at the tail.
      for (let k = 0; k < tr.n - 1; k++) {
        const a = (tr.head - k + TRAIL_PTS) % TRAIL_PTS;
        const b = (tr.head - k - 1 + TRAIL_PTS) % TRAIL_PTS;
        const fa = alpha * (1 - k / (tr.n - 1));
        const fb = alpha * (1 - (k + 1) / (tr.n - 1));
        for (const [idx, f] of [
          [a, fa],
          [b, fb],
        ] as const) {
          this.linePos[v * 3] = tr.pts[idx * 3]!;
          this.linePos[v * 3 + 1] = tr.pts[idx * 3 + 1]!;
          this.linePos[v * 3 + 2] = tr.pts[idx * 3 + 2]!;
          this.lineCol[v * 4] = 1;
          this.lineCol[v * 4 + 1] = 1;
          this.lineCol[v * 4 + 2] = 1;
          this.lineCol[v * 4 + 3] = f;
          v++;
        }
      }
    }
    const lg = this.lines.geometry;
    lg.setDrawRange(0, v);
    (lg.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (lg.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;
    this.lines.visible = v > 0;

    let s = 0;
    for (const q of this.sparkQ) {
      this.sparkPos[s * 3] = q.p.x;
      this.sparkPos[s * 3 + 1] = q.p.y;
      this.sparkPos[s * 3 + 2] = q.p.z;
      this.sparkA[s] = q.alpha;
      this.sparkS[s] = q.size;
      s++;
    }
    const sg = this.sparks.geometry;
    sg.setDrawRange(0, s);
    for (const n of ['position', 'aAlpha', 'aSize']) (sg.getAttribute(n) as THREE.BufferAttribute).needsUpdate = true;
    this.sparks.visible = s > 0;
    this.stats = { trails: this.trailQ.length, sparkles: s };
  }
}
