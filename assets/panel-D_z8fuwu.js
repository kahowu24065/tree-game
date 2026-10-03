import{A as e,An as t,Cn as n,Hn as r,Kn as i,Vn as a,Xn as o,Zn as s,Zr as c,cr as l,er as u,sr as d}from"./ui-safsIj90.js";var f=[[`自動（跟天氣）`,null],[`平靜`,.05],[`微風`,.25],[`強風`,.55],[`暴雨`,.7],[`颱風`,1]],p=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/></svg>`,m=[[`health`,`健康 H`],[`moisture`,`水分 W`],[`nutrients`,`養分 N`],[`resist`,`抗風力 R`]];function h(h,g){h.hidden=!1,h.innerHTML=`<button type="button" class="dev-fab glass" data-dev="toggle" aria-label="開發者面板">${p}</button><section class="dev-panel glass" hidden></section>`;let _=h.querySelector(`.dev-panel`),v=!1,y=null,b=``,x=()=>{let e=g.ecoCaps();return e?`動物上限（${l[e.stage]}）：${e.groups} 組・${e.members} 隻・體型最大「${e.maxSize}」；而家訪客 ${e.visitorGroups} 組 ${e.visitorMembers} 隻${e.residentGroups?`，另長駐 ${e.residentGroups} 組`:``}`:`動物上限：（場景未準備好）`},S=()=>`畫面上：${g.ecoInfo().map(e=>`${e.name}×${e.count}${e.resident?`（長駐）`:``}`).join(`、`)||`冇`}`,C=()=>{let p=g.dev();if(_.hidden=!p.open,h.classList.toggle(`open`,p.open),!p.open||v)return;let C=g.state(),w=g.countdown(),T=e=>`<button type="button" class="${p.events.includes(e)?`on`:``}" data-dev-event="${e}" ${p.mode===`real`?`disabled`:``}>${u(t(e))}<small>${c[e].damage?`−${c[e].damage}`:`0`}</small></button>`,E=e=>`<option value="${e}" ${p.forecast?.event===e?`selected`:``}>${u(t(e))}</option>`,D=p.forecast?Math.max(0,(p.forecast.at-Date.now())/36e5):6;_.innerHTML=`
      <header><b>開發者</b><small>只喺開發版出現</small><button type="button" data-dev="toggle" aria-label="收起">×</button></header>
      <div class="dev-seg">
        <button type="button" class="${p.mode===`real`?`on`:``}" data-dev="mode-real">真實天氣</button>
        <button type="button" class="${p.mode===`manual`?`on`:``}" data-dev="mode-manual">手動天氣</button>
      </div>
      <div class="dev-seg time">
        <button type="button" class="${p.time===`auto`?`on`:``}" data-dev="time-auto">真實時間</button>
        <button type="button" class="${p.time===`day`?`on`:``}" data-dev="time-day">日頭</button>
        <button type="button" class="${p.time===`night`?`on`:``}" data-dev="time-night">夜晚</button>
      </div>
      <p class="dev-note">${p.mode===`real`?`真實：${u(g.liveEvents().map(e=>t(e)).join(`、`)||`晴天／多雲`)}`:`可以揀多個警告：熱、雨、風三類會疊加（同類只計最嚴重）。揀毛毛雨／酷熱天氣警告／暴雨／黑雨會即刻計水分（每日每樣一次），仲會出應急行動掣；揀寒冷會開「保暖」。`}</p>
      <div class="dev-events">${g.events.map(T).join(``)}</div>
      <div class="dev-row">
        <label>12 小時預報
          <select data-dev-fc-event ${p.mode===`real`?`disabled`:``}><option value="">（冇）</option>${g.events.filter(e=>c[e].severe).map(E).join(``)}</select>
        </label>
        <label>幾耐後 <input type="number" min="0" max="12" step="0.5" value="${D.toFixed(1)}" data-dev-fc-hours ${p.mode===`real`?`disabled`:``}/> 小時</label>
      </div>
      <p class="dev-note">倒數：${w?`${u(t(w.event))} · ${w.active?`生效中`:`${w.hours.toFixed(1)} 小時後`}（${u(w.source)}）`:`冇`}</p>
      <div class="dev-sliders">
        ${m.map(([e,t])=>`<label><span>${t}</span><input type="range" min="0" max="${e===`moisture`?150:100}" step="1" value="${Math.round(C[e])}" data-dev-stat="${e}"/><b>${Math.round(C[e])}</b></label>`).join(``)}
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
        <button type="button" class="${C.windUnlocked?`on`:``}" data-dev="wind-toggle">風災解鎖：${C.windUnlocked?`開`:`關`}</button>
        <button type="button" data-dev="grow-young">長到青年樹</button>
        ${[0,1,2,3].map(e=>`<button type="button" class="${(C.collapses||0)===e?`on`:``}" data-dev-collapses="${e}">倒塌 ${e}</button>`).join(``)}
      </div>
      <h4 class="dev-h">倒塌・枯死動畫（v16）</h4>
      <div class="dev-actions">
        <button type="button" data-dev="fx-collapse">觸發倒塌（八號風球結算）</button>
        <button type="button" data-dev="fx-fatal">觸發致命倒塌</button>
        <button type="button" data-dev="fx-replay" ${C.lastCollapse?``:`disabled`}>重播倒塌</button>
        <button type="button" data-dev="fx-dying">瀕死</button>
        <button type="button" class="danger" data-dev="fx-death">枯死（動畫）</button>
      </div>
      <p class="dev-note">倒塌 ${C.collapses||0}/2${C.doubleRDate?`・雙倍加固日 ${u(C.doubleRDate)}`:``}${C.doubleRPending?`・雙倍加固待開始`:``}・高度 ${Math.round(C.heightCm)} 厘米・樹齡 ${n(C)} 日・里程碑 ${Object.keys(C.milestones??{}).join(`、`)||`冇`}</p>
      <h4 class="dev-h">樹種・生長階段預覽</h4>
      <div class="dev-row">
        <label>樹種 <select data-dev-species><option value="">（存檔：${u(d.find(e=>e.id===C.species)?.name??``)}）</option>${d.map(e=>`<option value="${e.id}" ${p.preview.species===e.id?`selected`:``}>${u(e.name)}（紀錄 ${e.targetM} 米）</option>`).join(``)}</select></label>
        <label>階段 <select data-dev-stage><option value="">（跟高度）</option>${l.map((e,t)=>`<option value="${t}" ${p.preview.stage===t?`selected`:``}>${t+1}. ${e}</option>`).join(``)}</select></label>
        <label>島嶼 <select data-dev-island><option value="">（跟樹）</option>${l.map((e,t)=>`<option value="${t}" ${p.preview.island===t?`selected`:``}>${t+1}. ${e}島</option>`).join(``)}</select></label>
      </div>
      <p class="dev-note" data-dev-habitat>${u(g.habitatInfo())}</p>
      <h4 class="dev-h">搖擺・眩光</h4>
      <div class="dev-row">
        <label>搖擺 <select data-dev-sway>${f.map(([e,t],n)=>`<option value="${n}" ${p.sway===t?`selected`:``}>${e}</option>`).join(``)}</select></label>
        <button type="button" data-dev="glare">觸發眩光</button>
      </div>
      <p class="dev-note">而家搖擺：${g.sway().toFixed(2)}${p.sway===null?`（跟天氣／手動天氣）`:`（強制）`}</p>
      <h4 class="dev-h">動物</h4>
      <div class="dev-row">
        <label>召喚 <select data-dev-animal>${o.map(e=>`<option value="${e.id}" ${e.id===b?`selected`:``}>${u(s[e.category])}・${u(e.name)}</option>`).join(``)}</select></label>
        <button type="button" data-dev="spawn">召喚</button>
        <button type="button" data-dev="follow">${y?`停止跟拍`:`鏡頭跟拍`}</button>
      </div>
      <div class="dev-actions">
        <button type="button" data-dev="rotate">輪換動物</button>
        <button type="button" data-dev="unlock-all">解鎖全部動物（${C.animals.length}/${o.length}）</button>
      </div>
      <p class="dev-note" data-dev-caps>${u(x())}</p>
      <p class="dev-note" data-dev-eco>${u(S())}</p>
      <h4 class="dev-h">雀巢</h4>
      <p class="dev-note">已孵化 ${C.nest?.hatched??0} 粒${r(C.nest?.hatched??0).length?`・島上：${r(C.nest?.hatched??0).map(e=>a(e)).join(`、`)}`:``}</p>
      <div class="dev-actions">
        <button type="button" data-dev="hatch-one">加一粒</button>
        <button type="button" data-dev="hatch-next">加到下一件裝飾（第 ${i(C.nest?.hatched??0)} 粒）</button>
        <button type="button" data-dev="hatch-four">四件裝飾（第 30 粒）</button>
        <button type="button" data-dev="hatch-restore">還原孵化</button>
      </div>
      <p class="dev-note">裝飾即時出現喺島上。加高要等夜晚結算，呢度唔改高度。</p>
      <p class="dev-note">今日計算用：${u(g.todayEvents().map(e=>t(e)).join(`、`))}${C.virtualToday?`・虛擬日期 ${u(C.virtualToday)}`:``}${C.pest.active?`・有蟲害`:``}${C.dying?`・瀕死`:``}</p>
      ${C.lastSettlement?e(C.lastSettlement):`<p class="dev-note">未有結算紀錄。撳「跳去下一日」試下。</p>`}
    `};return h.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t)return;let n={...g.dev()},r=t.closest(`[data-dev-event]`);if(r){let e=r.dataset.devEvent,t=n.events.includes(e)?n.events.filter(t=>t!==e):[...n.events,e];t=e===`clear`?[`clear`]:t.filter(e=>e!==`clear`),t.length||(t=[`clear`]),g.setDev({...n,events:t}),C();return}let a=t.closest(`[data-dev-collapses]`);if(a){g.setCollapses(Number(a.dataset.devCollapses)),C();return}let o=t.closest(`[data-dev]`)?.dataset.dev;if(o){if(o===`wind-toggle`&&g.setWindUnlocked(!g.state().windUnlocked),o===`grow-young`&&g.setStageHeight(2),o===`fx-collapse`&&g.triggerCollapse(!1),o===`fx-fatal`&&g.triggerCollapse(!0),o===`fx-replay`&&g.replayCollapse(),o===`fx-dying`&&g.triggerDying(),o===`fx-death`&&g.triggerDeath(),o===`toggle`&&g.setDev({...n,open:!n.open}),o===`mode-real`&&g.setDev({...n,mode:`real`}),o===`mode-manual`&&g.setDev({...n,mode:`manual`}),o===`time-auto`&&g.setDev({...n,time:`auto`}),o===`time-day`&&g.setDev({...n,time:`day`}),o===`time-night`&&g.setDev({...n,time:`night`}),o===`advance`&&g.advanceDay(),o===`advance7`&&g.advanceDays(7),o===`advance30`&&g.advanceDays(30),o===`pest`&&g.triggerPest(),o===`real-date`&&g.realDate(),o===`glare`&&g.triggerGlare(),o===`spawn`){let e=h.querySelector(`[data-dev-animal]`)?.value;e&&(b=e,g.spawnAnimal(e)),window.setTimeout(C,50)}if(o===`follow`){let e=h.querySelector(`[data-dev-animal]`)?.value??null;b=e??b,y=y?null:e,g.followAnimal(y)}o===`rotate`&&(g.rotateAnimals(),window.setTimeout(C,50)),o===`unlock-all`&&g.unlockAll(),o===`hatch-one`&&g.setHatched((g.state().nest?.hatched??0)+1),o===`hatch-next`&&g.setHatched(i(g.state().nest?.hatched??0)),o===`hatch-four`&&g.setHatched(Math.max(30,g.state().nest?.hatched??0)),o===`hatch-restore`&&g.restoreHatched(),o===`reset`&&confirm(`重置存檔？徽章會保留。`)&&g.reset(),C()}}),h.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement&&t.dataset.devStat){v=!0;let e=t.parentElement?.querySelector(`b`);e&&(e.textContent=t.value),g.setStat(t.dataset.devStat,Number(t.value)),v=!1}}),h.addEventListener(`change`,e=>{let t=e.target,n=g.dev();if(t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-fc-event`)){let e=Number(h.querySelector(`[data-dev-fc-hours]`)?.value??6);g.setDev({...n,forecast:t.value?{event:t.value,at:Date.now()+e*36e5}:null}),C()}t instanceof HTMLInputElement&&t.hasAttribute(`data-dev-fc-hours`)&&n.forecast&&(g.setDev({...n,forecast:{...n.forecast,at:Date.now()+Math.max(0,Math.min(12,Number(t.value)))*36e5}}),C()),t instanceof HTMLInputElement&&t.dataset.devStat&&C(),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-species`)&&(g.setPreview({...n.preview,species:t.value||void 0}),C()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-stage`)&&(g.setPreview({...n.preview,stage:t.value===``?void 0:Number(t.value)}),C()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-island`)&&(g.setPreview({...n.preview,island:t.value===``?void 0:Number(t.value)}),C()),t instanceof HTMLSelectElement&&t.hasAttribute(`data-dev-sway`)&&(g.setSway(f[Number(t.value)]?.[1]??null),C())}),window.setInterval(()=>{if(!h.isConnected||!g.dev().open)return;let e=h.querySelector(`[data-dev-caps]`),t=h.querySelector(`[data-dev-eco]`);e&&(e.textContent=x()),t&&(t.textContent=S())},1500),C(),C}export{h as mountDevPanel};