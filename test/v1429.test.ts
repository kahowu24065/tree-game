// 1.4.29: first-bird egg pop-up, plainer achievement boxes, island bar instead of a swipe.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { t } from '../src/i18n';
import { NEST_HATCH_MS, NEST_MIN_HEALTH } from '../src/nest';
import { nestIntroModal } from '../src/ui';

describe('1.4.29', () => {
  it('egg pop-up states the real rules', () => {
    const html = nestIntroModal('鵲鴝');
    expect(html).toContain('鵲鴝');
    expect(html).toContain(`${NEST_MIN_HEALTH} 或以上`);
    expect(html).toContain(`${NEST_HATCH_MS / 3600_000} 個鐘`);
    expect(html).toContain('data-action="close-modal"');
  });
  it('weather achievement box: name, condition, count, next — nothing else', () => {
    const box = t('ui.316', { p0: '', p1: '風暴', n: 2, p3: '個', p4: '條件', p5: '捱過 3 個風暴' });
    expect(box).toContain('已捱過 2 個');
    expect(box).toContain('下一個成就：捱過 3 個風暴');
    expect(box).not.toMatch(/已拎|\/ /);
    expect(t('ui.324', { wxNote: 'SRC' })).toContain('SRC');
    expect(t('balance.036')).not.toContain('同一場');
  });
  it('no swipe between islands; the bar switches', () => {
    const scene = readFileSync('src/three/scene3d.ts', 'utf8');
    expect(scene).not.toContain('onIslandSwipe');
    expect(readFileSync('index.html', 'utf8')).toContain('id="isle-bar"');
    for (const k of ['isle.one', 'isle.two', 'isle.locked']) expect(t(k)).not.toBe(k);
    expect(t('guide.066')).not.toContain('滑');
  });
});
