const root = document.querySelector('#cs-motion');
const note = root.querySelector('#cs-context-note');
let previousFocus = null;
const isOpen = () => note.matches(':popover-open');

function close(restoreFocus = false) {
  if (!isOpen()) return;
  note.hidePopover();
  if (restoreFocus && previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
}

function show(x, y, keyboard = false) {
  if (!isOpen()) previousFocus = document.activeElement;
  note.showPopover();
  const bounds = note.getBoundingClientRect();
  note.style.left = `${Math.max(12, Math.min(x + 8, innerWidth - bounds.width - 12))}px`;
  note.style.top = `${Math.max(12, Math.min(y + 8, innerHeight - bounds.height - 12))}px`;
  if (keyboard) note.querySelector('button').focus({preventScroll:true});
}

root.addEventListener('contextmenu', event => {
  event.preventDefault();
  const keyboard = event.clientX === 0 && event.clientY === 0;
  const bounds = event.target.getBoundingClientRect();
  show(keyboard ? bounds.left : event.clientX, keyboard ? bounds.bottom : event.clientY, keyboard);
});
document.addEventListener('keydown', event => {
  if ((event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) && root.contains(event.target)) {
    event.preventDefault();
    const bounds = event.target.getBoundingClientRect();
    show(bounds.left, bounds.bottom, true);
  } else if (isOpen() && event.key === 'Escape') {
    event.preventDefault(); event.stopPropagation(); close(true);
  } else if (isOpen() && ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) {
    event.preventDefault(); event.stopPropagation();
  } else if (isOpen() && event.key === 'Tab') {
    close(true);
  }
}, true);
note.querySelector('[data-context-close]').addEventListener('click', () => close(true));
document.addEventListener('pointerdown', event => { if (!note.contains(event.target)) close(); });
// Close on a visitor's scroll gesture, not delayed scrolling from focus or anchors.
document.addEventListener('wheel', event => { if (!note.contains(event.target)) close(); }, {passive:true,capture:true});
window.addEventListener('resize', () => close(), {passive:true});
