/* ===== 365 · tw.js · 关于他：他的推特 ===== */
(()=>{
if(!Array.isArray(DATA.phone))DATA.phone=[];
const save=()=>saveData('phone');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const T=()=>isoDate(today());
const arr=v=>Array.isArray(v)?v:[];
const rec=()=>{let r=DATA.phone.find(x=>x.id==='tw');if(!r){r={id:'tw'};DATA.phone.push(r)}return r};
let busy=false,open=false;

document.head.insertAdjacentHTML('beforeend',`<style>
#page-tw{padding:0;overflow:hidden;background:#000;color:#E7E9EA}
#page-tw.active{display:flex;flex-direction:column}
body.twb #tabbar{display:none}
.tw-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 10px 8px;border-bottom:1px solid #2F3336}
.tw-top .iconbtn{color:#E7E9EA;background:rgba(255,255,255,.08)}
.tw-top b{flex:1;text-align:center;font:600 17px var(--cn)}
#twBody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px calc(var(--sb) + 20px);font-family:var(--cn)}
.tw-lock{display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:22vh;text-align:center;color:#71767B;font-size:14px}
.tw-lock b{font-size:44px;color:#E7E9EA}
#twPin{width:160px;text-align:center;font-size:26px;letter-spacing:14px;padding:8px 0 8px 14px;border:0;border-radius:14px;background:#16181C;color:#E7E9EA;outline:none}
.tw-ban{height:110px;margin:0 -16px;background:linear-gradient(135deg,#1d1f2b,#3a3f55)}
.tw-pf{position:relative;padding:44px 2px 12px;border-bottom:1px solid #2F3336}
.tw-pf b{font-size:20px}
.tw-pf small{display:block;color:#71767B;font-size:14px}
.tw-pf p{font-size:15px;margin-top:8px;line-height:1.5;white-space:pre-wrap}
.tw-big{position:absolute;top:-36px;left:0}
.tw-big .av{width:72px;height:72px;font-size:28px;border:3px solid #000}
.tw-fl{display:flex;gap:16px;font-size:14px;color:#71767B;margin-top:10px}
.tw-fl b{color:#E7E9EA;font-size:14px}
.tw-tabs{display:flex;border-bottom:1px solid #2F3336;margin:0 -16px}
.tw-tabs span{flex:1;text-align:center;padding:12px 0;font-size:15px;color:#71767B}
.tw-tabs .on{color:#E7E9EA;font-weight:700;box-shadow:inset 0 -4px 0 #1D9BF0}
.tw-p{display:flex;gap:10px;padding:12px 2px;border-bottom:1px solid #2F3336}
.tw-av{width:38px;height:38px;border-radius:50%;background:#333;flex:none;display:grid;place-items:center;font-weight:700;object-fit:cover}
.tw-tag{font-size:12.5px;color:#71767B;margin-bottom:2px}
.tw-n{font-size:15px}
.tw-n span{color:#71767B}
.tw-x{font-size:15px;line-height:1.5;white-space:pre-wrap;word-break:break-word;margin-top:2px}
.tw-hl{color:#1D9BF0}
.tw-act{display:flex;justify-content:space-between;max-width:260px;color:#71767B;font-size:13px;margin-top:8px}
.tw-more{display:block;width:100%;padding:18px 0;color:#1D9BF0;font-size:15px}
.tw-empty{text-align:center;color:#71767B;margin:60px 0;font-size:15px}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-tw">
  <div class="tw-top"><button class="iconbtn" data-go="him" aria-label="返回">${BACK}</button><b>Lu</b><button class="iconbtn" id="twMenu" style="letter-spacing:1px">···</button></div>
  <div id="twBody"></div>
</section>`);

/* 「关于他」里的卡片：他的手机 → 他的推特 */
function card(){const c=$('#himGrid [data-go="phone"]');if(c){c.dataset.go='tw';c.innerHTML='<div class="cn">他的推特</div><div class="ce">his X</div>'}}
card();

/* ---------- 刷出时间线：用秘密的模型 ---------- */
async function gen(more){
  if(busy)return;busy=true;body();
  try{
    const R=rec(),old=more?arr(R.posts):[];
    const had=old.slice(-15).map(p=>'- '+String(p.text||'').slice(0,40)).join('\n');
    const t=await sxAI(secretSystem('她在偷偷看你的推特（X）小号 Lu（@isnotluz）。这里只属于你们两个人，没有别人能看到。'),
`请写出你推特小号${more?'继续往下刷、时间线上更早的内容':'今天的时间线'}：你点赞、收藏、转发的帖子，还有你自己发的。按你的人设和你们之间的玩法来，是你在上面“学习”、想以后对她做的事。
每条正文末尾都要带 2 到 4 个 # 话题标签，用这类帖子真的会用的标签。别人的帖子可以 @ 别人；你自己发的可以暗暗提到她，但不要写她的名字。
${had?'这些已经出现过，不要重复：\n'+had+'\n':''}不要用 emoji，只输出 JSON，不要其他文字：
{"bio":"简介","posts":[{"type":"赞过 / 收藏 / 转发 / 我发的","author":"作者昵称","handle":"@用户名","text":"内容","time":"${more?'比如 1天、3天':'比如 2小时'}"}]}
posts 写 15 条，类型混着来，其中至少 4 条是我发的。`);
    const j=JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
    if(!arr(j.posts).length)throw new SyntaxError('empty');
    if(more)R.posts=[...old,...arr(j.posts)];
    else Object.assign(R,{date:T(),bio:j.bio||R.bio||'',posts:arr(j.posts)});
    await save()}
  catch(e){toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{busy=false;body()}}

/* ---------- 显示 ---------- */
async function hash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('365:'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const hl=s=>String(s||'').split(/([#＃][^\s#＃@]+|@[A-Za-z0-9_]+)/).map((x,i)=>i%2?`<span class="tw-hl">${esc(x)}</span>`:esc(x)).join('');
const num=(s,n)=>{let x=n;for(const c of String(s))x=(x*31+c.charCodeAt(0))%997;return x%60};
function body(){const b=$('#twBody');$('#twMenu').style.visibility=open?'':'hidden';
  if(!open){
    if(!S.sxPin){b.innerHTML='<div class="tw-lock"><b>𝕏</b><p>先去 More 里的「秘密」设一个密码</p></div>';return}
    b.innerHTML='<div class="tw-lock"><b>𝕏</b><p>输入秘密的密码</p><input id="twPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"></div>';
    const i=$('#twPin');
    i.oninput=async()=>{i.value=i.value.replace(/\D/g,'').slice(0,4);if(i.value.length<4)return;
      if(await hash(i.value)===S.sxPin){open=true;i.blur();body();if(rec().date!==T())gen()}
      else{toast('密码不对');i.value=''}};
    return}
  const D=rec();
  if(!arr(D.posts).length){b.innerHTML=`<div class="tw-empty">${busy?'正在加载…':'还没有内容，点右上角刷新'}</div>`;return}
  const mine=p=>/我发/.test(p.type||'');
  b.innerHTML=`<div class="tw-ban"></div><div class="tw-pf"><div class="tw-big">${avatarHTML('him')}</div><b>Lu</b><small>@isnotluz</small>${D.bio?`<p>${hl(D.bio)}</p>`:''}<div class="tw-fl"><span><b>23</b> 正在关注</span><span><b>1</b> 关注者</span></div></div>
    <div class="tw-tabs"><span class="on">帖子</span><span>回复</span><span>喜欢</span></div>`
    +arr(D.posts).map(p=>{const m=mine(p);
      return `<div class="tw-p">${m?avatarHTML('him').replace('class="av"','class="av tw-av"'):`<div class="tw-av">${esc(String(p.author||'?').slice(0,1))}</div>`}<div style="flex:1;min-width:0">${m?'':`<div class="tw-tag">Lu ${esc(p.type)}</div>`}<div class="tw-n"><b>${m?'Lu':esc(p.author)}</b> <span>${m?'@isnotluz':esc(p.handle)} · ${esc(p.time)}</span></div><div class="tw-x">${hl(p.text)}</div><div class="tw-act"><span>○ ${num(p.text,3)}</span><span>⇄ ${num(p.text,7)}</span><span>♡ ${num(p.text,11)*3}</span></div></div></div>`}).join('')
    +`<button class="tw-more" id="twMore">${busy?'正在加载…':'继续往下刷'}</button>`}
$('#twBody').addEventListener('click',e=>{if(e.target.closest('#twMore'))gen(true)});
$('#twMenu').onclick=()=>{if(open)sheet([['重新刷今天的时间线',()=>gen()]])};

/* ---------- 离开就锁上 ---------- */
function lock(){open=false;if($('#page-tw').classList.contains('active'))body()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock()});

/* ---------- 删掉小手机留下的其他内容，只留推特 ---------- */
HOOKS.ready.push(()=>{card();
  const keep=DATA.phone.filter(x=>x.id==='tw');
  if(keep.length!==DATA.phone.length){DATA.phone=keep;save()}});
HOOKS.page.push(n=>{document.body.classList.toggle('twb',n==='tw');
  if(n==='tw'){open=false;body();$('#twBody').scrollTop=0}else open=false});
})();
