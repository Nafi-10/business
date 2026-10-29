const guide = document.querySelector('#cs-buyers');
const controls = guide.querySelector('.bg-categories');
const buttons = [...controls.querySelectorAll('[data-bg-category]')];
const panels = [...guide.querySelectorAll('[data-bg-panel]')];
function selectCategory(category) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.bgCategory === category)));
  panels.forEach(panel => { panel.hidden = panel.dataset.bgPanel !== category; });
  guide.closest('#cs-motion').dispatchEvent(new CustomEvent('cs:layout-change'));
}
controls.hidden = false;
controls.addEventListener('click', event => {
  const button = event.target.closest('[data-bg-category]');
  if (button) selectCategory(button.dataset.bgCategory);
});
selectCategory('software');
