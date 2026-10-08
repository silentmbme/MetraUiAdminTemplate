(() => {
  "use strict";

  const sellers = [
    {
      name: "Northstar Supply",
      email: "hello@northstarsupply.com",
      category: "Home & Living",
      products: 128,
      sales: 12840,
      rating: 4.9,
      status: "Active",
      joined: "Jan 12, 2025",
      avatar: "1.jpg",
    },
    {
      name: "Willow & Thread",
      email: "team@willowthread.com",
      category: "Apparel",
      products: 86,
      sales: 9340,
      rating: 4.8,
      status: "Active",
      joined: "Feb 03, 2025",
      avatar: "2.jpg",
    },
    {
      name: "Aperture Studio",
      email: "care@aperture.studio",
      category: "Electronics",
      products: 54,
      sales: 7860,
      rating: 4.7,
      status: "Active",
      joined: "Feb 18, 2025",
      avatar: "3.jpg",
    },
    {
      name: "Good Earth Market",
      email: "orders@goodearth.market",
      category: "Wellness",
      products: 73,
      sales: 6420,
      rating: 4.6,
      status: "Pending",
      joined: "Mar 04, 2025",
      avatar: "4.jpg",
    },
    {
      name: "Forma Objects",
      email: "studio@formaobjects.com",
      category: "Home & Living",
      products: 41,
      sales: 5840,
      rating: 4.8,
      status: "Active",
      joined: "Mar 11, 2025",
      avatar: "5.jpg",
    },
    {
      name: "Peak Motion",
      email: "support@peakmotion.co",
      category: "Sports",
      products: 62,
      sales: 4320,
      rating: 4.5,
      status: "Active",
      joined: "Apr 02, 2025",
      avatar: "6.jpg",
    },
    {
      name: "Paper Folk",
      email: "hello@paperfolk.co",
      category: "Stationery",
      products: 29,
      sales: 1260,
      rating: 4.4,
      status: "Paused",
      joined: "Apr 18, 2025",
      avatar: "7.jpg",
    },
    {
      name: "Cove Botanics",
      email: "team@covebotanics.com",
      category: "Wellness",
      products: 35,
      sales: 740,
      rating: 0,
      status: "Pending",
      joined: "May 06, 2025",
      avatar: "8.jpg",
    },
  ];

  const body = document.getElementById("seller-table-body");
  const search = document.getElementById("seller-search");
  const statusFilter = document.getElementById("seller-status-filter");
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
  const formatSales = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  function renderSellers() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const filteredSellers = sellers.filter((seller) => {
      const matchesSearch = `${seller.name} ${seller.email} ${seller.category}`
        .toLowerCase()
        .includes(query);
      return (
        matchesSearch && (!selectedStatus || seller.status === selectedStatus)
      );
    });

    body.innerHTML =
      filteredSellers
        .map((seller) => {
          const statusClass =
            seller.status === "Active"
              ? "success"
              : seller.status === "Pending"
              ? "warning"
              : "secondary";
          const rating = seller.rating
            ? `<span class="seller-rating"><i class="ri-star-fill" aria-hidden="true"></i>${seller.rating.toFixed(
                1
              )}</span>`
            : '<span class="text-muted">New seller</span>';
          return `<tr>
        <td><div class="seller-identity"><img src="../assets/images/users/${escapeHtml(
          seller.avatar
        )}" alt="" loading="lazy" /><div><span class="fw-semibold d-block">${escapeHtml(
            seller.name
          )}</span><span class="text-muted fs-12">${escapeHtml(
            seller.email
          )}</span></div></div></td>
        <td>${escapeHtml(seller.category)}</td><td>${
            seller.products
          }</td><td class="fw-semibold">${formatSales(
            seller.sales
          )}</td><td>${rating}</td>
        <td><span class="badge bg-${statusClass}-transparent text-${statusClass}"><span class="seller-status-dot"></span>${
            seller.status
          }</span></td>
        <td class="text-end text-muted">${escapeHtml(seller.joined)}</td>
      </tr>`;
        })
        .join("") ||
      '<tr><td colspan="7" class="text-center text-muted py-5">No sellers match these filters.</td></tr>';

    document.getElementById("seller-count").textContent =
      filteredSellers.length;
    document.getElementById(
      "seller-results"
    ).textContent = `Showing ${filteredSellers.length} of ${sellers.length} sellers`;
    document.getElementById("seller-total").textContent = sellers.length;
    document.getElementById("seller-active").textContent = sellers.filter(
      (seller) => seller.status === "Active"
    ).length;
    document.getElementById("seller-active-total").textContent = sellers.length;
    document.getElementById("seller-pending").textContent = sellers.filter(
      (seller) => seller.status === "Pending"
    ).length;
  }

  search.addEventListener("input", renderSellers);
  statusFilter.addEventListener("change", renderSellers);
  document
    .getElementById("add-seller-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("new-seller-name").value.trim();
      const email = document.getElementById("new-seller-email").value.trim();
      const category = document
        .getElementById("new-seller-category")
        .value.trim();
      if (!name || !email || !category) return;

      sellers.unshift({
        name,
        email,
        category,
        products: 0,
        sales: 0,
        rating: 0,
        status: "Pending",
        joined: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        avatar: "1.jpg",
      });
      event.currentTarget.reset();
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("add-seller-modal")
      ).hide();
      search.value = "";
      statusFilter.value = "";
      renderSellers();
      document.getElementById(
        "seller-feedback"
      ).textContent = `${name} was added to the directory with pending status.`;
    });

  renderSellers();
})();
