/** 1.4.50 / 1.4.67 設定 › 資料來源及授權: weather & place data only (no links, no audio/OSS sections). */
import { t as tl } from './i18n';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** [source name key, licence / attribution key]. */
export const DATA_SOURCES: [string, string][] = [
  ['credits.hko', 'credits.hkoLic'],
  ['credits.smg', 'credits.smgLic'],
  ['credits.cwa', 'credits.twLic'],
  ['credits.ncdr', 'credits.twLic'],
  ['credits.met', 'credits.metLic'],
  ['credits.nws', 'credits.nwsLic'],
  ['credits.eccc', 'credits.ecccLic'],
  ['credits.jma', 'credits.jmaLic'],
  ['credits.wbgt', 'credits.wbgtLic'],
  ['credits.meteoalarm', 'credits.meteoalarmLic'],
  ['credits.bdc', 'credits.bdcLic'],
];

export function creditsModal(): string {
  const data = DATA_SOURCES.map(
    ([n, l]) => `<li><b>${esc(tl(n))}</b><br>${esc(tl(l))}</li>`,
  ).join('');
  return `<p class="eyebrow">${esc(tl('credits.link'))}</p><h2>${esc(tl('credits.link'))}</h2>
    <div class="credits">
    <h3>${esc(tl('credits.weather'))}</h3><ul>${data}</ul>
    <p>${esc(tl('credits.noEndorse'))}</p>
    </div>
    <button type="button" class="primary" data-action="settings">${esc(tl('credits.back'))}</button>`;
}
