import { products,brands,readSavedIds } from './catalog.js';
import { demoOffers,formatPrice,bagSubtotal,normalizeQuantity } from './product-commerce.js';
import { inspectorMarkup,mountInspector } from './product-inspector.js';

const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const dialog=$('#boutique-dialog'),content=$('#dialog-content');
let family='all',bag=readSavedIds('velour-bag'),wishlist=[...new Set(readSavedIds('velour-wishlist'))],disposeInspector=null,dialogView='',toastTimer;
$('#collection-brand').innerHTML+=brands.map(brand=>`<option value="${esc(brand)}">${esc(brand)}</option>`).join('');
const requestedBrand=new URLSearchParams(location.search).get('brand');
if(brands.includes(requestedBrand))$('#collection-brand').value=requestedBrand;

function refreshBadges(){
  $('.bag-count').textContent=bag.length;$('.bag-button').setAttribute('aria-label',`Open shopping bag, ${bag.length} items`);$('.wishlist-dot').hidden=!wishlist.length;
  all('[data-save]').forEach(button=>{const p=products.find(p=>p.id===button.dataset.save),saved=wishlist.includes(p.id);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Remove':'Save'} ${p.name} ${saved?'from':'to'} wishlist`);});
}
function persist(){try{localStorage.setItem('velour-bag',JSON.stringify(bag));localStorage.setItem('velour-wishlist',JSON.stringify(wishlist));}catch{}refreshBadges();}
function toast(message){clearTimeout(toastTimer);$('.toast').textContent=message;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2600);}
function addToCart(id,quantity=1){if(!products.some(p=>p.id===id))return bag.length;bag.push(...Array(normalizeQuantity(quantity)).fill(id));persist();return bag.length;}
function productCard(p){
  const offer=demoOffers[p.id],saved=wishlist.includes(p.id),scene=['chanel','dior','tom-ford'].includes(p.id);
  return `<article class="collection-card" data-card="${p.id}"><div class="collection-card-visual"><button class="collection-product-link" data-product="${p.id}" aria-label="Discover ${esc(p.brand+' '+p.name)}"><img src="${p.portrait}" alt="${esc(p.brand+' '+p.name)} perfume bottle" class="${scene?'scene-image':''}" loading="lazy" width="600" height="720"><span class="collection-view-label">A closer look ${icon('arrow')}</span></button><span class="collection-card-number">N° ${String(products.indexOf(p)+1).padStart(2,'0')}</span><button class="icon-button collection-card-save" data-save="${p.id}" aria-pressed="${saved}" aria-label="${saved?'Remove':'Save'} ${esc(p.name)} ${saved?'from':'to'} wishlist">${icon('heart')}</button></div><div class="collection-card-copy"><p class="collection-card-brand">${esc(p.brand)}</p><button class="collection-card-title" data-product="${p.id}">${esc(p.name)}</button><p class="collection-card-type">${esc(p.type)} · ${offer.size}</p><p class="collection-card-notes">${esc(p.notes)}</p><div class="collection-card-purchase"><span class="collection-card-price">${formatPrice(offer.priceCents)}<small>Demo price · USD</small></span><button class="collection-add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">Add to bag ${icon('bag')}</button></div></div></article>`;
}
function render(){
  const query=$('#collection-search').value.toLowerCase().trim(),brand=$('#collection-brand').value,sort=$('#collection-sort').value;
  let matches=products.filter(p=>(brand==='all'||p.brand===brand)&&(family==='all'||p.tags.includes(family))&&`${p.name} ${p.brand} ${p.notes} ${p.type}`.toLowerCase().includes(query));
  if(sort==='az')matches.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='price-low')matches.sort((a,b)=>demoOffers[a.id].priceCents-demoOffers[b.id].priceCents);
  if(sort==='price-high')matches.sort((a,b)=>demoOffers[b.id].priceCents-demoOffers[a.id].priceCents);
  $('#collection-grid').innerHTML=matches.map(productCard).join('');
  $('#collection-count').textContent=`${matches.length} ${matches.length===1?'fragrance':'fragrances'}${brand==='all'?' to discover':' by '+brand}`;
  $('.collection-empty').hidden=matches.length>0;$('.clear-filters').hidden=brand==='all'&&family==='all'&&!query;
  all('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===family)));
}
function clearFilters(){family='all';$('#collection-search').value='';$('#collection-brand').value='all';$('#collection-sort').value='curated';history.replaceState(null,'',location.pathname);render();}
function openDialog(type,id){
  disposeInspector?.();disposeInspector=null;dialogView=type;dialog.classList.toggle('is-product-inspector',type==='product');
  if(type==='product'){
    const p=products.find(p=>p.id===id);if(!p)return;
    content.innerHTML=inspectorMarkup(p,{saved:wishlist.includes(id),bagCount:bag.length});
    if(!dialog.open)dialog.showModal();else $('.dialog-close').focus({preventScroll:true});
    disposeInspector=mountInspector(content,p,{addToCart,close:()=>dialog.close()});
  }else{
    const cart=type==='cart',chosen=products.filter(p=>(cart?bag:wishlist).includes(p.id));
    content.innerHTML=`<p class="eyebrow">YOUR MAISON VELOUR</p><h2 class="dialog-title" id="dialog-title">${cart?'Your shopping bag':'A few things to love.'}</h2>${chosen.length?`<div class="collection-cart-list">${chosen.map(p=>{const qty=bag.filter(id=>id===p.id).length,offer=demoOffers[p.id];return `<article class="collection-cart-item"><img src="${p.portrait}" alt="${esc(p.name)}"><div><small>${esc(p.brand)}</small><h3>${esc(p.name)}</h3><p>${offer.size}${cart?' · Quantity '+qty:''}</p>${cart?`<button data-remove="${p.id}">Remove one</button>`:`<button data-product="${p.id}">Discover fragrance</button>`}</div><strong>${formatPrice(offer.priceCents*(cart?qty:1))}</strong></article>`;}).join('')}</div>${cart?`<div class="cart-summary"><span>Demo subtotal · ${bag.length} ${bag.length===1?'item':'items'}</span><strong>${formatPrice(bagSubtotal(bag))}</strong></div>`:''}`:'<p class="dialog-intro">A little discovery is a beautiful place to begin. Explore the collection and find a fragrance to love.</p>'}<button class="text-button" data-return>Continue exploring ${icon('arrow')}</button><p class="dialog-note">${cart?'Illustrative USD prices. Checkout is not connected. Your bag is saved on this device.':'Your favourites are saved on this device.'}</p>`;
    if(!dialog.open)dialog.showModal();else $('.dialog-close').focus({preventScroll:true});
  }
  dialog.scrollTop=0;
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.family){family=d.family;render();}
  else if('clear' in d)clearFilters();
  else if(d.product)openDialog('product',d.product);
  else if(d.dialog)openDialog(d.dialog);
  else if(d.add){addToCart(d.add);toast(`${products.find(p=>p.id===d.add).name} added to your bag.`);}
  else if(d.remove){const i=bag.indexOf(d.remove);if(i>=0)bag.splice(i,1);persist();openDialog('cart');}
  else if(d.save){wishlist=wishlist.includes(d.save)?wishlist.filter(id=>id!==d.save):[...wishlist,d.save];persist();if(dialog.open&&dialogView==='wishlist')openDialog('wishlist');toast(wishlist.includes(d.save)?'A new favourite, saved.':'Removed from your wishlist.');}
  else if('return' in d)dialog.close();
});
$('#collection-search').addEventListener('input',render);
$('#collection-brand').addEventListener('change',()=>{const brand=$('#collection-brand').value;history.replaceState(null,'',location.pathname+(brand==='all'?'':'?brand='+encodeURIComponent(brand)));render();});
$('#collection-sort').addEventListener('change',render);
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{disposeInspector?.();disposeInspector=null;dialog.classList.remove('is-product-inspector');});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
function syncSaved(){bag=readSavedIds('velour-bag');wishlist=[...new Set(readSavedIds('velour-wishlist'))];refreshBadges();}
window.addEventListener('storage',syncSaved);window.addEventListener('pageshow',syncSaved);
render();refreshBadges();
