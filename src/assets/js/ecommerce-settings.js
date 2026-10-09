(() => {
  "use strict";

  const form = document.getElementById("ecommerce-settings-form");
  if (!form) return;

  const storageKey = "metraui.ecommerceSettings";
  const fields = [...form.elements].filter((element) => element.name);
  const saveButton = document.getElementById("settings-save");
  const saveState = document.getElementById("settings-save-state");
  const feedback = document.getElementById("settings-feedback");

  function readForm() {
    return Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === "checkbox" ? field.checked : field.value,
      ])
    );
  }

  function applyValues(values) {
    fields.forEach((field) => {
      if (!(field.name in values)) return;
      if (field.type === "checkbox")
        field.checked = Boolean(values[field.name]);
      else field.value = String(values[field.name]);
    });
  }

  const defaults = readForm();
  let savedValues = { ...defaults };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (stored && typeof stored === "object") {
      applyValues(stored);
      savedValues = readForm();
    }
  } catch {
    feedback.textContent =
      "Browser storage is unavailable. You can still edit settings for this visit.";
  }

  function updateSaveState() {
    const isDirty = JSON.stringify(readForm()) !== JSON.stringify(savedValues);
    if (saveButton) saveButton.disabled = !isDirty;
    if (saveState) {
      saveState.innerHTML = isDirty
        ? '<i class="ri-edit-line me-1" aria-hidden="true"></i>Unsaved changes'
        : '<i class="ri-checkbox-circle-line me-1" aria-hidden="true"></i>All changes saved';
      saveState.classList.toggle("is-dirty", isDirty);
    }
  }

  form.addEventListener("input", updateSaveState);
  form.addEventListener("change", updateSaveState);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    savedValues = readForm();
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedValues));
      feedback.textContent =
        "Your store settings have been saved in this browser.";
    } catch {
      feedback.textContent =
        "Browser storage is unavailable. The settings are active for this visit only.";
    }
    updateSaveState();
  });

  document.getElementById("settings-reset")?.addEventListener("click", () => {
    applyValues(savedValues);
    feedback.textContent = "Unsaved changes have been reset.";
    updateSaveState();
  });

  document.querySelectorAll(".settings-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".settings-nav-link")
        .forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  updateSaveState();
})();
