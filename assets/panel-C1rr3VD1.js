import{a as e,c as t,i as n,n as r,o as i,r as a,s as o,t as s}from"./index-t5mqPM2Y.js";var c=[[`自動（跟天氣）`,null],[`平靜`,.05],[`微風`,.25],[`強風`,.55],[`暴雨`,.7],[`颱風`,1]],l=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,u=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function d(d,f){d.hidden=!1,d.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${l}</button><section class="dev-panel glass" hidden></section>`;let p=d.querySelector(`.dev-panel`),m=!1,h=null,g=``,_=()=>{let e=f.ecoCaps();return e?`動物上限（${i[e.stage]}）：${e.groups} 組・${e.members} 隻・體型最大「${e.maxSize}」；而家訪客 ${e.visitorGroups} 組 ${e.visitorMembers} 隻${e.residentGroups?`，另長駐 ${e.residentGroups} 組`:``}`:`動物上限：（場景未準備好）`},v=()=>`畫面上：${f.ecoInfo().map(e=>`${e.name}×${e.count}${e.resident?`（長駐）`:``}`).join(`、`)||`冇`}`,y=()=>{let l=f.dev();if(p.hidden=!l.open,d.classList.toggle(`open`,l.open),!l.open||m)return;let y=f.state(),b=f.countdown(),x=e=>`<button type="button" class="${l.events.includes(e)?`on`:``}" data-dev-event="${e}" ${l.mode===`real`?`disabled`:``}>${o(r(e))}<small>${t[e].damage?`−${t[e].damage}`:`0`}</small></button>`,S=e=>`<option value="${e}" ${l.forecast?.event===e?`selected`:``}>${o(r(e))}</option>`,C=l.forecast?Math.max(0,(l.forecast.at-Date.now())/36e5):6;p.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${l.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${l.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${l.mode===`real`?`真實：${o(f.liveEvents().map(e=>r(e)).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告：熱、雨、風三類會疊加（同類只計最嚴重）。揀酷熱／暴雨／黑雨會即刻計水分（每日每樣一次），仲會出應急行動掣；揀寒冷會開「保暖覆蓋」。`}</p>
      <div class="dev-events">${f.events.map(x).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${l.mode===`real`?`disabled`:``}><option value="">（冇）</option>${f.events.filter(e=>t[e].severe).map(S).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${C.toFixed(1)}" data-dev-fc-hours ${l.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${b?`${o(r(b.event))} · ${b.active?`生效中`:`${b.hours.toFixed(1)} 小時後`}（${o(b.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${u.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="${e===`moisture`?150:100}" step="1" value="${Math.round(y[e])}" data-dev-stat="${e}"/><b>${Math.round(y[e])}</b></label>`).join(``)}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="advance7">跳 7 日</button>
        <button type="button" data-dev="advance30">跳 30 日</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${l.time===`auto`?`真實`:l.time===`day`?`日間`:`夜間`}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <h4 class="dev-h">風災・倒塌（v13）</h4>
      <div class="dev-actions">
        <button type="button" class="${y.windUnlocked?`on`:``}" data-dev="wind-toggle">風災解鎖：${y.windUnlocked?`開`:`關`}</button>
        <button type="button" data-dev="grow-young">長到青年樹</button>
        ${[0,1,2,3].map(e=>`<button type="button" class="${(y.collapses||0)===e?`on`:``}" data-dev-collapses="${e}">倒塌 ${e}</button>`).join(``)}
      </div>
      <p class="dev-note">倒塌 ${y.collapses||0}/2${y.doubleRDate?`・雙倍加固日 ${o(y.doubleRDate)}`:``}${y.doubleRPending?`・雙倍加固待開始`:``}・高度 ${Math.round(y.heightCm)} 厘米・樹齡 ${y.ageDays||0} 日・里程碑 ${Object.keys(y.milestones??{}).join(`、`)||`冇`}</p>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${o(e.find(e=>e.id===y.species)?.name??``)}）</option>${e.map(e=>`<option value="${e.id}" ${l.preview.species===e.id?`selected`:``}>${o(e.name)}（紀錄 ${e.targetM} 米）</option>`).join(``)}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${i.map((e,t)=>`<option value="${t}" ${l.preview.stage===t?`selected`:``}>${t+1}. ${e}</option>`).join(``)}</select></label>
        <label>島嶼 <select data-dev-island><option value="">（跟樹）</option>${i.map((e,t)=>`<option value="${t}" ${l.preview.island===t?`selected`:``}>${t+1}. ${e}島</option>`).join(``)}</select></label>
      </div>
      <p class="dev-note" data-dev-habitat>${o(f.habitatInfo())}</p>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${c.map(([e,t],n)=>`<option value="${n}" ${l.sway===t?`selected`:``}>${e}</option>`).join(``)}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${f.sway().toFixed(2)}${l.sway===null?`（跟天氣／手動天氣）`:`（強制）`}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${a.map(e=>`<option value="${e.id}" ${e.id===g?`selected`:``}>${o(n[e.category])}・${o(e.name)}</option>`).join(``)}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
        <button type="button" data-dev="follow">${h?`停止跟拍`:`鏡頭跟拍`}</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${y.animals.length}/${a.length}）</button>
      </div>
      <p class="dev-note" data-dev-caps>${o(_())}</p>
      <p class="dev-note" data-dev-eco>${o(v())}</p>
      <p class="dev-note">今日計算用：${o(f.todayEvents().map(e=>r(e)).join(`、`))}${y.virtualToday?`・虛擬日期 ${o(y.virtualToday)}`:``}${y.pest.active?`・有蟲害`:``}${y.dying?`・瀕死`:``}</p>
      ${y.lastSettlement?s(y.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return d.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...f.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),f.setDev({...n,events:t}),y();return}let i=t.closest(`[data-dev-collapses]`);if(i){f.setCollapses(Number(i.dataset.devCollapses)),y();return}let a=t.closest(`[data-dev]`)?.dataset.dev;if(a){if(a===`wind-toggle`&&f.setWindUnlocked(!f.state().windUnlocked),a===`grow-young`&&f.setStageHeight(2),a===`toggle`&&f.setDev({...n,open:!n.open}),a===`mode-real`&&f.setDev({...n,mode:`real`}),a===`mode-manual`&&f.setDev({...n,mode:`manual`}),a===`time`&&f.setDev({...n,time:n.time===`auto`?`day`:n.time===`day`?`night`:`auto`}),a===`advance`&&f.advanceDay(),a===`advance7`&&f.advanceDays(7),a===`advance30`&&f.advanceDays(30),a===`pest`&&f.triggerPest(),a===`real-date`&&f.realDate(),a===`glare`&&f.triggerGlare(),a===`spawn`){let e=d.querySelector(`[data-dev-animal]`)?.value;e&&(g=e,f.spawnAnimal(e)),window.setTimeout(y,50)}if(a===`follow`){let e=d.querySelector(`[data-dev-animal]`)?.value??null;g=e??g,h=h?null:e,f.followAnimal(h)}a===`rotate`&&(f.rotateAnimals(),window.setTimeout(y,50)),a===`unlock-all`&&f.unlockAll(),a===`reset`&&confirm(`重置存檔？徽章會保留。`)&&f.reset(),y()}}),d.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){m=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),f.setStat(t.dataset.devStat,Number(t.value)),m=!1}}),d.addEventListener(`change`,e=>{let t=e.target,n=f.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(d.querySelector(`[data-dev-fc-hours]`)?.value??6);f.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),y()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(f.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),y()),t instanceof HTMLInputElement&&t.dataset.devStat&&y(),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-species`)&&(f.setPreview({...n.preview,species:t.value||void 0}),y()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-stage`)&&(f.setPreview({...n.preview,stage:t.value===``?void 0:Number(t.value)}),y()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-island`)&&(f.setPreview({...n.preview,island:t.value===``?void 0:Number(t.value)}),y()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-sway`)&&(f.setSway(c[Number(t.value)]?.[1]??null),y())}),window.setInterval(()=>{if(!d.isConnected||!f.dev().open)return;let e=d.querySelector(`[data-dev-caps]`),t=d.querySelector(`[data-dev-eco]`);e&&(e.textContent=_()),t&&(t.textContent=v())},1500),y(),y}export{d as mountDevPanel};