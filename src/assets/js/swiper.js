(function () {
    'use strict';
    if (typeof window.Swiper !== 'function') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instances = [];
    let timed;
    document.querySelectorAll('[data-swiper-demo]').forEach(element => {
        const controls = document.querySelector('[data-swiper-controls="' + element.id + '"]');
        if (!controls) return;
        const mode = element.dataset.swiperDemo;
        const frame = element.parentElement;
        const options = {
            speed: reducedMotion ? 0 : 450,
            spaceBetween: 16,
            watchOverflow: true,
            observer: true, observeParents: true,
            a11y: { enabled: true },
            navigation: { prevEl: frame.querySelector('[data-swiper-prev]'), nextEl: frame.querySelector('[data-swiper-next]') },
            pagination: { el: controls.querySelector('[data-swiper-pagination]'), clickable: true, type: mode === 'fraction' ? 'fraction' : 'bullets' }
        };
        if (mode === 'fade') { options.effect = 'fade'; options.fadeEffect = { crossFade: true }; }
        if (mode === 'vertical') options.direction = 'vertical';
        if (mode === 'multiple' || mode === 'free') {
            options.slidesPerView = 1;
            options.breakpointsBase = 'container';
            options.breakpoints = { 360: { slidesPerView: 1.5 }, 520: { slidesPerView: 2 } };
            if (mode === 'free') options.freeMode = { enabled: true, sticky: true };
        }
        if (mode === 'coverflow') {
            options.effect = reducedMotion ? 'slide' : 'coverflow';
            options.centeredSlides = true;
            options.slidesPerView = 1.4;
            options.coverflowEffect = { rotate: 20, stretch: 0, depth: 100, modifier: 1, slideShadows: false };
        }
        if (mode === 'autoplay') {
            options.rewind = true;
            options.autoplay = { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true };
        }
        const instance = new window.Swiper(element, options);
        instances.push(instance);
        if (mode === 'autoplay') { timed = instance; timed.autoplay.stop(); }
    });
    const toggle = document.getElementById('swiper-autoplay-toggle');
    const status = document.getElementById('swiper-autoplay-status');
    const syncPlayback = () => {
        if (!timed || !toggle || !status) return;
        const running = timed.autoplay.running;
        toggle.setAttribute('aria-pressed', String(running));
        toggle.textContent = running ? 'Pause slideshow' : 'Start slideshow';
        status.textContent = running ? 'Playing every 3.5 seconds' : 'Paused';
    };
    if (timed) {
        timed.on('autoplayStart', syncPlayback);
        timed.on('autoplayStop', syncPlayback);
        toggle?.addEventListener('click', () => { timed.autoplay.running ? timed.autoplay.stop() : timed.autoplay.start(); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) timed.autoplay.stop(); });
        syncPlayback();
    }
    document.querySelectorAll('.prism-toggle button').forEach(button => {
        button.addEventListener('click', () => window.requestAnimationFrame(() => {
            instances.forEach(instance => {
                if (instance.el.getClientRects().length) instance.update();
                else if (instance === timed) instance.autoplay.stop();
            });
        }));
    });
})();
