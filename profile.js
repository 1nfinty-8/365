/* ===== 365 · profile.js · 关于他：他的档案 ===== */
(()=>{
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const DEF=[['姓名','陆择'],['星座','天蝎座'],['MBTI','ENTJ'],['生日','11月12日']];
const SUG=['身高','血型','职业','住在','老家','喜欢的颜色','喜欢的食物','讨厌的东西','口头禅','习惯','爱好','最喜欢的歌','用的香水','养的宠物'];
const P=()=>{if(!Array.isArray(S.himProfile))S.himProfile=DEF.map(([k,v])=>({id:uid(),k,v}));return S.himProfile};
const nameOf=()=>(P().find(x=>x.k==='姓名')||{}).v||S.hisName;
let busy=false;

document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-prof{grid-column:1/-1;flex-direction:row;justify-content:flex-start;gap:16px;padding:16px 20px;min-height:auto;text-align:left}
.hm-prof .av{width:52px;height:52px;font-size:20px}
.hm-pl{font-size:12px;color:var(--sub);letter-spacing:2px;margin-top:2px}
.pf-card{position:relative;padding:28px 22px 14px;margin-bottom:14px}
.pf-no{position:absolute;top:16px;right:20px;font-family:var(--num);font-style:italic;font-size:13px;color:var(--sub)}
.pf-top{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:18px}
.pf-top .av{width:84px;height:84px;font-size:32px}
.pf-top b{font-family:var(--ti);font-weight:500;font-size:26px;letter-spacing:6px}
.pf-top em{font-family:var(--en);font-style:italic;font-size:13px;color:var(--sub);letter-spacing:2px;margin-top:-6px}
.pf-row{display:flex;align-items:baseline;gap:12px;width:100%;text-align:left;padding:13px 2px;border-top:1px solid var(--line)}
.pf-row span{flex:none;width:86px;font-size:12.5px;color:var(--sub);letter-spacing:2px}
.pf-row b{flex:1;min-width:0;font-family:var(--ti);font-weight:400;font-size:16px;letter-spacing:1px;word-break:break-word}
.pf-add{display:block;width:100%;padding:13px;text-align:center;letter-spacing:2px;font-size:14px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-hprof"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他的档案</h2><em>profile</em></div>
  <div class="pf-card glass" id="pfCard"></div>
  <button class="pf-add glass" id="pfAdd">＋ 加一项</button>
  <p class="hint" style="text-align:center">点一项可以改。加的时候内容留空，他会自己填。</p>
</div></section>`);

/* 「关于他」最上面的卡片 */
function card(){const g=$('#himGrid');if(!g)return;let c=g.querySelector('[data-go="hprof"]');
  if(!c){g.insertAdjacentHTML('afterbegin','<button class="card glass hm-prof" data-go="hprof"></button>');c=g.querySelector('[data-go="hprof"]')}
  const sub=P().filter(x=>x.k!=='姓名'&&x.v).slice(0,3).map(x=>x.v).join(' · ');
  c.innerHTML=`${avatarHTML('him')}<div><div class="cn">${esc(nameOf())}</div><div class="hm-pl">${esc(sub)||'他的档案'}</div></div>`}

function render(){
  $('#pfCard').innerHTML=`<span class="pf-no">No.001</span><div class="pf-top">${avatarHTML('him')}<b>${esc(nameOf())}</b><em>profile</em></div>`
    +P().map(x=>`<button class="pf-row" data-pf="${x.id}"><span>${esc(x.k)}</span><b>${esc(x.v||'…')}</b></button>`).join('')
    +(busy?`<div class="pf-row"><span></span><b style="color:var(--sub)">${esc(S.hisName)}在想…</b></div>`:'');
  card()}
const done=()=>{saveSettings();render()};

/* ---------- 他自己填 ---------- */
async function fill(x){if(busy)return;if(!S.apiKey)return toast('还没有填 API Key');busy=true;render();
  try{const have=P().filter(y=>y!==x&&y.v).map(y=>`${y.k}：${y.v}`).join('；');
    const t=await callAI(sceneSystem('她在「365」里给你建了一份个人档案。'),[{role:'user',text:`你的档案里已经有：${have}。请以${S.hisName}的身份，填上「${x.k}」这一项，要符合你的人设，具体、简短，不超过 20 个字。只输出要填的内容，不要 emoji。`}]);
    let v=clean(t).split('\n')[0].trim();if(v.startsWith(x.k))v=v.slice(x.k.length).replace(/^[:：\s]+/,'');
    x.v=v;saveSettings()}
  catch(e){toast(e.message)}
  finally{busy=false;render()}}

/* ---------- 加一项 / 改 ---------- */
function addK(k){const v=prompt(`${k}（留空的话，${S.hisName}会自己填）`,'');if(v==null)return;
  const x={id:uid(),k,v:v.trim()};P().push(x);done();if(!x.v)fill(x)}
$('#pfAdd').onclick=()=>{const have=P().map(x=>x.k);
  sheet([...SUG.filter(k=>!have.includes(k)).map(k=>[k,()=>addK(k)]),
    ['自己写一个',()=>{const k=prompt('这一项叫什么？比如：咖啡的口味');if(k&&k.trim())addK(k.trim())}]])};
$('#pfCard').onclick=e=>{const b=e.target.closest('[data-pf]');if(!b)return;
  const L=P(),i=L.findIndex(x=>x.id===b.dataset.pf),x=L[i];if(!x)return;
  const acts=[['改内容',()=>{const v=prompt(x.k,x.v);if(v==null)return;x.v=v.trim();done()}],
    ['改这一项的名字',()=>{const v=prompt('这一项叫什么',x.k);if(!v||!v.trim())return;x.k=v.trim();done()}],
    [`让${S.hisName}重新填`,()=>fill(x)]];
  if(i>0)acts.push(['往上移',()=>{L.splice(i,1);L.splice(i-1,0,x);done()}]);
  acts.push(['删除这一项',()=>{if(!confirm(`删除「${x.k}」？`))return;L.splice(i,1);done()}]);
  sheet(acts)};

/* ---------- 档案交给他 ---------- */
HOOKS.persona.push(()=>{const L=P().filter(x=>x.v);
  return L.length?'【你的档案】'+L.map(x=>`${x.k}：${x.v}`).join('；')+'。这些就是你，说到相关的事要一致。':''});

HOOKS.ready.push(card);
HOOKS.refresh.push(card);
HOOKS.page.push(n=>{if(n==='him')card();if(n==='hprof')render()});
})();
