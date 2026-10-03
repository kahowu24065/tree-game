/**
 * Store subscription via RevenueCat (StoreKit on iOS, Play Billing on Android). Public SDK keys come from build-time
 * env (VITE_RC_IOS_KEY / VITE_RC_ANDROID_KEY, never committed). Browsers and builds without a key: unavailable.
 */
import { ENTITLEMENT, LIFETIME_ID, PLANS, PRODUCT_ID, YEARLY_ID, type Plan } from '../premium';
import { isNative, platformName } from './platform';

export type BillingState = 'unavailable' | 'loading' | 'ready';

export interface BillingInfo {
  state: BillingState;
  active: boolean;
  /** Store-localised monthly price, e.g. "HK$8.00" (null until the offering loads / not set up). */
  price: string | null;
  /** 1.4.40: store-localised yearly price (null until loaded / not set up). */
  yearlyPrice: string | null;
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

let info: BillingInfo = { state: 'unavailable', active: false, price: null, yearlyPrice: null, lifetimePrice: null, lifetime: false, manageUrl: defaultManageUrl(), expires: null, willRenew: false };
const listeners: Listener[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rc: any = null;
// Per plan: the offering package (Monthly / Annual / Lifetime), else the store product fetched by id.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pkgs: Record<Plan, any> = { monthly: null, yearly: null, lifetime: null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let products: Record<Plan, any> = { monthly: null, yearly: null, lifetime: null };
const PLAN_ID: Record<Plan, string> = { monthly: PRODUCT_ID, yearly: YEARLY_ID, lifetime: LIFETIME_ID };
const PLAN_PKG: Record<Plan, { key: 'monthly' | 'annual' | 'lifetime'; type: string }> = {
  monthly: { key: 'monthly', type: 'MONTHLY' },
  yearly: { key: 'annual', type: 'ANNUAL' },
  lifetime: { key: 'lifetime', type: 'LIFETIME' },
};

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
  pkgs = { monthly: null, yearly: null, lifetime: null };
  try {
    const cur = (await rc.getOfferings())?.current;
    const all: { packageType?: string; product?: { identifier?: string } }[] = cur?.availablePackages ?? [];
    for (const p of PLANS) {
      const { key, type } = PLAN_PKG[p];
      pkgs[p] = cur?.[key] ?? all.find((x) => x.packageType === type || x.product?.identifier?.startsWith(PLAN_ID[p])) ?? null;
    }
  } catch {
    /* no offering: fall back to product ids below */
  }
  for (const p of PLANS) {
    if (pkgs[p]) continue;
    try {
      const res = await rc.getProducts({ productIdentifiers: [PLAN_ID[p]], type: p === 'lifetime' ? 'NON_SUBSCRIPTION' : 'SUBSCRIPTION' });
      products[p] = res?.products?.find((x: { identifier?: string }) => x.identifier?.startsWith(PLAN_ID[p])) ?? null;
    } catch {
      products[p] = null;
    }
  }
  const price = (p: Plan): string | null => (pkgs[p]?.product ?? products[p])?.priceString ?? null;
  emit({ price: price('monthly'), yearlyPrice: price('yearly'), lifetimePrice: price('lifetime') });
}

/** Store price of a plan (null = not loaded / not set up). */
export function planPrice(i: Pick<BillingInfo, 'price' | 'yearlyPrice' | 'lifetimePrice'>, plan: Plan): string | null {
  return plan === 'monthly' ? i.price : plan === 'yearly' ? i.yearlyPrice : i.lifetimePrice;
}

/** Which plans have a store price (= can be bought now). Pure, for tests. */
export function planReady(i: Pick<BillingInfo, 'state' | 'price' | 'yearlyPrice' | 'lifetimePrice'>, plan: Plan): boolean {
  return i.state === 'ready' && planPrice(i, plan) !== null;
}

export type PurchaseResult = 'ok' | 'cancelled' | 'failed' | 'unavailable';

export async function purchase(plan: Plan = 'monthly'): Promise<PurchaseResult> {
  if (!rc) return 'unavailable';
  if (!pkgs[plan] && !products[plan]) await loadOffering();
  if (!pkgs[plan] && !products[plan]) return 'unavailable';
  try {
    const res = pkgs[plan] ? await rc.purchasePackage({ aPackage: pkgs[plan] }) : await rc.purchaseStoreProduct({ product: products[plan] });
    applyCustomer(res?.customerInfo);
    return info.active ? 'ok' : 'failed';
  } catch (e) {
    return (e as { userCancelled?: boolean })?.userCancelled ? 'cancelled' : 'failed';
  }
}

/** Restore (monthly, yearly and lifetime alike — both grant `premium`): 'ok' (entitlement active), 'none' or 'failed'. */
export async function restore(): Promise<'ok' | 'none' | 'failed' | 'unavailable'> {
  if (!rc) return 'unavailable';
  try {
    applyCustomer((await rc.restorePurchases()).customerInfo);
    return info.active ? 'ok' : 'none';
  } catch {
    return 'failed';
  }
}
