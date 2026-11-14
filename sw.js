/* ===== 365 · sw.js · 离线缓存 + 推送 ===== */
const CACHE='365-app';
const FONTS='365-fonts';
const CORE=['./','index.html','style.css','app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin)e.respondWith(netFirst(r));
  else if(u.hostname==='cdn.jsdelivr.net')e.respondWith(cacheFirst(r));
});
async function netFirst(req){
  const c=await caches.open(CACHE);
  const net=fetch(req.url,{cache:'no-cache'}).then(res=>{if(res.ok)c.put(req,res.clone());return res});
  const hit=await c.match(req,{ignoreSearch:true});
  if(!hit)return net;
  return Promise.race([net.catch(()=>hit),new Promise(r=>setTimeout(()=>r(hit),1000))]);
}
async function cacheFirst(req){
  const c=await caches.open(FONTS);
  const hit=await c.match(req);if(hit)return hit;
  const res=await fetch(req);if(res.ok)c.put(req,res.clone());return res;
}

/* ---------- 推送：一句一个通知，图标上的数字按条数累加 ---------- */
async function badgeAdd(n){
  const c=await caches.open('365-badge');
  const r=await c.match('n');const v=(r?+(await r.text())||0:0)+n;
  await c.put('n',new Response(String(v)));
  if(self.navigator.setAppBadge)await self.navigator.setAppBadge(v)}
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(x){d={title:'365',body:e.data?e.data.text():''}}
  const L=String(d.body||'').split(/\n+/).map(s=>s.trim()).filter(Boolean),msgs=L.length?L:[''];
  e.waitUntil((async()=>{
    for(let i=0;i<msgs.length;i++)await self.registration.showNotification(d.title||'365',{body:msgs[i],icon:'apple-touch-icon.png',tag:'365-'+Date.now()+'-'+i+'-'+Math.random(),data:{url:'./'}});
    await badgeAdd(+d.count||msgs.length)})().catch(()=>{}))});
