(function () {
    'use strict';
    if (!window.bootstrap?.ScrollSpy) return;
    const examples = Array.from(document.querySelectorAll('[data-scrollspy-demo]'));
    examples.forEach(element => {
        window.bootstrap.ScrollSpy.getOrCreateInstance(element, {
            target: element.dataset.bsTarget,
            rootMargin: '0px 0px -45%',
            smoothScroll: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        });
    });
    const progress = document.getElementById('reading-spy-progress');
    const content = document.querySelector('[data-bs-target="#reading-spy-nav"]');
    const update = () => {
        const distance = content.scrollHeight - content.clientHeight;
        const percent = distance > 0 ? Math.round(content.scrollTop / distance * 100) : 0;
        progress.setAttribute('aria-valuenow', String(percent));
        progress.querySelector('.progress-bar').style.width = percent + '%';
        document.getElementById('reading-spy-percent').textContent = percent + '%';
    };
    content.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    document.querySelectorAll('.prism-toggle button').forEach(button => {
        button.addEventListener('click', () => window.requestAnimationFrame(() => {
            examples.filter(element => element.getClientRects().length).forEach(element => window.bootstrap.ScrollSpy.getInstance(element)?.refresh());
            update();
        }));
    });
})();
