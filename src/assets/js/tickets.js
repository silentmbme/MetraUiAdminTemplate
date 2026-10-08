(() => {
  const searchInput = document.querySelector("#ticket-search");
  const statusFilter = document.querySelector("#ticket-status");
  const priorityFilter = document.querySelector("#ticket-priority");
  const resetButton = document.querySelector("#ticket-reset");
  const tableBody = document.querySelector("#ticket-rows");
  const countLabel = document.querySelector("#ticket-count");

  if (!searchInput || !statusFilter || !priorityFilter || !resetButton || !tableBody || !countLabel) {
    return;
  }

  const ticketRows = Array.from(tableBody.querySelectorAll("tr[data-status]"));
  const emptyRow = document.createElement("tr");
  emptyRow.innerHTML = '<td colspan="8" class="text-center text-muted py-5">No tickets match these filters.</td>';
  emptyRow.hidden = true;
  tableBody.append(emptyRow);

  const filterTickets = () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;
    let visibleCount = 0;

    ticketRows.forEach((row) => {
      const matchesSearch = row.textContent.toLowerCase().includes(query);
      const matchesStatus = !selectedStatus || row.dataset.status === selectedStatus;
      const matchesPriority = !selectedPriority || row.dataset.priority === selectedPriority;
      const isVisible = matchesSearch && matchesStatus && matchesPriority;

      row.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    emptyRow.hidden = visibleCount > 0;
    countLabel.textContent = `Showing ${visibleCount} of ${ticketRows.length} sample tickets`;
  };

  searchInput.addEventListener("input", filterTickets);
  statusFilter.addEventListener("change", filterTickets);
  priorityFilter.addEventListener("change", filterTickets);
  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";
    filterTickets();
    searchInput.focus();
  });
})();
