/**
 * 1.4.66: stitch saved daily share-card snaps into a short timelapse (first → latest).
 * Available as soon as at least one tree card is saved — no 巨樹 gate.
 * Uses Canvas + MediaRecorder (webm) when available; otherwise a JPEG strip fallback.
 */
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { t as tl } from './i18n';
import { loadLogPhotos, LOG_PHOTOS_MAX_DAYS } from './logPhotos';
import { isNative } from './native/platform';
import type { GameState } from './types';

/** Minimum daily snaps to generate (one card is enough). */
export const TIMELAPSE_MIN_FRAMES = 1;

export function timelapseDates(): string[] {
  return Object.keys(loadLogPhotos()).sort();
}

/** Feature is on whenever the tree is alive (settings row always shown). */
export function timelapseUnlocked(state: Pick<GameState, 'started' | 'over'>): boolean {
  return Boolean(state.started && !state.over);
}

/** Generate is enabled once ≥1 saved tree card exists. */
export function timelapseReady(state: Pick<GameState, 'started' | 'over'>): boolean {
  return timelapseUnlocked(state) && timelapseDates().length >= TIMELAPSE_MIN_FRAMES;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('img'));
    img.src = src;
  });
}

/** Draw frames in date order onto a canvas (540×675), hold each ~0.45s. */
async function paintFrames(
  onFrame: (cv: HTMLCanvasElement, i: number, n: number) => void | Promise<void>,
  holdMs = 450,
): Promise<{ w: number; h: number; n: number }> {
  const photos = loadLogPhotos();
  const dates = Object.keys(photos).sort();
  if (dates.length < TIMELAPSE_MIN_FRAMES) throw new Error('few');
  const w = 540;
  const h = 675;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < dates.length; i++) {
    const src = photos[dates[i]!]!;
    const img = await loadImg(src);
    g.fillStyle = '#eaf6ee';
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    // Date stamp
    g.fillStyle = 'rgba(35,53,44,0.72)';
    g.font = '600 22px system-ui,sans-serif';
    g.fillText(dates[i]!, 18, h - 20);
    await onFrame(cv, i, dates.length);
    if (holdMs > 0) await new Promise((r) => setTimeout(r, holdMs));
  }
  return { w, h, n: dates.length };
}

/**
 * Try MediaRecorder → webm blob. Returns null when the browser cannot record.
 * holdMs per frame; fps is synthetic (we hold still frames).
 */
export async function recordTimelapseWebm(holdMs = 450): Promise<Blob | null> {
  if (typeof MediaRecorder === 'undefined') return null;
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
  if (!mime) return null;
  const w = 540;
  const h = 675;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const stream = cv.captureStream(Math.max(1, Math.round(1000 / holdMs)));
  const chunks: BlobPart[] = [];
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 });
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve, reject) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime.split(';')[0] }));
    rec.onerror = () => reject(new Error('rec'));
  });
  rec.start();
  try {
    await paintFrames(async (frame) => {
      const g = cv.getContext('2d')!;
      g.drawImage(frame, 0, 0);
    }, holdMs);
  } finally {
    // One last frame tick so the encoder flushes.
    await new Promise((r) => setTimeout(r, holdMs));
    if (rec.state !== 'inactive') rec.stop();
    stream.getTracks().forEach((t) => t.stop());
  }
  try {
    const blob = await done;
    return blob.size > 256 ? blob : null;
  } catch {
    return null;
  }
}

/** Fallback: tall strip of all frames (still shareable as an image). */
export async function buildTimelapseStrip(): Promise<Blob> {
  const photos = loadLogPhotos();
  const dates = Object.keys(photos).sort();
  if (dates.length < TIMELAPSE_MIN_FRAMES) throw new Error('few');
  const w = 540;
  const h = 675;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h * dates.length;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < dates.length; i++) {
    const img = await loadImg(photos[dates[i]!]!);
    g.fillStyle = '#eaf6ee';
    g.fillRect(0, i * h, w, h);
    g.drawImage(img, 0, i * h, w, h);
    g.fillStyle = 'rgba(35,53,44,0.72)';
    g.font = '600 22px system-ui,sans-serif';
    g.fillText(dates[i]!, 18, i * h + h - 20);
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.85);
  });
  return blob;
}

export type TimelapseResult = { kind: 'video' | 'strip'; blob: Blob; frames: number };

export async function buildTimelapse(): Promise<TimelapseResult> {
  const n = timelapseDates().length;
  const video = await recordTimelapseWebm();
  if (video) return { kind: 'video', blob: video, frames: n };
  const strip = await buildTimelapseStrip();
  return { kind: 'strip', blob: strip, frames: n };
}

function fileName(kind: 'video' | 'strip'): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return kind === 'video' ? `sekai-tree-timelapse-${stamp}.webm` : `sekai-tree-timelapse-${stamp}.jpg`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

/** Share or download the timelapse. */
export async function shareTimelapse(result: TimelapseResult): Promise<'shared' | 'downloaded' | 'failed'> {
  const name = fileName(result.kind);
  if (isNative()) {
    try {
      const data = await blobToBase64(result.blob);
      const w = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
      await Share.share({ title: tl('timelapse.shareTitle'), files: [w.uri], dialogTitle: tl('timelapse.shareTitle') });
      return 'shared';
    } catch (e) {
      return String((e as Error)?.message ?? e).toLowerCase().includes('cancel') ? 'shared' : 'failed';
    }
  }
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(result.blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

export { LOG_PHOTOS_MAX_DAYS };
