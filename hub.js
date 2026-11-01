/* ===== 365 · hub.js · More ===== */
(()=>{
document.head.insertAdjacentHTML('beforeend',`<style>
.more-grid .card{grid-column:span 3;min-height:clamp(96px,13vh,124px)}
</style>`);

$('#tabbar').insertAdjacentHTML('beforebegin',`
<section class="page" id="page-more"><div class="wrap">
  <div class="head">
    <button class="iconbtn glass" data-go="home" aria-label="返回"><svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <h2>More</h2>
  </div>
  <div class="sub-line">更多的小房间。</div>
  <div class="grid more-grid" id="moreGrid"></div>
</div></section>`);

const home=$('#page-home .card[data-go="moments"]');
if(home){home.dataset.go='more';home.innerHTML='<div class="cn">More</div>'}

const LIST=[];
function render(){
  $('#moreGrid').innerHTML=LIST.length
    ?LIST.map(o=>`<button class="card glass" data-go="${o.go}"><div class="cn">${esc(o.cn)}</div>${o.ce?`<div class="ce">${esc(o.ce)}</div>`:''}</button>`).join('')
    :'<div class="empty" style="grid-column:1/-1">这里会放更多的功能</div>'}
window.addMore=o=>{LIST.push(o);render()};
render();
})();
