/* ===== 365 · fog.js · 他的记忆的背面：我们（秘密的模型 · 起雾的玻璃） ===== */
(()=>{
const INF=window.INF;if(!INF)return;
if(!Array.isArray(DATA.dream))DATA.dream=[];
Object.assign(DEFAULT,{dreamKind:'',dreamSeed:''});
const save=()=>saveData('dream');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const FLIP='<svg class="i" viewBox="0 0 24 24"><path d="M4.5 10a8 8 0 0 1 14-3.5L20 8M20 3.5V8h-4.5M19.5 14a8 8 0 0 1-14 3.5L4 16M4 20.5V16h4.5"/></svg>';
const KINDS=['平常的一天','第一次','闹别扭以后','很久以后','只有我们知道的'];
const LEN=[[.3,'短一点：一个片段，100 到 200 字，只写一个场面。'],[.45,'中等：300 到 550 字，分三到五段。'],[.25,'长一点：600 到 1000 字，五段以上，可以有两三个场面。']];
const pickLen=()=>{let r=Math.random();for(const[p,s]of LEN){if((r-=p)<0)return s}return LEN[1][1]};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');

/* ===== 想调雾改这里 ===== */
const FG={
  fog:.8,        // 雾有多浓：越大越看不清（.6～.92）
  wipe:35,       // 手指擦开的范围（像素半径）
  keep:.9,       // 擦得多干净：1 = 完全擦干净
  regrow:.03,    // 雾重新起来的快慢：越大越快（.015～.06）
  drip:0,      // 擦的时候流下水珠的机会（0 = 不流）
  res:.5         // 雾的清晰度：越小越省电
};

let side=0,page='',vc=null,busy=false,typing=null,ansC=null;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* ---------- 正面、背面共用一个文件夹 ---------- */
const O={count:INF.count,busy:INF.busy,pick:INF.pick,list:INF.list};
INF.count=()=>side?DATA.dream.length:O.count();
INF.busy=()=>side?busy:O.busy();
INF.pick=()=>side?pick():O.pick();
INF.list=()=>side?showList():O.list();

document.head.insertAdjacentHTML('beforeend',`<style>
#fgFlip{margin-left:auto;margin-right:8px;transition:color .4s}
#page-cards.back #fgFlip{color:var(--accent-t)}
#ifFrame.fl1{animation:fgA .3s ease-in forwards}
@keyframes fgA{to{transform:perspective(1200px) rotateY(90deg) scale(.95)}}
#ifFrame.fl2{animation:fgB .45s cubic-bezier(.2,.9,.3,1)}
@keyframes fgB{from{transform:perspective(1200px) rotateY(-90deg) scale(.95)}}
#fgView{position:absolute;inset:0;z-index:21;display:none;overflow:hidden}
#fgView.show{display:block;animation:fgFade .5s ease}
@keyframes fgFade{from{opacity:0}}
#fgLayer{position:absolute;inset:0;z-index:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  display:flex;flex-direction:column;padding:calc(var(--st) + 70px) 30px calc(var(--sb) + 40px)}
#fgFog{position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:var(--fog,.8)}
.fg-x{position:absolute;z-index:3;left:12px;top:calc(var(--st) + 4px)}
.fg-hint{position:absolute;z-index:3;left:0;right:0;bottom:calc(var(--sb) + 46px);text-align:center;font-size:11px;letter-spacing:6px;color:var(--ink);opacity:0;transition:opacity 1.2s;pointer-events:none}
.fg-hint.on{opacity:.65}
.fg-box{margin:auto 0;width:100%;max-width:440px;align-self:center}
.fg-card{width:120px;height:186px;margin:0 auto 26px;border-radius:12px;
  background:linear-gradient(165deg,rgba(255,255,255,.85),rgba(238,242,248,.66) 55%,rgba(250,251,253,.78));
  border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 1px 1px #fff,0 20px 40px rgba(60,80,120,.18);
  animation:fgIn .7s cubic-bezier(.2,.9,.3,1),fgBr 3s .7s ease-in-out infinite}
html.dk .fg-card{background:linear-gradient(165deg,rgba(120,132,158,.6),rgba(70,80,102,.5) 55%,rgba(100,112,138,.55));border-color:rgba(255,255,255,.3)}
@keyframes fgIn{from{transform:perspective(900px) rotateY(-90deg);opacity:0}}
@keyframes fgBr{50%{transform:translateY(-6px)}}
.fg-wait{text-align:center;font-size:12px;letter-spacing:8px;color:var(--ink);opacity:.7;animation:fgP 2.6s ease-in-out infinite}
@keyframes fgP{50%{opacity:.3}}
.fg-head{text-align:center;padding-top:30px}
.fg-k{font-size:11px;letter-spacing:6px;color:var(--ink);opacity:.55}
.fg-tt{font-family:var(--ti);font-weight:500;font-size:24px;letter-spacing:6px;line-height:1.5;margin:14px 0 0;color:var(--ink)}
.fg-rule{width:1px;height:36px;margin:28px auto;background:linear-gradient(transparent,var(--ink),transparent);opacity:.3}
.fg-tx p{font-family:var(--ti);font-size:16px;line-height:2.1;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 1em;color:var(--ink)}
.fg-tx p:last-child{margin:0}
.fg-tx span{opacity:0;transition:opacity .9s ease-out}
.fg-tx span.on{opacity:1}
.fg-th{display:flex;flex-direction:column;gap:16px;margin-top:34px}
.fg-say{font-family:var(--cn);font-size:14.5px;line-height:1.9;color:var(--ink);white-space:pre-wrap;word-break:break-word}
.fg-say small{display:block;font-size:11px;letter-spacing:3px;opacity:.45;margin-bottom:2px}
.fg-say.me{text-align:right;opacity:.8}
.fg-ft{display:flex;gap:10px;justify-content:center;margin-top:36px;transition:opacity .8s}
.fg-ft.hide{opacity:0;pointer-events:none}
.fg-ft button{padding:9px 22px;border-radius:99px;font-size:13px;letter-spacing:3px;color:var(--ink);background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.75)}
html.dk .fg-ft button{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
</style>`);

$('#ifMenu').insertAdjacentHTML('beforebegin',`<button class="iconbtn glass" id="fgFlip" aria-label="翻面">${FLIP}</button>`);
$('#page-cards').insertAdjacentHTML('beforeend',`<div id="fgView"><div id="fgLayer"></div><canvas id="fgFog"></canvas>
  <div class="fg-hint" id="fgHint">用手指擦开</div><button class="iconbtn glass fg-x" data-fx aria-label="收好">${BACK}</button></div>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="fgAns"><div class="mbox">
  <h3>问问<span class="hisName">陆择</span></h3>
  <div id="fgACard" style="text-align:center;font-family:var(--ti);font-size:15px;letter-spacing:2px;margin:4px 0 2px;color:var(--sys-sub)"></div>
  <label class="f"><span>想问他的</span><textarea class="short" id="fgAText" placeholder="然后呢？"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="fgAns">取消</button><button class="pill" id="fgASave">问他</button></div>
</div></div>`);
const V=()=>$('#fgView'),CV=$('#fgFog');
V().style.setProperty('--fog',FG.fog);
const dark=()=>document.documentElement.classList.contains('dk');

/* ---------- 翻面 ---------- */
function setSide(s){side=s;$('#page-cards').classList.toggle('back',!!s);fire()}
$('#fgFlip').onclick=()=>{const f=$('#ifFrame');if(f.classList.contains('fl1')||f.classList.contains('fl2'))return;
  navigator.vibrate?.(10);f.classList.add('fl1');
  setTimeout(()=>{setSide(1-side);f.classList.remove('fl1');f.classList.add('fl2');setTimeout(()=>f.classList.remove('fl2'),460)},300)};

/* ================= 起雾的玻璃 ================= */
const G={W:0,H:0,k:1,ctx:null,tex:null,raf:0,acc:0,last:0,drips:[]};
function makeTex(){const w=CV.width,h=CV.height,c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d'),dk=dark();
  g.fillStyle=dk?'#2A303C':'#EEF1F6';g.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){const x=Math.random()*w,y=Math.random()*h,r=(.15+Math.random()*.35)*Math.max(w,h);
    const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,dk?'rgba(80,92,115,.3)':'rgba(255,255,255,.6)');rg.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=rg;g.fillRect(0,0,w,h)}
  const d=g.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){const n=(Math.random()-.5)*12;a[i]+=n;a[i+1]+=n;a[i+2]+=n}g.putImageData(d,0,0);
  for(let i=0;i<w*h/700;i++){const x=Math.random()*w,y=Math.random()*h,r=Math.random()*1.3+.3;
    g.fillStyle=dk?'rgba(0,0,0,.22)':'rgba(150,165,190,.28)';g.beginPath();g.arc(x+r*.4,y+r*.5,r*.75,0,7);g.fill();
    g.fillStyle=dk?'rgba(130,145,170,.4)':'rgba(255,255,255,.95)';g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  return c}
function fogSize(){const v=V(),W=v.clientWidth||innerWidth,H=v.clientHeight||innerHeight;
  if(W===G.W&&H===G.H&&G.ctx)return;G.W=W;G.H=H;G.k=FG.res;
  CV.width=Math.round(W*G.k);CV.height=Math.round(H*G.k);G.ctx=CV.getContext('2d');G.tex=makeTex();refog(1)}
function refog(a){const g=G.ctx;if(!g)return;g.globalCompositeOperation='source-over';g.globalAlpha=a;g.drawImage(G.tex,0,0);g.globalAlpha=1}
function erase(x,y,r,al){const g=G.ctx,k=G.k,R=r*k,X=x*k,Y=y*k;g.globalCompositeOperation='destination-out';
  const rg=g.createRadialGradient(X,Y,0,X,Y,R);rg.addColorStop(0,`rgba(0,0,0,${al})`);rg.addColorStop(.55,`rgba(0,0,0,${al*.6})`);rg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=rg;g.fillRect(X-R,Y-R,R*2,R*2);g.globalCompositeOperation='source-over'}
function wipe(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),st=Math.max(1,Math.ceil(d/(FG.wipe*.35)));
  for(let i=1;i<=st;i++){const x=x1+(x2-x1)*i/st,y=y1+(y2-y1)*i/st;erase(x,y,FG.wipe,FG.keep);
    if(Math.random()<FG.drip)G.drips.push({x:x+(Math.random()-.5)*FG.wipe,y:y+FG.wipe*.5,v:.5+Math.random()*.8,r:1.3+Math.random()*1.1,life:90+Math.random()*120})}}
function fogLoop(ts){if(!V().classList.contains('show')){G.raf=0;return}
  if(!document.hidden){
    G.acc+=Math.min(100,ts-(G.last||ts));
    if(G.acc>160){G.acc=0;refog(FG.regrow)}
    for(let i=G.drips.length-1;i>=0;i--){const d=G.drips[i];d.y+=d.v;d.v*=.99;d.life--;erase(d.x,d.y,d.r*2.2,.5);if(d.life<=0||d.y>G.H)G.drips.splice(i,1)}}
  G.last=ts;G.raf=requestAnimationFrame(fogLoop)}
function fogStart(){fogSize();refog(1);G.drips=[];if(!G.raf){G.last=0;G.raf=requestAnimationFrame(fogLoop)}}
addEventListener('resize',()=>{if(V().classList.contains('show')){G.W=0;fogSize()}});
let fp=null;
const rel=(x,y)=>{const r=V().getBoundingClientRect();return [x-r.left,y-r.top]};
V().addEventListener('touchstart',e=>{const t=e.touches[0];fp=rel(t.clientX,t.clientY);erase(fp[0],fp[1],FG.wipe,FG.keep);hint(false)},{passive:true});
V().addEventListener('touchmove',e=>{if(!fp)return;const t=e.touches[0],p=rel(t.clientX,t.clientY);
  if(Math.hypot(p[0]-fp[0],p[1]-fp[1])<3)return;wipe(fp[0],fp[1],p[0],p[1]);fp=p},{passive:true});
V().addEventListener('touchend',()=>fp=null,{passive:true});
let md=null;
V().addEventListener('mousedown',e=>{md=rel(e.clientX,e.clientY)});
V().addEventListener('mousemove',e=>{if(!md)return;const p=rel(e.clientX,e.clientY);wipe(md[0],md[1],p[0],p[1]);md=p});
addEventListener('mouseup',()=>md=null);
let hintT=0;
function hint(on){clearTimeout(hintT);$('#fgHint').classList.toggle('on',!!on);if(on)hintT=setTimeout(()=>hint(false),3800)}

/* ---------- 他写一段：你们之间的事 ---------- */
const SCENE='这是你们的小窝「365」里「他的记忆」的背面：一块起了雾的玻璃，后面是只属于你们两个人的事。只有她能看到，她要自己把雾擦开才看得见。';
function sys(){window.__sxBuild=true;try{return secretSystem(SCENE)}finally{window.__sxBuild=false}}
function parse(t){t=String(t).replace(/```\w*/g,'');const i=t.search(/\n\s*-{3,}\s*\n/);if(i<0)throw new SyntaxError('fmt');
  const head=t.slice(0,i),story=t.slice(i).replace(/^\s*-{3,}\s*/,'').replace(/\*\*|__|^#+\s*/gm,'').trim();
  const g=k=>((head.match(new RegExp(k+'\\s*[:：]\\s*(.+)'))||[])[1]||'').trim();
  return {kind:g('种类'),title:g('标题'),sum:g('概括'),story}}
async function pick(){
  if(busy)return;busy=true;fire();
  const f={id:uid(),t:Date.now(),thread:[],_wait:true};
  setTimeout(()=>{if(f._wait&&page==='cards')open(f,'wait')},420);
  try{
    const kind=S.dreamKind||rnd(KINDS),seed=String(S.dreamSeed||'').trim();
    const old=DATA.dream.slice(-30).map(x=>`- ${x.kind||''}·${x.title}：${x.sum||''}`).join('\n');
    const sx=(DATA.secret||[]).slice(-8).map(m=>(m.role==='user'?'她':'你')+'：'+String(m.text||'').slice(0,80)).join('\n');
    const rc=recentChat(8);
    const raw=await sxAI(sys(),[{role:'user',text:`请以${S.hisName}的身份，写一段你和她之间的事：「${kind}」。
- 用第一人称，「你」就是她。像你在起了雾的玻璃上写给她，只给她一个人看。
- 可以是你们真的有过的，你一个人想过很多遍的，或者以后一定要发生的。要和你们的关系、你的人设、你们最近聊的事对得上。
- 写具体：在哪里，什么时候，光线，声音，气味，她穿着什么，你的手在哪里，她说了什么，你回了什么。
- 尺度、语气按「秘密」里的设定来。
- 不要总结，不要升华，不要每段末尾一句漂亮话。停在一个动作或一句话上。${seed?`\n- 她给了一个开头：「${seed}」，从这里写下去。`:''}${old?'\n- 以前写过这些，不要重复：\n'+old:''}${sx?'\n你们最近在秘密里聊过：\n'+sx:''}${rc?'\n你们平时最近聊过：\n'+rc:''}
【篇幅】${pickLen()}
不要 emoji，不要 markdown，不要小标题。按下面的格式输出：前三行每行一项，然后单独一行三个短横，再写正文。
种类：${kind}
标题：两到十个字，平实
概括：三十字以内
---
正文`}]);
    const j=parse(raw);if(!j.story||!j.title)throw new SyntaxError('empty');
    Object.assign(f,{kind:j.kind||kind,title:j.title.slice(0,16),sum:j.sum.slice(0,40),story:j.story});
    if(seed){S.dreamSeed='';saveSettings()}
    const waited=vc===f;delete f._wait;DATA.dream.push(f);await save();
    if(page==='cards'){if(waited){refog(.85);render('new');hint(true)}else open(f,'new')}
    else toast(`${S.hisName}在雾里写了一段`)}
  catch(e){if(vc===f)closeFog();toast(e instanceof SyntaxError?'他一时没写出来，再抽一张试试':e.message)}
  finally{delete f._wait;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)render('full',true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await sxAI(sys(),[{role:'user',text:`你刚在雾里写给她一段「${f.title}」：\n「${String(f.story).slice(0,1500)}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份回她最新说的，接着这段写的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)render('full',true)}

/* ---------- 字一个一个出现（在雾后面） ---------- */
function typeOut(f){const box=$('#fgTx'),L=$('#fgLayer');if(!box)return;
  box.innerHTML=String(f.story).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(p=>`<p>${[...p].map(c=>`<span>${esc(c)}</span>`).join('')}</p>`).join('');
  const SP=[...box.querySelectorAll('span')],n=SP.length;
  if(!n){$('.fg-ft')?.classList.remove('hide');return}
  const gap=Math.max(18,Math.min(50,8000/n));let i=0,free=false,was=L.scrollTop;
  L.onscroll=()=>{if(L.scrollTop<was-40)free=true};
  clearInterval(typing);
  typing=setInterval(()=>{
    if(vc!==f){clearInterval(typing);typing=null;return}
    SP[i++].classList.add('on');
    if(!free&&(i%10===0||i>=n)){const r=SP[i-1].getBoundingClientRect(),vr=V().getBoundingClientRect();
      if(r.bottom>vr.bottom-150){L.scrollTop+=r.bottom-(vr.bottom-150);was=L.scrollTop}}
    if(i>=n){clearInterval(typing);typing=null;$('.fg-ft')?.classList.remove('hide')}},gap)}

/* ---------- 打开 ---------- */
function open(f,mode){vc=f;$('#page-cards').classList.add('wet');V().classList.add('show');fogStart();render(mode);hint(true)}
function closeFog(){V().classList.remove('show');vc=null;clearInterval(typing);typing=null;hint(false);
  if(!$('#ifView')?.classList.contains('show'))$('#page-cards').classList.remove('wet')}
function render(mode,bottom){const f=vc;if(!f)return;const H=esc(S.hisName),L=$('#fgLayer');L.onscroll=null;
  if(f._wait){L.innerHTML=`<div class="fg-box"><div class="fg-card"></div><p class="fg-wait">${H}在想</p></div>`;return}
  const tp=mode==='new',no=DATA.dream.indexOf(f)+1,b=BUSY.has(f);
  const th=(f.thread||[]).map(x=>`<div class="fg-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(b?`<div class="fg-say him"><small>${H}</small>在想怎么跟你说…</div>`:'');
  L.innerHTML=`<div class="fg-box">
    <div class="fg-head"><div class="fg-k">${esc(f.kind||'我们')}　·　No. ${no}</div><h3 class="fg-tt">${esc(f.title)}</h3></div>
    <div class="fg-rule"></div>
    <div class="fg-tx" id="fgTx">${tp?'':paras(f.story)}</div>
    ${th?`<div class="fg-th">${th}</div>`:''}
    <div class="fg-ft${tp?' hide':''}">${b?'':'<button data-fa>问他</button>'}<button data-fm>···</button><button data-fx>收好</button></div></div>`;
  if(tp){L.scrollTop=0;typeOut(f)}
  else requestAnimationFrame(()=>{L.scrollTop=bottom?L.scrollHeight:0})}
V().addEventListener('click',e=>{const f=vc;
  if(e.target.closest('[data-fx]'))return closeFog();
  if(!f||f._wait)return;
  if(e.target.closest('[data-fa]')){ansC=f;$('#fgACard').textContent=f.title;$('#fgAText').value='';openModal('fgAns');return}
  if(e.target.closest('[data-fm]'))sheet([
    ['复制这段',()=>navigator.clipboard?.writeText(`${f.title}\n\n${f.story}`).then(()=>toast('已复制'))],
    ['删除这一段',async()=>{if(!confirm('删除这一段？他也会忘掉。'))return;DATA.dream=DATA.dream.filter(x=>x!==f);await save();closeFog();fire()}]])});
$('#fgASave').onclick=async()=>{const f=ansC,v=$('#fgAText').value.trim();if(!f)return;if(!v)return toast('写点什么吧');
  (f.thread=f.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('fgAns');if(vc===f)render('full',true);respond(f)};

/* ---------- 背面的菜单 ---------- */
function showList(){const L=DATA.dream.slice().reverse().slice(0,50);if(!L.length)return toast('还没抽过');
  sheet(L.map(f=>[`No.${DATA.dream.indexOf(f)+1} · ${f.kind||''} · ${f.title}`,()=>open(f,'open')]))}
function menu(){sheet([
  ['我们的',showList],
  [`想看哪种：${S.dreamKind||'随便'}`,()=>sheet([['随便',()=>{S.dreamKind='';saveSettings();toast('随他写')}],
    ...KINDS.map(x=>[x,()=>{S.dreamKind=x;saveSettings();toast(`下一张写「${x}」`)}])])],
  [S.dreamSeed?'给他的开头（改）':'给他一个开头',()=>{const v=prompt('写一句开头，他接着往下写（只用一次）',S.dreamSeed||'');if(v===null)return;S.dreamSeed=v.trim();saveSettings();toast(S.dreamSeed?'下一张从这里写':'清掉了')}],
  ['全部清空',async()=>{if(!DATA.dream.length)return toast('本来就是空的');if(!confirm('清空背面的所有内容？他也会忘掉。'))return;DATA.dream=[];await save();fire();toast('清空了')}]])}
const om=$('#ifMenu').onclick;
$('#ifMenu').onclick=e=>side?menu():(om&&om.call($('#ifMenu'),e));

/* ---------- 他记得：秘密里一直记得；平时只有勾了「记得秘密里的事」才记得 ---------- */
HOOKS.persona.push(()=>{if(!window.__sxBuild&&!S.sxRemember)return '';const L=DATA.dream.filter(f=>f.title).slice(-20);if(!L.length)return '';
  return '【你们之间写过的事】这些是你在雾里写给她的，要记得，不要说错：\n'+L.map(f=>`- ${f.kind||''}：${f.title}——${f.sum||String(f.story).slice(0,40)}`).join('\n')});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.dream))DATA.dream=[]});
HOOKS.page.push(n=>{page=n;if(n!=='cards'){closeFog();if(side)setSide(0)}});
})();
