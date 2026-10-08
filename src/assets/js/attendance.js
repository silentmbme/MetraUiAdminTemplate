(() => {
  const search = document.querySelector("#attendance-search");
  const statusFilter = document.querySelector("#attendance-status-filter");
  const resetButton = document.querySelector("#attendance-reset-filter");
  const table = document.querySelector(".hrm-attendance-log-card table");
  const visibleCount = document.querySelector("#attendance-visible-count");
  const noResults = document.querySelector("#attendance-no-results");

  if (!search || !statusFilter || !resetButton || !table) return;

  const rows = Array.from(table.tBodies[0].rows).filter((row) => row.id !== "attendance-no-results");
  const filterRows = () => {
    const query = search.value.trim().toLowerCase();
    const status = statusFilter.value;
    let count = 0;

    rows.forEach((row) => {
      const matchesQuery = row.textContent.toLowerCase().includes(query);
      const matchesStatus = !status || row.dataset.attendanceStatus === status;
      row.hidden = !(matchesQuery && matchesStatus);
      if (!row.hidden) count += 1;
    });

    if (visibleCount) visibleCount.textContent = count;
    if (noResults) noResults.hidden = count > 0;
  };

  search.addEventListener("input", filterRows);
  statusFilter.addEventListener("change", filterRows);
  resetButton.addEventListener("click", () => {
    search.value = "";
    statusFilter.value = "";
    filterRows();
    search.focus();
  });
})();
