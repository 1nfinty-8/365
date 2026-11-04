/* ===== 365 · chatcard.js · 聊天里的通话、礼物气泡 ===== */
(()=>{
const PH='<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v3a2 2 0 0 1-2.1 2.1A15.5 15.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1z"/></svg>';
const GIFT='<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10.5" rx="1.5"/><path d="M3 7h18v3H3zM12 7v13.5M12 7C10.5 3.5 6.5 3.8 7.5 7M12 7c1.5-3.5 5.5-3.2 4.5 0"/></svg>';
document.head.insertAdjacentHTML('beforeend',`<style>
.bubble.cl-bub{display:flex;align-items:center;gap:8px}
.row.him .cl-bub{flex-direction:row-reverse}
.cl-bub svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round}
.cl-bub.miss svg{transform:rotate(135deg)}
.bubble.gf-bub{display:flex;align-items:center;gap:12px;padding:11px 14px;min-width:210px;cursor:pointer}
.gf-ic{width:42px;height:42px;border-radius:10px;flex:none;display:grid;place-items:center;background:var(--accent);color:var(--acct)}
.gf-ic svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
.gf-bub b{display:block;font-weight:600;font-size:15px}
.gf-bub small{display:block;font-size:12px;opacity:.6;margin-top:1px}
</style>`);
function deco(){$$('#msgs .row[data-i]').forEach(r=>{if(r.dataset.dc)return;r.dataset.dc=1;
  const m=DATA.chat[+r.dataset.i],b=r.querySelector('.bubble:not(.vbub)');if(!m||!b)return;
  if(m.gift){const g=(DATA.gifts||[]).find(x=>x.id===m.gift);b.classList.add('gf-bub');b.dataset.gid=m.gift;
    b.innerHTML=`<i class="gf-ic">${GIFT}</i><span><b>${esc(m.text)}</b><small>${g?(g.opened?'已拆开':'点开看看')+' · '+esc(g.title):'找不到了'}</small></span>`}
  else if(m.call||m.missed){b.classList.add('cl-bub');if(m.missed)b.classList.add('miss');b.innerHTML=`<span>${esc(m.text)}</span>${PH}`}})}
new MutationObserver(deco).observe($('#msgs'),{childList:true});
document.addEventListener('click',e=>{const g=e.target.closest('#msgs .gf-bub');if(!g)return;e.stopImmediatePropagation();e.preventDefault();window.openGift?.(g.dataset.gid)},true);
HOOKS.ready.push(deco);
})();
