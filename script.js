// ===== Navbar scroll state =====
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('nav--scrolled');
  else nav.classList.remove('nav--scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile menu =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const closeMenu = () => {
  navMenu.classList.remove('active');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
};
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  navToggle.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
navMenu.querySelectorAll('.nav__link').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ===== Animated stat counters =====
const counters = document.querySelectorAll('.stat__num');
const animateCount = (el) => {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = target * eased;
    const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
    el.textContent = display + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
};
if ('IntersectionObserver' in window && counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => countObserver.observe(c));
}

// ===== Footer year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Scroll progress bar =====
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

// ===== Certification filter =====
const certFilter = document.getElementById('certFilter');
const certGrid = document.getElementById('certGrid');
if (certFilter && certGrid) {
  const certCards = certGrid.querySelectorAll('.cert-card');
  certFilter.addEventListener('click', (e) => {
    const btn = e.target.closest('.cert-filter__btn');
    if (!btn) return;
    const filter = btn.dataset.filter;
    certFilter.querySelectorAll('.cert-filter__btn').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
    });
    certCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('is-hidden', !show);
      // Cards that were never scrolled into view are still reveal-hidden;
      // force them visible so a filter click never leaves a blank slot.
      if (show) card.classList.add('is-visible');
    });
  });
}

// ===== Cursor-reactive card spotlight =====
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const spotlightCards = document.querySelectorAll('.service-card, .project-card, .cert-card, .skill-card, .testi-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    });
  });
}
