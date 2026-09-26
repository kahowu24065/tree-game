import { describe, expect, it } from 'vitest';
import { createGame } from '../src/sim';
import { freshMeta } from '../src/meta';
import { crc32, decodeSave, encodeSave } from '../src/saveCode';

describe('save code (匯出／匯入存檔)', () => {
  const game = () => {
    const g = createGame('2026-09-27');
    g.treeName = '小樹';
    g.heightCm = 321.5;
    return g;
  };

  it('round-trips save + meta', async () => {
    const meta = freshMeta();
    meta.reviveTokens = 2;
    const code = await encodeSave(game(), meta, new Date('2026-09-27T00:00:00Z'));
    expect(code.startsWith('SEKAI1.')).toBe(true);
    const res = await decodeSave(`  ${code.slice(0, 20)}\n${code.slice(20)} `);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.payload.save.treeName).toBe('小樹');
    expect(res.payload.save.heightCm).toBe(321.5);
    expect(res.payload.meta?.reviveTokens).toBe(2);
    expect(res.payload.at).toBe('2026-09-27T00:00:00.000Z');
  });

  it('rejects wrong prefix, truncation and bad checksum', async () => {
    const code = await encodeSave(game(), null);
    expect((await decodeSave('hello')).ok).toBe(false);
    expect((await decodeSave(code.slice(0, code.length - 20))).ok).toBe(false);
    const [p, body] = code.split('.');
    expect((await decodeSave(`${p}.${body}.00000000`)).ok).toBe(false);
  });

  it('rejects a payload that is not a valid save', async () => {
    const bad = { ...game(), version: 1 } as unknown as ReturnType<typeof game>;
    const res = await decodeSave(await encodeSave(bad, null));
    expect(res).toEqual({ ok: false, error: '存檔內容無效。' });
  });

  it('crc32 matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe('cbf43926');
  });
});
