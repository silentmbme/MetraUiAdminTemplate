(function () {
  "use strict";

  const search = document.getElementById("project-team-search");
  const availability = document.getElementById("project-team-availability");
  const body = document.getElementById("project-team-rows");
  const countLabel = document.getElementById("project-team-result-count");
  if (!search || !availability || !body || !countLabel) return;

  const rows = Array.from(body.querySelectorAll("tr"));
  const emptyRow = document.createElement("tr");
  emptyRow.className = "project-team-empty-row";
  emptyRow.innerHTML = '<td colspan="6"><div><i class="ri-user-search-line"></i><strong>No team members found</strong><span>Try a different name, role, workstream, or availability filter.</span></div></td>';

  function updateTeamDirectory() {
    const query = search.value.trim().toLowerCase();
    const selectedAvailability = availability.value;
    let visibleCount = 0;

    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      const matchesQuery = !query || rowText.includes(query);
      const matchesAvailability = selectedAvailability === "all" || rowText.includes(selectedAvailability);
      const isVisible = matchesQuery && matchesAvailability;
      row.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (visibleCount === 0) {
      if (!emptyRow.isConnected) body.appendChild(emptyRow);
    } else if (emptyRow.isConnected) {
      emptyRow.remove();
    }

    countLabel.textContent = `Showing ${visibleCount} of ${rows.length} members`;
  }

  search.addEventListener("input", updateTeamDirectory);
  availability.addEventListener("change", updateTeamDirectory);
})();
