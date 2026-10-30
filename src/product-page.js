const version=new URL(import.meta.url).search;
const [{getProductDetail,productBriefUrl,productInquiry,normalizeFit,fitResult,sampleReply,savedKey},{renderProductPage},{readSaved,changeSaved}]=await Promise.all([
  import(new URL('./product-page-data.mjs'+version,import.meta.url)),
  import(new URL('./product-page-view.mjs'+version,import.meta.url)),
  import(new URL('./collection-data.mjs'+version,import.meta.url)),
]);
const root=document.querySelector('[data-product-root]'),params=new URLSearchParams(location.search),p=getProductDetail(params.get('id'));
const icons=()=>globalThis.lucide?.createIcons();
const header=document.querySelector('.cs-site-header'),menu=header.querySelector('.cs-mobile-links'),menuButton=header.querySelector('.cs-menu');
function setMenu(open){menu.hidden=!open;header.dataset.menuOpen=String(open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
menuButton.addEventListener('click',()=>setMenu(menu.hidden));
header.querySelector('[data-collection-search]')?.addEventListener('click',()=>location.assign('./collection.html?search=1'));
document.addEventListener('click',e=>{if(!header.contains(e.target))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setMenu(false);menuButton.focus();}});
window.addEventListener('resize',()=>{if(innerWidth>760)setMenu(false);});
if(!p){
  document.title='Solution not found — CanveliqSoft';
  root.innerHTML='<main class="pp-not-found" id="pp-content"><span class="pp-status">Solution not found</span><h1>Let’s find your next solution.</h1><p>This product link is no longer available. Explore the Collection to find software, design, ERP and AI for your industry.</p><a href="./collection.html">Back to Collection →</a></main>';
  icons();
}else{
  document.title=`${p.name} — ${p.industryName} | CanveliqSoft`;
  document.querySelector('meta[name="description"]').content=`${p.name}: ${p.promise} Explore inclusions, delivery, illustrative pricing and your next step.`;
  root.innerHTML=renderProductPage(p);icons();
  let saved=[],savedForVisit=false,fit=normalizeFit(Object.fromEntries(params)),stock=p.demo.initial,orderStep=0,language='en',fitTrigger=null;
  try{saved=readSaved(localStorage.getItem(savedKey));}catch{/* Saving still works for this visit. */}
  const status=root.querySelector('[data-pp-status]'),dialog=root.querySelector('#pp-fit-dialog'),form=dialog.querySelector('[data-pp-fit-form]'),result=dialog.querySelector('[data-pp-fit-result]');
  function syncSaved(){root.querySelectorAll('[data-pp-save]').forEach(b=>{b.setAttribute('aria-pressed',String(saved.includes(p.id)));b.querySelector('span').textContent=saved.includes(p.id)?'Saved':'Save';b.setAttribute('aria-label',`${saved.includes(p.id)?'Remove':'Save'} ${p.name}${saved.includes(p.id)?' from saved collection':''}`);});}
  function syncBrief(){
    root.querySelectorAll('[data-pp-discuss]').forEach(a=>a.href=productBriefUrl(p.id,fit));
    const inquiry=productInquiry(p.id,fit);
    root.querySelector('[data-pp-whatsapp]').href=`https://wa.me/8801918225143?text=${encodeURIComponent(`Hello Kazi Jawad,\n\n${inquiry.goal}`)}`;
    const summary=root.querySelector('[data-pp-fit-summary]'),complete=fitResult(p.id,fit);
    summary.hidden=!complete;if(complete)summary.textContent=`${complete.title} Your answers will be included in the brief.`;
    root.querySelector('[data-pp-brief-note]').textContent=complete?`Your brief will include ${p.name} and your fit-check answers.`:`Your project brief will include ${p.name}.`;
  }
  function showFitResult(){
    const message=fitResult(p.id,fit);if(!message)return;
    form.hidden=true;result.hidden=false;
    result.querySelector('[data-pp-fit-result-title]').textContent=message.title;
    result.querySelector('[data-pp-fit-result-note]').textContent=message.note;
    result.querySelector('h3').focus();syncBrief();
  }
  root.addEventListener('click',event=>{
    const save=event.target.closest('[data-pp-save]');
    if(save){const changed=changeSaved(p.id,saved,()=>localStorage,savedForVisit);saved=changed.saved;savedForVisit=!changed.persisted;syncSaved();status.textContent=`${p.name} ${saved.includes(p.id)?'saved':'removed from saved collection'}${changed.persisted?'':' for this visit only'}.`;}
    if(event.target.closest('[data-pp-fit-open]')){
      fitTrigger=event.target.closest('[data-pp-fit-open]');form.hidden=false;result.hidden=true;
      for(const [key,value] of Object.entries(fit))form.elements[key].value=value;
      document.documentElement.classList.add('pp-dialog-open');dialog.showModal();
    }
    if(event.target.closest('[data-pp-fit-close]'))dialog.close();
    if(event.target.closest('[data-pp-fit-edit]')){form.hidden=false;result.hidden=true;form.elements.team.focus();}
    if(event.target.closest('[data-pp-simulate]')){
      stock=Math.max(0,stock-p.demo.change);root.querySelectorAll('[data-pp-stock]').forEach(el=>el.textContent=stock);
      const button=root.querySelector('[data-pp-simulate]');button.disabled=stock===0;
      root.querySelector('[data-pp-demo-status]').textContent=stock?`Sample updated: ${stock} ${p.demo.item.toLowerCase()} ${p.demo.unit}.`:'The sample has reached zero. Reset to try again.';
    }
    if(event.target.closest('[data-pp-order-next]')){
      orderStep=Math.min(2,orderStep+1);const labels=['Received','In preparation','Complete'];
      root.querySelector('[data-pp-order-status]').textContent=labels[orderStep];
      root.querySelectorAll('.pp-order-progress i').forEach((el,i)=>el.classList.toggle('is-done',i<=orderStep));
      const b=root.querySelector('[data-pp-order-next]');b.textContent=orderStep===1?'Mark complete →':'Sample completed';b.disabled=orderStep===2;
      root.querySelector('[data-pp-demo-status]').textContent=`Sample order #1042 is ${labels[orderStep].toLowerCase()}.`;
    }
    if(event.target.closest('[data-pp-reset]')){
      stock=p.demo.initial;orderStep=0;root.querySelectorAll('[data-pp-stock]').forEach(el=>el.textContent=stock);
      const sale=root.querySelector('[data-pp-simulate]');if(sale)sale.disabled=false;
      const order=root.querySelector('[data-pp-order-next]');if(order){order.disabled=false;order.textContent='Move to preparation →';root.querySelector('[data-pp-order-status]').textContent='Received';root.querySelectorAll('.pp-order-progress i').forEach((el,i)=>el.classList.toggle('is-done',i===0));}
      root.querySelector('[data-pp-demo-status]').textContent='Sample reset. No live business data.';
    }
    const langButton=event.target.closest('[data-pp-language]');
    if(langButton){
      language=langButton.dataset.ppLanguage;root.querySelectorAll('[data-pp-language]').forEach(b=>b.setAttribute('aria-pressed',String(b===langButton)));
      const log=root.querySelector('[data-pp-chat-log]');log.replaceChildren();appendMessage(language==='bn'?'স্বাগতম! ডেলিভারি, মূল্য অথবা অর্ডার সম্পর্কে নমুনা প্রশ্ন করুন।':'Hello! Try a question about delivery, pricing or order tracking.');
      const input=root.querySelector('#pp-message');input.lang=language==='bn'?'bn':'en';input.placeholder=language==='bn'?'একটি নমুনা প্রশ্ন করুন…':'Ask a sample question…';
    }
  });
  form.addEventListener('submit',e=>{e.preventDefault();fit=normalizeFit(Object.fromEntries(new FormData(form)));showFitResult();});
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('pp-dialog-open');fitTrigger?.focus({preventScroll:true});});
  let backdropStart=false;
  dialog.addEventListener('pointerdown',e=>{backdropStart=e.target===dialog;});
  dialog.addEventListener('pointerup',e=>{if(backdropStart&&e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}backdropStart=false;});
  function appendMessage(text,user=false){const log=root.querySelector('[data-pp-chat-log]');if(!log)return;const bubble=document.createElement('p');bubble.className='pp-bubble'+(user?' pp-bubble-user':'');bubble.textContent=text;bubble.lang=language==='bn'?'bn':'en';log.append(bubble);while(log.children.length>12)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;}
  root.querySelector('[data-pp-chat-form]')?.addEventListener('submit',e=>{e.preventDefault();const input=e.target.elements.message,text=input.value.trim();if(!text)return;appendMessage(text,true);appendMessage(sampleReply(p.id,text,language));input.value='';});
  function refreshSaved(){if(savedForVisit)return;try{saved=readSaved(localStorage.getItem(savedKey));syncSaved();}catch{/* Retain this visit's selection. */}}
  window.addEventListener('storage',e=>{if(e.key===savedKey||e.key===null)refreshSaved();});
  window.addEventListener('pageshow',refreshSaved);
  let frame=0;
  const sections=[...root.querySelectorAll('[data-pp-section]')],progress=[...root.querySelectorAll('.pp-progress a')];
  function updateProgress(){frame=0;let active=sections[0].id;for(const section of sections)if(section.getBoundingClientRect().top<=180)active=section.id;progress.forEach(a=>{if(a.hash===`#${active}`)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});header.classList.toggle('is-scrolled',scrollY>24);}
  window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateProgress);},{passive:true});
  syncSaved();syncBrief();updateProgress();
}
