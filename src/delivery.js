const { journeys, createDeliveryState, selectDeliveryJourney, selectDeliveryStep, deliveryStepForKey } = await import(new URL('./delivery-data.mjs' + new URL(import.meta.url).search, import.meta.url));
const section = document.querySelector('#cs-delivery');
const root = document.querySelector('#cs-motion');
const journeyButtons = [...section.querySelectorAll('[data-ds-journey]')];
const stepButtons = [...section.querySelectorAll('[data-ds-step]')];
const panel = section.querySelector('#ds-stage');
const dialog = section.querySelector('#ds-pack-dialog');
const openButton = section.querySelector('[data-ds-open]');
const art = section.querySelector('[data-ds-art]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state = createDeliveryState();
let goingToContact = false;
let animations = [];

function currentStage() { return journeys[state.journey].stages[state.steps[state.journey]]; }
function render(animate = true) {
  const journey = journeys[state.journey];
  const index = state.steps[state.journey];
  const stage = currentStage();
  journeyButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dsJourney === state.journey)));
  section.querySelector('.ds-timeline').setAttribute('aria-label', journey.label + ' delivery steps');
  stepButtons.forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    button.querySelector('[data-ds-step-label]').textContent = journey.stages[i].label;
  });
  panel.setAttribute('aria-labelledby', `ds-step-${index}`);
  section.querySelector('[data-ds-eyebrow]').textContent = stage.eyebrow;
  section.querySelector('[data-ds-title]').textContent = stage.title;
  section.querySelector('[data-ds-description]').textContent = stage.description;
  section.querySelectorAll('[data-ds-checks] li').forEach((item, i) => { item.textContent = stage.checks[i]; });
  section.querySelector('[data-ds-action]').textContent = stage.action;
  section.querySelector('[data-ds-pack-title]').textContent = stage.packTitle;
  section.querySelector('[data-ds-badge]').textContent = stage.badge;
  section.querySelectorAll('[data-ds-document]').forEach((item, i) => { item.textContent = stage.items[i].title; });
  animations.forEach(animation => animation.cancel());
  animations = [];
  if (animate) {
    section.querySelector('[data-ds-status]').textContent = `${journey.label}: step ${index + 1} of 4, ${stage.label}. ${stage.title}`;
    if (!reducedMotion.matches) {
      animations.push(section.querySelector('[data-ds-copy]').animate([{opacity:.3,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:330,easing:'ease-out'}));
      section.querySelectorAll('.ds-document').forEach((card, i) => {
        animations.push(card.animate([{translate:'0 28px',opacity:.45},{translate:'0 0',opacity:1}],{duration:540,delay:i*55,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
      });
    }
  }
}

journeyButtons.forEach(button => button.addEventListener('click', () => {
  if (button.dataset.dsJourney === state.journey) return;
  state = selectDeliveryJourney(state, button.dataset.dsJourney);
  render();
}));

stepButtons.forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.dsStep);
    if (index === state.steps[state.journey]) return;
    state = selectDeliveryStep(state, index); render();
  });
  button.addEventListener('keydown', event => {
    const next = deliveryStepForKey(state.steps[state.journey], event.key, stepButtons.length);
    if (next === null) return;
    event.preventDefault();
    state = selectDeliveryStep(state, next); render(); stepButtons[next].focus({preventScroll:true});
  });
});

openButton.addEventListener('click', () => {
  const stage = currentStage();
  section.querySelector('[data-ds-dialog-eyebrow]').textContent = stage.eyebrow;
  section.querySelector('#ds-dialog-title').textContent = stage.packTitle;
  const list = section.querySelector('[data-ds-pack-list]');
  list.replaceChildren(...stage.items.map(item => {
    const li = document.createElement('li');
    const title = document.createElement('h4'); title.textContent = item.title;
    const detail = document.createElement('p'); detail.textContent = item.detail;
    li.append(title, detail); return li;
  }));
  goingToContact = false;
  dialog.showModal();
  dialog.scrollTop = 0;
  section.querySelector('[data-ds-close]').focus({preventScroll:true});
});
section.querySelector('[data-ds-close]').addEventListener('click', () => dialog.close());
let backdropPointer = false;
function outsideDialog(event) {
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}
dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog && outsideDialog(event); });
dialog.addEventListener('click', event => { if (backdropPointer && event.target === dialog && outsideDialog(event)) dialog.close(); backdropPointer = false; });
dialog.addEventListener('close', () => {
  if (!goingToContact) openButton.focus({preventScroll:true});
});

section.querySelectorAll('[data-ds-contact]').forEach(link => link.addEventListener('click', () => {
  // Let the site's anchor handler handle scrolling and release any pinned section.
  goingToContact = true;
  if (dialog.open) dialog.close();
  const toggle = root.querySelector('[data-contact-toggle]');
  const options = root.querySelector('#cs-contact-options');
  options.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.querySelector('span').textContent = 'Close contact options';
  requestAnimationFrame(() => toggle.focus({preventScroll:true}));
}));

art.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = art.getBoundingClientRect();
  art.style.setProperty('--ds-tilt-x', `${(0.5-(event.clientY-rect.top)/rect.height)*5}deg`);
  art.style.setProperty('--ds-tilt-y', `${((event.clientX-rect.left)/rect.width-0.5)*8}deg`);
});
function resetTilt() { art.style.setProperty('--ds-tilt-x','0deg'); art.style.setProperty('--ds-tilt-y','0deg'); }
art.addEventListener('pointerleave', resetTilt);
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { animations.forEach(animation => animation.cancel()); resetTilt(); } });
render(false);
