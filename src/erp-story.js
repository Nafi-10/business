const story = document.querySelector('#cs-erp-story');
const slides = [...story.querySelectorAll('.cs-story-scene')];
const tabs = [...story.querySelectorAll('[data-story-index]')];
const playback = story.querySelector('.cs-story-play');
const count = story.querySelector('[data-story-count]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const modal = document.querySelector('.cs-panel-shade');
const duration = 5400;
let index = 0;
let elapsed = 0;
let lastTime = 0;
let frame = 0;
let visible = false;
let paused = reducedMotion.matches;

function loadImage(slideIndex) {
  const img = slides[slideIndex].querySelector('img');
  if (img.dataset.src) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
  return img;
}

function selectScene(next, manual = false) {
  index = (next + slides.length) % slides.length;
  elapsed = 0;
  story.dataset.scene = index;
  story.style.setProperty('--story-progress', '0');
  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === index);
    slide.setAttribute('aria-hidden', String(i !== index));
    slide.inert = i !== index;
    // Restart the camera movement without forcing layout.
    if (i === index) slide.querySelector('img').getAnimations().forEach(animation => animation.currentTime = 0);
  });
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    tab.classList.toggle('is-complete', i < index);
  });
  count.textContent = String(index + 1).padStart(2, '0');
  loadImage(index);
  loadImage((index + 1) % slides.length);
  if (manual) paused = true;
  updatePlayback();
}

function canRun() {
  return visible && !paused && !document.hidden && !(modal && !modal.hidden);
}

function updatePlayback() {
  playback.setAttribute('aria-pressed', String(paused));
  playback.setAttribute('aria-label', paused ? 'Play ERP presentation' : 'Pause ERP presentation');
  story.dataset.playing = String(canRun());
  cancelAnimationFrame(frame);
  frame = 0;
  lastTime = 0;
  if (canRun()) frame = requestAnimationFrame(tick);
}

function tick(now) {
  if (!canRun()) { updatePlayback(); return; }
  if (lastTime) elapsed += Math.min(now - lastTime, 100);
  lastTime = now;
  story.style.setProperty('--story-progress', String(Math.min(elapsed / duration, 1)));
  if (elapsed >= duration) {
    const next = (index + 1) % slides.length;
    const image = loadImage(next);
    // Slow connections keep the previous scene visible until the next image is ready.
    if (image.complete) { selectScene(next); return; }
  }
  frame = requestAnimationFrame(tick);
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectScene(i, true));
  tab.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
    selectScene(next, true);
    tabs[next].focus({ preventScroll: true });
  });
});

playback.addEventListener('click', () => { paused = !paused; updatePlayback(); });
story.addEventListener('focusin', event => {
  if (event.target === playback) return;
  paused = true;
  updatePlayback();
});
document.addEventListener('visibilitychange', updatePlayback);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) paused = true;
  updatePlayback();
});
if (modal) new MutationObserver(updatePlayback).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting && entry.intersectionRatio >= .35;
  if (visible) { loadImage(index); loadImage((index + 1) % slides.length); }
  updatePlayback();
}, { threshold: [0, .35] }).observe(story);
updatePlayback();
