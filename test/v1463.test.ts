// 1.4.63: left-right orbit is free (full 360°); pitch stays limited.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { clampOrbitDrag, ORBIT_EL_OVERVIEW, ORBIT_EL_ZOOMED } from '../src/three/scene3d';

describe('orbit yaw', () => {
  it('lets yaw turn past the old ±0.6 / ±π stops', () => {
    expect(clampOrbitDrag(0.7, 0, false).az).toBe(0.7);
    expect(clampOrbitDrag(-0.7, 0, false).az).toBe(-0.7);
    expect(clampOrbitDrag(Math.PI + 0.5, 0, true).az).toBeCloseTo(Math.PI + 0.5);
    expect(clampOrbitDrag(-Math.PI - 0.5, 0, true).az).toBeCloseTo(-Math.PI - 0.5);
    expect(clampOrbitDrag(4 * Math.PI, 0, false).az).toBeCloseTo(4 * Math.PI);
  });

  it('still clamps pitch so the camera stays off the dirt and out of a sky dive', () => {
    expect(clampOrbitDrag(0, -1, false).el).toBe(ORBIT_EL_OVERVIEW.min);
    expect(clampOrbitDrag(0, 1, false).el).toBe(ORBIT_EL_OVERVIEW.max);
    expect(clampOrbitDrag(0, -1, true).el).toBe(ORBIT_EL_ZOOMED.min);
    expect(clampOrbitDrag(0, 1, true).el).toBe(ORBIT_EL_ZOOMED.max);
    expect(clampOrbitDrag(0, 0, false).el).toBe(0);
  });
});

describe('sheet share button', () => {
  it('mirrors the settings gear on the left of 成長日誌', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    expect(html).toMatch(/id="sheet-share"[^>]*data-action="share-card"/);
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css).toMatch(/\.sheet-share\s*\{[\s\S]*?left:\s*12px/);
    expect(css).toMatch(/\.sheet-gear\s*\{[\s\S]*?right:\s*12px/);
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain("['#sheet-share', 'share.button']");
  });
});
