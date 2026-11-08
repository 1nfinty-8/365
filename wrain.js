/* ===== 365 · wrain.js · 游戏：字雨（落下几个词，一起造句） ===== */
(()=>{
if(!Array.isArray(DATA.wrain))DATA.wrain=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('wrain'))LISTS.push('wrain');
const save=()=>saveData('wrain');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const RAIN='的一是在不了有人这中大为上个我以要他时来们生到地出就分对成会可发年动同也能下过子说种面方后多定行学所得经之进着等家力里如水高自起小现都两体点从好开合还其些然前外天日那事平相全间样与关重新内正心你明看又么第向道此变只没意月无很情最想通直见回处越空写色花感声近满亲听雨风云雪光夜灯梦星海河山草树叶鸟鱼猫狗眼耳音味香甜苦冷暖热凉远慢快笑哭找走跑停念爱抱吻睡醒窗门路桥船车信书纸笔墨歌诗酒茶糖衣伞影镜钟线雾霜露潮岸沙石林湖泉晨昏春夏秋冬';
const A='冰箱 路灯 棉花糖 拖鞋 月亮 易拉罐 雨伞 枕头 外卖 仙人掌 旧照片 耳机 橘子 自行车 玻璃杯 口红 钥匙 便利店 云朵 地铁 猫爪 草莓 毛毯 闹钟 蜡烛 气球 信封 电梯 晚霞 薯片 围巾 煎蛋 水母 风筝 牙刷 冰淇淋'.split(' ');
const B='偷偷 迟到 发呆 私奔 打瞌睡 撒娇 绕路 吵架 晒太阳 排队 装傻 跑调 等红灯 数星星 吃醋 讨价还价 捉迷藏 失眠 走神 喝醉 偷吃 认错 赖床 告白 逃课 打包'.split(' ');
const C='一百年 凌晨三点 宇宙 热乎乎 皱巴巴 不讲理 第二次 半杯 透明 黏糊糊 慢吞吞 亮晶晶 乱七八糟 有点咸 全世界 下辈子 冒泡 偷来的 软绵绵 反方向 世界末日 外星人'.split(' ');
const rc=()=>RAIN[Math.random()*RAIN.length|0];
const rnd=(a,b)=>a+Math.random()*(b-a);
const one=L=>L[Math.random()*L.length|0];
const sr=seed=>{let s=Math.abs(Math.floor(seed))%2147483646+1;return()=>(s=s*16807%2147483647)/2147483647};
const ws=r=>r.words||(r.ch?[r.ch]:[]);
let cur=null,busy=false,on=false,raf=0,introT=null;

document.head.insertAdjacentHTML('beforeend',`<style>
#page-wrain{padding:0;overflow:hidden}
#page-wrain.active{display:flex;flex-direction:column}
body.wrb #tabbar{display:none}
.wr-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 4px}
.wr-top b{flex:1;text-align:center;font-family:var(--ti);font-weight:400;font-size:17px;letter-spacing:8px}
.wr-stage{position:relative;flex:none;height:46vh;min-height:280px}
#wrCv{position:absolute;inset:0;width:100%;height:100%}
#wrCh{position:absolute;left:50%;width:92%;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:6px 16px;transform:translate(-50%,-100%);padding-bottom:14px;pointer-events:none}
#wrCh span{font-family:var(--ti);color:var(--ink);line-height:1.1;opacity:0;transform:translateY(30px) scale(.4);transition:opacity .5s,transform .7s cubic-bezier(.2,1.5,.4,1);text-shadow:0 3px 14px rgba(255,255,255,.7)}
#wrCh.show span{opacity:1;transform:translateY(0) scale(1) rotate(var(--r))}
.wr-tip{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:12.5px;color:var(--sub);letter-spacing:2px;padding:0 16px}
.wr-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 20px 20px}
.wr-row{display:flex;flex-direction:column;margin:22px 0 6px}
.wr-row.me{align-items:flex-end}
.wr-row.him{align-items:flex-start}
.wr-n{position:relative;max-width:82%;filter:drop-shadow(0 6px 10px rgba(60,40,30,.18))}
.wr-p{padding:22px 22px 18px;font-family:var(--ti);font-size:16px;line-height:1.85;color:#3a2e2a;word-break:break-word;letter-spacing:.5px}
.wr-hl{font-weight:600;color:var(--accent-t)}
.wr-tape{position:absolute;top:-9px;width:64px;height:20px;margin-left:-32px;background:rgba(232,230,222,.75);border-left:1px dashed rgba(255,255,255,.85);border-right:1px dashed rgba(255,255,255,.85)}
.wr-wait{background:#F5F1E8;color:#8a7d75;font-style:italic;clip-path:polygon(0 2%,100% 0,98% 100%,1% 97%)}
.wr-who{font-size:11px;color:var(--sub);margin:6px 6px 0;letter-spacing:1px}
.wr-empty{text-align:center;margin:20px 0 10px;font-family:var(--ti);font-size:15px;color:var(--sub);letter-spacing:2px;line-height:1.8}
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
  <div class="wr-in glass"><textarea id="wrIn" rows="1" placeholder="把这几个词写进一句话…"></textarea><button class="pill" id="wrSend">递过去</button></div>
</section>`);

/* ---------- 游戏页里的卡片 ---------- */
function card(){if(!$('#page-game [data-go="wrain"]')){
    const h='<button class="gm-card glass" data-go="wrain"><span class="gm-ic cd">雨</span><span><b>字雨</b><small id="wrInfo"></small></span></button>';
    const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h)}
  const n=DATA.wrain.filter(r=>r.notes.length).length,e=$('#wrInfo');
  if(e)e.textContent=n?`下过 ${n} 场雨`:'落下几个词，一起造句'}
card();

/* ---------- 水滴形状：上尖下圆 ---------- */
const SHAPE=[];for(let i=0;i<=40;i++){const t=Math.PI*i/40;SHAPE.push([Math.sin(t)*Math.pow(Math.sin(t/2),1.3)*1.45,(1-Math.cos(t))/2])}
const hwAt=yn=>{const t=Math.acos(1-2*Math.min(1,Math.max(0,yn)));return Math.sin(t)*Math.pow(Math.sin(t/2),1.3)*1.45};

/* ---------- 下雨 ---------- */
const cv=$('#wrCv'),g=cv.getContext('2d');
let W=0,Hh=0,LY=0,FONT='serif',ink='#2E1A1F',acc='#8C7A80',strokes=[],drops=[],parts=[],rips=[],spawn=0,heavy=false,last=0;
function size(){const r=cv.getBoundingClientRect(),D=devicePixelRatio||1;W=r.width;Hh=r.height;if(!W)return;
  cv.width=W*D;cv.height=Hh*D;g.setTransform(D,0,0,D,0,0);LY=Hh*.8;$('#wrCh').style.top=LY+'px';
  const cs=getComputedStyle(document.documentElement);
  ink=cs.getPropertyValue('--ink').trim()||ink;acc=cs.getPropertyValue('--accent-t').trim()||acc;FONT=cs.getPropertyValue('--ti').trim()||'serif';
  strokes=[...Array(6)].map(()=>({y:LY+rnd(-5,5),x0:W*rnd(.03,.12),x1:W*rnd(.88,.97),w:rnd(3,9),a:rnd(.15,.4),tilt:rnd(-4,4)}))}
function mk(x,R,big){const Hd=R*2.7,fs=big?13:Math.max(8,R*.32),pts=[];
  for(let y=fs*.6;y<Hd;y+=fs*1.02){const yn=y/Hd,hw=hwAt(yn)*R;
    for(let dx=-hw;dx<=hw;dx+=fs*1.05){const edge=hw?Math.abs(dx)/hw:1;
      pts.push({dx:dx+rnd(-1.2,1.2),dy:y-Hd+rnd(-1.2,1.2),c:rc(),s:fs*rnd(.65,1.35),a:Math.min(.95,rnd(.12,.45)+edge*.5)})}}
  return {x,y:-8,R,Hd,v:big?340:rnd(170,260),pts,big,fade:1}}
function drawDrop(d){const top=d.y-d.Hd;
  g.save();g.beginPath();g.rect(0,0,W,LY+1);g.clip();g.globalAlpha=d.fade;
  g.beginPath();SHAPE.forEach(([hx,yn],i)=>{const X=d.x+hx*d.R,Y=top+yn*d.Hd;i?g.lineTo(X,Y):g.moveTo(X,Y)});
  for(let i=SHAPE.length-1;i>=0;i--){const[hx,yn]=SHAPE[i];g.lineTo(d.x-hx*d.R,top+yn*d.Hd)}g.closePath();
  const gr=g.createLinearGradient(d.x-d.R,top,d.x+d.R,d.y);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,.08)');
  g.fillStyle=gr;g.fill();g.strokeStyle=acc;g.globalAlpha=d.fade*.35;g.lineWidth=1.2;g.stroke();
  g.globalAlpha=d.fade*.7;g.fillStyle='#fff';g.beginPath();g.ellipse(d.x-d.R*.38,d.y-d.R*.95,d.R*.14,d.R*.3,-.5,0,7);g.fill();
  g.fillStyle=ink;
  for(const p of d.pts){g.globalAlpha=p.a*d.fade;g.font=p.s.toFixed(1)+'px '+FONT;g.fillText(p.c,d.x+p.dx,d.y+p.dy)}
  g.restore()}
function splash(d){heavy=false;
  d.pts.forEach(p=>{const y=d.y+p.dy;if(y<=LY)parts.push({x:d.x+p.dx,y,vx:rnd(-190,190),vy:rnd(-380,-100),c:p.c,s:p.s,a:p.a,life:1})});
  rips.push({x:d.x,r:8,a:.8,big:1},{x:d.x,r:2,a:.6,big:1});
  $('#wrCh').classList.add('show');navigator.vibrate?.(25)}
function frame(t){if(!on)return;raf=requestAnimationFrame(frame);
  const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  spawn-=dt;if(spawn<=0){spawn=heavy?rnd(.22,.45):rnd(.9,1.8);drops.push(mk(rnd(.08,.92)*W,rnd(14,30)))}
  g.clearRect(0,0,W,Hh);g.textAlign='center';g.textBaseline='middle';
  g.lineCap='round';g.strokeStyle=acc;
  for(const s of strokes){g.globalAlpha=s.a;g.lineWidth=s.w;g.beginPath();g.moveTo(s.x0,s.y);g.quadraticCurveTo(W/2,s.y+s.tilt,s.x1,s.y-s.tilt*.5);g.stroke()}
  g.lineWidth=1;
  for(const r of rips){r.r+=(r.big?120:50)*dt;r.a-=dt*(r.big?.35:1.2);if(r.a>0){g.globalAlpha=r.a;g.beginPath();g.ellipse(r.x,LY,r.r,r.r*.16,0,0,7);g.stroke()}}
  rips=rips.filter(r=>r.a>0);
  for(const d of drops){
    if(d.hit){d.fade-=dt*3;if(d.fade<=0){d.dead=1;continue}}
    else{d.y+=d.v*dt;if(d.y>=LY){d.y=LY;if(d.big){splash(d);d.dead=1;continue}d.hit=1;rips.push({x:d.x,r:3,a:.6})}}
    drawDrop(d)}
  drops=drops.filter(d=>!d.dead);
  g.fillStyle=ink;
  for(const p of parts){p.vy+=720*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*.9;
    if(p.life>0&&p.y<LY+2){g.globalAlpha=p.a*p.life;g.font=p.s.toFixed(1)+'px '+FONT;g.fillText(p.c,p.x,p.y)}}
  parts=parts.filter(p=>p.life>0&&p.y<LY+2);
  g.globalAlpha=1}
function loop(){cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(frame)}
function showWords(){const c=$('#wrCh');c.classList.remove('show');
  c.innerHTML=ws(cur).map((w,i)=>`<span style="font-size:${(rnd(26,38)-w.length*1.5).toFixed(0)}px;--r:${rnd(-6,6).toFixed(1)}deg;transition-delay:${i*.18}s">${esc(w)}</span>`).join('')}
function intro(){clearTimeout(introT);heavy=true;showWords();
  introT=setTimeout(()=>{if(!on)return still();drops.push(mk(W/2,Math.min(W*.17,72),true))},1900)}
function still(){clearTimeout(introT);heavy=false;drops=drops.filter(d=>!d.big);showWords();requestAnimationFrame(()=>$('#wrCh').classList.add('show'))}

/* ---------- 纸条 ---------- */
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function hl(s){const L=ws(cur).filter(Boolean).sort((a,b)=>b.length-a.length);const h=esc(s);if(!L.length)return h;
  return h.replace(new RegExp(L.map(w=>reEsc(esc(w))).join('|'),'g'),m=>`<span class="wr-hl">${m}</span>`)}
function note(n){const r=sr(n.t),me=n.role==='user',j=()=>(r()*3).toFixed(1),k=()=>(100-r()*3).toFixed(1),P=[];
  for(let i=0;i<=5;i++)P.push(`${i*20}% ${j()}%`);
  for(let i=1;i<=4;i++)P.push(`${k()}% ${i*20}%`);
  for(let i=5;i>=0;i--)P.push(`${i*20}% ${k()}%`);
  for(let i=4;i>=1;i--)P.push(`${j()}% ${i*20}%`);
  const a1=(r()*60+60)|0,a2=(r()*60-30)|0,p1=(r()*40+30)|0,p2=(r()*40+30)|0;
  const bg=`linear-gradient(${a1}deg,transparent ${p1-2}%,rgba(0,0,0,.06) ${p1}%,rgba(255,255,255,.7) ${p1+1}%,transparent ${p1+4}%),linear-gradient(${a2}deg,transparent ${p2-2}%,rgba(0,0,0,.05) ${p2}%,rgba(255,255,255,.6) ${p2+1}%,transparent ${p2+3}%),radial-gradient(circle at ${(r()*100)|0}% ${(r()*100)|0}%,rgba(255,255,255,.7),transparent 60%),#F3EEE4`;
  const rot=((r()-.5)*6).toFixed(1),tl=(25+r()*50)|0,tr=((r()-.5)*14).toFixed(1);
  return `<div class="wr-row ${me?'me':'him'}"><div class="wr-n" style="transform:rotate(${rot}deg)"><div class="wr-p" style="background:${bg};clip-path:polygon(${P.join(',')})">${hl(n.text)}</div><i class="wr-tape" style="left:${tl}%;transform:rotate(${tr}deg)"></i></div><div class="wr-who">${me?'我':esc(S.hisName)} · ${fmtTime(n.t)}</div></div>`}
const qw=r=>ws(r).map(w=>`「${w}」`).join('');
function renderList(){if(!cur)return;const L=$('#wrList');
  $('#wrTip').textContent=`把 ${qw(cur)} 写进一句话`;
  let h=cur.notes.map(note).join('');
  if(!cur.notes.length&&!busy)h=`<div class="wr-empty"><p>雨停了，落下 ${esc(qw(cur))}<br>把它们凑成一句话吧</p><button class="pill ghost" id="wrFirst">让${esc(S.hisName)}先写</button></div>`;
  if(busy)h+=`<div class="wr-row him"><div class="wr-n"><div class="wr-p wr-wait">${esc(S.hisName)}在写纸条…</div></div></div>`;
  L.innerHTML=h;requestAnimationFrame(()=>L.scrollTop=L.scrollHeight)}

/* ---------- 一场雨 ---------- */
function pickWords(){const n=Math.min(4,Math.max(2,+S.wrN||3)),used=DATA.wrain.slice(-8).flatMap(ws);
  const from=L=>{const P=L.filter(w=>!used.includes(w));return one(P.length?P:L)};
  const out=[from(A),from(B),from(C)];if(n===4){let w;do{w=from(A)}while(out.includes(w));out.push(w)}
  return out.sort(()=>Math.random()-.5).slice(0,n)}
function newRound(){cur={id:uid(),words:pickWords(),t:Date.now(),at:Date.now(),notes:[]};
  DATA.wrain.push(cur);if(DATA.wrain.length>100)DATA.wrain.shift();save();renderList();if(on)intro()}
function enter(){on=true;requestAnimationFrame(()=>{if(!on)return;size();drops=[];parts=[];rips=[];spawn=0;
  const L=DATA.wrain.at(-1);if(L&&!L.notes.length&&Date.now()-L.t>6*36e5)DATA.wrain.pop();
  const R=DATA.wrain.at(-1);
  if(R&&R.words&&Date.now()-(R.at||R.t)<6*36e5){cur=R;still();renderList()}else newRound();
  loop()})}
function leave(){on=false;cancelAnimationFrame(raf);clearTimeout(introT)}

/* ---------- 写纸条 ---------- */
const grow=()=>{const t=$('#wrIn');t.style.height='26px';t.style.height=Math.min(120,t.scrollHeight)+'px'};
async function send(){if(!cur||busy)return;const ta=$('#wrIn'),v=ta.value.trim();
  if(!v)return toast('写点什么吧');
  const miss=ws(cur).filter(w=>!v.includes(w));if(miss.length)return toast(`还没用上：${miss.map(w=>'「'+w+'」').join('')}`);
  cur.notes.push({role:'user',text:v,t:Date.now()});cur.at=Date.now();ta.value='';grow();await save();renderList();his()}
async function his(){if(!cur||busy)return;if(!S.apiKey)return toast('还没有填 API Key');busy=true;const r=cur;renderList();
  try{const prev=r.notes.slice(-8).map(n=>`${n.role==='user'?'她':'你'}：${n.text}`).join('\n');
    let t=await callAI(sceneSystem('你们在「365」里玩一个叫「字雨」的小游戏：天上下了一场字雨，最后落下几个毫不相干的词，你们轮流用这几个词造一个句子，写在揉皱的小纸条上递给对方。'),
      [{role:'user',text:`这次落下来的词是：${qw(r)}。${prev?'纸条上已经写了：\n'+prev+'\n':''}请写一个句子，这几个词要全部用上、原样出现。词越不相干，越要想办法把它们自然又有趣地连起来：可以接她的话、逗她、说情话，也可以一本正经地胡说八道，按你的性格来。一句话，不超过 50 字，不要 emoji，不要引号，只输出这句话。`}]);
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
  const acts=[['再下一场雨',()=>{if(cur&&!cur.notes.length)DATA.wrain=DATA.wrain.filter(x=>x!==cur);newRound()}],
    [`词的数量（现在 ${+S.wrN||3} 个）`,()=>sheet([2,3,4].map(n=>[`${n} 个词`,()=>{S.wrN=n;saveSettings();if(cur&&!cur.notes.length)DATA.wrain=DATA.wrain.filter(x=>x!==cur);newRound()}]))]];
  const old=DATA.wrain.filter(r=>r.notes.length&&r!==cur);
  if(old.length)acts.push(['以前的雨',()=>sheet([...old].reverse().slice(0,30).map(r=>[`${ws(r).join(' · ')} · ${fmtDate(r.t)} · ${r.notes.length} 张`,()=>{cur=r;still();renderList()}]))]);
  if(cur&&cur.notes.length)acts.push(['删除这一场',async()=>{if(!confirm('删除这一场？纸条都会删掉。'))return;DATA.wrain=DATA.wrain.filter(x=>x!==cur);await save();newRound()}]);
  sheet(acts)};

/* ---------- 他记得刚玩过 ---------- */
HOOKS.context.push(()=>{const r=DATA.wrain.at(-1);if(!r||!r.notes.length||Date.now()-(r.at||r.t)>2*36e5)return '';
  return `【字雨】她刚才在 365 里和你玩字雨，落下来的词是${qw(r)}，纸条上写了：`+r.notes.slice(-6).map(n=>`${n.role==='user'?'她':'你'}：${n.text}`).join('；')+'。可以自然地接上，不用刻意提。'});

window.addEventListener('resize',()=>{if(on)size()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else if($('#page-wrain').classList.contains('active')){on=true;loop()}});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.wrain))DATA.wrain=[];card()});
HOOKS.page.push(n=>{document.body.classList.toggle('wrb',n==='wrain');
  if(n==='wrain')enter();else leave();
  if(n==='game')card()});
})();
