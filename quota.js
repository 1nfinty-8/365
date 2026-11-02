/* ===== 365 · quota.js · 额度 ===== */
(()=>{
const CK='365-qcount',QC='365-qcache';
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const host=u=>{try{return new URL(u).host}catch(e){return String(u||'')}};
const tail=k=>String(k||'').slice(-6);

/* ---------- 记下每个 Key 今天用了几次 ---------- */
const _f=window.fetch.bind(window);
window.fetch=function(u,o){
  try{const s=String(u&&u.url||u);
    if(o&&String(o.method||'').toUpperCase()==='POST'&&/generateContent|chat\/completions/.test(s)){
      const url=new URL(s),h=o.headers||{};
      const k=url.searchParams.get('key')||String(h.Authorization||h.authorization||'').replace(/^Bearer\s+/,'');
      const id=url.host+'|'+tail(k),d=isoDate(today());
      const c=LS(CK,{});const C=c.d===d?c:{d,n:{}};C.n[id]=(C.n[id]||0)+1;localStorage.setItem(CK,JSON.stringify(C))}}catch(e){}
  return _f(u,o)};
const todayN=id=>{const c=LS(CK,{});return c.d===isoDate(today())?(c.n?.[id]||0):0};

document.head.insertAdjacentHTML('beforeend',`<style>
.qt-it{display:block;width:100%;text-align:left;padding:12px 0;border-top:1px solid var(--line)}
.qt-it:first-child{border-top:0}
.qt-h{display:flex;align-items:baseline;gap:8px}
.qt-h b{font-weight:500;font-size:15px;letter-spacing:2px;flex:none}
.qt-h>small{flex:1;min-width:0;font-size:11px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qt-h em{font-family:var(--num);font-style:italic;font-weight:300;font-size:30px;line-height:1;color:var(--accent-t);flex:none}
.qt-h em small{font-size:14px}
.qt-h em.low,.qt-s.low{color:#C0505F}
.qt-bar{height:6px;border-radius:6px;background:rgba(46,26,31,.08);margin-top:8px;overflow:hidden}
.qt-bar i{display:block;height:100%;border-radius:6px;background:var(--accent);transition:width .6s}
.qt-bar i.low{background:#C0505F}
.qt-s{font-size:12px;color:var(--sub);margin-top:6px;letter-spacing:.5px;word-break:break-all}
</style>`);
$('#exportBtn').closest('.sec').insertAdjacentHTML('beforebegin',`
<div class="sec glass" id="qtSec">
  <h3>额度<em>quota</em></h3>
  <div id="qtList"></div>
  <div class="btns"><button class="pill" id="qtRef">刷新</button><button class="pill ghost" id="qtAddBtn">＋ 添加一个 API</button></div>
  <p class="hint" id="qtTime"></p>
  <p class="hint">点一条可以设置总额。中转站一般能自动算出百分比；DeepSeek 只能查余额，要自己填总额；Gemini 官方查不了余额，只能记今天用了几次。</p>
</div>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="qtAdd"><div class="mbox">
  <h3>添加一个 API</h3>
  <label class="f"><span>名字</span><input id="qtN" placeholder="比如：中转站 A"></label>
  <label class="f"><span>地址</span><input id="qtU" placeholder="https://xxx.com/v1" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <label class="f"><span>Key</span><input id="qtK" placeholder="sk-..." autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <p class="hint" style="color:var(--sys-sub)">只用来查额度，不会拿去聊天</p>
  <div class="mbtns"><button class="pill ghost" data-close="qtAdd">取消</button><button class="pill" id="qtSave">添加</button></div>
</div></div>`);

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

let busy=false,cache=LS(QC,{});
const money=(v,c)=>v==null?'—':c+(v>=100?v.toFixed(0):v.toFixed(2));
function leftOf(e,r){if(!r||r.kind==='none'||r.err)return null;if(r.left!=null)return r.left;
  const tot=(S.quotaTot||{})[e.id];return tot&&r.used!=null?Math.max(0,tot-r.used):null}
function pctOf(e,r){const tot=(S.quotaTot||{})[e.id];
  if(r?.kind==='none')return tot?Math.max(0,100-todayN(e.id)/tot*100):null;
  const left=leftOf(e,r),total=r?.total||tot;
  if(left==null||!total)return null;return Math.max(0,Math.min(100,left/total*100))}
function render(){
  const L=entries(),el=$('#qtList');
  if(!L.length){el.innerHTML='<p class="hint">还没有填 API Key</p>';return}
  el.innerHTML=L.map(e=>{const r=cache[e.id],p=pctOf(e,r),n=todayN(e.id),tot=(S.quotaTot||{})[e.id];
    let s;
    if(r?.kind==='none')s=`Google 官方查不了余额 · 今天用了 ${n} 次${tot?' / 每天 '+tot+' 次':''}`;
    else if(r?.err)s='查不到：'+esc(r.err);
    else if(r)s=`剩 ${money(leftOf(e,r),r.cur)}${r.total||tot?' / 共 '+money(r.total||tot,r.cur):''}${r.used!=null?' · 已用 '+money(r.used,r.cur):''} · 今天 ${n} 次`;
    else s=busy?'正在查…':'还没查';
    const low=p!=null&&p<15?' low':'';
    return `<button class="qt-it" data-q="${esc(e.id)}"><div class="qt-h"><b>${esc(e.name)}</b><small>${esc(host(e.base))}</small><em class="${low}">${p==null?'—':Math.round(p)}<small>%</small></em></div><div class="qt-bar"><i class="${low}" style="width:${p==null?0:p}%"></i></div><div class="qt-s${low}">${s}</div></button>`}).join('');
  $('#qtTime').textContent=busy?'正在查…':cache._t?'更新于 '+fmtDate(cache._t):''}
async function refresh(){
  if(busy)return;busy=true;render();
  await Promise.all(entries().map(async e=>{
    try{cache[e.id]=await query(e)}
    catch(x){cache[e.id]={err:x instanceof TypeError?'连不上，或者这家不让网页查询':x.message}}}));
  cache._t=Date.now();localStorage.setItem(QC,JSON.stringify(cache));busy=false;render()}

$('#qtRef').onclick=refresh;
$('#qtList').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;
  const en=entries().find(x=>x.id===b.dataset.q);if(!en)return;
  const r=cache[en.id],acts=[];
  if(en.g||!r?.total)acts.push([en.g?'设置每天能用几次':'设置总额（用来算百分比）',()=>{
    const v=prompt(en.g?'这个 Key 每天最多能用几次？':'一共充了多少？（只填数字）',(S.quotaTot||{})[en.id]||'');if(v==null)return;
    S.quotaTot=S.quotaTot||{};const n=parseFloat(v);if(n>0)S.quotaTot[en.id]=n;else delete S.quotaTot[en.id];saveSettings();render()}]);
  if(en.cid)acts.push(['删除这个',()=>{S.quotaList=(S.quotaList||[]).filter(x=>x.id!==en.cid);saveSettings();render()}]);
  if(!acts.length)return toast('这个的百分比是自动算的');
  sheet(acts)};
$('#qtAddBtn').onclick=()=>{$('#qtN').value='';$('#qtU').value='';$('#qtK').value='';openModal('qtAdd')};
$('#qtSave').onclick=()=>{const name=$('#qtN').value.trim(),base=$('#qtU').value.trim(),key=$('#qtK').value.trim();
  if(!base||!key)return toast('地址和 Key 都要填');
  S.quotaList=[...(S.quotaList||[]),{id:uid(),name:name||'其他',base,key}];saveSettings();closeModal('qtAdd');refresh()};

const stale=m=>!cache._t||Date.now()-cache._t>m*60000;
HOOKS.ready.push(()=>{render();if(stale(10))refresh()});
HOOKS.page.push(n=>{if(n==='me'){render();if(stale(5))refresh()}});
})();
/* ---------- 「我的」：连接 和 他的消息 换位置 ---------- */
HOOKS.ready.push(()=>{
  const f=t=>[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith(t));
  const a=f('连接'),b=f('他的消息');if(!a||!b)return;
  const m=document.createComment('');a.replaceWith(m);b.replaceWith(a);m.replaceWith(b)});

