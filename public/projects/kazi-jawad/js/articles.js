/* Each folded card represents one document. Navigation loops through the library. */
function renderArticleColumns(articles = []) {
  const container = document.getElementById('article-columns');
  const carousel = document.getElementById('article-carousel');
  if (!container || !carousel) return;
  if (carousel.cleanup) carousel.cleanup();
  const controller = new AbortController();
  const { signal } = controller;
  carousel.cleanup = () => controller.abort();
  let active = 0;
  const previous = document.getElementById('article-previous');
  const next = document.getElementById('article-next');
  const position = document.getElementById('article-position');
  const announcement = document.getElementById('article-announcement');
  const phone = window.matchMedia('(max-width: 620px)');
  const tablet = window.matchMedia('(max-width: 1000px)');
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const cards = articles.map((article, index) => {
    const tone = ['crimson', 'teal', 'olive', 'plum'][index % 4];
    const card = element('article', 'article-column article-column--' + tone);
    card.setAttribute('aria-labelledby', 'document-title-' + index);
    card.dataset.serial = String(index + 1).padStart(2, '0');
    const top = element('div', 'article-column-top');
    const icon = element('i', 'fa-solid ' + ['fa-layer-group', 'fa-microchip', 'fa-book-open'][index % 3] + ' article-column-icon');
    icon.setAttribute('aria-hidden', 'true');
    const heading = element('h3', 'article-column-title', article.title);
    heading.id = 'document-title-' + index;
    top.append(icon, heading, element('p', 'article-column-description', article.tagline));
    const band = element('div', 'article-column-band');
    const serial = element('span', 'article-column-number', card.dataset.serial);
    serial.setAttribute('aria-label', 'Document ' + (index + 1));
    const keywords = element('span', 'article-column-keywords');
    (article.keywords || []).forEach(keyword => keywords.append(element('span', '', keyword)));
    band.append(serial, keywords);
    const body = element('div', 'article-column-body');
    body.append(element('p', 'article-column-summary', article.excerpt));
    const link = element('a', 'article-read-more', 'Read more');
    link.href = article.href;
    link.setAttribute('aria-label', 'Read more: ' + article.title);
    const arrow = element('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
    body.append(link);
    card.append(top, band, body);
    return card;
  });
  function render(announce = false) {
    const visibleCount = phone.matches ? 1 : tablet.matches ? 2 : 3;
    const ordered = cards.map((_, offset) => cards[(active + offset) % cards.length]);
    ordered.forEach((card, index) => { card.hidden = index >= visibleCount; });
    container.replaceChildren(...ordered);
    position.textContent = cards.length ? String(active + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0') : '';
    previous.disabled = next.disabled = cards.length < 2;
    if (announce && cards.length) announcement.textContent = 'Document ' + (active + 1) + ' of ' + cards.length + ': ' + articles[active].title;
  }
  function move(direction) {
    if (!cards.length) return;
    active = (active + direction + cards.length) % cards.length;
    render(true);
  }
  previous.addEventListener('click', () => move(-1), { signal });
  next.addEventListener('click', () => move(1), { signal });
  carousel.addEventListener('keydown', event => {
    if (event.target !== previous && event.target !== next) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }, { signal });
  let touchStart;
  container.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true, signal });
  container.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    touchStart = undefined;
  }, { passive: true, signal });
  phone.addEventListener('change', () => render(), { signal });
  tablet.addEventListener('change', () => render(), { signal });
  render();
}
