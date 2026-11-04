/* ===== 365 · momauto.js · 他主动发朋友圈 ===== */
(()=>{
Object.assign(DEFAULT,{momAuto:true});
let busy=false;
const lastHim=()=>Math.max(0,...DATA.moments.filter(p=>p.author==='him').map(p=>p.t||0));
async function post(force){
  if(busy||!S.apiKey||(!force&&S.momAuto===false))return;
  const h=new Date().getHours();
  if(!force&&(h<9||h>=23||Date.now()-lastHim()<20*36e5||Math.random()>.25))return;
  busy=true;
  try{
    const d=(DATA.hday||[]).find(x=>x.date===isoDate(today()));
    const day=d?(d.items||[]).map(x=>`${x.time} ${x.title}`).join('；'):'';
    const recent=recentChat(10);
    const mine=DATA.moments.filter(p=>p.author==='him').slice(0,5).map(p=>'- '+String(p.text||'').slice(0,40)).join('\n');
    const t=await callAI(sceneSystem('这是你们的小窝「365」里的朋友圈，只有你们两个人能看到。你想发一条。'),
      [{role:'user',text:`现在是 ${fmtTime(Date.now())}。${day?'你今天到现在做了：'+day+'。':''}${recent?'\n你们最近的聊天：\n'+recent:''}${mine?'\n你最近发过的，不要重复：\n'+mine:''}
请以${S.hisName}的身份发一条朋友圈：可以是你此刻在做的事、看到的东西、一点吐槽，或者想她，像真人随手发的，不一定和她有关。不超过 80 字，不要 emoji，不要加引号。只输出正文。`}]);
    DATA.moments.unshift({id:uid(),author:'him',text:clean(t),images:[],t:Date.now(),liked:false,comments:[]});
    await saveData('moments');refreshAll()}
  catch(e){if(force)toast(e.message)}
  finally{busy=false}}

/* 开关放在「我的 → 他的消息」 */
function mount(){if($('#maSet'))return;
  const sec=[...$$('#page-me .sec')].find(s=>(s.querySelector('h3')?.textContent||'').trim().startsWith('他的消息'));if(!sec)return;
  const html=`<div id="maSet" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
    <label class="chk"><input type="checkbox" id="maOn"><span>他会主动发朋友圈（大约一天一条）</span></label>
    <div class="btns"><button class="pill ghost" id="maTest">现在让他发一条</button></div></div>`;
  const ci=$('#ciSet');if(ci)ci.insertAdjacentHTML('beforebegin',html);else sec.insertAdjacentHTML('beforeend',html);
  $('#maOn').checked=S.momAuto!==false;
  $('#maOn').onchange=e=>{S.momAuto=e.target.checked;saveSettings()};
  $('#maTest').onclick=()=>{toast(`${S.hisName}在想要发什么…`);post(true)}}

HOOKS.ready.push(()=>{mount();setTimeout(()=>post(),60000)});
HOOKS.page.push(n=>{if(n==='me')mount()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>post(),30000)});
setInterval(()=>{if(!document.hidden)post()},30*60000);
})();
