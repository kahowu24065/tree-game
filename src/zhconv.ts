/**
 * Traditional → Simplified Chinese for bureau free text (SMG / CWA bulletins and forecasts) when the
 * player uses zh-CN. OpenCC (opencc-js t2cn, ~110 KB) is loaded on demand so other locales never fetch it.
 */
import type { HkoData } from './hko';
import { getLocale } from './i18n';

type Conv = (s: string) => string;
const cache: Partial<Record<'hk' | 'tw', Promise<Conv>>> = {};

function converter(from: 'hk' | 'tw'): Promise<Conv> {
  cache[from] ??= import('opencc-js/t2cn').then((m) => m.Converter({ from, to: 'cn' }) as Conv);
  return cache[from]!;
}

/** Bureau text in the player's script: Simplified for zh-CN, untouched otherwise (or if OpenCC fails to load). */
export async function localizeBureauText(data: HkoData, from: 'hk' | 'tw'): Promise<HkoData> {
  if (getLocale() !== 'zh-CN') return data;
  let c: Conv;
  try {
    c = await converter(from);
  } catch {
    return data;
  }
  return {
    ...data,
    messages: data.messages.map(c),
    situation: c(data.situation),
    forecast: data.forecast.map((d) => ({ ...d, text: c(d.text), wind: c(d.wind) })),
  };
}
