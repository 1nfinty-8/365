/* ===== 365 · calendar.js · 日历 + 生理期 ===== */
(()=>{
if(!Array.isArray(DATA.period))DATA.period=[];
if(!Array.isArray(DATA.marks))DATA.marks=[];
const add=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return isoDate(d)};
const diff=(a,b)=>daysBetween(parseDate(a),parseDate(b));
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
const T=()=>isoDate(today());
const dt=s=>s.slice(5).replace('-','.');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
let ym=null,mkEdit=null;

document.head.insertAdjacentHTML('beforeend',`<style>
.cal-sum{padding:16px 18px;margin-bottom:12px}
.cal-r1{display:flex;align-items:center;gap:12px}
.cal-sum .l{flex:1;min-width:0}
.cal-sum .t{font-size:16px;letter-spacing:2px}
.cal-sum .s{font-size:12px;color:var(--sub);margin-top:3px;letter-spacing:1px}
.cal-sum .r{text-align:right;flex:none}
.cal-sum .p{font-size:11px;color:var(--sub)}
.cal-sum .n{font-family:var(--num);font-style:italic;font-weight:300;font-size:44px;line-height:1.05;letter-spacing:-1px;color:var(--pd)}
.cal-q{display:flex;gap:8px;margin-top:12px}
.cal-q .pill{flex:1;padding:10px 0;font-size:14px;letter-spacing:2px;background:var(--pd);color:var(--pdt)}
.cal-box{padding:14px 10px 12px;margin-bottom:14px}
.cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.cal-nav .iconbtn{width:34px;height:34px}
.cal-ym{font-family:var(--num);font-style:italic;font-weight:300;font-size:26px;letter-spacing:1px}
.cal-wk{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:11px;color:var(--sub);margin-bottom:4px;letter-spacing:1px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);row-gap:2px}
.cal-d{position:relative;aspect-ratio:1;display:grid;place-items:center;font-family:var(--num);font-size:16px}
.cal-d span{position:relative;z-index:1;width:34px;height:34px;display:grid;place-items:center;border-radius:50%}
.cal-d i{font-style:normal}
.cal-d.today span{box-shadow:inset 0 0 0 1.5px var(--accent-t)}
.cal-d.pd{color:var(--pdt)}
.cal-d.pd::before{content:"";position:absolute;top:5px;bottom:5px;left:0;right:0;background:var(--pd)}
.cal-d.pd.ps::before{left:4px;border-radius:10px 0 0 10px}
.cal-d.pd.pe::before{right:4px;border-radius:0 10px 10px 0}
.cal-d.pd.ps.pe::before{border-radius:10px}
.cal-d.pd.today span{box-shadow:inset 0 0 0 1.5px var(--pdt)}
.cal-d.pp::before{content:"";position:absolute;top:5px;bottom:5px;left:4px;right:4px;border:1.5px dashed var(--pd);border-radius:10px;opacity:.75}
.cal-m{position:absolute;z-index:1;bottom:7px;left:50%;margin-left:-2px;width:4px;height:4px;border-radius:50%;background:var(--accent-t)}
.cal-d.pd .cal-m{background:var(--pdt)}
.cal-a{position:absolute;z-index:1;top:4px;right:5px;font-size:9px;color:var(--accent-t)}
.cal-d.pd .cal-a{color:var(--pdt)}
.cal-lg{display:flex;justify-content:center;gap:14px;margin-top:10px;font-size:11px;color:var(--sub);flex-wrap:wrap;letter-spacing:1px}
.cal-lg i{display:inline-block;width:12px;height:9px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.cal-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin:6px 4px 8px}
.cal-it{display:flex;gap:12px;align-items:baseline;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px}
.cal-it b{font-family:var(--num);font-style:italic;font-weight:300;font-size:22px;min-width:34px}
.cal-it span{flex:1;letter-spacing:1px}
.cal-it small{color:var(--sub);font-size:12px}
#calTips{display:flex;flex-direction:column;align-items:center;gap:1px;margin-top:8px}
#calTips:empty{display:none}
#hmTips:not(:empty)+#calTips{margin-top:1px}
#calTips button{font-size:12.5px;color:var(--sub);letter-spacing:1.5px;padding:2px 10px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cal"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>日历</h2><em>calendar</em>
  </div>
  <div class="cal-sum glass" id="calSum"></div>
  <div class="cal-box glass">
    <div class="cal-nav"><button class="iconbtn" id="calPrev">${BACK}</button><button class="cal-ym" id="calYm"></button><button class="iconbtn" id="calNext">${NEXT}</button></div>
    <div class="cal-wk">${[...'日一二三四五六'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="cal-grid" id="calGrid"></div>
    <div class="cal-lg"><span><i style="background:var(--pd)"></i>生理期</span><span><i style="border:1.5px dashed var(--pd)"></i>预计</span><span><i style="background:var(--accent-t);width:5px;height:5px;border-radius:50%"></i>特殊日子</span><span>♡ 纪念日</span></div>
  </div>
  <div id="calMonth"></div>
  <div id="calHist"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="calMk"><div class="mbox">
  <h3 id="calMkT">特殊日子</h3>
  <label class="f"><span>日期</span><input type="date" id="calMkD"></label>
  <label class="f"><span>这一天是</span><input class="ti" id="calMkX" placeholder="比如：第一次视频"></label>
  <div class="mbtns"><button class="pill ghost" data-close="calMk">取消</button><button class="pill" id="calMkS">保存</button></div>
</div></div>`);
($('#hmTips')||$('#since')).insertAdjacentHTML('afterend','<div id="calTips"></div>');

/* ---------- 计算 ---------- */
function info(){
  const P=[...DATA.period].sort((a,b)=>a.start.localeCompare(b.start)),t=T();
  const gaps=[];for(let i=1;i<P.length;i++){const d=diff(P[i-1].start,P[i].start);if(d>=18&&d<=60)gaps.push(d)}
  const cycle=gaps.length?avg(gaps.slice(-6)):28;
  const lens=P.filter(p=>p.end).map(p=>diff(p.start,p.end)+1).filter(n=>n>=2&&n<=10).slice(-6);
  const plen=lens.length?avg(lens):5;
  const endOf=p=>p.end||(diff(p.start,t)>=0&&diff(p.start,t)<10?(t>add(p.start,plen-1)?t:add(p.start,plen-1)):add(p.start,plen-1));
  const last=P.at(-1);
  const cur=last&&t>=last.start&&t<=endOf(last)?last:null;
  const next=last?add(last.start,cycle):null;
  return {P,cycle,plen,endOf,last,cur,next,t}}
const isPeriod=(iso,I)=>I.P.some(p=>iso>=p.start&&iso<=I.endOf(p));
function predicted(iso,I){
  if(!I.next||iso<I.t||isPeriod(iso,I))return false;
  for(let k=0;k<6;k++){const s=add(I.next,k*I.cycle);if(iso<s)return false;if(iso<=add(s,I.plen-1))return true}
  return false}
function status(I){
  if(!I.last)return {t:'还没有记录',s:'来了就点下面的按钮'};
  if(I.cur)return {t:'照顾好自己',s:I.cur.end?`${dt(I.cur.end)} 结束`:'结束那天点「生理期结束了」',p:'生理期第',n:diff(I.cur.start,I.t)+1,u:'天'};
  const left=diff(I.t,I.next);
  if(left>0)return {t:'下一次生理期',s:`预计 ${dt(I.next)} · 周期约 ${I.cycle} 天`,p:'大约还有',n:left,u:'天',left};
  if(left===0)return {t:'预计就是今天',s:'来了记得点一下',n:'♡',left};
  return {t:'比预计晚了',s:`预计是 ${dt(I.next)}`,p:'晚了',n:-left,u:'天',left}}

/* ---------- 画日历 ---------- */
function annivMap(y,m){const map={},last=new Date(y,m+1,0).getDate();
  for(const a of DATA.anniv||[]){const[ay,am,ad]=String(a.date||'').split('-').map(Number);
    if(am-1!==m)continue;
    if(a.type==='yearly'||ay===y){const d=Math.min(ad,last);(map[d]=map[d]||[]).push(a.name)}}
  return map}
function render(){
  if(!ym){const d=today();ym=[d.getFullYear(),d.getMonth()]}
  const pd=darken(S.theme||'#B4848D',.75),pg=$('#page-cal');
  pg.style.setProperty('--pd',pd);pg.style.setProperty('--pdt',onText(pd));
  const[y,m]=ym,I=info(),st=status(I);
  const q=[];
  if(I.cur){if(I.t>I.cur.start&&I.cur.end!==I.t)q.push(['end','今天结束了'])}
  else q.push(['start','今天来了']);
  $('#calSum').innerHTML=`<div class="cal-r1"><div class="l"><div class="t">${st.t}</div><div class="s">${st.s}</div></div>${st.n!=null?`<div class="r">${st.p?`<div class="p">${st.p}</div>`:''}<div class="n">${st.n}</div>${st.u?`<div class="p">${st.u}</div>`:''}</div>`:''}</div>
    ${q.length?`<div class="cal-q">${q.map(([k,n])=>`<button class="pill" data-q="${k}">${n}</button>`).join('')}</div>`:''}
    <p class="hint">补记以前的：点日历上那一天</p>`;
  $('#calYm').textContent=`${y}.${pad(m+1)}`;
  const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),an=annivMap(y,m);
  let h='';for(let i=0;i<first;i++)h+='<div></div>';
  for(let d=1;d<=n;d++){const iso=`${y}-${pad(m+1)}-${pad(d)}`,col=(first+d-1)%7;
    let c='';
    if(isPeriod(iso,I)){const pv=d>1&&col>0&&isPeriod(add(iso,-1),I),nx=d<n&&col<6&&isPeriod(add(iso,1),I);c='pd'+(pv?'':' ps')+(nx?'':' pe')}
    else if(predicted(iso,I))c='pp';
    if(iso===I.t)c+=' today';
    const mk=DATA.marks.some(x=>x.date===iso);
    h+=`<button class="cal-d ${c}" data-d="${iso}"><span>${d}</span>${an[d]?'<i class="cal-a">♡</i>':''}${mk?'<i class="cal-m"></i>':''}</button>`}
  $('#calGrid').innerHTML=h;
  const pre=`${y}-${pad(m+1)}-`;
  const items=[...DATA.marks.filter(x=>x.date.startsWith(pre)).map(x=>({d:+x.date.slice(8),x:x.text,id:x.id})),
    ...Object.entries(an).flatMap(([d,ns])=>ns.map(nm=>({d:+d,x:nm,a:1})))].sort((a,b)=>a.d-b.d);
  $('#calMonth').innerHTML=items.length?`<div class="cal-h">这个月</div>`+items.map(it=>
    `<button class="cal-it glass"${it.id?` data-mk="${it.id}"`:''}${it.a?' data-go="anniv"':''}><b>${it.d}</b><span>${esc(it.x)}</span>${it.a?'<small>纪念日 ♡</small>':''}</button>`).join(''):'';
  const H=[...I.P].reverse().slice(0,6);
  $('#calHist').innerHTML=H.length?`<div class="cal-h">最近几次 · 周期约 ${I.cycle} 天 · 每次约 ${I.plen} 天</div>`+H.map(p=>{
    const e=p.end||(p===I.cur?'':I.endOf(p));
    return `<button class="cal-it glass" data-pid="${p.id}"><b style="font-size:17px;min-width:auto">${p.start.slice(0,4)}</b><span>${dt(p.start)} – ${e?dt(e):'进行中'}</span><small>${e?diff(p.start,e)+1+' 天':''}</small></button>`}).join(''):'';
}

/* ---------- 生理期 ---------- */
const sv=async()=>{await saveData('period');render();renderTips()};
async function startAt(iso){const I=info();
  const open=I.P.filter(x=>x.start<iso&&!x.end).at(-1);
  if(open){const e=I.endOf(open);open.end=e<iso?e:add(iso,-1)}
  DATA.period.push({id:uid(),start:iso});await sv();toast('记下了，照顾好自己 ♡')}
$('#calSum').onclick=async e=>{const b=e.target.closest('[data-q]');if(!b)return;const I=info();
  if(b.dataset.q==='start')await startAt(I.t);
  else if(I.cur){I.cur.end=I.t;await sv();toast('记下了 ♡')}};
function dayMenu(iso){
  const I=info(),acts=[];
  const p=I.P.find(x=>iso>=x.start&&iso<=I.endOf(x));
  const before=I.P.filter(x=>x.start<iso).at(-1);
  if(p){
    if(iso>p.start)acts.push(['生理期结束了（生理期最后一天）',async()=>{p.end=iso;await sv();toast('记下了 ♡')}]);
    acts.push(['删除这次生理期记录',async()=>{if(!confirm('删除这次生理期记录？'))return;DATA.period=DATA.period.filter(x=>x!==p);await sv()}]);
  }else if(iso<=I.t){
    acts.push(['生理期来了（生理期开始）',()=>startAt(iso)]);
    if(before&&diff(before.start,iso)<=14)acts.push(['这天结束了（生理期最后一天）',async()=>{before.end=iso;await sv();toast('记下了 ♡')}]);
  }
  acts.push(['记一个特殊日子',()=>openMark(iso)]);
  acts.push(['记一个纪念日',()=>openAnniv(iso)]);
  DATA.marks.filter(x=>x.date===iso).forEach(mk=>{
    acts.push([`编辑「${mk.text}」`,()=>openMark(iso,mk)]);
    acts.push([`删除「${mk.text}」`,()=>delMark(mk)])});
  sheet(acts)}
$('#calGrid').onclick=e=>{const b=e.target.closest('[data-d]');if(b)dayMenu(b.dataset.d)};
$('#calPrev').onclick=()=>{ym=ym[1]?[ym[0],ym[1]-1]:[ym[0]-1,11];render()};
$('#calNext').onclick=()=>{ym=ym[1]<11?[ym[0],ym[1]+1]:[ym[0]+1,0];render()};
$('#calYm').onclick=()=>{ym=null;render()};

/* ---------- 纪念日：用纪念日原来的窗口 ---------- */
function openAnniv(iso){const b=$('#anAdd');if(!b)return toast('没找到纪念日');
  b.click();
  setTimeout(()=>{const d=$('#anDate');if(!d)return;d.value=iso;
    d.dispatchEvent(new Event('input',{bubbles:true}));d.dispatchEvent(new Event('change',{bubbles:true}))},80)}
const anM=$('#anModal');
if(anM)new MutationObserver(()=>{if(!anM.classList.contains('show')&&$('#page-cal').classList.contains('active'))render()})
  .observe(anM,{attributes:true,attributeFilter:['class']});

/* ---------- 特殊日子 ---------- */
function openMark(iso,mk){mkEdit=mk||null;
  $('#calMkT').textContent=mk?'改一改':'特殊日子';
  $('#calMkD').value=mk?.date||iso;$('#calMkX').value=mk?.text||'';openModal('calMk')}
async function delMark(mk){if(!confirm(`删除「${mk.text}」？`))return;
  DATA.marks=DATA.marks.filter(x=>x!==mk);await saveData('marks');render();renderTips()}
$('#calMkS').onclick=async()=>{
  const text=$('#calMkX').value.trim(),date=$('#calMkD').value;
  if(!text)return toast('写一下这天是什么日子');if(!date)return toast('选一个日期');
  if(mkEdit)Object.assign(mkEdit,{text,date});else DATA.marks.push({id:uid(),date,text});
  await saveData('marks');closeModal('calMk');render();renderTips();toast('记下了 ♡')};
$('#calMonth').onclick=e=>{const b=e.target.closest('[data-mk]');if(!b)return;
  const mk=DATA.marks.find(x=>x.id===b.dataset.mk);if(!mk)return;
  sheet([['编辑',()=>openMark(mk.date,mk)],['删除这个日子',()=>delMark(mk)]])};
$('#calHist').onclick=e=>{const b=e.target.closest('[data-pid]');if(!b)return;
  const p=DATA.period.find(x=>x.id===b.dataset.pid);if(!p)return;
  sheet([['删除这次记录',async()=>{if(!confirm('删除这次生理期记录？'))return;DATA.period=DATA.period.filter(x=>x!==p);await sv()}]])};

/* ---------- 首页提醒 ---------- */
function renderTips(){const el=$('#calTips');if(!el)return;
  const I=info(),st=status(I),L=[];
  if(I.cur)L.push(`生理期第 ${st.n} 天，照顾好自己`);
  else if(I.last&&st.left!=null){
    if(st.left>0&&st.left<=2)L.push(`生理期大概还有 ${st.left} 天，少吃冰的`);
    else if(st.left===0)L.push('生理期大概就是今天');
    else if(st.left<0&&-st.left<=10)L.push(`生理期比预计晚了 ${-st.left} 天`)}
  DATA.marks.filter(x=>x.date===I.t).forEach(x=>L.push(`今天是「${esc(x.text)}」`));
  el.innerHTML=L.map(s=>`<button data-go="cal">${s}</button>`).join('')}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderTips()});

/* ---------- 让陆择知道 ---------- */
HOOKS.context.push(()=>{const I=info(),st=status(I),out=[];
  if(I.cur)out.push(`【她的身体】她现在是生理期第${st.n}天。多心疼她，提醒她别吃冰的、注意保暖，肚子疼就让她休息。不用每句都提。`);
  else if(I.last&&st.left!=null&&st.left>=0&&st.left<=3)out.push(`【她的身体】她的生理期大概还有${st.left}天就来了（预测，可能不准）。可以自然地提醒她少吃冰的、早点睡。不用每句都提。`);
  const mk=DATA.marks.filter(x=>x.date===I.t).map(x=>`「${x.text}」`);
  if(mk.length)out.push(`【今天】是她在日历上标记的${mk.join('、')}。`);
  return out.join('\n')});

addMore({go:'cal',cn:'日历',ce:'calendar'});
HOOKS.ready.push(()=>{render();renderTips()});
HOOKS.refresh.push(renderTips);
HOOKS.page.push(n=>{if(n==='cal'){ym=null;render()}if(n==='home')renderTips()});
})();
