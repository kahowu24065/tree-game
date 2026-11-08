// 1.4.78: campfire off garden pond; iOS growth MP4 upright (no Y-flip).
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';
import { campfireSpot } from '../src/campfire';
import { GARDEN_POND, onGardenWater } from '../src/three/island3d';
import { APP_VERSION } from '../src/version';

describe('1.4.78 campfire clear of pond + iOS MP4 upright', () => {
  it('version 1.4.80 / versionCode 87', () => {
    expect(APP_VERSION).toBe('1.4.80');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+87/);
    expect(g).toContain('1.4.80');
  });

  it('scene prefers ~1.55 and wet keep-out covers the ash pad', () => {
    const scene = fs.readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).toMatch(/prefer:\s*1\.55/);
    expect(scene).not.toMatch(/prefer:\s*2\.2/);
    expect(scene).toContain('r * 2.0 + 0.35');
    expect(scene).toContain('|pc1');
    const island = fs.readFileSync('src/three/island3d.ts', 'utf8');
    expect(island).toContain('fireAng - 1.55');
    expect(island).not.toContain('fireAng - 2.2');
  });

  it('default campfire spot stays dry of the garden pond including ash pad', () => {
    const rU = 0.28;
    const wetPad = Math.max(rU * 2.0 + 0.35, rU + 0.55);
    const spot = campfireSpot({
      trunkU: 0.5,
      clearU: 0.9,
      fireU: rU,
      prefer: 1.55,
      margin: 0.5,
      blocked: (x, z, r) => onGardenWater(x, z, 0.06 + wetPad) || Math.hypot(x, z) < 0.8,
    });
    expect(onGardenWater(spot.x, spot.z, wetPad)).toBe(false);
    expect(onGardenWater(spot.x, spot.z, 0)).toBe(false);
    // Not near the old front-left pond pocket.
    const pondAng = Math.atan2(GARDEN_POND.z, GARDEN_POND.x);
    const dAng = Math.abs(((spot.angle - pondAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    expect(dAng).toBeGreaterThan(0.45);
  });

  it('iOS TreeTimelapsePlugin draws without Y-flip', () => {
    const swiftPath = '/workspace/wt-ios/ios/App/App/TreeTimelapsePlugin.swift';
    expect(fs.existsSync(swiftPath)).toBe(true);
    const swift = fs.readFileSync(swiftPath, 'utf8');
    expect(swift).toContain('do NOT flip');
    expect(swift).not.toMatch(/scaleBy\(x:\s*1,\s*y:\s*-1\)/);
    expect(swift).not.toMatch(/translateBy\(x:\s*0,\s*y:\s*CGFloat\(height\)\)/);
  });
});
