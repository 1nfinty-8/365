/* ===== 365 · web.js · 联网（Tavily） ===== */
(()=>{
const WK='365-web';
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const mon=()=>isoDate(today()).slice(0,7);
const used=()=>{const c=LS(WK,{});return c.m===mon()?c.n||0:0};
const LIMIT=()=>S.webLimit||1000;
function count(){localStorage.setItem(WK,JSON.stringify({m:mon(),n:used()+1}));renderQ()}

/* ---------- 设置：放进「我的 → 连接」 ---------- */
function mount(){
  if($('#webSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('连接'));
  if(!sec)return;
  const html=`<div id="webSet" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
    <label class="chk"><input type="checkbox" id="webOn"><span>联网：需要的时候让他上网查</span></label>
    <label class="f"><span>Tavily Key</span><input id="webKey" placeholder="tvly-..." autocapitalize="off" autocorrect="off" spellcheck="false"></label>
    <p class="hint" id="webHint"></p></div>`;
  const a=[...sec.querySelectorAll('label.f,.btns,.hint')].at(-1);
  if(a)a.insertAdjacentHTML('afterend',html);else sec.insertAdjacentHTML('beforeend',html);
  $('#webOn').checked=!!S.webOn;$('#webKey').value=S.tvKey||'';
  $('#webOn').onchange=e=>{S.webOn=e.target.checked;saveSettings();hint()};
  $('#webKey').onchange=e=>{S.tvKey=e.target.value.trim();saveSettings();hint();renderQ()};
  hint()}
function hint(){const h=$('#webHint');if(!h)return;
  h.textContent=!S.tvKey?'先去 tavily.com 拿一个 Key 填在这里':S.webOn?`已打开 · 这个月搜了 ${used()} 次`:'Key 填好了，打开上面的开关就能用'}

/* ---------- 搜索 ---------- */
async function search(q){
  const r=await fetch('https://api.tavily.com/search',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+S.tvKey},
    body:JSON.stringify({query:q,search_depth:'basic',max_results:5,include_answer:true})});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok){const d=j.detail;throw new Error((d&&(d.error||d))||j.error||j.message||('搜索失败 '+r.status))}
  count();
  const L=(j.results||[]).slice(0,5).map((x,i)=>`${i+1}. ${x.title||''}：${String(x.content||'').replace(/\s+/g,' ').slice(0,300)}`).join('\n');
  return (j.answer?'概要：'+j.answer+'\n':'')+L}

/* ---------- 聊天：他自己判断要不要查 ---------- */
const TAG=/[\[【]\s*搜索\s*[:：]\s*([^\]】\n]{1,80})[\]】]/;
const st=t=>{const e=$('#status');if(e)e.textContent=t};
const RULE=()=>`\n\n【联网】你可以上网查真实的信息。只有她问到需要真实、最新信息的事（新闻、天气、电影、演出展览、店铺、价格、某个人或某件事、怎么做某件事等），而你又不确定的时候才查。要查的时候，这一次只输出一行：[搜索:关键词]，不要输出别的字。关键词要具体，带上城市和时间（今天是 ${isoDate(today())}）。平时聊天、撒娇、说心事都不要查，正常回她就行。`;
window.webReply=async(sys,msgs)=>{
  if(!S.webOn||!S.tvKey)return callAI(sys,msgs);
  const t=await callAI(sys+RULE(),msgs);
  const m=t.match(TAG);if(!m)return t;
  const q=m[1].trim();st('正在搜索：'+q);
  let info='';
  try{info=await search(q)}
  catch(e){toast('没搜到：'+(e instanceof TypeError?'连不上 Tavily，检查一下网络和 VPN':e.message))}
  st('正在输入…');
  const out=await callAI(sys+`\n\n【你刚上网查了「${q}」】\n${info||'什么也没查到。'}\n\n用你自己的语气、像平时聊天一样告诉她：挑她最需要知道的说，具体一点（时间、地点、价格这些），不要列网址，不要说“根据搜索结果”。${info?'':'没查到就老实说，不要编。'}`,msgs);
  return out.replace(new RegExp(TAG.source,'g'),'').trim()||out};

/* ---------- 额度页：联网的卡片 ---------- */
function renderQ(){hint();const L=$('#qpList');if(!L)return;
  let c=$('#webQ');if(!S.tvKey){c?.remove();return}
  if(!c){L.insertAdjacentHTML('afterend','<div class="qp-c glass" id="webQ"></div>');c=$('#webQ')}
  const n=used(),p=Math.max(0,100-n/LIMIT()*100),low=p<(S.quotaWarn||10)?' low':'';
  c.innerHTML=`<div class="qt-h"><b>联网</b><small>api.tavily.com</small></div><div class="qp-big${low}">${Math.round(p)}<small>%</small></div><div class="qt-bar"><i class="${low}" style="width:${p}%"></i></div><div class="qt-s${low}">这个月搜了 ${n} 次 / 每月 ${LIMIT()} 次 · 每月重置</div>`}

mount();
HOOKS.ready.push(()=>{mount();renderQ()});
HOOKS.page.push(n=>{if(n==='me'){mount();hint()}if(n==='quota')renderQ()});
})();
