(() => {
  "use strict";

  const dateAfter = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(12, 0, 0, 0);
    return date;
  };
  const opportunities = [
    {
      id: "OP-1048",
      name: "Annual platform renewal",
      company: "Acme Studio",
      stage: "Negotiation",
      owner: "Alex Morgan",
      closeDate: dateAfter(8),
      probability: 75,
      amount: 24800,
    },
    {
      id: "OP-1047",
      name: "Customer experience suite",
      company: "Helio Systems",
      stage: "Proposal",
      owner: "Jamie Lee",
      closeDate: dateAfter(18),
      probability: 55,
      amount: 18750,
    },
    {
      id: "OP-1046",
      name: "Regional expansion",
      company: "Northstar Labs",
      stage: "Qualification",
      owner: "Riley Chen",
      closeDate: dateAfter(42),
      probability: 30,
      amount: 32600,
    },
    {
      id: "OP-1045",
      name: "Analytics implementation",
      company: "Circooles",
      stage: "Closing",
      owner: "Alex Morgan",
      closeDate: dateAfter(5),
      probability: 90,
      amount: 14200,
    },
    {
      id: "OP-1044",
      name: "Enterprise support plan",
      company: "Catalog",
      stage: "Proposal",
      owner: "Jordan Blake",
      closeDate: dateAfter(28),
      probability: 60,
      amount: 9600,
    },
    {
      id: "OP-1043",
      name: "Workflow automation",
      company: "Layers Inc.",
      stage: "Negotiation",
      owner: "Jamie Lee",
      closeDate: dateAfter(35),
      probability: 70,
      amount: 21800,
    },
    {
      id: "OP-1042",
      name: "Data migration services",
      company: "Sisyphus Group",
      stage: "Qualification",
      owner: "Riley Chen",
      closeDate: dateAfter(52),
      probability: 25,
      amount: 12400,
    },
  ];
  const ownerImages = {
    "Alex Morgan": "1.jpg",
    "Jamie Lee": "2.jpg",
    "Riley Chen": "3.jpg",
    "Jordan Blake": "4.jpg",
  };

  const body = document.getElementById("opportunity-table-body");
  const search = document.getElementById("opportunity-search");
  const stageFilter = document.getElementById("opportunity-stage-filter");
  const form = document.getElementById("opportunity-form");
  const modalElement = document.getElementById("opportunity-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  const readableDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const inputDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
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

  function filteredOpportunities() {
    const query = search.value.trim().toLowerCase();
    return opportunities.filter(
      (item) =>
        `${item.name} ${item.company} ${item.owner}`
          .toLowerCase()
          .includes(query) &&
        (!stageFilter.value || item.stage === stageFilter.value)
    );
  }

  function render() {
    const visible = filteredOpportunities();
    const stageColor = {
      Qualification: "info",
      Proposal: "secondary",
      Negotiation: "warning",
      Closing: "success",
    };
    body.innerHTML =
      visible
        .map((item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const closeDay = new Date(item.closeDate);
          closeDay.setHours(0, 0, 0, 0);
          const daysLeft = Math.round((closeDay - today) / 86400000);
          const closeLabel = daysLeft < 0
            ? `${Math.abs(daysLeft)} days overdue`
            : daysLeft === 0
              ? "Due today"
              : `${daysLeft} days left`;
          const ownerImage = ownerImages[item.owner] || "1.jpg";
          const stageSlug = item.stage.toLowerCase().replace(/[^a-z]+/g, "-");
          const weightedValue = (item.amount * item.probability) / 100;

          return `<div class="col-xl-4 col-md-6">
            <article class="card custom-card crm-opportunity-item stage-${stageSlug} h-100">
              <div class="card-body">
                <div class="crm-opportunity-card-heading">
                  <span class="crm-opportunity-id">${escapeHtml(item.id)}</span>
                  <span class="badge bg-${stageColor[item.stage]}-transparent text-${stageColor[item.stage]}">${escapeHtml(item.stage)}</span>
                </div>
                <h3 class="crm-opportunity-name">${escapeHtml(item.name)}</h3>
                <p class="crm-opportunity-company"><i class="ri-building-line me-1"></i>${escapeHtml(item.company)}</p>
                <div class="crm-opportunity-value-panel">
                  <div><span>Deal value</span><strong>${money(item.amount)}</strong></div>
                  <div><span>Weighted forecast</span><strong>${money(weightedValue)}</strong></div>
                </div>
                <div class="crm-opportunity-probability">
                  <div class="d-flex align-items-center justify-content-between mb-1"><span>Win probability</span><strong>${item.probability}%</strong></div>
                  <div class="progress"><div class="progress-bar bg-${stageColor[item.stage]}" role="progressbar" aria-label="Win probability" aria-valuenow="${item.probability}" aria-valuemin="0" aria-valuemax="100" style="width:${item.probability}%"></div></div>
                </div>
                <div class="crm-opportunity-card-footer">
                  <div class="crm-opportunity-owner"><span class="avatar avatar-sm avatar-rounded"><img src="../assets/images/users/${ownerImage}" alt="" aria-hidden="true"></span><span><small>Owner</small><strong>${escapeHtml(item.owner)}</strong></span></div>
                  <div class="crm-opportunity-close ${daysLeft <= 7 ? "is-soon" : ""}"><small>Expected close</small><strong>${readableDate(item.closeDate)}</strong><span>${closeLabel}</span></div>
                  <button type="button" class="btn btn-sm btn-light" data-edit-opportunity="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.name)}"><i class="ri-edit-line" aria-hidden="true"></i></button>
                </div>
              </div>
            </article>
          </div>`;
        })
        .join("") ||
      '<div class="col-12"><div class="text-center text-muted py-5">No opportunities match your filters.</div></div>';

    const total = opportunities.reduce((sum, item) => sum + item.amount, 0);
    const weighted = opportunities.reduce(
      (sum, item) => sum + (item.amount * item.probability) / 100,
      0
    );
    const now = new Date();
    const inThirtyDays = new Date(now.getTime() + 30 * 86400000);
    document.getElementById("opportunity-count").textContent =
      opportunities.length;
    document.getElementById("opportunity-value").textContent = money(total);
    document.getElementById("opportunity-weighted").textContent =
      money(weighted);
    document.getElementById("opportunity-closing").textContent =
      opportunities.filter(
        (item) => item.closeDate >= now && item.closeDate <= inThirtyDays
      ).length;
    document.getElementById("opportunity-filtered-count").textContent =
      visible.length;
    document.getElementById(
      "opportunity-results"
    ).textContent = `Showing ${visible.length} of ${opportunities.length} opportunities`;
  }

  function openForm(item = null) {
    document.getElementById("opportunity-modal-title").textContent = item
      ? "Edit opportunity"
      : "New opportunity";
    document.getElementById("opportunity-id").value = item?.id || "";
    document.getElementById("opportunity-name").value = item?.name || "";
    document.getElementById("opportunity-company").value = item?.company || "";
    document.getElementById("opportunity-owner").value =
      item?.owner || "Alex Morgan";
    document.getElementById("opportunity-stage").value =
      item?.stage || "Qualification";
    document.getElementById("opportunity-probability").value =
      item?.probability ?? 40;
    document.getElementById("opportunity-close-date").value = inputDate(
      item?.closeDate || dateAfter(30)
    );
    document.getElementById("opportunity-amount").value = item?.amount || "";
    if (item) modal.show();
  }

  document
    .getElementById("new-opportunity-button")
    .addEventListener("click", () => openForm());
  body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-opportunity]");
    if (!button) return;
    const item = opportunities.find(
      (opportunity) => opportunity.id === button.dataset.editOpportunity
    );
    if (item) openForm(item);
  });
  [search, stageFilter].forEach((control) =>
    control.addEventListener(control === search ? "input" : "change", render)
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const id = document.getElementById("opportunity-id").value;
    const record = {
      name: document.getElementById("opportunity-name").value.trim(),
      company: document.getElementById("opportunity-company").value.trim(),
      owner: document.getElementById("opportunity-owner").value,
      stage: document.getElementById("opportunity-stage").value,
      probability: Number(
        document.getElementById("opportunity-probability").value
      ),
      closeDate: new Date(
        `${document.getElementById("opportunity-close-date").value}T12:00:00`
      ),
      amount: Number(document.getElementById("opportunity-amount").value),
    };
    if (id)
      Object.assign(
        opportunities.find((item) => item.id === id),
        record
      );
    else {
      const nextId =
        Math.max(
          ...opportunities.map((item) => Number(item.id.replace("OP-", "")))
        ) + 1;
      opportunities.unshift({ id: `OP-${nextId}`, ...record });
    }
    modal.hide();
    render();
    document.getElementById("opportunity-feedback").textContent = `${
      record.name
    } was ${
      id ? "updated" : "added"
    }. Demo changes last for this page session.`;
  });

  render();
})();
