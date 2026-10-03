import { existsSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUDIO_FILES, fetchBytes } from '../src/audio';

describe('1.4.34 audio loading', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('every sound file is shipped in public/audio', () => {
    for (const spec of Object.values(AUDIO_FILES)) {
      for (const f of Array.isArray(spec) ? spec : [spec]) expect(existsSync(`public/audio/${f}`), f).toBe(true);
    }
  });

  it('accepts a status-0 answer with bytes (Capacitor iOS media files)', async () => {
    const body = new Uint8Array([1, 2, 3]).buffer;
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 0, arrayBuffer: async () => body }));
    const got = await fetchBytes('capacitor://localhost/audio/day.m4a');
    expect(got.byteLength).toBe(3);
  });

  it('falls back to XHR when fetch gives nothing', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 0, arrayBuffer: async () => new ArrayBuffer(0) }));
    class FakeXhr {
      status = 0;
      response: ArrayBuffer | null = null;
      responseType = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      open() {}
      send() {
        this.response = new Uint8Array([9, 9]).buffer;
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const got = await fetchBytes('capacitor://localhost/audio/day.m4a');
    expect(got.byteLength).toBe(2);
  });
});
