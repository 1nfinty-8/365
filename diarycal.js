/* ===== 365 · diarycal.js · 日记进度 + 日记日历 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const dOf=x=>x.date||isoDate(new Date(x.t));
const days=()=>new Set((DATA.diary||[]).map(dOf));
let ym=null;

document.head.insertAdjacentHTML('beforeend',`<style>
.dc-sum{display:block;width:100%;text-align:left;padding:14px 18px;margin-bottom:14px}
.dc-r{display:flex;align-items:baseline;gap:6px;font-size:14px;letter-spacing:1px}
.dc-r b{font-family:var(--num);font-style:italic;font-weight:300;font-size:34px;line-height:1;color:var(--dd)}
.dc-r em{margin-left:auto;font-family:var(--num);font-style:italic;color:var(--sub)}
.dc-arr{width:7px;height:7px;border-right:1.5px solid var(--sub);border-bottom:1.5px solid var(--sub);transform:rotate(-45deg);margin-left:8px;align-self:center}
.dc-track{height:8px;border-radius:8px;background:rgba(46,26,31,.08);margin-top:10px;overflow:hidden}
.dc-track i{display:block;height:100%;border-radius:8px;background:var(--dd);transition:width .8s}
.dc-s{font-size:12px;color:var(--sub);margin-top:6px;letter-spacing:1px}
.dc-box{padding:14px 12px 16px}
.dc-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.dc-nav .iconbtn{width:34px;height:34px}
.dc-ym{font-family:var(--num);font-style:italic;font-weight:300;font-size:26px}
.dc-wk{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:11px;color:var(--sub);margin-bottom:6px;letter-spacing:1px}
.dc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.dc-d{aspect-ratio:1;border-radius:10px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.6);display:grid;place-items:center;font-family:var(--num);font-size:15px;color:var(--ink)}
.dc-d.on{background:var(--dd);color:var(--ddt);border-color:transparent}
.dc-d.today{box-shadow:0 0 0 1.5px var(--dd)}
.dc-d.on.today{box-shadow:0 0 0 2px var(--dd),inset 0 0 0 2px rgba(255,255,255,.7)}
.dc-d.fut{opacity:.35}
.dc-stat{display:flex;gap:10px;margin-top:12px}
.dc-stat div{flex:1;text-align:center;padding:12px 6px}
.dc-stat b{display:block;font-family:var(--num);font-style:italic;font-weight:300;font-size:30px;line-height:1.2;color:var(--dd)}
.dc-stat span{font-size:11.5px;color:var(--sub);letter-spacing:1px}
.dcv-t{white-space:pre-wrap;word-break:break-word;font-family:var(--ti);line-height:1.8;font-size:15.5px;color:var(--sys-txt);margin:8px 0}
#dcVBody{max-height:55vh;overflow-y:auto}
</style>`);

$('#dyList').insertAdjacentHTML('beforebegin','<button class="dc-sum glass" id="dcSum" data-go="dycal"></button>');
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-dycal"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="diary" aria-label="返回">${BACK}</button>
    <h2>日记日历</h2><em>diary</em>
  </div>
  <div class="dc-box glass">
    <div class="dc-nav"><button class="iconbtn" id="dcPrev">${BACK}</button><button class="dc-ym" id="dcYm"></button><button class="iconbtn" id="dcNext">${NEXT}</button></div>
    <div class="dc-wk">${[...'日一二三四五六'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="dc-grid" id="dcGrid"></div>
  </div>
  <div class="dc-stat" id="dcStat"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="dcView"><div class="mbox">
  <h3 id="dcVT"></h3>
  <div id="dcVBody"></div>
  <div class="mbtns"><button class="pill ghost" data-close="dcView">关闭</button><button class="pill" id="dcVGo">去日记里看</button></div>
</div></div>`);

function color(){const dd=darken(S.theme||'#B4848D',.75),r=document.documentElement.style;
  r.setProperty('--dd',dd);r.setProperty('--ddt',onText(dd))}

/* ---------- 进度条 ---------- */
function renderSum(){color();
  const t=today(),y=t.getFullYear(),m=t.getMonth(),n=new Date(y,m+1,0).getDate(),D=days();
  let w=0;for(let d=1;d<=n;d++)if(D.has(`${y}-${pad(m+1)}-${pad(d)}`))w++;
  const pct=Math.round(w/n*100);
  $('#dcSum').innerHTML=`<div class="dc-r"><span>${m+1}月 · 写了</span><b>${w}</b><span>/ ${n} 天</span><em>${pct}%</em><i class="dc-arr"></i></div>
    <div class="dc-track"><i style="width:${pct}%"></i></div>
    <div class="dc-s">${D.has(isoDate(t))?'今天写过了 ♡':'今天还没写'}</div>`}

/* ---------- 日历 ---------- */
function streak(D){const d=today();let c=0;if(!D.has(isoDate(d)))d.setDate(d.getDate()-1);
  while(D.has(isoDate(d))){c++;d.setDate(d.getDate()-1)}return c}
function render(){color();
  if(!ym){const d=today();ym=[d.getFullYear(),d.getMonth()]}
  const[y,m]=ym,D=days(),t=isoDate(today());
  $('#dcYm').textContent=`${y}.${pad(m+1)}`;
  const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  let h='',w=0;for(let i=0;i<first;i++)h+='<div></div>';
  for(let d=1;d<=n;d++){const iso=`${y}-${pad(m+1)}-${pad(d)}`,on=D.has(iso);if(on)w++;
    h+=`<button class="dc-d${on?' on':''}${iso===t?' today':''}${iso>t?' fut':''}" data-d="${iso}">${d}</button>`}
  $('#dcGrid').innerHTML=h;
  $('#dcStat').innerHTML=`<div class="glass"><b>${w}</b><span>这个月</span></div><div class="glass"><b>${D.size}</b><span>一共写了</span></div><div class="glass"><b>${streak(D)}</b><span>连续天数</span></div>`}
$('#dcPrev').onclick=()=>{ym=ym[1]?[ym[0],ym[1]-1]:[ym[0]-1,11];render()};
$('#dcNext').onclick=()=>{ym=ym[1]<11?[ym[0],ym[1]+1]:[ym[0]+1,0];render()};
$('#dcYm').onclick=()=>{ym=null;render()};

/* ---------- 点某一天 ---------- */
function view(iso,L){const d=parseDate(iso);
  $('#dcVT').textContent=`${d.getMonth()+1}月${d.getDate()}日`;
  const box=$('#dcVBody');
  box.innerHTML=L.map(x=>`${x.mood?`<div style="font-size:24px;text-align:center">${esc(x.mood)}</div>`:''}<div class="dcv-t">${esc(x.text||'')}</div>${x.images?.length?`<div class="pimgs n${Math.min(x.images.length,3)}">${x.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:''}`).join('<hr style="border:0;border-top:.5px solid var(--sys-sep);margin:10px 0">');
  IMG.hydrate(box);openModal('dcView')}
function write(iso){go('diary');$('#dyAdd')?.click();
  setTimeout(()=>{const i=$('#dyDate');if(!i)return;i.value=iso;
    i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))},80)}
$('#dcGrid').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;const iso=b.dataset.d;
  const L=(DATA.diary||[]).filter(x=>dOf(x)===iso);
  if(L.length)return view(iso,L);
  if(iso>isoDate(today()))return toast('这天还没到');
  sheet([['写这天的日记',()=>write(iso)]])};
$('#dcVGo').onclick=()=>{closeModal('dcView');go('diary')};

new MutationObserver(renderSum).observe($('#dyList'),{childList:true});
HOOKS.ready.push(renderSum);
HOOKS.refresh.push(renderSum);
HOOKS.page.push(n=>{if(n==='diary')renderSum();if(n==='dycal'){ym=null;render()}});
})();
