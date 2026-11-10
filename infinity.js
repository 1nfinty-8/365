/* ===== 365 · infinity.js · 游戏：Infinity（Fable 的玻璃文件夹 + 卡片玩法） ===== */
(()=>{
if(!Array.isArray(DATA.cards))DATA.cards=[];
const save=()=>saveData('cards');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2"/></svg>';
const TYPES={word:['情话','words'],task:['任务','task'],truth:['真心话','truth'],dare:['大冒险','dare']};
const MT={day:['word','task','truth','dare'],night:['task','truth','dare']};
const HINT={word:'写在卡片上的话',task:'给他的任务',truth:'想问他的真心话',dare:'让他做的大冒险'};
let mode='day',unlocked=false,pick='any',busy=false,page='',wType='word',cur=null,ansCard=null;
const find=id=>DATA.cards.find(c=>c.id===id);
const list=()=>DATA.cards.filter(c=>c.mode===mode).sort((a,b)=>a.t-b.t);
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={
  list:()=>list().slice(-12).map(c=>({id:c.id,type:TYPES[c.type][0],sub:c.done?'已完成':c.by==='me'?'我写的':S.hisName})),
  night:()=>mode==='night',busy:()=>busy,
  view:id=>view(find(id)),draw:()=>draw(),write:()=>openWrite(),
  del:async id=>{const c=find(id);if(!c)return;DATA.cards=DATA.cards.filter(x=>x!==c);await save();if(cur===c)closeView();render()}};

document.head.insertAdjacentHTML('beforeend',`<style>
#page-cards{padding:0;overflow:hidden;transition:background .3s}
body.ifb #tabbar{display:none}
#page-cards.night{background:linear-gradient(180deg,rgba(16,18,28,.92),rgba(30,34,48,.95));--ink:#EEF1F6;--sub:rgba(238,241,246,.55);color:var(--ink)}
#page-cards.night .glass{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);box-shadow:inset 1px 1px 0 rgba(255,255,255,.12),0 6px 20px rgba(0,0,0,.25)}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}
.if-seg{margin-left:auto;display:flex;gap:2px;background:rgba(255,255,255,.35);border-radius:99px;padding:2px}
.night .if-seg{background:rgba(255,255,255,.1)}
.if-seg button{padding:5px 12px;border-radius:99px;font-size:12.5px;color:var(--sub);letter-spacing:2px}
.if-seg button.on{background:var(--accent);color:var(--acct)}
.if-chips{position:absolute;z-index:2;left:0;right:0;top:calc(var(--st) + 56px);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:0 16px;pointer-events:none}
.if-chips button{pointer-events:auto;padding:6px 14px;border-radius:99px;font-size:13px;color:var(--sub);background:rgba(255,255,255,.4);letter-spacing:1px}
.night .if-chips button{background:rgba(255,255,255,.08)}
.if-chips button.on{background:var(--accent);color:var(--acct)}
.if-chips button.all{background:none!important;text-decoration:underline;text-underline-offset:3px}
#ifView{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:calc(var(--st) + 20px) 20px calc(var(--sb) + 20px);background:rgba(20,22,30,.22);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#ifView.show{display:flex;animation:fd .25s}
.if-card{width:100%;max-width:420px;max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 18px;border-radius:26px;display:flex;flex-direction:column}
.if-card.in{animation:ifFlip .6s ease}
@keyframes ifFlip{0%{transform:perspective(900px) rotateY(90deg);opacity:.3}100%{transform:none;opacity:1}}
.if-h{display:flex;align-items:baseline;gap:8px}
.if-ty{font-size:14px;letter-spacing:4px;color:var(--accent-t)}
.night .if-ty{color:#C9D6F0}
.if-en{font-family:var(--en);font-style:italic;color:var(--sub);font-size:14px}
.if-h button{width:30px;height:30px;border-radius:50%;color:var(--sub);font-size:16px}
.if-h button:first-of-type{margin-left:auto;letter-spacing:1px}
.if-tx{margin:24px 0;padding:0 4px;text-align:center;font-family:var(--ti);font-size:19px;line-height:1.9;letter-spacing:1px;white-space:pre-wrap;word-break:break-word}
.if-th{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.if-say{font-family:var(--cn);font-size:14.5px;line-height:1.6;padding:8px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word}
.if-say small{display:block;font-size:11px;opacity:.6;margin-bottom:2px;letter-spacing:1px}
.if-say.him{background:var(--hb);color:var(--hbt);border-left:3px solid var(--accent)}
.if-say.me{background:var(--mb);color:var(--mbt);margin-left:24px}
.night .if-say.him,.night .if-say.me{background:rgba(255,255,255,.08);color:var(--ink)}
.if-ft{display:flex;align-items:center;gap:8px}
.if-ft small{font-size:11.5px;color:var(--sub);letter-spacing:1px}
.if-ft .pill{margin-left:auto}
.if-done{font-size:12px;color:var(--accent-t);letter-spacing:2px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cards">
  <iframe id="ifFrame" title="Infinity" allowtransparency="true"></iframe>
  <div class="if-top"><button class="iconbtn glass" data-go="game" aria-label="返回">${BACK}</button>
    <div class="if-seg" id="ifSeg"><button data-m="day">白天</button><button data-m="night">夜晚</button></div></div>
  <div class="if-chips" id="ifChips"></div>
  <div id="ifView"></div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="ifPin"><div class="mbox">
  <h3>夜晚</h3><p class="hint" style="color:var(--sys-sub);text-align:center">输入秘密的密码</p>
  <input id="ifPinIn" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" style="width:160px;margin:12px auto 4px;display:block;text-align:center;font-size:26px;letter-spacing:14px;padding:8px 0 8px 14px;border:0;border-radius:14px;background:var(--sys-card);color:var(--sys-txt);outline:none">
  <div class="mbtns" style="justify-content:center"><button class="pill ghost" data-close="ifPin">取消</button></div>
</div></div>
<div class="modal" id="ifWrite"><div class="mbox">
  <h3>写一张给<span class="hisName">陆择</span></h3>
  <div class="f"><span>哪一种</span><div class="seg" id="ifWType"></div></div>
  <label class="f"><span id="ifWHint">写在卡片上的话</span><textarea class="short" id="ifWText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifWrite">取消</button><button class="pill" id="ifWSave">放进文件夹</button></div>
</div></div>
<div class="modal" id="ifAns"><div class="mbox">
  <h3 id="ifAT"></h3>
  <div id="ifACard" style="text-align:center;font-family:var(--ti);font-size:16px;line-height:1.7;margin:6px 0 2px"></div>
  <label class="f"><span id="ifAH"></span><textarea class="short" id="ifAText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifAns">取消</button><button class="pill" id="ifASave">好了</button></div>
</div></div>`);

/* ---------- 和他说话：白天用平时的模型，夜晚用秘密的模型 ---------- */
const DAY_SCENE='这是你们的小窝「365」里的「Infinity」，一个装满卡片的玻璃文件夹，白天的牌堆。你们一张一张地抽卡片：情话、任务卡、真心话、大冒险。';
const nightSys=()=>secretSystem('这是你们的小窝「365」里的「Infinity」，一个装满卡片的玻璃文件夹，夜晚的牌堆，只属于你们两个人。你们一张一张地抽卡片：任务卡、真心话、大冒险。');
const ai=(m,msgs)=>m==='night'?sxAI(nightSys(),msgs):callAI(sceneSystem(DAY_SCENE),msgs);
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
  return clean(await ai(m,[{role:'user',text:`请以${S.hisName}的身份，${PROMPT[m][type]}${have?`\n之前出过的，不要重复：\n${have}`:''}${recent?`\n你们最近的聊天：\n${recent}`:''}\n只输出卡片上的内容，不要引号，不要标题，不要用 emoji。`}]))}
function brief(c){
  const th=(c.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
  if(c.by==='me'){
    const head={word:`她写了一张小卡片给你：「${c.text}」`,task:`她给你出了一张任务卡：「${c.text}」`,truth:`她抽给你一道真心话：「${c.text}」`,dare:`她给你出了一个大冒险：「${c.text}」`}[c.type];
    const how=th?'接着回应她最新说的话。':{word:'看完回应她。',task:'接下这个任务，说你会怎么做，或者直接说你已经做了什么。',truth:'认真、诚实地回答。',dare:'照做，告诉她你是怎么做的，或者直接说给她听。'}[c.type];
    return `${head}${th?'\n\n后面的对话：\n'+th:''}\n\n${how}`}
  const head={word:`你写给她的小卡片：「${c.text}」`,task:`你给她出的任务卡：「${c.text}」${c.done?'，她说已经完成了':''}`,truth:`你问她的真心话：「${c.text}」`,dare:`你给她出的大冒险：「${c.text}」${c.done?'，她说已经做完了':''}`}[c.type];
  return `${head}\n\n后面的对话：\n${th||'（她没有多说什么）'}\n\n回应她。${c.type==='task'||c.type==='dare'?'可以夸她、检查她、奖励或者罚她，按你的性格来。':''}`}
async function respond(c){
  if(c._busy)return;c._busy=true;if(cur===c)vRender();
  try{const t=await ai(c.mode,[{role:'user',text:brief(c)+`\n请以${S.hisName}的身份回复，口语化，一到四句，不要加名字前缀，不要用 emoji。`}]);
    (c.thread=c.thread||[]).push({who:'him',text:clean(t),t:Date.now()});
    if(page!=='cards')toast(`${S.hisName}回了你的卡片`)}
  catch(e){toast(e.message)}
  delete c._busy;await save();if(cur===c)vRender()}

/* ---------- 顶部：白天夜晚、种类 ---------- */
function render(){
  $('#page-cards').classList.toggle('night',mode==='night');
  $$('#ifSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  if(!MT[mode].includes(pick))pick='any';
  const n=list().length;
  $('#ifChips').innerHTML=[['any','随便'],...MT[mode].map(t=>[t,TYPES[t][0]])].map(([k,v])=>`<button data-p="${k}" class="${pick===k?'on':''}">${v}</button>`).join('')
    +(n?`<button class="all" data-all>全部 ${n} 张</button>`:'');
  fire()}
$('#ifChips').onclick=e=>{
  if(e.target.closest('[data-all]')){const L=list().slice().reverse().slice(0,40);
    return sheet(L.map(c=>[`${TYPES[c.type][0]} · ${String(c.text).slice(0,16)}${c.text.length>16?'…':''}`,()=>view(c)]))}
  const b=e.target.closest('[data-p]');if(b){pick=b.dataset.p;render()}};

/* ---------- 翻开一张 ---------- */
function action(c){const th=c.thread||[];
  if(c.by==='me')return th.length?'回他一句':'';
  if(c.type==='task')return c.done?'回他一句':'完成了';
  if(c.type==='dare')return c.done?'回他一句':'做完了';
  if(c.type==='truth')return th.some(x=>x.who==='me')?'回他一句':'回答';
  return '回他一句'}
function view(c){if(!c)return;cur=c;vRender(true);$('#ifView').classList.add('show')}
function closeView(){$('#ifView').classList.remove('show');cur=null}
function vRender(anim){const c=cur;if(!c)return;const[cn,en]=TYPES[c.type],H=esc(S.hisName);
  const th=(c.thread||[]).map(x=>`<div class="if-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(c._busy?`<div class="if-say him"><small>${H}</small>正在写…</div>`:'');
  const act=c._busy?'':action(c);
  $('#ifView').innerHTML=`<div class="if-card glass${anim?' in':''}"><div class="if-h"><span class="if-ty">${cn}</span><span class="if-en">${en}</span><button data-vm>···</button><button data-vx>✕</button></div>
    <div class="if-tx">${esc(c.text)}</div>${th?`<div class="if-th">${th}</div>`:''}
    <div class="if-ft"><small>${c.by==='me'?'我写给'+H+'的':H+'写的'} · ${fmtDate(c.t)}</small>${c.done?'<span class="if-done">已完成</span>':''}${act?`<button class="pill" data-va>${act}</button>`:''}</div></div>`}
$('#ifView').onclick=e=>{if(e.target.id==='ifView'||e.target.closest('[data-vx]'))return closeView();
  if(e.target.closest('[data-va]'))return openAns(cur);if(e.target.closest('[data-vm]'))return menu(cur)};
function menu(c){if(!c)return;
  const acts=[['复制',()=>navigator.clipboard?.writeText(c.text).then(()=>toast('已复制'))]];
  const last=(c.thread||[]).at(-1);
  if(last&&last.who==='him'&&!c._busy)acts.push(['让他重新说',async()=>{c.thread.pop();await save();respond(c)}]);
  if(c.done&&c.by==='him')acts.push(['标回没完成',async()=>{c.done=false;await save();vRender();render()}]);
  acts.push(['删除这张',async()=>{if(!confirm('删除这张卡片？'))return;DATA.cards=DATA.cards.filter(x=>x!==c);await save();closeView();render()}]);
  sheet(acts)}

/* ---------- 抽一张 ---------- */
async function draw(){if(busy)return;
  const T=MT[mode],type=pick==='any'?T[Math.floor(Math.random()*T.length)]:pick,m=mode;
  busy=true;fire();
  try{const text=await gen(type,m);
    const c={id:uid(),mode:m,type,by:'him',text,t:Date.now(),thread:[],done:false};
    DATA.cards.push(c);await save();busy=false;render();navigator.vibrate?.(15);
    setTimeout(()=>{if(page==='cards'&&mode===m)view(c)},900)}
  catch(e){toast(e.message)}
  finally{if(busy){busy=false;fire()}}}

/* ---------- 写一张给他 ---------- */
function setW(t){wType=t;$$('#ifWType button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('#ifWHint').textContent=HINT[t]}
function openWrite(){$('#ifWType').innerHTML=MT[mode].map(t=>`<button data-t="${t}">${TYPES[t][0]}</button>`).join('');
  setW(MT[mode].includes(wType)?wType:MT[mode][0]);$('#ifWText').value='';openModal('ifWrite')}
$('#ifWType').onclick=e=>{const b=e.target.closest('[data-t]');if(b)setW(b.dataset.t)};
$('#ifWSave').onclick=async()=>{const v=$('#ifWText').value.trim();if(!v)return toast('写点什么吧');
  const c={id:uid(),mode,type:wType,by:'me',text:v,t:Date.now(),thread:[],done:false};
  DATA.cards.push(c);await save();closeModal('ifWrite');render();
  setTimeout(()=>{if(page==='cards')view(c)},900);respond(c)};

/* ---------- 完成、回答、回一句 ---------- */
function openAns(c){if(!c)return;ansCard=c;const a=action(c);
  $('#ifAT').textContent=a;$('#ifACard').textContent=c.text;
  $('#ifAH').textContent=a==='完成了'||a==='做完了'?'说一句（可以不写）':a==='回答'?'你的回答':'想说的话';
  $('#ifAText').value='';openModal('ifAns')}
$('#ifASave').onclick=async()=>{const c=ansCard;if(!c)return;const a=action(c),v=$('#ifAText').value.trim(),opt=a==='完成了'||a==='做完了';
  if(!v&&!opt)return toast('写点什么吧');
  if(opt)c.done=true;if(v)(c.thread=c.thread||[]).push({who:'me',text:v,t:Date.now()});
  await save();closeModal('ifAns');if(cur===c)vRender();render();respond(c)};

/* ---------- 白天 / 夜晚 ---------- */
async function hash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('365:'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
$('#ifSeg').onclick=e=>{const b=e.target.closest('[data-m]');if(!b||b.dataset.m===mode)return;
  if(b.dataset.m==='night'&&!unlocked){if(!S.sxPin)return toast('先去 More 里的「秘密」设一个密码');
    $('#ifPinIn').value='';openModal('ifPin');setTimeout(()=>$('#ifPinIn').focus(),150);return}
  mode=b.dataset.m;closeView();render()};
$('#ifPinIn').oninput=async e=>{const i=e.target;i.value=i.value.replace(/\D/g,'').slice(0,4);if(i.value.length<4)return;
  if(await hash(i.value)===S.sxPin){unlocked=true;i.blur();closeModal('ifPin');mode='night';render()}
  else{toast('密码不对');i.value=''}};
function lockNight(){unlocked=false;
  if(mode==='night'){mode='day';closeView();['ifAns','ifWrite','ifPin'].forEach(id=>$('#'+id).classList.remove('show'));if(page==='cards')render()}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lockNight()});

/* ---------- 「游戏」页：小卡片 → Infinity ---------- */
function patchGame(){
  let el=[...document.querySelectorAll('#page-game [data-go]')].find(x=>x.dataset.go==='cards'||/小卡片/.test(x.textContent));
  if(!el)el=[...document.querySelectorAll('#page-game .gm-card')].find(x=>/小卡片/.test(x.textContent));
  if(!el){const h=`<button class="gm-card glass" data-go="cards"><span class="gm-ic">${ICON}</span><span><b>Infinity</b><small>抽一张卡片</small></span></button>`;
    const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h);return}
  el.dataset.go='cards';
  const b=el.querySelector('b');if(b&&b.textContent!=='Infinity')b.textContent='Infinity';
  const ic=el.querySelector('.gm-ic');if(ic&&!ic.dataset.if){ic.dataset.if=1;ic.innerHTML=ICON}}
$$('#moreGrid [data-go="infinity"]').forEach(x=>x.remove());

/* ---------- 让他平时也知道（只说白天的任务和大冒险） ---------- */
HOOKS.context.push(()=>{const d=isoDate(today());
  const L=DATA.cards.filter(c=>c.mode==='day'&&c.by==='him'&&(c.type==='task'||c.type==='dare')&&isoDate(new Date(c.t))===d);
  if(!L.length)return '';
  return '【Infinity 卡片】她今天抽到的：'+L.map(c=>`${TYPES[c.type][0]}「${c.text}」${c.done?'（已经做完）':'（还没做）'}`).join('；')+'。可以自然地问问她，不用每句都提。'});

patchGame();
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.cards))DATA.cards=[];patchGame()});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('ifb',n==='cards');
  if(n==='game')setTimeout(patchGame,0);
  if(n==='cards'){const f=$('#ifFrame');if(!f.src)f.src='infinity.html';render()}
  else{closeView();lockNight()}});
})();
