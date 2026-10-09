/**
 * 1.4.66: when the player finishes 分享樹卡, keep a compressed snapshot of that day's card in the
 * 成長日誌. Stored under its own key (not inside the save JSON) so the game save stays lean.
 * Pruned to the newest MAX_DAYS entries; images are JPEG thumbnails of the share card.
 */
import { kvGet, kvRemove, kvSet } from './native/kv';

export const LOG_PHOTOS_KEY = 'sekai-tree-log-photos';
/** Keep about three weeks of daily snaps (localStorage / Preferences budget). */
export const LOG_PHOTOS_MAX_DAYS = 21;
/** Long edge of the stored JPEG (share card is 1080×1350). */
const SNAP_W = 540;
const SNAP_H = 675;
const JPEG_Q = 0.62;

export type LogPhotoMap = Record<string, string>; // date (YYYY-MM-DD) → data URL (image/jpeg)

export function loadLogPhotos(): LogPhotoMap {
  try {
    const raw = kvGet(LOG_PHOTOS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as LogPhotoMap;
    if (!data || typeof data !== 'object') return {};
    const out: LogPhotoMap = {};
    for (const [k, v] of Object.entries(data)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'string' && v.startsWith('data:image/')) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveLogPhotos(map: LogPhotoMap): void {
  try {
    kvSet(LOG_PHOTOS_KEY, JSON.stringify(map));
  } catch {
    // Quota: drop oldest until it fits, then give up quietly.
    const dates = Object.keys(map).sort();
    while (dates.length > 3) {
      const drop = dates.shift()!;
      delete map[drop];
      try {
        kvSet(LOG_PHOTOS_KEY, JSON.stringify(map));
        return;
      } catch {
        /* keep trimming */
      }
    }
    try {
      kvRemove(LOG_PHOTOS_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Newest-first prune to MAX_DAYS. */
export function pruneLogPhotos(map: LogPhotoMap, max = LOG_PHOTOS_MAX_DAYS): LogPhotoMap {
  const dates = Object.keys(map).sort();
  while (dates.length > max) {
    const drop = dates.shift()!;
    delete map[drop];
  }
  return map;
}

/** Compress a share-card canvas to a small JPEG data URL. */
export function compressShareCard(cv: HTMLCanvasElement): string {
  const out = document.createElement('canvas');
  out.width = SNAP_W;
  out.height = SNAP_H;
  const g = out.getContext('2d')!;
  g.fillStyle = '#eaf6ee';
  g.fillRect(0, 0, SNAP_W, SNAP_H);
  g.drawImage(cv, 0, 0, SNAP_W, SNAP_H);
  try {
    return out.toDataURL('image/jpeg', JPEG_Q);
  } catch {
    return out.toDataURL('image/jpeg');
  }
}

/** Save / overwrite today's snap and prune. Returns the stored data URL (or null on failure). */
export function rememberLogPhoto(date: string, cv: HTMLCanvasElement): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  let data: string;
  try {
    data = compressShareCard(cv);
  } catch {
    return null;
  }
  if (!data || data.length < 32) return null;
  const map = pruneLogPhotos(loadLogPhotos());
  map[date] = data;
  pruneLogPhotos(map);
  saveLogPhotos(map);
  return data;
}

export function logPhotoFor(date: string): string | null {
  const v = loadLogPhotos()[date];
  return v || null;
}

export function logPhotoDates(): Set<string> {
  return new Set(Object.keys(loadLogPhotos()));
}

/** Byte length of the stored JSON (for tests / diagnostics). */
export function logPhotosBytes(): number {
  return (kvGet(LOG_PHOTOS_KEY) ?? '').length;
}
