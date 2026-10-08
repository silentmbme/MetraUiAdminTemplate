(function () {
    'use strict';
    const feedback = document.getElementById('drawer-demo-feedback');
    if (!feedback) return;
    document.getElementById('drawer-filter-form').addEventListener('submit', event => {
        event.preventDefault();
        feedback.textContent = 'Filter preview: ' + document.getElementById('drawer-filter-status').value + ' / ' + document.getElementById('drawer-filter-priority').value + '.';
        bootstrap.Offcanvas.getInstance(document.getElementById('drawer-filters'))?.hide();
    });
    const form = document.getElementById('drawer-task-form');
    const input = document.getElementById('drawer-task-name');
    input.addEventListener('input', () => input.setCustomValidity(''));
    document.getElementById('drawer-task').addEventListener('shown.bs.offcanvas', () => input.focus());
    form.addEventListener('submit', event => {
        event.preventDefault();
        input.setCustomValidity(input.value.trim() ? '' : 'Enter a task name.');
        if (!form.reportValidity()) return;
        feedback.textContent = 'Task preview created: ' + input.value.trim() + '. No task data is stored.';
        bootstrap.Offcanvas.getInstance(document.getElementById('drawer-task'))?.hide();
        form.reset();
    });
})();
