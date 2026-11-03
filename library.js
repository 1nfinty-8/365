/* ===== 365 · library.js · 图书馆 + 导入书 + 共读批注 + 荧光笔 ===== */
(()=>{
if(!Array.isArray(DATA.library))DATA.library=[];
const save=()=>saveData('library');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const arr=v=>Array.isArray(v)?v:[];
const U=s=>s.src?'章':'段';
const lines=t=>String(t||'').split(/\n+/).map(s=>s.trim()).filter(Boolean);
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);

document.head.insertAdjacentHTML('beforeend',`<style>
.lb-item{display:block;width:100%;text-align:left;padding:18px 20px;margin-bottom:12px;transition:transform .15s}
.lb-item:active{transform:scale(.98)}
.lb-title{font-size:18px;font-weight:500;letter-spacing:3px}
.lb-meta{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px}
.lb-bar{height:2px;background:rgba(46,26,31,.08);border-radius:2px;margin-top:10px;overflow:hidden}
.lb-bar i{display:block;height:100%;background:var(--accent)}
.lb-imp{display:block;width:100%;padding:13px;margin-bottom:14px;text-align:center;letter-spacing:2px;font-size:14px}
.lb-imp small{display:block;font-family:var(--en);font-style:italic;font-size:12px;color:var(--sub);letter-spacing:1px;margin-top:1px}
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
.bk-c{position:relative;width:48px;height:48px;border-radius:50%;border:1.5px solid var(--accent);display:grid;place-items:center;font-family:var(--num);font-style:italic;font-size:17px;background:rgba(255,255,255,.35);transition:transform .15s}
.bk-c:active{transform:scale(.92)}
.bk-c.read{background:var(--accent);color:var(--acct);opacity:.45}
.bk-c.on{background:var(--accent);color:var(--acct);border-color:transparent;box-shadow:0 0 0 3px rgba(255,255,255,.75)}
.bk-c.nt::after{content:"";position:absolute;top:1px;right:1px;width:8px;height:8px;border-radius:50%;background:var(--accent-t);box-shadow:0 0 0 2px rgba(255,255,255,.8)}
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
.rd-text{max-width:620px;margin:0 auto;font-family:var(--ti);font-size:var(--rd-size,17px);line-height:2;letter-spacing:.5px;text-align:justify;-webkit-user-select:text;user-select:text}
.rd-text p{margin:0 0 1em;text-indent:2em;cursor:pointer}
.rd-text mark.hl{background:none;color:inherit;border-radius:3px;padding:1px 0;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.rd-text mark.hl.me{background:color-mix(in srgb,var(--accent) 45%,transparent)}
.rd-text mark.hl.him{text-decoration:underline;text-decoration-color:var(--accent-t);text-decoration-thickness:2px;text-underline-offset:5px}
#rdHl{position:absolute;left:50%;bottom:calc(var(--sb) + 22px);transform:translateX(-50%);z-index:3;display:none;padding:11px 24px;box-shadow:0 8px 20px rgba(0,0,0,.18);-webkit-user-select:none;user-select:none}
#rdHl.show{display:block;animation:fd .2s ease}
.rd-ct{font-family:var(--ti);font-size:1.15em;font-weight:500;text-align:center;letter-spacing:2px;margin:0 0 1.4em}
.rd-div{display:block;width:100%;margin:.6em auto 1.4em;font-family:var(--num);font-style:italic;font-size:15px;opacity:.5;letter-spacing:4px;text-align:center;color:inherit}
.rd-nt{margin:-.4em 0 1.3em;padding:8px 12px;border-left:2px solid var(--accent);background:rgba(127,127,127,.1);border-radius:0 12px 12px 0;font-size:14px;line-height:1.75;text-indent:0;text-align:left;cursor:pointer;white-space:pre-wrap;word-break:break-word;-webkit-user-select:none;user-select:none}
.rd-nt>div+div{margin-top:6px}
.rd-nt small,.rd-say small{display:block;font-size:11px;opacity:.55;letter-spacing:1px}
.rd-nt .me{opacity:.8}
.rd-af{max-width:620px;margin:34px auto 0;padding-top:18px;border-top:1px solid rgba(127,127,127,.25)}
.rd-afh{text-align:center;font-size:12px;opacity:.55;letter-spacing:3px;margin-bottom:12px}
.rd-say{font-family:var(--ti);font-size:15px;line-height:1.85;padding:10px 14px;border-radius:14px;background:rgba(127,127,127,.1);margin-bottom:8px;white-space:pre-wrap;word-break:break-word}
.rd-say.me{margin-left:28px}
.rd-afb{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:13px}
.rd-afb .pill{padding:8px 16px;font-size:13px}
.rd-afb .pill.ghost,.rd-nav .pill.ghost{background:rgba(127,127,127,.15);color:inherit;border:0}
.rd-nav{display:flex;gap:10px;justify-content:center;margin-top:30px}
.rd-nav .pill{padding:10px 24px;font-size:14px}
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
    <button class="lb-imp glass" id="lbImpBtn">导入一本书<small>epub / txt</small></button>
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
<input type="file" id="lbFile" accept=".epub,.txt,application/epub+zip,text/plain" style="display:none">
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
  <button class="pill" id="rdHl">荧光笔划线</button>
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
function mix(h,w,k){const a=rgb(h),b=rgb(w);return '#'+a.map((v,i)=>Math.round(v*(1-k)+b[i]*k).toString(16).padStart(2,'0')).join('')}
const themeBg=()=>mix(S.theme||'#B4848D','#FFFFFF',.78);
function pctOf(s){const n=s.parts.length,p=getPos(s.id);if(!n||!p)return 0;
  const c=Math.min(p.c,n-1),r=p.r||0;return c===n-1&&r>.95?100:Math.min(100,Math.round((c+r)/n*100))}

let book=null,cur=null,ch=0,editIdx=null,posT,importing=false;
const nb=new Set();

/* ---------- 第一层：书架 ---------- */
function render(){
  const L=[...DATA.library].sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  $('#lbImpBtn').innerHTML=importing?'正在读这本书…<small>importing</small>':'导入一本书<small>epub / txt</small>';
  $('#lbList').innerHTML=L.length?L.map(s=>{const p=pctOf(s);
    return `<button class="lb-item glass" data-lb="${s.id}"><div class="lb-title">${esc(s.title)}</div>
      <div class="lb-meta">${s.author?esc(s.author)+' · ':''}${s.parts.length} ${U(s)} · 约 ${fmtN(len(s))} 字${p?` · 读到 ${p}%`:''}</div>
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

/* ---------- 导入 epub / txt ---------- */
$('#lbImpBtn').onclick=()=>{if(importing)return;const f=$('#lbFile');f.value='';f.click()};
function loadZip(){if(window.JSZip)return Promise.resolve();
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload=ok;s.onerror=()=>no(new Error('解压工具没加载出来，检查一下网络和 VPN'));document.head.appendChild(s)})}
function rel(dir,h){if(!h)return '';try{h=decodeURIComponent(h)}catch(e){}if(/^[a-z]+:/i.test(h))return '';
  const out=[];(dir+h).split('/').forEach(x=>{if(x==='..')out.pop();else if(x&&x!=='.')out.push(x)});return out.join('/')}
function htmlText(s){if(!s)return '';
  let d=new DOMParser().parseFromString(s,'application/xhtml+xml');
  if(d.getElementsByTagName('parsererror').length)d=new DOMParser().parseFromString(s,'text/html');
  const b=d.body||d.getElementsByTagName('body')[0];if(!b)return '';
  b.querySelectorAll('script,style').forEach(x=>x.remove());
  b.querySelectorAll('br').forEach(x=>x.replaceWith('\n'));
  b.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,blockquote,tr,section').forEach(x=>x.append('\n'));
  return b.textContent.split('\n').map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n')}
async function readEpub(f){
  await loadZip();const z=await JSZip.loadAsync(f);
  const get=p=>{const x=z.file(p);return x?x.async('string'):Promise.resolve('')};
  const X=(s,t)=>new DOMParser().parseFromString(s||'',t||'application/xml');
  const opfP=X(await get('META-INF/container.xml')).getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
  if(!opfP)throw new Error('这不是标准的 epub');
  const opf=X(await get(opfP)),dir=opfP.replace(/[^/]*$/,'');
  const meta=t=>opf.getElementsByTagNameNS('*',t)[0]?.textContent?.trim()||'';
  const man={};[...opf.getElementsByTagNameNS('*','item')].forEach(i=>man[i.getAttribute('id')]={href:rel(dir,i.getAttribute('href')),type:i.getAttribute('media-type')||'',props:i.getAttribute('properties')||''});
  const spine=[...opf.getElementsByTagNameNS('*','itemref')].map(r=>man[r.getAttribute('idref')]).filter(x=>x&&/html/.test(x.type));
  const toc={};
  const nav=Object.values(man).find(x=>/\bnav\b/.test(x.props));
  if(nav){const d=X(await get(nav.href),'text/html'),nd=nav.href.replace(/[^/]*$/,'');
    const root=[...d.querySelectorAll('nav')].find(n=>/toc/.test(n.getAttribute('epub:type')||''))||d.querySelector('nav');
    root?.querySelectorAll('a[href]').forEach(a=>{const h=rel(nd,a.getAttribute('href').split('#')[0]),t=a.textContent.replace(/\s+/g,' ').trim();if(h&&t&&!toc[h])toc[h]=t})}
  if(!Object.keys(toc).length){
    const tid=opf.getElementsByTagNameNS('*','spine')[0]?.getAttribute('toc');
    const ncx=(tid&&man[tid])||Object.values(man).find(x=>/ncx/.test(x.type));
    if(ncx){const d=X(await get(ncx.href)),nd=ncx.href.replace(/[^/]*$/,'');
      [...d.getElementsByTagNameNS('*','navPoint')].forEach(np=>{const t=np.getElementsByTagNameNS('*','text')[0]?.textContent?.trim(),c=np.getElementsByTagNameNS('*','content')[0]?.getAttribute('src');
        if(!t||!c)return;const h=rel(nd,c.split('#')[0]);if(!toc[h])toc[h]=t})}}
  const hasToc=Object.keys(toc).length>0,parts=[];
  for(const it of spine){const t=htmlText(await get(it.href)),tt=toc[it.href];
    if(!t&&!tt)continue;
    if(tt||!hasToc||!parts.length)parts.push({title:tt||lines(t)[0]?.slice(0,20)||'',text:t});
    else if(t)parts[parts.length-1].text+='\n'+t}
  return {title:meta('title'),author:meta('creator'),parts:parts.filter(p=>p.text.replace(/\s/g,'').length>=2)}}
async function readTxt(f){
  const buf=await f.arrayBuffer();let t;
  try{t=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){t=new TextDecoder('gb18030').decode(buf)}
  t=t.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const re=/^[ \t\u3000]*(第[零〇一二三四五六七八九十百千万两0-9]+[章节回卷集部篇][^\n]{0,30}|序章[^\n]{0,20}|序[言幕]?|楔子|引子|尾声[^\n]{0,20}|后记|番外[^\n]{0,30})[ \t\u3000]*$/gm;
  const hits=[...t.matchAll(re)],parts=[];
  if(hits.length>=2){
    const pre=t.slice(0,hits[0].index).trim();if(pre.length>50)parts.push({title:'前言',text:pre});
    hits.forEach((m,i)=>{const end=i+1<hits.length?hits[i+1].index:t.length;parts.push({title:m[1].trim(),text:t.slice(m.index+m[0].length,end).trim()||m[1].trim()})})}
  else{let buf2='',n=1;
    for(const l of t.split('\n')){buf2+=l+'\n';if(buf2.length>=8000){parts.push({title:'第 '+n++ +' 部分',text:buf2});buf2=''}}
    if(buf2.trim())parts.push({title:'第 '+n+' 部分',text:buf2})}
  return {title:f.name.replace(/\.\w+$/,''),parts:parts.map(p=>({title:p.title,text:lines(p.text).join('\n')})).filter(p=>p.text)}}
$('#lbFile').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;importing=true;render();
  try{
    const b=/\.epub$/i.test(f.name)||/epub/.test(f.type)?await readEpub(f):await readTxt(f);
    if(!b.parts.length)throw new Error('这本书里没读到文字');
    const now=Date.now();
    const s={id:uid(),title:b.title||f.name.replace(/\.\w+$/,''),author:b.author||'',src:'book',t:now,
      parts:b.parts.map((p,i)=>({id:uid(),title:p.title||'',text:p.text,t:now+i}))};
    DATA.library.push(s);await save();toast(`导入好了，一共 ${s.parts.length} 章`);importing=false;showBook(s)}
  catch(x){toast('导入失败：'+(x.message||x))}
  finally{importing=false;if(!book)render()}});

/* ---------- 第二层：这本书的目录 ---------- */
function renderDetail(){const s=book;if(!s)return;
  const n=s.parts.length,p=getPos(s.id),c=p?Math.min(p.c,Math.max(0,n-1)):0,pct=pctOf(s),u=U(s);
  $('#bkBody').innerHTML=`<div class="bk-card glass">
      <div class="bk-title">${esc(s.title)}</div>
      <div class="bk-meta">${s.author?esc(s.author)+' · ':''}${n} ${u} · 约 ${fmtN(len(s))} 字</div>
      <div class="bk-pct">${pct}<small>%</small></div>
      <div class="bk-bar"><i style="width:${pct}%"></i></div>
      <div class="bk-at">${!n?`还没有${u==='章'?'章节':'段落'}`:p?`读到第 ${c+1} ${u}${s.parts[c]?.title?' · '+esc(s.parts[c].title):''}`:'还没开始读'}</div>
      <div class="bk-btns">${n?`<button class="pill" id="bkGo">${p?'继续读':'开始读'}</button>`:''}${s.src?'':'<button class="pill ghost" id="bkAdd">＋ 接着写一段</button>'}</div>
    </div>
    ${n?`<div class="bk-h">目录</div><div class="bk-grid">${s.parts.map((x,i)=>`<button class="bk-c${p&&i<c?' read':''}${p&&i===c?' on':''}${arr(x.notes).length||arr(x.after).length||arr(x.marks).length?' nt':''}" data-ci="${i}">${i+1}</button>`).join('')}</div>`:''}`}
$('#bkBody').onclick=e=>{if(!book)return;
  if(e.target.closest('#bkGo')){const p=getPos(book.id);openCh(p?Math.min(p.c,book.parts.length-1):0);return}
  if(e.target.closest('#bkAdd')){openPart(null);return}
  const c=e.target.closest('[data-ci]');if(c)openCh(+c.dataset.ci)};
$('#bkBack').onclick=showShelf;
$('#bkMore').onclick=()=>{const s=book;if(!s)return;
  sheet([['改名字',async()=>{const v=prompt('新的名字',s.title);if(!v||!v.trim())return;s.title=v.trim();await save();renderDetail()}],
    [s.sx?'批注改用平时的模型':'批注改用秘密的模型',async()=>{s.sx=!s.sx;await save();toast(s.sx?'这本书的批注会用秘密的模型':'这本书的批注会用平时的模型')}],
    ['删除这本书',async()=>{if(!confirm(`删除「${s.title}」？里面所有的内容、批注和划线都会删掉。`))return;
      DATA.library=DATA.library.filter(x=>x!==s);setPos(s.id,null);await save();showShelf();toast('删掉了')}]])};

/* ---------- 第三层：读一章 ---------- */
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
const who=x=>x.who==='me'?'我':esc(S.hisName);

/* 把划线画进一段文字里 */
function hl(i,x,M){
  const L=M.filter(m=>m.pi===i&&m.e>m.s);if(!L.length)return esc(x);
  const b=new Set([0,x.length]);
  L.forEach(m=>{b.add(Math.max(0,Math.min(x.length,m.s)));b.add(Math.max(0,Math.min(x.length,m.e)))});
  const P=[...b].sort((a,c)=>a-c);let h='';
  for(let k=0;k<P.length-1;k++){const a=P[k],c=P[k+1];if(c<=a)continue;
    const seg=esc(x.slice(a,c));
        const me=L.filter(m=>m.who==='me'&&m.s<=a&&m.e>=c).at(-1),him=L.some(m=>m.who==='him'&&m.s<=a&&m.e>=c);
    h+=me||him?`<mark class="hl${me?' me':''}${him?' him':''}"${me?` data-c="${me.c||''}"`:''} data-o="${a}">${seg}</mark>`:seg}
  return h}
function renderCh(){const s=cur,n=s.parts.length,p=s.parts[ch],u=U(s),k=p.id,H=esc(S.hisName);
  $('#rdTitle').textContent=`${s.title} · ${ch+1}`;
  const P=lines(p.text),N=arr(p.notes),M=arr(p.marks),last=Math.max(0,P.length-1);
  const nt=i=>{const L=N.filter(x=>Math.min(x.pi,last)===i),w=nb.has(k+':'+i);if(!L.length&&!w)return '';
    return `<div class="rd-nt" data-np="${i}">${L.map(x=>`<div class="${x.who==='me'?'me':'him'}"><small>${who(x)}</small>${esc(x.text)}</div>`).join('')}${w?`<div class="him"><small>${H}</small>在写…</div>`:''}</div>`};
  const A=arr(p.after),aw=nb.has(k+':after'),all=nb.has(k+':all');
  $('#rdBody').innerHTML=`<div class="rd-text"><button class="rd-div" id="rdDiv">· ${ch+1} ·</button>${p.title?`<h3 class="rd-ct">${esc(p.title)}</h3>`:''}${P.map((x,i)=>`<p data-p="${i}">${hl(i,x,M)}</p>${nt(i)}`).join('')}</div>
    <div class="rd-af"><div class="rd-afh">一起读 · ${H}</div>
      ${A.map(x=>`<div class="rd-say ${x.who==='me'?'me':'him'}"><small>${who(x)}</small>${esc(x.text)}</div>`).join('')}
      ${aw?`<div class="rd-say him"><small>${H}</small>在写…</div>`:''}
      <div class="rd-afb">${all?`<span style="opacity:.6">${H}在批注…</span>`:`<button class="pill ghost" id="rdNoteAll">让${H}批注这一${u}</button>`}${aw?'':A.length?'<button class="pill ghost" id="rdAfRe">回他一句</button>':`<button class="pill" id="rdAf">让${H}写读后感</button>`}</div>
    </div>
    <div class="rd-nav">${ch>0?`<button class="pill ghost" id="rdPrev">上一${u}</button>`:''}${ch<n-1?`<button class="pill" id="rdNextCh">下一${u}</button>`:'<button class="pill" id="rdToc">回到目录</button>'}</div>
    <div class="rd-cap">第 ${ch+1} / ${n} ${u} · 约 ${fmtN(p.text.length)} 字${N.length?` · ${N.length} 条批注`:''}${M.length?` · ${M.length} 处划线`:''}</div>`}
function prog(){const b=$('#rdBody'),m=b.scrollHeight-b.clientHeight,r=m>0?b.scrollTop/m:1;$('#rdPg').style.width=(r*100)+'%';return r}
function openCh(i){
  if(!book||!book.parts[i])return;
  cur=book;ch=i;applyReader();renderSet();renderCh();
  $('#rdSet').classList.remove('show');$('#reader').classList.add('show');
  const b=$('#rdBody'),p=getPos(cur.id);
  requestAnimationFrame(()=>{b.scrollTop=p&&p.c===i?(p.r||0)*(b.scrollHeight-b.clientHeight):0;setPos(cur.id,{c:i,r:prog()})});
  cur.readAt=Date.now();save()}
function closeReader(){$('#reader').classList.remove('show');$('#rdHl').classList.remove('show');cur=null;if(book)renderDetail();render()}
function refreshIf(p){
  if(cur&&cur.parts[ch]===p&&$('#reader').classList.contains('show')){const b=$('#rdBody'),y=b.scrollTop;renderCh();b.scrollTop=y}
  else if(book)renderDetail()}
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
function partMenu(){const s=cur,p=s.parts[ch],u=U(s);
  const acts=[[`让${S.hisName}批注这一${u}`,()=>noteAll(s,p)]];
  if(arr(p.notes).length||arr(p.after).length)acts.push([`清掉这一${u}的批注`,async()=>{if(!confirm('清掉这一'+u+'所有的批注和读后感？'))return;p.notes=[];p.after=[];await save();refreshIf(p)}]);
  if(arr(p.marks).length)acts.push([`清掉这一${u}的划线`,async()=>{if(!confirm('清掉这一'+u+'所有的划线？'))return;p.marks=[];await save();refreshIf(p)}]);
  acts.push([`编辑这一${u}`,()=>openPart(ch)],
    [`删除这一${u}`,async()=>{if(!confirm(`删除第 ${ch+1} ${u}？`))return;
      s.parts.splice(ch,1);const ps=getPos(s.id);
      if(ps)setPos(s.id,{c:Math.max(0,Math.min(ps.c,s.parts.length-1)),r:0});
      await save();closeReader();toast('删掉了')}],
    ['回到目录',closeReader]);
  sheet(acts)}
$('#rdMore').onclick=()=>{if(cur)partMenu()};

/* ---------- 荧光笔 ---------- */
function addMark(p,m){p.marks=arr(p.marks);let s=m.s,e=m.e;
  p.marks=p.marks.filter(x=>{if(x.who===m.who&&x.pi===m.pi&&x.s<=e&&x.e>=s){s=Math.min(s,x.s);e=Math.max(e,x.e);return false}return true});
  p.marks.push({pi:m.pi,s,e,who:m.who,t:Date.now()})}
const quotes=(p,w)=>{const L=lines(p.text);return arr(p.marks).filter(m=>m.who===w&&L[m.pi]).map(m=>L[m.pi].slice(m.s,m.e)).filter(Boolean)};
function offIn(P,node,off){const r=document.createRange();r.selectNodeContents(P);try{r.setEnd(node,off)}catch(e){return 0}return r.toString().length}
function selParts(){
  const sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
  const r=sel.getRangeAt(0),box=$('#rdBody .rd-text');if(!box)return null;
  if(!box.contains(r.startContainer)&&!box.contains(r.endContainer))return null;
  const out=[];
  box.querySelectorAll('p[data-p]').forEach(P=>{if(!r.intersectsNode(P))return;
    const L=P.textContent.length;
    const s=P.contains(r.startContainer)?offIn(P,r.startContainer,r.startOffset):0;
    const e=P.contains(r.endContainer)?offIn(P,r.endContainer,r.endOffset):L;
    if(e>s)out.push({pi:+P.dataset.p,s,e})});
  return out.length?out:null}
let pendSel=null,hadSel=false,selEnd=0;
document.addEventListener('selectionchange',()=>{
  if(!cur||!$('#reader').classList.contains('show'))return;
  const P=selParts();
  if(P){pendSel=P;hadSel=true;$('#rdHl').classList.add('show')}
  else{if(hadSel){hadSel=false;selEnd=Date.now()}
    setTimeout(()=>{if(!hadSel)$('#rdHl').classList.remove('show')},400)}});
function applyHl(){
  if(!cur||!pendSel)return;const p=cur.parts[ch];
  pendSel.forEach(m=>addMark(p,{...m,who:'me'}));pendSel=null;hadSel=false;selEnd=Date.now();
  try{getSelection().removeAllRanges()}catch(e){}
  $('#rdHl').classList.remove('show');save();refreshIf(p);toast('划好了')}
$('#rdHl').addEventListener('pointerdown',e=>{e.preventDefault();applyHl()});
$('#rdHl').addEventListener('click',applyHl);
function markMenu(i,o){const s=cur,p=s.parts[ch],L=lines(p.text);
  const M=arr(p.marks).filter(m=>m.pi===i&&m.s<=o&&m.e>o);if(!M.length)return paraMenu(i);
  const q=(L[i]||'').slice(M[0].s,M[0].e);
  sheet([[`让${S.hisName}说说这句`,()=>noteOne(s,p,i,q)],
    ['我写一句批注',()=>mine(i)],
    ['复制这句',()=>navigator.clipboard?.writeText(q).then(()=>toast('已复制'))],
    [M.some(m=>m.who==='me')?'擦掉这条划线':`擦掉${S.hisName}的划线`,async()=>{p.marks=arr(p.marks).filter(m=>!M.includes(m));await save();refreshIf(p)}]])}

/* ---------- 共读：批注和读后感 ---------- */
async function sxAI(system,text){
  const c=S.sxProvider
    ?{p:S.sxProvider,k:S.sxKey||S.apiKey,m:S.sxModel||(S.sxProvider==='gemini'?'gemini-2.5-flash':'deepseek-chat'),u:S.sxBase||S.baseUrl}
    :{p:S.provider,k:S.apiKey,m:S.model,u:S.baseUrl};
  if(!c.k)throw new Error('还没有填 API Key');
  let r,j,t;
  try{
    if(c.p==='gemini'){
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.m)}:generateContent?key=${encodeURIComponent(c.k)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text}]}],generationConfig:{temperature:1},safetySettings:cats.map(x=>({category:x,threshold:'BLOCK_NONE'}))})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const cd=j.candidates?.[0];
      t=(cd?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
      if(!t)throw new Error('他没有回话（原因：'+(cd?.finishReason||j.promptFeedback?.blockReason||'未知')+'），再试一次');
    }else{
      r=await fetch(String(c.u||'').replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.k},
        body:JSON.stringify({model:c.m,messages:[{role:'system',content:system},{role:'user',content:text}],temperature:1})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      t=(j.choices?.[0]?.message?.content||'').trim();
      if(!t)throw new Error('他没有回话，再试一次');
    }
    return t}
  catch(e){if(e instanceof TypeError)throw new Error('连不上，检查一下 VPN 和网络');throw e}}
const scene=s=>`你们在「365」的图书馆里一起读${s.src?'一本书':'你们俩一起写的故事'}《${s.title}》。她在读，你在旁边陪她一起读，会在书页边上写批注、划出你喜欢的句子给她看。`;
function ai(s,text){
  if(s.sx){let sys=personaText()+'\n\n'+nowLine()+'\n【场景】'+scene(s)+'这里只属于你们两个人。';
    if((S.sxExtra||'').trim())sys+='\n\n'+S.sxExtra.trim();return sxAI(sys,text)}
  return callAI(sceneSystem(scene(s)),[{role:'user',text}])}
const where=(s,p)=>`《${s.title}》第 ${s.parts.indexOf(p)+1} ${U(s)}${p.title?'「'+p.title+'」':''}`;
const herHl=p=>{const q=quotes(p,'me');return q.length?'她在这一'+'部分用荧光笔划了这些句子：'+q.slice(0,8).map(x=>'「'+x.slice(0,80)+'」').join('、')+'\n':''};
async function run(key,p,fn){if(nb.has(key))return;nb.add(key);refreshIf(p);
  try{await fn();await save()}catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{nb.delete(key);refreshIf(p)}}
function noteOne(s,p,i,q){return run(p.id+':'+i,p,async()=>{
  const L=lines(p.text),last=Math.max(0,L.length-1);
  const th=arr(p.notes).filter(x=>Math.min(x.pi,last)===i).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
  const t=await ai(s,`${where(s,p)}里的这一段：\n「${L[i]||''}」\n${i>0?'前一段是：「'+String(L[i-1]).slice(0,300)+'」\n':''}${q?'她特别划出了这一句：「'+q+'」，想听你说说这句。\n':''}${herHl(p)}${th?'你们已经在这段旁边写了：\n'+th+'\n请接着回她最新说的。':'请在这一段旁边写一句批注。'}
以${S.hisName}的身份，像在书页边上随手写给她看的：可以是你的感想、吐槽、联想到你们之间的事，或者问她一个问题。一到三句，口语，不要加名字前缀，不要用 emoji。只输出批注内容。`);
  (p.notes=arr(p.notes)).push({pi:i,who:'him',text:clean(t),t:Date.now()})})}
function noteAll(s,p){return run(p.id+':all',p,async()=>{
  const L=lines(p.text);let out='',k=0;
  for(;k<L.length;k++){const x=`[${k}] ${L[k]}\n`;if(out.length+x.length>9000)break;out+=x}
  const j=J(await ai(s,`${where(s,p)}，按段落编号：\n${out}${k<L.length?'（后面还有）\n':''}${herHl(p)}
请以${S.hisName}的身份：1. 挑 3 到 5 段你最有感觉的，在旁边写批注给她看：感想、吐槽、联想到你们之间的事，或者问她一个问题，每条一到三句，口语；2. 划出 2 到 4 句你最喜欢的句子，必须从原文里一字不差地摘出来，每句不超过 60 字。${herHl(p)?'她划的句子你也可以回应。':''}不要用 emoji。只输出 JSON：{"notes":[{"p":段落编号,"text":"批注"}],"lines":[{"p":段落编号,"text":"原文里的一句"}]}`));
  const N=arr(j.notes).filter(x=>x&&x.text&&Number.isInteger(+x.p)&&+x.p>=0&&+x.p<L.length);
  let hit=0;
  arr(j.lines).forEach(x=>{const t=String(x?.text||'').trim().replace(/^[「“"]|[」”"]$/g,'');if(t.length<2)return;
    let pi=+x.p,o=L[pi]?L[pi].indexOf(t):-1;
    if(o<0){pi=L.findIndex(l=>l.includes(t));o=pi>=0?L[pi].indexOf(t):-1}
    if(o>=0){addMark(p,{pi,s:o,e:o+t.length,who:'him'});hit++}});
  if(!N.length&&!hit)throw new SyntaxError('empty');
  const now=Date.now();p.notes=arr(p.notes);
  N.forEach((x,n)=>p.notes.push({pi:+x.p,who:'him',text:clean(String(x.text)),t:now+n}));
  toast(`${S.hisName}写了 ${N.length} 条批注${hit?`，划了 ${hit} 句`:''}`)})}
function afterWrite(s,p){return run(p.id+':after',p,async()=>{
  const T=p.text,ex=T.length>7000?T.slice(0,3500)+'\n……\n'+T.slice(-3500):T;
  const A=arr(p.after),th=A.map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
  const t=await ai(s,`${where(s,p)}：\n${ex}\n\n${herHl(p)}${th?'读完以后你们聊的：\n'+th+'\n请以'+S.hisName+'的身份接着回她最新说的，一到四句，口语。':'请以'+S.hisName+'的身份，写这一'+U(s)+'的读后感给她：你最在意的地方、你的感受、联想到你们之间的什么，她划的句子也可以提到，100到250字。'}不要加名字前缀，不要用 emoji。只输出内容。`);
  (p.after=A).push({who:'him',text:clean(t),t:Date.now()})})}
async function mine(i){const s=cur,p=s.parts[ch];
  const v=prompt('写在这段旁边的话');if(!v||!v.trim())return;
  (p.notes=arr(p.notes)).push({pi:i,who:'me',text:v.trim(),t:Date.now()});await save();refreshIf(p);noteOne(s,p,i)}
function paraMenu(i){const s=cur,p=s.parts[ch],L=lines(p.text),last=Math.max(0,L.length-1);
  const N=arr(p.notes).filter(x=>Math.min(x.pi,last)===i),acts=[];
  acts.push(['荧光笔划整段',async()=>{addMark(p,{pi:i,s:0,e:(L[i]||'').length,who:'me'});await save();refreshIf(p)}]);
  if(!N.length)acts.push([`让${S.hisName}批注这段`,()=>noteOne(s,p,i)]);
  acts.push([N.length?'回他一句':'我写一句批注',()=>mine(i)]);
  if(N.length&&N.at(-1).who==='me')acts.push([`让${S.hisName}回`,()=>noteOne(s,p,i)]);
  acts.push(['复制这段',()=>navigator.clipboard?.writeText(L[i]||'').then(()=>toast('已复制'))]);
  if(N.length)acts.push(['删除这段的批注',async()=>{p.notes=arr(p.notes).filter(x=>!N.includes(x));await save();refreshIf(p)}]);
  sheet(acts)}
$('#rdBody').addEventListener('click',e=>{
  if(e.target.closest('#rdPrev'))return openCh(ch-1);
  if(e.target.closest('#rdNextCh'))return openCh(ch+1);
  if(e.target.closest('#rdToc'))return closeReader();
  if(e.target.closest('#rdDiv'))return partMenu();
  if(!cur)return;const p=cur.parts[ch];
  if(e.target.closest('#rdNoteAll'))return noteAll(cur,p);
  if(e.target.closest('#rdAf'))return afterWrite(cur,p);
  if(e.target.closest('#rdAfRe')){const v=prompt('想跟他说的');if(!v||!v.trim())return;
    (p.after=arr(p.after)).push({who:'me',text:v.trim(),t:Date.now()});save();refreshIf(p);return afterWrite(cur,p)}
  if(hadSel||Date.now()-selEnd<500)return;
  const mk=e.target.closest('mark.hl');
  if(mk){const pe=mk.closest('[data-p]');if(pe)return markMenu(+pe.dataset.p,+mk.dataset.o)}
  const pe=e.target.closest('[data-p]'),ne=e.target.closest('[data-np]');
  if(pe)return paraMenu(+pe.dataset.p);
  if(ne)return paraMenu(+ne.dataset.np)});

/* ---------- 接着写 / 编辑 ---------- */
function openPart(i){editIdx=i;const u=book?U(book):'段';
  $('#lbPartT').textContent=i==null?'接着写一段':`编辑第 ${i+1} ${u}`;
  $('#lbPartText').value=i==null?'':book.parts[i].text;openModal('lbPart')}
$('#lbPartSave').onclick=async()=>{
  const text=$('#lbPartText').value.trim();if(!text)return toast('还没有粘贴内容');
  if(!book)return;
  if(editIdx==null)book.parts.push({id:uid(),text,t:Date.now()});
  else{const pt=book.parts[editIdx];if(pt.text!==text)pt.marks=[];pt.text=text}
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
  const B=[...DATA.library].filter(s=>!s.src).sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
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
  s.sx=true;
  const now=Date.now();
  if(impWay==='one')s.parts.push({id:uid(),text:texts.join('\n\n'),t:now});
  else texts.forEach((t,k)=>s.parts.push({id:uid(),text:t,t:now+k}));
  await save();closeModal('lbImp');render();toast(`收进「${s.title}」了 ♡`)};
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('#lbImp').classList.remove('show')});

/* ---------- 聊天时，他知道你在读什么 ---------- */
HOOKS.context.push(()=>{
  const s=[...DATA.library].filter(x=>!x.sx&&x.readAt&&Date.now()-x.readAt<2*864e5&&x.parts.length).sort((a,b)=>b.readAt-a.readAt)[0];
  if(!s)return '';const p=getPos(s.id),c=p?Math.min(p.c,s.parts.length-1):0,pt=s.parts[c];
  const q=pt?quotes(pt,'me').slice(-2):[];
  return `【她在读】她最近在图书馆读${s.src?'':'你们一起写的'}《${s.title}》，读到第 ${c+1} ${U(s)}${pt?.title?'「'+pt.title+'」':''}。${q.length?'她划了：'+q.map(x=>'「'+x.slice(0,50)+'」').join('、')+'。':''}可以自然地聊起，不用每句都提。`});

HOOKS.ready.push(render);
HOOKS.page.push(n=>{
  if(n!=='secret')$('#lbImp').classList.remove('show');
  if(n==='library'){if(book)renderDetail();else render()}
  else{if(cur){$('#reader').classList.remove('show');$('#rdHl').classList.remove('show');cur=null}if(book)showShelf()}});
})();
