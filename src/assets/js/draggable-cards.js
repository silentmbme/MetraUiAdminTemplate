(function () {
    'use strict';
    const lanes = Array.from(document.querySelectorAll('[data-card-lane]'));
    if (!lanes.length) return;
    const status = document.getElementById('card-board-status');
    const original = lanes.map(lane => ({ lane, cards: Array.from(lane.children) }));
    const update = () => {
        lanes.forEach(lane => {
            const cards = Array.from(lane.children).filter(card => card.matches('[data-draggable-card]'));
            const count = document.querySelector('[data-lane-count="' + lane.dataset.cardLane + '"]');
            if (count) count.textContent = cards.length;
            cards.forEach(card => {
                const select = card.querySelector('[data-move-card]');
                if (select) select.value = lane.dataset.cardLane;
            });
        });
    };
    const announce = (card, lane) => {
        const select = card.querySelector('[data-move-card]');
        const title = card.querySelector('h3').textContent.trim();
        const label = select.options[select.selectedIndex].textContent;
        status.textContent = title + ' moved to ' + label + '.';
    };
    if (typeof window.dragula === 'function') {
        const drake = window.dragula(lanes, {
            moves: (card, source, handle) => Boolean(handle.closest('[data-drag-handle]')),
            invalid: (card, handle) => Boolean(handle.closest('button, select, input, a')),
            revertOnSpill: true
        });
        drake.on('drop', (card, target) => {
            update();
            if (target) announce(card, target);
        });
        drake.on('cancel', update);
        document.getElementById('reset-card-board').addEventListener('click', () => {
            drake.cancel(true);
            original.forEach(({ lane, cards }) => cards.forEach(card => lane.append(card)));
            update();
            status.textContent = 'Board reset to its original arrangement.';
        });
    } else {
        document.getElementById('reset-card-board').addEventListener('click', () => {
            original.forEach(({ lane, cards }) => cards.forEach(card => lane.append(card)));
            update();
            status.textContent = 'Board reset to its original arrangement.';
        });
    }
    document.querySelectorAll('[data-move-card]').forEach(select => {
        select.addEventListener('change', () => {
            const card = select.closest('[data-draggable-card]');
            const target = lanes.find(lane => lane.dataset.cardLane === select.value);
            if (!target) return;
            target.append(card);
            update();
            announce(card, target);
            select.focus();
        });
    });
    update();
})();
