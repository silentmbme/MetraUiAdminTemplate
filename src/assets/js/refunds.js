(() => {
  "use strict";

  const requests = [
    {
      id: "RF-2084",
      order: "ORD-8421",
      customer: "Olivia Wilson",
      email: "olivia.wilson@example.com",
      item: "Linen Table Set",
      reason: "Item arrived damaged",
      date: "May 18, 2025",
      amount: 248,
      status: "Pending",
    },
    {
      id: "RF-2083",
      order: "ORD-8415",
      customer: "James Taylor",
      email: "james.taylor@example.com",
      item: "TrailBlaze Runners",
      reason: "Wrong size",
      date: "May 17, 2025",
      amount: 126.5,
      status: "Pending",
    },
    {
      id: "RF-2082",
      order: "ORD-8408",
      customer: "Ava Martinez",
      email: "ava.martinez@example.com",
      item: "Arc Ceramic Lamp",
      reason: "No longer needed",
      date: "May 16, 2025",
      amount: 384,
      status: "Pending",
    },
    {
      id: "RF-2081",
      order: "ORD-8396",
      customer: "Noah Thompson",
      email: "noah.thompson@example.com",
      item: "Stoneware Mug Pair",
      reason: "Item arrived damaged",
      date: "May 15, 2025",
      amount: 92,
      status: "Pending",
    },
    {
      id: "RF-2079",
      order: "ORD-8374",
      customer: "Sophia Chen",
      email: "sophia.chen@example.com",
      item: "Everyday Tote",
      reason: "Not as described",
      date: "May 14, 2025",
      amount: 64,
      status: "Approved",
    },
    {
      id: "RF-2076",
      order: "ORD-8350",
      customer: "Liam Anderson",
      email: "liam.anderson@example.com",
      item: "Desk Organizer",
      reason: "Wrong item received",
      date: "May 12, 2025",
      amount: 118,
      status: "Approved",
    },
    {
      id: "RF-2071",
      order: "ORD-8312",
      customer: "Mia Robinson",
      email: "mia.robinson@example.com",
      item: "Wool Throw Blanket",
      reason: "Outside return window",
      date: "May 10, 2025",
      amount: 175,
      status: "Declined",
    },
    {
      id: "RF-2068",
      order: "ORD-8290",
      customer: "Ethan Lee",
      email: "ethan.lee@example.com",
      item: "Pour-over Coffee Set",
      reason: "Changed mind",
      date: "May 08, 2025",
      amount: 76.5,
      status: "Approved",
    },
  ];

  const body = document.getElementById("refund-table-body");
  const search = document.getElementById("refund-search");
  const statusFilter = document.getElementById("refund-status-filter");
  const modalElement = document.getElementById("refund-review-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  let selectedRequest = null;

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
      minimumFractionDigits: 2,
    }).format(amount);

  function renderRequests() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const filteredRequests = requests.filter((request) => {
      const searchableText =
        `${request.id} ${request.order} ${request.customer} ${request.item} ${request.reason}`.toLowerCase();
      return (
        searchableText.includes(query) &&
        (!selectedStatus || request.status === selectedStatus)
      );
    });

    body.innerHTML =
      filteredRequests
        .map((request) => {
          const statusColor = {
            Pending: "warning",
            Approved: "success",
            Declined: "secondary",
          }[request.status];
          const reviewButton =
            request.status === "Pending"
              ? `<button class="btn btn-sm btn-light" type="button" data-review-id="${escapeHtml(
                  request.id
                )}">Review<i class="ri-arrow-right-s-line ms-1" aria-hidden="true"></i></button>`
              : `<span class="text-success fs-12">Reviewed</span>`;
          return `<tr>
        <td><span class="fw-semibold d-block">${escapeHtml(
          request.order
        )}</span><small class="text-muted">${escapeHtml(
            request.item
          )}</small></td>
        <td><span class="fw-medium d-block">${escapeHtml(
          request.customer
        )}</span><small class="text-muted">${escapeHtml(
            request.email
          )}</small></td>
        <td>${escapeHtml(request.reason)}</td><td>${escapeHtml(
            request.date
          )}</td><td class="fw-semibold">${formatMoney(request.amount)}</td>
        <td><span class="badge bg-${statusColor}-transparent text-${statusColor}"><span class="refund-status-dot"></span>${
            request.status
          }</span></td>
        <td class="text-end">${reviewButton}</td>
      </tr>`;
        })
        .join("") ||
      '<tr><td colspan="7" class="text-center text-muted py-5">No refund requests match these filters.</td></tr>';

    document.getElementById("refund-table-count").textContent =
      filteredRequests.length;
    document.getElementById(
      "refund-results"
    ).textContent = `Showing ${filteredRequests.length} of ${requests.length} requests`;
    document.getElementById("refund-pending-count").textContent =
      requests.filter((request) => request.status === "Pending").length;
  }

  function openReview(request) {
    selectedRequest = request;
    document.getElementById(
      "refund-review-order"
    ).textContent = `${request.id} · Order ${request.order}`;
    document.getElementById("refund-review-customer").textContent =
      request.customer;
    document.getElementById("refund-review-item").textContent = request.item;
    document.getElementById("refund-review-reason").textContent =
      request.reason;
    document.getElementById("refund-review-amount").textContent = formatMoney(
      request.amount
    );
    modal.show();
  }

  function updateSelectedStatus(status) {
    if (!selectedRequest) return;
    selectedRequest.status = status;
    const requestId = selectedRequest.id;
    selectedRequest = null;
    modal.hide();
    renderRequests();
    document.getElementById(
      "refund-feedback"
    ).textContent = `${requestId} marked ${status.toLowerCase()}. The change is only stored for this page session.`;
  }

  body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-id]");
    if (!button) return;
    const request = requests.find(
      (item) => item.id === button.dataset.reviewId
    );
    if (request) openReview(request);
  });
  search.addEventListener("input", renderRequests);
  statusFilter.addEventListener("change", renderRequests);
  document
    .getElementById("refund-approve-button")
    .addEventListener("click", () => updateSelectedStatus("Approved"));
  document
    .getElementById("refund-decline-button")
    .addEventListener("click", () => updateSelectedStatus("Declined"));

  renderRequests();
})();
