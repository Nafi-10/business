const { projectStories } = await import(new URL('./portfolio-stories.mjs' + new URL(import.meta.url).search, import.meta.url));
// The build gives the controller and project data the same fingerprint.
const { projects } = await import(new URL('./portfolio-projects.mjs' + new URL(import.meta.url).search, import.meta.url));
const atelier = document.querySelector('#cs-work');
const scene = atelier.querySelector('[data-work-drag]');
const mainImage = atelier.querySelector('.cs-atelier-main-image');
const tabs = [...atelier.querySelectorAll('[data-work-chapter]')];
const projectTabs = [...atelier.querySelectorAll('[data-work-project]')];
const selector = atelier.querySelector('.cs-project-selector');
const story = atelier.querySelector('#cs-work-story');
const storyToggle = atelier.querySelector('[data-work-story-toggle]');
const dialog = document.querySelector('#cs-project-viewer');
const iframe = dialog.querySelector('iframe');
const loading = dialog.querySelector('.cs-project-loading');
const viewerBody = dialog.querySelector('.cs-project-viewer-body');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const rememberedChapters = projects.map(() => 0);
const categories = ['COMMERCE', 'FASHION', 'PORTFOLIO', 'INTERACTIVE 3D'];
let projectIndex = 0;
let index = 0;
let previewDevice = 'desktop';
let projectAnimation;
let imageRevision = 0;
let drag = null;
let suppressClick = false;
let opener = null;
let loadTimer = 0;
let frameCleanup = null;
const currentProject = () => projects[projectIndex];
const makeSpans = values => values.map(text => {
  const span = document.createElement('span'); span.textContent = text; return span;
});

function renderPreview() {
  const project = currentProject();
  const chapter = project.chapters[index];
  const mobile = previewDevice === 'mobile';
  const revision = ++imageRevision;
  atelier.dataset.previewDevice = previewDevice;
  atelier.querySelectorAll('[data-work-preview-device]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.workPreviewDevice === previewDevice));
  });
  atelier.querySelector('[data-work-address]').textContent = `${project.name} / ${mobile ? 'MOBILE' : chapter.short}`.toUpperCase();
  const preload = new Image();
  let swapped = false;
  const swap = () => {
    if (revision !== imageRevision || swapped) return;
    swapped = true;
    mainImage.src = preload.src;
    mainImage.alt = mobile ? `${project.name} on a mobile screen` : chapter.alt;
    mainImage.getAnimations().forEach(animation => animation.cancel());
    if (!reduced.matches) mainImage.animate([{opacity:.25},{opacity:1}], {duration:380,easing:'ease-out'});
  };
  preload.onload = swap;
  preload.onerror = () => {
    if (revision !== imageRevision) return;
    mainImage.src = project.cover;
    mainImage.alt = `${project.name} project overview`;
  };
  preload.src = mobile ? project.mobile : chapter.image;
  if (preload.complete && preload.naturalWidth) swap();
  atelier.querySelector('.cs-atelier-ghost-one img').src = project.chapters[(index + 1) % project.chapters.length].image;
  atelier.querySelector('.cs-atelier-ghost-two img').src = project.chapters[(index + 2) % project.chapters.length].image;
}

function changeChapter(next, announce = true) {
  const project = currentProject();
  const chapters = project.chapters;
  index = (next + chapters.length) % chapters.length;
  rememberedChapters[projectIndex] = index;
  const chapter = chapters[index];
  atelier.dataset.chapter = index;
  tabs.forEach((tab,i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    tab.querySelector('b').textContent = chapters[i].name;
    tab.querySelector('small').textContent = chapters[i].subtitle;
  });
  atelier.querySelector('#cs-work-details').setAttribute('aria-labelledby', `cs-work-tab-${index}`);
  atelier.querySelector('[data-work-detail-kicker]').textContent = `${String(index+1).padStart(2,'0')} / ${chapter.kicker}`;
  atelier.querySelector('[data-work-detail-title]').innerHTML = chapter.title;
  atelier.querySelector('[data-work-detail-copy]').textContent = chapter.copy;
  atelier.querySelector('[data-work-visit-label]').textContent = chapter.visit;
  atelier.querySelector('[data-work-features]').replaceChildren(...makeSpans(chapter.features));
  renderPreview();
  if (announce) atelier.querySelector('.cs-work-status').textContent = `${project.name}. ${chapter.name}. ${previewDevice} preview.`;
}

function revealSelectedTicket() {
  if (selector.scrollWidth <= selector.clientWidth) return;
  const rail = selector.getBoundingClientRect();
  const ticket = projectTabs[projectIndex].getBoundingClientRect();
  selector.scrollTo({left:selector.scrollLeft + ticket.left - rail.left - (rail.width-ticket.width)/2, behavior:reduced.matches?'instant':'smooth'});
}

function renderCaseStory(project) {
  const entries=projectStories[project.id];
  const holder=atelier.querySelector('[data-case-story]');
  holder.innerHTML=entries.map((entry,i)=>`<details data-work-case="${i}" ${i===1?'open':''}><summary><span>${String(i+1).padStart(2,'0')}</span>${entry.title}<b aria-hidden="true"></b></summary><p>${entry.copy}</p></details>`).join('');
}
atelier.addEventListener('toggle',event=>{
  const detail=event.target;
  if(!detail.matches('[data-work-case]')||!detail.open||!detail.isConnected)return;
  atelier.querySelectorAll('[data-work-case]').forEach(other=>{if(other!==detail)other.open=false;});
},true);
function selectProject(next, animate = true) {
  const direction = next >= projectIndex ? 1 : -1;
  projectIndex = (next + projects.length) % projects.length;
  const project = currentProject();
  atelier.dataset.project = project.id;
  renderCaseStory(project);
  projectTabs.forEach((tab,i) => {
    tab.setAttribute('aria-selected', String(i === projectIndex));
    tab.tabIndex = i === projectIndex ? 0 : -1;
  });
  atelier.querySelectorAll('[data-work-dot]').forEach((dot,i) => dot.setAttribute('aria-pressed', String(i === projectIndex)));
  atelier.querySelector('#cs-project-panel').setAttribute('aria-labelledby', `cs-project-tab-${projectIndex}`);
  atelier.querySelector('[data-project-count]').textContent = `${String(projectIndex+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
  atelier.querySelector('[data-work-category]').textContent = `${String(projectIndex+1).padStart(2,'0')} / ${categories[projectIndex]}`;
  atelier.querySelector('.cs-atelier-intro h3').textContent = project.shortName;
  atelier.querySelector('.cs-atelier-intro p').textContent = projectIndex === 0 ? 'A digital fragrance experience. Considered in every detail.' : project.intro;
  atelier.querySelector('.cs-atelier-disciplines').replaceChildren(...makeSpans(project.disciplines));
  atelier.querySelector('.cs-atelier-exhibit').setAttribute('aria-label', `Explore ${project.name}. Drag horizontally or use the project controls.`);
  atelier.querySelector('.cs-atelier-chapter-rail').setAttribute('aria-label', `${project.name} chapters`);
  changeChapter(rememberedChapters[projectIndex], animate);
  scene.style.setProperty('--drag-x','0px');
  projectAnimation?.cancel();
  if (animate && !reduced.matches) {
    projectAnimation = scene.animate([
      {opacity:.35,transform:`translateX(${direction*24}px) scale(.98)`},
      {opacity:1,transform:'translateX(0) scale(1)'}
    ], {duration:480,easing:'cubic-bezier(.18,.75,.25,1)'});
  }
  if (animate) revealSelectedTicket();
}

function chooseChapter(next) {
  // Chapter images are desktop captures; the mobile toggle shows the actual mobile home.
  previewDevice = 'desktop';
  changeChapter(next);
}

let resizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(revealSelectedTicket);
});

atelier.addEventListener('click', event => {
  if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick=false; return; }
  const caseSummary = event.target.closest('[data-work-case] summary');
  if (caseSummary && !caseSummary.parentElement.open) {
    chooseChapter(projectStories[currentProject().id][Number(caseSummary.parentElement.dataset.workCase)].scene);
  }
  const projectTab = event.target.closest('[data-work-project]');
  const dot = event.target.closest('[data-work-dot]');
  const step = event.target.closest('[data-work-step]');
  const chapter = event.target.closest('[data-work-chapter]');
  const device = event.target.closest('[data-work-preview-device]');
  if (projectTab && Number(projectTab.dataset.workProject) !== projectIndex) selectProject(Number(projectTab.dataset.workProject));
  if (dot && Number(dot.dataset.workDot) !== projectIndex) selectProject(Number(dot.dataset.workDot));
  if (step) selectProject(projectIndex + Number(step.dataset.workStep));
  if (chapter) chooseChapter(Number(chapter.dataset.workChapter));
  if (device) {
    previewDevice = device.dataset.workPreviewDevice;
    renderPreview();
    atelier.querySelector('.cs-work-status').textContent = `${currentProject().name}. ${previewDevice} preview.`;
  }
  if (event.target.closest('[data-work-story-toggle]')) {
    story.hidden = !story.hidden;
    storyToggle.setAttribute('aria-expanded', String(!story.hidden));
    storyToggle.querySelector('span').textContent = story.hidden ? 'Explore all scenes' : 'Close scenes';
    if (!story.hidden) story.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
  }
  const open = event.target.closest('[data-work-open]');
  if (open) {
    const detail = open.classList.contains('cs-atelier-live-link');
    openExperience(detail || previewDevice === 'desktop' ? index : 0, detail ? 'desktop' : previewDevice, open);
  }
});

tabs.forEach((tab,i) => tab.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const count = currentProject().chapters.length;
  const next = event.key==='Home' ? 0 : event.key==='End' ? count-1 : (i+(event.key==='ArrowRight'?1:-1)+count)%count;
  chooseChapter(next); tabs[next].focus({preventScroll:true});
}));
projectTabs.forEach((tab,i) => tab.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key==='Home' ? 0 : event.key==='End' ? projects.length-1 : (i+(event.key==='ArrowRight'?1:-1)+projects.length)%projects.length;
  selectProject(next); projectTabs[next].focus({preventScroll:true});
}));

scene.addEventListener('pointerdown',event => {
  if (event.button !== 0) return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};
  suppressClick=false;
});
scene.addEventListener('pointermove',event => {
  if (!drag || drag.id !== event.pointerId) return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if (!drag.horizontal && Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) { drag=null; return; }
  if (!drag.horizontal && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.3) {
    drag.horizontal=true; scene.setPointerCapture(event.pointerId); scene.classList.add('is-dragging');
  }
  if (drag.horizontal) {
    event.preventDefault();
    if (!reduced.matches) scene.style.setProperty('--drag-x',`${Math.max(-35,Math.min(35,dx*.2))}px`);
  }
});
function endDrag(event) {
  if (!drag || drag.id!==event.pointerId) return;
  const completed = drag;
  drag=null;
  const dx=event.clientX-completed.x;
  if (event.type==='pointerup' && completed.horizontal && Math.abs(dx)>45) {
    selectProject(projectIndex+(dx<0?1:-1)); suppressClick=true;
  }
  if (scene.hasPointerCapture(event.pointerId)) scene.releasePointerCapture(event.pointerId);
  scene.classList.remove('is-dragging'); scene.style.setProperty('--drag-x','0px');
  setTimeout(()=>{suppressClick=false;},0);
}
scene.addEventListener('pointerup',endDrag);
scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('lostpointercapture',endDrag);
scene.addEventListener('pointerleave',()=>{if(drag&&!drag.horizontal)drag=null;});
reduced.addEventListener('change',()=>{
  scene.style.setProperty('--drag-x','0px'); projectAnimation?.cancel();
  mainImage.getAnimations().forEach(animation=>animation.cancel());
});

function setDevice(device) {
  viewerBody.dataset.device=device;
  dialog.querySelectorAll('[data-work-device]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workDevice===device)));
}
function navigateProject(chapterIndex) {
  clearTimeout(loadTimer);
  frameCleanup?.();frameCleanup=null;
  const project = currentProject();
  const url=project.base+project.chapters[chapterIndex].route;
  // Storefront and boutique share a document. A chapter-specific query makes
  // switching either direction load that entry point, including its dialog state.
  const frameUrl=new URL(url,location.href);
  frameUrl.searchParams.set('atelier',String(chapterIndex));
  const previewVersion = new URL(import.meta.url).searchParams.get('v');
  if (previewVersion) frameUrl.searchParams.set('preview',previewVersion);
  loading.hidden=false;
  loading.lastChild.textContent=`Opening ${project.name}…`;
  iframe.src=frameUrl.href;
  dialog.querySelector('.cs-project-standalone').href=frameUrl.href;
  dialog.querySelectorAll('[data-work-route]').forEach(button=>{
    if(Number(button.dataset.workRoute)===chapterIndex)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  loadTimer=setTimeout(()=>{loading.lastChild.textContent='Still loading. You can open the project separately above.';},12000);
}
function openExperience(chapterIndex,device,trigger) {
  opener=trigger;
  const project = currentProject();
  dialog.querySelector('#cs-project-viewer-title').textContent = project.name;
  dialog.querySelector('.cs-project-viewer-nav > span').textContent = project.disclosure;
  iframe.title = `${project.name} interactive experience`;
  dialog.querySelectorAll('[data-work-route]').forEach((button,i) => { button.textContent = project.chapters[i].short; });
  setDevice(device);
  dialog.showModal();
  document.documentElement.classList.add('cs-project-open');
  navigateProject(chapterIndex);
  dialog.querySelector('.cs-project-close').focus({preventScroll:true});
}
iframe.addEventListener('load',()=>{
  if (!dialog.open || iframe.getAttribute('src')==='about:blank') return;
  clearTimeout(loadTimer);loading.hidden=true;
  frameCleanup?.();frameCleanup=null;
  // Keep frame-boundary navigation inside the viewer without skipping its
  // device controls. Inner dialogs and menus get the first Escape.
  try {
    const doc=iframe.contentDocument;
    const onKey=event=>{
      if (event.defaultPrevented || doc.fullscreenElement || doc.querySelector('dialog[open]')) return;
      if (event.key==='Escape') {
        const innerPanel=doc.querySelector(currentProject().innerPanels);
        // Stop native outer dismissal while allowing project handlers to close
        // search, shop, mobile navigation or the shortcut menu.
        event.preventDefault();
        if (!innerPanel) dialog.close();
      }
      if (event.key==='Tab') {
        const selector='a[href],button,input,select,textarea,[tabindex]';
        const available=element=>!element.disabled&&element.tabIndex>=0&&element.getClientRects().length&&!element.closest('[inert]')&&element.ownerDocument.defaultView.getComputedStyle(element).visibility!=='hidden';
        const inside=[...doc.querySelectorAll(selector)].filter(available);
        const atBoundary=event.shiftKey?doc.activeElement===inside[0]:doc.activeElement===inside.at(-1);
        if (atBoundary) {
          const outside=[...dialog.querySelectorAll(selector)].filter(available);
          const destination=event.shiftKey?outside.at(-1):outside[0];
          if (destination) { event.preventDefault(); destination.focus({preventScroll:true}); }
        }
      }
    };
    doc.addEventListener('keydown',onKey,true);
    frameCleanup=()=>doc.removeEventListener('keydown',onKey,true);
  } catch { /* A separately opened external destination keeps its own controls. */ }
});
dialog.addEventListener('click',event=>{
  if(event.target.closest('.cs-project-close'))dialog.close();
  const route=event.target.closest('[data-work-route]');
  const device=event.target.closest('[data-work-device]');
  if(route)navigateProject(Number(route.dataset.workRoute));
  if(device)setDevice(device.dataset.workDevice);
});
dialog.addEventListener('close',()=>{
  clearTimeout(loadTimer);frameCleanup?.();frameCleanup=null;
  iframe.src='about:blank';
  document.documentElement.classList.remove('cs-project-open');
  opener?.focus({preventScroll:true});
});

selectProject(0, false);
