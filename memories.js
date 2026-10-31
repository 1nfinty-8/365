/* ===== 365 · memory.js · 记忆本 ===== */
(()=>{
const CATS=[['me','关于小狗'],['us','我们之间'],['promise','约定'],['other','其他']];
const ck=m=>CATS.some(c=>c[0]===m.cat)?m.cat:'other';
const catName=k=>(CATS.find(c=>c[0]===k)||CATS[3])[1];
const LIMIT=1500;
if(!Array.isArray(DATA.memory))DATA.memory=[];
let filter='all',editing=null,cat='me',cands=[],summing=false;
const save=()=>saveData('memory');
const on=()=>DATA.memory.filter(m=>m.on!==false);
const size=()=>on().reduce((n,m)=>n+m.text.length,0);

function render(){
  const L=DATA.memory,n=size();
  $('#mmStat').innerHTML=L.length
    ?`一共 ${L.length} 条，${esc(S.hisName)}记着 ${on().length} 条 · 约 ${n} 字${n>LIMIT?'<br><span class="mm-warn">有点多了，每次回话都会更贵，可以整理一下</span>':''}`
    :`${esc(S.hisName)}要一直记住的事，都写在这里。`;
  $('#mmTabs').innerHTML=[['all','全部'],...CATS].map(([k,nm])=>{
    const c=k==='all'?L.length:L.filter(m=>ck(m)===k).length;
    return `<button data-f="${k}" class="${filter===k?'on':''}">${nm} ${c}</button>`}).join('');
  const item=m=>`<div class="mm-item glass${m.on===false?' off':''}" data-mm="${m.id}">
    <div class="mm-l"><div class="mm-text">${esc(m.text)}</div>
    <div class="mm-meta">${catName(ck(m))} · ${dotDate(new Date(m.t))}${m.src==='him'?' · '+esc(S.hisName)+'整理的':''}</div></div>
    <button class="mm-sw${m.on===false?'':' on'}" data-mmsw="${m.id}" aria-label="开关"></button></div>`;
  const sorted=[...L].sort((a,b)=>b.t-a.t);
  let h='';
  if(filter==='all'){for(const[k,nm]of CATS){const xs=sorted.filter(m=>ck(m)===k);if(xs.length)h+=`<div class="mm-h">${nm}</div>`+xs.map(item).join('')}}
  else h=sorted.filter(m=>ck(m)===filter).map(item).join('');
  $('#mmList').innerHTML=h||'<div class="empty">这里还空着<br>点「＋ 记一条」，或者让他从聊天里整理</div>';
}

/* 新建 / 编辑 */
$('#mmCat').innerHTML=CATS.map(([k,n])=>`<button data-c="${k}">${n}</button>`).join('');
function setCat(k){cat=k;$$('#mmCat button').forEach(b=>b.classList.toggle('on',b.dataset.c===k))}
$('#mmCat').onclick=e=>{const b=e.target.closest('[data-c]');if(b)setCat(b.dataset.c)};
function openForm(m){
  editing=m||null;
  $('#mmTitle').textContent=m?'改一改':'记一条';
  $('#mmText').value=m?.text||'';
  setCat(m?ck(m):(filter!=='all'?filter:'me'));
  openModal('mmModal')}
$('#mmAdd').onclick=()=>openForm();
$('#mmSave').onclick=async()=>{
  const text=$('#mmText').value.trim();if(!text)return toast('写一句要记住的事');
  const was=editing;
  if(editing)Object.assign(editing,{text,cat});
  else DATA.memory.push({id:uid(),text,cat,on:true,t:Date.now(),src:'me'});
  await save();closeModal('mmModal');render();toast(was?'改好了':'记住了 ♡')};

/* 列表操作 */
$('#mmTabs').onclick=e=>{const b=e.target.closest('[data-f]');if(b){filter=b.dataset.f;render()}};
$('#mmList').onclick=async e=>{
  const s=e.target.closest('[data-mmsw]');
  if(s){const m=DATA.memory.find(x=>x.id===s.dataset.mmsw);if(!m)return;
    m.on=m.on===false;await save();render();
    toast(m.on?`${S.hisName}记起来了`:`${S.hisName}暂时不记得这条了`);return}
  const c=e.target.closest('[data-mm]');if(!c)return;
  const m=DATA.memory.find(x=>x.id===c.dataset.mm);if(!m)return;
  sheet([['编辑',()=>openForm(m)],
    ['复制',()=>navigator.clipboard?.writeText(m.text).then(()=>toast('已复制'))],
    ['删除这条记忆',async()=>{if(!confirm('删除这条记忆？'))return;DATA.memory=DATA.memory.filter(x=>x!==m);await save();render()}]])};

/* 从聊天里整理 */
function parse(t){
  let arr=null;
  try{const j=t.match(/\[[\s\S]*\]/);if(j)arr=JSON.parse(j[0])}catch(e){}
  if(!Array.isArray(arr))arr=t.split('\n').map(s=>s.replace(/^[\s\-*•\d.、]+/,'').trim()).filter(s=>s&&!/^[\[\]{}`]/.test(s));
  const have=new Set(DATA.memory.map(m=>m.text));
  return arr.map(x=>typeof x==='string'?{text:x,cat:'other'}:x)
    .filter(x=>x&&x.text).map(x=>({text:String(x.text).trim(),cat:CATS.some(c=>c[0]===x.cat)?x.cat:'other'}))
    .filter(x=>x.text&&!have.has(x.text)).slice(0,10)}
async function summarize(){
  if(summing)return;
  const talk=DATA.chat.slice(-60).filter(m=>m.text);
  if(talk.length<4)return toast('聊天还太少，多聊几句再来整理吧');
  summing=true;const btn=$('#mmSum');btn.textContent=`${S.hisName}在翻你们的聊天…`;
  try{
    const have=DATA.memory.map(m=>'- '+m.text).join('\n')||'（还是空的）';
    const t=await callAI(sceneSystem('这是你们的小窝「365」里的「记忆本」，记在这里的事你会一直记得。现在你在翻最近的聊天，挑出值得记下来的事。'),
      [{role:'user',text:`你们最近的聊天：\n${talk.map(m=>(m.role==='user'?'她':'你')+'：'+m.text).join('\n')}\n\n记忆本里已经有：\n${have}\n\n请挑出值得长期记住、而且记忆本里还没有的事，比如她的喜好和习惯、身体情况、重要的经历、你们之间的梗和称呼、答应过对方的约定。一时的情绪和普通闲聊不用记。\n每条一句话，简短具体，用“小狗”指她，用“我”指你自己，例如“小狗不吃香菜”“我答应过每天晚上跟小狗说晚安”。\n分类 cat 只能是：me（关于小狗）、us（我们之间）、promise（约定）、other（其他）。\n最多 8 条。只输出 JSON 数组，不要其他文字，例如：[{"text":"小狗怕打雷","cat":"me"}]。没有值得记的就输出 []。`}]);
    cands=parse(t);
    if(!cands.length){toast('这次没找到新的要记的事');return}
    $('#mmPickList').innerHTML=cands.map((c,i)=>`<label class="mm-pick"><input type="checkbox" data-pi="${i}" checked><span>${esc(c.text)}<small>${catName(c.cat)}</small></span></label>`).join('');
    openModal('mmPick');
  }catch(e){toast(e.message)}
  finally{summing=false;btn.textContent='✦ 从最近的聊天里整理'}}
$('#mmSum').onclick=summarize;
$('#mmPickSave').onclick=async()=>{
  const idx=[...$$('#mmPickList input:checked')].map(i=>+i.dataset.pi);
  closeModal('mmPick');
  if(!idx.length)return toast('一条都没选');
  const now=Date.now();
  idx.forEach((i,k)=>DATA.memory.push({id:uid(),...cands[i],on:true,t:now+k,src:'him'}));
  await save();filter='all';render();toast(`记住了 ${idx.length} 条 ♡`)};

/* 把记忆交给陆择 */
(HOOKS.persona=HOOKS.persona||[]).push(()=>{
  const a=on();if(!a.length)return '';
  return '【你记得的事】这些是你们之间的重要记忆，你一直都记得。在合适的时候自然地用上，不要一条条复述：\n'+
    CATS.map(([k,n])=>{const xs=a.filter(m=>ck(m)===k);return xs.length?`〔${n}〕\n`+xs.map(m=>'- '+m.text).join('\n'):''}).filter(Boolean).join('\n')});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.memory))DATA.memory=[];render()});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='memory')render()});
})();
