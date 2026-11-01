/* ===== 365 · phone.js · 他的手机 ===== */
(()=>{
if(!Array.isArray(DATA.phone))DATA.phone=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('phone'))LISTS.push('phone');
const save=()=>saveData('phone');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const PIC='<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>';
const LOCK='<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const APPS=[['search','搜索','#8E8E93','?'],['memo','备忘录','#F5C842','≡'],['music','音乐','#FA3C5A','♪'],['shop','购物','#FF8A00','¥'],['tw','X','#000000','X']];
const T=()=>isoDate(today());
const arr=v=>Array.isArray(v)?v:[];
const rec=id=>{let r=DATA.phone.find(x=>x.id===id);if(!r){r={id};DATA.phone.push(r)}return r};
let view='lock',app=null,busy=false,twBusy=false,twOpen=false,page='home';
const seen=new Set();

document.head.insertAdjacentHTML('beforeend',`<style>
#page-phone{padding:0;overflow:hidden;background:#111}
body.ph #tabbar{display:none}
.ph-wall{position:absolute;inset:0;background:linear-gradient(160deg,#4a4f68,#1d1f2b) center/cover no-repeat}
.ph-layer{position:absolute;inset:0;display:none;flex-direction:column;isolation:isolate}
.ph-layer.on{display:flex}
#phLock{color:#fff;text-align:center;padding:calc(var(--st) + 6px) 20px calc(var(--sb) + 18px)}
.ph-date{font-family:var(--cn);font-size:17px;font-weight:600;margin-top:18px;text-shadow:0 1px 6px rgba(0,0,0,.3)}
.ph-time{font-family:var(--cn);font-weight:700;font-size:86px;line-height:1;letter-spacing:-2px;text-shadow:0 2px 12px rgba(0,0,0,.25)}
.ph-noti{margin:26px auto 0;max-width:380px;width:100%;text-align:left;padding:11px 14px;border-radius:20px;background:rgba(255,255,255,.22);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);font-family:var(--cn);font-size:14px;line-height:1.4;word-break:break-word}
.ph-noti b{display:flex;font-size:13px;margin-bottom:2px}
.ph-noti b span{margin-left:auto;font-weight:400;opacity:.7}
.ph-lb{margin-top:auto;display:flex;align-items:center;justify-content:space-between}
.ph-round{width:46px;height:46px;border-radius:50%;background:rgba(0,0,0,.3);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:grid;place-items:center;color:#fff}
.ph-hint{font-family:var(--cn);font-size:13px;opacity:.85}
#phHome{padding:calc(var(--st) + 6px) 22px calc(var(--sb) + 16px)}
#phHome::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.18);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);z-index:-1}
.ph-top{display:flex;align-items:center;gap:10px;color:#fff}
.ph-top .iconbtn{background:rgba(0,0,0,.25);color:#fff}
.ph-top span{font-family:var(--cn);font-size:13px;opacity:.85;margin-left:auto}
.ph-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 10px;margin-top:30px}
.ph-app{display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-family:var(--cn);font-size:12px;text-shadow:0 1px 3px rgba(0,0,0,.4)}
.ph-ic{width:60px;height:60px;border-radius:15px;display:grid;place-items:center;font-size:27px;font-weight:600;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.2);font-family:var(--cn)}
.ph-app:active .ph-ic{transform:scale(.92)}
#phApp{background:#F2F2F7;color:#000;font-family:var(--cn)}
.pa-top{flex:none;display:flex;align-items:center;gap:6px;padding:calc(var(--st) + 4px) 8px 8px}
.pa-top button{color:#007AFF;font-size:16px;padding:6px;min-width:76px;text-align:left}
.pa-top button:last-child{text-align:right}
.pa-top b{flex:1;text-align:center;font-size:17px;font-weight:600}
#paBody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px calc(var(--sb) + 20px)}
.pa-h{font-size:13px;color:#6e6e73;margin:14px 4px 6px}
.pa-g{background:#fff;border-radius:12px;overflow:hidden}
.pa-r{padding:12px 14px;border-top:.5px solid rgba(60,60,67,.18);font-size:16px;line-height:1.45;word-break:break-word}
.pa-r:first-child{border-top:0}
.pa-r small{display:block;font-size:13px;color:#6e6e73;margin-top:2px}
.pa-r .pr{float:right;font-weight:600;margin-left:10px}
.pa-note{background:#fff;border-radius:12px;padding:14px;margin-top:10px}
.pa-note b{display:block;font-size:17px;margin-bottom:4px}
.pa-note p{font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:#333}
.pa-empty{text-align:center;color:#8e8e93;margin:60px 0;font-size:15px}
#phApp.tw{background:#000;color:#E7E9EA}
#phApp.tw .pa-top button{color:#E7E9EA}
.tw-pf{padding:14px 2px;border-bottom:1px solid #2F3336}
.tw-pf b{font-size:20px}
.tw-pf small{display:block;color:#71767B;font-size:14px}
.tw-pf p{font-size:15px;margin-top:8px;line-height:1.5;white-space:pre-wrap}
.tw-p{display:flex;gap:10px;padding:12px 2px;border-bottom:1px solid #2F3336}
.tw-av{width:38px;height:38px;border-radius:50%;background:#333;flex:none;display:grid;place-items:center;font-weight:700}
.tw-tag{font-size:12.5px;color:#71767B;margin-bottom:2px}
.tw-n{font-size:15px}
.tw-n span{color:#71767B}
.tw-x{font-size:15px;line-height:1.5;white-space:pre-wrap;word-break:break-word;margin-top:2px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-phone">
  <div class="ph-wall" id="phWall"></div>
  <div class="ph-layer" id="phLock">
    <div style="display:flex"><button class="ph-round" data-go="more" aria-label="返回">${BACK}</button></div>
    <div class="ph-date" id="phDate"></div>
    <div class="ph-time" id="phTime"></div>
    <div id="phNoti"></div>
    <div class="ph-lb"><button class="ph-round" id="phWallBtn" aria-label="换壁纸">${PIC}</button><span class="ph-hint">轻点解锁</span><span style="width:46px"></span></div>
  </div>
  <div class="ph-layer" id="phHome">
    <div class="ph-top"><button class="iconbtn" data-go="more" aria-label="返回">${BACK}</button><button class="iconbtn" id="phLockBtn" aria-label="锁屏">${LOCK}</button><span id="phSt"></span></div>
    <div class="ph-grid" id="phGrid"></div>
  </div>
  <div class="ph-layer" id="phApp">
    <div class="pa-top"><button id="paBack">‹ 主屏幕</button><b id="paT"></b><button id="paMore">刷新</button></div>
    <div id="paBody"></div>
  </div>
</section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="phPin"><div class="mbox">
  <h3>X</h3>
  <p class="hint" style="color:var(--sys-sub);text-align:center">输入秘密的密码</p>
  <input id="phPinIn" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" style="width:160px;margin:12px auto 4px;display:block;text-align:center;font-size:26px;letter-spacing:14px;padding:8px 0 8px 14px;border:0;border-radius:14px;background:var(--sys-card);color:var(--sys-txt);outline:none">
  <div class="mbtns" style="justify-content:center"><button class="pill ghost" data-close="phPin">取消</button></div>
</div></div>`);

/* ---------- 切换画面 ---------- */
const LAYER={lock:'phLock',home:'phHome',app:'phApp'};
function show(v){view=v;Object.entries(LAYER).forEach(([k,id])=>$('#'+id).classList.toggle('on',k===v))}

/* ---------- 锁屏 ---------- */
function renderLock(){const d=new Date();
  $('#phTime').textContent=pad(d.getHours())+':'+pad(d.getMinutes());
  $('#phDate').textContent=`${d.getMonth()+1}月${d.getDate()}日 星期${'日一二三四五六'[d.getDay()]}`;
  const m=[...DATA.chat].reverse().find(x=>x.role==='user');
  $('#phNoti').innerHTML=m?`<div class="ph-noti"><b>小狗<span>${fmtTime(m.t)}</span></b>${esc((m.text||'[照片]').slice(0,60))}</div>`:''}
$('#phLock').addEventListener('click',e=>{if(e.target.closest('button'))return;show('home');renderHome();ensure()});
$('#phLockBtn').onclick=()=>{show('lock');renderLock()};
setInterval(()=>{if(page==='phone'&&view==='lock')renderLock()},10000);

/* ---------- 壁纸 ---------- */
async function applyWall(){const id=rec('wall').images?.[0];const d=id?await IMG.get(id):'';$('#phWall').style.backgroundImage=d?`url(${d})`:''}
$('#phWallBtn').onclick=()=>{const w=rec('wall'),has=w.images?.length;
  const acts=[['换一张壁纸',async()=>{const im=await pickPhotos(1,1600,.85);if(!im.length)return;
    const ids=await IMG.putAll(im),old=w.images||[];w.images=ids;await save();await IMG.del(old);applyWall();toast('换好了')}]];
  if(has)acts.push(['恢复默认',async()=>{const old=w.images;w.images=[];await save();await IMG.del(old);applyWall()}]);
  sheet(acts)};

/* ---------- 桌面 ---------- */
function renderHome(){
  $('#phGrid').innerHTML=APPS.map(([k,n,c,s])=>`<button class="ph-app" data-app="${k}"><div class="ph-ic" style="background:${c}">${s}</div>${n}</button>`).join('');
  $('#phSt').textContent=busy?'正在同步…':''}
$('#phGrid').onclick=e=>{const b=e.target.closest('[data-app]');if(b)openApp(b.dataset.app)};

/* ---------- 生成今天的内容 ---------- */
function ensure(){if(rec('day').date!==T())gen()}
async function gen(){
  if(busy)return;busy=true;renderHome();if(view==='app')renderApp();
  try{
    const recent=recentChat(16);
    const t=await callAI(sceneSystem('她在偷偷翻你的手机。你要把你手机里今天的内容写出来，要像真的一样，符合你的人设、你的生活和你们最近的事。'),
      [{role:'user',text:`今天是${T()}。${recent?'你们最近的聊天：\n'+recent+'\n':''}请写出你手机里这些 App 今天的内容。不要用 emoji，只输出 JSON，不要其他文字：
{"search":["最近的搜索记录，8条，越靠前越新，有生活和工作的，也有和她有关的、有点好笑或让人心动的"],
"memo":[{"title":"备忘录标题","text":"内容"}],
"music":[{"song":"歌名","artist":"歌手","note":"什么时候听的，比如 凌晨1:20 单曲循环"}],
"shop":[{"item":"商品","price":"价格","status":"在购物车 / 已下单 / 已签收","note":"一句备注，可以空着"}]}
memo 写 3 条，可以是关于她的小事、工作、想对她说又没说出口的话；music 写 6 首真实存在的歌；shop 写 5 条，可以有给她买的。`}]);
    const j=JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
    Object.assign(rec('day'),{date:T(),search:arr(j.search),memo:arr(j.memo),music:arr(j.music),shop:arr(j.shop)});
    await save()}
  catch(e){toast(e instanceof SyntaxError?'没读出来，点右上角刷新再试一次':e.message)}
  finally{busy=false;renderHome();if(view==='app')renderApp()}}

/* ---------- 推特：用秘密的模型 ---------- */
async function sxAI(system,text){
  const c=S.sxProvider
    ?{p:S.sxProvider,k:S.sxKey||S.apiKey,m:S.sxModel||(S.sxProvider==='gemini'?'gemini-2.5-flash':'deepseek-chat'),u:S.sxBase||S.baseUrl}
    :{p:S.provider,k:S.apiKey,m:S.model,u:S.baseUrl};
  if(!c.k)throw new Error('还没有填 API Key');
  let r,j,t;
  try{
    if(c.p==='gemini'){
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.m)}:generateContent?key=${encodeURIComponent(c.k)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text}]}],generationConfig:{temperature:1},safetySettings:cats.map(x=>({category:x,threshold:'BLOCK_NONE'}))})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const cd=j.candidates?.[0];
      t=(cd?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
      if(!t)throw new Error('他没有回话（原因：'+(cd?.finishReason||j.promptFeedback?.blockReason||'未知')+'），再试一次');
    }else{
      r=await fetch(String(c.u||'').replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.k},
        body:JSON.stringify({model:c.m,messages:[{role:'system',content:system},{role:'user',content:text}],temperature:1})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      t=(j.choices?.[0]?.message?.content||'').trim();
      if(!t)throw new Error('他没有回话，再试一次');
    }
    return t}
  catch(e){if(e instanceof TypeError)throw new Error('连不上，检查一下 VPN 和网络');throw e}}
async function genTw(){
  if(twBusy)return;twBusy=true;if(app==='tw')renderApp();
  try{
    let sys=personaText()+'\n\n'+nowLine()+'\n【场景】她在偷偷翻你的手机，打开了你的推特（X）小号。这里只属于你们两个人，没有别人能看到。';
    if((S.sxExtra||'').trim())sys+='\n\n'+S.sxExtra.trim();
    const t=await sxAI(sys,`请写出你推特小号今天的样子：你点赞、收藏、转发的内容，还有你自己发的。按你的人设和你们之间的玩法来，是你在上面“学习”、想以后对她做的事。不要用 emoji，只输出 JSON，不要其他文字：
{"name":"小号昵称","handle":"@开头的用户名","bio":"简介","posts":[{"type":"赞过 / 收藏 / 转发 / 我发的","author":"作者昵称","handle":"@用户名","text":"内容","time":"比如 2小时"}]}
posts 写 8 条。`);
    const j=JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
    Object.assign(rec('tw'),{date:T(),name:j.name||'',handle:j.handle||'',bio:j.bio||'',posts:arr(j.posts)});
    await save()}
  catch(e){toast(e instanceof SyntaxError?'没读出来，点右上角刷新再试一次':e.message)}
  finally{twBusy=false;if(app==='tw')renderApp()}}

/* ---------- 打开 App ---------- */
async function hash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('365:'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function openApp(k){
  if(k==='tw'&&!twOpen){
    if(!S.sxPin)return toast('先去 More 里的「秘密」设一个密码');
    $('#phPinIn').value='';openModal('phPin');setTimeout(()=>$('#phPinIn').focus(),150);return}
  app=k;seen.add(k);show('app');renderApp();
  if(k==='tw'){if(rec('tw').date!==T())genTw()}else ensure()}
$('#phPinIn').oninput=async e=>{const i=e.target;i.value=i.value.replace(/\D/g,'').slice(0,4);if(i.value.length<4)return;
  if(await hash(i.value)===S.sxPin){twOpen=true;i.blur();closeModal('phPin');openApp('tw')}
  else{toast('密码不对');i.value=''}};
$('#paBack').onclick=()=>{app=null;show('home');renderHome()};
$('#paMore').onclick=()=>{const tw=app==='tw';
  sheet([[tw?'重新生成今天的推特':'重新生成今天的内容',()=>tw?genTw():gen()]])};

function renderApp(){
  const k=app;if(!k)return;const tw=k==='tw';
  $('#phApp').classList.toggle('tw',tw);
  $('#paT').textContent=APPS.find(a=>a[0]===k)[1];
  const D=tw?rec('tw'):rec('day'),b=$('#paBody'),loading=tw?twBusy:busy;
  if(!D.date){b.innerHTML=`<div class="pa-empty">${loading?'正在加载…':'还没有内容，点右上角刷新'}</div>`;return}
  const tip=loading?'<div class="pa-h" style="text-align:center">正在更新…</div>':'';
  let h='';
  if(k==='search')h=`<div class="pa-h">最近搜索</div><div class="pa-g">${arr(D.search).map(s=>`<div class="pa-r">${esc(s)}</div>`).join('')}</div>`;
  if(k==='memo')h=arr(D.memo).map(n=>`<div class="pa-note"><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div>`).join('');
  if(k==='music')h=`<div class="pa-h">最近播放</div><div class="pa-g">${arr(D.music).map(m=>`<div class="pa-r">${esc(m.song)}<small>${esc(m.artist)}${m.note?' · '+esc(m.note):''}</small></div>`).join('')}</div>`;
  if(k==='shop')h=`<div class="pa-h">购物车和订单</div><div class="pa-g">${arr(D.shop).map(s=>`<div class="pa-r"><span class="pr">${esc(s.price)}</span>${esc(s.item)}<small>${esc(s.status)}${s.note?' · '+esc(s.note):''}</small></div>`).join('')}</div>`;
  if(tw)h=`<div class="tw-pf"><b>${esc(D.name)}</b><small>${esc(D.handle)}</small>${D.bio?`<p>${esc(D.bio)}</p>`:''}</div>`
    +arr(D.posts).map(p=>`<div class="tw-p"><div class="tw-av">${esc(String(p.author||'?').slice(0,1))}</div><div style="flex:1;min-width:0"><div class="tw-tag">${esc(p.type)}</div><div class="tw-n"><b>${esc(p.author)}</b> <span>${esc(p.handle)} · ${esc(p.time)}</span></div><div class="tw-x">${esc(p.text)}</div></div></div>`).join('');
  b.innerHTML=tip+(h||'<div class="pa-empty">空空的</div>')}

/* ---------- 被他发现 ---------- */
function caught(){
  if(!seen.size||!S.apiKey){seen.clear();return}
  const names=[...seen].map(a=>APPS.find(x=>x[0]===a)[1]),tw=seen.has('tw');seen.clear();
  const key='365-phcaught';if(localStorage.getItem(key)===T())return;
  if(Math.random()>.4)return;
  localStorage.setItem(key,T());
  setTimeout(async()=>{try{
    const ctx=DATA.chat.slice(-10).map(m=>({role:m.role,text:m.text||'（发了照片）'}));
    const t=await callAI(chatSystem(),[...ctx,{role:'user',text:`（系统提示，不是她说的话：你发现她刚才偷偷翻了你的手机，看了你的${names.join('、')}${tw?'。推特的内容只能含糊地暗示，不要直接说出来':''}。主动发消息给她，按你的性格来：可以逮住她、调侃她、问她看到了什么。只输出消息内容，不要用 emoji。）`}]);
    const lines=(S.split?t.split(/\n+/):[t]).map(s=>clean(s)).filter(Boolean),now=Date.now();
    lines.forEach((l,i)=>DATA.chat.push({role:'model',text:l,t:now+i*1500}));
    await saveData('chat');refreshAll()}catch(e){}},(30+Math.random()*60)*1000)}

/* ---------- 离开就锁上 ---------- */
document.addEventListener('visibilitychange',()=>{if(!document.hidden)return;
  twOpen=false;$('#phPin').classList.remove('show');if(app==='tw'){app=null;show('home')}});

addMore({go:'phone',cn:'他的手机',ce:'his phone'});
HOOKS.ready.push(applyWall);
HOOKS.page.push(n=>{const was=page;page=n;document.body.classList.toggle('ph',n==='phone');
  if(n==='phone'){app=null;show('lock');renderLock();applyWall()}
  else if(was==='phone'){twOpen=false;app=null;caught()}});
})();
