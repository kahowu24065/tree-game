import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./index-DY4sH11A.js";var s=[[`自動（跟天氣）`,null],[`平靜`,.05],[`微風`,.25],[`強風`,.55],[`暴雨`,.7],[`颱風`,1]],c=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,l=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function u(u,d){u.hidden=!1,u.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${c}</button><section class="dev-panel glass" hidden></section>`;let f=u.querySelector(`.dev-panel`),p=!1,m=null,h=``,g=()=>{let t=d.ecoCaps();return t?`動物上限（${e[t.stage]}）：${t.groups} 組・${t.members} 隻・體型最大「${t.maxSize}」；而家訪客 ${t.visitorGroups} 組 ${t.visitorMembers} 隻${t.residentGroups?`，另長駐 ${t.residentGroups} 組`:``}`:`動物上限：（場景未準備好）`},_=()=>`畫面上：${d.ecoInfo().map(e=>`${e.name}×${e.count}${e.resident?`（長駐）`:``}`).join(`、`)||`冇`}`,v=()=>{let c=d.dev();if(f.hidden=!c.open,u.classList.toggle(`open`,c.open),!c.open||p)return;let v=d.state(),y=d.countdown(),b=e=>`<button type="button" class="${c.events.includes(e)?`on`:``}" data-dev-event="${e}" ${c.mode===`real`?`disabled`:``}>${r(a[e].label)}<small>${a[e].damage?`−${a[e].damage}`:`0`}</small></button>`,x=e=>`<option value="${e}" ${c.forecast?.event===e?`selected`:``}>${r(a[e].label)}</option>`,S=c.forecast?Math.max(0,(c.forecast.at-Date.now())/36e5):6;f.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${c.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${c.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <p class="dev-note">${c.mode===`real`?`真實：${r(d.liveEvents().map(e=>a[e].label).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告：熱、雨、風三類會疊加（同類只計最嚴重）。揀酷熱／暴雨／黑雨會即刻計水分（每日每樣一次），仲會出應急行動掣。`}</p>
      <div class="dev-events">${d.events.map(b).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${c.mode===`real`?`disabled`:``}><option value="">（冇）</option>${d.events.filter(e=>a[e].severe).map(x).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${S.toFixed(1)}" data-dev-fc-hours ${c.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${y?`${r(a[y.event].label)} · ${y.active?`生效中`:`${y.hours.toFixed(1)} 小時後`}（${r(y.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${l.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="${e===`moisture`?150:100}" step="1" value="${Math.round(v[e])}" data-dev-stat="${e}"/><b>${Math.round(v[e])}</b></label>`).join(``)}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="time">時間：${c.time===`auto`?`真實`:c.time===`day`?`日間`:`夜間`}</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <h4 class="dev-h">風災・倒塌（v13）</h4>
      <div class="dev-actions">
        <button type="button" class="${v.windUnlocked?`on`:``}" data-dev="wind-toggle">風災解鎖：${v.windUnlocked?`開`:`關`}</button>
        <button type="button" data-dev="grow-young">長到青年樹</button>
        ${[0,1,2,3].map(e=>`<button type="button" class="${(v.collapses||0)===e?`on`:``}" data-dev-collapses="${e}">倒塌 ${e}</button>`).join(``)}
      </div>
      <p class="dev-note">倒塌 ${v.collapses||0}/2${v.doubleRDate?`・雙倍加固日 ${r(v.doubleRDate)}`:``}${v.doubleRPending?`・雙倍加固待開始`:``}・高度 ${Math.round(v.heightCm)} 厘米</p>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${r(t.find(e=>e.id===v.species)?.name??``)}）</option>${t.map(e=>`<option value="${e.id}" ${c.preview.species===e.id?`selected`:``}>${r(e.name)}（${e.season}）</option>`).join(``)}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${e.map((e,t)=>`<option value="${t}" ${c.preview.stage===t?`selected`:``}>${t+1}. ${e}</option>`).join(``)}</select></label>
        <label>島嶼 <select data-dev-island><option value="">（跟樹）</option>${e.map((e,t)=>`<option value="${t}" ${c.preview.island===t?`selected`:``}>${t+1}. ${e}島</option>`).join(``)}</select></label>
      </div>
      <p class="dev-note" data-dev-habitat>${r(d.habitatInfo())}</p>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${s.map(([e,t],n)=>`<option value="${n}" ${c.sway===t?`selected`:``}>${e}</option>`).join(``)}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${d.sway().toFixed(2)}${c.sway===null?`（跟天氣／手動天氣）`:`（強制）`}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${n.map(e=>`<option value="${e.id}" ${e.id===h?`selected`:``}>${r(i[e.category])}・${r(e.name)}</option>`).join(``)}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
        <button type="button" data-dev="follow">${m?`停止跟拍`:`鏡頭跟拍`}</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${v.animals.length}/${n.length}）</button>
      </div>
      <p class="dev-note" data-dev-caps>${r(g())}</p>
      <p class="dev-note" data-dev-eco>${r(_())}</p>
      <p class="dev-note">今日計算用：${r(d.todayEvents().map(e=>a[e].label).join(`、`))}${v.virtualToday?`・虛擬日期 ${r(v.virtualToday)}`:``}${v.pest.active?`・有蟲害`:``}${v.dying?`・瀕死`:``}</p>
      ${v.lastSettlement?o(v.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return u.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...d.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),d.setDev({...n,events:t}),v();return}let i=t.closest(`[data-dev-collapses]`);if(i){d.setCollapses(Number(i.dataset.devCollapses)),v();return}let a=t.closest(`[data-dev]`)?.dataset.dev;if(a){if(a===`wind-toggle`&&d.setWindUnlocked(!d.state().windUnlocked),a===`grow-young`&&d.setStageHeight(2),a===`toggle`&&d.setDev({...n,open:!n.open}),a===`mode-real`&&d.setDev({...n,mode:`real`}),a===`mode-manual`&&d.setDev({...n,mode:`manual`}),a===`time`&&d.setDev({...n,time:n.time===`auto`?`day`:n.time===`day`?`night`:`auto`}),a===`advance`&&d.advanceDay(),a===`pest`&&d.triggerPest(),a===`real-date`&&d.realDate(),a===`glare`&&d.triggerGlare(),a===`spawn`){let e=u.querySelector(`[data-dev-animal]`)?.value;e&&(h=e,d.spawnAnimal(e)),window.setTimeout(v,50)}if(a===`follow`){let e=u.querySelector(`[data-dev-animal]`)?.value??null;h=e??h,m=m?null:e,d.followAnimal(m)}a===`rotate`&&(d.rotateAnimals(),window.setTimeout(v,50)),a===`unlock-all`&&d.unlockAll(),a===`reset`&&confirm(`重置存檔？徽章會保留。`)&&d.reset(),v()}}),u.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){p=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),d.setStat(t.dataset.devStat,Number(t.value)),p=!1}}),u.addEventListener(`change`,e=>{let t=e.target,n=d.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(u.querySelector(`[data-dev-fc-hours]`)?.value??6);d.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),v()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(d.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),v()),t instanceof HTMLInputElement&&t.dataset.devStat&&v(),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-species`)&&(d.setPreview({...n.preview,species:t.value||void 0}),v()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-stage`)&&(d.setPreview({...n.preview,stage:t.value===``?void 0:Number(t.value)}),v()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-island`)&&(d.setPreview({...n.preview,island:t.value===``?void 0:Number(t.value)}),v()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-sway`)&&(d.setSway(s[Number(t.value)]?.[1]??null),v())}),window.setInterval(()=>{if(!u.isConnected||!d.dev().open)return;let e=u.querySelector(`[data-dev-caps]`),t=u.querySelector(`[data-dev-eco]`);e&&(e.textContent=g()),t&&(t.textContent=_())},1500),v(),v}export{u as mountDevPanel};