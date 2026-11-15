/* ===== 365 · disc.js · 他的唱片：他录给你的声音（留言 / 唱给你 / 念给你 / 我放的） ===== */
(()=>{
if(!Array.isArray(DATA.disc))DATA.disc=[];
Object.assign(DEFAULT,{dcTts:'gemini',dcKey:'',dcModel:'',dcVoice:'',dcBase:'',dcStyle:''});
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
let page='',cur=0,rot=0,vel=0,busy=false,face=null,raf=0,lt=0,pd=null,pface=null,pang=0,pl=0,praf=0,si=1,ink='#2F2A2C',dragW=false;
const A=new Audio();A.preload='auto';

['mr-de-haviland/400.css','cormorant-garamond/500.css','cormorant-garamond/500-italic.css'].forEach(f=>
  document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/${f}">`));
document.head.insertAdjacentHTML('beforeend',`<style>
body.dcp #tabbar{display:none}
.dc-stage{--W:min(92vw,400px);--S:calc(var(--W)/1.52);position:relative;width:var(--W);height:calc(var(--S) + 20px);margin:30px auto 0;touch-action:none;-webkit-user-select:none;user-select:none}
.dc-case,.dc-front{position:absolute;left:0;top:10px;width:var(--S);height:var(--S);border-radius:8px}
.dc-case{z-index:1;background:linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.1));border:1px solid rgba(255,255,255,.85);
  box-shadow:inset 0 1px 1px #fff,0 18px 40px rgba(60,70,90,.16);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.dc-case::before{content:"";position:absolute;top:6%;bottom:6%;left:12%;right:6%;border:1px solid rgba(255,255,255,.7);border-radius:4px}
.dc-case::after{content:"";position:absolute;left:3%;top:4%;bottom:4%;width:5%;border-left:1px solid rgba(255,255,255,.85);border-right:1px solid rgba(255,255,255,.55)}
.dc-front{z-index:3;pointer-events:none;overflow:hidden;border:1px solid rgba(255,255,255,.6);
  background:linear-gradient(115deg,rgba(255,255,255,.28),rgba(255,255,255,.05) 45%,rgba(255,255,255,.16));-webkit-backdrop-filter:blur(2.5px);backdrop-filter:blur(2.5px)}
.dc-front::after{content:"";position:absolute;top:-20%;left:-40%;width:40%;height:140%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35) 50%,transparent);transform:rotate(14deg)}
html.dk .dc-case{background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03));border-color:rgba(255,255,255,.28);box-shadow:0 18px 40px rgba(0,0,0,.4)}
html.dk .dc-front{background:linear-gradient(115deg,rgba(255,255,255,.1),rgba(255,255,255,.02) 45%,rgba(255,255,255,.06));border-color:rgba(255,255,255,.22)}
.dc-disc{position:absolute;z-index:2;top:calc(10px + var(--S)*.03);left:calc(var(--S)*.03);width:calc(var(--S)*.94);height:calc(var(--S)*.94);
  transform:translateX(calc(var(--S)*.5));transition:transform .7s cubic-bezier(.2,.9,.25,1);filter:drop-shadow(0 10px 18px rgba(40,50,70,.18))}
.dc-disc.in{transform:translateX(0)}
.dc-face,.dc-gloss{position:absolute;inset:0;border-radius:50%;-webkit-mask:radial-gradient(circle,transparent 0 7.2%,#000 7.5%);mask:radial-gradient(circle,transparent 0 7.2%,#000 7.5%)}
.dc-face{color:#3A3B40;font-family:"Cormorant Garamond",var(--en),serif;box-shadow:inset 0 0 0 1px rgba(180,185,195,.6);
  background:radial-gradient(circle,rgba(255,255,255,.5) 0 16.5%,rgba(185,190,200,.55) 16.6% 17%,rgba(255,255,255,0) 17.1%),radial-gradient(circle,transparent 0 47%,rgba(0,0,0,.035) 47.2% 47.4%,transparent 47.6%),#FBFAF7}
html.dk .dc-face{background-color:#E9E8E5}
.dc-gloss{pointer-events:none;background:conic-gradient(from 200deg,rgba(255,255,255,0),rgba(210,225,255,.22) 10%,rgba(255,255,255,0) 22%,rgba(255,220,235,.16) 34%,rgba(255,255,255,0) 46%,rgba(255,255,255,0) 60%,rgba(200,230,255,.18) 72%,rgba(255,255,255,0) 84%),radial-gradient(circle at 32% 26%,rgba(255,255,255,.5),transparent 40%)}
.dc-p{position:absolute;text-align:center;line-height:1.1;letter-spacing:.08em;white-space:nowrap}
.dc-top{top:8.5%;left:0;right:0;font-size:calc(var(--S)*.055);letter-spacing:.14em}
.dc-l{left:12%;top:44%;font-size:calc(var(--S)*.034)}
.dc-r{right:11%;top:39%;font-size:calc(var(--S)*.13);font-style:italic;font-weight:500;line-height:.9}
.dc-r small{display:block;font-size:.26em;font-style:normal;letter-spacing:.12em;margin-bottom:2px}
.dc-tiny{left:27%;right:27%;bottom:17%;white-space:normal;font-family:var(--ti);font-size:calc(var(--S)*.019);line-height:1.4;opacity:.55;max-height:4.2em;overflow:hidden}
.dc-bt{bottom:8.5%;left:0;right:0;font-size:calc(var(--S)*.058);font-weight:500;letter-spacing:.06em}
.dc-tag{position:absolute;top:15%;left:26%;width:21%;height:30%;transform:rotate(-3deg);border-radius:3px;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;padding:6% 4%;
  background:linear-gradient(160deg,rgba(214,219,228,.85),rgba(242,244,247,.6) 45%,rgba(196,202,214,.8));border:1px solid rgba(255,255,255,.9);box-shadow:0 2px 6px rgba(40,50,70,.12),inset 0 1px 1px #fff}
.dc-tag::before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.7) 45%,transparent 60%)}
.dc-tag span{position:relative;font-family:"Mr De Haviland","Savoye LET",var(--ti),cursive;color:#fff;font-size:calc(var(--S)*.05);line-height:1.15;text-align:center;word-break:break-all;text-shadow:0 1px 1px rgba(80,90,110,.55)}
.dc-info{text-align:center;margin-top:22px;color:var(--ink)}
.dc-no{font-family:"Cormorant Garamond",var(--en),serif;font-style:italic;font-size:16px;letter-spacing:2px;opacity:.6}
.dc-no span{opacity:.6}
.dc-tt{font-family:var(--ti);font-size:21px;letter-spacing:4px;margin-top:8px}
.dc-sub{font-size:12px;letter-spacing:2px;opacity:.5;margin-top:6px}
.dc-foot{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:22px;font-size:11px;letter-spacing:3px;color:var(--ink)}
.dc-foot span{opacity:.45}
#dcPlay{position:fixed;inset:0;z-index:50;display:none;flex-direction:column;background:rgba(246,247,249,.55);-webkit-backdrop-filter:blur(30px) saturate(1.2);backdrop-filter:blur(30px) saturate(1.2)}
html.dk #dcPlay{background:rgba(12,12,14,.6)}
#dcPlay.show{display:flex;animation:dcFade .45s ease}
@keyframes dcFade{from{opacity:0}}
.dcp-top{display:flex;justify-content:space-between;padding:calc(var(--st) + 4px) 12px 0}
.dcp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;align-items:center;padding:6px 28px calc(var(--sb) + 30px)}
.dcp-disc{--S:calc(min(74vw,320px)/.94);position:relative;flex:none;width:min(74vw,320px);height:min(74vw,320px);margin:16px 0 28px;touch-action:none;filter:drop-shadow(0 20px 36px rgba(40,50,70,.2))}
.dcp-tt{font-family:var(--ti);font-size:22px;letter-spacing:4px;color:var(--ink);text-align:center}
.dcp-sub{font-size:12px;letter-spacing:2px;color:var(--ink);opacity:.5;margin-top:6px}
#dcpWave{width:100%;max-width:380px;height:54px;margin-top:26px;touch-action:none}
.dcp-time{width:100%;max-width:380px;display:flex;justify-content:space-between;font-family:"Cormorant Garamond",var(--en),serif;font-size:13px;color:var(--ink);opacity:.55;margin-top:6px}
.dcp-ctl{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px}
.dcp-ctl button{min-width:46px;height:46px;padding:0 10px;border-radius:23px;color:var(--ink);font-size:13px;letter-spacing:1px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center}
html.dk .dcp-ctl button{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
.dcp-ctl .dcp-play{width:68px;height:68px;border-radius:50%}
.dcp-lyr{max-width:380px;margin-top:24px;white-space:pre-wrap;text-align:center;font-family:var(--ti);font-size:15px;line-height:2;color:var(--ink);opacity:.8}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-disc"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="more" aria-label="返回">${BACK}</button><h2>唱片</h2><em>records</em><span class="sp"></span><button class="pill" id="dcAdd">＋ 录一张</button></div>
  <div class="sub-line">他录给你的声音，都收在这里。</div>
  <div class="dc-stage" id="dcStage"><div class="dc-case"></div><div class="dc-disc in" id="dcDisc"></div><div class="dc-front"></div></div>
  <div class="dc-info" id="dcInfo"></div>
  <div class="dc-foot"><span>上下滑转一转 · 左右滑换一张 · 点唱片播放</span><button class="pill ghost" id="dcAll">全部唱片</button></div>
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
  <label class="f"><span>用哪家生成声音</span><select data-k="dcTts"><option value="gemini">Gemini（可以用聊天那把 Key）</option><option value="openai">OpenAI 兼容（/audio/speech）</option></select></label>
  <label class="f"><span>Key（Gemini 留空就用聊天那把）</span><input type="password" data-k="dcKey" autocomplete="off"></label>
  <label class="f"><span>模型（留空用默认）</span><input data-k="dcModel" autocapitalize="off" autocomplete="off" placeholder="gemini-2.5-flash-preview-tts"></label>
  <label class="f"><span>声音（留空用默认）</span><input data-k="dcVoice" autocapitalize="off" autocomplete="off" placeholder="Charon"></label>
  <label class="f"><span>接口地址（只有 OpenAI 兼容要填）</span><input data-k="dcBase" autocapitalize="off" autocomplete="off" placeholder="https://xxx/v1"></label>
  <label class="f"><span>他说话的样子（可以不写）</span><textarea class="short" data-k="dcStyle" placeholder="比如：低沉、慢，带一点笑意，像深夜在耳边说话"></textarea></label>
  <p class="hint">Gemini 可以试的男声：Charon（低沉）、Orus（沉稳）、Fenrir、Algenib、Iapetus。OpenAI：onyx、echo、ash。</p>
  <div class="mbtns"><button class="pill ghost" id="dcTest">试听一句</button><button class="pill" data-close="dcSet">好了</button></div>
</div></div>`);

/* ---------- 唱片的样子 ---------- */
function faceHTML(d,i){const t=new Date(d.t),y=String(t.getFullYear()),w=d._wait;
  return `<div class="dc-face"><div class="dc-p dc-top">3 ( ∞ ) 65</div>
    <div class="dc-p dc-l">${p2(t.getDate())}<br>${MON[t.getMonth()]}<br>${y.slice(0,2)}_${y.slice(2)}</div>
    <div class="dc-p dc-r"><small>No.</small>${p2(i+1)}</div>
    <div class="dc-p dc-tiny">${esc(String(d.text||'').slice(0,70))}</div>
    <div class="dc-p dc-bt">${w?'RECORDING…':(EN[d.kind]||'LOVE.')}</div>
    <div class="dc-tag"><span>${esc(w?'他在录…':(d.title||''))}</span></div></div><div class="dc-gloss"></div>`}
function setRot(){if(face)face.style.transform=`rotate(${rot}deg)`}
function info(){const n=DATA.disc.length,d=DATA.disc[cur];
  $('#dcInfo').innerHTML=!d?'<div class="dc-tt">还没有唱片</div><div class="dc-sub">点右上角「＋ 录一张」，让他录给你</div>'
    :`<div class="dc-no">No. ${p2(cur+1)} <span>/ ${p2(n)}</span></div><div class="dc-tt">${esc(d._wait?'他在录…':d.title)}</div><div class="dc-sub">${KIND[d.kind]||''} · ${fmtDate(d.t)}${d.dur?' · '+tm(d.dur):''}</div>`}
function refresh(){const el=$('#dcDisc'),d=DATA.disc[cur];if(!d)return show(cur);el.innerHTML=faceHTML(d,cur);face=el.querySelector('.dc-face');setRot();info()}
function show(i,anim=true){const el=$('#dcDisc'),d=DATA.disc[i];
  if(!d){el.style.display='none';el.innerHTML='';face=null;info();return}
  el.style.display='';
  const fill=()=>{el.innerHTML=faceHTML(d,i);face=el.querySelector('.dc-face');setRot();info();
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('in')));if(d._wait)spin()};
  if(anim&&el.innerHTML&&!el.classList.contains('in')){el.classList.add('in');setTimeout(fill,380)}else{el.classList.add('in');fill()}}

/* ---------- 转动：上下滑转，松手还会再转一会儿 ---------- */
function spin(){if(!raf){lt=performance.now();raf=requestAnimationFrame(tick)}}
function tick(n){const dt=Math.min(50,n-lt);lt=n;const d=DATA.disc[cur];
  if(d&&d._wait)rot+=dt*.06;else{rot+=vel*dt/16;vel*=Math.pow(.94,dt/16)}
  setRot();
  if(page==='disc'&&((d&&d._wait)||Math.abs(vel)>.05))raf=requestAnimationFrame(tick);else raf=0}
const st=$('#dcStage');let g=null;
st.addEventListener('pointerdown',e=>{g={x:e.clientX,y:e.clientY,ly:e.clientY,ax:'',t:performance.now()};vel=0;try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',e=>{if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.ax){if(Math.hypot(dx,dy)<8)return;g.ax=Math.abs(dy)>Math.abs(dx)?'v':'h'}
  if(g.ax==='v'){const d=e.clientY-g.ly,n=performance.now();rot+=d*.9;vel=d*.9/Math.max(8,n-g.t)*16;g.t=n;setRot()}
  else $('#dcDisc').style.marginLeft=(dx*.25)+'px';
  g.ly=e.clientY});
const up=e=>{if(!g)return;const dx=e.clientX-g.x,ax=g.ax;g=null;$('#dcDisc').style.marginLeft='';
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
async function peaksOf(url,n=56){try{const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),buf=await(await fetch(url)).arrayBuffer();
  const ab=await new Promise((res,rej)=>{const q=ac.decodeAudioData(buf,res,rej);if(q&&q.then)q.then(res,rej)});
  const ch=ab.getChannelData(0),step=Math.max(1,Math.floor(ch.length/n)),out=[];
  for(let i=0;i<n;i++){let m=0;for(let j=i*step;j<Math.min(ch.length,(i+1)*step);j+=16){const v=Math.abs(ch[j]);if(v>m)m=v}out.push(m)}
  const mx=Math.max(...out)||1;try{ac.close()}catch(x){}
  return {peaks:out.map(v=>+(v/mx).toFixed(3)),dur:ab.duration}}
  catch(e){return {peaks:Array.from({length:n},(_,i)=>+(.3+.5*Math.abs(Math.sin(i*.7))).toFixed(3)),dur:0}}}

/* ---------- 他想说什么 ---------- */
const SCN='这是你们的小窝「365」里的「唱片」：你录给她的声音，会被刻成一张白色的唱片，她可以反复听。';
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
  DATA.disc.push(d);cur=DATA.disc.length-1;rot=0;vel=0;show(cur);
  try{let url;
    if(kind==='mine'){d.title=given.title;url=given.url}
    else{Object.assign(d,kind==='read'?given:await words(kind));if(DATA.disc[cur]===d)refresh();url=await tts(d.text,kind)}
    const k=await peaksOf(url);d.peaks=k.peaks;d.dur=k.dur;d.audio=await IMG.put(url);
    delete d._wait;await save();if(DATA.disc[cur]===d)refresh();toast(kind==='mine'?'收好了':`${S.hisName}录好了，点唱片听`)}
  catch(e){DATA.disc=DATA.disc.filter(x=>x!==d);cur=Math.max(0,DATA.disc.length-1);show(cur);toast(e.message)}
  finally{busy=false}}
function pickAudio(){const i=document.createElement('input');i.type='file';i.accept='audio/*';i.style.display='none';document.body.appendChild(i);
  i.onchange=async()=>{const f=i.files[0];i.remove();if(!f)return;if(f.size>25e6)return toast('这个文件太大了，换一个小一点的');
    const title=(prompt('给这张唱片起个名字',f.name.replace(/\.[^.]+$/,'').slice(0,12))||'').trim()||'一张唱片';
    make('mine',{title,url:await toURL(f)})};i.click()}
$('#dcAdd').onclick=()=>sheet([
  ['让他留一段话',()=>make('msg')],
  ['让他唱一小段',()=>make('song')],
  ['我写一句，让他念',()=>{const v=(prompt('写一句，让他念给你听')||'').trim();if(v)make('read',{title:v.slice(0,8),text:v})}],
  ['放一段我自己的音频',pickAudio],
  ['声音设置',()=>openModal('dcSet')]]);
$('#dcAll').onclick=()=>{const L=DATA.disc.map((d,i)=>[d,i]).filter(x=>!x[0]._wait).reverse();if(!L.length)return toast('还没有唱片');
  sheet(L.map(([d,i])=>[`No.${p2(i+1)} · ${d.title}`,()=>{cur=i;rot=0;vel=0;show(i)}]))};
$('#dcTest').onclick=async()=>{toast('正在生成…');try{const u=await tts(`乖，听得到吗？是我，${S.hisName}。`,'msg');const a=new Audio(u);a.play().catch(()=>toast('生成好了，但手机没让它自动播'))}catch(e){toast(e.message)}};

/* ================= 播放页 ================= */
const durOf=()=>isFinite(A.duration)&&A.duration>0?A.duration:(pd?.dur||0);
function setBtn(){$('#dcpPlay').innerHTML=A.paused?PLAY:PAUSE}
function drawWave(){const c=$('#dcpWave'),d=pd;if(!d)return;const W=c.clientWidth,H=c.clientHeight,k=Math.min(devicePixelRatio||1,2);if(!W)return;
  if(c.width!==Math.round(W*k)){c.width=Math.round(W*k);c.height=Math.round(H*k)}
  const g=c.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,W,H);
  const pk=d.peaks||[],n=pk.length||1,bw=W/n,du=durOf(),f=du?Math.min(1,(A.currentTime||0)/du):0;g.fillStyle=ink;
  pk.forEach((v,i)=>{const h=Math.max(3,v*H*.9),x=i*bw+bw*.25,w=Math.max(1.5,bw*.5);g.globalAlpha=(i+.5)/n<=f?.9:.22;
    g.beginPath();if(g.roundRect)g.roundRect(x,(H-h)/2,w,h,w/2);else g.rect(x,(H-h)/2,w,h);g.fill()});
  g.globalAlpha=1;$('#dcpCur').textContent=tm(A.currentTime);$('#dcpDur').textContent=tm(du)}
function ptick(n){if(!$('#dcPlay').classList.contains('show')){praf=0;return}
  const dt=Math.min(50,n-(pl||n));pl=n;if(!A.paused)pang+=dt*.045*A.playbackRate;
  if(pface)pface.style.transform=`rotate(${pang}deg)`;if(!A.paused||dragW)drawWave();praf=requestAnimationFrame(ptick)}
async function openPlay(d){const url=await IMG.get(d.audio);if(!url)return toast('这张唱片的声音找不到了');
  pd=d;ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#2F2A2C';
  const i=DATA.disc.indexOf(d);$('#dcpDisc').innerHTML=faceHTML(d,i);pface=$('#dcpDisc .dc-face');pang=rot;
  $('#dcpTt').textContent=d.title;$('#dcpSub').textContent=`No. ${p2(i+1)} · ${KIND[d.kind]||''} · ${fmtDate(d.t)}`;
  $('#dcpLyr').textContent=d.text||'（这张没有文字）';$('#dcpLyr').hidden=true;$('#dcpSp').textContent=SPD[si]+'×';
  A.src=url;A.defaultPlaybackRate=SPD[si];A.playbackRate=SPD[si];
  $('#dcPlay').classList.add('show');document.body.classList.add('dcp');
  if(!d.peaks||!d.peaks.length){const k=await peaksOf(url);d.peaks=k.peaks;if(!d.dur)d.dur=k.dur;save()}
  drawWave();setBtn();if(!praf){pl=0;praf=requestAnimationFrame(ptick)}
  A.play().catch(()=>{})}
function closePlay(){A.pause();$('#dcPlay').classList.remove('show');document.body.classList.remove('dcp')}
A.addEventListener('play',setBtn);A.addEventListener('pause',setBtn);
A.addEventListener('ended',()=>{setBtn();drawWave()});
A.addEventListener('loadedmetadata',()=>{A.playbackRate=SPD[si];drawWave()});
A.addEventListener('timeupdate',()=>{if(A.paused)drawWave()});
$('#dcpPlay').onclick=()=>{if(A.paused){if(A.ended)A.currentTime=0;A.play().catch(()=>{})}else A.pause()};
$('#dcpSp').onclick=()=>{si=(si+1)%SPD.length;A.playbackRate=SPD[si];$('#dcpSp').textContent=SPD[si]+'×'};
$('#dcpB').onclick=()=>{A.currentTime=Math.max(0,A.currentTime-5);drawWave()};
$('#dcpF').onclick=()=>{A.currentTime=Math.min(durOf()||0,A.currentTime+5);drawWave()};
$('#dcpTx').onclick=()=>{const l=$('#dcpLyr');l.hidden=!l.hidden};
$('#dcpX').onclick=closePlay;
const wv=$('#dcpWave'),seek=e=>{const r=wv.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),du=durOf();if(du)A.currentTime=f*du;drawWave()};
wv.addEventListener('pointerdown',e=>{dragW=true;try{wv.setPointerCapture(e.pointerId)}catch(x){}seek(e)});
wv.addEventListener('pointermove',e=>{if(dragW)seek(e)});
['pointerup','pointercancel'].forEach(v=>wv.addEventListener(v,()=>dragW=false));
/* 播放页的唱片也能上下拨：转一圈 = 前后 10 秒 */
let pg=null;const pdk=$('#dcpDisc');
pdk.addEventListener('pointerdown',e=>{pg={y:e.clientY};try{pdk.setPointerCapture(e.pointerId)}catch(x){}});
pdk.addEventListener('pointermove',e=>{if(!pg)return;const dy=e.clientY-pg.y;pg.y=e.clientY;pang+=dy*.9;
  const du=durOf();if(du)A.currentTime=Math.max(0,Math.min(du,A.currentTime+dy*.9/36));drawWave()});
['pointerup','pointercancel'].forEach(v=>pdk.addEventListener(v,()=>pg=null));
$('#dcpM').onclick=()=>{const d=pd;if(!d)return;sheet([
  ['改名字',async()=>{const v=(prompt('新名字',d.title)||'').trim();if(!v)return;d.title=v.slice(0,12);await save();$('#dcpTt').textContent=d.title;
    $('#dcpDisc .dc-tag span').textContent=d.title;if(DATA.disc[cur]===d)refresh()}],
  ['保存到手机',async()=>{const u=await IMG.get(d.audio);if(!u)return;const b=await(await fetch(u)).blob(),ext=(b.type.split('/')[1]||'wav').replace('mpeg','mp3');
    shareFile(new File([b],`${d.title||'唱片'}.${ext}`,{type:b.type}))}],
  ['删除这张唱片',async()=>{if(!confirm('删除这张唱片？'))return;closePlay();const id=d.audio;DATA.disc=DATA.disc.filter(x=>x!==d);
    await save();IMG.del([id]);cur=Math.min(cur,Math.max(0,DATA.disc.length-1));show(cur)}]])};

/* ---------- 他记得自己录过什么 ---------- */
HOOKS.context.push(()=>{const L=DATA.disc.filter(d=>!d._wait&&d.kind!=='mine').slice(-3);if(!L.length)return '';
  return '【唱片】你最近录给她的：'+L.map(d=>`「${d.title}」`).join('、')+'。她可能会提到，自然接住就好。'});

/* ---------- 入口：More 里的「唱片」 ---------- */
if(typeof addMore==='function')addMore({go:'disc',cn:'唱片',ce:'records'});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.disc))DATA.disc=[];cur=Math.max(0,DATA.disc.length-1)});
HOOKS.page.push(n=>{page=n;if(n==='disc'){$('#dcDisc').classList.add('in');$('#dcDisc').innerHTML='';show(cur,false)}else closePlay()});
})();
