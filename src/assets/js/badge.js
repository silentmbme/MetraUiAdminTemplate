(() => {
 const tags = document.getElementById('badge-tags');
 if (!tags) return;
 const initial = tags.innerHTML;
 const feedback = document.getElementById('badge-feedback');
 tags.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-tag]');
  if (!button) return;
  const label = button.parentElement.textContent.trim();
  const next = button.parentElement.nextElementSibling?.querySelector('button') || button.parentElement.previousElementSibling?.querySelector('button');
  button.parentElement.remove();
  (next || document.getElementById('reset-badge-tags')).focus();
  feedback.textContent = label + ' tag removed.';
 });
 document.getElementById('reset-badge-tags').addEventListener('click', () => { tags.innerHTML = initial; feedback.textContent = 'Tags restored.'; });
 document.querySelectorAll('[data-badge-demo]').forEach(button => button.addEventListener('click', () => { feedback.textContent = button.dataset.badgeDemo; }));
})();
