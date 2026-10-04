/** 設定 → 世界之樹 Premium: settings row, paywall / member page (skins, album link) and the 真實天氣紀念冊. HTML only. */
import { eventLabel } from './labels';
import { getLocale, t as tl } from './i18n';
import { weatherArt } from './icons';
import { PREMIUM_EXTRAS, SKINS, diaryByMonth, skinName, skinOfMonth, type Plan, type PremiumStore } from './premium';
import { esc, formatHeight } from './util';
import type { BillingInfo } from './native/billing';

import { APPLE_EULA_URL, PRIVACY_URL, TERMS_URL } from './legal';
export { APPLE_EULA_URL, PRIVACY_URL, TERMS_URL };

export type PremiumMode = 'web' | 'ios' | 'android';

const link = (href: string, label: string) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;

function monthShort(m: number): string {
  try {
    return new Intl.DateTimeFormat(getLocale(), { month: 'short' }).format(new Date(2026, m - 1, 15));
  } catch {
    return String(m);
  }
}

/** Row inside 設定 (the {p5} slot). */
export function premiumRow(mode: PremiumMode, active: boolean): string {
  const right =
    mode === 'web'
      ? `<span class="prem-note">${esc(tl('prem.rowWeb'))}</span>`
      : `<button type="button" class="ghost" data-action="premium">${esc(active ? tl('prem.rowOn') : tl('prem.rowOff'))}</button>`;
  return `<div class="setting-row prem-row"><span>${esc(tl('prem.row'))}</span>${right}</div>`;
}

/** Crown with a leaf on top, for the Premium card (stroke = currentColor). */
const CROWN_LEAF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17.5 3 8.5l4.6 3.6L12 6l4.4 6.1L21 8.5l-1 9z" fill="currentColor" fill-opacity=".22"/><path d="M4.5 20.5h15"/><path d="M12 6c0-2.1 1.3-3.4 3.4-3.6-.1 2.1-1.4 3.4-3.4 3.6z" fill="currentColor" fill-opacity=".35"/></svg>';

/**
 * 1.4.49: card at the very top of 設定 (under the heading). Not a member: title + 「移除廣告・支持開發」 + 「查看方案」, the whole
 * card opens the paywall. Member: one compact line 「你已經係 世界之樹 Premium 會員 ✓」 (still opens the member page).
 */
export function premiumCard(mode: PremiumMode, active: boolean): string {
  const icon = `<span class="prem-card-icon">${CROWN_LEAF}</span>`;
  if (active) {
    return `<button type="button" class="prem-card on" data-action="premium">${icon}<span class="prem-card-text"><b>${esc(tl('prem.cardOn'))}</b></span></button>`;
  }
  const cta = mode === 'web' ? `<span class="prem-note">${esc(tl('prem.rowWeb'))}</span>` : `<span class="prem-card-cta">${esc(tl('prem.cardCta'))}</span>`;
  return `<button type="button" class="prem-card" data-action="premium" aria-label="${esc(tl('prem.cardAria'))}">${icon}<span class="prem-card-text"><b>${esc(tl('prem.title'))}</b><small>${esc(tl('prem.cardSub'))}</small></span>${cta}</button>`;
}

function skinSwatch(rgb: [number, number, number]): string {
  const c = rgb.map((v) => Math.round(v * 255)).join(',');
  return `<i class="skin-dot" style="background:rgb(${c})"></i>`;
}

function skinsSection(p: PremiumStore, today: string): string {
  const now = skinOfMonth(today);
  const none = `<button type="button" class="skin ${p.equipped ? '' : 'on'}" data-skin="">${'<i class="skin-dot plain"></i>'}<span>${esc(tl('prem.skinNone'))}</span></button>`;
  const cards = SKINS.map((s) => {
    const owned = p.skins.includes(s.id);
    const cls = ['skin', p.equipped === s.id ? 'on' : '', owned ? '' : 'locked'].join(' ');
    const tag = s.id === now.id ? tl('prem.skinThisMonth') : owned ? '' : monthShort(s.month);
    const attr = owned ? `data-skin="${s.id}"` : 'aria-disabled="true"';
    return `<button type="button" class="${cls}" ${attr}>${skinSwatch(s.rgb)}<span>${esc(skinName(s.id))}</span>${tag ? `<small>${esc(tag)}</small>` : ''}</button>`;
  }).join('');
  return `<h3 class="sub">${esc(tl('prem.skinsTitle'))}</h3><p class="prem-small">${esc(tl('prem.skinsHint'))}</p><div class="skins">${none}${cards}</div>`;
}

function legal(mode: PremiumMode): string {
  const terms = mode === 'ios' ? APPLE_EULA_URL : TERMS_URL;
  // iOS: Apple's standard EULA is the subscription's Terms of Use (named as such for App Review).
  const label = mode === 'ios' ? `${tl('prem.terms')} (EULA)` : tl('prem.terms');
  return `<p class="prem-legal">${link(terms, label)}${link(PRIVACY_URL, tl('prem.privacy'))}</p>`;
}

function dateText(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(getLocale(), { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

/**
 * Paywall (not a member) or member page. 1.4.39/1.4.40: three plans side by side — 月費 / 年費 (auto-renewing) and 永久 (one-time) —
 * each labelled with the store's own localised price; never a hard-coded amount. A plan without a loaded price is
 * shown by name only and says "not open yet" when tapped (main.ts), as does every plan in a build without a store
 * key (`notYet`, 1.4.37: the full paywall is still shown, e.g. for the App Review screenshot).
 */
/** Store price + unit; in a narrow button the unit ("/月", "（一次性）") drops to its own line whole. */
export function priceLine(s: string): string {
  const m = /^(.*?)([/／・（].*)$/.exec(s);
  return m ? `${esc(m[1])}<wbr><span class="nw">${esc(m[2])}</span>` : esc(s);
}

export function premiumModal(o: { mode: PremiumMode; store: PremiumStore; billing: BillingInfo; today: string; busy?: boolean; extras?: boolean; notYet?: boolean }): string {
  const { mode, store, billing } = o;
  const extras = o.extras ?? PREMIUM_EXTRAS;
  const extraPerks = extras ? `<li>${esc(tl('prem.perkSkins', { name: skinName(skinOfMonth(o.today).id) }))}</li><li>${esc(tl('prem.perkAlbum'))}</li>` : '';
  const perks = `<ul class="prem-perks"><li>${esc(tl('prem.perkAds'))}</li>${extraPerks}<li>${esc(tl('prem.perkMore'))}</li></ul><p class="prem-small">${esc(tl('prem.free'))}</p>`;
  const head = `<p class="eyebrow">${esc(tl('prem.eyebrow'))}</p><h2>${esc(tl('prem.title'))}</h2>`;
  const album = !extras ? '' : `<div class="setting-row"><span>${esc(tl('prem.albumTitle'))}</span><button type="button" class="ghost" data-action="weather-album">${esc(tl('prem.albumOpen'))}</button></div>`;
  const back = `<button type="button" class="primary" data-action="settings">${esc(tl('prem.back'))}</button>`;
  if (mode === 'web') return `${head}${perks}<p class="prem-note-box">${esc(tl('prem.webOnly'))}</p>${back}`;
  const manage = `<p class="prem-legal">${link(billing.manageUrl, tl('prem.manage'))}<button type="button" data-action="premium-restore">${esc(tl('prem.restore'))}</button></p>`;
  if (store.active) {
    const when = dateText(billing.expires);
    const status = billing.lifetime ? tl('prem.lifetimeActive') : when ? tl(billing.willRenew ? 'prem.renews' : 'prem.expires', { date: when }) : '';
    return `${head}<p class="prem-status">${esc(tl('prem.active'))}${status ? `<br><small>${esc(status)}</small>` : ''}</p>${perks}${extras ? skinsSection(store, o.today) : ''}${album}${manage}${legal(mode)}${back}`;
  }
  const subs = [billing.price ? tl('prem.priceMonthly', { price: billing.price }) : '', billing.yearlyPrice ? tl('prem.priceYearly', { price: billing.yearlyPrice }) : ''].filter(Boolean);
  const per = subs.length ? tl('prem.perList', { list: subs.join(tl('prem.listSep')) }) : '';
  const disclosure = `${esc(tl(mode === 'ios' ? 'prem.disclosureIos' : 'prem.disclosureAndroid', { per }))}<br>${esc(tl('prem.lifetimeNote'))}`;
  const loading = !o.notYet && billing.state === 'loading';
  const state = o.notYet ? '' : loading ? tl('prem.loading') : billing.state === 'unavailable' ? tl('prem.unavailable') : '';
  const off = loading || o.busy ? ' aria-disabled="true"' : '';
  // Plan name, with the store price on a second line when loaded (three columns still fit a 320 px phone).
  const plan = (p: Plan, name: string, price: string | null) =>
    `<button type="button" class="primary prem-buy" data-action="premium-buy" data-plan="${p}"${off}>${esc(name)}${price ? `<small class="prem-price">${priceLine(price)}</small>` : ''}</button>`;
  const buy = `<div class="prem-plans">${plan('monthly', tl('prem.planMonthly'), billing.price ? tl('prem.priceMonthly', { price: billing.price }) : null)}${plan('yearly', tl('prem.planYearly'), billing.yearlyPrice ? tl('prem.priceYearly', { price: billing.yearlyPrice }) : null)}${plan('lifetime', tl('prem.planLifetime'), billing.lifetimePrice ? tl('prem.priceOnce', { price: billing.lifetimePrice }) : null)}</div>`;
  return `${head}<p class="prem-lead">${esc(tl('prem.lead'))}</p>${perks}${state ? `<p class="prem-small">${esc(state)}</p>` : ''}${buy}${album}${manage}<p class="prem-disclosure">${disclosure}</p>${legal(mode)}${back}`;
}

/** 真實天氣紀念冊: members see every day; others see how many days are waiting. */
export function weatherAlbumModal(store: PremiumStore, member: boolean): string {
  const head = `<p class="eyebrow">${esc(tl('prem.eyebrow'))}</p><h2>${esc(tl('prem.albumTitle'))}</h2>`;
  const back = `<button type="button" class="primary" data-action="premium">${esc(tl('prem.back'))}</button>`;
  if (!store.diary.length) return `${head}<p>${esc(tl('prem.albumEmpty'))}</p>${back}`;
  if (!member) return `${head}<p class="prem-note-box">${esc(tl('prem.albumLocked', { n: store.diary.length }))}</p>${back}`;
  const months = diaryByMonth(store)
    .map(({ month, days }) => {
      const [y, m] = month.split('-');
      let title = month;
      try {
        title = new Intl.DateTimeFormat(getLocale(), { year: 'numeric', month: 'long' }).format(new Date(Number(y), Number(m) - 1, 15));
      } catch {
        /* keep YYYY-MM */
      }
      const rows = days
        .map((d) => {
          const ev = d.events.filter((e) => e !== 'clear').map((e) => esc(eventLabel(e))).join(' · ');
          const tree = d.health !== undefined && d.heightCm !== undefined ? tl('prem.albumTree', { h: d.health, height: formatHeight(d.heightCm) }) : '';
          return `<li class="wx-day"><span class="wx-art">${weatherArt(d.code, false, false, d.hkoIcon)}</span><span class="wx-main"><b>${esc(String(Number(d.date.slice(8, 10))))}</b> ${esc(d.place)} · ${esc(tl('prem.albumTemp', { tMin: d.tMin, tMax: d.tMax }))}${ev ? `<br><em>${ev}</em>` : ''}${tree ? `<br><small>${esc(d.treeName)} · ${esc(tree)}</small>` : ''}</span></li>`;
        })
        .join('');
      return `<h3 class="sub">${esc(title)} <small>${days.length}</small></h3><ul class="wx-album">${rows}</ul>`;
    })
    .join('');
  return `${head}${months}${back}`;
}
