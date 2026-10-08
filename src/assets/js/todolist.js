(() => {
  "use strict";

  const list = document.querySelector("#todo-task-list");
  if (!list) return;

  const filters = [...document.querySelectorAll(".todo-filter")];
  const search = document.querySelector("#todo-search");
  const sort = document.querySelector("#todo-sort");
  const emptyState = document.querySelector("#todo-empty");
  const getToday = () => { const now = new Date(); return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0"); };
  let today = getToday();
  let activeFilter = "all";
  let createdSequence = 0;

  const tasks = () => [...list.querySelectorAll(".todo-task")];

  const matchesFilter = (task) => {
    const isDone = task.dataset.status === "completed";
    const due = task.dataset.due;
    switch (activeFilter) {
      case "open": return !isDone;
      case "work": return Boolean(task.querySelector(".todo-label-work"));
      case "personal": return Boolean(task.querySelector(".todo-label-personal"));
      case "high": case "medium": case "low": return !isDone && task.dataset.priority === activeFilter;
      case "today": return !isDone && due === today;
      case "upcoming": return !isDone && due && due > today;
      case "completed": return isDone;
      case "starred": return task.dataset.starred === "true";
      default: return true;
    }
  };

  const render = () => {
    today = getToday();
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    tasks().forEach((task) => {
      const textMatches = !query || `${task.dataset.title} ${task.textContent}`.toLowerCase().includes(query);
      const show = matchesFilter(task) && textMatches;
      task.classList.toggle("d-none", !show);
      if (show) visible += 1;
    });

    emptyState?.classList.toggle("d-none", visible > 0);
    document.querySelector("#todo-visible-count").textContent = `${visible} ${visible === 1 ? "task" : "tasks"}`;
    document.querySelector("#todo-footer-count").textContent = `Showing ${visible} of ${tasks().length} tasks`;
    document.querySelectorAll(".todo-filter-count").forEach((node) => {
      node.textContent = String(tasks().length);
    });
    document.querySelectorAll('[data-todo-sidebar-filter]').forEach(button => {const selected = button.dataset.todoSidebarFilter === activeFilter; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));});
    updateStats();
  };

  const setCount = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = String(value); };

  const updateStats = () => {
    const allTasks = tasks();
    setCount("#drive-total", allTasks.length);
    const openTasks = allTasks.filter((task) => task.dataset.status === "open");
    const completedTasks = allTasks.filter((task) => task.dataset.status === "completed");
    const dueToday = openTasks.filter((task) => task.dataset.due === today);
    const completedToday = allTasks.filter((task) => task.dataset.due === today && task.dataset.status === "completed");

    setCount("#todo-open-count", String(openTasks.length));
    setCount("#todo-today-count", String(dueToday.length));
    setCount("#todo-completed-count", String(completedTasks.length));
    setCount("#todo-high-count", String(openTasks.filter((task) => task.dataset.priority === "high").length));
    setCount("#todo-medium-count", String(openTasks.filter((task) => task.dataset.priority === "medium").length));
    setCount("#todo-low-count", String(openTasks.filter((task) => task.dataset.priority === "low").length));

    const percent = 20;
    const progressBar = document.querySelector("#todo-progress .progress-bar");
    progressBar.style.width = `${percent}%`;
    const progressElement = document.querySelector("#todo-progress");
    progressElement.setAttribute("aria-valuemin", "0");
    progressElement.setAttribute("aria-valuemax", "100");
    progressElement.setAttribute("aria-valuenow", String(percent));
    progressElement.setAttribute("aria-valuetext", "1/2 - 20% progress");
    document.querySelector("#todo-progress-label").textContent = "1/2";
  };

  const formatDueDate = (date) => {
    if (!date) return "No due date";
    if (date === today) return "Today";
    return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  };

  const setTaskStatus = (task, complete) => {
    task.dataset.status = complete ? "completed" : "open";
    task.classList.toggle("is-complete", complete);
    const due = task.querySelector(".todo-due");
    if (complete) {
      due.className = "todo-due";
      due.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i> Completed';
    } else {
      const isToday = task.dataset.due === today;
      due.className = `todo-due${isToday ? " todo-due-today" : ""}`;
      due.innerHTML = `<i class="ri-${isToday ? "time-line" : "calendar-line"}" aria-hidden="true"></i> ${formatDueDate(task.dataset.due)}`;
    }
    render();
  };

  document.querySelectorAll('[data-todo-sidebar-filter]').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.todoSidebarFilter;
    filters.forEach(filter => { const selected = filter.dataset.filter === activeFilter; filter.classList.toggle('is-active',selected); filter.classList.toggle('btn-primary',selected); filter.classList.toggle('btn-light',!selected); filter.setAttribute('aria-pressed',String(selected)); });
    render();
  }));
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filters.forEach((filter) => {
        const selected = filter === button;
        filter.classList.toggle("is-active", selected);
        filter.classList.toggle("btn-primary", selected);
        filter.classList.toggle("btn-light", !selected);
        filter.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });

  search?.addEventListener("input", render);

  sort?.addEventListener("change", () => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = tasks().sort((first, second) => {
      if (sort.value === "priority") return priorityOrder[first.dataset.priority] - priorityOrder[second.dataset.priority];
      if (sort.value === "due") return (first.dataset.due || "9999-12-31").localeCompare(second.dataset.due || "9999-12-31");
      return Number(second.dataset.created || 0) - Number(first.dataset.created || 0);
    });
    sorted.forEach((task) => list.append(task));
    render();
  });

  list.addEventListener("change", (event) => {
    if (event.target.matches(".todo-complete")) {
      setTaskStatus(event.target.closest(".todo-task"), event.target.checked);
    }
  });

  list.addEventListener("click", (event) => {
    const star = event.target.closest(".todo-star");
    if (!star) return;
    const task = star.closest(".todo-task");
    const isStarred = task.dataset.starred !== "true";
    task.dataset.starred = String(isStarred);
    star.classList.toggle("is-starred", isStarred);
    star.setAttribute("aria-label", `${isStarred ? "Remove from" : "Add to"} starred`);
    star.innerHTML = `<i class="ri-star-${isStarred ? "fill" : "line"}" aria-hidden="true"></i>`;
    render();
  });

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);

  document.querySelector("#todo-create-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const due = String(formData.get("due") || "");
    const priority = String(formData.get("priority") || "medium");
    const category = String(formData.get("category") || "work");
    if (!title) return;

    const safeTitle = escapeHtml(title);
    const safeNote = escapeHtml(note || "No notes added");
    const dueToday = due === today;
    const task = document.createElement("article");
    task.className = "todo-task";
    task.dataset.status = "open";
    task.dataset.priority = priority;
    task.dataset.due = due || "";
    task.dataset.title = title.toLowerCase();
    task.dataset.created = String(Date.now() + createdSequence++);
    task.innerHTML = `
      <button class="todo-drag-handle" type="button" aria-label="Drag to reorder"><i class="ri-draggable" aria-hidden="true"></i></button>
      <input class="form-check-input todo-complete" type="checkbox" aria-label="Mark ${safeTitle} complete">
      <div class="todo-task-copy"><div class="d-flex align-items-center gap-2 flex-wrap"><h3>${safeTitle}</h3><span class="todo-label todo-label-${category}">${category === "personal" ? "Personal" : "Work"}</span></div><p>${safeNote}</p></div>
      <span class="todo-priority todo-priority-${priority}"><i class="ri-flag-fill" aria-hidden="true"></i> ${priority.charAt(0).toUpperCase()}${priority.slice(1)}</span>
      <span class="todo-due${dueToday ? " todo-due-today" : ""}"><i class="ri-${dueToday ? "time-line" : "calendar-line"}" aria-hidden="true"></i> ${formatDueDate(due)}</span>
      <button class="todo-star" type="button" aria-label="Add to starred"><i class="ri-star-line" aria-hidden="true"></i></button>`;

    list.prepend(task);
    event.currentTarget.reset();
    window.bootstrap?.Modal.getOrCreateInstance(document.querySelector("#addtask")).hide();
    activeFilter = "all";
    filters.find((button) => button.dataset.filter === "all")?.click();
    if (sort) sort.value = "created";
  });

  const focusButton = document.querySelector("#todo-focus-button");
  const focusStatus = document.querySelector("#todo-focus-status");
  let focusInterval;
  let focusSeconds = 25 * 60;
  const updateFocusClock = () => {
    const minutes = Math.floor(focusSeconds / 60).toString().padStart(2, "0");
    const seconds = (focusSeconds % 60).toString().padStart(2, "0");
    focusStatus.textContent = `Focus session in progress · ${minutes}:${seconds} remaining`;
  };

  focusButton?.addEventListener("click", () => {
    if (focusInterval) {
      window.clearInterval(focusInterval);
      focusInterval = undefined;
      focusSeconds = 25 * 60;
      focusStatus.textContent = "Focus session paused. Take a breath, then start again when you’re ready.";
      focusButton.innerHTML = '<i class="ri-play-circle-line me-1" aria-hidden="true"></i>Resume focus session';
      return;
    }

    focusStatus.classList.remove("d-none");
    focusButton.innerHTML = '<i class="ri-pause-circle-line me-1" aria-hidden="true"></i>Pause focus session';
    updateFocusClock();
    focusInterval = window.setInterval(() => {
      focusSeconds -= 1;
      updateFocusClock();
      if (focusSeconds <= 0) {
        window.clearInterval(focusInterval);
        focusInterval = undefined;
        focusButton.innerHTML = '<i class="ri-restart-line me-1" aria-hidden="true"></i>Start another focus';
        focusStatus.textContent = "Focus session complete. Nice work — take a short break.";
        focusSeconds = 25 * 60;
      }
    }, 1000);
  });

  if (typeof window.dragula === "function") {
    window.dragula([list], {
      moves: (element, _container, handle) => Boolean(handle?.closest(".todo-drag-handle")),
      accepts: (element, target) => target === list,
    });
  }

  render();
})();
