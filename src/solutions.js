const { productDetailMarkup, purchasePreviewMarkup } = await import(new URL('./product-detail.mjs' + new URL(import.meta.url).search, import.meta.url));
// Keep the data and controller on the same build fingerprint after a refresh.
const { products, industries, filterProducts, demoReply, searchProducts, solutionDetailId } = await import(new URL('./solutions-data.mjs' + new URL(import.meta.url).search, import.meta.url));

const section = document.querySelector('#cs-solutions');
const grid = section.querySelector('[data-cc-grid]');
const finder = section.querySelector('.cc-finder');
const status = section.querySelector('[data-cc-status]');
const dialog = section.querySelector('#cc-dialog');
const body = dialog.querySelector('[data-cc-dialog-body]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const state = {industry:'all',goal:'all',category:'all'};
let mode = 'products';
let searchQuery = '';
let searchSession = false;
let visibleProducts = [];
let trigger = null;
let closeFocus = null;
const safe = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const visual = id => section.querySelector(`#cc-visual-${id}`).innerHTML;
const money = product => `${product.price}${product.billing ? ' '+product.billing : ''}`;
const icons = () => globalThis.lucide?.createIcons();

function render(announce = true) {
  visibleProducts = filterProducts(state);
  grid.innerHTML = visibleProducts.map(product => `<article class="cc-card" data-product="${product.id}" aria-labelledby="cc-name-${product.id}">
    ${visual(product.id)}<div class="cc-card-content"><h3 id="cc-name-${product.id}">${product.name}</h3><p class="cc-product-type">${product.label}</p><p class="cc-product-description">${product.description}</p><div class="cc-tags">${product.tags.map(tag => `<span>${tag}</span>`).join('')}</div><p class="cc-availability"><span></span>${product.availability}</p><p class="cc-price"><strong>${product.price}</strong>${product.billing ? `<span>${product.billing}</span>` : ''}${product.billing ? '<small>Example price</small>':''}</p><div class="cc-card-actions"><button type="button" class="cc-primary" data-cc-product="${product.id}" aria-label="${product.action}: ${product.name}">${product.action} <span aria-hidden="true">↗</span></button><button type="button" class="cc-secondary" data-cc-demo="${product.id}" aria-label="${product.preview}: ${product.name}">${product.preview} <span aria-hidden="true">↗</span></button></div></div></article>`).join('');
  section.querySelector('[data-cc-empty]').hidden = visibleProducts.length > 0;
  section.querySelector('[data-cc-compare]').disabled = !visibleProducts.length;
  section.querySelectorAll('[data-cc-category]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.ccCategory === state.category)));
  refreshPageLayout();
  if (announce) {
    const industry = industries.find(([id])=>id===state.industry)?.[1] || 'all industries';
    status.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'solution' : 'solutions'} shown for ${industry}. Demo products and illustrative prices.`;
    if (!reducedMotion.matches && visibleProducts.length) grid.animate([{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
  }
}

function reset() {
  state.industry='all';state.goal='all';state.category='all';
  finder.elements.industry.value='all';finder.elements.goal.value='all';
  render();
}

function openPanel(markup, source = null, view = 'default') {
  dialog.dataset.view = view;
  if (!dialog.open) {trigger = source || document.activeElement;closeFocus = trigger;}
  body.innerHTML = markup;
  document.documentElement.classList.add('cc-modal-open');
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  dialog.querySelector('.cc-close').focus({preventScroll:true});
}

function closePanel(destination = trigger) {
  if (!dialog.open) return;
  closeFocus = destination instanceof HTMLElement ? destination : trigger;
  dialog.close();
}
dialog.addEventListener('close', () => {
  searchSession = false;
  document.documentElement.classList.remove('cc-modal-open');
  if (closeFocus?.isConnected) closeFocus.focus({preventScroll:true});
});
dialog.querySelector('.cc-close').addEventListener('click',closePanel);
// Search inputs otherwise consume the first Escape to clear their value.
// Keep dismissal consistent with the other views in this dialog.
dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault();closePanel(); }
});
let backdropStart = false;
dialog.addEventListener('pointerdown',event => {backdropStart = event.target === dialog;});
dialog.addEventListener('pointerup',event => {if(backdropStart && event.target === dialog)closePanel();backdropStart=false;});

function showProduct(product,source) {
  const id=solutionDetailId(product.id,state.industry);
  if(id)location.assign(`./product.html?id=${id}`);
}
function selectProductTab(name,focus=false) {
  body.querySelectorAll('[data-pd-tab]').forEach(button=>{
    const active=button.dataset.pdTab===name;
    button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
    body.querySelector('#pd-'+button.dataset.pdTab).hidden=!active;
    if(active&&focus)button.focus({preventScroll:true});
  });
}

function updateSearchResults() {
  const results = searchProducts(searchQuery);
  body.querySelector('[data-cc-search-count]').textContent = searchQuery.trim() ? `${results.length} matching ${results.length===1?'solution':'solutions'}` : 'Explore the collection';
  body.querySelector('[data-cc-search-results]').innerHTML = results.length ? results.map(product => `<button type="button" class="cc-search-result" data-cc-product="${product.id}" aria-label="View ${product.name} details"><span class="cc-search-result-icon" aria-hidden="true">${{software:'▦',design:'◈',erp:'⬡',ai:'✦'}[product.category]}</span><span><small>${product.label} · ${product.availability}</small><strong>${product.name}</strong><span>${product.description}</span></span><b aria-hidden="true">↗</b></button>`).join('') : '<div class="cc-search-empty"><h3>Let’s find a better fit.</h3><p>Try a product name, an industry or a need such as inventory or chatbot.</p><button type="button" class="cc-secondary" data-cc-search-clear>Clear search</button><a href="#cs-contact" data-cc-contact>Ask about a custom solution ↗</a></div>';
}
function openSearch(source) {
  searchSession = true;
  openPanel(`<p class="cc-dialog-kicker">THE SOLUTION COLLECTION</p><h2 id="cc-dialog-title">Find your next solution.</h2><form class="cc-search-form" role="search" aria-label="Search solution collection"><label class="cc-sr" for="cc-search-query">Product, industry or business need</label><span aria-hidden="true">⌕</span><input id="cc-search-query" class="cc-search-input" name="query" type="search" maxlength="120" value="${safe(searchQuery)}" placeholder="Try ERP, Figma, inventory…" autocomplete="off"><button type="button" data-cc-search-clear aria-label="Clear search">×</button></form><div class="cc-search-suggestions" role="group" aria-label="Suggested searches">${['Inventory','Figma','ERP','Chatbot'].map(term=>`<button type="button" data-cc-search-term="${term}">${term}</button>`).join('')}</div><p class="cc-search-count" role="status" aria-live="polite" data-cc-search-count></p><div class="cc-search-results" data-cc-search-results></div><p class="cc-detail-note">Explore product previews and custom services. Confirm availability, prices and terms before purchase.</p>`, source);
  updateSearchResults();
  body.querySelector('.cc-search-input').focus({preventScroll:true});
}

function inventoryDemo() {
  return `<div class="cc-demo-toolbar" role="group" aria-label="Sales reporting period"><button type="button" data-cc-period="7" aria-pressed="false">Last 7 days</button><button type="button" data-cc-period="30" aria-pressed="true">Last 30 days</button></div><div class="cc-demo-stage"><h3>Your business, at a glance.</h3><div class="cc-demo-metrics" data-cc-metrics></div><table class="cc-demo-table"><thead><tr><th scope="col">Product</th><th scope="col">Stock</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Everyday tote</td><td>124</td><td>In stock</td></tr><tr><td>Ceramic collection</td><td>8</td><td>Low stock</td></tr><tr><td>Studio notebook</td><td>76</td><td>In stock</td></tr></tbody></table></div><p class="cc-detail-note">Sample reporting workspace. Change the period to explore the demo figures.</p>`;
}
function updatePeriod(period) {
  const values = period === '7' ? ['312','$5,840','892'] : ['1,284','$24,320','892'];
  body.querySelector('[data-cc-metrics]').innerHTML = ['Orders','Revenue','Products'].map((label,index)=>`<div>${label}<strong>${values[index]}</strong></div>`).join('');
  body.querySelectorAll('[data-cc-period]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.ccPeriod === period)));
}

function designDemo() {
  return `<div class="cc-demo-toolbar" role="group" aria-label="Design preview device"><button type="button" data-cc-device="mobile" aria-pressed="true">Mobile screens</button><button type="button" data-cc-device="desktop" aria-pressed="false">Desktop layout</button></div><div class="cc-kit-canvas" data-cc-kit>${visual('commerce-ui')}</div><p class="cc-detail-note">Illustrative design screens. Switch devices to explore the visual direction; this is not a downloadable kit.</p>`;
}
function updateDevice(device) {
  body.querySelector('[data-cc-kit]').innerHTML = device === 'mobile' ? visual('commerce-ui') : `<div class="cc-kit-desktop"><div><small>FORMA / CONSIDERED OBJECTS</small><h4>Everyday objects.<br>Considered design.</h4><p>Find something worth keeping.</p><span class="cc-mini-pill">Shop the collection ↗</span></div><div class="cc-vase" aria-hidden="true"></div></div>`;
  body.querySelectorAll('[data-cc-device]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.ccDevice === device)));
}

function erpDemo() {
  return `<p>Choose the modules your business needs. This creates a sample configuration to help you start the conversation.</p><div class="cc-module-grid" role="group" aria-label="ERP modules">${['Inventory','Finance','Sales','People','Production','Reporting'].map((name,index)=>`<label class="cc-module-option"><input type="checkbox" name="cc-module" value="${name}" ${index < 2 ? 'checked' : ''}>${name}</label>`).join('')}</div><div class="cc-configuration" role="status" aria-live="polite" data-cc-configuration></div><p class="cc-detail-note">Tailored quote · Pricing, integrations, hosting and delivery depend on your agreed scope. No quote is submitted here.</p>`;
}
function updateModules() {
  const selected = [...body.querySelectorAll('input[name="cc-module"]:checked')].map(input=>input.value);
  body.querySelector('[data-cc-configuration]').innerHTML = `<strong>${selected.length} ${selected.length===1?'module':'modules'} selected</strong><p>${selected.length ? selected.join(' · ') : 'Select at least one module to start your sample configuration.'}</p>`;
}

function chatDemo() {
  return `<div class="cc-chat-demo"><div class="cc-chat-demo-title"><span aria-hidden="true">✦</span> Assist AI <small>Scripted demo</small></div><div class="cc-chat-log" role="log" aria-label="Sample chatbot conversation" aria-live="polite"><p>Hello! Explore this sample conversation. Ask about order tracking, ERP pricing or design files.</p></div><div class="cc-chat-suggestions"><button type="button" data-cc-question="Can I track my order?">Track an order</button><button type="button" data-cc-question="Tell me about ERP pricing">ERP pricing</button><button type="button" data-cc-question="Talk to a person">Talk to a person</button></div><form class="cc-chat-form" aria-label="Try the chatbot"><label class="cc-sr" for="cc-chat-message">Your message</label><input id="cc-chat-message" name="message" type="text" maxlength="300" placeholder="Ask a sample question…" required autocomplete="off"><button type="submit">Send <span aria-hidden="true">↗</span></button></form></div><p class="cc-detail-note">A scripted interaction preview, not a connected AI service. Messages stay in this page and disappear when the preview is reopened.</p>`;
}
function sendDemoMessage(message) {
  const text = String(message).trim().slice(0,300);
  if (!text) return;
  const log = body.querySelector('.cc-chat-log');
  const userMessage = document.createElement('p');
  userMessage.className='cc-chat-user';userMessage.textContent=text;
  const answer = document.createElement('p');answer.textContent=demoReply(text);
  log.append(userMessage,answer);
  while(log.children.length>41)log.firstElementChild.remove();
  log.scrollTop=log.scrollHeight;
}

function showDemo(product,source) {
  const demo = {'stockflow':inventoryDemo,'commerce-ui':designDemo,'industry-erp':erpDemo,'assist-ai':chatDemo}[product.id];
  openPanel(`<p class="cc-dialog-kicker">Interactive preview · Demo data</p><h2 id="cc-dialog-title">${product.id==='industry-erp'?'Shape your ERP.':product.name}</h2>${demo()}<div class="cc-dialog-actions"><a class="cc-custom-button" href="#cs-contact" data-cc-contact>Get project advice <span aria-hidden="true">↗</span></a><button class="cc-secondary" type="button" data-cc-product="${product.id}">Product details</button></div>`,source);
  if(product.id==='stockflow')updatePeriod('30');
  if(product.id==='industry-erp')updateModules();
}

function compare(source) {
  if (!visibleProducts.length) return;
  const rows = [
    ['Type',p=>p.label],['Example price',money],['Delivery',p=>p.delivery],
    ['Designed for',p=>industries.filter(([id])=>p.industries.includes(id)).map(([,name])=>name).join(', ')],
    ['Availability',p=>p.availability],['Main benefit',p=>p.description],['Licence & ownership',p=>p.licence],['Requirements',p=>p.requirements],['Other costs',p=>p.costs],['Support',p=>p.support],
  ];
  openPanel(`<p class="cc-dialog-kicker">A clearer choice</p><h2 id="cc-dialog-title">Compare your solutions.</h2><p>Compare the ${visibleProducts.length} ${visibleProducts.length===1?'solution':'solutions'} in your current selection. Each solves a different kind of problem.</p><div class="cc-comparison-scroll" tabindex="0" role="region" aria-label="Solution comparison table. Scroll horizontally on small screens."><table class="cc-comparison"><caption>Illustrative products and prices. Final availability and terms are not yet published.</caption><thead><tr><th scope="col">At a glance</th>${visibleProducts.map(p=>`<th scope="col">${p.name}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th>${visibleProducts.map(p=>`<td>${safe(value(p))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Explore</th>${visibleProducts.map(p=>`<td><button type="button" data-cc-product="${p.id}">${p.action} ↗</button></td>`).join('')}</tr></tbody></table></div><p class="cc-detail-note">On a small screen, swipe the table sideways to compare each solution.</p>`,source);
}

finder.addEventListener('submit',event=>{
  event.preventDefault();
  state.industry=finder.elements.industry.value;state.goal=finder.elements.goal.value;
  if(state.industry!=='all')section.closest('#cs-motion').dispatchEvent(new CustomEvent('cs:industry-change',{detail:state.industry}));
  if(mode==='custom'){
    const goalLabels={inventory:'stock, orders, and inventory',experience:'customer experience',operations:'connected business operations',support:'customer support automation'};
    const service=state.category!=='all'?state.category:({inventory:'erp',experience:'design',operations:'erp',support:'ai'}[state.goal]||'');
    const industry=state.industry!=='all'?state.industry:'';
    const need=goalLabels[state.goal];
    const description=`I have a custom project idea${industry?` for ${finder.elements.industry.selectedOptions[0].text}`:''}${need?` focused on ${need}`:''}. I would like help shaping the right next step.`;
    section.closest('#cs-motion').dispatchEvent(new CustomEvent('cs:brief-prefill',{detail:{service,industry,goal:description}}));
    section.querySelector('.cc-custom-button').click();
    return;
  }
  render();
});
section.addEventListener('click',event=>{
  const button=event.target.closest('button,a');
  if(!button)return;
  if(button.hasAttribute('data-pd-back')){if(searchSession)openSearch();else closePanel();return;}
  if(button.hasAttribute('data-pd-tab')){selectProductTab(button.dataset.pdTab);return;}
  if(button.hasAttribute('data-pd-show-licence')){selectProductTab('licence',true);return;}
  if(button.hasAttribute('data-cc-purchase')){const product=products.find(p=>p.id===button.dataset.ccPurchase);if(product)openPanel(purchasePreviewMarkup(product),button,'product');return;}
  if(button.hasAttribute('data-cc-project')){
    section.closest('#cs-motion').dispatchEvent(new CustomEvent('cs:brief-prefill',{detail:{service:button.dataset.ccProject,goal:'I would like to discuss '+button.dataset.ccProjectName+' for my business.'}}));
    closePanel(document.querySelector('#pb-title'));return;
  }
  if(button.hasAttribute('data-cc-search-back')){openSearch();return;}
  if(button.hasAttribute('data-cc-search-clear')){searchQuery='';body.querySelector('.cc-search-input').value='';updateSearchResults();body.querySelector('.cc-search-input').focus({preventScroll:true});return;}
  if(button.hasAttribute('data-cc-search-term')){searchQuery=button.dataset.ccSearchTerm;body.querySelector('.cc-search-input').value=searchQuery;updateSearchResults();return;}
  if(button.hasAttribute('data-cc-browse')){reset();return;}
  if(button.hasAttribute('data-cc-category')){
    state.category=button.dataset.ccCategory;
    state.industry=finder.elements.industry.value;state.goal=finder.elements.goal.value;
    render();return;
  }
  if(button.hasAttribute('data-cc-compare')){compare(button);return;}
  if(button.hasAttribute('data-cc-product')){
    const product=products.find(p=>p.id===button.dataset.ccProduct);if(product)showProduct(product,button);return;
  }
  if(button.hasAttribute('data-cc-demo')){
    const product=products.find(p=>p.id===button.dataset.ccDemo);if(product)showDemo(product,button);return;
  }
  if(button.hasAttribute('data-cc-period')){updatePeriod(button.dataset.ccPeriod);return;}
  if(button.hasAttribute('data-cc-device')){updateDevice(button.dataset.ccDevice);return;}
  if(button.hasAttribute('data-cc-question')){sendDemoMessage(button.dataset.ccQuestion);return;}
  if(button.hasAttribute('data-cc-contact')){
    const contactToggle=document.querySelector('[data-contact-toggle]');
    closePanel(contactToggle);
    // Let the normal site anchor handler navigate after the native dialog closes.
    if(contactToggle?.getAttribute('aria-expanded')==='false')contactToggle.click();
  }
});
body.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-pd-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const names=['preview','included','licence'],i=names.indexOf(tab.dataset.pdTab);
  selectProductTab(names[event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:-1)+3)%3],true);
});
body.addEventListener('change',event=>{if(event.target.matches('input[name="cc-module"]'))updateModules();});
body.addEventListener('input',event=>{if(event.target.matches('.cc-search-input')){searchQuery=event.target.value;updateSearchResults();}});
body.addEventListener('submit',event=>{
  if(event.target.matches('.cc-search-form')){event.preventDefault();updateSearchResults();body.querySelector('.cc-search-result')?.focus({preventScroll:true});return;}
  if(!event.target.matches('.cc-chat-form'))return;
  event.preventDefault();const input=event.target.elements.message;sendDemoMessage(input.value);input.value='';input.focus({preventScroll:true});
});
section.closest('#cs-motion').addEventListener('click', event => {
  const modeButton=event.target.closest('[data-cc-mode]');
  if(modeButton){
    mode=modeButton.dataset.ccMode;
    section.querySelectorAll('[data-cc-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button===modeButton)));
    finder.querySelector('.cc-match').innerHTML=mode==='custom'?'Shape my project <span aria-hidden="true">↗</span>':'Find my match <span aria-hidden="true">↗</span>';
    finder.setAttribute('aria-label',mode==='custom'?'Start a custom project brief':'Find your solution');
    return;
  }
  const searchButton = event.target.closest('[data-cc-search]');
  if (searchButton) { openSearch(searchButton); return; }
  const categoryLink = event.target.closest('[data-guide-category]');
  if (!categoryLink) return;
  const category = categoryLink.dataset.guideCategory;
  if (!['software','design','erp','ai'].includes(category)) return;
  state.industry='all';state.goal='all';state.category=category;
  finder.elements.industry.value='all';finder.elements.goal.value='all';render();
  requestAnimationFrame(()=>section.querySelector('#cc-title').focus({preventScroll:true}));
});
section.closest('#cs-motion').addEventListener('cs:industry-change',event=>{
  const id=typeof event.detail==='string'?event.detail:event.detail?.industry;
  if(!id||![...finder.elements.industry.options].some(option=>option.value===id)||finder.elements.industry.value===id)return;
  finder.elements.industry.value=id;state.industry=id;render(false);
});
function refreshPageLayout() {
  section.closest('#cs-motion').dispatchEvent(new CustomEvent('cs:layout-change'));
}
// Includes responsive wrapping, fonts and changes to the card result count.
new ResizeObserver(refreshPageLayout).observe(section);
render(false);icons();
