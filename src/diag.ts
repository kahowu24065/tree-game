/**
 * 1.4.33 hidden diagnostics (long-press the version line in 設定): frame timing and the preload results, so a
 * phone without a Mac / Web Inspector can still tell what the opening did.
 */
export type PreloadTask = { name: string; ms: number; state: 'ok' | 'fail' | 'timeout'; note?: string };

const SLOW_MS = 50;

export const diag = {
  bootAt: typeof performance !== 'undefined' ? performance.now() : 0,
  frames: 0,
  longestMs: 0,
  longestAt: 0,
  slowFrames: 0,
  intro: { startAt: 0, endAt: 0, frames: 0, longestMs: 0, slowFrames: 0 },
  preload: { ms: 0, timedOut: false, tasks: [] as PreloadTask[] },
};

let prev = -1;

/** Call once per animation frame with the rAF timestamp. */
export function noteFrame(time: number, intro: boolean): void {
  if (prev >= 0 && time > prev) {
    const gap = time - prev;
    diag.frames++;
    if (gap > diag.longestMs) {
      diag.longestMs = gap;
      diag.longestAt = time - diag.bootAt;
    }
    if (gap > SLOW_MS) diag.slowFrames++;
    if (intro) {
      diag.intro.frames++;
      diag.intro.longestMs = Math.max(diag.intro.longestMs, gap);
      if (gap > SLOW_MS) diag.intro.slowFrames++;
    }
  }
  prev = time;
}

/** The page was hidden: the gap until the next frame is not a slow frame. */
export function resetFrameClock(): void {
  prev = -1;
}

export function noteIntro(edge: 'start' | 'end'): void {
  const now = performance.now();
  if (edge === 'start') diag.intro.startAt = now;
  else diag.intro.endAt = now;
}

const sec = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

export function frameReport(zeroDt: number): string[] {
  const i = diag.intro;
  const introLen = i.startAt && i.endAt ? sec(i.endAt - i.startAt) : i.startAt ? 'running' : 'not started';
  return [
    `frames ${diag.frames}, zero-dt draws ${zeroDt}`,
    `longest frame ${Math.round(diag.longestMs)} ms (at ${sec(diag.longestAt)}), frames >${SLOW_MS} ms: ${diag.slowFrames}`,
    `intro ${introLen}, frames ${i.frames}, longest ${Math.round(i.longestMs)} ms, >${SLOW_MS} ms: ${i.slowFrames}`,
    `preload ${diag.preload.ms} ms${diag.preload.timedOut ? ' (capped)' : ''}: ${diag.preload.tasks.map((t) => `${t.name} ${t.state} ${t.ms} ms${t.note ? ` [${t.note}]` : ''}`).join('; ') || '-'}`,
  ];
}
