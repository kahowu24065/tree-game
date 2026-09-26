/**
 * v11 walkable map for ground animals (island units, independent of the scene scale).
 *
 * A square grid over the island: each cell is dry land, water, or blocked (outside the fence, hills / cliffs, prop
 * footprints such as rocks, bushes, tree ferns, small trees, buildings, the trunk). Two clearance fields (distance to
 * the nearest cell a walker / a wader may not enter) let big animals keep their body clear of obstacles and edges.
 * Paths: Dijkstra flow fields toward a goal; walkers steer toward the furthest cell they can see along the field.
 * Obstacles also live in a spatial hash for exact, continuous collision.
 */

export const NAV_CELL = 0.25;

export const DRY = 0;
export const WATER = 1;
export const BLOCK = 2;

export interface NavObstacle {
  /** Island units. */
  x: number;
  z: number;
  /** Footprint radius in island units at prop scale 1 (scaled by propK unless `fixed`). */
  r: number;
  fixed?: boolean;
  kind?: string;
}

export interface NavBuild {
  R: number;
  /** Largest walkable radius (island units) at an angle (inside the fence). */
  limit: (angle: number) => number;
  /** Terrain at (x, z) island units. */
  terrain: (x: number, z: number) => number;
  obstacles: NavObstacle[];
  propK: number;
  /** Trunk footprint radius (island units). */
  trunkR: number;
  /** Terrain + fence flags from an earlier map of the same land (skips re-sampling the terrain). */
  base?: Uint8Array;
}

export class WalkNav {
  readonly cell = NAV_CELL;
  readonly n: number;
  readonly half: number;
  readonly R: number;
  readonly propK: number;
  /** DRY / WATER / BLOCK per cell. */
  readonly flags: Uint8Array;
  /** Distance (island units) to the nearest cell a walker may not enter (water, blocked, outside). */
  readonly clearDry: Float32Array;
  /** Same for waders (water allowed). */
  readonly clearWade: Float32Array;
  readonly obstacles: NavObstacle[];
  private bins = new Map<number, number[]>();
  private readonly binSize = 1;
  readonly trunkR: number;
  readonly limit: (angle: number) => number;
  /** Terrain + fence flags only (reusable while the land stays the same). */
  readonly base: Uint8Array;

  constructor(b: NavBuild) {
    this.R = b.R;
    this.propK = b.propK;
    this.trunkR = b.trunkR;
    this.limit = b.limit;
    this.half = b.R + 0.5;
    this.n = Math.ceil((this.half * 2) / this.cell);
    const N = this.n * this.n;
    this.obstacles = b.obstacles;
    if (b.base && b.base.length === N) this.base = b.base;
    else {
      this.base = new Uint8Array(N);
      for (let j = 0; j < this.n; j++) {
        for (let i = 0; i < this.n; i++) {
          const x = this.cx(i);
          const z = this.cx(j);
          this.base[j * this.n + i] = Math.hypot(x, z) > b.limit(Math.atan2(z, x)) ? BLOCK : b.terrain(x, z);
        }
      }
    }
    this.flags = this.base.slice();
    for (let j = 0; j < this.n; j++) for (let i = 0; i < this.n; i++) if (Math.hypot(this.cx(i), this.cx(j)) < b.trunkR) this.flags[j * this.n + i] = BLOCK;
    // Prop footprints (rasterised) + spatial hash for exact collision.
    b.obstacles.forEach((o, k) => {
      // Rasterised a little generously (half a cell) so routes never squeeze through gaps the exact discs close.
      const rr = this.obsR(o) + this.cell * 0.5;
      const i0 = Math.max(0, Math.floor((o.x - rr + this.half) / this.cell));
      const i1 = Math.min(this.n - 1, Math.floor((o.x + rr + this.half) / this.cell));
      const j0 = Math.max(0, Math.floor((o.z - rr + this.half) / this.cell));
      const j1 = Math.min(this.n - 1, Math.floor((o.z + rr + this.half) / this.cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (Math.hypot(this.cx(i) - o.x, this.cx(j) - o.z) < rr) this.flags[j * this.n + i] = BLOCK;
      const bi0 = Math.floor((o.x - rr) / this.binSize);
      const bi1 = Math.floor((o.x + rr) / this.binSize);
      const bj0 = Math.floor((o.z - rr) / this.binSize);
      const bj1 = Math.floor((o.z + rr) / this.binSize);
      for (let bj = bj0; bj <= bj1; bj++) {
        for (let bi = bi0; bi <= bi1; bi++) {
          const key = bi * 4096 + bj;
          let l = this.bins.get(key);
          if (!l) this.bins.set(key, (l = []));
          l.push(k);
        }
      }
    });
    this.clearDry = this.clearance((f) => f !== DRY);
    this.clearWade = this.clearance((f) => f === BLOCK);
  }

  /** Obstacle footprint radius in island units at the prop scale the map was built for. */
  obsR(o: NavObstacle, propK = this.propK): number {
    return o.fixed ? o.r : o.r * propK;
  }

  cx(i: number): number {
    return (i + 0.5) * this.cell - this.half;
  }

  cellOf(x: number, z: number): number {
    const i = Math.floor((x + this.half) / this.cell);
    const j = Math.floor((z + this.half) / this.cell);
    if (i < 0 || j < 0 || i >= this.n || j >= this.n) return -1;
    return j * this.n + i;
  }

  centre(c: number): { x: number; z: number } {
    return { x: this.cx(c % this.n), z: this.cx(Math.floor(c / this.n)) };
  }

  /** Two-pass chamfer distance transform (island units) to the nearest `bad` cell (outside the grid counts as bad). */
  private clearance(bad: (f: number) => boolean): Float32Array {
    const n = this.n;
    const d = new Float32Array(n * n);
    const BIG = 1e6;
    const a = this.cell;
    const dg = a * Math.SQRT2;
    for (let k = 0; k < n * n; k++) d[k] = bad(this.flags[k]!) ? 0 : BIG;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        v = Math.min(v, i > 0 ? d[k - 1]! + a : a, j > 0 ? d[k - n]! + a : a, i > 0 && j > 0 ? d[k - n - 1]! + dg : dg, i < n - 1 && j > 0 ? d[k - n + 1]! + dg : dg);
        d[k] = v;
      }
    }
    for (let j = n - 1; j >= 0; j--) {
      for (let i = n - 1; i >= 0; i--) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        v = Math.min(v, i < n - 1 ? d[k + 1]! + a : a, j < n - 1 ? d[k + n]! + a : a, i < n - 1 && j < n - 1 ? d[k + n + 1]! + dg : dg, i > 0 && j < n - 1 ? d[k + n - 1]! + dg : dg);
        d[k] = v;
      }
    }
    return d;
  }

  /** Can a body of radius `rad` (island units) stand in cell c? */
  ok(c: number, rad: number, wade: boolean): boolean {
    if (c < 0) return false;
    const cl = wade ? this.clearWade[c]! : this.clearDry[c]!;
    return cl >= Math.max(this.cell * 0.5, rad);
  }

  /** Allowed-cell radius used for planning: the body, but never so fussy that narrow gaps close for small animals. */
  planRad(bodyR: number): number {
    return Math.min(Math.max(bodyR * 0.9, this.cell * 0.5), 1.2);
  }

  /** Nearest cell a body may stand in (spiral search), or -1. */
  nearestOk(c: number, rad: number, wade: boolean, maxRing = 40): number {
    if (this.ok(c, rad, wade)) return c;
    if (c < 0) return -1;
    const n = this.n;
    const i0 = c % n;
    const j0 = Math.floor(c / n);
    for (let ring = 1; ring <= maxRing; ring++) {
      let best = -1;
      let bestD = Infinity;
      for (let dj = -ring; dj <= ring; dj++) {
        for (let di = -ring; di <= ring; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
          const i = i0 + di;
          const j = j0 + dj;
          if (i < 0 || j < 0 || i >= n || j >= n) continue;
          const k = j * n + i;
          if (!this.ok(k, rad, wade)) continue;
          const d = di * di + dj * dj;
          if (d < bestD) {
            bestD = d;
            best = k;
          }
        }
      }
      if (best >= 0) return best;
    }
    return -1;
  }

  /** Dijkstra distances (island units) from `from` over cells a body of radius `rad` may enter. */
  field(from: number, rad: number, wade: boolean): Float64Array {
    const n = this.n;
    const dist = new Float64Array(n * n).fill(Infinity);
    if (!this.ok(from, rad, wade)) return dist;
    const heap = new MinHeap();
    dist[from] = 0;
    heap.push(from, 0);
    const a = this.cell;
    const dg = a * Math.SQRT2;
    while (heap.size) {
      const [k, dk] = heap.pop();
      if (dk > dist[k]!) continue;
      const i = k % n;
      const j = (k - i) / n;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          const kk = jj * n + ii;
          if (!this.ok(kk, rad, wade)) continue;
          // No corner cutting past a blocked cell.
          if (di && dj && (!this.ok(j * n + ii, rad, wade) || !this.ok(jj * n + i, rad, wade))) continue;
          const nd = dk + (di && dj ? dg : a);
          if (nd < dist[kk]!) {
            dist[kk] = nd;
            heap.push(kk, nd);
          }
        }
      }
    }
    return dist;
  }

  /** Straight line a→b (island units) stays on cells a body of radius `rad` may enter. */
  los(ax: number, az: number, bx: number, bz: number, rad: number, wade: boolean): boolean {
    const d = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.ceil(d / (this.cell * 0.25)));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      if (!this.ok(this.cellOf(ax + (bx - ax) * t, az + (bz - az) * t), rad, wade)) return false;
    }
    return true;
  }

  /**
   * Next point to steer for, following the flow field `dist` downhill from (x, z): the furthest cell along the descent
   * (up to `look` cells) that is still in straight view — smooth, corner-hugging paths instead of grid zig-zags.
   */
  waypoint(dist: Float64Array, x: number, z: number, rad: number, wade: boolean, look = 14): { x: number; z: number; d: number } | null {
    const n = this.n;
    let c = this.cellOf(x, z);
    if (c < 0 || !Number.isFinite(dist[c]!)) {
      // Off the field (e.g. squeezed against an edge): head for the nearest cell that is on it.
      const k = this.nearestOnField(dist, c < 0 ? this.cellOf(0, 0) : c);
      if (k < 0) return null;
      const p = this.centre(k);
      return { x: p.x, z: p.z, d: dist[k]! };
    }
    let best = this.centre(c);
    let bestD = dist[c]!;
    for (let s = 0; s < look; s++) {
      const i = c % n;
      const j = (c - i) / n;
      let next = -1;
      let nd = dist[c]!;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if ((!di && !dj) || ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          const kk = jj * n + ii;
          if (dist[kk]! < nd) {
            nd = dist[kk]!;
            next = kk;
          }
        }
      }
      if (next < 0) break;
      c = next;
      const p = this.centre(c);
      // Always at least the next cell downhill (never the cell it stands in — that makes walkers circle a point).
      if (s > 0 && !this.los(x, z, p.x, p.z, rad, wade)) break;
      best = p;
      bestD = nd;
    }
    return { x: best.x, z: best.z, d: bestD };
  }

  private nearestOnField(dist: Float64Array, c: number): number {
    const n = this.n;
    const i0 = c % n;
    const j0 = Math.floor(c / n);
    for (let ring = 1; ring < 30; ring++) {
      for (let dj = -ring; dj <= ring; dj++) {
        for (let di = -ring; di <= ring; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
          const i = i0 + di;
          const j = j0 + dj;
          if (i < 0 || j < 0 || i >= n || j >= n) continue;
          if (Number.isFinite(dist[j * n + i]!)) return j * n + i;
        }
      }
    }
    return -1;
  }

  /** Random reachable cell (uniform over the reachable area), optionally filtered. */
  sample(dist: Float64Array, rand: () => number, accept?: (c: number) => boolean): number {
    const n = this.n;
    for (let tries = 0; tries < 400; tries++) {
      const c = Math.floor(rand() * n * n);
      if (Number.isFinite(dist[c]!) && (!accept || accept(c))) return c;
    }
    return -1;
  }

  /** Obstacles near (x, z) within `rad` (island units), as indices. */
  near(x: number, z: number, rad: number, out: number[]): number[] {
    out.length = 0;
    const bi0 = Math.floor((x - rad) / this.binSize);
    const bi1 = Math.floor((x + rad) / this.binSize);
    const bj0 = Math.floor((z - rad) / this.binSize);
    const bj1 = Math.floor((z + rad) / this.binSize);
    for (let bj = bj0; bj <= bj1; bj++) {
      for (let bi = bi0; bi <= bi1; bi++) {
        const l = this.bins.get(bi * 4096 + bj);
        if (l) for (const k of l) if (!out.includes(k)) out.push(k);
      }
    }
    return out;
  }

  /** Cells a dry walker could stand on (for coverage checks). */
  walkableCells(rad = 0): number {
    let n = 0;
    for (let k = 0; k < this.flags.length; k++) if (this.ok(k, rad, false)) n++;
    return n;
  }
}

class MinHeap {
  private k: number[] = [];
  private v: number[] = [];
  get size(): number {
    return this.k.length;
  }
  push(key: number, val: number): void {
    const k = this.k;
    const v = this.v;
    k.push(key);
    v.push(val);
    let i = k.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (v[p]! <= val) break;
      k[i] = k[p]!;
      v[i] = v[p]!;
      i = p;
    }
    k[i] = key;
    v[i] = val;
  }
  pop(): [number, number] {
    const k = this.k;
    const v = this.v;
    const top: [number, number] = [k[0]!, v[0]!];
    const lk = k.pop()!;
    const lv = v.pop()!;
    if (k.length) {
      let i = 0;
      const n = k.length;
      for (;;) {
        const l = i * 2 + 1;
        if (l >= n) break;
        const r = l + 1;
        const c = r < n && v[r]! < v[l]! ? r : l;
        if (v[c]! >= lv) break;
        k[i] = k[c]!;
        v[i] = v[c]!;
        i = c;
      }
      k[i] = lk;
      v[i] = lv;
    }
    return top;
  }
}
