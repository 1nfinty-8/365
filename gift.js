/* ===== 365 · gift.js · 他送的礼物盒 ===== */
(()=>{
if(!Array.isArray(DATA.gifts))DATA.gifts=[];
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const T=()=>isoDate(today());
const arr=v=>Array.isArray(v)?v:[];
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
const add=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return isoDate(d)};
const md=s=>{const d=parseDate(s);return `${d.getMonth()+1}月${d.getDate()}日`};
const STY=['note','tape','postcard','stamp','receipt','ticket','polaroid','tag'];
const save=()=>saveData('gifts');
let busy=false,cur=null;

document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-gift{grid-column:1/-1;min-height:clamp(96px,13vh,130px)}
.gf-it{display:block;width:100%;text-align:left;padding:16px 18px;margin-bottom:12px}
.gf-tt{display:flex;align-items:center;gap:8px}
.gf-tt b{font-weight:500;font-size:16px;letter-spacing:2px}
.gf-tt i{font-style:normal;font-size:11px;padding:1px 8px;border-radius:99px;background:var(--accent);color:var(--acct)}
.gf-m{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px}
#gfView{position:absolute;inset:0;z-index:36;display:none;flex-direction:column;background:rgba(24,18,24,.78);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px)}
#gfView.show{display:flex;animation:fd .3s ease}
.gv-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 10px 8px;color:#fff}
.gv-top .iconbtn{color:#fff;background:rgba(255,255,255,.1)}
.gv-top b{flex:1;text-align:center;font-family:var(--ti);font-weight:400;font-size:16px;letter-spacing:4px}
#gvBody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 0 calc(var(--sb) + 30px)}
.gv-box{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;color:#fff;text-align:center;font-family:var(--ti);letter-spacing:3px;line-height:2}
.gv-box small{font-size:12px;opacity:.6}
.gb{position:relative;width:190px;height:170px;animation:gbW 2.4s ease-in-out infinite}
@keyframes gbW{0%,100%{transform:rotate(0)}8%{transform:rotate(-3deg)}16%{transform:rotate(3deg)}24%{transform:rotate(0)}}
.gb-base{position:absolute;left:10px;right:10px;bottom:0;height:120px;border-radius:6px;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 70%,#fff),var(--accent-t));box-shadow:0 18px 30px rgba(0,0,0,.3)}
.gb-lid{position:absolute;left:0;right:0;top:20px;height:40px;border-radius:6px;z-index:2;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 55%,#fff),var(--accent));box-shadow:0 4px 10px rgba(0,0,0,.2);transition:transform .7s cubic-bezier(.3,1.4,.5,1),opacity .7s}
.gb-rv{position:absolute;left:50%;width:22px;margin-left:-11px;top:20px;bottom:0;z-index:3;background:linear-gradient(90deg,#E9EBEF,#C6CAD2,#E9EBEF);transition:opacity .3s}
.gv-box.open .gb{animation:none}
.gv-box.open .gb-lid{transform:translateY(-110px) rotate(-18deg);opacity:0}
.gv-box.open .gb-rv{opacity:0}
.gv-pile{padding:14px 0}
.gv-end{text-align:center;color:rgba(255,255,255,.55);font-size:12px;letter-spacing:2px;margin-top:34px}
.gc{position:relative;width:min(80%,300px);margin:-26px auto 0;transform:translateX(var(--x)) rotate(var(--r));color:#3a2a2e;font-family:var(--ti);animation:gcIn .5s both;transition:transform .25s}
.gc:first-child{margin-top:0}
.gc.up{transform:scale(1.05);z-index:99!important}
@keyframes gcIn{from{opacity:0;transform:translateY(-40px)}}
.gi{position:relative;padding:18px 18px 16px;box-shadow:0 10px 22px rgba(0,0,0,.28)}
.gi small{display:block;font-family:var(--num);font-style:italic;font-size:11px;opacity:.5;margin-bottom:6px}
.gi b{display:block;font-weight:500;font-size:16px;letter-spacing:2px;line-height:1.5}
.gi p{font-size:14px;line-height:1.75;margin-top:6px;word-break:break-word}
.gi em{display:block;text-align:right;font-style:normal;font-size:13px;opacity:.6;margin-top:8px;letter-spacing:2px}
.letter .gi{background:#FBF8F2;padding:22px;background-image:repeating-linear-gradient(transparent 0 27px,rgba(0,0,0,.06) 27px 28px)}
.letter .gi p{line-height:28px;font-size:15px;margin:0}
.note .gi{background:color-mix(in srgb,var(--accent) 22%,#FFF6D6);border-radius:2px 2px 18px 2px}
.tape .gi{background:color-mix(in srgb,var(--accent) 12%,#FFFDF5);padding-top:24px}
.tape .gi::before{content:"";position:absolute;top:-10px;left:50%;width:84px;height:22px;margin-left:-42px;background:rgba(220,222,228,.78);transform:rotate(-3deg)}
.postcard .gi{background:#FCFBF8;padding-right:84px;min-height:120px}
.postcard .gi::before{content:"";position:absolute;top:14px;right:14px;width:44px;height:52px;border:1.5px dashed rgba(0,0,0,.2);background:color-mix(in srgb,var(--accent) 20%,transparent)}
.postcard .gi::after{content:"";position:absolute;top:14px;bottom:14px;right:70px;border-left:1px solid rgba(0,0,0,.08)}
.stamp{width:min(60%,210px)}
.stamp .gi{background:color-mix(in srgb,var(--accent) 28%,#fff);border:8px solid #FDFCF9;outline:3px dotted #FDFCF9;outline-offset:-1px;text-align:center}
.receipt .gi{background:#fff;font-family:ui-monospace,Menlo,monospace}
.receipt .gi b{font-size:14px;letter-spacing:0;border-bottom:1px dashed rgba(0,0,0,.2);padding-bottom:6px}
.receipt .gi p{font-size:12.5px}
.receipt .gi::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:8px;background:linear-gradient(135deg,#fff 4px,transparent 0) 0 0/8px 8px repeat-x,linear-gradient(225deg,#fff 4px,transparent 0) 0 0/8px 8px repeat-x}
.ticket .gi{background:color-mix(in srgb,var(--accent) 30%,#fff);border-radius:12px;padding:18px 26px}
.ticket .gi::before,.ticket .gi::after{content:"";position:absolute;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;background:#2a2229}
.ticket .gi::before{left:-9px}.ticket .gi::after{right:-9px}
.polaroid{width:min(66%,240px)}
.polaroid .gi{background:#fff;padding:12px 12px 16px}
.polaroid .ph{height:150px;display:flex;align-items:flex-end;padding:12px;background:linear-gradient(160deg,#D9DCE2,color-mix(in srgb,var(--accent) 35%,#B8BCC5));color:#fff;font-size:14px;line-height:1.5;letter-spacing:1px}
.tag .gi{background:#F3EEE6;border-radius:6px 22px 22px 6px;padding-left:40px}
.tag .gi::before{content:"";position:absolute;left:14px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#2a2229;box-shadow:inset 0 0 0 2px #C6CAD2}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-gift"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他送的礼物</h2><em>gifts</em><span class="sp"></span><button class="iconbtn glass" id="gfMenu" style="letter-spacing:1px">···</button></div>
  <div class="sub-line">他会在一些日子，给你寄一个盒子。</div>
  <div id="gfList"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`<div id="gfView"><div class="gv-top"><button class="iconbtn" id="gvBack" aria-label="返回">${BACK}</button><b id="gvT"></b><button class="iconbtn" id="gvMenu" style="letter-spacing:1px">···</button></div><div id="gvBody"></div></div>`);

/* ---------- 「关于他」里的卡片、列表 ---------- */
function card(){const g=$('#himGrid');if(!g)return;let c=g.querySelector('[data-go="gift"]');
  if(!c){const a=g.querySelector('[data-go="trip"]'),h='<button class="card glass hm-gift" data-go="gift"><div class="cn">他送的礼物</div><div class="ce">gifts</div><div class="hm-now" id="gfNow"></div></button>';
    if(a)a.insertAdjacentHTML('afterend',h);else g.insertAdjacentHTML('beforeend',h)}
  const n=DATA.gifts.length,u=DATA.gifts.filter(x=>!x.opened).length;
  $('#gfNow').textContent=busy?`${S.hisName}在打包…`:u?`有 ${u} 个还没拆`:n?`收到过 ${n} 个`:'还没有收到'}
function list(){const el=$('#gfList');if(!el)return;const L=[...DATA.gifts].sort((a,b)=>b.t-a.t);
  el.innerHTML=(busy?`<div class="gf-it glass"><div class="gf-tt"><b>${esc(S.hisName)}在打包…</b></div></div>`:'')
    +(L.length?L.map(g=>`<button class="gf-it glass" data-gf="${g.id}"><div class="gf-tt"><b>${esc(g.title)}</b>${g.opened?'':'<i>没拆</i>'}</div><div class="gf-m">${md(g.date)} · ${esc(g.why)} · ${arr(g.items).length} 件</div></button>`).join('')
      :'<div class="empty">还没有收到礼物<br>到了一些特别的日子，他会寄来</div>')}

/* ---------- 打包一个盒子 ---------- */
async function make(why,force){
  if(busy||!S.apiKey)return;busy=true;list();card();
  try{
    const mem=(DATA.memory||[]).filter(m=>m.on!==false&&!m.resolved).slice(-30).map(m=>'- '+m.text).join('\n');
    const rc=(DATA.recap||[]).slice(-5).map(r=>'- '+r.text).join('\n');
    const dy=(DATA.diary||[]).slice(-5).map(d=>`- ${d.date} ${String(d.text||'').slice(0,60)}`).join('\n');
    const tp=(DATA.trips||[]).slice(-4).map(t=>arr(t.stops).map(s=>s.city).join('、')).join('；');
    const ws=(DATA.wish||[]).filter(w=>!w.done).slice(-5).map(w=>w.text).join('、');
    const had=DATA.gifts.slice(-3).flatMap(g=>arr(g.items).map(x=>x.name)).slice(0,30).join('、');
    const j=J(await callAI(sceneSystem('你要亲手给她准备一个礼物盒，寄给她。'),[{role:'user',text:`这次送礼物的理由：${why}。
下面是你们之间的事，挑能放进盒子里的：
${mem?'【记得的事】\n'+mem+'\n':''}${rc?'【聊过的事】\n'+rc+'\n':''}${dy?'【她的日记】\n'+dy+'\n':''}${tp?'【你去过的地方】'+tp+'\n':''}${ws?'【心愿】'+ws+'\n':''}【最近的聊天】
${recentChat(40)}
${had?'之前的盒子里放过：'+had+'，不要重复。\n':''}请以${S.hisName}的身份，往盒子里放 8 到 12 件东西。大部分要和你们之间具体的事有关（一句梗、一次争吵、她说过的话、你们约好的事、你去过的地方带回来的小东西），也可以有一两件只是你觉得她会喜欢的。每件都是具体的、能放进盒子的实物。
每件写：name 物件，具体一点（比如「一张写着‘不准熬夜’的便利贴」）；why 一两句为什么放它，像你写在旁边的小字；style 从 note（便利贴）、tape（胶带便利贴）、postcard（明信片）、stamp（邮票）、receipt（小票）、ticket（票根）、polaroid（拍立得，name 写照片里的画面）、tag（吊牌）里挑最合适的，尽量混着用。
再写 title：这个盒子的名字，四到八个字；letter：放在最上面的一封短信，60 到 150 字。
不要用 emoji。只输出 JSON：{"title":"","letter":"","items":[{"name":"","why":"","style":"note"}]}`}]));
    const items=arr(j.items).filter(x=>x&&x.name).slice(0,12).map(x=>({name:String(x.name),why:String(x.why||''),style:STY.includes(x.style)?x.style:'note'}));
    if(items.length<3)throw new SyntaxError('empty');
    const g={id:uid(),date:T(),why,title:String(j.title||'一个盒子').slice(0,12),letter:clean(String(j.letter||'')),items,opened:false,t:Date.now()};
    DATA.gifts.push(g);await save();
    DATA.chat.push({role:'model',text:`${S.hisName}给你寄了一个礼物`,gift:g.id,t:Date.now()});await saveData('chat');
    refreshAll()}
  catch(e){if(force)toast(e instanceof SyntaxError?'没打包好，再试一次':e.message);else localStorage.removeItem('365-giftchk')}
  finally{busy=false;list();card()}}

/* ---------- 什么时候送 ---------- */
function reason(){const t=today(),d=T();
  for(const a of DATA.anniv||[]){if(!a.date)continue;
    if(a.type==='yearly'){if(a.date.slice(5)===d.slice(5))return `今天是「${a.name}」`}
    else{const n=daysBetween(parseDate(a.date),t)+1;if(n>1&&(n%100===0||n%365===0))return `今天是「${a.name}」的第 ${n} 天`}}
  const back=(DATA.trips||[]).find(x=>add(x.start,x.days-1)===add(d,-1));
  if(back)return `你刚从${arr(back.stops).map(s=>s.city).join('、')}回来，给她带了东西`;
  return null}
function check(){if(busy||!S.apiKey)return;const d=T();
  if(DATA.gifts.some(g=>g.date===d)||localStorage.getItem('365-giftchk')===d)return;
  localStorage.setItem('365-giftchk',d);
  let why=reason();
  if(!why){const m=d.slice(0,7);
    if(!S.giftDay||S.giftDay.slice(0,7)!==m){S.giftDay=`${m}-${pad(5+Math.floor(Math.random()*22))}`;saveSettings()}
    const last=Math.max(0,...DATA.gifts.map(g=>g.t));
    if(d===S.giftDay&&Date.now()-last>7*864e5)why='没什么特别的理由，就是想送她'}
  if(why)make(why)}

/* ---------- 拆开 ---------- */
window.openGift=id=>{const g=DATA.gifts.find(x=>x.id===id);if(!g)return toast('这个礼物找不到了');
  cur=g;$('#gfView').classList.add('show');if(g.opened)pile();else box()};
function box(){$('#gvT').textContent='';
  $('#gvBody').innerHTML=`<div class="gv-box" id="gvBox"><div class="gb"><i class="gb-lid"></i><i class="gb-base"></i><i class="gb-rv"></i></div><p>${esc(S.hisName)}给你寄了一个盒子<br><small>点一下拆开</small></p></div>`}
function one(x,i){const s=STY.includes(x.style)?x.style:STY[i%STY.length],r=((i*37+7)%11-5)*1.1,dx=((i*53+3)%9-4)*4;
  const body=s==='polaroid'?`<div class="ph">${esc(x.name)}</div><p>${esc(x.why)}</p>`:`<b>${esc(x.name)}</b><p>${esc(x.why)}</p>`;
  return `<div class="gc ${s}" style="--r:${r}deg;--x:${dx}px;z-index:${i+2};animation-delay:${(i+1)*90}ms"><div class="gi"><small>No.${pad(i+1)}</small>${body}</div></div>`}
function pile(){const g=cur;if(!g)return;$('#gvT').textContent=g.title;
  $('#gvBody').innerHTML=`<div class="gv-pile">${g.letter?`<div class="gc letter" style="--r:-1deg;--x:0px;z-index:1"><div class="gi"><small>to you</small><p>${esc(g.letter)}</p><em>— ${esc(S.hisName)}</em></div></div>`:''}${arr(g.items).map(one).join('')}<p class="gv-end">${md(g.date)} · ${esc(g.why)}</p></div>`;
  $('#gvBody').scrollTop=0}
$('#gvBody').onclick=async e=>{
  const bx=e.target.closest('#gvBox');
  if(bx&&cur&&!bx.classList.contains('open')){bx.classList.add('open');cur.opened=true;await save();setTimeout(()=>{pile();list();card();refreshAll()},750);return}
  const c=e.target.closest('.gc');if(!c)return;
  const was=c.classList.contains('up');$$('#gvBody .gc.up').forEach(x=>x.classList.remove('up'));if(!was)c.classList.add('up')};
$('#gvBack').onclick=()=>$('#gfView').classList.remove('show');
$('#gvMenu').onclick=()=>{const g=cur;if(!g)return;
  sheet([['复制这封信',()=>navigator.clipboard?.writeText(g.letter||'').then(()=>toast('已复制'))],
    ['删除这个礼物',async()=>{if(!confirm(`删除「${g.title}」？`))return;
      DATA.gifts=DATA.gifts.filter(x=>x!==g);DATA.chat=DATA.chat.filter(m=>m.gift!==g.id);
      await save();await saveData('chat');$('#gfView').classList.remove('show');list();card();refreshAll()}]])};
$('#gfList').onclick=e=>{const b=e.target.closest('[data-gf]');if(b)window.openGift(b.dataset.gf)};
$('#gfMenu').onclick=()=>sheet([[busy?`${S.hisName}在打包…`:'让他现在寄一个',()=>make('没什么特别的理由，就是想送她',true)]]);

/* ---------- 他记得自己送过什么 ---------- */
HOOKS.context.push(()=>{const g=[...DATA.gifts].sort((a,b)=>b.t-a.t)[0];if(!g||Date.now()-g.t>3*864e5)return '';
  return `【礼物】你${md(g.date)}给她寄了一个礼物盒「${g.title}」，里面有：${arr(g.items).map(x=>x.name).join('、')}。她${g.opened?'已经拆开了':'还没拆'}。可以自然地聊起，不用每句都提。`});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.gifts))DATA.gifts=[];card();setTimeout(check,20000)});
HOOKS.page.push(n=>{$('#gfView').classList.remove('show');if(n==='him')card();if(n==='gift')list()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(check,15000)});
})();
