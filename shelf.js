/* ===== 365 · shelf.js · 图书馆：在读 + 全部书（左边一道书脊） ===== */
(()=>{
if(!$('#lbList'))return;
const sd=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const PAL=['color-mix(in srgb,var(--accent) 70%,#fff)','var(--accent-t)','color-mix(in srgb,var(--accent) 35%,#fff)','#A3989D','#776B70','#D3CBCF','rgba(255,255,255,.95)'];
const col=s=>PAL[sd(s.id)%PAL.length];
const off=()=>Array.isArray(S.shelfOff)?S.shelfOff:(S.shelfOff=[]);
const len=s=>(s.parts||[]).reduce((n,p)=>n+String(p.text||'').length,0);
const fmtN=n=>n>=10000?(n/10000).toFixed(1)+' 万':n;
const pos=id=>{try{const v=JSON.parse(localStorage.getItem('365-lib')||'{}')[id];return v&&typeof v==='object'?v:null}catch(e){return null}};
function pct(s){const n=s.parts.length,p=pos(s.id);if(!n||!p)return 0;const c=Math.min(p.c,n-1),r=p.r||0;return c===n-1&&r>.95?100:Math.min(100,Math.round((c+r)/n*100))}
let raf=0;

document.head.insertAdjacentHTML('beforeend',`<style>
#lbList{display:none!important}
.ih-h{display:flex;align-items:baseline;justify-content:space-between;margin:6px 6px 12px}
.ih-h b{font-family:var(--en);font-style:italic;font-weight:400;font-size:32px}
.ih-h span{font-size:12px;color:var(--sub);letter-spacing:2px}
.ih-h button{font-size:12.5px;color:var(--sub);letter-spacing:2px;margin-left:12px;border-bottom:1px solid currentColor}
.ih-it{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px 16px;margin-bottom:10px}
.ih-sp{width:8px;height:40px;border-radius:2px;flex:none;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)}
.ih-x{flex:1;min-width:0}
.ih-x b{display:block;font-weight:500;font-size:15.5px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ih-x small{display:block;font-size:12px;color:var(--sub);margin-top:2px}
.ih-bar{height:2px;background:rgba(127,127,127,.15);border-radius:2px;margin-top:8px;overflow:hidden}
.ih-bar i{display:block;height:100%;background:var(--accent)}
.ih-it em{font-family:var(--num);font-style:italic;font-size:20px;color:var(--accent-t)}
.ih-more{display:block;margin:0 auto 16px;font-size:12px;color:var(--sub);letter-spacing:1px}
.ih-gap{height:14px}
</style>`);

$('#lbImpBtn').insertAdjacentHTML('beforebegin','<div id="shHost"></div>');

const row=(s,cont)=>{const p=pct(s);
  return `<button class="ih-it glass" data-ih="${s.id}"${cont?' data-c="1"':''}><i class="ih-sp" style="background:${col(s)}"></i><div class="ih-x"><b>${esc(s.title)}</b><small>${cont?`${s.author?esc(s.author)+' · ':''}${fmtDate(s.readAt)} 读过`:`${s.author?esc(s.author)+' · ':''}${s.parts.length} ${s.src?'章':'段'} · 约 ${fmtN(len(s))} 字`}</small><div class="ih-bar"><i style="width:${p}%"></i></div></div><em>${p}%</em></button>`};
function render(){const h=$('#shHost');if(!h)return;const F=off();
  const R=DATA.library.filter(s=>s.readAt&&s.parts.length&&pct(s)<100&&!F.includes(s.id)).sort((a,b)=>b.readAt-a.readAt).slice(0,5);
  const A=DATA.library.filter(s=>!F.includes(s.id)).sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  h.innerHTML=(R.length?`<div class="ih-h"><b>In Hand</b><span>在读 · ${R.length}</span></div>${R.map(s=>row(s,1)).join('')}<div class="ih-gap"></div>`:'')
    +`<div class="ih-h"><b>Books</b><span>全部 · ${A.length}<button id="shEd">整理</button></span></div>`
    +(A.length?A.map(s=>row(s)).join(''):'<div class="empty">书架还空着<br>点「＋ 新故事」或者导入一本书</div>')
    +(F.length?`<button class="ih-more" id="shOff">另有 ${F.length} 本收起来了 · 点这里放回</button>`:'')}
const later=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(render)};

function openBook(id,cont){const b=document.createElement('button');b.dataset.lb=id;$('#lbList').appendChild(b);b.click();b.remove();
  if(cont)requestAnimationFrame(()=>$('#bkGo')?.click())}
$('#shHost').onclick=e=>{
  if(e.target.closest('#shEd')){const A=DATA.library.filter(s=>!off().includes(s.id));if(!A.length)return;
    return sheet(A.map(s=>[`收起来：${s.title}`,()=>{off().push(s.id);saveSettings();render();toast('收起来了，不会删')}]))}
  if(e.target.closest('#shOff')){const F=off(),L=DATA.library.filter(s=>F.includes(s.id));
    const put=ids=>{S.shelfOff=F.filter(x=>!ids.includes(x));saveSettings();render()};
    return sheet([...(L.length>1?[['全部放回去',()=>put(L.map(s=>s.id))]]:[]),...L.map(s=>[`放回去：${s.title}`,()=>put([s.id])])])}
  const b=e.target.closest('[data-ih]');if(b)openBook(b.dataset.ih,!!b.dataset.c)};

new MutationObserver(later).observe($('#lbList'),{childList:true});
HOOKS.ready.push(later);
HOOKS.page.push(n=>{if(n==='library')later()});
})();
