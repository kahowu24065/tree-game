import { actionLimit, type CareAction } from './sim';
import { wallTime } from './native/saveLog';
import type { GameState } from './types';

/** 1.4.43 diagnostics: one-line key values of a tree (W N H R, uses left, dates, grace). Loose: also takes raw JSON. */
export function sumState(s: GameState | null | undefined, now = Date.now()): string {
  if (!s || typeof s !== 'object') return 'none';
  const r = (x: unknown) => (typeof x === 'number' ? Math.round(x * 10) / 10 : '?');
  const care = s.care ?? ({} as GameState['care']);
  const left = (['water', 'fertilize', 'deworm', 'drain'] as CareAction[])
    .map((a) => {
      try {
        const l = actionLimit(s, a);
        return `${a === 'water' ? 'wat' : a === 'fertilize' ? 'fer' : a === 'deworm' ? 'dew' : 'drn'}${l.max - l.used}/${l.max}`;
      } catch {
        return `${a}?`;
      }
    })
    .join(' ');
  const g = s.pause?.w;
  const grace = typeof g === 'number' ? `${wallTime(g)}${g > now ? ` (+${Math.round((g - now) / 1000)}s)` : ' (past)'}` : '-';
  return (
    `W${r(s.moisture)} N${r(s.nutrients)} H${r(s.health)} R${r(s.resist)} · left ${left}` +
    ` · care{${care.date} w${care.water} wh=${care.waterHour ?? '-'}×${care.waterInHour ?? 0} f${care.fertilize} d${care.dewormed ? 1 : 0} dr${care.drain}}` +
    ` · lastSeen ${s.lastSeenDate}${s.virtualToday ? ` vT ${s.virtualToday}` : ''} · grace ${grace}${s.started ? '' : ' · not started'}${s.over ? ' · over' : ''}`
  );
}

/** Care fingerprint: changes when any of today's uses or the care date changes. */
export function careSig(s: GameState): string {
  const c = s.care;
  return `${c?.date}|${c?.water}|${c?.waterHour}|${c?.waterInHour}|${c?.fertilize}|${c?.dewormed}|${c?.drain}|${s.lastSeenDate}`;
}

/** Key values of a raw save string (as found in one store at launch). */
export function sumRaw(raw: string | undefined): string {
  if (!raw) return 'absent';
  try {
    const v = JSON.parse(raw) as GameState & { version?: number };
    return `${(raw.length / 1024).toFixed(1)}kB v${v.version ?? '?'} ${sumState(v)}`;
  } catch {
    return `unparsable (${raw.length} B)`;
  }
}

export function sumGroveRaw(raw: string | undefined): string {
  if (!raw) return 'absent';
  try {
    const g = JSON.parse(raw) as { isle?: number; home?: GameState; second?: GameState | null };
    return `${(raw.length / 1024).toFixed(1)}kB isle${g.isle} home: ${sumState(g.home)}${g.second ? ` | second: ${sumState(g.second)}` : ''}`;
  } catch {
    return `unparsable (${raw.length} B)`;
  }
}

export function stampText(raw: string | undefined): string {
  const n = Number(raw);
  return raw && Number.isFinite(n) && n > 0 ? `${n} (${wallTime(n)})` : 'none';
}
