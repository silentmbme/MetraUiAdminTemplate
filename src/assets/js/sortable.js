(function () {
    'use strict';
    const lists = Array.from(document.querySelectorAll('[data-sort-list]'));
    const feedback = document.getElementById('sort-feedback');
    if (!lists.length) return;
    const announce = message => { if (feedback) feedback.textContent = message; };
    const toggle = document.getElementById('sort-enabled');
    const originals = lists.map(list => ({ list, html: list.innerHTML }));
    const instances = new Map();
    const update = () => lists.forEach(list => {
        const locked = list.querySelector('[data-sort-locked]');
        if (locked) list.prepend(locked);
        const rows = Array.from(list.children);
        const disabled = list.id === 'sort-toggle' && toggle && !toggle.checked;
        rows.forEach((row, index) => {
            const source = list.dataset.sortMode === 'source';
            const up = row.querySelector('[data-sort-up]');
            const down = row.querySelector('[data-sort-down]');
            if (up) up.disabled = disabled || source || index === 0 || Boolean(rows[index - 1]?.hasAttribute('data-sort-locked'));
            if (down) down.disabled = disabled || source || index === rows.length - 1;
        });
    });
    if (typeof window.Sortable === 'function') lists.forEach(list => {
        const options = {
            animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180,
            handle: '[data-sort-handle]', draggable: '[data-sort-item]:not([data-sort-locked])',
            ghostClass: 'opacity-50', delay: 120, delayOnTouchOnly: true,
            onEnd: event => { update(); announce(event.item.querySelector('h3').textContent.trim() + ' reordered.'); }
        };
        if (list.dataset.sortGroup) options.group = list.dataset.sortGroup;
        if (list.dataset.sortMode === 'source') { options.group = { name: 'templates', pull: 'clone', put: false }; options.sort = false; }
        if (list.dataset.sortMode === 'target') options.group = { name: 'templates', pull: false, put: true };
        if (list.id === 'sort-toggle') options.disabled = Boolean(toggle && !toggle.checked);
        instances.set(list, new window.Sortable(list, options));
    });
    document.addEventListener('click', event => {
        const button = event.target.closest('[data-sort-up], [data-sort-down]');
        if (!button || button.disabled) return;
        const row = button.closest('[data-sort-item]');
        const list = row?.parentElement;
        if (!lists.includes(list) || list.dataset.sortMode === 'source') return;
        if (button.hasAttribute('data-sort-up') && row.previousElementSibling && !row.previousElementSibling.hasAttribute('data-sort-locked')) list.insertBefore(row, row.previousElementSibling);
        if (button.hasAttribute('data-sort-down') && row.nextElementSibling) list.insertBefore(row.nextElementSibling, row);
        update();
        const preferred = button.disabled ? row.querySelector('[data-sort-up]:not(:disabled), [data-sort-down]:not(:disabled)') : button;
        preferred?.focus();
        announce(row.querySelector('h3').textContent.trim() + ' moved to position ' + (Array.from(list.children).indexOf(row) + 1) + '.');
    });
    toggle?.addEventListener('change', event => {
        instances.get(document.getElementById('sort-toggle'))?.option('disabled', !event.target.checked);
        update();
        announce(event.target.checked ? 'Reordering enabled.' : 'Reordering disabled.');
    });
    document.getElementById('sort-reset')?.addEventListener('click', () => {
        originals.forEach(({ list, html }) => { list.innerHTML = html; });
        if (toggle) toggle.checked = true;
        instances.get(document.getElementById('sort-toggle'))?.option('disabled', false);
        update();
        announce('All examples restored to their original order.');
    });
    update();
})();
