(() => {
  const page = document.querySelector(".mail-control-center");
  if (!page) return;

  const storageKey = "nexora-mail-control-preferences";
  const controls = [...page.querySelectorAll("input:not([type='radio']), input[type='radio'], select, textarea")];
  const feedback = page.querySelector("#mail-settings-feedback");
  const getValues = () => {
    const values = {};
    controls.forEach((control) => {
      if (control.type === "radio") {
        if (control.checked) values[control.name] = control.value;
      } else if (control.id) {
        values[control.id] = control.type === "checkbox" ? control.checked : control.value;
      }
    });
    return values;
  };
  const defaults = getValues();

  const applyValues = (values) => {
    controls.forEach((control) => {
      const valueKey = control.type === "radio" ? control.name : control.id;
      if (!valueKey || !(valueKey in values)) return;
      if (control.type === "checkbox" || control.type === "radio") {
        control.checked = control.type === "radio"
          ? values[control.name] === control.value
          : values[control.id];
      } else {
        control.value = values[control.id];
      }
    });
    page.querySelectorAll(".mail-control-notification-choice").forEach((choice) => {
      choice.classList.toggle("selected", Boolean(choice.querySelector("input:checked")));
    });
  };

  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {
    feedback.textContent = "Browser storage is unavailable. Preferences cannot be saved.";
  }
  if (saved) {
    try {
      applyValues(JSON.parse(saved));
      feedback.textContent = "Your saved mailbox preferences are loaded.";
    } catch {
      feedback.textContent = "Saved preferences could not be loaded. Default settings are shown.";
    }
  }

  page.querySelector("#mail-settings-save").addEventListener("click", () => {
    const invalidControl = controls.find((control) => !control.checkValidity());
    if (invalidControl) {
      invalidControl.reportValidity();
      invalidControl.focus();
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(getValues()));
      feedback.textContent = "Mailbox preferences saved in this browser.";
    } catch {
      feedback.textContent = "Preferences could not be saved. Browser storage is unavailable.";
    }
  });

  page.querySelector("#mail-settings-reset").addEventListener("click", () => {
    applyValues(defaults);
    feedback.textContent = "Defaults restored. Select Save changes to keep them.";
  });

  controls.forEach((control) => control.addEventListener("input", () => {
    feedback.textContent = "You have unsaved changes.";
  }));

  page.querySelectorAll(".mail-control-notification-choice input").forEach((input) => {
    input.addEventListener("change", () => {
      page.querySelectorAll(".mail-control-notification-choice").forEach((choice) => {
        choice.classList.toggle("selected", Boolean(choice.querySelector("input:checked")));
      });
    });
  });
})();
