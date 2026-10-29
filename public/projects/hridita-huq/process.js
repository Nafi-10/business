(() => {
  const section = document.querySelector('.studio-journal');
  if (!section) return;
  const stage = section.querySelector('.studio-stage');
  const scenes = [...section.querySelectorAll('.studio-scene')];
  const selectors = [...section.querySelectorAll('[data-studio-select]')];
  const play = section.querySelector('.studio-play');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let userPaused = motion.matches;
  let inView = false;
  let focused = false;
  let timer;
  let drag;
  let suppressClick = false;
  const number = (value) => String(value + 1).padStart(2, '0');

  function schedule() {
    clearTimeout(timer);
    const playing = !userPaused && inView && !focused && !drag && !document.hidden;
    section.dataset.playing = String(playing);
    play.setAttribute('aria-label', userPaused ? 'Play studio journal' : 'Pause studio journal');
    play.firstElementChild.textContent = userPaused ? '▷' : 'Ⅱ';
    play.querySelector('.studio-play-label').textContent = userPaused ? 'Play' : 'Pause';
    if (playing) timer = setTimeout(() => select(current + 1, false), 6500);
  }

  function select(index, manual = true) {
    const next = (index + scenes.length) % scenes.length;
    if (next !== current) {
      if (scenes[current].contains(document.activeElement)) stage.focus({ preventScroll: true });
      current = next;
    }
    scenes.forEach((scene, index) => {
      const active = index === current;
      scene.classList.toggle('is-active', active);
      scene.inert = !active;
      if (active) scene.removeAttribute('aria-hidden');
      else scene.setAttribute('aria-hidden', 'true');
    });
    selectors.forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    const navigation = section.querySelector('.studio-chapters');
    const chosen = selectors[current];
    const left = chosen.offsetLeft - navigation.offsetLeft;
    if (left < navigation.scrollLeft || left + chosen.offsetWidth > navigation.scrollLeft + navigation.clientWidth) {
      navigation.scrollTo({ left: left - (navigation.clientWidth - chosen.offsetWidth) / 2, behavior: motion.matches ? 'instant' : 'smooth' });
    }
    section.querySelector('.studio-count strong').textContent = number(current);
    section.querySelector('.studio-progress>span').style.width = `${(current + 1) / scenes.length * 100}%`;
    if (manual) section.querySelector('.studio-announcement').textContent = `${number(current)} of 07. ${scenes[current].dataset.name}. ${scenes[current].querySelector('.studio-copy p').textContent}`;
    schedule();
  }

  selectors.forEach((button, index) => button.addEventListener('click', () => select(index)));
  section.querySelector('.studio-prev').addEventListener('click', () => select(current - 1));
  section.querySelector('.studio-next').addEventListener('click', () => select(current + 1));
  play.addEventListener('click', () => {
    userPaused = !userPaused;
    // An explicit Play action overrides the control's keyboard focus.
    if (!userPaused) focused = false;
    schedule();
  });
  stage.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? scenes.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  stage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button, a')) return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId, horizontal: false };
    suppressClick = false;
    schedule();
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal && Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { drag = null; schedule(); return; }
    if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      drag.horizontal = true;
      stage.classList.add('is-dragging');
      if (!stage.hasPointerCapture(event.pointerId)) stage.setPointerCapture(event.pointerId);
    }
  });
  function finishDrag(event) {
    if (drag?.id === event.pointerId) {
      const dx = event.clientX - drag.x;
      if (drag.horizontal && Math.abs(dx) > 45) { select(current + (dx < 0 ? 1 : -1)); suppressClick = true; }
    }
    drag = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    schedule();
    setTimeout(() => { suppressClick = false; }, 0);
  }
  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', () => { drag = null; stage.classList.remove('is-dragging'); schedule(); });
  stage.addEventListener('pointerleave', () => { stage.classList.remove('has-pointer'); if (!stage.classList.contains('is-dragging') && drag) { drag = null; schedule(); } });
  stage.addEventListener('click', (event) => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } }, true);

  const experience = section.querySelector('.studio-experience');
  experience.addEventListener('focusin', (event) => { focused = event.target.matches(':focus-visible') && !play.contains(event.target); schedule(); });
  experience.addEventListener('focusout', () => queueMicrotask(() => { focused = experience.contains(document.activeElement) && document.activeElement.matches(':focus-visible') && !play.contains(document.activeElement); schedule(); }));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pageshow', schedule);
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => select(current, false));
  });
  motion.addEventListener('change', () => { if (motion.matches) { userPaused = true; stage.classList.remove('has-pointer'); } schedule(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.25 }).observe(stage);
  select(0, false);
})();
