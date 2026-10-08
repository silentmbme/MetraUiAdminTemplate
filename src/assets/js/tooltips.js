(() => {
 const button = document.getElementById('tooltip-preview');
 if (!button) return;
 let preview, timer;
 button.addEventListener('click', () => {
  const input = document.getElementById('tooltip-text');
  if (!input.value.trim()) { input.focus(); return; }
  clearTimeout(timer); preview?.dispose();
  preview = new bootstrap.Tooltip(button, {title: input.value.trim(), trigger:'manual', container:'body'});
  preview.show(); timer = setTimeout(() => preview.hide(), 4000);
 });
 document.addEventListener('keydown', event => { if (event.key !== 'Escape') return; clearTimeout(timer); preview?.hide(); document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => bootstrap.Tooltip.getInstance(element)?.hide()); });
 window.addEventListener('pagehide', () => { clearTimeout(timer); preview?.dispose(); });
})();
