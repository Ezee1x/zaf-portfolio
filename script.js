// Landing behavior: show logo, then reveal the menu.
(() => {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const splash = document.querySelector('.splash');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splashDuration = 2200;

  const showMenu = () => menu.classList.add('is-visible');

  if (prefersReduced) {
    if (splash) splash.classList.add('is-hidden');
    showMenu();
    return;
  }

  document.body.classList.add('is-animating');

  window.setTimeout(() => {
    if (splash) splash.classList.add('is-hidden');
    showMenu();
  }, splashDuration);
})();

// Featured projects: crossfade automatically, with direct selection and pause controls.
(() => {
  const carousel = document.querySelector('.portfolio-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const dots = [...carousel.querySelectorAll('[data-slide-index]')];
  const toggle = carousel.querySelector('.portfolio-carousel-toggle');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let timer;
  let request = 0;

  const schedule = () => {
    window.clearTimeout(timer);
    if (!paused && !document.hidden) {
      timer = window.setTimeout(() => show((current + 1) % slides.length), 6000);
    }
  };
  const show = async (index) => {
    const token = ++request;
    window.clearTimeout(timer);
    const image = slides[index].querySelector('img');
    // Hidden slides may never pass the browser's lazy-load visibility check.
    image.loading = 'eager';
    try {
      // Decode the next photograph before fading it in, avoiding an empty cover.
      await image.decode();
    } catch {
      if (token === request) schedule();
      return;
    }
    if (token !== request) return;
    current = index;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
      dots[i].setAttribute('aria-current', String(active));
    });
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
    schedule();
  };
  const updateToggle = () => {
    toggle.textContent = paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    toggle.setAttribute('aria-pressed', String(paused));
    schedule();
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', (event) => {
    if (event.matches) { paused = true; updateToggle(); }
  });
  carousel.querySelector('.portfolio-carousel-controls').hidden = false;
  slides[1].querySelector('img').loading = 'eager';
  updateToggle();
})();

// Reveal the editorial project tiles once, without hiding content before JS runs.
(() => {
  const projects = document.querySelectorAll('.portfolio-project');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!projects.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-reveal-pending');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  projects.forEach((project) => {
    observer.observe(project);
    project.classList.add('is-reveal-ready', 'is-reveal-pending');
  });

  const showAll = () => {
    projects.forEach((project) => project.classList.remove('is-reveal-pending'));
    observer.disconnect();
  };
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) showAll();
  });
  document.addEventListener('focusin', (event) => {
    const project = event.target.closest('.portfolio-project');
    if (project) project.classList.remove('is-reveal-pending');
  });
})();
