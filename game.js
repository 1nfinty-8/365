/* ===== 365 · game.js · 游戏：2048 + 小卡片 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const K='365-2048',KB='365-2048best',KP='365-2048play';
let B=[],score=0,best=+localStorage.getItem(KB)||0,fresh=-1,merged=[],over=false,won=0,busy=false;

document.head.insertAdjacentHTML('beforeend',`<style>
#moreGrid .card[data-go="cards"],#moreSm .card[data-go="cards"]{display:none!important}
.gm-card{position:relative;display:flex;align-items:center;gap:16px;width:100%;text-align:left;padding:18px 20px;margin-bottom:12px}
.gm-ic{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;flex:none;background:var(--accent);color:var(--acct);font-family:var(--num);font-style:italic;font-size:18px}
.gm-ic.cd{font-family:var(--ti);font-style:normal;font-size:20px;letter-spacing:2px}
.gm-card b{display:block;font-weight:500;font-size:17px;letter-spacing:2px}
.gm-card small{font-size:12px;color:var(--sub);letter-spacing:1px}
.gm-card .ndot{top:14px;right:16px}
.gm-card.has-dot .ndot{display:block}
.gm-soon{opacity:.45}
body.gmb #tabbar{display:none}
.g2-sc{display:flex;gap:10px;margin-bottom:14px}
.g2-sc div{flex:1;text-align:center;padding:10px 6px}
.g2-sc span{display:block;font-size:11.5px;color:var(--sub);letter-spacing:2px}
.g2-sc b{font-family:var(--num);font-style:italic;font-weight:300;font-size:30px;line-height:1.2;color:var(--accent-t)}
.g2-wrap{position:relative;max-width:420px;margin:0 auto}
#g2B{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px;border-radius:22px;touch-action:none;aspect-ratio:1}
.g2-t{border-radius:14px;display:grid;place-items:center;font-family:var(--num);font-weight:500;background:rgba(255,255,255,.35)}
.g2-t.n{animation:g2n .2s ease}
.g2-t.m{animation:g2m .2s ease}
@keyframes g2n{from{transform:scale(.3);opacity:0}}
@keyframes g2m{50%{transform:scale(1.12)}}
.g2-over{position:absolute;inset:0;border-radius:22px;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,.75);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-align:center;padding:20px}
.g2-over.show{display:flex;animation:fd .3s ease}
.g2-over b{font-family:var(--ti);font-size:24px;letter-spacing:4px}
.g2-over p{font-family:var(--ti);font-size:15px;line-height:1.8;color:var(--ink);max-width:260px}
.g2-btns{display:flex;gap:8px;justify-content:center;margin-top:8px}
.g2-tip{text-align:center;font-size:12px;color:var(--sub);letter-spacing:2px;margin-top:14px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-game"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button><h2>游戏</h2><em>games</em></div>
  <div class="sub-line">无聊的时候，来这里坐一会儿。</div>
  <button class="gm-card glass" data-go="g2048"><span class="gm-ic">2048</span><span><b>2048</b><small id="gmBest"></small></span></button>
  <button class="gm-card glass" data-go="cards" id="gmCards"><span class="gm-ic cd">卡</span><span><b>小卡片</b><small id="gmCd"></small></span><i class="ndot"></i></button>
  <div class="gm-card glass gm-soon"><span class="gm-ic">?</span><span><b>更多游戏</b><small>慢慢加</small></span></div>
</div></section>
<section class="page" id="page-g2048"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="game" aria-label="返回">${BACK}</button><h2>2048</h2><span class="sp"></span><button class="pill ghost" id="g2New">重新开始</button></div>
  <div class="g2-sc"><div class="glass"><span>分数</span><b id="g2S">0</b></div><div class="glass"><span>最高</span><b id="g2Bt">0</b></div></div>
  <div class="g2-wrap"><div class="glass" id="g2B"></div><div class="g2-over" id="g2O"></div></div>
  <p class="g2-tip">上下左右滑动，相同的数字会合在一起</p>
</div></section>`);

/* ---------- 小卡片：从小卡片返回到游戏页 ---------- */
$$('#page-cards [data-go="more"]').forEach(b=>b.dataset.go='game');
function cdInfo(){const C=DATA.cards||[],d=C.filter(c=>c.mode==='day').length,n=C.filter(c=>c.mode==='night').length;
  $('#gmCd').textContent=C.length?`白天 ${d} 张 · 夜晚 ${n} 张`:'情话、任务、真心话、大冒险';
  let s=0;try{s=JSON.parse(localStorage.getItem('365-seen-cards'))||0}catch(e){}
  const on=C.some(c=>c.mode==='day'&&(c.thread||[]).some(x=>x.who==='him'&&x.t>s));
  $('#gmCards').classList.toggle('has-dot',on)}

/* ---------- 规则 ---------- */
function spawn(){const e=B.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!e.length)return -1;const i=e[Math.floor(Math.random()*e.length)];B[i]=Math.random()<.9?2:4;return i}
function canMove(){if(B.includes(0))return true;for(let i=0;i<16;i++){if(i%4<3&&B[i]===B[i+1])return true;if(i<12&&B[i]===B[i+4])return true}return false}
function store(){localStorage.setItem(K,JSON.stringify({B,score,over,won}))}
function load(){try{const o=JSON.parse(localStorage.getItem(K));if(o&&Array.isArray(o.B)&&o.B.length===16){B=o.B;score=o.score||0;over=!!o.over;won=o.won||0;return true}}catch(e){}return false}
function newGame(){B=Array(16).fill(0);score=0;over=false;won=0;merged=[];spawn();fresh=spawn();store();$('#g2O').classList.remove('show');draw()}
function move(d){if(over||!B.length)return;const old=B.join();merged=[];
  for(let k=0;k<4;k++){const idx=[0,1,2,3].map(j=>d<2?k*4+j:j*4+k);if(d%2)idx.reverse();
    const x=idx.map(i=>B[i]).filter(Boolean),o=[],mm=[];
    for(let i=0;i<x.length;i++){if(x[i]===x[i+1]){o.push(x[i]*2);score+=x[i]*2;mm.push(o.length-1);if(x[i]*2===2048&&!won)won=1;i++}else o.push(x[i])}
    while(o.length<4)o.push(0);idx.forEach((i,j)=>B[i]=o[j]);mm.forEach(j=>merged.push(idx[j]))}
  if(B.join()===old)return;
  fresh=spawn();if(score>best){best=score;localStorage.setItem(KB,best)}
  localStorage.setItem(KP,JSON.stringify({t:Date.now(),s:score}));
  if(!canMove())over=true;store();draw();
  if(won===1){won=2;store();showO('2048 ✦','你合出 2048 了',true)}else if(over)showO('结束了',`这一局 ${score} 分`)}

/* ---------- 画出来 ---------- */
function tile(v,i){if(!v)return '<div class="g2-t"></div>';
  const l=Math.log2(v),hi=l>=7;
  const bg=hi?`color-mix(in srgb,var(--accent-t) ${Math.min(100,55+(l-7)*11)}%,var(--accent))`:`color-mix(in srgb,var(--accent) ${12+l*12}%,#fff)`;
  const fs=v<100?28:v<1000?24:v<10000?19:15;
  return `<div class="g2-t${i===fresh?' n':''}${merged.includes(i)?' m':''}" style="background:${bg};color:${hi?'#fff':'var(--ink)'};font-size:${fs}px">${v}</div>`}
function draw(){$('#g2B').innerHTML=B.map(tile).join('');$('#g2S').textContent=score;$('#g2Bt').textContent=best;fresh=-1;merged=[]}
function showO(t,x,win){const o=$('#g2O');
  o.innerHTML=`<b>${t}</b><p>${x}</p><p id="g2L"></p><div class="g2-btns">${S.apiKey?`<button class="pill ghost" id="g2Ask">让${esc(S.hisName)}看看</button>`:''}<button class="pill" id="${win?'g2Go':'g2Re'}">${win?'继续玩':'再来一局'}</button></div>`;
  o.classList.add('show')}
$('#g2O').onclick=async e=>{
  if(e.target.closest('#g2Re'))return newGame();
  if(e.target.closest('#g2Go'))return $('#g2O').classList.remove('show');
  const b=e.target.closest('#g2Ask');if(!b||busy)return;busy=true;b.textContent=`${S.hisName}在看…`;
  try{const t=await callAI(sceneSystem('她在「365」里玩 2048，玩完拿给你看。'),[{role:'user',text:`她这一局 2048 拿了 ${score} 分，${won?'合出了 2048':'最大的数字是 '+Math.max(...B)}，她的最高分是 ${best}。请以${S.hisName}的身份对她说一两句，可以夸她、逗她、嫌她菜，按你的性格来。不超过 50 字，不要 emoji，只输出这句话。`}]);
    $('#g2L').textContent=clean(t);b.remove()}
  catch(x){toast(x.message);b.textContent=`让${S.hisName}看看`}
  finally{busy=false}};

/* ---------- 滑动 ---------- */
let sx=0,sy=0;
$('#g2B').addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
$('#g2B').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
$('#g2B').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;move(Math.abs(dx)>Math.abs(dy)?(dx<0?0:1):(dy<0?2:3))});
document.addEventListener('keydown',e=>{if(!$('#page-g2048').classList.contains('active'))return;
  const k={ArrowLeft:0,ArrowRight:1,ArrowUp:2,ArrowDown:3}[e.key];if(k!=null){e.preventDefault();move(k)}});
$('#g2New').onclick=()=>{if(score&&!over&&!confirm('重新开始？这一局会清掉。'))return;newGame()};

/* ---------- 他知道你刚在玩 ---------- */
HOOKS.context.push(()=>{let p=null;try{p=JSON.parse(localStorage.getItem(KP))}catch(e){}
  if(!p||Date.now()-p.t>2*36e5)return '';
  return `【游戏】她刚才在 365 里玩 2048，这一局 ${p.s} 分，最高分 ${best}。可以顺口逗逗她，不用每句都提。`});

addMore({go:'game',cn:'游戏',ce:'games'});
HOOKS.ready.push(cdInfo);
HOOKS.page.push(n=>{document.body.classList.toggle('gmb',n==='g2048');
  if(n==='game'){$('#gmBest').textContent=best?`最高 ${best} 分`:'还没玩过';cdInfo()}
  if(n==='g2048'){if(B.length)draw();else if(load()){draw();if(over)showO('结束了',`这一局 ${score} 分`)}else newGame()}});
})();
