(() => {
  "use strict";

  const tbody = document.getElementById("fleet-vehicle-table");
  const search = document.getElementById("fleet-vehicle-search");
  const statusFilter = document.getElementById("fleet-status-filter");
  const count = document.getElementById("fleet-vehicle-count");
  const emptyState = document.getElementById("fleet-vehicle-empty");
  const form = document.getElementById("fleet-vehicle-form");
  const exportButton = document.querySelector("[data-fleet-export]");
  if (!tbody || !search || !statusFilter || !count) return;

  const getRows = () => Array.from(tbody.querySelectorAll("tr[data-status]"));

  function filterVehicles() {
    const query = search.value.trim().toLowerCase();
    const status = statusFilter.value;
    let visible = 0;

    getRows().forEach((row) => {
      const matchesQuery = row.textContent.toLowerCase().includes(query);
      const matchesStatus = !status || row.dataset.status === status;
      row.hidden = !matchesQuery || !matchesStatus;
      if (!row.hidden) visible += 1;
    });

    const total = Number(count.dataset.total) || getRows().length;
    count.textContent = `Showing ${visible} of ${total} vehicles`;
    if (emptyState) emptyState.hidden = visible > 0;
  }

  search.addEventListener("input", filterVehicles);
  statusFilter.addEventListener("change", filterVehicles);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const name = document.getElementById("fleet-vehicle-name").value.trim();
    const id = document.getElementById("fleet-vehicle-id").value.trim();
    const model = document.getElementById("fleet-vehicle-model").value.trim();
    const driver = document.getElementById("fleet-driver-name").value.trim();
    const route = document.getElementById("fleet-vehicle-route").value.trim();
    const fuel = Math.min(100, Math.max(0, Number(document.getElementById("fleet-vehicle-fuel").value)));
    const status = document.getElementById("fleet-vehicle-status").value;
    const row = document.createElement("tr");
    row.dataset.status = status;

    const makeCell = (className, text) => {
      const cell = document.createElement("td");
      if (className) cell.className = className;
      cell.textContent = text;
      return cell;
    };

    const vehicleCell = document.createElement("td");
    const vehicleName = document.createElement("div");
    vehicleName.className = "fw-semibold";
    vehicleName.textContent = `${name} · ${id}`;
    const modelText = document.createElement("span");
    modelText.className = "text-muted fs-12";
    modelText.textContent = model;
    vehicleCell.append(vehicleName, modelText);

    const fuelCell = document.createElement("td");
    const fuelLayout = document.createElement("div");
    fuelLayout.className = "d-flex align-items-center gap-2";
    const progress = document.createElement("div");
    progress.className = "progress flex-fill";
    progress.style.cssText = "height: 5px; min-width: 42px";
    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${fuel >= 50 ? "bg-success" : "bg-warning"}`;
    progressBar.style.width = `${fuel}%`;
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuenow", String(fuel));
    progressBar.setAttribute("aria-valuemin", "0");
    progressBar.setAttribute("aria-valuemax", "100");
    progress.append(progressBar);
    const fuelText = document.createElement("span");
    fuelText.className = "fs-12";
    fuelText.textContent = `${fuel}%`;
    fuelLayout.append(progress, fuelText);
    fuelCell.append(fuelLayout);

    const badgeClass = {
      Available: "bg-success-transparent text-success",
      "On route": "bg-primary-transparent text-primary",
      Loading: "bg-warning-transparent text-warning",
      "In service": "bg-danger-transparent text-danger",
    }[status] || "bg-light text-default";
    const badge = document.createElement("span");
    badge.className = `badge ${badgeClass}`;
    badge.textContent = status;
    const statusCell = document.createElement("td");
    statusCell.append(badge);

    const actionCell = document.createElement("td");
    const actionLink = document.createElement("a");
    actionLink.href = status === "Available" ? "route-planning.html" : "delivery-tracking.html";
    actionLink.className = "btn btn-sm btn-light";
    actionLink.setAttribute("aria-label", `Open ${name} details`);
    actionLink.innerHTML = '<i class="ri-arrow-right-up-line" aria-hidden="true"></i>';
    actionCell.append(actionLink);

    row.append(
      vehicleCell,
      makeCell("", driver),
      makeCell("", route),
      fuelCell,
      statusCell,
      actionCell
    );
    tbody.append(row);
    count.dataset.total = String((Number(count.dataset.total) || 0) + 1);
    form.reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("fleet-vehicle-modal")).hide();
    filterVehicles();
  });

  exportButton?.addEventListener("click", () => {
    const rows = getRows().filter((row) => !row.hidden);
    const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [
      ["Vehicle", "Driver", "Route", "Fuel", "Status"],
      ...rows.map((row) => [
        row.cells[0].innerText.replace(/\s+/g, " ").trim(),
        row.cells[1].innerText.trim(),
        row.cells[2].innerText.replace(/\s+/g, " ").trim(),
        row.cells[3].innerText.trim(),
        row.cells[4].innerText.trim(),
      ]),
    ]
      .map((line) => line.map(quote).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fleet-roster.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  filterVehicles();
})();
