(function () {
  "use strict";

  // Sample Data
  const ordersData = [
    [
      "#SPK001",
      "John Doe",
      "../assets/images/users/9.jpg",
      "$699.99",
      "Pending",
      "Pending",
      "Visa Card",
      "Jan 15, 2025, 09:45 AM",
      "john.doe@example.com",
      "AeroFlex Runner",
      "2 items",
      "../assets/images/ecommerce/png/1.png",
    ],
    [
      "#SPK002",
      "Jane Smith",
      "../assets/images/users/1.jpg",
      "$89.99",
      "Shipped",
      "Completed",
      "MasterCard",
      "Feb 3, 2025, 02:30 PM",
      "jane.smith@example.com",
      "Studio Wireless Headphones",
      "1 item",
      "../assets/images/ecommerce/png/2.png",
    ],
    [
      "#SPK003",
      "Michael Brown",
      "../assets/images/users/10.jpg",
      "$399.99",
      "Delivered",
      "Failed",
      "PayPal",
      "Mar 10, 2025, 11:15 AM",
      "michael.brown@example.com",
      "Everyday Smart Watch",
      "1 item",
      "../assets/images/ecommerce/png/3.png",
    ],
    [
      "#SPK004",
      "Emily White",
      "../assets/images/users/2.jpg",
      "$129.99",
      "Cancelled",
      "Refunded",
      "Apple Pay",
      "Apr 5, 2025, 04:00 PM",
      "emily.white@example.com",
      "Linen Weekend Tote",
      "3 items",
      "../assets/images/ecommerce/png/4.png",
    ],
    [
      "#SPK005",
      "Chris Johnson",
      "../assets/images/users/11.jpg",
      "$199.99",
      "Shipped",
      "Cancelled",
      "COD",
      "May 1, 2025, 10:30 AM",
      "chris.johnson@example.com",
      "Cloud Knit Hoodie",
      "2 items",
      "../assets/images/ecommerce/png/5.png",
    ],
    [
      "#SPK006",
      "Sarah Lee",
      "../assets/images/users/3.jpg",
      "$149.99",
      "Delivered",
      "Refunded",
      "MasterCard",
      "Jun 10, 2025, 03:45 PM",
      "sarah.lee@example.com",
      "Ceramic Pour-over Set",
      "1 item",
      "../assets/images/ecommerce/png/6.png",
    ],
    [
      "#SPK007",
      "David Green",
      "../assets/images/users/13.jpg",
      "$79.99",
      "Delivered",
      "Completed",
      "PayPal",
      "Jul 18, 2025, 01:00 PM",
      "david.green@example.com",
      "Everyday Carry Backpack",
      "1 item",
      "../assets/images/ecommerce/png/7.png",
    ],
    [
      "#SPK008",
      "Olivia Davis",
      "../assets/images/users/4.jpg",
      "$59.99",
      "Pending",
      "Pending",
      "American Express",
      "Aug 25, 2025, 12:30 PM",
      "olivia.davis@example.com",
      "Contour Water Bottle",
      "2 items",
      "../assets/images/ecommerce/png/8.png",
    ],
    [
      "#SPK009",
      "James Wilson",
      "../assets/images/users/14.jpg",
      "$59.99",
      "Cancelled",
      "Completed",
      "Visa Card",
      "Sep 5, 2025, 06:00 PM",
      "james.wilson@example.com",
      "Minimal Desk Lamp",
      "1 item",
      "../assets/images/ecommerce/png/9.png",
    ],
    [
      "#SPK010",
      "Sophia Martinez",
      "../assets/images/users/5.jpg",
      "$39.99",
      "Shipped",
      "Failed",
      "COD",
      "Oct 12, 2025, 08:15 AM",
      "sophia.martinez@example.com",
      "Everyday Cotton Cap",
      "1 item",
      "../assets/images/ecommerce/png/10.png",
    ],
  ];

  const toGridRows = (orders) =>
    orders.map((order) => [
      order[0],
      JSON.stringify({ id: order[0], date: order[7].split(",")[0] }),
      JSON.stringify({ name: order[9], count: order[10], image: order[11] }),
      JSON.stringify({ name: order[1], avatar: order[2], email: order[8] }),
      order[3],
      order[4],
      JSON.stringify({ status: order[5], method: order[6] }),
      order[0],
    ]);

  const grid = new gridjs.Grid({
    columns: [
      {
        id: "select-order",
        name: "",
        width: "48px",
        formatter: (_, row) =>
          gridjs.html(`
            <input
              class="form-check-input order-row-check"
              type="checkbox"
              id="order-${row.cells[0].data}"
              aria-label="Select order ${row.cells[0].data}"
            >
          `),
      },
      {
        name: "Order",
        width: "150px",
        formatter: (cell) => {
          const order = JSON.parse(cell);
          return gridjs.html(
            `<a href="orders-details.html">${order.id}</a><span class="orders-cell-meta">${order.date}</span>`
          );
        },
      },
      {
        name: "Item",
        width: "230px",
        formatter: (cell) => {
          const item = JSON.parse(cell);
          return gridjs.html(`
            <div class="orders-item-cell">
              <span class="orders-item-thumb">
                <img src="${item.image}" alt="">
              </span>
              <span class="orders-item-copy">
                <strong>${item.name}</strong>
                <small>${item.count}</small>
              </span>
            </div>
          `);
        },
      },
      {
        name: "Customer",
        width: "220px",
        formatter: (cell) => {
          const customer = JSON.parse(cell);
          return gridjs.html(`
            <a href="orders-details.html">
              <div class="orders-customer-cell">
                <span class="avatar avatar-sm avatar-rounded">
                  <img src="${customer.avatar}" alt="">
                </span>
                <span class="orders-customer-copy">
                  <strong>${customer.name}</strong>
                  <small>${customer.email}</small>
                </span>
              </div>
            </a>
          `);
        },
      },
      {
        name: "Total",
        width: "100px",
        formatter: (cell) =>
          gridjs.html(`<span class="orders-total">${cell}</span>`),
      },
      {
        name: "Fulfillment",
        width: "125px",
        formatter: (cell) => {
          const badgeTone = {
            Pending: "bg-warning-transparent text-warning",
            Shipped: "bg-info-transparent text-info",
            Delivered: "bg-success-transparent text-success",
            Cancelled: "bg-danger-transparent text-danger",
          }[cell] || "bg-light text-muted";
          const statusIcon = {
            Pending: "time",
            Shipped: "truck",
            Delivered: "checkbox-circle",
            Cancelled: "close-circle",
          }[cell] || "information";

          return gridjs.html(
            `<span class="badge ${badgeTone} d-inline-flex align-items-center gap-1"><i class="ri-${statusIcon}-line" aria-hidden="true"></i>${cell}</span>`
          );
        },
      },
      {
        name: "Payment",
        width: "150px",
        formatter: (cell) => {
          const payment = JSON.parse(cell);
          return gridjs.html(
            `<div class="orders-payment-cell"><span class="orders-payment-state is-${payment.status.toLowerCase()}"><i class="ri-circle-fill"></i>${
              payment.status
            }</span><small>${payment.method}</small></div>`
          );
        },
      },
      {
        id: "order-actions",
        name: "",
        width: "68px",
        formatter: (cell) =>
          gridjs.html(`
            <div class="dropdown text-end">
              <button
                class="btn btn-icon btn-sm btn-light orders-action-toggle"
                type="button"
                data-bs-toggle="dropdown"
                data-order-id="${cell}"
                aria-expanded="false"
                aria-label="Actions for order ${cell}"
              >
                <i class="ri-more-2-fill"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" href="orders-details.html">
                    <i class="ri-eye-line me-2"></i>View order
                  </a>
                </li>
                <li>
                  <a class="dropdown-item btn-delete" href="javascript:void(0);">
                    <i class="ri-delete-bin-line me-2"></i>Delete order
                  </a>
                </li>
              </ul>
            </div>
          `),
      },
    ],
    data: toGridRows(ordersData),
    pagination: true,
    search: false,
    sort: true,
  }).render(document.getElementById("orders-table"));

  // Filter functionality: event listeners for input and filter dropdowns
  document
    .getElementById("search-input")
    .addEventListener("input", (e) => applyFilters());
  document
    .getElementById("delivery-status-filter")
    .addEventListener("change", (e) => applyFilters());
  document
    .getElementById("payment-status-filter")
    .addEventListener("change", (e) => applyFilters());

  // Function to apply search and filter logic
  function applyFilters() {
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();
    const paymentstatusFilter = document.getElementById(
      "payment-status-filter"
    ).value;
    const deliverystatusFilter = document.getElementById(
      "delivery-status-filter"
    ).value;

    const filteredData = ordersData.filter((row) => {
      const searchableOrder = `${row[0]} ${row[1]} ${row[8]}`.toLowerCase();

      let deliveryStatus = "";
      if (row[4] === "Pending") {
        deliveryStatus = "pending";
      } else if (row[4] === "Shipped") {
        deliveryStatus = "shipped";
      } else if (row[4] === "Delivered") {
        deliveryStatus = "delivered";
      } else if (row[4] === "Cancelled") {
        deliveryStatus = "cancelled";
      }

      let paymentStatus = "";
      if (row[5] === "Pending") {
        paymentStatus = "pending";
      } else if (row[5] === "Completed") {
        paymentStatus = "completed";
      } else if (row[5] === "Failed") {
        paymentStatus = "failed";
      } else if (row[5] === "Refunded") {
        paymentStatus = "refunded";
      } else if (row[5] === "Cancelled") {
        paymentStatus = "cancelled";
      }

      const searchCondition = searchableOrder.includes(searchInput);
      const paymentCondition =
        paymentstatusFilter === "" ||
        paymentstatusFilter === "all" ||
        paymentStatus === paymentstatusFilter;
      const deliveryCondition =
        deliverystatusFilter === "" ||
        deliverystatusFilter === "all" ||
        deliveryStatus === deliverystatusFilter;

      return searchCondition && paymentCondition && deliveryCondition;
    });

    document.getElementById("orders-count").textContent = filteredData.length;
    document.getElementById("orders-results-summary").textContent =
      `Showing ${filteredData.length} of ${ordersData.length} orders`;

    grid
      .updateConfig({
        data: toGridRows(filteredData),
      })
      .forceRender();

    // Handle the display of the "No matches found" row
    const gridContainer = document.getElementById("orders-table");
    const tableBody = gridContainer.querySelector(".gridjs-tbody");

    // Clear previous "No matches found" row
    const notFoundElement = document.querySelector(".gridjs-notfound");
    if (notFoundElement) {
      notFoundElement.style.display = "none"; // Hide it using JavaScript
    }

    const noMatchesRow = document.getElementById("no-matches-row");
    if (noMatchesRow) {
      noMatchesRow.remove();
    }

    // If no results after filtering, create and append a "No matches found" row
    if (filteredData.length === 0) {
      const tr = document.createElement("tr");
      tr.id = "no-matches-row";

      // Create a single cell spanning all columns
      const td = document.createElement("td");
      td.colSpan = 8;
      td.style.textAlign = "center";
      td.textContent = "No matching records found";
      td.style.fontWeight = "500";
      td.style.color = "var(--theme-default-text-color)";
      td.style.padding = "12px";

      tr.appendChild(td);
      tableBody.appendChild(tr);
    }
  }

  // Export the currently visible order set as a spreadsheet-friendly CSV.
  document
    .getElementById("orders-export-csv")
    ?.addEventListener("click", () => {
      const searchInput = document
        .getElementById("search-input")
        .value.toLowerCase();
      const paymentFilter = document.getElementById(
        "payment-status-filter"
      ).value;
      const deliveryFilter = document.getElementById(
        "delivery-status-filter"
      ).value;
      const rows = ordersData.filter((row) => {
        const matchesSearch = `${row[0]} ${row[1]} ${row[8]}`
          .toLowerCase()
          .includes(searchInput);
        const matchesPayment =
          !paymentFilter ||
          paymentFilter === "all" ||
          row[5].toLowerCase() === paymentFilter;
        const matchesDelivery =
          !deliveryFilter ||
          deliveryFilter === "all" ||
          row[4].toLowerCase() === deliveryFilter;
        return matchesSearch && matchesPayment && matchesDelivery;
      });
      const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
      const csv = [
        [
          "Order ID",
          "Customer",
          "Amount",
          "Delivery status",
          "Payment status",
          "Payment method",
          "Ordered date",
          "Email",
        ],
        ...rows.map((row) => [
          row[0],
          row[1],
          row[3],
          row[4],
          row[5],
          row[6],
          row[7],
          row[8],
        ]),
      ]
        .map((row) => row.map(quote).join(","))
        .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "orders.csv";
      link.click();
      URL.revokeObjectURL(url);
    });

  // Add a listener for delete actions in the table with SweetAlert confirmation
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".btn-delete")) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          const orderId = e.target
            .closest("tr")
            ?.querySelector(".orders-action-toggle")?.dataset.orderId;
          const rowIndex = ordersData.findIndex((row) => row[0] === orderId);
          if (rowIndex === -1) return;
          ordersData.splice(rowIndex, 1);

          // Update the grid with the new data
          grid
            .updateConfig({
              data: toGridRows(ordersData),
            })
            .forceRender();

          Swal.fire("Deleted!", "Your order has been deleted.", "success");
        }
      });
    }
  });
})();
