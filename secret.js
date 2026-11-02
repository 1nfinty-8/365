/* ===== 365 · secret.js · 秘密 ===== */
(()=>{
if(!Array.isArray(DATA.secret))DATA.secret=[];
Object.assign(DEFAULT,{sxPin:'',sxMode:'msg',sxExtra:'',sxRemember:false,sxProvider:'',sxKey:'',sxModel:'',sxBase:''});
const save=()=>saveData('secret');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const LOCK='<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
let open=false,busy=false,step=null;

document.head.insertAdjacentHTML('beforeend',`<style>
#page-secret{padding:0;overflow:hidden}
#page-secret.active{display:flex;flex-direction:column}
body.sx #tabbar{display:none}
.sx-top{flex:none;display:flex;align-items:center;gap:6px;padding:calc(var(--st) + 4px) 12px 6px}
.sx-title{flex:1;text-align:center;font-size:15px;letter-spacing:4px}
.sx-seg{display:flex;gap:2px;background:rgba(255,255,255,.35);border-radius:99px;padding:2px}
.sx-seg button{padding:5px 10px;border-radius:99px;font-size:12px;color:var(--sub);letter-spacing:1px}
.sx-seg button.on{background:var(--accent);color:var(--acct)}
#page-secret.locked .sx-seg,#page-secret.locked #sxMenu,#page-secret.locked #sxMsgs,#page-secret.locked .sx-bar{display:none}
#page-secret:not(.locked) #sxLock{display:none}
#sxMsgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:8px 14px 10px}
.sx-card{padding:18px 20px;margin:10px 0;border-radius:22px}
.sx-card.me{margin-left:12%}
.sx-card.him{margin-right:4%}
.sx-card .w{display:flex;font-size:12px;color:var(--sub);letter-spacing:2px;margin-bottom:8px}
.sx-card.me .w{color:var(--accent-t)}
.sx-card .w span{margin-left:auto;font-family:var(--en);font-style:italic;letter-spacing:0;color:var(--sub)}
.sx-card .b{font-family:var(--ti);font-size:16px;line-height:1.95;text-align:justify;word-break:break-word}
.sx-card .b p{margin:0 0 .8em}
.sx-card .b p:last-child{margin:0}
.sx-bar{flex:none;display:flex;align-items:flex-end;gap:8px;padding:6px 12px calc(var(--sb) + 6px)}
body.kb .sx-bar{padding-bottom:8px}
#sxLock{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 30px 18vh;text-align:center}
#sxLock .ic{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;color:var(--accent-t)}
#sxLock .ic svg.i{width:26px;height:26px}
#sxLock h3{font-weight:500;font-size:18px;letter-spacing:4px}
.sx-pin{width:180px;text-align:center;font-size:28px!important;letter-spacing:18px;padding:10px 0 10px 18px;border:0;border-radius:16px;background:rgba(255,255,255,.6);outline:none}
.sx-forgot{font-size:12px;color:var(--sub);margin-top:14px;letter-spacing:1px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page locked" id="page-secret">
  <div class="sx-top">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <div class="sx-title">秘密</div>
    <div class="sx-seg" id="sxSeg"><button data-m="msg">消息</button><button data-m="card">长卡片</button></div>
    <button class="iconbtn glass" id="sxMenu" style="letter-spacing:1px">···</button>
  </div>
  <div id="sxLock"></div>
  <div id="sxMsgs"></div>
  <div class="sx-bar">
    <div class="field glass">
      <textarea id="sxInput" rows="1" placeholder="…"></textarea>
      <button class="send" id="sxSend" aria-label="发送"><svg class="i" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
    </div>
  </div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="sxSet"><div class="mbox">
  <h3>秘密的设置</h3>
  <label class="f"><span>秘密设定（只在这里生效，可以不写，会加在人设和记忆后面）</span><textarea class="tall" data-k="sxExtra"></textarea></label>
  <label class="f"><span>秘密用的模型</span><select data-k="sxProvider" id="sxProv"><option value="">和平时一样</option><option value="gemini">Gemini</option><option value="openai">OpenAI 兼容（DeepSeek 等）</option></select></label>
  <div id="sxApi">
    <label class="f"><span>API Key（不填就用平时的）</span><input type="password" data-k="sxKey" autocomplete="off"></label>
    <label class="f"><span>模型</span><input data-k="sxModel" autocapitalize="off" autocomplete="off" placeholder="比如 gemini-2.5-pro"></label>
    <label class="f" id="sxBaseRow"><span>接口地址</span><input data-k="sxBase" autocapitalize="off" autocomplete="off" placeholder="比如 https://api.deepseek.com"></label>
  </div>
  <label class="chk"><input type="checkbox" data-k="sxRemember"><span>平时聊天时，他记得秘密里的事</span></label>
  <div class="mbtns"><button class="pill ghost" id="sxTest">测试连接</button><button class="pill" data-close="sxSet">好</button></div>
</div></div>`);

/* ---------- 密码 ---------- */
async function hash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('365:'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function renderLock(){
  const first=!S.sxPin;
  $('#sxLock').innerHTML=`<div class="ic glass">${LOCK}</div>
    <h3>${first?(step?'再输一次':'设一个密码'):'输入密码'}</h3>
    <input class="sx-pin" id="sxPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
    ${first?'<p class="hint">4 位数字，只存在这台手机上</p>':'<button class="sx-forgot" id="sxForgot">忘记密码</button>'}`;
  const i=$('#sxPin');
  i.oninput=()=>{i.value=i.value.replace(/\D/g,'').slice(0,4);if(i.value.length===4)tryPin(i.value)}}
async function tryPin(v){
  const h=await hash(v);
  if(!S.sxPin){
    if(!step){step=h;renderLock();return}
    if(step!==h){step=null;toast('两次不一样，重新设一次');renderLock();return}
    S.sxPin=h;step=null;saveSettings();toast('密码设好了');unlock();return}
  if(h===S.sxPin)unlock();else{toast('密码不对');$('#sxPin').value=''}}
function unlock(){open=true;$('#sxPin')?.blur();$('#page-secret').classList.remove('locked');render()}
function lock(){open=false;step=null;$('#page-secret').classList.add('locked');$('#sxMsgs').innerHTML='';$('#sxInput').value='';renderLock()}
$('#sxLock').addEventListener('click',async e=>{
  if(!e.target.closest('#sxForgot'))return;
  if(!confirm('忘记密码只能清空秘密里的所有记录，再重新设一个密码。确定吗？'))return;
  DATA.secret=[];await save();S.sxPin='';saveSettings();step=null;renderLock();toast('清空了，设一个新密码吧')});

/* ---------- 显示 ---------- */
function scroll(){const b=$('#sxMsgs');requestAnimationFrame(()=>b.scrollTop=b.scrollHeight)}
function render(){
  if(!open)return;
  $$('#sxSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===S.sxMode));
  const box=$('#sxMsgs'),L=DATA.secret,card=S.sxMode==='card';
  if(!L.length&&!busy){box.innerHTML='<div class="empty">这里只有你们两个人</div>';return}
  let h='';
  for(let i=Math.max(0,L.length-300);i<L.length;i++){
    const m=L[i],p=L[i-1],me=m.role==='user';
    if(card){const g=[i];
      while(L[i+1]&&L[i+1].role===m.role&&L[i+1].t-L[i].t<3e5){i++;g.push(i)}
      h+=`<div class="sx-card glass ${me?'me':'him'}" data-g="${g.join(',')}"><div class="w">${me?'我':esc(S.hisName)}<span>${fmtDate(m.t)}</span></div><div class="b">${g.map(k=>paras(L[k].text)).join('')}</div></div>`;
      continue}
    const n=L[i+1],newT=!p||m.t-p.t>3e5;
    if(newT)h+=`<div class="tstamp">${fmtDate(m.t)}</div>`;
    const st=newT||p.role!==m.role;
    let end=!n||n.role!==m.role||n.t-m.t>3e5;if(!n&&busy&&!me)end=false;
    h+=`<div class="row ${me?'me':'him'}${st?' gs':''}" data-i="${i}">${me?'':(end?avatarHTML('him'):'<div class="avsp"></div>')}<div class="stack"><div class="bubble${end?' tail':''}">${esc(m.text)}</div></div></div>`}
  if(busy)h+=card
    ?`<div class="sx-card glass him"><div class="w">${esc(S.hisName)}<span>正在写…</span></div><div class="typing"><i></i><i></i><i></i></div></div>`
    :`<div class="row him gs">${avatarHTML('him')}<div class="stack"><div class="bubble tail typing"><i></i><i></i><i></i></div></div></div>`;
  box.innerHTML=h;scroll()}
$('#sxSeg').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;S.sxMode=b.dataset.m;saveSettings();render()};

/* ---------- 和他说话 ---------- */
function system(card){
  let s=personaText()+'\n\n'+nowLine()+'\n【场景】这里是你们的小窝「365」里的「秘密」，只属于你们两个人，没有别人能看到。';
  if((S.sxExtra||'').trim())s+='\n\n'+S.sxExtra.trim();
  if(card)s+='\n【格式】这次写成一整段完整的长回复，可以分成几个自然段，段落之间换行。不要拆成很多短消息，不要加名字前缀。';
  else if(S.split)s+='\n【格式】像用手机发消息一样，一次可以发几条，每条单独一行。';
  return s}
async function secretAI(system,msgs){
  const c=S.sxProvider
    ?{provider:S.sxProvider,apiKey:S.sxKey||S.apiKey,model:S.sxModel||(S.sxProvider==='gemini'?'gemini-2.5-flash':'deepseek-chat'),baseUrl:S.sxBase||S.baseUrl}
    :{provider:S.provider,apiKey:S.apiKey,model:S.model,baseUrl:S.baseUrl};
  if(!c.apiKey)throw new Error('还没有填 API Key');
  const list=prep(msgs);let r,j,t;
  try{
    if(c.provider==='gemini'){
      const contents=list.map(m=>({role:m.role,parts:[{text:m.text||'…'}]}));
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent?key=${encodeURIComponent(c.apiKey)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:1},safetySettings:cats.map(x=>({category:x,threshold:'BLOCK_NONE'}))})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const cd=j.candidates?.[0];
      t=(cd?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
      if(!t)throw new Error('他没有回话（原因：'+(cd?.finishReason||j.promptFeedback?.blockReason||'未知')+'），再试一次或者换个模型');
    }else{
      const messages=[{role:'system',content:system},...list.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text||''}))];
      r=await fetch(String(c.baseUrl||'').replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.apiKey},body:JSON.stringify({model:c.model,messages,temperature:1})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      t=(j.choices?.[0]?.message?.content||'').trim();
      if(!t)throw new Error('他没有回话，再试一次');
    }
    return t;
  }catch(e){if(e instanceof TypeError)throw new Error('连不上，检查一下 VPN 和网络');throw e}}
async function send(){
  if(busy)return;const ta=$('#sxInput'),v=ta.value.trim();
  if(v){DATA.secret.push({role:'user',text:v,t:Date.now()});ta.value='';autoGrow(ta);await save();render()}
  if(DATA.secret.length)reply()}
async function reply(){
  busy=true;render();
  try{
    const card=S.sxMode==='card';
    const out=await secretAI(system(card),DATA.secret.slice(-(S.ctx||24)).map(m=>({role:m.role,text:m.text})));
    if(card||!S.split)DATA.secret.push({role:'model',text:clean(out),t:Date.now()});
    else{const parts=out.split(/\n+/).map(s=>clean(s)).filter(Boolean);
      for(let k=0;k<parts.length;k++){
        if(k)await sleep(Math.min(500+parts[k].length*40,1800));
        DATA.secret.push({role:'model',text:parts[k],t:Date.now()});
        if(k===parts.length-1)busy=false;render()}}
    await save()}
  catch(e){toast(e.message)}
  finally{busy=false;render()}}
async function reroll(){while(DATA.secret.length&&DATA.secret.at(-1).role==='model')DATA.secret.pop();await save();render();reply()}

$('#sxInput').addEventListener('input',e=>autoGrow(e.target));
$('#sxInput').addEventListener('focus',()=>setTimeout(scroll,400));
$('#sxSend').addEventListener('pointerdown',e=>e.preventDefault());
$('#sxSend').onclick=send;
$('#sxMsgs').onclick=e=>{
  const el=e.target.closest('[data-i],[data-g]');if(!el)return;
  if(el.dataset.i!=null&&!e.target.closest('.stack'))return;
  const L=DATA.secret,idx=el.dataset.g?el.dataset.g.split(',').map(Number):[+el.dataset.i];
  const text=idx.map(k=>L[k]?.text||'').join('\n'),first=idx[0];
  const acts=[['复制',()=>navigator.clipboard?.writeText(text).then(()=>toast('已复制'),()=>toast('复制失败'))]];
  if(L[first]?.role==='model'&&!busy&&L.slice(first).every(x=>x.role==='model'))acts.push(['让他重新说',reroll]);
  acts.push(['收进图书馆',()=>window.libImport?.(idx)]);
  acts.push(['删除',async()=>{DATA.secret=DATA.secret.filter((_,k)=>!idx.includes(k));await save();render()}]);
  sheet(acts)};

/* ---------- 设置 ---------- */
function updApi(){const v=$('#sxProv').value;$('#sxApi').style.display=v?'':'none';$('#sxBaseRow').style.display=v==='openai'?'':'none'}
$('#sxProv').addEventListener('change',updApi);
$('#sxTest').onclick=async()=>{toast('正在连接…');
  try{const r=await secretAI(system(false),[{role:'user',text:'跟我打个招呼，一句话就好。'}]);toast('✓ 连上了：'+r.slice(0,40))}
  catch(e){toast('✗ '+e.message)}};
$('#sxMenu').onclick=()=>sheet([
  ['设置',()=>{updApi();openModal('sxSet')}],
  ['修改密码',()=>{S.sxPin='';saveSettings();lock();toast('设一个新密码')}],
  ['清空秘密记录',async()=>{if(!confirm('清空秘密里的所有记录？清空就找不回来了。'))return;DATA.secret=[];await save();render()}],
  ['锁上',lock]]);

/* ---------- 平时记不记得 ---------- */
HOOKS.context.push(()=>{if(!S.sxRemember)return '';
  const L=DATA.secret.filter(m=>Date.now()-m.t<2*864e5).slice(-8);if(!L.length)return '';
  return '【秘密里】你们最近在「秘密」里聊过这些。平时你可以心照不宣地暗示，不要直白复述：\n'+L.map(m=>(m.role==='user'?'她':'你')+'：'+m.text.slice(0,60)).join('\n')});

addMore({go:'secret',cn:'秘密',ce:'secret'});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.secret))DATA.secret=[];renderLock()});
HOOKS.page.push(n=>{document.body.classList.toggle('sx',n==='secret');if(n!=='secret'&&open)lock();if(n==='secret'&&!open)renderLock()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&open)lock()});
})();

