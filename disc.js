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
const hs=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};

/* ---------- 五种唱片 ---------- */
const LOOKS=[
  {k:'ivory', bg:'#FBFAF7',ink:'#2E2F34',edge:'rgba(40,45,60,.13)',gr:'rgba(0,0,0,.035)',m:'inf'},
  {k:'mist',  bg:'#EDF1F6',ink:'#2A3341',edge:'rgba(60,80,110,.16)',gr:'rgba(60,80,110,.06)',m:'moon'},
  {k:'silver',bg:'',       ink:'#33363D',edge:'rgba(40,45,60,.18)',gr:'rgba(255,255,255,.55)',m:'star'},
  {k:'frost', bg:'rgba(255,255,255,.52)',ink:'#2E2F34',edge:'rgba(255,255,255,.95)',gr:'rgba(255,255,255,.6)',m:'flake'},
  {k:'night', bg:'#1C1D21',ink:'#EFEBE4',edge:'rgba(255,255,255,.2)',gr:'rgba(255,255,255,.07)',m:'wave'}];
const lookOf=d=>LOOKS[(d.look!=null?d.look:hs(d.id))%LOOKS.length];
const starP=(cx,cy,R,r)=>{let s='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;s+=(i?'L':'M')+(cx+q*Math.cos(a)).toFixed(2)+' '+(cy+q*Math.sin(a)).toFixed(2)}return s+'Z'};
const MOT={
  inf:'<path d="M100 44C98.4 41.6 95 41.6 95 44S98.4 46.4 100 44 101.6 41.6 105 44 101.6 46.4 100 44Z" fill="none" stroke="currentColor" stroke-width=".7"/>',
  moon:'<path d="M101.5 39.2a4.8 4.8 0 1 0 0 9.6a3.9 3.9 0 1 1 0-9.6Z" fill="currentColor"/>',
  star:`<path d="${starP(100,44,5,2.1)}" fill="none" stroke="currentColor" stroke-width=".6" stroke-linejoin="round"/>`,
  flake:'<path d="M100 39v10M95.7 41.5l8.6 5M95.7 46.5l8.6-5" stroke="currentColor" stroke-width=".6" stroke-linecap="round"/>',
  wave:'<path d="M94.5 44q1.4-2.6 2.75 0t2.75 0 2.75 0 2.75 0" fill="none" stroke="currentColor" stroke-width=".7" stroke-linecap="round"/>'};

let page='',cur=0,mode='case',openOut=false,rot=0,vel=0,busy=false,face=null,raf=0,lt=0,pd=null,pface=null,pang=0,pl=0,praf=0,si=1,ink='#2F2A2C',dragW=false,lv=0,spotT=0;
const BP=[];
const A=new Audio();A.preload='auto';

['mr-de-haviland/400.css','cormorant-garamond/400.css','cormorant-garamond/500.css','cormorant-garamond/300-italic.css'].forEach(f=>
  document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/${f}">`));
document.head.insertAdjacentHTML('beforeend',`<style>
body.dcp #tabbar{display:none}
#himGrid .hm-disc{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
.dc-stage{--S:min(58vw,270px);position:relative;width:calc(var(--S)*1.5);height:calc(var(--S) + 40px);margin:34px auto 0;touch-action:none;-webkit-user-select:none;user-select:none}
.dc-shadow{position:absolute;left:2%;right:0;top:calc(var(--S) + 8px);height:26px;border-radius:50%;background:radial-gradient(closest-side,rgba(50,60,80,.22),transparent);filter:blur(5px)}
.dc-case,.dc-front{position:absolute;left:0;top:0;width:var(--S);height:var(--S);border-radius:6px}
.dc-case,.dc-front,.dc-shadow{transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .45s}
.dc-stage.leave .dc-case,.dc-stage.leave .dc-front,.dc-stage.leave .dc-shadow{transform:translateX(-35%) scale(.92);opacity:0}
.dc-stage.leave .dc-disc{transform:translateX(calc(var(--S)*.95));transition-duration:.48s}
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
  background:radial-gradient(circle at var(--dx,30%) var(--dy,24%),rgba(255,255,255,.55),transparent 36%),conic-gradient(from 210deg,transparent,rgba(205,220,255,.2) 8%,transparent 18%,rgba(230,225,240,.14) 30%,transparent 42%,transparent 58%,rgba(200,235,255,.16) 70%,transparent 82%);
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
.dc-car{--D:min(70vw,310px);position:relative;display:none;height:calc(var(--D) + 34px);margin:28px -18px 0;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none}
.dc-car.show{display:block;animation:dcCarIn .55s cubic-bezier(.2,.9,.25,1)}
@keyframes dcCarIn{from{opacity:0;transform:translateX(12%) scale(.94)}}
.dc-ci{position:absolute;left:50%;top:6px;width:var(--D);height:var(--D);margin-left:calc(var(--D)/-2);border-radius:50%;filter:drop-shadow(0 16px 26px rgba(40,50,70,.2))}
.dc-car.snap .dc-ci{transition:transform .45s cubic-bezier(.2,.9,.25,1),opacity .45s}
.dc-info{text-align:center;margin-top:18px;color:var(--ink)}
.dc-no{font-family:"Cormorant Garamond",var(--en),serif;font-style:italic;font-weight:300;font-size:17px;letter-spacing:2px;opacity:.6}
.dc-no span{opacity:.6}
.dc-tt{font-family:var(--ti);font-size:21px;letter-spacing:4px;margin-top:8px}
.dc-sub{font-size:12px;letter-spacing:2px;opacity:.5;margin-top:6px}
.dc-foot{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:22px;font-size:11px;letter-spacing:3px;color:var(--ink)}
.dc-foot>span{opacity:.45}
.dc-foot .btns{justify-content:center}
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
.dcp-disc{position:relative;flex:none;width:min(76vw,330px);height:min(76vw,330px);margin:14px 0 26px;touch-action:none;filter:drop-shadow(0 22px 40px rgba(40,50,70,.22))}
.dcp-tt{font-family:var(--ti);font-size:22px;letter-spacing:4px;color:var(--ink);text-align:center}
.dcp-sub{font-size:12px;letter-spacing:2px;color:var(--ink);opacity:.5;margin-top:6px}
#dcpWave{width:100%;max-width:390px;height:120px;margin-top:10px;touch-action:none}
.dcp-time{width:100%;max-width:390px;display:flex;justify-content:space-between;font-family:"Cormorant Garamond",var(--en),serif;font-size:13px;color:var(--ink);opacity:.55;margin-top:-6px;padding:0 10px}
.dcp-ctl{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px}
.dcp-ctl button{min-width:46px;height:46px;padding:0 10px;border-radius:23px;color:var(--ink);font-size:13px;letter-spacing:1px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center}
html.dk .dcp-ctl button{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
.dcp-ctl .dcp-play{width:68px;height:68px;border-radius:50%}
.dcp-lyr{max-width:390px;margin-top:24px;white-space:pre-wrap;text-align:center;font-family:var(--ti);font-size:15px;line-height:2;color:var(--ink);opacity:.8}
</style>`);
body.dcp #sheet,body.dcp #sheet>*{z-index:9999!important}
body.dcp #toast{z-index:10000!important}
.dc-face,.dc-ci{will-change:transform;backface-visibility:hidden}
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-disc"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他想说的</h2><em>voices</em><span class="sp"></span><button class="pill" id="dcAdd">＋ 录一张</button></div>
  <div class="sub-line">他录给你的声音，都收在这里。</div>
  <div class="dc-stage" id="dcStage"><div class="dc-shadow"></div>
    <div class="dc-case"><i class="dc-clip t"></i><i class="dc-clip b"></i></div>
    <div class="dc-disc in" id="dcDisc"></div>
    <div class="dc-front"><div class="dc-spine">365 · INFINITY · RECORDS</div><div class="dc-print"><b>TODAY</b><b>I</b><b>MISS</b><b>YOU</b></div><div class="dc-print2" id="dcPrint2"></div><i class="dc-spot" id="dcSpot"></i></div>
  </div>
  <div class="dc-car" id="dcCar"></div>
  <div class="dc-info" id="dcInfo"></div>
  <div class="dc-foot"><span id="dcHint"></span><div class="btns"><button class="pill ghost" id="dcBackIn" hidden>放回盒子</button><button class="pill ghost" data-go="discs" id="dcAllBtn">全部唱片</button></div></div>
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
function discSVG(d,i){const t=new Date(d.t),id='dc'+Math.random().toString(36).slice(2,8),w=d._wait,no=p2(i+1),L=lookOf(d),nt=L.k==='night',
  date=`${p2(t.getDate())} ${MON[t.getMonth()]} ${t.getFullYear()}`,
  rim=`365 INFINITY RECORDS · VOL. ${no} · ${date} · ${(EN[d.kind]||'LOVE.').replace('.','')} · FOR YOU, ONLY · `,
  tx=[...String(d.text||'').replace(/\s+/g,' ')].slice(0,48),ln=[0,1,2].map(k=>esc(tx.slice(k*16,k*16+16).join(''))),
  tt=[...String(w?'他在录':(d.title||''))],t1=esc(tt.slice(0,5).join('')),t2=esc(tt.slice(5,10).join('')),
  bg=L.k==='silver'?`url(#${id}s)`:L.bg;
  return `<svg viewBox="0 0 200 200"><defs><path id="${id}" d="M14 100a86 86 0 1 1 172 0a86 86 0 1 1-172 0"/>
  <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3E7EE"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#E9E8EE"/><stop offset="1" stop-color="#D6E0EB"/></linearGradient>
  <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6F7F9"/><stop offset=".35" stop-color="#D8DCE3"/><stop offset=".6" stop-color="#F8F8FA"/><stop offset="1" stop-color="#CBD0D8"/></linearGradient></defs>
  <path fill-rule="evenodd" fill="${bg}" d="M1 100a99 99 0 1 0 198 0a99 99 0 1 0-198 0ZM78 100a22 22 0 1 0 44 0a22 22 0 1 0-44 0Z"/>
  ${[93,78,66].map(r=>`<circle cx="100" cy="100" r="${r}" fill="none" stroke="${L.gr}" stroke-width=".4"/>`).join('')}
  <path fill-rule="evenodd" fill="${nt?'rgba(255,255,255,.1)':'rgba(255,255,255,.42)'}" stroke="rgba(160,166,178,.45)" stroke-width=".4" d="M78 100a22 22 0 1 0 44 0a22 22 0 1 0-44 0ZM92.5 100a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0Z"/>
  <circle cx="100" cy="100" r="98.6" fill="none" stroke="${L.edge}" stroke-width=".6"/>
  <circle cx="100" cy="100" r="16" fill="none" stroke="rgba(160,166,178,.4)" stroke-width=".3"/>
  <g fill="${L.ink}" font-family="Cormorant Garamond,Didot,serif">
    <text font-size="4.3" letter-spacing="1.2" opacity=".55"><textPath href="#${id}" textLength="528">${esc(rim)}</textPath></text>
    <text x="93" y="47" text-anchor="end" font-size="8.5" letter-spacing="1.2" opacity=".85">365 (</text>
    <text x="107" y="47" font-size="8.5" letter-spacing="1.2" opacity=".85">) ∞</text>
    <text x="40" y="94" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${p2(t.getDate())}</text>
    <text x="40" y="102" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${MON[t.getMonth()]}</text>
    <text x="40" y="110" text-anchor="middle" font-size="5.6" letter-spacing="1" opacity=".7">${t.getFullYear()}</text>
    <text x="157" y="88" text-anchor="middle" font-size="5" letter-spacing="1" opacity=".6">No.</text>
    <text x="157" y="114" text-anchor="middle" font-size="27" font-style="italic" font-weight="300" opacity=".85">${no}</text>
    <g font-family="Songti SC,serif" font-size="3.6" opacity=".5" text-anchor="middle">${ln.map((l,k)=>`<text x="100" y="${134+k*5}">${l}</text>`).join('')}</g>
    <text x="100" y="163" text-anchor="middle" font-size="11" font-weight="500" letter-spacing="1.3">${w?'RECORDING…':(EN[d.kind]||'LOVE.')}</text>
  </g>
  <g color="${L.ink}" opacity=".85">${MOT[L.m]}</g>
  <g transform="translate(128 118) rotate(8)"><rect width="26" height="34" rx="1.6" fill="url(#${id}h)" stroke="#fff" stroke-width=".6" opacity=".94"/>
    <rect x="3" y="2" width="4" height="30" fill="rgba(255,255,255,.55)"/>
    <g fill="#6E7280" font-family="Mr De Haviland,Songti SC,serif" font-size="6" text-anchor="middle"><text x="13" y="20">${t1}</text><text x="13" y="27">${t2}</text></g></g>
  </svg>`}
const faceHTML=(d,i)=>`<div class="dc-face">${discSVG(d,i)}</div><div class="dc-gloss"></div>`;
function setRot(){if(face)face.style.transform=`rotate(${rot}deg)`}
function info(){const L=DATA.disc,n=L.length,d=L[cur],t=d?new Date(d.t):new Date();
  $('#dcPrint2').innerHTML=`VOL. ${p2(d?cur+1:0)}<br>${t.getFullYear()}.${p2(t.getMonth()+1)}.${p2(t.getDate())}`;
  $('#dcAllBtn').textContent=`全部唱片 · ${L.filter(x=>!x._wait).length}`;
  $('#dcHint').textContent=!d?'':mode==='case'?'点唱片，把它取出来 · 上下滑转一转':'左右滑换一张 · 上下滑转一转 · 点唱片播放';
  $('#dcBackIn').hidden=mode!=='out';
  $('#dcInfo').innerHTML=!d?'<div class="dc-tt">还没有唱片</div><div class="dc-sub">点右上角「＋ 录一张」，让他录给你</div>'
    :`<div class="dc-no">No. ${p2(cur+1)} <span>/ ${p2(n)}</span></div><div class="dc-tt">${esc(d._wait?'他在录…':d.title)}</div><div class="dc-sub">${KIND[d.kind]||''} · ${fmtDate(d.t)}${d.dur?' · '+tm(d.dur):''}</div>`}

/* ---------- 盒子里：抽出一半 ---------- */
function showCase(i,anim=true){const el=$('#dcDisc'),d=DATA.disc[i];
  if(!d){el.style.display='none';el.innerHTML='';face=null;info();return}
  el.style.display='';
  const fill=()=>{el.innerHTML=faceHTML(d,i);face=el.querySelector('.dc-face');setRot();info();
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('in')));if(d._wait)spin()};
  if(anim&&el.innerHTML&&!el.classList.contains('in')){el.classList.add('in');setTimeout(fill,400)}else{el.classList.add('in');fill()}}
function takeOut(){const st=$('#dcStage');if(st.classList.contains('leave'))return;navigator.vibrate?.(10);st.classList.add('leave');
  setTimeout(()=>{mode='out';st.style.display='none';st.classList.remove('leave');$('#dcCar').classList.add('show');renderCar()},480)}
function putBack(){mode='case';$('#dcCar').classList.remove('show');const st=$('#dcStage');st.style.display='';
  $('#dcDisc').classList.add('in');$('#dcDisc').innerHTML='';rot=0;vel=0;showCase(cur,false)}
$('#dcBackIn').onclick=putBack;

/* ---------- 拿出来以后：一张一张划 ---------- */
const stepOf=()=>($('#dcCar .dc-ci')?.offsetWidth||300)*.74;
function renderCar(){const L=DATA.disc;if(!L.length)return putBack();let h='';
  for(let k=-2;k<=2;k++){const i=cur+k,d=L[i];if(!d)continue;h+=`<div class="dc-ci" data-k="${k}">${faceHTML(d,i)}</div>`}
  const c=$('#dcCar');c.innerHTML=h;face=c.querySelector('.dc-ci[data-k="0"] .dc-face');setRot();layoutCar(0);info();
  if(L[cur]&&L[cur]._wait)spin()}
function layoutCar(dx){const s=stepOf();$$('#dcCar .dc-ci').forEach(el=>{const p=+el.dataset.k+dx/s,a=Math.min(1,Math.abs(p));
  el.style.transform=`translateX(${(p*s).toFixed(1)}px) scale(${(1-.3*a).toFixed(3)})`;el.style.opacity=(1-.55*a).toFixed(2);el.style.zIndex=10-Math.round(Math.abs(p)*3)})}
function goTo(n,from=0){n=Math.max(0,Math.min(DATA.disc.length-1,n));const c=$('#dcCar');
  if(n===cur){c.classList.add('snap');layoutCar(0);return}
  const off=from+(n-cur)*stepOf();cur=n;rot=0;vel=0;c.classList.remove('snap');renderCar();layoutCar(off);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{c.classList.add('snap');layoutCar(0)}))}

/* ---------- 转动 ---------- */
function spin(){if(!raf){lt=performance.now();raf=requestAnimationFrame(tick)}}
function tick(n){const dt=Math.min(50,n-lt);lt=n;const d=DATA.disc[cur];
  if(d&&d._wait)rot+=dt*.06;else{rot+=vel*dt/16;vel*=Math.pow(.94,dt/16)}
  setRot();
  if(page==='disc'&&((d&&d._wait)||Math.abs(vel)>.05))raf=requestAnimationFrame(tick);else raf=0}
const glow=(el,e)=>{if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty('--dx',((e.clientX-r.left)/r.width*100)+'%');el.style.setProperty('--dy',((e.clientY-r.top)/r.height*100)+'%')};
function light(e){const fr=$('.dc-front').getBoundingClientRect(),s=$('#dcSpot');clearTimeout(spotT);s.classList.add('on');
  s.style.left=((e.clientX-fr.left)/fr.width*100)+'%';s.style.top=((e.clientY-fr.top)/fr.height*100)+'%';glow($('#dcDisc'),e)}

/* 盒子里：点一下或往右拉，取出来；上下滑转 */
const st=$('#dcStage');let g=null;
st.addEventListener('pointerdown',e=>{g={x:e.clientX,y:e.clientY,ly:e.clientY,ax:'',t:performance.now()};vel=0;light(e);try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',e=>{if(!g)return;light(e);const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.ax){if(Math.hypot(dx,dy)<8)return;g.ax=Math.abs(dy)>Math.abs(dx)?'v':'h'}
  if(g.ax==='v'){const d=e.clientY-g.ly,n=performance.now();rot+=d*.9;vel=d*.9/Math.max(8,n-g.t)*16;g.t=n;setRot()}
  else $('#dcDisc').style.marginLeft=(Math.max(0,dx)*.35)+'px';
  g.ly=e.clientY});
const up=e=>{if(!g)return;const dx=e.clientX-g.x,ax=g.ax;g=null;$('#dcDisc').style.marginLeft='';
  spotT=setTimeout(()=>$('#dcSpot').classList.remove('on'),1400);
  const d=DATA.disc[cur];
  if(!ax){if(d&&!d._wait)takeOut();return}
  if(ax==='h'&&dx>40&&d&&!d._wait)return takeOut();
  if(ax==='v')spin()};
st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);

/* 拿出来以后：左右换，上下转，点中间播放 */
const car=$('#dcCar');let cg=null;
car.addEventListener('pointerdown',e=>{const ci=e.target.closest('.dc-ci');cg={x:e.clientX,y:e.clientY,ly:e.clientY,ax:'',dx:0,t:performance.now(),k:ci?+ci.dataset.k:null};
  vel=0;car.classList.remove('snap');glow($('#dcCar .dc-ci[data-k="0"]'),e);try{car.setPointerCapture(e.pointerId)}catch(x){}});
car.addEventListener('pointermove',e=>{if(!cg)return;glow($('#dcCar .dc-ci[data-k="0"]'),e);const dx=e.clientX-cg.x,dy=e.clientY-cg.y;
  if(!cg.ax){if(Math.hypot(dx,dy)<8)return;cg.ax=Math.abs(dy)>Math.abs(dx)?'v':'h'}
  if(cg.ax==='v'){const d=e.clientY-cg.ly,n=performance.now();rot+=d*.9;vel=d*.9/Math.max(8,n-cg.t)*16;cg.t=n;setRot()}
  else{let x=dx;if((cur===0&&x>0)||(cur===DATA.disc.length-1&&x<0))x*=.35;cg.dx=x;layoutCar(x)}
  cg.ly=e.clientY});
const cup=()=>{if(!cg)return;const c=cg;cg=null;
  if(!c.ax){if(c.k==null)return;if(c.k===0){const d=DATA.disc[cur];if(d&&!d._wait)openPlay(d)}else goTo(cur+c.k);return}
  if(c.ax==='v')return spin();
  const s=stepOf();goTo(c.dx<-s*.22?cur+1:c.dx>s*.22?cur-1:cur,c.dx)};
car.addEventListener('pointerup',cup);car.addEventListener('pointercancel',cup);

function redraw(){if(page!=='disc')return;if(mode==='out')renderCar();else showCase(cur)}
function refresh(){if(page!=='disc')return;if(mode==='out')return renderCar();
  const el=$('#dcDisc'),d=DATA.disc[cur];if(!d)return showCase(cur);el.innerHTML=faceHTML(d,cur);face=el.querySelector('.dc-face');setRot();info()}

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
function newLook(){const last=DATA.disc.length?lookOf(DATA.disc.at(-1)):null;let k;do{k=Math.floor(Math.random()*LOOKS.length)}while(LOOKS.length>1&&LOOKS[k]===last);return k}
async function make(kind,given){if(busy)return toast('他还在录上一张');busy=true;
  const d={id:uid(),t:Date.now(),kind,look:newLook(),title:'',text:'',audio:'',peaks:null,dur:0,_wait:true};
  DATA.disc.push(d);cur=DATA.disc.length-1;rot=0;vel=0;redraw();
  try{let url;
    if(kind==='mine'){d.title=given.title;url=given.url}
    else{Object.assign(d,kind==='read'?given:await words(kind));if(DATA.disc[cur]===d)refresh();url=await tts(d.text,kind)}
    const k=await peaksOf(url);d.peaks=k.peaks;d.dur=k.dur;d.audio=await IMG.put(url);
    delete d._wait;await save();if(DATA.disc[cur]===d)refresh();card();toast(kind==='mine'?'收好了':`${S.hisName}录好了，点唱片听`)}
  catch(e){DATA.disc=DATA.disc.filter(x=>x!==d);cur=Math.max(0,DATA.disc.length-1);redraw();toast(e.message)}
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
$('#dcsGrid').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;cur=+b.dataset.i;rot=0;vel=0;openOut=true;go('disc')};

/* ================= 播放页 ================= */
const durOf=()=>isFinite(A.duration)&&A.duration>0?A.duration:(pd?.dur||0);
const levelAt=f=>{const pk=pd?.peaks||[];return pk.length?pk[Math.min(pk.length-1,Math.floor(f*pk.length))]:0};
function setBtn(){$('#dcpPlay').innerHTML=A.paused?PLAY:PAUSE}
/* 纯白剪影小鸟：朝右飞。f 是翅膀位置：1 抬到最高，-1 压到最低，0 平展滑翔 */
function bWing(g,f,ox,oy){const tx=-6+ox+2.5*(1-Math.abs(f)),ty=-2.2+oy-14*f;
  g.beginPath();g.moveTo(3.2+ox,-2.4+oy);
  g.quadraticCurveTo(-.5+ox,-3.2+oy-11*f,tx,ty);
  g.quadraticCurveTo(-3.5+ox,-1.6+oy-5*f,-5.5+ox,-1+oy);
  g.closePath();g.fill()}
function bBody(g){g.beginPath();g.moveTo(11.5,-1.3);
  g.quadraticCurveTo(9,-3.9,5.6,-3.4);
  g.bezierCurveTo(1,-3,-6,-1.9,-10.8,-.7);
  g.lineTo(-14.2,-2.6);g.lineTo(-12.4,.3);g.lineTo(-14.2,2.7);g.lineTo(-10.4,1.4);
  g.bezierCurveTo(-5,3.4,2,3.3,6.2,1.5);
  g.quadraticCurveTo(8.8,.3,11.5,-1.3);g.closePath();g.fill()}
function drawBird(g,x,y,ang,f,sc,dk){g.save();g.translate(x,y);g.rotate(ang);g.scale(sc,sc);
  g.fillStyle='#fff';g.shadowColor=dk?'rgba(255,255,255,.6)':'rgba(105,120,150,.4)';g.shadowBlur=dk?10:6;
  g.globalAlpha=.55;bWing(g,f*.82,1.8,-.4);
  g.globalAlpha=1;bBody(g);bWing(g,f,0,0);
  g.restore()}
/* 一条虚线波浪，小鸟沿着线飞；位置每一帧自己推算，不会一跳一跳 */
let est=0,lastW=0,wD=null,bxS=null,wPh=0,wOff=0,wph=0,glS=0,fS=0;
function playPos(dt){const real=A.currentTime||0;
  if(A.paused||dragW||Math.abs(real-est)>.6){est=real;return est}
  est+=dt/1000*A.playbackRate;est+=(real-est)*.06;return Math.max(0,est)}
function drawWave(now=performance.now()){const c=$('#dcpWave'),d=pd;if(!d)return;const W=c.clientWidth,H=c.clientHeight,k=Math.min(devicePixelRatio||1,2);if(!W)return;
  if(c.width!==Math.round(W*k)){c.width=Math.round(W*k);c.height=Math.round(H*k)}
  const dt=Math.min(50,Math.max(0,now-(lastW||now)));lastW=now;
  if(wD!==d){wD=d;bxS=null;est=A.currentTime||0;BP.length=0}
  const g=c.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,W,H);
  const pk=d.peaks||[],n=pk.length,du=durOf(),t=playPos(dt),f=du?Math.min(1,t/du):0,M=18,LW=W-M*2,px=M+f*LW,s=now/1000,mid=H*.62,play=!A.paused,
    dk=document.documentElement.classList.contains('dk'),ez=x=>1-Math.exp(-dt/x);
  bxS=bxS==null?px:bxS+(px-bxS)*ez(60);
  lv+=((play?levelAt(f):0)-lv)*ez(240);
  wPh+=dt/1000*(play?1.5:.3);wOff-=dt/1000*(play?14:2);
  const amp=x=>{const u=Math.max(0,Math.min(1,(x-M)/LW))*(n-1),i=Math.floor(u),r=u-i,v=n>1?pk[i]*(1-r)+pk[Math.min(n-1,i+1)]*r:.5,near=Math.exp(-Math.pow((x-bxS)/80,2));
    return H*.15*(.35+.65*v)*(1+.7*near*lv)};
  const y=x=>mid+amp(x)*Math.sin(x*.045-wPh);
  const path=new Path2D();for(let x=M;x<=W-M;x+=2)x===M?path.moveTo(x,y(x)):path.lineTo(x,y(x));
  g.lineCap='round';g.strokeStyle=ink;
  g.save();g.beginPath();g.rect(bxS,0,W,H);g.clip();g.setLineDash([1.5,6]);g.lineDashOffset=wOff;g.lineWidth=1.3;g.globalAlpha=.3;g.stroke(path);g.restore();
  g.save();g.beginPath();g.rect(0,0,bxS,H);g.clip();g.setLineDash([7,5]);g.lineDashOffset=wOff;g.lineWidth=1.5;g.globalAlpha=.75;g.stroke(path);g.restore();
  /* 小鸟：扇几下，滑翔一会儿；倍速越快扇得越快；暂停时翅膀微抬，轻轻浮着 */
  const by=y(bxS),sl=(y(bxS+3)-y(bxS-3))/6;
  glS+=((play&&Math.sin(s*.55)>.55?1:0)-glS)*ez(300);
  if(play)wph+=dt/1000*10*A.playbackRate;
  const tf=play?Math.sin(wph)*(1-glS)+.12*glS:.18+.06*Math.sin(s*1.6);
  fS+=(tf-fS)*ez(play?25:200);
  const bob=Math.sin(s*(play?3:1.6))*(play?1.2:1.8),bx=bxS,bb=by-18+bob-fS*1.2;
  if(play&&Math.random()<dt/60*.25)BP.push({x:bx-14,y:bb+1+(Math.random()-.5)*5,a:.8,r:.5+Math.random(),vx:-.02-Math.random()*.03,vy:(Math.random()-.5)*.02});
  g.fillStyle='#fff';
  for(let i=BP.length-1;i>=0;i--){const p=BP[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.a-=dt/1200;if(p.a<=0){BP.splice(i,1);continue}
    g.globalAlpha=p.a*.7;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}
  g.globalAlpha=1;
  const gr=20+2*Math.sin(s*2.2),rg=g.createRadialGradient(bx,bb,0,bx,bb,gr);
  rg.addColorStop(0,dk?'rgba(220,230,255,.22)':'rgba(255,255,255,.75)');rg.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=rg;g.beginPath();g.arc(bx,bb,gr,0,7);g.fill();
  drawBird(g,bx,bb,Math.atan(sl)*.6,fS,1.3,dk);
  g.globalAlpha=.55;g.fillStyle=ink;g.beginPath();g.arc(bx,by,1.8,0,7);g.fill();g.globalAlpha=1;
  $('#dcpCur').textContent=tm(A.currentTime);$('#dcpDur').textContent=tm(du)}
function ptick(n){if(!$('#dcPlay').classList.contains('show')){praf=0;return}
  const dt=Math.min(50,n-(pl||n));pl=n;if(!A.paused)pang+=dt*.045*A.playbackRate;
  if(pface)pface.style.transform=`rotate(${pang}deg)`;drawWave(n);praf=requestAnimationFrame(ptick)}
async function openPlay(d){const url=await IMG.get(d.audio);if(!url)return toast('这张唱片的声音找不到了');
  pd=d;BP.length=0;ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#2F2A2C';
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
const wv=$('#dcpWave'),seek=e=>{const r=wv.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left-16)/(r.width-32))),du=durOf();if(du)A.currentTime=f*du};
wv.addEventListener('pointerdown',e=>{dragW=true;try{wv.setPointerCapture(e.pointerId)}catch(x){}seek(e)});
wv.addEventListener('pointermove',e=>{if(dragW)seek(e)});
['pointerup','pointercancel'].forEach(v=>wv.addEventListener(v,()=>dragW=false));
let pg=null;const pdk=$('#dcpDisc');
pdk.addEventListener('pointerdown',e=>{pg={y:e.clientY};glow(pdk,e);try{pdk.setPointerCapture(e.pointerId)}catch(x){}});
pdk.addEventListener('pointermove',e=>{if(!pg)return;glow(pdk,e);const dy=e.clientY-pg.y;pg.y=e.clientY;pang+=dy*.9;
  const du=durOf();if(du)A.currentTime=Math.max(0,Math.min(du,A.currentTime+dy*.9/36))});
['pointerup','pointercancel'].forEach(v=>pdk.addEventListener(v,()=>pg=null));
$('#dcpM').onclick=()=>{const d=pd;if(!d)return;sheet([
  ['改名字',async()=>{const v=(prompt('新名字',d.title)||'').trim();if(!v)return;d.title=v.slice(0,12);await save();$('#dcpTt').textContent=d.title;
    const i=DATA.disc.indexOf(d);$('#dcpDisc').innerHTML=faceHTML(d,i);pface=$('#dcpDisc .dc-face');if(DATA.disc[cur]===d)refresh();card()}],
  ['保存到手机',async()=>{const u=await IMG.get(d.audio);if(!u)return;const b=await(await fetch(u)).blob(),ext=(b.type.split('/')[1]||'wav').replace('mpeg','mp3');
    shareFile(new File([b],`${d.title||'唱片'}.${ext}`,{type:b.type}))}],
  ['删除这张唱片',async()=>{if(!confirm('删除这张唱片？'))return;closePlay();const id=d.audio;DATA.disc=DATA.disc.filter(x=>x!==d);
    await save();IMG.del([id]);cur=Math.min(cur,Math.max(0,DATA.disc.length-1));redraw();if(page==='discs')grid();card()}]])};

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
  if(n==='disc'){const s=$('#dcStage'),c=$('#dcCar');s.classList.remove('leave');
    if(openOut&&DATA.disc[cur]){openOut=false;mode='out';s.style.display='none';c.classList.add('show');requestAnimationFrame(()=>requestAnimationFrame(renderCar))}
    else{mode='case';c.classList.remove('show');s.style.display='';$('#dcDisc').classList.add('in');$('#dcDisc').innerHTML='';showCase(cur,false)}}
  if(n==='discs')grid();
  if(n==='him')setTimeout(card,0);
  closePlay()});
})();
