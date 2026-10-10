/**
 * 1.4.66/1.4.67: stitch saved daily share-card snaps into a short timelapse (first → latest).
 * Unlocks at 青年樹; Generate needs ≥1 saved tree card.
 * Prefers real MP4: native Capacitor plugin → MediaRecorder video/mp4 → WebCodecs+mp4-muxer → webm → JPEG strip.
 */
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { t as tl } from './i18n';
import { loadLogPhotos, LOG_PHOTOS_MAX_DAYS } from './logPhotos';
import { nativeEncodeTimelapseMp4 } from './native/timelapseEncode';
import { isNative } from './native/platform';
import { stageIndex } from './content';
import { speciesTargetCm } from './data/species';
import type { GameState } from './types';

/** 青年樹 stage index (幼苗0、小樹1、青年樹2、成年樹3、巨樹4). */
export const YOUNG_STAGE = 2;

/** Minimum daily snaps to generate (one card is enough once unlocked). */
export const TIMELAPSE_MIN_FRAMES = 1;

export function timelapseDates(): string[] {
  return Object.keys(loadLogPhotos()).sort();
}

/** Feature unlocks at 青年樹 onwards. */
export function timelapseUnlocked(state: Pick<GameState, 'started' | 'over' | 'heightCm' | 'species'>): boolean {
  if (!state.started || state.over) return false;
  return stageIndex(state.heightCm, speciesTargetCm(state.species)) >= YOUNG_STAGE;
}

/** Generate once unlocked and ≥1 saved tree card exists. */
export function timelapseReady(state: Pick<GameState, 'started' | 'over' | 'heightCm' | 'species'>): boolean {
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

const FRAME_W = 540;
const FRAME_H = 675;
const HOLD_MS = 450;

async function paintFrames(
  onFrame: (cv: HTMLCanvasElement, i: number, n: number) => void | Promise<void>,
  holdMs = HOLD_MS,
): Promise<{ w: number; h: number; n: number }> {
  const photos = loadLogPhotos();
  const dates = Object.keys(photos).sort();
  if (dates.length < TIMELAPSE_MIN_FRAMES) throw new Error('few');
  const cv = document.createElement('canvas');
  cv.width = FRAME_W;
  cv.height = FRAME_H;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < dates.length; i++) {
    const src = photos[dates[i]!]!;
    const img = await loadImg(src);
    g.fillStyle = '#eaf6ee';
    g.fillRect(0, 0, FRAME_W, FRAME_H);
    g.drawImage(img, 0, 0, FRAME_W, FRAME_H);
    g.fillStyle = 'rgba(35,53,44,0.72)';
    g.font = '600 22px system-ui,sans-serif';
    g.fillText(dates[i]!, 18, FRAME_H - 20);
    await onFrame(cv, i, dates.length);
    if (holdMs > 0) await new Promise((r) => setTimeout(r, holdMs));
  }
  return { w: FRAME_W, h: FRAME_H, n: dates.length };
}

function frameDataUrls(): string[] {
  const photos = loadLogPhotos();
  return Object.keys(photos).sort().map((d) => photos[d]!);
}

/** MediaRecorder → MP4 when the engine supports it (Safari / iOS WKWebView). */
export async function recordTimelapseMp4MediaRecorder(holdMs = HOLD_MS): Promise<Blob | null> {
  if (typeof MediaRecorder === 'undefined') return null;
  const mime = ['video/mp4;codecs=avc1', 'video/mp4;codecs=h264', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported(t));
  if (!mime) return null;
  const cv = document.createElement('canvas');
  cv.width = FRAME_W;
  cv.height = FRAME_H;
  const stream = cv.captureStream(Math.max(1, Math.round(1000 / holdMs)));
  const chunks: BlobPart[] = [];
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 });
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve, reject) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }));
    rec.onerror = () => reject(new Error('rec'));
  });
  rec.start();
  try {
    await paintFrames(async (frame) => {
      const g = cv.getContext('2d')!;
      g.drawImage(frame, 0, 0);
    }, holdMs);
  } finally {
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

/** WebCodecs + mp4-muxer → H.264 MP4 (Chromium / modern Android WebView). */
export async function recordTimelapseMp4WebCodecs(holdMs = HOLD_MS): Promise<Blob | null> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return null;
  try {
    const photos = loadLogPhotos();
    const dates = Object.keys(photos).sort();
    if (dates.length < TIMELAPSE_MIN_FRAMES) return null;
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: FRAME_W, height: FRAME_H },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    });
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: () => {},
    });
    encoder.configure({
      codec: 'avc1.42001f',
      width: FRAME_W,
      height: FRAME_H,
      bitrate: 1_200_000,
      framerate: Math.max(1, Math.round(1000 / holdMs)),
    });
    const cv = document.createElement('canvas');
    cv.width = FRAME_W;
    cv.height = FRAME_H;
    const g = cv.getContext('2d')!;
    const durUs = holdMs * 1000;
    for (let i = 0; i < dates.length; i++) {
      const img = await loadImg(photos[dates[i]!]!);
      g.fillStyle = '#eaf6ee';
      g.fillRect(0, 0, FRAME_W, FRAME_H);
      g.drawImage(img, 0, 0, FRAME_W, FRAME_H);
      g.fillStyle = 'rgba(35,53,44,0.72)';
      g.font = '600 22px system-ui,sans-serif';
      g.fillText(dates[i]!, 18, FRAME_H - 20);
      const stamp = i * durUs;
      const frame = new VideoFrame(cv, { timestamp: stamp, duration: durUs });
      encoder.encode(frame, { keyFrame: true });
      frame.close();
    }
    await encoder.flush();
    encoder.close();
    muxer.finalize();
    const buf = target.buffer;
    return buf && buf.byteLength > 256 ? new Blob([buf], { type: 'video/mp4' }) : null;
  } catch {
    return null;
  }
}

/** Legacy webm path (desktop Chrome when MP4 unavailable). */
export async function recordTimelapseWebm(holdMs = HOLD_MS): Promise<Blob | null> {
  if (typeof MediaRecorder === 'undefined') return null;
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
  if (!mime) return null;
  const cv = document.createElement('canvas');
  cv.width = FRAME_W;
  cv.height = FRAME_H;
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
      cv.getContext('2d')!.drawImage(frame, 0, 0);
    }, holdMs);
  } finally {
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
  const cv = document.createElement('canvas');
  cv.width = FRAME_W;
  cv.height = FRAME_H * dates.length;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < dates.length; i++) {
    const img = await loadImg(photos[dates[i]!]!);
    g.fillStyle = '#eaf6ee';
    g.fillRect(0, i * FRAME_H, FRAME_W, FRAME_H);
    g.drawImage(img, 0, i * FRAME_H, FRAME_W, FRAME_H);
    g.fillStyle = 'rgba(35,53,44,0.72)';
    g.font = '600 22px system-ui,sans-serif';
    g.fillText(dates[i]!, 18, i * FRAME_H + FRAME_H - 20);
  }
  return new Promise((resolve, reject) => {
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.85);
  });
}

export type TimelapseResult =
  | { kind: 'video'; blob: Blob; frames: number; ext: 'mp4' | 'webm' }
  | { kind: 'native'; uri: string; path: string; frames: number; ext: 'mp4' }
  | { kind: 'strip'; blob: Blob; frames: number; ext: 'jpg' };

export async function buildTimelapse(): Promise<TimelapseResult> {
  const n = timelapseDates().length;
  // 1) Native Capacitor MP4 (iOS / Android)
  if (isNative()) {
    const native = await nativeEncodeTimelapseMp4(frameDataUrls(), HOLD_MS);
    if (native) return { kind: 'native', uri: native.uri, path: native.path, frames: n, ext: 'mp4' };
  }
  // 2) MediaRecorder MP4 (Safari / iOS WKWebView fallback)
  const mp4Rec = await recordTimelapseMp4MediaRecorder();
  if (mp4Rec) return { kind: 'video', blob: mp4Rec, frames: n, ext: 'mp4' };
  // 3) WebCodecs H.264 MP4
  const mp4Wc = await recordTimelapseMp4WebCodecs();
  if (mp4Wc) return { kind: 'video', blob: mp4Wc, frames: n, ext: 'mp4' };
  // 4) WebM (desktop)
  const webm = await recordTimelapseWebm();
  if (webm) return { kind: 'video', blob: webm, frames: n, ext: 'webm' };
  // 5) JPEG strip last resort
  const strip = await buildTimelapseStrip();
  return { kind: 'strip', blob: strip, frames: n, ext: 'jpg' };
}

function fileName(ext: 'mp4' | 'webm' | 'jpg'): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `sekai-tree-timelapse-${stamp}.${ext}`;
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
  const name = fileName(result.ext);
  if (isNative()) {
    try {
      let uri: string;
      if (result.kind === 'native') {
        uri = result.uri;
      } else {
        const data = await blobToBase64(result.blob);
        const w = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
        uri = w.uri;
      }
      await Share.share({ title: tl('timelapse.shareTitle'), files: [uri], dialogTitle: tl('timelapse.shareTitle') });
      return 'shared';
    } catch (e) {
      return String((e as Error)?.message ?? e).toLowerCase().includes('cancel') ? 'shared' : 'failed';
    }
  }
  if (result.kind === 'native') return 'failed';
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
