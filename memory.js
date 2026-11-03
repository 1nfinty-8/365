/* ===== 365 · memory.js · 记忆：分层、待确认、未完成的事、只想起相关的、自动记 todo ===== */
(()=>{
if(!Array.isArray(DATA.memory))DATA.memory=[];
if(!Array.isArray(DATA.mcand))DATA.mcand=[];
Object.assign(DEFAULT,{memAuto:true,memUpTo:0});
const LAY=[['core','核心'],['long','长期'],['short','短期']];
const lname=k=>(LAY.find(x=>x[0]===k)||LAY[1])[1];
const DAY=864e5,COOL=6*36e5;
const arr=v=>Array.isArray(v)?v:[];
const save=()=>saveData('memory'),csave=()=>saveData('mcand');
const on=m=>m.on!==false;
const live=m=>on(m)&&!m.resolved;
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
let editing=null,layer='long',busy=false,ready=false,lastRun=0,saveT2=null,lastTodo=null;

document.head.insertAdjacentHTML('beforeend',`<style>
.mm-un{display:inline-block;font-weight:500;font-size:11px;color:var(--acct);background:var(--accent);border-radius:99px;padding:0 7px;margin-right:6px;vertical-align:1px;font-family:var(--cn)}
.mm-cb{display:flex;gap:8px;margin-top:10px}
.mm-cb .pill{padding:6px 16px}
</style>`);
$('#mmTabs').innerHTML='';

/* ---------- 中文双字组：判断像不像、有没有关 ---------- */
const STOP=new Set('我们 你们 他们 什么 怎么 这个 那个 就是 可以 没有 不是 一个 一下 觉得 知道 现在 今天 然后 因为 所以 还是 真的 小狗 宝宝 已经 时候 自己 这样 那么 但是 如果 还有 不要 不会 有点 一点 哈哈'.split(' '));
function bg(s){s=String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');const o=new Set(),H=S.hisName||'';
  for(let i=0;i<s.length-1;i++){const x=s.slice(i,i+2);if(!STOP.has(x)&&!H.includes(x))o.add(x)}return o}
function sim(a,b){if(!a.size||!b.size)return 0;let n=0;for(const x of a)if(b.has(x))n++;return n/Math.min(a.size,b.size)}
const dup=(t,L)=>{const a=bg(t);return L.some(m=>sim(a,bg(m.text))>=.6)};
function mk(o){const t=Date.now();return {id:uid(),on:true,t,weight:1,hits:0,layer:'long',...o,exp:o.layer==='short'?t+30*DAY:null}}

/* ---------- 显示 ---------- */
function item(m){const un=m.unresolved&&!m.resolved;
  return `<div class="mm-item glass${on(m)?'':' off'}" data-mm="${m.id}"><div class="mm-l"><div class="mm-text">${un?'<b class="mm-un">未完成</b>':''}${esc(m.text)}</div>
  <div class="mm-meta">${lname(m.layer)} · ${dotDate(new Date(m.t))}${m.src==='him'?' · '+esc(S.hisName)+'记的':''}${m.layer==='short'&&m.exp&&!m.resolved?' · '+Math.max(0,Math.ceil((m.exp-Date.now())/DAY))+' 天后忘记':''}${m.resolved?' · 已解决':''}</div></div>
  <button class="mm-sw${on(m)?' on':''}" data-mmsw="${m.id}" aria-label="开关"></button></div>`}
function cand(c){return `<div class="mm-item glass" data-mc="${c.id}"><div class="mm-l"><div class="mm-text">${esc(c.text)}</div>
  <div class="mm-meta">${lname(c.layer)}${c.unresolved?' · 未完成':''} · ${esc(S.hisName)}拿不准，要你点头</div>
  <div class="mm-cb"><button class="pill" data-mca="ok">记住</button><button class="pill ghost" data-mca="no">不要</button></div></div></div>`}
function render(){
  const L=[...DATA.memory].sort((a,b)=>b.t-a.t),core=L.filter(m=>m.layer==='core'&&live(m)).length,nc=DATA.mcand.length;
  $('#mmStat').innerHTML=L.length||nc?`一共 ${L.length} 条 · 每次聊天都带着核心 ${core} 条，其他的聊到相关的才想起来${nc?`<br><span class="mm-warn">有 ${nc} 条等你确认</span>`:''}`:`${esc(S.hisName)}要记住的事，都写在这里。`;
  const sec=(t,xs,f)=>xs.length?`<div class="mm-h">${t}</div>`+xs.map(f).join(''):'';
  $('#mmList').innerHTML=(sec('待确认',DATA.mcand,cand)
    +sec('核心',L.filter(m=>m.layer==='core'&&!m.resolved),item)
    +sec('还没完成的事',L.filter(m=>m.layer!=='core'&&m.unresolved&&!m.resolved),item)
    +sec('长期',L.filter(m=>m.layer==='long'&&!m.unresolved&&!m.resolved),item)
    +sec('短期',L.filter(m=>m.layer==='short'&&!m.unresolved&&!m.resolved),item)
    +sec('已解决',L.filter(m=>m.resolved),item))
    ||'<div class="empty">这里还空着<br>点「＋ 记一条」，或者等他从聊天里自己记</div>';
  $('#mmSum').textContent=busy?`${S.hisName}在翻你们的聊天…`:`✦ 整理记忆 · 自动${S.memAuto===false?'关':'开'}`}

/* ---------- 新建 / 编辑 ---------- */
$('#mmCat').innerHTML=LAY.map(([k,n])=>`<button data-c="${k}">${n}</button>`).join('');
$('#mmCat').closest('.f').querySelector('span').textContent='放在哪一层';
$('#mmCat').closest('.f').insertAdjacentHTML('afterend','<label class="chk"><input type="checkbox" id="mmUn"><span>这是一件还没完成的事（在等的、担心的、答应过的）</span></label><p class="hint" style="color:var(--sys-sub)">核心：每次都记着。长期：聊到相关的才想起来。短期：30 天后忘记。</p>');
function setLayer(k){layer=k;$$('#mmCat button').forEach(b=>b.classList.toggle('on',b.dataset.c===k))}
$('#mmCat').onclick=e=>{const b=e.target.closest('[data-c]');if(b)setLayer(b.dataset.c)};
function openForm(m){editing=m||null;$('#mmTitle').textContent=m?'改一改':'记一条';
  $('#mmText').value=m?.text||'';setLayer(m?.layer||'long');$('#mmUn').checked=!!m?.unresolved;openModal('mmModal')}
$('#mmAdd').onclick=()=>openForm();
$('#mmSave').onclick=async()=>{const text=$('#mmText').value.trim();if(!text)return toast('写一句要记住的事');
  const un=$('#mmUn').checked,was=editing;
  if(was)Object.assign(was,{text,layer,unresolved:un,exp:layer==='short'?(was.exp||Date.now()+30*DAY):null});
  else DATA.memory.push(mk({text,layer,unresolved:un,src:'me'}));
  await save();closeModal('mmModal');render();toast(was?'改好了':'记住了 ♡')};

/* ---------- 列表操作 ---------- */
$('#mmList').onclick=async e=>{
  const s=e.target.closest('[data-mmsw]');
  if(s){const m=DATA.memory.find(x=>x.id===s.dataset.mmsw);if(!m)return;m.on=!on(m);await save();render();
    toast(on(m)?`${S.hisName}记起来了`:`${S.hisName}暂时不记得这条了`);return}
  const a=e.target.closest('[data-mca]');
  if(a){const c=DATA.mcand.find(x=>x.id===a.closest('[data-mc]').dataset.mc);if(!c)return;
    DATA.mcand=DATA.mcand.filter(x=>x!==c);
    if(a.dataset.mca==='ok'){DATA.memory.push(mk({text:c.text,layer:c.layer,unresolved:!!c.unresolved,src:'him'}));await save();toast('记住了 ♡')}
    await csave();render();return}
  const c=e.target.closest('[data-mm]');if(!c)return;
  const m=DATA.memory.find(x=>x.id===c.dataset.mm);if(!m)return;
  const acts=[['编辑',()=>openForm(m)]];
  LAY.filter(x=>x[0]!==m.layer).forEach(([k,n])=>acts.push([`移到${n}`,async()=>{m.layer=k;m.exp=k==='short'?Date.now()+30*DAY:null;await save();render()}]));
  if(m.unresolved)acts.push([m.resolved?'标回没完成':'标为已解决',async()=>{m.resolved=!m.resolved;m.resolvedAt=m.resolved?Date.now():null;await save();render();toast(m.resolved?'解决了 ♡':'标回去了')}]);
  else acts.push(['标成还没完成的事',async()=>{m.unresolved=true;m.resolved=false;await save();render()}]);
  acts.push(['复制',()=>navigator.clipboard?.writeText(m.text).then(()=>toast('已复制'))],
    ['删除这条记忆',async()=>{if(!confirm('删除这条记忆？'))return;DATA.memory=DATA.memory.filter(x=>x!==m);await save();render()}]);
  sheet(acts)};
$('#mmSum').onclick=()=>sheet([['现在整理一次',()=>run(true)],
  [S.memAuto===false?'打开自动整理':'关掉自动整理',()=>{S.memAuto=S.memAuto===false;saveSettings();render();toast(S.memAuto?'自动整理打开了':'自动整理关掉了')}]]);

/* ---------- 从聊天里整理：记忆 + todo + 已解决 ---------- */
const TODO_RE=/明天|后天|今晚|下周|周[一二三四五六日天]|星期|号前|点前|之前|截止|ddl|deadline|要交|得交|考试|作业|报告|记得|别忘|提醒我|预约|要去|得去/i;
async function run(force){
  if(busy||!S.apiKey)return;if(!force&&S.memAuto===false)return;
  const P=DATA.chat.filter(m=>m.t>(S.memUpTo||0)&&m.text&&!m.call&&!m.missed).slice(-30);
  if(!P.length){if(force)toast('最近没有新的聊天');return}
  busy=true;lastRun=Date.now();render();
  try{
    const now=new Date();
    const have=DATA.memory.filter(on).slice(-40).map(m=>'- '+m.text).join('\n')||'（还是空的）';
    const open=DATA.memory.filter(m=>m.unresolved&&!m.resolved).map(m=>'- '+m.text).join('\n');
    const todo=arr(DATA.todo).filter(x=>!x.done).map(x=>'- '+x.text).join('\n');
    const lines=P.map(m=>`[${fmtDate(m.t)}] ${m.role==='user'?'她':'你'}：${m.text}`).join('\n');
    const j=J(await callAI(sceneSystem('你在翻你们刚才的聊天，挑出要记住的事，顺手帮她把要做的事记进 todo list。'),[{role:'user',text:`现在是 ${isoDate(now)} 星期${'日一二三四五六'[now.getDay()]} ${fmtTime(now)}。
刚才的聊天：
${lines}

记忆里已经有：
${have}
${open?'\n还没完成的事：\n'+open+'\n':''}${todo?'\ntodo 里已经有：\n'+todo+'\n':''}
请做三件事：
1. memories：挑出值得记住、记忆里还没有的事，0 到 5 条。比如她的喜好习惯、身体情况、重要的经历、你们的梗和称呼、约定。一时的情绪和普通闲聊不记。每条一句话，用“小狗”指她，用“我”指你自己。layer：长期稳定的写 long，只在这几天有用的（近期安排、临时状态）写 short。unresolved：她在等结果的、担心的、你答应过还没做到的写 true。confidence：0 到 1，你有多确定这件事是真的、值得记。
2. todos：她在聊天里说自己要做、还没做的事（作业、报告、考试、预约、要去的地方等），todo 里已经有的不要重复。有明确日期就写成 YYYY-MM-DD（“明天”“周五”要换算成具体日期），有具体时间就写 HH:MM，没有就写空字符串。你自己要做的事不算。
3. resolved：上面「还没完成的事」里，聊天中说已经完成、有结果了的，原样抄下来。
没有就写空数组。只输出 JSON：{"memories":[{"text":"","layer":"long","unresolved":false,"confidence":0.8}],"todos":[{"text":"","date":"","time":""}],"resolved":[]}`}]));
    let nm=0,nc=0;const added=[];
    for(const x of arr(j.memories)){const text=String(x?.text||'').trim();if(!text||dup(text,DATA.memory)||dup(text,DATA.mcand))continue;
      const o={text,layer:x.layer==='short'?'short':'long',unresolved:!!x.unresolved};
      if(+x.confidence>=.7){DATA.memory.push(mk({...o,src:'him'}));nm++}
      else{DATA.mcand.push({id:uid(),...o,t:Date.now()});nc++}}
    for(const r of arr(j.resolved)){const m=DATA.memory.find(m=>m.unresolved&&!m.resolved&&sim(bg(m.text),bg(r))>=.6);if(m){m.resolved=true;m.resolvedAt=Date.now()}}
    if(!Array.isArray(DATA.todo))DATA.todo=[];
    for(const x of arr(j.todos)){const text=String(x?.text||'').trim();if(!text||dup(text,DATA.todo.filter(t=>!t.done)))continue;
      const due=/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')?x.date:'',time=/^\d{1,2}:\d{2}$/.test(x.time||'')?x.time:'';
      DATA.todo.push({id:uid(),text,done:false,by:'him',auto:true,due,time,t:Date.now()});added.push(text)}
    S.memUpTo=P.at(-1).t;saveSettings();
    await save();await csave();if(added.length)await saveData('todo');
    const msg=[nm&&`记住了 ${nm} 条`,nc&&`${nc} 条等你确认`,added.length&&`记了 ${added.length} 件 todo`].filter(Boolean).join('，');
    if(added.length){lastTodo={t:Date.now(),L:added};toast(`${S.hisName}帮你记进 todo 了：${added.join('、').slice(0,30)}`)}
    else if(force)toast(msg||'这次没找到新的要记的事');
    refreshAll()}
  catch(e){if(force)toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{busy=false;render()}}
setInterval(()=>{
  if(!ready||document.hidden||busy||$('#status')?.textContent||Date.now()-lastRun<60000)return;
  const P=DATA.chat.filter(m=>m.t>(S.memUpTo||0)&&m.text),U=P.filter(m=>m.role==='user');
  if(!U.length||Date.now()-P.at(-1).t<20000)return;
  if(P.length>=12||U.some(m=>TODO_RE.test(m.text)))run()},15000);

/* ---------- 想起来：核心 + 未完成的事 + 最相关的几条 ---------- */
function recall(){
  const q=bg(DATA.chat.slice(-4).map(m=>m.text||'').join(' ').slice(-300));if(q.size<2)return [];
  const out=[];
  for(const m of DATA.memory){if(!live(m)||m.layer==='core')continue;
    const mb=bg(m.text);let n=0;for(const x of q)if(mb.has(x))n++;if(n<2)continue;
    const s=n/Math.min(q.size,mb.size)*(m.layer==='short'?1.05:1)*(.7+.3*(m.weight??1))*(m.unresolved?1.08:1);
    out.push({m,s,mb})}
  out.sort((a,b)=>b.s-a.s);const pick=[];
  for(const o of out){if(pick.length>=5||o.s<.15)break;if(pick.some(p=>sim(p.mb,o.mb)>=.72))continue;pick.push(o)}
  return pick.map(o=>o.m)}
function touch(L){const now=Date.now();let ch=false;
  for(const m of L){if(now-(m.lastHit||0)<COOL)continue;
    m.lastHit=now;m.hits=(m.hits||0)+1;m.weight=Math.min(1,(m.weight??1)+.1);
    if(m.layer==='short'&&m.hits>=3){m.layer='long';m.exp=null}ch=true}
  if(ch){clearTimeout(saveT2);saveT2=setTimeout(save,2000)}}
HOOKS.persona.push(()=>{
  const A=DATA.memory.filter(live),core=A.filter(m=>m.layer==='core');
  const un=A.filter(m=>m.layer!=='core'&&m.unresolved).sort((a,b)=>b.t-a.t).slice(0,4);
  const rel=recall().filter(m=>!un.includes(m));touch([...un,...rel]);
  const out=[];
  if(core.length)out.push('【你记得的事】这些是你们之间最重要的事，你一直都记得。合适的时候自然地用上，不要一条条复述：\n'+core.map(m=>'- '+m.text+(m.unresolved?'（还没有结果）':'')).join('\n'));
  if(un.length)out.push('【还没完成的事】你一直惦记着，合适的时候可以问问她进展：\n'+un.map(m=>'- '+m.text).join('\n'));
  if(rel.length)out.push('【刚好想起来的】和你们正在聊的有关：\n'+rel.map(m=>'- '+m.text).join('\n'));
  if(out.length)out.push('记忆里没有的事不要编造。');
  return out.join('\n\n')});
HOOKS.context.push(()=>lastTodo&&Date.now()-lastTodo.t<10*6e4?`【todo】你刚帮她把${lastTodo.L.map(x=>'「'+x+'」').join('、')}记进了她的 todo list，可以顺口提一句。`:'');

/* ---------- 用进废退：每天一次 ---------- */
function decay(){const k='365-memdecay',d=isoDate(today());if(localStorage.getItem(k)===d)return;localStorage.setItem(k,d);
  const now=Date.now();let ch=false;
  DATA.memory=DATA.memory.filter(m=>{if(m.layer==='short'&&m.exp&&m.exp<now&&!(m.unresolved&&!m.resolved)){ch=true;return false}return true});
  for(const m of DATA.memory){if(m.layer==='core'||(m.unresolved&&!m.resolved)||now-(m.lastHit||0)<DAY)continue;
    const[f,fl]=m.layer==='short'?[.95,.05]:[.995,.3],w=Math.max(fl,(m.weight??1)*f);if(w!==m.weight){m.weight=w;ch=true}}
  if(ch)save()}

HOOKS.ready.push(()=>{
  if(!Array.isArray(DATA.memory))DATA.memory=[];if(!Array.isArray(DATA.mcand))DATA.mcand=[];
  let ch=false;for(const m of DATA.memory)if(!m.layer){m.layer='core';m.weight=1;m.hits=0;ch=true}
  if(ch)save();
  if(!S.memUpTo){S.memUpTo=DATA.chat.at(-1)?.t||Date.now();saveSettings()}
  decay();ready=true;render()});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{if(n==='memory')render()});
})();
