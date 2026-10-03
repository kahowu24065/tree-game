import { afterEach, describe, expect, it } from 'vitest';
import { LOCALES, t, useLocale } from '../src/i18n';
import { PREMIUM_EXTRAS, activeSkin, claimMonthlySkin, diaryByMonth, emptyPremium, equipSkin, noteDiary, parsePremium, settleDiary, SKINS, skinOfMonth } from '../src/premium';
import { adsWanted } from '../src/native/banner';
import { planReady, billingKey, billingSupported, defaultManageUrl, type BillingInfo } from '../src/native/billing';
import { APPLE_EULA_URL, priceLine, premiumModal, premiumRow, PRIVACY_URL, TERMS_URL, weatherAlbumModal } from '../src/premiumUi';

/** Price line with its soft line-break hints (premiumUi). */
const w = (s: string) => priceLine(s);
const billing = (o: Partial<BillingInfo> = {}): BillingInfo => ({ state: 'ready', active: false, price: 'HK$8.00', yearlyPrice: 'HK$80.00', lifetimePrice: 'HK$88.00', lifetime: false, manageUrl: 'https://apps.apple.com/account/subscriptions', expires: null, willRenew: false, ...o });

afterEach(() => useLocale('zh-HK'));

describe('premium skins', () => {
  it('one limited skin per month, 12 in all', () => {
    expect(SKINS).toHaveLength(12);
    expect(new Set(SKINS.map((s) => s.month)).size).toBe(12);
    expect(skinOfMonth('2026-10-01').id).toBe('maple');
    expect(skinOfMonth('2026-01-31').id).toBe('plum');
  });
  it('members collect the current month once; only owned skins equip; lapsed members show the natural colour', () => {
    const p = emptyPremium();
    expect(claimMonthlySkin(p, '2026-10-05', true)).toBeNull();
    p.active = true;
    expect(claimMonthlySkin(p, '2026-10-05', true)?.id).toBe('maple');
    expect(claimMonthlySkin(p, '2026-10-20', true)).toBeNull();
    expect(equipSkin(p, 'ginkgo')).toBe(false);
    expect(equipSkin(p, 'maple')).toBe(true);
    expect(activeSkin(p, true)?.id).toBe('maple');
    expect(activeSkin(p)).toBeNull();
    p.active = false;
    expect(activeSkin(p, true)).toBeNull();
    expect(p.skins).toEqual(['maple']);
    expect(equipSkin(p, null)).toBe(true);
  });
  it('parsePremium drops unknown skins and survives bad JSON', () => {
    expect(parsePremium('{bad').skins).toEqual([]);
    const p = parsePremium(JSON.stringify({ active: true, skins: ['maple', 'nope'], equipped: 'nope', diary: [{ date: '2026-10-01' }, null] }));
    expect(p.skins).toEqual(['maple']);
    expect(p.equipped).toBeNull();
    expect(p.diary).toHaveLength(1);
  });
});

describe('real-weather album', () => {
  it('keeps the day high / low and events, then the settlement adds health and height', () => {
    const p = emptyPremium();
    noteDiary(p, { date: '2026-10-01', place: 'Sha Tin', tempC: 27.4, code: 2, events: [], treeName: 'A' }, true);
    noteDiary(p, { date: '2026-10-01', place: 'Sha Tin', tempC: 31.6, code: 61, events: ['hot'], treeName: 'A' }, true);
    noteDiary(p, { date: '2026-10-02', place: 'Sha Tin', tempC: 24, code: 1, hkoIcon: 51, events: [], treeName: 'A' }, true);
    const d = p.diary[0]!;
    expect([d.tMin, d.tMax, d.code, d.events]).toEqual([27, 32, 61, ['hot']]);
    expect(settleDiary(p, { date: '2026-10-01', events: ['hot', 'rainstorm'], hAfter: 81.6, heightAfter: 120 })).toBe(true);
    expect(d.health).toBe(82);
    expect(d.events).toEqual(['hot', 'rainstorm']);
    expect(settleDiary(p, { date: '2026-09-30', events: [], hAfter: 1, heightAfter: 1 })).toBe(false);
    const months = diaryByMonth(p);
    expect(months[0]!.days.map((x) => x.date)).toEqual(['2026-10-02', '2026-10-01']);
    expect(weatherAlbumModal(p, false)).toContain(t('prem.albumLocked', { n: 2 }));
    expect(weatherAlbumModal(p, true)).toContain('Sha Tin');
  });
});

describe('ads and billing gates', () => {
  it('ads only in the app, after consent, never for members', () => {
    expect(adsWanted({ native: true, visible: true, premium: false, consent: true })).toBe(true);
    expect(adsWanted({ native: true, visible: true, premium: true, consent: true })).toBe(false);
    expect(adsWanted({ native: true, visible: true, premium: false, consent: false })).toBe(false);
    expect(adsWanted({ native: false, visible: true, premium: false, consent: true })).toBe(false);
  });
  it('no subscription on the web or without a build-time key', () => {
    expect(billingSupported()).toBe(false);
    expect(billingKey('web')).toBe('');
    expect(defaultManageUrl('android')).toContain('sku=sekai_tree_monthly');
  });
});

describe('paywall', () => {
  it('web: no buy button, "available in the app"', () => {
    expect(premiumRow('web', false)).toContain(t('prem.rowWeb'));
    const html = premiumModal({ mode: 'web', store: emptyPremium(), billing: billing({ state: 'unavailable' }), today: '2026-10-01' });
    expect(html).not.toContain('premium-buy');
    expect(html).toContain(t('prem.webOnly'));
  });
  it.each(LOCALES)('%s: iOS paywall has price, restore, manage, auto-renew disclosure, EULA + privacy links', (loc) => {
    useLocale(loc);
    const html = premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing(), today: '2026-10-01' });
    for (const s of ['data-action="premium-buy"', 'data-action="premium-restore"', 'apps.apple.com/account/subscriptions', APPLE_EULA_URL, PRIVACY_URL, 'HK$8.00']) expect(html).toContain(s);
    expect(html).toContain(t('prem.disclosureIos', { price: 'HK$8.00' }).slice(0, 12).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
    expect(html).toContain(t('prem.lead'));
    const android = premiumModal({ mode: 'android', store: emptyPremium(), billing: billing({ manageUrl: defaultManageUrl('android') }), today: '2026-10-01' });
    expect(android).toContain(TERMS_URL);
  });
  it('buy disabled while the store is loading; members get skins + album, no buy button', () => {
    expect(premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing({ state: 'loading', price: null }), today: '2026-10-01' })).toContain('aria-disabled="true"');
    const p = emptyPremium();
    p.active = true;
    claimMonthlySkin(p, '2026-10-01', true);
    const html = premiumModal({ mode: 'ios', store: p, billing: billing({ active: true, expires: '2026-11-01T00:00:00Z', willRenew: true }), today: '2026-10-01', extras: true });
    expect(html).not.toContain('premium-buy');
    expect(html).toContain('data-skin="maple"');
    expect(html).toContain('data-action="weather-album"');
  });
  it.each(LOCALES)('%s: extras flag off → only "no ads": no skins, no album, nothing recorded', (loc) => {
    useLocale(loc);
    expect(PREMIUM_EXTRAS).toBe(false);
    const p = emptyPremium();
    p.active = true;
    expect(claimMonthlySkin(p, '2026-10-01')).toBeNull();
    noteDiary(p, { date: '2026-10-01', place: 'X', tempC: 20, code: 1, events: [], treeName: 'A' });
    expect(p.diary).toHaveLength(0);
    for (const html of [
      premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing(), today: '2026-10-01' }),
      premiumModal({ mode: 'ios', store: p, billing: billing({ active: true }), today: '2026-10-01' }),
      premiumModal({ mode: 'web', store: emptyPremium(), billing: billing({ state: 'unavailable' }), today: '2026-10-01' }),
    ]) {
      expect(html).toContain(t('prem.perkAds'));
      for (const bad of ['data-skin', 'weather-album', t('prem.skinsTitle'), t('prem.albumTitle'), t('prem.perkAlbum'), t('skin.maple')]) expect(html).not.toContain(bad);
    }
  });
});

describe('1.4.37 paywall before the store is set up (no RevenueCat key)', () => {
  it.each(LOCALES)('%s: full iOS paywall, plans named without a price, enabled buttons, restore / manage / disclosure / EULA + privacy, no "store unavailable" line', (loc) => {
    useLocale(loc);
    const html = premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing({ state: 'unavailable', price: null, yearlyPrice: null, lifetimePrice: null }), today: '2026-10-03', notYet: true });
    for (const s of ['data-action="premium-buy"', 'data-action="premium-restore"', 'apps.apple.com/account/subscriptions', APPLE_EULA_URL, PRIVACY_URL]) expect(html).toContain(s);
    expect(html).toContain(t('prem.lead'));
    expect(html).not.toContain('HK$');
    expect(html).toContain(`>${t('prem.planMonthly')}</button>`);
    expect(html).toContain(`>${t('prem.planLifetime')}</button>`);
    expect(html).toContain(t('prem.perkAds'));
    expect(html).not.toContain('aria-disabled');
    expect(html).not.toContain(t('prem.unavailable'));
    expect(t('prem.notYet')).not.toBe('prem.notYet');
    useLocale('zh-HK');
  });
  it('web keeps "subscribe in the app"', () => {
    const html = premiumModal({ mode: 'web', store: emptyPremium(), billing: billing({ state: 'unavailable', price: null }), today: '2026-10-03', notYet: false });
    expect(html).not.toContain('premium-buy');
  });
});

describe('1.4.39 monthly + lifetime plans, store prices only', () => {
  it.each(LOCALES)('%s: two buttons with the store prices, perks incl. "more perks later", disclosure with price + one-time note', (loc) => {
    useLocale(loc);
    const html = premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing({ price: 'NT$30', yearlyPrice: null, lifetimePrice: 'NT$330' }), today: '2026-10-03' });
    expect(html).toContain('data-plan="monthly"');
    expect(html).toContain('data-plan="lifetime"');
    expect(html).toContain(`>${t('prem.planMonthly')}<small class="prem-price">${w(t('prem.priceMonthly', { price: 'NT$30' }))}</small></button>`);
    expect(html).toContain(`>${t('prem.planLifetime')}<small class="prem-price">${w(t('prem.priceOnce', { price: 'NT$330' }))}</small></button>`);
    expect(html).toContain(`<li>${t('prem.perkAds')}</li><li>${t('prem.perkMore')}</li>`);
    expect(html).toContain(t('prem.priceMonthly', { price: 'NT$30' }));
    expect(html).toContain(t('prem.lifetimeNote').slice(0, 8).replace(/"/g, '&quot;'));
    expect(html).not.toContain('HK$');
    expect(html).not.toContain('{per}');
    useLocale('zh-HK');
  });
  it('a plan whose price is not loaded is named only; buying needs a loaded price', () => {
    const b = billing({ lifetimePrice: null });
    const html = premiumModal({ mode: 'ios', store: emptyPremium(), billing: b, today: '2026-10-03' });
    expect(html).toContain(`>${t('prem.planLifetime')}</button>`);
    expect(planReady(b, 'monthly')).toBe(true);
    expect(planReady(b, 'lifetime')).toBe(false);
    expect(planReady(billing({ state: 'loading' }), 'monthly')).toBe(false);
  });
  it('lifetime member: status says lifetime, no buy buttons', () => {
    const p = emptyPremium();
    p.active = true;
    const html = premiumModal({ mode: 'ios', store: p, billing: billing({ active: true, lifetime: true }), today: '2026-10-03' });
    expect(html).toContain(t('prem.lifetimeActive'));
    expect(html).not.toContain('premium-buy');
  });
});

describe('1.4.40 yearly plan', () => {
  it.each(LOCALES)('%s: 月費 / 年費 / 永久 in that order with store prices; disclosure lists monthly + yearly prices', (loc) => {
    useLocale(loc);
    const html = premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing({ price: 'NT$30', yearlyPrice: 'NT$290', lifetimePrice: 'NT$330' }), today: '2026-10-03' });
    const order = ['monthly', 'yearly', 'lifetime'].map((p) => html.indexOf(`data-plan="${p}"`));
    expect(order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1]))).toBe(true);
    expect(html).toContain(`>${t('prem.planYearly')}<small class="prem-price">${w(t('prem.priceYearly', { price: 'NT$290' }))}</small></button>`);
    const list = [t('prem.priceMonthly', { price: 'NT$30' }), t('prem.priceYearly', { price: 'NT$290' })].join(t('prem.listSep'));
    expect(html).toContain(t('prem.perList', { list }).trim());
    expect(html).not.toContain('{per}');
    useLocale('zh-HK');
  });
  it('yearly without a price: name only, not buyable; no price fragment at all when nothing loaded', () => {
    const b = billing({ yearlyPrice: null });
    expect(premiumModal({ mode: 'ios', store: emptyPremium(), billing: b, today: '2026-10-03' })).toContain(`>${t('prem.planYearly')}</button>`);
    expect(planReady(b, 'yearly')).toBe(false);
    expect(planReady(b, 'monthly')).toBe(true);
    const none = premiumModal({ mode: 'ios', store: emptyPremium(), billing: billing({ price: null, yearlyPrice: null, lifetimePrice: null }), today: '2026-10-03', notYet: true });
    expect(none).toContain(t('prem.disclosureIos', { per: '' }).slice(0, 20).replace(/"/g, '&quot;'));
  });
});
