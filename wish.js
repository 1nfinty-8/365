/* ===== 365 · wish.js · 心愿单 ===== */
(()=>{
if(!Array.isArray(DATA.wish))DATA.wish=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('wish'))LISTS.push('wish');
const save=()=>saveData('wish');
const find=id=>DATA.wish.find(w=>w.id===id);
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const CK='<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
let tab='me',editing=null,doing=null,pend=[],wishing=false,page='home',justDone=null;
const PCT={};

document.head.insertAdjacentHTML('beforeend',`<style>
.ws-seg{display:flex;gap:4px;background:rgba(255,255,255,.35);border-radius:99px;padding:3px;margin-bottom:14px}
.ws-seg button{flex:1;padding:8px 0;border-radius:99px;font-size:13.5px;color:var(--sub);letter-spacing:1px}
.ws-seg button.on{background:var(--accent);color:var(--acct)}
.ws-pg{padding:16px 18px;margin-bottom:14px}
.ws-pg .t{display:flex;align-items:baseline;gap:6px;letter-spacing:1px;font-size:14px}
.ws-pg .t b{font-family:var(--num);font-style:italic;font-weight:300;font-size:40px;line-height:1;color:var(--accent-t);letter-spacing:-1px}
.ws-pg .t .r{margin-left:auto;font-family:var(--num);font-style:italic;color:var(--sub);font-size:17px}
.ws-bar{height:8px;border-radius:8px;background:rgba(46,26,31,.08);margin-top:10px;overflow:hidden}
.ws-bar i{display:block;height:100%;border-radius:8px;background:var(--accent);transition:width .9s cubic-bezier(.2,.9,.3,1.1)}
.ws-pg .s{font-size:12px;color:var(--sub);margin-top:8px;letter-spacing:1px}
.ws-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin:16px 4px 8px}
.ws-it{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;margin-bottom:10px}
.ws-ck{width:26px;height:26px;border-radius:50%;border:1.5px solid var(--accent);flex:none;display:grid;place-items:center;color:var(--acct);margin-top:1px;transition:background .2s}
.ws-ck svg.i{width:15px;height:15px;stroke-width:2.4;opacity:0}
.ws-it.done .ws-ck{background:var(--accent)}
.ws-it.done .ws-ck svg.i{opacity:1}
.ws-l{flex:1;min-width:0}
.ws-x{font-size:16px;letter-spacing:1px;line-height:1.6;word-break:break-word}
.ws-m{font-size:11px;color:var(--sub);margin-top:3px;letter-spacing:1px}
.ws-note{font-family:var(--cn);font-size:14.5px;line-height:1.6;margin-top:8px;white-space:pre-wrap;word-break:break-word}
.ws-his{background:var(--hb);color:var(--hbt);border-left:3px solid var(--accent);border-radius:12px;padding:8px 12px;margin-top:8px;font-family:var(--cn);font-size:14px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.ws-his small{display:block;font-size:11px;opacity:.65;margin-bottom:2px;letter-spacing:1px}
.ws-it.pop{animation:wsPop .7s ease}
@keyframes wsPop{0%,100%{transform:scale(1)}35%{transform:scale(1.04)}}
.ws-it.pop .ws-ck{animation:wsCk .7s ease}
@keyframes wsCk{0%{box-shadow:0 0 0 0 var(--accent)}100%{box-shadow:0 0 0 16px transparent}}
#wsShow{font-size:17px;text-align:center;letter-spacing:1px;margin:6px 0 4px;color:var(--sys-txt);font-family:var(--ti)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-wish"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button>
    <h2>心愿单</h2><em>wishlist</em><span class="sp"></span>
    <button class="pill" id="wsAdd">＋ 许个愿</button>
  </div>
  <div class="ws-seg" id="wsSeg"><button data-t="me">小狗的心愿</button><button data-t="him"><span class="hisName">陆择</span>的心愿</button></div>
  <div class="ws-pg glass" id="wsPg"></div>
  <div id="wsList"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="wsModal"><div class="mbox">
  <h3 id="wsMT">许个愿</h3>
  <label class="f"><span>心愿</span><textarea class="short ti" id="wsText" placeholder="比如：一起去看一次海"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="wsModal">取消</button><button class="pill" id="wsSave">许愿</button></div>
</div></div>
<div class="modal" id="wsDone"><div class="mbox">
  <h3 id="wsDT">实现了 ♡</h3>
  <div id="wsShow"></div>
  <p class="hint" style="text-align:center;color:var(--sys-sub)">照片和那句话都可以不填</p>
  <button class="pill ghost" id="wsPhoto">＋ 照片</button>
  <div class="pend" id="wsPend"></div>
  <label class="f"><span>说一句（可以不写）</span><textarea class="short" id="wsNote"></textarea></label>
  <label class="chk" id="wsAskRow"><input type="checkbox" id="wsAsk" checked><span>让<span class="hisName">陆择</span>说一句</span></label>
  <div class="mbtns"><button class="pill ghost" data-close="wsDone">取消</button><button class="pill" id="wsOk">完成</button></div>
</div></div>`);

/* ---------- 列表 ---------- */
function item(w){
  const imgs=w.images?.length?`<div class="pimgs n${Math.min(w.images.length,3)}">${w.images.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:'';
  const his=w._busy?`<div class="ws-his"><small>${esc(S.hisName)}</small>正在看…</div>`:w.his?`<div class="ws-his"><small>${esc(S.hisName)}说</small>${esc(w.his)}</div>`:'';
  return `<div class="ws-it glass${w.done?' done':''}${justDone===w.id?' pop':''}" data-ws="${w.id}">
    <button class="ws-ck" data-wck="${w.id}" aria-label="完成">${CK}</button>
    <div class="ws-l"><div class="ws-x">${esc(w.text)}</div>
      <div class="ws-m">${w.done?'实现于 '+dotDate(new Date(w.doneAt)):'许愿于 '+dotDate(new Date(w.t))}</div>
      ${w.done?(w.note?`<div class="ws-note">${esc(w.note)}</div>`:'')+imgs+his:''}
    </div></div>`}
function render(){
  $$('#wsSeg button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  $('#wsAdd').textContent=tab==='me'?'＋ 许个愿':(wishing?`${S.hisName}在想…`:`让${S.hisName}许一个`);
  const L=DATA.wish.filter(w=>w.who===tab);
  const U=L.filter(w=>!w.done).sort((a,b)=>b.t-a.t),D=L.filter(w=>w.done).sort((a,b)=>b.doneAt-a.doneAt);
  const n=L.length,k=D.length,p=n?Math.round(k/n*100):0;
  const msg=!n?(tab==='me'?'写下第一个想和他一起做的事吧':`还没有，让${esc(S.hisName)}许一个吧`):k===n?'全部实现了，再许一个吧 ✦':`还差 ${n-k} 个，慢慢来`;
  const from=PCT[tab]??p;PCT[tab]=p;
  $('#wsPg').innerHTML=`<div class="t">已实现 <b>${k}</b> / ${n}<span class="r">${p}%</span></div><div class="ws-bar"><i id="wsBarI" style="width:${from}%"></i></div><div class="s">${msg}</div>`;
  if(from!==p)requestAnimationFrame(()=>requestAnimationFrame(()=>{const i=$('#wsBarI');if(i)i.style.width=p+'%'}));
  const box=$('#wsList');
  box.innerHTML=(U.map(item).join('')+(D.length?`<div class="ws-h">已实现 · ${D.length}</div>`+D.map(item).join(''):''))
    ||`<div class="empty">${tab==='me'?'点右上角「＋ 许个愿」':'点右上角，让他许一个'}</div>`;
  IMG.hydrate(box)}
$('#wsSeg').onclick=e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;render()}};

/* ---------- 许愿 ---------- */
function openForm(w){editing=w||null;
  $('#wsMT').textContent=w?'改一改':'许个愿';$('#wsSave').textContent=w?'保存':'许愿';
  $('#wsText').value=w?.text||'';openModal('wsModal')}
$('#wsAdd').onclick=()=>tab==='me'?openForm():himWish();
$('#wsSave').onclick=async()=>{
  const text=$('#wsText').value.trim();if(!text)return toast('写下你的心愿吧');
  const was=editing;
  if(was)was.text=text;else DATA.wish.push({id:uid(),who:'me',text,t:Date.now(),done:false});
  await save();closeModal('wsModal');render();toast(was?'改好了':'许好了 ✦')};
async function himWish(){
  if(wishing)return;wishing=true;render();
  try{
    const have=DATA.wish.map(w=>`- ${w.text}（${w.who==='me'?'她许的':'你许的'}${w.done?'，已实现':''}）`).join('\n')||'（还没有）';
    const recent=recentChat(12);
    const t=await callAI(sceneSystem('这是你们的小窝「365」里的「心愿单」，你和她各有一页，写想和对方一起做的事。'),
      [{role:'user',text:`请以${S.hisName}的身份，在你那一页许一个想和她一起做的心愿。要具体、有画面，可以是浪漫的、日常的，或者只属于你们的小事，符合你的性格。一句话，不超过25个字。\n心愿单里已经有：\n${have}\n不要和已有的重复。${recent?'\n你们最近的聊天：\n'+recent:''}\n只输出这个心愿本身，不要引号，不要解释。`}]);
    const text=clean(t).split('\n')[0].replace(/^[\-*•\d.、\s]+/,'').trim();
    if(!text)throw new Error('他还没想好，再试一次');
    DATA.wish.push({id:uid(),who:'him',text,t:Date.now(),done:false});await save();toast(`${S.hisName}许了一个愿 ✦`)}
  catch(e){toast(e.message)}
  finally{wishing=false;render()}}

/* ---------- 实现 ---------- */
function renderPend(){const el=$('#wsPend');el.innerHTML=pendHTML(pend);IMG.hydrate(el)}
function openDone(w,edit){doing=w;pend=[...(w.images||[])];
  $('#wsDT').textContent=edit?'改一改':'实现了 ♡';
  $('#wsShow').textContent=w.text;$('#wsNote').value=w.note||'';renderPend();
  $('#wsAskRow').style.display=edit?'none':'';$('#wsAsk').checked=true;
  $('#wsOk').textContent=edit?'保存':'完成';$('#wsOk').dataset.edit=edit?'1':'';
  openModal('wsDone')}
$('#wsPhoto').onclick=async()=>{if(pend.length>=3)return toast('最多 3 张');pend.push(...await pickPhotos(3-pend.length));renderPend()};
$('#wsPend').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){pend.splice(+b.dataset.rm,1);renderPend()}};
$('#wsOk').onclick=async()=>{
  const w=doing;if(!w)return;const edit=$('#wsOk').dataset.edit==='1',ask=$('#wsAsk').checked;
  const images=await IMG.putAll(pend),gone=(w.images||[]).filter(id=>!images.includes(id));
  w.images=images;w.note=$('#wsNote').value.trim();
  if(!edit){w.done=true;w.doneAt=Date.now();justDone=w.id}
  await save();await IMG.del(gone);closeModal('wsDone');tab=w.who;render();
  if(edit)return toast('改好了');
  toast('实现了一个心愿 ♡');setTimeout(()=>{justDone=null},900);
  if(ask)himNote(w)};
async function himNote(w){
  if(w._busy)return;w._busy=true;render();
  try{await sleep(600);
    const t=await callAI(sceneSystem('这是你们的小窝「365」里的「心愿单」。'),
      [{role:'user',text:`心愿单上${w.who==='me'?'她许的':'你许的'}心愿「${w.text}」实现了！${w.note?`她写了一句：「${w.note}」`:''}${w.images?.length?`\n（她放了${w.images.length}张照片${S.provider==='gemini'?'，就是给你看的这些':''}）`:''}\n请以${S.hisName}的身份对她说一两句话，可以开心、感动、调侃，或者约下一次。口语化，不超过60字，只输出这句话。`,images:w.images?.length?w.images:undefined}]);
    w.his=clean(t);if(page!=='wish')toast(`${S.hisName}在心愿单里说了一句`)}
  catch(e){toast(e.message)}
  delete w._busy;await save();render()}
async function undo(w){
  if(!confirm('标回没实现？照片和那句话会一起删掉。'))return;
  const ids=w.images;Object.assign(w,{done:false,doneAt:null,images:[],note:'',his:''});
  await save();await IMG.del(ids);render()}

$('#wsList').onclick=e=>{const t=e.target;if(t.matches('img.zoom'))return;
  const ck=t.closest('[data-wck]');
  if(ck){const w=find(ck.dataset.wck);if(!w)return;if(w.done)undo(w);else openDone(w);return}
  const c=t.closest('[data-ws]');if(!c)return;const w=find(c.dataset.ws);if(!w)return;
  const acts=[['编辑心愿',()=>openForm(w)]];
  if(w.done){
    acts.push(['改照片和那句话',()=>openDone(w,true)]);
    if(!w._busy)acts.push([w.his?`让${S.hisName}重新说一句`:`让${S.hisName}说一句`,()=>himNote(w)]);
    acts.push(['标回没实现',()=>undo(w)])}
  else acts.push(['实现了 ♡',()=>openDone(w)]);
  acts.push(['删除这个心愿',async()=>{if(!confirm(`删除「${w.text}」？`))return;DATA.wish=DATA.wish.filter(x=>x!==w);await save();await IMG.del(w.images);render()}]);
  sheet(acts)};

/* ---------- 让陆择知道 ---------- */
HOOKS.context.push(()=>{
  const U=k=>DATA.wish.filter(w=>w.who===k&&!w.done).slice(-4).map(w=>`「${w.text}」`);
  const a=U('me'),b=U('him'),out=[];
  if(a.length)out.push('她想和你一起做的：'+a.join('、'));
  if(b.length)out.push('你想和她一起做的：'+b.join('、'));
  const r=DATA.wish.filter(w=>w.done&&Date.now()-w.doneAt<2*864e5).map(w=>`「${w.text}」`);
  if(r.length)out.push('最近刚实现了：'+r.join('、'));
  return out.length?'【心愿单】'+out.join('；')+'。偶尔可以自然地提起、约她一起去实现，不用每次都说。':''});

addMore({go:'wish',cn:'心愿单',ce:'wishlist'});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.wish))DATA.wish=[];render()});
HOOKS.refresh.push(render);
HOOKS.page.push(n=>{page=n;if(n==='wish')render()});
})();
