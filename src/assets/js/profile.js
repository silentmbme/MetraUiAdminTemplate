(function () {
    'use strict';

    if (window.GLightbox && document.querySelector('.profile-gallery-item')) {
        GLightbox({ selector: '.profile-gallery-item' });
    }

    const followButton = document.querySelector('#profile-follow');
    const feedback = document.querySelector('#profile-feedback');

    followButton?.addEventListener('click', function () {
        const isFollowing = followButton.dataset.following === 'true';
        const nextState = !isFollowing;
        followButton.dataset.following = String(nextState);
        followButton.setAttribute('aria-pressed', String(nextState));
        followButton.classList.toggle('btn-light', nextState);
        followButton.classList.toggle('btn-primary-light', !nextState);
        followButton.querySelector('i').className = nextState ? 'ri-user-follow-line me-1' : 'ri-user-add-line me-1';
        followButton.querySelector('span').textContent = nextState ? 'Following' : 'Follow';

        const followerCount = document.querySelector('#profile-follower-count');
        const count = Number(followerCount.textContent.replaceAll(',', '')) || 0;
        followerCount.textContent = (count + (nextState ? 1 : -1)).toLocaleString();
        feedback.textContent = nextState ? 'Liam was added to your following list.' : 'Liam was removed from your following list.';
    });

    document.querySelector('#profile-copy-link')?.addEventListener('click', async function () {
        try {
            await navigator.clipboard.writeText(window.location.href);
            feedback.textContent = 'Profile link copied.';
        } catch (error) {
            feedback.textContent = 'Copy this profile URL from your browser address bar.';
        }
    });

    document.querySelectorAll('[data-profile-tab-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            document.querySelector(`#${button.dataset.profileTabTarget}`)?.click();
        });
    });
})();
