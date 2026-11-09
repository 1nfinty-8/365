/* ===== 365 · mepage.js · 「我的」每一栏单独一页 + More 的顺序 + 首页小提示轮播 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const KNOWN={'连接':'conn','他的消息':'msgset'};
const host=u=>{try{return new URL(u).host}catch(e){return ''}};
const hs=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(36)};
const SECS={};

document.head.insertAdjacentHTML('beforeend',`<style>
#page-me .sec.me-go{cursor:pointer}
#page-me .sec.me-go h3{margin-bottom:0}
#page-me .sec.me-go h3::after{transform:rotate(-45deg)}
#page-me .sec.me-go .hint{margin-top:6px}
#page-me .sec.me-go .hint:empty{display:none}
#page-me .me-go h3:has(.mp-avs)::after{margin-left:12px}
.mp-avs{margin-left:auto;display:flex;align-items:center}
.mp-avs .av{width:50px;height:50px;font-size:19px;border:2px solid rgba(255,255,255,.85)}
.mp-avs .av+.av{margin-left:-14px}
.mp-sec>h3{display:none}
#lkSec h3{margin-bottom:8px}
.tp-off{display:none!important}
.tp-on{display:block!important;margin-left:auto!important;margin-right:auto!important;animation:fd .6s}
</style>`);

/* ---------- 「我的」：每一栏变成短卡片，点进去是完整设置 ---------- */
function title(h){const c=h.cloneNode(true);c.querySelectorAll('em,.mp-avs').forEach(x=>x.remove());return c.textContent.trim()}
function sum(k,t,sec){
  if(k==='conn')return `${S.provider==='gemini'?'Gemini 官方':(host(S.baseUrl)||'中转站')} · ${S.model||'还没填模型'}${S.webOn&&S.tvKey?' · 联网开着':''}`;
  if(k==='msgset'){const h=+S.awayHours||0,a=[S.pushOn?'推送已开启':'推送没开',h?`离开 ${h} 小时后找你`:'离开后不留言'];if(S.greet!==false)a.push('早安晚安');return a.join(' · ')}
  if(t==='外观')return {auto:'跟随系统',light:'浅色',dark:'深色'}[S.look]||'跟随系统';
  if(t==='数据'){const h=sec?.querySelector('.hint');return h?h.textContent.split('备份文件里')[0].trim():''}
  return ''}
function upd(){for(const k in SECS){const e=$('#mpS-'+k);if(e)e.textContent=sum(k,SECS[k].t,SECS[k].sec)}
  const a=$('#mpAv');if(a)try{a.innerHTML=avatarHTML('him')+avatarHTML('me')}catch(e){}}

function move(){
  $$('#page-me .wrap > .sec').forEach(sec=>{
    if(sec.classList.contains('me-go')||sec.id==='lkSec'||sec.dataset.mpq)return;
    const h=sec.querySelector('h3');if(!h)return;
    const t=title(h);if(!t)return;
    const em=h.querySelector('em')?.textContent||'';
    if(t==='额度'){sec.dataset.mpq=1;sec.style.display='none';
      const b=[...sec.querySelectorAll('button,[data-go]')].find(x=>x.dataset.go||/额度/.test(x.textContent));
      sec.insertAdjacentHTML('beforebegin',`<div class="sec glass me-go" id="mpQuota"${b?.dataset.go?` data-go="${b.dataset.go}"`:''}><h3>额度${em?`<em>${esc(em)}</em>`:''}</h3></div>`);
      if(!b?.dataset.go)$('#mpQuota').onclick=()=>b?b.click():toast('没找到额度页');return}
    const k=KNOWN[t]||('mp'+hs(t+'|'+em));
    if($('#page-'+k))return;
    $('#tabbar').insertAdjacentHTML('beforebegin',`<section class="page" id="page-${k}"><div class="wrap"><div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>${esc(t)}</h2>${em?`<em>${esc(em)}</em>`:''}</div></div></section>`);
    sec.insertAdjacentHTML('beforebegin',`<div class="sec glass me-go" data-go="${k}"><h3>${esc(t)}${em?`<em>${esc(em)}</em>`:''}${t==='我们'?'<span class="mp-avs" id="mpAv"></span>':''}</h3><p class="hint" id="mpS-${k}"></p ></div>`);
    sec.classList.remove('fold');sec.classList.add('mp-sec');h.onclick=null;
    $(`#page-${k} .wrap`).appendChild(sec);SECS[k]={t,sec}});
  const lk=$('#lkSec'),look=Object.values(SECS).find(v=>v.t==='外观');
  if(lk&&look&&lk.nextElementSibling!==look.sec){look.sec.before(lk);const h=lk.querySelector('h3');if(h)h.innerHTML='深色模式<em>dark mode</em>'}
  upd()}

/* ---------- More 里卡片的顺序 ---------- */
const ORDER=['关于他','秘密','月度回顾','游戏'];
function sortMore(){const g=$('#moreGrid');if(!g)return;const cards=[...g.children];
  ORDER.forEach(n=>{const c=cards.find(x=>(x.querySelector('.cn')?.textContent||'').trim()===n);if(c)g.appendChild(c)})}

/* ---------- 首页小提示：一次只显示一条，每 5 秒换一条 ---------- */
let ti=0;
const tips=()=>[...document.querySelectorAll('#hmTips > *, #calTips > *')].filter(x=>x.textContent.trim());
function showTip(){const A=tips();if(!A.length)return;ti%=A.length;
  A.forEach((x,k)=>{x.classList.toggle('tp-off',k!==ti);x.classList.toggle('tp-on',k===ti)})}
setInterval(()=>{if(document.hidden||!$('#page-home')?.classList.contains('active'))return;ti++;showTip()},5000);
['hmTips','calTips'].forEach(id=>{const e=document.getElementById(id);if(e)new MutationObserver(showTip).observe(e,{childList:true})});

sortMore();
HOOKS.ready.push(()=>{move();sortMore();showTip()});
HOOKS.page.push(n=>{if(n==='me')move();if(n==='more')sortMore();if(n==='home')showTip()});
})();
