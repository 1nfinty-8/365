/* ===== 365 · wordcloud.js · 词云 ===== */
(()=>{
document.head.insertAdjacentHTML('beforeend',`<style>
.wc-seg{display:flex;gap:4px;background:rgba(255,255,255,.35);border-radius:99px;padding:3px;margin-bottom:14px}
.wc-seg button{flex:1;padding:7px 0;border-radius:99px;font-size:13px;color:var(--sub);letter-spacing:1px}
.wc-seg button.on{background:var(--accent);color:var(--acct)}
.wc-box{padding:8px;margin-bottom:12px}
#wcCanvas{display:block;width:100%;height:360px}
.wc-stat{text-align:center;font-size:12px;color:var(--sub);letter-spacing:1px;margin:0 0 14px}
.wc-top{padding:12px 18px}
.wc-row{display:flex;align-items:baseline;gap:12px;padding:7px 0;border-top:1px solid var(--line)}
.wc-row:first-child{border-top:0}
.wc-n{font-family:var(--num);font-style:italic;font-weight:300;font-size:22px;width:28px;color:var(--sub)}
.wc-w{flex:1;font-size:16px;letter-spacing:2px}
.wc-c{font-size:12px;color:var(--sub)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-cloud"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回"><svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <h2>词云</h2><em>words</em>
  </div>
  <div class="wc-seg" id="wcSeg"><button data-w="me">我说的</button><button data-w="him"><span class="hisName">陆择</span>说的</button><button data-w="all">一起</button></div>
  <div class="wc-box glass"><canvas id="wcCanvas"></canvas></div>
  <div class="wc-stat" id="wcStat"></div>
  <div class="wc-top glass" id="wcTop"></div>
</div></section>`);

const card=$('[data-soon="推送"]');
if(card){card.removeAttribute('data-soon');card.dataset.go='cloud';card.innerHTML='<div class="cn">词云 ☁︎</div>'}

const STOP=new Set('我们 你们 他们 她们 什么 怎么 这个 那个 这些 那些 就是 还是 可以 没有 不是 一个 一下 然后 因为 所以 但是 而且 已经 现在 知道 觉得 真的 这样 那样 这么 那么 自己 时候 的话 还有 怎么样 为什么 是不是 有点 一点 一些 不要 不会 不能 应该 可能 如果 或者 还要 只是 只有 这里 那里 哪里 东西 起来 出来 过来 下来 一样 这种 那种 其实 而已 the and you'.split(' '));
const ok=w=>!STOP.has(w)&&(/[\u4e00-\u9fff]/.test(w)?w.length>=2:/^[a-z]{2,}$/.test(w));
const seg=(window.Intl&&Intl.Segmenter)?new Intl.Segmenter('zh',{granularity:'word'}):null;
function words(text){const out=[];
  if(seg){for(const s of seg.segment(text)){if(!s.isWordLike)continue;const w=s.segment.toLowerCase();if(ok(w))out.push(w)}}
  else for(const run of text.match(/[\u4e00-\u9fff]+|[a-zA-Z]{2,}/g)||[]){
    if(/[a-z]/i.test(run)){const w=run.toLowerCase();if(ok(w))out.push(w)}
    else for(let i=0;i<run.length-1;i++){const w=run.slice(i,i+2);if(ok(w))out.push(w)}}
  return out}

let mode='all',cache={},placed=[];
function count(){
  const key=mode+':'+DATA.chat.length;if(cache.key===key)return cache;
  const m=new Map();let n=0;
  for(const x of DATA.chat){
    if(!x.text)continue;
    if(mode==='me'&&x.role!=='user')continue;
    if(mode==='him'&&x.role!=='model')continue;
    n++;for(const w of words(x.text))m.set(w,(m.get(w)||0)+1)}
  cache={key,n,list:[...m].sort((a,b)=>b[1]-a[1]).slice(0,80)};return cache}

const FONT="'Noto Serif SC','Songti SC','STSong',serif";
async function draw(){
  const cv=$('#wcCanvas'),W=cv.clientWidth,H=cv.clientHeight;if(!W)return;
  const dpr=window.devicePixelRatio||1;cv.width=W*dpr;cv.height=H*dpr;
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const{n,list}=count();placed=[];
  const who=mode==='me'?'我说的':mode==='him'?S.hisName+'说的':'我们一起';
  $('#wcStat').textContent=`${who} · 全部时间 · ${n} 条消息`;
  $('#wcTop').innerHTML=list.length?list.slice(0,10).map(([w,c],i)=>`<div class="wc-row"><span class="wc-n">${i+1}</span><span class="wc-w">${esc(w)}</span><span class="wc-c">${c} 次</span></div>`).join(''):'<div class="empty" style="margin:10px 0">还没有</div>';
  const cs=getComputedStyle(document.documentElement);
  const cols=[cs.getPropertyValue('--accent-t').trim()||'#B4848D',cs.getPropertyValue('--ink').trim()||'#2E1A1F','#8C7A80'];
  g.textBaseline='middle';g.textAlign='left';
  if(!list.length){g.fillStyle=cols[2];g.font=`15px ${FONT}`;g.textAlign='center';g.fillText('聊天还太少，多聊一点再来看',W/2,H/2);return}
  try{await Promise.race([document.fonts.load(`20px 'Noto Serif SC'`,list.map(x=>x[0]).join('')),sleep(2000)])}catch(e){}
  const max=list[0][1],min=list.at(-1)[1],big=Math.min(W/5,54);
  list.forEach(([w,c],i)=>{
    const k=max===min?1:(c-min)/(max-min);
    const size=Math.round(13+Math.sqrt(k)*(big-13));
    g.font=`${i<5?500:400} ${size}px ${FONT}`;
    const tw=g.measureText(w).width,th=size*1.1;
    for(let t=0;t<900;t++){
      const a=t*.35,r=1.8*a;
      const px=W/2+r*Math.cos(a)*1.25-tw/2,py=H/2+r*Math.sin(a)-th/2;
      if(px<4||py<4||px+tw>W-4||py+th>H-4)continue;
      if(placed.some(p=>px<p.x+p.ww+4&&px+tw+4>p.x&&py<p.y+p.hh+2&&py+th+2>p.y))continue;
      g.fillStyle=i<3?cols[0]:cols[i%3];g.globalAlpha=i<3?1:.6+.4*k;
      g.fillText(w,px,py+th/2);placed.push({w,c,x:px,y:py,ww:tw,hh:th});break}
  });
  g.globalAlpha=1}

function setMode(m){mode=m;$$('#wcSeg button').forEach(b=>b.classList.toggle('on',b.dataset.w===m));draw()}
$('#wcSeg').onclick=e=>{const b=e.target.closest('[data-w]');if(b)setMode(b.dataset.w)};
$('#wcCanvas').onclick=e=>{const r=e.target.getBoundingClientRect(),X=e.clientX-r.left,Y=e.clientY-r.top;
  const p=placed.find(p=>X>=p.x&&X<=p.x+p.ww&&Y>=p.y&&Y<=p.y+p.hh);if(p)toast(`「${p.w}」出现了 ${p.c} 次`)};
HOOKS.page.push(n=>{if(n==='cloud')setTimeout(()=>setMode(mode),30)});
})();
