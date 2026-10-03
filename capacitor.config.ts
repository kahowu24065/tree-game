import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sekaitree.game',
  appName: '世界之樹',
  webDir: 'dist',
  // 1.4.33: the web view's own colour before the page paints = the splash / preload sky blue (no white flash).
  backgroundColor: '#bee2f7',
  plugins: {
    // Show HKO warning pushes as normal notifications even while the app is open.
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    // Lets the Android app read xml.smg.gov.mo, which does not send CORS headers.
    CapacitorHttp: { enabled: true },
    // Monochrome status-bar icon (drawable-*/ic_stat_tree.png, from app-assets/ic_stat_tree.svg).
    LocalNotifications: { smallIcon: 'ic_stat_tree', iconColor: '#5E9E36' },
  },
};

export default config;
