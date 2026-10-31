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
/* ===== 中文字体：苹方细体 · 宽字距 ===== */
document.head.insertAdjacentHTML('beforeend',`<style>
body{font-weight:300;letter-spacing:.5px}
b,strong{font-weight:500}
.head h2{font-weight:300;letter-spacing:5px}
.card .cn{font-weight:300;letter-spacing:4px}
.dayl{font-weight:300;letter-spacing:4px}
.quote{letter-spacing:2px}
.sec h3,.an-name,.an-box h3{font-weight:400;letter-spacing:3px}
.chat-top .nm{font-weight:400;letter-spacing:2px}
.pname,.pc b{font-weight:500}
#tabbar button{letter-spacing:1px}
.pill{letter-spacing:1px}
</style>`);
