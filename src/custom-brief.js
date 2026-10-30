const version=new URL(import.meta.url).search;
const {services,industries,steps,emptyBrief,fieldsForStep,validateStep,validateBrief,submissionBrief,readDraft,summaryGroups,formatCustomBrief,safeAttachmentName}=await import(new URL('./custom-brief-data.mjs'+version,import.meta.url));
const $=selector=>document.querySelector(selector),form=$('#cb-form'),service=$('#cb-service'),industry=$('#cb-industry');
const tabKey='canveliqsoft-custom-brief-tab-v1',deviceKey='canveliqsoft-custom-brief-device-v1';
const params=new URLSearchParams(location.search);
let draft=emptyBrief({industry:params.get('industry'),service:params.get('service')}),step=0,files=[],remember=false,pendingResume=null,submissionId='',requestHash='',submitting=false,readingFiles=false,receipt=null,attemptDraft=null,attemptFiles=[],missingFileCount=0,receiptDraft=null,receiptFiles=[];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons=()=>window.lucide?.createIcons();
const titles=['Tell us what matters.','Let’s shape the right solution.','A closer look at your world.','Focus on the first chapter.','A plan that fits your ambition.','A way to stay connected.','Your vision, clearly captured.'];
const descriptions=['A few details about your business and the problem you want to solve.','Only questions relevant to the service you’ve selected. Plain-language answers are perfect.','Help us understand the people, processes and details specific to your industry.','Start with the essentials. We can explore the rest together.','These preferences help us research realistic options. They are not a commitment.','Tell us how to reach you. References are helpful, but entirely optional.','Check your answers before sending. You can edit any section without losing your work.'];
function restore(raw) {try{const saved=JSON.parse(raw);const value=readDraft(JSON.stringify(saved.draft));return value?{...saved,draft:value}:null;}catch{return null;}}
function stored(which,key){try{return which.getItem(key);}catch{return null;}}
try {
 const saved=restore(stored(sessionStorage,tabKey))||restore(stored(localStorage,deviceKey));
 if(saved){pendingResume=saved;$('[data-resume]').hidden=false;$('[data-shell]').inert=true;}
}catch{/* Form works with browser storage blocked. */}
function persist(){
 if(pendingResume||receipt)return;
 const value=JSON.stringify({draft,step,submissionId,requestHash,remember,attachmentCount:files.length||missingFileCount,attemptDraft,attemptFiles});
 try{sessionStorage.setItem(tabKey,value);if(remember)localStorage.setItem(deviceKey,value);}catch{$('[data-draft-note]').textContent='Browser storage is unavailable. Keep this page open or download your brief at review.';}
}
function removeStored(){try{sessionStorage.removeItem(tabKey);localStorage.removeItem(deviceKey);}catch{}}
function defaults(){for(let n=0;n<6;n++)for(const f of fieldsForStep(n,draft))if(f.options&&!draft.answers[f.id])draft.answers[f.id]=f.options[0][0];}
service.insertAdjacentHTML('beforeend',Object.entries(services).map(([id,s])=>`<option value="${id}">${esc(s.name)}</option>`).join(''));
industry.insertAdjacentHTML('beforeend',Object.entries(industries).map(([id,s])=>`<option value="${id}">${esc(s.name)}</option>`).join(''));
$('[data-steps]').innerHTML=steps.map((name,n)=>`<button type="button" data-step="${n}"${n===0?' aria-current="step"':''}><span>${String(n+1).padStart(2,'0')}</span><span>${name.replace(' & ',' &amp; ')}</span></button>`).join('');
function fieldMarkup(f){
 const id='cb-field-'+f.id,help=id+'-help',error=id+'-error',value=draft.answers[f.id]||'';
 const attrs=`id="${id}" name="${f.id}" aria-describedby="${help} ${error}" ${f.required?'required':''} ${f.autocomplete?`autocomplete="${f.autocomplete}"`:''} maxlength="${f.max}"`;
 const input=f.type==='textarea'?`<textarea ${attrs} rows="3">${esc(value)}</textarea>`:f.type==='select'?`<select ${attrs}>${f.options.map(([key,label])=>`<option value="${key}" ${key===value?'selected':''}>${esc(label)}</option>`).join('')}</select>`:`<input type="${f.type}" ${attrs} value="${esc(value)}">`;
 return `<div class="cb-field ${f.type==='textarea'||f.id==='business'||f.id==='budget'?'is-wide':''}"><label for="${id}">${esc(f.label)}${f.required?' <b aria-hidden="true">*</b>':''}</label><p class="cb-help" id="${help}">${esc(f.help)}</p>${input}<div class="cb-field-tools">${f.uncertain?`<button type="button" class="cb-uncertain" data-uncertain="${f.id}">Not sure — need advice</button>`:''}${f.type==='textarea'?`<span data-count="${f.id}">${value.length} / ${f.max}</span>`:''}</div><p class="cb-field-error" id="${error}"></p></div>`;
}
function focusTitle(){const title=$('#cb-step-title');title.focus({preventScroll:true});const top=title.getBoundingClientRect().top;if(top<110||top>innerHeight-130)title.scrollIntoView({block:'start',behavior:'instant'});}
function busyControls(on){document.querySelectorAll('[data-shell] button,[data-shell] input,[data-shell] select,[data-shell] textarea').forEach(el=>el.disabled=on);}
function setErrors(errors){
 const summary=$('#cb-error-summary');summary.hidden=!Object.keys(errors).length;summary.textContent='Please check the highlighted answers before continuing.';
 for(const [id,message] of Object.entries(errors)){
  const control=id==='service'?service:id==='industry'?industry:id==='consent'?$('#cb-consent'):document.getElementById('cb-field-'+id);
  if(control){control.setAttribute('aria-invalid','true');const label=document.getElementById('cb-field-'+id+'-error');if(label)label.textContent=message;else summary.textContent=message;}
 }
 const first=Object.keys(errors)[0];const target=first==='service'?service:first==='industry'?industry:first==='consent'?$('#cb-consent'):document.getElementById('cb-field-'+first);
 if(target){target.focus({preventScroll:true});const rect=target.getBoundingClientRect();if(rect.top<110||rect.bottom>innerHeight-24)target.scrollIntoView({block:'center',behavior:'instant'});}
}
function renderReview(){
 $('[data-review]').innerHTML=`<div class="cb-route">${esc(services[draft.service]?.name)} · ${esc(industries[draft.industry]?.name)}</div>`+summaryGroups(draft).map(g=>`<section class="cb-review-group"><header><h3>${esc(g.title)}</h3><button type="button" class="cb-text-button" data-edit="${g.step}" aria-label="Edit ${esc(g.title)}">Edit ↗</button></header><dl>${g.fields.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></section>`).join('')+`<div class="cb-review-group"><header><h3>Reference files</h3><button type="button" class="cb-text-button" data-edit="5">Edit ↗</button></header><p class="cb-small">${files.length?files.map(f=>esc(f.name)).join(' · '):'No attachments'}</p></div><button type="button" class="cb-text-button" data-download>Download a draft copy ↗</button>`;
}
function render({focus=false}={}) {
 defaults();service.value=draft.service;industry.value=draft.industry;
 service.removeAttribute('aria-invalid');industry.removeAttribute('aria-invalid');$('#cb-consent').removeAttribute('aria-invalid');
 $('[data-progress-label]').textContent=`Step ${step+1} of 7`;$('[data-progress-percent]').textContent=`${Math.round((step+1)/7*100)}%`;
 $('[data-progress-bar]').style.width=`${(step+1)/7*100}%`;$('.cb-progress-track').setAttribute('aria-valuenow',step+1);
 document.querySelectorAll('[data-step]').forEach((button,n)=>{button.classList.toggle('is-complete',n<step);if(n===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 $('[data-step-kicker]').textContent=`${String(step+1).padStart(2,'0')} / ${steps[step].toUpperCase()}`;$('#cb-step-title').textContent=titles[step];$('[data-step-description]').textContent=descriptions[step];
 const route=$('[data-route]');route.hidden=![1,2].includes(step);route.textContent=step===1?services[draft.service]?.branch||'Choose a service to see its questions.':industries[draft.industry]?.workflow||'Choose an industry to see its workflow.';
 $('[data-fields]').innerHTML=fieldsForStep(step,draft).map(fieldMarkup).join('');
 $('[data-attachments]').hidden=step!==5;$('[data-review]').hidden=step!==6;$('[data-consent-wrap]').hidden=step!==6;
 if(step===6)renderReview();$('#cb-consent').checked=draft.consent;
 $('[data-back]').hidden=step===0;$('[data-next]').innerHTML=step===6?'Send project brief <span aria-hidden="true">↗</span>':'Continue <span aria-hidden="true">↗</span>';
 $('[data-next-note]').textContent=step<6?`Next: ${steps[step+1].toLowerCase()}`:'Ready when you are.';
 $('[data-form-note]').textContent=step===6?'We’ll confirm receipt here after your brief has been saved.':'Required questions are marked *. You can review everything before sending.';
 $('#cb-error-summary').hidden=true;$('[data-retry-tools]').hidden=true;icons();if(focus)focusTitle();
}
function go(next){
 if(submitting||readingFiles)return;
 if(next>step){for(let n=0;n<next;n++){const errors=validateStep(n,draft);if(Object.keys(errors).length){step=n;render();setErrors(errors);return;}}}
 step=next;render({focus:true});persist();
}
function selectContext(){
 if(submitting||readingFiles)return;
 draft.service=service.value;draft.industry=industry.value;draft.consent=false;step=Math.min(step,1);render();persist();
}
service.addEventListener('change',selectContext);industry.addEventListener('change',selectContext);
form.addEventListener('input',event=>{
 if(event.target=== $('#cb-consent'))draft.consent=event.target.checked;
 else if(event.target.name){draft.answers[event.target.name]=event.target.value;draft.consent=false;const count=[...document.querySelectorAll('[data-count]')].find(e=>e.dataset.count===event.target.name);if(count)count.textContent=`${event.target.value.length} / ${event.target.maxLength}`;event.target.removeAttribute('aria-invalid');const error=document.getElementById(event.target.id+'-error');if(error)error.textContent='';}
 persist();
});
form.addEventListener('change',event=>{if(event.target.name){draft.answers[event.target.name]=event.target.value;persist();}});
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-step'))go(Number(button.dataset.step));
 if(button.hasAttribute('data-edit'))go(Number(button.dataset.edit));
 if(button.hasAttribute('data-uncertain')){const id=button.dataset.uncertain;draft.answers[id]='Not sure — need advice.';const input=document.getElementById('cb-field-'+id);input.value=draft.answers[id];input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}
 if(button.hasAttribute('data-download'))download();
 if(button.hasAttribute('data-remove-file')){files.splice(Number(button.dataset.removeFile),1);renderFiles();persist();}
});
$('[data-back]').addEventListener('click',()=>go(Math.max(0,step-1)));
function download(){const text=(receipt?`RECEIVED · ${receipt.reference}\n${receipt.receivedAt}\n\n`:'DRAFT · Not submitted\n\n')+formatCustomBrief(receiptDraft||draft)+'\n\nAttachments: '+((receipt?receiptFiles:files).map(f=>f.name).join(', ')||'None');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=receipt?`${receipt.reference}.txt`:'CanveliqSoft-project-brief-draft.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function renderFiles(){$('[data-file-list]').innerHTML=files.map((f,n)=>`<li><span>${esc(f.name)} · ${Math.ceil(f.size/1024)} KB</span><button type="button" data-remove-file="${n}" aria-label="Remove ${esc(f.name)}">Remove</button></li>`).join('');}
$('#cb-files').addEventListener('change',async event=>{
 const incoming=[...event.target.files];event.target.value='';const error=$('[data-file-error]');error.textContent='';
 if(incoming.length+files.length>3||incoming.reduce((n,f)=>n+f.size,0)+files.reduce((n,f)=>n+f.size,0)>5*1024*1024){error.textContent='Choose up to 3 files, no more than 5 MB in total.';return;}
 readingFiles=true;busyControls(true);
 try{const added=[];for(const file of incoming){const types={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',txt:'text/plain'};const ext=file.name.split('.').pop().toLowerCase();if(!Object.hasOwn(types,ext)||!file.size)throw new Error('Choose a non-empty PDF, PNG, JPEG or TXT file.');const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Unable to read this file.'));reader.readAsDataURL(file);});added.push({name:file.name,type:types[ext],size:file.size,data});}files.push(...added);draft.consent=false;renderFiles();persist();}catch(e){error.textContent=e.message;}finally{readingFiles=false;busyControls(false);}
});
function pendingDone(){pendingResume=null;$('[data-resume]').hidden=true;$('[data-shell]').inert=false;render();persist();}
$('[data-resume-yes]').addEventListener('click',()=>{const saved=pendingResume;draft=saved.draft;step=Number.isInteger(saved.step)?Math.max(0,Math.min(saved.step,6)):0;remember=saved.remember===true;submissionId=saved.submissionId||'';requestHash=saved.requestHash||'';attemptDraft=saved.attemptDraft?submissionBrief(readDraft(JSON.stringify(saved.attemptDraft))||draft):null;if(attemptDraft)attemptDraft.consent=true;attemptFiles=Array.isArray(saved.attemptFiles)?saved.attemptFiles:[];missingFileCount=Number(saved.attachmentCount)||0;pendingDone();if(missingFileCount)$('[data-draft-note]').textContent='Your answers are restored. Please reattach files before a new submission. Retrying an unconfirmed brief first checks its existing receipt.';});
$('[data-resume-no]').addEventListener('click',()=>{removeStored();pendingDone();});
$('[data-save]').addEventListener('click',()=>{remember=true;persist();try{if(localStorage.getItem(deviceKey))$('[data-draft-note]').textContent='Saved on this device. Reopen this page to resume. Reference files must be attached again after leaving.';}catch{}});
const clearDialog=$('[data-clear-dialog]');$('[data-clear]').addEventListener('click',()=>{if(!submitting&&!readingFiles)clearDialog.showModal();});$('[data-clear-cancel]').addEventListener('click',()=>clearDialog.close());$('[data-clear-confirm]').addEventListener('click',()=>{if(submitting||readingFiles)return;removeStored();draft=emptyBrief({industry:params.get('industry'),service:params.get('service')});step=0;files=[];remember=false;submissionId='';requestHash='';attemptDraft=null;attemptFiles=[];missingFileCount=0;renderFiles();clearDialog.close();render({focus:true});$('[data-draft-note]').textContent='Draft cleared. New answers stay in this tab.';});
$('[data-new-submission]').addEventListener('click',()=>{if(submitting)return;submissionId='';requestHash='';attemptDraft=null;attemptFiles=[];missingFileCount=0;persist();$('[data-new-submission]').hidden=true;$('#cb-error-summary').textContent='A new submission reference is ready. Select Send project brief to submit your updated answers.';});
async function request(payload){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);try{const response=await fetch('./api/project-briefs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json().catch(()=>({error:'Submission is unavailable here. Keep your answers and download a copy, or try again later.'}));return {response,result};}finally{clearTimeout(timeout);}}
function showReceipt(result,snapshot,attachmentInfo){
 if(!/^CS-\d{8}-[A-F0-9]{8}$/.test(result.reference||'')||!result.receivedAt)throw new Error('We could not verify receipt. Your answers are kept; please retry.');
 receipt=result;receiptDraft=structuredClone(snapshot);receiptFiles=structuredClone(attachmentInfo);removeStored();$('[data-shell]').hidden=true;$('[data-success]').hidden=false;$('[data-reference]').textContent=result.reference;
 $('[data-receipt-detail]').textContent=`Keep this reference for follow-up. Your preferred contact is ${snapshot.answers.channel==='whatsapp'?'WhatsApp':'email'}.`;
 $('#cb-success-title').focus({preventScroll:true});$('[data-success]').scrollIntoView({block:'start',behavior:'instant'});
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(submitting||readingFiles)return;if(step<6){go(step+1);return;}
 const errors=validateBrief(draft);if(Object.keys(errors).length){for(let n=0;n<7;n++)if(Object.keys(validateStep(n,draft)).length){step=n;render();setErrors(validateStep(n,draft));return;}}
 submitting=true;const send=$('[data-next]');busyControls(true);send.textContent='Saving your brief…';form.setAttribute('aria-busy','true');$('#cb-error-summary').hidden=true;
 try {
  const payload={brief:submissionBrief(draft),attachments:files.map(({name,type,size,data})=>({name:safeAttachmentName(name),type,size,data}))};
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))).map(b=>b.toString(16).padStart(2,'0')).join('');
  if(submissionId&&requestHash){
   const lookup=await request({lookup:true,submissionId,fingerprint:requestHash});
   if(lookup.response.ok){
    if(attemptDraft&&JSON.stringify(payload.brief)!==JSON.stringify(attemptDraft)||(files.length>0&&hash!==requestHash)){$('[data-new-submission]').hidden=false;throw new Error(`Your earlier brief ${lookup.result.reference} was received. Your later edits are not submitted. Choose “Send changes as a new brief” to send them separately.`);}
    showReceipt(lookup.result,attemptDraft||payload.brief,attemptFiles);return;
   }
   if(lookup.response.status!==404)throw new Error('We could not check the earlier submission yet. Please retry; your answers are kept.');
  }
  if(missingFileCount&&!files.length){$('[data-new-submission]').hidden=false;throw new Error('Please reattach your reference files in Contact & references, or choose “Send changes as a new brief” to continue without them.');}
  if(!submissionId)submissionId=crypto.randomUUID();requestHash=hash;attemptDraft=structuredClone(payload.brief);attemptFiles=files.map(({name,type,size})=>({name,type,size}));persist();
  const {response,result}=await request({...payload,submissionId});
  if(!response.ok){if(response.status===409)$('[data-new-submission]').hidden=false;if(result.fields){const first=Object.keys(result.fields)[0];const target=steps.findIndex((_,n)=>fieldsForStep(n,draft).some(f=>f.id===first));if(target>=0){step=target;render();setErrors(result.fields);}}throw new Error(result.error||'Your brief could not be saved. Please try again.');}
  showReceipt(result,attemptDraft,attemptFiles);
 }catch(error){const summary=$('#cb-error-summary');summary.hidden=false;summary.textContent=error.name==='AbortError'?'We could not confirm receipt yet. Your answers are kept. Retry safely to check or complete this submission.':error.message;$('[data-retry-tools]').hidden=false;summary.scrollIntoView({block:'center',behavior:'instant'});}
 finally{submitting=false;busyControls(false);send.innerHTML=step===6?'Send project brief <span aria-hidden="true">↗</span>':'Continue <span aria-hidden="true">↗</span>';form.removeAttribute('aria-busy');}
});
const header=$('.cs-site-header'),menu=header.querySelector('.cs-mobile-links'),toggle=header.querySelector('.cs-menu');
function setMenu(open){menu.hidden=!open;header.dataset.menuOpen=String(open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
toggle.addEventListener('click',()=>setMenu(menu.hidden));document.addEventListener('click',e=>{if(!header.contains(e.target))setMenu(false);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setMenu(false);toggle.focus();}});
window.addEventListener('resize',()=>{if(innerWidth>900)setMenu(false);});window.addEventListener('scroll',()=>header.classList.toggle('is-scrolled',scrollY>24),{passive:true});
render();
