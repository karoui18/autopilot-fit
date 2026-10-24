(() => {
  const FRAME_COUNT=40, LOOP_MS=360;
  let activeDay='', midnightTimer=null, loopTimer=null, loopFrames=[0], loopPos=0;
  const localDayKey=(d=new Date())=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  const dayState=(key=localDayKey())=>data.days[key] ||= {steps:0,calories:0,protein:0};
  const countFor=(key=localDayKey())=>Math.max(0,Number(dayState(key).cigarettes||0));

  function framesFor(count){
    if(count<=0) return [0];
    const n=Math.min(20,Math.floor(count));
    const a=Math.min(39, n*2-1);
    const b=Math.min(39, n*2);
    return a===b?[a]:[a,b];
  }
  function setFrame(frame){
    const el=document.getElementById('smokingSprite'); if(!el)return;
    const col=frame%10,row=Math.floor(frame/10);
    el.style.backgroundPosition=`${(col/9)*100}% ${(row/3)*100}%`;
    el.dataset.frame=String(frame);
    el.setAttribute('aria-label',`Smoking counter lung character, frame ${frame+1} of 40`);
  }
  function startLoop(count){
    clearInterval(loopTimer);
    loopFrames=framesFor(count); loopPos=0; setFrame(loopFrames[0]);
    const label=document.getElementById('smokingFrameLabel');
    if(label){
      const a=String(loopFrames[0]+1).padStart(2,'0'),b=String(loopFrames.at(-1)+1).padStart(2,'0');
      label.textContent=loopFrames.length>1?`FRAMES ${a}–${b} / 40`:`FRAME ${a} / 40`;
    }
    if(loopFrames.length<2)return;
    loopTimer=setInterval(()=>{
      if(document.hidden)return;
      loopPos=(loopPos+1)%loopFrames.length;
      setFrame(loopFrames[loopPos]);
    },LOOP_MS);
  }
  function lastSevenKeys(){const out=[],d=new Date();for(let i=6;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i);out.push(localDayKey(x))}return out}
  function renderHistory(){
    const host=document.getElementById('smokingHistory');if(!host)return;
    const today=localDayKey();
    host.innerHTML=lastSevenKeys().map(key=>{
      const c=Math.max(0,Number(data.days[key]?.cigarettes||0)),date=new Date(key+'T12:00:00'),
      label=date.toLocaleDateString(undefined,{weekday:'short'}).slice(0,3),h=Math.min(100,c/20*100);
      return `<div class="smoke-day ${key===today?'today':''}"><div class="smoke-bar"><i style="height:${h}%"></i></div><b>${c}</b><span>${label}</span></div>`;
    }).join('');
  }
  function render(){
    activeDay=localDayKey();
    const c=countFor(activeDay),count=document.getElementById('smokingCount'),undo=document.getElementById('undoCigarette');
    if(count)count.textContent=String(c); if(undo)undo.disabled=c<=0;
    renderHistory(); startLoop(c);
  }
  async function change(delta){
    const key=localDayKey(); if(key!==activeDay){activeDay=key;render()}
    const state=dayState(key),old=Math.max(0,Number(state.cigarettes||0)),next=Math.max(0,old+delta);
    if(next===old)return;
    state.cigarettes=next; if(delta>0)state.lastCigaretteAt=new Date().toISOString();
    await DB.save(data); render();
  }
  function scheduleMidnightCheck(){clearInterval(midnightTimer);midnightTimer=setInterval(()=>{if(localDayKey()!==activeDay)render()},30000)}
  function boot(){
    const add=document.getElementById('addCigarette'),undo=document.getElementById('undoCigarette');
    if(!add||!undo||typeof data==='undefined'||!data){setTimeout(boot,150);return}
    if(add.dataset.bound==='1')return;
    add.dataset.bound=undo.dataset.bound='1';
    add.addEventListener('click',()=>change(1)); undo.addEventListener('click',()=>change(-1));
    render(); scheduleMidnightCheck();
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
    window.addEventListener('pageshow',render);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();