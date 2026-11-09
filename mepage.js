/* ===== 365 · mepage.js · 「我的」：每一栏都点进去是单独一页 ===== */
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
.mp-sec>h3{display:none}
</style>`);

function title(h){const c=h.cloneNode(true);c.querySelectorAll('em').forEach(x=>x.remove());return c.textContent.trim()}
function sum(k,t,sec){
  if(k==='conn')return `${S.provider==='gemini'?'Gemini 官方':(host(S.baseUrl)||'中转站')} · ${S.model||'还没填模型'}${S.webOn&&S.tvKey?' · 联网开着':''}`;
  if(k==='msgset'){const h=+S.awayHours||0,a=[S.pushOn?'推送已开启':'推送没开',h?`离开 ${h} 小时后找你`:'离开后不留言'];if(S.greet!==false)a.push('早安晚安');return a.join(' · ')}
  if(t==='外观')return {auto:'跟随系统',light:'浅色',dark:'深色'}[S.look]||'跟随系统';
  const h=sec?.querySelector('.hint');return h?h.textContent.trim().slice(0,36):''}
function upd(){for(const k in SECS){const e=$('#mpS-'+k);if(e)e.textContent=sum(k,SECS[k].t,SECS[k].sec)}}

function move(){
  $$('#page-me .wrap > .sec').forEach(sec=>{
    if(sec.classList.contains('me-go'))return;
    const h=sec.querySelector('h3');if(!h)return;
    const t=title(h);if(!t)return;
    const em=h.querySelector('em')?.textContent||'',k=KNOWN[t]||('mp'+hs(t));
    if($('#page-'+k))return;
    $('#tabbar').insertAdjacentHTML('beforebegin',`<section class="page" id="page-${k}"><div class="wrap"><div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>${esc(t)}</h2>${em?`<em>${esc(em)}</em>`:''}</div></div></section>`);
    sec.insertAdjacentHTML('beforebegin',`<div class="sec glass me-go" data-go="${k}"><h3>${esc(t)}${em?`<em>${esc(em)}</em>`:''}</h3><p class="hint" id="mpS-${k}"></p></div>`);
    sec.classList.remove('fold');sec.classList.add('mp-sec');h.onclick=null;
    $(`#page-${k} .wrap`).appendChild(sec);SECS[k]={t,sec}});
  upd()}

HOOKS.ready.push(move);
HOOKS.page.push(n=>{if(n==='me')move()});
})();
