/* ===== 365 · sxsess.js · 秘密：好几段剧情 + 左边抽屉；More 里的秘密变大 ===== */
(()=>{
if(!Array.isArray(DATA.sxs))DATA.sxs=[];
const MENU='<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
const save=()=>saveData('sxs');

document.head.insertAdjacentHTML('beforeend',`<style>
#moreSm{display:none!important}
#sxDrw{flex:none}
#page-secret.locked #sxDrw{display:none}
#sxDr{position:absolute;inset:0;z-index:20;pointer-events:none}
#sxDr.show{pointer-events:auto}
.sd-bg{position:absolute;inset:0;background:rgba(0,0,0,.28);opacity:0;transition:opacity .25s}
#sxDr.show .sd-bg{opacity:1}
.sd-p{position:absolute;left:0;top:0;bottom:0;width:min(80%,340px);display:flex;flex-direction:column;padding:calc(var(--st) + 12px) 14px calc(var(--sb) + 14px);background:var(--sys-bg);color:var(--sys-txt);-webkit-backdrop-filter:blur(30px) saturate(1.6);backdrop-filter:blur(30px) saturate(1.6);box-shadow:8px 0 30px rgba(0,0,0,.15);transform:translateX(-102%);transition:transform .3s cubic-bezier(.2,.9,.3,1);font-family:var(--cn)}
#sxDr.show .sd-p{transform:none}
.sd-h{display:flex;align-items:center;justify-content:space-between;margin:0 4px 14px}
.sd-h b{font-family:var(--ti);font-weight:500;font-size:18px;letter-spacing:4px}
.sd-h .pill{padding:7px 14px;font-size:13px}
.sd-l{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.sd-it{display:flex;align-items:center;gap:6px;padding:12px;border-radius:14px;margin-bottom:4px}
.sd-it.on{background:var(--sys-fill)}
.sd-x{flex:1;min-width:0}
.sd-x b{display:block;font-weight:500;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sd-x small{display:block;font-size:12px;color:var(--sys-sub);margin-top:2px}
.sd-m{width:30px;height:30px;color:var(--sys-sub);letter-spacing:1px;flex:none}
.sd-tip{font-size:12px;color:var(--sys-sub);text-align:center;margin-top:10px}
</style>`);

/* ---------- More 里的秘密：变成大卡片 ---------- */
function bigSecret(){const c=$('#moreSm .card[data-go="secret"]');if(!c)return;
  c.classList.remove('sm');c.innerHTML='<div class="cn">秘密</div><div class="ce">secret</div><i class="ndot"></i>';$('#moreGrid').appendChild(c)}
bigSecret();

/* ---------- 抽屉 ---------- */
$('#page-secret .sx-top [data-go="more"]').insertAdjacentHTML('afterend',`<button class="iconbtn glass" id="sxDrw" aria-label="剧情">${MENU}</button>`);
$('#page-secret').insertAdjacentHTML('beforeend',`<div id="sxDr"><div class="sd-bg" id="sdBg"></div><div class="sd-p">
  <div class="sd-h"><b>剧情</b><button class="pill" id="sdNew">＋ 新的剧情</button></div>
  <div class="sd-l" id="sdL"></div><p class="sd-tip">没走完的剧情都留在这里，点一下接着写</p></div></div>`);

/* 当前这段的记录放在 DATA.secret 里，其他段放在 DATA.sxs 里 */
function cur(){let c=DATA.sxs.find(x=>x.id===S.sxCur);
  if(!c){c={id:uid(),title:'',msgs:[],t:Date.now()};DATA.sxs.unshift(c);S.sxCur=c.id;saveSettings();save()}return c}
const msgsOf=s=>s.id===S.sxCur?DATA.secret:(s.msgs||[]);
const nameOf=s=>s.title||(msgsOf(s).find(m=>m.role==='user')?.text||'').replace(/\s+/g,' ').slice(0,16)||'新的剧情';
const lastT=s=>msgsOf(s).at(-1)?.t||s.t;
const busy=()=>!!$('#sxMsgs .typing');
const redraw=()=>$(`#sxSeg button[data-m="${S.sxMode||'card'}"]`)?.click();
const wait=()=>toast(`${S.hisName}还在写，等他写完再换`);

function list(){cur();const L=[...DATA.sxs].sort((a,b)=>lastT(b)-lastT(a));
  $('#sdL').innerHTML=L.map(s=>`<div class="sd-it${s.id===S.sxCur?' on':''}" data-s="${s.id}"><div class="sd-x"><b>${esc(nameOf(s))}</b><small>${fmtDate(lastT(s))} · ${msgsOf(s).length} 条</small></div><button class="sd-m" data-sm="${s.id}">···</button></div>`).join('')}
function openD(){if($('#page-secret').classList.contains('locked'))return;list();$('#sxDr').classList.add('show')}
function closeD(){$('#sxDr').classList.remove('show')}

async function sw(id){if(id===S.sxCur)return closeD();if(busy())return wait();
  const a=cur(),b=DATA.sxs.find(x=>x.id===id);if(!b)return;
  a.msgs=DATA.secret;a.t=lastT(a);DATA.secret=b.msgs||[];b.msgs=[];S.sxCur=b.id;saveSettings();
  await saveData('secret');await save();closeD();redraw()}
async function nw(){if(busy())return wait();const a=cur();
  if(!DATA.secret.length){closeD();return toast('现在就是一段新的剧情')}
  a.msgs=DATA.secret;a.t=lastT(a);
  const b={id:uid(),title:'',msgs:[],t:Date.now()};DATA.sxs.unshift(b);DATA.secret=[];S.sxCur=b.id;saveSettings();
  await saveData('secret');await save();closeD();redraw();toast('开了一段新的剧情')}
function menu(id){const s=DATA.sxs.find(x=>x.id===id);if(!s)return;
  sheet([['改名字',async()=>{const v=prompt('这段剧情叫什么',nameOf(s));if(v==null)return;s.title=v.trim();await save();list()}],
    ['删除这段剧情',async()=>{if(!confirm(`删除「${nameOf(s)}」？里面的记录都会删掉。`))return;
      if(s.id===S.sxCur){if(busy())return wait();
        DATA.sxs=DATA.sxs.filter(x=>x!==s);const n=[...DATA.sxs].sort((a,b)=>lastT(b)-lastT(a))[0];
        if(n){DATA.secret=n.msgs||[];n.msgs=[];S.sxCur=n.id}else{DATA.secret=[];S.sxCur=''}
        saveSettings();await saveData('secret');redraw()}
      else DATA.sxs=DATA.sxs.filter(x=>x!==s);
      await save();list()}]])}

$('#sxDrw').onclick=openD;
$('#sdBg').onclick=closeD;
$('#sdNew').onclick=nw;
$('#sdL').onclick=e=>{const m=e.target.closest('[data-sm]');if(m)return menu(m.dataset.sm);
  const it=e.target.closest('[data-s]');if(it)sw(it.dataset.s)};

/* ---------- 从最左边往右滑打开，往左滑关上 ---------- */
let x0=null,y0=0;
$('#page-secret').addEventListener('touchstart',e=>{const t=e.touches[0];
  if($('#sxDr').classList.contains('show')||t.clientX<40){x0=t.clientX;y0=t.clientY}else x0=null},{passive:true});
$('#page-secret').addEventListener('touchend',e=>{if(x0==null)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
  const open=$('#sxDr').classList.contains('show');x0=null;
  if(Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx))return;
  if(dx>0&&!open)openD();else if(dx<0&&open)closeD()},{passive:true});

/* 锁上的时候抽屉一起关掉 */
new MutationObserver(()=>{if($('#page-secret').classList.contains('locked'))closeD()})
  .observe($('#page-secret'),{attributes:true,attributeFilter:['class']});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.sxs))DATA.sxs=[];cur();bigSecret()});
HOOKS.page.push(n=>{if(n!=='secret')closeD()});
})();
