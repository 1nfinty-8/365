/* ===== 365 · hlcolor.js · 荧光笔：主题色从深到浅 ===== */
(()=>{
const K=[['k1','color-mix(in srgb,var(--accent) 55%,#000)'],['k2','var(--accent-t)'],['k3','var(--accent)'],['k4','color-mix(in srgb,var(--accent) 60%,#fff)'],['k5','color-mix(in srgb,var(--accent) 32%,#fff)']];
const IDS=[...K.map(k=>k[0]),'u'];
document.head.insertAdjacentHTML('beforeend',`<style>
#rdHl{opacity:0!important;pointer-events:none!important}
.rd-text mark.hl.me{background:color-mix(in srgb,var(--accent-t) 60%,transparent)}
${K.map(([k,c])=>`.rd-text mark.hl.me[data-c="${k}"]{background:color-mix(in srgb,${c} 72%,transparent)}`).join('\n')}
.rd-text mark.hl.me[data-c="k1"]{color:#fff}
.rd-text mark.hl.me[data-c="k4"],.rd-text mark.hl.me[data-c="k5"]{color:#2E1A1F}
.rd-text mark.hl.me[data-c="u"]{background:none;text-decoration:underline;text-decoration-color:var(--accent-t);text-decoration-thickness:2.5px;text-underline-offset:5px}
#hlBar{position:absolute;left:50%;bottom:calc(var(--sb) + 20px);transform:translateX(-50%);z-index:4;display:none;align-items:center;gap:14px;padding:12px 18px;border-radius:99px;background:rgba(40,40,44,.84);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);box-shadow:0 8px 24px rgba(0,0,0,.25);-webkit-user-select:none;user-select:none}
#hlBar.show{display:flex;animation:fd .2s ease}
#hlBar button{width:26px;height:26px;border-radius:50%;flex:none}
#hlBar button.on{box-shadow:0 0 0 2px rgba(40,40,44,.9),0 0 0 4px #fff}
#hlBar .u{background:none;color:#fff;font-size:18px;text-decoration:underline;text-underline-offset:3px;font-family:var(--en)}
</style>`);
$('#hlBar')?.remove();
const bar=document.createElement('div');bar.id='hlBar';
bar.innerHTML=K.map(([k,c])=>`<button data-hc="${k}" style="background:${c}"></button>`).join('')+'<button class="u" data-hc="u">U</button>';
$('#reader').appendChild(bar);
const cur=()=>IDS.includes(S.hlColor)?S.hlColor:'k2';
const mark=()=>bar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.hc===cur()));
if(!IDS.includes(S.hlColor)){S.hlColor='k2';saveSettings()}
new MutationObserver(()=>{bar.classList.toggle('show',$('#rdHl').classList.contains('show'));mark()})
  .observe($('#rdHl'),{attributes:true,attributeFilter:['class']});
bar.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-hc]');if(!b)return;e.preventDefault();
  S.hlColor=b.dataset.hc;saveSettings();mark();$('#rdHl').click()});
})();
