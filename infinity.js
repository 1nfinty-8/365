/* ===== 365 · infinity.js · 关于他：他的记忆 ===== */
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
let page='',vc=null,ansC=null,busy=false;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={count:()=>DATA.frag.length,busy:()=>busy,pick:()=>pick(),list:()=>showList()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-frag{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
#page-cards{padding:0;overflow:hidden;--fen:"Cormorant Garamond",var(--en)}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}
#ifView{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:calc(var(--st) + 14px) 16px calc(var(--sb) + 14px);background:rgba(20,22,30,.14);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#ifView.show{display:flex}
.mf-box{width:100%;max-width:420px;max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 2px 8px}

/* 封着的牌：他在想 */
.mf-seal{position:relative;width:150px;height:232px;margin:0 auto 20px;border-radius:14px;background:linear-gradient(170deg,#fff,#EAEEF4);border:1px solid #fff;
  box-shadow:0 18px 36px rgba(40,30,50,.16);animation:mfBreath 1.8s ease-in-out infinite}
.mf-seal::before{content:"";position:absolute;inset:9px;border:.5px solid rgba(140,150,170,.5);border-radius:9px}
.mf-seal::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border:.5px solid rgba(140,150,170,.55);transform:rotate(45deg)}
@keyframes mfBreath{50%{transform:translateY(-6px) rotate(-1.5deg)}}
.mf-wait{text-align:center;font-size:12.5px;letter-spacing:6px;color:var(--ink);opacity:.75}

/* 记忆 */
.mf{position:relative;overflow:hidden;border-radius:28px;padding:30px 26px 30px;color:#2F2A2C;
  background:rgba(252,250,247,.86);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 1px #fff,0 22px 50px rgba(40,30,50,.14)}
.mf.in{animation:mfIn .8s cubic-bezier(.2,.9,.25,1)}
@keyframes mfIn{from{opacity:0;transform:translateY(26px)}}
.mf-age{position:absolute;right:-18px;top:-58px;z-index:0;pointer-events:none;
  font-family:var(--fen);font-weight:500;font-size:300px;line-height:1;letter-spacing:-12px;
  background:linear-gradient(170deg,rgba(255,255,255,.95) 0%,rgba(198,214,238,.7) 28%,rgba(150,176,214,.5) 52%,rgba(212,226,244,.75) 74%,rgba(255,255,255,.95) 100%);
  background-size:100% 240%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  -webkit-text-stroke:1px rgba(255,255,255,.7);
  filter:drop-shadow(0 2px 1px rgba(255,255,255,.9)) drop-shadow(0 14px 24px rgba(110,135,180,.22));
  animation:mfWater 10s ease-in-out infinite alternate}
.mf.in .mf-age{animation:mfRise 1.6s cubic-bezier(.2,.9,.25,1),mfWater 10s ease-in-out infinite alternate}
@keyframes mfWater{to{background-position:0 100%}}
@keyframes mfRise{from{opacity:0;transform:translateY(40px) scale(.94)}}
.mf>:not(.mf-age){position:relative;z-index:1}
.mf-k{display:flex;justify-content:space-between;font-size:11px;letter-spacing:5px;color:#9A9396}
.mf-k span:last-child{font-family:var(--fen);font-style:italic;font-size:14px;letter-spacing:1px}
.mf-tt{font-family:var(--ti);font-weight:500;font-size:24px;letter-spacing:4px;line-height:1.5;margin:64px 0 8px;max-width:78%}
.mf-m{font-family:var(--fen),var(--ti);font-size:15px;letter-spacing:1px;color:#8A8387}
.mf-m i{font-style:normal;margin:0 8px;opacity:.5}
.mf-rule{width:28px;margin:24px 0 22px;border-top:1px solid rgba(0,0,0,.18)}
.mf-tx p{font-family:var(--ti);font-size:15.5px;line-height:2.05;letter-spacing:.6px;text-align:justify;text-indent:2em;margin:0 0 .9em;word-break:break-word}
.mf-tx p:last-child{margin:0}
html.dk .mf{background:rgba(36,38,46,.86);color:#ECEAEC;border-color:rgba(255,255,255,.18);box-shadow:0 22px 50px rgba(0,0,0,.4)}
html.dk .mf-age{background:linear-gradient(170deg,rgba(255,255,255,.35) 0%,rgba(150,176,220,.3) 40%,rgba(90,115,160,.25) 60%,rgba(255,255,255,.3) 100%);background-size:100% 240%;-webkit-background-clip:text;background-clip:text;-webkit-text-stroke:1px rgba(255,255,255,.18)}
html.dk .mf-rule{border-color:rgba(255,255,255,.2)}
.mf-th{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.mf-say{font-family:var(--cn);font-size:14.5px;line-height:1.75;padding:10px 14px;border-radius:16px;white-space:pre-wrap;word-break:break-word;color:var(--ink);
  background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:.5px solid rgba(255,255,255,.7)}
.mf-say small{display:block;font-size:11px;opacity:.6;margin-bottom:3px;letter-spacing:1px}
.mf-say.me{background:color-mix(in srgb,var(--mb) 85%,transparent);color:var(--mbt);margin-left:28px}
html.dk .mf-say.him{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)}
.mf-ft{display:flex;gap:10px;justify-content:center;margin-top:16px}
.mf-ft .pill.ghost{background:rgba(255,255,255,.4)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cards">
  <iframe id="ifFrame" title="他的记忆" allowtransparency="true"></iframe>
  <div class="if-top"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button>
    <button class="iconbtn glass" id="ifMenu" style="letter-spacing:1px">···</button></div>
  <div id="ifView"></div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="ifAns"><div class="mbox">
  <h3>问问<span class="hisName">陆择</span></h3>
  <div id="ifACard" style="text-align:center;font-family:var(--ti);font-size:15px;letter-spacing:2px;margin:4px 0 2px;color:var(--sys-sub)"></div>
  <label class="f"><span>想问他的</span><textarea class="short" id="ifAText" placeholder="后来呢？"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifAns">取消</button><button class="pill" id="ifASave">问他</button></div>
</div></div>`);

/* ---------- 他想起一段 ---------- */
const SCENE='这是你们的小窝「365」里「关于他」的「他的记忆」：一个玻璃文件夹，里面封着你自己的过去。';
function parse(t){t=String(t).replace(/```\w*/g,'');const i=t.search(/\n\s*-{3,}\s*\n/);if(i<0)throw new SyntaxError('fmt');
  const head=t.slice(0,i),story=t.slice(i).replace(/^\s*-{3,}\s*/,'').replace(/\*\*|__|^#+\s*/gm,'').trim();
  const g=k=>((head.match(new RegExp(k+'\\s*[:：]\\s*(.+)'))||[])[1]||'').trim();
  return {era:g('阶段'),year:(g('年份').match(/\d{4}/)||[''])[0],age:parseInt(g('年龄'))||'',place:g('地点'),title:g('标题'),sum:g('概括'),story}}
async function pick(){
  if(busy)return;busy=true;fire();
  const f={id:uid(),t:Date.now(),thread:[],_wait:true};
  setTimeout(()=>{if(f._wait&&page==='cards'){vc=f;vRender();$('#ifView').classList.add('show')}},500);
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
    if(page==='cards'){vc=f;vRender(true);$('#ifView').classList.add('show')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)vRender(false,true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`她刚看了你${f.era}的一段回忆「${f.title}」（${f.year?f.year+'年，':''}${f.age?f.age+'岁，':''}${f.place||''}）：\n「${String(f.story).slice(0,1500)}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份回她最新问的，细节要和这段回忆对得上，可以多讲一点当时的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)vRender(false,true)}

/* ---------- 翻开一段 ---------- */
function view(f){if(!f)return;vc=f;vRender(true);$('#ifView').classList.add('show')}
function closeView(){$('#ifView').classList.remove('show');vc=null}
function vRender(anim,bottom){const f=vc;if(!f)return;const H=esc(S.hisName);
  if(f._wait){$('#ifView').innerHTML=`<div class="mf-box"><div class="mf-seal"></div><p class="mf-wait">${H}在想</p></div>`;return}
  const no=DATA.frag.indexOf(f)+1,b=BUSY.has(f);
  const meta=[f.year,f.place,f.age?f.age+' 岁':''].filter(Boolean).map(esc).join('<i>·</i>');
  const th=(f.thread||[]).map(x=>`<div class="mf-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(b?`<div class="mf-say him"><small>${H}</small>在想怎么跟你说…</div>`:'');
  $('#ifView').innerHTML=`<div class="mf-box" id="mfBox"><article class="mf${anim?' in':''}">
    ${f.age?`<div class="mf-age">${f.age}</div>`:''}
    <div class="mf-k"><span>${esc(f.era||'往事')}</span><span>No. ${no}</span></div>
    <h3 class="mf-tt">${esc(f.title)}</h3>
    ${meta?`<div class="mf-m">${meta}</div>`:''}
    <div class="mf-rule"></div>
    <div class="mf-tx">${paras(f.story)}</div>
  </article>
  ${th?`<div class="mf-th">${th}</div>`:''}
  <div class="mf-ft">${b?'':'<button class="pill ghost" data-va>问他</button>'}<button class="pill ghost" data-vm>···</button><button class="pill" data-vx>收好</button></div></div>`;
  requestAnimationFrame(()=>{const x=$('#mfBox');if(x)x.scrollTop=bottom?x.scrollHeight:0})}
$('#ifView').onclick=e=>{const f=vc;
  if(e.target.id==='ifView'||e.target.closest('[data-vx]'))return closeView();
  if(!f||f._wait)return;
  if(e.target.closest('[data-va]')){ansC=f;$('#ifACard').textContent=f.title;$('#ifAText').value='';openModal('ifAns');return}
  if(e.target.closest('[data-vm]'))sheet([
    ['复制这段',()=>navigator.clipboard?.writeText(`${f.title}\n\n${f.story}`).then(()=>toast('已复制'))],
    ['删除这段记忆',async()=>{if(!confirm('删除这段记忆？他也会忘掉这件事。'))return;DATA.frag=DATA.frag.filter(x=>x!==f);await save();closeView();fire();card()}]])};
$('#ifASave').onclick=async()=>{const f=ansC,v=$('#ifAText').value.trim();if(!f)return;if(!v)return toast('写点什么吧');
  (f.thread=f.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('ifAns');if(vc===f)vRender(false,true);respond(f)};

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
