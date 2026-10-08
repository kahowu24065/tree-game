// 1.4.62: ATT is requested at launch, not when the banner consent step runs.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('ATT at launch', () => {
  it('boot asks before the game module loads', () => {
    const boot = fs.readFileSync('src/boot.ts', 'utf8');
    const ask = boot.indexOf('requestAttAtLaunch');
    const game = boot.indexOf("import('./main')");
    expect(ask).toBeGreaterThan(0);
    expect(game).toBeGreaterThan(ask);
  });

  it('the banner consent step no longer raises the tracking prompt', () => {
    const src = fs.readFileSync('src/native/banner.ts', 'utf8');
    const consent = src.slice(src.indexOf('async function gatherConsent'), src.indexOf('let attStarted'));
    expect(consent).not.toContain('requestTrackingAuthorization');
    expect(src).toContain('requestAttAtLaunch');
    expect(src).toContain("preload.style.visibility = 'hidden'");
  });
});
