(() => {
  'use strict';

  // This is a navigation convenience, not protection for publicly delivered source code.
  const menu = document.createElement('div');
  menu.className = 'portfolio-context-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Portfolio shortcuts');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="portfolio-context-heading" role="presentation">Hridita Huq<small>Portfolio shortcuts</small></div>
    <a role="menuitem" tabindex="-1" href="./index.html#top">Portfolio home <span aria-hidden="true">↗</span></a>
    <a role="menuitem" tabindex="-1" href="./collection.html">View collections <span aria-hidden="true">↗</span></a>
    <a role="menuitem" tabindex="-1" href="./index.html#process">Inside the atelier <span aria-hidden="true">↗</span></a>
    <a role="menuitem" tabindex="-1" href="https://kazi-jawad.netlify.app/">Kazi Jawad <span aria-hidden="true">↗</span></a>
    <button class="portfolio-context-close" role="menuitem" tabindex="-1" type="button">Close menu <span aria-hidden="true">Esc</span></button>`;
  document.body.append(menu);

  const hasPopover = typeof menu.showPopover === 'function';
  if (hasPopover) menu.setAttribute('popover', 'manual');
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  let returnFocus = null;

  function closeMenu(restoreFocus = false) {
    if (menu.hidden) return;
    if (hasPopover && menu.matches(':popover-open')) menu.hidePopover();
    menu.hidden = true;
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function openMenu(target, x, y) {
    const previousFocus = menu.contains(document.activeElement) ? returnFocus : document.activeElement;
    closeMenu();
    returnFocus = target.closest('a[href], button, input, textarea, select, [tabindex]') || previousFocus;
    // A menu opened inside a modal must remain inside its accessible, non-inert subtree.
    const host = target.closest('dialog[open]') || document.body;
    host.append(menu);
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.hidden = false;
    if (hasPopover) menu.showPopover();
    const bounds = menu.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0;
    const top = viewport?.offsetTop || 0;
    const width = viewport?.width || window.innerWidth;
    const height = viewport?.height || window.innerHeight;
    menu.style.left = `${Math.max(left + 12, Math.min(x, left + width - bounds.width - 12))}px`;
    menu.style.top = `${Math.max(top + 12, Math.min(y, top + height - bounds.height - 12))}px`;
    items[0].focus({ preventScroll: true });
  }

  const isEditable = target => target.closest('input, textarea, select') || target.isContentEditable;

  document.addEventListener('contextmenu', event => {
    if (!(event.target instanceof Element) || isEditable(event.target)) return;
    event.preventDefault();
    if (menu.contains(event.target)) return;
    const rect = event.target.getBoundingClientRect();
    const keyboard = event.clientX === 0 && event.clientY === 0;
    openMenu(event.target, keyboard ? rect.left : event.clientX, keyboard ? rect.bottom : event.clientY);
  });

  document.addEventListener('keydown', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if ((event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) && !isEditable(target)) {
      event.preventDefault();
      if (menu.contains(target)) return;
      const rect = target.getBoundingClientRect();
      openMenu(target, rect.left, rect.bottom);
      return;
    }
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeMenu(true);
    } else if (event.key === 'Tab') {
      // Resume the page's normal tab order instead of trapping focus in a shortcut menu.
      closeMenu(true);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next].focus({ preventScroll: true });
    }
  }, true);

  menu.addEventListener('click', event => {
    if (event.target.closest('.portfolio-context-close')) closeMenu(true);
    else if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) closeMenu();
  }, true);
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('scroll', event => {
    if (!menu.contains(event.target)) closeMenu(true);
  }, true);
  window.addEventListener('resize', () => closeMenu(true));
  window.addEventListener('blur', () => closeMenu());
})();
