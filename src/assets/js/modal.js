(function () {
    'use strict';
    const feedback = document.getElementById('modal-demo-feedback');
    const recipientModal = document.getElementById('modal-recipient');
    if (recipientModal) recipientModal.addEventListener('show.bs.modal', event => {
        const name = event.relatedTarget?.dataset.recipient || 'teammate';
        recipientModal.querySelector('.modal-title').textContent = 'Invite ' + name;
        recipientModal.querySelector('[data-recipient-description]').textContent = 'Review the workspace details before inviting ' + name + ' to your team.';
    });
    const form = document.getElementById('demo-project-form');
    if (form) {
        document.getElementById('modal-form').addEventListener('shown.bs.modal', () => document.getElementById('demo-project-name').focus());
        form.addEventListener('submit', event => {
            event.preventDefault();
            const input = document.getElementById('demo-project-name');
            input.setCustomValidity(input.value.trim() ? '' : 'Enter a project name.');
            if (!form.reportValidity()) return;
            if (feedback) feedback.textContent = 'Project preview created: ' + input.value.trim() + '. This demo does not save project data.';
            bootstrap.Modal.getInstance(document.getElementById('modal-form'))?.hide();
            form.reset();
        });
        document.getElementById('demo-project-name').addEventListener('input', event => event.target.setCustomValidity(''));
    }
    document.getElementById('demo-archive-project')?.addEventListener('click', () => {
        if (feedback) feedback.textContent = 'Demo project marked as archived. No stored project data was changed.';
        bootstrap.Modal.getInstance(document.getElementById('modal-confirm'))?.hide();
    });
})();
