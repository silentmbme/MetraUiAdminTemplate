(() => {
  "use strict";

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-lockscreen-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.closest(".password-input-wrap")?.querySelector("input");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-label", `${show ? "Hide" : "Show"} password`);
      button.innerHTML = `<i class="ri-eye-${show ? "line" : "off-line"}" aria-hidden="true"></i>`;
      input.focus();
    });
  });

  document.querySelectorAll("[data-lockscreen-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="password"], input[type="text"]');
      if (!input?.value.trim()) {
        input?.setCustomValidity("Enter your password to unlock your workspace.");
        input?.reportValidity();
        input?.addEventListener("input", () => input.setCustomValidity(""), { once: true });
        return;
      }

      // Static demo behavior: the original lock screen returns to the dashboard.
      window.location.href = "index.html";
    });
  });
})();
