document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const stage = document.getElementById('gallery-stage');
  const cards = Array.from(stage.querySelectorAll('.gallery-card'));
  if (!cards.length) return;
  const previous = document.getElementById('gallery-previous');
  const next = document.getElementById('gallery-next');
  const dotsContainer = document.getElementById('gallery-dots');
  const status = document.getElementById('gallery-status');
  const dialog = document.getElementById('gallery-lightbox');
  const fullImage = document.getElementById('gallery-full-image');
  let active = Math.max(0, cards.findIndex(card => card.classList.contains('is-active')));
  let touchStart = null;
  let suppressClickUntil = 0;

  const title = card => card.querySelector('.gallery-card-title').textContent;
  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `Show gallery image ${index + 1}: ${title(card)}`);
    dot.addEventListener('click', () => select(index));
    dotsContainer.append(dot);
    return dot;
  });

  function updateViewer() {
    const card = cards[active];
    const thumbnail = card.querySelector('img');
    fullImage.src = thumbnail.getAttribute('src');
    fullImage.alt = thumbnail.alt;
    document.getElementById('gallery-image-title').textContent = title(card);
    document.getElementById('gallery-image-category').textContent = card.querySelector('.gallery-card-category').textContent;
    document.getElementById('gallery-image-caption').textContent = card.dataset.caption;
    document.getElementById('gallery-lightbox-count').textContent = `${active + 1} of ${cards.length}`;
  }

  function select(index, announce = true) {
    active = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      let offset = (cardIndex - active + cards.length) % cards.length;
      if (offset > cards.length / 2) offset -= cards.length;
      card.dataset.offset = String(offset);
      card.hidden = Math.abs(offset) > 2;
      card.classList.toggle('is-active', offset === 0);
      card.tabIndex = offset === 0 ? 0 : -1;
      card.setAttribute('aria-label', `${offset === 0 ? 'Open' : 'Show'} image: ${title(card)}`);
      dots[cardIndex].setAttribute('aria-current', String(offset === 0));
    });
    if (announce) status.textContent = `Image ${active + 1} of ${cards.length}: ${title(cards[active])}`;
    if (dialog.open) updateViewer();
  }

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (Date.now() < suppressClickUntil) return;
      if (index !== active) {
        select(index);
        return;
      }
      updateViewer();
      dialog.showModal();
      document.body.classList.add('gallery-viewer-open');
    });
  });
  previous.addEventListener('click', () => select(active - 1));
  next.addEventListener('click', () => select(active + 1));
  document.getElementById('gallery-lightbox-previous').addEventListener('click', () => select(active - 1));
  document.getElementById('gallery-lightbox-next').addEventListener('click', () => select(active + 1));
  document.getElementById('gallery-lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-viewer-open');
    cards[active].focus({ preventScroll: true });
  });

  function onArrowKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const cardWasFocused = cards.includes(document.activeElement);
    if (event.key === 'Home') select(0);
    else if (event.key === 'End') select(cards.length - 1);
    else select(active + (event.key === 'ArrowRight' ? 1 : -1));
    if (cardWasFocused) cards[active].focus({ preventScroll: true });
  }
  gallery.addEventListener('keydown', onArrowKey);
  dialog.addEventListener('keydown', onArrowKey);

  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      select(active + (dx < 0 ? 1 : -1));
      suppressClickUntil = Date.now() + 400;
    }
    touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  select(active, false);
});
