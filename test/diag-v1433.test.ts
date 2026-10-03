import { describe, expect, it } from 'vitest';
import { diag, frameReport, noteFrame, resetFrameClock } from '../src/diag';

describe('1.4.33 diagnostics', () => {
  it('counts slow frames and ignores hidden gaps', () => {
    noteFrame(1000, false);
    noteFrame(1016, false);
    noteFrame(1116, true);
    resetFrameClock();
    noteFrame(9000, false);
    noteFrame(9016, false);
    expect(diag.frames).toBe(3);
    expect(Math.round(diag.longestMs)).toBe(100);
    expect(diag.slowFrames).toBe(1);
    expect(diag.intro.slowFrames).toBe(1);
    expect(frameReport(0)[0]).toContain('zero-dt draws 0');
  });
});
