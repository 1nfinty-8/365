/* ===== 365 · sw.js · 离线缓存 ===== */
const CACHE='365-app';
const FONTS='365-fonts';
const CORE=['./','index.html','style.css','app.js','chat.js','moments.js','anniv.js','diary.js','capsule.js','manifest.json','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin)e.respondWith(netFirst(r));
  else if(u.hostname==='cdn.jsdelivr.net')e.respondWith(cacheFirst(r));
});
// 自己的文件：有网就拿最新的（最多等 4 秒），没网就用存着的
async function netFirst(req){
  const c=await caches.open(CACHE);
  const net=fetch(req.url,{cache:'no-cache'}).then(res=>{if(res.ok)c.put(req,res.clone());return res});
  const hit=await c.match(req,{ignoreSearch:true});
  if(!hit)return net;
  return Promise.race([net.catch(()=>hit),new Promise(r=>setTimeout(()=>r(hit),4000))]);
}
// 字体：下载一次以后一直用存着的
async function cacheFirst(req){
  const c=await caches.open(FONTS);
  const hit=await c.match(req);if(hit)return hit;
  const res=await fetch(req);if(res.ok)c.put(req,res.clone());return res;
}
