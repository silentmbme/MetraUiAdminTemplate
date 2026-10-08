(function () {
  'use strict';

  const table = document.querySelector('#staff-directory-table');
  const searchInput = document.querySelector('#staff-search');
  const departmentFilter = document.querySelector('#staff-department-filter');
  const statusFilter = document.querySelector('#staff-status-filter');
  const clearButton = document.querySelector('#staff-clear-filters');
  const resultCount = document.querySelector('#staff-result-count');
  const noResultsRow = document.querySelector('#staff-no-results');

  if (
    !table ||
    !searchInput ||
    !departmentFilter ||
    !statusFilter ||
    !clearButton ||
    !resultCount ||
    !noResultsRow
  ) {
    return;
  }

  const staffRows = Array.from(table.tBodies[0].rows).filter(
    (row) => row.id !== 'staff-no-results',
  );

  function filterStaff() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedStatus = statusFilter.value;
    let visibleCount = 0;

    staffRows.forEach((row) => {
      const matchesSearch = row.textContent.toLowerCase().includes(searchTerm);
      const matchesDepartment =
        !selectedDepartment || row.dataset.department === selectedDepartment;
      const matchesStatus = !selectedStatus || row.dataset.status === selectedStatus;
      const isVisible = matchesSearch && matchesDepartment && matchesStatus;

      row.hidden = !isVisible;
      visibleCount += Number(isVisible);
    });

    noResultsRow.hidden = visibleCount > 0;
    resultCount.textContent = `${visibleCount} team member${visibleCount === 1 ? '' : 's'}`;
  }

  searchInput.addEventListener('input', filterStaff);
  departmentFilter.addEventListener('change', filterStaff);
  statusFilter.addEventListener('change', filterStaff);

  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    departmentFilter.value = '';
    statusFilter.value = '';
    filterStaff();
    searchInput.focus();
  });
})();
