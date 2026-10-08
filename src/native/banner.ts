import { registerPlugin } from '@capacitor/core';
import { isNative, platformName } from './platform';
import { permsReady } from './permGate';
import { shouldRequestAtt } from './att';

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
 * Once per launch, after onboarding: Google UMP consent form when required (EEA / UK etc.).
 * Refusing still shows non-personalised ads. Members skip it.
 * 1.4.62: the iOS ATT prompt is NOT here. It runs at launch (requestAttAtLaunch), before this and before AdMob starts.
 */
async function gatherConsent(): Promise<void> {
  // 1.4.45: no UMP form before onboarding is over (retryConsent() runs it after the other prompts).
  if (consentStarted || !isNative() || premium || !permsReady()) return;
  consentStarted = true;
  try {
    const { AdMob, AdmobConsentStatus } = await import('@capacitor-community/admob');
    if (platformName() === 'ios') await AdMob.initialize({});
    const info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) await AdMob.showConsentForm();
  } catch {
    /* consent SDK unavailable: Google serves limited ads by itself */
  }
  consentDone = true;
  apply();
}

let attStarted = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** ATT is ignored (and its callback may never fire) unless the app is already active. */
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
    /* plugin missing: the two frames below are enough */
  }
}

/**
 * 1.4.62: iOS App Tracking Transparency at launch, before the first screen and before any ad SDK starts.
 * Once per install (only while the status is notDetermined). The HTML splash is hidden so it cannot cover the dialog.
 * One retry covers the case where iOS drops a request made a moment too early.
 */
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
    /* no ATT on this device: carry on, still without starting the ad SDK here */
  } finally {
    if (preload) preload.style.visibility = visibility;
  }
}

/** Show or hide the banner (hidden during the opening / modals that cover it). Browsers keep the empty slot. */
export function syncBanner(visible: boolean): void {
  want = visible;
  if (visible) void gatherConsent();
  apply();
}

/** 1.4.45: onboarding just finished — run the UMP step now if the banner is wanted. ATT already ran at launch. */
export function retryConsent(): void {
  if (want) void gatherConsent();
}

/** Members: no banner, no slot. */
export function setAdsPremium(on: boolean): void {
  premium = on;
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('no-ad', on);
  if (!on && want) void gatherConsent();
  apply();
}
