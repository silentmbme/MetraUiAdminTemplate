(function () {
    "use strict";

    const myElement1 = document.getElementById('chat-msg-scroll');
    if(myElement1 && typeof SimpleBar === "function") {
        new SimpleBar(myElement1, { autoHide: true });
    }

    const responsiveChatClose = document.querySelector(".responsive-chat-close");
    const mainChartWrapper = document.querySelector(".main-chart-wrapper");
    if(responsiveChatClose) {
        responsiveChatClose.addEventListener("click", () => {
            if(mainChartWrapper) {
                mainChartWrapper.classList.remove("responsive-chat-open")
            }
        })
    }

})();

const updateElements = (selector, action) => {
   let eleRef = document.querySelectorAll(selector);
   if (eleRef) eleRef.forEach(action);
};

function changeTheInfo(element, name, img, status) {
    const image = `../assets/images/users/${img}.jpg`;
    const contactProfiles = {
        "Maya Patel": { role: "Product Designer", team: "Product & Customer Success", time: "10:15 AM · GMT-5", files: "12", projects: "4", lastSeen: "Now" },
        "Ethan Brooks": { role: "Project Manager", team: "Product Operations", time: "9:45 AM · GMT-5", files: "8", projects: "6", lastSeen: "Now" },
        "Jordan Lee": { role: "UI Designer", team: "Design Studio", time: "10:30 AM · GMT-5", files: "15", projects: "3", lastSeen: "Now" },
        "Sophia Martin": { role: "QA Engineer", team: "Engineering", time: "7:15 PM · GMT+1", files: "6", projects: "5", lastSeen: "12 min" },
        "Noah Davis": { role: "Account Manager", team: "Customer Success", time: "1:15 PM · GMT-5", files: "9", projects: "7", lastSeen: "Now" },
        "Liam Carter": { role: "Frontend Engineer", team: "Engineering", time: "6:15 PM · GMT+1", files: "11", projects: "4", lastSeen: "1 hr" }
    };
    const profile = contactProfiles[name] || contactProfiles["Maya Patel"];

    const selectedConversation = element.closest("li");
    if (selectedConversation) {
        updateElements(".checkforactive", (el) => el.classList.remove("active"));
        selectedConversation.classList.add("active");
    }

    updateElements(".chatnameperson", (el) => el.innerText = name);
    updateElements(".chatimageperson", (el) => el.src = image);
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    updateElements(".chat-contact-email", (el) => el.innerText = email);
    updateElements(".chat-contact-role", (el) => el.innerText = profile.role);
    updateElements(".chat-contact-team", (el) => el.innerText = profile.team);
    updateElements(".chat-contact-timezone", (el) => el.innerText = profile.time);
    updateElements(".chat-contact-files-count", (el) => el.innerText = profile.files);
    updateElements(".chat-contact-project-count", (el) => el.innerText = profile.projects);
    updateElements(".chat-contact-last-seen", (el) => el.innerText = profile.lastSeen);
    updateElements(".chat-contact-status-icon", (el) => {
        el.classList.toggle("text-success", status === "online");
        el.classList.toggle("text-muted", status !== "online");
    });
    const emailLink = document.querySelector(".chat-contact-mailto");
    if (emailLink) emailLink.href = `mailto:${email}`;
    const conversationPanel = document.querySelector(".app-chat-conversation");
    if (conversationPanel) conversationPanel.setAttribute("aria-label", `Conversation with ${name}`);

    updateElements(".chatstatusperson", (el) => {
        el.classList.remove("online");
        el.classList.remove("offline");
        el.classList.add(status);
    });
    updateElements(".app-chat-presence-dot", (el) => el.classList.toggle("is-away", status !== "online"));

    updateElements(".chatpersonstatus", (el) => el.innerText = status === "online" ? "Online" : "Away");
    document.querySelector(".main-chart-wrapper")?.classList.add("responsive-chat-open");
}
// Keep legacy inline handlers working in generated pages while the source uses event listeners.
window.changeTheInfo = changeTheInfo;
if (typeof FgEmojiPicker === "function" && document.querySelector(".chat-message-space")) {
    new FgEmojiPicker({
        trigger: [".emoji-picker"],
        insertInto: document.querySelector(".chat-message-space"),
        closeButton: true,
        position: ["top", "right"],
        preFetch: true,
        dir: "../assets/libs/fg-emoji-picker/"
    });
}

(() => {
    document.querySelectorAll(".app-chat-person > a").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const contact = link.closest(".app-chat-person");
            if (contact) selectConversation(contact);
        });
    });

    const messageForm = document.getElementById("chat-message-form");
    const messageInput = document.getElementById("chat-message-input");
    const searchInput = document.getElementById("chat-search");
    const conversation = document.getElementById("main-chat-content");
    const composeForm = document.getElementById("compose-chat-form");
    const composeModal = document.getElementById("composeMessageModal");
    const muteButton = document.getElementById("toggle-chat-mute");
    const thread = conversation?.querySelector(".app-chat-thread");
    const actionStatus = document.getElementById("chat-action-status");
    const attachmentInput = document.getElementById("chat-attachment-input");
    let activeName = document.querySelector(".app-chat-person.active")?.dataset.personName || "Maya Patel";
    const threadStorageKey = "nexora-chat-conversations-v1";
    const mutedStorageKey = "nexora-chat-muted-v1";
    const readStorage = (key, fallback) => {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch { return fallback; }
    };
    const conversations = readStorage(threadStorageKey, {});
    const mutedConversations = new Set(readStorage(mutedStorageKey, []));

    function persistConversations() {
        try { localStorage.setItem(threadStorageKey, JSON.stringify(conversations)); }
        catch { /* Keep this chat usable when storage is unavailable. */ }
    }

    function persistMuted() {
        try { localStorage.setItem(mutedStorageKey, JSON.stringify([...mutedConversations])); }
        catch { /* Muting remains available for this session. */ }
    }

    function getContactImageId(name) {
        const contact = [...document.querySelectorAll(".app-chat-person")]
            .find((item) => item.dataset.personName === name);
        const source = contact?.querySelector(".avatar img")?.getAttribute("src") || "";
        return source.match(/users\/(\d+)\.jpg/i)?.[1] || "4";
    }

    function messageMarkup(message) {
        const outgoing = message.author === "you";
        const item = document.createElement("li");
        item.className = outgoing ? "chat-item-end" : "chat-item-start";
        const row = document.createElement("div");
        row.className = "chat-list-inner";
        const wrap = document.createElement("div");
        wrap.className = "app-chat-message-wrap";
        const bubble = document.createElement("div");
        bubble.className = "main-chat-msg";
        const content = document.createElement("div");
        const text = document.createElement("p");
        text.className = "mb-0";
        text.textContent = message.text;
        content.append(text);
        bubble.append(content);
        const time = document.createElement("time");
        time.className = "app-chat-time";
        time.innerHTML = '<i class="ri-time-line me-1" aria-hidden="true"></i>';
        time.append(document.createTextNode(message.time || "Just now"));
        if (outgoing) {
            const meta = document.createElement("div");
            meta.className = "app-chat-message-meta justify-content-end";
            const sender = document.createElement("span");
            sender.textContent = "You";
            meta.append(time, sender);
            wrap.append(meta, bubble);
        } else {
            wrap.append(bubble, time);
        }
        const avatar = document.createElement("span");
        avatar.className = "avatar avatar-sm avatar-rounded";
        const image = document.createElement("img");
        image.src = `../assets/images/users/${outgoing ? "15" : getContactImageId(activeName)}.jpg`;
        image.alt = outgoing ? "You" : activeName;
        avatar.append(image);
        if (outgoing) row.append(wrap, avatar);
        else row.append(avatar, wrap);
        item.append(row);
        return item;
    }

    function scrollThreadToBottom() {
        const scrollArea = conversation?.querySelector(".simplebar-content-wrapper");
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
        else if (conversation) conversation.scrollTop = conversation.scrollHeight;
    }

    function saveInitialThread() {
        if (!thread || conversations[activeName]) return;
        conversations[activeName] = [...thread.querySelectorAll("li.chat-item-start, li.chat-item-end")]
            .map((item) => ({
                author: item.classList.contains("chat-item-end") ? "you" : "contact",
                text: item.querySelector(".main-chat-msg p")?.textContent || "",
                time: item.querySelector(".app-chat-time")?.textContent.trim() || ""
            })).filter((message) => message.text);
    }

    function renderThread(name) {
        if (!thread) return;
        const messages = conversations[name] || [];
        thread.replaceChildren();
        if (!messages.length) {
            const empty = document.createElement("li");
            empty.className = "app-chat-empty-state text-center text-muted fs-13 py-4";
            empty.textContent = `No messages with ${name} yet. Send a message to start the conversation.`;
            thread.append(empty);
        } else {
            messages.forEach((message) => thread.append(messageMarkup(message)));
        }
        scrollThreadToBottom();
    }

    function updateContactPreview(name, text) {
        const contact = [...document.querySelectorAll(".app-chat-person")]
            .find((item) => item.dataset.personName === name);
        if (!contact) return;
        const preview = contact.querySelector(".app-chat-person-preview");
        const time = contact.querySelector(".app-chat-person-name time");
        if (preview) preview.textContent = text.length > 72 ? `${text.slice(0, 69)}…` : text;
        if (time) time.textContent = "Just now";
        contact.dataset.search = `${name} ${text}`.toLowerCase();
    }

    function selectConversation(contact) {
        const name = contact?.dataset.personName;
        if (!name) return;
        saveInitialThread();
        persistConversations();
        activeName = name;
        const imageId = getContactImageId(name);
        const status = contact.querySelector(".avatar")?.classList.contains("offline") ? "offline" : "online";
        changeTheInfo(contact, name, imageId, status);
        contact.querySelector(".badge")?.remove();
        renderThread(name);
        updateMuteState();
    }

    function updateMuteState() {
        if (!muteButton) return;
        const isMuted = mutedConversations.has(activeName);
        muteButton.setAttribute("aria-pressed", String(isMuted));
        const icon = muteButton.querySelector("i");
        if (icon) icon.className = isMuted ? "ri-notification-3-line me-2" : "ri-notification-off-line me-2";
        muteButton.lastChild.textContent = isMuted ? "Unmute conversation" : "Mute conversation";
        document.getElementById("chat-muted-badge")?.classList.toggle("d-none", !isMuted);
    }

    saveInitialThread();
    document.querySelectorAll(".app-chat-person").forEach((contact) => {
        const name = contact.dataset.personName;
        if (name && !Array.isArray(conversations[name])) {
            const preview = contact.querySelector(".app-chat-person-preview")?.textContent.trim();
            conversations[name] = preview ? [{ author: "contact", text: preview, time: "Earlier" }] : [];
        }
    });
    persistConversations();
    renderThread(activeName);
    updateMuteState();

    if (messageForm && messageInput && conversation) {
        messageForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const message = messageInput.value.trim();
            if (!message || !thread) return;
            const sentAt = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            if (!Array.isArray(conversations[activeName])) conversations[activeName] = [];
            conversations[activeName].push({ author: "you", text: message, time: sentAt });
            persistConversations();
            renderThread(activeName);
            updateContactPreview(activeName, message);
            messageInput.value = "";
            messageInput.focus();
        });
    }

    document.getElementById("chat-attachment-button")?.addEventListener("click", () => attachmentInput?.click());
    attachmentInput?.addEventListener("change", () => {
        const files = [...(attachmentInput.files || [])];
        if (!files.length || !messageForm) return;
        const names = files.map((file) => file.name).join(", ");
        messageInput.value = `Attached ${files.length === 1 ? "file" : "files"}: ${names}`;
        messageForm.requestSubmit();
        attachmentInput.value = "";
    });

    searchInput?.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        document.querySelectorAll(".app-chat-person").forEach((person) => {
            const content = `${person.dataset.search || ""} ${person.textContent}`.toLowerCase();
            person.hidden = !content.includes(query);
        });
    });

    composeForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const recipient = document.getElementById("compose-recipient")?.value;
        if (!recipient) return;

        const [name, imageId, status] = recipient.split("|");
        const contact = document.querySelector(`[data-person-name="${name}"]`);
        if (contact) {
            contact.querySelector("a")?.click();
        } else {
            changeTheInfo(composeForm, name, imageId, status);
        }

        const firstMessage = document.getElementById("compose-first-message");
        if (firstMessage?.value.trim()) {
            messageInput.value = firstMessage.value.trim();
            messageForm?.requestSubmit();
        }

        bootstrap.Modal.getOrCreateInstance(composeModal).hide();
        composeForm.reset();
    });

    document.getElementById("contact-message-action")?.addEventListener("click", () => {
        window.setTimeout(() => messageInput?.focus(), 150);
    });

    document.getElementById("copy-contact-email")?.addEventListener("click", async (event) => {
        const email = document.querySelector(".chat-contact-email")?.textContent;
        if (!email || !navigator.clipboard?.writeText) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const temporaryInput = document.createElement("textarea");
                temporaryInput.value = email;
                temporaryInput.style.position = "fixed";
                temporaryInput.style.opacity = "0";
                document.body.append(temporaryInput);
                temporaryInput.select();
                document.execCommand("copy");
                temporaryInput.remove();
            }
        } catch {
            if (actionStatus) {
                actionStatus.textContent = "Could not copy the contact email.";
                actionStatus.classList.remove("d-none");
            }
            return;
        }
        const button = event.currentTarget;
        const icon = button.querySelector("i");
        icon.className = "ri-check-line text-success";
        button.setAttribute("aria-label", "Email copied");
        window.setTimeout(() => {
            icon.className = "ri-file-copy-line";
            button.setAttribute("aria-label", "Copy contact email");
        }, 1400);
    });

    muteButton?.addEventListener("click", () => {
        const isMuted = muteButton.getAttribute("aria-pressed") !== "true";
        muteButton.setAttribute("aria-pressed", String(isMuted));
        if (isMuted) mutedConversations.add(activeName);
        else mutedConversations.delete(activeName);
        persistMuted();
        updateMuteState();
    });

    document.getElementById("clear-chat-confirm")?.addEventListener("click", () => {
        const thread = conversation?.querySelector(".app-chat-thread");
        if (!thread) return;
        conversations[activeName] = [];
        persistConversations();
        renderThread(activeName);
        if (typeof bootstrap !== "undefined") {
            bootstrap.Modal.getOrCreateInstance(document.getElementById("clearConversationModal")).hide();
        }
    });

    [
        ["chat-video-call", "Video"],
        ["chat-phone-call", "Voice"]
    ].forEach(([id, kind]) => {
        document.getElementById(id)?.addEventListener("click", () => {
            if (actionStatus) {
                actionStatus.textContent = `${kind} calls are not connected in this demo.`;
                actionStatus.classList.remove("d-none");
            }
        });
    });
})();

