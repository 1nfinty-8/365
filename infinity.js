/* ===== 365 · infinity.js · 关于他：他的记忆（雨落水面） ===== */
(()=>{
if(!Array.isArray(DATA.frag))DATA.frag=[];
Object.assign(DEFAULT,{fragEra:''});
const save=()=>saveData('frag');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ERAS=['小时候','少年时','大学','工作以后','遇见你以后'];
const POOL=['小时候','小时候','少年时','少年时','大学','大学','工作以后','遇见你以后'];
const LEN=[[.3,'短一点：一个片段，80 到 160 字，一两段就够。'],[.45,'中等：300 到 500 字，分三到五段。'],[.25,'长一点：600 到 1000 字，五段以上，像一篇完整的短篇散文，有前因后果。']];
const pickLen=()=>{let r=Math.random();for(const[p,s]of LEN){if((r-=p)<0)return s}return LEN[1][1]};
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
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
  background:linear-gradient(180deg,rgba(232,237,245,.5),rgba(214,223,236,.56));-webkit-backdrop-filter:blur(22px) saturate(1.25);backdrop-filter:blur(22px) saturate(1.25)}
html.dk #ifView{background:linear-gradient(180deg,rgba(20,24,34,.55),rgba(14,18,28,.62))}
#ifView.show{display:block;animation:mfFade .45s ease}
@keyframes mfFade{from{opacity:0}}
#mfWater{position:absolute;inset:0;pointer-events:none;z-index:0}
#mfLayer{position:absolute;inset:0;z-index:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  display:flex;flex-direction:column;padding:calc(var(--st) + 64px) 30px calc(var(--sb) + 34px)}
.mf-x{position:absolute;z-index:3;left:12px;top:calc(var(--st) + 4px)}
.mf-box{margin:auto 0;width:100%;max-width:440px;align-self:center}

/* 投进水里的牌 */
.mf-pool{position:relative;height:230px;margin:0 auto 18px}
.mf-stone{position:absolute;left:50%;top:50%;width:120px;height:186px;margin:-93px 0 0 -60px;border-radius:12px;overflow:hidden;
  background:linear-gradient(165deg,rgba(255,255,255,.85),rgba(238,242,248,.66) 55%,rgba(250,251,253,.78));
  border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 1px 1px #fff,0 26px 50px rgba(60,80,120,.22);
  animation:mfFall .74s cubic-bezier(.55,0,.9,.4) both}
.mf-stone::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 60% at 30% 0%,rgba(255,255,255,.75),transparent 60%)}
html.dk .mf-stone{background:linear-gradient(165deg,rgba(120,132,158,.6),rgba(70,80,102,.5) 55%,rgba(100,112,138,.55));border-color:rgba(255,255,255,.3)}
@keyframes mfFall{from{transform:translateY(-62vh) rotate(-10deg) scale(1.08);opacity:.2}}
.mf-stone.sunk{animation:mfSink 1.1s cubic-bezier(.3,.6,.4,1) forwards}
@keyframes mfSink{to{transform:translateY(14px) scale(.5);opacity:0;filter:blur(10px)}}
.mf-wait{text-align:center;font-size:12px;letter-spacing:8px;color:var(--ink);opacity:0;animation:mfShow 1s .9s ease forwards,mfPulse 2.6s 1.9s ease-in-out infinite;transition:opacity .6s}
.mf-hint{text-align:center;font-size:11px;letter-spacing:4px;color:var(--ink);opacity:0;margin-top:10px;animation:mfHint 1s 1.4s ease forwards;transition:opacity .6s}
@keyframes mfShow{to{opacity:.8}}
@keyframes mfHint{to{opacity:.35}}
@keyframes mfPulse{0%,100%{opacity:.8}50%{opacity:.35}}

/* 记忆：写在水面上，字不动 */
.mf-head{position:relative;text-align:center;padding-top:122px}
.mf-age{position:absolute;left:0;right:0;top:-26px;text-align:center;pointer-events:none;
  font-family:var(--fen);font-weight:300;font-size:210px;line-height:1;letter-spacing:-.04em;font-variant-numeric:lining-nums;
  color:rgba(255,255,255,.72);text-shadow:0 0 34px rgba(255,255,255,.95),0 1px 0 rgba(120,140,175,.16)}
html.dk .mf-age{color:rgba(255,255,255,.1);text-shadow:0 0 34px rgba(170,195,255,.25)}
.mf-k{position:relative;font-size:11px;letter-spacing:6px;color:var(--ink);opacity:.5}
.mf-tt{position:relative;font-family:var(--ti);font-weight:500;font-size:24px;letter-spacing:6px;line-height:1.5;margin:14px 0 10px;color:var(--ink)}
.mf-m{position:relative;font-family:var(--fen),var(--ti);font-size:14.5px;letter-spacing:2px;color:var(--ink);opacity:.55}
.mf-m i{font-style:normal;margin:0 8px;opacity:.6}
.mf-head.in>*{animation:mfRise 1.4s ease both}
.mf-head.in .mf-age{animation-duration:2.6s}
.mf-head.in .mf-tt{animation-delay:.3s}
.mf-head.in .mf-m{animation-delay:.5s}
@keyframes mfRise{from{opacity:0;filter:blur(10px)}}
.mf-head.in .mf-k{opacity:0;animation:mfK 1.4s ease forwards}
@keyframes mfK{to{opacity:.5}}
.mf-head.in .mf-m{opacity:0;animation:mfM 1.4s .5s ease forwards}
@keyframes mfM{to{opacity:.55}}
.mf-rule{width:1px;height:36px;margin:28px auto;background:linear-gradient(transparent,var(--ink),transparent);opacity:.3}
.mf-tx p{font-family:var(--ti);font-size:16px;line-height:2.1;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 1em;color:var(--ink);text-shadow:0 1px 0 rgba(255,255,255,.4)}
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
  background:rgba(255,255,255,.32);border:1px solid rgba(255,255,255,.75);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
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

/* ================= 水面：底下是缓缓的海，上面是雨点涟漪 ================= */
const WV={q:7,W:0,H:0,w:0,h:0,a:null,b:null,src:null,lg:null,img:null,g:null,dpr:1,raf:0,amb:0,rain:0,rings:[],cx:0,cy:0};
const VIEW=()=>$('#ifView');
const dark=()=>document.documentElement.classList.contains('dk');
function wvSize(){const v=VIEW(),W=v.clientWidth||innerWidth,H=v.clientHeight||innerHeight;
  if(W===WV.W&&H===WV.H)return;
  const q=WV.q,w=Math.ceil(W/q)+2,h=Math.ceil(H/q)+2,d=Math.min(devicePixelRatio||1,2);
  Object.assign(WV,{W,H,w,h,dpr:d,a:new Float32Array(w*h),b:new Float32Array(w*h)});
  const lo=WV.src||(WV.src=document.createElement('canvas'));lo.width=w;lo.height=h;WV.lg=lo.getContext('2d');WV.img=WV.lg.createImageData(w,h);
  const cv=$('#mfWater');cv.width=W*d;cv.height=H*d;WV.g=cv.getContext('2d')}
/* 海：起伏 */
function drop(px,py,r,s){if(!WV.a)return;const q=WV.q,x0=px/q+1,y0=py/q+1,R=Math.max(1.5,r/q);
  const x1=Math.max(1,Math.floor(x0-R)),x2=Math.min(WV.w-2,Math.ceil(x0+R)),y1=Math.max(1,Math.floor(y0-R)),y2=Math.min(WV.h-2,Math.ceil(y0+R));
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const d=Math.hypot(x-x0,y-y0);if(d<R)WV.a[y*WV.w+x]+=s*(Math.cos(d/R*Math.PI)+1)/2}}
function wvStep(){const{w,h,a,b}=WV;
  for(let y=1;y<h-1;y++){let i=y*w+1;for(let x=1;x<w-1;x++,i++)b[i]=((a[i-1]+a[i+1]+a[i-w]+a[i+w])*.5-b[i])*.986}
  WV.a=b;WV.b=a}
/* 雨：一圈一圈 */
function ring(x,y,o){WV.rings.push({x,y,t:performance.now()+(o.delay||0),life:o.life||1600,max:o.max||60,w:o.w||1.1,a:o.a??.6})}
function ripple(x,y,n,o={}){for(let k=0;k<n;k++)ring(x,y,{...o,delay:(o.delay||0)+k*(o.gap||170),max:(o.max||60)*(1-k*.14),a:(o.a??.6)*(1-k*.16)})}
function wvDraw(now){const{w,h,a,img,lg,g,W,H,dpr}=WV,d=img.data,dk=dark();
  for(let y=1;y<h-1;y++){let i=y*w+1;for(let x=1;x<w-1;x++,i++){
    const l=(a[i-1]-a[i+1])*.7+(a[i-w]-a[i+w]),o=i*4;
    if(l>0){d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(dk?80:140,l*9)}
    else{d[o]=70;d[o+1]=92;d[o+2]=130;d[o+3]=Math.min(dk?90:55,-l*4.5)}}}
  lg.putImageData(img,0,0);
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=true;
  g.drawImage(WV.src,1,1,w-2,h-2,0,0,(w-2)*WV.q,(h-2)*WV.q);
  WV.rings=WV.rings.filter(r=>now<r.t+r.life);
  const sh=dk?'170,190,230':'70,90,125';
  for(const r of WV.rings){const p=(now-r.t)/r.life;if(p<0)continue;
    const R=3+r.max*(1-Math.pow(1-p,2.2)),al=r.a*Math.pow(1-p,1.5);
    g.lineWidth=r.w;
    g.strokeStyle=`rgba(${sh},${al*.32})`;g.beginPath();g.ellipse(r.x,r.y+1.3,R,R*.9,0,0,7);g.stroke();
    g.strokeStyle=`rgba(255,255,255,${al})`;g.beginPath();g.ellipse(r.x,r.y,R,R*.9,0,0,7);g.stroke()}}
function wvLoop(now){if(!VIEW().classList.contains('show')){WV.raf=0;return}
  if(now>WV.rain){WV.rain=now+160+Math.random()*520;const x=Math.random()*WV.W,y=Math.random()*WV.H;
    ripple(x,y,Math.random()<.35?2:1,{max:20+Math.random()*44,life:1200+Math.random()*800,a:.5,w:1});drop(x,y,10,1)}
  if(now>WV.amb){
    if(vc&&vc._wait&&vc._sunk){WV.amb=now+1800;ripple(WV.cx,WV.cy,2,{max:150,life:2800,a:.55,gap:280});drop(WV.cx,WV.cy,40,4)}
    else{WV.amb=now+3500+Math.random()*2500;drop(Math.random()*WV.W,Math.random()*WV.H,130,2.4)}}
  wvStep();wvDraw(now);WV.raf=requestAnimationFrame(wvLoop)}
function wvStart(){wvSize();WV.cx=WV.W/2;WV.cy=WV.H*.45;if(!WV.raf)WV.raf=requestAnimationFrame(wvLoop)}
addEventListener('resize',()=>{if(VIEW().classList.contains('show'))wvSize()});
/* 手指点水、拨水 */
let pd=null;
const rel=(x,y)=>{const vr=VIEW().getBoundingClientRect();return [x-vr.left,y-vr.top]};
function tap(cx,cy){const[x,y]=rel(cx,cy);ripple(x,y,3,{max:110,life:2100,a:.85,gap:150,w:1.3});drop(x,y,26,9)}
VIEW().addEventListener('touchstart',e=>{const t=e.touches[0];pd={x:t.clientX,y:t.clientY};tap(t.clientX,t.clientY)},{passive:true});
VIEW().addEventListener('touchmove',e=>{if(!pd)return;const t=e.touches[0];if(Math.hypot(t.clientX-pd.x,t.clientY-pd.y)<18)return;
  pd={x:t.clientX,y:t.clientY};const[x,y]=rel(t.clientX,t.clientY);ring(x,y,{max:38,life:1100,a:.55});drop(x,y,18,3.5)},{passive:true});
VIEW().addEventListener('touchend',()=>pd=null,{passive:true});
VIEW().addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')tap(e.clientX,e.clientY)});

/* 牌落水 */
function splash(f){const p=$('#mfPool'),s=$('#mfStone');if(!p||vc!==f)return;
  const r=p.getBoundingClientRect(),[x,y]=rel(r.left+r.width/2,r.top+r.height/2);
  WV.cx=x;WV.cy=y;f._sunk=true;s?.classList.add('sunk');navigator.vibrate?.(18);
  ripple(x,y,5,{max:250,life:3200,a:.95,gap:170,w:1.6});drop(x,y,60,30)}
function surface(){ripple(WV.cx,WV.cy,4,{max:220,life:3000,a:.8,gap:200,w:1.4});drop(WV.cx,WV.cy,50,16)}

/* ---------- 他想起一段 ---------- */
const SCENE='这是你们的小窝「365」里「关于他」的「他的记忆」：一个玻璃文件夹，里面封着你自己的过去。';
function parse(t){t=String(t).replace(/```\w*/g,'');const i=t.search(/\n\s*-{3,}\s*\n/);if(i<0)throw new SyntaxError('fmt');
  const head=t.slice(0,i),story=t.slice(i).replace(/^\s*-{3,}\s*/,'').replace(/\*\*|__|^#+\s*/gm,'').trim();
  const g=k=>((head.match(new RegExp(k+'\\s*[:：]\\s*(.+)'))||[])[1]||'').trim();
  return {era:g('阶段'),year:(g('年份').match(/\d{4}/)||[''])[0],age:parseInt(g('年龄'))||'',place:g('地点'),title:g('标题'),sum:g('概括'),story}}
async function pick(){
  if(busy)return;busy=true;fire();
  const f={id:uid(),t:Date.now(),thread:[],_wait:true,_t0:Date.now()+420};
  setTimeout(()=>{if(f._wait&&page==='cards')open(f,'wait')},420);
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
      if(vc===f){const w=Math.max(0,f._t0+2000-Date.now());
        setTimeout(()=>{if(vc!==f)return;$$('.mf-wait,.mf-hint').forEach(x=>{x.style.animation='none';x.style.opacity=0});surface();
          setTimeout(()=>{if(vc===f)vRender('new')},700)},w)}
      else open(f,'new')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;delete f._sunk;delete f._t0;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)vRender('full',true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`她刚看了你${f.era}的一段回忆「${f.title}」（${f.year?f.year+'年，':''}${f.age?f.age+'岁，':''}${f.place||''}）：\n「${String(f.story).slice(0,1500)}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份回她最新问的，细节要和这段回忆对得上，可以多讲一点当时的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)vRender('full',true)}

/* ---------- 一个字一个字浮上来（字本身不动） ---------- */
function typeOut(f){const box=$('#mfTx'),L=$('#mfLayer');if(!box)return;
  box.innerHTML=String(f.story).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(p=>`<p>${[...p].map(c=>`<span>${esc(c)}</span>`).join('')}</p>`).join('');
  const SP=[...box.querySelectorAll('span')],n=SP.length,gap=Math.max(16,Math.min(48,7000/n));
  let i=0,free=false;L.addEventListener('touchstart',()=>free=true,{once:true,passive:true});
  clearInterval(typing);
  typing=setInterval(()=>{
    if(vc!==f){clearInterval(typing);typing=null;return}
    SP[i++].classList.add('on');
    if(i%10===0||i>=n){const r=SP[i-1].getBoundingClientRect(),vr=VIEW().getBoundingClientRect();
      if(!free&&r.bottom>vr.bottom-150)L.scrollBy({top:r.bottom-(vr.bottom-150),behavior:'smooth'})}
    if(i>=n){clearInterval(typing);typing=null;$('.mf-ft')?.classList.remove('hide')}},gap)}

/* ---------- 打开 ---------- */
function open(f,mode){vc=f;VIEW().classList.add('show');wvStart();vRender(mode);if(mode==='open')surface()}
function view(f){if(f)open(f,'open')}
function closeView(){VIEW().classList.remove('show');vc=null;clearInterval(typing);typing=null;WV.rings=[]}
function vRender(mode,bottom){const f=vc;if(!f)return;const H=esc(S.hisName),L=$('#mfLayer');
  if(f._wait){f._t0=Date.now();
    L.innerHTML=`<div class="mf-box"><div class="mf-pool" id="mfPool"><div class="mf-stone" id="mfStone"></div></div><p class="mf-wait">${H}在想</p><p class="mf-hint">碰一碰水面</p></div>`;
    setTimeout(()=>splash(f),740);return}
  const tp=mode==='new',an=tp||mode==='open',no=DATA.frag.indexOf(f)+1,b=BUSY.has(f);
  const meta=[f.year,f.place,f.age?f.age+' 岁':''].filter(Boolean).map(esc).join('<i>·</i>');
  const th=(f.thread||[]).map(x=>`<div class="mf-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(b?`<div class="mf-say him"><small>${H}</small>在想怎么跟你说…</div>`:'');
  L.innerHTML=`<div class="mf-box">
    <div class="mf-head${an?' in':''}">${f.age?`<div class="mf-age">${f.age}</div>`:''}
      <div class="mf-k">${esc(f.era||'往事')}　·　No. ${no}</div>
      <h3 class="mf-tt">${esc(f.title)}</h3>
      ${meta?`<div class="mf-m">${meta}</div>`:''}</div>
    <div class="mf-rule"></div>
    <div class="mf-tx" id="mfTx">${tp?'':paras(f.story)}</div>
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
