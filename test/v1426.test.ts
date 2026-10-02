// 1.4.26: events / damage / achievements come only from official warnings (HK / Macau / Taiwan), official alert feeds
// (US / Canada / Japan / Europe), or — where no feed exists — observed numbers. Forecasts never count.
import { describe, expect, it } from 'vitest';
import { alertEvents, likelyFeedRegion, parseAlerts } from '../src/alerts';
import { hourEvent, hoursOfDate, observedEvents, observedRainEvents } from '../src/events';
import { weatherTrackCopy } from '../src/labels';
import { createGame, eventsForDate, recordEvents } from '../src/sim';
import { feedAlertsHtml } from '../src/ui';
import { forecastUrl, splitHours, type HourPoint } from '../src/weather';
import type { CurrentWeather } from '../src/types';

const D = '2026-10-02';
const h = (hh: number, over: Partial<HourPoint> = {}): HourPoint => ({ time: `${D}T${String(hh).padStart(2, '0')}:00`, precipMm: 0, code: 2, gustKmh: 20, windKmh: 10, ...over });
const cur = (over: Partial<CurrentWeather> = {}): CurrentWeather => ({ tempC: 26, humidity: 80, precipMm: 0, code: 2, windKmh: 10, gustKmh: 20, isDay: true, time: `${D}T12:15`, ...over });

describe('observed numbers (no official feed)', () => {
  it('rain: 30 mm/h rainstorm, 70 mm/h or 100 mm / 3 h black', () => {
    expect(observedEvents([h(1, { precipMm: 29 })])).toEqual(['drizzle']);
    expect(observedEvents([h(1, { precipMm: 30 })])).toContain('rainstorm');
    expect(observedEvents([h(1, { precipMm: 70 })])).toContain('blackrain');
    expect(observedEvents([h(1, { precipMm: 35 }), h(2, { precipMm: 35 }), h(3, { precipMm: 35 })])).toContain('blackrain');
    expect(observedEvents([h(1, { precipMm: 35 }), h(2), h(3, { precipMm: 35 }), h(4), h(5, { precipMm: 35 })])).not.toContain('blackrain');
  });

  it('wind must hold 2 hours (or one big gust); thunder needs a thunderstorm code', () => {
    expect(observedEvents([h(1, { windKmh: 70 }), h(2, { windKmh: 30 })])).not.toContain('typhoon8');
    expect(observedEvents([h(1, { windKmh: 70 }), h(2, { windKmh: 64 })])).toContain('typhoon8');
    expect(observedEvents([h(1, { windKmh: 45 }), h(2, { windKmh: 42 })])).toEqual(['typhoon1']);
    expect(observedEvents([h(1, { gustKmh: 90 })])).toEqual(['typhoon1']);
    expect(observedEvents([h(1, { gustKmh: 120 })])).toEqual(['typhoon8']);
    expect(observedEvents([h(1, { gustKmh: 80 })])).toEqual([]);
    expect(observedEvents([h(1, { code: 95 })])).toEqual(['thunder']);
    expect(observedEvents([h(11, { windKmh: 64 })], cur({ windKmh: 66 }))).toContain('typhoon8');
  });

  it('live rain ×4 (15-minute value)', () => {
    expect(observedRainEvents({ hk: false, current: cur({ precipMm: 7 }) })).toEqual(['drizzle']);
    expect(observedRainEvents({ hk: false, current: cur({ precipMm: 7.5 }) })).toEqual(['rainstorm', 'drizzle']);
    expect(observedRainEvents({ hk: false, current: cur(), hours: [h(9, { precipMm: 72 })] })).toEqual(['blackrain']);
    expect(hourEvent(h(1, { precipMm: 31 }))).toBe('rainstorm');
  });

  it('Open-Meteo hours split into observed (ended) and forecast; URL asks for past hours + wind', () => {
    const times = ['2026-10-02T10:00', '2026-10-02T11:00', '2026-10-02T12:00', '2026-10-02T13:00'];
    const s = splitHours({ time: times, precipitation: [1, 2, 3, 4], weather_code: [0, 0, 0, 0], wind_gusts_10m: [1, 1, 1, 1], wind_speed_10m: [5, 6, 7, 8] } as never, '2026-10-02T12:15');
    expect(s.pastHours.map((x) => x.time)).toEqual(times.slice(0, 3));
    expect(s.hourly.map((x) => x.time)).toEqual(times.slice(2));
    expect(s.pastHours[2]!.windKmh).toBe(7);
    expect(hoursOfDate([h(1), { ...h(2), time: '2026-10-01T23:00' }], D)).toHaveLength(1);
    const url = new URL(forecastUrl(39.9, 116.4));
    expect(url.searchParams.get('past_hours')).toBe('48');
    expect(url.searchParams.get('hourly')).toContain('wind_speed_10m');
  });
});

describe('settlement ignores forecasts', () => {
  it('only recorded (live) events and observed ones settle a date', () => {
    const s = createGame(D);
    expect(eventsForDate(s, D)).toEqual(['clear']);
    recordEvents(s, D, ['typhoon8'], true);
    expect(eventsForDate(s, D, ['drizzle']).sort()).toEqual(['drizzle', 'typhoon8']);
  });
});

describe('official alert feeds', () => {
  const body = {
    covered: true,
    source: 'nws',
    attribution: 'U.S. National Weather Service',
    alerts: [
      { id: 'a', event: 'rainstorm', name: 'Flood Warning', nameEn: 'Flood Warning', level: 'Severe', onset: '2026-10-02T01:00:00Z', ends: '2026-10-02T20:00:00Z', headline: 'Flood Warning until 4 PM', description: 'Rivers rising.', instruction: 'Turn around, don\'t drown.', area: 'X County', active: true },
      { id: 'b', event: 'typhoon8', name: 'High Wind Warning', nameEn: 'High Wind Warning', level: 'Severe', onset: '2026-10-02T01:00:00Z', ends: '2026-10-02T03:00:00Z', headline: '', description: '', instruction: '', area: '', active: true },
      { id: 'c', event: 'bogus', name: 'Special Weather Statement', nameEn: '', level: '', onset: null, ends: null, headline: '', description: '', instruction: '', area: '', active: true },
    ],
  };
  const now = Date.parse('2026-10-02T04:00:00Z');

  it('only alerts still in force become events; unknown ids are shown only', () => {
    const a = parseAlerts(body, now)!;
    expect(a.covered).toBe(true);
    expect(a.alerts[2]!.event).toBeNull();
    expect(alertEvents(a, now)).toEqual(['rainstorm']);
    expect(alertEvents({ ...a, covered: false }, now)).toEqual([]);
    expect(parseAlerts({ covered: false, alerts: [] })!.covered).toBe(false);
    expect(observedRainEvents({ hk: true, events: alertEvents(a, now), current: cur({ precipMm: 9 }) })).toEqual(['rainstorm', 'drizzle']);
  });

  it('warning card shows category, name as issued, details and attribution', () => {
    const a = parseAlerts(body, now)!;
    const html = feedAlertsHtml({ source: 'nws', alerts: a.alerts, attribution: a.attribution!, known: true, tz: 'America/New_York' }, now);
    expect(html).toContain('Flood Warning');
    expect(html).toContain('Rivers rising.');
    expect(html).toContain('U.S. National Weather Service');
    expect(html).toContain('class="gray"');
    expect(feedAlertsHtml({ alerts: [], attribution: '', known: false, tz: 'UTC' })).not.toContain('<li');
  });

  it('feed region boxes (fallback when the server is unreachable)', () => {
    expect(likelyFeedRegion(40.7, -74)).toBe(true);
    expect(likelyFeedRegion(35.7, 139.7)).toBe(true);
    expect(likelyFeedRegion(52.5, 13.4)).toBe(true);
    expect(likelyFeedRegion(39.9, 116.4)).toBe(false);
    expect(likelyFeedRegion(22.3, 114.2)).toBe(false);
  });

  it('badge text says where counts come from', () => {
    for (const region of ['hk', 'intl'] as const) expect(weatherTrackCopy('t8', region).detail).toMatch(/官方|official/i);
  });
});
