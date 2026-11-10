/* ===== 365 · clean.js · 清理：网页缓存、删掉的功能留下的数据 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const USE={chat:'聊天',memory:'记忆',moments:'朋友圈',diary:'日记',anniv:'纪念日',trips:'他的行程',wish:'心愿单',recap:'聊过的事',library:'图书馆',secret:'秘密',sxs:'秘密的其他剧情',gifts:'礼物',hday:'他的一天',hnote:'他的备忘录',deep:'deeptalk',dmem:'deeptalk 的回忆',wbook:'世界书',
  calls:'来电记录',phone:'他的手机',todo:'todo list',memo:'备忘录',review:'月度回顾',mcand:'待确认的记忆',sxlog:'秘密的记录',marks:'日历上的标记',period:'经期记录',coins:'coins',capsule:'时光胶囊'};
const GONE={wrain:'字雨（已经删了）',screen:'屏幕使用时间（已经删了）',night:'今夜（已经删了）',vprint:'声纹（已经删了）',cards:'小卡片（已经删了）'};
const kb=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const size=v=>{try{return new Blob([JSON.stringify(v)]).size}catch(e){return 0}};

document.head.insertAdjacentHTML('beforeend',`<style>
.cl-row{display:flex;align-items:center;gap:10px;padding:12px 4px;border-bottom:1px solid var(--line)}
.cl-row:last-child{border-bottom:0}
.cl-row b{flex:1;min-width:0;font-weight:400;font-size:15px}
.cl-row b small{display:block;font-size:11.5px;color:var(--sub);margin-top:2px}
.cl-row em{font-style:normal;font-size:12px;color:var(--sub)}
.cl-row .pill{padding:6px 14px;font-size:12.5px}
.cl-tag{font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(127,127,127,.12);color:var(--sub)}
.cl-tag.no{background:var(--accent);color:var(--acct)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-clean"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>清理</h2><em>storage</em></div>
  <div class="sec glass"><h3>网页缓存</h3><p class="hint">只清 365 存在手机里的旧代码。聊天、设置、记忆都不会动，清完会重新打开。</p ><p class="hint" id="clUse"></p >
    <div class="btns"><button class="pill" id="clCache">清掉网页缓存</button></div></div>
  <div class="sec glass"><h3>数据</h3><p class="hint">在用的不能清。「不认识」的拿不准就别动，截图问我。照片和语音另外存，不在这里。</p ><div id="clList"></div></div>
</div></section>`);

function render(){
  navigator.storage?.estimate?.().then(e=>{$('#clUse').textContent=`365 现在一共占了 ${kb(e.usage||0)}`}).catch(()=>{});
  const K=Object.keys(DATA).map(k=>({k,n:size(DATA[k])})).filter(x=>USE[x.k]||x.n>2).sort((a,b)=>b.n-a.n);
  $('#clList').innerHTML=K.map(({k,n})=>{const u=USE[k],g=GONE[k];
    return `<div class="cl-row"><b>${esc(u||g||k)}<small>${esc(k)}</small></b><em>${kb(n)}</em>${u?'<span class="cl-tag">在用</span>':`<span class="cl-tag no">${g?'没用了':'不认识'}</span><button class="pill ghost" data-cl="${esc(k)}">清掉</button>`}</div>`}).join('')}

$('#clList').onclick=async e=>{const b=e.target.closest('[data-cl]');if(!b)return;const k=b.dataset.cl;
  const msg=GONE[k]?`清掉「${GONE[k]}」留下的数据？`:`「${k}」我不认识，可能是还在用的功能。确定清掉吗？清掉就找不回来了。`;
  if(!confirm(msg))return;
  try{DATA[k]=Array.isArray(DATA[k])?[]:{};await saveData(k);toast('清掉了')}catch(x){toast('没清成：'+x.message)}
  render()};
$('#clCache').onclick=async()=>{if(!confirm('清掉网页缓存？聊天和设置都不会动，365 会重新打开。'))return;
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));(await navigator.serviceWorker?.getRegistration())?.update()}catch(e){}
  location.reload()};

function card(){let c=$('#clCard');
  if(!c){$('#page-me .wrap')?.insertAdjacentHTML('beforeend','<div class="sec glass me-go" id="clCard" data-go="clean"><h3>清理<em>storage</em></h3><p class="hint">清网页缓存、删掉的功能留下的数据</p ></div>');c=$('#clCard')}
  const a=$('#wbCard')||$('#page-me .me-go[data-go="msgset"]');if(a&&c&&a.nextElementSibling!==c)a.after(c)}
HOOKS.ready.push(card);
HOOKS.page.push(n=>{if(n==='me')card();if(n==='clean')render()});
})();
