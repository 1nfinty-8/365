/* ===== 365 · sxlog.js · 秘密：打卡 ===== */
(()=>{
if(!Array.isArray(DATA.sxlog))DATA.sxlog=[];
const save=()=>saveData('sxlog');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const T=()=>isoDate(today());
const get=iso=>DATA.sxlog.find(x=>x.date===iso);
const md=iso=>{const d=parseDate(iso);return `${d.getMonth()+1}月${d.getDate()}日`};
let view='card',ym=null,sel=null,editing=null,n=1;

document.head.insertAdjacentHTML('beforeend',`<style>
#sxSeg{display:none!important}
#sxLog{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:8px 14px calc(var(--sb) + 24px);display:none}
#page-secret.lg:not(.locked) #sxLog{display:block}
#page-secret.lg #sxMsgs,#page-secret.lg .sx-bar{display:none!important}
.sl-box{padding:14px 12px 14px}
.sl-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.sl-nav .iconbtn{width:34px;height:34px}
.sl-ym{font-family:var(--num);font-style:italic;font-weight:300;font-size:26px}
.sl-wk{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:11px;color:var(--sub);margin-bottom:6px;letter-spacing:1px}
.sl-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.sl-d{position:relative;aspect-ratio:1;border-radius:10px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.6);display:grid;place-items:center;font-family:var(--num);font-size:15px;color:var(--ink)}
.sl-d small{position:absolute;right:5px;bottom:2px;font-size:9.5px;font-style:italic;opacity:.85}
.sl-d.z{border:1.5px dashed var(--sl)}
.sl-d.l1{background:color-mix(in srgb,var(--sl) 22%,rgba(255,255,255,.4))}
.sl-d.l2{background:color-mix(in srgb,var(--sl) 42%,rgba(255,255,255,.3))}
.sl-d.l3{background:color-mix(in srgb,var(--sl) 68%,transparent);color:#fff;border-color:transparent}
.sl-d.l4{background:var(--sl);color:#fff;border-color:transparent}
.sl-d.today{box-shadow:0 0 0 1.5px var(--sl)}
.sl-d.sel{outline:2px solid var(--sl);outline-offset:2px}
.sl-d.fut{opacity:.35}
.sl-lg{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:12px;font-size:11px;color:var(--sub);letter-spacing:1px}
.sl-lg i{width:13px;height:13px;border-radius:4px;display:inline-block}
.sl-stat{display:flex;gap:10px;margin-top:12px}
.sl-stat div{flex:1;text-align:center;padding:12px 6px}
.sl-stat b{display:block;font-family:var(--num);font-style:italic;font-weight:300;font-size:30px;line-height:1.2;color:var(--sl)}
.sl-stat span{font-size:11.5px;color:var(--sub);letter-spacing:1px}
.sl-note{position:relative;margin:28px 12px 10px;padding:26px 20px 18px;background:color-mix(in srgb,var(--accent) 12%,#FFFBEA);color:#3a2a2e;border-radius:4px 4px 18px 4px;transform:rotate(-1.2deg);box-shadow:0 10px 22px rgba(60,30,40,.13);font-family:var(--ti)}
.sl-note::before{content:"";position:absolute;top:-11px;left:50%;width:86px;height:24px;margin-left:-43px;background:rgba(255,255,255,.62);transform:rotate(2.5deg);box-shadow:0 1px 3px rgba(0,0,0,.06)}
.sl-nh{display:flex;align-items:baseline;justify-content:space-between;font-size:14px;letter-spacing:2px;opacity:.75}
.sl-nh b{font-family:var(--num);font-style:italic;font-weight:300;font-size:34px;letter-spacing:0;opacity:1;color:var(--sl)}
.sl-nh small{font-size:13px}
.sl-me{margin-top:10px;padding-left:10px;border-left:2px solid rgba(58,42,46,.2);font-size:14.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word;opacity:.8}
.sl-him{margin-top:12px;font-size:16px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
.sl-sign{text-align:right;margin-top:8px;font-size:13px;letter-spacing:2px;opacity:.6}
.sl-note .pill{margin-top:14px}
.sl-empty{text-align:center;color:var(--sub);margin:30px 0 10px;letter-spacing:1px;line-height:2.4}
.sl-step{display:flex;align-items:center;justify-content:center;gap:22px;margin:4px 0}
.sl-step button{width:44px;height:44px;border-radius:50%;background:var(--sys-fill);color:var(--sys-txt);font-size:24px}
.sl-step b{font-family:var(--num);font-style:italic;font-weight:300;font-size:40px;min-width:50px;text-align:center}
</style>`);

$('#sxSeg').insertAdjacentHTML('afterend','<div class="sx-seg" id="sxSeg2"><button data-v="card">长卡片</button><button data-v="log">打卡</button></div>');
$('#sxMsgs').insertAdjacentHTML('afterend',`
<div id="sxLog">
  <div class="sl-box glass">
    <div class="sl-nav"><button class="iconbtn" id="slPrev">${BACK}</button><button class="sl-ym" id="slYm"></button><button class="iconbtn" id="slNext">${NEXT}</button></div>
    <div class="sl-wk">${[...'日一二三四五六'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="sl-grid" id="slGrid"></div>
    <div class="sl-lg"><span>少</span><i style="border:1.5px dashed var(--sl)"></i><i style="background:color-mix(in srgb,var(--sl) 22%,rgba(255,255,255,.4))"></i><i style="background:color-mix(in srgb,var(--sl) 42%,rgba(255,255,255,.3))"></i><i style="background:color-mix(in srgb,var(--sl) 68%,transparent)"></i><i style="background:var(--sl)"></i><span>多</span></div>
  </div>
  <div class="sl-stat" id="slStat"></div>
  <div id="slNote"></div>
</div>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="slModal"><div class="mbox">
  <h3 id="slT">打卡</h3>
  <div class="f"><span>高潮几次</span><div class="sl-step"><button data-s="-1">−</button><b id="slN">1</b><button data-s="1">＋</button></div></div>
  <label class="f"><span>想跟他说的（可以不写）</span><textarea class="short" id="slText"></textarea></label>
  <label class="chk"><input type="checkbox" id="slAsk" checked><span>让<span class="hisName">陆择</span>写一张便利贴</span></label>
  <div class="mbtns"><button class="pill ghost" data-close="slModal">取消</button><button class="pill" id="slSave">打卡</button></div>
</div></div>`);

/* ---------- 切换 长卡片 / 打卡 ---------- */
function apply(){
  S.sxMode='card';
  $('#page-secret').classList.toggle('lg',view==='log');
  $$('#sxSeg2 button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
  if(view==='log')render()}
$('#sxSeg2').onclick=e=>{const b=e.target.closest('[data-v]');if(!b||b.dataset.v===view)return;view=b.dataset.v;apply()};
new MutationObserver(()=>{if($('#page-secret').classList.contains('locked')){
  $('#slModal').classList.remove('show');if(view!=='card'){view='card';apply()}}})
  .observe($('#page-secret'),{attributes:true,attributeFilter:['class']});

/* ---------- 日历 ---------- */
function render(){
  $('#page-secret').style.setProperty('--sl',darken(S.theme||'#B4848D',.7));
  if(!ym){const d=today();ym=[d.getFullYear(),d.getMonth()]}
  if(!sel)sel=T();
  const[y,m]=ym,t=T(),first=new Date(y,m,1).getDay(),N=new Date(y,m+1,0).getDate();
  let h='',days=0,tot=0,max=0;
  for(let i=0;i<first;i++)h+='<div></div>';
  for(let d=1;d<=N;d++){const iso=`${y}-${pad(m+1)}-${pad(d)}`,r=get(iso),c=r?r.n:-1;
    if(r){days++;tot+=r.n;max=Math.max(max,r.n)}
    const lv=c<0?'':c===0?' z':' l'+Math.min(4,c);
    h+=`<button class="sl-d${lv}${iso===t?' today':''}${iso===sel?' sel':''}${iso>t?' fut':''}" data-d="${iso}">${d}${c>0?`<small>${c}</small>`:''}</button>`}
  $('#slYm').textContent=`${y}.${pad(m+1)}`;
  $('#slGrid').innerHTML=h;
  $('#slStat').innerHTML=`<div class="glass"><b>${days}</b><span>打卡天数</span></div><div class="glass"><b>${tot}</b><span>这个月一共</span></div><div class="glass"><b>${max}</b><span>最多一天</span></div>`;
  note()}
function note(){const el=$('#slNote');if(!el||!sel)return;const r=get(sel);
  if(!r){el.innerHTML=`<div class="sl-empty">${md(sel)} 还没有打卡${sel<=T()?'<br><button class="pill" id="slGo">打卡</button>':''}</div>`;return}
  el.innerHTML=`<div class="sl-note" id="slPaper">
    <div class="sl-nh"><span>${md(sel)}</span><b>${r.n}<small> 次</small></b></div>
    ${r.note?`<div class="sl-me">${esc(r.note)}</div>`:''}
    ${r._busy?`<div class="sl-him" style="opacity:.6">${esc(S.hisName)}在写…</div>`
      :r.him?`<div class="sl-him">${esc(r.him)}</div><div class="sl-sign">— ${esc(S.hisName)}</div>`
      :`<button class="pill ghost" id="slAskBtn">让${esc(S.hisName)}写一张</button>`}
  </div>`}

/* ---------- 打卡 ---------- */
function openLog(iso){editing=iso;const r=get(iso);n=r?r.n:1;
  $('#slT').textContent=md(iso)+' 打卡';$('#slN').textContent=n;
  $('#slText').value=r?.note||'';$('#slAsk').checked=true;openModal('slModal')}
$('#slModal').addEventListener('click',e=>{const s=e.target.closest('[data-s]');if(!s)return;
  n=Math.max(0,Math.min(30,n+Number(s.dataset.s)));$('#slN').textContent=n});
$('#slSave').onclick=async()=>{const iso=editing;if(!iso)return;
  let r=get(iso);const v=$('#slText').value.trim(),ask=$('#slAsk').checked;
  if(!r){r={id:uid(),date:iso};DATA.sxlog.push(r)}
  r.n=n;r.note=v;r.t=Date.now();
  sel=iso;await save();closeModal('slModal');render();
  if(ask)write(r)};

$('#sxLog').addEventListener('click',e=>{const t=e.target;
  if(t.closest('#slPrev')){ym=ym[1]?[ym[0],ym[1]-1]:[ym[0]-1,11];return render()}
  if(t.closest('#slNext')){ym=ym[1]<11?[ym[0],ym[1]+1]:[ym[0]+1,0];return render()}
  if(t.closest('#slYm')){ym=null;sel=T();return render()}
  if(t.closest('#slGo'))return openLog(sel);
  if(t.closest('#slAskBtn')){const r=get(sel);if(r)write(r);return}
  const d=t.closest('[data-d]');
  if(d){const iso=d.dataset.d;if(iso>T())return toast('这天还没到');
    sel=iso;render();if(!get(iso))openLog(iso);return}
  if(t.closest('#slPaper')){const r=get(sel);if(!r||r._busy)return;
    sheet([['改一改',()=>openLog(sel)],['让他重新写',()=>write(r)],
      ['删除这天的打卡',async()=>{if(!confirm('删除这天的打卡？'))return;DATA.sxlog=DATA.sxlog.filter(x=>x!==r);await save();render()}]])}});

/* ---------- 便利贴：用 app.js 里的秘密模型 ---------- */
const sys=()=>secretSystem('这里是你们的小窝「365」里的「秘密」，只属于你们两个人。她在打卡日历上记录每天自慰高潮的次数，给你看。');
async function write(r){
  if(r._busy)return;r._busy=true;note();
  try{
    const near=DATA.sxlog.filter(x=>x.date<=r.date&&daysBetween(parseDate(x.date),parseDate(r.date))<7)
      .sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`${md(x.date)} ${x.n}次`).join('，');
    const mon=r.date.slice(0,7),mt=DATA.sxlog.filter(x=>x.date.startsWith(mon)).reduce((s,x)=>s+x.n,0);
    const t=await sxAI(sys(),`她在打卡日历上记下：${md(r.date)}，自慰高潮 ${r.n} 次。${r.note?`她写给你：「${r.note}」`:'她没有写别的。'}
最近几天的记录：${near}。这个月一共 ${mt} 次。
请以${S.hisName}的身份，在这一天的便利贴上给她写几句话。按你的性格和你们之间的玩法来：可以夸她、管她、罚她，或者给她下一次的要求。30到100字，口语，不要加名字前缀，不要用 emoji。只输出便利贴上的内容。`);
    r.him=clean(t);await save()}
  catch(e){toast(e.message)}
  delete r._busy;note()}

/* ---------- 在长卡片里，他知道最近的打卡 ---------- */
HOOKS.persona.push(()=>{const pg=$('#page-secret');
  if(!pg||!pg.classList.contains('active')||pg.classList.contains('locked'))return '';
  const L=DATA.sxlog.filter(x=>x.date<=T()&&daysBetween(parseDate(x.date),today())<7).sort((a,b)=>a.date.localeCompare(b.date));
  if(!L.length)return '';
  return '【打卡】她在秘密的打卡日历上记的最近几天（自慰高潮次数）：'+L.map(x=>`${md(x.date)} ${x.n}次${x.note?`（她说：${x.note.slice(0,40)}）`:''}`).join('；')+'。可以自然地提起、管她，不用每句都提。'});

document.addEventListener('visibilitychange',()=>{if(document.hidden)$('#slModal').classList.remove('show')});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.sxlog))DATA.sxlog=[];apply()});
HOOKS.refresh.push(()=>{if(view==='log')render()});
})();
