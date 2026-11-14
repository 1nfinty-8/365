/* ===== 365 · infinity.js · 游戏：Infinity · 他的记忆碎片 ===== */
(()=>{
if(!Array.isArray(DATA.frag))DATA.frag=[];
Object.assign(DEFAULT,{fragEra:''});
const save=()=>saveData('frag');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON='忆';
const ERAS=['小时候','少年时','大学','工作以后','遇见你以后'];
const J=t=>JSON.parse((String(t).match(/\{[\s\S]*\}/)||['{}'])[0]);
let page='',vc=null,ansC=null,busy=false;
const BUSY=new Set();
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={count:()=>DATA.frag.length,busy:()=>busy,pick:()=>pick(),list:()=>showList()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Pinyon+Script&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#page-cards{padding:0;overflow:hidden;--fen:"Cormorant Garamond",var(--en);--fsc:"Pinyon Script","Snell Roundhand",cursive}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}
#ifView{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:calc(var(--st) + 16px) 16px calc(var(--sb) + 14px);background:rgba(20,22,30,.16);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
#ifView.show{display:flex}
.mf-box{width:100%;max-width:400px;max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:6px 4px 8px;animation:mfUp .45s cubic-bezier(.2,.9,.25,1)}
@keyframes mfUp{from{transform:translateY(40px);opacity:0}}

/* 封着的牌：他在想 */
.mf-seal{position:relative;width:160px;height:248px;margin:0 auto 20px;border-radius:14px;background:linear-gradient(170deg,#fff,#EAEEF4);border:1px solid #fff;
  box-shadow:0 18px 36px rgba(40,30,50,.18);animation:mfBreath 1.8s ease-in-out infinite}
.mf-seal::before{content:"";position:absolute;inset:9px;border:.5px solid rgba(140,150,170,.5);border-radius:9px}
.mf-seal::after{content:"";position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border:.5px solid rgba(140,150,170,.55);transform:rotate(45deg)}
@keyframes mfBreath{50%{transform:translateY(-6px) rotate(-1.5deg)}}
.mf-wait{text-align:center;font-size:13px;letter-spacing:5px;color:var(--ink)}
.mf-wait em{display:block;font-family:var(--fsc);font-style:normal;font-size:24px;letter-spacing:0;margin-bottom:2px;opacity:.75}

/* 记忆档案卡 */
.mf{filter:drop-shadow(0 16px 30px rgba(40,30,50,.16));animation:mfOpen 1s cubic-bezier(.2,.9,.25,1)}
.mf.still{animation:none}
@keyframes mfOpen{from{transform:perspective(1000px) rotateY(85deg) scale(.92);opacity:0}}
.mf-a,.mf-b{background:#FBF9F5;color:#2F2A2C}
.mf-a{position:relative;overflow:hidden;border-radius:20px 20px 0 0;padding:20px 22px 20px;
  -webkit-mask:radial-gradient(circle at 0 100%,transparent 11px,#000 11.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 100%,transparent 11px,#000 11.5px) right/51% 100% no-repeat;
  mask:radial-gradient(circle at 0 100%,transparent 11px,#000 11.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 100%,transparent 11px,#000 11.5px) right/51% 100% no-repeat}
.mf-b{position:relative;border-radius:0 0 20px 20px;padding:22px 22px 18px;
  -webkit-mask:radial-gradient(circle at 0 0,transparent 11px,#000 11.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 0,transparent 11px,#000 11.5px) right/51% 100% no-repeat;
  mask:radial-gradient(circle at 0 0,transparent 11px,#000 11.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 0,transparent 11px,#000 11.5px) right/51% 100% no-repeat}
.mf-b::before{content:"";position:absolute;left:18px;right:18px;top:0;border-top:1.5px dashed rgba(120,110,115,.28)}
.mf-age{position:absolute;right:-4px;bottom:-30px;font-family:var(--fen);font-style:italic;font-weight:400;font-size:150px;line-height:1;color:rgba(47,42,44,.06);pointer-events:none}
.mf-hd{position:relative;display:flex;justify-content:space-between;font-family:var(--fen);font-size:11px;letter-spacing:4px;color:#9A9396}
.mf-era{position:relative;display:inline-block;margin-top:16px;padding:3px 10px;border:1px solid var(--accent-t);color:var(--accent-t);border-radius:4px;font-size:11px;letter-spacing:3px;transform:rotate(-3deg)}
.mf-tt{position:relative;font-family:var(--ti);font-weight:500;font-size:23px;letter-spacing:4px;line-height:1.45;margin:12px 0 16px}
.mf-meta{position:relative;display:flex;gap:20px}
.mf-meta small{display:block;font-family:var(--fen);font-size:10px;letter-spacing:2px;color:#9A9396}
.mf-meta b{font-family:var(--fen),var(--ti);font-weight:500;font-size:15px;white-space:nowrap}
.mf-tx{font-family:var(--ti);font-size:15.5px;line-height:2;letter-spacing:.5px;text-align:justify;white-space:pre-wrap;word-break:break-word}
.mf-tx::first-letter{float:left;font-size:2.6em;line-height:1;margin:6px 8px 0 0;color:var(--accent-t)}
.mf-keep{display:flex;align-items:baseline;gap:12px;margin-top:18px;padding-top:12px;border-top:.5px solid rgba(0,0,0,.08);font-size:13.5px;letter-spacing:1px}
.mf-keep small{flex:none;font-family:var(--fen);font-size:10px;letter-spacing:3px;color:#9A9396}
.mf-sig{text-align:right;margin-top:14px;font-size:14px;letter-spacing:2px}
.mf-sig em{font-family:var(--fsc);font-style:normal;font-size:22px;margin-right:8px;letter-spacing:0;color:#6B6266}
html.dk .mf-a,html.dk .mf-b{background:#2B2D34;color:#ECEAEC}
html.dk .mf-age{color:rgba(255,255,255,.05)}
html.dk .mf-sig em{color:#B9B3B6}
html.dk .mf-keep{border-color:rgba(255,255,255,.1)}
.mf-in{text-align:center;font-size:11.5px;letter-spacing:3px;color:var(--ink);opacity:.6;margin:14px 0 0}
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
  <iframe id="ifFrame" title="Infinity" allowtransparency="true"></iframe>
  <div class="if-top"><button class="iconbtn glass" data-go="game" aria-label="返回">${BACK}</button>
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
const SCENE='这是你们的小窝「365」里的「Infinity」：一个玻璃文件夹，里面装着你的记忆碎片。她抽出一张，你就讲一段你自己的过去给她听。';
async function pick(){
  if(busy)return;busy=true;fire();
  const f={id:uid(),t:Date.now(),thread:[],_wait:true};
  setTimeout(()=>{if(f._wait&&page==='cards'){vc=f;vRender();$('#ifView').classList.add('show')}},500);
  try{
    const era=S.fragEra||'';
    const old=DATA.frag.slice(-40).map(x=>`- ${x.era||''}·${x.title}：${x.sum||''}`).join('\n');
    const j=J(await callAI(sceneSystem(SCENE),[{role:'user',text:`请以${S.hisName}的身份，从你自己的人生里想起一段记忆，讲给她听。${era?`这次讲你${era}的事。`:'可以是小时候、少年时、上大学、工作以后，或者遇见她以后，随你想起什么。'}
要求：真实、具体、有画面，要有一个地方、一个人、一样东西、一个细节。要和你的人设、你的过去对得上。${old?'\n你之前已经讲过这些，不要重复，也不要和它们矛盾：\n'+old:''}
story 用第一人称，像坐在她旁边轻声讲，120 到 260 字，最后可以带一句和她有关的话，也可以不带。不要 emoji，不要 markdown。
只输出 JSON：{"era":"从 小时候/少年时/大学/工作以后/遇见你以后 里选一个","year":"哪一年，四位数字","age":当时几岁的数字,"place":"地方，两到六个字","title":"这段记忆的名字，四到十个字","story":"","keep":"这段记忆里留下的一样东西或一个细节，不超过十二个字","sum":"一句话概括，三十字以内"}`}]));
    if(!j.story||!j.title)throw new SyntaxError('empty');
    Object.assign(f,{era:String(j.era||era||'往事'),year:String(j.year||'').slice(0,4),age:(+j.age>0&&+j.age<120)?Math.round(+j.age):'',
      place:String(j.place||'').slice(0,10),title:String(j.title).slice(0,16),story:clean(String(j.story)),keep:String(j.keep||'').slice(0,16),sum:String(j.sum||'').slice(0,40)});
    delete f._wait;DATA.frag.push(f);await save();
    if(page==='cards'){vc=f;vRender(true);$('#ifView').classList.add('show')}
    else toast(`${S.hisName}想起了一段事`)}
  catch(e){if(vc===f)closeView();toast(e instanceof SyntaxError?'他一时没想起来，再抽一张试试':e.message)}
  finally{delete f._wait;busy=false;fire()}}

/* ---------- 问他 ---------- */
async function respond(f){
  if(BUSY.has(f))return;BUSY.add(f);if(vc===f)vRender(false,true);
  try{const th=(f.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`你刚给她讲了你${f.era}的一段事「${f.title}」（${f.year?f.year+'年，':''}${f.age?f.age+'岁，':''}${f.place||''}）：\n「${f.story}」\n\n后面的对话：\n${th}\n\n请以${S.hisName}的身份接着回她最新问的，细节要和你讲过的对得上，可以多讲一点当时的事。口语化，一到五句，不要加名字前缀，不要 emoji。`}]);
    (f.thread=f.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(f);await save();if(vc===f)vRender(false,true)}

/* ---------- 翻开一张 ---------- */
function view(f){if(!f)return;vc=f;vRender(true);$('#ifView').classList.add('show')}
function closeView(){$('#ifView').classList.remove('show');vc=null}
function vRender(anim,bottom){const f=vc;if(!f)return;const H=esc(S.hisName);
  if(f._wait){$('#ifView').innerHTML=`<div class="mf-box"><div class="mf-seal"></div><p class="mf-wait"><em>a memory…</em>${H}在想</p></div>`;return}
  const no=DATA.frag.indexOf(f)+1,b=BUSY.has(f);
  const th=(f.thread||[]).map(x=>`<div class="mf-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(b?`<div class="mf-say him"><small>${H}</small>在想怎么跟你说…</div>`:'');
  $('#ifView').innerHTML=`<div class="mf-box" id="mfBox"><article class="mf${anim?'':' still'}">
    <div class="mf-a">${f.age?`<div class="mf-age">${f.age}</div>`:''}
      <div class="mf-hd"><span>MEMORY</span><span>No. ${String(no).padStart(2,'0')}</span></div>
      <span class="mf-era">${esc(f.era||'往事')}</span>
      <h3 class="mf-tt">${esc(f.title)}</h3>
      <div class="mf-meta">${f.year?`<div><small>YEAR</small><b>${esc(f.year)}</b></div>`:''}${f.age?`<div><small>AGE</small><b>${f.age} 岁</b></div>`:''}${f.place?`<div><small>PLACE</small><b>${esc(f.place)}</b></div>`:''}</div>
    </div>
    <div class="mf-b"><div class="mf-tx">${esc(f.story)}</div>
      ${f.keep?`<div class="mf-keep"><small>KEPT</small><span>${esc(f.keep)}</span></div>`:''}
      <div class="mf-sig"><em>remembered by</em>${H}</div></div>
  </article>
  <p class="mf-in">已收进${H}的记忆</p>
  ${th?`<div class="mf-th">${th}</div>`:''}
  <div class="mf-ft">${b?'':'<button class="pill ghost" data-va>问他</button>'}<button class="pill ghost" data-vm>···</button><button class="pill" data-vx>收好</button></div></div>`;
  if(bottom)requestAnimationFrame(()=>{const x=$('#mfBox');if(x)x.scrollTop=x.scrollHeight})}
$('#ifView').onclick=e=>{const f=vc;
  if(e.target.id==='ifView'||e.target.closest('[data-vx]'))return closeView();
  if(!f||f._wait)return;
  if(e.target.closest('[data-va]')){ansC=f;$('#ifACard').textContent=f.title;$('#ifAText').value='';openModal('ifAns');return}
  if(e.target.closest('[data-vm]'))sheet([
    ['复制这段',()=>navigator.clipboard?.writeText(`${f.title}\n${f.story}`).then(()=>toast('已复制'))],
    ['删除这段记忆',async()=>{if(!confirm('删除这段记忆？他也会忘掉这件事。'))return;DATA.frag=DATA.frag.filter(x=>x!==f);await save();closeView();fire()}]])};
$('#ifASave').onclick=async()=>{const f=ansC,v=$('#ifAText').value.trim();if(!f)return;if(!v)return toast('写点什么吧');
  (f.thread=f.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('ifAns');if(vc===f)vRender(false,true);respond(f)};

/* ---------- 收好的记忆 / 想听哪一段 ---------- */
function showList(){const L=DATA.frag.slice().reverse().slice(0,50);if(!L.length)return toast('还没抽过');
  sheet(L.map(f=>[`No.${DATA.frag.indexOf(f)+1} · ${f.era||''} · ${f.title}`,()=>view(f)]))}
$('#ifMenu').onclick=()=>sheet([
  ['收好的记忆',showList],
  [`想听哪一段：${S.fragEra||'随便'}`,()=>sheet([['随便',()=>{S.fragEra='';saveSettings();toast('随他想起什么')}],
    ...ERAS.map(x=>[x,()=>{S.fragEra=x;saveSettings();toast(`下一张讲${x}的事`)}])])]]);

/* ---------- 「游戏」页：显示成 Infinity ---------- */
function patchGame(){
  let el=[...document.querySelectorAll('#page-game [data-go]')].find(x=>x.dataset.go==='cards'||/小卡片|Infinity/.test(x.textContent));
  if(!el){const h=`<button class="gm-card glass" data-go="cards"><span class="gm-ic">${ICON}</span><span><b>Infinity</b><small></small></span></button>`;
    const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h);
    el=$('#page-game [data-go="cards"]');if(!el)return}
  el.dataset.go='cards';
  const b=el.querySelector('b');if(b&&b.textContent!=='Infinity')b.textContent='Infinity';
  const ic=el.querySelector('.gm-ic');if(ic&&ic.dataset.if!==ICON){ic.dataset.if=ICON;ic.innerHTML=ICON}
  const sm=el.querySelector('small');if(sm)sm.textContent=DATA.frag.length?`他的记忆碎片 · ${DATA.frag.length} 段`:'他的记忆碎片'}
$$('#moreGrid [data-go="infinity"]').forEach(x=>x.remove());

/* ---------- 收进他的记忆：讲过的事，他一直记得 ---------- */
HOOKS.persona.push(()=>{const L=DATA.frag.filter(f=>f.title);if(!L.length)return '';
  return '【你讲给她听过的往事】这些是你亲口告诉过她的、你自己的过去。要一直记得，细节不能说错，可以在聊天里自然地提起：\n'
    +L.slice(-30).map(f=>`- ${f.era||''}${f.age?'，'+f.age+'岁':''}${f.place?'，'+f.place:''}：${f.title}——${f.sum||String(f.story).slice(0,40)}`).join('\n')});

patchGame();
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.frag))DATA.frag=[];patchGame();const f=$('#ifFrame');if(f&&!f.src)f.src='infinity.html'});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('ifb',n==='cards');
  if(n==='game')setTimeout(patchGame,0);
  if(n==='cards'){const f=$('#ifFrame');if(!f.src)f.src='infinity.html';else fire()}
  else closeView()});
})();
