/**
 * 1.4.34 entry: let the preload screen paint and commit its CSS animations (compositor transform / opacity)
 * before the big game module is fetched and evaluated, so the sapling keeps swaying through that long task.
 */
/*
 * 1.4.36: no page zoom in the app. iOS WebKit pinch-zooms the page through its own gesture events (the 3D island
 * uses pointer events, which are unaffected); a double tap must not zoom either.
 */
for (const ev of ['gesturestart', 'gesturechange', 'gestureend'] as const) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

let started = false;
const go = () => {
  if (started) return;
  started = true;
  // 1.4.62: iOS ATT before the game module, the preload screen and onboarding. Other platforms resolve immediately.
  void import('./native/banner').then(({ requestAttAtLaunch }) => requestAttAtLaunch()).finally(() => {
    void import('./main');
  });
};
requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(go, 30)));
// A hidden page never runs rAF: start anyway.
window.setTimeout(go, 400);
