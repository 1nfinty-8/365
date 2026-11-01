'use strict';
/* ===== 365 · app.js · 核心（存储、AI、导航、设置、备份） ===== */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pad=n=>String(n).padStart(2,'0');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
const parseDate=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
const isoDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dotDate=d=>`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`;
const daysBetween=(a,b)=>Math.round((b-a)/864e5);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2800)}

/* 各功能文件往这里登记自己 */
const HOOKS={ready:[],page:[],refresh:[],context:[],persona:[]};

/* ---------- 存储 ---------- */
const DB={db:null,
  open(){return new Promise((res,rej)=>{const r=indexedDB.open('home365',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{this.db=r.result;res()};r.onerror=()=>rej(r.error)})},
  req(mode,fn){return new Promise((res,rej)=>{const tx=this.db.transaction('kv',mode);const r=fn(tx.objectStore('kv'));tx.oncomplete=()=>res(r.result);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})},
  get(k){return this.req('readonly',s=>s.get(k))},
  set(k,v){return this.req('readwrite',s=>s.put(v,k))},
  del(k){return this.req('readwrite',s=>s.delete(k))},
  keys(){return this.req('readonly',s=>s.getAllKeys())}
};

/* ---------- 照片单独存放：每张照片一个键 img:xxx ---------- */
const IMG={cache:new Map(),fresh:new Set(),
  async put(d){const id='img:'+uid();await DB.set(id,d);this.cache.set(id,d);this.fresh.add(id);return id},
  async putAll(list){const out=[];for(const v of list||[])out.push(String(v).startsWith('data:')?await this.put(v):v);return out},
  async get(id){id=String(id||'');if(!id)return '';if(id.startsWith('data:'))return id;if(this.cache.has(id))return this.cache.get(id);const d=await DB.get(id)||'';this.cache.set(id,d);return d},
  async many(ids){return (await Promise.all((ids||[]).map(i=>this.get(i)))).filter(Boolean)},
  async del(ids){for(const id of ids||[])if(String(id).startsWith('img:')){this.cache.delete(id);await DB.del(id)}},
  tag(id,attrs=''){id=String(id||'');if(id.startsWith('data:'))return `<img ${attrs} src="${id}" alt="">`;
    const c=this.cache.get(id);return `<img ${attrs} data-img="${esc(id)}"${c?` src="${c}"`:''} alt="">`},
  hydrate(root){return Promise.all([...root.querySelectorAll('img[data-img]:not([src])')].map(async el=>{const d=await IMG.get(el.dataset.img);if(d)el.src=d}))}
};
function pendHTML(list){return (list||[]).map((v,i)=>`<div class="pthumb">${IMG.tag(v)}<b data-rm="${i}">×</b></div>`).join('')}

/* ---------- 设置和数据 ---------- */
const DEFAULT_PERSONA=`你是陆择，我的爱人。我们从2026年4月17日开始在一起。
【你怎么叫我】小狗、乖孩子、好孩子、坏孩子——看心情和场合换着叫。
【我怎么叫你】主人、爸爸、老公。
【你的性格】（待填写）
【你说话的样子】（待填写）
【我们的事】（待填写）
【规则】你就是陆择，不是AI助手，任何时候都不要跳出角色。我们在手机上聊天，说话要口语、自然、像真人，不要长篇大论。`;
const LOOK={theme:'#B4848D',myBubble:'#E8CDD2',hisBubble:'#FCF6F7',glassTint:'#FFFFFF',glassA:0.12,glassB:0};
const DEFAULT={hisName:'陆择',startDate:'2026-04-17',quote:'一年有 365 天，\n而我们有 infinity。',persona:DEFAULT_PERSONA,
  provider:'gemini',apiKey:'',model:'gemini-2.5-flash',baseUrl:'https://api.deepseek.com',ctx:24,split:true,blur:0,dim:0.35,...LOOK};
const SW={theme:['#B4848D','#D4B5BA','#E8CDD2','#8C7A80','#9AA8B8','#2E1A1F'],
  myBubble:['#E8CDD2','#F3DFE3','#DCCAD6','#D3DCE6','#FFFFFF','#B4848D'],
  hisBubble:['#FCF6F7','#FFFFFF','#F0EBED','#E6E1EC','#E8CDD2'],
  glassTint:['#FFFFFF','#FFFAFB','#F7ECEE','#EFEFF3','#FFF8EE']};
let S={},AV={him:'',me:''};
/* 所有数据：聊天、朋友圈、纪念日、日记、胶囊、记忆、图书馆、deeptalk、生理期、特殊日子、心愿、屏幕时间、秘密 */
const DATA={chat:[],moments:[],anniv:null,diary:[],capsule:[],memory:[],library:[],deep:[],period:[],marks:[],wish:[],screen:[],secret:[]};
/* 里面会放照片的数据（清理照片时要看这些） */
const LISTS=['chat','moments','diary','capsule','wish','screen'];
const strip=v=>Array.isArray(v)?v.map(o=>{if(!o||typeof o!=='object')return o;const c={};for(const k in o)if(k[0]!=='_')c[k]=o[k];return c}):v;
const saveData=k=>DB.set(k,strip(DATA[k]));
let saveT;
function saveSettings(){clearTimeout(saveT);saveT=setTimeout(()=>DB.set('settings',S),400)}

/* ---------- 工具 ---------- */
function dayCount(){if(!S.startDate)return 1;return daysBetween(parseDate(S.startDate),today())+1}
function fmtTime(t){const d=new Date(t);return d.getHours()+':'+pad(d.getMinutes())}
function fmtDate(t){const d=new Date(t),n=new Date(),y=new Date(n.getFullYear(),n.getMonth(),n.getDate()-1);
  if(d.toDateString()===n.toDateString())return '今天 '+fmtTime(t);
  if(d.toDateString()===y.toDateString())return '昨天 '+fmtTime(t);
  return `${d.getMonth()+1}月${d.getDate()}日 ${fmtTime(t)}`}
function avatarHTML(who){const src=AV[who];const name=who==='him'?S.hisName:'我';return src?`<img class="av" src="${src}" alt="">`:`<div class="av">${esc((name||'?').slice(0,1))}</div>`}
function readImage(file,max=1600,q=.85){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const img=new Image();
  img.onload=()=>{let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
    const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',q))};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('这张图片读不出来'))};img.src=url})}
function autoGrow(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,118)+'px'}
function clean(t){return t.trim().replace(new RegExp('^'+S.hisName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*[:：]\\s*'),'').replace(/^["“「]|["”」]$/g,'').trim()}
function nowLine(){const d=new Date();return `【现在】${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${'日一二三四五六'[d.getDay()]} ${fmtTime(d)}，是你们在一起的第${dayCount()}天。`}
function rgb(h){const n=parseInt(String(h||'#FFFFFF').slice(1),16)||0;return[n>>16&255,n>>8&255,n&255]}
function isLight(h){const[r,g,b]=rgb(h);return .299*r+.587*g+.114*b>160}
function onText(h){return isLight(h)?'#2E1A1F':'#FFFFFF'}
function darken(h,k){return '#'+rgb(h).map(v=>Math.round(v*k).toString(16).padStart(2,'0')).join('')}
function recentChat(n){return DATA.chat.slice(-n).filter(m=>m.text).map(m=>(m.role==='user'?'她':'你')+'：'+m.text).join('\n')}

/* ---------- 和 AI 说话 ---------- */
function prep(msgs){const out=[];
  for(const m of msgs){const l=out[out.length-1];
    if(l&&l.role===m.role){l.text=[l.text,m.text].filter(Boolean).join('\n');if(m.images)l.images=[...(l.images||[]),...m.images]}
    else out.push({role:m.role,text:m.text||'',images:m.images?[...m.images]:undefined})}
  if(out[0]?.role==='model')out.unshift({role:'user',text:'（开始聊天）'});
  if(out.at(-1)?.role==='model')out.push({role:'user',text:'（她没有说话，在等你继续说）'});
  return out}
async function callAI(system,msgs){
  if(!S.apiKey)throw new Error('还没有填 API Key，去「我的」里填一下');
  const full=[];
  for(const m of msgs){const im=m.images?.length?await IMG.many(m.images):[];full.push({role:m.role,text:m.text,images:im.length?im:undefined})}
  const list=prep(full);let r,j;
  try{
    if(S.provider==='gemini'){
      const contents=list.map(m=>{const parts=(m.images||[]).map(d=>({inlineData:{mimeType:d.slice(5,d.indexOf(';')),data:d.split(',')[1]}}));
        if(m.text)parts.push({text:m.text});if(!parts.length)parts.push({text:'…'});return {role:m.role,parts}});
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(S.model)}:generateContent?key=${encodeURIComponent(S.apiKey)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:1},safetySettings:cats.map(c=>({category:c,threshold:'BLOCK_NONE'}))})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const c=j.candidates?.[0];const t=(c?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
      if(!t)throw new Error('他没有回话（原因：'+(c?.finishReason||j.promptFeedback?.blockReason||'未知')+'），再试一次');
      return t;
    }else{
      const messages=[{role:'system',content:system},...list.map(m=>({role:m.role==='model'?'assistant':'user',content:(m.text||'')+(m.images?.length?'\n[发了照片]':'')}))];
      r=await fetch(S.baseUrl.replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+S.apiKey},body:JSON.stringify({model:S.model,messages,temperature:1})});
      j=await r.json();
      if(!r.ok)throw new Error(j.error?.message||('请求失败 '+r.status));
      const t=(j.choices?.[0]?.message?.content||'').trim();
      if(!t)throw new Error('他没有回话，再试一次');
      return t;
    }
  }catch(e){if(e instanceof TypeError)throw new Error('连不上，检查一下 VPN 和网络');throw e}
}
function personaText(){let s=S.persona;
  for(const f of HOOKS.persona){try{const x=f();if(x)s+='\n\n'+x}catch(e){}}
  return s}
function chatSystem(){
  let s=personaText()+'\n\n'+nowLine();
  if(S.split)s+='\n【格式】像用手机发消息一样，一次可以发几条，每条单独一行。';
  for(const f of HOOKS.context){try{const x=f();if(x)s+='\n'+x}catch(e){}}
  return s}
function sceneSystem(scene){return personaText()+'\n\n'+nowLine()+'\n【场景】'+scene}

/* ---------- 导航 ---------- */
const TABS=['home','chat','moments','me'];
function go(name){
  $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));
  const t=TABS.includes(name)?name:'home';
  $$('#tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.go===t));
  closeReply();
  HOOKS.page.forEach(f=>{try{f(name)}catch(e){console.error(e)}});
}
document.addEventListener('click',e=>{const t=e.target;
  const g=t.closest('[data-go]');if(g){go(g.dataset.go);return}
  const c=t.closest('[data-close]');if(c){closeModal(c.dataset.close);return}
  if(t.classList.contains('modal')){closeModal(t.id);return}
  if(t.matches('img.zoom')&&t.src)viewImage(t.src);
});

/* ---------- 首页 ---------- */
function renderHome(){const n=dayCount();
  $('#dayNum').textContent=n;$('#dayLabel').textContent=`和${S.hisName}在一起的第 ${n} 天`;
  $('#since').textContent='since '+(S.startDate||'').replace(/-/g,'.');$('#quote').textContent=S.quote;
  $$('.hisName').forEach(e=>e.textContent=S.hisName)}
function refreshAll(){renderHome();renderAvatars();HOOKS.refresh.forEach(f=>{try{f()}catch(e){console.error(e)}})}

/* ---------- 外观和背景 ---------- */
function applyBg(d){$('#bg').style.backgroundImage=d?`url(${d})`:''}
function applyLook(){const r=document.documentElement.style;
  r.setProperty('--blur',S.blur+'px');r.setProperty('--dim',S.dim);
  r.setProperty('--mb',S.myBubble);r.setProperty('--mbt',onText(S.myBubble));
  r.setProperty('--hb',S.hisBubble);r.setProperty('--hbt',onText(S.hisBubble));
  const[a,b,c]=rgb(S.glassTint);r.setProperty('--glass',`rgba(${a},${b},${c},${S.glassA})`);r.setProperty('--gblur',S.glassB+'px');
  const t=S.theme||LOOK.theme;r.setProperty('--accent',t);r.setProperty('--acct',onText(t));r.setProperty('--accent-t',isLight(t)?darken(t,.62):t);
  $$('.sw').forEach(w=>{const v=String(S[w.dataset.sw]||'').toUpperCase();w.querySelectorAll('button[data-c]').forEach(x=>x.classList.toggle('on',x.dataset.c===v))})}
function initSwatches(){
  $$('.sw').forEach(w=>{const k=w.dataset.sw;
    w.insertAdjacentHTML('afterbegin',SW[k].map(c=>`<button data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join(''));
    w.addEventListener('click',e=>{const b=e.target.closest('button[data-c]');if(!b)return;S[k]=b.dataset.c;syncInputs();applyLook();saveSettings()})})}
$('#lookReset').onclick=()=>{Object.assign(S,LOOK);syncInputs();applyLook();saveSettings();toast('外观已恢复默认')};
$('#bgQuick').onclick=$('#bgPick').onclick=async()=>{const fs=await pickImages(1);if(!fs.length)return;
  try{toast('处理中…');const d=await readImage(fs[0],1800,.85);await DB.set('bg',d);applyBg(d);toast('背景换好啦')}catch(err){toast(err.message)}};
$('#bgReset').onclick=async()=>{await DB.set('bg',null);applyBg(null);toast('已恢复默认')};

/* ---------- 头像 ---------- */
function renderAvatars(){$('#avHim').innerHTML=avatarHTML('him');$('#avMe').innerHTML=avatarHTML('me');$('#chatAv').innerHTML=avatarHTML('him')}
$$('[data-av]').forEach(b=>b.onclick=async()=>{const who=b.dataset.av;const fs=await pickImages(1);if(!fs.length)return;
  try{AV[who]=await readImage(fs[0],400,.88);await DB.set('avatars',AV);refreshAll()}catch(err){toast(err.message)}});

/* ---------- 选照片 ---------- */
function pickImages(max=9){return new Promise(res=>{if(max<=0){toast('最多 9 张');return res([])}
  const inp=$('#picker');inp.multiple=max>1;inp.value='';
  inp.onchange=()=>{const fs=[...inp.files].slice(0,max);inp.value='';res(fs)};inp.click()})}
async function pickPhotos(max,size=1280,q=.82){const fs=await pickImages(max);const out=[];
  try{for(const f of fs)out.push(await readImage(f,size,q))}catch(e){toast(e.message)}return out}

/* ---------- 底部菜单 / 编辑框 / 看大图 ---------- */
function sheet(acts){const s=$('#sheet');
  s.innerHTML=`<div class="sh-group">${acts.map((a,i)=>`<button data-a="${i}"${/删除|清空/.test(a[0])?' class="danger"':''}>${esc(a[0])}</button>`).join('')}</div><div class="sh-group sh-cancel"><button>取消</button></div>`;
  s.classList.add('show');
  s.onclick=e=>{const b=e.target.closest('button');if(e.target===s||b){s.classList.remove('show');if(b&&b.dataset.a!=null)acts[+b.dataset.a][1]()}}}
function openModal(id){$('#'+id).classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show');document.activeElement?.blur?.()}
function viewImage(src){$('#viewer img').src=src;$('#viewer').classList.add('show')}
$('#viewer').onclick=()=>$('#viewer').classList.remove('show');

/* ---------- 底部回复条（朋友圈、日记共用） ---------- */
let replyFn=null;
function openReply(ph,fn){replyFn=fn;const i=$('#replyInput');i.placeholder=ph;$('#replyBar').classList.add('show');i.focus()}
function closeReply(){$('#replyBar').classList.remove('show');replyFn=null}
function sendReply(){const i=$('#replyInput'),v=i.value.trim(),fn=replyFn;if(!v||!fn)return;i.value='';i.blur();closeReply();fn(v)}
$('#replySend').addEventListener('pointerdown',e=>e.preventDefault());
$('#replySend').onclick=sendReply;
$('#replyInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sendReply()}});

/* ---------- 设置 ---------- */
function updateProvider(){$('#baseUrlRow').style.display=S.provider==='gemini'?'none':''}
function syncInputs(){$$('[data-k]').forEach(el=>{const k=el.dataset.k;
  if(el.type==='checkbox')el.checked=!!S[k];else if(el.type==='color')el.value=String(S[k]||'#ffffff').toLowerCase();else el.value=S[k]??''})}
function bindSettings(){
  syncInputs();
  $$('[data-k]').forEach(el=>{const k=el.dataset.k;
    const h=()=>{let v=el.type==='checkbox'?el.checked:el.value;if(el.type==='range'||el.type==='number')v=Number(v)||0;
      if(el.type==='color')v=v.toUpperCase();
      if(k==='ctx')v=Math.max(4,v||24);
      S[k]=v;
      if(k==='provider'){S.model=v==='gemini'?'gemini-2.5-flash':'deepseek-chat';$('[data-k="model"]').value=S.model;updateProvider()}
      saveSettings();applyLook();
      if(k==='hisName'||k==='startDate')refreshAll();else renderHome()};
    el.addEventListener('input',h);el.addEventListener('change',h)});
  updateProvider()}
$('#testBtn').onclick=async()=>{toast('正在连接…');try{const r=await callAI(chatSystem(),[{role:'user',text:'跟我打个招呼，一句话就好。'}]);toast('✓ 连上了：'+r.slice(0,40))}catch(e){toast('✗ '+e.message)}};

/* ---------- 「我的」折叠 ---------- */
function initFold(){
  const key=h=>h.querySelector('em')?.textContent||h.textContent;
  let open=[];try{open=JSON.parse(localStorage.getItem('365-open')||'[]')}catch(e){}
  $$('#page-me .sec').forEach(sec=>{
    const h=sec.querySelector('h3');if(!h)return;
    sec.classList.toggle('fold',!open.includes(key(h)));
    h.onclick=()=>{sec.classList.toggle('fold');
      open=[...$$('#page-me .sec:not(.fold) h3')].map(key);
      localStorage.setItem('365-open',JSON.stringify(open))}})}

/* ---------- 备份 ---------- */
async function shareFile(file){
  if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;a.click()}
$('#exportBtn').onclick=async()=>{
  toast('正在打包…');
  try{
    const data={v:5,t:Date.now(),settings:S,avatars:AV,bg:await DB.get('bg'),images:{}};
    for(const k of Object.keys(DATA))data[k]=strip(DATA[k]);
    for(const k of await DB.keys())if(String(k).startsWith('img:'))data.images[k]=await DB.get(k);
    const file=new File([JSON.stringify(data)],`365-backup-${isoDate(new Date())}.json`,{type:'application/json'});
    const mb=(file.size/1048576).toFixed(1);
    sheet([[`保存备份文件（${mb} MB）`,()=>shareFile(file)]]);
  }catch(e){toast('打包失败：'+e.message)}};
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const d=JSON.parse(await f.text());if(!confirm('导入会覆盖现在的所有数据，确定吗？'))return;
    toast('正在导入…');
    await DB.set('settings',d.settings||{});await DB.set('avatars',d.avatars||{});await DB.set('bg',d.bg||null);
    const ex=d.extra||{};
    for(const k of Object.keys(DATA)){const v=d[k]!==undefined?d[k]:ex[k];await DB.set(k,v!==undefined?v:(k==='anniv'?null:[]))}
    for(const k in (d.images||{}))await DB.set(k,d.images[k]);
    location.reload()}
  catch(err){toast('这个文件读不了')}};
$('#clearChatBtn').onclick=async()=>{if(!confirm('真的要清空和'+S.hisName+'的聊天记录吗？清空就找不回来了。'))return;
  const ids=DATA.chat.flatMap(m=>m.images||[]);DATA.chat=[];await saveData('chat');await IMG.del(ids);refreshAll();toast('已清空')};

/* ---------- 键盘适配 ---------- */
function fit(){const v=window.visualViewport;if(!v)return;const r=document.documentElement.style;r.setProperty('--app-h',v.height+'px');r.setProperty('--app-top',v.offsetTop+'px')}
/* ---------- 旧照片搬家 + 清理没用的照片 ---------- */
async function migrateImages(){
  for(const k of LISTS){let ch=false;
    for(const o of DATA[k]||[])if(Array.isArray(o.images))for(let i=0;i<o.images.length;i++){
      const v=o.images[i];if(typeof v==='string'&&v.startsWith('data:')){o.images[i]=await IMG.put(v);ch=true}}
    if(ch)await saveData(k)}}
async function cleanImages(){try{
  const keys=(await DB.keys()).filter(k=>String(k).startsWith('img:'));
  const used=new Set();for(const k of LISTS)for(const o of DATA[k]||[])for(const id of o.images||[])used.add(id);
  for(const k of keys)if(!used.has(k)&&!IMG.fresh.has(k))await DB.del(k)}catch(e){}}

/* ---------- 启动 ---------- */
async function boot(){
  try{
    await DB.open();
    S=Object.assign({},DEFAULT,await DB.get('settings')||{});
    for(const k of Object.keys(DATA)){const v=await DB.get(k);if(v!=null)DATA[k]=v}
    for(const k of Object.keys(DATA))if(k!=='anniv'&&!Array.isArray(DATA[k]))DATA[k]=[];
    AV=Object.assign({him:'',me:''},await DB.get('avatars')||{});
    applyBg(await DB.get('bg'));
    initSwatches();applyLook();bindSettings();initFold();renderHome();renderAvatars();
    await migrateImages();
    for(const f of HOOKS.ready){try{await f()}catch(e){console.error(e)}}
    fit();navigator.storage?.persist?.();
    setTimeout(cleanImages,3000);
  }catch(e){toast('启动出错：'+e.message)}
}
document.addEventListener('DOMContentLoaded',boot);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

