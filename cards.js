/* ===== 365 · cards.js · 小卡片 ===== */
(()=>{
if(!Array.isArray(DATA.cards))DATA.cards=[];
const save=()=>saveData('cards');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const TYPES={word:['情话','words'],task:['任务','task'],truth:['真心话','truth'],dare:['大冒险','dare']};
const MODE_TYPES={day:['word','task','truth','dare'],night:['task','truth','dare']};
const HINT={word:'写在卡片上的话',task:'给他的任务',truth:'想问他的真心话',dare:'让他做的大冒险'};
let mode='day',unlocked=false,pick='any',busy=false,page='home',writeType='word',ansCard=null;
const find=id=>DATA.cards.find(c=>c.id===id);
const list=()=>DATA.cards.filter(c=>c.mode===mode).sort((a,b)=>a.t-b.t);

document.head.insertAdjacentHTML('beforeend',`<style>
#page-cards{padding:0;overflow:hidden;transition:background .3s}
#page-cards.active{display:flex;flex-direction:column}
body.cd #tabbar{display:none}
#page-cards.night{background:linear-gradient(180deg,rgba(20,14,22,.92),rgba(34,24,36,.94));--ink:#F2ECEE;--sub:rgba(242,236,238,.55);color:var(--ink)}
#page-cards.night .glass{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);box-shadow:inset 1px 1px 0 rgba(255,255,255,.12),0 6px 20px rgba(0,0,0,.25)}
#page-cards.night .pill.ghost{background:rgba(255,255,255,.1);color:var(--ink);border-color:rgba(255,255,255,.18)}
.cd-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 6px}
.cd-mid{flex:1;text-align:center}
.cd-mid b{display:block;font-weight:500;font-size:15px;letter-spacing:4px}
.cd-mid span{font-family:var(--num);font-style:italic;font-size:13px;color:var(--sub)}
.cd-seg{display:flex;gap:2px;background:rgba(255,255,255,.35);border-radius:99px;padding:2px}
.night .cd-seg{background:rgba(255,255,255,.1)}
.cd-seg button{padding:5px 12px;border-radius:99px;font-size:12.5px;color:var(--sub);letter-spacing:2px}
.cd-seg button.on{background:var(--accent);color:var(--acct)}
#cdTrack{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}
#cdTrack::-webkit-scrollbar{display:none}
.cd-slide{flex:0 0 100%;min-width:0;scroll-snap-align:center;scroll-snap-stop:always;padding:8px 22px calc(var(--sb) + 16px);display:flex;flex-direction:column;justify-content:center}
.cd-card{position:relative;min-height:min(60vh,500px);max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 18px;border-radius:26px;display:flex;flex-direction:column}
.cd-card.in{animation:cdFlip .6s ease}
@keyframes cdFlip{0%{transform:perspective(900px) rotateY(90deg);opacity:.3}100%{transform:none;opacity:1}}
.cd-h{display:flex;align-items:baseline;gap:8px;flex:none}
.cd-type{font-size:14px;letter-spacing:4px;color:var(--accent-t)}
.night .cd-type{color:#E6C3CA}
.cd-en{font-family:var(--en);font-style:italic;color:var(--sub);font-size:14px}
.cd-more{margin-left:auto;width:30px;height:30px;border-radius:50%;color:var(--sub);letter-spacing:1px}
.cd-text{flex:none;margin:auto 0;padding:28px 4px;text-align:center;font-family:var(--ti);font-size:19px;line-height:1.9;letter-spacing:1px;white-space:pre-wrap;word-break:break-word}
.cd-th{flex:none;display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.cd-say{font-family:var(--cn);font-size:14.5px;line-height:1.6;padding:8px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word}
.cd-say small{display:block;font-size:11px;opacity:.6;margin-bottom:2px;letter-spacing:1px}
.cd-say.him{background:var(--hb);color:var(--hbt);border-left:3px solid var(--accent)}
.cd-say.me{background:var(--mb);color:var(--mbt);margin-left:24px}
.night .cd-say.him,.night .cd-say.me{background:rgba(255,255,255,.08);color:var(--ink)}
.cd-foot{flex:none;display:flex;align-items:center;gap:8px}
.cd-foot small{font-size:11.5px;color:var(--sub);letter-spacing:1px}
.cd-foot .pill{margin-left:auto}
.cd-done{font-size:12px;color:var(--accent-t);letter-spacing:2px}
.night .cd-done{color:#E6C3CA}
.cd-deck{display:block;position:relative;width:min(70%,270px);aspect-ratio:3/4;margin:0 auto 22px}
.cd-back{position:absolute;inset:0;border-radius:24px;background:linear-gradient(145deg,var(--accent),var(--rose));border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 26px rgba(60,30,40,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff}
.cd-back:nth-child(1){transform:rotate(-6deg) translate(-8px,6px);opacity:.5}
.cd-back:nth-child(2){transform:rotate(4deg) translate(6px,4px);opacity:.75}
.cd-back b{font-family:var(--num);font-style:italic;font-weight:300;font-size:46px;letter-spacing:-1px}
.cd-back small{font-size:12px;letter-spacing:3px;opacity:.85}
.night .cd-back{background:linear-gradient(145deg,#3E2C42,#1E1622);border-color:rgba(255,255,255,.18)}
.cd-deck.busy .cd-back:nth-child(3){animation:cdPulse 1.2s infinite}
@keyframes cdPulse{50%{transform:scale(.97)}}
.cd-deck:active .cd-back:nth-child(3){transform:scale(.97)}
.cd-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px}
.cd-chips button{padding:6px 14px;border-radius:99px;font-size:13px;color:var(--sub);background:rgba(255,255,255,.4);letter-spacing:1px}
.night .cd-chips button{background:rgba(255,255,255,.08)}
.cd-chips button.on{background:var(--accent);color:var(--acct)}
.cd-btns{display:flex;gap:10px;justify-content:center}
.cd-btns .pill{padding:10px 22px;font-size:14px}
.cd-count{text-align:center;font-size:12px;color:var(--sub);margin-top:14px;letter-spacing:1px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cards">
  <div class="cd-top">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <div class="cd-mid"><b>小卡片</b><span id="cdPos"></span></div>
    <div class="cd-seg" id="cdSeg"><button data-m="day">白天</button><button data-m="night">夜晚</button></div>
  </div>
  <div id="cdTrack"></div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="cdPin"><div class="mbox">
  <h3>夜晚</h3>
  <p class="hint" style="color:var(--sys-sub);text-align:center">输入秘密的密码</p>
  <input id="cdPinIn" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" style="width:160px;margin:12px auto 4px;display:block;text-align:center;font-size:26px;letter-spacing:14px;padding:8px 0 8px 14px;border:0;border-radius:14px;background:var(--sys-card);color:var(--sys-txt);outline:none">
  <div class="mbtns" style="justify-content:center"><button class="pill ghost" data-close="cdPin">取消</button></div>
</div></div>
<div class="modal" id="cdWrite"><div class="mbox">
  <h3>写一张给<span class="hisName">陆择</span></h3>
  <div class="f"><span>哪一种</span><div class="seg" id="cdWType"></div></div>
  <label class="f"><span id="cdWHint">写在卡片上的话</span><textarea class="short" id="cdWText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="cdWrite">取消</button><button class="pill" id="cdWSave">翻给他</button></div>
</div></div>
<div class="modal" id="cdAns"><div class="mbox">
  <h3 id="cdAT"></h3>
  <div id="cdACard" style="text-align:center;font-family:var(--ti);font-size:16px;line-height:1.7;margin:6px 0 2px"></div>
  <label class="f"><span id="cdAH"></span><textarea class="short" id="cdAText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="cdAns">取消</button><button class="pill" id="cdASave">好了</button></div>
</div></div>`);

/* ---------- 和他说话：白天用平时的模型，夜晚用秘密的模型 ---------- */
const DAY_SCENE='这是你们的小窝「365」里的「小卡片」，白天的牌堆。你们会一张一张地翻卡片：情话、任务卡、真心话、大冒险。';
function nightSys(){let s=personaText()+'\n\n'+nowLine()+'\n【场景】这是你们的小窝「365」里的「小卡片」，夜晚的牌堆，只属于你们两个人，没有别人能看到。你们会一张一张地翻卡片：任务卡、真心话、大冒险。';
  if((S.sxExtra||'').trim())s+='\n\n'+S.sxExtra.trim();return s}
async function nightAI(system,msgs){
  const c=S.sxProvider
    ?{provider:S.sxProvider,apiKey:S.sxKey||S.apiKey,model:S.sxModel||(S.sxProvider==='gemini'?'gemini-2.5-flash':'deepseek-chat'),baseUrl:S.sxBase||S.baseUrl}
    :{provider:S.provider,apiKey:S.apiKey,model:S.model,baseUrl:S.baseUrl};
  if(!c.apiKey)throw new Error('还没有填 API Key');
  const arr=prep(msgs);let r,j,t;
  try{
    if(c.provider==='gemini'){
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent?key=${encodeURIComponent(c.apiKey)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:arr.map(m=>({role:m.role,parts:[{text:m.text||'…'}]})),generationConfig:{temperature:1},safetySettings:cats.map(x=>({category:x,threshold:'BLOCK_NONE'}))})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const cd=j.candidates?.[0];
      t=(cd?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
      if(!t)throw new Error('他没有回话（原因：'+(cd?.finishReason||j.promptFeedback?.blockReason||'未知')+'），再试一次');
    }else{
      const messages=[{role:'system',content:system},...arr.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text||''}))];
      r=await fetch(String(c.baseUrl||'').replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.apiKey},body:JSON.stringify({model:c.model,messages,temperature:1})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      t=(j.choices?.[0]?.message?.content||'').trim();
      if(!t)throw new Error('他没有回话，再试一次');
    }
    return t;
  }catch(e){if(e instanceof TypeError)throw new Error('连不上，检查一下 VPN 和网络');throw e}}
const ai=(m,msgs)=>m==='night'?nightAI(nightSys(),msgs):callAI(sceneSystem(DAY_SCENE),msgs);

/* ---------- 他出一张卡 ---------- */
const PROMPT={
  day:{word:'写一张给她的小卡片：一句情话或者一张小纸条，像真的写在卡片上一样，20到60字。',
    task:'出一张今天的任务卡给她：一件今天就能完成的具体小事，可以是照顾好自己，也可以是和你有关的小约定，符合你的性格。一两句话，不超过50字。',
    truth:'出一道真心话问题给她，一句话，可以甜也可以刁钻，不涉及露骨内容。',
    dare:'出一个大冒险给她，要是她用手机就能完成、做完能告诉你结果的，不涉及露骨内容。一两句话。'},
  night:{task:'出一张夜晚的任务卡给她，按你的性格和你们之间的玩法来，具体、可以执行。一两句话，不超过60字。',
    truth:'出一道夜晚的真心话问题给她，私密、直接，一句话。',
    dare:'出一个夜晚的大冒险给她，要她能在手机这边完成、做完能告诉你，按你们之间的玩法来。一两句话。'}};
async function gen(type,m){
  const have=DATA.cards.filter(c=>c.mode===m&&c.type===type).slice(-12).map(c=>'- '+c.text).join('\n');
  const recent=m==='day'?recentChat(8):'';
  const ask=`请以${S.hisName}的身份，${PROMPT[m][type]}${have?`\n之前出过的，不要重复：\n${have}`:''}${recent?`\n你们最近的聊天：\n${recent}`:''}\n只输出卡片上的内容，不要引号，不要标题，不要用 emoji。`;
  return clean(await ai(m,[{role:'user',text:ask}]))}

/* ---------- 他回应 ---------- */
function brief(c){
  const th=(c.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
  if(c.by==='me'){
    const head={word:`她写了一张小卡片给你：「${c.text}」`,task:`她给你出了一张任务卡：「${c.text}」`,truth:`她抽给你一道真心话：「${c.text}」`,dare:`她给你出了一个大冒险：「${c.text}」`}[c.type];
    const how=th?'接着回应她最新说的话。':{word:'看完回应她。',task:'接下这个任务，说你会怎么做，或者直接说你已经做了什么。',truth:'认真、诚实地回答。',dare:'照做，告诉她你是怎么做的，或者直接说给她听。'}[c.type];
    return `${head}${th?'\n\n后面的对话：\n'+th:''}\n\n${how}`}
  const head={word:`你写给她的小卡片：「${c.text}」`,task:`你给她出的任务卡：「${c.text}」${c.done?'，她说已经完成了':''}`,truth:`你问她的真心话：「${c.text}」`,dare:`你给她出的大冒险：「${c.text}」${c.done?'，她说已经做完了':''}`}[c.type];
  return `${head}\n\n后面的对话：\n${th||'（她没有多说什么）'}\n\n回应她。${c.type==='task'||c.type==='dare'?'可以夸她、检查她、奖励或者罚她，按你的性格来。':''}`}
async function respond(c){
  if(c._busy)return;c._busy=true;if(page==='cards')rerender();
  try{const t=await ai(c.mode,[{role:'user',text:brief(c)+`\n请以${S.hisName}的身份回复，口语化，一到四句，不要加名字前缀，不要用 emoji。`}]);
    (c.thread=c.thread||[]).push({who:'him',text:clean(t),t:Date.now()});
    if(page!=='cards')toast(`${S.hisName}回了你的小卡片`)}
  catch(e){toast(e.message)}
  delete c._busy;await save();if(page==='cards')rerender()}

/* ---------- 显示 ---------- */
function action(c){
  const th=c.thread||[];
  if(c.by==='me')return th.length?'回他一句':'';
  if(c.type==='task')return c.done?'回他一句':'完成了';
  if(c.type==='dare')return c.done?'回他一句':'做完了';
  if(c.type==='truth')return th.some(x=>x.who==='me')?'回他一句':'回答';
  return '回他一句'}
function slide(c,isNew){
  const[cn,en]=TYPES[c.type];
  const th=(c.thread||[]).map(x=>`<div class="cd-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':esc(S.hisName)}</small>${esc(x.text)}</div>`).join('')
    +(c._busy?`<div class="cd-say him"><small>${esc(S.hisName)}</small>正在写…</div>`:'');
  const act=c._busy?'':action(c);
  const who=c.by==='me'?`我写给${esc(S.hisName)}的`:`${esc(S.hisName)}写的`;
  return `<div class="cd-slide"><div class="cd-card glass${isNew?' in':''}">
    <div class="cd-h"><span class="cd-type">${cn}</span><span class="cd-en">${en}</span><button class="cd-more" data-cm="${c.id}">···</button></div>
    <div class="cd-text">${esc(c.text)}</div>
    ${th?`<div class="cd-th">${th}</div>`:''}
    <div class="cd-foot"><small>${who} · ${fmtDate(c.t)}</small>${c.done?'<span class="cd-done">已完成</span>':''}${act?`<button class="pill" data-ca="${c.id}">${act}</button>`:''}</div>
  </div></div>`}
function deck(){
  const chips=[['any','随便'],...MODE_TYPES[mode].map(t=>[t,TYPES[t][0]])];
  return `<div class="cd-slide">
    <button class="cd-deck${busy?' busy':''}" id="cdDraw"><div class="cd-back"></div><div class="cd-back"></div><div class="cd-back"><b>365</b><small>${busy?esc(S.hisName)+'在写…':'点一下，翻一张'}</small></div></button>
    <div class="cd-chips" id="cdChips">${chips.map(([k,n])=>`<button data-p="${k}" class="${pick===k?'on':''}">${n}</button>`).join('')}</div>
    <div class="cd-btns"><button class="pill ghost" id="cdWriteBtn">写一张给${esc(S.hisName)}</button></div>
    <div class="cd-count">${mode==='day'?'白天':'夜晚'}已经翻了 ${list().length} 张</div></div>`}
function idx(){const tr=$('#cdTrack');return Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth))}
function pos(){const n=list().length,i=idx();$('#cdPos').textContent=i<n?`${i+1} / ${n}`:'牌堆'}
function render(goto,newId){
  $('#page-cards').classList.toggle('night',mode==='night');
  $$('#cdSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  if(!MODE_TYPES[mode].includes(pick))pick='any';
  const L=list(),tr=$('#cdTrack');
  tr.innerHTML=L.map(c=>slide(c,c.id===newId)).join('')+deck();
  const n=tr.children.length,i=Math.max(0,Math.min(n-1,goto??n-1));
  requestAnimationFrame(()=>{tr.scrollLeft=i*tr.clientWidth;pos()})}
function rerender(){render(idx())}

/* ---------- 翻一张 ---------- */
async function draw(){
  if(busy)return;
  const T=MODE_TYPES[mode],type=pick==='any'?T[Math.floor(Math.random()*T.length)]:pick,m=mode;
  busy=true;rerender();
  try{
    const text=await gen(type,m);
    const c={id:uid(),mode:m,type,by:'him',text,t:Date.now(),thread:[],done:false};
    DATA.cards.push(c);await save();
    busy=false;
    if(page==='cards'&&mode===m)render(list().indexOf(c),c.id);
  }catch(e){toast(e.message)}
  finally{if(busy){busy=false;if(page==='cards')rerender()}}}

/* ---------- 写一张给他 ---------- */
function setWType(t){writeType=t;$$('#cdWType button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('#cdWHint').textContent=HINT[t]}
function openWrite(){
  $('#cdWType').innerHTML=MODE_TYPES[mode].map(t=>`<button data-t="${t}">${TYPES[t][0]}</button>`).join('');
  setWType(MODE_TYPES[mode].includes(writeType)?writeType:MODE_TYPES[mode][0]);
  $('#cdWText').value='';openModal('cdWrite')}
$('#cdWType').onclick=e=>{const b=e.target.closest('[data-t]');if(b)setWType(b.dataset.t)};
$('#cdWSave').onclick=async()=>{const v=$('#cdWText').value.trim();if(!v)return toast('写点什么吧');
  const c={id:uid(),mode,type:writeType,by:'me',text:v,t:Date.now(),thread:[],done:false};
  DATA.cards.push(c);await save();closeModal('cdWrite');render(list().indexOf(c),c.id);respond(c)};

/* ---------- 完成、回答、回一句 ---------- */
function openAns(c){ansCard=c;const a=action(c);
  $('#cdAT').textContent=a;$('#cdACard').textContent=c.text;
  $('#cdAH').textContent=a==='完成了'||a==='做完了'?'说一句（可以不写）':a==='回答'?'你的回答':'想说的话';
  $('#cdAText').value='';openModal('cdAns')}
$('#cdASave').onclick=async()=>{const c=ansCard;if(!c)return;const a=action(c),v=$('#cdAText').value.trim();
  const opt=a==='完成了'||a==='做完了';
  if(!v&&!opt)return toast('写点什么吧');
  if(opt)c.done=true;
  if(v)(c.thread=c.thread||[]).push({who:'me',text:v,t:Date.now()});
  await save();closeModal('cdAns');rerender();respond(c)};
function menu(c){
  const acts=[['复制',()=>navigator.clipboard?.writeText(c.text).then(()=>toast('已复制'))]];
  const last=(c.thread||[]).at(-1);
  if(last&&last.who==='him'&&!c._busy)acts.push(['让他重新说',async()=>{c.thread.pop();await save();respond(c)}]);
  if(c.done&&c.by==='him')acts.push(['标回没完成',async()=>{c.done=false;await save();rerender()}]);
  acts.push(['删除这张',async()=>{if(!confirm('删除这张卡片？'))return;DATA.cards=DATA.cards.filter(x=>x!==c);await save();rerender()}]);
  sheet(acts)}

$('#cdTrack').addEventListener('click',e=>{const t=e.target;
  if(t.closest('#cdDraw'))return draw();
  if(t.closest('#cdWriteBtn'))return openWrite();
  const p=t.closest('[data-p]');if(p){pick=p.dataset.p;$$('#cdChips button').forEach(b=>b.classList.toggle('on',b.dataset.p===pick));return}
  const a=t.closest('[data-ca]');if(a){const c=find(a.dataset.ca);if(c)openAns(c);return}
  const m=t.closest('[data-cm]');if(m){const c=find(m.dataset.cm);if(c)menu(c)}});
$('#cdTrack').addEventListener('scroll',pos,{passive:true});

/* ---------- 白天 / 夜晚 ---------- */
async function hash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('365:'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
$('#cdSeg').onclick=e=>{const b=e.target.closest('[data-m]');if(!b||b.dataset.m===mode)return;
  if(b.dataset.m==='night'&&!unlocked){
    if(!S.sxPin)return toast('先去 More 里的「秘密」设一个密码');
    $('#cdPinIn').value='';openModal('cdPin');setTimeout(()=>$('#cdPinIn').focus(),150);return}
  mode=b.dataset.m;render()};
$('#cdPinIn').oninput=async e=>{const i=e.target;i.value=i.value.replace(/\D/g,'').slice(0,4);if(i.value.length<4)return;
  if(await hash(i.value)===S.sxPin){unlocked=true;i.blur();closeModal('cdPin');mode='night';render()}
  else{toast('密码不对');i.value=''}};
function lockNight(){
  unlocked=false;
  if(mode==='night'){mode='day';['cdAns','cdWrite','cdPin'].forEach(id=>$('#'+id).classList.remove('show'));if(page==='cards')render()}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lockNight()});

/* ---------- 让他平时也知道（只说白天的任务和大冒险） ---------- */
HOOKS.context.push(()=>{const d=isoDate(today());
  const L=DATA.cards.filter(c=>c.mode==='day'&&c.by==='him'&&(c.type==='task'||c.type==='dare')&&isoDate(new Date(c.t))===d);
  if(!L.length)return '';
  return '【小卡片】她今天翻到的：'+L.map(c=>`${TYPES[c.type][0]}「${c.text}」${c.done?'（已经做完）':'（还没做）'}`).join('；')+'。可以自然地问问她，不用每句都提。'});

addMore({go:'cards',cn:'小卡片',ce:'cards'});
window.addDot?.('cards',s=>DATA.cards.some(c=>c.mode==='day'&&(c.thread||[]).some(x=>x.who==='him'&&x.t>s)));
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.cards))DATA.cards=[]});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('cd',n==='cards');if(n==='cards')render();else lockNight()});
})();
