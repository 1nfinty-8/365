/* ===== 365 · him.js · 关于他：他的手机、他的一天、他的备忘录 ===== */
(()=>{
if(!Array.isArray(DATA.hday))DATA.hday=[];
if(!Array.isArray(DATA.hnote))DATA.hnote=[];
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const HAND="'Long Cang','Ma Shan Zheng','Kaiti SC','STKaiti',cursive";
const T=()=>isoDate(today());
const WK=d=>'日一二三四五六'[d.getDay()];
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const mins=s=>{const[a,b]=String(s||'0:0').split(':').map(Number);return (a||0)*60+(b||0)};
const arr=v=>Array.isArray(v)?v:[];
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
const ink=s=>esc(s).replace(/~~(.+?)~~/g,'<s>$1</s>');
let dayBusy=false,noteBusy=false,di=null;

document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/long-cang/400.css"><style>
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
.hd-th{margin-top:8px;padding-left:10px;border-left:2px solid var(--accent);font-family:${HAND};font-size:19px;line-height:1.5;color:var(--accent-t)}
.hd-foot{text-align:center;font-size:12px;color:var(--sub);letter-spacing:2px;margin:10px 0 20px}
.hd-up{display:block;margin:6px auto 20px;padding:10px 22px}
.hn{position:relative;margin:30px 6px 0;padding:14px 18px 12px 42px;background-color:#FFFDF5;
  background-image:linear-gradient(90deg,transparent 30px,rgba(214,96,96,.3) 30px,rgba(214,96,96,.3) 31px,transparent 31px),repeating-linear-gradient(180deg,transparent 0,transparent 33px,rgba(90,120,170,.2) 33px,rgba(90,120,170,.2) 34px);
  background-position:0 0,0 14px;border-radius:3px;box-shadow:0 1px 1px rgba(0,0,0,.04),0 10px 24px rgba(60,40,50,.12);
  font-family:${HAND};color:#2c3550;font-size:22px;line-height:34px;transform:rotate(-.7deg)}
.hn:nth-child(even){transform:rotate(.6deg)}
.hn::before{content:"";position:absolute;top:-12px;left:50%;width:90px;height:24px;margin-left:-45px;background:rgba(255,255,255,.6);transform:rotate(-2deg);box-shadow:0 1px 3px rgba(0,0,0,.06)}
.hn b{display:block;font-weight:400;font-size:25px}
.hn p{white-space:pre-wrap;word-break:break-word}
.hn s{text-decoration-thickness:2px;text-decoration-color:rgba(44,53,80,.8);opacity:.7}
.hn-d{text-align:right;font-size:19px;opacity:.55}
.hn-wait{text-align:center;color:var(--sub);letter-spacing:2px;margin:24px 0 0;font-size:13px}
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
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他的备忘录</h2><em>notes</em><span class="sp"></span><button class="pill ghost" id="hnMore">再翻一页</button></div>
  <div class="sub-line">他随身带着的小本子。</div>
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
    <div class="hd-tl">${items.map((x,i)=>`<div class="hd-it${isT&&i===items.length-1?' now':''}" style="animation-delay:${i*70}ms"><div class="hd-t">${esc(x.time)}</div><div class="hd-dot"></div><div class="hd-c glass"><b>${esc(x.title)}</b>${x.text?`<p>${esc(x.text)}</p>`:''}${x.thought?`<div class="hd-th">${esc(x.thought)}</div>`:''}</div></div>`).join('')}</div>
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
{${prev?'':'"mood":"用两三个字形容你今天的状态","summary":"一句话总结今天，像写给自己的",'}"items":[{"time":"HH:MM","title":"四到八个字","text":"一两句具体的细节","thought":"这一刻心里想到她的一句话，没有就空着"}]}`;
    const j=J(await callAI(sceneSystem('她在「365」的「关于他」里看你今天的时间轴，想知道你不在她身边的时候都在做什么。'),[{role:'user',text:ask}]));
    const items=arr(j.items).filter(x=>x&&x.time&&x.title).sort((a,b)=>mins(a.time)-mins(b.time));
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

/* ---------- 他的备忘录 ---------- */
function renderNotes(){
  const L=[...DATA.hnote].sort((a,b)=>b.t-a.t);
  $('#hnMore').textContent=noteBusy?'在翻…':'再翻一页';
  $('#hnList').innerHTML=(noteBusy?`<div class="hn-wait">${esc(S.hisName)}的本子翻开了…</div>`:'')+(L.length?L.map(n=>{const d=parseDate(n.date);
    return `<div class="hn" data-hn="${n.id}">${n.title?`<b>${ink(n.title)}</b>`:''}<p>${ink(n.text)}</p><div class="hn-d">${d.getMonth()+1}.${d.getDate()}</div></div>`}).join(''):(noteBusy?'':'<div class="empty">本子还是空的</div>'))}
async function genNotes(k){
  if(noteBusy)return;noteBusy=true;renderNotes();
  try{
    const had=[...DATA.hnote].sort((a,b)=>b.t-a.t).slice(0,8).map(n=>'- '+String(n.text).slice(0,40)).join('\n');
    const recent=recentChat(12);
    const j=J(await callAI(sceneSystem('她在偷看你随身带的小本子。'),[{role:'user',text:`请以${S.hisName}的身份，写${k}页你自己的备忘录，像用笔写在随身的小本子上：可以是关于她的小事（她的喜好、她说过的话、想带她去的地方）、工作、提醒自己的事、想对她说却没说出口的话。每页30到120字，口语，可以有一两处写了又划掉的字，用~~包起来。
${had?'之前写过的，不要重复：\n'+had+'\n':''}${recent?'你们最近的聊天：\n'+recent+'\n':''}不要用 emoji。只输出 JSON：{"notes":[{"title":"很短的标题，可以空着","text":"内容"}]}`}]));
    const L=arr(j.notes).filter(n=>n&&n.text);
    if(!L.length)throw new SyntaxError('empty');
    const now=Date.now();
    L.slice(0,k).forEach((n,i)=>DATA.hnote.push({id:uid(),title:String(n.title||''),text:String(n.text),date:T(),t:now+i}));
    await saveData('hnote')}
  catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{noteBusy=false;renderNotes()}}
$('#hnMore').onclick=()=>genNotes(1);
$('#hnList').onclick=e=>{const c=e.target.closest('[data-hn]');if(!c)return;
  const n=DATA.hnote.find(x=>x.id===c.dataset.hn);if(!n)return;
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
  if(n==='hmemo'){renderNotes();if(!DATA.hnote.some(x=>x.date===T()))genNotes(2)}});
})();
