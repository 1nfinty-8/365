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
  return Promise.race([net.catch(()=>hit),new Promise(r=>setTimeout(()=>r(hit),4000))]);
}
async function cacheFirst(req){
  const c=await caches.open(FONTS);
  const hit=await c.match(req);if(hit)return hit;
  const res=await fetch(req);if(res.ok)c.put(req,res.clone());return res;
}

/* ---------- 推送：每条单独弹，编号不会撞，图标上加数字 ---------- */
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(x){d={title:'365',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'365',{body:d.body||'',icon:'apple-touch-icon.png',tag:'365-'+Date.now()+'-'+Math.random(),data:{url:'./'}})
    .then(()=>self.registration.getNotifications())
    .then(n=>self.navigator.setAppBadge&&self.navigator.setAppBadge(n.length))
    .catch(()=>{}))});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{
    for(const c of L)if('focus' in c)return c.focus();
    return clients.openWindow('./')}))});
