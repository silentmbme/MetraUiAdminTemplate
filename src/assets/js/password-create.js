(() => {
  "use strict";

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} password`);
      button.innerHTML = `<i class="ri-eye-${showPassword ? "line" : "off-line"}" aria-hidden="true"></i>`;
      input.focus();
    });
  });

  document.querySelectorAll("[data-password-form]").forEach((form) => {
    const password = form.querySelector('[name="password"]');
    const confirmation = form.querySelector('[name="confirmPassword"]');
    const strengthLabel = form.querySelector(".password-strength-label");
    const strengthTrack = form.querySelector(".password-strength-track");
    const matchMessage = form.querySelector(".password-match-message");
    let status = form.querySelector("[data-password-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "password-form-status";
      status.dataset.passwordStatus = "";
      status.setAttribute("aria-live", "polite");
      form.append(status);
    }
    const rules = [...form.querySelectorAll("[data-rule]")];

    const getRuleResults = (value) => ({
      length: value.length >= 8,
      letter: /[a-z]/.test(value) && /[A-Z]/.test(value),
      number: /\d/.test(value),
    });

    const updateForm = () => {
      status.classList.remove("is-invalid");
      status.textContent = "";
      const results = getRuleResults(password.value);
      const score = Object.values(results).filter(Boolean).length;
      const labels = ["Enter a password", "Weak", "Fair", "Strong"];
      if (strengthLabel) {
        strengthLabel.textContent = labels[score];
        strengthLabel.dataset.level = String(score);
      }
      strengthTrack.dataset.level = String(score);
      strengthTrack.setAttribute("aria-valuenow", String(score));
      strengthTrack.setAttribute("aria-valuetext", labels[score]);
      [...strengthTrack.querySelectorAll("span")].forEach((segment, index) => {
        segment.classList.toggle("is-filled", index < score);
      });
      rules.forEach((rule) => {
        const passed = results[rule.dataset.rule];
        rule.classList.toggle("is-valid", passed);
        const icon = rule.querySelector("i");
        if (icon) icon.className = passed ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line";
      });

      if (matchMessage) {
        if (!confirmation.value) {
          matchMessage.textContent = "";
          matchMessage.className = "password-match-message";
        } else if (password.value === confirmation.value) {
          matchMessage.textContent = "Passwords match";
          matchMessage.className = "password-match-message is-valid";
        } else {
          matchMessage.textContent = "Passwords do not match";
          matchMessage.className = "password-match-message is-invalid";
        }
      }
    };

    password.addEventListener("input", updateForm);
    confirmation.addEventListener("input", updateForm);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = "";
        status.className = "password-form-status";
      }

      const showFormMessage = (message, className = "is-invalid") => {
        if (status) {
          status.textContent = message;
          status.classList.add(className);
        }
      };

      const terms = form.querySelector("#password-terms");
      if (terms && !terms.checked) {
        showFormMessage("Please agree to the Terms of Service to continue.");
        terms.focus();
        return;
      }

      if (Object.values(getRuleResults(password.value)).some((passed) => !passed)) {
        showFormMessage("Meet each password requirement before continuing.");
        password.focus();
        return;
      }

      if (password.value !== confirmation.value) {
        showFormMessage("The passwords do not match yet.");
        confirmation.focus();
        return;
      }

      showFormMessage("Your password meets the requirements. Connect this form to your account service to save it.", "is-valid");
    });
  });
})();
