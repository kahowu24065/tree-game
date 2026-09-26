/**
 * 匯出／匯入存檔: a save code = "SEKAI1." + base64url(deflate-raw(JSON)) + "." + CRC32 (hex, of the JSON).
 * The payload carries the game save (sekai-tree-v2) and the meta (badges, 免死金牌…). Pure + async; works on web and in
 * the app (CompressionStream is in every current browser / Android WebView and Node 18+).
 */
import { parseSave } from './storage';
import type { GameState, MetaState } from './types';

export const CODE_PREFIX = 'SEKAI1';

export interface SavePayload {
  v: 1;
  at: string;
  save: GameState;
  meta: MetaState | null;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array): string {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toB64url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export async function encodeSave(save: GameState, meta: MetaState | null, now = new Date()): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ v: 1, at: now.toISOString(), save, meta } satisfies SavePayload));
  const packed = await pipe(json, new CompressionStream('deflate-raw'));
  return `${CODE_PREFIX}.${toB64url(packed)}.${crc32(json)}`;
}

export type DecodeResult = { ok: true; payload: SavePayload } | { ok: false; error: string };

/** Validate a pasted code: prefix, checksum, and that the save passes the normal load + migrations. */
export async function decodeSave(code: string): Promise<DecodeResult> {
  const parts = code.replace(/\s+/g, '').split('.');
  if (parts.length !== 3 || parts[0] !== CODE_PREFIX) return { ok: false, error: '唔係《世界之樹》存檔碼。' };
  let json: Uint8Array;
  try {
    json = await pipe(fromB64url(parts[1]), new DecompressionStream('deflate-raw'));
  } catch {
    return { ok: false, error: '存檔碼唔完整（可能冇複製晒）。' };
  }
  if (crc32(json) !== parts[2].toLowerCase()) return { ok: false, error: '存檔碼校驗唔啱（可能冇複製晒）。' };
  try {
    const data = JSON.parse(new TextDecoder().decode(json)) as SavePayload;
    if (data?.v !== 1 || !data.save) return { ok: false, error: '存檔碼版本唔支援。' };
    const save = parseSave(JSON.stringify(data.save));
    if (!save) return { ok: false, error: '存檔內容無效。' };
    const meta = data.meta && data.meta.version === 1 && data.meta.badges ? data.meta : null;
    return { ok: true, payload: { v: 1, at: String(data.at ?? ''), save, meta } };
  } catch {
    return { ok: false, error: '存檔內容無效。' };
  }
}
