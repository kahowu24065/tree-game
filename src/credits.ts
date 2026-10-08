/** 1.4.50 設定 › 資料來源及授權: every data source with its licence and link, CC0 sound credits and open-source licences. */
import { t as tl } from './i18n';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** [source name key, licence / attribution key, link]. */
export const DATA_SOURCES: [string, string, string][] = [
  ['credits.hko', 'credits.hkoLic', 'https://data.gov.hk/en/terms-and-conditions'],
  ['credits.smg', 'credits.smgLic', 'https://www.smg.gov.mo/'],
  ['credits.cwa', 'credits.twLic', 'https://data.gov.tw/license'],
  ['credits.ncdr', 'credits.twLic', 'https://data.gov.tw/license'],
  ['credits.met', 'credits.metLic', 'https://www.met.no/en/free-meteorological-data/Licensing-and-crediting'],
  ['credits.nws', 'credits.nwsLic', 'https://www.weather.gov/disclaimer'],
  ['credits.eccc', 'credits.ecccLic', 'https://eccc-msc.github.io/open-data/licence/readme_en/'],
  ['credits.jma', 'credits.jmaLic', 'https://www.jma.go.jp/jma/kishou/info/coment.html'],
  ['credits.wbgt', 'credits.wbgtLic', 'https://www.wbgt.env.go.jp/tos.php'],
  ['credits.meteoalarm', 'credits.meteoalarmLic', 'https://www.meteoalarm.org/'],
  ['credits.bdc', 'credits.bdcLic', 'https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api'],
];

/** public/audio/CREDITS.txt (all CC0). [what (key), title / author, link]. */
export const SOUNDS: [string, string, string][] = [
  ['credits.sDay', 'Just You and Me (guitar) — Alex McCulloch / Pro Sensory', 'https://opengameart.org/content/just-you-and-me-guitar'],
  ['credits.sNight', 'Heavenly Loop — isaiah658', 'https://opengameart.org/content/heavenly-loop'],
  ['credits.sBirds', 'Ambient Bird Sounds — isaiah658', 'https://opengameart.org/content/ambient-bird-sounds'],
  ['credits.sCrickets', 'Crickets Ambient Noise (loopable) — Wolfgang_', 'https://opengameart.org/content/crickets-ambient-noise-loopable'],
  ['credits.sFrog', 'Bird, Cricket, Frog and Mosquito Sounds — Aj_', 'https://opengameart.org/content/birdcricketfrog-and-mosquito-sounds'],
  ['credits.sRain', '30 CC0 SFX Loops — rubberduck', 'https://opengameart.org/content/30-cc0-sfx-loops'],
  ['credits.sStorm', 'Rain, Long Thunder — WuxiaScrub', 'https://opengameart.org/content/rain-long-thunder'],
  ['credits.sClick', 'Interface Sounds — Kenney', 'https://kenney.nl/assets/interface-sounds'],
];

/** Runtime libraries in the app (web / Android / iOS builds). [name, licence, link]. */
export const OSS: [string, string, string][] = [
  ['three.js', 'MIT', 'https://github.com/mrdoob/three.js/blob/dev/LICENSE'],
  ['opencc-js', 'Apache-2.0 (OpenCC data: Apache-2.0)', 'https://github.com/nk2028/opencc-js/blob/main/LICENSE'],
  ['Capacitor (@capacitor/core, android, ios, app, clipboard, geolocation, local-notifications, preferences, push-notifications, share)', 'MIT', 'https://github.com/ionic-team/capacitor/blob/main/LICENSE'],
  ['@capacitor-community/admob', 'MIT', 'https://github.com/capacitor-community/admob/blob/master/LICENSE'],
  ['@revenuecat/purchases-capacitor', 'MIT', 'https://github.com/RevenueCat/purchases-capacitor/blob/main/LICENSE'],
  ['Firebase (Cloud Messaging)', 'Apache-2.0', 'https://github.com/firebase/firebase-android-sdk/blob/main/LICENSE'],
  ['Google Mobile Ads SDK / User Messaging Platform', 'Google terms', 'https://developers.google.com/admob/terms'],
];

const link = (href: string, text: string) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;

export function creditsModal(): string {
  const data = DATA_SOURCES.map(([n, l, u]) => `<li><b>${esc(tl(n))}</b><br>${esc(tl(l))}<br>${link(u, u.replace(/^https:\/\//, ''))}</li>`).join('');
  const snd = SOUNDS.map(([w, title, u]) => `<li><b>${esc(tl(w))}</b>: ${link(u, title)} · CC0</li>`).join('');
  const oss = OSS.map(([n, l, u]) => `<li>${link(u, n)} · ${esc(l)}</li>`).join('');
  return `<p class="eyebrow">${esc(tl('credits.link'))}</p><h2>${esc(tl('credits.link'))}</h2>
    <div class="credits">
    <h3>${esc(tl('credits.weather'))}</h3><ul>${data}</ul>
    <p>${esc(tl('credits.noEndorse'))}</p>
    <h3>${esc(tl('credits.audio'))}</h3><p>${esc(tl('credits.audioNote'))}</p><ul>${snd}</ul>
    <h3>${esc(tl('credits.oss'))}</h3><ul>${oss}</ul>
    </div>
    <button type="button" class="primary" data-action="settings">${esc(tl('credits.back'))}</button>`;
}
