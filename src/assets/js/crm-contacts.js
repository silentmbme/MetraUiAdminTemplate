(() => {
  "use strict";

  const grid = document.querySelector("#crm-contact-grid");
  if (!grid) return;
  const seed = document.querySelector("#crm-contact-seed");

  const searchInput = document.querySelector("#crm-contact-search");
  const sourceFilter = document.querySelector("#crm-contact-source");
  const sortSelect = document.querySelector("#crm-contact-sort");
  const emptyMessage = document.querySelector("#crm-contact-empty");
  const contactForm = document.querySelector("#crm-contact-form");
  const drawerContent = document.querySelector("#contact-details-content");

  function getCards() {
    return Array.from(grid.querySelectorAll("[data-contact-card]"));
  }

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
    const scores = cards.map((card) => Number(card.dataset.score) || 0);
    const highScoreCount = scores.filter((score) => score >= 80).length;
    const companyCount = new Set(
      cards.map((card) => card.dataset.company).filter(Boolean)
    ).size;
    const average = scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      : 0;

    document.querySelector("#crm-contact-total").textContent = cards.length;
    document.querySelector("#crm-contact-high-score").textContent =
      highScoreCount;
    document.querySelector("#crm-company-total").textContent = companyCount;
    document.querySelector(
      "#crm-average-score"
    ).innerHTML = `${average}<small>/100</small>`;
  }

  function populateSources() {
    if (!sourceFilter) return;

    const selectedSource = sourceFilter.value;
    const sources = [...new Set(getCards().map((card) => card.dataset.source))]
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second));

    sourceFilter.replaceChildren(new Option("Every source", ""));
    sources.forEach((source) => sourceFilter.add(new Option(source, source)));
    sourceFilter.value = sources.includes(selectedSource) ? selectedSource : "";
  }

  function applyFilters() {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    const selectedSource = sourceFilter?.value ?? "";
    let visibleCount = 0;

    getCards().forEach((card) => {
      const searchableText = `${card.dataset.name} ${card.dataset.email} ${card.dataset.company}`;
      const matchesQuery = searchableText.includes(query);
      const matchesSource =
        !selectedSource || card.dataset.source === selectedSource;
      card.hidden = !(matchesQuery && matchesSource);
      if (!card.hidden) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  }

  function sortCards() {
    const cards = getCards();
    const mode = sortSelect?.value ?? "name";

    cards.sort((first, second) => {
      if (mode === "score") {
        return Number(second.dataset.score) - Number(first.dataset.score);
      }
      return first.dataset.name.localeCompare(second.dataset.name);
    });

    cards.forEach((card) => grid.append(card));
  }

  function createContactRow(contact) {
    const card = document.createElement("tr");
    const name = escapeHtml(contact.name);
    const email = escapeHtml(contact.email);
    const company = escapeHtml(contact.company);
    const phone = escapeHtml(contact.phone || "Phone not added");
    const source = escapeHtml(contact.source);
    const stage = escapeHtml(contact.status);
    const role = escapeHtml(contact.role || "");
    const score = Math.max(0, Math.min(100, Number(contact.score) || 0));
    const avatar = escapeHtml(contact.avatar || "../assets/images/users/9.jpg");
    const lastContact = escapeHtml(contact.lastContact || "Not contacted yet");

    card.className = "crm-contact-row";
    card.dataset.contactCard = "";
    card.dataset.name = contact.name.toLowerCase();
    card.dataset.email = contact.email.toLowerCase();
    card.dataset.company = contact.company.toLowerCase();
    card.dataset.score = score;
    card.dataset.source = contact.source;
    card.dataset.phone = contact.phone;
    card.dataset.role = contact.role || "";
    card.dataset.status = contact.status;
    card.dataset.lastContact = contact.lastContact || "";
    card.dataset.notes = contact.notes || "";
    card.innerHTML = `
      <td><div class="d-flex align-items-center gap-2"><img class="avatar avatar-sm avatar-rounded crm-person-avatar" src="${avatar}" alt=""><div><span class="d-block fw-medium crm-contact-name">${name}</span><span class="text-muted fs-12">${role || "Contact"}</span></div></div></td>
      <td>${company}</td>
      <td><a href="mailto:${email}">${email}</a></td>
      <td><span class="badge bg-light text-default">${source}</span></td>
      <td><span class="badge bg-success-transparent text-success">${score} / 100</span></td>
      <td class="text-muted">${lastContact}</td>
      <td><div class="d-flex justify-content-end gap-1"><button class="btn btn-icon btn-sm btn-light crm-contact-favorite" type="button" aria-label="Add ${name} to favorites" aria-pressed="false"><i class="ri-star-line"></i></button><button type="button" class="btn btn-sm btn-light" data-contact-view aria-label="View ${name}"><i class="ri-eye-line"></i></button><button type="button" class="btn btn-sm btn-light text-danger" data-contact-delete aria-label="Remove ${name}"><i class="ri-delete-bin-line"></i></button></div></td>`;
    return card;
  }

  function showContactDetails(card) {
    if (!drawerContent) return;

    const name = escapeHtml(card.querySelector(".crm-contact-name")?.textContent ?? "Contact");
    const avatar = escapeHtml(
      card.querySelector(".crm-person-avatar")?.src ?? ""
    );
    const company = escapeHtml(card.dataset.company);
    const role = escapeHtml(card.dataset.role || "Not specified");
    const email = escapeHtml(card.dataset.email);
    const phone = escapeHtml(card.dataset.phone || "Not specified");
    const source = escapeHtml(card.dataset.source);
    const relationshipContext = escapeHtml(
      card.dataset.status || "Not specified"
    );
    const score = escapeHtml(card.dataset.score);
    const notes = escapeHtml(card.dataset.notes || "No notes added yet.");

    drawerContent.innerHTML = `
      <section class="crm-drawer-profile-card">
        <img src="${avatar}" alt="${name}" class="crm-drawer-avatar">
        <div class="crm-drawer-profile-copy"><span class="crm-drawer-eyebrow">CONTACT</span><h3>${name}</h3><p>${role} at ${company}</p></div>
        <span class="badge bg-success-transparent text-success">${score}/100</span>
      </section>
      <div class="crm-drawer-actions"><a class="btn btn-success btn-sm" href="mailto:${email}"><i class="ri-mail-line me-1"></i>Email</a><a class="btn btn-light btn-sm" href="tel:${phone.replace(/[^+\d]/g, "")}"><i class="ri-phone-line me-1"></i>Call</a></div>
      <section class="crm-drawer-insights" aria-label="Contact snapshot">
        <div><span><i class="ri-focus-3-line"></i> Lead score</span><strong>${score}<small>/100</small></strong></div>
        <div><span><i class="ri-links-line"></i> Source</span><strong>${source}</strong></div>
        <div><span><i class="ri-time-line"></i> Activity</span><strong>${escapeHtml(card.dataset.lastContact || "Not recorded")}</strong></div>
      </section>
      <section class="crm-drawer-section"><h3>Relationship</h3><div class="crm-drawer-info-grid">
        <div class="crm-drawer-info-item"><span>Company</span><strong>${company}</strong></div>
        <div class="crm-drawer-info-item"><span>Relationship</span><strong>${relationshipContext}</strong></div>
        <div class="crm-drawer-info-item"><span>Phone</span><strong>${phone}</strong></div>
      </div></section>
      <section class="crm-drawer-section crm-drawer-notes"><h3>Team notes</h3><p>${notes}</p></section>`;

    if (window.bootstrap?.Offcanvas) {
      window.bootstrap.Offcanvas.getOrCreateInstance(
        document.querySelector("#contact-details-panel")
      ).show();
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  sourceFilter?.addEventListener("change", applyFilters);
  sortSelect?.addEventListener("change", () => {
    sortCards();
    applyFilters();
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    const card = event.target.closest("[data-contact-card]");
    if (!button || !card) return;

    if (button.matches("[data-contact-view]")) {
      showContactDetails(card);
    } else if (button.matches("[data-contact-delete]")) {
      card.remove();
      populateSources();
      applyFilters();
      updateSummary();
    } else if (button.matches(".crm-contact-favorite")) {
      const isFavorite = button.getAttribute("aria-pressed") === "true";
      const contactName = card.dataset.name;
      button.setAttribute("aria-pressed", String(!isFavorite));
      button.setAttribute(
        "aria-label",
        `${isFavorite ? "Add" : "Remove"} ${contactName} ${
          isFavorite ? "to" : "from"
        } favorites`
      );
      button.innerHTML = `<i class="ri-star-${
        isFavorite ? "line" : "fill"
      }"></i>`;
    }
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const values = new FormData(contactForm);
    const contact = Object.fromEntries(values.entries());
    contact.avatar = "../assets/images/users/9.jpg";
    contact.lastContact = contact.lastContact || "Not contacted yet";
    const card = createContactRow(contact);
    grid.prepend(card);
    contactForm.reset();
    contactForm.elements.score.value = 50;
    populateSources();
    sortCards();
    applyFilters();
    updateSummary();

    const modal = window.bootstrap?.Modal;
    if (modal) {
      modal
        .getOrCreateInstance(document.querySelector("#create-contact"))
        .hide();
    }
  });

  if (window.flatpickr) {
    const dateInput = document.querySelector("#targetDate");
    if (dateInput) {
      window.flatpickr(dateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
      });
    }
  }

  if (seed) {
    seed.querySelectorAll("[data-contact-card]").forEach((sourceCard) => {
      const contact = {
        name: sourceCard.querySelector(".crm-person-heading h2")?.textContent.trim() || sourceCard.dataset.name || "Contact",
        email: sourceCard.dataset.email || "",
        company: sourceCard.dataset.company || "",
        score: sourceCard.dataset.score || 0,
        source: sourceCard.dataset.source || "Other",
        phone: sourceCard.dataset.phone || "",
        role: sourceCard.dataset.role || "",
        status: sourceCard.dataset.status || sourceCard.querySelector(".crm-contact-tag")?.textContent.trim() || "Active",
        lastContact: sourceCard.dataset.lastContact || "Recently active",
        avatar: sourceCard.querySelector(".crm-person-avatar")?.getAttribute("src") || "../assets/images/users/9.jpg",
      };
      grid.append(createContactRow(contact));
    });
    seed.remove();
  }

  populateSources();
  sortCards();
  applyFilters();
  updateSummary();
})();
