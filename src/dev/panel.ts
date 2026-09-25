/**
 * 開發者面板. Loaded with a dynamic import only when DEV_PANEL is true (see src/flags.ts),
 * so a release build with VITE_DEV_PANEL=0 contains none of this.
 */
import { WEATHER_EVENTS, type WeatherEventId } from '../balance';
import type { DevApi } from '../main';
import { settlementCard } from '../ui';
import { esc } from '../util';

const WRENCH =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>';

type StatKey = 'health' | 'moisture' | 'nutrients' | 'resist';
const STATS: [StatKey, string][] = [
  ['health', '健康 H'],
  ['moisture', '水分 W'],
  ['nutrients', '養分 N'],
  ['resist', '抗風力 R'],
];

export function mountDevPanel(root: HTMLElement, api: DevApi): () => void {
  root.hidden = false;
  root.innerHTML = `<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${WRENCH}</button><section class="dev-panel glass" hidden></section>`;
  const panel = root.querySelector<HTMLElement>('.dev-panel')!;
  let dragging = false;

  const draw = () => {
    const d = api.dev();
    panel.hidden = !d.open;
    root.classList.toggle('open', d.open);
    if (!d.open || dragging) return;
    const s = api.state();
    const cd = api.countdown();
    const eventBtn = (id: WeatherEventId) =>
      `<button type="button" class="${d.events.includes(id) ? 'on' : ''}" data-dev-event="${id}" ${d.mode === 'real' ? 'disabled' : ''}>${esc(WEATHER_EVENTS[id].label)}<small>${WEATHER_EVENTS[id].damage ? `−${WEATHER_EVENTS[id].damage}` : '0'}</small></button>`;
    const fcBtn = (id: WeatherEventId) => `<option value="${id}" ${d.forecast?.event === id ? 'selected' : ''}>${esc(WEATHER_EVENTS[id].label)}</option>`;
    const hoursLeft = d.forecast ? Math.max(0, (d.forecast.at - Date.now()) / 3600000) : 6;
    panel.innerHTML = `
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${d.mode === 'real' ? 'on' : ''}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${d.mode === 'manual' ? 'on' : ''}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${d.mode === 'real' ? `真實：${esc(api.liveEvents().map((e) => WEATHER_EVENTS[e].label).join('、') || '晴天／多雲')}` : '可以揀多個警告，測試「唔疊加，只計最重」。'}</p>
      <div class="dev-events">${api.events.map(eventBtn).join('')}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${d.mode === 'real' ? 'disabled' : ''}><option value="">（冇）</option>${api.events.filter((e) => WEATHER_EVENTS[e].severe).map(fcBtn).join('')}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${hoursLeft.toFixed(1)}" data-dev-fc-hours ${d.mode === 'real' ? 'disabled' : ''}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${cd ? `${esc(WEATHER_EVENTS[cd.event].label)} · ${cd.active ? '生效中' : `${cd.hours.toFixed(1)} 小時後`}（${esc(cd.source)}）` : '冇'}</p>
      <div class="dev-sliders">
        ${STATS.map(([k, label]) => `<label><span>${label}</span><input type="range" min="0" max="100" step="1" value="${Math.round(s[k])}" data-dev-stat="${k}"/><b>${Math.round(s[k])}</b></label>`).join('')}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${d.time === 'auto' ? '真實' : d.time === 'day' ? '日間' : '夜間'}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <p class="dev-note">今日計算用：${esc(api.todayEvents().map((e) => WEATHER_EVENTS[e].label).join('、'))}${s.virtualToday ? `・虛擬日期 ${esc(s.virtualToday)}` : ''}${s.pest.active ? '・有蟲害' : ''}${s.dying ? '・瀕死' : ''}</p>
      ${s.lastSettlement ? settlementCard(s.lastSettlement) : '<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>'}
    `;
  };

  root.addEventListener('click', (event) => {
    const el = event.target instanceof Element ? event.target : null;
    if (!el) return;
    const d = { ...api.dev() };
    const evBtn = el.closest<HTMLElement>('[data-dev-event]');
    if (evBtn) {
      const id = evBtn.dataset.devEvent as WeatherEventId;
      let events = d.events.includes(id) ? d.events.filter((e) => e !== id) : [...d.events, id];
      if (id === 'clear') events = ['clear'];
      else events = events.filter((e) => e !== 'clear');
      if (!events.length) events = ['clear'];
      api.setDev({ ...d, events });
      draw();
      return;
    }
    const cmd = el.closest<HTMLElement>('[data-dev]')?.dataset.dev;
    if (!cmd) return;
    if (cmd === 'toggle') api.setDev({ ...d, open: !d.open });
    if (cmd === 'mode-real') api.setDev({ ...d, mode: 'real' });
    if (cmd === 'mode-manual') api.setDev({ ...d, mode: 'manual' });
    if (cmd === 'time') api.setDev({ ...d, time: d.time === 'auto' ? 'day' : d.time === 'day' ? 'night' : 'auto' });
    if (cmd === 'advance') api.advanceDay();
    if (cmd === 'pest') api.triggerPest();
    if (cmd === 'real-date') api.realDate();
    if (cmd === 'reset' && confirm('重置存檔？徽章會保留。')) api.reset();
    draw();
  });

  root.addEventListener('input', (event) => {
    const el = event.target;
    if (el instanceof HTMLInputElement && el.dataset.devStat) {
      dragging = true;
      const out = el.parentElement?.querySelector('b');
      if (out) out.textContent = el.value;
      api.setStat(el.dataset.devStat as StatKey, Number(el.value));
      dragging = false;
    }
  });

  root.addEventListener('change', (event) => {
    const el = event.target;
    const d = api.dev();
    if (el instanceof HTMLSelectElement && el.hasAttribute('data-dev-fc-event')) {
      const hours = Number(root.querySelector<HTMLInputElement>('[data-dev-fc-hours]')?.value ?? 6);
      api.setDev({ ...d, forecast: el.value ? { event: el.value as WeatherEventId, at: Date.now() + hours * 3600000 } : null });
      draw();
    }
    if (el instanceof HTMLInputElement && el.hasAttribute('data-dev-fc-hours') && d.forecast) {
      api.setDev({ ...d, forecast: { ...d.forecast, at: Date.now() + Math.max(0, Math.min(12, Number(el.value))) * 3600000 } });
      draw();
    }
    if (el instanceof HTMLInputElement && el.dataset.devStat) draw();
  });

  draw();
  return draw;
}
