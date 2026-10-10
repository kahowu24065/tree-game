import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { tables } from '../src/i18n';

describe('1.4.67 dual photos: live share + overview log', () => {
  it('captureView is live; captureOverviewView is fixed HUD; toast copy exists', () => {
    const src = readFileSync('src/three/scene3d.ts', 'utf8');
    expect(src).toContain('captureOverviewView');
    expect(src).toMatch(/captureView\(w = 1200[\s\S]*?captureAt\(w, h, false\)/);
    expect(src).toMatch(/captureOverviewView\(w = 1200[\s\S]*?captureAt\(w, h, true\)/);
    const at = src.slice(src.indexOf('private captureAt'), src.indexOf('private captureAt') + 1800);
    expect(at).toContain('BASE_AZIMUTH');
    expect(at).toContain('ELEVATION');
    const main = readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('captureOverviewView()');
    expect(main).toContain('log.snapFront');
    expect(tables()['zh-HK']['log.snapFront']).toContain('正面照');
    expect(tables()['zh-CN']['log.snapFront']).toContain('正面照');
    expect(tables()['en']['log.snapFront'].toLowerCase()).toContain('front');
  });
});
