import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('1.4.67 share/log photo fixed overview camera', () => {
  it('captureView places the HUD overview pose, not the live orbit', () => {
    const src = readFileSync('src/three/scene3d.ts', 'utf8');
    const i = src.indexOf('captureView(w = 1200');
    expect(i).toBeGreaterThan(0);
    const block = src.slice(i, i + 2200);
    expect(block).toContain('BASE_AZIMUTH');
    expect(block).toContain('ELEVATION');
    expect(block).toContain('this.camDist');
    expect(block).toContain('this.camTargetY');
    expect(block).not.toContain('this.dragAz');
    expect(block).not.toContain('this.zoom');
    expect(readFileSync('src/main.ts', 'utf8')).toContain('captureView()');
  });
});
