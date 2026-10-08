(() => {
  "use strict";

  const grid = document.querySelector("#crm-lead-grid");
  if (!grid) return;
  const seed = document.querySelector("#crm-lead-seed");

  const searchInput = document.querySelector("#crm-lead-search");
  const sourceFilter = document.querySelector("#crm-lead-source-filter");
  const sortSelect = document.querySelector("#crm-lead-sort");
  const selectAll = document.querySelector("#crm-lead-select-all");
  const exportButton = document.querySelector("#crm-lead-export");
  const leadForm = document.querySelector("#crm-lead-form");
  const emptyMessage = document.querySelector("#crm-lead-empty");
  const countLabel = document.querySelector("#crm-lead-count");
  const drawerContent = document.querySelector("#crm-lead-details-content");
  let selectedStage = "";

  const getCards = () => Array.from(grid.querySelectorAll("[data-lead-card]"));

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

  function formatCurrency(value) {
    return `$${(Number(value) || 0).toLocaleString("en-US")}`;
  }

  function updateSummary() {
    const cards = getCards();
    const activeLeads = cards.filter(
      (card) => card.dataset.stage !== "Lead Closed"
    );
    const openValue = activeLeads.reduce(
      (total, card) => total + (Number(card.dataset.potential) || 0),
      0
    );
    const qualified = cards.filter(
      (card) => card.dataset.stage === "Qualified"
    ).length;
    const closed = cards.filter(
      (card) => card.dataset.stage === "Lead Closed"
    ).length;

    document.querySelector("#crm-open-pipeline-value").textContent =
      formatCurrency(openValue);
    document.querySelector("#crm-lead-total").textContent = cards.length;
    document.querySelector("#crm-qualified-total").textContent = qualified;
    document.querySelector("#crm-closed-total").textContent = closed;

    document.querySelectorAll("[data-stage-filter]").forEach((button) => {
      const stage = button.dataset.stageFilter;
      const count = stage
        ? cards.filter((card) => card.dataset.stage === stage).length
        : cards.length;
      const countLabel = button.querySelector("strong");
      if (countLabel) countLabel.textContent = count;

      const progress = button.querySelector(".crm-stage-progress b");
      if (progress) {
        progress.style.width = `${
          cards.length ? (count / cards.length) * 100 : 0
        }%`;
      }
    });
  }

  function populateSources() {
    if (!sourceFilter) return;

    const currentSource = sourceFilter.value;
    const sources = [
      ...new Set(
        getCards()
          .map((card) => card.dataset.source)
          .filter(Boolean)
      ),
    ].sort((first, second) => first.localeCompare(second));

    sourceFilter.replaceChildren(new Option("Every source", ""));
    sources.forEach((source) => sourceFilter.add(new Option(source, source)));
    sourceFilter.value = sources.includes(currentSource) ? currentSource : "";
  }

  function applyFilters() {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    const source = sourceFilter?.value ?? "";
    let visibleCount = 0;

    getCards().forEach((card) => {
      const searchable = `${card.dataset.name} ${card.dataset.email} ${card.dataset.company}`;
      const matchesSearch = searchable.includes(query);
      const matchesSource = !source || card.dataset.source === source;
      const matchesStage =
        !selectedStage || card.dataset.stage === selectedStage;
      card.hidden = !(matchesSearch && matchesSource && matchesStage);
      if (!card.hidden) visibleCount += 1;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${visibleCount} of ${
        getCards().length
      } leads`;
    }
    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    if (selectAll) selectAll.checked = false;
  }

  function sortCards() {
    const cards = getCards();
    const mode = sortSelect?.value ?? "value";
    const stageOrder = [
      "New Lead",
      "Contacted",
      "Qualified",
      "Negotiation",
      "Lead Closed",
    ];

    cards.sort((first, second) => {
      if (mode === "name") {
        return first.dataset.name.localeCompare(second.dataset.name);
      }
      if (mode === "stage") {
        return (
          stageOrder.indexOf(first.dataset.stage) -
          stageOrder.indexOf(second.dataset.stage)
        );
      }
      return Number(second.dataset.potential) - Number(first.dataset.potential);
    });

    cards.forEach((card) => grid.append(card));
  }

  function createLeadRow(lead) {
    const card = document.createElement("tr");
    const name = escapeHtml(lead.name);
    const email = escapeHtml(lead.email);
    const company = escapeHtml(lead.company);
    const phone = escapeHtml(lead.phone || "Phone not added");
    const source = escapeHtml(lead.source);
    const stage = escapeHtml(lead.stage);
    const potential = Number(lead.potential) || 0;
    const avatar = lead.avatar || "../assets/images/users/9.png";
    const initials = lead.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const tags = [lead.priority, "New lead"]
      .filter(Boolean)
      .map((tag) => `<span class="crm-lead-tag">${escapeHtml(tag)}</span>`)
      .join("");

    card.className = "crm-lead-row";
    card.dataset.leadCard = "";
    card.dataset.name = lead.name.toLowerCase();
    card.dataset.email = lead.email.toLowerCase();
    card.dataset.company = lead.company.toLowerCase();
    card.dataset.stage = lead.stage;
    card.dataset.source = lead.source;
    card.dataset.potential = potential;
    card.dataset.phone = lead.phone;
    card.dataset.avatar = avatar;
    card.dataset.tags = [lead.priority, "New lead"].filter(Boolean).join(", ");
    card.dataset.notes = lead.notes || "";
    card.innerHTML = `
      <td><input class="form-check-input crm-lead-select" type="checkbox" aria-label="Select ${name}"></td>
      <td><div class="d-flex align-items-center gap-2"><img class="avatar avatar-sm avatar-rounded" src="${avatar}" alt=""><span class="fw-medium crm-lead-name">${name}</span></div></td>
      <td>${company}</td>
      <td><a href="mailto:${email}">${email}</a></td>
      <td><span class="badge bg-success-transparent text-success">${stage}</span></td>
      <td class="fw-medium">${formatCurrency(potential)}</td>
      <td><span class="badge bg-light text-default">${source}</span></td>
      <td><div class="d-flex justify-content-end gap-1"><button type="button" class="btn btn-sm btn-light" data-lead-view aria-label="View ${name}"><i class="ri-eye-line"></i></button><button type="button" class="btn btn-sm btn-light text-danger" data-lead-delete aria-label="Remove ${name}"><i class="ri-delete-bin-line"></i></button></div></td>`;
    return card;
  }

  function showLeadDetails(card) {
    if (!drawerContent) return;

    const name = escapeHtml(card.querySelector(".crm-lead-name")?.textContent ?? "Lead");
    const avatar = escapeHtml(card.dataset.avatar);
    const company = escapeHtml(card.dataset.company);
    const email = escapeHtml(card.dataset.email);
    const phone = escapeHtml(card.dataset.phone || "Not provided");
    const source = escapeHtml(card.dataset.source);
    const stage = escapeHtml(card.dataset.stage);
    const potential = formatCurrency(card.dataset.potential);
    const tags = escapeHtml(card.dataset.tags || "None");
    const notes = escapeHtml(card.dataset.notes || "No notes added yet.");

    drawerContent.innerHTML = `
      <section class="crm-drawer-profile-card">
        <img src="${avatar}" alt="${name}" class="crm-drawer-avatar">
        <div class="crm-drawer-profile-copy"><span class="crm-drawer-eyebrow">LEAD</span><h3>${name}</h3><p>${company}</p></div>
        <span class="badge bg-success-transparent text-success">${stage}</span>
      </section>
      <div class="crm-drawer-actions"><a class="btn btn-success btn-sm" href="mailto:${email}"><i class="ri-mail-line me-1"></i>Email</a><a class="btn btn-light btn-sm" href="tel:${phone.replace(/[^+\d]/g, "")}"><i class="ri-phone-line me-1"></i>Call</a></div>
      <section class="crm-drawer-insights" aria-label="Lead snapshot">
        <div><span><i class="ri-funds-line"></i> Potential</span><strong>${potential}</strong></div>
        <div><span><i class="ri-focus-3-line"></i> Stage</span><strong>${stage}</strong></div>
        <div><span><i class="ri-links-line"></i> Source</span><strong>${source}</strong></div>
      </section>
      <section class="crm-drawer-section"><h3>Lead overview</h3><div class="crm-drawer-info-grid">
        <div class="crm-drawer-info-item"><span>Company</span><strong>${company}</strong></div>
        <div class="crm-drawer-info-item"><span>Email</span><strong>${email}</strong></div>
        <div class="crm-drawer-info-item"><span>Phone</span><strong>${phone}</strong></div>
      </div></section>
      <section class="crm-drawer-section"><h3>Tags</h3><p class="crm-drawer-notes-copy">${tags}</p></section>
      <section class="crm-drawer-section crm-drawer-notes"><h3>Next step and notes</h3><p>${notes}</p></section>`;

    const offcanvas = window.bootstrap?.Offcanvas;
    if (offcanvas) {
      offcanvas
        .getOrCreateInstance(document.querySelector("#crm-lead-details"))
        .show();
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  sourceFilter?.addEventListener("change", applyFilters);
  sortSelect?.addEventListener("change", sortCards);

  document.querySelectorAll("[data-stage-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStage = button.dataset.stageFilter;
      document
        .querySelectorAll("[data-stage-filter]")
        .forEach((stageButton) => stageButton.classList.remove("is-active"));
      button.classList.add("is-active");
      applyFilters();
    });
  });

  selectAll?.addEventListener("change", () => {
    getCards()
      .filter((card) => !card.hidden)
      .forEach((card) => {
        const checkbox = card.querySelector(".crm-lead-select");
        if (checkbox) checkbox.checked = selectAll.checked;
      });
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    const card = event.target.closest("[data-lead-card]");
    if (!button || !card) return;

    if (button.matches("[data-lead-view]")) {
      showLeadDetails(card);
    } else if (button.matches("[data-lead-delete]")) {
      card.remove();
      populateSources();
      applyFilters();
      updateSummary();
    }
  });

  exportButton?.addEventListener("click", () => {
    const visibleCards = getCards().filter((card) => !card.hidden);
    const selectedCards = visibleCards.filter(
      (card) => card.querySelector(".crm-lead-select")?.checked
    );
    const exportCards = selectedCards.length ? selectedCards : visibleCards;
    const rows = [
      [
        "Lead",
        "Email",
        "Phone",
        "Stage",
        "Company",
        "Source",
        "Potential",
        "Tags",
      ],
    ];

    exportCards.forEach((card) => {
      rows.push([
        card.querySelector(".crm-lead-name")?.textContent.trim() ?? "",
        card.dataset.email,
        card.dataset.phone,
        card.dataset.stage,
        card.dataset.company,
        card.dataset.source,
        formatCurrency(card.dataset.potential),
        card.dataset.tags,
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
    link.download = "crm-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  leadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity()) return;

    const lead = Object.fromEntries(new FormData(leadForm).entries());
    const card = createLeadRow(lead);
    grid.prepend(card);
    leadForm.reset();
    leadForm.elements.potential.value = 5000;
    populateSources();
    sortCards();
    applyFilters();
    updateSummary();

    const modal = window.bootstrap?.Modal;
    if (modal) {
      modal.getOrCreateInstance(document.querySelector("#create-lead")).hide();
    }
  });

  if (seed) {
    seed.querySelectorAll("[data-lead-card]").forEach((sourceCard) => {
      const lead = {
        name: sourceCard.querySelector(".crm-lead-person h2")?.textContent.trim() || sourceCard.dataset.name || "Lead",
        email: sourceCard.dataset.email || "",
        company: sourceCard.dataset.company || "",
        stage: sourceCard.dataset.stage || "New Lead",
        source: sourceCard.dataset.source || "Other",
        potential: sourceCard.dataset.potential || 0,
        phone: sourceCard.dataset.phone || "",
        avatar: sourceCard.dataset.avatar || sourceCard.querySelector(".crm-lead-person img")?.getAttribute("src") || "../assets/images/users/9.jpg",
        priority: sourceCard.dataset.tags || Array.from(sourceCard.querySelectorAll(".crm-lead-tag")).map((tag) => tag.textContent.trim()).join(", "),
        notes: sourceCard.dataset.notes || "",
      };
      grid.append(createLeadRow(lead));
    });
    seed.remove();
  }

  populateSources();
  sortCards();
  applyFilters();
  updateSummary();
})();
