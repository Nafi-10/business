document.addEventListener('DOMContentLoaded', () => {
  if (typeof initParticles === 'function') {
    initParticles({
      elementId: 'gallery-header-particles',
      interactive: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }
  const collection = document.getElementById('gallery-collection');
  const cards = Array.from(collection.querySelectorAll('.photo-tile'));
  const filters = Array.from(document.querySelectorAll('[data-topic]'));
  const dialog = document.getElementById('photo-viewer');
  const image = document.getElementById('photo-viewer-image');
  let visibleCards = cards;
  let active = 0;
  let opener = null;
  let touchStart = null;

  function updateCount(topic = 'All') {
    document.getElementById('collection-count').textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'image' : 'images'}${topic === 'All' ? '' : ` · ${topic}`}`;
  }

  function showImage(index) {
    active = (index + visibleCards.length) % visibleCards.length;
    const card = visibleCards[active];
    const thumbnail = card.querySelector('img');
    image.src = thumbnail.src;
    image.alt = thumbnail.alt;
    document.getElementById('photo-viewer-title').textContent = card.dataset.title;
    document.getElementById('photo-viewer-category').textContent = card.dataset.category;
    document.getElementById('photo-viewer-caption').textContent = card.dataset.caption;
    document.getElementById('photo-viewer-count').textContent = `${active + 1} of ${visibleCards.length}`;
    for (const id of ['photo-viewer-previous', 'photo-viewer-next']) {
      document.getElementById(id).disabled = visibleCards.length < 2;
    }
  }

  filters.forEach(filter => filter.addEventListener('click', () => {
    const topic = filter.dataset.topic;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    cards.forEach(card => { card.hidden = topic !== 'All' && card.dataset.category !== topic; });
    visibleCards = cards.filter(card => !card.hidden);
    collection.classList.toggle('is-filtered', topic !== 'All');
    updateCount(topic);
  }));

  cards.forEach(card => card.addEventListener('click', () => {
    opener = card;
    showImage(visibleCards.indexOf(card));
    dialog.showModal();
    document.body.classList.add('gallery-viewer-open');
  }));
  document.getElementById('photo-viewer-previous').addEventListener('click', () => showImage(active - 1));
  document.getElementById('photo-viewer-next').addEventListener('click', () => showImage(active + 1));
  document.getElementById('photo-viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-viewer-open');
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') showImage(0);
    else if (event.key === 'End') showImage(visibleCards.length - 1);
    else showImage(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  image.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  image.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) showImage(active + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  image.addEventListener('touchcancel', () => { touchStart = null; });
  updateCount();
});
