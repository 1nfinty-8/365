/* ===== 365 · apis.js · 存好几个 API，点一下切换 ===== */
(()=>{
const host=u=>{try{return new URL(u).host}catch(e){return String(u||'')}};
const tail=k=>'…'+String(k||'').slice(-4);
const isG=(p,b)=>p==='gemini'||/googleapis/.test(b||'');
const relayP=()=>S.provider&&S.provider!=='gemini'?S.provider:(S.sxProvider&&S.sxProvider!=='gemini'?S.sxProvider:'openai');
const L=()=>(S.apiProfiles=Array.isArray(S.apiProfiles)?S.apiProfiles:[]);
const same=(p,k,b)=>p.key===k&&host(p.base)===host(b);

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
</style>`);

function rows(){const P=[...L()];
  (S.quotaList||[]).forEach(q=>{if(q.key&&!P.some(p=>same(p,q.key,q.base)))
    P.push({id:'q_'+q.id,name:q.name||'其他',base:q.base,key:q.key,provider:isG('',q.base)?'gemini':relayP(),model:'',fromQ:1})});
  return P}
const useChat=p=>p.key===S.apiKey&&(p.model||'')===(S.model||'');
const useSx=p=>!!S.sxProvider&&p.key===(S.sxKey||S.apiKey)&&(p.model||'')===(S.sxModel||'');
function render(){const el=$('#apList');if(!el)return;const R=rows();
  el.innerHTML=R.length?R.map(p=>`<button class="ap-it" data-ap="${esc(p.id)}"><span class="ap-l"><b>${esc(p.name)}</b><small>${esc(p.model||'还没填模型')} · ${esc(isG(p.provider,p.base)?'Gemini 官方':host(p.base))} · ${tail(p.key)}</small></span>${useChat(p)?'<i class="ap-tag">聊天</i>':''}${useSx(p)?'<i class="ap-tag">秘密</i>':''}${p.fromQ?'<i class="ap-tag g">额度里的</i>':''}</button>`).join('')
    :'<p class="hint">还没有存。先在下面填好，再点「把现在填的存起来」</p>';
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
  const need=()=>{if(p.model)return true;const m=ask('这个 API 用哪个模型？（照中转站后台写的模型名字填）');if(!m)return false;keep().model=m;saveSettings();return true};
  const done=w=>{saveSettings();toast(`${w}换成了「${p.name}」，马上刷新`);setTimeout(()=>location.reload(),900)};
  const acts=[['用在聊天',()=>{if(!need())return;keep();Object.assign(S,{provider:p.provider,baseUrl:p.base,apiKey:p.key,model:p.model});done('聊天')}],
    ['用在秘密',()=>{if(!need())return;keep();Object.assign(S,{sxProvider:p.provider,sxBase:p.base,sxKey:p.key,sxModel:p.model});done('秘密')}],
    ['改模型',()=>{const m=ask('模型名字',p.model);if(!m)return;keep().model=m;saveSettings();render()}],
    ['改名字',()=>{const m=ask('新的名字',p.name);if(!m)return;keep().name=m;saveSettings();render()}]];
  if(!p.fromQ)acts.push(['删除',()=>{if(!confirm(`从这里删掉「${p.name}」？正在用的不受影响。`))return;S.apiProfiles=L().filter(x=>x.id!==p.id);saveSettings();render()}]);
  sheet(acts)}
function mount(){if($('#apSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('连接'));if(!sec)return;
  sec.querySelector('h3').insertAdjacentHTML('afterend','<div id="apSet"><div class="ap-h">已保存的 API · 点一个切换</div><div id="apList"></div><div class="btns"><button class="pill ghost" id="apSave">＋ 把现在填的存起来</button><button class="pill ghost" id="apSxReset">秘密用回平时的</button></div></div>');
  $('#apSave').onclick=saveCur;
  $('#apSxReset').onclick=()=>{if(!confirm('秘密改回和平时用同一个模型？'))return;
    Object.assign(S,{sxProvider:'',sxKey:'',sxModel:'',sxBase:''});saveSettings();toast('秘密用回平时的模型了，马上刷新');setTimeout(()=>location.reload(),900)};
  $('#apList').onclick=e=>{const b=e.target.closest('[data-ap]');if(b)menu(b.dataset.ap)};
  render()}

mount();
HOOKS.ready.push(mount);
HOOKS.page.push(n=>{if(n==='me'){mount();render()}});
})();
