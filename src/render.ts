import { stageFor, stageProgress } from './content';
import type { SpeciesId } from './data/species';
import { drawAnimal } from './draw-animals';
import type { DayCond, Reinforcement, TimeMode } from './types';
import { clamp, hashString, mulberry32 } from './util';
import { isSnowCode } from './weather';

export interface SceneInput {
  treeName: string;
  species: SpeciesId;
  /** Growth stage 0–4 relative to the season target. */
  stage: number;
  /** Island stage override (developer preview); defaults to the tree's stage. */
  islandStage?: number;
  targetCm: number;
  heightCm: number;
  health: number;
  moisture: number;
  pests: number;
  scars: number;
  animals: string[];
  /** Every animal seen so far (the 3D scene rotates a random subset). */
  unlocked: string[];
  residents: string[];
  /** 0 calm … 1 typhoon: drives tree sway. */
  sway: number;
  cond: DayCond;
  daylight: number;
  minute: number;
  sunriseMin: number;
  sunsetMin: number;
  eventId: string;
  reducedMotion: boolean;
  reinforce?: Reinforcement;
  /** H ≥ 80: 爆發生長 green glow. */
  thriving?: boolean;
  /** A previous tree's 養分地標 stands on the island. */
  landmark?: boolean;
  /** Tier-3 「星空浮島」 look. */
  starry?: boolean;
  /** v15.2: 保暖 done today → mulch layer round the roots (the campfire now shows every night on its own). */
  mulch?: boolean;
  /** v16: broken top after a collapse, 1 just snapped … 0 regrown (visual only). */
  brokenTop?: number;
  /** v16: day 1–3 after a collapse the snapped-off top lies beside the tree (0 = not shown). */
  fallenLog?: number;
  /** v16: identifies the latest collapse (the fallen log keeps its spot). */
  collapseKey?: string;
  /** v16 瀕死 (H 0, the 24-hour window running). */
  dying?: boolean;
  /** v16: the tree is dead — it lies as a fallen log. */
  dead?: boolean;
  /** v16: dead, but the death animation has not played yet (keep the standing tree until it does). */
  deathPending?: boolean;
}

interface Pt {
  x: number;
  y: number;
  r: number;
}
interface Limb {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  snap?: boolean;
}
interface Leaf {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  tint: number;
  z: number;
}
interface TreeModel {
  key: string;
  groundY: number;
  trunk: Pt[];
  limbs: Limb[];
  leaves: Leaf[];
  roots: Limb[];
  perches: { x: number; y: number; kind: 'leaf' | 'trunk' }[];
  pests: { x: number; y: number }[];
  flowers: { x: number; y: number; color: string }[];
  grass: { x: number; y: number; h: number; lean: number }[];
  crown: { x: number; y: number; rx: number; ry: number } | null;
}

type RGB = [number, number, number];

export function daylightFactor(minute: number, sunrise: number, sunset: number, mode: TimeMode): number {
  if (mode === 'day') return 1;
  if (mode === 'night') return 0;
  const dusk = 45;
  if (minute < sunrise - dusk || minute > sunset + dusk) return 0;
  if (minute < sunrise) return clamp((minute - (sunrise - dusk)) / dusk, 0, 1);
  if (minute > sunset) return clamp(1 - (minute - sunset) / dusk, 0, 1);
  return 1;
}

function rgb(c: RGB, a = 1): string {
  const body = `${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}`;
  return a >= 1 ? `rgb(${body})` : `rgba(${body}, ${a})`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  const u = clamp(t, 0, 1);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

function leafColor(health: number, tint: number, z: number): string {
  const sick: RGB[] = [
    [128, 104, 64],
    [154, 124, 78],
    [104, 86, 52],
  ];
  const tired: RGB[] = [
    [132, 132, 70],
    [158, 150, 78],
    [108, 116, 62],
  ];
  const ok: RGB[] = [
    [86, 128, 62],
    [118, 150, 70],
    [70, 110, 50],
  ];
  const lush: RGB[] = [
    [52, 114, 58],
    [86, 146, 68],
    [40, 92, 48],
    [136, 176, 82],
  ];
  const palette = health < 30 ? sick : health < 50 ? tired : health < 75 ? ok : lush;
  const base = palette[Math.floor(tint * palette.length) % palette.length] ?? lush[0];
  const shaded = mix(base, [28, 48, 32], z < 0.45 ? 0.25 : 0);
  return rgb(shaded);
}

export class Scene {
  private canvas: HTMLCanvasElement;
  private dpr = 1;
  private w = 320;
  private h = 480;
  private model: TreeModel | null = null;
  private drops: { x: number; y: number; v: number; len: number; drift: number }[] = [];
  private flakes: { x: number; y: number; v: number; r: number }[] = [];
  private motes: { x: number; y: number; v: number; r: number; phase: number }[] = [];
  /** v16 simple 2D collapse / death animations (start times, ms on the rAF clock). */
  private fallStart = -1;
  private collapseStart = -1;
  private fxReduced = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /** v16: the dead tree tips over (1.5 s; reduced motion: at once). */
  playFall(reduced: boolean): void {
    this.fallStart = performance.now();
    this.fxReduced = reduced;
  }

  /** v16: the snapped top drops beside the tree (1.4 s; reduced motion: skipped). */
  playCollapse(reduced: boolean): void {
    this.collapseStart = reduced ? -1 : performance.now();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(2, rect.width);
    this.h = Math.max(2, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.model = null;
  }

  draw(input: SceneInput, time: number): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const model = this.ensureModel(input);
    const storming = input.cond.stormKind === 'typhoon' || input.cond.code >= 95;
    const heavy =
      storming ||
      input.cond.stormKind === 'heavy-rain' ||
      input.cond.precipMm >= 25 ||
      input.cond.code === 65 ||
      input.cond.code === 82;
    const amp = (input.reducedMotion ? 0.2 : 1) * (2.2 + input.cond.windKmh * 0.16 + (storming ? 14 : 0) + (input.cond.gustKmh > 70 ? 6 : 0));
    const sway = (y: number) => {
      const lift = clamp((model.groundY - y) / model.groundY, 0, 1);
      return Math.sin(time * 0.00135 + y * 0.02) * Math.min(amp, 42) * (0.12 + lift);
    };

    this.sky(ctx, input, time, heavy, storming);
    this.hills(ctx, input, time);
    this.ground(ctx, model, input);
    if (input.fallenLog && !input.dead) this.fallenLog(ctx, model);
    if (input.dead && !input.deathPending) this.deadTree(ctx, model, input, time);
    else this.tree(ctx, model, input, sway);
    this.collapseFx(ctx, model, time);
    if (input.dying && !input.dead) this.dyingFx(ctx, model, input, time);
    if (!input.dead) this.animals(ctx, model, input, time, sway);
    this.weatherFx(ctx, input, time, heavy, storming);
    this.vignette(ctx, input.daylight);
  }

  private ensureModel(input: SceneInput): TreeModel {
    const stage = stageFor(input.heightCm, input.targetCm);
    const key = `${this.w}x${this.h}|${input.treeName}|${stage.id}|${Math.round(input.heightCm)}|${input.health > 55 ? 1 : 0}|${input.scars}|${input.pests > 35 ? 1 : 0}`;
    if (this.model?.key === key) return this.model;
    this.model = buildTree(this.w, this.h, input, key);
    return this.model;
  }

  private sky(ctx: CanvasRenderingContext2D, input: SceneInput, time: number, heavy: boolean, storming: boolean): void {
    const day = input.daylight;
    let top: RGB = [110, 184, 222];
    let mid: RGB = [166, 212, 232];
    let hor: RGB = [246, 226, 196];
    if (input.cond.hot && !heavy) {
      top = [232, 150, 96];
      mid = [244, 196, 140];
      hor = [255, 228, 190];
    } else if (storming) {
      top = [42, 54, 70];
      mid = [70, 82, 96];
      hor = [96, 102, 108];
    } else if (heavy || input.cond.raining) {
      top = [104, 128, 144];
      mid = [150, 166, 170];
      hor = [198, 204, 196];
    } else if (input.cond.code >= 3) {
      top = [126, 156, 176];
      mid = [176, 196, 206];
      hor = [230, 224, 210];
    }
    const nightTop: RGB = [12, 20, 46];
    const nightMid: RGB = [28, 44, 78];
    const nightHor: RGB = [96, 78, 84];
    top = mix(nightTop, top, day);
    mid = mix(nightMid, mid, day);
    hor = mix(nightHor, hor, day);
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, rgb(top));
    g.addColorStop(0.55, rgb(mid));
    g.addColorStop(1, rgb(hor));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    if (day < 0.85) {
      const rng = mulberry32(42);
      for (let i = 0; i < 40; i++) {
        const a = (1 - day) * (0.35 + rng() * 0.65);
        ctx.fillStyle = `rgba(244, 240, 220, ${a})`;
        ctx.beginPath();
        ctx.arc(rng() * this.w, rng() * this.h * 0.55, rng() * 1.3 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const span = Math.max(1, input.sunsetMin - input.sunriseMin);
    const p = clamp((input.minute - input.sunriseMin) / span, 0, 1);
    if (day > 0.15 && !storming && !heavy) {
      const sx = this.w * (0.14 + 0.72 * p);
      const sy = this.h * (0.58 - Math.sin(Math.PI * p) * 0.46);
      const glow = ctx.createRadialGradient(sx, sy, 8, sx, sy, 70);
      glow.addColorStop(0, `rgba(255, 236, 186, ${0.55 * day})`);
      glow.addColorStop(1, 'rgba(255, 236, 186, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 246, 220, ${0.95 * day})`;
      ctx.beginPath();
      ctx.arc(sx, sy, input.cond.hot ? 22 : 16, 0, Math.PI * 2);
      ctx.fill();
    }
    if (day < 0.6) {
      const mx = this.w * 0.78;
      const my = this.h * 0.18;
      ctx.fillStyle = `rgba(244, 236, 214, ${1 - day})`;
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgb(mix(nightTop, top, 0.2), 1 - day * 0.3);
      ctx.beginPath();
      ctx.arc(mx + 7, my - 3, 13, 0, Math.PI * 2);
      ctx.fill();
    }

    const cloudN = storming ? 7 : input.cond.code >= 2 || input.cond.raining ? 5 : 3;
    const drift = input.reducedMotion ? 0 : time * (0.006 + input.cond.windKmh * 0.0004);
    for (let i = 0; i < cloudN; i++) {
      const base = ((i * 0.19 + 0.05) * this.w + drift) % (this.w + 180) - 90;
      const cy = this.h * (0.12 + (i % 3) * 0.07);
      const alpha = storming ? 0.55 : input.cond.raining ? 0.4 : 0.28 * (0.4 + day);
      ctx.fillStyle = storming ? `rgba(46, 56, 68, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      blob(ctx, base, cy, 46 + (i % 3) * 12, 16 + (i % 2) * 4);
    }

    if (input.eventId === 'mist') {
      ctx.fillStyle = `rgba(255,255,255,${0.18 + day * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(this.w * 0.5, this.h * 0.72, this.w * 0.55, 36, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private hills(ctx: CanvasRenderingContext2D, input: SceneInput, time: number): void {
    const day = input.daylight;
    const back = mix([46, 68, 84], [120, 156, 168], day);
    const front = mix([36, 58, 62], [92, 132, 112], day);
    const shift = input.reducedMotion ? 0 : Math.sin(time * 0.0002) * 6;
    ctx.fillStyle = rgb(back);
    hill(ctx, this.w, this.h * 0.78, 0.22, shift);
    ctx.fillStyle = rgb(front);
    hill(ctx, this.w, this.h * 0.84, 0.16, -shift);
  }

  private ground(ctx: CanvasRenderingContext2D, model: TreeModel, input: SceneInput): void {
    const wet = input.moisture > 100 || input.cond.raining;
    const dry = input.moisture < 40 && !input.cond.raining;
    const grass = dry ? [150, 132, 78] : wet ? [62, 110, 68] : [96, 140, 78];
    const soil = wet ? [74, 58, 42] : dry ? [138, 112, 74] : [104, 74, 48];
    ctx.fillStyle = rgb(grass as RGB);
    ctx.beginPath();
    ctx.ellipse(this.w * 0.5, model.groundY + 18, this.w * 0.72, this.h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const blade of model.grass) {
      ctx.strokeStyle = rgb(mix(grass as RGB, [40, 80, 44], blade.h / 40));
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(blade.x, blade.y);
      ctx.quadraticCurveTo(blade.x + blade.lean, blade.y - blade.h * 0.6, blade.x + blade.lean * 1.4, blade.y - blade.h);
      ctx.stroke();
    }
    ctx.fillStyle = rgb(soil as RGB);
    ctx.beginPath();
    ctx.ellipse(this.w * 0.5, model.groundY + 6, 54 + stageFor(input.heightCm, input.targetCm).trunk, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (wet) {
      ctx.fillStyle = 'rgba(180, 200, 190, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.w * 0.38, model.groundY + 16, 22, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(this.w * 0.66, model.groundY + 20, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const flower of model.flowers) {
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      ctx.arc(flower.x, flower.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private tree(ctx: CanvasRenderingContext2D, model: TreeModel, input: SceneInput, sway: (y: number) => number): void {
    if (model.crown && stageFor(input.heightCm, input.targetCm).depth >= 3) {
      ctx.fillStyle = leafColor(input.health, 0.2, 0);
      ctx.beginPath();
      ctx.ellipse(model.crown.x + sway(model.crown.y), model.crown.y, model.crown.rx, model.crown.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = leafColor(input.health, 0.7, 0.8);
      ctx.beginPath();
      ctx.ellipse(model.crown.x + sway(model.crown.y) * 1.1 - model.crown.rx * 0.15, model.crown.y - model.crown.ry * 0.1, model.crown.rx * 0.72, model.crown.ry * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const root of model.roots) drawLimb(ctx, root, sway, true);
    drawTrunk(ctx, model.trunk, sway);

    for (const limb of model.limbs) drawLimb(ctx, limb, sway, false);
    const leaves = [...model.leaves].sort((a, b) => a.z - b.z);
    // v16: a broken top loses the crown above the break; 瀕死 is nearly bare.
    const top = Math.min(...model.leaves.map((l) => l.y - l.ry), model.trunk.at(-1)?.y ?? model.groundY);
    const cutY = top + (model.groundY - top) * 0.17 * (input.brokenTop ?? 0);
    let i = 0;
    for (const leaf of leaves) {
      i++;
      if ((input.brokenTop ?? 0) > 0.02 && leaf.y < cutY) continue;
      if (input.dying && i % 5 < 3) continue;
      const x = leaf.x + sway(leaf.y) * 1.12;
      ctx.fillStyle = leafColor(input.health, leaf.tint, leaf.z);
      ctx.beginPath();
      ctx.ellipse(x, leaf.y, leaf.rx, leaf.ry, leaf.rot, 0, Math.PI * 2);
      ctx.fill();
    }
    if ((input.brokenTop ?? 0) > 0.02) {
      // Pale splintered wood where the top snapped, and a fresh green shoot.
      const tp = model.trunk.reduce((a, b) => (Math.abs(b.y - cutY) < Math.abs(a.y - cutY) ? b : a), model.trunk[0]!);
      const x = tp.x + sway(cutY);
      const r = Math.max(3, tp.r);
      ctx.fillStyle = '#ecdcb4';
      ctx.beginPath();
      ctx.moveTo(x - r, cutY + 3);
      for (let k = 0; k <= 6; k++) ctx.lineTo(x - r + (2 * r * k) / 6, cutY - (k % 2 ? r * 1.2 : r * 0.2));
      ctx.lineTo(x + r, cutY + 3);
      ctx.fill();
      ctx.strokeStyle = '#7fb24a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + r * 0.3, cutY - r * 0.4);
      ctx.quadraticCurveTo(x + r * 0.9, cutY - r * 2, x + r * 0.5, cutY - r * 3.2);
      ctx.stroke();
      ctx.fillStyle = '#8fd06a';
      ctx.beginPath();
      ctx.ellipse(x + r * 0.5, cutY - r * 3.3, 3, 2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const pest of model.pests) {
      ctx.fillStyle = '#3a3228';
      ctx.beginPath();
      ctx.arc(pest.x + sway(pest.y), pest.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** v16: the dead tree lies on the ground (tipping over once when it has just died). */
  private deadTree(ctx: CanvasRenderingContext2D, model: TreeModel, input: SceneInput, time: number): void {
    const p = this.fallStart < 0 || this.fxReduced ? 1 : clamp((time - this.fallStart) / 1500, 0, 1);
    const baseX = model.trunk[0]?.x ?? this.w / 2;
    const baseY = model.groundY;
    const still = () => 0;
    ctx.save();
    ctx.translate(baseX, baseY - 4);
    ctx.rotate(p * p * (Math.PI / 2 - 0.1));
    ctx.translate(-baseX, -(baseY - 4));
    ctx.globalAlpha = 0.92;
    for (const limb of model.limbs) drawLimb(ctx, limb, still, false);
    drawTrunk(ctx, model.trunk, still);
    if (p < 0.6) {
      ctx.globalAlpha = 1 - p / 0.6;
      for (const leaf of model.leaves) {
        ctx.fillStyle = leafColor(0, leaf.tint, leaf.z);
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y + p * 60, leaf.rx, leaf.ry, leaf.rot, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Stump.
    const r = Math.max(4, model.trunk[0]?.r ?? 6);
    ctx.fillStyle = '#5c3b2a';
    ctx.fillRect(baseX - r, baseY - 8, r * 2, 8);
    ctx.fillStyle = '#ecdcb4';
    ctx.beginPath();
    ctx.ellipse(baseX, baseY - 8, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    void input;
  }

  /** v16: the snapped-off top lying beside the tree for a few days. */
  private fallenLog(ctx: CanvasRenderingContext2D, model: TreeModel): void {
    const x = this.w * 0.5 + 58;
    const y = model.groundY + 10;
    ctx.fillStyle = '#6e5442';
    ctx.beginPath();
    ctx.roundRect?.(x, y - 6, 64, 10, 5);
    if (!ctx.roundRect) ctx.rect(x, y - 6, 64, 10);
    ctx.fill();
    ctx.fillStyle = '#ecdcb4';
    ctx.beginPath();
    ctx.ellipse(x + 2, y - 1, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a7440';
    ctx.beginPath();
    ctx.ellipse(x + 50, y - 9, 9, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /** v16: 2D collapse — the snapped top tumbles down beside the tree and fades. */
  private collapseFx(ctx: CanvasRenderingContext2D, model: TreeModel, time: number): void {
    if (this.collapseStart < 0) return;
    const u = (time - this.collapseStart) / 1400;
    if (u >= 1) {
      this.collapseStart = -1;
      return;
    }
    const top = Math.min(...model.leaves.map((l) => l.y), model.groundY - 80);
    const x = this.w * 0.5 + u * 70;
    const y = top + (model.groundY - top) * Math.min(1, u * u * 1.4);
    ctx.save();
    ctx.globalAlpha = 1 - Math.max(0, (u - 0.6) / 0.4);
    ctx.translate(x, y);
    ctx.rotate(u * 1.6);
    ctx.fillStyle = '#5f8a3e';
    blob(ctx, 0, 0, 26, 18);
    ctx.fillStyle = '#6e5442';
    ctx.fillRect(-4, 0, 8, 26);
    ctx.restore();
  }

  /** v16 瀕死: a few leaves drifting down and a faint red pulse over the tree. */
  private dyingFx(ctx: CanvasRenderingContext2D, model: TreeModel, input: SceneInput, time: number): void {
    const top = Math.min(...model.leaves.map((l) => l.y), model.groundY - 60);
    const cx = this.w * 0.5;
    for (let i = 0; i < 12; i++) {
      const u = input.reducedMotion ? (i / 12) : ((time * 0.00012 + i * 0.083) % 1);
      const x = cx + Math.sin(i * 2.3) * 60 + Math.sin(time * 0.002 + i) * 8;
      const y = top + (model.groundY - top) * u;
      ctx.fillStyle = i % 2 ? '#a07a34' : '#7a5a2e';
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 1.8, i + time * 0.003, 0, Math.PI * 2);
      ctx.fill();
    }
    const a = input.reducedMotion ? 0.07 : 0.05 + 0.06 * (0.5 + 0.5 * Math.sin(time * 0.0026));
    const g = ctx.createRadialGradient(cx, (top + model.groundY) / 2, 10, cx, (top + model.groundY) / 2, (model.groundY - top) * 0.8);
    g.addColorStop(0, `rgba(210, 30, 20, ${a})`);
    g.addColorStop(1, 'rgba(210, 30, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  private animals(
    ctx: CanvasRenderingContext2D,
    model: TreeModel,
    input: SceneInput,
    time: number,
    sway: (y: number) => number,
  ): void {
    if (input.health < 22) return;
    const scale = clamp(this.w / 640, 0.72, 1.2);
    const leaves = model.perches.filter((p) => p.kind === 'leaf');
    const trunk = model.perches.find((p) => p.kind === 'trunk') ?? { x: this.w / 2, y: model.groundY - 40, kind: 'trunk' as const };
    let leafI = 0;
    const night = input.daylight < 0.45;
    for (const id of input.animals) {
      if (id === 'firefly') continue;
      let perch = leaves[leafI % Math.max(1, leaves.length)] ?? trunk;
      let flip = leafI % 2 === 0;
      if (id === 'woodpecker' || id === 'cicada') perch = trunk;
      if (id === 'owl') perch = leaves[Math.floor(leaves.length / 2)] ?? perch;
      if (id === 'ladybug') perch = leaves[0] ?? perch;
      if (id !== 'woodpecker' && id !== 'cicada' && id !== 'ladybug') leafI += 1;
      let x = perch.x + sway(perch.y);
      let y = perch.y;
      if (id === 'butterfly') {
        x += Math.sin(time * 0.0016) * 16;
        y += Math.cos(time * 0.0018) * 8 - 12;
      }
      if (id === 'woodpecker') x += 10;
      drawAnimal(ctx, id, x, y, time, { scale, night, flip });
    }
    if (input.animals.includes('firefly')) {
      const n = night ? 7 : 3;
      for (let i = 0; i < n; i++) {
        const perch = leaves[(i * 2) % Math.max(1, leaves.length)] ?? trunk;
        const x = perch.x + sway(perch.y) + Math.sin(time * 0.001 + i) * (night ? 18 : 4);
        const y = perch.y + Math.cos(time * 0.0013 + i * 2) * (night ? 14 : 3);
        drawAnimal(ctx, 'firefly', x, y, time + i * 200, { scale, night, silhouette: !night });
      }
    }
  }

  private weatherFx(ctx: CanvasRenderingContext2D, input: SceneInput, time: number, heavy: boolean, storming: boolean): void {
    const snow = isSnowCode(input.cond.code);
    const raining = input.cond.raining || heavy;
    if (raining && !snow) {
      const count = heavy ? 120 : 70;
      if (this.drops.length !== count) {
        const rng = mulberry32(7);
        this.drops = Array.from({ length: count }, () => ({
          x: rng() * this.w,
          y: rng() * this.h,
          v: 9 + rng() * 8,
          len: heavy ? 14 + rng() * 10 : 8 + rng() * 8,
          drift: input.cond.windKmh * 0.03,
        }));
      }
      ctx.strokeStyle = storming ? 'rgba(210, 220, 230, 0.45)' : 'rgba(200, 214, 224, 0.55)';
      ctx.lineWidth = heavy ? 1.4 : 1;
      const step = input.reducedMotion ? 0 : 1;
      for (const drop of this.drops) {
        if (step) {
          drop.y += drop.v;
          drop.x += drop.drift + input.cond.windKmh * 0.02;
          if (drop.y > this.h) {
            drop.y = -10;
            drop.x = Math.random() * this.w;
          }
        }
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + input.cond.windKmh * 0.08, drop.y + drop.len);
        ctx.stroke();
      }
    } else this.drops = [];

    if (snow) {
      if (this.flakes.length < 40) {
        const rng = mulberry32(9);
        this.flakes = Array.from({ length: 50 }, () => ({ x: rng() * this.w, y: rng() * this.h, v: 0.6 + rng(), r: 1 + rng() * 1.6 }));
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const flake of this.flakes) {
        if (!input.reducedMotion) {
          flake.y += flake.v;
          flake.x += Math.sin(time * 0.001 + flake.y) * 0.4;
          if (flake.y > this.h) flake.y = -4;
        }
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (input.cond.gustKmh > 45 || storming) {
      if (this.motes.length < 8) {
        const rng = mulberry32(11);
        this.motes = Array.from({ length: 10 }, () => ({
          x: rng() * this.w,
          y: this.h * (0.4 + rng() * 0.3),
          v: 1.5 + rng() * 2,
          r: 2 + rng() * 2,
          phase: rng() * 6,
        }));
      }
      ctx.fillStyle = 'rgba(120, 90, 50, 0.35)';
      for (const mote of this.motes) {
        if (!input.reducedMotion) {
          mote.x += mote.v + input.cond.windKmh * 0.02;
          mote.y += Math.sin(time * 0.002 + mote.phase) * 0.4;
          if (mote.x > this.w + 10) mote.x = -10;
        }
        ctx.beginPath();
        ctx.ellipse(mote.x, mote.y, mote.r * 1.6, mote.r * 0.6, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (storming && !input.reducedMotion) {
      const cycle = (time / 1000) % 8;
      if (cycle < 0.12) {
        ctx.fillStyle = `rgba(255,255,255,${0.28 * (1 - cycle / 0.12)})`;
        ctx.fillRect(0, 0, this.w, this.h);
      }
    }

    if (input.cond.hot && input.daylight > 0.4) {
      ctx.fillStyle = 'rgba(255, 170, 80, 0.08)';
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  private vignette(ctx: CanvasRenderingContext2D, daylight: number): void {
    const g = ctx.createRadialGradient(this.w / 2, this.h * 0.62, this.w * 0.2, this.w / 2, this.h * 0.55, this.w * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, daylight > 0.5 ? 'rgba(70, 50, 30, 0.13)' : 'rgba(0, 0, 10, 0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.ellipse(x - rx * 0.45, y + 4, rx * 0.55, ry * 0.8, 0, 0, Math.PI * 2);
  ctx.ellipse(x + rx * 0.42, y + 3, rx * 0.5, ry * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
}

function hill(ctx: CanvasRenderingContext2D, w: number, y: number, amp: number, shift: number): void {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.quadraticCurveTo(w * 0.25 + shift, y - w * amp, w * 0.5, y - w * amp * 0.3);
  ctx.quadraticCurveTo(w * 0.75 - shift, y - w * amp * 0.7, w, y - 10);
  ctx.lineTo(w, y + 80);
  ctx.lineTo(0, y + 80);
  ctx.fill();
}

function drawTrunk(ctx: CanvasRenderingContext2D, pts: Pt[], sway: (y: number) => number): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  const first = pts[0]!;
  ctx.moveTo(first.x + sway(first.y) - first.r, first.y);
  for (const p of pts) ctx.lineTo(p.x + sway(p.y) - p.r * 0.92, p.y);
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    ctx.lineTo(p.x + sway(p.y) + p.r, p.y);
  }
  ctx.closePath();
  const top = pts[pts.length - 1]!;
  const g = ctx.createLinearGradient(first.x - first.r, 0, first.x + first.r, 0);
  g.addColorStop(0, '#4a3024');
  g.addColorStop(0.45, '#8d5c3e');
  g.addColorStop(1, '#5c3b2a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 180, 0.18)';
  ctx.lineWidth = Math.max(1, top.r * 0.25);
  ctx.beginPath();
  ctx.moveTo(first.x + sway(first.y) - first.r * 0.2, first.y - 4);
  ctx.lineTo(top.x + sway(top.y) - top.r * 0.1, top.y);
  ctx.stroke();
}

function drawLimb(ctx: CanvasRenderingContext2D, limb: Limb, sway: (y: number) => number, aerial: boolean): void {
  const x1 = limb.x1 + sway(limb.y1) * (aerial ? 0.3 : 1);
  const x2 = limb.x2 + sway(limb.y2) * (aerial ? 0.2 : 1.08);
  ctx.lineCap = 'round';
  ctx.strokeStyle = aerial ? '#6a4a34' : '#4e3426';
  ctx.lineWidth = limb.w;
  ctx.beginPath();
  ctx.moveTo(x1, limb.y1);
  ctx.quadraticCurveTo((x1 + x2) / 2 + limb.w * 0.25, (limb.y1 + limb.y2) / 2, x2, limb.y2);
  ctx.stroke();
  if (!aerial) {
    ctx.strokeStyle = '#916348';
    ctx.lineWidth = Math.max(0.7, limb.w * 0.4);
    ctx.stroke();
  }
  if (limb.snap) {
    ctx.strokeStyle = '#e6d3b4';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x2 - 5, limb.y2 + 2);
    ctx.lineTo(x2 + 4, limb.y2 - 3);
    ctx.stroke();
  }
}

function buildTree(w: number, h: number, input: SceneInput, key: string): TreeModel {
  const stage = stageFor(input.heightCm, input.targetCm);
  const rng = mulberry32(hashString(`${input.treeName || 'tree'}|${stage.id}`));
  const progress = stageProgress(input.heightCm, input.targetCm);
  const groundY = h * 0.8;
  const reach = stage.reach0 + (stage.reach1 - stage.reach0) * progress;
  const top = groundY - reach * h * 0.92;
  const baseX = w * 0.52 + (rng() - 0.5) * 12;
  const model: TreeModel = {
    key,
    groundY,
    trunk: [],
    limbs: [],
    leaves: [],
    roots: [],
    perches: [],
    pests: [],
    flowers: [],
    grass: [],
    crown: null,
  };

  for (let i = 0; i < 36; i++) {
    model.grass.push({
      x: w * 0.08 + rng() * w * 0.84,
      y: groundY + 8 + rng() * 18,
      h: 8 + rng() * 16,
      lean: (rng() - 0.4) * 10,
    });
  }
  if (input.health > 55) {
    const colors = ['#e7b3b0', '#f0d58a', '#f4f1ea', '#d98b86'];
    for (let i = 0; i < 7; i++) {
      model.flowers.push({
        x: baseX + (rng() - 0.5) * 160,
        y: groundY + 4 + rng() * 10,
        color: colors[i % colors.length] ?? '#f0d58a',
      });
    }
  }

  if (stage.depth === 0) {
    const stem = groundY - top;
    const lean = (rng() - 0.5) * 16;
    model.trunk = [
      { x: baseX, y: groundY, r: 3.2 },
      { x: baseX + lean * 0.3, y: groundY - stem * 0.45, r: 2.4 },
      { x: baseX + lean, y: groundY - stem, r: 1.6 },
    ];
    const tip = model.trunk[2]!;
    model.leaves.push(
      { x: tip.x - 12, y: tip.y + 6, rx: 16 + progress * 8, ry: 8, rot: -0.9, tint: 0.2, z: 0.8 },
      { x: tip.x + 14, y: tip.y + 4, rx: 18 + progress * 8, ry: 9, rot: 0.8, tint: 0.6, z: 0.9 },
      { x: tip.x + 1, y: tip.y - 8, rx: 8, ry: 12, rot: 0.1, tint: 0.9, z: 1 },
    );
    model.perches.push({ x: tip.x, y: tip.y - 6, kind: 'leaf' });
    model.perches.push({ x: baseX, y: groundY - stem * 0.45, kind: 'trunk' });
    return model;
  }

  const trunkH = (groundY - top) * 0.46;
  const crownY = groundY - trunkH;
  const baseR = stage.trunk * (w / 520) * (0.82 + progress * 0.35);
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wander = Math.sin(t * 3 + rng() * 2) * (8 + t * 6);
    model.trunk.push({
      x: baseX + wander * (rng() > 0.5 ? 1 : 0.6),
      y: groundY - trunkH * t,
      r: baseR * (1 - t * 0.72),
    });
  }
  const crown = model.trunk[model.trunk.length - 1]!;
  model.perches.push({ x: baseX + baseR * 0.2, y: groundY - trunkH * 0.55, kind: 'trunk' });
  model.crown = {
    x: crown.x,
    y: top + (crownY - top) * 0.55,
    rx: Math.min(w * 0.42, (18 + stage.depth * 22) * (w / 480)),
    ry: (groundY - top) * 0.26,
  };

  let snaps = input.scars;
  const grow = (x: number, y: number, angle: number, len: number, width: number, depth: number) => {
    let x2 = x + Math.cos(angle) * len;
    let y2 = y + Math.sin(angle) * len;
    let snapped = false;
    if (snaps > 0 && depth === stage.depth - 1 && rng() > 0.4) {
      x2 = x + Math.cos(angle) * len * 0.45;
      y2 = y + Math.sin(angle) * len * 0.45;
      snapped = true;
      snaps -= 1;
    }
    model.limbs.push({ x1: x, y1: y, x2, y2, w: width, snap: snapped });
    if (snapped || depth <= 0 || width < 1.3) {
      const count = 4 + Math.floor(rng() * 3);
      for (let i = 0; i < count; i++) {
        const a = rng() * Math.PI * 2;
        const dist = rng() * (12 + stage.depth * 3);
        model.leaves.push({
          x: x2 + Math.cos(a) * dist,
          y: y2 + Math.sin(a) * dist * 0.62,
          rx: 7 + rng() * (6 + stage.depth),
          ry: 4 + rng() * 4,
          rot: a,
          tint: rng(),
          z: rng(),
        });
      }
      model.perches.push({ x: x2, y: y2, kind: 'leaf' });
      return;
    }
    const forks = depth >= 3 && rng() > 0.62 ? 3 : 2;
    for (let i = 0; i < forks; i++) {
      const t = i / (forks - 1);
      const spread = (t - 0.5) * (0.95 + rng() * 0.45);
      grow(x2, y2, angle + spread + (rng() - 0.5) * 0.15, len * (0.64 + rng() * 0.08), width * 0.64, depth - 1);
    }
  };

  const mains = stage.depth >= 5 ? 4 : 3;
  for (let i = 0; i < mains; i++) {
    const t = i / (mains - 1);
    const angle = -Math.PI / 2 + (t - 0.5) * 1.5;
    const start = model.trunk[Math.max(0, model.trunk.length - 2)]!;
    grow(start.x, start.y, angle, (groundY - top) * (0.22 + progress * 0.06), baseR * 0.55, stage.depth - 1);
  }

  if (stage.roots) {
    const n = 4 + Math.min(4, stage.depth);
    for (let i = 0; i < n; i++) {
      const limb = model.limbs[Math.floor(rng() * model.limbs.length)];
      if (!limb) continue;
      const x = (limb.x1 + limb.x2) / 2;
      const y = (limb.y1 + limb.y2) / 2;
      if (y > groundY - 30) continue;
      model.roots.push({ x1: x, y1: y, x2: x + (rng() - 0.5) * 16, y2: groundY - 2, w: 1.4 + rng() * 1.6 });
    }
  }

  if (input.pests > 35) {
    for (let i = 0; i < 8; i++) {
      const leaf = model.leaves[Math.floor(rng() * model.leaves.length)];
      if (!leaf) continue;
      model.pests.push({ x: leaf.x, y: leaf.y });
    }
  }
  return model;
}
