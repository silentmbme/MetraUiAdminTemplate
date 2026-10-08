(function () {
    'use strict';

    let panelIndex = 0;
    const directChild = (card, selector) => Array.from(card.children).find(child => child.matches(selector));

    // Capture the original examples before inserting controls or opening markup.
    document.querySelectorAll('[data-markup-examples] .card').forEach(card => {
        if (card.querySelector('.prism-toggle') || !directChild(card, '.card-body')) return;
        let header = directChild(card, '.card-header');
        const preview = Array.from(card.children).filter(child => child !== header);
        const source = preview.map(child => child.outerHTML).join('\n');
        if (!header) {
            header = document.createElement('div');
            header.className = 'card-header justify-content-end';
            card.prepend(header);
        }
        header.classList.add('justify-content-between', 'flex-wrap', 'gap-2');
        const toggle = document.createElement('div');
        toggle.className = 'prism-toggle ms-auto flex-shrink-0';
        toggle.innerHTML = '<button class="btn btn-sm btn-outline-light rounded-pill" type="button"><span>View markup</span><i class="ri-code-line ms-2 d-inline-block align-middle" aria-hidden="true"></i></button>';
        header.append(toggle);
        const panel = document.createElement('div');
        panel.className = 'card-footer d-none border-top-0';
        panel.dataset.markupPanel = '';
        const pre = document.createElement('pre');
        pre.className = 'language-html mb-0';
        pre.style.maxHeight = '30rem';
        pre.style.overflow = 'auto';
        const code = document.createElement('code');
        code.className = 'language-html';
        code.textContent = source;
        pre.append(code);
        panel.append(pre);
        card.append(panel);
        card._markupPreview = preview;
    });

    // Also support the existing hand-written Prism examples on form pages.
    document.querySelectorAll('.prism-toggle').forEach(toggle => {
        const button = toggle.querySelector('button');
        const card = toggle.closest('.card');
        if (!button || !card || button.dataset.markupBound) return;
        const panel = directChild(card, '[data-markup-panel]') ||
            Array.from(card.children).find(child => child.matches('.card-footer') && child.querySelector('pre code'));
        const body = directChild(card, '.card-body');
        if (!panel || !body) return;
        const preview = card._markupPreview || [body];
        const initialHidden = preview.map(child => child.classList.contains('d-none'));
        panel.id = panel.id || 'markup-panel-' + (++panelIndex);
        button.dataset.markupBound = 'true';
        button.setAttribute('aria-controls', panel.id);
        button.setAttribute('aria-expanded', String(!panel.classList.contains('d-none')));
        button.addEventListener('click', () => {
            const showMarkup = panel.classList.contains('d-none');
            preview.forEach((child, index) => child.classList.toggle('d-none', showMarkup || initialHidden[index]));
            panel.classList.toggle('d-none', !showMarkup);
            button.setAttribute('aria-expanded', String(showMarkup));
            const label = button.querySelector('span');
            if (label) label.textContent = showMarkup ? 'View preview' : 'View markup';
            const icon = button.querySelector('i');
            if (icon) icon.className = (showMarkup ? 'ri-code-s-slash-line' : 'ri-code-line') + ' ms-2 d-inline-block align-middle';
            if (showMarkup && window.Prism && !panel.dataset.highlighted) {
                panel.querySelectorAll('code').forEach(code => window.Prism.highlightElement(code));
                panel.dataset.highlighted = 'true';
            }
        });
    });
})();
