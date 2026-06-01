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

// ===== Auto-slide marquees (Projects right→left, Research left→right) =====
// Duplicate each track's card set so the loop is seamless (track animates a
// full set-width). Clones are decorative: hidden from assistive tech and
// removed from tab order. CSS handles direction, speed, and hover-to-pause.
function enableMarquee(track) {
  if (!track) return;
  Array.from(track.children).forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
  });
  track.classList.add('is-marquee');
}
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  enableMarquee(document.getElementById('projectsTrack'));
  enableMarquee(document.getElementById('researchTrack'));
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

// ===== Interactive hero particle network =====
// A living, cursor-reactive constellation behind the hero — motion without a video file.
const heroCanvas = document.getElementById('heroCanvas');
const heroEl = document.getElementById('home');
if (heroCanvas && heroEl && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const ctx = heroCanvas.getContext('2d');
  const mouse = { x: -9999, y: -9999 };
  let w = 0, h = 0, dpr = 1, particles = [], raf = null;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const LINK = 138;   // px distance to draw a line between two nodes
  const PULL = 200;   // px radius the cursor influences

  const build = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = heroEl.clientWidth;
    h = heroEl.clientHeight;
    heroCanvas.width = w * dpr;
    heroCanvas.height = h * dpr;
    heroCanvas.style.width = w + 'px';
    heroCanvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(32, Math.min(92, Math.round((w * h) / 14000)));
    particles = Array.from({ length: count }, () => {
      const ang = rand(0, Math.PI * 2);
      const spd = rand(0.12, 0.36);
      return {
        x: rand(0, w), y: rand(0, h),
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        r: rand(1.3, 3),
      };
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const mouseOn = mouse.x > -9000;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // constant ambient drift — never decays, so the field is always moving
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      // cursor interaction: nudge toward the pointer + draw a beam to it
      if (mouseOn) {
        const dxm = mouse.x - p.x, dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < PULL && dm > 0.1) {
          const f = 1 - dm / PULL;
          p.x += (dxm / dm) * f * 0.6;
          p.y += (dym / dm) * f * 0.6;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(94, 234, 212, ' + (0.5 * f).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // glowing node: soft halo + bright core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.10)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(130, 240, 222, 0.95)';
      ctx.fill();
      // lines between neighbouring nodes
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(45, 212, 191, ' + (0.4 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    // soft glow that follows the cursor
    if (mouseOn) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
      g.addColorStop(0, 'rgba(45, 212, 191, 0.22)');
      g.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - 100, mouse.y - 100, 200, 200);
    }
    raf = requestAnimationFrame(draw);
  };
  const start = () => { if (!raf) draw(); };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

  heroEl.addEventListener('pointermove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroEl.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', build, { passive: true });

  build();
  requestAnimationFrame(() => heroCanvas.classList.add('is-on'));
  start();

  // Pause the loop while the hero is scrolled out of view to save battery.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0 }).observe(heroEl);
  }
}

// ===== Rotating typewriter role (hero eyebrow) =====
// Cycles through several role labels with a type-in / erase effect.
const rotateEl = document.querySelector('.hero__rotate');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (rotateEl) {
  let words = [];
  try { words = JSON.parse(rotateEl.dataset.rotate || '[]'); } catch (e) { words = []; }
  if (reduceMotion) {
    // Honour reduced-motion: show the first role, no animation.
    if (words.length) rotateEl.textContent = words[0];
  } else if (words.length) {
    let wi = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = words[wi];
      ci += deleting ? -1 : 1;
      rotateEl.textContent = word.slice(0, ci);
      let delay = deleting ? 45 : 85;
      if (!deleting && ci === word.length) { delay = 1500; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 320; }
      setTimeout(tick, delay);
    };
    rotateEl.textContent = '';
    setTimeout(tick, 700);
  }
}

// ===== Hero cursor parallax =====
// The background glow + grid drift opposite the pointer for a sense of depth.
const heroParallax = document.getElementById('home');
if (
  heroParallax &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches
) {
  const bg = heroParallax.querySelector('.hero__bg');
  const inner = heroParallax.querySelector('.hero__inner');
  let ticking = false;
  heroParallax.addEventListener('pointermove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = heroParallax.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      if (bg) bg.style.transform = 'translate(' + (dx * -22).toFixed(1) + 'px,' + (dy * -22).toFixed(1) + 'px)';
      if (inner) inner.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px)';
      ticking = false;
    });
  });
  heroParallax.addEventListener('pointerleave', () => {
    if (bg) bg.style.transform = '';
    if (inner) inner.style.transform = '';
  });
}
