/**
 * 1.4.33 preload screen (#preload in index.html, same colour as the native splash): the swaying sapling stays up
 * while the scene compiles its shaders, the time-of-day music decodes and the weather arrives — at most ~5 s —
 * then fades out and the opening glide starts.
 */
import { diag, type PreloadTask } from './diag';

export const PRELOAD_CAP_MS = 5000;
const MIN_MS = 900;
const FADE_MS = 450;

type Task = { name: string; run: () => Promise<string | void> };

export async function runPreload(tasks: Task[], cap = PRELOAD_CAP_MS): Promise<void> {
  const started = performance.now();
  const results: PreloadTask[] = tasks.map((t) => ({ name: t.name, ms: 0, state: 'timeout' }));
  const jobs = tasks.map((t, i) =>
    t
      .run()
      .then((note) => {
        results[i] = { name: t.name, ms: Math.round(performance.now() - started), state: 'ok', ...(note ? { note } : {}) };
      })
      .catch((error: unknown) => {
        results[i] = { name: t.name, ms: Math.round(performance.now() - started), state: 'fail', note: String(error).slice(0, 80) };
      }),
  );
  let timedOut = false;
  await Promise.race([
    Promise.all(jobs),
    new Promise<void>((r) =>
      window.setTimeout(() => {
        timedOut = true;
        r();
      }, cap),
    ),
  ]);
  const left = MIN_MS - (performance.now() - started);
  if (left > 0) await new Promise((r) => window.setTimeout(r, left));
  for (const r of results) if (r.state === 'timeout') r.ms = Math.round(performance.now() - started);
  diag.preload = { ms: Math.round(performance.now() - started), timedOut, tasks: results };
}

/**
 * Fade the preload screen out; resolves once it is gone. 1.4.34: a Web Animation whose `finished` only resolves
 * after it really ran (a fixed timer could remove the screen before a busy main thread ever showed the fade).
 */
export async function hidePreload(): Promise<void> {
  const el = document.getElementById('preload');
  if (!el) {
    document.documentElement.classList.remove('preloading');
    return;
  }
  // The canvas below must have painted (and the screen's colour stops applying) before the fade starts.
  document.documentElement.classList.remove('preloading');
  await frames(2);
  let done: Promise<unknown>;
  if (typeof el.animate === 'function') {
    const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: 'ease', fill: 'forwards' });
    done = anim.finished.catch(() => undefined);
  } else {
    el.classList.add('out');
    done = new Promise((r) => window.setTimeout(r, FADE_MS));
  }
  // Safety net only (never shorter than the fade itself).
  await Promise.race([done, new Promise((r) => window.setTimeout(r, FADE_MS * 4))]);
  el.remove();
}

/** Resolve after `n` animation frames (lets the render loop build the scene first). */
export function frames(n: number): Promise<void> {
  return new Promise((r) => {
    const step = () => (n-- <= 0 ? r() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });
}
