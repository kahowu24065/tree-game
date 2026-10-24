/** 1.4.75 每日天氣 brief: on by default once notifications are on; the server only sends to `dailyBrief: true`. */
export const DAILY_BRIEF_KEY = 'sekai-tree-daily-brief';

export function dailyBriefEnabled(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(DAILY_BRIEF_KEY) !== '0';
  } catch {
    return true;
  }
}
