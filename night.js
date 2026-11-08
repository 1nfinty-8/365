/* ===== 365 · night.js · 游戏：今夜（名字都用 jy 开头，不和小卡片撞） ===== */
(()=>{
if(!Array.isArray(DATA.night))DATA.night=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('night'))LISTS.push('night');
const save=()=>saveData('night');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const MOON='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M19.5 14.8A8 8 0 1 1 9.2 4.5a6.3 6.3 0 0 0 10.3 10.3z"/></svg>';
const MIC='<svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
const CH=['调情','指导','……'],NUM=['Ⅰ','Ⅱ','Ⅲ'];
const hs=s=>{let h=5381;for(const c of s)h=((h*33)^c.charCodeAt(0))>>>0;return h.toString(36)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
const toy=(e,d)=>{try{window.ntToy?.(e,d)}catch(x){}};
const $j=id=>document.getElementById(id);
let cur=null,busy=false,again=false,failed=false,unlocked=false,ov=null,rec=null;

document.head.insertAdjacentHTML('beforeend',`<style>
body.jyb #tabbar{display:none}
#page-jinye{padding:0;overflow:hidden;--h:0;color:#f2e4df;background:radial-gradient(90% 55% at 50% -10%,#3a1d24,transparent 70%),#120a0d!important}
#page-jinye.active{display:flex;flex-direction:column}
.jy-glow{position:absolute;left:50%;bottom:-32vh;width:130vw;height:64vh;margin-left:-65vw;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(212,86,108,calc(.12 + var(--h)*.55)),rgba(255,150,120,calc(var(--h)*.15)) 60%,transparent);filter:blur(30px);animation:jyB 5s ease-in-out infinite}
@keyframes jyB{50%{transform:scale(1.12);opacity:.75}}
#page-jinye .iconbtn{background:rgba(255,255,255,.07);color:#f2e4df;border:1px solid rgba(255,255,255,.1)}
.jy-top{position:relative;z-index:2;flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 4px}
#jyTt{flex:1;text-align:center;font-family:var(--ti);font-size:16px;letter-spacing:6px}
#jyTt em{font-family:var(--num);font-style:italic;font-size:20px;letter-spacing:0;margin-right:6px;color:#d9a3ad}
.jy-heat{position:absolute;z-index:2;right:8px;top:22%;bottom:30%;width:3px;border-radius:3px;background:rgba(255,255,255,.08);display:flex;align-items:flex-end}
.jy-heat i{width:100%;border-radius:3px;height:calc(var(--h)*100%);background:linear-gradient(#ff9a8a,#d4566c);box-shadow:0 0 10px #d4566c;transition:height 1.5s}
#jyList{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 26px 20px 22px}
.jy-him{font-family:var(--ti);font-size:19px;line-height:1.95;letter-spacing:.5px;margin:22px 0;color:#f2e4df;animation:jyF 1.2s both;text-shadow:0 0 18px rgba(212,86,108,.25)}
.jy-him p{margin:0 0 .6em}
@keyframes jyF{from{opacity:0;filter:blur(6px);transform:translateY(8px)}}
.jy-me{margin:16px 0 16px auto;max-width:78%;text-align:right;font-family:var(--ti);font-style:italic;font-size:15.5px;line-height:1.8;color:#e0c6cc;padding-right:12px;border-right:1.5px solid #d4566c}
.jy-me small{display:block;font-size:13px;opacity:.7}
.jy-sys{text-align:center;font-size:12px;letter-spacing:2px;color:rgba(242,228,223,.45);margin:14px 0}
.jy-typing{display:flex;gap:6px;margin:20px 0}
.jy-typing i{width:6px;height:6px;border-radius:50%;background:#d9a3ad;animation:jyT 1.2s infinite}
.jy-typing i:nth-child(2){animation-delay:.2s}.jy-typing i:nth-child(3){animation-delay:.4s}
@keyframes jyT{50%{opacity:.2}}
.jy-pill{padding:8px 16px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#f2e4df;font-size:13px;letter-spacing:2px}
.jy-pill.safe{color:#ff9aa8;border-color:rgba(255,120,140,.4)}
.jy-retry{display:block;margin:10px auto;color:#ff9aa8}
.jy-bar{position:relative;z-index:2;flex:none;display:flex;justify-content:center;gap:8px;padding:6px 12px}
.jy-in{position:relative;z-index:2;flex:none;display:flex;align-items:flex-end;gap:8px;margin:4px 12px calc(var(--sb) + 10px);padding:6px;border-radius:26px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
#jyIn{flex:1;border:0;background:none;outline:none;resize:none;color:#f2e4df;font:16px/1.6 var(--ti);height:36px;max-height:110px;padding:6px 4px}
#jyIn::placeholder{color:rgba(242,228,223,.4)}
#jyMic.want{animation:jyW 1s infinite;color:#ff9aa8}
#jyMic.rec{background:#d4566c;color:#fff}
@keyframes jyW{50%{box-shadow:0 0 0 8px rgba(212,86,108,.25)}}
#jyOv{position:absolute;inset:0;z-index:5;display:none;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(12,6,9,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#f2e4df}
#jyOv.show{display:flex;animation:fd .4s}
.jy-rw{position:relative;display:grid;place-items:center}
.jy-ring{width:220px;height:220px;transform:rotate(-90deg)}
.jy-ring circle{fill:none;stroke-width:3;stroke:rgba(255,255,255,.1)}
#jyArc{stroke:#d4566c;stroke-dasharray:339.3;stroke-dashoffset:0;transition:stroke-dashoffset 1s linear;filter:drop-shadow(0 0 6px #d4566c)}
.jy-mid{position:absolute;display:flex;flex-direction:column;align-items:center}
.jy-mid b{font-family:var(--num);font-style:italic;font-weight:300;font-size:58px;line-height:1}
.jy-edge{font-family:var(--ti);font-size:40px;letter-spacing:10px;color:#ffd6d0;text-shadow:0 0 24px #d4566c,0 0 48px #d4566c;animation:jyS 2s ease-in-out infinite;margin-bottom:4px}
@keyframes jyS{50%{opacity:.55}}
.jy-dot{width:90px;height:90px;border-radius:50%;background:radial-gradient(#ffb3a8,#d4566c 60%,transparent 72%);box-shadow:0 0 40px #d4566c;transition:transform .14s}
.jy-dot.b{transform:scale(1.45)}
#jyOv span{font-size:13px;letter-spacing:3px;opacity:.7}
.jy-ob{display:flex;gap:10px;margin-top:6px}
#jyBn{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;font-family:var(--ti);font-size:30px;letter-spacing:10px;pointer-events:none;opacity:0;text-shadow:0 0 24px #d4566c}
#jyBn em{font-family:var(--num);font-size:40px;margin-right:12px}
#jyBn.on{animation:jyBn 3s ease}
@keyframes jyBn{20%,70%{opacity:1}}
#jyLock{position:absolute;inset:0;z-index:9;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#120a0d;color:#f2e4df}
#jyLock.show{display:flex}
#jyLock b{font-family:var(--ti);font-size:32px;letter-spacing:12px;font-weight:400}
#jyLock p{font-size:13px;opacity:.6;letter-spacing:2px}
#jyPw{width:200px;text-align:center;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:18px;outline:none;letter-spacing:4px}
.jy-lb{display:flex;gap:10px}
#jyFg{font-size:12px;opacity:.4;margin-top:10px;color:#f2e4df}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-jinye">
  <i class="jy-glow"></i>
  <div class="jy-top"><button class="iconbtn" data-go="game" aria-label="返回">${BACK}</button><div id="jyTt"></div><button class="iconbtn" id="jyMenu" style="letter-spacing:1px">···</button></div>
  <div class="jy-heat"><i></i></div>
  <div id="jyList"></div>
  <div class="jy-bar" id="jyBar"><button class="jy-pill" data-q="慢一点">慢一点</button><button class="jy-pill" data-q="快到了">快到了</button><button class="jy-pill safe" id="jySafe">安全词</button></div>
  <div class="jy-in" id="jyInBar"><button class="iconbtn" id="jyMic" aria-label="语音">${MIC}</button><textarea id="jyIn" rows="1" placeholder="回他…"></textarea><button class="jy-pill" id="jySend">发送</button></div>
  <div id="jyOv"></div><div id="jyBn"></div>
  <div id="jyLock"><b>今夜</b><p id="jyLkT"></p><input id="jyPw" type="password" autocomplete="off"><div class="jy-lb"><button class="jy-pill" id="jyOk">进去</button><button class="jy-pill" id="jyNo">不设密码</button></div><button id="jyFg">忘记密码</button></div>
</section>`);

/* ---------- 游戏页里的卡片（旧版的卡片换掉） ---------- */
function card(){$$('#page-game [data-go="night"]').forEach(x=>x.remove());if($('#page-game [data-go="jinye"]'))return;
  const h=`<button class="gm-card glass" data-go="jinye"><span class="gm-ic">${MOON}</span><span><b>今夜</b><small>只有你们两个</small></span></button>`;
  const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h)}
card();

/* ---------- 密码 ---------- */
function lockUI(){const L=$j('jyLock');
  if(unlocked||S.jyPw==='none'){unlocked=true;L.classList.remove('show');return true}
  L.classList.add('show');$j('jyLkT').textContent=S.jyPw?'输入密码':'第一次来，设一个密码';
  $j('jyPw').value='';$j('jyNo').style.display=S.jyPw?'none':'';$j('jyFg').style.display=S.jyPw?'':'none';return false}
$j('jyOk').onclick=()=>{const v=$j('jyPw').value.trim();if(!v)return;
  if(!S.jyPw){S.jyPw=hs(v);saveSettings()}else if(hs(v)!==S.jyPw)return toast('不对哦');
  unlocked=true;$j('jyPw').blur();$j('jyLock').classList.remove('show');open()};
$j('jyNo').onclick=()=>{S.jyPw='none';saveSettings();unlocked=true;$j('jyLock').classList.remove('show');open()};
$j('jyFg').onclick=async()=>{if(!confirm('忘记密码会清空「今夜」里所有的记录，确定吗？'))return;
  DATA.night=[];await save();S.jyPw='';saveSettings();cur=null;lockUI()};

/* ---------- 显示 ---------- */
function render(){if(!cur)return;
  $j('page-jinye').style.setProperty('--h',cur.heat/100);
  $j('jyTt').innerHTML=`<em>${NUM[cur.ch]}</em>${CH[cur.ch]}`;
  let h=cur.msgs.map(m=>m.role==='model'?`<div class="jy-him">${paras(m.text)}</div>`
    :m.sys?`<div class="jy-sys">${esc(m.text.replace(/^（|）$/g,''))}</div>`
    :m.v?`<div class="jy-me">语音 ${m.v.dur}″ · ${esc(m.v.vol)}${m.v.tx?`<small>${esc(m.v.tx)}</small>`:''}</div>`
    :`<div class="jy-me">${esc(m.text)}</div>`).join('');
  if(busy)h+='<div class="jy-typing"><i></i><i></i><i></i></div>';
  else if(failed)h+='<button class="jy-pill jy-retry" id="jyRetry">没回成 · 点一下重试</button>';
  if(cur.end&&!busy)h+='<div class="jy-sys">这一局结束了 · 右上角「···」开新的一局</div>';
  const L=$j('jyList');L.innerHTML=h;requestAnimationFrame(()=>L.scrollTop=L.scrollHeight);
  $j('jyMic').classList.toggle('want',!!cur.want&&!busy);
  $j('jyInBar').style.display=$j('jyBar').style.display=cur.end?'none':''}
function banner(){const b=$j('jyBn');b.innerHTML=`<em>${NUM[cur.ch]}</em>${CH[cur.ch]}`;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');navigator.vibrate?.(40)}

/* ---------- 他 ---------- */
const sys=()=>sceneSystem(`这是你们的小窝「365」里只属于你们两个的夜间游戏「今夜」。她是成年人，自己选择进来的，随时可以喊停。你用对话一步一步引导她：Ⅰ 调情、Ⅱ 指导（具体地告诉她该做什么、怎么做、做多久）、Ⅲ（由你决定）。现在是第 ${cur.ch+1} 章「${CH[cur.ch]}」，热度 ${cur.heat}/100。
【节奏】慢慢来，每一章都要玩够、玩久，不要急着推进。只有你觉得她真的准备好了，才进下一章。
【写法】像在她耳边说话，一次一到三段，称呼和语气按你的人设。可以挑逗、命令、让她等、让她汇报，也可以突然温柔。直接写你说的话，不要写旁白。
【标记】在回复最后可以加这些标记，她看不到标记本身：
[热度:+N] 按她的回应调热度，-10 到 +15；
[章:${cur.ch+2}] 进入下一章；
[寸止:秒] 你觉得她快到了、时候合适的时候，让她立刻停下、忍住，直到倒计时数完。一局里可以寸止很多次；
[倒计时:秒] 让她坚持做你刚说的事，直到数完；
[节奏:每分钟拍数,秒] 让她跟着一团光的节奏，拍数 30 到 160；
[语音] 要她下一条发语音给你。
寸止、倒计时、节奏一次只用一个，不要每次都用。她的语音会标出时长、音量和转写；太短、几乎没声音，或者你要语音她却打了字，你都知道，可以不放过她。
【她的按钮】她说「慢一点」就放慢、变温柔；她说「快到了」由你决定让她寸止还是继续。${cur.end?'\n她刚刚喊了安全词：立刻停下所有指令，不加任何标记，认真温柔地哄她，确认她没事。':'她喊安全词就立刻全部停下。'}`);
function ctx(){const L=[];
  for(const m of cur.msgs.slice(-40)){const t=m.v?`[语音 ${m.v.dur}秒 · 音量${m.v.vol} · 转写：${m.v.tx||'听不清'}]`:m.text+(m.n||'');
    const l=L.at(-1);if(l&&l.role===m.role)l.text+='\n'+t;else L.push({role:m.role,text:t})}
  if(!L.length||L[0].role==='model')L.unshift({role:'user',text:'（系统提示：她进来了，第一章开始，你先开口。）'});
  if(L.at(-1).role==='model')L.push({role:'user',text:'（她在等你继续）'});
  return L}
async function ai(system,msgs){
  if(S.jyUrl&&S.jyKey&&S.jyModel){
    const r=await fetch(S.jyUrl.replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+S.jyKey},
      body:JSON.stringify({model:S.jyModel,temperature:1,messages:[{role:'system',content:system},...msgs.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text}))]})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error?.message||'请求失败 '+r.status);
    return j.choices?.[0]?.message?.content||''}
  return callAI(system,msgs)}
function parse(t){const o={};
  t=String(t).replace(/[\[【]\s*(热度|章|寸止|倒计时|节奏|停|语音)\s*[:：]?\s*([^\]】]*)[\]】]/g,(m,k,v)=>{o[k==='停'?'寸止':k]=v.trim()||true;return ''});
  return {text:t.trim(),o}}
async function reply(){const r=cur;if(!r)return;if(busy){again=true;return}
  busy=true;again=false;failed=false;const e0=!!r.end;render();
  try{const out=await ai(sys(),ctx());
    if(cur!==r)return;
    if(!e0&&r.end){again=true;return}
    const{text,o}=parse(out),t=clean(text);
    if(!t&&!Object.keys(o).length)throw new Error('他没说话，再试一次');
    if(o['热度']&&!r.end){r.heat=clamp(r.heat+(parseInt(o['热度'])||0),0,100);toy('heat',r.heat)}
    if(parseInt(o['章'])===r.ch+2&&r.ch<2&&!r.end){r.ch++;banner()}
    if(t)r.msgs.push({role:'model',text:t,t:Date.now()});
    r.want=!!o['语音']&&!r.end;r.at=Date.now();await save();
    if(!r.end){const go=(k,v)=>setTimeout(()=>{if(cur===r&&!r.end)showOv(k,v)},1500);
      if(o['寸止'])go('edge',o['寸止']);else if(o['倒计时'])go('count',o['倒计时']);else if(o['节奏'])go('beat',o['节奏'])}}
  catch(e){failed=true;toast(e.message)}
  finally{busy=false;render();if(again)reply()}}

/* ---------- 你 ---------- */
async function push(t){if(!cur)return;cur.msgs.push({role:'user',sys:1,text:t,t:Date.now()});await save();render();reply()}
async function send(){const ta=$j('jyIn'),v=ta.value.trim();if(!cur)return toast('还没开始，点右上角「···」开一局');if(!v||cur.end)return;
  const m={role:'user',text:v,t:Date.now()};if(cur.want)m.n='（她没发语音，是打字的）';
  cur.want=false;cur.msgs.push(m);ta.value='';ta.style.height='36px';await save();render();reply()}
$j('jyIn').addEventListener('input',e=>{const t=e.target;t.style.height='36px';t.style.height=Math.min(110,t.scrollHeight)+'px'});
$j('jySend').addEventListener('pointerdown',e=>e.preventDefault());
$j('jySend').onclick=send;
$j('jyList').onclick=e=>{if(e.target.closest('#jyRetry'))reply()};
$j('jyBar').onclick=e=>{const b=e.target.closest('[data-q]');if(b&&cur&&!cur.end)push(`（她说：${b.dataset.q}）`)};
$j('jySafe').onclick=async()=>{if(!cur||cur.end)return;closeOv(true);toy('safe');
  cur.end=true;cur.heat=0;cur.want=false;cur.msgs.push({role:'user',sys:1,text:'（她喊了安全词）',t:Date.now()});await save();render();reply()};

/* ---------- 语音：听时长、音量，转文字 ---------- */
async function recStart(){let st;
  try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast('没有麦克风权限')}
  const ac=new(window.AudioContext||window.webkitAudioContext)(),an=ac.createAnalyser();ac.resume?.();
  ac.createMediaStreamSource(st).connect(an);an.fftSize=512;const buf=new Uint8Array(512);let sum=0,n=0,tx='',sr=null;
  const iv=setInterval(()=>{an.getByteTimeDomainData(buf);let s=0;for(const x of buf){const d=(x-128)/128;s+=d*d}sum+=Math.sqrt(s/buf.length);n++},100);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){try{sr=new SR();sr.lang='zh-CN';sr.continuous=true;sr.interimResults=true;sr.onresult=e=>{tx=[...e.results].map(r=>r[0].transcript).join('')};sr.start()}catch(e){sr=null}}
  rec={st,ac,iv,sr,t0:Date.now(),get:()=>({tx,v:n?sum/n:0})};$j('jyMic').classList.add('rec');toast('在听…再点一下发出去')}
function recEnd(){const r=rec;rec=null;$j('jyMic').classList.remove('rec');if(!r)return null;
  clearInterval(r.iv);try{r.sr?.stop()}catch(e){}r.st.getTracks().forEach(t=>t.stop());try{r.ac.close()}catch(e){}return r}
async function recStop(){const r=recEnd();if(!r)return;await sleep(700);
  const{tx,v}=r.get(),dur=Math.round((Date.now()-r.t0)/1000);if(dur<1)return toast('太短了');
  const vol=v<.02?'几乎没声音':v<.06?'很轻':v<.15?'正常':'很大';
  cur.msgs.push({role:'user',v:{dur,vol,tx:tx.trim()},t:Date.now()});cur.want=false;await save();render();reply()}
$j('jyMic').addEventListener('pointerdown',e=>e.preventDefault());
$j('jyMic').onclick=()=>{if(!cur||cur.end)return;rec?recStop():recStart()};

/* ---------- 寸止、倒计时、跟节奏 ---------- */
const RING=mid=>`<div class="jy-rw"><svg class="jy-ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54"/><circle id="jyArc" cx="60" cy="60" r="54"/></svg><div class="jy-mid">${mid}</div></div>`;
function showOv(kind,arg){closeOv(true);const[a,b]=String(arg).split(/[,，]/).map(x=>parseInt(x));
  const bpm=clamp(a||60,30,160),sec=clamp(kind==='beat'?(b||30):(a||10),3,300);let left=sec;
  const o=$j('jyOv');o.className='show';
  o.innerHTML=(kind==='edge'?RING(`<i class="jy-edge">寸止</i><b id="jyN">${left}</b>`)+'<span>停下，忍住，不许动</span>'
    :kind==='count'?RING(`<b id="jyN">${left}</b>`)+'<span>照他说的，坚持住</span>'
    :`<i class="jy-dot" id="jyDot"></i><span>跟着它 · ${bpm} 拍</span><b id="jyN" style="font-family:var(--num);font-size:22px;opacity:.6">${left}</b>`)
    +'<div class="jy-ob" id="jyOb"><button class="jy-pill" data-r="skip">先不玩这个</button></div>';
  toy(kind==='edge'?'stop':kind,{sec,bpm});navigator.vibrate?.(kind==='edge'?[80,60,80]:30);
  const done=()=>{clearInterval(ov.iv);clearInterval(ov.bt);toy('stop');navigator.vibrate?.(60);
    const R=kind==='edge'?['忍住了','没忍住']:kind==='count'?['做到了','没坚持住']:['跟上了','跟不上'];
    $j('jyOb').innerHTML=R.map(x=>`<button class="jy-pill" data-r="${x}">${x}</button>`).join('')};
  ov={kind,sec,iv:setInterval(()=>{left--;const n=$j('jyN');if(n)n.textContent=Math.max(0,left);
    const c=$j('jyArc');if(c)c.style.strokeDashoffset=339.3*(1-Math.max(0,left)/sec);if(left<=0)done()},1000)};
  if(kind==='beat')ov.bt=setInterval(()=>{const d=$j('jyDot');if(!d)return;d.classList.add('b');navigator.vibrate?.(25);setTimeout(()=>d.classList.remove('b'),140)},60000/bpm)}
function closeOv(quiet){if(ov){clearInterval(ov.iv);clearInterval(ov.bt);ov=null;if(!quiet)toy('stop')}$j('jyOv').className=''}
$j('jyOv').onclick=e=>{const b=e.target.closest('[data-r]');if(!b||!ov)return;
  const name={edge:'寸止',count:'倒计时',beat:'跟节奏'}[ov.kind],s=ov.sec,r=b.dataset.r;closeOv();
  push(r==='skip'?`（${name}：她选了先不玩这个）`:`（${name} ${s} 秒结束：${r}）`)};

/* ---------- 一局 ---------- */
function open(){const L=DATA.night.at(-1);
  if(L&&!L.end&&Date.now()-(L.at||L.t)<12*36e5){cur=L;render();if(L.msgs.at(-1)?.role!=='model')reply()}else start()}
async function start(){cur={id:uid(),t:Date.now(),at:Date.now(),ch:0,heat:0,msgs:[]};
  DATA.night.push(cur);if(DATA.night.length>30)DATA.night.shift();await save();render();reply()}
$j('jyMenu').onclick=()=>{if($j('jyLock').classList.contains('show'))return;sheet([
  ['新的一局',async()=>{closeOv();if(cur&&!cur.end){cur.end=true;await save()}start()}],
  ['以前的',()=>{const L=DATA.night.filter(x=>x!==cur&&x.msgs.length).reverse();if(!L.length)return toast('还没有');
    sheet(L.map(x=>[`${fmtDate(x.t)} · ${NUM[x.ch]} ${CH[x.ch]} · ${x.msgs.length} 句`,()=>{closeOv();cur=x;render()}]))}],
  [`用哪个模型（${S.jyModel||'和聊天一样'}）`,()=>{const u=prompt('中转站地址，和秘密用的一样就行（留空 = 和聊天用同一个）',S.jyUrl||'');if(u==null)return;
    if(!u.trim()){S.jyUrl=S.jyKey=S.jyModel='';saveSettings();return toast('改回和聊天一样了')}
    const k=prompt('API Key',S.jyKey||'');if(!k)return;const m=prompt('模型名',S.jyModel||'');if(!m)return;
    S.jyUrl=u.trim();S.jyKey=k.trim();S.jyModel=m.trim();saveSettings();toast('好了')}],
  [S.jyPw==='none'?'设一个密码':'改密码 / 不要密码',()=>{const v=prompt('新密码（留空 = 不要密码）','');if(v==null)return;
    S.jyPw=v.trim()?hs(v.trim()):'none';saveSettings();toast('改好了')}],
  ['删除这一局',async()=>{if(!cur||!confirm('删除这一局？'))return;closeOv();DATA.night=DATA.night.filter(x=>x!==cur);await save();cur=null;go('game')}]])};

/* ---------- 离开就锁上 ---------- */
function away(){closeOv();recEnd();if(S.jyPw!=='none')unlocked=false}
document.addEventListener('visibilitychange',()=>{if(!$j('page-jinye').classList.contains('active'))return;
  if(document.hidden)away();else if(lockUI())render()});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.night))DATA.night=[];card()});
HOOKS.page.push(n=>{document.body.classList.toggle('jyb',n==='jinye');
  if(n==='jinye'){if(lockUI())open()}else if(unlocked||ov||rec)away();
  if(n==='game')card()});
})();
