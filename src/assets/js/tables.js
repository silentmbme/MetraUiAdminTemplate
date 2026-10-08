(function () {
  'use strict';
  const selectAll = document.getElementById('table-select-all');
  const checkboxes = [...document.querySelectorAll('[data-table-select]')];
  function updateSelection() {
    const count = checkboxes.filter((input) => input.checked).length;
    if (selectAll) {
      selectAll.checked = count === checkboxes.length;
      selectAll.indeterminate = count > 0 && count < checkboxes.length;
    }
    const status = document.getElementById('table-selection-status');
    if (status) status.textContent = count + ' selected';
  }
  selectAll?.addEventListener('change', () => {
    checkboxes.forEach((input) => (input.checked = selectAll.checked));
    updateSelection();
  });
  checkboxes.forEach((input) => input.addEventListener('change', updateSelection));
  const search = document.getElementById('table-project-search');
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('#table-search-results tbody tr').forEach((row) => {
      const visible = row.textContent.toLowerCase().includes(query);
      row.hidden = !visible;
      row.style.display = visible ? '' : 'none';
      if (visible) count++;
    });
    document.getElementById('table-search-status').textContent = count
      ? count + ' projects'
      : 'No matching projects';
  });
})();
