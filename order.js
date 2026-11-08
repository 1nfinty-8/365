/* ===== 365 · order.js · More 里卡片的顺序 ===== */
(()=>{
const ORDER=['关于他','秘密','月度回顾','游戏'];
function sort(){const g=$('#moreGrid');if(!g)return;
  const cards=[...g.children];
  ORDER.forEach(n=>{const c=cards.find(x=>(x.querySelector('.cn')?.textContent||'').trim()===n);if(c)g.appendChild(c)})}
sort();
HOOKS.ready.push(sort);
HOOKS.page.push(n=>{if(n==='more')sort()});
})();
