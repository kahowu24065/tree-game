import{n as e,r as t,t as n}from"./index-DoOHorTJ.js";var r=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,i=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function a(a,o){a.hidden=!1,a.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${r}</button><section class="dev-panel glass" hidden></section>`;let s=a.querySelector(`.dev-panel`),c=!1,l=()=>{let r=o.dev();if(s.hidden=!r.open,a.classList.toggle(`open`,r.open),!r.open||c)return;let l=o.state(),u=o.countdown(),d=n=>`<button type="button" class="${r.events.includes(n)?`on`:``}" data-dev-event="${n}" ${r.mode===`real`?`disabled`:``}>${e(t[n].label)}<small>${t[n].damage?`−${t[n].damage}`:`0`}</small></button>`,f=n=>`<option value="${n}" ${r.forecast?.event===n?`selected`:``}>${e(t[n].label)}</option>`,p=r.forecast?Math.max(0,(r.forecast.at-Date.now())/36e5):6;s.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${r.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${r.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${r.mode===`real`?`真實：${e(o.liveEvents().map(e=>t[e].label).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告，測試「唔疊加，只計最重」。`}</p>
      <div class="dev-events">${o.events.map(d).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${r.mode===`real`?`disabled`:``}><option value="">（冇）</option>${o.events.filter(e=>t[e].severe).map(f).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${p.toFixed(1)}" data-dev-fc-hours ${r.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${u?`${e(t[u.event].label)} · ${u.active?`生效中`:`${u.hours.toFixed(1)} 小時後`}（${e(u.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${i.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="100" step="1" value="${Math.round(l[e])}" data-dev-stat="${e}"/><b>${Math.round(l[e])}</b></label>`).join(``)}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${r.time===`auto`?`真實`:r.time===`day`?`日間`:`夜間`}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <p class="dev-note">今日計算用：${e(o.todayEvents().map(e=>t[e].label).join(`、`))}${l.virtualToday?`・虛擬日期 ${e(l.virtualToday)}`:``}${l.pest.active?`・有蟲害`:``}${l.dying?`・瀕死`:``}</p>
      ${l.lastSettlement?n(l.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return a.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...o.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),o.setDev({...n,events:t}),l();return}let i=t.closest(`[data-dev]`)?.dataset.dev;i&&(i===`toggle`&&o.setDev({...n,open:!n.open}),i===`mode-real`&&o.setDev({...n,mode:`real`}),i===`mode-manual`&&o.setDev({...n,mode:`manual`}),i===`time`&&o.setDev({...n,time:n.time===`auto`?`day`:n.time===`day`?`night`:`auto`}),i===`advance`&&o.advanceDay(),i===`pest`&&o.triggerPest(),i===`real-date`&&o.realDate(),i===`reset`&&confirm(`重置存檔？徽章會保留。`)&&o.reset(),l())}),a.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){c=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),o.setStat(t.dataset.devStat,Number(t.value)),c=!1}}),a.addEventListener(`change`,e=>{let t=e.target,n=o.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(a.querySelector(`[data-dev-fc-hours]`)?.value??6);o.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),l()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(o.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),l()),t instanceof HTMLInputElement&&t.dataset.devStat&&l()}),l(),l}export{a as mountDevPanel};