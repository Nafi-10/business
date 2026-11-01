const root = document.querySelector('#cs-motion');
const dialog = root.querySelector('#cs-industry-explorer');
const trigger = root.querySelector('[data-explore-industries]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// These are service capabilities, not claims about available production products.
const industries = [
  { id:'retail', name:'Retail & commerce', icon:'shopping-bag', description:'From a first purchase to a lasting relationship. Make every part of commerce feel connected.', software:'POS, stock management, order tracking, and customer records.', design:'Distinctive storefronts, product discovery, and effortless checkouts.', erp:'Connect sales, purchasing, inventory, accounting, and multiple stores.' },
  { id:'manufacturing', name:'Manufacturing', icon:'factory', description:'Clarity on the factory floor. Connect your people, materials, and production from order to delivery.', software:'Production planning, work orders, and quality check tools.', design:'Clear operator dashboards and practical production interfaces.', erp:'Coordinate materials, procurement, production, quality, and finance.' },
  { id:'healthcare', name:'Healthcare', icon:'heart-pulse', description:'Thoughtful digital experiences for the people delivering care and the people receiving it.', software:'Appointments, clinic schedules, queues, and billing tools.', design:'Accessible patient journeys, booking flows, and care team interfaces.', erp:'Bring departments, supplies, staff, and administrative operations together.' },
  { id:'education', name:'Education', icon:'graduation-cap', description:'A more connected learning community, from a student’s first application to their next achievement.', software:'Attendance, timetables, course management, and fee tracking.', design:'Welcoming student portals and intuitive learning experiences.', erp:'Unite admissions, examinations, fees, staffing, and campus resources.' },
  { id:'hospitality', name:'Hospitality', icon:'hotel', description:'Make the work behind a memorable stay feel as seamless as the experience you give your guests.', software:'Reservations, room status, restaurant POS, and guest records.', design:'Inviting booking journeys and thoughtful guest experiences.', erp:'Connect properties, housekeeping, purchasing, teams, and accounts.' },
  { id:'textile', name:'Textile', icon:'swatch-book', description:'From the first fibre to the final shipment. Give every material, order, and production stage a clear path.', software:'Fabric inventory, batch tracking, order costing, and inspection tools.', design:'Practical production dashboards and intuitive buyer portals.', erp:'Connect sourcing, dyeing, weaving, finishing, quality, and delivery.' },
  { id:'fashion', name:'Fashion Designing', icon:'scissors', description:'Give your creative vision a digital home, with the systems to take every collection from concept to customer.', software:'Collection planning, sample tracking, and order management tools.', design:'Editorial portfolios, digital lookbooks, and fashion shopping experiences.', erp:'Coordinate materials, sampling, production, vendors, and distribution.' },
  { id:'tourism', name:'Tourism', icon:'compass', description:'Make discovery feel effortless. Connect inspiring destinations with an organised journey behind the scenes.', software:'Itinerary planning, tour bookings, availability, and customer tools.', design:'Immersive destination websites and straightforward booking journeys.', erp:'Bring packages, partners, reservations, payments, and operations together.' },
  { id:'sports', name:'Sports', icon:'trophy', description:'More time for the game. Build a connected experience for athletes, teams, fans, and the people behind them.', software:'Club memberships, fixtures, facility bookings, and event tools.', design:'Engaging team platforms, fan experiences, and event registration.', erp:'Coordinate facilities, staff, equipment, events, and club finances.' },
];
let selected = 0;
let returnFocus = trigger;
let openedOffset = 0;
const grid = dialog.querySelector('.cs-explorer-grid');
const content = dialog.querySelector('.cs-explorer-content');
const project = dialog.querySelector('.cs-explorer-project');
const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
grid.innerHTML = industries.map((industry,index) => `<button class="cs-industry-choice" type="button" data-sector-index="${index}" aria-pressed="${index === 0}">${icon(industry.icon)}<small aria-hidden="true">${String(index+1).padStart(2,'0')}</small><span>${industry.name}</span></button>`).join('');

function render(index, animate = true) {
  selected = index;
  const industry = industries[index];
  grid.querySelectorAll('button').forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
  dialog.querySelector('.cs-explorer-detail-icon').innerHTML = icon(industry.icon);
  dialog.querySelector('.cs-explorer-sector-count').textContent = `${String(index+1).padStart(2,'0')} / 09`;
  dialog.querySelector('#cs-explorer-sector').textContent = industry.name;
  dialog.querySelector('.cs-explorer-description').textContent = industry.description;
  dialog.querySelector('.cs-explorer-services').innerHTML = [['Ready-made software','software'],['UI/UX design','design'],['Custom ERP systems','erp']].map(([title,key],i) => `<div class="cs-explorer-service"><span aria-hidden="true">0${i+1}</span><div><h4>${title}</h4><p>${industry[key]}</p></div></div>`).join('');
  project.dataset.sector = industry.name;
  project.dataset.sectorId = industry.id;
  project.setAttribute('aria-label',`Discuss your ${industry.name} project`);
  dialog.querySelector('.cs-explorer-announcement').textContent = `${industry.name}. Software, UI/UX design, and custom ERP services shown.`;
  globalThis.lucide?.createIcons();
  if (animate && !reducedMotion.matches) {
    content.getAnimations().forEach(animation => animation.cancel());
    content.animate([{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
  }
}

function open() {
  if (dialog.open) return;
  returnFocus = document.activeElement;
  const showcase = root.querySelector('.cs-showcase');
  const sectionTop = showcase.getBoundingClientRect().top + scrollY;
  const contentEnd = sectionTop + Math.max(0,showcase.querySelector('.cs-showcase-screen').offsetHeight - innerHeight);
  // Browser focus/scroll-into-view may center a footer button beyond the pin.
  // Restore to this chapter's readable range rather than retaining that jump.
  const openedAt = Math.min(Math.max(scrollY,sectionTop),contentEnd);
  openedOffset = openedAt - sectionTop;
  // Cancels pending wheel transitions before entering the modal interaction.
  root.dispatchEvent(new CustomEvent('cs:explorer-open'));
  document.documentElement.classList.add('cs-explorer-open');
  dialog.showModal();
  dialog.scrollTop = 0;
  window.scrollTo({top:openedAt,behavior:'instant'});
  if (!reducedMotion.matches) dialog.animate([{opacity:0,transform:'translateY(14px) scale(.985)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
}

function release() {
  document.documentElement.classList.remove('cs-explorer-open');
  // Prevent focus restoration from changing the pinned chapter’s scroll offset.
  // Recompute the boundary in case the device was rotated while browsing sectors.
  const showcase = root.querySelector('.cs-showcase');
  const sectionTop = showcase.getBoundingClientRect().top + scrollY;
  const readableDistance = Math.max(0,showcase.querySelector('.cs-showcase-screen').offsetHeight - innerHeight);
  window.scrollTo({top:sectionTop + Math.min(openedOffset,readableDistance),behavior:'instant'});
  if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
}

function close() {
  if (!dialog.open) return;
  dialog.close();
  release();
}

trigger.addEventListener('click',open);
dialog.querySelector('.cs-explorer-close').addEventListener('click',close);
dialog.querySelector('[data-explorer-return]').addEventListener('click',close);
dialog.querySelector('.cs-explorer-back').addEventListener('click',() => {
  dialog.querySelector('.cs-explorer-index').scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});
});
dialog.addEventListener('cancel',event => { event.preventDefault(); close(); });
dialog.addEventListener('click',event => {
  const choice = event.target.closest('[data-sector-index]');
  if (choice) {
    render(Number(choice.dataset.sectorIndex));
    root.dispatchEvent(new CustomEvent('cs:industry-change',{detail:industries[selected].id}));
    if (matchMedia('(max-width:620px)').matches) dialog.querySelector('.cs-explorer-detail').scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});
  }
});
root.addEventListener('cs:industry-change',event=>{
  const id=typeof event.detail==='string'?event.detail:event.detail?.industry;
  const index=industries.findIndex(item=>item.id===id);
  if(index>=0&&index!==selected)render(index,false);
});
// Only dismiss when both ends of the pointer gesture are on the backdrop.
let backdropStart = false;
dialog.addEventListener('pointerdown',event => { backdropStart = event.target === dialog; });
dialog.addEventListener('pointerup',event => { if (backdropStart && event.target === dialog) close(); backdropStart = false; });
project.addEventListener('click',close); // The existing quote handler receives the selected sector.
render(selected,false);
