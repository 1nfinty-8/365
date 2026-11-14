/* ===== 365 · infinity.js · 关于他：他的记忆（水面） ===== */
(()=>{
if(!Array.isArray(DATA.frag))DATA.frag=[];
Object.assign(DEFAULT,{fragEra:''});
const save=()=>saveData('frag');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ERAS=['小时候','少年时','大学','工作以后','遇见你以后'];
const POOL=['小时候','小时候','少年时','少年时','大学','大学','工作以后','遇见你以后'];
const LEN=[[.3,'短一点：一个片段，80 到 160 字，一两段就够。'],[.45,'中等：300 到 500 字，分三到五段。'],[.25,'长一点：600 到 1000 字，五段以上，像一篇完整的短篇散文，有前因后果。']];
const pickLen=()=>{let r=Math.random();for(const[p,s]of LEN){if((r-=p)<0)return s}return LEN[1][1]};
const pw=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p data-w="1">${esc(s)}</p>`).join('');
let page='',vc=null,ansC=null,busy=false,typing=null;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={count:()=>DATA.frag.length,busy:()=>busy,pick:()=>pick(),list:()=>showList()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-frag{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
#page-cards{padding:0;overflow:hidden;--fen:"Cormorant Garamond",var(--en)}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}

/* ===== 水面 ===== */
#ifView{position:absolute;inset:0;z-index:20;display:none;overflow:hidden;
  background:rgba(236,240,247,.42);-webkit-backdrop-filter:blur(22px) saturate(1.3);backdrop-filter:blur(22px) saturate(1.3)}
html.dk #ifView{background:rgba(18,22,32,.5)}
#ifView.show{display:block;animation:mfFade .5s ease}
@keyframes mfFade{from{opacity:0}}
#mfWater{position:absolute;pointer-events:none;z-index:0}
#mfLayer{position:absolute;inset:0;z-index:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  display:flex;flex-direction:column;padding:calc(var(--st) + 64px) 30px calc(var(--sb) + 34px)}
.mf-x{position:absolute;z-index:3;left:12px;top:calc(var(--st) + 4px)}
.mf-box{margin:auto 0;width:100%;max-width:440px;align-self:center}

/* 浮在水上的玻璃牌 */
.mf-seal{position:relative;width:132px;height:204px;margin:0 auto 28px;border-radius:14px;overflow:hidden;
  background:linear-gradient(160deg,rgba(255,255,255,.42),rgba(255,255,255,.08) 50%,rgba(255,255,255,.22));
  border:1px solid rgba(255,255,255,.85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  box-shadow:inset 0 1px 1px #fff,0 20px 40px rgba(70,90,130,.16);
  transition:opacity .7s,transform .8s cubic-bezier(.4,0,.2,1),filter .8s}
html.dk .mf-seal{background:linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.03) 50%,rgba(255,255,255,.08));border-color:rgba(255,255,255,.35)}
.mf-seal::after{content:"";position:absolute;top:-30%;left:-80%;width:60%;height:160%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55) 50%,transparent);transform:rotate(14deg);animation:mfSheen 2.8s ease-in-out infinite}
@keyframes mfSheen{0%{left:-80%}60%,100%{left:130%}}
.mf-seal.sink{opacity:0;transform:translateY(34px) scale(.84);filter:blur(8px)}
.mf-wait{text-align:center;font-size:12px;letter-spacing:8px;color:var(--ink);animation:mfPulse 2.4s ease-in-out infinite;transition:opacity .6s}
.mf-hint{text-align:center;font-size:11px;letter-spacing:4px;color:var(--ink);opacity:.35;margin-top:10px;transition:opacity .6s}
@keyframes mfPulse{50%{opacity:.35}}

/* 记忆：直接写在水面上 */
.mf-head{position:relative;text-align:center;padding-top:122px}
.mf-age{position:absolute;left:0;right:0;top:-26px;text-align:center;pointer-events:none;
  font-family:var(--fen);font-weight:300;font-size:210px;line-height:1;letter-spacing:-.04em;font-variant-numeric:lining-nums;
  color:rgba(255,255,255,.72);text-shadow:0 0 34px rgba(255,255,255,.95),0 1px 0 rgba(120,140,175,.16)}
html.dk .mf-age{color:rgba(255,255,255,.1);text-shadow:0 0 34px rgba(170,195,255,.25)}
.mf-k{position:relative;font-size:11px;letter-spacing:6px;color:var(--ink);opacity:.5}
.mf-tt{position:relative;font-family:var(--ti);font-weight:500;font-size:24px;letter-spacing:6px;line-height:1.5;margin:14px 0 10px;color:var(--ink)}
.mf-m{position:relative;font-family:var(--fen),var(--ti);font-size:14.5px;letter-spacing:2px;color:var(--ink);opacity:.55}
.mf-m i{font-style:normal;margin:0 8px;opacity:.6}
.mf-head.in>*{animation:mfRise 1.2s ease both}
.mf-head.in .mf-age{animation-duration:2.4s}
.mf-head.in .mf-tt{animation-delay:.25s}
.mf-head.in .mf-m{animation-delay:.45s}
@keyframes mfRise{from{opacity:0;filter:blur(10px)}}
.mf-rule{width:1px;height:36px;margin:28px auto;background:linear-gradient(transparent,var(--ink),transparent);opacity:.3}
.mf-tx p{font-family:var(--ti);font-size:16px;line-height:2.1;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 1em;color:var(--ink);text-shadow:0 1px 0 rgba(255,255,255,.35)}
html.dk .mf-tx p{text-shadow:none}
.mf-tx p:last-child{margin:0}
.mf-tx span{opacity:0;transition:opacity .7s ease}
.mf-tx span.on{opacity:1}
.mf-th{display:flex;flex-direction:column;gap:16px;margin-top:34px}
.mf-say{font-family:var(--cn);font-size:14.5px;line-height:1.9;color:var(--ink);white-space:pre-wrap;word-break:break-word}
.mf-say small{display:block;font-size:11px;letter-spacing:3px;opacity:.45;margin-bottom:2px}
.mf-say.me{text-align:right;opacity:.75}
.mf-ft{display:flex;gap:10px;justify-content:center;margin-top:36px;transition:opacity .8s}
.mf-ft.hide{opacity:0;pointer-events:none}
.mf-ft button{padding:9px 22px;border-radius:99px;font-size:13px;letter-spacing:3px;color:var(--ink);
  background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
html.dk .mf-ft button{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cards">
  <iframe id="ifFrame" title="他的记忆" allowtransparency="true"></iframe>
  <div class="if-top"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button>
    <button class="iconbtn glass" id="ifMenu" style="letter-spacing:1px">···</button></div>
  <div id="ifView"><canvas id="mfWater"></canvas><div id="mfLayer"></div><button class="iconbtn glass mf-x" data-vx aria-label="收好">${BACK}</button></div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="ifAns"><div class="mbox">
  <h3>问问<span class="hisName">陆择</span></h3>
  <div id="ifACard" style="text-align:center;font-family:var(--ti);font-size:15px;letter-spacing:2px;margin:4px 0 2px;color:var(--sys-sub)"></div>
  <label class="f"><span>想问他的</span><textarea class="short" id="ifAText" placeholder="后来呢？"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifAns">取消</button><button class="pill" id="ifASave">问他</button></div>
</div></div>`);

/* ================= 水波 ================= */
const WV={q:6,w:0,h:0,a:null,b:null,img:null,g:null,raf:0,amb:0};
const VIEW=()=>$('#ifView');
function wvSize(){const v=VIEW(),cv=$('#mfWater'),q=WV.q;
  const w=Math.ceil((v.clientWidth||innerWidth)/q)+2,h=Math.ceil((v.clientHeight||innerHeight)/q)+2;
  if(w===WV.w&&h===WV.h)return;
  Object.assign(WV,{w,h,a:new Float32Array(w*h),b:new Float32Array(w*h)});
  cv.width=w;cv.height=h;cv.style.width=w*q+'px';cv.style.height=h*q+'px';cv.style.left=cv.style.top=-q+'px';
  WV.g=cv.getContext('2d');WV.img=WV.g.createImageData(w,h)}
function drop(px,py,r,s){if(!WV.a)return;const q=WV.q,x0=px/q+1,y0=py/q+1,R=Math.max(1.5,r/q);
  const x1=Math.max(1,Math.floor(x0-R)),x2=Math.min(WV.w-2,Math.ceil(x0+R)),y1=Math.max(1,Math.floor(y0-R)),y2=Math.min(WV.h-2,Math.ceil(y0+R));
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const d=Math.hypot(x-x0,y-y0);if(d<R)WV.a[y*WV.w+x]+=s*(Math.cos(d/R*Math.PI)+1)/2}}
function wvStep(){const{w,h,a,b}=WV;
  for(let y=1;y<h-1;y++){let i=y*w+1;for(let x=1;x<w-1;x++,i++)b[i]=((a[i-1]+a[i+1]+a[i-w]+a[i+w])*.5-b[i])*.984}
  WV.a=b;WV.b=a}
function wvDraw(){const{w,h,a,img,g}=WV,d=img.data,dk=document.documentElement.classList.contains('dk');
  for(let y=1;y<h-1;y++){let i=y*w+1;for(let x=1;x<w-1;x++,i++){
    const l=(a[i-1]-a[i+1])*.7+(a[i-w]-a[i+w]),o=i*4;
    if(l>0){d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(dk?120:210,l*14)}
    else{d[o]=70;d[o+1]=92;d[o+2]=130;d[o+3]=Math.min(dk?130:80,-l*7)}}}
  g.putImageData(img,0,0)}
function wobble(){const vr=VIEW().getBoundingClientRect(),els=[...$$('#ifView [data-w]')],R=els.map(e=>e.getBoundingClientRect());
  const cl=v=>Math.max(-7,Math.min(7,v));
  els.forEach((e,k)=>{const r=R[k],x=Math.round((r.left+r.width/2-vr.left)/WV.q)+1,y=Math.round((r.top+Math.min(r.height,220)/2-vr.top)/WV.q)+1;
    if(x<1||y<1||x>=WV.w-1||y>=WV.h-1){e.style.transform='';return}
    const i=y*WV.w+x,m=+e.dataset.w||1;
    e.style.transform=`translate(${cl((WV.a[i-1]-WV.a[i+1])*1.2*m).toFixed(2)}px,${cl(WV.a[i]*.5*m).toFixed(2)}px)`})}
function wvLoop(){if(!VIEW().classList.contains('show')){WV.raf=0;return}
  const now=performance.now(),v=VIEW();
  if(now>WV.amb){
    if(vc&&vc._wait){WV.amb=now+1100;const s=$('#mfSeal');if(s){const r=s.getBoundingClientRect(),vr=v.getBoundingClientRect();drop(r.left+r.width/2-vr.left,r.top+r.height/2-vr.top,46,7)}}
    else{WV.amb=now+2400+Math.random()*1600;drop(Math.random()*v.clientWidth,Math.random()*v.clientHeight,28,3)}}
  wvStep();wvDraw();wobble();WV.raf=requestAnimationFrame(wvLoop)}
function wvStart(){wvSize();if(!WV.raf)WV.raf=requestAnimationFrame(wvLoop)}
addEventListener('resize',()=>{if(VIEW().classList.contains('show'))wvSize()});
/* 手指点水、拨水 */
let pd=null;
const at=(x,y,r,s)=>{const vr=VIEW().getBoundingClientRect();drop(x-vr.left,y-vr.top,r,s)};
VIEW().addEventListener('touchstart',e=>{const t=e.touches[0];pd={x:t.clientX,y:t.clientY};at(t.clientX,t.clientY,34,22)},{passive:true});
VIEW().addEventListener('touchmove',e=>{if(!pd)return;const t=e.touches[0],d=Math.hypot(t.clientX-pd.x,t.clientY-pd.y);if(d<6)return;
  pd={x:t.clientX,y:t.clientY};at(t.clientX,t.clientY,22,Math.min(10,d*.4))},{passive:true});
VIEW().addEventListener('touchend',()=>pd=null,{passive:true});
VIEW().addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')at(e.clientX,e.clientY,34,22)});

/* ---------- 他想起一段 ---------- */
const SCENE='这是你们的小窝「365」里「关于他」的「他的记忆」：一个玻璃文件夹，里面封着你自己的过去。';
function parse(t){t=String(t).replace(/```\w*/g,'');const i=t.search(/\n\s*-{3,}\s*\n/);if(i<0)throw new SyntaxError('fmt');
  const head=t.slice(0,i),story=t.slice(i).replace(/^\s*-{3,}\s*/,'').replace(/\*\*|__|^#+\s*/gm,'').trim();
  const g=k=>((head.match(new RegExp(k+'\\s*[:：]\\s*(.+)'))||[])[1]||'').trim();
  return {era:g('阶段'),year:(g('年份').match(/\d{4}/)||[''])[0],age:parseInt(g('年龄'))||'',place:g('地点'),title:g('标题'),sum:g('概括'),story}}
async function pick(){
  if(busy)return;busy=true;fire();
  const f={id:uid(),t:Date.now(),thread:[],_wait:true};
  setTimeout(()=>{if(f._wait&&page==='cards')open(f,'wait')},450);
  try{
    const era=S.fragEra||POOL[Math.floor(Math.random()*POOL.length)];
    const old=DATA.frag.slice(-40).map(x=>`- ${x.era||''}·${x.title}：${x.sum||''}`).join('\n');
    const raw=await callAI(sceneSystem(SCENE),[{role:'user',text:`请以${S.hisName}的身份，写一段你自己人生里的回忆：你${era}的事。
这是你自己的过去，像写给自己的回忆录，不是讲给她听的话：
- ${era==='遇见你以后'?'这一段是遇见她以后的事，可以写到她，用「她」称呼，但重点是你自己当时的处境、别的人和事。':'不要对她说话，不要出现「你」，不要提到她，结尾也不要拐到她身上。'}
- 要有具体的人：家人、同学、老师、朋友、同事、对手、陌生人，写出名字或称呼，可以有他们说过的原话。
- 要有事情的经过：发生了什么，后来怎么样了。可以是好事，也可以是遗憾、丢脸、争吵、离别、没说出口的话。
- 不要总结道理，不要升华，不要写「那一刻我才明白」「从那以后我学会了」。在一个画面或一句话上停下就好。
- 和你的人设、家世、经历对得上。${old?'\n- 你以前想起过这些，不要重复，也不要和它们矛盾：\n'+old:''}
这次的篇幅：${pickLen()}
用第一人称，自然分段，不要 emoji，不要 markdown。
按下面的格式输出：前六行每行一项，然后单独一行三个短横，再写正文。
阶段：${era}
年份：四位数字
年龄：当时几岁，只写数字
地点：两到八个字
标题：四到十二个字，像一篇散文的题目，平实，不要煽情
概括：三十字以内
---
正文`}]);
    const j=parse(raw);if(!j.story||!j.title)throw new SyntaxError('empty');
    Object.assign(f,{era:ERAS.includes(j.era)?j.era:era,year:j.year,age:(j.age>0&&j.age<120)?j.age:'',
      place:j.place.slice(0,10),title:j.title.slice(0,16),story:j.story,sum:j.sum.slice(0,40)});
    delete f._wait;DATA.frag.push(f);await save();card();
    if(page==='cards'){
      const s=$('#mfSeal');
      if(vc===f&&s){const r=s.getBoundingClientRect(),vr=VIEW().getBoundingClientRect();
        s.classList.add('sink');$$('.mf-wait,.mf-hint').forEach(x=>x.style.opacity=0);
        drop(r.left+r.width/2-vr.left,r.top+r.height/2-vr.top,70,30);
        setTimeout(()=>{if(vc===f)vRender('new')},800)}
      else open(f,'new')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)vRender('full',true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`她刚看了你${f.era}的一段回忆「${f.title}」（${f.year?f.year+'年，':''}${f.age?f.age+'岁，':''}${f.place||''}）：\n「${String(f.story).slice(0,1500)}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份回她最新问的，细节要和这段回忆对得上，可以多讲一点当时的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)vRender('full',true)}

/* ---------- 一个字一个字浮上来 ---------- */
function typeOut(f){const box=$('#mfTx'),L=$('#mfLayer');if(!box)return;
  box.innerHTML=String(f.story).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(p=>`<p data-w="1">${[...p].map(c=>`<span>${esc(c)}</span>`).join('')}</p>`).join('');
  const SP=[...box.querySelectorAll('span')],n=SP.length,gap=Math.max(16,Math.min(48,7000/n));
  let i=0,free=false;L.addEventListener('touchstart',()=>free=true,{once:true,passive:true});
  clearInterval(typing);
  typing=setInterval(()=>{
    if(vc!==f){clearInterval(typing);typing=null;return}
    SP[i++].classList.add('on');
    if(i%14===0||i>=n){const r=SP[i-1].getBoundingClientRect(),vr=VIEW().getBoundingClientRect();
      drop(r.left-vr.left,r.top-vr.top+12,22,5);
      if(!free&&r.bottom>vr.bottom-150)L.scrollBy({top:r.bottom-(vr.bottom-150),behavior:'smooth'})}
    if(i>=n){clearInterval(typing);typing=null;$('.mf-ft')?.classList.remove('hide')}},gap)}

/* ---------- 打开 ---------- */
function open(f,mode){vc=f;VIEW().classList.add('show');wvStart();vRender(mode)}
function view(f){if(f)open(f,'open')}
function closeView(){VIEW().classList.remove('show');vc=null;clearInterval(typing);typing=null}
function vRender(mode,bottom){const f=vc;if(!f)return;const H=esc(S.hisName),L=$('#mfLayer');
  if(f._wait){L.innerHTML=`<div class="mf-box"><div data-w="1.6"><div class="mf-seal" id="mfSeal"></div></div><p class="mf-wait">${H}在想</p><p class="mf-hint">碰一碰水面</p></div>`;return}
  const tp=mode==='new',an=tp||mode==='open',no=DATA.frag.indexOf(f)+1,b=BUSY.has(f);
  const meta=[f.year,f.place,f.age?f.age+' 岁':''].filter(Boolean).map(esc).join('<i>·</i>');
  const th=(f.thread||[]).map(x=>`<div class="mf-say ${x.who==='me'?'me':'him'}" data-w="1"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(b?`<div class="mf-say him"><small>${H}</small>在想怎么跟你说…</div>`:'');
  L.innerHTML=`<div class="mf-box">
    <div class="mf-head${an?' in':''}">${f.age?`<div class="mf-age" data-w="2.4">${f.age}</div>`:''}
      <div class="mf-k" data-w="1">${esc(f.era||'往事')}　·　No. ${no}</div>
      <h3 class="mf-tt" data-w="1.3">${esc(f.title)}</h3>
      ${meta?`<div class="mf-m" data-w="1">${meta}</div>`:''}</div>
    <div class="mf-rule"></div>
    <div class="mf-tx" id="mfTx">${tp?'':pw(f.story)}</div>
    ${th?`<div class="mf-th">${th}</div>`:''}
    <div class="mf-ft${tp?' hide':''}">${b?'':'<button data-va>问他</button>'}<button data-vm>···</button><button data-vx>收好</button></div></div>`;
  if(tp){L.scrollTop=0;typeOut(f)}
  else requestAnimationFrame(()=>{L.scrollTop=bottom?L.scrollHeight:0})}
VIEW().addEventListener('click',e=>{const f=vc;
  if(e.target.closest('[data-vx]'))return closeView();
  if(!f||f._wait)return;
  if(e.target.closest('[data-va]')){ansC=f;$('#ifACard').textContent=f.title;$('#ifAText').value='';openModal('ifAns');return}
  if(e.target.closest('[data-vm]'))sheet([
    ['复制这段',()=>navigator.clipboard?.writeText(`${f.title}\n\n${f.story}`).then(()=>toast('已复制'))],
    ['删除这段记忆',async()=>{if(!confirm('删除这段记忆？他也会忘掉这件事。'))return;DATA.frag=DATA.frag.filter(x=>x!==f);await save();closeView();fire();card()}]])});
$('#ifASave').onclick=async()=>{const f=ansC,v=$('#ifAText').value.trim();if(!f)return;if(!v)return toast('写点什么吧');
  (f.thread=f.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('ifAns');if(vc===f)vRender('full',true);respond(f)};

/* ---------- 收好的记忆 / 想听哪一段 ---------- */
function showList(){const L=DATA.frag.slice().reverse().slice(0,50);if(!L.length)return toast('还没抽过');
  sheet(L.map(f=>[`No.${DATA.frag.indexOf(f)+1} · ${f.era||''} · ${f.title}`,()=>view(f)]))}
$('#ifMenu').onclick=()=>sheet([
  ['收好的记忆',showList],
  [`想听哪一段：${S.fragEra||'随便'}`,()=>sheet([['随便',()=>{S.fragEra='';saveSettings();toast('随他想起什么')}],
    ...ERAS.map(x=>[x,()=>{S.fragEra=x;saveSettings();toast(`下一张讲${x}的事`)}])])],
  ['全部清空',async()=>{if(!DATA.frag.length)return toast('本来就是空的');if(!confirm('清空所有记忆？他也会全部忘掉。'))return;
    DATA.frag=[];await save();fire();card();toast('清空了')}]]);

/* ---------- 「关于他」里的卡片；游戏页里藏起来 ---------- */
function card(){const g=$('#himGrid');if(!g)return;let c=$('#himGrid [data-go="cards"]');
  if(!c){g.insertAdjacentHTML('beforeend','<button class="card glass hm-frag" data-go="cards"><div class="cn">他的记忆</div><div class="ce">memories</div><div class="hm-now" id="mfNow"></div></button>');c=$('#himGrid [data-go="cards"]')}
  const t=$('#himGrid [data-go="trip"]');if(t&&t.nextElementSibling!==c)t.after(c);
  const n=$('#mfNow'),L=DATA.frag.at(-1);if(n)n.textContent=L?`${DATA.frag.length} 段 · ${L.title}`:'抽一张，听他讲一段过去'}
function hideGame(){$$('#page-game [data-go]').forEach(x=>{if(x.dataset.go==='cards'||/小卡片|Infinity/.test(x.textContent))x.style.display='none'})}
$$('#moreGrid [data-go="infinity"]').forEach(x=>x.remove());

/* ---------- 旧的真心话大冒险、塔罗：清掉一次 ---------- */
async function purge(){if(localStorage.getItem('365-purge1'))return;
  try{DATA.cards=[];await saveData('cards');await DB.del('tarot');delete DATA.tarot;localStorage.setItem('365-purge1','1')}catch(e){}}

/* ---------- 收进他的记忆：想起过的事，他一直记得 ---------- */
HOOKS.persona.push(()=>{const L=DATA.frag.filter(f=>f.title);if(!L.length)return '';
  return '【你自己的往事】这些是你的过去，她都看过。要一直记得，细节不能说错，可以在聊天里自然地提起：\n'
    +L.slice(-30).map(f=>`- ${f.era||''}${f.year?'，'+f.year:''}${f.age?'，'+f.age+'岁':''}${f.place?'，'+f.place:''}：${f.title}——${f.sum||String(f.story).slice(0,40)}`).join('\n')});

hideGame();
HOOKS.ready.push(async()=>{if(!Array.isArray(DATA.frag))DATA.frag=[];await purge();hideGame();card();const f=$('#ifFrame');if(f&&!f.src)f.src='infinity.html'});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('ifb',n==='cards');
  if(n==='game')setTimeout(hideGame,0);
  if(n==='him')setTimeout(card,0);
  if(n==='cards'){const f=$('#ifFrame');if(!f.src)f.src='infinity.html';else fire()}
  else closeView()});
})();
