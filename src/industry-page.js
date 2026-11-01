import {getIndustryPage} from './industry-page-data.mjs';

const root=document.querySelector('[data-industry-root]');
const icons=()=>window.lucide?.createIcons?.({attrs:{'stroke-width':1.7}});
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const params=new URLSearchParams(location.search);
const id=params.get('industry')||'healthcare';
const page=getIndustryPage(id);
const categoryLabel={software:'SOFTWARE',design:'DESIGN KIT',erp:'CUSTOM ERP',ai:'AI & CHATBOTS'};
const categoryIcon={software:'layout-dashboard',design:'panels-top-left',erp:'workflow',ai:'messages-square'};
const workflowIcon=['inbox','settings-2','chart-no-axes-column-increasing','send'];

function notFound(){
  root.innerHTML='<main class="ip-not-found" id="ip-main"><span class="ip-kicker">INDUSTRY GUIDE</span><h1>Let’s find your <em>starting point.</em></h1><p>Choose an industry to explore relevant software, design, ERP and AI concepts.</p><a class="ip-button ip-button-dark" href="./collection.html">Explore all industries <span aria-hidden="true">↗</span></a></main>';
}
function priorityNote(category){
  const [first,second,third]=page.labels.map(label=>label.toLowerCase());
  return ({
    software:`Ready-made tools to keep ${first} and daily work in view.`,
    design:`Clearer screens for ${first} and the people using them.`,
    erp:`Connect ${first}, ${second} and ${third} in one shared workspace.`,
    ai:`Help people find ${second} and reach the right next step.`,
  })[category];
}
function priorityVisual(category){
  if(category==='software')return `<span class="ip-priority-visual-title">${esc(page.labels[0])}</span><span class="ip-priority-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`;
  if(category==='design')return `<span class="ip-priority-visual-title">A clearer team journey</span><span class="ip-priority-screens" aria-hidden="true"><i><b></b><b></b><b></b></i><i><b></b><b></b><b></b></i><i><b></b><b></b><b></b></i></span>`;
  if(category==='erp')return `<span class="ip-priority-visual-title">Connected workflow</span><span class="ip-priority-flow" aria-hidden="true">${page.modules.map((module,index)=>`<i>${esc(module)}</i>${index<page.modules.length-1?'<b>→</b>':''}`).join('')}</span>`;
  return `<span class="ip-priority-visual-title">Ask your workspace</span><span class="ip-priority-search" aria-hidden="true"><i data-lucide="search"></i> ${esc(page.labels[1])}</span><span class="ip-priority-results" aria-hidden="true"><i>${esc(page.labels[0])}</i><i>${esc(page.labels[2])}</i></span>`;
}
function productPreview(product,index){
  const modules=product.modules;
  if(product.category==='design')return `<div class="ip-preview-design"><span class="ip-preview-window"><i></i><i></i><i></i><b>${esc(product.name)}</b><small>${esc(page.flow[0])}</small><em></em><em></em></span><span class="ip-preview-phone"><i></i><b>${esc(modules[0])}</b><small>${esc(page.flow[1])}</small><em></em><em></em><em></em></span><span class="ip-preview-palette"><i></i><i></i><i></i><i></i></span></div>`;
  if(product.category==='erp')return `<div class="ip-preview-erp"><div class="ip-preview-head"><span>${esc(product.name)}</span><b>WORKSPACE</b></div><div class="ip-preview-table"><span>WORKFLOW</span><span>OWNER</span><span>STATUS</span>${page.flow.slice(0,3).map((step,i)=>`<i>${esc(step)}</i><i>${esc(modules[i])}</i><b class="ip-preview-status ip-preview-status-${i}">${['Ready','In progress','Review'][i]}</b>`).join('')}</div></div>`;
  if(product.category==='ai')return `<div class="ip-preview-chat"><div class="ip-preview-chat-head"><i data-lucide="sparkles"></i><span>${esc(product.name)}</span><b>READY</b></div><p>${esc(page.priorities[3][1])}?</p><strong>${esc(page.insight.split('.')[0])}.</strong><span>${esc(page.flow[3])} <i>→</i></span><div class="ip-preview-input">Ask about ${esc(modules[0].toLowerCase())}… <b>↑</b></div></div>`;
  if(index===4)return `<div class="ip-preview-stock"><div class="ip-preview-head"><span>${esc(product.name)}</span><b>INVENTORY</b></div>${modules.map((module,i)=>`<div class="ip-preview-stock-row"><i></i><span>${esc(module)}</span><b>${['In view','On track','Updated'][i]}</b></div>`).join('')}</div>`;
  return `<div class="ip-preview-dashboard"><div class="ip-preview-side"><b>${esc(product.name.split(/\s+/).map(word=>word[0]).slice(0,2).join(''))}</b><i></i><i></i><i></i><i></i></div><div class="ip-preview-main"><div class="ip-preview-head"><span>${esc(product.name)}</span><b>OVERVIEW</b></div><strong>${esc(page.flow[0])}</strong><div class="ip-card-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="ip-preview-dash-foot"><span>${esc(modules[0])}</span><span>${esc(modules[1])}</span><span>${esc(modules[2])}</span></div></div></div>`;
}
function productCard(product,index){
  const preview=productPreview(product,index),variant=index===4?'workspace':product.category;
  const tags=product.modules.slice(0,3).map(esc).join(' · ');
  return `<article class="ip-product-card" data-category="${esc(product.category)}" style="--card-index:${index}"><div class="ip-card-visual ip-card-${esc(product.category)} ip-card-variant-${variant}"><div class="ip-card-chrome"><i></i><i></i><i></i><span>${esc(product.industryName)} / ${esc(categoryLabel[product.category]||'SOLUTION')}</span></div>${preview}<span class="ip-card-category"><i data-lucide="${categoryIcon[product.category]||'layers'}"></i>${esc(categoryLabel[product.category]||'SOLUTION')}</span></div><div class="ip-product-copy"><p class="ip-product-tag">${esc(product.label)}</p><h3><a href="./product.html?id=${encodeURIComponent(product.id)}">${esc(product.name)} <span aria-hidden="true">↗</span></a></h3><p>${esc(product.description)}</p><span class="ip-product-modules">${tags}</span><a class="ip-product-link" href="./product.html?id=${encodeURIComponent(product.id)}">Explore this solution <span aria-hidden="true">→</span></a></div></article>`;
}
function workflowSteps(className='ip-workflow-steps'){
  return `<div class="${className}" aria-label="${esc(page.name)} workflow">${page.flow.map((step,index)=>`<span class="ip-workflow-step"><i data-lucide="${workflowIcon[index]}"></i><b>${esc(step)}</b></span>${index<page.flow.length-1?'<span class="ip-workflow-connector" aria-hidden="true">→</span>':''}`).join('')}</div>`;
}
function render(){
  if(!page){notFound();return;}
  const productIds=page.products.map(p=>p.id);
  const intensity={retail:'C05C70',manufacturing:'53B9D0',healthcare:'55D4D9',education:'8172F2',hospitality:'D2A36C',textile:'4FBFA8',fashion:'D879AB',tourism:'67AEEA',sports:'91B86C'}[id]||'55D4D9';
  const scene=['retail','manufacturing','healthcare','education','hospitality'].includes(page.image)?page.image:null;
  if(scene)root.style.setProperty('--industry-scene',`url("./assets/showcase/${scene}.png")`);
  else root.style.removeProperty('--industry-scene');
  document.title=`${page.name} solutions — CanveliqSoft`;
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content=`Explore ${page.name.toLowerCase()} workflows, software, ERP, design and AI concepts from CanveliqSoft.`;
  root.innerHTML=`<main class="ip-main" id="ip-main" data-industry="${esc(id)}" style="--industry-accent:#${intensity}">
  <section class="ip-hero" aria-labelledby="ip-title"><div class="ip-hero-copy"><a class="ip-breadcrumb" href="./collection.html"><span aria-hidden="true">←</span> Collection <i>/</i> ${esc(page.name)}</a><span class="ip-kicker"><i></i> INDUSTRY WORKSPACE · ${String(page.products.length).padStart(2,'0')} SOLUTION CONCEPTS</span><h1 id="ip-title">${esc(page.name)}<em>${esc(page.lead)}</em></h1><p>${esc(page.intro)}</p><div class="ip-hero-actions"><a class="ip-button ip-button-accent" href="#ip-solutions">Explore ${esc(page.name)} solutions <span aria-hidden="true">↘</span></a><a class="ip-text-link" href="./custom-brief.html?industry=${encodeURIComponent(id)}">Shape a custom solution <span aria-hidden="true">↗</span></a></div><div class="ip-trust-line"><span><i></i> SAMPLE PRODUCT CONCEPTS</span><span>Scope and availability confirmed together</span></div></div>
  <div class="ip-hero-art" aria-label="Illustrative ${esc(page.name)} operations dashboard"><div class="ip-orbit ip-orbit-one"></div><div class="ip-orbit ip-orbit-two"></div><div class="ip-float-card ip-float-left"><span><i data-lucide="${esc(page.icon)}"></i> ${esc(page.name)}</span><strong>${esc(page.stats?.[0]||page.modules[0])}</strong><small>${esc(page.labels[0])} · overview</small><div class="ip-mini-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ip-dash"><div class="ip-dash-top"><span class="ip-dash-brand"><i data-lucide="${esc(page.icon)}"></i> ${esc(page.names[0])}</span><span class="ip-dash-live"><i></i> LIVE OVERVIEW</span><span class="ip-dash-dots">•••</span></div><nav class="ip-dash-tabs" aria-label="Workspace views">${['Overview',...page.modules].map((label,index)=>`<span class="${index===0?'is-active':''}">${esc(label)}</span>`).join('')}</nav><div class="ip-dash-heading"><span>YOUR ${esc(id.toUpperCase())} WORKSPACE</span><b>${esc(page.name)} overview</b><small>Illustrative interface · sample content</small></div><div class="ip-dash-grid">${page.labels.map((label,i)=>`<article><span><i data-lucide="${['calendar-days','users-round','workflow'][i]}"></i>${esc(label)}</span><strong>${esc(page.stats?.[i]||page.modules[i]||page.modules[0])}</strong><small>${['Planned and reviewed','Moving through the workflow','Ready for the next step'][i]}</small><div class="ip-dash-meter"><i style="--meter:${[92,68,76][i]}%"></i></div></article>`).join('')}</div><div class="ip-dash-flow"><span>CONNECTED WORKFLOW</span>${workflowSteps('ip-dash-workflow')}</div><small class="ip-dash-disclaimer">Illustrative sample data for concept preview</small></div><div class="ip-float-card ip-float-right"><span><i data-lucide="sparkles"></i> ONE CLEAR NEXT STEP</span><strong>${esc(page.modules[1])}</strong><small>${esc(page.insight.split('.')[0])}.</small><i class="ip-float-arrow">↗</i></div><span class="ip-art-caption">CANVELIQSOFT / ${esc(id.toUpperCase())} CONCEPT</span></div></section>
  <section class="ip-priorities" aria-labelledby="ip-priorities-title"><div class="ip-section-heading"><span class="ip-kicker"><i></i> START WITH WHAT MATTERS</span><h2 id="ip-priorities-title">Where should we <em>start?</em></h2><p>Choose a priority to see a useful next step for your team.</p></div><div class="ip-priority-grid" role="group" aria-label="Choose a ${esc(page.name)} priority">${page.priorities.map(([category,label],i)=>`<button class="ip-priority${i===0?' is-active':''}" type="button" data-priority="${esc(category)}" aria-pressed="${i===0}"><span class="ip-priority-number">0${i+1}</span><i data-lucide="${categoryIcon[category]}"></i><strong>${esc(label)}</strong><small>${esc(priorityNote(category))}</small><span class="ip-priority-visual" aria-hidden="true">${priorityVisual(category)}</span><span class="ip-priority-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><p class="ip-priority-result" role="status" aria-live="polite" data-priority-result>Showing every ${esc(page.name)} solution. Choose a focus to narrow the collection.</p></section>
  <section class="ip-solutions" id="ip-solutions" aria-labelledby="ip-solutions-title"><div class="ip-section-heading ip-solutions-heading"><div><span class="ip-kicker"><i></i> THE ${esc(id.toUpperCase())} COLLECTION</span><h2 id="ip-solutions-title">A thoughtful fit for <em>${esc(page.name)}.</em></h2><p>${esc(page.line)} Each concept is a starting point for a scoped conversation.</p></div><a class="ip-outline-link" href="./collection.html?industry=${encodeURIComponent(id)}">Compare across industries <span aria-hidden="true">↗</span></a></div><div class="ip-filter-bar" role="group" aria-label="Filter ${esc(page.name)} solutions"><button type="button" data-filter="all" aria-pressed="true">All solutions <span>05</span></button><button type="button" data-filter="software" aria-pressed="false">Software</button><button type="button" data-filter="design" aria-pressed="false">UI/UX design</button><button type="button" data-filter="erp" aria-pressed="false">ERP systems</button><button type="button" data-filter="ai" aria-pressed="false">AI &amp; chatbots</button></div><div class="ip-products">${page.products.map(productCard).join('')}</div><p class="ip-no-products" data-no-products hidden>No concepts in this focus yet. <button type="button" data-filter="all">Show all solutions</button></p><p class="ip-catalogue-note">Illustrative catalogue. Product availability, features, pricing, delivery and support are confirmed before purchase.</p></section>
  <section class="ip-workflow" aria-labelledby="ip-workflow-title"><div class="ip-workflow-heading"><span class="ip-kicker"><i></i> FROM FIRST STEP TO FOLLOW-THROUGH</span><h2 id="ip-workflow-title">A calmer ${esc(page.name.toLowerCase())} day, <em>by design.</em></h2><p>${esc(page.insight)}</p></div><ol class="ip-flow">${page.flow.map((step,i)=>`<li><span>0${i+1}</span><i data-lucide="${['inbox','calendar-check-2','share-2','check-check'][i]}"></i><strong>${esc(step)}</strong><small>${esc([page.modules[0],page.modules[1],page.modules[2], 'Shared workspace'][i])}</small></li>`).join('')}</ol><div class="ip-flow-note"><span><i data-lucide="git-branch"></i> CONNECTED BY PURPOSE</span><p>Each step can be considered on its own or connected to the workflow around it.</p></div></section>
  <section class="ip-cta" aria-labelledby="ip-cta-title"><div class="ip-cta-mark" aria-hidden="true">✳</div><div><span class="ip-kicker">A WORKFLOW UNIQUE TO YOUR TEAM?</span><h2 id="ip-cta-title">Let’s shape a solution <em>around your work.</em></h2><p>Tell us what is slowing the team down. We’ll help map a practical next step for ${esc(page.name.toLowerCase())}.</p></div><a class="ip-button ip-button-cyan" href="./custom-brief.html?industry=${encodeURIComponent(id)}">Share your idea <span aria-hidden="true">↗</span></a></section>
  </main><footer class="ip-footer"><a href="./index.html#cs-top"><img src="./assets/canveliqsoft-mark.svg" alt="CanveliqSoft" width="112" height="44"></a><span>Thoughtful systems for ${esc(page.name.toLowerCase())}.</span><a href="#ip-main">Back to top ↑</a></footer>`;
  const disclaimer=root.querySelector('.ip-dash-disclaimer');
  if(page.disclaimer&&disclaimer)disclaimer.textContent=page.disclaimer;
  bind();icons();
}
function bind(){
  const productCards=[...root.querySelectorAll('.ip-product-card')],buttons=[...root.querySelectorAll('[data-filter]')];
  function filter(category){
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===category)));
    let count=0;productCards.forEach(card=>{const show=category==='all'||card.dataset.category===category;card.hidden=!show;if(show)count++;});
    root.querySelector('[data-no-products]').hidden=count>0;
    root.querySelector('[data-priority-result]').textContent=category==='all'?`Showing every ${page.name} solution. Choose a focus to narrow the collection.`:`Showing ${count} ${category==='erp'?'ERP':category==='ai'?'AI & chatbot':category==='design'?'design':'software'} concept${count===1?'':'s'} for ${page.name}. Open any card to see what it includes and how to discuss it.`;
  }
  root.addEventListener('click',event=>{
    const priority=event.target.closest('[data-priority]');
    if(priority){root.querySelectorAll('[data-priority]').forEach(button=>{const active=button===priority;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});filter(priority.dataset.priority);root.querySelector('#ip-solutions').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
    const option=event.target.closest('[data-filter]');if(option)filter(option.dataset.filter);
  });
}
render();
