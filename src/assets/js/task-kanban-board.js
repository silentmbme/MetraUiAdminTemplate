(function () {
  "use strict";

  const columnIds = [
    "new-tasks-draggable",
    "todo-tasks-draggable",
    "inprogress-tasks-draggable",
    "inreview-tasks-draggable",
    "completed-tasks-draggable",
  ];
  const columns = columnIds.map((id) => document.getElementById(id)).filter(Boolean);
  const columnContainers = document.querySelectorAll("[data-kanban-column]");
  const choiceInstances = new Map();

  function updateColumnCounts() {
    let taskTotal = 0;
    let highPriorityTotal = 0;

    columnContainers.forEach((column) => {
      const taskList = column.querySelector(".task-kanban-tasks [id$='-draggable']");
      const count = taskList ? taskList.querySelectorAll("[data-task-card]").length : 0;
      taskTotal += count;
      const countLabel = column.querySelector(".task-kanban-count");
      if (countLabel) countLabel.textContent = count;
    });

    document.querySelectorAll("[data-task-card]").forEach((card) => {
      const priority = card.querySelector(".task-kanban-card-header > div:first-child > .badge:nth-child(2)");
      if (priority && priority.textContent.trim() === "High") highPriorityTotal += 1;
    });

    const totalLabel = document.getElementById("kanban-total-task-count");
    const priorityLabel = document.getElementById("kanban-high-priority-count");
    if (totalLabel) totalLabel.textContent = taskTotal;
    if (priorityLabel) priorityLabel.textContent = highPriorityTotal;
  }

  function createAvatar(name) {
    const avatar = document.createElement("span");
    avatar.className = "avatar avatar-xs avatar-rounded bg-primary-transparent text-primary fw-semibold";
    avatar.textContent = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    avatar.setAttribute("aria-label", name);
    return avatar;
  }

  function addTaskProgress(card, defaultProgress) {
    const content = card.querySelector(".task-kanban-card-content");
    if (!content || content.querySelector(".task-kanban-progress")) return;

    const progress = Math.max(0, Math.min(100, Number(card.dataset.progress || defaultProgress || 0)));
    const progressWrap = document.createElement("div");
    progressWrap.className = "task-kanban-progress-wrap";

    const label = document.createElement("div");
    label.className = "task-kanban-progress-label";
    label.innerHTML = `<span>Progress</span><span>${progress}%</span>`;

    const track = document.createElement("div");
    track.className = "task-kanban-progress";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", "Task progress");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(progress));

    const bar = document.createElement("span");
    bar.style.width = `${progress}%`;
    track.appendChild(bar);
    progressWrap.append(label, track);
    const metadata = content.querySelector(".text-muted.fs-11");
    if (metadata) content.insertBefore(progressWrap, metadata);
    else content.appendChild(progressWrap);
  }

  function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "card custom-card";
    card.dataset.taskCard = "";
    card.dataset.progress = "8";

    const body = document.createElement("div");
    body.className = "card-body p-0";
    const content = document.createElement("div");
    content.className = "p-3 task-kanban-card-header";

    const badges = document.createElement("div");
    badges.className = "d-flex align-items-center justify-content-between mb-2";
    const taskId = document.createElement("span");
    taskId.className = "badge";
    taskId.textContent = task.id;
    const priority = document.createElement("span");
    const priorityStyle = {
      High: "bg-danger-transparent text-danger",
      Medium: "bg-info-transparent text-info",
      Low: "bg-success-transparent text-success",
    };
    priority.className = `badge ${priorityStyle[task.priority] || priorityStyle.Medium}`;
    priority.textContent = task.priority;
    badges.append(taskId, priority);

    const taskContent = document.createElement("div");
    taskContent.className = "task-kanban-card-content";
    const title = document.createElement("h3");
    title.className = "fw-semibold mb-1 fs-14";
    title.textContent = task.title;
    const description = document.createElement("p");
    description.className = "task-kanban-task-description mb-3";
    description.textContent = task.description || "No description added.";
    taskContent.append(title, description);

    const metadata = document.createElement("div");
    metadata.className = "d-flex justify-content-between align-items-center text-muted fs-11";
    const dueDate = document.createElement("span");
    dueDate.innerHTML = '<i class="ri-calendar-line me-1"></i>';
    dueDate.append(document.createTextNode(task.dueDate ? `Due ${task.dueDate}` : "No due date"));
    const tag = document.createElement("span");
    tag.textContent = task.tags.length ? task.tags.join(", ") : "New task";
    metadata.append(dueDate, tag);
    content.append(badges, taskContent, metadata);

    const footer = document.createElement("div");
    footer.className = "p-3 border-top";
    const footerContent = document.createElement("div");
    footerContent.className = "d-flex justify-content-between align-items-center";
    const commentCount = document.createElement("span");
    commentCount.className = "text-muted fs-12";
    commentCount.innerHTML = '<i class="ri-chat-3-line me-1"></i>0 comments';
    const assignees = document.createElement("div");
    assignees.className = "avatar-list-stacked";
    task.assignees.forEach((name) => assignees.appendChild(createAvatar(name)));
    footerContent.append(commentCount, assignees);
    footer.appendChild(footerContent);
    body.append(content, footer);
    card.appendChild(body);
    addTaskProgress(card, 8);

    return card;
  }

  document.querySelectorAll("[data-task-card]").forEach((card) => addTaskProgress(card, 12));

  if (typeof dragula !== "undefined" && columns.length) {
    const board = dragula(columns, { moves: (element) => Boolean(element.closest("[data-task-card]")) });
    board.on("drop", updateColumnCounts);
  }

  if (typeof SimpleBar !== "undefined") {
    ["new-tasks", "todo-tasks", "inprogress-tasks", "inreview-tasks", "completed-tasks"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) new SimpleBar(element, { autoHide: true });
    });
  }

  if (typeof Choices !== "undefined") {
    ["choices-multiple-remove-button1", "choices-multiple-remove-button2"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) choiceInstances.set(id, new Choices(element, { allowHTML: false, removeItemButton: true, shouldSort: false }));
    });
  }

  if (typeof flatpickr !== "undefined") {
    const dateInput = document.getElementById("targetDate");
    if (dateInput) flatpickr(dateInput, { dateFormat: "M d, Y", minDate: "today" });
  }

  const searchInput = document.getElementById("kanban-task-search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll("[data-task-card]").forEach((card) => {
        card.classList.toggle("d-none", !card.textContent.toLowerCase().includes(query));
      });
    });
  }

  const form = document.getElementById("task-create-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const feedback = document.getElementById("task-form-feedback");
      feedback.classList.add("d-none");

      const value = (id) => document.getElementById(id).value.trim();
      const taskId = value("task-id");
      const taskTitle = value("task-name");
      const isDuplicate = [...document.querySelectorAll("[data-task-card] .badge:first-child")]
        .some((badge) => badge.textContent.trim().toLowerCase() === taskId.toLowerCase());

      if (isDuplicate) {
        feedback.textContent = "That task ID is already on this board. Choose a different ID.";
        feedback.classList.remove("d-none");
        return;
      }

      const selectedValues = (id) => {
        const select = document.getElementById(id);
        return Array.from(select.selectedOptions).map((option) => option.value);
      };
      const newTask = createTaskCard({
        id: taskId,
        title: taskTitle,
        description: value("text-area"),
        priority: value("task-priority"),
        dueDate: value("targetDate"),
        assignees: selectedValues("choices-multiple-remove-button1"),
        tags: selectedValues("choices-multiple-remove-button2"),
      });
      document.getElementById("new-tasks-draggable").prepend(newTask);
      updateColumnCounts();

      const modalElement = document.getElementById("add-task");
      if (window.bootstrap && bootstrap.Modal) bootstrap.Modal.getOrCreateInstance(modalElement).hide();
      form.reset();
      choiceInstances.forEach((choices) => choices.removeActiveItems());
      if (typeof flatpickr !== "undefined" && document.getElementById("targetDate")._flatpickr) {
        document.getElementById("targetDate")._flatpickr.clear();
      }
      if (searchInput) searchInput.value = "";
      document.querySelectorAll("[data-task-card]").forEach((card) => card.classList.remove("d-none"));
    });
  }

  updateColumnCounts();
})();
