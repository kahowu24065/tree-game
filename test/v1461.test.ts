// 1.4.61: the confirmation toast paints above an open modal (複製存檔碼, 分享, …).
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('toast above modals', () => {
  it('lives outside the HUD stacking context, above the modal', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const app = html.slice(html.indexOf('<div id="app"'), html.indexOf('</div>\n    <div class="drawer-backdrop"'));
    expect(app).not.toContain('id="toast"');
    const modalAt = html.indexOf('id="modal"');
    const toastAt = html.indexOf('id="toast"');
    expect(modalAt).toBeGreaterThan(0);
    expect(toastAt).toBeGreaterThan(modalAt);

    const css = fs.readFileSync('src/style.css', 'utf8');
    const toast = css.slice(css.indexOf('.toast {'), css.indexOf('.toast.show'));
    expect(toast).toContain('position: fixed');
    expect(toast).toMatch(/z-index:\s*70/);
    const modal = css.slice(css.indexOf('.modal {'), css.indexOf('.modal.in'));
    const modalZ = Number(modal.match(/z-index:\s*(\d+)/)?.[1]);
    expect(modalZ).toBeLessThan(70);
  });

  it('copy and share both go through the same toast', () => {
    const main = fs.readFileSync('src/main.ts', 'utf8');
    expect(main).toContain("copyText(saveCodeText()).then((ok) => toast(");
    expect(main).toContain("toast(tl('share.saved'))");
    expect(main).toContain("toast(tl('share.failed'))");
  });
});
