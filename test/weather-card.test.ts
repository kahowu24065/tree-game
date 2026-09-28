import { describe, expect, it } from 'vitest';
import { weatherCardTone } from '../src/ui';
import type { DayCond } from '../src/types';

const fine: DayCond = { code: 1, tempC: 33, tempMax: 34, precipMm: 0, windKmh: 10, gustKmh: 18, hot: true, raining: false, stormKind: null };
const wet: DayCond = { ...fine, code: 61, precipMm: 2, raining: true, hot: false };

describe('天氣框顏色', () => {
  it('毛毛雨係藍色；之後酷熱生效就轉紅色，唔會因為同日落過雨而留喺藍色', () => {
    expect(weatherCardTone(['drizzle'], wet)).toBe('rain');
    expect(weatherCardTone(['drizzle', 'hot'], wet)).toBe('hot');
    expect(weatherCardTone(['hot'], wet)).toBe('hot');
  });

  it('暴雨、黑雨係藍色；暴雨同酷熱一齊就跟暴雨', () => {
    expect(weatherCardTone(['rainstorm'], wet)).toBe('rain');
    expect(weatherCardTone(['blackrain'], wet)).toBe('rain');
    expect(weatherCardTone(['hot', 'rainstorm'], wet)).toBe('rain');
  });

  it('山泥傾瀉、颱風、狂風雷暴係黃色，加埋落雨都係黃色', () => {
    expect(weatherCardTone(['landslip', 'rainstorm'], wet)).toBe('wind');
    expect(weatherCardTone(['typhoon1', 'drizzle'], wet)).toBe('wind');
    expect(weatherCardTone(['typhoon8', 'blackrain'], wet)).toBe('wind');
    expect(weatherCardTone(['thunder', 'drizzle', 'hot'], wet)).toBe('wind');
    expect(weatherCardTone(['drizzle'], wet, { event: 'landslip', hours: 4, active: false, source: '預報' })).toBe('wind');
  });

  it('冇風冇雨嘅酷熱、寒冷', () => {
    expect(weatherCardTone(['hot'], fine)).toBe('hot');
    expect(weatherCardTone(['cold'], { ...fine, hot: false, cold: true })).toBe('cold');
  });
});
