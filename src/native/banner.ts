import { registerPlugin } from '@capacitor/core';
import { isNative, platformName } from './platform';
import { permsReady } from './permGate';
import { shouldRequestAtt } from './att';

interface TreeBannerPlugin {
  setVisible(options: { visible: boolean }): Promise<void>;
  addListener(
    eventName: 'adLoaded' | 'adFailed',
    listenerFunc: (data: { code?: number; message?: string }) => void,
  ): Promise<{ remove: () => void }>;
}

/** Android: TreeBannerPlugin.java. iOS: @capacitor-community/admob. */
const TreeBanner = registerPlugin<TreeBannerPlugin>('TreeBanner');

const env = import.meta.env as Record<string, string | undefined>;
/** Google's sample banner unit until VITE_ADMOB_IOS_BANNER is set at build time. */
export const IOS_TEST_BANNER = 'ca-app-pub-3940256099942544/2934735716';
export function iosBannerId(): string {
  return env.VITE_ADMOB_IOS_BANNER || IOS_TEST_BANNER;
}

let premium = false;
let want = false;
/** UMP consent finished: ads may be requested. */
let consentDone = false;
let consentStarted = false;
let iosShown = false;
/** True after a banner ad actually loaded. */
let filled = false;
let listenersReady = false;

/** Ads show only in the app, after consent, never for members. */
export function adsWanted(o: { native: boolean; visible: boolean; premium: boolean; consent: boolean }): boolean {
  return o.native && o.visible && !o.premium && o.consent;
}

/** 1.4.72: hide empty「廣告」until fill; web never gets ad-filled. */
function syncSlotClass(): void {
  if (typeof document === 'undefined') return;
  const show = filled && !premium;
  document.documentElement.classList.toggle('ad-filled', show);
  document.documentElement.classList.toggle('no-ad', premium || !show);
}

function setFilled(on: boolean): void {
  filled = on;
  syncSlotClass();
}

async function ensureListeners(): Promise<void> {
  if (listenersReady || !isNative()) return;
  listenersReady = true;
  try {
    if (platformName() === 'ios') {
      const { AdMob, BannerAdPluginEvents } = await import('@capacitor-community/admob');
      await AdMob.addListener(BannerAdPluginEvents.Loaded, () => setFilled(true));
      await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
        setFilled(false);
        iosShown = false;
        void AdMob.hideBanner().catch(() => {});
      });
    } else {
      await TreeBanner.addListener('adLoaded', () => setFilled(true));
      await TreeBanner.addListener('adFailed', () => {
        setFilled(false);
        void TreeBanner.setVisible({ visible: false }).catch(() => {});
      });
    }
  } catch {
    /* events unavailable */
  }
}

function apply(): void {
  syncSlotClass();
  if (!isNative()) {
    setFilled(false);
    return;
  }
  const on = adsWanted({ native: true, visible: want, premium, consent: consentDone });
  if (!on) {
    setFilled(false);
    if (platformName() === 'ios') void iosBanner(false);
    else void TreeBanner.setVisible({ visible: false }).catch(() => {});
    return;
  }
  void ensureListeners().then(() => {
    if (platformName() === 'ios') void iosBanner(true);
    else void TreeBanner.setVisible({ visible: true }).catch(() => {});
  });
}

async function iosBanner(on: boolean): Promise<void> {
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    if (on && !iosShown) {
      iosShown = true;
      // AdMob iOS pins to safeAreaLayoutGuide.bottom; margin:0 avoids double-counting --safe-b.
      await AdMob.showBanner({
        adId: iosBannerId(),
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: iosBannerId() === IOS_TEST_BANNER,
      });
    } else if (on) {
      await AdMob.resumeBanner();
    } else if (iosShown) {
      await AdMob.hideBanner();
      iosShown = false;
    }
  } catch {
    setFilled(false);
    iosShown = false;
  }
}

/**
 * Once per launch, after onboarding: Google UMP when required.
 * 1.4.62: ATT is at launch (requestAttAtLaunch), not here.
 */
async function gatherConsent(): Promise<void> {
  if (consentStarted || !isNative() || premium || !permsReady()) return;
  consentStarted = true;
  try {
    const { AdMob, AdmobConsentStatus } = await import('@capacitor-community/admob');
    if (platformName() === 'ios') await AdMob.initialize({});
    const info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) await AdMob.showConsentForm();
  } catch {
    /* Android / SDK missing: still allow requests */
  }
  consentDone = true;
  apply();
}

let attStarted = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitUntilActive(): Promise<void> {
  try {
    const { App } = await import('@capacitor/app');
    if ((await App.getState()).isActive && document.visibilityState === 'visible') return;
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, 2500);
      void App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) done();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') done();
      });
    });
  } catch {
    /* plugin missing */
  }
}

/** 1.4.62: iOS ATT at launch, before the first screen and before AdMob starts. */
export async function requestAttAtLaunch(): Promise<void> {
  if (attStarted || !isNative() || !shouldRequestAtt(platformName(), 'notDetermined')) return;
  attStarted = true;
  const preload = document.getElementById('preload');
  const visibility = preload?.style.visibility ?? '';
  try {
    await waitUntilActive();
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (preload) preload.style.visibility = 'hidden';
    const { AdMob } = await import('@capacitor-community/admob');
    const ask = async () => {
      const t = await AdMob.trackingAuthorizationStatus();
      if (shouldRequestAtt('ios', t.status)) await AdMob.requestTrackingAuthorization();
    };
    await ask();
    if ((await AdMob.trackingAuthorizationStatus()).status === 'notDetermined') {
      await delay(600);
      await ask();
    }
  } catch {
    /* no ATT */
  } finally {
    if (preload) preload.style.visibility = visibility;
  }
}

/**
 * 1.4.72: request ads when the game wants the banner; HTML slot stays hidden until onAdLoaded.
 * Web never shows the empty grey「廣告」bar.
 */
export function syncBanner(visible: boolean): void {
  want = visible;
  if (!isNative()) {
    setFilled(false);
    return;
  }
  if (visible) {
    // Android (no UMP path required): allow load after opening.
    if (platformName() !== 'ios' && !consentDone) consentDone = true;
    void gatherConsent();
  }
  apply();
}

/** 1.4.45: onboarding finished — run UMP if the banner is wanted. */
export function retryConsent(): void {
  consentStarted = false;
  if (want) void gatherConsent();
}

/** Members: no banner, no slot. */
export function setAdsPremium(on: boolean): void {
  premium = on;
  if (on) setFilled(false);
  syncSlotClass();
  if (!on && want) {
    consentStarted = false;
    void gatherConsent();
  }
  apply();
}

/** Call once at boot so web/app start without an empty ad strip. */
export function initAdSlot(): void {
  setFilled(false);
}
