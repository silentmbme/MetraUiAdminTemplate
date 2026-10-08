(() => {
 const feedback = document.getElementById('button-group-feedback');
 if (!feedback) return;
 document.querySelectorAll('[data-group-demo]').forEach(button => button.addEventListener('click', () => { feedback.textContent = (button.getAttribute('aria-label') || button.textContent.trim()) + ' action selected.'; }));
 document.querySelectorAll('.btn-check').forEach(input => input.addEventListener('change', () => {
  const selected = [...document.querySelectorAll('.btn-check')].filter(item => item.name === input.name && item.checked).map(item => document.querySelector('label[for="' + item.id + '"]').textContent);
  feedback.textContent = (input.type === 'radio' ? 'Selection: ' : 'Filters: ') + (selected.join(', ') || 'None');
 }));
})();
