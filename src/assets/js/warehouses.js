(() => {
  "use strict";

  const inventory = [
    {
      name: "Linen Table Set",
      sku: "HOM-LIN-104",
      warehouse: "West Coast Hub",
      onHand: 42,
      reserved: 8,
      available: 34,
      minimum: 20,
    },
    {
      name: "Arc Ceramic Lamp",
      sku: "HOM-LGT-228",
      warehouse: "West Coast Hub",
      onHand: 16,
      reserved: 5,
      available: 11,
      minimum: 18,
    },
    {
      name: "TrailBlaze Runners",
      sku: "SPT-RUN-038",
      warehouse: "East Coast Fulfillment",
      onHand: 86,
      reserved: 21,
      available: 65,
      minimum: 25,
    },
    {
      name: "Stoneware Mug Pair",
      sku: "KIT-MUG-516",
      warehouse: "Central Distribution",
      onHand: 12,
      reserved: 4,
      available: 8,
      minimum: 16,
    },
    {
      name: "Everyday Tote",
      sku: "ACC-TOT-092",
      warehouse: "East Coast Fulfillment",
      onHand: 58,
      reserved: 9,
      available: 49,
      minimum: 20,
    },
    {
      name: "Desk Organizer",
      sku: "OFF-ORG-301",
      warehouse: "Returns Center",
      onHand: 24,
      reserved: 6,
      available: 18,
      minimum: 12,
    },
    {
      name: "Wool Throw Blanket",
      sku: "HOM-THR-145",
      warehouse: "Central Distribution",
      onHand: 9,
      reserved: 3,
      available: 6,
      minimum: 15,
    },
    {
      name: "Pour-over Coffee Set",
      sku: "KIT-COF-422",
      warehouse: "West Coast Hub",
      onHand: 37,
      reserved: 11,
      available: 26,
      minimum: 14,
    },
  ];

  const body = document.getElementById("warehouse-stock-body");
  const search = document.getElementById("warehouse-stock-search");
  const locationFilter = document.getElementById("warehouse-location-filter");
  const stockFilter = document.getElementById("warehouse-stock-filter");
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[character])
    );

  function renderInventory() {
    const query = search.value.trim().toLowerCase();
    const selectedLocation = locationFilter.value;
    const selectedStock = stockFilter.value;
    const rows = inventory.filter((item) => {
      const lowStock = item.available <= item.minimum;
      return (
        `${item.name} ${item.sku}`.toLowerCase().includes(query) &&
        (!selectedLocation || item.warehouse === selectedLocation) &&
        (!selectedStock || (selectedStock === "low" ? lowStock : !lowStock))
      );
    });

    body.innerHTML =
      rows
        .map((item) => {
          const lowStock = item.available <= item.minimum;
          const percent = Math.min(
            100,
            Math.round((item.available / (item.minimum * 3)) * 100)
          );
          const statusClass = lowStock ? "warning" : "success";
          const statusText = lowStock ? "Low stock" : "Healthy";
          return `<tr>
        <td><span class="fw-semibold">${escapeHtml(item.name)}</span></td>
        <td class="text-muted">${escapeHtml(item.sku)}</td>
        <td>${escapeHtml(item.warehouse)}</td>
        <td>${item.onHand}</td><td class="text-muted">${
            item.reserved
          }</td><td class="fw-semibold">${item.available}</td>
        <td><div class="warehouse-stock-state"><span class="badge bg-${statusClass}-transparent text-${statusClass}">${statusText}</span><div class="progress"><div class="progress-bar bg-${statusClass}" style="width:${percent}%"></div></div></div></td>
      </tr>`;
        })
        .join("") ||
      '<tr><td colspan="7" class="text-center text-muted py-5">No inventory matches these filters.</td></tr>';
    document.getElementById(
      "warehouse-stock-results"
    ).textContent = `Showing ${rows.length} of ${inventory.length} products`;
  }

  [search, locationFilter, stockFilter].forEach((control) => {
    control.addEventListener(
      control === search ? "input" : "change",
      renderInventory
    );
  });

  document
    .getElementById("add-warehouse-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("new-warehouse-name").value.trim();
      const location = document
        .getElementById("new-warehouse-location")
        .value.trim();
      const capacity = Number(
        document.getElementById("new-warehouse-capacity").value
      );
      if (!name || !location || capacity < 1) return;

      const id = `WH-${String(
        document.querySelectorAll(".warehouse-location-card").length + 1
      ).padStart(3, "0")}`;
      const card = document.createElement("div");
      card.className = "col-xxl-3 col-md-6";
      card.innerHTML = `<article class="card custom-card warehouse-location-card"><div class="card-body"><div class="d-flex align-items-start justify-content-between"><span class="warehouse-location-icon bg-primary-transparent text-primary"><i class="ri-building-line"></i></span><span class="badge bg-success-transparent text-success">Operational</span></div><h3>${escapeHtml(
        name
      )}</h3><p><i class="ri-map-pin-line me-1"></i>${escapeHtml(
        location
      ) } <span>&middot; ${id}</span></p><div class="warehouse-capacity"><div class="d-flex justify-content-between"><span>Capacity used</span><strong>0%</strong></div><div class="progress"><div class="progress-bar bg-primary" style="width:0%"></div></div><small>0 of ${capacity.toLocaleString()} units</small></div><div class="warehouse-location-footer"><span><i class="ri-box-3-line me-1"></i>0 SKUs</span><span><i class="ri-time-line me-1"></i>Added just now</span></div></div></article>`;
      document.getElementById("warehouse-location-cards").append(card);
      document.getElementById("warehouse-location-count").textContent =
        document.querySelectorAll(".warehouse-location-card").length;
      if (
        ![...locationFilter.options].some((option) => option.value === name)
      ) {
        locationFilter.add(new Option(name, name));
      }
      event.currentTarget.reset();
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("add-warehouse-modal")
      ).hide();
      document.getElementById(
        "warehouse-feedback"
      ).textContent = `${name} was added. This demo location is not saved to a server.`;
    });

  renderInventory();
})();
