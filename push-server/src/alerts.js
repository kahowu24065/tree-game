// Per-scope alert bookkeeping (pure): new / upgraded categories fire now; one follow-up reminder ~2 h later
// while the category is still in force. Scope = "hk" or a 0.5° cell.
import { CATEGORIES } from './warnings.js';

export const REMINDER_MS = 2 * 3600_000;

/**
 * `prev` = { levels, alerts: { [category]: { level, firedAt, reminded } } } or null (first sight: record, no push).
 * Returns the next scope state plus what to send now.
 */
export function stepScope(prev, levels, now) {
  const alerts = {};
  const fresh = [];
  const reminders = [];
  for (const c of CATEGORIES) {
    const lv = levels[c] ?? 0;
    if (!lv) continue;
    const old = prev?.alerts?.[c];
    const before = prev ? (prev.levels?.[c] ?? 0) : lv;
    if (prev && lv > before) {
      alerts[c] = { level: lv, firedAt: now, reminded: false };
      fresh.push({ category: c, level: lv });
    } else if (old) {
      alerts[c] = { ...old, level: lv };
      if (!old.reminded && now - old.firedAt >= REMINDER_MS) {
        alerts[c].reminded = true;
        reminders.push({ category: c, level: lv });
      }
    } else {
      // In force since before we started watching: no push, and no reminder either.
      alerts[c] = { level: lv, firedAt: now, reminded: true };
    }
  }
  return { state: { levels: { ...levels }, alerts }, fresh, reminders };
}
