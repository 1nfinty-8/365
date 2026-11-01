/* ===== 365 · deeptalk.js · deeptalk ===== */
(()=>{
if(!Array.isArray(DATA.deep))DATA.deep=[];
const save=()=>saveData('deep');
const find=id=>DATA.deep.find(x=>x.id===id);
const md=t=>{const d=new Date(t);return `${d.getMonth()+1}月${d.getDate()}日`};
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
let cur=null,page='home';

document.head.insertAdjacentHTML('beforeend',`<style>
.dl-item{display:block;width:100%;text-align:left;padding:18px 20px;margin-bottom:12px;transition:transform .15s}
.dl-item:active{transform:scale(.98)}
.dl-title{font-size:17px;font-weight:500;letter-spacing:2px}
.dl-meta{font-size:12px;color:var(--sub);margin-top:3px;letter-spacing:1px}
.dl-prev{font-size:13.5px;color:#5b4950;margin-top:8px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
#page-dtalk{padding:0;overflow:hidden}
#page-dtalk.active{display:flex;flex-direction:column}
body.dt #tabbar{display:none}
.dt-top{flex:none;display:flex;align-items:center;gap:6px;padding:calc(var(--st) + 4px) 12px 6px}
.dt-title{flex:1;min-width:0;text-align:center}
.dt-title b{display:block;font-weight:500;font-size:15px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dt-title span{font-family:var(--num);font-style:italic;font-size:13px;color:var(--sub)}
#dtTrack{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}
#dtTrack::-webkit-scrollbar{display:none}
.dt-slide{flex:0 0 100%;min-width:0;scroll-snap-align:center;scroll-snap-stop:always;padding:6px 16px calc(var(--sb) + 14px);display:flex}
.dt-card{flex:1;min-width:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:22px 22px 16px;border-radius:26px;display:flex;flex-direction:column}
.dt-h{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex:none}
.dt-h .av{width:34px;height:34px;font-size:14px}
.dt-who{font-size:15px;letter-spacing:2px}
.dt-card.me .dt-who{color:var(--accent-t)}
.dt-when{font-family:var(--en);font-style:italic;font-size:13px;color:var(--sub)}
.dt-more{margin-left:auto;width:32px;height:32px;border-radius:50%;color:var(--sub);letter-spacing:1px}
.dt-body{font-family:var(--ti);font-size:16.5px;line-height:2;letter-spacing:.5px;text-align:justify;word-break:break-word}
.dt-body p{margin:0 0 .9em}
.dt-foot{margin-top:auto;padding-top:14px;text-align:center;font-family:var(--num);font-style:italic;font-size:13px;color:var(--sub);letter-spacing:3px}
.dt-typing{flex:1;display:grid;place-items:center}
.dt-compose textarea{flex:1;width:100%;min-height:180px;border:0;background:transparent;outline:none;resize:none;font:16.5px/2 var(--ti);color:var(--ink)}
.dt-btns{flex:none;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-deep"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>deeptalk</h2><span class="sp"></span>
    <button class="pill" id="dlAdd">＋ 新的</button>
  </div>
  <div class="sub-line">慢慢说，一张一张地写给对方。</div>
  <div id="dlList"></div>
</div></section>
<section class="page" id="page-dtalk">
  <div class="dt-top">
    <button class="iconbtn glass" data-go="deep" aria-label="返回">${BACK}</button>
    <div class="dt-title"><b id="dtName"></b><span id="dtPos"></span></div>
    <button class="iconbtn glass" id="dtMenu" style="letter-spacing:1px">···</button>
  </div>
  <div id="dtTrack"></div>
</section>`);

/* 列表 */
function renderList(){
  const L=[...DATA.deep].sort((a,b)=>(b.at||b.t)-(a.at||a.t));
  $('#dlList').innerHTML=L.length?L.map(d=>{const last=d.cards.at(-1);
    return `<button class="dl-item glass" data-dl="${d.id}"><div class="dl-title">${esc(d.title)}</div>
      <div class="dl-meta">${d.cards.length} 张 · ${md(d.at||d.t)}${d._busy?' · '+esc(S.hisName)+'在写…':''}</div>
      ${last?`<div class="dl-prev">${last.role==='user'?'我':esc(S.hisName)}：${esc(last.text.slice(0,80))}</div>`:''}</button>`}).join('')
    :'<div class="empty">还没有 deeptalk<br>点「＋ 新的」，慢慢说</div>'}
$('#dlAdd').onclick=async()=>{
  const d={id:uid(),title:md(Date.now())+'的 deeptalk',cards:[],t:Date.now(),at:Date.now()};
  DATA.deep.push(d);await save();openTalk(d)};
$('#dlList').onclick=e=>{const b=e.target.closest('[data-dl]');if(!b)return;const d=find(b.dataset.dl);if(d)openTalk(d)};

/* 卡片 */
function openTalk(d){cur=d;go('dtalk');renderTalk(Math.max(0,d.cards.length-1))}
function pos(){const tr=$('#dtTrack'),d=cur;if(!d)return;
  const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));
  $('#dtPos').textContent=i<d.cards.length?`${i+1} / ${d.cards.length}`:(d._busy?'正在写…':'写一张')}
function renderTalk(goto,smooth){
  const d=cur;if(!d)return;
  $('#dtName').textContent=d.title;
  let h=d.cards.map((c,i)=>{const me=c.role==='user';
    return `<div class="dt-slide"><div class="dt-card glass${me?' me':''}">
      <div class="dt-h">${avatarHTML(me?'me':'him')}<div><div class="dt-who">${me?'我':esc(S.hisName)}</div><div class="dt-when">${fmtDate(c.t)}</div></div><button class="dt-more" data-dc="${i}">···</button></div>
      <div class="dt-body">${paras(c.text)}</div>
      <div class="dt-foot">· ${i+1} ·</div></div></div>`}).join('');
  if(d._busy)h+=`<div class="dt-slide"><div class="dt-card glass">
      <div class="dt-h">${avatarHTML('him')}<div><div class="dt-who">${esc(S.hisName)}</div><div class="dt-when">正在写…</div></div></div>
      <div class="dt-typing"><div class="typing"><i></i><i></i><i></i></div></div></div></div>`;
  else{const lastMe=d.cards.at(-1)?.role==='user';
    h+=`<div class="dt-slide"><div class="dt-card glass dt-compose">
      <div class="dt-h">${avatarHTML('me')}<div><div class="dt-who">我</div><div class="dt-when">写给${esc(S.hisName)}</div></div></div>
      <textarea id="dtInput" placeholder="${d.cards.length?'接着说…':'想和他聊点什么…'}"></textarea>
      <div class="dt-btns">${!d.cards.length?`<button class="pill ghost" id="dtFirst">让${esc(S.hisName)}先开口</button>`:''}${lastMe?`<button class="pill ghost" id="dtAsk">让${esc(S.hisName)}回</button>`:''}<button class="pill" id="dtSend">发送</button></div></div></div>`}
  const tr=$('#dtTrack');tr.innerHTML=h;
  const ta=$('#dtInput');if(ta){ta.value=d._draft||'';ta.oninput=()=>{d._draft=ta.value}}
  const n=tr.children.length,i=Math.max(0,Math.min(n-1,goto??n-1));
  requestAnimationFrame(()=>{tr.scrollTo({left:i*tr.clientWidth,behavior:smooth?'smooth':'auto'});setTimeout(pos,smooth?400:0)})}
$('#dtTrack').addEventListener('scroll',pos,{passive:true});

const sys=()=>sceneSystem(`这是你们的小窝「365」里的 deeptalk。这里不是平时发消息，你们像写信一样，一张卡片一张卡片地认真说心里话。
【格式】每次写一整段完整的话，300到500字，可以分成几个自然段，段落之间换行。不要拆成很多短消息，不要加名字前缀、标题或引号。认真回应她这张卡片里的每一层意思，要有你自己的情绪、想法和态度，不要敷衍，也不要说教。`);
async function send(){
  const d=cur,ta=$('#dtInput');if(!d||d._busy||!ta)return;
  const v=ta.value.trim();if(!v)return toast('写点什么吧');
  ta.blur();d.cards.push({role:'user',text:v,t:Date.now()});d._draft='';d.at=Date.now();
  await save();reply(d)}
async function reply(d,first){
  if(!d||d._busy)return;d._busy=true;
  if(cur===d)renderTalk(d.cards.length,true);
  try{
    const msgs=d.cards.slice(-12).map(c=>({role:c.role,text:c.text}));
    if(first||!msgs.length)msgs.push({role:'user',text:'（系统提示，不是她说的话：这是一场新的 deeptalk，请你先开口。挑一个你们之间值得认真聊的话题，主动写给她。）'});
    const t=await callAI(sys(),msgs);
    d.cards.push({role:'model',text:clean(t),t:Date.now()});d.at=Date.now();
    if(cur!==d||page!=='dtalk')toast(`${S.hisName}写好了一张给你`)}
  catch(e){toast(e.message)}
  delete d._busy;await save();
  if(cur===d&&page==='dtalk')renderTalk(d.cards.length-1,true);
  renderList()}

$('#dtTrack').addEventListener('click',e=>{const d=cur;if(!d)return;
  if(e.target.closest('#dtSend'))return send();
  if(e.target.closest('#dtFirst'))return reply(d,true);
  if(e.target.closest('#dtAsk'))return reply(d);
  const b=e.target.closest('[data-dc]');if(!b)return;
  const i=+b.dataset.dc,c=d.cards[i];if(!c)return;
  const acts=[['复制',()=>navigator.clipboard?.writeText(c.text).then(()=>toast('已复制'))]];
  if(c.role==='model'&&i===d.cards.length-1&&!d._busy)acts.push(['让他重新写这张',async()=>{d.cards.pop();await save();reply(d)}]);
  acts.push(['删除这张',async()=>{if(!confirm('删除这张卡片？'))return;d.cards.splice(i,1);await save();renderTalk(Math.min(i,d.cards.length))}]);
  sheet(acts)});

/* 改名、删除 */
$('#dtMenu').onclick=()=>{const d=cur;if(!d)return;
  sheet([['改名字',async()=>{const v=prompt('新的名字',d.title);if(!v||!v.trim())return;d.title=v.trim();await save();$('#dtName').textContent=d.title}],
    ['删除这场 deeptalk',async()=>{if(!confirm(`删除「${d.title}」？所有卡片都会删掉。`))return;DATA.deep=DATA.deep.filter(x=>x!==d);await save();cur=null;go('deep')}]])};

addMore({go:'deep',cn:'deeptalk'});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.deep))DATA.deep=[];renderList()});
HOOKS.refresh.push(()=>{renderList();if(cur&&page==='dtalk')renderTalk()});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('dt',n==='dtalk');if(n==='deep')renderList()});
HOOKS.context.push(()=>{
  const d=[...DATA.deep].filter(x=>x.cards.length&&Date.now()-(x.at||x.t)<3*864e5).sort((a,b)=>b.at-a.at)[0];
  if(!d)return '';const last=d.cards.at(-1);
  return `【最近的 deeptalk】你们最近在「${d.title}」里认真聊过，最后一张是${last.role==='user'?'她':'你'}写的：「${last.text.slice(0,100)}…」。平时聊天可以自然地接上，不用刻意提。`});
})();
