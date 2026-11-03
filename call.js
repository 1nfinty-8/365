/* ===== 365 · call.js · 打电话（你说话，他打字回）+ 他打给你 + 悬浮窗 + 铃声 ===== */
(()=>{
if(!Array.isArray(DATA.calls))DATA.calls=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('calls'))LISTS.push('calls');
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const PHONE='<svg class="i" viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v3a2 2 0 0 1-2.1 2.1A15.5 15.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1z"/></svg>';
const PH='<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v3a2 2 0 0 1-2.1 2.1A15.5 15.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1z"/></svg>';
const MIC='<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
const MINI='<svg viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>';
const KEY='<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>';
const mmss=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
const IK='365-incall',MK='365-inmiss';
let st='idle',rec=null,heard='',silT=null,tick=null,t0=0,lines=[],muted=false,tok=0,dir='out',inc=null,incT=null,pend=false,mini=false,ringData=null,typeT=null;

/* ---------- 铃声 ---------- */
function wav(len,notes){
  const sr=16000,n=Math.max(1,Math.floor(len*sr)),b=new ArrayBuffer(44+n*2),v=new DataView(b);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){const t=i/sr;let s=0;
    for(const[fs,a,d,vol]of notes)if(t>=a&&t<a+d){const e=Math.min(1,(t-a)/.02,(a+d-t)/.03);for(const f of fs)s+=Math.sin(6.2832*f*t)*vol*e}
    v.setInt16(44+i*2,Math.max(-1,Math.min(1,s))*32767,true)}
  return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
const RB=wav(5,[[[450],0,1,.3]]);
const RIN=wav(2.6,[0,1.1].flatMap(o=>[659,784,988,784].map((f,i)=>[[f],o+i*.2,.18,.22])));
const rg=new Audio();rg.setAttribute('playsinline','');rg.preload='auto';
const ringSrc=()=>ringData||RIN;
function ringStart(src){try{rg.loop=true;if(rg.src!==src)rg.src=src;rg.currentTime=0;rg.play().catch(()=>{})}catch(e){}}
function ringStop(){try{rg.pause()}catch(e){}}
function loadRing(){ringData=null;if(S.callRing)IMG.get(S.callRing).then(d=>{ringData=d||null}).catch(()=>{})}

document.head.insertAdjacentHTML('beforeend',`<style>
#callUI{position:absolute;inset:0;z-index:35;display:none;flex-direction:column;align-items:center;color:#fff;background:rgba(18,14,22,.62);-webkit-backdrop-filter:blur(30px) saturate(1.3);backdrop-filter:blur(30px) saturate(1.3);padding:calc(var(--st) + 14px) 26px calc(var(--sb) + 30px)}
#callUI.show{display:flex;animation:fd .3s ease}
.cl-top{align-self:stretch;display:flex;justify-content:space-between;align-items:center;min-height:34px}
.cl-top button{color:#fff;opacity:.75;padding:6px 4px}
.cl-top svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;display:block}
#callUI.in .cl-top button{visibility:hidden}
.cl-av{position:relative;margin-top:2vh;border-radius:50%}
.cl-av .av{width:96px;height:96px;font-size:36px;position:relative;z-index:1}
.cl-av::before,.cl-av::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);opacity:0}
#callUI.talk .cl-av::before,#callUI.incoming .cl-av::before{animation:clP 1.6s infinite}
#callUI.talk .cl-av::after,#callUI.incoming .cl-av::after{animation:clP 1.6s .8s infinite}
#callUI.ring .cl-av::before{animation:clP 1.2s infinite}
@keyframes clP{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.7);opacity:0}}
.cl-name{font-family:var(--ti);font-size:26px;letter-spacing:6px;margin-top:16px}
.cl-time{font-family:var(--num);font-style:italic;font-size:17px;opacity:.75;margin-top:4px;letter-spacing:2px;min-height:22px}
.cl-st{font-size:12.5px;opacity:.6;letter-spacing:3px;margin-top:2px;min-height:20px}
.cl-sub{flex:1;align-self:stretch;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:14px;padding:16px 2px;font-family:var(--ti);-webkit-mask-image:linear-gradient(180deg,transparent,#000 12%);mask-image:linear-gradient(180deg,transparent,#000 12%)}
.cl-sub>:first-child{margin-top:auto}
.cl-ln{max-width:88%;line-height:1.75;word-break:break-word}
.cl-ln.h{align-self:flex-start;font-size:18px;letter-spacing:.5px}
.cl-ln.m{align-self:flex-end;text-align:right;font-size:14px;opacity:.6}
.cl-ln.live{opacity:.35}
.cl-btns{display:flex;align-items:flex-start;justify-content:space-around;align-self:stretch}
#callUI.in .cl-btns.nm,#callUI:not(.in) .cl-btns.ic{display:none}
#callUI.in .cl-sub{visibility:hidden}
.cl-b{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;letter-spacing:2px;color:#fff}
.cl-b i{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.16);font-style:normal;transition:background .2s}
.cl-b.on i{background:#fff;color:#222}
.cl-b.end i,.cl-b.ok i{width:72px;height:72px}
.cl-b.end i{background:#E5484D}
.cl-b.ok i{background:#34C759;animation:clJ 1.2s ease-in-out infinite}
@keyframes clJ{0%,100%{transform:none}50%{transform:translateY(-6px)}}
.cl-b svg{width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cl-b.end svg,.cl-b.ok svg{fill:#fff;stroke:none}
.cl-b.end svg{transform:rotate(135deg)}
#callFloat{position:absolute;z-index:34;top:calc(var(--st) + 70px);right:12px;width:74px;height:86px;border-radius:18px;display:none;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);box-shadow:0 8px 24px rgba(0,0,0,.18);touch-action:none;transition:left .25s,top .25s}
#callFloat.show{display:flex;animation:fd .25s ease}
#callFloat.drag{transition:none}
#callFloat svg{width:28px;height:28px;fill:#34C759}
#callFloat span{font-family:var(--num);font-size:13px;color:#34C759;letter-spacing:1px}
#callFloat.speak svg{animation:cfP 1s ease-in-out infinite}
@keyframes cfP{50%{transform:scale(1.15)}}
</style>`);

$('#app').insertAdjacentHTML('beforeend',`<div id="callUI">
  <div class="cl-top"><button id="clMin" aria-label="缩小">${MINI}</button><span></span></div>
  <div class="cl-av" id="clAv"></div>
  <div class="cl-name" id="clName"></div>
  <div class="cl-time" id="clTime"></div>
  <div class="cl-st" id="clSt"></div>
  <div class="cl-sub" id="clSub"></div>
  <div class="cl-btns nm">
    <button class="cl-b" id="clMute"><i>${MIC}</i>静音</button>
    <button class="cl-b end" id="clEnd"><i>${PH}</i>挂断</button>
    <button class="cl-b" id="clKey"><i>${KEY}</i>打字</button>
  </div>
  <div class="cl-btns ic">
    <button class="cl-b end" id="clNo"><i>${PH}</i>拒绝</button>
    <button class="cl-b ok" id="clYes"><i>${PH}</i>接听</button>
  </div>
</div>
<div id="callFloat">${PH}<span id="cfT">呼叫中</span></div>`);

/* 聊天输入框旁边的电话按钮 */
const mb=$('#micBtn')||$('#plusBtn');
mb.insertAdjacentHTML('afterend',`<button id="callBtn" aria-label="打电话">${PHONE}</button>`);
$('#callBtn').className=mb.className;
$('#callBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#callBtn').onclick=()=>start();
document.addEventListener('click',e=>{if(st!=='idle'&&e.target.closest?.('#micBtn')){e.stopPropagation();e.preventDefault();toast('通话中不能录语音')}},true);

function set(s,t){st=s;const u=$('#callUI');['ring','listen','think','incoming'].forEach(x=>u.classList.toggle(x,x===s));$('#clSt').textContent=t||'';upd()}
function upd(){const f=$('#callFloat');if(!f)return;f.classList.toggle('speak',$('#callUI').classList.contains('talk'));$('#cfT').textContent=t0?mmss(Math.floor((Date.now()-t0)/1000)):'呼叫中'}
function sub(live){const box=$('#clSub');
  box.innerHTML=lines.map(x=>`<div class="cl-ln ${x.role==='model'?'h':'m'}">${esc(x._n!=null?x.text.slice(0,x._n):x.text)}</div>`).join('')+(live?`<div class="cl-ln m live">${esc(live)}</div>`:'');
  box.scrollTop=box.scrollHeight}
function refresh(){HOOKS.refresh.forEach(f=>{try{f()}catch(e){}})}
function open(s,t,d){
  tok++;dir=d;lines=[];heard='';t0=0;muted=false;mini=false;clearInterval(typeT);
  $('#callFloat').classList.remove('show');$('#callUI').classList.remove('talk');
  $('#clAv').innerHTML=avatarHTML('him');$('#clName').textContent=S.hisName;$('#clTime').textContent='';
  $('#clMute').classList.remove('on');sub();
  $('#callUI').classList.toggle('in',s==='incoming');$('#callUI').classList.add('show');set(s,t)}
function connected(){t0=Date.now();$('#clTime').textContent='00:00';clearInterval(tick);
  tick=setInterval(()=>{$('#clTime').textContent=mmss(Math.floor((Date.now()-t0)/1000));upd()},500)}

/* ---------- 悬浮窗 ---------- */
function minimize(){if(st==='idle'||st==='incoming')return;mini=true;$('#callUI').classList.remove('show');$('#callFloat').classList.add('show');upd()}
function restore(){if(st==='idle')return;mini=false;$('#callFloat').classList.remove('show');$('#callUI').classList.add('show');sub(heard)}
$('#clMin').onclick=minimize;
(()=>{const fl=$('#callFloat');let fx=0,fy=0,ox=0,oy=0,moved=false,down=false;
  fl.addEventListener('pointerdown',e=>{down=true;moved=false;fx=e.clientX;fy=e.clientY;
    const r=fl.getBoundingClientRect(),a=$('#app').getBoundingClientRect();ox=r.left-a.left;oy=r.top-a.top;
    fl.classList.add('drag');try{fl.setPointerCapture(e.pointerId)}catch(x){}});
  fl.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-fx,dy=e.clientY-fy;
    if(Math.abs(dx)+Math.abs(dy)>6)moved=true;if(!moved)return;
    fl.style.right='auto';fl.style.left=(ox+dx)+'px';fl.style.top=(oy+dy)+'px'});
  const up=()=>{if(!down)return;down=false;fl.classList.remove('drag');
    if(!moved){restore();return}
    const a=$('#app').getBoundingClientRect(),x=parseFloat(fl.style.left)||0,y=parseFloat(fl.style.top)||0;
    fl.style.left=(x+37<a.width/2?12:a.width-86)+'px';fl.style.top=Math.max(40,Math.min(a.height-180,y))+'px'};
  fl.addEventListener('pointerup',up);fl.addEventListener('pointercancel',up)})();

/* ---------- 你打给他 ---------- */
const H_OUT='（系统提示，不是她说的话：她刚给你打来电话，你接起来了。先开口说第一句。）';
const H_NIGHT='（系统提示，不是她说的话：快睡觉了，是你主动给她打的电话，她接起来了。先开口，像睡前想听她的声音那样。）';
const H_MISS='（系统提示，不是她说的话：你们好久没说话了，是你主动给她打的电话，她接起来了。先开口，说说你为什么打给她。）';
async function start(){
  if(st!=='idle'){if(mini)restore();return}
  if(!S.apiKey)return toast('还没有填 API Key');
  $('#chatInput')?.blur();
  open('ring','正在呼叫…','out');const my=tok;
  ringStart(RB);
  const minT=sleep(2600+Math.random()*2400);
  let first;
  try{first=await ask(H_OUT)}
  catch(e){ringStop();if(my===tok){toast(e.message);hang(true)}return}
  await minT;ringStop();if(my!==tok)return;
  connected();say(first)}

/* ---------- 他回话：文字一个字一个字打出来 ---------- */
const RULE=`\n\n【通话】你们正在打电话。她是开口说话的，语音识别转成文字给你，可能有错字，按意思理解。你的回答会以文字显示在通话画面上：要像打电话时说话那样口语、自然，每次一到三句、不超过八十字；不要动作描写、括号、星号、emoji，不要分行，不要加名字前缀。`;
function tidy(t){return clean(String(t||'')).replace(/[（(【\[][^）)】\]]*[）)】\]]/g,'').replace(/\*[^*]*\*/g,'')
  .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,'').replace(/\s*\n+\s*/g,'，').trim()||'嗯。'}
async function ask(hint){
  const base=DATA.chat.slice(-10).map(m=>({role:m.role,text:m.text||(m.images?.length?'（发了照片）':'')})).filter(m=>m.text);
  const msgs=[...base,...lines.map(x=>({role:x.role,text:x.text}))];
  if(hint)msgs.push({role:'user',text:hint});
  return tidy(await (window.webReply||callAI)(chatSystem()+RULE,msgs))}
function say(text){
  const my=tok,ln={role:'model',text,t:Date.now(),_n:0};lines.push(ln);
  $('#callUI').classList.add('talk');upd();clearInterval(typeT);
  typeT=setInterval(()=>{if(my!==tok){clearInterval(typeT);return}
    ln._n+=1;if(ln._n>=text.length){delete ln._n;clearInterval(typeT);$('#callUI').classList.remove('talk');upd()}
    sub(heard)},60);
  listen()}
async function userSays(t){
  const my=tok;lines.push({role:'user',text:t,t:Date.now()});sub();set('think','他在想…');
  try{const out=await ask();if(my!==tok)return;say(out)}
  catch(e){if(my!==tok)return;toast(e.message);listen()}}

/* ---------- 听你说 ---------- */
function listen(){
  if(st==='idle'||st==='incoming')return;
  clearTimeout(silT);heard='';
  if(rec){const a=rec;rec=null;try{a.abort()}catch(e){}}
  if(muted){set('listen','静音中 · 可以点「打字」');return}
  if(!SR){set('listen','点「打字」和他说话');return}
  set('listen','在听…');
  const my=tok;
  try{const a=new SR();a.lang='zh-CN';a.continuous=true;a.interimResults=true;
    a.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;heard=s.trim();
      if(heard)sub(heard);
      clearTimeout(silT);silT=setTimeout(()=>finish(my),1300)};
    a.onend=()=>{if(rec!==a)return;rec=null;if(my!==tok||st!=='listen')return;
      if(heard)finish(my);else setTimeout(()=>{if(my===tok&&st==='listen'&&!rec&&!muted)listen()},250)};
    a.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast('没有麦克风或语音识别的权限，可以点「打字」');muted=true;$('#clMute').classList.add('on');set('listen','点「打字」和他说话')}};
    rec=a;a.start()}
  catch(e){set('listen','点「打字」和他说话')}}
function finish(my){
  if(my!==tok||st!=='listen')return;clearTimeout(silT);
  const t=heard.trim();heard='';
  const a=rec;rec=null;try{a?.stop()}catch(e){}
  if(!t){listen();return}
  userSays(t)}

/* ---------- 按钮 ---------- */
$('#clMute').onclick=()=>{muted=!muted;$('#clMute').classList.toggle('on',muted);
  if(st!=='listen')return;
  if(muted){const a=rec;rec=null;clearTimeout(silT);try{a?.abort()}catch(e){}heard='';sub();set('listen','静音中 · 可以点「打字」')}else listen()};
$('#clKey').onclick=()=>{
  if(st==='idle'||st==='incoming'||st==='ring')return;
  if(st==='think')return toast('他还在想，等一下');
  const a=rec;rec=null;clearTimeout(silT);try{a?.abort()}catch(e){}heard='';
  const v=prompt('想跟他说的');
  if(!v||!v.trim()){listen();return}
  userSays(v.trim())};
$('#clEnd').onclick=()=>hang();
$('#clYes').onclick=()=>accept();
$('#clNo').onclick=()=>miss('拒接');

/* ---------- 挂断 ---------- */
async function hang(silent){
  if(st==='idle')return;
  if(st==='incoming')return miss('未接');
  tok++;const dur=t0?Math.round((Date.now()-t0)/1000):0,d=dir;
  clearInterval(tick);clearInterval(typeT);clearTimeout(silT);ringStop();
  const a=rec;rec=null;try{a?.abort()}catch(e){}
  set('idle','');mini=false;$('#callUI').classList.remove('show','in','talk');$('#callFloat').classList.remove('show');
  if(silent||!dur)return;
  const c={id:uid(),t:t0,dur,dir:d,lines:lines.map(x=>({role:x.role,text:x.text}))};
  DATA.calls.push(c);DATA.calls=DATA.calls.slice(-30);await saveData('calls');
  const now=Date.now();
  DATA.chat.push(d==='in'?{role:'model',text:`通话时长 ${mmss(dur)}`,call:c.id,t:now}
    :{role:'user',text:`通话时长 ${mmss(dur)}`,call:c.id,t:now,status:'read',readAt:now});
  await saveData('chat');refresh()}

/* ---------- 他打给你 ---------- */
function canRing(force){
  if(!S.apiKey||st!=='idle'||document.hidden)return false;
  if(!force&&(S.callIn===false||localStorage.getItem(IK)===isoDate(today())))return false;
  if($('#page-secret')?.classList.contains('active'))return false;
  if($('#vrec')?.classList.contains('on')||$('#reader')?.classList.contains('show')||$('.modal.show'))return false;
  if(!force&&document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return false;
  return true}
function why(){
  const d=new Date(),h=d.getHours(),m=d.getMinutes();
  if((h===22&&m>=30)||h===23||h===0)return Math.random()<.5?'night':null;
  const last=[...DATA.chat].reverse().find(x=>x.role==='user');
  if(last&&Date.now()-last.t>8*36e5)return Math.random()<.6?'miss':null;
  return null}
function incoming(reason,force){
  if(!canRing(force)){if(force)toast('现在打不进来，先关掉弹窗或者退出秘密');return}
  localStorage.setItem(IK,isoDate(today()));
  inc={reason};
  open('incoming','邀请你语音通话…','in');
  ringStart(ringSrc());
  clearTimeout(incT);incT=setTimeout(()=>miss('未接'),30000)}
async function accept(){
  if(st!=='incoming')return;
  clearTimeout(incT);ringStop();
  const r=inc?.reason;inc=null;
  $('#callUI').classList.remove('in');
  connected();set('think','接通中…');
  const my=tok;
  try{const first=await ask(r==='night'?H_NIGHT:H_MISS);if(my!==tok)return;say(first)}
  catch(e){if(my===tok){toast(e.message);listen()}}}
async function miss(kind){
  if(st!=='incoming')return;
  clearTimeout(incT);ringStop();inc=null;tok++;
  set('idle','');$('#callUI').classList.remove('show','in');
  DATA.chat.push({role:'model',text:kind==='拒接'?'通话已被拒绝':'未接来电',missed:kind,t:Date.now()});
  await saveData('chat');refresh();
  localStorage.setItem(MK,JSON.stringify({t:Date.now(),k:kind}));
  follow(kind)}
async function follow(kind){
  await sleep(15000+Math.random()*25000);
  if(st!=='idle')return;
  try{
    const msgs=DATA.chat.slice(-(S.ctx||20)).map(m=>({role:m.role,text:m.text||(m.images?.length?'（发了照片）':'')})).filter(m=>m.text);
    msgs.push({role:'user',text:`（系统提示，不是她说的话：你刚才主动给她打电话，她${kind==='拒接'?'直接挂掉了':'没有接'}。给她发一两条消息。）`});
    const out=await callAI(chatSystem(),msgs);
    const parts=S.split?out.split(/\n+/).map(s=>s.trim()).filter(Boolean):[out.trim()];
    parts.forEach((p,i)=>DATA.chat.push({role:'model',text:p,t:Date.now()+i}));
    await saveData('chat');refresh();
    if(!$('#page-chat')?.classList.contains('active'))toast(`${S.hisName}给你发了消息`)}
  catch(e){}}
function maybe(delay){
  if(pend||S.callIn===false||!S.apiKey)return;pend=true;
  setTimeout(()=>{pend=false;if(!canRing())return;const r=why();if(r)incoming(r)},delay)}
setInterval(()=>maybe(1000),10*60000);

/* ---------- 设置：放在「我的 → 他的消息」 ---------- */
function ringLabel(){const el=$('#ciRingName');if(el)el.textContent='来电铃声：'+(S.callRing?(S.callRingName||'你自己的铃声'):'默认铃声')}
function mount(){
  if($('#ciSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('他的消息'));
  if(!sec)return;
  const html=`<div id="ciSet" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
    <label class="chk"><input type="checkbox" id="ciOn"><span>他会主动给你打电话</span></label>
    <p class="hint">365 开着的时候才会打来：很久没聊天，或者睡前 22:30 以后。一天最多一次</p>
    <div class="btns"><button class="pill ghost" id="ciTest">现在让他打过来试试</button></div>
    <p class="hint" id="ciRingName" style="margin-top:12px"></p>
    <div class="btns"><button class="pill ghost" id="ciRing">换一个铃声</button><button class="pill ghost" id="ciPlay">试听</button><button class="pill ghost" id="ciDef">用默认的</button></div>
    <input type="file" id="ciFile" accept="audio/*" style="display:none"></div>`;
  const a=[...sec.querySelectorAll('label.f,label.chk,.btns,.hint')].at(-1);
  if(a)a.insertAdjacentHTML('afterend',html);else sec.insertAdjacentHTML('beforeend',html);
  $('#ciOn').checked=S.callIn!==false;
  $('#ciOn').onchange=e=>{S.callIn=e.target.checked;saveSettings()};
  $('#ciTest').onclick=()=>{toast('3 秒后他会打过来');setTimeout(()=>incoming('miss',true),3000)};
  $('#ciRing').onclick=()=>{const f=$('#ciFile');f.value='';f.click()};
  $('#ciFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;
    if(f.size>4e6)return toast('文件太大了，选一个 4MB 以内的');
    const data=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});
    const[id]=await IMG.putAll([data]);
    if(S.callRing)try{await IMG.del([S.callRing])}catch(x){}
    S.callRing=id;S.callRingName=f.name.replace(/\.\w+$/,'');saveSettings();ringData=data;ringLabel();toast('铃声换好了 ♡')};
  $('#ciPlay').onclick=()=>{if(!rg.paused){ringStop();$('#ciPlay').textContent='试听';return}
    ringStart(ringSrc());$('#ciPlay').textContent='停止';
    setTimeout(()=>{if(st==='idle'){ringStop();$('#ciPlay').textContent='试听'}},8000)};
  $('#ciDef').onclick=async()=>{if(!S.callRing)return toast('现在就是默认的');
    try{await IMG.del([S.callRing])}catch(x){}
    S.callRing=null;S.callRingName='';saveSettings();ringData=null;ringLabel();toast('换回默认铃声了')};
  ringLabel()}

/* ---------- 他记得电话的事 ---------- */
HOOKS.context.push(()=>{const out=[];
  const c=DATA.calls.at(-1);
  if(c&&Date.now()-c.t<864e5&&c.lines.length)out.push(`【刚才的电话】${c.dir==='in'?'你给她':'她给你'}打了电话，${fmtDate(c.t)}，大约 ${Math.max(1,Math.round(c.dur/60))} 分钟，最后聊的是：\n`
    +c.lines.slice(-12).map(x=>`${x.role==='user'?'她':'你'}：${x.text}`).join('\n')+'\n聊天时可以自然地接上电话里的话。');
  let m=null;try{m=JSON.parse(localStorage.getItem(MK))}catch(e){}
  if(m&&Date.now()-m.t<3*36e5&&(!c||c.t<m.t))out.push(`【电话】你${Math.max(1,Math.round((Date.now()-m.t)/60000))}分钟前给她打电话，她${m.k==='拒接'?'直接挂掉了':'没有接'}。可以问问她刚才在干嘛，或者小小地抱怨一下。`);
  return out.join('\n')});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(st!=='idle')hang();ringStop()}
  else maybe(20000+Math.random()*40000)});
mount();
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.calls))DATA.calls=[];mount();loadRing();maybe(30000+Math.random()*60000)});
HOOKS.page.push(n=>{if(n==='me')mount()});
})();
