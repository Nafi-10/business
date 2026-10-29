const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const dialog = document.querySelector('.section-dialog');
const portraitFrame = document.querySelector('.portrait-frame');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Remaining sections stay explicit previews until their content is supplied.
const upcomingSections = {
  services: { title: 'Made with intention.', description: 'The services section is coming soon. More about Hridita’s fashion design practice will be shared here.' },
  contact: { title: 'Let’s create together.', description: 'Contact details will be added soon. This portfolio is still taking shape—thank you for being here.' },
};

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mobileNav.hidden = isOpen;
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 681px)').addEventListener('change', closeMenu);

let dialogOpener;
document.querySelectorAll('[data-section]').forEach((button) => {
  button.addEventListener('click', () => {
    const content = upcomingSections[button.dataset.section];
    dialogOpener = mobileNav.contains(button) ? menuToggle : button;
    closeMenu();
    document.querySelector('#dialog-title').textContent = content.title;
    document.querySelector('#dialog-description').textContent = content.description;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});

document.querySelectorAll('.dialog-close, .dialog-return').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  dialogOpener?.focus();
});

portraitFrame.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = portraitFrame.getBoundingClientRect();
  portraitFrame.style.setProperty('--portrait-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 7}px`);
  portraitFrame.style.setProperty('--portrait-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 5}px`);
});
portraitFrame.addEventListener('pointerleave', () => {
  portraitFrame.style.setProperty('--portrait-x', '0px');
  portraitFrame.style.setProperty('--portrait-y', '0px');
});
