/* ===== 365 · infinity.js · More 里的 Infinity（替代原来的小卡片） ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
document.head.insertAdjacentHTML('beforeend',`<style>
#page-infinity{padding:0;overflow:hidden}
body.infb #tabbar{display:none}
#infFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
#infBack{position:absolute;z-index:2;left:16px;top:calc(var(--st) + 4px)}
</style>`);
$('#tabbar').insertAdjacentHTML('beforebegin',`<section class="page" id="page-infinity">
  <iframe id="infFrame" title="Infinity" allowtransparency="true"></iframe>
  <button class="iconbtn glass" id="infBack" data-go="more" aria-label="返回">${BACK}</button></section>`);
$$('#page-game [data-go="infinity"]').forEach(x=>x.remove());
addMore({go:'infinity',cn:'Infinity',ce:'cards'});
HOOKS.page.push(n=>{document.body.classList.toggle('infb',n==='infinity');
  if(n==='infinity'){const f=$('#infFrame');if(!f.src)f.src='infinity.html'}});
})();
