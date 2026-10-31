/* 365 · more.js —— 新功能都写在这里 */
(()=>{
const DAY=864e5;
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
const parse=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
const ymd=d=>`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`;
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const diff=(a,b)=>Math.round((b-a)/DAY);
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ================= 纪念日 ================= */
document.head.insertAdjacentHTML('beforeend',`<style>
.an-hero{text-align:center;margin:-6px 0 14px;font-size:13px;color:var(--sub);letter-spacing:1px}
.an-card{display:flex;align-items:center;gap:12px;padding:16px 18px;margin-bottom:12px;transition:transform .15s}
.an-card:active{transform:scale(.98)}
.an-l{flex:1;min-width:0}
.an-name{font-size:17px;font-weight:500;letter-spacing:1px}
.an-pin{font-size:11px;color:var(--accent);margin-left:6px;font-weight:400}
.an-date{font-family:var(--en);font-style:italic;color:var(--sub);font-size:14px;letter-spacing:1px}
.an-note{font-size:13px;color:#5b4950;margin-top:4px;white-space:pre-wrap;word-break:break-word}
.an-ms{display:inline-block;margin-top:8px;font-size:12px;color:var(--accent);background:rgba(255,255,255,.55);padding:2px 10px;border-radius:99px}
.an-r{text-align:right;flex:none;max-width:45%}
.an-pre,.an-unit{font-size:11px;color:var(--sub)}
.an-num{font-family:var(--num);font-style:italic;font-weight:300;font-size:46px;line-height:1.05;letter-spacing:-1.5px}
.an-card.today .an-num{color:var(--accent)}
#anModal{position:absolute;inset:0;z-index:40;background:rgba(46,26,31,.25);display:none;padding:calc(var(--st) + 10px) 16px 16px;overflow-y:auto}
#anModal.show{display:flex}
.an-box{width:100%;max-width:420px;margin:auto;padding:18px;background:rgba(255,250,251,.95)}
.an-box h3{font-weight:500;font-size:17px;letter-spacing:1px}
.seg{display:flex;gap:4px;background:rgba(46,26,31,.06);border-radius:12px;padding:3px}
.seg button{flex:1;padding:8px 0;border-radius:10px;font-size:13px;color:var(--sub)}
.seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.08)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-anniv"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回"><svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <h2>纪念日</h2><em>anniversary</em><span class="sp"></span>
    <button class="pill" id="anAdd">＋ 新建</button>
  </div>
  <div class="an-hero" id="anHero"></div>
  <div id="anList"></div>
</div></section>
<div id="anModal"><div class="an-box glass">
  <h3 id="anTitle">新的纪念日</h3>
  <label class="f"><span>名字</span><input id="anName" placeholder="比如：陆择的生日"></label>
  <label class="f"><span>日期</span><input type="date" id="anDate"></label>
  <div class="f"><span>怎么算</span><div class="seg" id="anType">
    <button data-t="count">数天数 · 第 N 天</button><button data-t="yearly">每年 · 还有 N 天</button>
  </div></div>
  <label class="f"><span>备注（可以不写）</span><textarea id="anNote" style="min-height:64px"></textarea></label>
  <label class="chk"><input type="checkbox" id="anPin">置顶</label>
  <div class="btns" style="justify-content:flex-end">
    <button class="pill ghost" id="anCancel">取消</button><button class="pill" id="anSave">保存</button>
  </div>
</div></div>`);

let ANNIV=[],editing=null,formType='count';
const saveAn=()=>DB.set('anniv',ANNIV);
EXTRA_KEYS.push('anniv');

const msLabel=x=>x%365===0?`${x/365} 周年`:`第 ${x} 天`;
function info(a){
  const t=today(),d=parse(a.date);let r;
  if(a.type==='yearly'){
    const[y,m,dd]=a.date.split('-').map(Number);
    const mk=yr=>{const x=new Date(yr,m-1,dd);return x.getMonth()===m-1?x:new Date(yr,m,0)};
    let yr=t.getFullYear(),nx=mk(yr);if(nx<t)nx=mk(++yr);
    const left=diff(t,nx),k=yr-y,kt=k>0?` · 第 ${k} 年`:'';
    r=left?{pre:'还有',num:left,unit:'天',badge:`下一次 ${ymd(nx)}${kt}`,next:`「${a.name}」还有 ${left} 天${k>0?`（第 ${k} 年）`:''}`}
          :{pre:'',num:'♡',unit:'就是今天',today:1,badge:`🎉 就是今天${kt}`,next:`今天是「${a.name}」${k>0?`（第 ${k} 年）`:''}`};
    r.sortKey=left;r.line=`every year · ${pad(m)}.${pad(dd)}`;
  }else{
    const n=diff(d,t)+1;
    if(n<=0){const left=1-n;
      r={pre:'还有',num:left,unit:'天',sortKey:left,line:ymd(d),badge:'',next:`「${a.name}」还有 ${left} 天`}}
    else{
      const isMs=n%100===0||n%365===0;
      const nm=Math.min(Math.ceil((n+1)/100)*100,Math.ceil((n+1)/365)*365),ml=nm-n;
      r={pre:'第',num:n,unit:'天',today:isMs,line:'since '+ymd(d),sortKey:isMs?0:ml,
        badge:isMs?`🎉 今天是${msLabel(n)}`:`距离${msLabel(nm)}还有 ${ml} 天 · ${ymd(addDays(t,ml))}`,
        next:isMs?`今天是「${a.name}」的${msLabel(n)}`:`「${a.name}」的${msLabel(nm)}还有 ${ml} 天`}}
  }
  r.near=r.sortKey<=7?r.next:'';
  return r;
}

function render(){
  const list=ANNIV.map(a=>({a,i:info(a)}));
  const soon=[...list].sort((x,y)=>x.i.sortKey-y.i.sortKey)[0];
  $('#anHero').textContent=soon?`✦ 下一个 · ${soon.i.next} ✦`:'';
  list.sort((x,y)=>(y.a.pin?1:0)-(x.a.pin?1:0)||x.i.sortKey-y.i.sortKey);
  $('#anList').innerHTML=list.length?list.map(({a,i})=>`
    <div class="an-card glass${i.today?' today':''}" data-an="${a.id}">
      <div class="an-l">
        <div class="an-name">${esc(a.name)}${a.pin?'<span class="an-pin">置顶</span>':''}</div>
        <div class="an-date">${i.line}</div>
        ${a.note?`<div class="an-note">${esc(a.note)}</div>`:''}
        ${i.badge?`<div class="an-ms">${i.badge}</div>`:''}
      </div>
      <div class="an-r"><div class="an-pre">${i.pre}</div><div class="an-num">${i.num}</div><div class="an-unit">${i.unit}</div></div>
    </div>`).join(''):'<div class="empty">还没有纪念日，点右上角新建一个吧</div>';
}

function setType(t){formType=t;$$('#anType button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
function openForm(a){
  editing=a||null;
  $('#anTitle').textContent=a?'编辑纪念日':'新的纪念日';
  $('#anName').value=a?.name||'';
  $('#anDate').value=a?.date||iso(today());
  $('#anNote').value=a?.note||'';
  $('#anPin').checked=!!a?.pin;
  setType(a?.type||'count');
  $('#anModal').classList.add('show');
}
function closeForm(){$('#anModal').classList.remove('show');document.activeElement?.blur?.()}
$('#anType').onclick=e=>{const b=e.target.closest('button[data-t]');if(b)setType(b.dataset.t)};
$('#anAdd').onclick=()=>openForm();
$('#anCancel').onclick=closeForm;
$('#anModal').onclick=e=>{if(e.target.id==='anModal')closeForm()};
$('#anSave').onclick=async()=>{
  const name=$('#anName').value.trim(),date=$('#anDate').value;
  if(!name)return toast('给这一天起个名字吧');
  if(!date)return toast('选一个日期');
  const v={name,date,type:formType,note:$('#anNote').value.trim(),pin:$('#anPin').checked};
  if(editing)Object.assign(editing,v);else ANNIV.push({id:uid(),...v});
  await saveAn();closeForm();render();toast('记下了 ♡');
};
$('#anList').onclick=e=>{
  const c=e.target.closest('[data-an]');if(!c)return;
  const a=ANNIV.find(x=>x.id===c.dataset.an);if(!a)return;
  sheet([
    ['编辑',()=>openForm(a)],
    [a.pin?'取消置顶':'置顶',async()=>{a.pin=!a.pin;await saveAn();render()}],
    ['删除',async()=>{if(!confirm(`删除「${a.name}」？`))return;ANNIV=ANNIV.filter(x=>x!==a);await saveAn();render()}]
  ]);
};

FEATURES['纪念日']=()=>{render();go('anniv')};
const prevOnPage=window.onPage;
window.onPage=n=>{prevOnPage?.(n);if(n==='anniv')render()};

/* 让陆择知道最近的纪念日 */
const baseChatSystem=window.chatSystem;
if(typeof baseChatSystem==='function'){
  window.chatSystem=function(){
    const s=baseChatSystem.apply(this,arguments);
    const near=ANNIV.map(info).filter(x=>x.near).map(x=>x.near);
    return near.length?s+'\n【最近的纪念日】'+near.join('；')+'。可以自然地提起，不用每句都说。':s;
  };
}

READY.then(async()=>{
  const saved=await DB.get('anniv');
  if(Array.isArray(saved))ANNIV=saved;
  else{ANNIV=[{id:'together',name:'在一起',date:S.startDate||'2026-04-17',type:'count',note:'365 · infinity 的第一天',pin:true}];await saveAn()}
  render();
});
})();
/* ===== 首页卡片字体 + 透明玻璃 ===== */
document.head.insertAdjacentHTML('beforeend',`<style>
#page-home .card .cn{font-weight:300;letter-spacing:4px}
.glass:not(.sheet-box):not(.an-box){
  background:linear-gradient(135deg,rgba(255,255,255,.38) 0%,rgba(255,255,255,.08) 45%,rgba(255,255,255,0) 60%,rgba(255,255,255,.12) 100%),var(--glass);
  -webkit-backdrop-filter:blur(var(--gblur)) saturate(1.5);
  backdrop-filter:blur(var(--gblur)) saturate(1.5);
  border:1px solid rgba(255,255,255,.55);
  box-shadow:inset 1.5px 1.5px 0 rgba(255,255,255,.85),inset -1px -1px 0 rgba(255,255,255,.25),0 6px 20px rgba(60,30,40,.06);
}
</style>`);
LOOK.glassA=0.12;LOOK.glassB=0;LOOK.glassTint='#FFFFFF';
READY.then(()=>{
  const a=$('[data-k="glassA"]');if(a)a.min='0';
  if(!S.clearGlass){S.clearGlass=true;S.glassA=LOOK.glassA;S.glassB=LOOK.glassB;S.glassTint=LOOK.glassTint;
    syncInputs();applyLook();saveSettings()}
});
/* ===== 原生风格提示 + 发送按钮跟随气泡颜色 ===== */
document.head.insertAdjacentHTML('beforeend',`<style>
#toast{background:rgba(255,255,255,.75);color:#000;-webkit-backdrop-filter:blur(30px) saturate(1.8);backdrop-filter:blur(30px) saturate(1.8);border:.5px solid rgba(0,0,0,.06);box-shadow:0 8px 30px rgba(0,0,0,.12);font:500 14px/1.4 -apple-system,'PingFang SC',sans-serif;letter-spacing:0;padding:11px 18px;border-radius:22px}
@media (prefers-color-scheme:dark){#toast{background:rgba(44,44,46,.75);color:#fff;border-color:rgba(255,255,255,.08);box-shadow:0 8px 30px rgba(0,0,0,.35)}}
.send{background:var(--mb);color:var(--mbt);box-shadow:0 0 0 .5px rgba(0,0,0,.08),0 1px 3px rgba(0,0,0,.08)}
</style>`);
/* ================= 小狗日记 ================= */
(()=>{
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const WK='日一二三四五六';
const MOODS=[['🥰','超开心'],['☺️','开心'],['😌','平静'],['🥺','想你'],['🥲','难过'],['🤬','生气'],['😴','好累'],['🤒','不舒服']];
const moodName=e=>(MOODS.find(m=>m[0]===e)||[])[1]||'';

document.head.insertAdjacentHTML('beforeend',`<style>
.dy-sub{font-size:13px;color:var(--sub);margin:-8px 2px 16px;letter-spacing:1px}
.dy-card{padding:16px 16px 10px;margin-bottom:14px}
.dy-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.dy-day{font-family:var(--num);font-style:italic;font-weight:300;font-size:40px;line-height:1;letter-spacing:-1px}
.dy-md{font-family:var(--en);font-style:italic;color:var(--sub);font-size:14px;letter-spacing:1px;line-height:1.2}
.dy-wk{font-size:12px;color:var(--sub)}
.dy-mood{font-size:22px}
.dy-more{width:32px;height:32px;border-radius:50%;color:var(--sub);font-size:16px;letter-spacing:1px}
.dy-text{white-space:pre-wrap;word-break:break-word;font-size:15.5px;line-height:1.75}
.dy-notes{margin-top:10px;display:flex;flex-direction:column;gap:8px}
.dy-note{border-radius:14px;padding:8px 12px;font-size:14.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.dy-note.him{background:var(--hb);color:var(--hbt);border-left:3px solid var(--accent)}
.dy-note.me{background:var(--mb);color:var(--mbt);margin-left:28px}
.dy-nl{font-size:11px;opacity:.65;margin-bottom:2px;letter-spacing:1px}
.dy-reply{font-size:12px;color:var(--sub);margin-top:8px;padding:4px 0}
#dyModal{position:absolute;inset:0;z-index:40;background:rgba(46,26,31,.25);display:none;padding:calc(var(--st) + 10px) 16px 16px;overflow-y:auto}
#dyModal.show{display:flex}
.dy-moods{display:flex;flex-wrap:wrap;gap:6px}
.dy-moods button{width:40px;height:40px;border-radius:12px;font-size:22px;background:rgba(46,26,31,.05)}
.dy-moods button.on{background:#fff;box-shadow:0 0 0 2px var(--accent)}
#dyPend{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
#dyBar{position:absolute;left:0;right:0;bottom:0;padding:8px 10px;display:none;gap:8px;z-index:20;border-radius:20px 20px 0 0}
#dyBar.show{display:flex}
#dyBar input{flex:1;border:0;border-radius:18px;padding:8px 14px;background:rgba(255,255,255,.85);outline:none}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-diary"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回"><svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <h2>小狗日记</h2><em>diary</em><span class="sp"></span>
    <button class="pill" id="dyAdd">＋ 写日记</button>
  </div>
  <div class="dy-sub">小狗今天乖不乖？发生了什么都要告诉主人。</div>
  <div id="dyList"></div>
</div></section>
<div id="dyModal"><div class="an-box glass">
  <h3 id="dyTitle">今天的日记</h3>
  <label class="f"><span>日期</span><input type="date" id="dyDate"></label>
  <div class="f"><span>心情</span><div class="dy-moods" id="dyMoods"></div></div>
  <label class="f"><span>写点什么</span><textarea id="dyText" style="min-height:180px" placeholder="今天……"></textarea></label>
  <div class="crow"><button class="pill ghost" id="dyPhoto">＋ 照片</button></div>
  <div id="dyPend"></div>
  <label class="chk" id="dyAskRow"><input type="checkbox" id="dyAsk" checked>写完让<span class="hisName">陆择</span>来看</label>
  <div class="btns" style="justify-content:flex-end"><button class="pill ghost" id="dyCancel">取消</button><button class="pill" id="dySave">保存</button></div>
</div></div>
<div id="dyBar" class="glass"><input id="dyInput" placeholder="回复…" enterkeyhint="send"><button class="pill" id="dySend">发送</button></div>`);
document.body.insertAdjacentHTML('beforeend','<input type="file" id="dyFile" accept="image/*" multiple hidden>');

let DIARY=[],editing=null,mood='☺️',pend=[],replyId=null;
const save=()=>DB.set('diary',DIARY.map(({thinking,...d})=>d));
EXTRA_KEYS.push('diary');
const find=id=>DIARY.find(d=>d.id===id);

$('#dyMoods').innerHTML=MOODS.map(([e,n])=>`<button data-m="${e}" aria-label="${n}">${e}</button>`).join('');
function setMood(e){mood=e;$$('#dyMoods button').forEach(b=>b.classList.toggle('on',b.dataset.m===e))}
$('#dyMoods').onclick=e=>{const b=e.target.closest('[data-m]');if(b)setMood(b.dataset.m)};
function renderPend(){$('#dyPend').innerHTML=pend.map((d,i)=>`<div class="pthumb" style="background-image:url(${d})"><b data-rm="${i}">×</b></div>`).join('')}

function render(){
  const list=[...DIARY].sort((a,b)=>b.date.localeCompare(a.date)||b.t-a.t);
  $('#dyList').innerHTML=list.length?list.map(d=>{
    const[y,m,dd]=d.date.split('-').map(Number);const wk=WK[new Date(y,m-1,dd).getDay()];
    const imgs=d.images?.length?`<div class="pimgs n${Math.min(d.images.length,3)}">${d.images.map((s,i)=>`<img src="${s}" data-dyv="${d.id}:${i}" alt="">`).join('')}</div>`:'';
    const notes=d.comments.map((c,ci)=>c.author==='him'
      ?`<div class="dy-note him" data-dyc="${d.id}:${ci}"><div class="dy-nl">${esc(S.hisName)}的批注</div>${esc(c.text)}</div>`
      :`<div class="dy-note me" data-dyc="${d.id}:${ci}">${esc(c.text)}</div>`).join('');
    const th=d.thinking?`<div class="dy-note him"><div class="dy-nl">${esc(S.hisName)}</div>正在看你的日记…</div>`:'';
    const hasHim=d.comments.some(c=>c.author==='him');
    return `<article class="dy-card glass">
      <div class="dy-top"><div class="dy-day">${dd}</div><div><div class="dy-md">${y}.${pad(m)}</div><div class="dy-wk">星期${wk}</div></div>
        <span class="sp"></span><span class="dy-mood">${d.mood||''}</span><button class="dy-more" data-dymore="${d.id}">···</button></div>
      ${d.text?`<div class="dy-text">${esc(d.text)}</div>`:''}${imgs}
      ${(notes||th)?`<div class="dy-notes">${notes}${th}</div>`:''}
      ${d.thinking?'':`<button class="dy-reply" data-dyrep="${d.id}">${hasHim?'＋ 回复'+esc(S.hisName):'＋ 请'+esc(S.hisName)+'来看'}</button>`}
    </article>`}).join(''):'<div class="empty">还没有日记，写下今天的第一篇吧</div>';
}

function sys(){return S.persona+'\n\n'+nowLine()+'\n【场景】这是你们的小窝「365」里的「小狗日记」。她在这里写日记，你会在她的日记下面写批注留言。只有你们两个人能看到。'}
function prompt(d){
  const[,m,dd]=d.date.split('-').map(Number);
  let s=`她写了一篇${m}月${dd}日的日记${d.mood?`，心情是${d.mood}${moodName(d.mood)}`:''}：\n「${d.text||'（没写字，只放了照片）'}」`;
  if(d.images?.length)s+=`\n（附了${d.images.length}张照片${S.provider==='gemini'?'，就是给你看的这些':''}）`;
  if(d.comments.length)s+='\n\n日记下面已经有的留言：\n'+d.comments.map(c=>`${c.author==='me'?'她':'你'}：${c.text}`).join('\n')+`\n\n请以${S.hisName}的身份回复她最新的留言。只输出回复内容，口语化，一到三句，不要加引号或名字前缀。`;
  else s+=`\n\n请以${S.hisName}的身份在日记下面写一段批注：认真回应她写的内容，可以夸她、心疼她、逗她或者管她。只输出批注内容，口语化，两到五句，不要加引号或名字前缀。`;
  return s}
async function himNote(d){
  if(d.thinking)return;d.thinking=true;render();
  try{await sleep(800);
    const t=await callAI(sys(),[{role:'user',text:prompt(d),images:d.images?.length?d.images.slice(0,4):undefined}]);
    d.comments.push({author:'him',text:clean(t),t:Date.now()})}
  catch(e){toast(e.message)}
  delete d.thinking;await save();render()}

function openForm(d){
  editing=d||null;
  $('#dyTitle').textContent=d?'编辑日记':'今天的日记';
  $('#dyDate').value=d?.date||iso(new Date());
  $('#dyText').value=d?.text||'';
  pend=d?[...(d.images||[])]:[];renderPend();
  setMood(d?.mood||'☺️');
  $('#dyAskRow').style.display=d?'none':'';$('#dyAsk').checked=true;
  $('#dyModal').classList.add('show');
}
function closeForm(){$('#dyModal').classList.remove('show');document.activeElement?.blur?.()}
$('#dyAdd').onclick=()=>openForm();
$('#dyCancel').onclick=closeForm;
$('#dyPhoto').onclick=()=>$('#dyFile').click();
$('#dyFile').onchange=async e=>{const fs=[...e.target.files].slice(0,9-pend.length);e.target.value='';
  try{for(const f of fs)pend.push(await readImage(f,1280,.82));renderPend()}catch(err){toast(err.message)}};
$('#dyPend').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){pend.splice(+b.dataset.rm,1);renderPend()}};
$('#dySave').onclick=async()=>{
  const text=$('#dyText').value.trim(),date=$('#dyDate').value;
  if(!text&&!pend.length)return toast('写点什么吧，小狗');
  if(!date)return toast('选一个日期');
  if(editing){Object.assign(editing,{date,text,mood,images:pend});await save();closeForm();render();return}
  const d={id:uid(),date,mood,text,images:pend,t:Date.now(),comments:[]};
  DIARY.push(d);await save();closeForm();render();toast('记下了 ♡');
  if($('#dyAsk').checked)himNote(d);
};

$('#dyList').onclick=e=>{const t=e.target;
  const v=t.closest('[data-dyv]');if(v){const[id,i]=v.dataset.dyv.split(':');$('#viewer img').src=find(id).images[+i];$('#viewer').classList.add('show');return}
  const mo=t.closest('[data-dymore]');if(mo){const d=find(mo.dataset.dymore);if(!d)return;
    const acts=[['编辑',()=>openForm(d)]];
    if(!d.thinking)acts.push([`让${S.hisName}重新批注`,async()=>{while(d.comments.length&&d.comments.at(-1).author==='him')d.comments.pop();await save();himNote(d)}]);
    acts.push(['删除这篇日记',async()=>{if(!confirm('删除这篇日记？他的批注也会一起删掉。'))return;DIARY=DIARY.filter(x=>x!==d);await save();render()}]);
    sheet(acts);return}
  const r=t.closest('[data-dyrep]');if(r){const d=find(r.dataset.dyrep);if(!d)return;
    if(d.comments.some(c=>c.author==='him'))openReply(d.id);else himNote(d);return}
  const c=t.closest('[data-dyc]');if(c){const[id,ci]=c.dataset.dyc.split(':');const d=find(id);
    sheet([['复制',()=>navigator.clipboard?.writeText(d.comments[+ci].text).then(()=>toast('已复制'))],
           ['删除这条留言',async()=>{d.comments.splice(+ci,1);await save();render()}]])}
};

function openReply(id){replyId=id;$('#dyInput').placeholder=`回复${S.hisName}…`;$('#dyBar').classList.add('show');$('#dyInput').focus()}
async function sendReply(){
  const v=$('#dyInput').value.trim(),d=find(replyId);if(!v||!d)return;
  $('#dyInput').value='';$('#dyInput').blur();
  d.comments.push({author:'me',text:v,t:Date.now()});await save();render();himNote(d)}
$('#dySend').addEventListener('pointerdown',e=>e.preventDefault());
$('#dySend').onclick=sendReply;
$('#dyInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sendReply()}});
$('#dyInput').addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==$('#dyInput'))$('#dyBar').classList.remove('show')},150));

FEATURES['小狗日记']=()=>{render();go('diary')};
const prevOnPage=window.onPage;
window.onPage=n=>{prevOnPage?.(n);if(n==='diary')render();else $('#dyBar').classList.remove('show')};

/* 让陆择知道最近两天的日记 */
const baseSys=window.chatSystem;
window.chatSystem=function(){
  const s=baseSys.apply(this,arguments);
  const lim=iso(new Date(Date.now()-2*864e5));
  const rec=DIARY.filter(d=>d.date>=lim).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  return rec.length?s+'\n【她最近的日记】'+rec.map(d=>`${d.date.slice(5)} ${d.mood||''}：${(d.text||'（照片）').slice(0,80)}`).join('；')+'。你看过了，可以自然地提起。':s;
};

READY.then(async()=>{const saved=await DB.get('diary');if(Array.isArray(saved))DIARY=saved;render()});
})();


