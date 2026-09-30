import { registerPlugin } from '@capacitor/core';
import { isNative } from './platform';

interface TreeBannerPlugin {
  setVisible(options: { visible: boolean }): Promise<void>;
}

const TreeBanner = registerPlugin<TreeBannerPlugin>('TreeBanner');

/** Show or hide the Android banner. Browsers keep the empty slot. */
export function syncBanner(visible: boolean): void {
  if (!isNative()) return;
  void TreeBanner.setVisible({ visible }).catch(() => {});
}
