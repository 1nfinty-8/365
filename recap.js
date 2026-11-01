/* ===== 365 · recap.js · 聊过的事（自动总结） ===== */
(()=>{
if(!Array.isArray(DATA.recap))DATA.recap=[];
Object.assign(DEFAULT,{recapOn:true,recapUpTo:0});
const save=()=>saveData('recap');
const CHUNK=40,SHOW=20;
const md=t=>{const d=new Date(t);return `${d.getMonth()+1}月${d.getDate()}日`};
const range=(a,b)=>md(a)===md(b)?md(a):md(a)+' – '+md(b);
let busy=false,editing=null,ready=false;

document.head.insertAdjacentHTML('beforeend',`<style>
.rp-st{display:block;font-size:12px;color:var(--accent-t);letter-spacing:1px;margin:-2px 4px 10px;text-align:left}
</style>`);
$('#mmList').insertAdjacentHTML('afterend','<div id="rpSec"></div>');
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="rpModal"><div class="mbox">
  <h3>改一改</h3>
  <label class="f"><textarea class="tall" id="rpText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="rpModal">取消</button><button class="pill" id="rpSave">保存</button></div>
</div></div>`);

/* 还没整理的聊天：最近 ctx 条他本来就看得到，不用整理 */
function pending(){
  const keep=Math.max(4,S.ctx||24),C=DATA.chat,end=C.length-keep,out=[];
  for(let i=0;i<end;i++)if(C[i].t>(S.recapUpTo||0))out.push(C[i]);
  return out}

async function run(force){
  if(busy||!S.apiKey)return;
  if(!force&&!S.recapOn)return;
  const P=pending();
  if(P.length<(force?1:CHUNK)){if(force)toast('最近没有要整理的聊天');return}
  const part=P.slice(0,CHUNK);
  busy=true;render();
  try{
    const lines=part.map(m=>`[${md(m.t)} ${fmtTime(m.t)}] ${m.role==='user'?'她':'你'}：${m.text||'（发了照片）'}`).join('\n');
    const prev=DATA.recap.slice(-2).map(r=>'- '+r.text).join('\n');
    const t=await callAI(sceneSystem('你在翻你们以前的聊天记录，把它整理成一段回忆，以后好记得。'),
      [{role:'user',text:`这是你们 ${range(part[0].t,part.at(-1).t)} 的聊天：\n${lines}\n\n${prev?'上一段整理的是：\n'+prev+'\n\n':''}请以${S.hisName}的视角，把这段聊天写成一段回忆，80到200字。写清楚聊了什么、发生了什么、她的心情、你们说好或答应的事、新出现的称呼和梗。用“小狗”指她，用“我”指你自己。不用写每句话，只留重要的。不要用 emoji。只输出这段回忆。`}]);
    DATA.recap.push({id:uid(),text:clean(t),from:part[0].t,to:part.at(-1).t,t:Date.now()});
    S.recapUpTo=part.at(-1).t;saveSettings();await save();
    if(force)toast('整理好了一段');
  }catch(e){if(force)toast(e.message)}
  finally{busy=false;render()}}

function render(){
  const el=$('#rpSec');if(!el)return;
  const n=pending().length,L=[...DATA.recap].reverse(),cut=DATA.recap.length-SHOW;
  const st=busy?`${esc(S.hisName)}正在翻以前的聊天…`:!S.recapOn?'自动整理：关':`自动整理：开${n?` · 还有 ${n} 条没整理`:''}`;
  el.innerHTML=`<div class="mm-h" style="margin-top:22px">聊过的事 · ${L.length}</div>
    <button class="rp-st" id="rpSt">${st}</button>
    ${L.length?L.map(r=>`<div class="mm-item glass" data-rp="${r.id}"><div class="mm-l"><div class="mm-text">${esc(r.text)}</div><div class="mm-meta">${range(r.from,r.to)}${DATA.recap.indexOf(r)<cut?' · 太早了，他暂时想不起来':''}</div></div></div>`).join('')
      :'<p class="hint" style="margin:0 4px 10px">聊天每多出大约 40 条，他会把更早的那一段写成一小段回忆放在这里。</p>'}`}

$('#rpSec').onclick=e=>{
  if(e.target.closest('#rpSt')){
    sheet([[S.recapOn?'关掉自动整理':'打开自动整理',()=>{S.recapOn=!S.recapOn;saveSettings();render()}],
      ['现在整理一段',()=>run(true)]]);return}
  const c=e.target.closest('[data-rp]');if(!c)return;
  const r=DATA.recap.find(x=>x.id===c.dataset.rp);if(!r)return;
  sheet([['编辑',()=>{editing=r;$('#rpText').value=r.text;openModal('rpModal')}],
    ['复制',()=>navigator.clipboard?.writeText(r.text).then(()=>toast('已复制'))],
    ['删除这段',async()=>{if(!confirm('删除这段回忆？聊天记录不会删，也不会重新整理。'))return;DATA.recap=DATA.recap.filter(x=>x!==r);await save();render()}]])};
$('#rpSave').onclick=async()=>{const v=$('#rpText').value.trim();if(!v||!editing)return;
  editing.text=v;await save();closeModal('rpModal');render();toast('改好了')};

HOOKS.persona.push(()=>{const L=DATA.recap.slice(-SHOW);if(!L.length)return '';
  return '【聊过的事】这是你们以前聊天的回忆，按时间先后。你都记得，合适的时候自然地接上，不要一条条复述：\n'+L.map(r=>`- ${range(r.from,r.to)}：${r.text}`).join('\n')});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.recap))DATA.recap=[];ready=true;render();setTimeout(()=>run(),8000)});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='memory')render()});
setInterval(()=>{if(ready&&!document.hidden)run()},20000);
})();
