(function () {
    'use strict';

    const feedback = document.querySelector('#invoice-details-feedback');
    const statusBadges = document.querySelectorAll('.invoice-document-heading .badge, .invoice-payment-card .card-header .badge');
    const markPaidButton = document.querySelector('#invoice-mark-paid');
    const reminderButton = document.querySelector('#invoice-send');

    if (!feedback) return;

    document.querySelector('#invoice-print')?.addEventListener('click', function () {
        window.print();
    });

    reminderButton?.addEventListener('click', function () {
        const subject = encodeURIComponent('Payment reminder: invoice INV-2026-0148');
        const body = encodeURIComponent('Hello Jack,\n\nThis is a friendly reminder that invoice INV-2026-0148 for $2,200.00 is due on October 28, 2026.\n\nThank you,\nMetraUI Technologies');
        window.location.href = `mailto:jack.miller@example.com?subject=${subject}&body=${body}`;
        feedback.textContent = 'Reminder details opened in your email app.';
    });

    markPaidButton?.addEventListener('click', function () {
        const confirmed = window.confirm('Mark invoice INV-2026-0148 as paid?');
        if (!confirmed) return;

        statusBadges.forEach(function (badge) {
            badge.className = 'badge bg-success-transparent text-success rounded-pill';
            badge.innerHTML = '<i class="ri-check-line me-1" aria-hidden="true"></i>Paid';
        });

        const balance = document.querySelector('.invoice-balance');
        balance.querySelector('strong').textContent = '$0.00';
        balance.querySelector('.progress-bar').style.width = '100%';
        balance.querySelector('.progress-bar').setAttribute('aria-valuenow', '100');
        balance.querySelector('.d-flex span:first-child').textContent = '$2,200.00 paid';
        markPaidButton.disabled = true;
        markPaidButton.innerHTML = '<i class="ri-check-line me-1" aria-hidden="true"></i>Paid in full';
        feedback.textContent = 'Invoice marked as paid for this view.';
    });
})();
