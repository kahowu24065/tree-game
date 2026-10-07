/** 1.4.50 sunrise / sunset computed locally (NOAA formula), so HK / Macau / Taiwan need no model API for sun times. */

/** Sunrise / sunset (UTC ms) for the UTC day around `noonMs`; null in polar day / night. Same as push-server/src/metno.js. */
export function sunTimes(lat: number, lon: number, noonMs: number): { rise: number; set: number } | null {
  const rad = Math.PI / 180;
  const d = new Date(noonMs);
  const n = Math.floor((noonMs - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl);
  if (cosH < -1 || cosH > 1) return null;
  const ha = Math.acos(cosH) / rad;
  const day0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return { rise: day0 + (720 - 4 * (lon + ha) - eq) * 60000, set: day0 + (720 - 4 * (lon - ha) - eq) * 60000 };
}

function localIso(ms: number, tz: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Local "YYYY-MM-DDTHH:MM" sunrise / sunset for a local date, or null. */
export function sunForDate(lat: number, lon: number, date: string, tz: string): { sunrise: string; sunset: string } | null {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const sun = sunTimes(lat, lon, Date.UTC(y, m - 1, d, 12) - (lon / 15) * 3600000);
  return sun ? { sunrise: localIso(sun.rise, tz), sunset: localIso(sun.set, tz) } : null;
}
