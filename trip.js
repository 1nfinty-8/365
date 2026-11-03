/* ===== 365 · trip.js · 关于他：他的足迹 + 硬币 ===== */
(()=>{
if(!Array.isArray(DATA.trips))DATA.trips=[];
if(!Array.isArray(DATA.coins))DATA.coins=[];
Object.assign(DEFAULT,{homeCity:'上海'});
const BACK='<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const T=()=>isoDate(today());
const arr=v=>Array.isArray(v)?v:[];
const J=t=>JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
const add=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return isoDate(d)};
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const km=(a,b)=>{if(!a||!b||a.lat==null||b.lat==null)return null;const r=Math.PI/180,x=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lon-a.lon)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
const fk=n=>Math.round(n).toLocaleString('en-US');
const md=s=>{const d=parseDate(s);return `${d.getMonth()+1}月${d.getDate()}日`};
const SILVER=['#EEF0F3','#DADDE3','#C6CAD2','#B2B7C0','#9EA4AE'];
const HOME={'上海':{lat:31.23,lon:121.47},'北京':{lat:39.9,lon:116.4}};
let busy=false,page='',vc=null;

/* ---------- 点阵地图的陆地轮廓（经度,纬度） ---------- */
const LAND=[
[-168,66,-162,70,-140,70,-120,72,-95,72,-80,73,-65,62,-55,52,-66,45,-75,38,-81,30,-80,25,-90,29,-97,26,-97,20,-90,15,-83,9,-78,8,-86,13,-105,20,-112,30,-118,34,-124,40,-124,48,-135,58,-150,60,-165,60],
[-55,60,-42,60,-20,70,-18,82,-60,82,-72,77],
[-78,8,-60,10,-50,0,-35,-5,-39,-15,-48,-25,-58,-35,-65,-42,-68,-55,-75,-50,-73,-35,-71,-18,-80,-5,-80,2],
[-10,36,-9,43,-2,44,-5,48,-1,50,5,53,8,57,5,62,15,69,28,71,40,67,60,69,80,73,100,77,120,73,140,72,160,70,180,66,180,62,163,60,155,59,142,59,136,54,141,47,130,42,129,35,122,40,121,31,120,23,110,20,106,10,100,13,103,1,98,8,97,17,92,21,88,22,80,15,77,8,73,18,68,24,57,25,56,27,48,30,50,26,56,23,59,22,52,16,43,13,39,20,34,28,32,31,35,36,27,37,26,40,23,36,20,40,18,40,16,38,12,42,8,44,3,43,0,39,-6,36],
[-17,21,-10,30,-6,36,10,37,20,32,32,31,34,28,43,12,51,12,42,0,40,-10,35,-24,27,-34,18,-34,12,-17,13,-5,9,4,-8,5,-17,14],
[-6,50,2,51,0,54,-3,59,-6,57],[-24,64,-14,64,-14,66,-22,66],
[130,31,136,34,140,36,142,40,141,45,145,44,140,42,139,38,135,35,130,34],
[120,22,122,25,121,25],[120,18,122,18,126,7,124,6,120,14],
[95,5,106,-6,115,-8,120,-9,125,-9,120,-5,119,1,117,7,110,2,104,1],
[131,-1,141,-3,150,-10,141,-9,132,-4],
[114,-22,122,-18,130,-12,137,-12,142,-11,146,-18,153,-26,150,-37,141,-38,133,-32,115,-34],
[172,-34,178,-38,174,-41,167,-46,170,-44],[44,-25,47,-25,50,-15,49,-12,44,-16]];
function pip(x,y,p){let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],yi=p[i+1],xj=p[j],yj=p[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}

document.head.insertAdjacentHTML('beforeend',`<style>
#himGrid .hm-trip{grid-column:1/-1;min-height:clamp(110px,15vh,150px)}
.tp-hero{padding:20px 22px 16px;margin-bottom:14px;text-align:center}
.tp-lb{font-size:12px;color:var(--sub);letter-spacing:3px}
.tp-city{font-family:var(--ti);font-size:30px;letter-spacing:4px;margin-top:4px}
.tp-city em{display:block;font-family:var(--en);font-style:italic;font-size:15px;color:var(--sub);letter-spacing:1px}
.tp-line{display:flex;align-items:center;gap:10px;margin:16px 4px 6px;font-size:12px;color:var(--sub);letter-spacing:1px}
.tp-line i{flex:1;border-top:1.5px dashed var(--accent);margin-bottom:16px}
.tp-line span{display:flex;flex-direction:column;align-items:center;min-width:40px}
.tp-line span::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--accent-t);margin-bottom:5px}
.tp-line small{font-size:10.5px}
.tp-km{font-size:14px;letter-spacing:2px}
.tp-km b{font-family:var(--num);font-style:italic;font-weight:300;font-size:34px;color:var(--accent-t);margin:0 4px}
.tp-sub{font-size:12px;color:var(--sub);letter-spacing:2px;margin-top:6px}
.tp-map{position:relative;padding:12px;margin-bottom:6px}
#tpMap{display:block;width:100%}
#tpPins{position:absolute;left:12px;top:12px;right:12px;bottom:12px;pointer-events:none}
.tp-pin{position:absolute;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--accent)}
.tp-pin.cs{background:#B9BEC7;box-shadow:0 0 0 1.5px #fff}
.tp-pin.cg{background:#D9B45A;box-shadow:0 0 0 1.5px #fff}
.tp-pin.home{background:none;box-shadow:inset 0 0 0 1.5px var(--accent-t);width:9px;height:9px;margin:-4.5px 0 0 -4.5px}
.tp-pin.her{background:var(--ink);width:6px;height:6px;margin:-3px 0 0 -3px}
.tp-pin.now{width:10px;height:10px;margin:-5px 0 0 -5px;background:var(--accent-t)}
.tp-pin.now::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1.5px solid var(--accent-t);animation:tpP 2s infinite}
@keyframes tpP{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.6);opacity:0}}
.tp-lg{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--sub);letter-spacing:1px;margin:0 0 18px}
.tp-lg i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px;vertical-align:0}
.tp-h{font-size:12px;color:var(--sub);letter-spacing:3px;margin:6px 4px 10px}
.tp-coins{display:flex;gap:14px;overflow-x:auto;padding:4px 4px 16px;scrollbar-width:none}
.tp-coins::-webkit-scrollbar{display:none}
.tp-coin{flex:none;width:76px;height:76px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#45484f;box-shadow:inset 0 0 0 3px rgba(255,255,255,.45),inset 0 0 0 4px rgba(0,0,0,.08),0 4px 10px rgba(0,0,0,.15)}
.tp-coin:active{transform:scale(.94)}
.tp-coin small{font-family:var(--num);font-style:italic;font-size:11px;opacity:.7}
.tp-coin b{font-family:var(--ti);font-weight:500;font-size:13px;letter-spacing:1px;max-width:62px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.tp-coin.gold{color:#5a4210}
.tp-none{font-size:13px;color:var(--sub);margin:0 4px 18px;letter-spacing:1px}
.tp-trip{display:block;width:100%;text-align:left;padding:16px 18px;margin-bottom:12px}
.tp-tt{display:flex;align-items:center;gap:8px}
.tp-tt b{font-weight:500;font-size:16px;letter-spacing:2px}
.tp-tt i{font-style:normal;font-size:11px;padding:1px 8px;border-radius:99px;background:var(--accent);color:var(--acct)}
.tp-tm{font-size:12px;color:var(--sub);margin-top:3px;letter-spacing:1px}
.tp-route{font-family:var(--ti);font-size:15px;margin-top:8px;letter-spacing:1px}
.tp-fav{font-size:12.5px;color:var(--sub);margin-top:4px}
#tpTB{max-height:60vh;overflow-y:auto}
.tv-why{font-size:13px;color:var(--sys-sub);text-align:center;margin-bottom:4px}
.tv-s{margin-top:18px}
.tv-c{font:600 16px var(--cn);color:var(--sys-txt)}
.tv-d{font-size:12px;color:var(--sys-sub)}
.tv-sp{font-size:14.5px;line-height:1.6;margin-top:6px;color:var(--sys-txt)}
.tv-sp b{font-weight:600}
.tv-card{margin-top:8px;padding:12px 14px;border-radius:12px;background:var(--sys-card);color:var(--sys-txt);font-family:var(--ti);font-size:15px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
.tv-coin{font-size:12.5px;color:var(--sys-sub);margin-top:6px}
.tp-flip{width:210px;height:210px;margin:10px auto 6px;position:relative;transform-style:preserve-3d;transition:transform .7s;cursor:pointer}
.tp-flip.f{transform:rotateY(180deg)}
.tp-face{position:absolute;inset:0;border-radius:50%;-webkit-backface-visibility:hidden;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:28px;color:#45484f;box-shadow:inset 0 0 0 7px rgba(255,255,255,.4),inset 0 0 0 8px rgba(0,0,0,.08),0 12px 26px rgba(0,0,0,.2)}
.tp-face.back{transform:rotateY(180deg);font-family:var(--ti);font-size:14px;line-height:1.7}
.tp-face small{font-family:var(--num);font-style:italic;font-size:13px;opacity:.7}
.tp-face b{font-family:var(--ti);font-weight:500;font-size:26px;letter-spacing:4px}
.tp-face em{font-family:var(--en);font-style:italic;font-size:14px;opacity:.75}
.tp-face.gold{color:#5a4210}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-trip"><div class="wrap">
  <div class="head"><button class="iconbtn glass" data-go="him" aria-label="返回">${BACK}</button><h2>他的足迹</h2><em>footprints</em><span class="sp"></span><button class="iconbtn glass" id="tpMenu" style="letter-spacing:1px">···</button></div>
  <div id="tpBody"></div>
</div></section>`);
$('#app').insertAdjacentHTML('beforeend',`
<div class="modal" id="tpTrip"><div class="mbox"><h3 id="tpTT"></h3><div id="tpTB"></div><div class="mbtns"><button class="pill" data-close="tpTrip">好</button></div></div></div>
<div class="modal" id="tpCoin"><div class="mbox" style="text-align:center">
  <div class="tp-flip" id="tpFlip"><div class="tp-face" id="tpF1"></div><div class="tp-face back" id="tpF2"></div></div>
  <p class="hint" style="color:var(--sys-sub)">点硬币翻面</p>
  <div class="mbtns" style="justify-content:center"><button class="pill ghost" id="tpGold"></button><button class="pill" data-close="tpCoin">好</button></div>
</div></div>`);

/* 「关于他」里加一张卡 */
function card(){if($('#himGrid [data-go="trip"]'))return;const g=$('#himGrid');if(!g)return;const d=g.querySelector('.hm-day');
  const h='<button class="card glass hm-trip" data-go="trip"><div class="cn">他的足迹</div><div class="ce">footprints</div><div class="hm-now" id="tpNow"></div></button>';
  if(d)d.insertAdjacentHTML('afterend',h);else g.insertAdjacentHTML('afterbegin',h)}
card();

/* ---------- 位置 ---------- */
function her(){try{const l=JSON.parse(localStorage.getItem('365-loc'));if(l&&l.lat!=null)return l}catch(e){}return S.wxCity||null}
function home(){const g=S.homeGeo;if(g&&g.name===S.homeCity)return g;return HOME[S.homeCity]?{name:S.homeCity,...HOME[S.homeCity]}:null}
async function geoHome(){if(home())return;
  try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(S.homeCity)}&count=1&language=zh`);const x=(await r.json()).results?.[0];
    if(x){S.homeGeo={name:S.homeCity,lat:x.latitude,lon:x.longitude};saveSettings();renderAll()}}catch(e){}}
const endOf=t=>add(t.start,t.days-1);
function active(){const d=T();return DATA.trips.find(t=>t.start<=d&&d<=endOf(t))}
const dayOf=t=>daysBetween(parseDate(t.start),today());
function stopNow(t){const d=dayOf(t);return arr(t.stops).find(s=>s.from<=d&&d<=s.to)||arr(t.stops).at(-1)}
const shown=t=>active()===t?arr(t.stops).filter(s=>s.from<=dayOf(t)):arr(t.stops);
function where(){const t=active();if(t){const s=stopNow(t);return {t,city:s.city,en:s.en,lat:s.lat,lon:s.lon}}
  const h=home();return {home:1,city:S.homeCity,lat:h?.lat,lon:h?.lon}}

/* ---------- 定下一趟行程 ---------- */
async function plan(force){
  if(busy||!S.apiKey||active())return;busy=true;renderAll();
  try{
    const abroad=Math.random()<.3,days=abroad?R(12,16):R(2,5),start=T();
    const past=DATA.trips.slice(-8).map(t=>arr(t.stops).map(s=>s.city).join('、')).join('；');
    const j=J(await callAI(sceneSystem('你要出一趟门，先在心里把行程定下来。'),[{role:'user',text:`你住在${S.homeCity}。从今天（${start}）开始，你要${abroad?'出国':'在国内'}出一趟门，一共 ${days} 天。是出差还是旅行、为什么去，按你的人设和工作来定。${abroad?'去一个国家的 2 到 4 个城市。':'去 1 到 2 个城市，不要是'+S.homeCity+'。'}${past?'最近去过：'+past+'，换个地方。':''}
只输出 JSON：{"title":"这趟的名字，四到八个字","country":"国家","why":"为什么出门，一句话","stops":[{"city":"中文城市名","en":"英文城市名","lat":纬度数字,"lon":经度数字,"days":在这里待几天}]}`}]));
    const L=arr(j.stops).filter(s=>s&&s.city&&isFinite(+s.lat)&&isFinite(+s.lon));
    if(!L.length)throw new SyntaxError('empty');
    let d=0;const stops=[];
    for(const s of L){if(d>=days)break;const n=Math.max(1,Math.round(+s.days||1));
      stops.push({id:uid(),city:String(s.city),en:String(s.en||''),lat:+s.lat,lon:+s.lon,from:d,to:Math.min(days-1,d+n-1)});d+=n}
    stops.at(-1).to=days-1;
    DATA.trips.push({id:uid(),start,days,abroad,title:String(j.title||'出门一趟').slice(0,12),country:String(j.country||''),why:String(j.why||''),stops,t:Date.now()});
    S.tripNext=add(add(start,days-1),R(10,25));saveSettings();
    await saveData('trips');toast(`${S.hisName}出门了：${stops[0].city}`)}
  catch(e){if(force)toast(e instanceof SyntaxError?'没读出来，再试一次':e.message)}
  finally{busy=false;renderAll();detail()}}

/* ---------- 到了一个城市：喜欢的地方、明信片、硬币 ---------- */
async function detail(){
  const t=active();if(busy||!t||!S.apiKey)return;
  const s=shown(t).find(x=>!x.spots&&!(x._fail&&Date.now()-x._fail<6e5));if(!s)return;
  busy=true;renderAll();
  try{
    const j=J(await callAI(sceneSystem(`你这趟「${t.title}」${t.why?'（'+t.why+'）':''}，现在到了${s.city}${t.country?'（'+t.country+'）':''}。`),[{role:'user',text:`你在${s.city}待 ${s.to-s.from+1} 天。请写：
1. spots：你在这里最喜欢的 2 到 3 个地方，要真实存在的景点、街道或者小店，每个配一句你自己的感受；
2. card：一段像写在明信片背面、寄给她的话，40 到 100 字；
3. coin：如果你觉得这里以后一定要带她来，yes 写 true，why 写为什么想带她来，一两句；不是每个地方都要，觉得一般就写 false。
不要用 emoji。只输出 JSON：{"spots":[{"name":"","note":""}],"card":"","coin":{"yes":false,"why":""}}`}]));
    const sp=arr(j.spots).filter(x=>x&&x.name).slice(0,3).map(x=>({name:String(x.name),note:String(x.note||'')}));
    if(!sp.length)throw new SyntaxError('empty');
    s.spots=sp;s.card=clean(String(j.card||''));
    if(j.coin&&j.coin.yes&&j.coin.why&&!DATA.coins.some(c=>c.sid===s.id)){
      DATA.coins.push({id:uid(),sid:s.id,no:DATA.coins.length+1,city:s.city,en:s.en,country:t.country,lat:s.lat,lon:s.lon,why:clean(String(j.coin.why)),date:T(),gold:false,t:Date.now()});
      await saveData('coins');toast(`${S.hisName}在${s.city}留了一枚硬币`)}
    await saveData('trips')}
  catch(e){s._fail=Date.now()}
  finally{busy=false;renderAll()}}
function tick(){if(!S.apiKey||busy)return;
  if(active())return detail();
  if(!S.tripNext){S.tripNext=add(T(),R(2,7));saveSettings();return}
  if(T()>=S.tripNext)plan()}

/* ---------- 显示 ---------- */
function coinBg(c){if(c.gold)return 'radial-gradient(circle at 32% 28%,#FFF6D8,#E8C873 45%,#B08A35)';
  const b=SILVER[(c.no-1)%SILVER.length];return `radial-gradient(circle at 32% 28%,#FFFFFF,${b} 50%,${darken(b,.72)})`}
function hero(){const w=where(),h=her(),d=km(w,h),t=w.t;
  return `<div class="tp-hero glass"><div class="tp-lb">${w.home?'他在家':'他现在在'}</div><div class="tp-city">${esc(w.city)}${w.en?`<em>${esc(w.en)}</em>`:''}</div>
  <div class="tp-line"><span>你${h?.name?'<small>'+esc(h.name)+'</small>':''}</span><i></i><span>${esc(S.hisName)}</span></div>
  <div class="tp-km">${d==null?'去「天气」里定位一下，就能算出离你多远':d<30?'就在你身边的城市':`离你 <b>${fk(d)}</b> km`}</div>
  <div class="tp-sub">${t?`${esc(t.title)} · 第 ${dayOf(t)+1} / ${t.days} 天`:busy?esc(S.hisName)+'在收拾行李…':'在家 · 过阵子可能会出门'}</div></div>`}
function coins(){const L=[...DATA.coins].sort((a,b)=>a.no-b.no),g=L.filter(c=>c.gold).length;
  return `<div class="tp-h">硬币 · ${L.length}${g?` · 一起去过 ${g}`:''}</div>`+(L.length
    ?`<div class="tp-coins">${L.map(c=>`<button class="tp-coin${c.gold?' gold':''}" data-coin="${c.id}" style="background:${coinBg(c)}"><small>No.${c.no}</small><b>${esc(c.city)}</b></button>`).join('')}</div>`
    :'<p class="tp-none">他觉得适合带你去的地方，会变成一枚硬币</p>')}
function trips(){const L=[...DATA.trips].sort((a,b)=>b.start.localeCompare(a.start)),a=active();
  return `<div class="tp-h">足迹 · ${L.length}</div>`+(L.length?L.map(t=>{const V=shown(t),fav=V.flatMap(s=>arr(s.spots).slice(0,1).map(x=>x.name));
    return `<button class="tp-trip glass" data-trip="${t.id}"><div class="tp-tt"><b>${esc(t.title)}</b>${t===a?'<i>进行中</i>':''}</div><div class="tp-tm">${md(t.start)}${t.country?' · '+esc(t.country):''} · ${t.days} 天</div><div class="tp-route">${V.map(s=>esc(s.city)).join(' → ')}${t===a&&V.length<t.stops.length?' → …':''}</div>${fav.length?`<div class="tp-fav">他最喜欢：${fav.map(esc).join('、')}</div>`:''}</button>`}).join(''):'<div class="empty">他还没出过门</div>')}
function render(){if(page!=='trip')return;
  $('#tpBody').innerHTML=hero()+'<div class="tp-map glass"><canvas id="tpMap"></canvas><div id="tpPins"></div></div>'
    +'<div class="tp-lg"><span><i style="background:var(--accent)"></i>去过</span><span><i style="box-shadow:inset 0 0 0 1.5px var(--accent-t)"></i>他家</span><span><i style="background:var(--ink)"></i>你</span><span><i style="background:#B9BEC7"></i>硬币</span></div>'
    +coins()+trips();
  requestAnimationFrame(drawMap)}
function drawMap(){const cv=$('#tpMap');if(!cv)return;const W=cv.clientWidth;if(!W)return;const H=Math.round(W*.46);cv.style.height=H+'px';
  const D=devicePixelRatio||1;cv.width=W*D;cv.height=H*D;const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.clearRect(0,0,W,H);
  const st=W/70;g.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--sub').trim()||'#8C7A80';g.globalAlpha=.32;
  for(let y=st/2;y<H;y+=st)for(let x=st/2;x<W;x+=st){const lon=x/W*360-180,lat=80-y/H*138;
    if(LAND.some(p=>pip(lon,lat,p))){g.beginPath();g.arc(x,y,st*.26,0,7);g.fill()}}
  g.globalAlpha=1;
  const P=(lat,lon)=>[(lon+180)/360*W,(80-lat)/138*H],L=[],seen=new Set();
  DATA.trips.forEach(t=>shown(t).forEach(s=>{if(seen.has(s.city))return;seen.add(s.city);L.push([s.lat,s.lon,'v'])}));
  DATA.coins.forEach(c=>L.push([c.lat,c.lon,c.gold?'cg':'cs']));
  const hm=home(),h=her(),w=where();
  if(hm)L.push([hm.lat,hm.lon,'home']);if(h)L.push([h.lat,h.lon,'her']);if(w.lat!=null)L.push([w.lat,w.lon,'now']);
  $('#tpPins').innerHTML=L.map(([a,b,c])=>{const[x,y]=P(a,b);return `<i class="tp-pin ${c}" style="left:${x}px;top:${y}px"></i>`}).join('')}
function renderNow(){const el=$('#tpNow');if(!el)return;const w=where(),d=km(w,her());
  el.textContent=(w.home?'在家 · ':'在')+w.city+(d!=null&&d>=30?` · 离你 ${fk(d)} km`:'')}
function renderAll(){renderNow();render()}

/* ---------- 打开一趟行程 / 一枚硬币 ---------- */
function openTrip(id){const t=DATA.trips.find(x=>x.id===id);if(!t)return;
  $('#tpTT').textContent=t.title;
  $('#tpTB').innerHTML=(t.why?`<div class="tv-why">${esc(t.why)}</div>`:'')+shown(t).map(s=>{const c=DATA.coins.find(x=>x.sid===s.id);
    return `<div class="tv-s"><div class="tv-c">${esc(s.city)}</div><div class="tv-d">${md(add(t.start,s.from))}${s.to>s.from?' – '+md(add(t.start,s.to)):''}</div>
    ${s.spots?s.spots.map(x=>`<div class="tv-sp"><b>${esc(x.name)}</b>${x.note?' · '+esc(x.note):''}</div>`).join('')+(s.card?`<div class="tv-card">${esc(s.card)}</div>`:''):`<div class="tv-sp">${esc(S.hisName)}还在逛…</div>`}
    ${c?`<div class="tv-coin">在这里留了第 ${c.no} 枚硬币</div>`:''}</div>`}).join('');
  openModal('tpTrip')}
function openCoin(id){const c=DATA.coins.find(x=>x.id===id);if(!c)return;vc=c;const d=km(c,her()),bg=coinBg(c);
  $('#tpFlip').classList.remove('f');
  ['#tpF1','#tpF2'].forEach(s=>{const e=$(s);e.style.background=bg;e.classList.toggle('gold',!!c.gold)});
  $('#tpF1').innerHTML=`<small>No.${c.no}</small><b>${esc(c.city)}</b>${c.en?`<em>${esc(c.en)}</em>`:''}<small>${d==null?'':d<30?'就在你身边':'离你 '+fk(d)+' km'}</small>`;
  $('#tpF2').innerHTML=`<div>${esc(c.why)}</div><small style="margin-top:8px">${c.gold?'我们一起去过 · '+md(c.goldDate):md(c.date)+' · 他在这里想到你'}</small>`;
  $('#tpGold').textContent=c.gold?'标回没去过':'我们一起去过了 ✦';
  openModal('tpCoin')}
$('#tpFlip').onclick=()=>$('#tpFlip').classList.toggle('f');
$('#tpGold').onclick=async()=>{const c=vc;if(!c)return;
  if(!c.gold&&!confirm(`你们一起去过${c.city}了？硬币会变成金色。`))return;
  c.gold=!c.gold;c.goldDate=c.gold?T():null;await saveData('coins');
  if(c.gold)toast(`${c.city}变成金色了 ✦`);openCoin(c.id);render()};
$('#tpBody').addEventListener('click',e=>{const c=e.target.closest('[data-coin]');if(c)return openCoin(c.dataset.coin);
  const t=e.target.closest('[data-trip]');if(t)openTrip(t.dataset.trip)});
$('#tpMenu').onclick=()=>{const a=active(),acts=[[`他住在：${S.homeCity}（改）`,()=>{const v=prompt('他住在哪个城市？',S.homeCity);if(!v||!v.trim())return;
  S.homeCity=v.trim();S.homeGeo=null;saveSettings();geoHome();renderAll()}]];
  if(!a)acts.push([busy?'他在收拾行李…':'让他现在出门一趟',()=>plan(true)]);
  else acts.push(['让他提前回家',async()=>{if(!confirm('让他提前结束这趟，回家？'))return;const d=dayOf(a);
    if(!d)DATA.trips=DATA.trips.filter(x=>x!==a);
    else{a.days=d;a.stops=a.stops.filter(s=>s.from<d);a.stops.forEach(s=>s.to=Math.min(s.to,d-1))}
    S.tripNext=add(T(),R(10,25));saveSettings();await saveData('trips');renderAll()}]);
    if(DATA.coins.length)acts.push(['删除一枚硬币',()=>sheet([...DATA.coins].sort((a,b)=>a.no-b.no).map(c=>[`删除 No.${c.no} ${c.city}`,async()=>{if(!confirm(`删除 No.${c.no} ${c.city} 这枚硬币？`))return;DATA.coins=DATA.coins.filter(x=>x!==c);DATA.coins.sort((a,b)=>a.no-b.no).forEach((x,i)=>x.no=i+1);await saveData('coins');renderAll()}]))]);
  if(DATA.trips.length)acts.push(['删除一趟行程',()=>sheet([...DATA.trips].sort((a,b)=>b.start.localeCompare(a.start)).map(t=>[`删除「${t.title}」`,async()=>{if(!confirm(`删除「${t.title}」？这趟留下的硬币也会一起删掉。`))return;const ids=arr(t.stops).map(s=>s.id);DATA.trips=DATA.trips.filter(x=>x!==t);DATA.coins=DATA.coins.filter(c=>!ids.includes(c.sid));DATA.coins.sort((a,b)=>a.no-b.no).forEach((x,i)=>x.no=i+1);if(!active()){S.tripNext=add(T(),R(10,25));saveSettings()}await saveData('trips');await saveData('coins');renderAll()}]))]);
  sheet(acts)};

/* ---------- 他的一天、聊天都跟着行程走 ---------- */
HOOKS.persona.push(()=>{const t=active();
  if(!t){const L=DATA.trips.filter(x=>endOf(x)<T()).sort((a,b)=>endOf(a).localeCompare(endOf(b))).at(-1);
    let s=`【你的生活】你住在${S.homeCity}，平时在这里工作、生活。`;
    if(L&&daysBetween(parseDate(endOf(L)),today())<=2)s+=`你前两天刚从${arr(L.stops).map(x=>x.city).join('、')}回来（${L.title}）。`;
    return s}
  const s=stopNow(t);
  return `【你现在在外面】你这趟「${t.title}」${t.why?'：'+t.why:''}。今天是第 ${dayOf(t)+1} 天，一共 ${t.days} 天，你现在在${s.city}${t.country?'（'+t.country+'）':''}。${s.spots?.length?'你在这里喜欢的地方：'+s.spots.map(x=>x.name).join('、')+'。':''}你的一天、和她聊天都要和这趟行程对得上（时差、天气、在做什么），但不用每句都提。`});

HOOKS.ready.push(()=>{if(!Array.isArray(DATA.trips))DATA.trips=[];if(!Array.isArray(DATA.coins))DATA.coins=[];card();geoHome();renderNow();setTimeout(tick,6000)});
HOOKS.page.push(n=>{page=n;if(n==='trip'){render();tick()}if(n==='him'){card();renderNow();tick()}});
setInterval(()=>{if(!document.hidden)tick()},30*60000);
window.addEventListener('resize',()=>{if(page==='trip')drawMap()});
})();
