/* ===== 365 · fog.js · 雾窗 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
document.head.insertAdjacentHTML('beforeend',`<style>
#page-fog{padding:0;overflow:hidden}
#page-fog.active{display:block}
body.fogb #tabbar{display:none}
#fgFog,#fgFx{position:absolute;inset:0;width:100%;height:100%;display:block}
#fgFog{opacity:.86}
#fgFx{touch-action:none}
.fg-top{position:absolute;left:0;right:0;top:0;z-index:2;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 6px;pointer-events:none}
.fg-top>*{pointer-events:auto}
.fg-t{flex:1;font-family:var(--ti);font-size:16px;letter-spacing:4px;color:var(--ink);opacity:.75;pointer-events:none}
.fg-t em{font-family:var(--en);font-style:italic;font-size:13px;letter-spacing:1px;margin-left:6px;color:var(--sub)}
#fgSay{position:absolute;left:0;right:0;bottom:calc(var(--sb) + 26px);z-index:2;text-align:center;font-size:12.5px;letter-spacing:3px;color:var(--sub);pointer-events:none}
</style>`);
$('#tabbar').insertAdjacentHTML('beforebegin',`<section class="page" id="page-fog">
  <canvas id="fgFog"></canvas><canvas id="fgFx"></canvas>
  <div class="fg-top"><button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button><div class="fg-t">雾窗<em>misty window</em></div><button class="pill glass" id="fgHim">让他写</button><button class="iconbtn glass" id="fgMore" style="letter-spacing:1px">···</button></div>
  <div id="fgSay"></div></section>`);

const pg=$('#page-fog'),cf=$('#fgFog'),cx=$('#fgFx'),f=cf.getContext('2d'),x=cx.getContext('2d');
let W=0,H=0,tex=null,run=false,raf=0,drops=[],add=[],last=null,busy=false,wrote=null;
const R=v=>Math.random()*v;
const nf=()=>new Promise(r=>requestAnimationFrame(r));
const say=t=>{$('#fgSay').textContent=t||''};

/* ---------- 雾 ---------- */
function makeTex(){
  const c=document.createElement('canvas');c.width=W;c.height=H;const t=c.getContext('2d');
  const[r,g,b]=rgb(S.theme||'#B4848D').map(v=>Math.round(v*.16+255*.84));
  const gr=t.createLinearGradient(0,0,0,H);gr.addColorStop(0,`rgb(${r},${g},${b})`);gr.addColorStop(1,`rgb(${r-12},${g-12},${b-9})`);
  t.fillStyle=gr;t.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){const px=R(W),py=R(H),rr=60+R(160),q=t.createRadialGradient(px,py,0,px,py,rr);
    q.addColorStop(0,'rgba(255,255,255,.16)');q.addColorStop(1,'rgba(255,255,255,0)');t.fillStyle=q;t.fillRect(px-rr,py-rr,rr*2,rr*2)}
  for(let i=0;i<W*H/60;i++){t.fillStyle=Math.random()<.5?'rgba(255,255,255,.35)':'rgba(0,0,0,.035)';t.fillRect(R(W),R(H),1.2,1.2)}
  return c}
function fogAll(){f.globalCompositeOperation='source-over';f.globalAlpha=1;f.clearRect(0,0,W,H);f.drawImage(tex,0,0);
  drops=[];for(let i=0;i<70;i++)drops.push({x:R(W),y:R(H),r:.8+R(1.6),v:0,s:1})}
function size(){const r=pg.getBoundingClientRect();W=Math.round(r.width);H=Math.round(r.height);if(!W||!H)return false;
  cf.width=W;cf.height=H;const D=Math.min(2,devicePixelRatio||1);cx.width=W*D;cx.height=H*D;x.setTransform(D,0,0,D,0,0);
  tex=makeTex();fogAll();return true}

/* ---------- 擦开 ---------- */
function wipe(px,py,r,a=1){
  f.globalCompositeOperation='destination-out';
  const g=f.createRadialGradient(px,py,0,px,py,r);
  g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.6,`rgba(0,0,0,${a*.9})`);g.addColorStop(1,'rgba(0,0,0,0)');
  f.fillStyle=g;f.beginPath();f.arc(px,py,r,0,7);f.fill();f.globalCompositeOperation='source-over'}
function line(a,b,r){const dx=b.x-a.x,dy=b.y-a.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(r/3)));
  for(let i=1;i<=n;i++){const px=a.x+dx*i/n,py=a.y+dy*i/n;wipe(px,py,r);
    if(Math.random()<.035)add.push({x:px+(Math.random()-.5)*r*1.4,y:py+r*(.5+R(.4)),r:2+R(3),v:0})}
  drops=drops.filter(d=>!(d.s&&Math.hypot(d.x-b.x,d.y-b.y)<r))}
const pt=e=>{const r=cx.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
cx.addEventListener('pointerdown',e=>{try{cx.setPointerCapture(e.pointerId)}catch(z){}last=pt(e);wipe(last.x,last.y,22);if(!busy)say('')});
cx.addEventListener('pointermove',e=>{if(!last)return;const p=pt(e);line(last,p,22);last=p});
['pointerup','pointercancel'].forEach(ev=>cx.addEventListener(ev,()=>{last=null}));

/* ---------- 水珠和水痕 ---------- */
function drawDrop(d){const r=d.r;x.beginPath();x.arc(d.x,d.y,r,0,7);
  const g=x.createRadialGradient(d.x-r*.3,d.y-r*.3,r*.1,d.x,d.y,r);
  g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(.7,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(60,60,80,.22)');
  x.fillStyle=g;x.fill()}
function frame(){if(!run)return;
  const sp=S.fogSpeed==null?.0022:S.fogSpeed;
  if(sp&&!last){f.globalAlpha=sp;f.drawImage(tex,0,0);f.globalAlpha=1}
  x.clearRect(0,0,W,H);
  drops=drops.filter(d=>{
    if(!d.s&&d.r>2.6){d.v=Math.min(1.8,d.v+.03+R(.02));d.y+=d.v;d.x+=(Math.random()-.5)*.4;wipe(d.x,d.y,d.r*.75,.6);d.r-=.006;
      if(Math.random()<.008)add.push({x:d.x,y:d.y,r:1+R(1),v:0,life:400})}
    if(d.life!=null&&--d.life<=0)return false;
    if(d.y>H+10||d.r<.6)return false;
    drawDrop(d);return true});
  if(add.length){drops=drops.concat(add);add=[]}
  if(drops.length>400)drops.splice(0,drops.length-400);
  raf=requestAnimationFrame(frame)}

/* ---------- 他在雾上写字 ---------- */
async function stroke(build,len,dur,w){const t0=performance.now();
  f.save();f.globalCompositeOperation='destination-out';f.lineWidth=w;f.lineCap='round';f.lineJoin='round';f.strokeStyle='#000';
  for(;;){const k=Math.min(1,(performance.now()-t0)/dur);f.setLineDash([len*k+.1,len*2]);build();if(k>=1||!run)break;await nf()}
  f.setLineDash([]);f.restore()}
const drip=(px,py,n)=>{for(let i=0;i<n;i++)add.push({x:px+(Math.random()-.5)*20,y:py,r:3+R(1.8),v:0})};
async function writeIt(t){
  t=String(t||'').trim();
  const cy=H*(.36+R(.16));
  if(/^[♡❤💗💕心\s\ufe0f]+$/.test(t)){const s=Math.min(W,H)*.22,c=W/2;
    await stroke(()=>{f.beginPath();f.moveTo(c,cy+s*.45);f.bezierCurveTo(c-s*1.1,cy-s*.2,c-s*.5,cy-s,c,cy-s*.4);f.bezierCurveTo(c+s*.5,cy-s,c+s*1.1,cy-s*.2,c,cy+s*.45);f.stroke()},s*4.4,1600,14);
    drip(c,cy+s*.45,2);return}
  const ch=[...t].slice(0,8),rows=ch.length>5?[ch.slice(0,Math.ceil(ch.length/2)),ch.slice(Math.ceil(ch.length/2))]:[ch];
  const sz=Math.min(110,W*.84/Math.max(...rows.map(r=>r.length)));
  f.font=`600 ${sz}px 'Songti SC','STSong','Noto Serif SC',serif`;f.textAlign='center';f.textBaseline='middle';
  for(let ri=0;ri<rows.length;ri++){const row=rows[ri],py=cy+(ri-(rows.length-1)/2)*sz*1.15,x0=W/2-row.length*sz/2;
    for(let i=0;i<row.length;i++){if(!run)return;const px=x0+i*sz+sz/2;
      await stroke(()=>f.strokeText(row[i],px,py),sz*7,700,Math.max(6,sz*.1));
      f.save();f.globalCompositeOperation='destination-out';f.globalAlpha=.9;f.fillText(row[i],px,py);f.restore();
      if(Math.random()<.6)drip(px,py+sz*.45,1);
      await sleep(120)}}}
async function himWrite(){
  if(busy)return;if(!S.apiKey)return toast('还没有填 API Key');busy=true;say(`${S.hisName}在看着这扇窗…`);
  try{const t=await callAI(sceneSystem('你们在「365」的雾窗前，玻璃上起了一层雾，她刚刚用手指在上面涂涂画画。'),
      [{role:'user',text:`请以${S.hisName}的身份，用手指在起雾的玻璃上给她写点什么：一个词或者很短的一句话，不超过 6 个字；也可以只画一颗心，那就只输出 ♡。按你们现在的关系和你的性格来写，不要用 emoji，不要加引号，只输出要写在玻璃上的内容。`}]);
    const s=clean(t).replace(/["“”「」『』。，,.]/g,'').split('\n')[0].trim().slice(0,8)||'♡';
    say(`${S.hisName}在写…`);await writeIt(s);wrote={t:Date.now(),s}}
  catch(e){toast(e.message)}
  finally{busy=false;say('')}}
$('#fgHim').onclick=himWrite;
$('#fgMore').onclick=()=>{const v=S.fogSpeed==null?.0022:S.fogSpeed,lab=v===0?'不回来':v<.002?'慢':v>.003?'快':'正常';
  sheet([['重新起雾',fogAll],
    [`雾回来的速度：${lab}`,()=>sheet([['慢',.0012],['正常',.0022],['快',.005],['不回来',0]].map(([n,k])=>[n,()=>{S.fogSpeed=k;saveSettings()}]))],
    ['让他画一颗心',()=>{if(!busy)writeIt('♡')}]])};

HOOKS.context.push(()=>wrote&&Date.now()-wrote.t<36e5?`【雾窗】你刚才在起雾的窗户上，用手指给她写了「${wrote.s}」。`:'');

/* ---------- 进出页面 ---------- */
function start(){run=true;document.body.classList.add('fogb');
  requestAnimationFrame(()=>{if(!run||!size())return;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);say('用手指擦开雾气')})}
function stop(){run=false;cancelAnimationFrame(raf);document.body.classList.remove('fogb')}
window.addEventListener('resize',()=>{if(run)size()});
addMore({go:'fog',cn:'雾窗',ce:'misty window'});
HOOKS.page.push(n=>{if(n==='fog')start();else if(run)stop()});
})();
