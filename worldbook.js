/* ===== 365 · worldbook.js · 世界书 ===== */
(()=>{
if(!Array.isArray(DATA.wbook))DATA.wbook=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('wbook'))LISTS.push('wbook');
const save=()=>saveData('wbook');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const keysOf=v=>(Array.isArray(v)?v:String(v||'').split(/[,，、\n]+/)).map(x=>String(x).trim()).filter(Boolean);
const fill=t=>String(t||'').replace(/\{\{char\}\}/gi,S.hisName).replace(/\{\{user\}\}/gi,'她');
const TPL='下面是{{char}}说话的样子，学的是语气和节奏，不要照抄原句：\n\n她：我饿了\n{{char}}：\n\n她：今天好累\n{{char}}：\n\n她：你是不是不爱我了\n{{char}}：';
const blank=()=>({id:uid(),name:'',mode:'always',keys:[],depth:4,text:'',on:true,t:Date.now()});
let ed=null;

document.head.insertAdjacentHTML('beforeend',`<style>
.wb-it{display:block;width:100%;text-align:left;padding:16px 18px;margin-bottom:12px}
.wb-it b{display:block;font-weight:500;font-size:16px;letter-spacing:2px}
.wb-it small{display:block;font-size:12px;color:var(--accent-t);margin-top:3px;letter-spacing:1px}
.wb-it p{font-size:13px;color:var(--sub);margin-top:6px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.wb-it.off{opacity:.45}
.wb-sum{font-size:12.5px;color:var(--sub);margin:0 4px 14px;letter-spacing:1px}
.wb-on{display:flex;align-items:center;justify-content:space-between;margin:12px 2px}
#wbText{min-height:220px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-wbook"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="me" aria-label="返回">${BACK}</button><h2>世界书</h2><em>world book</em><span class="sp"></span><button class="pill" id="wbAdd">＋ 新的</button></div>
  <div class="sub-line">写给他看的设定。一直带上的每次都在，关键词的聊到才带上。</div>
  <p class="wb-sum" id="wbSum"></p>
  <div id="wbList"></div>
  <button class="pill ghost" id="wbImp" style="display:block;margin:14px auto">导入 .json</button>
  <input type="file" id="wbFile" accept=".json,application/json" hidden>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="wbEd"><div class="mbox">
  <h3 id="wbEdT">编辑条目</h3>
  <label class="f"><span>名字</span><input class="ti" id="wbName"></label>
  <label class="f"><span>什么时候带上</span><select id="wbMode"><option value="always">一直带上</option><option value="key">聊到关键词才带上</option></select></label>
  <div id="wbKeyBox">
    <label class="f"><span>关键词（用逗号隔开）</span><input class="ti" id="wbKeys"></label>
    <label class="f"><span>看最近几条消息</span><input class="ti" id="wbDepth" type="number" min="1" max="20"></label>
  </div>
  <label class="f"><span>内容</span><textarea class="tall" id="wbText"></textarea></label>
  <label class="wb-on"><span>启用这一条</span><input type="checkbox" id="wbOn"></label>
  <div class="mbtns"><button class="pill ghost" id="wbDel">删除</button><button class="pill ghost" data-close="wbEd">取消</button><button class="pill" id="wbSave">保存</button></div>
</div></div>`);

/* ---------- 列表 ---------- */
function sum(){const A=DATA.wbook.filter(e=>e.on!==false),al=A.filter(e=>e.mode!=='key');
  return DATA.wbook.length?`${A.length} 条开着 · 一直带上的 ${al.length} 条，每次大约多带 ${al.reduce((n,e)=>n+String(e.text).length,0)} 字`:'还没有条目'}
function render(){$('#wbSum').textContent=sum();const c=$('#wbCardSum');if(c)c.textContent=sum();
  $('#wbList').innerHTML=DATA.wbook.length?DATA.wbook.map(e=>`<button class="wb-it glass${e.on===false?' off':''}" data-wb="${e.id}"><b>${esc(e.name||'没有名字')}</b><small>${e.on===false?'关着 · ':''}${e.mode==='key'?'关键词：'+esc(keysOf(e.keys).join('、')||'还没填'):'一直带上'}</small><p>${esc(String(e.text).slice(0,90))}</p></button>`).join('')
    :'<div class="empty">点「＋ 新的」写第一条<br>或者导入 Kelivo、酒馆的世界书</div>'}

/* ---------- 编辑 ---------- */
const keyBox=()=>$('#wbKeyBox').style.display=$('#wbMode').value==='key'?'':'none';
function edit(e){ed=e;const had=DATA.wbook.includes(e);
  $('#wbEdT').textContent=had?'编辑条目':'新的条目';
  $('#wbName').value=e.name||'';$('#wbMode').value=e.mode==='key'?'key':'always';
  $('#wbKeys').value=keysOf(e.keys).join('，');$('#wbDepth').value=e.depth||4;
  $('#wbText').value=e.text||'';$('#wbOn').checked=e.on!==false;
  $('#wbDel').style.display=had?'':'none';keyBox();openModal('wbEd')}
$('#wbMode').onchange=keyBox;
$('#wbSave').onclick=async()=>{if(!ed)return;
  const text=$('#wbText').value.trim(),mode=$('#wbMode').value,keys=keysOf($('#wbKeys').value);
  if(!text)return toast('内容还空着');
  if(mode==='key'&&!keys.length)return toast('填一个关键词，或者改成一直带上');
  Object.assign(ed,{name:$('#wbName').value.trim()||text.slice(0,10),mode,keys,depth:Math.max(1,Math.min(20,+$('#wbDepth').value||4)),text,on:$('#wbOn').checked});
  if(!DATA.wbook.includes(ed))DATA.wbook.push(ed);
  await save();closeModal('wbEd');render();toast('存好了')};
$('#wbDel').onclick=async()=>{if(!ed||!confirm(`删除「${ed.name||'这一条'}」？`))return;
  DATA.wbook=DATA.wbook.filter(x=>x!==ed);await save();closeModal('wbEd');render()};
$('#wbAdd').onclick=()=>sheet([['空白的一条',()=>edit(blank())],['说话示例（模板）',()=>edit({...blank(),name:'他说话的样子',text:TPL})]]);
$('#wbList').onclick=e=>{const b=e.target.closest('[data-wb]');if(!b)return;const x=DATA.wbook.find(y=>y.id===b.dataset.wb);if(x)edit(x)};

/* ---------- 导入 Kelivo / 酒馆的 .json ---------- */
$('#wbImp').onclick=()=>$('#wbFile').click();
$('#wbFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const j=JSON.parse(await f.text());
    let E=j.entries||j.items||j.data?.entries||j.lorebook?.entries||j.character_book?.entries||j;
    if(!Array.isArray(E))E=Object.values(E||{});
    const L=E.filter(x=>x&&typeof x==='object'&&(x.content||x.text)).map(x=>{const k=keysOf(x.key||x.keys||x.keywords);
      return {id:uid(),name:String(x.comment||x.name||x.title||'导入的条目'),
        mode:(x.constant||x.alwaysActive||x.always||x.constantActive||!k.length)?'always':'key',keys:k,
        depth:Math.max(1,Math.min(20,+(x.scanDepth||x.depth)||4)),text:String(x.content||x.text),
        on:!(x.disable||x.enabled===false),t:Date.now()}});
    if(!L.length)return toast('这个文件里没找到条目');
    DATA.wbook.push(...L);await save();render();toast(`导入了 ${L.length} 条`)}
  catch(x){toast('读不出来，确定是世界书的 .json 吗')}};

/* ---------- 每次聊天带上 ---------- */
const live=()=>DATA.wbook.filter(e=>e.on!==false&&e.text);
HOOKS.persona.push(()=>{const L=live().filter(e=>e.mode!=='key');if(!L.length)return '';
  return '【世界书】\n'+L.map(e=>fill(e.text)).join('\n\n')});
HOOKS.context.push(()=>{const L=live().filter(e=>e.mode==='key'&&keysOf(e.keys).some(k=>
    DATA.chat.slice(-(e.depth||4)).some(m=>String(m.text||'').toLowerCase().includes(k.toLowerCase()))));
  if(!L.length)return '';return '【相关设定】\n'+L.map(e=>fill(e.text)).join('\n\n')});

/* ---------- 「我的」里的卡片 ---------- */
function card(){let c=$('#wbCard');
  if(!c){$('#page-me .wrap')?.insertAdjacentHTML('beforeend','<div class="sec glass me-go" id="wbCard" data-go="wbook"><h3>世界书<em>world book</em></h3><p class="hint" id="wbCardSum"></p></div>');c=$('#wbCard')}
  const a=$('#page-me .me-go[data-go="msgset"]');if(a&&c&&a.nextElementSibling!==c)a.after(c);
  render()}
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.wbook))DATA.wbook=[];card()});
HOOKS.page.push(n=>{if(n==='me')card();if(n==='wbook')render()});
})();
