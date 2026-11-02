/* ===== 365 · chat.js · 聊天 + 语音 ===== */
(()=>{
let busy=false,typing=false,playId=null,au=null;
const save=()=>saveData('chat');
const MIC='<svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
const PLAY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l11-7z"/></svg>';
const vlabel=(dur,tx)=>`[语音 ${dur}秒] `+(tx||'（没听清说了什么）');

document.head.insertAdjacentHTML('beforeend',`<style>
.vbub{display:flex;align-items:center;gap:8px;min-width:76px;max-width:100%;cursor:pointer}
.row.me .vbub{flex-direction:row-reverse}
.vbub svg{width:13px;height:13px;flex:none}
.vwave{flex:1;display:flex;align-items:center;gap:3px;height:16px}
.row.me .vwave{justify-content:flex-end}
.vwave i{width:3px;border-radius:2px;background:currentColor;opacity:.75}
.vwave i:nth-child(1){height:6px}.vwave i:nth-child(2){height:12px}.vwave i:nth-child(3){height:16px}.vwave i:nth-child(4){height:10px}.vwave i:nth-child(5){height:7px}
.vbub.playing .vwave i{animation:vw .8s ease-in-out infinite}
.vbub.playing .vwave i:nth-child(2){animation-delay:.12s}
.vbub.playing .vwave i:nth-child(3){animation-delay:.24s}
.vbub.playing .vwave i:nth-child(4){animation-delay:.36s}
.vbub.playing .vwave i:nth-child(5){animation-delay:.48s}
@keyframes vw{50%{transform:scaleY(.35)}}
.vdur{font-family:var(--num);font-size:14px;flex:none}
.vtx{font-size:12.5px;color:var(--sub);margin-top:4px;max-width:240px;line-height:1.5;word-break:break-word}
.row.me .vtx{text-align:right;margin-left:auto}
.vtx.no{opacity:.75;text-decoration:underline dotted}
.vrec{position:absolute;inset:0;z-index:6;display:none;align-items:center;gap:8px;padding:0 8px 0 16px;border-radius:inherit;background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.vrec.on{display:flex}
.vr-dot{width:10px;height:10px;border-radius:50%;background:#E5484D;flex:none;animation:vrd 1s infinite}
@keyframes vrd{50%{opacity:.3}}
#vrT{font-family:var(--num);font-style:italic;font-weight:400;font-size:17px;flex:none;min-width:38px}
#vrTx{flex:1;min-width:0;font-size:12.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vrec .pill{padding:7px 14px;font-size:13px;flex:none}
</style>`);

/* 麦克风按钮 + 录音条 */
const pb=$('#plusBtn');
pb.insertAdjacentHTML('afterend',`<button id="micBtn" aria-label="语音">${MIC}</button>`);
$('#micBtn').className=pb.className;
const bar=$('#sendBtn').parentElement;
if(getComputedStyle(bar).position==='static')bar.style.position='relative';
bar.insertAdjacentHTML('beforeend',`<div class="vrec" id="vrec"><i class="vr-dot"></i><b id="vrT">0:00</b><span id="vrTx">正在听…</span><button class="pill ghost" id="vrNo">取消</button><button class="pill" id="vrOk">发送</button></div>`);

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
    let bub='';
    if(m.voice){const v=m.voice;
      bub=`<div class="bubble vbub${end?' tail':''}${v.id===playId?' playing':''}" data-vid="${v.id}" style="width:${Math.min(220,76+v.dur*4)}px">${PLAY}<span class="vwave"><i></i><i></i><i></i><i></i><i></i></span><span class="vdur">${v.dur}″</span></div>
        <div class="vtx${v.tx?'':' no'}">${v.tx?esc(v.tx):'没听清 · 点这里补上文字'}</div>`}
    else if(m.text)bub=`<div class="bubble${end?' tail':''}">${esc(m.text)}</div>`;
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
    const out=await (window.webReply||callAI)(chatSystem(),ctxMsgs());
    const parts=S.split?out.split(/\n+/).map(s=>s.trim()).filter(Boolean):[out];
    for(let i=0;i<parts.length;i++){
      if(i)await sleep(Math.min(500+parts[i].length*45,2000));
      DATA.chat.push({role:'model',text:parts[i],t:Date.now()});
      if(i===parts.length-1)typing=false;
      render()}
    await save();
  }catch(e){toast(e.message)}finally{busy=false;setTyping(false)}}
async function reroll(){while(DATA.chat.length&&DATA.chat.at(-1).role==='model')DATA.chat.pop();await save();render();reply()}

/* ---------- 录音 ---------- */
let rec=null,stream=null,chunks=[],t0=0,tEnd=0,tick=null,asr=null,asrDone=null,tx='',cancel=false;
const MT=()=>window.MediaRecorder?(['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported?.(t))||''):'';
function showT(){const s=Math.floor((Date.now()-t0)/1000);$('#vrT').textContent=`${Math.floor(s/60)}:${pad(s%60)}`}
async function startRec(){
  if(rec)return;
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return toast('这台手机不支持录音');
  $('#chatInput').blur();stopV();
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast('没有麦克风权限，去设置里打开')}
  chunks=[];tx='';cancel=false;const mt=MT();
  try{rec=new MediaRecorder(stream,mt?{mimeType:mt}:undefined)}catch(e){stream.getTracks().forEach(t=>t.stop());stream=null;return toast('录音失败：'+e.message)}
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  rec.onstop=finish;
  rec.start();t0=Date.now();
  $('#vrec').classList.add('on');$('#vrTx').textContent='正在听…';showT();
  tick=setInterval(()=>{showT();if(Date.now()-t0>=60000)stopRec(false)},250);
  startAsr()}
function startAsr(){asr=null;asrDone=null;if(S.voiceAsr===false)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;
  try{const a=new SR();a.lang='zh-CN';a.continuous=true;a.interimResults=true;
    a.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;tx=s.trim();if(tx)$('#vrTx').textContent=tx};
    asrDone=new Promise(r=>{a.onend=r;a.onerror=r});
    a.start();asr=a}catch(e){asr=null;asrDone=null}}
function stopRec(isCancel){if(!rec)return;cancel=isCancel;tEnd=Date.now();clearInterval(tick);
  try{asr?.stop()}catch(e){}
  try{if(rec.state!=='inactive')rec.stop();else finish()}catch(e){finish()}}
async function finish(){
  const r=rec;if(!r)return;rec=null;
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  $('#vrec').classList.remove('on');
  if(asrDone)await Promise.race([asrDone,sleep(1200)]);
  if(cancel)return;
  const ms=(tEnd||Date.now())-t0;
  if(ms<800)return toast('说话时间太短');
  const blob=new Blob(chunks,{type:r.mimeType||chunks[0]?.type||'audio/mp4'});
  if(!blob.size)return toast('没录到声音，再试一次');
  const data=await new Promise(res=>{const f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(blob)});
  const[id]=await IMG.putAll([data]);
  const dur=Math.max(1,Math.round(ms/1000)),t=tx.trim();
  DATA.chat.push({role:'user',text:vlabel(dur,t),voice:{id,dur,tx:t},t:Date.now(),status:'sent'});
  await save();render();if(!busy)reply()}

/* ---------- 播放 ---------- */
function mark(){$$('#msgs .vbub').forEach(b=>b.classList.toggle('playing',b.dataset.vid===playId))}
function stopV(){if(au){try{au.pause()}catch(e){}au=null}playId=null;mark()}
async function playV(id){
  if(playId===id){stopV();return}
  stopV();const d=await IMG.get(id);if(!d)return toast('这条语音找不到了');
  au=new Audio(d);playId=id;mark();
  au.onended=stopV;au.play().catch(()=>{stopV();toast('播放不了这条语音')})}

$('#chatInput').addEventListener('input',e=>autoGrow(e.target));
$('#chatInput').addEventListener('focus',()=>setTimeout(scrollChat,400));
$('#sendBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#sendBtn').onclick=send;
$('#micBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#micBtn').onclick=startRec;
$('#vrNo').onclick=()=>stopRec(true);
$('#vrOk').onclick=()=>stopRec(false);
$('#plusBtn').onclick=async()=>{
  const imgs=await pickPhotos(4,1024,.8);if(!imgs.length)return;
  const ids=await IMG.putAll(imgs);
  DATA.chat.push({role:'user',text:'',images:ids,t:Date.now(),status:'sent'});await save();render();if(!busy)reply()};
document.head.insertAdjacentHTML('beforeend','<style>.vbub{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>');
function menu(i,el){
  const m=DATA.chat[i];if(!m)return;const acts=[];
  if(el&&el.matches&&el.matches('.cimg')&&el.src)acts.push(['查看大图',()=>viewImage(el.src)]);
  if(m.voice)acts.push([playId===m.voice.id?'停止播放':'播放',()=>playV(m.voice.id)]);
  const tx=m.voice?m.voice.tx:m.text;
  if(tx)acts.push(['复制',()=>navigator.clipboard?.writeText(tx).then(()=>toast('已复制'),()=>toast('复制失败'))]);
  if(m.voice){
    acts.push([m.voice.tx?'改一改文字':'补上文字',async()=>{const v=prompt('这条语音说了什么？',m.voice.tx||'');if(v==null)return;
      m.voice.tx=v.trim();m.text=vlabel(m.voice.dur,m.voice.tx);await save();render()}]);
    acts.push([S.voiceAsr===false?'打开自动转文字':'关闭自动转文字',()=>{S.voiceAsr=S.voiceAsr===false;saveSettings();toast(S.voiceAsr?'自动转文字打开了':'自动转文字关掉了')}])}
  if(m.role==='model'&&!busy&&DATA.chat.slice(i).every(x=>x.role==='model'))acts.push(['让他重新说',reroll]);
  acts.push(['删除这条',async()=>{if(m.voice&&playId===m.voice.id)stopV();const x=DATA.chat.splice(i,1)[0];await save();await IMG.del(x?.images);if(x?.voice)await IMG.del([x.voice.id]);render()}]);
  sheet(acts)}
let lpT=null,lpFired=false;
$('#msgs').addEventListener('touchstart',e=>{const vb=e.target.closest('.vbub');if(!vb)return;lpFired=false;clearTimeout(lpT);
  lpT=setTimeout(()=>{lpFired=true;const row=vb.closest('.row[data-i]');if(row)menu(+row.dataset.i,vb)},500)},{passive:true});
['touchend','touchmove','touchcancel'].forEach(ev=>$('#msgs').addEventListener(ev,()=>clearTimeout(lpT),{passive:true}));
$('#msgs').onclick=e=>{
  const vb=e.target.closest('.vbub');
  if(vb){if(lpFired){lpFired=false;return}playV(vb.dataset.vid);return}
  const row=e.target.closest('.row[data-i]');if(!row||!e.target.closest('.stack'))return;
  menu(+row.dataset.i,e.target)};

document.addEventListener('visibilitychange',()=>{if(document.hidden){stopV();if(rec)stopRec(true)}});
HOOKS.ready.push(render);
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='chat')scrollChat();else{stopV();if(rec)stopRec(true)}});
})();
