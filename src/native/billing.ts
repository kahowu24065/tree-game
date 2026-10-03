/**
 * Store subscription via RevenueCat (StoreKit on iOS, Play Billing on Android). Public SDK keys come from build-time
 * env (VITE_RC_IOS_KEY / VITE_RC_ANDROID_KEY, never committed). Browsers and builds without a key: unavailable.
 */
import { ENTITLEMENT, LIFETIME_ID, PRODUCT_ID, type Plan } from '../premium';
import { isNative, platformName } from './platform';

export type BillingState = 'unavailable' | 'loading' | 'ready';

export interface BillingInfo {
  state: BillingState;
  active: boolean;
  /** Store-localised monthly price, e.g. "HK$8.00" (null until the offering loads / not set up). */
  price: string | null;
  /** 1.4.39: store-localised one-time lifetime price (null until loaded / not set up). */
  lifetimePrice: string | null;
  /** The active entitlement comes from the lifetime purchase (no expiry, no renewal). */
  lifetime: boolean;
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
    : `https://play.google.com/store/account/subscriptions?sku=${PRODUCT_ID}&package=app.sekaitree.game`;
}

let info: BillingInfo = { state: 'unavailable', active: false, price: null, lifetimePrice: null, lifetime: false, manageUrl: defaultManageUrl(), expires: null, willRenew: false };
const listeners: Listener[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rc: any = null;
// Monthly / lifetime: an offering package, else (lifetime only) the store product fetched by id.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pkg: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lifePkg: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lifeProduct: any = null;

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
  const lifetime = Boolean(ent) && (String(ent?.productIdentifier ?? '').startsWith(LIFETIME_ID) || (!ent?.expirationDate && !ent?.willRenew));
  emit({ active: Boolean(ent), lifetime, expires: ent?.expirationDate ?? null, willRenew: Boolean(ent?.willRenew), manageUrl: ci?.managementURL || defaultManageUrl() });
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
    const all: { packageType?: string; product?: { identifier?: string } }[] = cur?.availablePackages ?? [];
    pkg = cur?.monthly ?? all.find((p) => p.product?.identifier?.startsWith(PRODUCT_ID)) ?? null;
    lifePkg = cur?.lifetime ?? all.find((p) => p.packageType === 'LIFETIME' || p.product?.identifier?.startsWith(LIFETIME_ID)) ?? null;
  } catch {
    pkg = null;
    lifePkg = null;
  }
  if (!lifePkg) {
    try {
      const { products } = await rc.getProducts({ productIdentifiers: [LIFETIME_ID], type: 'NON_SUBSCRIPTION' });
      lifeProduct = products?.find((p: { identifier?: string }) => p.identifier?.startsWith(LIFETIME_ID)) ?? null;
    } catch {
      lifeProduct = null;
    }
  }
  emit({ price: pkg?.product?.priceString ?? null, lifetimePrice: (lifePkg?.product ?? lifeProduct)?.priceString ?? null });
}

/** Which plans have a store price (= can be bought now). Pure, for tests. */
export function planReady(i: Pick<BillingInfo, 'state' | 'price' | 'lifetimePrice'>, plan: Plan): boolean {
  return i.state === 'ready' && (plan === 'monthly' ? i.price : i.lifetimePrice) !== null;
}

export type PurchaseResult = 'ok' | 'cancelled' | 'failed' | 'unavailable';

export async function purchase(plan: Plan = 'monthly'): Promise<PurchaseResult> {
  if (!rc) return 'unavailable';
  const have = () => (plan === 'monthly' ? pkg : lifePkg ?? lifeProduct);
  if (!have()) await loadOffering();
  if (!have()) return 'unavailable';
  try {
    const res = plan === 'monthly' ? await rc.purchasePackage({ aPackage: pkg }) : lifePkg ? await rc.purchasePackage({ aPackage: lifePkg }) : await rc.purchaseStoreProduct({ product: lifeProduct });
    applyCustomer(res?.customerInfo);
    return info.active ? 'ok' : 'failed';
  } catch (e) {
    return (e as { userCancelled?: boolean })?.userCancelled ? 'cancelled' : 'failed';
  }
}

/** Restore (monthly and lifetime alike — both grant `premium`): 'ok' (entitlement active), 'none' or 'failed'. */
export async function restore(): Promise<'ok' | 'none' | 'failed' | 'unavailable'> {
  if (!rc) return 'unavailable';
  try {
    applyCustomer((await rc.restorePurchases()).customerInfo);
    return info.active ? 'ok' : 'none';
  } catch {
    return 'failed';
  }
}
