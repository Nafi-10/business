const root = document.querySelector('#cs-motion');
const header = root.querySelector('.cs-site-header');
const menu = header.querySelector('.cs-mobile-links');
const toggle = header.querySelector('.cs-menu');
const links = [...header.querySelectorAll('.cs-nav-links a')];
const sections = [...document.querySelectorAll('.cs-page > section[id]')];
let frame = 0;
function syncMenu() {
  header.dataset.menuOpen = String(!menu.hidden);
  toggle.setAttribute('aria-expanded', String(!menu.hidden));
  toggle.setAttribute('aria-label', menu.hidden ? 'Open navigation' : 'Close navigation');
}
function closeMenu(restoreFocus = false) {
  menu.hidden = true; syncMenu();
  if (restoreFocus) toggle.focus({preventScroll:true});
}
function update() {
  frame = 0;
  header.classList.toggle('is-scrolled', scrollY > 24);
  let active = '#cs-top';
  for (const section of sections) if (section.getBoundingClientRect().top <= 150) active = '#' + section.id;
  if (active === '#cs-services') active = '#cs-solutions';
  links.forEach(link => {
    if (link.getAttribute('href') === active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
}
root.addEventListener('click', event => {
  if (event.target.closest('.cs-menu')) syncMenu();
  else if (event.target.closest('a[href^="#cs-"],[data-cc-search]') || !event.target.closest('.cs-site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { event.preventDefault();closeMenu(true); }
});
window.addEventListener('scroll', () => { if (!frame) frame=requestAnimationFrame(update); }, {passive:true});
window.addEventListener('resize', () => { if (innerWidth > 900) closeMenu();update(); });
new MutationObserver(() => { header.inert = root.querySelector('.cs-page').inert; }).observe(root.querySelector('.cs-page'),{attributes:true,attributeFilter:['inert']});
syncMenu();update();
