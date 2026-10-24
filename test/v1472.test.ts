import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import { adsWanted } from '../src/native/banner';

describe('1.4.73 ad slot: hide until fill, no white safe-area band', () => {
  it('version 1.4.75 / versionCode 82', () => {
    expect(APP_VERSION).toBe('1.4.75');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+82/);
    expect(g).toContain('1.4.75');
  });

  it('CSS: default banner-h is safe-b only; ad-filled adds 50px; ad-banner sits on safe-b without padding-bottom', () => {
    const css = readFileSync('src/style.css', 'utf8');
    expect(css).toMatch(/--banner-h:\s*var\(--safe-b\)/);
    expect(css).toContain('html.ad-filled');
    expect(css).toContain('calc(50px + var(--safe-b))');
    expect(css).toContain('html:not(.ad-filled) .ad-banner');
    const ad = css.slice(css.indexOf('/* Bottom banner slot'));
    expect(ad).toMatch(/bottom:\s*var\(--safe-b\)/);
    expect(ad).toMatch(/height:\s*50px/);
    expect(ad).toMatch(/padding-bottom:\s*0/);
    expect(ad).not.toMatch(/padding-bottom:\s*var\(--safe-b\)/);
    expect(css).toMatch(/html\.ad-filled \.ad-slot/);
    expect(css).toMatch(/opacity:\s*0/);
  });

  it('Android plugin notifies adLoaded / adFailed', () => {
    const java = readFileSync('android/app/src/main/java/app/sekaitree/game/TreeBannerPlugin.java', 'utf8');
    expect(java).toContain('onAdLoaded');
    expect(java).toContain('onAdFailedToLoad');
    expect(java).toContain('notifyListeners("adLoaded"');
    expect(java).toContain('notifyListeners("adFailed"');
  });

  it('adsWanted still requires native + visible + consent + not premium', () => {
    expect(adsWanted({ native: true, visible: true, premium: false, consent: true })).toBe(true);
    expect(adsWanted({ native: false, visible: true, premium: false, consent: true })).toBe(false);
    expect(adsWanted({ native: true, visible: true, premium: true, consent: true })).toBe(false);
    expect(adsWanted({ native: true, visible: true, premium: false, consent: false })).toBe(false);
  });

  it('banner module exports initAdSlot and fill-aware sync', () => {
    const src = readFileSync('src/native/banner.ts', 'utf8');
    expect(src).toContain('export function initAdSlot');
    expect(src).toContain('ad-filled');
    expect(src).toContain('BannerAdPluginEvents.Loaded');
    expect(src).toContain('BannerAdPluginEvents.FailedToLoad');
    expect(src).toMatch(/margin:\s*0/);
  });
});
