const version=new URL(import.meta.url).search;
const {sectors,products,filterCollection,carouselItems,readSaved}=await import(new URL('./collection-data.mjs'+version,import.meta.url));
const {productVisual}=await import(new URL('./collection-visuals.mjs'+version,import.meta.url));
const root=document.querySelector('#cs-motion'),rows=root.querySelector('[data-cl-rows]'),dialog=document.querySelector('#cl-dialog');
const search=root.querySelector('#cl-search'),mobile=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
const compactFilters=matchMedia('(max-width:1280px)'),filterPanel=root.querySelector('#cl-filter-panel'),filterToggle=root.querySelector('[data-cl-filter-toggle]');
let filterReturnFocus=filterToggle;
function setFilters(open,{focus=false,restore=false}={}){
  const expanded=!compactFilters.matches||open;
  filterPanel.classList.toggle('is-open',expanded);filterPanel.inert=!expanded;
  filterPanel.setAttribute('aria-hidden',String(!expanded));filterToggle.setAttribute('aria-expanded',String(expanded));
  if(focus&&expanded)search.focus({preventScroll:true});
  if(restore&&compactFilters.matches)filterReturnFocus.focus({preventScroll:true});
}
function revealResults(){
  const target=root.querySelector('[data-cl-empty]').hidden?rows:root.querySelector('[data-cl-empty]');
  const bounds=target.getBoundingClientRect();
  if(bounds.top<100||bounds.top>innerHeight-140)target.scrollIntoView({block:'start',behavior:'instant'});
}
const state={industry:'all',category:'all',query:'',savedOnly:false,saved:[]};
const positions=new Map(),visibleByIndustry=new Map();
let trigger=null,detailProduct=null,scrollTimer=0;
try{state.saved=readSaved(localStorage.getItem('canveliqsoft-collection-saved'));}catch{/* Browsing still works when storage is unavailable. */}
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons=()=>window.lucide?.createIcons();
const announce=text=>root.querySelector('[data-cl-status]').textContent=text;
const arrow=direction=>`<i data-lucide="arrow-${direction<0?'left':'right'}" aria-hidden="true"></i>`;
const inquiryUrl=p=>`./index.html?collection=${encodeURIComponent(p.id)}#cs-contact`;
const isSaved=p=>state.saved.includes(p.id);
function saveButton(p){return `<button type="button" class="cl-save" data-save="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${isSaved(p)}"><i data-lucide="heart" aria-hidden="true"></i></button>`;}
function card(p,featured){return `<article class="cl-card${featured?' is-featured':''}" data-product="${p.id}" aria-label="${esc(p.name)}"><div class="cl-card-top"><span class="cl-kind cl-kind-${p.category}">${esc(p.label.toUpperCase())}</span>${saveButton(p)}</div>${productVisual(p)}<div class="cl-card-body"><h3><button type="button" data-detail="${p.id}">${esc(p.name)}</button></h3><p class="cl-card-description">${esc(p.description)}</p><span class="cl-card-note">${p.category==='erp'?'Tailored quote':'Collection concept'}</span><div class="cl-card-actions">${p.category==='erp'?`<a class="cl-card-action" href="${inquiryUrl(p)}">Request a quote <span aria-hidden="true">↗</span></a>`:`<button class="cl-card-action" type="button" data-detail="${p.id}">${p.category==='design'?'Preview':'View product'} <span aria-hidden="true">↗</span></button>`}<button class="cl-card-details" type="button" data-detail="${p.id}" aria-label="Details for ${esc(p.name)}">Details</button></div></div></article>`;}
function dots(id,list,index){return list.map((p,i)=>`<button type="button" data-select="${i}" data-industry="${id}" aria-label="Feature ${esc(p.name)}" aria-pressed="${i===index}"></button>`).join('');}
function trackContent(list,index){return (mobile.matches?list:carouselItems(list,index)).map(p=>card(p,p.id===list[index]?.id)).join('');}
function centerMobile(row,behavior='instant'){
  if(!mobile.matches)return;
  const track=row.querySelector('.cl-track'),active=track.querySelector('.is-featured');
  if(active)track.scrollTo({left:active.offsetLeft-track.offsetLeft-(track.clientWidth-active.clientWidth)/2,behavior});
}
function updateFeatured(row,index,notify=true){
  const id=row.dataset.industry,list=visibleByIndustry.get(id);if(!list?.length)return;
  index=((index%list.length)+list.length)%list.length;positions.set(id,index);
  const track=row.querySelector('.cl-track');
  if(!mobile.matches){track.innerHTML=trackContent(list,index);if(!reduced.matches)track.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:320,easing:'ease-out'});}
  else track.querySelectorAll('.cl-card').forEach(el=>el.classList.toggle('is-featured',el.dataset.product===list[index].id));
  row.querySelector('.cl-dots').innerHTML=dots(id,list,index);icons();
  if(notify)announce(`${list[index].name}, ${index+1} of ${list.length} in ${list[index].industryName}.`);
}
function move(row,index){updateFeatured(row,index);centerMobile(row,reduced.matches?'instant':'smooth');}
function observeTouch(row){
  const track=row.querySelector('.cl-track');let timer;
  track.addEventListener('scroll',()=>{
    if(!mobile.matches)return;
    clearTimeout(timer);timer=setTimeout(()=>{
      const midpoint=track.getBoundingClientRect().left+track.clientWidth/2;
      const cards=[...track.querySelectorAll('.cl-card')];
      let closest=0,distance=Infinity;
      cards.forEach((el,i)=>{const bounds=el.getBoundingClientRect(),d=Math.abs(bounds.left+bounds.width/2-midpoint);if(d<distance){closest=i;distance=d;}});
      if(positions.get(row.dataset.industry)!==closest)updateFeatured(row,closest,false);
    },100);
  },{passive:true});
}
function render(shouldAnnounce=true){
  const filtered=filterCollection(state);visibleByIndustry.clear();
  rows.innerHTML=sectors.map((sector,sectorIndex)=>{
    const list=filtered.filter(p=>p.industry===sector.id);if(!list.length)return '';
    visibleByIndustry.set(sector.id,list);
    let index=positions.get(sector.id);if(index===undefined||index>=list.length)index=Math.max(0,list.findIndex(p=>p.category==='erp'));
    positions.set(sector.id,index);
    return `<section class="cl-row" data-industry="${sector.id}" aria-labelledby="collection-${sector.id}"><span class="cl-row-icon" aria-hidden="true"><i data-lucide="${sector.icon}"></i></span><div class="cl-row-heading"><span class="cl-index" aria-hidden="true">${String(sectorIndex+1).padStart(2,'0')}</span><h2 id="collection-${sector.id}" tabindex="-1">${esc(sector.name)}</h2><p>${esc(sector.line)}</p><button type="button" class="cl-view-all" data-view-industry="${sector.id}" aria-label="View all ${esc(sector.name)} solutions">View all <span aria-hidden="true">↗</span></button></div><div class="cl-carousel" role="region" aria-roledescription="carousel" aria-label="${esc(sector.name)} products"><button class="cl-row-arrow" type="button" data-direction="-1" aria-label="Previous ${esc(sector.name)} product" ${list.length<2?'disabled':''}>${arrow(-1)}</button><div class="cl-track" data-count="${list.length}" tabindex="0" aria-label="${esc(sector.name)} carousel. Use arrow keys to explore.">${trackContent(list,index)}</div><button class="cl-row-arrow" type="button" data-direction="1" aria-label="Next ${esc(sector.name)} product" ${list.length<2?'disabled':''}>${arrow(1)}</button></div><div class="cl-dots" role="group" aria-label="Select a featured ${esc(sector.name)} product">${dots(sector.id,list,index)}</div><p class="cl-carousel-note">${mobile.matches?'SWIPE OR USE THE ARROWS TO EXPLORE':'A COLLECTION OF POSSIBILITIES'}</p></section>`;
  }).join('');
  root.querySelector('[data-cl-empty]').hidden=filtered.length>0;
  root.querySelector('[data-empty-message]').textContent=state.savedOnly?'Save a few favourites using the heart on each card, or clear your filters.':'Try a different industry, solution type or search term.';
  root.querySelectorAll('[data-cl-reset]').forEach(b=>b.hidden=filtered.length>0&&state.industry==='all'&&state.category==='all'&&!state.query&&!state.savedOnly);
  root.querySelectorAll('[data-sector]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sector===state.industry)));
  root.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
  root.querySelector('[data-saved-only]').setAttribute('aria-pressed',String(state.savedOnly));
  root.querySelector('[data-saved-count]').textContent=state.saved.length;
  const activeFilters=Number(state.industry!=='all')+Number(state.category!=='all')+Number(Boolean(state.query.trim()))+Number(state.savedOnly);
  const filterCount=root.querySelector('[data-cl-filter-count]');filterCount.textContent=activeFilters;filterCount.hidden=activeFilters===0;
  root.querySelector('[data-cl-filter-done]').innerHTML=`Show ${filtered.length} ${filtered.length===1?'concept':'concepts'} <span aria-hidden="true">↗</span>`;
  const count=visibleByIndustry.size;
  root.querySelector('[data-cl-result-summary]').textContent=`${filtered.length} ${filtered.length===1?'concept':'concepts'} across ${count} ${count===1?'industry':'industries'}${state.savedOnly?' · Your saved collection':'. One connected collection.'}`;
  if(shouldAnnounce)announce(`${filtered.length} collection concepts shown across ${count} industries.`);
  icons();
  rows.querySelectorAll('.cl-row').forEach(row=>{centerMobile(row);observeTouch(row);});
}
function reset(){Object.assign(state,{industry:'all',category:'all',query:'',savedOnly:false});search.value='';positions.clear();render();}
function save(id){
  if(!products.some(p=>p.id===id))return;
  state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];
  let persisted=true;try{localStorage.setItem('canveliqsoft-collection-saved',JSON.stringify(state.saved));}catch{persisted=false;}
  if(state.savedOnly)render(false);
  root.querySelector('[data-saved-count]').textContent=state.saved.length;
  document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>b.setAttribute('aria-pressed',String(state.saved.includes(id))));
  const message=`${products.find(p=>p.id===id).name} ${state.saved.includes(id)?'saved':'removed from saved collection'}${persisted?'': ' for this visit'}.`;
  announce(message);
  if(dialog.open)dialog.querySelector('[data-detail-status]').textContent=message;
}
function openDetail(id,source){
  const p=products.find(p=>p.id===id);if(!p)return;
  trigger=source;detailProduct=p;
  dialog.querySelector('[data-cl-detail]').innerHTML=`<div class="cl-detail-header"><p class="cl-eyebrow">${esc(p.industryName)} / ${esc(p.label)} · CONCEPT PREVIEW</p><h2 id="cl-dialog-title">${esc(p.name)}</h2><p>${esc(p.description)}</p></div><div class="cl-detail-layout"><div><div class="cl-detail-art">${productVisual(p)}</div><p class="cl-detail-caption">ILLUSTRATIVE INTERFACE · SAMPLE DATA</p></div><div class="cl-detail-info"><h3>A closer look.</h3><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><details open><summary>Delivery &amp; handover</summary><p>${esc(p.delivery)}</p></details><details><summary>Licence, support &amp; requirements</summary><p>Availability, pricing, permitted use, supported integrations, updates and support are agreed in the proposal. This preview does not include a licence or grant source-code ownership.</p></details><a class="cl-button cl-detail-cta" href="${inquiryUrl(p)}">${p.category==='erp'?'Request a quote':'Discuss this solution'} <span aria-hidden="true">↗</span></a><button class="cl-button cl-detail-save" type="button" data-save="${p.id}" aria-pressed="${isSaved(p)}">♡ &nbsp; Save ${esc(p.name)}</button><p class="cl-detail-note">This is a collection concept. We’ll confirm what can be built and delivered for your business before you commit.</p><p class="cl-sr" data-detail-status role="status" aria-live="polite"></p></div></div>`;
  document.documentElement.classList.add('cl-dialog-open');dialog.showModal();dialog.scrollTop=0;icons();
}
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('cl-dialog-open');if(trigger?.isConnected)trigger.focus({preventScroll:true});else search.focus({preventScroll:true});detailProduct=null;});
dialog.addEventListener('click',event=>{if(event.target.closest('[data-cl-close]'))dialog.close();else if(event.target.closest('[data-save]'))save(event.target.closest('[data-save]').dataset.save);else if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
root.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.matches('[data-direction]')){const row=target.closest('.cl-row');move(row,(positions.get(row.dataset.industry)||0)+Number(target.dataset.direction));}
  else if(target.matches('[data-select]')){const row=target.closest('.cl-row'),index=Number(target.dataset.select);move(row,index);row.querySelector(`[data-select="${index}"]`).focus({preventScroll:true});}
  else if(target.matches('[data-detail]'))openDetail(target.dataset.detail,target);
  else if(target.matches('[data-save]'))save(target.dataset.save);
  else if(target.matches('[data-sector]')){state.industry=target.dataset.sector;positions.clear();render();revealResults();}
  else if(target.matches('[data-category]')){state.category=target.dataset.category;positions.clear();render();revealResults();}
  else if(target.matches('[data-saved-only]')){state.savedOnly=!state.savedOnly;positions.clear();render();revealResults();}
  else if(target.matches('[data-cl-reset]')){const fromPanel=filterPanel.contains(target);reset();if(fromPanel)search.focus({preventScroll:true});else rows.querySelector('h2')?.focus({preventScroll:true});revealResults();}
  else if(target.matches('[data-view-industry]')){state.industry=target.dataset.viewIndustry;state.category='all';state.query='';state.savedOnly=false;search.value='';positions.clear();render();rows.querySelector('h2').focus({preventScroll:true});rows.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});}
});
rows.addEventListener('keydown',event=>{if(!event.target.matches('.cl-track'))return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const row=event.target.closest('.cl-row'),id=row.dataset.industry;const next=event.key==='Home'?0:event.key==='End'?visibleByIndustry.get(id).length-1:(positions.get(id)||0)+(event.key==='ArrowRight'?1:-1);move(row,next);}});
search.addEventListener('input',()=>{state.query=search.value;positions.clear();render();revealResults();});
root.querySelector('[data-cl-industries]').innerHTML=`<button type="button" data-sector="all" aria-pressed="true">All industries</button>`+sectors.map(s=>`<button type="button" data-sector="${s.id}" aria-pressed="false">${esc(s.name)}</button>`).join('');
filterToggle.addEventListener('click',()=>{filterReturnFocus=filterToggle;setFilters(filterToggle.getAttribute('aria-expanded')!=='true',{focus:true});});
root.querySelector('[data-cl-filter-close]').addEventListener('click',()=>setFilters(false,{restore:true}));
root.querySelector('[data-cl-filter-done]').addEventListener('click',()=>{setFilters(false,{restore:true});revealResults();});
document.addEventListener('click',event=>{if(compactFilters.matches&&!filterPanel.contains(event.target)&&!event.target.closest('[data-cl-filter-toggle],[data-collection-search]'))setFilters(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&compactFilters.matches&&filterPanel.classList.contains('is-open')){event.preventDefault();setFilters(false,{restore:true});}});
filterPanel.addEventListener('focusout',event=>{if(compactFilters.matches&&event.relatedTarget&&event.relatedTarget!==filterToggle&&!filterPanel.contains(event.relatedTarget))setFilters(false);});
compactFilters.addEventListener('change',event=>{const hadFocus=filterPanel.contains(document.activeElement);setFilters(false);if(event.matches&&hadFocus)filterToggle.focus({preventScroll:true});});
setFilters(false);
mobile.addEventListener('change',()=>render(false));
const header=root.querySelector('.cs-site-header'),menu=header.querySelector('.cs-mobile-links'),menuToggle=header.querySelector('.cs-menu');
function setMenu(open,focus=false){menu.hidden=!open;header.dataset.menuOpen=String(open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(focus)menuToggle.focus();}
menuToggle.addEventListener('click',()=>setMenu(menu.hidden));
document.addEventListener('click',event=>{if(!header.contains(event.target))setMenu(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)setMenu(false,true);});
header.querySelector('[data-collection-search]').addEventListener('click',event=>{setMenu(false);filterReturnFocus=event.currentTarget;setFilters(true,{focus:true});});
window.addEventListener('resize',()=>{if(!mobile.matches)setMenu(false);});
window.addEventListener('scroll',()=>{if(scrollTimer)return;scrollTimer=requestAnimationFrame(()=>{header.classList.toggle('is-scrolled',scrollY>24);scrollTimer=0;});},{passive:true});
header.classList.toggle('is-scrolled',scrollY>24);render(false);
