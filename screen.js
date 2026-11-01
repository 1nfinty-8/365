/* ===== 365 · screen.js · 屏幕使用时间 ===== */
(()=>{
if(!Array.isArray(DATA.screen))DATA.screen=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('screen'))LISTS.push('screen');
const save=()=>saveData('screen');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const NEXT='<svg class="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const WK='日一二三四五六';
const T=()=>isoDate(today());
const shift=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return isoDate(d)};
const get=s=>DATA.screen.find(x=>x.date===s);
const make=s=>{let d=get(s);if(!d){d={id:uid(),date:s,images:[],mins:null,apps:'',notes:[],t:Date.now()};DATA.screen.push(d)}return d};
const label=s=>{const n=daysBetween(parseDate(s),today());if(n===0)return '今天';if(n===1)return '昨天';const d=parseDate(s);return `${d.getMonth()+1}月${d.getDate()}日 周${WK[d.getDay()]}`};
const fmtText=m=>(m>=60?Math.floor(m/60)+'小时':'')+(m%60)+'分';
const fmtHTML=m=>(m>=60?`<b>${Math.floor(m/60)}</b>小时`:'')+`<b>${m%60}</b>分`;
function parseMins(s){s=String(s||'');let h=0,m=0,ok=false,x;
  if((x=s.match(/(\d+)\s*[:：]\s*(\d{1,2})/)))return +x[1]*60+ +x[2];
  if((x=s.match(/(\d+(?:\.\d+)?)\s*(个小时|小时|hours?|hr|h|时)/i))){h=parseFloat(x[1]);ok=true}
  if((x=s.match(/(\d+)\s*(分钟|分|minutes?|min|m\b)/i))){m=+x[1];ok=true}
  return ok?Math.round(h*60+m):null}
function mix(h,w,k){const a=rgb(h),b=rgb(w);return '#'+a.map((v,i)=>Math.round(v*(1-k)+b[i]*k).toString(16).padStart(2,'0')).join('')}
let day=null,page='home';

document.head.insertAdjacentHTML('beforeend',`<style>
.sc-nav{display:flex;align-items:center;justify-content:space-between;padding:6px;margin-bottom:12px;border-radius:99px}
.sc-nav .iconbtn{width:34px;height:34px}
#scLbl{font-size:15px;letter-spacing:2px}
.sc-card{padding:14px;margin-bottom:6px}
.sc-up{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;padding:34px 10px;border:1.5px dashed var(--accent);border-radius:18px;color:var(--accent-t);letter-spacing:2px;font-size:15px}
.sc-up b{font-family:var(--num);font-weight:300;font-size:34px;line-height:1}
.sc-up small{font-size:11.5px;color:var(--sub);letter-spacing:1px}
.sc-card .pimgs{max-width:none;margin:0}
.sc-card .pimgs.n1{max-width:260px;margin:0 auto}
.sc-card .pimgs.n1 img{max-height:420px}
.sc-total{display:block;width:100%;text-align:center;margin-top:12px;letter-spacing:2px;font-size:13px;color:var(--sub)}
.sc-total b{font-family:var(--num);font-style:italic;font-weight:300;font-size:46px;color:var(--ink);letter-spacing:-1px;margin:0 4px}
.sc-total small{display:block;font-size:12px;margin-top:2px;letter-spacing:1px}
.sc-notes{display:flex;flex-direction:column;align-items:center;gap:22px;margin:26px 0 6px}
.sc-note{position:relative;width:min(100%,300px);padding:22px 18px 14px;background:var(--note);color:var(--note-t);font-family:var(--ti);font-size:15.5px;line-height:1.8;box-shadow:0 8px 18px rgba(60,30,40,.14),0 1px 2px rgba(0,0,0,.06);transform:rotate(var(--r));border-radius:2px 2px 16px 2px;white-space:pre-wrap;word-break:break-word}
.sc-note::before{content:"";position:absolute;top:-9px;left:50%;width:70px;height:20px;margin-left:-35px;background:rgba(255,255,255,.55);box-shadow:0 1px 2px rgba(0,0,0,.06);transform:rotate(-2deg)}
.sc-note small{display:block;margin-top:8px;text-align:right;font-family:var(--en);font-style:italic;font-size:12px;opacity:.6}
.sc-ask{display:block;margin:20px auto 0;padding:10px 22px}
.sc-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin:22px 4px 8px}
.sc-week{display:flex;gap:4px;padding:14px 10px 10px;height:170px}
.sc-b{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:var(--sub);min-width:0}
.sc-b .tr{flex:1;width:14px;display:flex;align-items:flex-end;border-radius:7px;background:rgba(46,26,31,.05)}
.sc-b i{display:block;width:100%;border-radius:7px;background:var(--accent);opacity:.5}
.sc-b.on i{opacity:1}
.sc-b.on>span:last-child{color:var(--accent-t)}
.sc-b .v{font-family:var(--num);font-style:italic;height:14px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-screen"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>屏幕时间</h2><em>screen time</em><span class="sp"></span>
    <button class="iconbtn glass" id="scMenu" style="letter-spacing:1px">···</button>
  </div>
  <div class="sc-nav glass"><button class="iconbtn" id="scPrev">${BACK}</button><button id="scLbl"></button><button class="iconbtn" id="scNext">${NEXT}</button></div>
  <div id="scDay"></div>
  <div class="sc-h">最近 7 天 · 小时</div>
  <div class="sc-week glass" id="scWeek"></div>
</div></section>`);

/* ---------- 显示 ---------- */
function render(){
  if(!day)day=T();
  const pg=$('#page-screen'),nc=mix(S.theme||'#B4848D','#FFFFFF',.6);
  pg.style.setProperty('--note',nc);pg.style.setProperty('--note-t',onText(nc));
  $('#scLbl').textContent=label(day);
  $('#scNext').style.visibility=day<T()?'visible':'hidden';
  const d=get(day),has=d&&(d.images?.length||d.mins!=null);
  const up=!d?.images?.length?`<button class="sc-up" id="scUp"><b>＋</b>上传${day===T()?'今天':'这天'}的截图<small>设置 → 屏幕使用时间，截一张图</small></button>`:'';
  const imgs=d?.images?.length?`<div class="pimgs n${Math.min(d.images.length,3)}">${d.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:'';
  const tot=d?`<button class="sc-total" id="scTot">${d.mins!=null?fmtHTML(d.mins):'<span>点这里填总时长</span>'}${d.apps?`<small>${esc(d.apps)}</small>`:''}</button>`:'';
  const notes=(d?.notes||[]).map(n=>`<div class="sc-note" data-n="${n.id}" style="--r:${n.r}deg">${esc(n.text)}<small>— ${esc(S.hisName)} · ${fmtTime(n.t)}</small></div>`).join('')
    +(d?._busy?`<div class="sc-note" style="--r:1deg;opacity:.7">${esc(S.hisName)}正在看…</div>`:'');
  const ask=has&&!d._busy?`<button class="pill ghost sc-ask" id="scAsk">${d.notes?.length?`让${esc(S.hisName)}再贴一张`:`让${esc(S.hisName)}看看`}</button>`:'';
  $('#scDay').innerHTML=`<div class="sc-card glass">${up}${imgs}${tot}</div>${notes?`<div class="sc-notes">${notes}</div>`:''}${ask}`;
  IMG.hydrate($('#scDay'));
  const days=[...Array(7)].map((_,i)=>shift(T(),i-6));
  const vals=days.map(s=>get(s)?.mins??null);
  const max=Math.max(60,...vals.filter(v=>v!=null));
  $('#scWeek').innerHTML=days.map((s,i)=>{const v=vals[i];
    return `<button class="sc-b${s===day?' on':''}" data-day="${s}"><span class="v">${v!=null?(v/60).toFixed(1):''}</span><div class="tr"><i style="height:${v!=null?Math.max(4,v/max*100):0}%"></i></div><span>${i===6?'今天':WK[parseDate(s).getDay()]}</span></button>`}).join('')}

/* ---------- 上传、填时长 ---------- */
async function upload(){
  const have=get(day)?.images?.length||0;if(have>=3)return toast('最多 3 张');
  const imgs=await pickPhotos(3-have,1600,.85);if(!imgs.length)return;
  const ids=await IMG.putAll(imgs);const d=make(day);
  d.images.push(...ids);await save();render();look(d)}
async function editTotal(d,thenLook){
  const v=prompt('这天一共用了多久？\n比如：5小时12分',d.mins!=null?fmtText(d.mins):'');
  if(v==null)return;
  if(!v.trim()){d.mins=null;await save();render();return}
  const m=parseMins(v);if(m==null)return toast('没看懂，写成「5小时12分」这样');
  d.mins=m;await save();render();if(thenLook)look(d)}

/* ---------- 陆择来看 ---------- */
async function look(d){
  if(d._busy)return;
  const gem=S.provider==='gemini';
  if(!gem&&d.mins==null){toast(`${S.hisName}看不了图，先填一下总时长`);return editTotal(d,true)}
  d._busy=true;render();
  try{
    const prev=get(shift(d.date,-1));
    const said=(d.notes||[]).map(n=>'- '+n.text).join('\n');
    const known=d.mins!=null?`总时长：${fmtText(d.mins)}${d.apps?'，用得最多的：'+d.apps:''}。`:'';
    const text=`她把${label(d.date)}（${d.date}）的屏幕使用时间截图拿给你看了。${known}${gem&&d.images?.length?'截图就是给你看的这些，请自己读出总时长和用得最多的几个 App。':''}${prev?.mins!=null?`\n前一天她用了${fmtText(prev.mins)}。`:''}${said?`\n你已经在下面贴过：\n${said}\n这次再贴一张，可以接着说，不要重复。`:''}
请以${S.hisName}的身份写一张便利贴贴在截图下面：按你的性格来，用得多就管她、凶她、罚她，用得少就夸她乖，也可以吐槽她刷得最多的 App。口语化，30到80字。
只输出 JSON，不要其他文字：{"total":"截图里的总时长，比如 5小时12分，看不出就写空字符串","apps":"用得最多的两三个 App 和时长，看不出就写空字符串","note":"便利贴内容"}`;
    const t=await callAI(sceneSystem('这是你们的小窝「365」里的「屏幕时间」，她会把手机的屏幕使用时间截图给你看，你在下面贴便利贴。'),
      [{role:'user',text,images:gem&&d.images?.length?d.images:undefined}]);
    let j=null;try{const m=t.match(/\{[\s\S]*\}/);if(m)j=JSON.parse(m[0])}catch(e){}
    const note=clean(String(j?.note||t));
    if(j){if(d.mins==null){const m=parseMins(j.total);if(m!=null)d.mins=m}if(!d.apps&&j.apps)d.apps=String(j.apps).trim()}
    (d.notes=d.notes||[]).push({id:uid(),text:note,t:Date.now(),r:+(Math.random()*6-3).toFixed(1)});
    if(page!=='screen')toast(`${S.hisName}在屏幕时间里贴了一张便利贴`)}
  catch(e){toast(e.message)}
  delete d._busy;await save();render()}

/* ---------- 点击 ---------- */
$('#scDay').onclick=e=>{const t=e.target;if(t.matches('img.zoom'))return;
  if(t.closest('#scUp'))return upload();
  if(t.closest('#scTot'))return editTotal(make(day));
  if(t.closest('#scAsk')){const d=get(day);if(d)look(d);return}
  const n=t.closest('[data-n]');if(!n)return;
  const d=get(day),x=d?.notes?.find(y=>y.id===n.dataset.n);if(!x)return;
  sheet([['复制',()=>navigator.clipboard?.writeText(x.text).then(()=>toast('已复制'))],
    ['删除这张便利贴',async()=>{d.notes=d.notes.filter(y=>y!==x);await save();render()}]])};
$('#scWeek').onclick=e=>{const b=e.target.closest('[data-day]');if(b){day=b.dataset.day;render()}};
$('#scPrev').onclick=()=>{day=shift(day,-1);render()};
$('#scNext').onclick=()=>{if(day<T()){day=shift(day,1);render()}};
$('#scLbl').onclick=()=>{day=T();render()};
$('#scMenu').onclick=()=>{const d=get(day),acts=[];
  acts.push([d?.images?.length?'再加一张截图':'上传截图',upload]);
  acts.push(['填 / 改总时长',()=>editTotal(make(day))]);
  if(d)acts.push(['删除这天的记录',async()=>{if(!confirm('删除这天的截图和便利贴？'))return;DATA.screen=DATA.screen.filter(x=>x!==d);await save();await IMG.del(d.images);render()}]);
  sheet(acts)};

/* ---------- 让陆择知道 ---------- */
HOOKS.context.push(()=>{const d=get(T());if(!d||d.mins==null)return '';
  return `【她今天的屏幕使用时间】${fmtText(d.mins)}${d.apps?'，用得最多的是 '+d.apps:''}。可以自然地管管她，不用每句都提。`});

addMore({go:'screen',cn:'屏幕时间',ce:'screen time'});
window.addDot?.('screen',s=>DATA.screen.some(d=>(d.notes||[]).some(n=>n.t>s)));
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.screen))DATA.screen=[];render()});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{page=n;if(n==='screen'){day=T();render()}});
})();
