export default async function handler(req,res){
  try{
    const r=await fetch('https://zenquotes.io/api/quotes',{headers:{'User-Agent':'AutopilotFit/1.0'}});
    if(!r.ok)throw new Error(`ZenQuotes ${r.status}`);
    const raw=await r.json();
    const quotes=(raw||[]).slice(0,50).map(x=>({text:x.q,author:x.a})).filter(x=>x.text);
    res.setHeader('Cache-Control','s-maxage=7200, stale-while-revalidate=86400');
    res.status(200).json({quotes,source:'ZenQuotes'});
  }catch(e){res.status(502).json({quotes:[],error:'quote_provider_unavailable'});}
}
