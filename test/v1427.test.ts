// 1.4.27: Japan heatstroke alerts (環境省) count as 酷熱 and show our translated name.
import { describe, expect, it } from 'vitest';
import { alertEvents, parseAlerts } from '../src/alerts';
import { feedAlertsHtml } from '../src/ui';

describe('Japan heatstroke alerts', () => {
  const now = Date.parse('2026-08-15T03:00:00Z');
  const body = {
    covered: true, source: 'jma', attribution: 'JMA / MoE',
    alerts: [
      { id: 'heat-300000-2026-08-15', event: 'hot', kind: 'jp-heat-special', name: '熱中症特別警戒アラート', nameEn: 'Special Heatstroke Alert', onset: '2026-08-15T00:00:00+09:00', ends: '2026-08-15T15:00:00.000Z', active: true },
      { id: 'heat-300000-2026-08-16', event: 'hot', kind: 'jp-heat', name: '熱中症警戒アラート', nameEn: 'Heatstroke Alert', onset: '2026-08-16T00:00:00+09:00', ends: '2026-08-16T15:00:00.000Z', active: false },
    ],
  };
  it('counts as hot and renders the translated + issued name', () => {
    const a = parseAlerts(body, now)!;
    expect(a.alerts[0]!.kind).toBe('jp-heat-special');
    expect(alertEvents(a, now)).toEqual(['hot']);
    const html = feedAlertsHtml({ source: 'jma', alerts: a.alerts, attribution: a.attribution!, known: true, tz: 'Asia/Tokyo' }, now);
    expect(html).toContain('熱中症特別警戒アラート');
    expect(html).toMatch(/中暑特別警戒警報|Special Heatstroke Alert/);
  });
});
