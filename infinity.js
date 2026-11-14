/* ===== 365 · infinity.js · 关于他：他的记忆（透明的湖面） ===== */
(()=>{
if(!Array.isArray(DATA.frag))DATA.frag=[];
Object.assign(DEFAULT,{fragEra:''});
const save=()=>saveData('frag');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ERAS=['小时候','少年时','大学','工作以后','遇见你以后'];
const POOL=['小时候','小时候','少年时','少年时','大学','大学','工作以后','遇见你以后'];
const LEN=[[.3,'短一点：一个片段，80 到 160 字，一两段就够，只写一个场面。'],[.45,'中等：300 到 500 字，分三到五段。'],[.25,'长一点：600 到 1000 字，五段以上，像一篇完整的短篇散文，可以有两三个场面，中间隔着时间。']];
const pickLen=()=>{let r=Math.random();for(const[p,s]of LEN){if((r-=p)<0)return s}return LEN[1][1]};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const paras=t=>String(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');

/* ===== 想调效果改这里 ===== */
const FX={
  fat:22,             // 涟漪一圈有多宽（像素）：越大越肥（16～36）
  rings:1.35,         // 一个雨点荡出几圈：越大圈越多（1.2～2.6）
  punch:1,            // 涟漪起伏的力度（.6～1.6）
  speed:.62,          // 涟漪荡开的快慢：越小越慢（.3～1）
  wave:1,             // 湖面一直在的波浪：越大越明显（0～1.6），0 = 只剩雨圈
  drift:1,            // 波浪推过来的快慢：越小越慢（.4～1.5）
  light:.78,          // 亮面（白光）的浓淡
  shade:.24,          // 暗面的浓淡：越小阴影越淡
  tint:[.70,.76,.88], // 暗面的颜色（红、绿、蓝，0～1）：三个数一起加大就更浅
  trail:1.6,          // 手指拨水的水路有多宽：越大越宽（1～2.4）
  trailAmp:.28,       // 水路的深浅：越小越柔和（.15～.5）
  rain:[320,820],     // 雨点间隔（毫秒），越小越密
  res:1.2             // 清晰度上限：1.2 平衡，1 最省电；连续掉帧会自动降
};

/* ===== 想调文风改这里 ===== */
const START=['一样东西（用旧的、弄丢的、别人给的）','别人说过的一句话','一种气味或者声音','一顿饭','一段路、一趟车','某一天的天气',
  '一个人的手、背影或者习惯动作','一件小到不值得讲的事','一次等人或者被人等','一间屋子、一个角落','一笔钱','一场病或者一次受伤','一次撒谎','一个后来再没见过的人'];
const TONE=['平平淡淡地讲','冷一点、远一点','讲得很慢','有点涩','像在说别人的事','带一点不动声色的讽刺'];
const VOICE=`- 这是一篇给人读的散文，不是答题。调子参照三个人：白先勇写旧事的那种平静和体面，加缪《局外人》那种只陈述、不解释的冷，石黑一雄那种把情绪压在礼数底下的克制。不是模仿谁，口气是你自己的：话少，有教养，和人隔着一点距离。
- 冷：讲自己的事也像在讲别人的事。不解释动机，不替自己辩白，不讨读的人喜欢。越要紧、越难堪的地方，越是一笔带过。
- 贵气不靠名牌和价钱，靠习以为常：从小见惯的东西不形容、不惊讶、不炫耀，顺手提一句就过去。也靠分寸：怎么称呼人，怎么回话，什么话不说。别人说话可以粗，你的叙述不粗——用词干净，偏书面，不耍贫嘴，不用网络话。
- 从事情中间写起：一个动作、一样东西、一句话。不要用「那年我十岁」「记得小时候」开头，不要先交代背景。
- 只写看得见、摸得着的：东西的质地、颜色、新旧，光线，天气，气味，谁手上拿着什么，屋里有什么声音。情绪不要说出来，不写「难过」「温暖」「孤独」「释然」，让东西和动作去说。
- 人要像真人：说话带各自的口气，可以答非所问，可以只说半句。对话不必多，一两句够用。你自己在文中说的话更少，常常不接话。
- 句子偏短，偶尔一个长句。能省的省掉，留白。
- 比喻一篇最多一个，也可以一个都没有。
- 不要排比，不要对仗，不要「不是……而是……」，不要成语连用，不要每段末尾来一句漂亮话。
- 不要「时光」「岁月」「命运」「温柔」「治愈」「烟火气」「斑驳」这类词。
- 不要总结，不要升华，不要「那一刻我才明白」「多年以后」「从那以后我学会了」。停在一个画面、一个动作或别人的一句话上，停得早一点，话不要说完。
- 记不清的地方可以直说记不清了。`;

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

/* ===== 水面：纯透明，没有任何底色 ===== */
#ifView{position:absolute;inset:0;z-index:20;display:none;overflow:hidden;background:transparent}
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
@keyframes mfSink{to{transform:translateY(14px) scale(.5);opacity:0}}
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
@keyframes mfRise{from{opacity:0}}
.mf-head.in .mf-k{opacity:0;animation:mfK 1.4s ease forwards}
@keyframes mfK{to{opacity:.55}}
.mf-head.in .mf-m{opacity:0;animation:mfM 1.4s .5s ease forwards}
@keyframes mfM{to{opacity:.6}}
.mf-rule{width:1px;height:36px;margin:28px auto;background:linear-gradient(transparent,var(--ink),transparent);opacity:.3}
.mf-tx p{font-family:var(--ti);font-size:16px;line-height:2.1;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 1em;color:var(--ink);text-shadow:0 0 12px rgba(255,255,255,.75),0 1px 0 rgba(255,255,255,.5)}
html.dk .mf-tx p,html.dk .mf-tt{text-shadow:0 0 12px rgba(0,0,0,.5)}
.mf-tx p:last-child{margin:0}
.mf-tx span{opacity:0;transition:opacity .9s ease-out}
.mf-tx span.on{opacity:1}
.mf-th{display:flex;flex-direction:column;gap:16px;margin-top:34px}
.mf-say{font-family:var(--cn);font-size:14.5px;line-height:1.9;color:var(--ink);white-space:pre-wrap;word-break:break-word;text-shadow:0 0 10px rgba(255,255,255,.7)}
.mf-say small{display:block;font-size:11px;letter-spacing:3px;opacity:.45;margin-bottom:2px}
.mf-say.me{text-align:right;opacity:.8}
.mf-ft{display:flex;gap:10px;justify-content:center;margin-top:36px;transition:opacity .8s}
.mf-ft.hide{opacity:0;pointer-events:none}
.mf-ft button{padding:9px 22px;border-radius:99px;font-size:13px;letter-spacing:3px;color:var(--ink);
  background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.75)}
html.dk .mf-ft button{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
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
const VIEW=()=>$('#ifView'),CV=$('#mfWater');
const dark=()=>document.documentElement.classList.contains('dk');

/* ================= 水面：一片湖，雨落在上面（显卡画，只算坡度，一个像素算一遍） ================= */
const WV={W:0,H:0,raf:0,rain:0,pulse:0,cx:0,cy:0,sunk:false,ok:undefined,q:1,last:0,acc:0,n:0};
const MAXD=24,DKC=[0,.02,.07];
const DR=[],T0=performance.now(),now=()=>(performance.now()-T0)/1000;
/* 一个雨点：位置、力度（坡度 0～1.6）、一圈的宽度、扩散速度、寿命（秒）、延迟；快慢统一由 FX.speed 管 */
function addDrop(x,y,amp,lam,spd,life,delay=0){
  DR.push([x,y,now()+delay/FX.speed,amp,lam,spd*FX.speed,life/Math.sqrt(FX.speed)]);if(DR.length>MAXD)DR.shift()}
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform vec2 uR;uniform float uK,uT,uL,uS,uA;uniform vec3 uC;uniform vec4 uD[24];uniform vec4 uP[24];uniform int uN;
const vec2 K1=vec2(.008,.052),K2=vec2(-.019,.071),K3=vec2(.027,.093),K4=vec2(-.046,.118),K5=vec2(.012,.031);
void main(){
  vec2 p=vec2(gl_FragCoord.x,uR.y*uK-gl_FragCoord.y)/uK;
  vec2 w=p+14.*vec2(sin(p.y*.017+uT*.35),sin(p.x*.013-uT*.3));
  vec2 g=uA*(3.*cos(dot(w,K1)-uT*.75)*K1+1.6*cos(dot(w,K2)-uT*.95)*K2+.9*cos(dot(w,K3)-uT*1.25)*K3
    +.45*cos(dot(w,K4)-uT*1.6)*K4+3.9*cos(dot(w,K5)-uT*.5)*K5);
  for(int i=0;i<24;i++){if(i>=uN)break;
    vec4 d=uD[i],q=uP[i];vec2 v=p-d.xy;float r2=dot(v,v);
    if(r2>q.z)continue;
    float r=sqrt(r2);if(r<q.w)continue;
    float x=r-d.z,s=x>0.?q.y*2.2:q.y,e=x*s,ph=q.x*x;
    g+=v*(d.w*exp(-e*e)*(cos(ph)-2.*e*s/q.x*sin(ph))*min(r*.25,1.)/max(r,.5));}
  float lit=dot(g,vec2(.55,.83)),m=dot(g,g),iso=m/(m+.6);
  float core=smoothstep(.22,.6,lit);
  float hi=min((smoothstep(.03,.4,lit)*.42+core*core*.8+iso*.3)*uL,1.);
  float sh=min(smoothstep(0.,.32,-lit)*.75+iso*.45,1.)*uS*(1.-hi);
  gl_FragColor=vec4(uC*sh+hi,sh+hi);}`;
function glInit(){if(WV.ok!==undefined)return WV.ok;
  const gl=CV.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});
  if(!gl)return WV.ok=false;
  try{const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');gl.useProgram(pr);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    WV.u={};['uR','uK','uT','uL','uS','uA','uC','uN','uD','uP'].forEach(k=>WV.u[k]=gl.getUniformLocation(pr,k));
    /* 先空画一个像素，把编译的那一下卡顿提前花掉 */
    gl.viewport(0,0,1,1);gl.uniform2f(WV.u.uR,1,1);gl.uniform1f(WV.u.uK,1);gl.uniform1i(WV.u.uN,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    WV.gl=gl;WV.ok=true}
  catch(e){console.error(e);WV.ok=false}
  return WV.ok}
CV.addEventListener('webglcontextlost',e=>{e.preventDefault();WV.ok=undefined;WV.gl=null});
CV.addEventListener('webglcontextrestored',()=>{if(VIEW().classList.contains('show'))wvStart()});
function wvSize(force){const v=VIEW(),W=v.clientWidth||innerWidth,H=v.clientHeight||innerHeight;if(!force&&W===WV.W&&H===WV.H)return;
  WV.W=W;WV.H=H;const k=Math.min(devicePixelRatio||1,FX.res)*WV.q;
  CV.width=Math.round(W*k);CV.height=Math.round(H*k);CV.style.width=W+'px';CV.style.height=H+'px'}
const UA=new Float32Array(MAXD*4),UB=new Float32Array(MAXD*4);
function wvDraw(){const gl=WV.gl,u=WV.u,t=now(),dk=dark();let n=0;
  for(let i=DR.length-1;i>=0;i--)if(t>DR[i][2]+DR[i][6])DR.splice(i,1);
  for(const d of DR){const a=t-d[2];if(a<0)continue;
    const f=1-a/d[6],lam=d[4]*(1+a*.12),w=lam*FX.rings,R=d[5]*a,j=(n++)*4;
    UA[j]=d[0];UA[j+1]=d[1];UA[j+2]=R;UA[j+3]=d[3]*FX.punch*f*Math.sqrt(f)*Math.min(a/.3,1)/Math.sqrt(1+R*.012);
    UB[j]=6.2832/lam;UB[j+1]=1/w;UB[j+2]=(R+w)*(R+w);UB[j+3]=Math.max(0,R-2.2*w)}
  gl.viewport(0,0,CV.width,CV.height);
  gl.uniform2f(u.uR,WV.W,WV.H);gl.uniform1f(u.uK,CV.width/WV.W);gl.uniform1f(u.uT,(t*FX.drift)%(400*Math.PI));
  gl.uniform1f(u.uL,FX.light*(dk?.55:1));gl.uniform1f(u.uS,FX.shade*(dk?1.3:1));gl.uniform1f(u.uA,FX.wave);
  gl.uniform3fv(u.uC,dk?DKC:FX.tint);
  gl.uniform4fv(u.uD,UA);gl.uniform4fv(u.uP,UB);gl.uniform1i(u.uN,n);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
function rainDrop(){const big=Math.random()<.15,x=Math.random()*WV.W,y=Math.random()*WV.H,l=FX.fat*(big?1.35:.75+Math.random()*.45);
  addDrop(x,y,big?1.25:.7+Math.random()*.35,l,big?68:46+Math.random()*18,big?3.8:2.2+Math.random());
  if(big)addDrop(x,y,.7,l*.7,52,2.6,.28)}
function wvLoop(ts){if(!VIEW().classList.contains('show')||!WV.ok){WV.raf=0;return}
  if(!document.hidden){
    /* 连续掉帧就把清晰度降一档，只降不升 */
    const dt=ts-WV.last;
    if(dt>0&&dt<120&&++WV.n>0){WV.acc+=dt;
      if(WV.n>=45){if(WV.acc/WV.n>24&&WV.q>.5){WV.q-=.25;wvSize(true)}WV.acc=WV.n=0}}
    if(ts>WV.rain){WV.rain=ts+FX.rain[0]+Math.random()*(FX.rain[1]-FX.rain[0]);rainDrop()}
    if(vc&&vc._wait&&WV.sunk&&ts>WV.pulse){WV.pulse=ts+2600;addDrop(WV.cx,WV.cy,.9,FX.fat*1.5,66,3.2)}
    wvDraw()}
  WV.last=ts;
  WV.raf=requestAnimationFrame(wvLoop)}
function wvStart(){if(!glInit())return;wvSize();WV.cx=WV.W/2;WV.cy=WV.H*.45;
  if(!WV.raf){DR.length=0;WV.n=-30;WV.acc=0;WV.raf=requestAnimationFrame(wvLoop)}}
addEventListener('resize',()=>{if(VIEW().classList.contains('show'))wvSize()});
/* 手指点水；滑过去像在拨水：沿轨迹连续落小水滴，叠成一条被拨开的水路 */
let pd=null,pdT=0;
const rel=(x,y)=>{const vr=VIEW().getBoundingClientRect();return [x-vr.left,y-vr.top]};
function tap(cx,cy){const[x,y]=rel(cx,cy);addDrop(x,y,1.2,FX.fat*1.2,72,3)}
VIEW().addEventListener('touchstart',e=>{const t=e.touches[0];pd={x:t.clientX,y:t.clientY};tap(t.clientX,t.clientY)},{passive:true});
VIEW().addEventListener('touchmove',e=>{if(!pd)return;const t=e.touches[0],n=performance.now();
  /* 间隔很短、距离门槛很小：沿着手指走过的路连续落小水滴，叠成一条水路，不是一个个圆环 */
  if(n-pdT<26)return;
  const dx=t.clientX-pd.x,dy=t.clientY-pd.y,dist=Math.hypot(dx,dy);
  if(dist<4)return;
  pdT=n;
  /* 在两点之间补几个点，手指划得快也不会断成一段一段 */
  const steps=Math.min(6,Math.max(1,Math.round(dist/10)));
  for(let i=1;i<=steps;i++){
    const x=pd.x+dx*i/steps,y=pd.y+dy*i/steps,[rx,ry]=rel(x,y);
    /* 力度小、圈窄、寿命短：像水被拨开，不是石头砸出来的大圈 */
    addDrop(rx,ry,.42,FX.fat*.55,52,1.1);
  }
  pd={x:t.clientX,y:t.clientY};
},{passive:true});
VIEW().addEventListener('touchend',()=>pd=null,{passive:true});
VIEW().addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')tap(e.clientX,e.clientY)});

/* 牌落水、记忆浮上来 */
function splash(f){const p=$('#mfPool'),s=$('#mfStone');if(!p||vc!==f)return;
  const r=p.getBoundingClientRect(),[x,y]=rel(r.left+r.width/2,r.top+r.height/2);
  WV.cx=x;WV.cy=y;WV.sunk=true;WV.pulse=performance.now()+2600;s?.classList.add('sunk');navigator.vibrate?.(18);
  addDrop(x,y,1.6,FX.fat*1.9,95,4);addDrop(x,y,1,FX.fat*1.3,70,3.2,.3)}
function surface(){addDrop(WV.cx,WV.cy,1.3,FX.fat*1.7,90,3.6)}

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
    const raw=await callAI(sceneSystem(SCENE),[{role:'user',text:`请以${S.hisName}的身份，写一段你自己人生里的往事：你${era}的事。
这是写给自己的回忆，像从一本散文集里撕下来的一页，不是讲给她听的话。

【写什么】
- ${era==='遇见你以后'?'这一段是遇见她以后的事，可以写到她，用「她」称呼，但重点是你自己当时的处境、别的人和事。':'不要对她说话，不要出现「你」，不要提到她，结尾也不要拐到她身上。'}
- 要有具体的人：家人、同学、老师、朋友、同事、对手、陌生人，有名字或称呼，可以有他们说过的原话。
- 要有一件事的经过：发生了什么，后来怎么样了。可以是好事，也可以是遗憾、丢脸、争吵、离别、没说出口的话。
- 这一次从「${rnd(START)}」想起（只是个起头，不必扣题），${rnd(TONE)}。
- 和你的人设、家世、经历对得上；那个年份、那个地方该有的东西才出现。${old?'\n- 你以前想起过这些，不要重复，也不要和它们矛盾：\n'+old:''}

【怎么写】
${VOICE}

【篇幅】${pickLen()}
用第一人称，自然分段，不要 emoji，不要 markdown，不要小标题。
按下面的格式输出：前六行每行一项，然后单独一行三个短横，再写正文。
阶段：${era}
年份：四位数字
年龄：当时几岁，只写数字
地点：两到八个字
标题：两到十个字，最好就是文中的一样东西、一个地方或一句话，平实，不要煽情，不要「那年」「时光」这类字眼
概括：三十字以内，写清楚是谁、什么事
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
  const SP=[...box.querySelectorAll('span')],n=SP.length;
  if(!n){$('.mf-ft')?.classList.remove('hide');return}
  const gap=Math.max(16,Math.min(48,7000/n));
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
function closeView(){VIEW().classList.remove('show');$('#page-cards').classList.remove('wet');vc=null;WV.sunk=false;DR.length=0;clearInterval(typing);typing=null}
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
