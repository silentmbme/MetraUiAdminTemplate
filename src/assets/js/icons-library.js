(function () {
  'use strict';
  const search = document.getElementById('icon-search');
  if (!search) return;
  const library = document.getElementById('icon-library');
  const mode = document.getElementById('icon-copy-mode');
  const status = document.getElementById('icon-copy-status');
  const fallback = document.getElementById('icon-copy-fallback');
  const sections = [...document.querySelectorAll('[data-icon-section]')];
  const filter = () => {
    const query = search.value.trim().toLowerCase(); let total = 0;
    sections.forEach(section => {
      let visible = 0;
      section.querySelectorAll('[data-icon-class]').forEach(button => {
        const matches = (library.value === 'all' || section.dataset.iconSection === library.value) && button.dataset.iconClass.toLowerCase().includes(query);
        button.hidden = !matches; if (matches) visible++;
      });
      section.hidden = !visible; total += visible;
      const countLabel = section.querySelector('[data-icon-count]');
      if (countLabel) countLabel.textContent = visible + ' icons';
    });
    document.getElementById('icon-results').textContent = total + ' icons available';
    document.getElementById('icon-empty').hidden = total !== 0;
  };
  search.addEventListener('input', filter); library.addEventListener('change', filter);
  document.getElementById('icon-clear').addEventListener('click', () => { search.value = ''; library.value = 'all'; filter(); search.focus(); });
  document.querySelectorAll('[data-icon-class]').forEach(button => button.addEventListener('click', async () => {
    const className = button.dataset.iconClass;
    const value = mode.value === 'markup' ? '<i class="' + className + '" aria-hidden="true"></i>' : className;
    fallback.hidden = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      status.textContent = 'Copied ' + className;
    } catch {
      fallback.value = value; fallback.hidden = false; fallback.focus(); fallback.select();
      status.textContent = 'Select and copy the text below.';
    }
  }));
  filter();
})();
