(() => {
  const page = document.querySelector(".mail-center-page");
  if (!page) return;

  const list = page.querySelector("#mail-messages");
  const messageItems = [...page.querySelectorAll(".mail-list-item")];
  const searchInput = page.querySelector("#mail-search");
  const listTitle = page.querySelector("#mail-list-title");
  const resultCount = page.querySelector("#mail-results-count");
  const countBadge = page.querySelector("#mail-list-count");
  const reader = page.querySelector(".mail-center-reader");
  const readerOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(reader);
  let activeFolder = "inbox";
  let activeLabel = "";
  let activeFilter = "all";

  const getSelectedItems = () => messageItems.filter((item) => !item.hidden);
  const updateUnreadCount = () => {
    const unreadCount = messageItems.filter((message) => message.classList.contains("unread")).length;
    const unreadBadge = page.querySelector("#mail-unread-count");
    if (unreadBadge) unreadBadge.textContent = `${unreadCount} unread`;
  };

  const updateVisibleMessages = () => {
    const query = searchInput.value.trim().toLowerCase();

    messageItems.forEach((item) => {
      const isFolderMatch = activeFolder === "starred"
        ? item.querySelector(".mail-list-star")?.classList.contains("true")
        : activeFolder === "inbox"
          ? item.dataset.mailFolder === "inbox"
          : item.dataset.mailFolder === activeFolder;
      const isLabelMatch = !activeLabel || item.dataset.mailLabel === activeLabel;
      const isFilterMatch = activeFilter === "all"
        || (activeFilter === "unread" && item.classList.contains("unread"))
        || (activeFilter === "starred" && item.querySelector(".mail-list-star")?.classList.contains("true"));
      const searchText = `${item.dataset.search || ""} ${item.dataset.sender || ""} ${item.dataset.subject || ""}`.toLowerCase();
      item.hidden = !(isFolderMatch && isLabelMatch && isFilterMatch && searchText.includes(query));
    });

    const visibleCount = getSelectedItems().length;
    countBadge.textContent = messageItems.filter((item) => item.dataset.mailFolder === "inbox").length;
    resultCount.textContent = visibleCount
      ? `Showing ${visibleCount} message${visibleCount === 1 ? "" : "s"}`
      : "No messages match these filters";
    list.querySelector(".mail-center-empty")?.remove();

    if (!visibleCount) {
      const emptyState = document.createElement("li");
      emptyState.className = "mail-center-empty";
      emptyState.innerHTML = '<i class="ri-mail-search-line"></i><strong>No messages found</strong><span>Try another folder or search term.</span>';
      list.querySelector(".mail-messages-container").append(emptyState);
    }
  };

  const openMessage = (item, showReader = true) => {
    if (!item) return;
    messageItems.forEach((message) => message.classList.toggle("active", message === item));
    item.classList.remove("unread");
    item.querySelector(".mail-check-input").checked = false;
    item.classList.remove("checked");

    page.querySelector("#mail-reader-subject").textContent = item.dataset.subject;
    page.querySelector("#mail-reader-sender").textContent = item.dataset.sender;
    page.querySelector("#mail-reader-date").textContent = item.dataset.date;
    page.querySelector("#mail-reader-avatar").src = `../assets/images/users/${item.dataset.avatar}`;
    page.querySelector("#mail-reader-avatar").alt = item.dataset.sender;

    const messageLabel = page.querySelector(".mail-reader-subject-row .badge:first-child");
    messageLabel.textContent = item.dataset.mailLabel;
    messageLabel.className = `badge ${item.dataset.mailLabel === "personal" ? "bg-danger-transparent text-danger" : "bg-primary-transparent text-primary"}`;
    page.querySelector("#mail-reader-message").innerHTML = item.querySelector(".mail-message-source")?.innerHTML || "";
    page.querySelector("#mail-reader-folder").textContent = item.dataset.mailFolder;
    page.querySelector("#mail-reply-recipient").textContent = item.dataset.sender;
    const isStarred = item.querySelector(".mail-list-star").classList.contains("true");
    const readerStar = page.querySelector("#mail-reader-star");
    readerStar.setAttribute("aria-pressed", String(isStarred));
    readerStar.setAttribute("aria-label", isStarred ? "Remove star" : "Star message");
    readerStar.querySelector("i").className = isStarred ? "ri-star-fill text-warning" : "ri-star-line";
    const visibleMessages = getSelectedItems();
    const messageIndex = visibleMessages.indexOf(item);
    page.querySelector("#mail-reader-previous").disabled = messageIndex <= 0;
    page.querySelector("#mail-reader-next").disabled = messageIndex < 0 || messageIndex >= visibleMessages.length - 1;
    const attachmentCount = Number(item.dataset.attachments) || 0;
    page.querySelector("#mail-reader-attachments").hidden = attachmentCount === 0;
    page.querySelector("#mail-reader-attachment-count").textContent = attachmentCount;
    const attachmentList = page.querySelector("#mail-reader-attachment-list");
    attachmentList.replaceChildren();
    for (let index = 0; index < attachmentCount; index++) {
      const attachment = document.createElement("a");
      attachment.className = "mail-attachment-item";
      const fileName = `demo-attachment-${index + 1}.txt`;
      attachment.download = fileName;
      attachment.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Demo attachment ${index + 1}\n${item.dataset.subject}\nSample file for this mail preview.`)}`;
      attachment.innerHTML = `<span class="avatar avatar-md bg-light text-default rounded"><i class="ri-file-text-line fs-16" aria-hidden="true"></i></span><span class="flex-fill"><strong>${fileName}</strong><small>Sample attachment · TXT</small></span><i class="ri-download-2-line" aria-hidden="true"></i>`;
      attachment.setAttribute("aria-label", `Download ${fileName}`);
      attachmentList.append(attachment);
    }

    updateUnreadCount();

    if (showReader) readerOffcanvas.show();
  };

  page.querySelectorAll(".mail-folder").forEach((button) => {
    button.addEventListener("click", () => {
      page.querySelectorAll(".mail-folder.active").forEach((activeButton) => activeButton.classList.remove("active"));
      button.classList.add("active");
      activeFolder = button.dataset.mailFolder || "inbox";
      activeLabel = button.dataset.mailLabel || "";
      activeFilter = "all";
      listTitle.textContent = button.querySelector(".mail-folder-count")
        ? [...button.querySelectorAll("span")].find((span) => !span.classList.contains("mail-folder-count"))?.textContent.trim() || "Inbox"
        : button.textContent.trim();
      page.querySelectorAll("[data-mail-filter]").forEach((filter) => filter.classList.toggle("active", filter.dataset.mailFilter === "all"));
      updateVisibleMessages();
      if (window.innerWidth < 992) page.classList.remove("mobile-show-folders");
    });
  });

  page.querySelectorAll("[data-mail-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.mailFilter;
      page.querySelectorAll("[data-mail-filter]").forEach((filter) => filter.classList.toggle("active", filter === button));
      updateVisibleMessages();
    });
  });

  searchInput.addEventListener("input", updateVisibleMessages);

  list.addEventListener("click", (event) => {
    const starButton = event.target.closest(".mail-list-star");
    if (starButton) {
      event.preventDefault();
      starButton.classList.toggle("true");
      const icon = starButton.querySelector("i");
      icon.className = starButton.classList.contains("true") ? "ri-star-fill" : "ri-star-line";
      starButton.setAttribute("aria-label", starButton.classList.contains("true") ? "Remove star" : "Star message");
      updateVisibleMessages();
      return;
    }

    if (event.target.closest("input, label")) return;
    const item = event.target.closest(".mail-list-item");
    if (item) openMessage(item);
  });

  list.addEventListener("keydown", (event) => {
    const item = event.target.closest(".mail-list-item");
    if (!item || event.target.closest("button, input, label")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMessage(item);
    }
  });

  page.querySelectorAll("[data-mail-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const activeMessage = messageItems.find((item) => item.classList.contains("active"));
      if (!activeMessage) return;
      const action = button.dataset.mailAction;
      if (action === "archive" || action === "trash") {
        activeMessage.dataset.mailFolder = action;
        activeMessage.classList.remove("unread", "active");
        updateUnreadCount();
        updateVisibleMessages();
        readerOffcanvas.hide();
      } else if (action === "unread") {
        activeMessage.classList.add("unread");
        updateUnreadCount();
        updateVisibleMessages();
        readerOffcanvas.hide();
      }
    });
  });

  page.querySelectorAll("[data-mail-bulk-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = messageItems.filter((item) => item.querySelector(".mail-check-input")?.checked);
      if (!selected.length) return;
      const action = button.dataset.mailBulkAction;
      selected.forEach((item) => {
        if (action === "star") {
          const star = item.querySelector(".mail-list-star");
          star.classList.toggle("true");
          star.querySelector("i").className = star.classList.contains("true") ? "ri-star-fill" : "ri-star-line";
          star.setAttribute("aria-label", star.classList.contains("true") ? "Remove star" : "Star message");
        } else if (action === "unread") {
          item.classList.add("unread");
        } else if (action === "archive" || action === "trash") {
          item.dataset.mailFolder = action;
          item.classList.remove("unread", "active");
        }
        item.querySelector(".mail-check-input").checked = false;
        item.classList.remove("checked");
      });
      page.querySelector("#checkAll").checked = false;
      updateUnreadCount();
      updateVisibleMessages();
    });
  });

  page.querySelector("#checkAll").addEventListener("change", (event) => {
    getSelectedItems().forEach((item) => {
      const checkbox = item.querySelector(".mail-check-input");
      checkbox.checked = event.target.checked;
      item.classList.toggle("checked", event.target.checked);
    });
  });

  page.querySelectorAll(".mail-check-input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => checkbox.closest(".mail-list-item").classList.toggle("checked", checkbox.checked));
  });

  page.querySelector("#mail-show-folders").addEventListener("click", () => {
    page.classList.add("mobile-show-folders");
  });

  page.querySelector("#mail-back-to-list").addEventListener("click", () => readerOffcanvas.hide());

  ["previous", "next"].forEach((direction) => {
    page.querySelector(`#mail-reader-${direction}`).addEventListener("click", () => {
      const visibleMessages = getSelectedItems();
      const index = visibleMessages.findIndex((item) => item.classList.contains("active"));
      openMessage(visibleMessages[index + (direction === "previous" ? -1 : 1)]);
    });
  });

  page.querySelector("#mail-reader-star").addEventListener("click", () => {
    const activeMessage = messageItems.find((item) => item.classList.contains("active"));
    if (!activeMessage) return;
    activeMessage.querySelector(".mail-list-star").click();
    openMessage(activeMessage, false);
  });

  page.querySelector("#mail-refresh").addEventListener("click", () => {
    searchInput.value = "";
    activeFilter = "all";
    updateVisibleMessages();
  });

  const replyEditorElement = page.querySelector("#mail-reply-editor");
  const composeEditorElement = page.querySelector("#mail-compose-editor");
  const toolbarOptions = [["bold", "italic", "underline"], ["link"], ["clean"]];
  const replyEditor = replyEditorElement && window.Quill
    ? new Quill(replyEditorElement, { modules: { toolbar: toolbarOptions }, theme: "snow" })
    : null;
  const composeEditor = composeEditorElement && window.Quill
    ? new Quill(composeEditorElement, { modules: { toolbar: toolbarOptions }, theme: "snow" })
    : null;

  if (window.Choices && page.querySelector("#toMail")) {
    new Choices("#toMail", { allowHTML: false, removeItemButton: true, placeholder: true, placeholderValue: "Add recipients" });
  }

  page.querySelector("#mail-send-reply").addEventListener("click", () => {
    const feedback = page.querySelector("#mail-feedback");
    if (!replyEditor || replyEditor.getText().trim().length <= 1) {
      feedback.textContent = "Write a reply before sending.";
      return;
    }
    feedback.textContent = "Reply saved in this demo. No email was sent.";
    replyEditor.setText("");
  });

  page.querySelector("#mail-compose-send").addEventListener("click", () => {
    const feedback = page.querySelector("#mail-compose-feedback");
    const subject = page.querySelector("#mail-compose-subject").value.trim();
    if (!subject) {
      feedback.textContent = "Add a subject before sending.";
      page.querySelector("#mail-compose-subject").focus();
      return;
    }
    feedback.textContent = "Message saved in this demo. No email was sent.";
    const modal = bootstrap.Modal.getInstance(page.querySelector("#mail-Compose"));
    modal?.hide();
    page.querySelector("#mail-compose-subject").value = "";
    composeEditor?.setText("");
  });

  const initialMessage = messageItems.find((item) => item.classList.contains("active")) || messageItems[0];
  openMessage(initialMessage, false);
  updateVisibleMessages();

})();
