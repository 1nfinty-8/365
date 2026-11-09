/* ===== 365 · voiceprint.js · 游戏：声纹档案 ===== */
(()=>{
if(!Array.isArray(DATA.vprint))DATA.vprint=[];
if(typeof LISTS!=='undefined'&&!LISTS.includes('vprint'))LISTS.push('vprint');
const save=()=>saveData('vprint');
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6.5" stroke-dasharray="1.5 2"/><circle cx="12" cy="12" r="10.5" stroke-width=".8"/></svg>';
const MONO='ui-monospace,Menlo,monospace',W='#EDE7E9';
const rnd=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)};
const p3=n=>String(n).padStart(3,'0');
const stamp=t=>{const d=new Date(t);return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`};
const db=v=>Math.round(20*Math.log10(Math.max(v,1e-4)));
const nextNo=()=>Math.max(0,...DATA.vprint.map(x=>x.no||0))+1;
let cur=null,rec=null,busy=false;

document.head.insertAdjacentHTML('beforeend',`<style>
body.vpb #tabbar{display:none}
#page-vprint{padding:0;overflow:hidden;background:#0E0C0E!important;color:${W}}
#page-vprint.active{display:flex;flex-direction:column}
#page-vprint .iconbtn{background:rgba(255,255,255,.07);color:${W};border:1px solid rgba(255,255,255,.1)}
.vp-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 4px) 12px 4px}
.vp-top b{flex:1;text-align:center;font-family:${MONO};font-weight:400;font-size:12px;letter-spacing:4px}
.vp-fr{position:relative;flex:none;margin:6px 18px 0;padding:8px}
.vp-fr i{position:absolute;width:16px;height:16px;border-color:rgba(237,231,233,.55);border-style:solid;border-width:0}
.vp-fr i:nth-child(1){left:0;top:0;border-left-width:1px;border-top-width:1px}
.vp-fr i:nth-child(2){right:0;top:0;border-right-width:1px;border-top-width:1px}
.vp-fr i:nth-child(3){left:0;bottom:0;border-left-width:1px;border-bottom-width:1px}
.vp-fr i:nth-child(4){right:0;bottom:0;border-right-width:1px;border-bottom-width:1px}
#vpBox svg{display:block;width:100%;max-height:58vh;animation:fd .6s}
.vp-tx{flex:1;min-height:0;overflow-y:auto;padding:10px 26px 0;text-align:center;font-family:var(--ti);font-size:13.5px;line-height:1.8;color:rgba(237,231,233,.6)}
.vp-ctl{flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 calc(var(--sb) + 14px)}
#vpBtn{width:66px;height:66px;border-radius:50%;border:1px solid rgba(237,231,233,.6);display:grid;place-items:center}
#vpBtn::after{content:"";width:46px;height:46px;border-radius:50%;background:var(--accent);transition:.25s}
#vpBtn.rec::after{width:22px;height:22px;border-radius:5px;background:#FF5A5F}
#vpSt{font-family:${MONO};font-size:10.5px;letter-spacing:2px;color:rgba(237,231,233,.55)}
@media (prefers-reduced-motion:reduce){#vpBox svg{animation:none}}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-vprint">
  <div class="vp-top"><button class="iconbtn" data-go="game" aria-label="返回">${BACK}</button><b>VOICEPRINT ARCHIVE</b><button class="iconbtn" id="vpMenu" style="letter-spacing:1px">···</button></div>
  <div class="vp-fr"><i></i><i></i><i></i><i></i><div id="vpBox"></div></div>
  <div class="vp-tx" id="vpTx"></div>
  <div class="vp-ctl"><button id="vpBtn" aria-label="录音"></button><span id="vpSt"></span></div>
</section>`);

function card(){if($('#page-game [data-go="vprint"]'))return;
  const h=`<button class="gm-card glass" data-go="vprint"><span class="gm-ic">${ICON}</span><span><b>声纹</b><small>把声音存成档案</small></span></button>`;
  const s=$('#page-game .gm-soon');if(s)s.insertAdjacentHTML('beforebegin',h);else $('#page-game .wrap')?.insertAdjacentHTML('beforeend',h)}
card();

/* ---------- 画 ---------- */
function acc(){const c=getComputedStyle(document.body).getPropertyValue('--accent').trim(),m=c.match(/^#([0-9a-f]{6})$/i);
  if(!m)return '#E0A9B3';const n=parseInt(m[1],16),f=v=>Math.round(v+(255-v)*.35);return `rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}
const down=(L,k)=>{if(L.length<=k)return L;const o=[],z=L.length/k;
  for(let i=0;i<k;i++){const g=L.slice(Math.floor(i*z),Math.floor((i+1)*z));o.push({v:g.reduce((a,x)=>a+x.v,0)/g.length,f:Math.round(g.reduce((a,x)=>a+x.f,0)/g.length)})}return o};
const wrap=(s,n)=>{const o=[];for(let i=0;i<s.length;i+=n)o.push(s.slice(i,i+n));return o.slice(0,3)};
function draw(r,live){
  const A=acc(),cx=180,cy=182,s=r.s||[],n=s.length,mv=Math.max(.02,...s.map(x=>x.v)),PI2=Math.PI*2;
  const T=(x,y,t,an='start',c=W,op=.6)=>`<text x="${x}" y="${y}" font-size="7" font-family="${MONO}" fill="${c}" fill-opacity="${op}" text-anchor="${an}" letter-spacing=".8">${esc(t)}</text>`;
  let o='';
  [44,84,124,150].forEach((R,i)=>o+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${W}" stroke-opacity="${i===3?.22:.1}" stroke-width=".5"${i<3?' stroke-dasharray="1 3"':''}/>`);
  o+=`<path d="M${cx-160} ${cy}H${cx+160}M${cx} ${cy-160}V${cy+160}" stroke="${W}" stroke-opacity=".07" stroke-width=".5"/>`;
  for(let k=0;k<72;k++){const a=k/72*PI2,l=k%6?3:7;o+=`<line x1="${(cx+Math.cos(a)*150).toFixed(1)}" y1="${(cy+Math.sin(a)*150).toFixed(1)}" x2="${(cx+Math.cos(a)*(150+l)).toFixed(1)}" y2="${(cy+Math.sin(a)*(150+l)).toFixed(1)}" stroke="${W}" stroke-opacity=".25" stroke-width=".5"/>`}
  /* 她：内圈白点，一个点 = 一小段声音 */
  const P=s.map((x,i)=>{const v=x.v/mv,a=-Math.PI/2+i/Math.max(1,live?Math.max(n,60):n)*PI2,R=48+v*72;return {x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R,v,a,f:x.f,raw:x.v,i}});
  let d='',on=false;P.forEach(p=>{if(p.v<.08){on=false;return}d+=(on?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1);on=true});
  o+=`<path d="${d}" fill="none" stroke="${W}" stroke-opacity=".5" stroke-width=".6"/>`;
  P.forEach(p=>{if(p.v>=.08)o+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(.6+Math.sqrt(p.v)*2.4).toFixed(2)}" fill="${W}" fill-opacity="${(.45+p.v*.55).toFixed(2)}"/>`});
  const pk=[];[...P].sort((a,b)=>b.v-a.v).forEach(p=>{if(pk.length<3&&p.v>=.08&&pk.every(q=>Math.abs(q.i-p.i)>n/8))pk.push(p)});
  /* 他：外圈主题色，一个字 = 一个点 */
  const ch=[...String(r.text||'')].filter(c=>c.trim()),m=ch.length;
  const H=ch.map((c,j)=>{const a=-Math.PI/2+(j+.5)/m*PI2,w=/[！？!?]/.test(c)?1:/[，。、…,.；;：:]/.test(c)?0:.25+rnd(c.charCodeAt(0),j)*.6,R=132+w*14;
    return {x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R,a,w,c}});
  d='';on=false;H.forEach(h=>{if(!h.w){on=false;return}d+=(on?'L':'M')+h.x.toFixed(1)+' '+h.y.toFixed(1);on=true});
  o+=`<path d="${d}" fill="none" stroke="${A}" stroke-opacity=".7" stroke-width=".6"/>`;
  H.forEach(h=>{if(h.w)o+=`<circle cx="${h.x.toFixed(1)}" cy="${h.y.toFixed(1)}" r="${(.8+Math.sqrt(h.w)*2).toFixed(2)}" fill="${A}"/>`;
    if(m<=48)o+=`<text x="${(cx+Math.cos(h.a)*168).toFixed(1)}" y="${(cy+Math.sin(h.a)*168+2.5).toFixed(1)}" font-size="6.5" fill="${W}" fill-opacity=".45" text-anchor="middle" font-family="Georgia,'Songti SC',serif">${esc(h.c)}</text>`});
  /* 呼应：她最响的地方连到他最近的字 */
  if(m)pk.forEach(p=>{let b=null,bd=9;H.forEach(h=>{const x=Math.abs(((h.a-p.a)%PI2+3*Math.PI)%PI2-Math.PI);if(h.w&&x<bd){bd=x;b=h}});
    if(b)o+=`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${A}" stroke-opacity=".6" stroke-width=".5" stroke-dasharray="2 2"/>`});
  pk.forEach((p,k)=>o+=`<rect x="${(p.x-6).toFixed(1)}" y="${(p.y-6).toFixed(1)}" width="12" height="12" fill="none" stroke="${A}" stroke-width=".7"/>`+T((p.x+8).toFixed(1),(p.y-8).toFixed(1),'0'+(k+1),'start',A,1));
  o+=T(12,16,`NO.${p3(r.no)} · ${stamp(r.t)}`)+T(348,16,`${live?'● REC ':''}${(r.dur||0).toFixed(1)}S · ${n} PTS`,'end',live?'#FF5A5F':W,live?1:.6);
  if(n&&!live)o+=T(12,26,`1 DOT = ${((r.dur||0)/n).toFixed(2)}S`,'start',W,.4);
  pk.forEach((p,k)=>o+=T(12,346+k*10,`0${k+1}  ${db(p.raw)}DB  ${p.f}HZ`,'start',A,.85));
  if(n)o+=T(348,346,`HER · ${n} PTS`,'end')+T(348,356,`HIM · ${m} NODES`,'end',A,.85);
  if(!n&&!live)o+=T(180,186,'TAP THE CIRCLE TO RECORD','middle',W,.4);
  if(r.text)wrap(r.text,22).forEach((l,i)=>o+=`<text x="180" y="${384+i*15}" font-size="11" font-family="Georgia,'Songti SC',serif" fill="${W}" text-anchor="middle">${esc(l)}</text>`);
  return `<svg id="vpSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420">${o}</svg>`}
function show(){const r=cur;
  $('#vpBox').innerHTML=draw(r||{no:nextNo(),t:Date.now(),dur:0,s:[],text:''},false);
  $('#vpTx').textContent=r?('她说：'+(r.tx||'（没听清，但他听见了你的声音）')):'点下面的圆，说一句话';
  $('#vpSt').textContent=busy?`${S.hisName.toUpperCase?S.hisName:''} 在听…`:rec?'再点一下，录好了':r?'点画面存成图片 · 点圆圈再录一张':'最长 30 秒';
  $('#vpBtn').classList.toggle('rec',!!rec)}
function live(){if(!rec)return;$('#vpBox').innerHTML=draw({no:nextNo(),t:rec.t0,dur:(Date.now()-rec.t0)/1000,s:down(rec.S,120),text:''},true)}

/* ---------- 录音：音量、音高、转文字 ---------- */
async function start(){if(rec||busy)return;let st;
  try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast('没有麦克风权限')}
  const ac=new(window.AudioContext||window.webkitAudioContext)();ac.resume?.();
  const an=ac.createAnalyser();an.fftSize=2048;ac.createMediaStreamSource(st).connect(an);
  const td=new Float32Array(an.fftSize),fd=new Float32Array(an.frequencyBinCount),hz=ac.sampleRate/an.fftSize,L=[];let tx='',sr=null;
  const iv=setInterval(()=>{an.getFloatTimeDomainData(td);let q=0;for(const x of td)q+=x*x;
    an.getFloatFrequencyData(fd);let b=0,bv=-1e9;for(let i=Math.floor(80/hz);i<Math.ceil(1000/hz);i++)if(fd[i]>bv){bv=fd[i];b=i}
    L.push({v:Math.sqrt(q/td.length),f:Math.round(b*hz)});if(L.length%4===0)live();if(L.length>=500)stop()},60);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){try{sr=new SR();sr.lang='zh-CN';sr.continuous=true;sr.interimResults=true;sr.onresult=e=>{tx=[...e.results].map(r=>r[0].transcript).join('')};sr.start()}catch(e){sr=null}}
  rec={st,ac,iv,sr,S:L,t0:Date.now(),tx:()=>tx};navigator.vibrate?.(15);show();live()}
function end(){const r=rec;rec=null;if(!r)return null;clearInterval(r.iv);try{r.sr?.stop()}catch(e){}
  r.st.getTracks().forEach(t=>t.stop());try{r.ac.close()}catch(e){}return r}
async function stop(){const r=end();if(!r)return;show();await sleep(700);
  const dur=+((Date.now()-r.t0)/1000).toFixed(1);if(dur<1||r.S.length<8){show();return toast('太短了，再说一句')}
  cur={id:uid(),no:nextNo(),t:r.t0,dur,s:down(r.S,120).map(x=>({v:+x.v.toFixed(4),f:x.f})),tx:r.tx().trim(),text:''};
  DATA.vprint.push(cur);if(DATA.vprint.length>200)DATA.vprint.shift();await save();show();ask(cur)}
$('#vpBtn').onclick=()=>rec?stop():start();

/* ---------- 他听完回一句 ---------- */
async function ask(r){if(busy)return;if(!S.apiKey)return toast('还没有填 API Key');busy=true;show();
  try{const L=r.s,mean=L.reduce((a,x)=>a+x.v,0)/L.length,mdb=db(mean),pdb=db(Math.max(...L.map(x=>x.v)));
    const voiced=L.filter(x=>x.v>mean*.5),f=voiced.length?Math.round(voiced.reduce((a,x)=>a+x.f,0)/voiced.length):0;
    let gaps=0,was=true;L.forEach(x=>{const v=x.v>mean*.35;if(was&&!v)gaps++;was=v});
    const vol=mdb<-38?'很轻，几乎是气声':mdb<-28?'偏轻':mdb<-18?'正常':'很大声';
    const spd=r.tx?(r.tx.length/r.dur).toFixed(1)+' 字/秒':'听不出';
    let t=await callAI(sceneSystem('你们在「365」里玩「声纹档案」：她录一句话，365 把她的声音画成一圈点阵，你听完回她一句，你的话也会变成一圈声纹，和她的叠在一起存档。'),
      [{role:'user',text:`她说了 ${r.dur} 秒：「${r.tx||'（没听清说了什么）'}」。声音数据：平均 ${mdb}dB（${vol}），最响 ${pdb}dB，平均音高约 ${f}Hz，停顿 ${gaps} 次，语速 ${spd}。请回她一句话，可以回应她说的内容，也可以回应她的声音本身（轻、急、停顿、发颤、笑）。按你的性格来，不超过 40 字，不要 emoji，不要引号，只输出这句话。`}]);
    t=(clean(t).split('\n').map(x=>x.trim()).filter(Boolean)[0]||'').replace(/^["“「]|["”」]$/g,'');
    if(t.startsWith(S.hisName))t=t.slice(S.hisName.length).replace(/^[:：\s]+/,'');
    if(!t)throw new Error('他没写出来');r.text=t.slice(0,60);await save()}
  catch(e){toast(e.message+'，「···」里可以让他再回一次')}
  finally{busy=false;if(cur===r)show()}}

/* ---------- 存成图片、菜单 ---------- */
async function toImg(){const svg=$('#vpSvg');if(!svg||!cur)return;
  try{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await img.decode();
    const c=document.createElement('canvas');c.width=1080;c.height=1260;const g=c.getContext('2d');g.fillStyle='#0E0C0E';g.fillRect(0,0,c.width,c.height);
    g.drawImage(img,0,0,c.width,c.height);viewImage(c.toDataURL('image/png'));toast('长按图片可以保存')}catch(e){toast('没存成')}}
$('#vpBox').onclick=()=>{if(cur&&!rec)toImg()};
$('#vpMenu').onclick=()=>{if(rec)return;const acts=[],old=DATA.vprint.filter(x=>x!==cur);
  if(old.length)acts.push(['以前的档案',()=>sheet([...old].reverse().slice(0,40).map(x=>[`NO.${p3(x.no)} · ${fmtDate(x.t)} · ${x.dur}″`,()=>{cur=x;show()}]))]);
  if(cur){acts.push(['存成图片',toImg]);if(!busy)acts.push([`让${S.hisName}换一句`,()=>ask(cur)]);
    acts.push(['删除这张',async()=>{if(!confirm('删除这张档案？'))return;DATA.vprint=DATA.vprint.filter(x=>x!==cur);cur=DATA.vprint.at(-1)||null;await save();show()}]);
    acts.push(['新的一张',()=>{cur=null;show()}])}
  if(!acts.length)return toast('还没有档案，先录一张');sheet(acts)};

HOOKS.context.push(()=>{const r=DATA.vprint.at(-1);if(!r||!r.text||Date.now()-r.t>2*36e5)return '';
  return `【声纹】她刚才在 365 里录了一句「${r.tx||'（没听清）'}」给你，你回了「${r.text}」。可以自然地接上，不用刻意提。`});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&rec){end();show()}});
HOOKS.ready.push(()=>{if(!Array.isArray(DATA.vprint))DATA.vprint=[];card()});
HOOKS.page.push(n=>{document.body.classList.toggle('vpb',n==='vprint');
  if(n==='vprint'){cur=DATA.vprint.at(-1)||null;show()}else if(rec)end();
  if(n==='game')card()});
})();
