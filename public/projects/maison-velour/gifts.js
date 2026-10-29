export function initGifts({ products }) {
  const section=document.querySelector('#gifts');
  if(!section)return;
  const find=s=>section.querySelector(s),all=s=>[...section.querySelectorAll(s)];
  const stage=find('.gift-stage'),button=find('.gift-reveal-button'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let selected='delina',visible=false,hasRevealed=false,version=0,timers=[];
  stage.classList.add('is-enhanced');
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const cancel=()=>{version++;timers.forEach(clearTimeout);timers=[];};
  function syncMotion(){stage.dataset.motion=visible&&hasRevealed&&!document.hidden&&!document.querySelector('#boutique-dialog')?.open&&!motion.matches?'playing':'paused';}
  function finish(){
    stage.dataset.state='open';stage.classList.add('has-revealed');hasRevealed=true;
    button.disabled=false;button.setAttribute('aria-expanded','true');button.querySelector('span').textContent='Replay the reveal';
    stage.setAttribute('aria-label',products.find(p=>p.id===selected).name+' revealed above an open champagne gift box');
    find('#gift-status').textContent=products.find(p=>p.id===selected).name+', beautifully revealed.';syncMotion();
  }
  async function reveal(){
    const wasOpen=hasRevealed;cancel();const current=version;button.disabled=true;hasRevealed=false;syncMotion();
    stage.classList.remove('has-revealed');stage.dataset.state='closed';button.setAttribute('aria-expanded','false');
    await Promise.allSettled([find('[data-gift-bottle="'+selected+'"] img').decode(),find('.gift-box-back').decode()]);
    if(current!==version)return;
    if(motion.matches){finish();return;}
    // Close on replay, lift the hinged lid, then release the bottle from its velvet cradle.
    const openingDelay=wasOpen?1850:80;
    button.querySelector('span').textContent=wasOpen?'Preparing your gift…':'A moment of anticipation…';
    later(()=>{stage.dataset.state='opening';},openingDelay);
    later(()=>{stage.classList.add('has-revealed');},openingDelay+1650);
    later(finish,openingDelay+3500);
  }
  function select(id){
    const p=products.find(p=>p.id===id);if(!p||!find('[data-gift-bottle="'+id+'"]'))return;
    const wasOpen=hasRevealed;cancel();button.disabled=false;selected=id;
    all('[data-gift-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.giftSelect===id)));
    all('[data-gift-bottle]').forEach(el=>el.classList.toggle('is-active',el.dataset.giftBottle===id));
    find('#gift-brand').textContent=p.brand.toUpperCase();find('#gift-name').textContent=p.name;find('#gift-notes').textContent=p.notes;
    find('.gift-discover').dataset.product=id;find('.gift-discover').setAttribute('aria-label','Discover '+p.name);
    if(wasOpen)finish();else{hasRevealed=false;stage.dataset.state='closed';stage.classList.remove('has-revealed');button.setAttribute('aria-expanded','false');button.querySelector('span').textContent='Unveil the gift';}
  }
  all('[data-gift-select]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.giftSelect)));
  button.addEventListener('click',()=>{
    reveal();const r=stage.getBoundingClientRect();
    if(!visible||(innerWidth<=800&&(r.top<30||r.bottom>innerHeight-20)))stage.scrollIntoView({behavior:motion.matches?'auto':'smooth',block:'center'});
  });
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{threshold:.22}).observe(stage);
  document.addEventListener('visibilitychange',syncMotion);
  motion.addEventListener('change',()=>{if(motion.matches&&button.disabled){cancel();finish();}syncMotion();});
  const dialog=document.querySelector('#boutique-dialog');
  if(dialog)new MutationObserver(syncMotion).observe(dialog,{attributes:true,attributeFilter:['open']});
}

