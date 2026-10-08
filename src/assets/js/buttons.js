(() => {
 const feedback = document.getElementById('button-example-feedback');
 if (!feedback) return;
 document.querySelectorAll('[data-button-example]').forEach(button => button.addEventListener('click', () => { feedback.textContent = (button.getAttribute('aria-label') || button.textContent.trim()) + ' button selected.'; }));
 const loading = document.getElementById('button-loading-demo');
 loading.addEventListener('click', () => {
  loading.disabled = true;
  loading.setAttribute('aria-busy', 'true');
  loading.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing...';
  feedback.textContent = 'Loading preview started.';
  setTimeout(() => { loading.disabled = false; loading.removeAttribute('aria-busy'); loading.textContent = 'Preview loading'; feedback.textContent = 'Loading preview complete.'; }, 2000);
 });
})();
