import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { APP_VERSION } from '../src/version';
import { tables } from '../src/i18n';

describe('1.4.69 sheet underlay + reopen vignette', () => {
  it('version 1.4.69 / versionCode 76', () => {
    expect(APP_VERSION).toBe('1.4.69');
    const g = readFileSync('android/app/build.gradle', 'utf8');
    expect(g).toMatch(/versionCode\s+76/);
    expect(g).toContain('1.4.69');
  });

  it('sheet keeps 1.4.68 content box; ::after fills under dock', () => {
    const css = readFileSync('src/style.css', 'utf8');
    const start = css.indexOf('/* ---------- Growth log sheet');
    const sheet = css.slice(start, start + 2200);
    expect(sheet).toContain('bottom: calc(var(--dock-h) - 14px)');
    expect(sheet).toContain('bottom: var(--banner-h)');
    expect(sheet).toContain('height: min(62vh, 560px)');
    expect(sheet).toContain('.sheet::after');
    expect(sheet).toContain('width: 100vw');
    expect(sheet).toContain('overflow: visible');
    expect(sheet).not.toMatch(/\.sheet\[data-state='open'\]\s*\{[^}]*bottom:\s*0/);
  });

  it('Care 今日小事 card and scene vignette reopen the illustration modal', () => {
    for (const loc of ['zh-HK', 'zh-TW', 'zh-CN', 'en'] as const) {
      expect(tables()[loc]['ui.215']).toContain('open-vignette-day');
    }
    const main = readFileSync('src/main.ts', 'utf8');
    expect(main).toContain('function openTodayVignetteCard');
    expect(main).toContain("case 'open-vignette-day'");
    expect(main).toMatch(/hit\.kind === 'vignette'[\s\S]*?openTodayVignetteCard/);
  });
});
