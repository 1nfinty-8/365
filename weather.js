/* ===== 365 · weather.js · 天气 + 位置 ===== */
(()=>{
const LS={get:(k,d)=>{try{const v=localStorage.getItem('365-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>localStorage.setItem('365-'+k,JSON.stringify(v))};
const WMO={0:'晴',1:'晴间多云',2:'多云',3:'阴',45:'雾',48:'雾',51:'毛毛雨',53:'毛毛雨',55:'毛毛雨',56:'冻雨',57:'冻雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'阵雨',82:'暴雨',85:'阵雪',86:'阵雪',95:'雷阵雨',96:'雷阵雨',99:'雷阵雨'};
const wd=c=>WMO[c]??'—';
const hm=t=>{const d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())};
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
let LOC=LS.get('loc',null),WX=LS.get('wx',null),busy=false,page='home',RES=[];

document.head.insertAdjacentHTML('beforeend',`<style>
#hmWx{display:block;margin:6px auto 0;font-size:13px;color:var(--sub);letter-spacing:2px}
#hmWx:empty{display:none}
#hmWx b{font-family:var(--num);font-style:italic;font-weight:300;font-size:16px;color:var(--ink);letter-spacing:0}
.wx-main{text-align:center;padding:24px 18px 20px;margin-bottom:14px}
.wx-city{font-size:18px;letter-spacing:4px}
.wx-t{font-family:var(--num);font-style:italic;font-weight:300;font-size:88px;line-height:1.05;letter-spacing:-3px}
.wx-d{font-size:15px;letter-spacing:3px}
.wx-s{font-size:12px;color:var(--sub);margin-top:8px;letter-spacing:1px;line-height:1.8}
.wx-tip{display:inline-block;margin-top:10px;font-size:12px;color:var(--accent-t);background:rgba(255,255,255,.55);padding:3px 12px;border-radius:99px;letter-spacing:1px}
.wx-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin:6px 4px 8px}
.wx-hours{display:flex;overflow-x:auto;gap:4px;padding:12px 8px;margin-bottom:14px;scrollbar-width:none}
.wx-hours::-webkit-scrollbar{display:none}
.wx-hr{flex:none;width:58px;text-align:center;display:flex;flex-direction:column;gap:2px;font-size:11px;color:var(--sub)}
.wx-hr b{font-family:var(--num);font-style:italic;font-weight:300;font-size:20px;color:var(--ink)}
.wx-hr i{font-style:normal;color:var(--accent-t)}
.wx-days{padding:4px 16px;margin-bottom:6px}
.wx-day{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid var(--line)}
.wx-day:first-child{border-top:0}
.wx-day .a{width:44px;letter-spacing:1px}
.wx-day .b{flex:1;color:var(--sub);font-size:13px;letter-spacing:1px}
.wx-day .p{font-size:12px;color:var(--accent-t);width:38px;text-align:right}
.wx-day .c{font-family:var(--num);font-style:italic;font-size:16px;min-width:72px;text-align:right}
.wx-r{display:block;width:100%;text-align:left;padding:11px 2px;border-top:.5px solid var(--sys-sep);font-size:16px;color:var(--sys-txt)}
.wx-r:first-child{border-top:0}
.wx-r small{margin-left:8px;font-size:12px;color:var(--sys-sub)}
</style>`);

$('#since').insertAdjacentHTML('afterend','<button id="hmWx" data-go="wx"></button>');
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-wx"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>天气</h2><em>weather</em>
  </div>
  <div class="wx-main glass" id="wxMain"></div>
  <div id="wxMore"></div>
  <div class="btns" style="justify-content:center;margin-top:14px"><button class="pill ghost" id="wxLoc">重新定位</button><button class="pill ghost" id="wxPick">手动选城市</button></div>
  <p class="hint" style="text-align:center" id="wxNote"></p>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="wxModal"><div class="mbox">
  <h3>选一个城市</h3>
  <div class="f"><div style="display:flex;gap:8px"><input class="ti" id="wxQ" placeholder="比如：杭州" style="flex:1"><button class="pill" id="wxGo">搜索</button></div></div>
  <div id="wxRes"></div>
  <div class="mbtns"><button class="pill ghost" id="wxAuto">改回自动定位</button><button class="pill ghost" data-close="wxModal">取消</button></div>
</div></div>`);

/* ---------- 定位 ---------- */
function getPos(){return new Promise((res,rej)=>{
  if(!navigator.geolocation)return rej(new Error('这台手机不支持定位，可以手动选城市'));
  navigator.geolocation.getCurrentPosition(
    p=>res({lat:+p.coords.latitude.toFixed(2),lon:+p.coords.longitude.toFixed(2)}),
    e=>rej(new Error(e.code===1?'没有定位权限，可以手动选城市':'定位失败，等会儿再试')),
    {enableHighAccuracy:false,timeout:12000,maximumAge:30*6e4})})}
async function cityName(lat,lon){
  try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);const j=await r.json();
    return (j.city||j.locality||j.principalSubdivision||'').replace(/市$/,'')||'这里'}catch(e){return '这里'}}
function setLoc(l){
  if(LOC&&LOC.name&&l.name&&LOC.name!==l.name)LS.set('move',{from:LOC.name,to:l.name,t:Date.now()});
  LOC={...l,t:Date.now()};LS.set('loc',LOC);return LOC}
async function locate(force){
  if(S.wxMode==='manual')return S.wxCity?setLoc(S.wxCity):null;
  if(!force&&LOC&&Date.now()-LOC.t<36e5)return LOC;
  const p=await getPos();
  const same=LOC&&Math.abs(LOC.lat-p.lat)<.05&&Math.abs(LOC.lon-p.lon)<.05;
  return setLoc({name:same?LOC.name:await cityName(p.lat,p.lon),...p})}

/* ---------- 天气 ---------- */
async function fetchWx(l){
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${l.lat}&longitude=${l.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&past_days=1&forecast_days=7`;
  const r=await fetch(u);if(!r.ok)throw new Error('天气没查到，等会儿再试');
  WX={d:await r.json(),t:Date.now(),name:l.name,lat:l.lat,lon:l.lon};LS.set('wx',WX)}
async function refresh(force){
  if(busy)return;busy=true;
  try{const l=await locate(force);
    if(l){const fresh=WX&&WX.lat===l.lat&&WX.lon===l.lon&&Date.now()-WX.t<30*6e4;
      if(force||!fresh)await fetchWx(l);else if(WX.name!==l.name){WX.name=l.name;LS.set('wx',WX)}}}
  catch(e){if(force||page==='wx')toast(e.message)}
  finally{busy=false;render()}}
function now(){if(!WX)return null;const d=WX.d,c=d.current||{},D=d.daily;if(!D)return null;
  let i=D.time.indexOf(isoDate(today()));if(i<0)i=Math.min(1,D.time.length-1);
  return {city:WX.name,temp:Math.round(c.temperature_2m),feel:Math.round(c.apparent_temperature),hum:c.relative_humidity_2m,wind:Math.round(c.wind_speed_10m),code:c.weather_code,
    max:Math.round(D.temperature_2m_max[i]),min:Math.round(D.temperature_2m_min[i]),rain:D.precipitation_probability_max[i]??0,
    yMax:i>0?Math.round(D.temperature_2m_max[i-1]):null,i}}
function hours(){const H=WX.d.hourly,n=new Date(),k=`${isoDate(n)}T${pad(n.getHours())}:00`;
  let s=H.time.findIndex(t=>t>=k);if(s<0)s=0;
  return H.time.slice(s,s+24).map((t,j)=>({h:+t.slice(11,13),temp:Math.round(H.temperature_2m[s+j]),code:H.weather_code[s+j],p:H.precipitation_probability[s+j]??0}))}

/* ---------- 显示 ---------- */
function renderHome(){const el=$('#hmWx');if(!el)return;const w=now();
  el.innerHTML=w?`${esc(w.city)} · <b>${w.temp}°</b> ${wd(w.code)}`:''}
function render(){
  renderHome();const w=now();
  const mode=S.wxMode==='manual'?'手动选的城市':'自动定位';
  $('#wxNote').textContent=WX?`${mode} · 更新于 ${hm(WX.t)}`:mode;
  if(!w){$('#wxMain').innerHTML=`<div class="wx-d">还没有天气</div><div class="wx-s">点下面的「重新定位」，在弹窗里选「允许」<br>不想定位的话，可以手动选城市</div>`;$('#wxMore').innerHTML='';return}
  const tips=[];
  if(w.rain>=50)tips.push(`今天降雨概率 ${w.rain}%，记得带伞`);
  if(w.yMax!=null&&w.yMax-w.max>=5)tips.push(`比昨天冷了 ${w.yMax-w.max}°，多穿点`);
  $('#wxMain').innerHTML=`<div class="wx-city">${esc(w.city)}</div><div class="wx-t">${w.temp}°</div><div class="wx-d">${wd(w.code)}</div>
    <div class="wx-s">今天 ${w.min}° – ${w.max}° · 体感 ${w.feel}°<br>湿度 ${w.hum}% · 风 ${w.wind} km/h</div>
    ${tips.map(t=>`<div class="wx-tip">${t}</div>`).join('<br>')}`;
  const D=WX.d.daily;
  const days=D.time.slice(w.i).map((iso,k)=>{const j=w.i+k,p=D.precipitation_probability_max[j]??0;
    return `<div class="wx-day"><span class="a">${k===0?'今天':k===1?'明天':'周'+'日一二三四五六'[parseDate(iso).getDay()]}</span><span class="b">${wd(D.weather_code[j])}</span><span class="p">${p>=30?p+'%':''}</span><span class="c">${Math.round(D.temperature_2m_min[j])}° – ${Math.round(D.temperature_2m_max[j])}°</span></div>`}).join('');
  $('#wxMore').innerHTML=`<div class="wx-h">接下来 24 小时</div>
    <div class="wx-hours glass">${hours().map((x,j)=>`<div class="wx-hr"><span>${j?x.h+' 时':'现在'}</span><b>${x.temp}°</b><span>${wd(x.code)}</span><i>${x.p>=30?x.p+'%':'&nbsp;'}</i></div>`).join('')}</div>
    <div class="wx-h">这几天</div><div class="wx-days glass">${days}</div>`}

/* ---------- 按钮 ---------- */
$('#wxLoc').onclick=()=>{toast('正在定位…');refresh(true)};
$('#wxPick').onclick=()=>{$('#wxQ').value='';$('#wxRes').innerHTML='';openModal('wxModal')};
async function search(){const q=$('#wxQ').value.trim();if(!q)return;
  $('#wxRes').innerHTML='<p class="hint">搜索中…</p>';
  try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh`);const j=await r.json();
    RES=j.results||[];
    $('#wxRes').innerHTML=RES.length?RES.map((c,i)=>`<button class="wx-r" data-r="${i}">${esc(c.name)}<small>${esc([c.admin1,c.country].filter(Boolean).join(' · '))}</small></button>`).join('')
      :'<p class="hint">没找到，可以试试拼音或英文，比如 Hangzhou</p>'}
  catch(e){$('#wxRes').innerHTML='<p class="hint">搜索失败，检查一下网络</p>'}}
$('#wxGo').onclick=search;
$('#wxQ').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();search()}});
$('#wxRes').onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;const c=RES[+b.dataset.r];
  S.wxMode='manual';S.wxCity={name:c.name,lat:+c.latitude.toFixed(2),lon:+c.longitude.toFixed(2)};saveSettings();
  closeModal('wxModal');refresh(true);toast(`换成${c.name}了`)};
$('#wxAuto').onclick=()=>{S.wxMode='auto';saveSettings();closeModal('wxModal');toast('正在定位…');refresh(true)};

/* ---------- 让陆择知道 ---------- */
HOOKS.context.push(()=>{const w=now();if(!w||Date.now()-WX.t>6*36e5)return '';
  let s=`【她那边的天气】她现在在${w.city}，${w.temp}°，${wd(w.code)}，今天 ${w.min}°～${w.max}°`;
  if(w.rain>=50)s+=`，降雨概率 ${w.rain}%`;
  if(w.yMax!=null&&w.yMax-w.max>=5)s+=`，比昨天降温了 ${w.yMax-w.max}°`;
  s+='。可以自然地关心她穿衣、带伞，不用每句都提。';
  const mv=LS.get('move',null);
  if(mv&&Date.now()-mv.t<2*864e5)s+=`\n【她的位置】她最近从${mv.from}到了${mv.to}。`;
  return s});

addMore({go:'wx',cn:'天气',ce:'weather'});
HOOKS.ready.push(()=>{render();refresh()});
HOOKS.page.push(n=>{page=n;if(n==='wx'){render();refresh()}if(n==='home')renderHome()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
setInterval(()=>{if(!document.hidden)refresh()},30*6e4);
})();
