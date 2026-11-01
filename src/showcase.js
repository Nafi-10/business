import { advanceStage, createWheelGate, STAGE_COUNT } from './showcase-state.mjs';

const section = document.querySelector('.cs-showcase');
const screen = section.querySelector('.cs-showcase-screen');
const pageRoot = document.querySelector('#cs-motion');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [
  { name: 'Possibilities', layout: 'right', turn: '-7deg', eyebrow: 'ONE PARTNER. EVERY POSSIBILITY.', title: 'Big ideas.<br><em>Beautifully built.</em>', description: 'From your first software purchase to a complete digital transformation. Open a world of possibilities, built around your industry.', folder: 'Possibilities', subtitle: 'Ideas turned into experiences.', software: 'Smart tools. Ready when you are.', design: 'Thoughtful experiences, made for people.', erp: 'Your entire business, working as one.', app: 'Everything, connected.', appName: 'Your next favorite tool', designName: 'Thoughtful experiences', designTitle: 'Less friction.<br>More possibility.', erpName: 'Connected ERP', metric: '94%' },
  { name: 'Retail & commerce', industry: 'retail', layout: 'left', turn: '7deg', eyebrow: '01 / RETAIL & COMMERCE', title: 'Every sale.<br><em>One connected story.</em>', description: 'From the shop floor to your online store, give every sale, customer, and product a place in one connected business.', folder: 'Retail & commerce', subtitle: 'From first click to loyal customer.', software: 'POS, inventory, orders, and stock alerts.', design: 'Storefronts and checkouts made to feel effortless.', erp: 'Connect stores, purchasing, and accounts.', app: 'Your store, in focus.', appName: 'StockFlow · Retail', designName: 'Commerce experience', designTitle: 'Good finds.<br>Great experiences.', erpName: 'Retail operations', metric: '842' },
  { name: 'Manufacturing', industry: 'manufacturing', layout: 'center', turn: '-3deg', eyebrow: '02 / MANUFACTURING', title: 'From moving parts<br>to <em>shared progress.</em>', description: 'Bring materials, production, and people together. See the whole picture, from your first work order to the final delivery.', folder: 'Manufacturing', subtitle: 'Every process. Working together.', software: 'Production planning and work-order tracking.', design: 'Clear interfaces for the factory floor.', erp: 'Link materials, quality, inventory, and finance.', app: 'Production, in sync.', appName: 'FactoryFlow · Production', designName: 'Operator workspace', designTitle: 'Built for clarity.<br>Made for progress.', erpName: 'Manufacturing ERP', metric: '94%' },
  { name: 'Healthcare', industry: 'healthcare', layout: 'right', turn: '6deg', eyebrow: '03 / HEALTHCARE', title: 'Less admin.<br><em>More room for care.</em>', description: 'Make daily operations feel simpler, from appointments and reception to the teams and resources behind every patient experience.', folder: 'Healthcare', subtitle: 'Thoughtful systems. Human experiences.', software: 'Appointments, queues, and clinic scheduling.', design: 'Accessible booking and patient experiences.', erp: 'Coordinate departments, supplies, and billing.', app: 'A clearer day of care.', appName: 'CareDesk · Scheduling', designName: 'Patient experience', designTitle: 'Care begins<br>with simplicity.', erpName: 'Clinic operations', metric: '64' },
  { name: 'Education', industry: 'education', layout: 'left', turn: '-8deg', eyebrow: '04 / EDUCATION', title: 'A connected campus.<br><em>A brighter everyday.</em>', description: 'Give students, educators, and administrators a simpler way to stay connected, from enrollment to the next milestone.', folder: 'Education', subtitle: 'Built around a world of learning.', software: 'Attendance, timetables, and course tools.', design: 'Welcoming student and learning portals.', erp: 'Connect admissions, fees, exams, and resources.', app: 'Learning, connected.', appName: 'CampusOne · Workspace', designName: 'Student experience', designTitle: 'A little curiosity.<br>A lot of possibility.', erpName: 'Campus management', metric: '1,280' },
  { name: 'Hospitality', industry: 'hospitality', layout: 'right', turn: '-4deg', eyebrow: '05 / HOSPITALITY', title: 'Behind every stay,<br><em>a seamless experience.</em>', description: 'Connect the moments that make a great stay, from the first reservation to the teams working quietly behind the scenes.', folder: 'Hospitality', subtitle: 'Great stays start behind the scenes.', software: 'Reservations, room status, and restaurant POS.', design: 'Inviting booking and guest experiences.', erp: 'Bring properties, teams, and operations together.', app: 'Every stay, in view.', appName: 'StaySuite · Property', designName: 'Guest experience', designTitle: 'Stay a little.<br>Feel at home.', erpName: 'Hospitality operations', metric: '87%' },
];

let current = 0, top = 0, unit = innerHeight, end = 0, after = 0;
let blockedUntil = 0, scrollFrame = 0, touchStartY = 0, touchLastY = 0, touchStartX = 0, touchConsumed = false;
let pendingDirections = [], pendingTimer = 0;
let pinned = false;
let exitGestureUntil = 0;
let exitDirection = 0;
const visited = new Set([0]);
const wheelGate = createWheelGate();
const query = (selector) => section.querySelector(selector);
const canPin = () => screen.offsetHeight <= innerHeight + 2;
const active = () => scrollY >= top - 2 && scrollY <= end + 2;
const modalOpen = () => !pageRoot.querySelector('.cs-panel-shade').hidden || !!document.querySelector('dialog[open]') || !!document.querySelector('.cs-site-header[data-menu-open="true"]');

pageRoot.addEventListener('cs:explorer-open', () => {
  pendingDirections = [];
  clearTimeout(pendingTimer);
  blockedUntil = 0;
  wheelGate.reset();
});

// Industry choices made in the hero, collection, or modal select the matching
// chapter here, keeping the guided industry story in step with the visitor.
pageRoot.addEventListener('cs:industry-change', event => {
  const id = typeof event.detail === 'string' ? event.detail : event.detail?.industry;
  const index = chapters.findIndex(chapter => chapter.industry === id);
  if (index > 0 && index !== current) render(index);
});

function render(index, animate = true) {
  if (index === current && section.dataset.initialized) return;
  current = index;
  visited.add(index);
  const chapter = chapters[index];
  section.dataset.stage = String(index);
  section.dataset.layout = chapter.layout;
  section.dataset.initialized = 'true';
  section.style.setProperty('--folder-turn', chapter.turn);
  query('[data-showcase-eyebrow]').textContent = chapter.eyebrow;
  query('#cs-showcase-heading').innerHTML = chapter.title;
  query('.cs-showcase-description').textContent = chapter.description;
  query('[data-folder-title]').textContent = chapter.folder;
  query('[data-folder-subtitle]').textContent = chapter.subtitle;
  query('[data-folder-eyebrow]').textContent = index ? 'INDUSTRY SOLUTIONS' : 'SELECTED SOLUTIONS';
  query('[data-folder-number]').textContent = String(index + 1).padStart(2, '0');
  query('[data-folder-app]').textContent = chapter.app;
  query('[data-folder-screen="software"]').textContent = chapter.appName;
  query('[data-folder-screen="design"]').textContent = chapter.designName;
  query('[data-folder-screen="erp"]').textContent = chapter.erpName;
  query('[data-folder-design]').innerHTML = chapter.designTitle;
  query('[data-folder-metric]').textContent = chapter.metric;
  for (const offering of ['software', 'design', 'erp']) query(`[data-offer="${offering}"]`).textContent = chapter[offering];
  const primary = query('.cs-showcase-primary');
  if (index) {
    primary.removeAttribute('data-showcase-next');
    primary.setAttribute('data-open', 'demo');
    primary.innerHTML = 'Book an industry demo <span aria-hidden="true">↗</span>';
  } else {
    primary.removeAttribute('data-open');
    primary.setAttribute('data-showcase-next', '');
    primary.innerHTML = 'Explore industries <span aria-hidden="true">↓</span>';
  }
  section.querySelectorAll('.cs-showcase-progress li').forEach((item, i) => {
    if (i === index) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    item.classList.toggle('is-visited', visited.has(i) && i < index);
  });
  query('.cs-showcase-live').textContent = `${index + 1} of 6. ${chapter.name}.`;
  if (chapter.industry) pageRoot.dispatchEvent(new CustomEvent('cs:industry-change', { detail: chapter.industry }));
  if (animate && !media.matches) {
    for (const element of [query('.cs-showcase-copy'), query('.cs-showcase-offerings')]) {
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([{ opacity: .12, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 650, easing: 'ease-out' });
    }
  }
}

function measure({preservePosition = true} = {}) {
  const wasActive = pinned || active();
  top = section.getBoundingClientRect().top + scrollY;
  unit = screen.offsetHeight;
  end = top + Math.max(0, screen.offsetHeight - innerHeight);
  after = top + section.offsetHeight;
  if (preservePosition && wasActive && section.dataset.initialized) window.scrollTo({ top, behavior: 'instant' });
}

// The collection above this section changes height when products are filtered.
// Refresh its pin bounds without snapping someone who is still browsing it.
pageRoot.addEventListener('cs:layout-change', () => {
  measure({preservePosition:false});
  pinned = active() && canPin();
  if (!active()) {
    pendingDirections = [];
    clearTimeout(pendingTimer);
    wheelGate.reset();
  }
});

function schedulePending() {
  clearTimeout(pendingTimer);
  if (!pendingDirections.length) return;
  pendingTimer = setTimeout(() => {
    if (!active() || modalOpen()) { pendingDirections = []; return; }
    const atBoundary = pendingDirections[0] > 0 ? scrollY >= end - 2 : scrollY <= top + 2;
    if (!atBoundary) { pendingDirections = []; return; }
    navigate(pendingDirections.shift());
  }, Math.max(0, blockedUntil - performance.now()) + 20);
}

function navigate(direction) {
  if (modalOpen()) return;
  measure({preservePosition:false});
  if (performance.now() < blockedUntil) {
    // Keep the latest intent only: a reversal must replace stale forward input.
    // Queuing every wheel notch caused chapters to keep changing after scrolling stopped.
    pendingDirections = [direction];
    schedulePending();
    return;
  }
  const next = advanceStage(current, direction);
  blockedUntil = performance.now() + (media.matches ? 220 : 850);
  if (next.exit) {
    pinned = false;
    // Absorb the remainder of the gesture while the next section settles.
    // Otherwise a trackpad burst continues scrolling after the pin releases.
    exitGestureUntil = performance.now() + (media.matches ? 250 : 900);
    exitDirection = direction;
    pendingDirections = [];
    clearTimeout(pendingTimer);
    window.scrollTo({ top: next.exit === 'after' ? after : Math.max(0, top - innerHeight), behavior: media.matches ? 'instant' : 'smooth' });
    return;
  }
  render(next.index);
  pinned = canPin();
  if (pinned) window.scrollTo({ top, behavior: 'instant' });
  schedulePending();
}

function enter(direction) {
  pinned = true;
  pendingDirections = [];
  clearTimeout(pendingTimer);
  const index = direction > 0 ? 0 : STAGE_COUNT - 1;
  render(index);
  blockedUntil = performance.now() + 500;
  window.scrollTo({ top: direction > 0 ? top : end, behavior: 'instant' });
  wheelGate.reset();
  wheelGate.consume(direction * 100, performance.now());
}

function crossing(delta) {
  if (scrollY < top - 2 && scrollY + delta >= top - 2) return 1;
  if (scrollY > end + 2 && scrollY + delta <= end + 2 && delta < 0) return -1;
  return 0;
}

// On short screens, let the whole chapter be read before consuming its next
// gesture. Clamp at the content edge so a large wheel delta cannot skip it.
function scrollWithinChapter(delta, event) {
  const movingInside = delta > 0 ? scrollY < end - 2 : scrollY > top + 2;
  if (!movingInside) return false;
  pendingDirections = [];
  clearTimeout(pendingTimer);
  const nextY = scrollY + delta;
  if (nextY > end || nextY < top) {
    event.preventDefault();
    window.scrollTo({ top: Math.max(top, Math.min(end, nextY)), behavior: 'instant' });
  }
  wheelGate.reset();
  wheelGate.consume(delta, performance.now());
  return true;
}

window.addEventListener('wheel', (event) => {
  if (event.defaultPrevented || event.ctrlKey || modalOpen() || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  measure({preservePosition:false});
  if (performance.now() < exitGestureUntil && Math.sign(event.deltaY) === exitDirection) {
    event.preventDefault();
    return;
  }
  if (Math.sign(event.deltaY) !== exitDirection) exitGestureUntil = 0;
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? unit : 1);
  if (active()) {
    if (scrollWithinChapter(delta, event)) return;
    event.preventDefault();
    const direction = wheelGate.consume(delta, performance.now());
    if (direction) navigate(direction);
  } else {
    const direction = crossing(delta);
    if (direction) { event.preventDefault(); enter(direction); }
  }
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || modalOpen() || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,canvas,[role="tablist"],[contenteditable="true"]')) return;
  const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.code === 'Space' && !event.shiftKey) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) || (event.code === 'Space' && event.shiftKey) ? -1 : 0;
  if (!direction || (event.code === 'Space' && event.target.closest('button,a'))) return;
  measure({preservePosition:false});
  if (performance.now() < exitGestureUntil && direction === exitDirection) { event.preventDefault(); return; }
  if (direction !== exitDirection) exitGestureUntil = 0;
  if (active()) {
    if (scrollWithinChapter(direction * (event.key.startsWith('Page') || event.code === 'Space' ? innerHeight : 40), event)) return;
    event.preventDefault();
    if (!event.repeat) navigate(direction);
  } else if (crossing(direction * (event.key.startsWith('Page') || event.code === 'Space' ? innerHeight : 40))) {
    event.preventDefault(); enter(direction);
  }
});

window.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  measure({preservePosition:false});
  touchStartY = event.touches[0].clientY;
  touchLastY = touchStartY;
  touchStartX = event.touches[0].clientX;
  touchConsumed = false;
}, { passive: true });
window.addEventListener('touchmove', (event) => {
  if (event.touches.length !== 1 || modalOpen()) return;
  const totalDelta = touchStartY - event.touches[0].clientY;
  const delta = touchLastY - event.touches[0].clientY;
  touchLastY = event.touches[0].clientY;
  if (performance.now() < exitGestureUntil && Math.sign(delta) === exitDirection) { event.preventDefault(); return; }
  if (Math.sign(delta) !== exitDirection) exitGestureUntil = 0;
  if (Math.abs(totalDelta) < Math.abs(touchStartX - event.touches[0].clientX)) return;
  if (active()) {
    if (scrollWithinChapter(delta, event)) { touchConsumed = true; return; }
    event.preventDefault();
    if (!touchConsumed && Math.abs(totalDelta) > 42) { touchConsumed = true; navigate(Math.sign(delta)); }
  } else if (!touchConsumed && crossing(delta)) {
    event.preventDefault(); touchConsumed = true; enter(Math.sign(delta));
  }
}, { passive: false });

section.addEventListener('click', (event) => {
  const next = event.target.closest('[data-showcase-next]');
  const prev = event.target.closest('[data-showcase-prev]');
  if (!next && !prev) return;
  // render() changes the primary CTA into a booking button. Do not let the
  // originating click bubble into the root's newly matching booking handler.
  event.stopPropagation();
  if (!active() && canPin()) window.scrollTo({ top, behavior: 'instant' });
  navigate(next ? 1 : -1);
});

window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    pinned = active();
    if (!pinned) { pendingDirections = []; clearTimeout(pendingTimer); }
  });
}, { passive: true });
window.addEventListener('resize', measure);
pageRoot.addEventListener('cs:navigate', event => {
  pendingDirections = [];
  clearTimeout(pendingTimer);
  blockedUntil = 0;
  exitGestureUntil = 0;
  wheelGate.reset();
  if (event.detail === '#cs-services') render(0);
});
measure(); render(0, false);
