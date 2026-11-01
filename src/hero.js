const version=new URL(import.meta.url).search;
const {modules,previewFor,motionPolicy}=await import(new URL('./hero-data.mjs'+version,import.meta.url));
const hero=document.querySelector('#cs-top');
if(hero){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width:900px)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 let policy=motionPolicy({reduced:reduced.matches,compact:compact.matches,saveData:navigator.connection?.saveData}),industry='manufacturing',module='software',pointerFrame=0;
 function setText(selector,value){const node=hero.querySelector(selector);if(node)node.textContent=value;}
 function selectIndustry(id,commit=false){
  const data=previewFor(id);industry=Object.hasOwn({retail:1,manufacturing:1,healthcare:1,education:1,hospitality:1},id)?id:'manufacturing';
  hero.dataset.industry=industry;hero.style.setProperty('--hero-accent',data.accent);
  setText('[data-headline-lead]',data.headline[0]);setText('[data-headline-accent]',data.headline[1]);
  setText('[data-industry-description]',data.description);setText('[data-primary-label]',data.primary);
  setText('[data-snapshot-title]',data.snapshotTitle);setText('[data-snapshot-copy]',data.snapshotCopy);
  setText('[data-board-context]',data.boardContext);setText('[data-board-title]',data.boardTitle);setText('[data-flow-title]',data.flowTitle);
  data.metrics.forEach(([label,value,fill],i)=>{setText(`[data-metric-label="${i}"]`,label);setText(`[data-metric-value="${i}"]`,value);const node=hero.querySelector(`[data-metric-value="${i}"]`);node?.nextElementSibling?.style.setProperty('--fill',`${fill}%`);});
  data.flow.forEach(([label,count],i)=>{setText(`[data-flow-step="${i}"]`,label);setText(`[data-flow-count="${i}"]`,count);});
  data.resources.forEach((label,i)=>{setText(`[data-resource="${i}"]`,label);setText(`[data-resource-value="${i}"]`,`${data.resourcesPct[i]??data.resourcesPct?.[i]??0}%`);});
  data.quality.names.forEach((name,i)=>{setText(`[data-quality-name="${i}"]`,name);setText(`[data-quality-value="${i}"]`,data.quality.values[i]);});
  setText('[data-quality-total]',data.quality.total);setText('[data-quality-label]',data.quality.label);
  setText('[data-resource-title]',data.resourcesTitle||'Resource availability');setText('[data-resource-caption]',`${data.resources.length} tracked`);
  setText('[data-quality-title]',data.qualityTitle||'Workflow status');setText('[data-footer-status]',data.footerStatus||'Workflow status at a glance');
  setText('[data-side-title]',data.side[0]);setText('[data-side-copy]',data.side[1]);setText('[data-quality-side-title]',data.side[2]);setText('[data-quality-side-copy]',data.side[3]);
  hero.querySelectorAll('[data-resource-value]').forEach((node,i)=>{const fill=data.resourcesPct[i]||0;node.previousElementSibling?.querySelector('em')?.style.setProperty('--fill',`${fill}%`);});
  hero.querySelectorAll('[data-hero-industry]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.heroIndustry===industry)));
  hero.querySelectorAll('.cs-flow-step').forEach((step,i)=>{step.classList.toggle('is-teal',i===data.flow.length-2);step.classList.toggle('is-done',i===data.flow.length-1);});
  if(commit)document.querySelector('#cs-motion')?.dispatchEvent(new CustomEvent('cs:industry-change',{detail:industry}));
 }
 function selectModule(id){const item=modules.find(entry=>entry.id===id);if(!item)return;module=id;hero.dataset.module=id;setText('[data-module-name]',item.name.toUpperCase());setText('[data-module-detail]',item.detail);hero.querySelectorAll('[data-hero-module]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.heroModule===id)));}
 hero.querySelectorAll('[data-hero-industry]').forEach(button=>{button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')selectIndustry(button.dataset.heroIndustry);});button.addEventListener('focus',()=>selectIndustry(button.dataset.heroIndustry));button.addEventListener('click',()=>selectIndustry(button.dataset.heroIndustry,true));});
 hero.querySelectorAll('[data-hero-module]').forEach(button=>{button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')selectModule(button.dataset.heroModule);});button.addEventListener('focus',()=>selectModule(button.dataset.heroModule));button.addEventListener('click',()=>selectModule(button.dataset.heroModule));});
 const primary=hero.querySelector('.cs-hero-primary');
 function resetMagnet(){primary?.style.setProperty('--mag-x','0px');primary?.style.setProperty('--mag-y','0px');}
 primary?.addEventListener('pointermove',event=>{if(!fine.matches||!policy.ambient)return;const rect=primary.getBoundingClientRect();primary.style.setProperty('--mag-x',`${(event.clientX-rect.left-rect.width/2)*.045}px`);primary.style.setProperty('--mag-y',`${(event.clientY-rect.top-rect.height/2)*.08}px`);});
 primary?.addEventListener('pointerleave',resetMagnet);primary?.addEventListener('blur',resetMagnet);
 hero.addEventListener('pointermove',event=>{if(!fine.matches||!policy.ambient||event.pointerType!=='mouse')return;const rect=hero.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;hero.style.setProperty('--spot-x',`${x*100}%`);hero.style.setProperty('--spot-y',`${y*100}%`);hero.style.setProperty('--pointer-x',`${(x-.5)*10}px`);hero.style.setProperty('--pointer-y',`${(y-.5)*8}px`);});});
 hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--pointer-x','0px');hero.style.setProperty('--pointer-y','0px');});
 const syncMotion=()=>{policy=motionPolicy({reduced:reduced.matches,compact:compact.matches,saveData:navigator.connection?.saveData});hero.classList.toggle('is-still',!policy.ambient);hero.classList.toggle('has-intro',policy.intro);};
 reduced.addEventListener('change',syncMotion);compact.addEventListener('change',syncMotion);navigator.connection?.addEventListener?.('change',syncMotion);
 selectIndustry('manufacturing');selectModule('software');syncMotion();
 if(document.documentElement.classList.contains('cs-loading'))await new Promise(resolve=>{let timer;const observer=new MutationObserver(()=>{if(!document.documentElement.classList.contains('cs-loading'))finish();});const finish=()=>{clearTimeout(timer);observer.disconnect();resolve();};observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});timer=setTimeout(finish,2000);});
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));hero.classList.add('is-ready');if(policy.intro)document.querySelector('.cs-site-header')?.classList.add('cs-nav-arrive');
}
