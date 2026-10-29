/* ==========================================================================
   CONTENT LOADER
   Fetches /content/data.json and renders every editable section of the
   portfolio. This is the file that connects the Admin Panel (Decap CMS,
   which edits content/data.json) to the live site.
   ========================================================================== */

(function () {
  async function loadContent() {
    let data;
    try {
      const res = await fetch('content/data.json', { cache: 'no-store' });
      data = await res.json();
    } catch (err) {
      console.error('Could not load content/data.json', err);
      return;
    }

    window.PORTFOLIO_DATA = data; // exposed for main.js (CV modal, etc.)

    renderHero(data.hero);
    renderAbout(data.about, data.socials);
    renderSkills(data.skills);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderArticles(data.articles);
    renderContact(data.contact, data.socials);

    // Let the rest of the page (main.js) know content is ready, in case
    // it needs to re-run animation observers on the newly injected markup.
    document.dispatchEvent(new CustomEvent('portfolio:content-loaded'));

    initTyped(data.hero.typedRoles);
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function renderHero(hero) {
    if (!hero) return;
    const nameEl = document.querySelector('.hero-name');
    const greetEl = document.querySelector('.hero-greeting');
    const tagEl = document.querySelector('.hero-tagline');
    if (nameEl) nameEl.textContent = hero.name;
    if (greetEl) greetEl.textContent = hero.greeting;
    if (tagEl) tagEl.textContent = hero.tagline;

    document.title = `${hero.name} | Portfolio & Business Analyst`;
    const preloaderSub = document.querySelector('.preloader-sub');
    if (preloaderSub) preloaderSub.textContent = hero.name;
  }

  function renderAbout(about, socials) {
    if (!about) return;
    const photo = document.querySelector('.profile-photo-wrapper img');
    if (photo) photo.src = about.photo;

    const bio = document.querySelector('.about-right-text');
    if (bio) bio.textContent = about.bio;

    const cardsGrid = document.querySelector('.about-cards-grid');
    if (cardsGrid && about.infoCards) {
      cardsGrid.innerHTML = about.infoCards.map(c => `
        <div class="info-card">
          <i class="${c.icon}"></i>
          <div><h4>${c.title}</h4><p>${c.text}</p></div>
        </div>
      `).join('');
    }

    const certWrap = document.querySelector('.cert-badges');
    if (certWrap && about.certifications) {
      certWrap.innerHTML = about.certifications
        .map(c => `<span class="cert-badge"><i class="fas fa-award"></i> ${c}</span>`)
        .join('');
    }

    renderSocialIcons(document.querySelector('.about-socials'), socials);
  }

  function renderSocialIcons(container, socials) {
    if (!container || !socials) return;
    const map = [
      { key: 'linkedin', icon: 'fab fa-linkedin-in', title: 'LinkedIn' },
      { key: 'instagram', icon: 'fab fa-instagram', title: 'Instagram' },
      { key: 'github', icon: 'fab fa-github', title: 'GitHub' },
      { key: 'facebook', icon: 'fab fa-facebook-f', title: 'Facebook' },
      { key: 'email', icon: 'fas fa-envelope', title: 'Email' }
    ];
    container.innerHTML = map.filter(m => socials[m.key]).map(m => {
      const href = m.key === 'email' ? `mailto:${socials.email}` : socials[m.key];
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" title="${m.title}"><i class="${m.icon}"></i></a>`;
    }).join('');
  }

  function skillBar(item) {
    return `
      <div class="skill-item"${item.wide ? ' style="grid-column: span 2;"' : ''}>
        <div class="skill-info"><span>${item.name}</span><span>${item.percent}%</span></div>
        <div class="skill-bar-bg"><div class="skill-per ${item.color}" data-per="${item.percent}%"></div></div>
      </div>
    `;
  }

  function renderSkills(skills) {
    if (!skills) return;
    const technicalGrid = document.querySelector('[data-skills="technical"]');
    if (technicalGrid && skills.technical) {
      technicalGrid.innerHTML = skills.technical.map(skillBar).join('');
    }
    const toolsGrid = document.querySelector('[data-skills="tools"]');
    if (toolsGrid && skills.tools) {
      toolsGrid.innerHTML = skills.tools.map(skillBar).join('');
    }
    const interestsWrap = document.querySelector('.interests-tags');
    if (interestsWrap && skills.interests) {
      interestsWrap.innerHTML = skills.interests
        .map(i => `<div class="interest-pill"><i class="${i.icon}"></i> ${i.label}</div>`)
        .join('');
    }

    // Re-trigger the skill bar fill animation used in main.js (IntersectionObserver
    // watches .skill-per elements; new ones need the same observer re-applied).
    document.dispatchEvent(new CustomEvent('portfolio:skills-rendered'));
  }

  function renderExperience(experience) {
    const container = document.querySelector('.timeline-container');
    if (!container || !experience) return;
    container.innerHTML = experience.map((e, idx) => `
      <div class="timeline-item ${idx % 2 === 0 ? 'left' : 'right'}" data-aos="fade-${idx % 2 === 0 ? 'right' : 'left'}">
        <div class="timeline-dot"></div>
        <div class="glass-card timeline-content">
          <h3 class="timeline-role">${e.role}</h3>
          <h4 class="timeline-org">${e.org}</h4>
          <span class="timeline-date">${e.date}</span>
          <p class="timeline-desc">${e.desc}</p>
        </div>
      </div>
    `).join('');
  }

  function renderEducation(education) {
    const container = document.querySelector('.education-grid');
    if (!container || !education) return;
    container.innerHTML = education.map((ed, idx) => `
      <div class="glass-card education-card" data-aos="fade-up" data-aos-delay="${(idx + 1) * 100}">
        <div>
          <div class="edu-icon"><i class="${ed.icon}"></i></div>
          <h3 class="edu-degree">${ed.degree}</h3>
          <div class="edu-major">${ed.major}</div>
          <p class="edu-institution">${ed.institution}</p>
        </div>
        <div class="edu-footer">
          <span class="edu-year">${ed.year}</span>
          <span class="gpa-badge">${ed.badge}</span>
        </div>
      </div>
    `).join('');
  }

  function renderArticles(articles) {
    const grid = document.querySelector('.articles-grid');
    if (!grid || !articles) return;
    grid.innerHTML = articles.map((a, idx) => `
      <div class="glass-card article-card" data-category="${a.category}" data-aos="fade-up" data-aos-delay="${(idx + 1) * 100}">
        <div class="article-thumb">
          <img src="${a.thumbnail}" alt="${a.title}" />
          <span class="category-tag">${a.category}</span>
        </div>
        <div class="article-body">
          <span class="article-date">${a.date}</span>
          <h3 class="article-title">${a.title}</h3>
          <p class="article-excerpt">${a.excerpt}</p>
          <span class="read-more-btn" data-article="${a.id}">Read More <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    `).join('');

    const articleModal = document.getElementById('articleModal');
    const modalBody = document.getElementById('modalBody');
    grid.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const a = articles.find(x => x.id === this.getAttribute('data-article'));
        if (a && articleModal && modalBody) {
          modalBody.innerHTML = `
            <div style="margin-bottom:15px;">
              <span style="background:rgba(0,212,255,0.15); color:#00d4ff; border:1px solid rgba(0,212,255,0.4); padding:4px 12px; border-radius:15px; font-size:0.8rem; font-weight:600;">${a.category}</span>
              <span style="color:#9ca3af; font-size:0.85rem; margin-left:10px;">${a.date}</span>
            </div>
            <h2 style="font-size:1.8rem; margin-bottom:20px; color:#ffffff;">${a.title}</h2>
            <div style="color:#e5e7eb; line-height:1.7;">${a.body}</div>
          `;
          articleModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  function renderContact(contact, socials) {
    if (!contact) return;
    const items = document.querySelectorAll('.contact-info-item');
    if (items[0]) {
      items[0].querySelector('a').textContent = contact.email;
      items[0].querySelector('a').href = `mailto:${contact.email}`;
    }
    if (items[1]) {
      items[1].querySelector('a').textContent = contact.phone;
      items[1].querySelector('a').href = `tel:${contact.phone.replace(/\s+/g, '')}`;
    }
    if (items[2]) {
      items[2].querySelector('p').textContent = contact.location;
    }

    const socialRow = document.querySelector('.social-links-row');
    if (socialRow && socials) {
      const map = [
        { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
        { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
        { key: 'github', icon: 'fab fa-github', label: 'GitHub' },
        { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook' },
        { key: 'email', icon: 'fas fa-paper-plane', label: 'Email' }
      ];
      socialRow.innerHTML = map.filter(m => socials[m.key]).map(m => {
        const href = m.key === 'email' ? `mailto:${socials.email}` : socials[m.key];
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="social-link-card"><i class="${m.icon}"></i> ${m.label}</a>`;
      }).join('');
    }
  }

  function initTyped(roles) {
    const typedElement = document.querySelector('#typed');
    if (typedElement && typeof Typed !== 'undefined' && roles && roles.length) {
      new Typed('#typed', {
        strings: roles,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 1800,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      });
    }
  }

  document.addEventListener('DOMContentLoaded', loadContent);
})();
