/* ===== 365 · library.js · 图书馆 ===== */
(()=>{
if(!Array.isArray(DATA.library))DATA.library=[];
const save=()=>saveData('library');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const DOTS='<svg class="i" viewBox="0 0 24 24"><circle cx="6" cy="8" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="12" cy="16" r="2"/></svg>';

document.head.insertAdjacentHTML('beforeend',`<style>
.lb-item{display:block;width:100%;text-align:left;padding:18px 20px;margin-bottom:12px;transition:transform .15s}
.lb-item:active{transform:scale(.98)}
.lb-title{font-size:18px;font-weight:500;letter-spacing:3px}
.lb-meta{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px}
.lb-bar{height:2px;background:rgba(46,26,31,.08);border-radius:2px;margin-top:10px;overflow:hidden}
.lb-bar i{display:block;height:100%;background:var(--accent)}
#reader{position:absolute;inset:0;z-index:30;display:none;flex-direction:column;background:var(--rd-bg);color:var(--rd-tx);-webkit-backdrop-filter:blur(24px) saturate(1.2);backdrop-filter:blur(24px) saturate(1.2)}
#reader.show{display:flex;animation:fd .25s ease}
.rd-top{flex:none;display:flex;align-items:center;gap:4px;padding:calc(var(--st) + 4px) 10px 8px}
.rd-top .iconbtn{color:inherit}
.rd-title{flex:1;text-align:center;font-size:15px;letter-spacing:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.8}
.rd-set{flex:none;display:none;padding:4px 20px 12px;font-family:var(--cn);font-size:13px}
.rd-set.show{display:block}
.rd-row{display:flex;align-items:center;gap:12px;margin:8px 0}
.rd-row>span{width:34px;opacity:.6;flex:none}
.rd-row>button{padding:5px 14px;border-radius:99px;background:rgba(127,127,127,.15);color:inherit}
.rd-row b{font-weight:500;min-width:24px;text-align:center}
.rd-sw{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.rd-sw button{width:28px;height:28px;border-radius:50%;border:1px solid rgba(127,127,127,.35)}
.rd-sw button.on{outline:2px solid var(--accent);outline-offset:2px}
.rd-sw input{width:30px;height:30px;border:0;padding:0;border-radius:50%;background:conic-gradient(#f88,#fd8,#8f8,#8df,#a8f,#f8d,#f88);-webkit-appearance:none;appearance:none;overflow:hidden}
.rd-sw input::-webkit-color-swatch-wrapper{padding:0}
.rd-sw input::-webkit-color-swatch{border:0;opacity:0}
.rd-toc{flex:none;display:none;flex-wrap:wrap;gap:10px;padding:4px 20px 14px;max-height:42vh;overflow-y:auto}
.rd-toc.show{display:flex}
.rd-toc button{width:42px;height:42px;border-radius:50%;border:1.5px solid var(--accent);color:inherit;font-family:var(--num);font-style:italic;font-size:16px;display:grid;place-items:center;flex:none}
.rd-toc button.on{background:var(--accent);color:var(--acct);border-color:transparent}
.rd-line{flex:none;height:2px;background:rgba(127,127,127,.15)}
.rd-line i{display:block;height:100%;width:0;background:var(--accent)}
#rdBody{position:relative;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:12px 26px calc(var(--sb) + 40px)}
.rd-text{max-width:620px;margin:0 auto;font-family:var(--ti);font-size:var(--rd-size,17px);line-height:2;letter-spacing:.5px;text-align:justify}
.rd-text p{margin:0 0 1em;text-indent:2em}
.rd-div{display:block;width:100%;margin:2em auto 1.4em;font-family:var(--num);font-style:italic;font-size:15px;opacity:.5;letter-spacing:4px;text-align:center;color:inherit}
.rd-text .rd-div:first-child{margin-top:.6em}
.rd-end{display:block;margin:30px auto 0;padding:11px 26px}
.rd-cap{text-align:center;font-size:12px;opacity:.5;letter-spacing:2px;margin-top:30px}
.mbox .f select{background:var(--sys-card);border:0;color:var(--sys-txt)}
#lbImpList{max-height:38vh;overflow-y:auto;margin:6px 0}
#lbImpList .mm-pick span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
</style>`);

$('#page-library .wrap').innerHTML=`
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回">${BACK}</button>
    <h2>图书馆</h2><em>library</em><span class="sp"></span>
    <button class="pill" id="lbAdd">＋ 新故事</button>
  </div>
  <div class="sub-line">我们的故事，一段一段接下去。</div>
  <div id="lbList"></div>`;

$('#app').insertAdjacentHTML('beforeend',`
<div id="reader">
  <div class="rd-top">
    <button class="iconbtn" id="rdBack" aria-label="返回">${BACK}</button>
    <div class="rd-title" id="rdTitle"></div>
    <button class="iconbtn" id="rdTocB" aria-label="目录">${DOTS}</button>
    <button class="iconbtn" id="rdAa" style="font-family:var(--en);font-size:17px">Aa</button>
    <button class="iconbtn" id="rdMore" style="letter-spacing:1px">···</button>
  </div>
  <div class="rd-set" id="rdSet">
    <div class="rd-row"><span>字号</span><button data-fs="-1">A−</button><b id="rdFs">17</b><button data-fs="1">A＋</button></div>
    <div class="rd-row"><span>背景</span><div class="rd-sw" id="rdBg"></div></div>
  </div>
  <div class="rd-toc" id="rdTocP"></div>
  <div class="rd-line"><i id="rdPg"></i></div>
  <div id="rdBody"></div>
</div>
<div class="modal" id="lbModal"><div class="mbox">
  <h3>新的故事</h3>
  <label class="f"><span>名字</span><input class="ti" id="lbTitle" placeholder="比如：雪夜"></label>
  <label class="f"><span>第一段（可以先不写）</span><textarea id="lbText" style="min-height:36vh"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="lbModal">取消</button><button class="pill" id="lbSave">放上书架</button></div>
</div></div>
<div class="modal" id="lbPart"><div class="mbox">
  <h3 id="lbPartT">接着写一段</h3>
  <label class="f"><span>把剧情粘贴在这里</span><textarea id="lbPartText" style="min-height:40vh"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="lbPart">取消</button><button class="pill" id="lbPartSave">保存</button></div>
</div></div>
<div class="modal" id="lbImp"><div class="mbox">
  <h3>收进图书馆</h3>
  <p class="hint" style="text-align:center;color:var(--sys-sub)">勾选要收进去的，会按时间先后排</p>
  <div id="lbImpList"></div>
  <label class="f"><span>放进哪本书</span><select id="lbImpBook"></select></label>
  <label class="f" id="lbImpNewRow"><span>新书的名字</span><input class="ti" id="lbImpNew"></label>
  <div class="f"><span>怎么放</span><div class="seg" id="lbImpWay"><button data-w="one">合成一段</button><button data-w="each">每条一段</button></div></div>
  <div class="mbtns"><button class="pill ghost" data-close="lbImp">取消</button><button class="pill" id="lbImpOk">收进去</button></div>
</div></div>`);

const len=s=>s.parts.reduce((n,p)=>n+p.text.length,0);
const fmtN=n=>n>=10000?(n/10000).toFixed(1)+' 万':n;
const pos=()=>{try{return JSON.parse(localStorage.getItem('365-lib')||'{}')}catch(e){return {}}};
const setPos=(id,r)=>{const P=pos();if(r==null)delete P[id];else P[id]=r;localStorage.setItem('365-lib',JSON.stringify(P))};
const paras=t=>t.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
function mix(h,w,k){const a=rgb(h),b=rgb(w);return '#'+a.map((v,i)=>Math.round(v*(1-k)+b[i]*k).toString(16).padStart(2,'0')).join('')}
const themeBg=()=>mix(S.theme||'#B4848D','#FFFFFF',.78);

/* 书架 */
function render(){
  const P=pos(),L=[...DATA.library].sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  $('#lbList').innerHTML=L.length?L.map(s=>{const p=Math.round((P[s.id]||0)*100);
    return `<button class="lb-item glass" data-lb="${s.id}"><div class="lb-title">${esc(s.title)}</div>
      <div class="lb-meta">${s.parts.length} 段 · 约 ${fmtN(len(s))} 字${p?` · 读到 ${p}%`:''}</div>
      <div class="lb-bar"><i style="width:${p}%"></i></div></button>`}).join('')
    :'<div class="empty">书架还空着<br>点「＋ 新故事」，把你们的剧情放进来</div>'}
$('#lbList').onclick=e=>{const b=e.target.closest('[data-lb]');if(!b)return;const s=DATA.library.find(x=>x.id===b.dataset.lb);if(s)openBook(s)};
$('#lbAdd').onclick=()=>{$('#lbTitle').value='';$('#lbText').value='';openModal('lbModal')};
$('#lbSave').onclick=async()=>{
  const title=$('#lbTitle').value.trim(),text=$('#lbText').value.trim();
  if(!title)return toast('给故事起个名字吧');
  DATA.library.push({id:uid(),title,parts:text?[{id:uid(),text,t:Date.now()}]:[],t:Date.now()});
  await save();closeModal('lbModal');render();toast('放上书架了 ♡')};

/* 阅读 */
let cur=null,editIdx=null,posT;
function applyReader(){
  const base=S.readBg||themeBg(),[r,g,b]=rgb(base),el=$('#reader');
  el.style.setProperty('--rd-bg',`rgba(${r},${g},${b},.86)`);
  el.style.setProperty('--rd-tx',isLight(base)?'#2E1A1F':'#F2ECEE');
  el.style.setProperty('--rd-size',(S.readSize||17)+'px')}
const BGS=[['','跟随主题色'],['#F7F3EC','纸白'],['#EFEFF3','雾灰'],['#EADFCF','旧书'],['#1C1C1E','夜间']];
function renderSet(){
  $('#rdFs').textContent=S.readSize||17;
  $('#rdBg').innerHTML=BGS.map(([c,n])=>`<button data-bg="${c}" aria-label="${n}" class="${(S.readBg||'')===c?'on':''}" style="background:${c||themeBg()}"></button>`).join('')
    +`<input type="color" id="rdBgC" value="${String(S.readBg||'#f7f3ec').toLowerCase()}">`}
function renderToc(){
  $('#rdTocP').innerHTML=cur.parts.length?cur.parts.map((p,i)=>`<button data-ti="${i}">${i+1}</button>`).join('')
    :'<span style="opacity:.6;font-size:13px">还没有段落</span>';mark()}
function mark(){const b=$('#rdBody');let c=0;
  $$('#rdBody [data-pi]').forEach((d,i)=>{if(d.offsetTop<=b.scrollTop+60)c=i});
  $$('#rdTocP button').forEach((x,i)=>x.classList.toggle('on',i===c))}
function renderBook(){
  const s=cur;$('#rdTitle').textContent=s.title;
  $('#rdBody').innerHTML=`<div class="rd-text">${s.parts.map((p,i)=>`<button class="rd-div" data-pi="${i}">· ${i+1} ·</button>${paras(p.text)}`).join('')}</div>
    <button class="pill rd-end" id="rdNext">＋ 接着写一段</button>
    <div class="rd-cap">${s.parts.length} 段 · 约 ${fmtN(len(s))} 字</div>`;
  renderToc()}
function prog(){const b=$('#rdBody'),m=b.scrollHeight-b.clientHeight,r=m>0?b.scrollTop/m:1;$('#rdPg').style.width=(r*100)+'%';return r}
async function openBook(s){
  cur=s;applyReader();renderSet();renderBook();
  $('#rdSet').classList.remove('show');$('#rdTocP').classList.toggle('show',s.parts.length>1);
  $('#reader').classList.add('show');
  const b=$('#rdBody');
  requestAnimationFrame(()=>{const r=pos()[s.id]||0;b.scrollTop=r*(b.scrollHeight-b.clientHeight);prog();mark()});
  s.readAt=Date.now();await save()}
function closeBook(){$('#reader').classList.remove('show');cur=null;render()}
$('#rdBody').addEventListener('scroll',()=>{if(!cur)return;const id=cur.id,r=prog();mark();clearTimeout(posT);posT=setTimeout(()=>setPos(id,r),300)},{passive:true});
$('#rdBack').onclick=closeBook;
$('#rdAa').onclick=()=>{$('#rdTocP').classList.remove('show');$('#rdSet').classList.toggle('show')};
$('#rdTocB').onclick=()=>{$('#rdSet').classList.remove('show');$('#rdTocP').classList.toggle('show')};
$('#rdTocP').onclick=e=>{const t=e.target.closest('[data-ti]');if(!t)return;
  $('#rdTocP').classList.remove('show');
  requestAnimationFrame(()=>{const el=$(`#rdBody [data-pi="${t.dataset.ti}"]`);if(el)$('#rdBody').scrollTop=el.offsetTop-6;prog();mark()})};
$('#rdSet').addEventListener('click',e=>{
  const f=e.target.closest('[data-fs]');
  if(f){S.readSize=Math.max(14,Math.min(24,(S.readSize||17)+Number(f.dataset.fs)));saveSettings();applyReader();renderSet();return}
  const b=e.target.closest('[data-bg]');
  if(b){S.readBg=b.dataset.bg;saveSettings();applyReader();renderSet()}});
$('#rdSet').addEventListener('input',e=>{if(e.target.id!=='rdBgC')return;
  S.readBg=e.target.value.toUpperCase();saveSettings();applyReader();$$('#rdBg button').forEach(x=>x.classList.remove('on'))});
$('#rdMore').onclick=()=>{if(!cur)return;const s=cur;
  sheet([['改名字',async()=>{const v=prompt('新的名字',s.title);if(!v||!v.trim())return;s.title=v.trim();await save();renderBook()}],
    ['删除这个故事',async()=>{if(!confirm(`删除「${s.title}」？里面所有的段落都会删掉。`))return;
      DATA.library=DATA.library.filter(x=>x!==s);setPos(s.id,null);await save();closeBook();toast('删掉了')}]])};

/* 段落：接着写 / 编辑 / 删除 */
function openPart(i){editIdx=i;
  $('#lbPartT').textContent=i==null?'接着写一段':`编辑第 ${i+1} 段`;
  $('#lbPartText').value=i==null?'':cur.parts[i].text;openModal('lbPart')}
$('#rdBody').addEventListener('click',e=>{
  if(e.target.closest('#rdNext')){openPart(null);return}
  const d=e.target.closest('[data-pi]');if(!d)return;const i=+d.dataset.pi;
  sheet([['编辑这一段',()=>openPart(i)],
    ['删除这一段',async()=>{if(!confirm(`删除第 ${i+1} 段？`))return;cur.parts.splice(i,1);await save();renderBook();prog()}]])});
$('#lbPartSave').onclick=async()=>{
  const text=$('#lbPartText').value.trim();if(!text)return toast('还没有粘贴内容');
  let at;
  if(editIdx==null){cur.parts.push({id:uid(),text,t:Date.now()});at=cur.parts.length-1}
  else{cur.parts[editIdx].text=text;at=editIdx}
  await save();closeModal('lbPart');renderBook();
  requestAnimationFrame(()=>{$(`#rdBody [data-pi="${at}"]`)?.scrollIntoView({block:'start'});prog();mark()});
  toast(editIdx==null?'接上了 ♡':'改好了')};

/* ---------- 从秘密收进图书馆 ---------- */
let impWay='one';
const setWay=w=>{impWay=w;$$('#lbImpWay button').forEach(b=>b.classList.toggle('on',b.dataset.w===w))};
const newName=()=>{const d=new Date();return `秘密 · ${d.getMonth()+1}月${d.getDate()}日`};
function updNew(){$('#lbImpNewRow').style.display=$('#lbImpBook').value==='__new'?'':'none'}
window.libImport=pre=>{
  const L=DATA.secret||[];if(!L.length)return;
  pre=(pre||[]).filter(i=>L[i]);
  const lo=pre.length?Math.min(...pre):L.length-1;
  const start=Math.max(0,Math.min(L.length-200,lo-10));
  $('#lbImpList').innerHTML=L.slice(start).map((m,k)=>{const i=start+k;
    return `<label class="mm-pick"><input type="checkbox" data-si="${i}"${pre.includes(i)?' checked':''}><span>${esc(m.text||'')}<small>${m.role==='user'?'我':esc(S.hisName)} · ${fmtDate(m.t)}</small></span></label>`}).join('');
  const B=[...DATA.library].sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  $('#lbImpBook').innerHTML=`<option value="__new">新建一本</option>`+B.map(s=>`<option value="${s.id}">${esc(s.title)}</option>`).join('');
  $('#lbImpBook').value=B.length?B[0].id:'__new';
  $('#lbImpNew').value=newName();updNew();setWay('one');
  openModal('lbImp');
  requestAnimationFrame(()=>$('#lbImpList input:checked')?.closest('label')?.scrollIntoView({block:'center'}))};
$('#lbImpBook').addEventListener('change',updNew);
$('#lbImpWay').onclick=e=>{const b=e.target.closest('[data-w]');if(b)setWay(b.dataset.w)};
$('#lbImpOk').onclick=async()=>{
  const idx=[...$$('#lbImpList input:checked')].map(x=>+x.dataset.si).sort((a,b)=>a-b);
  const texts=idx.map(i=>(DATA.secret[i]?.text||'').trim()).filter(Boolean);
  if(!texts.length)return toast('先勾选要收进去的');
  let s;const v=$('#lbImpBook').value;
  if(v==='__new'){const title=$('#lbImpNew').value.trim();if(!title)return toast('给新书起个名字');
    s={id:uid(),title,parts:[],t:Date.now()};DATA.library.push(s)}
  else s=DATA.library.find(x=>x.id===v);
  if(!s)return toast('没找到这本书');
  const now=Date.now();
  if(impWay==='one')s.parts.push({id:uid(),text:texts.join('\n\n'),t:now});
  else texts.forEach((t,k)=>s.parts.push({id:uid(),text:t,t:now+k}));
  await save();closeModal('lbImp');render();toast(`收进「${s.title}」了 ♡`)};
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('#lbImp').classList.remove('show')});

HOOKS.ready.push(render);
HOOKS.page.push(n=>{if(n!=='secret')$('#lbImp').classList.remove('show');if(n==='library')render();else if(cur)closeBook()});
})();
