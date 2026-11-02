/* ===== 365 · call.js · 打电话 + 他打给你 ===== */
(()=>{
if(!Array.isArray(DATA.calls))DATA.calls=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('calls'))LISTS.push('calls');
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const PHONE='<svg class="i" viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v3a2 2 0 0 1-2.1 2.1A15.5 15.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1z"/></svg>';
const PH='<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v3a2 2 0 0 1-2.1 2.1A15.5 15.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1z"/></svg>';
const MIC='<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
const mmss=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
const IK='365-incall',MK='365-inmiss';
let st='idle',ctx=null,rec=null,heard='',silT=null,tick=null,t0=0,lines=[],muted=false,stopSpeak=null,tok=0,warned=false,dir='out',inc=null,ringT=null,incT=null,pend=false;
try{speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>{}}catch(e){}

document.head.insertAdjacentHTML('beforeend',`<style>
#callUI{position:absolute;inset:0;z-index:35;display:none;flex-direction:column;align-items:center;color:#fff;background:rgba(18,14,22,.62);-webkit-backdrop-filter:blur(30px) saturate(1.3);backdrop-filter:blur(30px) saturate(1.3);padding:calc(var(--st) + 14px) 28px calc(var(--sb) + 34px)}
#callUI.show{display:flex;animation:fd .3s ease}
.cl-top{align-self:stretch;display:flex;justify-content:flex-end;min-height:30px}
.cl-top button{color:#fff;opacity:.7;font-size:13px;letter-spacing:2px;padding:6px 4px}
#callUI.in .cl-top button{visibility:hidden}
.cl-av{position:relative;margin-top:6vh;border-radius:50%}
.cl-av .av{width:116px;height:116px;font-size:42px;position:relative;z-index:1}
.cl-av::before,.cl-av::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);opacity:0}
#callUI.speak .cl-av::before,#callUI.incoming .cl-av::before{animation:clP 1.6s infinite}
#callUI.speak .cl-av::after,#callUI.incoming .cl-av::after{animation:clP 1.6s .8s infinite}
#callUI.ring .cl-av::before{animation:clP 1.2s infinite}
@keyframes clP{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.7);opacity:0}}
.cl-name{font-family:var(--ti);font-size:28px;letter-spacing:6px;margin-top:22px}
.cl-time{font-family:var(--num);font-style:italic;font-size:18px;opacity:.75;margin-top:6px;letter-spacing:2px;min-height:24px}
.cl-st{font-size:13px;opacity:.6;letter-spacing:3px;margin-top:2px;min-height:20px}
.cl-sub{flex:1;align-self:stretch;display:flex;flex-direction:column;justify-content:center;gap:12px;text-align:center;font-family:var(--ti);overflow:hidden}
.cl-sub .h{font-size:18px;line-height:1.8;letter-spacing:1px}
.cl-sub .m{font-size:14px;line-height:1.7;opacity:.55}
#callUI.nosub .cl-sub>*{visibility:hidden}
.cl-btns{display:flex;align-items:flex-start;justify-content:space-around;align-self:stretch}
#callUI.in .cl-btns.nm,#callUI:not(.in) .cl-btns.ic{display:none}
.cl-b{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;letter-spacing:2px;color:#fff}
.cl-b i{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.16);font-style:normal;font-size:16px;font-family:var(--ti);transition:background .2s}
.cl-b.on i{background:#fff;color:#222}
.cl-b.end i,.cl-b.ok i{width:72px;height:72px}
.cl-b.end i{background:#E5484D}
.cl-b.ok i{background:#34C759;animation:clJ 1.2s ease-in-out infinite}
@keyframes clJ{0%,100%{transform:none}50%{transform:translateY(-6px)}}
.cl-b svg{width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cl-b.end svg,.cl-b.ok svg{fill:#fff;stroke:none}
.cl-b.end svg{transform:rotate(135deg)}
</style>`);

$('#app').insertAdjacentHTML('beforeend',`<div id="callUI">
  <div class="cl-top"><button id="clSet">声音</button></div>
  <div class="cl-av" id="clAv"></div>
  <div class="cl-name" id="clName"></div>
  <div class="cl-time" id="clTime"></div>
  <div class="cl-st" id="clSt"></div>
  <div class="cl-sub" id="clSub"></div>
  <div class="cl-btns nm">
    <button class="cl-b" id="clMute"><i>${MIC}</i>静音</button>
    <button class="cl-b end" id="clEnd"><i>${PH}</i>挂断</button>
    <button class="cl-b" id="clCap"><i>字</i>字幕</button>
  </div>
  <div class="cl-btns ic">
    <button class="cl-b end" id="clNo"><i>${PH}</i>拒绝</button>
    <button class="cl-b ok" id="clYes"><i>${PH}</i>接听</button>
  </div>
</div>`);

/* 聊天输入框旁边的电话按钮 */
const mb=$('#micBtn')||$('#plusBtn');
mb.insertAdjacentHTML('afterend',`<button id="callBtn" aria-label="打电话">${PHONE}</button>`);
$('#callBtn').className=mb.className;
$('#callBtn').addEventListener('pointerdown',e=>e.preventDefault());
$('#callBtn').onclick=()=>start();

/* ---------- 声音的准备 ---------- */
function getCtx(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){ctx=null}}return ctx}
document.addEventListener('pointerdown',()=>{try{getCtx()?.resume()}catch(e){}},{passive:true});
function unlockTTS(){try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(''))}catch(e){}}
function tone(f,s,d,v){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.03);g.gain.setValueAtTime(v,s+d-.05);g.gain.linearRampToValueAtTime(0,s+d);o.start(s);o.stop(s+d+.02)}
function ring(){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime;
  for(let k=0;k<2;k++)[440,480].forEach(f=>tone(f,t+k*1.4,1,.05))}
function ringIn(){if(!ctx)return;try{ctx.resume()}catch(e){}if(ctx.state!=='running')return;const t=ctx.currentTime;
  for(let k=0;k<2;k++)[659,784,988,784].forEach((f,i)=>tone(f,t+k*1.1+i*.2,.18,.07))}

function set(s,t){st=s;const u=$('#callUI');['ring','listen','think','speak','incoming'].forEach(x=>u.classList.toggle(x,x===s));$('#clSt').textContent=t||''}
function sub(live){
  const H=[...lines].reverse().find(x=>x.role==='model');
  const lastMe=lines.at(-1)?.role==='user'?lines.at(-1).text:'';
  const M=live||lastMe;
  $('#clSub').innerHTML=(H?`<div class="h">${esc(H.text)}</div>`:'')+(M?`<div class="m">${esc(M)}</div>`:'')}
function refresh(){HOOKS.refresh.forEach(f=>{try{f()}catch(e){}})}
function open(s,t,d){
  tok++;dir=d;lines=[];heard='';t0=0;muted=false;
  $('#clAv').innerHTML=avatarHTML('him');$('#clName').textContent=S.hisName;$('#clTime').textContent='';
  $('#callUI').classList.toggle('nosub',S.callSub===false);$('#clCap').classList.toggle('on',S.callSub!==false);
  $('#clMute').classList.remove('on');sub();
  $('#callUI').classList.toggle('in',s==='incoming');$('#callUI').classList.add('show');set(s,t)}
function connected(){t0=Date.now();$('#clTime').textContent='00:00';clearInterval(tick);
  tick=setInterval(()=>{$('#clTime').textContent=mmss(Math.floor((Date.now()-t0)/1000))},500)}

/* ---------- 你打给他 ---------- */
const H_OUT='（系统提示，不是她说的话：她刚给你打来电话，你接起来了。先开口说第一句。）';
const H_NIGHT='（系统提示，不是她说的话：快睡觉了，是你主动给她打的电话，她接起来了。先开口，像睡前想听她的声音那样。）';
const H_MISS='（系统提示，不是她说的话：你们好久没说话了，是你主动给她打的电话，她接起来了。先开口，说说你为什么打给她。）';
async function start(){
  if(st!=='idle')return;
  if(!SR)return toast('这台手机不支持语音识别，打不了电话');
  if(!S.apiKey)return toast('还没有填 API Key');
  $('#chatInput')?.blur();
  getCtx();try{await ctx?.resume()}catch(e){}
  unlockTTS();
  open('ring','正在呼叫…','out');const my=tok;
  ring();const rt=setInterval(ring,2800);
  const minT=sleep(2600+Math.random()*2400);
  let first;
  try{first=await ask(H_OUT)}
  catch(e){clearInterval(rt);if(my===tok){toast(e.message);hang(true)}return}
  await minT;clearInterval(rt);if(my!==tok)return;
  connected();say(first)}

/* ---------- 他说话 ---------- */
const RULE=`\n\n【通话】你们正在打语音电话。她说的话是语音识别转出来的，可能有错字，按意思理解。你说的话会被直接念给她听：只说口语，像真的在打电话，每次一到三句、不超过六十字；不要动作描写、括号、星号、表情、emoji，不要分行，不要加名字前缀。`;
function tidy(t){return clean(String(t||'')).replace(/[（(【\[][^）)】\]]*[）)】\]]/g,'').replace(/\*[^*]*\*/g,'')
  .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,'').replace(/\s*\n+\s*/g,'，').trim()||'嗯。'}
async function ask(hint){
  const base=DATA.chat.slice(-10).map(m=>({role:m.role,text:m.text||(m.images?.length?'（发了照片）':'')})).filter(m=>m.text);
  const msgs=[...base,...lines.map(x=>({role:x.role,text:x.text}))];
  if(hint)msgs.push({role:'user',text:hint});
  return tidy(await (window.webReply||callAI)(chatSystem()+RULE,msgs))}
async function say(text){
  const my=tok;lines.push({role:'model',text,t:Date.now()});sub();set('speak','点一下可以打断');
  await speak(text);
  if(my!==tok)return;listen()}
const zh=()=>{try{return speechSynthesis.getVoices().filter(v=>/^(zh|cmn)/i.test(v.lang))}catch(e){return []}};
function voice(){const L=zh();return L.find(v=>v.name===S.callSysVoice)||L.find(v=>/zh[-_]CN/i.test(v.lang))||L[0]||null}
async function apiTTS(text){
  const r=await fetch(String(S.baseUrl||'').replace(/\/+$/,'')+'/audio/speech',{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+S.apiKey},
    body:JSON.stringify({model:S.callTtsModel||'tts-1',input:text,voice:S.callApiVoice||'onyx',speed:S.callRate||1})});
  if(!r.ok){let m='';try{const j=await r.json();m=j.error?.message||''}catch(e){}throw new Error(m||('请求失败 '+r.status))}
  const ab=await r.arrayBuffer();
  return await new Promise((ok,no)=>ctx.decodeAudioData(ab,ok,no))}
function speak(text){
  return new Promise(async res=>{
    let done=false;const fin=()=>{if(done)return;done=true;stopSpeak=null;res()};
    stopSpeak=fin;
    if(S.callVoice==='api'&&S.provider!=='gemini'&&ctx){
      try{const buf=await apiTTS(text);if(done)return;
        await ctx.resume();const s=ctx.createBufferSource();s.buffer=buf;s.connect(ctx.destination);s.onended=fin;
        stopSpeak=()=>{try{s.stop()}catch(e){}fin()};s.start();return}
      catch(e){if(done)return;if(!warned){warned=true;toast('中转站的声音用不了，先用系统的声音')}}}
    try{
      const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=S.callRate||1;u.pitch=.9;
      const v=voice();if(v)u.voice=v;
      u.onend=fin;u.onerror=fin;
      stopSpeak=()=>{try{speechSynthesis.cancel()}catch(e){}fin()};
      speechSynthesis.cancel();speechSynthesis.speak(u);
      setTimeout(fin,4000+text.length*400)}
    catch(e){fin()}})}

/* ---------- 听你说 ---------- */
function listen(){
  if(st==='idle'||st==='incoming')return;
  clearTimeout(silT);heard='';
  if(muted){set('listen','静音中');return}
  set('listen','在听…');
  const my=tok;
  try{const a=new SR();a.lang='zh-CN';a.continuous=true;a.interimResults=true;
    a.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;heard=s.trim();
      if(heard)sub(heard);
      clearTimeout(silT);silT=setTimeout(()=>finish(my),1300)};
    a.onend=()=>{if(rec!==a)return;rec=null;if(my!==tok||st!=='listen')return;
      if(heard)finish(my);else setTimeout(()=>{if(my===tok&&st==='listen'&&!rec&&!muted)listen()},250)};
    a.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast('没有麦克风或语音识别的权限');hang()}};
    rec=a;a.start()}
  catch(e){toast('听不到你：'+e.message)}}
async function finish(my){
  if(my!==tok||st!=='listen')return;clearTimeout(silT);
  const t=heard.trim();heard='';
  const a=rec;rec=null;try{a?.stop()}catch(e){}
  if(!t){listen();return}
  lines.push({role:'user',text:t,t:Date.now()});sub();set('think','…');
  try{const out=await ask();if(my!==tok)return;say(out)}
  catch(e){if(my!==tok)return;toast(e.message);listen()}}

/* ---------- 按钮 ---------- */
const cut=()=>{if(st==='speak'&&stopSpeak)stopSpeak()};
$('#clAv').onclick=cut;$('#clSub').onclick=cut;
$('#clMute').onclick=()=>{muted=!muted;$('#clMute').classList.toggle('on',muted);
  if(st!=='listen')return;
  if(muted){const a=rec;rec=null;clearTimeout(silT);try{a?.abort()}catch(e){}set('listen','静音中')}else listen()};
$('#clCap').onclick=()=>{S.callSub=S.callSub===false;saveSettings();
  $('#callUI').classList.toggle('nosub',S.callSub===false);$('#clCap').classList.toggle('on',S.callSub!==false)};
$('#clEnd').onclick=()=>hang();
$('#clYes').onclick=()=>accept();
$('#clNo').onclick=()=>miss('拒接');

/* ---------- 换声音 ---------- */
const AV=[['onyx','低沉的男声'],['echo','温和的男声'],['fable','清亮的男声'],['alloy','中性的声音'],['nova','女声'],['shimmer','女声']];
$('#clSet').onclick=()=>{
  const acts=[[`系统的声音${S.callVoice!=='api'?' ✓':''}`,()=>{S.callVoice='sys';saveSettings();
    const L=zh();if(!L.length)return toast('这台手机没有中文的系统声音');
    sheet(L.slice(0,12).map(v=>[`${v.name}${v.name===voice()?.name?' ✓':''}`,()=>{S.callSysVoice=v.name;saveSettings();toast('下一句开始换成这个声音')}]))}]];
  if(S.provider!=='gemini')acts.push([`中转站的声音${S.callVoice==='api'?' ✓':''}`,()=>{S.callVoice='api';warned=false;saveSettings();
    sheet(AV.map(([k,n])=>[`${k} · ${n}${(S.callApiVoice||'onyx')===k?' ✓':''}`,()=>{S.callApiVoice=k;saveSettings();toast('下一句开始换成这个声音')}]))}]);
  acts.push([`语速 ${S.callRate||1}`,()=>{const v=prompt('语速（0.7 到 1.5，1 是正常）',S.callRate||1);const n=parseFloat(v);
    if(n>=.5&&n<=2){S.callRate=n;saveSettings()}}]);
  sheet(acts)};

/* ---------- 挂断 ---------- */
async function hang(silent){
  if(st==='idle')return;
  if(st==='incoming')return miss('未接');
  tok++;const dur=t0?Math.round((Date.now()-t0)/1000):0,d=dir;
  clearInterval(tick);clearTimeout(silT);
  const a=rec;rec=null;try{a?.abort()}catch(e){}
  try{stopSpeak?.()}catch(e){}try{speechSynthesis.cancel()}catch(e){}
  set('idle','');$('#callUI').classList.remove('show','in');
  if(silent||!dur)return;
  const c={id:uid(),t:t0,dur,dir:d,lines:lines.map(x=>({role:x.role,text:x.text}))};
  DATA.calls.push(c);DATA.calls=DATA.calls.slice(-30);await saveData('calls');
  const now=Date.now();
  DATA.chat.push(d==='in'?{role:'model',text:`通话时长 ${mmss(dur)}`,call:c.id,t:now}
    :{role:'user',text:`通话时长 ${mmss(dur)}`,call:c.id,t:now,status:'read',readAt:now});
  await saveData('chat');refresh()}

/* ---------- 他打给你 ---------- */
function canRing(force){
  if(!SR||!S.apiKey||st!=='idle'||document.hidden)return false;
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
  ringIn();clearInterval(ringT);ringT=setInterval(ringIn,2600);
  clearTimeout(incT);incT=setTimeout(()=>miss('未接'),30000)}
async function accept(){
  if(st!=='incoming')return;
  clearInterval(ringT);clearTimeout(incT);
  getCtx();try{await ctx?.resume()}catch(e){}
  unlockTTS();
  const r=inc?.reason;inc=null;
  $('#callUI').classList.remove('in');
  connected();set('think','接通中…');
  go('chat');
  const my=tok;
  try{const first=await ask(r==='night'?H_NIGHT:H_MISS);if(my!==tok)return;say(first)}
  catch(e){if(my===tok){toast(e.message);listen()}}}
async function miss(kind){
  if(st!=='incoming')return;
  clearInterval(ringT);clearTimeout(incT);inc=null;tok++;
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

/* 开关放在「我的 → 他的消息」 */
function mount(){
  if($('#ciSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('他的消息'));
  if(!sec)return;
  const html=`<div id="ciSet" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
    <label class="chk"><input type="checkbox" id="ciOn"><span>他会主动给你打电话</span></label>
    <p class="hint">365 开着的时候才会打来：很久没聊天，或者睡前 22:30 以后。一天最多一次</p>
    <div class="btns"><button class="pill ghost" id="ciTest">现在让他打过来试试</button></div></div>`;
  const a=[...sec.querySelectorAll('label.f,label.chk,.btns,.hint')].at(-1);
  if(a)a.insertAdjacentHTML('afterend',html);else sec.insertAdjacentHTML('beforeend',html);
  $('#ciOn').checked=S.callIn!==false;
  $('#ciOn').onchange=e=>{S.callIn=e.target.checked;saveSettings()};
  $('#ciTest').onclick=()=>{toast('3 秒后他会打过来');setTimeout(()=>incoming('miss',true),3000)}}

/* ---------- 他记得电话的事 ---------- */
HOOKS.context.push(()=>{const out=[];
  const c=DATA.calls.at(-1);
  if(c&&Date.now()-c.t<864e5&&c.lines.length)out.push(`【刚才的电话】${c.dir==='in'?'你给她':'她给你'}打了电话，${fmtDate(c.t)}，大约 ${Math.max(1,Math.round(c.dur/60))} 分钟，最后聊的是：\n`
    +c.lines.slice(-12).map(x=>`${x.role==='user'?'她':'你'}：${x.text}`).join('\n')+'\n聊天时可以自然地接上电话里的话。');
  let m=null;try{m=JSON.parse(localStorage.getItem(MK))}catch(e){}
  if(m&&Date.now()-m.t<3*36e5&&(!c||c.t<m.t))out.push(`【电话】你${Math.max(1,Math.round((Date.now()-m.t)/60000))}分钟前给她打电话，她${m.k==='拒接'?'直接挂掉了':'没有接'}。可以问问她刚才在干嘛，或者小小地抱怨一下。`);
  return out.join('\n')});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(st!=='idle')hang()}
  else maybe(20000+Math.random()*40000)});
mount();
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.calls))DATA.calls=[];mount();maybe(30000+Math.random()*60000)});
HOOKS.page.push(n=>{if(n==='me')mount();if(n!=='chat'&&st!=='idle'&&st!=='incoming')hang()});
})();
