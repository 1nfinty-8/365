/* ===== 365 · kbfix.js · 打字时输入框不被键盘挡住 ===== */
(()=>{
const vv=window.visualViewport;if(!vv)return;
let bar=null;
function pick(el){
  let x=el.parentElement;
  while(x&&x!==document.body&&x.id!=='app'){
    const p=getComputedStyle(x).position;
    if(p==='fixed'||p==='sticky'||(p==='absolute'&&x.querySelector('button')))return x;
    x=x.parentElement}
  return el.parentElement||el}
function fix(){
  const el=document.activeElement;
  const ok=el&&/^(TEXTAREA|INPUT)$/.test(el.tagName)&&el.id!=='sxInput'&&el.id!=='sxPin'&&!el.closest('.mbox');
  if(bar&&(!ok||!bar.contains(el))){bar.style.transform='';bar=null}
  if(!ok)return;
  const b=bar||pick(el);b.style.transform='';
  const over=b.getBoundingClientRect().bottom+8-(vv.offsetTop+vv.height);
  if(over>0){b.style.transform=`translateY(${-over}px)`;bar=b}}
vv.addEventListener('resize',fix);vv.addEventListener('scroll',fix);
document.addEventListener('focusin',()=>{[60,300,600].forEach(t=>setTimeout(fix,t))});
document.addEventListener('focusout',()=>setTimeout(fix,150));
})();
