/* ===== 365 · history.js · 翻以前的聊天（日历） ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const CLK='<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
let day=null,q='',ym=null;
const txt=m=>m.voice?'[语音] '+(m.voice.tx||''):(m.text||(m.images?.length?'[照片]':''));
const dOf=t=>isoDate(new Date(t));

document.head.insertAdjacentHTML('beforeend',`<style>
.chat-top{position:relative}
#hsBtn{position:absolute;right:12px;top:calc(var(--st) + 8px);width:34px;height:34px;color:var(--sub)}
.hs-q{display:block;width:100%;border:0;outline:none;padding:10px 16px;border-radius:99px;margin-bottom:14px}
.hs-cal{padding:14px 12px 16px}
.hs-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.hs-nav .iconbtn{width:34px;height:34px}
.hs-ym{font-family:var(--num);font-style:italic;font-weight:300;font-size:26px}
.hs-wk{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:11px;color:var(--sub);margin-bottom:6px;letter-spacing:1px}
.hs-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.hs-c{aspect-ratio:1;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.55);color:var(--ink)}
.hs-c b{font-family:var(--num);font-weight:400;font-size:16px;line-height:1.1}
.hs-c small{font-size:10px;line-height:1;min-height:10px;opacity:.75}
.hs-c.on{border-color:transparent}
.hs-c.dk{color:#fff}
.hs-c.today{box-shadow:0 0 0 1.5px var(--accent-t)}
.hs-c.fut{opacity:.35}
.hs-sum{text-align:center;font-size:12.5px;color:var(--sub);letter-spacing:1px;margin:14px 0 4px}
.hs-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin:4px 4px 10px}
.hs-hit{display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;font-size:14.5px;line-height:1.6;word-break:break-word}
.hs-hit small{display:block;font-size:11.5px;color:var(--sub);letter-spacing:1px}
.hs-t{font-size:10.5px;color:var(--sub);margin:1px 4px 0}
#hsBody .bubble{-webkit-user-select:text;user-select:text}
</style>`);

$('.chat-top').insertAdjacentHTML('beforeend',`<button class="iconbtn" id="hsBtn" data-go="hist" aria-label="以前的聊天">${CLK}</button>`);
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-hist"><div class="wrap">
  <div class="head"><button class="iconbtn glass" id="hsBack" aria-label="返回">${BACK}</button><h2>以前的聊天</h2><em>history</em></div>
  <input class="hs-q glass" id="hsQ" placeholder="搜索说过的话">
  <div id="hsBody"></div>
</div></section>`);

function counts(){const m={};DATA.chat.forEach(x=>{const d=dOf(x.t);m[d]=(m[d]||0)+1});return m}
function msg(x){const me=x.role==='user',t=txt(x),im=(x.images||[]).map(id=>IMG.tag(id,'class="cimg zoom"')).join('');
  return `<div class="row ${me?'me':'him'} gs"><div class="stack">${im}${t?`<div class="bubble">${esc(t)}</div>`:''}<span class="hs-t">${fmtTime(x.t)}</span></div></div>`}
function cal(){
  if(!ym){const d=today();ym=[d.getFullYear(),d.getMonth()]}
  const[y,m]=ym,C=counts(),t=isoDate(today()),first=new Date(y,m,1).getDay(),N=new Date(y,m+1,0).getDate();
  let mx=1,days=0,tot=0;
  for(let d=1;d<=N;d++){const n=C[`${y}-${pad(m+1)}-${pad(d)}`]||0;if(n){days++;tot+=n;mx=Math.max(mx,n)}}
  let h='';for(let i=0;i<first;i++)h+='<div></div>';
  for(let d=1;d<=N;d++){const iso=`${y}-${pad(m+1)}-${pad(d)}`,n=C[iso]||0,p=n?Math.round(25+n/mx*70):0;
    h+=`<button class="hs-c${n?' on':''}${p>60?' dk':''}${iso===t?' today':''}${iso>t?' fut':''}" data-d="${iso}"${n?` style="background:color-mix(in srgb,var(--accent-t) ${p}%,rgba(255,255,255,.5))"`:''}><b>${d}</b><small>${n||''}</small></button>`}
  return `<div class="hs-cal glass"><div class="hs-nav"><button class="iconbtn" data-nav="-1">${BACK}</button><button class="hs-ym" data-nav="0">${y}.${pad(m+1)}</button><button class="iconbtn" data-nav="1">${NEXT}</button></div>
    <div class="hs-wk">${[...'日一二三四五六'].map(x=>`<span>${x}</span>`).join('')}</div><div class="hs-grid">${h}</div></div>
    <div class="hs-sum">${days?`这个月聊了 ${days} 天 · 一共 ${tot} 条`:'这个月还没有聊天'}</div>`}
function render(){const b=$('#hsBody');
  if(q){const L=DATA.chat.filter(x=>txt(x).includes(q));
    b.innerHTML=L.length?`<div class="hs-h">找到 ${L.length} 条${L.length>200?' · 只显示最近 200 条':''}</div>`+L.slice(-200).reverse().map(x=>`<button class="hs-hit glass" data-d="${dOf(x.t)}"><small>${fmtDate(x.t)} · ${x.role==='user'?'我':esc(S.hisName)}</small>${esc(txt(x).slice(0,100))}</button>`).join(''):'<div class="empty">没找到</div>';return}
  if(day){const L=DATA.chat.filter(x=>dOf(x.t)===day);
    b.innerHTML=`<div class="hs-h">${day.replace(/-/g,'.')} · ${L.length} 条</div>`+L.map(msg).join('');IMG.hydrate(b);return}
  b.innerHTML=cal()}

$('#hsBody').onclick=e=>{
  const nv=e.target.closest('[data-nav]');
  if(nv){const k=+nv.dataset.nav;if(!k)ym=null;else{let[y,m]=ym;m+=k;if(m<0){m=11;y--}if(m>11){m=0;y++}ym=[y,m]}render();return}
  const b=e.target.closest('[data-d]');if(!b)return;
  const d=b.dataset.d;if(!DATA.chat.some(x=>dOf(x.t)===d))return toast('这天没有聊天');
  if(q){const p=parseDate(d);ym=[p.getFullYear(),p.getMonth()]}
  day=d;q='';$('#hsQ').value='';render();$('#page-hist').scrollTop=0};
$('#hsQ').addEventListener('input',e=>{q=e.target.value.trim();day=null;render()});
$('#hsBack').onclick=()=>{if(day||q){day=null;q='';$('#hsQ').value='';render();$('#page-hist').scrollTop=0}else go('chat')};
HOOKS.page.push(n=>{if(n==='hist'){day=null;q='';ym=null;$('#hsQ').value='';render();$('#page-hist').scrollTop=0}});
})();
