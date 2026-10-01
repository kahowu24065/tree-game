import { afterEach, describe, expect, it } from 'vitest';
import { LOCALES, t, useLocale } from '../src/i18n';
import { PREMIUM_EXTRAS, activeSkin, claimMonthlySkin, diaryByMonth, emptyPremium, equipSkin, noteDiary, parsePremium, settleDiary, SKINS, skinOfMonth } from '../src/premium';
import { adsWanted } from '../src/native/banner';
import { billingKey, billingSupported, defaultManageUrl, type BillingInfo } from '../src/native/billing';
import { APPLE_EULA_URL, premiumModal, premiumRow, PRIVACY_URL, TERMS_URL, weatherAlbumModal } from '../src/premiumUi';

const billing = (o: Partial<BillingInfo> = {}): BillingInfo => ({ state: 'ready', active: false, price: 'HK$8.00', manageUrl: 'https://apps.apple.com/account/subscriptions', expires: null, willRenew: false, ...o });

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
