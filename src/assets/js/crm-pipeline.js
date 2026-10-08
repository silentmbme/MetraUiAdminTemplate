(() => {
  "use strict";

  const stages = ["Qualification", "Proposal", "Negotiation", "Closing", "Won"];
  const opportunities = [
    {
      id: "OP-1048",
      name: "Annual platform renewal",
      company: "Acme Studio",
      stage: "Negotiation",
      owner: "Alex Morgan",
      amount: 24800,
      closeIn: 8,
      avatar: "1.jpg",
    },
    {
      id: "OP-1047",
      name: "Customer experience suite",
      company: "Helio Systems",
      stage: "Proposal",
      owner: "Jamie Lee",
      amount: 18750,
      closeIn: 18,
      avatar: "2.jpg",
    },
    {
      id: "OP-1046",
      name: "Regional expansion",
      company: "Northstar Labs",
      stage: "Qualification",
      owner: "Riley Chen",
      amount: 32600,
      closeIn: 42,
      avatar: "3.jpg",
    },
    {
      id: "OP-1045",
      name: "Analytics implementation",
      company: "Circooles",
      stage: "Closing",
      owner: "Alex Morgan",
      amount: 14200,
      closeIn: 5,
      avatar: "1.jpg",
    },
    {
      id: "OP-1044",
      name: "Enterprise support plan",
      company: "Catalog",
      stage: "Proposal",
      owner: "Jordan Blake",
      amount: 9600,
      closeIn: 28,
      avatar: "4.jpg",
    },
    {
      id: "OP-1043",
      name: "Workflow automation",
      company: "Layers Inc.",
      stage: "Negotiation",
      owner: "Jamie Lee",
      amount: 21800,
      closeIn: 35,
      avatar: "2.jpg",
    },
    {
      id: "OP-1042",
      name: "Data migration services",
      company: "Sisyphus Group",
      stage: "Qualification",
      owner: "Riley Chen",
      amount: 12400,
      closeIn: 52,
      avatar: "3.jpg",
    },
    {
      id: "OP-1041",
      name: "Customer portal rollout",
      company: "Northstar Labs",
      stage: "Won",
      owner: "Jordan Blake",
      amount: 27600,
      closeIn: 0,
      avatar: "4.jpg",
    },
    {
      id: "OP-1040",
      name: "Service desk renewal",
      company: "Acme Studio",
      stage: "Closing",
      owner: "Jamie Lee",
      amount: 11800,
      closeIn: 12,
      avatar: "2.jpg",
    },
    {
      id: "OP-1039",
      name: "Cloud migration project",
      company: "Vertex Group",
      stage: "Qualification",
      owner: "Alex Morgan",
      amount: 22400,
      closeIn: 64,
      avatar: "1.jpg",
    },
  ];

  const board = document.getElementById("crm-kanban-board");
  const search = document.getElementById("pipeline-search");
  const ownerFilter = document.getElementById("pipeline-owner");
  const sortSelect = document.getElementById("pipeline-sort");
  const stageWeights = [0.2, 0.45, 0.65, 0.85, 1];
  let draggedId = null;
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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

  function render() {
    const query = search.value.trim().toLowerCase();
    const selectedOwner = ownerFilter.value;
    const visible = opportunities
      .filter((item) => {
        const matchesSearch = `${item.name} ${item.company} ${item.owner}`
          .toLowerCase()
          .includes(query);
        const matchesOwner = !selectedOwner || item.owner === selectedOwner;
        return matchesSearch && matchesOwner;
      })
      .sort((first, second) => {
        if (sortSelect.value === "value-high")
          return second.amount - first.amount;
        if (sortSelect.value === "close-soon")
          return first.closeIn - second.closeIn;
        if (sortSelect.value === "name")
          return first.name.localeCompare(second.name);
        return 0;
      });
    let openCount = 0;
    let openValue = 0;
    let weightedValue = 0;
    let closingSoon = 0;

    stages.forEach((stage) => {
      const column = board.querySelector(`[data-stage="${stage}"]`);
      const list = column.querySelector("[data-stage-list]");
      const records = visible.filter((item) => item.stage === stage);
      const total = records.reduce((sum, item) => sum + item.amount, 0);
      if (stage !== "Won") {
        const activeDeals = opportunities.filter(
          (item) => item.stage === stage
        );
        openCount += activeDeals.length;
        openValue += activeDeals.reduce((sum, item) => sum + item.amount, 0);
        weightedValue += activeDeals.reduce(
          (sum, item) =>
            sum + item.amount * stageWeights[stages.indexOf(stage)],
          0
        );
      }

      column.querySelector(".crm-stage-count").textContent = `${records.length
        } ${records.length === 1 ? "deal" : "deals"}`;
      column.querySelector(".crm-stage-total").textContent = money(total);
      list.innerHTML =
        records
          .map((item) => {
            const stageIndex = stages.indexOf(item.stage);
            const nextStage = stages[stageIndex + 1];
            const nextAction = nextStage
              ? `<button type="button" data-advance-deal="${escapeHtml(
                item.id
              )}" aria-label="Move ${escapeHtml(
                item.name
              )} to ${nextStage}"><span>Move to ${nextStage}</span><i class="ri-arrow-right-line" aria-hidden="true"></i></button>`
              : '<span class="crm-deal-won"><i class="ri-checkbox-circle-fill" aria-hidden="true"></i> Closed won</span>';
            const timing =
              item.closeIn === 0
                ? "Closed"
                : item.closeIn === 1
                  ? "Closes tomorrow"
                  : `Closes in ${item.closeIn} days`;
            return `<article class="crm-kanban-deal" draggable="true" data-deal-id="${escapeHtml(
              item.id
            )}"><div class="crm-deal-topline"><span>${escapeHtml(
              item.id
            )}</span><div class="dropdown crm-pipeline-menu"><button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More options for ${escapeHtml(
              item.name
            )}"><i class="ri-more-2-fill" aria-hidden="true"></i></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="crm-opportunities.html"><i class="ri-briefcase-line me-2" aria-hidden="true"></i>Opportunity register</a></li><li><a class="dropdown-item" href="crm-deals.html"><i class="ri-kanban-view me-2" aria-hidden="true"></i>Deals board</a></li></ul></div></div><h4>${escapeHtml(
              item.name
            )}</h4><p class="crm-deal-company">${escapeHtml(
              item.company
            )}</p><div class="crm-deal-value">${money(
              item.amount
            )}</div><div class="crm-deal-meta"><span><img src="../assets/images/users/${escapeHtml(
              item.avatar
            )}" alt="" />${escapeHtml(
              item.owner
            )}</span><small>${timing}</small></div><div class="crm-deal-progress"><span style="width:${[32, 52, 72, 90, 100][stageIndex]
              }%"></span></div><div class="crm-deal-action">${nextAction}</div></article>`;
          })
          .join("") ||
        '<div class="crm-column-empty">No deals in this stage.</div>';
    });

    document.getElementById("pipeline-total-count").textContent = openCount;
    document.getElementById("pipeline-total-value").textContent =
      money(openValue);
    closingSoon = opportunities.filter(
      (item) => item.stage !== "Won" && item.closeIn <= 14
    ).length;
    document.getElementById("pipeline-weighted-value").textContent =
      money(weightedValue);
    document.getElementById(
      "pipeline-closing-soon"
    ).textContent = `${closingSoon} ${closingSoon === 1 ? "deal" : "deals"}`;
  }

  function moveDeal(id, targetStage) {
    const deal = opportunities.find((item) => item.id === id);
    if (!deal || !stages.includes(targetStage)) return;
    deal.stage = targetStage;
    render();
    document.getElementById(
      "pipeline-feedback"
    ).textContent = `${deal.name} moved to ${targetStage}. This demo change lasts for this page session.`;
  }

  board.addEventListener("click", (event) => {
    const button = event.target.closest("[data-advance-deal]");
    if (!button) return;
    const deal = opportunities.find(
      (item) => item.id === button.dataset.advanceDeal
    );
    if (!deal) return;
    moveDeal(deal.id, stages[stages.indexOf(deal.stage) + 1]);
  });

  board.addEventListener("dragstart", (event) => {
    if (
      event.target.closest("button, a, input, select, textarea, .dropdown-menu")
    ) {
      event.preventDefault();
      return;
    }
    const card = event.target.closest("[data-deal-id]");
    if (!card) return;
    draggedId = card.dataset.dealId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedId);
    card.classList.add("is-dragging");
  });
  board.addEventListener("dragend", (event) =>
    event.target.closest("[data-deal-id]")?.classList.remove("is-dragging")
  );
  board.addEventListener("dragover", (event) => {
    const column = event.target.closest(".crm-kanban-column");
    if (!column) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    column.classList.add("is-drop-target");
  });
  board.addEventListener("dragleave", (event) => {
    const column = event.target.closest(".crm-kanban-column");
    if (column && !column.contains(event.relatedTarget))
      column.classList.remove("is-drop-target");
  });
  board.addEventListener("drop", (event) => {
    const column = event.target.closest(".crm-kanban-column");
    if (!column) return;
    event.preventDefault();
    column.classList.remove("is-drop-target");
    const id = event.dataTransfer.getData("text/plain") || draggedId;
    if (id) moveDeal(id, column.dataset.stage);
    draggedId = null;
  });

  search.addEventListener("input", render);
  ownerFilter.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  render();
})();
