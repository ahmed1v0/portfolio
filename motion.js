'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let disposeMotion = () => {};

  function configureMotion() {
    disposeMotion();
    if (reducedMotion.matches) return;

    const controller = new AbortController();
    const cleanup = [];
    const root = document.documentElement;
    root.classList.add('motion-ready');
    cleanup.push(() => root.classList.remove('motion-ready'));

    // Start finite animations only when visible; never hide content awaiting JavaScript.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-entering');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
      cleanup.push(() => {
        observer.disconnect();
        document.querySelectorAll('.is-entering').forEach((element) => element.classList.remove('is-entering'));
      });
    }

    if (precisePointer.matches) {
      document.querySelectorAll('[data-depth]').forEach((element) => {
        let frame = 0;
        let pointerX = 0;
        let pointerY = 0;
        element.classList.add('depth-enabled');

        const resetDepth = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          element.style.removeProperty('--rotate-x');
          element.style.removeProperty('--rotate-y');
          element.style.removeProperty('--light-x');
          element.style.removeProperty('--light-y');
        };
        element.addEventListener('pointermove', (event) => {
          if (event.pointerType === 'touch') return;
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (frame) return;
          frame = requestAnimationFrame(() => {
            const bounds = element.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
            const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
            element.style.setProperty('--rotate-x', `${(0.5 - y) * 5}deg`);
            element.style.setProperty('--rotate-y', `${(x - 0.5) * 7}deg`);
            element.style.setProperty('--light-x', `${x * 100}%`);
            element.style.setProperty('--light-y', `${y * 100}%`);
            frame = 0;
          });
        }, { passive: true, signal: controller.signal });
        element.addEventListener('pointerleave', resetDepth, { signal: controller.signal });
        element.addEventListener('pointercancel', resetDepth, { signal: controller.signal });
        addEventListener('blur', resetDepth, { signal: controller.signal });
        cleanup.push(() => {
          resetDepth();
          element.classList.remove('depth-enabled');
        });
      });
    }

    disposeMotion = () => {
      controller.abort();
      cleanup.forEach((dispose) => dispose());
    };
  }

  reducedMotion.addEventListener('change', configureMotion);
  precisePointer.addEventListener('change', configureMotion);
  addEventListener('pagehide', () => disposeMotion());
  addEventListener('pageshow', (event) => {
    if (event.persisted) configureMotion();
  });
  configureMotion();
})();
