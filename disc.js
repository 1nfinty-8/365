/* ===== 365 · disc.js · 关于他：他想说的（唱片） ===== */
(()=>{
if(!Array.isArray(DATA.disc))DATA.disc=[];
Object.assign(DEFAULT,{dcTts:'gemini',dcKey:'',dcModel:'',dcVoice:'',dcBase:'',dcStyle:'',dcElKey:'',dcElVoice:'',dcElModel:''});
const save=()=>saveData('disc');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const PLAY='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const PAUSE='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
const KIND={msg:'留言',song:'唱给你',read:'念给你',mine:'我放的'};
const EN={msg:'VOICE.',song:'SONG.',read:'WORDS.',mine:'MINE.'};
const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const p2=n=>String(n).padStart(2,'0');
const tm=s=>{s=isFinite(s)?Math.max(0,Math.floor(s)):0;return Math.floor(s/60)+':'+p2(s%60)};
const SPD=[.75,1,1.25,1.5,2];
let page='',cur=0,rot=0,vel=0,busy=false,face=null,raf=0,lt=0,pd=null,pface=null,pang=0,pl=0,praf=0,si=1,ink='#2F2A2C',dragW=false,lv=0,spotT=0;
const A=new Audio();A.preload='auto';

['mr-de-haviland/400.css','cormorant-garamond/400.css','cormorant-garamond/500.css','cormorant-garamond/300-italic.css'].forEach(f=>
  document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/${f}">`));
document.head.insertAdjacentHTML('beforeend',`<style>
body.dcp #tabbar{display:none}
#himGrid .hm-disc{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
.dc-stage{--S:min(58vw,270px);position:relative;width:calc(var(--S)*1.5);height:calc(var(--S) + 40px);margin:34px auto 0;touch-action:none;-webkit-user-select:none;user-select:none}
.dc-shadow{position:absolute;left:2%;right:0;top:calc(var(--S) + 8px);height:26px;border-radius:50%;background:radial-gradient(closest-side,rgba(50,60,80,.22),transparent);filter:blur(5px)}
.dc-case,.dc-front{position:absolute;left:0;top:0;width:var(--S);height:var(--S);border-radius:6px}
.dc-case{z-index:1;background:linear-gradient(155deg,rgba(255,255,255,.42),rgba(255,255,255,.12) 55%,rgba(255,255,255,.26));border:1px solid rgba(255,255,255,.9);
  box-shadow:inset 0 1px 1px #fff,inset 0 -1px 2px rgba(255,255,255,.4),0 26px 50px rgba(60,70,90,.16);-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2)}
.dc-case::before{content:"";position:absolute;left:3%;top:3%;width:94%;height:94%;border-radius:50%;border:1px solid rgba(255,255,255,.7);
  background:radial-gradient(closest-side,transparent 0 21%,rgba(255,255,255,.75) 21.5% 22.3%,transparent 23%,transparent 96%,rgba(255,255,255,.35) 97%)}
.dc-case::after{content:"";position:absolute;left:2.4%;top:1.8%;bottom:1.8%;width:5%;border-left:1px solid rgba(255,255,255,.9);border-right:1px solid rgba(255,255,255,.55)}
.dc-clip{position:absolute;left:47%;width:10%;height:2.6%;border:1px solid rgba(255,255,255,.85);border-radius:2px;background:rgba(255,255,255,.2)}
.dc-clip.t{top:1.6%}.dc-clip.b{bottom:1.6%}
.dc-disc{position:absolute;z-index:2;top:calc(var(--S)*.03);left:calc(var(--S)*.03);width:calc(var(--S)*.94);height:calc(var(--S)*.94);border-radius:50%;
  transform:translateX(calc(var(--S)*.47));transition:transform .75s cubic-bezier(.2,.9,.25,1);filter:drop-shadow(0 12px 20px rgba(40,50,70,.18))}
.dc-disc.in{transform:none}
.dc-face{position:absolute;inset:0;border-radius:50%}
.dc-face svg,.dcs-r svg{width:100%;height:100%;display:block}
.dc-gloss{position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle at var(--dx,30%) var(--dy,24%),rgba(255,255,255,.6),transparent 36%),conic-gradient(from 210deg,transparent,rgba(205,220,255,.22) 8%,transparent 18%,rgba(255,215,232,.15) 30%,transparent 42%,transparent 58%,rgba(200,235,255,.18) 70%,transparent 82%);
  -webkit-mask:radial-gradient(closest-side,transparent 7.6%,#000 8%);mask:radial-gradient(closest-side,transparent 7.6%,#000 8%)}
.dc-front{z-index:3;pointer-events:none;overflow:hidden;border:1px solid rgba(255,255,255,.7);color:var(--ink);
  background:linear-gradient(115deg,rgba(255,255,255,.3),rgba(255,255,255,.06) 42%,rgba(255,255,255,.18));-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);box-shadow:inset 0 1px 1px rgba(255,255,255,.9)}
.dc-front::before{content:"";position:absolute;inset:4.5% 4.5% 4.5% 10%;border:.5px solid rgba(255,255,255,.75);border-radius:3px}
.dc-print{position:absolute;left:15%;top:11%;font-family:"Cormorant Garamond",var(--en),serif;font-size:calc(var(--S)*.044);letter-spacing:.22em;line-height:1;opacity:.75}
.dc-print b{display:block;font-weight:500;margin-bottom:calc(var(--S)*.065)}
.dc-print b:nth-child(3){padding-left:24%}
.dc-print2{position:absolute;left:15%;bottom:10%;font-family:"Cormorant Garamond",var(--en),serif;font-weight:500;font-size:calc(var(--S)*.036);letter-spacing:.16em;line-height:1.55;opacity:.65}
.dc-spine{position:absolute;left:3.1%;top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;font-family:"Cormorant Garamond",var(--en),serif;font-size:calc(var(--S)*.026);letter-spacing:.4em;opacity:.45;white-space:nowrap}
.dc-spot{position:absolute;width:70%;height:70%;left:30%;top:22%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;
  background:radial-gradient(closest-side,rgba(255,255,255,.7),rgba(255,255,255,.2) 45%,transparent);transition:left .16s ease-out,top .16s ease-out;animation:dcDrift 11s ease-in-out infinite alternate}
.dc-spot.on{animation:none}
@keyframes dcDrift{0%{left:20%;top:16%}50%{left:72%;top:42%}100%{left:34%;top:80%}}
html.dk .dc-case{background:linear-gradient(155deg,rgba(255,255,255,.12),rgba(255,255,255,.03) 55%,rgba(255,255,255,.07));border-color:rgba(255,255,255,.3);box-shadow:0 26px 50px rgba(0,0,0,.45)}
html.dk .dc-case::before{border-color:rgba(255,255,255,.22)}
html.dk .dc-front{background:linear-gradient(115deg,rgba(255,255,255,.1),rgba(255,255,255,.02) 42%,rgba(255,255,255,.06));border-color:rgba(255,255,255,.25)}
html.dk .dc-spot{background:radial-gradient(closest-side,rgba(255,255,255,.22),rgba(255,255,255,.06) 45%,transparent)}
html.dk .dc-shadow{background:radial-gradient(closest-side,rgba(0,0,0,.5),transparent)}
.dc-info{text-align:center;margin-top:20px;color:var(--ink)}
.dc-no{font-family:"Cormorant Garamond",var(--en),serif;font-style:italic;font-weight:300;font-size:17px;letter-spacing:2px;opacity:.6}
.dc-no span{opacity:.6}
.dc-tt{font-family:var(--ti);font-size:21px;letter-spacing:4px;margin-top:8px}
.dc-sub{font-size:12px;letter-spacing:2px;opacity:.5;margin-top:6px}
.dc-foot{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:22px;font-size:11px;letter-spacing:3px;color:var(--ink)}
.dc-foot span{opacity:.45}
.dcs-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px}
.dcs-item{padding:16px 10px 14px;border-radius:24px;text-align:center;color:var(--ink)}
.dcs-d{width:80%;aspect-ratio:1;margin:0 auto 12px;filter:drop-shadow(0 8px 14px rgba(40,50,70,.16))}
.dcs-r{width:100%;height:100%}
.dcs-r svg{animation:dcSpin 36s linear infinite}
@keyframes dcSpin{to{transform:rotate(360deg)}}
.dcs-t{font-family:var(--ti);font-size:14.5px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dcs-s{font-size:11px;letter-spacing:1px;opacity:.5;margin-top:4px}
#dcPlay{position:fixed;inset:0;z-index:50;display:none;flex-direction:column;background:rgba(246,247,249,.55);-webkit-backdrop-filter:blur(30px) saturate(1.2);backdrop-filter:blur(30px) saturate(1.2)}
html.dk #dcPlay{background:rgba(12,12,14,.62)}
#dcPlay.show{display:flex;animation:dcFade .45s ease}
@keyframes dcFade{from{opacity:0}}
.dcp-top{display:flex;justify-content:space-between;padding:calc(var(--st) + 4px) 12px 0}
.dcp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;align-items:center;padding:6px 26px calc(var(--sb) + 30px)}
.dcp-disc{position:relative;flex:none;width:min(76vw,330px);height:min(76vw,330px);margin:14px 0 28px;touch-action:none;filter:drop-shadow(0 22px 40px rgba(40,50,70,.22))}
.dcp-tt{font-family:var(--ti);font-size:22px;letter-spacing:4px;color:var(--ink);text-align:center}
.dcp-sub{font-size:12px;letter-spacing:2px;color:var(--ink);opacity:.5;margin-top:6px}
#dcpWave{width:100%;max-width:390px;height:72px;margin-top:24px;touch-action:none}
.dcp-time{width:100%;max-width:390px;display:flex;justify-content:space-between;font-family:"Cormorant Garamond",var(--en),serif;font-size:13px;color:var(--ink);opacity:.55;margin-top:4px}
.dcp-ctl{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px}
.dcp-ctl button{min-width:46px;height:46px;padding:0 10px;border-radius:23px;color:var(--ink);font-size:13px;letter-spacing:1px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center}
html.dk .dcp-ctl button{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
.dcp-ctl .dcp-play{width:68px;height:68px;border-radius:50%}
.dcp-lyr{max-width:390px;margin-top:24px;white-space:pre-wrap;text-align:center;font-family:var(--ti);font-size:15px;line-height:2;color:var(--ink);opacity:.8}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-disc"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他想说的</h2><em>voices</em><span class="sp"></span><button class="pill" id="dcAdd">＋ 录一张</button></div>
  <div class="sub-line">他录给你的声音，都收在这里。</div>
  <div class="dc-stage" id="dcStage"><div class="dc-shadow"></div>
    <div class="dc-case"><i class="dc-clip t"></i><i class="dc-clip b"></i></div>
    <div class="dc-disc in" id="dcDisc"></div>
    <div class="dc-front"><div class="dc-spine">365 · INFINITY · RECORDS</div><div class="dc-print"><b>TODAY</b><b>I</b><b>MISS</b><b>YOU</b></div><div class="dc-print2" id="dcPrint2"></div><i class="dc-spot" id="dcSpot"></i></div>
  </div>
  <div class="dc-info" id="dcInfo"></div>
  <div class="dc-foot"><span>上下滑转一转 · 左右滑换一张 · 点唱片播放</span><button class="pill ghost" data-go="discs" id="dcAllBtn">全部唱片</button></div>
</div></section>
<section class="page" id="page-discs"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="disc" aria-label="返回">${BACK}</button><h2>全部唱片</h2><em>all records</em></div>
  <div class="dcs-grid" id="dcsGrid"></div>
</div></section>`);
document.body.insertAdjacentHTML('beforeend',`
<div id="dcPlay"><div class="dcp-top"><button class="iconbtn glass" id="dcpX" aria-label="返回">${BACK}</button><button class="iconbtn glass" id="dcpM" style="letter-spacing:1px">···</button></div>
<div class="dcp-body"><div class="dcp-disc" id="dcpDisc"></div>
  <div class="dcp-tt" id="dcpTt"></div><div class="dcp-sub" id="dcpSub"></div>
  <canvas id="dcpWave"></canvas><div class="dcp-time"><span id="dcpCur">0:00</span><span id="dcpDur">0:00</span></div>
  <div class="dcp-ctl"><button id="dcpSp">1×</button><button id="dcpB">−5</button><button class="dcp-play" id="dcpPlay">${PLAY}</button><button id="dcpF">+5</button><button id="dcpTx">词</button></div>
  <div class="dcp-lyr" id="dcpLyr" hidden></div></div></div>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="dcSet"><div class="mbox">
  <h3>声音设置</h3>
  <label class="f"><span>用哪家生成声音</span><select data-k="dcTts"><option value="eleven">ElevenLabs（可以用你自己的声音）</option><option value="gemini">Gemini</option><option value="openai">OpenAI 兼容</option></select></label>
  <div data-g="eleven">
    <label class="f"><span>ElevenLabs 的 API Key</span><input type="password" data-k="dcElKey" autocomplete="off"></label>
    <label class="f"><span>Voice ID（声音的编号）</span><input data-k="dcElVoice" autocapitalize="off" autocomplete="off"></label>
    <label class="f"><span>模型（留空用 eleven_multilingual_v2）</span><input data-k="dcElModel" autocapitalize="off" autocomplete="off" placeholder="eleven_multilingual_v2"></label>
    <div class="btns"><button class="pill ghost" id="dcClone">用录音克隆一个声音</button></div>
  </div>
  <div data-g="gemini openai">
    <label class="f"><span>Key（Gemini 留空就用聊天那把）</span><input type="password" data-k="dcKey" autocomplete="off"></label>
    <label class="f"><span>模型（留空用默认）</span><input data-k="dcModel" autocapitalize="off" autocomplete="off" placeholder="gemini-2.5-flash-preview-tts"></label>
    <label class="f"><span>声音（留空用默认）</span><input data-k="dcVoice" autocapitalize="off" autocomplete="off" placeholder="Charon"></label>
  </div>
  <div data-g="openai"><label class="f"><span>接口地址</span><input data-k="dcBase" autocapitalize="off" autocomplete="off" placeholder="https://xxx/v1"></label></div>
  <label class="f"><span>他说话的样子（可以不写）</span><textarea class="short" data-k="dcStyle" placeholder="比如：低沉、慢，带一点笑意，像深夜在耳边说话"></textarea></label>
  <div class="mbtns"><button class="pill ghost" id="dcTest">试听一句</button><button class="pill" data-close="dcSet">好了</button></div>
</div></div>`);
function fields(){const v=S.dcTts||'gemini';$$('#dcSet [data-g]').forEach(x=>x.hidden=!x.dataset.g.split(' ').includes(v))}
$('#dcSet [data-k="dcTts"]').addEventListener('change',()=>setTimeout(fields,0));

/* ---------- 唱片的样子 ---------- */
function discSVG(d,i){const t=new Date(d.t),id='dc'+Math.random().toString(36).slice(2,8),w=d._wait,no=p2(i+1),
  date=`${p2(t.getDate())} ${MON[t.getMonth()]} ${t.getFullYear()}`,
  rim=`365 INFINITY RECORDS · VOL. ${no} · ${date} · ${(EN[d.kind]||'LOVE.').replace('.','')} · FOR YOU, ONLY · `,
  tx=[...String(d.text||'').replace(/\s+/g,' ')].slice(0,48),ln=[0,1,2].map(k=>esc(tx.slice(k*16,k*16+16).join(''))),
  tt=[...String(w?'他在录':(d.title||''))],t1=esc(tt.slice(0,5).join('')),t2=esc(tt.slice(5,10).join(''));
  return `<svg viewBox="0 0 200 200"><defs><path id="${id}" d="M14 100a86 86 0 1 1 172 0a86 86 0 1 1-172 0"/>
  <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3E7EE"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#ECE6F2"/><stop offset="1" stop-color="#D6E0EB"/></linearGradient></defs>
  <path fill-rule="evenodd" fill="#FBFAF7" d="M1 100a99 99 0 1 0 198 0a99 99 0 1 0-198 0ZM78 100a22 22 0 1 0 44 0a22 22 0 1 0-44 0Z"/>
  <path fill-rule="evenodd" fill="rgba(255,255,255,.42)" stroke="rgba(160,166,178,.45)" stroke-width=".4" d="M78 100a22 22 0 1 0 44 0a22 22 0 1 0-44 0ZM92.5 100a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0Z"/>
  <circle cx="100" cy="100" r="98.6" fill="none" stroke="rgba(40,45,60,.13)" stroke-width=".6"/>
  <circle cx="100" cy="100" r="16" fill="none" stroke="rgba(160,166,178,.4)" stroke-width=".3"/>
  <circle cx="100" cy="100" r="64" fill="none" stroke="rgba(0,0,0,.035)" stroke-width=".4"/>
  <g fill="#2E2F34" font-family="Cormorant Garamond,Didot,serif">
    <text font-size="4.3" letter-spacing="1.2" opacity=".55"><textPath href="#${id}" textLength="528">${esc(rim)}</textPath></text>
    <text x="100" y="47" text-anchor="middle" font-size="8.5" letter-spacing="1.6" opacity=".85">365 ( ∞ )</text>
    <text x="40" y="94" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${p2(t.getDate())}</text>
    <text x="40" y="102" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${MON[t.getMonth()]}</text>
    <text x="40" y="110" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${t.getFullYear()}</text>
    <text x="157" y="88" text-anchor="middle" font-size="5" letter-spacing="1" opacity=".6">No.</text>
    <text x="157" y="114" text-anchor="middle" font-size="27" font-style="italic" font-weight="300" opacity=".85">${no}</text>
    <g font-family="Songti SC,serif" font-size="3.6" opacity=".5" text-anchor="middle">${ln.map((l,k)=>`<text x="100" y="${134+k*5}">${l}</text>`).join('')}</g>
    <text x="100" y="163" text-anchor="middle" font-size="11" font-weight="500" letter-spacing="1.3">${w?'RECORDING…':(EN[d.kind]||'LOVE.')}</text>
  </g>
  <g transform="translate(128 118) rotate(8)"><rect width="26" height="34" rx="1.6" fill="url(#${id}h)" stroke="#fff" stroke-width=".6" opacity=".94"/>
    <rect x="3" y="2" width="4" height="30" fill="rgba(255,255,255,.55)"/>
    <g fill="#6E7280" font-family="Mr De Haviland,Songti SC,serif" font-size="6" text-anchor="middle"><text x="13" y="20">${t1}</text><text x="13" y="27">${t2}</text></g></g>
  </svg>`}
const faceHTML=(d,i)=>`<div class="dc-face">${discSVG(d,i)}</div><div class="dc-gloss"></div>`;
function setRot(){if(face)face.style.transform=`rotate(${rot}deg)`}
function info(){const L=DATA.disc,n=L.length,d=L[cur],t=d?new Date(d.t):new Date();
  $('#dcPrint2').innerHTML=`VOL. ${p2(d?cur+1:0)}<br>${t.getFullYear()}.${p2(t.getMonth()+1)}.${p2(t.getDate())}`;
  $('#dcAllBtn').textContent=`全部唱片 · ${L.filter(x=>!x._wait).length}`;
  $('#dcInfo').innerHTML=!d?'<div class="dc-tt">还没有唱片</div><div class="dc-sub">点右上角「＋ 录一张」，让他录给你</div>'
    :`<div class="dc-no">No. ${p2(cur+1)} <span>/ ${p2(n)}</span></div><div class="dc-tt">${esc(d._wait?'他在录…':d.title)}</div><div class="dc-sub">${KIND[d.kind]||''} · ${fmtDate(d.t)}${d.dur?' · '+tm(d.dur):''}</div>`}
function refresh(){const el=$('#dcDisc'),d=DATA.disc[cur];if(!d)return show(cur);el.innerHTML=faceHTML(d,cur);face=el.querySelector('.dc-face');setRot();info()}
function show(i,anim=true){const el=$('#dcDisc'),d=DATA.disc[i];
  if(!d){el.style.display='none';el.innerHTML='';face=null;info();return}
  el.style.display='';
  const fill=()=>{el.innerHTML=faceHTML(d,i);face=el.querySelector('.dc-face');setRot();info();
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('in')));if(d._wait)spin()};
  if(anim&&el.innerHTML&&!el.classList.contains('in')){el.classList.add('in');setTimeout(fill,400)}else{el.classList.add('in');fill()}}

/* ---------- 转动；光点跟着手指 ---------- */
function spin(){if(!raf){lt=performance.now();raf=requestAnimationFrame(tick)}}
function tick(n){const dt=Math.min(50,n-lt);lt=n;const d=DATA.disc[cur];
  if(d&&d._wait)rot+=dt*.06;else{rot+=vel*dt/16;vel*=Math.pow(.94,dt/16)}
  setRot();
  if(page==='disc'&&((d&&d._wait)||Math.abs(vel)>.05))raf=requestAnimationFrame(tick);else raf=0}
function light(e){const fr=$('.dc-front').getBoundingClientRect(),s=$('#dcSpot');clearTimeout(spotT);s.classList.add('on');
  s.style.left=((e.clientX-fr.left)/fr.width*100)+'%';s.style.top=((e.clientY-fr.top)/fr.height*100)+'%';
  const dk=$('#dcDisc'),r=dk.getBoundingClientRect();dk.style.setProperty('--dx',((e.clientX-r.left)/r.width*100)+'%');dk.style.setProperty('--dy',((e.clientY-r.top)/r.height*100)+'%')}
const st=$('#dcStage');let g=null;
st.addEventListener('pointerdown',e=>{g={x:e.clientX,y:e.clientY,ly:e.clientY,ax:'',t:performance.now()};vel=0;light(e);try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',e=>{if(!g)return;light(e);const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.ax){if(Math.hypot(dx,dy)<8)return;g.ax=Math.abs(dy)>Math.abs(dx)?'v':'h'}
  if(g.ax==='v'){const d=e.clientY-g.ly,n=performance.now();rot+=d*.9;vel=d*.9/Math.max(8,n-g.t)*16;g.t=n;setRot()}
  else $('#dcDisc').style.marginLeft=(dx*.25)+'px';
  g.ly=e.clientY});
const up=e=>{if(!g)return;const dx=e.clientX-g.x,ax=g.ax;g=null;$('#dcDisc').style.marginLeft='';
  spotT=setTimeout(()=>$('#dcSpot').classList.remove('on'),1400);
  if(!ax){const d=DATA.disc[cur];if(d&&!d._wait)openPlay(d);return}
  if(ax==='h'&&Math.abs(dx)>50&&DATA.disc.length>1){cur=(cur+(dx<0?1:-1)+DATA.disc.length)%DATA.disc.length;rot=0;vel=0;show(cur)}
  if(ax==='v')spin()};
st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);

/* ---------- 生成声音 ---------- */
const toURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
function wav(b64,rate){const pcm=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)),h=new DataView(new ArrayBuffer(44)),w=(o,s)=>[...s].forEach((c,i)=>h.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF');h.setUint32(4,36+pcm.length,true);w(8,'WAVE');w(12,'fmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);
  h.setUint32(24,rate,true);h.setUint32(28,rate*2,true);h.setUint16(32,2,true);h.setUint16(34,16,true);w(36,'data');h.setUint32(40,pcm.length,true);
  return new Blob([h,pcm],{type:'audio/wav'})}
async function tts(text,kind){
  const how=kind==='song'?'用很轻、很慢的男声，像在她耳边哼唱一样，带着旋律感唱出下面的词':'用低沉、温柔、语速稍慢的男声，像深夜在她耳边说话一样，念出下面这段话';
  const style=String(S.dcStyle||'').trim();
  if(S.dcTts==='eleven'){const key=String(S.dcElKey||'').trim(),v=String(S.dcElVoice||'').trim();
    if(!key||!v)throw new Error('先在「声音设置」里填好 ElevenLabs 的 Key 和 Voice ID');
    const model=String(S.dcElModel||'').trim()||'eleven_multilingual_v2',v3=/v3/.test(model);
    const body={text:v3?(kind==='song'?'[sings softly] ':'[softly] ')+text:text,model_id:model,
      voice_settings:v3?{stability:.5}:{stability:kind==='song'?.3:.45,similarity_boost:.85,style:kind==='song'?.6:.35,use_speaker_boost:true}};
    const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(v)}?output_format=mp3_44100_128`,{method:'POST',
      headers:{'xi-api-key':key,'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)});
    if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error('ElevenLabs：'+(j.detail?.message||j.detail?.status||(typeof j.detail==='string'?j.detail:'')||r.status))}
    return toURL(await r.blob())}
  if(S.dcTts==='openai'){const base=String(S.dcBase||'').trim().replace(/\/+$/,''),key=String(S.dcKey||S.apiKey||'').trim();
    if(!base||!key)throw new Error('先在「声音设置」里填好接口地址和 Key');
    const model=S.dcModel||'tts-1',body={model,voice:S.dcVoice||'onyx',input:text,response_format:'mp3'};
    if(/gpt-4o/.test(model))body.instructions=(style||how).slice(0,300);
    const r=await fetch(base+'/audio/speech',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body)});
    if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error?.message||('声音生成失败 '+r.status))}
    return toURL(await r.blob())}
  const key=String(S.dcKey||(S.provider==='gemini'?S.apiKey:'')).trim();if(!key)throw new Error('先在「声音设置」里填 Gemini 的 Key');
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(S.dcModel||'gemini-2.5-flash-preview-tts')}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:(style||how)+'：\n'+text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:S.dcVoice||'Charon'}}}}})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error?.message||('声音生成失败 '+r.status));
  const p=(j.candidates?.[0]?.content?.parts||[]).find(x=>x.inlineData);if(!p)throw new Error('没有生成出声音，再试一次');
  const m=/rate=(\d+)/.exec(p.inlineData.mimeType||'');return toURL(wav(p.inlineData.data,m?+m[1]:24000))}
async function peaksOf(url,n=72){try{const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),buf=await(await fetch(url)).arrayBuffer();
  const ab=await new Promise((res,rej)=>{const q=ac.decodeAudioData(buf,res,rej);if(q&&q.then)q.then(res,rej)});
  const ch=ab.getChannelData(0),step=Math.max(1,Math.floor(ch.length/n)),out=[];
  for(let i=0;i<n;i++){let m=0;for(let j=i*step;j<Math.min(ch.length,(i+1)*step);j+=16){const v=Math.abs(ch[j]);if(v>m)m=v}out.push(m)}
  const mx=Math.max(...out)||1;try{ac.close()}catch(x){}
  return {peaks:out.map(v=>+(v/mx).toFixed(3)),dur:ab.duration}}
  catch(e){return {peaks:Array.from({length:n},(_,i)=>+(.3+.5*Math.abs(Math.sin(i*.7))).toFixed(3)),dur:0}}}

/* ---------- 克隆声音（ElevenLabs） ---------- */
$('#dcClone').onclick=()=>{const key=String(S.dcElKey||'').trim();if(!key)return toast('先填 ElevenLabs 的 Key');
  const i=document.createElement('input');i.type='file';i.accept='audio/*';i.multiple=true;i.style.display='none';document.body.appendChild(i);
  i.onchange=async()=>{const fs=[...i.files];i.remove();if(!fs.length)return;
    const name=(prompt('给这个声音起个名字',S.hisName||'他')||'').trim();if(!name)return;
    toast('正在克隆，可能要几十秒…');
    try{const fd=new FormData();fd.append('name',name);fs.forEach(f=>fd.append('files',f,f.name));
      const r=await fetch('https://api.elevenlabs.io/v1/voices/add',{method:'POST',headers:{'xi-api-key':key},body:fd});
      const j=await r.json().catch(()=>({}));if(!r.ok||!j.voice_id)throw new Error(j.detail?.message||j.detail?.status||('克隆失败 '+r.status));
      S.dcElVoice=j.voice_id;S.dcTts='eleven';saveSettings();try{syncInputs()}catch(x){}fields();toast('克隆好了，点「试听一句」听听')}
    catch(e){toast(e.message)}};i.click()};

/* ---------- 他想说什么 ---------- */
const SCN='这是你们的小窝「365」里「关于他」的「他想说的」：你录给她的声音，会被刻成一张白色的唱片，她可以反复听。';
async function words(kind){const rc=recentChat(10);
  const ask=kind==='song'?`请以${S.hisName}的身份，给她唱一小段。可以是你随口编的几句，也可以是对你们有意义的一首歌里的几句（不要整首照抄）。4 到 8 行，每行短一点，适合轻轻哼出来。`
    :`请以${S.hisName}的身份，给她录一段语音留言，像真的按住录音键说的话：口语，有停顿，可以用「……」表示停一下。60 到 160 字。可以是想她、叮嘱她、说你此刻在哪做什么，或者接着你们最近聊的事。`;
  const t=await callAI(sceneSystem(SCN),[{role:'user',text:`${ask}${rc?'\n你们最近的聊天：\n'+rc:''}
不要写动作，不要括号里的说明，不要 emoji，不要 markdown，这些字会被直接${kind==='song'?'唱':'念'}出来。
按下面的格式输出：第一行写标题（两到八个字），第二行三个短横，下面是正文。
标题：
---
`}]);
  const i=t.search(/\n\s*-{3,}\s*\n/);let title='',body=t;
  if(i>=0){title=((t.slice(0,i).match(/标题\s*[:：]\s*(.+)/)||[])[1]||'').trim();body=t.slice(i).replace(/^\s*-{3,}\s*/,'')}
  body=clean(body).replace(/[（(][^）)]{0,30}[）)]/g,'').replace(/\*\*|#/g,'').trim();
  if(!body)throw new Error('他没录出来，再试一次');
  return {title:title.slice(0,12)||(kind==='song'?'一小段歌':'一段留言'),text:body}}

/* ---------- 刻一张唱片 ---------- */
async function make(kind,given){if(busy)return toast('他还在录上一张');busy=true;
  const d={id:uid(),t:Date.now(),kind,title:'',text:'',audio:'',peaks:null,dur:0,_wait:true};
  DATA.disc.push(d);cur=DATA.disc.length-1;rot=0;vel=0;if(page==='disc')show(cur);
  try{let url;
    if(kind==='mine'){d.title=given.title;url=given.url}
    else{Object.assign(d,kind==='read'?given:await words(kind));if(DATA.disc[cur]===d&&page==='disc')refresh();url=await tts(d.text,kind)}
    const k=await peaksOf(url);d.peaks=k.peaks;d.dur=k.dur;d.audio=await IMG.put(url);
    delete d._wait;await save();if(DATA.disc[cur]===d&&page==='disc')refresh();card();toast(kind==='mine'?'收好了':`${S.hisName}录好了，点唱片听`)}
  catch(e){DATA.disc=DATA.disc.filter(x=>x!==d);cur=Math.max(0,DATA.disc.length-1);if(page==='disc')show(cur);toast(e.message)}
  finally{busy=false}}
function pickAudio(){const i=document.createElement('input');i.type='file';i.accept='audio/*';i.style.display='none';document.body.appendChild(i);
  i.onchange=async()=>{const f=i.files[0];i.remove();if(!f)return;if(f.size>25e6)return toast('这个文件太大了，换一个小一点的');
    let def=f.name.replace(/\.[^.]+$/,'').slice(0,12);if(/^[0-9a-f_-]{8,}$/i.test(def))def='一张唱片';
    const title=(prompt('给这张唱片起个名字',def)||'').trim()||'一张唱片';
    make('mine',{title,url:await toURL(f)})};i.click()}
$('#dcAdd').onclick=()=>sheet([
  ['让他留一段话',()=>make('msg')],
  ['让他唱一小段',()=>make('song')],
  ['我写一句，让他念',()=>{const v=(prompt('写一句，让他念给你听')||'').trim();if(v)make('read',{title:v.slice(0,8),text:v})}],
  ['放一段我自己的音频',pickAudio],
  ['声音设置',()=>{openModal('dcSet');fields()}]]);
$('#dcTest').onclick=async()=>{toast('正在生成…');try{const u=await tts(`乖，听得到吗？是我，${S.hisName}。`,'msg');const a=new Audio(u);a.play().catch(()=>toast('生成好了，但手机没让它自动播'))}catch(e){toast(e.message)}};

/* ---------- 全部唱片 ---------- */
function grid(){const L=DATA.disc.map((d,i)=>[d,i]).filter(x=>!x[0]._wait).reverse();
  $('#dcsGrid').innerHTML=L.length?L.map(([d,i])=>`<button class="dcs-item glass" data-i="${i}"><div class="dcs-d"><div class="dcs-r" style="transform:rotate(${(i*47)%360}deg)">${discSVG(d,i)}</div></div><div class="dcs-t">${esc(d.title)}</div><div class="dcs-s">No.${p2(i+1)} · ${KIND[d.kind]||''} · ${fmtDate(d.t)}</div></button>`).join('')
    :'<div class="empty" style="grid-column:1/-1">还没有唱片</div>'}
$('#dcsGrid').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;cur=+b.dataset.i;rot=0;vel=0;go('disc')};

/* ================= 播放页 ================= */
const durOf=()=>isFinite(A.duration)&&A.duration>0?A.duration:(pd?.dur||0);
const levelAt=f=>{const pk=pd?.peaks||[];return pk.length?pk[Math.min(pk.length-1,Math.floor(f*pk.length))]:0};
function setBtn(){$('#dcpPlay').innerHTML=A.paused?PLAY:PAUSE}
/* 声纹：两根线，一上一下缠绕交叉，连起来像一串 ∞；正在播的地方会张开 */
const LOOPS=5;   // 一共交叉成几个 ∞：越大越密
function drawWave(now=performance.now()){const c=$('#dcpWave'),d=pd;if(!d)return;const W=c.clientWidth,H=c.clientHeight,k=Math.min(devicePixelRatio||1,2);if(!W)return;
  if(c.width!==Math.round(W*k)){c.width=Math.round(W*k);c.height=Math.round(H*k)}
  const g=c.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,W,H);
  const pk=d.peaks||[],n=pk.length,du=durOf(),f=du?Math.min(1,(A.currentTime||0)/du):0,px=f*W,s=now/1000,mid=H/2,mv=A.paused?.22:1,dk=document.documentElement.classList.contains('dk');
  lv+=((A.paused?0:levelAt(f))-lv)*.08;
  const amp=x=>{const u=x/W*(n-1),i=Math.floor(u),r=u-i,v=n>1?pk[i]*(1-r)+pk[Math.min(n-1,i+1)]*r:.5,
    near=Math.exp(-Math.pow((x-px)/70,2)),end=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,x/W))),.6);
    return H*.42*end*(.38+.62*v)*(.72+.28*near+.5*near*lv)*(1+.04*Math.sin(s*1.3))};
  const K=Math.PI*2*LOOPS/W,ph=s*1.1*mv,drift=.45*Math.sin(s*.6*mv);
  const yA=x=>mid+amp(x)*Math.sin(x*K-ph),yB=x=>mid-amp(x)*Math.sin(x*K-ph+drift);
  const line=fn=>{const p=new Path2D();for(let x=0;x<=W;x+=2)x?p.lineTo(x,fn(x)):p.moveTo(x,fn(x));return p};
  const LA=line(yA),LB=line(yB);
  g.lineCap='round';g.lineJoin='round';g.strokeStyle=ink;
  for(const[P,w]of[[LA,1.35],[LB,1]]){g.lineWidth=w;
    g.save();g.beginPath();g.rect(px,0,W-px,H);g.clip();g.globalAlpha=.2;g.stroke(P);g.restore();
    g.save();g.beginPath();g.rect(0,0,px,H);g.clip();g.globalAlpha=.85;if(dk){g.shadowColor=ink;g.shadowBlur=6}g.stroke(P);g.restore()}
  for(const[y,r]of[[yA(px),3],[yB(px),2.4]]){g.globalAlpha=.25;g.beginPath();g.arc(px,y,r*2.6,0,7);g.fillStyle=ink;g.fill();
    g.globalAlpha=1;g.beginPath();g.arc(px,y,r,0,7);g.fill()}
  g.globalAlpha=1;g.shadowBlur=0;
  $('#dcpCur').textContent=tm(A.currentTime);$('#dcpDur').textContent=tm(du)}
function ptick(n){if(!$('#dcPlay').classList.contains('show')){praf=0;return}
  const dt=Math.min(50,n-(pl||n));pl=n;if(!A.paused)pang+=dt*.045*A.playbackRate;
  if(pface)pface.style.transform=`rotate(${pang}deg)`;drawWave(n);praf=requestAnimationFrame(ptick)}
async function openPlay(d){const url=await IMG.get(d.audio);if(!url)return toast('这张唱片的声音找不到了');
  pd=d;ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#2F2A2C';
  const i=DATA.disc.indexOf(d);$('#dcpDisc').innerHTML=faceHTML(d,i);pface=$('#dcpDisc .dc-face');pang=rot;
  $('#dcpTt').textContent=d.title;$('#dcpSub').textContent=`No. ${p2(i+1)} · ${KIND[d.kind]||''} · ${fmtDate(d.t)}`;
  $('#dcpLyr').textContent=d.text||'（这张没有文字）';$('#dcpLyr').hidden=true;$('#dcpSp').textContent=SPD[si]+'×';
  A.src=url;A.defaultPlaybackRate=SPD[si];A.playbackRate=SPD[si];
  $('#dcPlay').classList.add('show');document.body.classList.add('dcp');
  if(!d.peaks||!d.peaks.length){const k=await peaksOf(url);d.peaks=k.peaks;if(!d.dur)d.dur=k.dur;save()}
  setBtn();if(!praf){pl=0;praf=requestAnimationFrame(ptick)}
  A.play().catch(()=>{})}
function closePlay(){A.pause();$('#dcPlay').classList.remove('show');document.body.classList.remove('dcp')}
A.addEventListener('play',setBtn);A.addEventListener('pause',setBtn);A.addEventListener('ended',setBtn);
A.addEventListener('loadedmetadata',()=>{A.playbackRate=SPD[si]});
$('#dcpPlay').onclick=()=>{if(A.paused){if(A.ended)A.currentTime=0;A.play().catch(()=>{})}else A.pause()};
$('#dcpSp').onclick=()=>{si=(si+1)%SPD.length;A.playbackRate=SPD[si];$('#dcpSp').textContent=SPD[si]+'×'};
$('#dcpB').onclick=()=>{A.currentTime=Math.max(0,A.currentTime-5)};
$('#dcpF').onclick=()=>{A.currentTime=Math.min(durOf()||0,A.currentTime+5)};
$('#dcpTx').onclick=()=>{const l=$('#dcpLyr');l.hidden=!l.hidden};
$('#dcpX').onclick=closePlay;
const wv=$('#dcpWave'),seek=e=>{const r=wv.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),du=durOf();if(du)A.currentTime=f*du};
wv.addEventListener('pointerdown',e=>{dragW=true;try{wv.setPointerCapture(e.pointerId)}catch(x){}seek(e)});
wv.addEventListener('pointermove',e=>{if(dragW)seek(e)});
['pointerup','pointercancel'].forEach(v=>wv.addEventListener(v,()=>dragW=false));
/* 播放页的唱片：上下拨可以前后拖，反光跟着手指 */
let pg=null;const pdk=$('#dcpDisc');
const pglow=e=>{const r=pdk.getBoundingClientRect();pdk.style.setProperty('--dx',((e.clientX-r.left)/r.width*100)+'%');pdk.style.setProperty('--dy',((e.clientY-r.top)/r.height*100)+'%')};
pdk.addEventListener('pointerdown',e=>{pg={y:e.clientY};pglow(e);try{pdk.setPointerCapture(e.pointerId)}catch(x){}});
pdk.addEventListener('pointermove',e=>{if(!pg)return;pglow(e);const dy=e.clientY-pg.y;pg.y=e.clientY;pang+=dy*.9;
  const du=durOf();if(du)A.currentTime=Math.max(0,Math.min(du,A.currentTime+dy*.9/36))});
['pointerup','pointercancel'].forEach(v=>pdk.addEventListener(v,()=>pg=null));
$('#dcpM').onclick=()=>{const d=pd;if(!d)return;sheet([
  ['改名字',async()=>{const v=(prompt('新名字',d.title)||'').trim();if(!v)return;d.title=v.slice(0,12);await save();$('#dcpTt').textContent=d.title;
    const i=DATA.disc.indexOf(d);$('#dcpDisc').innerHTML=faceHTML(d,i);pface=$('#dcpDisc .dc-face');if(DATA.disc[cur]===d)refresh();card()}],
  ['保存到手机',async()=>{const u=await IMG.get(d.audio);if(!u)return;const b=await(await fetch(u)).blob(),ext=(b.type.split('/')[1]||'wav').replace('mpeg','mp3');
    shareFile(new File([b],`${d.title||'唱片'}.${ext}`,{type:b.type}))}],
  ['删除这张唱片',async()=>{if(!confirm('删除这张唱片？'))return;closePlay();const id=d.audio;DATA.disc=DATA.disc.filter(x=>x!==d);
    await save();IMG.del([id]);cur=Math.min(cur,Math.max(0,DATA.disc.length-1));if(page==='disc')show(cur);if(page==='discs')grid();card()}]])};

/* ---------- 「关于他」里的入口 ---------- */
function card(){const g=$('#himGrid');if(!g)return;let c=$('#himGrid [data-go="disc"]');
  if(!c){g.insertAdjacentHTML('beforeend','<button class="card glass hm-disc" data-go="disc"><div class="cn">他想说的</div><div class="ce">voices</div><div class="hm-now" id="dcNow"></div></button>');c=$('#himGrid [data-go="disc"]')}
  const a=$('#himGrid [data-go="cards"]')||$('#himGrid [data-go="trip"]');if(a&&a.nextElementSibling!==c)a.after(c);
  const L=DATA.disc.filter(d=>!d._wait),n=$('#dcNow');if(n)n.textContent=L.length?`${L.length} 张 · ${L.at(-1).title}`:'他录给你的声音'}

/* ---------- 他记得自己录过什么 ---------- */
HOOKS.context.push(()=>{const L=DATA.disc.filter(d=>!d._wait&&d.kind!=='mine').slice(-3);if(!L.length)return '';
  return '【唱片】你最近录给她的：'+L.map(d=>`「${d.title}」`).join('、')+'。她可能会提到，自然接住就好。'});

$$('#moreGrid [data-go="disc"]').forEach(x=>x.remove());
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.disc))DATA.disc=[];cur=Math.max(0,DATA.disc.length-1);$$('#moreGrid [data-go="disc"]').forEach(x=>x.remove());card()});
HOOKS.page.push(n=>{page=n;
  if(n==='disc'){$('#dcDisc').classList.add('in');$('#dcDisc').innerHTML='';show(cur,false)}
  if(n==='discs')grid();
  if(n==='him')setTimeout(card,0);
  closePlay()});
})();
