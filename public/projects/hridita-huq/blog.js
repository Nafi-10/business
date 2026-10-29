(() => {
  const stage = document.querySelector('.blog-stage');
  if (!stage) return;

  // Proposed editorial copy, not published writing or attributed experiences.
  const stories = [
    {
      title: 'The poetry of a pleat.', lines: ['The poetry', 'of a pleat.'], category: 'Design notes',
      excerpt: 'How a simple fold gives fabric its own rhythm, structure, and sense of movement.',
      alt: 'Illustrative AI image of an ivory pleated garment draped on a dress form in a warm atelier.',
      paragraphs: [
        'A pleat begins with a small decision: where to fold, how deeply, and in which direction. Repeated across a surface, that decision becomes a rhythm. Flat cloth starts to hold light, cast shadows, and suggest movement before anyone wears it.',
        'The same fold can feel entirely different in different materials. A crisp cloth keeps its edges clear; a soft one allows the lines to loosen and flow. Neither quality is more expressive than the other. Each offers a different way to shape a silhouette.',
        'Looking closely at a pleated surface is a reminder that detail can be structural. A repeated gesture does more than decorate a garment. It gives the fabric a way to move, and gives the eye a reason to linger.'
      ]
    },
    {
      title: 'A palette in the everyday.', lines: ['A palette in', 'the everyday.'], category: 'Inspiration',
      excerpt: 'A faded petal, warm stone, afternoon light. Colour stories often begin with simply noticing.',
      alt: 'Illustrative AI still life of terracotta and rose swatches, dried flowers, clay, and ivory linen.',
      paragraphs: [
        'A colour palette does not always arrive as a deliberate plan. It can begin with the muted pink of a dried flower, the shade beneath a clay bowl, or a piece of linen that looks different as the afternoon changes.',
        'Collecting these observations creates a useful conversation between colours. A warm tone may become quieter beside a cooler one. A small dark accent can give a group of pale shades more definition. Proportion matters as much as the colours themselves.',
        'Before turning that collection into clothing, it helps to test the colours in real materials. Light passes through organza and settles differently on wool. A palette becomes more personal when it is considered through texture, scale, and the feeling it leaves behind.'
      ]
    },
    {
      title: 'A feeling for texture.', lines: ['A feeling', 'for texture.'], category: 'Material stories',
      excerpt: 'Beyond colour and silhouette, the surface of a fabric has a story of its own.',
      alt: 'Illustrative AI macro photograph of folded linen, matte wool, and taupe silk with visible fibers.',
      paragraphs: [
        'Texture is often the first thing a hand notices and the last thing a photograph can fully explain. The irregular surface of linen, the soft density of wool, and the lightness of silk each suggest a different relationship with the body.',
        'Placed together, materials can bring out qualities that are easy to overlook alone. A smooth surface makes a coarse weave feel more pronounced. A translucent layer can soften the edges of a heavier fabric without hiding its structure.',
        'Choosing materials is therefore also a way of setting a mood. A useful starting point is to arrange a few swatches in natural light, fold them, and let them fall. Watch what holds a shape and what gives way. The material often offers the next idea.'
      ]
    },
    {
      title: 'The quiet art of finishing.', lines: ['The quiet art', 'of finishing.'], category: 'Craft & care',
      excerpt: 'The smallest stitches can change how a piece feels—both to look at and to wear.',
      alt: 'Illustrative AI photograph of hands embroidering pale botanical stitches on brown linen.',
      paragraphs: [
        'Finishing lives in the places that are easy to miss at first: the turn of a hem, the inside of a seam, a small line of stitching. These details become more visible the longer a garment is handled and worn.',
        'Handwork offers a particular kind of attention. Each stitch asks for a judgement about spacing, tension, and the character of the fabric. A finish can be almost invisible, or it can become a deliberate part of the design.',
        'The aim is not always to add more. Sometimes a carefully chosen detail is enough to bring the whole piece into focus. Looking at a garment from the inside as well as the outside is a useful way to consider how its idea has been carried through.'
      ]
    }
  ];

  const feature = stage.querySelector('.blog-feature');
  const backdropArt = stage.querySelector('.blog-backdrop .blog-art');
  const cards = [...stage.querySelectorAll('.blog-card')];
  const previous = stage.querySelector('.blog-prev');
  const next = stage.querySelector('.blog-next');
  const play = stage.querySelector('.blog-play');
  const read = stage.querySelector('.blog-read');
  const announcement = stage.querySelector('.blog-announcement');
  const reader = document.querySelector('.blog-dialog');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let busy = false;
  let playing = false;
  let visible = false;
  let focused = false;
  let timer;
  let flightAnimation;
  let readerOpener;
  let gesture;
  let suppressClickUntil = 0;

  function schedule() {
    clearTimeout(timer);
    if (playing && visible && !focused && !gesture && !busy && !document.hidden && !reader.open) {
      timer = setTimeout(() => select(current + 1, true), 6500);
    }
  }

  function setPlaying(value) {
    playing = value;
    play.setAttribute('aria-label', playing ? 'Pause blog stories' : 'Play blog stories');
    play.querySelector('.blog-play-label').textContent = playing ? 'Pause' : 'Play';
    play.querySelector('.blog-play-symbol').textContent = playing ? 'Ⅱ' : '▷';
    stage.dataset.playing = String(playing);
    schedule();
  }

  function render(announce) {
    const story = stories[current];
    stage.dataset.activeStory = String(current);
    stage.querySelector('.blog-category').textContent = story.category;
    const title = stage.querySelector('#blog-story-title');
    title.setAttribute('aria-label', story.title);
    title.replaceChildren(document.createTextNode(story.lines[0]), document.createElement('br'), document.createTextNode(story.lines[1]));
    stage.querySelector('.blog-excerpt').textContent = story.excerpt;
    stage.querySelector('.blog-counter strong').textContent = String(current + 1).padStart(2, '0');
    stage.querySelector('.blog-progress > span').style.width = `${(current + 1) / stories.length * 100}%`;
    cards.forEach((card, index) => {
      const offset = (index - current + stories.length) % stories.length;
      if (!offset && card.contains(document.activeElement)) stage.focus({ preventScroll: true });
      card.dataset.slot = offset ? String(offset - 1) : 'hidden';
      card.inert = !offset;
      // One tab stop in the moving rail; arrows also select every story.
      card.tabIndex = offset === 1 ? 0 : -1;
      if (offset) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    });
    if (announce) announcement.textContent = `Story ${current + 1} of ${stories.length}: ${story.title}`;
  }

  function select(index, automatic = false) {
    if (busy) return;
    const target = (index + stories.length) % stories.length;
    if (target === current) { schedule(); return; }
    const bounds = stage.getBoundingClientRect();
    const start = cards[target].getBoundingClientRect();
    current = target;
    render(!automatic);
    if (motion.matches || !stage.animate) {
      backdropArt.dataset.storyArt = String(current);
      schedule();
      return;
    }

    busy = true;
    clearTimeout(timer);
    stage.setAttribute('aria-busy', 'true');
    previous.disabled = next.disabled = true;
    const flight = document.createElement('div');
    flight.className = 'blog-flight blog-photo';
    flight.setAttribute('aria-hidden', 'true');
    const art = document.createElement('span');
    art.className = 'blog-art';
    art.dataset.storyArt = String(current);
    flight.append(art);
    stage.append(flight);
    flightAnimation = flight.animate([
      { left: `${start.left - bounds.left}px`, top: `${start.top - bounds.top}px`, width: `${start.width}px`, height: `${start.height}px`, borderRadius: '5px' },
      { left: '0px', top: '0px', width: `${bounds.width}px`, height: `${bounds.height}px`, borderRadius: '0px' }
    ], { duration: 1000, easing: 'cubic-bezier(.65,0,.22,1)', fill: 'both' });
    const copyAnimation = feature.animate([
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, delay: 300, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    flightAnimation.finished.catch(() => {}).then(() => {
      backdropArt.dataset.storyArt = String(current);
      flight.remove();
      copyAnimation.finish();
      flightAnimation = null;
      busy = false;
      previous.disabled = next.disabled = false;
      stage.removeAttribute('aria-busy');
      schedule();
    });
  }

  cards.forEach((card) => card.addEventListener('click', () => select(Number(card.dataset.story))));
  previous.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));
  play.addEventListener('click', () => {
    if (!playing) focused = false;
    setPlaying(!playing);
  });
  stage.addEventListener('keydown', (event) => {
    const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: stories.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    select(destinations[event.key]);
  });

  read.addEventListener('click', () => {
    const story = stories[current];
    readerOpener = read;
    reader.querySelector('#blog-dialog-title').textContent = story.title;
    reader.querySelector('.blog-dialog-meta').textContent = `${story.category} · 1 min read`;
    reader.querySelector('.blog-dialog-photo').setAttribute('aria-label', story.alt);
    reader.querySelector('.blog-art').dataset.storyArt = String(current);
    reader.querySelector('.blog-article-body').replaceChildren(...story.paragraphs.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    reader.showModal();
    reader.scrollTop = 0;
    document.body.classList.add('modal-open');
    schedule();
  });
  reader.querySelectorAll('.blog-dialog-close, .blog-dialog-return').forEach((button) => button.addEventListener('click', () => reader.close()));
  reader.addEventListener('click', (event) => {
    const rect = reader.getBoundingClientRect();
    if (event.target === reader && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) reader.close();
  });
  reader.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    readerOpener?.focus({ preventScroll: true });
    schedule();
  });

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.blog-read, .blog-controls')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    schedule();
  });
  stage.addEventListener('pointermove', (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      gesture.horizontal = true;
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  });
  stage.addEventListener('pointerup', (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (gesture.horizontal && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil = Date.now() + 400;
      select(current + (dx < 0 ? 1 : -1));
    }
    gesture = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    schedule();
  });
  stage.addEventListener('pointercancel', () => { gesture = null; schedule(); });
  stage.addEventListener('pointerleave', () => { if (gesture && !gesture.horizontal) { gesture = null; schedule(); } });
  stage.addEventListener('click', (event) => {
    if (Date.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  stage.addEventListener('focusin', (event) => { focused = event.target.matches(':focus-visible') && !play.contains(event.target); schedule(); });
  stage.addEventListener('focusout', () => queueMicrotask(() => { focused = stage.contains(document.activeElement) && document.activeElement.matches(':focus-visible') && !play.contains(document.activeElement); schedule(); }));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', () => flightAnimation?.finish());
  motion.addEventListener('change', () => {
    if (motion.matches) { flightAnimation?.finish(); setPlaying(false); }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .2 }).observe(stage);
  } else visible = true;
  render(false);
  setPlaying(!motion.matches);
})();
