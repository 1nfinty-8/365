/* ===== 365 · tweaks.js · 右滑返回、2048 不乱动、秘密收进图书馆只列他的回复 ===== */
(()=>{
document.head.insertAdjacentHTML('beforeend',`<style>
#page-g2048{overflow:hidden;overscroll-behavior:none}
#g2B{grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(4,minmax(0,1fr))}
.g2-t{min-width:0;min-height:0;overflow:hidden;line-height:1}
.g2-wrap{touch-action:none}
</style>`);

/* ---------- 右滑返回：从屏幕最左边往右滑 ---------- */
let sx=null,sy=0,st=0;
document.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX<30?t.clientX:null;sy=t.clientY;st=Date.now()},{passive:true});
document.addEventListener('touchend',e=>{if(sx==null)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=Math.abs(t.clientY-sy);sx=null;
  if(dx<70||dy>dx*.6||Date.now()-st>800)return;back()},{passive:true});
function back(){
  if($('#sheet.show')||$('#callUI.show'))return;
  const m=$('.modal.show');if(m){closeModal(m.id);return}
  if($('#gfView.show'))return $('#gvBack').click();
  if($('#reader.show'))return $('#rdBack').click();
  if($('#qr.show'))return $('#qrX').click();
  const p=$('.page.active');if(!p||p.id==='page-secret')return;
  const b=[...p.querySelectorAll('[aria-label="返回"]')].find(x=>x.offsetParent);
  if(b)b.click()}

/* ---------- 秘密收进图书馆：只列他的回复，收过的不再出现 ---------- */
const inLib=t=>DATA.library.some(b=>b.sx&&b.parts.some(p=>p.text.includes(t)));
window.libImport=pre=>{
  const L=DATA.secret||[];
  const idx=L.map((m,i)=>i).filter(i=>L[i].role==='model'&&L[i].text&&!L[i].lib&&!inLib(L[i].text.trim()));
  if(!idx.length)return toast(`${S.hisName}的回复都收过了`);
  const P=(pre||[]).filter(i=>idx.includes(i));
  $('#lbImpList').innerHTML=idx.slice(-200).map(i=>`<label class="mm-pick"><input type="checkbox" data-si="${i}"${P.includes(i)?' checked':''}><span>${esc(L[i].text)}<small>${esc(S.hisName)} · ${fmtDate(L[i].t)}</small></span></label>`).join('');
  const B=[...DATA.library].filter(s=>!s.src).sort((a,b)=>(b.readAt||b.t)-(a.readAt||a.t));
  $('#lbImpBook').innerHTML='<option value="__new">新建一本</option>'+B.map(s=>`<option value="${s.id}">${esc(s.title)}</option>`).join('');
  $('#lbImpBook').value=B.length?B[0].id:'__new';
  const d=new Date();$('#lbImpNew').value=`秘密 · ${d.getMonth()+1}月${d.getDate()}日`;
  $('#lbImpNewRow').style.display=$('#lbImpBook').value==='__new'?'':'none';
  $('#lbImpWay [data-w="one"]')?.click();
  openModal('lbImp');
  requestAnimationFrame(()=>{const c=$('#lbImpList input:checked');(c?c.closest('label'):$('#lbImpList label:last-child'))?.scrollIntoView({block:'center'})})};
$('#lbImpOk').addEventListener('click',()=>{
  const idx=[...$$('#lbImpList input:checked')].map(x=>+x.dataset.si);if(!idx.length)return;
  if($('#lbImpBook').value==='__new'&&!$('#lbImpNew').value.trim())return;
  idx.forEach(i=>{if(DATA.secret[i])DATA.secret[i].lib=true});saveData('secret')});
})();
