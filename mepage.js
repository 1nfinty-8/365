/* ===== 365 · mepage.js · 「我的」：连接、他的消息各自一页 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const P=[['连接','conn','api'],['他的消息','msgset','messages']];
const host=u=>{try{return new URL(u).host}catch(e){return ''}};

document.head.insertAdjacentHTML('beforeend',`<style>
#page-me .sec.me-go{cursor:pointer}
#page-me .sec.me-go h3{margin-bottom:0}
#page-me .sec.me-go h3::after{transform:rotate(-45deg)}
#page-me .sec.me-go .hint{margin-top:6px}
.mp-sec>h3{display:none}
</style>`);

/* 卡片上的一行小字 */
function sum(k){
  if(k==='conn')return `${S.provider==='gemini'?'Gemini 官方':(host(S.baseUrl)||'中转站')} · ${S.model||'还没填模型'}${S.webOn&&S.tvKey?' · 联网开着':''}`;
  const h=+S.awayHours||0,a=[S.pushOn?'推送已开启':'推送没开',h?`离开 ${h} 小时后找你`:'离开后不留言'];
  if(S.greet!==false)a.push('早安晚安');
  return a.join(' · ')}
function upd(){for(const[,k]of P){const e=$('#mpS-'+k);if(e)e.textContent=sum(k)}}

/* 把整栏搬到自己的页面里，原地留一张卡片 */
function move(){
  for(const[t,k,em]of P){
    if($('#page-'+k))continue;
    const sec=[...$$('#page-me .sec')].find(s=>!s.classList.contains('me-go')&&(s.querySelector('h3')?.textContent||'').trim().startsWith(t));
    if(!sec)continue;
    $('#tabbar').insertAdjacentHTML('beforebegin',`<section class="page" id="page-${k}"><div class="wrap"><div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>${t}</h2><em>${em}</em></div></div></section>`);
    sec.insertAdjacentHTML('beforebegin',`<div class="sec glass me-go" data-go="${k}"><h3>${t}<em>${em}</em></h3><p class="hint" id="mpS-${k}"></p></div>`);
    sec.classList.remove('fold');sec.classList.add('mp-sec');
    const h=sec.querySelector('h3');if(h)h.onclick=null;
    $(`#page-${k} .wrap`).appendChild(sec)}
  upd()}

HOOKS.ready.push(move);
HOOKS.page.push(n=>{if(n==='me')upd()});
})();
