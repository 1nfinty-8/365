/* ===== 365 · daily.js · 首页提醒、早安晚安、回忆、通知横幅、主动消息 ===== */
(()=>{
Object.assign(DEFAULT,{greet:true,idleMin:20,chaseMax:4,awayHours:3,awayMax:2,quietFrom:'01:00',quietTo:'07:30',recallTalk:true});

document.head.insertAdjacentHTML('beforeend',`<style>
.hm-tips{display:flex;flex-direction:column;align-items:center;gap:1px;margin-top:8px}
.hm-tips:empty{display:none}
.hm-tips button{font-size:12.5px;color:var(--sub);letter-spacing:1.5px;padding:2px 10px}
.hm-tips b{color:var(--accent-t);font-weight:400}
#nb{position:fixed;left:8px;right:8px;top:calc(var(--st) + 6px);max-width:440px;margin:0 auto;z-index:98;display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:22px;background:var(--sys-bg);color:var(--sys-txt);-webkit-backdrop-filter:blur(30px) saturate(1.8);backdrop-filter:blur(30px) saturate(1.8);box-shadow:0 8px 30px rgba(0,0,0,.15);font-family:var(--cn);transform:translateY(-160%);transition:transform .4s cubic-bezier(.2,.9,.3,1.15)}
#nb.show{transform:none}
#nb .av{width:38px;height:38px;font-size:15px}
.nb-m{flex:1;min-width:0}
.nb-h{display:flex;align-items:baseline;font-size:14px}
.nb-h b{font-weight:600}
.nb-h span{margin-left:auto;font-size:12px;color:var(--sys-sub)}
.nb-x{font-size:14px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.card{position:relative}
#tabbar button{position:relative}
.ndot{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--dot,#7E5A61);box-shadow:0 0 0 2px rgba(255,255,255,.85);display:none}
.card .ndot{top:14px;right:16px}
#tabbar .ndot{top:9px;left:calc(50% + 8px)}
.has-dot>.ndot{display:block}
.row.flash .bubble{animation:rcf 1.8s ease}
@keyframes rcf{0%,60%{box-shadow:0 0 0 3px var(--accent)}100%{box-shadow:0 0 0 0 transparent}}
#rcBody{max-height:60vh;overflow-y:auto}
.rc-d{text-align:center;font-family:var(--en);font-style:italic;color:var(--sys-sub);margin-bottom:4px}
.rc-s{font-size:12px;color:var(--sys-sub);margin:14px 0 6px;letter-spacing:1px}
.rc-l{font-size:14.5px;line-height:1.6;padding:2px 0;word-break:break-word}
.rc-l b{font-weight:600;margin-right:6px;color:var(--accent-t)}
.rc-p{font-size:14.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word}
.tm{display:flex;align-items:center;gap:8px}
.tm input{flex:1}
</style>`);

/* ---------- 页面元素 ---------- */
$('#since').insertAdjacentHTML('afterend','<div class="hm-tips" id="hmTips"></div>');
document.body.insertAdjacentHTML('beforeend','<div id="nb"></div>');
$('.card[data-go="chat"]')?.insertAdjacentHTML('beforeend','<i class="ndot"></i>');
$('#tabbar [data-go="chat"]')?.insertAdjacentHTML('beforeend','<i class="ndot"></i>');
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="rcModal"><div class="mbox">
  <h3>回忆这一天</h3>
  <div id="rcBody"></div>
  <div class="mbtns"><button class="pill ghost" id="rcJump">去聊天里看那天</button><button class="pill" data-close="rcModal">好</button></div>
</div></div>`);
$('#exportBtn').closest('.sec').insertAdjacentHTML('beforebegin',`
<div class="sec glass">
  <h3>他的消息<em>messages</em></h3>
  <label class="chk"><input type="checkbox" data-k="greet"><span>早安 / 晚安</span></label>
  <p class="hint">早上 5～12 点第一次打开时说早安；晚上 11 点到凌晨 4 点打开时催你睡觉。</p>
  <label class="f"><span>开着 365 不说话多久，他会主动找你（分钟，填 0 就不主动）</span><input type="number" min="0" max="240" data-k="idleMin"></label>
  <label class="f"><span>你一直不回，他最多连着找你几次（1～10，每次间隔会越来越长）</span><input type="number" min="1" max="10" data-k="chaseMax"></label>
  <label class="f"><span>离开多久以后他会留言（小时，填 0 就不留言）</span><input type="number" min="0" max="72" step="0.5" data-k="awayHours"></label>
  <label class="f"><span>每次最多留几条（1～5）</span><input type="number" min="1" max="5" data-k="awayMax"></label>
  <div class="f"><span>安静时段（这段时间他不会主动发）</span><div class="tm"><input type="time" data-k="quietFrom"><span>到</span><input type="time" data-k="quietTo"></div></div>
  <label class="chk"><input type="checkbox" data-k="recallTalk"><span>回忆这一天时，让他说一句</span></label>
  <p class="hint">他每次主动说话都会用一次 API。</p>
</div>`);

/* ---------- 工具 ---------- */
const LS={get:(k,d)=>{try{const v=localStorage.getItem('365-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>localStorage.setItem('365-'+k,JSON.stringify(v))};
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const when=t=>{const d=new Date(t);return (isoDate(d)===isoDate(new Date())?'':`${d.getMonth()+1}月${d.getDate()}日 `)+hm(d)};
const mins=s=>{const[a,b]=String(s||'').split(':').map(Number);return (a||0)*60+(b||0)};
function quiet(d=new Date()){if(!S.quietFrom||!S.quietTo)return false;
  const f=mins(S.quietFrom),t=mins(S.quietTo),m=d.getHours()*60+d.getMinutes();
  if(f===t)return false;return f<t?(m>=f&&m<t):(m>=f||m<t)}
let page='home',gen=false,awake=false,ready=false,prev=null,openedAt=Date.now(),nbT,lastW=0,tipsAt=0,dc='',recall=null;

/* ---------- 通知横幅 ---------- */
function hide(){$('#nb').classList.remove('show')}
function banner(text,fn){const b=$('#nb');
  b.innerHTML=`${avatarHTML('him')}<div class="nb-m"><div class="nb-h"><b>${esc(S.hisName)}</b><span>现在</span></div><div class="nb-x">${esc(text)}</div></div>`;
  b.onclick=()=>{hide();fn&&fn()};b.classList.add('show');clearTimeout(nbT);nbT=setTimeout(hide,4500)}
let sy=0;
$('#nb').addEventListener('touchstart',e=>{sy=e.touches[0].clientY},{passive:true});
$('#nb').addEventListener('touchmove',e=>{if(e.touches[0].clientY-sy<-15)hide()},{passive:true});

/* ---------- 未读圆点 ---------- */
const markSeen=()=>LS.set('seen',Date.now());
function unread(){const s=LS.get('seen',0);
  for(let i=DATA.chat.length-1;i>=0;i--){const m=DATA.chat[i];if(m.t<=s)return false;if(m.role==='model')return true}return false}
function dots(){const on=page!=='chat'&&unread();$$('.ndot').forEach(d=>d.parentElement.classList.toggle('has-dot',on))}

/* ---------- 新动静 → 横幅 ---------- */
function counts(){let dy=0,mo=0,tc=0,dyL=null,moL=null;
  for(const d of DATA.diary)for(const c of d.comments||[])if(c.author==='him'){dy++;if(!dyL||c.t>dyL.t)dyL=c}
  for(const p of DATA.moments){if(p.author==='him'){mo++;if(!moL||p.t>moL.t)moL={t:p.t,text:p.text,post:1}}
    for(const c of p.comments||[])if(c.author==='him'){mo++;if(!moL||c.t>moL.t)moL=c}}
  for(const c of DATA.capsule)if(c.his)tc++;
  return {chat:DATA.chat.length,dy,mo,tc,dyL,moL}}
function watch(){const c=counts();
  if(prev){
    if(c.chat>prev.chat&&page!=='chat'){const m=DATA.chat.slice(prev.chat).filter(x=>x.role==='model').at(-1);if(m)banner(m.text||'[照片]',()=>go('chat'))}
    if(c.dy>prev.dy&&page!=='diary')banner('批注了你的日记：'+(c.dyL?.text||''),()=>go('diary'));
    if(c.mo>prev.mo&&page!=='moments')banner((c.moL?.post?'发了一条朋友圈：':'评论了你：')+(c.moL?.text||''),()=>go('moments'));
    if(c.tc>prev.tc&&page!=='capsule')banner('也写好了一封信，封进时间胶囊里了 ✉︎',()=>go('capsule'))}
  prev=c}

/* ---------- 首页小提醒 ---------- */
function annivTips(){const t=today(),out=[],ml=x=>x%365===0?`${x/365} 周年`:`第 ${x} 天`;
  for(const a of DATA.anniv||[]){
    if(a.type==='yearly'){const[,m,d]=a.date.split('-').map(Number);let nx=new Date(t.getFullYear(),m-1,d);if(nx<t)nx=new Date(t.getFullYear()+1,m-1,d);
      const l=daysBetween(t,nx);if(l<=7)out.push(l?`「${a.name}」还有 ${l} 天`:`今天是「${a.name}」🎉`)}
    else{const n=daysBetween(parseDate(a.date),t)+1;
      if(n<=0){if(1-n<=7)out.push(`「${a.name}」还有 ${1-n} 天`)}
      else if(n%100===0||n%365===0)out.push(`今天是「${a.name}」的${ml(n)} 🎉`);
      else{const nm=Math.min(Math.ceil((n+1)/100)*100,Math.ceil((n+1)/365)*365);if(nm-n<=7)out.push(`「${a.name}」的${ml(nm)}还有 ${nm-n} 天`)}}}
  return out}
const RC=[['一年前的今天',d=>new Date(d.getFullYear()-1,d.getMonth(),d.getDate())],['一个月前的今天',d=>new Date(d.getFullYear(),d.getMonth()-1,d.getDate())],['一周前的今天',d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()-7)]];
function dayOf(iso){const on=t=>isoDate(new Date(t))===iso;
  return {chat:DATA.chat.filter(m=>m.text&&on(m.t)),diary:DATA.diary.filter(d=>d.date===iso),moments:DATA.moments.filter(p=>on(p.t))}}
function findRecall(){const t=today();
  for(const[label,f]of RC){const d=f(t);if(label!=='一周前的今天'&&d.getDate()!==t.getDate())continue;
    const iso=isoDate(d),x=dayOf(iso);if(x.chat.length||x.diary.length||x.moments.length)return {label,iso,...x}}
  return null}
function renderTips(){const el=$('#hmTips');if(!el||!ready)return;tipsAt=Date.now();const L=[];
  recall=findRecall();
  if(recall)L.push(`<button id="hmRecall"><b>✦</b> ${recall.label}</button>`);
  annivTips().slice(0,2).forEach(s=>L.push(`<button data-go="anniv">${esc(s)}</button>`));
  DATA.capsule.filter(c=>!c.opened&&c.openDate<=isoDate(today())).slice(0,1).forEach(c=>L.push(`<button data-go="capsule">「${esc(c.title)}」可以拆了</button>`));
  if(new Date().getHours()>=20&&!DATA.diary.some(d=>d.date===isoDate(today())))L.push('<button data-go="diary">今天还没写日记哦，小狗</button>');
  el.innerHTML=L.slice(0,4).join('')}
$('#hmTips').addEventListener('click',e=>{if(e.target.closest('#hmRecall'))openRecall()});

/* ---------- 回忆这一天 ---------- */
function openRecall(){const r=recall;if(!r)return;
  const[y,m,d]=r.iso.split('-');
  const line=x=>`<div class="rc-l"><b>${x.role==='user'?'我':esc(S.hisName)}</b>${esc(x.text)}</div>`;
  const C=r.chat;
  const ch=C.length?`<div class="rc-s">那天聊了 ${C.length} 句</div>`+(C.length>8?C.slice(0,4).map(line).join('')+'<div class="rc-l" style="color:var(--sys-sub)">……</div>'+C.slice(-4).map(line).join(''):C.map(line).join('')):'';
  const dy=r.diary.map(x=>`<div class="rc-s">那天的日记 ${x.mood||''}</div><div class="rc-p">${esc((x.text||'').slice(0,240))}${(x.text||'').length>240?'…':''}</div>`).join('');
  const imgs=r.moments.flatMap(p=>p.images||[]).slice(0,6);
  const mo=r.moments.length?'<div class="rc-s">那天的朋友圈</div>'+r.moments.filter(p=>p.text).slice(0,3).map(p=>`<div class="rc-p">${p.author==='me'?'我':esc(S.hisName)}：${esc(p.text)}</div>`).join('')
    +(imgs.length?`<div class="pimgs n${Math.min(imgs.length,3)}">${imgs.map(id=>IMG.tag(id,'class="zoom"')).join('')}</div>`:''):'';
  $('#rcBody').innerHTML=`<div class="rc-d">${r.label} · ${y}.${m}.${d}</div>${ch}${dy}${mo}${S.recallTalk?`<div class="rc-s">${esc(S.hisName)}说</div><div class="tc-his" id="rcHim">…</div>`:''}`;
  $('#rcJump').style.display=C.length?'':'none';
  IMG.hydrate($('#rcBody'));openModal('rcModal');
  if(S.recallTalk)himRecall(r)}
async function himRecall(r){
  const key=isoDate(today())+r.label,c=LS.get('recall',{}),el=()=>$('#rcHim');
  if(c.key===key&&c.text){el().textContent=c.text;return}
  if(!S.apiKey){el().textContent='（填好 API Key 以后他才能说话）';return}
  el().textContent=`${S.hisName}在看…`;
  try{
    const brief=[r.chat.length?'聊天：\n'+r.chat.slice(0,12).map(x=>(x.role==='user'?'她':'你')+'：'+x.text).join('\n'):'',
      r.diary.length?'她的日记：'+r.diary.map(x=>x.text).join('；').slice(0,300):'',
      r.moments.length?'朋友圈：'+r.moments.map(p=>(p.author==='me'?'她':'你')+'：'+(p.text||'（照片）')).join('；').slice(0,200):''].filter(Boolean).join('\n\n');
    const t=await callAI(sceneSystem('这是你们的小窝「365」，她正在翻「回忆这一天」。'),
      [{role:'user',text:`她翻到了${r.label}（${r.iso}）的记录：\n${brief}\n\n请以${S.hisName}的身份，看到这些回忆后对她说一两句话，可以感慨、调侃或者心疼她。口语化，不超过60字，只输出这句话。`}]);
    const s=clean(t);LS.set('recall',{key,text:s});if(el())el().textContent=s}
  catch(e){if(el())el().textContent='（他没说出来：'+e.message+'）'}}
$('#rcJump').onclick=()=>{const r=recall;if(!r)return;
  const i=DATA.chat.findIndex(m=>isoDate(new Date(m.t))===r.iso);
  closeModal('rcModal');go('chat');
  setTimeout(()=>{const el=$(`#msgs .row[data-i="${i}"]`);
    if(!el)return toast('那天太久远了，聊天页只显示最近 300 条');
    el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1900)},450)};

/* ---------- 让他说话 ---------- */
async function himSay(instr,stamps){
  if(gen||!S.apiKey)return false;gen=true;
  const st=$('#status');let mine=false;
  try{
    if(!st.textContent){st.textContent='正在输入…';mine=true}
    const n=stamps.length;
    const ctx=DATA.chat.slice(-16).map(m=>({role:m.role,text:m.text||'（发了照片）'}));
    const ask=instr+(n>1?`\n一共要写 ${n} 次，按时间顺序，每次之间用单独一行 === 隔开。`:'')+(S.split?'\n每次可以发一到三条短消息，每条单独一行。':'')+'\n只输出消息内容，不要写时间，不要提「系统」或「365」。';
    const out=await callAI(chatSystem(),[...ctx,{role:'user',text:'（系统提示，不是她说的话：'+ask+'）'}]);
    const groups=(n>1?out.split(/^\s*={3,}\s*$/m):[out]).map(g=>g.trim()).filter(Boolean).slice(0,n);
    if(!groups.length)return false;
    groups.forEach((g,gi)=>{
      const lines=(S.split?g.split(/\n+/):[g]).map(s=>clean(s)).filter(s=>s&&!/^=+$/.test(s));
      lines.forEach((l,li)=>DATA.chat.push({role:'model',text:l,t:stamps[gi]+li*15000,pro:true}))});
    await saveData('chat');refreshAll();return true}
  catch(e){console.warn(e);return false}
  finally{gen=false;if(mine)st.textContent=''}}

/* 早安 / 晚安 */
async function greet(){if(!S.greet||!S.apiKey)return false;
  const d=new Date(),h=d.getHours();
  if(h>=5&&h<12){const k=isoDate(d);if(LS.get('morning','')===k)return false;LS.set('morning',k);
    const ok=await himSay(`现在是早上 ${hm(d)}，今天星期${'日一二三四五六'[d.getDay()]}，她今天第一次打开手机来找你。跟她说早安，可以结合今天星期几、最近聊过的事或者你记得的事，自然一点，不要每天都一样。`,[Date.now()]);
    if(!ok)LS.set('morning','');return ok}
  if(h>=23||h<4){const k=isoDate(h<4?new Date(d.getFullYear(),d.getMonth(),d.getDate()-1):d);if(LS.get('night','')===k)return false;LS.set('night',k);
    const ok=await himSay(`现在已经 ${hm(d)} 了，深夜，她还没睡，还在玩手机。催她去睡觉，用你自己的语气，可以凶一点，也可以哄她。`,[Date.now()]);
    if(!ok)LS.set('night','');return ok}
  return false}

/* 离开时留言 */
async function away(last){
  const H=Number(S.awayHours)||0;if(!H||!S.apiKey||!last)return false;
  const now=Date.now(),gap=now-last;if(gap<H*36e5)return false;
  const max=Math.max(1,Math.min(5,Number(S.awayMax)||2)),n=Math.min(max,Math.max(1,Math.ceil(gap/36e5/4)));
  const a=last+20*6e4,b=now-3*6e4,ts=[];
  for(let k=0;k<n*60&&ts.length<n;k++){const t=a+Math.random()*(b-a);
    if(!quiet(new Date(t))&&ts.every(x=>Math.abs(x-t)>40*6e4))ts.push(t)}
  if(!ts.length)return false;ts.sort((x,y)=>x-y);
  return himSay(`她离开了大约 ${Math.max(1,Math.round(gap/36e5))} 个小时，现在刚回来，还没看到你的消息。请写你在她不在的这段时间里陆续发给她的消息，分别在 ${ts.map(when).join('、')} 发出。内容要符合那个时间点，比如中午提醒她吃饭、下午说说你在干嘛、晚上想她，像真的隔了一段时间发的，后面的可以接着前面的说。`,ts)}

/* 开着不说话时主动找她：一阵一阵地追着发 */
let idleMark=Date.now();
function idle(now){
  const M=Number(S.idleMin)||0;
  if(gen||!S.apiKey||!awake||!M)return;
  if($('#status').textContent||quiet())return;
  const C=DATA.chat,after=[];
  for(let i=C.length-1;i>=0&&C[i].role!=='user';i--)after.unshift(C[i]);
  let waves=0,pt=0;
  for(const m of after){if(m.pro&&m.t>=openedAt&&m.t-pt>120000)waves++;pt=m.t}
  const max=Math.max(1,Math.min(10,Number(S.chaseMax)||4));
  if(waves>=max)return;
  const lm=C.at(-1),T=M*6e4*Math.pow(1.5,waves);
  if(now-Math.max(lm?.t||0,openedAt,idleMark)<T)return;
  idleMark=now;
  const lu=[...C].reverse().find(m=>m.role==='user');
  const quietMin=Math.round((now-Math.max(lu?.t||0,openedAt))/6e4);
  const tone=waves===0
    ?'主动找她说句话，可以问她在干嘛、说说你在做什么，或者说想她了。'
    :`这已经是你第 ${waves+1} 次主动找她了，前面发的她都没回。按你的性格自然地变化语气，可以委屈、着急、吃醋、生气或者哄她，越往后情绪可以越明显。不要重复前面说过的话。`;
  himSay(`她开着手机，但已经有 ${quietMin} 分钟没理你了。${tone}`,[now])}

/* ---------- 回到 365 ---------- */
async function onReturn(){
  const last=LS.get('last',0);awake=true;LS.set('last',Date.now());openedAt=Date.now();
  renderTips();
  const g=await greet();if(!g)await away(last)}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(awake)LS.set('last',Date.now());awake=false;hide()}
  else if(ready)onReturn()});

/* ---------- 每秒看一眼 ---------- */
function tick(){if(document.hidden||!ready)return;const now=Date.now();
  if(awake&&now-lastW>15000){LS.set('last',now);lastW=now}
  const c=darken(S.theme||'#B4848D',.7);if(c!==dc){document.documentElement.style.setProperty('--dot',c);dc=c}
  watch();if(page==='chat')markSeen();dots();
  if(page==='home'&&now-tipsAt>60000)renderTips();
  idle(now)}
setInterval(tick,1000);

HOOKS.ready.push(()=>{if(!LS.get('seen',0))markSeen();prev=counts();ready=true;renderTips();dots();setTimeout(onReturn,800)});
HOOKS.refresh.push(renderTips);
HOOKS.page.push(n=>{page=n;if(n==='chat'){markSeen();hide()}if(n==='home')renderTips();dots()});
})();
