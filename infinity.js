/* ===== 365 · infinity.js · 关于他：他的记忆（水面折射） ===== */
(()=>{
if(!Array.isArray(DATA.frag))DATA.frag=[];
Object.assign(DEFAULT,{fragEra:''});
const save=()=>saveData('frag');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ERAS=['小时候','少年时','大学','工作以后','遇见你以后'];
const POOL=['小时候','小时候','少年时','少年时','大学','大学','工作以后','遇见你以后'];
const LEN=[[.3,'短一点：一个片段，80 到 160 字，一两段就够。'],[.45,'中等：300 到 500 字，分三到五段。'],[.25,'长一点：600 到 1000 字，五段以上，像一篇完整的短篇散文，有前因后果。']];
const pickLen=()=>{let r=Math.random();for(const[p,s]of LEN){if((r-=p)<0)return s}return LEN[1][1]};

/* ===== 想调效果改这里 ===== */
const FX={
  refr:8,      // 折射强度：越大，水底的东西弯得越厉害
  text:.35,    // 字跟着水晃的程度：0 = 字完全不动，1 = 跟背景一样晃
  light:.45,   // 波峰亮、波谷暗的对比
  amb:14,      // 底下慢慢流动的水，起伏有多大
  rain:[700,1900]  // 下一滴雨隔多久（毫秒，随机在这两个数之间）
};

let page='',vc=null,ansC=null,busy=false;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={count:()=>DATA.frag.length,busy:()=>busy,pick:()=>pick(),list:()=>showList()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-frag{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
#page-cards{padding:0;overflow:hidden}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}
#ifView{position:absolute;inset:0;z-index:20;display:none;overflow:hidden;background:#E4E9F1}
html.dk #ifView{background:#141822}
#ifView.show{display:block;animation:mfFade .45s ease}
@keyframes mfFade{from{opacity:0}}
#ifView canvas.gl{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#mfScroll{position:absolute;inset:0;z-index:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.mf-x{position:absolute;z-index:3;left:12px;top:calc(var(--st) + 4px)}
#mfPool{position:absolute;z-index:2;left:50%;top:42%;width:120px;height:186px;margin:-93px 0 0 -60px;pointer-events:none;display:none}
#mfPool.show{display:block}
.mf-stone{position:absolute;inset:0;border-radius:12px;overflow:hidden;
  background:linear-gradient(165deg,rgba(255,255,255,.85),rgba(238,242,248,.66) 55%,rgba(250,251,253,.78));
  border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 1px 1px #fff,0 26px 50px rgba(60,80,120,.22);
  animation:mfFall .74s cubic-bezier(.55,0,.9,.4) both}
.mf-stone::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 60% at 30% 0%,rgba(255,255,255,.75),transparent 60%)}
html.dk .mf-stone{background:linear-gradient(165deg,rgba(120,132,158,.6),rgba(70,80,102,.5) 55%,rgba(100,112,138,.55));border-color:rgba(255,255,255,.3)}
@keyframes mfFall{from{transform:translateY(-62vh) rotate(-10deg) scale(1.08);opacity:.2}}
.mf-stone.sunk{animation:mfSink 1.1s cubic-bezier(.3,.6,.4,1) forwards}
@keyframes mfSink{to{transform:translateY(14px) scale(.5);opacity:0;filter:blur(10px)}}
.mf-ft{display:flex;gap:10px;justify-content:center;padding:4px 0 calc(var(--sb) + 40px);transition:opacity .8s}
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
  <div id="ifView"><canvas class="gl" id="mfGL"></canvas>
    <div id="mfScroll"><div id="mfSpace"></div><div class="mf-ft hide" id="mfFt"></div></div>
    <div id="mfPool"></div>
    <button class="iconbtn glass mf-x" data-vx aria-label="收好">${BACK}</button></div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="ifAns"><div class="mbox">
  <h3>问问<span class="hisName">陆择</span></h3>
  <div id="ifACard" style="text-align:center;font-family:var(--ti);font-size:15px;letter-spacing:2px;margin:4px 0 2px;color:var(--sys-sub)"></div>
  <label class="f"><span>想问他的</span><textarea class="short" id="ifAText" placeholder="后来呢？"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifAns">取消</button><button class="pill" id="ifASave">问他</button></div>
</div></div>`);

const VIEW=()=>$('#ifView');
const dark=()=>document.documentElement.classList.contains('dk');
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const INK=()=>dark()?'#ECEAEC':(cssVar('--ink')||'#2F2A2C');
const TI=()=>cssVar('--ti')||'"Songti SC",serif';
const EN=()=>'"Cormorant Garamond",'+(cssVar('--en')||'serif');

/* ================= 水面：高度场 + 折射（WebGL） ================= */
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D uBg,uTx;uniform vec2 uRes;
uniform float uDpr,uT,uRefr,uTxt,uLight,uAmb,uDk;
uniform vec4 uD[12];uniform vec4 uP[12];uniform int uN;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hs(i),hs(i+vec2(1.,0.)),u.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*ns(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return s;}
float hgt(vec2 p){
  float h=uAmb*(fbm(p*.0045+vec2(uT*.03,uT*.018))+.6*fbm(p*.009+vec2(-uT*.022,uT*.03)));
  for(int i=0;i<12;i++){
    if(i>=uN)break;
    vec4 d=uD[i];vec4 q=uP[i];
    float age=uT-d.z;
    if(age<0.||age>q.z)continue;
    float r=length(p-d.xy);
    float lam=q.x+q.w*age;
    float ph=r-q.y*age;
    float z=(ph+lam)/(lam*1.25);
    float env=exp(-z*z);
    float fade=exp(-2.2*age/q.z)*(1.-smoothstep(q.z*.6,q.z,age));
    h+=d.w*sin(6.2832*ph/lam)*env*fade*exp(-.002*r)*smoothstep(0.,lam,r+lam*.3);
  }
  return h;}
void main(){
  vec2 fc=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
  float e=1.5;
  vec2 g=vec2(hgt(fc+vec2(e,0.))-hgt(fc-vec2(e,0.)),hgt(fc+vec2(0.,e))-hgt(fc-vec2(0.,e)))/(2.*e);
  vec2 uv=fc/uRes,off=g*uRefr/uRes;
  vec3 col=texture2D(uBg,clamp(uv+off,0.,1.)).rgb;
  vec3 n=normalize(vec3(-g,1.));
  vec3 L=normalize(vec3(-.45,-.65,.6));
  float sh=dot(n,L)-L.z;
  col+=vec3(sh*uLight*(1.-.5*uDk));
  col+=vec3(smoothstep(.04,.3,sh)*.08*(1.-.6*uDk));
  vec4 t=texture2D(uTx,clamp(uv+off*uTxt,0.,1.));
  col=col*(1.-t.a)+t.rgb;
  gl_FragColor=vec4(col,1.);
}`;
const GL={ok:undefined};
function glInit(){if(GL.ok!==undefined)return GL.ok;
  let c=$('#mfGL');GL.c=c;
  const gl=c.getContext('webgl',{premultipliedAlpha:false,antialias:false,alpha:false});
  const fallback=()=>{const n=c.cloneNode();c.replaceWith(n);GL.c=n;GL.c2=n.getContext('2d');GL.ok=false};
  if(!gl){fallback();return false}
  try{
    const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    const tex=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR));
      [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));return t};
    GL.tBg=tex();GL.tTx=tex();
    GL.u={};['uBg','uTx','uRes','uDpr','uT','uRefr','uTxt','uLight','uAmb','uDk','uN'].forEach(k=>GL.u[k]=gl.getUniformLocation(pr,k));
    GL.u.uD=gl.getUniformLocation(pr,'uD[0]');GL.u.uP=gl.getUniformLocation(pr,'uP[0]');
    gl.uniform1i(GL.u.uBg,0);gl.uniform1i(GL.u.uTx,1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    GL.gl=gl;GL.ok=true}
  catch(e){console.error(e);fallback()}
  return GL.ok}

/* ---------- 水滴 ---------- */
const T0=performance.now(),now=()=>(performance.now()-T0)/1000;
const DR=[];
function addDrop(x,y,amp,lam,spd,life,grow,delay=0){DR.push([x,y,now()+delay,amp,lam,spd,life,grow]);if(DR.length>12)DR.shift()}
const rain=()=>addDrop(Math.random()*SC.W,Math.random()*SC.H,2.5+Math.random()*3,18+Math.random()*12,55+Math.random()*30,2.6+Math.random()*1.4,7);
let CX=0,CY=0;
const surface=()=>addDrop(CX,CY,9,38,95,3.8,11);

/* ---------- 水底和字：两张纹理 ---------- */
const SC={W:0,H:0,D:1};
function size(){const v=VIEW(),W=v.clientWidth||innerWidth,H=v.clientHeight||innerHeight,D=Math.min(devicePixelRatio||1,2);
  if(W===SC.W&&H===SC.H&&D===SC.D)return false;
  Object.assign(SC,{W,H,D});
  for(const k of['bg','tx']){const c=SC[k]||(SC[k]=document.createElement('canvas'));c.width=W*D;c.height=H*D;SC[k+'c']=c.getContext('2d')}
  GL.c.width=W*D;GL.c.height=H*D;return true}
let BGIMG=null,BGSRC='',NZ=null;
function loadBg(){const m=(getComputedStyle($('#bg')).backgroundImage||'').match(/url\(["']?(.*?)["']?\)/),src=m?m[1]:'';
  if(src===BGSRC)return;BGSRC=src;BGIMG=null;if(!src)return buildBg();
  const i=new Image();i.onload=()=>{if(BGSRC===src){BGIMG=i;if(VIEW().classList.contains('show'))buildBg()}};i.src=src}
function noiseTile(){if(NZ)return NZ;const n=document.createElement('canvas');n.width=n.height=180;const x=n.getContext('2d'),d=x.createImageData(180,180);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=16}x.putImageData(d,0,0);return NZ=n}
function buildBg(){const{W,H,D}=SC,c=SC.bgc,dk=dark();if(!c)return;SC.dk=dk;
  c.setTransform(D,0,0,D,0,0);c.globalAlpha=1;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,dk?'#1B202C':'#EEF1F6');g.addColorStop(1,dk?'#0F131C':'#D3DCE8');c.fillStyle=g;c.fillRect(0,0,W,H);
  if(BGIMG){const a=document.createElement('canvas');a.width=Math.ceil(W/4);a.height=Math.ceil(H/4);
    const r=Math.max(a.width/BGIMG.width,a.height/BGIMG.height);
    a.getContext('2d').drawImage(BGIMG,(a.width-BGIMG.width*r)/2,(a.height-BGIMG.height*r)/2,BGIMG.width*r,BGIMG.height*r);
    const s=document.createElement('canvas');s.width=Math.ceil(W/16);s.height=Math.ceil(H/16);s.getContext('2d').drawImage(a,0,0,s.width,s.height);
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(s,0,0,W,H);
    c.fillStyle=dk?'rgba(14,18,28,.55)':'rgba(236,240,247,.48)';c.fillRect(0,0,W,H)}
  for(let i=0;i<6;i++){const x=Math.random()*W,y=Math.random()*H,r=W*(.3+Math.random()*.5),lt=i%2===0;
    const rg=c.createRadialGradient(x,y,0,x,y,r);
    rg.addColorStop(0,lt?(dk?'rgba(150,170,210,.1)':'rgba(255,255,255,.4)'):(dk?'rgba(0,0,0,.25)':'rgba(120,140,175,.12)'));rg.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=rg;c.fillRect(0,0,W,H)}
  c.fillStyle=c.createPattern(noiseTile(),'repeat');c.fillRect(0,0,W,H);
  if(GL.ok){const gl=GL.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,GL.tBg);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,SC.bg)}
  dirty=true}

/* ---------- 排版：字画在纹理上 ---------- */
const MX=document.createElement('canvas').getContext('2d'),MW=new Map();
function cw(font,c){const k=font+'|'+c;let w=MW.get(k);if(w==null){MX.font=font;w=MX.measureText(c).width;MW.set(k,w)}return w}
const NOHEAD='，。、！？；：”’）》」』…—,.!?;:)';
function wrapChars(str,font,maxW,indent){const out=[];let line=[],w=indent,first=true;
  for(const c of [...String(str)]){const cwid=cw(font,c);
    if(w+cwid>maxW&&line.length){
      if(NOHEAD.includes(c)){line.push({c,w:cwid});out.push({ch:line,ind:first?indent:0,full:true});line=[];w=0;first=false;continue}
      out.push({ch:line,ind:first?indent:0,full:true});line=[];w=0;first=false}
    line.push({c,w:cwid});w+=cwid}
  if(line.length)out.push({ch:line,ind:first?indent:0,full:false});
  return out}
function layoutMem(f){
  const W=SC.W,cwd=Math.min(440,W-60),x0=(W-cwd)/2,cx=W/2,ti=TI(),en=EN(),H=S.hisName;
  const ops=[],chars=[],no=DATA.frag.indexOf(f)+1;let y;
  if(f.age)ops.push({k:'age',s:String(f.age),x:cx,y:-6});
  ops.push({k:'sp',s:`${f.era||'往事'}　·　No. ${no}`,font:`11px ${ti}`,ls:6,x:cx,y:150,a:.5});
  const tf=`500 24px ${ti}`;y=176;
  for(const l of wrapChars(f.title,tf,cwd-20,0)){ops.push({k:'sp',s:l.ch.map(c=>c.c).join(''),font:tf,ls:6,x:cx,y,a:1});y+=36}
  y+=6;
  const meta=[f.year,f.place,f.age?f.age+' 岁':''].filter(Boolean).join('  ·  ');
  if(meta){ops.push({k:'sp',s:meta,font:`14.5px ${en},${ti}`,ls:2,x:cx,y,a:.55});y+=24}
  y+=28;ops.push({k:'rule',x:cx,y,h:36});y+=64;
  const sf=`16px ${ti}`,LH=33.6;
  for(const p of String(f.story||'').split(/\n+/).map(s=>s.trim()).filter(Boolean)){
    for(const l of wrapChars(p,sf,cwd,32)){const sum=l.ch.reduce((a,c)=>a+c.w,0);
      const ex=l.full&&l.ch.length>1?(cwd-l.ind-sum)/(l.ch.length-1):0;let x=x0+l.ind;
      for(const c of l.ch){chars.push({c:c.c,x,y:y+9});x+=c.w+ex}
      y+=LH}
    y+=16}
  const items=(f.thread||[]).map(x=>({me:x.who==='me',who:x.who==='me'?'我':H,t:x.text}));
  if(BUSY.has(f))items.push({me:false,who:H,t:'在想怎么跟你说…'});
  if(items.length){y+=20;const qf=`14.5px ${ti}`;
    for(const it of items){const x=it.me?x0+cwd:x0,al=it.me?'right':'left';
      ops.push({k:'tl',s:it.who,font:`11px ${ti}`,x,y,a:.45,al});y+=20;
      for(const para of String(it.t).split(/\n+/))for(const l of wrapChars(para,qf,cwd,0)){ops.push({k:'tl',s:l.ch.map(c=>c.c).join(''),font:qf,x,y:y+5,a:it.me?.75:1,al});y+=27.5}
      y+=14}}
  return {ops,chars,h:y+20,sf}}
function drawSpaced(c,s,font,ls,cx,y){const A=[...s],ws=A.map(ch=>cw(font,ch)),tot=ws.reduce((a,b)=>a+b,0)+ls*(A.length-1);
  let x=cx-tot/2;c.font=font;c.textAlign='left';A.forEach((ch,i)=>{c.fillText(ch,x,y);x+=ws[i]+ls})}
let LY={mode:'none'},dirty=true,free=false;
function drawTx(){const c=SC.txc,D=SC.D;if(!c)return;
  c.setTransform(D,0,0,D,0,0);c.clearRect(0,0,SC.W,SC.H);c.textBaseline='top';c.globalAlpha=1;
  const ink=INK(),ti=TI();c.fillStyle=ink;
  if(LY.mode==='wait'){const a=(.55+.3*Math.sin(now()*2.4))*LY.wa,y=CY+93+34;
    c.globalAlpha=a;drawSpaced(c,`${S.hisName}在想`,`12px ${ti}`,8,SC.W/2,y);
    c.globalAlpha=.35*LY.wa;drawSpaced(c,'碰一碰水面',`11px ${ti}`,4,SC.W/2,y+26);return}
  if(LY.mode!=='mem')return;
  const oy=LY.top-$('#mfScroll').scrollTop,ha=LY.ha,H=SC.H,dk=dark();
  for(const o of LY.ops){const y=o.y+oy;if(y<-260||y>H+20)continue;
    if(o.k==='age'){c.save();c.font=`600 220px ${EN()}`;c.textAlign='center';
      c.shadowColor=dk?'rgba(170,195,255,.25)':'rgba(255,255,255,.95)';c.shadowBlur=30*D;
      c.fillStyle=dk?'rgba(255,255,255,.13)':'rgba(255,255,255,.82)';c.globalAlpha=ha;c.fillText(o.s,o.x,y);c.restore();c.fillStyle=ink}
    else if(o.k==='sp'){c.globalAlpha=o.a*ha;drawSpaced(c,o.s,o.font,o.ls,o.x,y)}
    else if(o.k==='rule'){const g=c.createLinearGradient(0,y,0,y+o.h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,ink);g.addColorStop(1,'rgba(0,0,0,0)');
      c.globalAlpha=.3*ha;c.fillStyle=g;c.fillRect(o.x-.5,y,1,o.h);c.fillStyle=ink}
    else if(o.k==='tl'){c.globalAlpha=o.a;c.font=o.font;c.textAlign=o.al;c.fillText(o.s,o.x,y)}}
  c.font=LY.sf;c.textAlign='left';const n=LY.chars.length,rv=LY.rev;
  for(let i=0;i<n;i++){const a=rv>=n?1:Math.min(1,(rv-i)/8);if(a<=0)break;
    const ch=LY.chars[i],y=ch.y+oy;if(y<-40||y>H+10)continue;
    c.globalAlpha=a;c.fillText(ch.c,ch.x,y)}
  c.globalAlpha=1}
function upTx(){if(!GL.ok)return;const gl=GL.gl;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,GL.tTx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,SC.tx)}
const A=new Float32Array(48),B=new Float32Array(48);
function render(){
  if(!GL.ok){const c=GL.c2;c.setTransform(1,0,0,1,0,0);c.drawImage(SC.bg,0,0);c.drawImage(SC.tx,0,0);return}
  const gl=GL.gl,u=GL.u;gl.viewport(0,0,SC.W*SC.D,SC.H*SC.D);
  gl.uniform2f(u.uRes,SC.W,SC.H);gl.uniform1f(u.uDpr,SC.D);gl.uniform1f(u.uT,now());
  gl.uniform1f(u.uRefr,FX.refr);gl.uniform1f(u.uTxt,FX.text);gl.uniform1f(u.uLight,FX.light);gl.uniform1f(u.uAmb,FX.amb);gl.uniform1f(u.uDk,dark()?1:0);
  A.fill(0);B.fill(0);DR.forEach((d,i)=>{A.set([d[0],d[1],d[2],d[3]],i*4);B.set([d[4],d[5],d[6],d[7]],i*4)});
  gl.uniform4fv(u.uD,A);gl.uniform4fv(u.uP,B);gl.uniform1i(u.uN,DR.length);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}

/* ---------- 每一帧 ---------- */
let raf=0,last=0,nextRain=0,nextPulse=0;
function loop(ts){if(!VIEW().classList.contains('show')){raf=0;return}
  const t=now(),dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  for(let i=DR.length-1;i>=0;i--)if(t>DR[i][2]+DR[i][6])DR.splice(i,1);
  if(t>nextRain){nextRain=t+(FX.rain[0]+Math.random()*(FX.rain[1]-FX.rain[0]))/1000;if(DR.length<3)rain()}
  if(LY.mode==='wait'){dirty=true;if(LY.out)LY.wa=Math.max(0,LY.wa-dt*2);
    if(LY.sunk&&!LY.out&&t>nextPulse){nextPulse=t+1.9;addDrop(CX,CY,4.5,34,80,3.2,9)}}
  else if(LY.mode==='mem'){
    if(LY.ha<1){LY.ha=Math.min(1,LY.ha+dt/1.4);dirty=true}
    const n=LY.chars.length;
    if(LY.rev<n){LY.rev=Math.min(n,LY.rev+dt*LY.cps);dirty=true;
      const ch=LY.chars[Math.max(0,Math.floor(LY.rev)-1)],sc=$('#mfScroll');
      if(ch&&!free){const ys=LY.top+ch.y-sc.scrollTop,lim=SC.H-160;if(ys>lim)sc.scrollTop+=(ys-lim)*.12}
      if(LY.rev>=n)$('#mfFt').classList.remove('hide')}}
  if(dirty){dirty=false;drawTx();upTx()}
  render();raf=requestAnimationFrame(loop)}
$('#mfScroll').addEventListener('scroll',()=>dirty=true,{passive:true});
$('#mfScroll').addEventListener('touchstart',()=>free=true,{passive:true});
document.fonts?.ready?.then(()=>{MW.clear();dirty=true});
document.fonts?.load?.(`600 220px "Cormorant Garamond"`).then(()=>{MW.clear();dirty=true}).catch(()=>{});

/* 手指点水、拨水 */
let pd=null,pdT=0;
const rel=(x,y)=>{const vr=VIEW().getBoundingClientRect();return [x-vr.left,y-vr.top]};
function tap(cx,cy){const[x,y]=rel(cx,cy);addDrop(x,y,6,28,85,3.4,9)}
VIEW().addEventListener('touchstart',e=>{const t=e.touches[0];pd={x:t.clientX,y:t.clientY};tap(t.clientX,t.clientY)},{passive:true});
VIEW().addEventListener('touchmove',e=>{if(!pd)return;const t=e.touches[0],n=performance.now();
  if(n-pdT<80||Math.hypot(t.clientX-pd.x,t.clientY-pd.y)<24)return;pdT=n;
  pd={x:t.clientX,y:t.clientY};const[x,y]=rel(t.clientX,t.clientY);addDrop(x,y,2.4,18,60,2,5)},{passive:true});
VIEW().addEventListener('touchend',()=>pd=null,{passive:true});
VIEW().addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')tap(e.clientX,e.clientY)});

/* ---------- 画面状态 ---------- */
function startWait(f){
  LY={mode:'wait',wa:1,sunk:false,out:false};
  $('#mfSpace').style.height=SC.H+'px';$('#mfFt').innerHTML='';$('#mfFt').classList.add('hide');$('#mfScroll').scrollTop=0;
  const p=$('#mfPool');p.innerHTML='<div class="mf-stone" id="mfStone"></div>';p.classList.add('show');dirty=true;
  setTimeout(()=>{if(vc!==f||!f._wait)return;$('#mfStone')?.classList.add('sunk');LY.sunk=true;navigator.vibrate?.(18);
    addDrop(CX,CY,12,40,105,4.2,12);addDrop(CX,CY,5,26,80,3,8,.35);nextPulse=now()+1.9},740)}
function setMem(f,mode,bottom){
  $('#mfPool').classList.remove('show');
  const L=layoutMem(f),vr=VIEW().getBoundingClientRect(),top=Math.max(96,$('.mf-x').getBoundingClientRect().bottom-vr.top+44);
  const an=mode==='new'||mode==='open',n=L.chars.length;
  LY={mode:'mem',...L,top,ha:an?0:1,rev:mode==='new'?0:n,cps:Math.max(21,Math.min(62,n/7))};
  $('#mfSpace').style.height=(top+L.h)+'px';
  const ft=$('#mfFt');ft.innerHTML=`${BUSY.has(f)?'':'<button data-va>问他</button>'}<button data-vm>···</button><button data-vx>收好</button>`;
  ft.classList.toggle('hide',mode==='new');
  const sc=$('#mfScroll');
  if(an){sc.scrollTop=0;free=false}else if(bottom)requestAnimationFrame(()=>{sc.scrollTop=sc.scrollHeight;dirty=true});
  dirty=true}
function open(f,mode){vc=f;VIEW().classList.add('show');glInit();
  const rs=size();CX=SC.W/2;CY=SC.H*.42;
  if(rs||SC.dk!==dark())buildBg();loadBg();
  if(f._wait)startWait(f);else{setMem(f,mode);if(mode==='open')surface()}
  if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
function view(f){if(f)open(f,'open')}
function closeView(){VIEW().classList.remove('show');vc=null;DR.length=0;LY={mode:'none'};$('#mfPool').classList.remove('show')}
addEventListener('resize',()=>{if(!VIEW().classList.contains('show'))return;
  if(size()){CX=SC.W/2;CY=SC.H*.42;buildBg();if(vc&&!vc._wait)setMem(vc,'full')}});

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
        setTimeout(()=>{if(vc!==f)return;LY.out=true;surface();setTimeout(()=>{if(vc===f)setMem(f,'new')},700)},w)}
      else open(f,'new')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;delete f._t0;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)setMem(f,'full',true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`她刚看了你${f.era}的一段回忆「${f.title}」（${f.year?f.year+'年，':''}${f.age?f.age+'岁，':''}${f.place||''}）：\n「${String(f.story).slice(0,1500)}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份回她最新问的，细节要和这段回忆对得上，可以多讲一点当时的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)setMem(f,'full',true)}

VIEW().addEventListener('click',e=>{const f=vc;
  if(e.target.closest('[data-vx]'))return closeView();
  if(!f||f._wait)return;
  if(e.target.closest('[data-va]')){ansC=f;$('#ifACard').textContent=f.title;$('#ifAText').value='';openModal('ifAns');return}
  if(e.target.closest('[data-vm]'))sheet([
    ['复制这段',()=>navigator.clipboard?.writeText(`${f.title}\n\n${f.story}`).then(()=>toast('已复制'))],
    ['删除这段记忆',async()=>{if(!confirm('删除这段记忆？他也会忘掉这件事。'))return;DATA.frag=DATA.frag.filter(x=>x!==f);await save();closeView();fire();card()}]])});
$('#ifASave').onclick=async()=>{const f=ansC,v=$('#ifAText').value.trim();if(!f)return;if(!v)return toast('写点什么吧');
  (f.thread=f.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('ifAns');if(vc===f)setMem(f,'full',true);respond(f)};

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
