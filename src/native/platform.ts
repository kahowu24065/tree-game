import { Capacitor } from '@capacitor/core';

/** True only inside the Android (Capacitor) app; every native feature is a no-op in browsers. */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
