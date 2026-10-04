(() => {
  let quoteTimer=null;
  const rotate=()=>{
    try{
      if(document.hidden||currentView!=='stories'||!Array.isArray(quotes)||quotes.length<2)return;
      quoteIndex=(quoteIndex+1)%quotes.length;
      renderStories();
    }catch{}
  };
  const start=()=>{clearInterval(quoteTimer);quoteTimer=setInterval(rotate,8000)};
  const refreshQuotes=async()=>{
    try{
      const key='autofit_quotes_fetched_at';
      const last=Number(localStorage.getItem(key)||0);
      if(Date.now()-last>21600000){
        await loadQuotes(true);
        localStorage.setItem(key,String(Date.now()));
        if(quotes.length>1)quoteIndex=Math.floor(Math.random()*quotes.length);
        renderStories();renderStoriesStrip();
      }else if(quotes.length>1){
        quoteIndex=Math.floor(Math.random()*quotes.length);
        renderStories();
      }
    }catch{}
  };
  const boot=()=>{start();setTimeout(refreshQuotes,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)start()});
  window.addEventListener('pageshow',start);
})();
