import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { APP_VERSION } from '../src/version';

describe('1.4.74 iOS ad: no double safe-area; hide filled HTML chrome', () => {
  it('version 1.4.75 / versionCode 82', () => {
    expect(APP_VERSION).toBe('1.4.75');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+82/);
    expect(g).toContain('1.4.75');
  });

  it('iOS showBanner uses margin 0 (plugin pins to safeArea)', () => {
    const src = readFileSync('src/native/banner.ts', 'utf8');
    expect(src).toMatch(/showBanner\(\{[\s\S]*?margin:\s*0/);
    expect(src).not.toMatch(/margin:\s*safeAreaBottomPx/);
  });

  it('ad-filled hides .ad-slot chrome but keeps banner-h', () => {
    const css = readFileSync('src/style.css', 'utf8');
    expect(css).toContain('html.ad-filled');
    expect(css).toContain('calc(50px + var(--safe-b))');
    expect(css).toMatch(/html\.ad-filled \.ad-slot\s*\{[^}]*opacity:\s*0/);
    expect(css).toMatch(/html\.ad-filled \.ad-slot\s*\{[^}]*background:\s*transparent/);
  });
});
