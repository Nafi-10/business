const root = document.querySelector('#cs-motion');
const section = root?.querySelector('.cs-industry-story');
if (section) {
  const data = {
    retail: {name:'Retail & commerce', subtitle:'A connected commerce workflow, from shelf to checkout.', search:'Search products, orders, or locations…', nav:['Orders','Customers','Inventory'], metrics:[['Orders today','284','Across all channels'],['Stock alerts','18','Ready to review'],['Locations','06','Working in sync']], rows:['New web orders','Store replenishment','Returns review'], teams:['Store operations','Fulfilment','Customer care'], stocks:['Top-selling items','Packaging','Store supplies'], challenge:'Sales, stock and customer activity can be scattered across channels and locations.', connection:'Bring orders, inventory, fulfilment and customer records into one shared view.', improves:'Help teams spot stock needs, fulfil orders sooner and give customers a consistent experience.'},
    manufacturing: {name:'Manufacturing', subtitle:'A connected production workflow, from plan to dispatch.', search:'Search work orders, materials, or lines…', nav:['Work orders','Production teams','Materials'], metrics:[['Open orders','36','Moving through production'],['Active lines','08','Teams coordinated'],['Quality checks','12','Ready for review']], rows:['Batch 024 · Assembly','Material check · Line 2','Quality review · Batch 018'], teams:['Assembly line','Quality control','Materials planning'], stocks:['Raw materials','Safety components','Packaging'], challenge:'Production relies on people, materials and quality checks moving together at the right time.', connection:'Connect work orders, production teams, stock and inspection updates.', improves:'Give teams clearer priorities and earlier visibility into production blockers.'},
    healthcare: {name:'Healthcare', subtitle:'A connected workflow for better care.', search:'Search patients, appointments, or records…', nav:['Appointments','Care teams','Supplies'], metrics:[['Appointments','48','Across 6 departments'],['Care teams','12','Working in sync'],['Open tasks','06','Ready for review']], rows:['Patient follow-up','New patient consultation','Care team review'], teams:['Primary care','Patient services','Operations'], stocks:['Medical supplies','Daily essentials','Equipment'], challenge:'Care is complex, with many people, systems and touchpoints.', connection:'Bring appointments, teams, resources and reporting into one clear view.', improves:'Make coordination clearer and help everyone work from the same information.'},
    education: {name:'Education', subtitle:'A connected campus workflow for a smoother student journey.', search:'Search students, classes, or campus…', nav:['Admissions','Faculty teams','Resources'], metrics:[['Applications','128','Across 4 programmes'],['Classes today','32','Teams coordinated'],['Open requests','14','Ready for review']], rows:['Application · Year 1','Classroom update · Room 204','Student support review'], teams:['Admissions','Teaching staff','Student services'], stocks:['Learning materials','Lab equipment','Campus supplies'], challenge:'Student services, classes and campus operations often live in separate systems.', connection:'Connect admissions, timetables, teaching teams and campus resources.', improves:'Help staff respond sooner and keep the student experience consistent.'},
    hospitality: {name:'Hospitality', subtitle:'A connected guest workflow, from booking to check-out.', search:'Search bookings, rooms, or guests…', nav:['Reservations','Guest services','Housekeeping'], metrics:[['Arrivals today','64','Across the property'],['Rooms ready','42','Teams coordinated'],['Guest requests','09','Ready for review']], rows:['Suite 204 · Arrival','Room 108 · Housekeeping','Guest request · Dining'], teams:['Front desk','Housekeeping','Guest services'], stocks:['Room essentials','Kitchen supplies','Guest amenities'], challenge:'A great guest stay depends on timely coordination across several teams.', connection:'Connect reservations, room status, guest requests and operations.', improves:'Give staff a shared view so every hand-off feels more seamless.'}
  };
  const tabs = [...section.querySelectorAll('[data-cis-industry]')];
  const panel = section.querySelector('#cis-panel');
  const setText = (selector,value) => { const el=section.querySelector(selector); if(el) el.textContent=value; };
  const render = (id, announce=false) => {
    const item=data[id]; if(!item)return;
    section.classList.add('is-updating');
    tabs.forEach(tab=>{const selected=tab.dataset.cisIndustry===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    panel.setAttribute('aria-labelledby',`cis-tab-${id}`);
    setText('[data-cis-name]',item.name); setText('[data-cis-subtitle]',item.subtitle); setText('[data-cis-search]',item.search);
    item.nav.forEach((value,i)=>setText(`[data-cis-nav="${i===0?'one':i===1?'two':'three'}"]`,value));
    item.metrics.forEach((metric,i)=>{setText(`[data-cis-metric-label="${i}"]`,metric[0]);setText(`[data-cis-metric="${i}"]`,metric[1]);const note=section.querySelectorAll('.cis-stat-change')[i];if(note)note.textContent=metric[2];});
    item.rows.forEach((value,i)=>setText(`[data-cis-row="${i}"]`,value));
    item.teams.forEach((value,i)=>setText(`[data-cis-team="${i}"]`,value));
    item.stocks.forEach((value,i)=>setText(`[data-cis-stock="${i}"]`,value));
    setText('[data-cis-challenge]',item.challenge);setText('[data-cis-connection]',item.connection);setText('[data-cis-improves]',item.improves);
    if(announce)setText('[data-cis-status]',`${item.name} workflow selected. The example dashboard and details have been updated.`);
    requestAnimationFrame(()=>section.classList.remove('is-updating'));
  };
  section.addEventListener('click',event=>{
    const tab=event.target.closest('[data-cis-industry]');if(!tab)return;
    render(tab.dataset.cisIndustry,true);
    root.dispatchEvent(new CustomEvent('cs:industry-change',{detail:tab.dataset.cisIndustry}));
  });
  section.addEventListener('keydown',event=>{
    const current=event.target.closest('[data-cis-industry]');if(!current||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const i=tabs.indexOf(current);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].focus();tabs[next].click();
  });
  root.addEventListener('cs:industry-change',event=>{
    const id=typeof event.detail==='string'?event.detail:event.detail?.industry;
    if(data[id]&&section.querySelector('[aria-selected="true"]')?.dataset.cisIndustry!==id)render(id,true);
  });
  render('healthcare');
}
