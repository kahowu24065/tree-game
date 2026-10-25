/** 1.4.76 水份不足提醒: local hourly when W < 50; on by default; quiet 00:00–08:00. */
export const WATER_LOW_REMIND_KEY = 'sekai-tree-water-low-remind';

export function waterLowRemindEnabled(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(WATER_LOW_REMIND_KEY) !== '0';
  } catch {
    return true;
  }
}
