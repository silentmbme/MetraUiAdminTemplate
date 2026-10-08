(() => {
  "use strict";

  const grid = document.querySelector("#crm-company-grid");
  if (!grid) return;
  const seed = document.querySelector("#crm-company-seed");

  const searchInput = document.querySelector("#crm-company-search");
  const industryFilter = document.querySelector("#crm-company-industry");
  const sortSelect = document.querySelector("#crm-company-sort");
  const companyForm = document.querySelector("#crm-company-form");
  const exportButton = document.querySelector("#crm-company-export");
  const drawerContent = document.querySelector("#company-details-content");
  const emptyMessage = document.querySelector("#crm-company-empty");

  const getCards = () =>
    Array.from(grid.querySelectorAll("[data-company-card]"));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  }

  function updateSummary() {
    const cards = getCards();
    const dealCount = cards.reduce(
      (total, card) => total + (Number(card.dataset.deals) || 0),
      0
    );
    const industries = new Set(
      cards.map((card) => card.dataset.industry).filter(Boolean)
    );

    document.querySelector("#crm-company-count").textContent = cards.length;
    document.querySelector("#crm-company-deal-total").textContent =
      dealCount.toLocaleString("en-US");
    document.querySelector("#crm-company-opportunity-count").textContent =
      dealCount.toLocaleString("en-US");
    document.querySelector("#crm-industry-count").textContent = industries.size;
  }

  function populateIndustries() {
    if (!industryFilter) return;

    const currentIndustry = industryFilter.value;
    const industries = [
      ...new Set(
        getCards()
          .map((card) => card.dataset.industry)
          .filter(Boolean)
      ),
    ].sort((first, second) => first.localeCompare(second));

    industryFilter.replaceChildren(new Option("All industries", ""));
    industries.forEach((industry) =>
      industryFilter.add(new Option(industry, industry))
    );
    industryFilter.value = industries.includes(currentIndustry)
      ? currentIndustry
      : "";
  }

  function applyFilters() {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    const industry = industryFilter?.value ?? "";
    let visibleCount = 0;

    getCards().forEach((card) => {
      const searchable = `${card.dataset.name} ${card.dataset.email} ${card.dataset.contact} ${card.dataset.industry}`;
      const matchesQuery = searchable.includes(query);
      const matchesIndustry = !industry || card.dataset.industry === industry;
      card.hidden = !(matchesQuery && matchesIndustry);
      if (!card.hidden) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  }

  function sortCards() {
    const cards = getCards();
    const mode = sortSelect?.value ?? "name";

    cards.sort((first, second) => {
      if (mode === "deals") {
        return Number(second.dataset.deals) - Number(first.dataset.deals);
      }
      if (mode === "size") {
        return (
          Number.parseInt(second.dataset.size, 10) -
          Number.parseInt(first.dataset.size, 10)
        );
      }
      return first.dataset.name.localeCompare(second.dataset.name);
    });

    cards.forEach((card) => grid.append(card));
  }

  function createCompanyRow(company) {
    const card = document.createElement("tr");
    const name = escapeHtml(company.name);
    const email = escapeHtml(company.email || "Email not listed");
    const phone = escapeHtml(company.phone || "Phone not listed");
    const industry = escapeHtml(company.industry);
    const size = escapeHtml(company.size);
    const contact = escapeHtml(company.contact || "Not assigned");
    const deals = Number(company.deals) || 0;
    const logo = company.logo || "../assets/images/logos/11.png";
    const person = "../assets/images/users/1.png";

    card.className = "crm-company-row";
    card.dataset.companyCard = "";
    card.dataset.name = company.name.toLowerCase();
    card.dataset.email = company.email.toLowerCase();
    card.dataset.industry = company.industry;
    card.dataset.size = company.size;
    card.dataset.contact = company.contact.toLowerCase();
    card.dataset.phone = company.phone;
    card.dataset.deals = deals;
    card.dataset.logo = logo;
    card.dataset.person = person;
    card.dataset.notes = company.notes || "";
    card.innerHTML = `
      <td><div class="d-flex align-items-center gap-2"><img class="avatar avatar-sm crm-company-row-logo" src="${logo}" alt=""><span class="fw-medium crm-company-name">${name}</span></div></td>
      <td><span class="badge bg-light text-default">${industry}</span></td>
      <td>${size}</td>
      <td>${contact}</td>
      <td class="fw-medium">${deals.toLocaleString("en-US")}</td>
      <td><div class="d-flex justify-content-end gap-1"><button type="button" class="btn btn-sm btn-light" data-company-view aria-label="View ${name}"><i class="ri-eye-line"></i></button><button type="button" class="btn btn-sm btn-light text-danger" data-company-delete aria-label="Remove ${name}"><i class="ri-delete-bin-line"></i></button></div></td>`;

    return card;
  }

  function showCompanyDetails(card) {
    if (!drawerContent) return;

    const name = escapeHtml(card.querySelector(".crm-company-name")?.textContent ?? "Company");
    const logo = escapeHtml(card.dataset.logo);
    const industry = escapeHtml(card.dataset.industry);
    const size = escapeHtml(card.dataset.size);
    const email = escapeHtml(card.dataset.email || "Not provided");
    const phone = escapeHtml(card.dataset.phone || "Not provided");
    const contact = escapeHtml(card.dataset.contact || "Not assigned");
    const deals = (Number(card.dataset.deals) || 0).toLocaleString("en-US");
    const emailLink = card.dataset.email
      ? `<a class="btn btn-dark btn-sm" href="mailto:${email}"><i class="ri-mail-line me-1"></i>Email</a>`
      : "";
    const phoneLink = card.dataset.phone
      ? `<a class="btn btn-light btn-sm" href="tel:${card.dataset.phone.replace(/[^+\d]/g, "")}"><i class="ri-phone-line me-1"></i>Call</a>`
      : "";
    const notes = escapeHtml(
      card.dataset.notes || "No account notes added yet."
    );

    drawerContent.innerHTML = `
      <section class="crm-drawer-profile-card">
        <img src="${logo}" alt="" class="crm-drawer-avatar crm-company-drawer-logo">
        <div class="crm-drawer-profile-copy"><span class="crm-drawer-eyebrow">${industry}</span><h3>${name}</h3><p>${size}</p></div>
        <span class="badge bg-success-transparent text-success">${deals} deals</span>
      </section>
      <div class="crm-drawer-actions">${emailLink}${phoneLink}</div>
      <section class="crm-drawer-insights" aria-label="Account snapshot">
        <div><span><i class="ri-briefcase-4-line"></i> Open deals</span><strong>${deals}</strong></div>
        <div><span><i class="ri-team-line"></i> Team size</span><strong>${size}</strong></div>
        <div><span><i class="ri-user-3-line"></i> Key contact</span><strong>${contact}</strong></div>
      </section>
      <section class="crm-drawer-section"><h3>Account details</h3><div class="crm-drawer-info-grid">
        <div class="crm-drawer-info-item"><span>Industry</span><strong>${industry}</strong></div>
        <div class="crm-drawer-info-item"><span>Company email</span><strong>${email}</strong></div>
        <div class="crm-drawer-info-item"><span>Phone</span><strong>${phone}</strong></div>
      </div></section>
      <section class="crm-drawer-section crm-drawer-notes"><h3>Account notes</h3><p>${notes}</p></section>`;

    const offcanvas = window.bootstrap?.Offcanvas;
    if (offcanvas) {
      offcanvas
        .getOrCreateInstance(document.querySelector("#company-details-panel"))
        .show();
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  industryFilter?.addEventListener("change", applyFilters);
  sortSelect?.addEventListener("change", sortCards);

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    const card = event.target.closest("[data-company-card]");
    if (!button || !card) return;

    if (button.matches("[data-company-view]")) {
      showCompanyDetails(card);
    } else if (button.matches("[data-company-delete]")) {
      card.remove();
      populateIndustries();
      applyFilters();
      updateSummary();
    }
  });

  exportButton?.addEventListener("click", () => {
    const visibleCards = getCards().filter((card) => !card.hidden);
    const rows = [
      [
        "Company",
        "Industry",
        "Company size",
        "Key contact",
        "Email",
        "Phone",
        "Open opportunities",
      ],
    ];

    visibleCards.forEach((card) => {
      rows.push([
        card.querySelector(".crm-company-name")?.textContent.trim() ?? "",
        card.dataset.industry,
        card.dataset.size,
        card.dataset.contact,
        card.dataset.email,
        card.dataset.phone,
        card.dataset.deals,
      ]);
    });

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "crm-companies.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  companyForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!companyForm.reportValidity()) return;

    const company = Object.fromEntries(new FormData(companyForm).entries());
    const card = createCompanyRow(company);
    grid.prepend(card);
    companyForm.reset();
    populateIndustries();
    sortCards();
    applyFilters();
    updateSummary();

    const modal = window.bootstrap?.Modal;
    if (modal) {
      modal
        .getOrCreateInstance(document.querySelector("#create-company"))
        .hide();
    }
  });

  if (seed) {
    seed.querySelectorAll("[data-company-card]").forEach((sourceCard) => {
      const company = {
        name: sourceCard.querySelector(".crm-company-heading h2")?.textContent.trim() || sourceCard.dataset.name || "Company",
        email: sourceCard.dataset.email || "",
        industry: sourceCard.dataset.industry || "Other",
        size: sourceCard.dataset.size || "Not specified",
        contact: sourceCard.dataset.contact || "Not assigned",
        phone: sourceCard.dataset.phone || "",
        deals: sourceCard.dataset.deals || 0,
        logo: sourceCard.dataset.logo || sourceCard.querySelector(".crm-company-logo img")?.getAttribute("src") || "../assets/images/logos/11.png",
        notes: sourceCard.dataset.notes || "",
      };
      grid.append(createCompanyRow(company));
    });
    seed.remove();
  }

  populateIndustries();
  sortCards();
  applyFilters();
  updateSummary();
})();
