import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.kahowu24065.treegame',
  appName: '世界之樹',
  webDir: 'dist',
  plugins: {
    // Show HKO warning pushes as normal notifications even while the app is open.
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    // Monochrome status-bar icon (android/app/src/main/res/drawable/ic_stat_tree.xml).
    LocalNotifications: { smallIcon: 'ic_stat_tree', iconColor: '#2E7D32' },
  },
};

export default config;
