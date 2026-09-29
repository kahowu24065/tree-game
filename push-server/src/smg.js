// SMG (地球物理氣象局) warnings → the same level object HKO warnsum uses.
// Thunderstorm and monsoon are shown in the app but, like HKO, are not push categories.

function inner(xml, name) {
  const m = String(xml ?? '').match(new RegExp(`<${name}(?![A-Za-z0-9_])[^>]*>([\\s\\S]*?)</${name}>`));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function blocks(xml, name) {
  return [...String(xml ?? '').matchAll(new RegExp(`<${name}(?![A-Za-z0-9_])[^>]*>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => m[1]);
}

function active(block) {
  const action = inner(block, 'Action').toUpperCase();
  const status = inner(block, 'Status');
  const inforce = inner(block, 'Inforce');
  if (action === 'CANCEL' || status === '0' || status === '2' || status === '3') return false;
  if (action === 'NIL' && status !== '1' && inforce !== '1') return false;
  return status === '1' || inforce === '1' || action === 'ISSUE' || action === 'RENEW';
}

function tcCode(block) {
  const blob = `${inner(block, 'Warncode')} ${inner(block, 'Description')} ${inner(block, 'Major')}`;
  if (/十號|(^|[^\d])10([^\d]|$)/.test(blob)) return 'TC10';
  if (/九號|(^|[^\d])9([^\d]|$)/.test(blob)) return 'TC9';
  if (/八號|(^|[^\d])8([^\d]|$)/.test(blob)) {
    if (/東北|\bNE\b/.test(blob)) return 'TC8NE';
    if (/東南|\bSE\b/.test(blob)) return 'TC8SE';
    if (/西北|\bNW\b/.test(blob)) return 'TC8NW';
    if (/西南|\bSW\b/.test(blob)) return 'TC8SW';
    return 'TC8SE';
  }
  if (/三號|(^|[^\d])3([^\d]|$)/.test(blob)) return 'TC3';
  return 'TC1';
}

function rainCode(block) {
  const blob = `${inner(block, 'Warncode')} ${inner(block, 'Description')}`;
  if (/黑/.test(blob) || /BLACK/i.test(blob)) return 'WRAINB';
  if (/紅/.test(blob) || /RED/i.test(blob)) return 'WRAINR';
  return 'WRAINA';
}

/** Fake HKO warnsum, so levelsFromWarnsum stays the only category mapping. */
export function warnsumFromSmg({ typhoon = '', rain = '', temp = '' } = {}) {
  const data = {};
  const tc = blocks(typhoon, 'TropicalCyclone').find(active);
  if (tc) data.WTCSGNL = { code: tcCode(tc), actionCode: 'ISSUE' };
  const rs = blocks(rain, 'Rainstorm').find(active);
  if (rs) data.WRAIN = { code: rainCode(rs), actionCode: 'ISSUE' };
  for (const item of blocks(temp, 'item')) {
    const title = inner(item, 'title');
    const desc = inner(item, 'description');
    if (!title || /取消|沒有|並無/.test(`${title}${desc}`)) continue;
    if (/高溫|酷熱/.test(title)) data.WHOT = { code: 'WHOT', actionCode: 'ISSUE' };
    else if (/低溫|寒冷|降溫/.test(title)) data.WCOLD = { code: 'WCOLD', actionCode: 'ISSUE' };
  }
  return data;
}
