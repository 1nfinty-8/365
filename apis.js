/* ===== 365 · apis.js · 存好几个 API，点一下切换；模型直接从列表里选 ===== */
(()=>{
const host=u=>{try{return new URL(u).host}catch(e){return String(u||'')}};
const tail=k=>'…'+String(k||'').slice(-4);
const isG=(p,b)=>p==='gemini'||/googleapis/.test(b||'');
const relayP=()=>S.provider&&S.provider!=='gemini'?S.provider:(S.sxProvider&&S.sxProvider!=='gemini'?S.sxProvider:'openai');
const L=()=>(S.apiProfiles=Array.isArray(S.apiProfiles)?S.apiProfiles:[]);
const same=(p,k,b)=>p.key===k&&host(p.base)===host(b);
const MC='365-models';
const MCache=(()=>{try{return JSON.parse(localStorage.getItem(MC))||{}}catch(e){return {}}})();
const ck=p=>(isG(p.provider,p.base)?'gemini':host(p.base))+'|'+String(p.key||'').slice(-6);

document.head.insertAdjacentHTML('beforeend',`<style>
#apSet{margin:4px 0 16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.ap-h{font-size:12px;color:var(--sub);letter-spacing:2px;margin-bottom:6px}
.ap-it{display:flex;align-items:center;gap:6px;width:100%;text-align:left;padding:10px 2px;border-top:1px solid var(--line)}
.ap-it:first-child{border-top:0}
.ap-l{flex:1;min-width:0}
.ap-l b{display:block;font-weight:500;font-size:15px;letter-spacing:1px}
.ap-l small{display:block;font-size:11.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-tag{flex:none;font-style:normal;font-size:11px;padding:2px 8px;border-radius:99px;background:var(--accent);color:var(--acct,#fff)}
.ap-tag.g{background:rgba(127,127,127,.18);color:var(--sub)}
.ap-sel{margin:-4px 0 12px;padding:6px 14px;font-size:12.5px}
#apQ{width:100%;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.35);color:inherit;font-size:16px;margin:6px 0 8px}
html.dk #apQ{background:rgba(255,255,255,.06)}
#apML{max-height:52vh;overflow-y:auto;-webkit-overflow-scrolling:touch;margin:0 -4px}
.ap-m{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:11px 8px;border-top:1px solid var(--line);font-size:14px;word-break:break-all;line-height:1.35}
.ap-m:first-child{border-top:0}
.ap-m span{flex:1;min-width:0}
.ap-m i{font-style:normal;flex:none;color:var(--accent-t);font-size:15px}
.ap-m.on{font-weight:500}
.ap-msg{padding:20px 6px;text-align:center;font-size:13px;color:var(--sub);line-height:1.7}
.ap-cnt{font-size:11.5px;color:var(--sub);letter-spacing:1px;text-align:center;margin-bottom:2px}
</style>`);

$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="apPick"><div class="mbox">
  <h3 id="apPT">选模型</h3>
  <input id="apQ" placeholder="搜索，比如 flash、claude" autocapitalize="off" autocorrect="off" spellcheck="false">
  <div class="ap-cnt" id="apCnt"></div>
  <div id="apML"></div>
  <div class="mbtns"><button class="pill ghost" id="apMan">手动填</button><button class="pill ghost" id="apRef">重新获取</button><button class="pill ghost" data-close="apPick">取消</button></div>
</div></div>
<div class="modal" id="apAdd"><div class="mbox">
  <h3>添加一个 API</h3>
  <label class="f"><span>名字</span><input id="apAN" placeholder="比如：sta1n"></label>
  <label class="f"><span>地址（留空就是 Gemini 官方）</span><input id="apAU" placeholder="https://xxx.com/v1" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <label class="f"><span>Key</span><input id="apAK" placeholder="sk-..." autocapitalize="off" autocorrect="off" spellcheck="false"></label>
  <div class="mbtns"><button class="pill ghost" data-close="apAdd">取消</button><button class="pill" id="apASave">保存并选模型</button></div>
</div></div>`);

/* ---------- 从中转站拿模型列表 ---------- */
async function listModels(p){
  if(!p.key)throw new Error('先填 Key');
  if(isG(p.provider,p.base)){
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key='+encodeURIComponent(p.key));
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error?.message||('获取失败 '+r.status));
    return (j.models||[]).filter(m=>!m.supportedGenerationMethods||m.supportedGenerationMethods.includes('generateContent')).map(m=>String(m.name).replace(/^models\//,''))}
  const b=String(p.base||'').trim().replace(/\/+$/,'').replace(/\/chat\/completions$/,'');
  if(!b)throw new Error('先填接口地址');
  const tries=[b+'/models'];if(!/\/v\d+$/.test(b))tries.push(b+'/v1/models');
  let err;
  for(const u of tries){
    try{const r=await fetch(u,{headers:{Authorization:'Bearer '+p.key}});const j=await r.json().catch(()=>({}));
      if(!r.ok){err=new Error(j.error?.message||('获取失败 '+r.status));continue}
      const arr=(j.data||j.models||[]).map(m=>typeof m==='string'?m:(m.id||m.name)).filter(Boolean);
      if(arr.length)return arr;err=new Error('这个地址没有返回模型列表')}
    catch(e){err=e instanceof TypeError?new Error('连不上，或者这家不让网页获取模型'):e}}
  throw err}

/* ---------- 选模型的弹窗 ---------- */
let PK=null;
function pickModel(p,cur,title,cb){PK={p,cur:cur||'',cb,list:MCache[ck(p)]||null,err:'',busy:false};
  $('#apPT').textContent=title||'选模型';$('#apQ').value='';openModal('apPick');drawList();
  if(!PK.list)fetchList()}
async function fetchList(){const me=PK;if(!me)return;me.busy=true;me.err='';drawList();
  try{const L=[...new Set(await listModels(me.p))].sort((a,b)=>a.localeCompare(b));me.list=L;MCache[ck(me.p)]=L;localStorage.setItem(MC,JSON.stringify(MCache))}
  catch(e){me.err=e.message}
  me.busy=false;if(PK===me)drawList()}
function drawList(){const P=PK;if(!P)return;const q=$('#apQ').value.trim().toLowerCase(),el=$('#apML');
  if(P.busy&&!P.list){el.innerHTML='<div class="ap-msg">正在获取模型列表…</div>';$('#apCnt').textContent='';return}
  if(!P.list){el.innerHTML=`<div class="ap-msg">${esc(P.err||'还没有模型列表')}<br>可以点「重新获取」，或者「手动填」</div>`;$('#apCnt').textContent='';return}
  let L=P.list.filter(m=>!q||m.toLowerCase().includes(q));
  if(P.cur&&L.includes(P.cur))L=[P.cur,...L.filter(m=>m!==P.cur)];
  P.shown=L;
  $('#apCnt').textContent=(P.busy?'正在更新… · ':'')+(P.err?'更新失败，显示的是上次的 · ':'')+`${L.length} 个模型`;
  el.innerHTML=L.length?L.map((m,i)=>`<button class="ap-m${m===P.cur?' on':''}" data-i="${i}"><span>${esc(m)}</span>${m===P.cur?'<i>✓</i>':''}</button>`).join('')
    :'<div class="ap-msg">没有找到，换个词试试</div>'}
$('#apQ').addEventListener('input',drawList);
$('#apRef').onclick=()=>{if(PK&&!PK.busy)fetchList()};
$('#apML').onclick=e=>{const b=e.target.closest('[data-i]');if(!b||!PK)return;const m=PK.shown[+b.dataset.i],cb=PK.cb;PK=null;closeModal('apPick');cb&&cb(m)};
$('#apMan').onclick=()=>{if(!PK)return;const v=prompt('模型名字（照中转站写的一字不差）',PK.cur||'');if(!v||!v.trim())return;const cb=PK.cb;PK=null;closeModal('apPick');cb&&cb(v.trim())};

/* ---------- 已保存的 API ---------- */
function rows(){const P=[...L()];
  (S.quotaList||[]).forEach(q=>{if(q.key&&!P.some(p=>same(p,q.key,q.base)))
    P.push({id:'q_'+q.id,name:q.name||'其他',base:q.base,key:q.key,provider:isG('',q.base)?'gemini':relayP(),model:'',fromQ:1})});
  return P}
const useChat=p=>p.key===S.apiKey&&(p.model||'')===(S.model||'');
const useSx=p=>!!S.sxProvider&&p.key===(S.sxKey||S.apiKey)&&(p.model||'')===(S.sxModel||'');
function render(){const el=$('#apList');if(!el)return;const R=rows();
  el.innerHTML=R.length?R.map(p=>`<button class="ap-it" data-ap="${esc(p.id)}"><span class="ap-l"><b>${esc(p.name)}</b><small>${esc(p.model||'还没选模型')} · ${esc(isG(p.provider,p.base)?'Gemini 官方':host(p.base))} · ${tail(p.key)}</small></span>${useChat(p)?'<i class="ap-tag">聊天</i>':''}${useSx(p)?'<i class="ap-tag">秘密</i>':''}${p.fromQ?'<i class="ap-tag g">额度里的</i>':''}</button>`).join('')
    :'<p class="hint">还没有存。点「＋ 添加一个 API」，或者在下面填好再点「把现在填的存起来」</p>';
  const r=$('#apSxReset');if(r)r.style.display=S.sxProvider?'':'none'}
function saveCur(){
  if(!S.apiKey)return toast('先在下面填好 Key');
  if(L().some(useChat))return toast('现在这个已经存过了');
  const v=prompt('给它起个名字',host(S.baseUrl)||'Gemini');if(v==null)return;
  L().push({id:uid(),name:v.trim()||'未命名',provider:S.provider,base:S.baseUrl||'',key:S.apiKey,model:S.model||''});
  saveSettings();render();toast('存好了')}
function menu(id){
  let p=rows().find(x=>x.id===id);if(!p)return;
  const keep=()=>{if(p.fromQ){const n={...p,id:uid()};delete n.fromQ;L().push(n);p=n}return p};
  const ask=(t,v)=>{const r=prompt(t,v||'');return r&&r.trim()?r.trim():null};
  const done=w=>{saveSettings();toast(`${w}换成了「${p.name}」，马上刷新`);setTimeout(()=>location.reload(),900)};
  const acts=[
    ['用在聊天',()=>pickModel(p,p.model,`${p.name} · 用在聊天`,m=>{keep().model=m;Object.assign(S,{provider:p.provider,baseUrl:p.base,apiKey:p.key,model:m});done('聊天')})],
    ['用在秘密',()=>pickModel(p,p.model,`${p.name} · 用在秘密`,m=>{keep().model=m;Object.assign(S,{sxProvider:p.provider,sxBase:p.base,sxKey:p.key,sxModel:m});done('秘密')})],
    ['换默认模型',()=>pickModel(p,p.model,`${p.name} · 默认模型`,m=>{keep().model=m;saveSettings();render()})],
    ['改名字',()=>{const m=ask('新的名字',p.name);if(!m)return;keep().name=m;saveSettings();render()}]];
  if(!p.fromQ)acts.push(['删除',()=>{if(!confirm(`从这里删掉「${p.name}」？正在用的不受影响。`))return;S.apiProfiles=L().filter(x=>x.id!==p.id);saveSettings();render()}]);
  sheet(acts)}

/* ---------- 在这里直接添加 ---------- */
$('#apASave').onclick=()=>{const name=$('#apAN').value.trim(),base=$('#apAU').value.trim(),key=$('#apAK').value.trim();
  if(!key)return toast('Key 要填');
  const g=!base||/googleapis/.test(base);
  const p={id:uid(),name:name||(g?'Gemini':host(base)),provider:g?'gemini':relayP(),base:g?'':base,key,model:''};
  L().push(p);saveSettings();closeModal('apAdd');render();
  pickModel(p,'',`${p.name} · 默认模型`,m=>{p.model=m;saveSettings();render();toast('存好了，点它就能用')})};

/* ---------- 输入框下面的「从列表里选」 ---------- */
const val=k=>{const el=document.querySelector(`[data-k="${k}"]`);return el?el.value:S[k]};
function setVal(k,v){S[k]=v;const el=document.querySelector(`[data-k="${k}"]`);
  if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
  saveSettings();render()}
function attach(k,getP,title){const inp=document.querySelector(`[data-k="${k}"]`);if(!inp||inp.dataset.apSel)return;inp.dataset.apSel=1;
  const anchor=inp.closest('label')||inp;
  anchor.insertAdjacentHTML('afterend',`<button class="pill ghost ap-sel" data-apsel="${k}">从列表里选</button>`);
  anchor.nextElementSibling.onclick=e=>{e.preventDefault();const p=getP();pickModel(p,val(k),title,m=>{setVal(k,m);toast('换好了：'+m)})}}
function mountSel(){
  attach('model',()=>({provider:val('provider'),base:val('baseUrl'),key:val('apiKey')}),'聊天 · 选模型');
  attach('sxModel',()=>({provider:val('sxProvider')||val('provider'),base:val('sxBase')||val('baseUrl'),key:val('sxKey')||val('apiKey')}),'秘密 · 选模型')}

function mount(){mountSel();if($('#apSet'))return;
  const sec=[...$$('.sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('连接'));if(!sec)return;
  sec.querySelector('h3').insertAdjacentHTML('afterend','<div id="apSet"><div class="ap-h">已保存的 API · 点一个切换</div><div id="apList"></div><div class="btns"><button class="pill ghost" id="apNew">＋ 添加一个 API</button><button class="pill ghost" id="apSave">把现在填的存起来</button><button class="pill ghost" id="apSxReset">秘密用回平时的</button></div></div>');
  $('#apNew').onclick=()=>{$('#apAN').value='';$('#apAU').value='';$('#apAK').value='';openModal('apAdd')};
  $('#apSave').onclick=saveCur;
  $('#apSxReset').onclick=()=>{if(!confirm('秘密改回和平时用同一个模型？'))return;
    Object.assign(S,{sxProvider:'',sxKey:'',sxModel:'',sxBase:''});saveSettings();toast('秘密用回平时的模型了，马上刷新');setTimeout(()=>location.reload(),900)};
  $('#apList').onclick=e=>{const b=e.target.closest('[data-ap]');if(b)menu(b.dataset.ap)};
  render()}

mount();
HOOKS.ready.push(mount);
HOOKS.page.push(()=>{setTimeout(()=>{mount();render()},0)});
})();
