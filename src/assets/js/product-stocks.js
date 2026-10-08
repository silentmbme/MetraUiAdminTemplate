(() => {
  "use strict";

  const products = [
    {
      name: "Linen Table Set",
      sku: "HOM-LIN-104",
      location: "West Coast Hub",
      onHand: 42,
      reserved: 8,
      reorderAt: 20,
    },
    {
      name: "Arc Ceramic Lamp",
      sku: "HOM-LGT-228",
      location: "West Coast Hub",
      onHand: 16,
      reserved: 5,
      reorderAt: 18,
    },
    {
      name: "TrailBlaze Runners",
      sku: "SPT-RUN-038",
      location: "East Coast Fulfillment",
      onHand: 86,
      reserved: 21,
      reorderAt: 25,
    },
    {
      name: "Stoneware Mug Pair",
      sku: "KIT-MUG-516",
      location: "Central Distribution",
      onHand: 12,
      reserved: 4,
      reorderAt: 16,
    },
    {
      name: "Everyday Tote",
      sku: "ACC-TOT-092",
      location: "East Coast Fulfillment",
      onHand: 58,
      reserved: 9,
      reorderAt: 20,
    },
    {
      name: "Desk Organizer",
      sku: "OFF-ORG-301",
      location: "Returns Center",
      onHand: 24,
      reserved: 6,
      reorderAt: 12,
    },
    {
      name: "Wool Throw Blanket",
      sku: "HOM-THR-145",
      location: "Central Distribution",
      onHand: 9,
      reserved: 3,
      reorderAt: 15,
    },
    {
      name: "Pour-over Coffee Set",
      sku: "KIT-COF-422",
      location: "West Coast Hub",
      onHand: 37,
      reserved: 11,
      reorderAt: 14,
    },
    {
      name: "Canvas Weekender",
      sku: "ACC-BAG-610",
      location: "East Coast Fulfillment",
      onHand: 0,
      reserved: 0,
      reorderAt: 12,
    },
    {
      name: "Cotton Bath Towel",
      sku: "HOM-BTH-112",
      location: "Returns Center",
      onHand: 64,
      reserved: 14,
      reorderAt: 18,
    },
  ];

  const body = document.getElementById("product-stock-body");
  const search = document.getElementById("stock-search");
  const locationFilter = document.getElementById("stock-location-filter");
  const statusFilter = document.getElementById("stock-status-filter");
  const modalElement = document.getElementById("stock-adjust-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  let activeProduct = null;

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

  function getStockStatus(product) {
    const available = Math.max(0, product.onHand - product.reserved);
    if (available === 0) return "out";
    return available <= product.reorderAt ? "low" : "healthy";
  }

  function getFilteredProducts() {
    const query = search.value.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.sku}`
        .toLowerCase()
        .includes(query);
      const matchesLocation =
        !locationFilter.value || product.location === locationFilter.value;
      const matchesStatus =
        !statusFilter.value || getStockStatus(product) === statusFilter.value;
      return matchesSearch && matchesLocation && matchesStatus;
    });
  }

  function updateSummary() {
    const availableProducts = products.map((product) => ({
      ...product,
      available: Math.max(0, product.onHand - product.reserved),
    }));
    const totalUnits = availableProducts.reduce(
      (total, product) => total + product.onHand,
      0
    );
    const lowCount = products.filter(
      (product) => getStockStatus(product) === "low"
    ).length;
    const emptyCount = products.filter(
      (product) => getStockStatus(product) === "out"
    ).length;
    document.getElementById("stock-total-units").textContent =
      totalUnits.toLocaleString();
    document.getElementById("stock-healthy-count").textContent =
      products.filter(
        (product) => getStockStatus(product) === "healthy"
      ).length;
    document.getElementById("stock-low-count").textContent = lowCount;
    document.getElementById("stock-empty-count").textContent = emptyCount;
    document.getElementById("stock-alert-count").textContent = `${
      lowCount + emptyCount
    } products`;
  }

  function renderProducts() {
    const rows = getFilteredProducts();
    body.innerHTML =
      rows
        .map((product) => {
          const available = Math.max(0, product.onHand - product.reserved);
          const status = getStockStatus(product);
          const label = {
            healthy: "In stock",
            low: "Low stock",
            out: "Out of stock",
          }[status];
          const color = { healthy: "success", low: "warning", out: "danger" }[
            status
          ];
          const width = product.reorderAt
            ? Math.min(
                100,
                Math.round((available / (product.reorderAt * 2)) * 100)
              )
            : 0;
          return `<tr>
        <td><span class="fw-semibold">${escapeHtml(
          product.name
        )}</span></td><td class="text-muted">${escapeHtml(
            product.sku
          )}</td><td>${escapeHtml(product.location)}</td>
        <td>${product.onHand}</td><td class="text-muted">${
            product.reserved
          }</td><td class="fw-semibold">${available}</td>
        <td><div class="product-stock-level"><span class="badge bg-${color}-transparent text-${color}">${label}</span><div class="progress"><div class="progress-bar bg-${color}" style="width:${width}%"></div></div><small class="text-muted">Reorder at ${
            product.reorderAt
          }</small></div></td>
        <td class="text-end"><button class="btn btn-sm btn-light" type="button" data-adjust-sku="${escapeHtml(
          product.sku
        )}"><i class="ri-edit-line me-1" aria-hidden="true"></i>Adjust</button></td>
      </tr>`;
        })
        .join("") ||
      '<tr><td colspan="8" class="text-center text-muted py-5">No products match these filters.</td></tr>';
    document.getElementById("stock-table-count").textContent = rows.length;
    document.getElementById(
      "stock-results"
    ).textContent = `Showing ${rows.length} of ${products.length} products`;
    updateSummary();
  }

  body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-adjust-sku]");
    if (!button) return;
    activeProduct = products.find(
      (product) => product.sku === button.dataset.adjustSku
    );
    if (!activeProduct) return;
    document.getElementById(
      "stock-adjust-product"
    ).textContent = `${activeProduct.name} | ${activeProduct.sku} | ${activeProduct.location}`;
    document.getElementById("stock-adjust-quantity").value =
      activeProduct.onHand;
    modal.show();
  });

  document
    .getElementById("stock-adjust-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      if (!activeProduct) return;
      const quantity = Number(
        document.getElementById("stock-adjust-quantity").value
      );
      if (!Number.isInteger(quantity) || quantity < 0) return;
      const productName = activeProduct.name;
      activeProduct.onHand = quantity;
      activeProduct = null;
      modal.hide();
      renderProducts();
      document.getElementById(
        "stock-feedback"
      ).textContent = `${productName} inventory was updated in this page session.`;
    });

  [search, locationFilter, statusFilter].forEach((control) => {
    control.addEventListener(
      control === search ? "input" : "change",
      renderProducts
    );
  });

  document.getElementById("show-low-stock").addEventListener("click", () => {
    search.value = "";
    locationFilter.value = "";
    statusFilter.value = "low";
    renderProducts();
    document
      .querySelector(".stock-catalog-card")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document
    .getElementById("stock-export-button")
    .addEventListener("click", () => {
      const rows = getFilteredProducts();
      const csv = [
        [
          "Product",
          "SKU",
          "Location",
          "On hand",
          "Reserved",
          "Available",
          "Reorder at",
          "Status",
        ],
        ...rows.map((product) => [
          product.name,
          product.sku,
          product.location,
          product.onHand,
          product.reserved,
          Math.max(0, product.onHand - product.reserved),
          product.reorderAt,
          getStockStatus(product),
        ]),
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(",")
        )
        .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8;" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "product-stock.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.getElementById(
        "stock-feedback"
      ).textContent = `Exported ${rows.length} products using the selected filters.`;
    });

  renderProducts();
})();
