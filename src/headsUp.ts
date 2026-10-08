/** 1.4.60 天氣預告 (weather heads-up pushes): on by default once notifications are on; the server only sends to `headsUp: true`. */
export const HEADSUP_KEY = 'sekai-tree-headsup';

export function headsUpEnabled(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(HEADSUP_KEY) !== '0';
  } catch {
    return true;
  }
}
