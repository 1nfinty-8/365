/* ===== 365 · quota.js · 额度 ===== */
(()=>{
const CK='365-qcnt2',QC='365-qcache',QH='365-qhist';
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const host=u=>{try{return new URL(u).host}catch(e){return String(u||'')}};
const tail=k=>String(k||'').slice(-6);
const D0=()=>isoDate(today());
const lastDays=n=>{const o=[];for(let i=n-1;i>=0;i--){const d=today();d.setDate(d.getDate()-i);o.push(isoDate(d))}return o};
const warn=()=>S.quotaWarn||10;

/* ---------- 记下每个 Key 每天用了几次 ---------- */
let CNT=LS(CK,null);
if(!CNT){CNT={};const o=LS('365-qcount',{});if(o.d&&o.n)CNT[o.d]=o.n}
const saveCnt=()=>{Object.keys(CNT).sort().slice(0,-15).forEach(k=>delete CNT[k]);localStorage.setItem(CK,JSON.stringify(CNT))};
const _f=window.fetch.bind(window);
window.fetch=function(u,o){
  try{const s=String(u&&u.url||u);
    if(o&&String(o.method||'').toUpperCase()==='POST'&&/generateContent|chat\/completions/.test(s)){
      const url=new URL(s),h=o.headers||{};
      const k=url.searchParams.get('key')||String(h.Authorization||h.authorization||'').replace(/^Bearer\s+/,'');
      const id=url.host+'|'+tail(k),d=D0();(CNT[d]=CNT[d]||{})[id]=(CNT[d][id]||0)+1;saveCnt()}}catch(e){}
  return _f(u,o)};
const cntOn=(id,d)=>CNT[d]?.[id]||0;
const todayN=id=>cntOn(id,D0());

document.head.insertAdjacentHTML('beforeend',`<style>
.qt-h{display:flex;align-items:baseline;gap:8px}
.qt-h b{font-weight:500;font-size:16px;letter-spacing:2px;flex:none}
.qt-h small{flex:1;min-width:0;font-size:11px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qt-bar{height:6px;border-radius:6px;background:rgba(46,26,31,.08);margin-top:8px;overflow:hidden}
.qt-bar i{display:block;height:100%;border-radius:6px;background:var(--accent);transition:width .6s}
.qt-bar i.low{background:#C0505F}
.qt-s{font-size:12px;color:var(--sub);margin-top:8px;letter-spacing:.5px;word-break:break-all}
.qt-s.low,.qp-big.low{color:#C0505F}
.qt-mi{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:14px;letter-spacing:1px}
.qt-mi .qt-bar{flex:1;margin:0}
.qt-mi em{font-family:var(--num);font-style:italic;min-width:42px;text-align:right;color:var(--accent-t)}
.qt-mi em.low{color:#C0505F}
.qp-c{display:block;width:100%;text-align:left;padding:18px 18px 14px;margin-bottom:14px}
.qp-big{font-family:var(--num);font-style:italic;font-weight:300;font-size:56px;line-height:1.05;margin-top:6px;color:var(--accent-t)}
.qp-big small{font-size:20px;margin-left:2px}
.qp-eta{font-size:13px;margin-top:6px;letter-spacing:1px}
.qp-eta b{font-family:var(--num);font-style:italic;font-weight:400;font-size:18px;color:var(--accent-t)}
.qp-ct{font-size:11.5px;color:var(--sub);letter-spacing:2px;margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}
.qp-ch{display:flex;align-items:flex-end;gap:8px;height:96px;margin-top:8px}
.qp-ch div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.qp-ch i{width:100%;max-width:24px;border-radius:6px 6px 2px 2px;background:var(--accent);opacity:.45}
.qp-ch div.on i{opacity:1}
.qp-ch b{font-size:9.5px;font-weight:400;color:var(--sub);margin-bottom:3px;font-family:var(--num);white-space:nowrap}
.qp-ch small{font-size:11px;color:var(--sub);margin-top:5px;font-family:var(--num);font-style:italic}
.qp-foot{display:flex;gap:10px;justify-content:center;margin:6px 0 10px}
#qtTips{display:flex;flex-direction:column;align-items:center;gap:1px;margin-top:1px}
#qtTips:empty{display:none}
#qtTips button{font-size:12.5px;color:#C0505F;letter-spacing:1.5px;padding:2px 10px}
</style>`);

/* ---------- 「我的」里的入口 ---------- */
$('#exportBtn').closest('.sec').insertAdjacentHTML('beforebegin',`
<div class="sec glass" id="qtSec">
  <h3>额度<em>quota</em></h3>
  <div id="qtMini"></div>
  <div class="btns"><button class="pill" data-go="quota">打开额度页</button></div>
</div>`);
$('#qtSec').addEventListener('click',e=>{if(!e.target.closest('h3'))return;e.preventDefault();e.stopPropagation();go('quota')},true);

/* ---------- 额度页 ---------- */
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-quota"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>额度</h2><em>quota</em><span class="sp"></span><button class="pill ghost" id="qpRef">刷新</button></div>
  <div class="sub-line" id="qpTime"></div>
  <div id="qpList"></div>
  <div class="qp-foot"><button class="pill" id="qpAdd">＋ 添加一个 API</button><button class="pill ghost" id="qpWarn"></button></div>
  <p class="hint">点卡片可以设置总额。中转站一般能自动算出百分比；DeepSeek 只能查余额，要自己填总额；Gemini 官方查不了余额，只能记每天用了几次。柱状图和「还能用多久」是从开始记录那天算起的。</p>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="qtAdd"><div class="mbox">
  <h3>添加一个 API</h3>
  <label class="f"><span>名字</span><input id="qtN" placeholder="比如：中转站 A"></label>
  <label class="f"><span>地址</span><input id="qtU" placeholder="https://xxx.com/v1" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <label class="f"><span>Key</span><input id="qtK" placeholder="sk-..." autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <p class="hint" style="color:var(--sys-sub)">只用来查额度，不会拿去聊天</p>
  <div class="mbtns"><button class="pill ghost" data-close="qtAdd">取消</button><button class="pill" id="qtSave">添加</button></div>
</div></div>`);
($('#calTips')||$('#hmTips')||$('#since'))?.insertAdjacentHTML('afterend','<div id="qtTips"></div>');

/* ---------- 有哪些 API ---------- */
function entries(){const L=[];
  const add=(name,p,k,u,cid)=>{if(!k)return;
    const g=p==='gemini'||/googleapis/.test(u||'');
    const base=g?'https://generativelanguage.googleapis.com':String(u||'').trim().replace(/\/+$/,'');
    const id=host(base)+'|'+tail(k);if(L.some(x=>x.id===id))return;
    L.push({id,name,g,k,base,cid})};
  add('聊天',S.provider,S.apiKey,S.baseUrl);
  if(S.sxProvider)add('秘密',S.sxProvider,S.sxKey||S.apiKey,S.sxBase||S.baseUrl);
  (S.quotaList||[]).forEach(q=>add(q.name||'其他','',q.key,q.base,q.id));
  return L}

/* ---------- 查额度 ---------- */
async function query(e){
  if(e.g)return {kind:'none'};
  const H={Authorization:'Bearer '+e.k};
  if(/deepseek\.com/.test(e.base)){
    const r=await fetch(e.base.replace(/\/v1$/,'')+'/user/balance',{headers:H});const j=await r.json();
    if(!r.ok)throw new Error(j.error?.message||('查询失败 '+r.status));
    const b=(j.balance_infos||[])[0]||{};return {left:+b.total_balance||0,cur:b.currency==='USD'?'$':'¥'}}
  const r1=await fetch(e.base+'/dashboard/billing/subscription',{headers:H});const s=await r1.json();
  if(!r1.ok)throw new Error(s.error?.message||('查询失败 '+r1.status));
  const end=new Date(Date.now()+864e5);
  const r2=await fetch(`${e.base}/dashboard/billing/usage?start_date=2023-01-01&end_date=${isoDate(end)}`,{headers:H});const u=await r2.json();
  const used=r2.ok?(+u.total_usage||0)/100:null,hard=+s.hard_limit_usd||0;
  if(!hard||hard>=1e6)return {left:null,used,cur:'$'};
  return {left:Math.max(0,hard-(used||0)),total:hard,used,cur:'$'}}

/* ---------- 每天记一次，用来画柱状图、算还能用多久 ---------- */
let HIST=LS(QH,{});
function metric(r){if(!r||r.err||r.kind==='none')return null;if(r.used!=null)return r.used;if(r.left!=null)return -r.left;return null}
function record(id,r){const v=metric(r);if(v==null)return;(HIST[id]=HIST[id]||{})[D0()]=v;
  Object.keys(HIST[id]).sort().slice(0,-30).forEach(k=>delete HIST[id][k])}
function spend(id,d){const h=HIST[id];if(!h||h[d]==null)return null;
  const prev=Object.keys(h).filter(k=>k<d).sort().at(-1);if(!prev)return null;return Math.max(0,h[d]-h[prev])}
function rate(id){const h=HIST[id];if(!h)return null;const lim=lastDays(8)[0];
  const ks=Object.keys(h).filter(k=>k>=lim).sort();if(ks.length<2)return null;
  const a=ks[0],b=ks.at(-1),dd=daysBetween(parseDate(a),parseDate(b));if(dd<1)return null;
  return Math.max(0,(h[b]-h[a])/dd)}

let busy=false,cache=LS(QC,{});
const money=(v,c)=>v==null?'—':c+(v>=100?v.toFixed(0):v.toFixed(2));
function leftOf(e,r){if(!r||r.kind==='none'||r.err)return null;if(r.left!=null)return r.left;
  const tot=(S.quotaTot||{})[e.id];return tot&&r.used!=null?Math.max(0,tot-r.used):null}
function pctOf(e,r){const tot=(S.quotaTot||{})[e.id];
  if(r?.kind==='none')return tot?Math.max(0,100-todayN(e.id)/tot*100):null;
  const left=leftOf(e,r),total=r?.total||tot;
  if(left==null||!total)return null;return Math.max(0,Math.min(100,left/total*100))}
function daysLeft(e,r){const L=leftOf(e,r),rt=rate(e.id);if(L==null||rt==null)return null;return rt<=0?Infinity:Math.floor(L/rt)}

/* ---------- 画出来 ---------- */
function card(e){
  const r=cache[e.id],p=pctOf(e,r),n=todayN(e.id),tot=(S.quotaTot||{})[e.id],low=p!=null&&p<warn()?' low':'',cur=r?.cur||'$';
  let s;
  if(r?.kind==='none')s=`Google 官方查不了余额 · 今天用了 ${n} 次${tot?' / 每天 '+tot+' 次':''}`;
  else if(r?.err)s='查不到：'+esc(r.err);
  else if(r){const TT=r.total||tot;s=`剩 ${money(leftOf(e,r),cur)}${TT?' / 共 '+money(TT,cur):''}${r.used!=null?' · 已用 '+money(r.used,cur):''} · 今天 ${n} 次`}
  else s=busy?'正在查…':'还没查';
  let eta='';
  if(e.g)eta=tot?`每天 0 点重置 · 今天还能用 <b>${Math.max(0,tot-n)}</b> 次`:'点这张卡片，填每天能用几次';
  else if(leftOf(e,r)!=null){const d=daysLeft(e,r);
    eta=d==null?'多用两天，就能算出还能用多久':d===Infinity?'最近几天几乎没花钱':`按最近 7 天的速度，大约还能用 <b>${d}</b> 天`}
  else if(r&&!r.err)eta='点这张卡片设置总额，就能算出百分比';
  const DS=lastDays(7),V=DS.map(d=>e.g?cntOn(e.id,d):spend(e.id,d)),mx=Math.max(0,...V.filter(v=>v!=null))||1;
  const fv=v=>v==null?'':e.g?v:(v<10?v.toFixed(2):v.toFixed(1));
  return `<button class="qp-c glass" data-q="${esc(e.id)}">
    <div class="qt-h"><b>${esc(e.name)}</b><small>${esc(host(e.base))}</small></div>
    <div class="qp-big${low}">${p==null?'—':Math.round(p)}<small>%</small></div>
    <div class="qt-bar"><i class="${low}" style="width:${p==null?0:p}%"></i></div>
    <div class="qt-s${low}">${s}</div>${eta?`<div class="qp-eta">${eta}</div>`:''}
    <div class="qp-ct">${e.g?'最近 7 天 · 每天用了几次':'最近 7 天 · 每天花了多少'}</div>
    <div class="qp-ch">${DS.map((d,i)=>`<div class="${d===D0()?'on':''}"><b>${fv(V[i])}</b><i style="height:${V[i]==null?0:Math.max(3,Math.round(V[i]/mx*60))}px"></i><small>${+d.slice(8)}</small></div>`).join('')}</div>
  </button>`}
function renderMini(){const el=$('#qtMini');if(!el)return;const L=entries();
  el.innerHTML=L.length?L.map(e=>{const p=pctOf(e,cache[e.id]),low=p!=null&&p<warn()?' low':'';
    return `<div class="qt-mi"><span>${esc(e.name)}</span><div class="qt-bar"><i class="${low}" style="width:${p==null?0:p}%"></i></div><em class="${low}">${p==null?'—':Math.round(p)+'%'}</em></div>`}).join('')
    :'<p class="hint">还没有填 API Key</p>'}
function renderPage(){const L=entries();
  $('#qpList').innerHTML=L.length?L.map(card).join(''):'<div class="empty">还没有填 API Key</div>';
  $('#qpTime').textContent=busy?'正在查…':cache._t?'更新于 '+fmtDate(cache._t):'';
  $('#qpRef').textContent=busy?'查询中…':'刷新';
  $('#qpWarn').textContent=`提醒线 ${warn()}%`}
function renderTips(){const el=$('#qtTips');if(!el)return;
  el.innerHTML=entries().map(e=>[e,pctOf(e,cache[e.id])]).filter(([e,p])=>p!=null&&p<warn())
    .map(([e,p])=>`<button data-go="quota">${esc(e.name)}的额度只剩 ${Math.round(p)}% 了</button>`).join('')}
function renderAll(){renderMini();renderPage();renderTips()}

async function refresh(){
  if(busy)return;busy=true;renderAll();
  await Promise.all(entries().map(async e=>{
    try{cache[e.id]=await query(e);record(e.id,cache[e.id])}
    catch(x){cache[e.id]={err:x instanceof TypeError?'连不上，或者这家不让网页查询':x.message}}}));
  cache._t=Date.now();localStorage.setItem(QC,JSON.stringify(cache));localStorage.setItem(QH,JSON.stringify(HIST));
  busy=false;renderAll()}

$('#qpRef').onclick=refresh;
$('#qpWarn').onclick=()=>{const v=prompt('额度低于百分之几时提醒你？',warn());if(v==null)return;
  const n=parseFloat(v);if(n>0&&n<100){S.quotaWarn=n;saveSettings();renderAll()}};
$('#qpList').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;
  const en=entries().find(x=>x.id===b.dataset.q);if(!en)return;
  const r=cache[en.id],acts=[];
  if(en.g||!r?.total)acts.push([en.g?'设置每天能用几次':'设置总额（用来算百分比）',()=>{
    const v=prompt(en.g?'这个 Key 每天最多能用几次？':'一共充了多少？（只填数字）',(S.quotaTot||{})[en.id]||'');if(v==null)return;
    S.quotaTot=S.quotaTot||{};const n=parseFloat(v);if(n>0)S.quotaTot[en.id]=n;else delete S.quotaTot[en.id];saveSettings();renderAll()}]);
  if(en.cid){
    acts.push(['改名字',()=>{const q=(S.quotaList||[]).find(x=>x.id===en.cid);if(!q)return;const v=prompt('新的名字',q.name);if(!v||!v.trim())return;q.name=v.trim();saveSettings();renderAll()}]);
    acts.push(['删除这个',()=>{if(!confirm('删除这个 API？'))return;S.quotaList=(S.quotaList||[]).filter(x=>x.id!==en.cid);saveSettings();renderAll()}])}
  if(!acts.length)return toast('这个的百分比是自动算的');
  sheet(acts)};
$('#qpAdd').onclick=()=>{$('#qtN').value='';$('#qtU').value='';$('#qtK').value='';openModal('qtAdd')};
$('#qtSave').onclick=()=>{const name=$('#qtN').value.trim(),base=$('#qtU').value.trim(),key=$('#qtK').value.trim();
  if(!base||!key)return toast('地址和 Key 都要填');
  S.quotaList=[...(S.quotaList||[]),{id:uid(),name:name||'其他',base,key}];saveSettings();closeModal('qtAdd');refresh()};

const stale=m=>!cache._t||Date.now()-cache._t>m*60000;
HOOKS.ready.push(()=>{renderAll();if(stale(10))refresh()});
HOOKS.page.push(n=>{
  if(n==='me'||n==='quota'){renderAll();if(stale(5))refresh()}
  if(n==='home')renderTips()});

/* ---------- 「我的」：连接 和 他的消息 换位置 ---------- */
HOOKS.ready.push(()=>{
  const f=t=>[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith(t));
  const a=f('连接'),b=f('他的消息');if(!a||!b)return;
  const m=document.createComment('');a.replaceWith(m);b.replaceWith(a);m.replaceWith(b)});
})();
