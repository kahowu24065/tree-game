// Per-scope alert bookkeeping (pure). Scope = "hk" or a 0.5° cell.
//  • issue / upgrade → `fresh` now; one follow-up `reminders` ~2 h later while still in force (max one per firing)
//  • downgrade / cancel → `drops` (info). `confirmDrops` = how many consecutive lower readings are needed first
//    (HK official warnings: 1; model-based cells: 2 ≈ 40 min, so a flapping forecast doesn't spam).
//  • prev null (first sight / fresh start) → record only, no pushes.
import { CATEGORIES } from './warnings.js';

export const REMINDER_MS = 2 * 3600_000;

export function stepScope(prev, levels, now, { confirmDrops = 1 } = {}) {
  const alerts = {};
  const pendingDrop = {};
  const confirmed = {};
  const fresh = [];
  const reminders = [];
  const drops = [];
  for (const c of CATEGORIES) {
    const lv = levels[c] ?? 0;
    const old = prev?.alerts?.[c];
    if (!prev) {
      confirmed[c] = lv;
      if (lv) alerts[c] = { level: lv, firedAt: now, reminded: true };
      continue;
    }
    const conf = prev.levels?.[c] ?? 0;
    if (lv > conf) {
      confirmed[c] = lv;
      alerts[c] = { level: lv, firedAt: now, reminded: false };
      fresh.push({ category: c, level: lv });
      continue;
    }
    if (lv < conf) {
      const pend = prev.pendingDrop?.[c];
      const count = (pend?.count ?? 0) + 1;
      const target = Math.max(lv, pend ? pend.level : lv);
      if (count >= confirmDrops) {
        confirmed[c] = target;
        drops.push({ category: c, from: conf, to: target });
        if (target && old) alerts[c] = { ...old, level: target };
        continue;
      }
      pendingDrop[c] = { level: target, count };
    }
    confirmed[c] = conf;
    if (!conf) continue;
    const a = old ? { ...old } : { level: conf, firedAt: now, reminded: true };
    if (!a.reminded && now - a.firedAt >= REMINDER_MS) {
      a.reminded = true;
      reminders.push({ category: c, level: conf });
    }
    alerts[c] = a;
  }
  return { state: { levels: confirmed, alerts, pendingDrop }, fresh, reminders, drops };
}
