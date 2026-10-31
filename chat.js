/* ===== 365 · chat.js · 聊天 ===== */
(()=>{
let busy=false,typing=false;
const save=()=>saveData('chat');
function scrollChat(){const b=$('#msgs');requestAnimationFrame(()=>b.scrollTop=b.scrollHeight)}
function render(){
  const box=$('#msgs'),C=DATA.chat;
  if(!C.length&&!typing){box.innerHTML=`<div class="empty">和${esc(S.hisName)}说点什么吧</div>`;return}
  let lastUser=-1;for(let i=C.length-1;i>=0;i--)if(C[i].role==='user'){lastUser=i;break}
  let h='';
  for(let i=Math.max(0,C.length-300);i<C.length;i++){
    const m=C[i],p=C[i-1],n=C[i+1],me=m.role==='user';
    const newTime=!p||m.t-p.t>3e5;
    if(newTime)h+=`<div class="tstamp">${fmtDate(m.t)}</div>`;
    const start=newTime||p.role!==m.role;
    let end=!n||n.role!==m.role||n.t-m.t>3e5;
    if(!n&&typing&&!me)end=false;
    const imgs=(m.images||[]).map(id=>IMG.tag(id,'class="cimg"')).join('');
    const bub=m.text?`<div class="bubble${end?' tail':''}">${esc(m.text)}</div>`:'';
    const side=me?'':(end?avatarHTML('him'):'<div class="avsp"></div>');
    h+=`<div class="row ${me?'me':'him'}${start?' gs':''}" data-i="${i}">${side}<div class="stack">${imgs}${bub}</div></div>`;
    if(i===lastUser)h+=`<div class="rcpt">${m.status==='sent'?'已送达':'已读'+(m.readAt?' '+fmtTime(m.readAt):'')}</div>`;
  }
  if(typing){const l=C.at(-1);h+=`<div class="row him${l&&l.role==='model'?'':' gs'}">${avatarHTML('him')}<div class="stack"><div class="bubble tail typing"><i></i><i></i><i></i></div></div></div>`}
  box.innerHTML=h;
  box.querySelectorAll('img').forEach(i=>i.addEventListener('load',scrollChat,{once:true}));
  IMG.hydrate(box);scrollChat()}
function setTyping(on){typing=on;$('#status').textContent=on?'正在输入…':'';render()}
function ctxMsgs(){const list=DATA.chat.slice(-S.ctx),n=list.length;
  return list.map((m,k)=>({role:m.role,text:m.text||(m.images?.length?'（发了照片）':''),images:(m.images?.length&&k>=n-6)?m.images:undefined}))}
async function send(){
  if(busy)return;const ta=$('#chatInput');const text=ta.value.trim();
  if(text){DATA.chat.push({role:'user',text,t:Date.now(),status:'sent'});ta.value='';autoGrow(ta);await save();render()}
  if(DATA.chat.length)reply()}
async function reply(){
  busy=true;
  try{
    await sleep(700);
    const now=Date.now();let ch=false;
    DATA.chat.forEach(m=>{if(m.role==='user'&&m.status==='sent'){m.status='read';m.readAt=now;ch=true}});
    if(ch)save();
    setTyping(true);
    const out=await callAI(chatSystem(),ctxMsgs());
    const parts=S.split?out.split(/\n+/).map(s=>s.trim()).filter(Boolean):[out];
    for(let i=0;i<parts.length;i++){
      if(i)await sleep(Math.min(500+parts[i].length*45,2000));
      DATA.chat.push({role:'model',text:parts[i],t:Date.now()});
      if(i===parts.length-1)typing=false;
      render()}
    await save();
  }catch(e){toast(e.message)}finally{busy=false;setTyping(false)}}
async function reroll(){while(DATA.chat.length&&DATA.chat.at(-1).role==='model')DATA.chat.pop();await save();render();reply()}

$('#chatInput').addEventListener('input',e=>autoGrow(e.target));
$('#chatInput').addEventListener('focus',()=>setTimeout(scrollChat,400));
$('#sendBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#sendBtn').onclick=send;
$('#plusBtn').onclick=async()=>{
  const imgs=await pickPhotos(4,1024,.8);if(!imgs.length)return;
  const ids=await IMG.putAll(imgs);
  DATA.chat.push({role:'user',text:'',images:ids,t:Date.now(),status:'sent'});await save();render();if(!busy)reply()};
$('#msgs').onclick=e=>{
  const row=e.target.closest('.row[data-i]');if(!row||!e.target.closest('.stack'))return;
  const i=+row.dataset.i,m=DATA.chat[i];if(!m)return;const acts=[];
  if(e.target.matches('.cimg')&&e.target.src)acts.push(['查看大图',()=>viewImage(e.target.src)]);
  if(m.text)acts.push(['复制',()=>navigator.clipboard?.writeText(m.text).then(()=>toast('已复制'),()=>toast('复制失败'))]);
  if(m.role==='model'&&!busy&&DATA.chat.slice(i).every(x=>x.role==='model'))acts.push(['让他重新说',reroll]);
  acts.push(['删除这条',async()=>{const x=DATA.chat.splice(i,1)[0];await save();await IMG.del(x?.images);render()}]);
  sheet(acts)};

HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='chat')scrollChat()});
})();
/* ===== 365 · chat.js · 聊天 ===== */
(()=>{
let busy=false,typing=false;
const save=()=>saveData('chat');
function scrollChat(){const b=$('#msgs');requestAnimationFrame(()=>b.scrollTop=b.scrollHeight)}
function render(){
  const box=$('#msgs'),C=DATA.chat;
  if(!C.length&&!typing){box.innerHTML=`<div class="empty">和${esc(S.hisName)}说点什么吧</div>`;return}
  let lastUser=-1;for(let i=C.length-1;i>=0;i--)if(C[i].role==='user'){lastUser=i;break}
  let h='';
  for(let i=Math.max(0,C.length-300);i<C.length;i++){
    const m=C[i],p=C[i-1],n=C[i+1],me=m.role==='user';
    const newTime=!p||m.t-p.t>3e5;
    if(newTime)h+=`<div class="tstamp">${fmtDate(m.t)}</div>`;
    const start=newTime||p.role!==m.role;
    let end=!n||n.role!==m.role||n.t-m.t>3e5;
    if(!n&&typing&&!me)end=false;
    const imgs=(m.images||[]).map(id=>IMG.tag(id,'class="cimg"')).join('');
    const bub=m.text?`<div class="bubble${end?' tail':''}">${esc(m.text)}</div>`:'';
    const side=me?'':(end?avatarHTML('him'):'<div class="avsp"></div>');
    h+=`<div class="row ${me?'me':'him'}${start?' gs':''}" data-i="${i}">${side}<div class="stack">${imgs}${bub}</div></div>`;
    if(i===lastUser)h+=`<div class="rcpt">${m.status==='sent'?'已送达':'已读'+(m.readAt?' '+fmtTime(m.readAt):'')}</div>`;
  }
  if(typing){const l=C.at(-1);h+=`<div class="row him${l&&l.role==='model'?'':' gs'}">${avatarHTML('him')}<div class="stack"><div class="bubble tail typing"><i></i><i></i><i></i></div></div></div>`}
  box.innerHTML=h;
  box.querySelectorAll('img').forEach(i=>i.addEventListener('load',scrollChat,{once:true}));
  IMG.hydrate(box);scrollChat()}
function setTyping(on){typing=on;$('#status').textContent=on?'正在输入…':'';render()}
function ctxMsgs(){const list=DATA.chat.slice(-S.ctx),n=list.length;
  return list.map((m,k)=>({role:m.role,text:m.text||(m.images?.length?'（发了照片）':''),images:(m.images?.length&&k>=n-6)?m.images:undefined}))}
async function send(){
  if(busy)return;const ta=$('#chatInput');const text=ta.value.trim();
  if(text){DATA.chat.push({role:'user',text,t:Date.now(),status:'sent'});ta.value='';autoGrow(ta);await save();render()}
  if(DATA.chat.length)reply()}
async function reply(){
  busy=true;
  try{
    await sleep(700);
    const now=Date.now();let ch=false;
    DATA.chat.forEach(m=>{if(m.role==='user'&&m.status==='sent'){m.status='read';m.readAt=now;ch=true}});
    if(ch)save();
    setTyping(true);
    const out=await callAI(chatSystem(),ctxMsgs());
    const parts=S.split?out.split(/\n+/).map(s=>s.trim()).filter(Boolean):[out];
    for(let i=0;i<parts.length;i++){
      if(i)await sleep(Math.min(500+parts[i].length*45,2000));
      DATA.chat.push({role:'model',text:parts[i],t:Date.now()});
      if(i===parts.length-1)typing=false;
      render()}
    await save();
  }catch(e){toast(e.message)}finally{busy=false;setTyping(false)}}
async function reroll(){while(DATA.chat.length&&DATA.chat.at(-1).role==='model')DATA.chat.pop();await save();render();reply()}

$('#chatInput').addEventListener('input',e=>autoGrow(e.target));
$('#chatInput').addEventListener('focus',()=>setTimeout(scrollChat,400));
$('#sendBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#sendBtn').onclick=send;
$('#plusBtn').onclick=async()=>{
  const imgs=await pickPhotos(4,1024,.8);if(!imgs.length)return;
  const ids=await IMG.putAll(imgs);
  DATA.chat.push({role:'user',text:'',images:ids,t:Date.now(),status:'sent'});await save();render();if(!busy)reply()};
$('#msgs').onclick=e=>{
  const row=e.target.closest('.row[data-i]');if(!row||!e.target.closest('.stack'))return;
  const i=+row.dataset.i,m=DATA.chat[i];if(!m)return;const acts=[];
  if(e.target.matches('.cimg')&&e.target.src)acts.push(['查看大图',()=>viewImage(e.target.src)]);
  if(m.text)acts.push(['复制',()=>navigator.clipboard?.writeText(m.text).then(()=>toast('已复制'),()=>toast('复制失败'))]);
  if(m.role==='model'&&!busy&&DATA.chat.slice(i).every(x=>x.role==='model'))acts.push(['让他重新说',reroll]);
  acts.push(['删除这条',async()=>{const x=DATA.chat.splice(i,1)[0];await save();await IMG.del(x?.images);render()}]);
  sheet(acts)};

HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='chat')scrollChat()});
})();
