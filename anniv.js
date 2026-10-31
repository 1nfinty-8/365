/* ===== 365 · anniv.js · 纪念日 ===== */
(()=>{
let editing=null,formType='count';
const save=()=>saveData('anniv');
const list=()=>DATA.anniv||[];
const msLabel=x=>x%365===0?`${x/365} 周年`:`第 ${x} 天`;
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
function info(a){
  const t=today(),d=parseDate(a.date);let r;
  if(a.type==='yearly'){
    const[y,m,dd]=a.date.split('-').map(Number);
    const mk=yr=>{const x=new Date(yr,m-1,dd);return x.getMonth()===m-1?x:new Date(yr,m,0)};
    let yr=t.getFullYear(),nx=mk(yr);if(nx<t)nx=mk(++yr);
    const left=daysBetween(t,nx),k=yr-y,kt=k>0?` · 第 ${k} 年`:'';
    r=left?{pre:'还有',num:left,unit:'天',badge:`下一次 ${dotDate(nx)}${kt}`,next:`「${a.name}」还有 ${left} 天${k>0?`（第 ${k} 年）`:''}`}
          :{pre:'',num:'♡',unit:'就是今天',today:1,badge:`🎉 就是今天${kt}`,next:`今天是「${a.name}」${k>0?`（第 ${k} 年）`:''}`};
    r.sortKey=left;r.line=`every year · ${pad(m)}.${pad(dd)}`;
  }else{
    const n=daysBetween(d,t)+1;
    if(n<=0){const left=1-n;r={pre:'还有',num:left,unit:'天',sortKey:left,line:dotDate(d),badge:'',next:`「${a.name}」还有 ${left} 天`}}
    else{
      const isMs=n%100===0||n%365===0;
      const nm=Math.min(Math.ceil((n+1)/100)*100,Math.ceil((n+1)/365)*365),ml=nm-n;
      r={pre:'第',num:n,unit:'天',today:isMs,line:'since '+dotDate(d),sortKey:isMs?0:ml,
        badge:isMs?`🎉 今天是${msLabel(n)}`:`距离${msLabel(nm)}还有 ${ml} 天 · ${dotDate(addDays(t,ml))}`,
        next:isMs?`今天是「${a.name}」的${msLabel(n)}`:`「${a.name}」的${msLabel(nm)}还有 ${ml} 天`}}
  }
  r.near=r.sortKey<=7?r.next:'';return r}
function render(){
  const L=list().map(a=>({a,i:info(a)}));
  const soon=[...L].sort((x,y)=>x.i.sortKey-y.i.sortKey)[0];
  $('#anHero').textContent=soon?`✦ 下一个 · ${soon.i.next} ✦`:'';
  L.sort((x,y)=>(y.a.pin?1:0)-(x.a.pin?1:0)||x.i.sortKey-y.i.sortKey);
  $('#anList').innerHTML=L.length?L.map(({a,i})=>`
    <div class="an-card glass${i.today?' today':''}" data-an="${a.id}">
      <div class="an-l">
        <div class="an-name">${esc(a.name)}${a.pin?'<span class="an-pin">置顶</span>':''}</div>
        <div class="an-date">${i.line}</div>
        ${a.note?`<div class="an-note">${esc(a.note)}</div>`:''}
        ${i.badge?`<div class="an-ms">${i.badge}</div>`:''}
      </div>
      <div class="an-r"><div class="an-pre">${i.pre}</div><div class="an-num">${i.num}</div><div class="an-unit">${i.unit}</div></div>
    </div>`).join(''):'<div class="empty">还没有纪念日，点右上角新建一个吧</div>'}
function setType(t){formType=t;$$('#anType button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
function openForm(a){
  editing=a||null;
  $('#anTitle').textContent=a?'编辑纪念日':'新的纪念日';
  $('#anName').value=a?.name||'';$('#anDate').value=a?.date||isoDate(today());
  $('#anNote').value=a?.note||'';$('#anPin').checked=!!a?.pin;
  setType(a?.type||'count');openModal('anModal')}
$('#anType').onclick=e=>{const b=e.target.closest('button[data-t]');if(b)setType(b.dataset.t)};
$('#anAdd').onclick=()=>openForm();
$('#anSave').onclick=async()=>{
  const name=$('#anName').value.trim(),date=$('#anDate').value;
  if(!name)return toast('给这一天起个名字吧');
  if(!date)return toast('选一个日期');
  const v={name,date,type:formType,note:$('#anNote').value.trim(),pin:$('#anPin').checked};
  if(!Array.isArray(DATA.anniv))DATA.anniv=[];
  if(editing)Object.assign(editing,v);else DATA.anniv.push({id:uid(),...v});
  await save();closeModal('anModal');render();toast('记下了 ♡')};
$('#anList').onclick=e=>{
  const c=e.target.closest('[data-an]');if(!c)return;
  const a=list().find(x=>x.id===c.dataset.an);if(!a)return;
  sheet([['编辑',()=>openForm(a)],
    [a.pin?'取消置顶':'置顶',async()=>{a.pin=!a.pin;await save();render()}],
    ['删除',async()=>{if(!confirm(`删除「${a.name}」？`))return;DATA.anniv=list().filter(x=>x!==a);await save();render()}]])};

HOOKS.ready.push(async()=>{
  if(!Array.isArray(DATA.anniv)){DATA.anniv=[{id:'together',name:'在一起',date:S.startDate||'2026-04-17',type:'count',note:'365 · infinity 的第一天',pin:true}];await save()}
  render()});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='anniv')render()});
HOOKS.context.push(()=>{const near=list().map(info).filter(x=>x.near).map(x=>x.near);
  return near.length?'【最近的纪念日】'+near.join('；')+'。可以自然地提起，不用每句都说。':''});
})();
