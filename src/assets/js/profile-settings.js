(() => {
  'use strict';

  const storageKey = 'metra-profile-settings';
  const profileForm = document.getElementById('profile-settings-form');
  const passwordForm = document.getElementById('profile-password-form');
  const notificationSave = document.getElementById('settings-save-notifications');
  const photoInput = document.getElementById('settings-photo-input');
  const photoRemove = document.getElementById('settings-photo-remove');
  const avatarImages = [
    document.getElementById('settings-avatar-preview'),
    document.getElementById('settings-photo-preview')
  ].filter(Boolean);
  const defaultPhoto = avatarImages[0]?.getAttribute('src') || '';
  let objectUrl = '';

  const readSettings = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  };

  const announce = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('text-danger', isError);
    element.classList.toggle('text-success', !isError);
  };

  const saveControls = (selector, key) => {
    const values = {};
    document.querySelectorAll(selector).forEach((control) => {
      values[control.id] = control.type === 'checkbox' ? control.checked : control.value;
    });
    const settings = readSettings();
    settings[key] = values;
    localStorage.setItem(storageKey, JSON.stringify(settings));
  };

  const restoreControls = (selector, values = {}) => {
    Object.entries(values).forEach(([id, value]) => {
      const control = document.getElementById(id);
      if (!control) return;
      if (control.type === 'checkbox') control.checked = Boolean(value);
      else control.value = value;
    });
  };

  const stored = readSettings();
  restoreControls('#profile-settings-form [name]', stored.profile);
  restoreControls('#settings-two-step, #settings-login-alerts', stored.security);
  restoreControls('#settings-in-app, #settings-email, #settings-push, #settings-projects, #settings-mentions, #settings-security-alerts', stored.notifications);

  const bio = document.getElementById('profile-bio');
  const bioCount = document.getElementById('profile-bio-count');
  const updateBioCount = () => {
    if (bio && bioCount) bioCount.textContent = String(bio.value.length);
  };
  bio?.addEventListener('input', updateBioCount);
  updateBioCount();

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      announce(document.getElementById('profile-settings-feedback'), 'Choose a JPG, PNG, or WebP image under 5 MB.', true);
      photoInput.value = '';
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    avatarImages.forEach((image) => { image.src = objectUrl; });
  });

  photoRemove?.addEventListener('click', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    photoInput.value = '';
    avatarImages.forEach((image) => { image.src = defaultPhoto; });
  });

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!profileForm.reportValidity()) return;
    saveControls('#profile-settings-form [name]', 'profile');
    const settings = readSettings();
    localStorage.setItem(storageKey, JSON.stringify(settings));
    const name = document.getElementById('profile-user-name')?.value.trim();
    const designation = document.getElementById('profile-designation')?.value.trim();
    const identity = document.querySelector('.settings-identity');
    if (identity) {
      const title = identity.querySelector('h2');
      const role = identity.querySelector('div > span');
      if (title) title.textContent = name || 'Your name';
      if (role) role.textContent = designation || 'Team member';
    }
    announce(document.getElementById('profile-settings-feedback'), 'Profile details saved on this device.');
  });

  profileForm?.addEventListener('reset', () => {
    window.setTimeout(() => {
      updateBioCount();
      avatarImages.forEach((image) => { image.src = defaultPhoto; });
      photoInput.value = '';
      announce(document.getElementById('profile-settings-feedback'), 'Unsaved changes discarded.');
    }, 0);
  });

  document.querySelectorAll('.settings-password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordTarget);
      if (!input) return;
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} ${input.id.includes('confirm') ? 'confirmed' : 'new'} password`);
      const icon = button.querySelector('i');
      if (icon) icon.className = reveal ? 'ri-eye-off-line' : 'ri-eye-line';
    });
  });

  passwordForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = document.getElementById('profile-new-password');
    const confirmation = document.getElementById('profile-confirm-password');
    const feedback = document.getElementById('profile-password-feedback');
    if (!password?.value || !confirmation?.value) return;
    if (password.value !== confirmation.value) {
      confirmation.setCustomValidity('Passwords do not match.');
      confirmation.reportValidity();
      announce(feedback, 'The passwords do not match. Please check both fields.', true);
      confirmation.addEventListener('input', () => confirmation.setCustomValidity(''), { once: true });
      return;
    }
    announce(feedback, 'Password updated for this session demo.');
    passwordForm.reset();
  });

  document.querySelectorAll('#settings-two-step, #settings-login-alerts').forEach((control) => {
    control.addEventListener('change', () => saveControls('#settings-two-step, #settings-login-alerts', 'security'));
  });

  notificationSave?.addEventListener('click', () => {
    saveControls('#settings-in-app, #settings-email, #settings-push, #settings-projects, #settings-mentions, #settings-security-alerts', 'notifications');
    announce(document.getElementById('settings-notification-feedback'), 'Notification preferences saved on this device.');
  });

  document.getElementById('settings-deactivate')?.addEventListener('click', () => {
    const confirmed = window.confirm('Account deactivation must be completed by your workspace administrator. Would you like to continue to the support page?');
    if (confirmed) window.location.href = 'support-dashboard.html';
  });
})();
