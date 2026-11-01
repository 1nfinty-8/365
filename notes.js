/* ===== 365 · notes.js · todo list + 备忘录 ===== */
(()=>{
if(!Array.isArray(DATA.todo))DATA.todo=[];
if(!Array.isArray(DATA.memo))DATA.memo=[];
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const CK='<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const T=()=>isoDate(today());
const md=s=>{const d=parseDate(s);return `${d.getMonth()+1}月${d.getDate()}日`};
const dueLabel=s=>{const n=daysBetween(today(),parseDate(s));return n===0?'今天':n===1?'明天':n===-1?'昨天':n<0?`过了 ${-n} 天`:md(s)};
let tdEdit=null,ntEdit=null,adding=false,ntQ='';

document.head.insertAdjacentHTML('beforeend',`<style>
.td-add{display:flex;gap:8px;align-items:center;padding:6px 6px 6px 16px;margin-bottom:14px;border-radius:99px}
.td-add input{flex:1;min-width:0;border:0;background:transparent;outline:none}
.td-it{display:flex;gap:12px;align-items:flex-start;padding:13px 16px;margin-bottom:10px}
.td-ck{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--accent);flex:none;display:grid;place-items:center;color:var(--acct)}
.td-ck svg.i{width:14px;height:14px;stroke-width:2.4;opacity:0}
.td-it.done .td-ck{background:var(--accent)}
.td-it.done .td-ck svg.i{opacity:1}
.td-it.done .td-x{text-decoration:line-through;color:var(--sub)}
.td-l{flex:1;min-width:0}
.td-x{font-family:var(--cn);font-size:15.5px;line-height:1.55;word-break:break-word}
.td-m{font-size:11.5px;color:var(--sub);margin-top:2px;letter-spacing:1px}
.td-m.late{color:#C0505F}
.td-h{display:flex;align-items:center;font-size:12px;color:var(--sub);letter-spacing:2px;margin:18px 4px 8px}
.td-h button{margin-left:auto;font-size:12px;color:var(--sub)}
.nt-q{display:block;width:100%;border:0;outline:none;padding:10px 16px;border-radius:99px;margin-bottom:14px}
.nt-it{display:block;width:100%;text-align:left;padding:14px 16px;margin-bottom:10px}
.nt-t{font-size:16px;font-weight:500;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nt-p{font-family:var(--cn);font-size:13.5px;color:#5b4950;margin-top:4px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.nt-m{font-size:11px;color:var(--sub);margin-top:6px;letter-spacing:1px}
#ntText{min-height:46vh}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-todo"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>todo list</h2><span class="sp"></span>
    <button class="pill ghost" id="tdHim"></button>
  </div>
  <div class="td-add glass"><input id="tdIn" placeholder="要做的事…" enterkeyhint="done"><button class="pill" id="tdGo">添加</button></div>
  <div id="tdList"></div>
</div></section>
<section class="page" id="page-memo"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>备忘录</h2><em>memo</em><span class="sp"></span>
    <button class="pill" id="ntAdd">＋ 新建</button>
  </div>
  <input class="nt-q glass" id="ntQ" placeholder="搜索">
  <div id="ntList"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="tdModal"><div class="mbox">
  <h3>改一改</h3>
  <label class="f"><span>要做的事</span><textarea class="short" id="tdText"></textarea></label>
  <div class="f"><span>哪天做（可以不设）</span><div style="display:flex;gap:8px"><input type="date" id="tdDate" style="flex:1"><button class="pill ghost" id="tdNoDate">不设</button></div></div>
  <div class="mbtns"><button class="pill ghost" data-close="tdModal">取消</button><button class="pill" id="tdSave">保存</button></div>
</div></div>
<div class="modal" id="ntModal"><div class="mbox">
  <h3>备忘录</h3>
  <label class="f"><textarea id="ntText" placeholder="第一行是标题"></textarea></label>
  <label class="chk"><input type="checkbox" id="ntShare"><span>让<span class="hisName">陆择</span>知道这条</span></label>
  <label class="chk"><input type="checkbox" id="ntPin"><span>置顶</span></label>
  <div class="mbtns"><button class="pill ghost" id="ntDel" style="margin-right:auto;color:var(--sys-red)">删除</button><button class="pill ghost" data-close="ntModal">取消</button><button class="pill" id="ntSave">保存</button></div>
</div></div>`);

/* ---------- todo list ---------- */
const tdSave=()=>saveData('todo');
function tdRender(){
  const U=DATA.todo.filter(x=>!x.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||b.t-a.t);
  const D=DATA.todo.filter(x=>x.done).sort((a,b)=>b.doneAt-a.doneAt);
  const it=x=>{const late=!x.done&&x.due&&x.due<T();
    const meta=[x.due?dueLabel(x.due):'',x.by==='him'?esc(S.hisName)+'加的':''].filter(Boolean).join(' · ');
    return `<div class="td-it glass${x.done?' done':''}" data-td="${x.id}"><button class="td-ck" data-tck="${x.id}" aria-label="完成">${CK}</button><div class="td-l"><div class="td-x">${esc(x.text)}</div>${meta?`<div class="td-m${late?' late':''}">${meta}</div>`:''}</div></div>`};
  $('#tdList').innerHTML=(U.map(it).join('')||'<div class="empty">没有要做的事了</div>')
    +(D.length?`<div class="td-h">做完了 · ${D.length}<button id="tdClr">清掉做完的</button></div>`+D.slice(0,30).map(it).join(''):'');
  $('#tdHim').textContent=adding?`${S.hisName}在想…`:`让${S.hisName}加一条`}
async function tdAdd(){const i=$('#tdIn'),v=i.value.trim();if(!v)return;
  DATA.todo.push({id:uid(),text:v,done:false,by:'me',t:Date.now()});i.value='';await tdSave();tdRender()}
$('#tdGo').addEventListener('pointerdown',e=>e.preventDefault());
$('#tdGo').onclick=tdAdd;
$('#tdIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();tdAdd()}});
function tdOpen(x){tdEdit=x;$('#tdText').value=x.text;$('#tdDate').value=x.due||'';openModal('tdModal')}
$('#tdNoDate').onclick=()=>{$('#tdDate').value=''};
$('#tdSave').onclick=async()=>{const v=$('#tdText').value.trim();if(!v||!tdEdit)return;
  tdEdit.text=v;tdEdit.due=$('#tdDate').value||'';await tdSave();closeModal('tdModal');tdRender()};
$('#tdList').onclick=async e=>{
  if(e.target.closest('#tdClr')){if(!confirm('清掉所有做完的？'))return;DATA.todo=DATA.todo.filter(x=>!x.done);await tdSave();tdRender();return}
  const ck=e.target.closest('[data-tck]');
  if(ck){const x=DATA.todo.find(y=>y.id===ck.dataset.tck);if(!x)return;
    x.done=!x.done;x.doneAt=x.done?Date.now():null;await tdSave();tdRender();if(x.done)toast('做完了 ♡');return}
  const c=e.target.closest('[data-td]');if(!c)return;
  const x=DATA.todo.find(y=>y.id===c.dataset.td);if(!x)return;
  sheet([['编辑 / 设日期',()=>tdOpen(x)],['删除',async()=>{DATA.todo=DATA.todo.filter(y=>y!==x);await tdSave();tdRender()}]])};
$('#tdHim').onclick=async()=>{if(adding)return;adding=true;tdRender();
  try{
    const have=DATA.todo.filter(x=>!x.done).map(x=>'- '+x.text).join('\n')||'（还没有）';
    const recent=recentChat(12);
    const t=await callAI(sceneSystem('这是你们的小窝「365」里她的 todo list。'),
      [{role:'user',text:`请以${S.hisName}的身份，在她的 todo list 里加一件她该做的事，比如照顾好自己、你们约好的事、她最近提过要做的事。具体、能做到，一句话，不超过25个字。\n已经有的：\n${have}${recent?'\n你们最近的聊天：\n'+recent:''}\n只输出这件事本身，不要引号，不要编号，不要 emoji。`}]);
    const v=clean(t).split('\n')[0].replace(/^[\-*•\d.、\s]+/,'').trim();
    if(!v)throw new Error('他还没想好，再试一次');
    DATA.todo.push({id:uid(),text:v,done:false,by:'him',t:Date.now()});await tdSave();toast(`${S.hisName}加了一条`)}
  catch(e){toast(e.message)}
  finally{adding=false;tdRender()}};

/* ---------- 备忘录 ---------- */
const ntSave=()=>saveData('memo');
function ntRender(){
  const q=ntQ.trim();
  const L=DATA.memo.filter(x=>!q||x.text.includes(q)).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.up-a.up);
  $('#ntList').innerHTML=L.length?L.map(x=>{const[t,...r]=x.text.split('\n'),p=r.join(' ').trim();
    return `<button class="nt-it glass" data-nt="${x.id}"><div class="nt-t">${esc(t)}</div>${p?`<div class="nt-p">${esc(p)}</div>`:''}<div class="nt-m">${x.pin?'置顶 · ':''}${fmtDate(x.up)}${x.share?' · '+esc(S.hisName)+'知道':''}</div></button>`}).join('')
    :`<div class="empty">${q?'没找到':'还没有备忘录'}</div>`}
function ntOpen(x){ntEdit=x||null;
  $('#ntText').value=x?.text||'';$('#ntShare').checked=!!x?.share;$('#ntPin').checked=!!x?.pin;
  $('#ntDel').style.display=x?'':'none';openModal('ntModal')}
$('#ntAdd').onclick=()=>ntOpen();
$('#ntQ').addEventListener('input',e=>{ntQ=e.target.value;ntRender()});
$('#ntList').onclick=e=>{const b=e.target.closest('[data-nt]');if(!b)return;ntOpen(DATA.memo.find(x=>x.id===b.dataset.nt))};
$('#ntSave').onclick=async()=>{const v=$('#ntText').value.trim();if(!v)return toast('写点什么吧');
  const o={text:v,share:$('#ntShare').checked,pin:$('#ntPin').checked,up:Date.now()};
  if(ntEdit)Object.assign(ntEdit,o);else DATA.memo.push({id:uid(),t:Date.now(),...o});
  await ntSave();closeModal('ntModal');ntRender()};
$('#ntDel').onclick=async()=>{if(!ntEdit||!confirm('删除这条备忘录？'))return;
  DATA.memo=DATA.memo.filter(x=>x!==ntEdit);await ntSave();closeModal('ntModal');ntRender()};

/* ---------- 让陆择知道 ---------- */
HOOKS.context.push(()=>{const out=[];
  const U=DATA.todo.filter(x=>!x.done);
  if(U.length)out.push('【她的 todo】还没做的：'+U.slice(0,8).map(x=>`「${x.text}」${x.due?'（'+dueLabel(x.due)+'）':''}`).join('、')+'。可以提醒她、问问进度，不用每句都提。');
  const M=DATA.memo.filter(x=>x.share).sort((a,b)=>b.up-a.up).slice(0,5);
  if(M.length)out.push('【她给你看的备忘录】\n'+M.map(x=>'- '+x.text.replace(/\n+/g,' ').slice(0,150)).join('\n'));
  return out.join('\n')});

addMore({go:'todo',cn:'todo list'});
addMore({go:'memo',cn:'备忘录',ce:'memo'});
window.addDot?.('todo',s=>DATA.todo.some(x=>x.by==='him'&&!x.done&&x.t>s));
HOOKS.ready.push(()=>{tdRender();ntRender()});
HOOKS.refresh.push(()=>{tdRender();ntRender()});
HOOKS.page.push(n=>{if(n==='todo')tdRender();if(n==='memo')ntRender()});
})();
