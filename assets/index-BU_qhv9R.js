(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[40,80],t=[60,100],n={good:5,bad:-10},r={good:5,mid:0,bad:-10},i={clear:{id:`clear`,label:`晴天／多雲`,damage:0,dW:-15,dR:0,growth:1,severe:!1,tip:`日常澆水、施肥。`},drizzle:{id:`drizzle`,label:`毛毛雨`,damage:0,dW:20,dR:0,growth:1.15,severe:!1,tip:`暫停澆水，節省操作。`},hot:{id:`hot`,label:`酷熱`,damage:10,dW:-40,dR:0,growth:.9,severe:!0,tip:`需頻繁澆水防乾旱。`},rainstorm:{id:`rainstorm`,label:`暴雨`,damage:20,dW:60,dR:0,growth:.9,severe:!0,tip:`視情況疏水，輕度加固。`},blackrain:{id:`blackrain`,label:`黑雨`,damage:20,dW:60,dR:0,growth:.85,severe:!0,tip:`預早疏水，輕度加固。`},typhoon1:{id:`typhoon1`,label:`初級颱風`,damage:30,dW:0,dR:-40,growth:.8,severe:!0,tip:`一號／三號風球：提早加固。`},thunder:{id:`thunder`,label:`狂風雷暴`,damage:35,dW:0,dR:-30,growth:.8,severe:!0,tip:`需提前加固樹幹。`},typhoon8:{id:`typhoon8`,label:`高級颱風`,damage:60,dW:0,dR:-80,growth:.6,severe:!0,tip:`八號或以上：終極考驗，需推高 R 值。`}},a=[`clear`,`drizzle`,`hot`,`rainstorm`,`blackrain`,`typhoon1`,`thunder`,`typhoon8`],o=1.3,s=[{min:80,mult:1.5,label:`爆發生長`},{min:50,mult:1,label:`正常生長`},{min:20,mult:.2,label:`虛弱停滯`},{min:0,mult:-.5,label:`枯萎斷枝`}],c=.35,l=[{id:`s3`,label:`3 個月・速成局`,sub:`目標＝樹種真實紀錄（細葉榕 30、樟樹 50、木棉 60 米），解鎖一級徽章`,days:90,tier:1},{id:`s6`,label:`6 個月・標準局`,sub:`目標＝樹種真實紀錄（水杉 50、銀杏 60、雪松 60 米），解鎖二級徽章`,days:180,tier:2},{id:`s12`,label:`1 年・史詩局`,sub:`目標＝樹種真實紀錄（杏仁桉 100、花旗松 100、紅杉 120 米），解鎖三級徽章`,days:365,tier:3}],u={1:90,2:180,3:365},d={1:{name:`一級徽章・新芽`,perk:`以後每局：每日水分流失減少 10%`},2:{name:`二級徽章・雨林`,perk:`以後每局：暴雨時有 30% 機率將一半水分轉為養分`},3:{name:`三級徽章・星空`,perk:`一面免死金牌（枯死時自動救返一次）＋「星空浮島」地貌`}},f=.9,p={water:{amount:20,perDay:3},drain:{amount:-25,perDay:2},fertilize:{amount:25,perDay:1}},m={stakes:{label:`打木樁`,sub:`撐住樹幹`,amount:15},ropes:{label:`綁防風繩`,sub:`拉住主枝`,amount:12},prune:{label:`修枝防風`,sub:`剪走易斷弱枝`,amount:8}},h={health:70,moisture:60,nutrients:50,resist:10,heightCm:18};function g(e,t){let n=new Intl.DateTimeFormat(`en-CA`,{timeZone:t,year:`numeric`,month:`2-digit`,day:`2-digit`}).formatToParts(e);return`${n.find(e=>e.type===`year`)?.value??`1970`}-${n.find(e=>e.type===`month`)?.value??`01`}-${n.find(e=>e.type===`day`)?.value??`01`}`}function _(e,t){let[n,r,i]=e.split(`-`).map(Number),a=new Date(Date.UTC(n??1970,(r??1)-1,(i??1)+t));return`${a.getUTCFullYear()}-${String(a.getUTCMonth()+1).padStart(2,`0`)}-${String(a.getUTCDate()).padStart(2,`0`)}`}function v(e,t){let[n,r,i]=e.split(`-`).map(Number),[a,o,s]=t.split(`-`).map(Number),c=Date.UTC(n??1970,(r??1)-1,i??1),l=Date.UTC(a??1970,(o??1)-1,s??1);return Math.round((l-c)/864e5)}function y(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(Date.UTC(t??1970,(n??1)-1,r??1)).getUTCDay()}function b(e){let t=e.split(`-`);return`${Number(t[1])}/${Number(t[2])}`}function x(e,t=new Date){let n=new Intl.DateTimeFormat(`en-GB`,{timeZone:e,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`}).formatToParts(t),r=Number(n.find(e=>e.type===`hour`)?.value??0),i=Number(n.find(e=>e.type===`minute`)?.value??0);return r*60+i}function S(e){let t=e.match(/T(\d{2}):(\d{2})/);return t?Number(t[1])*60+Number(t[2]):null}var C=`https://data.weather.gov.hk/weatherAPI/opendata/weather.php`,w={TC1:`一號戒備信號`,TC3:`三號強風信號`,TC8NE:`八號東北烈風或暴風信號`,TC8SE:`八號東南烈風或暴風信號`,TC8NW:`八號西北烈風或暴風信號`,TC8SW:`八號西南烈風或暴風信號`,TC9:`九號烈風或暴風風力增強信號`,TC10:`十號颶風信號`},T={TC1:`一號風球`,TC3:`三號風球`,TC8NE:`八號風球`,TC8SE:`八號風球`,TC8NW:`八號風球`,TC8SW:`八號風球`,TC9:`九號風球`,TC10:`十號風球`};function E(e,t){if(!t||t.actionCode===`CANCEL`)return null;let n=t.code||e,r={group:e,code:n,name:e===`WTCSGNL`?w[n]??t.name??`熱帶氣旋警告信號`:`${t.type??``}${t.name??n}`,issued:t.issueTime??``,standby:!1};if(e===`WTCSGNL`){let e=T[n]??`熱帶氣旋警告`;return n===`TC1`?{...r,short:e,kind:null,standby:!0,tone:`yellow`}:n===`TC3`?{...r,short:e,kind:`gale`,tone:`amber`}:{...r,short:e,kind:`typhoon`,tone:`red`}}return e===`WRAIN`?n===`WRAINA`?{...r,name:`黃色暴雨警告信號`,short:`黃雨`,kind:`heavy-rain`,tone:`amber`}:n===`WRAINR`?{...r,name:`紅色暴雨警告信號`,short:`紅雨`,kind:`heavy-rain`,tone:`red`}:n===`WRAINB`?{...r,name:`黑色暴雨警告信號`,short:`黑雨`,kind:`heavy-rain`,tone:`black`}:{...r,short:`暴雨警告`,kind:`heavy-rain`,tone:`amber`}:e===`WMSGNL`?{...r,short:`強烈季候風`,kind:`gale`,tone:`amber`}:e===`WHOT`?{...r,short:`酷熱`,kind:null,tone:`red`}:e===`WCOLD`?{...r,short:`寒冷`,kind:null,tone:`blue`}:e===`WTS`?{...r,short:`雷暴`,kind:null,tone:`yellow`}:e===`WFIRE`?{...r,short:n===`WFIRER`?`紅色火災`:`黃色火災`,kind:null,tone:n===`WFIRER`?`red`:`yellow`}:e===`WFNTSA`?{...r,short:`新界北水浸`,kind:null,tone:`blue`}:e===`WL`?{...r,short:`山泥傾瀉`,kind:null,tone:`amber`}:e===`WFROST`?{...r,short:`霜凍`,kind:null,tone:`blue`}:e===`WTMW`?{...r,short:`海嘯`,kind:null,tone:`red`}:{...r,short:t.name??n,kind:null,tone:`gray`}}var D={"heavy-rain":1,gale:2,typhoon:3};function O(e){if(!e||typeof e!=`object`)return[];let t=[];for(let[n,r]of Object.entries(e)){let e=E(n,r);e&&t.push(e)}return t.sort((e,t)=>(t.kind?D[t.kind]+10:t.standby?5:0)-(e.kind?D[e.kind]+10:e.standby?5:0))}function k(e){return{50:0,51:1,52:2,53:80,54:80,60:3,61:3,62:61,63:63,64:65,65:95,70:0,71:0,72:0,73:0,74:0,75:0,76:3,77:1,80:2,81:0,82:2,83:45,84:45,85:45,90:0,91:1,92:2,93:2}[e]??2}var A={50:`陽光充沛`,51:`間有陽光`,52:`短暫陽光`,53:`間有陽光 幾陣驟雨`,54:`短暫陽光 有驟雨`,60:`多雲`,61:`密雲`,62:`微雨`,63:`雨`,64:`大雨`,65:`雷暴`,70:`天色良好`,71:`天色良好`,72:`天色良好`,73:`天色良好`,74:`天色良好`,75:`天色良好`,76:`大致多雲`,77:`天色大致良好`,80:`大風`,81:`乾燥`,82:`潮濕`,83:`霧`,84:`薄霧`,85:`煙霞`,90:`熱`,91:`暖`,92:`涼`,93:`冷`};function j(e){return A[e]??``}function ee(e){return typeof e==`number`&&e in A}function M(e){return e===53||e===54||e>=62&&e<=65}var te=[[`香港天文台`,22.302,114.174],[`京士柏`,22.312,114.173],[`黃竹坑`,22.247,114.174],[`打鼓嶺`,22.528,114.157],[`流浮山`,22.469,113.984],[`大埔`,22.446,114.179],[`沙田`,22.402,114.21],[`屯門`,22.386,113.964],[`將軍澳`,22.316,114.256],[`西貢`,22.376,114.275],[`長洲`,22.201,114.027],[`赤鱲角`,22.309,113.922],[`青衣`,22.344,114.11],[`石崗`,22.436,114.085],[`荃灣可觀`,22.384,114.108],[`荃灣城門谷`,22.376,114.121],[`香港公園`,22.278,114.162],[`筲箕灣`,22.281,114.236],[`九龍城`,22.335,114.185],[`跑馬地`,22.27,114.184],[`黃大仙`,22.339,114.205],[`赤柱`,22.214,114.219],[`觀塘`,22.319,114.225],[`深水埗`,22.335,114.137],[`啟德跑道公園`,22.305,114.216],[`元朗公園`,22.441,114.02],[`大美督`,22.475,114.237],[`上水`,22.502,114.111],[`東涌`,22.289,113.941],[`大老山`,22.353,114.209],[`昂坪`,22.259,113.911],[`北潭涌`,22.395,114.321]];function ne(e,t){return te.map(([n,r,i])=>[n,(r-e)**2+((i-t)*Math.cos(e*Math.PI/180))**2]).sort((e,t)=>e[1]-t[1]).map(([e])=>e)}function re(e,t,n){if(!e||typeof e!=`object`)return null;let r=e,i=r.temperature?.data??[],a=null,o=``;for(let e of ne(t,n)){let t=i.find(t=>t.place===e&&typeof t.value==`number`);if(t){a=t.value,o=t.place;break}}a===null&&i[0]&&(a=i[0].value,o=i[0].place);let s={};for(let e of r.rainfall?.data??[])s[e.place]=typeof e.max==`number`?e.max:0;let c=Array.isArray(r.warningMessage)?r.warningMessage:r.warningMessage?[r.warningMessage]:[];return{current:{tempC:a,station:o,humidity:r.humidity?.data?.[0]?.value??null,icon:r.icon?.[0]??null,rainByDistrict:s,updated:r.updateTime??``},messages:c.filter(Boolean)}}function ie(e){if(!e||typeof e!=`object`)return{forecast:[],situation:``};let t=e;return{forecast:(t.weatherForecast??[]).map(e=>({date:`${e.forecastDate.slice(0,4)}-${e.forecastDate.slice(4,6)}-${e.forecastDate.slice(6,8)}`,week:e.week??``,text:e.forecastWeather??``,wind:e.forecastWind??``,tempMax:e.forecastMaxtemp?.value??28,tempMin:e.forecastMintemp?.value??23,icon:e.ForecastIcon??51,psr:e.PSR??`低`})),situation:t.generalSituation??``}}function ae(e){let t=[...e.matchAll(/(\d{1,2})\s*級/g)].map(e=>Number(e[1])),n=t.length?Math.max(...t):2;return[1,3,9,15,24,34,44,56,68,82,96,110,120][Math.min(12,Math.max(0,n))]??12}function oe(e){switch(e){case`高`:return{mm:18,prob:85};case`中高`:return{mm:10,prob:65};case`中`:return{mm:5,prob:45};case`中低`:return{mm:1.5,prob:25};default:return{mm:0,prob:10}}}async function se(e,t){let n=await fetch(`${C}?dataType=${e}&lang=tc`,{signal:ce(t)});if(!n.ok)throw Error(`天文台回應 ${n.status}`);return n.json()}function ce(e){if(typeof AbortSignal<`u`&&`timeout`in AbortSignal)return AbortSignal.timeout(e);if(typeof AbortController>`u`)return;let t=new AbortController;return setTimeout(()=>t.abort(),e),t.signal}async function le(e,t,n=8e3){let[r,i,a]=await Promise.allSettled([se(`warnsum`,n),se(`rhrread`,n),se(`fnd`,n)]);if(r.status===`rejected`&&i.status===`rejected`&&a.status===`rejected`)throw Error(`天文台資料暫時攞唔到`);let o=i.status===`fulfilled`?re(i.value,e,t):null,s=a.status===`fulfilled`?ie(a.value):{forecast:[],situation:``};return{fetchedAt:Date.now(),warnings:r.status===`fulfilled`?O(r.value):[],messages:o?.messages??[],current:o?.current??null,forecast:s.forecast,situation:s.situation}}var ue=e=>Math.max(0,Math.min(100,e)),de=e=>Math.round(e*10)/10;function fe(e,t){return e>=t[0]&&e<=t[1]}function pe(t){return fe(t,e)?n.good:n.bad}function me(e){return e>=t[0]?r.good:e<30?r.bad:r.mid}function he(e,t){return de(e*(1-ue(t)/100))}function ge(e){let t=`clear`;for(let n of e){let e=i[n],r=i[t];e&&(e.damage>r.damage||e.damage===r.damage&&a.indexOf(n)>a.indexOf(t))&&(t=n)}return t}function _e(e){return s.find(t=>e>=t.min)??s[s.length-1]}function ve(e){return _e(e).mult}function ye(e){return l.find(t=>t.id===e)??l[0]}function be(e,t){return t/e.days}function xe(e,t,n){return de(t>=0?e*t*n:e*t)}function Se(e){return de(c*(Math.max(0,e)/100)**1.5)}function Ce(e,t,n){let r=n?e:t;return[1,2,3].filter(t=>u[t]<=r&&u[t]<=e)}function we(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0)%1e4/1e4}var N=22.3022,Te=114.1744,Ee=18e5;function De(e,t){return e>=22.13&&e<=22.58&&t>=113.82&&t<=114.45}function P(e,t){return e>=21.8&&e<=22.9&&t>=113.3&&t<=114.7}function Oe(e){return e>=51&&e<=67||e>=80&&e<=82||e>=95&&e<=99}function F(e){return e>=71&&e<=77}function I(e){return e===0?`天晴`:e===1?`大致天晴`:e===2?`間有陽光`:e===3?`陰天`:e===45||e===48?`有霧`:e>=51&&e<=55?`微雨`:e===61||e===80?`小雨`:e===63||e===81?`中雨`:e===65||e===82?`大雨`:F(e)?`落雪`:e>=95?`雷暴`:Oe(e)?`有雨`:`多雲`}function ke(e){return e.hkoIcon===void 0?I(e.code):j(e.hkoIcon)||I(e.code)}function Ae(e,t,n){if(!t)return e;let r=new Map(t.forecast.map(e=>[e.date,e.icon])),i=t.current?.icon;return e.map(e=>{let t=e.date===n&&ee(i)?i:r.get(e.date);return ee(t)?{...e,hkoIcon:t,code:k(t)}:e})}function je(e){let t=e.gustKmh>=118||e.windKmh>=63,n=!t&&(e.gustKmh>=62||e.windKmh>=41),r=e.precipMm>=25,i=e.tempMax>=33,a=null;return t?a=`typhoon`:n?a=`gale`:r&&(a=`heavy-rain`),{heavyRain:r,gale:n,typhoon:t,heat:i,stormKind:a}}function Me(e,t=e.tempMax){let n=je({precipMm:e.precipMm,gustKmh:e.gustKmh,windKmh:e.windKmh,tempMax:e.tempMax}),r=e.hkoIcon===void 0?e.precipMm>=.5||Oe(e.code)||F(e.code):M(e.hkoIcon);return{code:e.code,tempC:t,tempMax:e.tempMax,precipMm:e.precipMm,windKmh:e.windKmh,gustKmh:e.gustKmh,hot:n.heat||t>=33,raining:r,stormKind:n.stormKind}}function Ne(e){return{date:e,code:2,tempMax:28,tempMin:23,precipMm:0,precipProb:10,windKmh:12,gustKmh:20,sunrise:`${e}T06:10`,sunset:`${e}T18:25`}}function Pe(e){return Array.from({length:7},(t,n)=>Ne(_(e,n)))}function Fe(e,t){return{lat:N,lon:Te,timezone:`Asia/Hong_Kong`,place:`香港`,source:`fallback`,origin:`offline`,fetchedAt:0,current:{tempC:26,humidity:70,precipMm:0,code:2,windKmh:12,gustKmh:20,isDay:!0,time:``},daily:Pe(e),error:t,provider:`sim`}}function Ie(e,t){let n=new Map(e.map(e=>[e.date,e]));for(let e=0;e<7;e++){let r=_(t,e);n.has(r)||n.set(r,Ne(r))}return[...n.values()].filter(e=>e.date>=t&&e.date<=_(t,6)).sort((e,t)=>e.date.localeCompare(t.date))}function Le(e,t=0){return typeof e==`number`&&Number.isFinite(e)?e:t}function Re(e,t){let n=e?.time??[];if(!n.length)return null;let r=t.slice(0,13),i=n.findIndex(e=>e.slice(0,13)===r);i<0&&(i=0);for(let t=0;t<6&&i+t<n.length;t++){let n=Le(e?.precipitation?.[i+t],0),r=Le(e?.weather_code?.[i+t],0);if(n>=.3||Oe(r)&&r>=61)return t}return null}function ze(e){if(!e||typeof e!=`object`)throw Error(`天氣資料格式不對`);let t=e,n=t.daily,r=n?.time??[];if(!r.length)throw Error(`沒有預報`);let i=r.map((e,t)=>({date:e,code:Le(n?.weather_code?.[t],2),tempMax:Le(n?.temperature_2m_max?.[t],28),tempMin:Le(n?.temperature_2m_min?.[t],23),precipMm:Le(n?.precipitation_sum?.[t],0),precipProb:Le(n?.precipitation_probability_max?.[t],0),windKmh:Le(n?.wind_speed_10m_max?.[t],10),gustKmh:Le(n?.wind_gusts_10m_max?.[t],16),sunrise:n?.sunrise?.[t]||`${e}T06:10`,sunset:n?.sunset?.[t]||`${e}T18:25`})),a=t.current??{};return{timezone:t.timezone||`Asia/Hong_Kong`,current:{tempC:Le(a.temperature_2m,i[0]?.tempMax??26),humidity:Le(a.relative_humidity_2m,70),precipMm:Le(a.precipitation,0),code:Le(a.weather_code,i[0]?.code??2),windKmh:Le(a.wind_speed_10m,i[0]?.windKmh??10),gustKmh:Le(a.wind_gusts_10m,i[0]?.gustKmh??16),isDay:a.is_day!==0,time:a.time??``},daily:i,rainInHours:Re(t.hourly,a.time??``),hourly:(t.hourly?.time??[]).map((e,n)=>({time:e,precipMm:Le(t.hourly?.precipitation?.[n],0),code:Le(t.hourly?.weather_code?.[n],0),gustKmh:Le(t.hourly?.wind_gusts_10m?.[n],0)}))}}function Be(e,t){let n=new URL(`https://api.open-meteo.com/v1/forecast`);return n.searchParams.set(`latitude`,e.toFixed(4)),n.searchParams.set(`longitude`,t.toFixed(4)),n.searchParams.set(`current`,`temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day`),n.searchParams.set(`hourly`,`precipitation,weather_code,wind_gusts_10m`),n.searchParams.set(`daily`,`weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset`),n.searchParams.set(`timezone`,`auto`),n.searchParams.set(`forecast_days`,`7`),n.searchParams.set(`forecast_hours`,`12`),n.searchParams.set(`wind_speed_unit`,`kmh`),n.toString()}var Ve=e=>new Promise(t=>setTimeout(t,e));async function He(e,t,n={}){let r=Be(e,t),i=n.tries??3,a=`天氣服務冇回應`,o=0;for(let e=0;e<i;e++){e>0&&await Ve(o||1e3*3**(e-1)),o=0;let t;try{t=await fetch(r,{signal:ce(n.timeoutMs??8e3)})}catch{a=`連唔到天氣服務`;continue}if(t.ok)return ze(await t.json());a=t.status===429?`天氣服務暫時太繁忙（429）`:`天氣服務回應 ${t.status}`;let i=Number(t.headers.get(`retry-after`));if(Number.isFinite(i)&&i>0&&(o=Math.min(8e3,i*1e3)),t.status!==429&&t.status<500)break}throw Error(a)}function Ue(e,t){if(!e.current&&!e.forecast.length)return null;let n=e.current?.tempC??e.forecast[0]?.tempMax??28,r=e.current?.icon?k(e.current.icon):2,i=[],a=e.forecast[0];(!a||a.date>t)&&i.push({date:t,code:r,hkoIcon:ee(e.current?.icon)?e.current.icon:void 0,tempMax:Math.max(n,a?a.tempMax-1:n),tempMin:Math.min(n,a?a.tempMin:n-4),precipMm:0,precipProb:10,windKmh:12,gustKmh:20,sunrise:`${t}T06:10`,sunset:`${t}T18:25`});for(let n of e.forecast){if(n.date<t)continue;let e=oe(n.psr),r=ae(n.wind);i.push({date:n.date,code:k(n.icon),hkoIcon:ee(n.icon)?n.icon:void 0,tempMax:n.tempMax,tempMin:n.tempMin,precipMm:e.mm,precipProb:e.prob,windKmh:r,gustKmh:Math.round(r*1.5),sunrise:`${n.date}T06:10`,sunset:`${n.date}T18:25`})}let o=e.current?Math.max(0,...Object.values(e.current.rainByDistrict)):0;return{timezone:`Asia/Hong_Kong`,current:{tempC:n,humidity:e.current?.humidity??70,precipMm:o>0?Math.min(8,o):0,code:r,windKmh:12,gustKmh:20,isDay:!0,time:e.current?.updated??``},daily:i.slice(0,7),rainInHours:null}}function We(e,t){let n=e?.current?.rainByDistrict;if(!n||!t)return null;let r=t.replace(/區$/,``);for(let e of[t,r,`${r}區`])if(e in n)return n[e]??0;return null}function Ge(e=8e3){let t={lat:N,lon:Te,source:`fallback`};if(typeof navigator>`u`||!navigator.geolocation)return Promise.resolve(t);let n=()=>new Promise(n=>{let r=setTimeout(()=>n(t),e);navigator.geolocation.getCurrentPosition(e=>{clearTimeout(r),n({lat:e.coords.latitude,lon:e.coords.longitude,source:`geo`})},()=>{clearTimeout(r),n(t)},{enableHighAccuracy:!1,timeout:e-500,maximumAge:18e5})}),r=navigator.permissions;return r?.query?r.query({name:`geolocation`}).then(e=>e.state===`denied`?t:n()).catch(()=>n()):n()}function Ke(e){let t=new Set;for(let n of e??[])n.group===`WHOT`?t.add(`hot`):n.group===`WRAIN`?t.add(n.code===`WRAINB`?`blackrain`:`rainstorm`):n.group===`WTS`||n.group===`WMSGNL`?t.add(`thunder`):n.group===`WTCSGNL`&&t.add(/^TC(1|3)$/.test(n.code)?`typhoon1`:`typhoon8`);return[...t]}function qe(e){return e.gustKmh>=118||e.windKmh>=63?`typhoon8`:e.gustKmh>=88||e.windKmh>=50?`typhoon1`:e.code>=95||e.gustKmh>=62?`thunder`:e.precipMm>=70?`blackrain`:e.precipMm>=25?`rainstorm`:e.tempMax>=33?`hot`:e.precipMm>=.5||Oe(e.code)?`drizzle`:`clear`}function Je(e){if(e.hkoIcon===void 0)return qe(e);let t=qe({...e,precipMm:0,code:0,tempMax:0});return t===`clear`?e.hkoIcon===65?`thunder`:e.hkoIcon===64&&e.precipMm>=25?`rainstorm`:e.tempMax>=33?`hot`:M(e.hkoIcon)?`drizzle`:`clear`:t}function Ye(e){return e?e.hkoIcon===void 0?e.precipMm>=.5||Oe(e.code)?`drizzle`:`clear`:M(e.hkoIcon)?`drizzle`:`clear`:`clear`}function Xe(e){let t=new Set;if(e.hk&&e.warnings){for(let n of Ke(e.warnings))t.add(n);(e.current.precipMm>=.2||Oe(e.current.code))&&t.add(`drizzle`)}else{let n=e.current,r=qe({code:n.code,precipMm:n.precipMm*6,gustKmh:n.gustKmh,windKmh:n.windKmh,tempMax:Math.max(n.tempC,e.today?.tempMax??0)});t.add(r),e.today&&t.add(Je(e.today))}return[...t].filter(e=>e!==`clear`)}function Ze(e){return e.gustKmh>=118?`typhoon8`:e.gustKmh>=88?`typhoon1`:e.code>=95||e.gustKmh>=62?`thunder`:e.precipMm>=30?`blackrain`:e.precipMm>=10?`rainstorm`:null}function Qe(e){let t=ge(e.nowEvents.filter(e=>i[e].severe));if(t!==`clear`)return{event:t,hours:0,active:!0,source:e.activeSource};let n=[];if(e.manual){let t=Math.max(0,(e.manual.at-e.nowMs)/36e5);t<=12&&n.push({event:e.manual.event,hours:t,active:t===0,source:`手動預報`})}let r=e.nowIso.slice(0,13),a=e.hourly??[],o=a.findIndex(e=>e.time.slice(0,13)===r);o<0&&(o=0);for(let e=0;e<=12&&o+e<a.length;e++){let t=Ze(a[o+e]);if(t){n.push({event:t,hours:e,active:!1,source:`逐小時預報`});break}}if(e.tomorrow&&e.minutesToMidnight<=720){let t=Je(e.tomorrow);i[t].severe&&n.push({event:t,hours:e.minutesToMidnight/60,active:!1,source:`明日預報`})}return n.length?(n.sort((e,t)=>e.hours-t.hours||i[t.event].damage-i[e.event].damage),n[0]):null}function $e(e,t){let n={...e};switch(t){case`hot`:n.hot=!0,n.tempMax=Math.max(n.tempMax,34),n.tempC=Math.max(n.tempC,33);break;case`drizzle`:n.raining=!0,n.precipMm=Math.max(n.precipMm,2),n.code<51&&(n.code=61);break;case`rainstorm`:case`blackrain`:n.raining=!0,n.precipMm=Math.max(n.precipMm,t===`blackrain`?80:40),n.code=65,n.stormKind=`heavy-rain`;break;case`thunder`:n.raining=!0,n.code=95,n.windKmh=Math.max(n.windKmh,45),n.gustKmh=Math.max(n.gustKmh,75),n.stormKind=`gale`;break;case`typhoon1`:n.windKmh=Math.max(n.windKmh,50),n.gustKmh=Math.max(n.gustKmh,85),n.stormKind=`gale`,n.code<3&&(n.code=3);break;case`typhoon8`:n.raining=!0,n.code=95,n.precipMm=Math.max(n.precipMm,60),n.windKmh=Math.max(n.windKmh,90),n.gustKmh=Math.max(n.gustKmh,140),n.stormKind=`typhoon`;break;default:n.raining=!1,n.hot=!1,n.precipMm=0,n.stormKind=null,n.code>3&&(n.code=2)}return n}var et=(e,t=`0 0 24 24`)=>`<svg viewBox="${t}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`,tt={drop:et(`<path d="M12 3.2c3.4 4.1 6 7.3 6 10.6a6 6 0 0 1-12 0c0-3.3 2.6-6.5 6-10.6z" fill="currentColor" fill-opacity=".18"/><path d="M9.2 14.6a3 3 0 0 0 2.6 2.6"/>`),leaf:et(`<path d="M5 19c0-8 5.5-13.5 14-14-.3 8.6-5.8 14-14 14z" fill="currentColor" fill-opacity=".18"/><path d="M5 19c3.5-3.8 6.5-6.6 10-9"/>`),sprout:et(`<path d="M12 20v-8"/><path d="M12 12c0-3.6-2.6-6-6.5-6 0 3.7 2.6 6 6.5 6z" fill="currentColor" fill-opacity=".18"/><path d="M12 13.5c0-3.2 2.4-5.4 6-5.4 0 3.3-2.4 5.4-6 5.4z" fill="currentColor" fill-opacity=".18"/><path d="M7 20h10"/>`),shield:et(`<path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6z" fill="currentColor" fill-opacity=".18"/><path d="M9 12l2.2 2.2L15.5 10"/>`),hammer:et(`<path d="M13.5 6.5l4 4"/><path d="M11 9l-7 7 3 3 7-7"/><path d="M12.5 4.5l3-1.5 5.5 5.5-1.5 3z" fill="currentColor" fill-opacity=".18"/>`),book:et(`<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" fill="currentColor" fill-opacity=".15"/><path d="M12 6v13.5"/>`),pin:et(`<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="10.5" r="2.2"/>`),gear:et(`<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>`),chevronDown:et(`<path d="M6 9l6 6 6-6"/>`),chevronRight:et(`<path d="M9 6l6 6-6 6"/>`),close:et(`<path d="M6 6l12 12M18 6L6 18"/>`),bug:et(`<ellipse cx="12" cy="14" rx="4.5" ry="5.5" fill="currentColor" fill-opacity=".18"/><path d="M12 8.5V19.5M9 5l1.5 2.5M15 5l-1.5 2.5M4 12h3.5M16.5 12H20M5 17.5l3-1.5M19 17.5l-3-1.5"/>`),scissors:et(`<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.8L18 4M15.7 15.8L6 4"/>`),bird:et(`<path d="M4 14c2.5 0 4-1 5.5-3.5C11 8 13 6.5 16 6.5c1.8 0 3 1 3.5 2.5L22 10l-2.5 1c-.5 4-3.5 7-8 7-3 0-5.5-1.5-7.5-4z" fill="currentColor" fill-opacity=".18"/><circle cx="16.5" cy="9" r=".6" fill="currentColor"/><path d="M9 18l-1 3M12 18l.5 3"/>`),arrowUp:et(`<path d="M12 20V5M6 11l6-6 6 6"/>`),sparkle:et(`<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" fill-opacity=".2"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>`),heart:et(`<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor" fill-opacity=".2"/>`),ruler:et(`<path d="M12 3v18M8.5 6h3.5M9.5 9h2.5M8.5 12h3.5M9.5 15h2.5M8.5 18h3.5"/>`),canopy:et(`<path d="M12 21v-6"/><path d="M6.5 15a4 4 0 0 1-.8-7.9A5 5 0 0 1 15 5.3a4.2 4.2 0 0 1 3.4 8.3c-.7.9-1.7 1.4-2.9 1.4z" fill="currentColor" fill-opacity=".18"/>`),roots:et(`<path d="M12 3v9M12 12c-1.5 3-4 4-6.5 4.5M12 12c1.5 3 4 4 6.5 4.5M12 12v8M9 18l-2 3M15 18l2 3"/>`),flag:et(`<path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="currentColor" fill-opacity=".15"/>`),calendar:et(`<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>`),warn:et(`<path d="M12 3.5L2.5 20h19z" fill="currentColor" fill-opacity=".15"/><path d="M12 10v4.5M12 17.2v.3"/>`),wind:et(`<path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/>`),moonSmall:et(`<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor" fill-opacity=".2"/>`),locate:et(`<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>`),drain:et(`<path d="M12 3.5c2.8 3.4 5 6 5 8.8a5 5 0 0 1-10 0c0-2.8 2.2-5.4 5-8.8z" fill="currentColor" fill-opacity=".18"/><path d="M4 19.5h16M8 16.5l-1.5 3M16 16.5l1.5 3"/>`),wrench:et(`<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l1.1 1.1-2.2 2.2-1.1-1.1-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6-1.1-1.1 2.2-2.2z" fill="currentColor" fill-opacity=".18"/>`),more:et(`<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>`)};function nt(e,t,n,r){let i=(e=`#ffc94a`)=>`<g><circle cx="19" cy="17" r="8" fill="${e}"/><g stroke="${e}" stroke-width="2.4" stroke-linecap="round"><path d="M19 3.5v3M19 27.5v3M5.5 17h3M29.5 17h3M9.5 7.5l2 2M26.5 24.5l2 2M28.5 7.5l-2 2M9.5 26.5l2-2"/></g></g>`,a=`<path d="M30 20a11 11 0 0 1-14-14 11 11 0 1 0 14 14z" fill="#ffe7a3" stroke="#f1c75b" stroke-width="1.5"/>`,o=t?a:i(),s=(e,t=0,n=0)=>`<path transform="translate(${t} ${n})" d="M14 38h22a8 8 0 0 0 .8-16 10 10 0 0 0-19.3 2.2A7 7 0 0 0 14 38z" fill="${e}" stroke="rgba(90,110,130,.25)" stroke-width="1"/>`,c=`<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`,l=`<g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M21 41l-1.5 4M29 41l-1.5 4"/></g>`,u=`<g stroke="#b7c3cc" stroke-width="2.4" stroke-linecap="round"><path d="M10 42h28M14 47h22"/></g>`,d=(e,t)=>`<g transform="translate(33 18)"><rect x="-3" y="0" width="6" height="22" rx="3" fill="#fff" stroke="#8a97a6" stroke-width="1.2"/><rect x="-1.4" y="${20-t}" width="2.8" height="${t}" rx="1.4" fill="${e}"/><circle cx="0" cy="24" r="5" fill="${e}" stroke="#8a97a6" stroke-width="1.2"/></g>`,f=null;if(r!==void 0&&!n){let e=(e,t,n=.8)=>`<g transform="translate(${e} ${t}) scale(${n})">${o}</g>`;switch(r){case 50:f=`<g transform="translate(6 6) scale(1.1)">${o}</g>`;break;case 51:f=o+s(`#ffffff`,4,2);break;case 52:f=e(8,0)+s(`#eef2f6`,-2,0);break;case 53:f=o+s(`#ffffff`,4,-2)+l;break;case 54:f=e(8,-2)+s(`#e3e9ef`,-2,-3)+c;break;case 60:f=s(`#e5ebf0`,-4,-6)+s(`#f7fafc`,2,0);break;case 61:f=s(`#aeb8c4`,-4,-6)+s(`#c9d1da`,2,0);break;case 62:f=s(`#dfe6ec`,0,-2)+l;break;case 63:f=s(`#c9d2dc`,0,-2)+c;break;case 64:f=s(`#9aa6b4`,0,-3)+`<g stroke="#2f7fc4" stroke-width="2.6" stroke-linecap="round"><path d="M15 41l-2.5 6M21 41l-2.5 6M27 41l-2.5 6M33 41l-2.5 6"/></g>`;break;case 65:f=s(`#8f9aa8`,0,-2)+`<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/><g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`;break;case 70:case 71:case 72:case 73:case 74:case 75:f=`<g transform="translate(6 6) scale(1.1)">${a}</g>`;break;case 76:f=`<g transform="translate(8 0) scale(.8)">${a}</g>`+s(`#e5ebf0`,-2,0);break;case 77:f=a+s(`#ffffff`,4,2);break;case 80:f=`<g stroke="#7fa7c9" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M6 20h24a5 5 0 1 0-5-5M6 29h32a5 5 0 1 1-5 5M6 38h16"/></g>`;break;case 81:f=`<g transform="translate(-2 0)">${i(`#ffb347`)}</g><g stroke="#d9a15b" stroke-width="2.2" stroke-linecap="round"><path d="M8 40l6-3 5 4 6-4 5 4 6-3"/></g>`;break;case 82:f=`<path d="M25 8c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20z" fill="#bfe0f6" stroke="#4ea3e0" stroke-width="1.6"/><path d="M20 30a5 5 0 0 0 4.5 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;break;case 83:case 84:f=s(`#e7edf1`,0,-4)+u;break;case 85:f=`<g opacity=".55">${i(`#e0b25a`)}</g><g stroke="#c9b48f" stroke-width="2.4" stroke-linecap="round"><path d="M6 34h30M10 40h32M6 46h26"/></g>`;break;case 90:f=`<g transform="translate(-4 2)">${t?a:i(`#ff9f2e`)}</g>`+d(`#ef5b3c`,17);break;case 91:f=`<g transform="translate(-4 2)">${o}</g>`+d(`#f39a3d`,12);break;case 92:f=s(`#eef2f6`,-6,0)+d(`#5aa9e6`,8);break;case 93:f=`<g stroke="#6fb3e8" stroke-width="2.2" stroke-linecap="round"><path d="M16 10v24M6 22h20M9 15l14 14M23 15L9 29"/></g>`+d(`#3a7fc9`,4)}}return f===null&&(f=n||e>=95?s(`#8f9aa8`,0,-2)+`<path d="M26 36l-5 8h4l-2 7 7-10h-4l3-5z" fill="#ffcf3f" stroke="#e5a600" stroke-width=".8"/><g stroke="#4ea3e0" stroke-width="2.4" stroke-linecap="round"><path d="M18 41l-2 5M25 41l-2 5M32 41l-2 5"/></g>`:e>=51?s(`#d8e0e8`,0,-2)+c:e===45||e===48?s(`#e7edf1`,0,-4)+u:e===3?s(`#e5ebf0`,-4,-6)+s(`#f7fafc`,2,0):e===0?`<g transform="translate(6 6) scale(1.1)">${o}</g>`:o+s(`#ffffff`,4,2)),`<svg viewBox="0 0 50 52" aria-hidden="true">${f}</svg>`}function L(e,t,n){return Math.min(n,Math.max(t,e))}function rt(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function it(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function at(e){return e<100?`${Math.round(e)} 厘米`:`${(e/100).toFixed(1)} 米`}function ot(e,t){if(t<=0)return`0`;let n=e/t*100;return n<.1?`不足 0.1`:n<10?n.toFixed(1):Math.round(n).toString()}function R(e){return e.replace(/[&<>"']/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`"`:return`&quot;`;default:return`&#39;`}})}var st=[`幼苗`,`小樹`,`青年樹`,`成年樹`,`巨樹`],ct=[0,.025,.1,.4,.85],lt=[{id:`camphor`,season:`s3`,name:`樟樹`,english:`Camphor tree`,scientific:`Camphora officinarum（Cinnamomum camphora）`,typicalM:`20–30`,maxM:46.4,targetM:50,record:`台灣南投神木村「樟樹公」2018 年攀樹拉尺實測 46.4 米，世界最高嘅樟樹`,source:{label:`MonumentalTrees／Taiwan News`,url:`https://www.monumentaltrees.com/en/trees/cinnamomumcamphora/records/`},form:`round`,blurb:`香港郊野同公園常見，樹冠又闊又密，葉有樟腦香。`,stages:[`兩片圓葉加一個嫩芽`,`幼幹分出幾枝，樹冠細細個`,`樹冠開始變圓，春天有紅銅色嫩葉`,`闊大濃密嘅圓頂樹冠，開細白花`,`粗壯灰褐樹幹、板根，樹冠比樹身仲闊`]},{id:`cotton`,season:`s3`,name:`木棉`,english:`Red silk-cotton tree`,scientific:`Bombax ceiba`,typicalM:`約 20`,maxM:60,targetM:60,record:`一般約 20 米；濕熱地區老樹可達 60 米（有記載嘅最高高度）`,source:{label:`Wikipedia`,url:`https://en.wikipedia.org/wiki/Bombax_ceiba`},form:`tiered`,blurb:`「英雄樹」，樹幹筆直，枝條一層層平伸，春天未出葉先開大紅花。`,stages:[`掌狀嫩葉，莖上有細刺`,`筆直幼幹，幹上一粒粒圓錐刺`,`枝條分層平伸，好似塔咁`,`層層橫枝開滿大紅花`,`高大筆直嘅灰幹，紅花之外仲有棉絮爆出`]},{id:`banyan`,season:`s3`,name:`細葉榕`,english:`Chinese banyan`,scientific:`Ficus microcarpa`,typicalM:`20–25`,maxM:30,targetM:30,record:`最高可達 30 米（新加坡國家公園局植物誌、Flora Malesiana）`,source:{label:`NParks Flora & Fauna Web`,url:`https://www.nparks.gov.sg/florafaunaweb/flora/2/9/2912`},form:`banyan`,blurb:`香港村口、廟前最常見嘅大樹，枝上垂落氣根，落地變成支柱根。`,stages:[`幾塊細細嘅深綠葉`,`樹幹開始扭曲，枝條向外伸`,`樹冠又闊又密，開始有氣根垂落`,`一簾簾氣根，樹冠闊過樹高`,`多條氣根落地成柱，好似一片細樹林，結滿細榕果`]},{id:`metasequoia`,season:`s6`,name:`水杉`,english:`Dawn redwood`,scientific:`Metasequoia glyptostroboides`,typicalM:`30–45`,maxM:51,targetM:50,record:`2000 年代全面普查湖北野生水杉，最高 51 米（栽培紀錄：美國長木花園 41.45 米）`,source:{label:`Wikipedia／MonumentalTrees`,url:`https://en.wikipedia.org/wiki/Metasequoia_glyptostroboides`},form:`narrowCone`,blurb:`「活化石」，1940 年代先喺湖北重新發現。落葉針葉樹，樹形窄長如塔。`,stages:[`一撮羽毛似嘅軟針葉`,`幼幹筆直，細枝對生`,`窄長圓錐形，葉色嫩綠`,`高聳尖塔，樹幹紅褐有溝紋`,`基部板根，葉轉銅紅色，好似秋天`]},{id:`ginkgo`,season:`s6`,name:`銀杏`,english:`Ginkgo`,scientific:`Ginkgo biloba`,typicalM:`20–40`,maxM:60,targetM:60,record:`甘肅大堡一棵高 60 米（湖南張家界 70 米嘅報告未經證實）`,source:{label:`conifers.org／Journal of Ecology (2022)`,url:`https://www.conifers.org/gi/Ginkgoaceae.php`},form:`fan`,blurb:`兩億幾年前已經存在嘅物種，扇形葉，秋天變金黃。`,stages:[`兩三塊扇形小葉`,`瘦長樹幹，枝條疏疏落落`,`枝條 45 度向上，樹冠開始成形`,`寬卵形樹冠，扇葉開始轉金`,`滿樹金黃，樹下鋪滿落葉`]},{id:`deodar`,season:`s6`,name:`雪松`,english:`Deodar cedar`,scientific:`Cedrus deodara`,typicalM:`40–50`,maxM:60,targetM:60,record:`喜馬拉雅原生地一般 40–50 米，個別達 60 米`,source:{label:`Wikipedia／Trees and Shrubs Online`,url:`https://en.wikipedia.org/wiki/Cedrus_deodara`},form:`drooping`,blurb:`喜馬拉雅山嘅「神木」，一層層水平枝，枝尖下垂，樹頂微微彎低。`,stages:[`一小撮藍綠針葉`,`樹頂彎彎，細枝開始分層`,`寬闊金字塔形，枝層分明`,`大片水平枝層，枝尖下垂，掛住直立球果`,`巨大寶塔形，深色樹幹，枝層似雲`]},{id:`redwood`,season:`s12`,name:`北美紅杉`,english:`Coast redwood`,scientific:`Sequoia sempervirens`,typicalM:`60–100`,maxM:116.2,targetM:120,record:`「海波龍」（Hyperion）約 116.2 米，世界最高嘅樹`,source:{label:`Wikipedia`,url:`https://en.wikipedia.org/wiki/Hyperion_(tree)`},form:`column`,blurb:`加州海岸霧林嘅巨人，樹皮厚而紅褐，可以活二千年。`,stages:[`細細一撮扁平針葉`,`筆直幼幹，樹皮開始泛紅`,`窄長圓錐，樹冠延到地面`,`粗大紅褐樹幹，下半段光禿，樹冠集中喺高處`,`巨大有溝紋嘅紅幹、火燒疤痕，頂部分出幾條副幹`]},{id:`eucalyptus`,season:`s12`,name:`杏仁桉`,english:`Mountain ash`,scientific:`Eucalyptus regnans`,typicalM:`70–90`,maxM:100.5,targetM:100,record:`塔斯曼尼亞「百夫長」（Centurion）2018 年量得 100.5 米，最高嘅開花植物`,source:{label:`Giant Tree Expeditions／ABC News`,url:`https://giant-trees.com/project/how-tall-is-the-tallest-flowering-tree/`},form:`eucalypt`,blurb:`世界最高嘅開花植物。樹幹又直又滑，灰白色，下段掛住剝落樹皮。`,stages:[`對生嘅圓形嫩葉`,`瘦長樹幹，葉片開始變長`,`樹幹光滑灰白，樹冠疏落`,`長長一段光幹，樹冠喺頂上一團團`,`巨大白幹、剝落樹皮帶，頂部有枯枝`]},{id:`douglas`,season:`s12`,name:`花旗松`,english:`Coast Douglas-fir`,scientific:`Pseudotsuga menziesii`,typicalM:`60–75`,maxM:99.7,targetM:100,record:`俄勒岡「Doerner Fir」量得約 99.7 米（2025 年山火後剩約 85 米）`,source:{label:`Wikipedia／Jefferson Public Radio`,url:`https://en.wikipedia.org/wiki/Doerner_Fir`},form:`cone`,blurb:`北美太平洋岸嘅經典聖誕樹形，係世界第二高嘅針葉樹種。`,stages:[`一圈細針葉`,`細細嘅三角形小松`,`濃密圓錐形，枝到地面`,`高大深綠圓錐，掛滿有「鼠尾」苞片嘅球果`,`下半段枝條自然脫落，粗厚深溝樹皮`]}];function ut(e){return lt.find(t=>t.id===e)??lt[0]}function dt(e){return lt.filter(t=>t.season===e)}function ft(e){return dt(e)[0].id}function pt(e){return ut(e).targetM*100}function mt(e,t){let n=0;return ct.forEach((r,i)=>{e>=r*t&&(n=i)}),n}function ht(e,t){let n=ct[e]*t,r=e<4?ct[e+1]*t:t;return e===0?Math.max(18,r*.5):e===4?t*.97:Math.sqrt(n*r)}var gt=[3,4,5,6,7,8,9],_t=[{id:`whiteeye`,name:`暗綠繡眼鳥`,category:`bird`,motion:`flock`,group:[4,7],epithet:`白眼圈小綠鳥`,about:`成群喺樹冠穿梭，好鍾意啄花蜜同細蟲。`,minM:1.2,minHealth:50,real:{len:.11,span:.17},look:{kind:`bird`,c:[`#9fbf3a`,`#e9edc8`,`#a8c640`,`#3a3a3a`,`#86a830`,`#ffffff`],size:.75,f:[`eyering`]}},{id:`sparrow`,name:`麻雀`,category:`bird`,motion:`flock`,group:[3,6],epithet:`簷前熟客`,about:`香港全年都見得到，吱吱喳喳成群出現。`,minM:.8,minHealth:48,real:{len:.14,span:.22},look:{kind:`bird`,c:[`#9b6b43`,`#e9dcc4`,`#7a4b2a`,`#3b3b3b`,`#6d4a2f`,`#f4efe6`],size:.85,f:[`cheek`]}},{id:`tailorbird`,name:`長尾縫葉鶯`,category:`bird`,motion:`perch`,group:[1,2],epithet:`會縫葉嘅小鳥`,about:`用蜘蛛絲將葉片縫成袋仔做巢，尾巴成日翹起。`,minM:1,minHealth:50,real:{len:.12,span:.15},look:{kind:`bird`,c:[`#8fae5a`,`#f1eee0`,`#c8743a`,`#4a4a4a`,`#7c9a4c`],size:.7,f:[`cap`,`cocked`]}},{id:`wagtail`,name:`白鶺鴒`,category:`bird`,motion:`hop`,group:[1,2],epithet:`擺尾碎步`,about:`喺地面碎步行，尾巴上下擺個不停。`,minM:1.2,minHealth:50,real:{len:.19,span:.3},look:{kind:`bird`,c:[`#4a4a4a`,`#ffffff`,`#ffffff`,`#222222`,`#3a3a3a`,`#111111`],size:.85,f:[`longTail`,`mask`]}},{id:`munia`,name:`白腰文鳥`,category:`bird`,motion:`flock`,group:[4,8],epithet:`一串串小褐鳥`,about:`成群啄草籽，互相依偎企成一排。`,minM:2,minHealth:55,real:{len:.11,span:.16},look:{kind:`bird`,c:[`#6b4a32`,`#f2eadc`,`#3b2a1e`,`#8a8a92`,`#5a3d28`],size:.7,f:[`thickBeak`]}},{id:`myna`,name:`八哥`,category:`bird`,motion:`hop`,group:[2,3],epithet:`額前一撮毛`,about:`全身黑色，額前有撮羽冠，飛起時翼上有白斑。`,minM:2.5,minHealth:55,real:{len:.26,span:.45},look:{kind:`bird`,c:[`#1f1f22`,`#2a2a2e`,`#1a1a1c`,`#f0c040`,`#1f1f22`,`#ffffff`],size:1,f:[`crest`,`wingpatch`]}},{id:`bulbul`,name:`白頭鵯`,category:`bird`,motion:`perch`,group:[1,2],epithet:`白頭高歌`,about:`頭頂一撮白，是窗臺同公園的熟客。`,minM:3.5,minHealth:58,real:{len:.19,span:.28},look:{kind:`bird`,c:[`#8a9468`,`#eeeadb`,`#262626`,`#2b2b2b`,`#6f7a52`,`#ffffff`],size:.9,f:[`crest`]}},{id:`egret`,name:`小白鷺`,category:`bird`,motion:`wade`,group:[1,3],epithet:`溪邊白衣`,about:`雨後喺溪邊慢慢行，黃色腳趾係佢嘅標記。`,minM:3,minHealth:55,weather:`rain`,real:{len:.6,span:.95},look:{kind:`bird`,c:[`#fbfbf6`,`#ffffff`,`#fbfbf6`,`#222222`,`#f2f2ec`],size:1.5,f:[`longLegs`,`longNeck`,`longBeak`]}},{id:`magpierobin`,name:`鵲鴝`,category:`bird`,motion:`nest`,group:[1,1],epithet:`巢裡幾顆蛋`,about:`黑白分明的小鳥，喺樹杈築巢，巢入面有幾顆淺藍色的蛋。`,minM:4,minHealth:62,real:{len:.2,span:.28},look:{kind:`bird`,c:[`#1f1f22`,`#f4f4f4`,`#1f1f22`,`#1f1f1f`,`#f4f4f4`],size:.95,f:[`cocked`]}},{id:`sunbird`,name:`叉尾太陽鳥`,category:`bird`,motion:`hover`,group:[1,2],epithet:`花間小寶石`,about:`香港最細小嘅雀鳥之一，可以好似蜂鳥咁懸停吸花蜜。`,minM:4,minHealth:60,real:{len:.1,span:.13},look:{kind:`bird`,c:[`#4a6a3a`,`#f0d84a`,`#2a8a7a`,`#222222`,`#3f5f32`,`#c8322a`],size:.6,f:[`longBeak`,`longTail`]}},{id:`redbulbul`,name:`紅耳鵯`,category:`bird`,motion:`perch`,group:[1,3],epithet:`紅頰俏鳥`,about:`頰上有紅斑，頭頂尖尖羽冠，叫聲清亮。`,minM:5,minHealth:60,real:{len:.2,span:.28},look:{kind:`bird`,c:[`#7b6450`,`#f1ebe0`,`#222222`,`#2b2b2b`,`#6a5442`,`#d9362b`],size:.9,f:[`crest`,`cheek`]}},{id:`coucal`,name:`褐翅鴉鵑`,category:`bird`,motion:`hop`,group:[1,1],epithet:`紅翼大黑鳥`,about:`俗稱「毛雞」，喺草叢低處行來行去，叫聲「嘟嘟嘟」。`,minM:5,minHealth:60,real:{len:.52,span:.6},look:{kind:`bird`,c:[`#1f1f24`,`#1f1f24`,`#1f1f24`,`#222222`,`#9a4a22`],size:1.5,f:[`longTail`,`redEye`]}},{id:`swallow`,name:`家燕`,category:`bird`,motion:`flock`,group:[4,8],epithet:`剪刀尾`,about:`春夏喺天空快速穿梭捉蟲，尾巴分叉似剪刀。`,minM:5,minHealth:55,months:gt,real:{len:.18,span:.33},look:{kind:`bird`,c:[`#1d2a5a`,`#f2ece2`,`#1d2a5a`,`#222222`,`#1a244c`,`#b8402a`],size:.8,f:[`forkTail`]}},{id:`starling`,name:`黑領椋鳥`,category:`bird`,motion:`flock`,group:[2,4],epithet:`黑頸圈`,about:`成對或者細群出現，頸有一圈黑，眼周黃色。`,minM:6,minHealth:58,real:{len:.28,span:.45},look:{kind:`bird`,c:[`#3a3a3a`,`#f2f2ee`,`#f6f6f2`,`#222222`,`#2a2a2a`,`#111111`],size:1.1,f:[`collar`]}},{id:`nightheron`,name:`夜鷺`,category:`bird`,motion:`wade`,group:[1,2],epithet:`夜裡的釣手`,about:`日頭縮住頸瞓覺，黃昏先出嚟喺水邊捉魚。`,minM:6,minHealth:58,night:!0,real:{len:.6,span:1.1},look:{kind:`bird`,c:[`#8a9098`,`#f0f0ee`,`#223040`,`#1a1a1a`,`#7c828c`],size:1.35,f:[`longLegs`,`longBeak`,`redEye`]}},{id:`kingfisher`,name:`普通翠鳥`,category:`bird`,motion:`perch`,group:[1,1],epithet:`藍電一掠`,about:`風暴之後天色放晴，藍影會停在枝上。`,minM:7,minHealth:70,needStorms:1,real:{len:.16,span:.25},look:{kind:`bird`,c:[`#1f86c9`,`#e8843a`,`#1a6fb0`,`#1f1f1f`,`#2aa3dc`,`#f4b07a`],size:.85,f:[`longBeak`,`cheek`]}},{id:`hwamei`,name:`畫眉`,category:`bird`,motion:`perch`,group:[1,1],epithet:`白眉歌手`,about:`眼周有條白眉，歌聲婉轉，喺灌叢低處活動。`,minM:8,minHealth:60,real:{len:.22,span:.28},look:{kind:`bird`,c:[`#a0703a`,`#c89a5a`,`#9a6a36`,`#e0c050`,`#8a5e30`,`#ffffff`],size:1,f:[`eyering`,`longTail`]}},{id:`woodpecker`,name:`星頭啄木鳥`,category:`bird`,motion:`climb`,group:[1,1],epithet:`敲敲樹幹`,about:`細細隻嘅啄木鳥，喺樹幹上一路敲一路搵蟲。`,minM:8,minHealth:62,spot:`trunk`,real:{len:.15,span:.25},look:{kind:`bird`,c:[`#4a4038`,`#efe9dc`,`#4a4038`,`#4a4a4a`,`#f2f2f2`,`#d8322b`],size:.8,f:[`cap`,`longBeak`,`barred`]}},{id:`magpie`,name:`喜鵲`,category:`bird`,motion:`perch`,group:[1,2],epithet:`報喜黑白鵲`,about:`黑白分明，長尾有藍綠光澤，喺高樹頂築大巢。`,minM:9,minHealth:60,real:{len:.45,span:.6},look:{kind:`bird`,c:[`#18181c`,`#f6f6f6`,`#18181c`,`#1a1a1a`,`#24344a`,`#ffffff`],size:1.3,f:[`longTail`,`wingpatch`]}},{id:`dove`,name:`珠頸斑鳩`,category:`bird`,motion:`perch`,group:[1,2],epithet:`咕咕低鳴`,about:`頸上似一串珍珠，步步安穩。`,minM:10,minHealth:64,real:{len:.3,span:.5},look:{kind:`bird`,c:[`#b39a8b`,`#d9c7bb`,`#9d8a86`,`#3b3b3b`,`#8e7768`,`#2e2e2e`],size:1.15,f:[`collar`]}},{id:`koel`,name:`噪鵑`,category:`bird`,motion:`perch`,group:[1,1],epithet:`「歸家呀」`,about:`春夏清晨叫聲響亮似「歸家呀」，雄鳥全黑紅眼。`,minM:11,minHealth:62,months:[3,4,5,6,7,8],real:{len:.42,span:.6},look:{kind:`bird`,c:[`#15151a`,`#15151a`,`#15151a`,`#b8c09a`,`#1a1a22`],size:1.3,f:[`longTail`,`redEye`]}},{id:`crow`,name:`大嘴烏鴉`,category:`bird`,motion:`perch`,group:[1,2],epithet:`聰明黑衣`,about:`識得用工具、記得人面，係最聰明嘅雀鳥之一。`,minM:12,minHealth:50,real:{len:.55,span:1.1},look:{kind:`bird`,c:[`#141418`,`#1a1a20`,`#141418`,`#1a1a1a`,`#1c1c24`],size:1.5,f:[`thickBeak`]}},{id:`parakeet`,name:`紅領綠鸚鵡`,category:`bird`,motion:`flock`,group:[2,4],epithet:`綠色長尾`,about:`由籠鳥逃逸後喺香港市區落地生根，成群吵鬧飛過。`,minM:13,minHealth:66,real:{len:.4,span:.45},look:{kind:`bird`,c:[`#4ec23a`,`#8ad860`,`#4ec23a`,`#d8302a`,`#3aa02c`,`#111111`],size:1.1,f:[`longTail`,`hooked`,`collar`]}},{id:`bluemagpie`,name:`紅嘴藍鵲`,category:`bird`,motion:`perch`,group:[1,3],epithet:`長尾藍衣`,about:`紅嘴紅腳，尾巴比身長一倍，成群喺樹林中滑翔。`,minM:14,minHealth:68,real:{len:.65,span:.55},look:{kind:`bird`,c:[`#3c6ab0`,`#f2f2f2`,`#18181c`,`#d8302a`,`#3a64a8`,`#ffffff`],size:1.3,f:[`longTail`,`veryLongTail`]}},{id:`owl`,name:`領角鴞`,category:`bird`,motion:`hollow`,group:[1,1],epithet:`夜裡的眼睛`,about:`香港常見的小型貓頭鷹，黃昏後最活躍。`,minM:15,minHealth:72,night:!0,real:{len:.24,span:.6},look:{kind:`owl`,c:[`#8c7358`,`#d8c3a2`,`#f2b632`],size:1}},{id:`cockatoo`,name:`小葵花鳳頭鸚鵡`,category:`bird`,motion:`flock`,group:[2,5],epithet:`黃冠白鸚`,about:`極度瀕危，但香港市區有穩定野生群，比原生地仲多。`,minM:18,minHealth:72,real:{len:.33,span:.7},look:{kind:`bird`,c:[`#fbfbf4`,`#f6f2e0`,`#fbfbf4`,`#2a2a2a`,`#f2eee0`,`#f6d23a`],size:1.4,f:[`crest`,`bigCrest`,`hooked`]}},{id:`spoonbill`,name:`黑臉琵鷺`,category:`bird`,motion:`wade`,group:[2,4],epithet:`黑臉飯匙嘴`,about:`瀕危候鳥，每年秋冬嚟后海灣過冬，嘴似飯匙。`,minM:20,minHealth:70,months:[10,11,12,1,2,3,4],real:{len:.75,span:1.15},look:{kind:`bird`,c:[`#fbfbf6`,`#ffffff`,`#fbfbf6`,`#1a1a1a`,`#f2f2ec`],size:1.6,f:[`longLegs`,`longNeck`,`spoon`]}},{id:`kite`,name:`黑鳶`,category:`bird`,motion:`soar`,group:[1,2],epithet:`維港上空盤旋`,about:`俗稱「麻鷹」，張開翼喺海港上空慢慢盤旋。`,minM:25,minHealth:60,real:{len:.6,span:1.5},look:{kind:`bird`,c:[`#6a4a32`,`#8a6a4a`,`#7a5a40`,`#2a2a2a`,`#5a3e2a`],size:2.2,f:[`hooked`,`forkTail`,`soar`]}},{id:`serpenteagle`,name:`蛇鵰`,category:`bird`,motion:`soar`,group:[1,1],epithet:`郊野之王`,about:`喺郊野上空盤旋，一邊叫一邊搵蛇食。`,minM:40,minHealth:70,season:`s6`,real:{len:.7,span:1.6},look:{kind:`bird`,c:[`#4a3a2a`,`#c8a878`,`#3a2e24`,`#e8c040`,`#3e3024`],size:2.6,f:[`hooked`,`soar`,`crest`]}},{id:`seaeagle`,name:`白腹海鵰`,category:`bird`,motion:`soar`,group:[1,1],epithet:`海岸霸主`,about:`香港最大嘅猛禽，喺海岸高樹同懸崖築巢。`,minM:60,minHealth:75,season:`s12`,real:{len:.8,span:2},look:{kind:`bird`,c:[`#f4f4f0`,`#ffffff`,`#f4f4f0`,`#8a8a92`,`#5a5e66`],size:3,f:[`hooked`,`soar`]}},{id:`squirrel`,name:`赤腹松鼠`,category:`mammal`,motion:`climb`,group:[1,2],epithet:`赤腹一閃`,about:`郊野同公園都有，尾巴比身體還靈活。`,minM:2,minHealth:55,spot:`trunk`,real:{len:.4},look:{kind:`squirrel`,c:[`#8e4f2c`,`#c4623a`,`#7d4526`],size:1}},{id:`ferretbadger`,name:`鼬獾`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`白額小夜行者`,about:`面上有白色斑紋，夜晚喺落葉堆掘蚯蚓。`,minM:6,minHealth:58,night:!0,real:{len:.55},look:{kind:`quad`,c:[`#6a5a4a`,`#d8ccb8`,`#f2eee6`,`#2a2a2a`],size:.6,f:[`mask`,`snout`,`longTail`]}},{id:`porcupine`,name:`豪豬`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`一身長刺`,about:`夜間出沒，受驚會豎起黑白長刺沙沙作響。`,minM:8,minHealth:60,night:!0,real:{len:.75},look:{kind:`quad`,c:[`#3a3430`,`#3a3430`,`#2a2624`,`#f2eee6`],size:.8,f:[`spines`,`stocky`]}},{id:`fruitbat`,name:`短吻果蝠`,category:`mammal`,motion:`bat`,group:[3,6],epithet:`夜空小狐狸`,about:`食果實同花蜜，幫樹傳粉散播種子。`,minM:9,minHealth:60,night:!0,real:{len:.1,span:.45},look:{kind:`bat`,c:[`#5a4232`,`#8a6a4a`,`#3a2c22`],size:1}},{id:`boar`,name:`野豬`,category:`mammal`,motion:`walk`,group:[2,4],epithet:`郊野掘地者`,about:`一家大細出動，用鼻拱泥搵樹根同果實。`,minM:10,minHealth:55,real:{len:1.5},look:{kind:`quad`,c:[`#4a3a30`,`#5a4a3e`,`#3a2e26`,`#e8e0d0`],size:1.3,f:[`snout`,`tusks`,`stocky`,`bristle`]}},{id:`muntjac`,name:`赤麂`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`樹下吠鹿`,about:`香港郊野的細小鹿，受驚會好似狗吠咁叫，最鍾意喺樹蔭下休息。`,minM:12,minHealth:70,real:{len:1},look:{kind:`quad`,c:[`#b7753f`,`#e9d2b0`,`#b7753f`,`#5b4331`],size:1.3,f:[`antlers`,`longLegs`]}},{id:`civet`,name:`果子狸`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`白鼻心`,about:`面上有白色條紋，夜晚爬樹食果。`,minM:14,minHealth:66,night:!0,real:{len:1.1},look:{kind:`quad`,c:[`#7a6a5a`,`#a89a88`,`#2a2622`,`#f2eee6`],size:1,f:[`mask`,`longTail`,`blaze`]}},{id:`macaque`,name:`獼猴`,category:`mammal`,motion:`walk`,group:[3,6],epithet:`猴群出沒`,about:`金山一帶成群生活，有猴王帶隊，千祈唔好餵食。`,minM:16,minHealth:65,real:{len:.75},look:{kind:`monkey`,c:[`#a88a62`,`#c8aa82`,`#e8a898`],size:1.2}},{id:`leopardcat`,name:`豹貓`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`郊野細花豹`,about:`同家貓差唔多大，身上有豹紋，夜間捕獵。`,minM:20,minHealth:72,night:!0,real:{len:.9},look:{kind:`quad`,c:[`#c8a060`,`#f0e0c0`,`#c8a060`,`#2a2218`],size:.8,f:[`spots`,`longTail`,`catEars`]}},{id:`cattle`,name:`黃牛`,category:`mammal`,motion:`walk`,group:[2,4],epithet:`西貢牛群`,about:`昔日農耕牛嘅後代，而家喺郊野自由自在咁食草。`,minM:22,minHealth:62,real:{len:2.3},look:{kind:`quad`,c:[`#b8783a`,`#d8a870`,`#a86a30`,`#e8e0cc`],size:2.2,f:[`horns`,`stocky`,`longLegs`,`cowTail`]}},{id:`buffalo`,name:`水牛`,category:`mammal`,motion:`walk`,group:[2,3],epithet:`大嶼山泥浴`,about:`大嶼山濕地嘅水牛群，鍾意浸泥漿消暑。`,minM:30,minHealth:65,season:`s6`,real:{len:2.8},look:{kind:`quad`,c:[`#3a3634`,`#4a4644`,`#2e2a28`,`#8a8478`],size:2.5,f:[`bigHorns`,`stocky`,`longLegs`,`cowTail`]}},{id:`smallcivet`,name:`小靈貓`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`環紋長尾`,about:`尾巴有一圈圈黑環，夜間喺地面覓食。`,minM:35,minHealth:70,night:!0,season:`s6`,real:{len:.9},look:{kind:`quad`,c:[`#b8a078`,`#e0d0b0`,`#b8a078`,`#2a2622`],size:.8,f:[`spots`,`ringTail`,`longTail`,`snout`]}},{id:`pangolin`,name:`穿山甲`,category:`mammal`,motion:`walk`,group:[1,1],epithet:`一身鱗甲`,about:`極度瀕危，全身鱗片，受驚會捲成一個球。`,minM:45,minHealth:85,night:!0,season:`s6`,real:{len:.8},look:{kind:`quad`,c:[`#8a6a4a`,`#b89a78`,`#6a4e36`,`#5a4432`],size:.9,f:[`scales`,`longTail`,`snout`,`short`]}},{id:`otter`,name:`歐亞水獺`,category:`mammal`,motion:`walk`,group:[1,2],epithet:`米埔稀客`,about:`香港極罕見，只喺后海灣一帶有少量紀錄。`,minM:70,minHealth:85,season:`s12`,real:{len:1.1},look:{kind:`quad`,c:[`#5a4232`,`#c8b8a0`,`#5a4232`,`#2a2a2a`],size:1,f:[`short`,`longTail`,`snout`]}},{id:`butterfly`,name:`菜粉蝶`,category:`butterfly`,motion:`flutter`,group:[1,3],epithet:`白翼點綠`,about:`園圃常見的白蝴蝶，喜歡停在新葉上。`,minM:.15,minHealth:40,real:{len:.025,span:.05},look:{kind:`butterfly`,c:[`#fbfbf2`,`#9ccf6a`,`#333333`],size:.8}},{id:`plaintiger`,name:`金斑蝶`,category:`butterfly`,motion:`flutter`,group:[2,4],epithet:`橙翼黑邊`,about:`橙色翅膀帶黑邊白點，身體有毒，雀鳥唔敢食。`,minM:2,minHealth:50,real:{len:.035,span:.07},look:{kind:`butterfly`,c:[`#f08a2a`,`#1a1a1a`,`#222222`,`#ffffff`],size:1}},{id:`bluebottle`,name:`青鳳蝶`,category:`butterfly`,motion:`flutter`,group:[1,2],epithet:`青藍一條帶`,about:`黑翅中間有一條半透明青藍色帶，飛得好快。`,minM:4,minHealth:55,real:{len:.035,span:.08},look:{kind:`butterfly`,c:[`#1a1a1e`,`#3ac0d8`,`#222222`],size:1.05,f:[`tails`]}},{id:`birdwing`,name:`裳鳳蝶`,category:`butterfly`,motion:`flutter`,group:[1,1],epithet:`金裳大蝶`,about:`香港最大嘅蝴蝶，受保護，後翅金黃色。`,minM:18,minHealth:75,months:gt,real:{len:.06,span:.15},look:{kind:`butterfly`,c:[`#141414`,`#f2c81a`,`#1a1a1a`],size:1.7}},{id:`atlasmoth`,name:`皇蛾`,category:`butterfly`,motion:`flutter`,group:[1,1],epithet:`蛇頭翅尖`,about:`世界最大嘅蛾之一，翅尖似蛇頭，夜晚先出現。`,minM:28,minHealth:72,night:!0,season:`s6`,real:{len:.08,span:.25},look:{kind:`butterfly`,c:[`#a8502a`,`#f2dcb0`,`#6a3a22`,`#ffffff`],size:2,f:[`moth`]}},{id:`ladybug`,name:`七星瓢蟲`,category:`insect`,motion:`crawl`,group:[1,2],epithet:`葉上紅點`,about:`紅殼黑點，會幫樹食蚜蟲。`,minM:.3,minHealth:45,spot:`leaf`,real:{len:.007},look:{kind:`beetle`,c:[`#d8322b`,`#1a1a1a`],size:.7,f:[`dots`]}},{id:`dragonfly`,name:`紅蜻蜓`,category:`insect`,motion:`hover`,group:[2,4],epithet:`雨後點水`,about:`落雨前後喺低空盤旋捉蚊。`,minM:1,minHealth:45,weather:`rain`,real:{len:.045,span:.07},look:{kind:`dragonfly`,c:[`#d8402a`,`#e8f0f0`],size:.9}},{id:`honeybee`,name:`中華蜜蜂`,category:`insect`,motion:`hover`,group:[3,6],epithet:`嗡嗡採蜜`,about:`本地原生蜜蜂，幫開花植物傳粉。`,minM:3,minHealth:60,real:{len:.012,span:.02},look:{kind:`bee`,c:[`#e0a830`,`#2a2218`,`#e8f0f4`],size:.55}},{id:`mantis`,name:`螳螂`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`祈禱獵手`,about:`雙手似鐮刀，靜靜喺葉上伏擊小蟲。`,minM:5,minHealth:55,spot:`leaf`,real:{len:.08},look:{kind:`mantis`,c:[`#7ac04a`,`#5a9a3a`],size:.9}},{id:`cicada`,name:`蟬`,category:`insect`,motion:`crawl`,group:[1,2],epithet:`盛夏長鳴`,about:`要碰上酷熱的日子，牠才肯露面。`,minM:6,minHealth:55,weather:`hot`,spot:`trunk`,real:{len:.05,span:.12},look:{kind:`cicada`,c:[`#4d5a3a`,`#dfeee6`,`#394530`],size:.8}},{id:`stickinsect`,name:`竹節蟲`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`扮樹枝高手`,about:`身體似一條枯枝，一動不動就搵唔到佢。`,minM:9,minHealth:58,spot:`leaf`,real:{len:.12},look:{kind:`stick`,c:[`#8a7a4a`,`#6a5a36`],size:1}},{id:`rhinobeetle`,name:`獨角仙`,category:`insect`,motion:`crawl`,group:[1,1],epithet:`一支大角`,about:`夏夜飛嚟食樹汁，雄蟲頭上有一支大角。`,minM:12,minHealth:62,months:[5,6,7,8,9],night:!0,spot:`trunk`,real:{len:.06},look:{kind:`beetle`,c:[`#3a2218`,`#1a120e`],size:.9,f:[`horn`]}},{id:`firefly`,name:`螢火蟲`,category:`insect`,motion:`glow`,group:[1,1],epithet:`一點溫光`,about:`樹夠大、夠健康，夜裡就有微光。`,minM:15,minHealth:80,night:!0,real:{len:.012,span:.02},look:{kind:`firefly`,c:[`#3b3325`,`#f6ff9a`],size:.6}},{id:`lizard`,name:`變色樹蜥`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`曬太陽變紅頭`,about:`天氣熱就喺樹幹曬太陽，雄性繁殖期頭頸會變紅。`,minM:1.5,minHealth:50,weather:`hot`,spot:`trunk`,real:{len:.35},look:{kind:`lizard`,c:[`#9a8a5a`,`#c84a2a`,`#6a5e3e`],size:1}},{id:`gecko`,name:`壁虎`,category:`reptile`,motion:`crawl`,group:[1,2],epithet:`夜燈下的獵手`,about:`夜晚喺燈光附近捉飛蟲，腳底有吸盤。`,minM:7,minHealth:55,night:!0,spot:`trunk`,real:{len:.12},look:{kind:`lizard`,c:[`#c8b89a`,`#e8dcc8`,`#a89878`],size:.7,f:[`gecko`]}},{id:`pitviper`,name:`竹葉青`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`綠色伏擊者`,about:`全身翠綠、尾巴紅色，有毒，喺枝上靜靜等獵物。`,minM:11,minHealth:62,spot:`leaf`,real:{len:.7},look:{kind:`snake`,c:[`#5ac03a`,`#d8402a`,`#f0e070`],size:.8}},{id:`python`,name:`緬甸蟒`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`郊野巨蟒`,about:`香港最大嘅蛇，受保護，無毒但力大無窮。`,minM:38,minHealth:75,season:`s6`,spot:`ground`,real:{len:3.5},look:{kind:`snake`,c:[`#a8905a`,`#5a4430`,`#d8c898`],size:2.2,f:[`blotch`]}},{id:`turtle`,name:`三線閉殼龜`,category:`reptile`,motion:`crawl`,group:[1,1],epithet:`金錢龜`,about:`極度瀕危，殼上有三條黑線，喺山溪附近生活。`,minM:50,minHealth:80,season:`s12`,spot:`ground`,real:{len:.2},look:{kind:`turtle`,c:[`#6a4a2a`,`#1a1a1a`,`#e8c040`],size:1}},{id:`toad`,name:`黑眶蟾蜍`,category:`amphibian`,motion:`hop`,group:[1,3],epithet:`雨夜咯咯`,about:`落雨時喺草地跳出嚟，眼睛周圍有黑框。`,minM:2,minHealth:52,weather:`rain`,real:{len:.08},look:{kind:`frog`,c:[`#8a6a42`,`#c8a878`,`#2a2018`],size:.8,f:[`warty`]}},{id:`newt`,name:`香港瘰螈`,category:`amphibian`,motion:`crawl`,group:[1,2],epithet:`溪中小龍`,about:`香港特有嘅蠑螈，肚皮有橙紅斑，喺清澈山溪生活。`,minM:3,minHealth:58,weather:`rain`,spot:`ground`,real:{len:.13},look:{kind:`lizard`,c:[`#3a2e28`,`#e8702a`,`#2a221e`],size:.8,f:[`newt`]}},{id:`treefrog`,name:`盧氏小樹蛙`,category:`amphibian`,motion:`hop`,group:[1,3],epithet:`指甲咁細`,about:`香港特有，只有一隻指甲咁大，雨夜叫聲清脆。`,minM:5,minHealth:60,weather:`rain`,night:!0,real:{len:.02},look:{kind:`frog`,c:[`#a8905a`,`#d8c898`,`#5a4a30`],size:.5}}];function vt(e){return _t.find(t=>t.id===e)}var yt={bird:`雀鳥`,mammal:`哺乳類`,butterfly:`蝴蝶・蛾`,insect:`昆蟲`,reptile:`爬蟲類`,amphibian:`兩棲類`},bt=[`bird`,`mammal`,`butterfly`,`insect`,`reptile`,`amphibian`],xt=e=>{let t=new Set(e);return[10,11,12,1,2].every(e=>t.has(e))?`秋冬`:[5,6,7,8].every(e=>t.has(e))&&!t.has(12)?t.has(3)?`春夏`:`夏天`:`${Math.min(...e)}–${Math.max(...e)} 月`},St={s3:``,s6:`6 個月或以上賽季`,s12:`1 年賽季`};function Ct(e){let t=[e.minM>=1?`${e.minM} 米`:`${Math.round(e.minM*100)} 厘米`,`健康 ${e.minHealth}`];return e.weather===`hot`&&t.push(`酷熱日`),e.weather===`rain`&&t.push(`落雨日`),e.needStorms&&t.push(`捱過 ${e.needStorms} 場風暴`),e.months&&t.push(xt(e.months)),e.season&&e.season!==`s3`&&t.push(St[e.season]),e.night&&t.push(`夜行`),t.join(`・`)}var wt=[{id:`seedling`,reach0:.2,reach1:.3,depth:0,trunk:4,roots:!1},{id:`sapling`,reach0:.34,reach1:.46,depth:3,trunk:9,roots:!1},{id:`young`,reach0:.48,reach1:.58,depth:4,trunk:14,roots:!1},{id:`mature`,reach0:.62,reach1:.72,depth:5,trunk:24,roots:!0},{id:`giant`,reach0:.8,reach1:.9,depth:6,trunk:40,roots:!0}];function Tt(e=2e3){return wt.map((t,n)=>({...t,name:st[n],index:n,minCm:Math.round(ct[n]*e),nextCm:Math.round(n<4?ct[n+1]*e:e)}))}function Et(e,t=2e3){let n=Tt(t),r=n[0];for(let t of n)e>=t.minCm&&(r=t);return r}function Dt(e,t=2e3){let n=Et(e,t),r=n.nextCm-n.minCm;return r<=0?1:L((e-n.minCm)/r,0,1)}var Ot=83.8,kt=116.2,At=[{meters:.5,title:`幼苗站穩`,detail:`第一段真葉展開，樹有自己的名字。`},{meters:1.7,title:`高過大多數人`,detail:`大約一個成年人的高度。`},{meters:5,title:`街燈左右`,detail:`大概是行人路燈柱的高度。`},{meters:12,title:`三層舊唐樓`,detail:`舊式唐樓一層大約四米，三層左右這個高度。`},{meters:44,title:`尖沙咀鐘樓`,detail:`尖沙咀前九廣鐵路鐘樓高約 44 米。`},{meters:Ot,title:`將軍樹的高度`,detail:`美國巨杉「將軍樹」高 83.8 米。以體積計，牠是世界上最大的樹。`},{meters:kt,title:`海波龍`,detail:`加州紅木「海波龍」是已知最高的樹，2026 年測量約 116.2 米。`}],jt=[{id:`mist`,chip:{text:`+6 水分`,tone:`blue`},title:`晨霧`,text:`薄霧濕潤咗葉面同泥土。`,apply:e=>{e.moisture=Math.min(100,e.moisture+6)}},{id:`compost`,chip:{text:`+16 養分`,tone:`green`},title:`鄰居的堆肥`,text:`樓下街坊分咗一袋堆肥畀你。`,apply:e=>{e.nutrients=Math.min(100,e.nutrients+16)}},{id:`birds`,chip:{text:`+2 健康度`,tone:`green`},title:`鳥仔來探`,text:`有小鳥停低又飛走，樹頂多咗幾分生氣。`,apply:e=>{e.health=Math.min(100,e.health+2)}},{id:`drywind`,chip:{text:`-10 水分`,tone:`red`},title:`乾風`,text:`風有啲乾，泥土會快啲渴。`,apply:e=>{e.moisture=Math.max(0,e.moisture-10)}},{id:`leaves`,chip:{text:`+8 養分`,tone:`green`},title:`落葉`,text:`舊葉落返泥度，慢慢變養分。`,apply:e=>{e.nutrients=Math.min(100,e.nutrients+8)}},{id:`drawing`,chip:{text:`+3 健康度`,tone:`green`},title:`小朋友的畫`,text:`有孩童在樹下留低一張畫，棵樹好像被好好對待。`,apply:e=>{e.health=Math.min(100,e.health+3)}},{id:`aphids`,chip:{text:`留意蟲害`,tone:`red`},title:`蚜蟲`,text:`葉底見到幾隻蚜蟲。養分唔夠或者泥土太濕，好易生蟲，可以除一除預防。`,apply:e=>{e.pest.active||(e.pest.lowNDays=Math.max(e.pest.lowNDays,1))}},{id:`sunbeam`,chip:{text:`生長 ×1.15`,tone:`blue`},title:`陽光正好`,text:`雲隙透出柔和陽光，今日會長得順一點。`,apply:e=>{e.eventBonus=1.15}},{id:`cat`,title:`花貓經過`,text:`一隻花貓在樹蔭攤咗一陣，冇搞破壞。`,apply:()=>{}},{id:`quiet`,title:`安靜的一日`,text:`冇特別事，樹就係咁慢慢大。`,apply:()=>{}}];function Mt(e){return jt[rt(e)%jt.length]??jt[0]}function Nt(e){return jt.find(t=>t.id===e)??jt[9]}function Pt(e){return{date:e,water:0,drain:0,fertilize:0,dewormed:!1,preps:{stakes:!1,ropes:!1,prune:!1},credited:!1}}var Ft=()=>``;function It(e){Ft=e}function Lt(e,t,n,r={}){e.log.unshift({date:t,text:n,time:r.time??Ft(),kind:r.kind,title:r.title,reward:r.reward}),e.log.length>120&&(e.log.length=120)}var Rt=e=>Math.round(e*10)/10,zt=e=>`${e>=0?`+`:``}${Rt(e)}`;function Bt(e,t={}){let n=t.legacyBonus??0,r={version:2,started:!1,treeName:t.name??`世界之樹`,season:t.season??`s3`,species:t.species&&ut(t.species).season===(t.season??`s3`)?t.species:ft(t.season??`s3`),createdOn:e,lastSeenDate:e,virtualToday:null,health:h.health,moisture:h.moisture,nutrients:ue(h.nutrients+n),resist:h.resist,heightCm:h.heightCm,pest:{active:!1,lowNDays:0,wetDays:0,since:null},care:Pt(e),dayEvents:{},animals:[],seenAnimals:[],residents:[],highStreak:0,scars:0,log:[],daysCared:0,stormSurvivals:0,dailyEventDate:``,dailyEventId:`quiet`,eventBonus:1,morningNote:null,dying:null,over:null,completed:null,passedTargetOn:null,targetCm:0,lastSettlement:null,legacyBonus:n};return r.targetCm=pt(r.species),Lt(r,e,n?`一棵幼苗喺上一棵樹留低嘅養分地標旁邊種低，一開始就有 +${n} 養分。`:`一棵幼苗種低咗，由今日開始慢慢陪佢大。`,{kind:`plant`,title:`種低幼苗`,reward:{text:n?`+${n} 養分`:`新開始`,tone:`green`}}),Vt(r,e),r}function Vt(e,t){if(e.dailyEventDate===t)return null;e.eventBonus=1;let n=Mt(t);return e.dailyEventDate=t,e.dailyEventId=n.id,n.apply(e),n.id!==`quiet`&&Lt(e,t,n.text,{kind:`event`,title:`今日小事：${n.title}`,reward:n.chip}),e.health=ue(e.health),e.moisture=ue(e.moisture),e.nutrients=ue(e.nutrients),`${n.title}：${n.text}`}function Ht(e,t,n,r){let i=e.dayEvents[t]??={events:[],hko:!1};for(let e of n)e!==`clear`&&!i.events.includes(e)&&i.events.push(e);i.hko||=r;let a=Object.keys(e.dayEvents).sort();for(;a.length>21;)delete e.dayEvents[a.shift()]}function Ut(e,t,n){let r=e.dayEvents[t],i=r?.hko?Ye(n):n?Je(n):`clear`;return[...new Set([i,...r?.events??[]])]}function Wt(e){return{waterSaver:!!(e&&e.badges[1]>0),rainToN:!!(e&&e.badges[2]>0)}}function Gt(n,r,a,s,c){let l=Wt(s),u=ye(n.season),d=ge(a),p=i[d],m=[],h=[],g=n.health,_=n.moisture,y=n.nutrients,b=n.resist;a.filter(e=>e!==`clear`).length>1&&m.push(`同時有${a.filter(e=>e!==`clear`).map(e=>i[e].label).join(`、`)}，只計最重嘅${p.label}`);let x=p.dW,S=0;x<0&&l.waterSaver&&(x=Rt(x*f),m.push(`一級徽章：水分流失減少 10%`)),(d===`rainstorm`||d===`blackrain`)&&l.rainToN&&we(`rain2n|${r}`)<.3&&(S=x/2,x/=2,m.push(`二級徽章：${S} 水分轉咗做養分`)),n.moisture=ue(n.moisture+x);let C=Math.min(6,n.residents.length*2);C&&m.push(`長駐動物施肥 +${C} 養分`),n.nutrients=ue(n.nutrients-10+S+C);let w=he(p.damage,n.resist);n.resist=Math.max(0,Math.min(100,n.resist+p.dR-2));let T=n.pest.active?15:0;T&&m.push(`蟲害 −15`);let E=pe(n.moisture),D=me(n.nutrients);n.health=Rt(Math.max(0,Math.min(100,n.health+E+D-w-T)));let O=ve(n.health),k=p.damage>0&&w<=p.damage*.25,A=Math.round(p.growth*(k?o:1)*(n.eventBonus||1)*100)/100,j=Rt(be(u,pt(n.species))),ee=xe(j,O,A),M=n.heightCm;n.heightCm=Math.max(5,Rt(n.heightCm+ee)),p.damage>0&&(k?(n.stormSurvivals+=1,n.scars>0&&--n.scars,Lt(n,r,`${p.label}過咗。抗風力 ${Math.round(b)} 擋咗大部分傷害（${p.damage} → ${w}），今晚仲長得特別壯。`,{kind:`storm-safe`,title:`捱過${p.label}`,reward:{text:`生長 ×${o}`,tone:`green`},time:``}),h.push(`${p.label}過咗，你預先加固，只受 ${w} 點傷害，仲長得更壯。`)):w>=10&&(n.scars=Math.min(4,n.scars+1),Lt(n,r,`${p.label}令健康度 −${w}（基礎 ${p.damage}，抗風力 ${Math.round(b)} 減免咗 ${Rt(p.damage-w)}）。`,{kind:`storm-hit`,title:`${p.label}打中棵樹`,reward:{text:`-${w} 健康度`,tone:`red`},time:``}),h.push(`${p.label}令健康度 −${w}。下次預警一出，先加固推高抗風力。`))),n.pest.lowNDays=n.nutrients<30?n.pest.lowNDays+1:0,n.pest.wetDays=n.moisture>e[1]?n.pest.wetDays+1:0;let te=n.residents.length>=2?5:3;if(!n.pest.active&&(n.pest.lowNDays>=te||n.pest.wetDays>=te)){n.pest.active=!0,n.pest.since=r;let e=n.pest.lowNDays>=te?`連續 ${te} 日營養不良`:`連續 ${te} 日水浸`;Lt(n,r,`${e}，葉底生咗蟲。每日會扣 15 健康度，要用除蟲處理。`,{kind:`pest`,title:`蟲害`,reward:{text:`-15/日`,tone:`red`},time:``}),h.push(`${e}，生咗蟲！記得除蟲。`)}if(n.health>=90){if(n.highStreak+=1,n.highStreak>=3){let e=n.animals.find(e=>!n.residents.includes(e));e&&(n.residents.push(e),n.highStreak=0,Lt(n,r,`${_t.find(t=>t.id===e)?.name??e}鍾意呢棵咁健康嘅樹，決定長駐。每晚會幫手施少少肥${n.residents.length>=2?`，仲會幫手防蟲`:``}。`,{kind:`animal`,title:`動物長駐`,reward:{text:`長駐`,tone:`purple`},time:``}))}}else if(n.highStreak=0,n.health<70&&n.residents.length){let e=n.residents.pop();Lt(n,r,`樹唔夠精神，${_t.find(t=>t.id===e)?.name??e}搬走咗。健康度長期保持 90 以上，佢會返嚟。`,{kind:`animal`,title:`動物離開`,time:``})}let ne=!1,re=!1,ie=n.dying;if(n.health<=0){if(n.health=0,!ie)n.dying={since:r,at:c},Lt(n,r,`健康度跌到 0，棵樹進入 24 小時瀕死狀態。將水分調返 ${e[0]}–${e[1]}、養分 ${t[0]} 以上就救得返。`,{kind:`dying`,title:`瀕死`,reward:{text:`24 小時`,tone:`red`},time:``}),h.push(`棵樹瀕死！24 小時內將水分同養分調返最佳範圍就救得返。`);else if(c-ie.at>=864e5){if(s&&s.reviveTokens>0)--s.reviveTokens,n.health=30,n.dying=null,re=!0,Lt(n,r,`免死金牌生效，棵樹重新有咗生氣（健康度 30）。`,{kind:`badge`,title:`免死金牌`,reward:{text:`健康 30`,tone:`purple`},time:``}),h.push(`免死金牌救返棵樹！`);else{ne=!0;let e=v(n.createdOn,r)+1;n.over={kind:`dead`,date:r,tiers:n.completed?[]:Ce(u.days,e,!1),days:e},Lt(n,r,`${n.treeName}枯死咗，會化作小島上嘅養分地標，下一棵樹一開始就有 +40 養分。`,{kind:`dying`,title:`枯死`,time:``})}}}else ie&&(n.dying=null,Lt(n,r,`棵樹捱過瀕死，慢慢回復生氣。`,{kind:`grow`,title:`救返`,reward:{text:`健康 ${Math.round(n.health)}`,tone:`green`},time:``}));let ae={date:r,events:[...a],event:d,hBefore:g,hAfter:n.health,wBefore:_,wAfter:n.moisture,nBefore:y,nAfter:n.nutrients,rBefore:b,rAfter:n.resist,wFactor:E,nFactor:D,baseDamage:p.damage,finalDamage:w,pestDamage:T,hMult:O,weatherBonus:A,baseGrowth:j,deltaG:Rt(n.heightCm-M),heightAfter:n.heightCm,carbonKg:Se(n.heightCm),notes:m};n.lastSettlement=ae;let oe=_e(n.health);Lt(n,r,`${p.label}。水分 ${E>0?`適中`:`失衡`} ${zt(E)}，養分 ${zt(D)}，天氣損傷 ${p.damage}→${w}${T?`，蟲害 −${T}`:``}。健康 ${Math.round(g)}→${Math.round(n.health)}，${oe.label} ×${O}。`,{kind:`settle`,title:`夜間結算`,reward:{text:`${ee>=0?`+`:``}${ae.deltaG} 厘米`,tone:ee>=0?`blue`:`red`},time:``}),Kt(n,M,r),!n.over&&!n.passedTargetOn&&n.heightCm>=pt(n.species)&&(n.passedTargetOn=r,Lt(n,r,`${n.treeName}突破咗 ${at(pt(n.species))} 嘅目標，繼續長高！`,{kind:`badge`,title:`已突破目標`,reward:{text:at(n.heightCm),tone:`purple`},time:``}));let se=!1;if(!n.over&&!n.completed){let e=v(n.createdOn,r)+1;e>=u.days&&(se=!0,n.completed={date:r,tiers:Ce(u.days,e,!0),days:e,heightCm:n.heightCm},Lt(n,r,`${u.label}完成！${n.treeName}長到 ${at(n.heightCm)}，徽章到手。棵樹會繼續長落去。`,{kind:`badge`,title:`賽季完成`,reward:{text:`徽章`,tone:`purple`},time:``}))}return{settlement:ae,messages:h,died:ne,revived:re,completed:se}}function Kt(e,t,n,r=``){let i=pt(e.species),a=Et(t,i),o=Et(e.heightCm,i);return a.id===o.id||e.heightCm<t?null:(Lt(e,n,`棵樹長成${o.name}，高 ${at(e.heightCm)}。`,{kind:`stage`,title:`進入新階段`,reward:{text:o.name,tone:`blue`},time:r}),`棵樹進入新階段：${o.name}。`)}function qt(e,t){return t===`water`?{used:e.care.water,max:p.water.perDay}:t===`drain`?{used:e.care.drain,max:p.drain.perDay}:t===`fertilize`?{used:e.care.fertilize,max:p.fertilize.perDay}:{used:+!!e.care.dewormed,max:1}}function Jt(t,n,r){if(t.over)return{ok:!1,message:`呢局已經完結。`};let i=qt(t,n);if(i.used>=i.max)return{ok:!1,message:`今日做夠喇，聽日再嚟。`};let a=``,o,s={water:`已澆水`,fertilize:`已施肥`,deworm:`已除蟲`,drain:`已疏水`}[n];if(n===`water`){if(r.raining)return{ok:!1,message:`落緊雨，泥土濕㗎喇，唔使澆。`};t.care.water+=1,t.moisture=ue(t.moisture+p.water.amount),a=t.moisture>e[1]?`澆得有啲多，水分 ${Math.round(t.moisture)}，太濕會爛根，可以疏水。`:`水滲入泥度，水分 ${Math.round(t.moisture)}。`,o={text:`+${p.water.amount} 水分`,tone:`blue`}}else n===`drain`?(t.care.drain+=1,t.moisture=ue(t.moisture+p.drain.amount),a=t.moisture<e[0]?`疏走咗啲水，水分 ${Math.round(t.moisture)}，有啲乾喇。`:`開咗排水溝，泥土透返氣，水分 ${Math.round(t.moisture)}。`,o={text:`${p.drain.amount} 水分`,tone:`blue`}):n===`fertilize`?(t.care.fertilize+=1,t.nutrients=ue(t.nutrients+p.fertilize.amount),a=`養分滲入泥度，養分 ${Math.round(t.nutrients)}。`,o={text:`+${p.fertilize.amount} 養分`,tone:`green`}):(t.care.dewormed=!0,t.pest.active?(t.pest={active:!1,lowNDays:0,wetDays:0,since:null},a=`用咗除蟲道具，蟲害清除咗。`,o={text:`清除蟲害`,tone:`green`}):(t.pest.lowNDays=0,t.pest.wetDays=0,a=`冇蟲，不過你預防咗一次，計數重新開始。`,o={text:`預防`,tone:`green`}));t.care.credited||(t.daysCared+=1,t.care.credited=!0),Lt(t,t.care.date,a,{kind:n,title:s,reward:o});let c=Yt(t);c&&(a=`${a} ${c}`);let l=en(t,{date:t.care.date});return l.length&&(a=`${a} ${l.map(e=>_t.find(t=>t.id===e)?.name??e).join(`、`)}嚟咗。`),{ok:!0,message:a}}function Yt(n){return!n.dying||n.over||!fe(n.moisture,e)||n.nutrients<t[0]?null:(n.dying=null,n.health=10,Lt(n,n.care.date,`水分同養分都返到最佳範圍，棵樹救返喇（健康度 10）。`,{kind:`grow`,title:`救返`,reward:{text:`健康 10`,tone:`green`}}),`棵樹救返喇！`)}function Xt(e,t){if(e.over)return{ok:!1,message:`呢局已經完結。`};if(e.care.preps[t])return{ok:!1,message:`今日${m[t].label}過喇。`};if(e.resist>=100)return{ok:!1,message:`抗風力已經滿咗。`};e.care.preps[t]=!0;let n=e.resist;e.resist=Math.min(100,e.resist+m[t].amount);let r=Math.round(e.resist-n);return e.care.credited||(e.daysCared+=1,e.care.credited=!0),Lt(e,e.care.date,`${m[t].label}，抗風力 ${Math.round(n)} → ${Math.round(e.resist)}。`,{kind:`reinforce`,title:`已加固`,reward:{text:`+${r} 抗風力`,tone:`orange`}}),{ok:!0,message:`${m[t].label}：抗風力 +${r}（而家 ${Math.round(e.resist)}）。`}}function Zt(e){return{stakes:e>=15,ropes:e>=35,prune:e>=60}}var Qt=[`drizzle`,`rainstorm`,`blackrain`,`thunder`,`typhoon1`,`typhoon8`],$t={s3:1,s6:2,s12:3};function en(e,t){let n=[],r=e.heightCm/100,i=new Set([...t.events??[],...e.dayEvents[t.date]?.events??[]]);e.lastSettlement&&e.lastSettlement.date===_(t.date,-1)&&e.lastSettlement.events.forEach(e=>i.add(e));let a=i.has(`hot`),o=Qt.some(e=>i.has(e)),s=Number(t.date.slice(5,7));for(let i of _t)e.animals.includes(i.id)||r<i.minM||e.health<i.minHealth||i.needStorms&&e.stormSurvivals<i.needStorms||(i.weather!==`hot`||a)&&(i.weather!==`rain`||o)&&(i.weather===`storm`&&e.stormSurvivals<1||(!i.months||i.months.includes(s))&&(i.season&&$t[e.season]<$t[i.season]||(e.animals.push(i.id),n.push(i.id),Lt(e,t.date,`${i.name}嚟咗，${i.about}`,{kind:`animal`,title:`新朋友來訪`,reward:{text:`+1 圖鑑`,tone:`purple`}}))));return n}function tn(e,t){e.pest.active=!0,e.pest.since=t,Lt(e,t,`葉底生咗蟲。每晚會扣 15 健康度，要用除蟲處理。`,{kind:`pest`,title:`蟲害`,reward:{text:`-15/日`,tone:`red`}})}function nn(e,t,n,r,i){let a=e.health,o=e.heightCm,s=[],c=[],l=v(e.lastSeenDate,t);if(l<0&&(e.lastSeenDate=t,e.care=Pt(t),l=0),l>0&&!e.over){for(let t=0;t<l;t++){let a=_(e.lastSeenDate,t),o=Gt(e,a,n(a),r,i);if(c.push(o.settlement),s.push(...o.messages),e.over)break}e.lastSeenDate=t,e.care=Pt(t)}let u=e.heightCm-o,d=null,f=[];return e.over||(d=Vt(e,t),f=en(e,{date:t,events:[...c.at(-1)?.events??[],...n(t)]}),l===1?e.morningNote=rn(c[0]):l>1&&(e.morningNote=`你離開咗 ${l} 日。健康 ${Math.round(a)} → ${Math.round(e.health)}，高度 ${u>=0?`+`:``}${u.toFixed(1)} 厘米。`),s.length&&l>0&&(e.morningNote=`${e.morningNote??``} ${s.join(` `)}`.trim())),{daysPassed:Math.max(0,l),growthCm:u,healthBefore:a,healthAfter:e.health,messages:s,eventText:d,animals:f,settlements:c,over:!!e.over}}function rn(e){return e?`昨晚結算：${i[e.event].label}，健康 ${Math.round(e.hBefore)} → ${Math.round(e.hAfter)}，高度 ${e.deltaG>=0?`+`:``}${e.deltaG} 厘米。`:``}function an(e,t,n,r,i){let a=e.health,o=e.heightCm,s=Gt(e,t,n,r,i),c=_(t,1);e.virtualToday=c,e.lastSeenDate=c,e.care=Pt(c);let l=null,u=[];return e.over||(l=Vt(e,c),u=en(e,{date:c,events:s.settlement.events}),e.morningNote=`${rn(s.settlement)} ${s.messages.join(` `)}`.trim()),{daysPassed:1,growthCm:e.heightCm-o,healthBefore:a,healthAfter:e.health,messages:s.messages,eventText:l,animals:u,settlements:[s.settlement],over:!!e.over}}function on(n,r,a){if(n.dying)return`瀕死！將水分調到 ${e[0]}–${e[1]}、養分 ${t[0]} 以上就即刻救得返。`;if(n.pest.active)return`生咗蟲，每晚扣 15 健康度，快啲除蟲。`;if(a&&i[a.event].dR<0&&n.resist<60)return`${i[a.event].label}就嚟，先加固推高抗風力（而家 ${Math.round(n.resist)}）。`;if(a&&(a.event===`rainstorm`||a.event===`blackrain`)&&n.moisture>30)return`${i[a.event].label}會令水分 +60，可以先疏水。`;if(r===`hot`&&n.moisture<90)return`酷熱：今晚水分會跌 40，可以澆多幾次。`;if(r===`drizzle`&&n.moisture>=40)return`今日落雨，水分會 +20，唔使澆。`;let o=n.moisture+i[r].dW;return o<e[0]?`今晚結算前水分會跌到約 ${Math.round(o)}，記得澆水。`:o>e[1]?`今晚水分會去到約 ${Math.round(o)}，太濕，可以疏水。`:n.nutrients-10<t[0]?`養分今晚會跌到 60 以下，可以施肥。`:n.resist<30?`有空可以加固，抗風力擋到惡劣天氣嘅傷害。`:`水分同養分都啱啱好，今晚會健康咁長高。`}function sn(e,t){return Math.max(1,v(e.createdOn,t)+1)}function cn(e){let t=Nt(e.dailyEventId);return{title:t.title,text:t.text}}var ln=`sekai-tree-meta-v1`;function un(){return{version:1,badges:{1:0,2:0,3:0},reviveTokens:0,starry:!1,landmark:null,pendingLegacy:!1,history:[]}}function dn(){try{let e=localStorage.getItem(ln),t=e?JSON.parse(e):null;if(t&&t.version===1&&t.badges)return{...un(),...t}}catch{}return un()}function fn(e){try{localStorage.setItem(ln,JSON.stringify(e))}catch{}}function pn(e,t){let n=t.over;if(!n||n.booked)return[];n.booked=!0;let r=[];for(let t of n.tiers)e.badges[String(t)]+=1,r.push(`${d[t].name}：${d[t].perk}`),t===3&&(e.reviveTokens+=1,e.starry=!0);return n.kind===`dead`&&(e.landmark={name:t.treeName,heightCm:t.heightCm,date:n.date},e.pendingLegacy=!0,r.push(`${t.treeName}化作養分地標：下一棵樹開局養分 +40。`)),e.history.unshift({name:t.treeName,season:t.season,days:n.days,heightCm:t.heightCm,result:n.kind,date:n.date}),e.history.length=Math.min(e.history.length,20),r}function mn(e,t){let n=t.completed;if(!n||n.booked)return[];n.booked=!0;let r=[];for(let t of n.tiers)e.badges[String(t)]+=1,r.push(`${d[t].name}：${d[t].perk}`),t===3&&(e.reviveTokens+=1,e.starry=!0);return e.history.unshift({name:t.treeName,season:t.season,days:n.days,heightCm:n.heightCm,result:`complete`,date:n.date}),e.history.length=Math.min(e.history.length,20),r}function hn(e,t,n,r,i){let a=e.pendingLegacy?40:0;e.pendingLegacy=!1;let o=Bt(t,{season:n,name:r,legacyBonus:a,species:i});return o.started=!0,o}function gn(e,t,n,r,i,a={}){let o=a.scale??1,s=a.silhouette??!1;e.save(),e.translate(n,r),e.scale((a.flip?-1:1)*o,o);let c=a.night&&t===`firefly`?0:Math.sin(i*.004+n)*1.2;e.translate(0,c);let l=t=>{e.fillStyle=s?`#c2b6a3`:t},u=t=>{e.strokeStyle=s?`#b3a894`:t};switch(t){case`butterfly`:_n(e,i,l);break;case`ladybug`:vn(e,l);break;case`sparrow`:yn(e,l,u,`#8a623c`,`#c4956a`,`#5c3b28`,1);break;case`squirrel`:bn(e,i,l);break;case`bulbul`:xn(e,l,u,!1);break;case`redbulbul`:xn(e,l,u,!0);break;case`cicada`:Sn(e,l,u,s);break;case`kingfisher`:Cn(e,l,u);break;case`woodpecker`:wn(e,l,u);break;case`dove`:yn(e,l,u,`#8d8a86`,`#d9d3cc`,`#6d5a62`,1.15);break;case`owl`:Tn(e,l,!!a.night,s);break;case`firefly`:En(e,i,s);break;default:{let n=vt(t),r=n?.look.c??[`#8a623c`,`#c4956a`,`#5c3b28`];!n||n.category===`bird`?yn(e,l,u,r[0]??`#8a623c`,r[1]??`#c4956a`,r[2]??`#5c3b28`,1):n.category===`butterfly`?_n(e,i,l):n.category===`mammal`?bn(e,i,l):n.category===`insect`?vn(e,l):(l(r[0]??`#5f8a3a`),e.beginPath(),e.ellipse(0,0,11,4.5,0,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(11,-1,3.5,0,Math.PI*2),e.fill());break}}e.restore()}function _n(e,t,n){let r=.35+Math.abs(Math.sin(t*.01))*.75;n(`#f4f1e4`),e.beginPath(),e.ellipse(-7,-1,8,6*r,-.4,0,Math.PI*2),e.ellipse(-6,4,6,4.5*r,.5,0,Math.PI*2),e.fill(),n(`#f7f4ea`),e.beginPath(),e.ellipse(7,-1,8,6*r,.4,0,Math.PI*2),e.ellipse(6,4,6,4.5*r,-.5,0,Math.PI*2),e.fill(),n(`#6d8a48`),e.fillRect(-.8,-6,1.6,12),n(`#2c3330`),e.beginPath(),e.arc(0,-6,1.3,0,Math.PI*2),e.fill()}function vn(e,t){t(`#b4332c`),e.beginPath(),e.ellipse(0,1,7,5.5,0,0,Math.PI*2),e.fill(),t(`#2a2422`),e.fillRect(-.7,-3,1.4,9),e.beginPath(),e.arc(0,-4,3.1,0,Math.PI*2),e.fill(),t(`#f4efe6`);for(let[t,n]of[[-3,0],[3,1],[-2,3],[2.5,3.4]])e.beginPath(),e.arc(t,n,1.1,0,Math.PI*2),e.fill()}function yn(e,t,n,r,i,a,o){e.scale(o,o),t(r),e.beginPath(),e.ellipse(0,0,9,6,-.2,0,Math.PI*2),e.fill(),t(i),e.beginPath(),e.ellipse(2,1.5,5,3.4,0,0,Math.PI*2),e.fill(),t(r),e.beginPath(),e.arc(7,-2,4.2,0,Math.PI*2),e.fill(),t(a),e.beginPath(),e.moveTo(10,-2),e.lineTo(15,-1),e.lineTo(10,.5),e.fill(),t(`#2c241c`),e.beginPath(),e.arc(8.3,-3,.8,0,Math.PI*2),e.fill(),n(r),e.lineWidth=1.4,e.beginPath(),e.moveTo(-7,-1),e.quadraticCurveTo(-12,-6,-8,-7),e.stroke(),t(`#5c4636`),e.fillRect(2,5,1.2,4),e.fillRect(5,5,1.2,4)}function bn(e,t,n){let r=Math.sin(t*.003)*.4;n(`#c46a32`),e.beginPath(),e.ellipse(0,2,8,5,0,0,Math.PI*2),e.fill(),n(`#a8512a`),e.save(),e.translate(-6,0),e.rotate(-.8+r),e.beginPath(),e.ellipse(0,-8,4.5,8,0,0,Math.PI*2),e.fill(),e.restore(),n(`#d4844a`),e.beginPath(),e.arc(6,-2,4.4,0,Math.PI*2),e.fill(),n(`#f2d2b0`),e.beginPath(),e.ellipse(7,0,2.4,1.8,0,0,Math.PI*2),e.fill(),n(`#2c241c`),e.beginPath(),e.arc(7.4,-3,.7,0,Math.PI*2),e.fill(),n(`#a8512a`),e.beginPath(),e.moveTo(4,-6),e.lineTo(5,-9),e.lineTo(7,-6),e.fill(),e.beginPath(),e.moveTo(8,-6),e.lineTo(10,-9),e.lineTo(11,-5.5),e.fill()}function xn(e,t,n,r){t(r?`#6d4a32`:`#6f7a45`),e.beginPath(),e.ellipse(0,1,9,5.5,-.15,0,Math.PI*2),e.fill(),t(r?`#2c241c`:`#f4f1ea`),e.beginPath(),e.arc(7,-2,4.3,0,Math.PI*2),e.fill(),r?(t(`#2c241c`),e.beginPath(),e.moveTo(5,-5),e.lineTo(7,-9),e.lineTo(9,-5),e.fill(),t(`#c4483a`),e.beginPath(),e.arc(8.6,-1,1.3,0,Math.PI*2),e.fill()):(t(`#f7f4ee`),e.beginPath(),e.ellipse(6.5,-5.2,2.4,1.6,0,0,Math.PI*2),e.fill()),t(`#f0a03a`),e.beginPath(),e.moveTo(10,-1.5),e.lineTo(14,-.6),e.lineTo(10,.6),e.fill(),t(`#241c16`),e.beginPath(),e.arc(8.2,-2.6,.7,0,Math.PI*2),e.fill(),n(`#5c6840`),e.lineWidth=1.3,e.beginPath(),e.moveTo(-8,0),e.quadraticCurveTo(-13,-4,-9,-6),e.stroke()}function Sn(e,t,n,r){t(`rgba(210, 224, 210, 0.85)`),r||(e.globalAlpha=.8),e.beginPath(),e.ellipse(-4,-2,5,8,-.4,0,Math.PI*2),e.ellipse(4,-2,5,8,.4,0,Math.PI*2),e.fill(),e.globalAlpha=1,t(`#6e7a48`),e.beginPath(),e.ellipse(0,2,3.2,6,0,0,Math.PI*2),e.fill(),t(`#3e4a2c`),e.beginPath(),e.arc(0,-5,2.4,0,Math.PI*2),e.fill(),n(`#3e4a2c`),e.lineWidth=.8,e.beginPath(),e.moveTo(-1,-6),e.lineTo(-4,-10),e.moveTo(1,-6),e.lineTo(4,-10),e.stroke()}function Cn(e,t,n){t(`#1f7a8a`),e.beginPath(),e.ellipse(-1,1,8,5,-.2,0,Math.PI*2),e.fill(),t(`#e7a15a`),e.beginPath(),e.ellipse(2,2,4,2.6,0,0,Math.PI*2),e.fill(),t(`#1b6e86`),e.beginPath(),e.arc(6,-2,4,0,Math.PI*2),e.fill(),t(`#e7a15a`),e.beginPath(),e.moveTo(9,-1),e.lineTo(18,-.2),e.lineTo(9,1.2),e.fill(),t(`#f4f1ea`),e.beginPath(),e.arc(6.6,-3.2,1.5,0,Math.PI*2),e.fill(),t(`#241c16`),e.beginPath(),e.arc(7,-3.2,.6,0,Math.PI*2),e.fill(),n(`#176070`),e.lineWidth=1.2,e.beginPath(),e.moveTo(-7,-1),e.lineTo(-12,-5),e.stroke()}function wn(e,t,n){e.rotate(.7),t(`#2c241c`),e.beginPath(),e.ellipse(0,0,5,9,0,0,Math.PI*2),e.fill(),t(`#f4f1ea`),e.fillRect(-2,-2,3,7),t(`#c4483a`),e.beginPath(),e.arc(0,-8,4,0,Math.PI*2),e.fill(),t(`#f2d2b0`),e.beginPath(),e.moveTo(3,-7),e.lineTo(10,-6),e.lineTo(3,-4.5),e.fill(),t(`#241c16`),e.beginPath(),e.arc(1,-8.5,.7,0,Math.PI*2),e.fill(),n(`#2c241c`),e.lineWidth=1.4,e.beginPath(),e.moveTo(-2,6),e.lineTo(-6,8),e.moveTo(1,7),e.lineTo(4,11),e.stroke()}function Tn(e,t,n,r){t(`#8a6a42`),e.beginPath(),e.ellipse(0,2,9,10,0,0,Math.PI*2),e.fill(),t(`#6d5234`),e.beginPath(),e.moveTo(-6,-6),e.lineTo(-3,-14),e.lineTo(0,-6),e.fill(),e.beginPath(),e.moveTo(6,-6),e.lineTo(3,-14),e.lineTo(0,-6),e.fill(),t(n&&!r?`#f3e7b0`:`#f4efe4`),e.beginPath(),e.arc(-3.2,-1,3.1,0,Math.PI*2),e.arc(3.2,-1,3.1,0,Math.PI*2),e.fill(),t(`#2a241c`),e.beginPath(),e.arc(-3.2,-1,n?1.5:1.1,0,Math.PI*2),e.arc(3.2,-1,n?1.5:1.1,0,Math.PI*2),e.fill(),t(`#e0a050`),e.beginPath(),e.moveTo(-1.2,2),e.lineTo(0,4),e.lineTo(1.2,2),e.fill()}function En(e,t,n){let r=.45+Math.sin(t*.008)*.35;if(!n){let t=e.createRadialGradient(0,0,1,0,0,10);t.addColorStop(0,`rgba(230, 240, 140, ${.35+r*.4})`),t.addColorStop(1,`rgba(230, 240, 140, 0)`),e.fillStyle=t,e.beginPath(),e.arc(0,0,10,0,Math.PI*2),e.fill()}e.fillStyle=n?`#c2b6a3`:`rgba(236, 244, 160, ${.75+r*.25})`,e.beginPath(),e.arc(0,0,2.2,0,Math.PI*2),e.fill()}function Dn(e,t,n,r){return r===`day`?1:r===`night`||e<t-45||e>n+45?0:e<t?L((e-(t-45))/45,0,1):e>n?L(1-(e-n)/45,0,1):1}function On(e,t=1){let n=`${e[0]|0}, ${e[1]|0}, ${e[2]|0}`;return t>=1?`rgb(${n})`:`rgba(${n}, ${t})`}function kn(e,t,n){let r=L(n,0,1);return[e[0]+(t[0]-e[0])*r,e[1]+(t[1]-e[1])*r,e[2]+(t[2]-e[2])*r]}function An(e,t,n){let r=[[128,104,64],[154,124,78],[104,86,52]],i=[[132,132,70],[158,150,78],[108,116,62]],a=[[86,128,62],[118,150,70],[70,110,50]],o=[[52,114,58],[86,146,68],[40,92,48],[136,176,82]],s=e<30?r:e<50?i:e<75?a:o;return On(kn(s[Math.floor(t*s.length)%s.length]??o[0],[28,48,32],n<.45?.25:0))}var jn=class{canvas;dpr=1;w=320;h=480;model=null;drops=[];flakes=[];motes=[];constructor(e){this.canvas=e}resize(){let e=this.canvas.getBoundingClientRect();this.dpr=Math.min(window.devicePixelRatio||1,2),this.w=Math.max(2,e.width),this.h=Math.max(2,e.height),this.canvas.width=Math.round(this.w*this.dpr),this.canvas.height=Math.round(this.h*this.dpr),this.model=null}draw(e,t){let n=this.canvas.getContext(`2d`);if(!n)return;n.setTransform(this.dpr,0,0,this.dpr,0,0);let r=this.ensureModel(e),i=e.cond.stormKind===`typhoon`||e.cond.code>=95,a=i||e.cond.stormKind===`heavy-rain`||e.cond.precipMm>=25||e.cond.code===65||e.cond.code===82,o=(e.reducedMotion?.2:1)*(2.2+e.cond.windKmh*.16+(i?14:0)+(e.cond.gustKmh>70?6:0)),s=e=>{let n=L((r.groundY-e)/r.groundY,0,1);return Math.sin(t*.00135+e*.02)*Math.min(o,42)*(.12+n)};this.sky(n,e,t,a,i),this.hills(n,e,t),this.ground(n,r,e),this.tree(n,r,e,s),this.animals(n,r,e,t,s),this.weatherFx(n,e,t,a,i),this.vignette(n,e.daylight)}ensureModel(e){let t=Et(e.heightCm,e.targetCm),n=`${this.w}x${this.h}|${e.treeName}|${t.id}|${Math.round(e.heightCm)}|${+(e.health>55)}|${e.scars}|${+(e.pests>35)}`;return this.model?.key===n||(this.model=In(this.w,this.h,e,n)),this.model}sky(e,t,n,r,i){let a=t.daylight,o=[110,184,222],s=[166,212,232],c=[246,226,196];t.cond.hot&&!r?(o=[232,150,96],s=[244,196,140],c=[255,228,190]):i?(o=[42,54,70],s=[70,82,96],c=[96,102,108]):r||t.cond.raining?(o=[104,128,144],s=[150,166,170],c=[198,204,196]):t.cond.code>=3&&(o=[126,156,176],s=[176,196,206],c=[230,224,210]);let l=[12,20,46];o=kn(l,o,a),s=kn([28,44,78],s,a),c=kn([96,78,84],c,a);let u=e.createLinearGradient(0,0,0,this.h);if(u.addColorStop(0,On(o)),u.addColorStop(.55,On(s)),u.addColorStop(1,On(c)),e.fillStyle=u,e.fillRect(0,0,this.w,this.h),a<.85){let t=it(42);for(let n=0;n<40;n++)e.fillStyle=`rgba(244, 240, 220, ${(1-a)*(.35+t()*.65)})`,e.beginPath(),e.arc(t()*this.w,t()*this.h*.55,t()*1.3+.3,0,Math.PI*2),e.fill()}let d=Math.max(1,t.sunsetMin-t.sunriseMin),f=L((t.minute-t.sunriseMin)/d,0,1);if(a>.15&&!i&&!r){let n=this.w*(.14+.72*f),r=this.h*(.58-Math.sin(Math.PI*f)*.46),i=e.createRadialGradient(n,r,8,n,r,70);i.addColorStop(0,`rgba(255, 236, 186, ${.55*a})`),i.addColorStop(1,`rgba(255, 236, 186, 0)`),e.fillStyle=i,e.beginPath(),e.arc(n,r,70,0,Math.PI*2),e.fill(),e.fillStyle=`rgba(255, 246, 220, ${.95*a})`,e.beginPath(),e.arc(n,r,t.cond.hot?22:16,0,Math.PI*2),e.fill()}if(a<.6){let t=this.w*.78,n=this.h*.18;e.fillStyle=`rgba(244, 236, 214, ${1-a})`,e.beginPath(),e.arc(t,n,16,0,Math.PI*2),e.fill(),e.fillStyle=On(kn(l,o,.2),1-a*.3),e.beginPath(),e.arc(t+7,n-3,13,0,Math.PI*2),e.fill()}let p=i?7:t.cond.code>=2||t.cond.raining?5:3,m=t.reducedMotion?0:n*(.006+t.cond.windKmh*4e-4);for(let n=0;n<p;n++){let r=((n*.19+.05)*this.w+m)%(this.w+180)-90,o=this.h*(.12+n%3*.07),s=i?.55:t.cond.raining?.4:.28*(.4+a);e.fillStyle=i?`rgba(46, 56, 68, ${s})`:`rgba(255, 255, 255, ${s})`,Mn(e,r,o,46+n%3*12,16+n%2*4)}t.eventId===`mist`&&(e.fillStyle=`rgba(255,255,255,${.18+a*.12})`,e.beginPath(),e.ellipse(this.w*.5,this.h*.72,this.w*.55,36,0,0,Math.PI*2),e.fill())}hills(e,t,n){let r=t.daylight,i=kn([46,68,84],[120,156,168],r),a=kn([36,58,62],[92,132,112],r),o=t.reducedMotion?0:Math.sin(n*2e-4)*6;e.fillStyle=On(i),Nn(e,this.w,this.h*.78,.22,o),e.fillStyle=On(a),Nn(e,this.w,this.h*.84,.16,-o)}ground(e,t,n){let r=n.moisture>65||n.cond.raining,i=n.moisture<28&&!n.cond.raining,a=i?[150,132,78]:r?[62,110,68]:[96,140,78],o=r?[74,58,42]:i?[138,112,74]:[104,74,48];e.fillStyle=On(a),e.beginPath(),e.ellipse(this.w*.5,t.groundY+18,this.w*.72,this.h*.16,0,0,Math.PI*2),e.fill();for(let n of t.grass)e.strokeStyle=On(kn(a,[40,80,44],n.h/40)),e.lineWidth=1.3,e.beginPath(),e.moveTo(n.x,n.y),e.quadraticCurveTo(n.x+n.lean,n.y-n.h*.6,n.x+n.lean*1.4,n.y-n.h),e.stroke();e.fillStyle=On(o),e.beginPath(),e.ellipse(this.w*.5,t.groundY+6,54+Et(n.heightCm,n.targetCm).trunk,14,0,0,Math.PI*2),e.fill(),r&&(e.fillStyle=`rgba(180, 200, 190, 0.35)`,e.beginPath(),e.ellipse(this.w*.38,t.groundY+16,22,5,0,0,Math.PI*2),e.ellipse(this.w*.66,t.groundY+20,16,4,0,0,Math.PI*2),e.fill());for(let n of t.flowers)e.fillStyle=n.color,e.beginPath(),e.arc(n.x,n.y,2.4,0,Math.PI*2),e.fill()}tree(e,t,n,r){t.crown&&Et(n.heightCm,n.targetCm).depth>=3&&(e.fillStyle=An(n.health,.2,0),e.beginPath(),e.ellipse(t.crown.x+r(t.crown.y),t.crown.y,t.crown.rx,t.crown.ry,0,0,Math.PI*2),e.fill(),e.fillStyle=An(n.health,.7,.8),e.beginPath(),e.ellipse(t.crown.x+r(t.crown.y)*1.1-t.crown.rx*.15,t.crown.y-t.crown.ry*.1,t.crown.rx*.72,t.crown.ry*.7,0,0,Math.PI*2),e.fill());for(let n of t.roots)Fn(e,n,r,!0);Pn(e,t.trunk,r);for(let n of t.limbs)Fn(e,n,r,!1);let i=[...t.leaves].sort((e,t)=>e.z-t.z);for(let t of i){let i=t.x+r(t.y)*1.12;e.fillStyle=An(n.health,t.tint,t.z),e.beginPath(),e.ellipse(i,t.y,t.rx,t.ry,t.rot,0,Math.PI*2),e.fill()}for(let n of t.pests)e.fillStyle=`#3a3228`,e.beginPath(),e.arc(n.x+r(n.y),n.y,1.5,0,Math.PI*2),e.fill()}animals(e,t,n,r,i){if(n.health<22)return;let a=L(this.w/640,.72,1.2),o=t.perches.filter(e=>e.kind===`leaf`),s=t.perches.find(e=>e.kind===`trunk`)??{x:this.w/2,y:t.groundY-40,kind:`trunk`},c=0,l=n.daylight<.45;for(let t of n.animals){if(t===`firefly`)continue;let n=o[c%Math.max(1,o.length)]??s,u=c%2==0;(t===`woodpecker`||t===`cicada`)&&(n=s),t===`owl`&&(n=o[Math.floor(o.length/2)]??n),t===`ladybug`&&(n=o[0]??n),t!==`woodpecker`&&t!==`cicada`&&t!==`ladybug`&&(c+=1);let d=n.x+i(n.y),f=n.y;t===`butterfly`&&(d+=Math.sin(r*.0016)*16,f+=Math.cos(r*.0018)*8-12),t===`woodpecker`&&(d+=10),gn(e,t,d,f,r,{scale:a,night:l,flip:u})}if(n.animals.includes(`firefly`)){let t=l?7:3;for(let n=0;n<t;n++){let t=o[n*2%Math.max(1,o.length)]??s;gn(e,`firefly`,t.x+i(t.y)+Math.sin(r*.001+n)*(l?18:4),t.y+Math.cos(r*.0013+n*2)*(l?14:3),r+n*200,{scale:a,night:l,silhouette:!l})}}}weatherFx(e,t,n,r,i){let a=F(t.cond.code);if((t.cond.raining||r)&&!a){let n=r?120:70;if(this.drops.length!==n){let e=it(7);this.drops=Array.from({length:n},()=>({x:e()*this.w,y:e()*this.h,v:9+e()*8,len:r?14+e()*10:8+e()*8,drift:t.cond.windKmh*.03}))}e.strokeStyle=i?`rgba(210, 220, 230, 0.45)`:`rgba(200, 214, 224, 0.55)`,e.lineWidth=r?1.4:1;let a=+!t.reducedMotion;for(let n of this.drops)a&&(n.y+=n.v,n.x+=n.drift+t.cond.windKmh*.02,n.y>this.h&&(n.y=-10,n.x=Math.random()*this.w)),e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(n.x+t.cond.windKmh*.08,n.y+n.len),e.stroke()}else this.drops=[];if(a){if(this.flakes.length<40){let e=it(9);this.flakes=Array.from({length:50},()=>({x:e()*this.w,y:e()*this.h,v:.6+e(),r:1+e()*1.6}))}e.fillStyle=`rgba(255,255,255,0.85)`;for(let r of this.flakes)t.reducedMotion||(r.y+=r.v,r.x+=Math.sin(n*.001+r.y)*.4,r.y>this.h&&(r.y=-4)),e.beginPath(),e.arc(r.x,r.y,r.r,0,Math.PI*2),e.fill()}if(t.cond.gustKmh>45||i){if(this.motes.length<8){let e=it(11);this.motes=Array.from({length:10},()=>({x:e()*this.w,y:this.h*(.4+e()*.3),v:1.5+e()*2,r:2+e()*2,phase:e()*6}))}e.fillStyle=`rgba(120, 90, 50, 0.35)`;for(let r of this.motes)t.reducedMotion||(r.x+=r.v+t.cond.windKmh*.02,r.y+=Math.sin(n*.002+r.phase)*.4,r.x>this.w+10&&(r.x=-10)),e.beginPath(),e.ellipse(r.x,r.y,r.r*1.6,r.r*.6,.4,0,Math.PI*2),e.fill()}if(i&&!t.reducedMotion){let t=n/1e3%8;t<.12&&(e.fillStyle=`rgba(255,255,255,${.28*(1-t/.12)})`,e.fillRect(0,0,this.w,this.h))}t.cond.hot&&t.daylight>.4&&(e.fillStyle=`rgba(255, 170, 80, 0.08)`,e.fillRect(0,0,this.w,this.h))}vignette(e,t){let n=e.createRadialGradient(this.w/2,this.h*.62,this.w*.2,this.w/2,this.h*.55,this.w*.75);n.addColorStop(0,`rgba(0,0,0,0)`),n.addColorStop(1,t>.5?`rgba(70, 50, 30, 0.13)`:`rgba(0, 0, 10, 0.28)`),e.fillStyle=n,e.fillRect(0,0,this.w,this.h)}};function Mn(e,t,n,r,i){e.beginPath(),e.ellipse(t,n,r,i,0,0,Math.PI*2),e.ellipse(t-r*.45,n+4,r*.55,i*.8,0,0,Math.PI*2),e.ellipse(t+r*.42,n+3,r*.5,i*.75,0,0,Math.PI*2),e.fill()}function Nn(e,t,n,r,i){e.beginPath(),e.moveTo(0,n),e.quadraticCurveTo(t*.25+i,n-t*r,t*.5,n-t*r*.3),e.quadraticCurveTo(t*.75-i,n-t*r*.7,t,n-10),e.lineTo(t,n+80),e.lineTo(0,n+80),e.fill()}function Pn(e,t,n){if(t.length<2)return;e.beginPath();let r=t[0];e.moveTo(r.x+n(r.y)-r.r,r.y);for(let r of t)e.lineTo(r.x+n(r.y)-r.r*.92,r.y);for(let r=t.length-1;r>=0;r--){let i=t[r];e.lineTo(i.x+n(i.y)+i.r,i.y)}e.closePath();let i=t[t.length-1],a=e.createLinearGradient(r.x-r.r,0,r.x+r.r,0);a.addColorStop(0,`#4a3024`),a.addColorStop(.45,`#8d5c3e`),a.addColorStop(1,`#5c3b2a`),e.fillStyle=a,e.fill(),e.strokeStyle=`rgba(255, 220, 180, 0.18)`,e.lineWidth=Math.max(1,i.r*.25),e.beginPath(),e.moveTo(r.x+n(r.y)-r.r*.2,r.y-4),e.lineTo(i.x+n(i.y)-i.r*.1,i.y),e.stroke()}function Fn(e,t,n,r){let i=t.x1+n(t.y1)*(r?.3:1),a=t.x2+n(t.y2)*(r?.2:1.08);e.lineCap=`round`,e.strokeStyle=r?`#6a4a34`:`#4e3426`,e.lineWidth=t.w,e.beginPath(),e.moveTo(i,t.y1),e.quadraticCurveTo((i+a)/2+t.w*.25,(t.y1+t.y2)/2,a,t.y2),e.stroke(),r||(e.strokeStyle=`#916348`,e.lineWidth=Math.max(.7,t.w*.4),e.stroke()),t.snap&&(e.strokeStyle=`#e6d3b4`,e.lineWidth=1.3,e.beginPath(),e.moveTo(a-5,t.y2+2),e.lineTo(a+4,t.y2-3),e.stroke())}function In(e,t,n,r){let i=Et(n.heightCm,n.targetCm),a=it(rt(`${n.treeName||`tree`}|${i.id}`)),o=Dt(n.heightCm,n.targetCm),s=t*.8,c=s-(i.reach0+(i.reach1-i.reach0)*o)*t*.92,l=e*.52+(a()-.5)*12,u={key:r,groundY:s,trunk:[],limbs:[],leaves:[],roots:[],perches:[],pests:[],flowers:[],grass:[],crown:null};for(let t=0;t<36;t++)u.grass.push({x:e*.08+a()*e*.84,y:s+8+a()*18,h:8+a()*16,lean:(a()-.4)*10});if(n.health>55){let e=[`#e7b3b0`,`#f0d58a`,`#f4f1ea`,`#d98b86`];for(let t=0;t<7;t++)u.flowers.push({x:l+(a()-.5)*160,y:s+4+a()*10,color:e[t%e.length]??`#f0d58a`})}if(i.depth===0){let e=s-c,t=(a()-.5)*16;u.trunk=[{x:l,y:s,r:3.2},{x:l+t*.3,y:s-e*.45,r:2.4},{x:l+t,y:s-e,r:1.6}];let n=u.trunk[2];return u.leaves.push({x:n.x-12,y:n.y+6,rx:16+o*8,ry:8,rot:-.9,tint:.2,z:.8},{x:n.x+14,y:n.y+4,rx:18+o*8,ry:9,rot:.8,tint:.6,z:.9},{x:n.x+1,y:n.y-8,rx:8,ry:12,rot:.1,tint:.9,z:1}),u.perches.push({x:n.x,y:n.y-6,kind:`leaf`}),u.perches.push({x:l,y:s-e*.45,kind:`trunk`}),u}let d=(s-c)*.46,f=s-d,p=i.trunk*(e/520)*(.82+o*.35);for(let e=0;e<=6;e++){let t=e/6,n=Math.sin(t*3+a()*2)*(8+t*6);u.trunk.push({x:l+n*(a()>.5?1:.6),y:s-d*t,r:p*(1-t*.72)})}let m=u.trunk[u.trunk.length-1];u.perches.push({x:l+p*.2,y:s-d*.55,kind:`trunk`}),u.crown={x:m.x,y:c+(f-c)*.55,rx:Math.min(e*.42,(18+i.depth*22)*(e/480)),ry:(s-c)*.26};let h=n.scars,g=(e,t,n,r,o,s)=>{let c=e+Math.cos(n)*r,l=t+Math.sin(n)*r,d=!1;if(h>0&&s===i.depth-1&&a()>.4&&(c=e+Math.cos(n)*r*.45,l=t+Math.sin(n)*r*.45,d=!0,--h),u.limbs.push({x1:e,y1:t,x2:c,y2:l,w:o,snap:d}),d||s<=0||o<1.3){let e=4+Math.floor(a()*3);for(let t=0;t<e;t++){let e=a()*Math.PI*2,t=a()*(12+i.depth*3);u.leaves.push({x:c+Math.cos(e)*t,y:l+Math.sin(e)*t*.62,rx:7+a()*(6+i.depth),ry:4+a()*4,rot:e,tint:a(),z:a()})}u.perches.push({x:c,y:l,kind:`leaf`});return}let f=s>=3&&a()>.62?3:2;for(let e=0;e<f;e++){let t=(e/(f-1)-.5)*(.95+a()*.45);g(c,l,n+t+(a()-.5)*.15,r*(.64+a()*.08),o*.64,s-1)}},_=i.depth>=5?4:3;for(let e=0;e<_;e++){let t=e/(_-1),n=-Math.PI/2+(t-.5)*1.5,r=u.trunk[Math.max(0,u.trunk.length-2)];g(r.x,r.y,n,(s-c)*(.22+o*.06),p*.55,i.depth-1)}if(i.roots){let e=4+Math.min(4,i.depth);for(let t=0;t<e;t++){let e=u.limbs[Math.floor(a()*u.limbs.length)];if(!e)continue;let t=(e.x1+e.x2)/2,n=(e.y1+e.y2)/2;n>s-30||u.roots.push({x1:t,y1:n,x2:t+(a()-.5)*16,y2:s-2,w:1.4+a()*1.6})}}if(n.pests>35)for(let e=0;e<8;e++){let e=u.leaves[Math.floor(a()*u.leaves.length)];e&&u.pests.push({x:e.x,y:e.y})}return u}var Ln=1e3,Rn=1001,zn=1002,Bn=1003,Vn=1004,Hn=1005,Un=1006,Wn=1007,Gn=1008,Kn=1009,qn=1010,Jn=1011,Yn=1012,Xn=1013,Zn=1014,Qn=1015,$n=1016,er=1017,tr=1018,nr=1020,rr=35902,ir=35899,ar=1021,or=1022,sr=1023,cr=1026,lr=1027,ur=1028,dr=1029,fr=1030,pr=1031,mr=1033,hr=33776,gr=33777,_r=33778,vr=33779,yr=35840,br=35841,xr=35842,Sr=35843,Cr=36196,wr=37492,Tr=37496,Er=37488,Dr=37489,Or=37490,kr=37491,Ar=37808,jr=37809,Mr=37810,Nr=37811,Pr=37812,Fr=37813,Ir=37814,Lr=37815,Rr=37816,zr=37817,Br=37818,Vr=37819,Hr=37820,Ur=37821,Wr=36492,Gr=36494,Kr=36495,qr=36283,Jr=36284,Yr=36285,Xr=36286,Zr=2300,Qr=2301,$r=2302,ei=2303,ti=2400,ni=2401,ri=2402,ii=3200,ai=3201,oi=`srgb`,si=`srgb-linear`,ci=`linear`,li=`srgb`,ui=7680,di=35044,fi=35048,pi=2e3;function mi(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function hi(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function gi(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function _i(){let e=gi(`canvas`);return e.style.display=`block`,e}var vi={};function yi(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function bi(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function z(...e){e=bi(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function B(...e){e=bi(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function xi(...e){let t=e.join(` `);t in vi||(vi[t]=!0,z(...e))}function Si(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Ci={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},wi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Ti=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Ei=1234567,Di=Math.PI/180,Oi=180/Math.PI;function ki(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ti[e&255]+Ti[e>>8&255]+Ti[e>>16&255]+Ti[e>>24&255]+`-`+Ti[t&255]+Ti[t>>8&255]+`-`+Ti[t>>16&15|64]+Ti[t>>24&255]+`-`+Ti[n&63|128]+Ti[n>>8&255]+`-`+Ti[n>>16&255]+Ti[n>>24&255]+Ti[r&255]+Ti[r>>8&255]+Ti[r>>16&255]+Ti[r>>24&255]).toLowerCase()}function Ai(e,t,n){return Math.max(t,Math.min(n,e))}function ji(e,t){return(e%t+t)%t}function Mi(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Ni(e,t,n){return e===t?0:(n-e)/(t-e)}function Pi(e,t,n){return(1-n)*e+n*t}function Fi(e,t,n,r){return Pi(e,t,1-Math.exp(-n*r))}function Ii(e,t=1){return t-Math.abs(ji(e,t*2)-t)}function Li(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Ri(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function zi(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Bi(e,t){return e+Math.random()*(t-e)}function Vi(e){return e*(.5-Math.random())}function Hi(e){e!==void 0&&(Ei=e);let t=Ei+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Ui(e){return e*Di}function Wi(e){return e*Oi}function Gi(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Ki(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function qi(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Ji(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:z(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Yi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function Xi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var Zi={DEG2RAD:Di,RAD2DEG:Oi,generateUUID:ki,clamp:Ai,euclideanModulo:ji,mapLinear:Mi,inverseLerp:Ni,lerp:Pi,damp:Fi,pingpong:Ii,smoothstep:Li,smootherstep:Ri,randInt:zi,randFloat:Bi,randFloatSpread:Vi,seededRandom:Hi,degToRad:Ui,radToDeg:Wi,isPowerOfTwo:Gi,ceilPowerOfTwo:Ki,floorPowerOfTwo:qi,setQuaternionFromProperEuler:Ji,normalize:Xi,denormalize:Yi},V=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ai(this.x,e.x,t.x),this.y=Ai(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ai(this.x,e,t),this.y=Ai(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ai(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ai(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Qi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:z(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ai(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},H=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ea.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ea.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ai(this.x,e.x,t.x),this.y=Ai(this.y,e.y,t.y),this.z=Ai(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ai(this.x,e,t),this.y=Ai(this.y,e,t),this.z=Ai(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ai(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return $i.copy(this).projectOnVector(e),this.sub($i)}reflect(e){return this.sub($i.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ai(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},$i=new H,ea=new Qi,U=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return xi(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(ta.makeScale(e,t)),this}rotate(e){return xi(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(ta.makeRotation(-e)),this}translate(e,t){return xi(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(ta.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ta=new U,na=new U().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ra=new U().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ia(){let e={enabled:!0,workingColorSpace:si,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=oa(e.r),e.g=oa(e.g),e.b=oa(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=sa(e.r),e.g=sa(e.g),e.b=sa(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?ci:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return xi(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return xi(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[si]:{primaries:t,whitePoint:r,transfer:ci,toXYZ:na,fromXYZ:ra,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:oi},outputColorSpaceConfig:{drawingBufferColorSpace:oi}},[oi]:{primaries:t,whitePoint:r,transfer:li,toXYZ:na,fromXYZ:ra,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:oi}}}),e}var aa=ia();function oa(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function sa(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var ca,la=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ca===void 0&&(ca=gi(`canvas`)),ca.width=e.width,ca.height=e.height;let t=ca.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=ca}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=gi(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=oa(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(oa(t[e]/255)*255):t[e]=oa(t[e]);return{data:t,width:e.width,height:e.height}}return z(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},ua=0,da=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ua++}),this.uuid=ki(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(fa(r[t].image)):e.push(fa(r[t]))}else e=fa(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function fa(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?la.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(z(`Texture: Unable to serialize Texture.`),{})}var pa=0,ma=new H,ha=class e extends wi{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Rn,i=Rn,a=Un,o=Gn,s=sr,c=Kn,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pa++}),this.uuid=ki(),this.name=``,this.source=new da(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new V(0,0),this.repeat=new V(1,1),this.center=new V(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new U,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ma).x}get height(){return this.source.getSize(ma).y}get depth(){return this.source.getSize(ma).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){z(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){z(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ln:e.x-=Math.floor(e.x);break;case Rn:e.x=e.x<0?0:1;break;case zn:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Ln:e.y-=Math.floor(e.y);break;case Rn:e.y=e.y<0?0:1;break;case zn:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};ha.DEFAULT_IMAGE=null,ha.DEFAULT_MAPPING=300,ha.DEFAULT_ANISOTROPY=1;var ga=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ai(this.x,e.x,t.x),this.y=Ai(this.y,e.y,t.y),this.z=Ai(this.z,e.z,t.z),this.w=Ai(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ai(this.x,e,t),this.y=Ai(this.y,e,t),this.z=Ai(this.z,e,t),this.w=Ai(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ai(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},_a=class extends wi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Un,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ga(0,0,e,t),this.scissorTest=!1,this.viewport=new ga(0,0,e,t),this.textures=[];let r=new ha({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Un,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new da(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},va=class extends _a{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ya=class extends ha{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Bn,this.minFilter=Bn,this.wrapR=Rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},ba=class extends ha{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Bn,this.minFilter=Bn,this.wrapR=Rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},xa=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Sa.setFromMatrixColumn(e,0).length(),i=1/Sa.setFromMatrixColumn(e,1).length(),a=1/Sa.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(wa,e,Ta)}lookAt(e,t,n){let r=this.elements;return Oa.subVectors(e,t),Oa.lengthSq()===0&&(Oa.z=1),Oa.normalize(),Ea.crossVectors(n,Oa),Ea.lengthSq()===0&&(Math.abs(n.z)===1?Oa.x+=1e-4:Oa.z+=1e-4,Oa.normalize(),Ea.crossVectors(n,Oa)),Ea.normalize(),Da.crossVectors(Oa,Ea),r[0]=Ea.x,r[4]=Da.x,r[8]=Oa.x,r[1]=Ea.y,r[5]=Da.y,r[9]=Oa.y,r[2]=Ea.z,r[6]=Da.z,r[10]=Oa.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],ne=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*ne,i[12]=a*w+o*O+s*ee+c*re,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*ne,i[13]=l*w+u*O+d*ee+f*re,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*ne,i[14]=p*w+m*O+h*ee+g*re,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*ne,i[15]=_*w+v*O+y*ee+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Sa.set(r[0],r[1],r[2]).length(),o=Sa.set(r[4],r[5],r[6]).length(),s=Sa.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Ca.copy(this);let c=1/a,l=1/o,u=1/s;return Ca.elements[0]*=c,Ca.elements[1]*=c,Ca.elements[2]*=c,Ca.elements[4]*=l,Ca.elements[5]*=l,Ca.elements[6]*=l,Ca.elements[8]*=u,Ca.elements[9]*=u,Ca.elements[10]*=u,t.setFromRotationMatrix(Ca),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=pi,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=pi,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Sa=new H,Ca=new xa,wa=new H(0,0,0),Ta=new H(1,1,1),Ea=new H,Da=new H,Oa=new H,ka=new xa,Aa=new Qi,ja=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(Ai(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-Ai(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(Ai(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-Ai(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(Ai(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-Ai(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:z(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ka.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ka,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Aa.setFromEuler(this),this.setFromQuaternion(Aa,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ja.DEFAULT_ORDER=`XYZ`;var Ma=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Na=0,Pa=new H,Fa=new Qi,Ia=new xa,La=new H,Ra=new H,za=new H,Ba=new Qi,Va=new H(1,0,0),Ha=new H(0,1,0),Ua=new H(0,0,1),Wa={type:`added`},Ga={type:`removed`},Ka={type:`childadded`,child:null},qa={type:`childremoved`,child:null},Ja=class e extends wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Na++}),this.uuid=ki(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new H,n=new ja,r=new Qi,i=new H(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new xa},normalMatrix:{value:new U}}),this.matrix=new xa,this.matrixWorld=new xa,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ma,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Fa.setFromAxisAngle(e,t),this.quaternion.multiply(Fa),this}rotateOnWorldAxis(e,t){return Fa.setFromAxisAngle(e,t),this.quaternion.premultiply(Fa),this}rotateX(e){return this.rotateOnAxis(Va,e)}rotateY(e){return this.rotateOnAxis(Ha,e)}rotateZ(e){return this.rotateOnAxis(Ua,e)}translateOnAxis(e,t){return Pa.copy(e).applyQuaternion(this.quaternion),this.position.add(Pa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Va,e)}translateY(e){return this.translateOnAxis(Ha,e)}translateZ(e){return this.translateOnAxis(Ua,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ia.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?La.copy(e):La.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Ra.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ia.lookAt(Ra,La,this.up):Ia.lookAt(La,Ra,this.up),this.quaternion.setFromRotationMatrix(Ia),r&&(Ia.extractRotation(r.matrixWorld),Fa.setFromRotationMatrix(Ia),this.quaternion.premultiply(Fa.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(B(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Wa),Ka.child=e,this.dispatchEvent(Ka),Ka.child=null):B(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ga),qa.child=e,this.dispatchEvent(qa),qa.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ia.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ia.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ia),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Wa),Ka.child=e,this.dispatchEvent(Ka),Ka.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ra,e,za),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ra,Ba,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Ja.DEFAULT_UP=new H(0,1,0),Ja.DEFAULT_MATRIX_AUTO_UPDATE=!0,Ja.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ya=class extends Ja{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Xa={type:`move`},Za=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ya,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ya,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ya,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Xa)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ya;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Qa={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$a={h:0,s:0,l:0},eo={h:0,s:0,l:0};function to(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var W=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=oi){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,aa.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=aa.workingColorSpace){return this.r=e,this.g=t,this.b=n,aa.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=aa.workingColorSpace){if(e=ji(e,1),t=Ai(t,0,1),n=Ai(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=to(i,r,e+1/3),this.g=to(i,r,e),this.b=to(i,r,e-1/3)}return aa.colorSpaceToWorking(this,r),this}setStyle(e,t=oi){function n(t){t!==void 0&&parseFloat(t)<1&&z(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:z(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);z(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=oi){let n=Qa[e.toLowerCase()];return n===void 0?z(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=oa(e.r),this.g=oa(e.g),this.b=oa(e.b),this}copyLinearToSRGB(e){return this.r=sa(e.r),this.g=sa(e.g),this.b=sa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=oi){return aa.workingToColorSpace(no.copy(this),e),Math.round(Ai(no.r*255,0,255))*65536+Math.round(Ai(no.g*255,0,255))*256+Math.round(Ai(no.b*255,0,255))}getHexString(e=oi){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=aa.workingColorSpace){aa.workingToColorSpace(no.copy(this),t);let n=no.r,r=no.g,i=no.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=aa.workingColorSpace){return aa.workingToColorSpace(no.copy(this),t),e.r=no.r,e.g=no.g,e.b=no.b,e}getStyle(e=oi){aa.workingToColorSpace(no.copy(this),e);let t=no.r,n=no.g,r=no.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL($a),this.setHSL($a.h+e,$a.s+t,$a.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL($a),e.getHSL(eo);let n=Pi($a.h,eo.h,t),r=Pi($a.s,eo.s,t),i=Pi($a.l,eo.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},no=new W;W.NAMES=Qa;var ro=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new W(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},io=class extends Ja{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ja,this.environmentIntensity=1,this.environmentRotation=new ja,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},ao=new H,oo=new H,so=new H,co=new H,lo=new H,uo=new H,fo=new H,po=new H,mo=new H,ho=new H,go=new ga,_o=new ga,vo=new ga,yo=class e{constructor(e=new H,t=new H,n=new H){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),ao.subVectors(e,t),r.cross(ao);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){ao.subVectors(r,t),oo.subVectors(n,t),so.subVectors(e,t);let a=ao.dot(ao),o=ao.dot(oo),s=ao.dot(so),c=oo.dot(oo),l=oo.dot(so),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,co)!==null&&co.x>=0&&co.y>=0&&co.x+co.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,co)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,co.x),s.addScaledVector(a,co.y),s.addScaledVector(o,co.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return go.setScalar(0),_o.setScalar(0),vo.setScalar(0),go.fromBufferAttribute(e,t),_o.fromBufferAttribute(e,n),vo.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(go,i.x),a.addScaledVector(_o,i.y),a.addScaledVector(vo,i.z),a}static isFrontFacing(e,t,n,r){return ao.subVectors(n,t),oo.subVectors(e,t),ao.cross(oo).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ao.subVectors(this.c,this.b),oo.subVectors(this.a,this.b),ao.cross(oo).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;lo.subVectors(r,n),uo.subVectors(i,n),po.subVectors(e,n);let s=lo.dot(po),c=uo.dot(po);if(s<=0&&c<=0)return t.copy(n);mo.subVectors(e,r);let l=lo.dot(mo),u=uo.dot(mo);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(lo,a);ho.subVectors(e,i);let f=lo.dot(ho),p=uo.dot(ho);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(uo,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return fo.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(fo,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(lo,a).addScaledVector(uo,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},bo=class{constructor(e=new H(1/0,1/0,1/0),t=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(So.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(So.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=So.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,So):So.fromBufferAttribute(r,t),So.applyMatrix4(e.matrixWorld),this.expandByPoint(So);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Co.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Co.copy(e.boundingBox)),Co.applyMatrix4(e.matrixWorld),this.union(Co)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,So),So.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ao),jo.subVectors(this.max,Ao),wo.subVectors(e.a,Ao),To.subVectors(e.b,Ao),Eo.subVectors(e.c,Ao),Do.subVectors(To,wo),Oo.subVectors(Eo,To),ko.subVectors(wo,Eo);let t=[0,-Do.z,Do.y,0,-Oo.z,Oo.y,0,-ko.z,ko.y,Do.z,0,-Do.x,Oo.z,0,-Oo.x,ko.z,0,-ko.x,-Do.y,Do.x,0,-Oo.y,Oo.x,0,-ko.y,ko.x,0];return!Po(t,wo,To,Eo,jo)||(t=[1,0,0,0,1,0,0,0,1],!Po(t,wo,To,Eo,jo))?!1:(Mo.crossVectors(Do,Oo),t=[Mo.x,Mo.y,Mo.z],Po(t,wo,To,Eo,jo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,So).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(So).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(xo[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),xo[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),xo[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),xo[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),xo[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),xo[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),xo[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),xo[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(xo),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},xo=[new H,new H,new H,new H,new H,new H,new H,new H],So=new H,Co=new bo,wo=new H,To=new H,Eo=new H,Do=new H,Oo=new H,ko=new H,Ao=new H,jo=new H,Mo=new H,No=new H;function Po(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){No.fromArray(e,a);let o=i.x*Math.abs(No.x)+i.y*Math.abs(No.y)+i.z*Math.abs(No.z),s=t.dot(No),c=n.dot(No),l=r.dot(No);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Fo=new H,Io=new V,Lo=0,Ro=class extends wi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Lo++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=di,this.updateRanges=[],this.gpuType=Qn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Io.fromBufferAttribute(this,t),Io.applyMatrix3(e),this.setXY(t,Io.x,Io.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Fo.fromBufferAttribute(this,t),Fo.applyMatrix3(e),this.setXYZ(t,Fo.x,Fo.y,Fo.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Fo.fromBufferAttribute(this,t),Fo.applyMatrix4(e),this.setXYZ(t,Fo.x,Fo.y,Fo.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Fo.fromBufferAttribute(this,t),Fo.applyNormalMatrix(e),this.setXYZ(t,Fo.x,Fo.y,Fo.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Fo.fromBufferAttribute(this,t),Fo.transformDirection(e),this.setXYZ(t,Fo.x,Fo.y,Fo.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Xi(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Xi(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Xi(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Xi(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Xi(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array),r=Xi(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array),r=Xi(r,this.array),i=Xi(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},zo=class extends Ro{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Bo=class extends Ro{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Vo=class extends Ro{constructor(e,t,n){super(new Float32Array(e),t,n)}},Ho=new bo,Uo=new H,Wo=new H,Go=class{constructor(e=new H,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Ho.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Uo.subVectors(e,this.center);let t=Uo.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Uo,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Uo.copy(e.center).add(Wo)),this.expandByPoint(Uo.copy(e.center).sub(Wo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ko=0,qo=new xa,Jo=new Ja,Yo=new H,Xo=new bo,Zo=new bo,Qo=new H,$o=class e extends wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ko++}),this.uuid=ki(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(mi(e)?Bo:zo)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new U().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return qo.makeRotationFromQuaternion(e),this.applyMatrix4(qo),this}rotateX(e){return qo.makeRotationX(e),this.applyMatrix4(qo),this}rotateY(e){return qo.makeRotationY(e),this.applyMatrix4(qo),this}rotateZ(e){return qo.makeRotationZ(e),this.applyMatrix4(qo),this}translate(e,t,n){return qo.makeTranslation(e,t,n),this.applyMatrix4(qo),this}scale(e,t,n){return qo.makeScale(e,t,n),this.applyMatrix4(qo),this}lookAt(e){return Jo.lookAt(e),Jo.updateMatrix(),this.applyMatrix4(Jo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yo).negate(),this.translate(Yo.x,Yo.y,Yo.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Vo(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&z(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bo);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){B(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Xo.setFromBufferAttribute(n),this.morphTargetsRelative?(Qo.addVectors(this.boundingBox.min,Xo.min),this.boundingBox.expandByPoint(Qo),Qo.addVectors(this.boundingBox.max,Xo.max),this.boundingBox.expandByPoint(Qo)):(this.boundingBox.expandByPoint(Xo.min),this.boundingBox.expandByPoint(Xo.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&B(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Go);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){B(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new H,1/0);return}if(e){let n=this.boundingSphere.center;if(Xo.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Zo.setFromBufferAttribute(n),this.morphTargetsRelative?(Qo.addVectors(Xo.min,Zo.min),Xo.expandByPoint(Qo),Qo.addVectors(Xo.max,Zo.max),Xo.expandByPoint(Qo)):(Xo.expandByPoint(Zo.min),Xo.expandByPoint(Zo.max))}Xo.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Qo.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Qo));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Qo.fromBufferAttribute(a,t),o&&(Yo.fromBufferAttribute(e,t),Qo.add(Yo)),r=Math.max(r,n.distanceToSquared(Qo))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&B(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){B(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Ro(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new H,s[e]=new H;let c=new H,l=new H,u=new H,d=new V,f=new V,p=new V,m=new H,h=new H;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new H,y=new H,b=new H,x=new H;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Ro(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new H,i=new H,a=new H,o=new H,s=new H,c=new H,l=new H,u=new H;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Qo.fromBufferAttribute(e,t),Qo.normalize(),e.setXYZ(t,Qo.x,Qo.y,Qo.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ro(a,r,i)}if(this.index===null)return z(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},es=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=di,this.updateRanges=[],this.version=0,this.uuid=ki()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ki()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ki()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},ts=new H,ns=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)ts.fromBufferAttribute(this,t),ts.applyMatrix4(e),this.setXYZ(t,ts.x,ts.y,ts.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ts.fromBufferAttribute(this,t),ts.applyNormalMatrix(e),this.setXYZ(t,ts.x,ts.y,ts.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ts.fromBufferAttribute(this,t),ts.transformDirection(e),this.setXYZ(t,ts.x,ts.y,ts.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Xi(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Xi(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Xi(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Xi(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Xi(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Yi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Yi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Yi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Yi(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array),r=Xi(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Xi(t,this.array),n=Xi(n,this.array),r=Xi(r,this.array),i=Xi(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){yi(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ro(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){yi(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},rs=new H,is=new H,as=new U,os=class{constructor(e=new H(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=rs.subVectors(n,t).cross(is.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(rs),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||as.getNormalMatrix(e),r=this.coplanarPoint(rs).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},ss=0,cs=class extends wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ss++}),this.uuid=ki(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new W(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ui,this.stencilZFail=ui,this.stencilZPass=ui,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){z(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){z(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new W().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new os().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new V().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new V().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},ls=class extends cs{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new W(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},us,ds=new H,fs=new H,ps=new H,ms=new V,hs=new V,gs=new xa,_s=new H,vs=new H,ys=new H,bs=new V,xs=new V,Ss=new V,Cs=class extends Ja{constructor(e=new ls){if(super(),this.isSprite=!0,this.type=`Sprite`,us===void 0){us=new $o;let e=new es(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);us.setIndex([0,1,2,0,2,3]),us.setAttribute(`position`,new ns(e,3,0,!1)),us.setAttribute(`uv`,new ns(e,2,3,!1))}this.geometry=us,this.material=e,this.center=new V(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&B(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),fs.setFromMatrixScale(this.matrixWorld),gs.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ps.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&fs.multiplyScalar(-ps.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;ws(_s.set(-.5,-.5,0),ps,a,fs,r,i),ws(vs.set(.5,-.5,0),ps,a,fs,r,i),ws(ys.set(.5,.5,0),ps,a,fs,r,i),bs.set(0,0),xs.set(1,0),Ss.set(1,1);let o=e.ray.intersectTriangle(_s,vs,ys,!1,ds);if(o===null&&(ws(vs.set(-.5,.5,0),ps,a,fs,r,i),xs.set(0,1),o=e.ray.intersectTriangle(_s,ys,vs,!1,ds),o===null))return;let s=e.ray.origin.distanceTo(ds);s<e.near||s>e.far||t.push({distance:s,point:ds.clone(),uv:yo.getInterpolation(ds,_s,vs,ys,bs,xs,Ss,new V),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ws(e,t,n,r,i,a){ms.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?hs.copy(ms):(hs.x=a*ms.x-i*ms.y,hs.y=i*ms.x+a*ms.y),e.copy(t),e.x+=hs.x,e.y+=hs.y,e.applyMatrix4(gs)}var Ts=new H,Es=new H,Ds=new H,Os=new H,ks=class{constructor(e=new H,t=new H(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ts)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ts.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ts.copy(this.origin).addScaledVector(this.direction,t),Ts.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Es.copy(e).add(t).multiplyScalar(.5),Ds.copy(t).sub(e).normalize(),Os.copy(this.origin).sub(Es);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Ds),o=Os.dot(this.direction),s=-Os.dot(Ds),c=Os.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Es).addScaledVector(Ds,d),f}intersectSphere(e,t){if(e.radius<0)return null;Ts.subVectors(e.center,this.origin);let n=Ts.dot(this.direction),r=Ts.dot(Ts)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Ts)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,ne=C/w,re=1/w,ie=T-te*D,ae=E-ne*D,oe=O-te*A,se=k-ne*A,ce=j-te*M,le=ee-ne*M,ue=ce*se-le*oe,de=ie*le-ae*ce,fe=oe*ae-se*ie;if(r){if(ue<0||de<0||fe<0)return null}else if((ue<0||de<0||fe<0)&&(ue>0||de>0||fe>0))return null;let pe=ue+de+fe;if(pe===0)return null;let me=re*(ue*D+de*A+fe*M);return(pe>0?me<0:me>0)?null:this.at(me/pe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},As=class extends cs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new W(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ja,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},js=new xa,Ms=new ks,Ns=new Go,Ps=new H,Fs=new H,Is=new H,Ls=new H,Rs=new H,zs=new H,Bs=new H,Vs=new H,G=class extends Ja{constructor(e=new $o,t=new As){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){zs.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Rs.fromBufferAttribute(s,e),a?zs.addScaledVector(Rs,r):zs.addScaledVector(Rs.sub(t),r))}t.add(zs)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ns.copy(n.boundingSphere),Ns.applyMatrix4(i),Ms.copy(e.ray).recast(e.near),!(Ns.containsPoint(Ms.origin)===!1&&(Ms.intersectSphere(Ns,Ps)===null||Ms.origin.distanceToSquared(Ps)>(e.far-e.near)**2))&&(js.copy(i).invert(),Ms.copy(e.ray).applyMatrix4(js),(n.boundingBox===null||Ms.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Ms)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Us(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Us(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Us(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Us(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Hs(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Vs.copy(s),Vs.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Vs);return l<n.near||l>n.far?null:{distance:l,point:Vs.clone(),object:e}}function Us(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Fs),e.getVertexPosition(c,Is),e.getVertexPosition(l,Ls);let u=Hs(e,t,n,r,Fs,Is,Ls,Bs);if(u){let e=new H;yo.getBarycoord(Bs,Fs,Is,Ls,e),i&&(u.uv=yo.getInterpolatedAttribute(i,s,c,l,e,new V)),a&&(u.uv1=yo.getInterpolatedAttribute(a,s,c,l,e,new V)),o&&(u.normal=yo.getInterpolatedAttribute(o,s,c,l,e,new H),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new H,materialIndex:0};yo.getNormal(Fs,Is,Ls,t.normal),u.face=t,u.barycoord=e}return u}var Ws=class extends ha{constructor(e=null,t=1,n=1,r,i,a,o,s,c=Bn,l=Bn,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Gs=class extends Ro{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ks=new xa,qs=new xa,Js=[],Ys=new bo,Xs=new xa,Zs=new G,Qs=new Go,$s=class extends G{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Gs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Xs)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new bo),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),Ys.copy(e.boundingBox).applyMatrix4(Ks),this.boundingBox.union(Ys)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Go),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),Qs.copy(e.boundingSphere).applyMatrix4(Ks),this.boundingSphere.union(Qs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Zs.geometry=this.geometry,Zs.material=this.material,Zs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Qs.copy(this.boundingSphere),Qs.applyMatrix4(n),e.ray.intersectsSphere(Qs)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Ks),qs.multiplyMatrices(n,Ks),Zs.matrixWorld=qs,Zs.raycast(e,Js);for(let e=0,n=Js.length;e<n;e++){let n=Js[e];n.instanceId=i,n.object=this,t.push(n)}Js.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Gs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ws(new Float32Array(r*this.count),r,this.count,ur,Qn));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ec=new Go,tc=new V(.5,.5),nc=new H,rc=class{constructor(e=new os,t=new os,n=new os,r=new os,i=new os,a=new os){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=pi,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ec.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ec.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ec)}intersectsSprite(e){return ec.center.set(0,0,0),ec.radius=.7071067811865476+tc.distanceTo(e.center),ec.applyMatrix4(e.matrixWorld),this.intersectsSphere(ec)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(nc.x=r.normal.x>0?e.max.x:e.min.x,nc.y=r.normal.y>0?e.max.y:e.min.y,nc.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(nc)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ic=class extends cs{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new W(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ac=new H,oc=new H,sc=new xa,cc=new ks,lc=new Go,uc=new H,dc=new H,fc=class extends Ja{constructor(e=new $o,t=new ic){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)ac.fromBufferAttribute(t,e-1),oc.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=ac.distanceTo(oc);e.setAttribute(`lineDistance`,new Vo(n,1))}else z(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),lc.copy(n.boundingSphere),lc.applyMatrix4(r),lc.radius+=i,e.ray.intersectsSphere(lc)===!1)return;sc.copy(r).invert(),cc.copy(e.ray).applyMatrix4(sc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=pc(this,e,cc,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=pc(this,e,cc,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=pc(this,e,cc,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=pc(this,e,cc,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function pc(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(ac.fromBufferAttribute(s,i),oc.fromBufferAttribute(s,a),n.distanceSqToSegment(ac,oc,uc,dc)>r)return;uc.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(uc);if(!(c<t.near||c>t.far))return{distance:c,point:dc.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var mc=new H,hc=new H,gc=class extends fc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)mc.fromBufferAttribute(t,e),hc.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+mc.distanceTo(hc);e.setAttribute(`lineDistance`,new Vo(n,1))}else z(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},_c=class extends cs{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new W(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},vc=new xa,yc=new ks,bc=new Go,xc=new H,Sc=class extends Ja{constructor(e=new $o,t=new _c){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),bc.copy(n.boundingSphere),bc.applyMatrix4(r),bc.radius+=i,e.ray.intersectsSphere(bc)===!1)return;vc.copy(r).invert(),yc.copy(e.ray).applyMatrix4(vc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);xc.fromBufferAttribute(l,n),Cc(xc,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)xc.fromBufferAttribute(l,a),Cc(xc,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Cc(e,t,n,r,i,a,o){let s=yc.distanceSqToPoint(e);if(s<n){let n=new H;yc.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var wc=class extends ha{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Tc=class extends ha{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ec=class extends ha{constructor(e,t,n=Zn,r,i,a,o=Bn,s=Bn,c,l=cr,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new da(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Dc=class extends Ec{constructor(e,t=Zn,n=301,r,i,a=Bn,o=Bn,s,c=cr){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Oc=class extends ha{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},kc=class e extends $o{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Vo(c,3)),this.setAttribute(`normal`,new Vo(l,3)),this.setAttribute(`uv`,new Vo(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new H;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ac=class e extends $o{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new H,l=new V;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Vo(a,3)),this.setAttribute(`normal`,new Vo(o,3)),this.setAttribute(`uv`,new Vo(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},jc=class e extends $o{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Vo(u,3)),this.setAttribute(`normal`,new Vo(d,3)),this.setAttribute(`uv`,new Vo(f,2));function _(){let a=new H,_=new H,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new V,m=new H,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Mc=class e extends jc{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Nc=class e extends $o{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Vo(i,3)),this.setAttribute(`normal`,new Vo(i.slice(),3)),this.setAttribute(`uv`,new Vo(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new H,r=new H,i=new H;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new H;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new H;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new H,t=new H,n=new H,r=new H,o=new V,s=new V,c=new V;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Pc=class e extends Nc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Fc=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){z(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new V:new H);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new H,r=[],i=[],a=[],o=new H,s=new xa;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new H)}i[0]=new H,a[0]=new H;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(Ai(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(Ai(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ic=class extends Fc{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new V){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Lc=class extends Ic{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Rc(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var zc=new H,Bc=new H,Vc=new Rc,Hc=new Rc,Uc=new Rc,Wc=class extends Fc{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new H){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Bc.subVectors(r[0],r[1]).add(r[0]),c=Bc);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(zc.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=zc),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Vc.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Hc.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),Uc.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Vc.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Hc.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),Uc.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Vc.calc(s),Hc.calc(s),Uc.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new H().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Gc(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Kc(e,t){let n=1-e;return n*n*t}function qc(e,t){return 2*(1-e)*e*t}function Jc(e,t){return e*e*t}function Yc(e,t,n,r){return Kc(e,t)+qc(e,n)+Jc(e,r)}function Xc(e,t){let n=1-e;return n*n*n*t}function Zc(e,t){let n=1-e;return 3*n*n*e*t}function Qc(e,t){return 3*(1-e)*e*e*t}function $c(e,t){return e*e*e*t}function el(e,t,n,r,i){return Xc(e,t)+Zc(e,n)+Qc(e,r)+$c(e,i)}var tl=class extends Fc{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(el(e,r.x,i.x,a.x,o.x),el(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},nl=class extends Fc{constructor(e=new H,t=new H,n=new H,r=new H){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(el(e,r.x,i.x,a.x,o.x),el(e,r.y,i.y,a.y,o.y),el(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},rl=class extends Fc{constructor(e=new V,t=new V){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new V){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},il=class extends Fc{constructor(e=new H,t=new H){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new H){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new H){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},al=class extends Fc{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Yc(e,r.x,i.x,a.x),Yc(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ol=class extends Fc{constructor(e=new H,t=new H,n=new H){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Yc(e,r.x,i.x,a.x),Yc(e,r.y,i.y,a.y),Yc(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},sl=class extends Fc{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new V){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Gc(o,s.x,c.x,l.x,u.x),Gc(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new V().fromArray(n))}return this}},cl=Object.freeze({__proto__:null,ArcCurve:Lc,CatmullRomCurve3:Wc,CubicBezierCurve:tl,CubicBezierCurve3:nl,EllipseCurve:Ic,LineCurve:rl,LineCurve3:il,QuadraticBezierCurve:al,QuadraticBezierCurve3:ol,SplineCurve:sl}),ll=class extends Fc{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new cl[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new cl[n.type]().fromJSON(n))}return this}},ul=class extends ll{constructor(e){super(),this.type=`Path`,this.currentPoint=new V,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new rl(this.currentPoint.clone(),new V(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new al(this.currentPoint.clone(),new V(e,t),new V(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new tl(this.currentPoint.clone(),new V(e,t),new V(n,r),new V(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new sl([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Ic(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},dl=class extends ul{constructor(e){super(e),this.uuid=ki(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new ul().fromJSON(n))}return this}};function fl(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=pl(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=bl(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return hl(a,o,n,s,c,l,0),o}function pl(e,t,n,r,i){let a;if(i===Wl(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Vl(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Vl(i/r|0,e[i],e[i+1],a);return a&&Nl(a,a.next)&&(Hl(a),a=a.next),a}function ml(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Nl(n,n.next)||Ml(n.prev,n,n.next)===0)){if(Hl(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function hl(e,t,n,r,i,a,o){if(!e)return;!o&&a&&Tl(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?_l(e,r,i,a):gl(e)){t.push(c.i,e.i,l.i),Hl(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=vl(ml(e),t),hl(e,t,n,r,i,a,2)):o===2&&yl(e,t,n,r,i,a):hl(ml(e),t,n,r,i,a,1);break}}}function gl(e){let t=e.prev,n=e,r=e.next;if(Ml(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Al(i,s,a,c,o,l,m.x,m.y)&&Ml(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function _l(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Ml(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=Dl(p,m,t,n,r),v=Dl(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Al(s,u,c,d,l,f,y.x,y.y)&&Ml(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Al(s,u,c,d,l,f,b.x,b.y)&&Ml(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Al(s,u,c,d,l,f,y.x,y.y)&&Ml(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Al(s,u,c,d,l,f,b.x,b.y)&&Ml(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function vl(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Nl(r,i)&&Pl(r,n,n.next,i)&&Rl(r,i)&&Rl(i,r)&&(t.push(r.i,n.i,i.i),Hl(n),Hl(n.next),n=e=i),n=n.next}while(n!==e);return ml(n)}function yl(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&jl(o,e)){let s=Bl(o,e);o=ml(o,o.next),s=ml(s,s.next),hl(o,t,n,r,i,a,0),hl(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function bl(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=pl(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Ol(o))}i.sort(xl);for(let e=0;e<i.length;e++)n=Sl(i[e],n);return n}function xl(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Sl(e,t){let n=Cl(e,t);if(!n)return t;let r=Bl(n,e);return ml(r,r.next),ml(n,n.next)}function Cl(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Nl(e,n))return n;do{if(Nl(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&kl(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Rl(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&wl(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function wl(e,t){return Ml(e.prev,e,t.prev)<0&&Ml(t.next,e,e.next)<0}function Tl(e,t,n,r){let i=e;do i.z===0&&(i.z=Dl(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,El(i)}function El(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function Dl(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Ol(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function kl(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Al(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&kl(e,t,n,r,i,a,o,s)}function jl(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Ll(e,t)&&(Rl(e,t)&&Rl(t,e)&&zl(e,t)&&(Ml(e.prev,e,t.prev)||Ml(e,t.prev,t))||Nl(e,t)&&Ml(e.prev,e,e.next)>0&&Ml(t.prev,t,t.next)>0)}function Ml(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Nl(e,t){return e.x===t.x&&e.y===t.y}function Pl(e,t,n,r){let i=Il(Ml(e,t,n)),a=Il(Ml(e,t,r)),o=Il(Ml(n,r,e)),s=Il(Ml(n,r,t));return!!(i!==a&&o!==s||i===0&&Fl(e,n,t)||a===0&&Fl(e,r,t)||o===0&&Fl(n,e,r)||s===0&&Fl(n,t,r))}function Fl(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Il(e){return e>0?1:e<0?-1:0}function Ll(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Pl(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Rl(e,t){return Ml(e.prev,e,e.next)<0?Ml(e,t,e.next)>=0&&Ml(e,e.prev,t)>=0:Ml(e,t,e.prev)<0||Ml(e,e.next,t)<0}function zl(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Bl(e,t){let n=Ul(e.i,e.x,e.y),r=Ul(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Vl(e,t,n,r){let i=Ul(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function Hl(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Ul(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Wl(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Gl=class{static triangulate(e,t,n=2){return fl(e,t,n)}},Kl=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];ql(e),Jl(n,e);let a=e.length;t.forEach(ql);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Jl(n,t[e]);let o=Gl.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function ql(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Jl(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Yl=class e extends Nc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Xl=class e extends $o{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Vo(p,3)),this.setAttribute(`normal`,new Vo(m,3)),this.setAttribute(`uv`,new Vo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Zl=class e extends $o{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new H,p=new V;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Vo(s,3)),this.setAttribute(`normal`,new Vo(c,3)),this.setAttribute(`uv`,new Vo(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ql=class e extends $o{constructor(e=new dl([new V(0,.5),new V(-.5,-.5),new V(.5,-.5)]),t=12){super(),this.type=`ShapeGeometry`,this.parameters={shapes:e,curveSegments:t};let n=[],r=[],i=[],a=[],o=0,s=0;if(Array.isArray(e)===!1)c(e);else for(let t=0;t<e.length;t++)c(e[t]),this.addGroup(o,s,t),o+=s,s=0;this.setIndex(n),this.setAttribute(`position`,new Vo(r,3)),this.setAttribute(`normal`,new Vo(i,3)),this.setAttribute(`uv`,new Vo(a,2));function c(e){let o=r.length/3,c=e.extractPoints(t),l=c.shape,u=c.holes;Kl.isClockWise(l)===!1&&(l=l.reverse());for(let e=0,t=u.length;e<t;e++){let t=u[e];Kl.isClockWise(t)===!0&&(u[e]=t.reverse())}let d=Kl.triangulateShape(l,u);for(let e=0,t=u.length;e<t;e++){let t=u[e];l=l.concat(t)}for(let e=0,t=l.length;e<t;e++){let t=l[e];r.push(t.x,t.y,0),i.push(0,0,1),a.push(t.x,t.y)}for(let e=0,t=d.length;e<t;e++){let t=d[e],r=t[0]+o,i=t[1]+o,a=t[2]+o;n.push(r,i,a),s+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return $l(t,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}return new e(r,t.curveSegments)}};function $l(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,r=e.length;n<r;n++){let r=e[n];t.shapes.push(r.uuid)}else t.shapes.push(e.uuid);return t}var eu=class e extends $o{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new H,d=new H,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Vo(p,3)),this.setAttribute(`normal`,new Vo(m,3)),this.setAttribute(`uv`,new Vo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},tu=class e extends $o{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new H,f=new H,p=new H;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Vo(c,3)),this.setAttribute(`normal`,new Vo(l,3)),this.setAttribute(`uv`,new Vo(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function nu(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(iu(i))i.isRenderTargetTexture?(z(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(iu(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function ru(e){let t={};for(let n=0;n<e.length;n++){let r=nu(e[n]);for(let e in r)t[e]=r[e]}return t}function iu(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function au(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ou(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:aa.workingColorSpace}var su={clone:nu,merge:ru},cu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,lu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,uu=class extends cs{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=cu,this.fragmentShader=lu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=nu(e.uniforms),this.uniformsGroups=au(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new W().setHex(r.value);break;case`v2`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new ga().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new U().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new xa().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},du=class extends uu{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},fu=class extends cs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new W(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new W(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new V(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ja,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},pu=class extends cs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=ii,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},mu=class extends cs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function hu(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function gu(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var _u=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},vu=class extends _u{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ti,endingEnd:ti}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case ni:i=e,o=2*t-n;break;case ri:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case ni:a=e,s=2*n-t;break;case ri:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},yu=class extends _u{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},bu=class extends _u{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},xu=class extends _u{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=wu(n,t,g,y,r);i[p]=Su(x,o,_,b,m)}return i}};function Su(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Cu(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function wu(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Su(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Cu(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Tu=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=hu(t,this.TimeBufferType),this.values=hu(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:hu(e.times,Array),values:hu(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),gu(e.settings)&&(n.settings={inTangents:hu(e.settings.inTangents,Array),outTangents:hu(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new bu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new yu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new vu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new xu(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Zr:t=this.InterpolantFactoryMethodDiscrete;break;case Qr:t=this.InterpolantFactoryMethodLinear;break;case $r:t=this.InterpolantFactoryMethodSmooth;break;case ei:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return z(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Zr;case this.InterpolantFactoryMethodLinear:return Qr;case this.InterpolantFactoryMethodSmooth:return $r;case this.InterpolantFactoryMethodBezier:return ei}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;gu(this.settings)&&(Eu(this.settings.inTangents,e),Eu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(B(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(B(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){B(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){B(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&hi(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){B(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===$r,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,gu(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Eu(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Tu.prototype.ValueTypeName=``,Tu.prototype.TimeBufferType=Float32Array,Tu.prototype.ValueBufferType=Float32Array,Tu.prototype.DefaultInterpolation=Qr;var Du=class extends Tu{constructor(e,t,n){super(e,t,n)}};Du.prototype.ValueTypeName=`bool`,Du.prototype.ValueBufferType=Array,Du.prototype.DefaultInterpolation=Zr,Du.prototype.InterpolantFactoryMethodLinear=void 0,Du.prototype.InterpolantFactoryMethodSmooth=void 0;var Ou=class extends Tu{constructor(e,t,n,r){super(e,t,n,r)}};Ou.prototype.ValueTypeName=`color`;var ku=class extends Tu{constructor(e,t,n,r){super(e,t,n,r)}};ku.prototype.ValueTypeName=`number`;var Au=class extends _u{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Qi.slerpFlat(i,0,a,c-o,a,c,s);return i}},ju=class extends Tu{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Au(this.times,this.values,this.getValueSize(),e)}};ju.prototype.ValueTypeName=`quaternion`,ju.prototype.InterpolantFactoryMethodSmooth=void 0;var Mu=class extends Tu{constructor(e,t,n){super(e,t,n)}};Mu.prototype.ValueTypeName=`string`,Mu.prototype.ValueBufferType=Array,Mu.prototype.DefaultInterpolation=Zr,Mu.prototype.InterpolantFactoryMethodLinear=void 0,Mu.prototype.InterpolantFactoryMethodSmooth=void 0;var Nu=class extends Tu{constructor(e,t,n,r){super(e,t,n,r)}};Nu.prototype.ValueTypeName=`vector`;var Pu=class extends Ja{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new W(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Fu=class extends Pu{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Ja.DEFAULT_UP),this.updateMatrix(),this.groundColor=new W(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Iu=new xa,Lu=new H,Ru=new H,zu=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new V(512,512),this.mapType=Kn,this.map=null,this.mapPass=null,this.matrix=new xa,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rc,this._frameExtents=new V(1,1),this._viewportCount=1,this._viewports=[new ga(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Lu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lu),Ru.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ru),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Iu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Iu,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Iu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Bu=new H,Vu=new Qi,Hu=new H,Uu=class extends Ja{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new xa,this.projectionMatrix=new xa,this.projectionMatrixInverse=new xa,this.coordinateSystem=pi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Bu,Vu,Hu),Hu.x===1&&Hu.y===1&&Hu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Bu,Vu,Hu.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Bu,Vu,Hu),Hu.x===1&&Hu.y===1&&Hu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Bu,Vu,Hu.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Wu=new H,Gu=new V,Ku=new V,qu=class extends Uu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Oi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Di*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Oi*2*Math.atan(Math.tan(Di*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Wu.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Wu.x,Wu.y).multiplyScalar(-e/Wu.z),Wu.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Wu.x,Wu.y).multiplyScalar(-e/Wu.z)}getViewSize(e,t){return this.getViewBounds(e,Gu,Ku),t.subVectors(Ku,Gu)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Di*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ju=class extends Uu{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Yu=class extends zu{constructor(){super(new Ju(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Xu=class extends Pu{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Ja.DEFAULT_UP),this.updateMatrix(),this.target=new Ja,this.shadow=new Yu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Zu=-90,Qu=1,$u=class extends Ja{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new qu(Zu,Qu,e,t);r.layers=this.layers,this.add(r);let i=new qu(Zu,Qu,e,t);i.layers=this.layers,this.add(i);let a=new qu(Zu,Qu,e,t);a.layers=this.layers,this.add(a);let o=new qu(Zu,Qu,e,t);o.layers=this.layers,this.add(o);let s=new qu(Zu,Qu,e,t);s.layers=this.layers,this.add(s);let c=new qu(Zu,Qu,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ed=class extends qu{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},td=`\\[\\]\\.:\\/`,nd=RegExp(`[\\[\\]\\.:\\/]`,`g`),rd=`[^\\[\\]\\.:\\/]`,id=`[^`+td.replace(`\\.`,``)+`]`,ad=`((?:WC+[\\/:])*)`.replace(`WC`,rd),od=`(WCOD+)?`.replace(`WCOD`,id),sd=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,rd),cd=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,rd),ld=RegExp(`^`+ad+od+sd+cd+`$`),ud=[`material`,`materials`,`bones`,`map`],dd=class{constructor(e,t,n){let r=n||fd.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},fd=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(nd,``)}static parseTrackName(e){let t=ld.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);ud.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){z(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){B(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){B(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){B(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){B(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){B(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){B(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){B(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;B(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){B(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){B(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};fd.Composite=dd,fd.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},fd.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},fd.prototype.GetterByBindingType=[fd.prototype._getValue_direct,fd.prototype._getValue_array,fd.prototype._getValue_arrayElement,fd.prototype._getValue_toArray],fd.prototype.SetterByBindingTypeAndVersioning=[[fd.prototype._setValue_direct,fd.prototype._setValue_direct_setNeedsUpdate,fd.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[fd.prototype._setValue_array,fd.prototype._setValue_array_setNeedsUpdate,fd.prototype._setValue_array_setMatrixWorldNeedsUpdate],[fd.prototype._setValue_arrayElement,fd.prototype._setValue_arrayElement_setNeedsUpdate,fd.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[fd.prototype._setValue_fromArray,fd.prototype._setValue_fromArray_setNeedsUpdate,fd.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var pd=new xa,md=class{constructor(e,t,n=0,r=1/0){this.ray=new ks(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Ma,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):B(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return pd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(pd),this}intersectObject(e,t=!0,n=[]){return gd(e,this,n,t),n.sort(hd),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)gd(e[r],this,n,t);return n.sort(hd),n}};function hd(e,t){return e.distance-t.distance}function gd(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)gd(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function _d(e,t,n,r){let i=vd(r);switch(n){case ar:return e*t;case ur:return e*t/i.components*i.byteLength;case dr:return e*t/i.components*i.byteLength;case fr:return e*t*2/i.components*i.byteLength;case pr:return e*t*2/i.components*i.byteLength;case or:return e*t*3/i.components*i.byteLength;case sr:return e*t*4/i.components*i.byteLength;case mr:return e*t*4/i.components*i.byteLength;case hr:case gr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case _r:case vr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case br:case Sr:return Math.max(e,16)*Math.max(t,8)/4;case yr:case xr:return Math.max(e,8)*Math.max(t,8)/2;case Cr:case wr:case Er:case Dr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Tr:case Or:case kr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ar:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case jr:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Mr:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Nr:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Pr:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Fr:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Ir:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Lr:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Rr:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case zr:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Br:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Vr:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Hr:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ur:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Wr:case Gr:case Kr:return Math.ceil(e/4)*Math.ceil(t/4)*16;case qr:case Jr:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Yr:case Xr:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function vd(e){switch(e){case Kn:case qn:return{byteLength:1,components:1};case Yn:case Jn:case $n:return{byteLength:2,components:1};case er:case tr:return{byteLength:2,components:4};case Zn:case Xn:case Qn:return{byteLength:4,components:1};case rr:case ir:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?z(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function yd(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function bd(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var xd={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},K={common:{diffuse:{value:new W(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new U}},envmap:{envMap:{value:null},envMapRotation:{value:new U},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new U}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new U}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new U},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new U},normalScale:{value:new V(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new U},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new U}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new U}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new U}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new W(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new H},probesMax:{value:new H},probesResolution:{value:new H}},points:{diffuse:{value:new W(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0},uvTransform:{value:new U}},sprite:{diffuse:{value:new W(16777215)},opacity:{value:1},center:{value:new V(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}}},Sd={basic:{uniforms:ru([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.fog]),vertexShader:xd.meshbasic_vert,fragmentShader:xd.meshbasic_frag},lambert:{uniforms:ru([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new W(0)},envMapIntensity:{value:1}}]),vertexShader:xd.meshlambert_vert,fragmentShader:xd.meshlambert_frag},phong:{uniforms:ru([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new W(0)},specular:{value:new W(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:xd.meshphong_vert,fragmentShader:xd.meshphong_frag},standard:{uniforms:ru([K.common,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.roughnessmap,K.metalnessmap,K.fog,K.lights,{emissive:{value:new W(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:xd.meshphysical_vert,fragmentShader:xd.meshphysical_frag},toon:{uniforms:ru([K.common,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.gradientmap,K.fog,K.lights,{emissive:{value:new W(0)}}]),vertexShader:xd.meshtoon_vert,fragmentShader:xd.meshtoon_frag},matcap:{uniforms:ru([K.common,K.bumpmap,K.normalmap,K.displacementmap,K.fog,{matcap:{value:null}}]),vertexShader:xd.meshmatcap_vert,fragmentShader:xd.meshmatcap_frag},points:{uniforms:ru([K.points,K.fog]),vertexShader:xd.points_vert,fragmentShader:xd.points_frag},dashed:{uniforms:ru([K.common,K.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:xd.linedashed_vert,fragmentShader:xd.linedashed_frag},depth:{uniforms:ru([K.common,K.displacementmap]),vertexShader:xd.depth_vert,fragmentShader:xd.depth_frag},normal:{uniforms:ru([K.common,K.bumpmap,K.normalmap,K.displacementmap,{opacity:{value:1}}]),vertexShader:xd.meshnormal_vert,fragmentShader:xd.meshnormal_frag},sprite:{uniforms:ru([K.sprite,K.fog]),vertexShader:xd.sprite_vert,fragmentShader:xd.sprite_frag},background:{uniforms:{uvTransform:{value:new U},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:xd.background_vert,fragmentShader:xd.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new U}},vertexShader:xd.backgroundCube_vert,fragmentShader:xd.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:xd.cube_vert,fragmentShader:xd.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:xd.equirect_vert,fragmentShader:xd.equirect_frag},distance:{uniforms:ru([K.common,K.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:xd.distance_vert,fragmentShader:xd.distance_frag},shadow:{uniforms:ru([K.lights,K.fog,{color:{value:new W(0)},opacity:{value:1}}]),vertexShader:xd.shadow_vert,fragmentShader:xd.shadow_frag}};Sd.physical={uniforms:ru([Sd.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new U},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new U},clearcoatNormalScale:{value:new V(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new U},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new U},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new U},sheen:{value:0},sheenColor:{value:new W(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new U},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new U},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new U},transmissionSamplerSize:{value:new V},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new U},attenuationDistance:{value:0},attenuationColor:{value:new W(0)},specularColor:{value:new W(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new U},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new U},anisotropyVector:{value:new V},anisotropyMap:{value:null},anisotropyMapTransform:{value:new U}}]),vertexShader:xd.meshphysical_vert,fragmentShader:xd.meshphysical_frag};var Cd={r:0,b:0,g:0},wd=new xa,Td=new U;Td.set(-1,0,0,0,1,0,0,0,1);function Ed(e,t,n,r,i,a){let o=new W(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new G(new kc(1,1,1),new uu({name:`BackgroundCubeMaterial`,uniforms:nu(Sd.backgroundCube.uniforms),vertexShader:Sd.backgroundCube.vertexShader,fragmentShader:Sd.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(wd.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Td),l.material.toneMapped=aa.getTransfer(i.colorSpace)!==li,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new G(new Xl(2,2),new uu({name:`BackgroundMaterial`,uniforms:nu(Sd.background.uniforms),vertexShader:Sd.background.vertexShader,fragmentShader:Sd.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=aa.getTransfer(i.colorSpace)!==li,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Cd,ou(e)),n.buffers.color.setClear(Cd.r,Cd.g,Cd.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Dd(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Od(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function kd(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(z(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&z(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Ad(e){let t=this,n=null,r=0,i=!1,a=!1,o=new os,s=new U,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var jd=4,Md=6,Nd=20,Pd=256,Fd=new Ju,Id=new W,Ld=null,Rd=0,zd=0,Bd=!1,Vd=new H,Hd=new H,Ud=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Vd}=i;Ld=this._renderer.getRenderTarget(),Rd=this._renderer.getActiveCubeFace(),zd=this._renderer.getActiveMipmapLevel(),Bd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Xd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Yd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ld,Rd,zd),this._renderer.xr.enabled=Bd,e.scissorTest=!1,Kd(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ld=this._renderer.getRenderTarget(),Rd=this._renderer.getActiveCubeFace(),zd=this._renderer.getActiveMipmapLevel(),Bd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Un,minFilter:Un,generateMipmaps:!1,type:$n,format:sr,colorSpace:si,depthBuffer:!1},r=Gd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Wd(r)),this._blurMaterial=Jd(r,e,t),this._ggxMaterial=qd(r,e,t)}return r}_compileMaterial(e){let t=new G(new $o,e);this._renderer.compile(t,Fd)}_sceneToCubeUV(e,t,n,r,i){let a=new qu(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Id),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new G(new kc,new As({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Id),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Kd(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Xd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Yd());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Kd(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Fd)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-jd?n-d+jd:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Kd(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Fd),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Kd(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Fd)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Kd(t,3*l*(r>this._lodMax-jd?r-this._lodMax+jd:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Fd)}};function Wd(e){let t=[],n=[],r=e,i=e-jd+1+Md;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?Hd.set(1,r,n):e===1?Hd.set(-n,1,-r):e===2?Hd.set(-n,r,1):e===3?Hd.set(-1,r,-n):e===4?Hd.set(-n,-1,r):Hd.set(n,r,-1),Hd.toArray(l,(e*6+t)*3)}}let u=new $o;u.setAttribute(`position`,new Ro(c,3)),u.setAttribute(`outputDirection`,new Ro(l,3)),n.push(new G(u,null)),r>jd&&r--}return{lodMeshes:n,sizeLods:t}}function Gd(e,t,n){let r=new va(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Kd(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function qd(e,t,n){return new uu({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Pd,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Zd(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Jd(e,t,n){return new uu({name:`SphericalGaussianBlur`,defines:{SAMPLES:Nd,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Zd(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Yd(){return new uu({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Zd(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Xd(){return new uu({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Zd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Zd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Qd=class extends va{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new wc(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new kc(5,5,5),i=new uu({name:`CubemapFromEquirect`,uniforms:nu(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new G(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=Un),new $u(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function $d(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Qd(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Ud(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Ud(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function ef(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&xi(`WebGLRenderer: `+e+` extension not supported.`),t}}}function tf(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Bo:zo)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function nf(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function rf(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:B(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function af(e,t,n){let r=new WeakMap,i=new ga;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new ya(h,p,m,u);g.type=Qn,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new V(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function of(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var sf={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function cf(e,t,n,r,i,a){let o=new va(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new $o;l.setAttribute(`position`,new Vo([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Vo([0,2,0,0,2,0],2));let u=new du({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new G(l,u),f=new Ju(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new va(t,n,{type:$n,depthBuffer:!1,stencilBuffer:!1}),c=new va(t,n,{type:$n,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},aa.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=sf[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var lf=new ha,uf=new Ec(1,1),df=new ya,ff=new ba,pf=new wc,mf=[],hf=[],gf=new Float32Array(16),_f=new Float32Array(9),vf=new Float32Array(4);function yf(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=mf[i];if(a===void 0&&(a=new Float32Array(i),mf[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function bf(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function xf(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Sf(e,t){let n=hf[t];n===void 0&&(n=new Int32Array(t),hf[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Cf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function wf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bf(n,t))return;e.uniform2fv(this.addr,t),xf(n,t)}}function Tf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(bf(n,t))return;e.uniform3fv(this.addr,t),xf(n,t)}}function Ef(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bf(n,t))return;e.uniform4fv(this.addr,t),xf(n,t)}}function Df(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bf(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),xf(n,t)}else{if(bf(n,r))return;vf.set(r),e.uniformMatrix2fv(this.addr,!1,vf),xf(n,r)}}function Of(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bf(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),xf(n,t)}else{if(bf(n,r))return;_f.set(r),e.uniformMatrix3fv(this.addr,!1,_f),xf(n,r)}}function kf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bf(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),xf(n,t)}else{if(bf(n,r))return;gf.set(r),e.uniformMatrix4fv(this.addr,!1,gf),xf(n,r)}}function Af(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function jf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bf(n,t))return;e.uniform2iv(this.addr,t),xf(n,t)}}function Mf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(bf(n,t))return;e.uniform3iv(this.addr,t),xf(n,t)}}function Nf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bf(n,t))return;e.uniform4iv(this.addr,t),xf(n,t)}}function Pf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Ff(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bf(n,t))return;e.uniform2uiv(this.addr,t),xf(n,t)}}function If(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(bf(n,t))return;e.uniform3uiv(this.addr,t),xf(n,t)}}function Lf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bf(n,t))return;e.uniform4uiv(this.addr,t),xf(n,t)}}function Rf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(uf.compareFunction=n.isReversedDepthBuffer()?518:515,a=uf):a=lf,n.setTexture2D(t||a,i)}function zf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||ff,i)}function Bf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||pf,i)}function Vf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||df,i)}function Hf(e){switch(e){case 5126:return Cf;case 35664:return wf;case 35665:return Tf;case 35666:return Ef;case 35674:return Df;case 35675:return Of;case 35676:return kf;case 5124:case 35670:return Af;case 35667:case 35671:return jf;case 35668:case 35672:return Mf;case 35669:case 35673:return Nf;case 5125:return Pf;case 36294:return Ff;case 36295:return If;case 36296:return Lf;case 35678:case 36198:case 36298:case 36306:case 35682:return Rf;case 35679:case 36299:case 36307:return zf;case 35680:case 36300:case 36308:case 36293:return Bf;case 36289:case 36303:case 36311:case 36292:return Vf}}function Uf(e,t){e.uniform1fv(this.addr,t)}function Wf(e,t){let n=yf(t,this.size,2);e.uniform2fv(this.addr,n)}function Gf(e,t){let n=yf(t,this.size,3);e.uniform3fv(this.addr,n)}function Kf(e,t){let n=yf(t,this.size,4);e.uniform4fv(this.addr,n)}function qf(e,t){let n=yf(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Jf(e,t){let n=yf(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Yf(e,t){let n=yf(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Xf(e,t){e.uniform1iv(this.addr,t)}function Zf(e,t){e.uniform2iv(this.addr,t)}function Qf(e,t){e.uniform3iv(this.addr,t)}function $f(e,t){e.uniform4iv(this.addr,t)}function ep(e,t){e.uniform1uiv(this.addr,t)}function tp(e,t){e.uniform2uiv(this.addr,t)}function np(e,t){e.uniform3uiv(this.addr,t)}function rp(e,t){e.uniform4uiv(this.addr,t)}function ip(e,t,n){let r=this.cache,i=t.length,a=Sf(n,i);bf(r,a)||(e.uniform1iv(this.addr,a),xf(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?uf:lf;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function ap(e,t,n){let r=this.cache,i=t.length,a=Sf(n,i);bf(r,a)||(e.uniform1iv(this.addr,a),xf(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||ff,a[e])}function op(e,t,n){let r=this.cache,i=t.length,a=Sf(n,i);bf(r,a)||(e.uniform1iv(this.addr,a),xf(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||pf,a[e])}function sp(e,t,n){let r=this.cache,i=t.length,a=Sf(n,i);bf(r,a)||(e.uniform1iv(this.addr,a),xf(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||df,a[e])}function cp(e){switch(e){case 5126:return Uf;case 35664:return Wf;case 35665:return Gf;case 35666:return Kf;case 35674:return qf;case 35675:return Jf;case 35676:return Yf;case 5124:case 35670:return Xf;case 35667:case 35671:return Zf;case 35668:case 35672:return Qf;case 35669:case 35673:return $f;case 5125:return ep;case 36294:return tp;case 36295:return np;case 36296:return rp;case 35678:case 36198:case 36298:case 36306:case 35682:return ip;case 35679:case 36299:case 36307:return ap;case 35680:case 36300:case 36308:case 36293:return op;case 36289:case 36303:case 36311:case 36292:return sp}}var lp=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Hf(t.type)}},up=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=cp(t.type)}},dp=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},fp=/(\w+)(\])?(\[|\.)?/g;function pp(e,t){e.seq.push(t),e.map[t.id]=t}function mp(e,t,n){let r=e.name,i=r.length;for(fp.lastIndex=0;;){let a=fp.exec(r),o=fp.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){pp(n,l===void 0?new lp(s,e,t):new up(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new dp(s),pp(n,e)),n=e}}}var hp=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);mp(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function gp(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var _p=37297,vp=0;function yp(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var bp=new U;function xp(e){aa._getMatrix(bp,aa.workingColorSpace,e);let t=`mat3( ${bp.elements.map(e=>e.toFixed(4))} )`;switch(aa.getTransfer(e)){case ci:return[t,`LinearTransferOETF`];case li:return[t,`sRGBTransferOETF`];default:return z(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Sp(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+yp(e.getShaderSource(t),r)}return i}function Cp(e,t){let n=xp(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var wp={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Tp(e,t){let n=wp[t];return n===void 0?(z(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Ep=new H;function Dp(){return aa.getLuminanceCoefficients(Ep),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Ep.x.toFixed(4)}, ${Ep.y.toFixed(4)}, ${Ep.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Op(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(jp).join(`
`)}function kp(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Ap(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function jp(e){return e!==``}function Mp(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Np(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Pp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fp(e){return e.replace(Pp,Lp)}var Ip=new Map;function Lp(e,t){let n=xd[t];if(n===void 0){let e=Ip.get(t);if(e!==void 0)n=xd[e],z(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Fp(n)}var Rp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function zp(e){return e.replace(Rp,Bp)}function Bp(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Vp(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var Hp={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Up(e){return Hp[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Wp={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function Gp(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Wp[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Kp={302:`ENVMAP_MODE_REFRACTION`};function qp(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Kp[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Jp={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Yp(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Jp[e.combine]||`ENVMAP_BLENDING_NONE`}function Xp(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Zp(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Up(n),l=Gp(n),u=qp(n),d=Yp(n),f=Xp(n),p=Op(n),m=kp(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(jp).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(jp).join(`
`),_.length>0&&(_+=`
`)):(g=[Vp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(jp).join(`
`),_=[Vp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:xd.tonemapping_pars_fragment,n.toneMapping===0?``:Tp(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,xd.colorspace_pars_fragment,Cp(`linearToOutputTexel`,n.outputColorSpace),Dp(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(jp).join(`
`)),o=Fp(o),o=Mp(o,n),o=Np(o,n),s=Fp(s),s=Mp(s,n),s=Np(s,n),o=zp(o),s=zp(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=gp(i,i.VERTEX_SHADER,y),S=gp(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Sp(i,x,`vertex`),n=Sp(i,S,`fragment`);B(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):z(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new hp(i,h),T=Ap(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,_p)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=vp++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Qp=0,$p=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new em(e),t.set(e,n)),n}},em=class{constructor(e){this.id=Qp++,this.code=e,this.usedTimes=0}};function tm(e){return e===1030||e===37490||e===36285}function nm(e,t,n,r,i,a){let o=new Ma,s=new $p,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&z(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Sd[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),M=h.isInstancedMesh===!0,te=h.isBatchedMesh===!0,ne=!!i.map,re=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,de=!!i.metalnessMap,fe=!!i.roughnessMap,pe=i.anisotropy>0,me=i.clearcoat>0,he=i.dispersion>0,ge=i.retroreflectivity>0,_e=i.iridescence>0,ve=i.sheen>0,ye=i.transmission>0,be=pe&&!!i.anisotropyMap,xe=me&&!!i.clearcoatMap,Se=me&&!!i.clearcoatNormalMap,Ce=me&&!!i.clearcoatRoughnessMap,we=_e&&!!i.iridescenceMap,N=_e&&!!i.iridescenceThicknessMap,Te=ve&&!!i.sheenColorMap,Ee=ve&&!!i.sheenRoughnessMap,De=!!i.specularMap,P=!!i.specularColorMap,Oe=!!i.specularIntensityMap,F=ye&&!!i.transmissionMap,I=ye&&!!i.thicknessMap,ke=!!i.gradientMap,Ae=!!i.alphaMap,je=i.alphaTest>0,Me=!!i.alphaHash,Ne=!!i.extensions,Pe=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Pe=e.toneMapping);let Fe={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:te,batchingColor:te&&h._colorsTexture!==null,instancing:M,instancingColor:M&&h.instanceColor!==null,instancingMorph:M&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:aa.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ne,matcap:re,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&tm(i.normalMap.format),metalnessMap:de,roughnessMap:fe,anisotropy:pe,anisotropyMap:be,clearcoat:me,clearcoatMap:xe,clearcoatNormalMap:Se,clearcoatRoughnessMap:Ce,dispersion:he,retroreflection:ge,iridescence:_e,iridescenceMap:we,iridescenceThicknessMap:N,sheen:ve,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:P,specularIntensityMap:Oe,transmission:ye,transmissionMap:F,thicknessMap:I,gradientMap:ke,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ae,alphaTest:je,alphaHash:Me,combine:i.combine,mapUv:ne&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:de&&m(i.metalnessMap.channel),roughnessMapUv:fe&&m(i.roughnessMap.channel),anisotropyMapUv:be&&m(i.anisotropyMap.channel),clearcoatMapUv:xe&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:Se&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:N&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(i.sheenRoughnessMap.channel),specularMapUv:De&&m(i.specularMap.channel),specularColorMapUv:P&&m(i.specularColorMap.channel),specularIntensityMapUv:Oe&&m(i.specularIntensityMap.channel),transmissionMapUv:F&&m(i.transmissionMap.channel),thicknessMapUv:I&&m(i.thicknessMap.channel),alphaMapUv:Ae&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||pe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(ne||Ae),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pe,decodeVideoTexture:ne&&i.map.isVideoTexture===!0&&aa.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&aa.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Ne&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ne&&i.extensions.multiDraw===!0||te)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Fe.vertexUv1s=c.has(1),Fe.vertexUv2s=c.has(2),Fe.vertexUv3s=c.has(3),c.clear(),Fe}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Sd[t];n=su.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Zp(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function rm(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function im(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function am(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function om(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||im),r.length>1&&r.sort(t||am),i.length>1&&i.sort(t||am)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function sm(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new om,e.set(t,[i])):n>=r.length?(i=new om,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function cm(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new H,color:new W};break;case`SpotLight`:n={position:new H,direction:new H,color:new W,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new H,color:new W,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new H,skyColor:new W,groundColor:new W};break;case`RectAreaLight`:n={color:new W,position:new H,halfWidth:new H,halfHeight:new H}}return e[t.id]=n,n}}}function lm(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var um=0;function dm(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function fm(e){let t=new cm,n=lm(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new H);let i=new H,a=new xa,o=new xa;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(dm);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=K.LTC_FLOAT_1,r.rectAreaLTC2=K.LTC_FLOAT_2):(r.rectAreaLTC1=K.LTC_HALF_1,r.rectAreaLTC2=K.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=um++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function pm(e){let t=new fm(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function mm(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new pm(e),t.set(n,[a])):r>=i.length?(a=new pm(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var hm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gm=`uniform sampler2D shadow_pass;
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
}`,_m=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],vm=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],ym=new xa,bm=new H,xm=new H;function Sm(e,t,n){let r=new rc,i=new V,a=new V,o=new ga,s=new pu,c=new mu,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new uu({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new V},radius:{value:4}},vertexShader:hm,fragmentShader:gm}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new $o;m.setAttribute(`position`,new Ro(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new G(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(z(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){z(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){z(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new va(i.x,i.y,{format:fr,type:$n,minFilter:Un,magFilter:Un,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Ec(i.x,i.y,Qn),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=cr,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Bn,d.map.depthTexture.magFilter=Bn}else l.isPointLight?(d.map=new Qd(i.x),d.map.depthTexture=new Dc(i.x,Zn)):(d.map=new va(i.x,i.y),d.map.depthTexture=new Ec(i.x,i.y,Zn)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=cr,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=Un,d.map.depthTexture.magFilter=Un):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Bn,d.map.depthTexture.magFilter=Bn);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),bm.setFromMatrixPosition(l.matrixWorld),e.position.copy(bm),xm.copy(e.position),xm.add(_m[t]),e.up.copy(vm[t]),e.lookAt(xm),e.updateMatrixWorld(),n.makeTranslation(-bm.x,-bm.y,-bm.z),ym.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(ym,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new va(i.x,i.y,{format:fr,type:$n}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Cm(e,t){function n(){let t=!1,n=new ga,r=null,i=new ga(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?de(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Ci[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?de(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),M=te>=1);let re=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new ga().fromArray(ae),ce=new ga().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(e.DEPTH_TEST),o.setFunc(3),be(!1),xe(1),de(e.CULL_FACE),ve(0);function de(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function fe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function pe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function me(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function he(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ge={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ge[103]=e.MIN,ge[104]=e.MAX;let _e={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ve(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(fe(e.BLEND),g=!1);return}if(g===!1&&(de(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:B(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:B(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:B(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:B(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ge[n],ge[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(_e[r],_e[i],_e[o],_e[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ye(t,n){t.side===2?fe(e.CULL_FACE):de(e.CULL_FACE);let r=t.side===1;n&&(r=!r),be(r),t.blending===1&&t.transparent===!1?ve(0):ve(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Ce(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?de(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function be(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function xe(t){t===0?fe(e.CULL_FACE):(de(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function Se(t){t!==k&&(M&&e.lineWidth(t),k=t)}function Ce(t,n,r){t?(de(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):fe(e.POLYGON_OFFSET_FILL)}function we(t){t?de(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function N(t){t===void 0&&(t=e.TEXTURE0+ee-1),re!==t&&(e.activeTexture(t),re=t)}function Te(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+ee-1:re);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function P(){try{e.compressedTexImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Oe(){try{e.texSubImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function F(){try{e.texSubImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function I(){try{e.compressedTexSubImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Ae(){try{e.texStorage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function je(){try{e.texStorage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Me(){try{e.texImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Ne(){try{e.texImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Pe(t){return d[t]===void 0?e.getParameter(t):d[t]}function Fe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Ie(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Le(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Re(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},re=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:de,disable:fe,bindFramebuffer:pe,drawBuffers:me,useProgram:he,setBlending:ve,setMaterial:ye,setFlipSided:be,setCullFace:xe,setLineWidth:Se,setPolygonOffset:Ce,setScissorTest:we,activeTexture:N,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:P,texImage2D:Me,texImage3D:Ne,pixelStorei:Fe,getParameter:Pe,updateUBOMapping:Re,uniformBlockBinding:ze,texStorage2D:Ae,texStorage3D:je,texSubImage2D:Oe,texSubImage3D:F,compressedTexSubImage2D:I,compressedTexSubImage3D:ke,scissor:Ie,viewport:Le,reset:Be}}function wm(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new V,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):gi(`canvas`)}function g(e,t,n){let r=1,i=De(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),z(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&z(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];z(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||z(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?ci:aa.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,z(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function j(e){O=e}function ee(){let e=O;return e>=i.maxTextures&&z(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function M(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function te(t,i){let a=r.get(t);if(t.isVideoTexture&&Te(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)z(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)z(`WebGLRenderer: Texture marked for update but image is incomplete`);else{fe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){fe(a,t,i);return}t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){fe(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ie(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){pe(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ae={[Ln]:e.REPEAT,[Rn]:e.CLAMP_TO_EDGE,[zn]:e.MIRRORED_REPEAT},oe={[Bn]:e.NEAREST,[Vn]:e.NEAREST_MIPMAP_NEAREST,[Hn]:e.NEAREST_MIPMAP_LINEAR,[Un]:e.LINEAR,[Wn]:e.LINEAR_MIPMAP_NEAREST,[Gn]:e.LINEAR_MIPMAP_LINEAR},se={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ce(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&z(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ae[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ae[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ae[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,oe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,oe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,se[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function le(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=M(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ue(e,t,n){return Math.floor(Math.floor(e/n)/t)}function de(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ue(n.start,r.width,4),c=ue(t.start,r.width,4);n.start<=i+1&&a===c&&ue(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function fe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=le(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=aa.getPrimaries(aa.workingColorSpace),r=o.colorSpace===``?null:aa.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=Ee(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);ce(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===lr,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&de(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023){if(r!==null){if(C){if(T){if(o.layerUpdates.size>0){let t=_d(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=_d(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w){if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=De(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=De(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function pe(t,o,s){if(o.image.length!==6)return;let c=le(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=aa.getPrimaries(aa.workingColorSpace),r=o.colorSpace===``?null:aa.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=Ee(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);ce(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=De(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function me(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,we(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function he(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;N(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,we(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,we(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);N(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,we(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,we(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ge(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),ce(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else te(i.depthTexture,0);let u=l.__webglTexture,d=we(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function _e(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)ge(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?ge(i.__webglFramebuffer[0],t,0):ge(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),he(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),he(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ve(t,n,i){let a=r.get(t);n!==void 0&&me(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&_e(t)}function ye(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&N(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=we(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),he(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ce(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)me(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else me(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),ce(c,a),me(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ce(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)me(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else me(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&_e(t)}function be(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let xe=[],Se=[];function Ce(t){if(t.samples>0){if(N(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(xe.length=0,Se.length=0,xe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(xe.push(l),Se.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Se)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,xe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function we(e){return Math.min(i.maxSamples,e.samples)}function N(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Te(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function Ee(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(aa.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&z(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):B(`WebGLTextures: Unsupported texture color space:`,n)),t}function De(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ee,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=j,this.setTexture2D=te,this.setTexture2DArray=ne,this.setTexture3D=re,this.setTextureCube=ie,this.rebindTextures=ve,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=be,this.updateMultisampleRenderTarget=Ce,this.setupDepthRenderbuffer=_e,this.setupFrameBufferTexture=me,this.useMultisampledRTT=N,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Tm(e,t){function n(n,r=``){let i,a=aa.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Em=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dm=`
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

}`,Om=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Oc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new uu({vertexShader:Em,fragmentShader:Dm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new G(new Xl(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},km=class extends wi{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Om,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new V,C=null,w=null,T=new qu;T.viewport=new ga;let E=new qu;E.viewport=new ga;let D=[T,E],O=new ed,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Za,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Za,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Za,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&z(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&z(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?lr:cr,a=_.stencil?nr:Zn);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new va(d.textureWidth,d.textureHeight,{format:sr,type:Kn,depthTexture:new Ec(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new va(f.framebufferWidth,f.framebufferHeight,{format:sr,type:Kn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let te=new H,ne=new H;function re(e,t,n){te.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=te.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;ie(O,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ae(e,O,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Oi*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new qu,o.layers.enable(n),o.viewport=new ga,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Oc,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ce=new yd;ce.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},Am=new xa,jm=new U;jm.set(-1,0,0,0,1,0,0,0,1);function Mm(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ou(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Am.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(jm),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Nm(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return B(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?z(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):z(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var Pm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Fm=null;function Im(){return Fm===null&&(Fm=new Ws(Pm,16,16,fr,$n),Fm.name=`DFG_LUT`,Fm.minFilter=Un,Fm.magFilter=Un,Fm.wrapS=Rn,Fm.wrapT=Rn,Fm.generateMipmaps=!1,Fm.needsUpdate=!0),Fm}var Lm=class{constructor(e={}){let{canvas:t=_i(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Kn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([mr,pr,dr]),g=new Set([Kn,Zn,Yn,nr,er,tr]),_=new Uint32Array(4),v=new Int32Array(4),y=new H,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=oi;let j=0,ee=0,M=null,te=-1,ne=null,re=new ga,ie=new ga,ae=null,oe=new W(0),se=0,ce=t.width,le=t.height,ue=1,de=null,fe=null,pe=new ga(0,0,ce,le),me=new ga(0,0,ce,le),he=!1,ge=new rc,_e=!1,ve=!1,ye=new xa,be=new H,xe=new ga,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ce=!1;function we(){return M===null?ue:1}let N=n;function Te(e,n){return t.getContext(e,n)}let Ee,De,P,Oe,F,I,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,Je,!1),t.addEventListener(`webglcontextrestored`,Ye,!1),t.addEventListener(`webglcontextcreationerror`,Xe,!1),N===null){let t=`webgl2`;if(N=Te(t,e),N===null)throw Te(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Ke()}catch(e){throw t.removeEventListener(`webglcontextlost`,Je,!1),t.removeEventListener(`webglcontextrestored`,Ye,!1),t.removeEventListener(`webglcontextcreationerror`,Xe,!1),B(`WebGLRenderer: `+e.message),e}function Ke(){Ee=new ef(N),Ee.init(),Ue=new Tm(N,Ee),De=new kd(N,Ee,e,Ue),P=new Cm(N,Ee),De.reversedDepthBuffer&&d&&P.buffers.depth.setReversed(!0),O=N.createFramebuffer(),k=N.createFramebuffer(),A=N.createFramebuffer(),Oe=new rf(N),F=new rm,I=new wm(N,Ee,P,F,De,Ue,Oe),ke=new $d(T),Ae=new bd(N),We=new Dd(N,Ae),je=new tf(N,Ae,Oe,We),Me=new of(N,je,Ae,We,Oe),Be=new af(N,De,I),Le=new Ad(F),Ne=new nm(T,ke,Ee,De,We,Le),Pe=new Mm(T,F),Fe=new sm,Ie=new mm(Ee),ze=new Ed(T,ke,P,Me,p,s),Re=new Sm(T,Me,De),Ge=new Nm(N,Oe,De,P),Ve=new Od(N,Ee,Oe),He=new nf(N,Ee,Oe),Oe.programs=Ne.programs,T.capabilities=De,T.extensions=Ee,T.properties=F,T.renderLists=Fe,T.shadowMap=Re,T.state=P,T.info=Oe}m!==1009&&(w=new cf(m,t.width,t.height,o,r,i));let qe=new km(T,N);this.xr=qe,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=Ee.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ee.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ue},this.setPixelRatio=function(e){e!==void 0&&(ue=e,this.setSize(ce,le,!1))},this.getSize=function(e){return e.set(ce,le)},this.setSize=function(e,n,r=!0){if(qe.isPresenting){z(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ce=e,le=n,t.width=Math.floor(e*ue),t.height=Math.floor(n*ue),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ce*ue,le*ue).floor()},this.setDrawingBufferSize=function(e,n,r){ce=e,le=n,ue=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){B(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){z(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(re)},this.getViewport=function(e){return e.copy(pe)},this.setViewport=function(e,t,n,r){e.isVector4?pe.set(e.x,e.y,e.z,e.w):pe.set(e,t,n,r),P.viewport(re.copy(pe).multiplyScalar(ue).round())},this.getScissor=function(e){return e.copy(me)},this.setScissor=function(e,t,n,r){e.isVector4?me.set(e.x,e.y,e.z,e.w):me.set(e,t,n,r),P.scissor(ie.copy(me).multiplyScalar(ue).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(e){P.setScissorTest(he=e)},this.setOpaqueSort=function(e){de=e},this.setTransparentSort=function(e){fe=e},this.getClearColor=function(e){return e.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=ze.getClearColor(),r=ze.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,N.clearBufferuiv(N.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,N.clearBufferiv(N.COLOR,0,v))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Je,!1),t.removeEventListener(`webglcontextrestored`,Ye,!1),t.removeEventListener(`webglcontextcreationerror`,Xe,!1),ze.dispose(),Fe.dispose(),Ie.dispose(),F.dispose(),ke.dispose(),Me.dispose(),We.dispose(),Ge.dispose(),Ne.dispose(),qe.dispose(),qe.removeEventListener(`sessionstart`,L),qe.removeEventListener(`sessionend`,rt),it.stop()};function Je(e){e.preventDefault(),yi(`WebGLRenderer: Context Lost.`),E=!0}function Ye(){yi(`WebGLRenderer: Context Restored.`),E=!1;let e=Oe.autoReset,t=Re.enabled,n=Re.autoUpdate,r=Re.needsUpdate,i=Re.type;Ke(),Oe.autoReset=e,Re.enabled=t,Re.autoUpdate=n,Re.needsUpdate=r,Re.type=i}function Xe(e){B(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ze(e){let t=e.target;t.removeEventListener(`dispose`,Ze),Qe(t)}function Qe(e){$e(e),F.remove(e)}function $e(e){let t=F.get(e).programs;t!==void 0&&(t.forEach(function(e){Ne.releaseProgram(e)}),e.isShaderMaterial&&Ne.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Se);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=pt(e,t,n,r,i);P.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=je.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;We.setup(i,r,s,n,c);let h,g=Ve;if(c!==null&&(h=Ae.get(c),g=He,g.setIndex(h)),i.isMesh)r.wireframe===!0?(P.setLineWidth(r.wireframeLinewidth*we()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),P.setLineWidth(e*we()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh){if(Ee.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ae.get(c).bytesPerElement:1,o=F.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function et(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),_e===!0&&Le.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,lt(e,t,r),e.side=0,e.needsUpdate=!0,lt(e,t,r),e.side=2):lt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Ie.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),ve=this.localClippingEnabled,_e=Le.init(this.clippingPlanes,ve),_e===!0&&Le.setGlobalState(this.clippingPlanes,t),D!==null&&Re.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];et(o,n,t,e),r.add(o)}else et(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=F.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Ee.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let tt=null;function nt(e){tt&&tt(e)}function L(){it.stop()}function rt(){it.start()}let it=new yd;it.setAnimationLoop(nt),typeof self<`u`&&it.setContext(self),this.setAnimationLoop=function(e){tt=e,qe.setAnimationLoop(e),e===null?it.stop():it.start()},qe.addEventListener(`sessionstart`,L),qe.addEventListener(`sessionend`,rt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){B(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=qe.enabled===!0&&qe.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),qe.enabled===!0&&qe.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(qe.cameraAutoUpdate===!0&&qe.updateCamera(t),t=qe.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Ie.get(e,C.length),x.init(t),x.state.textureUnits=I.getTextureUnits(),C.push(x),ye.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ge.setFromProjectionMatrix(ye,pi,t.reversedDepth),ve=this.localClippingEnabled,_e=Le.init(this.clippingPlanes,ve),b=Fe.get(e,S.length),b.init(),S.push(b),qe.enabled===!0&&qe.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&at(e,t,-1/0,T.sortObjects)}at(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(de,fe),Ce=qe.enabled===!1||qe.isPresenting===!1||qe.hasDepthSensing()===!1,Ce&&ze.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),_e===!0&&Le.beginShadows();let i=x.state.shadowsArray;if(Re.render(i,e,t),_e===!0&&Le.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];R(n,r,e,a)}Ce&&ze.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];ot(b,e,n,n.viewport)}}else r.length>0&&R(n,r,e,t),Ce&&ze.render(e),ot(b,e,t)}M!==null&&ee===0&&(I.updateMultisampleRenderTarget(M),I.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),We.resetDefaultState(),te=-1,ne=null,C.pop(),C.length>0?(x=C[C.length-1],I.setTextureUnits(x.state.textureUnits),_e===!0&&Le.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function at(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(ge)){r&&xe.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ye);let i=Me.update(e),a=e.material;a.visible&&b.push(e,i,a,n,xe.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(ge))){let i=Me.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),xe.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),xe.copy(e.boundingSphere.center)),xe.applyMatrix4(e.matrixWorld).applyMatrix4(ye)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,xe.z,s,t)}}else a.visible&&b.push(e,i,a,n,xe.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)at(i[e],t,n,r)}function ot(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),_e===!0&&Le.setGlobalState(T.clippingPlanes,n),r&&P.viewport(re.copy(r)),i.length>0&&st(i,t,n),a.length>0&&st(a,t,n),o.length>0&&st(o,t,n),P.buffers.depth.setTest(!0),P.buffers.depth.setMask(!0),P.buffers.color.setMask(!0),P.setPolygonOffset(!1)}function R(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Ee.has(`EXT_color_buffer_half_float`)||Ee.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new va(1,1,{generateMipmaps:!0,type:e?$n:Kn,minFilter:Gn,samples:Math.max(4,De.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:aa.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||re;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(oe),se=T.getClearAlpha(),se<1&&T.setClearColor(16777215,.5),T.clear(),Ce&&ze.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),_e===!0&&Le.setGlobalState(T.clippingPlanes,r),st(e,n,r),I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a),Ee.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(oe,se),d!==void 0&&(r.viewport=d),T.toneMapping=u}function st(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ct(o,t,n,s,l,c)}}function ct(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function lt(e,t,n){t.isScene!==!0&&(t=Se);let r=F.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ne.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ne.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=ke.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ze),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return dt(e,s),d}else s.uniforms=Ne.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ne.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Le.uniform),dt(e,s),r.needsLights=ht(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function ut(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=hp.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function dt(e,t){let n=F.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ft(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function pt(e,t,n,r,i){t.isScene!==!0&&(t=Se),I.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:aa.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=ke.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=F.get(r),y=x.state.lights;if(_e===!0&&(ve===!0||e!==ne)){let t=e===ne&&r.id===te;Le.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Le.numPlanes||v.numIntersection!==Le.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=lt(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(P.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==te&&(te=r.id,w=!0),v.needsLights){let e=ft(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||ne!==e){P.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(N,`projectionMatrix`,e.projectionMatrix),O.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(N,be.setFromMatrixPosition(e.matrixWorld)),De.logarithmicDepthBuffer&&O.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),ne!==e&&(ne=e,w=!0,E=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&O.setValue(N,`sunShadowMap`,y.state.sunShadowMap,I),y.state.directionalShadowMap.length>0&&O.setValue(N,`directionalShadowMap`,y.state.directionalShadowMap,I),y.state.spotShadowMap.length>0&&O.setValue(N,`spotShadowMap`,y.state.spotShadowMap,I),y.state.pointShadowMap.length>0&&O.setValue(N,`pointShadowMap`,y.state.pointShadowMap,I)),i.isSkinnedMesh){O.setOptional(N,i,`bindMatrix`),O.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(N,`boneTexture`,e.boneTexture,I))}i.isBatchedMesh&&(O.setOptional(N,i,`batchingTexture`),O.setValue(N,`batchingTexture`,i._matricesTexture,I),O.setOptional(N,i,`batchingIdTexture`),O.setValue(N,`batchingIdTexture`,i._indirectTexture,I),O.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(N,`batchingColorTexture`,i._colorsTexture,I));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Be.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(N,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=Im()),w){if(O.setValue(N,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&mt(k,E),a&&r.fog===!0&&Pe.refreshFogUniforms(k,a),Pe.refreshMaterialUniforms(k,r,ue,le,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}hp.upload(N,ut(v),k,I)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(hp.upload(N,ut(v),k,I),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(N,`center`,i.center),O.setValue(N,`modelViewMatrix`,i.modelViewMatrix),O.setValue(N,`normalMatrix`,i.normalMatrix),O.setValue(N,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ge.update(n,S),Ge.bind(n,S)}}return S}function mt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ht(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=F.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),F.get(e.texture).__webglTexture=t,F.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=F.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=F.get(e);if(o.__useDefaultFramebuffer!==void 0){P.bindFramebuffer(N.FRAMEBUFFER,o.__webglFramebuffer),re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest,P.viewport(re),P.scissor(ie),P.setScissorTest(ae),te=-1;return}if(o.__webglFramebuffer===void 0)I.setupRenderTarget(e);else if(o.__hasExternalTextures)I.rebindTextures(e,F.get(e.texture).__webglTexture,F.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&F.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);I.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=F.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&I.useMultisampledRTT(e)===!1?F.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest}else re.copy(pe).multiplyScalar(ue).floor(),ie.copy(me).multiplyScalar(ue).floor(),ae=he;if(n!==0&&(r=O),P.bindFramebuffer(N.FRAMEBUFFER,r)&&P.drawBuffers(e,r),P.viewport(re),P.scissor(ie),P.setScissorTest(ae),i){let r=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=F.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}te=-1};function gt(e){let t=F.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=De.textureFormatReadable(e.format),t.__typeReadable=De.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){P.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s);let u=gt(o);if(u.__formatReadable===!1){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&N.readPixels(t,n,r,i,Ue.convert(c),Ue.convert(l),a)}finally{let e=M===null?null:F.get(M).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){P.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s);let d=gt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,f),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),N.readPixels(t,n,r,i,Ue.convert(l),Ue.convert(u),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);let p=M===null?null:F.get(M).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,p);let m=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Si(N,m,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,f),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(f),N.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;I.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),P.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ue.convert(t.format),_=Ue.convert(t.type),v;t.isData3DTexture?(I.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(I.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(I.setTexture2D(t,0),v=N.TEXTURE_2D),P.activeTexture(N.TEXTURE0),P.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),P.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),P.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=P.getParameter(N.UNPACK_ROW_LENGTH),b=P.getParameter(N.UNPACK_IMAGE_HEIGHT),x=P.getParameter(N.UNPACK_SKIP_PIXELS),S=P.getParameter(N.UNPACK_SKIP_ROWS),C=P.getParameter(N.UNPACK_SKIP_IMAGES);P.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),P.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),P.pixelStorei(N.UNPACK_SKIP_PIXELS,l),P.pixelStorei(N.UNPACK_SKIP_ROWS,u),P.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=F.get(e),r=F.get(t),h=F.get(n.__renderTarget),g=F.get(r.__renderTarget);P.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,o,s,f,p,o,s,N.DEPTH_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||F.has(e)){let n=F.get(e),r=F.get(t);P.bindFramebuffer(N.READ_FRAMEBUFFER,k),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,o,s,f,p,o,s,N.COLOR_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);P.pixelStorei(N.UNPACK_ROW_LENGTH,y),P.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),P.pixelStorei(N.UNPACK_SKIP_PIXELS,x),P.pixelStorei(N.UNPACK_SKIP_ROWS,S),P.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&N.generateMipmap(v),P.unbindTexture()},this.initRenderTarget=function(e){F.get(e).__webglFramebuffer===void 0&&I.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?I.setTextureCube(e,0):e.isData3DTexture?I.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?I.setTexture2DArray(e,0):I.setTexture2D(e,0),P.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,P.reset(),We.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return pi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=aa._getDrawingBufferColorSpace(e),t.unpackColorSpace=aa._getUnpackColorSpace()}},Rm=[{groups:1,members:6,maxSize:0,flock:.8},{groups:2,members:12,maxSize:1,flock:1.1},{groups:3,members:24,maxSize:1,flock:1.5},{groups:5,members:40,maxSize:2,flock:1.9},{groups:7,members:60,maxSize:3,flock:2.3}];function zm(e){return e.category===`bird`?e.real.len<=.3&&(e.motion===`flock`||e.motion===`perch`||e.motion===`hover`):e.category===`insect`||e.category===`butterfly`?e.motion===`flutter`||e.motion===`hover`:!1}var Bm=[`細小`,`小型`,`中型`,`大型`];function Vm(e){return Rm[Math.max(0,Math.min(4,Math.round(e)))]}function Hm(e){let t=e.look.size??1;switch(e.category){case`insect`:case`amphibian`:return 0;case`butterfly`:return+(t>=1.5);case`reptile`:return e.look.kind===`snake`&&t>=2?3:e.look.kind===`lizard`?0:1;case`bird`:return e.look.kind===`owl`?2:e.motion===`soar`?t>=2.5?3:2:t<=.85?0:t<=1.2?1:2;case`mammal`:return e.look.kind===`squirrel`||e.look.kind===`bat`?1:t>=2?3:t<.9?1:2}}function Um(e,t){return Hm(e)<=Vm(t).maxSize}function Wm(e,t,n){if(e.motion===`nest`||e.motion===`hollow`||e.motion===`glow`)return 1;let r=Vm(t),[i,a]=e.group,o=i,s=Math.max(o,Math.round(a*(a>=3?r.flock:1))),c=r.members;if(zm(e)){let e=a>=3?r.flock*1.35:1+(r.flock-.8)*.8;s=Math.max(o,Math.round(a*e)),t>=1&&(o=Math.min(s,Math.max(o,2))),c=r.groups<=1?r.members:Math.max(2,Math.round(r.members*.4))}let l=o+Math.floor(n()*(s-o+1));return Math.max(1,Math.min(l,c,r.members))}var Gm=14,Km=96,qm=160;function Jm(){return{pts:new Float32Array(42),n:0,head:0,t:0}}function Ym(e,t,n,r,i){if(!r){e.t+=n,e.n>0&&e.t>i&&(e.n--,e.t=0);return}e.t+=n,(e.n===0||e.t>=i)&&(e.t=0,e.head=(e.head+1)%Gm,e.pts[e.head*3]=t.x,e.pts[e.head*3+1]=t.y,e.pts[e.head*3+2]=t.z,e.n=Math.min(Gm,e.n+1))}function Xm(){let e=document.createElement(`canvas`);e.width=e.height=32;let t=e.getContext(`2d`),n=t.createRadialGradient(16,16,0,16,16,16);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.25,`rgba(255,248,210,0.85)`),n.addColorStop(1,`rgba(255,240,180,0)`),t.fillStyle=n,t.fillRect(0,0,32,32),t.fillStyle=`rgba(255,255,255,0.9)`,t.fillRect(15,2,2,28),t.fillRect(2,15,28,2),new Tc(e)}var Zm=class{group=new Ya;lines;linePos=new Float32Array(7488);lineCol=new Float32Array(9984);sparks;sparkPos=new Float32Array(480);sparkA=new Float32Array(qm);sparkS=new Float32Array(qm);trailQ=[];sparkQ=[];stats={trails:0,sparkles:0};constructor(){let e=new $o;e.setAttribute(`position`,new Ro(this.linePos,3).setUsage(fi)),e.setAttribute(`color`,new Ro(this.lineCol,4).setUsage(fi)),e.setDrawRange(0,0),this.lines=new gc(e,new ic({vertexColors:!0,transparent:!0,depthWrite:!1,fog:!1})),this.lines.frustumCulled=!1,this.lines.renderOrder=3;let t=new $o;t.setAttribute(`position`,new Ro(this.sparkPos,3).setUsage(fi)),t.setAttribute(`aAlpha`,new Ro(this.sparkA,1).setUsage(fi)),t.setAttribute(`aSize`,new Ro(this.sparkS,1).setUsage(fi)),t.setDrawRange(0,0);let n=new uu({uniforms:{map:{value:Xm()},color:{value:new W(`#fff6c8`)}},vertexShader:`attribute float aAlpha; attribute float aSize; varying float vA;
        void main() { vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform sampler2D map; uniform vec3 color; varying float vA;
        void main() { vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color * t.rgb, t.a * vA); }`,transparent:!0,depthWrite:!1,blending:2});this.sparks=new Sc(t,n),this.sparks.frustumCulled=!1,this.sparks.renderOrder=3,this.group.add(this.lines,this.sparks)}begin(){this.trailQ.length=0,this.sparkQ.length=0}trail(e,t){e.n>=2&&t>.01&&this.trailQ.length<Km&&this.trailQ.push({tr:e,alpha:t})}sparkle(e,t,n){t>.01&&this.sparkQ.length<qm&&this.sparkQ.push({p:e,alpha:t,size:n})}end(){let e=0;for(let{tr:t,alpha:n}of this.trailQ)for(let r=0;r<t.n-1;r++){let i=(t.head-r+Gm)%Gm,a=(t.head-r-1+Gm)%Gm,o=n*(1-r/(t.n-1)),s=n*(1-(r+1)/(t.n-1));for(let[n,r]of[[i,o],[a,s]])this.linePos[e*3]=t.pts[n*3],this.linePos[e*3+1]=t.pts[n*3+1],this.linePos[e*3+2]=t.pts[n*3+2],this.lineCol[e*4]=1,this.lineCol[e*4+1]=1,this.lineCol[e*4+2]=1,this.lineCol[e*4+3]=r,e++}let t=this.lines.geometry;t.setDrawRange(0,e),t.getAttribute(`position`).needsUpdate=!0,t.getAttribute(`color`).needsUpdate=!0,this.lines.visible=e>0;let n=0;for(let e of this.sparkQ)this.sparkPos[n*3]=e.p.x,this.sparkPos[n*3+1]=e.p.y,this.sparkPos[n*3+2]=e.p.z,this.sparkA[n]=e.alpha,this.sparkS[n]=e.size,n++;let r=this.sparks.geometry;r.setDrawRange(0,n);for(let e of[`position`,`aAlpha`,`aSize`])r.getAttribute(e).needsUpdate=!0;this.sparks.visible=n>0,this.stats={trails:this.trailQ.length,sparkles:n}}},Qm=1.1,$m=.75,eh=.16,th=.4;function nh(e){return Math.max(0,e)/100/1}function rh(e,t){return nh(t)/Math.max(1e-6,e)}function ih(e){return Math.max(0,e)+5}function ah(e){let t=(Math.max(0,e)/8)**th;return Math.max(1,Math.min(3,t))}function oh(e){return Math.max(.001,e)}function sh(e,t){return Math.min($m,Qm*ah(t)/Math.max(.001,e))}function ch(e){return 1+.035*Math.sin(e*3+.6)+.025*Math.sin(e*7+1.9)}function lh(e,t){return e*ch(t)}function uh(e){return e*.94}function dh(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new $o,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=fh(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=fh(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function fh(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Ro(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var ph=new Map;function mh(e,t={}){let n=`${new W(e).getHexString()}|${t.rough??.85}|${t.emissive??``}|${t.opacity??1}|${t.side??0}|${t.flat??!0}`,r=ph.get(n);return r||(r=new fu({color:e,roughness:t.rough??.85,metalness:0,flatShading:t.flat??!0,emissive:t.emissive??0,transparent:t.transparent??(t.opacity??1)<1,opacity:t.opacity??1,side:t.side??0}),ph.set(n,r)),r}function hh(e,t,n){let r=Math.sin(e*12.9898+t*78.233+n*37.719)*43758.5453;return r-Math.floor(r)}function gh(e,t,n=0,r=!0){let i=e.getAttribute(`position`),a=new H;for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e);let o=Math.round(a.x*1e3)/1e3,s=Math.round(a.y*1e3)/1e3,c=Math.round(a.z*1e3)/1e3,l=hh(o+n,s-n*.37,c+n*.71)-.5;if(r){let e=a.length()||1;a.multiplyScalar((e+l*t)/e)}else a.x+=(hh(o,s,c+n)-.5)*t,a.y+=l*t,a.z+=(hh(c,o,s+n)-.5)*t;i.setXYZ(e,a.x,a.y,a.z)}return i.needsUpdate=!0,e.computeVertexNormals(),e}function _h(e,t,n,r,i=6){let a=new H().subVectors(t,e),o=a.length(),s=new jc(r,n,o,i,1,!1);s.translate(0,o/2,0);let c=new Qi().setFromUnitVectors(new H(0,1,0),a.normalize());return s.applyQuaternion(c),s.translate(e.x,e.y,e.z),s}function vh(e,t){let n=e.getAttribute(`position`),r=new Float32Array(n.count*3);for(let e=0;e<n.count;e++){let i=typeof t==`function`?t(n.getY(e),e):t;r[e*3]=i.r,r[e*3+1]=i.g,r[e*3+2]=i.b}return e.setAttribute(`color`,new Ro(r,3)),e}function yh(e,t=!1){let n=e.map(e=>{let n=e.index?e.toNonIndexed():e;return n!==e&&e.dispose(),n.deleteAttribute(`uv`),t?n.getAttribute(`color`)||vh(n,new W(1,1,1)):n.deleteAttribute(`color`),n}),r=n.length?dh(n,!1):new $o;return n.forEach(e=>e.dispose()),r??new $o}function bh(e){e.traverse(e=>{let t=e;t.geometry&&t.geometry.dispose()})}function xh(e,t,n,r=1){let i=new Yl(1,r);return i.scale(e,t,n),i}var Sh={uPropK:{value:1}};function Ch(e,t){return Math.max(.05,Math.min(1,ah(e)*1/Math.max(.001,t)))}function wh(e){return Math.max(0,Math.round(Math.log(1/Math.max(.05,Math.min(1,e)))/Math.log(1.25)))}function Th(e){return 1.25**-e}function Eh(e,t){return Math.max(1,Math.min(t,1/(e*e)))}function Dh(e,t){e.uniforms.uPropK=Sh.uPropK,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\nuniform float uPropK;${t?`
attribute vec3 aAnchor;`:``}`).replace(`#include <begin_vertex>`,t?`#include <begin_vertex>
transformed = aAnchor + (transformed - aAnchor) * uPropK;`:`#include <begin_vertex>
transformed *= uPropK;`)}function Oh(e,t){return e.onBeforeCompile=e=>Dh(e,t),e.customProgramCacheKey=()=>t?`propA`:`propI`,e}function kh(e,t){return(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>Oh(e,t)),e.customDepthMaterial=Oh(new pu({depthPacking:ai}),t),e.customDistanceMaterial=Oh(new mu,t),e.raycast=()=>{},e.userData.prop=!0,e}function Ah(e,t,n,r){let i=e.getAttribute(`position`).count,a=new Float32Array(i*3);for(let e=0;e<i;e++)a[e*3]=t,a[e*3+1]=n,a[e*3+2]=r;return e.setAttribute(`aAnchor`,new Ro(a,3)),e}function jh(e){return lh(7,e)}function Mh(e,t,n,r){let i=e.getAttribute(`position`);for(let e=0;e<i.count;e++){let a=i.getX(e),o=i.getZ(e),s=Math.hypot(a,o);if(s<1e-4)continue;let c=lh(t,Math.atan2(o,a)),l=r!==void 0&&Math.abs(i.getY(e)-r)<.001?c:Math.min(s,c*n);i.setX(e,a/s*l),i.setZ(e,o/s*l)}i.needsUpdate=!0,e.computeVertexNormals()}function Nh(){let e=document.createElement(`canvas`);e.width=64,e.height=128;let t=e.getContext(`2d`);t.fillStyle=`#5bb6dc`,t.fillRect(0,0,64,128);for(let e=0;e<26;e++){t.fillStyle=`rgba(255,255,255,${.12+e%3*.08})`;let n=e*23%64,r=e*41%128;t.fillRect(n,r,10+e%4*5,2)}let n=new Tc(e);return n.wrapS=n.wrapT=Ln,n.colorSpace=oi,n}var Ph=[new H(2.6,.03,-2.4),new H(3.5,.03,-.6),new H(3.9,.03,1.4),new H(4.4,.03,3.3),new H(4.75,.03,5.05)],Fh={x:-3.15,z:1.75,rx:1.55,rz:1,rot:.45};function Ih(e,t,n){let r=Fh,i=e-r.x,a=t-r.z,o=Math.cos(r.rot),s=Math.sin(r.rot),c=i*o-a*s,l=i*s+a*o;return(c/(r.rx+n))**2+(l/(r.rz+n))**2<1}function Lh(e){return .44+.14*Math.sin(e*9)}function Rh(e,t,n){return zh(e,t,n+.52)||Ih(e,t,n)}function zh(e,t,n){for(let r=0;r<Ph.length-1;r++){let i=Ph[r],a=Ph[r+1],o=a.x-i.x,s=a.z-i.z,c=Math.max(0,Math.min(1,((e-i.x)*o+(t-i.z)*s)/(o*o+s*s))),l=i.x+o*c-e,u=i.z+s*c-t;if(l*l+u*u<n*n)return!0}return!1}function Bh(){let e=new Ya,t=new jc(7,7,.5,40,3),n=t.getAttribute(`position`);for(let e=0;e<n.count;e++){let t=n.getX(e),r=n.getZ(e),i=n.getY(e),a=Math.hypot(t,r);if(a>.01){let i=jh(Math.atan2(r,t))/7;n.setX(e,t*i),n.setZ(e,r*i)}let o=i>0?.18*(1-Math.min(1,a/7)**2):0;n.setY(e,i-.25+o)}t.computeVertexNormals();let r=new G(t,mh(`#7cbd4f`,{rough:.95}));r.receiveShadow=!0,e.add(r);let i=new jc(7,6.3,.9,40,2);gh(i,.35,3,!1),Mh(i,7,.985);let a=new G(i,mh(`#8a6446`));a.position.y=-.9,e.add(a);let o=new Mc(6.44,7*1.35,16,4);o.rotateX(Math.PI),gh(o,.9,7,!1),Mh(o,7,.93),vh(o,e=>new W().lerpColors(new W(`#6d6a66`),new W(`#8f7155`),Zi.clamp((e+6)/6,0,1)));let s=new G(o,new fu({vertexColors:!0,flatShading:!0,roughness:.95}));s.position.y=-1.35-7*1.35/2,e.add(s);let c=new G(new Ac(1.1,18),mh(`#8c6a48`));c.rotation.x=-Math.PI/2,c.position.y=.185,c.receiveShadow=!0,e.add(c);let l=Nh(),u=new Wc(Ph),d=[],f=[],p=[];for(let e=0;e<=40;e++){let t=e/40,n=u.getPoint(t),r=u.getTangent(t),i=new H(-r.z,0,r.x).normalize(),a=Lh(t),o=.02+.18*(1-Math.min(1,Math.hypot(n.x,n.z)/7)**2);if(d.push(n.x+i.x*a,o,n.z+i.z*a,n.x-i.x*a,o,n.z-i.z*a),f.push(0,t*6,1,t*6),e<40){let t=e*2;p.push(t,t+1,t+2,t+1,t+3,t+2)}}let m=new $o;m.setAttribute(`position`,new Vo(d,3)),m.setAttribute(`uv`,new Vo(f,2)),m.setIndex(p),m.computeVertexNormals();let h=new G(m,new fu({map:l,roughness:.25,metalness:.05,emissive:`#1d5f80`,emissiveIntensity:.25}));h.receiveShadow=!0,e.add(h);let g=Ph[Ph.length-1],_=l.clone();_.needsUpdate=!0;let v=new G(new Xl(.7,5,1,4),new fu({map:_,transparent:!0,opacity:.8,roughness:.3,side:2,emissive:`#2a7aa0`,emissiveIntensity:.3}));v.position.set(g.x+.05,-2.45,g.z+.08),v.rotation.y=-Math.atan2(g.x,g.z)+Math.PI/2-Math.PI/2,e.add(v);let y=new G(xh(.5,.25,.5,0),mh(`#e8f6fb`,{opacity:.6}));y.position.set(g.x,-4.9,g.z),e.add(y);{let t=Fh,n=.18*(1-Math.min(1,Math.hypot(t.x,t.z)/7)**2),r=new Ac(1,26);r.rotateX(-Math.PI/2),r.scale(t.rx,1,t.rz),r.rotateY(t.rot);let i=l.clone();i.needsUpdate=!0,i.repeat.set(.6,.3);let a=new G(r,new fu({map:i,roughness:.15,metalness:.1,emissive:`#1d5f80`,emissiveIntensity:.2}));a.position.set(t.x,n+.035,t.z),a.receiveShadow=!0,e.add(a);let o=new Zl(.9,1.16,26,1);o.rotateX(-Math.PI/2),o.scale(t.rx,1,t.rz),o.rotateY(t.rot);let s=new G(o,mh(`#b9a47a`));s.position.set(t.x,n+.028,t.z),e.add(s)}let b=new Ya,x=new kc(.28,.06,1.3);for(let e=0;e<6;e++){let t=new G(x,mh(e%2?`#a0714a`:`#b07f55`)),n=(e-2.5)/2.5;t.position.set(e*.3-.75,.32+.12*(1-n*n),0),t.castShadow=!0,t.receiveShadow=!0,b.add(t)}for(let e of[-.62,.62]){let t=new G(new kc(1.9,.06,.06),mh(`#7d5535`));t.position.set(0,.66,e),b.add(t);for(let t of[-.85,0,.85]){let n=new G(new kc(.07,.42,.07),mh(`#7d5535`));n.position.set(t,.47,e),n.castShadow=!0,b.add(n)}}let S=u.getPoint(.8),C=u.getTangent(.8);b.position.set(S.x,0,S.z),b.rotation.y=-Math.atan2(C.z,C.x)+Math.PI/2,e.add(b);let w=null,T=-1,E=t=>{w&&(e.remove(w),w.traverse(e=>{let t=e;t.isMesh&&(t.geometry.dispose(),t.material.dispose())})),w=Vh(Th(t),{x:S.x,z:S.z}),e.add(w),T=t};return E(0),{group:e,water:l,dirt:c,grass:r,setProps(e,t){b.scale.set(Math.max(e,.8),e,e),t!==T&&E(t)},setExtended(e){a.visible=!e,s.visible=!e,v.visible=!e,y.visible=!e},update(e,t){l.offset.y=-e*.25,_.offset.y=e*.9,y.scale.setScalar(1+Math.sin(e*5)*.06)}}}function Vh(e,t){let n=it(20260942),r=new Ya;r.name=`garden-props`;let i=t=>Eh(e,t),a=(e,t)=>.18*(1-Math.min(1,Math.hypot(e,t)/7)**2),o=(e,t,n)=>Rh(e,t,n),s=()=>new fu({vertexColors:!0,flatShading:!0,roughness:.9}),c=[[2.9,-2.9,.75],[2.1,-2.6,.45],[3.4,-2.1,.5],[5.2,1.9,.6],[5.5,2.8,.4],[-5.3,-1.2,.5],[-1.6,-5.2,.6],[.8,-5.6,.4],[1.8,4.4,.3],[-2.4,4.8,.45]],l=Fh;for(let e=0;e<9;e++){let t=e/9*Math.PI*2+.3,n=Math.cos(t)*l.rx*1.2,r=Math.sin(t)*l.rz*1.2,i=Math.cos(l.rot),a=Math.sin(l.rot);e%3!=1&&c.push([l.x+n*i+r*a,l.z-n*a+r*i,.14+e%4*.05])}let u=Math.round(14*(i(5)-1));for(let e=0,t=0;e<u&&t<u*20;t++){let t=n()*Math.PI*2,r=1.6+Math.sqrt(n())*4.6,i=Math.cos(t)*r,a=Math.sin(t)*r;o(i,a,.35)||(c.push([i,a,.18+n()*.32]),e++)}let d=[];c.forEach(([e,t,n],r)=>{let i=new Pc(n,0);gh(i,n*.35,r*3.1,!1),i.scale(1,.7,1),i.rotateY(r);let o=a(e,t);i.translate(e,o+n*.25,t),vh(i,new W().setHSL(.08,.04,.55+r%3*.06)),d.push(Ah(i,e,o,t))});let f=kh(new G(yh(d,!0),s()),!0);f.castShadow=e>.6,f.receiveShadow=!0,r.add(f);let p=[],m=Math.round(6*Math.min(3,1/e));for(let r=0;r<m;r++){let i=r/Math.max(1,m-1),o=1.2+(t.x-1.5-1.2)*i+(n()-.5)*.3*e,s=1+(t.z-1)*i+(n()-.5)*.3*e,c=new jc(.22+n()*.08,.26,.06,7),l=a(o,s);c.translate(o,l+.02,s),vh(c,new W(`#c9c2b4`)),p.push(Ah(c,o,l,s))}let h=kh(new G(yh(p,!0),s()),!0);h.receiveShadow=!0,r.add(h);let g=new Mc(.045,.16,3);g.translate(0,.08,0);let _=Math.round(480*i(5)),v=new $s(g,new fu({flatShading:!0,roughness:.9}),_);kh(v,!1);let y=new Yl(.07,0);y.translate(0,.12/.7,0);let b=Math.round(120*i(5)),x=new $s(y,new fu({flatShading:!0,roughness:.7}),b);kh(x,!1);let S=[`#ffffff`,`#fff6d8`,`#f7b7c8`,`#f3d35b`,`#c9b3f0`,`#ffffff`],C=new xa,w=new Qi,T=new W,E=0,D=0;for(let e=0;e<(_+b)*8&&(E<_||D<b);e++){let e=n()*Math.PI*2,t=Math.sqrt(n())*6.4,r=Math.cos(e)*t,i=Math.sin(e)*t;if(t<1.2||o(r,i,.12))continue;let s=a(r,i);if(E<_&&n()<.75){w.setFromEuler(new ja((n()-.5)*.4,n()*6,(n()-.5)*.4));let e=.6+n()*.9;C.compose(new H(r,s,i),w,new H(e,e*(.8+n()*.6),e)),v.setMatrixAt(E,C),v.setColorAt(E,T.setHSL(.24+n()*.06,.5,.36+n()*.14)),E++}else if(D<b){let e=.7+n()*.8;C.compose(new H(r,s,i),w.identity(),new H(e,e*.7,e)),x.setMatrixAt(D,C),x.setColorAt(D,T.set(S[Math.floor(n()*S.length)])),D++}}v.count=E,x.count=D,v.receiveShadow=!0,r.add(v,x);let O=1.2,k=O+Math.PI*1.55,A=[],j=Math.round(14*i(5));for(let t=0;t<j;t++){let r=t>=14&&n()<.45,i=r?n()*Math.PI*2:O+n()*(k-O),s=r?2+n()*3.6:lh(7,i)-.9*Math.max(e,.5)-n()*.5,c=Math.cos(i)*s,l=Math.sin(i)*s;if(o(c,l,.5))continue;let u=.35+n()*.35,d=new Yl(u,e<.7?0:1);gh(d,u*.3,t,!0),d.scale(1,.75,1);let f=a(c,l);d.translate(c,f+u*.5,l),vh(d,e=>new W().setHSL(.27,.45,.3+(e-f)*.25)),A.push(Ah(d,c,f,l))}let ee=kh(new G(yh(A,!0),s()),!0);return ee.castShadow=e>.6,ee.receiveShadow=!0,r.add(ee),r}var Hh=1.25;function Uh(e){let{R:t,hUnits:n,groundAt:r,skip:i}=e,a=it(4242+Math.round(t*10)),o=new Ya;o.name=`fence`;let s=Math.min(.12,Math.max(.07,n*.16)),c=new kc(s,1,s);c.translate(0,.5,0);let l=new kc(1,Math.max(.035,n*.08),Math.max(.03,s*.45)),u=1.25/t,d=Math.max(24,Math.round(Math.PI*2*t/1.05)),f=[],p=[],m=[],h=null,g=null,_=null,v=new Qi,y=new ja;for(let e=0;e<=d;e++){let o=Hh+u/2+(Math.PI*2-u)*e/d,s=lh(t,o),c=s-eh,l=new H(Math.cos(o)*c,0,Math.sin(o)*c);if(i(l.x,l.z)){h=null;continue}l.y=r(l.x,l.z);let b=e===0||e===d,x=n*(b?1.25:.94+a()*.1);v.setFromEuler(y.set(0,-o,(a()-.5)*.05));let S=b?1.4:1;if(f.push(new xa().compose(l.clone().setY(l.y-.04),v,new H(S,x+.04,S))),m.push({x:l.x,z:l.z,shore:s,r:c,a:o}),h){let e=h.clone().add(l).multiplyScalar(.5),t=h.distanceTo(l),r=-Math.atan2(l.z-h.z,l.x-h.x);for(let i of[n*.38,n*.78])p.push(new xa().compose(new H(e.x,e.y+i,e.z),new Qi().setFromEuler(new ja(0,r,0)),new H(t,1,1)))}e===0&&(g=l),e===d&&(_=l),h=l}let b=new $s(c,mh(`#9b6b43`),Math.max(1,f.length));f.forEach((e,t)=>b.setMatrixAt(t,e)),b.count=f.length,b.castShadow=!0;let x=new $s(l,mh(`#b0815a`),Math.max(1,p.length));if(p.forEach((e,t)=>x.setMatrixAt(t,e)),x.count=p.length,x.castShadow=!0,o.add(b,x),g&&_){let e=g.clone().add(_).multiplyScalar(.5),t=new G(new kc(g.distanceTo(_)+.2,Math.max(.05,n*.1),Math.max(.05,n*.1)),mh(`#7d5535`));t.position.set(e.x,Math.max(g.y,_.y)+n*1.25,e.z),t.rotation.y=-Math.atan2(_.z-g.z,_.x-g.x),t.castShadow=!0,o.add(t)}return{group:o,key:e.key,posts:m,dispose(){o.traverse(e=>e.isMesh&&e.geometry.dispose())}}}var Wh={solid:new fu({vertexColors:!0,flatShading:!0,roughness:.78}),double:new fu({vertexColors:!0,flatShading:!0,roughness:.7,side:2}),glass:new fu({vertexColors:!0,roughness:.2,transparent:!0,opacity:.5,side:2,depthWrite:!1}),glow:new fu({color:`#f6ff9a`,emissive:`#e4ff5a`,emissiveIntensity:1.6})},Gh=class{parts=new Map;part(e,t=[0,0,0],n=`solid`,r){return this.parts.has(e)||this.parts.set(e,{geos:[],pivot:t,mat:n,parent:r}),this}add(e,t,n,r=[0,0,0],i=[0,0,0]){this.parts.has(e)||this.part(e);let a=t.index?t.toNonIndexed():t;a.deleteAttribute(`uv`),a.deleteAttribute(`normal`),a.rotateX(i[0]),a.rotateY(i[1]),a.rotateZ(i[2]),a.translate(r[0],r[1],r[2]);let o=new W(n),s=a.getAttribute(`position`).count,c=new Float32Array(s*3);for(let e=0;e<s;e++)c.set([o.r,o.g,o.b],e*3);return a.setAttribute(`color`,new Ro(c,3)),this.parts.get(e).geos.push(a),this}build(e={}){let t=new Ya,n=new Map;for(let[e,t]of this.parts){let r;if(t.geos.length){let e=Kh(t.geos);e.translate(-t.pivot[0],-t.pivot[1],-t.pivot[2]),e.computeVertexNormals(),r=new G(e,Wh[t.mat])}else r=new Ya;r.name=e,n.set(e,r)}for(let[e,r]of this.parts){let i=n.get(e),a=r.parent?n.get(r.parent):void 0,o=r.parent?this.parts.get(r.parent).pivot:[0,0,0];i.position.set(r.pivot[0]-o[0],r.pivot[1]-o[1],r.pivot[2]-o[2]),(a??t).add(i)}return t.userData={...e},t}};function Kh(e){let t=0;for(let n of e)t+=n.getAttribute(`position`).count;let n=new Float32Array(t*3),r=new Float32Array(t*3),i=0;for(let t of e){let e=t.getAttribute(`position`).array,a=t.getAttribute(`color`).array;n.set(e,i*3),r.set(a,i*3),i+=t.getAttribute(`position`).count,t.dispose()}let a=new $o;return a.setAttribute(`position`,new Ro(n,3)),a.setAttribute(`color`,new Ro(r,3)),a}var q=(e,t,n,r=1)=>xh(e,t,n,r),J=(e,t)=>!!e.f?.includes(t),qh=(e,t,n,r=6)=>new jc(e,t,n,r);function Jh(e,t,n,r,i,a,o,s=6){let c=r[0]-n[0],l=r[1]-n[1],u=r[2]-n[2],d=qh(a,i,Math.hypot(c,l,u),s),f=new Qi().setFromUnitVectors(new H(0,1,0),new H(c,l,u).normalize());d.applyQuaternion(f),e.add(t,d,o,[(n[0]+r[0])/2,(n[1]+r[1])/2,(n[2]+r[2])/2])}function Yh(e,t,n=4){let r=new Ql(e,n);return r.rotateX(t>0?Math.PI/2:-Math.PI/2),r}function Xh(e,t,n,r,i,a,o,s,c,l=1.5){let[u,d,f]=r,p=i*.5;e.part(t,r,`solid`,n),e.add(t,q(a*l,p*.62,a*l*.8),o,[u,d-p*.3,f]),Jh(e,t,[u,d,f],[u,d-p,f],a*1.05,a*.8,o,5);let m=`${t}2`;e.part(m,[u,d-p,f],`solid`,t),e.add(m,q(a*.85,a*.85,a*.85,0),o,[u,d-p,f]),Jh(e,m,[u,d-p,f],[u,.04,f],a*.78,a*.55,o,5),s===`hoof`?e.add(m,qh(a*.6,a*.75,.06,6),c,[u,.03,f]):s===`paw`?e.add(m,q(a*1.25,a*.6,a*.95),c,[u+a*.5,a*.55,f]):e.add(m,q(a*1.3,a*.55,a*1),c,[u+a*.6,a*.5,f])}function Zh(e,t,n,r,i,a,o,s,c,l,u=0){let d=[...n],f=s,p=t;for(let t=0;t<r;t++){let n=t===0?`tail`:`tail${t+1}`;e.part(n,d,`solid`,p);let s=[d[0]-Math.cos(f)*i,d[1]+Math.sin(f)*i,d[2]],m=a+(o-a)*(t/r),h=a+(o-a)*((t+1)/r);if(u>0){let a=u*(.75+.5*Math.sin(t/Math.max(1,r-1)*Math.PI));e.add(n,q(i*.7,a,a*.8),l(t),[(d[0]+s[0])/2,(d[1]+s[1])/2,d[2]],[0,0,-f])}else Jh(e,n,d,s,m,h,l(t),5),e.add(n,q(m,m,m,0),l(t),d);p=n,d=s,f+=c}}function Qh(e){let[t,n,r,i,a,o=`#ffffff`]=e.c,s=new Gh,c=J(e,`longLegs`),l=c?.6:.14,u=l+.2,d=c?.05:.22,f=c?`#2a2a2a`:`#7a5b3a`;s.part(`body`),s.add(`body`,q(.29,.22,.21),t,[.04,u,0],[0,0,d]),s.add(`body`,new Mc(.17,.4,8),t,[-.26,u+.05+d*.25,0],[0,0,Math.PI/2+d]),s.add(`body`,q(.23,.16,.17),n,[.09,u-.07,0],[0,0,d]);for(let[e,t]of[[`legL`,1],[`legR`,-1]]){s.part(e,[.02,l+.02,t*.07],`solid`),s.add(e,q(.05,.06,.045),n,[.02,l+.05,t*.07]),Jh(s,e,[.02,l+.03,t*.07],[.03,.012,t*.07],.016,.012,f,4);for(let n of[-.45,0,.45])s.add(e,new kc(c?.14:.09,.012,.018),f,[.07,.008,t*.07+Math.sin(n)*.03],[0,n,0]);s.add(e,new kc(.06,.012,.016),f,[-.02,.008,t*.07])}let p=J(e,`veryLongTail`)?.95:J(e,`longTail`)?.5:.28,m=J(e,`cocked`)?.6:-.3;s.part(`tail`,[-.4,u+.07,0]);let h=new dl,g=J(e,`veryLongTail`)?.07:.1;h.moveTo(0,-.05),J(e,`forkTail`)?(h.lineTo(-p,-g*1.3),h.lineTo(-p*.7,0),h.lineTo(-p,g*1.3)):(h.lineTo(-p*.92,-g),h.quadraticCurveTo(-p*1.05,0,-p*.92,g)),h.lineTo(0,.05),s.add(`tail`,Yh(h,1),J(e,`veryLongTail`)?o:a,[-.38,u+.07,0],[0,0,-m*.7]);let _=J(e,`longNeck`),v=_?u+.52:u+.24,y=_?.36:.28;s.part(`head`,_?[.2,u+.12,0]:[y-.06,v-.1,0]),_&&(Jh(s,`head`,[.2,u+.1,0],[.26,u+.32,0],.07,.05,t),Jh(s,`head`,[.26,u+.32,0],[y-.02,v-.05,0],.05,.045,t)),s.add(`head`,q(.15,.14,.14),r,[y,v,0]);let b=J(e,`longBeak`)?.34:J(e,`spoon`)?.4:(J(e,`thickBeak`),.13),x=J(e,`thickBeak`)?.07:J(e,`hooked`)?.06:.035;s.add(`head`,new Mc(x,b,5),i,[y+.12+b/2-.05,v-(J(e,`hooked`)?.035:.02),0],[0,0,-Math.PI/2-(J(e,`hooked`)?.35:.05)]),J(e,`spoon`)&&s.add(`head`,q(.07,.015,.06,0),i,[y+.12+b-.04,v-.03,0]);for(let t of[-1,1])J(e,`eyering`)&&s.add(`head`,q(.042,.042,.02,0),`#ffffff`,[y+.07,v+.035,t*.12]),J(e,`mask`)&&s.add(`head`,q(.09,.035,.02,0),`#1a1a1a`,[y+.05,v+.03,t*.125]),s.add(`head`,new Yl(.027,0),J(e,`redEye`)?`#c8302a`:`#111111`,[y+.08,v+.035,t*.125]),s.add(`head`,new Yl(.009,0),`#ffffff`,[y+.1,v+.05,t*.14]),J(e,`cheek`)&&s.add(`head`,q(.055,.04,.02,0),o,[y+.03,v-.04,t*.13]);if(J(e,`crest`)){let t=J(e,`bigCrest`)?3:1;for(let n=0;n<t;n++)s.add(`head`,new Mc(.045,J(e,`bigCrest`)?.28:.15,4),J(e,`bigCrest`)||r===`#ffffff`?o:r,[y-.06-n*.03,v+.15+n*.02,0],[0,0,.5+n*.25])}J(e,`cap`)&&s.add(`head`,q(.11,.06,.11,0),o,[y-.02,v+.1,0]),J(e,`collar`)&&s.add(`body`,new tu(.11,.03,4,10),o,[y-.1,v-.15,0],[0,Math.PI/2,.4]);let S=J(e,`soar`),C=S?.8:c?.62:.44,w=S?.34:.28;for(let[n,r]of[[`wingL`,1],[`wingR`,-1]]){let i=[.04,u+.1,r*.14];s.part(n,i,`double`);let c=new dl;c.moveTo(w*.45,0),c.quadraticCurveTo(w*.55,C*.25,w*.35,C*.5),c.lineTo(-w*.5,C*.5),c.quadraticCurveTo(-w*.62,C*.2,-w*.5,0),s.add(n,Yh(c,r),a,i);let l=new dl;l.moveTo(w*.44,.01),l.quadraticCurveTo(w*.5,C*.25,w*.33,C*.48),l.lineTo(0,C*.46),l.lineTo(-.02,.01),s.add(n,Yh(l,r),t,[i[0],i[1]+.004,i[2]]);let d=`${n}2`,f=[i[0],i[1],r*(.14+C*.5)];s.part(d,f,`double`,n);let p=new dl;if(p.moveTo(w*.35,0),S){p.quadraticCurveTo(w*.3,C*.3,w*.1,C*.45);for(let e=0;e<4;e++){let t=w*(.05-e*.12);p.lineTo(t,C*(.56-e*.02)),p.lineTo(t-w*.07,C*(.44-e*.03))}p.lineTo(-w*.5,C*.12)}else J(e,`forkTail`)?(p.quadraticCurveTo(w*.2,C*.35,-w*.6,C*.7),p.quadraticCurveTo(-w*.4,C*.3,-w*.5,0)):(p.quadraticCurveTo(w*.3,C*.35,0,C*.55),p.quadraticCurveTo(-w*.35,C*.45,-w*.5,C*.18));if(p.lineTo(-w*.5,0),s.add(d,Yh(p,r),a,f),J(e,`wingpatch`)&&s.add(d,q(.06,.012,.07,0),o===`#111111`?`#ffffff`:o,[f[0]-.02,f[1]+.01,f[2]+r*C*.15]),J(e,`barred`))for(let e=0;e<3;e++)s.add(d,new kc(.025,.01,C*.4),`#f2f2f2`,[f[0]-.08+e*.06,f[1]+.01,f[2]+r*C*.2])}return s.build({rig:`bird`,legLen:l})}function $h(e){let[t,n,r]=e.c,i=new Gh;i.add(`body`,q(.3,.4,.28),t,[0,.4,0]),i.add(`body`,q(.24,.2,.08),n,[.22,.6,0],[0,Math.PI/2,0]);for(let e of[-1,1])i.add(`body`,new Yl(.07,1),r,[.29,.63,e*.1]),i.add(`body`,new Yl(.035,0),`#111111`,[.35,.63,e*.1]),i.add(`body`,new Mc(.06,.16,4),`#6e5842`,[.05,.86,e*.15]);return i.build()}function eg(){let e=new Gh;e.add(`body`,new jc(.42,.26,.2,9,1,!0),`#8a6440`,[0,.1,0]),e.add(`body`,new tu(.4,.08,4,10),`#a07448`,[0,.2,0],[Math.PI/2,0,0]),e.add(`body`,new Ac(.3,9),`#6d4e31`,[0,.05,0],[-Math.PI/2,0,0]);for(let t=0;t<3;t++){let n=t*2.1;e.add(`body`,q(.1,.13,.1),`#9fd3e6`,[Math.cos(n)*.13,.15,Math.sin(n)*.13],[0,0,.3*(t-1)])}let t=e.build();return t.children.forEach(e=>e.material=Wh.double),t}function tg(e){let[t,n,r,i]=e.c,a=new Gh,o=J(e,`stocky`),s=J(e,`catEars`),c=J(e,`cowTail`),l=J(e,`antlers`),u=J(e,`tusks`),d=J(e,`short`),f=J(e,`longLegs`)?c?.5:.56:d?.2:s?.34:.3,p=s?[.44,.17,.14]:l?[.42,.19,.15]:[.46,o?.27:.2,o?.25:.17],m=f+p[1]*.72,h=[-p[0]*.55,m,0];if(a.part(`torso`,h),a.part(`body`,[0,0,0],`solid`,`torso`),a.add(`body`,q(p[0]*.62,p[1]*1.02,p[2]),t,[-p[0]*.36,m,0]),a.add(`body`,q(p[0]*.64,p[1]*1.06,p[2]*1.04),t,[p[0]*.3,m+p[1]*.04,0]),a.add(`body`,q(p[0]*.8,p[1]*.55,p[2]*.85),n,[.02,m-p[1]*.42,0]),c&&a.add(`body`,q(p[0]*.35,p[1]*.5,p[2]*.7),t,[p[0]*.45,m+p[1]*.75,0]),J(e,`spots`))for(let e=0;e<14;e++)a.add(`body`,q(.045,.032,.012,0),i,[-.34+e%7*.11,m+(e<7?.08:-.03),(e%2?1:-1)*p[2]*.95]);if(J(e,`scales`))for(let e=0;e<24;e++){let n=-.42+e%8*.12,r=Math.floor(e/8);a.add(`body`,q(.09,.03,.11,0),e%2?i:t,[n,m+p[1]*(.85-r*.3),(r-1)*p[2]*.75],[(r-1)*.6,0,.3])}if(J(e,`spines`))for(let e=0;e<22;e++){let t=-.45+e%11*.075,n=(e<11?1:-1)*.09;a.add(`body`,new Mc(.025,.48,3),e%2?i:`#1a1a1a`,[t-.12,m+p[1]*.9+.1,n],[n*4,0,1.15])}J(e,`bristle`)&&a.add(`body`,new kc(.7,.08,.05),`#2a221c`,[0,m+p[1]*.98,0]);let g=l?1:c?.35:u?.12:s?.75:d?.25:.5,_=l?.34:c?.22:u?.12:s?.17:.15,v=[p[0]*.62,m+p[1]*.35,0],y=[v[0]+Math.cos(g)*_,v[1]+Math.sin(g)*_,0];a.part(`neck`,v,`solid`,`torso`),Jh(a,`neck`,v,y,p[2]*.75,p[2]*(c||u?.75:.55),t,7),c&&a.add(`neck`,q(.1,.14,.08),n,[v[0]+.06,v[1]-.15,0]),a.part(`head`,y,`solid`,`neck`);let b=c?1.25:u?1.15:l?.9:s?.85:.8,x=y[0]+.06*b,S=y[1]+(c||u?-.02:.02);a.add(`head`,q(.14*b,.12*b,.11*b),r,[x,S,0]);let C=(J(e,`snout`)?.16:s?.05:c?.13:l?.12:.08)*b,w=[x+.1*b+C*.5,S-.04*b,0];if(a.add(`head`,q(C*.75+.03,.065*b,.07*b),J(e,`mask`)||J(e,`blaze`)?i:r,w,[0,0,-.12]),a.add(`head`,q(.03*b,.028*b,.05*b,0),u?`#c89a8a`:`#1a1a1a`,[w[0]+C*.55+.02,w[1]+.005,0]),J(e,`blaze`)&&a.add(`head`,new kc(.24*b,.028,.04),`#f2eee6`,[x+.05,S+.09*b,0],[0,0,-.15]),J(e,`mask`))for(let e of[-1,1])a.add(`head`,q(.07,.028,.02,0),`#f2eee6`,[x+.02,S+.055*b,e*.09*b]);for(let t of[-1,1]){let n=x+.085*b;a.add(`head`,new Yl(.024*b,0),`#111111`,[n,S+.035*b,t*.075*b]),a.add(`head`,new Yl(.008*b,0),`#ffffff`,[n+.012,S+.045*b,t*.088*b]),s?a.add(`head`,new Mc(.045,.1,3),r,[x-.03,S+.12*b,t*.065],[t*.2,0,0]):c?a.add(`head`,q(.08,.03,.045),r,[x-.04,S+.06,t*.16],[t*.3,0,0]):a.add(`head`,new Mc(.04*b,.11*b,5),r,[x-.05*b,S+.11*b,t*.08*b],[t*.5,0,.1]),l&&(Jh(a,`head`,[x-.03,S+.1,t*.04],[x-.06,S+.26,t*.07],.016,.01,`#5b4331`,4),Jh(a,`head`,[x-.06,S+.26,t*.07],[x+0,S+.3,t*.06],.01,.006,`#5b4331`,4)),J(e,`horns`)&&(Jh(a,`head`,[x-.03,S+.1,t*.09],[x-.02,S+.14,t*.2],.03,.022,i,5),Jh(a,`head`,[x-.02,S+.14,t*.2],[x+.02,S+.24,t*.22],.022,.006,i,5)),J(e,`bigHorns`)&&(Jh(a,`head`,[x-.04,S+.1,t*.08],[x-.12,S+.14,t*.3],.045,.035,i,5),Jh(a,`head`,[x-.12,S+.14,t*.3],[x-.26,S+.22,t*.36],.035,.008,i,5)),J(e,`tusks`)&&a.add(`head`,new Mc(.014,.08,3),`#f2eee0`,[w[0]+.02,w[1]+.02,t*.06],[0,0,-.4])}let T=c||l||u,E=c?.055:o?.05:l?.028:.036,D=p[0]*.58,O=p[2]*.62,k=m-p[1]*.25,A=J(e,`short`)||J(e,`mask`)?i===`#f2eee6`?t:r:t;for(let[e,n,r]of[[`legFL`,D,O],[`legFR`,D,-O],[`legBL`,-D,O],[`legBR`,-D,-O]])Xh(a,e,`torso`,[n,k,r],k,E,n<0?t:A,T?`hoof`:`paw`,T?`#2a2420`:A,n<0?1.9:1.5);let j=[-p[0]*.95,m+p[1]*.35,0];if(J(e,`longTail`)){let n=J(e,`scales`),r=n?.09:s?.03:.045;Zh(a,`torso`,j,4,n?.14:.13,r,n?.03:r*.7,n?-.25:s?.15:-.35,s?.25:.12,n=>J(e,`ringTail`)&&n%2?i:t)}else c?(Zh(a,`torso`,[j[0],j[1]+.03,0],2,.22,.02,.014,-1.35,.05,()=>t),a.add(`tail2`,q(.035,.08,.035,0),`#1a1a1a`,[j[0]-.06,j[1]-.43,0])):u?Zh(a,`torso`,j,2,.07,.015,.01,-.9,1.2,()=>t):Zh(a,`torso`,j,1,.08,.05,.04,.2,0,()=>l?`#f2eee6`:n,.06);let ee=+!!s;return a.build({rig:`quad`,legLen:k,hipY:m,sit:ee,neckAng:g})}function ng(e){let[t,n,r]=e.c,i=new Gh,a=new W(t).multiplyScalar(.72).getStyle(),o=.4,s=[-.16,o,0];i.part(`torso`,s),i.part(`body`,[0,0,0],`solid`,`torso`),i.add(`body`,q(.2,.17,.15),t,[.1,.49,0],[0,0,.18]),i.add(`body`,q(.2,.14,.13),t,[-.12,.44,0],[0,0,.1]),i.add(`body`,q(.16,.1,.11),n,[.02,.38,0]),i.add(`body`,q(.05,.06,.08),`#d98b86`,[-.3,.4,0]),i.part(`head`,[.28,.56,0],`solid`,`torso`),i.add(`head`,q(.12,.12,.12),t,[.36,.63,0]),i.add(`head`,q(.06,.1,.09),r,[.44,.61,0]),i.add(`head`,q(.055,.045,.06),r,[.48,.565,0]),i.add(`head`,new kc(.05,.025,.15),a,[.46,.665,0]),i.add(`head`,q(.09,.04,.1),t,[.35,.72,0]);for(let e of[-1,1])i.add(`head`,new Yl(.018,0),`#2a1a12`,[.495,.635,e*.035]),i.add(`head`,new Yl(.008,0),`#3a2418`,[.53,.575,e*.014]),i.add(`head`,q(.025,.04,.02),r,[.36,.64,e*.125]);for(let[e,n,s,c]of[[`legFL`,.2,.1,.5],[`legFR`,.2,-.1,.5],[`legBL`,-.22,.09,o],[`legBR`,-.22,-.09,o]]){let l=n>0;Xh(i,e,`torso`,[n,l?.5:o,s],c,l?.034:.04,t,`hand`,l?r:a,l?1.3:2.1)}return Zh(i,`torso`,[-.32,.46,0],3,.1,.03,.018,.9,-.75,()=>t),i.build({rig:`monkey`,legLen:o,hipY:o})}function rg(e){let[t,n,r]=e.c,i=new Gh;i.part(`torso`,[-.12,.2,0]),i.part(`body`,[0,0,0],`solid`,`torso`),i.add(`body`,q(.2,.13,.12),t,[0,.24,0],[0,0,.3]),i.add(`body`,q(.14,.09,.1),n,[.05,.2,0],[0,0,.3]),i.add(`body`,q(.12,.11,.12),t,[-.12,.2,0]),i.part(`head`,[.16,.3,0],`solid`,`torso`),i.add(`head`,q(.11,.095,.09),t,[.24,.36,0]),i.add(`head`,q(.05,.045,.05),t,[.33,.34,0]),i.add(`head`,new Yl(.012,0),`#2a1a12`,[.38,.35,0]);for(let e of[-1,1])i.add(`head`,new Mc(.03,.08,4),t,[.21,.46,e*.05]),i.add(`head`,new Yl(.022,0),`#111111`,[.3,.385,e*.06]),i.add(`head`,new Yl(.007,0),`#ffffff`,[.31,.395,e*.075]);for(let[e,r,a,o]of[[`legFL`,.12,.06,.2],[`legFR`,.12,-.06,.2],[`legBL`,-.12,.07,.2],[`legBR`,-.12,-.07,.2]])Xh(i,e,`torso`,[r,o,a],o,.022,r>0?n:t,`paw`,t,r>0?1.4:3);return Zh(i,`torso`,[-.22,.22,0],4,.12,.05,.05,1.15,.42,e=>e%2?r:t,.085),i.build({rig:`squirrel`,legLen:.2,hipY:.2})}function ig(e){let[t,n,r]=e.c,i=new Gh;i.add(`body`,q(.2,.12,.12),t,[0,.2,0]),i.add(`body`,q(.1,.09,.09),r,[.2,.24,0]);for(let e of[-1,1])i.add(`body`,new Mc(.035,.1,3),r,[.18,.34,e*.05]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]]){i.part(e,[0,.22,t*.08],`double`);let r=new dl;r.moveTo(0,0),r.lineTo(.18,.45),r.lineTo(.02,.36),r.lineTo(-.02,.5),r.lineTo(-.12,.34),r.lineTo(-.2,.05);let a=new Ql(r);a.rotateX(t>0?Math.PI/2:-Math.PI/2),i.add(e,a,n,[0,.22,t*.08])}return i.build()}function ag(e){let[t,n,r,i]=e.c,a=J(e,`moth`),o=new Gh,s=.03;o.part(`body`),o.add(`body`,q(.07,.035,.035),r,[.04,s,0]),o.add(`body`,q(.14,.028,.028),r,[-.13,.024999999999999998,0]),o.add(`body`,new Yl(.03,0),r,[.13,.034999999999999996,0]);for(let e of[-1,1])Jh(o,`body`,[.14,.05,e*.01],[.28,.13,e*.07],.004,.004,r,3),o.add(`body`,a?q(.03,.006,.02,0):new Yl(.012,0),r,[.28,.13,e*.07]);let c=a?1.25:1;for(let[r,l]of[[`wingL`,1],[`wingR`,-1]]){o.part(r,[0,s,l*.02],`double`);let u=new dl;u.moveTo(.06*c,0),u.bezierCurveTo(.16*c,.06*c,.26*c,.22*c,.2*c,.34*c),u.quadraticCurveTo(.06*c,.33*c,-.03*c,.1*c),u.lineTo(-.03*c,0),o.add(r,Yh(u,l,6),t,[0,s,l*.02]);let d=new dl;d.moveTo(.15*c,.2*c),d.quadraticCurveTo(.24*c,.28*c,.19*c,.33*c),d.quadraticCurveTo(.1*c,.31*c,.08*c,.22*c),o.add(r,Yh(d,l,4),a?i??`#ffffff`:n,[0,s+.002*l,l*.02]);let f=new dl;if(f.moveTo(0,0),f.bezierCurveTo(.02*c,.14*c,-.06*c,.26*c,-.17*c,.23*c),f.quadraticCurveTo(-.26*c,.1*c,-.08*c,0),o.add(r,Yh(f,l,6),a?t:n,[0,.027999999999999997,l*.02]),i){let e=new Ac(.025*c,6);e.rotateX(-Math.PI/2),o.add(r,e,i,[.17*c,.034,l*(.02+.27*c)]),a&&o.add(r,e.clone(),i,[-.1*c,.034,l*(.02+.15*c)])}if(J(e,`tails`)){let e=new dl;e.moveTo(-.15*c,.2*c),e.lineTo(-.3*c,.3*c),e.lineTo(-.28*c,.33*c),e.lineTo(-.12*c,.23*c),o.add(r,Yh(e,l),n,[0,.027,l*.02])}}return o.build({rig:`butterfly`})}function og(e){let[t,n]=e.c,r=new Gh;r.add(`body`,new jc(.02,.012,.6,4),t,[-.2,.05,0],[0,0,Math.PI/2]),r.add(`body`,q(.08,.05,.05),t,[.1,.05,0]),r.add(`body`,q(.06,.06,.08),`#5a2a22`,[.2,.06,0]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]])r.part(e,[.08,.07,0],`glass`),r.add(e,q(.05,.004,.24,0),n,[.12,.07,t*.26]),r.add(e,q(.05,.004,.22,0),n,[0,.07,t*.24]);return r.build()}function sg(e){let[t,n,r]=e.c,i=new Gh;i.add(`body`,q(.18,.12,.12),t,[-.05,.12,0]);for(let e of[-.12,0])i.add(`body`,q(.03,.125,.125,1),n,[e,.12,0]);i.add(`body`,q(.08,.08,.08),n,[.16,.13,0]);for(let[e,t]of[[`wingL`,1],[`wingR`,-1]])i.part(e,[.02,.2,0],`glass`),i.add(e,q(.08,.004,.14,0),r,[0,.22,t*.14]);return i.build()}function cg(e){let[t,n]=e.c,r=new Gh;if(r.add(`body`,new eu(.16,8,5,0,Math.PI*2,0,Math.PI/2),t,[0,0,0]),r.add(`body`,new Yl(.07,0),n,[.15,.03,0]),J(e,`dots`))for(let e=0;e<5;e++)r.add(`body`,new Yl(.03,0),n,[Math.cos(e*1.3)*.08,.12,Math.sin(e*1.3)*.08]);J(e,`horn`)&&r.add(`body`,new Mc(.025,.22,4),n,[.25,.1,0],[0,0,-.9]);for(let e of[-1,1])for(let t of[-.06,.02,.1])r.add(`body`,new jc(.008,.008,.1,3),n,[t,.02,e*.15],[e*1.1,0,0]);return r.build()}function lg(e){let[t,n,r]=e.c,i=new Gh;return i.add(`body`,q(.22,.09,.1),t,[0,.09,0]),i.add(`body`,q(.07,.07,.12,0),r,[.2,.1,0]),i.part(`wingL`,[.05,.16,0],`glass`).add(`wingL`,q(.26,.02,.14,0),n,[-.05,.16,0]),i.build()}function ug(e){let[t,n]=e.c,r=new Gh;r.add(`body`,new jc(.03,.05,.5,4),t,[-.1,.12,0],[0,0,Math.PI/2-.2]),r.add(`body`,new jc(.02,.025,.25,4),t,[.2,.22,0],[0,0,-.4]),r.part(`head`,[.3,.3,0]),r.add(`head`,new Mc(.06,.1,3),t,[.33,.33,0],[0,0,-Math.PI/2]);for(let e of[-1,1]){r.add(`body`,new jc(.012,.012,.18,3),n,[.3,.2,e*.05],[0,0,.6]);for(let t of[-.05,-.2])r.add(`body`,new jc(.008,.008,.2,3),n,[t,.06,e*.08],[e*1,0,0])}return r.build()}function dg(e){let[t,n]=e.c,r=new Gh;r.add(`body`,new jc(.018,.024,.8,4),t,[0,.05,0],[0,0,Math.PI/2]);for(let e of[-1,1])for(let t of[-.2,.05,.25])r.add(`body`,new jc(.007,.007,.26,3),n,[t,.02,e*.1],[e*1.2,0,.3]);return r.build()}function fg(e){let[t]=e.c,n=new Gh;return n.add(`body`,q(.2,.08,.08),t,[0,.08,0]),n.part(`glow`,[0,0,0],`glow`).add(`glow`,q(.1,.09,.09),`#f6ff9a`,[-.18,.08,0]),n.build()}function pg(e){let[t,n,r]=e.c,i=J(e,`newt`),a=new Gh;a.add(`body`,q(.26,.07,.1),t,[0,.08,0]),i&&a.add(`body`,q(.22,.03,.08),n,[0,.03,0]),a.part(`head`,[.2,.09,0]),a.add(`head`,q(.12,.06,.08),i?t:n,[.3,.1,0]);for(let t of[-1,1])a.add(`head`,new Yl(J(e,`gecko`)?.03:.02,0),`#111111`,[.34,.14,t*.05]);a.part(`tail`,[-.24,.07,0]),a.add(`tail`,new Mc(.06,.55,4),r,[-.5,.06,0],[0,0,Math.PI/2]);for(let[e,n,r]of[[`legFL`,.13,.1],[`legFR`,.13,-.1],[`legBL`,-.13,.1],[`legBR`,-.13,-.1]])a.part(e,[n,.07,r]),a.add(e,new jc(.015,.015,.1,3),t,[n,.04,r+Math.sign(r)*.03],[Math.sign(r)*.9,0,0]);return a.build()}function mg(e){let[t,n,r]=e.c,i=new Gh;for(let r=0;r<12;r++){let a=r/11,o=.3-a*1.1,s=Math.sin(a*7)*.12,c=.05*(1-a*.6),l=J(e,`blotch`)&&r%2==0;i.add(`body`,new Yl(c*1.3,0),l||r===11&&n===`#d8402a`?n:t,[o,c,s])}i.part(`head`,[.34,.05,0]),i.add(`head`,q(.09,.05,.065),t,[.4,.06,0]),i.add(`head`,q(.06,.02,.05),r,[.4,.03,0]);for(let e of[-1,1])i.add(`head`,new Yl(.015,0),`#f0d040`,[.44,.09,e*.04]);return i.build()}function hg(e){let[t,n,r]=e.c,i=new Gh;i.add(`body`,new eu(.28,8,5,0,Math.PI*2,0,Math.PI/2),t,[0,.06,0]);for(let e of[-.1,0,.1])i.add(`body`,new kc(.46,.02,.025),n,[0,.2-Math.abs(e)*.6,e],[e*2,0,0]);i.part(`head`,[.24,.08,0]),i.add(`head`,q(.1,.07,.07),r,[.33,.1,0]);for(let[e,t,n]of[[`legFL`,.15,.2],[`legFR`,.15,-.2],[`legBL`,-.15,.2],[`legBR`,-.15,-.2]])i.part(e,[t,.06,n]),i.add(e,q(.06,.04,.06,0),r,[t,.04,n]);return i.build()}function gg(e){let[t,n,r]=e.c,i=new Gh;i.add(`body`,q(.2,.13,.17),t,[0,.14,0],[0,0,.3]),i.add(`body`,q(.16,.08,.14),n,[.03,.08,0]);for(let e of[-1,1])i.add(`body`,new Yl(.05,0),t,[.14,.25,e*.08]),i.add(`body`,new Yl(.03,0),`#111111`,[.17,.27,e*.09]),i.add(`body`,q(.03,.05,.03,0),t,[.14,.05,e*.12]);if(J(e,`warty`))for(let e=0;e<8;e++)i.add(`body`,new Yl(.022,0),r,[-.1+e%4*.06,.24,(e<4?1:-1)*.06]);for(let[e,n]of[[`legBL`,1],[`legBR`,-1]])i.part(e,[-.1,.1,n*.14]),i.add(e,q(.14,.05,.05),t,[-.14,.06,n*.16],[0,n*.4,.2]);return i.build()}var _g={bird:Qh,owl:$h,quad:tg,monkey:ng,squirrel:rg,bat:ig,butterfly:ag,dragonfly:og,bee:sg,beetle:cg,cicada:lg,mantis:ug,stick:dg,firefly:fg,lizard:pg,snake:mg,turtle:hg,frog:gg},vg=new Map,yg=new Map;function bg(e){let t=yg.get(e);if(t)return t;let n=Sg(e);return t=n?new bo().setFromObject(n).getSize(new H):new H(1,1,1),yg.set(e,t),t}function xg(e){let t=bg(e.id);return(e.look.kind===`butterfly`||e.motion===`bat`)&&e.real.span?e.real.span/Math.max(.001,t.z):e.real.len/Math.max(.001,t.x)}function Sg(e){let t=vg.get(e);if(t)return t;if(e===`nest`)t=eg();else{let n=vt(e);if(!n)return null;t=_g[n.look.kind](n.look)}return vg.set(e,t),t}function Cg(e){let t=t=>e.getObjectByName(t)??void 0,n=[];for(let e of[`legFL`,`legFR`,`legBL`,`legBR`,`legL`,`legR`]){let r=t(e);r&&n.push({up:r,lo:t(`${e}2`)})}let r=[];for(let e=1;e<=6;e++){let n=t(e===1?`tail`:`tail${e}`);if(!n)break;r.push(n)}let i=t(`torso`),a=e.userData;return{kind:a.rig??`basic`,torso:i,torsoY:i?i.position.y:0,neck:t(`neck`),head:t(`head`),legs:n,tails:r,tailRest:r.map(e=>e.rotation.z),wingL:t(`wingL`),wingR:t(`wingR`),wingL2:t(`wingL2`),wingR2:t(`wingR2`),glow:t(`glow`),legLen:a.legLen??.3,neckAng:a.neckAng??.5}}var wg=[.25,.75,0,.5],Tg=[0,.1,.5,.6];function Eg(e,t){let n=e.kind===`monkey`,r=e.kind===`squirrel`,i=n?1.15:r?1.05:.55,a=n?.15:r?.07:e.legLen*.5,o=e.legLen*.82,s=L(1-t.sit-t.lie,0,1),c=t.run,l=t.walk*s,u=Math.PI*2;if(e.legs.forEach((e,a)=>{let o=a<2,d=(wg[a]??0)*(1-c)+(Tg[a]??0)*c,f=t.gait+d*u,p=.4+c*.4,m=Math.sin(f)*p*l+(o?0:.06),h=-Math.max(0,Math.cos(f))*(.55+c*.6)*l-(o?0:.12)*s,g=n?o?-.55:.2:r?o?-.2:.45:o?-i:.8,_=n?o?.35:-1.35:r?o?-1.1:-1.7:o?0:-2.3,v=o?-1.25:1.3,y=o?2.5:-2.5;m=m*s+g*t.sit+v*t.lie,h=h*s+_*t.sit+y*t.lie,e.up.rotation.set(0,0,m),e.lo&&e.lo.rotation.set(0,0,h)}),e.torso){let n=l*(c>.5?Math.abs(Math.sin(t.gait))*.05:Math.cos(t.gait*2)*.01);e.torso.position.y=e.torsoY-a*t.sit-o*t.lie+n,e.torso.rotation.set(0,0,i*t.sit+Math.sin(t.gait)*.07*c*l+(r?Math.sin(t.gait)*.12*l:0))}let d=e.neckAng+.6;if(e.neck&&e.neck.rotation.set(0,0,-t.graze*d+Math.sin(t.gait*2)*.04*l),e.head){let n=t.sniff*(Math.sin(t.t*9)*.06-.35);e.head.rotation.set(0,t.look*(1-t.graze*.7),-i*t.sit*.8-t.graze*.25+n+(e.neck?0:-t.graze*.8))}e.tails.forEach((i,a)=>{let o=Math.sin(t.t*(r?3:2.2)-a*.7)*(.12+.1*a)*(r?.6:1);i.rotation.set(0,o,(e.tailRest[a]??0)+(n?-.35*t.sit:0)+(r?Math.sin(t.t*1.3-a)*.08:0)-(a===0?c*.3:0))})}function Dg(e,t,n,r,i){let a=1-t;for(let[o,s,c]of[[e.wingL,e.wingL2,1],[e.wingR,e.wingR2,-1]])o&&(o.rotation.set(-c*(n+i)*t,-c*1.5*a,1.35*a),s&&s.rotation.set(-c*(r-i*.5)*t,-c*.2*a,0))}function Og(e){let t=Sg(e);if(!t)return null;let n=t.clone(),r=vt(e),i=Cg(n),a={gait:1.1,walk:1,run:0,sit:0,graze:0,lie:0,look:.35,t:.6,sniff:0};if(r?.look.kind===`bird`)r.motion===`soar`?Dg(i,1,-.15,.1,.1):Dg(i,0,0,0,0),i.head&&(i.head.rotation.y=.3);else if(i.kind===`monkey`)Eg(i,{...a,walk:0,sit:1,look:.5});else if(i.kind===`squirrel`)Eg(i,{...a,walk:0,sit:1,look:.3});else if(i.kind===`quad`)Eg(i,a);else if(i.kind===`butterfly`)for(let[e,t]of[[i.wingL,1],[i.wingR,-1]])e?.rotation.set(-t*.45,0,0);if(e===`magpierobin`){let e=new Ya,t=Sg(`nest`).clone();return n.position.set(.1,.25,.3),n.scale.setScalar(.8),e.add(t,n),e}return n}function kg(e,t){Dg(Cg(e),1-t,0,0,0)}var Ag=new Set([`perch`,`flock`,`soar`,`hover`,`flutter`,`bat`]),jg=new Set([`walk`,`hop`,`wade`]),Mg=80;function Ng(e){return e.category===`bird`&&e.real.len<=.35&&(e.motion===`flock`||e.motion===`perch`||e.motion===`hover`)}function Pg(e){return(e.category===`insect`||e.category===`butterfly`)&&e.motion!==`glow`}function Fg(e,t,n){let r=L((n-e)/(t-e),0,1);return r*r*(3-2*r)}function Ig(e){return Math.atan2(-e.z,e.x)}var Lg=1,Rg=null,zg=null;function Bg(e,t){if(Rg)return Rg(e,t)+.004*Lg;let n=Math.hypot(e,t)/Lg;return n>7?-.02*Lg:Lg*(.02+.18*(1-Math.min(1,n/7)**2))}var Vg=new Set([`muntjac`,`leopardcat`,`otter`,`macaque`,`civet`,`smallcivet`,`ferretbadger`]);function Hg(e){let t=e.look.f??[];return e.look.kind===`monkey`?[`sit`,`sit`,`groom`,`look`,`climb`,`climb`]:e.look.kind===`bird`?e.motion===`wade`?[`strike`,`look`,`preen`,`strike`]:[`peck`,`peck`,`look`,`preen`]:e.look.kind===`quad`?t.includes(`cowTail`)?[`graze`,`graze`,`look`,`lie`]:t.includes(`antlers`)?[`graze`,`graze`,`look`]:t.includes(`catEars`)?[`sit`,`look`,`sniff`,`sit`]:e.id===`otter`?[`sit`,`sniff`,`look`]:[`sniff`,`sniff`,`look`,`graze`]:[`look`]}var Ug=new H,Wg=new H,Gg=new H,Kg=new Set([`perch`,`flock`,`soar`,`hover`,`flutter`,`bat`]),qg=new H(0,1,0),Jg=new xa,Yg=new H,Xg=new H,Zg=new H;function Qg(e,t,n){Yg.copy(t).normalize(),Zg.crossVectors(Yg,n).normalize(),Xg.crossVectors(Zg,Yg).normalize(),Jg.makeBasis(Yg,Xg,Zg),e.quaternion.setFromRotationMatrix(Jg)}var $g=class{root=new Ya;crews=[];tree=null;pool=[];residents=[];night=!1;weak=!1;stage=0;islandR=7;af=1;nextRotate=8;nextArrival=3;time=0;fly=e_();perchTaken=new Set;rng=Math.random;uidNext=1;arrivals=[];hints=new Zm;view={cam:new H(0,5,20),perPx:.002,dpr:1};constructor(){this.fly.points.visible=!1,this.root.add(this.fly.points),this.root.add(this.hints.group)}setView(e,t,n){this.view.cam.copy(e),this.view.perPx=t,this.view.dpr=n}screenPx(e,t){return this.dlen(e)/Math.max(1e-4,t.distanceTo(this.view.cam)*this.view.perPx)}markers(e,t,n){let r=[],i=2*Math.tan(Zi.degToRad(e.fov/2))/Math.max(1,n),a=new H,o=new H;for(let s of this.crews){if(s.leaving||s.def.motion===`glow`)continue;let c=s.members.filter(e=>e.obj.visible);if(!c.length)continue;a.set(0,0,0);for(let e of c)a.add(e.pos);a.multiplyScalar(1/c.length);let l=a.distanceTo(e.position);o.copy(a).project(e),!(o.z>1||o.z<-1||Math.abs(o.x)>1.02||Math.abs(o.y)>1.02)&&r.push({uid:s.uid,id:s.def.id,name:s.def.name,category:s.def.category,kind:s.def.look.kind,count:s.members.length,x:(o.x+1)/2*t,y:(1-o.y)/2*n,px:this.dlen(s.def)/Math.max(1e-4,l*i),resident:s.resident})}return r}crewList(){return this.visibleCrews().map(e=>({uid:e.uid,id:e.def.id,name:e.def.name,category:e.def.category,kind:e.def.look.kind,count:e.members.length,resident:e.resident}))}handleFor(e){let t=this.crews.find(t=>t.uid===e&&!t.leaving);if(!t||!t.members.length)return null;let n=t.members.filter(e=>e.obj.visible),r=n.length?n:t.members,i=Ag.has(t.def.motion)?r.filter(e=>e.mode===`fly`):[],a=i.length?i:r;return{crew:t,member:a[Math.floor(Math.random()*a.length)]}}otherMember(e){let t=e;if(!t||!this.crews.includes(t.crew))return null;let n=t.crew.members.filter(e=>e!==t.member&&e.obj.visible);if(!n.length)return null;let r=n.filter(e=>e.mode===`fly`),i=r.length?r:n;return{crew:t.crew,member:i[Math.floor(Math.random()*i.length)]}}takeArrivals(){let e=this.arrivals;return this.arrivals=[],e}hintStats(){return this.hints.stats}pickOption(e){let t=e.map(e=>zm(vt(e))?2.5:1),n=this.rng()*t.reduce((e,t)=>e+t,0);for(let r=0;r<e.length;r++)if(n-=t[r],n<=0)return e[r];return e[e.length-1]}setIslandRadius(e,t=1){this.islandR=e,Lg=t}setGround(e,t){Rg=e,zg=t}factor(){return this.af}drawnSizes(){let e=[];for(let t of this.visibleCrews()){let n=t.members[0];if(!n)continue;let r=new bo().setFromObject(Sg(t.def.id)).getSize(new H),i=(t.def.look.kind===`butterfly`||t.def.motion===`bat`)&&t.def.real.span,a=(i?r.z:r.x)*n.scale,o=i?t.def.real.span:t.def.real.len;e.push({id:t.def.id,realLen:o,drawnLen:a,ratio:a/o})}return e}walkerSpots(){let e=[],t=(uh(this.islandR)-eh)*Lg;for(let n of this.crews)if(jg.has(n.def.motion)&&!n.leaving&&n.def.motion!==`wade`)for(let r of n.members){if(r.climb)continue;let i=zg?!zg(r.pos.x,r.pos.z):!1;e.push({id:n.def.id,x:r.pos.x,z:r.pos.z,r:Math.hypot(r.pos.x,r.pos.z),limit:t,wet:i,why:i?`L${zg(n.leader.x,n.leader.z)?`dry`:`wet`} T${zg(n.leaderTarget.x,n.leaderTarget.z)?`dry`:`wet`} p${n.pause.toFixed(1)} e${n.enter.toFixed(2)} ${n.phase} L${n.leader.x.toFixed(1)},${n.leader.z.toFixed(1)} T${n.leaderTarget.x.toFixed(1)},${n.leaderTarget.z.toFixed(1)}`:``})}return e}pick(e,t){let n=null,r=1,i=new H;for(let a of this.crews)if(!(a.leaving||a.def.motion===`glow`))for(let o of a.members){if(!o.obj.visible)continue;let s=i.subVectors(o.pos,e.origin).dot(e.direction);if(s<=0)continue;let c=e.distanceToPoint(o.pos)/Math.max(this.dlen(a.def)*.7,t(s));c<r&&(r=c,n={crew:a,member:o})}return n}focusRef(e){let t=e;if(!t||t.crew.gone||t.crew.leaving||!this.crews.includes(t.crew)||!t.crew.members.includes(t.member))return null;let n=t.crew,r=t.member,i=Ag.has(n.def.motion);return{pos:r.pos,size:this.dlen(n.def),yaw:r.yaw,outward:i,flying:i&&r.mode===`fly`,perched:i&&r.mode===`perch`,group:n.members.length}}flyerHeights(){let e=this.tree;if(!e)return[];let t=e.group.getWorldPosition(new H).y,n=[];for(let r of this.crews)if(Kg.has(r.def.motion))for(let i of r.members)n.push({id:r.def.id,y:i.pos.y-t,ceiling:ih(e.height),perched:i.lastPerched??!1,len:this.dlen(r.def)});return n}refName(e){let t=e;return t&&this.crews.includes(t.crew)?t.crew.def.name:null}sync(e){let t=this.tree!==e.tree;this.tree=e.tree,this.pool=e.unlocked.filter(e=>vt(e)),this.residents=e.residents.filter(e=>vt(e)).slice(0,3);let n=this.night!==e.night;this.night=e.night,this.weak=e.health<22;let r=L(Math.round(e.stage??this.stage),0,4),i=r!==this.stage;this.stage=r;let a=ah(e.tree.height),o=Math.abs(a-this.af)>1e-6;this.af=a,(t||o)&&this.reseat();for(let e of this.crews)e.forced||(e.resident=this.residents.includes(e.def.id),(!this.fits(e.def)||!e.resident&&!this.pool.includes(e.def.id)||!e.resident&&!Um(e.def,this.stage))&&this.retire(e));this.trimToCap();for(let e of this.residents)!this.crews.some(t=>t.def.id===e&&!t.leaving)&&this.fits(vt(e))&&this.spawn(e,{resident:!0});(n||i||this.visibleCrews().length===0)&&this.fill()}fits(e){return this.weak&&![`butterfly`,`sparrow`].includes(e.id)?!1:e.motion===`hollow`||e.motion===`nest`?!0:this.night?!!e.night||e.motion===`glow`:!e.night}visibleCrews(){return this.crews.filter(e=>!e.leaving)}visitors(){return this.visibleCrews().filter(e=>!e.resident&&!e.forced)}memberCount(){return this.crews.reduce((e,t)=>e+t.members.length,0)}visitorMembers(){return this.visitors().reduce((e,t)=>e+t.members.length,0)}trimToCap(){let e=Vm(this.stage),t=this.visitors().sort((e,t)=>e.born-t.born),n=t.length,r=t.reduce((e,t)=>e+t.members.length,0);for(let i of t){if(n<=e.groups&&r<=e.members)break;this.retire(i),n--,r-=i.members.length}}candidates(){return this.pool.filter(e=>{let t=vt(e);return this.fits(t)&&Um(t,this.stage)&&!this.crews.some(t=>t.def.id===e&&!t.leaving)})}fill(){let e=Vm(this.stage),t=0;for(;this.visitors().length<e.groups&&t++<16;){let t=e.members-this.visitorMembers();if(t<1)break;let n=this.candidates();if(!n.length)break;this.spawn(this.pickOption(n),{room:t})}}rotate(){let e=this.visitors();e.length&&this.retire(e.sort((e,t)=>e.born-t.born)[0]);let t=this.candidates().filter(e=>!this.crews.some(t=>t.def.id===e)),n=Vm(this.stage).members-this.visitorMembers();t.length&&n>=1&&this.spawn(this.pickOption(t),{room:n}),this.fill(),this.nextRotate=this.time+28+this.rng()*20}info(){return this.visibleCrews().map(e=>({id:e.def.id,name:e.def.name,count:e.members.length,resident:e.resident}))}focus(e){let t=this.crews.find(t=>t.def.id===e&&!t.leaving)??this.crews.find(t=>t.def.id===e),n=t?.members[+(t.members.length>1)];return!t||!n?null:{pos:n.pos,size:(t.def.look.kind===`butterfly`?t.def.real.span??t.def.real.len:t.def.real.len)*this.af,yaw:n.yaw}}caps(){let e=Vm(this.stage);return{stage:this.stage,groups:e.groups,members:e.members,maxSize:Bm[e.maxSize],visitorGroups:this.visitors().length,visitorMembers:this.visitorMembers(),residentGroups:this.visibleCrews().filter(e=>e.resident).length}}retire(e){if(!e.leaving){e.leaving=!0,e.timer=0;for(let t of e.members)t.perch>=0&&this.perchTaken.delete(t.perch),t.timer=0,t.climb=null}}spawn(e,t={}){let n=vt(e),r=this.tree;if(!n||!r)return;if(t.forced){let t=this.crews.find(t=>t.def.id===e&&!t.leaving);if(t&&this.retire(t),this.memberCount()>Mg-n.group[1]){let e=this.visitors().sort((e,t)=>e.born-t.born)[0];e&&this.retire(e)}}let i=Wm(n,t.forced||t.resident?Math.max(this.stage,3):this.stage,this.rng);t.room!==void 0&&(i=Math.min(i,t.room)),i=Math.max(1,Math.min(i,Mg-this.memberCount()));let a=Sg(e);if(!a)return;let o={uid:this.uidNext++,def:n,members:[],resident:!!t.resident,forced:!!t.forced,born:this.time,leaving:!1,gone:!1,timer:0,phase:`air`,leader:new H,leaderTarget:new H,pause:0,enter:0,run:!1},s=this.entryPoint(n);o.leader.copy(s),o.leaderTarget.copy(this.groundTarget(n));for(let e=0;e<i;e++){let t=n.motion===`nest`?this.nestWithRobin(a):a.clone();t.rotation.order=`YZX`;let r={obj:t,rig:Cg(t),pos:s.clone().add(new H((this.rng()-.5)*1.5,jg.has(n.motion)?0:(this.rng()-.5)*.8,(this.rng()-.5)*1.5)),prev:s.clone(),target:s.clone(),offset:new H((this.rng()-.5)*2,(this.rng()-.5)*.8,(this.rng()-.5)*2),mode:Ag.has(n.motion)?`fly`:jg.has(n.motion)?`ground`:`fixed`,perch:-1,phase:this.rng()*10,scale:1,timer:this.rng()*6,speed:.8+this.rng()*.4,yaw:this.rng()*6.28,moving:0,spread:+!!Ag.has(n.motion),gait:this.rng()*6.28,wingPh:this.rng()*6.28,flapK:1,bank:0,act:`none`,actT:1+this.rng()*3,look:0,lookT:0,lookTimer:this.rng()*3,sitK:0,grazeK:0,lieK:0,sniffK:0,runK:0,climb:null,sq:null,rest:null};e>0&&jg.has(n.motion)&&r.offset.set(-.6-e*.5+this.rng()*.3,0,(e%2?1:-1)*(.4+this.rng()*.4)),(n.look.kind===`quad`||n.look.kind===`monkey`)&&(n.look.size??1)>=1&&t.traverse(e=>e.isMesh&&(e.castShadow=e.name===`body`||e.name===`head`||e.name===`neck`)),n.motion===`glow`&&(t.visible=!1),o.members.push(r),this.root.add(t)}n.motion===`glow`&&(this.fly.points.visible=!0),this.crews.push(o),this.assignSeats(o),this.arrivals.push({uid:o.uid,id:n.id,name:n.name,count:o.members.length,motion:n.motion,category:n.category}),this.arrivals.length>12&&this.arrivals.shift()}nestWithRobin(e){let t=new Ya,n=Sg(`nest`).clone();n.name=`nestMesh`;let r=e.clone();return r.position.set(.25,.18,.2),r.scale.setScalar(.95),kg(r,1),t.add(n,r),t}scaleFor(e){return xg(e)*this.af}dlen(e){return e.real.len*this.af}roam(){let e=(5.32+Math.max(0,this.islandR-7)*.3)*Lg,t=(uh(this.islandR)-eh-.3)*Lg;return Math.min(e,t/1.08)}entryPoint(e){let t=this.tree,n=this.rng()*Math.PI*2;if(jg.has(e.motion)){let e=this.roam()*1.08,t=.2+this.rng()*2.6;for(let n=0;n<40&&zg&&!zg(Math.cos(t)*e,Math.sin(t)*e);n++)t=this.rng()*Math.PI*2,e=this.roam()*(.6+this.rng()*.48);return new H(Math.cos(t)*e,Bg(Math.cos(t)*e,Math.sin(t)*e),Math.sin(t)*e)}if(Ag.has(e.motion)&&e.category===`bird`){let e=t.canopyRadius+10;return new H(Math.cos(n)*e,t.height+3+this.rng()*3,Math.sin(n)*e)}return new H(Math.cos(n)*(t.canopyRadius+1),t.height*.5,Math.sin(n)*(t.canopyRadius+1))}groundTarget(e){let t=this.tree,n=Math.max(.6,t.trunkRadius*3+.6),r=this.roam(),i=e.motion===`wade`,a=i?.3+this.rng()*.9:-.3+this.rng()*3.8,o=i?Math.min(r,5.32*Lg)*(.75+this.rng()*.2):n+this.rng()*(r-n),s=Math.cos(a)*o,c=Math.sin(a)*o;if(!i&&zg){let e=this.pathFrom;for(let t=0;t<24&&!this.dryPath(e,s,c);t++){let e=-.3+this.rng()*3.8;o=n+this.rng()*(r-n),s=Math.cos(e)*o,c=Math.sin(e)*o}}return new H(s,Bg(s,c),c)}pathFrom=null;dryPath(e,t,n){if(!zg)return!0;if(!zg(t,n))return!1;if(!e||!zg(e.x,e.z))return!0;let r=Math.min(200,Math.max(12,Math.ceil(Math.hypot(t-e.x,n-e.z)/(.25*Lg))));for(let i=1;i<r;i++){let a=i/r;if(!zg(e.x+(t-e.x)*a,e.z+(n-e.z)*a))return!1}return!0}assignSeats(e){let t=this.tree;for(let n of e.members)if(n.jit??=.97+this.rng()*.06,n.scale=this.scaleFor(e.def)*n.jit,n.obj.scale.setScalar(n.scale),n.climb=null,(e.def.motion===`perch`||e.def.motion===`flock`||e.def.motion===`crawl`&&e.def.spot===`leaf`)&&(n.perch=this.freePerch(t)),(e.def.motion===`climb`||e.def.motion===`crawl`&&e.def.spot===`trunk`)&&(n.perch=Math.floor(this.rng()*Math.max(1,t.trunkSpots.length))),e.def.look.kind===`squirrel`){let e=t.trunkSpots[n.perch%Math.max(1,t.trunkSpots.length)],r=e?e.pos.y:.5;n.sq={where:`trunk`,lift:0,liftT:0,toGround:!1,home:new H},n.sq.lift=n.sq.liftT=r*.3}}freePerch(e){let t=e.perches.length;if(!t)return-1;for(let e=0;e<t;e++){let e=Math.floor(this.rng()*Math.min(t,16));if(!this.perchTaken.has(e))return this.perchTaken.add(e),e}return Math.floor(this.rng()*t)}reseat(){this.perchTaken.clear();for(let e of this.crews)this.assignSeats(e)}perchWorld(e,t){let n=this.tree,r=n.perches[e]??n.perches[0];return r?n.group.localToWorld(t.copy(r.pos)):t.set(0,n.height,0)}trunkWorld(e,t,n,r=0){let i=this.tree,a=i.trunkSpots[e%Math.max(1,i.trunkSpots.length)];return a?(n.copy(a.pos).addScaledVector(a.out,r),n.y+=t,i.group.localToWorld(n)):n.set(0,1,.3)}trunkTop(){let e=this.tree.trunkSpots,t=0;for(let n of e)t=Math.max(t,n.pos.y);return t>0?t/.7:Math.max(1,this.tree.height*.5)}trunkOut(e){let t=this.tree,n=t.trunkSpots[e%Math.max(1,t.trunkSpots.length)];return Wg.copy(n?n.out:new H(0,0,1)).transformDirection(t.group.matrixWorld)}trunkSpotNear(e){let t=this.tree,n=0,r=1/0;return t.trunkSpots.forEach((t,i)=>{let a=t.pos.y*3+Math.hypot(t.pos.x+t.out.x-e.x,t.pos.z+t.out.z-e.z);a<r&&(r=a,n=i)}),n}update(e,t,n){if(this.time=e,this.tree){if(e>this.nextRotate&&(this.crews.length?this.rotate():this.fill()),e>this.nextArrival){this.nextArrival=e+5+this.rng()*5;let t=Vm(this.stage),n=t.members-this.visitorMembers();if(this.visitors().length<t.groups&&n>=1){let e=this.candidates();e.length&&this.spawn(this.pickOption(e),{room:n})}}for(let n of this.crews)this.step(n,e,t);for(let e of this.crews.filter(e=>e.gone)){for(let t of e.members)this.root.remove(t.obj);e.def.motion===`glow`&&(this.fly.points.visible=!1)}this.crews=this.crews.filter(e=>!e.gone),this.fly.points.visible&&this.updateFireflies(e,n),this.updateHints(e,t)}}updateHints(e,t){let n=this.hints;n.begin();for(let r of this.crews){let i=r.def,a=Ng(i),o=Pg(i);if(!a&&!o)continue;let s=r.leaving?0:L(r.enter*2,0,1);r.members.forEach((r,c)=>{if(!r.obj.visible)return;let l=this.screenPx(i,r.pos);if(a){r.trail??=Jm();let e=!r.lastPerched&&r.moving>.15*Math.max(.3,Lg*.3);Ym(r.trail,r.pos,t,e,.05),n.trail(r.trail,s*(.05+.45*(1-Fg(5,30,l))))}if(o){let t=Math.max(0,Math.sin(e*(4.5+c%3)+r.phase*3))**3,i=s*(1-Fg(10,44,l))*(.25+.75*t);n.sparkle(r.pos,i,(6+5*t)*this.view.dpr)}})}n.end()}step(e,t,n){let r=this.tree,i=e.def;e.timer+=n;let a=e=>1-Math.exp(-n*e),o=Math.max(.05,r.height),s=Math.max(.2,r.canopyRadius),c=r.group.getWorldPosition(Gg).y+ih(r.height),l=this.dlen(i),u=Lg,d=()=>{e.gone=!0};if(i.motion===`flock`&&!e.leaving){if(e.phase===`air`&&e.timer>14+e.born%5){e.phase=`land`,e.timer=0;for(let t of e.members)(t.perch<0||!r.perches[t.perch])&&(t.perch=this.freePerch(r))}else e.phase===`land`&&e.timer>12&&(e.phase=`air`,e.timer=0)}if(jg.has(i.motion)){e.leaving&&e.leaderTarget.copy(this.entryPoint(i)),this.pathFrom=e.leader,i.motion!==`wade`&&!e.leaving&&zg&&!zg(e.leaderTarget.x,e.leaderTarget.z)&&(e.leaderTarget.copy(this.groundTarget(i)),e.pause=0),Ug.subVectors(e.leaderTarget,e.leader).setY(0);let t=Ug.length(),r=(i.look.size??1)>1.8,a=(i.motion===`wade`?.35:i.motion===`hop`?.7:r?.9:.75)*L(l/.8,.2,1.6);if((e.run||e.leaving)&&(a*=Vg.has(i.id)?2.6:1.6),t<.15*Math.max(.3,u))e.leaving&&d(),e.pause-=n,e.pause<=0&&(e.leaderTarget.copy(this.groundTarget(i)),e.pause=3+this.rng()*7,e.run=Vg.has(i.id)&&this.rng()<.3);else if(e.pause>0&&!e.leaving)e.pause-=n;else{let r=e.leader.x+Ug.x/t*Math.min(t,a*n),o=e.leader.z+Ug.z/t*Math.min(t,a*n);i.motion!==`wade`&&!e.leaving&&zg&&!zg(r,o)&&zg(e.leader.x,e.leader.z)?e.leaderTarget.copy(this.groundTarget(i)):(e.leader.x=r,e.leader.z=o),e.leader.y=Bg(e.leader.x,e.leader.z)}}e.members.forEach((f,p)=>{f.prev.copy(f.pos);let m=t+f.phase,h=0,g=!1;switch(i.motion){case`perch`:case`flock`:{let n=e.leaving||(i.motion===`flock`?e.phase===`air`:Math.sin(m*.12+p)>.93);if(e.leaving)f.target.set(Math.cos(f.phase)*(s+14*u),o+3.5,Math.sin(f.phase)*(s+14*u)),f.pos.distanceTo(f.target)<1.5*u&&d();else if(n){let n=t*(i.motion===`flock`?.45:.9)+(i.motion===`flock`?0:f.phase),r=s+(1.2+(i.motion===`flock`?1.5:.5))*u;e.leader.set(Math.cos(n)*r,o*.8+(.6+Math.sin(t*.7)*.5)*u,Math.sin(n)*r),f.target.copy(e.leader).add(Wg.copy(f.offset).multiplyScalar(i.motion===`flock`?f.scale*3:0))}else this.perchWorld(f.perch,f.target),g=f.pos.distanceTo(f.target)<.12*Math.max(1,f.scale*3);f.pos.lerp(f.target,a(g?20:n?2.2:3)),g&&f.pos.copy(f.target),h=+!g;break}case`soar`:if(e.leaving)f.target.set(Math.cos(f.phase)*40*u,o+3.5,Math.sin(f.phase)*40*u),f.pos.distanceTo(f.target)<3*u&&d();else{let e=t*.16+f.phase,n=Math.max(5*u,s+3.5*u)+p*1.2*u;f.target.set(Math.cos(e)*n,o+Math.min(2.5*u,3.2)+Math.sin(t*.3+p)*Math.min(.8*u,1.2),Math.sin(e)*n)}f.pos.lerp(f.target,a(1.4)),h=1;break;case`hover`:case`flutter`:case`bat`:{let c=i.look.kind===`butterfly`,_=e.members.length>1&&(i.category===`insect`||i.category===`butterfly`),v=Math.max(l*5,.12*Math.min(u,3));if(e.leaving)f.rest=null,f.target.set(Math.cos(f.phase)*(s+8*u),o*.7+3*u,Math.sin(f.phase)*(s+8*u)),f.pos.distanceTo(f.target)<Math.max(.4,u)&&d();else if(i.motion===`hover`&&p>0&&_)f.target.copy(e.members[0].target).addScaledVector(f.offset,v);else if(i.motion===`hover`){if(f.timer-=n,f.timer<=0){let e=r.perches[Math.floor(this.rng()*Math.max(1,r.perches.length))];e?r.group.localToWorld(f.target.copy(e.pos).addScaledVector(e.out,.3+this.rng()*.4*Math.max(1,o*.1))):f.target.set((this.rng()-.5)*2,1,(this.rng()-.5)*2),f.timer=.8+this.rng()*1.6}}else if(c&&f.rest)f.target.copy(f.rest),f.timer-=n,f.timer<=0&&(f.rest=null,f.timer=6+this.rng()*8);else{let a=i.motion===`bat`?.9:.35,l=c&&(_?e.uid%2==1:p%2==1);if(_){let n=t*a+e.uid*1.7,r=(l?s*.6+1.2*u:s+.4*u)+Math.sin(t*.7+e.uid)*.4*u,i=l?(.5+Math.sin(t*1.3+e.uid)*.3)*u:o*.5+Math.sin(t*1.1+e.uid)*o*.12;f.target.set(Math.cos(n)*r,i,Math.sin(n)*r).addScaledVector(f.offset,v),f.target.y+=Math.sin(m*2.3)*v*.3}else{let e=t*a*f.speed+f.phase*2,n=(l?s*.6+1.2*u:s+.4*u)+Math.sin(m*.7)*.4*u,r=l?(.5+Math.sin(m*1.3)*.3)*u:o*(i.motion===`bat`?.75:.5)+Math.sin(m*1.1)*o*.12;f.target.set(Math.cos(e)*n,r,Math.sin(e)*n)}if(c&&(f.timer-=n,f.timer<=0&&e.enter>=1)){if(l){let e=_?new H(f.target.x,Bg(f.target.x,f.target.z),f.target.z):this.groundTarget(i);f.rest=e.setY(e.y+.04)}else r.perches.length&&(f.rest=this.perchWorld(Math.floor(this.rng()*r.perches.length),new H));f.timer=3+this.rng()*4}}let y=c&&f.rest!==null&&f.pos.distanceTo(f.target)<.08;f.pos.lerp(f.target,a(i.motion===`hover`?4:c&&f.rest?3.5:2.5)),y&&f.pos.copy(f.target),g=y,h=+!y;break}case`walk`:case`hop`:case`wade`:if(f.climb&&i.look.kind===`monkey`){this.stepClimb(e,f,n);break}if(Ug.copy(f.offset).applyAxisAngle(qg,e.members[0].yaw),f.target.copy(e.leader).add(p===0?Ug.set(0,0,0):Ug.multiplyScalar(f.scale)),p>0&&i.motion!==`wade`&&zg&&!zg(f.target.x,f.target.z)){for(let t of[.6,.3,0])if(f.target.copy(e.leader).addScaledVector(Ug,t),zg(f.target.x,f.target.z))break}if(f.target.y=Bg(f.target.x,f.target.z),f.pos.lerp(f.target,a(p===0?30:2.5)),i.motion===`hop`){let e=f.prev.distanceTo(f.pos)/Math.max(1e-4,n);f.pos.y=Bg(f.pos.x,f.pos.z)+Math.abs(Math.sin(m*5))*.15*f.scale*Math.min(1,e/.3)}break;case`climb`:if(f.sq)this.stepSquirrel(e,f,n,m);else{let t=Math.sin(m*.25)*.4*Math.max(.5,o*.08);this.trunkWorld(f.perch,t,f.target,f.scale*.15),f.pos.lerp(f.target,a(e.enter<1?3:8))}break;case`crawl`:if(i.spot===`trunk`)this.trunkWorld(f.perch,Math.sin(m*.1)*.1,f.target,f.scale*.05);else if(i.spot===`leaf`)this.perchWorld(f.perch,f.target);else{(f.timer<=0||f.target.lengthSq()===0)&&(f.target.copy(this.groundTarget(i)),f.timer=6+this.rng()*8),f.timer-=n,Ug.subVectors(f.target,f.pos).setY(0);let e=Ug.length();e>.05&&f.pos.addScaledVector(Ug.normalize(),Math.min(e,.12*n)),f.pos.y=Bg(f.pos.x,f.pos.z);break}e.enter<1?f.pos.copy(f.target):f.pos.lerp(f.target,a(10));break;case`nest`:r.nest?r.group.localToWorld(f.pos.copy(r.nest.pos).add(new H(0,r.trunkRadius*.3,0))):this.perchWorld(0,f.pos);break;case`hollow`:r.hollow?r.group.localToWorld(f.pos.copy(r.hollow.pos).add(new H(0,-f.scale*.35,0))):this.perchWorld(1,f.pos);break;case`glow`:f.pos.set(0,o*.5,0)}if(f.lastPerched=g,Kg.has(i.motion)&&!g){let e=l*.35,t=c-e;f.pos.y>t&&(f.pos.y=t);let n=Bg(f.pos.x,f.pos.z)+e;f.pos.y<n&&t>=n&&(f.pos.y=n)}f.moving=f.prev.distanceTo(f.pos)/Math.max(1e-4,n);let _=!Ag.has(i.motion)&&!jg.has(i.motion),v=f.scale;if(_){let t=e.leaving?1-L(e.timer/.8,0,1):L(e.timer/.8,0,1);v*=Math.max(.001,t),e.leaving&&e.timer>.8&&d()}f.obj.scale.setScalar(v),f.obj.position.copy(f.pos),this.pose(e,f,p,n,m,h,g)}),e.enter=Math.min(1,e.enter+n*.6)}stepClimb(e,t,n){let r=t.climb,i=this.tree.trunkSpots[r.spot];if(!i||e.leaving){t.climb=null;return}let a=-i.pos.y+.02;if(r.stage===`go`){this.trunkWorld(r.spot,a,t.target,t.scale*.35),t.target.y=Bg(t.target.x,t.target.z),Ug.subVectors(t.target,t.pos).setY(0);let e=Ug.length(),i=.9*t.scale;e>.05&&t.pos.addScaledVector(Ug.normalize(),Math.min(e,i*n)),t.pos.y=Bg(t.pos.x,t.pos.z),r.t+=n,(e<=.06||r.t>12)&&(r.stage=`up`,r.lift=a);return}let o=.55*t.scale;if(r.stage===`up`)r.lift=Math.min(r.top,r.lift+o*n),r.lift>=r.top&&(r.stage=`hold`,r.t=2.5+this.rng()*3);else if(r.stage===`hold`)r.t-=n,r.t<=0&&(r.stage=`down`);else if(r.lift=Math.max(a,r.lift-o*n),r.lift<=a){this.trunkWorld(r.spot,a,t.pos,t.scale*.35),t.pos.y=Bg(t.pos.x,t.pos.z),t.climb=null,t.act=`none`,t.actT=4+this.rng()*4;return}this.trunkWorld(r.spot,r.lift,t.pos,.01)}stepSquirrel(e,t,n,r){let i=t.sq,a=this.tree,o=a.trunkSpots[t.perch%Math.max(1,a.trunkSpots.length)],s=o?o.pos.y:.5,c=-s+.02,l=Math.max(.3,this.trunkTop()*.85-s);if(t.timer-=n,i.where===`trunk`){t.timer<=0&&Math.abs(i.lift-i.liftT)<.02&&(i.toGround=this.rng()<.3,i.liftT=i.toGround?c:c+.3+this.rng()*(l-c-.3),t.timer=1.2+this.rng()*2.5);let e=i.liftT-i.lift,r=Math.max(0,Math.sin(t.gait))*2,a=1.1*t.scale*r;if(i.lift+=Math.sign(e)*Math.min(Math.abs(e),a*n),this.trunkWorld(t.perch,i.lift,t.pos,.01),i.toGround&&Math.abs(i.lift-c)<.02){i.where=`ground`,this.trunkWorld(t.perch,c,i.home,t.scale*.3),i.home.y=Bg(i.home.x,i.home.z),t.pos.copy(i.home);let e=this.trunkOut(t.perch),n=Math.atan2(e.z,e.x)+(this.rng()-.5)*1.6,r=.8+this.rng()*1.5;t.target.set(i.home.x+Math.cos(n)*r,0,i.home.z+Math.sin(n)*r),t.target.y=Bg(t.target.x,t.target.z),t.timer=0,t.act=`none`}return}Ug.subVectors(t.target,t.pos).setY(0);let u=Ug.length();if(u>.04&&t.act!==`sit`){let e=Math.max(0,Math.sin(t.gait));t.pos.addScaledVector(Ug.normalize(),Math.min(u,1.3*t.scale*e*2*n)),t.pos.y=Bg(t.pos.x,t.pos.z)+e*.1*t.scale}else if(t.pos.y=Bg(t.pos.x,t.pos.z),t.act!==`sit`&&(t.act=`sit`,t.actT=1.5+this.rng()*2.5),t.actT-=n,t.actT<=0){if(t.act=`none`,t.target.distanceTo(i.home)<.05||e.leaving)i.where=`trunk`,i.lift=c,i.liftT=c+.4+this.rng()*(l-c-.4),i.toGround=!1,t.timer=2;else if(this.rng()<.5)t.target.copy(i.home);else{let e=this.rng()*Math.PI*2;t.target.set(i.home.x+Math.cos(e)*1.2,0,i.home.z+Math.sin(e)*1.2),t.target.y=Bg(t.target.x,t.target.z)}}}pose(e,t,n,r,i,a,o){let s=e.def,c=Ug.subVectors(t.pos,t.prev),l=this.tree,u=t.rig,d=(e,n=6)=>{if(e.lengthSq()<1e-8)return;let i=Ig(e)-t.yaw;return i=Math.atan2(Math.sin(i),Math.cos(i)),t.yaw+=i*Math.min(1,r*n),i};if(t.lookTimer-=r,t.lookTimer<=0&&(t.lookT=(this.rng()-.5)*1.5,t.lookTimer=1.2+this.rng()*3),t.look+=(t.lookT-t.look)*Math.min(1,r*4),s.motion===`nest`||s.motion===`hollow`){let e=s.motion===`nest`?l.nest?.out:l.hollow?.out;if(t.obj.rotation.set(0,Ig(e??new H(.3,0,1)),0),s.motion===`nest`){let e=t.obj.children[1];e&&(e.rotation.y=Math.sin(i*.7)>.6?.5:0)}return}if(t.sq){let e=t.sq,n=t.moving/Math.max(.05,t.scale);if(t.gait+=r*(e.where===`trunk`?9:8)*(e.where===`trunk`&&Math.abs(e.liftT-e.lift)<.02?.2:1),t.sitK+=(+(t.act===`sit`)-t.sitK)*Math.min(1,r*6),e.where===`trunk`){let n=this.trunkOut(t.perch).clone(),r=e.liftT<e.lift-.02;Qg(t.obj,r?Ug.set(0,-1,0):Ug.set(0,1,0),n),Eg(u,{gait:t.gait,walk:+(Math.abs(e.liftT-e.lift)>.02),run:1,sit:0,graze:0,lie:0,look:t.look,t:i,sniff:0})}else t.obj.quaternion.identity(),c.lengthSq()>1e-8&&d(c.clone().setY(0),10),t.obj.rotation.set(0,t.yaw,0),Eg(u,{gait:t.gait,walk:+(n>.05),run:1,sit:t.sitK,graze:0,lie:0,look:t.look,t:i,sniff:t.sitK*.5});return}if(t.climb&&t.climb.stage!==`go`){let e=this.trunkOut(t.climb.spot).clone(),n=t.climb.stage===`down`;Qg(t.obj,n?Ug.set(0,-1,0):Ug.set(0,1,0),e);let a=t.climb.stage!==`hold`;t.gait+=r*6*!!a,Eg(u,{gait:t.gait,walk:a?1:.1,run:0,sit:0,graze:0,lie:0,look:a?0:t.look*1.3,t:i,sniff:0});for(let e of u.legs)e.up.rotation.x=(e.up.position.z>0?-1:1)*.35;return}if(s.motion===`climb`||s.motion===`crawl`&&s.spot===`trunk`){let e=l.trunkSpots[t.perch%Math.max(1,l.trunkSpots.length)],n=e?e.out:new H(0,0,1);t.obj.rotation.set(0,0,0),t.obj.rotation.y=Ig(n)+Math.PI/2,t.obj.rotateZ(Math.PI/2-.15),t.obj.rotateY(Math.PI),s.look.kind===`bird`&&kg(t.obj,1),u.head&&(u.head.rotation.z=s.id===`woodpecker`?Math.max(0,Math.sin(i*14))*.3*(Math.sin(i*.5)>.3):Math.sin(i*.6)*.2),u.tails[0]&&(u.tails[0].rotation.z=(u.tailRest[0]??0)+Math.sin(i*2.2)*.15);return}if(s.motion===`crawl`){if(s.spot===`leaf`){let e=l.perches[t.perch];t.obj.rotation.set(0,e?Ig(e.out):0,0)}else d(c.setY(0)),t.obj.rotation.set(0,t.yaw,0);let e=t.moving>.02;t.gait+=r*10*!!e,u.legs.forEach((n,r)=>n.up.rotation.y=e?Math.sin(t.gait+(r===0||r===3?0:Math.PI))*.45:0),u.head&&(u.head.rotation.y=t.look*.5),u.tails[0]&&(u.tails[0].rotation.y=Math.sin(i*1.5)*.2+(e?Math.sin(t.gait)*.2:0));return}if(jg.has(s.motion)){this.poseGround(e,t,n,r,i,c,d);return}let f=s.look.kind===`bird`,p=s.look.kind===`butterfly`,m=0;if(o){if(p){let e=l.perches[t.perch];d(e?e.out.clone().setY(0):new H(.3,0,1),2)}else{let e=l.perches[t.perch];d(e?e.out.clone().setY(0).normalize().lerp(new H(.3,0,1),.6):new H(.3,0,1))}t.bank*=.9,t.obj.rotation.set(0,t.yaw,0)}else{let e=d(c.clone().setY(0))??0;m=L(c.y/Math.max(1e-4,r)*.08,-.5,.5);let n=s.motion===`soar`?.35:L(-e*4,-.5,.5);t.bank+=(n-t.bank)*Math.min(1,r*3)}let h=t.pos.distanceTo(t.target),g=f&&!o&&!e.leaving&&(s.motion===`perch`||s.motion===`flock`&&e.phase===`land`)&&h<1.2*Math.max(.5,t.scale*3);if(g&&(m=.6),o||t.obj.rotation.set(t.bank,t.yaw,m),t.spread+=(+!o-t.spread)*Math.min(1,r*(g?5:8)),f){let e=a,c=15;o||(s.motion===`soar`?(e=+(Math.sin(i*.35)>.82),c=5):g?(e=1,c=22):t.spread<.9?(e=1,c=20):e=+(Math.sin(i*.9+n*1.3)>-.35)),t.flapK+=(e-t.flapK)*Math.min(1,r*5),t.wingPh+=r*c;let l=s.motion===`soar`?.45:.85,d=Math.sin(t.wingPh)*l*t.flapK,f=Math.sin(t.wingPh-.8)*l*.8*t.flapK;if(Dg(u,t.spread,d,f,(1-t.flapK)*.12),o){let e=Math.sin(i*.3+n)>.9;if(u.head&&u.head.rotation.set(0,e?1.9:t.look,e?-.5:Math.sin(i*2.3)>.97?-.3:0),Math.sin(i*.45)>.96){let e=Math.sin(i*30)*.6;Dg(u,.45,e,e,0)}u.tails[0]&&(u.tails[0].rotation.z=(u.tailRest[0]??0)+Math.max(0,Math.sin(i*3))*(Math.sin(i*.7)>.5?.25:.03))}else u.head&&u.head.rotation.set(0,L(-t.bank,-.4,.4),0),u.tails[0]&&(u.tails[0].rotation.z=u.tailRest[0]??0);for(let e of u.legs)e.up.rotation.z=o?0:g?.5:-1.1}else if(p){let e;o?e=.2+(.5+.5*Math.sin(i*1.4))*1.2:(t.wingPh+=r*(Math.sin(i*.6+n)>.75?3:15),e=.15+(.5+.5*Math.sin(t.wingPh))*1.2),u.wingL?.rotation.set(-e,0,0),u.wingR?.rotation.set(e,0,0)}else{let e=s.category===`insect`,n=s.look.kind===`bee`||s.look.kind===`dragonfly`?60:e?14:s.look.kind===`bat`?11:16,i=e?.35:.8;t.wingPh+=r*n;let o=Math.sin(t.wingPh)*i*a;u.wingL&&(u.wingL.rotation.x=o),u.wingR&&(u.wingR.rotation.x=-o)}}poseGround(e,t,n,r,i,a,o){let s=e.def,c=t.rig,l=t.moving/Math.max(.05,t.scale),u=l>.08;if(u?o(a.clone().setY(0),5):n>0&&o(Wg.subVectors(e.members[0].pos,t.pos).setY(0),1.5),t.obj.quaternion.identity(),t.obj.rotation.set(0,t.yaw,0),t.actT-=r,u&&t.act!==`climb`)t.act!==`none`&&(t.actT=.5+this.rng()),t.act=`none`;else if(t.actT<=0){if(t.act!==`none`)t.act=`none`,t.actT=1+this.rng()*2.5;else if(!e.leaving){let r=Hg(s),i=r[Math.floor(this.rng()*r.length)];if(i===`climb`){if(n>0&&this.tree.trunkSpots.length&&e.pause>6){let e=this.trunkSpotNear(t.pos),n=this.tree.trunkSpots[e];t.climb={spot:e,stage:`go`,lift:0,top:Math.max(.3,this.trunkTop()*(.35+this.rng()*.35)-n.pos.y),t:0}}else i=`sit`}t.act=i,t.actT=i===`lie`?8+this.rng()*8:2.5+this.rng()*4}}let d=e=>+(t.act===e),f=Math.min(1,r*3);t.sitK+=(d(`sit`)+d(`groom`)-t.sitK)*f,t.grazeK+=(d(`graze`)-t.grazeK)*f,t.lieK+=(d(`lie`)-t.lieK)*Math.min(1,r*1.5),t.sniffK+=(d(`sniff`)-t.sniffK)*f;let p=e.run||e.leaving;if(t.runK+=((p&&u?1:0)-t.runK)*f,s.look.kind===`bird`){let e=s.motion===`hop`;t.gait+=r*l*(e?10:7);let n=u&&!e?Math.sin(t.gait)*.5:0;c.legs.forEach((e,t)=>e.up.rotation.z=t===0?n:-n),Dg(c,0,0,0,0);let a=t.act===`strike`?Math.max(0,Math.sin(L(1-t.actT/1.2,0,1)*Math.PI)):0,o=t.act===`peck`?Math.max(0,Math.sin(i*7)):0,d=+(t.act===`preen`);c.head&&c.head.rotation.set(0,d?1.9:t.look*(u?.3:1),-a*1-o*.7-d*.4+(u?Math.sin(t.gait*2)*.12:0)),c.tails[0]&&(c.tails[0].rotation.z=(c.tailRest[0]??0)+(s.id===`wagtail`?Math.sin(i*9)*.25:Math.sin(i*2)*.05));return}if(s.look.kind===`frog`){let e=Math.min(1,l/.3);c.legs.forEach(t=>t.up.rotation.z=-e*Math.abs(Math.sin(i*5))*.9);return}let m=Math.max(.15,c.legLen)*(1.6+t.runK*1.4);if(t.gait+=r*l/m*Math.PI*2*.5,Eg(c,{gait:t.gait,walk:L(l/.25,0,1),run:t.runK,sit:L(t.sitK,0,1),graze:t.grazeK,lie:t.lieK,look:t.act===`look`?t.look*1.3:t.look*(u?.25:.7),t:i,sniff:t.sniffK}),t.act===`groom`&&c.head&&(c.head.rotation.x=Math.sin(i*3)*.25),t.act===`groom`){let e=c.legs[0];e&&(e.up.rotation.z=-.1+Math.sin(i*5)*.25)}}updateFireflies(e,t){let n=this.fly.points.material;n.opacity=t*(.8+.2*Math.sin(e*2.6));let r=this.tree,i={r:r.canopyRadius+.6,y:r.height*.25,h:r.height*.8};n.size=.2+r.height*.02;let a=this.fly.points.geometry.getAttribute(`position`),o=this.fly.seeds;for(let t=0;t<a.count;t++){let n=o[t*3]*6.28+e*.12*(.5+o[t*3+1]),r=i.r*(.4+.6*o[t*3+2]);a.setXYZ(t,Math.cos(n)*r,i.y+i.h*o[t*3+1]+Math.sin(e*.8+t)*.2,Math.sin(n)*r)}a.needsUpdate=!0}};function e_(){let e=new $o,t=new Float32Array(78),n=new Float32Array(78);for(let e=0;e<78;e++)n[e]=Math.random();e.setAttribute(`position`,new Ro(t,3));let r=document.createElement(`canvas`);r.width=r.height=32;let i=r.getContext(`2d`),a=i.createRadialGradient(16,16,0,16,16,16);a.addColorStop(0,`rgba(255,250,190,1)`),a.addColorStop(.35,`rgba(226,255,120,0.7)`),a.addColorStop(1,`rgba(200,255,100,0)`),i.fillStyle=a,i.fillRect(0,0,32,32);let o=new Sc(e,new _c({size:.35,map:new Tc(r),transparent:!0,depthWrite:!1,blending:2,color:`#fff9c4`}));return o.frustumCulled=!1,{points:o,seeds:n}}var t_={rocks:`石頭`,boulders:`大石`,shrubs:`灌木`,flowers:`野花`,drygrass:`乾草`,hills:`山丘`,mountains:`遠山`,snowpeaks:`雪峰`,scree:`碎石坡`,snow:`積雪`,pond:`池塘`,lotus:`荷葉`,lake:`湖泊`,river:`河流`,creek:`小溪`,wetland:`濕地`,reeds:`蘆葦`,waterfall:`瀑布`,inlet:`水灣`,ferns:`蕨類`,treeferns:`樹蕨`,fog:`霧`,coast:`海岸`,wall:`石牆`,village:`村屋`,shrine:`土地廟`,steps:`石級`,courtyard:`庭院`,lanterns:`石燈籠`,pavilion:`亭`,forest:`同種樹林`},n_=[7,9.4,11.4,13.8,16.6],r_=[{species:`camphor`,name:`山坡林地`,blurb:`香港郊野山坡：石塊、灌叢、山澗水潭，遠處青山同溪流。`,grass:`#78b64c`,adds:[[],[`rocks`,`shrubs`,`pond`],[`hills`,`flowers`,`creek`,`pond`],[`boulders`,`forest`,`lake`],[`mountains`,`creek`,`inlet`,`pond`]]},{species:`cotton`,name:`河畔草地`,blurb:`華南河岸同乾草地：河灘水氹、河邊蘆葦濕地，遠處黃土丘同河口。`,grass:`#a9b75a`,adds:[[],[`drygrass`,`rocks`,`pond`],[`river`,`pond`],[`reeds`,`forest`,`wetland`,`lake`],[`hills`,`waterfall`,`inlet`,`river`]]},{species:`banyan`,name:`圍村風水林`,blurb:`新界圍村：風水塘、石牆、魚塘荷葉、村屋同土地廟，村邊小溪出海。`,grass:`#6fae48`,adds:[[],[`wall`,`shrubs`,`pond`],[`pond`,`lotus`],[`village`,`shrine`,`creek`,`lake`],[`forest`,`flowers`,`pond`,`inlet`]]},{species:`metasequoia`,name:`溪澗濕地`,blurb:`湖北水杉壩：溪流、池塘、濕地蘆葦，背後青山，清晨起霧。`,grass:`#6db255`,adds:[[],[`reeds`,`creek`,`pond`],[`pond`,`lotus`,`river`],[`wetland`,`forest`,`inlet`],[`lake`,`fog`,`hills`]]},{species:`ginkgo`,name:`古剎庭院`,blurb:`古寺庭院：石級、石燈籠、亭同放生池，山溪繞寺，四周山丘。`,grass:`#7cb350`,adds:[[],[`rocks`,`flowers`,`pond`],[`steps`,`courtyard`,`pond`],[`lanterns`,`pavilion`,`pond`,`creek`],[`wall`,`forest`,`hills`,`creek`,`lake`]]},{species:`deodar`,name:`喜馬拉雅山坡`,blurb:`高山碎石坡，雪水匯成小溪同高山湖，雪峰連綿，雪松成林。`,grass:`#8aa866`,adds:[[],[`rocks`,`scree`,`creek`],[`hills`,`boulders`,`creek`,`pond`],[`snowpeaks`,`forest`,`lake`],[`snow`,`mountains`,`creek`,`river`]]},{species:`redwood`,name:`霧鎖海岸`,blurb:`加州海岸霧林：蕨類、小溪、潟湖、海蝕柱同海霧，後面係海岸山脈。`,grass:`#5f9f4a`,adds:[[],[`ferns`,`pond`],[`creek`,`shrubs`,`pond`],[`coast`,`forest`,`fog`,`inlet`],[`treeferns`,`boulders`,`hills`,`creek`,`lake`]]},{species:`eucalyptus`,name:`桉樹山谷`,blurb:`澳洲東南山谷：蕨叢、山溪、樹蕨、瀑布水潭同藍霧山嶺。`,grass:`#8aa65c`,adds:[[],[`ferns`,`rocks`,`creek`,`pond`],[`hills`,`treeferns`,`pond`],[`waterfall`,`forest`,`creek`],[`mountains`,`fog`,`lake`]]},{species:`douglas`,name:`山湖針葉林`,blurb:`北美太平洋山區：溪流、湖泊、河灣、針葉林，遠處雪山。`,grass:`#6aa250`,adds:[[],[`rocks`,`shrubs`,`creek`,`pond`],[`lake`],[`mountains`,`forest`,`river`],[`snowpeaks`,`reeds`,`inlet`,`lake`]]}];function i_(e){return r_.find(t=>t.species===e)??r_[0]}function a_(e){return n_[Math.max(0,Math.min(4,Math.round(e)))]}function o_(e,t){let n=i_(e),r=[];for(let e=0;e<=Math.max(0,Math.min(4,Math.round(t)));e++)for(let t of n.adds[e])r.includes(t)||r.push(t);return r}var s_=n_[0],c_=1.25,l_=c_-Math.PI,Y=e=>new W(e);function u_(e,t){return Math.abs(Math.atan2(Math.sin(e-t),Math.cos(e-t)))}function d_(e){let t=document.createElement(`canvas`);t.width=t.height=64;let n=t.getContext(`2d`);n.fillStyle=e?`#5aaed2`:`#5bb6dc`,n.fillRect(0,0,64,64);for(let t=0;t<(e?22:30);t++){n.fillStyle=`rgba(255,255,255,${.1+t%3*.08})`;let r=t*23%64,i=t*41%64;e?n.fillRect(r,i,3+t%3,1.5):n.fillRect(r,i,10+t%4*4,2)}let r=new Tc(t);return r.wrapS=r.wrapT=Ln,r.colorSpace=oi,r}function f_(){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,0.9)`),n.addColorStop(.6,`rgba(255,255,255,0.35)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),new Tc(e)}var p_=class{solids=[];props=[];anchor=null;pk=1;dens(e){return Eh(this.pk,e)}prop(e,t,n){let r=this.anchor;this.anchor={x:e,y:this.groundY(e,t),z:t};try{n()}finally{this.anchor=r}}flowing=[];still=[];keep=[];waters=[];lines=[];pools=[];blocks=[];tufts=[];flowers=[];fog=[];falls=[];rand=Math.random;R=s_;rIn=s_;form;constructor(e){this.form=e}groundY(e,t){let n=Math.hypot(e,t);return n<s_+.3?-.04:-.04+(Math.sin(e*.55+1.3)*Math.cos(t*.47-.4)*.1+Math.sin(e*1.3-t*.9)*.04)*Math.min(1,(n-s_-.3)/1.5)}free(e,t,n){if(Math.hypot(e,t)-n<s_+.35)return!1;for(let r of this.keep)if(Math.hypot(r.x-e,r.z-t)<r.r+n)return!1;return!0}spot(e,t=`view`,n=!1,r,i,a=40){let o=(r,i)=>{for(let o=0;o<a;o++){let a,o=t===`view`?this.rand()<.55?`back`:this.rand()<.55?`front`:this.rand()<.5?`side`:`any`:t;if(this.frontBias&&o===`back`&&!n&&(o=this.rand()<.6?`front`:`side`),a=o===`back`?l_+(this.rand()-.5)*.9:o===`front`?c_+(this.rand()-.5)*1:o===`side`?l_+(this.rand()<.5?1:-1)*(.42+this.rand()*.55):this.rand()*Math.PI*2,i<=r)continue;let s=lh(this.R,a),c=n?s-e*.35:r+this.rand()*(i-r);if(!n&&c+e*.75>s-.16-.3)continue;let l=Math.cos(a)*c,u=Math.sin(a)*c;if(this.free(l,u,e*.85))return{x:l,z:u,r:e}}return null},s=i??this.R-(n?0:e*.7)-.2,c=o(r??this.rIn+e*.6,s);return c||n||r!==void 0||!this.reachIn?c:o(s_+.45+e*.8,s)}reachIn=!1;get frontBias(){return this.form===`banyan`||this.form===`round`}claim(e,t=0){this.keep.push({x:e.x,z:e.z,r:e.r+t})}push(e,t){this.anchor?this.props.push(Ah(vh(e,t),this.anchor.x,this.anchor.y,this.anchor.z)):this.solids.push(vh(e,t))}rock(e,t,n,r=`#9b958c`,i=!1){if(!this.anchor)return this.prop(e,t,()=>this.rock(e,t,n,r,i));let a=new Pc(n,0);gh(a,n*.35,e*3.1+t,!1),a.scale(1,.72,1),a.rotateY(e+t);let o=this.groundY(e,t);a.translate(e,o+n*.22,t);let s=Y(r).offsetHSL(0,0,(this.rand()-.5)*.08);this.push(a,e=>i&&e>o+n*.5?Y(`#f4f7fa`):s)}bush(e,t,n,r){if(!this.anchor)return this.prop(e,t,()=>this.bush(e,t,n,r));let i=new Yl(n,this.pk<.7?0:1);gh(i,n*.3,e+t*2,!0),i.scale(1,.75,1);let a=this.groundY(e,t);i.translate(e,a+n*.55,t);let o=Y(r).offsetHSL(0,0,(this.rand()-.5)*.06);this.push(i,e=>o.clone().offsetHSL(0,0,(e-a)*.12-.04))}mountain(e,t,n,r,i,a=`#6f9f5c`,o=`#8b8378`){this.blocks.push({x:e,z:t,r:n*1.1});let s=new Mc(n,r,8,5);gh(s,n*.22,e*1.7+t,!1);let c=this.groundY(e,t)-.3;s.translate(e,c+r/2,t);let l=c+r*(.62+this.rand()*.1),u=Y(a),d=Y(o),f=Y(`#f3f6f9`);this.push(s,e=>i&&e>l?f:e>c+r*.3?d.clone().offsetHSL(0,0,(e-c)/r*.08):u)}hill(e,t,n,r,i){this.blocks.push({x:e,z:t,r:n*.95});let a=new eu(1,10,5,0,Math.PI*2,0,Math.PI/2);a.scale(n,r,n*(.8+this.rand()*.3)),gh(a,n*.08,e+t*3,!1);let o=this.groundY(e,t)-.15;a.translate(e,o,t);let s=Y(i);this.push(a,e=>s.clone().offsetHSL(0,0,(e-o)/r*.07-.03))}pool(e,t,n,r,i,a=!0,o=`#b9a47a`){let s=this.groundY(e,t),c=new Ac(1,22);c.rotateX(-Math.PI/2),c.scale(n,1,r),c.rotateY(i),c.translate(e,s+.035,t),this.still.push(c);let l=new Zl(.92,1.18,22,1);if(l.rotateX(-Math.PI/2),l.scale(n,1,r),l.rotateY(i),l.translate(e,s+.025,t),this.push(l,Y(o)),a){let a=Math.round(6+(n+r)*2);for(let o=0;o<a;o++){let s=o/a*Math.PI*2+this.rand()*.3,c=Math.cos(s)*n*1.12,l=Math.sin(s)*r*1.12,u=Math.cos(i),d=Math.sin(i);this.rand()<.55&&this.rock(e+c*u+l*d,t-c*d+l*u,.12+this.rand()*.14,`#a39d92`),this.pk<.7&&this.rand()<.6&&this.rock(e+c*1.06*u+l*1.06*d+(this.rand()-.5)*.3,t-c*1.06*d+l*1.06*u+(this.rand()-.5)*.3,.1+this.rand()*.12,`#a39d92`)}}this.waters.push({x:e,z:t,r:Math.max(n,r)}),this.pools.push({x:e,z:t,rx:n*1.18,rz:r*1.18,rot:i})}longPool(e,t,n,r=!0,i=`#b9a47a`){let a=Math.atan2(e.z,e.x),o=-Math.sin(a),s=Math.cos(a),c=e.r*t,l=e.r*n;for(;c>e.r;c*=.85){let t=!0;for(let n of[-1,-.6,.6,1]){let r=e.x+o*c*n*.9,i=e.z+s*c*n*.9,a=lh(this.R,Math.atan2(i,r));(Math.hypot(r,i)+l*.9>a-.16-.35||!this.free(r,i,l*.85))&&(t=!1)}if(t)break}c=Math.max(c,e.r),this.claim(e,.4);for(let t of[-1,-.5,.5,1])this.keep.push({x:e.x+o*c*t*.8,z:e.z+s*c*t*.8,r:l+.3});this.pool(e.x,e.z,c,l,-a-Math.PI/2,r,i)}isWater(e,t,n=0){for(let r of this.pools){let i=e-r.x,a=t-r.z,o=Math.cos(r.rot),s=Math.sin(r.rot),c=i*o-a*s,l=i*s+a*o;if((c/(r.rx+n))**2+(l/(r.rz+n))**2<1)return!0}for(let r of this.lines)for(let i=0;i<r.pts.length-1;i++){let a=r.pts[i],o=r.pts[i+1],s=o.x-a.x,c=o.z-a.z,l=Math.max(0,Math.min(1,((e-a.x)*s+(t-a.z)*c)/Math.max(1e-6,s*s+c*c))),u=a.y+(o.y-a.y)*l+n;if((a.x+s*l-e)**2+(a.z+c*l-t)**2<u*u)return!0}return!1}ribbon(e,t,n=!0,r=`#b9a47a`,i=0){let a=new Wc(e),o=Math.max(12,Math.round(a.getLength()*3)),s=[];this.lines.push({pts:s,w:t});let c=[],l=[],u=[],d=[];for(let e=0;e<=o;e++){let n=e/o,r=a.getPoint(n),f=a.getTangent(n),p=new H(-f.z,0,f.x).normalize(),m=t*(.85+.2*Math.sin(n*11+r.x))*(1+i*n*n);s.push(new H(r.x,m*1.35,r.z));let h=this.groundY(r.x,r.z)+.04;if(c.push(r.x+p.x*m,h,r.z+p.z*m,r.x-p.x*m,h,r.z-p.z*m),u.push(r.x+p.x*m*1.35,h-.012,r.z+p.z*m*1.35,r.x-p.x*m*1.35,h-.012,r.z-p.z*m*1.35),l.push(0,n*o*.25,1,n*o*.25),e<o){let t=e*2;d.push(t,t+1,t+2,t+1,t+3,t+2)}e%3==0&&this.keep.push({x:r.x,z:r.z,r:m*1.5})}let f=new $o;f.setAttribute(`position`,new Vo(c,3)),f.setAttribute(`uv`,new Vo(l,2)),f.setIndex(d),f.computeVertexNormals(),(n?this.flowing:this.still).push(f);let p=new $o;p.setAttribute(`position`,new Vo(u,3)),p.setIndex(d.slice()),p.computeVertexNormals(),this.push(p,Y(r));for(let e=0;e<=6;e++){let n=a.getPoint(e/6);this.waters.push({x:n.x,z:n.z,r:t})}}reeds(e,t,n){if(!this.anchor)return this.prop(e,t,()=>this.reeds(e,t,n));for(let r=0;r<n;r++){let n=e+(this.rand()-.5)*.9,r=t+(this.rand()-.5)*.9,i=.45+this.rand()*.45,a=new Mc(.025,i,3);if(a.rotateZ((this.rand()-.5)*.3),a.translate(n,this.groundY(n,r)+i/2,r),this.push(a,Y(this.rand()<.4?`#b6a66a`:`#7fa252`)),this.rand()<.4){let e=xh(.03,.08,.03,0);e.translate(n,this.groundY(n,r)+i,r),this.push(e,Y(`#7a5a3a`))}}}fern(e,t,n,r=`#4f8f3e`){if(!this.anchor)return this.prop(e,t,()=>this.fern(e,t,n,r));let i=this.groundY(e,t);for(let a=0;a<7;a++){let o=xh(n*.5,n*.03,n*.12,0);o.translate(n*.45,0,0),o.rotateZ(.55+this.rand()*.25),o.rotateY(a/7*Math.PI*2+this.rand()*.4),o.translate(e,i+.02,t),this.push(o,Y(r).offsetHSL(0,0,(this.rand()-.5)*.08))}}treeFern(e,t,n){if(!this.anchor)return this.prop(e,t,()=>this.treeFern(e,t,n));let r=this.groundY(e,t);this.push(_h(new H(e,r,t),new H(e+.05,r+n,t),.09,.07,5),Y(`#5a4232`));for(let i=0;i<9;i++){let a=xh(n*.42,.03,n*.09,0);a.translate(n*.38,0,0),a.rotateZ(-.35-this.rand()*.3),a.rotateY(i/9*Math.PI*2),a.translate(e+.05,r+n,t),this.push(a,Y(`#4c8a3a`).offsetHSL(0,0,(this.rand()-.5)*.08))}}miniTree(e,t,n){if(!this.anchor)return this.prop(e,t,()=>this.miniTree(e,t,n));let r=this.groundY(e,t),i=new H(e,r,t),a=e=>Y(e).offsetHSL((this.rand()-.5)*.02,0,(this.rand()-.5)*.07),o=(e,t,n,r,i,a=.85)=>{let o=new Yl(r,this.pk<.7?0:1);gh(o,r*.25,e+n,!0),o.scale(1,a,1),o.translate(e,t,n),this.push(o,e=>i.clone().offsetHSL(0,0,(e-t)/r*.05))},s=(n,r,i,a)=>{let o=new Mc(r,i,7,1);o.translate(e,n+i/2,t),this.push(o,e=>a.clone().offsetHSL(0,0,(e-n)/i*.08-.03))};switch(this.form){case`round`:case`banyan`:{this.push(_h(i,new H(e,r+n*.45,t),n*.06,n*.04,5),Y(`#7a6655`));let s=a(this.form===`banyan`?`#3c7534`:`#4c8f3c`);if(o(e,r+n*.62,t,n*.33,s),o(e+n*.22,r+n*.5,t+n*.1,n*.24,s),o(e-n*.2,r+n*.52,t-n*.08,n*.24,s),this.form===`banyan`)for(let i=0;i<3;i++)this.push(_h(new H(e+(i-1)*n*.2,r+n*.45,t),new H(e+(i-1)*n*.22,r,t+.05),.02,.02,3),Y(`#a8977a`));break}case`tiered`:this.push(_h(i,new H(e,r+n,t),n*.05,n*.02,5),Y(`#8f8b80`));for(let i=0;i<3;i++){let o=xh(n*(.3-i*.07),n*.05,n*(.3-i*.07),1);o.translate(e,r+n*(.45+i*.2),t),this.push(o,a(`#6a9c44`));let s=new Yl(n*.04,0);s.translate(e+n*.15,r+n*(.5+i*.2),t+n*.08),this.push(s,Y(`#d8352a`))}break;case`narrowCone`:this.push(_h(i,new H(e,r+n*.3,t),n*.05,n*.03,5),Y(`#8a4b2e`)),s(r+n*.15,n*.2,n*.88,a(`#7fb552`));break;case`fan`:this.push(_h(i,new H(e,r+n*.55,t),n*.05,n*.03,5),Y(`#8a8274`)),o(e,r+n*.66,t,n*.28,a(this.rand()<.5?`#e8b82a`:`#8ab84a`),1.1);break;case`drooping`:case`cone`:{this.push(_h(i,new H(e,r+n*.2,t),n*.05,n*.03,5),Y(`#5a4a3e`));let o=a(this.form===`drooping`?`#5d8f7c`:`#2e5a3c`);for(let e=0;e<3;e++)s(r+n*(.12+e*.24),n*(.3-e*.07),n*.42,o);break}case`column`:this.push(_h(i,new H(e,r+n*.5,t),n*.06,n*.03,6),Y(`#9a4a2c`)),s(r+n*.35,n*.15,n*.68,a(`#2f5e3a`));break;case`eucalypt`:this.push(_h(i,new H(e,r+n*.7,t),n*.05,n*.03,6),Y(`#e2ddcf`)),o(e,r+n*.78,t,n*.22,a(`#7d9468`),1.1),o(e+n*.14,r+n*.7,t,n*.16,a(`#91a883`),1.1)}}stoneWall(e,t,n,r){let i=Math.round(n/.34);for(let a=0;a<i;a++)for(let i=0;i<2;i++){let o=(a+(i?.5:0))*.34-n/2,s=e+Math.cos(r)*o,c=t-Math.sin(r)*o,l=new kc(.34,.2,.28);gh(l,.05,s*3+c+i,!1),l.rotateY(r),l.translate(s,this.groundY(e,t)+.1+i*.2,c),this.push(l,Y(`#9c9486`).offsetHSL(0,0,(this.rand()-.5)*.1))}}house(e,t,n,r=1){let i=this.groundY(e,t),a=new kc(1.4*r,.8*r,1*r);a.rotateY(n),a.translate(e,i+.4*r,t),this.push(a,Y(`#e6e0d2`));let o=new jc(.01,.78*r,.55*r,4,1);o.rotateY(Math.PI/4),o.scale(1.45,1,1.05),o.rotateY(n),o.translate(e,i+.8*r+.27*r,t),this.push(o,Y(`#5b6670`));let s=new kc(.02,.45*r,.26*r);s.translate(.71*r,.22*r,0),s.rotateY(n),s.translate(e,i,t),this.push(s,Y(`#8a3a2a`))}shrine(e,t){let n=this.groundY(e,t),r=new kc(.45,.45,.35);r.translate(e,n+.22,t),this.push(r,Y(`#c43a2a`));let i=new jc(.01,.38,.22,4);i.rotateY(Math.PI/4),i.translate(e,n+.56,t),this.push(i,Y(`#3f5a4a`));let a=new jc(.01,.01,.2,3);a.translate(e+.3,n+.1,t),this.push(a,Y(`#e8c070`))}lantern(e,t){let n=this.groundY(e,t),r=[[new jc(.18,.22,.12,6),.06],[new jc(.07,.08,.45,6),.34],[new kc(.26,.2,.26),.66],[new jc(.02,.26,.16,4),.84]];for(let[i,a]of r)i.translate(e,n+a,t),this.push(i,Y(`#a8a397`));let i=new kc(.14,.1,.27);i.translate(e,n+.66,t),this.push(i,Y(`#f3d27a`))}pavilion(e,t,n){let r=this.groundY(e,t)+.3;for(let[i,a]of[[-1,-1],[1,-1],[-1,1],[1,1]]){let o=new jc(.06*n,.07*n,1.1*n,6);o.translate(e+i*.6*n,r+.55*n,t+a*.6*n),this.push(o,Y(`#b8322a`))}let i=new Mc(1.15*n,.55*n,4,1);i.rotateY(Math.PI/4),i.translate(e,r+1.35*n,t),this.push(i,Y(`#3f5f58`));let a=new jc(1.05*n,1.2*n,.08*n,4);a.rotateY(Math.PI/4),a.translate(e,r+1.08*n,t),this.push(a,Y(`#2f4a44`));let o=new eu(.1*n,6,4);o.translate(e,r+1.66*n,t),this.push(o,Y(`#d8b050`))}platform(e,t,n,r,i,a){let o=new kc(n,i,r);o.rotateY(a),o.translate(e,this.groundY(e,t)+i/2-.05,t),this.push(o,n=>n>i*.6-.05+this.groundY(e,t)?Y(`#c9c1b0`):Y(`#a8a090`));for(let o=-2;o<=2;o++){let s=new kc(n*.98,.012,.03);s.translate(0,0,o*r/5.5),s.rotateY(a),s.translate(e,this.groundY(e,t)+i-.04,t),this.push(s,Y(`#9a9282`))}}seaStack(e,t,n){let r=new jc(n*.18,n*.3,n,6,3);gh(r,n*.08,e+t,!1),r.translate(e,-.8+n/2,t),this.push(r,e=>e>n-1.2?Y(`#6f8a5a`):Y(`#5f5a55`))}cliffFall(e,t,n){let r=Math.atan2(t,e);this.blocks.push({x:e,z:t,r:1.2});let i=new kc(1.8,n,1.3,2,3,2);gh(i,.25,e+t,!1),i.rotateY(-r);let a=this.groundY(e,t);i.translate(e,a+n/2,t),this.push(i,e=>e>a+n*.9?Y(`#6f9f5c`):Y(`#8d857a`));let o=e+Math.cos(r+1.2)*.1,s=t+Math.sin(r+1.2)*.1;this.falls.push({x:o-Math.cos(c_)*-.7,z:s-Math.sin(c_)*-.7,a:c_,top:a+n*.95,h:n}),this.pool(o+Math.cos(c_)*1.4,s+Math.sin(c_)*1.4,.9,.7,0,!0)}},m_=new Set([`rocks`,`boulders`,`shrubs`,`flowers`,`drygrass`,`ferns`,`treeferns`,`forest`,`reeds`,`scree`,`snow`]);function h_(e,t,n=`low`,r=1){let i=i_(e),a=Math.max(0,Math.min(4,Math.round(t))),o=n_[a],s=new Ya;s.name=`habitat`;let c=new p_(ut(e).form);c.pk=Math.max(.05,Math.min(1,r));let l=new Set,u=Y(i.grass),d=rt(e);c.reachIn=!0;for(let e=1;e<=a;e++){c.rIn=n_[e-1],c.R=n_[e];for(let t of i.adds[e])c.rand=it(d+rt(t)*7+e*131),l.add(t),m_.has(t)||g_(c,t,e)}c.reachIn=!1;let f=new Set;for(let e=1;e<=a;e++){c.rIn=n_[e-1],c.R=n_[e];let t=Math.PI*(c.R*c.R-c.rIn*c.rIn);for(let t of i.adds[e])f.add(t);for(let n of f)m_.has(n)&&(c.rand=it(d+rt(n)*13+e*977),v_(c,n,t));c.rand=it(d+e*4099);let r=f.has(`drygrass`),a=Math.round(t*(n===`high`?5:3.2)*c.dens(5));for(let e=0;e<a;e++){let e=c.rand()*Math.PI*2,t=Math.sqrt(c.rIn*c.rIn+c.rand()*(c.R*c.R-c.rIn*c.rIn)),n=Math.cos(e)*t,i=Math.sin(e)*t;if(t>c.R-.25||c.waters.some(e=>Math.hypot(e.x-n,e.z-i)<e.r+.25)||c.isWater(n,i,.1))continue;let a=r&&c.rand()<.65?new W().setHSL(.12+c.rand()*.03,.5,.55+c.rand()*.1):new W().setHSL(.24+c.rand()*.06,.5,.34+c.rand()*.14);c.tufts.push({x:n,z:i,s:.7+c.rand()*1,c:a})}}c.R=o;let p=[];if(a>=1){let e=Math.ceil(o/.9),t=[],n=[],r=(e,t,n)=>n>o-.35?c.groundY(e,t)-.12:c.groundY(e,t),i=l.has(`drygrass`),a=l.has(`snow`),f=l.has(`scree`),m=(e,t,n)=>{let r=u.clone(),s=Math.sin(e*.9)*Math.cos(t*.8)+Math.sin(e*2.3+t*1.7)*.4;r.offsetHSL(0,0,s*.03);let c=Math.atan2(t,e);return i&&s>-.2&&r.lerp(Y(`#c8b466`),.45),f&&u_(c,l_)<1.2&&n>s_+1.5&&s>.2&&r.lerp(Y(`#9a948a`),.6),a&&u_(c,l_)<1.3&&n>o-3.5&&s>-.3&&r.lerp(Y(`#eef3f6`),.8),r},h=t=>t===0?0:s_-.5+(o-s_+.5)*(t-1)/(e-1);for(let i=0;i<e;i++){let e=h(i),a=h(i+1);for(let i=0;i<72;i++){let s=i/72*Math.PI*2,c=(i+1)/72*Math.PI*2,l=[[Math.cos(s)*e,Math.sin(s)*e,e],[Math.cos(c)*e,Math.sin(c)*e,e],[Math.cos(c)*a,Math.sin(c)*a,a],[Math.cos(s)*a,Math.sin(s)*a,a]],u=(e,i,a)=>{let s=(l[e][0]+l[i][0]+l[a][0])/3,c=(l[e][1]+l[i][1]+l[a][1])/3,u=m(s,c,Math.hypot(s,c));for(let s of[e,i,a]){let e=l[s][2],i=Math.atan2(l[s][1],l[s][0]),a=Zi.clamp((e-s_)/(o-s_),0,1),c=e>0?1+(lh(o,i)/o-1)*a:1;t.push(l[s][0]*c,r(l[s][0]*c,l[s][1]*c,l[s][2]),l[s][1]*c),n.push(u.r,u.g,u.b)}};e===0?u(0,3,2):(u(0,3,2),u(0,2,1))}}let g=new $o;g.setAttribute(`position`,new Vo(t,3)),g.setAttribute(`color`,new Vo(n,3)),g.computeVertexNormals();let _=new G(g,new fu({vertexColors:!0,flatShading:!0,roughness:.95,side:2}));_.receiveShadow=!0,_.name=`habitat-land`,s.add(_),p.push(_);let v=new jc(o,o*.9,1,72,2,!0);gh(v,.35,5,!1);let y=v.getAttribute(`position`),b=[];for(let e=0;e<y.count;e++)y.getY(e)>.3&&(y.setY(e,.5),b.push(e));Mh(v,o,.985,.5),v.translate(0,-.62,0);for(let e of b)y.setY(e,c.groundY(y.getX(e),y.getZ(e))-.125);v.computeVertexNormals();let x=new Mc(o*.92,Math.min(o*1.3,17),20,5);x.rotateX(Math.PI),gh(x,1,9,!1),Mh(x,o,.93);let S=Math.min(o*1.3,17);x.translate(0,-1.1-S/2,0),vh(v,Y(`#8a6446`)),vh(x,e=>new W().lerpColors(Y(`#6d6a66`),Y(`#8f7155`),Zi.clamp((e+S*.5)/(S*.5),0,1)));let C=new G(yh([v,x],!0),new fu({vertexColors:!0,flatShading:!0,roughness:.95}));s.add(C);let w=new H(4.75,0,5.05),T=Math.atan2(w.z,w.x),E=[w.clone(),new H(Math.cos(T+.05)*(s_+1),0,Math.sin(T+.05)*(s_+1))],D=lh(o,T);for(let e=s_+2.2;e<D-.6;e+=1.8)E.push(new H(Math.cos(T+Math.sin(e)*.06)*e,0,Math.sin(T+Math.sin(e)*.06)*e));E.push(new H(Math.cos(T)*(D+.05),0,Math.sin(T)*(D+.05))),c.rand=it(d+5),c.ribbon(E,.5,!0),c.falls.push({x:Math.cos(T)*(D+.08),z:Math.sin(T)*(D+.08),a:T,top:-.02,h:5.5})}let m=[];if(c.solids.length){let e=yh(c.solids,!0);m.push(e);let t=new G(e,new fu({vertexColors:!0,flatShading:!0,roughness:.9}));t.receiveShadow=!0,t.castShadow=n===`high`,s.add(t)}if(c.props.length){let e=yh(c.props,!0);m.push(e);let t=kh(new G(e,new fu({vertexColors:!0,flatShading:!0,roughness:.9})),!0);t.name=`habitat-props`,t.receiveShadow=!0,t.castShadow=n===`high`,s.add(t)}let h=d_(!1),g=d_(!0);g.repeat.set(.35,.35);let _=new fu({map:h,roughness:.25,metalness:.05,emissive:`#1d5f80`,emissiveIntensity:.25}),v=new fu({map:g,roughness:.15,metalness:.1,emissive:`#1d5f80`,emissiveIntensity:.2});if(c.flowing.length){let e=yh(c.flowing);m.push(e),s.add(new G(e,_))}if(c.still.length){let e=yh(c.still.map(e=>{let t=e.getAttribute(`position`),n=new Float32Array(t.count*2);for(let e=0;e<t.count;e++)n[e*2]=t.getX(e),n[e*2+1]=t.getZ(e);return e.setAttribute(`uv`,new Ro(n,2)),e})),t=e.getAttribute(`position`),n=new Float32Array(t.count*2);for(let e=0;e<t.count;e++)n[e*2]=t.getX(e),n[e*2+1]=t.getZ(e);e.setAttribute(`uv`,new Ro(n,2)),m.push(e),s.add(new G(e,v))}let y=s.children.find(e=>e.material===_);if(y){let e=y.geometry.getAttribute(`position`),t=new Float32Array(e.count*2);for(let n=0;n<e.count;n++)t[n*2]=(e.getX(n)+e.getZ(n))*.35,t[n*2+1]=Math.hypot(e.getX(n),e.getZ(n))*.6;y.geometry.setAttribute(`uv`,new Ro(t,2))}let b=d_(!1),x=new fu({map:b,transparent:!0,opacity:.82,roughness:.3,side:2,emissive:`#2a7aa0`,emissiveIntensity:.3,depthWrite:!1});for(let e of c.falls){let t=new Xl(e.h>5?.8:.6,e.h,1,3);m.push(t);let n=new G(t,x);n.position.set(e.x,e.top-e.h/2,e.z),n.rotation.y=-e.a+Math.PI/2,s.add(n)}let S=new Mc(.045,.16,3);S.translate(0,.08,0),m.push(S);let C=new $s(S,new fu({flatShading:!0,roughness:.9}),Math.max(1,c.tufts.length));kh(C,!1);let w=new Yl(.07,0);w.translate(0,.1/.7,0),m.push(w);let T=new $s(w,new fu({flatShading:!0,roughness:.7}),Math.max(1,c.flowers.length));kh(T,!1);let E=new xa,D=new Qi,O=new ja;c.tufts.forEach((e,t)=>{D.setFromEuler(O.set((Math.sin(t)-0)*.2,t*2.4,Math.cos(t*1.3)*.2)),E.compose(new H(e.x,c.groundY(e.x,e.z),e.z),D,new H(e.s,e.s*(.9+t%5*.12),e.s)),C.setMatrixAt(t,E),C.setColorAt(t,e.c)}),C.count=c.tufts.length,c.flowers.forEach((e,t)=>{E.compose(new H(e.x,c.groundY(e.x,e.z),e.z),D.identity(),new H(e.s,e.s*.7,e.s)),T.setMatrixAt(t,E),T.setColorAt(t,e.c)}),T.count=c.flowers.length,c.tufts.length&&s.add(C),c.flowers.length&&s.add(T);let k=f_(),A=[];for(let e of c.fog){let t=new Cs(new ls({map:k,color:`#f4f8fa`,transparent:!0,opacity:.55,depthWrite:!1,fog:!0}));t.scale.set(e.s*2.2,e.s,1),t.position.set(e.x,e.y,e.z),s.add(t),A.push({sp:t,x:e.x,z:e.z,y:e.y,ph:e.x*.7+e.z})}return{group:s,radius:o,stage:a,groundAt:(e,t)=>c.groundY(e,t),isWater:(e,t,n=0)=>c.isWater(e,t,n),isBlocked:(e,t)=>c.blocks.some(n=>Math.hypot(n.x-e,n.z-t)<n.r),ground:p,update(e){h.offset.y=-e*.35,b.offset.y=e*.9,g.offset.set(Math.sin(e*.13)*.4,e*.02),v.emissiveIntensity=.18+Math.sin(e*1.1)*.05;for(let t of A)t.sp.position.set(t.x+Math.sin(e*.05+t.ph)*1.2,t.y+Math.sin(e*.3+t.ph)*.1,t.z+Math.cos(e*.04+t.ph)*.8),t.sp.material.opacity=.42+Math.sin(e*.2+t.ph)*.12},dispose(){s.traverse(e=>{let t=e;t.geometry?.dispose();let n=t.material;n&&n!==x&&n.dispose()}),m.forEach(e=>e.dispose()),h.dispose(),g.dispose(),b.dispose(),k.dispose(),x.dispose()}}}function g_(e,t,n){let r=e.R,i=r/10;switch(t){case`hills`:{let t=3+n;for(let n=0;n<t;n++){let t=e.spot(1.6*i+e.rand()*1.2,n%3==2?`side`:`back`,!0);if(!t)continue;e.claim(t,-.4);let r=__(e.form);e.hill(t.x,t.z,t.r,.8+e.rand()*1.2*i,r)}break}case`mountains`:case`snowpeaks`:{let n=t===`snowpeaks`?5:4;for(let r=0;r<n;r++){let n=(1.8+e.rand()*1.4)*i*(t===`snowpeaks`?1.2:1),r=e.spot(n,`back`,!0,void 0,void 0,60);if(!r)continue;e.claim(r,-n*.3);let a=n*(t===`snowpeaks`?2.6:1.9)*(.8+e.rand()*.4),o=e.form===`eucalypt`?`#6f8f6a`:`#6a9a58`,s=e.form===`eucalypt`?`#7d8a96`:`#8b8378`;e.mountain(r.x,r.z,n,a,t===`snowpeaks`||t===`mountains`&&(e.form===`drooping`||e.form===`cone`),o,s)}break}case`pond`:{let t=e.spot(2.1,`view`)??e.spot(1.7,`side`)??e.spot(1.3,`any`)??e.spot(1,`view`,!1,void 0,void 0,80)??e.spot(.75,`any`,!1,void 0,void 0,80)??e.spot(.6,`any`,!1,void 0,void 0,80);t&&e.longPool(t,2.4,.95,!0);break}case`lotus`:for(let t of e.waters.filter(e=>e.r>.7).slice(0,4))for(let n=0;n<7;n++){let n=e.rand()*6.28,r=e.rand()*t.r*.7,i=t.x+Math.cos(n)*r,a=t.z+Math.sin(n)*r,o=new Ac(.16+e.rand()*.08,7,.3,5.8);if(o.rotateX(-Math.PI/2),o.translate(i,e.groundY(t.x,t.z)+.05,a),e.push(o,Y(`#4f9a3e`)),e.rand()<.45){let n=new Mc(.07,.1,5,1,!0);n.rotateX(Math.PI),n.translate(i,e.groundY(t.x,t.z)+.12,a),e.push(n,Y(`#f2a0bc`))}}break;case`lake`:{let t=e.spot(3.2*i,`view`,!1,void 0,void 0,80)??e.spot(2.6*i,`side`,!1,void 0,void 0,80)??e.spot(2.1*i,`any`,!1,void 0,void 0,80)??e.spot(1.6*i,`any`,!1,void 0,void 0,80)??e.spot(1.2,`any`,!1,void 0,void 0,80);t&&e.longPool(t,2.2,1.1,!0,`#b3a57e`);break}case`river`:{let t=l_-1.4,n=[],i=(e.rIn+r)/2+.2;for(let e=0;e<=8;e++){let r=t+e/8*2.6,a=i+Math.sin(e*1.3)*.5;n.push(new H(Math.cos(r)*a,0,Math.sin(r)*a))}e.ribbon(n,1.15,!0,`#cdb888`);break}case`creek`:{let t=l_+(e.rand()-.5)*1.2,n=[];for(let e=0;e<=6;e++){let i=r-.3-e/6*(r-s_-1),a=t+e*.12+Math.sin(e*1.7)*.1;n.push(new H(Math.cos(a)*i,0,Math.sin(a)*i))}e.ribbon(n,.42,!0,`#a8a08c`);let i=n[n.length-1];e.pool(i.x,i.z,1.05,.8,Math.atan2(i.z,i.x),!0);break}case`wetland`:for(let t=0;t<6;t++){let n=e.spot(.8+e.rand()*.6,t<3?`side`:`any`)??e.spot(.6,`any`);n&&(e.claim(n,.2),e.pool(n.x,n.z,n.r*1.3,n.r*.8,e.rand()*3,!1,`#8f8a5a`),e.reeds(n.x+n.r,n.z,6))}break;case`waterfall`:{let t=e.spot(1.2,`back`,!0)??e.spot(1.2,`side`,!0);t&&(e.claim(t,1.2),e.cliffFall(t.x*.94,t.z*.94,2.2+i));break}case`inlet`:for(let t=0;t<12;t++){let n=2+e.rand()*1.1+(t>6?Math.PI:0),i=lh(r,n),a=Math.max(s_+1.1,i-4.2),o=[];for(let e=0;e<=5;e++){let t=e/5,r=a+(i+.06-a)*t,s=n+Math.sin(t*2.4)*.05;o.push(new H(Math.cos(s)*r,0,Math.sin(s)*r))}let s=o[2];if(!e.keep.some(e=>Math.hypot(e.x-s.x,e.z-s.z)<e.r+.8)){e.ribbon(o,.6,!1,`#cdbb8a`,3),e.falls.push({x:Math.cos(n)*(i+.1),z:Math.sin(n)*(i+.1),a:n,top:-.03,h:4.5}),e.reeds(o[1].x,o[1].z,5);break}}break;case`fog`:for(let t=0;t<7;t++){let t=l_+(e.rand()-.5)*3.2,n=e.rIn+e.rand()*(r-e.rIn+2);e.fog.push({x:Math.cos(t)*n,y:.4+e.rand()*1.4,z:Math.sin(t)*n,s:3+e.rand()*3})}break;case`coast`:for(let t=0;t<26;t++){let n=2.25+t/26*2.2,i=lh(r,n)-.85,a=new Ac(.72,6);a.rotateX(-Math.PI/2),a.translate(Math.cos(n)*i,e.groundY(Math.cos(n)*i,Math.sin(n)*i)+.015,Math.sin(n)*i),e.push(a,Y(`#d9c9a0`))}for(let t=0;t<5;t++){let t=2.55+e.rand()*2,n=r+.6+e.rand()*1.8;e.seaStack(Math.cos(t)*n,Math.sin(t)*n,2.2+e.rand()*2.8)}break;case`wall`:for(let t=0;t<3;t++){let n=(e.frontBias?c_:l_)+(t-1)*.7+(e.rand()-.5)*.2,r=e.rIn+.7,i=Math.cos(n)*r,a=Math.sin(n)*r;e.free(i,a,.5)&&(e.stoneWall(i,a,2.2+e.rand(),-n+Math.PI/2),e.keep.push({x:i,z:a,r:1.3}))}break;case`village`:for(let t=0;t<2;t++){let n=e.spot(1.1,t?`side`:`back`);n&&(e.claim(n,.3),e.house(n.x,n.z,-Math.atan2(n.z,n.x)+Math.PI,.95+e.rand()*.2))}break;case`shrine`:{let t=e.spot(.5,`side`);t&&(e.claim(t),e.shrine(t.x,t.z));break}case`courtyard`:{let t=e.spot(2,`side`,!1,void 0,void 0,60)??e.spot(2,`view`,!1,void 0,void 0,60);if(t){e.claim(t,.2);let n=-Math.atan2(t.z,t.x);e.platform(t.x,t.z,3,3,.35,n),e.court=t}break}case`steps`:{let t=.65;for(let n=0;n<6;n++){let r=e.rIn+.3+n*.32,i=Math.cos(t)*r,a=Math.sin(t)*r,o=.1+(5-n)*.07,s=new kc(.34,o,1.2);s.rotateY(-.65),s.translate(i,e.groundY(i,a)+o/2-.03,a),e.push(s,Y(`#b8b0a0`).offsetHSL(0,0,n%2*.03)),e.keep.push({x:i,z:a,r:.7})}break}case`lanterns`:{let t=e.court;for(let n=0;n<4;n++){let r,i;if(t&&n<2){let e=Math.atan2(t.z,t.x)+(n?.35:-.35),a=Math.hypot(t.x,t.z)-2.2;r=Math.cos(e)*a,i=Math.sin(e)*a}else{let t=e.spot(.3,`any`);if(!t)continue;r=t.x,i=t.z}e.lantern(r,i),e.keep.push({x:r,z:i,r:.35})}break}case`pavilion`:{let t=e.court;if(t)e.pavilion(t.x,t.z,1);else{let t=e.spot(1.1,`back`);t&&(e.claim(t),e.pavilion(t.x,t.z,1))}break}}}function __(e){switch(e){case`tiered`:return`#b9a866`;case`drooping`:return`#8a9a78`;case`eucalypt`:return`#7f9a66`;default:return`#6ea452`}}function v_(e,t,n){let r=e.pk,i=(t,r=5)=>Math.round(n*t*e.dens(r));switch(t){case`rocks`:for(let t=0,n=i(.12);t<n;t++){let t=.25+e.rand()*.25,n=e.spot(t*r);n&&e.rock(n.x,n.z,t,`#9b958c`,!1)}break;case`boulders`:for(let t=0,n=i(.03,4)+1;t<n;t++){let t=.7+e.rand()*.6,n=e.spot(t*r,e.rand()<.6?`back`:`side`);n&&(e.claim(n),e.rock(n.x,n.z,t,`#8f8a82`,e.form===`drooping`||e.form===`cone`),e.rock(n.x+n.r*.9,n.z-n.r*.4,t*.5,`#9b958c`))}break;case`scree`:for(let t=0,n=i(.25,3);t<n;t++){let t=.15+e.rand()*.15,n=e.spot(t*r,`back`);n&&e.rock(n.x,n.z,t,`#a39e96`)}break;case`snow`:for(let t=0;t<Math.round(n*.05);t++){let t=e.spot(.6+e.rand()*.8,`back`);if(!t)continue;let n=new Ac(t.r,7);n.rotateX(-Math.PI/2),n.translate(t.x,e.groundY(t.x,t.z)+.02,t.z),e.push(n,Y(`#f4f7fa`))}break;case`shrubs`:for(let t=0,n=i(.1);t<n;t++){let t=.3+e.rand()*.35,n=e.spot(t*r);n&&(e.claim(n,-.1*r),e.bush(n.x,n.z,t,e.form===`tiered`?`#7a8a4a`:`#4f8a3a`))}break;case`flowers`:{let t=e.form===`fan`?[`#f7b7c8`,`#ffffff`,`#f3d35b`]:e.form===`banyan`?[`#f06a8a`,`#ffd35b`,`#ffffff`]:[`#ffffff`,`#f3d35b`,`#c9b3f0`,`#f7b7c8`];for(let n=0,r=i(1.2,5);n<r;n++){let n=e.rand()*Math.PI*2,r=e.rIn+.3+e.rand()*(e.R-e.rIn-.6),i=Math.cos(n)*r,a=Math.sin(n)*r;!e.free(i,a,.05)||e.waters.some(e=>Math.hypot(e.x-i,e.z-a)<e.r+.2)||e.isWater(i,a,.1)||e.flowers.push({x:i,z:a,s:.7+e.rand()*.8,c:Y(t[Math.floor(e.rand()*t.length)])})}break}case`drygrass`:for(let t=0,n=i(.06);t<n;t++){let t=.35+e.rand()*.2,n=e.spot(t*r);n&&e.bush(n.x,n.z,t*.8,`#c2a95a`)}break;case`ferns`:for(let t=0,n=i(.18,3);t<n;t++){let t=.35+e.rand()*.25,n=e.spot(t*r);n&&e.fern(n.x,n.z,t*1.6,e.form===`column`?`#3f7f36`:`#4f8f3e`)}break;case`treeferns`:for(let t=0,n=i(.03,3)+1;t<n;t++){let t=e.spot(.6*r,e.rand()<.5?`side`:`back`);t&&(e.claim(t),e.treeFern(t.x,t.z,1.3+e.rand()*.8))}break;case`forest`:for(let t=0,n=i(.06,3)+2;t<n;t++){let t=.6+e.rand()*.3,n=e.spot(t*r,e.rand()<.65?`back`:`side`);if(!n)continue;e.claim(n,.05*r);let i=Math.hypot(n.x,n.z);e.miniTree(n.x,n.z,(1.6+e.rand()*1.2)*(.8+(i-7)*.06*r)*(e.form===`column`||e.form===`narrowCone`||e.form===`cone`?1.5:1))}break;case`reeds`:{let t=e.waters.slice(0,14);for(let n=0,a=Math.max(3,i(.04,3));n<a;n++){let i=t[n%Math.max(1,t.length)];if(i){let t=e.rand()*6.28;e.reeds(i.x+Math.cos(t)*(i.r+.2),i.z+Math.sin(t)*(i.r+.2),7)}else{let t=e.spot(.4*r);t&&e.reeds(t.x,t.z,7)}}break}}}var y_=[[0,.35],[18,.7],[50,1.15],[200,2.3],[800,4.4],[2e3,6.7],[5e3,9.5],[11600,13],[2e4,15]];function b_(e){let t=Math.max(0,e);for(let e=1;e<y_.length;e++){let[n,r]=y_[e],[i,a]=y_[e-1];if(t<=n){let e=i===0?t/n:Math.log(t/i)/Math.log(n/i);return a+(r-a)*L(e,0,1)}}return y_[y_.length-1][1]}var x_={uTime:{value:0},uWind:{value:.1},uHeight:{value:3},uGust:{value:0}},S_=null;function C_(){if(S_)return S_;let e=new fu({vertexColors:!0,flatShading:!0,roughness:.82,side:2});return e.onBeforeCompile=e=>{Object.assign(e.uniforms,x_),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
uniform float uTime; uniform float uWind; uniform float uHeight; uniform float uGust;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        float hk = clamp(position.y / max(uHeight, 0.5), 0.0, 1.2);
        float bend = hk * hk;
        float ph = position.x * 1.7 + position.z * 1.3;
        float flutter = sin(uTime * (2.2 + uWind * 5.0) + ph * 2.0) * 0.5 + sin(uTime * 3.7 + ph * 3.1) * 0.25;
        float sway = sin(uTime * (0.9 + uWind * 1.4) + position.y * 0.35);
        float amp = uHeight * (0.004 + uWind * 0.03) * (1.0 + uGust * 0.8);
        transformed.x += (sway * 0.7 + flutter * 0.35) * amp * bend + uGust * uWind * bend * uHeight * 0.02;
        transformed.z += (cos(uTime * 1.1 + ph) * 0.4 + flutter * 0.3) * amp * bend;
        transformed.y += flutter * amp * 0.25 * hk;`)},S_=e,e}var w_=null;function T_(){return w_??=new fu({vertexColors:!0,flatShading:!0,roughness:.92}),w_}var X=H,E_=e=>new W(e),D_=class{rand;V;stage;health;fullness;density;bark=[];leaves=[];spots=[];trunkPts=[];trunkTop=0;trunkRadius=.05;crownY=0;nest=null;hollow=null;extraHeight=0;p;constructor(e){this.p=e,this.rand=it(e.seed||7),this.V=b_(e.heightCm),this.stage=L(Math.round(e.stage),0,4),this.health=e.health,this.density=L((e.health-10)/75,0,1),this.fullness=.62+.38*this.density}leaf(e,t=.05,n=0){let r=E_(e),i={h:0,s:0,l:0};r.getHSL(i),r.setHSL(i.h+(this.rand()-.5)*t*.4,L(i.s+(this.rand()-.5)*t,0,1),L(i.l+(this.rand()-.5)*t+n,0,1));let a=new W().setHSL(.1+this.rand()*.03,.45,.4);return r.lerp(a,L((60-this.health)/50,0,.85))}trunk(e,t,n,r,i={}){let a=i.segs??5,o=i.wobble??.03,s=this.p.seed,c=[new X(0,0,0)];for(let t=1;t<=a;t++){let n=t/a;c.push(new X(Math.sin(n*2.2+s)*this.V*o,e*n,Math.cos(n*1.7+s)*this.V*o*.7))}let l=[];for(let e=0;e<a;e++){let r=t+(n-t)*(e/a),o=t+(n-t)*((e+1)/a);l.push(_h(c[e],c[e+1],r,o,i.sides??8))}let u=yh(l);i.jitter&&gh(u,t*i.jitter,s,!1),vh(u,typeof r==`string`?(()=>{let e=E_(r);return t=>e.clone().offsetHSL(0,0,Math.sin(t*7)*.02)})():r),this.bark.push(u),this.trunkPts=c,this.trunkTop=e,this.trunkRadius=t}trunkAt(e){let t=this.trunkPts,n=L(e,0,1)*(t.length-1),r=Math.min(t.length-2,Math.floor(n));return new X().lerpVectors(t[r],t[r+1],n-r)}limb(e,t,n,r,i,a=5){this.bark.push(vh(_h(e,t,n,r,a),E_(i)))}skip(){if(this.stage===0||this.spots.length<6)return!1;let e=L((.6-this.density)*.85,0,.45);return e>0&&this.rand()<e}blob(e,t,n,r=.82,i=1,a=!0){if(a&&this.skip())return;let o=new Yl(t,i);gh(o,t*.26,e.x*3.1+e.z*1.7+this.p.seed,!0),o.scale(1,r,1),o.translate(e.x,e.y,e.z);let s=n.clone().offsetHSL(0,0,.06),c=n.clone().offsetHSL(0,0,-.07);vh(o,n=>c.clone().lerp(s,L((n-(e.y-t))/(2*t),0,1))),this.leaves.push(o),a&&this.spots.push({c:e.clone(),r:t,col:n})}cone(e,t,n,r,i=8,a=0){let o=new Mc(t,n,i,2);gh(o,t*.14,e.y*2.3+this.p.seed,!1),o.translate(e.x,e.y+n/2+a,e.z);let s=r.clone().offsetHSL(0,0,.07),c=r.clone().offsetHSL(0,-.05,-.08);vh(o,t=>c.clone().lerp(s,L((t-e.y)/n,0,1))),this.leaves.push(o),this.spots.push({c:new X(e.x,e.y+n*.35,e.z),r:t*.8,col:r})}spray(e,t,n,r,i,a=0){if(this.skip())return;let o=xh(n/2,r*.22,r/2,1);gh(o,r*.12,e.y*5+n,!1),o.translate(n/2,0,0),a&&o.rotateZ(-a);let s=Math.atan2(-t.z,t.x),c=Math.asin(L(t.y,-1,1));o.rotateZ(c),o.rotateY(s),o.translate(e.x,e.y,e.z);let l=i.clone().offsetHSL(0,.03,.08);vh(o,(e,t)=>t%3==0?l:i),this.leaves.push(o);let u=e.clone().addScaledVector(t,n*.7);this.spots.push({c:u,r:r*.6,col:i})}accent(e,t,n,r=`ball`){let i;r===`cup`?(i=new Mc(t,t*1.1,5,1,!0),i.rotateX(Math.PI),i.translate(0,t*.4,0)):r===`cone`?i=new jc(t*.55,t*.7,t*2.2,5):r===`fluff`?(i=new Yl(t,0),i.scale(1.2,.9,1.1)):i=new Yl(t,0),i.rotateY(this.rand()*6.28),i.translate(e.x,e.y,e.z),vh(i,E_(n)),this.leaves.push(i)}onSpot(e,t=.4){let n=new X(this.rand()-.5,this.rand()*t+(t>0?.1:-.1),this.rand()-.5).normalize();return e.c.clone().addScaledVector(n,e.r*.95)}rootFlare(e,t,n){let r=this.trunkRadius;for(let i=0;i<e;i++){let a=i/e*Math.PI*2+this.rand()*.4,o=r*t*(.8+this.rand()*.5);this.limb(new X(0,r*1.1,0),new X(Math.cos(a)*o,.02,Math.sin(a)*o),r*.5,r*.12,n,5)}}trunkSpots(){let e=[];for(let t of[.3,.5,.7]){let n=this.trunkAt(t*Math.min(1,(this.trunkTop||this.V)/this.V)),r=(this.trunkTop||this.V*.5)*t,i=this.trunkRadius*(1-t*.4);for(let t of[.9,1.5,2.2]){let a=new X(Math.cos(t),0,Math.sin(t));e.push({pos:new X(n.x+a.x*i,r,n.z+a.z*i),out:a})}}return e}},O_={round:{leaf:`ovate`,colour:`#5fa040`,stem:`#6f8a3e`},tiered:{leaf:`palmate`,colour:`#6aa84a`,stem:`#7c8a5a`},banyan:{leaf:`small`,colour:`#3f7f38`,stem:`#6f7a4a`},narrowCone:{leaf:`needles`,colour:`#8cc45a`,stem:`#8a5a3a`},fan:{leaf:`fan`,colour:`#86b84c`,stem:`#7a7a5a`},drooping:{leaf:`needles`,colour:`#6f9c8c`,stem:`#6a5a48`},column:{leaf:`needles`,colour:`#3f7248`,stem:`#8a4a30`},eucalypt:{leaf:`round`,colour:`#8fb0a0`,stem:`#9a7a5a`},cone:{leaf:`needles`,colour:`#3f6e48`,stem:`#6b4a35`}};function k_(e,t){let n=O_[t],r=e.V;e.trunkRadius=.02+r*.025;let i=new X(.03,r,0);e.limb(new X(0,0,0),new X(-.015,r*.5,.01),e.trunkRadius,e.trunkRadius*.8,n.stem,5),e.limb(new X(-.015,r*.5,.01),i,e.trunkRadius*.8,e.trunkRadius*.45,n.stem,5),e.trunkPts=[new X(0,0,0),new X(-.015,r*.5,.01),i],e.trunkTop=r;let a=2+Math.min(6,Math.floor(e.p.heightCm/7));if(n.leaf===`needles`){let a=2+Math.min(3,Math.floor(e.p.heightCm/12));for(let i=0;i<a;i++){let o=r*(.45+.5*(i/Math.max(1,a-1)));for(let a=0;a<7;a++){let s=a/7*6.28+i,c=(.12+r*.16)*(1-i*.12),l=new Mc(.012+r*.006,c,3);l.translate(0,c/2,0),l.rotateZ(-(t===`drooping`?1.35:1.05)),l.rotateY(s),l.translate(0,o,0),vh(l,e.leaf(n.colour)),e.leaves.push(l)}}e.accent(i,.03+r*.025,n.colour)}else{for(let t=0;t<a;t++){let i=t*2.4+e.rand()*.4,o=r*(.45+.55*(t/Math.max(1,a-1))),s=.09+r*.18*(.7+e.rand()*.4),c=[];if(n.leaf===`palmate`)for(let e=0;e<5;e++){let t=xh(s*.5,.012,s*.16,1);t.translate(s*.5,0,0),t.rotateY((e-2)*.5),c.push(t)}else if(n.leaf===`fan`){let e=new Ac(s*.7,6,-Math.PI/2-.9,1.8);e.rotateX(-Math.PI/2),e.rotateZ(.2),e.translate(s*.2,0,0);let t=e.clone();t.rotateX(Math.PI),c.push(e,t)}else{let e=n.leaf===`small`?.35:n.leaf===`round`?.8:.45,t=n.leaf===`small`?s*.7:s,i=xh(t,.016+r*.01,t*e,1);i.translate(t*.9,0,0),c.push(i)}let l=yh(c);l.rotateZ(.45+e.rand()*.3),l.rotateY(i),l.translate(0,o,0),vh(l,e.leaf(n.colour,.06,n.leaf===`round`?.04:0)),e.leaves.push(l),e.spots.push({c:new X(Math.cos(-i)*s,o+s*.3,Math.sin(-i)*s),r:s*.6})}e.accent(i,.04+r*.03,n.colour)}e.spots.push({c:new X(0,r*.8,0),r:.15+r*.3}),e.crownY=r}function A_(e,t){let{rand:n}=e,r=(i,a,o,s,c)=>{let l=i.clone().addScaledVector(a,o);if(e.limb(i,l,s,s*.62,t.bark,c===0?6:5),c>=t.depth){t.onTip(l,a,c);return}let u=c===0?2:2+ +(n()<.35);for(let e=0;e<u;e++){let i=e/u*Math.PI*2+n()*1.2,d=new X(Math.cos(i),0,Math.sin(i)),f=a.clone().multiplyScalar(.7).addScaledVector(d,t.spread??.55).add(new X(0,.3,0)).normalize();r(l,f,o*(.62+n()*.12),s*.62,c+1)}c>=1&&t.onTip(l,a,c-.5)};for(let i=0;i<t.primaries;i++){let a=i/t.primaries*Math.PI*2+n()*.6+e.p.seed*.1,o=t.from[0]+(t.from[1]-t.from[0])*(i/Math.max(1,t.primaries-1)),s=e.trunkAt(o);s.y=e.trunkTop*o;let c=t.tilt[0]+n()*(t.tilt[1]-t.tilt[0]),l=new X(Math.cos(a)*Math.cos(c),Math.sin(c),Math.sin(a)*Math.cos(c)).normalize();r(s,l,t.len*(.85+n()*.3),t.radius,0),!e.nest&&Math.sin(a)>.1&&e.stage>=2&&(e.nest={pos:s.clone().addScaledVector(l,t.len*.28),out:new X(l.x,0,l.z).normalize()})}}function j_(e){let{V:t,stage:n,rand:r}=e,i=`#7a6655`;e.trunk(t*[0,.46,.4,.34,.3][n],.035+t*.03+n*.03,.03+t*.014,i,{jitter:n>=3?.12:.04});let a=`#4c8f3c`;A_(e,{primaries:[0,3,5,6,8][n],depth:[0,1,2,2,3][n],from:[.7,1],len:t*[0,.34,.36,.38,.4][n],tilt:[.45,.85],radius:e.trunkRadius*.55,bark:i,onTip:i=>{let o=(t*(.12+.05*r())+.08)*e.fullness,s=n>=2&&r()<.16;e.blob(i.clone().add(new X(0,o*.25,0)),o,s?e.leaf(`#b56a3a`,.06):e.leaf(a,.08))}});let o=e.trunkAt(1),s=t*[0,.18,.24,.28,.3][n]*e.fullness;if(e.blob(new X(o.x,t*.8,o.z),s,e.leaf(a,.05,.03)),n>=2)for(let n=0;n<4;n++){let i=n*1.57+r();e.blob(new X(o.x+Math.cos(i)*t*.22,t*.66,o.z+Math.sin(i)*t*.22),s*.8,e.leaf(a,.08))}if(n>=3){for(let n=0;n<70;n++)e.accent(e.onSpot(e.spots[n%e.spots.length],.8),.03+t*.004,`#f3f1d8`);e.rootFlare(5+n,2.6,i)}e.crownY=t*.66}function M_(e){let{V:t,stage:n,rand:r}=e,i=`#8f8b80`,a=.03+t*.026+n*.022;if(e.trunk(t*.93,a,a*.35,i,{wobble:.01}),n<=2)for(let n=0;n<18;n++){let n=.08+r()*.8,i=e.trunkAt(n),o=r()*6.28,s=a*(1-n*.6),c=new Mc(a*.18,a*.5,4);c.translate(0,a*.25,0),c.rotateZ(-Math.PI/2),c.rotateY(o),c.translate(i.x+Math.cos(o)*s*.9,t*.93*n,i.z-Math.sin(o)*s*.9),e.bark.push(vh(c,E_(`#7a766c`)))}let o=[0,2,3,4,5][n],s=n>=3;for(let c=0;c<o;c++){let l=.38+.5*c/Math.max(1,o-1),u=t*.93*l,d=e.trunkAt(l),f=4+c%2,p=t*(.34-c/Math.max(1,o)*.2);for(let o=0;o<f;o++){let l=o/f*6.28+c*.7+r()*.3,m=new X(Math.cos(l),.12+r()*.12,Math.sin(l)).normalize(),h=new X(d.x,u,d.z),g=h.clone().addScaledVector(m,p*.75),_=g.clone().add(new X(m.x*p*.25,p*.12,m.z*p*.25));e.limb(h,g,a*.32,a*.14,i),e.limb(g,_,a*.14,a*.08,i),!e.nest&&Math.sin(l)>.2&&c===0&&(e.nest={pos:g.clone(),out:new X(m.x,0,m.z)});let v=s?1:2;for(let n=0;n<v;n++){let i=new X().lerpVectors(g,_,n?.3:1),a=(.12+t*.05)*e.fullness;for(let t=0;t<5;t++){let n=xh(a,a*.12,a*.32,0);n.translate(a*.8,0,0),n.rotateZ(.25),n.rotateY(t*1.256+r()),n.translate(i.x,i.y+a*.2,i.z),vh(n,e.leaf(`#6a9c44`,.08)),e.leaves.push(n)}e.spots.push({c:i.clone().add(new X(0,a*.3,0)),r:a*1.2})}if(s){let i=n===4?5:4;for(let n=0;n<i;n++){let r=new X().lerpVectors(h,_,.35+n*.16).add(new X(0,a*.2,0));e.accent(r,.06+t*.009,n%2?`#e0392b`:`#c92a22`,`cup`)}n===4&&r()<.5&&e.accent(_.clone().add(new X(0,.1,0)),.09+t*.01,`#f5f3ea`,`fluff`)}}}let c=e.trunkAt(1);e.blob(new X(c.x,t*.97,c.z),(.1+t*.05)*e.fullness,e.leaf(`#6a9c44`)),s&&e.accent(new X(c.x,t,c.z),.07+t*.009,`#e0392b`,`cup`),n>=3&&e.rootFlare(6+n,3,i),e.crownY=t*.7}function N_(e){let{V:t,stage:n,rand:r}=e,i=`#948a78`,a=.04+t*.045+n*.035;if(e.trunk(t*.36,a,a*.7,i,{wobble:.06,jitter:.18}),n>=2)for(let r=0;r<n;r++){let n=r*2.3+.5,o=new X(Math.cos(n)*a*.7,0,Math.sin(n)*a*.7);e.limb(o,o.clone().multiplyScalar(.3).add(new X(0,t*.34,0)),a*.5,a*.35,i,6)}let o=[];A_(e,{primaries:[0,3,5,7,9][n],depth:[0,1,2,2,3][n],from:[.75,1],len:t*[0,.34,.42,.48,.52][n],tilt:[.18,.5],radius:a*.45,bark:i,spread:.75,onTip:(n,i,a)=>{let s=(t*(.11+.05*r())+.08)*e.fullness;e.blob(n.clone().add(new X(0,s*.2,0)),s,e.leaf(`#3c7534`,.07),.72),a<3&&o.push(n.clone())}});let s=e.trunkAt(1);e.blob(new X(s.x,t*.62,s.z),t*.24*e.fullness,e.leaf(`#3c7534`,.05,.02),.7);let c=[0,0,6,18,30][n];for(let s=0;s<c&&o.length;s++){let c=o[s%o.length].clone().add(new X((r()-.5)*t*.1,-t*.02,(r()-.5)*t*.1)),l=n===4&&s%5==0,u=l?c.y:c.y*(.25+r()*.45),d=l?a*.22:.008+t*.002;e.limb(c,c.clone().add(new X(0,-u,0)),d,l?d*1.3:d*.6,l?i:`#a8977a`,4)}if(n===4)for(let n=0;n<60;n++)e.accent(e.onSpot(e.spots[n%e.spots.length],.2),.025+t*.003,n%3?`#c8546a`:`#8a3a4a`);n>=3&&e.rootFlare(7,3.2,i),e.crownY=t*.6}function P_(e){let{V:t,stage:n,rand:r}=e,i=`#8a4b2e`,a=.03+t*.026+n*.02;e.trunk(t*.98,a,a*.12,i,{wobble:.008,jitter:n>=3?.16:.04,sides:9});let o=t*[0,.1,.1,.16,.24][n],s=[0,9,14,19,24][n],c=t*[0,.21,.2,.19,.18][n]*e.fullness;for(let i=0;i<s;i++){let a=i/(s-1),l=o+(t*.98-o)*a,u=Math.max(.08,c*(1-a)**.85),d=e.trunkAt(l/(t*.98)),f=5+i%2;for(let t=0;t<f;t++){let a=t/f*6.28+i*.9+r()*.3,o=new X(Math.cos(a),.35,Math.sin(a)).normalize(),s=n===4&&r()<.7?e.leaf(r()<.5?`#c7652e`:`#d98a3c`,.06):e.leaf(`#86bc56`,.07);e.spray(new X(d.x,l,d.z),o,u*(.9+r()*.3),u*.72,s)}}let l=e.trunkAt(1),u=t*.98-o;e.cone(new X(l.x*.5,o+u*.04,l.z*.5),c*.62,u*.95,e.leaf(n===4?`#a8622e`:`#6fa446`,.05),9),e.blob(new X(l.x,t*.99,l.z),.06+t*.02,e.leaf(n===4?`#c7652e`:`#86bc56`),1.4,0),n>=3&&e.rootFlare(8,n===4?3.4:2.4,i),e.crownY=t*.55}function F_(e){let{V:t,stage:n,rand:r}=e,i=`#8a8274`;e.trunk(t*[0,.72,.64,.6,.56][n],.03+t*.026+n*.024,.02+t*.01,i,{wobble:.025,jitter:n>=3?.12:.03});let a=[0,0,0,.45,1][n],o=(t,n)=>{let i=r()<a?e.leaf(r()<.6?`#f0c428`:`#e2a41e`,.05):e.leaf(`#7fb24a`,.07);e.blob(t,n*.55,i,.8,0);for(let a=0;a<4;a++){let a=new Ac(n*.55,5,0,Math.PI);a.rotateX(r()*6.28),a.rotateY(r()*6.28);let o=new X(r()-.5,r()*.6,r()-.5).normalize().multiplyScalar(n*.5);a.translate(t.x+o.x,t.y+o.y,t.z+o.z),vh(a,i.clone().offsetHSL(0,0,.05)),e.leaves.push(a)}};A_(e,{primaries:[0,3,4,6,7][n],depth:[0,1,1,2,2][n],from:[.35,1],len:t*[0,.3,.34,.34,.36][n],tilt:[.7,1],radius:e.trunkRadius*.45,bark:i,spread:.4,onTip:(n,i)=>{let a=(.12+t*.06)*e.fullness*(.8+r()*.5);o(n,a),o(n.clone().addScaledVector(i,-a*1.2).add(new X(0,-a*.2,0)),a*.8)}});let s=e.trunkAt(1);if(o(new X(s.x,t*.9,s.z),(.14+t*.07)*e.fullness),n>=2&&o(new X(s.x,t*.72,s.z),(.12+t*.06)*e.fullness),n===4){let n=new Ac(t*.34,18);n.rotateX(-Math.PI/2),gh(n,t*.02,3,!1),n.translate(0,.03,0);let r=n.getAttribute(`position`);for(let e=0;e<r.count;e++)r.setY(e,.03);vh(n,(e,t)=>E_(t%4?`#e8b82a`:`#d49a1c`)),e.bark.push(n),e.rootFlare(7,2.4,i)}e.crownY=t*.62}function I_(e){let{V:t,stage:n,rand:r}=e,i=`#5a4a3e`,a=.03+t*.028+n*.022;e.trunk(t*.93,a,a*.15,i,{wobble:.01,jitter:n>=3?.12:.03});let o=e.trunkAt(1),s=new X(o.x+t*.05,t,o.z+t*.02);e.limb(o,s,a*.15,a*.05,i,4),e.spray(o,new X(.5,.85,.2).normalize(),t*.08,t*.05,e.leaf(`#6f9c8c`));let c=t*[0,.12,.08,.08,.12][n],l=[0,4,6,8,10][n],u=t*[0,.26,.3,.34,.36][n]*e.fullness;for(let i=0;i<l;i++){let a=i/Math.max(1,l-1),o=c+(t*.88-c)*a,s=Math.max(.12,u*(1-a*.85)),d=e.trunkAt(o/(t*.93));for(let a=0;a<6;a++){let c=a/6*6.28+i*.5+r()*.4,l=new X(Math.cos(c),.05,Math.sin(c)).normalize(),u=e.leaf(r()<.3?`#86ab9c`:`#5d8f7c`,.06);if(e.spray(new X(d.x,o,d.z),l,s*(.9+r()*.25),s*.7,u,.28),n>=3&&r()<.3){let n=new X(d.x,o,d.z).addScaledVector(l,s*.6).add(new X(0,s*.12,0));e.accent(n,.04+t*.006,`#9aa88a`,`cone`)}}}n>=3&&e.rootFlare(7,2.6,i),e.crownY=t*.5}function L_(e){let{V:t,stage:n,rand:r}=e,i=e=>E_(e<t*.08&&n===4?`#7a3a22`:`#9a4a2c`).offsetHSL(0,0,Math.sin(e*9)*.02),a=.04+t*.034+n*.035;if(e.trunk(t*.97,a,a*.15,i,{wobble:.006,jitter:n>=2?.22:.05,sides:10}),n===4){let t=xh(a*.5,a*1.6,a*.25,1);t.translate(a*.3,a*1.3,a*.88),e.bark.push(vh(t,E_(`#241612`)))}let o=t*[0,.08,.1,.4,.52][n],s=[0,7,10,13,15][n],c=t*[0,.2,.17,.13,.12][n]*e.fullness;for(let i=0;i<s;i++){let l=i/(s-1),u=o+(t*.97-o)*l,d=Math.max(.08,c*(1-l)**.55),f=e.trunkAt(u/(t*.97));for(let t=0;t<4;t++){let o=t/4*6.28+i*1.1+r()*.4,s=new X(Math.cos(o),-.1,Math.sin(o)).normalize(),c=new X(f.x,u,f.z);n>=3&&e.limb(c,c.clone().addScaledVector(s,d*.6),a*.08,a*.04,`#7a3a24`,4),e.blob(c.clone().addScaledVector(s,d*.75),d*.42,e.leaf(`#2f5e3a`,.06),.7)}}let l=e.trunkAt(1);if(e.blob(new X(l.x,t*.98,l.z),.06+t*.025,e.leaf(`#2f5e3a`),1.6,0),n===4)for(let n=0;n<3;n++){let r=n*2.1+.4,i=e.trunkAt(.8),o=new X(i.x,t*.78,i.z),s=o.clone().add(new X(Math.cos(r)*t*.05,t*.14,Math.sin(r)*t*.05));e.limb(o,s,a*.12,a*.04,`#9a4a2c`,5),e.cone(s.clone().add(new X(0,-t*.06,0)),t*.035,t*.1,e.leaf(`#2f5e3a`),7)}n>=3&&e.rootFlare(9,n===4?3.6:2.6,`#8a4028`),e.crownY=t*.72}function R_(e){let{V:t,stage:n,rand:r}=e,i=.03+t*.028+n*.028,a=t*[0,.7,.72,.76,.78][n];if(e.trunk(a,i,i*.45,e=>(n>=2&&e<a*.18?E_(`#8a7258`):E_(Math.sin(e*3.1)>.6?`#bdb9aa`:`#e2ddcf`)).offsetHSL(0,0,Math.sin(e*17)*.015),{wobble:.015,sides:9}),n>=3)for(let n=0;n<10;n++){let n=r()*6.28,o=a*(.15+r()*.4),s=t*(.04+r()*.05),c=new kc(i*.12,s,i*.02);c.translate(Math.cos(n)*i*1.02,o-s/2,Math.sin(n)*i*1.02),e.bark.push(vh(c,E_(`#9a7a58`)))}let o=e.trunkAt(1),s=[0,3,4,6,7][n];for(let c=0;c<s;c++){let l=c/s*6.28+r()*.8,u=new X(o.x,a*(.92+r()*.08),o.z),d=new X(Math.cos(l)*.5,.85,Math.sin(l)*.5).normalize(),f=t*(.16+r()*.06),p=u.clone().addScaledVector(d,f);e.limb(u,p,i*.38,i*.14,`#d9d4c5`,5),!e.nest&&c===0&&n>=2&&(e.nest={pos:u.clone().addScaledVector(d,f*.3),out:new X(d.x,0,d.z).normalize()});let m=3+Math.round(n*1.5);for(let n=0;n<m;n++){if(n>2&&e.skip())continue;let i=p.clone().add(new X((r()-.5)*f*.9,(r()-.3)*f*.45,(r()-.5)*f*.9)),a=(.13+t*.055)*e.fullness*(.7+r()*.5),o=new Yl(a,1);gh(o,a*.35,i.x*2+i.z,!0),o.scale(.9,1.25,.9),o.translate(i.x,i.y-a*.3,i.z);let s=e.leaf(r()<.5?`#7d9468`:`#91a883`,.05);vh(o,e=>s.clone().offsetHSL(0,0,(e-i.y)*.05)),e.leaves.push(o),e.spots.push({c:i,r:a,col:s})}}if(s){let i=t*(.1+n*.012)*e.fullness;for(let s=0;s<3+n;s++){let c=s/(3+n)*6.28+r(),l=new X(o.x+Math.cos(c)*i*.9,a+t*(.1+r()*.08),o.z+Math.sin(c)*i*.9);e.blob(l,i*(.75+r()*.3),e.leaf(r()<.5?`#7d9468`:`#91a883`,.05),.85)}}if(s||e.blob(new X(o.x,a,o.z),.2,e.leaf(`#8fb0a0`)),n===4){let n=new X(o.x,a,o.z),r=n.clone().add(new X(t*.02,t*.24,0));e.limb(n,r,i*.3,i*.05,`#b4b0a4`,5);for(let a=0;a<4;a++){let o=new X().lerpVectors(n,r,.4+a*.15),s=a*1.9;e.limb(o,o.clone().add(new X(Math.cos(s)*t*.05,t*.03,Math.sin(s)*t*.05)),i*.05,i*.02,`#b4b0a4`,3)}e.extraHeight=t*.22,e.rootFlare(8,3,`#8a7258`)}e.crownY=a}function z_(e){let{V:t,stage:n,rand:r}=e,i=`#6b4a35`,a=.03+t*.028+n*.026;e.trunk(t*.97,a,a*.12,i,{wobble:.01,jitter:n>=2?.2:.04});let o=t*[0,.05,.05,.12,.38][n],s=[0,4,6,8,10][n],c=t*[0,.3,.28,.25,.2][n]*e.fullness,l=t*.97-o;for(let i=0;i<s;i++){let a=i/s,u=o+l*a,d=Math.max(.1,c*(1-a)+.05),f=l/s*2,p=e.trunkAt(u/(t*.97)),m=e.leaf(`#2e5a3c`,.05,a*.04);if(e.cone(new X(p.x,u,p.z),d,f,m,8),n>=3)for(let n=0;n<3;n++){let n=r()*6.28,i=d*(.55+r()*.3);e.accent(new X(p.x+Math.cos(n)*i,u+f*.2,p.z+Math.sin(n)*i),.04+t*.005,`#8a6040`,`cone`)}}if(n===4){for(let n=0;n<8;n++){let n=.12+r()*.24,i=e.trunkAt(n/.97);i.y=t*n;let o=r()*6.28;e.limb(i,i.clone().add(new X(Math.cos(o)*a*2,-a*.4,Math.sin(o)*a*2)),a*.12,a*.06,`#5a3e2c`,4)}e.rootFlare(8,2.6,i)}let u=e.trunkAt(1);e.cone(new X(u.x,t*.94,u.z),.05+t*.02,t*.08,e.leaf(`#3a6a48`),6),e.crownY=t*.55}var B_={round:j_,tiered:M_,banyan:N_,narrowCone:P_,fan:F_,drooping:I_,column:L_,eucalypt:R_,cone:z_},V_={narrowCone:!0,drooping:!0,column:!0,cone:!0};function H_(e,t){let n=L((e.density-.5)/.5,0,1);if(n<=.02)return;let r=e.spots.filter(e=>e.col);if(!r.length)return;let i=e.trunkAt(1),a=Math.min(r.length,V_[t]?28:40),o=r.length/a;for(let s=0;s<a;s++){let a=r[Math.floor(s*o)],c=V_[t]?.45:.3,l=a.c.clone().lerp(new X(i.x,a.c.y,i.z),c);l.y-=a.r*.15;let u=a.col.clone().offsetHSL(0,-.02,-.05);e.blob(l,a.r*(V_[t]?.6:.72)*(.6+.4*n),u,V_[t]?.7:.85,1,!1)}}function U_(e){let t=b_(e.heightCm),n=e.reinforce;return[e.species,e.stage,Math.round(t*40),Math.round(e.health/12),+(e.pests>45),Math.min(4,e.scars),+!!n?.stakes,+!!n?.ropes,+!!n?.prune,e.seed].join(`|`)}function W_(e){let t=new D_(e),n=ut(e.species).form;t.stage===0?k_(t,n):B_[n](t),t.stage>=1&&H_(t,n);let{V:r,rand:i}=t;if(t.stage>=1)for(let n=0;n<Math.min(4,e.scars);n++){let e=2+n*1.7,i=.45+n*.1,a=t.trunkAt(i);a.y=(t.trunkTop||r)*i;let o=new X(Math.cos(e),.3,Math.sin(e)).normalize();t.limb(a,a.clone().addScaledVector(o,t.trunkRadius*2.5),t.trunkRadius*.3,t.trunkRadius*.25,`#6a4a34`)}if(e.pests>45&&t.spots.length)for(let e=0;e<18;e++)t.accent(t.onSpot(t.spots[e%t.spots.length],.6),.025+r*.004,`#3a2a1c`);if(t.stage>=3&&t.trunkPts.length>2){let e=.42,n=new X(.35,0,1).normalize(),i=t.trunkAt(e),a=t.trunkRadius*(1-e*.4);t.hollow={pos:new X(i.x+n.x*a*.8,(t.trunkTop||r)*e,i.z+n.z*a*.8),out:n};let o=new tu(a*.32,a*.1,5,10);o.scale(1,1.35,1),o.lookAt(n),o.translate(t.hollow.pos.x,t.hollow.pos.y,t.hollow.pos.z),t.bark.push(vh(o,E_(`#3a2a20`)))}let a=new Ya,o=new G(yh(t.bark,!0),T_());o.castShadow=!0,o.receiveShadow=!0,a.add(o);let s=new G(yh(t.leaves,!0),C_());s.castShadow=!0,s.receiveShadow=!0,a.add(s);let c=t.trunkAt(1),l=t.spots.filter(e=>e.c.y>r*.25||t.stage===0).sort((e,t)=>t.c.z+t.c.x*.3+t.c.y*.8-(e.c.z+e.c.x*.3+e.c.y*.8)).slice(0,24).map(e=>{let t=new X(e.c.x-c.x,0,e.c.z-c.z);return t.lengthSq()<1e-4&&t.set(.3,0,1),t.normalize(),{pos:e.c.clone().addScaledVector(t,e.r*.55).add(new X(0,e.r*.7,0)),out:t}});if(!t.nest&&t.stage>=2&&(t.nest={pos:c.clone().setY(t.crownY),out:new X(.3,0,1).normalize()}),e.reinforce?.stakes||e.reinforce?.ropes){let n=[],i=[],o=t.trunkRadius,s=o*3+.25,c=Math.min((t.trunkTop||r)*.8,1.6+o);for(let t=0;t<3;t++){let r=t/3*Math.PI*2+.5,a=new X(Math.cos(r)*s,0,Math.sin(r)*s),l=new X(Math.cos(r)*(o+.03),c,Math.sin(r)*(o+.03));if(e.reinforce.stakes&&n.push(_h(a,l,.03+o*.08,.025,5)),e.reinforce.ropes){let e=new X(Math.cos(r+.5)*s*1.8,.02,Math.sin(r+.5)*s*1.8);i.push(_h(e,new X(Math.cos(r+.5)*o,c*.85,Math.sin(r+.5)*o),.012,.012,3));let t=new jc(.03,.02,.14,5);t.translate(e.x,.05,e.z),n.push(t)}}if(n.length){let e=new G(yh(n),mh(`#c99a63`));e.castShadow=!0,a.add(e)}if(i.length){let e=new tu(o*1.02,.018,4,12);e.rotateX(Math.PI/2),e.translate(0,c*.85,0),i.push(e),a.add(new G(yh(i),mh(`#e8dcc0`)))}}let u=.2,d=r+t.extraHeight;for(let e of t.spots)u=Math.max(u,Math.hypot(e.c.x,e.c.z)+e.r),d=Math.max(d,e.c.y+e.r*.82);a.updateMatrixWorld(!0);let f=Math.max(.01,new bo().setFromObject(a).max.y),p=rh(f,e.heightCm),m=new Ya;a.scale.setScalar(p),m.add(a);let h=t.trunkSpots(),g=new Set,_=e=>{g.has(e)||(e.multiplyScalar(p),g.add(e))};for(let e of[...l,...h,t.nest,t.hollow])e&&_(e.pos);return{group:m,canopy:s,height:f*p,localHeight:f,metricScale:p,canopyRadius:u*p,crownY:t.crownY*p,trunkRadius:t.trunkRadius*p,perches:l,trunkSpots:h,nest:t.nest,hollow:t.hollow,dispose:()=>bh(m)}}var G_=Math.PI/4,K_=.32;function q_(e){let t=e.cond;if(t.stormKind===`typhoon`||t.code>=95)return 1;if(t.stormKind)return .9;let n=0;return t.code===1?n=.1:t.code===2?n=.3:t.code===3?n=.55:t.code===45||t.code===48?n=.6:t.code>=51&&(n=t.code>=63&&t.code!==71?.85:.7),t.raining&&(n=Math.max(n,.7)),n}function J_(e){let t=e.cond;return t.stormKind===`typhoon`||t.code>=95?1:t.stormKind===`heavy-rain`||t.precipMm>=25||t.code===65||t.code===82?.9:t.stormKind===`gale`?.45:t.raining||t.code>=51&&t.code<=82?t.code>=63?.6:.35:0}function Y_(e,t){let n=[],r=4+Math.floor(e()*4);for(let i=0;i<r;i++){let a=t*(.45+e()*.55)*(i===0?1.2:1),o=new Yl(a,1);gh(o,a*.15,i+t,!0),o.scale(1,.62,1),o.translate((i-r/2)*t*.7+e()*t*.3,e()*t*.3,(e()-.5)*t*.8),n.push(o)}let i=yh(n,!0);return vh(i,e=>new W().setScalar(.86+L(e/t,-.5,.5)*.28)),i}var X_=class{renderer;scene=new io;camera=new qu(40,1,.1,500);hemi=new Fu(`#fff4de`,`#6c8a52`,1.1);sun=new Xu(`#ffe2b0`,2.4);fill=new Xu(`#b9d3ff`,.35);skyMat;island;pivot=new Ya;tree=null;treeKeyStr=``;animals=new $g;animalsKey=``;growFrom=1;growStart=0;clouds=[];cloudMat=new fu({vertexColors:!0,flatShading:!0,roughness:1,transparent:!0,opacity:.94,emissive:`#ffffff`,emissiveIntensity:.35});stars;glow;sparkles;landmark=new Ya;rain;rainSeeds;sea;camDist=10;camTargetY=.4;lastTime=0;flash=0;nextFlash=0;dragAz=0;dragEl=0;dragging=null;followOrbit=0;followOrbitEl=0;lastOrbit=-1e9;occludedT=0;liftGoal=0;lift=0;lastFocusPos=new H;focusDelta=new H;lastFocusRef=null;lastDrag=0;quality;thumbs=new Map;width=1;height=1;gust=0;gustTarget=0;nextGust=0;swellT=-99;follow=null;followOn=!1;followAz=0;followPos=new H;heatK=0;habitat=null;habitatKey=``;hud=new io;hudCam=new Ju(0,1,1,0,-1,1);rays;speciesThumbs=new Map;sky;islandK=1;fence=null;zoom=1;zoomGoal=1;panOff=new H;panGoal=new H;followRef=null;followZoom=1;followBias=0;followBiasGoal=0;followCap=1/0;followCheckT=0;pointers=new Map;pinch=null;tap=null;raycaster=new md;canvas;constructor(e,t=`low`){this.canvas=e,this.quality=t,this.renderer=new Lm({canvas:e,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.outputColorSpace=oi,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.95,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=1,this.skyMat=new uu({side:1,depthWrite:!1,fog:!1,uniforms:{top:{value:new W(`#8fcbf0`)},mid:{value:new W(`#cfe9f7`)},bottom:{value:new W(`#e9f4f4`)}},vertexShader:`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, -0.4, h)); gl_FragColor = vec4(c, 1.0); }`});let n=new G(new eu(400,24,12),this.skyMat);n.renderOrder=-1,this.sky=n,this.scene.add(n),this.scene.fog=new ro(`#cfe6f2`,40,220),this.scene.add(this.hemi,this.sun,this.sun.target,this.fill),this.sun.castShadow=!0,this.sun.shadow.bias=-6e-4,this.sun.shadow.normalBias=.03,this.sun.shadow.radius=4,this.applyQuality(),this.island=Bh(),this.scene.add(this.island.group),this.pivot.position.y=.18,this.scene.add(this.pivot),this.scene.add(this.animals.root),this.sea=new G(new Ac(420,48),new fu({color:`#4fa7c9`,roughness:.35,metalness:.1})),this.sea.rotation.x=-Math.PI/2,this.sea.position.y=-22,this.scene.add(this.sea);let r=it(99),i=[];for(let e=0;e<9;e++){let t=-1.2+e*.55+r()*.3,n=110+r()*80,a=5+r()*12,o=new Mc(6+r()*10,a,7,3);gh(o,2.2,e,!1),o.translate(Math.sin(t)*n*-1,-22+a/2-1,-Math.cos(t)*n),vh(o,e=>e>-22+a*.35?new W(`#6f9f5c`):new W(`#8b8173`)),i.push(o)}this.scene.add(new G(yh(i,!0),new fu({vertexColors:!0,flatShading:!0,roughness:1})));for(let e=0;e<16;e++){let t=e<4,n=new G(Y_(r,t?1.2+r()*1.2:1.6+r()*2.4),this.cloudMat),i={mesh:n,r:t?11+r()*5:14+r()*30,a:r()*Math.PI*2,y:t?-4-r()*5:3+r()*12,speed:.01+r()*.02,low:t};this.clouds.push(i),this.scene.add(n)}let a=new $o,o=new Float32Array(1500);for(let e=0;e<500;e++){let t=r()*Math.PI*2,n=.08+r()*.9;o.set([Math.cos(t)*Math.cos(n)*350,Math.sin(n)*350,Math.sin(t)*Math.cos(n)*350],e*3)}a.setAttribute(`position`,new Ro(o,3)),this.stars=new Sc(a,new _c({color:`#fffbe8`,size:1.6,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1})),this.scene.add(this.stars);let s=new $o,c=new Float32Array(180);for(let e=0;e<60;e++)c.set([(r()-.5)*3,r(),(r()-.5)*3],e*3);s.setAttribute(`position`,new Ro(c,3)),this.glow=new Sc(s,new _c({color:`#9dff8a`,size:5,sizeAttenuation:!1,transparent:!0,opacity:.8,depthWrite:!1,blending:2})),this.glow.visible=!1,this.scene.add(this.glow);let l=new $o,u=new Float32Array(270);for(let e=0;e<90;e++){let t=r()*Math.PI*2,n=7.5+r()*2.5;u.set([Math.cos(t)*n,-1.5+r()*3,Math.sin(t)*n],e*3)}l.setAttribute(`position`,new Ro(u,3)),this.sparkles=new Sc(l,new _c({color:`#cfe3ff`,size:3,sizeAttenuation:!1,transparent:!0,opacity:.9,depthWrite:!1,blending:2})),this.sparkles.visible=!1,this.scene.add(this.sparkles);let d=new G(new Pc(.45,0),new fu({color:`#8a8f7a`,flatShading:!0,roughness:1}));d.scale.set(1,.7,.9),d.position.y=.2;let f=new G(new eu(.32,8,6,0,Math.PI*2,0,Math.PI/2),new fu({color:`#6fae4f`,flatShading:!0}));f.position.set(.05,.42,0),this.landmark.add(d,f);for(let e=0;e<4;e++){let t=e*1.7,n=new G(new eu(.1,8,6,0,Math.PI*2,0,Math.PI/2),new fu({color:`#ffd36b`,emissive:`#ffb830`,emissiveIntensity:.6}));n.position.set(Math.cos(t)*.55,.14,Math.sin(t)*.55);let r=new G(new jc(.025,.03,.14,5),new fu({color:`#f3ead2`}));r.position.set(Math.cos(t)*.55,.07,Math.sin(t)*.55),this.landmark.add(n,r)}this.landmark.position.set(2.8,.05,2.2),this.landmark.visible=!1,this.scene.add(this.landmark);let p=new $o;p.setAttribute(`position`,new Ro(new Float32Array(5400),3)),this.rainSeeds=new Float32Array(2700);for(let e=0;e<2700;e++)this.rainSeeds[e]=r();this.rain=new gc(p,new ic({color:`#dbe9f5`,transparent:!0,opacity:.55,fog:!1,depthWrite:!1})),this.rain.frustumCulled=!1,this.rain.visible=!1,this.scene.add(this.rain),this.rays=this.buildRays(),this.bindDrag(),this.resize()}buildRays(){let e=()=>{let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,0,64,64,64);n.addColorStop(0,`rgba(255,255,255,0.95)`),n.addColorStop(.25,`rgba(255,255,255,0.45)`),n.addColorStop(.6,`rgba(255,255,255,0.12)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128);let r=new Tc(e);return r.colorSpace=oi,r},t=(()=>{let e=document.createElement(`canvas`);e.width=128,e.height=32;let t=e.getContext(`2d`),n=t.createImageData(128,32);for(let e=0;e<128;e++)for(let t=0;t<32;t++){let r=(1-e/127)**1.6*Math.min(1,e/10)*Math.sin(t/31*Math.PI)**2.2,i=(t*128+e)*4;n.data[i]=n.data[i+1]=n.data[i+2]=255,n.data[i+3]=Math.round(r*255)}t.putImageData(n,0,0);let r=new Tc(e);return r.colorSpace=oi,r})(),n=e(),r=e=>{let t=new Cs(new ls({map:n,color:e,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:2}));return t.visible=!1,this.hud.add(t),t},i=r(`#ffe2a6`),a=r(`#fff0d0`),o=new Xl(1,1);o.translate(.5,0,0);let s=[];for(let e=0;e<6;e++){let n=new G(o,new As({map:t,color:e%2?`#fff1cc`:`#ffe0a0`,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:2}));n.visible=!1,this.hud.add(n),s.push(n)}return{glow:i,haze:a,shafts:s}}triggerGlare(){this.swellT=this.lastTime}followAnimal(e){this.follow=e}animalCaps(){return this.animals.caps()}animalSizes(){return{factor:this.animals.factor(),sizes:this.animals.drawnSizes()}}walkerSpots(){return this.animals.walkerSpots()}lookAtRim(e,t,n,r){let i=this.islandK,a=lh(this.habitat?.radius??7,e)*t*i,o=new H(Math.cos(e)*a,.1*i,Math.sin(e)*a);this.zoomGoal=n,this.panGoal.copy(o.sub(new H(0,this.camTargetY,0))),r!==void 0&&(this.dragAz=r)}animalInfo(){return this.animals.info()}spawnAnimal(e){vt(e)&&this.animals.spawn(e,{forced:!0})}rotateAnimals(){this.animals.rotate()}setQuality(e){this.quality=e,this.applyQuality(),this.resize()}applyQuality(){let e=this.quality===`high`?2048:1024;this.sun.shadow.mapSize.x!==e&&(this.sun.shadow.mapSize.set(e,e),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null)}bindDrag(){let e=this.canvas;e.style.touchAction=`none`,e.addEventListener(`pointerdown`,t=>{this.pointers.set(t.pointerId,{x:t.clientX,y:t.clientY});try{e.setPointerCapture(t.pointerId)}catch{}if(this.pointers.size===1)this.dragging=this.startDrag(t.clientX,t.clientY),this.tap={x:t.clientX,y:t.clientY,t:performance.now(),moved:!1};else if(this.pointers.size===2){this.dragging=null,this.tap=null;let[e,t]=[...this.pointers.values()];this.pinch={d:Math.hypot(e.x-t.x,e.y-t.y),mx:(e.x+t.x)/2,my:(e.y+t.y)/2}}}),e.addEventListener(`pointermove`,e=>{if(!this.pointers.has(e.pointerId))return;if(this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.tap&&Math.hypot(e.clientX-this.tap.x,e.clientY-this.tap.y)>8&&(this.tap.moved=!0),this.pinch&&this.pointers.size>=2){let[e,t]=[...this.pointers.values()],n=Math.max(10,Math.hypot(e.x-t.x,e.y-t.y)),r=(e.x+t.x)/2,i=(e.y+t.y)/2;this.zoomBy(this.pinch.d/n,r,i),this.panBy(r-this.pinch.mx,i-this.pinch.my),this.pinch={d:n,mx:r,my:i},this.lastDrag=performance.now();return}if(!this.dragging)return;let t=(e.clientX-this.dragging.x)/Math.max(200,this.width),n=(e.clientY-this.dragging.y)/Math.max(200,this.height);if(this.dragging.orbit){this.followOrbit=this.dragging.az-t*3.4,this.followOrbitEl=L(this.dragging.el+n*1.4,-.3,.85),this.tap?.moved&&(this.lastOrbit=performance.now()),this.lastDrag=performance.now();return}let r=this.isZoomed();this.dragAz=L(this.dragging.az-t*2.2,r?-Math.PI:-.6,r?Math.PI:.6),this.dragEl=L(this.dragging.el+n*.8,r?-.5:-.15,r?.35:.15),this.lastDrag=performance.now()});let t=e=>{if(this.pointers.delete(e.pointerId),this.pointers.size<2&&(this.pinch=null),this.pointers.size===1){let[e]=[...this.pointers.values()];this.dragging=this.startDrag(e.x,e.y)}else this.pointers.size===0&&(this.dragging=null,e.type===`pointerup`&&this.tap&&!this.tap.moved&&performance.now()-this.tap.t<350&&this.tapAt(e.clientX,e.clientY),this.tap=null);this.lastDrag=performance.now()};e.addEventListener(`pointerup`,t),e.addEventListener(`pointercancel`,t),e.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaMode===1?16:e.deltaMode===2?400:1;this.zoomBy(Math.exp(L(e.deltaY*t,-200,200)*.0022),e.clientX,e.clientY),this.lastDrag=performance.now()},{passive:!1})}startDrag(e,t){return this.followRef||this.follow?{x:e,y:t,az:this.followOrbit,el:this.followOrbitEl,orbit:!0}:{x:e,y:t,az:this.dragAz,el:this.dragEl}}orbitBy(e,t=0){this.followOrbit+=e,this.followOrbitEl=L(this.followOrbitEl+t,-.3,.85),this.lastOrbit=performance.now()}followCamInfo(){let e=this.followRef?this.animals.focusRef(this.followRef):null,t=null,n=0;if(e){let r=e.pos.clone().project(this.camera);t={x:(r.x+1)/2*this.width,y:(1-r.y)/2*this.height};let i=this.camera.position.distanceTo(e.pos);n=e.size/Math.max(1e-4,i)/(2*Math.tan(Zi.degToRad(this.camera.fov/2))/Math.max(1,this.height))}return{orbit:this.followOrbit,orbitEl:this.followOrbitEl,chase:!!e?.flying,az:this.followAz,lift:this.lift,screen:t,px:n}}waterShare(){let e=this.habitat?.radius??7,t=0,n=0;for(let r=-e;r<=e;r+=.12)for(let i=-e;i<=e;i+=.12){let a=Math.hypot(r,i);a>lh(e,Math.atan2(i,r))-.2||a<1.2||(t++,(a<7&&Rh(r,i,0)||this.habitat&&this.habitat.isWater(r,i,0))&&n++)}return{share:t?n/t:0,stage:this.habitat?.stage??0}}resetFollowCam(){this.followOrbit=0,this.followOrbitEl=0,this.occludedT=0,this.liftGoal=0,this.lastOrbit=-1e9}ndc(e,t){let n=this.canvas.getBoundingClientRect();return new V((e-n.left)/Math.max(1,n.width)*2-1,-((t-n.top)/Math.max(1,n.height))*2+1)}pointUnder(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.camera);let n=[this.pivot,this.island.group];this.habitat&&n.push(this.habitat.group);let r=this.raycaster.intersectObjects(n,!0).find(e=>e.object.isMesh&&!e.object.isSprite);if(r)return r.point;let i=new os(new H(0,1,0),-.1);return this.raycaster.ray.intersectPlane(i,new H)??new H(0,this.camTargetY,0)}obstacle(e,t,n,r,i){let a=new H(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));this.raycaster.set(e,a),this.raycaster.camera=this.camera,this.raycaster.near=i,this.raycaster.far=r;let o=[this.island.group];this.tree&&o.push(this.tree.group),this.habitat&&o.push(this.habitat.group);let s=this.raycaster.intersectObjects(o,!0).find(e=>e.object.isMesh);return this.raycaster.near=0,this.raycaster.far=1/0,s?s.distance:1/0}clearView(e,t,n,r,i,a=!1){let o=Math.max(.05,i*.5),s={bias:0,cap:0},c=a?[0]:[this.followBiasGoal,0,.5,-.5,1,-1,1.6,-1.6,2.4,-2.4,Math.PI];for(let i of c){let a=this.obstacle(e,t+i,n,r,o);if(a===1/0)return{bias:i,cap:1/0};a>s.cap&&(s={bias:i,cap:a})}return{bias:s.bias,cap:Math.max(o*1.2,s.cap*.9)}}zoomBy(e,t,n){if(!Number.isFinite(e)||e<=0)return;if(this.followRef||this.follow){this.followZoom=L(this.followZoom*e,.35,8);return}let r=L(L(this.camDist*.5,.3,1.5)/Math.max(.3,this.camDist),.004,1),i=(this.habitat?.radius??7)*this.islandK,a=Math.max(1,i*3.4/Math.max(.3,this.camDist)),o=this.zoomGoal,s=L(o*e,r,a);if(s===o)return;let c=new H(0,this.camTargetY,0),l=c.clone().add(this.panGoal),u;if(t===void 0||n===void 0||s>1)u=l;else{let e=this.pointUnder(t,n),r=c.clone().add(this.panOff);u=e.clone().add(r.sub(e).multiplyScalar(s/Math.max(1e-4,this.zoom)))}this.panGoal.copy(u.sub(c)),this.zoomGoal=s,this.clampPan()}panBy(e,t){if(!this.isZoomed()||this.followRef||this.follow)return;let n=2*(this.camDist*this.zoom)*Math.tan(Zi.degToRad(this.camera.fov/2))/Math.max(1,this.height),r=new H().setFromMatrixColumn(this.camera.matrixWorld,0),i=new H().setFromMatrixColumn(this.camera.matrixWorld,1);this.panGoal.addScaledVector(r,-e*n).addScaledVector(i,t*n),this.clampPan()}clampPan(){let e=(this.habitat?.radius??7)*this.islandK*1.05,t=Math.hypot(this.panGoal.x,this.panGoal.z);t>e&&this.panGoal.multiplyScalar(e/t);let n=Math.max(1,(this.tree?.height??1)*1.1),r=this.camTargetY+this.panGoal.y;r<.03&&(this.panGoal.y=.03-this.camTargetY),r>n&&(this.panGoal.y=n-this.camTargetY)}tapAt(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.camera);let n=2*Math.tan(Zi.degToRad(this.camera.fov/2))/Math.max(1,this.height),r=this.animals.pick(this.raycaster.ray,e=>e*n*26);if(r){this.followRef=r,this.follow=null,this.followZoom=1,this.resetFollowCam();return}let i=this.canvas.getBoundingClientRect(),a=null;for(let n of this.animals.markers(this.camera,this.width,this.height)){if(n.px>22)continue;let r=Math.min(Math.hypot(n.x+i.left-e,n.y+i.top-t),Math.hypot(n.x+i.left-e,n.y-30+i.top-t));r<48&&(!a||r<a.d)&&(a={uid:n.uid,d:r})}a&&this.followCrew(a.uid)}animalMarkers(){return this.animals.markers(this.camera,this.width,this.height)}followCrew(e){let t=this.animals.handleFor(e);return t?(this.followRef=t,this.follow=null,this.followZoom=1,this.resetFollowCam(),!0):!1}followingUid(){let e=this.followRef;return e&&this.animals.refName(e)?e.crew.uid:null}crewList(){return this.animals.crewList()}takeArrivals(){return this.animals.takeArrivals()}hintStats(){return this.animals.hintStats()}isZoomed(){return this.zoomGoal<.97||this.zoomGoal>1.03||this.panGoal.lengthSq()>.01}viewState(){let e=this.followRef?this.animals.refName(this.followRef):null;return{active:this.isZoomed()||!!this.followRef,following:e}}resetView(){this.zoomGoal=1,this.panGoal.set(0,0,0),this.followRef=null,this.followZoom=1,this.dragAz=0,this.dragEl=0,this.resetFollowCam()}animalScreen(e){let t=this.animals.focus(e);if(!t)return null;let n=t.pos.clone().project(this.camera),r=this.canvas.getBoundingClientRect();return{x:r.left+(n.x+1)/2*r.width,y:r.top+(1-n.y)/2*r.height}}flyerHeights(){return this.animals.flyerHeights()}cameraInfo(){return{zoom:this.zoomGoal,distM:this.camDist*this.zoom,islandK:this.islandK,treeM:this.tree?.height??0}}resize(){let e=Math.max(1,window.innerWidth),t=Math.max(1,window.innerHeight);this.width=e,this.height=t;let n=this.quality===`high`?2:1.5;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,n)),this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.fov=this.camera.aspect<.8?46:36,this.camera.updateProjectionMatrix(),this.hudCam.left=0,this.hudCam.right=e,this.hudCam.top=t,this.hudCam.bottom=0,this.hudCam.updateProjectionMatrix()}ensureTree(e,t){let n={species:e.species,stage:e.stage,heightCm:e.heightCm,health:e.health,pests:e.pests,scars:e.scars,seed:rt(e.treeName||`tree`)%97+1,reinforce:e.reinforce},r=U_(n);if(r!==this.treeKeyStr){let e=this.tree,i=W_(n);e?(this.growFrom=L(e.height/i.height,.5,1.5),this.growStart=t,this.pivot.remove(e.group),e.dispose()):this.growFrom=1,this.pivot.add(i.group),this.tree=i,this.treeKeyStr=r,this.animalsKey=``}let i=e.daylight<.35,a=`${e.unlocked.join(`,`)}|${e.residents.join(`,`)}|${e.health>=22}|${i}|${e.stage}`;a!==this.animalsKey&&this.tree&&(this.animals.sync({unlocked:e.unlocked,residents:e.residents,tree:this.tree,health:e.health,night:i,stage:e.stage}),this.animalsKey=a)}groundRay=new md;groundUnits(e,t){let n=this.islandK,r=[this.island.grass,...this.habitat?.ground??[]];this.groundRay.set(new H(e*n,60*n,t*n),new H(0,-1,0)),this.groundRay.far=200*n;let i=this.groundRay.intersectObjects(r,!1)[0];if(i)return i.point.y/n;let a=Math.hypot(e,t);return a<7?.18*(1-Math.min(1,a/7)**2):this.habitat?.groundAt(e,t)??-.02}groundFast(e,t){let n=Math.hypot(e,t);if(n<lh(7,Math.atan2(t,e))-.05){let r=.18*(1-Math.min(1,n/7)**2);return this.habitat&&this.habitat.stage>0?Math.max(r,this.habitat.groundAt(e,t)):r}return this.habitat?.groundAt(e,t)??-.02}wetOrBlocked(e,t,n){return Math.hypot(e,t)<7.4&&Rh(e,t,.06+n)?!0:!!(this.habitat&&(this.habitat.isWater(e,t,n)||this.habitat.isBlocked(e,t)))}ensureFence(e){let t=this.habitat?.radius??7,n=sh(this.islandK,e),r=`${this.habitatKey}|${t}`;(!this.fence||!this.fence.key.startsWith(r+`|`)||Math.abs(Number(this.fence.key.split(`|`).pop())-n)/n>.04)&&(this.fence&&(this.scene.remove(this.fence.group),this.fence.dispose()),this.island.group.updateMatrixWorld(!0),this.habitat?.group.updateMatrixWorld(!0),this.fence=Uh({R:t,hUnits:n,key:`${r}|${n}`,groundAt:(e,t)=>this.groundUnits(e,t),skip:(e,t)=>this.wetOrBlocked(e,t,.02)}),this.scene.add(this.fence.group)),this.fence.group.scale.setScalar(this.islandK)}fenceInfo(){let e=this.islandK,t=this.fence?.posts??[];return{fenceRadius:(t.length?t.reduce((e,t)=>e+t.r,0)/t.length:0)*e,islandRadius:(this.habitat?.radius??7)*e}}fenceCheck(){let e=this.islandK,t=this.fence?.posts??[];this.island.group.updateMatrixWorld(!0),this.habitat?.group.updateMatrixWorld(!0);let n=[this.island.grass,...this.habitat?.ground??[]],r=(t,r)=>(this.groundRay.set(new H(t*e,60*e,r*e),new H(0,-1,0)),this.groundRay.far=200*e,this.groundRay.intersectObjects(n,!1).length>0),i=0,a=0,o=0;for(let e of t){if(!r(e.x,e.z)){i++;continue}let t=0,n=.01;for(;t<3&&r(e.x+Math.cos(e.a)*(t+n),e.z+Math.sin(e.a)*(t+n));)t+=n;a=Math.max(a,t),o+=t}let s=this.habitat?.radius??7,c=Math.max(24,Math.round(Math.PI*2*s/1.05))+1;return{posts:t.length,offLand:i,maxGapUnits:a,meanGapUnits:t.length?o/t.length:0,maxGapM:a*e,K:e,stage:this.habitat?.stage??0,skipped:c-t.length}}ensureHabitat(e){let t=L(Math.round(e.islandStage??e.stage),0,4),n=this.propBucketGoal(),r=`${e.species}|${t}|${this.quality}|p${n}`;r!==this.habitatKey&&(this.habitatKey=r,this.habitat&&(this.scene.remove(this.habitat.group),this.habitat.dispose()),this.habitat=h_(e.species,t,this.quality,Th(n)),this.animals.setGround((e,t)=>this.groundFast(e/this.islandK,t/this.islandK)*this.islandK,(e,t)=>!this.wetOrBlocked(e/this.islandK,t/this.islandK,.2)),this.scene.add(this.habitat.group),this.island.setExtended(t>=1),this.animals.setIslandRadius(this.habitat.radius,this.islandK))}propBucketGoal(){let e=this.tree;return e?wh(Ch(e.height,oh(e.metricScale))):0}propInfo(){let e=this.tree?.height??0,t=Sh.uPropK.value,n=this.renderer.info.render;return{propK:t,bucket:this.propBucketGoal(),islandK:this.islandK,treeM:e,propM:t*this.islandK,tris:n.triangles,calls:n.calls}}draw(e,t){let n=t/1e3,r=L(n-this.lastTime,0,.1);this.lastTime=n,this.ensureTree(e,n),this.ensureHabitat(e);let i=this.tree,a=1-(1-L((n-this.growStart)/.9,0,1))**3;i.group.scale.setScalar(this.growFrom+(1-this.growFrom)*a);let o=L(e.daylight,0,1),s=1-o,c=q_(e),l=J_(e),u=e.cond.stormKind===`typhoon`||e.cond.code>=95,d=u||!!e.cond.stormKind,f=o>0&&o<1?1-Math.abs(o-.5)*2:0,p=Math.max(f,L(1-Math.min(Math.abs(e.minute-e.sunriseMin),Math.abs(e.minute-e.sunsetMin))/70,0,1)*o),m=new W(`#79bfeb`).lerp(new W(`#8d99a6`),c).lerp(new W(`#4b5563`),d?.55:0),h=new W(`#cde8f6`).lerp(new W(`#b8c2ca`),c).lerp(new W(`#687380`),d?.5:0),g=new W(`#f3b27a`);h.lerp(g,p*.55*(1-c));let _=new W(`#0f1d3a`),v=new W(`#27365c`).lerp(new W(`#2a2f38`),c*.6),y=_.clone().lerp(m,o),b=v.clone().lerp(h,o);this.skyMat.uniforms.top.value.copy(y),this.skyMat.uniforms.mid.value.copy(b),this.skyMat.uniforms.bottom.value.copy(b.clone().lerp(new W(`#ffffff`),.12*o));let x=this.scene.fog;x.color.copy(b).lerp(new W(`#ffffff`),.2*o);let S=!!e.cond.hot&&o>.3;this.heatK+=(+!!S-this.heatK)*(1-Math.exp(-r*.8));let C=new W(`#ffe7bf`).lerp(new W(`#ffb066`),p*.7);e.cond.hot&&C.lerp(new W(`#ffd28a`),.3);let w=new W(`#a9bcf2`);if(this.sun.color.copy(w.clone().lerp(C,o)),this.sun.intensity=(.7*s+o*2.6)*(1-c*.72)*(d?.45:1)*(1+this.heatK*.12),this.sun.color.lerp(new W(`#ffcf87`),this.heatK*.45),this.hemi.color.copy(new W(`#7086bd`).lerp(new W(`#fff2da`),o).lerp(new W(`#c7cdd3`),c*.5)),this.hemi.groundColor.copy(new W(`#2c3a33`).lerp(new W(`#78905a`),o)),this.hemi.intensity=(.75+o*.55)*(d?.62:1),this.fill.intensity=.25+o*.2,u&&!e.reducedMotion&&n>this.nextFlash&&(this.flash=1,this.nextFlash=n+3+Math.random()*5),this.flash=Math.max(0,this.flash-r*3.5),this.flash>0){let e=this.flash>.6||this.flash>.25&&this.flash<.4?this.flash:0;this.hemi.intensity+=e*2.2,this.skyMat.uniforms.top.value.lerp(new W(`#dfe6ff`),e*.6)}let T=e.reducedMotion?.3:1,E=L(e.sway,0,1);n>this.nextGust&&(this.gustTarget=E>.25?.45+Math.random()*.55:Math.random()*.35,this.nextGust=n+1.2+Math.random()*(4.5-E*3)),this.gustTarget*=Math.exp(-r*.9),this.gust+=(this.gustTarget-this.gust)*(1-Math.exp(-r*3));let D=this.gust*E,O=1/(1+i.localHeight*.04),k=(.004+E*.065)*(1+D*.8)*T*O,A=.8+E*1.5,j=E*.085*(.55+D*.7)*T*O;this.pivot.rotation.z=-j+Math.sin(n*A)*k+Math.sin(n*A*2.37+.6)*k*.35,this.pivot.rotation.x=Math.sin(n*A*.8+1)*k*.5,x_.uTime.value=n,x_.uWind.value=E*T,x_.uGust.value=D*T,x_.uHeight.value=Math.max(.6,i.localHeight);let ee=E*110+D*20,M=this.habitat?.radius??7,te=oh(i.metricScale);this.islandK+=(te-this.islandK)*(r===0?1:1-Math.exp(-r*2)),Math.abs(this.islandK-te)<.002&&(this.islandK=te);let ne=this.islandK;this.island.group.scale.setScalar(ne),this.habitat?.group.scale.setScalar(ne),this.pivot.position.y=.18*ne,this.landmark.scale.setScalar(ne),this.landmark.position.set(2.8*ne,.05*ne,2.2*ne),this.animals.setIslandRadius(M,ne),this.ensureFence(i.height);let re=Ch(i.height,ne);if(Sh.uPropK.value=re,this.island.setProps(re,this.propBucketGoal()),this.island.dirt.scale.setScalar(L(.3+i.localHeight*.09,.3,1.5)),this.island.update(n,ee),this.habitat?.update(n,ee),this.landmark.visible=!!e.landmark,this.sparkles.visible=!!e.starry,this.sparkles.visible&&(this.sparkles.rotation.y=n*.05,this.sparkles.scale.setScalar((this.habitat?.radius??7)*this.islandK/7)),this.glow.visible=!!e.thriving&&!e.reducedMotion,this.glow.visible){let e=this.glow.geometry.getAttribute(`position`),t=Math.max(1,i.height);for(let r=0;r<e.count;r++){let i=(n*.25+r*.137)%1;e.setY(r,.3+i*t*1.1)}e.needsUpdate=!0,this.glow.scale.set(Math.max(1,t*.35),1,Math.max(1,t*.35)),this.glow.material.opacity=.35+.35*Math.sin(n*2)}this.pivot.updateMatrixWorld(!0),this.animals.setView(this.camera.position,2*Math.tan(Zi.degToRad(this.camera.fov/2))/Math.max(1,this.height),this.renderer.getPixelRatio()),this.animals.update(n,r,s);let ie=(this.habitat?.radius??7)*this.islandK,ae=this.habitat?.stage??0,oe=new W(`#ffffff`).lerp(new W(`#9aa3ad`),c).lerp(new W(`#59616b`),d?.6:0).lerp(new W(`#39435e`),s*.8);this.cloudMat.color.copy(oe),this.cloudMat.emissiveIntensity=.35*o*(1-c*.6);let se=8+Math.round(c*8),ce=this.islandK,le=this.camDist/ce;this.clouds.forEach((e,t)=>{e.a+=e.speed*r*(1+ee*.02),e.mesh.visible=t<se;let n=1+c*.6+le/40*(e.low?0:.8);e.mesh.scale.setScalar(n*ce);let i=e.low?Math.max(e.r,ie/ce+3+e.r*.3):e.r+le*.35;e.mesh.position.set(Math.cos(e.a)*i*ce,(e.y+(e.low?0:c*2))*ce,Math.sin(e.a)*i*ce)}),this.stars.material.opacity=s*(1-c*.9),this.stars.visible=s>.02,this.sea.material.color.set(`#58b6e0`).lerp(new W(`#5d7482`),c*.8).lerp(new W(`#122036`),s*.7);let ue=i.height*i.group.scale.y,de=this.islandK,fe=Math.max(1*de,i.canopyRadius*i.group.scale.x),pe=Math.max(2*de,Math.sqrt((ue*.55)**2+fe*fe)*1.14,ie*[.2,.28,.32,.36,.38][ae]),me=Zi.degToRad(this.camera.fov/2),he=Math.atan(Math.tan(me)*this.camera.aspect),ge=this.camera.aspect<.8,_e=Math.max(pe/Math.sin(me)*(ge?1.3:1.18),pe/Math.sin(he)*(ge?1.12:1.05)),ve=ue*.47+(ge?ue*.02:0),ye=1-Math.exp(-r*1.6);this.camDist===10&&this.lastTime<.2&&(this.camDist=_e),this.camDist+=(_e-this.camDist)*(r===0?1:ye),this.camTargetY+=(ve-this.camTargetY)*(r===0?1:ye);let be=r===0?1:1-Math.exp(-r*9);!this.isZoomed()&&!this.pinch&&this.panGoal.multiplyScalar(1-Math.min(1,r*3)),this.zoom+=(this.zoomGoal-this.zoom)*be,this.panOff.lerp(this.panGoal,be),!this.dragging&&!this.isZoomed()&&!this.followRef&&performance.now()-this.lastDrag>5e3&&(this.dragAz*=1-Math.min(1,r*.6),this.dragEl*=1-Math.min(1,r*.6));let xe=K_+this.dragAz+Math.sin(n*.05)*.03*T,Se=G_+this.dragEl,Ce=new H(0,this.camTargetY,0).add(this.panOff),we=this.camDist*this.zoom,N=this.followRef?this.animals.focusRef(this.followRef):this.follow?this.animals.focus(this.follow):null;this.followRef&&!N&&(this.followRef=null),N&&!Number.isFinite(N.pos.x)&&(N=null);let Te=!!N?.flying;N&&(this.followOn||this.followPos.copy(N.pos),this.lastFocusRef===(this.followRef??this.follow)&&this.followOn&&this.followPos.add(this.focusDelta.subVectors(N.pos,this.lastFocusPos)),this.lastFocusPos.copy(N.pos),this.lastFocusRef=this.followRef??this.follow,this.followPos.lerp(N.pos,r===0?1:1-Math.exp(-r*(Te?5:7))),Ce.copy(this.followPos),Ce.y+=N.size*(Te?.12:.3),we=Math.max(.22,N.size*(Te?5.5:4.2))*this.followZoom),this.followOn=!!N,this.lift+=(this.liftGoal-this.lift)*(r===0?1:1-Math.exp(-r*1.5));let Ee=N?L((Te?.2:Math.min(Se,.38))+this.followOrbitEl+this.lift,-.25,1.25):Se,De=xe;if(N){let e=N.outward&&Math.hypot(N.pos.x,N.pos.z)>.05,t=Te?Math.atan2(-Math.cos(N.yaw),Math.sin(N.yaw))+.55:e?Math.atan2(N.pos.x,N.pos.z)+.35:Math.atan2(Math.cos(N.yaw),-Math.sin(N.yaw))+.9,n=Math.atan2(Math.sin(t-this.followAz),Math.cos(t-this.followAz));this.followAz+=n*(1-Math.exp(-r*(Te?2.2:1.2)));let i=!!(this.dragging?.orbit&&this.tap?.moved)||performance.now()-this.lastOrbit<2500;if(this.followCheckT-=r,this.followCheckT<=0){this.followCheckT=.35;let e=this.clearView(Ce,this.followAz+this.followOrbit,Ee,we,N.size,i);this.followBiasGoal=i?0:e.bias,this.followCap=e.cap;let t=e.cap<N.size*2.4;if(this.occludedT=t?this.occludedT+.35:Math.max(0,this.occludedT-.7),this.occludedT>=1.4&&this.followRef){let e=(N.group??1)>1?this.animals.otherMember(this.followRef):null;e?(this.followRef=e,this.occludedT=0,this.followCheckT=0):(this.liftGoal=Math.min(.75,this.liftGoal+.25),this.occludedT=1)}else!t&&this.occludedT===0&&(this.liftGoal=Math.max(0,this.liftGoal-.05))}this.followBias+=(this.followBiasGoal-this.followBias)*(1-Math.exp(-r*3)),De=this.followAz+this.followBias+this.followOrbit,we>this.followCap&&(we=this.followCap)}else this.followAz=xe,this.followBias=this.followBiasGoal=0,this.followCap=1/0;if(this.camera.position.set(Ce.x+Math.sin(De)*Math.cos(Ee)*we,Ce.y+Math.sin(Ee)*we,Ce.z+Math.cos(De)*Math.cos(Ee)*we),this.isZoomed()||N){let e=(this.habitat?.groundAt(this.camera.position.x,this.camera.position.z)??0)+Math.min(.12,we*.2);this.camera.position.y<e&&(this.camera.position.y=e)}this.camera.lookAt(Ce);let P=ge?.085:.03;this.camera.setViewOffset(this.width,this.height,0,-this.height*P,this.width,this.height),this.camera.near=L(we*.02,.005,2),this.camera.far=Math.max(900,we*3+500),this.sky.position.copy(this.camera.position),this.sea.position.set(this.camera.position.x,-22*this.islandK,this.camera.position.z),this.camera.updateProjectionMatrix(),x.near=Math.max(we,this.camDist)*1.15,x.far=Math.max(we,this.camDist)*2.6+40*this.islandK;let Oe=new H(-.55,.8-p*.3,.45).normalize();if(this.heatK>.001){let e=new H(Math.cos(xe),0,-Math.sin(xe)),t=new H(Math.sin(xe),0,Math.cos(xe)),n=e.multiplyScalar(.62).add(new H(0,.82,0)).addScaledVector(t,-.12).normalize();Oe.lerp(n,this.heatK*.85).normalize()}let F=L(Math.min(pe*1.3,we*1.2+(N?0:pe*.2)),1.2,400);this.sun.position.copy(Ce).addScaledVector(Oe,F*3),this.sun.target.position.copy(Ce);let I=this.sun.shadow.camera;I.left=-F,I.right=F,I.top=F,I.bottom=-F,I.near=.5,I.far=F*6,I.updateProjectionMatrix(),this.fill.position.set(6,4,8),this.updateRain(l,ee,r,Ce),this.renderer.render(this.scene,this.camera),this.drawRays(e,n)}drawRays(e,t){let n=t-this.swellT,r=n>=0&&n<6?Math.sin(n/6*Math.PI):0,i=Math.max(this.heatK,r*.9),{glow:a,haze:o,shafts:s}=this.rays;if(this.renderer.toneMappingExposure=.95+i*.03,i<.01){a.visible=o.visible=!1,s.forEach(e=>e.visible=!1);return}let c=e.reducedMotion,l=c?1:.82+.14*Math.sin(t*.55)+.05*Math.sin(t*1.4+1),u=this.width,d=this.height,f=Math.max(u,d),p=u*.98,m=d*.99;a.visible=o.visible=!0,a.position.set(p,m,0),a.scale.set(f*.75,f*.75,1),a.material.opacity=.34*i*l,o.position.set(p,m,0),o.scale.set(f*2.2,f*2.2,1),o.material.opacity=.08*i;let h=u*.42,g=d*.4,_=Math.atan2(g-m,h-p),v=Math.hypot(h-p,g-m),y=[-.26,-.15,-.05,.04,.14,.24];s.forEach((e,n)=>{e.visible=!0;let r=c?0:Math.sin(t*.07+n*1.7)*.025;e.position.set(p,m,0),e.rotation.z=_+y[n]+r,e.scale.set(v*(1.05+n%3*.18),f*(.045+n%3*.025),1);let a=c?.8:.55+.45*Math.sin(t*.35+n*1.3);e.material.opacity=.11*i*a*l});let b=this.renderer.autoClear;this.renderer.autoClear=!1,this.renderer.render(this.hud,this.hudCam),this.renderer.autoClear=b}speciesThumb(e,t,n,r=192){let i=`${e}|${t}|${r}`,a=this.speciesThumbs.get(i);if(a)return a;let o=W_({species:e,stage:t,heightCm:n,health:90,pests:0,scars:0,seed:11}),s=new io;s.add(new Fu(`#fff8e8`,`#8a9a6a`,1.5));let c=new Xu(`#fff1d6`,2.4);c.position.set(-2,3,2.5),s.add(c),s.add(o.group);let l=o.height*.05,u=new G(new jc(o.canopyRadius*1.1+l,o.canopyRadius*1+l,o.height*.02,20),new fu({color:`#8cc26a`,flatShading:!0}));u.position.y=-o.height*.01,s.add(u);let d={w:x_.uWind.value,g:x_.uGust.value,h:x_.uHeight.value};x_.uWind.value=0,x_.uGust.value=0,x_.uHeight.value=o.localHeight;let f=new bo().setFromObject(o.group),p=f.getCenter(new H),m=f.getSize(new H),h=new qu(28,1,Math.max(.001,o.height*.01),Math.max(50,o.height*20)),g=Math.max(m.y*.55,m.x*.6,m.z*.6);h.position.copy(p).add(new H(.35,.28,1).normalize().multiplyScalar(g/Math.tan(Zi.degToRad(14))*1.02)),h.lookAt(p);let _=this.renderToUrl(s,h,r);return x_.uWind.value=d.w,x_.uGust.value=d.g,x_.uHeight.value=d.h,o.dispose(),u.geometry.dispose(),this.speciesThumbs.set(i,_),_}renderToUrl(e,t,n){let r=new va(n,n,{colorSpace:oi,samples:4}),i=this.renderer.getRenderTarget(),a=this.renderer.toneMappingExposure;this.renderer.toneMappingExposure=1,this.renderer.setRenderTarget(r),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.render(e,t);let o=new Uint8Array(n*n*4);this.renderer.readRenderTargetPixels(r,0,0,n,n,o),this.renderer.setRenderTarget(i),this.renderer.setClearColor(0,1),this.renderer.toneMappingExposure=a,r.dispose();let s=document.createElement(`canvas`);s.width=s.height=n;let c=s.getContext(`2d`),l=c.createImageData(n,n);for(let e=0;e<n;e++)l.data.set(o.subarray((n-1-e)*n*4,(n-e)*n*4),e*n*4);return c.putImageData(l,0,0),s.toDataURL(`image/png`)}updateRain(e,t,n,r){if(this.rain.visible=e>0,!e)return;let i=this.rain.geometry.getAttribute(`position`),a=i.count/2,o=Math.floor(a*e);this.rain.geometry.setDrawRange(0,o*2);let s=Math.max(14,this.camDist*.9),c=s*1.2,l=s*.035,u=Math.min(.9,t*.012),d=s*1.4,f=this.rainSeeds,p=this.lastTime;for(let e=0;e<o;e++){let t=(f[e*3]-.5)*s*1.6,n=(f[e*3+2]-.5)*s*1.6,a=(f[e*3+1]+p*d/c)%1,o=r.y+c*.6-a*c,m=t+u*a*c*.4;i.setXYZ(e*2,m,o,n),i.setXYZ(e*2+1,m-u*l,o-l,n)}i.needsUpdate=!0,this.rain.material.opacity=.35+e*.35}thumbnail(e,t){let n=`${e}|${t}`,r=this.thumbs.get(n);if(r)return r;let i=Og(e);if(!i)return null;let a=new io;a.add(new Fu(`#ffffff`,`#b0a080`,1.4));let o=new Xu(`#fff1d6`,2.2);o.position.set(-1,2,2),a.add(o);let s=new Ya;s.add(i),i.position.set(0,0,0);let c=vt(e)?.look.kind;c===`butterfly`||c===`dragonfly`||c===`bee`?i.rotation.set(1.05,.5,0):i.rotation.set(0,-.5,0),i.scale.setScalar(1),i.visible=!0,a.add(s);let l=new bo().setFromObject(s),u=l.getCenter(new H),d=l.getSize(new H).length()*.5||1,f=new qu(30,1,.01,50);f.position.copy(u).add(new H(.9,.7,1.9).normalize().multiplyScalar(d/Math.sin(Zi.degToRad(15))*1.05)),f.lookAt(u),t||s.traverse(e=>{let t=e;t.isMesh&&(t.material=new As({color:`#5d6b62`,transparent:!0,opacity:.55}))});let p=new va(128,128,{colorSpace:oi,samples:4}),m=this.renderer.getRenderTarget(),h=this.renderer.shadowMap.enabled;this.renderer.setRenderTarget(p),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.render(a,f);let g=new Uint8Array(65536);this.renderer.readRenderTargetPixels(p,0,0,128,128,g),this.renderer.setRenderTarget(m),this.renderer.shadowMap.enabled=h,this.renderer.setClearColor(0,1),p.dispose();let _=document.createElement(`canvas`);_.width=_.height=128;let v=_.getContext(`2d`),y=v.createImageData(128,128);for(let e=0;e<128;e++)y.data.set(g.subarray((127-e)*128*4,(128-e)*128*4),e*128*4);v.putImageData(y,0,0);let b=_.toDataURL(`image/png`);return this.thumbs.set(n,b),b}lineup(e,t,n=1200,r=420){let i=new io;i.background=new W(`#dfeef5`),i.add(new Fu(`#ffffff`,`#b0a080`,1.5));let a=new Xu(`#fff1d6`,2.2);a.position.set(-1,3,4),i.add(a);let o=ah(t),s=0,c=0,l=[];for(let t of e){let e=vt(t),n=Og(t);if(!e||!n)continue;n.scale.setScalar(xg(e)*o);let r=e.look.kind;n.rotation.set(r===`butterfly`||r===`dragonfly`||r===`bee`?1.2:0,r===`butterfly`?0:-.25,0);let a=new bo().setFromObject(n),u=a.getSize(new H);n.position.set(s-a.min.x,-a.min.y,0),s+=u.x+Math.max(.25,u.x*.15),c=Math.max(c,u.y),i.add(n),l.push(n)}let u=Math.max(1,s),d=new G(new kc(u+1,.02,1.5),new fu({color:`#9cc27a`}));d.position.set(u/2-.3,-.011,0),i.add(d);let f=new Ya,p=new G(new kc(1,.02,.02),new As({color:`#222`}));p.position.set(.5,0,0),f.add(p);for(let e=0;e<=10;e++){let t=new G(new kc(.008,e%5==0?.08:.04,.02),new As({color:`#222`}));t.position.set(e/10,.02,0),f.add(t)}f.position.set(0,.01,.6),i.add(f);let m=n/r,h=Math.max(u+.6,(c+.4)*m),g=h/m,_=new Ju(-h/2,h/2,g/2,-g/2,-50,50);_.position.set(u/2-.1,g/2-.15,10),_.lookAt(u/2-.1,g/2-.15,0);let v=new va(n,r,{colorSpace:oi,samples:4}),y=this.renderer.getRenderTarget();this.renderer.setRenderTarget(v),this.renderer.setClearColor(14675701,1),this.renderer.clear(),this.renderer.render(i,_);let b=new Uint8Array(n*r*4);this.renderer.readRenderTargetPixels(v,0,0,n,r,b),this.renderer.setRenderTarget(y),this.renderer.setClearColor(0,1),v.dispose();let x=document.createElement(`canvas`);x.width=n,x.height=r;let S=x.getContext(`2d`),C=S.createImageData(n,r);for(let e=0;e<r;e++)C.data.set(b.subarray((r-1-e)*n*4,(r-e)*n*4),e*n*4);S.putImageData(C,0,0),S.fillStyle=`#222`,S.font=`22px sans-serif`;let w=n/h;S.fillRect(12,44,w,5);for(let e=0;e<=10;e++)S.fillRect(12+w*e/10-1,e%5==0?36:40,2,e%5==0?13:9);return S.fillText(`黑尺 = 場景 1 米（全部動物同一放大系數 ×${o.toFixed(2)}，樹高 ${t} 米）`,12,26),x.toDataURL(`image/png`)}},Z_=10,Q_=30;function $_(e,t){switch(t){case`monkey`:return`🐒`;case`squirrel`:return`🐿️`;case`bat`:return`🦇`;case`owl`:return`🦉`;case`bee`:return`🐝`;case`snake`:return`🐍`;case`turtle`:return`🐢`;case`frog`:return`🐸`;case`firefly`:return`✨`}switch(e){case`bird`:return`🐦`;case`butterfly`:return`🦋`;case`insect`:return`🐞`;case`reptile`:return`🦎`;case`amphibian`:return`🐸`;case`mammal`:return`🐾`}}var ev={perch:`飛咗嚟`,flock:`飛咗嚟`,soar:`喺天上盤旋`,hover:`飛咗嚟`,flutter:`飛咗嚟`,bat:`飛咗嚟`,walk:`行咗嚟`,hop:`跳咗嚟`,wade:`嚟咗水邊`,climb:`爬上咗樹`,crawl:`爬咗出嚟`,glow:`亮起嚟`,nest:`喺樹上築咗巢`,hollow:`喺樹洞探頭`};function tv(e){return e>=3?`一群`:e===2?`兩隻`:`一隻`}function nv(e){if(e.length===1){let t=e[0];return`${tv(t.count)}${t.name}${ev[t.motion]}`}let t=e.map(e=>e.name),n=t.slice(0,-1).join(`、`);return t.length>3?`${t.slice(0,3).join(`、`)}等 ${t.length} 群動物嚟咗`:`${n}同${t[t.length-1]}嚟咗`}function rv(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function iv(e,t){let n=document.createElement(`div`);n.id=`animal-markers`,n.className=`animal-markers`,document.body.insertBefore(n,document.getElementById(`app`));let r=document.getElementById(`app`),i=document.createElement(`button`);i.type=`button`,i.id=`animal-toast`,i.className=`animal-toast`,i.hidden=!0,r.appendChild(i);let a=document.createElement(`button`);a.type=`button`,a.id=`animal-list-btn`,a.className=`glass animal-list-btn`,a.setAttribute(`aria-label`,`島上動物`),a.setAttribute(`aria-expanded`,`false`),r.appendChild(a);let o=document.createElement(`section`);o.id=`animal-list`,o.className=`glass animal-list`,o.hidden=!0,o.setAttribute(`aria-label`,`島上動物`),r.appendChild(o);let s=!0,c=new Map,l=[],u=[],d=-1e9,f=-1e9,p=``,m=[],h=0,g=[],_=null,v=0,y=0,b=t=>{e.followCrew(t)&&C()},x=null;n.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`[data-uid]`);t&&(x={uid:Number(t.dataset.uid),x:e.clientX,y:e.clientY,t:performance.now()})}),window.addEventListener(`pointerup`,e=>{let t=x;x=null,t&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<16&&performance.now()-t.t<700&&b(t.uid)}),window.addEventListener(`pointercancel`,()=>x=null),n.addEventListener(`click`,e=>{if(e.detail!==0)return;let t=e.target.closest(`[data-uid]`);t&&b(Number(t.dataset.uid))}),i.addEventListener(`click`,()=>{if(!_)return;let t=e.crewList(),n=_.list.find(e=>t.some(t=>t.uid===e.uid));n&&b(n.uid),_.until=0}),a.addEventListener(`click`,()=>o.hidden?S():C()),o.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-close]`))return C();let n=t.closest(`[data-uid]`);n&&b(Number(n.dataset.uid))});function S(){o.hidden=!1,a.setAttribute(`aria-expanded`,`true`),p=``,w()}function C(){o.hidden=!0,a.setAttribute(`aria-expanded`,`false`)}function w(){let n=e.crewList(),r=e.followingUid(),i=n.reduce((e,t)=>e+t.count,0),s=`<span class="alb-ic">🐾</span><b>${n.length}</b>`;if(a.innerHTML!==s&&(a.innerHTML=s),a.classList.toggle(`has-new`,n.some(e=>t(e.id))),o.hidden)return;let c=`${r}|${n.map(e=>`${e.uid}:${e.count}:${t(e.id)}`).join(`,`)}`;if(c===p)return;p=c;let l=n.slice().sort((e,n)=>Number(t(n.id))-Number(t(e.id))||n.count-e.count).map(e=>`<li><button type="button" data-uid="${e.uid}" class="${e.uid===r?`on`:``}" data-cat="${e.category}">
          <span class="al-ic">${$_(e.category,e.kind)}</span>
          <span class="al-name">${R(e.name)}${t(e.id)?`<em class="al-new">新</em>`:``}${e.resident?`<small>長駐</small>`:``}</span>
          <span class="al-n">×${e.count}</span></button></li>`).join(``);o.innerHTML=`<header><b>島上動物</b><small>${n.length} 群・${i} 隻</small><button type="button" class="al-close" data-close aria-label="關閉">×</button></header>
      ${l?`<ul>${l}</ul><p class="al-hint">撳一下跟拍・「新」＝圖鑑未睇過</p>`:`<p class="al-empty">暫時未有動物，照顧好棵樹佢哋就會嚟。</p>`}`}function T(){let e=[`weather-card`,`status-card`,`rail`,`sheet`,`dock`,`place-pill`,`gear`,`view-reset`,`animal-list-btn`,`animal-list`,`animal-toast`,`toast`,`note-slot`,`zoom-hint`],t=[];for(let n of e){let e=document.getElementById(n);if(!e||e.hidden||e.offsetParent===null||n===`toast`&&!e.classList.contains(`show`))continue;let r=e.getBoundingClientRect();r.width&&r.height&&t.push({l:r.left-4,t:r.top-4,r:r.right+4,b:r.bottom+4})}let n=document.querySelector(`#dev-root .dev-fab`);if(n){let e=n.getBoundingClientRect();e.width&&t.push({l:e.left-4,t:e.top-4,r:e.right+4,b:e.bottom+4})}return t}function E(r){r-d>400&&(d=r,u=T());let i=e.followingUid(),a=s?e.animalMarkers():[];a.sort((e,n)=>Number(t(n.id))-Number(t(e.id))||n.count-e.count||e.px-n.px);let o=[];for(let e of a){if(e.uid===i)continue;let t=1-rv(10,22,e.px);if(t<.04)continue;let n={l:e.x-16,t:e.y-42,r:e.x+16,b:e.y+4};if(e.y<4||e.x<4||e.x>window.innerWidth-4||e.y>window.innerHeight-4||u.some(e=>n.l<e.r&&n.r>e.l&&n.t<e.b&&n.b>e.t))continue;let r=o.find(t=>Math.hypot(t.m.x-e.x,t.m.y-e.y)<Q_);if(r){r.cluster++;continue}o.length>=Z_||o.push({m:e,alpha:t,cluster:0,icons:[]})}let f=new Set;for(let e of o){let r=e.m;f.add(r.uid);let i=c.get(r.uid);i||(i=document.createElement(`button`),i.type=`button`,i.className=`amk`,i.dataset.uid=String(r.uid),i.dataset.cat=r.category,c.set(r.uid,i),n.appendChild(i));let a=`<span class="amk-ic">${$_(r.category,r.kind)}</span>${r.count>1?`<b>${r.count}</b>`:``}${e.cluster?`<i>+${e.cluster}</i>`:``}${t(r.id)?`<em>新</em>`:``}`;i.dataset.html!==a&&(i.innerHTML=a,i.dataset.html=a,i.setAttribute(`aria-label`,`跟拍${r.name}`)),i.style.transform=`translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`,i.style.opacity=e.alpha.toFixed(2),i.style.pointerEvents=e.alpha>.35?`auto`:`none`}for(let[e,t]of c)f.has(e)||(t.remove(),c.delete(e));l=o.map(e=>({uid:e.m.uid,id:e.m.id,x:e.m.x,y:e.m.y,alpha:e.alpha,cluster:e.cluster}))}function D(n){let r=e.takeArrivals();if(r.length&&(m.length||(h=n),m.push(...r)),m.length&&n-h>1200)for(g.push(m),m=[];g.length>1;){let e=g.shift();g[0]=[...e,...g[0]]}if(_&&n>_.until&&(_=null,i.classList.remove(`show`),v=n+450,window.setTimeout(()=>{_||(i.hidden=!0)},260)),!_&&g.length&&n>v&&n>y&&s){let r=g.shift(),a=e.crewList(),o=r.filter(e=>a.some(t=>t.uid===e.uid));if(!o.length)return;_={list:o,until:n+4200},y=n+8e3;let s=o[0],c=o.some(e=>t(e.id));i.dataset.cat=s.category,i.innerHTML=`<span class="at-ic">${$_(s.category,s.id===`firefly`?`firefly`:a.find(e=>e.uid===s.uid)?.kind??`bird`)}</span>
        <span class="at-text">${c?`<em>新</em>`:``}${R(nv(o))}</span><small>撳一下跟拍</small>`,i.hidden=!1,requestAnimationFrame(()=>i.classList.add(`show`))}}return{update(e){E(e),D(e),e-f>800&&(f=e,w())},debug(){return{markers:l,toast:_?i.querySelector(`.at-text`)?.textContent??``:null,toastUids:_?_.list.map(e=>e.uid):[],listOpen:!o.hidden,list:[...o.querySelectorAll(`[data-uid]`)].map(e=>e.textContent?.replace(/\s+/g,` `).trim()??``)}},refresh(){f=0,w(),_&&!_.list.some(e=>t(e.id))&&i.querySelector(`.at-text em`)?.remove()},setEnabled(e){s=e,n.hidden=!e,a.hidden=!e,e||C()}}}var av={s3:2e3,s6:5e3,s12:1e4};function ov(e){let t=pt(e.species),n=e.targetCm??av[e.season??`s3`];if(e.targetCm!==t&&(e.targetCm=t,e.heightCm<t?e.passedTargetOn=null:e.passedTargetOn??=e.log?.[0]?.date??e.createdOn,n!==t&&e.started!==!1)){let r=ut(e.species);Lt(e,e.lastSeenDate??e.createdOn,`目標更新：${r.name}嘅目標由 ${at(n)} 改為 ${at(t)}（真實最高紀錄 ${r.maxM} 米，取最接近嘅 10 米）。高度照舊，冇上限。`,{kind:`badge`,title:`目標更新`,reward:{text:at(t),tone:`purple`},time:``})}}var sv=`sekai-tree-v2`,cv=`yiri-yisyu-weather`;function lv(){try{let e=localStorage.getItem(sv);if(!e)return null;let t=JSON.parse(e);return!t||t.version!==2||typeof t.heightCm!=`number`||!t.care||!t.pest?null:(t.dayEvents??={},t.residents??=[],(!t.species||ut(t.species).season!==t.season)&&(t.species=ft(t.season??`s3`)),t.log??=[],t.over?.kind===`complete`&&(t.completed={date:t.over.date,tiers:t.over.tiers,days:t.over.days,heightCm:t.heightCm,booked:t.over.booked},t.over=null),t.completed??=null,t.passedTargetOn??=null,ov(t),t)}catch{return null}}function uv(e){try{localStorage.setItem(sv,JSON.stringify(e))}catch{}}function dv(){localStorage.removeItem(sv)}function fv(){try{let e=localStorage.getItem(cv);if(!e)return null;let t=JSON.parse(e);return!t?.daily?.length||!t.current?null:t}catch{return null}}function pv(e){try{localStorage.setItem(cv,JSON.stringify(e))}catch{}}var mv=[`日`,`一`,`二`,`三`,`四`,`五`,`六`];function hv(e){return tt[e]}var gv=e=>i[e];function _v(e){return e<=0?`生效中`:e<1?`${Math.max(1,Math.round(e*60))} 分鐘後`:`約 ${Math.round(e)} 小時後`}function vv(e){let t=Math.max(0,Math.round(e));return`${Math.floor(t/60)} 小時 ${String(t%60).padStart(2,`0`)} 分`}function yv(e){return e.dying?e.dying.at+864e5-Date.now():0}function bv(e){let t=gv(e),n=[t.damage?`健康 −${t.damage}（抗風力可減免）`:`冇傷害`];return t.dW&&n.push(`水分 ${t.dW>0?`+`:``}${t.dW}`),t.dR&&n.push(`抗風力 ${t.dR}`),n.join(`・`)}function xv(n){let{state:r,cond:i}=n,a=document.getElementById(`weather-card`);a&&Sv(a,n);let o=document.getElementById(`place-pill`);o&&(o.innerHTML=`${hv(`pin`)}<span>${R(n.place)}</span>${n.placeNote?`<small>${R(n.placeNote)}</small>`:``}${hv(`chevronDown`)}`);let s=document.getElementById(`gear`);s&&!s.innerHTML&&(s.innerHTML=hv(`gear`));let c=document.getElementById(`drawer-close`);c&&!c.innerHTML&&(c.innerHTML=hv(`close`));let l=document.getElementById(`status-card`);if(l){let i=ye(r.season),a=Et(r.heightCm,pt(r.species)),o=qt(r,`drain`);l.innerHTML=`
      <button type="button" class="status-head" data-open="care"><b>樹木狀態</b>${hv(`chevronRight`)}</button>
      <p class="status-sub">${R(r.treeName)} · ${R(ut(r.species).name)}${R(a.name)} · ${sn(r,n.today)>i.days?`賽季完成・加時第 ${sn(r,n.today)-i.days} 日`:`第 ${sn(r,n.today)}/${i.days} 日`}</p>
      <div class="bars">
        ${Tv(`H`,`健康`,r.health,[50,100],`health`,r.dying?`瀕死`:``)}
        ${Tv(`W`,`水分`,r.moisture,e,`water`)}
        ${Tv(`N`,`養分`,r.nutrients,t,`food`)}
        ${Tv(`R`,`抗風`,r.resist,[60,100],`shield`)}
      </div>
      <div class="mini-acts">
        <button type="button" class="mini ${r.pest.active?`alert`:``}" data-action="deworm" ${r.care.dewormed?`disabled`:``}>${hv(`bug`)}<span>${r.care.dewormed?`除過喇`:r.pest.active?`有蟲！`:`除蟲`}</span></button>
        <button type="button" class="mini ${r.moisture>e[1]?`alert`:``}" data-action="drain" ${o.used>=o.max?`disabled`:``}>${hv(`drain`)}<span>${o.used>=o.max?`疏過喇`:`疏水`}</span></button>
      </div>`}let u=document.getElementById(`rail`);u&&(u.innerHTML=dy(r));let d=document.getElementById(`dock`);if(d){let e=i.raining,t=qt(r,`water`),a=qt(r,`fertilize`),o=n.countdown,s=!!(o&&gv(o.event).damage>0&&r.resist<60),c=r.animals.filter(e=>!r.seenAnimals.includes(e)).length;d.innerHTML=`
      ${Ev(`d-water`,`data-action="water"`,`drop`,`澆水`,e?`落緊雨`:`${t.used}/${t.max}`,t.used>=t.max||e)}
      ${Ev(`d-feed`,`data-action="fertilize"`,`sprout`,`施肥`,a.used>=a.max?`施過喇`:``,a.used>=a.max)}
      ${Ev(`d-guard`,`data-open="forecast"`,`shield`,`加固`,s?`惡劣天氣`:`R ${Math.round(r.resist)}`,!1,s?`!`:``)}
      ${Ev(`d-album`,`data-open="album"`,`book`,`圖鑑`,`${r.animals.length}/${_t.length}`,!1,c?String(c):``)}`}let f=document.getElementById(`note-slot`);if(f){let n=(r.dying&&!r.over?`<article class="glass note-card dying"><p><b>瀕死・${R(vv(Math.max(0,yv(r))/6e4))}</b>將水分調到 ${e[0]}–${e[1]}、養分 ${t[0]} 以上即刻救返。</p></article>`:``)+(r.started&&r.morningNote?`<article class="glass note-card"><p>${R(r.morningNote)}</p><button type="button" data-action="dismiss-note">知道喇</button></article>`:``);f.innerHTML!==n&&(f.innerHTML=n)}document.body.classList.toggle(`night`,n.night),document.body.classList.toggle(`thriving`,r.health>=80&&!r.over),document.body.classList.toggle(`dying`,!!r.dying&&!r.over),document.getElementById(`scene`)?.setAttribute(`aria-label`,`${r.treeName}，${I(i.code)}，高 ${at(r.heightCm)}`),document.title=`${r.treeName} · 世界之樹`}function Sv(e,t){let{state:n,cond:r,wx:i}=t,a=i.provider===`sim`&&!i.overridden,o=a&&i.loading,s=t.countdown,c=t.todayEvents.includes(`hot`);e.classList.toggle(`severe`,!!s&&!o),e.classList.toggle(`hot`,!s&&c),e.classList.toggle(`sim`,a&&!i.loading),a?(delete e.dataset.open,e.dataset.action=`retry-weather`,e.setAttribute(`aria-label`,`模擬天氣，撳一下再試攞真實天氣`)):(delete e.dataset.action,e.dataset.open=`forecast`,e.setAttribute(`aria-label`,`天氣同預報`));let l=t.manual?gv(t.todayEvent).label:s?.active?gv(s.event).label:i.conditionText||I(r.code),u;u=s?`<span class="warn-line">${hv(`warn`)}${R(gv(s.event).label)} · ${_v(s.hours)} · 抗風力 ${Math.round(n.resist)}</span>`:i.rainInHours!==null&&!r.raining&&!a&&!t.manual?i.rainInHours<=1?`一個鐘內可能落雨`:`大約 ${i.rainInHours} 個鐘後可能落雨`:`今日：${R(gv(t.todayEvent).label)} · 今晚結算 ${R(vv(t.minutesToSettle))}後`;let d=i.warnings.slice(0,4).map(e=>`<span class="wchip ${e.tone}" title="${R(e.name)}">${wv(e)}<span>${R(e.short)}</span></span>`).join(``),f=Cv(i),p=o?`--`:`${Math.round(r.tempC)}°C`;e.innerHTML=`
    <span class="wx-art">${nt(r.code,t.night,!!r.stormKind,r.stormKind||t.manual?void 0:i.nowIcon)}</span>
    <span class="wx-main"><b>${p}</b><span>${R(o?`攞緊天氣…`:l)}</span></span>
    <span class="wx-place">${hv(`pin`)}${R(t.place)}${i.station&&!a&&!t.manual?`<small>· ${R(i.station)}站</small>`:``}</span>
    ${d&&!t.manual?`<span class="wx-warns">${d}</span>`:``}
    ${u?`<span class="wx-line">${u}</span>`:``}
    <span class="wx-src ${a?`sim`:``}">${f}</span>`}function Cv(e){if(e.overridden)return`手動天氣（開發者）`;if(e.provider===`sim`)return e.loading?`攞緊真實天氣…`:`模擬天氣・撳一下重試${e.hkoUsed?`（天文台警告係真嘅）`:``}`;let t=e.provider===`hko`?`天文台`:e.hkoUsed?`Open-Meteo／天文台`:`Open-Meteo`;return e.origin===`cache`?`上次天氣 ${R(e.updated)}・${t}`:`即時天氣・${t}${e.updated?` · ${R(e.updated)}`:``}${e.loading?` · 更新緊`:``}`}function wv(e){return e.group===`WTCSGNL`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l8.5 16H1.5z" fill="currentColor"/><text x="10" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${R(e.code.replace(/^TC(\d+).*/,`$1`))}</text></svg>`:e.group===`WRAIN`?`<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="3" fill="currentColor"/><path d="M7 6l-1.5 3M11 6l-1.5 3M15 6l-1.5 3M8 11l-1.5 3M12 11l-1.5 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`:e.group===`WHOT`?`<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 4.5v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="2.3" fill="#fff"/></svg>`:e.group===`WFIRE`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5c1 3.5 5.5 5.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 1.5-4 2.5-5 .2 1.7 1 2.6 2 3-.5-3 .3-5.8 1-8z" fill="currentColor"/></svg>`:e.group===`WTS`?`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 1.5L4 11h5l-1.5 7.5L16 8h-5z" fill="currentColor"/></svg>`:`<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="currentColor"/><path d="M10 5.5v5.5M10 13.8v.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`}function Tv(e,t,n,r,i,a=``){let o=Math.round(Math.max(0,Math.min(100,n)));return`<div class="bar ${i} ${o>=r[0]&&o<=r[1]?`ok`:`off`}" title="${t} 最佳 ${r[0]}–${r[1]}">
    <span class="bar-key">${e}</span><span class="bar-label">${t}</span>
    <span class="bar-track"><span class="bar-band" style="left:${r[0]}%;width:${r[1]-r[0]}%"></span><span class="bar-fill" style="width:${o}%"></span></span>
    <b class="bar-val">${a?R(a):o}</b>
  </div>`}function Ev(e,t,n,r,i,a,o=``){return`<button type="button" class="dock-btn ${e} ${a?`done`:``}" ${t} ${a?`aria-disabled="true"`:``}>
    <span class="dock-ic">${hv(n)}</span><span class="dock-label">${r}</span>${i?`<small>${R(i)}</small>`:``}${o?`<em class="badge">${R(o)}</em>`:``}
  </button>`}var Dv={plant:{icon:`sprout`,tone:`green`,title:`種低幼苗`},water:{icon:`drop`,tone:`blue`,title:`已澆水`},fertilize:{icon:`leaf`,tone:`green`,title:`已施肥`},deworm:{icon:`bug`,tone:`orange`,title:`已除蟲`},drain:{icon:`drain`,tone:`blue`,title:`已疏水`},reinforce:{icon:`shield`,tone:`orange`,title:`已加固`},animal:{icon:`bird`,tone:`purple`,title:`新朋友來訪`},stage:{icon:`arrowUp`,tone:`blue`,title:`進入新階段`},settle:{icon:`calendar`,tone:`blue`,title:`夜間結算`},"storm-safe":{icon:`shield`,tone:`green`,title:`捱過惡劣天氣`},"storm-hit":{icon:`warn`,tone:`red`,title:`天氣受損`},pest:{icon:`bug`,tone:`red`,title:`蟲害`},dying:{icon:`heart`,tone:`red`,title:`瀕死`},badge:{icon:`sparkle`,tone:`purple`,title:`徽章`},event:{icon:`sparkle`,tone:`yellow`,title:`今日小事`},grow:{icon:`sprout`,tone:`blue`,title:`靜靜長高`}},Ov=``;function kv(e,t){let n=document.getElementById(`sheet-body`),r=document.getElementById(`sheet-title`);if(!n)return;let i=`${t}|${e.log.length}|${e.log[0]?.text??``}|${e.log[0]?.time??``}`;if(r){let n=e.log.filter(e=>e.date===t).length;r.innerHTML=`成長日誌${n?`<small>今日 ${n} 則</small>`:``}`}if(i===Ov)return;if(Ov=i,!e.log.length){n.innerHTML=`<p class="empty">仲未有紀錄。澆水、施肥或者等動物來訪，都會寫低喺度。</p>`;return}let a=``,o=[];for(let n of e.log){if(n.date!==a){a&&o.push(`</ol>`),a=n.date;let e=v(n.date,t),r=e===0?`今日`:e===1?`昨日`:`${b(n.date)}（${mv[y(n.date)]??``}）`;o.push(`<h4 class="log-day">${R(r)}</h4><ol class="log-list">`)}o.push(Av(n))}o.push(`</ol>`),n.innerHTML=o.join(``)}function Av(e){let t=e.kind?Dv[e.kind]:{icon:`calendar`,tone:`gray`,title:`紀錄`},n=e.title||t.title,r=e.time||`夜裡`,i=e.reward?`<span class="chip ${e.reward.tone}">${R(e.reward.text)}</span>`:``;return`<li class="log-row">
    <time>${R(r)}</time>
    <span class="log-ic ${t.tone}">${hv(t.icon)}</span>
    <span class="log-copy"><b>${R(n)}</b><span>${R(e.text)}</span></span>
    ${i}
  </li>`}function jv(e){let t=document.getElementById(`panel`);if(!t)return;let n=t.scrollTop;t.innerHTML=`${Mv(e.tab)}<div class="panel-body">${Nv(e)}</div>`,t.scrollTop=n,Xv()}function Mv(e){return`<nav class="tabs" role="tablist">${[[`care`,`照顧`],[`forecast`,`天氣·加固`],[`album`,`圖鑑`],[`milestones`,`賽季`]].map(([t,n])=>`<button type="button" role="tab" data-tab="${t}" class="${t===e?`on`:``}" aria-selected="${t===e}">${n}</button>`).join(``)}</nav>`}function Nv(e){if(!e.state.started)return`<div class="card quiet"><p>先揀賽季同替棵樹起個名。</p></div>`;switch(e.tab){case`forecast`:return Rv(e);case`album`:return Vv(e);case`milestones`:return Gv(e);default:return Pv(e)}}function Pv(n){let{state:r,cond:i}=n,a=cn(r),o=gv(n.todayEvent),s=n.todayEvents.filter(e=>e!==`clear`),c=qt(r,`water`),l=qt(r,`drain`),u=qt(r,`fertilize`),d=r.lastSettlement,f=_e(r.health);return`
    <article class="card event-card ${o.severe?`warn`:``}">
      <p class="eyebrow">今日天氣事件${n.manual?`（手動）`:``}</p>
      <h2>${R(o.label)}</h2>
      <p>${R(bv(n.todayEvent))}。${R(o.tip)}</p>
      ${s.length>1?`<p class="fine">同時有${s.map(e=>R(gv(e).label)).join(`、`)}：唔會疊加，只計最重嘅${R(o.label)}。</p>`:``}
      <p class="fine">今晚結算：${R(vv(n.minutesToSettle))}後</p>
    </article>
    <div class="meters">
      ${Lv(`健康 H`,r.health,`health`,[50,100])}
      ${Lv(`水分 W`,r.moisture,`water`,e)}
      ${Lv(`養分 N`,r.nutrients,`food`,t)}
      ${Lv(`抗風力 R`,r.resist,`shield`,[60,100])}
    </div>
    <p class="fine">最佳：水分 ${e[0]}–${e[1]}，養分 ${t[0]}–100。而家${R(f.label)}（×${f.mult}）${r.health>=80?`，有綠光`:``}。${r.pest.active?`<b class="bad">有蟲害：每晚 −15 健康。</b>`:``}</p>
    <p class="advice">${R(on(r,n.todayEvent,n.countdown))}</p>
    <div class="actions">
      ${Iv(`water`,`drop`,`blue`,`澆水`,i.raining?`落緊雨`:`+${p.water.amount} 水分 · ${c.used}/${c.max}`,c.used>=c.max||i.raining)}
      ${Iv(`fertilize`,`sprout`,`green`,`施肥`,`+${p.fertilize.amount} 養分 · ${u.used}/${u.max}`,u.used>=u.max)}
      ${Iv(`deworm`,`bug`,`orange`,`除蟲`,r.care.dewormed?`用過喇`:r.pest.active?`有蟲！`:`預防`,r.care.dewormed)}
      ${Iv(`drain`,`drain`,`purple`,`疏水`,`${p.drain.amount} 水分 · ${l.used}/${l.max}`,l.used>=l.max)}
    </div>
    ${d?Fv(d):``}
    <article class="card event">
      <p class="eyebrow">今日小事</p>
      <h2>${R(a.title)}</h2>
      <p>${R(a.text)}</p>
    </article>
    <p class="fine">碳吸收量：約 ${Se(r.heightCm)} 公斤 CO₂／年（0.35 × 高度^1.5）。用心照顧過 ${r.daysCared} 日。進度只係留喺呢部機。</p>
  `}function Fv(e){return`<article class="card settle">
      <p class="eyebrow">上次夜間結算 · ${R(b(e.date))}</p>
      <h2>${R(gv(e.event).label)}：健康 ${Math.round(e.hBefore)} → ${Math.round(e.hAfter)}</h2>
      <ul class="breakdown">
        <li><span>水分因素</span><b>${e.wFactor>0?`+`:``}${e.wFactor}</b><small>W ${Math.round(e.wBefore)}→${Math.round(e.wAfter)}</small></li>
        <li><span>養分因素</span><b>${e.nFactor>0?`+`:``}${e.nFactor}</b><small>N ${Math.round(e.nBefore)}→${Math.round(e.nAfter)}</small></li>
        <li><span>天氣損傷</span><b>−${e.finalDamage}</b><small>基礎 ${e.baseDamage} × (1 − ${Math.round(e.rBefore)}/100)</small></li>
        ${e.pestDamage?`<li><span>蟲害</span><b>−${e.pestDamage}</b><small></small></li>`:``}
        <li><span>生長</span><b>${e.deltaG>=0?`+`:``}${e.deltaG} 厘米</b><small>${e.baseGrowth} × ${e.hMult} × ${e.weatherBonus}</small></li>
      </ul>
      ${e.notes.length?`<p class="fine">${e.notes.map(R).join(`；`)}</p>`:``}
    </article>`}function Iv(e,t,n,r,i,a){return`<button type="button" class="act ${n} ${a?`done`:``}" data-action="${e}" ${a?`disabled`:``}>
    <span class="act-ic">${hv(t)}</span><span>${r}</span><small>${R(i)}</small>
  </button>`}function Lv(e,t,n,r){let i=Math.round(Math.max(0,Math.min(100,t)));return`<div class="meter ${i>=r[0]&&i<=r[1]?`ok`:`off`}">
    <div class="meter-top"><span>${e}</span><span>${i}</span></div>
    <div class="track"><div class="band" style="left:${r[0]}%;width:${r[1]-r[0]}%"></div><div class="fill ${n}" style="width:${i}%"></div></div>
  </div>`}function Rv(e){let{state:t}=e,n=e.countdown,r=n?`<article class="card warn countdown">
        <p class="eyebrow">${hv(`warn`)}12 小時惡劣天氣預警</p>
        <h2>${R(gv(n.event).label)} · ${R(_v(n.hours))}</h2>
        <p>${R(bv(n.event))}。${R(gv(n.event).tip)}</p>
        <p class="fine">來源：${R(n.source)}。以而家抗風力 ${Math.round(t.resist)} 計，傷害會係 ${Math.round(gv(n.event).damage*(1-t.resist/100))}。</p>
      </article>`:`<article class="card"><p class="eyebrow">12 小時預警</p><p>未來 12 小時未見惡劣天氣。</p></article>`,a=Object.keys(m).map(e=>`<button type="button" class="prep ${t.care.preps[e]?`on`:``}" data-prep="${e}" aria-pressed="${t.care.preps[e]}"><span>${m[e].label}</span><small>${t.care.preps[e]?`今日做過`:`+${m[e].amount} 抗風力`}</small></button>`).join(``),o=`<article class="card">
      <p class="eyebrow">加固・抗風力 R</p>
      <h2>${Math.round(t.resist)} / 100</h2>
      <div class="track fat"><div class="fill shield" style="width:${Math.round(t.resist)}%"></div></div>
      <p>最終天氣損傷 = 基礎傷害 × (1 − R/100)。狂風雷暴會消耗 30、初級颱風 40、高級颱風 80；每晚繩索鬆少少（−2）。每樣加固每日做一次。</p>
      <div class="preps">${a}</div>
    </article>`,s=e.forecast.map(t=>{let n=t.date===e.today?e.todayEvent:Je(t),r=gv(n),i=n===`clear`?``:`<span class="tag ${r.damage>=30?`typhoon`:r.severe?`rain`:`wind`}">${R(r.label)}</span>`,a=t.date===e.today?` today`:``;return`<article class="day ${r.damage>=30?`danger`:r.severe?`warn`:``}${a}">
        <span class="day-art">${nt(t.code,!1,r.damage>=30,t.hkoIcon)}</span>
        <div><strong>${t.date===e.today?`今日`:`星期${mv[y(t.date)]??``}`}</strong><span>${R(b(t.date))}</span></div>
        <div><b>${R(ke(t))}</b><span>${Math.round(t.tempMin)}–${Math.round(t.tempMax)}° · 雨 ${Math.round(t.precipMm)} 毫米 · 陣風 ${Math.round(t.gustKmh)}</span></div>
        <div class="tags">${i}</div>
        ${e.wx.hkoDays[t.date]?`<p class="hko-day">天文台：${R(e.wx.hkoDays[t.date])}</p>`:``}
      </article>`}).join(``),c=e.wx,l=c.hkoUsed?`<article class="card hko">
        <p class="eyebrow">香港天文台</p>
        ${c.warnings.length?`<ul class="hko-warns">${c.warnings.map(e=>{let t=Ke([e])[0];return`<li class="${e.tone}">${wv(e)}<span><b>${R(e.name)}</b>${t?`<small>遊戲當：${R(gv(t).label)}</small>`:``}</span></li>`}).join(``)}</ul>`:`<p>而家冇天氣警告生效。</p>`}
        ${c.messages.length?`<p class="fine">${c.messages.map(R).join(`<br>`)}</p>`:``}
        ${c.situation?`<p class="fine">${R(c.situation)}</p>`:``}
      </article>`:``,u=Object.values(i).map(e=>`<tr><td>${R(e.label)}</td><td>${e.damage?`−${e.damage}`:`0`}</td><td>${R([e.dW?`W ${e.dW>0?`+`:``}${e.dW}`:``,e.dR?`R ${e.dR}`:``].filter(Boolean).join(` `)||`—`)}</td></tr>`).join(``);return`
    ${r}
    ${o}
    ${l}
    <p class="status">${R(e.statusLine)}${c.provider===`sim`&&!c.overridden?` <button type="button" class="linkish" data-action="retry-weather">再試</button>`:``}</p>
    <div class="days">${s}</div>
    <h3 class="sub">天氣事件表</h3>
    <table class="evtable"><thead><tr><th>事件</th><th>健康</th><th>副作用</th></tr></thead><tbody>${u}</tbody></table>
    <p class="fine">香港：酷熱天氣警告 → 酷熱；黃／紅雨 → 暴雨；黑雨 → 黑雨；雷暴警告或強烈季候風 → 狂風雷暴；一號／三號風球 → 初級颱風；八號或以上 → 高級颱風。其他地方按 Open-Meteo 天氣碼、陣風同雨量判斷。同一日幾個警告唔會疊加，只計基礎傷害最高嗰個。</p>
    <button type="button" class="texty" data-action="locate">用我所在位置更新天氣</button>
  `}var zv=`animals`;function Bv(e){zv=e}function Vv(e){return`<div class="seg album-seg"><button type="button" class="${zv===`animals`?`on`:``}" data-album-mode="animals">動物 ${e.state.animals.length}/${_t.length}</button><button type="button" class="${zv===`species`?`on`:``}" data-album-mode="species">樹種 ${lt.length}</button></div>`+(zv===`species`?Uv(e):Hv(e))}function Hv(e){let t=e.state.animals.length,n=bt.map(t=>{let n=_t.filter(e=>e.category===t),r=n.filter(t=>e.state.animals.includes(t.id)).length,i=n.map(n=>{let r=e.state.animals.includes(n.id),i=r&&!e.state.seenAnimals.includes(n.id),a=e.state.residents.includes(n.id);return`<button type="button" class="creature ${r?``:`locked`}" data-seen="${n.id}">
      <span class="thumb" data-animal="${n.id}" data-locked="${r?`0`:`1`}"></span>
      <strong>${r?R(n.name):`？？？`}${i?`<em>新</em>`:``}${a?`<em class="res">長駐</em>`:``}</strong>
      <span class="chip cat-${t}">${R(yt[t])}${n.group[1]>1?`・成群 ${n.group[0]}–${n.group[1]}`:``}</span>
      <span>${R(r?n.epithet:Ct(n))}</span>
      <small>${r?R(n.about):`解鎖：${R(Ct(n))}`}</small>
    </button>`}).join(``);return`<h3 class="sub">${R(yt[t])} <small>${r}/${n.length}</small></h3><div class="album">${i}</div>`}).join(``),r=e.state.residents.length;return`<p class="status">圖鑑 ${t} / ${_t.length} · 長駐 ${r}</p>
    <p class="advice">見過嘅動物會輪流返嚟探棵樹（雀鳥成群飛過、猴子成群落地）。健康度連續 3 晚 90 以上，已見過嘅動物會長駐：每隻每晚 +2 養分（最多 +6）；兩隻或以上仲會幫手防蟲。健康跌穿 70 佢哋會搬走。</p>
    ${n}`}function Uv(e){return`<p class="status">九個樹種，每個賽季三款。每個樹種嘅目標＝佢嘅真實最高紀錄，四捨五入到最接近嘅 10 米。</p>${lt.map(t=>{let n=ye(t.season),r=t.id===e.state.species,i=t.stages.map((e,t)=>`<li><b>${st[t]}</b>${R(e)}</li>`).join(``);return`<article class="card species-card ${r?`mine`:``}">
      <div class="species-head">
        <span class="sthumb" data-species-thumb="${t.id}:3" data-cm="${ht(3,t.targetM*100)}"></span>
        <div><p class="eyebrow">${R(n.label)}・目標 ${t.targetM} 米${r?`・你棵樹`:``}</p>
        <h2>${R(t.name)}</h2>
        <p class="sci">${R(t.english)} · <i>${R(t.scientific)}</i></p>
        <p class="fine">一般 ${R(t.typicalM)} 米・最高紀錄 ${t.maxM} 米（目標取最接近嘅 10 米）</p></div>
      </div>
      <p>${R(t.blurb)}</p>
      <p class="fine">${R(t.record)}。資料：<a href="${R(t.source.url)}" target="_blank" rel="noopener">${R(t.source.label)}</a></p>
      <ol class="stage-list">${i}</ol>
      ${Wv(t.id)}
    </article>`}).join(``)}`}function Wv(e){let t=i_(e),n=t.adds.map((e,t)=>e.length?`<li><b>${st[t]}</b>${e.map(e=>R(t_[e])).join(`、`)}</li>`:``).filter(Boolean).join(``);return`<div class="habitat"><p class="eyebrow">原生地・${R(t.name)}</p><p class="fine">${R(t.blurb)}</p><ol class="stage-list">${n}</ol></div>`}function Gv(e){let{state:t,meta:n}=e,r=ye(t.season),i=sn(t,e.today),a=Math.min(r.days,i),o=i>r.days?i-r.days:0,s=pt(t.species),c=Math.min(100,t.heightCm/s*100),l=t.heightCm>=s,u=t.heightCm/100,f=At.find(e=>u<e.meters),p=[1,2,3].map(e=>{let t=n.badges[String(e)];return`<li class="${t?`done`:``}"><strong>${R(d[e].name)}${t>1?` ×${t}`:``}</strong><span>${t?`已擁有`:`完成 ${[0,3,6,12][e]} 個月賽季解鎖`}</span><p>${R(d[e].perk)}</p></li>`}).join(``),m=At.map(e=>`<li class="${u>=e.meters?`done`:``}"><strong>${R(e.title)}</strong><span>${e.meters>=1?`${e.meters} 米`:`${Math.round(e.meters*100)} 厘米`}</span><p>${R(e.detail)}</p></li>`).join(``);return`
    <article class="card">
      <p class="eyebrow">${R(r.label)}</p>
      <h2>${o?`賽季完成・加時第 ${o} 日`:`第 ${a} / ${r.days} 日`} · ${R(at(t.heightCm))}</h2>
      <p>${l?`已突破目標（${s/100} 米，達成 ${Math.round(t.heightCm/s*100)}%）。目標只係里程碑，冇高度上限。`:`目標 ${s/100} 米＝${R(ut(t.species).name)}真實紀錄 ${ut(t.species).maxM} 米取整（只係目標，唔係上限）。`}每日基本生長 ${(s/r.days).toFixed(1)} 厘米 × 健康係數 × 天氣加成${o?`，賽季完咗都照樣計`:``}。</p>
      <div class="track fat"><div class="fill food" style="width:${c.toFixed(1)}%"></div></div>
      <p class="fine">碳吸收量約 ${Se(t.heightCm)} 公斤 CO₂／年。將軍樹 ${Ot} 米（而家 ${R(ot(u,Ot))}%），海波龍 ${kt} 米。${f?`下一個里程：${R(f.title)}（${f.meters} 米）。`:``}</p>
    </article>
    <h3 class="sub">徽章</h3>
    <ol class="miles">${p}</ol>
    <p class="fine">中途枯死都唔蝕：捱過 3 個月會發一級、6 個月發二級徽章。免死金牌 ${n.reviveTokens} 面${n.starry?`・已解鎖星空浮島`:``}。${n.landmark?`養分地標：${R(n.landmark.name)}（${R(at(n.landmark.heightCm))}）。`:``}</p>
    <h3 class="sub">里程</h3>
    <ol class="miles">${m}</ol>
    <button type="button" class="texty" data-action="rename">改棵樹的名</button>
  `}var Kv=null,qv=null;function Jv(e,t){Kv=e,qv=t??null}var Yv=0;function Xv(){let e=++Yv,t=[];document.querySelectorAll(`.sthumb[data-species-thumb]`).forEach(e=>{e.firstChild||t.push(()=>{let[t,n]=(e.dataset.speciesThumb??``).split(`:`),r=qv?.(t,Number(n),Number(e.dataset.cm));r?e.innerHTML=`<img src="${r}" alt="" width="120" height="120" />`:e.textContent=`🌳`})}),document.querySelectorAll(`.thumb[data-animal]`).forEach(e=>{e.firstChild||t.push(()=>{let t=e.dataset.animal;if(!t)return;let n=e.dataset.locked!==`1`,r=Kv?.(t,n);if(r){e.innerHTML=`<img src="${r}" alt="" width="96" height="96" />`;return}let i=document.createElement(`canvas`);i.width=120,i.height=84,e.replaceChildren(i);let a=i.getContext(`2d`);a&&gn(a,t,60,48,1200,{scale:1.35,silhouette:!n,night:t===`owl`||t===`firefly`})})});let n=()=>{if(e!==Yv)return;let r=performance.now();for(;t.length&&performance.now()-r<12;)t.shift()();t.length&&window.setTimeout(n,16)};n()}var Zv=0;function Qv(e){let t=document.getElementById(`toast`);t&&(t.textContent=e,t.classList.add(`show`),window.clearTimeout(Zv),Zv=window.setTimeout(()=>t.classList.remove(`show`),3600))}function $v(e){let t=document.getElementById(`modal`);if(!t)return;t.innerHTML=`<div class="modal-card glass" role="dialog" aria-modal="true">${e}</div>`,t.hidden=!1,Xv();let n=t.querySelector(`input`);n instanceof HTMLInputElement?(n.focus(),n.select()):t.querySelector(`button`)?.focus()}function ey(e){let t=document.querySelector(`#modal .modal-card`);if(!t)return $v(e);t.innerHTML=e,Xv()}function ty(){let e=document.getElementById(`modal`);e&&(e.hidden=!0,e.innerHTML=``)}function ny(e,t,n,r){if(n)return`
      <p class="eyebrow">世界之樹</p>
      <h2>改個名</h2>
      <label>樹的名字<input id="tree-name" maxlength="12" value="${R(e)}" autocomplete="off" /></label>
      <button type="button" class="primary" data-action="save-name">保存</button>
      <button type="button" class="texty" data-action="close-modal">取消</button>`;let i=r??{season:`s3`,species:dt(`s3`)[0].id},a=t.pendingLegacy&&t.landmark?`<p class="legacy">${R(t.landmark.name)}留低嘅養分地標會令新樹開局養分 +40。</p>`:``,o=l.map(e=>`<button type="button" class="season ${e.id===i.season?`on`:``}" data-pick-season="${e.id}" aria-pressed="${e.id===i.season}"><b>${R(e.label)}</b><span>目標 ${dt(e.id).map(e=>e.targetM).sort((e,t)=>e-t).filter((e,t,n)=>n.indexOf(e)===t).join(`／`)} 米</span><small>${e.days} 日</small></button>`).join(``),s=l.find(e=>e.id===i.season),c=dt(i.season).map(e=>`<button type="button" class="species ${e.id===i.species?`on`:``}" data-species="${e.id}" aria-pressed="${e.id===i.species}">
        <span class="sthumb" data-species-thumb="${e.id}:3" data-cm="${ht(3,e.targetM*100)}"></span>
        <b>${R(e.name)}</b><i>${R(e.scientific.split(`（`)[0])}</i>
        <small>紀錄 ${e.maxM} 米・目標 ${e.targetM} 米</small>
      </button>`).join(``),u=ut(i.species);return`
    <p class="eyebrow">世界之樹・新一局</p>
    <h2>揀賽季，揀樹種</h2>
    <p>每日生存壓力一樣，分別只係時間長短、目標高度同徽章。天氣跟住現實；水分、養分保持喺最佳範圍，惡劣天氣前加固。</p>
    ${a}
    <div class="seasons pick">${o}</div>
    <p class="fine">${R(s.sub)}・${R(u.name)}目標 ${u.targetM} 米・每日約 ${(u.targetM*100/s.days).toFixed(0)} 厘米</p>
    <div class="species-pick">${c}</div>
    <p class="species-blurb"><b>${R(u.name)}</b>：${R(u.blurb)}</p>
    <label>樹的名字<input id="tree-name" maxlength="12" value="${R(e)}" autocomplete="off" /></label>
    <button type="button" class="primary" data-action="start-game">種${R(u.name)}・開始${R(s.label)}</button>`}function ry(e,t,n){let r=e.over,i=ye(e.season),a=r.kind===`dead`?`${R(e.treeName)}枯死咗`:`${R(i.label)}完成！`,o=n.length?`<ul class="badges">${n.map(e=>`<li>${R(e)}</li>`).join(``)}</ul>`:`<p>今次未夠 3 個月，未有徽章。</p>`;return`
    <p class="eyebrow">${r.kind===`dead`?`結算`:`賽季結算`}</p>
    <h2>${a}</h2>
    <p>捱咗 ${r.days} 日，高 ${R(at(e.heightCm))}，碳吸收量約 ${Se(e.heightCm)} 公斤／年。</p>
    ${o}
    <p class="fine">徽章總數：一級 ${t.badges[1]}・二級 ${t.badges[2]}・三級 ${t.badges[3]}</p>
    <button type="button" class="primary" data-action="new-game">開始新一局</button>`}function iy(e,t,n){let r=e.completed,i=ye(e.season),a=n.length?`<ul class="badges">${n.map(e=>`<li>${R(e)}</li>`).join(``)}</ul>`:``,o=pt(e.species),s=e.heightCm>o?`已經突破 ${R(at(o))} 嘅目標！`:`目標係 ${R(at(o))}。`;return`
    <p class="eyebrow">賽季結算</p>
    <h2>${R(i.label)}完成！</h2>
    <p>捱咗 ${r.days} 日，高 ${R(at(e.heightCm))}，碳吸收量約 ${Se(e.heightCm)} 公斤／年。${s}</p>
    ${a}
    <p>目標只係一個里程碑，冇高度上限：繼續照顧，${R(e.treeName)}會照同一條公式一直長高。</p>
    <p class="fine">徽章總數：一級 ${t.badges[1]}・二級 ${t.badges[2]}・三級 ${t.badges[3]}</p>
    <button type="button" class="primary" data-action="close-modal">繼續種落去</button>
    <button type="button" class="texty" data-action="new-game">開始新一局</button>`}function ay(e){return`
    <p class="eyebrow">夜間結算</p>
    <h2>昨晚發生咗啲事</h2>
    <p>${R(e)}</p>
    <button type="button" class="primary" data-action="close-modal">去望一望棵樹</button>
  `}var oy=[{id:`hk`,name:`香港`,lat:22.3022,lon:114.1744},{id:`central`,name:`中環`,lat:22.2819,lon:114.158},{id:`shatin`,name:`沙田`,lat:22.3817,lon:114.1877},{id:`taipo`,name:`大埔`,lat:22.45,lon:114.1686},{id:`saikung`,name:`西貢`,lat:22.3817,lon:114.2708},{id:`yuenlong`,name:`元朗`,lat:22.4445,lon:114.0222},{id:`tungchung`,name:`東涌`,lat:22.289,lon:113.941}];function sy(e){let t=oy.map(t=>`<button type="button" class="place ${e===t.id?`on`:``}" data-place="${t.id}">${hv(`pin`)}<span>${R(t.name)}</span></button>`).join(``);return`
    <p class="eyebrow">天氣地點</p>
    <h2>喺邊度種呢棵樹？</h2>
    <p>天氣會跟住呢個地方。揀「我所在位置」會問瀏覽器攞位置，只用嚟查天氣。</p>
    <button type="button" class="place wide ${e===`geo`?`on`:``}" data-place="geo">${hv(`locate`)}<span>用我所在位置</span></button>
    <div class="places">${t}</div>
    <button type="button" class="texty" data-action="close-modal">取消</button>
  `}function cy(e,t,n){return`
    <p class="eyebrow">設定</p>
    <h2>${R(e)}</h2>
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
  `}function ly(e){return vt(e)?.name??e}function uy(e){let t=10**Math.floor(Math.log10(Math.max(1,e)));for(let n of[1,1.2,1.5,2,2.5,3,4,5,6,8,10])if(n*t>=e)return n*t;return 10*t}function dy(e){let t=pt(e.species),n=Tt(t),r=Et(e.heightCm,t),i=n[r.index+1];if(i){let n=Dt(e.heightCm,t);return`
      <span class="rail-top ${n>.9?`dim`:``}"><small>下一階段</small><b>${R(at(r.nextCm))}</b><small>${R(i.name)}</small></span>
      <span class="rail-track"><span class="rail-fill" style="height:${(n*100).toFixed(1)}%"></span><span class="rail-marker" style="bottom:${(n*100).toFixed(1)}%"><b>${R(at(e.heightCm))}</b><small>當前</small></span></span>
      <span class="rail-bottom ${n<.14?`dim`:``}"><b>${R(at(r.minCm))}</b><small>${R(r.name)}</small></span>`}let a=e.heightCm>=t,o=a?uy(e.heightCm*1.15):t,s=Math.max(1,o-r.minCm),c=Math.max(0,Math.min(1,(e.heightCm-r.minCm)/s)),l=Math.max(0,Math.min(1,(t-r.minCm)/s)),u=a?`<span class="rail-target" style="bottom:${(l*100).toFixed(1)}%"><small>目標</small></span>`:``;return`
      <span class="rail-top ${!a&&c>.9?`dim`:``} ${a?`beyond`:``}"><small>${a?`已突破目標`:`目標`}</small><b>${R(at(o))}</b><small>${a?`冇上限`:`可以繼續長`}</small></span>
      <span class="rail-track ${a?`beyond`:``}"><span class="rail-fill" style="height:${(c*100).toFixed(1)}%"></span>${u}<span class="rail-marker" style="bottom:${(c*100).toFixed(1)}%"><b>${R(at(e.heightCm))}</b><small>${a?`已突破目標`:`當前`}</small></span></span>
      <span class="rail-bottom ${c<.14?`dim`:``}"><b>${R(at(r.minCm))}</b><small>${R(r.name)}</small></span>`}var fy=`yiri-yisyu-place-names`;function py(e){if(!e||typeof e!=`object`)return null;let t=e,n=(t.localityInfo?.administrative??[]).filter(e=>e.name).sort((e,t)=>(t.order??0)-(e.order??0));if(t.countryCode===`HK`){let e=n.find(e=>(e.adminLevel??0)>=6)?.name;return{name:e??`香港`,district:e}}let r=n.find(e=>(e.adminLevel??0)>=6&&(e.adminLevel??0)<=8)?.name,i=t.city||t.locality||r||t.principalSubdivision;return i?{name:i}:null}function my(e,t){return`${e.toFixed(2)},${t.toFixed(2)}`}function hy(){try{return JSON.parse(localStorage.getItem(fy)??`{}`)}catch{return{}}}async function gy(e,t){let n=my(e,t),r=hy();if(r[n])return r[n];try{let i=`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${e.toFixed(4)}&longitude=${t.toFixed(4)}&localityLanguage=zh-Hant`,a=await fetch(i,{signal:ce(6e3)});if(!a.ok)return null;let o=py(await a.json());if(o){let e=Object.keys(r);e.length>20&&delete r[e[0]],r[n]=o,localStorage.setItem(fy,JSON.stringify(r))}return o}catch{return null}}var _y=`sekai-tree-dev`;function vy(){return{mode:`real`,events:[`clear`],forecast:null,time:`auto`,open:!1,preview:{},sway:null}}function yy(){try{let e=localStorage.getItem(_y);if(e)return{...vy(),...JSON.parse(e)}}catch{}return vy()}function by(e){try{localStorage.setItem(_y,JSON.stringify(e))}catch{}}var xy=`modulepreload`,Sy=function(e,t){return new URL(e,t).href},Cy={},wy=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Sy(t,n),t=s(t),t in Cy)return;Cy[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:xy,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Ty=`yiri-yisyu-place`,Ey=`yiri-yisyu-quality`,Dy=`Asia/Hong_Kong`;It(()=>{let e=x(Dy);return`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`});var Oy=dn(),Z=lv()??Bt(g(new Date,Dy)),ky=yy(),Ay=`care`,jy=localStorage.getItem(Ty)??``,Q=Wy(),My=Q.provider===`sim`,Ny=Q.origin===`live`?`天氣啱啱更新過`:`攞緊真實天氣…`,Py=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,Fy=``,Iy={season:`s3`,species:ft(`s3`)},Ly=localStorage.getItem(Ey)===`high`?`high`:`low`,Ry=document.getElementById(`scene`);if(!(Ry instanceof HTMLCanvasElement))throw Error(`找不到畫面`);var $=null,zy=null;try{$=new X_(Ry,Ly),Jv((e,t)=>$?.thumbnail(e,t)??null,(e,t,n)=>$?.speciesThumb(e,t,n)??null)}catch(e){$=null,console.warn(`WebGL 用唔到，改用簡化畫面`,e),zy=new jn(Ry),document.body.classList.add(`flat`)}var By=document.getElementById(`drawer`),Vy=document.getElementById(`drawer-backdrop`),Hy=document.getElementById(`sheet`),Uy=document.getElementById(`sheet-handle`);function Wy(){let e=fv(),t=jy&&jy!==`geo`?jy:`auto`;if(e&&e.provider!==`sim`&&(e.choice??`auto`)===t){let t=Date.now()-e.fetchedAt;if(t<18e5)return{...e,origin:`live`};if(t<2592e5)return{...e,origin:`cache`}}return Fe(g(new Date,`Asia/Hong_Kong`),``)}function Gy(){return g(new Date,Dy)}function Ky(){let e=Gy();return Z.virtualToday&&v(e,Z.virtualToday)>0?Z.virtualToday:e}function qy(){let e=Gy();Z.virtualToday&&v(e,Z.virtualToday)<=0&&(Z.virtualToday=null)}var Jy=()=>ky.mode===`manual`;function Yy(){return Ie(Q.daily,Ky())}function Xy(e=Q){return!!e.hko&&_b(e)}function Zy(){if(Q.provider===`sim`&&!Q.hko)return[];let e=Q.daily.find(e=>e.date===Ky());return Xe({hk:_b(Q),warnings:Q.hko?.warnings,current:Q.current,today:e})}function Qy(e){return Jy()?ky.events.length?[...ky.events]:[`clear`]:Ut(Z,e,Q.daily.find(t=>t.date===e))}function $y(){return Qy(Ky())}function eb(){let e=Ky(),t=Yy().find(t=>t.date===e)??Ne(e);if(Jy())return $e(Me(Ne(e),28),ge($y()));let n=Q.origin!==`offline`,r=Me(t,n?Q.current.tempC:(t.tempMax+t.tempMin)/2);n&&(r.code=Q.current.code||r.code,r.windKmh=Q.current.windKmh,r.gustKmh=Q.current.gustKmh,r.tempC=Q.current.tempC,r.precipMm=Q.current.precipMm,r.raining=r.precipMm>=.2||Oe(r.code)||F(r.code),r.hot=!1,r.stormKind=null);let i=ge(Zy());return i===`clear`?r:$e(r,i)}function tb(){let e=x(Dy);return`${Gy()}T${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`}function nb(){let e=Ky();return Qe({nowEvents:Jy()?ky.events:Zy(),hourly:Jy()?[]:Q.hourly,nowIso:tb(),tomorrow:Jy()?void 0:Q.daily.find(t=>t.date===_(e,1)),minutesToMidnight:1440-x(Dy),manual:Jy()?ky.forecast:null,nowMs:Date.now(),activeSource:Jy()?`手動天氣`:Xy()?`天文台`:`即時天氣`})}function rb(){return jy&&jy!==`geo`?jy:`auto`}function ib(){let e=oy.find(e=>e.id===jy);return e?{place:e.name,note:``}:Q.provider===`sim`&&!Q.fetchedAt?{place:`香港`,note:``}:{place:Q.place||`你嘅位置`,note:Q.source===`fallback`?`預設`:``}}var ab={clear:.08,drizzle:.18,hot:.04,rainstorm:.55,blackrain:.65,typhoon1:.72,thunder:.85,typhoon8:1};function ob(e){if(ky.sway!==null)return ky.sway;let t=Jy()?$y():Zy(),n=Math.max(.06,...t.map(e=>ab[e]??.1)),r=Jy()?0:Math.min(1,((e.windKmh??0)+.5*(e.gustKmh??0))/120);return Math.min(1,Math.max(n,r))}function sb(){let e=eb(),t=Yy().find(e=>e.date===Ky())??Ne(Ky()),n=S(t.sunrise)??370,r=S(t.sunset)??1105,i=x(Dy),a=ky.time,o=Z.animals.filter(e=>!Z.residents.includes(e)).slice(-3),s=pt(Z.species),c=ky.preview,l=c.species??Z.species,u=c.species?pt(c.species):s,d=c.stage??mt(Z.heightCm,u),f=c.island,p=c.stage!==void 0||c.species?c.stage===void 0?Z.heightCm:ht(d,u):Z.heightCm;return{treeName:Z.treeName,species:l,stage:d,islandStage:f,targetCm:u,heightCm:p,unlocked:[...Z.animals],residents:[...Z.residents],sway:ob(e),health:Z.over?.kind===`dead`?0:Math.max(Z.health,Z.dying?0:8),moisture:Z.moisture,pests:Z.pest.active?70:0,scars:Z.scars,animals:[...Z.residents,...o],cond:e,daylight:Dn(i,n,r,a),minute:a===`day`?n+180:a===`night`?1380:i,sunriseMin:n,sunsetMin:r,eventId:Z.dailyEventId,reducedMotion:Py,reinforce:Zt(Z.resist),thriving:Z.health>=80&&!Z.over,landmark:!!Oy.landmark&&Z.legacyBonus>0,starry:Oy.starry}}function cb(e){let{place:t,note:n}=ib(),r=Xy();return{state:Z,meta:Oy,today:Ky(),tab:Ay,place:t,placeNote:n,statusLine:Ny,cond:e.cond,forecast:Yy(),night:e.daylight<.45,todayEvents:$y(),todayEvent:ge($y()),countdown:nb(),manual:Jy(),minutesToSettle:1440-x(Dy),wx:{provider:Q.provider??(Q.origin===`offline`?`sim`:`open-meteo`),origin:Q.origin,loading:My,fetchedAt:Q.fetchedAt,updated:gb(Q.fetchedAt),hkoUsed:r,warnings:r?Q.hko.warnings:[],messages:r?Q.hko.messages:[],situation:r?Q.hko.situation:``,hkoDays:r?Object.fromEntries(Q.hko.forecast.map(e=>[e.date,e.text])):{},conditionText:Jy()?void 0:Q.conditionText,nowIcon:!Jy()&&r&&Q.hko.current?.icon||void 0,station:Q.station,rainInHours:Q.rainInHours??null,error:Q.error,overridden:Jy()}}}function lb(){let e=sb(),t=cb(e);xv(t),kv(Z,Ky()),By&&!By.hidden&&jv(t),ub(e,performance.now()),Ab?.()}function ub(e,t){$?$.draw(e,t):zy?.draw(e,t)}function db(){uv(Z),fn(Oy)}function fb(){if(!Z.over&&Z.completed&&!Z.completed.booked){let e=mn(Oy,Z);return db(),Z.started&&$v(iy(Z,Oy,e)),!0}if(!Z.over)return!1;let e=pn(Oy,Z);return db(),Z.started&&$v(ry(Z,Oy,e)),!0}function pb(e){if(db(),lb(),fb())return;if(e.messages.length){let t=e.messages.join(` `);Z.started?$v(ay(t)):Fy=t}let t=e.animals.map(ly);t.length&&Qv(`${t.join(`、`)}嚟咗。`)}function mb(){qy(),pb(nn(Z,Ky(),Qy,Oy,Date.now()))}function hb(e){let t=Ky();if(Q=e,Dy=e.timezone||Dy,e.origin===`live`&&pv(e),Ny=e.origin===`live`?`天氣 ${gb(e.fetchedAt)} 更新`:e.origin===`cache`?`更新唔到（${e.error??`網絡問題`}），用緊 ${gb(e.fetchedAt)} 的記錄。`:`而家攞唔到真實天氣，暫時用模擬天氣。${e.error??``}`,qy(),e.provider!==`sim`||e.hko){let t=Zy(),n=Z.dayEvents[Ky()]?.events??[];Ht(Z,Ky(),t,Xy(e));let r=t.filter(e=>i[e].severe&&!n.includes(e));r.length&&Z.started&&!Jy()&&Qv(`${Xy(e)?`天文台`:`天氣`}：${r.map(e=>i[e].label).join(`、`)}生效，今晚結算前仲可以準備。`)}if(Z.started&&!Z.over){let e=en(Z,{date:Ky(),events:$y()});e.length&&Qv(`${e.map(ly).join(`、`)}嚟咗。`)}if(Ky()!==t){pb(nn(Z,Ky(),Qy,Oy,Date.now()));return}db(),lb()}function gb(e){if(!e)return``;let t=new Date(e),n=g(t,Dy)===Gy(),r=new Intl.DateTimeFormat(`en-GB`,{timeZone:Dy,hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(t);if(n)return r;let[,i,a]=g(t,Dy).split(`-`);return`${Number(i)}/${Number(a)} ${r}`}function _b(e){return e.source!==`geo`||P(e.lat,e.lon)}var vb=null,yb=0;function bb(e){window.clearTimeout(yb),yb=window.setTimeout(()=>{document.hidden||xb()},e)}function xb(e=!1){return vb||(My=!0,Ny=`攞緊真實天氣…`,lb(),vb=Sb(e).finally(()=>{vb=null,My=!1,lb(),bb(Q.origin===`live`?Ee:12e4)}),vb)}async function Sb(e){let t=oy.find(e=>e.id===jy),n=!e&&Q.source===`geo`&&Q.choice===`auto`&&Date.now()-Q.fetchedAt<18e5,r=t?{lat:t.lat,lon:t.lon,source:`manual`}:n?{lat:Q.lat,lon:Q.lon,source:`geo`}:await Ge(8e3),i=r.source!==`geo`||P(r.lat,r.lon),[a,o,s]=await Promise.allSettled([He(r.lat,r.lon),i?le(r.lat,r.lon):Promise.resolve(null),r.source===`geo`?gy(r.lat,r.lon):Promise.resolve(null)]),c=o.status===`fulfilled`?o.value:null,l=s.status===`fulfilled`?s.value:null,u=t?.name??l?.name??(r.source===`fallback`||De(r.lat,r.lon)?`香港`:`你嘅位置`),d=t?.name??l?.district,f=a.status===`fulfilled`?a.value:null,p=`open-meteo`,m=a.status===`rejected`?a.reason instanceof Error?a.reason.message:`未知錯誤`:void 0;if(!f&&c&&(f=Ue(c,Ky()),p=`hko`),!f){let e=fv();if(e&&e.provider!==`sim`&&Date.now()-e.fetchedAt<2592e5){hb({...e,origin:`cache`,error:m,hko:c??e.hko,daily:c&&i?Ae(e.daily,c,Ky()):e.daily});return}hb({...Fe(Ky(),m??``),hko:c,choice:rb()});return}let h={lat:r.lat,lon:r.lon,timezone:f.timezone,place:u,source:r.source,origin:`live`,fetchedAt:Date.now(),current:{...f.current},daily:f.daily,provider:p,hko:c,district:d,rainInHours:f.rainInHours,choice:rb(),error:p===`hko`?m:void 0};if(c?.current&&i){c.current.tempC!==null&&(h.current.tempC=c.current.tempC,h.station=c.current.station),c.current.icon&&(h.current.code=k(c.current.icon),h.conditionText=j(c.current.icon)),c.current.humidity!==null&&(h.current.humidity=c.current.humidity);let e=We(c,d);e===null?c.current.icon&&!M(c.current.icon)&&(h.current.precipMm=0):h.current.precipMm=Math.min(8,e)}c&&i&&(h.daily=Ae(h.daily,c,Ky())),hb(h)}function Cb(){$v(ny(`世界之樹`,Oy,!1,Iy))}function wb(e,t){let n=document.getElementById(`tree-name`),r=(n instanceof HTMLInputElement?n.value.trim().slice(0,12):``)||`世界之樹`,i=Z.started&&!Z.over;if(i?Z.treeName=r:(Z=hn(Oy,Gy(),e,r,t),Ay=`care`),db(),ty(),lb(),i||Qv(`${Z.treeName}種好喇。今日先澆水、施肥。`),Fy){let e=Fy;Fy=``,$v(ay(e))}}function Tb(e){By&&Vy&&(Ay=e,Db(!1),By.hidden=!1,Vy.hidden=!1,requestAnimationFrame(()=>{By.classList.add(`open`),Vy.classList.add(`open`)}),lb())}function Eb(){By&&Vy&&!By.hidden&&(By.classList.remove(`open`),Vy.classList.remove(`open`),window.setTimeout(()=>{By.classList.contains(`open`)||(By.hidden=!0,Vy.hidden=!0)},260))}function Db(e){Hy&&(Hy.dataset.state=e?`open`:`closed`,Hy.style.transform=``,Uy?.setAttribute(`aria-expanded`,String(e)),document.body.classList.toggle(`sheet-open`,e),e&&kv(Z,Ky()))}function Ob(){if(!Hy||!Uy)return;let e=null,t=!1,n=()=>Hy.offsetHeight-Uy.offsetHeight;Uy.addEventListener(`pointerdown`,r=>{e={y:r.clientY,t:performance.now(),open:Hy.dataset.state===`open`,closedOffset:n()},t=!1,Uy.setPointerCapture(r.pointerId),Hy.classList.add(`dragging`)}),Uy.addEventListener(`pointermove`,n=>{if(!e)return;let r=n.clientY-e.y;Math.abs(r)>6&&(t=!0);let i=e.open?0:e.closedOffset,a=Math.max(0,Math.min(e.closedOffset,i+r));Hy.style.transform=`translateY(${a}px)`});let r=n=>{if(!e)return;Hy.classList.remove(`dragging`);let r=n.clientY-e.y,i=r/Math.max(1,performance.now()-e.t),a=e.open;if(e=null,!t){Db(!a);return}Db(i<-.4||!a&&r<-60?!0:i>.4||a&&r>60?!1:a)};Uy.addEventListener(`pointerup`,r),Uy.addEventListener(`pointercancel`,r),Uy.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),Db(Hy.dataset.state!==`open`))});let i=document.getElementById(`sheet-body`),a=null;i?.addEventListener(`touchstart`,e=>{a=i.scrollTop<=0?e.touches[0]?.clientY??null:null},{passive:!0}),i?.addEventListener(`touchmove`,e=>{a!==null&&(e.touches[0]?.clientY??a)-a>70&&(a=null,Db(!1))},{passive:!0})}function kb(e,t){if(e===`water`||e===`fertilize`||e===`deworm`||e===`drain`){let n=Jt(Z,e,{raining:eb().raining});db(),lb(),Qv(n.message),n.ok&&t.classList.add(`pop`);return}switch(e){case`dismiss-note`:Z.morningNote=null,db(),lb();return;case`retry-weather`:Qv(`再試緊攞真實天氣…`),xb(!1);return;case`locate`:jy=`geo`,localStorage.setItem(Ty,jy),xb(!0);return;case`rename`:$v(ny(Z.treeName,Oy,!0));return;case`new-game`:Cb();return;case`reset-view`:$?.resetView();return;case`location`:$v(sy(jy||(Q.source===`geo`?`geo`:`hk`)));return;case`settings`:$v(cy(Z.treeName,Ly,!!$));return;case`close-drawer`:Eb();return;case`close-sheet`:Db(!1);return;case`save-name`:wb(Z.season);return;case`start-game`:wb(Iy.season,Iy.species);return;case`close-modal`:ty();return}}document.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target:null;if(!t||t.closest(`#dev-root`))return;let n=t.closest(`[data-open], [data-action], [data-tab], [data-prep], [data-seen], [data-place], [data-quality], [data-pick-season], [data-species], [data-album-mode]`);if(!n)return;let r=!!n.closest(`#modal`);if(Z.started&&!Z.over||r){if(n.dataset.pickSeason||n.dataset.species){let e=document.getElementById(`tree-name`),t=e instanceof HTMLInputElement?e.value:`世界之樹`;if(n.dataset.pickSeason){let e=n.dataset.pickSeason;Iy={season:e,species:dt(e)[0].id}}else Iy={...Iy,species:n.dataset.species};ey(ny(t,Oy,!1,Iy));return}if(n.dataset.albumMode){Bv(n.dataset.albumMode===`species`?`species`:`animals`),lb();return}if(n.dataset.open){Tb(n.dataset.open);return}if(n.dataset.tab){Ay=n.dataset.tab,lb();let e=document.getElementById(`panel`);e&&(e.scrollTop=0);return}if(n.dataset.prep&&n.dataset.prep in m){Qv(Xt(Z,n.dataset.prep).message),db(),lb();return}if(n.dataset.seen){let e=n.dataset.seen;Z.animals.includes(e)&&!Z.seenAnimals.includes(e)&&(Z.seenAnimals.push(e),db(),lb(),Fb?.refresh());return}if(n.dataset.place){jy=n.dataset.place,localStorage.setItem(Ty,jy),ty(),Qv(`天氣改為跟住${oy.find(e=>e.id===jy)?.name??`你所在位置`}。`),xb(jy===`geo`);return}if(n.dataset.quality===`low`||n.dataset.quality===`high`){Ly=n.dataset.quality,localStorage.setItem(Ey,Ly),$?.setQuality(Ly),$v(cy(Z.treeName,Ly,!!$));return}n.dataset.action&&kb(n.dataset.action,n)}}),document.getElementById(`modal`)?.addEventListener(`keydown`,e=>{e.key===`Enter`&&document.activeElement===document.getElementById(`tree-name`)&&Z.started&&!Z.over&&wb(Z.season)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&document.getElementById(`modal`)?.hidden&&(By&&!By.hidden?Eb():Hy?.dataset.state===`open`&&Db(!1))});var Ab=null;{let e={state:()=>Z,dev:()=>ky,setDev:e=>{ky=e,by(ky),lb()},events:a,liveEvents:Zy,todayEvents:$y,countdown:nb,advanceDay:()=>{Z.over||pb(an(Z,Ky(),Qy(Ky()),Oy,Date.now()))},setStat:(e,t)=>{Z[e]=Math.max(0,Math.min(100,t)),e===`health`&&t>0&&(Z.dying=null),Yt(Z),db(),lb()},triggerPest:()=>{tn(Z,Ky()),db(),lb(),Qv(`觸發咗蟲害。`)},reset:()=>{dv(),Z=Bt(Gy()),Fy=``,ty(),Eb(),Db(!1),db(),lb(),Cb()},realDate:()=>{Z.virtualToday=null,mb()},setPreview:e=>{ky={...ky,preview:e},by(ky),lb()},setSway:e=>{ky={...ky,sway:e},by(ky),lb()},triggerGlare:()=>$?.triggerGlare(),spawnAnimal:e=>$?.spawnAnimal(e),rotateAnimals:()=>$?.rotateAnimals(),unlockAll:()=>{for(let e of _t)Z.animals.includes(e.id)||Z.animals.push(e.id);db(),lb(),Qv(`解鎖咗全部 ${_t.length} 種動物。`)},ecoInfo:()=>($?.animalInfo()??[]).map(e=>({id:e.id,name:ly(e.id),count:e.count,resident:e.resident})),ecoCaps:()=>$?.animalCaps()??null,followAnimal:e=>$?.followAnimal(e),viewInfo:()=>$?{...$.cameraInfo(),...$.fenceInfo()}:null,habitatInfo:()=>{let e=sb(),t=e.islandStage??e.stage,n=i_(e.species),r=o_(e.species,t).map(e=>t_[e]);return`島嶼：${st[t]}島（半徑 ${a_(t)}）・${n.name}${r.length?`：${r.join(`、`)}`:`：淨係庭園`}`},sway:()=>ob(eb())};window.__tree={viewInfo:e.viewInfo,zoomBy:(e,t,n)=>$?.zoomBy(e,t,n),resetView:()=>$?.resetView(),viewState:()=>$?.viewState(),flyers:()=>$?.flyerHeights()??[],animalScreen:e=>$?.animalScreen(e)??null,fenceCheck:()=>$?.fenceCheck()??null,animalSizes:()=>$?.animalSizes()??null,walkers:()=>$?.walkerSpots()??[],lookAtRim:(e,t,n,r)=>$?.lookAtRim(e,t,n,r),spawn:e=>$?.spawnAnimal(e),follow:e=>$?.followAnimal(e),lineup:(e,t)=>$?.lineup(e,t)??null,markers:()=>$?.animalMarkers()??[],hud:()=>Fb?.debug()??null,crews:()=>$?.crewList()??[],followCrew:e=>$?.followCrew(e)??!1,followingUid:()=>$?.followingUid()??null,hints:()=>$?.hintStats()??null,orbitBy:(e,t)=>$?.orbitBy(e,t),followCam:()=>$?.followCamInfo()??null,propInfo:()=>$?.propInfo()??null,waterShare:()=>$?.waterShare()??null,seen:()=>[...Z.seenAnimals]},wy(()=>import(`./panel-B-KBQhsZ.js`).then(t=>{let n=document.getElementById(`dev-root`);n&&(Ab=t.mountDevPanel(n,e)),lb()}),[],import.meta.url)}var jb=0,Mb=``,Nb=localStorage.getItem(`sekai-tree-zoom-hint`)===`1`;function Pb(){if(!$)return;if(!Nb&&Z.started&&!Z.over&&document.getElementById(`modal`)?.hidden){Nb=!0,localStorage.setItem(`sekai-tree-zoom-hint`,`1`);let e=document.getElementById(`zoom-hint`);e&&(e.hidden=!1,window.setTimeout(()=>e.hidden=!0,9e3))}let e=$.viewState(),t=`${e.active}|${e.following??``}`;if(t===Mb)return;Mb=t;let n=document.getElementById(`view-reset`);n&&(n.hidden=!e.active,n.innerHTML=`${tt.locate}<span>${e.following?`跟緊${R(e.following)}・返回全景`:`返回全景`}</span>`),e.active&&document.getElementById(`zoom-hint`)?.setAttribute(`hidden`,``)}var Fb=null,Ib=null;function Lb(e){if(!$)return;Fb??=iv($,e=>Z.animals.includes(e)&&!Z.seenAnimals.includes(e)),Fb.setEnabled(Z.started&&!Z.over&&!!document.getElementById(`modal`)?.hidden);let t=$.followingUid();if(t!==Ib){Ib=t;let e=t===null?null:$.crewList().find(e=>e.uid===t);e&&Z.animals.includes(e.id)&&!Z.seenAnimals.includes(e.id)&&(Z.seenAnimals.push(e.id),db(),lb(),Fb.refresh())}Fb.update(e)}function Rb(e){let t=sb();ub(t,e),Pb(),Lb(e),e-jb>15e3&&(jb=e,xv(cb(t)),Z.dying&&!Z.over&&Date.now()-Z.dying.at>864e5&&lb()),document.hidden||requestAnimationFrame(Rb)}document.addEventListener(`visibilitychange`,()=>{if(document.hidden)return;requestAnimationFrame(Rb),mb();let e=Date.now()-Q.fetchedAt;!vb&&(Q.origin!==`live`||e>18e5)&&xb()});var zb=()=>{$?.resize(),zy?.resize()};window.addEventListener(`resize`,zb),zb(),Ob(),mb(),Z.started||Cb(),requestAnimationFrame(Rb),Q.origin===`live`&&!My?(hb(Q),bb(Math.max(5e3,Ee-(Date.now()-Q.fetchedAt)))):xb(!jy&&Q.source!==`geo`);export{st as a,lt as i,_t as n,R as o,yt as r,i as s,Fv as t};