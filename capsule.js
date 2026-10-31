/* ===== 365 · capsule.js · 时间胶囊 ===== */
(()=>{
let pend=[];
const save=()=>saveData('capsule');
const find=id=>DATA.capsule.find(c=>c.id===id);
const dot=s=>String(s).replace(/-/g,'.');
const left=c=>daysBetween(today(),parseDate(c.openDate));
const ICON={
  lock:'<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  ready:'<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.6-1.8"/></svg>',
  open:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>'};

function card(c){
  const n=left(c),sealed=dotDate(new Date(c.t));
  const tip=c._writing?`${esc(S.hisName)}正在写他的那一封…`:(c.his&&!c.opened?`里面还有${esc(S.hisName)}写的一封 ✉︎`:'');
  const tipH=tip?`<div class="tc-hint">${tip}</div>`:'';
  if(!c.opened&&n>0){
    const total=parseDate(c.openDate)-new Date(c.t),pct=Math.max(3,Math.min(100,(Date.now()-c.t)/total*100));
    return `<article class="tc-card glass" data-tc="${c.id}">
      <div class="tc-top"><div class="tc-ic">${ICON.lock}</div>
        <div class="tc-l"><div class="tc-title">${esc(c.title)}</div><div class="tc-meta">sealed ${sealed} · open ${dot(c.openDate)}</div></div>
        <div class="tc-r"><div class="tc-unit">还有</div><div class="tc-num">${n}</div><div class="tc-unit">天</div></div></div>
      <div class="tc-bar"><i style="width:${pct}%"></i></div>${tipH}</article>`}
  if(!c.opened){
    return `<article class="tc-card glass" data-tc="${c.id}">
      <div class="tc-top"><div class="tc-ic">${ICON.ready}</div>
        <div class="tc-l"><div class="tc-title">${esc(c.title)}</div><div class="tc-meta">sealed ${sealed} · 到日子了</div></div>
        <div class="tc-r"><div class="tc-num">♡</div><div class="tc-unit">可以拆了</div></div></div>
      ${tipH}<button class="pill tc-btn" data-tcopen="${c.id}">拆开它</button></article>`}
  const days=daysBetween(parseDate(isoDate(new Date(c.t))),parseDate(c.openDate));
  const imgs=c.images?.length?`<div class="pimgs n${Math.min(c.images.length,3)}">${c.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:'';
  return `<article class="tc-card glass" data-tc="${c.id}">
    <div class="tc-top"><div class="tc-ic">${ICON.open}</div>
      <div class="tc-l"><div class="tc-title">${esc(c.title)}</div><div class="tc-meta">${sealed} → ${dot(c.openDate)}</div></div>
      <div class="tc-r"><div class="tc-unit">藏了</div><div class="tc-num">${days}</div><div class="tc-unit">天</div></div></div>
    <div class="tc-body">
      ${c.text?`<div class="tc-from">${sealed} 的我写的</div><div class="tc-letter">${esc(c.text)}</div>`:''}${imgs}
      ${c.his?`<div class="tc-from">${esc(S.hisName)}写的</div><div class="tc-his">${esc(c.his)}</div>`:''}
    </div></article>`}
function render(){
  const box=$('#tcList');
  const L=[...DATA.capsule].sort((a,b)=>(a.opened?1:0)-(b.opened?1:0)||(a.opened?b.openedAt-a.openedAt:a.openDate.localeCompare(b.openDate)));
  box.innerHTML=L.length?L.map(card).join(''):'<div class="empty">还没有时间胶囊<br>把这一刻藏起来，等以后一起拆</div>';
  IMG.hydrate(box)}

const sys=()=>sceneSystem('这是你们的小窝「365」里的时间胶囊，只有你们两个人能看到。');
async function hisWrite(c){
  if(c._writing)return;c._writing=true;render();
  try{
    const n=Math.max(0,left(c)),recent=recentChat(10);
    const t=await callAI(sys(),[{role:'user',text:`她封存了一个时间胶囊，名字叫「${c.title}」，要等到${c.openDate}（${n}天后）才能打开。她写了什么你看不到。\n请以${S.hisName}的身份也写一封信放进去，写给那天拆开胶囊的她：可以写现在的心情、想对那时候的她说的话、对你们以后的期待。像真的写信一样，真诚，有你自己的语气，150到300字。${recent?'\n你们最近的聊天：\n'+recent:''}\n只输出信的正文，不要标题。`}]);
    c.his=clean(t);c.hisAt=Date.now();toast(`${S.hisName}也封好了一封 ✉︎`)}
  catch(e){toast(e.message)}
  delete c._writing;await save();render()}
async function openIt(c){
  if(left(c)>0)return toast('还没到日子哦');
  if(c._writing)return toast(`等${S.hisName}写完他的那一封`);
  c.opened=true;c.openedAt=Date.now();await save();render();toast('拆开啦 ♡')}

function renderPend(){$('#tcPend').innerHTML=pendHTML(pend)}
$('#tcAdd').onclick=()=>{
  $('#tcTitle').value='';$('#tcText').value='';pend=[];renderPend();
  const d=today();d.setFullYear(d.getFullYear()+1);
  $('#tcDate').min=isoDate(today());$('#tcDate').value=isoDate(d);$('#tcHis').checked=true;
  openModal('tcModal')};
$('#tcPhoto').onclick=async()=>{pend.push(...await pickPhotos(9-pend.length));renderPend()};
$('#tcPend').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){pend.splice(+b.dataset.rm,1);renderPend()}};
$('#tcSave').onclick=async()=>{
  const title=$('#tcTitle').value.trim(),date=$('#tcDate').value,text=$('#tcText').value.trim(),ask=$('#tcHis').checked;
  if(!title)return toast('给这个胶囊起个名字吧');
  if(!text&&!pend.length)return toast('写点什么或者放张照片吧');
  if(!date)return toast('选一个打开的日子');
  if(date<isoDate(today()))return toast('打开的日子不能早于今天');
  if(!confirm(`封存以后，${dot(date)} 之前都打不开，也不能修改。确定封存吗？`))return;
  const images=await IMG.putAll(pend);
  const c={id:uid(),title,text,images,openDate:date,t:Date.now(),opened:false};
  DATA.capsule.push(c);await save();closeModal('tcModal');render();toast('封存好了 ♡');
  if(ask)hisWrite(c)};
$('#tcList').onclick=e=>{const t=e.target;
  const o=t.closest('[data-tcopen]');if(o){const c=find(o.dataset.tcopen);if(c)openIt(c);return}
  if(t.matches('img.zoom'))return;
  const k=t.closest('[data-tc]');if(!k)return;const c=find(k.dataset.tc);if(!c)return;
  const acts=[];
  if(!c.opened&&!c.his&&!c._writing)acts.push([`让${S.hisName}也写一封`,()=>hisWrite(c)]);
  acts.push(['删除这个胶囊',async()=>{if(!confirm(`删除「${c.title}」？里面的信也会一起删掉。`))return;DATA.capsule=DATA.capsule.filter(x=>x!==c);await save();await IMG.del(c.images);render()}]);
  sheet(acts)};

HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='capsule')render()});
HOOKS.context.push(()=>{const r=DATA.capsule.filter(c=>!c.opened&&left(c)<=0).map(c=>`「${c.title}」`);
  return r.length?`【时间胶囊】${r.join('、')}到日子了，她还没拆，可以提醒她去拆。`:''});
})();
