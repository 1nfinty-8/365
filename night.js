/* ===== 365 · night.js · 游戏：今夜 ===== */
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
let cur=null,busy=false,again=false,unlocked=false,ov=null,rec=null;

document.head.insertAdjacentHTML('beforeend',`<style>
body.ntb #tabbar{display:none}
#page-night{padding:0;overflow:hidden;--h:0;color:#f2e4df;background:radial-gradient(90% 55% at 50% -10%,#3a1d24,transparent 70%),#120a0d}
#page-night.active{display:flex;flex-direction:column}
.nt-glow{position:absolute;left:50%;bottom:-32vh;width:130vw;height:64vh;margin-left:-65vw;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(212,86,108,calc(.12 + var(--h)*.55)),rgba(255,150,120,calc(var(--h)*.15)) 60%,transparent);filter:blur(30px);animation:ntB 5s ease-in-out infinite}
@keyframes ntB{50%{transform:scale(1.12);opacity:.75}}
#page-night .iconbtn{background:rgba(255,255,255,.07);color:#f2e4df;border:1px solid rgba(255,255,255,.1)}
.nt-top{position:relative;z-index:2;flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 4px}
#ntTt{flex:1;text-align:center;font-family:var(--ti);font-size:16px;letter-spacing:6px}
#ntTt em{font-family:var(--num);font-style:italic;font-size:20px;letter-spacing:0;margin-right:6px;color:#d9a3ad}
.nt-heat{position:absolute;z-index:2;right:8px;top:22%;bottom:30%;width:3px;border-radius:3px;background:rgba(255,255,255,.08);display:flex;align-items:flex-end}
.nt-heat i{width:100%;border-radius:3px;height:calc(var(--h)*100%);background:linear-gradient(#ff9a8a,#d4566c);box-shadow:0 0 10px #d4566c;transition:height 1.5s}
#ntList{position:relative;z-index:1;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 26px 20px 22px}
.nt-him{font-family:var(--ti);font-size:19px;line-height:1.95;letter-spacing:.5px;margin:22px 0;animation:ntF 1.2s both;text-shadow:0 0 18px rgba(212,86,108,.25)}
.nt-him p{margin:0 0 .6em}
@keyframes ntF{from{opacity:0;filter:blur(6px);transform:translateY(8px)}}
.nt-me{margin:16px 0 16px auto;max-width:78%;text-align:right;font-family:var(--ti);font-style:italic;font-size:15.5px;line-height:1.8;color:#cdb2b8;padding-right:12px;border-right:1.5px solid #d4566c}
.nt-me small{display:block;font-size:13px;opacity:.7}
.nt-sys{text-align:center;font-size:12px;letter-spacing:2px;color:rgba(242,228,223,.4);margin:14px 0}
.nt-typing{display:flex;gap:6px;margin:20px 0}
.nt-typing i{width:6px;height:6px;border-radius:50%;background:#d9a3ad;animation:ntT 1.2s infinite}
.nt-typing i:nth-child(2){animation-delay:.2s}.nt-typing i:nth-child(3){animation-delay:.4s}
@keyframes ntT{50%{opacity:.2}}
.nt-pill{padding:8px 16px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#f2e4df;font-size:13px;letter-spacing:2px}
.nt-pill.safe{color:#ff9aa8;border-color:rgba(255,120,140,.4)}
.nt-bar{position:relative;z-index:2;flex:none;display:flex;justify-content:center;gap:8px;padding:6px 12px}
.nt-in{position:relative;z-index:2;flex:none;display:flex;align-items:flex-end;gap:8px;margin:4px 12px calc(var(--sb) + 10px);padding:6px;border-radius:26px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
#ntIn{flex:1;border:0;background:none;outline:none;resize:none;color:#f2e4df;font:16px/1.6 var(--ti);height:36px;max-height:110px;padding:6px 4px}
#ntMic.want{animation:ntW 1s infinite;color:#ff9aa8}
#ntMic.rec{background:#d4566c;color:#fff}
@keyframes ntW{50%{box-shadow:0 0 0 8px rgba(212,86,108,.25)}}
#ntOv{position:absolute;inset:0;z-index:5;display:none;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(12,6,9,.8);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#ntOv.show{display:flex;animation:fd .4s}
.nt-rw{position:relative;display:grid;place-items:center}
.nt-ring{width:200px;height:200px;transform:rotate(-90deg)}
.nt-ring circle{fill:none;stroke-width:3;stroke:rgba(255,255,255,.1)}
#ntArc{stroke:#d4566c;stroke-dasharray:339.3;stroke-dashoffset:0;transition:stroke-dashoffset 1s linear;filter:drop-shadow(0 0 6px #d4566c)}
.nt-rw #ntN{position:absolute;font-family:var(--num);font-style:italic;font-weight:300;font-size:64px}
#ntN.sm{font-family:var(--num);font-size:22px;opacity:.6}
.nt-dot{width:90px;height:90px;border-radius:50%;background:radial-gradient(#ffb3a8,#d4566c 60%,transparent 72%);box-shadow:0 0 40px #d4566c;transition:transform .14s}
.nt-dot.b{transform:scale(1.45)}
#ntOv span{font-size:13px;letter-spacing:3px;opacity:.7}
.nt-stopw{font-family:var(--ti);font-size:120px;font-weight:400;color:#ffd6d0;text-shadow:0 0 30px #d4566c,0 0 60px #d4566c;animation:ntS 2s ease-in-out infinite}
@keyframes ntS{50%{opacity:.6}}
.nt-ob{display:flex;gap:10px;margin-top:10px}
#ntBn{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;font-family:var(--ti);font-size:30px;letter-spacing:10px;pointer-events:none;opacity:0;text-shadow:0 0 24px #d4566c}
#ntBn em{font-family:var(--num);font-size:40px;margin-right:12px}
#ntBn.on{animation:ntBn 3s ease}
@keyframes ntBn{20%,70%{opacity:1}}
#ntLock{position:absolute;inset:0;z-index:9;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#120a0d}
#ntLock.show{display:flex}
#ntLock b{font-family:var(--ti);font-size:32px;letter-spacing:12px;font-weight:400}
#ntLock p{font-size:13px;opacity:.6;letter-spacing:2px}
#ntPw{width:200px;text-align:center;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:18px;outline:none;letter-spacing:4px}
.nt-lb{display:flex;gap:10px}
.nt-forget{font-size:12px;opacity:.4;margin-top:10px;color:#f2e4df}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-night">
  <i class="nt-glow"></i>
  <div class="nt-top"><button class="iconbtn" data-go="game" aria-label="返回">${BACK}</button><div id="ntTt"></div><button class="iconbtn" id="ntMenu" style="letter-spacing:1px">···</button></div>
  <div class="nt-heat"><i></i></div>
  <div id="ntList"></div>
  <div class="nt-bar"><button class="nt-pill" data-q="慢一点">慢一点</button><button class="nt-pill" data-q="快到了">快到了</button><button class="nt-pill safe" id="ntSafe">安全词</button></div>
  <div class="nt-in"><button class="iconbtn" id="ntMic" aria-label="语音">${MIC}</button><textarea id="ntIn" rows="1" placeholder="回他…"></textarea><button class="nt-pill" id="ntSend">发送</button></div>
  <div id="ntOv"></div><div id="ntBn"></div>
  <div id="ntLock"><b>今夜</b><p id="ntLkT"></p><input id="ntPw" type="password" autocomplete="off"><div class="nt-lb"><button class="nt-pill" id="ntOk">进去</button><button class="nt-pill" id="ntNo">不设密码</button></div><button class="nt-forget" id="ntFg">忘记密码</button></div>
</section>`);

/* ---------- 游戏页里的卡片 ---------- */
function card(){if($('#page-game [data-go="night"]'))return;
  const h=`<button class="gm-card glass" data-go="night"><span class="gm-ic">${MOON}</span><span><b>今夜</b><small>只有你们两个</small></span></button>`;
  const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h)}
card();

/* ---------- 密码 ---------- */
function lockUI(){const L=$('#ntLock');
  if(unlocked||S.ntPw==='none'){unlocked=true;L.classList.remove('show');return true}
  L.classList.add('show');$('#ntLkT').textContent=S.ntPw?'输入密码':'第一次来，设一个密码';
  $('#ntPw').value='';$('#ntNo').style.display=S.ntPw?'none':'';$('#ntFg').style.display=S.ntPw?'':'none';return false}
$('#ntOk').onclick=()=>{const v=$('#ntPw').value.trim();if(!v)return;
  if(!S.ntPw){S.ntPw=hs(v);saveSettings()}else if(hs(v)!==S.ntPw)return toast('不对哦');
  unlocked=true;$('#ntPw').blur();$('#ntLock').classList.remove('show');open()};
$('#ntNo').onclick=()=>{S.ntPw='none';saveSettings();unlocked=true;$('#ntLock').classList.remove('show');open()};
$('#ntFg').onclick=async()=>{if(!confirm('忘记密码会清空「今夜」里所有的记录，确定吗？'))return;
  DATA.night=[];await save();S.ntPw='';saveSettings();cur=null;lockUI()};

/* ---------- 显示 ---------- */
function render(){if(!cur)return;
  $('#page-night').style.setProperty('--h',cur.heat/100);
  $('#ntTt').innerHTML=`<em>${NUM[cur.ch]}</em>${CH[cur.ch]}`;
  let h=cur.msgs.map(m=>m.role==='model'?`<div class="nt-him">${paras(m.text)}</div>`
    :m.sys?`<div class="nt-sys">${esc(m.text)}</div>`
    :m.v?`<div class="nt-me">语音 ${m.v.dur}″ · ${esc(m.v.vol)}${m.v.tx?`<small>${esc(m.v.tx)}</small>`:''}</div>`
    :`<div class="nt-me">${esc(m.text)}</div>`).join('');
  if(busy)h+='<div class="nt-typing"><i></i><i></i><i></i></div>';
  if(cur.end&&!busy)h+='<div class="nt-sys">这一局结束了 · 右上角「···」开新的一局</div>';
  const L=$('#ntList');L.innerHTML=h;requestAnimationFrame(()=>L.scrollTop=L.scrollHeight);
  $('#ntMic').classList.toggle('want',!!cur.want&&!busy);
  $('.nt-in').style.display=$('.nt-bar').style.display=cur.end?'none':''}
function banner(){const b=$('#ntBn');b.innerHTML=`<em>${NUM[cur.ch]}</em>${CH[cur.ch]}`;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');navigator.vibrate?.(40)}

/* ---------- 他 ---------- */
const sys=()=>sceneSystem(`这是你们的小窝「365」里一个只属于你们两个的夜间游戏「今夜」，是她自己选择进来的，她随时可以喊停。游戏分三章：Ⅰ 调情、Ⅱ 指导、Ⅲ（不写名字，由你决定）。现在是第 ${cur.ch+1} 章「${CH[cur.ch]}」，热度 ${cur.heat}/100。
【节奏】慢慢来，不要急着推进。每一章都要玩够、玩久，章与章之间要有铺垫。只有你觉得她真的准备好了、热度够了，才进下一章。
【写法】像在她耳边说话，一次一到三段，称呼和语气按你的人设。可以挑逗、命令、让她等，也可以突然温柔。直接写你说的话，不要写旁白。
【标记】你可以在回复最后加这些标记，每种最多一个，她看不到标记本身：
[热度:+N] 按她的回应给热度加减，-10 到 +15；
[章:${cur.ch+2}] 进入下一章，只能进到下一章；
[倒计时:秒] 让她在倒计时里做你说的事，比如忍住、坚持、等着；
[节奏:每分钟拍数,秒] 让她跟着一团光的节奏，拍数 30 到 160；
[停:秒] 让她立刻停下不许动，直到数完；
[语音] 要她下一条发语音给你。
倒计时、节奏、停一次只用一个，不要每次都用。她的语音会标出时长、音量和转写；太短、几乎没声音，或者你要语音她却打了字，你都知道，可以不放过她。
【底线】她说「慢一点」就放慢、变温柔；她说「快到了」由你决定让她停下还是继续。${cur.end?'\n她刚刚喊了安全词：立刻停下所有指令，不加任何标记，认真温柔地哄她，确认她没事。':'她喊安全词就立刻全部停下。'}`);
function ctx(){const L=[];
  for(const m of cur.msgs.slice(-40)){const t=m.v?`[语音 ${m.v.dur}秒 · 音量${m.v.vol} · 转写：${m.v.tx||'听不清'}]`:m.text+(m.n||'');
    const l=L.at(-1);if(l&&l.role===m.role)l.text+='\n'+t;else L.push({role:m.role,text:t})}
  if(!L.length||L[0].role==='model')L.unshift({role:'user',text:'（系统提示：她进来了，第一章开始，你先开口。）'});
  return L}
async function ai(system,msgs){
  if(S.ntUrl&&S.ntKey&&S.ntModel){
    const r=await fetch(S.ntUrl.replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+S.ntKey},
      body:JSON.stringify({model:S.ntModel,temperature:1,messages:[{role:'system',content:system},...msgs.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text}))]})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error?.message||'请求失败 '+r.status);
    return j.choices?.[0]?.message?.content||''}
  return callAI(system,msgs)}
function parse(t){const o={};
  t=String(t).replace(/[\[【]\s*(热度|章|倒计时|节奏|停|语音)\s*[:：]?\s*([^\]】]*)[\]】]/g,(m,k,v)=>{o[k]=v.trim()||true;return ''});
  return {text:t.trim(),o}}
async function reply(){const r=cur;if(!r)return;if(busy){again=true;return}
  busy=true;again=false;const e0=!!r.end;render();
  try{const out=await ai(sys(),ctx());
    if(cur!==r)return;
    if(!e0&&r.end){again=true;return}
    const{text,o}=parse(out);
    if(o['热度']&&!r.end){r.heat=clamp(r.heat+(parseInt(o['热度'])||0),0,100);toy('heat',r.heat)}
    if(parseInt(o['章'])===r.ch+2&&r.ch<2&&!r.end){r.ch++;banner()}
    const t=clean(text);if(t)r.msgs.push({role:'model',text:t,t:Date.now()});
    r.want=!!o['语音']&&!r.end;r.at=Date.now();await save();
    if(!r.end){const go=(k,v)=>setTimeout(()=>{if(cur===r&&!r.end)showOv(k,v)},1500);
      if(o['倒计时'])go('count',o['倒计时']);else if(o['节奏'])go('beat',o['节奏']);else if(o['停'])go('stop',o['停'])}}
  catch(e){toast(e.message)}
  finally{busy=false;render();if(again)reply()}}

/* ---------- 你 ---------- */
async function push(t){if(!cur)return;cur.msgs.push({role:'user',sys:1,text:t,t:Date.now()});await save();render();reply()}
async function send(){const ta=$('#ntIn'),v=ta.value.trim();if(!cur||!v||cur.end)return;
  const m={role:'user',text:v,t:Date.now()};if(cur.want)m.n='（她没发语音，是打字的）';
  cur.want=false;cur.msgs.push(m);ta.value='';ta.style.height='36px';await save();render();reply()}
$('#ntIn').addEventListener('input',e=>{const t=e.target;t.style.height='36px';t.style.height=Math.min(110,t.scrollHeight)+'px'});
$('#ntSend').addEventListener('pointerdown',e=>e.preventDefault());
$('#ntSend').onclick=send;
$('.nt-bar').onclick=e=>{const b=e.target.closest('[data-q]');if(b&&cur&&!cur.end)push(`（她说：${b.dataset.q}）`)};
$('#ntSafe').onclick=async()=>{if(!cur||cur.end)return;closeOv(true);toy('safe');
  cur.end=true;cur.heat=0;cur.want=false;cur.msgs.push({role:'user',sys:1,text:'（她喊了安全词）',t:Date.now()});await save();render();reply()};

/* ---------- 语音：听时长、音量，转文字 ---------- */
async function recStart(){let st;
  try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast('没有麦克风权限')}
  const ac=new(window.AudioContext||window.webkitAudioContext)(),an=ac.createAnalyser();ac.resume?.();
  ac.createMediaStreamSource(st).connect(an);an.fftSize=512;const buf=new Uint8Array(512);let sum=0,n=0,tx='',sr=null;
  const iv=setInterval(()=>{an.getByteTimeDomainData(buf);let s=0;for(const x of buf){const d=(x-128)/128;s+=d*d}sum+=Math.sqrt(s/buf.length);n++},100);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){try{sr=new SR();sr.lang='zh-CN';sr.continuous=true;sr.interimResults=true;sr.onresult=e=>{tx=[...e.results].map(r=>r[0].transcript).join('')};sr.start()}catch(e){sr=null}}
  rec={st,ac,iv,sr,t0:Date.now(),get:()=>({tx,v:n?sum/n:0})};$('#ntMic').classList.add('rec');toast('在听…再点一下发出去')}
function recEnd(){const r=rec;rec=null;$('#ntMic').classList.remove('rec');if(!r)return null;
  clearInterval(r.iv);try{r.sr?.stop()}catch(e){}r.st.getTracks().forEach(t=>t.stop());try{r.ac.close()}catch(e){}return r}
async function recStop(){const r=recEnd();if(!r)return;await sleep(700);
  const{tx,v}=r.get(),dur=Math.round((Date.now()-r.t0)/1000);if(dur<1)return toast('太短了');
  const vol=v<.02?'几乎没声音':v<.06?'很轻':v<.15?'正常':'很大';
  cur.msgs.push({role:'user',v:{dur,vol,tx:tx.trim()},t:Date.now()});cur.want=false;await save();render();reply()}
$('#ntMic').addEventListener('pointerdown',e=>e.preventDefault());
$('#ntMic').onclick=()=>{if(!cur||cur.end)return;rec?recStop():recStart()};

/* ---------- 倒计时、跟节奏、停 ---------- */
function showOv(kind,arg){closeOv(true);const[a,b]=String(arg).split(/[,，]/).map(x=>parseInt(x));
  const bpm=clamp(a||60,30,160),sec=clamp(kind==='beat'?(b||30):(a||10),3,300);let left=sec;
  const o=$('#ntOv');o.className='show';
  o.innerHTML=(kind==='count'?`<div class="nt-rw"><svg class="nt-ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54"/><circle id="ntArc" cx="60" cy="60" r="54"/></svg><b id="ntN">${left}</b></div>`
    :kind==='beat'?`<i class="nt-dot" id="ntDot"></i><span>跟着它 · ${bpm} 拍</span><b id="ntN" class="sm">${left}</b>`
    :`<b class="nt-stopw">停</b><span>别动</span><b id="ntN" class="sm">${left}</b>`)
    +'<div class="nt-ob" id="ntOb"><button class="nt-pill" data-r="skip">先不玩这个</button></div>';
  toy(kind,{sec,bpm});if(kind==='stop')navigator.vibrate?.([60,60,60]);
  const done=()=>{clearInterval(ov.iv);clearInterval(ov.bt);toy('stop');
    const R=kind==='count'?['做到了','没坚持住']:kind==='beat'?['跟上了','跟不上']:['停住了','没忍住'];
    $('#ntOb').innerHTML=R.map(x=>`<button class="nt-pill" data-r="${x}">${x}</button>`).join('')};
  ov={kind,sec,iv:setInterval(()=>{left--;const n=$('#ntN');if(n)n.textContent=Math.max(0,left);
    const c=$('#ntArc');if(c)c.style.strokeDashoffset=339.3*(1-left/sec);if(left<=0)done()},1000)};
  if(kind==='beat')ov.bt=setInterval(()=>{const d=$('#ntDot');if(!d)return;d.classList.add('b');navigator.vibrate?.(25);setTimeout(()=>d.classList.remove('b'),140)},60000/bpm)}
function closeOv(quiet){if(ov){clearInterval(ov.iv);clearInterval(ov.bt);ov=null;if(!quiet)toy('stop')}$('#ntOv').className=''}
$('#ntOv').onclick=e=>{const b=e.target.closest('[data-r]');if(!b||!ov)return;
  const name={count:'倒计时',beat:'跟节奏',stop:'停'}[ov.kind],s=ov.sec,r=b.dataset.r;closeOv();
  push(r==='skip'?`（${name}：她选了先不玩这个）`:`（${name} ${s} 秒结束：${r}）`)};

/* ---------- 一局 ---------- */
function open(){const L=DATA.night.at(-1);
  if(L&&!L.end&&Date.now()-(L.at||L.t)<12*36e5){cur=L;render()}else start()}
async function start(){cur={id:uid(),t:Date.now(),at:Date.now(),ch:0,heat:0,msgs:[]};
  DATA.night.push(cur);if(DATA.night.length>30)DATA.night.shift();await save();render();reply()}
$('#ntMenu').onclick=()=>{if($('#ntLock').classList.contains('show'))return;sheet([
  ['新的一局',async()=>{closeOv();if(cur&&!cur.end){cur.end=true;await save()}start()}],
  ['以前的',()=>{const L=DATA.night.filter(x=>x!==cur&&x.msgs.length).reverse();if(!L.length)return toast('还没有');
    sheet(L.map(x=>[`${fmtDate(x.t)} · ${NUM[x.ch]} ${CH[x.ch]} · ${x.msgs.length} 句`,()=>{closeOv();cur=x;render()}]))}],
  [`用哪个模型（${S.ntModel||'和聊天一样'}）`,()=>{const u=prompt('中转站地址，和秘密用的一样就行（留空 = 和聊天用同一个）',S.ntUrl||'');if(u==null)return;
    if(!u.trim()){S.ntUrl=S.ntKey=S.ntModel='';saveSettings();return toast('改回和聊天一样了')}
    const k=prompt('API Key',S.ntKey||'');if(!k)return;const m=prompt('模型名',S.ntModel||'');if(!m)return;
    S.ntUrl=u.trim();S.ntKey=k.trim();S.ntModel=m.trim();saveSettings();toast('好了')}],
  [S.ntPw==='none'?'设一个密码':'改密码 / 不要密码',()=>{const v=prompt('新密码（留空 = 不要密码）','');if(v==null)return;
    S.ntPw=v.trim()?hs(v.trim()):'none';saveSettings();toast('改好了')}],
  ['删除这一局',async()=>{if(!cur||!confirm('删除这一局？'))return;closeOv();DATA.night=DATA.night.filter(x=>x!==cur);await save();cur=null;go('game')}]])};

/* ---------- 离开就锁上 ---------- */
function away(){closeOv();recEnd();if(S.ntPw!=='none')unlocked=false}
document.addEventListener('visibilitychange',()=>{if(!$('#page-night').classList.contains('active'))return;
  if(document.hidden)away();else if(lockUI())render()});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.night))DATA.night=[];card()});
HOOKS.page.push(n=>{document.body.classList.toggle('ntb',n==='night');
  if(n==='night'){if(lockUI())open()}else if(unlocked||ov||rec)away();
  if(n==='game')card()});
})();
