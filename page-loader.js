/* Shared page loader — same look as the hero page. Include as first script in <head>. */
(()=>{
  const css=`.pg-loader{position:fixed;inset:0;z-index:100000;background:oklch(8% 0.005 50);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.6rem;transition:opacity .8s cubic-bezier(.4,0,.2,1),visibility .8s}.pg-loader.is-done{opacity:0;visibility:hidden;pointer-events:none}.pg-loader{gap:2.2rem;background:#050505;transition:opacity .7s ease,visibility .7s}.pg-loader__brand{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:2rem;line-height:1.1;letter-spacing:.35em;text-transform:uppercase;color:#f4f1ea;text-align:center;text-indent:.35em}.pg-loader__track{width:180px;height:1px;background:rgba(255,255,255,.16);position:relative;overflow:hidden}.pg-loader__fill{position:absolute;left:0;top:0;height:100%;width:0;background:#e8c48a;transition:width .3s ease}.pg-loader__pct{font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.32em;text-transform:uppercase;color:rgba(255,255,255,.55)}html.pg-loading{overflow:hidden}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  document.documentElement.classList.add('pg-loading');
  const el=document.createElement('div');el.className='pg-loader';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="pg-loader__brand">Zhang<br>Yichi</div><div class="pg-loader__track"><div class="pg-loader__fill"></div></div><div class="pg-loader__pct">Loading 0%</div>';
  const mount=()=>document.body.prepend(el);
  document.body?mount():document.addEventListener('DOMContentLoaded',mount);
  const fill=el.querySelector('.pg-loader__fill'),pct=el.querySelector('.pg-loader__pct');
  let shown=0,target=0,done=false;
  const tick=()=>{if(shown<target){shown=Math.min(target,shown+Math.max(.6,(target-shown)*.12));fill.style.width=shown+'%';pct.textContent='Loading '+Math.round(shown)+'%';}if(!done||shown<100)requestAnimationFrame(tick);else finish();};
  const finish=()=>{if(el.classList.contains('is-done'))return;setTimeout(()=>{el.classList.add('is-done');document.documentElement.classList.remove('pg-loading');window.dispatchEvent(new Event('pg-loaded'));},250);};
  requestAnimationFrame(tick);
  // progress: fonts + images + iframes above the fold, then window load
  const t0=performance.now();
  const soft=setInterval(()=>{if(!done)target=Math.min(85,target+Math.max(1,(85-target)*.08));},120);
  const complete=()=>{if(done)return;done=true;clearInterval(soft);target=100;};
  const trackAssets=()=>{const imgs=[...document.images].filter(i=>!i.complete);const frames=[...document.querySelectorAll('iframe')];const all=imgs.length+frames.length;if(!all)return;let n=0;const bump=()=>{n++;target=Math.max(target,Math.min(92,15+(n/all)*77));};imgs.forEach(i=>{i.addEventListener('load',bump,{once:true});i.addEventListener('error',bump,{once:true});});frames.forEach(f=>f.addEventListener('load',bump,{once:true}));};
  document.addEventListener('DOMContentLoaded',()=>{target=Math.max(target,15);trackAssets();});
  const ready=Promise.all([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>window.addEventListener('load',r,{once:true}))]);
  ready.then(()=>{const wait=Math.max(0,900-(performance.now()-t0));setTimeout(complete,wait);});
  setTimeout(complete,8000); // safety cap
})();
