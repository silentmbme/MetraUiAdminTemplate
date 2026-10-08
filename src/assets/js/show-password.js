"use strict";

// Toggle a password field and its visibility icon.
const createpassword = (inputId, toggleButton) => {
  const input = document.getElementById(inputId);
  const icon = toggleButton?.querySelector("i");

  if (!input) return;

  const isVisible = input.type === "password";
  input.type = isVisible ? "text" : "password";

  if (icon) {
    icon.classList.toggle("ri-eye-line", isVisible);
    icon.classList.toggle("ri-eye-off-line", !isVisible);
  }

  if (toggleButton?.hasAttribute("aria-label")) {
    const passwordName = toggleButton
      .getAttribute("aria-label")
      .replace(/^Show /, "")
      .replace(/^Hide /, "");
    toggleButton.setAttribute(
      "aria-label",
      `${isVisible ? "Hide" : "Show"} ${passwordName}`
    );
  }
};
