(() => {
  const header = document.querySelector(".topbar");
  if (!header || header.dataset.dropdownsReady) return;
  header.dataset.dropdownsReady = "true";
  const countryToggle = header.querySelector("#countryDropdown");
  const options = [...header.querySelectorAll("[data-country]")];
  const countrySearch = header.querySelector("#country-search");
  const selectCountry = (option, persist = false) => {
    if (!option) return;
    const name = option.querySelector("span").textContent;
    const flag = header.querySelector("#selected-country-flag");
    flag.src = `../assets/images/countries/${option.dataset.flag}_flag.jpg`;
    flag.alt = name;
    countryToggle.setAttribute("aria-label", `Choose country: ${name}`);
    options.forEach((item) => {
      item.classList.toggle("active", item === option);
      item.setAttribute("aria-pressed", String(item === option));
    });
    header.querySelector("#country-status").textContent = `Selected: ${name}`;
    if (persist) {
      try {
        localStorage.setItem("nexoraui.country", option.dataset.country);
      } catch {
        /* Optional preference. */
      }
    }
  };
  let savedCountry = "us";
  try {
    savedCountry = localStorage.getItem("nexoraui.country") || "us";
  } catch {
    /* Use default. */
  }
  selectCountry(options.find((option) => option.dataset.country === savedCountry) || options[0]);
  options.forEach((option) =>
    option.addEventListener("click", () => {
      selectCountry(option, true);
      window.bootstrap?.Dropdown.getOrCreateInstance(countryToggle).hide();
      countryToggle.focus();
    })
  );
  countrySearch?.addEventListener("input", () => {
    const query = countrySearch.value.trim().toLowerCase();
    options.forEach((option) => {
      option.hidden = !option.textContent.toLowerCase().includes(query);
    });
    header.querySelector("#country-empty").hidden = options.some((option) => !option.hidden);
  });
  countryToggle?.addEventListener("shown.bs.dropdown", () => {
    countrySearch.value = "";
    countrySearch.dispatchEvent(new Event("input"));
    countrySearch.focus();
  });

  const cart = header.querySelector(".topbar-cart");
  if (cart) {
    const list = cart.querySelector("#header-cart-items-scroll");
    let removedItem;
    cart.querySelector("#header-cart-undo").addEventListener("click", () => {
      if (!removedItem) return;
      const { row, parent, next } = removedItem;
      parent.insertBefore(row, next?.parentNode === parent ? next : null);
      removedItem = null;
      cart.querySelector(".topbar-cart-undo").hidden = true;
      updateCart();
      row.querySelector(".topbar-remove-item").focus();
    });
    const updateCart = () => {
      const rows = [...list.querySelectorAll(".topbar-cart-item")];
      let subtotal = 0;
      let quantity = 0;
      rows.forEach((row) => {
        const input = row.querySelector("input");
        const value = Math.min(30, Math.max(1, Math.floor(Number(input.value) || 1)));
        input.value = value;
        const price = Number(row.querySelector("h6").textContent.replace(/[^\d.]/g, ""));
        subtotal += price * value;
        quantity += value;
        row.querySelector(".topbar-quantity-minus").disabled = value === 1;
        row.querySelector(".topbar-quantity-plus").disabled = value === 30;
      });
      cart.querySelector("#cart-data").textContent = `${rows.length} products`;
      cart.querySelector("#cart-icon-badge").textContent = rows.length;
      cart.querySelector("#cart-icon-badge").hidden = !quantity;
      cart.querySelector("#header-cart-subtotal").textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(subtotal);
      cart.querySelector(".topbar-cart-empty").hidden = !rows.length;
      cart.querySelector(".topbar-empty").classList.toggle("d-none", !!rows.length);
    };
    cart.addEventListener("click", (event) => {
      const button = event.target.closest(
        ".topbar-remove-item, .topbar-quantity-minus, .topbar-quantity-plus"
      );
      if (!button) return;
      event.preventDefault();
      const row = button.closest("li");
      if (button.matches(".topbar-remove-item")) {
        const next =
          row.nextElementSibling?.querySelector(".topbar-remove-item") ||
          row.previousElementSibling?.querySelector(".topbar-remove-item");
        removedItem = { row, parent: row.parentNode, next: row.nextSibling };
        row.remove();
        cart.querySelector(".topbar-cart-undo").hidden = false;
        (next || cart.querySelector('[data-bs-toggle="dropdown"]')).focus();
      } else {
        const input = row.querySelector("input");
        input.value = Number(input.value) + (button.matches(".topbar-quantity-plus") ? 1 : -1);
      }
      updateCart();
    });
    cart.addEventListener("change", (event) => {
      if (event.target.matches(".topbar-cart-input")) updateCart();
    });
    updateCart();
  }

  const notifications = header.querySelector(".topbar-notifications");
  if (notifications) {
    const rows = [
      ...notifications.querySelectorAll("#header-notification-scroll li.dropdown-item"),
    ];
    rows.forEach((row) => {
      row.dataset.unread = String(
        !!row.querySelector(".text-primary:not(.d-none) .ri-circle-fill")
      );
      const link = row.querySelector(".stretched-link");
      link.setAttribute("aria-label", row.querySelector(".fw-semibold").textContent);
    });
    const destinations = [
      "chat.html",
      "task-list-view.html",
      "profile.html",
      "full-calendar.html",
      "file-manager.html",
    ];
    rows.forEach((row, index) => {
      row.querySelector("a").href = destinations[index];
    });
    let filter = "all";
    notifications.querySelector("#notification-search").addEventListener("input", () => update());
    rows.forEach((row) =>
      row.querySelector(".topbar-notification-read-toggle").addEventListener("click", () => {
        row.dataset.unread = String(row.dataset.unread !== "true");
        update();
        if (row.hidden) notifications.querySelector('[data-notification-filter="unread"]').focus();
      })
    );
    const update = () => {
      const count = rows.filter((row) => row.dataset.unread === "true").length;
      rows.forEach((row) => {
        const unread = row.dataset.unread === "true";
        const query = notifications
          .querySelector("#notification-search")
          .value.trim()
          .toLowerCase();
        row.hidden =
          (filter === "unread" && !unread) || !row.textContent.toLowerCase().includes(query);
        const toggle = row.querySelector(".topbar-notification-read-toggle");
        toggle.setAttribute("aria-label", unread ? "Mark as read" : "Mark as unread");
        toggle.setAttribute("aria-pressed", String(!unread));
        row.classList.toggle("notification-unread", unread);
        row.querySelector(".ri-circle-fill")?.parentElement.classList.toggle("d-none", !unread);
      });
      notifications.querySelector("#notification-unread-count").textContent = count;
      notifications.querySelector(
        "#notification-status"
      ).textContent = `${count} unread notifications`;
      notifications.querySelector(".topbar-icon-pulse").hidden = !count;
      notifications.querySelector("#notifications-read-all").disabled = !count;
      notifications.querySelector(".topbar-notification-empty").classList.toggle(
        "d-none",
        rows.some((row) => !row.hidden)
      );
    };
    notifications.querySelectorAll("[data-notification-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        filter = button.dataset.notificationFilter;
        notifications.querySelectorAll("[data-notification-filter]").forEach((item) => {
          item.classList.toggle("btn-primary", item === button);
          item.classList.toggle("btn-light", item !== button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        update();
      })
    );
    notifications.querySelector("#notifications-read-all").addEventListener("click", () => {
      rows.forEach((row) => {
        row.dataset.unread = "false";
      });
      update();
    });
    rows.forEach((row) =>
      row.querySelector("a").addEventListener("click", () => {
        row.dataset.unread = "false";
        update();
      })
    );
    update();
  }
})();

(() => {
  const toggle = document.querySelector("[data-header-fullscreen]");
  if (!toggle || toggle.dataset.fullscreenReady) return;
  toggle.dataset.fullscreenReady = "true";

  const root = document.documentElement;
  const fallbackClass = "header-fullscreen-fallback";
  const isFullscreen = () =>
    Boolean(document.fullscreenElement || document.webkitFullscreenElement || root.classList.contains(fallbackClass));

  const updateLabel = () => {
    const active = isFullscreen();
    toggle.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
    toggle.setAttribute("title", active ? "Exit fullscreen" : "Enter fullscreen");
    toggle.innerHTML = `<i class="ri-${active ? "fullscreen-exit" : "fullscreen"}-line topbar-icon" aria-hidden="true"></i>`;
  };

  const enterFullscreen = async () => {
    const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
    if (!request) {
      root.classList.add(fallbackClass);
      updateLabel();
      return;
    }
    try {
      await request.call(root);
    } catch {
      root.classList.add(fallbackClass);
    }
    updateLabel();
  };

  const exitFullscreen = async () => {
    const wasFullscreen = isFullscreen();
    root.classList.remove(fallbackClass);
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exit && wasFullscreen) {
      try {
        await exit.call(document);
      } catch {
        // Keep the page state in sync even if the browser denies exiting fullscreen.
      }
    }
    updateLabel();
  };

  toggle.addEventListener("click", () => {
    if (isFullscreen()) exitFullscreen();
    else enterFullscreen();
  });
  document.addEventListener("fullscreenchange", updateLabel);
  document.addEventListener("webkitfullscreenchange", updateLabel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains(fallbackClass)) {
      root.classList.remove(fallbackClass);
      updateLabel();
    }
  });
  updateLabel();
})();
