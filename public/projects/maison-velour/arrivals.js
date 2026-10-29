import { arrivalProducts } from './arrivals-data.js';

export function initArrivals({ openProduct, isSaved, toggleSaved, isOverlayOpen }) {
  const section = document.querySelector('#new-arrivals');
  const find = selector => section.querySelector(selector);
  const all = selector => [...section.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 5000;
  let index = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let paused = motion.matches;
  let visible = false;
  let focusWithin = false;
  let frameId;
  let contentAnimation;
  let filmAnimations = [];
  let filmOffset = 0;

  function animateBottle() {
    filmAnimations.forEach(animation => animation.cancel());
    filmAnimations = [];
    filmOffset = paused ? duration * .45 : 0;
    if (motion.matches) return;
    const object = find('.arrival-object.is-active');
    const animate = (element, frames) => {
      const animation = element.animate(frames, { duration, fill: 'both', easing: 'linear' });
      animation.pause();
      filmAnimations.push(animation);
    };
    animate(object.querySelector('.arrival-bottle'), [
      { transform: 'translate3d(-14px,20px,0) rotate(10deg) rotateY(-14deg) scale(.91)', filter: 'brightness(.38) drop-shadow(18px 30px 16px #160f1340)', offset: 0 },
      { transform: 'translate3d(-6px,4px,0) rotate(4deg) rotateY(-6deg) scale(.97)', filter: 'brightness(.9) drop-shadow(18px 30px 16px #160f1340)', offset: .25 },
      { transform: 'translate3d(6px,-9px,0) rotate(-5deg) rotateY(4deg) scale(1.04)', filter: 'brightness(1.06) drop-shadow(18px 30px 16px #160f1340)', offset: .65 },
      { transform: 'translate3d(12px,-14px,0) rotate(-13deg) rotateY(10deg) scale(1.07)', filter: 'brightness(.8) drop-shadow(18px 30px 16px #160f1340)', offset: 1 }
    ]);
    animate(object.querySelector('.arrival-reflection'), [
      { transform: 'translate(-14px,-20px) scaleY(-1) rotate(10deg) scale(.91)', opacity: .04 },
      { transform: 'translate(12px,14px) scaleY(-1) rotate(-13deg) scale(1.07)', opacity: .14 }
    ]);
    animate(find('.arrival-beam'), [
      { transform: 'translateX(-22%) rotate(23deg)', opacity: .3 },
      { transform: 'translateX(4%) rotate(12deg)', opacity: .85, offset: .55 },
      { transform: 'translateX(23%) rotate(-4deg)', opacity: .45 }
    ]);
    animate(find('.arrival-bottle-shadow'), [
      { transform: 'translateX(-10px) scale(.75)', opacity: .6 },
      { transform: 'translateX(14px) scale(.95)', opacity: .35 }
    ]);
    // A paused/manual selection should present a clearly lit bottle immediately.
    filmAnimations.forEach(animation => { animation.currentTime = filmOffset; });
  }

  function syncSaved() {
    const p = arrivalProducts[index];
    const saved = isSaved(p.id);
    find('.arrival-save').setAttribute('aria-pressed', String(saved));
    find('.arrival-save').setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${p.name} ${saved ? 'from' : 'to'} wishlist`);
  }
  function render(next, announce = false) {
    index = (next + arrivalProducts.length) % arrivalProducts.length;
    elapsed = 0;
    section.style.setProperty('--arrival-progress', '0');
    const p = arrivalProducts[index];
    section.dataset.product = p.id;
    all('.arrival-object').forEach(image => image.classList.toggle('is-active', image.dataset.arrivalImage === p.id));
    find('#arrival-brand').textContent = p.brand;
    find('#arrival-name').textContent = p.name;
    find('#arrival-subtitle').textContent = p.subtitle;
    find('#arrival-description').textContent = p.description;
    find('#arrival-format').replaceChildren(document.createTextNode(`${p.type} `), document.createElement('span'), document.createTextNode(` ${p.size}`));
    find('#arrival-family').textContent = p.family;
    find('#arrival-character').textContent = p.character;
    find('#arrival-notes').replaceChildren(...p.noteLabels.map(note => {
      const li = document.createElement('li'); li.textContent = note; return li;
    }));
    find('#arrival-count').textContent = String(index + 1).padStart(2, '0');
    all('[data-arrival-select]').forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-current', String(i === index));
    });
    syncSaved();
    animateBottle();
    if (!motion.matches) {
      contentAnimation?.forEach(animation => animation.cancel());
      contentAnimation = all('.arrival-changing').map(element => element.animate(
        [{ opacity: .15, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }
      ));
    }
    if (announce) find('#arrival-announcement').textContent = `${index + 1} of 5. ${p.brand}, ${p.name}. ${p.type}. ${p.notes}.`;
  }
  function canPlay() { return !paused && visible && !document.hidden && !focusWithin && !isOverlayOpen(); }
  function tick(now) {
    if (canPlay()) {
      // Discard long gaps after a background tab or a suspended animation frame.
      elapsed += lastFrame ? Math.min(now - lastFrame, 100) : 0;
      if (elapsed >= duration) render(index + 1);
      section.style.setProperty('--arrival-progress', String(elapsed / duration));
      filmAnimations.forEach(animation => { animation.currentTime = filmOffset + elapsed * (1 - filmOffset / duration); });
    }
    lastFrame = now;
    frameId = requestAnimationFrame(tick);
  }
  function updatePause() {
    find('.arrival-pause').setAttribute('aria-label', paused ? 'Play new arrivals slideshow' : 'Pause new arrivals slideshow');
    find('.arrival-pause use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    section.classList.toggle('arrivals-paused', paused);
  }
  all('[data-arrival-select]').forEach(button => button.addEventListener('click', () => render(Number(button.dataset.arrivalSelect), true)));
  find('.arrival-previous').addEventListener('click', () => render(index - 1, true));
  find('.arrival-next').addEventListener('click', () => render(index + 1, true));
  find('.arrival-pause').addEventListener('click', () => {
    paused = !paused;
    if (!paused) { focusWithin = false; lastFrame = 0; }
    updatePause();
  });
  section.addEventListener('keydown', event => {
    if (!event.target.closest('.arrival-selectors') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    render(event.key === 'Home' ? 0 : event.key === 'End' ? 4 : index + (event.key === 'ArrowRight' ? 1 : -1), true);
    all('[data-arrival-select]')[index].focus();
  });
  // Give keyboard users time to read without content changing under focus.
  section.addEventListener('focusin', event => { if (event.target.matches(':focus-visible')) focusWithin = true; });
  section.addEventListener('focusout', () => { requestAnimationFrame(() => { if (!section.contains(document.activeElement)) focusWithin = false; }); });
  find('.arrival-discover').addEventListener('click', () => openProduct(arrivalProducts[index].id));
  find('.arrival-save').addEventListener('click', () => { toggleSaved(arrivalProducts[index].id); syncSaved(); });
  document.addEventListener('velour:wishlist-changed', syncSaved);
  motion.addEventListener('change', event => { paused = event.matches; animateBottle(); updatePause(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    lastFrame = 0;
  }, { threshold: .15 }).observe(find('.arrival-stage'));
  render(0); updatePause(); frameId = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frameId));
  window.addEventListener('pageshow', event => { if (event.persisted) { lastFrame = 0; frameId = requestAnimationFrame(tick); } });
}
