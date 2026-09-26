import { Geolocation } from '@capacitor/geolocation';

const granted = (p: { location: string; coarseLocation: string }) => p.location === 'granted' || p.coarseLocation === 'granted';

/**
 * Native position (coarse is fine). Resolves null when permission is refused or the fix fails / times out.
 * The timeout covers the fix only, not the time the player spends on the permission prompt.
 */
export async function nativePosition(timeoutMs: number): Promise<{ lat: number; lon: number } | null> {
  try {
    let perm = await Geolocation.checkPermissions();
    if (!granted(perm) && perm.coarseLocation !== 'denied') perm = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
    if (!granted(perm)) return null;
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const fix = Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: Math.max(1000, timeoutMs - 500), maximumAge: 30 * 60 * 1000 })
      .then((pos) => ({ lat: pos.coords.latitude, lon: pos.coords.longitude }))
      .catch(() => null);
    return await Promise.race([fix, timeout]);
  } catch {
    return null;
  }
}
