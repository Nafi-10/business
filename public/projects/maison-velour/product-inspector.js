import { demoOffers,formatPrice,normalizeQuantity } from './product-commerce.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const introductions={
  chanel:'Sparkling orange opens into jasmine and May rose, followed by patchouli and vetiver. A fresh, ambery composition with an unmistakable presence.',
  dior:'Ylang-ylang, Damascus rose and jasmine come together in a luminous floral bouquet. A generous, graceful expression of the Dior fragrance house.',
  'tom-ford':'A warm woody composition of oud, sandalwood and vetiver, with aromatic cardamom and the soft depth of tonka bean and amber.'
};
const botanical=`<svg class="inspector-botanical" viewBox="0 0 220 260" fill="none" aria-hidden="true"><path d="M47 240C96 188 98 102 174 23M104 160C72 167 45 145 40 117C71 114 102 130 104 160ZM122 118C119 82 143 59 174 52C178 82 155 113 122 118ZM82 200C55 198 33 176 29 158C52 158 75 174 82 200ZM151 77C172 82 196 67 202 43C179 39 158 56 151 77Z"/><path d="M104 160L40 117M122 118L174 52M82 200L29 158M151 77L202 43"/></svg>`;
export function inspectorMarkup(p,{saved,bagCount}) {
  const offer=demoOffers[p.id],notes=p.noteLabels||p.notes.split(' · '),photograph=p.hasModel===false;
  const description=introductions[p.id]||p.description||p.subtitle;
  const family=p.family||p.tags.filter(t=>!['For Her','For Him','Unisex'].includes(t)).slice(0,2).join(' · ');
  const mood=p.id==='delina'?'rose':p.tags.includes('Woody')&&!p.tags.includes('Floral')?'wood':'amber';
  return `<div class="inspector-experience" data-scene="fragrance" data-mood="${mood}">
    <div class="inspector-topline"><button class="inspector-return" data-inspector-return>${icon('arrow')}<span>Back to discovery</span></button><span class="inspector-maison">MAISON VELOUR <i>the private view</i></span><button class="inspector-bag" data-dialog="cart" aria-label="View cart">${icon('bag')}<span>Bag <b data-inspector-count>${bagCount}</b></span></button></div>
    <section class="inspector-showcase" aria-label="${escape(p.brand+' '+p.name)} fragrance experience">
      <div class="inspector-atmosphere" aria-hidden="true"><span class="scent-orbit orbit-one"></span><span class="scent-orbit orbit-two"></span><span class="scent-orbit orbit-three"></span>${botanical}</div>
      <div class="inspector-heading"><p class="inspector-brand">${escape(p.brand)}</p><h2 id="dialog-title" class="${p.name.length>19?'title-long':p.name.length>12?'title-medium':''}">${escape(p.name)}</h2></div>
      <div class="inspector-editorial" id="inspector-chapter-copy" role="tabpanel" aria-labelledby="chapter-fragrance" tabindex="0">
        <div data-scene-copy="fragrance"><span class="inspector-label">01 / THE FRAGRANCE</span><h3>${escape(p.subtitle||'A character all its own.')}</h3><p>${escape(description)}</p></div>
        <div data-scene-copy="notes" hidden><span class="inspector-label">02 / THE COMPOSITION</span><h3>A story told<br>in notes.</h3><p>${escape(description)}</p><a class="inspector-source" href="${p.source}" target="_blank" rel="noopener noreferrer">Discover the composition ${icon('arrow')}</a></div>
        <div data-scene-copy="bottle" hidden><span class="inspector-label">03 / THE OBJECT</span><h3>Every angle.<br>Every detail.</h3><p>${photograph?'An intimate portrait of '+escape(p.brand+' '+p.name)+'. Explore the bottle, its concentration and the selected size.':'Turn the bottle slowly. Discover its silhouette, the play of light and the details that make it unmistakable.'}</p><span class="inspector-object-caption">${photograph?'Catalogue photograph':'Interactive 360° study'}</span></div>
      </div>
      <div class="inspector-visual"><div class="inspector-stage" role="group" aria-label="${photograph?'Close-up of':'Rotatable'} ${escape(p.name)} bottle"><div class="inspector-placeholder"><span class="boutique-loader" aria-hidden="true"></span><p>Unveiling the fragrance…</p></div><img class="inspector-fallback" src="${p.portrait||p.image||`./assets/${p.id}.webp`}" alt="${escape(p.brand+' '+p.name)} perfume" hidden></div><div class="inspector-orbit" role="group" aria-label="Bottle rotation controls"><button data-orbit="left" aria-label="Rotate bottle left">${icon('chevron')}</button><button data-orbit="reset" aria-label="Reset bottle view">${icon('reset')}</button><button data-orbit="right" aria-label="Rotate bottle right">${icon('chevron')}</button></div><p class="inspector-gesture">Drag to rotate · Scroll to zoom</p></div>
      <aside class="inspector-composition"><div class="inspector-note-list"><span class="inspector-label">THE SIGNATURE NOTES</span><ul>${notes.map((n,i)=>`<li><span>0${i+1}</span><strong>${escape(n)}</strong></li>`).join('')}</ul><p>${escape(family)}</p></div><div class="inspector-object-facts" hidden><span class="inspector-label">THE BOTTLE</span><dl><div><dt>Concentration</dt><dd>${escape(p.type)}</dd></div><div><dt>Selected size</dt><dd>${offer.size}</dd></div><div><dt>Fragrance house</dt><dd>${escape(p.brand)}</dd></div></dl></div></aside>
      <span class="inspector-model-note">${photograph?'Catalogue product photograph':'Illustrative 3D bottle'}</span>
    </section>
    <div class="inspector-chapter-bar"><span class="inspector-chapter-caption">A CLOSER CONNECTION</span><div class="inspector-chapters" role="tablist" aria-label="Explore the fragrance">${[['fragrance','Fragrance'],['notes','Notes'],['bottle','Bottle']].map(([id,label],i)=>`<button role="tab" id="chapter-${id}" data-chapter="${id}" aria-controls="inspector-chapter-copy" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span>0${i+1}</span>${label}</button>`).join('')}</div><button class="inspector-motion" aria-pressed="true" aria-label="Pause bottle animation"><span class="motion-symbol" aria-hidden="true">Ⅱ</span><span class="motion-label">Motion on</span></button></div>
    <div class="inspector-commerce"><div class="inspector-selected"><span class="inspector-label">YOUR SELECTION</span><strong>${escape(p.name)}</strong><span>${escape(p.type)} <i>·</i> ${offer.size}</span></div><div class="inspector-price"><strong>${formatPrice(offer.priceCents)}</strong><small>Demo price · USD</small></div><div class="inspector-purchase"><div class="inspector-quantity" role="group" aria-label="Quantity"><button data-quantity="-1" aria-label="Decrease quantity" disabled>−</button><output aria-label="Selected quantity" aria-live="polite">1</output><button data-quantity="1" aria-label="Increase quantity">+</button></div><button class="inspector-add" data-inspector-add>Add to bag ${icon('bag')}</button><button class="icon-button inspector-save" data-save="${p.id}" aria-label="${saved?'Remove':'Save'} ${escape(p.name)} ${saved?'from':'to'} wishlist" aria-pressed="${saved}">${icon('heart')}</button></div></div>
    <div class="inspector-bottomline"><p class="inspector-confirmation" role="status" aria-live="polite"></p><p class="inspector-disclaimer">Demo pricing · Bag saved on this device · Checkout unavailable. <a href="${p.source}" target="_blank" rel="noopener noreferrer">${escape(p.brand)} fragrance details ↗</a></p></div>
  </div>`;
}
export function mountInspector(host,p,{addToCart,close}) {
  let quantity=1,viewer=null,disposed=false,scene='fragrance';
  const controller=new AbortController(),signal=controller.signal,stage=host.querySelector('.inspector-stage');
  const status=host.querySelector('.inspector-confirmation'),experience=host.querySelector('.inspector-experience');
  const motionButton=host.querySelector('.inspector-motion'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!reduced.matches;
  function updateMotion(){experience.dataset.motion=motion?'on':'off';motionButton.setAttribute('aria-pressed',String(motion));motionButton.setAttribute('aria-label',`${motion?'Pause':'Play'} bottle animation`);motionButton.querySelector('.motion-label').textContent=motion?'Motion on':'Motion off';motionButton.querySelector('.motion-symbol').textContent=motion?'Ⅱ':'▷';viewer?.setMotion(motion);}
  function changeScene(next){
    scene=next;experience.dataset.scene=scene;
    host.querySelectorAll('[data-chapter]').forEach(b=>{const active=b.dataset.chapter===scene;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    host.querySelectorAll('[data-scene-copy]').forEach(el=>el.hidden=el.dataset.sceneCopy!==scene);
    host.querySelector('#inspector-chapter-copy').setAttribute('aria-labelledby',`chapter-${scene}`);
    host.querySelector('.inspector-note-list').hidden=scene==='bottle';host.querySelector('.inspector-object-facts').hidden=scene!=='bottle';viewer?.setScene(scene);
  }
  updateMotion();reduced.addEventListener('change',()=>{motion=!reduced.matches;updateMotion();},{signal});
  host.addEventListener('keydown',event=>{
    if(!event.target.matches('[data-chapter]'))return;
    const tabs=[...host.querySelectorAll('[data-chapter]')],index=tabs.indexOf(event.target);
    let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
    event.preventDefault();changeScene(tabs[next].dataset.chapter);tabs[next].focus();
  },{signal});
  host.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.quantity){quantity=normalizeQuantity(quantity+Number(b.dataset.quantity));host.querySelector('.inspector-quantity output').textContent=quantity;host.querySelector('[data-quantity="-1"]').disabled=quantity===1;host.querySelector('[data-quantity="1"]').disabled=quantity===10;status.textContent='';}
    else if(b.hasAttribute('data-inspector-add')){const count=addToCart(p.id,quantity);host.querySelector('[data-inspector-count]').textContent=count;status.textContent=`${quantity===1?'One bottle':quantity+' bottles'} of ${p.name} added to your bag.`;b.classList.add('has-added');b.innerHTML=`Add another ${icon('bag')}`;}
    else if(b.hasAttribute('data-inspector-return'))close();else if(b.dataset.orbit)viewer?.rotate(b.dataset.orbit);else if(b.dataset.chapter)changeScene(b.dataset.chapter);else if(b.classList.contains('inspector-motion')){motion=!motion;updateMotion();}
  },{signal});
  function showPhoto(reason){stage.querySelector('.inspector-placeholder').hidden=true;stage.querySelector('.inspector-fallback').hidden=false;stage.dataset.ready='photograph';host.querySelector('.inspector-orbit').hidden=true;host.querySelector('.inspector-gesture').textContent=reason||'The fragrance portrait';host.querySelector('.inspector-model-note').textContent=p.hasModel===false?'Catalogue product photograph':'Illustrative product portrait';}
  if(p.hasModel===false)showPhoto();
  else import('./product-viewer.js').then(({createProductViewer})=>{if(disposed||!stage.isConnected)return;viewer=createProductViewer(stage,p.id);viewer.setMotion(motion);viewer.setScene(scene);stage.querySelector('.inspector-placeholder').hidden=true;stage.dataset.ready='true';}).catch(error=>{if(disposed)return;console.warn('Product 3D preview unavailable:',error);showPhoto('Product portrait · 3D view unavailable');});
  return ()=>{disposed=true;controller.abort();viewer?.destroy();};
}
