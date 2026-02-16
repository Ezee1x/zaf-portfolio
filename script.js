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
