const toggle = document.querySelector('[data-contact-toggle]');
const options = document.querySelector('#cs-contact-options');
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
toggle.addEventListener('click', () => {
  const expand = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expand));
  toggle.querySelector('span').textContent = expand ? 'Close contact options' : 'Show contact details';
  options.hidden = !expand;
  if (expand) {
    if (!reducedMotion.matches) options.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
    requestAnimationFrame(() => options.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'}));
  }
});
document.querySelector('[data-footer-year]').textContent = new Date().getFullYear();
document.querySelector('#cs-motion').addEventListener('click', event => {
  if (!event.target.closest('[data-contact-reveal]')) return;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.querySelector('span').textContent = 'Close contact options';
  options.hidden = false;
  requestAnimationFrame(() => toggle.focus({preventScroll:true}));
});
