/* ===== 365 · shelf.js · 图书馆：毛玻璃书架 + 在读 ===== */
(()=>{
if(!$('#lbList'))return;
const sd=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const PAL=[['color-mix(in srgb,var(--accent) 50%,rgba(255,255,255,.55))','#2E1A1F'],['color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.7))','#2E1A1F'],['rgba(255,255,255,.75)','#2E1A1F'],['color-mix(in srgb,var(--accent-t) 70%,rgba(255,255,255,.4))','#fff'],['rgba(236,231,233,.85)','#2E1A1F'],['rgba(211,203,207,.85)','#2E1A1F'],['rgba(163,152,157,.85)','#fff'],['rgba(119,107,112,.85)','#fff']];
const off=()=>Array.isArray(S.shelfOff)?S.shelfOff:(S.shelfOff=[]);
const len=s=>(s.parts||[]).reduce((n,p)=>n+String(p.text||'').length,0);
const pos=id=>{try{const v=JSON.parse(localStorage.getItem('365-lib')||'{}')[id];return v&&typeof v==='object'?v:null}catch(e){return null}};
function pct(s){const n=s.parts.length,p=pos(s.id);if(!n||!p)return 0;const c=Math.min(p.c,n-1),r=p.r||0;return c===n-1&&r>.95?100:Math.min(100,Math.round((c+r)/n*100))}
const wOf=s=>Math.round(Math.max(17,Math.min(30,12+Math.log10(len(s)+100)*3)));
const hOf=s=>76+sd(s.id+'h')%34;
const look=s=>{const k=sd(s.id);return k%9===0?['var(--accent-t)','#fff']:PAL[k%PAL.length]};
let edit=false,raf=0;

document.head.insertAdjacentHTML('beforeend',`<style>
#lbList{display:none!important}
.sh-box{padding:18px 14px 8px;margin-bottom:18px;border-radius:24px;color:var(--ink)}
.sh-h{display:flex;align-items:flex-end;padding:0 6px}
.sh-h b{flex:1;font-family:var(--en);font-style:italic;font-weight:400;font-size:38px;line-height:1}
.sh-h button{font-size:12.5px;letter-spacing:2px;color:inherit;padding:3px 1px;border-bottom:1px solid currentColor;margin-left:12px;opacity:.75}
.sh-sub{font-size:11.5px;letter-spacing:3px;color:var(--sub);margin:6px 6px 16px}
.sh-row{display:flex;align-items:flex-end;gap:2px;height:114px;padding:0 8px;border-bottom:1.5px solid rgba(127,127,127,.25);margin-bottom:16px}
.sh-bk{position:relative;flex:none;display:flex;justify-content:center;padding:8px 0 6px;border-radius:2px 2px 0 0;box-shadow:inset -1.5px 0 0 rgba(0,0,0,.1),inset 1px 0 0 rgba(255,255,255,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .25s}
.sh-bk:active{transform:translateY(-8px)}
.sh-bk span{writing-mode:vertical-rl;font-family:var(--ti);font-size:10.5px;letter-spacing:1.5px;line-height:1;max-height:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.sh-bk.sx::before,.sh-bk.sx::after{content:"";position:absolute;left:3px;right:3px;height:1px;background:linear-gradient(90deg,#c9a45c,#f0d79a,#c9a45c)}
.sh-bk.sx::before{top:4px}.sh-bk.sx::after{bottom:3px}
.sh-bk.ed{animation:shW .28s ease-in-out infinite alternate}
@keyframes shW{from{transform:rotate(-1.3deg)}to{transform:rotate(1.3deg)}}
.sh-empty{text-align:center;color:var(--sub);font-size:13px;letter-spacing:2px;padding:40px 0}
.sh-tip{text-align:center;font-size:12px;color:var(--sub);margin:-6px 0 8px;letter-spacing:1px}
.ih-h{display:flex;align-items:baseline;justify-content:space-between;margin:6px 6px 12px}
.ih-h b{font-family:var(--en);font-style:italic;font-weight:400;font-size:32px}
.ih-h span{font-size:12px;color:var(--sub);letter-spacing:2px}
.ih-it{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px 16px;margin-bottom:10px}
.ih-sp{width:8px;height:40px;border-radius:2px;flex:none}
.ih-x{flex:1;min-width:0}
.ih-x b{display:block;font-weight:500;font-size:15.5px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ih-x small{display:block;font-size:12px;color:var(--sub);margin-top:2px}
.ih-bar{height:2px;background:rgba(127,127,127,.15);border-radius:2px;margin-top:8px;overflow:hidden}
.ih-bar i{display:block;height:100%;background:var(--accent)}
.ih-it em{font-family:var(--num);font-style:italic;font-size:20px;color:var(--accent-t)}
</style>`);

$('#lbImpBtn').insertAdjacentHTML('beforebegin',`<div id="shHost">
  <div class="sh-box glass"><div class="sh-h"><b>Shelf</b><button id="shAdd">＋ 上架</button><button id="shEd">整理</button></div>
  <p class="sh-sub" id="shSub"></p><div id="shRows"></div><p class="sh-tip" id="shTip"></p></div>
  <div id="ihBox"></div></div>`);

function shelved(){const F=off(),O=Array.isArray(S.shelfOrder)?S.shelfOrder:[];
  const ix=s=>{const i=O.indexOf(s.id);return i<0?1e13+(s.t||0):i};
  return DATA.library.filter(s=>!F.includes(s.id)).sort((a,b)=>ix(a)-ix(b))}
function render(){const host=$('#shHost');if(!host)return;const L=shelved();
  $('#shSub').textContent=`${L.length} 本 · 点书脊翻开`;
  $('#shEd').textContent=edit?'完成':'整理';
  $('#shTip').textContent=edit?'点一本书，可以挪位置或者下架':'';
  const W=Math.max(200,(host.clientWidth||340)-44),rows=[[]];let w=0;
  L.forEach(s=>{const x=wOf(s)+2;if(w+x>W&&rows.at(-1).length){rows.push([]);w=0}rows.at(-1).push(s);w+=x});
  $('#shRows').innerHTML=L.length?rows.map(r=>`<div class="sh-row">${r.map(s=>{const[bg,fg]=look(s);
    return `<button class="sh-bk${s.sx?' sx':''}${edit?' ed':''}" data-sh="${s.id}" style="width:${wOf(s)}px;height:${hOf(s)}px;background:${bg};color:${fg}"><span>${esc(s.title)}</span></button>`}).join('')}</div>`).join('')
    :'<div class="sh-empty">书架上还没有书</div>';
  const R=DATA.library.filter(s=>s.readAt&&s.parts.length&&pct(s)<100).sort((a,b)=>b.readAt-a.readAt).slice(0,5);
  $('#ihBox').innerHTML=R.length?`<div class="ih-h"><b>In Hand</b><span>在读 · ${R.length}</span></div>`+R.map(s=>{const p=pct(s),[bg]=look(s);
    return `<button class="ih-it glass" data-ih="${s.id}"><i class="ih-sp" style="background:${bg}"></i><div class="ih-x"><b>${esc(s.title)}</b><small>${s.author?esc(s.author)+' · ':''}${fmtDate(s.readAt)} 读过</small><div class="ih-bar"><i style="width:${p}%"></i></div></div><em>${p}%</em></button>`}).join(''):''}
const later=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(render)};

function openBook(id,cont){const b=document.createElement('button');b.dataset.lb=id;$('#lbList').appendChild(b);b.click();b.remove();
  if(cont)requestAnimationFrame(()=>$('#bkGo')?.click())}
function move(id,d){const L=shelved().map(s=>s.id),i=L.indexOf(id),j=i+d;if(i<0||j<0||j>=L.length)return;
  [L[i],L[j]]=[L[j],L[i]];S.shelfOrder=L;saveSettings();render()}
$('#shRows').onclick=e=>{const b=e.target.closest('[data-sh]');if(!b)return;const id=b.dataset.sh;
  if(!edit)return setTimeout(()=>openBook(id),180);
  const s=DATA.library.find(x=>x.id===id);if(!s)return;
  sheet([['往前挪',()=>move(id,-1)],['往后挪',()=>move(id,1)],
    ['下架（不会删）',()=>{off().push(id);saveSettings();render();toast(`「${s.title}」下架了`)}],
    ['翻开',()=>openBook(id)]])};
$('#ihBox').onclick=e=>{const b=e.target.closest('[data-ih]');if(b)openBook(b.dataset.ih,true)};
$('#shEd').onclick=()=>{edit=!edit;render()};
$('#shAdd').onclick=()=>{const F=off(),L=DATA.library.filter(s=>F.includes(s.id));
  if(!L.length)return toast('所有书都在书架上了');
  const put=ids=>{S.shelfOff=F.filter(x=>!ids.includes(x));saveSettings();render();toast('放上去了')};
  sheet([...(L.length>1?[['全部放上去',()=>put(L.map(s=>s.id))]]:[]),...L.map(s=>[`放上去：${s.title}`,()=>put([s.id])])])};

new MutationObserver(later).observe($('#lbList'),{childList:true});
window.addEventListener('resize',later);
HOOKS.ready.push(later);
HOOKS.page.push(n=>{if(n==='library')later();else edit=false});
})();
