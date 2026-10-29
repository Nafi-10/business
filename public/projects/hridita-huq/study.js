(() => {
  const source = document.getElementById('study-data');
  if (!source) return;
  const study = JSON.parse(source.textContent);
  const controls = [...document.querySelectorAll('[data-study-select]')];
  const notes = [...document.querySelectorAll('[data-study-note]')];
  const board = document.querySelector('.study-board');
  const art = document.querySelector('[data-main-art]');
  const photo = document.querySelector('[data-main-photo]');
  const number = i => String(i + 1).padStart(2, '0');

  function select(index) {
    const detail = study.details[index];
    if (!detail) return;
    controls.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.studySelect) === index)));
    notes.forEach((note, i) => { note.hidden = i !== index; });
    board.dataset.focus = index;
    if (art) {
      art.style.setProperty('--zoom', index === 0 ? '1' : '1.35');
      art.style.setProperty('--focus', detail.focus || '50% 50%');
      art.style.setProperty('--sheet', `url('./assets/process/studies-0${detail.sheet || study.sheet}.png')`);
      art.style.setProperty('--cell-x', detail.x || study.x);
      art.style.setProperty('--cell-y', detail.y || study.y);
      art.setAttribute('aria-label', detail.sheet ? 'Illustrative close-up of a hand-stitched hem and folded pleats.' : study.alt);
    }
    if (photo) {
      const thumbnail = document.querySelector(`.contact-frame[data-study-select="${index}"] img`);
      photo.src = thumbnail.src;
      photo.alt = `${detail.label} — original collection photograph. ${detail.text}`;
      document.querySelector('[data-frame-label]').textContent = `Frame ${number(index)} / ${detail.label}`;
      document.querySelector('[data-photo-credit]').textContent = detail.credit;
    }
  }

  controls.forEach(button => button.addEventListener('click', () => select(Number(button.dataset.studySelect))));
  document.body.classList.add('study-interactive');
  select(0);
  const chapters = document.querySelector('.chapter-nav');
  const activeChapter = chapters.querySelector('[aria-current="page"]');
  if (chapters.scrollWidth > chapters.clientWidth) {
    chapters.scrollLeft = activeChapter.offsetLeft - chapters.offsetLeft - (chapters.clientWidth - activeChapter.offsetWidth) / 2;
  }
})();
