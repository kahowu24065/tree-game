import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * 開發者面板: on unless VITE_DEV_PANEL=0. When off, the panel module is swapped for an empty stub
 * so none of its code ships (the `if (DEV_PANEL)` branch in main.ts is also dropped).
 */
function devPanelSwitch(enabled: boolean): Plugin {
  return {
    name: 'dev-panel-switch',
    enforce: 'pre',
    resolveId(id) {
      if (!enabled && /\/dev\/panel(\.ts)?$/.test(id)) return '\0dev-panel-off';
      return null;
    },
    load(id) {
      if (id === '\0dev-panel-off') return 'export function mountDevPanel() { return () => {}; }';
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const devPanel = (process.env.VITE_DEV_PANEL ?? env.VITE_DEV_PANEL ?? '1') !== '0';
  return {
    base: './',
    plugins: [devPanelSwitch(devPanel)],
    define: { __DEV_PANEL__: JSON.stringify(devPanel) },
    server: { host: '0.0.0.0', port: 4327, strictPort: true },
    preview: { host: '0.0.0.0', port: 4327, strictPort: true },
    build: { outDir: 'dist', assetsDir: 'assets', chunkSizeWarningLimit: 1000 },
  };
});
