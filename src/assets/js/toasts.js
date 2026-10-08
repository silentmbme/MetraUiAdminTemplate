(() => {
    const container = document.getElementById('toast-live-container');
    if (!container) return;
    const titles = { success: 'Changes saved', info: 'Workspace update', warning: 'Review required', danger: 'Action unsuccessful' };
    const show = (message, type = 'info', persistent = false) => {
        if (container.children.length >= 4) { const first = container.firstElementChild; bootstrap.Toast.getInstance(first)?.dispose(); first.remove(); }
        const element = document.createElement('div'); element.className = 'toast'; element.setAttribute('role', 'status'); element.setAttribute('aria-atomic', 'true');
        element.innerHTML = '<div class="toast-header"><i class="ri-notification-line me-2 text-' + type + '" aria-hidden="true"></i><strong class="me-auto"></strong><small>Just now</small><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Dismiss notification"></button></div><div class="toast-body"></div>';
        element.querySelector('strong').textContent = titles[type]; element.querySelector('.toast-body').textContent = message; container.append(element);
        const toast = new bootstrap.Toast(element, { autohide: !persistent, delay: 5000 }); element.addEventListener('hidden.bs.toast', () => { toast.dispose(); element.remove(); }); toast.show();
    };
    document.getElementById('toast-show').addEventListener('click', () => {
        const input = document.getElementById('toast-message'); if (!input.value.trim()) { input.focus(); return; }
        const position = document.getElementById('toast-position').value.split('-'); container.className = 'toast-container position-fixed p-3 ' + position[0] + '-0 ' + position[1] + '-0'; show(input.value.trim(), document.getElementById('toast-type').value);
    });
    document.querySelector('[data-toast-demo="persistent"]').addEventListener('click', () => show('Review your notification preferences when you have a moment.', 'info', true));
    document.querySelector('[data-toast-demo="stack"]').addEventListener('click', () => { show('Profile saved.', 'success'); show('Project documents updated.', 'info'); show('Invoice details need review.', 'warning'); });
    document.getElementById('toastify-preview').addEventListener('click', () => { if (window.Toastify) Toastify({ text: 'Workspace notification preview.', duration: 4000, close: true, gravity: 'bottom', position: 'right', style: { background: 'rgb(var(--theme-secondary-rgb))' }, stopOnFocus: true }).showToast(); });
})();
