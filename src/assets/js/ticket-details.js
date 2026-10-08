(() => {
  const replyForm = document.querySelector("#ticket-reply-form");
  const replyInput = document.querySelector("#ticket-reply");
  const replyFeedback = document.querySelector("#reply-feedback");
  const noteToggle = document.querySelector("#internal-note-toggle");
  const resolveButton = document.querySelector("#resolve-ticket");
  const statusBadge = document.querySelector("#ticket-status-badge");

  if (!replyForm || !replyInput || !replyFeedback || !noteToggle) return;

  let isInternalNote = false;

  noteToggle.addEventListener("click", () => {
    isInternalNote = !isInternalNote;
    noteToggle.classList.toggle("btn-warning-light", isInternalNote);
    noteToggle.setAttribute("aria-pressed", String(isInternalNote));
    replyInput.placeholder = isInternalNote
      ? "Add a private note for your support team..."
      : "Reply to Ava Thompson...";
    replyFeedback.textContent = isInternalNote
      ? "Internal notes are visible to your team only."
      : "";
  });

  replyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = replyInput.value.trim();

    if (!message) {
      replyFeedback.textContent = "Write a message before sending.";
      replyInput.focus();
      return;
    }

    const card = replyForm.closest(".card");
    const composer = replyForm.closest(".card-body");
    const messageRow = document.createElement("div");
    messageRow.className = "d-flex gap-3 mb-4 px-4";

    const avatar = document.createElement("span");
    avatar.className = `avatar avatar-md rounded-circle flex-shrink-0 ${isInternalNote ? "bg-warning-transparent text-warning" : "bg-secondary-transparent text-secondary"}`;
    avatar.textContent = "PN";

    const messageContent = document.createElement("div");
    messageContent.className = "flex-fill";

    const messageHeader = document.createElement("div");
    messageHeader.className = "d-flex justify-content-between flex-wrap gap-2 mb-2";
    const sender = document.createElement("strong");
    sender.className = "fs-13";
    sender.textContent = "Priya Nair";
    const messageType = document.createElement("span");
    messageType.className = "text-muted fs-12 ms-2";
    messageType.textContent = isInternalNote ? "Internal note" : "Support agent";
    const senderGroup = document.createElement("div");
    senderGroup.append(sender, messageType);
    const time = document.createElement("time");
    time.className = "text-muted fs-12";
    time.textContent = "Just now";
    messageHeader.append(senderGroup, time);

    const messageBubble = document.createElement("div");
    messageBubble.className = `rounded p-3 ${isInternalNote ? "bg-warning-transparent" : "border"}`;
    const messageText = document.createElement("p");
    messageText.className = "fs-13 mb-0";
    messageText.textContent = message;
    messageBubble.append(messageText);

    messageContent.append(messageHeader, messageBubble);
    messageRow.append(avatar, messageContent);
    card.insertBefore(messageRow, composer);

    replyInput.value = "";
    replyFeedback.textContent = isInternalNote
      ? "Internal note added to the ticket."
      : "Reply added to the conversation.";
  });

  resolveButton?.addEventListener("click", () => {
    if (!statusBadge) return;
    statusBadge.className = "badge bg-success-transparent text-success";
    statusBadge.textContent = "Resolved";
    resolveButton.className = "btn btn-success";
    resolveButton.innerHTML = '<i class="ri-check-double-line me-1" aria-hidden="true"></i>Ticket resolved';
    resolveButton.disabled = true;
  });
})();
