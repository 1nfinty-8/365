/* ===== 365 · him.js · 关于他：他的手机、他的一天、他的备忘录 ===== */
(()=>{
if(!Array.isArray(DATA.hday))DATA.hday=[];
if(!Array.isArray(DATA.hnote))DATA.hnote=[];
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const T=()=>isoDate(today());
const WK=d=>'日一二三四五六'[d.getDay()];
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const mins=s=>{const[a,b]=String(s||'0:0').split(':').map(Number);return (a||0)*60+(b||0)};
const arr=v=>Array.isArray(v)?v:[];
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
const ink=s=>esc(s).replace(/~~(.+?)~~/g,'<s>$1</s>');
const md=s=>{const d=parseDate(s);return `${d.getMonth()+1}.${d.getDate()}`};
let dayBusy=false,noteBusy=false,di=null,ni=0,anim='',hv='top',hmon='';

document.head.insertAdjacentHTML('beforeend',`<style>
#moreGrid .card[data-go="phone"],#phGrid [data-app="memo"]{display:none!important}
#himGrid .hm-day{grid-column:1/-1;min-height:clamp(130px,19vh,190px)}
.hm-now{margin-top:10px;font-size:12.5px;color:var(--accent-t);letter-spacing:2px;font-family:var(--ti)}
.hd-hero{position:relative;padding:20px 20px 14px;margin-bottom:22px}
.hd-date{display:flex;align-items:baseline;gap:10px}
.hd-date b{font-family:var(--num);font-style:italic;font-weight:300;font-size:60px;line-height:1;letter-spacing:-2px}
.hd-date span{font-size:13px;color:var(--sub);letter-spacing:2px}
.hd-mood{position:absolute;top:22px;right:20px;font-size:13px;letter-spacing:3px;padding:4px 12px;border-radius:99px;border:1px solid var(--accent);color:var(--accent-t)}
.hd-sum{font-family:var(--ti);font-size:15px;line-height:1.8;margin-top:12px;letter-spacing:1px;color:#5b4950}
.hd-pg{display:flex;justify-content:space-between;margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
.hd-pg button{font-size:12px;color:var(--sub);letter-spacing:2px}
.hd-pg button:disabled{opacity:.3}
.hd-tl{position:relative}
.hd-tl::before{content:"";position:absolute;left:60px;top:10px;bottom:10px;width:1px;background:linear-gradient(180deg,transparent,var(--accent) 6%,var(--accent) 94%,transparent);opacity:.45}
.hd-it{display:grid;grid-template-columns:46px 28px 1fr;align-items:start;margin-bottom:14px;animation:hdIn .6s both}
@keyframes hdIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.hd-t{font-family:var(--num);font-style:italic;font-size:16px;text-align:right;padding-top:13px;color:var(--sub)}
.hd-dot{position:relative;width:9px;height:9px;margin:19px auto 0;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px var(--accent)}
.hd-it.now .hd-dot{background:var(--accent)}
.hd-it.now .hd-dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px solid var(--accent);animation:hdP 2s infinite}
@keyframes hdP{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.9);opacity:0}}
.hd-it.now .hd-t{color:var(--accent-t)}
.hd-c{padding:12px 15px 13px;border-radius:18px}
.hd-c b{display:block;font-weight:500;font-size:15.5px;letter-spacing:2px}
.hd-c p{font-family:var(--ti);font-size:14.5px;line-height:1.75;color:#5b4950;margin-top:3px;white-space:pre-wrap;word-break:break-word}
.hd-foot{text-align:center;font-size:12px;color:var(--sub);letter-spacing:2px;margin:10px 0 20px}
.hd-up{display:block;margin:6px auto 20px;padding:10px 22px}
.hn-wrap{position:relative;margin:36px 12px 0}
.hn-bk{position:absolute;inset:0;border-radius:6px;background:color-mix(in srgb,var(--accent) 22%,rgba(255,255,255,.28));border:1px solid rgba(255,255,255,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.hn-bk.b1{transform:rotate(3.5deg) translate(10px,6px)}
.hn-bk.b2{transform:rotate(-3deg) translate(-6px,12px);opacity:.8}
.hn{position:relative;min-height:min(88vw,420px);padding:30px 24px 20px;border-radius:6px;display:flex;flex-direction:column;color:var(--ink);
  background:color-mix(in srgb,var(--accent) 30%,rgba(255,255,255,.45));border:1px solid rgba(255,255,255,.45);
  -webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2);
  box-shadow:0 14px 30px rgba(60,30,40,.14),inset 0 1px 0 rgba(255,255,255,.5);transform:rotate(-1.5deg)}
.hn::before{content:"";position:absolute;top:-13px;left:50%;width:96px;height:28px;margin-left:-48px;background:rgba(255,255,255,.42);border-left:1px dashed rgba(255,255,255,.6);border-right:1px dashed rgba(255,255,255,.6);transform:rotate(-2deg);box-shadow:0 1px 3px rgba(0,0,0,.05)}
.hn-h{display:flex;align-items:baseline;justify-content:space-between}
.hn-h b{font-family:var(--en);font-style:italic;font-weight:400;font-size:38px;letter-spacing:.5px}
.hn-h span{font-family:var(--num);font-style:italic;font-size:22px;color:var(--sub)}
.hn-tt{font-family:var(--ti);font-size:17px;font-weight:500;letter-spacing:2px;margin-top:14px}
.hn-x{flex:1;font-family:var(--ti);font-size:16px;line-height:1.95;margin-top:8px;white-space:pre-wrap;word-break:break-word;letter-spacing:.5px}
.hn-x s,.hn-tt s{opacity:.55;text-decoration-thickness:1.5px}
.hn-f{display:flex;justify-content:space-between;align-items:baseline;margin-top:18px;font-size:13px;color:var(--sub);letter-spacing:1.5px}
.hn-f i{font-family:var(--num);font-size:15px}
.hn.in-l{animation:hnL .45s ease}
.hn.in-r{animation:hnR .45s ease}
@keyframes hnL{from{opacity:0;transform:translateX(50px) rotate(4deg)}to{opacity:1;transform:rotate(-1.5deg)}}
@keyframes hnR{from{opacity:0;transform:translateX(-50px) rotate(-6deg)}to{opacity:1;transform:rotate(-1.5deg)}}
.hn-nav{display:flex;align-items:center;justify-content:center;gap:24px;margin:30px 0 10px}
.hn-nav button:disabled{opacity:.3}
.hn-nav span{font-size:12px;color:var(--sub);letter-spacing:2px}
.hn-tape{display:block;margin:30px auto 16px;padding:9px 36px 8px;background:rgba(255,255,255,.5);border-left:1.5px dashed rgba(255,255,255,.9);border-right:1.5px dashed rgba(255,255,255,.9);transform:rotate(-3deg);box-shadow:0 2px 10px rgba(60,30,40,.08);font-family:var(--ti);font-size:16px;letter-spacing:6px;color:var(--ink);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .15s}
.hn-tape small{display:block;font-family:var(--en);font-style:italic;font-size:12px;letter-spacing:1px;color:var(--sub);margin-top:-1px}
.hn-tape:active{transform:rotate(-3deg) scale(.95)}
.hm-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px 20px;margin:30px 10px 20px}
.hm-st{position:relative;display:block;aspect-ratio:4/5;text-align:left;color:var(--ink)}
.hm-pp{position:relative;height:100%;padding:18px 16px 14px;border-radius:6px;display:flex;flex-direction:column;
  background:color-mix(in srgb,var(--accent) 30%,rgba(255,255,255,.45));border:1px solid rgba(255,255,255,.45);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 10px 22px rgba(60,30,40,.12),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .15s}
.hm-st:nth-child(odd) .hm-pp{transform:rotate(-1.8deg)}
.hm-st:nth-child(even) .hm-pp{transform:rotate(1.4deg)}
.hm-st:active .hm-pp{transform:scale(.96)}
.hm-pp::before{content:"";position:absolute;top:-9px;left:50%;width:58px;height:18px;margin-left:-29px;background:rgba(255,255,255,.5);transform:rotate(-3deg)}
.hm-pp b{font-family:var(--en);font-style:italic;font-weight:400;font-size:24px}
.hm-m{margin:auto 0;font-family:var(--num);font-style:italic;font-weight:300;font-size:58px;line-height:1}
.hm-m small{font-size:16px;font-style:normal;font-family:var(--ti);margin-left:4px}
.hm-f{display:flex;justify-content:space-between;font-size:12px;color:var(--sub);letter-spacing:1px}
.hm-st .hn-bk.b1{transform:rotate(4deg) translate(6px,5px)}
.hm-st .hn-bk.b2{transform:rotate(-3.5deg) translate(-5px,9px)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-him"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button><h2>关于他</h2><em>about him</em></div>
  <div class="sub-line">他不在你身边的时候。</div>
  <div class="grid more-grid" id="himGrid">
    <button class="card glass hm-day" data-go="hday"><div class="cn">他的一天</div><div class="ce">his day</div><div class="hm-now" id="hmNow"></div></button>
    <button class="card glass" data-go="phone"><div class="cn">他的手机</div><div class="ce">his phone</div></button>
    <button class="card glass" data-go="hmemo"><div class="cn">他的备忘录</div><div class="ce">his notes</div></button>
  </div>
</div></section>
<section class="page" id="page-hday"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他的一天</h2><em>his day</em><span class="sp"></span><button class="iconbtn glass" id="hdMore" style="letter-spacing:1px">···</button></div>
  <div id="hdBody"></div>
</div></section>
<section class="page" id="page-hmemo"><div class="wrap">
  <div class="head"><button class="iconbtn glass" id="hnBack" aria-label="返回">${BACK}</button><h2>他的备忘录</h2><em id="hnSub">notes</em><span class="sp"></span><button class="pill ghost" id="hnMore">再翻一页</button></div>
  <div id="hnList"></div>
</div></section>`);

/* 他的手机：返回到「关于他」 */
$$('#page-phone [data-go="more"]').forEach(b=>b.dataset.go='him');

/* ---------- 他的一天 ---------- */
const days=()=>[...DATA.hday].sort((a,b)=>a.date.localeCompare(b.date));
function renderNow(){const el=$('#hmNow');if(!el)return;
  const r=DATA.hday.find(x=>x.date===T()),x=r&&arr(r.items).at(-1);
  el.textContent=dayBusy?'正在回想…':x?`${x.time} · ${x.title}`:'今天还没偷看'}
function renderDay(){
  const L=days(),b=$('#hdBody');
  if(di==null||di>=L.length)di=L.length-1;
  const r=L[di];
  if(!r){b.innerHTML=`<div class="empty">${dayBusy?esc(S.hisName)+'正在回想今天…':'还没有记录'}</div>`;return}
  const d=parseDate(r.date),items=arr(r.items),isT=r.date===T();
  const stale=isT&&!dayBusy&&mins(hm(new Date()))-mins(r.upto)>=60;
  b.innerHTML=`<div class="hd-hero glass">
      <div class="hd-date"><b>${pad(d.getDate())}</b><span>${d.getMonth()+1}月 · 星期${WK(d)}${isT?' · 今天':''}</span></div>
      ${r.mood?`<div class="hd-mood">${esc(r.mood)}</div>`:''}
      ${r.summary?`<p class="hd-sum">${esc(r.summary)}</p>`:''}
      <div class="hd-pg"><button data-dv="-1"${di>0?'':' disabled'}>‹ 前一天</button><button data-dv="1"${di<L.length-1?'':' disabled'}>后一天 ›</button></div>
    </div>
    <div class="hd-tl">${items.map((x,i)=>`<div class="hd-it${isT&&i===items.length-1?' now':''}" style="animation-delay:${i*70}ms"><div class="hd-t">${esc(x.time)}</div><div class="hd-dot"></div><div class="hd-c glass"><b>${esc(x.title)}</b>${x.text?`<p>${esc(x.text)}</p>`:''}</div></div>`).join('')}</div>
    ${dayBusy&&isT?`<div class="hd-foot">${esc(S.hisName)}正在回想…</div>`:stale?'<button class="pill hd-up" id="hdUp">看看他后来在做什么</button>':`<div class="hd-foot">${isT?'记到 '+esc(r.upto):'这一天过去了'}</div>`}`}
async function genDay(more){
  if(dayBusy)return;dayBusy=true;renderDay();renderNow();
  try{
    const now=new Date(),t=T();let r=DATA.hday.find(x=>x.date===t);
    const prev=more&&r?arr(r.items).map(x=>`${x.time} ${x.title}`).join('\n'):'';
    const recent=recentChat(12);
    const ask=`今天是${now.getMonth()+1}月${now.getDate()}日 星期${WK(now)}，现在是 ${hm(now)}。
${prev?`你今天 ${r.upto} 之前做的事：\n${prev}\n请接着写从 ${r.upto} 到现在 ${hm(now)} 你做了什么，2到4条。`:`请写你今天从醒来到现在 ${hm(now)} 的时间轴，5到8条。如果现在还很早，就从昨晚睡前写起。`}
${recent?'你们最近的聊天（和她聊天的时间要对得上）：\n'+recent+'\n':''}要符合你的人设、工作和生活，具体、有画面，像真实的一天，不要每件事都和她有关。时间从早到晚，不要晚于现在。不要用 emoji。只输出 JSON：
{${prev?'':'"mood":"用两三个字形容你今天的状态","summary":"一句话总结今天，像写给自己的",'}"items":[{"time":"HH:MM","title":"四到八个字","text":"一两句具体的细节"}]}`;
    const j=J(await callAI(sceneSystem('她在「365」的「关于他」里看你今天的时间轴，想知道你不在她身边的时候都在做什么。'),[{role:'user',text:ask}]));
    const items=arr(j.items).filter(x=>x&&x.time&&x.title).map(x=>({time:x.time,title:x.title,text:x.text||''})).sort((a,b)=>mins(a.time)-mins(b.time));
    if(!items.length)throw new SyntaxError('empty');
    if(more&&r){r.items=[...arr(r.items),...items.filter(x=>mins(x.time)>=mins(r.upto))];r.upto=hm(now)}
    else{DATA.hday=DATA.hday.filter(x=>x.date!==t);DATA.hday.push({date:t,mood:j.mood||'',summary:j.summary||'',items,upto:hm(now)})}
    DATA.hday=days().slice(-60);di=null;await saveData('hday')}
  catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{dayBusy=false;renderDay();renderNow()}}
$('#hdBody').onclick=e=>{
  if(e.target.closest('#hdUp'))return genDay(true);
  const v=e.target.closest('[data-dv]');if(v&&!v.disabled){di+=Number(v.dataset.dv);renderDay();$('#page-hday').scrollTop=0}};
$('#hdMore').onclick=()=>{const r=days()[di];const acts=[];
  if(!r||r.date===T())acts.push(['重新写今天',()=>{DATA.hday=DATA.hday.filter(x=>x.date!==T());genDay()}]);
  if(r)acts.push(['删除这一天',async()=>{if(!confirm('删除这一天的时间轴？'))return;DATA.hday=DATA.hday.filter(x=>x!==r);di=null;await saveData('hday');renderDay();renderNow()}]);
  sheet(acts)};

/* ---------- 他的备忘录：最新一页 → 回顾（按月一叠） → 某个月 ---------- */
const notes=()=>[...DATA.hnote].sort((a,b)=>b.t-a.t);
const months=()=>{const m={};DATA.hnote.forEach(n=>{const k=String(n.date).slice(0,7);(m[k]=m[k]||[]).push(n)});
  return Object.entries(m).sort((a,b)=>b[0].localeCompare(a[0]))};
const list=()=>hv==='one'?DATA.hnote.filter(n=>String(n.date).startsWith(hmon)).sort((a,b)=>a.t-b.t):notes();
function renderNotes(){
  const el=$('#hnList');
  $('#hnMore').style.display=hv==='top'?'':'none';
  $('#hnMore').textContent=noteBusy?'在翻…':'再翻一页';
  $('#hnSub').textContent=hv==='top'?'notes':hv==='mon'?'review':`${+hmon.slice(5)}月`;
  if(hv==='mon'){const M=months();
    el.innerHTML=M.length?`<div class="hm-grid">${M.map(([k,L])=>`<button class="hm-st" data-mon="${k}">${L.length>2?'<i class="hn-bk b2"></i>':''}${L.length>1?'<i class="hn-bk b1"></i>':''}<div class="hm-pp"><b>Notes</b><div class="hm-m">${+k.slice(5)}<small>月</small></div><div class="hm-f"><span>${k.slice(0,4)}</span><span>${L.length} 页</span></div></div></button>`).join('')}</div>`
      :'<div class="empty">本子还是空的</div>';
    return}
  const L=list();if(ni>=L.length)ni=Math.max(0,L.length-1);
  if(!L.length){if(hv==='one'){hv='mon';return renderNotes()}
    el.innerHTML=`<div class="empty">${noteBusy?esc(S.hisName)+'的本子翻开了…':'本子还是空的'}</div>`;return}
  const n=L[ni];
  el.innerHTML=`<div class="hn-wrap">${L.length>2?'<div class="hn-bk b2"></div>':''}${L.length>1?'<div class="hn-bk b1"></div>':''}
    <div class="hn ${anim}" id="hnCard"><div class="hn-h"><b>Notes</b><span>${md(n.date)}</span></div>
    ${n.title?`<div class="hn-tt">${ink(n.title)}</div>`:''}<div class="hn-x">${ink(n.text)}</div>
    <div class="hn-f"><span>${md(n.date)} · ${esc(S.hisName)}写的</span><i>${ni+1}/${L.length}</i></div></div></div>
    <div class="hn-nav"><button class="iconbtn glass" data-nv="-1"${ni>0?'':' disabled'}>${BACK}</button><span>${noteBusy?'在翻…':'左右滑动翻页'}</span><button class="iconbtn glass" data-nv="1"${ni<L.length-1?'':' disabled'}>${NEXT}</button></div>
    ${hv==='top'?'<button class="hn-tape" id="hnRev">回顾<small>review</small></button>':''}`;
  anim=''}
function flip(d){const k=ni+d;if(k<0||k>=list().length)return;ni=k;anim=d>0?'in-l':'in-r';renderNotes()}
async function genNotes(k){
  if(noteBusy)return;noteBusy=true;renderNotes();
  try{
    const had=notes().slice(0,8).map(n=>'- '+String(n.text).slice(0,40)).join('\n');
    const recent=recentChat(12);
    const j=J(await callAI(sceneSystem('她在偷看你随身带的小本子。'),[{role:'user',text:`请以${S.hisName}的身份，写${k}页你自己的备忘录，像写在随身的小本子上：可以是关于她的小事（她的喜好、她说过的话、想带她去的地方）、工作、提醒自己的事、想对她说却没说出口的话。每页30到120字，口语，可以有一两处写了又划掉的字，用~~包起来。
${had?'之前写过的，不要重复：\n'+had+'\n':''}${recent?'你们最近的聊天：\n'+recent+'\n':''}不要用 emoji。只输出 JSON：{"notes":[{"title":"很短的标题，可以空着","text":"内容"}]}`}]));
    const L=arr(j.notes).filter(n=>n&&n.text);
    if(!L.length)throw new SyntaxError('empty');
    const now=Date.now();
    L.slice(0,k).forEach((n,i)=>DATA.hnote.push({id:uid(),title:String(n.title||''),text:String(n.text),date:T(),t:now+i}));
    await saveData('hnote');if(hv==='top'){ni=0;anim='in-l'}}
  catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{noteBusy=false;renderNotes()}}
$('#hnMore').onclick=()=>genNotes(1);
$('#hnBack').onclick=()=>{
  if(hv==='one'){hv='mon';renderNotes()}
  else if(hv==='mon'){hv='top';ni=0;renderNotes()}
  else go('him');
  $('#page-hmemo').scrollTop=0};
let sx=null,sy=0,swiped=false;
$('#hnList').addEventListener('touchstart',e=>{if(!e.target.closest('#hnCard'))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
$('#hnList').addEventListener('touchend',e=>{if(sx==null)return;
  const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){swiped=true;flip(dx<0?1:-1);setTimeout(()=>swiped=false,350)}});
$('#hnList').onclick=e=>{
  if(e.target.closest('#hnRev')){hv='mon';renderNotes();$('#page-hmemo').scrollTop=0;return}
  const mo=e.target.closest('[data-mon]');if(mo){hv='one';hmon=mo.dataset.mon;ni=0;anim='in-l';renderNotes();$('#page-hmemo').scrollTop=0;return}
  const v=e.target.closest('[data-nv]');if(v){if(!v.disabled)flip(+v.dataset.nv);return}
  if(swiped||!e.target.closest('#hnCard'))return;
  const n=list()[ni];if(!n)return;
  sheet([['复制',()=>navigator.clipboard?.writeText((n.title?n.title+'\n':'')+n.text.replace(/~~/g,'')).then(()=>toast('已复制'))],
    ['撕掉这页',async()=>{if(!confirm('撕掉这页？'))return;DATA.hnote=DATA.hnote.filter(x=>x!==n);await saveData('hnote');renderNotes()}]])};

/* ---------- 聊天时，他记得自己今天做了什么 ---------- */
HOOKS.context.push(()=>{const r=DATA.hday.find(x=>x.date===T());if(!r||!arr(r.items).length)return '';
  return '【你今天】你今天到目前为止：'+arr(r.items).map(x=>`${x.time} ${x.title}`).join('；')+'。聊天时和这些保持一致，不用主动复述。'});

addMore({go:'him',cn:'关于他',ce:'about him'});
HOOKS.ready.push(renderNow);
HOOKS.page.push(n=>{
  if(n==='him')renderNow();
  if(n==='hday'){di=null;renderDay();if(!DATA.hday.some(x=>x.date===T()))genDay()}
  if(n==='hmemo'){hv='top';ni=0;renderNotes();if(!DATA.hnote.some(x=>x.date===T()))genNotes(2)}});
})();
