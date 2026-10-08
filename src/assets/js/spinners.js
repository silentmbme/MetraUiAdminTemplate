(() => {
 const start = document.getElementById('spinner-start');
 if (!start) return;
 const cancel = document.getElementById('spinner-cancel'), panel = document.getElementById('spinner-preview');
 let timer;
 const finish = message => { clearTimeout(timer); timer = undefined; panel.removeAttribute('aria-busy'); panel.textContent = message; start.disabled = false; cancel.disabled = true; };
 start.addEventListener('click', () => {
  if (timer) return;
  start.disabled = true; cancel.disabled = false; panel.setAttribute('aria-busy', 'true');
  panel.innerHTML = '<span class="spinner-border spinner-border-sm text-primary me-2" aria-hidden="true"></span>Preparing your report...';
  timer = setTimeout(() => finish('Report preview loaded successfully.'), 3000);
 });
 cancel.addEventListener('click', () => { finish('Loading cancelled. You can try again.'); start.focus(); });
 window.addEventListener('pagehide', () => clearTimeout(timer));
})();
