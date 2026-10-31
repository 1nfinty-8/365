/* ===== 365 · diary.js · 小狗日记 ===== */
(()=>{
const WK='日一二三四五六';
const MOODS=[['🥰','超开心'],['☺️','开心'],['😌','平静'],['🥺','想你'],['🥲','难过'],['🤬','生气'],['😴','好累'],['🤒','不舒服']];
const moodName=e=>(MOODS.find(m=>m[0]===e)||[])[1]||'';
let editing=null,mood='☺️',pend=[];
const save=()=>saveData('diary');
const find=id=>DATA.diary.find(d=>d.id===id);

$('#dyMoods').innerHTML=MOODS.map(([e,n])=>`<button data-m="${e}" aria-label="${n}">${e}</button>`).join('');
function setMood(e){mood=e;$$('#dyMoods button').forEach(b=>b.classList.toggle('on',b.dataset.m===e))}
$('#dyMoods').onclick=e=>{const b=e.target.closest('[data-m]');if(b)setMood(b.dataset.m)};
function renderPend(){const el=$('#dyPend');el.innerHTML=pendHTML(pend);IMG.hydrate(el)}

function render(){
  const box=$('#dyList'),L=[...DATA.diary].sort((a,b)=>b.date.localeCompare(a.date)||b.t-a.t);
  box.innerHTML=L.length?L.map(d=>{
    const[y,m,dd]=d.date.split('-').map(Number);const wk=WK[new Date(y,m-1,dd).getDay()];
    const imgs=d.images?.length?`<div class="pimgs n${Math.min(d.images.length,3)}">${d.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:'';
    const notes=(d.comments||[]).map((c,ci)=>c.author==='him'
      ?`<div class="dy-note him" data-dyc="${d.id}:${ci}"><div class="dy-nl">${esc(S.hisName)}的批注</div>${esc(c.text)}</div>`
      :`<div class="dy-note me" data-dyc="${d.id}:${ci}">${esc(c.text)}</div>`).join('');
    const th=d._busy?`<div class="dy-note him"><div class="dy-nl">${esc(S.hisName)}</div>正在看你的日记…</div>`:'';
    const hasHim=(d.comments||[]).some(c=>c.author==='him');
    return `<article class="dy-card glass">
      <div class="dy-top"><div class="dy-day">${dd}</div><div><div class="dy-md">${y}.${pad(m)}</div><div class="dy-wk">星期${wk}</div></div>
        <span class="sp"></span><span class="dy-mood">${d.mood||''}</span><button class="dy-more" data-dymore="${d.id}">···</button></div>
      ${d.text?`<div class="dy-text">${esc(d.text)}</div>`:''}${imgs}
      ${(notes||th)?`<div class="dy-notes">${notes}${th}</div>`:''}
      ${d._busy?'':`<button class="dy-reply" data-dyrep="${d.id}">${hasHim?'＋ 回复'+esc(S.hisName):'＋ 请'+esc(S.hisName)+'来看'}</button>`}
    </article>`}).join(''):'<div class="empty">还没有日记，写下今天的第一篇吧</div>';
  IMG.hydrate(box)}

const sys=()=>sceneSystem('这是你们的小窝「365」里的「小狗日记」。她在这里写日记，你会在她的日记下面写批注留言。只有你们两个人能看到。');
function prompt(d){
  const[,m,dd]=d.date.split('-').map(Number),cs=d.comments||[];
  let s=`她写了一篇${m}月${dd}日的日记${d.mood?`，心情是${d.mood}${moodName(d.mood)}`:''}：\n「${d.text||'（没写字，只放了照片）'}」`;
  if(d.images?.length)s+=`\n（附了${d.images.length}张照片${S.provider==='gemini'?'，就是给你看的这些':''}）`;
  if(cs.length)s+='\n\n日记下面已经有的留言：\n'+cs.map(c=>`${c.author==='me'?'她':'你'}：${c.text}`).join('\n')+`\n\n请以${S.hisName}的身份回复她最新的留言。只输出回复内容，口语化，一到三句，不要加引号或名字前缀。`;
  else s+=`\n\n请以${S.hisName}的身份在日记下面写一段批注：认真回应她写的内容，可以夸她、心疼她、逗她或者管她。只输出批注内容，口语化，两到五句，不要加引号或名字前缀。`;
  return s}
async function himNote(d){
  if(d._busy)return;d._busy=true;render();
  try{await sleep(800);
    const t=await callAI(sys(),[{role:'user',text:prompt(d),images:d.images?.length?d.images.slice(0,4):undefined}]);
    (d.comments=d.comments||[]).push({author:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  delete d._busy;await save();render()}

function openForm(d){
  editing=d||null;
  $('#dyTitle').textContent=d?'编辑日记':'今天的日记';
  $('#dyDate').value=d?.date||isoDate(new Date());
  $('#dyText').value=d?.text||'';
  pend=d?[...(d.images||[])]:[];renderPend();
  setMood(d?.mood||'☺️');
  $('#dyAskRow').style.display=d?'none':'';$('#dyAsk').checked=true;
  openModal('dyModal')}
$('#dyAdd').onclick=()=>openForm();
$('#dyPhoto').onclick=async()=>{pend.push(...await pickPhotos(9-pend.length));renderPend()};
$('#dyPend').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){pend.splice(+b.dataset.rm,1);renderPend()}};
$('#dySave').onclick=async()=>{
  const text=$('#dyText').value.trim(),date=$('#dyDate').value;
  if(!text&&!pend.length)return toast('写点什么吧，小狗');
  if(!date)return toast('选一个日期');
  const images=await IMG.putAll(pend);
  if(editing){const gone=(editing.images||[]).filter(id=>!images.includes(id));
    Object.assign(editing,{date,text,mood,images});await save();await IMG.del(gone);closeModal('dyModal');render();return}
  const d={id:uid(),date,mood,text,images,t:Date.now(),comments:[]};
  DATA.diary.push(d);await save();closeModal('dyModal');render();toast('记下了 ♡');
  if($('#dyAsk').checked)himNote(d)};

$('#dyList').onclick=e=>{const t=e.target;
  const mo=t.closest('[data-dymore]');if(mo){const d=find(mo.dataset.dymore);if(!d)return;
    const acts=[['编辑',()=>openForm(d)]];
    if(!d._busy)acts.push([`让${S.hisName}重新批注`,async()=>{while(d.comments?.length&&d.comments.at(-1).author==='him')d.comments.pop();await save();himNote(d)}]);
    acts.push(['删除这篇日记',async()=>{if(!confirm('删除这篇日记？他的批注也会一起删掉。'))return;DATA.diary=DATA.diary.filter(x=>x!==d);await save();await IMG.del(d.images);render()}]);
    sheet(acts);return}
  const r=t.closest('[data-dyrep]');if(r){const d=find(r.dataset.dyrep);if(!d)return;
    if((d.comments||[]).some(c=>c.author==='him'))
      openReply(`回复${S.hisName}…`,async v=>{d.comments.push({author:'me',text:v,t:Date.now()});await save();render();himNote(d)});
    else himNote(d);return}
  const c=t.closest('[data-dyc]');if(c){const[id,ci]=c.dataset.dyc.split(':');const d=find(id);
    sheet([['复制',()=>navigator.clipboard?.writeText(d.comments[+ci].text).then(()=>toast('已复制'))],
           ['删除这条留言',async()=>{d.comments.splice(+ci,1);await save();render()}]])}};

HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='diary')render()});
HOOKS.context.push(()=>{
  const lim=isoDate(new Date(Date.now()-2*864e5));
  const rec=DATA.diary.filter(d=>d.date>=lim).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  return rec.length?'【她最近的日记】'+rec.map(d=>`${d.date.slice(5)} ${d.mood||''}：${(d.text||'（照片）').slice(0,80)}`).join('；')+'。你看过了，可以自然地提起。':''});
})();
