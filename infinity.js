/* ===== 365 · infinity.js · 游戏：Infinity · 塔罗（玻璃文件夹 + 78 张牌） ===== */
(()=>{
if(!Array.isArray(DATA.tarot))DATA.tarot=[];
const save=()=>saveData('tarot');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON='信';
let page='',vc=null,ansCard=null,drawing=false;
const BUSY=new Set();

/* ---------- 78 张牌 ---------- */
const MAJ=[['愚者','The Fool'],['魔术师','The Magician'],['女祭司','The High Priestess'],['皇后','The Empress'],['皇帝','The Emperor'],
  ['教皇','The Hierophant'],['恋人','The Lovers'],['战车','The Chariot'],['力量','Strength'],['隐士','The Hermit'],['命运之轮','Wheel of Fortune'],
  ['正义','Justice'],['倒吊人','The Hanged Man'],['死神','Death'],['节制','Temperance'],['恶魔','The Devil'],['高塔','The Tower'],
  ['星星','The Star'],['月亮','The Moon'],['太阳','The Sun'],['审判','Judgement'],['世界','The World']];
const RN=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const SU=[['权杖','Wands','w'],['圣杯','Cups','c'],['宝剑','Swords','s'],['星币','Pentacles','p']];
const RK=[['王牌','Ace','ACE'],['二','Two','II'],['三','Three','III'],['四','Four','IV'],['五','Five','V'],['六','Six','VI'],['七','Seven','VII'],
  ['八','Eight','VIII'],['九','Nine','IX'],['十','Ten','X'],['侍从','Page','PAGE'],['骑士','Knight','KNIGHT'],['王后','Queen','QUEEN'],['国王','King','KING']];
const TAROT=[...MAJ.map((m,i)=>({cn:m[0],en:m[1],num:RN[i],g:'m'})),
  ...SU.flatMap(s=>RK.map(r=>({cn:s[0]+r[0],en:r[1]+' of '+s[1],num:r[2],g:s[2]})))];
const SV=p=>`<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const GLYPH={
  m:SV('<circle cx="30" cy="30" r="6"/><path d="M30 6v14M30 40v14M6 30h14M40 30h14M14.4 14.4l8.5 8.5M37.1 37.1l8.5 8.5M45.6 14.4l-8.5 8.5M22.9 37.1l-8.5 8.5"/>'),
  w:SV('<path d="M30 6v46"/><path d="M30 16c5-4 9-3 10 1M30 26c-5-4-9-3-10 1M30 36c5-4 9-3 10 1"/><circle cx="30" cy="54" r="1.8"/>'),
  c:SV('<path d="M17 10h26c0 13-5 22-13 22S17 23 17 10z"/><path d="M30 32v13M22 50h16M25 45h10"/>'),
  s:SV('<path d="M30 5l3 6v30h-6V11z"/><path d="M19 41h22M30 41v9"/><circle cx="30" cy="53" r="2"/>'),
  p:SV('<circle cx="30" cy="30" r="19"/><path d="M30 16L38.2 41.3L16.7 25.7H43.3L21.8 41.3Z"/>')};

const cur=()=>{const r=DATA.tarot.at(-1);return r&&!r.done?r:null};
const left=()=>{const u=new Set((cur()?.cards||[]).map(c=>c.k)),L=[];for(let i=0;i<78;i++)if(!u.has(i))L.push(i);return L};
const nm=c=>TAROT[c.k].cn+(c.rev?'（逆位）':'（正位）');
const readingOf=c=>DATA.tarot.find(r=>r.cards.includes(c));
const fire=()=>{try{$('#ifFrame').contentWindow.ifSync?.()}catch(e){}};

/* 给 infinity.html 用 */
window.INF={left:()=>left().length,drawn:()=>cur()?.cards.length||0,pick:()=>pick(),list:()=>showList(),reset:()=>reset()};

['https://fonts.googleapis.com','https://fonts.loli.net'].forEach(h=>document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="${h}/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap">`));
document.head.insertAdjacentHTML('beforeend',`<style>
#page-cards{padding:0;overflow:hidden;--trf:"Cormorant Garamond",var(--en)}
body.ifb #tabbar{display:none}
#ifFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.if-top{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--st) + 4px) 12px 0;pointer-events:none}
.if-top>*{pointer-events:auto}
#ifView{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:calc(var(--st) + 16px) 18px calc(var(--sb) + 16px);background:rgba(20,22,30,.16);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#ifView.show{display:flex}
.tr-box{width:100%;max-width:400px;max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:26px 22px 18px;border-radius:28px;text-align:center;color:var(--ink);
  background:linear-gradient(160deg,rgba(255,255,255,.24),rgba(255,255,255,.07) 50%,rgba(255,255,255,.15));-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 1px rgba(255,255,255,.85),0 18px 40px rgba(60,40,60,.14);animation:trUp .45s cubic-bezier(.2,.9,.25,1)}
html.dk .tr-box{background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.03) 50%,rgba(255,255,255,.06));border-color:rgba(255,255,255,.22)}
@keyframes trUp{from{transform:translateY(40px) scale(.96);opacity:0}}
.tr-flip{width:156px;height:256px;margin:0 auto 18px;perspective:900px}
.tr-in{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.3,1.25,.4,1)}
.tr-flip.on .tr-in{transform:rotateY(180deg)}
.tr-b,.tr-f{position:absolute;inset:0;border-radius:12px;-webkit-backface-visibility:hidden;backface-visibility:hidden;box-shadow:0 14px 30px rgba(40,30,50,.18),0 1px 3px rgba(0,0,0,.1)}
.tr-b{background:linear-gradient(170deg,#fff,#EAEEF4);border:1px solid #fff}
.tr-b::before{content:"";position:absolute;inset:8px;border:.5px solid rgba(140,150,170,.5);border-radius:8px}
.tr-b::after{content:"";position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border:.5px solid rgba(140,150,170,.55);transform:rotate(45deg)}
.tr-f{transform:rotateY(180deg);background:#FBF8F2;color:#7A6440;border:1px solid #fff}
.tr-f::before{content:"";position:absolute;inset:7px;border:.8px solid rgba(169,142,91,.7);border-radius:8px}
.tr-f::after{content:"";position:absolute;inset:11px;border:.5px solid rgba(169,142,91,.4);border-radius:6px}
.tr-fc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:24px 12px 22px}
.tr-f.rev .tr-fc{transform:rotate(180deg)}
.tr-n{font-family:var(--trf);font-weight:500;font-size:15px;letter-spacing:4px}
.tr-g{width:72px;height:72px;color:#A98E5B}
.tr-g svg{width:100%;height:100%;display:block}
.tr-cn{font-family:var(--ti);font-size:15px;letter-spacing:4px;color:#4A3B2E}
.tr-en{font-family:var(--trf);font-style:italic;font-size:12.5px;margin-top:2px;opacity:.85}
.tr-pos{font-size:12px;letter-spacing:3px;color:var(--sub)}
.tr-pos b{font-weight:400;color:var(--accent-t)}
.tr-name{font-size:20px;letter-spacing:5px;margin-top:4px}
.tr-name em{display:block;font-family:var(--trf);font-style:italic;font-size:17px;letter-spacing:.5px;color:var(--sub);margin-top:2px}
.tr-th{text-align:left;margin-top:18px;display:flex;flex-direction:column;gap:8px}
.tr-say{font-family:var(--cn);font-size:14.5px;line-height:1.75;padding:10px 14px;border-radius:16px;white-space:pre-wrap;word-break:break-word;background:rgba(255,255,255,.5)}
.tr-say small{display:block;font-size:11px;opacity:.6;margin-bottom:3px;letter-spacing:1px}
.tr-say.me{background:color-mix(in srgb,var(--mb) 85%,transparent);color:var(--mbt);margin-left:28px}
html.dk .tr-say.him{background:rgba(255,255,255,.08)}
.tr-ft{display:flex;gap:10px;justify-content:center;margin-top:18px}
.tr-ft .pill.ghost{background:rgba(255,255,255,.35)}
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
  <label class="f"><span>想问他的</span><textarea class="short" id="ifAText"></textarea></label>
  <div class="mbtns"><button class="pill ghost" data-close="ifAns">取消</button><button class="pill" id="ifASave">问他</button></div>
</div></div>`);

/* ---------- 他来解牌 ---------- */
const SCENE='这是你们的小窝「365」里的「Infinity」：一个玻璃文件夹，里面装着一副 78 张的塔罗牌。她在一张一张地抽，你坐在她旁边陪她看牌。';
async function interp(c){
  if(BUSY.has(c))return;BUSY.add(c);if(vc===c)vRender();
  try{const T=TAROT[c.k],r=readingOf(c),i=r?r.cards.indexOf(c)+1:1;
    const prev=r?r.cards.slice(0,i-1).map(x=>'「'+nm(x)+'」').join('、'):'';
    const recent=recentChat(10);
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`她刚从文件夹里抽出${i>1?'这一轮的第 '+i+' 张':'一张'}牌：「${T.cn}」（${T.en}），${c.rev?'逆位':'正位'}。${prev?`这一轮她前面已经抽到：${prev}，可以把几张牌连起来看。`:''}${recent?`\n你们最近的聊天：\n${recent}`:''}
请以${S.hisName}的身份给她解这张牌：先用一两句话说清楚这张牌${c.rev?'逆位':'正位'}大概是什么意思，再结合她最近的事、你们之间，说说你怎么看。可以温柔，也可以照你的性格逗她、管她。口语化，像坐在她旁边说话，三到六句。不要分点，不要 markdown，不要 emoji，不要加名字前缀。`}]);
    c.text=clean(t)}
  catch(e){toast(e.message)}
  BUSY.delete(c);await save();if(vc===c)vRender()}
async function respond(c){
  if(BUSY.has(c))return;BUSY.add(c);if(vc===c)vRender();
  try{const T=TAROT[c.k],th=(c.thread||[]).map(x=>`${x.who==='me'?'她':'你'}：${x.text}`).join('\n');
    const t=await callAI(sceneSystem(SCENE),[{role:'user',text:`你们在看她抽到的塔罗牌「${T.cn}」（${T.en}，${c.rev?'逆位':'正位'}）。你刚才是这样解的：「${c.text}」\n后面的对话：\n${th}\n请以${S.hisName}的身份接着回她最新说的话，口语化，一到四句，不要加名字前缀，不要 emoji。`}]);
    (c.thread=c.thread||[]).push({who:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  BUSY.delete(c);await save();if(vc===c)vRender()}

/* ---------- 抽一张：抽出来的不放回去 ---------- */
async function pick(){
  if(drawing)return;const L=left();if(!L.length)return toast('牌抽完了，洗牌再来');
  drawing=true;
  try{let r=cur();
    if(!r){r={id:uid(),t:Date.now(),cards:[],done:false};DATA.tarot.push(r);if(DATA.tarot.length>60)DATA.tarot.splice(0,DATA.tarot.length-60)}
    const c={k:L[Math.floor(Math.random()*L.length)],rev:Math.random()<.5,t:Date.now(),text:'',thread:[]};
    r.cards.push(c);await save();fire();
    setTimeout(()=>{if(page==='cards')view(c,true)},600);
    interp(c)}
  finally{drawing=false}}
async function reset(){const r=cur();if(!r||!r.cards.length)return;
  if(!confirm('把牌都收回文件夹，重新洗牌？抽过的牌会留在「以前抽过的」里。'))return;
  r.done=true;await save();closeView();fire();toast('洗好了')}

/* ---------- 翻开一张 ---------- */
function faceHTML(c){const T=TAROT[c.k];
  return `<div class="tr-f${c.rev?' rev':''}"><div class="tr-fc"><div class="tr-n">${T.num}</div><div class="tr-g">${GLYPH[T.g]}</div><div><div class="tr-cn">${T.cn}</div><div class="tr-en">${T.en}</div></div></div></div>`}
function view(c,anim){if(!c)return;vc=c;vRender(anim);$('#ifView').classList.add('show')}
function closeView(){$('#ifView').classList.remove('show');vc=null}
function vRender(anim){const c=vc;if(!c)return;
  const T=TAROT[c.k],r=readingOf(c),i=r?r.cards.indexOf(c)+1:1,H=esc(S.hisName),busy=BUSY.has(c);
  const th=(c.text?`<div class="tr-say him"><small>${H}</small>${esc(c.text)}</div>`:'')
    +(c.thread||[]).map(x=>`<div class="tr-say ${x.who==='me'?'me':'him'}"><small>${x.who==='me'?'我':H}</small>${esc(x.text)}</div>`).join('')
    +(busy?`<div class="tr-say him"><small>${H}</small>正在看这张牌…</div>`:'');
  $('#ifView').innerHTML=`<div class="tr-box">
    <div class="tr-flip${anim?'':' on'}" id="trFlip"><div class="tr-in"><div class="tr-b"></div>${faceHTML(c)}</div></div>
    <div class="tr-pos">第 ${i} 张 · <b>${c.rev?'逆位':'正位'}</b></div>
    <div class="tr-name">${T.cn}<em>${T.en}</em></div>
    ${th?`<div class="tr-th">${th}</div>`:''}
    <div class="tr-ft">${busy?'':(c.text?'<button class="pill ghost" data-va>问他</button>':'<button class="pill ghost" data-vr>让他说说</button>')}<button class="pill" data-vx>收好</button></div></div>`;
  if(anim)setTimeout(()=>$('#trFlip')?.classList.add('on'),120)}
$('#ifView').onclick=e=>{
  if(e.target.id==='ifView'||e.target.closest('[data-vx]'))return closeView();
  if(e.target.closest('[data-vr]'))return interp(vc);
  if(e.target.closest('[data-va]')){ansCard=vc;$('#ifACard').textContent=nm(vc);$('#ifAText').value='';openModal('ifAns')}};
$('#ifASave').onclick=async()=>{const c=ansCard,v=$('#ifAText').value.trim();if(!c)return;if(!v)return toast('写点什么吧');
  (c.thread=c.thread||[]).push({who:'me',text:v,t:Date.now()});await save();closeModal('ifAns');if(vc===c)vRender();respond(c)};

/* ---------- 这一轮 / 以前抽过的 ---------- */
function showList(){const r=cur();if(!r||!r.cards.length)return toast('这一轮还没抽');
  sheet(r.cards.map((c,i)=>[`第 ${i+1} 张 · ${nm(c)}`,()=>view(c)]))}
function history(){const L=DATA.tarot.filter(r=>r.cards.length).slice().reverse().slice(0,20);if(!L.length)return toast('还没抽过牌');
  sheet(L.map(r=>[`${fmtDate(r.t)} · ${r.cards.map(c=>TAROT[c.k].cn).join('、')}`.slice(0,36),()=>sheet(r.cards.map((c,i)=>[`第 ${i+1} 张 · ${nm(c)}`,()=>view(c)]))]))}
$('#ifMenu').onclick=()=>sheet([['这一轮抽到的',showList],['以前抽过的',history],['重新洗牌',reset]]);

/* ---------- 「游戏」页：显示成 Infinity ---------- */
function patchGame(){
  let el=[...document.querySelectorAll('#page-game [data-go]')].find(x=>x.dataset.go==='cards'||/小卡片|Infinity/.test(x.textContent));
  if(!el){const h=`<button class="gm-card glass" data-go="cards"><span class="gm-ic">${ICON}</span><span><b>Infinity</b><small></small></span></button>`;
    const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h);
    el=$('#page-game [data-go="cards"]');if(!el)return}
  el.dataset.go='cards';
  const b=el.querySelector('b');if(b&&b.textContent!=='Infinity')b.textContent='Infinity';
  const ic=el.querySelector('.gm-ic');if(ic&&!ic.dataset.if){ic.dataset.if=1;ic.innerHTML=ICON}
  const d=isoDate(today()),n=DATA.tarot.flatMap(r=>r.cards).filter(c=>isoDate(new Date(c.t))===d).length;
  const sm=el.querySelector('small');if(sm)sm.textContent=n?`塔罗 · 今天抽了 ${n} 张`:'塔罗 · 78 张'}
$$('#moreGrid [data-go="infinity"]').forEach(x=>x.remove());

/* ---------- 让他平时也知道今天的牌 ---------- */
HOOKS.context.push(()=>{const d=isoDate(today());
  const L=DATA.tarot.flatMap(r=>r.cards).filter(c=>isoDate(new Date(c.t))===d);
  if(!L.length)return '';
  return '【Infinity 塔罗】她今天抽到：'+L.map(nm).join('、')+'。可以自然地聊到，不用每句都提。'});

patchGame();
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.tarot))DATA.tarot=[];patchGame();const f=$('#ifFrame');if(f&&!f.src)f.src='infinity.html'});
HOOKS.page.push(n=>{page=n;document.body.classList.toggle('ifb',n==='cards');
  if(n==='game')setTimeout(patchGame,0);
  if(n==='cards'){const f=$('#ifFrame');if(!f.src)f.src='infinity.html';else fire()}
  else closeView()});
})();
