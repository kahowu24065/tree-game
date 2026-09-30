// v1.4.16: the egg countdown shows seconds (HH:MM:SS) and ticks on one timer that stops when not needed.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshNest, tickNest, NEST_HATCH_MS } from '../src/nest';
import { createGame } from '../src/sim';
import { hatchClockText, setUiClock, syncHatchCard } from '../src/ui';

function eggState(now: number) {
  const state = createGame('2026-09-01');
  state.started = true;
  state.health = 80;
  state.animals = ['sparrow', 'bulbul', 'magpierobin'];
  state.nest = freshNest();
  tickNest(state, now, '2026-09-01');
  return state;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setUiClock(() => Date.now());
});

describe('hatch countdown', () => {
  it('formats HH:MM:SS, rounded up to the second, never negative', () => {
    const laid = 1_000_000_000_000;
    const state = eggState(laid);
    setUiClock(() => laid);
    expect(hatchClockText(state)).toBe('06:00:00');
    setUiClock(() => laid + NEST_HATCH_MS - (2 * 3600 + 5 * 60 + 9) * 1000 - 400);
    expect(hatchClockText(state)).toBe('02:05:10');
    setUiClock(() => laid + NEST_HATCH_MS - 1);
    expect(hatchClockText(state)).toBe('00:00:01');
    setUiClock(() => laid + NEST_HATCH_MS + 5000);
    expect(hatchClockText(state)).toBe('00:00:00');
  });

  it('ticks every second while shown and stops when the card goes away', () => {
    vi.useFakeTimers();
    const laid = Date.now();
    const state = eggState(laid);
    // Minimal DOM stand-in (tests run in node): one card element, removable.
    const el = { hidden: true, innerHTML: '' };
    let present = true;
    vi.stubGlobal('document', { hidden: false, getElementById: (id: string) => (present && id === 'hatch-card' ? el : null) });
    syncHatchCard(state);
    expect(el.hidden).toBe(false);
    expect(el.innerHTML).toBe('孵蛋時間：<b>06:00:00</b>');
    syncHatchCard(state); // a second sync does not add a second timer
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1010);
    expect(el.innerHTML).toBe('孵蛋時間：<b>05:59:59</b>');
    vi.advanceTimersByTime(3000);
    expect(el.innerHTML).toBe('孵蛋時間：<b>05:59:56</b>');
    expect(vi.getTimerCount()).toBe(1);
    present = false;
    vi.advanceTimersByTime(1010);
    expect(vi.getTimerCount()).toBe(0);
  });
});
