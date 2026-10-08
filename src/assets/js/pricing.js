(function () {
    'use strict';

    const page = document.querySelector('.pricing-page');

    if (!page) return;

    const periodButtons = [...page.querySelectorAll('[data-pricing-period]')];
    const prices = [...page.querySelectorAll('[data-monthly][data-yearly]')];
    const billingNote = page.querySelector('#pricing-billing-note');

    function setPeriod(period) {
        const yearly = period === 'yearly';

        periodButtons.forEach(function (button) {
            const selected = button.dataset.pricingPeriod === period;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });

        prices.forEach(function (price) {
            price.textContent = yearly ? price.dataset.yearly : price.dataset.monthly;
            const interval = price.closest('.pricing-price').querySelector('.pricing-interval');
            const plan = price.closest('.pricing-plan-card');
            const isStarter = plan.querySelector('h3').textContent === 'Starter';
            interval.textContent = yearly
                ? (isStarter ? '/ year' : '/ user / year')
                : (isStarter ? '/ month' : '/ user / month');
            plan.querySelector('.pricing-bill-caption').textContent = yearly ? 'Billed annually' : 'Billed monthly';
        });

        billingNote.textContent = yearly
            ? 'Billed annually. Save up to 17% compared with monthly billing.'
            : 'Billed monthly. Change plans at any time.';
    }

    periodButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            setPeriod(button.dataset.pricingPeriod);
        });
    });
})();
