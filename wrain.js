/* ===== 365 · wrain.js · 游戏：字雨 ===== */
(()=>{
if(!Array.isArray(DATA.wrain))DATA.wrain=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('wrain'))LISTS.push('wrain');
const save=()=>saveData('wrain');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const RAIN='的一是在不了有人这中大为上个我以要他时来们生到地出就分对成会可发年动同也能下过子说种面方后多定行学所得经三之进着等家力里如水高自起小物现都两体当点从好开合还因其些然前外天日那事平相全间样与关重新内正心你明看又么但第向道此变条只没意月无很情最想通直题展果见回则任取处府越至空精候写色花感声叫近满怎周神达亲听非雨风云雪光夜灯梦星海河山草树叶鸟鱼猫狗眼耳音味香甜苦冷暖热凉远慢快笑哭找走跑停念爱抱吻睡醒窗门路桥船车信书纸笔墨歌诗酒茶糖衣伞影镜钟针线雾霜露潮岸沙石林谷湖泉晨昏春夏秋冬';
const PICK='雨等灯慢想海甜夜光风月星梦抱暖藏醒眠云雪花路远近心耳偷跑哭笑糖酒窗门影声冷热晚早春秋冬山河桥船信鱼猫狗树叶烟镜纸书歌听走停追找忘记乖坏懂吻伞茶醉闹软哄疼怕赖盼留陪守';
const rc=()=>RAIN[Math.random()*RAIN.length|0];
const rnd=(a,b)=>a+Math.random()*(b-a);
const sr=seed=>{let s=Math.abs(Math.floor(seed))%2147483646+1;return()=>(s=s*16807%2147483647)/2147483647};
let cur=null,busy=false,on=false,raf=0,introT=null;

document.head.insertAdjacentHTML('beforeend',`<style>
#page-wrain{padding:0;overflow:hidden}
#page-wrain.active{display:flex;flex-direction:column}
body.wrb #tabbar{display:none}
.wr-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 4px}
.wr-top b{flex:1;text-align:center;font-family:var(--ti);font-weight:400;font-size:17px;letter-spacing:8px}
.wr-stage{position:relative;flex:none;height:40vh;min-height:250px}
#wrCv{position:absolute;inset:0;width:100%;height:100%}
#wrCh{position:absolute;left:50%;top:70%;font-family:var(--ti);font-size:min(22vw,96px);line-height:1;color:var(--ink);opacity:0;transform:translate(-50%,-80%) scale(.5);transition:opacity .6s,transform .7s cubic-bezier(.2,1.4,.4,1);pointer-events:none;text-shadow:0 4px 18px rgba(255,255,255,.6)}
#wrCh.show{opacity:1;transform:translate(-50%,-112%) scale(1)}
.wr-tip{position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:12.5px;color:var(--sub);letter-spacing:2px}
.wr-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 20px 20px}
.wr-row{display:flex;flex-direction:column;margin:22px 0 6px}
.wr-row.me{align-items:flex-end}
.wr-row.him{align-items:flex-start}
.wr-n{position:relative;max-width:80%;filter:drop-shadow(0 6px 10px rgba(60,40,30,.18))}
.wr-p{padding:22px 22px 18px;font-family:var(--ti);font-size:16px;line-height:1.85;color:#3a2e2a;word-break:break-word;letter-spacing:.5px}
.wr-hl{font-weight:600;color:var(--accent-t);font-size:1.15em}
.wr-tape{position:absolute;top:-9px;width:64px;height:20px;margin-left:-32px;background:rgba(232,230,222,.75);border-left:1px dashed rgba(255,255,255,.85);border-right:1px dashed rgba(255,255,255,.85)}
.wr-wait{background:#F5F1E8;color:#8a7d75;font-style:italic;clip-path:polygon(0 2%,100% 0,98% 100%,1% 97%)}
.wr-who{font-size:11px;color:var(--sub);margin:6px 6px 0;letter-spacing:1px}
.wr-empty{text-align:center;margin:26px 0 10px;font-family:var(--ti);font-size:15px;color:var(--sub);letter-spacing:2px}
.wr-empty p{margin-bottom:14px}
.wr-in{flex:none;display:flex;gap:8px;align-items:flex-end;margin:0 12px calc(var(--sb) + 10px);padding:8px 8px 8px 16px;border-radius:24px}
#wrIn{flex:1;border:0;background:transparent;outline:none;resize:none;font:16px/1.6 var(--ti);color:var(--ink);max-height:120px;height:26px;padding:4px 0}
.wr-in .pill{flex:none}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-wrain">
  <div class="wr-top"><button class="iconbtn glass" data-go="game" aria-label="返回">${BACK}</button><b>字雨</b><button class="iconbtn glass" id="wrMenu" style="letter-spacing:1px">···</button></div>
  <div class="wr-stage"><canvas id="wrCv"></canvas><div id="wrCh"></div><p class="wr-tip" id="wrTip"></p></div>
  <div class="wr-list" id="wrList"></div>
  <div class="wr-in glass"><textarea id="wrIn" rows="1" placeholder="写在纸条上…"></textarea><button class="pill" id="wrSend">递过去</button></div>
</section>`);

/* ---------- 游戏页里的卡片 ---------- */
function card(){if(!$('#page-game [data-go="wrain"]')){
    const h='<button class="gm-card glass" data-go="wrain"><span class="gm-ic cd">雨</span><span><b>字雨</b><small id="wrInfo"></small></span></button>';
    const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h)}
  const n=DATA.wrain.filter(r=>r.notes.length).length,e=$('#wrInfo');
  if(e)e.textContent=n?`下过 ${n} 场雨`:'落下一个字，一起造句'}
card();

/* ---------- 下雨 ---------- */
const cv=$('#wrCv'),g=cv.getContext('2d');
let W=0,Hh=0,LY=0,FONT='serif',ink='#2E1A1F',acc='#8C7A80',strokes=[],drops=[],parts=[],rips=[],spawn=0,heavy=false,last=0;
function size(){const r=cv.getBoundingClientRect(),D=devicePixelRatio||1;W=r.width;Hh=r.height;if(!W)return;
  cv.width=W*D;cv.height=Hh*D;g.setTransform(D,0,0,D,0,0);LY=Hh*.74;$('#wrCh').style.top=LY+'px';
  const cs=getComputedStyle(document.documentElement);
  ink=cs.getPropertyValue('--ink').trim()||ink;acc=cs.getPropertyValue('--accent-t').trim()||acc;FONT=cs.getPropertyValue('--ti').trim()||'serif';
  strokes=[...Array(6)].map(()=>({y:LY+rnd(-5,5),x0:W*rnd(.03,.12),x1:W*rnd(.88,.97),w:rnd(3,9),a:rnd(.15,.4),tilt:rnd(-4,4)}))}
function mk(x,R,fs,v,isBig){const pts=[],st=fs*1.05,K=2.3;
  for(let y=-K*R;y<=R;y+=st)for(let dx=-R;dx<=R;dx+=st){
    if(dx*dx+y*y<=R*R||(y<0&&Math.abs(dx)<=R*(y+K*R)/(K*R)))pts.push({dx:dx+rnd(-1.5,1.5),dy:y+rnd(-1.5,1.5),c:rc(),s:fs*rnd(.7,1.4),a:rnd(.12,.8)})}
  if(!pts.length)pts.push({dx:0,dy:0,c:rc(),s:fs,a:.6});
  return {x,y:-R,R,v,pts,big:isBig,fade:1}}
function splash(d){heavy=false;
  d.pts.forEach(p=>{const y=d.y+p.dy;if(y<=LY)parts.push({x:d.x+p.dx,y,vx:rnd(-170,170),vy:rnd(-340,-90),c:p.c,s:p.s,a:p.a,life:1})});
  rips.push({x:d.x,r:6,a:.7,big:1},{x:d.x,r:2,a:.5,big:1});
  $('#wrCh').classList.add('show');navigator.vibrate?.(25)}
function frame(t){if(!on)return;raf=requestAnimationFrame(frame);
  const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  spawn-=dt;if(spawn<=0){spawn=heavy?rnd(.08,.2):rnd(.7,1.5);drops.push(mk(rnd(.05,.95)*W,rnd(9,20),rnd(8,11),rnd(160,280)))}
  g.clearRect(0,0,W,Hh);
  g.lineCap='round';g.strokeStyle=acc;
  for(const s of strokes){g.globalAlpha=s.a;g.lineWidth=s.w;g.beginPath();g.moveTo(s.x0,s.y);g.quadraticCurveTo(W/2,s.y+s.tilt,s.x1,s.y-s.tilt*.5);g.stroke()}
  g.lineWidth=1;
  for(const r of rips){r.r+=(r.big?110:45)*dt;r.a-=dt*(r.big?.35:1.3);if(r.a>0){g.globalAlpha=r.a;g.beginPath();g.ellipse(r.x,LY,r.r,r.r*.16,0,0,7);g.stroke()}}
  rips=rips.filter(r=>r.a>0);
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=ink;
  for(const d of drops){d.y+=d.v*dt;
    if(d.y+d.R>=LY){if(d.big){splash(d);d.dead=1;continue}
      if(!d.hit){d.hit=1;rips.push({x:d.x,r:2,a:.5})}d.fade-=dt*2.2;if(d.fade<=0){d.dead=1;continue}}
    for(const p of d.pts){const y=d.y+p.dy;if(y>LY)continue;g.globalAlpha=p.a*d.fade;g.font=p.s.toFixed(1)+'px '+FONT;g.fillText(p.c,d.x+p.dx,y)}}
  drops=drops.filter(d=>!d.dead);
  for(const p of parts){p.vy+=700*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*.9;
    if(p.life>0&&p.y<LY+2){g.globalAlpha=p.a*p.life;g.font=p.s.toFixed(1)+'px '+FONT;g.fillText(p.c,p.x,p.y)}}
  parts=parts.filter(p=>p.life>0&&p.y<LY+2);
  g.globalAlpha=1}
function loop(){cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(frame)}
function intro(){clearTimeout(introT);heavy=true;const c=$('#wrCh');c.classList.remove('show');c.textContent=cur.ch;
  introT=setTimeout(()=>{if(!on)return still();drops.push(mk(W/2,Math.min(W*.1,42),12,320,true))},1800)}
function still(){clearTimeout(introT);heavy=false;drops=drops.filter(d=>!d.big);const c=$('#wrCh');c.textContent=cur?cur.ch:'';c.classList.add('show')}

/* ---------- 纸条 ---------- */
const hl=s=>{const c=esc(cur.ch);return esc(s).split(c).join(`<span class="wr-hl">${c}</span>`)};
function note(n){const r=sr(n.t),me=n.role==='user',j=()=>(r()*3).toFixed(1),k=()=>(100-r()*3).toFixed(1),P=[];
  for(let i=0;i<=5;i++)P.push(`${i*20}% ${j()}%`);
  for(let i=1;i<=4;i++)P.push(`${k()}% ${i*20}%`);
  for(let i=5;i>=0;i--)P.push(`${i*20}% ${k()}%`);
  for(let i=4;i>=1;i--)P.push(`${j()}% ${i*20}%`);
  const a1=(r()*60+60)|0,a2=(r()*60-30)|0,p1=(r()*40+30)|0,p2=(r()*40+30)|0;
  const bg=`linear-gradient(${a1}deg,transparent ${p1-2}%,rgba(0,0,0,.06) ${p1}%,rgba(255,255,255,.7) ${p1+1}%,transparent ${p1+4}%),linear-gradient(${a2}deg,transparent ${p2-2}%,rgba(0,0,0,.05) ${p2}%,rgba(255,255,255,.6) ${p2+1}%,transparent ${p2+3}%),radial-gradient(circle at ${(r()*100)|0}% ${(r()*100)|0}%,rgba(255,255,255,.7),transparent 60%),#F3EEE4`;
  const rot=((r()-.5)*6).toFixed(1),tl=(25+r()*50)|0,tr=((r()-.5)*14).toFixed(1);
  return `<div class="wr-row ${me?'me':'him'}"><div class="wr-n" style="transform:rotate(${rot}deg)"><div class="wr-p" style="background:${bg};clip-path:polygon(${P.join(',')})">${hl(n.text)}</div><i class="wr-tape" style="left:${tl}%;transform:rotate(${tr}deg)"></i></div><div class="wr-who">${me?'我':esc(S.hisName)} · ${fmtTime(n.t)}</div></div>`}
function renderList(){if(!cur)return;const L=$('#wrList');
  $('#wrTip').textContent=`用「${cur.ch}」造一个句子`;
  let h=cur.notes.map(note).join('');
  if(!cur.notes.length&&!busy)h=`<div class="wr-empty"><p>雨停的地方，落下一个「${esc(cur.ch)}」</p><button class="pill ghost" id="wrFirst">让${esc(S.hisName)}先写</button></div>`;
  if(busy)h+=`<div class="wr-row him"><div class="wr-n"><div class="wr-p wr-wait">${esc(S.hisName)}在写纸条…</div></div></div>`;
  L.innerHTML=h;requestAnimationFrame(()=>L.scrollTop=L.scrollHeight)}

/* ---------- 一场雨 ---------- */
function newRound(){const used=DATA.wrain.slice(-12).map(r=>r.ch),P=[...PICK].filter(c=>!used.includes(c)),A=P.length?P:[...PICK];
  cur={id:uid(),ch:A[Math.random()*A.length|0],t:Date.now(),at:Date.now(),notes:[]};
  DATA.wrain.push(cur);if(DATA.wrain.length>100)DATA.wrain.shift();save();renderList();if(on)intro()}
function enter(){on=true;requestAnimationFrame(()=>{if(!on)return;size();drops=[];parts=[];rips=[];spawn=0;
  const L=DATA.wrain.at(-1);if(L&&!L.notes.length&&Date.now()-L.t>6*36e5)DATA.wrain.pop();
  const R=DATA.wrain.at(-1);
  if(R&&Date.now()-(R.at||R.t)<6*36e5){cur=R;still();renderList()}else newRound();
  loop()})}
function leave(){on=false;cancelAnimationFrame(raf);clearTimeout(introT)}

/* ---------- 写纸条 ---------- */
const grow=()=>{const t=$('#wrIn');t.style.height='26px';t.style.height=Math.min(120,t.scrollHeight)+'px'};
async function send(){if(!cur||busy)return;const ta=$('#wrIn'),v=ta.value.trim();
  if(!v)return toast('写点什么吧');if(!v.includes(cur.ch))return toast(`句子里要有「${cur.ch}」`);
  cur.notes.push({role:'user',text:v,t:Date.now()});cur.at=Date.now();ta.value='';grow();await save();renderList();his()}
async function his(){if(!cur||busy)return;if(!S.apiKey)return toast('还没有填 API Key');busy=true;const r=cur;renderList();
  try{const prev=r.notes.slice(-8).map(n=>`${n.role==='user'?'她':'你'}：${n.text}`).join('\n');
    let t=await callAI(sceneSystem('你们在「365」里玩一个叫「字雨」的小游戏：天上下了一场字雨，最后落下一个字，你们轮流用这个字造句，写在揉皱的小纸条上递给对方。'),
      [{role:'user',text:`落下来的字是「${r.ch}」。${prev?'纸条上已经写了：\n'+prev+'\n':''}请用「${r.ch}」造一个句子，句子里一定要有「${r.ch}」这个字。可以接她的话、逗她、说情话，也可以写你自己的事，按你的性格来。一句话，不超过 40 字，不要 emoji，不要引号，只输出这句话。`}]);
    t=(clean(t).split('\n').map(s=>s.trim()).filter(Boolean)[0]||'');
    if(t.startsWith(S.hisName))t=t.slice(S.hisName.length).replace(/^[:：\s]+/,'');
    t=t.replace(/^["“「]|["”」]$/g,'').trim();
    if(!t)throw new Error('他没写出来');
    r.notes.push({role:'model',text:t,t:Date.now()});r.at=Date.now();await save()}
  catch(e){toast(e.message)}
  finally{busy=false;if(cur===r)renderList()}}
$('#wrIn').addEventListener('input',grow);
$('#wrSend').addEventListener('pointerdown',e=>e.preventDefault());
$('#wrSend').onclick=send;
$('#wrList').onclick=e=>{if(e.target.closest('#wrFirst'))his()};
$('#wrMenu').onclick=()=>{
  const acts=[['再下一场雨',()=>{if(cur&&!cur.notes.length)DATA.wrain=DATA.wrain.filter(x=>x!==cur);newRound()}]];
  const old=DATA.wrain.filter(r=>r.notes.length&&r!==cur);
  if(old.length)acts.push(['以前的字',()=>sheet([...old].reverse().slice(0,30).map(r=>[`「${r.ch}」 · ${fmtDate(r.t)} · ${r.notes.length} 张`,()=>{cur=r;still();renderList()}]))]);
  if(cur&&cur.notes.length)acts.push(['删除这一场',async()=>{if(!confirm(`删除「${cur.ch}」这一场？纸条都会删掉。`))return;DATA.wrain=DATA.wrain.filter(x=>x!==cur);await save();newRound()}]);
  sheet(acts)};

/* ---------- 他记得刚玩过 ---------- */
HOOKS.context.push(()=>{const r=DATA.wrain.at(-1);if(!r||!r.notes.length||Date.now()-(r.at||r.t)>2*36e5)return '';
  return `【字雨】她刚才在 365 里和你玩字雨，落下来的字是「${r.ch}」，纸条上写了：`+r.notes.slice(-6).map(n=>`${n.role==='user'?'她':'你'}：${n.text}`).join('；')+'。可以自然地接上，不用刻意提。'});

window.addEventListener('resize',()=>{if(on)size()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else if($('#page-wrain').classList.contains('active')){on=true;loop()}});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.wrain))DATA.wrain=[];card()});
HOOKS.page.push(n=>{document.body.classList.toggle('wrb',n==='wrain');
  if(n==='wrain')enter();else leave();
  if(n==='game')card()});
})();
