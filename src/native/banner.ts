import { registerPlugin } from '@capacitor/core';
import { isNative, platformName } from './platform';

interface TreeBannerPlugin {
  setVisible(options: { visible: boolean }): Promise<void>;
}

/** Android: the app's own AdMob banner view (TreeBannerPlugin.java). iOS: @capacitor-community/admob. */
const TreeBanner = registerPlugin<TreeBannerPlugin>('TreeBanner');

const env = import.meta.env as Record<string, string | undefined>;
/** Google's sample banner unit (always test ads) until the real iOS unit is set at build time (VITE_ADMOB_IOS_BANNER). */
export const IOS_TEST_BANNER = 'ca-app-pub-3940256099942544/2934735716';
export function iosBannerId(): string {
  return env.VITE_ADMOB_IOS_BANNER || IOS_TEST_BANNER;
}

let premium = false;
let want = false;
/** UMP consent (+ iOS ATT) finished: ads may be requested. */
let consentDone = false;
let consentStarted = false;
let iosShown = false;

/** Ads show only in the app, after consent, never for members. Pure, for tests. */
export function adsWanted(o: { native: boolean; visible: boolean; premium: boolean; consent: boolean }): boolean {
  return o.native && o.visible && !o.premium && o.consent;
}

function apply(): void {
  if (!isNative()) return;
  const on = adsWanted({ native: true, visible: want, premium, consent: consentDone });
  if (platformName() === 'ios') {
    void iosBanner(on);
    return;
  }
  void TreeBanner.setVisible({ visible: on }).catch(() => {});
}

async function iosBanner(on: boolean): Promise<void> {
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    if (on && !iosShown) {
      iosShown = true;
      await AdMob.showBanner({ adId: iosBannerId(), adSize: BannerAdSize.BANNER, position: BannerAdPosition.BOTTOM_CENTER, margin: 0, isTesting: iosBannerId() === IOS_TEST_BANNER });
    } else if (on) {
      await AdMob.resumeBanner();
    } else if (iosShown) {
      await AdMob.hideBanner();
    }
  } catch {
    /* no ad (offline / no fill / plugin missing) */
  }
}

/**
 * Once per launch: Google UMP consent form when required (EEA / UK etc.), then on iOS the App Tracking Transparency
 * prompt (NSUserTrackingUsageDescription). Refusing either still shows (non-personalised) ads. Members skip it.
 */
async function gatherConsent(): Promise<void> {
  if (consentStarted || !isNative() || premium) return;
  consentStarted = true;
  try {
    const { AdMob, AdmobConsentStatus } = await import('@capacitor-community/admob');
    if (platformName() === 'ios') await AdMob.initialize({});
    const info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) await AdMob.showConsentForm();
    if (platformName() === 'ios') {
      const t = await AdMob.trackingAuthorizationStatus();
      if (t.status === 'notDetermined') await AdMob.requestTrackingAuthorization();
    }
  } catch {
    /* consent SDK unavailable: Google serves limited ads by itself */
  }
  consentDone = true;
  apply();
}

/** Show or hide the banner (hidden during the opening / modals that cover it). Browsers keep the empty slot. */
export function syncBanner(visible: boolean): void {
  want = visible;
  if (visible) void gatherConsent();
  apply();
}

/** Members: no banner, no slot. */
export function setAdsPremium(on: boolean): void {
  premium = on;
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('no-ad', on);
  if (!on && want) void gatherConsent();
  apply();
}
