(() => {
  const FRAME_COUNT=40, FRAMES_PER_COFFEE=5, VISUAL_MAX=8, FRAME_MS=135;
  let currentFrame=0, animationToken=0, activeDay='', midnightTimer=null;

  function localDayKey(d=new Date()){
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function dayState(key=localDayKey()){
    if(!data.days[key]) data.days[key]={steps:0,calories:0,protein:0};
    return data.days[key];
  }
  function countFor(key=localDayKey()){return Math.max(0,Number(dayState(key).coffees||0))}
  function frameFor(count){return Math.min(FRAME_COUNT-1,Math.max(0,count)*FRAMES_PER_COFFEE)}
  function setFrame(frame){
    const el=document.getElementById('coffeeSprite');if(!el)return;
    frame=Math.max(0,Math.min(FRAME_COUNT-1,frame));currentFrame=frame;
    const col=frame%10,row=Math.floor(frame/10);
    el.style.backgroundPosition=`${(col/9)*100}% ${(row/3)*100}%`;
    el.setAttribute('aria-label',`Coffee counter brain character, frame ${frame+1} of ${FRAME_COUNT}`);
    const label=document.getElementById('coffeeFrameLabel');if(label)label.textContent=`FRAME ${String(frame+1).padStart(2,'0')} / 40`;
  }
  function animateTo(target){
    const token=++animationToken;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced||target===currentFrame){setFrame(target);return}
    const direction=target>currentFrame?1:-1;
    const tick=()=>{
      if(token!==animationToken||currentFrame===target)return;
      setFrame(currentFrame+direction);
      if(currentFrame!==target)setTimeout(tick,FRAME_MS);
    };
    tick();
  }
  function lastSevenKeys(){
    const out=[],d=new Date();
    for(let i=6;i>=0;i--){
      const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i);
      out.push(localDayKey(x));
    }
    return out;
  }
  function renderHistory(){
    const host=document.getElementById('coffeeHistory');if(!host)return;
    const today=localDayKey();
    host.innerHTML=lastSevenKeys().map(key=>{
      const c=Math.max(0,Number(data.days[key]?.coffees||0));
      const date=new Date(key+'T12:00:00');
      const label=date.toLocaleDateString(undefined,{weekday:'short'}).slice(0,3);
      const h=Math.min(100,c/VISUAL_MAX*100);
      return `<div class="coffee-day ${key===today?'today':''}"><div class="coffee-bar"><i style="height:${h}%"></i></div><b>${c}</b><span>${label}</span></div>`;
    }).join('');
  }
  function render(animate=false){
    activeDay=localDayKey();
    const c=countFor(activeDay);
    const count=document.getElementById('coffeeCount');if(count)count.textContent=String(c);
    const undo=document.getElementById('undoCoffee');if(undo)undo.disabled=c<=0;
    const target=frameFor(c);
    if(animate)animateTo(target);else setFrame(target);
    renderHistory();
  }
  async function change(delta){
    const key=localDayKey();
    if(key!==activeDay){activeDay=key;render(false)}
    const state=dayState(key),old=Math.max(0,Number(state.coffees||0));
    const next=Math.max(0,old+delta);
    if(next===old)return;
    state.coffees=next;
    if(delta>0)state.lastCoffeeAt=new Date().toISOString();
    await DB.save(data);
    const count=document.getElementById('coffeeCount');if(count)count.textContent=String(next);
    const undo=document.getElementById('undoCoffee');if(undo)undo.disabled=next<=0;
    renderHistory();
    animateTo(frameFor(next));
  }
  function scheduleMidnightCheck(){
    clearInterval(midnightTimer);
    midnightTimer=setInterval(()=>{
      const key=localDayKey();
      if(key!==activeDay){activeDay=key;render(false)}
    },30000);
  }
  function boot(){
    const add=document.getElementById('addCoffee'),undo=document.getElementById('undoCoffee');
    if(!add||!undo||typeof data==='undefined'||!data){setTimeout(boot,150);return}
    if(add.dataset.bound==='1')return;
    add.dataset.bound=undo.dataset.bound='1';
    add.addEventListener('click',()=>change(1));
    undo.addEventListener('click',()=>change(-1));
    activeDay=localDayKey();render(false);scheduleMidnightCheck();
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(false)});
    window.addEventListener('pageshow',()=>render(false));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();