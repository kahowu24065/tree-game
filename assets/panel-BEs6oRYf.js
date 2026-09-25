import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./index-CYSLVTcs.js";var s=[[`自動（跟天氣）`,null],[`平靜`,.05],[`微風`,.25],[`強風`,.55],[`暴雨`,.7],[`颱風`,1]],c=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,l=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function u(u,d){u.hidden=!1,u.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${c}</button><section class="dev-panel glass" hidden></section>`;let f=u.querySelector(`.dev-panel`),p=!1,m=()=>{let c=d.dev();if(f.hidden=!c.open,u.classList.toggle(`open`,c.open),!c.open||p)return;let m=d.state(),h=d.countdown(),g=e=>`<button type="button" class="${c.events.includes(e)?`on`:``}" data-dev-event="${e}" ${c.mode===`real`?`disabled`:``}>${r(a[e].label)}<small>${a[e].damage?`−${a[e].damage}`:`0`}</small></button>`,_=e=>`<option value="${e}" ${c.forecast?.event===e?`selected`:``}>${r(a[e].label)}</option>`,v=c.forecast?Math.max(0,(c.forecast.at-Date.now())/36e5):6;f.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${c.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${c.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${c.mode===`real`?`真實：${r(d.liveEvents().map(e=>a[e].label).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告，測試「唔疊加，只計最重」。`}</p>
      <div class="dev-events">${d.events.map(g).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${c.mode===`real`?`disabled`:``}><option value="">（冇）</option>${d.events.filter(e=>a[e].severe).map(_).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${v.toFixed(1)}" data-dev-fc-hours ${c.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${h?`${r(a[h.event].label)} · ${h.active?`生效中`:`${h.hours.toFixed(1)} 小時後`}（${r(h.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${l.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="100" step="1" value="${Math.round(m[e])}" data-dev-stat="${e}"/><b>${Math.round(m[e])}</b></label>`).join(``)}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${c.time===`auto`?`真實`:c.time===`day`?`日間`:`夜間`}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${r(t.find(e=>e.id===m.species)?.name??``)}）</option>${t.map(e=>`<option value="${e.id}" ${c.preview.species===e.id?`selected`:``}>${r(e.name)}（${e.season}）</option>`).join(``)}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${e.map((e,t)=>`<option value="${t}" ${c.preview.stage===t?`selected`:``}>${t+1}. ${e}</option>`).join(``)}</select></label>
      </div>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${s.map(([e,t],n)=>`<option value="${n}" ${c.sway===t?`selected`:``}>${e}</option>`).join(``)}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${d.sway().toFixed(2)}${c.sway===null?`（跟天氣／手動天氣）`:`（強制）`}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${n.map(e=>`<option value="${e.id}">${r(i[e.category])}・${r(e.name)}</option>`).join(``)}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${m.animals.length}/${n.length}）</button>
      </div>
      <p class="dev-note" data-dev-eco>畫面上：${r(d.ecoInfo().map(e=>`${e.name}×${e.count}${e.resident?`（長駐）`:``}`).join(`、`)||`冇`)}</p>
      <p class="dev-note">今日計算用：${r(d.todayEvents().map(e=>a[e].label).join(`、`))}${m.virtualToday?`・虛擬日期 ${r(m.virtualToday)}`:``}${m.pest.active?`・有蟲害`:``}${m.dying?`・瀕死`:``}</p>
      ${m.lastSettlement?o(m.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return u.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...d.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),d.setDev({...n,events:t}),m();return}let i=t.closest(`[data-dev]`)?.dataset.dev;if(i){if(i===`toggle`&&d.setDev({...n,open:!n.open}),i===`mode-real`&&d.setDev({...n,mode:`real`}),i===`mode-manual`&&d.setDev({...n,mode:`manual`}),i===`time`&&d.setDev({...n,time:n.time===`auto`?`day`:n.time===`day`?`night`:`auto`}),i===`advance`&&d.advanceDay(),i===`pest`&&d.triggerPest(),i===`real-date`&&d.realDate(),i===`glare`&&d.triggerGlare(),i===`spawn`){let e=u.querySelector(`[data-dev-animal]`)?.value;e&&d.spawnAnimal(e),window.setTimeout(m,50)}i===`rotate`&&(d.rotateAnimals(),window.setTimeout(m,50)),i===`unlock-all`&&d.unlockAll(),i===`reset`&&confirm(`重置存檔？徽章會保留。`)&&d.reset(),m()}}),u.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){p=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),d.setStat(t.dataset.devStat,Number(t.value)),p=!1}}),u.addEventListener(`change`,e=>{let t=e.target,n=d.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(u.querySelector(`[data-dev-fc-hours]`)?.value??6);d.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),m()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(d.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),m()),t instanceof HTMLInputElement&&t.dataset.devStat&&m(),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-species`)&&(d.setPreview({...n.preview,species:t.value||void 0}),m()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-stage`)&&(d.setPreview({...n.preview,stage:t.value===``?void 0:Number(t.value)}),m()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-sway`)&&(d.setSway(s[Number(t.value)]?.[1]??null),m())}),m(),m}export{u as mountDevPanel};