/**
 * 1.4.34 entry: let the preload screen paint and commit its CSS animations (compositor transform / opacity)
 * before the big game module is fetched and evaluated, so the sapling keeps swaying through that long task.
 */
let started = false;
const go = () => {
  if (started) return;
  started = true;
  void import('./main');
};
requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(go, 30)));
// A hidden page never runs rAF: start anyway.
window.setTimeout(go, 400);
