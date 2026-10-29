(() => {
  const section = document.querySelector('.about');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!section || motionPreference.matches || !('IntersectionObserver' in window)) return;

  const elements = section.querySelectorAll('[data-about-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  elements.forEach((element) => {
    element.classList.add('about-reveal-ready');
    observer.observe(element);
  });

  // Never keep content hidden after a visitor changes their motion preference.
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    elements.forEach((element) => element.classList.add('is-visible'));
    observer.disconnect();
  });
})();
