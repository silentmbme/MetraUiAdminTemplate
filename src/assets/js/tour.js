(function () {
    'use strict';
    const start = document.getElementById('tour-start');
    const status = document.getElementById('tour-status');
    if (!start || !window.Shepherd?.Tour) return;
    const steps = [
    [
        "tour-introduction",
        "A calmer working day",
        "Get familiar with four useful parts of your workspace. You can move forward, go back, or leave the guide at any time."
    ],
    [
        "tour-components",
        "Plan with purpose",
        "Start with your tasks. Organize the work, set priorities, and choose the next milestone. Open your tasks when you are ready."
    ],
    [
        "tour-pages",
        "Keep everything together",
        "Shared files keep your team working from the same context. Browse documents and resources in the file manager."
    ],
    [
        "tour-theme",
        "Make time for what matters",
        "Use your calendar to see upcoming events and coordinate the week ahead."
    ],
    [
        "tour-responsive",
        "Make it feel like yours",
        "Review your profile and workspace preferences to make the experience fit your day."
    ]
];
    const tour = new window.Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'workspace-tour',
            cancelIcon: { enabled: true },
            scrollTo: { behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 8, modalOverlayOpeningRadius: 8
        }
    });
    steps.forEach(([id, title, text], index) => tour.addStep({
        id, title: index === 0 ? 'A fresh start for your working day' : title,
        text: '<p>' + (index === 0 ? 'Find the essentials that help you organize work, keep useful resources close, and plan what comes next.' : text) + '</p><p>' + (index === 0 ? 'Select Next to explore. Use the arrow keys to move through the guide, or close it whenever you like.' : 'Continue to the next feature or return to the previous step.') + '</p>',
        ...(index ? { attachTo: { element: '#' + id, on: 'top' } } : {}),
        buttons: [
            { text: 'Back', secondary: true, disabled: index === 0, action: () => tour.back() },
            { text: index === steps.length - 1 ? 'Finish' : 'Next', action: () => index === steps.length - 1 ? tour.complete() : tour.next() }
        ],
        when: { show: function () {
            document.body.classList.add('tour-reference-active');
            status.textContent = 'Step ' + (index + 1) + ' of ' + steps.length + ': ' + title;
            const footer = this.getElement().querySelector('.shepherd-footer');
            if (!footer.querySelector('.workspace-tour-progress')) {
                const progress = document.createElement('div');
                progress.className = 'workspace-tour-progress';
                const dots = document.createElement('div');
                dots.className = 'workspace-tour-dots';
                dots.setAttribute('aria-hidden', 'true');
                steps.forEach((_, i) => {
                    const dot = document.createElement('span');
                    dot.className = 'workspace-tour-dot' + (i === index ? ' is-active' : '');
                    dots.append(dot);
                });
                const count = document.createElement('span');
                count.textContent = (index + 1) + '/' + steps.length;
                count.setAttribute('aria-label', 'Step ' + (index + 1) + ' of ' + steps.length);
                progress.append(dots, count);
                footer.insertBefore(progress, footer.lastElementChild);
            }
        } }
    }));
    const clearOverlay = () => document.body.classList.remove('tour-reference-active');
    tour.on('complete', clearOverlay);
    tour.on('cancel', clearOverlay);
    start.addEventListener('click', () => tour.start());
    tour.on('complete', () => { status.textContent = 'You are ready to begin. Choose an essential below or replay the introduction.'; start.focus({ preventScroll: true }); });
    tour.on('cancel', () => { status.textContent = 'Tour closed. You can restart whenever you like.'; start.focus({ preventScroll: true }); });
})();
