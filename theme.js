/* ===== 365 · theme.js · 外观：跟随系统 / 浅色 / 深色 ===== */
(()=>{
const mq=matchMedia('(prefers-color-scheme: dark)');
const mode=()=>['auto','light','dark'].includes(S.look)?S.look:'auto';

document.head.insertAdjacentHTML('beforeend',`<style>
html.dk{color-scheme:dark}
html.dk,html.dk body{background:#141015}
html.dk body{
  --bg:#141015;--ink:#F2ECEE;--sub:rgba(242,236,238,.58);--line:rgba(255,255,255,.1);
  --hb:rgba(255,255,255,.1);--hbt:#F2ECEE;--mb:color-mix(in srgb,var(--accent) 55%,#1a1416);--mbt:#fff;
  --sys-bg:rgba(44,44,46,.82);--sys-solid:#1C1C1E;--sys-card:#2C2C2E;--sys-txt:#FFFFFF;
  --sys-sub:rgba(235,235,245,.6);--sys-sep:rgba(84,84,88,.65);--sys-fill:rgba(118,118,128,.24);--sys-red:#FF453A}
html.lt body{
  --sys-bg:rgba(250,250,252,.82);--sys-solid:#F2F2F7;--sys-card:#FFFFFF;--sys-txt:#000000;
  --sys-sub:rgba(60,60,67,.6);--sys-sep:rgba(60,60,67,.2);--sys-fill:rgba(118,118,128,.12);--sys-red:#FF3B30}
html.dk #mask{background:linear-gradient(180deg,rgba(18,12,16,.62),rgba(10,6,9,.78))}
html.dk .glass{background:linear-gradient(135deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.03) 45%,rgba(255,255,255,0) 60%,rgba(255,255,255,.05) 100%),rgba(28,20,25,.42);
  -webkit-backdrop-filter:blur(max(var(--gblur),16px)) saturate(1.4);backdrop-filter:blur(max(var(--gblur),16px)) saturate(1.4);
  border-color:rgba(255,255,255,.12);box-shadow:inset 1px 1px 0 rgba(255,255,255,.16),inset -1px -1px 0 rgba(255,255,255,.04),0 8px 24px rgba(0,0,0,.25)}
html.dk .pill.ghost{background:rgba(255,255,255,.1);color:var(--ink);border-color:rgba(255,255,255,.16)}
html.dk .f input:not([type=checkbox]):not([type=range]):not([type=color]),html.dk .f select,html.dk .f textarea{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1);color:var(--ink)}
html.dk .mbox .f input:not([type=checkbox]),html.dk .mbox .f textarea{background:var(--sys-card)}
html.dk .pcbox,html.dk .an-ms,html.dk .tc-ic,html.dk .pv,html.dk .mm-tabs button,html.dk .bk-c,html.dk .cimg,html.dk .pimgs img{background:rgba(255,255,255,.08)}
html.dk #replyBar input{background:rgba(255,255,255,.12);color:var(--ink)}
html.dk .lb-bar,html.dk .bk-bar,html.dk .tc-bar,html.dk .ih-bar{background:rgba(255,255,255,.12)}
html.dk .quote,html.dk .an-note,html.dk .dl-prev,html.dk .hd-sum,html.dk .hd-c p,html.dk .lb-meta{color:rgba(242,236,238,.78)}
html.dk .sw button{border-color:rgba(255,255,255,.2)}
html.dk .ndot{box-shadow:0 0 0 2px rgba(20,16,21,.9)}
html.dk .sh-bk{filter:brightness(.72)}
.lk-seg{display:flex;gap:8px;margin-top:4px}
.lk-seg button{flex:1;padding:9px 0;border-radius:99px;font-size:13px;letter-spacing:1px;background:rgba(127,127,127,.12)}
.lk-seg button.on{background:var(--accent);color:var(--acct)}
</style>`);

function apply(){const d=mode()==='dark'||(mode()==='auto'&&mq.matches),h=document.documentElement;
  h.classList.toggle('dk',d);h.classList.toggle('lt',!d);
  let m=document.querySelector('meta[name="theme-color"]');
  if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}
  m.content=d?'#141015':'#F3E9EA';
  $$('#lkSeg button').forEach(b=>b.classList.toggle('on',b.dataset.lk===mode()))}
apply();
mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);

function mount(){if($('#lkSec'))return apply();
  const w=$('#page-me .wrap');if(!w)return;
  const h='<div class="sec glass" id="lkSec"><h3>外观<em>appearance</em></h3><div class="lk-seg" id="lkSeg"><button data-lk="auto">跟随系统</button><button data-lk="light">浅色</button><button data-lk="dark">深色</button></div></div>';
  const first=w.querySelector('.sec');if(first)first.insertAdjacentHTML('beforebegin',h);else w.insertAdjacentHTML('beforeend',h);
  $('#lkSeg').onclick=e=>{const b=e.target.closest('[data-lk]');if(!b)return;S.look=b.dataset.lk;saveSettings();apply()};
  apply()}
mount();
HOOKS.ready.push(mount);
HOOKS.page.push(n=>{if(n==='me')mount()});
})();
