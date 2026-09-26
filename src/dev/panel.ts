/**
 * 開發者面板. Loaded with a dynamic import only when DEV_PANEL is true (see src/flags.ts),
 * so a release build with VITE_DEV_PANEL=0 contains none of this.
 */
import { WEATHER_EVENTS, type WeatherEventId } from '../balance';
import type { DevApi } from '../main';
import { settlementCard } from '../ui';
import { esc } from '../util';
import { eventLabel } from '../labels';
import { SPECIES, STAGE_NAMES, type SpeciesId } from '../data/species';
import { ANIMALS, CATEGORY_LABEL } from '../data/animals';

const SWAYS: [string, number | null][] = [
  ['自動（跟天氣）', null],
  ['平靜', 0.05],
  ['微風', 0.25],
  ['強風', 0.55],
  ['暴雨', 0.7],
  ['颱風', 1],
];

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
  let following: string | null = null;
  let lastAnimal = '';
  const capsText = () => {
    const c = api.ecoCaps();
    if (!c) return '動物上限：（場景未準備好）';
    return `動物上限（${STAGE_NAMES[c.stage]}）：${c.groups} 組・${c.members} 隻・體型最大「${c.maxSize}」；而家訪客 ${c.visitorGroups} 組 ${c.visitorMembers} 隻${c.residentGroups ? `，另長駐 ${c.residentGroups} 組` : ''}`;
  };
  const ecoText = () => `畫面上：${api.ecoInfo().map((g) => `${g.name}×${g.count}${g.resident ? '（長駐）' : ''}`).join('、') || '冇'}`;

  const draw = () => {
    const d = api.dev();
    panel.hidden = !d.open;
    root.classList.toggle('open', d.open);
    if (!d.open || dragging) return;
    const s = api.state();
    const cd = api.countdown();
    const eventBtn = (id: WeatherEventId) =>
      `<button type="button" class="${d.events.includes(id) ? 'on' : ''}" data-dev-event="${id}" ${d.mode === 'real' ? 'disabled' : ''}>${esc(eventLabel(id))}<small>${WEATHER_EVENTS[id].damage ? `−${WEATHER_EVENTS[id].damage}` : '0'}</small></button>`;
    const fcBtn = (id: WeatherEventId) => `<option value="${id}" ${d.forecast?.event === id ? 'selected' : ''}>${esc(eventLabel(id))}</option>`;
    const hoursLeft = d.forecast ? Math.max(0, (d.forecast.at - Date.now()) / 3600000) : 6;
    panel.innerHTML = `
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${d.mode === 'real' ? 'on' : ''}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${d.mode === 'manual' ? 'on' : ''}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${d.mode === 'real' ? `真實：${esc(api.liveEvents().map((e) => eventLabel(e)).join('、') || '晴天／多雲')}` : '可以揀多個警告：熱、雨、風三類會疊加（同類只計最嚴重）。揀酷熱／暴雨／黑雨會即刻計水分（每日每樣一次），仲會出應急行動掣；揀寒冷會開「保暖」。'}</p>
      <div class="dev-events">${api.events.map(eventBtn).join('')}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${d.mode === 'real' ? 'disabled' : ''}><option value="">（冇）</option>${api.events.filter((e) => WEATHER_EVENTS[e].severe).map(fcBtn).join('')}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${hoursLeft.toFixed(1)}" data-dev-fc-hours ${d.mode === 'real' ? 'disabled' : ''}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${cd ? `${esc(eventLabel(cd.event))} · ${cd.active ? '生效中' : `${cd.hours.toFixed(1)} 小時後`}（${esc(cd.source)}）` : '冇'}</p>
      <div class="dev-sliders">
        ${STATS.map(([k, label]) => `<label><span>${label}</span><input type="range" min="0" max="${k === 'moisture' ? 150 : 100}" step="1" value="${Math.round(s[k])}" data-dev-stat="${k}"/><b>${Math.round(s[k])}</b></label>`).join('')}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="advance7">跳 7 日</button>
        <button type="button" data-dev="advance30">跳 30 日</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${d.time === 'auto' ? '真實' : d.time === 'day' ? '日間' : '夜間'}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <h4 class="dev-h">風災・倒塌（v13）</h4>
      <div class="dev-actions">
        <button type="button" class="${s.windUnlocked ? 'on' : ''}" data-dev="wind-toggle">風災解鎖：${s.windUnlocked ? '開' : '關'}</button>
        <button type="button" data-dev="grow-young">長到青年樹</button>
        ${[0, 1, 2, 3].map((n) => `<button type="button" class="${(s.collapses || 0) === n ? 'on' : ''}" data-dev-collapses="${n}">倒塌 ${n}</button>`).join('')}
      </div>
      <h4 class="dev-h">倒塌・枯死動畫（v16）</h4>
      <div class="dev-actions">
        <button type="button" data-dev="fx-collapse">觸發倒塌（八號風球結算）</button>
        <button type="button" data-dev="fx-fatal">觸發致命倒塌</button>
        <button type="button" data-dev="fx-replay" ${s.lastCollapse ? '' : 'disabled'}>重播倒塌</button>
        <button type="button" data-dev="fx-dying">瀕死</button>
        <button type="button" class="danger" data-dev="fx-death">枯死（動畫）</button>
      </div>
      <p class="dev-note">倒塌 ${s.collapses || 0}/2${s.doubleRDate ? `・雙倍加固日 ${esc(s.doubleRDate)}` : ''}${s.doubleRPending ? '・雙倍加固待開始' : ''}・高度 ${Math.round(s.heightCm)} 厘米・樹齡 ${s.ageDays || 0} 日・里程碑 ${Object.keys(s.milestones ?? {}).join('、') || '冇'}</p>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${esc(SPECIES.find((x) => x.id === s.species)?.name ?? '')}）</option>${SPECIES.map((x) => `<option value="${x.id}" ${d.preview.species === x.id ? 'selected' : ''}>${esc(x.name)}（紀錄 ${x.targetM} 米）</option>`).join('')}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${STAGE_NAMES.map((n, i) => `<option value="${i}" ${d.preview.stage === i ? 'selected' : ''}>${i + 1}. ${n}</option>`).join('')}</select></label>
        <label>島嶼 <select data-dev-island><option value="">（跟樹）</option>${STAGE_NAMES.map((n, i) => `<option value="${i}" ${d.preview.island === i ? 'selected' : ''}>${i + 1}. ${n}島</option>`).join('')}</select></label>
      </div>
      <p class="dev-note" data-dev-habitat>${esc(api.habitatInfo())}</p>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${SWAYS.map(([n, v], i) => `<option value="${i}" ${d.sway === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${api.sway().toFixed(2)}${d.sway === null ? '（跟天氣／手動天氣）' : '（強制）'}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${ANIMALS.map((a) => `<option value="${a.id}" ${a.id === lastAnimal ? 'selected' : ''}>${esc(CATEGORY_LABEL[a.category])}・${esc(a.name)}</option>`).join('')}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
        <button type="button" data-dev="follow">${following ? '停止跟拍' : '鏡頭跟拍'}</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${s.animals.length}/${ANIMALS.length}）</button>
      </div>
      <p class="dev-note" data-dev-caps>${esc(capsText())}</p>
      <p class="dev-note" data-dev-eco>${esc(ecoText())}</p>
      <p class="dev-note">今日計算用：${esc(api.todayEvents().map((e) => eventLabel(e)).join('、'))}${s.virtualToday ? `・虛擬日期 ${esc(s.virtualToday)}` : ''}${s.pest.active ? '・有蟲害' : ''}${s.dying ? '・瀕死' : ''}</p>
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
    const col = el.closest<HTMLElement>('[data-dev-collapses]');
    if (col) {
      api.setCollapses(Number(col.dataset.devCollapses));
      draw();
      return;
    }
    const cmd = el.closest<HTMLElement>('[data-dev]')?.dataset.dev;
    if (!cmd) return;
    if (cmd === 'wind-toggle') api.setWindUnlocked(!api.state().windUnlocked);
    if (cmd === 'grow-young') api.setStageHeight(2);
    if (cmd === 'fx-collapse') api.triggerCollapse(false);
    if (cmd === 'fx-fatal') api.triggerCollapse(true);
    if (cmd === 'fx-replay') api.replayCollapse();
    if (cmd === 'fx-dying') api.triggerDying();
    if (cmd === 'fx-death') api.triggerDeath();
    if (cmd === 'toggle') api.setDev({ ...d, open: !d.open });
    if (cmd === 'mode-real') api.setDev({ ...d, mode: 'real' });
    if (cmd === 'mode-manual') api.setDev({ ...d, mode: 'manual' });
    if (cmd === 'time') api.setDev({ ...d, time: d.time === 'auto' ? 'day' : d.time === 'day' ? 'night' : 'auto' });
    if (cmd === 'advance') api.advanceDay();
    if (cmd === 'advance7') api.advanceDays(7);
    if (cmd === 'advance30') api.advanceDays(30);
    if (cmd === 'pest') api.triggerPest();
    if (cmd === 'real-date') api.realDate();
    if (cmd === 'glare') api.triggerGlare();
    if (cmd === 'spawn') {
      const id = root.querySelector<HTMLSelectElement>('[data-dev-animal]')?.value;
      if (id) {
        lastAnimal = id;
        api.spawnAnimal(id);
      }
      window.setTimeout(draw, 50);
    }
    if (cmd === 'follow') {
      const id = root.querySelector<HTMLSelectElement>('[data-dev-animal]')?.value ?? null;
      lastAnimal = id ?? lastAnimal;
      following = following ? null : id;
      api.followAnimal(following);
    }
    if (cmd === 'rotate') {
      api.rotateAnimals();
      window.setTimeout(draw, 50);
    }
    if (cmd === 'unlock-all') api.unlockAll();
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
    if (el instanceof HTMLSelectElement && el.hasAttribute('data-dev-species')) {
      api.setPreview({ ...d.preview, species: (el.value || undefined) as SpeciesId | undefined });
      draw();
    }
    if (el instanceof HTMLSelectElement && el.hasAttribute('data-dev-stage')) {
      api.setPreview({ ...d.preview, stage: el.value === '' ? undefined : Number(el.value) });
      draw();
    }
    if (el instanceof HTMLSelectElement && el.hasAttribute('data-dev-island')) {
      api.setPreview({ ...d.preview, island: el.value === '' ? undefined : Number(el.value) });
      draw();
    }
    if (el instanceof HTMLSelectElement && el.hasAttribute('data-dev-sway')) {
      api.setSway(SWAYS[Number(el.value)]?.[1] ?? null);
      draw();
    }
  });

  // Live readouts (animals come and go on their own).
  window.setInterval(() => {
    if (!root.isConnected || !api.dev().open) return;
    const caps = root.querySelector('[data-dev-caps]');
    const eco = root.querySelector('[data-dev-eco]');
    if (caps) caps.textContent = capsText();
    if (eco) eco.textContent = ecoText();
  }, 1500);

  draw();
  return draw;
}
