(function () {
  "use strict";

  const customers = [
    {
      id: "C-1001",
      name: "John Doe",
      avatar: "../assets/images/users/9.jpg",
      status: "Active",
      joined: "Jan 15, 2025",
      email: "john.doe@example.com",
      orders: 18,
      spend: 1248,
      location: "New York, US",
    },
    {
      id: "C-1002",
      name: "Jane Smith",
      avatar: "../assets/images/users/1.jpg",
      status: "Blocked",
      joined: "Feb 03, 2025",
      email: "jane.smith@example.com",
      orders: 12,
      spend: 840,
      location: "London, UK",
    },
    {
      id: "C-1003",
      name: "Michael Brown",
      avatar: "../assets/images/users/10.jpg",
      status: "Active",
      joined: "Mar 10, 2025",
      email: "michael.brown@example.com",
      orders: 7,
      spend: 420,
      location: "Toronto, CA",
    },
    {
      id: "C-1004",
      name: "Emily White",
      avatar: "../assets/images/users/2.jpg",
      status: "Active",
      joined: "Mar 12, 2025",
      email: "emily.white@example.com",
      orders: 5,
      spend: 375,
      location: "Sydney, AU",
    },
    {
      id: "C-1005",
      name: "Chris Johnson",
      avatar: "../assets/images/users/11.jpg",
      status: "Active",
      joined: "Jan 25, 2025",
      email: "chris.johnson@example.com",
      orders: 9,
      spend: 690,
      location: "Chicago, US",
    },
    {
      id: "C-1006",
      name: "Sarah Lee",
      avatar: "../assets/images/users/3.jpg",
      status: "Blocked",
      joined: "Feb 14, 2025",
      email: "sarah.lee@example.com",
      orders: 16,
      spend: 1280,
      location: "Singapore, SG",
    },
    {
      id: "C-1007",
      name: "David Green",
      avatar: "../assets/images/users/13.jpg",
      status: "Active",
      joined: "Mar 17, 2025",
      email: "david.green@example.com",
      orders: 13,
      spend: 950,
      location: "Austin, US",
    },
    {
      id: "C-1008",
      name: "Olivia Davis",
      avatar: "../assets/images/users/4.jpg",
      status: "Active",
      joined: "Feb 22, 2025",
      email: "olivia.davis@example.com",
      orders: 4,
      spend: 310,
      location: "Dublin, IE",
    },
    {
      id: "C-1009",
      name: "James Wilson",
      avatar: "../assets/images/users/14.jpg",
      status: "Active",
      joined: "Mar 05, 2025",
      email: "james.wilson@example.com",
      orders: 8,
      spend: 520,
      location: "Berlin, DE",
    },
    {
      id: "C-1010",
      name: "Sophia Martinez",
      avatar: "../assets/images/users/5.jpg",
      status: "Blocked",
      joined: "Jan 30, 2025",
      email: "sophia.martinez@example.com",
      orders: 3,
      spend: 220,
      location: "Madrid, ES",
    },
  ];

  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");
  const gridRoot = document.getElementById("customers-list");
  let nextCustomerNumber = 1011;
  const money = (amount) =>
    `$${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const gridRows = (rows) =>
    rows.map((customer) => [
      customer.id,
      JSON.stringify({
        name: customer.name,
        avatar: customer.avatar,
        email: customer.email,
        location: customer.location,
      }),
      customer.orders,
      customer.spend,
      customer.status,
      customer.joined,
      customer.location,
      customer.id,
    ]);

  function updateMetrics() {
    const active = customers.filter(
      (customer) => customer.status === "Active"
    ).length;
    const blocked = customers.length - active;
    const average =
      customers.reduce((total, customer) => total + customer.spend, 0) /
      Math.max(customers.length, 1);
    const metricValues = {
      "customer-count": customers.length,
      "active-customer-count": active,
      "blocked-customer-count": blocked,
      "customer-average-spend": money(average),
      "customer-directory-count": customers.length,
    };
    Object.entries(metricValues).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  const grid = new gridjs.Grid({
    columns: [
      {
        id: "select-customer",
        name: "",
        width: "42px",
        sort: false,
        formatter: (id) =>
          gridjs.html(
            `<input class="form-check-input" type="checkbox" aria-label="Select ${id}">`
          ),
      },
      {
        name: "Customer",
        width: "270px",
        formatter: (cell) => {
          const customer = JSON.parse(cell);
          return gridjs.html(`
            <div class="customer-profile-cell">
              <span class="avatar avatar-md avatar-rounded">
                <img src="${customer.avatar}" alt="">
              </span>
              <span>
                <strong>${customer.name}</strong>
                <small>${customer.email}</small>
              </span>
            </div>
          `);
        },
      },
      {
        name: "Orders",
        width: "100px",
        formatter: (cell) =>
          gridjs.html(
            `<span class="customer-orders-count">${cell}<small>orders</small></span>`
          ),
      },
      {
        name: "Lifetime spend",
        width: "140px",
        formatter: (cell) =>
          gridjs.html(
            `<strong class="customer-spend-value">${money(cell)}</strong>`
          ),
      },
      {
        name: "Account status",
        width: "145px",
        formatter: (cell) => {
          const badgeClass =
            cell === "Active"
              ? "bg-success-transparent text-success"
              : "bg-danger-transparent text-danger";
          return gridjs.html(
            `<span class="badge ${badgeClass} d-inline-flex align-items-center gap-1"><i class="ri-circle-fill fs-7" aria-hidden="true"></i>${cell}</span>`
          );
        },
      },
      { name: "Joined", width: "130px" },
      { name: "Location", width: "140px" },
      {
        id: "customer-actions",
        name: "",
        width: "56px",
        sort: false,
        formatter: (_, row) => {
          const id = row.cells[0].data;
          const customer = customers.find((record) => record.id === id);
          const actionText =
            customer?.status === "Blocked"
              ? "Activate account"
              : "Block account";
          return gridjs.html(`
            <div class="dropdown text-end">
              <button
                class="btn btn-icon btn-sm btn-light customer-action-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Actions for ${id}"
              >
                <i class="ri-more-2-fill"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    class="dropdown-item customer-toggle-status"
                    type="button"
                    data-customer-id="${id}"
                  >
                    <i class="ri-user-settings-line me-2"></i>${actionText}
                  </button>
                </li>
                <li>
                  <button
                    class="dropdown-item text-danger customer-delete"
                    type="button"
                    data-customer-id="${id}"
                  >
                    <i class="ri-delete-bin-line me-2"></i>Delete customer
                  </button>
                </li>
              </ul>
            </div>
          `);
        },
      },
    ],
    data: gridRows(customers),
    pagination: { limit: 8 },
    search: false,
    sort: true,
    language: { noRecordsFound: "No customers match these filters" },
  }).render(gridRoot);

  function getFilteredCustomers() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value.toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch =
        `${customer.name} ${customer.email} ${customer.location} ${customer.id}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        !status || status === "all" || customer.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }

  function renderCustomers() {
    const filteredCustomers = getFilteredCustomers();
    grid.updateConfig({ data: gridRows(filteredCustomers) }).forceRender();
    const visibleCount = document.getElementById("customer-visible-count");
    if (visibleCount) {
      visibleCount.textContent = `${filteredCustomers.length} ${filteredCustomers.length === 1 ? "customer" : "customers"} shown`;
    }
  }

  searchInput.addEventListener("input", renderCustomers);
  statusFilter.addEventListener("change", renderCustomers);

  document
    .getElementById("customers-export-csv")
    .addEventListener("click", () => {
      const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
      const rows = [
        [
          "Customer ID",
          "Name",
          "Email",
          "Location",
          "Orders",
          "Lifetime spend",
          "Status",
          "Joined",
        ],
        ...getFilteredCustomers().map((customer) => [
          customer.id,
          customer.name,
          customer.email,
          customer.location,
          customer.orders,
          money(customer.spend),
          customer.status,
          customer.joined,
        ]),
      ];
      const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "customers.csv";
      link.click();
      URL.revokeObjectURL(url);
    });

  document
    .getElementById("add-customer-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("customer-name").value.trim();
      const email = document.getElementById("customer-email").value.trim();
      if (
        customers.some(
          (customer) => customer.email.toLowerCase() === email.toLowerCase()
        )
      ) {
        Swal.fire({
          icon: "info",
          title: "Customer already exists",
          text: "A customer with this email is already in the directory.",
        });
        return;
      }
      const joinedValue = document.getElementById("joiningDate").value;
      const joined = joinedValue
        ? new Date(`${joinedValue}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
      customers.unshift({
        id: `C-${nextCustomerNumber++}`,
        name,
        avatar: "../assets/images/users/1.jpg",
        status: document.getElementById("customer-status").value,
        joined,
        email,
        orders: 0,
        spend: 0,
        location:
          document.getElementById("customer-location").value.trim() || "Not provided",
      });
      renderCustomers();
      updateMetrics();
      event.target.reset();
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("addtask")
      ).hide();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Customer added",
        showConfirmButton: false,
        timer: 1800,
      });
    });

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".customer-toggle-status");
    const remove = event.target.closest(".customer-delete");
    if (toggle) {
      const customer = customers.find(
        (record) => record.id === toggle.dataset.customerId
      );
      if (!customer) return;
      customer.status = customer.status === "Active" ? "Blocked" : "Active";
      renderCustomers();
      updateMetrics();
    }
    if (remove) {
      const id = remove.dataset.customerId;
      Swal.fire({
        title: "Delete customer?",
        text: "This customer will be removed from the directory.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#d33",
      }).then((result) => {
        if (!result.isConfirmed) return;
        const index = customers.findIndex((customer) => customer.id === id);
        if (index !== -1) customers.splice(index, 1);
        renderCustomers();
        updateMetrics();
      });
    }
  });

  updateMetrics();
})();
