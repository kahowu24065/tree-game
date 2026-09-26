// The push server (push-server/src/intl.js) ports the game's non-HK weather rules; keep them identical.
import { describe, expect, it } from 'vitest';
import { currentEvents, eventFromNumbers, isColdDay, isHotDay } from '../src/events';
// @ts-expect-error plain JS module without types
import * as intl from '../push-server/src/intl.js';

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe('push-server rule port matches the game', () => {
  it('heat / cold / headline event agree on 5000 random days', () => {
    const r = rng(42);
    for (let k = 0; k < 5000; k++) {
      const t = {
        code: [0, 1, 3, 61, 63, 65, 80, 95, 96][Math.floor(r() * 9)],
        precipMm: r() * 100,
        gustKmh: r() * 140,
        windKmh: r() * 80,
        tempMax: -5 + r() * 45,
        tempMin: -15 + r() * 35,
        intl: true,
        normMax: r() < 0.2 ? null : 10 + r() * 25,
        normMin: r() < 0.2 ? null : -5 + r() * 25,
      };
      expect(intl.isHotDay(t)).toBe(isHotDay(t));
      expect(intl.isColdDay(t)).toBe(isColdDay(t));
      const game = eventFromNumbers(t);
      expect(intl.eventFromNumbers(t)).toBe(game === 'drizzle' ? 'clear' : game);
    }
  });

  it('non-HK currentEvents agree (severe events)', () => {
    const r = rng(7);
    for (let k = 0; k < 3000; k++) {
      const current = { tempC: -5 + r() * 40, humidity: 70, precipMm: r() * 15, code: [0, 3, 63, 95][Math.floor(r() * 4)], windKmh: r() * 70, gustKmh: r() * 130, isDay: true, time: '' };
      const normals = r() < 0.2 ? null : { max: 10 + r() * 25, min: -5 + r() * 25 };
      const today = { date: '2026-09-27', code: [1, 61, 65, 95][Math.floor(r() * 4)], tempMax: current.tempC + r() * 6, tempMin: current.tempC - r() * 10, precipMm: r() * 90, precipProb: 50, windKmh: r() * 70, gustKmh: r() * 130, sunrise: '', sunset: '', intl: true, normMax: normals?.max ?? null, normMin: normals?.min ?? null };
      const game = currentEvents({ hk: false, current, today }).filter((e) => e !== 'drizzle').sort();
      expect(intl.currentEventsIntl(current, today, normals).sort()).toEqual(game);
    }
  });
});
