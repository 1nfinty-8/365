/* ===== 365 · push.js · 推送：开启通知、同步给 Cloudflare、取回他不在时做的事 ===== */
(()=>{
Object.assign(DEFAULT,{pushUrl:'',pushToken:'',pushOn:false});
const url=p=>String(S.pushUrl||'').trim().replace(/\/+$/,'')+p;
const on=()=>S.pushOn&&S.pushUrl&&S.pushToken;
const home=()=>navigator.standalone||matchMedia('(display-mode: standalone)').matches;
const ub=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
const addD=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return isoDate(d)};
let last=null,sent=0;

async function api(p,body,keep){
  const r=await fetch(url(p),{method:body?'POST':'GET',keepalive:!!keep,
    headers:{Authorization:'Bearer '+String(S.pushToken).trim(),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.err||('连不上 '+r.status));return j}

/* ---------- 设置：放在「我的 → 他的消息」最下面 ---------- */
function mount(){if($('#puSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('他的消息'));if(!sec)return;
  sec.insertAdjacentHTML('beforeend',`<div id="puSet" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
    <p style="font-size:14px;letter-spacing:2px">推送通知</p>
    <label class="f"><span>Cloudflare Worker 的网址</span><input data-k="pushUrl" placeholder="https://365-push.xxx.workers.dev" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
    <label class="f"><span>口令（你设的 TOKEN）</span><input type="password" data-k="pushToken" autocomplete="off"></label>
    <div class="btns"><button class="pill" id="puOn">开启通知</button><button class="pill ghost" id="puRun">让他现在推一条</button><button class="pill ghost" id="puOff">关掉</button></div>
    <p class="hint" id="puSt"></p></div>`);
  $('#puOn').onclick=enable;
  $('#puRun').onclick=async()=>{if(!on())return toast('先开启通知');toast('正在让他写…');
    try{await sync();const j=await api('/run');toast(j.err?'没推出去：'+j.err:'推出去了，锁屏看看。回到 365 时消息会出现在聊天里')}catch(e){toast(e.message)}};
  $('#puOff').onclick=async()=>{if(!S.pushOn)return toast('现在就是关着的');if(!confirm('关掉推送？'))return;
    try{await api('/off')}catch(e){}
    try{const s=await(await navigator.serviceWorker.ready).pushManager.getSubscription();await s?.unsubscribe()}catch(e){}
    S.pushOn=false;saveSettings();status();toast('推送关掉了')};
  status()}
function status(t){const el=$('#puSt');if(!el)return;if(t){el.textContent=t;return}
  if(!home()){el.textContent='要从主屏幕上的 365 图标打开，才能开启通知';return}
  if(!on()){el.textContent='填好网址和口令，点「开启通知」';return}
  const j=last||{};
  el.textContent='已开启'+(j.last?` · 上次推送 ${fmtDate(j.last)}`:'')+(j.err?` · 上次失败（${fmtDate(j.err.t)}）：${j.err.msg}`:'')}

/* ---------- 开启 ---------- */
async function enable(){
  if(!home())return toast('要从主屏幕上的 365 图标打开，才能开启通知');
  if(!('PushManager' in window)||!('Notification' in window))return toast('这台手机不支持，iOS 要 16.4 以上');
  S.pushUrl=String($('[data-k="pushUrl"]').value||'').trim();S.pushToken=String($('[data-k="pushToken"]').value||'').trim();
  if(!S.pushUrl||!S.pushToken)return toast('先填好网址和口令');
  const p=await Notification.requestPermission();
  if(p!=='granted')return toast('没有允许通知，去「设置 → 通知 → 365」打开');
  status('正在开启…');
  try{
    const r=await fetch(url('/vapid'));const{key}=await r.json();if(!key)throw new Error('网址不对，打不开 /vapid');
    const reg=await navigator.serviceWorker.ready;
    const old=await reg.pushManager.getSubscription();if(old)await old.unsubscribe();
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ub(key)});
    S.pushOn=true;saveSettings();
    await sync(sub.toJSON());
    const t=await api('/test');if(t.err)throw new Error(t.err);
    toast('开好了，锁屏应该收到一条测试通知')}
  catch(e){toast('没开成：'+e.message)}
  finally{status()}}

/* ---------- 接下来会发生的：他到下一站、回家、寄礼物 ---------- */
function events(){const T0=isoDate(today()),L=[],G={};
  for(const t of DATA.trips||[]){
    (t.stops||[]).forEach((s,i)=>{const d=addD(t.start,s.from);if(i&&d>=T0)L.push({k:'tp'+s.id,d,body:`到${s.city}了`})});
    const e=addD(t.start,t.days);
    if(e>=T0){L.push({k:'tb'+t.id,d:e,body:'回家了'});G[e]=G[e]||`你刚从${(t.stops||[]).map(s=>s.city).join('、')}回来，给她带了东西`}}
  for(let i=0;i<40;i++){const d=addD(T0,i),p=parseDate(d);
    for(const a of DATA.anniv||[]){if(!a.date)continue;
      if(a.type==='yearly'){if(a.date.slice(5)===d.slice(5))G[d]=`今天是「${a.name}」`}
      else{const n=daysBetween(parseDate(a.date),p)+1;if(n>1&&(n%100===0||n%365===0))G[d]=`今天是「${a.name}」的第 ${n} 天`}}}
  const lastG=Math.max(0,...(DATA.gifts||[]).map(g=>g.t));
  if(S.giftDay&&S.giftDay>=T0&&!G[S.giftDay]&&Date.now()-lastG>7*864e5)G[S.giftDay]='没什么特别的理由，就是想送她';
  const had=new Set((DATA.gifts||[]).map(g=>g.date));
  for(const d in G)if(d>=T0&&!had.has(d))L.push({k:'gf'+d,d,body:'给你寄了一个礼物',type:'gift',why:G[d]});
  return L}

/* ---------- 同步：人设、最近的聊天、规则 ---------- */
function payload(){return {
  cfg:{provider:S.provider,apiKey:S.apiKey,model:S.model,baseUrl:S.baseUrl,name:S.hisName,awayHours:S.awayHours,awayMax:S.awayMax,
    quietFrom:S.quietFrom,quietTo:S.quietTo,tz:-new Date().getTimezoneOffset(),momAuto:S.momAuto,callIn:S.callIn,
    lastMom:Math.max(0,...DATA.moments.filter(p=>p.author==='him').map(p=>p.t||0))},
  system:chatSystem(),ev:events(),chat:DATA.chat.slice(-20).filter(m=>m.text).map(m=>({role:m.role,text:m.text}))}}
async function sync(sub){const j=await api('/sync',{...payload(),...(sub?{sub}:{})});last=j;sent=DATA.chat.length;status();return j}

/* ---------- 取回他在你不在时做的事 ---------- */
async function pull(){if(!on())return;
  try{const{pend}=await api('/pull');if(!pend?.length)return;let mo=false,gift=null;
    for(const x of pend){
      if(x.type==='moment'){DATA.moments.push({id:uid(),author:'him',text:x.text,images:[],t:x.t,liked:false,comments:[]});mo=true}
      else if(x.type==='call'){DATA.chat.push({role:'model',text:'未接来电',missed:'未接',t:x.t});
        localStorage.setItem('365-inmiss',JSON.stringify({t:x.t,k:'未接'}));localStorage.setItem('365-incall',isoDate(today()))}
      else if(x.type==='gift')gift=x.why;
      else DATA.chat.push({role:'model',text:x.text,t:x.t,pro:true})}
    DATA.chat.sort((a,b)=>a.t-b.t);await saveData('chat');
    if(mo){DATA.moments.sort((a,b)=>b.t-a.t);await saveData('moments')}
    refreshAll();
    if(gift&&!(DATA.gifts||[]).some(g=>g.date===isoDate(today())))window.makeGift?.(gift)}catch(e){}}
async function back(){navigator.clearAppBadge?.();if(!on())return;await pull();try{await sync()}catch(e){status()}}

/* 开了推送以后，回到 365 时就不再补发一遍 */
const skipAway=()=>{if(on())localStorage.setItem('365-last',JSON.stringify(Date.now()))};
window.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(on())api('/sync',{away:true},true).catch(()=>{})}
  else{skipAway();back()}},true);

mount();
HOOKS.ready.push(()=>{mount();skipAway();setTimeout(back,1500)});
HOOKS.page.push(n=>{if(n==='me'){mount();status()}});
setInterval(()=>{if(on()&&!document.hidden&&DATA.chat.length!==sent)sync().catch(()=>{})},120000);
})();
