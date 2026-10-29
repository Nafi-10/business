import {offerCampaign,seasonalOffers,countdownAt} from './offers-data.js';

export function initOffers({products,isOverlayOpen=()=>false}) {
  const section=document.querySelector('#offers');
  if(!section)return;
  const find=s=>section.querySelector(s),all=s=>[...section.querySelectorAll(s)];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const copy=find('.offer-copy'),plate=find('.offer-platter'),stage=find('.offer-stage');
  const selectors=all('[data-offer-select]'),bottles=all('[data-offer-bottle]');
  const pause=find('[data-offer-pause]'),progress=find('.offer-slide-progress');
  let current=0,visible=false,paused=motion.matches,elapsed=0,lastTime=0,transition=0,rotation=0,expired=false;
  let swapTimer,clockTimer,frame,dialAngle,lastSecond;

  function renderCopy(index) {
    const offer=seasonalOffers[index],product=products.find(p=>p.id===offer.id);
    find('.offer-brand').textContent=product.brand;
    find('#offer-name').textContent=product.name;
    find('.offer-description').textContent=offer.description;
    find('.offer-format').textContent=`${product.type} / ${product.size}`;
    find('.offer-notes').replaceChildren(...product.noteLabels.map(note=>{
      const span=document.createElement('span');span.textContent=note;return span;
    }));
    find('.offer-saving-value').textContent=offer.saving;
    find('.offer-discover').dataset.product=offer.id;
    find('.offer-discover-label').textContent=`Discover ${product.name}`;
    find('.offer-scene-title').textContent=offer.title;
    find('.offer-position').textContent=`0${index+1} / 03`;
    section.dataset.offer=offer.id;
    section.dataset.tone=offer.tone;
    stage.setAttribute('aria-label',`${product.brand} ${product.name} on a circular stone display with botanical accents`);
  }
  function select(index,manual=false) {
    index=(index+seasonalOffers.length)%seasonalOffers.length;
    if(index===current)return;
    clearTimeout(swapTimer);
    const version=++transition;
    current=index;elapsed=0;
    selectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    bottles.forEach((bottle,i)=>bottle.classList.toggle('is-active',i===index));
    rotation+=120;
    plate.style.transform=`rotate(${rotation}deg)`;
    copy.classList.add('is-changing');
    find('.offer-discover').disabled=true;
    const update=()=>{
      if(version!==transition)return;
      renderCopy(index);copy.classList.remove('is-changing');find('.offer-discover').disabled=false;
      if(manual)find('.offer-announcement').textContent=`${products.find(p=>p.id===seasonalOffers[index].id).name}, ${seasonalOffers[index].saving}% demo offer.`;
    };
    if(motion.matches)update();else swapTimer=setTimeout(update,260);
  }
  selectors.forEach((button,i)=>button.addEventListener('click',()=>select(i,true)));
  find('[data-offer-prev]').addEventListener('click',()=>select(current-1,true));
  find('[data-offer-next]').addEventListener('click',()=>select(current+1,true));
  find('.offer-selectors').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const index=event.key==='Home'?0:event.key==='End'?2:current+(event.key==='ArrowRight'?1:-1);
    select(index,true);selectors[current].focus();
  });
  function syncPause(){pause.setAttribute('aria-label',paused?'Play offer carousel':'Pause offer carousel');pause.setAttribute('aria-pressed',String(paused));pause.querySelector('use').setAttribute('href',paused?'#i-play':'#i-pause');}
  pause.addEventListener('click',()=>{paused=!paused;syncPause();});
  motion.addEventListener('change',()=>{paused=motion.matches;syncPause();});

  function tickClock() {
    clearTimeout(clockTimer);
    const time=countdownAt();
    for(const unit of ['days','hours','minutes','seconds']) {
      const digit=find(`[data-countdown="${unit}"]`),value=String(time[unit]).padStart(2,'0');
      if(digit.textContent!==value){
        digit.textContent=value;
        if(visible&&!motion.matches&&!isOverlayOpen())digit.animate([{transform:'translateY(-8px)',opacity:.2},{transform:'translateY(0)',opacity:1}],{duration:400,easing:'cubic-bezier(.2,.7,.2,1)'});
      }
    }
    find('.offer-countdown').setAttribute('aria-label',time.expired?'Demo offer ended':`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds remaining`);
    dialAngle=lastSecond===undefined?time.seconds*6:dialAngle-((lastSecond-time.seconds+60)%60)*6;
    lastSecond=time.seconds;
    find('.offer-clock-hand').style.transform=`rotate(${dialAngle}deg)`;
    if(expired!==time.expired){
      expired=time.expired;section.classList.toggle('is-expired',expired);
      find('.offer-clock-label').textContent=expired?'THIS CHAPTER HAS CLOSED':'THE DEMO EDIT ENDS IN';
      find('.offer-countdown-title').textContent=expired?'Until our next rendezvous.':'A moment to make yours.';
      find('.offer-saving-label').textContent=expired?'PREVIEW ENDED':'DEMO SAVINGS';
      find('.offer-expiry-announcement').textContent=expired?'This demo offer has ended. You can still discover the fragrances.':'';
    }
    if(!document.hidden&&visible&&!time.expired)clockTimer=setTimeout(tickClock,1000-Date.now()%1000+10);
  }
  function animate(now) {
    const delta=lastTime?Math.min(now-lastTime,100):0;lastTime=now;
    const running=visible&&!document.hidden&&!paused&&!isOverlayOpen()&&!section.querySelector(':focus-visible')&&!expired;
    section.dataset.motion=running?'playing':'paused';
    if(running){elapsed+=delta;if(elapsed>=offerCampaign.interval)select(current+1);}
    progress.style.transform=`scaleX(${Math.min(elapsed/offerCampaign.interval,1)})`;
    if(visible&&!document.hidden)frame=requestAnimationFrame(animate);else frame=null;
  }
  function syncActivity(){
    tickClock();lastTime=0;
    if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(animate);
    if(!visible||document.hidden){cancelAnimationFrame(frame);frame=null;section.dataset.motion='paused';}
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncActivity();},{threshold:.08}).observe(section);
  document.addEventListener('visibilitychange',syncActivity);
  window.addEventListener('pageshow',syncActivity);
  find('.offer-deadline').textContent=offerCampaign.deadlineLabel;
  renderCopy(0);syncPause();tickClock();
}
