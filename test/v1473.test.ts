import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { APP_VERSION } from '../src/version';

describe('1.4.73 Premium card CSS + legal link spacing', () => {
  it('version 1.4.74 / versionCode 81', () => {
    expect(APP_VERSION).toBe('1.4.74');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+81/);
    expect(g).toContain('1.4.74');
  });

  it('style.css has prem-card and prem-legal; settings uses .prem-card not .premium-card', () => {
    const css = readFileSync('src/style.css', 'utf8');
    expect(css).toContain('.prem-card {');
    expect(css).toContain('.prem-card-cta');
    expect(css).toContain('.prem-legal');
    expect(css).toMatch(/\.prem-legal\s*\{[^}]*display:\s*flex/s);
    expect(css).toContain('.modal-card.settings-sheet .prem-card');
    expect(css).not.toContain('.modal-card.settings-sheet .premium-card');
  });

  it('premiumUi legal/manage use separators when present', () => {
    if (!existsSync('src/premiumUi.ts')) return;
    const src = readFileSync('src/premiumUi.ts', 'utf8');
    expect(src).toContain('prem-legal-sep');
    expect(src).toMatch(/legal[\s\S]*prem-legal-sep[\s\S]*privacy/);
    expect(src).toMatch(/premium-restore[\s\S]*|prem-legal-sep[\s\S]*premium-restore/);
  });
});
