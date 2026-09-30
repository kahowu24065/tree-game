import{$t as e,Gt as t,Ht as n,It as r,On as i,Sr as a,Vt as o,k as s,kn as c}from"./ui-7KDcnsOe.js";var l=[[`自動（跟天氣）`,null],[`平靜`,.05],[`微風`,.25],[`強風`,.55],[`暴雨`,.7],[`颱風`,1]],u=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,d=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function f(f,p){f.hidden=!1,f.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${u}</button><section class="dev-panel glass" hidden></section>`;let m=f.querySelector(`.dev-panel`),h=!1,g=null,_=``,v=()=>{let e=p.ecoCaps();return e?`動物上限（${c[e.stage]}）：${e.groups} 組・${e.members} 隻・體型最大「${e.maxSize}」；而家訪客 ${e.visitorGroups} 組 ${e.visitorMembers} 隻${e.residentGroups?`，另長駐 ${e.residentGroups} 組`:``}`:`動物上限：（場景未準備好）`},y=()=>`畫面上：${p.ecoInfo().map(e=>`${e.name}×${e.count}${e.resident?`（長駐）`:``}`).join(`、`)||`冇`}`,b=()=>{let u=p.dev();if(m.hidden=!u.open,f.classList.toggle(`open`,u.open),!u.open||h)return;let b=p.state(),x=p.countdown(),S=n=>`<button type="button" class="${u.events.includes(n)?`on`:``}" data-dev-event="${n}" ${u.mode===`real`?`disabled`:``}>${e(t(n))}<small>${a[n].damage?`−${a[n].damage}`:`0`}</small></button>`,C=n=>`<option value="${n}" ${u.forecast?.event===n?`selected`:``}>${e(t(n))}</option>`,w=u.forecast?Math.max(0,(u.forecast.at-Date.now())/36e5):6;m.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${u.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${u.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <div class="dev-seg time">
        <button type="button" class="${u.time===`auto`?`on`:``}" data-dev="time-auto">真實時間</button>
        <button type="button" class="${u.time===`day`?`on`:``}" data-dev="time-day">日頭</button>
        <button type="button" class="${u.time===`night`?`on`:``}" data-dev="time-night">夜晚</button>
      </div>
      <p class="dev-note">${u.mode===`real`?`真實：${e(p.liveEvents().map(e=>t(e)).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告：熱、雨、風三類會疊加（同類只計最嚴重）。揀毛毛雨／酷熱天氣警告／暴雨／黑雨會即刻計水分（每日每樣一次），仲會出應急行動掣；揀寒冷會開「保暖」。`}</p>
      <div class="dev-events">${p.events.map(S).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${u.mode===`real`?`disabled`:``}><option value="">（冇）</option>${p.events.filter(e=>a[e].severe).map(C).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${w.toFixed(1)}" data-dev-fc-hours ${u.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${x?`${e(t(x.event))} · ${x.active?`生效中`:`${x.hours.toFixed(1)} 小時後`}（${e(x.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${d.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="${e===`moisture`?150:100}" step="1" value="${Math.round(b[e])}" data-dev-stat="${e}"/><b>${Math.round(b[e])}</b></label>`).join(``)}
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="advance">跳去下一日（即刻結算）</button>
        <button type="button" data-dev="advance7">跳 7 日</button>
        <button type="button" data-dev="advance30">跳 30 日</button>
        <button type="button" data-dev="pest">觸發蟲害</button>
        <button type="button" data-dev="real-date">回到真日期</button>
        <button type="button" class="danger" data-dev="reset">重置存檔</button>
      </div>
      <h4 class="dev-h">風災・倒塌（v13）</h4>
      <div class="dev-actions">
        <button type="button" class="${b.windUnlocked?`on`:``}" data-dev="wind-toggle">風災解鎖：${b.windUnlocked?`開`:`關`}</button>
        <button type="button" data-dev="grow-young">長到青年樹</button>
        ${[0,1,2,3].map(e=>`<button type="button" class="${(b.collapses||0)===e?`on`:``}" data-dev-collapses="${e}">倒塌 ${e}</button>`).join(``)}
      </div>
      <h4 class="dev-h">倒塌・枯死動畫（v16）</h4>
      <div class="dev-actions">
        <button type="button" data-dev="fx-collapse">觸發倒塌（八號風球結算）</button>
        <button type="button" data-dev="fx-fatal">觸發致命倒塌</button>
        <button type="button" data-dev="fx-replay" ${b.lastCollapse?``:`disabled`}>重播倒塌</button>
        <button type="button" data-dev="fx-dying">瀕死</button>
        <button type="button" class="danger" data-dev="fx-death">枯死（動畫）</button>
      </div>
      <p class="dev-note">倒塌 ${b.collapses||0}/2${b.doubleRDate?`・雙倍加固日 ${e(b.doubleRDate)}`:``}${b.doubleRPending?`・雙倍加固待開始`:``}・高度 ${Math.round(b.heightCm)} 厘米・樹齡 ${r(b)} 日・里程碑 ${Object.keys(b.milestones??{}).join(`、`)||`冇`}</p>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${e(i.find(e=>e.id===b.species)?.name??``)}）</option>${i.map(t=>`<option value="${t.id}" ${u.preview.species===t.id?`selected`:``}>${e(t.name)}（紀錄 ${t.targetM} 米）</option>`).join(``)}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${c.map((e,t)=>`<option value="${t}" ${u.preview.stage===t?`selected`:``}>${t+1}. ${e}</option>`).join(``)}</select></label>
        <label>島嶼 <select data-dev-island><option value="">（跟樹）</option>${c.map((e,t)=>`<option value="${t}" ${u.preview.island===t?`selected`:``}>${t+1}. ${e}島</option>`).join(``)}</select></label>
      </div>
      <p class="dev-note" data-dev-habitat>${e(p.habitatInfo())}</p>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${l.map(([e,t],n)=>`<option value="${n}" ${u.sway===t?`selected`:``}>${e}</option>`).join(``)}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${p.sway().toFixed(2)}${u.sway===null?`（跟天氣／手動天氣）`:`（強制）`}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${o.map(t=>`<option value="${t.id}" ${t.id===_?`selected`:``}>${e(n[t.category])}・${e(t.name)}</option>`).join(``)}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
        <button type="button" data-dev="follow">${g?`停止跟拍`:`鏡頭跟拍`}</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${b.animals.length}/${o.length}）</button>
      </div>
      <p class="dev-note" data-dev-caps>${e(v())}</p>
      <p class="dev-note" data-dev-eco>${e(y())}</p>
      <p class="dev-note">今日計算用：${e(p.todayEvents().map(e=>t(e)).join(`、`))}${b.virtualToday?`・虛擬日期 ${e(b.virtualToday)}`:``}${b.pest.active?`・有蟲害`:``}${b.dying?`・瀕死`:``}</p>
      ${b.lastSettlement?s(b.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return f.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...p.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),p.setDev({...n,events:t}),b();return}let i=t.closest(`[data-dev-collapses]`);if(i){p.setCollapses(Number(i.dataset.devCollapses)),b();return}let a=t.closest(`[data-dev]`)?.dataset.dev;if(a){if(a===`wind-toggle`&&p.setWindUnlocked(!p.state().windUnlocked),a===`grow-young`&&p.setStageHeight(2),a===`fx-collapse`&&p.triggerCollapse(!1),a===`fx-fatal`&&p.triggerCollapse(!0),a===`fx-replay`&&p.replayCollapse(),a===`fx-dying`&&p.triggerDying(),a===`fx-death`&&p.triggerDeath(),a===`toggle`&&p.setDev({...n,open:!n.open}),a===`mode-real`&&p.setDev({...n,mode:`real`}),a===`mode-manual`&&p.setDev({...n,mode:`manual`}),a===`time-auto`&&p.setDev({...n,time:`auto`}),a===`time-day`&&p.setDev({...n,time:`day`}),a===`time-night`&&p.setDev({...n,time:`night`}),a===`advance`&&p.advanceDay(),a===`advance7`&&p.advanceDays(7),a===`advance30`&&p.advanceDays(30),a===`pest`&&p.triggerPest(),a===`real-date`&&p.realDate(),a===`glare`&&p.triggerGlare(),a===`spawn`){let e=f.querySelector(`[data-dev-animal]`)?.value;e&&(_=e,p.spawnAnimal(e)),window.setTimeout(b,50)}if(a===`follow`){let e=f.querySelector(`[data-dev-animal]`)?.value??null;_=e??_,g=g?null:e,p.followAnimal(g)}a===`rotate`&&(p.rotateAnimals(),window.setTimeout(b,50)),a===`unlock-all`&&p.unlockAll(),a===`reset`&&confirm(`重置存檔？徽章會保留。`)&&p.reset(),b()}}),f.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){h=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),p.setStat(t.dataset.devStat,Number(t.value)),h=!1}}),f.addEventListener(`change`,e=>{let t=e.target,n=p.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(f.querySelector(`[data-dev-fc-hours]`)?.value??6);p.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),b()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(p.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),b()),t instanceof HTMLInputElement&&t.dataset.devStat&&b(),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-species`)&&(p.setPreview({...n.preview,species:t.value||void 0}),b()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-stage`)&&(p.setPreview({...n.preview,stage:t.value===``?void 0:Number(t.value)}),b()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-island`)&&(p.setPreview({...n.preview,island:t.value===``?void 0:Number(t.value)}),b()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-sway`)&&(p.setSway(l[Number(t.value)]?.[1]??null),b())}),window.setInterval(()=>{if(!f.isConnected||!p.dev().open)return;let e=f.querySelector(`[data-dev-caps]`),t=f.querySelector(`[data-dev-eco]`);e&&(e.textContent=v()),t&&(t.textContent=y())},1500),b(),b}export{f as mountDevPanel};