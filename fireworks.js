/* ===== 365 · fireworks.js · 烟花 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
document.head.insertAdjacentHTML('beforeend',`<style>
#page-fw{padding:0;overflow:hidden;background:radial-gradient(ellipse at 50% 120%,#2a1e3a 0%,#120c1c 55%,#05030a 100%)}
body.fw #tabbar{display:none}
#fwCv{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
.fw-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:calc(var(--st) + 4px) 14px 0;z-index:2;color:#fff}
.fw-top .iconbtn{background:rgba(255,255,255,.1);color:#fff}
.fw-top span{font-family:var(--en);font-style:italic;letter-spacing:4px;opacity:.5;font-size:14px}
.fw-hint{position:absolute;left:0;right:0;top:42%;text-align:center;color:#fff;opacity:.4;font-size:13px;letter-spacing:4px;pointer-events:none;transition:opacity 1s;z-index:1}
.fw-say{position:absolute;left:24px;right:24px;bottom:calc(var(--sb) + 100px);text-align:center;color:#fff;font-family:var(--ti);font-size:16px;line-height:1.8;letter-spacing:1px;text-shadow:0 0 12px rgba(0,0,0,.7);opacity:0;transition:opacity 1.2s;z-index:2;pointer-events:none;white-space:pre-wrap}
.fw-say.on{opacity:.95}
.fw-bar{position:absolute;left:14px;right:14px;bottom:calc(var(--sb) + 14px);display:flex;gap:8px;justify-content:center;flex-wrap:wrap;z-index:2}
.fw-bar button{padding:10px 16px;border-radius:99px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:13.5px;letter-spacing:2px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.fw-bar button.on{background:var(--accent);color:var(--acct);border-color:transparent}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-fw">
  <canvas id="fwCv"></canvas>
  <div class="fw-top"><button class="iconbtn" data-go="more" aria-label="返回">${BACK}</button><span>fireworks</span></div>
  <div class="fw-hint" id="fwHint">点一下夜空</div>
  <div class="fw-say" id="fwSay"></div>
  <div class="fw-bar">
    <button id="fwAuto">放一场</button><button id="fwHeart">心</button><button id="fwText">写字</button><button id="fwLu"></button>
  </div>
</section>`);

const cv=$('#fwCv'),g=cv.getContext('2d');
let W=0,H=0,run=false,raf=0,last=0,auto=false,autoT=0,P=[],R=[],page='home',luBusy=false,lastWord='365';
const rnd=(a,b)=>a+Math.random()*(b-a);
const lt=(h,k)=>'#'+rgb(h).map(v=>Math.round(v+(255-v)*k).toString(16).padStart(2,'0')).join('');
const pal=()=>[lt(S.theme||'#B4848D',.35),'#FFD1DC','#FFE7A3','#B8E1FF','#E3C6FF','#FFFFFF','#FFB27A','#9DF2D6'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function size(){const d=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0)}

/* ---------- 形状：心、文字 ---------- */
function heartPts(){const out=[],k=Math.min(W,H)/90;
  for(let i=0;i<90;i++){const t=i/90*Math.PI*2;
    out.push([16*Math.sin(t)**3*k,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*k])}
  return out}
function textPts(str){
  const c=document.createElement('canvas'),x=c.getContext('2d'),fs=120,font=`600 ${fs}px "Songti SC","Noto Serif SC",serif`;
  x.font=font;const w=Math.ceil(x.measureText(str).width)+20;
  c.width=w;c.height=Math.round(fs*1.4);
  x.font=font;x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(str,w/2,c.height/2);
  const d=x.getImageData(0,0,c.width,c.height).data,pts=[];
  for(let yy=0;yy<c.height;yy+=4)for(let xx=0;xx<c.width;xx+=4)if(d[(yy*c.width+xx)*4+3]>128)pts.push([xx-w/2,yy-c.height/2]);
  const k=Math.min(W*.86/w,H*.22/c.height),step=Math.max(1,Math.ceil(pts.length/700));
  return pts.filter((_,i)=>i%step===0).map(([a,b])=>[a*k,b*k])}

/* ---------- 炸开 ---------- */
function burst(x,y,kind,c,extra){
  const c2=pick(pal());
  P.push({x,y,vx:0,vy:0,f:1,gr:0,life:.35,dec:.05,c:'#FFFFFF',s:26});
  if(kind==='heart'||kind==='text'){
    const pts=kind==='heart'?heartPts():textPts(extra);
    for(const[dx,dy]of pts)P.push({x,y,vx:dx*.08,vy:dy*.08,f:.92,gr:.006,life:1.3,dec:rnd(.006,.009),c,s:1.7,tw:true});
    return}
  const n=kind==='willow'?80:kind==='ring'?70:95;
  for(let i=0;i<n;i++){
    const a=kind==='ring'?i/n*Math.PI*2:rnd(0,Math.PI*2);
    const sp=kind==='ring'?4.2:kind==='willow'?rnd(1,3.8):rnd(.5,1)*4.6;
    P.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      f:kind==='willow'?.975:.963,gr:kind==='willow'?.03:.045,
      life:1,dec:kind==='willow'?rnd(.005,.008):rnd(.01,.016),
      c:kind==='willow'?'#FFD58A':kind==='two'&&i%2?c2:c,s:kind==='willow'?1.3:1.7,tw:Math.random()<.3})}}
function shoot(x,ty,kind,c,extra){
  ty=Math.max(H*.1,Math.min(ty,H*.75));
  const gr=.06,y0=H+10;
  R.push({x,y:y0,vx:rnd(-.25,.25),vy:-Math.sqrt(2*gr*(y0-ty)),gr,kind:kind||pick(['ball','ball','ring','willow','two']),c:c||pick(pal()),extra})}

/* ---------- 动画 ---------- */
function frame(now){
  if(!run)return;raf=requestAnimationFrame(frame);
  let k=last?(now-last)/16.67:1;last=now;if(k>3)k=3;
  g.globalCompositeOperation='destination-out';
  g.fillStyle=`rgba(0,0,0,${1-Math.pow(.78,k)})`;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  if(auto){autoT-=k;if(autoT<=0){autoT=rnd(22,65);shoot(rnd(W*.15,W*.85),rnd(H*.15,H*.45))}}
  const RN=[];
  for(const r of R){
    r.x+=r.vx*k;r.y+=r.vy*k;r.vy+=r.gr*k;
    if(P.length<2600)P.push({x:r.x,y:r.y,vx:rnd(-.3,.3),vy:rnd(.2,.8),f:.95,gr:.02,life:.6,dec:.04,c:'#FFE7C4',s:1.2});
    g.globalAlpha=1;g.fillStyle='#FFF4E0';g.beginPath();g.arc(r.x,r.y,2,0,6.283);g.fill();
    if(r.vy>=-.5)burst(r.x,r.y,r.kind,r.c,r.extra);else RN.push(r)}
  R=RN;
  const PN=[];
  for(const p of P){
    const fk=Math.pow(p.f,k);p.vx*=fk;p.vy*=fk;p.vy+=p.gr*k;p.x+=p.vx*k;p.y+=p.vy*k;p.life-=p.dec*k;
    if(p.life<=0||p.y>H+20)continue;PN.push(p);
    if(p.tw&&Math.random()<.3)continue;
    g.globalAlpha=Math.min(1,p.life)*(p.s>10?.15:1);g.fillStyle=p.c;
    g.beginPath();g.arc(p.x,p.y,p.s,0,6.283);g.fill()}
  P=PN;g.globalAlpha=1}
function start(){size();run=true;last=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
function stop(){run=false;cancelAnimationFrame(raf)}
function reset(){stop();auto=false;P=[];R=[];g.clearRect(0,0,W,H);$('#fwSay').classList.remove('on');renderBtns()}

/* ---------- 按钮 ---------- */
function renderBtns(){
  $('#fwAuto').textContent=auto?'停下':'放一场';$('#fwAuto').classList.toggle('on',auto);
  $('#fwLu').textContent=luBusy?`${S.hisName}在看…`:`和${S.hisName}一起看`}
const hideHint=()=>{$('#fwHint').style.opacity=0};
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();shoot(e.clientX-r.left,e.clientY-r.top);hideHint()});
$('#fwAuto').onclick=()=>{auto=!auto;autoT=0;hideHint();renderBtns()};
$('#fwHeart').onclick=()=>{hideHint();shoot(W/2,H*.32,'heart',lt(S.theme||'#B4848D',.35))};
$('#fwText').onclick=()=>{const v=prompt('想让烟花写什么？（最多 6 个字）',lastWord);
  if(!v||!v.trim())return;lastWord=v.trim().slice(0,6);hideHint();shoot(W/2,H*.3,'text',pick(['#FFE7A3','#FFD1DC',lt(S.theme||'#B4848D',.35)]),lastWord)};
function say(t){const el=$('#fwSay');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),9000)}
$('#fwLu').onclick=async()=>{
  if(luBusy)return;luBusy=true;auto=true;autoT=0;hideHint();renderBtns();
  try{
    const t=await callAI(sceneSystem('你们在「365」里一起看烟花，夜空里一朵一朵地炸开。'),
      [{role:'user',text:`请以${S.hisName}的身份，在烟花下面对她说一两句话，要有画面感，口语化，不超过50字。再挑一个想让烟花写出来的词，最多4个字，可以是对她的称呼或者一句很短的话。不要用 emoji。只输出 JSON：{"say":"说的话","word":"烟花上的字"}`}]);
    let j={};try{j=JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0])}catch(e){}
    const line=clean(String(j.say||t.replace(/\{[\s\S]*\}/,''))).slice(0,80);
    const word=String(j.word||'').trim().slice(0,4)||'小狗';
    if(page!=='fw')return;
    say(line);localStorage.setItem('365-fwday',isoDate(today()));
    setTimeout(()=>{if(page==='fw')shoot(W/2,H*.3,'text','#FFE7A3',word)},2600)}
  catch(e){toast(e.message)}
  finally{luBusy=false;renderBtns()}};

/* ---------- 让陆择记得 ---------- */
HOOKS.context.push(()=>localStorage.getItem('365-fwday')===isoDate(today())?'【今天】你们在「365」里一起看了烟花。':'');

window.addEventListener('resize',()=>{if(run)size()});
document.addEventListener('visibilitychange',()=>{if(page!=='fw')return;if(document.hidden)stop();else start()});
addMore({go:'fw',cn:'烟花',ce:'fireworks'});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('fw',n==='fw');
  if(n==='fw'){renderBtns();$('#fwHint').style.opacity='';start();setTimeout(()=>{if(page==='fw')shoot(W*.5,H*.3)},400)}
  else reset()});
})();
