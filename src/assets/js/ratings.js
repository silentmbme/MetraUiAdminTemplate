(function () {
    'use strict';
    const ratings = new Map();
    if (typeof window.raterJs !== 'function') return;
    document.querySelectorAll('[data-rating-widget]').forEach(element => {
        const max = Number(element.dataset.max);
        const step = Number(element.dataset.step);
        const readonly = element.dataset.readonly === 'true';
        const feedback = document.getElementById(element.id + '-feedback');
        const update = value => {
            if (!readonly) {
                element.setAttribute('aria-valuenow', String(value));
                element.setAttribute('aria-valuetext', value + ' out of ' + max);
                feedback.textContent = value ? 'Your rating: ' + value + ' / ' + max : 'Select a rating to get started.';
            }
        };
        const instance = window.raterJs({
            element, max, step, readOnly: readonly,
            rating: Number(element.dataset.rating),
            starSize: Number(element.dataset.size),
            showToolTip: true,
            ratingText: '{rating} out of {maxRating}',
            rateCallback: function (value, done) { this.setRating(value); update(value); done(); }
        });
        ratings.set(element.id, { instance, update });
        update(Number(element.dataset.rating));
        if (!readonly) element.addEventListener('keydown', event => {
            if (!['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const current = Number(element.getAttribute('aria-valuenow'));
            const value = event.key === 'Home' ? 0 : event.key === 'End' ? max : Math.max(0, Math.min(max, Math.round((current + (['ArrowRight', 'ArrowUp'].includes(event.key) ? step : -step)) * 10) / 10));
            instance.setRating(value);
            update(value);
        });
    });
    document.querySelectorAll('[data-reset-rating]').forEach(button => button.addEventListener('click', () => {
        const rating = ratings.get(button.dataset.resetRating);
        rating.instance.clear();
        rating.update(0);
    }));
    document.querySelectorAll('[name="rating-sentiment"]').forEach(input => input.addEventListener('change', () => {
        document.getElementById('sentiment-feedback').textContent = 'Your response: ' + input.value + '.';
    }));
    document.getElementById('rating-review-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const rating = Number(document.getElementById('rating-review').getAttribute('aria-valuenow'));
        const feedback = document.getElementById('review-feedback');
        const comment = document.getElementById('rating-review-comment');
        if (!rating) { feedback.textContent = 'Select a star rating before submitting.'; document.getElementById('rating-review').focus(); return; }
        if (!comment.value.trim()) { feedback.textContent = 'Add a short review before submitting.'; comment.focus(); return; }
        feedback.textContent = 'Demo review received with a rating of ' + rating + ' out of 5. Your feedback is not stored.';
    });
})();
