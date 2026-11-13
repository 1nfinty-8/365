/* ===== 365 · moments.js · 朋友圈 ===== */
(()=>{
let pending=[],himPosting=false,rpSend=null;
const save=()=>saveData('moments');
const find=id=>DATA.moments.find(p=>p.id===id);
function renderPending(){$('#pendingImgs').innerHTML=pendHTML(pending)}
function render(){
  const box=$('#feed'),L=DATA.moments;
  if(!L.length){box.innerHTML='<div class="empty">还没有动态，发第一条吧</div>';return}
  box.innerHTML=L.map(p=>{
    const who=p.author==='me'?'me':'him',name=who==='me'?'我':S.hisName,cs=p.comments||[];
    const imgs=p.images?.length?`<div class="pimgs n${Math.min(p.images.length,3)}">${p.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:'';
    const like=p.liked?`<div class="plike">♡ ${esc(p.author==='me'?S.hisName:'我')}</div>`:'';
    const cm=cs.map((c,ci)=>`<div class="pc" data-cdel="${p.id}:${ci}"><b>${c.author==='me'?'我':esc(S.hisName)}</b>：${esc(c.text)}</div>`).join('');
    const th=p._thinking?`<div class="pc muted">${esc(S.hisName)} 正在输入…</div>`:'';
    return `<article class="post glass">${avatarHTML(who)}<div class="pbody"><div class="pname">${esc(name)}</div>
      ${p.text?`<div class="ptext">${esc(p.text)}</div>`:''}${imgs}
      <div class="pmeta"><span>${fmtDate(p.t)}</span><span class="pact"><button data-del="${p.id}">删除</button>${p.author==='him'?`<button data-like="${p.id}">${p.liked?'♥':'♡'}</button>`:''}<button data-cmt="${p.id}">评论</button></span></div>
      ${(like||cm||th)?`<div class="pcbox">${like}${cm}${th}</div>`:''}</div></article>`}).join('');
  IMG.hydrate(box)}
const sys=()=>sceneSystem('这是你们的小窝「365」里的朋友圈，只有你们两个人能看到。');
function prompt(p){
  const cs=p.comments||[];
  let s=`${p.author==='me'?'她':'你'}发了一条朋友圈：\n「${p.text||'（只发了照片）'}」`;
  if(p.images?.length)s+=`\n（附了${p.images.length}张照片${S.provider==='gemini'?'，就是给你看的这些':''}）`;
  if(cs.length)s+='\n\n下面的评论：\n'+cs.map(c=>`${c.author==='me'?'她':'你'}：${c.text}`).join('\n')+`\n\n请以${S.hisName}的身份回复她最新的那条评论。`;
  else s+=`\n\n请以${S.hisName}的身份在下面评论。`;
  return s+'只输出评论内容本身，口语化，一到三句，不要加引号或名字前缀。'}
async function himReact(p){
  if(p._thinking)return;p._thinking=true;render();
  try{await sleep(1000);const t=await callAI(sys(),[{role:'user',text:prompt(p),images:p.images?.length?p.images:undefined}]);
    if(p.author==='me')p.liked=true;(p.comments=p.comments||[]).push({author:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  delete p._thinking;await save();render()}
async function post(){
  const ta=$('#momText'),text=ta.value.trim();
  if(!text&&!pending.length)return toast('写点什么或者放张照片吧');
  const images=await IMG.putAll(pending);
  const p={id:uid(),author:'me',text,images,t:Date.now(),liked:false,comments:[]};
  DATA.moments.unshift(p);pending=[];ta.value='';renderPending();await save();render();himReact(p)}
async function himPost(){
  if(himPosting)return;himPosting=true;toast(`${S.hisName}在想要发什么…`);
  try{const recent=recentChat(12);
    const t=await callAI(sys(),[{role:'user',text:`请以${S.hisName}的身份发一条朋友圈。可以是想她、记录日常、或者想对她说的话，像真人发朋友圈一样自然，不超过80字。${recent?'\n你们最近的聊天：\n'+recent:''}\n只输出朋友圈正文。`}]);
    DATA.moments.unshift({id:uid(),author:'him',text:clean(t),images:[],t:Date.now(),liked:false,comments:[]});
    await save();render()}
  catch(e){toast(e.message)}finally{himPosting=false}}

/* ---------- 朋友圈自己的回复栏：贴在键盘正上方 ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#mmRp{position:fixed;left:0;right:0;top:0;z-index:9999;display:none;padding:8px 12px calc(10px + env(safe-area-inset-bottom));pointer-events:none}
#mmRp.show{display:block}
#mmRp.kb{padding-bottom:8px}
.mmrp-in{display:flex;align-items:flex-end;gap:8px;padding:6px 6px 6px 16px;border-radius:24px;pointer-events:auto}
#mmRpIn{flex:1;min-width:0;border:0;background:transparent;outline:none;resize:none;font:inherit;font-size:16px;line-height:1.5;max-height:30vh;padding:7px 0;color:var(--ink)}
#mmRpGo{flex:none}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="mmRp"><div class="mmrp-in glass"><textarea id="mmRpIn" rows="1" enterkeyhint="send"></textarea><button class="pill" id="mmRpGo">发送</button></div></div>`);
const vv=window.visualViewport;
function place(){const b=$('#mmRp');if(!b.classList.contains('show'))return;
  const full=document.documentElement.clientHeight,H=vv?vv.height:full,top=vv?vv.offsetTop:0;
  b.classList.toggle('kb',full-H>120);
  b.style.top=Math.max(0,top+H-b.offsetHeight)+'px'}
if(vv){vv.addEventListener('resize',place);vv.addEventListener('scroll',place)}
function openRp(ph,cb){const b=$('#mmRp'),i=$('#mmRpIn');rpSend=cb;i.placeholder=ph;i.value='';i.style.height='';
  b.classList.add('show');place();i.focus();[60,300,600].forEach(t=>setTimeout(place,t))}
function closeRp(){$('#mmRp').classList.remove('show');rpSend=null;$('#mmRpIn').blur()}
async function sendRp(){const v=$('#mmRpIn').value.trim();if(!v||!rpSend)return;const cb=rpSend;closeRp();await cb(v)}
$('#mmRpGo').addEventListener('pointerdown',e=>e.preventDefault());
$('#mmRpGo').onclick=sendRp;
$('#mmRpIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sendRp()}});
$('#mmRpIn').addEventListener('input',e=>{if(typeof autoGrow==='function')autoGrow(e.target);place()});
$('#mmRpIn').addEventListener('blur',()=>setTimeout(()=>{const i=$('#mmRpIn');if(document.activeElement!==i&&!i.value.trim())closeRp();else place()},250));

$('#addPhoto').onclick=async()=>{pending.push(...await pickPhotos(9-pending.length));renderPending()};
$('#pendingImgs').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){pending.splice(+b.dataset.rm,1);renderPending()}};
$('#postBtn').onclick=post;
$('#himPostBtn').onclick=himPost;
$('#feed').onclick=async e=>{const t=e.target;
  const d=t.closest('[data-del]');if(d){const p=find(d.dataset.del);if(p&&confirm('删除这条动态？')){DATA.moments=DATA.moments.filter(x=>x!==p);await save();await IMG.del(p.images);render()}return}
  const l=t.closest('[data-like]');if(l){const p=find(l.dataset.like);p.liked=!p.liked;await save();render();return}
  const c=t.closest('[data-cmt]');if(c){const p=find(c.dataset.cmt);if(!p)return;
    openRp(p.author==='me'?'补充点什么…':`回复${S.hisName}…`,async v=>{(p.comments=p.comments||[]).push({author:'me',text:v,t:Date.now()});await save();render();himReact(p)});return}
  const cd=t.closest('[data-cdel]');if(cd){const[id,ci]=cd.dataset.cdel.split(':');const p=find(id);
    sheet([['复制',()=>navigator.clipboard?.writeText(p.comments[+ci].text).then(()=>toast('已复制'))],
           ['删除这条评论',async()=>{p.comments.splice(+ci,1);await save();render()}]])}};

HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(()=>{if($('#mmRp').classList.contains('show'))closeRp()});
})();
