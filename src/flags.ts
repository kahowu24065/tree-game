/**
 * 開發者面板開關 (dev phase only) — the single switch.
 * On by default so the live site has it. For a release build run `VITE_DEV_PANEL=0 npm run build`
 * (or set VITE_DEV_PANEL=0 in .env.production). Vite then replaces __DEV_PANEL__ with `false`,
 * the panel code is dropped from the bundle, and manual-weather settings are ignored.
 */
declare const __DEV_PANEL__: boolean;
export const DEV_PANEL: boolean = typeof __DEV_PANEL__ === 'boolean' ? __DEV_PANEL__ : true;
