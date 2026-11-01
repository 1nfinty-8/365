/* ===== 365 · hub.js · More、小圆点、Safari 顶部颜色 ===== */
(()=>{
$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-more"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回"><svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <h2>More</h2>
  </div>
  <div class="sub-line">更多的小房间。</div>
  <div class="grid more-grid" id="moreGrid"></div>
</div></section>`);
const homeMore=$('#page-home .card[data-go="more"]');

/* ---------- More ---------- */
const LIST=[];
function render(){
  $('#moreGrid').innerHTML=LIST.length
    ?LIST.map(o=>`<button class="card glass" data-go="${o.go}"><div class="cn">${esc(o.cn)}</div>${o.ce?`<div class="ce">${esc(o.ce)}</div>`:''}<i class="ndot"></i></button>`).join('')
    :'<div class="empty" style="grid-column:1/-1">这里会放更多的功能</div>';
  dots()}
window.addMore=o=>{LIST.push(o);render()};

/* ---------- 小圆点 ---------- */
const LSG=k=>{try{return JSON.parse(localStorage.getItem('365-'+k))}catch(e){return null}};
const LSS=(k,v)=>localStorage.setItem('365-'+k,JSON.stringify(v));
const CHECK={},SEEN={},ALIAS={dtalk:'deep'};
let page='home',ok=false;
window.addDot=(go,fn,onSeen)=>{CHECK[go]=fn;if(onSeen)SEEN[go]=onSeen};
function seen(go){let s=LSG('seen-'+go);if(s==null){s=Date.now();LSS('seen-'+go,s)}return s}
function dots(){if(!ok)return;
  const cur=ALIAS[page]||page;let any=false;
  for(const go in CHECK){
    if(go===cur){LSS('seen-'+go,Date.now());try{SEEN[go]?.()}catch(e){}}
    let on=false;try{on=go!==cur&&!!CHECK[go](seen(go))}catch(e){}
    if(on)any=true;
    $$(`.card[data-go="${go}"]`).forEach(c=>c.classList.toggle('has-dot',on))}
  homeMore?.classList.toggle('has-dot',any)}

const wishKeys=()=>(DATA.wish||[]).flatMap(w=>[...(w.who==='him'?[w.id]:[]),...(w.his?[w.id+':'+w.his.length]:[])]);
addDot('wish',()=>{const k=wishKeys(),s=LSG('wish-keys');if(!s){LSS('wish-keys',k);return false}return k.some(x=>!s.includes(x))},()=>LSS('wish-keys',wishKeys()));
addDot('deep',s=>(DATA.deep||[]).some(d=>{const c=d.cards?.at(-1);return c&&c.role==='model'&&c.t>s}));
addDot('cal',s=>s<today().getTime()&&(DATA.marks||[]).some(m=>m.date===isoDate(today())));

render();
setInterval(()=>{if(!document.hidden)dots()},1500);
HOOKS.ready.push(()=>{ok=true;dots()});
HOOKS.page.push(n=>{page=n;dots()});
})();

/* ---------- 顶部状态栏：自动取壁纸顶部的颜色 ---------- */
(()=>{
const bg=$('#bg'),mask=$('#mask');if(!bg)return;
let meta=document.querySelector('meta[name="theme-color"]');
if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta)}
const bar=document.createElement('div');
bar.style.cssText='position:fixed;top:0;left:0;right:0;height:max(env(safe-area-inset-top),3px);z-index:150;pointer-events:none';
document.body.appendChild(bar);
let last='';
const rgbOf=s=>(s.match(/[\d.]+/g)||[]).map(Number);
function tint(){
  const m=getComputedStyle(bg).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
  const src=m?m[1]:'',key=src+getComputedStyle(mask||bg).backgroundColor+(mask?getComputedStyle(mask).opacity:'');
  if(key===last)return;last=key;
  const done=c=>{const[mr,mg,mb,ma=1]=rgbOf(mask?getComputedStyle(mask).backgroundColor:'rgba(0,0,0,0)');
    const a=(mask?+getComputedStyle(mask).opacity:0)*ma;
    const f=c.map((v,i)=>Math.round(v*(1-a)+[mr,mg,mb][i]*a));
    const hex='#'+f.map(v=>(v||0).toString(16).padStart(2,'0')).join('');
    bar.style.background=hex;meta.setAttribute('content',hex);
    document.documentElement.style.setProperty('background-color',hex,'important')};
  if(!src)return done(rgbOf(getComputedStyle(bg).backgroundColor).slice(0,3));
  const img=new Image();
  img.onload=()=>{try{
    const c=document.createElement('canvas');c.width=40;c.height=6;
    const g=c.getContext('2d');
    g.drawImage(img,0,0,img.naturalWidth,Math.max(1,img.naturalHeight*.06),0,0,40,6);
    const d=g.getImageData(0,0,40,6).data;let r=0,gg=0,b=0,n=0;
    for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];n++}
    done([r/n,gg/n,b/n].map(Math.round))}catch(e){}};
  img.src=src}
tint();
new MutationObserver(()=>{last='';tint()}).observe(bg,{attributes:true});
setInterval(tint,3000);
})();
