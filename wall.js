/* ===== 365 · wall.js · 浅色、深色各一套壁纸 ===== */
(()=>{
const root=document.documentElement;
const isDk=()=>root.classList.contains('dk');
let cur=null;
async function apply(force){const dk=isDk();localStorage.setItem('365-dk',dk?'1':'0');
  if(!force&&cur===dk)return;cur=dk;
  let d=null;
  try{if(dk&&S.bgDarkId)d=await IMG.get(S.bgDarkId);if(!d)d=await DB.get('bg')}catch(e){}
  applyBg(d||null)}
function mount(){if($('#wlDark'))return;const r=$('#bgReset');if(!r)return;
  r.insertAdjacentHTML('afterend',' <button class="pill ghost" id="wlDark">深色模式壁纸</button>');
  $('#wlDark').onclick=()=>sheet([
    ['选一张',async()=>{const fs=await pickImages(1);if(!fs.length)return;
      try{toast('处理中…');const d=await readImage(fs[0],1800,.85),old=S.bgDarkId;
        S.bgDarkId=await IMG.put(d);saveSettings();if(old)IMG.del([old]);apply(true);toast('深色壁纸换好了')}
      catch(e){toast(e.message)}}],
    ...(S.bgDarkId?[['不用了，和浅色一样',async()=>{const o=S.bgDarkId;S.bgDarkId='';saveSettings();IMG.del([o]);apply(true)}]]:[])])}
new MutationObserver(()=>apply()).observe(root,{attributes:true,attributeFilter:['class']});
HOOKS.ready.push(()=>{mount();apply(true)});
HOOKS.page.push(()=>mount());
})();
