/** 設定 → 世界之樹會員: settings row, paywall / member page (skins, album link) and the 真實天氣紀念冊. HTML only. */
import { eventLabel } from './labels';
import { getLocale, t as tl } from './i18n';
import { weatherArt } from './icons';
import { PREMIUM_EXTRAS, SKINS, diaryByMonth, skinName, skinOfMonth, type PremiumStore } from './premium';
import { esc, formatHeight } from './util';
import type { BillingInfo } from './native/billing';

export const PRIVACY_URL = 'https://kahowu24065.github.io/tree-game/privacy.html';
export const TERMS_URL = 'https://kahowu24065.github.io/tree-game/terms.html';
/** Apple's standard licence (EULA) — the subscription's Terms of Use on iOS. */
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export type PremiumMode = 'web' | 'ios' | 'android';

const PRICE_FALLBACK = 'HK$8';
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
  return `<p class="prem-legal">${link(terms, tl('prem.terms'))}${link(PRIVACY_URL, tl('prem.privacy'))}</p>`;
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

/** Paywall (not a member) or member page. */
export function premiumModal(o: { mode: PremiumMode; store: PremiumStore; billing: BillingInfo; today: string; busy?: boolean; extras?: boolean }): string {
  const { mode, store, billing } = o;
  const extras = o.extras ?? PREMIUM_EXTRAS;
  const price = billing.price ?? PRICE_FALLBACK;
  const extraPerks = extras ? `<li>${esc(tl('prem.perkSkins', { name: skinName(skinOfMonth(o.today).id) }))}</li><li>${esc(tl('prem.perkAlbum'))}</li>` : '';
  const perks = `<ul class="prem-perks"><li>${esc(tl('prem.perkAds'))}</li>${extraPerks}</ul><p class="prem-small">${esc(tl('prem.free'))}</p>`;
  const head = `<p class="eyebrow">${esc(tl('prem.eyebrow'))}</p><h2>${esc(tl('prem.title'))}</h2>`;
  const album = !extras ? '' : `<div class="setting-row"><span>${esc(tl('prem.albumTitle'))}</span><button type="button" class="ghost" data-action="weather-album">${esc(tl('prem.albumOpen'))}</button></div>`;
  const back = `<button type="button" class="primary" data-action="settings">${esc(tl('prem.back'))}</button>`;
  if (mode === 'web') return `${head}${perks}<p class="prem-note-box">${esc(tl('prem.webOnly'))}</p>${back}`;
  const manage = `<p class="prem-legal">${link(billing.manageUrl, tl('prem.manage'))}<button type="button" data-action="premium-restore">${esc(tl('prem.restore'))}</button></p>`;
  if (store.active) {
    const when = dateText(billing.expires);
    const status = when ? tl(billing.willRenew ? 'prem.renews' : 'prem.expires', { date: when }) : '';
    return `${head}<p class="prem-status">${esc(tl('prem.active'))}${status ? `<br><small>${esc(status)}</small>` : ''}</p>${perks}${extras ? skinsSection(store, o.today) : ''}${album}${manage}${legal(mode)}${back}`;
  }
  const disclosure = tl(mode === 'ios' ? 'prem.disclosureIos' : 'prem.disclosureAndroid');
  const canBuy = billing.state === 'ready' && billing.price !== null;
  const state = billing.state === 'loading' ? tl('prem.loading') : billing.state === 'unavailable' || !canBuy ? tl('prem.unavailable') : '';
  const buy = `<button type="button" class="primary prem-buy" data-action="premium-buy"${canBuy && !o.busy ? '' : ' aria-disabled="true"'}>${esc(tl('prem.subscribe', { price }))}</button>`;
  return `${head}<p class="prem-lead">${esc(tl('prem.lead', { price }))}</p>${perks}${state ? `<p class="prem-small">${esc(state)}</p>` : ''}${buy}${album}${manage}<p class="prem-disclosure">${esc(disclosure)}</p>${legal(mode)}${back}`;
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
