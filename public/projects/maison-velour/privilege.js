import {products} from './catalog.js';
import {countdownAt} from './offers-data.js';
import {offers,fragrances,money,campaignId,isActive,priceFor,pairQuote,normalizeBag,bagTotal,milestones,rewardProgress,revealRewards,readReveal} from './privilege-data.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#p-${name}"/></svg>`;
const product=id=>products.find(p=>p.id===id);
const bagKey='velour-privilege-bag-v1',revealKey='velour-privilege-reveal-v1';
let bag=[],memoryOnly=false,filter='all',toastTimer,returnFocus,clockTimer,active=isActive(),revealState=null,revealBusy=false;
const dialog=$('#privilege-bag-dialog');
// Keep the original header space in the document so shrinking never moves the content.
const masthead=$('.p-masthead');
let headerFrame=0;
function updateHeader(){
  headerFrame=0;
  masthead.classList.toggle('is-compact',window.scrollY>48);
}
window.addEventListener('scroll',()=>{
  if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);
},{passive:true});
window.addEventListener('pageshow',updateHeader);
updateHeader();
function toast(message){clearTimeout(toastTimer);$('.toast').textContent=message;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),4000);}
function loadBag(){if(memoryOnly)return bag;try{return normalizeBag(JSON.parse(localStorage.getItem(bagKey)));}catch{return [];}}
function saveBag(next){
  bag=normalizeBag(next);
  try{localStorage.setItem(bagKey,JSON.stringify(bag));memoryOnly=false;}catch{memoryOnly=true;toast('Browser storage is unavailable. This bag will last only while this page stays open.');}
  updateBag();
}
function itemInfo(item){
  if(item.type==='pair'){
    const a=fragrances.find(p=>p.id===item.first),b=fragrances.find(p=>p.id===item.second),quote=pairQuote(item.first,item.second);
    return {name:`${a.name} & ${b.name}`,detail:`${a.size} + ${b.size}`,price:quote.total,image:a.id};
  }
  const offer=offers.find(o=>o.id===item.id),p=product(offer.product);
  return {name:offer.name||p.name,detail:offer.size||`${p.type} · ${p.size}`,price:priceFor(offer),image:offer.product};
}
function addItem(item){
  bag=loadBag();if(bag.length>=100){toast('Your privilege bag is full. Remove a selection before adding another.');return;}
  saveBag([...bag,{...item,key:crypto.randomUUID()}]);
  if(!memoryOnly)toast('Added to your privilege bag. Your rewards have been updated.');
}
function updateBag(){
  const total=bagTotal(bag),reward=rewardProgress(total);
  $('[data-privilege-count]').textContent=bag.length;
  $('.p-bag-button').setAttribute('aria-label',`Open privilege bag, ${bag.length} items`);
  $('#rewards-total').textContent=money(total);
  $('.p-reward-track>span').style.width=`${reward.percent}%`;
  $('.p-reward-track').setAttribute('aria-valuenow',String(Math.min(total,12000)));
  $('.p-reward-track').setAttribute('aria-valuetext',`${money(total)} in your preview bag; ${active?reward.unlocked.length:0} of 3 preview rewards unlocked${active?'':'; campaign ended'}`);
  $('#privilege-milestones').innerHTML=milestones.map(m=>`<li class="${active&&total>=m.amount?'is-unlocked':''}"><span class="p-milestone-seal">${icon('seal')}</span><strong>${money(m.amount)}</strong><b>${m.benefit}</b><small>${!active?'CAMPAIGN ENDED':total>=m.amount?'UNLOCKED IN PREVIEW':m.title}</small></li>`).join('');
  $('#reward-next').textContent=!active?'This preview edit has ended. Future privileges are still to come.':reward.next?`${money(reward.remaining)} to your next privilege: ${reward.next.benefit.toLowerCase()}.`:'All three preview privileges are unlocked. A beautiful finishing touch.';
  if(dialog.open)renderBag();
}
function renderBag(){
  const total=bagTotal(bag),reward=rewardProgress(total);
  $('#privilege-bag-content').innerHTML=`<p class="p-kicker">YOUR MAISON PRIVILEGES</p><h2 id="privilege-bag-title">A considered selection.</h2>`+(bag.length?bag.map(item=>{
    const info=itemInfo(item);return `<article class="p-bag-row"><img src="./assets/${info.image}-bottle.webp" alt=""><div><h3>${esc(info.name)}</h3><p>${esc(info.detail)}</p></div><div><strong>${money(info.price)}</strong><br><button data-remove-privilege="${esc(item.key)}" aria-label="Remove ${esc(info.name)}">Remove</button></div></article>`;
  }).join(''):`<div class="p-bag-empty"><p>Your next discovery is waiting. Add a fragrance, a sample edit, or a pair to see your privileges unfold.</p></div>`)+`<div class="p-bag-summary"><span>Preview subtotal</span><strong>${money(total)}</strong></div><div class="p-bag-rewards">${!active?'This campaign has ended. Prices are now the original demo prices.':reward.unlocked.length?`Your preview privileges<ul>${reward.unlocked.map(m=>`<li>${m.benefit}</li>`).join('')}</ul>`:`Add ${money(reward.remaining)} to discover your first privilege.`}</div><p class="p-fine">Illustrative BDT prices. This bag is separate from fragrance and gifting selections. No payment, reservation or order is created.</p>${memoryOnly?'<p class="p-fine p-storage-note">Storage is unavailable. Selections will not survive closing this page.</p>':''}<button class="p-button" data-close-privilege-bag>Continue discovering ${icon('arrow')}</button>`;
}
function openBag(){bag=loadBag();updateBag();returnFocus=document.activeElement;renderBag();dialog.showModal();document.body.style.overflow='hidden';}
$$('[data-open-privilege-bag]').forEach(b=>b.addEventListener('click',openBag));
$('.p-dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{
  const remove=event.target.closest('[data-remove-privilege]');
  if(remove){saveBag(loadBag().filter(item=>item.key!==remove.dataset.removePrivilege));$('.p-dialog-close').focus();return;}
  if(event.target.closest('[data-close-privilege-bag]'))dialog.close();
  if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
});

function renderProducts(){
  const result=offers.filter(o=>filter==='all'||o.category===filter);
  $('#privilege-product-grid').innerHTML=result.map(offer=>{
    const p=product(offer.product),name=offer.name||p.name;
    const art=offer.samples?'<div class="p-sample-set" aria-hidden="true"><i>MV</i><i>MV</i><i>MV</i><span>THE MAISON SAMPLING EDIT</span></div>':`<img src="./assets/${offer.product}-bottle.webp" alt="" loading="lazy">`;
    return `<article class="p-product-card"><div class="p-product-art" role="group" aria-label="${esc(name)} preview"><span class="p-product-label">${active?offer.label:'THE MAISON COLLECTION'}</span>${art}<button data-add-privilege="${offer.id}" aria-label="Add ${esc(name)} to privilege bag">Add to privilege bag ${icon('bag')}</button></div><p class="p-product-brand">${esc(offer.brand||p.brand)}</p><h3>${esc(name)}</h3><p class="p-product-size">${esc(offer.size||`${p.size} · ${p.type}`)}</p>${offer.samples?`<p class="p-product-size">${esc(offer.description)}</p>`:''}<div class="p-product-prices">${active?`<del>${money(offer.original)}</del>`:''}<strong>${money(priceFor(offer))}</strong></div><a class="p-product-source" href="${esc(p.source)}" target="_blank" rel="noopener">Fragrance details from ${esc(p.brand)} ↗</a></article>`;
  }).join('');
  $('#privilege-result-count').textContent=`${result.length} ${active?'privileges':'fragrances'} to discover`;
  $$('[data-privilege-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.privilegeFilter===filter)));
}
document.addEventListener('click',event=>{
  const category=event.target.closest('[data-category-jump]');
  if(category){filter=category.dataset.categoryJump;renderProducts();}
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.privilegeFilter){filter=button.dataset.privilegeFilter;renderProducts();}
  if(button.dataset.addPrivilege){const offer=offers.find(o=>o.id===button.dataset.addPrivilege);if(offer)addItem({type:'product',id:offer.id});}
  if(button.hasAttribute('data-add-spotlight'))addItem({type:'pair',first:'libre',second:'sauvage'});
});

for(const select of [$('#pair-first'),$('#pair-second')])select.innerHTML=fragrances.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
$('#pair-first').value='libre';$('#pair-second').value='sauvage';
function updatePair(){
  const first=$('#pair-first').value,second=$('#pair-second').value;
  const a=fragrances.find(p=>p.id===first),b=fragrances.find(p=>p.id===second);
  for(const [side,p] of [['first',a],['second',b]]){
    $(`#pair-image-${side}`).src=`./assets/${p.id}-bottle.webp`;
    $(`#pair-name-${side}`).textContent=p.name;$(`#pair-details-${side}`).textContent=`${p.brand} · ${p.size}`;
  }
  $('.p-builder-scene').setAttribute('aria-label',`${a.name} and ${b.name} fragrance pair`);
  try{
    const q=pairQuote(first,second);
    $('#pair-original').hidden=!q.saving;$('#pair-original').textContent=money(q.original);$('#pair-total').textContent=money(q.total);$('#pair-saving').textContent=q.saving?`Privilege: ${money(q.saving)}`:'The original demo pair price';
    $('.p-pair-error').textContent='';$('#pair-form button[type=submit]').disabled=false;
  }catch(error){
    $('.p-pair-error').textContent=error.message;$('#pair-total').textContent='—';$('#pair-original').hidden=true;$('#pair-saving').textContent='';$('#pair-form button[type=submit]').disabled=true;
  }
}
$('#pair-form').addEventListener('change',updatePair);
$('#pair-form').addEventListener('submit',event=>{
  event.preventDefault();const first=$('#pair-first').value,second=$('#pair-second').value;
  try{pairQuote(first,second);addItem({type:'pair',first,second});}catch(error){$('.p-pair-error').textContent=error.message;}
});
function updateSpotlight(){const q=pairQuote('libre','sauvage');$('#spotlight-original').hidden=!q.saving;$('#spotlight-original').textContent=money(q.original);$('#spotlight-price').textContent=money(q.total);$('#spotlight-saving').textContent=q.saving?`Privilege: ${money(q.saving)}`:'Original demo prices · preview offer ended';$('.p-builder .p-section-heading>p').innerHTML=q.saving?'Two moods. Two people. Or two sides of you.<br>Bring your favourites together with a 10% demo privilege.':'Two moods. Two people. Or two sides of you.<br>This privilege edit has ended. Explore pairs at their original demo prices.';}

function storedReveal(){try{return readReveal(localStorage.getItem(revealKey));}catch{return null;}}
function renderReveal(animate=false){
  $$('[data-envelope]').forEach((button,i)=>{
    button.disabled=!!revealState||!isActive()||revealBusy;
    button.classList.toggle('is-open',!!revealState&&i===revealState.choice);
    button.classList.toggle('is-muted',!!revealState&&i!==revealState.choice);
    button.setAttribute('aria-label',revealState&&i===revealState.choice?'Your opened invitation':`Open sealed invitation ${i+1}`);
    if(revealState&&i===revealState.choice)button.querySelector('.p-letter strong').textContent={wrap:'Gift wrap.',vial:'A sample.',welcome:'For you.'}[revealState.reward];
  });
  if(!revealState){$('#reveal-result').hidden=true;$('#reveal-status').textContent=isActive()?'One reveal per browser for this edit. Your choice is remembered on this device.':'This invitation has closed. A new edit will bring a new surprise.';return;}
  const reward=revealRewards[revealState.reward];
  $('#reveal-title').textContent=reward.title;$('#reveal-benefit').textContent=reward.benefit;$('#reveal-detail').textContent=reward.detail;
  $('#reveal-code').textContent=reward.code;
  $('#reveal-form').hidden=revealState.claimed||!isActive();$('.p-code-result').hidden=!revealState.claimed;
  $('#reveal-status').textContent=!isActive()?'Your invitation is remembered, but this preview offer has ended.':revealState.claimed?'Your invitation is saved on this device. No email was sent.':'Your invitation is open. Preview the code with the form below.';
  const show=()=>{$('#reveal-result').hidden=false;};
  if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setTimeout(show,900);else show();
}
async function reveal(choice){
  if(revealBusy||!isActive())return;
  revealBusy=true;
  const choose=()=>{
    revealState=storedReveal();
    if(revealState)return true;
    const values=Object.keys(revealRewards),random=new Uint32Array(1);crypto.getRandomValues(random);
    const state={campaign:campaignId,choice,reward:values[random[0]%values.length],claimed:false};
    try{localStorage.setItem(revealKey,JSON.stringify(state));revealState=storedReveal();return !!revealState;}catch{return false;}
  };
  let saved=false;
  try{saved=navigator.locks?await navigator.locks.request('velour-privilege-reveal',choose):choose();}catch{saved=false;}
  revealBusy=false;
  if(saved)renderReveal(true);else{$('#reveal-status').textContent='Allow browser storage to open an invitation. This lets the maison remember your one reveal.';renderRevealButtons();}
}
function renderRevealButtons(){$$('[data-envelope]').forEach(b=>b.disabled=!!revealState||!isActive());}
$$('[data-envelope]').forEach(button=>button.addEventListener('click',()=>reveal(Number(button.dataset.envelope))));
$('#reveal-form').addEventListener('submit',event=>{
  event.preventDefault();if(!isActive()){renderReveal();return;}
  revealState=storedReveal();if(!revealState){$('#reveal-status').textContent='Please open an invitation first.';return;}
  const claimed={...revealState,claimed:true};
  try{localStorage.setItem(revealKey,JSON.stringify(claimed));revealState=claimed;$('#reveal-email').value='';renderReveal();}catch{$('#reveal-status').textContent='Your browser could not remember this code. Please enable storage and try again.';}
});
$('[data-copy-code]').addEventListener('click',async()=>{
  if(!revealState)return;
  try{await navigator.clipboard.writeText(revealRewards[revealState.reward].code);toast('Demo code copied. No discount is applied in this preview.');}catch{toast('Select the code above to copy it.');}
});
$('#inner-circle-form').addEventListener('submit',event=>{
  event.preventDefault();$('#member-status').textContent='A beautiful beginning. This is a preview confirmation — no subscription was created and no email was sent.';
  $('#inner-circle-form').reset();
});

function updateClock(){
  clearTimeout(clockTimer);const time=countdownAt(),nowActive=!time.expired;
  for(const unit of ['days','hours','minutes','seconds'])$(`[data-privilege-time=${unit}]`).textContent=String(time[unit]).padStart(2,'0');
  $('.p-timer').setAttribute('aria-label',time.expired?'Preview offer ended':`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds remaining`);
  $('#privilege-clock-caption').textContent=time.expired?'THIS INVITATION HAS CLOSED':'THIS INVITATION CLOSES IN';
  document.body.classList.toggle('is-expired',!nowActive);
  if(active!==nowActive){active=nowActive;updateSpotlight();updatePair();renderProducts();updateBag();renderReveal();$('#privilege-expired-announcement').textContent=active?'':'This preview edit has ended. Prices now reflect the original demo amounts.';}
  if(!document.hidden&&nowActive)clockTimer=setTimeout(updateClock,1000-Date.now()%1000+10);
}
window.addEventListener('storage',event=>{
  if(event.key===bagKey||event.key===null){bag=loadBag();updateBag();}
  if(event.key===revealKey||event.key===null){revealState=storedReveal();renderReveal();}
});
window.addEventListener('pageshow',()=>{bag=loadBag();revealState=storedReveal();updateBag();renderReveal();updateClock();});
document.addEventListener('visibilitychange',updateClock);
bag=loadBag();revealState=storedReveal();updateBag();renderProducts();updatePair();updateSpotlight();renderReveal();updateClock();
