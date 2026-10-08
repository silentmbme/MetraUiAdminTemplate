(() => {
  "use strict";

  const purchaseOrders = [
    {
      id: "PO-2025-041",
      supplier: "Brightline Home Co.",
      warehouse: "West Coast Hub",
      created: "May 18, 2025",
      expected: "May 26, 2025",
      items: 12,
      total: 4280,
      status: "In transit",
    },
    {
      id: "PO-2025-040",
      supplier: "Northstar Textiles",
      warehouse: "Central Distribution",
      created: "May 17, 2025",
      expected: "May 24, 2025",
      items: 8,
      total: 3160,
      status: "Ordered",
    },
    {
      id: "PO-2025-039",
      supplier: "Forma Objects Ltd.",
      warehouse: "East Coast Fulfillment",
      created: "May 15, 2025",
      expected: "May 22, 2025",
      items: 6,
      total: 1840,
      status: "In transit",
    },
    {
      id: "PO-2025-038",
      supplier: "Peak Motion Supply",
      warehouse: "West Coast Hub",
      created: "May 12, 2025",
      expected: "May 20, 2025",
      items: 15,
      total: 5920,
      status: "Ordered",
    },
    {
      id: "PO-2025-037",
      supplier: "Good Earth Wholesale",
      warehouse: "Returns Center",
      created: "May 10, 2025",
      expected: "May 18, 2025",
      items: 9,
      total: 2475,
      status: "Received",
    },
    {
      id: "PO-2025-036",
      supplier: "Paper Folk Studio",
      warehouse: "East Coast Fulfillment",
      created: "May 08, 2025",
      expected: "May 21, 2025",
      items: 5,
      total: 960,
      status: "Draft",
    },
  ];

  const body = document.getElementById("purchase-order-body");
  const search = document.getElementById("po-search");
  const statusFilter = document.getElementById("po-status-filter");
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
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

  function renderOrders() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const filteredOrders = purchaseOrders.filter((order) => {
      const searchableText =
        `${order.id} ${order.supplier} ${order.warehouse}`.toLowerCase();
      return (
        searchableText.includes(query) &&
        (!selectedStatus || order.status === selectedStatus)
      );
    });

    body.innerHTML =
      filteredOrders
        .map((order) => {
          const color = {
            Draft: "secondary",
            Ordered: "primary",
            "In transit": "warning",
            Received: "success",
          }[order.status];
          const action =
            order.status === "In transit"
              ? `<button class="btn btn-sm btn-light" type="button" data-receive-po="${escapeHtml(
                  order.id
                )}"><i class="ri-checkbox-circle-line me-1" aria-hidden="true"></i>Receive</button>`
              : '<span class="text-muted fs-12">—</span>';
          return `<tr>
        <td><span class="fw-semibold d-block">${escapeHtml(
          order.id
        )}</span><small class="text-muted">Purchase order</small></td>
        <td>${escapeHtml(order.supplier)}</td><td>${escapeHtml(
            order.warehouse
          )}</td><td>${escapeHtml(order.created)}</td><td>${escapeHtml(
            order.expected
          )}</td>
        <td>${
          order.items
        } <span class="text-muted">SKUs</span></td><td class="fw-semibold">${formatMoney(
            order.total
          )}</td>
        <td><span class="badge bg-${color}-transparent text-${color}"><span class="po-status-dot"></span>${
            order.status
          }</span></td><td class="text-end">${action}</td>
      </tr>`;
        })
        .join("") ||
      '<tr><td colspan="9" class="text-center text-muted py-5">No purchase orders match your filters.</td></tr>';

    const openOrders = purchaseOrders.filter((order) =>
      ["Ordered", "In transit"].includes(order.status)
    );
    document.getElementById("po-open-count").textContent = openOrders.length;
    document.getElementById("po-transit-count").textContent =
      purchaseOrders.filter((order) => order.status === "In transit").length;
    document.getElementById("po-spend").textContent = formatMoney(
      openOrders.reduce((total, order) => total + order.total, 0)
    );
    document.getElementById("po-count").textContent = filteredOrders.length;
    document.getElementById(
      "po-results"
    ).textContent = `Showing ${filteredOrders.length} of ${purchaseOrders.length} purchase orders`;
  }

  body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-receive-po]");
    if (!button) return;
    const order = purchaseOrders.find(
      (item) => item.id === button.dataset.receivePo
    );
    if (!order) return;
    order.status = "Received";
    renderOrders();
    document.getElementById(
      "po-feedback"
    ).textContent = `${order.id} marked as received. Inventory receipt is a demo action.`;
  });

  [search, statusFilter].forEach((control) =>
    control.addEventListener(
      control === search ? "input" : "change",
      renderOrders
    )
  );

  document
    .getElementById("create-po-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const supplier = document.getElementById("po-supplier").value.trim();
      const warehouse = document.getElementById("po-warehouse").value;
      const expectedInput = document.getElementById("po-expected-date").value;
      const items = Number(document.getElementById("po-item-count").value);
      const total = Number(document.getElementById("po-total").value);
      if (!supplier || !expectedInput || items < 1 || total <= 0) return;
      const expected = new Date(`${expectedInput}T00:00:00`).toLocaleDateString(
        "en-US",
        { month: "short", day: "2-digit", year: "numeric" }
      );
      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const nextNumber = 42 + purchaseOrders.length - 6;
      const order = {
        id: `PO-2025-${String(nextNumber).padStart(3, "0")}`,
        supplier,
        warehouse,
        created: today,
        expected,
        items,
        total,
        status: "Ordered",
      };
      purchaseOrders.unshift(order);
      event.currentTarget.reset();
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("create-po-modal")
      ).hide();
      search.value = "";
      statusFilter.value = "";
      renderOrders();
      document.getElementById(
        "po-feedback"
      ).textContent = `${order.id} for ${supplier} was created in this demo.`;
    });

  document.getElementById("po-export-button").addEventListener("click", () => {
    const rows = purchaseOrders.filter((order) => {
      const query = search.value.trim().toLowerCase();
      return (
        `${order.id} ${order.supplier} ${order.warehouse}`
          .toLowerCase()
          .includes(query) &&
        (!statusFilter.value || order.status === statusFilter.value)
      );
    });
    const csv = [
      [
        "Purchase order",
        "Supplier",
        "Warehouse",
        "Created",
        "Expected",
        "Items",
        "Total USD",
        "Status",
      ],
      ...rows.map((order) => [
        order.id,
        order.supplier,
        order.warehouse,
        order.created,
        order.expected,
        order.items,
        order.total,
        order.status,
      ]),
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "purchase-orders.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById(
      "po-feedback"
    ).textContent = `Exported ${rows.length} purchase orders.`;
  });

  renderOrders();
})();
