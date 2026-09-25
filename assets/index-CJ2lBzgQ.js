(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[40,80],t=[60,100],n={good:5,bad:-10},r={good:5,mid:0,bad:-10},i={clear:{id:`clear`,label:`晴天／多雲`,damage:0,dW:-15,dR:0,growth:1,severe:!1,tip:`日常澆水、施肥。`},drizzle:{id:`drizzle`,label:`毛毛雨`,damage:0,dW:20,dR:0,growth:1.15,severe:!1,tip:`暫停澆水，節省操作。`},hot:{id:`hot`,label:`酷熱`,damage:10,dW:-40,dR:0,growth:.9,severe:!0,tip:`需頻繁澆水防乾旱。`},rainstorm:{id:`rainstorm`,label:`暴雨`,damage:20,dW:60,dR:0,growth:.9,severe:!0,tip:`視情況疏水，輕度加固。`},blackrain:{id:`blackrain`,label:`黑雨`,damage:20,dW:60,dR:0,growth:.85,severe:!0,tip:`預早疏水，輕度加固。`},typhoon1:{id:`typhoon1`,label:`初級颱風`,damage:30,dW:0,dR:-40,growth:.8,severe:!0,tip:`一號／三號風球：提早加固。`},thunder:{id:`thunder`,label:`狂風雷暴`,damage:35,dW:0,dR:-30,growth:.8,severe:!0,tip:`需提前加固樹幹。`},typhoon8:{id:`typhoon8`,label:`高級颱風`,damage:60,dW:0,dR:-80,growth:.6,severe:!0,tip:`八號或以上：終極考驗，需推高 R 值。`}},a=[`clear`,`drizzle`,`hot`,`rainstorm`,`blackrain`,`typhoon1`,`thunder`,`typhoon8`],o=1.3,s=[{min:80,mult:1.5,label:`爆發生長`},{min:50,mult:1,label:`正常生長`},{min:20,mult:.2,label:`虛弱停滯`},{min:0,mult:-.5,label:`枯萎斷枝`}],c=.35,l=[{id:`s3`,label:`3 個月・速成局`,sub:`目標約 20 米，解鎖一級徽章`,days:90,targetCm:2e3,tier:1},{id:`s6`,label:`6 個月・標準局`,sub:`目標約 50 米，解鎖二級徽章`,days:180,targetCm:5e3,tier:2},{id:`s12`,label:`1 年・史詩局`,sub:`目標 100 米以上，解鎖三級徽章`,days:365,targetCm:1e4,tier:3}],u={1:90,2:180,3:365},d={1:{name:`一級徽章・新芽`,perk:`以後每局：每日水分流失減少 10%`},2:{name:`二級徽章・雨林`,perk:`以後每局：暴雨時有 30% 機率將一半水分轉為養分`},3:{name:`三級徽章・星空`,perk:`一面免死金牌（枯死時自動救返一次）＋「星空浮島」地貌`}},f=.9,p={water:{amount:20,perDay:3},drain:{amount:-25,perDay:2},fertilize:{amount:25,perDay:1}},m={stakes:{label:`打木樁`,sub:`撐住樹幹`,amount:15},ropes:{label:`綁防風繩`,sub:`拉住主枝`,amount:12},prune:{label:`修枝防風`,sub:`剪走易斷弱枝`,amount:8}},h={health:70,moisture:60,nutrients:50,resist:10,heightCm:18};function g(e,t){let n=new Intl.DateTimeFormat(`en-CA`,{timeZone:t,year:`numeric`,month:`2-digit`,day:`2-digit`}).formatToParts(e);return`${n.find(e=>e.type===`year`)?.value??`1970`}-${n.find(e=>e.type===`month`)?.value??`01`}-${n.find(e=>e.type===`day`)?.value??`01`}`}function _(e,t){let[n,r,i]=e.split(`-`).map(Number),a=new Date(Date.UTC(n??1970,(r??1)-1,(i??1)+t));return`${a.getUTCFullYear()}-${String(a.getUTCMonth()+1).padStart(2,`0`)}-${String(a.getUTCDate()).padStart(2,`0`)}`}function v(e,t){let[n,r,i]=e.split(`-`).map(Number),[a,o,s]=t.split(`-`).map(Number),c=Date.UTC(n??1970,(r??1)-1,i??1),l=Date.UTC(a??1970,(o??1)-1,s??1);return Math.round((l-c)/864e5)}function y(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(Date.UTC(t??1970,(n??1)-1,r??1)).getUTCDay()}function b(e){let t=e.split(`-`);return`${Number(t[1])}/${Number(t[2])}`}function x(e,t=new Date){let n=new Intl.DateTimeFormat(`en-GB`,{timeZone:e,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`}).formatToParts(t),r=Number(n.find(e=>e.type===`hour`)?.value??0),i=Number(n.find(e=>e.type===`minute`)?.value??0);return r*60+i}function S(e){let t=e.match(/T(\d{2}):(\d{2})/);return t?Number(t[1])*60+Number(t[2]):null}var C=`https://data.weather.gov.hk/weatherAPI/opendata/weather.php`,w={TC1:`一號戒備信號`,TC3:`三號強風信號`,TC8NE:`八號東北烈風或暴風信號`,TC8SE:`八號東南烈風或暴風信號`,TC8NW:`八號西北烈風或暴風信號`,TC8SW:`八號西南烈風或暴風信號`,TC9:`九號烈風或暴風風力增強信號`,TC10:`十號颶風信號`},T={TC1:`一號風球`,TC3:`三號風球`,TC8NE:`八號風球`,TC8SE:`八號風球`,TC8NW:`八號風球`,TC8SW:`八號風球`,TC9:`九號風球`,TC10:`十號風球`};function E(e,t){if(!t||t.actionCode===`CANCEL`)return null;let n=t.code||e,r={group:e,code:n,name:e===`WTCSGNL`?w[n]??t.name??`熱帶氣旋警告信號`:`${t.type??``}${t.name??n}`,issued:t.issueTime??``,standby:!1};if(e===`WTCSGNL`){let e=T[n]??`熱帶氣旋警告`;return n===`TC1`?{...r,short:e,kind:null,standby:!0,tone:`yellow`}:n===`TC3`?{...r,short:e,kind:`gale`,tone:`amber`}:{...r,short:e,kind:`typhoon`,tone:`red`}}return e===`WRAIN`?n===`WRAINA`?{...r,name:`黃色暴雨警告信號`,short:`黃雨`,kind:`heavy-rain`,tone:`amber`}:n===`WRAINR`?{...r,name:`紅色暴雨警告信號`,short:`紅雨`,kind:`heavy-rain`,tone:`red`}:n===`WRAINB`?{...r,name:`黑色暴雨警告信號`,short:`黑雨`,kind:`heavy-rain`,tone:`black`}:{...r,short:`暴雨警告`,kind:`heavy-rain`,tone:`amber`}:e===`WMSGNL`?{...r,short:`強烈季候風`,kind:`gale`,tone:`amber`}:e===`WHOT`?{...r,short:`酷熱`,kind:null,tone:`red`}:e===`WCOLD`?{...r,short:`寒冷`,kind:null,tone:`blue`}:e===`WTS`?{...r,short:`雷暴`,kind:null,tone:`yellow`}:e===`WFIRE`?{...r,short:n===`WFIRER`?`紅色火災`:`黃色火災`,kind:null,tone:n===`WFIRER`?`red`:`yellow`}:e===`WFNTSA`?{...r,short:`新界北水浸`,kind:null,tone:`blue`}:e===`WL`?{...r,short:`山泥傾瀉`,kind:null,tone:`amber`}:e===`WFROST`?{...r,short:`霜凍`,kind:null,tone:`blue`}:e===`WTMW`?{...r,short:`海嘯`,kind:null,tone:`red`}:{...r,short:t.name??n,kind:null,tone:`gray`}}var D={"heavy-rain":1,gale:2,typhoon:3};function O(e){if(!e||typeof e!=`object`)return[];let t=[];for(let[n,r]of Object.entries(e)){let e=E(n,r);e&&t.push(e)}return t.sort((e,t)=>(t.kind?D[t.kind]+10:t.standby?5:0)-(e.kind?D[e.kind]+10:e.standby?5:0))}function k(e){return{50:0,51:1,52:2,53:80,54:80,60:3,61:3,62:61,63:63,64:65,65:95,70:0,71:0,72:0,73:0,74:0,75:0,76:3,77:1,80:2,81:0,82:2,83:45,84:45,85:45,90:0,91:1,92:2,93:2}[e]??2}var A={50:`陽光充沛`,51:`間有陽光`,52:`短暫陽光`,53:`間有陽光 幾陣驟雨`,54:`短暫陽光 有驟雨`,60:`多雲`,61:`密雲`,62:`微雨`,63:`雨`,64:`大雨`,65:`雷暴`,70:`天色良好`,71:`天色良好`,72:`天色良好`,73:`天色良好`,74:`天色良好`,75:`天色良好`,76:`大致多雲`,77:`天色大致良好`,80:`大風`,81:`乾燥`,82:`潮濕`,83:`霧`,84:`薄霧`,85:`煙霞`,90:`熱`,91:`暖`,92:`涼`,93:`冷`};function j(e){return A[e]??``}function ee(e){return typeof e==`number`&&e in A}function M(e){return e===53||e===54||e>=62&&e<=65}var te=[[`香港天文台`,22.302,114.174],[`京士柏`,22.312,114.173],[`黃竹坑`,22.247,114.174],[`打鼓嶺`,22.528,114.157],[`流浮山`,22.469,113.984],[`大埔`,22.446,114.179],[`沙田`,22.402,114.21],[`屯門`,22.386,113.964],[`將軍澳`,22.316,114.256],[`西貢`,22.376,114.275],[`長洲`,22.201,114.027],[`赤鱲角`,22.309,113.922],[`青衣`,22.344,114.11],[`石崗`,22.436,114.085],[`荃灣可觀`,22.384,114.108],[`荃灣城門谷`,22.376,114.121],[`香港公園`,22.278,114.162],[`筲箕灣`,22.281,114.236],[`九龍城`,22.335,114.185],[`跑馬地`,22.27,114.184],[`黃大仙`,22.339,114.205],[`赤柱`,22.214,114.219],[`觀塘`,22.319,114.225],[`深水埗`,22.335,114.137],[`啟德跑道公園`,22.305,114.216],[`元朗公園`,22.441,114.02],[`大美督`,22.475,114.237],[`上水`,22.502,114.111],[`東涌`,22.289,113.941],[`大老山`,22.353,114.209],[`昂坪`,22.259,113.911],[`北潭涌`,22.395,114.321]];function N(e,t){return te.map(([n,r,i])=>[n,(r-e)**2+((i-t)*Math.cos(e*Math.PI/180))**2]).sort((e,t)=>e[1]-t[1]).map(([e])=>e)}function ne(e,t,n){if(!e||typeof e!=`object`)return null;let r=e,i=r.temperature?.data??[],a=null,o=``;for(let e of N(t,n)){let t=i.find(t=>t.place===e&&typeof t.value==`number`);if(t){a=t.value,o=t.place;break}}a===null&&i[0]&&(a=i[0].value,o=i[0].place);let s={};for(let e of r.rainfall?.data??[])s[e.place]=typeof e.max==`number`?e.max:0;let c=Array.isArray(r.warningMessage)?r.warningMessage:r.warningMessage?[r.warningMessage]:[];return{current:{tempC:a,station:o,humidity:r.humidity?.data?.[0]?.value??null,icon:r.icon?.[0]??null,rainByDistrict:s,updated:r.updateTime??``},messages:c.filter(Boolean)}}function re(e){if(!e||typeof e!=`object`)return{forecast:[],situation:``};let t=e;return{forecast:(t.weatherForecast??[]).map(e=>({date:`${e.forecastDate.slice(0,4)}-${e.forecastDate.slice(4,6)}-${e.forecastDate.slice(6,8)}`,week:e.week??``,text:e.forecastWeather??``,wind:e.forecastWind??``,tempMax:e.forecastMaxtemp?.value??28,tempMin:e.forecastMintemp?.value??23,icon:e.ForecastIcon??51,psr:e.PSR??`低`})),situation:t.generalSituation??``}}function ie(e){let t=[...e.matchAll(/(\d{1,2})\s*級/g)].map(e=>Number(e[1])),n=t.length?Math.max(...t):2;return[1,3,9,15,24,34,44,56,68,82,96,110,120][Math.min(12,Math.max(0,n))]??12}function ae(e){switch(e){case`高`:return{mm:18,prob:85};case`中高`:return{mm:10,prob:65};case`中`:return{mm:5,prob:45};case`中低`:return{mm:1.5,prob:25};default:return{mm:0,prob:10}}}async function oe(e,t){let n=await fetch(`${C}?dataType=${e}&lang=tc`,{signal:se(t)});if(!n.ok)throw Error(`天文台回應 ${n.status}`);return n.json()}function se(e){if(typeof AbortSignal<`u`&&`timeout`in AbortSignal)return AbortSignal.timeout(e);if(typeof AbortController>`u`)return;let t=new AbortController;return setTimeout(()=>t.abort(),e),t.signal}async function ce(e,t,n=8e3){let[r,i,a]=await Promise.allSettled([oe(`warnsum`,n),oe(`rhrread`,n),oe(`fnd`,n)]);if(r.status===`rejected`&&i.status===`rejected`&&a.status===`rejected`)throw Error(`天文台資料暫時攞唔到`);let o=i.status===`fulfilled`?ne(i.value,e,t):null,s=a.status===`fulfilled`?re(a.value):{forecast:[],situation:``};return{fetchedAt:Date.now(),warnings:r.status===`fulfilled`?O(r.value):[],messages:o?.messages??[],current:o?.current??null,forecast:s.forecast,situation:s.situation}}var P=e=>Math.max(0,Math.min(100,e)),le=e=>Math.round(e*10)/10;function ue(e,t){return e>=t[0]&&e<=t[1]}function de(t){return ue(t,e)?n.good:n.bad}function fe(e){return e>=t[0]?r.good:e<30?r.bad:r.mid}function pe(e,t){return le(e*(1-P(t)/100))}function me(e){let t=`clear`;for(let n of e){let e=i[n],r=i[t];e&&(e.damage>r.damage||e.damage===r.damage&&a.indexOf(n)>a.indexOf(t))&&(t=n)}return t}function he(e){return s.find(t=>e>=t.min)??s[s.length-1]}function ge(e){return he(e).mult}function _e(e){return l.find(t=>t.id===e)??l[0]}function ve(e){return e.targetCm/e.days}function ye(e,t,n){return le(t>=0?e*t*n:e*t)}function be(e){return le(c*(Math.max(0,e)/100)**1.5)}function xe(e,t,n){let r=n?e:t;return[1,2,3].filter(t=>u[t]<=r&&u[t]<=e)}function Se(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0)%1e4/1e4}var F=22.3022,Ce=114.1744,we=18e5;function Te(e,t){return e>=22.13&&e<=22.58&&t>=113.82&&t<=114.45}function I(e,t){return e>=21.8&&e<=22.9&&t>=113.3&&t<=114.7}function Ee(e){return e>=51&&e<=67||e>=80&&e<=82||e>=95&&e<=99}function L(e){return e>=71&&e<=77}function De(e){return e===0?`天晴`:e===1?`大致天晴`:e===2?`間有陽光`:e===3?`陰天`:e===45||e===48?`有霧`:e>=51&&e<=55?`微雨`:e===61||e===80?`小雨`:e===63||e===81?`中雨`:e===65||e===82?`大雨`:L(e)?`落雪`:e>=95?`雷暴`:Ee(e)?`有雨`:`多雲`}function Oe(e){return e.hkoIcon===void 0?De(e.code):j(e.hkoIcon)||De(e.code)}function ke(e,t,n){if(!t)return e;let r=new Map(t.forecast.map(e=>[e.date,e.icon])),i=t.current?.icon;return e.map(e=>{let t=e.date===n&&ee(i)?i:r.get(e.date);return ee(t)?{...e,hkoIcon:t,code:k(t)}:e})}function Ae(e){let t=e.gustKmh>=118||e.windKmh>=63,n=!t&&(e.gustKmh>=62||e.windKmh>=41),r=e.precipMm>=25,i=e.tempMax>=33,a=null;return t?a=`typhoon`:n?a=`gale`:r&&(a=`heavy-rain`),{heavyRain:r,gale:n,typhoon:t,heat:i,stormKind:a}}function je(e,t=e.tempMax){let n=Ae({precipMm:e.precipMm,gustKmh:e.gustKmh,windKmh:e.windKmh,tempMax:e.tempMax}),r=e.hkoIcon===void 0?e.precipMm>=.5||Ee(e.code)||L(e.code):M(e.hkoIcon);return{code:e.code,tempC:t,tempMax:e.tempMax,precipMm:e.precipMm,windKmh:e.windKmh,gustKmh:e.gustKmh,hot:n.heat||t>=33,raining:r,stormKind:n.stormKind}}function Me(e){return{date:e,code:2,tempMax:28,tempMin:23,precipMm:0,precipProb:10,windKmh:12,gustKmh:20,sunrise:`${e}T06:10`,sunset:`${e}T18:25`}}function Ne(e){return Array.from({length:7},(t,n)=>Me(_(e,n)))}function Pe(e,t){return{lat:F,lon:Ce,timezone:`Asia/Hong_Kong`,place:`香港`,source:`fallback`,origin:`offline`,fetchedAt:0,current:{tempC:26,humidity:70,precipMm:0,code:2,windKmh:12,gustKmh:20,isDay:!0,time:``},daily:Ne(e),error:t,provider:`sim`}}function Fe(e,t){let n=new Map(e.map(e=>[e.date,e]));for(let e=0;e<7;e++){let r=_(t,e);n.has(r)||n.set(r,Me(r))}return[...n.values()].filter(e=>e.date>=t&&e.date<=_(t,6)).sort((e,t)=>e.date.localeCompare(t.date))}function Ie(e,t=0){return typeof e==`number`&&Number.isFinite(e)?e:t}function Le(e,t){let n=e?.time??[];if(!n.length)return null;let r=t.slice(0,13),i=n.findIndex(e=>e.slice(0,13)===r);i<0&&(i=0);for(let t=0;t<6&&i+t<n.length;t++){let n=Ie(e?.precipitation?.[i+t],0),r=Ie(e?.weather_code?.[i+t],0);if(n>=.3||Ee(r)&&r>=61)return t}return null}function Re(e){if(!e||typeof e!=`object`)throw Error(`天氣資料格式不對`);let t=e,n=t.daily,r=n?.time??[];if(!r.length)throw Error(`沒有預報`);let i=r.map((e,t)=>({date:e,code:Ie(n?.weather_code?.[t],2),tempMax:Ie(n?.temperature_2m_max?.[t],28),tempMin:Ie(n?.temperature_2m_min?.[t],23),precipMm:Ie(n?.precipitation_sum?.[t],0),precipProb:Ie(n?.precipitation_probability_max?.[t],0),windKmh:Ie(n?.wind_speed_10m_max?.[t],10),gustKmh:Ie(n?.wind_gusts_10m_max?.[t],16),sunrise:n?.sunrise?.[t]||`${e}T06:10`,sunset:n?.sunset?.[t]||`${e}T18:25`})),a=t.current??{};return{timezone:t.timezone||`Asia/Hong_Kong`,current:{tempC:Ie(a.temperature_2m,i[0]?.tempMax??26),humidity:Ie(a.relative_humidity_2m,70),precipMm:Ie(a.precipitation,0),code:Ie(a.weather_code,i[0]?.code??2),windKmh:Ie(a.wind_speed_10m,i[0]?.windKmh??10),gustKmh:Ie(a.wind_gusts_10m,i[0]?.gustKmh??16),isDay:a.is_day!==0,time:a.time??``},daily:i,rainInHours:Le(t.hourly,a.time??``),hourly:(t.hourly?.time??[]).map((e,n)=>({time:e,precipMm:Ie(t.hourly?.precipitation?.[n],0),code:Ie(t.hourly?.weather_code?.[n],0),gustKmh:Ie(t.hourly?.wind_gusts_10m?.[n],0)}))}}function ze(e,t){let n=new URL(`https://api.open-meteo.com/v1/forecast`);return n.searchParams.set(`latitude`,e.toFixed(4)),n.searchParams.set(`longitude`,t.toFixed(4)),n.searchParams.set(`current`,`temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day`),n.searchParams.set(`hourly`,`precipitation,weather_code,wind_gusts_10m`),n.searchParams.set(`daily`,`weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset`),n.searchParams.set(`timezone`,`auto`),n.searchParams.set(`forecast_days`,`7`),n.searchParams.set(`forecast_hours`,`12`),n.searchParams.set(`wind_speed_unit`,`kmh`),n.toString()}var Be=e=>new Promise(t=>setTimeout(t,e));async function Ve(e,t,n={}){let r=ze(e,t),i=n.tries??3,a=`天氣服務冇回應`,o=0;for(let e=0;e<i;e++){e>0&&await Be(o||1e3*3**(e-1)),o=0;let t;try{t=await fetch(r,{signal:se(n.timeoutMs??8e3)})}catch{a=`連唔到天氣服務`;continue}if(t.ok)return Re(await t.json());a=t.status===429?`天氣服務暫時太繁忙（429）`:`天氣服務回應 ${t.status}`;let i=Number(t.headers.get(`retry-after`));if(Number.isFinite(i)&&i>0&&(o=Math.min(8e3,i*1e3)),t.status!==429&&t.status<500)break}throw Error(a)}function He(e,t){if(!e.current&&!e.forecast.length)return null;let n=e.current?.tempC??e.forecast[0]?.tempMax??28,r=e.current?.icon?k(e.current.icon):2,i=[],a=e.forecast[0];(!a||a.date>t)&&i.push({date:t,code:r,hkoIcon:ee(e.current?.icon)?e.current.icon:void 0,tempMax:Math.max(n,a?a.tempMax-1:n),tempMin:Math.min(n,a?a.tempMin:n-4),precipMm:0,precipProb:10,windKmh:12,gustKmh:20,sunrise:`${t}T06:10`,sunset:`${t}T18:25`});for(let n of e.forecast){if(n.date<t)continue;let e=ae(n.psr),r=ie(n.wind);i.push({date:n.date,code:k(n.icon),hkoIcon:ee(n.icon)?n.icon:void 0,tempMax:n.tempMax,tempMin:n.tempMin,precipMm:e.mm,precipProb:e.prob,windKmh:r,gustKmh:Math.round(r*1.5),sunrise:`${n.date}T06:10`,sunset:`${n.date}T18:25`})}let o=e.current?Math.max(0,...Object.values(e.current.rainByDistrict)):0;return{timezone:`Asia/Hong_Kong`,current:{tempC:n,humidity:e.current?.humidity??70,precipMm:o>0?Math.min(8,o):0,code:r,windKmh:12,gustKmh:20,isDay:!0,time:e.current?.updated??``},daily:i.slice(0,7),rainInHours:null}}function Ue(e,t){let n=e?.current?.rainByDistrict;if(!n||!t)return null;let r=t.replace(/區$/,``);for(let e of[t,r,`${r}區`])if(e in n)return n[e]??0;return null}function We(e=8e3){let t={lat:F,lon:Ce,source:`fallback`};if(typeof navigator>`u`||!navigator.geolocation)return Promise.resolve(t);let n=()=>new Promise(n=>{let r=setTimeout(()=>n(t),e);navigator.geolocation.getCurrentPosition(e=>{clearTimeout(r),n({lat:e.coords.latitude,lon:e.coords.longitude,source:`geo`})},()=>{clearTimeout(r),n(t)},{enableHighAccuracy:!1,timeout:e-500,maximumAge:18e5})}),r=navigator.permissions;return r?.query?r.query({name:`geolocation`}).then(e=>e.state===`denied`?t:n()).catch(()=>n()):n()}function Ge(e){let t=new Set;for(let n of e??[])n.group===`WHOT`?t.add(`hot`):n.group===`WRAIN`?t.add(n.code===`WRAINB`?`blackrain`:`rainstorm`):n.group===`WTS`||n.group===`WMSGNL`?t.add(`thunder`):n.group===`WTCSGNL`&&t.add(/^TC(1|3)$/.test(n.code)?`typhoon1`:`typhoon8`);return[...t]}function Ke(e){return e.gustKmh>=118||e.windKmh>=63?`typhoon8`:e.gustKmh>=88||e.windKmh>=50?`typhoon1`:e.code>=95||e.gustKmh>=62?`thunder`:e.precipMm>=70?`blackrain`:e.precipMm>=25?`rainstorm`:e.tempMax>=33?`hot`:e.precipMm>=.5||Ee(e.code)?`drizzle`:`clear`}function qe(e){if(e.hkoIcon===void 0)return Ke(e);let t=Ke({...e,precipMm:0,code:0,tempMax:0});return t===`clear`?e.hkoIcon===65?`thunder`:e.hkoIcon===64&&e.precipMm>=25?`rainstorm`:e.tempMax>=33?`hot`:M(e.hkoIcon)?`drizzle`:`clear`:t}function Je(e){return e?e.hkoIcon===void 0?e.precipMm>=.5||Ee(e.code)?`drizzle`:`clear`:M(e.hkoIcon)?`drizzle`:`clear`:`clear`}function Ye(e){let t=new Set;if(e.hk&&e.warnings){for(let n of Ge(e.warnings))t.add(n);(e.current.precipMm>=.2||Ee(e.current.code))&&t.add(`drizzle`)}else{let n=e.current,r=Ke({code:n.code,precipMm:n.precipMm*6,gustKmh:n.gustKmh,windKmh:n.windKmh,tempMax:Math.max(n.tempC,e.today?.tempMax??0)});t.add(r),e.today&&t.add(qe(e.today))}return[...t].filter(e=>e!==`clear`)}function Xe(e){return e.gustKmh>=118?`typhoon8`:e.gustKmh>=88?`typhoon1`:e.code>=95||e.gustKmh>=62?`thunder`:e.precipMm>=30?`blackrain`:e.precipMm>=10?`rainstorm`:null}function Ze(e){let t=me(e.nowEvents.filter(e=>i[e].severe));if(t!==`clear`)return{event:t,hours:0,active:!0,source:e.activeSource};let n=[];if(e.manual){let t=Math.max(0,(e.manual.at-e.nowMs)/36e5);t<=12&&n.push({event:e.manual.event,hours:t,active:t===0,source:`手動預報`})}let r=e.nowIso.slice(0,13),a=e.hourly??[],o=a.findIndex(e=>e.time.slice(0,13)===r);o<0&&(o=0);for(let e=0;e<=12&&o+e<a.length;e++){let t=Xe(a[o+e]);if(t){n.push({event:t,hours:e,active:!1,source:`逐小時預報`});break}}if(e.tomorrow&&e.minutesToMidnight<=720){let t=qe(e.tomorrow);i[t].severe&&n.push({event:t,hours:e.minutesToMidnight/60,active:!1,source:`明日預報`})}return n.length?(n.sort((e,t)=>e.hours-t.hours||i[t.event].damage-i[e.event].damage),n[0]):null}function Qe(e,t){let n={...e};switch(t){case`hot`:n.hot=!0,n.tempMax=Math.max(n.tempMax,34),n.tempC=Math.max(n.tempC,33);break;case`drizzle`:n.raining=!0,n.precipMm=Math.max(n.precipMm,2),n.code<51&&(n.code=61);break;case`rainstorm`:case`blackrain`:n.raining=!0,n.precipMm=Math.max(n.precipMm,t===`blackrain`?80:40),n.code=65,n.stormKind=`heavy-rain`;break;case`thunder`:n.raining=!0,n.code=95,n.windKmh=Math.max(n.windKmh,45),n.gustKmh=Math.max(n.gustKmh,75),n.stormKind=`gale`;break;case`typhoon1`:n.windKmh=Math.max(n.windKmh,50),n.gustKmh=Math.max(n.gustKmh,85),n.stormKind=`gale`,n.code<3&&(n.code=3);break;case`typhoon8`:n.raining=!0,n.code=95,n.precipMm=Math.max(n.precipMm,60),n.windKmh=Math.max(n.windKmh,90),n.gustKmh=Math.max(n.gustKmh,140),n.stormKind=`typhoon`;break;default:n.raining=!1,n.hot=!1,n.precipMm=0,n.stormKind=null,n.code>3&&(n.code=2)}return n}var $e=(e,t=`0 0 24 24`)=>`<svg viewBox="${t}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`,et={drop:$e(`<path d="M12 3.2c3.4 4.1 6 7.3 6 10.6a6 6 0 0 1-12 0c0-3.3 2.6-6.5 6-10.6z" fill="currentColor" fill-opacity=".18"/><path d="M9.2 14.6a3 3 0 0 0 2.6 2.6"/>`),leaf:$e(`<path d="M5 19c0-8 5.5-13.5 14-14-.3 8.6-5.8 14-14 14z" fill="currentColor" fill-opacity=".18"/><path d="M5 19c3.5-3.8 6.5-6.6 10-9"/>`),sprout:$e(`<path d="M12 20v-8"/><path d="M12 12c0-3.6-2.6-6-6.5-6 0 3.7 2.6 6 6.5 6z" fill="currentColor" fill-opacity=".18"/><path d="M12 13.5c0-3.2 2.4-5.4 6-5.4 0 3.3-2.4 5.4-6 5.4z" fill="currentColor" fill-opacity=".18"/><path d="M7 20h10"/>`),shield:$e(`<path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6z" fill="currentColor" fill-opacity=".18"/><path d="M9 12l2.2 2.2L15.5 10"/>`),hammer:$e(`<path d="M13.5 6.5l4 4"/><path d="M11 9l-7 7 3 3 7-7"/><path d="M12.5 4.5l3-1.5 5.5 5.5-1.5 3z" fill="currentColor" fill-opacity=".18"/>`),book:$e(`<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" fill="currentColor" fill-opacity=".15"/><path d="M12 6v13.5"/>`),pin:$e(`<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="10.5" r="2.2"/>`),gear:$e(`<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>`),chevronDown:$e(`<path d="M6 9l6 6 6-6"/>`),chevronRight:$e(`<path d="M9 6l6 6-6 6"/>`),close:$e(`<path d="M6 6l12 12M18 6L6 18"/>`),bug:$e(`<ellipse cx="12" cy="14" rx="4.5" ry="5.5" fill="currentColor" fill-opacity=".18"/><path d="M12 8.5V19.5M9 5l1.5 2.5M15 5l-1.5 2.5M4 12h3.5M16.5 12H20M5 17.5l3-1.5M19 17.5l-3-1.5"/>`),scissors:$e(`<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.8L18 4M15.7 15.8L6 4"/>`),bird:$e(`<path d="M4 14c2.5 0 4-1 5.5-3.5C11 8 13 6.5 16 6.5c1.8 0 3 1 3.5 2.5L22 10l-2.5 1c-.5 4-3.5 7-8 7-3 0-5.5-1.5-7.5-4z" fill="currentColor" fill-opacity=".18"/><circle cx="16.5" cy="9" r=".6" fill="currentColor"/><path d="M9 18l-1 3M12 18l.5 3"/>`),arrowUp:$e(`<path d="M12 20V5M6 11l6-6 6 6"/>`),sparkle:$e(`<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" fill-opacity=".2"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>`),heart:$e(`<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor" fill-opacity=".2"/>`),ruler:$e(`<path d="M12 3v18M8.5 6h3.5M9.5 9h2.5M8.5 12h3.5M9.5 15h2.5M8.5 18h3.5"/>`),canopy:$e(`<path d="M12 21v-6"/><path d="M6.5 15a4 4 0 0 1-.8-7.9A5 5 0 0 1 15 5.3a4.2 4.2 0 0 1 3.4 8.3c-.7.9-1.7 1.4-2.9 1.4z" fill="currentColor" fill-opacity=".18"/>`),roots:$e(`<path d="M12 3v9M12 12c-1.5 3-4 4-6.5 4.5M12 12c1.5 3 4 4 6.5 4.5M12 12v8M9 18l-2 3M15 18l2 3"/>`),flag:$e(`<path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="currentColor" fill-opacity=".15"/>`),calendar:$e(`<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>`),warn:$e(`<path d="M12 3.5L2.5 20h19z" fill="currentColor" fill-opacity=".15"/><path d="M12 10v4.5M12 17.2v.3"/>`),wind:$e(`<path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/>`),moonSmall:$e(`<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor" fill-opacity=".2"/>`),locate:$e(`<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>`),drain:$e(`<path d="M12 3.5c2.8 3.4 5 6 5 8.8a5 5 0 0 1-10 0c0-2.8 2.2-5.4 5-8.8z" fill="currentColor" fill-opacity=".18"/><path d="M4 19.5h16M8 16.5l-1.5 3M16 16.5l1.5 3"/>`),wrench:$e(`<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/>`),more:$e(`<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>`)};function tt(e,t,n,r){let i=(e=`#ffc94a`)=>`<g><circle cx="19" cy="17" r="8" fill="${e}"/><g stroke="${e}" stroke-width="2.4" stroke-linecap="round"><path d="M19 3.5v3M19 27.5v3M5.5 17h3M29.5 17h3M9.5 7.5l2 2M26.5 24.5l2 2M28.5 7.5l-2 2M9.5 26.5l2-2"/></g></g>`,a=`<path d="M30 20a11 11 0 0 1-14-14 11 11 0 1 0 14 14z" fill="#ffe7a3" stroke="#f1c75b" stroke-width="1.5"/>`,o=t?a:i(),s=(e,t=0,n=0)=>`<path transform="translate(${t} ${n})" d="M14 38h22a8 8 0 0 0 .8-16 10 10 0 0 0-19.3 2.2A7 7 0 0 0 14 38z" fill="${e}" stroke="rgba(90,110,130,.25)" stroke-width="1"/>`,c=`<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`,l=`<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M21 41l-1.5 4M29 41l-1.5 4"/></g>`,u=`<g stroke="#b7c3cc" stroke-width="2.4" stroke-linecap="round"><path d="M10 42h28M14 47h22"/></g>`,d=(e,t)=>`<g transform="translate(33 18)"><rect x="-3" y="0" width="6" height="22" rx="3" fill="#fff" stroke="#8a97a6" stroke-width="1.2"/><rect x="-1.4" y="${20-t}" width="2.8" height="${t}" rx="1.4" fill="${e}"/><circle cx="0" cy="24" r="5" fill="${e}" stroke="#8a97a6" stroke-width="1.2"/></g>`,f=null;if(r!==void 0&&!n){let e=(e,t,n=.8)=>`<g transform="translate(${e} ${t}) scale(${n})">${o}</g>`;switch(r){case 50:f=`<g transform="translate(6 6) scale(1.1)">${o}</g>`;break;case 51:f=o+s(`#ffffff`,4,2);break;case 52:f=e(8,0)+s(`#eef2f6`,-2,0);break;case 53:f=o+s(`#ffffff`,4,-2)+l;break;case 54:f=e(8,-2)+s(`#e3e9ef`,-2,-3)+c;break;case 60:f=s(`#e5ebf0`,-4,-6)+s(`#f7fafc`,2,0);break;case 61:f=s(`#aeb8c4`,-4,-6)+s(`#c9d1da`,2,0);break;case 62:f=s(`#dfe6ec`,0,-2)+l;break;case 63:f=s(`#c9d2dc`,0,-2)+c;break;case 64:f=s(`#9aa6b4`,0,-3)+`<g stroke="#2f7fc4" stroke-width="2.6" stroke-linecap="round"><path d="M15 41l-2.5 6M21 41l-2.5 6M27 41l-2.5 6M33 41l-2.5 6"/></g>`;break;case 65:f=s(`#8f9aa8`,0,-2)+`<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/><g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`;break;case 70:case 71:case 72:case 73:case 74:case 75:f=`<g transform="translate(6 6) scale(1.1)">${a}</g>`;break;case 76:f=`<g transform="translate(8 0) scale(.8)">${a}</g>`+s(`#e5ebf0`,-2,0);break;case 77:f=a+s(`#ffffff`,4,2);break;case 80:f=`<g stroke="#7fa7c9" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M6 20h24a5 5 0 1 0-5-5M6 29h32a5 5 0 1 1-5 5M6 38h16"/></g>`;break;case 81:f=`<g transform="translate(-2 0)">${i(`#ffb347`)}</g><g stroke="#d9a15b" stroke-width="2.2" stroke-linecap="round"><path d="M8 40l6-3 5 4 6-4 5 4 6-3"/></g>`;break;case 82:f=`<path d="M25 8c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20z" fill="#bfe0f6" stroke="#4ea3e0" stroke-width="1.6"/><path d="M20 30a5 5 0 0 0 4.5 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;break;case 83:case 84:f=s(`#e7edf1`,0,-4)+u;break;case 85:f=`<g opacity=".55">${i(`#e0b25a`)}</g><g stroke="#c9b48f" stroke-width="2.4" stroke-linecap="round"><path d="M6 34h30M10 40h32M6 46h26"/></g>`;break;case 90:f=`<g transform="translate(-4 2)">${t?a:i(`#ff9f2e`)}</g>`+d(`#ef5b3c`,17);break;case 91:f=`<g transform="translate(-4 2)">${o}</g>`+d(`#f39a3d`,12);break;case 92:f=s(`#eef2f6`,-6,0)+d(`#5aa9e6`,8);break;case 93:f=`<g stroke="#6fb3e8" stroke-width="2.2" stroke-linecap="round"><path d="M16 10v24M6 22h20M9 15l14 14M23 15L9 29"/></g>`+d(`#3a7fc9`,4)}}return f===null&&(f=n||e>=95?s(`#8f9aa8`,0,-2)+`<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/><g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`:e>=51?s(`#d8e0e8`,0,-2)+c:e===45||e===48?s(`#e7edf1`,0,-4)+u:e===3?s(`#e5ebf0`,-4,-6)+s(`#f7fafc`,2,0):e===0?`<g transform="translate(6 6) scale(1.1)">${o}</g>`:o+s(`#ffffff`,4,2)),`<svg viewBox="0 0 50 52" aria-hidden="true">${f}</svg>`}function R(e,t,n){return Math.min(n,Math.max(t,e))}function nt(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function rt(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function it(e){return e<100?`${Math.round(e)} 厘米`:`${(e/100).toFixed(1)} 米`}function at(e,t){if(t<=0)return`0`;let n=e/t*100;return n<.1?`不足 0.1`:n<10?n.toFixed(1):Math.round(n).toString()}function z(e){return e.replace(/[&<>"']/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`"`:return`&quot;`;default:return`&#39;`}})}var ot=[`幼苗`,`小樹`,`青年樹`,`成年樹`,`巨樹`],st=[0,.025,.1,.4,.85],ct=[{id:`camphor`,season:`s3`,name:`樟樹`,english:`Camphor tree`,scientific:`Camphora officinarum（Cinnamomum camphora）`,typicalM:`20–30`,maxM:30,record:`《中國植物誌》：高可達 30 米`,source:{label:`Wikipedia／Flora of China`,url:`https://en.wikipedia.org/wiki/Camphor_tree`},form:`round`,blurb:`香港郊野同公園常見，樹冠又闊又密，葉有樟腦香。`,stages:[`兩片圓葉加一個嫩芽`,`幼幹分出幾枝，樹冠細細個`,`樹冠開始變圓，春天有紅銅色嫩葉`,`闊大濃密嘅圓頂樹冠，開細白花`,`粗壯灰褐樹幹、板根，樹冠比樹身仲闊`]},{id:`cotton`,season:`s3`,name:`木棉`,english:`Red silk-cotton tree`,scientific:`Bombax ceiba`,typicalM:`約 20`,maxM:60,record:`一般約 20 米；濕熱地區老樹可達 60 米`,source:{label:`Wikipedia`,url:`https://en.wikipedia.org/wiki/Bombax_ceiba`},form:`tiered`,blurb:`「英雄樹」，樹幹筆直，枝條一層層平伸，春天未出葉先開大紅花。`,stages:[`掌狀嫩葉，莖上有細刺`,`筆直幼幹，幹上一粒粒圓錐刺`,`枝條分層平伸，好似塔咁`,`層層橫枝開滿大紅花`,`高大筆直嘅灰幹，紅花之外仲有棉絮爆出`]},{id:`banyan`,season:`s3`,name:`細葉榕`,english:`Chinese banyan`,scientific:`Ficus microcarpa`,typicalM:`20–25`,maxM:25,record:`香港原生，成年可達約 25 米`,source:{label:`綠化香港 Greening.gov.hk／香港動植物公園`,url:`https://www.greening.gov.hk/en/community-outreach/qrcode-tree-labels/index_id_4.html`},form:`banyan`,blurb:`香港村口、廟前最常見嘅大樹，枝上垂落氣根，落地變成支柱根。`,stages:[`幾塊細細嘅深綠葉`,`樹幹開始扭曲，枝條向外伸`,`樹冠又闊又密，開始有氣根垂落`,`一簾簾氣根，樹冠闊過樹高`,`多條氣根落地成柱，好似一片細樹林，結滿細榕果`]},{id:`metasequoia`,season:`s6`,name:`水杉`,english:`Dawn redwood`,scientific:`Metasequoia glyptostroboides`,typicalM:`30–45`,maxM:50,record:`湖北水杉壩谷有多棵約 50 米`,source:{label:`Arnold Arboretum／conifers.org`,url:`https://conifers.org/cu/Metasequoia.php`},form:`narrowCone`,blurb:`「活化石」，1940 年代先喺湖北重新發現。落葉針葉樹，樹形窄長如塔。`,stages:[`一撮羽毛似嘅軟針葉`,`幼幹筆直，細枝對生`,`窄長圓錐形，葉色嫩綠`,`高聳尖塔，樹幹紅褐有溝紋`,`基部板根，葉轉銅紅色，好似秋天`]},{id:`ginkgo`,season:`s6`,name:`銀杏`,english:`Ginkgo`,scientific:`Ginkgo biloba`,typicalM:`20–40`,maxM:60,record:`甘肅大堡一棵高 60 米（conifers.org）`,source:{label:`conifers.org／Journal of Ecology (2022)`,url:`https://www.conifers.org/~conifers/gi/Ginkgoaceae.php`},form:`fan`,blurb:`兩億幾年前已經存在嘅物種，扇形葉，秋天變金黃。`,stages:[`兩三塊扇形小葉`,`瘦長樹幹，枝條疏疏落落`,`枝條 45 度向上，樹冠開始成形`,`寬卵形樹冠，扇葉開始轉金`,`滿樹金黃，樹下鋪滿落葉`]},{id:`deodar`,season:`s6`,name:`雪松`,english:`Deodar cedar`,scientific:`Cedrus deodara`,typicalM:`40–50`,maxM:60,record:`喜馬拉雅原生地 40–50 米，個別達 60 米`,source:{label:`Wikipedia／Trees and Shrubs Online`,url:`https://en.wikipedia.org/wiki/Cedrus_deodara`},form:`drooping`,blurb:`喜馬拉雅山嘅「神木」，一層層水平枝，枝尖下垂，樹頂微微彎低。`,stages:[`一小撮藍綠針葉`,`樹頂彎彎，細枝開始分層`,`寬闊金字塔形，枝層分明`,`大片水平枝層，枝尖下垂，掛住直立球果`,`巨大寶塔形，深色樹幹，枝層似雲`]},{id:`redwood`,season:`s12`,name:`北美紅杉`,english:`Coast redwood`,scientific:`Sequoia sempervirens`,typicalM:`60–100`,maxM:116.2,record:`「海波龍」（Hyperion）116.22 米，世界最高嘅樹`,source:{label:`Wikipedia`,url:`https://en.wikipedia.org/wiki/Sequoia_sempervirens`},form:`column`,blurb:`加州海岸霧林嘅巨人，樹皮厚而紅褐，可以活二千年。`,stages:[`細細一撮扁平針葉`,`筆直幼幹，樹皮開始泛紅`,`窄長圓錐，樹冠延到地面`,`粗大紅褐樹幹，下半段光禿，樹冠集中喺高處`,`巨大有溝紋嘅紅幹、火燒疤痕，頂部分出幾條副幹`]},{id:`eucalyptus`,season:`s12`,name:`杏仁桉`,english:`Mountain ash`,scientific:`Eucalyptus regnans`,typicalM:`70–90`,maxM:100.5,record:`塔斯曼尼亞「百夫長」（Centurion）2018 年量得 100.5 米，最高嘅開花植物`,source:{label:`Giant Tree Expeditions／ABC News`,url:`https://giant-trees.com/project/how-tall-is-the-tallest-flowering-tree/`},form:`eucalypt`,blurb:`世界最高嘅開花植物。樹幹又直又滑，灰白色，下段掛住剝落樹皮。`,stages:[`對生嘅圓形嫩葉`,`瘦長樹幹，葉片開始變長`,`樹幹光滑灰白，樹冠疏落`,`長長一段光幹，樹冠喺頂上一團團`,`巨大白幹、剝落樹皮帶，頂部有枯枝`]},{id:`douglas`,season:`s12`,name:`花旗松`,english:`Coast Douglas-fir`,scientific:`Pseudotsuga menziesii`,typicalM:`60–75`,maxM:99.8,record:`俄勒岡「Doerner Fir」量得 99.3–99.8 米（2025 年山火後剩約 85 米）`,source:{label:`Wikipedia／Monumental Trees`,url:`https://en.wikipedia.org/wiki/Doerner_Fir`},form:`cone`,blurb:`北美太平洋岸嘅經典聖誕樹形，係世界第二高嘅針葉樹種。`,stages:[`一圈細針葉`,`細細嘅三角形小松`,`濃密圓錐形，枝到地面`,`高大深綠圓錐，掛滿有「鼠尾」苞片嘅球果`,`下半段枝條自然脫落，粗厚深溝樹皮`]}];function lt(e){return ct.find(t=>t.id===e)??ct[0]}function ut(e){return ct.filter(t=>t.season===e)}function dt(e){return ut(e)[0].id}function ft(e,t){let n=0;return st.forEach((r,i)=>{e>=r*t&&(n=i)}),n}function pt(e,t){let n=st[e]*t,r=e<4?st[e+1]*t:t;return e===0?Math.max(18,r*.5):e===4?t*.97:Math.sqrt(n*r)}var mt=[3,4,5,6,7,8,9],ht=[{id:`whiteeye`,name:`暗綠繡眼鳥`,category:`bird`,motion:`flock`,group:[4,7],epithet:`白眼圈小綠鳥`,about:`成群喺樹冠穿梭，好鍾意啄花蜜同細蟲。`,minM:1.2,minHealth:50,real:{len:.11,span:.17},look:{kind:`bird`,c:[`#9fbf3a`,`#e9edc8`,`#a8c640`,`#3a3a3a`,`#86a830`,`#ffffff`],size:.75,f:[`eyering`]}},{id:`sparrow`,name:`麻雀`,category:`bird`,motion:`flock`,group:[3,6],epithet:`簷前熟客`,about:`香港全年都見得到，吱吱喳喳成群出現。`,minM:.8,minHealth:48,real:{len:.14,span:.22},look:{kind:`bird`,c:[`#9b6b43`,`#e9dcc4`,`#7a4b2a`,`#3b3b3b`,`#6d4a2f`,`#f4efe6`],size:.85,f:[`cheek`]}},{id:`tailorbird`,name:`長尾縫葉鶯`,category:`bird`,motion:`perch`,group:[1,2],epithet:`會縫葉嘅小鳥`,about:`用蜘蛛絲將葉片縫成袋仔做巢，尾巴成日翹起。`,minM:1,minHealth:50,real:{len:.12,span:.15},look:{kind:`bird`,c:[`#8fae5a`,`#f1eee0`,`#c8743a`,`#4a4a4a`,`#7c9a4c`],size:.7,f:[`cap`,`cocked`]}},{id:`wagtail`,name:`白鶺鴒`,category:`bird`,motion:`hop`,group:[1,2],epithet:`擺尾碎步`,about:`喺地面碎步行，尾巴上下擺個不停。`,minM:1.2,minHealth:50,real:{len:.19,span:.3},look:{kind:`bird`,c:[`#4a4a4a`,`#ffffff`,`#ffffff`,`#222222`,`#3a3a3a`,`#111111`],size:.85,f:[`longTail`,`mask`]}},{id:`munia`,name:`白腰文鳥`,category:`bird`,motion:`flock`,group:[4,8],epithet:`一串串小褐鳥`,about:`成群啄草籽，互相依偎企成一排。`,minM:2,minHealth:55,real:{len:.11,span:.16},look:{kind:`bird`,c:[`#6b4a32`,`#f2eadc`,`#3b2a1e`,`#8a8a92`,`#5a3d28`],size:.7,f:[`thickBeak`]}},{id:`myna`,name:`八哥`,category:`bird`,motion:`hop`,group:[2,3],epithet:`額前一撮毛`,about:`全身黑色，額前有撮羽冠，飛起時翼上有白斑。`,minM:2.5,minHealth:55,real:{len:.26,span:.45},look:{kind:`bird`,c:[`#1f1f22`,`#2a2a2e`,`#1a1a1c`,`#f0c040`,`#1f1f22`,`#ffffff`],size:1,f:[`crest`,`wingpatch`]}},{id:`bulbul`,name:`白頭鵯`,category:`bird`,motion:`perch`,group:[1,2],epithet:`白頭高歌`,about:`頭頂一撮白，是窗臺同公園的熟客。`,minM:3.5,minHealth:58,real:{len:.19,span:.28},look:{kind:`bird`,c:[`#8a9468`,`#eeeadb`,`#262626`,`#2b2b2b`,`#6f7a52`,`#ffffff`],size:.9,f:[`crest`]}},{id:`egret`,name:`小白鷺`,category:`bird`,motion:`wade`,group:[1,3],epithet:`溪邊白衣`,about:`雨後喺溪邊慢慢行，黃色腳趾係佢嘅標記。`,minM:3,minHealth:55,weather:`rain`,real:{len:.6,span:.95},look:{kind:`bird`,c:[`#fbfbf6`,`#ffffff`,`#fbfbf6`,`#222222`,`#f2f2ec`],size:1.5,f:[`longLegs`,`longNeck`,`longBeak`]}},{id:`magpierobin`,name:`鵲鴝`,category:`bird`,motion:`nest`,group:[1,1],epithet:`巢裡幾顆蛋`,about:`黑白分明的小鳥，喺樹杈築巢，巢入面有幾顆淺藍色的蛋。`,minM:4,minHealth:62,real:{len:.2,span:.28},look:{kind:`bird`,c:[`#1f1f22`,`#f4f4f4`,`#1f1f22`,`#1f1f1f`,`#f4f4f4`],size:.95,f:[`cocked`]}},{id:`sunbird`,name:`叉尾太陽鳥`,category:`bird`,motion:`hover`,group:[1,2],epithet:`花間小寶石`,about:`香港最細小嘅雀鳥之一，可以好似蜂鳥咁懸停吸花蜜。`,minM:4,minHealth:60,real:{len:.1,span:.13},look:{kind:`bird`,c:[`#4a6a3a`,`#f0d84a`,`#2a8a7a`,`#222222`,`#3f5f32`,`#c8322a`],size:.6,f:[`longBeak`,`longTail`]}},{id:`redbulbul`,name:`紅耳鵯`,category:`bird`,motion:`perch`,group:[1,3],epithet:`紅頰俏鳥`,about:`頰上有紅斑，頭頂尖尖羽冠，叫聲清亮。`,minM:5,minHealth:60,real:{len:.2,span:.28},look:{kind:`bird`,c:[`#7b6450`,`#f1ebe0`,`#222222`,`#2b2b2b`,`#6a5442`,`#d9362b`],size:.9,f:[`crest`,`cheek`]}},{id:`coucal`,name:`褐翅鴉鵑`,category:`bird`,motion:`hop`,group:[1,1],epithet:`紅翼大黑鳥`,about:`俗稱「毛雞」，喺草叢低處行來行去，叫聲「嘟嘟嘟」。`,minM:5,minHealth:60,real:{len:.52,span:.6},look:{kind:`bird`,c:[`#1f1f24`,`#1f1f24`,`#1f1f24`,`#222222`,`#9a4a22`],size:1.5,f:[`longTail`,`redEye`]}},{id:`swallow`,name:`家燕`,category:`bird`,motion:`flock`,group:[4,8],epithet:`剪刀尾`,about:`春夏喺天空快速穿梭捉蟲，尾巴分叉似剪刀。`,minM:5,minHealth:55,months:mt,real:{len:.18,span:.33},look:{kind:`bird`,c:[`#1d2a5a`,`#f2ece2`,`#1d2a5a`,`#222222`,`#1a244c`,`#b8402a`],size:.8,f:[`forkTail`]}},{id:`starling`,name:`黑領椋鳥`,category:`bird`,motion:`flock`,group:[2,4],epithet:`黑頸圈`,about:`成對或者細群出現，頸有一圈黑，眼周黃色。`,minM:6,minHealth:58,real:{len:.28,span:.45},look:{kind:`bird`,c:[`#3a3a3a`,`#f2f2ee`,`#f6f6f2`,`#222222`,`#2a2a2a`,`#111111`],size:1.1,f:[`collar`]}},{id:`nightheron`,name:`夜鷺`,category:`bird`,motion:`wade`,group:[1,2],epithet:`夜裡的釣手`,about:`日頭縮住頸瞓覺，黃昏先出嚟喺水邊捉魚。`,minM:6,minHealth:58,night:!0,real:{len:.6,span:1.1},look:{kind:`bird`,c:[`#8a9098`,`#f0f0ee`,`#223040`,`#1a1a1a`,`#7c828c`],size:1.35,f:[`longLegs`,`longBeak`,`redEye`]}},{id:`kingfisher`,name:`普通翠鳥`,category:`bird`,motion:`perch`,group:[1,1],epithet:`藍電一掠`,about:`風暴之後天色放晴，藍影會停在枝上。`,minM:7,minHealth:70,needStorms:1,real:{len:.16,span:.25},look:{kind:`bird`,c:[`#1f86c9`,`#e8843a`,`#1a6fb0`,`#1f1f1f`,`#2aa3dc`,`#f4b07a`],size:.85,f:[`longBeak`,`cheek`]}},{id:`hwamei`,name:`畫眉`,category:`bird`,motion:`perch`,group:[1,1],epithet:`白眉歌手`,about:`眼周有條白眉，歌聲婉轉，喺灌叢低處活動。`,minM:8,minHealth:60,real:{len:.22,span:.28},look:{kind:`bird`,c:[`#a0703a`,`#c89a5a`,`#9a6a36`,`#e0c050`,`#8a5e30`,`#ffffff`],size:1,f:[`eyering`,`longTail`]}},{id:`woodpecker`,name:`星頭啄木鳥`,category:`bird`,motion:`climb`,group:[1,1],epithet:`敲敲樹幹`,about:`細細隻嘅啄木鳥，喺樹幹上一路敲一路搵蟲。`,minM:8,minHealth:62,spot:`trunk`,real:{len:.15,span:.25},look:{kind:`bird`,c:[`#4a4038`,`#efe9dc`,`#4a4038`,`#4a4a4a`,`#f2f2f2`,`#d8322b`],size:.8,f:[`cap`,`longBeak`,`barred`]}},{id:`magpie`,name:`喜鵲`,category:`bird`,motion:`perch`,group:[1,2],epithet:`報喜黑白鵲`,about:`黑白分明，長尾有藍綠光澤，喺高樹頂築大巢。`,minM:9,minHealth:60,real:{len:.45,span:.6},look:{kind:`bird`,c:[`#18181c`,`#f6f6f6`,`#18181c`,`#1a1a1a`,`#24344a`,`#ffffff`],size:1.3,f:[`longTail`,`wingpatch`]}},{id:`dove`,name:`珠頸斑鳩`,category:`bird`,motion:`perch`,group:[1,2],epithet:`咕咕低鳴`,about:`頸上似一串珍珠，步步安穩。`,minM:10,minHealth:64,real:{len:.3,span:.5},look:{kind:`bird`,c:[`#b39a8b`,`#d9c7bb`,`#9d8a86`,`#3b3b3b`,`#8e7768`,`#2e2e2e`],size:1.15,f:[`collar`]}},{id:`koel`,name:`噪鵑`,category:`bird`,motion:`perch`,group:[1,1],epithet:`「歸家呀」`,about:`春夏清晨叫聲響亮似「歸家呀」，雄鳥全黑紅眼。`,minM:11,minHealth:62,months:[3,4,5,6,7,8],real:{len:.42,span:.6},look:{kind:`bird`,c:[`#15151a`,`#15151a`,`#15151a`,`#b8c09a`,`#1a1a22`],size:1.3,f:[`longTail`,`redEye`]}},{id:`crow`,name:`大嘴烏鴉`,category:`bird`,motion:`perch`,group:[1,2],epithet:`聰明黑衣`,about:`識得用工具、記得人面，係最聰明嘅雀鳥之一。`,minM:12,minHealth:50,real:{len:.55,span:1.1},look:{kind:`bird`,c:[`#141418`,`#1a1a20`,`#141418`,`#1a1a1a`,`#1c1c24`],size:1.5,f:[`thickBeak`]}},{id:`parakeet`,name:`紅領綠鸚鵡`,category:`bird`,motion:`flock`,group:[2,4],epithet:`綠色長尾`,about:`由籠鳥逃逸後喺香港市區落地生根，成群吵鬧飛過。`,minM:13,minHealth:66,real:{len:.4,span:.45},look:{kind:`bird`,c:[`#4ec23a`,`#8ad860`,`#4ec23a`,`#d8302a`,`#3aa02c`,`#111111`],size:1.1,f:[`longTail`,`hooked`,`collar`]}},{id:`bluemagpie`,name:`紅嘴藍鵲`,category:`bird`,motion:`perch`,group:[1,3],epithet:`長尾藍衣`,about:`紅嘴紅腳，尾巴比身長一倍，成群喺樹林中滑翔。`,minM:14,minHealth:68,real:{len:.65,span:.55},look:{kind:`bird`,c:[`#3c6ab0`,`#f2f2f2`,`#18181c`,`#d8302a`,`#3a64a8`,`#ffffff`],size:1.3,f:[`longTail`,`veryLongTail`]}},{id:`owl`,name:`領角鴞`,category:`bird`,motion:`hollow`,group:[1,1],epithet:`夜裡的眼睛`,about:`香港常見的小型貓頭鷹，黃昏後最活躍。`,minM:15,minHealth:72,night:!0,real:{len:.24,span:.6},look:{kind:`owl`,c:[`#8c7358`,`#d8c3a2`,`#f2b632`],size:1}},{id:`cockatoo`,name:`小葵花鳳頭鸚鵡`,category:`bird`,motion:`flock`,group:[2,5],epithet:`黃冠白鸚`,about:`極度瀕危，但香港市區有穩定野生群，比原生地仲多。`,minM:18,minHealth:72,real:{len:.33,span:.7},look:{kind:`bird`,c:[`#fbfbf4`,`#f6f2e0`,`#fbfbf4`,`#2a2a2a`,`#f2eee0`,`#f6d23a`],size:1.4,f:[`crest`,`bigCrest`,`hooked`]}},{id:`spoonbill`,name:`黑臉琵鷺`,category:`bird`,motion:`wade`,group:[2,4],epithet:`黑臉飯匙嘴`,about:`瀕危候鳥，每年秋冬嚟后海灣過冬，嘴似飯匙。`,minM:20,minHealth:70,months:[10,11,12,1,2,3,4],real:{len:.75,span:1.15},look:{kind:`bird`,c:[`#fbfbf6`,`#ffffff`,`#fbfbf6`,`#1a1a1a`,`#f2f2ec`],size:1.6,f:[`longLegs`,`longNeck`,`spoon`]}},{id:`kite`,name:`黑鳶`,category:`bird`,motion:`soar`,group:[1,2],epithet:`維港上空盤旋`,about:`俗稱「麻鷹」，張開翼喺海港上空慢慢盤旋。`,minM:25,minHealth:60,real:{len:.6,span:1.5},look:{kind:`bird`,c:[`#6a4a32`,`#8a6a4a`,`#7a5a40`,`#2a2a2a`,`#5a3e2a`],size:2.2,f:[`hooked`,`forkTail`,`soar`]}},{id:`serpenteagle`,name:`蛇鵰`,category:`bird`,motion:`soar`,group:[1,1],epithet:`郊野之王`,about:`喺郊野上空盤旋，一邊叫一邊搵蛇食。`,minM:40,minHealth:70,season:`s6`,real:{len:.7,span:1.6},look:{kind:`bird`,c:[`#4a3a2a`,`#c8a878`,`#3a2e24`,`#e8c040`,`#3e3024`],size:2.6,f:[`hooked`,`soar`,`crest`]}},{id:`seaeagle`,name:`白腹海鵰`,category:`bird`,motion:`soar`,group:[1,1],epithet:`海岸霸主`,about:`香港最大嘅猛禽，喺海岸高樹同懸崖築巢。`,minM:60,minHealth:75,season:`s12`,real:{len:.8,span:2},look:{kind:`bird`,c:[`#f4f4f0`,`#ffffff`,`#f4f4f0`,`#8a8a92`,`#5a5e66`],size:3,f:[`hooked`,`soar`]}},{id:`squirrel`,name:`赤腹松鼠`,category:`mammal`,motion:`climb`,group:[1,2],epithet:`赤腹一閃`,about:`郊野同公園都有，尾巴比身體還靈活。`,minM:2,minHealth:55,spot:`trunk`,real:{len:.4},look:{kind:`squirrel`,c:[`#8e4f2c`,`#c4623a`,`#7d4526`],size:1}},{id:`ferretbadger`,name:`鼬獾`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`白額小夜行者`,about:`面上有白色斑紋，夜晚喺落葉堆掘蚯蚓。`,minM:6,minHealth:58,night:!0,real:{len:.55},look:{kind:`quad`,c:[`#6a5a4a`,`#d8ccb8`,`#f2eee6`,`#2a2a2a`],size:.6,f:[`mask`,`snout`,`longTail`]}},{id:`porcupine`,name:`豪豬`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`一身長刺`,about:`夜間出沒，受驚會豎起黑白長刺沙沙作響。`,minM:8,minHealth:60,night:!0,real:{len:.75},look:{kind:`quad`,c:[`#3a3430`,`#3a3430`,`#2a2624`,`#f2eee6`],size:.8,f:[`spines`,`stocky`]}},{id:`fruitbat`,name:`短吻果蝠`,category:`mammal`,motion:`bat`,group:[3,6],epithet:`夜空小狐狸`,about:`食果實同花蜜，幫樹傳粉散播種子。`,minM:9,minHealth:60,night:!0,real:{len:.1,span:.45},look:{kind:`bat`,c:[`#5a4232`,`#8a6a4a`,`#3a2c22`],size:1}},{id:`boar`,name:`野豬`,category:`mammal`,motion:`walk`,group:[2,4],epithet:`郊野掘地者`,about:`一家大細出動，用鼻拱泥搵樹根同果實。`,minM:10,minHealth:55,real:{len:1.5},look:{kind:`quad`,c:[`#4a3a30`,`#5a4a3e`,`#3a2e26`,`#e8e0d0`],size:1.3,f:[`snout`,`tusks`,`stocky`,`bristle`]}},{id:`muntjac`,name:`赤麂`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`樹下吠鹿`,about:`香港郊野的細小鹿，受驚會好似狗吠咁叫，最鍾意喺樹蔭下休息。`,minM:12,minHealth:70,real:{len:1},look:{kind:`quad`,c:[`#b7753f`,`#e9d2b0`,`#b7753f`,`#5b4331`],size:1.3,f:[`antlers`,`longLegs`]}},{id:`civet`,name:`果子狸`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`白鼻心`,about:`面上有白色條紋，夜晚爬樹食果。`,minM:14,minHealth:66,night:!0,real:{len:1.1},look:{kind:`quad`,c:[`#7a6a5a`,`#a89a88`,`#2a2622`,`#f2eee6`],size:1,f:[`mask`,`longTail`,`blaze`]}},{id:`macaque`,name:`獼猴`,category:`mammal`,motion:`walk`,group:[3,6],epithet:`猴群出沒`,about:`金山一帶成群生活，有猴王帶隊，千祈唔好餵食。`,minM:16,minHealth:65,real:{len:.75},look:{kind:`monkey`,c:[`#a88a62`,`#c8aa82`,`#e8a898`],size:1.2}},{id:`leopardcat`,name:`豹貓`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`郊野細花豹`,about:`同家貓差唔多大，身上有豹紋，夜間捕獵。`,minM:20,minHealth:72,night:!0,real:{len:.9},look:{kind:`quad`,c:[`#c8a060`,`#f0e0c0`,`#c8a060`,`#2a2218`],size:.8,f:[`spots`,`longTail`,`catEars`]}},{id:`cattle`,name:`黃牛`,category:`mammal`,motion:`walk`,group:[2,4],epithet:`西貢牛群`,about:`昔日農耕牛嘅後代，而家喺郊野自由自在咁食草。`,minM:22,minHealth:62,real:{len:2.3},look:{kind:`quad`,c:[`#b8783a`,`#d8a870`,`#a86a30`,`#e8e0cc`],size:2.2,f:[`horns`,`stocky`,`longLegs`,`cowTail`]}},{id:`buffalo`,name:`水牛`,category:`mammal`,motion:`walk`,group:[2,3],epithet:`大嶼山泥浴`,about:`大嶼山濕地嘅水牛群，鍾意浸泥漿消暑。`,minM:30,minHealth:65,season:`s6`,real:{len:2.8},look:{kind:`quad`,c:[`#3a3634`,`#4a4644`,`#2e2a28`,`#8a8478`],size:2.5,f:[`bigHorns`,`stocky`,`longLegs`,`cowTail`]}},{id:`smallcivet`,name:`小靈貓`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`環紋長尾`,about:`尾巴有一圈圈黑環，夜間喺地面覓食。`,minM:35,minHealth:70,night:!0,season:`s6`,real:{len:.9},look:{kind:`quad`,c:[`#b8a078`,`#e0d0b0`,`#b8a078`,`#2a2622`],size:.8,f:[`spots`,`ringTail`,`longTail`,`snout`]}},{id:`pangolin`,name:`穿山甲`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`一身鱗甲`,about:`極度瀕危，全身鱗片，受驚會捲成一個球。`,minM:45,minHealth:85,night:!0,season:`s6`,real:{len:.8},look:{kind:`quad`,c:[`#8a6a4a`,`#b89a78`,`#6a4e36`,`#5a4432`],size:.9,f:[`scales`,`longTail`,`snout`,`short`]}},{id:`otter`,name:`歐亞水獺`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`米埔稀客`,about:`香港極罕見，只喺后海灣一帶有少量紀錄。`,minM:70,minHealth:85,season:`s12`,real:{len:1.1},look:{kind:`quad`,c:[`#5a4232`,`#c8b8a0`,`#5a4232`,`#2a2a2a`],size:1,f:[`short`,`longTail`,`snout`]}},{id:`butterfly`,name:`菜粉蝶`,category:`butterfly`,motion:`flutter`,group:[1,3],epithet:`白翼點綠`,about:`園圃常見的白蝴蝶，喜歡停在新葉上。`,minM:.15,minHealth:40,real:{len:.025,span:.05},look:{kind:`butterfly`,c:[`#fbfbf2`,`#9ccf6a`,`#333333`],size:.8}},{id:`plaintiger`,name:`金斑蝶`,category:`butterfly`,motion:`flutter`,group:[2,4],epithet:`橙翼黑邊`,about:`橙色翅膀帶黑邊白點，身體有毒，雀鳥唔敢食。`,minM:2,minHealth:50,real:{len:.035,span:.07},look:{kind:`butterfly`,c:[`#f08a2a`,`#1a1a1a`,`#222222`,`#ffffff`],size:1}},{id:`bluebottle`,name:`青鳳蝶`,category:`butterfly`,motion:`flutter`,group:[1,2],epithet:`青藍一條帶`,about:`黑翅中間有一條半透明青藍色帶，飛得好快。`,minM:4,minHealth:55,real:{len:.035,span:.08},look:{kind:`butterfly`,c:[`#1a1a1e`,`#3ac0d8`,`#222222`],size:1.05,f:[`tails`]}},{id:`birdwing`,name:`裳鳳蝶`,category:`butterfly`,motion:`flutter`,group:[1,1],epithet:`金裳大蝶`,about:`香港最大嘅蝴蝶，受保護，後翅金黃色。`,minM:18,minHealth:75,months:mt,real:{len:.06,span:.15},look:{kind:`butterfly`,c:[`#141414`,`#f2c81a`,`#1a1a1a`],size:1.7}},{id:`atlasmoth`,name:`皇蛾`,category:`butterfly`,motion:`flutter`,group:[1,1],epithet:`蛇頭翅尖`,about:`世界最大嘅蛾之一，翅尖似蛇頭，夜晚先出現。`,minM:28,minHealth:72,night:!0,season:`s6`,real:{len:.08,span:.25},look:{kind:`butterfly`,c:[`#a8502a`,`#f2dcb0`,`#6a3a22`,`#ffffff`],size:2,f:[`moth`]}},{id:`ladybug`,name:`七星瓢蟲`,category:`insect`,motion:`crawl`,group:[1,2],epithet:`葉上紅點`,about:`紅殼黑點，會幫樹食蚜蟲。`,minM:.3,minHealth:45,spot:`leaf`,real:{len:.007},look:{kind:`beetle`,c:[`#d8322b`,`#1a1a1a`],size:.7,f:[`dots`]}},{id:`dragonfly`,name:`紅蜻蜓`,category:`insect`,motion:`hover`,group:[2,4],epithet:`雨後點水`,about:`落雨前後喺低空盤旋捉蚊。`,minM:1,minHealth:45,weather:`rain`,real:{len:.045,span:.07},look:{kind:`dragonfly`,c:[`#d8402a`,`#e8f0f0`],size:.9}},{id:`honeybee`,name:`中華蜜蜂`,category:`insect`,motion:`hover`,group:[3,6],epithet:`嗡嗡採蜜`,about:`本地原生蜜蜂，幫開花植物傳粉。`,minM:3,minHealth:60,real:{len:.012,span:.02},look:{kind:`bee`,c:[`#e0a830`,`#2a2218`,`#e8f0f4`],size:.55}},{id:`mantis`,name:`螳螂`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`祈禱獵手`,about:`雙手似鐮刀，靜靜喺葉上伏擊小蟲。`,minM:5,minHealth:55,spot:`leaf`,real:{len:.08},look:{kind:`mantis`,c:[`#7ac04a`,`#5a9a3a`],size:.9}},{id:`cicada`,name:`蟬`,category:`insect`,motion:`crawl`,group:[1,2],epithet:`盛夏長鳴`,about:`要碰上酷熱的日子，牠才肯露面。`,minM:6,minHealth:55,weather:`hot`,spot:`trunk`,real:{len:.05,span:.12},look:{kind:`cicada`,c:[`#4d5a3a`,`#dfeee6`,`#394530`],size:.8}},{id:`stickinsect`,name:`竹節蟲`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`扮樹枝高手`,about:`身體似一條枯枝，一動不動就搵唔到佢。`,minM:9,minHealth:58,spot:`leaf`,real:{len:.12},look:{kind:`stick`,c:[`#8a7a4a`,`#6a5a36`],size:1}},{id:`rhinobeetle`,name:`獨角仙`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`一支大角`,about:`夏夜飛嚟食樹汁，雄蟲頭上有一支大角。`,minM:12,minHealth:62,months:[5,6,7,8,9],night:!0,spot:`trunk`,real:{len:.06},look:{kind:`beetle`,c:[`#3a2218`,`#1a120e`],size:.9,f:[`horn`]}},{id:`firefly`,name:`螢火蟲`,category:`insect`,motion:`glow`,group:[1,1],epithet:`一點溫光`,about:`樹夠大、夠健康，夜裡就有微光。`,minM:15,minHealth:80,night:!0,real:{len:.012,span:.02},look:{kind:`firefly`,c:[`#3b3325`,`#f6ff9a`],size:.6}},{id:`lizard`,name:`變色樹蜥`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`曬太陽變紅頭`,about:`天氣熱就喺樹幹曬太陽，雄性繁殖期頭頸會變紅。`,minM:1.5,minHealth:50,weather:`hot`,spot:`trunk`,real:{len:.35},look:{kind:`lizard`,c:[`#9a8a5a`,`#c84a2a`,`#6a5e3e`],size:1}},{id:`gecko`,name:`壁虎`,category:`reptile`,motion:`crawl`,group:[1,2],epithet:`夜燈下的獵手`,about:`夜晚喺燈光附近捉飛蟲，腳底有吸盤。`,minM:7,minHealth:55,night:!0,spot:`trunk`,real:{len:.12},look:{kind:`lizard`,c:[`#c8b89a`,`#e8dcc8`,`#a89878`],size:.7,f:[`gecko`]}},{id:`pitviper`,name:`竹葉青`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`綠色伏擊者`,about:`全身翠綠、尾巴紅色，有毒，喺枝上靜靜等獵物。`,minM:11,minHealth:62,spot:`leaf`,real:{len:.7},look:{kind:`snake`,c:[`#5ac03a`,`#d8402a`,`#f0e070`],size:.8}},{id:`python`,name:`緬甸蟒`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`郊野巨蟒`,about:`香港最大嘅蛇，受保護，無毒但力大無窮。`,minM:38,minHealth:75,season:`s6`,spot:`ground`,real:{len:3.5},look:{kind:`snake`,c:[`#a8905a`,`#5a4430`,`#d8c898`],size:2.2,f:[`blotch`]}},{id:`turtle`,name:`三線閉殼龜`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`金錢龜`,about:`極度瀕危，殼上有三條黑線，喺山溪附近生活。`,minM:50,minHealth:80,season:`s12`,spot:`ground`,real:{len:.2},look:{kind:`turtle`,c:[`#6a4a2a`,`#1a1a1a`,`#e8c040`],size:1}},{id:`toad`,name:`黑眶蟾蜍`,category:`amphibian`,motion:`hop`,group:[1,3],epithet:`雨夜咯咯`,about:`落雨時喺草地跳出嚟，眼睛周圍有黑框。`,minM:2,minHealth:52,weather:`rain`,real:{len:.08},look:{kind:`frog`,c:[`#8a6a42`,`#c8a878`,`#2a2018`],size:.8,f:[`warty`]}},{id:`newt`,name:`香港瘰螈`,category:`amphibian`,motion:`crawl`,group:[1,2],epithet:`溪中小龍`,about:`香港特有嘅蠑螈，肚皮有橙紅斑，喺清澈山溪生活。`,minM:3,minHealth:58,weather:`rain`,spot:`ground`,real:{len:.13},look:{kind:`lizard`,c:[`#3a2e28`,`#e8702a`,`#2a221e`],size:.8,f:[`newt`]}},{id:`treefrog`,name:`盧氏小樹蛙`,category:`amphibian`,motion:`hop`,group:[1,3],epithet:`指甲咁細`,about:`香港特有，只有一隻指甲咁大，雨夜叫聲清脆。`,minM:5,minHealth:60,weather:`rain`,night:!0,real:{len:.02},look:{kind:`frog`,c:[`#a8905a`,`#d8c898`,`#5a4a30`],size:.5}}];function gt(e){return ht.find(t=>t.id===e)}var _t={bird:`雀鳥`,mammal:`哺乳類`,butterfly:`蝴蝶・蛾`,insect:`昆蟲`,reptile:`爬蟲類`,amphibian:`兩棲類`},vt=[`bird`,`mammal`,`butterfly`,`insect`,`reptile`,`amphibian`],yt=e=>{let t=new Set(e);return[10,11,12,1,2].every(e=>t.has(e))?`秋冬`:[5,6,7,8].every(e=>t.has(e))&&!t.has(12)?t.has(3)?`春夏`:`夏天`:`${Math.min(...e)}–${Math.max(...e)} 月`},bt={s3:``,s6:`6 個月或以上賽季`,s12:`1 年賽季`};function xt(e){let t=[e.minM>=1?`${e.minM} 米`:`${Math.round(e.minM*100)} 厘米`,`健康 ${e.minHealth}`];return e.weather===`hot`&&t.push(`酷熱日`),e.weather===`rain`&&t.push(`落雨日`),e.needStorms&&t.push(`捱過 ${e.needStorms} 場風暴`),e.months&&t.push(yt(e.months)),e.season&&e.season!==`s3`&&t.push(bt[e.season]),e.night&&t.push(`夜行`),t.join(`・`)}var St=[{id:`seedling`,reach0:.2,reach1:.3,depth:0,trunk:4,roots:!1},{id:`sapling`,reach0:.34,reach1:.46,depth:3,trunk:9,roots:!1},{id:`young`,reach0:.48,reach1:.58,depth:4,trunk:14,roots:!1},{id:`mature`,reach0:.62,reach1:.72,depth:5,trunk:24,roots:!0},{id:`giant`,reach0:.8,reach1:.9,depth:6,trunk:40,roots:!0}];function Ct(e=2e3){return St.map((t,n)=>({...t,name:ot[n],index:n,minCm:Math.round(st[n]*e),nextCm:Math.round(n<4?st[n+1]*e:e)}))}function wt(e,t=2e3){let n=Ct(t),r=n[0];for(let t of n)e>=t.minCm&&(r=t);return r}function Tt(e,t=2e3){let n=wt(e,t),r=n.nextCm-n.minCm;return r<=0?1:R((e-n.minCm)/r,0,1)}var Et=83.8,Dt=116.2,Ot=[{meters:.5,title:`幼苗站穩`,detail:`第一段真葉展開，樹有自己的名字。`},{meters:1.7,title:`高過大多數人`,detail:`大約一個成年人的高度。`},{meters:5,title:`街燈左右`,detail:`大概是行人路燈柱的高度。`},{meters:12,title:`三層舊唐樓`,detail:`舊式唐樓一層大約四米，三層左右這個高度。`},{meters:44,title:`尖沙咀鐘樓`,detail:`尖沙咀前九廣鐵路鐘樓高約 44 米。`},{meters:Et,title:`將軍樹的高度`,detail:`美國巨杉「將軍樹」高 83.8 米。以體積計，牠是世界上最大的樹。`},{meters:Dt,title:`海波龍`,detail:`加州紅木「海波龍」是已知最高的樹，2026 年測量約 116.2 米。`}],kt=[{id:`mist`,chip:{text:`+6 水分`,tone:`blue`},title:`晨霧`,text:`薄霧濕潤咗葉面同泥土。`,apply:e=>{e.moisture=Math.min(100,e.moisture+6)}},{id:`compost`,chip:{text:`+16 養分`,tone:`green`},title:`鄰居的堆肥`,text:`樓下街坊分咗一袋堆肥畀你。`,apply:e=>{e.nutrients=Math.min(100,e.nutrients+16)}},{id:`birds`,chip:{text:`+2 健康度`,tone:`green`},title:`鳥仔來探`,text:`有小鳥停低又飛走，樹頂多咗幾分生氣。`,apply:e=>{e.health=Math.min(100,e.health+2)}},{id:`drywind`,chip:{text:`-10 水分`,tone:`red`},title:`乾風`,text:`風有啲乾，泥土會快啲渴。`,apply:e=>{e.moisture=Math.max(0,e.moisture-10)}},{id:`leaves`,chip:{text:`+8 養分`,tone:`green`},title:`落葉`,text:`舊葉落返泥度，慢慢變養分。`,apply:e=>{e.nutrients=Math.min(100,e.nutrients+8)}},{id:`drawing`,chip:{text:`+3 健康度`,tone:`green`},title:`小朋友的畫`,text:`有孩童在樹下留低一張畫，棵樹好像被好好對待。`,apply:e=>{e.health=Math.min(100,e.health+3)}},{id:`aphids`,chip:{text:`留意蟲害`,tone:`red`},title:`蚜蟲`,text:`葉底見到幾隻蚜蟲。養分唔夠或者泥土太濕，好易生蟲，可以除一除預防。`,apply:e=>{e.pest.active||(e.pest.lowNDays=Math.max(e.pest.lowNDays,1))}},{id:`sunbeam`,chip:{text:`生長 ×1.15`,tone:`blue`},title:`陽光正好`,text:`雲隙透出柔和陽光，今日會長得順一點。`,apply:e=>{e.eventBonus=1.15}},{id:`cat`,title:`花貓經過`,text:`一隻花貓在樹蔭攤咗一陣，冇搞破壞。`,apply:()=>{}},{id:`quiet`,title:`安靜的一日`,text:`冇特別事，樹就係咁慢慢大。`,apply:()=>{}}];function At(e){return kt[nt(e)%kt.length]??kt[0]}function jt(e){return kt.find(t=>t.id===e)??kt[9]}function Mt(e){return{date:e,water:0,drain:0,fertilize:0,dewormed:!1,preps:{stakes:!1,ropes:!1,prune:!1},credited:!1}}var Nt=()=>``;function Pt(e){Nt=e}function Ft(e,t,n,r={}){e.log.unshift({date:t,text:n,time:r.time??Nt(),kind:r.kind,title:r.title,reward:r.reward}),e.log.length>120&&(e.log.length=120)}var It=e=>Math.round(e*10)/10,Lt=e=>`${e>=0?`+`:``}${It(e)}`;function Rt(e,t={}){let n=t.legacyBonus??0,r={version:2,started:!1,treeName:t.name??`世界之樹`,season:t.season??`s3`,species:t.species&&lt(t.species).season===(t.season??`s3`)?t.species:dt(t.season??`s3`),createdOn:e,lastSeenDate:e,virtualToday:null,health:h.health,moisture:h.moisture,nutrients:P(h.nutrients+n),resist:h.resist,heightCm:h.heightCm,pest:{active:!1,lowNDays:0,wetDays:0,since:null},care:Mt(e),dayEvents:{},animals:[],seenAnimals:[],residents:[],highStreak:0,scars:0,log:[],daysCared:0,stormSurvivals:0,dailyEventDate:``,dailyEventId:`quiet`,eventBonus:1,morningNote:null,dying:null,over:null,completed:null,passedTargetOn:null,lastSettlement:null,legacyBonus:n};return Ft(r,e,n?`一棵幼苗喺上一棵樹留低嘅養分地標旁邊種低，一開始就有 +${n} 養分。`:`一棵幼苗種低咗，由今日開始慢慢陪佢大。`,{kind:`plant`,title:`種低幼苗`,reward:{text:n?`+${n} 養分`:`新開始`,tone:`green`}}),zt(r,e),r}function zt(e,t){if(e.dailyEventDate===t)return null;e.eventBonus=1;let n=At(t);return e.dailyEventDate=t,e.dailyEventId=n.id,n.apply(e),n.id!==`quiet`&&Ft(e,t,n.text,{kind:`event`,title:`今日小事：${n.title}`,reward:n.chip}),e.health=P(e.health),e.moisture=P(e.moisture),e.nutrients=P(e.nutrients),`${n.title}：${n.text}`}function Bt(e,t,n,r){let i=e.dayEvents[t]??={events:[],hko:!1};for(let e of n)e!==`clear`&&!i.events.includes(e)&&i.events.push(e);i.hko||=r;let a=Object.keys(e.dayEvents).sort();for(;a.length>21;)delete e.dayEvents[a.shift()]}function Vt(e,t,n){let r=e.dayEvents[t],i=r?.hko?Je(n):n?qe(n):`clear`;return[...new Set([i,...r?.events??[]])]}function Ht(e){return{waterSaver:!!(e&&e.badges[1]>0),rainToN:!!(e&&e.badges[2]>0)}}function Ut(n,r,a,s,c){let l=Ht(s),u=_e(n.season),d=me(a),p=i[d],m=[],h=[],g=n.health,_=n.moisture,y=n.nutrients,b=n.resist;a.filter(e=>e!==`clear`).length>1&&m.push(`同時有${a.filter(e=>e!==`clear`).map(e=>i[e].label).join(`、`)}，只計最重嘅${p.label}`);let x=p.dW,S=0;x<0&&l.waterSaver&&(x=It(x*f),m.push(`一級徽章：水分流失減少 10%`)),(d===`rainstorm`||d===`blackrain`)&&l.rainToN&&Se(`rain2n|${r}`)<.3&&(S=x/2,x/=2,m.push(`二級徽章：${S} 水分轉咗做養分`)),n.moisture=P(n.moisture+x);let C=Math.min(6,n.residents.length*2);C&&m.push(`長駐動物施肥 +${C} 養分`),n.nutrients=P(n.nutrients-10+S+C);let w=pe(p.damage,n.resist);n.resist=Math.max(0,Math.min(100,n.resist+p.dR-2));let T=n.pest.active?15:0;T&&m.push(`蟲害 −15`);let E=de(n.moisture),D=fe(n.nutrients);n.health=It(Math.max(0,Math.min(100,n.health+E+D-w-T)));let O=ge(n.health),k=p.damage>0&&w<=p.damage*.25,A=Math.round(p.growth*(k?o:1)*(n.eventBonus||1)*100)/100,j=It(ve(u)),ee=ye(j,O,A),M=n.heightCm;n.heightCm=Math.max(5,It(n.heightCm+ee)),p.damage>0&&(k?(n.stormSurvivals+=1,n.scars>0&&--n.scars,Ft(n,r,`${p.label}過咗。抗風力 ${Math.round(b)} 擋咗大部分傷害（${p.damage} → ${w}），今晚仲長得特別壯。`,{kind:`storm-safe`,title:`捱過${p.label}`,reward:{text:`生長 ×${o}`,tone:`green`},time:``}),h.push(`${p.label}過咗，你預先加固，只受 ${w} 點傷害，仲長得更壯。`)):w>=10&&(n.scars=Math.min(4,n.scars+1),Ft(n,r,`${p.label}令健康度 −${w}（基礎 ${p.damage}，抗風力 ${Math.round(b)} 減免咗 ${It(p.damage-w)}）。`,{kind:`storm-hit`,title:`${p.label}打中棵樹`,reward:{text:`-${w} 健康度`,tone:`red`},time:``}),h.push(`${p.label}令健康度 −${w}。下次預警一出，先加固推高抗風力。`))),n.pest.lowNDays=n.nutrients<30?n.pest.lowNDays+1:0,n.pest.wetDays=n.moisture>e[1]?n.pest.wetDays+1:0;let te=n.residents.length>=2?5:3;if(!n.pest.active&&(n.pest.lowNDays>=te||n.pest.wetDays>=te)){n.pest.active=!0,n.pest.since=r;let e=n.pest.lowNDays>=te?`連續 ${te} 日營養不良`:`連續 ${te} 日水浸`;Ft(n,r,`${e}，葉底生咗蟲。每日會扣 15 健康度，要用除蟲處理。`,{kind:`pest`,title:`蟲害`,reward:{text:`-15/日`,tone:`red`},time:``}),h.push(`${e}，生咗蟲！記得除蟲。`)}if(n.health>=90){if(n.highStreak+=1,n.highStreak>=3){let e=n.animals.find(e=>!n.residents.includes(e));e&&(n.residents.push(e),n.highStreak=0,Ft(n,r,`${ht.find(t=>t.id===e)?.name??e}鍾意呢棵咁健康嘅樹，決定長駐。每晚會幫手施少少肥${n.residents.length>=2?`，仲會幫手防蟲`:``}。`,{kind:`animal`,title:`動物長駐`,reward:{text:`長駐`,tone:`purple`},time:``}))}}else if(n.highStreak=0,n.health<70&&n.residents.length){let e=n.residents.pop();Ft(n,r,`樹唔夠精神，${ht.find(t=>t.id===e)?.name??e}搬走咗。健康度長期保持 90 以上，佢會返嚟。`,{kind:`animal`,title:`動物離開`,time:``})}let N=!1,ne=!1,re=n.dying;if(n.health<=0){if(n.health=0,!re)n.dying={since:r,at:c},Ft(n,r,`健康度跌到 0，棵樹進入 24 小時瀕死狀態。將水分調返 ${e[0]}–${e[1]}、養分 ${t[0]} 以上就救得返。`,{kind:`dying`,title:`瀕死`,reward:{text:`24 小時`,tone:`red`},time:``}),h.push(`棵樹瀕死！24 小時內將水分同養分調返最佳範圍就救得返。`);else if(c-re.at>=864e5){if(s&&s.reviveTokens>0)--s.reviveTokens,n.health=30,n.dying=null,ne=!0,Ft(n,r,`免死金牌生效，棵樹重新有咗生氣（健康度 30）。`,{kind:`badge`,title:`免死金牌`,reward:{text:`健康 30`,tone:`purple`},time:``}),h.push(`免死金牌救返棵樹！`);else{N=!0;let e=v(n.createdOn,r)+1;n.over={kind:`dead`,date:r,tiers:n.completed?[]:xe(u.days,e,!1),days:e},Ft(n,r,`${n.treeName}枯死咗，會化作小島上嘅養分地標，下一棵樹一開始就有 +40 養分。`,{kind:`dying`,title:`枯死`,time:``})}}}else re&&(n.dying=null,Ft(n,r,`棵樹捱過瀕死，慢慢回復生氣。`,{kind:`grow`,title:`救返`,reward:{text:`健康 ${Math.round(n.health)}`,tone:`green`},time:``}));let ie={date:r,events:[...a],event:d,hBefore:g,hAfter:n.health,wBefore:_,wAfter:n.moisture,nBefore:y,nAfter:n.nutrients,rBefore:b,rAfter:n.resist,wFactor:E,nFactor:D,baseDamage:p.damage,finalDamage:w,pestDamage:T,hMult:O,weatherBonus:A,baseGrowth:j,deltaG:It(n.heightCm-M),heightAfter:n.heightCm,carbonKg:be(n.heightCm),notes:m};n.lastSettlement=ie;let ae=he(n.health);Ft(n,r,`${p.label}。水分 ${E>0?`適中`:`失衡`} ${Lt(E)}，養分 ${Lt(D)}，天氣損傷 ${p.damage}→${w}${T?`，蟲害 −${T}`:``}。健康 ${Math.round(g)}→${Math.round(n.health)}，${ae.label} ×${O}。`,{kind:`settle`,title:`夜間結算`,reward:{text:`${ee>=0?`+`:``}${ie.deltaG} 厘米`,tone:ee>=0?`blue`:`red`},time:``}),Wt(n,M,r),!n.over&&!n.passedTargetOn&&n.heightCm>=u.targetCm&&(n.passedTargetOn=r,Ft(n,r,`${n.treeName}突破咗 ${it(u.targetCm)} 嘅目標，繼續長高！`,{kind:`badge`,title:`已突破目標`,reward:{text:it(n.heightCm),tone:`purple`},time:``}));let oe=!1;if(!n.over&&!n.completed){let e=v(n.createdOn,r)+1;e>=u.days&&(oe=!0,n.completed={date:r,tiers:xe(u.days,e,!0),days:e,heightCm:n.heightCm},Ft(n,r,`${u.label}完成！${n.treeName}長到 ${it(n.heightCm)}，徽章到手。棵樹會繼續長落去。`,{kind:`badge`,title:`賽季完成`,reward:{text:`徽章`,tone:`purple`},time:``}))}return{settlement:ie,messages:h,died:N,revived:ne,completed:oe}}function Wt(e,t,n,r=``){let i=_e(e.season).targetCm,a=wt(t,i),o=wt(e.heightCm,i);return a.id===o.id||e.heightCm<t?null:(Ft(e,n,`棵樹長成${o.name}，高 ${it(e.heightCm)}。`,{kind:`stage`,title:`進入新階段`,reward:{text:o.name,tone:`blue`},time:r}),`棵樹進入新階段：${o.name}。`)}function Gt(e,t){return t===`water`?{used:e.care.water,max:p.water.perDay}:t===`drain`?{used:e.care.drain,max:p.drain.perDay}:t===`fertilize`?{used:e.care.fertilize,max:p.fertilize.perDay}:{used:+!!e.care.dewormed,max:1}}function Kt(t,n,r){if(t.over)return{ok:!1,message:`呢局已經完結。`};let i=Gt(t,n);if(i.used>=i.max)return{ok:!1,message:`今日做夠喇，聽日再嚟。`};let a=``,o,s={water:`已澆水`,fertilize:`已施肥`,deworm:`已除蟲`,drain:`已疏水`}[n];if(n===`water`){if(r.raining)return{ok:!1,message:`落緊雨，泥土濕㗎喇，唔使澆。`};t.care.water+=1,t.moisture=P(t.moisture+p.water.amount),a=t.moisture>e[1]?`澆得有啲多，水分 ${Math.round(t.moisture)}，太濕會爛根，可以疏水。`:`水滲入泥度，水分 ${Math.round(t.moisture)}。`,o={text:`+${p.water.amount} 水分`,tone:`blue`}}else n===`drain`?(t.care.drain+=1,t.moisture=P(t.moisture+p.drain.amount),a=t.moisture<e[0]?`疏走咗啲水，水分 ${Math.round(t.moisture)}，有啲乾喇。`:`開咗排水溝，泥土透返氣，水分 ${Math.round(t.moisture)}。`,o={text:`${p.drain.amount} 水分`,tone:`blue`}):n===`fertilize`?(t.care.fertilize+=1,t.nutrients=P(t.nutrients+p.fertilize.amount),a=`養分滲入泥度，養分 ${Math.round(t.nutrients)}。`,o={text:`+${p.fertilize.amount} 養分`,tone:`green`}):(t.care.dewormed=!0,t.pest.active?(t.pest={active:!1,lowNDays:0,wetDays:0,since:null},a=`用咗除蟲道具，蟲害清除咗。`,o={text:`清除蟲害`,tone:`green`}):(t.pest.lowNDays=0,t.pest.wetDays=0,a=`冇蟲，不過你預防咗一次，計數重新開始。`,o={text:`預防`,tone:`green`}));t.care.credited||(t.daysCared+=1,t.care.credited=!0),Ft(t,t.care.date,a,{kind:n,title:s,reward:o});let c=qt(t);c&&(a=`${a} ${c}`);let l=Qt(t,{date:t.care.date});return l.length&&(a=`${a} ${l.map(e=>ht.find(t=>t.id===e)?.name??e).join(`、`)}嚟咗。`),{ok:!0,message:a}}function qt(n){return!n.dying||n.over||!ue(n.moisture,e)||n.nutrients<t[0]?null:(n.dying=null,n.health=10,Ft(n,n.care.date,`水分同養分都返到最佳範圍，棵樹救返喇（健康度 10）。`,{kind:`grow`,title:`救返`,reward:{text:`健康 10`,tone:`green`}}),`棵樹救返喇！`)}function Jt(e,t){if(e.over)return{ok:!1,message:`呢局已經完結。`};if(e.care.preps[t])return{ok:!1,message:`今日${m[t].label}過喇。`};if(e.resist>=100)return{ok:!1,message:`抗風力已經滿咗。`};e.care.preps[t]=!0;let n=e.resist;e.resist=Math.min(100,e.resist+m[t].amount);let r=Math.round(e.resist-n);return e.care.credited||(e.daysCared+=1,e.care.credited=!0),Ft(e,e.care.date,`${m[t].label}，抗風力 ${Math.round(n)} → ${Math.round(e.resist)}。`,{kind:`reinforce`,title:`已加固`,reward:{text:`+${r} 抗風力`,tone:`orange`}}),{ok:!0,message:`${m[t].label}：抗風力 +${r}（而家 ${Math.round(e.resist)}）。`}}function Yt(e){return{stakes:e>=15,ropes:e>=35,prune:e>=60}}var Xt=[`drizzle`,`rainstorm`,`blackrain`,`thunder`,`typhoon1`,`typhoon8`],Zt={s3:1,s6:2,s12:3};function Qt(e,t){let n=[],r=e.heightCm/100,i=new Set([...t.events??[],...e.dayEvents[t.date]?.events??[]]);e.lastSettlement&&e.lastSettlement.date===_(t.date,-1)&&e.lastSettlement.events.forEach(e=>i.add(e));let a=i.has(`hot`),o=Xt.some(e=>i.has(e)),s=Number(t.date.slice(5,7));for(let i of ht)e.animals.includes(i.id)||r<i.minM||e.health<i.minHealth||i.needStorms&&e.stormSurvivals<i.needStorms||(i.weather!==`hot`||a)&&(i.weather!==`rain`||o)&&(i.weather===`storm`&&e.stormSurvivals<1||(!i.months||i.months.includes(s))&&(i.season&&Zt[e.season]<Zt[i.season]||(e.animals.push(i.id),n.push(i.id),Ft(e,t.date,`${i.name}嚟咗，${i.about}`,{kind:`animal`,title:`新朋友來訪`,reward:{text:`+1 圖鑑`,tone:`purple`}}))));return n}function $t(e,t){e.pest.active=!0,e.pest.since=t,Ft(e,t,`葉底生咗蟲。每晚會扣 15 健康度，要用除蟲處理。`,{kind:`pest`,title:`蟲害`,reward:{text:`-15/日`,tone:`red`}})}function en(e,t,n,r,i){let a=e.health,o=e.heightCm,s=[],c=[],l=v(e.lastSeenDate,t);if(l<0&&(e.lastSeenDate=t,e.care=Mt(t),l=0),l>0&&!e.over){for(let t=0;t<l;t++){let a=_(e.lastSeenDate,t),o=Ut(e,a,n(a),r,i);if(c.push(o.settlement),s.push(...o.messages),e.over)break}e.lastSeenDate=t,e.care=Mt(t)}let u=e.heightCm-o,d=null,f=[];return e.over||(d=zt(e,t),f=Qt(e,{date:t,events:[...c.at(-1)?.events??[],...n(t)]}),l===1?e.morningNote=tn(c[0]):l>1&&(e.morningNote=`你離開咗 ${l} 日。健康 ${Math.round(a)} → ${Math.round(e.health)}，高度 ${u>=0?`+`:``}${u.toFixed(1)} 厘米。`),s.length&&l>0&&(e.morningNote=`${e.morningNote??``} ${s.join(` `)}`.trim())),{daysPassed:Math.max(0,l),growthCm:u,healthBefore:a,healthAfter:e.health,messages:s,eventText:d,animals:f,settlements:c,over:!!e.over}}function tn(e){return e?`昨晚結算：${i[e.event].label}，健康 ${Math.round(e.hBefore)} → ${Math.round(e.hAfter)}，高度 ${e.deltaG>=0?`+`:``}${e.deltaG} 厘米。`:``}function nn(e,t,n,r,i){let a=e.health,o=e.heightCm,s=Ut(e,t,n,r,i),c=_(t,1);e.virtualToday=c,e.lastSeenDate=c,e.care=Mt(c);let l=null,u=[];return e.over||(l=zt(e,c),u=Qt(e,{date:c,events:s.settlement.events}),e.morningNote=`${tn(s.settlement)} ${s.messages.join(` `)}`.trim()),{daysPassed:1,growthCm:e.heightCm-o,healthBefore:a,healthAfter:e.health,messages:s.messages,eventText:l,animals:u,settlements:[s.settlement],over:!!e.over}}function rn(n,r,a){if(n.dying)return`瀕死！將水分調到 ${e[0]}–${e[1]}、養分 ${t[0]} 以上就即刻救得返。`;if(n.pest.active)return`生咗蟲，每晚扣 15 健康度，快啲除蟲。`;if(a&&i[a.event].dR<0&&n.resist<60)return`${i[a.event].label}就嚟，先加固推高抗風力（而家 ${Math.round(n.resist)}）。`;if(a&&(a.event===`rainstorm`||a.event===`blackrain`)&&n.moisture>30)return`${i[a.event].label}會令水分 +60，可以先疏水。`;if(r===`hot`&&n.moisture<90)return`酷熱：今晚水分會跌 40，可以澆多幾次。`;if(r===`drizzle`&&n.moisture>=40)return`今日落雨，水分會 +20，唔使澆。`;let o=n.moisture+i[r].dW;return o<e[0]?`今晚結算前水分會跌到約 ${Math.round(o)}，記得澆水。`:o>e[1]?`今晚水分會去到約 ${Math.round(o)}，太濕，可以疏水。`:n.nutrients-10<t[0]?`養分今晚會跌到 60 以下，可以施肥。`:n.resist<30?`有空可以加固，抗風力擋到惡劣天氣嘅傷害。`:`水分同養分都啱啱好，今晚會健康咁長高。`}function an(e,t){return Math.max(1,v(e.createdOn,t)+1)}function on(e){let t=jt(e.dailyEventId);return{title:t.title,text:t.text}}var sn=`sekai-tree-meta-v1`;function cn(){return{version:1,badges:{1:0,2:0,3:0},reviveTokens:0,starry:!1,landmark:null,pendingLegacy:!1,history:[]}}function ln(){try{let e=localStorage.getItem(sn),t=e?JSON.parse(e):null;if(t&&t.version===1&&t.badges)return{...cn(),...t}}catch{}return cn()}function un(e){try{localStorage.setItem(sn,JSON.stringify(e))}catch{}}function dn(e,t){let n=t.over;if(!n||n.booked)return[];n.booked=!0;let r=[];for(let t of n.tiers)e.badges[String(t)]+=1,r.push(`${d[t].name}：${d[t].perk}`),t===3&&(e.reviveTokens+=1,e.starry=!0);return n.kind===`dead`&&(e.landmark={name:t.treeName,heightCm:t.heightCm,date:n.date},e.pendingLegacy=!0,r.push(`${t.treeName}化作養分地標：下一棵樹開局養分 +40。`)),e.history.unshift({name:t.treeName,season:t.season,days:n.days,heightCm:t.heightCm,result:n.kind,date:n.date}),e.history.length=Math.min(e.history.length,20),r}function fn(e,t){let n=t.completed;if(!n||n.booked)return[];n.booked=!0;let r=[];for(let t of n.tiers)e.badges[String(t)]+=1,r.push(`${d[t].name}：${d[t].perk}`),t===3&&(e.reviveTokens+=1,e.starry=!0);return e.history.unshift({name:t.treeName,season:t.season,days:n.days,heightCm:n.heightCm,result:`complete`,date:n.date}),e.history.length=Math.min(e.history.length,20),r}function pn(e,t,n,r,i){let a=e.pendingLegacy?40:0;e.pendingLegacy=!1;let o=Rt(t,{season:n,name:r,legacyBonus:a,species:i});return o.started=!0,o}function mn(e,t,n,r,i,a={}){let o=a.scale??1,s=a.silhouette??!1;e.save(),e.translate(n,r),e.scale((a.flip?-1:1)*o,o);let c=a.night&&t===`firefly`?0:Math.sin(i*.004+n)*1.2;e.translate(0,c);let l=t=>{e.fillStyle=s?`#c2b6a3`:t},u=t=>{e.strokeStyle=s?`#b3a894`:t};switch(t){case`butterfly`:hn(e,i,l);break;case`ladybug`:gn(e,l);break;case`sparrow`:_n(e,l,u,`#8a623c`,`#c4956a`,`#5c3b28`,1);break;case`squirrel`:vn(e,i,l);break;case`bulbul`:yn(e,l,u,!1);break;case`redbulbul`:yn(e,l,u,!0);break;case`cicada`:bn(e,l,u,s);break;case`kingfisher`:xn(e,l,u);break;case`woodpecker`:Sn(e,l,u);break;case`dove`:_n(e,l,u,`#8d8a86`,`#d9d3cc`,`#6d5a62`,1.15);break;case`owl`:Cn(e,l,!!a.night,s);break;case`firefly`:wn(e,i,s);break;default:{let n=gt(t),r=n?.look.c??[`#8a623c`,`#c4956a`,`#5c3b28`];!n||n.category===`bird`?_n(e,l,u,r[0]??`#8a623c`,r[1]??`#c4956a`,r[2]??`#5c3b28`,1):n.category===`butterfly`?hn(e,i,l):n.category===`mammal`?vn(e,i,l):n.category===`insect`?gn(e,l):(l(r[0]??`#5f8a3a`),e.beginPath(),e.ellipse(0,0,11,4.5,0,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(11,-1,3.5,0,Math.PI*2),e.fill());break}}e.restore()}function hn(e,t,n){let r=.35+Math.abs(Math.sin(t*.01))*.75;n(`#f4f1e4`),e.beginPath(),e.ellipse(-7,-1,8,6*r,-.4,0,Math.PI*2),e.ellipse(-6,4,6,4.5*r,.5,0,Math.PI*2),e.fill(),n(`#f7f4ea`),e.beginPath(),e.ellipse(7,-1,8,6*r,.4,0,Math.PI*2),e.ellipse(6,4,6,4.5*r,-.5,0,Math.PI*2),e.fill(),n(`#6d8a48`),e.fillRect(-.8,-6,1.6,12),n(`#2c3330`),e.beginPath(),e.arc(0,-6,1.3,0,Math.PI*2),e.fill()}function gn(e,t){t(`#b4332c`),e.beginPath(),e.ellipse(0,1,7,5.5,0,0,Math.PI*2),e.fill(),t(`#2a2422`),e.fillRect(-.7,-3,1.4,9),e.beginPath(),e.arc(0,-4,3.1,0,Math.PI*2),e.fill(),t(`#f4efe6`);for(let[t,n]of[[-3,0],[3,1],[-2,3],[2.5,3.4]])e.beginPath(),e.arc(t,n,1.1,0,Math.PI*2),e.fill()}function _n(e,t,n,r,i,a,o){e.scale(o,o),t(r),e.beginPath(),e.ellipse(0,0,9,6,-.2,0,Math.PI*2),e.fill(),t(i),e.beginPath(),e.ellipse(2,1.5,5,3.4,0,0,Math.PI*2),e.fill(),t(r),e.beginPath(),e.arc(7,-2,4.2,0,Math.PI*2),e.fill(),t(a),e.beginPath(),e.moveTo(10,-2),e.lineTo(15,-1),e.lineTo(10,.5),e.fill(),t(`#2c241c`),e.beginPath(),e.arc(8.3,-3,.8,0,Math.PI*2),e.fill(),n(r),e.lineWidth=1.4,e.beginPath(),e.moveTo(-7,-1),e.quadraticCurveTo(-12,-6,-8,-7),e.stroke(),t(`#5c4636`),e.fillRect(2,5,1.2,4),e.fillRect(5,5,1.2,4)}function vn(e,t,n){let r=Math.sin(t*.003)*.4;n(`#c46a32`),e.beginPath(),e.ellipse(0,2,8,5,0,0,Math.PI*2),e.fill(),n(`#a8512a`),e.save(),e.translate(-6,0),e.rotate(-.8+r),e.beginPath(),e.ellipse(0,-8,4.5,8,0,0,Math.PI*2),e.fill(),e.restore(),n(`#d4844a`),e.beginPath(),e.arc(6,-2,4.4,0,Math.PI*2),e.fill(),n(`#f2d2b0`),e.beginPath(),e.ellipse(7,0,2.4,1.8,0,0,Math.PI*2),e.fill(),n(`#2c241c`),e.beginPath(),e.arc(7.4,-3,.7,0,Math.PI*2),e.fill(),n(`#a8512a`),e.beginPath(),e.moveTo(4,-6),e.lineTo(5,-9),e.lineTo(7,-6),e.fill(),e.beginPath(),e.moveTo(8,-6),e.lineTo(10,-9),e.lineTo(11,-5.5),e.fill()}function yn(e,t,n,r){t(r?`#6d4a32`:`#6f7a45`),e.beginPath(),e.ellipse(0,1,9,5.5,-.15,0,Math.PI*2),e.fill(),t(r?`#2c241c`:`#f4f1ea`),e.beginPath(),e.arc(7,-2,4.3,0,Math.PI*2),e.fill(),r?(t(`#2c241c`),e.beginPath(),e.moveTo(5,-5),e.lineTo(7,-9),e.lineTo(9,-5),e.fill(),t(`#c4483a`),e.beginPath(),e.arc(8.6,-1,1.3,0,Math.PI*2),e.fill()):(t(`#f7f4ee`),e.beginPath(),e.ellipse(6.5,-5.2,2.4,1.6,0,0,Math.PI*2),e.fill()),t(`#f0a03a`),e.beginPath(),e.moveTo(10,-1.5),e.lineTo(14,-.6),e.lineTo(10,.6),e.fill(),t(`#241c16`),e.beginPath(),e.arc(8.2,-2.6,.7,0,Math.PI*2),e.fill(),n(`#5c6840`),e.lineWidth=1.3,e.beginPath(),e.moveTo(-8,0),e.quadraticCurveTo(-13,-4,-9,-6),e.stroke()}function bn(e,t,n,r){t(`rgba(210, 224, 210, 0.85)`),r||(e.globalAlpha=.8),e.beginPath(),e.ellipse(-4,-2,5,8,-.4,0,Math.PI*2),e.ellipse(4,-2,5,8,.4,0,Math.PI*2),e.fill(),e.globalAlpha=1,t(`#6e7a48`),e.beginPath(),e.ellipse(0,2,3.2,6,0,0,Math.PI*2),e.fill(),t(`#3e4a2c`),e.beginPath(),e.arc(0,-5,2.4,0,Math.PI*2),e.fill(),n(`#3e4a2c`),e.lineWidth=.8,e.beginPath(),e.moveTo(-1,-6),e.lineTo(-4,-10),e.moveTo(1,-6),e.lineTo(4,-10),e.stroke()}function xn(e,t,n){t(`#1f7a8a`),e.beginPath(),e.ellipse(-1,1,8,5,-.2,0,Math.PI*2),e.fill(),t(`#e7a15a`),e.beginPath(),e.ellipse(2,2,4,2.6,0,0,Math.PI*2),e.fill(),t(`#1b6e86`),e.beginPath(),e.arc(6,-2,4,0,Math.PI*2),e.fill(),t(`#e7a15a`),e.beginPath(),e.moveTo(9,-1),e.lineTo(18,-.2),e.lineTo(9,1.2),e.fill(),t(`#f4f1ea`),e.beginPath(),e.arc(6.6,-3.2,1.5,0,Math.PI*2),e.fill(),t(`#241c16`),e.beginPath(),e.arc(7,-3.2,.6,0,Math.PI*2),e.fill(),n(`#176070`),e.lineWidth=1.2,e.beginPath(),e.moveTo(-7,-1),e.lineTo(-12,-5),e.stroke()}function Sn(e,t,n){e.rotate(.7),t(`#2c241c`),e.beginPath(),e.ellipse(0,0,5,9,0,0,Math.PI*2),e.fill(),t(`#f4f1ea`),e.fillRect(-2,-2,3,7),t(`#c4483a`),e.beginPath(),e.arc(0,-8,4,0,Math.PI*2),e.fill(),t(`#f2d2b0`),e.beginPath(),e.moveTo(3,-7),e.lineTo(10,-6),e.lineTo(3,-4.5),e.fill(),t(`#241c16`),e.beginPath(),e.arc(1,-8.5,.7,0,Math.PI*2),e.fill(),n(`#2c241c`),e.lineWidth=1.4,e.beginPath(),e.moveTo(-2,6),e.lineTo(-6,8),e.moveTo(1,7),e.lineTo(4,11),e.stroke()}function Cn(e,t,n,r){t(`#8a6a42`),e.beginPath(),e.ellipse(0,2,9,10,0,0,Math.PI*2),e.fill(),t(`#6d5234`),e.beginPath(),e.moveTo(-6,-6),e.lineTo(-3,-14),e.lineTo(0,-6),e.fill(),e.beginPath(),e.moveTo(6,-6),e.lineTo(3,-14),e.lineTo(0,-6),e.fill(),t(n&&!r?`#f3e7b0`:`#f4efe4`),e.beginPath(),e.arc(-3.2,-1,3.1,0,Math.PI*2),e.arc(3.2,-1,3.1,0,Math.PI*2),e.fill(),t(`#2a241c`),e.beginPath(),e.arc(-3.2,-1,n?1.5:1.1,0,Math.PI*2),e.arc(3.2,-1,n?1.5:1.1,0,Math.PI*2),e.fill(),t(`#e0a050`),e.beginPath(),e.moveTo(-1.2,2),e.lineTo(0,4),e.lineTo(1.2,2),e.fill()}function wn(e,t,n){let r=.45+Math.sin(t*.008)*.35;if(!n){let t=e.createRadialGradient(0,0,1,0,0,10);t.addColorStop(0,`rgba(230, 240, 140, ${.35+r*.4})`),t.addColorStop(1,`rgba(230, 240, 140, 0)`),e.fillStyle=t,e.beginPath(),e.arc(0,0,10,0,Math.PI*2),e.fill()}e.fillStyle=n?`#c2b6a3`:`rgba(236, 244, 160, ${.75+r*.25})`,e.beginPath(),e.arc(0,0,2.2,0,Math.PI*2),e.fill()}function Tn(e,t,n,r){return r===`day`?1:r===`night`||e<t-45||e>n+45?0:e<t?R((e-(t-45))/45,0,1):e>n?R(1-(e-n)/45,0,1):1}function En(e,t=1){let n=`${e[0]|0}, ${e[1]|0}, ${e[2]|0}`;return t>=1?`rgb(${n})`:`rgba(${n}, ${t})`}function Dn(e,t,n){let r=R(n,0,1);return[e[0]+(t[0]-e[0])*r,e[1]+(t[1]-e[1])*r,e[2]+(t[2]-e[2])*r]}function On(e,t,n){let r=[[128,104,64],[154,124,78],[104,86,52]],i=[[132,132,70],[158,150,78],[108,116,62]],a=[[86,128,62],[118,150,70],[70,110,50]],o=[[52,114,58],[86,146,68],[40,92,48],[136,176,82]],s=e<30?r:e<50?i:e<75?a:o;return En(Dn(s[Math.floor(t*s.length)%s.length]??o[0],[28,48,32],n<.45?.25:0))}var kn=class{canvas;dpr=1;w=320;h=480;model=null;drops=[];flakes=[];motes=[];constructor(e){this.canvas=e}resize(){let e=this.canvas.getBoundingClientRect();this.dpr=Math.min(window.devicePixelRatio||1,2),this.w=Math.max(2,e.width),this.h=Math.max(2,e.height),this.canvas.width=Math.round(this.w*this.dpr),this.canvas.height=Math.round(this.h*this.dpr),this.model=null}draw(e,t){let n=this.canvas.getContext(`2d`);if(!n)return;n.setTransform(this.dpr,0,0,this.dpr,0,0);let r=this.ensureModel(e),i=e.cond.stormKind===`typhoon`||e.cond.code>=95,a=i||e.cond.stormKind===`heavy-rain`||e.cond.precipMm>=25||e.cond.code===65||e.cond.code===82,o=(e.reducedMotion?.2:1)*(2.2+e.cond.windKmh*.16+(i?14:0)+(e.cond.gustKmh>70?6:0)),s=e=>{let n=R((r.groundY-e)/r.groundY,0,1);return Math.sin(t*.00135+e*.02)*Math.min(o,42)*(.12+n)};this.sky(n,e,t,a,i),this.hills(n,e,t),this.ground(n,r,e),this.tree(n,r,e,s),this.animals(n,r,e,t,s),this.weatherFx(n,e,t,a,i),this.vignette(n,e.daylight)}ensureModel(e){let t=wt(e.heightCm,e.targetCm),n=`${this.w}x${this.h}|${e.treeName}|${t.id}|${Math.round(e.heightCm)}|${+(e.health>55)}|${e.scars}|${+(e.pests>35)}`;return this.model?.key===n||(this.model=Pn(this.w,this.h,e,n)),this.model}sky(e,t,n,r,i){let a=t.daylight,o=[110,184,222],s=[166,212,232],c=[246,226,196];t.cond.hot&&!r?(o=[232,150,96],s=[244,196,140],c=[255,228,190]):i?(o=[42,54,70],s=[70,82,96],c=[96,102,108]):r||t.cond.raining?(o=[104,128,144],s=[150,166,170],c=[198,204,196]):t.cond.code>=3&&(o=[126,156,176],s=[176,196,206],c=[230,224,210]);let l=[12,20,46];o=Dn(l,o,a),s=Dn([28,44,78],s,a),c=Dn([96,78,84],c,a);let u=e.createLinearGradient(0,0,0,this.h);if(u.addColorStop(0,En(o)),u.addColorStop(.55,En(s)),u.addColorStop(1,En(c)),e.fillStyle=u,e.fillRect(0,0,this.w,this.h),a<.85){let t=rt(42);for(let n=0;n<40;n++)e.fillStyle=`rgba(244, 240, 220, ${(1-a)*(.35+t()*.65)})`,e.beginPath(),e.arc(t()*this.w,t()*this.h*.55,t()*1.3+.3,0,Math.PI*2),e.fill()}let d=Math.max(1,t.sunsetMin-t.sunriseMin),f=R((t.minute-t.sunriseMin)/d,0,1);if(a>.15&&!i&&!r){let n=this.w*(.14+.72*f),r=this.h*(.58-Math.sin(Math.PI*f)*.46),i=e.createRadialGradient(n,r,8,n,r,70);i.addColorStop(0,`rgba(255, 236, 186, ${.55*a})`),i.addColorStop(1,`rgba(255, 236, 186, 0)`),e.fillStyle=i,e.beginPath(),e.arc(n,r,70,0,Math.PI*2),e.fill(),e.fillStyle=`rgba(255, 246, 220, ${.95*a})`,e.beginPath(),e.arc(n,r,t.cond.hot?22:16,0,Math.PI*2),e.fill()}if(a<.6){let t=this.w*.78,n=this.h*.18;e.fillStyle=`rgba(244, 236, 214, ${1-a})`,e.beginPath(),e.arc(t,n,16,0,Math.PI*2),e.fill(),e.fillStyle=En(Dn(l,o,.2),1-a*.3),e.beginPath(),e.arc(t+7,n-3,13,0,Math.PI*2),e.fill()}let p=i?7:t.cond.code>=2||t.cond.raining?5:3,m=t.reducedMotion?0:n*(.006+t.cond.windKmh*4e-4);for(let n=0;n<p;n++){let r=((n*.19+.05)*this.w+m)%(this.w+180)-90,o=this.h*(.12+n%3*.07),s=i?.55:t.cond.raining?.4:.28*(.4+a);e.fillStyle=i?`rgba(46, 56, 68, ${s})`:`rgba(255, 255, 255, ${s})`,An(e,r,o,46+n%3*12,16+n%2*4)}t.eventId===`mist`&&(e.fillStyle=`rgba(255,255,255,${.18+a*.12})`,e.beginPath(),e.ellipse(this.w*.5,this.h*.72,this.w*.55,36,0,0,Math.PI*2),e.fill())}hills(e,t,n){let r=t.daylight,i=Dn([46,68,84],[120,156,168],r),a=Dn([36,58,62],[92,132,112],r),o=t.reducedMotion?0:Math.sin(n*2e-4)*6;e.fillStyle=En(i),jn(e,this.w,this.h*.78,.22,o),e.fillStyle=En(a),jn(e,this.w,this.h*.84,.16,-o)}ground(e,t,n){let r=n.moisture>65||n.cond.raining,i=n.moisture<28&&!n.cond.raining,a=i?[150,132,78]:r?[62,110,68]:[96,140,78],o=r?[74,58,42]:i?[138,112,74]:[104,74,48];e.fillStyle=En(a),e.beginPath(),e.ellipse(this.w*.5,t.groundY+18,this.w*.72,this.h*.16,0,0,Math.PI*2),e.fill();for(let n of t.grass)e.strokeStyle=En(Dn(a,[40,80,44],n.h/40)),e.lineWidth=1.3,e.beginPath(),e.moveTo(n.x,n.y),e.quadraticCurveTo(n.x+n.lean,n.y-n.h*.6,n.x+n.lean*1.4,n.y-n.h),e.stroke();e.fillStyle=En(o),e.beginPath(),e.ellipse(this.w*.5,t.groundY+6,54+wt(n.heightCm,n.targetCm).trunk,14,0,0,Math.PI*2),e.fill(),r&&(e.fillStyle=`rgba(180, 200, 190, 0.35)`,e.beginPath(),e.ellipse(this.w*.38,t.groundY+16,22,5,0,0,Math.PI*2),e.ellipse(this.w*.66,t.groundY+20,16,4,0,0,Math.PI*2),e.fill());for(let n of t.flowers)e.fillStyle=n.color,e.beginPath(),e.arc(n.x,n.y,2.4,0,Math.PI*2),e.fill()}tree(e,t,n,r){t.crown&&wt(n.heightCm,n.targetCm).depth>=3&&(e.fillStyle=On(n.health,.2,0),e.beginPath(),e.ellipse(t.crown.x+r(t.crown.y),t.crown.y,t.crown.rx,t.crown.ry,0,0,Math.PI*2),e.fill(),e.fillStyle=On(n.health,.7,.8),e.beginPath(),e.ellipse(t.crown.x+r(t.crown.y)*1.1-t.crown.rx*.15,t.crown.y-t.crown.ry*.1,t.crown.rx*.72,t.crown.ry*.7,0,0,Math.PI*2),e.fill());for(let n of t.roots)Nn(e,n,r,!0);Mn(e,t.trunk,r);for(let n of t.limbs)Nn(e,n,r,!1);let i=[...t.leaves].sort((e,t)=>e.z-t.z);for(let t of i){let i=t.x+r(t.y)*1.12;e.fillStyle=On(n.health,t.tint,t.z),e.beginPath(),e.ellipse(i,t.y,t.rx,t.ry,t.rot,0,Math.PI*2),e.fill()}for(let n of t.pests)e.fillStyle=`#3a3228`,e.beginPath(),e.arc(n.x+r(n.y),n.y,1.5,0,Math.PI*2),e.fill()}animals(e,t,n,r,i){if(n.health<22)return;let a=R(this.w/640,.72,1.2),o=t.perches.filter(e=>e.kind===`leaf`),s=t.perches.find(e=>e.kind===`trunk`)??{x:this.w/2,y:t.groundY-40,kind:`trunk`},c=0,l=n.daylight<.45;for(let t of n.animals){if(t===`firefly`)continue;let n=o[c%Math.max(1,o.length)]??s,u=c%2==0;(t===`woodpecker`||t===`cicada`)&&(n=s),t===`owl`&&(n=o[Math.floor(o.length/2)]??n),t===`ladybug`&&(n=o[0]??n),t!==`woodpecker`&&t!==`cicada`&&t!==`ladybug`&&(c+=1);let d=n.x+i(n.y),f=n.y;t===`butterfly`&&(d+=Math.sin(r*.0016)*16,f+=Math.cos(r*.0018)*8-12),t===`woodpecker`&&(d+=10),mn(e,t,d,f,r,{scale:a,night:l,flip:u})}if(n.animals.includes(`firefly`)){let t=l?7:3;for(let n=0;n<t;n++){let t=o[n*2%Math.max(1,o.length)]??s;mn(e,`firefly`,t.x+i(t.y)+Math.sin(r*.001+n)*(l?18:4),t.y+Math.cos(r*.0013+n*2)*(l?14:3),r+n*200,{scale:a,night:l,silhouette:!l})}}}weatherFx(e,t,n,r,i){let a=L(t.cond.code);if((t.cond.raining||r)&&!a){let n=r?120:70;if(this.drops.length!==n){let e=rt(7);this.drops=Array.from({length:n},()=>({x:e()*this.w,y:e()*this.h,v:9+e()*8,len:r?14+e()*10:8+e()*8,drift:t.cond.windKmh*.03}))}e.strokeStyle=i?`rgba(210, 220, 230, 0.45)`:`rgba(200, 214, 224, 0.55)`,e.lineWidth=r?1.4:1;let a=+!t.reducedMotion;for(let n of this.drops)a&&(n.y+=n.v,n.x+=n.drift+t.cond.windKmh*.02,n.y>this.h&&(n.y=-10,n.x=Math.random()*this.w)),e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(n.x+t.cond.windKmh*.08,n.y+n.len),e.stroke()}else this.drops=[];if(a){if(this.flakes.length<40){let e=rt(9);this.flakes=Array.from({length:50},()=>({x:e()*this.w,y:e()*this.h,v:.6+e(),r:1+e()*1.6}))}e.fillStyle=`rgba(255,255,255,0.85)`;for(let r of this.flakes)t.reducedMotion||(r.y+=r.v,r.x+=Math.sin(n*.001+r.y)*.4,r.y>this.h&&(r.y=-4)),e.beginPath(),e.arc(r.x,r.y,r.r,0,Math.PI*2),e.fill()}if(t.cond.gustKmh>45||i){if(this.motes.length<8){let e=rt(11);this.motes=Array.from({length:10},()=>({x:e()*this.w,y:this.h*(.4+e()*.3),v:1.5+e()*2,r:2+e()*2,phase:e()*6}))}e.fillStyle=`rgba(120, 90, 50, 0.35)`;for(let r of this.motes)t.reducedMotion||(r.x+=r.v+t.cond.windKmh*.02,r.y+=Math.sin(n*.002+r.phase)*.4,r.x>this.w+10&&(r.x=-10)),e.beginPath(),e.ellipse(r.x,r.y,r.r*1.6,r.r*.6,.4,0,Math.PI*2),e.fill()}if(i&&!t.reducedMotion){let t=n/1e3%8;t<.12&&(e.fillStyle=`rgba(255,255,255,${.28*(1-t/.12)})`,e.fillRect(0,0,this.w,this.h))}t.cond.hot&&t.daylight>.4&&(e.fillStyle=`rgba(255, 170, 80, 0.08)`,e.fillRect(0,0,this.w,this.h))}vignette(e,t){let n=e.createRadialGradient(this.w/2,this.h*.62,this.w*.2,this.w/2,this.h*.55,this.w*.75);n.addColorStop(0,`rgba(0,0,0,0)`),n.addColorStop(1,t>.5?`rgba(70, 50, 30, 0.13)`:`rgba(0, 0, 10, 0.28)`),e.fillStyle=n,e.fillRect(0,0,this.w,this.h)}};function An(e,t,n,r,i){e.beginPath(),e.ellipse(t,n,r,i,0,0,Math.PI*2),e.ellipse(t-r*.45,n+4,r*.55,i*.8,0,0,Math.PI*2),e.ellipse(t+r*.42,n+3,r*.5,i*.75,0,0,Math.PI*2),e.fill()}function jn(e,t,n,r,i){e.beginPath(),e.moveTo(0,n),e.quadraticCurveTo(t*.25+i,n-t*r,t*.5,n-t*r*.3),e.quadraticCurveTo(t*.75-i,n-t*r*.7,t,n-10),e.lineTo(t,n+80),e.lineTo(0,n+80),e.fill()}function Mn(e,t,n){if(t.length<2)return;e.beginPath();let r=t[0];e.moveTo(r.x+n(r.y)-r.r,r.y);for(let r of t)e.lineTo(r.x+n(r.y)-r.r*.92,r.y);for(let r=t.length-1;r>=0;r--){let i=t[r];e.lineTo(i.x+n(i.y)+i.r,i.y)}e.closePath();let i=t[t.length-1],a=e.createLinearGradient(r.x-r.r,0,r.x+r.r,0);a.addColorStop(0,`#4a3024`),a.addColorStop(.45,`#8d5c3e`),a.addColorStop(1,`#5c3b2a`),e.fillStyle=a,e.fill(),e.strokeStyle=`rgba(255, 220, 180, 0.18)`,e.lineWidth=Math.max(1,i.r*.25),e.beginPath(),e.moveTo(r.x+n(r.y)-r.r*.2,r.y-4),e.lineTo(i.x+n(i.y)-i.r*.1,i.y),e.stroke()}function Nn(e,t,n,r){let i=t.x1+n(t.y1)*(r?.3:1),a=t.x2+n(t.y2)*(r?.2:1.08);e.lineCap=`round`,e.strokeStyle=r?`#6a4a34`:`#4e3426`,e.lineWidth=t.w,e.beginPath(),e.moveTo(i,t.y1),e.quadraticCurveTo((i+a)/2+t.w*.25,(t.y1+t.y2)/2,a,t.y2),e.stroke(),r||(e.strokeStyle=`#916348`,e.lineWidth=Math.max(.7,t.w*.4),e.stroke()),t.snap&&(e.strokeStyle=`#e6d3b4`,e.lineWidth=1.3,e.beginPath(),e.moveTo(a-5,t.y2+2),e.lineTo(a+4,t.y2-3),e.stroke())}function Pn(e,t,n,r){let i=wt(n.heightCm,n.targetCm),a=rt(nt(`${n.treeName||`tree`}|${i.id}`)),o=Tt(n.heightCm,n.targetCm),s=t*.8,c=s-(i.reach0+(i.reach1-i.reach0)*o)*t*.92,l=e*.52+(a()-.5)*12,u={key:r,groundY:s,trunk:[],limbs:[],leaves:[],roots:[],perches:[],pests:[],flowers:[],grass:[],crown:null};for(let t=0;t<36;t++)u.grass.push({x:e*.08+a()*e*.84,y:s+8+a()*18,h:8+a()*16,lean:(a()-.4)*10});if(n.health>55){let e=[`#e7b3b0`,`#f0d58a`,`#f4f1ea`,`#d98b86`];for(let t=0;t<7;t++)u.flowers.push({x:l+(a()-.5)*160,y:s+4+a()*10,color:e[t%e.length]??`#f0d58a`})}if(i.depth===0){let e=s-c,t=(a()-.5)*16;u.trunk=[{x:l,y:s,r:3.2},{x:l+t*.3,y:s-e*.45,r:2.4},{x:l+t,y:s-e,r:1.6}];let n=u.trunk[2];return u.leaves.push({x:n.x-12,y:n.y+6,rx:16+o*8,ry:8,rot:-.9,tint:.2,z:.8},{x:n.x+14,y:n.y+4,rx:18+o*8,ry:9,rot:.8,tint:.6,z:.9},{x:n.x+1,y:n.y-8,rx:8,ry:12,rot:.1,tint:.9,z:1}),u.perches.push({x:n.x,y:n.y-6,kind:`leaf`}),u.perches.push({x:l,y:s-e*.45,kind:`trunk`}),u}let d=(s-c)*.46,f=s-d,p=i.trunk*(e/520)*(.82+o*.35);for(let e=0;e<=6;e++){let t=e/6,n=Math.sin(t*3+a()*2)*(8+t*6);u.trunk.push({x:l+n*(a()>.5?1:.6),y:s-d*t,r:p*(1-t*.72)})}let m=u.trunk[u.trunk.length-1];u.perches.push({x:l+p*.2,y:s-d*.55,kind:`trunk`}),u.crown={x:m.x,y:c+(f-c)*.55,rx:Math.min(e*.42,(18+i.depth*22)*(e/480)),ry:(s-c)*.26};let h=n.scars,g=(e,t,n,r,o,s)=>{let c=e+Math.cos(n)*r,l=t+Math.sin(n)*r,d=!1;if(h>0&&s===i.depth-1&&a()>.4&&(c=e+Math.cos(n)*r*.45,l=t+Math.sin(n)*r*.45,d=!0,--h),u.limbs.push({x1:e,y1:t,x2:c,y2:l,w:o,snap:d}),d||s<=0||o<1.3){let e=4+Math.floor(a()*3);for(let t=0;t<e;t++){let e=a()*Math.PI*2,t=a()*(12+i.depth*3);u.leaves.push({x:c+Math.cos(e)*t,y:l+Math.sin(e)*t*.62,rx:7+a()*(6+i.depth),ry:4+a()*4,rot:e,tint:a(),z:a()})}u.perches.push({x:c,y:l,kind:`leaf`});return}let f=s>=3&&a()>.62?3:2;for(let e=0;e<f;e++){let t=(e/(f-1)-.5)*(.95+a()*.45);g(c,l,n+t+(a()-.5)*.15,r*(.64+a()*.08),o*.64,s-1)}},_=i.depth>=5?4:3;for(let e=0;e<_;e++){let t=e/(_-1),n=-Math.PI/2+(t-.5)*1.5,r=u.trunk[Math.max(0,u.trunk.length-2)];g(r.x,r.y,n,(s-c)*(.22+o*.06),p*.55,i.depth-1)}if(i.roots){let e=4+Math.min(4,i.depth);for(let t=0;t<e;t++){let e=u.limbs[Math.floor(a()*u.limbs.length)];if(!e)continue;let t=(e.x1+e.x2)/2,n=(e.y1+e.y2)/2;n>s-30||u.roots.push({x1:t,y1:n,x2:t+(a()-.5)*16,y2:s-2,w:1.4+a()*1.6})}}if(n.pests>35)for(let e=0;e<8;e++){let e=u.leaves[Math.floor(a()*u.leaves.length)];e&&u.pests.push({x:e.x,y:e.y})}return u}var Fn=1e3,In=1001,Ln=1002,Rn=1003,zn=1004,Bn=1005,Vn=1006,Hn=1007,Un=1008,Wn=1009,Gn=1010,Kn=1011,qn=1012,Jn=1013,Yn=1014,Xn=1015,Zn=1016,Qn=1017,$n=1018,er=1020,tr=35902,nr=35899,rr=1021,ir=1022,ar=1023,or=1026,sr=1027,cr=1028,lr=1029,ur=1030,dr=1031,fr=1033,pr=33776,mr=33777,hr=33778,gr=33779,_r=35840,vr=35841,yr=35842,br=35843,xr=36196,Sr=37492,Cr=37496,wr=37488,Tr=37489,Er=37490,Dr=37491,Or=37808,kr=37809,Ar=37810,jr=37811,Mr=37812,Nr=37813,Pr=37814,Fr=37815,Ir=37816,Lr=37817,Rr=37818,zr=37819,Br=37820,Vr=37821,Hr=36492,Ur=36494,Wr=36495,Gr=36283,Kr=36284,qr=36285,Jr=36286,Yr=2300,Xr=2301,Zr=2302,Qr=2303,$r=2400,ei=2401,ti=2402,ni=3200,ri=`srgb`,ii=`srgb-linear`,ai=`linear`,oi=`srgb`,si=7680,ci=35044,li=2e3;function ui(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function di(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function fi(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function pi(){let e=fi(`canvas`);return e.style.display=`block`,e}var mi={};function hi(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function gi(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function B(...e){e=gi(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function V(...e){e=gi(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function _i(...e){let t=e.join(` `);t in mi||(mi[t]=!0,B(...e))}function vi(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var yi={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},bi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},xi=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Si=1234567,Ci=Math.PI/180,wi=180/Math.PI;function Ti(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(xi[e&255]+xi[e>>8&255]+xi[e>>16&255]+xi[e>>24&255]+`-`+xi[t&255]+xi[t>>8&255]+`-`+xi[t>>16&15|64]+xi[t>>24&255]+`-`+xi[n&63|128]+xi[n>>8&255]+`-`+xi[n>>16&255]+xi[n>>24&255]+xi[r&255]+xi[r>>8&255]+xi[r>>16&255]+xi[r>>24&255]).toLowerCase()}function Ei(e,t,n){return Math.max(t,Math.min(n,e))}function Di(e,t){return(e%t+t)%t}function Oi(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function ki(e,t,n){return e===t?0:(n-e)/(t-e)}function Ai(e,t,n){return(1-n)*e+n*t}function ji(e,t,n,r){return Ai(e,t,1-Math.exp(-n*r))}function Mi(e,t=1){return t-Math.abs(Di(e,t*2)-t)}function Ni(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Pi(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function Fi(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Ii(e,t){return e+Math.random()*(t-e)}function Li(e){return e*(.5-Math.random())}function Ri(e){e!==void 0&&(Si=e);let t=Si+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function zi(e){return e*Ci}function Bi(e){return e*wi}function Vi(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Hi(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Ui(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Wi(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:B(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Gi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function Ki(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var qi={DEG2RAD:Ci,RAD2DEG:wi,generateUUID:Ti,clamp:Ei,euclideanModulo:Di,mapLinear:Oi,inverseLerp:ki,lerp:Ai,damp:ji,pingpong:Mi,smoothstep:Ni,smootherstep:Pi,randInt:Fi,randFloat:Ii,randFloatSpread:Li,seededRandom:Ri,degToRad:zi,radToDeg:Bi,isPowerOfTwo:Vi,ceilPowerOfTwo:Hi,floorPowerOfTwo:Ui,setQuaternionFromProperEuler:Wi,normalize:Ki,denormalize:Gi},H=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ei(this.x,e.x,t.x),this.y=Ei(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ei(this.x,e,t),this.y=Ei(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ei(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ei(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ji=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:B(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ei(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xi.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xi.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ei(this.x,e.x,t.x),this.y=Ei(this.y,e.y,t.y),this.z=Ei(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ei(this.x,e,t),this.y=Ei(this.y,e,t),this.z=Ei(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ei(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Yi.copy(this).projectOnVector(e),this.sub(Yi)}reflect(e){return this.sub(Yi.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ei(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Yi=new U,Xi=new Ji,W=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return _i(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Zi.makeScale(e,t)),this}rotate(e){return _i(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Zi.makeRotation(-e)),this}translate(e,t){return _i(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Zi.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Zi=new W,Qi=new W().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$i=new W().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ea(){let e={enabled:!0,workingColorSpace:ii,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=na(e.r),e.g=na(e.g),e.b=na(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=ra(e.r),e.g=ra(e.g),e.b=ra(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?ai:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return _i(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return _i(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[ii]:{primaries:t,whitePoint:r,transfer:ai,toXYZ:Qi,fromXYZ:$i,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ri},outputColorSpaceConfig:{drawingBufferColorSpace:ri}},[ri]:{primaries:t,whitePoint:r,transfer:oi,toXYZ:Qi,fromXYZ:$i,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ri}}}),e}var ta=ea();function na(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function ra(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var ia,aa=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ia===void 0&&(ia=fi(`canvas`)),ia.width=e.width,ia.height=e.height;let t=ia.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=ia}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=fi(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=na(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(na(t[e]/255)*255):t[e]=na(t[e]);return{data:t,width:e.width,height:e.height}}return B(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},oa=0,sa=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:oa++}),this.uuid=Ti(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(ca(r[t].image)):e.push(ca(r[t]))}else e=ca(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function ca(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?aa.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(B(`Texture: Unable to serialize Texture.`),{})}var la=0,ua=new U,da=class e extends bi{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=In,i=In,a=Vn,o=Un,s=ar,c=Wn,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:la++}),this.uuid=Ti(),this.name=``,this.source=new sa(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new H(0,0),this.repeat=new H(1,1),this.center=new H(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new W,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ua).x}get height(){return this.source.getSize(ua).y}get depth(){return this.source.getSize(ua).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){B(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fn:e.x-=Math.floor(e.x);break;case In:e.x=e.x<0?0:1;break;case Ln:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Fn:e.y-=Math.floor(e.y);break;case In:e.y=e.y<0?0:1;break;case Ln:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};da.DEFAULT_IMAGE=null,da.DEFAULT_MAPPING=300,da.DEFAULT_ANISOTROPY=1;var fa=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ei(this.x,e.x,t.x),this.y=Ei(this.y,e.y,t.y),this.z=Ei(this.z,e.z,t.z),this.w=Ei(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ei(this.x,e,t),this.y=Ei(this.y,e,t),this.z=Ei(this.z,e,t),this.w=Ei(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ei(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},pa=class extends bi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Vn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new fa(0,0,e,t),this.scissorTest=!1,this.viewport=new fa(0,0,e,t),this.textures=[];let r=new da({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Vn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new sa(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},ma=class extends pa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ha=class extends da{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Rn,this.minFilter=Rn,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},ga=class extends da{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Rn,this.minFilter=Rn,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},_a=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/va.setFromMatrixColumn(e,0).length(),i=1/va.setFromMatrixColumn(e,1).length(),a=1/va.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ba,e,xa)}lookAt(e,t,n){let r=this.elements;return wa.subVectors(e,t),wa.lengthSq()===0&&(wa.z=1),wa.normalize(),Sa.crossVectors(n,wa),Sa.lengthSq()===0&&(Math.abs(n.z)===1?wa.x+=1e-4:wa.z+=1e-4,wa.normalize(),Sa.crossVectors(n,wa)),Sa.normalize(),Ca.crossVectors(wa,Sa),r[0]=Sa.x,r[4]=Ca.x,r[8]=wa.x,r[1]=Sa.y,r[5]=Ca.y,r[9]=wa.y,r[2]=Sa.z,r[6]=Ca.z,r[10]=wa.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],N=r[11],ne=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*N,i[12]=a*w+o*O+s*ee+c*ne,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*N,i[13]=l*w+u*O+d*ee+f*ne,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*N,i[14]=p*w+m*O+h*ee+g*ne,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*N,i[15]=_*w+v*O+y*ee+b*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=va.set(r[0],r[1],r[2]).length(),o=va.set(r[4],r[5],r[6]).length(),s=va.set(r[8],r[9],r[10]).length();i<0&&(a=-a),ya.copy(this);let c=1/a,l=1/o,u=1/s;return ya.elements[0]*=c,ya.elements[1]*=c,ya.elements[2]*=c,ya.elements[4]*=l,ya.elements[5]*=l,ya.elements[6]*=l,ya.elements[8]*=u,ya.elements[9]*=u,ya.elements[10]*=u,t.setFromRotationMatrix(ya),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=li,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=li,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},va=new U,ya=new _a,ba=new U(0,0,0),xa=new U(1,1,1),Sa=new U,Ca=new U,wa=new U,Ta=new _a,Ea=new Ji,Da=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(Ei(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-Ei(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(Ei(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-Ei(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(Ei(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-Ei(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:B(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ta.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ta,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ea.setFromEuler(this),this.setFromQuaternion(Ea,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Da.DEFAULT_ORDER=`XYZ`;var Oa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},ka=0,Aa=new U,ja=new Ji,Ma=new _a,Na=new U,Pa=new U,Fa=new U,Ia=new Ji,La=new U(1,0,0),Ra=new U(0,1,0),za=new U(0,0,1),Ba={type:`added`},Va={type:`removed`},Ha={type:`childadded`,child:null},Ua={type:`childremoved`,child:null},Wa=class e extends bi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ka++}),this.uuid=Ti(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new U,n=new Da,r=new Ji,i=new U(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new _a},normalMatrix:{value:new W}}),this.matrix=new _a,this.matrixWorld=new _a,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Oa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ja.setFromAxisAngle(e,t),this.quaternion.multiply(ja),this}rotateOnWorldAxis(e,t){return ja.setFromAxisAngle(e,t),this.quaternion.premultiply(ja),this}rotateX(e){return this.rotateOnAxis(La,e)}rotateY(e){return this.rotateOnAxis(Ra,e)}rotateZ(e){return this.rotateOnAxis(za,e)}translateOnAxis(e,t){return Aa.copy(e).applyQuaternion(this.quaternion),this.position.add(Aa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(La,e)}translateY(e){return this.translateOnAxis(Ra,e)}translateZ(e){return this.translateOnAxis(za,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ma.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Na.copy(e):Na.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Pa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ma.lookAt(Pa,Na,this.up):Ma.lookAt(Na,Pa,this.up),this.quaternion.setFromRotationMatrix(Ma),r&&(Ma.extractRotation(r.matrixWorld),ja.setFromRotationMatrix(Ma),this.quaternion.premultiply(ja.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(V(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ba),Ha.child=e,this.dispatchEvent(Ha),Ha.child=null):V(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Va),Ua.child=e,this.dispatchEvent(Ua),Ua.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ma.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ma.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ma),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ba),Ha.child=e,this.dispatchEvent(Ha),Ha.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Pa,e,Fa),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Pa,Ia,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Wa.DEFAULT_UP=new U(0,1,0),Wa.DEFAULT_MATRIX_AUTO_UPDATE=!0,Wa.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ga=class extends Wa{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Ka={type:`move`},qa=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ga,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ga,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ga,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ka)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ga;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Ja={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ya={h:0,s:0,l:0},Xa={h:0,s:0,l:0};function Za(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var G=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ri){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ta.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=ta.workingColorSpace){return this.r=e,this.g=t,this.b=n,ta.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=ta.workingColorSpace){if(e=Di(e,1),t=Ei(t,0,1),n=Ei(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Za(i,r,e+1/3),this.g=Za(i,r,e),this.b=Za(i,r,e-1/3)}return ta.colorSpaceToWorking(this,r),this}setStyle(e,t=ri){function n(t){t!==void 0&&parseFloat(t)<1&&B(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:B(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);B(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ri){let n=Ja[e.toLowerCase()];return n===void 0?B(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=na(e.r),this.g=na(e.g),this.b=na(e.b),this}copyLinearToSRGB(e){return this.r=ra(e.r),this.g=ra(e.g),this.b=ra(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ri){return ta.workingToColorSpace(Qa.copy(this),e),Math.round(Ei(Qa.r*255,0,255))*65536+Math.round(Ei(Qa.g*255,0,255))*256+Math.round(Ei(Qa.b*255,0,255))}getHexString(e=ri){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ta.workingColorSpace){ta.workingToColorSpace(Qa.copy(this),t);let n=Qa.r,r=Qa.g,i=Qa.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=ta.workingColorSpace){return ta.workingToColorSpace(Qa.copy(this),t),e.r=Qa.r,e.g=Qa.g,e.b=Qa.b,e}getStyle(e=ri){ta.workingToColorSpace(Qa.copy(this),e);let t=Qa.r,n=Qa.g,r=Qa.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Ya),this.setHSL(Ya.h+e,Ya.s+t,Ya.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ya),e.getHSL(Xa);let n=Ai(Ya.h,Xa.h,t),r=Ai(Ya.s,Xa.s,t),i=Ai(Ya.l,Xa.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Qa=new G;G.NAMES=Ja;var $a=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new G(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},eo=class extends Wa{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Da,this.environmentIntensity=1,this.environmentRotation=new Da,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},to=new U,no=new U,ro=new U,io=new U,ao=new U,oo=new U,so=new U,co=new U,lo=new U,uo=new U,fo=new fa,po=new fa,mo=new fa,ho=class e{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),to.subVectors(e,t),r.cross(to);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){to.subVectors(r,t),no.subVectors(n,t),ro.subVectors(e,t);let a=to.dot(to),o=to.dot(no),s=to.dot(ro),c=no.dot(no),l=no.dot(ro),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,io)!==null&&io.x>=0&&io.y>=0&&io.x+io.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,io)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,io.x),s.addScaledVector(a,io.y),s.addScaledVector(o,io.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return fo.setScalar(0),po.setScalar(0),mo.setScalar(0),fo.fromBufferAttribute(e,t),po.fromBufferAttribute(e,n),mo.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(fo,i.x),a.addScaledVector(po,i.y),a.addScaledVector(mo,i.z),a}static isFrontFacing(e,t,n,r){return to.subVectors(n,t),no.subVectors(e,t),to.cross(no).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return to.subVectors(this.c,this.b),no.subVectors(this.a,this.b),to.cross(no).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;ao.subVectors(r,n),oo.subVectors(i,n),co.subVectors(e,n);let s=ao.dot(co),c=oo.dot(co);if(s<=0&&c<=0)return t.copy(n);lo.subVectors(e,r);let l=ao.dot(lo),u=oo.dot(lo);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(ao,a);uo.subVectors(e,i);let f=ao.dot(uo),p=oo.dot(uo);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(oo,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return so.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(so,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(ao,a).addScaledVector(oo,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},go=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(vo.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(vo.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=vo.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,vo):vo.fromBufferAttribute(r,t),vo.applyMatrix4(e.matrixWorld),this.expandByPoint(vo);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),yo.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),yo.copy(e.boundingBox)),yo.applyMatrix4(e.matrixWorld),this.union(yo)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,vo),vo.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Eo),Do.subVectors(this.max,Eo),bo.subVectors(e.a,Eo),xo.subVectors(e.b,Eo),So.subVectors(e.c,Eo),Co.subVectors(xo,bo),wo.subVectors(So,xo),To.subVectors(bo,So);let t=[0,-Co.z,Co.y,0,-wo.z,wo.y,0,-To.z,To.y,Co.z,0,-Co.x,wo.z,0,-wo.x,To.z,0,-To.x,-Co.y,Co.x,0,-wo.y,wo.x,0,-To.y,To.x,0];return!Ao(t,bo,xo,So,Do)||(t=[1,0,0,0,1,0,0,0,1],!Ao(t,bo,xo,So,Do))?!1:(Oo.crossVectors(Co,wo),t=[Oo.x,Oo.y,Oo.z],Ao(t,bo,xo,So,Do))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,vo).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(vo).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_o[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_o[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_o[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_o[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_o[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_o[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_o[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_o[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_o),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},_o=[new U,new U,new U,new U,new U,new U,new U,new U],vo=new U,yo=new go,bo=new U,xo=new U,So=new U,Co=new U,wo=new U,To=new U,Eo=new U,Do=new U,Oo=new U,ko=new U;function Ao(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){ko.fromArray(e,a);let o=i.x*Math.abs(ko.x)+i.y*Math.abs(ko.y)+i.z*Math.abs(ko.z),s=t.dot(ko),c=n.dot(ko),l=r.dot(ko);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var jo=new U,Mo=new H,No=0,Po=class extends bi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:No++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=ci,this.updateRanges=[],this.gpuType=Xn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Mo.fromBufferAttribute(this,t),Mo.applyMatrix3(e),this.setXY(t,Mo.x,Mo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)jo.fromBufferAttribute(this,t),jo.applyMatrix3(e),this.setXYZ(t,jo.x,jo.y,jo.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)jo.fromBufferAttribute(this,t),jo.applyMatrix4(e),this.setXYZ(t,jo.x,jo.y,jo.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)jo.fromBufferAttribute(this,t),jo.applyNormalMatrix(e),this.setXYZ(t,jo.x,jo.y,jo.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)jo.fromBufferAttribute(this,t),jo.transformDirection(e),this.setXYZ(t,jo.x,jo.y,jo.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Gi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ki(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Gi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ki(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Gi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ki(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Gi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ki(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Gi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ki(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array),r=Ki(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array),r=Ki(r,this.array),i=Ki(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},Fo=class extends Po{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Io=class extends Po{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Lo=class extends Po{constructor(e,t,n){super(new Float32Array(e),t,n)}},Ro=new go,zo=new U,Bo=new U,Vo=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Ro.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zo.subVectors(e,this.center);let t=zo.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(zo,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Bo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zo.copy(e.center).add(Bo)),this.expandByPoint(zo.copy(e.center).sub(Bo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ho=0,Uo=new _a,Wo=new Wa,Go=new U,Ko=new go,qo=new go,Jo=new U,Yo=class e extends bi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ho++}),this.uuid=Ti(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(ui(e)?Io:Fo)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new W().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Uo.makeRotationFromQuaternion(e),this.applyMatrix4(Uo),this}rotateX(e){return Uo.makeRotationX(e),this.applyMatrix4(Uo),this}rotateY(e){return Uo.makeRotationY(e),this.applyMatrix4(Uo),this}rotateZ(e){return Uo.makeRotationZ(e),this.applyMatrix4(Uo),this}translate(e,t,n){return Uo.makeTranslation(e,t,n),this.applyMatrix4(Uo),this}scale(e,t,n){return Uo.makeScale(e,t,n),this.applyMatrix4(Uo),this}lookAt(e){return Wo.lookAt(e),Wo.updateMatrix(),this.applyMatrix4(Wo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Go).negate(),this.translate(Go.x,Go.y,Go.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Lo(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&B(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new go);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ko.setFromBufferAttribute(n),this.morphTargetsRelative?(Jo.addVectors(this.boundingBox.min,Ko.min),this.boundingBox.expandByPoint(Jo),Jo.addVectors(this.boundingBox.max,Ko.max),this.boundingBox.expandByPoint(Jo)):(this.boundingBox.expandByPoint(Ko.min),this.boundingBox.expandByPoint(Ko.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&V(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vo);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Ko.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];qo.setFromBufferAttribute(n),this.morphTargetsRelative?(Jo.addVectors(Ko.min,qo.min),Ko.expandByPoint(Jo),Jo.addVectors(Ko.max,qo.max),Ko.expandByPoint(Jo)):(Ko.expandByPoint(qo.min),Ko.expandByPoint(qo.max))}Ko.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Jo.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Jo));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Jo.fromBufferAttribute(a,t),o&&(Go.fromBufferAttribute(e,t),Jo.add(Go)),r=Math.max(r,n.distanceToSquared(Jo))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&V(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){V(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Po(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new U,s[e]=new U;let c=new U,l=new U,u=new U,d=new H,f=new H,p=new H,m=new U,h=new U;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new U,y=new U,b=new U,x=new U;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Po(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new U,i=new U,a=new U,o=new U,s=new U,c=new U,l=new U,u=new U;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Jo.fromBufferAttribute(e,t),Jo.normalize(),e.setXYZ(t,Jo.x,Jo.y,Jo.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Po(a,r,i)}if(this.index===null)return B(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Xo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=ci,this.updateRanges=[],this.version=0,this.uuid=Ti()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Zo=new U,Qo=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Zo.fromBufferAttribute(this,t),Zo.applyMatrix4(e),this.setXYZ(t,Zo.x,Zo.y,Zo.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Zo.fromBufferAttribute(this,t),Zo.applyNormalMatrix(e),this.setXYZ(t,Zo.x,Zo.y,Zo.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Zo.fromBufferAttribute(this,t),Zo.transformDirection(e),this.setXYZ(t,Zo.x,Zo.y,Zo.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Gi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ki(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Ki(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ki(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ki(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ki(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Gi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Gi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Gi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Gi(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array),r=Ki(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ki(t,this.array),n=Ki(n,this.array),r=Ki(r,this.array),i=Ki(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){hi(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Po(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){hi(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},$o=new U,es=new U,ts=new W,ns=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=$o.subVectors(n,t).cross(es.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta($o),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ts.getNormalMatrix(e),r=this.coplanarPoint($o).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},rs=0,is=class extends bi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:rs++}),this.uuid=Ti(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new G(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=si,this.stencilZFail=si,this.stencilZPass=si,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){B(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new G().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new ns().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new H().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new H().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},as=class extends is{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new G(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},os,ss=new U,cs=new U,ls=new U,us=new H,ds=new H,fs=new _a,ps=new U,ms=new U,hs=new U,gs=new H,_s=new H,vs=new H,ys=class extends Wa{constructor(e=new as){if(super(),this.isSprite=!0,this.type=`Sprite`,os===void 0){os=new Yo;let e=new Xo(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);os.setIndex([0,1,2,0,2,3]),os.setAttribute(`position`,new Qo(e,3,0,!1)),os.setAttribute(`uv`,new Qo(e,2,3,!1))}this.geometry=os,this.material=e,this.center=new H(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&V(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),cs.setFromMatrixScale(this.matrixWorld),fs.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ls.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&cs.multiplyScalar(-ls.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;bs(ps.set(-.5,-.5,0),ls,a,cs,r,i),bs(ms.set(.5,-.5,0),ls,a,cs,r,i),bs(hs.set(.5,.5,0),ls,a,cs,r,i),gs.set(0,0),_s.set(1,0),vs.set(1,1);let o=e.ray.intersectTriangle(ps,ms,hs,!1,ss);if(o===null&&(bs(ms.set(-.5,.5,0),ls,a,cs,r,i),_s.set(0,1),o=e.ray.intersectTriangle(ps,hs,ms,!1,ss),o===null))return;let s=e.ray.origin.distanceTo(ss);s<e.near||s>e.far||t.push({distance:s,point:ss.clone(),uv:ho.getInterpolation(ss,ps,ms,hs,gs,_s,vs,new H),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function bs(e,t,n,r,i,a){us.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?ds.copy(us):(ds.x=a*us.x-i*us.y,ds.y=i*us.x+a*us.y),e.copy(t),e.x+=ds.x,e.y+=ds.y,e.applyMatrix4(fs)}var xs=new U,Ss=new U,Cs=new U,ws=new U,Ts=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xs)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=xs.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xs.copy(this.origin).addScaledVector(this.direction,t),xs.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ss.copy(e).add(t).multiplyScalar(.5),Cs.copy(t).sub(e).normalize(),ws.copy(this.origin).sub(Ss);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Cs),o=ws.dot(this.direction),s=-ws.dot(Cs),c=ws.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ss).addScaledVector(Cs,d),f}intersectSphere(e,t){if(e.radius<0)return null;xs.subVectors(e.center,this.origin);let n=xs.dot(this.direction),r=xs.dot(xs)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,xs)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,N=C/w,ne=1/w,re=T-te*D,ie=E-N*D,ae=O-te*A,oe=k-N*A,se=j-te*M,ce=ee-N*M,P=se*oe-ce*ae,le=re*ce-ie*se,ue=ae*ie-oe*re;if(r){if(P<0||le<0||ue<0)return null}else if((P<0||le<0||ue<0)&&(P>0||le>0||ue>0))return null;let de=P+le+ue;if(de===0)return null;let fe=ne*(P*D+le*A+ue*M);return(de>0?fe<0:fe>0)?null:this.at(fe/de,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Es=class extends is{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Da,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Ds=new _a,Os=new Ts,ks=new Vo,As=new U,js=new U,Ms=new U,Ns=new U,Ps=new U,Fs=new U,Is=new U,Ls=new U,K=class extends Wa{constructor(e=new Yo,t=new Es){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Fs.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Ps.fromBufferAttribute(s,e),a?Fs.addScaledVector(Ps,r):Fs.addScaledVector(Ps.sub(t),r))}t.add(Fs)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ks.copy(n.boundingSphere),ks.applyMatrix4(i),Os.copy(e.ray).recast(e.near),!(ks.containsPoint(Os.origin)===!1&&(Os.intersectSphere(ks,As)===null||Os.origin.distanceToSquared(As)>(e.far-e.near)**2))&&(Ds.copy(i).invert(),Os.copy(e.ray).applyMatrix4(Ds),(n.boundingBox===null||Os.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Os)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=zs(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=zs(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=zs(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=zs(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Rs(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Ls.copy(s),Ls.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Ls);return l<n.near||l>n.far?null:{distance:l,point:Ls.clone(),object:e}}function zs(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,js),e.getVertexPosition(c,Ms),e.getVertexPosition(l,Ns);let u=Rs(e,t,n,r,js,Ms,Ns,Is);if(u){let e=new U;ho.getBarycoord(Is,js,Ms,Ns,e),i&&(u.uv=ho.getInterpolatedAttribute(i,s,c,l,e,new H)),a&&(u.uv1=ho.getInterpolatedAttribute(a,s,c,l,e,new H)),o&&(u.normal=ho.getInterpolatedAttribute(o,s,c,l,e,new U),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new U,materialIndex:0};ho.getNormal(js,Ms,Ns,t.normal),u.face=t,u.barycoord=e}return u}var Bs=class extends da{constructor(e=null,t=1,n=1,r,i,a,o,s,c=Rn,l=Rn,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Vs=class extends Po{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Hs=new _a,Us=new _a,Ws=[],Gs=new go,Ks=new _a,qs=new K,Js=new Vo,Ys=class extends K{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Vs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ks)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new go),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Hs),Gs.copy(e.boundingBox).applyMatrix4(Hs),this.boundingBox.union(Gs)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vo),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Hs),Js.copy(e.boundingSphere).applyMatrix4(Hs),this.boundingSphere.union(Js)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(qs.geometry=this.geometry,qs.material=this.material,qs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Js.copy(this.boundingSphere),Js.applyMatrix4(n),e.ray.intersectsSphere(Js)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Hs),Us.multiplyMatrices(n,Hs),qs.matrixWorld=Us,qs.raycast(e,Ws);for(let e=0,n=Ws.length;e<n;e++){let n=Ws[e];n.instanceId=i,n.object=this,t.push(n)}Ws.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Vs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Bs(new Float32Array(r*this.count),r,this.count,cr,Xn));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Xs=new Vo,Zs=new H(.5,.5),Qs=new U,$s=class{constructor(e=new ns,t=new ns,n=new ns,r=new ns,i=new ns,a=new ns){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=li,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Xs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Xs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Xs)}intersectsSprite(e){return Xs.center.set(0,0,0),Xs.radius=.7071067811865476+Zs.distanceTo(e.center),Xs.applyMatrix4(e.matrixWorld),this.intersectsSphere(Xs)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Qs.x=r.normal.x>0?e.max.x:e.min.x,Qs.y=r.normal.y>0?e.max.y:e.min.y,Qs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Qs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ec=class extends is{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new G(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},tc=new U,nc=new U,rc=new _a,ic=new Ts,ac=new Vo,oc=new U,sc=new U,cc=class extends Wa{constructor(e=new Yo,t=new ec){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)tc.fromBufferAttribute(t,e-1),nc.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=tc.distanceTo(nc);e.setAttribute(`lineDistance`,new Lo(n,1))}else B(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ac.copy(n.boundingSphere),ac.applyMatrix4(r),ac.radius+=i,e.ray.intersectsSphere(ac)===!1)return;rc.copy(r).invert(),ic.copy(e.ray).applyMatrix4(rc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=lc(this,e,ic,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=lc(this,e,ic,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=lc(this,e,ic,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=lc(this,e,ic,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function lc(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(tc.fromBufferAttribute(s,i),nc.fromBufferAttribute(s,a),n.distanceSqToSegment(tc,nc,oc,sc)>r)return;oc.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(oc);if(!(c<t.near||c>t.far))return{distance:c,point:sc.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var uc=new U,dc=new U,fc=class extends cc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)uc.fromBufferAttribute(t,e),dc.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+uc.distanceTo(dc);e.setAttribute(`lineDistance`,new Lo(n,1))}else B(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},pc=class extends is{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new G(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},mc=new _a,hc=new Ts,gc=new Vo,_c=new U,vc=class extends Wa{constructor(e=new Yo,t=new pc){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),gc.copy(n.boundingSphere),gc.applyMatrix4(r),gc.radius+=i,e.ray.intersectsSphere(gc)===!1)return;mc.copy(r).invert(),hc.copy(e.ray).applyMatrix4(mc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);_c.fromBufferAttribute(l,n),yc(_c,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)_c.fromBufferAttribute(l,a),yc(_c,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function yc(e,t,n,r,i,a,o){let s=hc.distanceSqToPoint(e);if(s<n){let n=new U;hc.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var bc=class extends da{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},xc=class extends da{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Sc=class extends da{constructor(e,t,n=Yn,r,i,a,o=Rn,s=Rn,c,l=or,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sa(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Cc=class extends Sc{constructor(e,t=Yn,n=301,r,i,a=Rn,o=Rn,s,c=or){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},wc=class extends da{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Tc=class e extends Yo{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Lo(c,3)),this.setAttribute(`normal`,new Lo(l,3)),this.setAttribute(`uv`,new Lo(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new U;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ec=class e extends Yo{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new U,l=new H;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Lo(a,3)),this.setAttribute(`normal`,new Lo(o,3)),this.setAttribute(`uv`,new Lo(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Dc=class e extends Yo{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Lo(u,3)),this.setAttribute(`normal`,new Lo(d,3)),this.setAttribute(`uv`,new Lo(f,2));function _(){let a=new U,_=new U,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new H,m=new U,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Oc=class e extends Dc{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},kc=class e extends Yo{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Lo(i,3)),this.setAttribute(`normal`,new Lo(i.slice(),3)),this.setAttribute(`uv`,new Lo(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new U,r=new U,i=new U;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new U;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new U;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new U,t=new U,n=new U,r=new U,o=new H,s=new H,c=new H;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Ac=class e extends kc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},jc=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){B(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new H:new U);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new U,r=[],i=[],a=[],o=new U,s=new _a;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new U)}i[0]=new U,a[0]=new U;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(Ei(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(Ei(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Mc=class extends jc{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new H){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Nc=class extends Mc{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Pc(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Fc=new U,Ic=new U,Lc=new Pc,Rc=new Pc,zc=new Pc,Bc=class extends jc{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new U){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Ic.subVectors(r[0],r[1]).add(r[0]),c=Ic);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Fc.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Fc),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Lc.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Rc.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),zc.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Lc.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Rc.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),zc.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Lc.calc(s),Rc.calc(s),zc.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new U().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Vc(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Hc(e,t){let n=1-e;return n*n*t}function Uc(e,t){return 2*(1-e)*e*t}function Wc(e,t){return e*e*t}function Gc(e,t,n,r){return Hc(e,t)+Uc(e,n)+Wc(e,r)}function Kc(e,t){let n=1-e;return n*n*n*t}function qc(e,t){let n=1-e;return 3*n*n*e*t}function Jc(e,t){return 3*(1-e)*e*e*t}function Yc(e,t){return e*e*e*t}function Xc(e,t,n,r,i){return Kc(e,t)+qc(e,n)+Jc(e,r)+Yc(e,i)}var Zc=class extends jc{constructor(e=new H,t=new H,n=new H,r=new H){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Xc(e,r.x,i.x,a.x,o.x),Xc(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Qc=class extends jc{constructor(e=new U,t=new U,n=new U,r=new U){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new U){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Xc(e,r.x,i.x,a.x,o.x),Xc(e,r.y,i.y,a.y,o.y),Xc(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},$c=class extends jc{constructor(e=new H,t=new H){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new H){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new H){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},el=class extends jc{constructor(e=new U,t=new U){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new U){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new U){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},tl=class extends jc{constructor(e=new H,t=new H,n=new H){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Gc(e,r.x,i.x,a.x),Gc(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},nl=class extends jc{constructor(e=new U,t=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new U){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Gc(e,r.x,i.x,a.x),Gc(e,r.y,i.y,a.y),Gc(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},rl=class extends jc{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new H){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Vc(o,s.x,c.x,l.x,u.x),Vc(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new H().fromArray(n))}return this}},il=Object.freeze({__proto__:null,ArcCurve:Nc,CatmullRomCurve3:Bc,CubicBezierCurve:Zc,CubicBezierCurve3:Qc,EllipseCurve:Mc,LineCurve:$c,LineCurve3:el,QuadraticBezierCurve:tl,QuadraticBezierCurve3:nl,SplineCurve:rl}),al=class extends jc{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new il[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new il[n.type]().fromJSON(n))}return this}},ol=class extends al{constructor(e){super(),this.type=`Path`,this.currentPoint=new H,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new $c(this.currentPoint.clone(),new H(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new tl(this.currentPoint.clone(),new H(e,t),new H(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new Zc(this.currentPoint.clone(),new H(e,t),new H(n,r),new H(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new rl([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Mc(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},sl=class extends ol{constructor(e){super(e),this.uuid=Ti(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new ol().fromJSON(n))}return this}};function cl(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=ll(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=gl(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return dl(a,o,n,s,c,l,0),o}function ll(e,t,n,r,i){let a;if(i===Bl(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Ll(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Ll(i/r|0,e[i],e[i+1],a);return a&&kl(a,a.next)&&(Rl(a),a=a.next),a}function ul(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(kl(n,n.next)||Ol(n.prev,n,n.next)===0)){if(Rl(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function dl(e,t,n,r,i,a,o){if(!e)return;!o&&a&&xl(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?pl(e,r,i,a):fl(e)){t.push(c.i,e.i,l.i),Rl(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=ml(ul(e),t),dl(e,t,n,r,i,a,2)):o===2&&hl(e,t,n,r,i,a):dl(ul(e),t,n,r,i,a,1);break}}}function fl(e){let t=e.prev,n=e,r=e.next;if(Ol(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&El(i,s,a,c,o,l,m.x,m.y)&&Ol(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function pl(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Ol(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=Cl(p,m,t,n,r),v=Cl(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&El(s,u,c,d,l,f,y.x,y.y)&&Ol(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&El(s,u,c,d,l,f,b.x,b.y)&&Ol(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&El(s,u,c,d,l,f,y.x,y.y)&&Ol(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&El(s,u,c,d,l,f,b.x,b.y)&&Ol(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function ml(e,t){let n=e;do{let r=n.prev,i=n.next.next;!kl(r,i)&&Al(r,n,n.next,i)&&Pl(r,i)&&Pl(i,r)&&(t.push(r.i,n.i,i.i),Rl(n),Rl(n.next),n=e=i),n=n.next}while(n!==e);return ul(n)}function hl(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Dl(o,e)){let s=Il(o,e);o=ul(o,o.next),s=ul(s,s.next),dl(o,t,n,r,i,a,0),dl(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function gl(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=ll(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(wl(o))}i.sort(_l);for(let e=0;e<i.length;e++)n=vl(i[e],n);return n}function _l(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function vl(e,t){let n=yl(e,t);if(!n)return t;let r=Il(n,e);return ul(r,r.next),ul(n,n.next)}function yl(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(kl(e,n))return n;do{if(kl(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Tl(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Pl(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&bl(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function bl(e,t){return Ol(e.prev,e,t.prev)<0&&Ol(t.next,e,e.next)<0}function xl(e,t,n,r){let i=e;do i.z===0&&(i.z=Cl(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Sl(i)}function Sl(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function Cl(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function wl(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Tl(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function El(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&Tl(e,t,n,r,i,a,o,s)}function Dl(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Nl(e,t)&&(Pl(e,t)&&Pl(t,e)&&Fl(e,t)&&(Ol(e.prev,e,t.prev)||Ol(e,t.prev,t))||kl(e,t)&&Ol(e.prev,e,e.next)>0&&Ol(t.prev,t,t.next)>0)}function Ol(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function kl(e,t){return e.x===t.x&&e.y===t.y}function Al(e,t,n,r){let i=Ml(Ol(e,t,n)),a=Ml(Ol(e,t,r)),o=Ml(Ol(n,r,e)),s=Ml(Ol(n,r,t));return!!(i!==a&&o!==s||i===0&&jl(e,n,t)||a===0&&jl(e,r,t)||o===0&&jl(n,e,r)||s===0&&jl(n,t,r))}function jl(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Ml(e){return e>0?1:e<0?-1:0}function Nl(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Al(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Pl(e,t){return Ol(e.prev,e,e.next)<0?Ol(e,t,e.next)>=0&&Ol(e,e.prev,t)>=0:Ol(e,t,e.prev)<0||Ol(e,e.next,t)<0}function Fl(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Il(e,t){let n=zl(e.i,e.x,e.y),r=zl(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Ll(e,t,n,r){let i=zl(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function Rl(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function zl(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Bl(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Vl=class{static triangulate(e,t,n=2){return cl(e,t,n)}},Hl=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Ul(e),Wl(n,e);let a=e.length;t.forEach(Ul);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Wl(n,t[e]);let o=Vl.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Ul(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Wl(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Gl=class e extends kc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Kl=class e extends Yo{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Lo(p,3)),this.setAttribute(`normal`,new Lo(m,3)),this.setAttribute(`uv`,new Lo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ql=class e extends Yo{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new U,p=new H;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Lo(s,3)),this.setAttribute(`normal`,new Lo(c,3)),this.setAttribute(`uv`,new Lo(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Jl=class e extends Yo{constructor(e=new sl([new H(0,.5),new H(-.5,-.5),new H(.5,-.5)]),t=12){super(),this.type=`ShapeGeometry`,this.parameters={shapes:e,curveSegments:t};let n=[],r=[],i=[],a=[],o=0,s=0;if(Array.isArray(e)===!1)c(e);else for(let t=0;t<e.length;t++)c(e[t]),this.addGroup(o,s,t),o+=s,s=0;this.setIndex(n),this.setAttribute(`position`,new Lo(r,3)),this.setAttribute(`normal`,new Lo(i,3)),this.setAttribute(`uv`,new Lo(a,2));function c(e){let o=r.length/3,c=e.extractPoints(t),l=c.shape,u=c.holes;Hl.isClockWise(l)===!1&&(l=l.reverse());for(let e=0,t=u.length;e<t;e++){let t=u[e];Hl.isClockWise(t)===!0&&(u[e]=t.reverse())}let d=Hl.triangulateShape(l,u);for(let e=0,t=u.length;e<t;e++){let t=u[e];l=l.concat(t)}for(let e=0,t=l.length;e<t;e++){let t=l[e];r.push(t.x,t.y,0),i.push(0,0,1),a.push(t.x,t.y)}for(let e=0,t=d.length;e<t;e++){let t=d[e],r=t[0]+o,i=t[1]+o,a=t[2]+o;n.push(r,i,a),s+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Yl(t,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}return new e(r,t.curveSegments)}};function Yl(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,r=e.length;n<r;n++){let r=e[n];t.shapes.push(r.uuid)}else t.shapes.push(e.uuid);return t}var Xl=class e extends Yo{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new U,d=new U,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Lo(p,3)),this.setAttribute(`normal`,new Lo(m,3)),this.setAttribute(`uv`,new Lo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Zl=class e extends Yo{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new U,f=new U,p=new U;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Lo(c,3)),this.setAttribute(`normal`,new Lo(l,3)),this.setAttribute(`uv`,new Lo(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}},Ql=class e extends Yo{constructor(e=new nl(new U(-1,-1,0),new U(-1,1,0),new U(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new U,s=new U,c=new H,l=new U,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new Lo(u,3)),this.setAttribute(`normal`,new Lo(d,3)),this.setAttribute(`uv`,new Lo(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new il[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function $l(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(tu(i))i.isRenderTargetTexture?(B(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(tu(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function eu(e){let t={};for(let n=0;n<e.length;n++){let r=$l(e[n]);for(let e in r)t[e]=r[e]}return t}function tu(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function nu(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ru(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ta.workingColorSpace}var iu={clone:$l,merge:eu},au=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ou=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,su=class extends is{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=au,this.fragmentShader=ou,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$l(e.uniforms),this.uniformsGroups=nu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new G().setHex(r.value);break;case`v2`:this.uniforms[n].value=new H().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new fa().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new _a().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},cu=class extends su{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},lu=class extends is{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new G(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new G(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new H(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Da,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},uu=class extends is{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=ni,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},du=class extends is{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function fu(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function pu(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var mu=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},hu=class extends mu{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:$r,endingEnd:$r}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case ei:i=e,o=2*t-n;break;case ti:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case ei:a=e,s=2*n-t;break;case ti:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},gu=class extends mu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},_u=class extends mu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},vu=class extends mu{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=xu(n,t,g,y,r);i[p]=yu(x,o,_,b,m)}return i}};function yu(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function bu(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function xu(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=yu(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=bu(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Su=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=fu(t,this.TimeBufferType),this.values=fu(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:fu(e.times,Array),values:fu(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),pu(e.settings)&&(n.settings={inTangents:fu(e.settings.inTangents,Array),outTangents:fu(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new _u(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new gu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new hu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new vu(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Yr:t=this.InterpolantFactoryMethodDiscrete;break;case Xr:t=this.InterpolantFactoryMethodLinear;break;case Zr:t=this.InterpolantFactoryMethodSmooth;break;case Qr:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return B(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Yr;case this.InterpolantFactoryMethodLinear:return Xr;case this.InterpolantFactoryMethodSmooth:return Zr;case this.InterpolantFactoryMethodBezier:return Qr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;pu(this.settings)&&(Cu(this.settings.inTangents,e),Cu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(V(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(V(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){V(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){V(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&di(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){V(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Zr,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,pu(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Cu(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Su.prototype.ValueTypeName=``,Su.prototype.TimeBufferType=Float32Array,Su.prototype.ValueBufferType=Float32Array,Su.prototype.DefaultInterpolation=Xr;var wu=class extends Su{constructor(e,t,n){super(e,t,n)}};wu.prototype.ValueTypeName=`bool`,wu.prototype.ValueBufferType=Array,wu.prototype.DefaultInterpolation=Yr,wu.prototype.InterpolantFactoryMethodLinear=void 0,wu.prototype.InterpolantFactoryMethodSmooth=void 0;var Tu=class extends Su{constructor(e,t,n,r){super(e,t,n,r)}};Tu.prototype.ValueTypeName=`color`;var Eu=class extends Su{constructor(e,t,n,r){super(e,t,n,r)}};Eu.prototype.ValueTypeName=`number`;var Du=class extends mu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Ji.slerpFlat(i,0,a,c-o,a,c,s);return i}},Ou=class extends Su{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Du(this.times,this.values,this.getValueSize(),e)}};Ou.prototype.ValueTypeName=`quaternion`,Ou.prototype.InterpolantFactoryMethodSmooth=void 0;var ku=class extends Su{constructor(e,t,n){super(e,t,n)}};ku.prototype.ValueTypeName=`string`,ku.prototype.ValueBufferType=Array,ku.prototype.DefaultInterpolation=Yr,ku.prototype.InterpolantFactoryMethodLinear=void 0,ku.prototype.InterpolantFactoryMethodSmooth=void 0;var Au=class extends Su{constructor(e,t,n,r){super(e,t,n,r)}};Au.prototype.ValueTypeName=`vector`;var ju=class extends Wa{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new G(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Mu=class extends ju{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Wa.DEFAULT_UP),this.updateMatrix(),this.groundColor=new G(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Nu=new _a,Pu=new U,Fu=new U,Iu=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new H(512,512),this.mapType=Wn,this.map=null,this.mapPass=null,this.matrix=new _a,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $s,this._frameExtents=new H(1,1),this._viewportCount=1,this._viewports=[new fa(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Pu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Pu),Fu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Fu),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Nu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Nu,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Nu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Lu=new U,Ru=new Ji,zu=new U,Bu=class extends Wa{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new _a,this.projectionMatrix=new _a,this.projectionMatrixInverse=new _a,this.coordinateSystem=li,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Lu,Ru,zu),zu.x===1&&zu.y===1&&zu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lu,Ru,zu.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Lu,Ru,zu),zu.x===1&&zu.y===1&&zu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lu,Ru,zu.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Vu=new U,Hu=new H,Uu=new H,Wu=class extends Bu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=wi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ci*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return wi*2*Math.atan(Math.tan(Ci*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Vu.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Vu.x,Vu.y).multiplyScalar(-e/Vu.z),Vu.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Vu.x,Vu.y).multiplyScalar(-e/Vu.z)}getViewSize(e,t){return this.getViewBounds(e,Hu,Uu),t.subVectors(Uu,Hu)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ci*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Gu=class extends Bu{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ku=class extends Iu{constructor(){super(new Gu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},qu=class extends ju{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Wa.DEFAULT_UP),this.updateMatrix(),this.target=new Wa,this.shadow=new Ku}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ju=-90,Yu=1,Xu=class extends Wa{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Wu(Ju,Yu,e,t);r.layers=this.layers,this.add(r);let i=new Wu(Ju,Yu,e,t);i.layers=this.layers,this.add(i);let a=new Wu(Ju,Yu,e,t);a.layers=this.layers,this.add(a);let o=new Wu(Ju,Yu,e,t);o.layers=this.layers,this.add(o);let s=new Wu(Ju,Yu,e,t);s.layers=this.layers,this.add(s);let c=new Wu(Ju,Yu,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Zu=class extends Wu{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Qu=`\\[\\]\\.:\\/`,$u=RegExp(`[\\[\\]\\.:\\/]`,`g`),ed=`[^\\[\\]\\.:\\/]`,td=`[^`+Qu.replace(`\\.`,``)+`]`,nd=`((?:WC+[\\/:])*)`.replace(`WC`,ed),rd=`(WCOD+)?`.replace(`WCOD`,td),id=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ed),ad=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ed),od=RegExp(`^`+nd+rd+id+ad+`$`),sd=[`material`,`materials`,`bones`,`map`],cd=class{constructor(e,t,n){let r=n||ld.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ld=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace($u,``)}static parseTrackName(e){let t=od.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);sd.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){B(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){V(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){V(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){V(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){V(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){V(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;V(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ld.Composite=cd,ld.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},ld.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},ld.prototype.GetterByBindingType=[ld.prototype._getValue_direct,ld.prototype._getValue_array,ld.prototype._getValue_arrayElement,ld.prototype._getValue_toArray],ld.prototype.SetterByBindingTypeAndVersioning=[[ld.prototype._setValue_direct,ld.prototype._setValue_direct_setNeedsUpdate,ld.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ld.prototype._setValue_array,ld.prototype._setValue_array_setNeedsUpdate,ld.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ld.prototype._setValue_arrayElement,ld.prototype._setValue_arrayElement_setNeedsUpdate,ld.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ld.prototype._setValue_fromArray,ld.prototype._setValue_fromArray_setNeedsUpdate,ld.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ud=new _a,dd=class{constructor(e,t,n=0,r=1/0){this.ray=new Ts(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Oa,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):V(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return ud.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ud),this}intersectObject(e,t=!0,n=[]){return pd(e,this,n,t),n.sort(fd),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)pd(e[r],this,n,t);return n.sort(fd),n}};function fd(e,t){return e.distance-t.distance}function pd(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)pd(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function md(e,t,n,r){let i=hd(r);switch(n){case rr:return e*t;case cr:return e*t/i.components*i.byteLength;case lr:return e*t/i.components*i.byteLength;case ur:return e*t*2/i.components*i.byteLength;case dr:return e*t*2/i.components*i.byteLength;case ir:return e*t*3/i.components*i.byteLength;case ar:return e*t*4/i.components*i.byteLength;case fr:return e*t*4/i.components*i.byteLength;case pr:case mr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case hr:case gr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case vr:case br:return Math.max(e,16)*Math.max(t,8)/4;case _r:case yr:return Math.max(e,8)*Math.max(t,8)/2;case xr:case Sr:case wr:case Tr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Cr:case Er:case Dr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Or:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case kr:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Ar:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case jr:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Mr:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Nr:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Pr:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Fr:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Ir:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Lr:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Rr:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case zr:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Br:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Vr:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Hr:case Ur:case Wr:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Gr:case Kr:return Math.ceil(e/4)*Math.ceil(t/4)*8;case qr:case Jr:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function hd(e){switch(e){case Wn:case Gn:return{byteLength:1,components:1};case qn:case Kn:case Zn:return{byteLength:2,components:1};case Qn:case $n:return{byteLength:2,components:4};case Yn:case Jn:case Xn:return{byteLength:4,components:1};case tr:case nr:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?B(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function gd(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function _d(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var vd={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},q={common:{diffuse:{value:new G(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new W}},envmap:{envMap:{value:null},envMapRotation:{value:new W},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new W}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new W}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new W},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new W},normalScale:{value:new H(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new W},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new W}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new W}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new W}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new G(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new G(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0},uvTransform:{value:new W}},sprite:{diffuse:{value:new G(16777215)},opacity:{value:1},center:{value:new H(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}}},yd={basic:{uniforms:eu([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.fog]),vertexShader:vd.meshbasic_vert,fragmentShader:vd.meshbasic_frag},lambert:{uniforms:eu([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)},envMapIntensity:{value:1}}]),vertexShader:vd.meshlambert_vert,fragmentShader:vd.meshlambert_frag},phong:{uniforms:eu([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)},specular:{value:new G(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:vd.meshphong_vert,fragmentShader:vd.meshphong_frag},standard:{uniforms:eu([q.common,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.roughnessmap,q.metalnessmap,q.fog,q.lights,{emissive:{value:new G(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:vd.meshphysical_vert,fragmentShader:vd.meshphysical_frag},toon:{uniforms:eu([q.common,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.gradientmap,q.fog,q.lights,{emissive:{value:new G(0)}}]),vertexShader:vd.meshtoon_vert,fragmentShader:vd.meshtoon_frag},matcap:{uniforms:eu([q.common,q.bumpmap,q.normalmap,q.displacementmap,q.fog,{matcap:{value:null}}]),vertexShader:vd.meshmatcap_vert,fragmentShader:vd.meshmatcap_frag},points:{uniforms:eu([q.points,q.fog]),vertexShader:vd.points_vert,fragmentShader:vd.points_frag},dashed:{uniforms:eu([q.common,q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:vd.linedashed_vert,fragmentShader:vd.linedashed_frag},depth:{uniforms:eu([q.common,q.displacementmap]),vertexShader:vd.depth_vert,fragmentShader:vd.depth_frag},normal:{uniforms:eu([q.common,q.bumpmap,q.normalmap,q.displacementmap,{opacity:{value:1}}]),vertexShader:vd.meshnormal_vert,fragmentShader:vd.meshnormal_frag},sprite:{uniforms:eu([q.sprite,q.fog]),vertexShader:vd.sprite_vert,fragmentShader:vd.sprite_frag},background:{uniforms:{uvTransform:{value:new W},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:vd.background_vert,fragmentShader:vd.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new W}},vertexShader:vd.backgroundCube_vert,fragmentShader:vd.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:vd.cube_vert,fragmentShader:vd.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:vd.equirect_vert,fragmentShader:vd.equirect_frag},distance:{uniforms:eu([q.common,q.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:vd.distance_vert,fragmentShader:vd.distance_frag},shadow:{uniforms:eu([q.lights,q.fog,{color:{value:new G(0)},opacity:{value:1}}]),vertexShader:vd.shadow_vert,fragmentShader:vd.shadow_frag}};yd.physical={uniforms:eu([yd.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new W},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new W},clearcoatNormalScale:{value:new H(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new W},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new W},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new W},sheen:{value:0},sheenColor:{value:new G(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new W},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new W},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new W},transmissionSamplerSize:{value:new H},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new W},attenuationDistance:{value:0},attenuationColor:{value:new G(0)},specularColor:{value:new G(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new W},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new W},anisotropyVector:{value:new H},anisotropyMap:{value:null},anisotropyMapTransform:{value:new W}}]),vertexShader:vd.meshphysical_vert,fragmentShader:vd.meshphysical_frag};var bd={r:0,b:0,g:0},xd=new _a,Sd=new W;Sd.set(-1,0,0,0,1,0,0,0,1);function Cd(e,t,n,r,i,a){let o=new G(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new K(new Tc(1,1,1),new su({name:`BackgroundCubeMaterial`,uniforms:$l(yd.backgroundCube.uniforms),vertexShader:yd.backgroundCube.vertexShader,fragmentShader:yd.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(xd.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Sd),l.material.toneMapped=ta.getTransfer(i.colorSpace)!==oi,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new K(new Kl(2,2),new su({name:`BackgroundMaterial`,uniforms:$l(yd.background.uniforms),vertexShader:yd.background.vertexShader,fragmentShader:yd.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=ta.getTransfer(i.colorSpace)!==oi,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(bd,ru(e)),n.buffers.color.setClear(bd.r,bd.g,bd.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function wd(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Td(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Ed(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(B(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&B(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Dd(e){let t=this,n=null,r=0,i=!1,a=!1,o=new ns,s=new W,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Od=4,kd=6,Ad=20,jd=256,Md=new Gu,Nd=new G,Pd=null,Fd=0,Id=0,Ld=!1,Rd=new U,zd=new U,Bd=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Rd}=i;Pd=this._renderer.getRenderTarget(),Fd=this._renderer.getActiveCubeFace(),Id=this._renderer.getActiveMipmapLevel(),Ld=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Kd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Pd,Fd,Id),this._renderer.xr.enabled=Ld,e.scissorTest=!1,Ud(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Pd=this._renderer.getRenderTarget(),Fd=this._renderer.getActiveCubeFace(),Id=this._renderer.getActiveMipmapLevel(),Ld=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Vn,minFilter:Vn,generateMipmaps:!1,type:Zn,format:ar,colorSpace:ii,depthBuffer:!1},r=Hd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Vd(r)),this._blurMaterial=Gd(r,e,t),this._ggxMaterial=Wd(r,e,t)}return r}_compileMaterial(e){let t=new K(new Yo,e);this._renderer.compile(t,Md)}_sceneToCubeUV(e,t,n,r,i){let a=new Wu(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Nd),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new K(new Tc,new Es({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Nd),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Ud(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=qd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Kd());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Ud(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Md)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Od?n-d+Od:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Ud(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Md),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Ud(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Md)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Ud(t,3*l*(r>this._lodMax-Od?r-this._lodMax+Od:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Md)}};function Vd(e){let t=[],n=[],r=e,i=e-Od+1+kd;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?zd.set(1,r,n):e===1?zd.set(-n,1,-r):e===2?zd.set(-n,r,1):e===3?zd.set(-1,r,-n):e===4?zd.set(-n,-1,r):zd.set(n,r,-1),zd.toArray(l,(e*6+t)*3)}}let u=new Yo;u.setAttribute(`position`,new Po(c,3)),u.setAttribute(`outputDirection`,new Po(l,3)),n.push(new K(u,null)),r>Od&&r--}return{lodMeshes:n,sizeLods:t}}function Hd(e,t,n){let r=new ma(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Ud(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Wd(e,t,n){return new su({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:jd,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Jd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Gd(e,t,n){return new su({name:`SphericalGaussianBlur`,defines:{SAMPLES:Ad,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Jd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Kd(){return new su({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Jd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function qd(){return new su({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Jd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Jd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Yd=class extends ma{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new bc(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Tc(5,5,5),i=new su({name:`CubemapFromEquirect`,uniforms:$l(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new K(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=Vn),new Xu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Xd(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Yd(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Bd(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Bd(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Zd(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&_i(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Qd(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Io:Fo)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function $d(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ef(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:V(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function tf(e,t,n){let r=new WeakMap,i=new fa;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new ha(h,p,m,u);g.type=Xn,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new H(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function nf(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var rf={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function af(e,t,n,r,i,a){let o=new ma(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Yo;l.setAttribute(`position`,new Lo([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Lo([0,2,0,0,2,0],2));let u=new cu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new K(l,u),f=new Gu(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new ma(t,n,{type:Zn,depthBuffer:!1,stencilBuffer:!1}),c=new ma(t,n,{type:Zn,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},ta.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=rf[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var of=new da,sf=new Sc(1,1),cf=new ha,lf=new ga,uf=new bc,df=[],ff=[],pf=new Float32Array(16),mf=new Float32Array(9),hf=new Float32Array(4);function gf(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=df[i];if(a===void 0&&(a=new Float32Array(i),df[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function _f(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function vf(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function yf(e,t){let n=ff[t];n===void 0&&(n=new Int32Array(t),ff[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function bf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function xf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(_f(n,t))return;e.uniform2fv(this.addr,t),vf(n,t)}}function Sf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(_f(n,t))return;e.uniform3fv(this.addr,t),vf(n,t)}}function Cf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(_f(n,t))return;e.uniform4fv(this.addr,t),vf(n,t)}}function wf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(_f(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),vf(n,t)}else{if(_f(n,r))return;hf.set(r),e.uniformMatrix2fv(this.addr,!1,hf),vf(n,r)}}function Tf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(_f(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),vf(n,t)}else{if(_f(n,r))return;mf.set(r),e.uniformMatrix3fv(this.addr,!1,mf),vf(n,r)}}function Ef(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(_f(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),vf(n,t)}else{if(_f(n,r))return;pf.set(r),e.uniformMatrix4fv(this.addr,!1,pf),vf(n,r)}}function Df(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Of(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(_f(n,t))return;e.uniform2iv(this.addr,t),vf(n,t)}}function kf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(_f(n,t))return;e.uniform3iv(this.addr,t),vf(n,t)}}function Af(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(_f(n,t))return;e.uniform4iv(this.addr,t),vf(n,t)}}function jf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Mf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(_f(n,t))return;e.uniform2uiv(this.addr,t),vf(n,t)}}function Nf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(_f(n,t))return;e.uniform3uiv(this.addr,t),vf(n,t)}}function Pf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(_f(n,t))return;e.uniform4uiv(this.addr,t),vf(n,t)}}function Ff(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(sf.compareFunction=n.isReversedDepthBuffer()?518:515,a=sf):a=of,n.setTexture2D(t||a,i)}function If(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||lf,i)}function Lf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||uf,i)}function Rf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||cf,i)}function zf(e){switch(e){case 5126:return bf;case 35664:return xf;case 35665:return Sf;case 35666:return Cf;case 35674:return wf;case 35675:return Tf;case 35676:return Ef;case 5124:case 35670:return Df;case 35667:case 35671:return Of;case 35668:case 35672:return kf;case 35669:case 35673:return Af;case 5125:return jf;case 36294:return Mf;case 36295:return Nf;case 36296:return Pf;case 35678:case 36198:case 36298:case 36306:case 35682:return Ff;case 35679:case 36299:case 36307:return If;case 35680:case 36300:case 36308:case 36293:return Lf;case 36289:case 36303:case 36311:case 36292:return Rf}}function Bf(e,t){e.uniform1fv(this.addr,t)}function Vf(e,t){let n=gf(t,this.size,2);e.uniform2fv(this.addr,n)}function Hf(e,t){let n=gf(t,this.size,3);e.uniform3fv(this.addr,n)}function Uf(e,t){let n=gf(t,this.size,4);e.uniform4fv(this.addr,n)}function Wf(e,t){let n=gf(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Gf(e,t){let n=gf(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Kf(e,t){let n=gf(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function qf(e,t){e.uniform1iv(this.addr,t)}function Jf(e,t){e.uniform2iv(this.addr,t)}function Yf(e,t){e.uniform3iv(this.addr,t)}function Xf(e,t){e.uniform4iv(this.addr,t)}function Zf(e,t){e.uniform1uiv(this.addr,t)}function Qf(e,t){e.uniform2uiv(this.addr,t)}function $f(e,t){e.uniform3uiv(this.addr,t)}function ep(e,t){e.uniform4uiv(this.addr,t)}function tp(e,t,n){let r=this.cache,i=t.length,a=yf(n,i);_f(r,a)||(e.uniform1iv(this.addr,a),vf(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?sf:of;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function np(e,t,n){let r=this.cache,i=t.length,a=yf(n,i);_f(r,a)||(e.uniform1iv(this.addr,a),vf(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||lf,a[e])}function rp(e,t,n){let r=this.cache,i=t.length,a=yf(n,i);_f(r,a)||(e.uniform1iv(this.addr,a),vf(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||uf,a[e])}function ip(e,t,n){let r=this.cache,i=t.length,a=yf(n,i);_f(r,a)||(e.uniform1iv(this.addr,a),vf(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||cf,a[e])}function ap(e){switch(e){case 5126:return Bf;case 35664:return Vf;case 35665:return Hf;case 35666:return Uf;case 35674:return Wf;case 35675:return Gf;case 35676:return Kf;case 5124:case 35670:return qf;case 35667:case 35671:return Jf;case 35668:case 35672:return Yf;case 35669:case 35673:return Xf;case 5125:return Zf;case 36294:return Qf;case 36295:return $f;case 36296:return ep;case 35678:case 36198:case 36298:case 36306:case 35682:return tp;case 35679:case 36299:case 36307:return np;case 35680:case 36300:case 36308:case 36293:return rp;case 36289:case 36303:case 36311:case 36292:return ip}}var op=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=zf(t.type)}},sp=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ap(t.type)}},cp=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},lp=/(\w+)(\])?(\[|\.)?/g;function up(e,t){e.seq.push(t),e.map[t.id]=t}function dp(e,t,n){let r=e.name,i=r.length;for(lp.lastIndex=0;;){let a=lp.exec(r),o=lp.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){up(n,l===void 0?new op(s,e,t):new sp(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new cp(s),up(n,e)),n=e}}}var fp=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);dp(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function pp(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var mp=37297,hp=0;function gp(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var _p=new W;function vp(e){ta._getMatrix(_p,ta.workingColorSpace,e);let t=`mat3( ${_p.elements.map(e=>e.toFixed(4))} )`;switch(ta.getTransfer(e)){case ai:return[t,`LinearTransferOETF`];case oi:return[t,`sRGBTransferOETF`];default:return B(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function yp(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+gp(e.getShaderSource(t),r)}return i}function bp(e,t){let n=vp(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var xp={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Sp(e,t){let n=xp[t];return n===void 0?(B(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Cp=new U;function wp(){return ta.getLuminanceCoefficients(Cp),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Cp.x.toFixed(4)}, ${Cp.y.toFixed(4)}, ${Cp.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Tp(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Op).join(`
`)}function Ep(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Dp(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Op(e){return e!==``}function kp(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Ap(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var jp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Mp(e){return e.replace(jp,Pp)}var Np=new Map;function Pp(e,t){let n=vd[t];if(n===void 0){let e=Np.get(t);if(e!==void 0)n=vd[e],B(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Mp(n)}var Fp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ip(e){return e.replace(Fp,Lp)}function Lp(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Rp(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var zp={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Bp(e){return zp[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Vp={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function Hp(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Vp[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Up={302:`ENVMAP_MODE_REFRACTION`};function Wp(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Up[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Gp={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Kp(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Gp[e.combine]||`ENVMAP_BLENDING_NONE`}function qp(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Jp(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Bp(n),l=Hp(n),u=Wp(n),d=Kp(n),f=qp(n),p=Tp(n),m=Ep(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Op).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Op).join(`
`),_.length>0&&(_+=`
`)):(g=[Rp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Op).join(`
`),_=[Rp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:vd.tonemapping_pars_fragment,n.toneMapping===0?``:Sp(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,vd.colorspace_pars_fragment,bp(`linearToOutputTexel`,n.outputColorSpace),wp(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Op).join(`
`)),o=Mp(o),o=kp(o,n),o=Ap(o,n),s=Mp(s),s=kp(s,n),s=Ap(s,n),o=Ip(o),s=Ip(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=pp(i,i.VERTEX_SHADER,y),S=pp(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=yp(i,x,`vertex`),n=yp(i,S,`fragment`);V(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):B(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new fp(i,h),T=Dp(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,mp)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=hp++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Yp=0,Xp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Zp(e),t.set(e,n)),n}},Zp=class{constructor(e){this.id=Yp++,this.code=e,this.usedTimes=0}};function Qp(e){return e===1030||e===37490||e===36285}function $p(e,t,n,r,i,a){let o=new Oa,s=new Xp,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&B(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=yd[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),M=h.isInstancedMesh===!0,te=h.isBatchedMesh===!0,N=!!i.map,ne=!!i.matcap,re=!!x,ie=!!i.aoMap,ae=!!i.lightMap,oe=!!i.bumpMap&&i.wireframe===!1,se=!!i.normalMap,ce=!!i.displacementMap,P=!!i.emissiveMap,le=!!i.metalnessMap,ue=!!i.roughnessMap,de=i.anisotropy>0,fe=i.clearcoat>0,pe=i.dispersion>0,me=i.retroreflectivity>0,he=i.iridescence>0,ge=i.sheen>0,_e=i.transmission>0,ve=de&&!!i.anisotropyMap,ye=fe&&!!i.clearcoatMap,be=fe&&!!i.clearcoatNormalMap,xe=fe&&!!i.clearcoatRoughnessMap,Se=he&&!!i.iridescenceMap,F=he&&!!i.iridescenceThicknessMap,Ce=ge&&!!i.sheenColorMap,we=ge&&!!i.sheenRoughnessMap,Te=!!i.specularMap,I=!!i.specularColorMap,Ee=!!i.specularIntensityMap,L=_e&&!!i.transmissionMap,De=_e&&!!i.thicknessMap,Oe=!!i.gradientMap,ke=!!i.alphaMap,Ae=i.alphaTest>0,je=!!i.alphaHash,Me=!!i.extensions,Ne=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let Pe={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:te,batchingColor:te&&h._colorsTexture!==null,instancing:M,instancingColor:M&&h.instanceColor!==null,instancingMorph:M&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:ta.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:N,matcap:ne,envMap:re,envMapMode:re&&x.mapping,envMapCubeUVHeight:S,aoMap:ie,lightMap:ae,bumpMap:oe,normalMap:se,displacementMap:ce,emissiveMap:P,normalMapObjectSpace:se&&i.normalMapType===1,normalMapTangentSpace:se&&i.normalMapType===0,packedNormalMap:se&&i.normalMapType===0&&Qp(i.normalMap.format),metalnessMap:le,roughnessMap:ue,anisotropy:de,anisotropyMap:ve,clearcoat:fe,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,dispersion:pe,retroreflection:me,iridescence:he,iridescenceMap:Se,iridescenceThicknessMap:F,sheen:ge,sheenColorMap:Ce,sheenRoughnessMap:we,specularMap:Te,specularColorMap:I,specularIntensityMap:Ee,transmission:_e,transmissionMap:L,thicknessMap:De,gradientMap:Oe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:je,combine:i.combine,mapUv:N&&m(i.map.channel),aoMapUv:ie&&m(i.aoMap.channel),lightMapUv:ae&&m(i.lightMap.channel),bumpMapUv:oe&&m(i.bumpMap.channel),normalMapUv:se&&m(i.normalMap.channel),displacementMapUv:ce&&m(i.displacementMap.channel),emissiveMapUv:P&&m(i.emissiveMap.channel),metalnessMapUv:le&&m(i.metalnessMap.channel),roughnessMapUv:ue&&m(i.roughnessMap.channel),anisotropyMapUv:ve&&m(i.anisotropyMap.channel),clearcoatMapUv:ye&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:F&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:we&&m(i.sheenRoughnessMap.channel),specularMapUv:Te&&m(i.specularMap.channel),specularColorMapUv:I&&m(i.specularColorMap.channel),specularIntensityMapUv:Ee&&m(i.specularIntensityMap.channel),transmissionMapUv:L&&m(i.transmissionMap.channel),thicknessMapUv:De&&m(i.thicknessMap.channel),alphaMapUv:ke&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(se||de),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(N||ke),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&se===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:N&&i.map.isVideoTexture===!0&&ta.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:P&&i.emissiveMap.isVideoTexture===!0&&ta.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Me&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&i.extensions.multiDraw===!0||te)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Pe.vertexUv1s=c.has(1),Pe.vertexUv2s=c.has(2),Pe.vertexUv3s=c.has(3),c.clear(),Pe}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=yd[t];n=iu.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Jp(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function em(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function tm(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function nm(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function rm(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||tm),r.length>1&&r.sort(t||nm),i.length>1&&i.sort(t||nm)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function im(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new rm,e.set(t,[i])):n>=r.length?(i=new rm,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function am(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new U,color:new G};break;case`SpotLight`:n={position:new U,direction:new U,color:new G,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new U,color:new G,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new U,skyColor:new G,groundColor:new G};break;case`RectAreaLight`:n={color:new G,position:new U,halfWidth:new U,halfHeight:new U}}return e[t.id]=n,n}}}function om(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var sm=0;function cm(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function lm(e){let t=new am,n=om(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new U);let i=new U,a=new _a,o=new _a;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(cm);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=q.LTC_FLOAT_1,r.rectAreaLTC2=q.LTC_FLOAT_2):(r.rectAreaLTC1=q.LTC_HALF_1,r.rectAreaLTC2=q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=sm++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function um(e){let t=new lm(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function dm(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new um(e),t.set(n,[a])):r>=i.length?(a=new um(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var fm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,mm=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],hm=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],gm=new _a,_m=new U,vm=new U;function ym(e,t,n){let r=new $s,i=new H,a=new H,o=new fa,s=new uu,c=new du,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new su({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new H},radius:{value:4}},vertexShader:fm,fragmentShader:pm}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Yo;m.setAttribute(`position`,new Po(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new K(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(B(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){B(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){B(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new ma(i.x,i.y,{format:ur,type:Zn,minFilter:Vn,magFilter:Vn,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Sc(i.x,i.y,Xn),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=or,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Rn,d.map.depthTexture.magFilter=Rn}else l.isPointLight?(d.map=new Yd(i.x),d.map.depthTexture=new Cc(i.x,Yn)):(d.map=new ma(i.x,i.y),d.map.depthTexture=new Sc(i.x,i.y,Yn)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=or,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=Vn,d.map.depthTexture.magFilter=Vn):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Rn,d.map.depthTexture.magFilter=Rn);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),_m.setFromMatrixPosition(l.matrixWorld),e.position.copy(_m),vm.copy(e.position),vm.add(mm[t]),e.up.copy(hm[t]),e.lookAt(vm),e.updateMatrixWorld(),n.makeTranslation(-_m.x,-_m.y,-_m.z),gm.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(gm,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new ma(i.x,i.y,{format:ur,type:Zn}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function bm(e,t){function n(){let t=!1,n=new fa,r=null,i=new fa(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?le(e.DEPTH_TEST):ue(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=yi[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?le(e.STENCIL_TEST):ue(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new G(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(N)[1]),M=te>=1);let ne=null,re={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new fa().fromArray(ie),se=new fa().fromArray(ae);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let P={};P[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),P[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),P[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),P[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),le(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),le(e.CULL_FACE),ge(0);function le(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ue(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function de(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function fe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function pe(t){return h!==t&&(e.useProgram(t),h=t,!0)}let me={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};me[103]=e.MIN,me[104]=e.MAX;let he={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ge(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(ue(e.BLEND),g=!1);return}if(g===!1&&(le(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:V(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:V(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:V(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:V(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(me[n],me[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(he[r],he[i],he[o],he[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function _e(t,n){t.side===2?ue(e.CULL_FACE):le(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?ge(0):ge(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),xe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?le(e.SAMPLE_ALPHA_TO_COVERAGE):ue(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ye(t){t===0?ue(e.CULL_FACE):(le(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function be(t){t!==k&&(M&&e.lineWidth(t),k=t)}function xe(t,n,r){t?(le(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):ue(e.POLYGON_OFFSET_FILL)}function Se(t){t?le(e.SCISSOR_TEST):ue(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+ee-1),ne!==t&&(e.activeTexture(t),ne=t)}function Ce(t,n,r){r===void 0&&(r=ne===null?e.TEXTURE0+ee-1:ne);let i=re[r];i===void 0&&(i={type:void 0,texture:void 0},re[r]=i),(i.type!==t||i.texture!==n)&&(ne!==r&&(e.activeTexture(r),ne=r),e.bindTexture(t,n||P[t]),i.type=t,i.texture=n)}function we(){let t=re[ne];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function I(){try{e.compressedTexImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ee(){try{e.texSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function L(){try{e.texSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ne(t){return d[t]===void 0?e.getParameter(t):d[t]}function Pe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Fe(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function Ie(t){se.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),se.copy(t))}function Le(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Re(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function ze(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ne=null,re={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new G(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,oe.set(0,0,e.canvas.width,e.canvas.height),se.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:le,disable:ue,bindFramebuffer:de,drawBuffers:fe,useProgram:pe,setBlending:ge,setMaterial:_e,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:xe,setScissorTest:Se,activeTexture:F,bindTexture:Ce,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:I,texImage2D:je,texImage3D:Me,pixelStorei:Pe,getParameter:Ne,updateUBOMapping:Le,uniformBlockBinding:Re,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Ee,texSubImage3D:L,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Fe,viewport:Ie,reset:ze}}function xm(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new H,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):fi(`canvas`)}function g(e,t,n){let r=1,i=Te(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),B(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&B(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];B(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||B(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?ai:ta.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,B(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function j(e){O=e}function ee(){let e=O;return e>=i.maxTextures&&B(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function M(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function te(t,i){let a=r.get(t);if(t.isVideoTexture&&Ce(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)B(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)B(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ue(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ue(a,t,i);return}t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ue(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){de(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ie={[Fn]:e.REPEAT,[In]:e.CLAMP_TO_EDGE,[Ln]:e.MIRRORED_REPEAT},ae={[Rn]:e.NEAREST,[zn]:e.NEAREST_MIPMAP_NEAREST,[Bn]:e.NEAREST_MIPMAP_LINEAR,[Vn]:e.LINEAR,[Hn]:e.LINEAR_MIPMAP_NEAREST,[Un]:e.LINEAR_MIPMAP_LINEAR},oe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function se(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&B(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ie[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ie[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ie[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ae[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ae[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,oe[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ce(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=M(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function P(e,t,n){return Math.floor(Math.floor(e/n)/t)}function le(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=P(n.start,r.width,4),c=P(t.start,r.width,4);n.start<=i+1&&a===c&&P(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ue(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ce(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=ta.getPrimaries(ta.workingColorSpace),r=o.colorSpace===``?null:ta.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=we(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);se(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===sr,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&le(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023){if(r!==null){if(C){if(T){if(o.layerUpdates.size>0){let t=md(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=md(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w){if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=Te(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=Te(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function de(t,o,s){if(o.image.length!==6)return;let c=ce(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=ta.getPrimaries(ta.workingColorSpace),r=o.colorSpace===``?null:ta.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=we(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);se(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=Te(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function fe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Se(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function pe(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Se(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Se(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Se(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Se(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function me(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),se(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else te(i.depthTexture,0);let u=l.__webglTexture,d=Se(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function he(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)me(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?me(i.__webglFramebuffer[0],t,0):me(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),pe(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),pe(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ge(t,n,i){let a=r.get(t);n!==void 0&&fe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&he(t)}function _e(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&F(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=Se(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),pe(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),se(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)fe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else fe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),se(c,a),fe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),se(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)fe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else fe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&he(t)}function ve(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let ye=[],be=[];function xe(t){if(t.samples>0){if(F(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(ye.length=0,be.length=0,ye.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(ye.push(l),be.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,be)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ye))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Se(e){return Math.min(i.maxSamples,e.samples)}function F(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ce(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function we(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(ta.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&B(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):V(`WebGLTextures: Unsupported texture color space:`,n)),t}function Te(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ee,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=j,this.setTexture2D=te,this.setTexture2DArray=N,this.setTexture3D=ne,this.setTextureCube=re,this.rebindTextures=ge,this.setupRenderTarget=_e,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=he,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=F,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Sm(e,t){function n(n,r=``){let i,a=ta.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Cm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,wm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Tm=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new wc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new su({vertexShader:Cm,fragmentShader:wm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new K(new Kl(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Em=class extends bi{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Tm,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new H,C=null,w=null,T=new Wu;T.viewport=new fa;let E=new Wu;E.viewport=new fa;let D=[T,E],O=new Zu,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new qa,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new qa,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new qa,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,se.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?sr:or,a=_.stencil?er:Yn);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ma(d.textureWidth,d.textureHeight,{format:ar,type:Wn,depthTexture:new Sc(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ma(f.framebufferWidth,f.framebufferHeight,{format:ar,type:Wn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),se.setContext(r),se.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let te=new U,N=new U;function ne(e,t,n){te.setFromMatrixPosition(t.matrixWorld),N.setFromMatrixPosition(n.matrixWorld);let r=te.distanceTo(N),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function re(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;re(O,i);for(let e=0;e<a.length;e++)re(a[e],i);a.length===2?ne(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ie(e,O,i)};function ie(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=wi*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let ae=null;function oe(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new Wu,o.layers.enable(n),o.viewport=new fa,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new wc,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ae&&ae(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let se=new gd;se.setAnimationLoop(oe),this.setAnimationLoop=function(e){ae=e},this.dispose=function(){}}},Dm=new _a,Om=new W;Om.set(-1,0,0,0,1,0,0,0,1);function km(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ru(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Dm.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Om),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Am(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return V(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?B(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):B(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var jm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mm=null;function Nm(){return Mm===null&&(Mm=new Bs(jm,16,16,ur,Zn),Mm.name=`DFG_LUT`,Mm.minFilter=Vn,Mm.magFilter=Vn,Mm.wrapS=In,Mm.wrapT=In,Mm.generateMipmaps=!1,Mm.needsUpdate=!0),Mm}var Pm=class{constructor(e={}){let{canvas:t=pi(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Wn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([fr,dr,lr]),g=new Set([Wn,Yn,qn,er,Qn,$n]),_=new Uint32Array(4),v=new Int32Array(4),y=new U,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=ri;let j=0,ee=0,M=null,te=-1,N=null,ne=new fa,re=new fa,ie=null,ae=new G(0),oe=0,se=t.width,ce=t.height,P=1,le=null,ue=null,de=new fa(0,0,se,ce),fe=new fa(0,0,se,ce),pe=!1,me=new $s,he=!1,ge=!1,_e=new _a,ve=new U,ye=new fa,be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},xe=!1;function Se(){return M===null?P:1}let F=n;function Ce(e,n){return t.getContext(e,n)}let we,Te,I,Ee,L,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,qe,!1),t.addEventListener(`webglcontextrestored`,Je,!1),t.addEventListener(`webglcontextcreationerror`,Ye,!1),F===null){let t=`webgl2`;if(F=Ce(t,e),F===null)throw Ce(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Ge()}catch(e){throw t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),V(`WebGLRenderer: `+e.message),e}function Ge(){we=new Zd(F),we.init(),He=new Sm(F,we),Te=new Ed(F,we,e,He),I=new bm(F,we),Te.reversedDepthBuffer&&d&&I.buffers.depth.setReversed(!0),O=F.createFramebuffer(),k=F.createFramebuffer(),A=F.createFramebuffer(),Ee=new ef(F),L=new em,De=new xm(F,we,I,L,Te,He,Ee),Oe=new Xd(T),ke=new _d(F),Ue=new wd(F,ke),Ae=new Qd(F,ke,Ee,Ue),je=new nf(F,Ae,ke,Ue,Ee),ze=new tf(F,Te,De),Ie=new Dd(L),Me=new $p(T,Oe,we,Te,Ue,Ie),Ne=new km(T,L),Pe=new im,Fe=new dm(we),Re=new Cd(T,Oe,I,je,p,s),Le=new ym(T,je,Te),We=new Am(F,Ee,Te,I),Be=new Td(F,we,Ee),Ve=new $d(F,we,Ee),Ee.programs=Me.programs,T.capabilities=Te,T.extensions=we,T.properties=L,T.renderLists=Pe,T.shadowMap=Le,T.state=I,T.info=Ee}m!==1009&&(w=new af(m,t.width,t.height,o,r,i));let Ke=new Em(T,F);this.xr=Ke,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let e=we.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=we.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return P},this.setPixelRatio=function(e){e!==void 0&&(P=e,this.setSize(se,ce,!1))},this.getSize=function(e){return e.set(se,ce)},this.setSize=function(e,n,r=!0){if(Ke.isPresenting){B(`WebGLRenderer: Can't change size while VR device is presenting.`);return}se=e,ce=n,t.width=Math.floor(e*P),t.height=Math.floor(n*P),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(se*P,ce*P).floor()},this.setDrawingBufferSize=function(e,n,r){se=e,ce=n,P=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){V(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){B(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(ne)},this.getViewport=function(e){return e.copy(de)},this.setViewport=function(e,t,n,r){e.isVector4?de.set(e.x,e.y,e.z,e.w):de.set(e,t,n,r),I.viewport(ne.copy(de).multiplyScalar(P).round())},this.getScissor=function(e){return e.copy(fe)},this.setScissor=function(e,t,n,r){e.isVector4?fe.set(e.x,e.y,e.z,e.w):fe.set(e,t,n,r),I.scissor(re.copy(fe).multiplyScalar(P).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(e){I.setScissorTest(pe=e)},this.setOpaqueSort=function(e){le=e},this.setTransparentSort=function(e){ue=e},this.getClearColor=function(e){return e.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor(...arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Re.getClearColor(),r=Re.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,F.clearBufferuiv(F.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,F.clearBufferiv(F.COLOR,0,v))}else r|=F.COLOR_BUFFER_BIT}t&&(r|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&F.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),Re.dispose(),Pe.dispose(),Fe.dispose(),L.dispose(),Oe.dispose(),je.dispose(),Ue.dispose(),We.dispose(),Me.dispose(),Ke.dispose(),Ke.removeEventListener(`sessionstart`,R),Ke.removeEventListener(`sessionend`,nt),rt.stop()};function qe(e){e.preventDefault(),hi(`WebGLRenderer: Context Lost.`),E=!0}function Je(){hi(`WebGLRenderer: Context Restored.`),E=!1;let e=Ee.autoReset,t=Le.enabled,n=Le.autoUpdate,r=Le.needsUpdate,i=Le.type;Ge(),Ee.autoReset=e,Le.enabled=t,Le.autoUpdate=n,Le.needsUpdate=r,Le.type=i}function Ye(e){V(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Xe(e){let t=e.target;t.removeEventListener(`dispose`,Xe),Ze(t)}function Ze(e){Qe(e),L.remove(e)}function Qe(e){let t=L.get(e).programs;t!==void 0&&(t.forEach(function(e){Me.releaseProgram(e)}),e.isShaderMaterial&&Me.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=be);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=ft(e,t,n,r,i);I.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ae.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ue.setup(i,r,s,n,c);let h,g=Be;if(c!==null&&(h=ke.get(c),g=Ve,g.setIndex(h)),i.isMesh)r.wireframe===!0?(I.setLineWidth(r.wireframeLinewidth*Se()),g.setMode(F.LINES)):g.setMode(F.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),I.setLineWidth(e*Se()),i.isLineSegments?g.setMode(F.LINES):i.isLineLoop?g.setMode(F.LINE_LOOP):g.setMode(F.LINE_STRIP)}else i.isPoints?g.setMode(F.POINTS):i.isSprite&&g.setMode(F.TRIANGLES);if(i.isBatchedMesh){if(we.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ke.get(c).bytesPerElement:1,o=L.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(F,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function $e(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),he===!0&&Ie.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ct(e,t,r),e.side=0,e.needsUpdate=!0,ct(e,t,r),e.side=2):ct(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Fe.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),ge=this.localClippingEnabled,he=Ie.init(this.clippingPlanes,ge),he===!0&&Ie.setGlobalState(this.clippingPlanes,t),D!==null&&Le.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];$e(o,n,t,e),r.add(o)}else $e(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=L.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}we.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let et=null;function tt(e){et&&et(e)}function R(){rt.stop()}function nt(){rt.start()}let rt=new gd;rt.setAnimationLoop(tt),typeof self<`u`&&rt.setContext(self),this.setAnimationLoop=function(e){et=e,Ke.setAnimationLoop(e),e===null?rt.stop():rt.start()},Ke.addEventListener(`sessionstart`,R),Ke.addEventListener(`sessionend`,nt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){V(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ke.enabled===!0&&Ke.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ke.enabled===!0&&Ke.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ke.cameraAutoUpdate===!0&&Ke.updateCamera(t),t=Ke.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Fe.get(e,C.length),x.init(t),x.state.textureUnits=De.getTextureUnits(),C.push(x),_e.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),me.setFromProjectionMatrix(_e,li,t.reversedDepth),ge=this.localClippingEnabled,he=Ie.init(this.clippingPlanes,ge),b=Pe.get(e,S.length),b.init(),S.push(b),Ke.enabled===!0&&Ke.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&it(e,t,-1/0,T.sortObjects)}it(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(le,ue),xe=Ke.enabled===!1||Ke.isPresenting===!1||Ke.hasDepthSensing()===!1,xe&&Re.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),he===!0&&Ie.beginShadows();let i=x.state.shadowsArray;if(Le.render(i,e,t),he===!0&&Ie.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];z(n,r,e,a)}xe&&Re.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];at(b,e,n,n.viewport)}}else r.length>0&&z(n,r,e,t),xe&&Re.render(e),at(b,e,t)}M!==null&&ee===0&&(De.updateMultisampleRenderTarget(M),De.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Ue.resetDefaultState(),te=-1,N=null,C.pop(),C.length>0?(x=C[C.length-1],De.setTextureUnits(x.state.textureUnits),he===!0&&Ie.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function it(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(me)){r&&ye.setFromMatrixPosition(e.matrixWorld).applyMatrix4(_e);let i=je.update(e),a=e.material;a.visible&&b.push(e,i,a,n,ye.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(me))){let i=je.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),ye.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ye.copy(e.boundingSphere.center)),ye.applyMatrix4(e.matrixWorld).applyMatrix4(_e)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,ye.z,s,t)}}else a.visible&&b.push(e,i,a,n,ye.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)it(i[e],t,n,r)}function at(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),he===!0&&Ie.setGlobalState(T.clippingPlanes,n),r&&I.viewport(ne.copy(r)),i.length>0&&ot(i,t,n),a.length>0&&ot(a,t,n),o.length>0&&ot(o,t,n),I.buffers.depth.setTest(!0),I.buffers.depth.setMask(!0),I.buffers.color.setMask(!0),I.setPolygonOffset(!1)}function z(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=we.has(`EXT_color_buffer_half_float`)||we.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new ma(1,1,{generateMipmaps:!0,type:e?Zn:Wn,minFilter:Un,samples:Math.max(4,Te.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ta.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||ne;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(ae),oe=T.getClearAlpha(),oe<1&&T.setClearColor(16777215,.5),T.clear(),xe&&Re.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),he===!0&&Ie.setGlobalState(T.clippingPlanes,r),ot(e,n,r),De.updateMultisampleRenderTarget(a),De.updateRenderTargetMipmap(a),we.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,st(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(De.updateMultisampleRenderTarget(a),De.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(ae,oe),d!==void 0&&(r.viewport=d),T.toneMapping=u}function ot(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&st(o,t,n,s,l,c)}}function st(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function ct(e,t,n){t.isScene!==!0&&(t=be);let r=L.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Me.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Me.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Oe.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Xe),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ut(e,s),d}else s.uniforms=Me.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Me.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ie.uniform),ut(e,s),r.needsLights=mt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function lt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=fp.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ut(e,t){let n=L.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function dt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function ft(e,t,n,r,i){t.isScene!==!0&&(t=be),De.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:ta.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Oe.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=L.get(r),y=x.state.lights;if(he===!0&&(ge===!0||e!==N)){let t=e===N&&r.id===te;Ie.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ie.numPlanes||v.numIntersection!==Ie.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=ct(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(I.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==te&&(te=r.id,w=!0),v.needsLights){let e=dt(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||N!==e){I.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(F,`projectionMatrix`,e.projectionMatrix),O.setValue(F,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(F,ve.setFromMatrixPosition(e.matrixWorld)),Te.logarithmicDepthBuffer&&O.setValue(F,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(F,`isOrthographic`,e.isOrthographicCamera===!0),N!==e&&(N=e,w=!0,E=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&O.setValue(F,`sunShadowMap`,y.state.sunShadowMap,De),y.state.directionalShadowMap.length>0&&O.setValue(F,`directionalShadowMap`,y.state.directionalShadowMap,De),y.state.spotShadowMap.length>0&&O.setValue(F,`spotShadowMap`,y.state.spotShadowMap,De),y.state.pointShadowMap.length>0&&O.setValue(F,`pointShadowMap`,y.state.pointShadowMap,De)),i.isSkinnedMesh){O.setOptional(F,i,`bindMatrix`),O.setOptional(F,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(F,`boneTexture`,e.boneTexture,De))}i.isBatchedMesh&&(O.setOptional(F,i,`batchingTexture`),O.setValue(F,`batchingTexture`,i._matricesTexture,De),O.setOptional(F,i,`batchingIdTexture`),O.setValue(F,`batchingIdTexture`,i._indirectTexture,De),O.setOptional(F,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(F,`batchingColorTexture`,i._colorsTexture,De));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&ze.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(F,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=Nm()),w){if(O.setValue(F,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&pt(k,E),a&&r.fog===!0&&Ne.refreshFogUniforms(k,a),Ne.refreshMaterialUniforms(k,r,P,ce,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}fp.upload(F,lt(v),k,De)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(fp.upload(F,lt(v),k,De),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(F,`center`,i.center),O.setValue(F,`modelViewMatrix`,i.modelViewMatrix),O.setValue(F,`normalMatrix`,i.normalMatrix),O.setValue(F,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];We.update(n,S),We.bind(n,S)}}return S}function pt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function mt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=L.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),L.get(e.texture).__webglTexture=t,L.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=L.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=L.get(e);if(o.__useDefaultFramebuffer!==void 0){I.bindFramebuffer(F.FRAMEBUFFER,o.__webglFramebuffer),ne.copy(e.viewport),re.copy(e.scissor),ie=e.scissorTest,I.viewport(ne),I.scissor(re),I.setScissorTest(ie),te=-1;return}if(o.__webglFramebuffer===void 0)De.setupRenderTarget(e);else if(o.__hasExternalTextures)De.rebindTextures(e,L.get(e.texture).__webglTexture,L.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&L.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);De.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=L.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&De.useMultisampledRTT(e)===!1?L.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,ne.copy(e.viewport),re.copy(e.scissor),ie=e.scissorTest}else ne.copy(de).multiplyScalar(P).floor(),re.copy(fe).multiplyScalar(P).floor(),ie=pe;if(n!==0&&(r=O),I.bindFramebuffer(F.FRAMEBUFFER,r)&&I.drawBuffers(e,r),I.viewport(ne),I.scissor(re),I.setScissorTest(ie),i){let r=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=L.get(e.textures[t]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,t.__webglTexture,n)}te=-1};function ht(e){let t=L.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Te.textureFormatReadable(e.format),t.__typeReadable=Te.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){I.bindFramebuffer(F.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let u=ht(o);if(u.__formatReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&F.readPixels(t,n,r,i,He.convert(c),He.convert(l),a)}finally{let e=M===null?null:L.get(M).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){I.bindFramebuffer(F.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let d=ht(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.bufferData(F.PIXEL_PACK_BUFFER,a.byteLength,F.STREAM_READ),F.readPixels(t,n,r,i,He.convert(l),He.convert(u),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let p=M===null?null:L.get(M).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,p);let m=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await vi(F,m,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,a),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(f),F.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;De.setTexture2D(e,0),F.copyTexSubImage2D(F.TEXTURE_2D,n,0,0,o,s,i,a),I.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=He.convert(t.format),_=He.convert(t.type),v;t.isData3DTexture?(De.setTexture3D(t,0),v=F.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(De.setTexture2DArray(t,0),v=F.TEXTURE_2D_ARRAY):(De.setTexture2D(t,0),v=F.TEXTURE_2D),I.activeTexture(F.TEXTURE0),I.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(F.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(F.UNPACK_ROW_LENGTH),b=I.getParameter(F.UNPACK_IMAGE_HEIGHT),x=I.getParameter(F.UNPACK_SKIP_PIXELS),S=I.getParameter(F.UNPACK_SKIP_ROWS),C=I.getParameter(F.UNPACK_SKIP_IMAGES);I.pixelStorei(F.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(F.UNPACK_SKIP_PIXELS,l),I.pixelStorei(F.UNPACK_SKIP_ROWS,u),I.pixelStorei(F.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=L.get(e),r=L.get(t),h=L.get(n.__renderTarget),g=L.get(r.__renderTarget);I.bindFramebuffer(F.READ_FRAMEBUFFER,h.__webglFramebuffer),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(e).__webglTexture,i,d+n),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(t).__webglTexture,a,m+n)),F.blitFramebuffer(l,u,o,s,f,p,o,s,F.DEPTH_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||L.has(e)){let n=L.get(e),r=L.get(t);I.bindFramebuffer(F.READ_FRAMEBUFFER,k),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,n.__webglTexture,i),T?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,r.__webglTexture,a),i===0?T?F.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):F.copyTexSubImage2D(v,a,f,p,l,u,o,s):F.blitFramebuffer(l,u,o,s,f,p,o,s,F.COLOR_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?F.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(F.UNPACK_ROW_LENGTH,y),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(F.UNPACK_SKIP_PIXELS,x),I.pixelStorei(F.UNPACK_SKIP_ROWS,S),I.pixelStorei(F.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&F.generateMipmap(v),I.unbindTexture()},this.initRenderTarget=function(e){L.get(e).__webglFramebuffer===void 0&&De.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?De.setTextureCube(e,0):e.isData3DTexture?De.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?De.setTexture2DArray(e,0):De.setTexture2D(e,0),I.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,I.reset(),Ue.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ta._getDrawingBufferColorSpace(e),t.unpackColorSpace=ta._getUnpackColorSpace()}},Fm=[{groups:1,members:3,maxSize:0,flock:.5},{groups:2,members:6,maxSize:1,flock:.7},{groups:3,members:12,maxSize:1,flock:1},{groups:5,members:22,maxSize:2,flock:1.2},{groups:7,members:36,maxSize:3,flock:1.5}],Im=[`細小`,`小型`,`中型`,`大型`];function Lm(e){return Fm[Math.max(0,Math.min(4,Math.round(e)))]}function Rm(e){let t=e.look.size??1;switch(e.category){case`insect`:case`amphibian`:return 0;case`butterfly`:return+(t>=1.5);case`reptile`:return e.look.kind===`snake`&&t>=2?3:e.look.kind===`lizard`?0:1;case`bird`:return e.look.kind===`owl`?2:e.motion===`soar`?t>=2.5?3:2:t<=.85?0:t<=1.2?1:2;case`mammal`:return e.look.kind===`squirrel`||e.look.kind===`bat`?1:t>=2?3:t<.9?1:2}}function zm(e,t){return Rm(e)<=Lm(t).maxSize}function Bm(e,t,n){if(e.motion===`nest`||e.motion===`hollow`||e.motion===`glow`)return 1;let r=Lm(t),[i,a]=e.group,o=Math.max(i,Math.round(a*(a>=3?r.flock:1))),s=i+Math.floor(n()*(o-i+1));return Math.max(1,Math.min(s,r.members))}var Vm=1.1;function Hm(e){return Math.max(0,e)/100/1}function Um(e,t){return Hm(t)/Math.max(1e-6,e)}function Wm(e){return Math.max(0,Math.min(80,e))}function Gm(e,t){return Math.max(1,t/(2.2*e))}function Km(e){return Math.max(.5,e-.35)}function qm(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Yo,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Jm(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Jm(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function Jm(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Po(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var Ym=new Map;function Xm(e,t={}){let n=`${new G(e).getHexString()}|${t.rough??.85}|${t.emissive??``}|${t.opacity??1}|${t.side??0}|${t.flat??!0}`,r=Ym.get(n);return r||(r=new lu({color:e,roughness:t.rough??.85,metalness:0,flatShading:t.flat??!0,emissive:t.emissive??0,transparent:t.transparent??(t.opacity??1)<1,opacity:t.opacity??1,side:t.side??0}),Ym.set(n,r)),r}function Zm(e,t,n){let r=Math.sin(e*12.9898+t*78.233+n*37.719)*43758.5453;return r-Math.floor(r)}function Qm(e,t,n=0,r=!0){let i=e.getAttribute(`position`),a=new U;for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e);let o=Math.round(a.x*1e3)/1e3,s=Math.round(a.y*1e3)/1e3,c=Math.round(a.z*1e3)/1e3,l=Zm(o+n,s-n*.37,c+n*.71)-.5;if(r){let e=a.length()||1;a.multiplyScalar((e+l*t)/e)}else a.x+=(Zm(o,s,c+n)-.5)*t,a.y+=l*t,a.z+=(Zm(c,o,s+n)-.5)*t;i.setXYZ(e,a.x,a.y,a.z)}return i.needsUpdate=!0,e.computeVertexNormals(),e}function $m(e,t,n,r,i=6){let a=new U().subVectors(t,e),o=a.length(),s=new Dc(r,n,o,i,1,!1);s.translate(0,o/2,0);let c=new Ji().setFromUnitVectors(new U(0,1,0),a.normalize());return s.applyQuaternion(c),s.translate(e.x,e.y,e.z),s}function eh(e,t){let n=e.getAttribute(`position`),r=new Float32Array(n.count*3);for(let e=0;e<n.count;e++){let i=typeof t==`function`?t(n.getY(e),e):t;r[e*3]=i.r,r[e*3+1]=i.g,r[e*3+2]=i.b}return e.setAttribute(`color`,new Po(r,3)),e}function th(e,t=!1){let n=e.map(e=>{let n=e.index?e.toNonIndexed():e;return n!==e&&e.dispose(),n.deleteAttribute(`uv`),t?n.getAttribute(`color`)||eh(n,new G(1,1,1)):n.deleteAttribute(`color`),n}),r=n.length?qm(n,!1):new Yo;return n.forEach(e=>e.dispose()),r??new Yo}function nh(e){e.traverse(e=>{let t=e;t.geometry&&t.geometry.dispose()})}function rh(e,t,n,r=1){let i=new Gl(1,r);return i.scale(e,t,n),i}function ih(e){return 7*(1+.035*Math.sin(e*3+.6)+.025*Math.sin(e*7+1.9))}function ah(){let e=document.createElement(`canvas`);e.width=64,e.height=128;let t=e.getContext(`2d`);t.fillStyle=`#5bb6dc`,t.fillRect(0,0,64,128);for(let e=0;e<26;e++){t.fillStyle=`rgba(255,255,255,${.12+e%3*.08})`;let n=e*23%64,r=e*41%128;t.fillRect(n,r,10+e%4*5,2)}let n=new xc(e);return n.wrapS=n.wrapT=Fn,n.colorSpace=ri,n}var oh=[new U(2.6,.03,-2.4),new U(3.5,.03,-.6),new U(3.9,.03,1.4),new U(4.4,.03,3.3),new U(4.75,.03,5.05)];function sh(e,t,n){for(let r=0;r<oh.length-1;r++){let i=oh[r],a=oh[r+1],o=a.x-i.x,s=a.z-i.z,c=Math.max(0,Math.min(1,((e-i.x)*o+(t-i.z)*s)/(o*o+s*s))),l=i.x+o*c-e,u=i.z+s*c-t;if(l*l+u*u<n*n)return!0}return!1}function ch(){let e=rt(20260925),t=new Ga,n=new Dc(7,7,.5,40,3),r=n.getAttribute(`position`);for(let e=0;e<r.count;e++){let t=r.getX(e),n=r.getZ(e),i=r.getY(e),a=Math.hypot(t,n);if(a>.01){let i=ih(Math.atan2(n,t))/7;r.setX(e,t*i),r.setZ(e,n*i)}let o=i>0?.18*(1-Math.min(1,a/7)**2):0;r.setY(e,i-.25+o)}n.computeVertexNormals();let i=new K(n,Xm(`#7cbd4f`,{rough:.95}));i.receiveShadow=!0,t.add(i);let a=new Dc(7,6.3,.9,30,2);Qm(a,.35,3,!1);let o=new K(a,Xm(`#8a6446`));o.position.y=-.9,t.add(o);let s=new Oc(6.44,7*1.35,16,4);s.rotateX(Math.PI),Qm(s,.9,7,!1),eh(s,e=>new G().lerpColors(new G(`#6d6a66`),new G(`#8f7155`),qi.clamp((e+6)/6,0,1)));let c=new K(s,new lu({vertexColors:!0,flatShading:!0,roughness:.95}));c.position.y=-1.35-7*1.35/2,t.add(c);let l=new K(new Ec(1.1,18),Xm(`#8c6a48`));l.rotation.x=-Math.PI/2,l.position.y=.185,l.receiveShadow=!0,t.add(l);let u=ah(),d=new Bc(oh),f=[],p=[],m=[];for(let e=0;e<=40;e++){let t=e/40,n=d.getPoint(t),r=d.getTangent(t),i=new U(-r.z,0,r.x).normalize(),a=.32+.12*Math.sin(t*9),o=.02+.18*(1-Math.min(1,Math.hypot(n.x,n.z)/7)**2);if(f.push(n.x+i.x*a,o,n.z+i.z*a,n.x-i.x*a,o,n.z-i.z*a),p.push(0,t*6,1,t*6),e<40){let t=e*2;m.push(t,t+1,t+2,t+1,t+3,t+2)}}let h=new Yo;h.setAttribute(`position`,new Lo(f,3)),h.setAttribute(`uv`,new Lo(p,2)),h.setIndex(m),h.computeVertexNormals();let g=new K(h,new lu({map:u,roughness:.25,metalness:.05,emissive:`#1d5f80`,emissiveIntensity:.25}));g.receiveShadow=!0,t.add(g);let _=new K(new Ql(d,30,.1,4,!1),Xm(`#9aa0a3`));_.scale.set(1,.4,1),_.position.y=.1;let v=oh[oh.length-1],y=u.clone();y.needsUpdate=!0;let b=new K(new Kl(.7,5,1,4),new lu({map:y,transparent:!0,opacity:.8,roughness:.3,side:2,emissive:`#2a7aa0`,emissiveIntensity:.3}));b.position.set(v.x+.05,-2.45,v.z+.08),b.rotation.y=-Math.atan2(v.x,v.z)+Math.PI/2-Math.PI/2,t.add(b);let x=new K(rh(.5,.25,.5,0),Xm(`#e8f6fb`,{opacity:.6}));x.position.set(v.x,-4.9,v.z),t.add(x);let S=new Ga,C=new Tc(.28,.06,1.3);for(let e=0;e<6;e++){let t=new K(C,Xm(e%2?`#a0714a`:`#b07f55`)),n=(e-2.5)/2.5;t.position.set(e*.3-.75,.32+.12*(1-n*n),0),t.castShadow=!0,t.receiveShadow=!0,S.add(t)}for(let e of[-.62,.62]){let t=new K(new Tc(1.9,.06,.06),Xm(`#7d5535`));t.position.set(0,.66,e),S.add(t);for(let t of[-.85,0,.85]){let n=new K(new Tc(.07,.42,.07),Xm(`#7d5535`));n.position.set(t,.47,e),n.castShadow=!0,S.add(n)}}let w=d.getPoint(.8),T=d.getTangent(.8);S.position.set(w.x,0,w.z),S.rotation.y=-Math.atan2(T.z,T.x)+Math.PI/2,t.add(S);let E=1.2,D=E+Math.PI*1.55,O=[[2.9,-2.9,.75],[2.1,-2.6,.45],[3.4,-2.1,.5],[5.2,1.9,.6],[5.5,2.8,.4],[-4.6,2.6,.55],[-3.9,3.4,.35],[-5.3,-1.2,.5],[-1.6,-5.2,.6],[.8,-5.6,.4],[1.8,4.4,.3],[-2.4,4.8,.45]],k=[];O.forEach(([e,t,n],r)=>{let i=new Ac(n,0);Qm(i,n*.35,r*3.1,!1),i.scale(1,.7,1),i.rotateY(r);let a=.18*(1-Math.min(1,Math.hypot(e,t)/7)**2);i.translate(e,a+n*.25,t),eh(i,new G().setHSL(.08,.04,.55+r%3*.06)),k.push(i)});let A=new K(th(k,!0),new lu({vertexColors:!0,flatShading:!0,roughness:.9}));A.castShadow=!0,A.receiveShadow=!0,t.add(A);let j=[];for(let t=0;t<6;t++){let n=t/5,r=1.2+(w.x-1.5-1.2)*n,i=1+(w.z-1)*n,a=new Dc(.22+e()*.08,.26,.06,7),o=.18*(1-Math.min(1,Math.hypot(r,i)/7)**2);a.translate(r+(e()-.5)*.3,o+.02,i+(e()-.5)*.3),j.push(a)}let ee=new K(th(j),Xm(`#c9c2b4`));ee.receiveShadow=!0,t.add(ee);let M=new Oc(.045,.16,3);M.translate(0,.08,0);let te=new Ys(M,new lu({flatShading:!0,roughness:.9}),480),N=new Ys(new Gl(.07,0),new lu({flatShading:!0,roughness:.7}),120),ne=[`#ffffff`,`#fff6d8`,`#f7b7c8`,`#f3d35b`,`#c9b3f0`,`#ffffff`],re=new _a,ie=new Ji,ae=new G,oe=0,se=0;for(let t=0;t<4e3&&(oe<480||se<120);t++){let t=e()*Math.PI*2,n=Math.sqrt(e())*6.4,r=Math.cos(t)*n,i=Math.sin(t)*n;if(n<1.2||sh(r,i,.55))continue;let a=.18*(1-Math.min(1,n/7)**2);if(oe<480&&e()<.75){ie.setFromEuler(new Da((e()-.5)*.4,e()*6,(e()-.5)*.4));let t=.6+e()*.9;re.compose(new U(r,a,i),ie,new U(t,t*(.8+e()*.6),t)),te.setMatrixAt(oe,re),te.setColorAt(oe,ae.setHSL(.24+e()*.06,.5,.36+e()*.14)),oe++}else if(se<120){let t=.7+e()*.8;re.compose(new U(r,a+.12,i),ie.identity(),new U(t,t*.7,t)),N.setMatrixAt(se,re),N.setColorAt(se,ae.set(ne[Math.floor(e()*ne.length)])),se++}}te.count=oe,N.count=se,te.receiveShadow=!0,t.add(te,N);let ce=[];for(let t=0;t<14;t++){let n=E+e()*(D-E),r=ih(n)-.9-e()*.5,i=Math.cos(n)*r,a=Math.sin(n)*r;if(sh(i,a,.8))continue;let o=.35+e()*.35,s=new Gl(o,1);Qm(s,o*.3,t,!0),s.scale(1,.75,1);let c=.18*(1-Math.min(1,r/7)**2);s.translate(i,c+o*.5,a),eh(s,e=>new G().setHSL(.27,.45,.3+(e-c)*.25)),ce.push(s)}let P=new K(th(ce,!0),new lu({vertexColors:!0,flatShading:!0,roughness:.9}));return P.castShadow=!0,P.receiveShadow=!0,t.add(P),{group:t,water:u,dirt:l,setExtended(e){o.visible=!e,c.visible=!e,b.visible=!e,x.visible=!e},update(e,t){u.offset.y=-e*.25,y.offset.y=e*.9,x.scale.setScalar(1+Math.sin(e*5)*.06)}}}function lh(e){return 1+.035*Math.sin(e*3+.6)+.025*Math.sin(e*7+1.9)}var uh=1.25;function dh(e,t){let n=rt(4242+Math.round(e*10)),r=new Ga;r.name=`fence`;let i=Km(e),a=Vm,o=new Tc(.12,a,.12);o.translate(0,a/2,0);let s=new Tc(1,.08,.05),c=Math.min(.5,1.6/i),l=Math.PI*2*i,u=Math.max(24,Math.round(l/2)),d=[],f=[],p=null,m=null,h=new Ji,g=new Da;for(let e=0;e<=u;e++){let r=uh+c/2+(Math.PI*2-c)*e/u,o=i*lh(r)-.1,s=new U(Math.cos(r)*o,0,Math.sin(r)*o);s.y=t(s.x,s.z);let l=e===0||e===u;if(h.setFromEuler(g.set(0,-r,(n()-.5)*.06)),d.push(new _a().compose(s.clone().setY(s.y-.05),h,new U(l?1.4:1,l?1.25:.92+n()*.14,l?1.4:1))),p){let e=p.clone().add(s).multiplyScalar(.5),t=p.distanceTo(s),n=-Math.atan2(s.z-p.z,s.x-p.x);for(let r of[a*.38,a*.78])f.push(new _a().compose(new U(e.x,e.y+r,e.z),new Ji().setFromEuler(new Da(0,n,0)),new U(t,1,1)))}m||=s,p=s}let _=new Ys(o,Xm(`#9b6b43`),d.length);d.forEach((e,t)=>_.setMatrixAt(t,e)),_.castShadow=!0;let v=new Ys(s,Xm(`#b0815a`),f.length);if(f.forEach((e,t)=>v.setMatrixAt(t,e)),v.castShadow=!0,r.add(_,v),m&&p){let e=m.clone().add(p).multiplyScalar(.5),t=new K(new Tc(m.distanceTo(p)+.3,.1,.1),Xm(`#7d5535`));t.position.set(e.x,Math.max(m.y,p.y)+a*1.25,e.z),t.rotation.y=-Math.atan2(p.z-m.z,p.x-m.x),t.castShadow=!0,r.add(t)}return{group:r,radius:e,dispose(){o.dispose(),s.dispose(),r.traverse(e=>e.isMesh&&e.geometry!==o&&e.geometry.dispose())}}}var fh={solid:new lu({vertexColors:!0,flatShading:!0,roughness:.78}),double:new lu({vertexColors:!0,flatShading:!0,roughness:.7,side:2}),glass:new lu({vertexColors:!0,roughness:.2,transparent:!0,opacity:.5,side:2,depthWrite:!1}),glow:new lu({color:`#f6ff9a`,emissive:`#e4ff5a`,emissiveIntensity:1.6})},ph=class{parts=new Map;part(e,t=[0,0,0],n=`solid`,r){return this.parts.has(e)||this.parts.set(e,{geos:[],pivot:t,mat:n,parent:r}),this}add(e,t,n,r=[0,0,0],i=[0,0,0]){this.parts.has(e)||this.part(e);let a=t.index?t.toNonIndexed():t;a.deleteAttribute(`uv`),a.deleteAttribute(`normal`),a.rotateX(i[0]),a.rotateY(i[1]),a.rotateZ(i[2]),a.translate(r[0],r[1],r[2]);let o=new G(n),s=a.getAttribute(`position`).count,c=new Float32Array(s*3);for(let e=0;e<s;e++)c.set([o.r,o.g,o.b],e*3);return a.setAttribute(`color`,new Po(c,3)),this.parts.get(e).geos.push(a),this}build(e={}){let t=new Ga,n=new Map;for(let[e,t]of this.parts){let r;if(t.geos.length){let e=mh(t.geos);e.translate(-t.pivot[0],-t.pivot[1],-t.pivot[2]),e.computeVertexNormals(),r=new K(e,fh[t.mat])}else r=new Ga;r.name=e,n.set(e,r)}for(let[e,r]of this.parts){let i=n.get(e),a=r.parent?n.get(r.parent):void 0,o=r.parent?this.parts.get(r.parent).pivot:[0,0,0];i.position.set(r.pivot[0]-o[0],r.pivot[1]-o[1],r.pivot[2]-o[2]),(a??t).add(i)}return t.userData={...e},t}};function mh(e){let t=0;for(let n of e)t+=n.getAttribute(`position`).count;let n=new Float32Array(t*3),r=new Float32Array(t*3),i=0;for(let t of e){let e=t.getAttribute(`position`).array,a=t.getAttribute(`color`).array;n.set(e,i*3),r.set(a,i*3),i+=t.getAttribute(`position`).count,t.dispose()}let a=new Yo;return a.setAttribute(`position`,new Po(n,3)),a.setAttribute(`color`,new Po(r,3)),a}var J=(e,t,n,r=1)=>rh(e,t,n,r),Y=(e,t)=>!!e.f?.includes(t),hh=(e,t,n,r=6)=>new Dc(e,t,n,r);function gh(e,t,n,r,i,a,o,s=6){let c=r[0]-n[0],l=r[1]-n[1],u=r[2]-n[2],d=hh(a,i,Math.hypot(c,l,u),s),f=new Ji().setFromUnitVectors(new U(0,1,0),new U(c,l,u).normalize());d.applyQuaternion(f),e.add(t,d,o,[(n[0]+r[0])/2,(n[1]+r[1])/2,(n[2]+r[2])/2])}function _h(e,t,n=4){let r=new Jl(e,n);return r.rotateX(t>0?Math.PI/2:-Math.PI/2),r}function vh(e,t,n,r,i,a,o,s,c,l=1.5){let[u,d,f]=r,p=i*.5;e.part(t,r,`solid`,n),e.add(t,J(a*l,p*.62,a*l*.8),o,[u,d-p*.3,f]),gh(e,t,[u,d,f],[u,d-p,f],a*1.05,a*.8,o,5);let m=`${t}2`;e.part(m,[u,d-p,f],`solid`,t),e.add(m,J(a*.85,a*.85,a*.85,0),o,[u,d-p,f]),gh(e,m,[u,d-p,f],[u,.04,f],a*.78,a*.55,o,5),s===`hoof`?e.add(m,hh(a*.6,a*.75,.06,6),c,[u,.03,f]):s===`paw`?e.add(m,J(a*1.25,a*.6,a*.95),c,[u+a*.5,a*.55,f]):e.add(m,J(a*1.3,a*.55,a*1),c,[u+a*.6,a*.5,f])}function yh(e,t,n,r,i,a,o,s,c,l,u=0){let d=[...n],f=s,p=t;for(let t=0;t<r;t++){let n=t===0?`tail`:`tail${t+1}`;e.part(n,d,`solid`,p);let s=[d[0]-Math.cos(f)*i,d[1]+Math.sin(f)*i,d[2]],m=a+(o-a)*(t/r),h=a+(o-a)*((t+1)/r);if(u>0){let a=u*(.75+.5*Math.sin(t/Math.max(1,r-1)*Math.PI));e.add(n,J(i*.7,a,a*.8),l(t),[(d[0]+s[0])/2,(d[1]+s[1])/2,d[2]],[0,0,-f])}else gh(e,n,d,s,m,h,l(t),5),e.add(n,J(m,m,m,0),l(t),d);p=n,d=s,f+=c}}function bh(e){let[t,n,r,i,a,o=`#ffffff`]=e.c,s=new ph,c=Y(e,`longLegs`),l=c?.6:.14,u=l+.2,d=c?.05:.22,f=c?`#2a2a2a`:`#7a5b3a`;s.part(`body`),s.add(`body`,J(.29,.22,.21),t,[.04,u,0],[0,0,d]),s.add(`body`,new Oc(.17,.4,8),t,[-.26,u+.05+d*.25,0],[0,0,Math.PI/2+d]),s.add(`body`,J(.23,.16,.17),n,[.09,u-.07,0],[0,0,d]);for(let[e,t]of[[`legL`,1],[`legR`,-1]]){s.part(e,[.02,l+.02,t*.07],`solid`),s.add(e,J(.05,.06,.045),n,[.02,l+.05,t*.07]),gh(s,e,[.02,l+.03,t*.07],[.03,.012,t*.07],.016,.012,f,4);for(let n of[-.45,0,.45])s.add(e,new Tc(c?.14:.09,.012,.018),f,[.07,.008,t*.07+Math.sin(n)*.03],[0,n,0]);s.add(e,new Tc(.06,.012,.016),f,[-.02,.008,t*.07])}let p=Y(e,`veryLongTail`)?.95:Y(e,`longTail`)?.5:.28,m=Y(e,`cocked`)?.6:-.3;s.part(`tail`,[-.4,u+.07,0]);let h=new sl,g=Y(e,`veryLongTail`)?.07:.1;h.moveTo(0,-.05),Y(e,`forkTail`)?(h.lineTo(-p,-g*1.3),h.lineTo(-p*.7,0),h.lineTo(-p,g*1.3)):(h.lineTo(-p*.92,-g),h.quadraticCurveTo(-p*1.05,0,-p*.92,g)),h.lineTo(0,.05),s.add(`tail`,_h(h,1),Y(e,`veryLongTail`)?o:a,[-.38,u+.07,0],[0,0,-m*.7]);let _=Y(e,`longNeck`),v=_?u+.52:u+.24,y=_?.36:.28;s.part(`head`,_?[.2,u+.12,0]:[y-.06,v-.1,0]),_&&(gh(s,`head`,[.2,u+.1,0],[.26,u+.32,0],.07,.05,t),gh(s,`head`,[.26,u+.32,0],[y-.02,v-.05,0],.05,.045,t)),s.add(`head`,J(.15,.14,.14),r,[y,v,0]);let b=Y(e,`longBeak`)?.34:Y(e,`spoon`)?.4:(Y(e,`thickBeak`),.13),x=Y(e,`thickBeak`)?.07:Y(e,`hooked`)?.06:.035;s.add(`head`,new Oc(x,b,5),i,[y+.12+b/2-.05,v-(Y(e,`hooked`)?.035:.02),0],[0,0,-Math.PI/2-(Y(e,`hooked`)?.35:.05)]),Y(e,`spoon`)&&s.add(`head`,J(.07,.015,.06,0),i,[y+.12+b-.04,v-.03,0]);for(let t of[-1,1])Y(e,`eyering`)&&s.add(`head`,J(.042,.042,.02,0),`#ffffff`,[y+.07,v+.035,t*.12]),Y(e,`mask`)&&s.add(`head`,J(.09,.035,.02,0),`#1a1a1a`,[y+.05,v+.03,t*.125]),s.add(`head`,new Gl(.027,0),Y(e,`redEye`)?`#c8302a`:`#111111`,[y+.08,v+.035,t*.125]),s.add(`head`,new Gl(.009,0),`#ffffff`,[y+.1,v+.05,t*.14]),Y(e,`cheek`)&&s.add(`head`,J(.055,.04,.02,0),o,[y+.03,v-.04,t*.13]);if(Y(e,`crest`)){let t=Y(e,`bigCrest`)?3:1;for(let n=0;n<t;n++)s.add(`head`,new Oc(.045,Y(e,`bigCrest`)?.28:.15,4),Y(e,`bigCrest`)||r===`#ffffff`?o:r,[y-.06-n*.03,v+.15+n*.02,0],[0,0,.5+n*.25])}Y(e,`cap`)&&s.add(`head`,J(.11,.06,.11,0),o,[y-.02,v+.1,0]),Y(e,`collar`)&&s.add(`body`,new Zl(.11,.03,4,10),o,[y-.1,v-.15,0],[0,Math.PI/2,.4]);let S=Y(e,`soar`),C=S?.8:c?.62:.44,w=S?.34:.28;for(let[n,r]of[[`wingL`,1],[`wingR`,-1]]){let i=[.04,u+.1,r*.14];s.part(n,i,`double`);let c=new sl;c.moveTo(w*.45,0),c.quadraticCurveTo(w*.55,C*.25,w*.35,C*.5),c.lineTo(-w*.5,C*.5),c.quadraticCurveTo(-w*.62,C*.2,-w*.5,0),s.add(n,_h(c,r),a,i);let l=new sl;l.moveTo(w*.44,.01),l.quadraticCurveTo(w*.5,C*.25,w*.33,C*.48),l.lineTo(0,C*.46),l.lineTo(-.02,.01),s.add(n,_h(l,r),t,[i[0],i[1]+.004,i[2]]);let d=`${n}2`,f=[i[0],i[1],r*(.14+C*.5)];s.part(d,f,`double`,n);let p=new sl;if(p.moveTo(w*.35,0),S){p.quadraticCurveTo(w*.3,C*.3,w*.1,C*.45);for(let e=0;e<4;e++){let t=w*(.05-e*.12);p.lineTo(t,C*(.56-e*.02)),p.lineTo(t-w*.07,C*(.44-e*.03))}p.lineTo(-w*.5,C*.12)}else Y(e,`forkTail`)?(p.quadraticCurveTo(w*.2,C*.35,-w*.6,C*.7),p.quadraticCurveTo(-w*.4,C*.3,-w*.5,0)):(p.quadraticCurveTo(w*.3,C*.35,0,C*.55),p.quadraticCurveTo(-w*.35,C*.45,-w*.5,C*.18));if(p.lineTo(-w*.5,0),s.add(d,_h(p,r),a,f),Y(e,`wingpatch`)&&s.add(d,J(.06,.012,.07,0),o===`#111111`?`#ffffff`:o,[f[0]-.02,f[1]+.01,f[2]+r*C*.15]),Y(e,`barred`))for(let e=0;e<3;e++)s.add(d,new Tc(.025,.01,C*.4),`#f2f2f2`,[f[0]-.08+e*.06,f[1]+.01,f[2]+r*C*.2])}return s.build({rig:`bird`,legLen:l})}function xh(e){let[t,n,r]=e.c,i=new ph;i.add(`body`,J(.3,.4,.28),t,[0,.4,0]),i.add(`body`,J(.24,.2,.08),n,[.22,.6,0],[0,Math.PI/2,0]);for(let e of[-1,1])i.add(`body`,new Gl(.07,1),r,[.29,.63,e*.1]),i.add(`body`,new Gl(.035,0),`#111111`,[.35,.63,e*.1]),i.add(`body`,new Oc(.06,.16,4),`#6e5842`,[.05,.86,e*.15]);return i.build()}function Sh(){let e=new ph;e.add(`body`,new Dc(.42,.26,.2,9,1,!0),`#8a6440`,[0,.1,0]),e.add(`body`,new Zl(.4,.08,4,10),`#a07448`,[0,.2,0],[Math.PI/2,0,0]),e.add(`body`,new Ec(.3,9),`#6d4e31`,[0,.05,0],[-Math.PI/2,0,0]);for(let t=0;t<3;t++){let n=t*2.1;e.add(`body`,J(.1,.13,.1),`#9fd3e6`,[Math.cos(n)*.13,.15,Math.sin(n)*.13],[0,0,.3*(t-1)])}let t=e.build();return t.children.forEach(e=>e.material=fh.double),t}function Ch(e){let[t,n,r,i]=e.c,a=new ph,o=Y(e,`stocky`),s=Y(e,`catEars`),c=Y(e,`cowTail`),l=Y(e,`antlers`),u=Y(e,`tusks`),d=Y(e,`short`),f=Y(e,`longLegs`)?c?.5:.56:d?.2:s?.34:.3,p=s?[.44,.17,.14]:l?[.42,.19,.15]:[.46,o?.27:.2,o?.25:.17],m=f+p[1]*.72,h=[-p[0]*.55,m,0];if(a.part(`torso`,h),a.part(`body`,[0,0,0],`solid`,`torso`),a.add(`body`,J(p[0]*.62,p[1]*1.02,p[2]),t,[-p[0]*.36,m,0]),a.add(`body`,J(p[0]*.64,p[1]*1.06,p[2]*1.04),t,[p[0]*.3,m+p[1]*.04,0]),a.add(`body`,J(p[0]*.8,p[1]*.55,p[2]*.85),n,[.02,m-p[1]*.42,0]),c&&a.add(`body`,J(p[0]*.35,p[1]*.5,p[2]*.7),t,[p[0]*.45,m+p[1]*.75,0]),Y(e,`spots`))for(let e=0;e<14;e++)a.add(`body`,J(.045,.032,.012,0),i,[-.34+e%7*.11,m+(e<7?.08:-.03),(e%2?1:-1)*p[2]*.95]);if(Y(e,`scales`))for(let e=0;e<24;e++){let n=-.42+e%8*.12,r=Math.floor(e/8);a.add(`body`,J(.09,.03,.11,0),e%2?i:t,[n,m+p[1]*(.85-r*.3),(r-1)*p[2]*.75],[(r-1)*.6,0,.3])}if(Y(e,`spines`))for(let e=0;e<22;e++){let t=-.45+e%11*.075,n=(e<11?1:-1)*.09;a.add(`body`,new Oc(.025,.48,3),e%2?i:`#1a1a1a`,[t-.12,m+p[1]*.9+.1,n],[n*4,0,1.15])}Y(e,`bristle`)&&a.add(`body`,new Tc(.7,.08,.05),`#2a221c`,[0,m+p[1]*.98,0]);let g=l?1:c?.35:u?.12:s?.75:d?.25:.5,_=l?.34:c?.22:u?.12:s?.17:.15,v=[p[0]*.62,m+p[1]*.35,0],y=[v[0]+Math.cos(g)*_,v[1]+Math.sin(g)*_,0];a.part(`neck`,v,`solid`,`torso`),gh(a,`neck`,v,y,p[2]*.75,p[2]*(c||u?.75:.55),t,7),c&&a.add(`neck`,J(.1,.14,.08),n,[v[0]+.06,v[1]-.15,0]),a.part(`head`,y,`solid`,`neck`);let b=c?1.25:u?1.15:l?.9:s?.85:.8,x=y[0]+.06*b,S=y[1]+(c||u?-.02:.02);a.add(`head`,J(.14*b,.12*b,.11*b),r,[x,S,0]);let C=(Y(e,`snout`)?.16:s?.05:c?.13:l?.12:.08)*b,w=[x+.1*b+C*.5,S-.04*b,0];if(a.add(`head`,J(C*.75+.03,.065*b,.07*b),Y(e,`mask`)||Y(e,`blaze`)?i:r,w,[0,0,-.12]),a.add(`head`,J(.03*b,.028*b,.05*b,0),u?`#c89a8a`:`#1a1a1a`,[w[0]+C*.55+.02,w[1]+.005,0]),Y(e,`blaze`)&&a.add(`head`,new Tc(.24*b,.028,.04),`#f2eee6`,[x+.05,S+.09*b,0],[0,0,-.15]),Y(e,`mask`))for(let e of[-1,1])a.add(`head`,J(.07,.028,.02,0),`#f2eee6`,[x+.02,S+.055*b,e*.09*b]);for(let t of[-1,1]){let n=x+.085*b;a.add(`head`,new Gl(.024*b,0),`#111111`,[n,S+.035*b,t*.075*b]),a.add(`head`,new Gl(.008*b,0),`#ffffff`,[n+.012,S+.045*b,t*.088*b]),s?a.add(`head`,new Oc(.045,.1,3),r,[x-.03,S+.12*b,t*.065],[t*.2,0,0]):c?a.add(`head`,J(.08,.03,.045),r,[x-.04,S+.06,t*.16],[t*.3,0,0]):a.add(`head`,new Oc(.04*b,.11*b,5),r,[x-.05*b,S+.11*b,t*.08*b],[t*.5,0,.1]),l&&(gh(a,`head`,[x-.03,S+.1,t*.04],[x-.06,S+.26,t*.07],.016,.01,`#5b4331`,4),gh(a,`head`,[x-.06,S+.26,t*.07],[x+0,S+.3,t*.06],.01,.006,`#5b4331`,4)),Y(e,`horns`)&&(gh(a,`head`,[x-.03,S+.1,t*.09],[x-.02,S+.14,t*.2],.03,.022,i,5),gh(a,`head`,[x-.02,S+.14,t*.2],[x+.02,S+.24,t*.22],.022,.006,i,5)),Y(e,`bigHorns`)&&(gh(a,`head`,[x-.04,S+.1,t*.08],[x-.12,S+.14,t*.3],.045,.035,i,5),gh(a,`head`,[x-.12,S+.14,t*.3],[x-.26,S+.22,t*.36],.035,.008,i,5)),Y(e,`tusks`)&&a.add(`head`,new Oc(.014,.08,3),`#f2eee0`,[w[0]+.02,w[1]+.02,t*.06],[0,0,-.4])}let T=c||l||u,E=c?.055:o?.05:l?.028:.036,D=p[0]*.58,O=p[2]*.62,k=m-p[1]*.25,A=Y(e,`short`)||Y(e,`mask`)?i===`#f2eee6`?t:r:t;for(let[e,n,r]of[[`legFL`,D,O],[`legFR`,D,-O],[`legBL`,-D,O],[`legBR`,-D,-O]])vh(a,e,`torso`,[n,k,r],k,E,n<0?t:A,T?`hoof`:`paw`,T?`#2a2420`:A,n<0?1.9:1.5);let j=[-p[0]*.95,m+p[1]*.35,0];if(Y(e,`longTail`)){let n=Y(e,`scales`),r=n?.09:s?.03:.045;yh(a,`torso`,j,4,n?.14:.13,r,n?.03:r*.7,n?-.25:s?.15:-.35,s?.25:.12,n=>Y(e,`ringTail`)&&n%2?i:t)}else c?(yh(a,`torso`,[j[0],j[1]+.03,0],2,.22,.02,.014,-1.35,.05,()=>t),a.add(`tail2`,J(.035,.08,.035,0),`#1a1a1a`,[j[0]-.06,j[1]-.43,0])):u?yh(a,`torso`,j,2,.07,.015,.01,-.9,1.2,()=>t):yh(a,`torso`,j,1,.08,.05,.04,.2,0,()=>l?`#f2eee6`:n,.06);let ee=+!!s;return a.build({rig:`quad`,legLen:k,hipY:m,sit:ee,neckAng:g})}function wh(e){let[t,n,r]=e.c,i=new ph,a=new G(t).multiplyScalar(.72).getStyle(),o=.4,s=[-.16,o,0];i.part(`torso`,s),i.part(`body`,[0,0,0],`solid`,`torso`),i.add(`body`,J(.2,.17,.15),t,[.1,.49,0],[0,0,.18]),i.add(`body`,J(.2,.14,.13),t,[-.12,.44,0],[0,0,.1]),i.add(`body`,J(.16,.1,.11),n,[.02,.38,0]),i.add(`body`,J(.05,.06,.08),`#d98b86`,[-.3,.4,0]),i.part(`head`,[.28,.56,0],`solid`,`torso`),i.add(`head`,J(.12,.12,.12),t,[.36,.63,0]),i.add(`head`,J(.06,.1,.09),r,[.44,.61,0]),i.add(`head`,J(.055,.045,.06),r,[.48,.565,0]),i.add(`head`,new Tc(.05,.025,.15),a,[.46,.665,0]),i.add(`head`,J(.09,.04,.1),t,[.35,.72,0]);for(let e of[-1,1])i.add(`head`,new Gl(.018,0),`#2a1a12`,[.495,.635,e*.035]),i.add(`head`,new Gl(.008,0),`#3a2418`,[.53,.575,e*.014]),i.add(`head`,J(.025,.04,.02),r,[.36,.64,e*.125]);for(let[e,n,s,c]of[[`legFL`,.2,.1,.5],[`legFR`,.2,-.1,.5],[`legBL`,-.22,.09,o],[`legBR`,-.22,-.09,o]]){let l=n>0;vh(i,e,`torso`,[n,l?.5:o,s],c,l?.034:.04,t,`hand`,l?r:a,l?1.3:2.1)}return yh(i,`torso`,[-.32,.46,0],3,.1,.03,.018,.9,-.75,()=>t),i.build({rig:`monkey`,legLen:o,hipY:o})}function Th(e){let[t,n,r]=e.c,i=new ph;i.part(`torso`,[-.12,.2,0]),i.part(`body`,[0,0,0],`solid`,`torso`),i.add(`body`,J(.2,.13,.12),t,[0,.24,0],[0,0,.3]),i.add(`body`,J(.14,.09,.1),n,[.05,.2,0],[0,0,.3]),i.add(`body`,J(.12,.11,.12),t,[-.12,.2,0]),i.part(`head`,[.16,.3,0],`solid`,`torso`),i.add(`head`,J(.11,.095,.09),t,[.24,.36,0]),i.add(`head`,J(.05,.045,.05),t,[.33,.34,0]),i.add(`head`,new Gl(.012,0),`#2a1a12`,[.38,.35,0]);for(let e of[-1,1])i.add(`head`,new Oc(.03,.08,4),t,[.21,.46,e*.05]),i.add(`head`,new Gl(.022,0),`#111111`,[.3,.385,e*.06]),i.add(`head`,new Gl(.007,0),`#ffffff`,[.31,.395,e*.075]);for(let[e,r,a,o]of[[`legFL`,.12,.06,.2],[`legFR`,.12,-.06,.2],[`legBL`,-.12,.07,.2],[`legBR`,-.12,-.07,.2]])vh(i,e,`torso`,[r,o,a],o,.022,r>0?n:t,`paw`,t,r>0?1.4:3);return yh(i,`torso`,[-.22,.22,0],4,.12,.05,.05,1.15,.42,e=>e%2?r:t,.085),i.build({rig:`squirrel`,legLen:.2,hipY:.2})}function Eh(e){let[t,n,r]=e.c,i=new ph;i.add(`body`,J(.2,.12,.12),t,[0,.2,0]),i.add(`body`,J(.1,.09,.09),r,[.2,.24,0]);for(let e of[-1,1])i.add(`body`,new Oc(.035,.1,3),r,[.18,.34,e*.05]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]]){i.part(e,[0,.22,t*.08],`double`);let r=new sl;r.moveTo(0,0),r.lineTo(.18,.45),r.lineTo(.02,.36),r.lineTo(-.02,.5),r.lineTo(-.12,.34),r.lineTo(-.2,.05);let a=new Jl(r);a.rotateX(t>0?Math.PI/2:-Math.PI/2),i.add(e,a,n,[0,.22,t*.08])}return i.build()}function Dh(e){let[t,n,r,i]=e.c,a=Y(e,`moth`),o=new ph,s=.03;o.part(`body`),o.add(`body`,J(.07,.035,.035),r,[.04,s,0]),o.add(`body`,J(.14,.028,.028),r,[-.13,.024999999999999998,0]),o.add(`body`,new Gl(.03,0),r,[.13,.034999999999999996,0]);for(let e of[-1,1])gh(o,`body`,[.14,.05,e*.01],[.28,.13,e*.07],.004,.004,r,3),o.add(`body`,a?J(.03,.006,.02,0):new Gl(.012,0),r,[.28,.13,e*.07]);let c=a?1.25:1;for(let[r,l]of[[`wingL`,1],[`wingR`,-1]]){o.part(r,[0,s,l*.02],`double`);let u=new sl;u.moveTo(.06*c,0),u.bezierCurveTo(.16*c,.06*c,.26*c,.22*c,.2*c,.34*c),u.quadraticCurveTo(.06*c,.33*c,-.03*c,.1*c),u.lineTo(-.03*c,0),o.add(r,_h(u,l,6),t,[0,s,l*.02]);let d=new sl;d.moveTo(.15*c,.2*c),d.quadraticCurveTo(.24*c,.28*c,.19*c,.33*c),d.quadraticCurveTo(.1*c,.31*c,.08*c,.22*c),o.add(r,_h(d,l,4),a?i??`#ffffff`:n,[0,s+.002*l,l*.02]);let f=new sl;if(f.moveTo(0,0),f.bezierCurveTo(.02*c,.14*c,-.06*c,.26*c,-.17*c,.23*c),f.quadraticCurveTo(-.26*c,.1*c,-.08*c,0),o.add(r,_h(f,l,6),a?t:n,[0,.027999999999999997,l*.02]),i){let e=new Ec(.025*c,6);e.rotateX(-Math.PI/2),o.add(r,e,i,[.17*c,.034,l*(.02+.27*c)]),a&&o.add(r,e.clone(),i,[-.1*c,.034,l*(.02+.15*c)])}if(Y(e,`tails`)){let e=new sl;e.moveTo(-.15*c,.2*c),e.lineTo(-.3*c,.3*c),e.lineTo(-.28*c,.33*c),e.lineTo(-.12*c,.23*c),o.add(r,_h(e,l),n,[0,.027,l*.02])}}return o.build({rig:`butterfly`})}function Oh(e){let[t,n]=e.c,r=new ph;r.add(`body`,new Dc(.02,.012,.6,4),t,[-.2,.05,0],[0,0,Math.PI/2]),r.add(`body`,J(.08,.05,.05),t,[.1,.05,0]),r.add(`body`,J(.06,.06,.08),`#5a2a22`,[.2,.06,0]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]])r.part(e,[.08,.07,0],`glass`),r.add(e,J(.05,.004,.24,0),n,[.12,.07,t*.26]),r.add(e,J(.05,.004,.22,0),n,[0,.07,t*.24]);return r.build()}function kh(e){let[t,n,r]=e.c,i=new ph;i.add(`body`,J(.18,.12,.12),t,[-.05,.12,0]);for(let e of[-.12,0])i.add(`body`,J(.03,.125,.125,1),n,[e,.12,0]);i.add(`body`,J(.08,.08,.08),n,[.16,.13,0]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]])i.part(e,[.02,.2,0],`glass`),i.add(e,J(.08,.004,.14,0),r,[0,.22,t*.14]);return i.build()}function Ah(e){let[t,n]=e.c,r=new ph;if(r.add(`body`,new Xl(.16,8,5,0,Math.PI*2,0,Math.PI/2),t,[0,0,0]),r.add(`body`,new Gl(.07,0),n,[.15,.03,0]),Y(e,`dots`))for(let e=0;e<5;e++)r.add(`body`,new Gl(.03,0),n,[Math.cos(e*1.3)*.08,.12,Math.sin(e*1.3)*.08]);Y(e,`horn`)&&r.add(`body`,new Oc(.025,.22,4),n,[.25,.1,0],[0,0,-.9]);for(let e of[-1,1])for(let t of[-.06,.02,.1])r.add(`body`,new Dc(.008,.008,.1,3),n,[t,.02,e*.15],[e*1.1,0,0]);return r.build()}function jh(e){let[t,n,r]=e.c,i=new ph;return i.add(`body`,J(.22,.09,.1),t,[0,.09,0]),i.add(`body`,J(.07,.07,.12,0),r,[.2,.1,0]),i.part(`wingL`,[.05,.16,0],`glass`).add(`wingL`,J(.26,.02,.14,0),n,[-.05,.16,0]),i.build()}function Mh(e){let[t,n]=e.c,r=new ph;r.add(`body`,new Dc(.03,.05,.5,4),t,[-.1,.12,0],[0,0,Math.PI/2-.2]),r.add(`body`,new Dc(.02,.025,.25,4),t,[.2,.22,0],[0,0,-.4]),r.part(`head`,[.3,.3,0]),r.add(`head`,new Oc(.06,.1,3),t,[.33,.33,0],[0,0,-Math.PI/2]);for(let e of[-1,1]){r.add(`body`,new Dc(.012,.012,.18,3),n,[.3,.2,e*.05],[0,0,.6]);for(let t of[-.05,-.2])r.add(`body`,new Dc(.008,.008,.2,3),n,[t,.06,e*.08],[e*1,0,0])}return r.build()}function Nh(e){let[t,n]=e.c,r=new ph;r.add(`body`,new Dc(.018,.024,.8,4),t,[0,.05,0],[0,0,Math.PI/2]);for(let e of[-1,1])for(let t of[-.2,.05,.25])r.add(`body`,new Dc(.007,.007,.26,3),n,[t,.02,e*.1],[e*1.2,0,.3]);return r.build()}function Ph(e){let[t]=e.c,n=new ph;return n.add(`body`,J(.2,.08,.08),t,[0,.08,0]),n.part(`glow`,[0,0,0],`glow`).add(`glow`,J(.1,.09,.09),`#f6ff9a`,[-.18,.08,0]),n.build()}function Fh(e){let[t,n,r]=e.c,i=Y(e,`newt`),a=new ph;a.add(`body`,J(.26,.07,.1),t,[0,.08,0]),i&&a.add(`body`,J(.22,.03,.08),n,[0,.03,0]),a.part(`head`,[.2,.09,0]),a.add(`head`,J(.12,.06,.08),i?t:n,[.3,.1,0]);for(let t of[-1,1])a.add(`head`,new Gl(Y(e,`gecko`)?.03:.02,0),`#111111`,[.34,.14,t*.05]);a.part(`tail`,[-.24,.07,0]),a.add(`tail`,new Oc(.06,.55,4),r,[-.5,.06,0],[0,0,Math.PI/2]);for(let[e,n,r]of[[`legFL`,.13,.1],[`legFR`,.13,-.1],[`legBL`,-.13,.1],[`legBR`,-.13,-.1]])a.part(e,[n,.07,r]),a.add(e,new Dc(.015,.015,.1,3),t,[n,.04,r+Math.sign(r)*.03],[Math.sign(r)*.9,0,0]);return a.build()}function Ih(e){let[t,n,r]=e.c,i=new ph;for(let r=0;r<12;r++){let a=r/11,o=.3-a*1.1,s=Math.sin(a*7)*.12,c=.05*(1-a*.6),l=Y(e,`blotch`)&&r%2==0;i.add(`body`,new Gl(c*1.3,0),l||r===11&&n===`#d8402a`?n:t,[o,c,s])}i.part(`head`,[.34,.05,0]),i.add(`head`,J(.09,.05,.065),t,[.4,.06,0]),i.add(`head`,J(.06,.02,.05),r,[.4,.03,0]);for(let e of[-1,1])i.add(`head`,new Gl(.015,0),`#f0d040`,[.44,.09,e*.04]);return i.build()}function Lh(e){let[t,n,r]=e.c,i=new ph;i.add(`body`,new Xl(.28,8,5,0,Math.PI*2,0,Math.PI/2),t,[0,.06,0]);for(let e of[-.1,0,.1])i.add(`body`,new Tc(.46,.02,.025),n,[0,.2-Math.abs(e)*.6,e],[e*2,0,0]);i.part(`head`,[.24,.08,0]),i.add(`head`,J(.1,.07,.07),r,[.33,.1,0]);for(let[e,t,n]of[[`legFL`,.15,.2],[`legFR`,.15,-.2],[`legBL`,-.15,.2],[`legBR`,-.15,-.2]])i.part(e,[t,.06,n]),i.add(e,J(.06,.04,.06,0),r,[t,.04,n]);return i.build()}function Rh(e){let[t,n,r]=e.c,i=new ph;i.add(`body`,J(.2,.13,.17),t,[0,.14,0],[0,0,.3]),i.add(`body`,J(.16,.08,.14),n,[.03,.08,0]);for(let e of[-1,1])i.add(`body`,new Gl(.05,0),t,[.14,.25,e*.08]),i.add(`body`,new Gl(.03,0),`#111111`,[.17,.27,e*.09]),i.add(`body`,J(.03,.05,.03,0),t,[.14,.05,e*.12]);if(Y(e,`warty`))for(let e=0;e<8;e++)i.add(`body`,new Gl(.022,0),r,[-.1+e%4*.06,.24,(e<4?1:-1)*.06]);for(let[e,n]of[[`legBL`,1],[`legBR`,-1]])i.part(e,[-.1,.1,n*.14]),i.add(e,J(.14,.05,.05),t,[-.14,.06,n*.16],[0,n*.4,.2]);return i.build()}var zh={bird:bh,owl:xh,quad:Ch,monkey:wh,squirrel:Th,bat:Eh,butterfly:Dh,dragonfly:Oh,bee:kh,beetle:Ah,cicada:jh,mantis:Mh,stick:Nh,firefly:Ph,lizard:Fh,snake:Ih,turtle:Lh,frog:Rh},Bh=new Map,Vh=new Map;function Hh(e){let t=Vh.get(e);if(t)return t;let n=Wh(e);return t=n?new go().setFromObject(n).getSize(new U):new U(1,1,1),Vh.set(e,t),t}function Uh(e){let t=Hh(e.id);return(e.look.kind===`butterfly`||e.motion===`bat`)&&e.real.span?e.real.span/Math.max(.001,t.z):e.real.len/Math.max(.001,t.x)}function Wh(e){let t=Bh.get(e);if(t)return t;if(e===`nest`)t=Sh();else{let n=gt(e);if(!n)return null;t=zh[n.look.kind](n.look)}return Bh.set(e,t),t}function Gh(e){let t=t=>e.getObjectByName(t)??void 0,n=[];for(let e of[`legFL`,`legFR`,`legBL`,`legBR`,`legL`,`legR`]){let r=t(e);r&&n.push({up:r,lo:t(`${e}2`)})}let r=[];for(let e=1;e<=6;e++){let n=t(e===1?`tail`:`tail${e}`);if(!n)break;r.push(n)}let i=t(`torso`),a=e.userData;return{kind:a.rig??`basic`,torso:i,torsoY:i?i.position.y:0,neck:t(`neck`),head:t(`head`),legs:n,tails:r,tailRest:r.map(e=>e.rotation.z),wingL:t(`wingL`),wingR:t(`wingR`),wingL2:t(`wingL2`),wingR2:t(`wingR2`),glow:t(`glow`),legLen:a.legLen??.3,neckAng:a.neckAng??.5}}var Kh=[.25,.75,0,.5],qh=[0,.1,.5,.6];function Jh(e,t){let n=e.kind===`monkey`,r=e.kind===`squirrel`,i=n?1.15:r?1.05:.55,a=n?.15:r?.07:e.legLen*.5,o=e.legLen*.82,s=R(1-t.sit-t.lie,0,1),c=t.run,l=t.walk*s,u=Math.PI*2;if(e.legs.forEach((e,a)=>{let o=a<2,d=(Kh[a]??0)*(1-c)+(qh[a]??0)*c,f=t.gait+d*u,p=.4+c*.4,m=Math.sin(f)*p*l+(o?0:.06),h=-Math.max(0,Math.cos(f))*(.55+c*.6)*l-(o?0:.12)*s,g=n?o?-.55:.2:r?o?-.2:.45:o?-i:.8,_=n?o?.35:-1.35:r?o?-1.1:-1.7:o?0:-2.3,v=o?-1.25:1.3,y=o?2.5:-2.5;m=m*s+g*t.sit+v*t.lie,h=h*s+_*t.sit+y*t.lie,e.up.rotation.set(0,0,m),e.lo&&e.lo.rotation.set(0,0,h)}),e.torso){let n=l*(c>.5?Math.abs(Math.sin(t.gait))*.05:Math.cos(t.gait*2)*.01);e.torso.position.y=e.torsoY-a*t.sit-o*t.lie+n,e.torso.rotation.set(0,0,i*t.sit+Math.sin(t.gait)*.07*c*l+(r?Math.sin(t.gait)*.12*l:0))}let d=e.neckAng+.6;if(e.neck&&e.neck.rotation.set(0,0,-t.graze*d+Math.sin(t.gait*2)*.04*l),e.head){let n=t.sniff*(Math.sin(t.t*9)*.06-.35);e.head.rotation.set(0,t.look*(1-t.graze*.7),-i*t.sit*.8-t.graze*.25+n+(e.neck?0:-t.graze*.8))}e.tails.forEach((i,a)=>{let o=Math.sin(t.t*(r?3:2.2)-a*.7)*(.12+.1*a)*(r?.6:1);i.rotation.set(0,o,(e.tailRest[a]??0)+(n?-.35*t.sit:0)+(r?Math.sin(t.t*1.3-a)*.08:0)-(a===0?c*.3:0))})}function Yh(e,t,n,r,i){let a=1-t;for(let[o,s,c]of[[e.wingL,e.wingL2,1],[e.wingR,e.wingR2,-1]])o&&(o.rotation.set(-c*(n+i)*t,-c*1.5*a,1.35*a),s&&s.rotation.set(-c*(r-i*.5)*t,-c*.2*a,0))}function Xh(e){let t=Wh(e);if(!t)return null;let n=t.clone(),r=gt(e),i=Gh(n),a={gait:1.1,walk:1,run:0,sit:0,graze:0,lie:0,look:.35,t:.6,sniff:0};if(r?.look.kind===`bird`)r.motion===`soar`?Yh(i,1,-.15,.1,.1):Yh(i,0,0,0,0),i.head&&(i.head.rotation.y=.3);else if(i.kind===`monkey`)Jh(i,{...a,walk:0,sit:1,look:.5});else if(i.kind===`squirrel`)Jh(i,{...a,walk:0,sit:1,look:.3});else if(i.kind===`quad`)Jh(i,a);else if(i.kind===`butterfly`)for(let[e,t]of[[i.wingL,1],[i.wingR,-1]])e?.rotation.set(-t*.45,0,0);if(e===`magpierobin`){let e=new Ga,t=Wh(`nest`).clone();return n.position.set(.1,.25,.3),n.scale.setScalar(.8),e.add(t,n),e}return n}function Zh(e,t){Yh(Gh(e),1-t,0,0,0)}var Qh=new Set([`perch`,`flock`,`soar`,`hover`,`flutter`,`bat`]),$h=new Set([`walk`,`hop`,`wade`]),eg=48;function tg(e){return Math.atan2(-e.z,e.x)}var ng=1;function rg(e,t){let n=Math.hypot(e,t)/ng;return n>7?-.02*ng:ng*(.02+.18*(1-Math.min(1,n/7)**2))}var ig=new Set([`muntjac`,`leopardcat`,`otter`,`macaque`,`civet`,`smallcivet`,`ferretbadger`]);function ag(e){let t=e.look.f??[];return e.look.kind===`monkey`?[`sit`,`sit`,`groom`,`look`,`climb`,`climb`]:e.look.kind===`bird`?e.motion===`wade`?[`strike`,`look`,`preen`,`strike`]:[`peck`,`peck`,`look`,`preen`]:e.look.kind===`quad`?t.includes(`cowTail`)?[`graze`,`graze`,`look`,`lie`]:t.includes(`antlers`)?[`graze`,`graze`,`look`]:t.includes(`catEars`)?[`sit`,`look`,`sniff`,`sit`]:e.id===`otter`?[`sit`,`sniff`,`look`]:[`sniff`,`sniff`,`look`,`graze`]:[`look`]}var og=new U,sg=new U,cg=new U,lg=new Set([`perch`,`flock`,`soar`,`hover`,`flutter`,`bat`]),ug=new U(0,1,0),dg=new _a,fg=new U,pg=new U,mg=new U;function hg(e,t,n){fg.copy(t).normalize(),mg.crossVectors(fg,n).normalize(),pg.crossVectors(mg,fg).normalize(),dg.makeBasis(fg,pg,mg),e.quaternion.setFromRotationMatrix(dg)}var gg=class{root=new Ga;crews=[];tree=null;pool=[];residents=[];night=!1;weak=!1;stage=0;islandR=7;nextRotate=8;nextArrival=3;time=0;fly=_g();perchTaken=new Set;rng=Math.random;constructor(){this.fly.points.visible=!1,this.root.add(this.fly.points)}setIslandRadius(e,t=1){this.islandR=e,ng=t}pick(e,t){let n=null,r=1,i=new U;for(let a of this.crews)if(!(a.leaving||a.def.motion===`glow`))for(let o of a.members){if(!o.obj.visible)continue;let s=i.subVectors(o.pos,e.origin).dot(e.direction);if(s<=0)continue;let c=e.distanceToPoint(o.pos)/Math.max(a.def.real.len*.7,t(s));c<r&&(r=c,n={crew:a,member:o})}return n}focusRef(e){let t=e;return!t||t.crew.gone||t.crew.leaving||!this.crews.includes(t.crew)||!t.crew.members.includes(t.member)?null:{pos:t.member.pos,size:t.crew.def.real.len,yaw:t.member.yaw}}flyerHeights(){let e=this.tree;if(!e)return[];let t=e.group.getWorldPosition(new U).y,n=[];for(let r of this.crews)if(lg.has(r.def.motion))for(let i of r.members)n.push({id:r.def.id,y:i.pos.y-t,ceiling:Wm(e.height),perched:i.lastPerched??!1});return n}refName(e){let t=e;return t&&this.crews.includes(t.crew)?t.crew.def.name:null}sync(e){let t=this.tree!==e.tree;this.tree=e.tree,this.pool=e.unlocked.filter(e=>gt(e)),this.residents=e.residents.filter(e=>gt(e)).slice(0,3);let n=this.night!==e.night;this.night=e.night,this.weak=e.health<22;let r=R(Math.round(e.stage??this.stage),0,4),i=r!==this.stage;this.stage=r,t&&this.reseat();for(let e of this.crews)e.forced||(e.resident=this.residents.includes(e.def.id),(!this.fits(e.def)||!e.resident&&!this.pool.includes(e.def.id)||!e.resident&&!zm(e.def,this.stage))&&this.retire(e));this.trimToCap();for(let e of this.residents)!this.crews.some(t=>t.def.id===e&&!t.leaving)&&this.fits(gt(e))&&this.spawn(e,{resident:!0});(n||i||this.visibleCrews().length===0)&&this.fill()}fits(e){return this.weak&&![`butterfly`,`sparrow`].includes(e.id)?!1:e.motion===`hollow`||e.motion===`nest`?!0:this.night?!!e.night||e.motion===`glow`:!e.night}visibleCrews(){return this.crews.filter(e=>!e.leaving)}visitors(){return this.visibleCrews().filter(e=>!e.resident&&!e.forced)}memberCount(){return this.crews.reduce((e,t)=>e+t.members.length,0)}visitorMembers(){return this.visitors().reduce((e,t)=>e+t.members.length,0)}trimToCap(){let e=Lm(this.stage),t=this.visitors().sort((e,t)=>e.born-t.born),n=t.length,r=t.reduce((e,t)=>e+t.members.length,0);for(let i of t){if(n<=e.groups&&r<=e.members)break;this.retire(i),n--,r-=i.members.length}}candidates(){return this.pool.filter(e=>{let t=gt(e);return this.fits(t)&&zm(t,this.stage)&&!this.crews.some(t=>t.def.id===e&&!t.leaving)})}fill(){let e=Lm(this.stage),t=0;for(;this.visitors().length<e.groups&&t++<16;){let t=e.members-this.visitorMembers();if(t<1)break;let n=this.candidates();if(!n.length)break;this.spawn(n[Math.floor(this.rng()*n.length)],{room:t})}}rotate(){let e=this.visitors();e.length&&this.retire(e.sort((e,t)=>e.born-t.born)[0]);let t=this.candidates().filter(e=>!this.crews.some(t=>t.def.id===e)),n=Lm(this.stage).members-this.visitorMembers();t.length&&n>=1&&this.spawn(t[Math.floor(this.rng()*t.length)],{room:n}),this.fill(),this.nextRotate=this.time+28+this.rng()*20}info(){return this.visibleCrews().map(e=>({id:e.def.id,name:e.def.name,count:e.members.length,resident:e.resident}))}focus(e){let t=this.crews.find(t=>t.def.id===e&&!t.leaving)??this.crews.find(t=>t.def.id===e),n=t?.members[+(t.members.length>1)];return!t||!n?null:{pos:n.pos,size:t.def.look.kind===`butterfly`?t.def.real.span??t.def.real.len:t.def.real.len,yaw:n.yaw}}caps(){let e=Lm(this.stage);return{stage:this.stage,groups:e.groups,members:e.members,maxSize:Im[e.maxSize],visitorGroups:this.visitors().length,visitorMembers:this.visitorMembers(),residentGroups:this.visibleCrews().filter(e=>e.resident).length}}retire(e){if(!e.leaving){e.leaving=!0,e.timer=0;for(let t of e.members)t.perch>=0&&this.perchTaken.delete(t.perch),t.timer=0,t.climb=null}}spawn(e,t={}){let n=gt(e),r=this.tree;if(!n||!r)return;if(t.forced){let t=this.crews.find(t=>t.def.id===e&&!t.leaving);if(t&&this.retire(t),this.memberCount()>eg-n.group[1]){let e=this.visitors().sort((e,t)=>e.born-t.born)[0];e&&this.retire(e)}}let i=Bm(n,t.forced||t.resident?Math.max(this.stage,3):this.stage,this.rng);t.room!==void 0&&(i=Math.min(i,t.room)),i=Math.max(1,Math.min(i,eg-this.memberCount()));let a=Wh(e);if(!a)return;let o={def:n,members:[],resident:!!t.resident,forced:!!t.forced,born:this.time,leaving:!1,gone:!1,timer:0,phase:`air`,leader:new U,leaderTarget:new U,pause:0,enter:0,run:!1},s=this.entryPoint(n);o.leader.copy(s),o.leaderTarget.copy(this.groundTarget(n));for(let e=0;e<i;e++){let t=n.motion===`nest`?this.nestWithRobin(a):a.clone();t.rotation.order=`YZX`;let r={obj:t,rig:Gh(t),pos:s.clone().add(new U((this.rng()-.5)*1.5,$h.has(n.motion)?0:(this.rng()-.5)*.8,(this.rng()-.5)*1.5)),prev:s.clone(),target:s.clone(),offset:new U((this.rng()-.5)*2,(this.rng()-.5)*.8,(this.rng()-.5)*2),mode:Qh.has(n.motion)?`fly`:$h.has(n.motion)?`ground`:`fixed`,perch:-1,phase:this.rng()*10,scale:1,timer:this.rng()*6,speed:.8+this.rng()*.4,yaw:this.rng()*6.28,moving:0,spread:+!!Qh.has(n.motion),gait:this.rng()*6.28,wingPh:this.rng()*6.28,flapK:1,bank:0,act:`none`,actT:1+this.rng()*3,look:0,lookT:0,lookTimer:this.rng()*3,sitK:0,grazeK:0,lieK:0,sniffK:0,runK:0,climb:null,sq:null,rest:null};e>0&&$h.has(n.motion)&&r.offset.set(-.6-e*.5+this.rng()*.3,0,(e%2?1:-1)*(.4+this.rng()*.4)),(n.look.kind===`quad`||n.look.kind===`monkey`)&&(n.look.size??1)>=1&&t.traverse(e=>e.isMesh&&(e.castShadow=e.name===`body`||e.name===`head`||e.name===`neck`)),n.motion===`glow`&&(t.visible=!1),o.members.push(r),this.root.add(t)}n.motion===`glow`&&(this.fly.points.visible=!0),this.crews.push(o),this.assignSeats(o)}nestWithRobin(e){let t=new Ga,n=Wh(`nest`).clone();n.name=`nestMesh`;let r=e.clone();return r.position.set(.25,.18,.2),r.scale.setScalar(.95),Zh(r,1),t.add(n,r),t}scaleFor(e){return Uh(e)}roam(){let e=(5.32+Math.max(0,this.islandR/ng-7)*.3)*ng;return Math.min(e,(Km(this.islandR)-.6)/1.08)}entryPoint(e){let t=this.tree,n=this.rng()*Math.PI*2;if($h.has(e.motion)){let e=this.roam()*1.08,t=.2+this.rng()*2.6;return new U(Math.cos(t)*e,rg(Math.cos(t)*e,Math.sin(t)*e),Math.sin(t)*e)}if(Qh.has(e.motion)&&e.category===`bird`){let e=t.canopyRadius+10;return new U(Math.cos(n)*e,t.height+3+this.rng()*3,Math.sin(n)*e)}return new U(Math.cos(n)*(t.canopyRadius+1),t.height*.5,Math.sin(n)*(t.canopyRadius+1))}groundTarget(e){let t=this.tree,n=Math.max(.6,t.trunkRadius*3+.6),r=this.roam(),i=e.motion===`wade`,a=i?.3+this.rng()*.9:-.3+this.rng()*3.8,o=i?Math.min(r,5.32*ng)*(.75+this.rng()*.2):n+this.rng()*(r-n),s=Math.cos(a)*o,c=Math.sin(a)*o;return new U(s,rg(s,c),c)}assignSeats(e){let t=this.tree;for(let n of e.members)if(n.scale=this.scaleFor(e.def)*(.9+this.rng()*.2),n.obj.scale.setScalar(n.scale),n.climb=null,(e.def.motion===`perch`||e.def.motion===`flock`||e.def.motion===`crawl`&&e.def.spot===`leaf`)&&(n.perch=this.freePerch(t)),(e.def.motion===`climb`||e.def.motion===`crawl`&&e.def.spot===`trunk`)&&(n.perch=Math.floor(this.rng()*Math.max(1,t.trunkSpots.length))),e.def.look.kind===`squirrel`){let e=t.trunkSpots[n.perch%Math.max(1,t.trunkSpots.length)],r=e?e.pos.y:.5;n.sq={where:`trunk`,lift:0,liftT:0,toGround:!1,home:new U},n.sq.lift=n.sq.liftT=r*.3}}freePerch(e){let t=e.perches.length;if(!t)return-1;for(let e=0;e<t;e++){let e=Math.floor(this.rng()*Math.min(t,16));if(!this.perchTaken.has(e))return this.perchTaken.add(e),e}return Math.floor(this.rng()*t)}reseat(){this.perchTaken.clear();for(let e of this.crews)this.assignSeats(e)}perchWorld(e,t){let n=this.tree,r=n.perches[e]??n.perches[0];return r?n.group.localToWorld(t.copy(r.pos)):t.set(0,n.height,0)}trunkWorld(e,t,n,r=0){let i=this.tree,a=i.trunkSpots[e%Math.max(1,i.trunkSpots.length)];return a?(n.copy(a.pos).addScaledVector(a.out,r),n.y+=t,i.group.localToWorld(n)):n.set(0,1,.3)}trunkTop(){let e=this.tree.trunkSpots,t=0;for(let n of e)t=Math.max(t,n.pos.y);return t>0?t/.7:Math.max(1,this.tree.height*.5)}trunkOut(e){let t=this.tree,n=t.trunkSpots[e%Math.max(1,t.trunkSpots.length)];return sg.copy(n?n.out:new U(0,0,1)).transformDirection(t.group.matrixWorld)}trunkSpotNear(e){let t=this.tree,n=0,r=1/0;return t.trunkSpots.forEach((t,i)=>{let a=t.pos.y*3+Math.hypot(t.pos.x+t.out.x-e.x,t.pos.z+t.out.z-e.z);a<r&&(r=a,n=i)}),n}update(e,t,n){if(this.time=e,this.tree){if(e>this.nextRotate&&(this.crews.length?this.rotate():this.fill()),e>this.nextArrival){this.nextArrival=e+5+this.rng()*5;let t=Lm(this.stage),n=t.members-this.visitorMembers();if(this.visitors().length<t.groups&&n>=1){let e=this.candidates();e.length&&this.spawn(e[Math.floor(this.rng()*e.length)],{room:n})}}for(let n of this.crews)this.step(n,e,t);for(let e of this.crews.filter(e=>e.gone)){for(let t of e.members)this.root.remove(t.obj);e.def.motion===`glow`&&(this.fly.points.visible=!1)}this.crews=this.crews.filter(e=>!e.gone),this.fly.points.visible&&this.updateFireflies(e,n)}}step(e,t,n){let r=this.tree,i=e.def;e.timer+=n;let a=e=>1-Math.exp(-n*e),o=Math.max(.05,r.height),s=Math.max(.2,r.canopyRadius),c=r.group.getWorldPosition(cg).y+Wm(r.height),l=i.real.len,u=Wm(r.height)<l*3,d=()=>{e.gone=!0};if(i.motion===`flock`&&!e.leaving){if(e.phase===`air`&&e.timer>14+e.born%5){e.phase=`land`,e.timer=0;for(let t of e.members)(t.perch<0||!r.perches[t.perch])&&(t.perch=this.freePerch(r))}else e.phase===`land`&&e.timer>12&&(e.phase=`air`,e.timer=0)}if($h.has(i.motion)){e.leaving&&e.leaderTarget.copy(this.entryPoint(i)),og.subVectors(e.leaderTarget,e.leader).setY(0);let t=og.length(),r=(i.look.size??1)>1.8,a=(i.motion===`wade`?.35:i.motion===`hop`?.7:r?.9:.75)*R(l/.8,.2,1.6);(e.run||e.leaving)&&(a*=ig.has(i.id)?2.6:1.6),t<.15?(e.leaving&&d(),e.pause-=n,e.pause<=0&&(e.leaderTarget.copy(this.groundTarget(i)),e.pause=3+this.rng()*7,e.run=ig.has(i.id)&&this.rng()<.3)):e.pause>0&&!e.leaving?e.pause-=n:(e.leader.addScaledVector(og.normalize(),Math.min(t,a*n)),e.leader.y=rg(e.leader.x,e.leader.z))}e.members.forEach((f,p)=>{f.prev.copy(f.pos);let m=t+f.phase,h=0,g=!1;switch(i.motion){case`perch`:case`flock`:{let n=!u&&(e.leaving||(i.motion===`flock`?e.phase===`air`:Math.sin(m*.12+p)>.93));if(e.leaving&&u)d();else if(e.leaving)f.target.set(Math.cos(f.phase)*(s+14),o+6,Math.sin(f.phase)*(s+14)),f.pos.distanceTo(f.target)<1.5&&d();else if(n){let n=t*(i.motion===`flock`?.45:.9)+(i.motion===`flock`?0:f.phase),r=s+1.2+(i.motion===`flock`?1.5:.5);e.leader.set(Math.cos(n)*r,o*.8+.6+Math.sin(t*.7)*.5,Math.sin(n)*r),f.target.copy(e.leader).add(sg.copy(f.offset).multiplyScalar(i.motion===`flock`?f.scale*3:0))}else this.perchWorld(f.perch,f.target),g=f.pos.distanceTo(f.target)<.12*Math.max(1,f.scale*3);f.pos.lerp(f.target,a(g?20:n?2.2:3)),g&&f.pos.copy(f.target),h=+!g;break}case`soar`:if(e.leaving)f.target.set(Math.cos(f.phase)*40,o+14,Math.sin(f.phase)*40),f.pos.distanceTo(f.target)<3&&d();else{let e=t*.16+f.phase,n=Math.max(5,s+3.5)+p*1.2;f.target.set(Math.cos(e)*n,Math.min(o*.9,o-1.5)+Math.sin(t*.3+p)*.8,Math.sin(e)*n)}f.pos.lerp(f.target,a(1.4)),h=1;break;case`hover`:case`flutter`:case`bat`:{let c=i.look.kind===`butterfly`;if(e.leaving)f.rest=null,f.target.set(Math.cos(f.phase)*(s+8),o*.7+3,Math.sin(f.phase)*(s+8)),f.pos.distanceTo(f.target)<1&&d();else if(i.motion===`hover`){if(f.timer-=n,f.timer<=0){let e=r.perches[Math.floor(this.rng()*Math.max(1,r.perches.length))];e?r.group.localToWorld(f.target.copy(e.pos).addScaledVector(e.out,.3+this.rng()*.4*Math.max(1,o*.1))):f.target.set((this.rng()-.5)*2,1,(this.rng()-.5)*2),f.timer=.8+this.rng()*1.6}}else if(c&&f.rest)f.target.copy(f.rest),f.timer-=n,f.timer<=0&&(f.rest=null,f.timer=6+this.rng()*8);else{let a=t*(i.motion===`bat`?.9:.35)*f.speed+f.phase*2,l=c&&p%2==1,u=(l?s*.6+1.2:s+.4)+Math.sin(m*.7)*.4,d=l?.5+Math.sin(m*1.3)*.3:o*(i.motion===`bat`?.75:.5)+Math.sin(m*1.1)*o*.12;if(f.target.set(Math.cos(a)*u,d,Math.sin(a)*u),c&&(f.timer-=n,f.timer<=0&&e.enter>=1)){if(l){let e=this.groundTarget(i);f.rest=e.setY(e.y+.04)}else r.perches.length&&(f.rest=this.perchWorld(Math.floor(this.rng()*r.perches.length),new U));f.timer=3+this.rng()*4}}let l=c&&f.rest!==null&&f.pos.distanceTo(f.target)<.08;f.pos.lerp(f.target,a(i.motion===`hover`?4:c&&f.rest?3.5:2.5)),l&&f.pos.copy(f.target),g=l,h=+!l;break}case`walk`:case`hop`:case`wade`:if(f.climb&&i.look.kind===`monkey`){this.stepClimb(e,f,n);break}if(og.copy(f.offset).applyAxisAngle(ug,e.members[0].yaw),f.target.copy(e.leader).add(p===0?og.set(0,0,0):og.multiplyScalar(f.scale)),f.target.y=rg(f.target.x,f.target.z),f.pos.lerp(f.target,a(p===0?30:2.5)),i.motion===`hop`){let e=f.prev.distanceTo(f.pos)/Math.max(1e-4,n);f.pos.y=rg(f.pos.x,f.pos.z)+Math.abs(Math.sin(m*5))*.15*f.scale*Math.min(1,e/.3)}break;case`climb`:if(f.sq)this.stepSquirrel(e,f,n,m);else{let t=Math.sin(m*.25)*.4*Math.max(.5,o*.08);this.trunkWorld(f.perch,t,f.target,f.scale*.15),f.pos.lerp(f.target,a(e.enter<1?3:8))}break;case`crawl`:if(i.spot===`trunk`)this.trunkWorld(f.perch,Math.sin(m*.1)*.1,f.target,f.scale*.05);else if(i.spot===`leaf`)this.perchWorld(f.perch,f.target);else{(f.timer<=0||f.target.lengthSq()===0)&&(f.target.copy(this.groundTarget(i)),f.timer=6+this.rng()*8),f.timer-=n,og.subVectors(f.target,f.pos).setY(0);let e=og.length();e>.05&&f.pos.addScaledVector(og.normalize(),Math.min(e,.12*n)),f.pos.y=rg(f.pos.x,f.pos.z);break}e.enter<1?f.pos.copy(f.target):f.pos.lerp(f.target,a(10));break;case`nest`:r.nest?r.group.localToWorld(f.pos.copy(r.nest.pos).add(new U(0,r.trunkRadius*.3,0))):this.perchWorld(0,f.pos);break;case`hollow`:r.hollow?r.group.localToWorld(f.pos.copy(r.hollow.pos).add(new U(0,-f.scale*.35,0))):this.perchWorld(1,f.pos);break;case`glow`:f.pos.set(0,o*.5,0)}if(f.lastPerched=g,lg.has(i.motion)&&!g){let e=l*.35,t=c-e;f.pos.y>t&&(f.pos.y=t);let n=rg(f.pos.x,f.pos.z)+e;f.pos.y<n&&t>=n&&(f.pos.y=n)}f.moving=f.prev.distanceTo(f.pos)/Math.max(1e-4,n);let _=!Qh.has(i.motion)&&!$h.has(i.motion),v=f.scale;if(_){let t=e.leaving?1-R(e.timer/.8,0,1):R(e.timer/.8,0,1);v*=Math.max(.001,t),e.leaving&&e.timer>.8&&d()}f.obj.scale.setScalar(v),f.obj.position.copy(f.pos),this.pose(e,f,p,n,m,h,g)}),e.enter=Math.min(1,e.enter+n*.6)}stepClimb(e,t,n){let r=t.climb,i=this.tree.trunkSpots[r.spot];if(!i||e.leaving){t.climb=null;return}let a=-i.pos.y+.02;if(r.stage===`go`){this.trunkWorld(r.spot,a,t.target,t.scale*.35),t.target.y=rg(t.target.x,t.target.z),og.subVectors(t.target,t.pos).setY(0);let e=og.length(),i=.9*t.scale;e>.05&&t.pos.addScaledVector(og.normalize(),Math.min(e,i*n)),t.pos.y=rg(t.pos.x,t.pos.z),r.t+=n,(e<=.06||r.t>12)&&(r.stage=`up`,r.lift=a);return}let o=.55*t.scale;if(r.stage===`up`)r.lift=Math.min(r.top,r.lift+o*n),r.lift>=r.top&&(r.stage=`hold`,r.t=2.5+this.rng()*3);else if(r.stage===`hold`)r.t-=n,r.t<=0&&(r.stage=`down`);else if(r.lift=Math.max(a,r.lift-o*n),r.lift<=a){this.trunkWorld(r.spot,a,t.pos,t.scale*.35),t.pos.y=rg(t.pos.x,t.pos.z),t.climb=null,t.act=`none`,t.actT=4+this.rng()*4;return}this.trunkWorld(r.spot,r.lift,t.pos,.01)}stepSquirrel(e,t,n,r){let i=t.sq,a=this.tree,o=a.trunkSpots[t.perch%Math.max(1,a.trunkSpots.length)],s=o?o.pos.y:.5,c=-s+.02,l=Math.max(.3,this.trunkTop()*.85-s);if(t.timer-=n,i.where===`trunk`){t.timer<=0&&Math.abs(i.lift-i.liftT)<.02&&(i.toGround=this.rng()<.3,i.liftT=i.toGround?c:c+.3+this.rng()*(l-c-.3),t.timer=1.2+this.rng()*2.5);let e=i.liftT-i.lift,r=Math.max(0,Math.sin(t.gait))*2,a=1.1*t.scale*r;if(i.lift+=Math.sign(e)*Math.min(Math.abs(e),a*n),this.trunkWorld(t.perch,i.lift,t.pos,.01),i.toGround&&Math.abs(i.lift-c)<.02){i.where=`ground`,this.trunkWorld(t.perch,c,i.home,t.scale*.3),i.home.y=rg(i.home.x,i.home.z),t.pos.copy(i.home);let e=this.trunkOut(t.perch),n=Math.atan2(e.z,e.x)+(this.rng()-.5)*1.6,r=.8+this.rng()*1.5;t.target.set(i.home.x+Math.cos(n)*r,0,i.home.z+Math.sin(n)*r),t.target.y=rg(t.target.x,t.target.z),t.timer=0,t.act=`none`}return}og.subVectors(t.target,t.pos).setY(0);let u=og.length();if(u>.04&&t.act!==`sit`){let e=Math.max(0,Math.sin(t.gait));t.pos.addScaledVector(og.normalize(),Math.min(u,1.3*t.scale*e*2*n)),t.pos.y=rg(t.pos.x,t.pos.z)+e*.1*t.scale}else if(t.pos.y=rg(t.pos.x,t.pos.z),t.act!==`sit`&&(t.act=`sit`,t.actT=1.5+this.rng()*2.5),t.actT-=n,t.actT<=0){if(t.act=`none`,t.target.distanceTo(i.home)<.05||e.leaving)i.where=`trunk`,i.lift=c,i.liftT=c+.4+this.rng()*(l-c-.4),i.toGround=!1,t.timer=2;else if(this.rng()<.5)t.target.copy(i.home);else{let e=this.rng()*Math.PI*2;t.target.set(i.home.x+Math.cos(e)*1.2,0,i.home.z+Math.sin(e)*1.2),t.target.y=rg(t.target.x,t.target.z)}}}pose(e,t,n,r,i,a,o){let s=e.def,c=og.subVectors(t.pos,t.prev),l=this.tree,u=t.rig,d=(e,n=6)=>{if(e.lengthSq()<1e-8)return;let i=tg(e)-t.yaw;return i=Math.atan2(Math.sin(i),Math.cos(i)),t.yaw+=i*Math.min(1,r*n),i};if(t.lookTimer-=r,t.lookTimer<=0&&(t.lookT=(this.rng()-.5)*1.5,t.lookTimer=1.2+this.rng()*3),t.look+=(t.lookT-t.look)*Math.min(1,r*4),s.motion===`nest`||s.motion===`hollow`){let e=s.motion===`nest`?l.nest?.out:l.hollow?.out;if(t.obj.rotation.set(0,tg(e??new U(.3,0,1)),0),s.motion===`nest`){let e=t.obj.children[1];e&&(e.rotation.y=Math.sin(i*.7)>.6?.5:0)}return}if(t.sq){let e=t.sq,n=t.moving/Math.max(.05,t.scale);if(t.gait+=r*(e.where===`trunk`?9:8)*(e.where===`trunk`&&Math.abs(e.liftT-e.lift)<.02?.2:1),t.sitK+=(+(t.act===`sit`)-t.sitK)*Math.min(1,r*6),e.where===`trunk`){let n=this.trunkOut(t.perch).clone(),r=e.liftT<e.lift-.02;hg(t.obj,r?og.set(0,-1,0):og.set(0,1,0),n),Jh(u,{gait:t.gait,walk:+(Math.abs(e.liftT-e.lift)>.02),run:1,sit:0,graze:0,lie:0,look:t.look,t:i,sniff:0})}else t.obj.quaternion.identity(),c.lengthSq()>1e-8&&d(c.clone().setY(0),10),t.obj.rotation.set(0,t.yaw,0),Jh(u,{gait:t.gait,walk:+(n>.05),run:1,sit:t.sitK,graze:0,lie:0,look:t.look,t:i,sniff:t.sitK*.5});return}if(t.climb&&t.climb.stage!==`go`){let e=this.trunkOut(t.climb.spot).clone(),n=t.climb.stage===`down`;hg(t.obj,n?og.set(0,-1,0):og.set(0,1,0),e);let a=t.climb.stage!==`hold`;t.gait+=r*6*!!a,Jh(u,{gait:t.gait,walk:a?1:.1,run:0,sit:0,graze:0,lie:0,look:a?0:t.look*1.3,t:i,sniff:0});for(let e of u.legs)e.up.rotation.x=(e.up.position.z>0?-1:1)*.35;return}if(s.motion===`climb`||s.motion===`crawl`&&s.spot===`trunk`){let e=l.trunkSpots[t.perch%Math.max(1,l.trunkSpots.length)],n=e?e.out:new U(0,0,1);t.obj.rotation.set(0,0,0),t.obj.rotation.y=tg(n)+Math.PI/2,t.obj.rotateZ(Math.PI/2-.15),t.obj.rotateY(Math.PI),s.look.kind===`bird`&&Zh(t.obj,1),u.head&&(u.head.rotation.z=s.id===`woodpecker`?Math.max(0,Math.sin(i*14))*.3*(Math.sin(i*.5)>.3):Math.sin(i*.6)*.2),u.tails[0]&&(u.tails[0].rotation.z=(u.tailRest[0]??0)+Math.sin(i*2.2)*.15);return}if(s.motion===`crawl`){if(s.spot===`leaf`){let e=l.perches[t.perch];t.obj.rotation.set(0,e?tg(e.out):0,0)}else d(c.setY(0)),t.obj.rotation.set(0,t.yaw,0);let e=t.moving>.02;t.gait+=r*10*!!e,u.legs.forEach((n,r)=>n.up.rotation.y=e?Math.sin(t.gait+(r===0||r===3?0:Math.PI))*.45:0),u.head&&(u.head.rotation.y=t.look*.5),u.tails[0]&&(u.tails[0].rotation.y=Math.sin(i*1.5)*.2+(e?Math.sin(t.gait)*.2:0));return}if($h.has(s.motion)){this.poseGround(e,t,n,r,i,c,d);return}let f=s.look.kind===`bird`,p=s.look.kind===`butterfly`,m=0;if(o){if(p){let e=l.perches[t.perch];d(e?e.out.clone().setY(0):new U(.3,0,1),2)}else{let e=l.perches[t.perch];d(e?e.out.clone().setY(0).normalize().lerp(new U(.3,0,1),.6):new U(.3,0,1))}t.bank*=.9,t.obj.rotation.set(0,t.yaw,0)}else{let e=d(c.clone().setY(0))??0;m=R(c.y/Math.max(1e-4,r)*.08,-.5,.5);let n=s.motion===`soar`?.35:R(-e*4,-.5,.5);t.bank+=(n-t.bank)*Math.min(1,r*3)}let h=t.pos.distanceTo(t.target),g=f&&!o&&!e.leaving&&(s.motion===`perch`||s.motion===`flock`&&e.phase===`land`)&&h<1.2*Math.max(.5,t.scale*3);if(g&&(m=.6),o||t.obj.rotation.set(t.bank,t.yaw,m),t.spread+=(+!o-t.spread)*Math.min(1,r*(g?5:8)),f){let e=a,c=15;o||(s.motion===`soar`?(e=+(Math.sin(i*.35)>.82),c=5):g?(e=1,c=22):t.spread<.9?(e=1,c=20):e=+(Math.sin(i*.9+n*1.3)>-.35)),t.flapK+=(e-t.flapK)*Math.min(1,r*5),t.wingPh+=r*c;let l=s.motion===`soar`?.45:.85,d=Math.sin(t.wingPh)*l*t.flapK,f=Math.sin(t.wingPh-.8)*l*.8*t.flapK;if(Yh(u,t.spread,d,f,(1-t.flapK)*.12),o){let e=Math.sin(i*.3+n)>.9;if(u.head&&u.head.rotation.set(0,e?1.9:t.look,e?-.5:Math.sin(i*2.3)>.97?-.3:0),Math.sin(i*.45)>.96){let e=Math.sin(i*30)*.6;Yh(u,.45,e,e,0)}u.tails[0]&&(u.tails[0].rotation.z=(u.tailRest[0]??0)+Math.max(0,Math.sin(i*3))*(Math.sin(i*.7)>.5?.25:.03))}else u.head&&u.head.rotation.set(0,R(-t.bank,-.4,.4),0),u.tails[0]&&(u.tails[0].rotation.z=u.tailRest[0]??0);for(let e of u.legs)e.up.rotation.z=o?0:g?.5:-1.1}else if(p){let e;o?e=.2+(.5+.5*Math.sin(i*1.4))*1.2:(t.wingPh+=r*(Math.sin(i*.6+n)>.75?3:15),e=.15+(.5+.5*Math.sin(t.wingPh))*1.2),u.wingL?.rotation.set(-e,0,0),u.wingR?.rotation.set(e,0,0)}else{let e=s.category===`insect`,n=s.look.kind===`bee`||s.look.kind===`dragonfly`?60:e?14:s.look.kind===`bat`?11:16,i=e?.35:.8;t.wingPh+=r*n;let o=Math.sin(t.wingPh)*i*a;u.wingL&&(u.wingL.rotation.x=o),u.wingR&&(u.wingR.rotation.x=-o)}}poseGround(e,t,n,r,i,a,o){let s=e.def,c=t.rig,l=t.moving/Math.max(.05,t.scale),u=l>.08;if(u?o(a.clone().setY(0),5):n>0&&o(sg.subVectors(e.members[0].pos,t.pos).setY(0),1.5),t.obj.quaternion.identity(),t.obj.rotation.set(0,t.yaw,0),t.actT-=r,u&&t.act!==`climb`)t.act!==`none`&&(t.actT=.5+this.rng()),t.act=`none`;else if(t.actT<=0){if(t.act!==`none`)t.act=`none`,t.actT=1+this.rng()*2.5;else if(!e.leaving){let r=ag(s),i=r[Math.floor(this.rng()*r.length)];if(i===`climb`){if(n>0&&this.tree.trunkSpots.length&&e.pause>6){let e=this.trunkSpotNear(t.pos),n=this.tree.trunkSpots[e];t.climb={spot:e,stage:`go`,lift:0,top:Math.max(.3,this.trunkTop()*(.35+this.rng()*.35)-n.pos.y),t:0}}else i=`sit`}t.act=i,t.actT=i===`lie`?8+this.rng()*8:2.5+this.rng()*4}}let d=e=>+(t.act===e),f=Math.min(1,r*3);t.sitK+=(d(`sit`)+d(`groom`)-t.sitK)*f,t.grazeK+=(d(`graze`)-t.grazeK)*f,t.lieK+=(d(`lie`)-t.lieK)*Math.min(1,r*1.5),t.sniffK+=(d(`sniff`)-t.sniffK)*f;let p=e.run||e.leaving;if(t.runK+=((p&&u?1:0)-t.runK)*f,s.look.kind===`bird`){let e=s.motion===`hop`;t.gait+=r*l*(e?10:7);let n=u&&!e?Math.sin(t.gait)*.5:0;c.legs.forEach((e,t)=>e.up.rotation.z=t===0?n:-n),Yh(c,0,0,0,0);let a=t.act===`strike`?Math.max(0,Math.sin(R(1-t.actT/1.2,0,1)*Math.PI)):0,o=t.act===`peck`?Math.max(0,Math.sin(i*7)):0,d=+(t.act===`preen`);c.head&&c.head.rotation.set(0,d?1.9:t.look*(u?.3:1),-a*1-o*.7-d*.4+(u?Math.sin(t.gait*2)*.12:0)),c.tails[0]&&(c.tails[0].rotation.z=(c.tailRest[0]??0)+(s.id===`wagtail`?Math.sin(i*9)*.25:Math.sin(i*2)*.05));return}if(s.look.kind===`frog`){let e=Math.min(1,l/.3);c.legs.forEach(t=>t.up.rotation.z=-e*Math.abs(Math.sin(i*5))*.9);return}let m=Math.max(.15,c.legLen)*(1.6+t.runK*1.4);if(t.gait+=r*l/m*Math.PI*2*.5,Jh(c,{gait:t.gait,walk:R(l/.25,0,1),run:t.runK,sit:R(t.sitK,0,1),graze:t.grazeK,lie:t.lieK,look:t.act===`look`?t.look*1.3:t.look*(u?.25:.7),t:i,sniff:t.sniffK}),t.act===`groom`&&c.head&&(c.head.rotation.x=Math.sin(i*3)*.25),t.act===`groom`){let e=c.legs[0];e&&(e.up.rotation.z=-.1+Math.sin(i*5)*.25)}}updateFireflies(e,t){let n=this.fly.points.material;n.opacity=t;let r=this.tree,i={r:r.canopyRadius+.6,y:r.height*.25,h:r.height*.8};n.size=.2+r.height*.02;let a=this.fly.points.geometry.getAttribute(`position`),o=this.fly.seeds;for(let t=0;t<a.count;t++){let n=o[t*3]*6.28+e*.12*(.5+o[t*3+1]),r=i.r*(.4+.6*o[t*3+2]);a.setXYZ(t,Math.cos(n)*r,i.y+i.h*o[t*3+1]+Math.sin(e*.8+t)*.2,Math.sin(n)*r)}a.needsUpdate=!0}};function _g(){let e=new Yo,t=new Float32Array(78),n=new Float32Array(78);for(let e=0;e<78;e++)n[e]=Math.random();e.setAttribute(`position`,new Po(t,3));let r=document.createElement(`canvas`);r.width=r.height=32;let i=r.getContext(`2d`),a=i.createRadialGradient(16,16,0,16,16,16);a.addColorStop(0,`rgba(255,250,190,1)`),a.addColorStop(.35,`rgba(226,255,120,0.7)`),a.addColorStop(1,`rgba(200,255,100,0)`),i.fillStyle=a,i.fillRect(0,0,32,32);let o=new vc(e,new pc({size:.35,map:new xc(r),transparent:!0,depthWrite:!1,blending:2,color:`#fff9c4`}));return o.frustumCulled=!1,{points:o,seeds:n}}var vg={rocks:`石頭`,boulders:`大石`,shrubs:`灌木`,flowers:`野花`,drygrass:`乾草`,hills:`山丘`,mountains:`遠山`,snowpeaks:`雪峰`,scree:`碎石坡`,snow:`積雪`,pond:`池塘`,lotus:`荷葉`,lake:`湖泊`,river:`河流`,creek:`小溪`,wetland:`濕地`,reeds:`蘆葦`,waterfall:`瀑布`,ferns:`蕨類`,treeferns:`樹蕨`,fog:`霧`,coast:`海岸`,wall:`石牆`,village:`村屋`,shrine:`土地廟`,steps:`石級`,courtyard:`庭院`,lanterns:`石燈籠`,pavilion:`亭`,forest:`同種樹林`},yg=[7,8.6,10.6,13,16],bg=[{species:`camphor`,name:`山坡林地`,blurb:`香港郊野山坡：石塊、灌叢，遠處青山同山澗。`,grass:`#78b64c`,adds:[[],[`rocks`,`shrubs`],[`hills`,`flowers`],[`boulders`,`forest`],[`mountains`,`creek`]]},{species:`cotton`,name:`河畔草地`,blurb:`華南河岸同乾草地，河邊蘆葦，遠處黃土丘。`,grass:`#a9b75a`,adds:[[],[`drygrass`,`rocks`],[`river`],[`reeds`,`forest`],[`hills`,`waterfall`]]},{species:`banyan`,name:`圍村風水林`,blurb:`新界圍村：石牆、魚塘荷葉、村屋同土地廟。`,grass:`#6fae48`,adds:[[],[`wall`,`shrubs`],[`pond`,`lotus`],[`village`,`shrine`],[`forest`,`flowers`]]},{species:`metasequoia`,name:`溪澗濕地`,blurb:`湖北水杉壩：溪流、池塘、濕地蘆葦，背後青山，清晨起霧。`,grass:`#6db255`,adds:[[],[`reeds`,`creek`],[`pond`,`lotus`],[`wetland`,`forest`],[`lake`,`fog`,`hills`]]},{species:`ginkgo`,name:`古剎庭院`,blurb:`古寺庭院：石級、石燈籠、亭同放生池，四周山丘。`,grass:`#7cb350`,adds:[[],[`rocks`,`flowers`],[`steps`,`courtyard`],[`lanterns`,`pavilion`,`pond`],[`wall`,`forest`,`hills`]]},{species:`deodar`,name:`喜馬拉雅山坡`,blurb:`高山碎石坡，雪峰連綿，雪松成林，雪水匯成小溪。`,grass:`#8aa866`,adds:[[],[`rocks`,`scree`],[`hills`,`boulders`],[`snowpeaks`,`forest`],[`snow`,`mountains`,`creek`]]},{species:`redwood`,name:`霧鎖海岸`,blurb:`加州海岸霧林：蕨類、小溪、海蝕柱同海霧，後面係海岸山脈。`,grass:`#5f9f4a`,adds:[[],[`ferns`],[`creek`,`shrubs`],[`coast`,`forest`,`fog`],[`treeferns`,`boulders`,`hills`]]},{species:`eucalyptus`,name:`桉樹山谷`,blurb:`澳洲東南山谷：蕨叢、樹蕨、瀑布同藍霧山嶺。`,grass:`#8aa65c`,adds:[[],[`ferns`,`rocks`],[`hills`,`treeferns`],[`waterfall`,`forest`],[`mountains`,`fog`]]},{species:`douglas`,name:`山湖針葉林`,blurb:`北美太平洋山區：湖泊、針葉林，遠處雪山。`,grass:`#6aa250`,adds:[[],[`rocks`,`shrubs`],[`lake`],[`mountains`,`forest`],[`snowpeaks`,`reeds`]]}];function xg(e){return bg.find(t=>t.species===e)??bg[0]}function Sg(e){return yg[Math.max(0,Math.min(4,Math.round(e)))]}function Cg(e,t){let n=xg(e),r=[];for(let e=0;e<=Math.max(0,Math.min(4,Math.round(t)));e++)for(let t of n.adds[e])r.includes(t)||r.push(t);return r}var wg=yg[0],Tg=1.25,Eg=Tg-Math.PI,X=e=>new G(e);function Dg(e,t){return Math.abs(Math.atan2(Math.sin(e-t),Math.cos(e-t)))}function Og(e){let t=document.createElement(`canvas`);t.width=t.height=64;let n=t.getContext(`2d`);n.fillStyle=e?`#5aaed2`:`#5bb6dc`,n.fillRect(0,0,64,64);for(let t=0;t<(e?22:30);t++){n.fillStyle=`rgba(255,255,255,${.1+t%3*.08})`;let r=t*23%64,i=t*41%64;e?n.fillRect(r,i,3+t%3,1.5):n.fillRect(r,i,10+t%4*4,2)}let r=new xc(t);return r.wrapS=r.wrapT=Fn,r.colorSpace=ri,r}function kg(){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,0.9)`),n.addColorStop(.6,`rgba(255,255,255,0.35)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),new xc(e)}var Ag=class{solids=[];flowing=[];still=[];keep=[];waters=[];tufts=[];flowers=[];fog=[];falls=[];rand=Math.random;R=wg;rIn=wg;form;constructor(e){this.form=e}groundY(e,t){let n=Math.hypot(e,t);return n<wg+.3?-.04:-.04+(Math.sin(e*.55+1.3)*Math.cos(t*.47-.4)*.1+Math.sin(e*1.3-t*.9)*.04)*Math.min(1,(n-wg-.3)/1.5)}free(e,t,n){if(Math.hypot(e,t)-n<wg+.35)return!1;for(let r of this.keep)if(Math.hypot(r.x-e,r.z-t)<r.r+n)return!1;return!0}spot(e,t=`view`,n=!1,r,i,a=40){let o=(r,i)=>{for(let o=0;o<a;o++){let a,o=t===`view`?this.rand()<.55?`back`:this.rand()<.55?`front`:this.rand()<.5?`side`:`any`:t;if(this.frontBias&&o===`back`&&!n&&(o=this.rand()<.6?`front`:`side`),a=o===`back`?Eg+(this.rand()-.5)*.9:o===`front`?Tg+(this.rand()-.5)*1:o===`side`?Eg+(this.rand()<.5?1:-1)*(.42+this.rand()*.55):this.rand()*Math.PI*2,i<=r)continue;let s=n?this.R-e*.35:r+this.rand()*(i-r),c=Math.cos(a)*s,l=Math.sin(a)*s;if(this.free(c,l,e*.85))return{x:c,z:l,r:e}}return null},s=i??this.R-(n?0:e*.7)-.2,c=o(r??this.rIn+e*.6,s);return c||n||r!==void 0||!this.reachIn?c:o(wg+.45+e*.8,s)}reachIn=!1;get frontBias(){return this.form===`banyan`||this.form===`round`}claim(e,t=0){this.keep.push({x:e.x,z:e.z,r:e.r+t})}push(e,t){this.solids.push(eh(e,t))}rock(e,t,n,r=`#9b958c`,i=!1){let a=new Ac(n,0);Qm(a,n*.35,e*3.1+t,!1),a.scale(1,.72,1),a.rotateY(e+t);let o=this.groundY(e,t);a.translate(e,o+n*.22,t);let s=X(r).offsetHSL(0,0,(this.rand()-.5)*.08);this.push(a,e=>i&&e>o+n*.5?X(`#f4f7fa`):s)}bush(e,t,n,r){let i=new Gl(n,1);Qm(i,n*.3,e+t*2,!0),i.scale(1,.75,1);let a=this.groundY(e,t);i.translate(e,a+n*.55,t);let o=X(r).offsetHSL(0,0,(this.rand()-.5)*.06);this.push(i,e=>o.clone().offsetHSL(0,0,(e-a)*.12-.04))}mountain(e,t,n,r,i,a=`#6f9f5c`,o=`#8b8378`){let s=new Oc(n,r,8,5);Qm(s,n*.22,e*1.7+t,!1);let c=this.groundY(e,t)-.3;s.translate(e,c+r/2,t);let l=c+r*(.62+this.rand()*.1),u=X(a),d=X(o),f=X(`#f3f6f9`);this.push(s,e=>i&&e>l?f:e>c+r*.3?d.clone().offsetHSL(0,0,(e-c)/r*.08):u)}hill(e,t,n,r,i){let a=new Xl(1,10,5,0,Math.PI*2,0,Math.PI/2);a.scale(n,r,n*(.8+this.rand()*.3)),Qm(a,n*.08,e+t*3,!1);let o=this.groundY(e,t)-.15;a.translate(e,o,t);let s=X(i);this.push(a,e=>s.clone().offsetHSL(0,0,(e-o)/r*.07-.03))}pool(e,t,n,r,i,a=!0,o=`#b9a47a`){let s=this.groundY(e,t),c=new Ec(1,22);c.rotateX(-Math.PI/2),c.scale(n,1,r),c.rotateY(i),c.translate(e,s+.035,t),this.still.push(c);let l=new ql(.92,1.18,22,1);if(l.rotateX(-Math.PI/2),l.scale(n,1,r),l.rotateY(i),l.translate(e,s+.025,t),this.push(l,X(o)),a){let a=Math.round(6+(n+r)*2);for(let o=0;o<a;o++){let s=o/a*Math.PI*2+this.rand()*.3,c=Math.cos(s)*n*1.12,l=Math.sin(s)*r*1.12,u=Math.cos(i),d=Math.sin(i);this.rand()<.55&&this.rock(e+c*u+l*d,t-c*d+l*u,.12+this.rand()*.14,`#a39d92`)}}this.waters.push({x:e,z:t,r:Math.max(n,r)})}ribbon(e,t,n=!0,r=`#b9a47a`){let i=new Bc(e),a=Math.max(12,Math.round(i.getLength()*3)),o=[],s=[],c=[],l=[];for(let e=0;e<=a;e++){let n=e/a,r=i.getPoint(n),u=i.getTangent(n),d=new U(-u.z,0,u.x).normalize(),f=t*(.85+.2*Math.sin(n*11+r.x)),p=this.groundY(r.x,r.z)+.04;if(o.push(r.x+d.x*f,p,r.z+d.z*f,r.x-d.x*f,p,r.z-d.z*f),c.push(r.x+d.x*f*1.35,p-.012,r.z+d.z*f*1.35,r.x-d.x*f*1.35,p-.012,r.z-d.z*f*1.35),s.push(0,n*a*.25,1,n*a*.25),e<a){let t=e*2;l.push(t,t+1,t+2,t+1,t+3,t+2)}e%3==0&&this.keep.push({x:r.x,z:r.z,r:f*1.5})}let u=new Yo;u.setAttribute(`position`,new Lo(o,3)),u.setAttribute(`uv`,new Lo(s,2)),u.setIndex(l),u.computeVertexNormals(),(n?this.flowing:this.still).push(u);let d=new Yo;d.setAttribute(`position`,new Lo(c,3)),d.setIndex(l.slice()),d.computeVertexNormals(),this.push(d,X(r));for(let e=0;e<=6;e++){let n=i.getPoint(e/6);this.waters.push({x:n.x,z:n.z,r:t})}}reeds(e,t,n){for(let r=0;r<n;r++){let n=e+(this.rand()-.5)*.9,r=t+(this.rand()-.5)*.9,i=.45+this.rand()*.45,a=new Oc(.025,i,3);if(a.rotateZ((this.rand()-.5)*.3),a.translate(n,this.groundY(n,r)+i/2,r),this.push(a,X(this.rand()<.4?`#b6a66a`:`#7fa252`)),this.rand()<.4){let e=rh(.03,.08,.03,0);e.translate(n,this.groundY(n,r)+i,r),this.push(e,X(`#7a5a3a`))}}}fern(e,t,n,r=`#4f8f3e`){let i=this.groundY(e,t);for(let a=0;a<7;a++){let o=rh(n*.5,n*.03,n*.12,0);o.translate(n*.45,0,0),o.rotateZ(.55+this.rand()*.25),o.rotateY(a/7*Math.PI*2+this.rand()*.4),o.translate(e,i+.02,t),this.push(o,X(r).offsetHSL(0,0,(this.rand()-.5)*.08))}}treeFern(e,t,n){let r=this.groundY(e,t);this.push($m(new U(e,r,t),new U(e+.05,r+n,t),.09,.07,5),X(`#5a4232`));for(let i=0;i<9;i++){let a=rh(n*.42,.03,n*.09,0);a.translate(n*.38,0,0),a.rotateZ(-.35-this.rand()*.3),a.rotateY(i/9*Math.PI*2),a.translate(e+.05,r+n,t),this.push(a,X(`#4c8a3a`).offsetHSL(0,0,(this.rand()-.5)*.08))}}miniTree(e,t,n){let r=this.groundY(e,t),i=new U(e,r,t),a=e=>X(e).offsetHSL((this.rand()-.5)*.02,0,(this.rand()-.5)*.07),o=(e,t,n,r,i,a=.85)=>{let o=new Gl(r,1);Qm(o,r*.25,e+n,!0),o.scale(1,a,1),o.translate(e,t,n),this.push(o,e=>i.clone().offsetHSL(0,0,(e-t)/r*.05))},s=(n,r,i,a)=>{let o=new Oc(r,i,7,1);o.translate(e,n+i/2,t),this.push(o,e=>a.clone().offsetHSL(0,0,(e-n)/i*.08-.03))};switch(this.form){case`round`:case`banyan`:{this.push($m(i,new U(e,r+n*.45,t),n*.06,n*.04,5),X(`#7a6655`));let s=a(this.form===`banyan`?`#3c7534`:`#4c8f3c`);if(o(e,r+n*.62,t,n*.33,s),o(e+n*.22,r+n*.5,t+n*.1,n*.24,s),o(e-n*.2,r+n*.52,t-n*.08,n*.24,s),this.form===`banyan`)for(let i=0;i<3;i++)this.push($m(new U(e+(i-1)*n*.2,r+n*.45,t),new U(e+(i-1)*n*.22,r,t+.05),.02,.02,3),X(`#a8977a`));break}case`tiered`:this.push($m(i,new U(e,r+n,t),n*.05,n*.02,5),X(`#8f8b80`));for(let i=0;i<3;i++){let o=rh(n*(.3-i*.07),n*.05,n*(.3-i*.07),1);o.translate(e,r+n*(.45+i*.2),t),this.push(o,a(`#6a9c44`));let s=new Gl(n*.04,0);s.translate(e+n*.15,r+n*(.5+i*.2),t+n*.08),this.push(s,X(`#d8352a`))}break;case`narrowCone`:this.push($m(i,new U(e,r+n*.3,t),n*.05,n*.03,5),X(`#8a4b2e`)),s(r+n*.15,n*.2,n*.88,a(`#7fb552`));break;case`fan`:this.push($m(i,new U(e,r+n*.55,t),n*.05,n*.03,5),X(`#8a8274`)),o(e,r+n*.66,t,n*.28,a(this.rand()<.5?`#e8b82a`:`#8ab84a`),1.1);break;case`drooping`:case`cone`:{this.push($m(i,new U(e,r+n*.2,t),n*.05,n*.03,5),X(`#5a4a3e`));let o=a(this.form===`drooping`?`#5d8f7c`:`#2e5a3c`);for(let e=0;e<3;e++)s(r+n*(.12+e*.24),n*(.3-e*.07),n*.42,o);break}case`column`:this.push($m(i,new U(e,r+n*.5,t),n*.06,n*.03,6),X(`#9a4a2c`)),s(r+n*.35,n*.15,n*.68,a(`#2f5e3a`));break;case`eucalypt`:this.push($m(i,new U(e,r+n*.7,t),n*.05,n*.03,6),X(`#e2ddcf`)),o(e,r+n*.78,t,n*.22,a(`#7d9468`),1.1),o(e+n*.14,r+n*.7,t,n*.16,a(`#91a883`),1.1)}}stoneWall(e,t,n,r){let i=Math.round(n/.34);for(let a=0;a<i;a++)for(let i=0;i<2;i++){let o=(a+(i?.5:0))*.34-n/2,s=e+Math.cos(r)*o,c=t-Math.sin(r)*o,l=new Tc(.34,.2,.28);Qm(l,.05,s*3+c+i,!1),l.rotateY(r),l.translate(s,this.groundY(e,t)+.1+i*.2,c),this.push(l,X(`#9c9486`).offsetHSL(0,0,(this.rand()-.5)*.1))}}house(e,t,n,r=1){let i=this.groundY(e,t),a=new Tc(1.4*r,.8*r,1*r);a.rotateY(n),a.translate(e,i+.4*r,t),this.push(a,X(`#e6e0d2`));let o=new Dc(.01,.78*r,.55*r,4,1);o.rotateY(Math.PI/4),o.scale(1.45,1,1.05),o.rotateY(n),o.translate(e,i+.8*r+.27*r,t),this.push(o,X(`#5b6670`));let s=new Tc(.02,.45*r,.26*r);s.translate(.71*r,.22*r,0),s.rotateY(n),s.translate(e,i,t),this.push(s,X(`#8a3a2a`))}shrine(e,t){let n=this.groundY(e,t),r=new Tc(.45,.45,.35);r.translate(e,n+.22,t),this.push(r,X(`#c43a2a`));let i=new Dc(.01,.38,.22,4);i.rotateY(Math.PI/4),i.translate(e,n+.56,t),this.push(i,X(`#3f5a4a`));let a=new Dc(.01,.01,.2,3);a.translate(e+.3,n+.1,t),this.push(a,X(`#e8c070`))}lantern(e,t){let n=this.groundY(e,t),r=[[new Dc(.18,.22,.12,6),.06],[new Dc(.07,.08,.45,6),.34],[new Tc(.26,.2,.26),.66],[new Dc(.02,.26,.16,4),.84]];for(let[i,a]of r)i.translate(e,n+a,t),this.push(i,X(`#a8a397`));let i=new Tc(.14,.1,.27);i.translate(e,n+.66,t),this.push(i,X(`#f3d27a`))}pavilion(e,t,n){let r=this.groundY(e,t)+.3;for(let[i,a]of[[-1,-1],[1,-1],[-1,1],[1,1]]){let o=new Dc(.06*n,.07*n,1.1*n,6);o.translate(e+i*.6*n,r+.55*n,t+a*.6*n),this.push(o,X(`#b8322a`))}let i=new Oc(1.15*n,.55*n,4,1);i.rotateY(Math.PI/4),i.translate(e,r+1.35*n,t),this.push(i,X(`#3f5f58`));let a=new Dc(1.05*n,1.2*n,.08*n,4);a.rotateY(Math.PI/4),a.translate(e,r+1.08*n,t),this.push(a,X(`#2f4a44`));let o=new Xl(.1*n,6,4);o.translate(e,r+1.66*n,t),this.push(o,X(`#d8b050`))}platform(e,t,n,r,i,a){let o=new Tc(n,i,r);o.rotateY(a),o.translate(e,this.groundY(e,t)+i/2-.05,t),this.push(o,n=>n>i*.6-.05+this.groundY(e,t)?X(`#c9c1b0`):X(`#a8a090`));for(let o=-2;o<=2;o++){let s=new Tc(n*.98,.012,.03);s.translate(0,0,o*r/5.5),s.rotateY(a),s.translate(e,this.groundY(e,t)+i-.04,t),this.push(s,X(`#9a9282`))}}seaStack(e,t,n){let r=new Dc(n*.18,n*.3,n,6,3);Qm(r,n*.08,e+t,!1),r.translate(e,-.8+n/2,t),this.push(r,e=>e>n-1.2?X(`#6f8a5a`):X(`#5f5a55`))}cliffFall(e,t,n){let r=Math.atan2(t,e),i=new Tc(1.8,n,1.3,2,3,2);Qm(i,.25,e+t,!1),i.rotateY(-r);let a=this.groundY(e,t);i.translate(e,a+n/2,t),this.push(i,e=>e>a+n*.9?X(`#6f9f5c`):X(`#8d857a`));let o=e+Math.cos(r+1.2)*.1,s=t+Math.sin(r+1.2)*.1;this.falls.push({x:o-Math.cos(Tg)*-.7,z:s-Math.sin(Tg)*-.7,a:Tg,top:a+n*.95,h:n}),this.pool(o+Math.cos(Tg)*1.4,s+Math.sin(Tg)*1.4,.9,.7,0,!0)}},jg=new Set([`rocks`,`boulders`,`shrubs`,`flowers`,`drygrass`,`ferns`,`treeferns`,`forest`,`reeds`,`scree`,`snow`]);function Mg(e,t,n=`low`){let r=xg(e),i=Math.max(0,Math.min(4,Math.round(t))),a=yg[i],o=new Ga;o.name=`habitat`;let s=new Ag(lt(e).form),c=new Set,l=X(r.grass),u=nt(e);s.reachIn=!0;for(let e=1;e<=i;e++){s.rIn=yg[e-1],s.R=yg[e];for(let t of r.adds[e])s.rand=rt(u+nt(t)*7+e*131),c.add(t),jg.has(t)||Ng(s,t,e)}s.reachIn=!1;let d=new Set;for(let e=1;e<=i;e++){s.rIn=yg[e-1],s.R=yg[e];let t=Math.PI*(s.R*s.R-s.rIn*s.rIn);for(let t of r.adds[e])d.add(t);for(let n of d)jg.has(n)&&(s.rand=rt(u+nt(n)*13+e*977),Fg(s,n,t));s.rand=rt(u+e*4099);let i=d.has(`drygrass`),a=Math.round(t*(n===`high`?5:3.2));for(let e=0;e<a;e++){let e=s.rand()*Math.PI*2,t=Math.sqrt(s.rIn*s.rIn+s.rand()*(s.R*s.R-s.rIn*s.rIn)),n=Math.cos(e)*t,r=Math.sin(e)*t;if(t>s.R-.25||s.waters.some(e=>Math.hypot(e.x-n,e.z-r)<e.r+.25))continue;let a=i&&s.rand()<.65?new G().setHSL(.12+s.rand()*.03,.5,.55+s.rand()*.1):new G().setHSL(.24+s.rand()*.06,.5,.34+s.rand()*.14);s.tufts.push({x:n,z:r,s:.7+s.rand()*1,c:a})}}if(s.R=a,i>=1){let e=Math.ceil(a/.9),t=[],n=[],r=(e,t,n)=>n>a-.35?s.groundY(e,t)-.12:s.groundY(e,t),i=c.has(`drygrass`),d=c.has(`snow`),f=c.has(`scree`),p=(e,t,n)=>{let r=l.clone(),o=Math.sin(e*.9)*Math.cos(t*.8)+Math.sin(e*2.3+t*1.7)*.4;r.offsetHSL(0,0,o*.03);let s=Math.atan2(t,e);return i&&o>-.2&&r.lerp(X(`#c8b466`),.45),f&&Dg(s,Eg)<1.2&&n>wg+1.5&&o>.2&&r.lerp(X(`#9a948a`),.6),d&&Dg(s,Eg)<1.3&&n>a-3.5&&o>-.3&&r.lerp(X(`#eef3f6`),.8),r},m=t=>t===0?0:wg-.5+(a-wg+.5)*(t-1)/(e-1);for(let i=0;i<e;i++){let e=m(i),a=m(i+1);for(let i=0;i<72;i++){let o=i/72*Math.PI*2,s=(i+1)/72*Math.PI*2,c=[[Math.cos(o)*e,Math.sin(o)*e,e],[Math.cos(s)*e,Math.sin(s)*e,e],[Math.cos(s)*a,Math.sin(s)*a,a],[Math.cos(o)*a,Math.sin(o)*a,a]],l=(e,i,a)=>{let o=(c[e][0]+c[i][0]+c[a][0])/3,s=(c[e][1]+c[i][1]+c[a][1])/3,l=p(o,s,Math.hypot(o,s));for(let o of[e,i,a])t.push(c[o][0],r(c[o][0],c[o][1],c[o][2]),c[o][1]),n.push(l.r,l.g,l.b)};e===0?l(0,3,2):(l(0,3,2),l(0,2,1))}}let h=new Yo;h.setAttribute(`position`,new Lo(t,3)),h.setAttribute(`color`,new Lo(n,3)),h.computeVertexNormals();let g=new K(h,new lu({vertexColors:!0,flatShading:!0,roughness:.95,side:2}));g.receiveShadow=!0,o.add(g);let _=new Dc(a,a*.9,1,48,2,!0);Qm(_,.35,5,!1),_.translate(0,-.62,0);let v=new Oc(a*.92,Math.min(a*1.3,17),20,5);v.rotateX(Math.PI),Qm(v,1,9,!1);let y=Math.min(a*1.3,17);v.translate(0,-1.1-y/2,0),eh(_,X(`#8a6446`)),eh(v,e=>new G().lerpColors(X(`#6d6a66`),X(`#8f7155`),qi.clamp((e+y*.5)/(y*.5),0,1)));let b=new K(th([_,v],!0),new lu({vertexColors:!0,flatShading:!0,roughness:.95}));o.add(b);let x=new U(4.75,0,5.05),S=Math.atan2(x.z,x.x),C=[x.clone(),new U(Math.cos(S+.05)*(wg+1),0,Math.sin(S+.05)*(wg+1))];for(let e=wg+2.2;e<a-.4;e+=1.8)C.push(new U(Math.cos(S+Math.sin(e)*.06)*e,0,Math.sin(S+Math.sin(e)*.06)*e));C.push(new U(Math.cos(S)*(a+.05),0,Math.sin(S)*(a+.05))),s.rand=rt(u+5),s.ribbon(C,.34,!0),s.falls.push({x:Math.cos(S)*(a+.08),z:Math.sin(S)*(a+.08),a:S,top:-.02,h:5.5})}let f=[];if(s.solids.length){let e=th(s.solids,!0);f.push(e);let t=new K(e,new lu({vertexColors:!0,flatShading:!0,roughness:.9}));t.receiveShadow=!0,t.castShadow=n===`high`,o.add(t)}let p=Og(!1),m=Og(!0);m.repeat.set(.35,.35);let h=new lu({map:p,roughness:.25,metalness:.05,emissive:`#1d5f80`,emissiveIntensity:.25}),g=new lu({map:m,roughness:.15,metalness:.1,emissive:`#1d5f80`,emissiveIntensity:.2});if(s.flowing.length){let e=th(s.flowing);f.push(e),o.add(new K(e,h))}if(s.still.length){let e=th(s.still.map(e=>{let t=e.getAttribute(`position`),n=new Float32Array(t.count*2);for(let e=0;e<t.count;e++)n[e*2]=t.getX(e),n[e*2+1]=t.getZ(e);return e.setAttribute(`uv`,new Po(n,2)),e})),t=e.getAttribute(`position`),n=new Float32Array(t.count*2);for(let e=0;e<t.count;e++)n[e*2]=t.getX(e),n[e*2+1]=t.getZ(e);e.setAttribute(`uv`,new Po(n,2)),f.push(e),o.add(new K(e,g))}let _=o.children.find(e=>e.material===h);if(_){let e=_.geometry.getAttribute(`position`),t=new Float32Array(e.count*2);for(let n=0;n<e.count;n++)t[n*2]=(e.getX(n)+e.getZ(n))*.35,t[n*2+1]=Math.hypot(e.getX(n),e.getZ(n))*.6;_.geometry.setAttribute(`uv`,new Po(t,2))}let v=Og(!1),y=new lu({map:v,transparent:!0,opacity:.82,roughness:.3,side:2,emissive:`#2a7aa0`,emissiveIntensity:.3,depthWrite:!1});for(let e of s.falls){let t=new Kl(e.h>5?.8:.6,e.h,1,3);f.push(t);let n=new K(t,y);n.position.set(e.x,e.top-e.h/2,e.z),n.rotation.y=-e.a+Math.PI/2,o.add(n)}let b=new Oc(.045,.16,3);b.translate(0,.08,0),f.push(b);let x=new Ys(b,new lu({flatShading:!0,roughness:.9}),Math.max(1,s.tufts.length)),S=new Gl(.07,0);f.push(S);let C=new Ys(S,new lu({flatShading:!0,roughness:.7}),Math.max(1,s.flowers.length)),w=new _a,T=new Ji,E=new Da;s.tufts.forEach((e,t)=>{T.setFromEuler(E.set((Math.sin(t)-0)*.2,t*2.4,Math.cos(t*1.3)*.2)),w.compose(new U(e.x,s.groundY(e.x,e.z),e.z),T,new U(e.s,e.s*(.9+t%5*.12),e.s)),x.setMatrixAt(t,w),x.setColorAt(t,e.c)}),x.count=s.tufts.length,s.flowers.forEach((e,t)=>{w.compose(new U(e.x,s.groundY(e.x,e.z)+.1,e.z),T.identity(),new U(e.s,e.s*.7,e.s)),C.setMatrixAt(t,w),C.setColorAt(t,e.c)}),C.count=s.flowers.length,s.tufts.length&&o.add(x),s.flowers.length&&o.add(C);let D=kg(),O=[];for(let e of s.fog){let t=new ys(new as({map:D,color:`#f4f8fa`,transparent:!0,opacity:.55,depthWrite:!1,fog:!0}));t.scale.set(e.s*2.2,e.s,1),t.position.set(e.x,e.y,e.z),o.add(t),O.push({sp:t,x:e.x,z:e.z,y:e.y,ph:e.x*.7+e.z})}return{group:o,radius:a,stage:i,groundAt:(e,t)=>s.groundY(e,t),update(e){p.offset.y=-e*.35,v.offset.y=e*.9,m.offset.set(Math.sin(e*.13)*.4,e*.02),g.emissiveIntensity=.18+Math.sin(e*1.1)*.05;for(let t of O)t.sp.position.set(t.x+Math.sin(e*.05+t.ph)*1.2,t.y+Math.sin(e*.3+t.ph)*.1,t.z+Math.cos(e*.04+t.ph)*.8),t.sp.material.opacity=.42+Math.sin(e*.2+t.ph)*.12},dispose(){o.traverse(e=>{let t=e;t.geometry?.dispose();let n=t.material;n&&n!==y&&n.dispose()}),f.forEach(e=>e.dispose()),p.dispose(),m.dispose(),v.dispose(),D.dispose(),y.dispose()}}}function Ng(e,t,n){let r=e.R,i=r/10;switch(t){case`hills`:{let t=3+n;for(let n=0;n<t;n++){let t=e.spot(1.6*i+e.rand()*1.2,n%3==2?`side`:`back`,!0);if(!t)continue;e.claim(t,-.4);let r=Pg(e.form);e.hill(t.x,t.z,t.r,.8+e.rand()*1.2*i,r)}break}case`mountains`:case`snowpeaks`:{let n=t===`snowpeaks`?5:4;for(let r=0;r<n;r++){let n=(1.8+e.rand()*1.4)*i*(t===`snowpeaks`?1.2:1),r=e.spot(n,`back`,!0,void 0,void 0,60);if(!r)continue;e.claim(r,-n*.3);let a=n*(t===`snowpeaks`?2.6:1.9)*(.8+e.rand()*.4),o=e.form===`eucalypt`?`#6f8f6a`:`#6a9a58`,s=e.form===`eucalypt`?`#7d8a96`:`#8b8378`;e.mountain(r.x,r.z,n,a,t===`snowpeaks`||t===`mountains`&&(e.form===`drooping`||e.form===`cone`),o,s)}break}case`pond`:{let t=e.spot(1.5,`back`)??e.spot(1.3,`side`)??e.spot(1.2,`any`);t&&(e.claim(t,.4),e.pool(t.x,t.z,t.r,t.r*.7,e.rand()*3,!0));break}case`lotus`:for(let t of e.waters.filter(e=>e.r>.7).slice(0,4))for(let n=0;n<7;n++){let n=e.rand()*6.28,r=e.rand()*t.r*.7,i=t.x+Math.cos(n)*r,a=t.z+Math.sin(n)*r,o=new Ec(.16+e.rand()*.08,7,.3,5.8);if(o.rotateX(-Math.PI/2),o.translate(i,e.groundY(t.x,t.z)+.05,a),e.push(o,X(`#4f9a3e`)),e.rand()<.45){let n=new Oc(.07,.1,5,1,!0);n.rotateX(Math.PI),n.translate(i,e.groundY(t.x,t.z)+.12,a),e.push(n,X(`#f2a0bc`))}}break;case`lake`:{let t=e.spot(2.4*i,`back`,!1,void 0,void 0,60)??e.spot(2*i,`side`,!1,void 0,void 0,60)??e.spot(1.8*i,`any`);t&&(e.claim(t,.5),e.pool(t.x,t.z,t.r*1.2,t.r*.85,Math.atan2(t.z,t.x),!0,`#b3a57e`));break}case`river`:{let t=Eg-1.4,n=[],i=(e.rIn+r)/2+.2;for(let e=0;e<=8;e++){let r=t+e/8*2.6,a=i+Math.sin(e*1.3)*.5;n.push(new U(Math.cos(r)*a,0,Math.sin(r)*a))}e.ribbon(n,.7,!0,`#cdb888`);break}case`creek`:{let t=Eg+(e.rand()-.5)*1.2,n=[];for(let e=0;e<=6;e++){let i=r-.3-e/6*(r-wg-1),a=t+e*.12+Math.sin(e*1.7)*.1;n.push(new U(Math.cos(a)*i,0,Math.sin(a)*i))}e.ribbon(n,.22,!0,`#a8a08c`);let i=n[n.length-1];e.pool(i.x,i.z,.55,.45,0,!0);break}case`wetland`:for(let t=0;t<6;t++){let n=e.spot(.5+e.rand()*.5,t<3?`side`:`any`);n&&(e.claim(n,.2),e.pool(n.x,n.z,n.r,n.r*.7,e.rand()*3,!1,`#8f8a5a`),e.reeds(n.x+n.r,n.z,6))}break;case`waterfall`:{let t=e.spot(1.2,`back`,!0)??e.spot(1.2,`side`,!0);t&&(e.claim(t,1.2),e.cliffFall(t.x*.94,t.z*.94,2.2+i));break}case`fog`:for(let t=0;t<7;t++){let t=Eg+(e.rand()-.5)*3.2,n=e.rIn+e.rand()*(r-e.rIn+2);e.fog.push({x:Math.cos(t)*n,y:.4+e.rand()*1.4,z:Math.sin(t)*n,s:3+e.rand()*3})}break;case`coast`:for(let t=0;t<26;t++){let n=2.25+t/26*2.2,i=r-.5,a=new Ec(.75,6);a.rotateX(-Math.PI/2),a.translate(Math.cos(n)*i,e.groundY(Math.cos(n)*i,Math.sin(n)*i)+.015,Math.sin(n)*i),e.push(a,X(`#d9c9a0`))}for(let t=0;t<5;t++){let t=2.55+e.rand()*2,n=r+.6+e.rand()*1.8;e.seaStack(Math.cos(t)*n,Math.sin(t)*n,2.2+e.rand()*2.8)}break;case`wall`:for(let t=0;t<3;t++){let n=(e.frontBias?Tg:Eg)+(t-1)*.7+(e.rand()-.5)*.2,r=e.rIn+.7,i=Math.cos(n)*r,a=Math.sin(n)*r;e.free(i,a,.5)&&(e.stoneWall(i,a,2.2+e.rand(),-n+Math.PI/2),e.keep.push({x:i,z:a,r:1.3}))}break;case`village`:for(let t=0;t<2;t++){let n=e.spot(1.1,t?`side`:`back`);n&&(e.claim(n,.3),e.house(n.x,n.z,-Math.atan2(n.z,n.x)+Math.PI,.95+e.rand()*.2))}break;case`shrine`:{let t=e.spot(.5,`side`);t&&(e.claim(t),e.shrine(t.x,t.z));break}case`courtyard`:{let t=e.spot(2,`side`,!1,void 0,void 0,60)??e.spot(2,`view`,!1,void 0,void 0,60);if(t){e.claim(t,.2);let n=-Math.atan2(t.z,t.x);e.platform(t.x,t.z,3,3,.35,n),e.court=t}break}case`steps`:{let t=.65;for(let n=0;n<6;n++){let r=e.rIn+.3+n*.32,i=Math.cos(t)*r,a=Math.sin(t)*r,o=.1+(5-n)*.07,s=new Tc(.34,o,1.2);s.rotateY(-.65),s.translate(i,e.groundY(i,a)+o/2-.03,a),e.push(s,X(`#b8b0a0`).offsetHSL(0,0,n%2*.03)),e.keep.push({x:i,z:a,r:.7})}break}case`lanterns`:{let t=e.court;for(let n=0;n<4;n++){let r,i;if(t&&n<2){let e=Math.atan2(t.z,t.x)+(n?.35:-.35),a=Math.hypot(t.x,t.z)-2.2;r=Math.cos(e)*a,i=Math.sin(e)*a}else{let t=e.spot(.3,`any`);if(!t)continue;r=t.x,i=t.z}e.lantern(r,i),e.keep.push({x:r,z:i,r:.35})}break}case`pavilion`:{let t=e.court;if(t)e.pavilion(t.x,t.z,1);else{let t=e.spot(1.1,`back`);t&&(e.claim(t),e.pavilion(t.x,t.z,1))}break}}}function Pg(e){switch(e){case`tiered`:return`#b9a866`;case`drooping`:return`#8a9a78`;case`eucalypt`:return`#7f9a66`;default:return`#6ea452`}}function Fg(e,t,n){let r=e=>Math.round(n*e);switch(t){case`rocks`:for(let t=0;t<r(.12);t++){let t=e.spot(.25+e.rand()*.25);t&&e.rock(t.x,t.z,t.r,`#9b958c`,!1)}break;case`boulders`:for(let t=0;t<r(.03)+1;t++){let t=e.spot(.7+e.rand()*.6,e.rand()<.6?`back`:`side`);t&&(e.claim(t),e.rock(t.x,t.z,t.r,`#8f8a82`,e.form===`drooping`||e.form===`cone`),e.rock(t.x+t.r*.9,t.z-t.r*.4,t.r*.5,`#9b958c`))}break;case`scree`:for(let t=0;t<r(.25);t++){let t=e.spot(.15+e.rand()*.15,`back`);t&&e.rock(t.x,t.z,t.r,`#a39e96`)}break;case`snow`:for(let t=0;t<r(.05);t++){let t=e.spot(.6+e.rand()*.8,`back`);if(!t)continue;let n=new Ec(t.r,7);n.rotateX(-Math.PI/2),n.translate(t.x,e.groundY(t.x,t.z)+.02,t.z),e.push(n,X(`#f4f7fa`))}break;case`shrubs`:for(let t=0;t<r(.1);t++){let t=e.spot(.3+e.rand()*.35);t&&(e.claim(t,-.1),e.bush(t.x,t.z,t.r,e.form===`tiered`?`#7a8a4a`:`#4f8a3a`))}break;case`flowers`:{let t=e.form===`fan`?[`#f7b7c8`,`#ffffff`,`#f3d35b`]:e.form===`banyan`?[`#f06a8a`,`#ffd35b`,`#ffffff`]:[`#ffffff`,`#f3d35b`,`#c9b3f0`,`#f7b7c8`];for(let n=0;n<r(1.2);n++){let n=e.rand()*Math.PI*2,r=e.rIn+.3+e.rand()*(e.R-e.rIn-.6),i=Math.cos(n)*r,a=Math.sin(n)*r;e.free(i,a,.05)&&!e.waters.some(e=>Math.hypot(e.x-i,e.z-a)<e.r+.2)&&e.flowers.push({x:i,z:a,s:.7+e.rand()*.8,c:X(t[Math.floor(e.rand()*t.length)])})}break}case`drygrass`:for(let t=0;t<r(.06);t++){let t=e.spot(.35+e.rand()*.2);t&&e.bush(t.x,t.z,t.r*.8,`#c2a95a`)}break;case`ferns`:for(let t=0;t<r(.18);t++){let t=e.spot(.35+e.rand()*.25);t&&e.fern(t.x,t.z,t.r*1.6,e.form===`column`?`#3f7f36`:`#4f8f3e`)}break;case`treeferns`:for(let t=0;t<r(.03)+1;t++){let t=e.spot(.6,e.rand()<.5?`side`:`back`);t&&(e.claim(t),e.treeFern(t.x,t.z,1.3+e.rand()*.8))}break;case`forest`:for(let t=0;t<r(.06)+2;t++){let t=e.spot(.6+e.rand()*.3,e.rand()<.65?`back`:`side`);if(!t)continue;e.claim(t,.05);let n=Math.hypot(t.x,t.z);e.miniTree(t.x,t.z,(1.6+e.rand()*1.2)*(.8+(n-7)*.06)*(e.form===`column`||e.form===`narrowCone`||e.form===`cone`?1.5:1))}break;case`reeds`:{let t=e.waters.slice(0,10);for(let n=0;n<Math.max(3,r(.04));n++){let r=t[n%Math.max(1,t.length)];if(r){let t=e.rand()*6.28;e.reeds(r.x+Math.cos(t)*(r.r+.2),r.z+Math.sin(t)*(r.r+.2),7)}else{let t=e.spot(.4);t&&e.reeds(t.x,t.z,7)}}break}}}var Ig=[[0,.35],[18,.7],[50,1.15],[200,2.3],[800,4.4],[2e3,6.7],[5e3,9.5],[11600,13],[2e4,15]];function Lg(e){let t=Math.max(0,e);for(let e=1;e<Ig.length;e++){let[n,r]=Ig[e],[i,a]=Ig[e-1];if(t<=n){let e=i===0?t/n:Math.log(t/i)/Math.log(n/i);return a+(r-a)*R(e,0,1)}}return Ig[Ig.length-1][1]}var Rg={uTime:{value:0},uWind:{value:.1},uHeight:{value:3},uGust:{value:0}},zg=null;function Bg(){if(zg)return zg;let e=new lu({vertexColors:!0,flatShading:!0,roughness:.82,side:2});return e.onBeforeCompile=e=>{Object.assign(e.uniforms,Rg),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
uniform float uTime; uniform float uWind; uniform float uHeight; uniform float uGust;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        float hk = clamp(position.y / max(uHeight, 0.5), 0.0, 1.2);
        float bend = hk * hk;
        float ph = position.x * 1.7 + position.z * 1.3;
        float flutter = sin(uTime * (2.2 + uWind * 5.0) + ph * 2.0) * 0.5 + sin(uTime * 3.7 + ph * 3.1) * 0.25;
        float sway = sin(uTime * (0.9 + uWind * 1.4) + position.y * 0.35);
        float amp = uHeight * (0.004 + uWind * 0.03) * (1.0 + uGust * 0.8);
        transformed.x += (sway * 0.7 + flutter * 0.35) * amp * bend + uGust * uWind * bend * uHeight * 0.02;
        transformed.z += (cos(uTime * 1.1 + ph) * 0.4 + flutter * 0.3) * amp * bend;
        transformed.y += flutter * amp * 0.25 * hk;`)},zg=e,e}var Vg=null;function Hg(){return Vg??=new lu({vertexColors:!0,flatShading:!0,roughness:.92}),Vg}var Z=U,Ug=e=>new G(e),Wg=class{rand;V;stage;health;fullness;density;bark=[];leaves=[];spots=[];trunkPts=[];trunkTop=0;trunkRadius=.05;crownY=0;nest=null;hollow=null;extraHeight=0;p;constructor(e){this.p=e,this.rand=rt(e.seed||7),this.V=Lg(e.heightCm),this.stage=R(Math.round(e.stage),0,4),this.health=e.health,this.density=R((e.health-10)/75,0,1),this.fullness=.62+.38*this.density}leaf(e,t=.05,n=0){let r=Ug(e),i={h:0,s:0,l:0};r.getHSL(i),r.setHSL(i.h+(this.rand()-.5)*t*.4,R(i.s+(this.rand()-.5)*t,0,1),R(i.l+(this.rand()-.5)*t+n,0,1));let a=new G().setHSL(.1+this.rand()*.03,.45,.4);return r.lerp(a,R((60-this.health)/50,0,.85))}trunk(e,t,n,r,i={}){let a=i.segs??5,o=i.wobble??.03,s=this.p.seed,c=[new Z(0,0,0)];for(let t=1;t<=a;t++){let n=t/a;c.push(new Z(Math.sin(n*2.2+s)*this.V*o,e*n,Math.cos(n*1.7+s)*this.V*o*.7))}let l=[];for(let e=0;e<a;e++){let r=t+(n-t)*(e/a),o=t+(n-t)*((e+1)/a);l.push($m(c[e],c[e+1],r,o,i.sides??8))}let u=th(l);i.jitter&&Qm(u,t*i.jitter,s,!1),eh(u,typeof r==`string`?(()=>{let e=Ug(r);return t=>e.clone().offsetHSL(0,0,Math.sin(t*7)*.02)})():r),this.bark.push(u),this.trunkPts=c,this.trunkTop=e,this.trunkRadius=t}trunkAt(e){let t=this.trunkPts,n=R(e,0,1)*(t.length-1),r=Math.min(t.length-2,Math.floor(n));return new Z().lerpVectors(t[r],t[r+1],n-r)}limb(e,t,n,r,i,a=5){this.bark.push(eh($m(e,t,n,r,a),Ug(i)))}skip(){if(this.stage===0||this.spots.length<6)return!1;let e=R((.6-this.density)*.85,0,.45);return e>0&&this.rand()<e}blob(e,t,n,r=.82,i=1,a=!0){if(a&&this.skip())return;let o=new Gl(t,i);Qm(o,t*.26,e.x*3.1+e.z*1.7+this.p.seed,!0),o.scale(1,r,1),o.translate(e.x,e.y,e.z);let s=n.clone().offsetHSL(0,0,.06),c=n.clone().offsetHSL(0,0,-.07);eh(o,n=>c.clone().lerp(s,R((n-(e.y-t))/(2*t),0,1))),this.leaves.push(o),a&&this.spots.push({c:e.clone(),r:t,col:n})}cone(e,t,n,r,i=8,a=0){let o=new Oc(t,n,i,2);Qm(o,t*.14,e.y*2.3+this.p.seed,!1),o.translate(e.x,e.y+n/2+a,e.z);let s=r.clone().offsetHSL(0,0,.07),c=r.clone().offsetHSL(0,-.05,-.08);eh(o,t=>c.clone().lerp(s,R((t-e.y)/n,0,1))),this.leaves.push(o),this.spots.push({c:new Z(e.x,e.y+n*.35,e.z),r:t*.8,col:r})}spray(e,t,n,r,i,a=0){if(this.skip())return;let o=rh(n/2,r*.22,r/2,1);Qm(o,r*.12,e.y*5+n,!1),o.translate(n/2,0,0),a&&o.rotateZ(-a);let s=Math.atan2(-t.z,t.x),c=Math.asin(R(t.y,-1,1));o.rotateZ(c),o.rotateY(s),o.translate(e.x,e.y,e.z);let l=i.clone().offsetHSL(0,.03,.08);eh(o,(e,t)=>t%3==0?l:i),this.leaves.push(o);let u=e.clone().addScaledVector(t,n*.7);this.spots.push({c:u,r:r*.6,col:i})}accent(e,t,n,r=`ball`){let i;r===`cup`?(i=new Oc(t,t*1.1,5,1,!0),i.rotateX(Math.PI),i.translate(0,t*.4,0)):r===`cone`?i=new Dc(t*.55,t*.7,t*2.2,5):r===`fluff`?(i=new Gl(t,0),i.scale(1.2,.9,1.1)):i=new Gl(t,0),i.rotateY(this.rand()*6.28),i.translate(e.x,e.y,e.z),eh(i,Ug(n)),this.leaves.push(i)}onSpot(e,t=.4){let n=new Z(this.rand()-.5,this.rand()*t+(t>0?.1:-.1),this.rand()-.5).normalize();return e.c.clone().addScaledVector(n,e.r*.95)}rootFlare(e,t,n){let r=this.trunkRadius;for(let i=0;i<e;i++){let a=i/e*Math.PI*2+this.rand()*.4,o=r*t*(.8+this.rand()*.5);this.limb(new Z(0,r*1.1,0),new Z(Math.cos(a)*o,.02,Math.sin(a)*o),r*.5,r*.12,n,5)}}trunkSpots(){let e=[];for(let t of[.3,.5,.7]){let n=this.trunkAt(t*Math.min(1,(this.trunkTop||this.V)/this.V)),r=(this.trunkTop||this.V*.5)*t,i=this.trunkRadius*(1-t*.4);for(let t of[.9,1.5,2.2]){let a=new Z(Math.cos(t),0,Math.sin(t));e.push({pos:new Z(n.x+a.x*i,r,n.z+a.z*i),out:a})}}return e}},Gg={round:{leaf:`ovate`,colour:`#5fa040`,stem:`#6f8a3e`},tiered:{leaf:`palmate`,colour:`#6aa84a`,stem:`#7c8a5a`},banyan:{leaf:`small`,colour:`#3f7f38`,stem:`#6f7a4a`},narrowCone:{leaf:`needles`,colour:`#8cc45a`,stem:`#8a5a3a`},fan:{leaf:`fan`,colour:`#86b84c`,stem:`#7a7a5a`},drooping:{leaf:`needles`,colour:`#6f9c8c`,stem:`#6a5a48`},column:{leaf:`needles`,colour:`#3f7248`,stem:`#8a4a30`},eucalypt:{leaf:`round`,colour:`#8fb0a0`,stem:`#9a7a5a`},cone:{leaf:`needles`,colour:`#3f6e48`,stem:`#6b4a35`}};function Kg(e,t){let n=Gg[t],r=e.V;e.trunkRadius=.02+r*.025;let i=new Z(.03,r,0);e.limb(new Z(0,0,0),new Z(-.015,r*.5,.01),e.trunkRadius,e.trunkRadius*.8,n.stem,5),e.limb(new Z(-.015,r*.5,.01),i,e.trunkRadius*.8,e.trunkRadius*.45,n.stem,5),e.trunkPts=[new Z(0,0,0),new Z(-.015,r*.5,.01),i],e.trunkTop=r;let a=2+Math.min(6,Math.floor(e.p.heightCm/7));if(n.leaf===`needles`){let a=2+Math.min(3,Math.floor(e.p.heightCm/12));for(let i=0;i<a;i++){let o=r*(.45+.5*(i/Math.max(1,a-1)));for(let a=0;a<7;a++){let s=a/7*6.28+i,c=(.12+r*.16)*(1-i*.12),l=new Oc(.012+r*.006,c,3);l.translate(0,c/2,0),l.rotateZ(-(t===`drooping`?1.35:1.05)),l.rotateY(s),l.translate(0,o,0),eh(l,e.leaf(n.colour)),e.leaves.push(l)}}e.accent(i,.03+r*.025,n.colour)}else{for(let t=0;t<a;t++){let i=t*2.4+e.rand()*.4,o=r*(.45+.55*(t/Math.max(1,a-1))),s=.09+r*.18*(.7+e.rand()*.4),c=[];if(n.leaf===`palmate`)for(let e=0;e<5;e++){let t=rh(s*.5,.012,s*.16,1);t.translate(s*.5,0,0),t.rotateY((e-2)*.5),c.push(t)}else if(n.leaf===`fan`){let e=new Ec(s*.7,6,-Math.PI/2-.9,1.8);e.rotateX(-Math.PI/2),e.rotateZ(.2),e.translate(s*.2,0,0);let t=e.clone();t.rotateX(Math.PI),c.push(e,t)}else{let e=n.leaf===`small`?.35:n.leaf===`round`?.8:.45,t=n.leaf===`small`?s*.7:s,i=rh(t,.016+r*.01,t*e,1);i.translate(t*.9,0,0),c.push(i)}let l=th(c);l.rotateZ(.45+e.rand()*.3),l.rotateY(i),l.translate(0,o,0),eh(l,e.leaf(n.colour,.06,n.leaf===`round`?.04:0)),e.leaves.push(l),e.spots.push({c:new Z(Math.cos(-i)*s,o+s*.3,Math.sin(-i)*s),r:s*.6})}e.accent(i,.04+r*.03,n.colour)}e.spots.push({c:new Z(0,r*.8,0),r:.15+r*.3}),e.crownY=r}function qg(e,t){let{rand:n}=e,r=(i,a,o,s,c)=>{let l=i.clone().addScaledVector(a,o);if(e.limb(i,l,s,s*.62,t.bark,c===0?6:5),c>=t.depth){t.onTip(l,a,c);return}let u=c===0?2:2+ +(n()<.35);for(let e=0;e<u;e++){let i=e/u*Math.PI*2+n()*1.2,d=new Z(Math.cos(i),0,Math.sin(i)),f=a.clone().multiplyScalar(.7).addScaledVector(d,t.spread??.55).add(new Z(0,.3,0)).normalize();r(l,f,o*(.62+n()*.12),s*.62,c+1)}c>=1&&t.onTip(l,a,c-.5)};for(let i=0;i<t.primaries;i++){let a=i/t.primaries*Math.PI*2+n()*.6+e.p.seed*.1,o=t.from[0]+(t.from[1]-t.from[0])*(i/Math.max(1,t.primaries-1)),s=e.trunkAt(o);s.y=e.trunkTop*o;let c=t.tilt[0]+n()*(t.tilt[1]-t.tilt[0]),l=new Z(Math.cos(a)*Math.cos(c),Math.sin(c),Math.sin(a)*Math.cos(c)).normalize();r(s,l,t.len*(.85+n()*.3),t.radius,0),!e.nest&&Math.sin(a)>.1&&e.stage>=2&&(e.nest={pos:s.clone().addScaledVector(l,t.len*.28),out:new Z(l.x,0,l.z).normalize()})}}function Jg(e){let{V:t,stage:n,rand:r}=e,i=`#7a6655`;e.trunk(t*[0,.46,.4,.34,.3][n],.035+t*.03+n*.03,.03+t*.014,i,{jitter:n>=3?.12:.04});let a=`#4c8f3c`;qg(e,{primaries:[0,3,5,6,8][n],depth:[0,1,2,2,3][n],from:[.7,1],len:t*[0,.34,.36,.38,.4][n],tilt:[.45,.85],radius:e.trunkRadius*.55,bark:i,onTip:i=>{let o=(t*(.12+.05*r())+.08)*e.fullness,s=n>=2&&r()<.16;e.blob(i.clone().add(new Z(0,o*.25,0)),o,s?e.leaf(`#b56a3a`,.06):e.leaf(a,.08))}});let o=e.trunkAt(1),s=t*[0,.18,.24,.28,.3][n]*e.fullness;if(e.blob(new Z(o.x,t*.8,o.z),s,e.leaf(a,.05,.03)),n>=2)for(let n=0;n<4;n++){let i=n*1.57+r();e.blob(new Z(o.x+Math.cos(i)*t*.22,t*.66,o.z+Math.sin(i)*t*.22),s*.8,e.leaf(a,.08))}if(n>=3){for(let n=0;n<70;n++)e.accent(e.onSpot(e.spots[n%e.spots.length],.8),.03+t*.004,`#f3f1d8`);e.rootFlare(5+n,2.6,i)}e.crownY=t*.66}function Yg(e){let{V:t,stage:n,rand:r}=e,i=`#8f8b80`,a=.03+t*.026+n*.022;if(e.trunk(t*.93,a,a*.35,i,{wobble:.01}),n<=2)for(let n=0;n<18;n++){let n=.08+r()*.8,i=e.trunkAt(n),o=r()*6.28,s=a*(1-n*.6),c=new Oc(a*.18,a*.5,4);c.translate(0,a*.25,0),c.rotateZ(-Math.PI/2),c.rotateY(o),c.translate(i.x+Math.cos(o)*s*.9,t*.93*n,i.z-Math.sin(o)*s*.9),e.bark.push(eh(c,Ug(`#7a766c`)))}let o=[0,2,3,4,5][n],s=n>=3;for(let c=0;c<o;c++){let l=.38+.5*c/Math.max(1,o-1),u=t*.93*l,d=e.trunkAt(l),f=4+c%2,p=t*(.34-c/Math.max(1,o)*.2);for(let o=0;o<f;o++){let l=o/f*6.28+c*.7+r()*.3,m=new Z(Math.cos(l),.12+r()*.12,Math.sin(l)).normalize(),h=new Z(d.x,u,d.z),g=h.clone().addScaledVector(m,p*.75),_=g.clone().add(new Z(m.x*p*.25,p*.12,m.z*p*.25));e.limb(h,g,a*.32,a*.14,i),e.limb(g,_,a*.14,a*.08,i),!e.nest&&Math.sin(l)>.2&&c===0&&(e.nest={pos:g.clone(),out:new Z(m.x,0,m.z)});let v=s?1:2;for(let n=0;n<v;n++){let i=new Z().lerpVectors(g,_,n?.3:1),a=(.12+t*.05)*e.fullness;for(let t=0;t<5;t++){let n=rh(a,a*.12,a*.32,0);n.translate(a*.8,0,0),n.rotateZ(.25),n.rotateY(t*1.256+r()),n.translate(i.x,i.y+a*.2,i.z),eh(n,e.leaf(`#6a9c44`,.08)),e.leaves.push(n)}e.spots.push({c:i.clone().add(new Z(0,a*.3,0)),r:a*1.2})}if(s){let i=n===4?5:4;for(let n=0;n<i;n++){let r=new Z().lerpVectors(h,_,.35+n*.16).add(new Z(0,a*.2,0));e.accent(r,.06+t*.009,n%2?`#e0392b`:`#c92a22`,`cup`)}n===4&&r()<.5&&e.accent(_.clone().add(new Z(0,.1,0)),.09+t*.01,`#f5f3ea`,`fluff`)}}}let c=e.trunkAt(1);e.blob(new Z(c.x,t*.97,c.z),(.1+t*.05)*e.fullness,e.leaf(`#6a9c44`)),s&&e.accent(new Z(c.x,t,c.z),.07+t*.009,`#e0392b`,`cup`),n>=3&&e.rootFlare(6+n,3,i),e.crownY=t*.7}function Xg(e){let{V:t,stage:n,rand:r}=e,i=`#948a78`,a=.04+t*.045+n*.035;if(e.trunk(t*.36,a,a*.7,i,{wobble:.06,jitter:.18}),n>=2)for(let r=0;r<n;r++){let n=r*2.3+.5,o=new Z(Math.cos(n)*a*.7,0,Math.sin(n)*a*.7);e.limb(o,o.clone().multiplyScalar(.3).add(new Z(0,t*.34,0)),a*.5,a*.35,i,6)}let o=[];qg(e,{primaries:[0,3,5,7,9][n],depth:[0,1,2,2,3][n],from:[.75,1],len:t*[0,.34,.42,.48,.52][n],tilt:[.18,.5],radius:a*.45,bark:i,spread:.75,onTip:(n,i,a)=>{let s=(t*(.11+.05*r())+.08)*e.fullness;e.blob(n.clone().add(new Z(0,s*.2,0)),s,e.leaf(`#3c7534`,.07),.72),a<3&&o.push(n.clone())}});let s=e.trunkAt(1);e.blob(new Z(s.x,t*.62,s.z),t*.24*e.fullness,e.leaf(`#3c7534`,.05,.02),.7);let c=[0,0,6,18,30][n];for(let s=0;s<c&&o.length;s++){let c=o[s%o.length].clone().add(new Z((r()-.5)*t*.1,-t*.02,(r()-.5)*t*.1)),l=n===4&&s%5==0,u=l?c.y:c.y*(.25+r()*.45),d=l?a*.22:.008+t*.002;e.limb(c,c.clone().add(new Z(0,-u,0)),d,l?d*1.3:d*.6,l?i:`#a8977a`,4)}if(n===4)for(let n=0;n<60;n++)e.accent(e.onSpot(e.spots[n%e.spots.length],.2),.025+t*.003,n%3?`#c8546a`:`#8a3a4a`);n>=3&&e.rootFlare(7,3.2,i),e.crownY=t*.6}function Zg(e){let{V:t,stage:n,rand:r}=e,i=`#8a4b2e`,a=.03+t*.026+n*.02;e.trunk(t*.98,a,a*.12,i,{wobble:.008,jitter:n>=3?.16:.04,sides:9});let o=t*[0,.1,.1,.16,.24][n],s=[0,9,14,19,24][n],c=t*[0,.21,.2,.19,.18][n]*e.fullness;for(let i=0;i<s;i++){let a=i/(s-1),l=o+(t*.98-o)*a,u=Math.max(.08,c*(1-a)**.85),d=e.trunkAt(l/(t*.98)),f=5+i%2;for(let t=0;t<f;t++){let a=t/f*6.28+i*.9+r()*.3,o=new Z(Math.cos(a),.35,Math.sin(a)).normalize(),s=n===4&&r()<.7?e.leaf(r()<.5?`#c7652e`:`#d98a3c`,.06):e.leaf(`#86bc56`,.07);e.spray(new Z(d.x,l,d.z),o,u*(.9+r()*.3),u*.72,s)}}let l=e.trunkAt(1),u=t*.98-o;e.cone(new Z(l.x*.5,o+u*.04,l.z*.5),c*.62,u*.95,e.leaf(n===4?`#a8622e`:`#6fa446`,.05),9),e.blob(new Z(l.x,t*.99,l.z),.06+t*.02,e.leaf(n===4?`#c7652e`:`#86bc56`),1.4,0),n>=3&&e.rootFlare(8,n===4?3.4:2.4,i),e.crownY=t*.55}function Qg(e){let{V:t,stage:n,rand:r}=e,i=`#8a8274`;e.trunk(t*[0,.72,.64,.6,.56][n],.03+t*.026+n*.024,.02+t*.01,i,{wobble:.025,jitter:n>=3?.12:.03});let a=[0,0,0,.45,1][n],o=(t,n)=>{let i=r()<a?e.leaf(r()<.6?`#f0c428`:`#e2a41e`,.05):e.leaf(`#7fb24a`,.07);e.blob(t,n*.55,i,.8,0);for(let a=0;a<4;a++){let a=new Ec(n*.55,5,0,Math.PI);a.rotateX(r()*6.28),a.rotateY(r()*6.28);let o=new Z(r()-.5,r()*.6,r()-.5).normalize().multiplyScalar(n*.5);a.translate(t.x+o.x,t.y+o.y,t.z+o.z),eh(a,i.clone().offsetHSL(0,0,.05)),e.leaves.push(a)}};qg(e,{primaries:[0,3,4,6,7][n],depth:[0,1,1,2,2][n],from:[.35,1],len:t*[0,.3,.34,.34,.36][n],tilt:[.7,1],radius:e.trunkRadius*.45,bark:i,spread:.4,onTip:(n,i)=>{let a=(.12+t*.06)*e.fullness*(.8+r()*.5);o(n,a),o(n.clone().addScaledVector(i,-a*1.2).add(new Z(0,-a*.2,0)),a*.8)}});let s=e.trunkAt(1);if(o(new Z(s.x,t*.9,s.z),(.14+t*.07)*e.fullness),n>=2&&o(new Z(s.x,t*.72,s.z),(.12+t*.06)*e.fullness),n===4){let n=new Ec(t*.34,18);n.rotateX(-Math.PI/2),Qm(n,t*.02,3,!1),n.translate(0,.03,0);let r=n.getAttribute(`position`);for(let e=0;e<r.count;e++)r.setY(e,.03);eh(n,(e,t)=>Ug(t%4?`#e8b82a`:`#d49a1c`)),e.bark.push(n),e.rootFlare(7,2.4,i)}e.crownY=t*.62}function $g(e){let{V:t,stage:n,rand:r}=e,i=`#5a4a3e`,a=.03+t*.028+n*.022;e.trunk(t*.93,a,a*.15,i,{wobble:.01,jitter:n>=3?.12:.03});let o=e.trunkAt(1),s=new Z(o.x+t*.05,t,o.z+t*.02);e.limb(o,s,a*.15,a*.05,i,4),e.spray(o,new Z(.5,.85,.2).normalize(),t*.08,t*.05,e.leaf(`#6f9c8c`));let c=t*[0,.12,.08,.08,.12][n],l=[0,4,6,8,10][n],u=t*[0,.26,.3,.34,.36][n]*e.fullness;for(let i=0;i<l;i++){let a=i/Math.max(1,l-1),o=c+(t*.88-c)*a,s=Math.max(.12,u*(1-a*.85)),d=e.trunkAt(o/(t*.93));for(let a=0;a<6;a++){let c=a/6*6.28+i*.5+r()*.4,l=new Z(Math.cos(c),.05,Math.sin(c)).normalize(),u=e.leaf(r()<.3?`#86ab9c`:`#5d8f7c`,.06);if(e.spray(new Z(d.x,o,d.z),l,s*(.9+r()*.25),s*.7,u,.28),n>=3&&r()<.3){let n=new Z(d.x,o,d.z).addScaledVector(l,s*.6).add(new Z(0,s*.12,0));e.accent(n,.04+t*.006,`#9aa88a`,`cone`)}}}n>=3&&e.rootFlare(7,2.6,i),e.crownY=t*.5}function e_(e){let{V:t,stage:n,rand:r}=e,i=e=>Ug(e<t*.08&&n===4?`#7a3a22`:`#9a4a2c`).offsetHSL(0,0,Math.sin(e*9)*.02),a=.04+t*.034+n*.035;if(e.trunk(t*.97,a,a*.15,i,{wobble:.006,jitter:n>=2?.22:.05,sides:10}),n===4){let t=rh(a*.5,a*1.6,a*.25,1);t.translate(a*.3,a*1.3,a*.88),e.bark.push(eh(t,Ug(`#241612`)))}let o=t*[0,.08,.1,.4,.52][n],s=[0,7,10,13,15][n],c=t*[0,.2,.17,.13,.12][n]*e.fullness;for(let i=0;i<s;i++){let l=i/(s-1),u=o+(t*.97-o)*l,d=Math.max(.08,c*(1-l)**.55),f=e.trunkAt(u/(t*.97));for(let t=0;t<4;t++){let o=t/4*6.28+i*1.1+r()*.4,s=new Z(Math.cos(o),-.1,Math.sin(o)).normalize(),c=new Z(f.x,u,f.z);n>=3&&e.limb(c,c.clone().addScaledVector(s,d*.6),a*.08,a*.04,`#7a3a24`,4),e.blob(c.clone().addScaledVector(s,d*.75),d*.42,e.leaf(`#2f5e3a`,.06),.7)}}let l=e.trunkAt(1);if(e.blob(new Z(l.x,t*.98,l.z),.06+t*.025,e.leaf(`#2f5e3a`),1.6,0),n===4)for(let n=0;n<3;n++){let r=n*2.1+.4,i=e.trunkAt(.8),o=new Z(i.x,t*.78,i.z),s=o.clone().add(new Z(Math.cos(r)*t*.05,t*.14,Math.sin(r)*t*.05));e.limb(o,s,a*.12,a*.04,`#9a4a2c`,5),e.cone(s.clone().add(new Z(0,-t*.06,0)),t*.035,t*.1,e.leaf(`#2f5e3a`),7)}n>=3&&e.rootFlare(9,n===4?3.6:2.6,`#8a4028`),e.crownY=t*.72}function t_(e){let{V:t,stage:n,rand:r}=e,i=.03+t*.028+n*.028,a=t*[0,.7,.72,.76,.78][n];if(e.trunk(a,i,i*.45,e=>(n>=2&&e<a*.18?Ug(`#8a7258`):Ug(Math.sin(e*3.1)>.6?`#bdb9aa`:`#e2ddcf`)).offsetHSL(0,0,Math.sin(e*17)*.015),{wobble:.015,sides:9}),n>=3)for(let n=0;n<10;n++){let n=r()*6.28,o=a*(.15+r()*.4),s=t*(.04+r()*.05),c=new Tc(i*.12,s,i*.02);c.translate(Math.cos(n)*i*1.02,o-s/2,Math.sin(n)*i*1.02),e.bark.push(eh(c,Ug(`#9a7a58`)))}let o=e.trunkAt(1),s=[0,3,4,6,7][n];for(let c=0;c<s;c++){let l=c/s*6.28+r()*.8,u=new Z(o.x,a*(.92+r()*.08),o.z),d=new Z(Math.cos(l)*.5,.85,Math.sin(l)*.5).normalize(),f=t*(.16+r()*.06),p=u.clone().addScaledVector(d,f);e.limb(u,p,i*.38,i*.14,`#d9d4c5`,5),!e.nest&&c===0&&n>=2&&(e.nest={pos:u.clone().addScaledVector(d,f*.3),out:new Z(d.x,0,d.z).normalize()});let m=3+Math.round(n*1.5);for(let n=0;n<m;n++){if(n>2&&e.skip())continue;let i=p.clone().add(new Z((r()-.5)*f*.9,(r()-.3)*f*.45,(r()-.5)*f*.9)),a=(.13+t*.055)*e.fullness*(.7+r()*.5),o=new Gl(a,1);Qm(o,a*.35,i.x*2+i.z,!0),o.scale(.9,1.25,.9),o.translate(i.x,i.y-a*.3,i.z);let s=e.leaf(r()<.5?`#7d9468`:`#91a883`,.05);eh(o,e=>s.clone().offsetHSL(0,0,(e-i.y)*.05)),e.leaves.push(o),e.spots.push({c:i,r:a,col:s})}}if(s){let i=t*(.1+n*.012)*e.fullness;for(let s=0;s<3+n;s++){let c=s/(3+n)*6.28+r(),l=new Z(o.x+Math.cos(c)*i*.9,a+t*(.1+r()*.08),o.z+Math.sin(c)*i*.9);e.blob(l,i*(.75+r()*.3),e.leaf(r()<.5?`#7d9468`:`#91a883`,.05),.85)}}if(s||e.blob(new Z(o.x,a,o.z),.2,e.leaf(`#8fb0a0`)),n===4){let n=new Z(o.x,a,o.z),r=n.clone().add(new Z(t*.02,t*.24,0));e.limb(n,r,i*.3,i*.05,`#b4b0a4`,5);for(let a=0;a<4;a++){let o=new Z().lerpVectors(n,r,.4+a*.15),s=a*1.9;e.limb(o,o.clone().add(new Z(Math.cos(s)*t*.05,t*.03,Math.sin(s)*t*.05)),i*.05,i*.02,`#b4b0a4`,3)}e.extraHeight=t*.22,e.rootFlare(8,3,`#8a7258`)}e.crownY=a}function n_(e){let{V:t,stage:n,rand:r}=e,i=`#6b4a35`,a=.03+t*.028+n*.026;e.trunk(t*.97,a,a*.12,i,{wobble:.01,jitter:n>=2?.2:.04});let o=t*[0,.05,.05,.12,.38][n],s=[0,4,6,8,10][n],c=t*[0,.3,.28,.25,.2][n]*e.fullness,l=t*.97-o;for(let i=0;i<s;i++){let a=i/s,u=o+l*a,d=Math.max(.1,c*(1-a)+.05),f=l/s*2,p=e.trunkAt(u/(t*.97)),m=e.leaf(`#2e5a3c`,.05,a*.04);if(e.cone(new Z(p.x,u,p.z),d,f,m,8),n>=3)for(let n=0;n<3;n++){let n=r()*6.28,i=d*(.55+r()*.3);e.accent(new Z(p.x+Math.cos(n)*i,u+f*.2,p.z+Math.sin(n)*i),.04+t*.005,`#8a6040`,`cone`)}}if(n===4){for(let n=0;n<8;n++){let n=.12+r()*.24,i=e.trunkAt(n/.97);i.y=t*n;let o=r()*6.28;e.limb(i,i.clone().add(new Z(Math.cos(o)*a*2,-a*.4,Math.sin(o)*a*2)),a*.12,a*.06,`#5a3e2c`,4)}e.rootFlare(8,2.6,i)}let u=e.trunkAt(1);e.cone(new Z(u.x,t*.94,u.z),.05+t*.02,t*.08,e.leaf(`#3a6a48`),6),e.crownY=t*.55}var r_={round:Jg,tiered:Yg,banyan:Xg,narrowCone:Zg,fan:Qg,drooping:$g,column:e_,eucalypt:t_,cone:n_},i_={narrowCone:!0,drooping:!0,column:!0,cone:!0};function a_(e,t){let n=R((e.density-.5)/.5,0,1);if(n<=.02)return;let r=e.spots.filter(e=>e.col);if(!r.length)return;let i=e.trunkAt(1),a=Math.min(r.length,i_[t]?28:40),o=r.length/a;for(let s=0;s<a;s++){let a=r[Math.floor(s*o)],c=i_[t]?.45:.3,l=a.c.clone().lerp(new Z(i.x,a.c.y,i.z),c);l.y-=a.r*.15;let u=a.col.clone().offsetHSL(0,-.02,-.05);e.blob(l,a.r*(i_[t]?.6:.72)*(.6+.4*n),u,i_[t]?.7:.85,1,!1)}}function o_(e){let t=Lg(e.heightCm),n=e.reinforce;return[e.species,e.stage,Math.round(t*40),Math.round(e.health/12),+(e.pests>45),Math.min(4,e.scars),+!!n?.stakes,+!!n?.ropes,+!!n?.prune,e.seed].join(`|`)}function s_(e){let t=new Wg(e),n=lt(e.species).form;t.stage===0?Kg(t,n):r_[n](t),t.stage>=1&&a_(t,n);let{V:r,rand:i}=t;if(t.stage>=1)for(let n=0;n<Math.min(4,e.scars);n++){let e=2+n*1.7,i=.45+n*.1,a=t.trunkAt(i);a.y=(t.trunkTop||r)*i;let o=new Z(Math.cos(e),.3,Math.sin(e)).normalize();t.limb(a,a.clone().addScaledVector(o,t.trunkRadius*2.5),t.trunkRadius*.3,t.trunkRadius*.25,`#6a4a34`)}if(e.pests>45&&t.spots.length)for(let e=0;e<18;e++)t.accent(t.onSpot(t.spots[e%t.spots.length],.6),.025+r*.004,`#3a2a1c`);if(t.stage>=3&&t.trunkPts.length>2){let e=.42,n=new Z(.35,0,1).normalize(),i=t.trunkAt(e),a=t.trunkRadius*(1-e*.4);t.hollow={pos:new Z(i.x+n.x*a*.8,(t.trunkTop||r)*e,i.z+n.z*a*.8),out:n};let o=new Zl(a*.32,a*.1,5,10);o.scale(1,1.35,1),o.lookAt(n),o.translate(t.hollow.pos.x,t.hollow.pos.y,t.hollow.pos.z),t.bark.push(eh(o,Ug(`#3a2a20`)))}let a=new Ga,o=new K(th(t.bark,!0),Hg());o.castShadow=!0,o.receiveShadow=!0,a.add(o);let s=new K(th(t.leaves,!0),Bg());s.castShadow=!0,s.receiveShadow=!0,a.add(s);let c=t.trunkAt(1),l=t.spots.filter(e=>e.c.y>r*.25||t.stage===0).sort((e,t)=>t.c.z+t.c.x*.3+t.c.y*.8-(e.c.z+e.c.x*.3+e.c.y*.8)).slice(0,24).map(e=>{let t=new Z(e.c.x-c.x,0,e.c.z-c.z);return t.lengthSq()<1e-4&&t.set(.3,0,1),t.normalize(),{pos:e.c.clone().addScaledVector(t,e.r*.55).add(new Z(0,e.r*.7,0)),out:t}});if(!t.nest&&t.stage>=2&&(t.nest={pos:c.clone().setY(t.crownY),out:new Z(.3,0,1).normalize()}),e.reinforce?.stakes||e.reinforce?.ropes){let n=[],i=[],o=t.trunkRadius,s=o*3+.25,c=Math.min((t.trunkTop||r)*.8,1.6+o);for(let t=0;t<3;t++){let r=t/3*Math.PI*2+.5,a=new Z(Math.cos(r)*s,0,Math.sin(r)*s),l=new Z(Math.cos(r)*(o+.03),c,Math.sin(r)*(o+.03));if(e.reinforce.stakes&&n.push($m(a,l,.03+o*.08,.025,5)),e.reinforce.ropes){let e=new Z(Math.cos(r+.5)*s*1.8,.02,Math.sin(r+.5)*s*1.8);i.push($m(e,new Z(Math.cos(r+.5)*o,c*.85,Math.sin(r+.5)*o),.012,.012,3));let t=new Dc(.03,.02,.14,5);t.translate(e.x,.05,e.z),n.push(t)}}if(n.length){let e=new K(th(n),Xm(`#c99a63`));e.castShadow=!0,a.add(e)}if(i.length){let e=new Zl(o*1.02,.018,4,12);e.rotateX(Math.PI/2),e.translate(0,c*.85,0),i.push(e),a.add(new K(th(i),Xm(`#e8dcc0`)))}}let u=.2,d=r+t.extraHeight;for(let e of t.spots)u=Math.max(u,Math.hypot(e.c.x,e.c.z)+e.r),d=Math.max(d,e.c.y+e.r*.82);a.updateMatrixWorld(!0);let f=Math.max(.01,new go().setFromObject(a).max.y),p=Um(f,e.heightCm),m=new Ga;a.scale.setScalar(p),m.add(a);let h=t.trunkSpots(),g=new Set,_=e=>{g.has(e)||(e.multiplyScalar(p),g.add(e))};for(let e of[...l,...h,t.nest,t.hollow])e&&_(e.pos);return{group:m,canopy:s,height:f*p,localHeight:f,metricScale:p,canopyRadius:u*p,crownY:t.crownY*p,trunkRadius:t.trunkRadius*p,perches:l,trunkSpots:h,nest:t.nest,hollow:t.hollow,dispose:()=>nh(m)}}var c_=Math.PI/4,l_=.32;function u_(e){let t=e.cond;if(t.stormKind===`typhoon`||t.code>=95)return 1;if(t.stormKind)return .9;let n=0;return t.code===1?n=.1:t.code===2?n=.3:t.code===3?n=.55:t.code===45||t.code===48?n=.6:t.code>=51&&(n=t.code>=63&&t.code!==71?.85:.7),t.raining&&(n=Math.max(n,.7)),n}function d_(e){let t=e.cond;return t.stormKind===`typhoon`||t.code>=95?1:t.stormKind===`heavy-rain`||t.precipMm>=25||t.code===65||t.code===82?.9:t.stormKind===`gale`?.45:t.raining||t.code>=51&&t.code<=82?t.code>=63?.6:.35:0}function f_(e,t){let n=[],r=4+Math.floor(e()*4);for(let i=0;i<r;i++){let a=t*(.45+e()*.55)*(i===0?1.2:1),o=new Gl(a,1);Qm(o,a*.15,i+t,!0),o.scale(1,.62,1),o.translate((i-r/2)*t*.7+e()*t*.3,e()*t*.3,(e()-.5)*t*.8),n.push(o)}let i=th(n,!0);return eh(i,e=>new G().setScalar(.86+R(e/t,-.5,.5)*.28)),i}var p_=class{renderer;scene=new eo;camera=new Wu(40,1,.1,500);hemi=new Mu(`#fff4de`,`#6c8a52`,1.1);sun=new qu(`#ffe2b0`,2.4);fill=new qu(`#b9d3ff`,.35);skyMat;island;pivot=new Ga;tree=null;treeKeyStr=``;animals=new gg;animalsKey=``;growFrom=1;growStart=0;clouds=[];cloudMat=new lu({vertexColors:!0,flatShading:!0,roughness:1,transparent:!0,opacity:.94,emissive:`#ffffff`,emissiveIntensity:.35});stars;glow;sparkles;landmark=new Ga;rain;rainSeeds;sea;camDist=10;camTargetY=.4;lastTime=0;flash=0;nextFlash=0;dragAz=0;dragEl=0;dragging=null;lastDrag=0;quality;thumbs=new Map;width=1;height=1;gust=0;gustTarget=0;nextGust=0;swellT=-99;follow=null;followOn=!1;followAz=0;followPos=new U;heatK=0;habitat=null;habitatKey=``;hud=new eo;hudCam=new Gu(0,1,1,0,-1,1);rays;speciesThumbs=new Map;sky;islandK=1;fence=null;zoom=1;zoomGoal=1;panOff=new U;panGoal=new U;followRef=null;followZoom=1;followBias=0;followBiasGoal=0;followCap=1/0;followCheckT=0;pointers=new Map;pinch=null;tap=null;raycaster=new dd;canvas;constructor(e,t=`low`){this.canvas=e,this.quality=t,this.renderer=new Pm({canvas:e,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.outputColorSpace=ri,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.95,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=1,this.skyMat=new su({side:1,depthWrite:!1,fog:!1,uniforms:{top:{value:new G(`#8fcbf0`)},mid:{value:new G(`#cfe9f7`)},bottom:{value:new G(`#e9f4f4`)}},vertexShader:`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, -0.4, h)); gl_FragColor = vec4(c, 1.0); }`});let n=new K(new Xl(400,24,12),this.skyMat);n.renderOrder=-1,this.sky=n,this.scene.add(n),this.scene.fog=new $a(`#cfe6f2`,40,220),this.scene.add(this.hemi,this.sun,this.sun.target,this.fill),this.sun.castShadow=!0,this.sun.shadow.bias=-6e-4,this.sun.shadow.normalBias=.03,this.sun.shadow.radius=4,this.applyQuality(),this.island=ch(),this.scene.add(this.island.group),this.pivot.position.y=.18,this.scene.add(this.pivot),this.scene.add(this.animals.root),this.sea=new K(new Ec(420,48),new lu({color:`#4fa7c9`,roughness:.35,metalness:.1})),this.sea.rotation.x=-Math.PI/2,this.sea.position.y=-22,this.scene.add(this.sea);let r=rt(99),i=[];for(let e=0;e<9;e++){let t=-1.2+e*.55+r()*.3,n=110+r()*80,a=5+r()*12,o=new Oc(6+r()*10,a,7,3);Qm(o,2.2,e,!1),o.translate(Math.sin(t)*n*-1,-22+a/2-1,-Math.cos(t)*n),eh(o,e=>e>-22+a*.35?new G(`#6f9f5c`):new G(`#8b8173`)),i.push(o)}this.scene.add(new K(th(i,!0),new lu({vertexColors:!0,flatShading:!0,roughness:1})));for(let e=0;e<16;e++){let t=e<4,n=new K(f_(r,t?1.2+r()*1.2:1.6+r()*2.4),this.cloudMat),i={mesh:n,r:t?11+r()*5:14+r()*30,a:r()*Math.PI*2,y:t?-4-r()*5:3+r()*12,speed:.01+r()*.02,low:t};this.clouds.push(i),this.scene.add(n)}let a=new Yo,o=new Float32Array(1500);for(let e=0;e<500;e++){let t=r()*Math.PI*2,n=.08+r()*.9;o.set([Math.cos(t)*Math.cos(n)*350,Math.sin(n)*350,Math.sin(t)*Math.cos(n)*350],e*3)}a.setAttribute(`position`,new Po(o,3)),this.stars=new vc(a,new pc({color:`#fffbe8`,size:1.6,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1})),this.scene.add(this.stars);let s=new Yo,c=new Float32Array(180);for(let e=0;e<60;e++)c.set([(r()-.5)*3,r(),(r()-.5)*3],e*3);s.setAttribute(`position`,new Po(c,3)),this.glow=new vc(s,new pc({color:`#9dff8a`,size:5,sizeAttenuation:!1,transparent:!0,opacity:.8,depthWrite:!1,blending:2})),this.glow.visible=!1,this.scene.add(this.glow);let l=new Yo,u=new Float32Array(270);for(let e=0;e<90;e++){let t=r()*Math.PI*2,n=7.5+r()*2.5;u.set([Math.cos(t)*n,-1.5+r()*3,Math.sin(t)*n],e*3)}l.setAttribute(`position`,new Po(u,3)),this.sparkles=new vc(l,new pc({color:`#cfe3ff`,size:3,sizeAttenuation:!1,transparent:!0,opacity:.9,depthWrite:!1,blending:2})),this.sparkles.visible=!1,this.scene.add(this.sparkles);let d=new K(new Ac(.45,0),new lu({color:`#8a8f7a`,flatShading:!0,roughness:1}));d.scale.set(1,.7,.9),d.position.y=.2;let f=new K(new Xl(.32,8,6,0,Math.PI*2,0,Math.PI/2),new lu({color:`#6fae4f`,flatShading:!0}));f.position.set(.05,.42,0),this.landmark.add(d,f);for(let e=0;e<4;e++){let t=e*1.7,n=new K(new Xl(.1,8,6,0,Math.PI*2,0,Math.PI/2),new lu({color:`#ffd36b`,emissive:`#ffb830`,emissiveIntensity:.6}));n.position.set(Math.cos(t)*.55,.14,Math.sin(t)*.55);let r=new K(new Dc(.025,.03,.14,5),new lu({color:`#f3ead2`}));r.position.set(Math.cos(t)*.55,.07,Math.sin(t)*.55),this.landmark.add(n,r)}this.landmark.position.set(2.8,.05,2.2),this.landmark.visible=!1,this.scene.add(this.landmark);let p=new Yo;p.setAttribute(`position`,new Po(new Float32Array(5400),3)),this.rainSeeds=new Float32Array(2700);for(let e=0;e<2700;e++)this.rainSeeds[e]=r();this.rain=new fc(p,new ec({color:`#dbe9f5`,transparent:!0,opacity:.55,fog:!1,depthWrite:!1})),this.rain.frustumCulled=!1,this.rain.visible=!1,this.scene.add(this.rain),this.rays=this.buildRays(),this.bindDrag(),this.resize()}buildRays(){let e=()=>{let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,0,64,64,64);n.addColorStop(0,`rgba(255,255,255,0.95)`),n.addColorStop(.25,`rgba(255,255,255,0.45)`),n.addColorStop(.6,`rgba(255,255,255,0.12)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128);let r=new xc(e);return r.colorSpace=ri,r},t=(()=>{let e=document.createElement(`canvas`);e.width=128,e.height=32;let t=e.getContext(`2d`),n=t.createImageData(128,32);for(let e=0;e<128;e++)for(let t=0;t<32;t++){let r=(1-e/127)**1.6*Math.min(1,e/10)*Math.sin(t/31*Math.PI)**2.2,i=(t*128+e)*4;n.data[i]=n.data[i+1]=n.data[i+2]=255,n.data[i+3]=Math.round(r*255)}t.putImageData(n,0,0);let r=new xc(e);return r.colorSpace=ri,r})(),n=e(),r=e=>{let t=new ys(new as({map:n,color:e,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:2}));return t.visible=!1,this.hud.add(t),t},i=r(`#ffe2a6`),a=r(`#fff0d0`),o=new Kl(1,1);o.translate(.5,0,0);let s=[];for(let e=0;e<6;e++){let n=new K(o,new Es({map:t,color:e%2?`#fff1cc`:`#ffe0a0`,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:2}));n.visible=!1,this.hud.add(n),s.push(n)}return{glow:i,haze:a,shafts:s}}triggerGlare(){this.swellT=this.lastTime}followAnimal(e){this.follow=e}animalCaps(){return this.animals.caps()}animalInfo(){return this.animals.info()}spawnAnimal(e){gt(e)&&this.animals.spawn(e,{forced:!0})}rotateAnimals(){this.animals.rotate()}setQuality(e){this.quality=e,this.applyQuality(),this.resize()}applyQuality(){let e=this.quality===`high`?2048:1024;this.sun.shadow.mapSize.x!==e&&(this.sun.shadow.mapSize.set(e,e),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null)}bindDrag(){let e=this.canvas;e.style.touchAction=`none`,e.addEventListener(`pointerdown`,t=>{this.pointers.set(t.pointerId,{x:t.clientX,y:t.clientY});try{e.setPointerCapture(t.pointerId)}catch{}if(this.pointers.size===1)this.dragging={x:t.clientX,y:t.clientY,az:this.dragAz,el:this.dragEl},this.tap={x:t.clientX,y:t.clientY,t:performance.now(),moved:!1};else if(this.pointers.size===2){this.dragging=null,this.tap=null;let[e,t]=[...this.pointers.values()];this.pinch={d:Math.hypot(e.x-t.x,e.y-t.y),mx:(e.x+t.x)/2,my:(e.y+t.y)/2}}}),e.addEventListener(`pointermove`,e=>{if(!this.pointers.has(e.pointerId))return;if(this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.tap&&Math.hypot(e.clientX-this.tap.x,e.clientY-this.tap.y)>8&&(this.tap.moved=!0),this.pinch&&this.pointers.size>=2){let[e,t]=[...this.pointers.values()],n=Math.max(10,Math.hypot(e.x-t.x,e.y-t.y)),r=(e.x+t.x)/2,i=(e.y+t.y)/2;this.zoomBy(this.pinch.d/n,r,i),this.panBy(r-this.pinch.mx,i-this.pinch.my),this.pinch={d:n,mx:r,my:i},this.lastDrag=performance.now();return}if(!this.dragging)return;let t=(e.clientX-this.dragging.x)/Math.max(200,this.width),n=(e.clientY-this.dragging.y)/Math.max(200,this.height),r=this.isZoomed();this.dragAz=R(this.dragging.az-t*2.2,r?-Math.PI:-.6,r?Math.PI:.6),this.dragEl=R(this.dragging.el+n*.8,r?-.5:-.15,r?.35:.15),this.lastDrag=performance.now()});let t=e=>{if(this.pointers.delete(e.pointerId),this.pointers.size<2&&(this.pinch=null),this.pointers.size===1){let[e]=[...this.pointers.values()];this.dragging={x:e.x,y:e.y,az:this.dragAz,el:this.dragEl}}else this.pointers.size===0&&(this.dragging=null,e.type===`pointerup`&&this.tap&&!this.tap.moved&&performance.now()-this.tap.t<350&&this.tapAt(e.clientX,e.clientY),this.tap=null);this.lastDrag=performance.now()};e.addEventListener(`pointerup`,t),e.addEventListener(`pointercancel`,t),e.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaMode===1?16:e.deltaMode===2?400:1;this.zoomBy(Math.exp(R(e.deltaY*t,-200,200)*.0022),e.clientX,e.clientY),this.lastDrag=performance.now()},{passive:!1})}ndc(e,t){let n=this.canvas.getBoundingClientRect();return new H((e-n.left)/Math.max(1,n.width)*2-1,-((t-n.top)/Math.max(1,n.height))*2+1)}pointUnder(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.camera);let n=[this.pivot,this.island.group];this.habitat&&n.push(this.habitat.group);let r=this.raycaster.intersectObjects(n,!0).find(e=>e.object.isMesh&&!e.object.isSprite);if(r)return r.point;let i=new ns(new U(0,1,0),-.1);return this.raycaster.ray.intersectPlane(i,new U)??new U(0,this.camTargetY,0)}obstacle(e,t,n,r,i){let a=new U(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));this.raycaster.set(e,a),this.raycaster.near=i,this.raycaster.far=r;let o=[this.island.group];this.tree&&o.push(this.tree.group),this.habitat&&o.push(this.habitat.group);let s=this.raycaster.intersectObjects(o,!0).find(e=>e.object.isMesh);return this.raycaster.near=0,this.raycaster.far=1/0,s?s.distance:1/0}clearView(e,t,n,r,i){let a=Math.max(.05,i*.5),o={bias:0,cap:0};for(let i of[this.followBiasGoal,0,.7,-.7,1.4,-1.4,2.2,-2.2,Math.PI]){let s=this.obstacle(e,t+i,n,r,a);if(s===1/0)return{bias:i,cap:1/0};s>o.cap&&(o={bias:i,cap:s})}return{bias:o.bias,cap:Math.max(a*1.2,o.cap*.9)}}zoomBy(e,t,n){if(!Number.isFinite(e)||e<=0)return;if(this.followRef||this.follow){this.followZoom=R(this.followZoom*e,.35,8);return}let r=R(R(this.camDist*.5,.3,1.5)/Math.max(.3,this.camDist),.004,1),i=(this.habitat?.radius??7)*this.islandK,a=Math.max(1,i*3.4/Math.max(.3,this.camDist)),o=this.zoomGoal,s=R(o*e,r,a);if(s===o)return;let c=new U(0,this.camTargetY,0),l=c.clone().add(this.panGoal),u;if(t===void 0||n===void 0||s>1)u=l;else{let e=this.pointUnder(t,n),r=c.clone().add(this.panOff);u=e.clone().add(r.sub(e).multiplyScalar(s/Math.max(1e-4,this.zoom)))}this.panGoal.copy(u.sub(c)),this.zoomGoal=s,this.clampPan()}panBy(e,t){if(!this.isZoomed()||this.followRef||this.follow)return;let n=2*(this.camDist*this.zoom)*Math.tan(qi.degToRad(this.camera.fov/2))/Math.max(1,this.height),r=new U().setFromMatrixColumn(this.camera.matrixWorld,0),i=new U().setFromMatrixColumn(this.camera.matrixWorld,1);this.panGoal.addScaledVector(r,-e*n).addScaledVector(i,t*n),this.clampPan()}clampPan(){let e=(this.habitat?.radius??7)*this.islandK*1.05,t=Math.hypot(this.panGoal.x,this.panGoal.z);t>e&&this.panGoal.multiplyScalar(e/t);let n=Math.max(1,(this.tree?.height??1)*1.1),r=this.camTargetY+this.panGoal.y;r<.03&&(this.panGoal.y=.03-this.camTargetY),r>n&&(this.panGoal.y=n-this.camTargetY)}tapAt(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.camera);let n=2*Math.tan(qi.degToRad(this.camera.fov/2))/Math.max(1,this.height),r=this.animals.pick(this.raycaster.ray,e=>e*n*26);r&&(this.followRef=r,this.follow=null,this.followZoom=1)}isZoomed(){return this.zoomGoal<.97||this.zoomGoal>1.03||this.panGoal.lengthSq()>.01}viewState(){let e=this.followRef?this.animals.refName(this.followRef):null;return{active:this.isZoomed()||!!this.followRef,following:e}}resetView(){this.zoomGoal=1,this.panGoal.set(0,0,0),this.followRef=null,this.followZoom=1,this.dragAz=0,this.dragEl=0}animalScreen(e){let t=this.animals.focus(e);if(!t)return null;let n=t.pos.clone().project(this.camera),r=this.canvas.getBoundingClientRect();return{x:r.left+(n.x+1)/2*r.width,y:r.top+(1-n.y)/2*r.height}}flyerHeights(){return this.animals.flyerHeights()}cameraInfo(){return{zoom:this.zoomGoal,distM:this.camDist*this.zoom,islandK:this.islandK,treeM:this.tree?.height??0}}resize(){let e=Math.max(1,window.innerWidth),t=Math.max(1,window.innerHeight);this.width=e,this.height=t;let n=this.quality===`high`?2:1.5;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,n)),this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.fov=this.camera.aspect<.8?46:36,this.camera.updateProjectionMatrix(),this.hudCam.left=0,this.hudCam.right=e,this.hudCam.top=t,this.hudCam.bottom=0,this.hudCam.updateProjectionMatrix()}ensureTree(e,t){let n={species:e.species,stage:e.stage,heightCm:e.heightCm,health:e.health,pests:e.pests,scars:e.scars,seed:nt(e.treeName||`tree`)%97+1,reinforce:e.reinforce},r=o_(n);if(r!==this.treeKeyStr){let e=this.tree,i=s_(n);e?(this.growFrom=R(e.height/i.height,.5,1.5),this.growStart=t,this.pivot.remove(e.group),e.dispose()):this.growFrom=1,this.pivot.add(i.group),this.tree=i,this.treeKeyStr=r,this.animalsKey=``}let i=e.daylight<.35,a=`${e.unlocked.join(`,`)}|${e.residents.join(`,`)}|${e.health>=22}|${i}|${e.stage}`;a!==this.animalsKey&&this.tree&&(this.animals.sync({unlocked:e.unlocked,residents:e.residents,tree:this.tree,health:e.health,night:i,stage:e.stage}),this.animalsKey=a)}ensureFence(e){if(this.fence&&Math.abs(this.fence.radius-e)/e<.015)return;this.fence&&(this.scene.remove(this.fence.group),this.fence.dispose());let t=this.islandK,n=this.habitat,r=(e,r)=>{let i=Math.hypot(e,r)/t;return i<7?t*(.18*(1-Math.min(1,i/7)**2)-.02):t*(n?n.groundAt(e/t,r/t):-.02)};this.fence=dh(e,r),this.scene.add(this.fence.group)}fenceInfo(){return{fenceRadius:this.fence?this.fence.radius-.35:0,islandRadius:(this.habitat?.radius??7)*this.islandK}}ensureHabitat(e){let t=R(Math.round(e.islandStage??e.stage),0,4),n=`${e.species}|${t}|${this.quality}`;n!==this.habitatKey&&(this.habitatKey=n,this.habitat&&(this.scene.remove(this.habitat.group),this.habitat.dispose()),this.habitat=Mg(e.species,t,this.quality),this.scene.add(this.habitat.group),this.island.setExtended(t>=1),this.animals.setIslandRadius(this.habitat.radius*this.islandK,this.islandK))}draw(e,t){let n=t/1e3,r=R(n-this.lastTime,0,.1);this.lastTime=n,this.ensureTree(e,n),this.ensureHabitat(e);let i=this.tree,a=1-(1-R((n-this.growStart)/.9,0,1))**3;i.group.scale.setScalar(this.growFrom+(1-this.growFrom)*a);let o=R(e.daylight,0,1),s=1-o,c=u_(e),l=d_(e),u=e.cond.stormKind===`typhoon`||e.cond.code>=95,d=u||!!e.cond.stormKind,f=o>0&&o<1?1-Math.abs(o-.5)*2:0,p=Math.max(f,R(1-Math.min(Math.abs(e.minute-e.sunriseMin),Math.abs(e.minute-e.sunsetMin))/70,0,1)*o),m=new G(`#79bfeb`).lerp(new G(`#8d99a6`),c).lerp(new G(`#4b5563`),d?.55:0),h=new G(`#cde8f6`).lerp(new G(`#b8c2ca`),c).lerp(new G(`#687380`),d?.5:0),g=new G(`#f3b27a`);h.lerp(g,p*.55*(1-c));let _=new G(`#0f1d3a`),v=new G(`#27365c`).lerp(new G(`#2a2f38`),c*.6),y=_.clone().lerp(m,o),b=v.clone().lerp(h,o);this.skyMat.uniforms.top.value.copy(y),this.skyMat.uniforms.mid.value.copy(b),this.skyMat.uniforms.bottom.value.copy(b.clone().lerp(new G(`#ffffff`),.12*o));let x=this.scene.fog;x.color.copy(b).lerp(new G(`#ffffff`),.2*o);let S=!!e.cond.hot&&o>.3;this.heatK+=(+!!S-this.heatK)*(1-Math.exp(-r*.8));let C=new G(`#ffe7bf`).lerp(new G(`#ffb066`),p*.7);e.cond.hot&&C.lerp(new G(`#ffd28a`),.3);let w=new G(`#a9bcf2`);if(this.sun.color.copy(w.clone().lerp(C,o)),this.sun.intensity=(.7*s+o*2.6)*(1-c*.72)*(d?.45:1)*(1+this.heatK*.12),this.sun.color.lerp(new G(`#ffcf87`),this.heatK*.45),this.hemi.color.copy(new G(`#7086bd`).lerp(new G(`#fff2da`),o).lerp(new G(`#c7cdd3`),c*.5)),this.hemi.groundColor.copy(new G(`#2c3a33`).lerp(new G(`#78905a`),o)),this.hemi.intensity=(.75+o*.55)*(d?.62:1),this.fill.intensity=.25+o*.2,u&&!e.reducedMotion&&n>this.nextFlash&&(this.flash=1,this.nextFlash=n+3+Math.random()*5),this.flash=Math.max(0,this.flash-r*3.5),this.flash>0){let e=this.flash>.6||this.flash>.25&&this.flash<.4?this.flash:0;this.hemi.intensity+=e*2.2,this.skyMat.uniforms.top.value.lerp(new G(`#dfe6ff`),e*.6)}let T=e.reducedMotion?.3:1,E=R(e.sway,0,1);n>this.nextGust&&(this.gustTarget=E>.25?.45+Math.random()*.55:Math.random()*.35,this.nextGust=n+1.2+Math.random()*(4.5-E*3)),this.gustTarget*=Math.exp(-r*.9),this.gust+=(this.gustTarget-this.gust)*(1-Math.exp(-r*3));let D=this.gust*E,O=1/(1+i.localHeight*.04),k=(.004+E*.065)*(1+D*.8)*T*O,A=.8+E*1.5,j=E*.085*(.55+D*.7)*T*O;this.pivot.rotation.z=-j+Math.sin(n*A)*k+Math.sin(n*A*2.37+.6)*k*.35,this.pivot.rotation.x=Math.sin(n*A*.8+1)*k*.5,Rg.uTime.value=n,Rg.uWind.value=E*T,Rg.uGust.value=D*T,Rg.uHeight.value=Math.max(.6,i.localHeight);let ee=E*110+D*20,M=this.habitat?.radius??7,te=Gm(M,i.height);this.islandK+=(te-this.islandK)*(r===0?1:1-Math.exp(-r*2)),Math.abs(this.islandK-te)<.002&&(this.islandK=te);let N=this.islandK;if(this.island.group.scale.setScalar(N),this.habitat?.group.scale.setScalar(N),this.pivot.position.y=.18*N,this.landmark.scale.setScalar(N),this.landmark.position.set(2.8*N,.05*N,2.2*N),this.animals.setIslandRadius(M*N,N),this.ensureFence(M*N),this.island.dirt.scale.setScalar(R(Math.max(.22,i.trunkRadius*3.2)/1.1/N,.05,1.5)),this.island.update(n,ee),this.habitat?.update(n,ee),this.landmark.visible=!!e.landmark,this.sparkles.visible=!!e.starry,this.sparkles.visible&&(this.sparkles.rotation.y=n*.05,this.sparkles.scale.setScalar((this.habitat?.radius??7)*this.islandK/7)),this.glow.visible=!!e.thriving&&!e.reducedMotion,this.glow.visible){let e=this.glow.geometry.getAttribute(`position`),t=Math.max(1,i.height);for(let r=0;r<e.count;r++){let i=(n*.25+r*.137)%1;e.setY(r,.3+i*t*1.1)}e.needsUpdate=!0,this.glow.scale.set(Math.max(1,t*.35),1,Math.max(1,t*.35)),this.glow.material.opacity=.35+.35*Math.sin(n*2)}this.pivot.updateMatrixWorld(!0),this.animals.update(n,r,s);let ne=(this.habitat?.radius??7)*this.islandK,re=this.habitat?.stage??0,ie=new G(`#ffffff`).lerp(new G(`#9aa3ad`),c).lerp(new G(`#59616b`),d?.6:0).lerp(new G(`#39435e`),s*.8);this.cloudMat.color.copy(ie),this.cloudMat.emissiveIntensity=.35*o*(1-c*.6);let ae=8+Math.round(c*8);this.clouds.forEach((e,t)=>{e.a+=e.speed*r*(1+ee*.02),e.mesh.visible=t<ae;let n=1+c*.6+this.camDist/40*(e.low?0:.8);e.mesh.scale.setScalar(n);let i=e.low?Math.max(e.r,ne+3+e.r*.3):e.r+this.camDist*.35;e.mesh.position.set(Math.cos(e.a)*i,e.y+(e.low?0:c*2),Math.sin(e.a)*i)}),this.stars.material.opacity=s*(1-c*.9),this.stars.visible=s>.02,this.sea.material.color.set(`#58b6e0`).lerp(new G(`#5d7482`),c*.8).lerp(new G(`#122036`),s*.7);let oe=i.height*i.group.scale.y,se=Math.max(.05,i.canopyRadius*i.group.scale.x),ce=Math.max(.3,Math.sqrt((oe*.55)**2+se*se)*1.14,ne*[.03,.2,.3,.36,.38][re]),P=qi.degToRad(this.camera.fov/2),le=Math.atan(Math.tan(P)*this.camera.aspect),ue=this.camera.aspect<.8,de=Math.max(ce/Math.sin(P)*(ue?1.3:1.18),ce/Math.sin(le)*(ue?1.12:1.05)),fe=oe*.47+(ue?oe*.02:0),pe=1-Math.exp(-r*1.6);this.camDist===10&&this.lastTime<.2&&(this.camDist=de),this.camDist+=(de-this.camDist)*(r===0?1:pe),this.camTargetY+=(fe-this.camTargetY)*(r===0?1:pe);let me=r===0?1:1-Math.exp(-r*9);!this.isZoomed()&&!this.pinch&&this.panGoal.multiplyScalar(1-Math.min(1,r*3)),this.zoom+=(this.zoomGoal-this.zoom)*me,this.panOff.lerp(this.panGoal,me),!this.dragging&&!this.isZoomed()&&!this.followRef&&performance.now()-this.lastDrag>5e3&&(this.dragAz*=1-Math.min(1,r*.6),this.dragEl*=1-Math.min(1,r*.6));let he=l_+this.dragAz+Math.sin(n*.05)*.03*T,ge=c_+this.dragEl,_e=new U(0,this.camTargetY,0).add(this.panOff),ve=this.camDist*this.zoom,ye=this.followRef?this.animals.focusRef(this.followRef):this.follow?this.animals.focus(this.follow):null;this.followRef&&!ye&&(this.followRef=null),ye&&!Number.isFinite(ye.pos.x)&&(ye=null),ye&&(this.followOn||this.followPos.copy(ye.pos),this.followPos.lerp(ye.pos,r===0?1:1-Math.exp(-r*4)),_e.copy(this.followPos),_e.y+=ye.size*.3,ve=Math.max(.25,ye.size*4.2)*this.followZoom),this.followOn=!!ye;let be=ye?Math.min(ge,.38):ge,xe=he;if(ye){let e=Math.atan2(Math.cos(ye.yaw),-Math.sin(ye.yaw))+.9,t=Math.atan2(Math.sin(e-this.followAz),Math.cos(e-this.followAz));if(this.followAz+=t*(1-Math.exp(-r*1.2)),this.followCheckT-=r,this.followCheckT<=0){this.followCheckT=.35;let e=this.clearView(_e,this.followAz,be,ve,ye.size);this.followBiasGoal=e.bias,this.followCap=e.cap}this.followBias+=(this.followBiasGoal-this.followBias)*(1-Math.exp(-r*3)),xe=this.followAz+this.followBias,ve>this.followCap&&(ve=this.followCap)}else this.followAz=he,this.followBias=this.followBiasGoal=0,this.followCap=1/0;if(this.camera.position.set(_e.x+Math.sin(xe)*Math.cos(be)*ve,_e.y+Math.sin(be)*ve,_e.z+Math.cos(xe)*Math.cos(be)*ve),this.isZoomed()||ye){let e=(this.habitat?.groundAt(this.camera.position.x,this.camera.position.z)??0)+Math.min(.12,ve*.2);this.camera.position.y<e&&(this.camera.position.y=e)}this.camera.lookAt(_e);let Se=ue?.085:.03;this.camera.setViewOffset(this.width,this.height,0,-this.height*Se,this.width,this.height),this.camera.near=R(ve*.02,.005,2),this.camera.far=Math.max(900,ve*3+500),this.sky.position.copy(this.camera.position),this.sea.position.set(this.camera.position.x,-22*this.islandK,this.camera.position.z),this.camera.updateProjectionMatrix(),x.near=Math.max(ve,this.camDist)*1.15,x.far=Math.max(ve,this.camDist)*2.6+40;let F=new U(-.55,.8-p*.3,.45).normalize();if(this.heatK>.001){let e=new U(Math.cos(he),0,-Math.sin(he)),t=new U(Math.sin(he),0,Math.cos(he)),n=e.multiplyScalar(.62).add(new U(0,.82,0)).addScaledVector(t,-.12).normalize();F.lerp(n,this.heatK*.85).normalize()}let Ce=R(Math.min(ce*1.3,ve*1.2+(ye?0:ce*.2)),1.2,400);this.sun.position.copy(_e).addScaledVector(F,Ce*3),this.sun.target.position.copy(_e);let we=this.sun.shadow.camera;we.left=-Ce,we.right=Ce,we.top=Ce,we.bottom=-Ce,we.near=.5,we.far=Ce*6,we.updateProjectionMatrix(),this.fill.position.set(6,4,8),this.updateRain(l,ee,r,_e),this.renderer.render(this.scene,this.camera),this.drawRays(e,n)}drawRays(e,t){let n=t-this.swellT,r=n>=0&&n<6?Math.sin(n/6*Math.PI):0,i=Math.max(this.heatK,r*.9),{glow:a,haze:o,shafts:s}=this.rays;if(this.renderer.toneMappingExposure=.95+i*.03,i<.01){a.visible=o.visible=!1,s.forEach(e=>e.visible=!1);return}let c=e.reducedMotion,l=c?1:.82+.14*Math.sin(t*.55)+.05*Math.sin(t*1.4+1),u=this.width,d=this.height,f=Math.max(u,d),p=u*.98,m=d*.99;a.visible=o.visible=!0,a.position.set(p,m,0),a.scale.set(f*.75,f*.75,1),a.material.opacity=.34*i*l,o.position.set(p,m,0),o.scale.set(f*2.2,f*2.2,1),o.material.opacity=.08*i;let h=u*.42,g=d*.4,_=Math.atan2(g-m,h-p),v=Math.hypot(h-p,g-m),y=[-.26,-.15,-.05,.04,.14,.24];s.forEach((e,n)=>{e.visible=!0;let r=c?0:Math.sin(t*.07+n*1.7)*.025;e.position.set(p,m,0),e.rotation.z=_+y[n]+r,e.scale.set(v*(1.05+n%3*.18),f*(.045+n%3*.025),1);let a=c?.8:.55+.45*Math.sin(t*.35+n*1.3);e.material.opacity=.11*i*a*l});let b=this.renderer.autoClear;this.renderer.autoClear=!1,this.renderer.render(this.hud,this.hudCam),this.renderer.autoClear=b}speciesThumb(e,t,n,r=192){let i=`${e}|${t}|${r}`,a=this.speciesThumbs.get(i);if(a)return a;let o=s_({species:e,stage:t,heightCm:n,health:90,pests:0,scars:0,seed:11}),s=new eo;s.add(new Mu(`#fff8e8`,`#8a9a6a`,1.5));let c=new qu(`#fff1d6`,2.4);c.position.set(-2,3,2.5),s.add(c),s.add(o.group);let l=o.height*.05,u=new K(new Dc(o.canopyRadius*1.1+l,o.canopyRadius*1+l,o.height*.02,20),new lu({color:`#8cc26a`,flatShading:!0}));u.position.y=-o.height*.01,s.add(u);let d={w:Rg.uWind.value,g:Rg.uGust.value,h:Rg.uHeight.value};Rg.uWind.value=0,Rg.uGust.value=0,Rg.uHeight.value=o.localHeight;let f=new go().setFromObject(o.group),p=f.getCenter(new U),m=f.getSize(new U),h=new Wu(28,1,Math.max(.001,o.height*.01),Math.max(50,o.height*20)),g=Math.max(m.y*.55,m.x*.6,m.z*.6);h.position.copy(p).add(new U(.35,.28,1).normalize().multiplyScalar(g/Math.tan(qi.degToRad(14))*1.02)),h.lookAt(p);let _=this.renderToUrl(s,h,r);return Rg.uWind.value=d.w,Rg.uGust.value=d.g,Rg.uHeight.value=d.h,o.dispose(),u.geometry.dispose(),this.speciesThumbs.set(i,_),_}renderToUrl(e,t,n){let r=new ma(n,n,{colorSpace:ri,samples:4}),i=this.renderer.getRenderTarget(),a=this.renderer.toneMappingExposure;this.renderer.toneMappingExposure=1,this.renderer.setRenderTarget(r),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.render(e,t);let o=new Uint8Array(n*n*4);this.renderer.readRenderTargetPixels(r,0,0,n,n,o),this.renderer.setRenderTarget(i),this.renderer.setClearColor(0,1),this.renderer.toneMappingExposure=a,r.dispose();let s=document.createElement(`canvas`);s.width=s.height=n;let c=s.getContext(`2d`),l=c.createImageData(n,n);for(let e=0;e<n;e++)l.data.set(o.subarray((n-1-e)*n*4,(n-e)*n*4),e*n*4);return c.putImageData(l,0,0),s.toDataURL(`image/png`)}updateRain(e,t,n,r){if(this.rain.visible=e>0,!e)return;let i=this.rain.geometry.getAttribute(`position`),a=i.count/2,o=Math.floor(a*e);this.rain.geometry.setDrawRange(0,o*2);let s=Math.max(14,this.camDist*.9),c=s*1.2,l=s*.035,u=Math.min(.9,t*.012),d=s*1.4,f=this.rainSeeds,p=this.lastTime;for(let e=0;e<o;e++){let t=(f[e*3]-.5)*s*1.6,n=(f[e*3+2]-.5)*s*1.6,a=(f[e*3+1]+p*d/c)%1,o=r.y+c*.6-a*c,m=t+u*a*c*.4;i.setXYZ(e*2,m,o,n),i.setXYZ(e*2+1,m-u*l,o-l,n)}i.needsUpdate=!0,this.rain.material.opacity=.35+e*.35}thumbnail(e,t){let n=`${e}|${t}`,r=this.thumbs.get(n);if(r)return r;let i=Xh(e);if(!i)return null;let a=new eo;a.add(new Mu(`#ffffff`,`#b0a080`,1.4));let o=new qu(`#fff1d6`,2.2);o.position.set(-1,2,2),a.add(o);let s=new Ga;s.add(i),i.position.set(0,0,0);let c=gt(e)?.look.kind;c===`butterfly`||c===`dragonfly`||c===`bee`?i.rotation.set(1.05,.5,0):i.rotation.set(0,-.5,0),i.scale.setScalar(1),i.visible=!0,a.add(s);let l=new go().setFromObject(s),u=l.getCenter(new U),d=l.getSize(new U).length()*.5||1,f=new Wu(30,1,.01,50);f.position.copy(u).add(new U(.9,.7,1.9).normalize().multiplyScalar(d/Math.sin(qi.degToRad(15))*1.05)),f.lookAt(u),t||s.traverse(e=>{let t=e;t.isMesh&&(t.material=new Es({color:`#5d6b62`,transparent:!0,opacity:.55}))});let p=new ma(128,128,{colorSpace:ri,samples:4}),m=this.renderer.getRenderTarget(),h=this.renderer.shadowMap.enabled;this.renderer.setRenderTarget(p),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.render(a,f);let g=new Uint8Array(65536);this.renderer.readRenderTargetPixels(p,0,0,128,128,g),this.renderer.setRenderTarget(m),this.renderer.shadowMap.enabled=h,this.renderer.setClearColor(0,1),p.dispose();let _=document.createElement(`canvas`);_.width=_.height=128;let v=_.getContext(`2d`),y=v.createImageData(128,128);for(let e=0;e<128;e++)y.data.set(g.subarray((127-e)*128*4,(128-e)*128*4),e*128*4);v.putImageData(y,0,0);let b=_.toDataURL(`image/png`);return this.thumbs.set(n,b),b}},m_=e=>_e(e??`s3`).targetCm,h_=`sekai-tree-v2`,g_=`yiri-yisyu-weather`;function __(){try{let e=localStorage.getItem(h_);if(!e)return null;let t=JSON.parse(e);return!t||t.version!==2||typeof t.heightCm!=`number`||!t.care||!t.pest?null:(t.dayEvents??={},t.residents??=[],(!t.species||lt(t.species).season!==t.season)&&(t.species=dt(t.season??`s3`)),t.log??=[],t.over?.kind===`complete`&&(t.completed={date:t.over.date,tiers:t.over.tiers,days:t.over.days,heightCm:t.heightCm,booked:t.over.booked},t.over=null),t.completed??=null,t.passedTargetOn??=t.heightCm>=m_(t.season)?t.createdOn:null,t)}catch{return null}}function v_(e){try{localStorage.setItem(h_,JSON.stringify(e))}catch{}}function y_(){localStorage.removeItem(h_)}function b_(){try{let e=localStorage.getItem(g_);if(!e)return null;let t=JSON.parse(e);return!t?.daily?.length||!t.current?null:t}catch{return null}}function x_(e){try{localStorage.setItem(g_,JSON.stringify(e))}catch{}}var S_=[`日`,`一`,`二`,`三`,`四`,`五`,`六`];function C_(e){return et[e]}var w_=e=>i[e];function T_(e){return e<=0?`生效中`:e<1?`${Math.max(1,Math.round(e*60))} 分鐘後`:`約 ${Math.round(e)} 小時後`}function E_(e){let t=Math.max(0,Math.round(e));return`${Math.floor(t/60)} 小時 ${String(t%60).padStart(2,`0`)} 分`}function D_(e){return e.dying?e.dying.at+864e5-Date.now():0}function O_(e){let t=w_(e),n=[t.damage?`健康 −${t.damage}（抗風力可減免）`:`冇傷害`];return t.dW&&n.push(`水分 ${t.dW>0?`+`:``}${t.dW}`),t.dR&&n.push(`抗風力 ${t.dR}`),n.join(`・`)}function k_(n){let{state:r,cond:i}=n,a=document.getElementById(`weather-card`);a&&A_(a,n);let o=document.getElementById(`place-pill`);o&&(o.innerHTML=`${C_(`pin`)}<span>${z(n.place)}</span>${n.placeNote?`<small>${z(n.placeNote)}</small>`:``}${C_(`chevronDown`)}`);let s=document.getElementById(`gear`);s&&!s.innerHTML&&(s.innerHTML=C_(`gear`));let c=document.getElementById(`drawer-close`);c&&!c.innerHTML&&(c.innerHTML=C_(`close`));let l=document.getElementById(`status-card`);if(l){let i=_e(r.season),a=wt(r.heightCm,i.targetCm),o=Gt(r,`drain`);l.innerHTML=`
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${C_(`chevronRight`)}</button>
      <p class="status-sub">${z(r.treeName)} · ${z(lt(r.species).name)}${z(a.name)} · ${an(r,n.today)>i.days?`賽季完成・加時第 ${an(r,n.today)-i.days} 日`:`第 ${an(r,n.today)}/${i.days} 日`}</p>
      <div class="bars">
        ${N_(`H`,`健康`,r.health,[50,100],`health`,r.dying?`瀕死`:``)}
        ${N_(`W`,`水分`,r.moisture,e,`water`)}
        ${N_(`N`,`養分`,r.nutrients,t,`food`)}
        ${N_(`R`,`抗風`,r.resist,[60,100],`shield`)}
      </div>
      <div class="mini-acts">
        <button type="button" class="mini ${r.pest.active?`alert`:``}" data-action="deworm" ${r.care.dewormed?`disabled`:``}>${C_(`bug`)}<span>${r.care.dewormed?`除過喇`:r.pest.active?`有蟲！`:`除蟲`}</span></button>
        <button type="button" class="mini ${r.moisture>e[1]?`alert`:``}" data-action="drain" ${o.used>=o.max?`disabled`:``}>${C_(`drain`)}<span>${o.used>=o.max?`疏過喇`:`疏水`}</span></button>
      </div>`}let u=document.getElementById(`rail`);u&&(u.innerHTML=yv(r));let d=document.getElementById(`dock`);if(d){let e=i.raining,t=Gt(r,`water`),a=Gt(r,`fertilize`),o=n.countdown,s=!!(o&&w_(o.event).damage>0&&r.resist<60),c=r.animals.filter(e=>!r.seenAnimals.includes(e)).length;d.innerHTML=`
      ${P_(`d-water`,`data-action="water"`,`drop`,`澆水`,e?`落緊雨`:`${t.used}/${t.max}`,t.used>=t.max||e)}
      ${P_(`d-feed`,`data-action="fertilize"`,`sprout`,`施肥`,a.used>=a.max?`施過喇`:``,a.used>=a.max)}
      ${P_(`d-guard`,`data-open="forecast"`,`shield`,`加固`,s?`惡劣天氣`:`R ${Math.round(r.resist)}`,!1,s?`!`:``)}
      ${P_(`d-album`,`data-open="album"`,`book`,`圖鑑`,`${r.animals.length}/${ht.length}`,!1,c?String(c):``)}`}let f=document.getElementById(`note-slot`);if(f){let n=(r.dying&&!r.over?`<article class="glass note-card dying"><p><b>瀕死・${z(E_(Math.max(0,D_(r))/6e4))}</b>將水分調到 ${e[0]}–${e[1]}、養分 ${t[0]} 以上即刻救返。</p></article>`:``)+(r.started&&r.morningNote?`<article class="glass note-card"><p>${z(r.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>`:``);f.innerHTML!==n&&(f.innerHTML=n)}document.body.classList.toggle(`night`,n.night),document.body.classList.toggle(`thriving`,r.health>=80&&!r.over),document.body.classList.toggle(`dying`,!!r.dying&&!r.over),document.getElementById(`scene`)?.setAttribute(`aria-label`,`${r.treeName}，${De(i.code)}，高 ${it(r.heightCm)}`),document.title=`${r.treeName} · 世界之樹`}function A_(e,t){let{state:n,cond:r,wx:i}=t,a=i.provider===`sim`&&!i.overridden,o=a&&i.loading,s=t.countdown,c=t.todayEvents.includes(`hot`);e.classList.toggle(`severe`,!!s&&!o),e.classList.toggle(`hot`,!s&&c),e.classList.toggle(`sim`,a&&!i.loading),a?(delete e.dataset.open,e.dataset.action=`retry-weather`,e.setAttribute(`aria-label`,`模擬天氣，撳一下再試攞真實天氣`)):(delete e.dataset.action,e.dataset.open=`forecast`,e.setAttribute(`aria-label`,`天氣同預報`));let l=t.manual?w_(t.todayEvent).label:s?.active?w_(s.event).label:i.conditionText||De(r.code),u;u=s?`<span class="warn-line">${C_(`warn`)}${z(w_(s.event).label)} · ${T_(s.hours)} · 抗風力 ${Math.round(n.resist)}</span>`:i.rainInHours!==null&&!r.raining&&!a&&!t.manual?i.rainInHours<=1?`一個鐘內可能落雨`:`大約 ${i.rainInHours} 個鐘後可能落雨`:`今日：${z(w_(t.todayEvent).label)} · 今晚結算 ${z(E_(t.minutesToSettle))}後`;let d=i.warnings.slice(0,4).map(e=>`<span class="wchip ${e.tone}" title="${z(e.name)}">${M_(e)}<span>${z(e.short)}</span></span>`).join(``),f=j_(i),p=o?`--`:`${Math.round(r.tempC)}°C`;e.innerHTML=`
    <span class="wx-art">${tt(r.code,t.night,!!r.stormKind,r.stormKind||t.manual?void 0:i.nowIcon)}</span>
    <span class="wx-main"><b>${p}</b><span>${z(o?`攞緊天氣…`:l)}</span></span>
    <span class="wx-place">${C_(`pin`)}${z(t.place)}${i.station&&!a&&!t.manual?`<small>· ${z(i.station)}站</small>`:``}</span>
    ${d&&!t.manual?`<span class="wx-warns">${d}</span>`:``}
    ${u?`<span class="wx-line">${u}</span>`:``}
    <span class="wx-src ${a?`sim`:``}">${f}</span>`}function j_(e){if(e.overridden)return`手動天氣（開發者）`;if(e.provider===`sim`)return e.loading?`攞緊真實天氣…`:`模擬天氣・撳一下重試${e.hkoUsed?`（天文台警告係真嘅）`:``}`;let t=e.provider===`hko`?`天文台`:e.hkoUsed?`Open-Meteo／天文台`:`Open-Meteo`;return e.origin===`cache`?`上次天氣 ${z(e.updated)}・${t}`:`即時天氣・${t}${e.updated?` · ${z(e.updated)}`:``}${e.loading?` · 更新緊`:``}`}function M_(e){return e.group===`WTCSGNL`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l8.5 16H1.5z" fill="currentColor"/><text x="10" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${z(e.code.replace(/^TC(\d+).*/,`$1`))}</text></svg>`:e.group===`WRAIN`?`<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="3" fill="currentColor"/><path d="M7 6l-1.5 3M11 6l-1.5 3M15 6l-1.5 3M8 11l-1.5 3M12 11l-1.5 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`:e.group===`WHOT`?`<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 4.5v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="2.3" fill="#fff"/></svg>`:e.group===`WFIRE`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5c1 3.5 5.5 5.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 1.5-4 2.5-5 .2 1.7 1 2.6 2 3-.5-3 .3-5.8 1-8z" fill="currentColor"/></svg>`:e.group===`WTS`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 1.5L4 11h5l-1.5 7.5L16 8h-5z" fill="currentColor"/></svg>`:`<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 5.5v5.5M10 13.8v.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`}function N_(e,t,n,r,i,a=``){let o=Math.round(Math.max(0,Math.min(100,n)));return`<div class="bar ${i} ${o>=r[0]&&o<=r[1]?`ok`:`off`}" title="${t} 最佳 ${r[0]}–${r[1]}">
    <span class="bar-key">${e}</span><span class="bar-label">${t}</span>
    <span class="bar-track"><span class="bar-band" style="left:${r[0]}%;width:${r[1]-r[0]}%"></span><span class="bar-fill" style="width:${o}%"></span></span>
    <b class="bar-val">${a?z(a):o}</b>
  </div>`}function P_(e,t,n,r,i,a,o=``){return`<button type="button" class="dock-btn ${e} ${a?`done`:``}" ${t} ${a?`aria-disabled="true"`:``}>
    <span class="dock-ic">${C_(n)}</span><span class="dock-label">${r}</span>${i?`<small>${z(i)}</small>`:``}${o?`<em class="badge">${z(o)}</em>`:``}
  </button>`}var F_={plant:{icon:`sprout`,tone:`green`,title:`種低幼苗`},water:{icon:`drop`,tone:`blue`,title:`已澆水`},fertilize:{icon:`leaf`,tone:`green`,title:`已施肥`},deworm:{icon:`bug`,tone:`orange`,title:`已除蟲`},drain:{icon:`drain`,tone:`blue`,title:`已疏水`},reinforce:{icon:`shield`,tone:`orange`,title:`已加固`},animal:{icon:`bird`,tone:`purple`,title:`新朋友來訪`},stage:{icon:`arrowUp`,tone:`blue`,title:`進入新階段`},settle:{icon:`calendar`,tone:`blue`,title:`夜間結算`},"storm-safe":{icon:`shield`,tone:`green`,title:`捱過惡劣天氣`},"storm-hit":{icon:`warn`,tone:`red`,title:`天氣受損`},pest:{icon:`bug`,tone:`red`,title:`蟲害`},dying:{icon:`heart`,tone:`red`,title:`瀕死`},badge:{icon:`sparkle`,tone:`purple`,title:`徽章`},event:{icon:`sparkle`,tone:`yellow`,title:`今日小事`},grow:{icon:`sprout`,tone:`blue`,title:`靜靜長高`}},I_=``;function L_(e,t){let n=document.getElementById(`sheet-body`),r=document.getElementById(`sheet-title`);if(!n)return;let i=`${t}|${e.log.length}|${e.log[0]?.text??``}|${e.log[0]?.time??``}`;if(r){let n=e.log.filter(e=>e.date===t).length;r.innerHTML=`成長日誌${n?`<small>今日 ${n} 則</small>`:``}`}if(i===I_)return;if(I_=i,!e.log.length){n.innerHTML=`<p class="empty">仲未有紀錄。澆水、施肥或者等動物來訪，都會寫低喺度。</p>`;return}let a=``,o=[];for(let n of e.log){if(n.date!==a){a&&o.push(`</ol>`),a=n.date;let e=v(n.date,t),r=e===0?`今日`:e===1?`昨日`:`${b(n.date)}（${S_[y(n.date)]??``}）`;o.push(`<h4 class="log-day">${z(r)}</h4><ol class="log-list">`)}o.push(R_(n))}o.push(`</ol>`),n.innerHTML=o.join(``)}function R_(e){let t=e.kind?F_[e.kind]:{icon:`calendar`,tone:`gray`,title:`紀錄`},n=e.title||t.title,r=e.time||`夜裡`,i=e.reward?`<span class="chip ${e.reward.tone}">${z(e.reward.text)}</span>`:``;return`<li class="log-row">
    <time>${z(r)}</time>
    <span class="log-ic ${t.tone}">${C_(t.icon)}</span>
    <span class="log-copy"><b>${z(n)}</b><span>${z(e.text)}</span></span>
    ${i}
  </li>`}function z_(e){let t=document.getElementById(`panel`);if(!t)return;let n=t.scrollTop;t.innerHTML=`${B_(e.tab)}<div class="panel-body">${V_(e)}</div>`,t.scrollTop=n,iv()}function B_(e){return`<nav class="tabs" role="tablist">${[[`care`,`照顧`],[`forecast`,`天氣·加固`],[`album`,`圖鑑`],[`milestones`,`賽季`]].map(([t,n])=>`<button type="button" role="tab" data-tab="${t}" class="${t===e?`on`:``}" aria-selected="${t===e}">${n}</button>`).join(``)}</nav>`}function V_(e){if(!e.state.started)return`<div class="card quiet"><p>先揀賽季同替棵樹起個名。</p></div>`;switch(e.tab){case`forecast`:return K_(e);case`album`:return Y_(e);case`milestones`:return $_(e);default:return H_(e)}}function H_(n){let{state:r,cond:i}=n,a=on(r),o=w_(n.todayEvent),s=n.todayEvents.filter(e=>e!==`clear`),c=Gt(r,`water`),l=Gt(r,`drain`),u=Gt(r,`fertilize`),d=r.lastSettlement,f=he(r.health);return`
    <article class="card event-card ${o.severe?`warn`:``}">
      <p class="eyebrow">今日天氣事件${n.manual?`（手動）`:``}</p>
      <h2>${z(o.label)}</h2>
      <p>${z(O_(n.todayEvent))}。${z(o.tip)}</p>
      ${s.length>1?`<p class="fine">同時有${s.map(e=>z(w_(e).label)).join(`、`)}：唔會疊加，只計最重嘅${z(o.label)}。</p>`:``}
      <p class="fine">今晚結算：${z(E_(n.minutesToSettle))}後</p>
    </article>
    <div class="meters">
      ${G_(`健康 H`,r.health,`health`,[50,100])}
      ${G_(`水分 W`,r.moisture,`water`,e)}
      ${G_(`養分 N`,r.nutrients,`food`,t)}
      ${G_(`抗風力 R`,r.resist,`shield`,[60,100])}
    </div>
    <p class="fine">最佳：水分 ${e[0]}–${e[1]}，養分 ${t[0]}–100。而家${z(f.label)}（×${f.mult}）${r.health>=80?`，有綠光`:``}。${r.pest.active?`<b class="bad">有蟲害：每晚 −15 健康。</b>`:``}</p>
    <p class="advice">${z(rn(r,n.todayEvent,n.countdown))}</p>
    <div class="actions">
      ${W_(`water`,`drop`,`blue`,`澆水`,i.raining?`落緊雨`:`+${p.water.amount} 水分 · ${c.used}/${c.max}`,c.used>=c.max||i.raining)}
      ${W_(`fertilize`,`sprout`,`green`,`施肥`,`+${p.fertilize.amount} 養分 · ${u.used}/${u.max}`,u.used>=u.max)}
      ${W_(`deworm`,`bug`,`orange`,`除蟲`,r.care.dewormed?`用過喇`:r.pest.active?`有蟲！`:`預防`,r.care.dewormed)}
      ${W_(`drain`,`drain`,`purple`,`疏水`,`${p.drain.amount} 水分 · ${l.used}/${l.max}`,l.used>=l.max)}
    </div>
    ${d?U_(d):``}
    <article class="card event">
      <p class="eyebrow">今日小事</p>
      <h2>${z(a.title)}</h2>
      <p>${z(a.text)}</p>
    </article>
    <p class="fine">碳吸收量：約 ${be(r.heightCm)} 公斤 CO₂／年（0.35 × 高度^1.5）。用心照顧過 ${r.daysCared} 日。進度只係留喺呢部機。</p>
  `}function U_(e){return`<article class="card settle">
      <p class="eyebrow">上次夜間結算 · ${z(b(e.date))}</p>
      <h2>${z(w_(e.event).label)}：健康 ${Math.round(e.hBefore)} → ${Math.round(e.hAfter)}</h2>
      <ul class="breakdown">
        <li><span>水分因素</span><b>${e.wFactor>0?`+`:``}${e.wFactor}</b><small>W ${Math.round(e.wBefore)}→${Math.round(e.wAfter)}</small></li>
        <li><span>養分因素</span><b>${e.nFactor>0?`+`:``}${e.nFactor}</b><small>N ${Math.round(e.nBefore)}→${Math.round(e.nAfter)}</small></li>
        <li><span>天氣損傷</span><b>−${e.finalDamage}</b><small>基礎 ${e.baseDamage} × (1 − ${Math.round(e.rBefore)}/100)</small></li>
        ${e.pestDamage?`<li><span>蟲害</span><b>−${e.pestDamage}</b><small></small></li>`:``}
        <li><span>生長</span><b>${e.deltaG>=0?`+`:``}${e.deltaG} 厘米</b><small>${e.baseGrowth} × ${e.hMult} × ${e.weatherBonus}</small></li>
      </ul>
      ${e.notes.length?`<p class="fine">${e.notes.map(z).join(`；`)}</p>`:``}
    </article>`}function W_(e,t,n,r,i,a){return`<button type="button" class="act ${n} ${a?`done`:``}" data-action="${e}" ${a?`disabled`:``}>
    <span class="act-ic">${C_(t)}</span><span>${r}</span><small>${z(i)}</small>
  </button>`}function G_(e,t,n,r){let i=Math.round(Math.max(0,Math.min(100,t)));return`<div class="meter ${i>=r[0]&&i<=r[1]?`ok`:`off`}">
    <div class="meter-top"><span>${e}</span><span>${i}</span></div>
    <div class="track"><div class="band" style="left:${r[0]}%;width:${r[1]-r[0]}%"></div><div class="fill ${n}" style="width:${i}%"></div></div>
  </div>`}function K_(e){let{state:t}=e,n=e.countdown,r=n?`<article class="card warn countdown">
        <p class="eyebrow">${C_(`warn`)}12 小時惡劣天氣預警</p>
        <h2>${z(w_(n.event).label)} · ${z(T_(n.hours))}</h2>
        <p>${z(O_(n.event))}。${z(w_(n.event).tip)}</p>
        <p class="fine">來源：${z(n.source)}。以而家抗風力 ${Math.round(t.resist)} 計，傷害會係 ${Math.round(w_(n.event).damage*(1-t.resist/100))}。</p>
      </article>`:`<article class="card"><p class="eyebrow">12 小時預警</p><p>未來 12 小時未見惡劣天氣。</p></article>`,a=Object.keys(m).map(e=>`<button type="button" class="prep ${t.care.preps[e]?`on`:``}" data-prep="${e}" aria-pressed="${t.care.preps[e]}"><span>${m[e].label}</span><small>${t.care.preps[e]?`今日做過`:`+${m[e].amount} 抗風力`}</small></button>`).join(``),o=`<article class="card">
      <p class="eyebrow">加固・抗風力 R</p>
      <h2>${Math.round(t.resist)} / 100</h2>
      <div class="track fat"><div class="fill shield" style="width:${Math.round(t.resist)}%"></div></div>
      <p>最終天氣損傷 = 基礎傷害 × (1 − R/100)。狂風雷暴會消耗 30、初級颱風 40、高級颱風 80；每晚繩索鬆少少（−2）。每樣加固每日做一次。</p>
      <div class="preps">${a}</div>
    </article>`,s=e.forecast.map(t=>{let n=t.date===e.today?e.todayEvent:qe(t),r=w_(n),i=n===`clear`?``:`<span class="tag ${r.damage>=30?`typhoon`:r.severe?`rain`:`wind`}">${z(r.label)}</span>`,a=t.date===e.today?` today`:``;return`<article class="day ${r.damage>=30?`danger`:r.severe?`warn`:``}${a}">
        <span class="day-art">${tt(t.code,!1,r.damage>=30,t.hkoIcon)}</span>
        <div><strong>${t.date===e.today?`今日`:`星期${S_[y(t.date)]??``}`}</strong><span>${z(b(t.date))}</span></div>
        <div><b>${z(Oe(t))}</b><span>${Math.round(t.tempMin)}–${Math.round(t.tempMax)}° · 雨 ${Math.round(t.precipMm)} 毫米 · 陣風 ${Math.round(t.gustKmh)}</span></div>
        <div class="tags">${i}</div>
        ${e.wx.hkoDays[t.date]?`<p class="hko-day">天文台：${z(e.wx.hkoDays[t.date])}</p>`:``}
      </article>`}).join(``),c=e.wx,l=c.hkoUsed?`<article class="card hko">
        <p class="eyebrow">香港天文台</p>
        ${c.warnings.length?`<ul class="hko-warns">${c.warnings.map(e=>{let t=Ge([e])[0];return`<li class="${e.tone}">${M_(e)}<span><b>${z(e.name)}</b>${t?`<small>遊戲當：${z(w_(t).label)}</small>`:``}</span></li>`}).join(``)}</ul>`:`<p>而家冇天氣警告生效。</p>`}
        ${c.messages.length?`<p class="fine">${c.messages.map(z).join(`<br>`)}</p>`:``}
        ${c.situation?`<p class="fine">${z(c.situation)}</p>`:``}
      </article>`:``,u=Object.values(i).map(e=>`<tr><td>${z(e.label)}</td><td>${e.damage?`−${e.damage}`:`0`}</td><td>${z([e.dW?`W ${e.dW>0?`+`:``}${e.dW}`:``,e.dR?`R ${e.dR}`:``].filter(Boolean).join(` `)||`—`)}</td></tr>`).join(``);return`
    ${r}
    ${o}
    ${l}
    <p class="status">${z(e.statusLine)}${c.provider===`sim`&&!c.overridden?` <button type="button" class="linkish" data-action="retry-weather">再試</button>`:``}</p>
    <div class="days">${s}</div>
    <h3 class="sub">天氣事件表</h3>
    <table class="evtable"><thead><tr><th>事件</th><th>健康</th><th>副作用</th></tr></thead><tbody>${u}</tbody></table>
    <p class="fine">香港：酷熱天氣警告 → 酷熱；黃／紅雨 → 暴雨；黑雨 → 黑雨；雷暴警告或強烈季候風 → 狂風雷暴；一號／三號風球 → 初級颱風；八號或以上 → 高級颱風。其他地方按 Open-Meteo 天氣碼、陣風同雨量判斷。同一日幾個警告唔會疊加，只計基礎傷害最高嗰個。</p>
    <button type="button" class="texty" data-action="locate">用我所在位置更新天氣</button>
  `}var q_=`animals`;function J_(e){q_=e}function Y_(e){return`<div class="seg album-seg"><button type="button" class="${q_===`animals`?`on`:``}" data-album-mode="animals">動物 ${e.state.animals.length}/${ht.length}</button><button type="button" class="${q_===`species`?`on`:``}" data-album-mode="species">樹種 ${ct.length}</button></div>`+(q_===`species`?Z_(e):X_(e))}function X_(e){let t=e.state.animals.length,n=vt.map(t=>{let n=ht.filter(e=>e.category===t),r=n.filter(t=>e.state.animals.includes(t.id)).length,i=n.map(n=>{let r=e.state.animals.includes(n.id),i=r&&!e.state.seenAnimals.includes(n.id),a=e.state.residents.includes(n.id);return`<button type="button" class="creature ${r?``:`locked`}" data-seen="${n.id}">
      <span class="thumb" data-animal="${n.id}" data-locked="${r?`0`:`1`}"></span>
      <strong>${r?z(n.name):`？？？`}${i?`<em>新</em>`:``}${a?`<em class="res">長駐</em>`:``}</strong>
      <span class="chip cat-${t}">${z(_t[t])}${n.group[1]>1?`・成群 ${n.group[0]}–${n.group[1]}`:``}</span>
      <span>${z(r?n.epithet:xt(n))}</span>
      <small>${r?z(n.about):`解鎖：${z(xt(n))}`}</small>
    </button>`}).join(``);return`<h3 class="sub">${z(_t[t])} <small>${r}/${n.length}</small></h3><div class="album">${i}</div>`}).join(``),r=e.state.residents.length;return`<p class="status">圖鑑 ${t} / ${ht.length} · 長駐 ${r}</p>
    <p class="advice">見過嘅動物會輪流返嚟探棵樹（雀鳥成群飛過、猴子成群落地）。健康度連續 3 晚 90 以上，已見過嘅動物會長駐：每隻每晚 +2 養分（最多 +6）；兩隻或以上仲會幫手防蟲。健康跌穿 70 佢哋會搬走。</p>
    ${n}`}function Z_(e){return`<p class="status">九個樹種，每個賽季三款，真實成樹高度對應賽季目標。</p>${ct.map(t=>{let n=_e(t.season),r=t.id===e.state.species,i=t.stages.map((e,t)=>`<li><b>${ot[t]}</b>${z(e)}</li>`).join(``);return`<article class="card species-card ${r?`mine`:``}">
      <div class="species-head">
        <span class="sthumb" data-species-thumb="${t.id}:3" data-cm="${pt(3,n.targetCm)}"></span>
        <div><p class="eyebrow">${z(n.label)}・目標 ${n.targetCm/100} 米${r?`・你棵樹`:``}</p>
        <h2>${z(t.name)}</h2>
        <p class="sci">${z(t.english)} · <i>${z(t.scientific)}</i></p>
        <p class="fine">一般 ${z(t.typicalM)} 米・最高紀錄 ${t.maxM} 米</p></div>
      </div>
      <p>${z(t.blurb)}</p>
      <p class="fine">${z(t.record)}。資料：<a href="${z(t.source.url)}" target="_blank" rel="noopener">${z(t.source.label)}</a></p>
      <ol class="stage-list">${i}</ol>
      ${Q_(t.id)}
    </article>`}).join(``)}`}function Q_(e){let t=xg(e),n=t.adds.map((e,t)=>e.length?`<li><b>${ot[t]}</b>${e.map(e=>z(vg[e])).join(`、`)}</li>`:``).filter(Boolean).join(``);return`<div class="habitat"><p class="eyebrow">原生地・${z(t.name)}</p><p class="fine">${z(t.blurb)}</p><ol class="stage-list">${n}</ol></div>`}function $_(e){let{state:t,meta:n}=e,r=_e(t.season),i=an(t,e.today),a=Math.min(r.days,i),o=i>r.days?i-r.days:0,s=Math.min(100,t.heightCm/r.targetCm*100),c=t.heightCm>=r.targetCm,l=t.heightCm/100,u=Ot.find(e=>l<e.meters),f=[1,2,3].map(e=>{let t=n.badges[String(e)];return`<li class="${t?`done`:``}"><strong>${z(d[e].name)}${t>1?` ×${t}`:``}</strong><span>${t?`已擁有`:`完成 ${[0,3,6,12][e]} 個月賽季解鎖`}</span><p>${z(d[e].perk)}</p></li>`}).join(``),p=Ot.map(e=>`<li class="${l>=e.meters?`done`:``}"><strong>${z(e.title)}</strong><span>${e.meters>=1?`${e.meters} 米`:`${Math.round(e.meters*100)} 厘米`}</span><p>${z(e.detail)}</p></li>`).join(``);return`
    <article class="card">
      <p class="eyebrow">${z(r.label)}</p>
      <h2>${o?`賽季完成・加時第 ${o} 日`:`第 ${a} / ${r.days} 日`} · ${z(it(t.heightCm))}</h2>
      <p>${c?`已突破目標（${r.targetCm/100} 米，達成 ${Math.round(t.heightCm/r.targetCm*100)}%）。目標只係里程碑，冇高度上限。`:`目標 ${r.targetCm/100} 米（只係目標，唔係上限）。`}每日基本生長 ${(r.targetCm/r.days).toFixed(1)} 厘米 × 健康係數 × 天氣加成${o?`，賽季完咗都照樣計`:``}。</p>
      <div class="track fat"><div class="fill food" style="width:${s.toFixed(1)}%"></div></div>
      <p class="fine">碳吸收量約 ${be(t.heightCm)} 公斤 CO₂／年。將軍樹 ${Et} 米（而家 ${z(at(l,Et))}%），海波龍 ${Dt} 米。${u?`下一個里程：${z(u.title)}（${u.meters} 米）。`:``}</p>
    </article>
    <h3 class="sub">徽章</h3>
    <ol class="miles">${f}</ol>
    <p class="fine">中途枯死都唔蝕：捱過 3 個月會發一級、6 個月發二級徽章。免死金牌 ${n.reviveTokens} 面${n.starry?`・已解鎖星空浮島`:``}。${n.landmark?`養分地標：${z(n.landmark.name)}（${z(it(n.landmark.heightCm))}）。`:``}</p>
    <h3 class="sub">里程</h3>
    <ol class="miles">${p}</ol>
    <button type="button" class="texty" data-action="rename">改棵樹的名</button>
  `}var ev=null,tv=null;function nv(e,t){ev=e,tv=t??null}var rv=0;function iv(){let e=++rv,t=[];document.querySelectorAll(`.sthumb[data-species-thumb]`).forEach(e=>{e.firstChild||t.push(()=>{let[t,n]=(e.dataset.speciesThumb??``).split(`:`),r=tv?.(t,Number(n),Number(e.dataset.cm));r?e.innerHTML=`<img src="${r}" alt="" width="120" height="120" />`:e.textContent=`🌳`})}),document.querySelectorAll(`.thumb[data-animal]`).forEach(e=>{e.firstChild||t.push(()=>{let t=e.dataset.animal;if(!t)return;let n=e.dataset.locked!==`1`,r=ev?.(t,n);if(r){e.innerHTML=`<img src="${r}" alt="" width="96" height="96" />`;return}let i=document.createElement(`canvas`);i.width=120,i.height=84,e.replaceChildren(i);let a=i.getContext(`2d`);a&&mn(a,t,60,48,1200,{scale:1.35,silhouette:!n,night:t===`owl`||t===`firefly`})})});let n=()=>{if(e!==rv)return;let r=performance.now();for(;t.length&&performance.now()-r<12;)t.shift()();t.length&&window.setTimeout(n,16)};n()}var av=0;function ov(e){let t=document.getElementById(`toast`);t&&(t.textContent=e,t.classList.add(`show`),window.clearTimeout(av),av=window.setTimeout(()=>t.classList.remove(`show`),3600))}function sv(e){let t=document.getElementById(`modal`);if(!t)return;t.innerHTML=`<div class="modal-card glass" role="dialog" aria-modal="true">${e}</div>`,t.hidden=!1,iv();let n=t.querySelector(`input`);n instanceof HTMLInputElement?(n.focus(),n.select()):t.querySelector(`button`)?.focus()}function cv(e){let t=document.querySelector(`#modal .modal-card`);if(!t)return sv(e);t.innerHTML=e,iv()}function lv(){let e=document.getElementById(`modal`);e&&(e.hidden=!0,e.innerHTML=``)}function uv(e,t,n,r){if(n)return`
      <p class="eyebrow">世界之樹</p>
      <h2>改個名</h2>
      <label>樹的名字<input id="tree-name" maxlength="12" value="${z(e)}" autocomplete="off" /></label>
      <button type="button" class="primary" data-action="save-name">保存</button>
      <button type="button" class="texty" data-action="close-modal">取消</button>`;let i=r??{season:`s3`,species:ut(`s3`)[0].id},a=t.pendingLegacy&&t.landmark?`<p class="legacy">${z(t.landmark.name)}留低嘅養分地標會令新樹開局養分 +40。</p>`:``,o=l.map(e=>`<button type="button" class="season ${e.id===i.season?`on`:``}" data-pick-season="${e.id}" aria-pressed="${e.id===i.season}"><b>${z(e.label)}</b><span>目標 ${e.targetCm/100} 米</span><small>${e.days} 日</small></button>`).join(``),s=l.find(e=>e.id===i.season),c=ut(i.season).map(e=>`<button type="button" class="species ${e.id===i.species?`on`:``}" data-species="${e.id}" aria-pressed="${e.id===i.species}">
        <span class="sthumb" data-species-thumb="${e.id}:3" data-cm="${pt(3,s.targetCm)}"></span>
        <b>${z(e.name)}</b><i>${z(e.scientific.split(`（`)[0])}</i>
        <small>真實 ${z(e.typicalM)} 米・紀錄 ${e.maxM} 米</small>
      </button>`).join(``),u=lt(i.species);return`
    <p class="eyebrow">世界之樹・新一局</p>
    <h2>揀賽季，揀樹種</h2>
    <p>每日生存壓力一樣，分別只係時間長短、目標高度同徽章。天氣跟住現實；水分、養分保持喺最佳範圍，惡劣天氣前加固。</p>
    ${a}
    <div class="seasons pick">${o}</div>
    <p class="fine">${z(s.sub)}・每日約 ${(s.targetCm/s.days).toFixed(0)} 厘米</p>
    <div class="species-pick">${c}</div>
    <p class="species-blurb"><b>${z(u.name)}</b>：${z(u.blurb)}</p>
    <label>樹的名字<input id="tree-name" maxlength="12" value="${z(e)}" autocomplete="off" /></label>
    <button type="button" class="primary" data-action="start-game">種${z(u.name)}・開始${z(s.label)}</button>`}function dv(e,t,n){let r=e.over,i=_e(e.season),a=r.kind===`dead`?`${z(e.treeName)}枯死咗`:`${z(i.label)}完成！`,o=n.length?`<ul class="badges">${n.map(e=>`<li>${z(e)}</li>`).join(``)}</ul>`:`<p>今次未夠 3 個月，未有徽章。</p>`;return`
    <p class="eyebrow">${r.kind===`dead`?`結算`:`賽季結算`}</p>
    <h2>${a}</h2>
    <p>捱咗 ${r.days} 日，高 ${z(it(e.heightCm))}，碳吸收量約 ${be(e.heightCm)} 公斤／年。</p>
    ${o}
    <p class="fine">徽章總數：一級 ${t.badges[1]}・二級 ${t.badges[2]}・三級 ${t.badges[3]}</p>
    <button type="button" class="primary" data-action="new-game">開始新一局</button>`}function fv(e,t,n){let r=e.completed,i=_e(e.season),a=n.length?`<ul class="badges">${n.map(e=>`<li>${z(e)}</li>`).join(``)}</ul>`:``,o=e.heightCm>i.targetCm?`已經突破 ${z(it(i.targetCm))} 嘅目標！`:`目標係 ${z(it(i.targetCm))}。`;return`
    <p class="eyebrow">賽季結算</p>
    <h2>${z(i.label)}完成！</h2>
    <p>捱咗 ${r.days} 日，高 ${z(it(e.heightCm))}，碳吸收量約 ${be(e.heightCm)} 公斤／年。${o}</p>
    ${a}
    <p>目標只係一個里程碑，冇高度上限：繼續照顧，${z(e.treeName)}會照同一條公式一直長高。</p>
    <p class="fine">徽章總數：一級 ${t.badges[1]}・二級 ${t.badges[2]}・三級 ${t.badges[3]}</p>
    <button type="button" class="primary" data-action="close-modal">繼續種落去</button>
    <button type="button" class="texty" data-action="new-game">開始新一局</button>`}function pv(e){return`
    <p class="eyebrow">夜間結算</p>
    <h2>昨晚發生咗啲事</h2>
    <p>${z(e)}</p>
    <button type="button" class="primary" data-action="close-modal">去望一望棵樹</button>
  `}var mv=[{id:`hk`,name:`香港`,lat:22.3022,lon:114.1744},{id:`central`,name:`中環`,lat:22.2819,lon:114.158},{id:`shatin`,name:`沙田`,lat:22.3817,lon:114.1877},{id:`taipo`,name:`大埔`,lat:22.45,lon:114.1686},{id:`saikung`,name:`西貢`,lat:22.3817,lon:114.2708},{id:`yuenlong`,name:`元朗`,lat:22.4445,lon:114.0222},{id:`tungchung`,name:`東涌`,lat:22.289,lon:113.941}];function hv(e){let t=mv.map(t=>`<button type="button" class="place ${e===t.id?`on`:``}" data-place="${t.id}">${C_(`pin`)}<span>${z(t.name)}</span></button>`).join(``);return`
    <p class="eyebrow">天氣地點</p>
    <h2>喺邊度種呢棵樹？</h2>
    <p>天氣會跟住呢個地方。揀「我所在位置」會問瀏覽器攞位置，只用嚟查天氣。</p>
    <button type="button" class="place wide ${e===`geo`?`on`:``}" data-place="geo">${C_(`locate`)}<span>用我所在位置</span></button>
    <div class="places">${t}</div>
    <button type="button" class="texty" data-action="close-modal">取消</button>
  `}function gv(e,t,n){return`
    <p class="eyebrow">設定</p>
    <h2>${z(e)}</h2>
    <div class="setting-row">
      <span>樹的名字</span>
      <button type="button" class="ghost" data-action="rename">改名</button>
    </div>
    <div class="setting-row">
      <span>畫質${n?``:`（呢部機用緊簡化畫面）`}</span>
      <div class="seg">
        <button type="button" class="${t===`low`?`on`:``}" data-quality="low" ${n?``:`disabled`}>慳電</button>
        <button type="button" class="${t===`high`?`on`:``}" data-quality="high" ${n?``:`disabled`}>精緻</button>
      </div>
    </div>
    <div class="howto">
      <p><b>點玩：</b>每晚 12 點結算：健康 = 舊健康 + 水分因素 + 養分因素 − 天氣損傷。水分保持 40–80、養分 60 以上各 +5，唔啱就 −10。</p>
      <p>天氣跟住現實（香港用天文台警告）。惡劣天氣前 12 小時會倒數，記得加固推高抗風力 R：傷害 × (1 − R/100)。</p>
      <p>健康 80 以上長得最快（×1.5，有綠光）；跌到 0 會瀕死 24 小時，將水分同養分調返最佳就救得返。</p>
    </div>
    <button type="button" class="primary" data-action="close-modal">好</button>
  `}function _v(e){return gt(e)?.name??e}function vv(e){let t=10**Math.floor(Math.log10(Math.max(1,e)));for(let n of[1,1.2,1.5,2,2.5,3,4,5,6,8,10])if(n*t>=e)return n*t;return 10*t}function yv(e){let t=_e(e.season).targetCm,n=Ct(t),r=wt(e.heightCm,t),i=n[r.index+1];if(i){let n=Tt(e.heightCm,t);return`
      <span class="rail-top ${n>.9?`dim`:``}"><small>下一階段</small><b>${z(it(r.nextCm))}</b><small>${z(i.name)}</small></span>
      <span class="rail-track"><span class="rail-fill" style="height:${(n*100).toFixed(1)}%"></span><span class="rail-marker" style="bottom:${(n*100).toFixed(1)}%"><b>${z(it(e.heightCm))}</b><small>當前</small></span></span>
      <span class="rail-bottom ${n<.14?`dim`:``}"><b>${z(it(r.minCm))}</b><small>${z(r.name)}</small></span>`}let a=e.heightCm>=t,o=a?vv(e.heightCm*1.15):t,s=Math.max(1,o-r.minCm),c=Math.max(0,Math.min(1,(e.heightCm-r.minCm)/s)),l=Math.max(0,Math.min(1,(t-r.minCm)/s)),u=a?`<span class="rail-target" style="bottom:${(l*100).toFixed(1)}%"><small>目標</small></span>`:``;return`
      <span class="rail-top ${!a&&c>.9?`dim`:``} ${a?`beyond`:``}"><small>${a?`已突破目標`:`目標`}</small><b>${z(it(o))}</b><small>${a?`冇上限`:`可以繼續長`}</small></span>
      <span class="rail-track ${a?`beyond`:``}"><span class="rail-fill" style="height:${(c*100).toFixed(1)}%"></span>${u}<span class="rail-marker" style="bottom:${(c*100).toFixed(1)}%"><b>${z(it(e.heightCm))}</b><small>${a?`已突破目標`:`當前`}</small></span></span>
      <span class="rail-bottom ${c<.14?`dim`:``}"><b>${z(it(r.minCm))}</b><small>${z(r.name)}</small></span>`}var bv=`yiri-yisyu-place-names`;function xv(e){if(!e||typeof e!=`object`)return null;let t=e,n=(t.localityInfo?.administrative??[]).filter(e=>e.name).sort((e,t)=>(t.order??0)-(e.order??0));if(t.countryCode===`HK`){let e=n.find(e=>(e.adminLevel??0)>=6)?.name;return{name:e??`香港`,district:e}}let r=n.find(e=>(e.adminLevel??0)>=6&&(e.adminLevel??0)<=8)?.name,i=t.city||t.locality||r||t.principalSubdivision;return i?{name:i}:null}function Sv(e,t){return`${e.toFixed(2)},${t.toFixed(2)}`}function Cv(){try{return JSON.parse(localStorage.getItem(bv)??`{}`)}catch{return{}}}async function wv(e,t){let n=Sv(e,t),r=Cv();if(r[n])return r[n];try{let i=`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${e.toFixed(4)}&longitude=${t.toFixed(4)}&localityLanguage=zh-Hant`,a=await fetch(i,{signal:se(6e3)});if(!a.ok)return null;let o=xv(await a.json());if(o){let e=Object.keys(r);e.length>20&&delete r[e[0]],r[n]=o,localStorage.setItem(bv,JSON.stringify(r))}return o}catch{return null}}var Tv=`sekai-tree-dev`;function Ev(){return{mode:`real`,events:[`clear`],forecast:null,time:`auto`,open:!1,preview:{},sway:null}}function Dv(){try{let e=localStorage.getItem(Tv);if(e)return{...Ev(),...JSON.parse(e)}}catch{}return Ev()}function Ov(e){try{localStorage.setItem(Tv,JSON.stringify(e))}catch{}}var kv=`modulepreload`,Av=function(e,t){return new URL(e,t).href},jv={},Mv=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Av(t,n),t=s(t),t in jv)return;jv[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:kv,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Nv=`yiri-yisyu-place`,Pv=`yiri-yisyu-quality`,Fv=`Asia/Hong_Kong`;Pt(()=>{let e=x(Fv);return`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`});var Iv=ln(),Q=__()??Rt(g(new Date,Fv)),Lv=Dv(),Rv=`care`,zv=localStorage.getItem(Nv)??``,$=$v(),Bv=$.provider===`sim`,Vv=$.origin===`live`?`天氣啱啱更新過`:`攞緊真實天氣…`,Hv=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,Uv=``,Wv={season:`s3`,species:dt(`s3`)},Gv=localStorage.getItem(Pv)===`high`?`high`:`low`,Kv=document.getElementById(`scene`);if(!(Kv instanceof HTMLCanvasElement))throw Error(`找不到畫面`);var qv=null,Jv=null;try{qv=new p_(Kv,Gv),nv((e,t)=>qv?.thumbnail(e,t)??null,(e,t,n)=>qv?.speciesThumb(e,t,n)??null)}catch(e){console.warn(`WebGL 用唔到，改用簡化畫面`,e),Jv=new kn(Kv),document.body.classList.add(`flat`)}var Yv=document.getElementById(`drawer`),Xv=document.getElementById(`drawer-backdrop`),Zv=document.getElementById(`sheet`),Qv=document.getElementById(`sheet-handle`);function $v(){let e=b_(),t=zv&&zv!==`geo`?zv:`auto`;if(e&&e.provider!==`sim`&&(e.choice??`auto`)===t){let t=Date.now()-e.fetchedAt;if(t<18e5)return{...e,origin:`live`};if(t<2592e5)return{...e,origin:`cache`}}return Pe(g(new Date,`Asia/Hong_Kong`),``)}function ey(){return g(new Date,Fv)}function ty(){let e=ey();return Q.virtualToday&&v(e,Q.virtualToday)>0?Q.virtualToday:e}function ny(){let e=ey();Q.virtualToday&&v(e,Q.virtualToday)<=0&&(Q.virtualToday=null)}var ry=()=>Lv.mode===`manual`;function iy(){return Fe($.daily,ty())}function ay(e=$){return!!e.hko&&Ey(e)}function oy(){if($.provider===`sim`&&!$.hko)return[];let e=$.daily.find(e=>e.date===ty());return Ye({hk:Ey($),warnings:$.hko?.warnings,current:$.current,today:e})}function sy(e){return ry()?Lv.events.length?[...Lv.events]:[`clear`]:Vt(Q,e,$.daily.find(t=>t.date===e))}function cy(){return sy(ty())}function ly(){let e=ty(),t=iy().find(t=>t.date===e)??Me(e);if(ry())return Qe(je(Me(e),28),me(cy()));let n=$.origin!==`offline`,r=je(t,n?$.current.tempC:(t.tempMax+t.tempMin)/2);n&&(r.code=$.current.code||r.code,r.windKmh=$.current.windKmh,r.gustKmh=$.current.gustKmh,r.tempC=$.current.tempC,r.precipMm=$.current.precipMm,r.raining=r.precipMm>=.2||Ee(r.code)||L(r.code),r.hot=!1,r.stormKind=null);let i=me(oy());return i===`clear`?r:Qe(r,i)}function uy(){let e=x(Fv);return`${ey()}T${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`}function dy(){let e=ty();return Ze({nowEvents:ry()?Lv.events:oy(),hourly:ry()?[]:$.hourly,nowIso:uy(),tomorrow:ry()?void 0:$.daily.find(t=>t.date===_(e,1)),minutesToMidnight:1440-x(Fv),manual:ry()?Lv.forecast:null,nowMs:Date.now(),activeSource:ry()?`手動天氣`:ay()?`天文台`:`即時天氣`})}function fy(){return zv&&zv!==`geo`?zv:`auto`}function py(){let e=mv.find(e=>e.id===zv);return e?{place:e.name,note:``}:$.provider===`sim`&&!$.fetchedAt?{place:`香港`,note:``}:{place:$.place||`你嘅位置`,note:$.source===`fallback`?`預設`:``}}var my={clear:.08,drizzle:.18,hot:.04,rainstorm:.55,blackrain:.65,typhoon1:.72,thunder:.85,typhoon8:1};function hy(e){if(Lv.sway!==null)return Lv.sway;let t=ry()?cy():oy(),n=Math.max(.06,...t.map(e=>my[e]??.1)),r=ry()?0:Math.min(1,((e.windKmh??0)+.5*(e.gustKmh??0))/120);return Math.min(1,Math.max(n,r))}function gy(){let e=ly(),t=iy().find(e=>e.date===ty())??Me(ty()),n=S(t.sunrise)??370,r=S(t.sunset)??1105,i=x(Fv),a=Lv.time,o=Q.animals.filter(e=>!Q.residents.includes(e)).slice(-3),s=_e(Q.season).targetCm,c=Lv.preview,l=c.species??Q.species,u=c.species?_e(lt(c.species).season).targetCm:s,d=c.stage??ft(Q.heightCm,u),f=c.island,p=c.stage!==void 0||c.species?c.stage===void 0?Q.heightCm:pt(d,u):Q.heightCm;return{treeName:Q.treeName,species:l,stage:d,islandStage:f,targetCm:u,heightCm:p,unlocked:[...Q.animals],residents:[...Q.residents],sway:hy(e),health:Q.over?.kind===`dead`?0:Math.max(Q.health,Q.dying?0:8),moisture:Q.moisture,pests:Q.pest.active?70:0,scars:Q.scars,animals:[...Q.residents,...o],cond:e,daylight:Tn(i,n,r,a),minute:a===`day`?n+180:a===`night`?1380:i,sunriseMin:n,sunsetMin:r,eventId:Q.dailyEventId,reducedMotion:Hv,reinforce:Yt(Q.resist),thriving:Q.health>=80&&!Q.over,landmark:!!Iv.landmark&&Q.legacyBonus>0,starry:Iv.starry}}function _y(e){let{place:t,note:n}=py(),r=ay();return{state:Q,meta:Iv,today:ty(),tab:Rv,place:t,placeNote:n,statusLine:Vv,cond:e.cond,forecast:iy(),night:e.daylight<.45,todayEvents:cy(),todayEvent:me(cy()),countdown:dy(),manual:ry(),minutesToSettle:1440-x(Fv),wx:{provider:$.provider??($.origin===`offline`?`sim`:`open-meteo`),origin:$.origin,loading:Bv,fetchedAt:$.fetchedAt,updated:Ty($.fetchedAt),hkoUsed:r,warnings:r?$.hko.warnings:[],messages:r?$.hko.messages:[],situation:r?$.hko.situation:``,hkoDays:r?Object.fromEntries($.hko.forecast.map(e=>[e.date,e.text])):{},conditionText:ry()?void 0:$.conditionText,nowIcon:!ry()&&r&&$.hko.current?.icon||void 0,station:$.station,rainInHours:$.rainInHours??null,error:$.error,overridden:ry()}}}function vy(){let e=gy(),t=_y(e);k_(t),L_(Q,ty()),Yv&&!Yv.hidden&&z_(t),yy(e,performance.now()),zy?.()}function yy(e,t){qv?qv.draw(e,t):Jv?.draw(e,t)}function by(){v_(Q),un(Iv)}function xy(){if(!Q.over&&Q.completed&&!Q.completed.booked){let e=fn(Iv,Q);return by(),Q.started&&sv(fv(Q,Iv,e)),!0}if(!Q.over)return!1;let e=dn(Iv,Q);return by(),Q.started&&sv(dv(Q,Iv,e)),!0}function Sy(e){if(by(),vy(),xy())return;if(e.messages.length){let t=e.messages.join(` `);Q.started?sv(pv(t)):Uv=t}let t=e.animals.map(_v);t.length&&ov(`${t.join(`、`)}嚟咗。`)}function Cy(){ny(),Sy(en(Q,ty(),sy,Iv,Date.now()))}function wy(e){let t=ty();if($=e,Fv=e.timezone||Fv,e.origin===`live`&&x_(e),Vv=e.origin===`live`?`天氣 ${Ty(e.fetchedAt)} 更新`:e.origin===`cache`?`更新唔到（${e.error??`網絡問題`}），用緊 ${Ty(e.fetchedAt)} 的記錄。`:`而家攞唔到真實天氣，暫時用模擬天氣。${e.error??``}`,ny(),e.provider!==`sim`||e.hko){let t=oy(),n=Q.dayEvents[ty()]?.events??[];Bt(Q,ty(),t,ay(e));let r=t.filter(e=>i[e].severe&&!n.includes(e));r.length&&Q.started&&!ry()&&ov(`${ay(e)?`天文台`:`天氣`}：${r.map(e=>i[e].label).join(`、`)}生效，今晚結算前仲可以準備。`)}if(Q.started&&!Q.over){let e=Qt(Q,{date:ty(),events:cy()});e.length&&ov(`${e.map(_v).join(`、`)}嚟咗。`)}if(ty()!==t){Sy(en(Q,ty(),sy,Iv,Date.now()));return}by(),vy()}function Ty(e){if(!e)return``;let t=new Date(e),n=g(t,Fv)===ey(),r=new Intl.DateTimeFormat(`en-GB`,{timeZone:Fv,hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(t);if(n)return r;let[,i,a]=g(t,Fv).split(`-`);return`${Number(i)}/${Number(a)} ${r}`}function Ey(e){return e.source!==`geo`||I(e.lat,e.lon)}var Dy=null,Oy=0;function ky(e){window.clearTimeout(Oy),Oy=window.setTimeout(()=>{document.hidden||Ay()},e)}function Ay(e=!1){return Dy||(Bv=!0,Vv=`攞緊真實天氣…`,vy(),Dy=jy(e).finally(()=>{Dy=null,Bv=!1,vy(),ky($.origin===`live`?we:12e4)}),Dy)}async function jy(e){let t=mv.find(e=>e.id===zv),n=!e&&$.source===`geo`&&$.choice===`auto`&&Date.now()-$.fetchedAt<18e5,r=t?{lat:t.lat,lon:t.lon,source:`manual`}:n?{lat:$.lat,lon:$.lon,source:`geo`}:await We(8e3),i=r.source!==`geo`||I(r.lat,r.lon),[a,o,s]=await Promise.allSettled([Ve(r.lat,r.lon),i?ce(r.lat,r.lon):Promise.resolve(null),r.source===`geo`?wv(r.lat,r.lon):Promise.resolve(null)]),c=o.status===`fulfilled`?o.value:null,l=s.status===`fulfilled`?s.value:null,u=t?.name??l?.name??(r.source===`fallback`||Te(r.lat,r.lon)?`香港`:`你嘅位置`),d=t?.name??l?.district,f=a.status===`fulfilled`?a.value:null,p=`open-meteo`,m=a.status===`rejected`?a.reason instanceof Error?a.reason.message:`未知錯誤`:void 0;if(!f&&c&&(f=He(c,ty()),p=`hko`),!f){let e=b_();if(e&&e.provider!==`sim`&&Date.now()-e.fetchedAt<2592e5){wy({...e,origin:`cache`,error:m,hko:c??e.hko,daily:c&&i?ke(e.daily,c,ty()):e.daily});return}wy({...Pe(ty(),m??``),hko:c,choice:fy()});return}let h={lat:r.lat,lon:r.lon,timezone:f.timezone,place:u,source:r.source,origin:`live`,fetchedAt:Date.now(),current:{...f.current},daily:f.daily,provider:p,hko:c,district:d,rainInHours:f.rainInHours,choice:fy(),error:p===`hko`?m:void 0};if(c?.current&&i){c.current.tempC!==null&&(h.current.tempC=c.current.tempC,h.station=c.current.station),c.current.icon&&(h.current.code=k(c.current.icon),h.conditionText=j(c.current.icon)),c.current.humidity!==null&&(h.current.humidity=c.current.humidity);let e=Ue(c,d);e===null?c.current.icon&&!M(c.current.icon)&&(h.current.precipMm=0):h.current.precipMm=Math.min(8,e)}c&&i&&(h.daily=ke(h.daily,c,ty())),wy(h)}function My(){sv(uv(`世界之樹`,Iv,!1,Wv))}function Ny(e,t){let n=document.getElementById(`tree-name`),r=(n instanceof HTMLInputElement?n.value.trim().slice(0,12):``)||`世界之樹`,i=Q.started&&!Q.over;if(i?Q.treeName=r:(Q=pn(Iv,ey(),e,r,t),Rv=`care`),by(),lv(),vy(),i||ov(`${Q.treeName}種好喇。今日先澆水、施肥。`),Uv){let e=Uv;Uv=``,sv(pv(e))}}function Py(e){Yv&&Xv&&(Rv=e,Iy(!1),Yv.hidden=!1,Xv.hidden=!1,requestAnimationFrame(()=>{Yv.classList.add(`open`),Xv.classList.add(`open`)}),vy())}function Fy(){Yv&&Xv&&!Yv.hidden&&(Yv.classList.remove(`open`),Xv.classList.remove(`open`),window.setTimeout(()=>{Yv.classList.contains(`open`)||(Yv.hidden=!0,Xv.hidden=!0)},260))}function Iy(e){Zv&&(Zv.dataset.state=e?`open`:`closed`,Zv.style.transform=``,Qv?.setAttribute(`aria-expanded`,String(e)),document.body.classList.toggle(`sheet-open`,e),e&&L_(Q,ty()))}function Ly(){if(!Zv||!Qv)return;let e=null,t=!1,n=()=>Zv.offsetHeight-Qv.offsetHeight;Qv.addEventListener(`pointerdown`,r=>{e={y:r.clientY,t:performance.now(),open:Zv.dataset.state===`open`,closedOffset:n()},t=!1,Qv.setPointerCapture(r.pointerId),Zv.classList.add(`dragging`)}),Qv.addEventListener(`pointermove`,n=>{if(!e)return;let r=n.clientY-e.y;Math.abs(r)>6&&(t=!0);let i=e.open?0:e.closedOffset,a=Math.max(0,Math.min(e.closedOffset,i+r));Zv.style.transform=`translateY(${a}px)`});let r=n=>{if(!e)return;Zv.classList.remove(`dragging`);let r=n.clientY-e.y,i=r/Math.max(1,performance.now()-e.t),a=e.open;if(e=null,!t){Iy(!a);return}Iy(i<-.4||!a&&r<-60?!0:i>.4||a&&r>60?!1:a)};Qv.addEventListener(`pointerup`,r),Qv.addEventListener(`pointercancel`,r),Qv.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),Iy(Zv.dataset.state!==`open`))});let i=document.getElementById(`sheet-body`),a=null;i?.addEventListener(`touchstart`,e=>{a=i.scrollTop<=0?e.touches[0]?.clientY??null:null},{passive:!0}),i?.addEventListener(`touchmove`,e=>{a!==null&&(e.touches[0]?.clientY??a)-a>70&&(a=null,Iy(!1))},{passive:!0})}function Ry(e,t){if(e===`water`||e===`fertilize`||e===`deworm`||e===`drain`){let n=Kt(Q,e,{raining:ly().raining});by(),vy(),ov(n.message),n.ok&&t.classList.add(`pop`);return}switch(e){case`dismiss-note`:Q.morningNote=null,by(),vy();return;case`retry-weather`:ov(`再試緊攞真實天氣…`),Ay(!1);return;case`locate`:zv=`geo`,localStorage.setItem(Nv,zv),Ay(!0);return;case`rename`:sv(uv(Q.treeName,Iv,!0));return;case`new-game`:My();return;case`reset-view`:qv?.resetView();return;case`location`:sv(hv(zv||($.source===`geo`?`geo`:`hk`)));return;case`settings`:sv(gv(Q.treeName,Gv,!!qv));return;case`close-drawer`:Fy();return;case`close-sheet`:Iy(!1);return;case`save-name`:Ny(Q.season);return;case`start-game`:Ny(Wv.season,Wv.species);return;case`close-modal`:lv();return}}document.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t||t.closest(`#dev-root`))return;let n=t.closest(`[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality], [data-pick-season], [data-species], [data-album-mode]`);if(!n)return;let r=!!n.closest(`#modal`);if(Q.started&&!Q.over||r){if(n.dataset.pickSeason||n.dataset.species){let e=document.getElementById(`tree-name`),t=e instanceof HTMLInputElement?e.value:`世界之樹`;if(n.dataset.pickSeason){let e=n.dataset.pickSeason;Wv={season:e,species:ut(e)[0].id}}else Wv={...Wv,species:n.dataset.species};cv(uv(t,Iv,!1,Wv));return}if(n.dataset.albumMode){J_(n.dataset.albumMode===`species`?`species`:`animals`),vy();return}if(n.dataset.open){Py(n.dataset.open);return}if(n.dataset.tab){Rv=n.dataset.tab,vy();let e=document.getElementById(`panel`);e&&(e.scrollTop=0);return}if(n.dataset.prep&&n.dataset.prep in m){ov(Jt(Q,n.dataset.prep).message),by(),vy();return}if(n.dataset.seen){let e=n.dataset.seen;Q.animals.includes(e)&&!Q.seenAnimals.includes(e)&&(Q.seenAnimals.push(e),by(),vy());return}if(n.dataset.place){zv=n.dataset.place,localStorage.setItem(Nv,zv),lv(),ov(`天氣改為跟住${mv.find(e=>e.id===zv)?.name??`你所在位置`}。`),Ay(zv===`geo`);return}if(n.dataset.quality===`low`||n.dataset.quality===`high`){Gv=n.dataset.quality,localStorage.setItem(Pv,Gv),qv?.setQuality(Gv),sv(gv(Q.treeName,Gv,!!qv));return}n.dataset.action&&Ry(n.dataset.action,n)}}),document.getElementById(`modal`)?.addEventListener(`keydown`,e=>{e.key===`Enter`&&document.activeElement===document.getElementById(`tree-name`)&&Q.started&&!Q.over&&Ny(Q.season)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&document.getElementById(`modal`)?.hidden&&(Yv&&!Yv.hidden?Fy():Zv?.dataset.state===`open`&&Iy(!1))});var zy=null;{let e={state:()=>Q,dev:()=>Lv,setDev:e=>{Lv=e,Ov(Lv),vy()},events:a,liveEvents:oy,todayEvents:cy,countdown:dy,advanceDay:()=>{Q.over||Sy(nn(Q,ty(),sy(ty()),Iv,Date.now()))},setStat:(e,t)=>{Q[e]=Math.max(0,Math.min(100,t)),e===`health`&&t>0&&(Q.dying=null),qt(Q),by(),vy()},triggerPest:()=>{$t(Q,ty()),by(),vy(),ov(`觸發咗蟲害。`)},reset:()=>{y_(),Q=Rt(ey()),Uv=``,lv(),Fy(),Iy(!1),by(),vy(),My()},realDate:()=>{Q.virtualToday=null,Cy()},setPreview:e=>{Lv={...Lv,preview:e},Ov(Lv),vy()},setSway:e=>{Lv={...Lv,sway:e},Ov(Lv),vy()},triggerGlare:()=>qv?.triggerGlare(),spawnAnimal:e=>qv?.spawnAnimal(e),rotateAnimals:()=>qv?.rotateAnimals(),unlockAll:()=>{for(let e of ht)Q.animals.includes(e.id)||Q.animals.push(e.id);by(),vy(),ov(`解鎖咗全部 ${ht.length} 種動物。`)},ecoInfo:()=>(qv?.animalInfo()??[]).map(e=>({id:e.id,name:_v(e.id),count:e.count,resident:e.resident})),ecoCaps:()=>qv?.animalCaps()??null,followAnimal:e=>qv?.followAnimal(e),viewInfo:()=>qv?{...qv.cameraInfo(),...qv.fenceInfo()}:null,habitatInfo:()=>{let e=gy(),t=e.islandStage??e.stage,n=xg(e.species),r=Cg(e.species,t).map(e=>vg[e]);return`島嶼：${ot[t]}島（半徑 ${Sg(t)}）・${n.name}${r.length?`：${r.join(`、`)}`:`：淨係庭園`}`},sway:()=>hy(ly())};window.__tree={viewInfo:e.viewInfo,zoomBy:(e,t,n)=>qv?.zoomBy(e,t,n),resetView:()=>qv?.resetView(),viewState:()=>qv?.viewState(),flyers:()=>qv?.flyerHeights()??[],animalScreen:e=>qv?.animalScreen(e)??null},Mv(()=>import(`./panel-CK51KZiH.js`).then(t=>{let n=document.getElementById(`dev-root`);n&&(zy=t.mountDevPanel(n,e)),vy()}),[],import.meta.url)}var By=0,Vy=``,Hy=localStorage.getItem(`sekai-tree-zoom-hint`)===`1`;function Uy(){if(!qv)return;if(!Hy&&Q.started&&!Q.over&&document.getElementById(`modal`)?.hidden){Hy=!0,localStorage.setItem(`sekai-tree-zoom-hint`,`1`);let e=document.getElementById(`zoom-hint`);e&&(e.hidden=!1,window.setTimeout(()=>e.hidden=!0,9e3))}let e=qv.viewState(),t=`${e.active}|${e.following??``}`;if(t===Vy)return;Vy=t;let n=document.getElementById(`view-reset`);n&&(n.hidden=!e.active,n.innerHTML=`${et.locate}<span>${e.following?`跟緊${z(e.following)}・返回全景`:`返回全景`}</span>`),e.active&&document.getElementById(`zoom-hint`)?.setAttribute(`hidden`,``)}function Wy(e){let t=gy();yy(t,e),Uy(),e-By>15e3&&(By=e,k_(_y(t)),Q.dying&&!Q.over&&Date.now()-Q.dying.at>864e5&&vy()),document.hidden||requestAnimationFrame(Wy)}document.addEventListener(`visibilitychange`,()=>{if(document.hidden)return;requestAnimationFrame(Wy),Cy();let e=Date.now()-$.fetchedAt;!Dy&&($.origin!==`live`||e>18e5)&&Ay()});var Gy=()=>{qv?.resize(),Jv?.resize()};window.addEventListener(`resize`,Gy),Gy(),Ly(),Cy(),Q.started||My(),requestAnimationFrame(Wy),$.origin===`live`&&!Bv?(wy($),ky(Math.max(5e3,we-(Date.now()-$.fetchedAt)))):Ay(!zv&&$.source!==`geo`);export{ot as a,ct as i,ht as n,z as o,_t as r,i as s,U_ as t};