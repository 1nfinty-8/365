/* ===== 365 · infinity.js · 关于他：他的记忆（透明的肥水面） ===== */
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

/* ===== 想调效果改这里 ===== */
const FX={
  fat:10,          // 涟漪一圈有多宽：越大越肥（7～16）
  light:.75,       // 亮光和影子的浓淡
  sea:6,           // 底下慢慢起伏的水波
  rain:[140,420],  // 雨点间隔（毫秒），越小越密
  res:.75,         // 画水的清晰度：1 最清楚，.5 最省电
  veil:.1          // 水面上薄薄的一层白：0 = 完全透明
};

let page='',vc=null,ansC=null,busy=false,typing=null;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={count:()=>DATA.frag.length,busy:()=>busy,pick:()=>pick(),list:()=>showList()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-frag{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
#page-cards{padding:0;overflow:hidden;--fen:"Cormorant Garamond",var(--en)}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
#page-cards.wet #ifFrame,#page-cards.wet .if-top{visibility:hidden}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}

/* ===== 水面：透明 ===== */
#ifView{position:absolute;inset:0;z-index:20;display:none;overflow:hidden;background:rgba(255,255,255,var(--veil,.1))}
html.dk #ifView{background:rgba(10,14,22,calc(var(--veil,.1) * 3))}
#ifView.show{display:block;animation:mfFade .45s ease}
@keyframes mfFade{from{opacity:0}}
#mfWater{position:absolute;left:0;top:0;pointer-events:none;z-index:0}
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
@keyframes mfHint{to{opacity:.4}}
@keyframes mfPulse{0%,100%{opacity:.8}50%{opacity:.35}}

/* 记忆：字不动 */
.mf-head{position:relative;text-align:center;padding-top:122px}
.mf-age{position:absolute;left:0;right:0;top:-30px;text-align:center;pointer-events:none;
  font-family:var(--fen);font-weight:600;font-size:220px;line-height:1;letter-spacing:-.05em;font-variant-numeric:lining-nums;
  color:rgba(255,255,255,.8);text-shadow:0 0 30px rgba(255,255,255,.95),0 2px 2px rgba(120,140,175,.18),0 14px 32px rgba(110,135,180,.2)}
html.dk .mf-age{color:rgba(255,255,255,.13);text-shadow:0 0 34px rgba(170,195,255,.25)}
.mf-k{position:relative;font-size:11px;letter-spacing:6px;color:var(--ink);opacity:.55}
.mf-tt{position:relative;font-family:var(--ti);font-weight:500;font-size:24px;letter-spacing:6px;line-height:1.5;margin:14px 0 10px;color:var(--ink);text-shadow:0 0 18px rgba(255,255,255,.7)}
.mf-m{position:relative;font-family:var(--fen),var(--ti);font-size:14.5px;letter-spacing:2px;color:var(--ink);opacity:.6}
.mf-m i{font-style:normal;margin:0 8px;opacity:.6}
.mf-head.in>*{animation:mfRise 1.4s ease both}
.mf-head.in .mf-age{animation-duration:2.6s}
.mf-head.in .mf-tt{animation-delay:.3s}
@keyframes mfRise{from{opacity:0;filter:blur(10px)}}
.mf-head.in .mf-k{opacity:0;animation:mfK 1.4s ease forwards}
@keyframes mfK{to{opacity:.55}}
.mf-head.in .mf-m{opacity:0;animation:mfM 1.4s .5s ease forwards}
@keyframes mfM{to{opacity:.6}}
.mf-rule{width:1px;height:36px;margin:28px auto;background:linear-gradient(transparent,var(--ink),transparent);opacity:.3}
.mf-tx p{font-family:var(--ti);font-size:16px;line-height:2.1;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 1em;color:var(--ink);text-shadow:0 0 12px rgba(255,255,255,.75),0 1px 0 rgba(255,255,255,.5)}
html.dk .mf-tx p,html.dk .mf-tt{text-shadow:0 0 12px rgba(0,0,0,.5)}
.mf-tx p:last-child{margin:0}
.mf-tx span{opacity:0;transition:opacity .7s ease}
.mf-tx span.on{opacity:1}
.mf-th{display:flex;flex-direction:column;gap:16px;margin-top:34px}
.mf-say{font-family:var(--cn);font-size:14.5px;line-height:1.9;color:var(--ink);white-space:pre-wrap;word-break:break-word;text-shadow:0 0 10px rgba(255,255,255,.7)}
.mf-say small{display:block;font-size:11px;letter-spacing:3px;opacity:.45;margin-bottom:2px}
.mf-say.me{text-align:right;opacity:.8}
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
const VIEW=()=>$('#ifView');
VIEW().style.setProperty('--veil',FX.veil);
const dark=()=>document.documentElement.classList.contains('dk');

/* ================= 水面：雨落在水上（显卡画，轻量） ================= */
const WV={W:0,H:0,raf:0,rain:0,pulse:0,cx:0,cy:0,sunk:false,ok:undefined};
const DR=[],T0=performance.now(),now=()=>(performance.now()-T0)/1000;
function addDrop(x,y,amp,lam,spd,life,delay=0){DR.push([x,y,now()+delay,amp,lam,spd,life]);if(DR.length>16)DR.shift()}
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform vec2 uR;uniform float uK,uT,uL,uA,uDk;uniform vec4 uD[16];uniform vec4 uP[16];uniform int uN;
float H(vec2 p){
  float h=uA*(sin(dot(p,vec2(.010,.006))+uT*.5)+sin(dot(p,vec2(-.005,.012))-uT*.4)+.6*sin(dot(p,vec2(.016,-.004))+uT*.7));
  for(int i=0;i<16;i++){if(i>=uN)break;vec4 d=uD[i];vec4 q=uP[i];float a=uT-d.z;
    if(a<0.||a>q.z)continue;
    float r=length(p-d.xy),lam=q.x*(1.+a*.3),ph=r-q.y*a,e=ph/(lam*1.2),f=1.-a/q.z;
    h+=d.w*sin(6.2832*ph/lam)*exp(-e*e)*f*f/sqrt(1.+r*.02);}
  return h;}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uR.y*uK-gl_FragCoord.y)/uK;
  float h0=H(p);vec2 g=vec2(H(p+vec2(1.5,0.))-h0,H(p+vec2(0.,1.5))-h0)/1.5;
  float s=dot(g,vec2(.55,.83));
  float hi=smoothstep(.02,.7,s)*uL*(1.-.45*uDk),sh=smoothstep(.02,.7,-s)*uL*.5;
  vec3 sc=mix(vec3(.24,.32,.48),vec3(0.,.02,.07),uDk);
  gl_FragColor=vec4(vec3(hi)+sc*sh,clamp(hi+sh,0.,1.));}`;
function glInit(){if(WV.ok!==undefined)return WV.ok;
  const gl=$('#mfWater').getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
  if(!gl)return WV.ok=false;
  try{const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');gl.useProgram(pr);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    WV.u={};['uR','uK','uT','uL','uA','uDk','uN','uD','uP'].forEach(k=>WV.u[k]=gl.getUniformLocation(pr,k));
    WV.gl=gl;WV.ok=true}
  catch(e){console.error(e);WV.ok=false}
  return WV.ok}
function wvSize(){const v=VIEW(),W=v.clientWidth||innerWidth,H=v.clientHeight||innerHeight;if(W===WV.W&&H===WV.H)return;
  WV.W=W;WV.H=H;const c=$('#mfWater');c.width=Math.round(W*FX.res);c.height=Math.round(H*FX.res);c.style.width=W+'px';c.style.height=H+'px'}
const UA=new Float32Array(64),UB=new Float32Array(64);
function wvDraw(){const gl=WV.gl,u=WV.u,c=$('#mfWater'),t=now();
  for(let i=DR.length-1;i>=0;i--)if(t>DR[i][2]+DR[i][6])DR.splice(i,1);
  gl.viewport(0,0,c.width,c.height);
  gl.uniform2f(u.uR,WV.W,WV.H);gl.uniform1f(u.uK,c.width/WV.W);gl.uniform1f(u.uT,t);
  gl.uniform1f(u.uL,FX.light);gl.uniform1f(u.uA,FX.sea);gl.uniform1f(u.uDk,dark()?1:0);
  UA.fill(0);UB.fill(0);DR.forEach((d,i)=>{UA.set([d[0],d[1],d[2],d[3]],i*4);UB.set([d[4],d[5],d[6],0],i*4)});
  gl.uniform4fv(u.uD,UA);gl.uniform4fv(u.uP,UB);gl.uniform1i(u.uN,DR.length);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
function rainDrop(){const big=Math.random()<.15;
  addDrop(Math.random()*WV.W,Math.random()*WV.H,big?1.4:.7+Math.random()*.5,FX.fat*(big?1.5:.8+Math.random()*.5),big?60:42+Math.random()*16,big?2.6:1.5+Math.random()*.8)}
function wvLoop(ts){if(!VIEW().classList.contains('show')||!WV.ok){WV.raf=0;return}
  if(!document.hidden){
    if(ts>WV.rain){WV.rain=ts+FX.rain[0]+Math.random()*(FX.rain[1]-FX.rain[0]);rainDrop()}
    if(vc&&vc._wait&&WV.sunk&&ts>WV.pulse){WV.pulse=ts+1800;addDrop(WV.cx,WV.cy,1.6,FX.fat*2.2,70,3)}
    wvDraw()}
  WV.raf=requestAnimationFrame(wvLoop)}
function wvStart(){if(!glInit())return;wvSize();WV.cx=WV.W/2;WV.cy=WV.H*.45;
  if(!WV.raf){DR.length=0;WV.raf=requestAnimationFrame(wvLoop)}}
addEventListener('resize',()=>{if(VIEW().classList.contains('show'))wvSize()});
/* 手指点水、拨水 */
let pd=null,pdT=0;
const rel=(x,y)=>{const vr=VIEW().getBoundingClientRect();return [x-vr.left,y-vr.top]};
function tap(cx,cy){const[x,y]=rel(cx,cy);addDrop(x,y,1.6,FX.fat*1.6,75,2.6)}
VIEW().addEventListener('touchstart',e=>{const t=e.touches[0];pd={x:t.clientX,y:t.clientY};tap(t.clientX,t.clientY)},{passive:true});
VIEW().addEventListener('touchmove',e=>{if(!pd)return;const t=e.touches[0],n=performance.now();
  if(n-pdT<60||Math.hypot(t.clientX-pd.x,t.clientY-pd.y)<16)return;pdT=n;
  pd={x:t.clientX,y:t.clientY};const[x,y]=rel(t.clientX,t.clientY);addDrop(x,y,.8,FX.fat,50,1.6)},{passive:true});
VIEW().addEventListener('touchend',()=>pd=null,{passive:true});
VIEW().addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')tap(e.clientX,e.clientY)});

/* 牌落水、记忆浮上来 */
function splash(f){const p=$('#mfPool'),s=$('#mfStone');if(!p||vc!==f)return;
  const r=p.getBoundingClientRect(),[x,y]=rel(r.left+r.width/2,r.top+r.height/2);
  WV.cx=x;WV.cy=y;WV.sunk=true;WV.pulse=performance.now()+1800;s?.classList.add('sunk');navigator.vibrate?.(18);
  addDrop(x,y,2.6,FX.fat*3,95,3.6);addDrop(x,y,1.4,FX.fat*2,70,2.8,.3)}
function surface(){addDrop(WV.cx,WV.cy,2.2,FX.fat*2.6,90,3.4)}

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
    const waited=vc===f;delete f._wait;DATA.frag.push(f);await save();card();
    if(page==='cards'){
      if(waited){const w=Math.max(0,f._t0+2000-Date.now());
        setTimeout(()=>{if(vc!==f)return;$$('.mf-wait,.mf-hint').forEach(x=>{x.style.animation='none';x.style.opacity=0});surface();
          setTimeout(()=>{if(vc===f)vRender('new')},700)},w)}
      else open(f,'new')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;delete f._t0;busy=false;fire()}}

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
function open(f,mode){vc=f;$('#page-cards').classList.add('wet');VIEW().classList.add('show');wvStart();vRender(mode);if(mode==='open')surface()}
function view(f){if(f)open(f,'open')}
function closeView(){VIEW().classList.remove('show');$('#page-cards').classList.remove('wet');vc=null;WV.sunk=false;clearInterval(typing);typing=null;
  if(WV.a){WV.a.fill(0);WV.b.fill(0)}}
function vRender(mode,bottom){const f=vc;if(!f)return;const H=esc(S.hisName),L=$('#mfLayer');
  if(f._wait){WV.sunk=false;
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
