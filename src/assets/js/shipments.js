(() => {
  "use strict";

  const tbody = document.getElementById("shipment-table-body");
  const search = document.getElementById("shipment-search");
  const statusFilter = document.getElementById("shipment-status-filter");
  const count = document.getElementById("shipment-table-count");
  const form = document.getElementById("shipment-create-form");
  if (!tbody || !search || !statusFilter || !count) return;

  const emptyRow = document.createElement("tr");
  emptyRow.hidden = true;
  emptyRow.innerHTML = '<td colspan="6" class="text-center text-muted py-4">No shipments match your search.</td>';
  tbody.append(emptyRow);

  const getRows = () => Array.from(tbody.querySelectorAll("tr[data-status]"));

  function filterShipments() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    let visible = 0;

    getRows().forEach((row) => {
      const matchesText = row.textContent.toLowerCase().includes(query);
      const matchesStatus = !selectedStatus || row.dataset.status === selectedStatus;
      row.hidden = !matchesText || !matchesStatus;
      if (!row.hidden) visible += 1;
    });

    emptyRow.hidden = visible > 0;
    const total = Number(count.dataset.total) || getRows().length;
    count.textContent = `Showing ${visible} of ${total.toLocaleString()} shipments`;
  }

  search.addEventListener("input", filterShipments);
  statusFilter.addEventListener("change", filterShipments);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const order = document.getElementById("shipment-order").value.trim();
    const carrier = document.getElementById("shipment-carrier").value;
    const pickupDate = document.getElementById("shipment-pickup").value;
    const destination = document.getElementById("shipment-destination").value.trim();
    const nextId = 20482 + getRows().length;
    const shipmentId = `SHP-${nextId}`;
    const formattedDate = new Date(`${pickupDate}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const row = document.createElement("tr");
    row.dataset.status = "Preparing";

    const shipmentCell = document.createElement("td");
    const shipmentLink = document.createElement("a");
    shipmentLink.href = "delivery-tracking.html";
    shipmentLink.className = "fw-semibold";
    shipmentLink.textContent = shipmentId;
    const orderText = document.createElement("div");
    orderText.className = "text-muted fs-12";
    orderText.textContent = `${order} · 1 item`;
    shipmentCell.append(shipmentLink, orderText);

    const destinationCell = document.createElement("td");
    destinationCell.textContent = destination;
    const carrierCell = document.createElement("td");
    carrierCell.textContent = carrier;
    const dateCell = document.createElement("td");
    dateCell.textContent = formattedDate;
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = "badge bg-warning-transparent text-warning";
    statusBadge.textContent = "Preparing";
    statusCell.append(statusBadge);
    const actionCell = document.createElement("td");
    const trackLink = document.createElement("a");
    trackLink.href = "delivery-tracking.html";
    trackLink.className = "btn btn-sm btn-light";
    trackLink.setAttribute("aria-label", `Track ${shipmentId}`);
    trackLink.innerHTML = '<i class="ri-arrow-right-up-line" aria-hidden="true"></i>';
    actionCell.append(trackLink);

    row.append(shipmentCell, destinationCell, carrierCell, dateCell, statusCell, actionCell);
    tbody.insertBefore(row, emptyRow);
    form.reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("newShipmentModal")).hide();
    filterShipments();
  });

  filterShipments();
})();
