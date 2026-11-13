/* ===== 365 · kbfix.js · 打字时输入框不被键盘挡住 ===== */
(()=>{
const vv=window.visualViewport;if(!vv)return;
let lift=null;
function fix(){
  if(lift){lift.style.transform='';lift=null}
  const el=document.activeElement;
  if(!el||!/^(TEXTAREA|INPUT)$/.test(el.tagName)||el.id==='sxInput'||el.closest('.modal'))return;
  let box=el.parentElement;
  while(box&&box!==document.body&&!box.querySelector('button'))box=box.parentElement;
  if(!box||box===document.body||box.id==='app'||box.classList.contains('page'))box=el;
  const over=box.getBoundingClientRect().bottom+8-(vv.offsetTop+vv.height);
  if(over<=0)return;
  box.style.transform=`translateY(${-over}px)`;lift=box}
vv.addEventListener('resize',fix);vv.addEventListener('scroll',fix);
document.addEventListener('focusin',()=>{setTimeout(fix,80);setTimeout(fix,400)});
document.addEventListener('focusout',()=>setTimeout(fix,120));
})();
