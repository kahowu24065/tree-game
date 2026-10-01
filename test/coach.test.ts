import { describe, expect, it } from 'vitest';
import { armCoach, coachFocus, coachOpen, freshCoach, markCoach } from '../src/coach';
import { createGame, shownAge } from '../src/sim';
import { freshMeta } from '../src/meta';
import { lessonPages, logCalendarHtml, nameModal, startModal } from '../src/ui';

describe('新手引導', () => {
  it('種低之後先叫人澆水，讀完再叫人施肥，健康頁先完結', () => {
    const c = freshCoach();
    expect(coachOpen(c)).toBe(false);
    const armed = armCoach(c);
    expect(coachOpen(armed)).toBe(true);
    expect(coachFocus(armed)).toBe('water');
    const watered = markCoach(armed, 'water');
    expect(watered.done).toBe(false);
    expect(coachFocus(watered)).toBe('feed');
    const fed = markCoach(watered, 'feed');
    expect(coachFocus(fed)).toBe(null);
    expect(fed.done).toBe(false);
    const done = markCoach(fed, 'health');
    expect(done.done).toBe(true);
    expect(coachOpen(done)).toBe(false);
    expect(armCoach(done)).toBe(done);
  });

  it('知道喇就完結，唔使讀晒', () => {
    const done = markCoach(armCoach(freshCoach()), 'skip');
    expect(done.done).toBe(true);
    expect(done.water).toBe(true);
    expect(done.feed).toBe(true);
    expect(done.health).toBe(true);
    expect(done.carbon).toBe(true);
    expect(coachOpen(done)).toBe(false);
  });

  it('澆水四頁、施肥兩頁、跟住健康頁', () => {
    const water = lessonPages('water');
    const feed = lessonPages('feed');
    const health = lessonPages('health');
    expect(water).toHaveLength(4);
    expect(feed).toHaveLength(2);
    expect(health).toHaveLength(1);
    expect(water[0]!.body).toContain('50');
    expect(water[0]!.body).toContain('+5點');
    expect(water[0]!.body).toContain('-10點');
    expect(water[1]!.body).toContain('-24點');
    expect(water[2]!.body).toContain('+5點');
    expect(water[2]!.body).toContain('-10點');
    expect(feed[0]!.body).toContain('+25點');
    expect(feed[1]!.body).toContain('-10點');
    expect(water[2]!.body).toContain('乾旱');
    expect(water[3]!.title).toBe('酷熱澆水');
    expect(water[3]!.body).toContain('酷熱澆水');
    expect(feed[0]!.body).toContain('25');
    expect(feed[0]!.body).toContain('隔幾日');
    expect(feed[1]!.body).toContain('30');
    expect(health[0]!.body).toContain('1.5');
    expect(health[0]!.body).toContain('現實天氣');
  });

  it('先揀樹種，下一頁先改名', () => {
    const pick = startModal('世界之樹', freshMeta(), false);
    expect(pick).toContain('揀樹種');
    expect(pick).toContain('下一步');
    expect(pick).not.toContain('tree-name');
    const name = nameModal('世界之樹');
    expect(name).toContain('為棵樹改名');
    expect(name).toContain('tree-name');
    expect(name).toContain('種低');
  });
});

describe('成長日誌月曆', () => {
  it('未揀日子唔顯示日誌，今日用綠點標示', () => {
    const html = logCalendarHtml(
      [{ date: '2026-09-28', text: '澆咗水' }],
      '2026-09-29',
      '2026-09',
      '',
    );
    expect(html).toContain('class="cal-day flat today"');
    expect(html).toContain('aria-current="date"');
    expect(html).toContain('data-cal="2026-09-29"');
    expect(html).not.toContain('cal-day has');
    expect(html).not.toContain('log-list');
    expect(html).not.toContain('澆咗水');
  });

  it('點入去嗰日先顯示嗰日嘅紀錄', () => {
    const html = logCalendarHtml(
      [{ date: '2026-09-28', text: '澆咗水', time: '09:00' }],
      '2026-09-29',
      '2026-09',
      '2026-09-28',
    );
    expect(html).toContain('9月28日');
    expect(html).toContain('澆咗水');
    expect(html).not.toContain('呢日未有紀錄');
  });

  it('健康加分或維持 100 分淺綠色，扣分淺紅色，冇加減又未到 100 淺白色', () => {
    const log = [
      { date: '2026-09-27', text: '健康 80→90', kind: 'settle' as const },
      { date: '2026-09-28', text: '健康 100→100', kind: 'settle' as const },
      { date: '2026-09-26', text: '健康 70→60', kind: 'settle' as const },
      { date: '2026-09-25', text: '健康 55→55', kind: 'settle' as const },
    ];
    const html = logCalendarHtml(log, '2026-09-29', '2026-09', '', 70);
    expect(html).toContain('class="cal-day up" data-cal="2026-09-27"');
    expect(html).toContain('class="cal-day up" data-cal="2026-09-28"');
    expect(html).toContain('class="cal-day down" data-cal="2026-09-26"');
    expect(html).toContain('class="cal-day flat" data-cal="2026-09-25"');
    expect(html).toContain('class="cal-day flat today" data-cal="2026-09-29"');
    const full = logCalendarHtml(log, '2026-09-29', '2026-09', '', 100);
    expect(full).toContain('class="cal-day up today" data-cal="2026-09-29"');
  });
});

describe('樹齡由第 1 日開始', () => {
  it('種低當日顯示第 1 日，每結算一晚加一日；未種係 0', () => {
    const planted = createGame('2026-09-29', { name: '新樹' });
    planted.started = true;
    expect(shownAge(planted)).toBe(1);
    planted.ageDays = 20;
    expect(shownAge(planted)).toBe(21);
    expect(shownAge(createGame('2026-09-29'))).toBe(0);
  });
});
