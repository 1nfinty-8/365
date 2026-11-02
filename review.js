/* ===== 365 · review.js · 月度回顾 ===== */
(()=>{
if(!Array.isArray(DATA.review))DATA.review=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('review'))LISTS.push('review');
const save=()=>saveData('review');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const arr=v=>Array.isArray(v)?v:[];
const mk=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const curM=()=>mk(Date.now());
const inM=(k,t)=>!!t&&mk(t)===k;
const txt=x=>x.voice?(x.voice.tx||''):String(x.text||'');
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
const findR=k=>DATA.review.find(x=>x.month===k);
let cur=null,page='home',busy=false;

document.head.insertAdjacentHTML('beforeend',`<style>
.rv-it{display:flex;align-items:center;gap:16px;width:100%;text-align:left;padding:16px 20px;margin-bottom:12px}
.rv-it>b{font-family:var(--num);font-style:italic;font-weight:300;font-size:44px;line-height:1;min-width:64px;color:var(--accent-t)}
.rv-it>b small{font-size:15px;font-style:normal;font-family:var(--ti);margin-left:2px}
.rv-it>div{flex:1;min-width:0}
.rv-t{font-size:16px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rv-m{font-size:12px;color:var(--sub);margin-top:3px;letter-spacing:1px}
.rv-ar{width:8px;height:8px;border-right:1.5px solid var(--sub);border-bottom:1.5px solid var(--sub);transform:rotate(-45deg)}
#page-rv{padding:0;overflow:hidden}
#page-rv.active{display:flex;flex-direction:column}
body.rvb #tabbar{display:none}
.rv-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 6px}
.rv-mid{flex:1;text-align:center}
.rv-mid b{display:block;font-family:var(--num);font-style:italic;font-weight:400;font-size:18px;letter-spacing:2px}
.rv-mid span{font-family:var(--num);font-style:italic;font-size:13px;color:var(--sub)}
#rvTrack{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}
#rvTrack::-webkit-scrollbar{display:none}
.rv-s{flex:0 0 100%;min-width:0;scroll-snap-align:center;scroll-snap-stop:always;padding:6px 18px calc(var(--sb) + 16px);display:flex}
.rv-c{flex:1;min-width:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:26px 24px;border-radius:28px;display:flex;flex-direction:column;align-items:center;text-align:center}
.rv-c>:first-child{margin-top:auto}
.rv-c>:last-child{margin-bottom:auto}
.rv-en{font-family:var(--en);font-style:italic;font-size:14px;color:var(--sub);letter-spacing:3px;margin-bottom:14px}
.rv-big{font-family:var(--num);font-style:italic;font-weight:300;font-size:120px;line-height:1;letter-spacing:-4px;color:var(--accent-t)}
.rv-big small{font-size:28px;letter-spacing:0;font-style:normal;font-family:var(--ti);margin-left:4px}
.rv-yr{font-family:var(--num);font-style:italic;font-size:20px;color:var(--sub);letter-spacing:4px;margin-top:6px}
.rv-ti{font-family:var(--ti);font-size:19px;letter-spacing:3px;margin-top:22px}
.rv-hint{font-size:12px;color:var(--sub);letter-spacing:2px;margin-top:30px;line-height:2}
.rv-h{font-family:var(--ti);font-size:16px;letter-spacing:3px}
.rv-num{font-family:var(--num);font-style:italic;font-weight:300;font-size:84px;line-height:1.1;color:var(--accent-t);margin:6px 0}
.rv-split{width:100%;height:8px;border-radius:8px;background:color-mix(in srgb,var(--accent) 30%,rgba(255,255,255,.4));overflow:hidden;margin-top:22px}
.rv-split i{display:block;height:100%;background:var(--accent);border-radius:8px}
.rv-sl{width:100%;display:flex;justify-content:space-between;font-size:12.5px;color:var(--sub);letter-spacing:1px;margin-top:6px}
.rv-row{width:100%;display:flex;justify-content:space-between;align-items:baseline;padding:12px 2px;border-bottom:1px solid var(--line);font-size:14px;letter-spacing:2px}
.rv-row:first-of-type{margin-top:16px}
.rv-row b{font-family:var(--num);font-style:italic;font-weight:400;font-size:24px;color:var(--accent-t)}
.rv-row b small{font-size:13px;color:var(--sub);font-style:normal;font-family:var(--ti)}
.rv-q{font-family:var(--ti);font-size:17px;line-height:1.9;margin-top:22px;letter-spacing:1px}
.rv-q small{display:block;font-size:12px;color:var(--sub);margin-top:6px}
.rv-late{margin-top:26px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--sub);letter-spacing:1.5px;line-height:2;width:100%}
.rv-late b{font-family:var(--num);font-style:italic;font-weight:400;font-size:20px;color:var(--accent-t)}
.rv-wh{font-size:12px;color:var(--sub);letter-spacing:3px;margin:20px 0 10px}
.rv-w{display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:6px 14px;font-family:var(--ti)}
.rv-w i{font-style:italic;font-family:var(--num);font-size:11px;color:var(--sub);margin-left:2px}
.rv-g{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.rv-g div{padding:16px 6px;border-radius:18px;background:rgba(255,255,255,.35)}
.rv-g b{display:block;font-family:var(--num);font-style:italic;font-weight:300;font-size:40px;line-height:1.1;color:var(--accent-t)}
.rv-g span{font-size:12px;color:var(--sub);letter-spacing:1px}
.rv-day{font-family:var(--ti);font-size:15px;letter-spacing:2px;margin:4px 0}
.rv-lt{font-family:var(--ti);font-size:18px;letter-spacing:3px;margin-bottom:18px}
.rv-letter{width:100%;text-align:justify;font-family:var(--ti);font-size:16px;line-height:2;letter-spacing:.5px}
.rv-letter p{margin:0 0 .9em;text-indent:2em}
.rv-sign{width:100%;text-align:right;font-family:var(--ti);font-size:15px;letter-spacing:3px;color:var(--sub);margin-top:6px}
.rv-none{font-size:13px;color:var(--sub);letter-spacing:1.5px;margin:14px 0;line-height:2}
.rv-c .pill{margin-top:10px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-review"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button><h2>月度回顾</h2><em>monthly</em></div>
  <div class="sub-line">每个月，都替我们记着。</div>
  <div id="rvList"></div>
</div></section>
<section class="page" id="page-rv">
  <div class="rv-top">
    <button class="iconbtn glass" data-go="review" aria-label="返回">${BACK}</button>
    <div class="rv-mid"><b id="rvName"></b><span id="rvPos"></span></div>
    <button class="iconbtn glass" id="rvMenu" style="letter-spacing:1px">···</button>
  </div>
  <div id="rvTrack"></div>
</section>`);

/* ---------- 算数据 ---------- */
const STOP=new Set('我们 你们 他们 她们 什么 怎么 这个 那个 这些 那些 就是 还是 然后 因为 所以 可以 没有 不是 一下 一个 现在 今天 知道 觉得 真的 自己 已经 还有 时候 这样 那样 为什么 但是 如果 而且 这么 那么 东西 一点 有点 好像 应该 一起 不要 不会 不能 不想 怎么样 一样 这里 那里 哪里 只是 还要 要是 的话 出来 起来 过来 一直 其实 可能 而已 嗯嗯 哈哈 哈哈哈 好的 好吧 是的 对啊 对吧 之后 以后 不过 别人 这种 那种 还是 有些 一些 每次 那边 这边 语音'.split(' '));
function words(L){
  if(!(window.Intl&&Intl.Segmenter))return null;
  const seg=new Intl.Segmenter('zh',{granularity:'word'}),c={};
  for(const s of L)for(const w of seg.segment(s)){if(!w.isWordLike)continue;const x=w.segment.trim();
    if(x.length<2||x.length>6||STOP.has(x)||/^[\d\s.]+$/.test(x))continue;c[x]=(c[x]||0)+1}
  return Object.entries(c).filter(e=>e[1]>=2).sort((a,b)=>b[1]-a[1]).slice(0,10)}
function stats(k){
  const[y,m]=k.split('-').map(Number),N=new Date(y,m,0).getDate();
  const C=DATA.chat.filter(x=>inM(k,x.t)),me=C.filter(x=>x.role==='user'),him=C.filter(x=>x.role!=='user');
  const byDay={};C.forEach(x=>{const d=new Date(x.t).getDate();byDay[d]=(byDay[d]||0)+1});
  const tp=Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0];
  let late=null;C.forEach(x=>{const d=new Date(x.t),h=d.getHours();if(h<5){const v=h*60+d.getMinutes();if(!late||v>late.v)late={v,t:x.t}}});
  let quote='';if(tp){const L=him.filter(x=>new Date(x.t).getDate()==tp[0]&&txt(x).length>=6&&txt(x).length<=60);if(L.length)quote=txt(L[Math.floor(L.length/2)])}
  const dOf=x=>x.date||isoDate(new Date(x.t));
  return {y,m,N,total:C.length,me:me.length,him:him.length,days:Object.keys(byDay).length,
    top:tp?{d:+tp[0],n:tp[1]}:null,late,quote,
    photos:C.reduce((s,x)=>s+arr(x.images).length,0),voices:C.filter(x=>x.voice).length,
    wMe:words(me.map(txt)),wHim:words(him.map(txt)),
    diary:new Set(arr(DATA.diary).map(dOf).filter(d=>String(d).startsWith(k))).size,
    deep:arr(DATA.deep).filter(d=>arr(d.cards).some(c=>inM(k,c.t))).length,
    cards:arr(DATA.cards).filter(c=>c.mode==='day'&&inM(k,c.t)).length,
    todo:arr(DATA.todo).filter(x=>x.done&&inM(k,x.doneAt)).length,
    anniv:arr(DATA.anniv).filter(a=>{const[ay,am]=String(a.date||'').split('-').map(Number);return am===m&&(a.type==='yearly'||ay===y)}).map(a=>a.name),
    marks:arr(DATA.marks).filter(x=>String(x.date).startsWith(k)).map(x=>x.text)}}

/* ---------- 列表 ---------- */
function months(){const s=new Set([curM()]);DATA.chat.forEach(x=>{if(x.t)s.add(mk(x.t))});return [...s].sort().reverse()}
function renderList(){const el=$('#rvList');if(!el)return;
  const cnt={};DATA.chat.forEach(x=>{if(x.t){const k=mk(x.t);cnt[k]=(cnt[k]||0)+1}});
  el.innerHTML=months().map(k=>{const R=findR(k),isC=k===curM();
    return `<button class="rv-it glass" data-rv="${k}"><b>${+k.slice(5)}<small>月</small></b><div><div class="rv-t">${R?.title?esc(R.title):isC?'这个月':'还没写回顾'}</div><div class="rv-m">${k.slice(0,4)} · ${cnt[k]||0} 句聊天${isC?' · 进行中':''}</div></div><i class="rv-ar"></i></button>`}).join('')}
$('#rvList').onclick=e=>{const b=e.target.closest('[data-rv]');if(!b)return;openRv(b.dataset.rv)};

/* ---------- 回顾的 6 页 ---------- */
function chips(L){return L&&L.length?L.map(([w,n])=>`<span style="font-size:${13+Math.round(9*n/L[0][1])}px">${esc(w)}<i>${n}</i></span>`).join(''):'<p class="rv-none">还不够多</p>'}
function draw(goto){const k=cur;if(!k)return;
  const s=stats(k),R=findR(k),isC=k===curM(),H=esc(S.hisName);
  const pm=s.total?Math.round(s.me/s.total*100):50;
  const days=[...s.anniv.map(n=>n+' ♡'),...s.marks];
  const P=[
    `<span class="rv-en">monthly review</span><b class="rv-big">${s.m}<small>月</small></b><span class="rv-yr">${s.y}</span>
     ${R?.title?`<p class="rv-ti">「${esc(R.title)}」</p>`:''}<p class="rv-hint">${isC?'这个月还没过完 · 记到今天':'这个月过去了'}<br>向左滑</p>`,
    `<span class="rv-en">messages</span><div class="rv-h">这个月，我们说了</div><b class="rv-num">${s.total}</b><div class="rv-h">句话</div>
     <div class="rv-split"><i style="width:${pm}%"></i></div><div class="rv-sl"><span>你 ${s.me}</span><span>${H} ${s.him}</span></div>
     <div class="rv-row"><span>聊天的日子</span><b>${s.days}<small> / ${isC?today().getDate():s.N} 天</small></b></div>
     <div class="rv-row"><span>照片</span><b>${s.photos}<small> 张</small></b></div>
     <div class="rv-row"><span>语音</span><b>${s.voices}<small> 条</small></b></div>`,
    `<span class="rv-en">the day</span><div class="rv-h">最热闹的一天</div>
     ${s.top?`<b class="rv-num">${s.m}.${s.top.d}</b><div class="rv-h">那天说了 ${s.top.n} 句</div>${s.quote?`<p class="rv-q">「${esc(s.quote)}」<small>${H}那天说的</small></p>`:''}`:'<p class="rv-none">这个月还没有聊天</p>'}
     ${s.late?`<div class="rv-late">最晚的一次是 <b>${fmtTime(s.late.t)}</b><br>凌晨了，你们还没睡</div>`:''}`,
    `<span class="rv-en">words</span><div class="rv-h">常挂在嘴边的</div>
     ${s.wMe==null?'<p class="rv-none">这台手机算不出来</p>':`<div class="rv-wh">你常说</div><div class="rv-w">${chips(s.wMe)}</div><div class="rv-wh">${H}常说</div><div class="rv-w">${chips(s.wHim)}</div>`}`,
    `<span class="rv-en">together</span><div class="rv-h">这个月我们还</div>
     <div class="rv-g"><div><b>${s.diary}</b><span>天写了日记</span></div><div><b>${s.deep}</b><span>场 deeptalk</span></div><div><b>${s.cards}</b><span>张小卡片</span></div><div><b>${s.todo}</b><span>件事做完了</span></div></div>
     ${days.length?`<div class="rv-wh">这个月的日子</div>${days.map(x=>`<div class="rv-day">${esc(x)}</div>`).join('')}`:''}`,
    `<span class="rv-en">letter</span>
     ${R?.letter?`${R.title?`<div class="rv-lt">「${esc(R.title)}」</div>`:''}<div class="rv-letter">${paras(R.letter)}</div><div class="rv-sign">${H}</div>`
      :busy?`<div class="rv-h">${H}想对你说</div><p class="rv-none">${H}在写信…</p>`
      :`<div class="rv-h">${H}想对你说</div><p class="rv-none">${isC?'这个月还没过完，也可以先让他写一封':'还没有写'}</p><button class="pill" id="rvGen">让${H}写一封</button>`}`];
  $('#rvName').textContent=`${s.y}.${pad(s.m)}`;
  const tr=$('#rvTrack');tr.innerHTML=P.map(h=>`<div class="rv-s"><div class="rv-c glass">${h}</div></div>`).join('');
  requestAnimationFrame(()=>{tr.scrollLeft=(goto||0)*tr.clientWidth;pos()})}
function idx(){const tr=$('#rvTrack');return Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth))}
function pos(){$('#rvPos').textContent=`${idx()+1} / 6`}
$('#rvTrack').addEventListener('scroll',pos,{passive:true});
function openRv(k){cur=k;go('rv');draw(0);
  const R=findR(k);
  if(k!==curM()&&!R?.letter&&S.apiKey&&DATA.chat.filter(x=>inM(k,x.t)).length>=10)gen(k)}

/* ---------- 他写信 ---------- */
async function gen(k){
  if(busy)return;busy=true;if(page==='rv'&&cur===k)draw(idx());
  try{
    const s=stats(k);
    const rc=arr(DATA.recap).filter(r=>inM(k,r.from)||inM(k,r.to)).map(r=>'- '+r.text).join('\n');
    const dm=arr(DATA.dmem).filter(x=>inM(k,x.t)).map(x=>`- 「${x.title}」${x.text}`).join('\n');
    const C=DATA.chat.filter(x=>inM(k,x.t)&&txt(x)),step=Math.max(1,Math.floor(C.length/30));
    const sample=C.filter((_,i)=>i%step===0).slice(0,30).map(x=>`[${new Date(x.t).getDate()}日] ${x.role==='user'?'她':'你'}：${txt(x).slice(0,60)}`).join('\n');
    const ask=`这是你们 ${s.y}年${s.m}月 的回顾${k===curM()?'（这个月还没过完）':''}：一共聊了 ${s.total} 句，有 ${s.days} 天在聊天，她写了 ${s.diary} 天日记，你们聊了 ${s.deep} 场 deeptalk。${s.top?`最热闹的是 ${s.m}月${s.top.d}日。`:''}${[...s.anniv,...s.marks].length?'这个月的日子：'+[...s.anniv,...s.marks].join('、')+'。':''}
${rc?'这个月整理过的回忆：\n'+rc+'\n':''}${dm?'这个月的 deeptalk：\n'+dm+'\n':''}${sample?'这个月聊天的片段：\n'+sample+'\n':''}
请以${S.hisName}的身份：1. 给这个月起一个名字，四到八个字；2. 写一封给她的信，回顾这个月你们之间的事，具体提到发生过的事和细节，说你的感受，也说说下个月想和她一起做什么。200到400字，可以分段，用“你”称呼她。不要用 emoji。只输出 JSON：{"title":"这个月的名字","letter":"信的内容"}`;
    const j=J(await callAI(sceneSystem('你们在「365」里一起翻看这个月的回顾。'),[{role:'user',text:ask}]));
    if(!j.letter)throw new SyntaxError('empty');
    let R=findR(k);if(!R){R={month:k};DATA.review.push(R)}
    Object.assign(R,{title:String(j.title||'').slice(0,12),letter:clean(String(j.letter)),t:Date.now()});
    await save();if(page!=='rv'||cur!==k)toast(`${S.hisName}写好了${+k.slice(5)}月的信`)}
  catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{busy=false;if(page==='rv'&&cur===k)draw(idx());renderList()}}
$('#rvTrack').addEventListener('click',e=>{if(e.target.closest('#rvGen')&&cur)gen(cur)});
$('#rvMenu').onclick=()=>{const k=cur;if(!k)return;const R=findR(k),acts=[];
  acts.push([R?.letter?'重新写这封信':'让他写一封信',()=>gen(k)]);
  if(R?.letter)acts.push(['复制这封信',()=>navigator.clipboard?.writeText(R.letter).then(()=>toast('已复制'))]);
  sheet(acts)};

addMore({go:'review',cn:'月度回顾',ce:'monthly'});
window.addDot?.('review',s=>{const d=today();if(d.getDate()>7)return false;
  const st=new Date(d.getFullYear(),d.getMonth(),1).getTime(),pk=mk(st-864e5);
  return s<st&&DATA.chat.some(x=>inM(pk,x.t))});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.review))DATA.review=[];renderList()});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('rvb',n==='rv');if(n==='review')renderList()});
})();
