(() => {
  const app = document.querySelector("#ai-chat-app");
  const history = document.querySelector("#ai-chat-history");
  const historyPanel = document.querySelector("#ai-chat-history-panel");
  const searchInput = document.querySelector("#ai-chat-search");
  const homeForm = document.querySelector("#ai-chat-form");
  const homeInput = document.querySelector("#ai-chat-input");
  const followupForm = document.querySelector("#ai-chat-followup-form");
  const followupInput = document.querySelector("#ai-chat-followup-input");
  const thread = document.querySelector("#ai-chat-thread");
  const followupPanel = document.querySelector("#ai-chat-followup");
  const feedback = document.querySelector("#ai-chat-feedback");
  const followupFeedback = document.querySelector("#ai-chat-feedback-followup");
  const attachmentInput = document.querySelector("#ai-chat-attachment");
  const attachButton = document.querySelector("#ai-attach-button");
  const searchToggle = document.querySelector("#ai-search-toggle");
  const reasonToggle = document.querySelector("#ai-reason-toggle");

  if (!app || !history || !homeForm || !homeInput || !followupForm || !followupInput || !thread || !followupPanel) {
    return;
  }

  const setFeedback = (message) => {
    if (feedback) feedback.textContent = message;
    if (followupFeedback) followupFeedback.textContent = message;
  };

  const hideHistoryOffcanvas = () => {
    if (window.innerWidth < 992 && window.bootstrap?.Offcanvas && historyPanel) {
      window.bootstrap.Offcanvas.getOrCreateInstance(historyPanel).hide();
    }
  };

  const sampleConversations = {
    campaign: {
      title: "Q4 campaign brief",
      prompt: "Turn these launch notes into a Q4 campaign brief with audience, channels, milestones, and success measures.",
      reply: "A clear campaign brief should define the target segment, the value proposition, and one primary conversion goal. Coordinate the launch email, product page, and sales enablement materials, then review qualified leads and conversion rate each week.",
    },
    sales: {
      title: "Sales call summary",
      prompt: "Summarize a sales discovery call into customer needs, objections, and the next three actions.",
      reply: "Capture the customer's main goal, the workflow they want to improve, and any timing or budget constraints. Record unresolved objections, assign an owner to each follow-up, and confirm the next meeting date before updating the opportunity.",
    },
    inventory: {
      title: "Inventory anomaly",
      prompt: "Help investigate an unexpected stock movement and list the checks an operations team should run.",
      reply: "Compare the inventory ledger with recent receipts, fulfilled orders, returns, and warehouse transfers. Check timestamps and SKU variants first, then flag any unexplained adjustment for a cycle count before changing the available quantity.",
    },
    support: {
      title: "Support response draft",
      prompt: "Draft an empathetic response to a customer whose order is delayed, and ask for the order number.",
      reply: "Thanks for letting us know your order has not arrived yet. I'm sorry for the delay. Please share your order number and I can help check the latest shipment status and available next steps.",
    },
    sql: {
      title: "SQL query optimization",
      prompt: "Review a slow customer report query and suggest performance checks before changing production data.",
      reply: "Start with the query plan and confirm which joins and filters scan the largest tables. Check whether the filter columns are indexed, avoid selecting unused fields, and compare row counts before and after any query change in a staging environment.",
    },
    product: {
      title: "Product launch plan",
      prompt: "Map owners and milestones for a product release across engineering, marketing, support, and sales.",
      reply: "Set a release readiness review as the shared milestone. Engineering owns QA and deployment, marketing owns launch messaging, support owns help content, and sales owns enablement. Track dependencies and blockers in one launch checklist.",
    },
    kpis: {
      title: "Weekly KPI insights",
      prompt: "Review a weekly KPI report and explain the largest changes, likely drivers, and follow-up questions.",
      reply: "Compare each metric with its recent baseline, then separate volume changes from conversion or retention changes. Check whether the largest movement is concentrated in one channel or segment before attributing a cause.",
    },
    sentiment: {
      title: "Customer sentiment analysis",
      prompt: "Group customer feedback by theme, urgency, and product area, then suggest what to investigate first.",
      reply: "Group repeated comments into themes such as onboarding, reporting, reliability, and billing. Prioritize issues by frequency and customer impact, and verify the sample against support tickets before treating it as representative.",
    },
  };

  const addMessage = (text, isAssistant) => {
    const messageRow = document.createElement("article");
    messageRow.className = isAssistant ? "chatgpt-assistant-message" : "chatgpt-user-message";

    if (isAssistant) {
      const icon = document.createElement("span");
      icon.className = "chatgpt-assistant-icon";
      icon.innerHTML = '<i class="ri-sparkling-2-line" aria-hidden="true"></i>';

      const content = document.createElement("div");
      content.className = "flex-fill";

      const heading = document.createElement("div");
      heading.className = "d-flex align-items-center gap-2 mb-2 text-default";
      const assistantName = document.createElement("strong");
      assistantName.className = "fs-13";
      assistantName.textContent = "MetraUI AI";
      const sampleBadge = document.createElement("span");
      sampleBadge.className = "badge bg-light text-muted";
      sampleBadge.textContent = "Sample response";
      heading.append(assistantName, sampleBadge);

      const response = document.createElement("div");
      response.className = "chatgpt-assistant-copy";
      const responseText = document.createElement("p");
      responseText.className = "mb-2";
      responseText.textContent = text;
      response.append(responseText);

      const actions = document.createElement("div");
      actions.className = "d-flex gap-1 mt-2";
      actions.innerHTML = '<button type="button" class="btn btn-sm btn-light" data-chat-action="copy" aria-label="Copy sample response"><i class="ri-file-copy-line" aria-hidden="true"></i></button><button type="button" class="btn btn-sm btn-light" data-chat-action="helpful" aria-label="Mark sample as helpful"><i class="ri-thumb-up-line" aria-hidden="true"></i></button><button type="button" class="btn btn-sm btn-light" data-chat-action="unhelpful" aria-label="Mark sample as not helpful"><i class="ri-thumb-down-line" aria-hidden="true"></i></button>';
      content.append(heading, response, actions);
      messageRow.append(icon, content);
    } else {
      messageRow.textContent = text;
    }

    thread.append(messageRow);
    thread.scrollTop = thread.scrollHeight;
  };

  const startConversation = (prompt, sampleReply) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    app.classList.add("is-chatting");
    followupPanel.classList.remove("d-none");
    thread.replaceChildren();
    addMessage(cleanPrompt, false);

    const reply = sampleReply || `Sample response for your prompt:\n\n${cleanPrompt}\n\nThis preview is not generated by a live model. Connect an AI service to receive an original response.`;
    addMessage(reply, true);
    followupInput.value = "";
    setFeedback("Sample mode - no live model connection");

    const title = cleanPrompt.length > 38 ? `${cleanPrompt.slice(0, 35)}...` : cleanPrompt;
    addHistoryItem(title, cleanPrompt, reply);
  };

  const addHistoryItem = (title, prompt, reply) => {
    const existing = Array.from(history.querySelectorAll("button")).find((button) => button.dataset.prompt === prompt);
    if (existing) {
      history.querySelector(".active")?.classList.remove("active");
      existing.classList.add("active");
      return;
    }

    history.querySelector(".active")?.classList.remove("active");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "active";
    button.dataset.prompt = prompt;
    button.dataset.response = reply;
    const icon = document.createElement("i");
    icon.className = "ri-message-3-line";
    icon.setAttribute("aria-hidden", "true");
    const copy = document.createElement("span");
    copy.className = "chatgpt-history-copy";
    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    const preview = document.createElement("span");
    preview.textContent = prompt;
    copy.append(titleNode, preview);
    button.append(icon, copy);
    history.prepend(button);
  };

  const submitFollowup = () => {
    const prompt = followupInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, false);
    addMessage("This sample workspace received your follow-up. It is not connected to a live AI service, so no model response was generated.", true);
    followupInput.value = "";
    setFeedback("Sample conversation updated.");
  };

  homeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = homeInput.value.trim();
    if (!prompt) {
      homeInput.focus();
      return;
    }
    startConversation(prompt);
    homeInput.value = "";
  });

  followupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitFollowup();
  });

  [homeInput, followupInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      if (input === homeInput) homeForm.requestSubmit();
      else followupForm.requestSubmit();
    });
  });

  document.querySelectorAll(".ai-prompt-suggestion").forEach((button) => {
    button.addEventListener("click", () => {
      homeInput.value = button.dataset.prompt || button.querySelector("strong")?.textContent || button.textContent.trim();
      homeInput.focus();
    });
  });

  history.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-chat-example], button[data-prompt]");
    if (!button) return;

    history.querySelector(".active")?.classList.remove("active");
    button.classList.add("active");
    const example = sampleConversations[button.dataset.chatExample];
    const prompt = example?.prompt || button.dataset.prompt;
    const reply = example?.reply || button.dataset.response;
    if (prompt) {
      button.dataset.prompt = prompt;
      button.dataset.response = reply || "";
      startConversation(prompt, reply);
      hideHistoryOffcanvas();
    }
  });

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    history.querySelectorAll("button").forEach((button) => {
      button.hidden = !button.textContent.toLowerCase().includes(query);
    });
  });

  document.querySelectorAll("#ai-new-chat, #ai-new-chat-mobile").forEach((button) => {
    button.addEventListener("click", () => {
      app.classList.remove("is-chatting");
      followupPanel.classList.add("d-none");
      thread.replaceChildren();
      history.querySelector(".active")?.classList.remove("active");
      homeInput.value = "";
      setFeedback("Sample mode");
      homeInput.focus();
      if (button.id === "ai-new-chat") hideHistoryOffcanvas();
    });
  });

  thread.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-chat-action]");
    if (!button) return;

    if (button.dataset.chatAction === "copy") {
      const response = button.closest(".chatgpt-assistant-message")?.querySelector(".chatgpt-assistant-copy p")?.textContent;
      if (!response) return;
      try {
        await navigator.clipboard.writeText(response);
        setFeedback("Sample response copied.");
      } catch {
        setFeedback("Clipboard access is unavailable in this browser.");
      }
      return;
    }

    button.classList.toggle("btn-primary");
    setFeedback(button.dataset.chatAction === "helpful"
      ? "Thanks for rating this sample response."
      : "Feedback saved for this sample response.");
  });

  attachButton?.addEventListener("click", () => attachmentInput?.click());
  attachmentInput?.addEventListener("change", () => {
    const file = attachmentInput.files?.[0];
    if (file) setFeedback(`Attached ${file.name} for this sample session.`);
  });

  [searchToggle, reasonToggle].forEach((button) => {
    button?.addEventListener("click", () => {
      const active = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", String(active));
      const mode = button.id === "ai-search-toggle" ? "Search" : "Reason";
      setFeedback(`${mode} ${active ? "enabled" : "disabled"} for this sample session.`);
    });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (window.innerWidth < 992 && window.bootstrap?.Offcanvas && historyPanel) {
        historyPanel.addEventListener("shown.bs.offcanvas", () => searchInput?.focus(), { once: true });
        window.bootstrap.Offcanvas.getOrCreateInstance(historyPanel).show();
      } else {
        searchInput?.focus();
      }
    }
  });
})();
