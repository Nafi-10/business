import { arrivalProducts } from './arrivals-data.js';
import { initArrivals } from './arrivals.js';
import { initShowroom } from './showroom.js';
import { initGifts } from './gifts.js';
import { initOffers } from './offers.js';
import { initNavigation } from './navigation.js';
import { inspectorMarkup, mountInspector } from './product-inspector.js';
import { demoOffers,formatPrice,bagSubtotal,normalizeQuantity } from './product-commerce.js';

import { heroProducts,products,readSavedIds } from './catalog.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loadIds = readSavedIds;
let wishlist = [...new Set(loadIds('velour-wishlist'))];
let bag = loadIds('velour-bag');
let current = 0;
let timer;
let toastTimer;
let isPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
let activePanel = null;
let dialogView = '';
let disposeInspector = null;
let quizStep = 0;
let quizAnswers = [];
const hero = $('.hero');
const dialog = $('#boutique-dialog');
initNavigation();

function persist() {
  try { localStorage.setItem('velour-wishlist', JSON.stringify(wishlist)); localStorage.setItem('velour-bag', JSON.stringify(bag)); } catch { /* Session interactions remain available when storage is disabled. */ }
  $('.bag-count').textContent = bag.length;
  $('.bag-button').setAttribute('aria-label', `Open shopping bag, ${bag.length} items`);
  $('.wishlist-dot').hidden = !wishlist.length;
  updateHeart();
}
function updateHeart() {
  const p = products[current];
  const saved = wishlist.includes(p.id);
  $('.featured-heart').setAttribute('aria-pressed', String(saved));
  $('.featured-heart').setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${p.name} ${saved ? 'from' : 'to'} wishlist`);
}
function toast(message) {
  clearTimeout(toastTimer);
  $('.toast').textContent = message;
  $('.toast').classList.add('visible');
  toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 3000);
}
function schedule() {
  clearInterval(timer);
  const stopped = isPaused || document.hidden || !!activePanel || dialog.open || $('#maison').open || $('#main-nav').classList.contains('is-open');
  hero.classList.toggle('is-paused', stopped);
  if (!stopped) timer = setInterval(() => showSlide(current + 1), 5000);
}
function showSlide(index, announce = false) {
  current = (index + heroProducts.length) % heroProducts.length;
  const p = products[current];
  $$('.hero-image').forEach((image, i) => image.classList.toggle('is-active', i === current));
  $$('.slide-tab').forEach((tab, i) => {
    tab.classList.remove('is-active');
    tab.setAttribute('aria-current', String(i === current));
    if (i === current) { void tab.offsetWidth; tab.classList.add('is-active'); }
  });
  $('#featured-brand').textContent = p.brand.toUpperCase();
  $('#featured-name').textContent = p.name;
  $('#featured-type').textContent = `${p.type} · ${p.subtitle}`;
  $('#slide-number').textContent = String(current + 1).padStart(2, '0');
  if (announce) $('#carousel-announcement').textContent = `${current + 1} of 3: ${p.brand} ${p.name}`;
  updateHeart();
}
function updatePauseButton() {
  $('.pause-button').setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow');
  $('.pause-button use').setAttribute('href', isPaused ? '#i-play' : '#i-pause');
}
$$('[data-go]').forEach(button => button.addEventListener('click', () => { showSlide(Number(button.dataset.go), true); schedule(); }));
$('.pause-button').addEventListener('click', () => { isPaused = !isPaused; updatePauseButton(); schedule(); });
document.addEventListener('visibilitychange', schedule);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { isPaused = event.matches; updatePauseButton(); schedule(); });
$('.slide-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  showSlide(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : current + (event.key === 'ArrowRight' ? 1 : -1), true);
  $$('.slide-tab')[current].focus(); schedule();
});
function closePanels(returnFocus = false) {
  const previous = activePanel;
  $$('.header-panel').forEach(panel => panel.hidden = true);
  $$('[data-panel]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  activePanel = null;
  $('.panel-backdrop').hidden = !$('#main-nav').classList.contains('is-open');
  if (returnFocus && previous) {
    const trigger=$(`[data-panel="${previous}"]`);
    (trigger.offsetParent ? trigger : $('.mobile-menu')).focus();
  }
  schedule();
}
function closeMobile() {
  $('#main-nav').classList.remove('is-open');
  $('.mobile-menu').setAttribute('aria-expanded', 'false');
  $('.mobile-menu').setAttribute('aria-label', 'Open navigation');
  $('.panel-backdrop').hidden = !activePanel;
  schedule();
}
function openPanel(name) {
  const same = activePanel === name;
  closePanels();
  if (same) return;
  closeMobile();
  activePanel = name;
  $(`#${name}-panel`).hidden = false;
  $(`[data-panel="${name}"]`).setAttribute('aria-expanded', 'true');
  $('.panel-backdrop').hidden = false;
  if (name === 'search') { $('#fragrance-search').value = ''; renderSearch(''); $('#fragrance-search').focus(); }
  else $(`#${name}-panel`).querySelector('button,a,input')?.focus({preventScroll:true});
  schedule();
}
$('.mobile-menu').addEventListener('click', () => {
  const shouldOpen = !$('#main-nav').classList.contains('is-open');
  closePanels();
  $('#main-nav').classList.toggle('is-open', shouldOpen);
  $('.mobile-menu').setAttribute('aria-expanded', String(shouldOpen));
  $('.mobile-menu').setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
  $('.panel-backdrop').hidden = !shouldOpen; schedule();
});
$('.panel-backdrop').addEventListener('click', () => { closePanels(); closeMobile(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.open) { closePanels(true); closeMobile(); } });
$('.site-header').addEventListener('focusout', () => {
  requestAnimationFrame(() => { if (activePanel && !$('.site-header').contains(document.activeElement)) closePanels(); });
});
function renderSearch(query) {
  const normalized = query.toLowerCase().trim();
  const results = products.filter(p => `${p.name} ${p.brand} ${p.notes} ${p.tags.join(' ')}`.toLowerCase().includes(normalized));
  $('#search-results').innerHTML = results.length ? results.slice(0,6).map(p => `<button class="search-result" data-product="${p.id}"><img src="${p.image}" alt=""><span><small>${p.brand.toUpperCase()}</small><strong>${p.name}</strong></span>${icon('arrow')}</button>`).join('') : '<p class="dialog-intro">No match in our demo collection. Try “Chanel”, “jasmine” or “oud”.</p>';
}
$('#fragrance-search').addEventListener('input', event => renderSearch(event.target.value));

function card(p, context = '') {
  const saved = wishlist.includes(p.id);
  const offer=demoOffers[p.id],quantity=bag.filter(id=>id===p.id).length;
  return `<article class="product-card"><img src="${p.image}" alt="Illustrative ${p.brand} ${p.name} perfume scene"><p class="eyebrow">${p.brand.toUpperCase()}</p><h3>${p.name}</h3><p>${p.type}<br>${p.notes}<span class="cart-price">${offer.size} · ${formatPrice(offer.priceCents)}${context==='cart'?`<small>Quantity ${quantity} · ${formatPrice(offer.priceCents*quantity)}</small>`:'<small>Demo price · USD</small>'}</span></p><div class="product-actions">${context === 'cart' ? `<button class="text-button" data-remove="${p.id}">Remove one (${quantity})</button>` : `<button class="text-button" data-add="${p.id}">Add to demo bag ↗</button>`}<button class="icon-button" data-save="${p.id}" aria-label="${saved ? 'Remove' : 'Save'} ${p.name} ${saved ? 'from' : 'to'} wishlist" aria-pressed="${saved}">${icon('heart')}</button></div></article>`;
}
function addToCart(id,quantity=1) {
  if(!products.some(p=>p.id===id))return bag.length;
  bag.push(...Array(normalizeQuantity(quantity)).fill(id));persist();return bag.length;
}
function frame(eyebrow, title, body) {
  return `<p class="eyebrow">${eyebrow}</p><h2 class="dialog-title" id="dialog-title">${escapeHtml(title)}</h2>${body}`;
}
function openDialog(type, arg) {
  disposeInspector?.();disposeInspector=null;
  dialog.classList.toggle('is-product-inspector',type==='product');
  closePanels(); closeMobile(); dialogView = type;
  let html = '';
  if (type === 'collection') {
    const label = arg || 'The Collection';
    const all = ['The Collection', 'Best Sellers'].includes(label);
    const filtered = label === 'New Arrivals' ? products.filter(p=>arrivalProducts.some(a=>a.id===p.id)) : all ? products : products.filter(p => p.brand === label || p.type === label || p.tags.includes(label));
    html = frame('THE MAISON EDIT', label, `<p class="dialog-intro">${filtered.length ? 'A small introduction to extraordinary fragrance. Explore our curated selection in this boutique preview.' : 'This chapter of the collection is still being curated. In the meantime, discover our featured scents.'}</p><div class="product-grid">${(filtered.length ? filtered : products).map(p => card(p)).join('')}</div><p class="dialog-note">Demo collection · Illustrative imagery · Availability, rankings and new releases are not live. Shopping and checkout will be introduced with the full store.</p>`);
  } else if (type === 'product') {
    const p = products.find(p => p.id === arg); if (!p) return;
    html=inspectorMarkup(p,{saved:wishlist.includes(p.id),bagCount:bag.length});
  } else if (type === 'wishlist' || type === 'cart') {
    const chosen = products.filter(p => (type === 'cart' ? bag : wishlist).includes(p.id));
    html = frame('YOUR MAISON VELOUR', type === 'cart' ? 'Your shopping bag' : 'A few things to love.', chosen.length ? `<div class="product-grid">${chosen.map(p => card(p, type)).join('')}</div>${type==='cart'?`<div class="cart-summary"><span>Demo subtotal · ${bag.length} ${bag.length===1?'item':'items'}</span><strong>${formatPrice(bagSubtotal(bag))}</strong></div><button class="text-button" data-return-store>Continue exploring ${icon('arrow')}</button>`:''}<p class="dialog-note">${type === 'cart' ? 'Illustrative USD prices. Your cart is saved on this device. Checkout is not connected.' : 'Your favourites are saved on this device, ready for your next visit.'}</p>` : `<div class="empty-state">${icon(type === 'cart' ? 'bag' : 'heart')}<h3>${type === 'cart' ? 'Good things begin with discovery.' : 'A place for your favourites.'}</h3><p>${type === 'cart' ? 'Explore the collection and add a scent to your demo bag.' : 'Tap the heart beside a fragrance to save it here.'}</p><button class="primary-button" data-collection="The Collection">Explore the collection ${icon('arrow')}</button></div>`);
  } else if (type === 'account') {
    html = frame('WELCOME TO THE MAISON', 'Your personal fragrance world.', '<p class="dialog-intro">A place for your favourites, your discoveries, and the fragrances you come back to.</p><p class="dialog-note">Account sign-in will arrive with the full boutique. For now, your wishlist and demo bag are saved on this device.</p><button class="primary-button" data-dialog="wishlist">Explore your wishlist '+icon('heart')+'</button>');
  } else if (type === 'gifts') {
    html = frame('THE ART OF GIVING', 'Say it with scent.', '<p class="dialog-intro">For a milestone, a quiet thank-you, or simply because. Begin with a fragrance that feels like them.</p><div class="gift-ideas"><button data-collection="Floral"><strong>For the romantic</strong><span>A bouquet of luminous florals ↗</span></button><button data-collection="Woody"><strong>For the individual</strong><span>Woods with a little mystery ↗</span></button><button data-dialog="quiz"><strong>For the curious</strong><span>Start with a scent discovery ↗</span></button></div><p class="dialog-note">Gift sets, gift cards and occasion edits are planned for the full boutique.</p>');
  } else if (type === 'offers') {
    html = frame('SOMETHING TO LOOK FORWARD TO', 'Little luxuries, in good time.', '<p class="dialog-intro">Seasonal offers, considered bundles, and special fragrance discoveries will have a home here.</p><p class="dialog-note">There are no active promotions in this preview.</p><button class="primary-button" data-collection="The Collection">Discover the collection '+icon('arrow')+'</button>');
  } else if (type === 'quiz') {
    quizStep = 0; quizAnswers = []; html = quizMarkup();
  }
  $('#dialog-content').innerHTML = html;
  if (!dialog.open) dialog.showModal();
  else $('.dialog-close').focus({preventScroll:true});
  dialog.scrollTop = 0; schedule();
  if(type==='product')disposeInspector=mountInspector($('#dialog-content'),products.find(p=>p.id===arg),{addToCart,close:()=>dialog.close()});
}
const questions = [
  { title: 'Where does your mind wander?', choices: [['A garden in bloom', 'Petals, sunlight, a little romance.'], ['A sunlit escape', 'Fresh air and a brighter perspective.'], ['A quiet woodland', 'Depth, warmth, a sense of mystery.']] },
  { title: 'What feels most like you?', choices: [['Softly expressive', 'An elegant presence.'], ['Effortlessly spirited', 'A spark of individuality.'], ['Quietly magnetic', 'A little intrigue.']] },
  { title: 'Choose your favourite moment.', choices: [['A golden afternoon', 'Slow moments, beautifully spent.'], ['Anywhere, anytime', 'A signature for every day.'], ['An evening to remember', 'When a little depth feels right.']] }
];
function quizMarkup() {
  const q = questions[quizStep];
  return frame('FIND YOUR SIGNATURE', q.title, `<p class="dialog-intro">Follow your instincts. Three little choices, one new discovery.</p><div class="quiz-choices">${q.choices.map(([title, description], index) => `<button class="quiz-choice" data-answer="${index}"><span>${title}</span><small>${description}</small></button>`).join('')}</div><p class="quiz-progress">${quizStep + 1} / 3 ${quizStep ? '<button class="text-button" data-quiz-back>← Back</button>' : ''}</p>`);
}
function answerQuiz(answer) {
  quizAnswers.push(answer); quizStep++;
  if (quizStep < questions.length) { $('#dialog-content').innerHTML = quizMarkup(); }
  else {
    const scores = [0, 0, 0]; quizAnswers.forEach((answer, i) => { scores[answer] += i === 0 ? 2 : 1; });
    const winner = scores.indexOf(Math.max(...scores));
    const p = products[[1, 0, 2][winner]];
    $('#dialog-content').innerHTML = frame('YOUR SCENT DISCOVERY', ['A love of luminous florals.', 'A spirited modern classic.', 'Drawn to the unexpected.'][winner], `<p class="dialog-intro">Your choices point toward ${['soft florals', 'bright amber and woods', 'warm, textured woods'][winner]}. A beautiful place to begin:</p><div class="product-grid">${card(p)}</div><p class="dialog-note">A playful starting point, based on three demo fragrances. Sample a fragrance on your skin before choosing a full bottle. Discovery sample sets are planned for the full boutique.</p><button class="text-button" data-dialog="quiz">Start again ↗</button>`);
  }
  $('.dialog-title').setAttribute('tabindex', '-1'); $('.dialog-title').focus();
}
function toggleWishlist(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter(saved => saved !== id) : [...wishlist, id];
  persist(); document.dispatchEvent(new Event('velour:wishlist-changed')); toast(wishlist.includes(id) ? 'A new favourite, saved.' : 'Removed from your wishlist.');
  $$(`[data-save="${id}"]`).forEach(button => {
    button.setAttribute('aria-pressed', String(wishlist.includes(id)));
    const p = products.find(p => p.id === id);
    button.setAttribute('aria-label', `${wishlist.includes(id) ? 'Remove' : 'Save'} ${p.name} ${wishlist.includes(id) ? 'from' : 'to'} wishlist`);
  });
  if (dialog.open && dialogView === 'wishlist') openDialog('wishlist');
}
$('.featured-heart').addEventListener('click', () => toggleWishlist(products[current].id));
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const d = button.dataset;
  if (d.panel) openPanel(d.panel);
  else if ('closePanels' in d) closePanels(true);
  else if (d.collection) openDialog('collection', d.collection);
  else if (d.product) openDialog('product', d.product);
  else if (d.dialog) openDialog(d.dialog);
  else if (d.save) toggleWishlist(d.save);
  else if (d.add) { addToCart(d.add); toast('Added to your demo bag.'); }
  else if (d.remove) { bag.splice(bag.indexOf(d.remove), 1); persist(); openDialog('cart'); }
  else if ('answer' in d) answerQuiz(Number(d.answer));
  else if ('quizBack' in d) { quizStep--; quizAnswers.pop(); $('#dialog-content').innerHTML = quizMarkup(); }
  else if ('returnStore' in d) dialog.close();
});
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close',()=>{disposeInspector?.();disposeInspector=null;dialog.classList.remove('is-product-inspector');schedule();});
window.addEventListener('pageshow',()=>{wishlist=[...new Set(loadIds('velour-wishlist'))];bag=loadIds('velour-bag');persist();});
window.addEventListener('storage',()=>{wishlist=[...new Set(loadIds('velour-wishlist'))];bag=loadIds('velour-bag');persist();});
persist(); updatePauseButton(); schedule();
$$('[data-scroll-arrivals],[data-scroll-brands],[data-scroll-gifts],[data-scroll-offers]').forEach(link=>link.addEventListener('click',()=>{closePanels();closeMobile();}));
initGifts({ products });
initOffers({products,isOverlayOpen:()=>dialog.open||$('#maison').open||!!activePanel||$('#main-nav').classList.contains('is-open')});
initArrivals({
  openProduct: id => openDialog('product', id),
  isSaved: id => wishlist.includes(id),
  toggleSaved: toggleWishlist,
  isOverlayOpen: () => dialog.open || $('#maison').open || !!activePanel || $('#main-nav').classList.contains('is-open')
});
initShowroom({ products, openProduct: id => openDialog('product', id), isOverlayOpen: () => dialog.open, beforeOpen: () => { closePanels(); closeMobile(); }, onOpenChange: schedule });
