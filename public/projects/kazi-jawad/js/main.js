/* ==========================================================================
   MD KAZI JAWADUL ISLAM - CORE PORTFOLIO LOGIC (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  let portfolioData = await loadPortfolioData();

  // Initialize Core Visual Components
  renderAllData(portfolioData);
  initUIComponents(portfolioData);
  initAOS();
});

/* --------------------------------------------------------------------------
   1. Data Fetching & Storage Integration
   -------------------------------------------------------------------------- */
async function loadPortfolioData() {
  // Check localStorage first for real-time admin updates
  const localData = localStorage.getItem('portfolioData');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Error parsing local portfolio data:', e);
    }
  }

  // Fallback to portfolio-data.json
  try {
    const response = await fetch('./data/portfolio-data.json');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch portfolio-data.json, using built-in defaults:', err);
  }

  // Default hardcoded state
  return getDefaultPortfolioData();
}

/* --------------------------------------------------------------------------
   2. Render Dynamic Data into HTML Sections
   -------------------------------------------------------------------------- */
function renderAllData(data) {
  if (!data) return;

  // Personal Info & Hero
  if (data.personal) {
    const p = data.personal;
    const nameEls = document.querySelectorAll('.dynamic-name');
    nameEls.forEach(el => el.textContent = p.name || 'MD Kazi Jawadul Islam');

    const taglineEl = document.getElementById('hero-tagline');
    if (taglineEl) taglineEl.textContent = p.tagline || '';

    const aboutTextEl = document.getElementById('about-bio-text');
    if (aboutTextEl && p.about) {
      aboutTextEl.replaceChildren(...p.about.split(/\n\s*\n/).map(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }));
    }

    const emailLinks = document.querySelectorAll('.dynamic-email');
    emailLinks.forEach(el => {
      if (el.tagName === 'A') el.href = `mailto:${p.email || ''}`;
      if (!el.classList.contains('social-icon-btn') && !el.querySelector('i')) {
        el.textContent = p.email || '';
      }
    });

    const phoneLinks = document.querySelectorAll('.dynamic-phone');
    phoneLinks.forEach(el => {
      if (el.tagName === 'A') el.href = `tel:${p.phone || ''}`;
      if (!el.classList.contains('social-icon-btn') && !el.querySelector('i')) {
        el.textContent = p.phone || '';
      }
    });

    const addressEls = document.querySelectorAll('.dynamic-address');
    addressEls.forEach(el => {
      if (!el.classList.contains('social-icon-btn') && !el.querySelector('i')) {
        el.textContent = p.address || '';
      }
    });

    const linkedinEls = document.querySelectorAll('.dynamic-linkedin');
    linkedinEls.forEach(el => {
      if (el.tagName === 'A') el.href = p.linkedin || '#';
      if (!el.classList.contains('social-icon-btn') && !el.classList.contains('social-square-btn') && !el.querySelector('i')) {
        el.textContent = p.linkedin || '';
      }
    });

    const facebookEls = document.querySelectorAll('.dynamic-facebook');
    facebookEls.forEach(el => {
      if (el.tagName === 'A') el.href = p.facebook || '#';
      if (!el.classList.contains('social-icon-btn') && !el.classList.contains('social-square-btn') && !el.querySelector('i')) {
        el.textContent = p.facebook || '';
      }
    });

    const instagramEls = document.querySelectorAll('.dynamic-instagram');
    instagramEls.forEach(el => {
      if (el.tagName === 'A') el.href = p.instagram || '#';
      if (!el.classList.contains('social-icon-btn') && !el.classList.contains('social-square-btn') && !el.querySelector('i')) {
        el.textContent = p.instagram || '';
      }
    });

    const githubEls = document.querySelectorAll('.dynamic-github');
    githubEls.forEach(el => {
      if (el.tagName === 'A') el.href = p.github || '#';
      if (!el.classList.contains('social-icon-btn') && !el.classList.contains('social-square-btn') && !el.querySelector('i')) {
        el.textContent = p.github || '';
      }
    });

    const cvBtn = document.getElementById('cv-download-btn');
    // Older saved portfolio data used a placeholder; preserve the real download.
    if (cvBtn && p.cvUrl && !p.cvUrl.startsWith('#')) cvBtn.href = p.cvUrl;

    if (p.profilePhoto) {
      const profileImg = document.getElementById('profile-photo-img');
      if (profileImg) profileImg.src = p.profilePhoto;
    }
  }

  // Info Cards / Stats
  if (data.infoCards && Array.isArray(data.infoCards)) {
    const container = document.getElementById('info-cards-container');
    if (container) {
      const order = ['Education', 'Current Role', 'Location', 'Hobbies'];
      const cards = [...data.infoCards].sort((a, b) => {
        const rank = label => order.includes(label) ? order.indexOf(label) : order.length;
        return rank(a.label) - rank(b.label);
      });
      container.replaceChildren(...cards.map(card => {
        const fact = document.createElement('div');
        fact.className = 'about-fact';
        const icon = document.createElement('span');
        icon.className = 'about-fact-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = card.icon || '<i class="fa-solid fa-circle-info"></i>';
        const content = document.createElement('div');
        const label = document.createElement('span');
        label.className = 'about-fact-label';
        label.textContent = ({ Location: 'Based In', Hobbies: 'Interests' })[card.label] || card.label;
        const value = document.createElement('p');
        value.className = 'about-fact-value';
        const [role, ...organization] = String(card.value || '').split(', ');
        if (card.label === 'Current Role' && organization.length) {
          value.textContent = role;
          const employer = document.createElement('span');
          employer.textContent = organization.join(', ');
          value.append(employer);
        } else {
          value.textContent = card.value || '';
        }
        content.append(label, value);
        fact.append(icon, content);
        return fact;
      }));
    }
  }

  // Certifications
  if (data.certifications && Array.isArray(data.certifications)) {
    const container = document.getElementById('certifications-pills-container');
    if (container) {
      container.replaceChildren(...data.certifications.map(cert => {
        const item = document.createElement('li');
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-award';
        icon.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.textContent = cert;
        item.append(icon, label);
        return item;
      }));
    }
  }

  // Technical & Tool Skills & Interests - Bento Grid Rendering
  const techSkills = data.technicalSkills || [];
  const toolSkills = data.toolSkills || [];
  const interestsList = data.interests || [];
  const allSkills = [...techSkills, ...toolSkills];

  // Calculate Average Score
  let avgVal = 82;
  if (allSkills.length > 0) {
    const total = allSkills.reduce((acc, s) => acc + (s.percentage || 0), 0);
    avgVal = Math.round(total / allSkills.length);
  }

  // 1. Update Mastery Score in Card 1 & Donut Center
  const masteryValEl = document.getElementById('bento-mastery-val');
  if (masteryValEl) masteryValEl.innerText = `${avgVal}%`;

  const donutCenterNumEl = document.getElementById('bento-donut-center-num');
  if (donutCenterNumEl) donutCenterNumEl.innerText = `${avgVal}%`;

  // 2. Card 1: Top mini progress list
  const miniSkillsListEl = document.getElementById('bento-mini-skills-list');
  if (miniSkillsListEl) {
    const topMini = techSkills.slice(0, 4);
    miniSkillsListEl.innerHTML = topMini.map(s => `
      <div class="bento-mini-skill-row">
        <div class="mini-skill-info">
          <span class="mini-skill-name">${s.name}</span>
          <span class="mini-skill-pct">${s.percentage}%</span>
        </div>
        <div class="mini-skill-bar">
          <div class="mini-skill-fill" style="width: ${s.percentage}%; background: ${s.color || '#22d3ee'};"></div>
        </div>
      </div>
    `).join('');
  }

  // 3. Card 2: Vertical Bar Chart + Tabs Filtering
  const renderBarChart = (filterType = 'all') => {
    const chartContainer = document.getElementById('bento-bar-chart-container');
    const chartCountEl = document.getElementById('bento-chart-count');
    if (!chartContainer) return;

    let items = [];
    if (filterType === 'technical') items = techSkills;
    else if (filterType === 'tools') items = toolSkills;
    else items = allSkills;

    if (chartCountEl) chartCountEl.innerText = `${items.length} Skills`;

    chartContainer.innerHTML = items.map((item, idx) => {
      const heightPct = Math.max(25, item.percentage || 50);
      const isTop = (item.percentage >= 85);
      const shortName = item.name.length > 12 ? item.name.substring(0, 10) + '..' : item.name;
      
      return `
        <div class="bento-bar-col ${isTop ? 'highlight' : ''}" style="--bar-delay: ${idx * 0.05}s">
          <div class="bento-bar-tag">${item.percentage}%</div>
          <div class="bento-bar-track">
            <div class="bento-bar-fill" style="height: ${heightPct}%; background: ${isTop ? 'linear-gradient(180deg, #0284c7 0%, #06b6d4 100%)' : 'linear-gradient(180deg, #475569 0%, #334155 100%)'};"></div>
          </div>
          <div class="bento-bar-label" title="${item.name}">${shortName}</div>
        </div>
      `;
    }).join('');
  };

  renderBarChart('all');

  const tabBtns = document.querySelectorAll('#bento-chart-tabs .bento-tab');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBarChart(btn.dataset.tab);
    };
  });

  // 4. Card 3: SVG Skill Radar Pentagon Chart
  const radarBox = document.getElementById('bento-radar-box');
  if (radarBox) {
    const pillars = [
      { name: 'Frontend', val: techSkills[0]?.percentage || 85 },
      { name: 'Python & AI', val: techSkills[1]?.percentage || 75 },
      { name: 'Database', val: techSkills[2]?.percentage || 70 },
      { name: 'Tools', val: toolSkills[0]?.percentage || 88 },
      { name: 'Soft Skills', val: techSkills[4]?.percentage || 90 }
    ];

    const cx = 110, cy = 100, r = 62;
    const points = pillars.map((p, i) => {
      const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
      const distance = (p.val / 100) * r;
      const x = cx + distance * Math.cos(angle);
      const y = cy + distance * Math.sin(angle);
      const labelX = cx + (r + 20) * Math.cos(angle);
      const labelY = cy + (r + 14) * Math.sin(angle);
      return { x, y, labelX, labelY, val: p.val, name: p.name, angle };
    });

    const polyPointsStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    const gridLevels = [0.33, 0.66, 1.0];
    const gridPolys = gridLevels.map(level => {
      return pillars.map((_, i) => {
        const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
        const dist = level * r;
        return `${(cx + dist * Math.cos(angle)).toFixed(1)},${(cy + dist * Math.sin(angle)).toFixed(1)}`;
      }).join(' ');
    });

    radarBox.innerHTML = `
      <svg viewBox="0 0 220 200" class="bento-radar-svg">
        ${pillars.map((_, i) => {
          const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
          return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="rgba(148, 163, 184, 0.35)" stroke-width="1.2" stroke-dasharray="3,3"/>`;
        }).join('')}

        ${gridPolys.map(poly => `<polygon points="${poly}" fill="none" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1"/>`).join('')}

        <polygon points="${polyPointsStr}" fill="rgba(6, 182, 212, 0.25)" stroke="#0284c7" stroke-width="2.5"/>

        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
        `).join('')}

        ${points.map(p => `
          <text x="${p.labelX}" y="${p.labelY}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${p.name}</text>
        `).join('')}
      </svg>
    `;
  }

  // 5. Card 4: Donut Chart & Legend
  const donutSvg = document.getElementById('bento-donut-svg');
  const donutLegend = document.getElementById('bento-donut-legend');
  if (donutSvg && donutLegend) {
    const categories = [
      { label: 'Web & UI', color: '#0284c7', pct: techSkills[0]?.percentage || 85 },
      { label: 'Python & AI', color: '#06b6d4', pct: techSkills[1]?.percentage || 75 },
      { label: 'Database', color: '#4f46e5', pct: techSkills[2]?.percentage || 70 },
      { label: 'Soft & Comm', color: '#0d9488', pct: techSkills[4]?.percentage || 90 }
    ];

    const r = 42;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const strokeArcs = categories.map(cat => {
      const sliceLen = (cat.pct / 320) * circ;
      const dash = `${sliceLen} ${circ - sliceLen}`;
      const arc = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${cat.color}" stroke-width="14" stroke-dasharray="${dash}" stroke-dashoffset="-${offset}" transform="rotate(-90 60 60)"/>`;
      offset += sliceLen + 3;
      return arc;
    }).join('');

    donutSvg.innerHTML = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="#cbd5e1" stroke-width="14"/>` + strokeArcs;

    donutLegend.innerHTML = categories.map(cat => `
      <div class="legend-item">
        <span class="legend-dot" style="background: ${cat.color};"></span>
        <span class="legend-name">${cat.label}</span>
        <span class="legend-pct">${cat.pct}%</span>
      </div>
    `).join('');

    const topSkill = [...allSkills].sort((a,b) => (b.percentage||0) - (a.percentage||0))[0];
    if (topSkill) {
      const scoreEl = document.getElementById('bento-top-skill-score');
      const nameEl = document.getElementById('bento-top-skill-name');
      if (scoreEl) scoreEl.innerText = `${topSkill.percentage}%`;
      if (nameEl) nameEl.innerText = topSkill.name;
    }
  }

  // 6. Card 5: Toolbox Stack List
  const toolsListEl = document.getElementById('bento-tools-stack-list');
  if (toolsListEl) {
    toolsListEl.innerHTML = toolSkills.map(t => `
      <div class="bento-tool-item">
        <div class="tool-left">
          <i class="fa-solid fa-wrench tool-icon"></i>
          <span class="tool-name">${t.name}</span>
        </div>
        <div class="tool-right">
          <div class="tool-progress-bg">
            <div class="tool-progress-fill" style="width: ${t.percentage}%; background: ${t.color || '#0284c7'};"></div>
          </div>
          <span class="tool-pct">${t.percentage}%</span>
        </div>
      </div>
    `).join('');
  }

  // 7. Card 7: Interests List
  const interestsBox = document.getElementById('bento-interests-container');
  if (interestsBox) {
    const interestIcons = [
      'fa-microchip', 'fa-shield-halved', 'fa-network-wired', 'fa-music',
      'fa-brain', 'fa-lightbulb', 'fa-rocket'
    ];
    interestsBox.innerHTML = interestsList.map((interest, idx) => `
      <div class="bento-interest-card" style="--card-idx: ${idx}">
        <div class="interest-card-top">
          <div class="interest-card-icon"><i class="fa-solid ${interestIcons[idx % interestIcons.length]}"></i></div>
          <div class="interest-live-dot"></div>
        </div>
        <div class="interest-card-title">${interest}</div>
        <div class="interest-card-sub">Domain Focus</div>
      </div>
    `).join('');
  }

  // Experience / Timeline
  if (data.experiences && Array.isArray(data.experiences)) {
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
      timelineContainer.innerHTML = data.experiences.map((exp, index) => {
        const aosAnim = index % 2 === 0 ? 'fade-right' : 'fade-left';
        return `
          <div class="timeline-item" data-aos="${aosAnim}">
            <div class="timeline-dot"></div>
            <div class="glass-card timeline-card">
              <h3 class="timeline-title">${exp.role}</h3>
              <div class="timeline-org">${exp.organization}</div>
              <span class="timeline-badge">${exp.duration}</span>
              <p class="timeline-desc">${exp.description}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Education
  if (data.education && Array.isArray(data.education)) {
    const eduContainer = document.getElementById('education-container');
    if (eduContainer) {
      eduContainer.innerHTML = data.education.map(edu => `
        <div class="glass-card edu-card" data-aos="fade-up">
          <i class="fa-solid fa-graduation-cap edu-icon"></i>
          <h3 class="edu-degree">${edu.degree}</h3>
          ${edu.major ? `<div class="edu-major">${edu.major}</div>` : ''}
          <div class="edu-inst">${edu.institution}</div>
          <div class="edu-footer">
            <span class="edu-year">${edu.year}</span>
            ${edu.gpa ? `<span class="edu-gpa">${edu.gpa}</span>` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  // Articles & Projects: numbered collection columns.
  renderArticleColumns(Array.isArray(data.articles) ? data.articles : []);

  // Typed Strings Init
  if (typeof initTyped === 'function') {
    initTyped(data.typedStrings);
  }

  // Particles Init
  if (data.settings && data.settings.enableParticles !== false && typeof initParticles === 'function') {
    initParticles();
  }
}

/* --------------------------------------------------------------------------
   3. UI Interactivity & Event Handlers
   -------------------------------------------------------------------------- */
function initUIComponents(data) {
  // Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    if (data && data.settings && data.settings.enablePreloader === false) {
      preloader.style.display = 'none';
    } else {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
      }, 1200);
    }
  }

  // Scroll Progress Bar
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) progressBar.style.width = scrolled + '%';

    // Navbar Scroll Background
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (winScroll > 80) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }

    // Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      if (winScroll > 300) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    }
  });

  // Back to Top Click
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile Hamburger Toggle
  const hamburger = document.getElementById('hamburger-toggle');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !navLinks.classList.contains('active')) return;
      event.preventDefault();
      event.stopPropagation();
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.focus();
    });
  }

  // Active Link Highlight on Scroll via Intersection Observer
  const sections = document.querySelectorAll('section[id], header[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-link').forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => navObserver.observe(sec));

  // Intersection Observer for Skill Bars Animation
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.skill-bar-fill').forEach(bar => {
            const target = bar.getAttribute('data-target');
            bar.style.width = target + '%';
          });
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    skillsObserver.observe(skillsSection);
  }

  // Contact Form Submission Handler
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('contact-form-status');
      const formData = new FormData(contactForm);
      const recipient = data.personal?.email || 'kazijawadulislam@gmail.com';
      const subject = `Portfolio enquiry from ${formData.get('name')}`;
      const body = `${formData.get('message')}\n\nFrom: ${formData.get('name')}\nReply to: ${formData.get('email')}`;
      const emailDraft = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (statusEl) {
        statusEl.className = 'form-status';
        statusEl.style.display = 'block';
        statusEl.textContent = `Finish sending in your email app. If it does not open, email ${recipient} directly. Your message has not been sent by this website.`;
      }
      window.location.href = emailDraft;
    });
  }

}

// Close article modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typeof window.closeArticleModal === 'function') {
      window.closeArticleModal();
    }
  }
});

/* --------------------------------------------------------------------------
   5. Article Reader Modal
   -------------------------------------------------------------------------- */
window.openArticleModal = async function(event, articleId) {
  event.preventDefault();
  const data = await loadPortfolioData();
  if (!data || !data.articles) return;

  const article = data.articles.find(a => a.id === articleId);
  if (!article) return;

  const overlay = document.getElementById('article-modal-overlay');
  const titleEl = document.getElementById('modal-article-title');
  const metaEl = document.getElementById('modal-article-meta');
  const bodyEl = document.getElementById('modal-article-body');

  if (titleEl) titleEl.textContent = article.title;
  if (metaEl) metaEl.textContent = `${article.category || 'Article'} • Published on ${article.date}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      ${article.thumbnail ? `<img src="${article.thumbnail}" style="width:100%; border-radius:12px; margin-bottom:20px;" />` : ''}
      <p style="font-size:1.1rem; color:#e5e7eb; line-height:1.8;">${article.body || article.excerpt}</p>
    `;
  }

  if (overlay) overlay.classList.add('active');
};

window.closeArticleModal = function() {
  const overlay = document.getElementById('article-modal-overlay');
  if (overlay) overlay.classList.remove('active');
};

/* --------------------------------------------------------------------------
   5. Helper Notification Toast
   -------------------------------------------------------------------------- */
function showToast(msg) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: rgba(15, 23, 42, 0.95);
      color: #ffffff;
      border: 1px solid var(--primary);
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary);"></i> ${msg}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}

/* --------------------------------------------------------------------------
   5. Helper Fallback Data
   -------------------------------------------------------------------------- */
function getDefaultPortfolioData() {
  return {
    personal: {
      name: "MD Kazi Jawadul Islam",
      tagline: "Passionate about Technology, Research & Innovation",
      about: "I'm MD Kazi Jawadul Islam, a B.Sc student in Computing and Information Systems at Daffodil International University, majoring in Artificial Intelligence.\n\nDriven by research and innovation, I'm building my path in technology through practical projects, continuous learning, and thoughtful problem-solving.",
      email: "kazijawadulislam@gmail.com",
      phone: "01410142580",
      address: "Asulia, Savar, Dhaka",
      linkedin: "https://www.linkedin.com/in/jawadul-islam-ab6bb4418",
      facebook: "https://www.facebook.com/jawadul.islam.14490/",
      instagram: "https://www.instagram.com/_jawadul_islam/?hl=en",
      github: "https://github.com/Nafi-10",
      cvUrl: "assets/documents/MD_Kazi_Jawadul_Islam_CV.pdf",
      profilePhoto: "assets/img/profile.jpg"
    }
  };
}

function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }
}
