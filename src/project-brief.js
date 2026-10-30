const {validateBriefStep,normalizeBrief,formatBrief,briefEmailUrl,services,sectors,budgets,timelines,readBriefDraft,mergeBriefContext}=await import(new URL('./project-brief-data.mjs'+new URL(import.meta.url).search,import.meta.url));
const root=document.querySelector('#cs-motion'), section=document.querySelector('#cs-contact'), form=section.querySelector('#pb-form'), review=section.querySelector('.pb-review');
const fields=[...form.querySelectorAll('[data-pb-panel]')], progress=[...form.querySelectorAll('[data-pb-step]')];
let step=0;
const data=()=>normalizeBrief(Object.fromEntries(new FormData(form)));
const draftKey='canveliqsoft-project-brief-tab',contextPanel=section.querySelector('[data-pb-context]');
let pendingContext=null;
function applyDraft(draft){for(const [name,value] of Object.entries(draft))if(form.elements[name])form.elements[name].value=value;}
function saveDraft(){try{sessionStorage.setItem(draftKey,JSON.stringify(data()));}catch{section.querySelector('[data-pb-draft-note]').textContent='Your answers stay on this page. Browser storage is unavailable, so keep this tab open.';}}
try{const draft=readBriefDraft(sessionStorage.getItem(draftKey));if(draft)applyDraft(draft);}catch{/* The form remains usable without browser storage. */}
form.addEventListener('input',saveDraft);form.addEventListener('change',saveDraft);
window.addEventListener('pageshow',event=>{
  // History traversal can restore old native form values after pageshow.
  // Reconcile on the next task; changes are already saved on input/change.
  setTimeout(()=>{try{const draft=readBriefDraft(sessionStorage.getItem(draftKey));if(draft)applyDraft(draft);else if(event.persisted)form.reset();if(event.persisted){contextPanel.hidden=true;pendingContext=null;showStep(0,false);}}catch{/* Retain the current page when storage is blocked. */}},0);
});
section.querySelector('[data-pb-clear-draft]').addEventListener('click',()=>{form.reset();contextPanel.hidden=true;pendingContext=null;try{sessionStorage.removeItem(draftKey);}catch{}showStep(0);});
section.querySelector('[data-pb-add-context]').addEventListener('click',()=>{const merged=mergeBriefContext(data(),pendingContext||{});if(merged){applyDraft(merged);contextPanel.hidden=true;pendingContext=null;saveDraft();showStep(0);}else{contextPanel.querySelector('[data-pb-context-note]').textContent='Your existing brief is kept. Shorten it below before adding this solution.';}});
function focusInView(element){
  element.focus({preventScroll:true});
  const bounds=element.getBoundingClientRect();
  const clearance=parseFloat(getComputedStyle(root).getPropertyValue('--cs-nav-clearance'))||100;
  if(bounds.top<clearance+16||bounds.bottom>innerHeight-16)element.scrollIntoView({block:'center',behavior:'instant'});
}
function showStep(next,focus=true){
  step=next;form.hidden=false;review.hidden=true;
  fields.forEach((field,i)=>field.hidden=i!==step);
  progress.forEach((button,i)=>{if(i===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');button.classList.toggle('is-complete',i<step);});
  form.querySelector('[data-pb-back]').hidden=step===0;
  form.querySelector('[data-pb-submit-label]').textContent=step===2?'Review brief':'Continue';
  form.querySelector('[data-pb-next-note]').textContent=['Next: budget, timeline and contact details','Next: a way to stay in touch','Next: review your brief'][step];
  form.querySelector('[data-pb-errors]').textContent='';
  if(focus)focusInView(section.querySelector('#pb-title'));
  root.dispatchEvent(new CustomEvent('cs:layout-change'));
}
function validate(index){
  const errors=validateBriefStep(index,data());
  fields[index].querySelectorAll('.pb-field-error').forEach(el=>el.textContent='');
  fields[index].querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  for(const [name,message] of Object.entries(errors)){
    section.querySelector(`#pb-error-${name}`).textContent=message;
    form.querySelectorAll(`[name="${name}"]`).forEach(el=>el.setAttribute('aria-invalid','true'));
  }
  if(Object.keys(errors).length){showStep(index,false);form.querySelector('[data-pb-errors]').textContent='Please check the highlighted fields.';focusInView(form.querySelector(`[name="${Object.keys(errors)[0]}"]`));return false;}
  return true;
}
function go(next){if(next>step){for(let i=0;i<next;i++)if(!validate(i))return;}showStep(next);}
function showReview(){
  for(let i=0;i<3;i++)if(!validate(i))return;
  const d=data(), labels=[['Service',services[d.service]],['Industry',sectors[d.industry]],['Your goal',d.goal],['Existing setup',d.existing||'Not provided'],['Budget',budgets[d.budget]],['Timeline',timelines[d.timeline]],['Name',d.name],['Email',d.email]];
  const dl=review.querySelector('[data-pb-review]');dl.replaceChildren();
  labels.forEach(([label,value])=>{const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;group.append(dt,dd);dl.append(group);});
  review.querySelector('[data-pb-email]').href=briefEmailUrl(d);form.hidden=true;review.hidden=false;focusInView(review.querySelector('h4'));
  root.dispatchEvent(new CustomEvent('cs:layout-change'));
}
form.addEventListener('submit',event=>{event.preventDefault();if(step<2){if(validate(step))showStep(step+1);}else showReview();});
progress.forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.pbStep))));
form.querySelector('[data-pb-back]').addEventListener('click',()=>showStep(Math.max(0,step-1)));
review.querySelector('[data-pb-edit]').addEventListener('click',()=>showStep(0));
review.querySelector('[data-pb-download]').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([formatBrief(data())],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='canveliqsoft-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function prefill(d={}){
  if(!form.elements.goal.value.trim()){
    if(Object.hasOwn(services,d.service))form.elements.service.value=d.service;
    if(Object.hasOwn(sectors,d.industry))form.elements.industry.value=d.industry;
    if(typeof d.goal==='string')form.elements.goal.value=d.goal.slice(0,1500);
    saveDraft();
  }else if(typeof d.goal==='string'&&!form.elements.goal.value.includes(d.goal)){
    pendingContext=d;contextPanel.hidden=false;
    contextPanel.querySelector('[data-pb-context-note]').textContent='Your previous brief is kept. Add this solution when you’re ready; your existing notes will stay.';
  }
  showStep(0);
}
root.addEventListener('cs:brief-prefill',event=>prefill(event.detail||{}));
showStep(0,false);
const collectionId=new URLSearchParams(location.search).get('collection');
if(collectionId){
  const {productInquiry}=await import(new URL('./product-page-data.mjs'+new URL(import.meta.url).search,import.meta.url));
  const inquiry=productInquiry(collectionId,Object.fromEntries(new URLSearchParams(location.search)));
  if(inquiry)prefill(inquiry);
}
