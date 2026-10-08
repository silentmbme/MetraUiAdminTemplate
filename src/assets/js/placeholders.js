(function () {
    'use strict';
    const button = document.getElementById('placeholder-demo-toggle');
    if (!button) return;
    const loading = document.getElementById('placeholder-demo-loading');
    const content = document.getElementById('placeholder-demo-content');
    const status = document.getElementById('placeholder-demo-status');
    button.addEventListener('click', () => {
        const showContent = content.classList.contains('d-none');
        loading.classList.toggle('d-none', showContent);
        loading.setAttribute('aria-busy', String(!showContent));
        content.classList.toggle('d-none', !showContent);
        button.textContent = showContent ? 'Show loading skeleton' : 'Show loaded content';
        status.textContent = showContent ? 'Project content is ready.' : 'Skeleton preview is visible.';
    });
})();
