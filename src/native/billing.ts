/**
 * Store subscription via RevenueCat (StoreKit on iOS, Play Billing on Android). Public SDK keys come from build-time
 * env (VITE_RC_IOS_KEY / VITE_RC_ANDROID_KEY, never committed). Browsers and builds without a key: unavailable.
 */
import { ENTITLEMENT, PRODUCT_ID } from '../premium';
import { isNative, platformName } from './platform';

export type BillingState = 'unavailable' | 'loading' | 'ready';

export interface BillingInfo {
  state: BillingState;
  active: boolean;
  /** Store-localised price, e.g. "HK$8.00" (null until the offering loads). */
  price: string | null;
  /** Store page to manage / cancel (from RevenueCat, else the platform default). */
  manageUrl: string;
  /** Expiry / renewal (ISO) of the entitlement, when active. */
  expires: string | null;
  willRenew: boolean;
}

type Listener = (info: BillingInfo) => void;

const env = import.meta.env as Record<string, string | undefined>;

export function billingKey(platform = platformName()): string {
  if (platform === 'ios') return env.VITE_RC_IOS_KEY ?? '';
  if (platform === 'android') return env.VITE_RC_ANDROID_KEY ?? '';
  return '';
}

export function defaultManageUrl(platform = platformName()): string {
  return platform === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : `https://play.google.com/store/account/subscriptions?sku=${PRODUCT_ID}&package=io.github.kahowu24065.treegame`;
}

let info: BillingInfo = { state: 'unavailable', active: false, price: null, manageUrl: defaultManageUrl(), expires: null, willRenew: false };
const listeners: Listener[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rc: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pkg: any = null;

function emit(patch: Partial<BillingInfo>): void {
  info = { ...info, ...patch };
  for (const l of listeners) l(info);
}

export function billingInfo(): BillingInfo {
  return info;
}

export function onBilling(l: Listener): void {
  listeners.push(l);
}

/** Subscription can be bought in this build (native app with a RevenueCat key). */
export function billingSupported(): boolean {
  return isNative() && Boolean(billingKey());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCustomer(ci: any): void {
  const ent = ci?.entitlements?.active?.[ENTITLEMENT];
  emit({ active: Boolean(ent), expires: ent?.expirationDate ?? null, willRenew: Boolean(ent?.willRenew), manageUrl: ci?.managementURL || defaultManageUrl() });
}

export async function initBilling(): Promise<void> {
  if (!billingSupported() || rc) return;
  emit({ state: 'loading' });
  try {
    const mod = await import('@revenuecat/purchases-capacitor');
    rc = mod.Purchases;
    await rc.configure({ apiKey: billingKey() });
    await rc.addCustomerInfoUpdateListener((ci: unknown) => applyCustomer(ci));
    applyCustomer((await rc.getCustomerInfo()).customerInfo);
    await loadOffering();
    emit({ state: 'ready' });
  } catch {
    emit({ state: rc ? 'ready' : 'unavailable' });
  }
}

async function loadOffering(): Promise<void> {
  try {
    const offerings = await rc.getOfferings();
    const cur = offerings?.current;
    pkg = cur?.monthly ?? cur?.availablePackages?.find((p: { product?: { identifier?: string } }) => p.product?.identifier?.startsWith(PRODUCT_ID)) ?? cur?.availablePackages?.[0] ?? null;
    emit({ price: pkg?.product?.priceString ?? null });
  } catch {
    pkg = null;
  }
}

export type PurchaseResult = 'ok' | 'cancelled' | 'failed' | 'unavailable';

export async function purchase(): Promise<PurchaseResult> {
  if (!rc) return 'unavailable';
  if (!pkg) await loadOffering();
  if (!pkg) return 'unavailable';
  try {
    const res = await rc.purchasePackage({ aPackage: pkg });
    applyCustomer(res?.customerInfo);
    return info.active ? 'ok' : 'failed';
  } catch (e) {
    return (e as { userCancelled?: boolean })?.userCancelled ? 'cancelled' : 'failed';
  }
}

/** Restore: 'ok' (entitlement active), 'none' (nothing to restore) or 'failed'. */
export async function restore(): Promise<'ok' | 'none' | 'failed' | 'unavailable'> {
  if (!rc) return 'unavailable';
  try {
    applyCustomer((await rc.restorePurchases()).customerInfo);
    return info.active ? 'ok' : 'none';
  } catch {
    return 'failed';
  }
}
