/* ===== 365 · library.js · 图书馆 ===== */
(()=>{
if(!Array.isArray(DATA.library))DATA.library=[];
const save=()=>saveData('library');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';

document.head.insertAdjacentHTML('beforeend',`<style>
.lb-item{display:block;width:100%;text-align:left;padding:18px 20px;margin-bottom:12px;transition:transform .15s}
.lb-item:active{transform:scale(.98)}
.lb-title{font-size:18px;font-weight:500;letter-spacing:3px}
.lb-meta{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px}
.lb-bar{height:2px;background:rgba(46,26,31,.08);border-radius:2px;margin-top:10px;overflow:hidden}
.lb-bar i{display:block;height:100%;background:var(--accent)}
.bk-card{padding:22px 20px 18px;margin-bottom:18px;text-align:center}
.bk-title{font-size:22px;font-weight:500;letter-spacing:4px;line-height:1.5;word-break:break-word}
.bk-meta{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px}
.bk-pct{font-family:var(--num);font-style:italic;font-weight:300;font-size:58px;line-height:1.1;margin-top:10px;color:var(--accent-t)}
.bk-pct small{font-size:20px;margin-left:2px}
.bk-bar{height:6px;border-radius:6px;background:rgba(46,26,31,.08);margin-top:6px;overflow:hidden}
.bk-bar i{display:block;height:100%;background:var(--accent);border-radius:6px}
.bk-at{font-size:12px;color:var(--sub);margin-top:8px;letter-spacing:1px}
.bk-btns{display:flex;gap:8px;justify-content:center;margin-top:16px}
.bk-btns .pill{padding:9px 20px;font-size:14px}
.bk-h{font-size:12px;color:var(--sub);letter-spacing:3px;margin:0 4px 12px}
.bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:14px 8px;justify-items:center}
.bk-c{width:48px;height:48px;border-radius:50%;border:1.5px solid var(--accent);display:grid;place-items:center;font-family:var(--num);font-style:italic;font-size:17px;background:rgba(255,255,255,.35);transition:transform .15s}
.bk-c:active{transform:scale(.92)}
.bk-c.read{background:var(--accent);color:var(--acct);opacity:.45}
.bk-c.on{background:var(--accent);color:var(--acct);border-color:transparent;box-shadow:0 0 0 3px rgba(255,255,255,.75)}
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
.rd-line{flex:none;height:2px;background:rgba(127,127,127,.15)}
.rd-line i{display:block;height:100%;width:0;background:var(--accent)}
#rdBody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding:12px 26px calc(var(--sb) + 40px)}
.rd-text{max-width:620px;margin:0 auto;font-family:var(--ti);font-size:var(--rd-size,17px);line-height:2;letter-spacing:.5px;text-align:justify}
.rd-text p{margin:0 0 1em;text-indent:2em}
.rd-div{display:block;width:100%;margin:.6em auto 1.4em;font-family:var(--num);font-style:italic;font-size:15px;opacity:.5;letter-spacing:4px;text-align:center;color:inherit}
.rd-nav{display:flex;gap:10px;justify-content:center;margin-top:30px}
.rd-nav .pill{padding:10px 24px;font-size:14px}
.rd-nav .pill.ghost{background:rgba(127,127,127,.15);color:inherit;border:0}
.rd-cap{text-align:center;font-size:12px;opacity:.5;letter-spacing:2px;margin-top:24px}
.mbox .f select{background:var(--sys-card);border:0;color:var(--sys-txt)}
#lbImpList{max-height:38vh;overflow-y:auto;margin:6px 0}
#lbImpList .mm-pick span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
</style>`);

$('#page-library .wrap').innerHTML=`
  <div id="lbShelf">
    <div class="head">
      <button class="iconbtn glass" data-go="home" aria-label="返回">${BACK}</button>
      <h2>图书馆</h2><em>library</em><span class="sp"></span>
      <button class="pill" id="lbAdd">＋ 新故事</button>
    </div>
    <div class="sub-line">我们的故事，一段一段接下去。</div>
    <div id="lbList"></div>
  </div>
  <div id="lbBook" style="display:none">
    <div class="head">
      <button class="iconbtn glass" id="bkBack" aria-label="返回">${BACK}</button>
      <h2>图书馆</h2><em>library</em><span class="sp"></span>
      <button class="iconbtn glass" id="bkMore" style="letter-spacing:1px">···</button>
    </div>
    <div id="bkBody"></div>
  </div>`;

$('#app').insertAdjacentHTML('beforeend',`
<div id="reader">
  <div class="rd-top">
    <button class="iconbtn" id="rdBack" aria-label="返回">${BACK}</button>
    <div class="rd-title" id="rdTitle"></div>
    <button class="iconbtn" id="rdAa" style="font-family:var(--en);font-size:17px">Aa</button>
    <button class="iconbtn" id="rdMore" style="letter-spacing:1px">···</button>
  </div>
  <div class="rd-set" id="rdSet">
    <div class="rd-row"><span>字号</span><button data-fs="-1">A−</button><b id="rdFs">17</b><button data-fs="1">A＋</button></div>
    <div class="rd-row"><span>背景</span><div class="rd-sw" id="rdBg"></div></div>
  </div>
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
const setPos=(id,v)=>{const P=pos();if(v==null)delete P[id];else P[id]=v;localStorage.setItem('365-lib',JSON.stringify(P))};
const getPos=id=>{const v=pos()[id];return v&&typeof v==='object'?v:null};
const paras=t=>t.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
function mix(h,w,k){const a=rgb(h),b=rgb(w);return '#'+a.map((v,i)=>Math.round(v*(1-k)+b[i]*k).toString(16).padStart(2,'0')).join('')}
const themeBg=()=>mix(S.theme||'#B4848D','#FFFFFF',.78);
function pctOf(s){const n=s.parts.length,p=getPos(s.id);if(!n||!p)return 0;
  const c=Math.min(p.c,n-1),r=p.r||0;return c===n-1&&r>.95?100:Math.min(100,Math.round((c+r)/n*100))}

let book=null,cur=null,ch=0,editIdx=null,posT;

/* ---------- 第一层：书架 ---------- */
function render(){
  const L=[...DATA.library].sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  $('#lbList').innerHTML=L.length?L.map(s=>{const p=pctOf(s);
    return `<button class="lb-item glass" data-lb="${s.id}"><div class="lb-title">${esc(s.title)}</div>
      <div class="lb-meta">${s.parts.length} 段 · 约 ${fmtN(len(s))} 字${p?` · 读到 ${p}%`:''}</div>
      <div class="lb-bar"><i style="width:${p}%"></i></div></button>`}).join('')
    :'<div class="empty">书架还空着<br>点「＋ 新故事」，把你们的剧情放进来</div>'}
function showShelf(){book=null;$('#lbShelf').style.display='';$('#lbBook').style.display='none';render()}
function showBook(s){book=s;$('#lbShelf').style.display='none';$('#lbBook').style.display='';renderDetail();$('#page-library').scrollTop=0}
$('#lbList').onclick=e=>{const b=e.target.closest('[data-lb]');if(!b)return;const s=DATA.library.find(x=>x.id===b.dataset.lb);if(s)showBook(s)};
$('#lbAdd').onclick=()=>{$('#lbTitle').value='';$('#lbText').value='';openModal('lbModal')};
$('#lbSave').onclick=async()=>{
  const title=$('#lbTitle').value.trim(),text=$('#lbText').value.trim();
  if(!title)return toast('给故事起个名字吧');
  DATA.library.push({id:uid(),title,parts:text?[{id:uid(),text,t:Date.now()}]:[],t:Date.now()});
  await save();closeModal('lbModal');render();toast('放上书架了 ♡')};

/* ---------- 第二层：这本书的目录 ---------- */
function renderDetail(){const s=book;if(!s)return;
  const n=s.parts.length,p=getPos(s.id),c=p?Math.min(p.c,Math.max(0,n-1)):0,pct=pctOf(s);
  $('#bkBody').innerHTML=`<div class="bk-card glass">
      <div class="bk-title">${esc(s.title)}</div>
      <div class="bk-meta">${n} 段 · 约 ${fmtN(len(s))} 字</div>
      <div class="bk-pct">${pct}<small>%</small></div>
      <div class="bk-bar"><i style="width:${pct}%"></i></div>
      <div class="bk-at">${!n?'还没有段落':p?`读到第 ${c+1} 段`:'还没开始读'}</div>
      <div class="bk-btns">${n?`<button class="pill" id="bkGo">${p?'继续读':'开始读'}</button>`:''}<button class="pill ghost" id="bkAdd">＋ 接着写一段</button></div>
    </div>
    ${n?`<div class="bk-h">目录</div><div class="bk-grid">${s.parts.map((_,i)=>`<button class="bk-c${p&&i<c?' read':''}${p&&i===c?' on':''}" data-ci="${i}">${i+1}</button>`).join('')}</div>`:''}`}
$('#bkBody').onclick=e=>{if(!book)return;
  if(e.target.closest('#bkGo')){const p=getPos(book.id);openCh(p?Math.min(p.c,book.parts.length-1):0);return}
  if(e.target.closest('#bkAdd')){openPart(null);return}
  const c=e.target.closest('[data-ci]');if(c)openCh(+c.dataset.ci)};
$('#bkBack').onclick=showShelf;
$('#bkMore').onclick=()=>{const s=book;if(!s)return;
  sheet([['改名字',async()=>{const v=prompt('新的名字',s.title);if(!v||!v.trim())return;s.title=v.trim();await save();renderDetail()}],
    ['删除这个故事',async()=>{if(!confirm(`删除「${s.title}」？里面所有的段落都会删掉。`))return;
      DATA.library=DATA.library.filter(x=>x!==s);setPos(s.id,null);await save();showShelf();toast('删掉了')}]])};

/* ---------- 第三层：读一段 ---------- */
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
function renderCh(){const s=cur,n=s.parts.length,p=s.parts[ch];
  $('#rdTitle').textContent=`${s.title} · ${ch+1}`;
  $('#rdBody').innerHTML=`<div class="rd-text"><button class="rd-div" id="rdDiv">· ${ch+1} ·</button>${paras(p.text)}</div>
    <div class="rd-nav">${ch>0?'<button class="pill ghost" id="rdPrev">上一段</button>':''}${ch<n-1?'<button class="pill" id="rdNextCh">下一段</button>':'<button class="pill" id="rdToc">回到目录</button>'}</div>
    <div class="rd-cap">第 ${ch+1} / ${n} 段 · 约 ${fmtN(p.text.length)} 字</div>`}
function prog(){const b=$('#rdBody'),m=b.scrollHeight-b.clientHeight,r=m>0?b.scrollTop/m:1;$('#rdPg').style.width=(r*100)+'%';return r}
function openCh(i){
  if(!book||!book.parts[i])return;
  cur=book;ch=i;applyReader();renderSet();renderCh();
  $('#rdSet').classList.remove('show');$('#reader').classList.add('show');
  const b=$('#rdBody'),p=getPos(cur.id);
  requestAnimationFrame(()=>{b.scrollTop=p&&p.c===i?(p.r||0)*(b.scrollHeight-b.clientHeight):0;setPos(cur.id,{c:i,r:prog()})});
  cur.readAt=Date.now();save()}
function closeReader(){$('#reader').classList.remove('show');cur=null;if(book)renderDetail();render()}
$('#rdBody').addEventListener('scroll',()=>{if(!cur)return;const id=cur.id,c=ch,r=prog();clearTimeout(posT);posT=setTimeout(()=>setPos(id,{c,r}),300)},{passive:true});
$('#rdBack').onclick=closeReader;
$('#rdAa').onclick=()=>$('#rdSet').classList.toggle('show');
$('#rdSet').addEventListener('click',e=>{
  const f=e.target.closest('[data-fs]');
  if(f){S.readSize=Math.max(14,Math.min(24,(S.readSize||17)+Number(f.dataset.fs)));saveSettings();applyReader();renderSet();return}
  const b=e.target.closest('[data-bg]');
  if(b){S.readBg=b.dataset.bg;saveSettings();applyReader();renderSet()}});
$('#rdSet').addEventListener('input',e=>{if(e.target.id!=='rdBgC')return;
  S.readBg=e.target.value.toUpperCase();saveSettings();applyReader();$$('#rdBg button').forEach(x=>x.classList.remove('on'))});
function partMenu(){
  sheet([['编辑这一段',()=>openPart(ch)],
    ['删除这一段',async()=>{if(!confirm(`删除第 ${ch+1} 段？`))return;
      cur.parts.splice(ch,1);const p=getPos(cur.id);
      if(p)setPos(cur.id,{c:Math.max(0,Math.min(p.c,cur.parts.length-1)),r:0});
      await save();closeReader();toast('删掉了')}],
    ['回到目录',closeReader]])}
$('#rdMore').onclick=()=>{if(cur)partMenu()};
$('#rdBody').addEventListener('click',e=>{
  if(e.target.closest('#rdPrev'))return openCh(ch-1);
  if(e.target.closest('#rdNextCh'))return openCh(ch+1);
  if(e.target.closest('#rdToc'))return closeReader();
  if(e.target.closest('#rdDiv'))partMenu()});

/* ---------- 接着写 / 编辑 ---------- */
function openPart(i){editIdx=i;
  $('#lbPartT').textContent=i==null?'接着写一段':`编辑第 ${i+1} 段`;
  $('#lbPartText').value=i==null?'':book.parts[i].text;openModal('lbPart')}
$('#lbPartSave').onclick=async()=>{
  const text=$('#lbPartText').value.trim();if(!text)return toast('还没有粘贴内容');
  if(!book)return;
  if(editIdx==null)book.parts.push({id:uid(),text,t:Date.now()});
  else book.parts[editIdx].text=text;
  await save();closeModal('lbPart');
  if(cur&&editIdx!=null)renderCh();else renderDetail();
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
HOOKS.page.push(n=>{
  if(n!=='secret')$('#lbImp').classList.remove('show');
  if(n==='library'){if(book)renderDetail();else render()}
  else{if(cur){$('#reader').classList.remove('show');cur=null}if(book)showShelf()}});
})();
