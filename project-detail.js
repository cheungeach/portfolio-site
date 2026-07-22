(() => {
  // Reading progress bar
  const bar = document.getElementById('readProgress');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.width = (p * 100) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Fade-up entrance via IntersectionObserver
  const candidates = document.querySelectorAll(
    '.section, .section-title, .section-lede, .timeline-item, .residue-card, .voice, .process-step, .flow-step, .belief-row, .phase, .collapse-stage'
  );
  candidates.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  candidates.forEach(el => io.observe(el));
})();
