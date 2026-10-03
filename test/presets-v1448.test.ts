import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { parseRhrread } from '../src/hko';
import { switchLocale } from '../src/i18n';
import { inTaiwan } from '../src/cwa';
import { inMacau, inHongKong, districtRain } from '../src/weather';
import { PLACES, PLACE_GROUPS, findPlace, migratePlaceId, pushRegionFlags, weatherRegion } from '../src/presets';
import { locationModal } from '../src/ui';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as unknown;

afterEach(() => switchLocale('zh-HK'));

describe('1.4.48 grouped weather-location presets', () => {
  it('lists 香港／澳門／台灣 groups in order with the agreed places', () => {
    expect(PLACE_GROUPS).toEqual(['hk', 'mo', 'tw']);
    expect(PLACES.map((p) => [p.region, p.name])).toEqual([
      ['hk', '香港'], ['hk', '九龍'], ['hk', '新界'], ['hk', '離島'],
      ['mo', '澳門半島'], ['mo', '氹仔'], ['mo', '路環'],
      ['tw', '台北'], ['tw', '台中'], ['tw', '台南'], ['tw', '台東'],
    ]);
    expect(findPlace('hk')).toMatchObject({ lat: 22.278, lon: 114.162 });
  });

  it('names follow the language', () => {
    switchLocale('en');
    expect(PLACES.map((p) => p.name)).toEqual(['Hong Kong', 'Kowloon', 'New Territories', 'Islands', 'Macau Peninsula', 'Taipa', 'Coloane', 'Taipei', 'Taichung', 'Tainan', 'Taitung']);
    switchLocale('zh-TW');
    expect(PLACES.filter((p) => p.region === 'tw').map((p) => p.name)).toEqual(['臺北', '臺中', '臺南', '臺東']);
    switchLocale('zh-CN');
    expect(findPlace('nt')?.name).toBe('新界');
    expect(findPlace('islands')?.name).toBe('离岛');
  });

  it('every preset sits inside its own region', () => {
    for (const p of PLACES) {
      if (p.region === 'hk') expect(inHongKong(p.lat, p.lon), p.id).toBe(true);
      if (p.region === 'mo') expect(inMacau(p.lat, p.lon), p.id).toBe(true);
      if (p.region === 'tw') expect(inTaiwan(p.lat, p.lon), p.id).toBe(true);
    }
  });

  it('HK presets pick the intended HKO station and a real HKO rainfall district', () => {
    const want: Record<string, string> = { hk: '香港公園', kowloon: '香港天文台', nt: '沙田' };
    const rh = fixture('hko-rhrread.json') as { rainfall: { data: { place: string }[] } };
    const districts = rh.rainfall.data.map((r) => r.place);
    for (const p of PLACES.filter((x) => x.region === 'hk')) {
      if (want[p.id]) expect(parseRhrread(rh, p.lat, p.lon)?.current.station, p.id).toBe(want[p.id]);
      expect(districts, p.id).toContain(p.rainDistrict);
      const r = parseRhrread(rh, p.lat, p.lon)!;
      expect(districtRain({ fetchedAt: 0, warnings: [], messages: [], forecast: [], situation: '', current: r.current }, p.rainDistrict)).not.toBeNull();
    }
    expect(PLACES.filter((x) => x.region !== 'hk').every((p) => p.rainDistrict === undefined)).toBe(true);
  });

  it('routes a preset by its region, a GPS fix by its coordinates, no location to Hong Kong', () => {
    for (const p of PLACES) expect(weatherRegion('manual', p.lat, p.lon, p.id), p.id).toBe(p.region);
    // The preset's region wins even if the stored coordinates were somewhere else.
    expect(weatherRegion('manual', 22.3, 114.17, 'tw-taipei')).toBe('tw');
    expect(weatherRegion('manual', 22.3, 114.17, 'mo-taipa')).toBe('mo');
    // Old ids from a cached snapshot still route (they are HK presets).
    expect(weatherRegion('manual', 22.3817, 114.1877, 'shatin')).toBe('hk');
    expect(weatherRegion('geo', 22.19, 113.54)).toBe('mo');
    expect(weatherRegion('geo', 25.03, 121.56)).toBe('tw');
    expect(weatherRegion('geo', 22.34, 114.2)).toBe('hk');
    expect(weatherRegion('geo', 35.68, 139.76)).toBe('intl');
    expect(weatherRegion('geo', 22.54, 114.06)).toBe('intl'); // Shenzhen
    expect(weatherRegion('fallback', 22.3022, 114.1744)).toBe('hk');
  });

  it('push flags: Macau and Taiwan presets report isMO / isTW (with the CWA county), HK reports isHK', () => {
    const flags = (id: string, area: { county: string; town: string } | null = null) => {
      const p = findPlace(id)!;
      return pushRegionFlags(weatherRegion('manual', p.lat, p.lon, id), area);
    };
    expect(flags('kowloon')).toEqual({ isHK: true, isMO: false });
    expect(flags('mo-coloane')).toEqual({ isHK: true, isMO: true });
    expect(flags('tw-tainan', { county: '臺南市', town: '中西區' })).toEqual({ isHK: false, isMO: false, isTW: true, twCounty: '臺南市', twTown: '中西區' });
    expect(flags('tw-taitung', null)).toEqual({ isHK: false, isMO: false, isTW: true, twCounty: undefined, twTown: undefined });
    expect(pushRegionFlags('intl', null)).toEqual({ isHK: false, isMO: false });
  });

  it('migrates the old place ids once; keeps hk, geo and empty', () => {
    expect(migratePlaceId('central')).toBe('hk');
    for (const id of ['shatin', 'taipo', 'saikung', 'yuenlong']) expect(migratePlaceId(id)).toBe('nt');
    expect(migratePlaceId('tungchung')).toBe('islands');
    for (const id of ['hk', 'geo', '', 'kowloon', 'tw-taipei']) expect(migratePlaceId(id)).toBe(id);
    for (const id of ['central', 'shatin', 'taipo', 'saikung', 'yuenlong', 'tungchung']) expect(findPlace(migratePlaceId(id)), id).toBeDefined();
  });

  it('dialog: big location button, then three headed two-column groups', () => {
    const html = locationModal('nt');
    expect(html).toContain('data-place="geo"');
    expect(html).toContain('用我所在位置');
    expect([...html.matchAll(/class="places-head">([^<]+)</g)].map((m) => m[1])).toEqual(['香港', '澳門', '台灣']);
    expect((html.match(/class="places"/g) ?? []).length).toBe(3);
    expect((html.match(/data-place="/g) ?? []).length).toBe(12);
    expect(html).toMatch(/class="place on" data-place="nt"/);
    expect(html).not.toContain('瀏覽器');
    switchLocale('en');
    expect(locationModal('geo')).toContain('class="places-head">Taiwan<');
  });
});
